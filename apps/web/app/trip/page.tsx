"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

type TripItem = {
  itemType: string;
  title: string;
  description: string;
  startTime: string | null;
  endTime: string | null;
  durationMinutes: number | null;
  estimatedCost: number;
  locationName: string;
  rating: number | null;
};

type TripDay = {
  dayNumber: number;
  title: string;
  summary: string;
  estimatedCost: number;
  items: TripItem[];
};

type Trip = {
  tier: string;
  title: string;
  summary: string;
  destination: string;
  totalEstimatedCost: number;
  days: TripDay[];
};

const typeIcons: Record<string, string> = {
  flight: "✈️",
  hotel: "🏨",
  rental: "🏠",
  activity: "🎯",
  restaurant: "🍽️",
  event: "🎫",
  transport: "🚗",
  note: "📝",
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

export default function TripDetailPageWrapper() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background flex items-center justify-center"><div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>}>
      <TripDetailPage />
    </Suspense>
  );
}

function TripDetailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tier = searchParams.get("tier") || "balanced";
  const [trip, setTrip] = useState<Trip | null>(null);
  const [activeDay, setActiveDay] = useState(1);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [shareSlug, setShareSlug] = useState<string | null>(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [refining, setRefining] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("scoutie_trips");
    if (!stored) {
      router.push("/results");
      return;
    }
    const data = JSON.parse(stored);
    const trips: Trip[] = data.trips || [];
    const match = trips.find((t) => t.tier === tier) || trips[0];
    if (match) setTrip(match);
  }, [tier, router]);

  const handleSave = async () => {
    if (!trip || saving) return;
    setSaving(true);

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      // Store intent, redirect to login
      localStorage.setItem("scoutie_save_after_login", tier);
      router.push("/auth/login");
      return;
    }

    try {
      const storedPrefs = localStorage.getItem("scoutie_prefs");
      const quizData = storedPrefs ? JSON.parse(storedPrefs) : {};

      const res = await fetch("/api/trips/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trip, quizData }),
      });

      const data = await res.json();
      if (data.shareSlug) {
        setSaved(true);
        setShareSlug(data.shareSlug);
      }
    } catch (err) {
      console.error("[save]", err);
    } finally {
      setSaving(false);
    }
  };

  const handleShare = async () => {
    if (!shareSlug) return;
    const url = `${window.location.origin}/shared/${shareSlug}`;
    await navigator.clipboard.writeText(url);
  };

  const handleRefine = async () => {
    if (!chatInput.trim() || !trip || refining) return;
    setRefining(true);

    try {
      const storedPrefs = localStorage.getItem("scoutie_prefs");
      const quizData = storedPrefs ? JSON.parse(storedPrefs) : {};

      const res = await fetch("/api/trips/refine", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: chatInput, trip, quizData }),
      });

      const data = await res.json();
      if (data.trip) {
        setTrip(data.trip);
        // Update localStorage so it persists
        const stored = localStorage.getItem("scoutie_trips");
        if (stored) {
          const allData = JSON.parse(stored);
          const trips: Trip[] = allData.trips || [];
          const idx = trips.findIndex((t) => t.tier === tier);
          if (idx >= 0) {
            trips[idx] = data.trip;
            localStorage.setItem("scoutie_trips", JSON.stringify({ ...allData, trips }));
          }
        }
        setChatInput("");
        setSaved(false);
        setShareSlug(null);
      }
    } catch (err) {
      console.error("[refine]", err);
    } finally {
      setRefining(false);
    }
  };

  if (!trip) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const currentDay = trip.days.find((d) => d.dayNumber === activeDay) || trip.days[0];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-surface border-b border-border sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="font-display font-bold text-xl text-text">
            scoutie
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/results"
              className="text-sm font-semibold text-text-secondary hover:text-text transition-colors"
            >
              Back to results
            </Link>
            {saved ? (
              <button
                onClick={handleShare}
                className="px-4 py-2 rounded-xl bg-emerald-500 text-white text-sm font-bold hover:bg-emerald-600 transition-colors"
              >
                Copy link
              </button>
            ) : (
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 rounded-xl bg-primary text-white text-sm font-bold hover:bg-primary-dark transition-colors disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save trip"}
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Trip header */}
      <div className="bg-surface border-b border-border">
        <div className="max-w-5xl mx-auto px-6 py-8">
          <span
            className={`inline-block text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full mb-3 ${
              tier === "budget"
                ? "bg-emerald-50 text-emerald-600"
                : tier === "premium"
                ? "bg-amber-50 text-amber-600"
                : "bg-primary-50 text-primary-600"
            }`}
          >
            {tier}
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
              <p className="font-semibold text-text">{trip.days.length} days</p>
            </div>
            <div>
              <p className="text-xs text-text-muted uppercase tracking-wider">Total cost</p>
              <p className="font-mono font-bold text-primary text-lg">
                ${trip.totalEstimatedCost.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Day selector */}
        <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide mb-8">
          {trip.days.map((day) => (
            <button
              key={day.dayNumber}
              onClick={() => setActiveDay(day.dayNumber)}
              className={`flex-shrink-0 px-5 py-3 rounded-xl font-medium transition-all ${
                activeDay === day.dayNumber
                  ? "bg-primary text-white shadow-md"
                  : "bg-surface border border-border text-text-secondary hover:border-primary-light"
              }`}
            >
              <span className="block text-xs opacity-70">Day {day.dayNumber}</span>
              <span className="block text-sm font-semibold">{day.title}</span>
            </button>
          ))}
        </div>

        {/* Day content */}
        <motion.div
          key={activeDay}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-display font-bold text-2xl text-text">
                Day {currentDay.dayNumber}: {currentDay.title}
              </h2>
              <p className="text-text-secondary mt-1">{currentDay.summary}</p>
            </div>
            <span className="font-mono font-bold text-text-secondary">
              ~${currentDay.estimatedCost.toLocaleString()}
            </span>
          </div>

          {/* Timeline */}
          <div className="relative pl-8">
            <div className="absolute left-3 top-0 bottom-0 w-px bg-border" />
            <div className="space-y-4">
              {currentDay.items.map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={`relative border rounded-xl p-4 ${typeColors[item.itemType] || typeColors.note}`}
                >
                  {/* Timeline dot */}
                  <div className="absolute -left-[1.4rem] top-5 w-3 h-3 rounded-full bg-primary border-2 border-surface" />

                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span>{typeIcons[item.itemType] || "📌"}</span>
                        {item.startTime && (
                          <span className="text-xs font-mono opacity-70">
                            {item.startTime}
                            {item.endTime && ` - ${item.endTime}`}
                          </span>
                        )}
                      </div>
                      <p className="font-semibold text-sm">{item.title}</p>
                      <p className="text-xs mt-1 opacity-80">{item.description}</p>
                      {item.locationName && (
                        <p className="text-xs mt-1 opacity-60">{item.locationName}</p>
                      )}
                    </div>
                    <div className="text-right flex-shrink-0">
                      {item.estimatedCost > 0 && (
                        <p className="font-mono font-bold text-sm">
                          ${item.estimatedCost}
                        </p>
                      )}
                      {item.rating && (
                        <p className="text-xs opacity-70 mt-0.5">
                          ★ {item.rating}
                        </p>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* AI Chat Refinement */}
      <div className="fixed bottom-6 right-6 z-30">
        {chatOpen ? (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="w-80 bg-surface rounded-2xl border border-border shadow-xl overflow-hidden"
          >
            <div className="bg-primary px-4 py-3 flex items-center justify-between">
              <span className="text-white font-bold text-sm">Refine your trip</span>
              <button
                onClick={() => setChatOpen(false)}
                className="text-white/70 hover:text-white text-lg leading-none"
              >
                x
              </button>
            </div>
            <div className="p-4">
              <p className="text-xs text-text-muted mb-3">
                Tell me how to adjust your itinerary. Try &quot;make day 3 more relaxed&quot; or &quot;add a beach day&quot;.
              </p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleRefine()}
                  placeholder="e.g. swap the museum for a food tour"
                  className="flex-1 px-3 py-2 rounded-lg border border-border bg-background text-sm text-text placeholder:text-text-muted focus:outline-none focus:border-primary"
                  disabled={refining}
                />
                <button
                  onClick={handleRefine}
                  disabled={refining || !chatInput.trim()}
                  className="px-3 py-2 rounded-lg bg-primary text-white text-sm font-bold hover:bg-primary-dark transition-colors disabled:opacity-50"
                >
                  {refining ? "..." : "Go"}
                </button>
              </div>
              {refining && (
                <p className="text-xs text-primary mt-2 animate-pulse">
                  Updating your itinerary...
                </p>
              )}
            </div>
          </motion.div>
        ) : (
          <button
            onClick={() => setChatOpen(true)}
            className="w-14 h-14 rounded-full bg-primary text-white shadow-lg hover:bg-primary-dark hover:shadow-xl transition-all flex items-center justify-center text-xl"
          >
            AI
          </button>
        )}
      </div>
    </div>
  );
}
