"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { useSavedTripsStore, type SavedTrip } from "@/lib/stores/savedTripsStore";
import { useTripCartStore } from "@/lib/stores/tripCartStore";
import { mergePrefs, readStored } from "@/lib/prefs";
import { tripEconomics } from "@/lib/tripEconomics";

export default function CompareLocalPage() {
  const router = useRouter();
  const allTrips = useSavedTripsStore((s) => s.trips);
  const [trips, setTrips] = useState<SavedTrip[]>([]);
  const [travelers, setTravelers] = useState(1);

  useEffect(() => {
    const stored = localStorage.getItem("walter_compare_local");
    if (!stored) {
      router.push("/saved");
      return;
    }
    const ids = readStored<string[]>("walter_compare_local", []);
    const matched = ids
      .map((id) => allTrips.find((t) => t.id === id))
      .filter(Boolean) as SavedTrip[];

    if (matched.length < 2) {
      router.push("/saved");
      return;
    }
    setTrips(matched);

    const prefs = localStorage.getItem("walter_prefs");
    if (prefs) {
      const p = JSON.parse(prefs);
      setTravelers(p.travelersCount || p.travelers || 1);
    }
  }, [allTrips, router]);

  function parseDur(text: string): number {
    const h = /(\d+)\s*h/.exec(text);
    const m = /(\d+)\s*m/.exec(text);
    return (h ? Number(h[1]) * 60 : 0) + (m ? Number(m[1]) : 0);
  }

  const handleChoose = (trip: SavedTrip) => {
    const cart = useTripCartStore.getState();
    cart.clearCart();
    trip.items.forEach((item) => cart.addItem(item));
    mergePrefs({
      destinations: [trip.destination],
      destination: trip.destination,
      ...(trip.startDate ? { startDate: trip.startDate } : {}),
      ...(trip.endDate ? { endDate: trip.endDate } : {}),
      ...(trip.travelers ? { travelers: trip.travelers, travelersCount: trip.travelers } : {}),
    });
    router.push("/trip");
  };

  if (trips.length === 0) {
    return (
      <div className="min-h-screen bg-product-bg flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-product-bg">
      <header className="fixed top-0 left-0 right-0 z-20 nav-glass">
        <div className="max-w-content mx-auto px-4 lg:px-8 py-4 flex items-center justify-between">
          <Link href="/" className="text-ink text-title font-semibold">Walter</Link>
          <Link href="/saved" className="text-ink-soft text-sm hover:text-ink transition-colors flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            Saved Trips
          </Link>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 lg:px-8 pt-28 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <h1 className="text-[28px] font-semibold text-ink leading-page mb-3">
            Compare your saved trips
          </h1>
          <p className="text-ink-soft text-title">
            {trips.length} trips side-by-side. Pick the one you love.
          </p>
        </motion.div>

        <div className={`grid gap-5 ${trips.length === 2 ? "grid-cols-1 lg:grid-cols-2" : "grid-cols-1 lg:grid-cols-3"}`}>
          {trips.map((trip, i) => {
            const eco = tripEconomics(trip, travelers);
            const allEcos = trips.map((t) => tripEconomics(t, travelers));
            const cheapestTotal = Math.min(
              ...allEcos.filter((e) => e.total > 0).map((e) => e.total)
            );
            const badges: string[] = [];
            if (eco.total > 0 && eco.total === cheapestTotal && trips.length > 1) {
              badges.push("Cheapest overall");
            }
            const durations = allEcos
              .map((e) => e.flightDuration)
              .filter(Boolean) as string[];
            if (
              eco.flightDuration &&
              durations.length > 1 &&
              durations.every((d) => parseDur(eco.flightDuration!) <= parseDur(d))
            ) {
              badges.push("Shortest flight");
            }

            const eventItems = trip.items.filter((it) => it.type === "event");
            const activityItems = trip.items.filter(
              (it) => it.type === "activity" || it.type === "restaurant" || it.type === "site"
            );

            // Event categories
            const eventCategories = [...new Set(
              eventItems
                .map((e) => (e.meta?.category as string) || "")
                .filter(Boolean)
            )].slice(0, 3);

            // Interest/vibe tags from activities
            const interestTags = [...new Set(
              activityItems
                .map((a) => a.type === "restaurant" ? "Food" : a.type === "site" ? "Sightseeing" : "Activities")
            )].slice(0, 4);

            return (
              <motion.div
                key={trip.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.1 }}
                className={`card-base overflow-hidden flex flex-col ${
                  badges.includes("Cheapest overall") ? "ring-2 ring-accent" : ""
                }`}
              >
                {/* Accent bar */}
                <div className="h-1 bg-gradient-to-r from-accent to-cyan" />

                {/* Header */}
                <div className="p-5 pb-4 border-b border-[rgba(91,141,239,0.06)]">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-accent text-[18px]">location_on</span>
                      <h3 className="font-semibold text-ink text-title">{trip.destination}</h3>
                    </div>
                    <span className="bg-accent text-white rounded-pill px-2.5 py-0.5 text-[11px] font-semibold">
                      {trip.items.length} items
                    </span>
                  </div>
                  <p className="text-ink-soft text-sm">{trip.name}</p>
                  <p className="text-ink-soft text-sm flex items-center gap-1.5 mt-1">
                    <span className="material-symbols-outlined text-[14px]">group</span>
                    {travelers} traveler{travelers !== 1 ? "s" : ""}
                  </p>
                </div>

                <div className="p-5 flex-1 flex flex-col">
                  {/* Winner badges + affordability tier */}
                  <div className="flex flex-wrap items-center gap-1.5 mb-3">
                    {badges.map((b) => (
                      <span
                        key={b}
                        className="bg-accent text-white rounded-pill px-2.5 py-1 text-[11px] font-bold"
                      >
                        {b}
                      </span>
                    ))}
                    <span className="bg-page-bg border border-line text-ink rounded-pill px-2.5 py-1 text-[11px] font-semibold">
                      {eco.tier.label}
                    </span>
                  </div>

                  {/* The real cost of this trip */}
                  <div className="mb-4 bg-[#DBEAFE]/30 rounded-[10px] p-4 -mx-1">
                    <div className="flex items-baseline justify-between">
                      <span className="text-ink-soft text-sm">True cost, all in</span>
                      <p className="font-semibold text-accent text-[26px]">
                        ${eco.total.toLocaleString()}
                      </p>
                    </div>
                    <div className="flex items-center justify-between text-xs text-ink-faint mt-0.5">
                      <span>
                        {eco.days
                          ? `${eco.days} days · ${eco.travelers} traveler${eco.travelers !== 1 ? "s" : ""}`
                          : `${eco.travelers} traveler${eco.travelers !== 1 ? "s" : ""}`}
                      </span>
                      <span>
                        {eco.perPerson != null && `$${eco.perPerson.toLocaleString()}/person`}
                        {eco.perDay != null && ` · $${eco.perDay.toLocaleString()}/day`}
                      </span>
                    </div>
                    <div className="mt-3 pt-3 border-t border-[rgba(91,141,239,0.12)] space-y-1.5 text-sm">
                      <CostRow label="Flights" value={eco.flights} />
                      <CostRow label="Stay" value={eco.stay} />
                      <CostRow label="Events and activities" value={eco.fun} />
                      <CostRow
                        label="Food and getting around (est.)"
                        value={eco.extras}
                        estimate
                      />
                    </div>
                    <p className="text-[11px] text-ink-faint mt-2">{eco.tier.blurb}</p>
                  </div>

                  {/* Flight length */}
                  <div className="flex items-center justify-between py-3 border-t border-[rgba(91,141,239,0.06)]">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-accent text-[18px]">flight</span>
                      <span className="text-ink text-sm font-semibold">Flight time</span>
                    </div>
                    {eco.flightDuration ? (
                      <p className="font-semibold text-ink text-sm">
                        {eco.flightDuration}
                        {eco.flightStops != null && (
                          <span className="text-ink-faint font-medium">
                            {" "}
                            · {eco.flightStops === 0 ? "nonstop" : `${eco.flightStops} stop${eco.flightStops > 1 ? "s" : ""}`}
                          </span>
                        )}
                      </p>
                    ) : (
                      <span className="text-ink-faint text-xs">No flight added</span>
                    )}
                  </div>

                  {/* Events */}
                  <div className="py-3 border-t border-[rgba(91,141,239,0.06)]">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-accent text-[18px]">confirmation_number</span>
                        <span className="text-ink text-sm font-semibold">Events Found</span>
                      </div>
                      <span className="font-semibold text-accent text-[24px]">{eventItems.length}</span>
                    </div>

                    {/* Category pills */}
                    {eventCategories.length > 0 && (() => {
                      const pillColors = ["bg-accent text-white", "bg-cyan text-ink", "bg-accent-dark text-white"];
                      return (
                        <div className="flex flex-wrap gap-1.5 mb-3">
                          {eventCategories.map((cat, j) => (
                            <span key={j} className={`${pillColors[j % pillColors.length]} rounded-pill px-2.5 py-0.5 text-[10px] font-semibold`}>
                              {cat}
                            </span>
                          ))}
                        </div>
                      );
                    })()}

                    {/* Top events with images */}
                    {eventItems.length > 0 && (
                      <div className="space-y-2 mt-2">
                        {eventItems.slice(0, 2).map((ev, j) => (
                          <div key={j} className="flex items-center gap-2.5">
                            {ev.image && (
                              <img src={ev.image} alt="" className="w-10 h-10 rounded-[6px] object-cover flex-shrink-0" />
                            )}
                            <div className="min-w-0">
                              <p className="text-sm text-ink font-semibold truncate">{ev.title}</p>
                              <p className="text-[11px] text-ink-faint truncate">{ev.subtitle}</p>
                            </div>
                            {ev.bookingUrl && (
                              <a href={ev.bookingUrl} target="_blank" rel="noopener noreferrer" className="text-accent flex-shrink-0">
                                <span className="material-symbols-outlined text-[16px]">open_in_new</span>
                              </a>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Interests / Activities */}
                  {(interestTags.length > 0 || activityItems.length > 0) && (
                    <div className="py-3 border-t border-[rgba(91,141,239,0.06)]">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="material-symbols-outlined text-accent text-[18px]">interests</span>
                        <span className="text-ink text-sm font-semibold">Your Interests</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {activityItems.slice(0, 4).map((act, j) => (
                          <span key={j} className="bg-page-bg text-ink rounded-pill px-2.5 py-0.5 text-[10px] font-semibold border border-[rgba(91,141,239,0.08)]">
                            {act.title.length > 20 ? act.title.slice(0, 20) + "..." : act.title}
                          </span>
                        ))}
                        {activityItems.length > 4 && (
                          <span className="bg-page-bg text-ink-faint rounded-pill px-2.5 py-0.5 text-[10px] font-semibold border border-[rgba(91,141,239,0.08)]">
                            +{activityItems.length - 4} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* CTA */}
                  <button
                    onClick={() => handleChoose(trip)}
                    className="mt-auto w-full bg-accent text-white rounded-[10px] px-5 py-3 text-body font-semibold hover:bg-accent-light transition-colors flex items-center justify-center gap-2"
                  >
                    View Full Details
                    <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
        <p className="text-[11px] text-ink-faint text-center mt-8 max-w-[64ch] mx-auto">
          Flight, stay, and ticket prices are the live prices these carts were
          built from. The food and getting-around line is an estimate so the
          totals reflect what the trip really costs, not just what is booked.
        </p>
      </div>
    </div>
  );
}

function CostRow({
  label,
  value,
  estimate = false,
}: {
  label: string;
  value: number;
  estimate?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className={estimate ? "text-ink-faint" : "text-ink-soft"}>{label}</span>
      <span className={`font-semibold tabular-nums ${estimate ? "text-ink-faint" : "text-ink"}`}>
        {value > 0 ? `$${value.toLocaleString()}` : "–"}
      </span>
    </div>
  );
}
