"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { motion } from "framer-motion";
import Link from "next/link";
import { useTripCartStore, selectItemCount } from "@/lib/stores/tripCartStore";
import type { User } from "@supabase/supabase-js";

type SavedTrip = {
  id: string;
  title: string;
  destination: string;
  created_at: string;
};

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [trips, setTrips] = useState<SavedTrip[]>([]);

  const cartItemCount = useTripCartStore(selectItemCount);

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
        .select("id, title, destination, created_at")
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

  const userName = user?.user_metadata?.name || user?.user_metadata?.full_name || "";

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-20 bg-white/70 backdrop-blur-xl shadow-xl shadow-teal-900/5">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="font-headline font-black italic text-2xl text-teal-700">
            Walter
          </Link>
          <button
            onClick={handleSignOut}
            className="text-sm font-bold font-body text-outline-variant hover:text-on-surface transition-colors flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[18px]">logout</span>
            Sign out
          </button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 pt-28 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Greeting */}
          <h1 className="font-headline font-extrabold text-4xl text-on-surface mb-2 tracking-tight">
            {userName ? `Welcome back, ${userName}` : "Welcome back"}
          </h1>
          <p className="text-on-surface-variant text-lg font-body mb-10">
            {user?.email}
          </p>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-12">
            <Link
              href="/quiz"
              className="card-3d rounded-[2rem] p-6 bg-primary hover:bg-primary/90 transition-colors group"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center">
                  <span className="material-symbols-outlined text-white text-xl">add</span>
                </div>
                <h2 className="font-headline text-lg font-bold text-white">Start New Trip</h2>
              </div>
              <p className="text-white/70 text-sm font-body">
                Take the quiz and build an AI-powered itinerary.
              </p>
            </Link>

            {cartItemCount > 0 && (
              <Link
                href="/results"
                className="card-3d rounded-[2rem] p-6 bg-secondary-container hover:bg-secondary-container/80 transition-colors"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-2xl bg-on-secondary-container/10 flex items-center justify-center">
                    <span className="material-symbols-outlined text-on-secondary-container text-xl">shopping_cart</span>
                  </div>
                  <h2 className="font-headline text-lg font-bold text-on-secondary-container">Continue Building</h2>
                </div>
                <p className="text-on-secondary-container/70 text-sm font-body">
                  You have {cartItemCount} item{cartItemCount !== 1 ? "s" : ""} in your trip cart.
                </p>
              </Link>
            )}
          </div>

          {/* Saved Trips */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-2xl bg-teal-50 flex items-center justify-center">
                <span className="material-symbols-outlined text-teal-600 text-xl">luggage</span>
              </div>
              <div>
                <h2 className="font-headline text-xl font-bold text-on-surface">Your Trips</h2>
                <p className="text-[10px] uppercase tracking-widest text-outline-variant font-bold font-body">
                  {trips.length > 0
                    ? `${trips.length} saved trip${trips.length !== 1 ? "s" : ""}`
                    : "No trips saved yet"}
                </p>
              </div>
            </div>

            {trips.length === 0 ? (
              <div className="card-3d rounded-[2rem] p-10 text-center">
                <span className="material-symbols-outlined text-outline-variant text-3xl mb-3 block">explore</span>
                <p className="font-headline font-bold text-on-surface mb-1">No trips yet</p>
                <p className="text-on-surface-variant font-body text-sm mb-6">
                  Start planning to see your saved trips here.
                </p>
                <Link
                  href="/quiz"
                  className="inline-flex px-6 py-3 rounded-full bg-primary text-white font-bold font-body hover:bg-primary/90 transition-colors"
                >
                  Plan your first trip
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {trips.map((trip, i) => (
                  <motion.div
                    key={trip.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 * i, duration: 0.3 }}
                  >
                    <Link
                      href={`/trips/${trip.id}`}
                      className="card-3d rounded-[2rem] p-5 block hover:shadow-lg transition-shadow"
                    >
                      <h3 className="font-headline font-bold text-on-surface mb-1">
                        {trip.title || trip.destination}
                      </h3>
                      {trip.title && trip.destination && (
                        <p className="text-sm text-on-surface-variant font-body">{trip.destination}</p>
                      )}
                      <p className="text-xs text-outline-variant font-body mt-3">
                        {new Date(trip.created_at).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </p>
                    </Link>
                  </motion.div>
                ))}
              </div>
            )}
          </section>
        </motion.div>
      </main>
    </div>
  );
}
