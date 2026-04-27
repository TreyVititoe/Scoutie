"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import dynamic from "next/dynamic";
import {
  useTripCartStore,
  selectTotalPrice,
  getItemsByType,
  type CartItem,
  type CartItemType,
} from "@/lib/stores/tripCartStore";
import { trackAndOpen } from "@/lib/affiliate";
import { useSavedTripsStore } from "@/lib/stores/savedTripsStore";
import PackingList from "@/components/trip/PackingList";
import type { MapItem } from "@/components/trip/TripMap";

const TripMap = dynamic(() => import("@/components/trip/TripMap"), {
  ssr: false,
  loading: () => (
    <div className="rounded-[14px] bg-page-bg flex items-center justify-center h-80 lg:min-h-[400px] text-on-light-tertiary text-sm">
      Loading map...
    </div>
  ),
});

/* ── Section config ── */
const sectionConfig: Record<
  string,
  { label: string; icon: string; ctaLabel: string }
> = {
  flight: { label: "Flights", icon: "flight", ctaLabel: "Book Now" },
  hotel: { label: "Stays", icon: "hotel", ctaLabel: "Book Now" },
  event: { label: "Events", icon: "confirmation_number", ctaLabel: "Get Tickets" },
  activity: { label: "Activities & Sites", icon: "hiking", ctaLabel: "Book Now" },
  site: { label: "Activities & Sites", icon: "hiking", ctaLabel: "Book Now" },
  restaurant: { label: "Restaurants", icon: "restaurant", ctaLabel: "Reserve" },
};

/* ── Wrapper with Suspense ── */
export default function TripPageWrapper() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-page-bg flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-accent border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <TripPage />
    </Suspense>
  );
}

/* ── Main trip page ── */
function TripPage() {
  const items = useTripCartStore((s) => s.items);
  const removeItem = useTripCartStore((s) => s.removeItem);
  const totalPrice = useTripCartStore(selectTotalPrice);

  const [prefs, setPrefs] = useState<Record<string, unknown>>({});
  const [shareLink, setShareLink] = useState<string | null>(null);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [saveName, setSaveName] = useState("");
  const [savePublic, setSavePublic] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("walter_prefs");
    if (stored) {
      try {
        setPrefs(JSON.parse(stored));
      } catch {
        /* ignore */
      }
    }
  }, []);

  const destination =
    (prefs.destinations as string[])?.[0] ||
    (prefs.destination as string) ||
    "";
  const startDate = (prefs.startDate as string) || "";
  const endDate = (prefs.endDate as string) || "";
  const travelers =
    (prefs.travelersCount as number) || (prefs.travelers as number) || 1;
  const activities =
    (prefs.activityInterests as string[]) || (prefs.vibes as string[]) || [];
  const pace = (prefs.pace as string) || "moderate";

  /* Group items by type, merging activity + site */
  const grouped = useMemo(() => getItemsByType(items), [items]);

  /* Merge activity and site into one section */
  const sectionOrder: Array<{ key: string; types: CartItemType[] }> = [
    { key: "flight", types: ["flight"] },
    { key: "hotel", types: ["hotel"] },
    { key: "event", types: ["event"] },
    { key: "activity", types: ["activity", "site"] },
    { key: "restaurant", types: ["restaurant"] },
  ];

  const sections = useMemo(() => {
    return sectionOrder
      .map((sec) => {
        const sectionItems = sec.types.flatMap((t) => grouped[t] || []);
        if (sectionItems.length === 0) return null;
        const cfg = sectionConfig[sec.key];
        return { ...cfg, key: sec.key, items: sectionItems };
      })
      .filter(Boolean) as Array<{
      key: string;
      label: string;
      icon: string;
      ctaLabel: string;
      items: CartItem[];
    }>;
  }, [grouped]);

  /* Map items from cart — skip flights, they aren't map-pinnable destinations */
  const mapItems: MapItem[] = useMemo(() => {
    return items
      .filter((item) => item.type !== "flight")
      .filter((item) => {
        const loc =
          (item.meta?.locationName as string) ||
          (item.meta?.venueName as string) ||
          item.title;
        return !!loc;
      })
      .map((item) => ({
        title: item.title,
        locationName:
          (item.meta?.locationName as string) ||
          (item.meta?.venueName as string) ||
          item.title,
        locationLat: (item.meta?.locationLat as number) ?? null,
        locationLng: (item.meta?.locationLng as number) ?? null,
      }));
  }, [items]);

  /* Share handler -- saves to Supabase and copies shareable link */
  const [sharing, setSharing] = useState(false);
  const handleShare = async () => {
    if (sharing) return;
    setSharing(true);

    try {
      const res = await fetch("/api/trips/share", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: destination ? `Trip to ${destination}` : "My Trip",
          destination: destination || "Custom Trip",
          totalCost: totalPrice,
          items,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const url = `${window.location.origin}/shared/${data.shareSlug}`;
        await navigator.clipboard.writeText(url);
        setShareLink(url);
        setTimeout(() => setShareLink(null), 3000);
      }
    } catch {
      // Fallback to copying current URL
      try {
        await navigator.clipboard.writeText(window.location.href);
        setShareLink(window.location.href);
        setTimeout(() => setShareLink(null), 2000);
      } catch { /* noop */ }
    } finally {
      setSharing(false);
    }
  };

  /* Save handler -- uses localStorage, no login required */
  const handleSave = () => {
    if (!saveName.trim()) return;
    setSaving(true);

    useSavedTripsStore.getState().saveTrip(
      saveName.trim(),
      destination || "Custom Trip",
      items
    );

    setSaved(true);
    setShowSaveModal(false);
    setSaving(false);
    setSaveName("");
    setTimeout(() => setSaved(false), 3000);
  };

  /* Date formatting */
  const formatDate = (d: string) => {
    if (!d) return "";
    try {
      return new Date(d).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return d;
    }
  };

  const dateRange =
    startDate && endDate
      ? `${formatDate(startDate)} - ${formatDate(endDate)}`
      : startDate
        ? formatDate(startDate)
        : "";

  const tripDays = (() => {
    if (!startDate || !endDate) return null;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const ms = end.getTime() - start.getTime();
    if (Number.isNaN(ms) || ms < 0) return null;
    return Math.max(1, Math.round(ms / 86400000) + 1);
  })();

  /* ── Empty state ── */
  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-page-bg">
        <Navbar />

        <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
          <span className="material-symbols-outlined text-[64px] text-on-light-tertiary mb-4">
            luggage
          </span>
          <h1 className="font-semibold text-[28px] text-gray-dark mb-3">
            Your trip is empty
          </h1>
          <p className="text-on-light-secondary text-lg max-w-md mb-8">
            Start building your trip by adding flights, hotels, events, and
            activities from the results page.
          </p>
          <Link
            href="/results"
            className="bg-accent text-white rounded-[10px] px-8 py-3 text-sm font-semibold flex items-center gap-2 hover:bg-accent-light transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">
              search
            </span>
            Browse results
          </Link>
        </div>
      </div>
    );
  }

  /* ── Main render ── */
  return (
    <div className="min-h-screen bg-page-bg">
      {/* ── Dark Nav Header ── */}
      <Navbar />

      {/* ── Trip Overview Hero ── */}
      <section className="bg-hero-gradient relative overflow-hidden">
        <div className="hero-glow absolute inset-0 pointer-events-none" />
        <div className="relative z-10 max-w-content mx-auto px-6 pt-24 pb-10">
          <p className="text-on-dark-tertiary text-[12px] tracking-wider uppercase mb-2">
            Your Trip
          </p>
          <h1 className="text-[40px] font-semibold text-white leading-section mb-4">
            {destination ? (
              <span className="text-white">{destination}</span>
            ) : (
              "Your Custom Trip"
            )}
          </h1>

          <div className="flex flex-wrap items-center gap-8 mt-6">
            {destination && (
              <>
                <div>
                  <p className="text-on-dark-tertiary text-[12px] tracking-wider uppercase mb-1">
                    Destination
                  </p>
                  <p className="font-semibold text-[17px] text-white flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-cyan text-[20px]">
                      location_on
                    </span>
                    {destination}
                  </p>
                </div>
                <div className="w-px h-10 bg-cyan/10 hidden sm:block" />
              </>
            )}

            {dateRange && (
              <>
                <div>
                  <p className="text-on-dark-tertiary text-[12px] tracking-wider uppercase mb-1">
                    Dates
                  </p>
                  <p className="font-semibold text-[17px] text-white flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-cyan text-[20px]">
                      calendar_today
                    </span>
                    {dateRange}
                  </p>
                </div>
                <div className="w-px h-10 bg-cyan/10 hidden sm:block" />
              </>
            )}

            {tripDays !== null && (
              <>
                <div>
                  <p className="text-on-dark-tertiary text-[12px] tracking-wider uppercase mb-1">
                    Length
                  </p>
                  <p className="font-semibold text-[17px] text-white flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-cyan text-[20px]">
                      schedule
                    </span>
                    {tripDays} {tripDays === 1 ? "day" : "days"}
                  </p>
                </div>
                <div className="w-px h-10 bg-cyan/10 hidden sm:block" />
              </>
            )}

            <div>
              <p className="text-on-dark-tertiary text-[12px] tracking-wider uppercase mb-1">
                Travelers
              </p>
              <p className="font-semibold text-[17px] text-white flex items-center gap-1.5">
                <span className="material-symbols-outlined text-cyan text-[20px]">
                  group
                </span>
                {travelers}
              </p>
            </div>
            <div className="w-px h-10 bg-cyan/10 hidden sm:block" />

            <div>
              <p className="text-on-dark-tertiary text-[12px] tracking-wider uppercase mb-1">
                Items
              </p>
              <p className="font-semibold text-[17px] text-white flex items-center gap-1.5">
                <span className="material-symbols-outlined text-cyan text-[20px]">
                  shopping_bag
                </span>
                {items.length}
              </p>
            </div>
            <div className="w-px h-10 bg-cyan/10 hidden sm:block" />

            <div>
              <p className="text-on-dark-tertiary text-[12px] tracking-wider uppercase mb-1">
                Est. Total
              </p>
              <p className="text-cyan font-semibold text-[28px]">
                ${totalPrice.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Content Grid ── */}
      <div className="max-w-content mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* ── Left Column: Trip Items ── */}
          <div className="lg:col-span-8 space-y-8">
            {sections.map((section) => (
              <motion.div
                key={section.key}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                {/* Section header */}
                <div className="flex items-center gap-2 mb-4">
                  <span className="material-symbols-outlined text-accent text-[24px]">
                    {section.icon}
                  </span>
                  <h2 className="font-semibold text-[21px] text-gray-dark">
                    {section.label}
                  </h2>
                  <span className="text-[12px] font-semibold text-on-light-tertiary px-2.5 py-1 rounded-full ml-1">
                    {section.items.length}
                  </span>
                </div>

                {/* Item cards */}
                <div className="space-y-3">
                  {section.items.map((item) => (
                    <ItemCard
                      key={item.id}
                      item={item}
                      ctaLabel={section.ctaLabel}
                      onRemove={removeItem}
                    />
                  ))}
                </div>
              </motion.div>
            ))}
          </div>

          {/* ── Right Column: Map + Sidebar ── */}
          <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-24 lg:self-start">
            {/* Map Widget */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className="card-base p-6"
            >
              <div className="flex items-center gap-2 mb-4">
                <span className="material-symbols-outlined text-accent text-[22px]">
                  near_me
                </span>
                <h3 className="font-semibold text-[17px] text-gray-dark">
                  Trip Map
                </h3>
              </div>
              <TripMap items={mapItems} destination={destination} />
            </motion.div>

            {/* Cost Summary Widget */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.35, ease: "easeOut", delay: 0.1 }}
              className="card-base p-6"
            >
              <div className="flex items-center gap-2 mb-4">
                <span className="material-symbols-outlined text-accent text-[22px]">
                  payments
                </span>
                <h3 className="font-semibold text-[17px] text-gray-dark">
                  Cost Breakdown
                </h3>
              </div>
              <div className="space-y-2">
                {sections.map((sec) => {
                  const sectionTotal = sec.items.reduce(
                    (sum, i) => sum + (i.price ?? 0),
                    0
                  );
                  return (
                    <div
                      key={sec.key}
                      className="flex items-center justify-between text-sm"
                    >
                      <span className="text-on-light-secondary">
                        {sec.label}
                      </span>
                      <span className="font-semibold text-gray-dark">
                        ${sectionTotal.toLocaleString()}
                      </span>
                    </div>
                  );
                })}
                <div className="border-t border-[rgba(0,101,113,0.08)] pt-2 mt-2 flex items-center justify-between">
                  <span className="font-semibold text-gray-dark">
                    Total
                  </span>
                  <span className="font-semibold text-accent text-[21px]">
                    ${totalPrice.toLocaleString()}
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* ── Packing List ── */}
        {destination && (
          <div className="mt-10">
            <PackingList
              destination={destination}
              startDate={startDate}
              endDate={endDate}
              activities={activities}
              pace={pace}
              travelers={travelers}
            />
          </div>
        )}
      </div>

      {/* ── Save Trip Modal ── */}
      {showSaveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowSaveModal(false)}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
            className="relative card-base p-6 w-full max-w-md"
          >
            <h3 className="font-semibold text-[21px] text-gray-dark mb-1">Save this trip</h3>
            <p className="text-on-light-secondary text-sm mb-6">
              Give your trip a name so you can find it later.
            </p>

            <label className="block text-sm font-semibold text-gray-dark mb-1.5">
              Trip name
            </label>
            <input
              type="text"
              value={saveName}
              onChange={(e) => setSaveName(e.target.value)}
              placeholder={destination ? `My ${destination} trip` : "My trip"}
              className="w-full px-4 py-3 rounded-[10px] border border-[rgba(0,101,113,0.08)] text-gray-dark placeholder:text-on-light-tertiary focus:outline-none focus:ring-2 focus:ring-accent/20 mb-4"
              autoFocus
            />

            <label className="flex items-center gap-3 cursor-pointer mb-6">
              <input
                type="checkbox"
                checked={savePublic}
                onChange={(e) => setSavePublic(e.target.checked)}
                className="w-4 h-4 rounded text-accent focus:ring-accent/20"
              />
              <div>
                <p className="text-sm font-semibold text-gray-dark">Share with community</p>
                <p className="text-xs text-on-light-tertiary">Let others discover and fork your trip</p>
              </div>
            </label>

            <div className="flex gap-3">
              <button
                onClick={() => setShowSaveModal(false)}
                className="flex-1 py-3 rounded-[10px] border border-[rgba(0,101,113,0.08)] text-on-light-secondary font-semibold hover:bg-page-bg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !saveName.trim()}
                className="flex-1 py-3 rounded-[10px] bg-accent text-white font-semibold hover:bg-accent-light transition-colors disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save trip"}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

/* ── Item Card Component ── */
function ItemCard({
  item,
  ctaLabel,
  onRemove,
}: {
  item: CartItem;
  ctaLabel: string;
  onRemove: (id: string) => void;
}) {
  const isAi = item.provider === "walter-ai";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={`card-base p-5 group ${isAi ? "border-dashed" : ""}`}
    >
      <div className="flex items-start gap-4">
        {/* Image thumbnail or AI placeholder */}
        {item.image ? (
          <div className="w-20 h-20 rounded-[8px] overflow-hidden flex-shrink-0 bg-page-bg">
            <img
              src={item.image}
              alt={item.title}
              className="w-full h-full object-cover"
            />
          </div>
        ) : isAi ? (
          <div className="w-20 h-20 rounded-[8px] flex-shrink-0 bg-[#e6f7f9] flex items-center justify-center">
            <span className="material-symbols-outlined text-accent/40 text-2xl">auto_awesome</span>
          </div>
        ) : null}

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span
              className="bg-[#e6f7f9] text-accent rounded-pill px-2.5 py-0.5 text-[11px] font-semibold uppercase"
            >
              {item.type}
            </span>
            {isAi ? (
              <span className="text-[10px] text-accent/60 flex items-center gap-0.5">
                <span className="material-symbols-outlined text-[10px]">auto_awesome</span>
                AI suggestion
              </span>
            ) : item.provider ? (
              <span className="text-[10px] text-on-light-tertiary">
                via {item.provider}
              </span>
            ) : null}
          </div>

          <h3 className="font-semibold text-[17px] text-gray-dark truncate">
            {item.title}
          </h3>

          {item.subtitle && (
            <p className="text-on-light-secondary text-sm mt-0.5 truncate">
              {item.subtitle}
            </p>
          )}

          {item.date && (
            <p className="text-on-light-tertiary text-xs mt-1 flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">
                schedule
              </span>
              {item.date}
            </p>
          )}

          {/* Meta details for specific types */}
          {item.type === "hotel" && item.meta?.rating != null && (
            <p className="text-xs text-on-light-secondary mt-1 flex items-center gap-0.5">
              <span className="material-symbols-outlined text-amber-400 text-[14px]">
                star
              </span>
              {String(item.meta.rating)}
            </p>
          )}
        </div>

        {/* Right side: price + actions */}
        <div className="flex flex-col items-end gap-2 flex-shrink-0">
          {/* Remove button */}
          <button
            onClick={() => onRemove(item.id)}
            className="w-7 h-7 rounded-full flex items-center justify-center text-on-light-tertiary hover:text-gray-dark transition-colors"
            aria-label={`Remove ${item.title}`}
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>

          {/* Price */}
          {item.price != null && item.price > 0 && (
            <p className={`font-semibold text-[17px] ${isAi ? "text-on-light-tertiary" : "text-accent"}`}>
              ${item.price.toLocaleString()}
              {isAi && <span className="text-[10px] ml-0.5">est.</span>}
            </p>
          )}

          {/* CTA button or swap button */}
          {isAi ? (
            <Link
              href="/results"
              className="border border-accent text-accent rounded-[10px] px-4 py-1.5 text-[12px] font-semibold flex items-center gap-1.5 whitespace-nowrap hover:bg-accent/5 transition-colors"
            >
              <span className="material-symbols-outlined text-[14px]">swap_horiz</span>
              Find real booking
            </Link>
          ) : item.bookingUrl ? (
            <button
              onClick={() =>
                trackAndOpen({
                  provider: item.provider || "unknown",
                  itemType: item.type,
                  destinationUrl: item.bookingUrl!,
                })
              }
              className="bg-accent text-white rounded-[10px] px-4 py-1.5 text-[12px] font-semibold flex items-center gap-1.5 whitespace-nowrap hover:bg-accent-light transition-colors"
            >
              <span className="material-symbols-outlined text-[14px]">
                open_in_new
              </span>
              {ctaLabel}
            </button>
          ) : null}
        </div>
      </div>
    </motion.div>
  );
}
