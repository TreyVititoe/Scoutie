"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { motion } from "framer-motion";
import Link from "next/link";
import type { User } from "@supabase/supabase-js";

type SavedTrip = {
  id: string;
  title: string;
  destination: string;
  tier: string;
  total_estimated_cost: number;
  share_slug: string;
  status: string;
  created_at: string;
};

const tierColors: Record<string, string> = {
  budget: "bg-emerald-50 text-emerald-600",
  balanced: "bg-primary-50 text-primary-600",
  premium: "bg-amber-50 text-amber-600",
};

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [trips, setTrips] = useState<SavedTrip[]>([]);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) {
        router.push("/auth/login");
        return;
      }
      setUser(data.user);

      // Fetch saved trips
      const { data: savedTrips } = await supabase
        .from("trips")
        .select("id, title, destination, tier, total_estimated_cost, share_slug, status, created_at")
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

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-surface border-b border-border sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="font-display font-bold text-xl text-text">walter</Link>
          <div className="flex items-center gap-4">
            <span className="text-sm text-text-secondary">{user?.email}</span>
            <button
              onClick={handleSignOut}
              className="text-sm font-semibold text-text-muted hover:text-text transition-colors"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="font-display font-bold text-3xl text-text mb-2">
            Welcome back{user?.user_metadata?.name ? `, ${user.user_metadata.name}` : ""}
          </h1>
          <p className="text-text-secondary mb-10">
            Here are your saved trips and preferences.
          </p>

          {/* Quick actions */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
            <Link
              href="/quiz"
              className="bg-primary rounded-2xl p-6 text-white hover:bg-primary-dark transition-colors"
            >
              <p className="font-display font-bold text-lg mb-1">Plan a new trip</p>
              <p className="text-primary-200 text-sm">Take the quiz and get AI-powered itineraries.</p>
            </Link>
            <div className="bg-surface rounded-2xl border border-border p-6">
              <p className="font-display font-bold text-lg text-text mb-1">Saved trips</p>
              <p className="text-text-secondary text-sm">
                {trips.length > 0 ? `${trips.length} trip${trips.length > 1 ? "s" : ""} saved` : "You haven't saved any trips yet."}
              </p>
            </div>
            <div className="bg-surface rounded-2xl border border-border p-6">
              <p className="font-display font-bold text-lg text-text mb-1">Preferences</p>
              <p className="text-text-secondary text-sm">Set your home airport, dietary needs, and more.</p>
            </div>
          </div>

          {/* Trips */}
          <section>
            <h2 className="font-display font-bold text-xl text-text mb-4">Your trips</h2>
            {trips.length === 0 ? (
              <div className="bg-surface rounded-2xl border border-border p-10 text-center">
                <div className="w-12 h-12 rounded-full bg-primary-50 flex items-center justify-center mx-auto mb-4"><svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg></div>
                <p className="font-display font-bold text-lg text-text mb-2">No trips yet</p>
                <p className="text-text-secondary mb-6">
                  Take the quiz to generate your first AI-powered trip itinerary.
                </p>
                <Link
                  href="/quiz"
                  className="inline-flex px-6 py-3 rounded-xl bg-primary text-white font-bold hover:bg-primary-dark transition-colors"
                >
                  Plan your first trip
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {trips.map((trip) => (
                  <Link
                    key={trip.id}
                    href={`/shared/${trip.share_slug}`}
                    className="bg-surface rounded-2xl border border-border p-5 hover:shadow-lg hover:border-primary-light transition-all"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span
                        className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${tierColors[trip.tier] || tierColors.balanced}`}
                      >
                        {trip.tier}
                      </span>
                      <span className="font-mono font-bold text-primary">
                        ${trip.total_estimated_cost.toLocaleString()}
                      </span>
                    </div>
                    <h3 className="font-display font-bold text-text mb-1">{trip.title}</h3>
                    <p className="text-sm text-text-secondary">{trip.destination}</p>
                    <p className="text-xs text-text-muted mt-3">
                      {new Date(trip.created_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                  </Link>
                ))}
              </div>
            )}
          </section>
        </motion.div>
      </main>
    </div>
  );
}
