"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { useQuizStore } from "@/lib/stores/quizStore";
import { useTripCartStore } from "@/lib/stores/tripCartStore";
import { getDestinationImage } from "@/lib/destinationImages";

type CommunityTrip = {
  id: string;
  title: string;
  destination: string;
  total_estimated_cost: number;
  cover_image_url: string | null;
  upvote_count: number;
  share_slug: string;
  tier: string | null;
};

export default function QuizPage() {
  const router = useRouter();
  const store = useQuizStore();
  const [destination, setDestination] = useState(store.destinations?.[0] || "");
  const [startDate, setStartDate] = useState(store.startDate || "");
  const [endDate, setEndDate] = useState(store.endDate || "");
  const [travelers, setTravelers] = useState(store.travelersCount || 2);
  const [trips, setTrips] = useState<CommunityTrip[]>([]);
  const [tripsLoading, setTripsLoading] = useState(true);

  useEffect(() => {
    useTripCartStore.getState().clearCart();
    fetch("/api/trips/community")
      .then((r) => r.json())
      .then((d) => {
        setTrips(d.trips || []);
        setTripsLoading(false);
      })
      .catch(() => setTripsLoading(false));
  }, []);

  const handleSearch = () => {
    useTripCartStore.getState().clearCart();
    localStorage.setItem(
      "walter_prefs",
      JSON.stringify({
        destinations: destination ? [destination] : [],
        destination: destination || "Surprise me",
        surpriseMe: !destination,
        startDate,
        endDate,
        travelersCount: travelers,
        travelers,
        budget: 2000,
        budgetAmount: 2000,
        activityInterests: [],
        vibes: [],
        accommodationTypes: ["hotel"],
      })
    );

    const shouldCompare = !destination || !startDate || !endDate;
    router.push(shouldCompare ? "/compare" : "/results");
  };

  return (
    <div className="min-h-screen bg-page-bg">
      {/* Header */}
      <header className="sticky top-0 z-20 nav-glass">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <span className="w-7 h-7 rounded-[8px] bg-gradient-to-br from-cyan to-accent-light flex items-center justify-center shadow-[0_2px_10px_rgba(56,189,248,0.3)]">
              <span className="text-accent-deep text-[14px] font-black italic leading-none -mt-px">W</span>
            </span>
            <span className="text-white text-[16px] font-semibold tracking-tight">Walter</span>
          </Link>
          <button
            onClick={() => {
              store.resetQuiz();
              router.push("/");
            }}
            className="bg-white/15 border border-white/20 text-white rounded-pill px-4 py-1.5 text-[12px] font-semibold hover:bg-white/25 transition-colors"
          >
            Exit
          </button>
        </div>
      </header>

      {/* Hero search */}
      <section className="bg-hero-gradient relative overflow-hidden pt-8 sm:pt-10 pb-20">
        <div className="absolute inset-0 hero-radial opacity-50 pointer-events-none" />
        <div className="relative z-10 max-w-6xl mx-auto px-6 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-white text-[26px] sm:text-[34px] font-semibold tracking-display leading-[1.05] mb-2"
          >
            Where to next?
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
            className="text-white/75 text-[14px] sm:text-[15px] mb-6 max-w-xl mx-auto"
          >
            Tell Walter the basics, or fork a trip others have built.
          </motion.p>

          {/* Airbnb-style search pill */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.16 }}
            className="bg-white rounded-full shadow-[0_12px_40px_rgba(0,0,0,0.22)] flex items-stretch max-w-3xl mx-auto p-1.5"
          >
            <label className="flex-1 px-5 py-2.5 text-left rounded-full hover:bg-page-bg/60 transition-colors cursor-text min-w-0">
              <p className="text-[10px] uppercase tracking-wide text-on-light-tertiary font-bold mb-0.5">Where</p>
              <input
                type="text"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="Anywhere"
                className="w-full text-[15px] text-gray-dark placeholder:text-on-light-tertiary bg-transparent focus:outline-none truncate"
              />
            </label>
            <span aria-hidden="true" className="w-px bg-[rgba(91,141,239,0.1)] my-2.5" />
            <label className="flex-1 px-5 py-2.5 text-left rounded-full hover:bg-page-bg/60 transition-colors cursor-text min-w-0">
              <p className="text-[10px] uppercase tracking-wide text-on-light-tertiary font-bold mb-0.5">Check in</p>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full text-[15px] text-gray-dark bg-transparent focus:outline-none"
              />
            </label>
            <span aria-hidden="true" className="w-px bg-[rgba(91,141,239,0.1)] my-2.5" />
            <label className="flex-1 px-5 py-2.5 text-left rounded-full hover:bg-page-bg/60 transition-colors cursor-text min-w-0">
              <p className="text-[10px] uppercase tracking-wide text-on-light-tertiary font-bold mb-0.5">Check out</p>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full text-[15px] text-gray-dark bg-transparent focus:outline-none"
              />
            </label>
            <span aria-hidden="true" className="w-px bg-[rgba(91,141,239,0.1)] my-2.5" />
            <label className="flex-1 px-5 py-2.5 text-left rounded-full hover:bg-page-bg/60 transition-colors cursor-pointer min-w-0">
              <p className="text-[10px] uppercase tracking-wide text-on-light-tertiary font-bold mb-0.5">Who</p>
              <select
                value={travelers}
                onChange={(e) => setTravelers(Number(e.target.value))}
                className="w-full text-[15px] text-gray-dark bg-transparent focus:outline-none cursor-pointer"
              >
                <option value={1}>1 traveler</option>
                <option value={2}>2 travelers</option>
                <option value={3}>3 travelers</option>
                <option value={4}>4 travelers</option>
                <option value={5}>5+ travelers</option>
              </select>
            </label>
            <button
              onClick={handleSearch}
              className="bg-accent text-white rounded-full px-6 py-3 text-[14px] font-semibold hover:bg-accent-light transition-colors flex items-center gap-2 ml-1"
            >
              <span className="material-symbols-outlined text-[20px]">search</span>
              Search
            </button>
          </motion.div>
        </div>
      </section>

      {/* Suggestions */}
      <section className="bg-page-bg -mt-12 pb-16 relative z-10">
        <div className="px-4 sm:px-6 mb-5">
          <div className="flex items-end justify-between gap-4 flex-wrap">
            <div>
              <p className="text-accent text-[10px] uppercase tracking-[2.5px] font-semibold mb-1.5">
                Fan-voted favorites
              </p>
              <h2 className="text-[20px] sm:text-[24px] font-semibold text-gray-dark tracking-display leading-[1.1]">
                Trips others love
              </h2>
            </div>
            <p className="text-on-light-secondary text-[13px] max-w-md">
              Pick one to use as a starting point — fork it into your cart, then make it yours.
            </p>
          </div>
        </div>

        {tripsLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7 2xl:grid-cols-8 gap-2.5 sm:gap-3 px-2.5 sm:px-3">
            {Array.from({ length: 16 }).map((_, i) => (
              <div key={i} className="card-base overflow-hidden animate-pulse">
                <div className="h-24 bg-page-bg" />
                <div className="p-2.5 space-y-1.5">
                  <div className="h-3 bg-page-bg rounded w-2/3" />
                  <div className="h-2.5 bg-page-bg rounded w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : trips.length === 0 ? (
          <p className="text-on-light-secondary text-center py-12">
            No community trips yet — check back soon.
          </p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7 2xl:grid-cols-8 gap-2.5 sm:gap-3 px-2.5 sm:px-3">
            {[...trips]
              .sort((a, b) => b.upvote_count - a.upvote_count)
              .map((trip) => (
                <Link
                  key={trip.id}
                  href={`/shared/${trip.share_slug}`}
                  className="card-base overflow-hidden block group"
                >
                  <div className="relative h-24 overflow-hidden">
                    <img
                      src={trip.cover_image_url || getDestinationImage(trip.destination)}
                      alt={trip.destination}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {trip.tier && (
                      <span className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm text-accent rounded-pill px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide">
                        {trip.tier}
                      </span>
                    )}
                  </div>
                  <div className="p-2.5">
                    <p className="font-semibold text-[13px] text-gray-dark truncate leading-tight">
                      {trip.destination}
                    </p>
                    <p className="text-on-light-secondary text-[11px] mt-0.5 line-clamp-2 leading-snug min-h-[28px]">
                      {trip.title}
                    </p>
                    <div className="flex items-center justify-between pt-2 mt-2 border-t border-[rgba(91,141,239,0.05)]">
                      <span className="font-semibold text-accent text-[12px]">
                        ${trip.total_estimated_cost.toLocaleString()}
                      </span>
                      <span className="flex items-center gap-0.5 text-on-light-tertiary text-[11px]">
                        <span className="material-symbols-outlined text-[12px]">
                          arrow_upward
                        </span>
                        {trip.upvote_count}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
          </div>
        )}
      </section>
    </div>
  );
}
