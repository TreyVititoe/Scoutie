"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";

type TripDay = {
  dayNumber: number;
  title: string;
  items: {
    itemType: string;
    title: string;
    description: string;
    startTime: string;
    estimatedCost: number;
    locationName: string;
  }[];
};

type CompareTrip = {
  destination: string;
  title: string;
  summary: string;
  totalEstimatedCost: number;
  flightEstimate: number;
  hotelEstimatePerNight: number;
  topEvents: string[];
  highlights: string[];
  bestTimeToVisit: string;
  days: TripDay[];
};

export default function ComparePage() {
  const router = useRouter();
  const [trips, setTrips] = useState<CompareTrip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedTrip, setExpandedTrip] = useState<number | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("walter_prefs");
    if (!stored) {
      router.push("/quiz");
      return;
    }

    const quizData = JSON.parse(stored);

    fetch("/api/compare", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(quizData),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
        } else {
          setTrips(data.trips || []);
        }
      })
      .catch(() => setError("Failed to generate trip options. Please try again."))
      .finally(() => setLoading(false));
  }, [router]);

  const handleSelectTrip = (trip: CompareTrip) => {
    // Store the selected destination and route to the results/cart builder
    const stored = localStorage.getItem("walter_prefs");
    if (stored) {
      const prefs = JSON.parse(stored);
      prefs.destinations = [trip.destination];
      prefs.destination = trip.destination;
      prefs.surpriseMe = false;
      localStorage.setItem("walter_prefs", JSON.stringify(prefs));
    }
    router.push("/results");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-page-bg">
        <header className="fixed top-0 left-0 right-0 z-20 nav-glass">
          <div className="max-w-content mx-auto px-4 lg:px-8 py-4 flex items-center justify-between">
            <Link href="/" className="text-white text-[17px] font-semibold">Walter</Link>
            <Link href="/quiz" className="text-accent-light text-sm hover:underline flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[18px]">edit</span>
              Edit trip
            </Link>
          </div>
        </header>

        <div className="flex flex-col items-center justify-center min-h-screen px-6 pt-[48px]">
          <div className="w-10 h-10 border-4 border-accent border-t-transparent rounded-full animate-spin mb-6" />
          <p className="text-[17px] font-semibold text-gray-dark mb-2">Walter is planning your options...</p>
          <p className="text-on-light-secondary text-sm">Comparing destinations, flights, and events</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-page-bg">
        <header className="fixed top-0 left-0 right-0 z-20 nav-glass">
          <div className="max-w-content mx-auto px-4 lg:px-8 py-4 flex items-center justify-between">
            <Link href="/" className="text-white text-[17px] font-semibold">Walter</Link>
          </div>
        </header>

        <div className="flex flex-col items-center justify-center min-h-screen px-6 pt-[48px]">
          <span className="material-symbols-outlined text-on-light-tertiary text-4xl mb-4">error_outline</span>
          <p className="font-semibold text-gray-dark mb-2">Something went wrong</p>
          <p className="text-on-light-secondary text-sm mb-6">{error}</p>
          <button
            onClick={() => router.push("/quiz")}
            className="bg-accent text-white rounded-[10px] px-6 py-3 font-semibold hover:bg-accent-light transition-colors"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-page-bg">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-20 nav-glass">
        <div className="max-w-content mx-auto px-4 lg:px-8 py-4 flex items-center justify-between">
          <Link href="/" className="text-white text-[17px] font-semibold">Walter</Link>
          <Link href="/quiz" className="text-accent-light text-sm hover:underline flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[18px]">edit</span>
            Edit preferences
          </Link>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 lg:px-8 pt-28 pb-16">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <h1 className="text-[28px] font-semibold text-gray-dark leading-page mb-3">
            Compare your options
          </h1>
          <p className="text-on-light-secondary text-[17px]">
            Walter found {trips.length} trip options for you. Compare them and pick your favorite.
          </p>
        </motion.div>

        {/* Comparison Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
          {trips.map((trip, i) => {
            const isExpanded = expandedTrip === i;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.1 }}
                className="card-base overflow-hidden flex flex-col"
              >
                {/* Header gradient */}
                <div className="bg-hero-gradient relative p-6 pb-8">
                  <div className="hero-glow absolute inset-0 pointer-events-none" />
                  <div className="relative z-10">
                    <p className="text-cyan text-[11px] font-semibold uppercase tracking-wider mb-2">
                      Option {i + 1}
                    </p>
                    <h2 className="text-white text-[21px] font-semibold leading-card-title mb-2">
                      {trip.destination}
                    </h2>
                    <p className="text-on-dark-secondary text-sm leading-relaxed">
                      {trip.summary}
                    </p>
                  </div>
                </div>

                {/* Key Metrics */}
                <div className="p-6 flex-1 flex flex-col">
                  {/* Price */}
                  <div className="flex items-center justify-between mb-4 pb-4 border-b border-[rgba(0,101,113,0.06)]">
                    <span className="text-on-light-secondary text-sm">Total estimated cost</span>
                    <span className="text-accent text-[21px] font-semibold">
                      ${trip.totalEstimatedCost.toLocaleString()}
                    </span>
                  </div>

                  {/* Flight & Hotel */}
                  <div className="grid grid-cols-2 gap-4 mb-4 pb-4 border-b border-[rgba(0,101,113,0.06)]">
                    <div>
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="material-symbols-outlined text-accent text-[16px]">flight</span>
                        <span className="text-on-light-tertiary text-xs">Flights</span>
                      </div>
                      <p className="font-semibold text-gray-dark">
                        ~${trip.flightEstimate?.toLocaleString() || "N/A"}
                      </p>
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="material-symbols-outlined text-accent text-[16px]">hotel</span>
                        <span className="text-on-light-tertiary text-xs">Per night</span>
                      </div>
                      <p className="font-semibold text-gray-dark">
                        ~${trip.hotelEstimatePerNight?.toLocaleString() || "N/A"}
                      </p>
                    </div>
                  </div>

                  {/* Highlights */}
                  <div className="mb-4 pb-4 border-b border-[rgba(0,101,113,0.06)]">
                    <p className="text-on-light-tertiary text-xs uppercase tracking-wider mb-2">Highlights</p>
                    <div className="flex flex-wrap gap-1.5">
                      {trip.highlights?.slice(0, 3).map((h, j) => (
                        <span key={j} className="bg-[#e6f7f9] text-accent rounded-pill px-2.5 py-0.5 text-[11px] font-semibold">
                          {h}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Top Events */}
                  <div className="mb-4 pb-4 border-b border-[rgba(0,101,113,0.06)]">
                    <p className="text-on-light-tertiary text-xs uppercase tracking-wider mb-2">Events & Activities</p>
                    <ul className="space-y-1.5">
                      {trip.topEvents?.slice(0, 3).map((ev, j) => (
                        <li key={j} className="flex items-start gap-2 text-sm text-gray-dark">
                          <span className="material-symbols-outlined text-accent text-[14px] mt-0.5">check_circle</span>
                          {ev}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Trip Duration */}
                  <div className="flex items-center gap-2 mb-4">
                    <span className="material-symbols-outlined text-accent text-[16px]">schedule</span>
                    <span className="text-sm text-on-light-secondary">
                      {trip.days?.length || 0} days
                    </span>
                    {trip.bestTimeToVisit && (
                      <>
                        <span className="text-on-light-tertiary">|</span>
                        <span className="text-sm text-on-light-secondary">{trip.bestTimeToVisit}</span>
                      </>
                    )}
                  </div>

                  {/* Expandable Day-by-Day Preview */}
                  {isExpanded && trip.days && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      transition={{ duration: 0.2 }}
                      className="mb-4 pb-4 border-b border-[rgba(0,101,113,0.06)]"
                    >
                      <p className="text-on-light-tertiary text-xs uppercase tracking-wider mb-3">Day-by-day preview</p>
                      <div className="space-y-3">
                        {trip.days.map((day) => (
                          <div key={day.dayNumber} className="bg-page-bg rounded-[10px] p-3">
                            <p className="text-sm font-semibold text-gray-dark mb-1">
                              Day {day.dayNumber}: {day.title}
                            </p>
                            <div className="space-y-1">
                              {day.items?.slice(0, 3).map((item, k) => (
                                <p key={k} className="text-xs text-on-light-secondary flex items-center gap-1.5">
                                  <span className="text-on-light-tertiary">{item.startTime}</span>
                                  {item.title}
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
                    <button
                      onClick={() => setExpandedTrip(isExpanded ? null : i)}
                      className="w-full text-center text-accent text-sm font-semibold hover:text-accent-light transition-colors py-1"
                    >
                      {isExpanded ? "Show less" : "View day-by-day"}
                    </button>
                    <button
                      onClick={() => handleSelectTrip(trip)}
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
