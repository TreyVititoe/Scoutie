"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";

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

const UPVOTES_KEY = "walter_upvotes";

function getUpvotedIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(UPVOTES_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveUpvotedIds(ids: string[]) {
  localStorage.setItem(UPVOTES_KEY, JSON.stringify(ids));
}

export default function CommunityTrips() {
  const [trips, setTrips] = useState<CommunityTrip[]>([]);
  const [loading, setLoading] = useState(true);
  const [upvotedIds, setUpvotedIds] = useState<string[]>([]);

  useEffect(() => {
    setUpvotedIds(getUpvotedIds());

    fetch("/api/trips/community")
      .then((res) => res.json())
      .then((data) => {
        setTrips(data.trips || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleUpvote = async (e: React.MouseEvent, tripId: string) => {
    e.preventDefault();
    e.stopPropagation();

    if (upvotedIds.includes(tripId)) return;

    try {
      const res = await fetch("/api/trips/upvote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tripId }),
      });

      if (!res.ok) return;

      const data = await res.json();

      setTrips((prev) =>
        prev.map((t) =>
          t.id === tripId ? { ...t, upvote_count: data.upvoteCount } : t
        )
      );

      const newIds = [...upvotedIds, tripId];
      setUpvotedIds(newIds);
      saveUpvotedIds(newIds);
    } catch {
      // Silently fail
    }
  };

  if (!loading && trips.length === 0) return null;

  return (
    <section className="bg-hero-gradient relative py-20 overflow-hidden">
      <div className="absolute inset-0 hero-radial pointer-events-none opacity-50" />
      <div className="max-w-6xl mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.3 }}
          className="text-center mb-12"
        >
          <h2 className="text-[32px] font-semibold text-white">
            Trips the community loves
          </h2>
          <p className="text-white/70 text-lg mt-3 max-w-2xl mx-auto">
            Real trips built by real travelers. Upvote your favorites or fork
            one to make it your own.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading
            ? Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="card-base overflow-hidden animate-pulse">
                  <div className="h-40 bg-page-bg" />
                  <div className="p-5 space-y-3">
                    <div className="h-4 bg-page-bg rounded w-2/3" />
                    <div className="h-3 bg-page-bg rounded w-full" />
                    <div className="h-3 bg-page-bg rounded w-1/2" />
                  </div>
                </div>
              ))
            : [...trips]
                .sort((a, b) => b.upvote_count - a.upvote_count)
                .slice(0, 3)
                .map((trip) => {
                const isUpvoted = upvotedIds.includes(trip.id);
                return (
                  <motion.div
                    key={trip.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3 }}
                  >
                    <Link
                      href={`/shared/${trip.share_slug}`}
                      className="card-base overflow-hidden block"
                    >
                      <div className="relative h-40">
                        {trip.cover_image_url ? (
                          <img
                            src={trip.cover_image_url}
                            alt={trip.destination}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-accent-dark to-accent-deep flex items-center justify-center">
                            <span className="material-symbols-outlined text-cyan/30 text-4xl">
                              travel_explore
                            </span>
                          </div>
                        )}
                        {trip.tier && (
                          <span className="absolute bottom-3 left-3 bg-[#FFF2D9] text-accent rounded-pill px-2.5 py-0.5 text-[11px] font-semibold">
                            {trip.tier.charAt(0).toUpperCase() + trip.tier.slice(1)}
                          </span>
                        )}
                      </div>
                      <div className="p-5">
                        <p className="font-semibold text-[17px] text-gray-dark">
                          {trip.destination}
                        </p>
                        <p className="text-on-light-secondary text-sm mt-1 line-clamp-2">
                          {trip.title}
                        </p>
                        <div className="flex items-center justify-between pt-3 mt-3 border-t border-[rgba(194,85,56,0.06)]">
                          <span className="font-semibold text-accent">
                            ${trip.total_estimated_cost.toLocaleString()}
                          </span>
                          <button
                            onClick={(e) => handleUpvote(e, trip.id)}
                            className={`flex items-center gap-1.5 rounded-[10px] px-3 py-1.5 text-sm font-semibold transition-colors ${
                              isUpvoted
                                ? "bg-accent text-white"
                                : "border border-accent text-accent hover:bg-accent/5"
                            }`}
                          >
                            <span className="material-symbols-outlined text-[16px]">
                              arrow_upward
                            </span>
                            {trip.upvote_count}
                          </button>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
        </div>
      </div>
    </section>
  );
}
