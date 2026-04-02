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

const typeColors: Record<string, string> = {
  flight: "bg-sky-50 border-sky-200 text-sky-700",
  hotel: "bg-purple-50 border-purple-200 text-purple-700",
  rental: "bg-indigo-50 border-indigo-200 text-indigo-700",
  activity: "bg-primary-50 border-primary-200 text-primary-700",
  restaurant: "bg-amber-50 border-amber-200 text-amber-700",
  event: "bg-rose-50 border-rose-200 text-rose-700",
  transport: "bg-gray-50 border-gray-200 text-gray-700",
  note: "bg-stone-50 border-stone-200 text-stone-600",
};

export default function SharedTripPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [trip, setTrip] = useState<SharedTrip | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [activeDay, setActiveDay] = useState(1);

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

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !trip) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
        <p className="font-display text-2xl font-bold text-text mb-3">Trip not found</p>
        <p className="text-text-secondary mb-6">This link may have expired or the trip was removed.</p>
        <Link
          href="/"
          className="px-6 py-3 rounded-xl bg-primary text-white font-bold hover:bg-primary-dark transition-colors"
        >
          Plan your own trip
        </Link>
      </div>
    );
  }

  const currentDay =
    trip.trip_days.find((d) => d.day_number === activeDay) || trip.trip_days[0];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-surface border-b border-border sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="font-display font-bold text-xl text-text">
            walter
          </Link>
          <Link
            href="/quiz"
            className="px-4 py-2 rounded-xl bg-primary text-white text-sm font-bold hover:bg-primary-dark transition-colors"
          >
            Plan your own trip
          </Link>
        </div>
      </header>

      {/* Shared banner */}
      <div className="bg-primary-50 border-b border-primary-200">
        <div className="max-w-5xl mx-auto px-6 py-3 flex items-center gap-2">
          <span className="text-primary text-sm font-semibold">Shared trip</span>
          <span className="text-primary/60 text-sm">— Someone shared this itinerary with you</span>
        </div>
      </div>

      {/* Trip header */}
      <div className="bg-surface border-b border-border">
        <div className="max-w-5xl mx-auto px-6 py-8">
          <span
            className={`inline-block text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full mb-3 ${
              trip.tier === "budget"
                ? "bg-emerald-50 text-emerald-600"
                : trip.tier === "premium"
                ? "bg-amber-50 text-amber-600"
                : "bg-primary-50 text-primary-600"
            }`}
          >
            {trip.tier}
          </span>
          <h1 className="font-display font-bold text-3xl sm:text-4xl text-text mb-2">
            {trip.title}
          </h1>
          <p className="text-text-secondary max-w-2xl">{trip.summary}</p>
          <div className="flex items-center gap-6 mt-4">
            <div>
              <p className="text-xs text-text-muted uppercase tracking-wider">Destination</p>
              <p className="font-semibold text-text">{trip.destination}</p>
            </div>
            <div>
              <p className="text-xs text-text-muted uppercase tracking-wider">Duration</p>
              <p className="font-semibold text-text">{trip.trip_days.length} days</p>
            </div>
            <div>
              <p className="text-xs text-text-muted uppercase tracking-wider">Total cost</p>
              <p className="font-mono font-bold text-primary text-lg">
                ${trip.total_estimated_cost.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Day selector */}
        <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide mb-8">
          {trip.trip_days.map((day) => (
            <button
              key={day.day_number}
              onClick={() => setActiveDay(day.day_number)}
              className={`flex-shrink-0 px-5 py-3 rounded-xl font-medium transition-all ${
                activeDay === day.day_number
                  ? "bg-primary text-white shadow-md"
                  : "bg-surface border border-border text-text-secondary hover:border-primary-light"
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
                <h2 className="font-display font-bold text-2xl text-text">
                  Day {currentDay.day_number}: {currentDay.title}
                </h2>
                <p className="text-text-secondary mt-1">{currentDay.summary}</p>
              </div>
              <span className="font-mono font-bold text-text-secondary">
                ~${currentDay.estimated_cost.toLocaleString()}
              </span>
            </div>

            {/* Timeline */}
            <div className="relative pl-8">
              <div className="absolute left-3 top-0 bottom-0 w-px bg-border" />
              <div className="space-y-4">
                {currentDay.trip_items.map((item, i) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className={`relative border rounded-xl p-4 ${typeColors[item.item_type] || typeColors.note}`}
                  >
                    <div className="absolute -left-[1.4rem] top-5 w-3 h-3 rounded-full bg-primary border-2 border-surface" />
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-mono font-bold">{typeIcons[item.item_type] || "--"}</span>
                          {item.start_time && (
                            <span className="text-xs font-mono opacity-70">
                              {item.start_time}
                              {item.end_time && ` - ${item.end_time}`}
                            </span>
                          )}
                        </div>
                        <p className="font-semibold text-sm">{item.title}</p>
                        <p className="text-xs mt-1 opacity-80">{item.description}</p>
                        {item.location_name && (
                          <p className="text-xs mt-1 opacity-60">{item.location_name}</p>
                        )}
                      </div>
                      <div className="text-right flex-shrink-0">
                        {item.estimated_cost > 0 && (
                          <p className="font-mono font-bold text-sm">${item.estimated_cost}</p>
                        )}
                        {item.rating && (
                          <p className="text-xs opacity-70 mt-0.5">{item.rating}/5</p>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* CTA */}
      <div className="bg-primary mt-10">
        <div className="max-w-5xl mx-auto px-6 py-12 text-center">
          <h2 className="font-display font-bold text-2xl text-white mb-3">
            Want a trip like this?
          </h2>
          <p className="text-primary-200 mb-6">
            Take a 2-minute quiz and get a personalized itinerary built for you.
          </p>
          <Link
            href="/quiz"
            className="inline-flex px-8 py-4 rounded-xl bg-white text-primary font-bold hover:bg-primary-50 transition-colors"
          >
            Plan my trip
          </Link>
        </div>
      </div>
    </div>
  );
}
