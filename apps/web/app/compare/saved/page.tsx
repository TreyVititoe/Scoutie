"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";

type TripItem = {
  item_type: string;
  title: string;
  description: string;
  start_time: string | null;
  estimated_cost: number;
  location_name: string | null;
};

type TripDay = {
  day_number: number;
  title: string;
  summary: string;
  estimated_cost: number;
  trip_items: TripItem[];
};

type SavedTrip = {
  id: string;
  title: string;
  destination: string;
  tier: string | null;
  total_estimated_cost: number;
  start_date: string | null;
  end_date: string | null;
  share_slug: string;
  trip_days: TripDay[];
};

export default function CompareSavedPage() {
  const router = useRouter();
  const [trips, setTrips] = useState<SavedTrip[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedTrip, setExpandedTrip] = useState<number | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("walter_compare_ids");
    if (!stored) {
      router.push("/dashboard");
      return;
    }

    const ids: string[] = JSON.parse(stored);
    if (ids.length < 2) {
      router.push("/dashboard");
      return;
    }

    // Fetch each trip by its share slug via the shared API
    // We need to fetch by ID instead -- use a new approach
    Promise.all(
      ids.map((id) =>
        fetch(`/api/trips/shared?id=${id}`)
          .then((r) => r.json())
          .then((data) => data.trip as SavedTrip | null)
          .catch(() => null)
      )
    ).then((results) => {
      setTrips(results.filter(Boolean) as SavedTrip[]);
      setLoading(false);
    });
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-page-bg">
        <header className="fixed top-0 left-0 right-0 z-20 nav-glass">
          <div className="max-w-content mx-auto px-4 lg:px-8 py-4 flex items-center justify-between">
            <Link href="/" className="text-white text-[17px] font-semibold">Walter</Link>
          </div>
        </header>
        <div className="flex flex-col items-center justify-center min-h-screen">
          <div className="w-10 h-10 border-4 border-accent border-t-transparent rounded-full animate-spin mb-6" />
          <p className="text-[17px] font-semibold text-gray-dark">Loading your trips...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-page-bg">
      <header className="fixed top-0 left-0 right-0 z-20 nav-glass">
        <div className="max-w-content mx-auto px-4 lg:px-8 py-4 flex items-center justify-between">
          <Link href="/" className="text-white text-[17px] font-semibold">Walter</Link>
          <Link href="/dashboard" className="text-on-dark-secondary text-sm hover:text-white transition-colors flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            Dashboard
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
            Side-by-side comparison of {trips.length} trips. Pick the winner.
          </p>
        </motion.div>

        <div className={`grid gap-6 ${trips.length === 2 ? "grid-cols-1 lg:grid-cols-2" : "grid-cols-1 lg:grid-cols-3"}`}>
          {trips.map((trip, i) => {
            const isExpanded = expandedTrip === i;
            const dayCount = trip.trip_days?.length || 0;
            const eventItems = trip.trip_days?.flatMap((d) =>
              d.trip_items?.filter((it) => it.item_type === "event") || []
            ) || [];
            const activityItems = trip.trip_days?.flatMap((d) =>
              d.trip_items?.filter((it) => ["activity", "restaurant", "site"].includes(it.item_type)) || []
            ) || [];
            const flightItems = trip.trip_days?.flatMap((d) =>
              d.trip_items?.filter((it) => it.item_type === "flight") || []
            ) || [];

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
                    {trip.tier && (
                      <span className="bg-cyan/20 text-cyan rounded-pill px-2.5 py-0.5 text-[11px] font-semibold mb-3 inline-block">
                        {trip.tier.charAt(0).toUpperCase() + trip.tier.slice(1)}
                      </span>
                    )}
                    <h2 className="text-white text-[21px] font-semibold leading-card-title mb-1">
                      {trip.destination}
                    </h2>
                    <p className="text-on-dark-secondary text-sm">{trip.title}</p>
                  </div>
                </div>

                <div className="p-6 flex-1 flex flex-col">
                  {/* Cost */}
                  <div className="flex items-center justify-between mb-4 pb-4 border-b border-[rgba(0,101,113,0.06)]">
                    <span className="text-on-light-secondary text-sm">Total cost</span>
                    <span className="text-accent text-[21px] font-semibold">
                      ${trip.total_estimated_cost?.toLocaleString() || "N/A"}
                    </span>
                  </div>

                  {/* Quick stats */}
                  <div className="grid grid-cols-3 gap-3 mb-4 pb-4 border-b border-[rgba(0,101,113,0.06)]">
                    <div className="text-center">
                      <p className="text-[21px] font-semibold text-gray-dark">{dayCount}</p>
                      <p className="text-[11px] text-on-light-tertiary">Days</p>
                    </div>
                    <div className="text-center">
                      <p className="text-[21px] font-semibold text-gray-dark">{eventItems.length}</p>
                      <p className="text-[11px] text-on-light-tertiary">Events</p>
                    </div>
                    <div className="text-center">
                      <p className="text-[21px] font-semibold text-gray-dark">{activityItems.length}</p>
                      <p className="text-[11px] text-on-light-tertiary">Activities</p>
                    </div>
                  </div>

                  {/* Flights */}
                  {flightItems.length > 0 && (
                    <div className="mb-4 pb-4 border-b border-[rgba(0,101,113,0.06)]">
                      <p className="text-on-light-tertiary text-xs uppercase tracking-wider mb-2">Flights</p>
                      {flightItems.map((fl, j) => (
                        <p key={j} className="text-sm text-gray-dark mb-1 flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-accent text-[14px]">flight</span>
                          {fl.title}
                          {fl.estimated_cost > 0 && (
                            <span className="text-on-light-tertiary ml-auto">${fl.estimated_cost}</span>
                          )}
                        </p>
                      ))}
                    </div>
                  )}

                  {/* Top Events */}
                  {eventItems.length > 0 && (
                    <div className="mb-4 pb-4 border-b border-[rgba(0,101,113,0.06)]">
                      <p className="text-on-light-tertiary text-xs uppercase tracking-wider mb-2">Events</p>
                      {eventItems.slice(0, 3).map((ev, j) => (
                        <p key={j} className="text-sm text-gray-dark mb-1 flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-accent text-[14px]">confirmation_number</span>
                          {ev.title}
                        </p>
                      ))}
                      {eventItems.length > 3 && (
                        <p className="text-xs text-on-light-tertiary mt-1">+{eventItems.length - 3} more</p>
                      )}
                    </div>
                  )}

                  {/* Expandable day-by-day */}
                  {isExpanded && trip.trip_days && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      transition={{ duration: 0.2 }}
                      className="mb-4 pb-4 border-b border-[rgba(0,101,113,0.06)]"
                    >
                      <p className="text-on-light-tertiary text-xs uppercase tracking-wider mb-3">Day-by-day</p>
                      <div className="space-y-3">
                        {trip.trip_days.map((day) => (
                          <div key={day.day_number} className="bg-page-bg rounded-[10px] p-3">
                            <p className="text-sm font-semibold text-gray-dark mb-1">
                              Day {day.day_number}: {day.title}
                            </p>
                            <div className="space-y-1">
                              {day.trip_items?.slice(0, 3).map((item, k) => (
                                <p key={k} className="text-xs text-on-light-secondary flex items-center gap-1.5">
                                  <span className="text-on-light-tertiary">{item.start_time || ""}</span>
                                  {item.title}
                                  {item.estimated_cost > 0 && (
                                    <span className="text-on-light-tertiary ml-auto">${item.estimated_cost}</span>
                                  )}
                                </p>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {/* Actions */}
                  <div className="mt-auto pt-2 space-y-2">
                    {trip.trip_days && trip.trip_days.length > 0 && (
                      <button
                        onClick={() => setExpandedTrip(isExpanded ? null : i)}
                        className="w-full text-center text-accent text-sm font-semibold hover:text-accent-light transition-colors py-1"
                      >
                        {isExpanded ? "Show less" : "View day-by-day"}
                      </button>
                    )}
                    <Link
                      href={`/shared/${trip.share_slug}`}
                      className="w-full bg-accent text-white rounded-[10px] px-5 py-3 text-[15px] font-semibold hover:bg-accent-light transition-colors flex items-center justify-center gap-2"
                    >
                      View full trip
                      <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                    </Link>
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
