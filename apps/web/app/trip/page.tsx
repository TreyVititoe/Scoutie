"use client";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import dynamic from "next/dynamic";
import { createClient } from "@/lib/supabase/client";
import RefinementChat from "@/components/trip/RefinementChat";
import PackingList from "@/components/trip/PackingList";
import type { MapItem } from "@/components/trip/TripMap";

const TripMap = dynamic(() => import("@/components/trip/TripMap"), {
  ssr: false,
  loading: () => (
    <div className="rounded-2xl bg-surface-container-low flex items-center justify-center h-80 lg:min-h-[400px] text-on-surface-variant text-sm">
      Loading map...
    </div>
  ),
});

type TripItem = {
  itemType: string;
  title: string;
  description: string;
  startTime: string | null;
  endTime: string | null;
  durationMinutes: number | null;
  estimatedCost: number;
  locationName: string;
  locationLat: number | null;
  locationLng: number | null;
  rating: number | null;
};

type TripDay = {
  dayNumber: number;
  title: string;
  summary?: string;
  estimatedCost?: number;
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
  flight: "flight",
  hotel: "hotel",
  rental: "directions_car",
  activity: "hiking",
  restaurant: "restaurant",
  event: "event",
  transport: "commute",
  note: "sticky_note_2",
};

const typeColors: Record<string, string> = {
  flight: "bg-teal-50 text-teal-600",
  hotel: "bg-blue-50 text-blue-600",
  rental: "bg-indigo-50 text-indigo-600",
  activity: "bg-emerald-50 text-emerald-600",
  restaurant: "bg-amber-50 text-amber-600",
  event: "bg-rose-50 text-rose-600",
  transport: "bg-slate-50 text-slate-600",
  note: "bg-stone-50 text-stone-500",
};

function getTimePeriod(time: string | null): string {
  if (!time) return "Morning";
  const hour = parseInt(time.split(":")[0], 10);
  if (isNaN(hour)) return "Morning";
  if (hour < 12) return "Morning";
  if (hour < 17) return "Midday";
  return "Night";
}

export default function TripDetailPageWrapper() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
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
  const [quizPrefs, setQuizPrefs] = useState<Record<string, unknown>>({});

  useEffect(() => {
    const stored =
      localStorage.getItem("walter_trips") ||
      localStorage.getItem("scoutie_trips");
    if (!stored) {
      router.push("/results");
      return;
    }
    const data = JSON.parse(stored);
    const trips: Trip[] = data.trips || [];
    const match = trips.find((t) => t.tier === tier) || trips[0];
    if (match) setTrip(match);

    const prefs =
      localStorage.getItem("walter_prefs") ||
      localStorage.getItem("scoutie_prefs");
    if (prefs) setQuizPrefs(JSON.parse(prefs));
  }, [tier, router]);

  const handleSave = async () => {
    if (!trip || saving) return;
    setSaving(true);

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      localStorage.setItem("walter_save_after_login", tier);
      router.push("/auth/login");
      return;
    }

    try {
      const storedPrefs = localStorage.getItem("walter_prefs");
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

  const handleTripUpdate = useCallback(
    (updated: Trip) => {
      setTrip(updated);
      const stored = localStorage.getItem("walter_trips");
      if (stored) {
        const allData = JSON.parse(stored);
        const trips: Trip[] = allData.trips || [];
        const idx = trips.findIndex((t) => t.tier === tier);
        if (idx >= 0) {
          trips[idx] = updated;
          localStorage.setItem(
            "walter_trips",
            JSON.stringify({ ...allData, trips })
          );
        }
      }
      setSaved(false);
      setShareSlug(null);
    },
    [tier]
  );

  const mapItems: MapItem[] = useMemo(() => {
    if (!trip) return [];
    const items: MapItem[] = [];
    for (const day of trip.days) {
      for (const item of day.items) {
        if (item.locationLat != null && item.locationLng != null) {
          items.push({
            title: item.title,
            locationName: item.locationName,
            locationLat: item.locationLat,
            locationLng: item.locationLng,
          });
        }
      }
    }
    return items;
  }, [trip]);

  if (!trip) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const currentDay =
    trip.days.find((d) => d.dayNumber === activeDay) || trip.days[0];

  // Extract flights and hotels for the sidebar
  const flights = trip.days.flatMap((d) =>
    d.items.filter((i) => i.itemType === "flight")
  );
  const hotels = trip.days.flatMap((d) =>
    d.items.filter((i) => i.itemType === "hotel")
  );

  return (
    <div className="min-h-screen bg-background font-body">
      {/* ──────────────── Glass Header ──────────────── */}
      <header className="bg-white/70 backdrop-blur-xl shadow-xl shadow-teal-900/5 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link
            href="/"
            className="text-2xl font-black italic text-teal-700 font-headline"
          >
            Walter
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/results"
              className="flex items-center gap-1.5 text-sm font-semibold text-on-surface-variant hover:text-on-surface transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">
                arrow_back
              </span>
              Back to results
            </Link>
            {saved ? (
              <motion.button
                onClick={handleShare}
                whileTap={{ scale: 0.95 }}
                className="px-5 py-2.5 rounded-xl bg-emerald-500 text-white text-sm font-bold hover:bg-emerald-600 transition-colors flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-[18px]">
                  link
                </span>
                Copy link
              </motion.button>
            ) : (
              <motion.button
                onClick={handleSave}
                disabled={saving}
                whileTap={{ scale: 0.95 }}
                className="px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-bold hover:bg-primary-dim transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-[18px]">
                  bookmark
                </span>
                {saving ? "Saving..." : "Save trip"}
              </motion.button>
            )}
          </div>
        </div>
      </header>

      {/* ──────────────── Hero Section ──────────────── */}
      <section className="relative overflow-hidden bg-white/50 border-b border-outline-variant/10">
        <div className="max-w-7xl mx-auto px-6 pt-12 pb-10">
          <p className="uppercase tracking-[0.2em] text-xs font-bold text-primary mb-2 font-body">
            Expedition
          </p>
          <h1 className="text-5xl md:text-7xl font-headline font-extrabold tracking-tight text-on-surface mb-4">
            {trip.title.includes(trip.destination) ? (
              <>
                {trip.title.split(trip.destination)[0]}
                <span className="text-gradient">{trip.destination}</span>
                {trip.title.split(trip.destination).slice(1).join(trip.destination)}
              </>
            ) : (
              <>
                {trip.title}{" "}
                <span className="text-gradient">{trip.destination}</span>
              </>
            )}
          </h1>
          <p className="text-on-surface-variant max-w-2xl text-lg font-body mb-8">
            {trip.summary}
          </p>

          {/* Stat blocks */}
          <div className="flex flex-wrap items-center gap-8">
            <div>
              <p className="text-xs text-on-surface-variant uppercase tracking-[0.15em] font-bold mb-1 font-body">
                Destination
              </p>
              <p className="font-headline font-bold text-lg text-on-surface flex items-center gap-1.5">
                <span className="material-symbols-outlined text-primary text-[20px]">
                  location_on
                </span>
                {trip.destination}
              </p>
            </div>
            <div className="w-px h-10 bg-outline-variant/20" />
            <div>
              <p className="text-xs text-on-surface-variant uppercase tracking-[0.15em] font-bold mb-1 font-body">
                Duration
              </p>
              <p className="font-headline font-bold text-lg text-on-surface flex items-center gap-1.5">
                <span className="material-symbols-outlined text-primary text-[20px]">
                  calendar_today
                </span>
                {trip.days.length} days
              </p>
            </div>
            <div className="w-px h-10 bg-outline-variant/20" />
            <div>
              <p className="text-xs text-on-surface-variant uppercase tracking-[0.15em] font-bold mb-1 font-body">
                Total Cost
              </p>
              <p className="font-mono font-bold text-2xl text-primary">
                ${trip.totalEstimatedCost.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ──────────────── Day Selector ──────────────── */}
      <div className="max-w-7xl mx-auto px-6 pt-8">
        <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide">
          {trip.days.map((day) => (
            <motion.button
              key={day.dayNumber}
              onClick={() => setActiveDay(day.dayNumber)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              className={`flex-shrink-0 px-5 py-3 rounded-xl font-body transition-colors ${
                activeDay === day.dayNumber
                  ? "bg-primary text-white shadow-md"
                  : "bg-surface-container-lowest border border-outline-variant/10 text-on-surface-variant hover:border-primary/30"
              }`}
            >
              <span className="block text-[10px] uppercase tracking-wider opacity-70 font-bold">
                Day {day.dayNumber}
              </span>
              <span className="block text-sm font-bold font-headline mt-0.5">
                {day.title}
              </span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* ──────────────── Bento Grid (8/4 split) ──────────────── */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* ── Left Column: Itinerary (col-span-8) ── */}
          <div className="lg:col-span-8">
            <motion.div
              key={activeDay}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
            >
              <div className="card-3d p-8">
                {/* Itinerary header */}
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className="font-headline font-extrabold text-2xl text-on-surface">
                      Detailed Itinerary
                    </h2>
                    {currentDay.summary && (
                      <p className="text-on-surface-variant text-sm mt-1 font-body">
                        {currentDay.summary}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold font-body bg-surface-container-low text-on-surface-variant px-3 py-1.5 rounded-full">
                      Day {currentDay.dayNumber} of {trip.days.length}
                    </span>
                    <span className="text-[10px] font-bold bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-lg uppercase tracking-wider">
                      Active
                    </span>
                  </div>
                </div>

                {currentDay.estimatedCost != null && (
                  <div className="mb-6 flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-[18px]">
                      payments
                    </span>
                    <span className="text-xs text-on-surface-variant font-body">
                      Day estimate:
                    </span>
                    <span className="font-mono font-bold text-primary">
                      ~${currentDay.estimatedCost.toLocaleString()}
                    </span>
                  </div>
                )}

                {/* Vertical Timeline */}
                <div className="relative pl-10">
                  {/* Timeline spine */}
                  <div className="absolute left-[7px] top-2 bottom-2 w-[2px] bg-outline-variant/20" />

                  <div className="space-y-5">
                    {currentDay.items.map((item, i) => {
                      const period = getTimePeriod(item.startTime);
                      const showPeriodLabel =
                        i === 0 ||
                        getTimePeriod(currentDay.items[i - 1]?.startTime) !==
                          period;

                      return (
                        <div key={i}>
                          {/* Period label */}
                          {showPeriodLabel && (
                            <div className="flex items-center gap-2 mb-3 -ml-10 pl-10">
                              <span className="text-xs text-slate-400 uppercase tracking-wider font-bold font-body">
                                {period}
                              </span>
                              <div className="flex-1 h-px bg-outline-variant/10" />
                            </div>
                          )}

                          <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className="relative"
                          >
                            {/* Timeline dot */}
                            <div className="absolute -left-10 top-6 w-[16px] h-[16px] rounded-full bg-primary ring-4 ring-primary-container/30 z-10" />

                            <div className="card-3d !rounded-3xl p-6">
                              <div className="flex items-start justify-between gap-4">
                                <div className="flex-1">
                                  {/* Time block */}
                                  {item.startTime && (
                                    <p className="font-headline font-extrabold text-on-surface text-sm mb-0.5">
                                      {item.startTime}
                                      {item.endTime && ` -- ${item.endTime}`}
                                    </p>
                                  )}
                                  {/* Period label inline */}
                                  <p className="text-xs text-slate-400 uppercase tracking-wider font-body mb-2">
                                    {period}
                                  </p>

                                  {/* Item type tag + title */}
                                  <div className="flex items-center gap-2 mb-1.5">
                                    <span
                                      className={`inline-flex items-center gap-1 text-[10px] font-bold rounded-lg px-2 py-1 ${typeColors[item.itemType] || typeColors.note}`}
                                    >
                                      <span className="material-symbols-outlined text-[14px]">
                                        {typeIcons[item.itemType] || "note"}
                                      </span>
                                      {item.itemType}
                                    </span>
                                  </div>

                                  <h3 className="font-headline font-bold text-xl text-on-surface mb-1">
                                    {item.title}
                                  </h3>
                                  <p className="text-on-surface-variant text-sm font-body leading-relaxed">
                                    {item.description}
                                  </p>
                                  {item.locationName && (
                                    <p className="text-on-surface-variant/60 text-xs mt-2 flex items-center gap-1 font-body">
                                      <span className="material-symbols-outlined text-[14px]">
                                        pin_drop
                                      </span>
                                      {item.locationName}
                                    </p>
                                  )}
                                </div>

                                <div className="text-right flex-shrink-0">
                                  {item.estimatedCost > 0 && (
                                    <p className="font-mono font-bold text-sm text-primary">
                                      ${item.estimatedCost}
                                    </p>
                                  )}
                                  {item.rating && (
                                    <p className="text-xs text-on-surface-variant mt-1 flex items-center justify-end gap-0.5">
                                      <span className="material-symbols-outlined text-amber-400 text-[14px]">
                                        star
                                      </span>
                                      {item.rating}/5
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* ── Right Column: Sidebar Widgets (col-span-4) ── */}
          <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-24 lg:self-start">
            {/* Map Widget */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className="card-3d p-6"
            >
              <div className="flex items-center gap-2 mb-4">
                <span className="material-symbols-outlined text-primary text-[22px]">
                  near_me
                </span>
                <h3 className="font-headline font-extrabold text-lg text-on-surface">
                  Route Explorer
                </h3>
              </div>
              <TripMap items={mapItems} />
            </motion.div>

            {/* Travel Logistics */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.35, ease: "easeOut", delay: 0.1 }}
              className="card-3d p-6"
            >
              <div className="flex items-center gap-2 mb-4">
                <span className="material-symbols-outlined text-primary text-[22px]">
                  luggage
                </span>
                <h3 className="font-headline font-extrabold text-lg text-on-surface">
                  Travel Logistics
                </h3>
              </div>

              <div className="space-y-3">
                {/* Flights */}
                {flights.length > 0 ? (
                  flights.map((f, i) => (
                    <div
                      key={`flight-${i}`}
                      className="card-3d !rounded-2xl p-4 group cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center flex-shrink-0">
                          <span className="material-symbols-outlined text-teal-600 text-[20px]">
                            flight
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-headline font-bold text-sm text-on-surface truncate">
                            {f.title}
                          </p>
                          <p className="text-xs text-on-surface-variant font-body">
                            {f.startTime || "Scheduled"}
                          </p>
                        </div>
                        {f.estimatedCost > 0 && (
                          <p className="font-mono font-bold text-sm text-primary flex-shrink-0">
                            ${f.estimatedCost}
                          </p>
                        )}
                        <span className="material-symbols-outlined text-outline text-[18px] opacity-0 group-hover:opacity-100 transition-opacity">
                          chevron_right
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="card-3d !rounded-2xl p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center flex-shrink-0">
                        <span className="material-symbols-outlined text-teal-600 text-[20px]">
                          flight
                        </span>
                      </div>
                      <div className="flex-1">
                        <p className="font-headline font-bold text-sm text-on-surface">
                          Flights
                        </p>
                        <p className="text-xs text-on-surface-variant font-body">
                          No flights in itinerary
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Hotels */}
                {hotels.length > 0 ? (
                  hotels.map((h, i) => (
                    <div
                      key={`hotel-${i}`}
                      className="card-3d !rounded-2xl p-4 group cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                          <span className="material-symbols-outlined text-blue-600 text-[20px]">
                            hotel
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-headline font-bold text-sm text-on-surface truncate">
                            {h.title}
                          </p>
                          <p className="text-xs text-on-surface-variant font-body">
                            {h.locationName || "Confirmed"}
                          </p>
                        </div>
                        {h.estimatedCost > 0 && (
                          <p className="font-mono font-bold text-sm text-primary flex-shrink-0">
                            ${h.estimatedCost}
                          </p>
                        )}
                        <span className="material-symbols-outlined text-outline text-[18px] opacity-0 group-hover:opacity-100 transition-opacity">
                          chevron_right
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="card-3d !rounded-2xl p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                        <span className="material-symbols-outlined text-blue-600 text-[20px]">
                          hotel
                        </span>
                      </div>
                      <div className="flex-1">
                        <p className="font-headline font-bold text-sm text-on-surface">
                          Hotels
                        </p>
                        <p className="text-xs text-on-surface-variant font-body">
                          No hotels in itinerary
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>

        {/* ──────────────── Packing List ──────────────── */}
        <div className="mt-10">
          <PackingList
            destination={trip.destination}
            startDate={(quizPrefs.startDate as string) || ""}
            endDate={(quizPrefs.endDate as string) || ""}
            activities={
              (quizPrefs.activityInterests as string[]) ||
              (quizPrefs.vibes as string[]) ||
              []
            }
            pace={(quizPrefs.pace as string) || "moderate"}
            travelers={
              (quizPrefs.travelersCount as number) ||
              (quizPrefs.travelers as number) ||
              1
            }
          />
        </div>
      </div>

      {/* ──────────────── AI Chat Refinement ──────────────── */}
      <RefinementChat trip={trip} onTripUpdate={handleTripUpdate} />
    </div>
  );
}
