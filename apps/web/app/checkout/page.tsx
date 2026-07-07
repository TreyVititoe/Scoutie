"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  useTripCartStore,
  selectTotalPrice,
  getItemsByType,
  type CartItem,
  type CartItemType,
} from "@/lib/stores/tripCartStore";
import {
  affiliateUrl,
  lookupUrl,
  providerLabel,
  trackAndOpen,
} from "@/lib/affiliate";
import AffiliateDisclosure from "@/components/AffiliateDisclosure";

/* ── Section config ── */
const sectionConfig: Record<string, { label: string; icon: string }> = {
  flight: { label: "Flights", icon: "flight" },
  hotel: { label: "Stays", icon: "hotel" },
  event: { label: "Events", icon: "confirmation_number" },
  activity: { label: "Activities & Sites", icon: "hiking" },
  restaurant: { label: "Restaurants", icon: "restaurant" },
};

const sectionOrder: Array<{ key: string; types: CartItemType[] }> = [
  { key: "flight", types: ["flight"] },
  { key: "hotel", types: ["hotel"] },
  { key: "event", types: ["event"] },
  { key: "activity", types: ["activity", "site"] },
  { key: "restaurant", types: ["restaurant"] },
];

export default function CheckoutPage() {
  const items = useTripCartStore((s) => s.items);
  const bookedIds = useTripCartStore((s) => s.bookedIds);
  const toggleBooked = useTripCartStore((s) => s.toggleBooked);
  const totalPrice = useTripCartStore(selectTotalPrice);

  /* Avoid SSR/client mismatch while the cart hydrates from localStorage */
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const [destination, setDestination] = useState("");
  const [tripId, setTripId] = useState<string | undefined>(undefined);
  useEffect(() => {
    try {
      const trip = localStorage.getItem("walter_trip");
      const parsed = trip ? JSON.parse(trip) : null;
      if (parsed?.destination) setDestination(parsed.destination as string);
      if (parsed?.id) setTripId(String(parsed.id));
    } catch {}
  }, []);

  const grouped = useMemo(() => getItemsByType(items), [items]);

  const sections = useMemo(() => {
    return sectionOrder
      .map((sec) => {
        const sectionItems = sec.types.flatMap((t) => grouped[t] || []);
        if (sectionItems.length === 0) return null;
        return { key: sec.key, ...sectionConfig[sec.key], items: sectionItems };
      })
      .filter(Boolean) as Array<{
      key: string;
      label: string;
      icon: string;
      items: CartItem[];
    }>;
  }, [grouped]);

  const bookedCount = items.filter((i) => bookedIds.includes(i.id)).length;
  const allBooked = items.length > 0 && bookedCount === items.length;

  const handleBook = (item: CartItem) => {
    const url = affiliateUrl(item) ?? lookupUrl(item, destination);
    trackAndOpen({
      tripId,
      provider: providerLabel(item),
      itemType: item.type,
      destinationUrl: url,
    });
  };

  /* ── Loading shell while cart hydrates ── */
  if (!mounted) {
    return (
      <div className="min-h-screen bg-product-bg flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  /* ── Empty cart ── */
  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-product-bg">
        <header className="nav-glass sticky top-0 z-20">
          <div className="max-w-[1280px] mx-auto px-6 py-4 flex items-center justify-between">
            <Link href="/" className="text-[17px] font-semibold text-ink">
              Walter
            </Link>
          </div>
        </header>
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
          <span className="material-symbols-outlined text-[64px] text-ink-faint mb-4">
            shopping_bag
          </span>
          <h1 className="font-semibold text-[28px] text-ink mb-3">
            Nothing to book yet
          </h1>
          <p className="text-ink-soft text-lg max-w-md mb-8">
            Add flights, stays, and tickets to your trip first. Walter lines up
            what you choose.
          </p>
          <Link
            href="/trip"
            className="bg-accent text-white rounded-[10px] px-8 py-3 text-sm font-semibold flex items-center gap-2 hover:bg-accent-light transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">
              arrow_back
            </span>
            Back to your trip
          </Link>
        </div>
      </div>
    );
  }

  /* ── Main render ── */
  return (
    <div className="min-h-screen bg-product-bg">
      <header className="nav-glass sticky top-0 z-20">
        <div className="max-w-[1280px] mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-[17px] font-semibold text-ink">
            Walter
          </Link>
          <Link
            href="/trip"
            className="flex items-center gap-1.5 text-sm font-semibold text-ink-soft hover:text-ink transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">
              arrow_back
            </span>
            Back to your trip
          </Link>
        </div>
      </header>

      <div className="max-w-[1080px] mx-auto px-6 py-10">
        <p className="text-ink-faint text-[12px] tracking-wider uppercase mb-2">
          Booking checklist
        </p>
        <h1 className="text-[36px] font-semibold text-ink leading-section mb-3">
          {allBooked ? "Trip booked. Go pack." : "Book your trip."}
        </h1>
        <p className="text-ink-soft max-w-xl mb-8">
          {allBooked
            ? `All ${items.length} pieces of ${
                destination || "your trip"
              } are locked in.`
            : "Every piece Walter lined up, one place. Book each with its provider, then check it off."}
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* ── Left: booking checklist ── */}
          <div className="lg:col-span-7 space-y-6">
            {sections.map((section) => {
              const sectionTotal = section.items.reduce(
                (sum, i) => sum + (i.price ?? 0),
                0
              );
              return (
                <motion.div
                  key={section.key}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="card-base p-5"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-accent text-[22px]">
                        {section.icon}
                      </span>
                      <h2 className="font-semibold text-[17px] text-ink">
                        {section.label}
                      </h2>
                    </div>
                    <span className="font-semibold text-sm text-ink-soft">
                      ${sectionTotal.toLocaleString()}
                    </span>
                  </div>
                  <div>
                    {section.items.map((item) => {
                      const isBooked = bookedIds.includes(item.id);
                      const hasUrl = Boolean(item.bookingUrl);
                      return (
                        <div
                          key={item.id}
                          className="flex items-center gap-4 py-3.5 border-b border-line last:border-b-0 last:pb-0"
                        >
                          <button
                            type="button"
                            onClick={() => toggleBooked(item.id)}
                            aria-label={
                              isBooked ? "Mark as not booked" : "Mark as booked"
                            }
                            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                              isBooked
                                ? "bg-accent border-accent text-white"
                                : "border-line hover:border-accent"
                            }`}
                          >
                            {isBooked && (
                              <span className="material-symbols-outlined text-[16px]">
                                check
                              </span>
                            )}
                          </button>
                          <div className="min-w-0 flex-1">
                            <p
                              className={`font-semibold text-[15px] truncate ${
                                isBooked
                                  ? "text-ink-faint line-through"
                                  : "text-ink"
                              }`}
                            >
                              {item.title}
                            </p>
                            {item.subtitle && (
                              <p className="text-ink-soft text-xs truncate mt-0.5">
                                {item.subtitle}
                              </p>
                            )}
                            {item.date && (
                              <p className="text-ink-faint text-xs mt-0.5">
                                {item.date}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-3 flex-shrink-0">
                            <p className="font-semibold text-[15px] text-ink">
                              {item.price != null && item.price > 0
                                ? `$${item.price.toLocaleString()}`
                                : "Included"}
                            </p>
                            {isBooked ? (
                              <span className="text-xs font-semibold text-accent px-3 py-2">
                                Booked
                              </span>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleBook(item)}
                                className="bg-accent text-white rounded-[8px] px-3.5 py-2 text-xs font-semibold flex items-center gap-1.5 hover:bg-accent-light transition-colors whitespace-nowrap"
                              >
                                {hasUrl
                                  ? `Book on ${providerLabel(item)}`
                                  : "Find online"}
                                <span className="material-symbols-outlined text-[14px]">
                                  open_in_new
                                </span>
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* ── Right: progress ── */}
          <div className="lg:col-span-5 lg:sticky lg:top-24 lg:self-start">
            <div className="card-base p-6">
              <h2 className="font-semibold text-[21px] text-ink mb-1">
                {bookedCount} of {items.length} booked
              </h2>
              <p className="text-ink-soft text-sm mb-4">
                {allBooked
                  ? "Every confirmation lives with its provider. Walter keeps the itinerary."
                  : "Each booking opens with the provider in a new tab. Check items off as you go."}
              </p>

              <div
                className="h-2 rounded-full bg-line overflow-hidden mb-6"
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={items.length}
                aria-valuenow={bookedCount}
              >
                <div
                  className="h-full bg-accent rounded-full transition-all duration-500"
                  style={{
                    width: `${
                      items.length ? (bookedCount / items.length) * 100 : 0
                    }%`,
                  }}
                />
              </div>

              <div className="border-t border-line pt-4 mb-5 flex items-center justify-between">
                <span className="font-semibold text-ink">Trip total</span>
                <span className="font-semibold text-accent text-[24px]">
                  ${totalPrice.toLocaleString()}
                </span>
              </div>

              <div className="space-y-2.5">
                <Link
                  href="/trip"
                  className="w-full rounded-[10px] border border-ink/20 text-ink py-3 text-sm font-semibold flex items-center justify-center gap-2 hover:bg-ink/5 transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    map
                  </span>
                  View itinerary and packing list
                </Link>
                {allBooked && (
                  <Link
                    href="/"
                    className="w-full bg-accent text-white rounded-[10px] py-3 text-sm font-semibold flex items-center justify-center gap-2 hover:bg-accent-light transition-colors"
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      travel_explore
                    </span>
                    Plan another trip
                  </Link>
                )}
              </div>

              <div className="mt-5 pt-4 border-t border-line">
                <AffiliateDisclosure />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
