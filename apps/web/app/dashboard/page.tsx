"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
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
      <div className="min-h-screen bg-gray-light flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const userName = user?.user_metadata?.name || user?.user_metadata?.full_name || "";

  return (
    <div className="min-h-screen bg-gray-light">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-20 nav-glass">
        <div className="max-w-content mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-white text-[17px] font-semibold">
            Walter
          </Link>
          <button
            onClick={handleSignOut}
            className="text-sm font-semibold text-on-dark-secondary hover:text-white transition-colors flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[18px]">logout</span>
            Sign out
          </button>
        </div>
      </header>

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
              className="bg-white rounded-[8px] p-6 transition-colors group"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-gray-light rounded-[8px] flex items-center justify-center">
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
                className="bg-white rounded-[8px] p-6 transition-colors"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-gray-light rounded-[8px] flex items-center justify-center">
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
            <div className="flex items-center gap-3 mb-6">
              <span className="material-symbols-outlined text-accent text-xl">luggage</span>
              <h2 className="text-[21px] font-semibold text-gray-dark">Your Trips</h2>
            </div>

            {trips.length === 0 ? (
              <div className="bg-white rounded-[8px] p-10 text-center">
                <span className="material-symbols-outlined text-on-light-tertiary text-3xl mb-3 block">explore</span>
                <p className="font-semibold text-gray-dark mb-1">No trips yet</p>
                <p className="text-on-light-secondary text-sm mb-6">
                  Start planning to see your saved trips here.
                </p>
                <Link
                  href="/quiz"
                  className="inline-flex bg-accent text-white rounded-[8px] px-6 py-3 font-semibold hover:bg-accent-light transition-colors"
                >
                  Plan your first trip
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {trips.map((trip) => (
                  <Link
                    key={trip.id}
                    href={`/trips/${trip.id}`}
                    className="bg-white rounded-[8px] p-5 block hover:shadow-elevated transition-shadow"
                  >
                    <h3 className="font-semibold text-gray-dark mb-1">
                      {trip.title || trip.destination}
                    </h3>
                    {trip.title && trip.destination && (
                      <p className="text-sm text-on-light-secondary">{trip.destination}</p>
                    )}
                    <p className="text-[12px] text-on-light-tertiary mt-3">
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
        </div>
      </main>
    </div>
  );
}
