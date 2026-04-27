"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { motion } from "framer-motion";
import { useTripCartStore, selectItemCount } from "@/lib/stores/tripCartStore";
import type { User } from "@supabase/supabase-js";

type SavedTrip = {
  id: string;
  title: string;
  destination: string;
  total_estimated_cost: number;
  tier: string | null;
  share_slug: string;
  created_at: string;
};

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [trips, setTrips] = useState<SavedTrip[]>([]);
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [compareMode, setCompareMode] = useState(false);

  const cartItemCount = useTripCartStore(selectItemCount);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) {
        router.push("/auth/login");
        return;
      }
      setUser(data.user);

      const { data: savedTrips } = await supabase
        .from("trips")
        .select("id, title, destination, total_estimated_cost, tier, share_slug, created_at")
        .eq("user_id", data.user.id)
        .order("created_at", { ascending: false });

      setTrips(savedTrips || []);
      setLoading(false);
    });
  }, [router]);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
  };

  const toggleCompare = (tripId: string) => {
    setCompareIds((prev) =>
      prev.includes(tripId)
        ? prev.filter((id) => id !== tripId)
        : prev.length < 3
          ? [...prev, tripId]
          : prev
    );
  };

  const handleCompare = () => {
    if (compareIds.length < 2) return;
    // Store compare trip IDs and navigate
    localStorage.setItem("walter_compare_ids", JSON.stringify(compareIds));
    router.push("/compare/saved");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-page-bg flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const userName = user?.user_metadata?.name || user?.user_metadata?.full_name || "";

  return (
    <div className="min-h-screen bg-page-bg">
      <Navbar />

      <main className="max-w-content mx-auto px-6 pt-28 pb-16">
        <div>
          {/* Greeting */}
          <h1 className="font-semibold text-[28px] text-gray-dark leading-page mb-2">
            {userName ? `Welcome back, ${userName}` : "Welcome back"}
          </h1>
          <p className="text-on-light-secondary text-lg mb-10">
            {user?.email}
          </p>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-12">
            <Link
              href="/quiz"
              className="card-base p-6 transition-colors group"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 icon-gradient rounded-[8px] flex items-center justify-center">
                  <span className="material-symbols-outlined text-accent text-xl">add</span>
                </div>
                <h2 className="font-semibold text-[17px] text-gray-dark">Start New Trip</h2>
              </div>
              <p className="text-on-light-secondary text-sm">
                Take the quiz and build an AI-powered itinerary.
              </p>
            </Link>

            {cartItemCount > 0 && (
              <Link
                href="/results"
                className="card-base p-6 transition-colors"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 icon-gradient rounded-[8px] flex items-center justify-center">
                    <span className="material-symbols-outlined text-accent text-xl">shopping_cart</span>
                  </div>
                  <h2 className="font-semibold text-[17px] text-gray-dark">Continue Building</h2>
                </div>
                <p className="text-on-light-secondary text-sm">
                  You have {cartItemCount} item{cartItemCount !== 1 ? "s" : ""} in your trip cart.
                </p>
              </Link>
            )}
          </div>

          {/* Saved Trips */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-accent text-xl">luggage</span>
                <h2 className="text-[21px] font-semibold text-gray-dark">Your Trips</h2>
              </div>
              {trips.length >= 2 && (
                <button
                  onClick={() => {
                    setCompareMode(!compareMode);
                    if (compareMode) setCompareIds([]);
                  }}
                  className={`text-sm font-semibold flex items-center gap-1.5 transition-colors ${
                    compareMode
                      ? "text-accent"
                      : "text-on-light-secondary hover:text-accent"
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">compare_arrows</span>
                  {compareMode ? "Cancel" : "Compare trips"}
                </button>
              )}
            </div>

            {/* Compare bar */}
            {compareMode && compareIds.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="card-base p-4 mb-6 flex items-center justify-between"
              >
                <p className="text-sm text-on-light-secondary">
                  {compareIds.length} trip{compareIds.length !== 1 ? "s" : ""} selected
                  <span className="text-on-light-tertiary ml-1">(select 2-3)</span>
                </p>
                <button
                  onClick={handleCompare}
                  disabled={compareIds.length < 2}
                  className="bg-accent text-white rounded-[10px] px-5 py-2 text-sm font-semibold hover:bg-accent-light transition-colors disabled:opacity-40"
                >
                  Compare
                </button>
              </motion.div>
            )}

            {trips.length === 0 ? (
              <div className="card-base p-10 text-center">
                <span className="material-symbols-outlined text-on-light-tertiary text-3xl mb-3 block">explore</span>
                <p className="font-semibold text-gray-dark mb-1">No trips yet</p>
                <p className="text-on-light-secondary text-sm mb-6">
                  Start planning to see your saved trips here.
                </p>
                <Link
                  href="/quiz"
                  className="inline-flex bg-accent text-white rounded-[10px] px-6 py-3 font-semibold hover:bg-accent-light transition-colors"
                >
                  Plan your first trip
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {trips.map((trip) => {
                  const isSelected = compareIds.includes(trip.id);
                  return (
                    <motion.div
                      key={trip.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="relative"
                    >
                      {compareMode && (
                        <button
                          onClick={() => toggleCompare(trip.id)}
                          className={`absolute top-4 right-4 z-10 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                            isSelected
                              ? "bg-accent border-accent text-white"
                              : "border-on-light-tertiary text-transparent hover:border-accent"
                          }`}
                        >
                          {isSelected && (
                            <span className="material-symbols-outlined text-[14px]">check</span>
                          )}
                        </button>
                      )}
                      <Link
                        href={`/shared/${trip.share_slug}`}
                        className={`card-base p-5 block transition-all ${
                          compareMode && isSelected ? "ring-2 ring-accent" : ""
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-semibold text-gray-dark pr-8">
                            {trip.title || trip.destination}
                          </h3>
                          {trip.tier && (
                            <span className="bg-[#e6f7f9] text-accent rounded-pill px-2 py-0.5 text-[10px] font-semibold flex-shrink-0">
                              {trip.tier.charAt(0).toUpperCase() + trip.tier.slice(1)}
                            </span>
                          )}
                        </div>
                        {trip.title && trip.destination && (
                          <p className="text-sm text-on-light-secondary mb-2">{trip.destination}</p>
                        )}
                        <div className="flex items-center justify-between mt-3 pt-3 border-t border-[rgba(0,101,113,0.06)]">
                          {trip.total_estimated_cost > 0 && (
                            <span className="font-semibold text-accent">
                              ${trip.total_estimated_cost.toLocaleString()}
                            </span>
                          )}
                          <span className="text-[12px] text-on-light-tertiary">
                            {new Date(trip.created_at).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </span>
                        </div>
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
