"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { useSavedTripsStore, type SavedTrip } from "@/lib/stores/savedTripsStore";
import { useTripCartStore } from "@/lib/stores/tripCartStore";

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
    const ids: string[] = JSON.parse(stored);
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

  const handleChoose = (trip: SavedTrip) => {
    const cart = useTripCartStore.getState();
    cart.clearCart();
    trip.items.forEach((item) => cart.addItem(item));
    localStorage.setItem(
      "walter_prefs",
      JSON.stringify({ destinations: [trip.destination], destination: trip.destination })
    );
    router.push("/trip");
  };

  if (trips.length === 0) {
    return (
      <div className="min-h-screen bg-page-bg flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-page-bg">
      <header className="fixed top-0 left-0 right-0 z-20 nav-glass">
        <div className="max-w-content mx-auto px-4 lg:px-8 py-4 flex items-center justify-between">
          <Link href="/" className="text-white text-[17px] font-semibold">Walter</Link>
          <Link href="/saved" className="text-on-dark-secondary text-sm hover:text-white transition-colors flex items-center gap-1.5">
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
          <h1 className="text-[28px] font-semibold text-gray-dark leading-page mb-3">
            Compare your saved trips
          </h1>
          <p className="text-on-light-secondary text-[17px]">
            {trips.length} trips side-by-side. Pick the one you love.
          </p>
        </motion.div>

        <div className={`grid gap-5 ${trips.length === 2 ? "grid-cols-1 lg:grid-cols-2" : "grid-cols-1 lg:grid-cols-3"}`}>
          {trips.map((trip, i) => {
            const flightItems = trip.items.filter((it) => it.type === "flight");
            const hotelItems = trip.items.filter((it) => it.type === "hotel");
            const eventItems = trip.items.filter((it) => it.type === "event");
            const activityItems = trip.items.filter(
              (it) => it.type === "activity" || it.type === "restaurant" || it.type === "site"
            );

            // Price ranges
            const flightPrices = flightItems.map((f) => f.price || 0).filter((p) => p > 0);
            const flightMin = flightPrices.length ? Math.min(...flightPrices) : 0;
            const flightMax = flightPrices.length ? Math.max(...flightPrices) : 0;

            const hotelPrices = hotelItems.map((h) => h.price || 0).filter((p) => p > 0);
            const hotelMin = hotelPrices.length ? Math.min(...hotelPrices) : 0;
            const hotelMax = hotelPrices.length ? Math.max(...hotelPrices) : 0;

            const totalMin = (flightMin || 0) + (hotelMin || 0);
            const totalMax = (flightMax || 0) + (hotelMax || 0);

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
                className="card-base overflow-hidden flex flex-col"
              >
                {/* Accent bar */}
                <div className="h-1 bg-gradient-to-r from-accent to-cyan" />

                {/* Header */}
                <div className="p-5 pb-4 border-b border-[rgba(194,85,56,0.06)]">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-accent text-[18px]">location_on</span>
                      <h3 className="font-semibold text-gray-dark text-[17px]">{trip.destination}</h3>
                    </div>
                    <span className="bg-accent text-white rounded-pill px-2.5 py-0.5 text-[11px] font-semibold">
                      {trip.items.length} items
                    </span>
                  </div>
                  <p className="text-on-light-secondary text-sm">{trip.name}</p>
                  <p className="text-on-light-secondary text-sm flex items-center gap-1.5 mt-1">
                    <span className="material-symbols-outlined text-[14px]">group</span>
                    {travelers} traveler{travelers !== 1 ? "s" : ""}
                  </p>
                </div>

                <div className="p-5 flex-1 flex flex-col">
                  {/* Estimated Total */}
                  <div className="mb-5 bg-[#FFF2D9]/30 rounded-[10px] p-4 -mx-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-on-light-secondary text-sm">Estimated Total</span>
                      <span className="material-symbols-outlined text-accent text-[16px]">payments</span>
                    </div>
                    {totalMin > 0 ? (
                      <div>
                        <p className="font-semibold text-accent text-[24px]">
                          {totalMin === totalMax
                            ? `$${totalMin.toLocaleString()}`
                            : `$${totalMin.toLocaleString()} - $${totalMax.toLocaleString()}`}
                        </p>
                        <p className="text-on-light-tertiary text-xs">per person</p>
                      </div>
                    ) : trip.totalCost > 0 ? (
                      <div>
                        <p className="font-semibold text-accent text-[24px]">${trip.totalCost.toLocaleString()}</p>
                        <p className="text-on-light-tertiary text-xs">per person</p>
                      </div>
                    ) : (
                      <p className="text-on-light-tertiary text-sm">No pricing available</p>
                    )}
                  </div>

                  {/* Flights */}
                  <div className="flex items-center justify-between py-3 border-t border-[rgba(194,85,56,0.06)]">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-accent text-[18px]">flight</span>
                      <span className="text-gray-dark text-sm font-semibold">Flights</span>
                    </div>
                    {flightItems.length > 0 ? (
                      <p className="font-semibold text-accent text-sm">
                        {flightMin === flightMax
                          ? `$${flightMin.toLocaleString()}`
                          : `$${flightMin.toLocaleString()} - $${flightMax.toLocaleString()}`}
                      </p>
                    ) : (
                      <span className="text-on-light-tertiary text-xs">None added</span>
                    )}
                  </div>

                  {/* Hotels */}
                  <div className="flex items-center justify-between py-3 border-t border-[rgba(194,85,56,0.06)]">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-accent text-[18px]">hotel</span>
                      <span className="text-gray-dark text-sm font-semibold">Hotels</span>
                    </div>
                    {hotelItems.length > 0 ? (
                      <p className="font-semibold text-accent text-sm">
                        {hotelMin === hotelMax
                          ? `$${hotelMin.toLocaleString()}`
                          : `$${hotelMin.toLocaleString()} - $${hotelMax.toLocaleString()}`}
                      </p>
                    ) : (
                      <span className="text-on-light-tertiary text-xs">None added</span>
                    )}
                  </div>

                  {/* Events */}
                  <div className="py-3 border-t border-[rgba(194,85,56,0.06)]">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-accent text-[18px]">confirmation_number</span>
                        <span className="text-gray-dark text-sm font-semibold">Events Found</span>
                      </div>
                      <span className="font-semibold text-accent text-[24px]">{eventItems.length}</span>
                    </div>

                    {/* Category pills */}
                    {eventCategories.length > 0 && (() => {
                      const pillColors = ["bg-accent text-white", "bg-cyan text-gray-dark", "bg-accent-dark text-white"];
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
                              <p className="text-sm text-gray-dark font-semibold truncate">{ev.title}</p>
                              <p className="text-[11px] text-on-light-tertiary truncate">{ev.subtitle}</p>
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
                    <div className="py-3 border-t border-[rgba(194,85,56,0.06)]">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="material-symbols-outlined text-accent text-[18px]">interests</span>
                        <span className="text-gray-dark text-sm font-semibold">Your Interests</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {activityItems.slice(0, 4).map((act, j) => (
                          <span key={j} className="bg-page-bg text-gray-dark rounded-pill px-2.5 py-0.5 text-[10px] font-semibold border border-[rgba(194,85,56,0.08)]">
                            {act.title.length > 20 ? act.title.slice(0, 20) + "..." : act.title}
                          </span>
                        ))}
                        {activityItems.length > 4 && (
                          <span className="bg-page-bg text-on-light-tertiary rounded-pill px-2.5 py-0.5 text-[10px] font-semibold border border-[rgba(194,85,56,0.08)]">
                            +{activityItems.length - 4} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* CTA */}
                  <button
                    onClick={() => handleChoose(trip)}
                    className="mt-auto w-full bg-accent text-white rounded-[10px] px-5 py-3 text-[15px] font-semibold hover:bg-accent-light transition-colors flex items-center justify-center gap-2"
                  >
                    View Full Details
                    <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
