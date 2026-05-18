"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { useQuizStore } from "@/lib/stores/quizStore";
import { useTripCartStore } from "@/lib/stores/tripCartStore";
import { getDestinationImage } from "@/lib/destinationImages";
import { SearchBar, type SearchValue } from "@/components/quiz/SearchBar";

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
  const [search, setSearch] = useState<SearchValue>({
    destination: store.destinations?.[0] || "",
    startDate: store.startDate || "",
    endDate: store.endDate || "",
    exactDates: true,
    flexDays: 0,
    adults: store.travelersCount && store.travelersCount > 0 ? store.travelersCount : 0,
    children: 0,
    infants: 0,
    pets: 0,
    description: "",
  });
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
    const travelers = Math.max(1, search.adults + search.children);
    localStorage.setItem(
      "walter_prefs",
      JSON.stringify({
        destinations: search.destination ? [search.destination] : [],
        destination: search.destination || "Surprise me",
        surpriseMe: !search.destination,
        startDate: search.startDate,
        endDate: search.endDate,
        exactDates: search.exactDates,
        flexDays: search.flexDays,
        travelersCount: travelers,
        travelers,
        adults: search.adults,
        children: search.children,
        infants: search.infants,
        pets: search.pets,
        description: search.description,
        budget: 2000,
        budgetAmount: 2000,
        activityInterests: [],
        vibes: [],
        accommodationTypes: ["hotel"],
      })
    );

    const shouldCompare = !search.destination || !search.startDate || !search.endDate;
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
      <section className="bg-hero-gradient relative pt-8 sm:pt-10 pb-20">
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

          <SearchBar value={search} onChange={setSearch} onSearch={handleSearch} />
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
