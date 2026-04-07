"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import dynamic from "next/dynamic";
import {
  useTripCartStore,
  selectTotalPrice,
  getItemsByType,
  type CartItem,
  type CartItemType,
} from "@/lib/stores/tripCartStore";
import { trackAndOpen } from "@/lib/affiliate";
import PackingList from "@/components/trip/PackingList";
import type { MapItem } from "@/components/trip/TripMap";

const TripMap = dynamic(() => import("@/components/trip/TripMap"), {
  ssr: false,
  loading: () => (
    <div className="rounded-2xl bg-surface-container-low flex items-center justify-center h-80 lg:min-h-[400px] text-on-surface-variant text-sm">
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

const typeColors: Record<string, string> = {
  flight: "bg-teal-50 text-teal-600",
  hotel: "bg-blue-50 text-blue-600",
  event: "bg-rose-50 text-rose-600",
  activity: "bg-emerald-50 text-emerald-600",
  site: "bg-emerald-50 text-emerald-600",
  restaurant: "bg-amber-50 text-amber-600",
};

/* ── Wrapper with Suspense ── */
export default function TripPageWrapper() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
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

  /* Share handler */
  const handleShare = async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      setShareLink(url);
      setTimeout(() => setShareLink(null), 2000);
    } catch {
      /* fallback */
    }
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

  /* ── Empty state ── */
  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background font-body">
        <header className="bg-white/70 backdrop-blur-xl shadow-xl shadow-teal-900/5 sticky top-0 z-20">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            <Link
              href="/"
              className="text-2xl font-black italic text-teal-700 font-headline"
            >
              Walter
            </Link>
            <Link
              href="/results"
              className="flex items-center gap-1.5 text-sm font-semibold text-on-surface-variant hover:text-on-surface transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">
                arrow_back
              </span>
              Back to results
            </Link>
          </div>
        </header>

        <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
          <span className="material-symbols-outlined text-[64px] text-outline mb-4">
            luggage
          </span>
          <h1 className="font-headline font-extrabold text-3xl text-on-surface mb-3">
            Your trip is empty
          </h1>
          <p className="text-on-surface-variant font-body text-lg max-w-md mb-8">
            Start building your trip by adding flights, hotels, events, and
            activities from the results page.
          </p>
          <Link
            href="/results"
            className="btn-primary-gradient rounded-full px-8 py-3 text-sm font-bold flex items-center gap-2"
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
    <div className="min-h-screen bg-background font-body">
      {/* ── Glass Header ── */}
      <header className="bg-white/70 backdrop-blur-xl shadow-xl shadow-teal-900/5 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link
            href="/"
            className="text-2xl font-black italic text-teal-700 font-headline"
          >
            Walter
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/results"
              className="flex items-center gap-1.5 text-sm font-semibold text-on-surface-variant hover:text-on-surface transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">
                arrow_back
              </span>
              Back to results
            </Link>
            <motion.button
              onClick={handleShare}
              whileTap={{ scale: 0.95 }}
              className="px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-bold hover:bg-primary-dim transition-colors flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">
                {shareLink ? "check" : "share"}
              </span>
              {shareLink ? "Copied!" : "Share trip"}
            </motion.button>
          </div>
        </div>
      </header>

      {/* ── Trip Overview Hero ── */}
      <section className="relative overflow-hidden bg-white/50 border-b border-outline-variant/10">
        <div className="max-w-7xl mx-auto px-6 pt-12 pb-10">
          <p className="uppercase tracking-[0.2em] text-xs font-bold text-primary mb-2 font-body">
            Your Trip
          </p>
          <h1 className="text-5xl md:text-7xl font-headline font-extrabold tracking-tight text-on-surface mb-4">
            {destination ? (
              <span className="text-gradient">{destination}</span>
            ) : (
              "Your Custom Trip"
            )}
          </h1>

          <div className="flex flex-wrap items-center gap-8 mt-6">
            {destination && (
              <>
                <div>
                  <p className="text-xs text-on-surface-variant uppercase tracking-[0.15em] font-bold mb-1 font-body">
                    Destination
                  </p>
                  <p className="font-headline font-bold text-lg text-on-surface flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-primary text-[20px]">
                      location_on
                    </span>
                    {destination}
                  </p>
                </div>
                <div className="w-px h-10 bg-outline-variant/20" />
              </>
            )}

            {dateRange && (
              <>
                <div>
                  <p className="text-xs text-on-surface-variant uppercase tracking-[0.15em] font-bold mb-1 font-body">
                    Dates
                  </p>
                  <p className="font-headline font-bold text-lg text-on-surface flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-primary text-[20px]">
                      calendar_today
                    </span>
                    {dateRange}
                  </p>
                </div>
                <div className="w-px h-10 bg-outline-variant/20" />
              </>
            )}

            <div>
              <p className="text-xs text-on-surface-variant uppercase tracking-[0.15em] font-bold mb-1 font-body">
                Travelers
              </p>
              <p className="font-headline font-bold text-lg text-on-surface flex items-center gap-1.5">
                <span className="material-symbols-outlined text-primary text-[20px]">
                  group
                </span>
                {travelers}
              </p>
            </div>
            <div className="w-px h-10 bg-outline-variant/20" />

            <div>
              <p className="text-xs text-on-surface-variant uppercase tracking-[0.15em] font-bold mb-1 font-body">
                Items
              </p>
              <p className="font-headline font-bold text-lg text-on-surface flex items-center gap-1.5">
                <span className="material-symbols-outlined text-primary text-[20px]">
                  shopping_bag
                </span>
                {items.length}
              </p>
            </div>
            <div className="w-px h-10 bg-outline-variant/20" />

            <div>
              <p className="text-xs text-on-surface-variant uppercase tracking-[0.15em] font-bold mb-1 font-body">
                Est. Total
              </p>
              <p className="font-mono font-bold text-2xl text-primary">
                ${totalPrice.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Content Grid ── */}
      <div className="max-w-7xl mx-auto px-6 py-8">
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
                  <span className="material-symbols-outlined text-primary text-[24px]">
                    {section.icon}
                  </span>
                  <h2 className="font-headline font-extrabold text-xl text-on-surface">
                    {section.label}
                  </h2>
                  <span className="text-xs font-bold bg-surface-container-low text-on-surface-variant px-2.5 py-1 rounded-full ml-1">
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
              className="card-3d p-6"
            >
              <div className="flex items-center gap-2 mb-4">
                <span className="material-symbols-outlined text-primary text-[22px]">
                  near_me
                </span>
                <h3 className="font-headline font-extrabold text-lg text-on-surface">
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
              className="card-3d p-6"
            >
              <div className="flex items-center gap-2 mb-4">
                <span className="material-symbols-outlined text-primary text-[22px]">
                  payments
                </span>
                <h3 className="font-headline font-extrabold text-lg text-on-surface">
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
                      <span className="text-on-surface-variant font-body">
                        {sec.label}
                      </span>
                      <span className="font-mono font-bold text-on-surface">
                        ${sectionTotal.toLocaleString()}
                      </span>
                    </div>
                  );
                })}
                <div className="border-t border-outline-variant/20 pt-2 mt-2 flex items-center justify-between">
                  <span className="font-body font-bold text-on-surface">
                    Total
                  </span>
                  <span className="font-mono font-bold text-xl text-primary">
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
  const colorClass = typeColors[item.type] || "bg-slate-50 text-slate-600";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="card-3d !rounded-2xl p-5 group"
    >
      <div className="flex items-start gap-4">
        {/* Image thumbnail */}
        {item.image && (
          <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-surface-container-low">
            <img
              src={item.image}
              alt={item.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span
              className={`inline-flex items-center gap-1 text-[10px] font-bold rounded-lg px-2 py-0.5 uppercase tracking-wider ${colorClass}`}
            >
              {item.type}
            </span>
            {item.provider && (
              <span className="text-[10px] text-on-surface-variant font-body">
                via {item.provider}
              </span>
            )}
          </div>

          <h3 className="font-headline font-bold text-lg text-on-surface truncate">
            {item.title}
          </h3>

          {item.subtitle && (
            <p className="text-on-surface-variant text-sm font-body mt-0.5 truncate">
              {item.subtitle}
            </p>
          )}

          {item.date && (
            <p className="text-on-surface-variant/70 text-xs mt-1 flex items-center gap-1 font-body">
              <span className="material-symbols-outlined text-[14px]">
                schedule
              </span>
              {item.date}
            </p>
          )}

          {/* Meta details for specific types */}
          {item.type === "hotel" && item.meta?.rating != null && (
            <p className="text-xs text-on-surface-variant mt-1 flex items-center gap-0.5">
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
            className="w-7 h-7 rounded-full flex items-center justify-center text-on-surface-variant/40 hover:text-red-500 hover:bg-red-50 transition-colors"
            aria-label={`Remove ${item.title}`}
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>

          {/* Price */}
          {item.price != null && item.price > 0 && (
            <p className="font-mono font-bold text-lg text-primary">
              ${item.price.toLocaleString()}
            </p>
          )}

          {/* CTA button */}
          {item.bookingUrl && (
            <button
              onClick={() =>
                trackAndOpen({
                  provider: item.provider || "unknown",
                  itemType: item.type,
                  destinationUrl: item.bookingUrl!,
                })
              }
              className="btn-primary-gradient rounded-full px-4 py-1.5 text-xs font-bold flex items-center gap-1.5 whitespace-nowrap"
            >
              <span className="material-symbols-outlined text-[14px]">
                open_in_new
              </span>
              {ctaLabel}
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
