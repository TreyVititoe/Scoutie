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
  const [expandedTrip, setExpandedTrip] = useState<number | null>(null);

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
            Compare your trips
          </h1>
          <p className="text-on-light-secondary text-[17px]">
            {trips.length} trips side-by-side. Pick the one you love.
          </p>
        </motion.div>

        <div className={`grid gap-6 ${trips.length === 2 ? "grid-cols-1 lg:grid-cols-2" : "grid-cols-1 lg:grid-cols-3"}`}>
          {trips.map((trip, i) => {
            const isExpanded = expandedTrip === i;
            const flightItems = trip.items.filter((it) => it.type === "flight");
            const hotelItems = trip.items.filter((it) => it.type === "hotel");
            const eventItems = trip.items.filter((it) => it.type === "event");
            const activityItems = trip.items.filter(
              (it) => it.type === "activity" || it.type === "restaurant" || it.type === "site"
            );

            return (
              <motion.div
                key={trip.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.1 }}
                className="card-base overflow-hidden flex flex-col"
              >
                {/* Header */}
                <div className="bg-hero-gradient relative p-6 pb-8">
                  <div className="hero-glow absolute inset-0 pointer-events-none" />
                  <div className="relative z-10">
                    <h2 className="text-white text-[21px] font-semibold leading-card-title mb-1">
                      {trip.destination}
                    </h2>
                    <p className="text-on-dark-secondary text-sm">{trip.name}</p>
                  </div>
                </div>

                <div className="p-6 flex-1 flex flex-col">
                  {/* Total cost */}
                  <div className="flex items-center justify-between mb-4 pb-4 border-b border-[rgba(0,101,113,0.06)]">
                    <span className="text-on-light-secondary text-sm">Total cost</span>
                    <span className="text-accent text-[21px] font-semibold">
                      {trip.totalCost > 0 ? `$${trip.totalCost.toLocaleString()}` : "N/A"}
                    </span>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-4 gap-2 mb-4 pb-4 border-b border-[rgba(0,101,113,0.06)]">
                    <div className="text-center">
                      <p className="text-[17px] font-semibold text-gray-dark">{flightItems.length}</p>
                      <p className="text-[10px] text-on-light-tertiary">Flights</p>
                    </div>
                    <div className="text-center">
                      <p className="text-[17px] font-semibold text-gray-dark">{hotelItems.length}</p>
                      <p className="text-[10px] text-on-light-tertiary">Hotels</p>
                    </div>
                    <div className="text-center">
                      <p className="text-[17px] font-semibold text-gray-dark">{eventItems.length}</p>
                      <p className="text-[10px] text-on-light-tertiary">Events</p>
                    </div>
                    <div className="text-center">
                      <p className="text-[17px] font-semibold text-gray-dark">{activityItems.length}</p>
                      <p className="text-[10px] text-on-light-tertiary">Activities</p>
                    </div>
                  </div>

                  {/* Flights detail */}
                  {flightItems.length > 0 && (
                    <div className="mb-4 pb-4 border-b border-[rgba(0,101,113,0.06)]">
                      <p className="text-on-light-tertiary text-xs uppercase tracking-wider mb-2">Flights</p>
                      {flightItems.map((fl, j) => (
                        <p key={j} className="text-sm text-gray-dark mb-1 flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-accent text-[14px]">flight</span>
                          <span className="flex-1 truncate">{fl.title}</span>
                          {fl.price != null && (
                            <span className="text-on-light-tertiary">${fl.price}</span>
                          )}
                        </p>
                      ))}
                    </div>
                  )}

                  {/* Events */}
                  {eventItems.length > 0 && (
                    <div className="mb-4 pb-4 border-b border-[rgba(0,101,113,0.06)]">
                      <p className="text-on-light-tertiary text-xs uppercase tracking-wider mb-2">Events</p>
                      {eventItems.slice(0, 4).map((ev, j) => (
                        <p key={j} className="text-sm text-gray-dark mb-1 flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-accent text-[14px]">confirmation_number</span>
                          <span className="flex-1 truncate">{ev.title}</span>
                          {ev.price != null && ev.price > 0 && (
                            <span className="text-on-light-tertiary">${ev.price}</span>
                          )}
                        </p>
                      ))}
                      {eventItems.length > 4 && (
                        <p className="text-xs text-on-light-tertiary mt-1">+{eventItems.length - 4} more</p>
                      )}
                    </div>
                  )}

                  {/* All items expandable */}
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      transition={{ duration: 0.2 }}
                      className="mb-4 pb-4 border-b border-[rgba(0,101,113,0.06)]"
                    >
                      <p className="text-on-light-tertiary text-xs uppercase tracking-wider mb-3">All items</p>
                      <div className="space-y-1.5">
                        {trip.items.map((item, k) => (
                          <div key={k} className="flex items-center gap-2 text-sm bg-page-bg rounded-[8px] px-3 py-2">
                            <span className="bg-[#e6f7f9] text-accent rounded-pill px-1.5 py-0.5 text-[9px] font-semibold uppercase">
                              {item.type}
                            </span>
                            <span className="flex-1 truncate text-gray-dark">{item.title}</span>
                            {item.price != null && item.price > 0 && (
                              <span className="text-accent font-semibold text-xs">${item.price}</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {/* Actions */}
                  <div className="mt-auto pt-2 space-y-2">
                    <button
                      onClick={() => setExpandedTrip(isExpanded ? null : i)}
                      className="w-full text-center text-accent text-sm font-semibold hover:text-accent-light transition-colors py-1"
                    >
                      {isExpanded ? "Show less" : `View all ${trip.items.length} items`}
                    </button>
                    <button
                      onClick={() => handleChoose(trip)}
                      className="w-full bg-accent text-white rounded-[10px] px-5 py-3 text-[15px] font-semibold hover:bg-accent-light transition-colors flex items-center justify-center gap-2"
                    >
                      Choose this trip
                      <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
