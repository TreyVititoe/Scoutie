"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";

type TripItem = {
  id: string;
  item_type: string;
  title: string;
  description: string;
  start_time: string | null;
  end_time: string | null;
  estimated_cost: number;
  location_name: string | null;
  rating: number | null;
};

type TripDay = {
  id: string;
  day_number: number;
  title: string;
  summary: string;
  estimated_cost: number;
  trip_items: TripItem[];
};

type SharedTrip = {
  id: string;
  title: string;
  summary: string;
  destination: string;
  tier: string;
  total_estimated_cost: number;
  start_date: string | null;
  end_date: string | null;
  trip_days: TripDay[];
};

const typeIcons: Record<string, string> = {
  flight: "FL",
  hotel: "HT",
  rental: "RN",
  activity: "AC",
  restaurant: "DI",
  event: "EV",
  transport: "TR",
  note: "NT",
};

export default function SharedTripPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [trip, setTrip] = useState<SharedTrip | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [activeDay, setActiveDay] = useState(1);
  const [forking, setForking] = useState(false);

  useEffect(() => {
    fetch(`/api/trips/shared?slug=${slug}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) {
          setError(true);
        } else {
          setTrip(data.trip);
        }
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [slug]);

  const handleFork = async () => {
    if (!trip || forking) return;
    setForking(true);

    try {
      const res = await fetch("/api/trips/fork", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tripId: trip.id }),
      });

      if (!res.ok) {
        setForking(false);
        return;
      }

      const data = await res.json();
      // Redirect to the forked trip's shared page so they can see it
      window.location.href = `/shared/${data.shareSlug}`;
    } catch {
      setForking(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-page-bg flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !trip) {
    return (
      <div className="min-h-screen bg-page-bg flex flex-col items-center justify-center px-4">
        <p className="text-2xl font-semibold text-gray-dark mb-3">Trip not found</p>
        <p className="text-on-light-secondary mb-6">This link may have expired or the trip was removed.</p>
        <Link
          href="/"
          className="px-6 py-3 rounded-[10px] bg-accent text-white font-semibold hover:bg-accent-light transition-colors"
        >
          Plan your own trip
        </Link>
      </div>
    );
  }

  const currentDay =
    trip.trip_days.find((d) => d.day_number === activeDay) || trip.trip_days[0];

  // Single-day trips (hand-curated from cart) render grouped by item type instead of as a timeline
  const isSingleDay = trip.trip_days.length === 1;
  const allItems = trip.trip_days.flatMap((d) => d.trip_items);
  const groupOrder: Array<{ key: string; label: string; icon: string }> = [
    { key: "flight", label: "Flights", icon: "flight" },
    { key: "hotel", label: "Stays", icon: "hotel" },
    { key: "event", label: "Events", icon: "event" },
    { key: "activity", label: "Activities", icon: "hiking" },
    { key: "restaurant", label: "Dining", icon: "restaurant" },
    { key: "rental", label: "Rentals", icon: "directions_car" },
    { key: "transport", label: "Transport", icon: "directions_transit" },
    { key: "note", label: "Notes", icon: "sticky_note_2" },
  ];
  const groupedItems = groupOrder
    .map((g) => ({ ...g, items: allItems.filter((it) => it.item_type === g.key) }))
    .filter((g) => g.items.length > 0);

  return (
    <div className="min-h-screen bg-page-bg">
      {/* Header */}
      <header className="nav-glass bg-black/80 backdrop-blur-xl sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-white text-[17px] font-semibold">
            Walter
          </Link>
          <Link
            href="/quiz"
            className="px-4 py-2 rounded-[10px] bg-accent text-white text-sm font-semibold hover:bg-accent-light transition-colors"
          >
            Plan your own trip
          </Link>
        </div>
      </header>

      {/* Trip hero */}
      <div className="bg-hero-gradient relative">
        <div className="hero-glow absolute inset-0 pointer-events-none" />
        <div className="relative z-10 max-w-5xl mx-auto px-6 pt-6 pb-10">
          {/* Badges */}
          <div className="flex items-center gap-2 mb-4">
            <span className="bg-cyan/20 text-cyan rounded-pill px-2.5 py-0.5 text-[11px] font-semibold">
              Shared trip
            </span>
            {trip.tier && (
              <span className="bg-white/10 text-on-dark-secondary rounded-pill px-2.5 py-0.5 text-[11px] font-semibold capitalize">
                {trip.tier}
              </span>
            )}
          </div>

          <h1 className="font-semibold text-[28px] sm:text-[36px] text-white leading-tight mb-2">
            {trip.title}
          </h1>
          <p className="text-on-dark-secondary max-w-2xl text-[15px] leading-relaxed">{trip.summary}</p>

          {/* Stats row */}
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3 mt-6">
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-cyan text-[18px]">location_on</span>
              <span className="font-semibold text-white text-sm">{trip.destination}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-cyan text-[18px]">schedule</span>
              <span className="font-semibold text-white text-sm">
                {isSingleDay ? `${allItems.length} items` : `${trip.trip_days.length} days`}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-cyan text-[18px]">payments</span>
              <span className="font-semibold text-cyan text-[17px]">${trip.total_estimated_cost.toLocaleString()}</span>
            </div>
            {trip.start_date && trip.end_date && (
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-cyan text-[18px]">calendar_today</span>
                <span className="font-semibold text-white text-sm">
                  {new Date(trip.start_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })} - {new Date(trip.end_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </span>
              </div>
            )}
          </div>

          {/* Fork button */}
          <button
            onClick={handleFork}
            disabled={forking}
            className="mt-6 bg-white/15 border border-white/20 text-white rounded-[10px] px-5 py-2.5 text-sm font-semibold hover:bg-white/25 transition-colors disabled:opacity-50 flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[16px]">content_copy</span>
            {forking ? "Forking..." : "Fork this trip"}
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8">
        {isSingleDay ? (
          /* Grouped-by-type view for hand-curated trips (no day plan) */
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="space-y-10"
          >
            {groupedItems.map((group) => (
              <section key={group.key}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="icon-gradient w-10 h-10 flex items-center justify-center">
                    <span className="material-symbols-outlined text-accent text-[20px]">{group.icon}</span>
                  </div>
                  <h2 className="font-semibold text-xl text-gray-dark">{group.label}</h2>
                  <span className="text-on-light-tertiary text-sm">
                    {group.items.length}
                  </span>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {group.items.map((item, i) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className="card-base overflow-hidden"
                    >
                      <div className="h-0.5 bg-gradient-to-r from-accent to-cyan" />
                      <div className="p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-sm text-gray-dark">{item.title}</p>
                            {item.description && (
                              <p className="text-xs mt-1 text-on-light-secondary line-clamp-2">{item.description}</p>
                            )}
                            {item.location_name && (
                              <p className="text-xs mt-1 text-on-light-tertiary truncate">{item.location_name}</p>
                            )}
                          </div>
                          <div className="text-right flex-shrink-0">
                            {item.estimated_cost > 0 && (
                              <p className="text-accent font-semibold text-sm">${item.estimated_cost}</p>
                            )}
                            {item.rating && (
                              <p className="text-on-light-tertiary text-xs mt-0.5">{item.rating}/5</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </section>
            ))}
          </motion.div>
        ) : (
          <>
            {/* Day selector */}
            <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide mb-8">
              {trip.trip_days.map((day) => (
                <button
                  key={day.day_number}
                  onClick={() => setActiveDay(day.day_number)}
                  className={`flex-shrink-0 px-5 py-3 rounded-[10px] font-medium transition-all ${
                    activeDay === day.day_number
                      ? "bg-accent text-white shadow-elevated"
                      : "card-base text-on-light-secondary hover:bg-white/80"
                  }`}
                >
                  <span className="block text-xs opacity-70">Day {day.day_number}</span>
                  <span className="block text-sm font-semibold">{day.title}</span>
                </button>
              ))}
            </div>

            {/* Day content */}
            {currentDay && (
              <motion.div
                key={activeDay}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="font-semibold text-2xl text-gray-dark">
                      Day {currentDay.day_number}: {currentDay.title}
                    </h2>
                    <p className="text-on-light-secondary mt-1">{currentDay.summary}</p>
                  </div>
                  <span className="text-accent font-semibold">
                    ~${currentDay.estimated_cost.toLocaleString()}
                  </span>
                </div>

                {/* Timeline */}
                <div className="relative pl-8">
                  <div className="absolute left-3 top-0 bottom-0 w-px bg-[rgba(0,101,113,0.08)]" />
                  <div className="space-y-4">
                    {currentDay.trip_items.map((item, i) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="relative card-base overflow-hidden"
                      >
                        <div className="h-0.5 bg-gradient-to-r from-accent to-cyan" />
                        <div className="p-4">
                        <div className="absolute -left-[1.4rem] top-6 w-3 h-3 rounded-full bg-accent border-2 border-page-bg" />
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="bg-[#e6f7f9] text-accent rounded-full px-2.5 py-0.5 text-[11px] font-semibold">
                                {item.item_type}
                              </span>
                              {item.start_time && (
                                <span className="text-on-light-tertiary text-[12px]">
                                  {item.start_time}
                                  {item.end_time && ` - ${item.end_time}`}
                                </span>
                              )}
                            </div>
                            <p className="font-semibold text-sm text-gray-dark">{item.title}</p>
                            <p className="text-xs mt-1 text-on-light-secondary">{item.description}</p>
                            {item.location_name && (
                              <p className="text-xs mt-1 text-on-light-tertiary">{item.location_name}</p>
                            )}
                          </div>
                          <div className="text-right flex-shrink-0">
                            {item.estimated_cost > 0 && (
                              <p className="text-accent font-semibold text-sm">${item.estimated_cost}</p>
                            )}
                            {item.rating && (
                              <p className="text-on-light-tertiary text-xs mt-0.5">{item.rating}/5</p>
                            )}
                          </div>
                        </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </>
        )}
      </div>

      {/* CTA */}
      <div className="bg-hero-gradient relative mt-10">
        <div className="hero-glow absolute inset-0 pointer-events-none" />
        <div className="relative z-10 max-w-5xl mx-auto px-6 py-16 text-center">
          <h2 className="font-semibold text-[28px] text-white mb-3">
            Want a trip like this?
          </h2>
          <p className="text-on-dark-secondary mb-8 max-w-md mx-auto">
            Take a 2-minute quiz and get a personalized itinerary built for you. Or fork this one and make it your own.
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link
              href="/quick"
              className="inline-flex px-8 py-4 rounded-[10px] bg-accent text-white font-semibold hover:bg-accent-light transition-colors items-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">bolt</span>
              Quick Plan
            </Link>
            <Link
              href="/quiz"
              className="inline-flex px-8 py-4 rounded-[10px] bg-white/15 border border-white/20 text-white font-semibold hover:bg-white/25 transition-colors items-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">tune</span>
              Design My Trip
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
