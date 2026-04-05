"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import FlightCard from "@/components/results/FlightCard";
import HotelCard from "@/components/results/HotelCard";
import EventCard from "@/components/results/EventCard";
import type { FlightResult } from "@/lib/services/flights";
import type { HotelResult } from "@/lib/services/hotels";
import type { ScoredEvent } from "@/lib/types";

type TripItem = {
  itemType: string;
  title: string;
  estimatedCost: number;
};

type TripDay = {
  dayNumber: number;
  title: string;
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

type GenerateResult = {
  trips: Trip[];
  error?: string;
};

const tierConfig: Record<
  string,
  { label: string; color: string; badgeBg: string; ctaClass: string }
> = {
  budget: {
    label: "Budget",
    color: "text-teal-700",
    badgeBg: "bg-secondary-container text-on-secondary-container",
    ctaClass: "bg-primary text-white",
  },
  balanced: {
    label: "Balanced",
    color: "text-primary",
    badgeBg: "bg-primary/10 text-primary",
    ctaClass: "bg-primary text-white",
  },
  premium: {
    label: "Premium",
    color: "text-amber-700",
    badgeBg: "bg-tertiary-container/60 text-amber-800",
    ctaClass: "bg-primary text-white",
  },
};

export default function ResultsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [flights, setFlights] = useState<FlightResult[]>([]);
  const [hotels, setHotels] = useState<HotelResult[]>([]);
  const [events, setEvents] = useState<ScoredEvent[]>([]);
  const [similarEvents, setSimilarEvents] = useState<ScoredEvent[]>([]);
  const [topEvents, setTopEvents] = useState<ScoredEvent[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [prefs, setPrefs] = useState<Record<string, unknown> | null>(null);
  const [loadingPhase, setLoadingPhase] = useState(0);

  const phases = [
    "Analyzing your preferences...",
    "Searching real flights...",
    "Finding the best hotels...",
    "Building your itineraries...",
    "Almost there...",
  ];

  useEffect(() => {
    const stored = localStorage.getItem("walter_prefs") || localStorage.getItem("scoutie_prefs");
    if (!stored) {
      router.push("/quiz");
      return;
    }
    const quizData = JSON.parse(stored);
    setPrefs(quizData);

    const interval = setInterval(() => {
      setLoadingPhase((p) => (p < phases.length - 1 ? p + 1 : p));
    }, 2500);

    const destination = quizData.destinations?.[0] || quizData.destination || "";
    const departureCity = quizData.departureCity || "";
    const startDate = quizData.startDate || "";
    const endDate = quizData.endDate || "";
    const adults = quizData.travelersCount || quizData.travelers || 1;
    const cabinClass = quizData.flightClass || "economy";

    // AbortControllers for timeouts
    const generateController = new AbortController();
    const flightsController = new AbortController();
    const hotelsController = new AbortController();
    const eventsController = new AbortController();
    const generateTimeout = setTimeout(() => generateController.abort(), 180000);
    const flightsTimeout = setTimeout(() => flightsController.abort(), 15000);
    const hotelsTimeout = setTimeout(() => hotelsController.abort(), 15000);
    const eventsTimeout = setTimeout(() => eventsController.abort(), 30000);

    // Core: generate trips via streaming endpoint
    fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(quizData),
      signal: generateController.signal,
    })
      .then((r) => r.text())
      .then((text) => {
        clearTimeout(generateTimeout);
        const data: GenerateResult = JSON.parse(text);
        if (data.error) throw new Error(data.error);
        setTrips(data.trips || []);
        localStorage.setItem("walter_trips", JSON.stringify(data));
      })
      .catch((err) => {
        clearTimeout(generateTimeout);
        console.error("[generate]", err);
        setError("Couldn't generate your trip. Please try again.");
      })
      .finally(() => {
        clearInterval(interval);
        setLoading(false);
      });

    // Flights and hotels load independently — won't block the main results
    if (departureCity && destination && startDate && endDate) {
      fetch("/api/flights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ origin: departureCity, destination, departDate: startDate, returnDate: endDate, adults, cabinClass }),
        signal: flightsController.signal,
      })
        .then((r) => r.json())
        .then((data) => {
          clearTimeout(flightsTimeout);
          setFlights(data.flights || []);
        })
        .catch((err) => {
          clearTimeout(flightsTimeout);
          console.warn("[flights]", err);
        });
    }

    if (destination && startDate && endDate) {
      fetch("/api/hotels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ destination, checkIn: startDate, checkOut: endDate, adults }),
        signal: hotelsController.signal,
      })
        .then((r) => r.json())
        .then((data) => {
          clearTimeout(hotelsTimeout);
          setHotels(data.hotels || []);
        })
        .catch((err) => {
          clearTimeout(hotelsTimeout);
          console.warn("[hotels]", err);
        });
    }

    // Fetch events in parallel with flights and hotels
    if (destination && startDate && endDate) {
      fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          destination,
          startDate,
          endDate,
          vibes: quizData.activityInterests || quizData.vibes || [],
          travelers: adults,
        }),
        signal: eventsController.signal,
      })
        .then((r) => r.json())
        .then((data) => {
          clearTimeout(eventsTimeout);
          setEvents(data.exactMatches || []);
          setSimilarEvents(data.similarMatches || []);
          setTopEvents(data.topInArea || []);
        })
        .catch((err) => {
          clearTimeout(eventsTimeout);
          console.warn("[events]", err);
        });
    }

    return () => {
      clearInterval(interval);
      clearTimeout(generateTimeout);
      clearTimeout(flightsTimeout);
      clearTimeout(hotelsTimeout);
      clearTimeout(eventsTimeout);
      generateController.abort();
      flightsController.abort();
      hotelsController.abort();
      eventsController.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  const destination =
    (prefs as { destinations?: string[] })?.destinations?.[0] ||
    (prefs as { destination?: string })?.destination ||
    "your destination";

  /* ─── Loading State ─── */
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          {/* Animated orb — primary gradient with blur */}
          <div className="relative w-24 h-24 mx-auto mb-10">
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary to-teal-400 opacity-20 blur-xl animate-pulse" />
            <div className="absolute inset-2 rounded-full bg-gradient-to-br from-primary to-teal-400 opacity-40 blur-md" />
            <div className="absolute inset-4 rounded-full bg-surface flex items-center justify-center">
              <motion.span
                key={loadingPhase}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="font-headline font-extrabold text-primary text-lg"
              >
                {loadingPhase + 1}
              </motion.span>
            </div>
          </div>

          <h2 className="font-headline text-2xl font-extrabold text-on-surface mb-3">
            Planning your trip...
          </h2>
          <motion.p
            key={loadingPhase}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-on-surface-variant font-body"
          >
            {phases[loadingPhase]}
          </motion.p>

          {/* Progress dots */}
          <div className="flex gap-2 justify-center mt-6">
            {phases.map((_, i) => (
              <div
                key={i}
                className={`h-2 rounded-full transition-all duration-300 ${
                  i <= loadingPhase ? "bg-primary w-6" : "bg-outline-variant/30 w-2"
                }`}
              />
            ))}
          </div>
        </motion.div>
      </div>
    );
  }

  /* ─── Error State ─── */
  if (error) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-6">
            <span className="material-symbols-outlined text-red-500 text-2xl">error</span>
          </div>
          <p className="font-headline text-2xl font-extrabold text-on-surface mb-3">Something went wrong</p>
          <p className="text-on-surface-variant font-body mb-6">{error}</p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => window.location.reload()}
              className="btn-primary-gradient px-6 py-3 rounded-full font-extrabold font-headline"
            >
              Try again
            </button>
            <Link
              href="/quiz"
              className="px-6 py-3 rounded-full border border-outline-variant text-on-surface font-bold font-headline hover:bg-surface transition-colors"
            >
              Edit quiz
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const cheapestFlight = flights.length > 0
    ? flights.reduce((a, b) => (a.price < b.price ? a : b))
    : null;

  const bestValueHotel = hotels.length > 0
    ? hotels.reduce((a, b) => {
        const scoreA = a.rating / (a.pricePerNight || 1);
        const scoreB = b.rating / (b.pricePerNight || 1);
        return scoreA > scoreB ? a : b;
      })
    : null;

  return (
    <div className="min-h-screen bg-background">
      {/* ─── Header ─── */}
      <header className="fixed top-0 left-0 right-0 z-20 bg-white/70 backdrop-blur-xl shadow-xl shadow-teal-900/5">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="font-headline font-black italic text-2xl text-teal-700">
            Walter
          </Link>
          <Link
            href="/quiz"
            className="text-sm font-bold font-body text-primary hover:text-primary/80 transition-colors flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[18px]">edit</span>
            Edit trip
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 pt-28 pb-10">
        {/* ─── Page Header ─── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-14"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-secondary-container text-on-secondary-container mb-5"
          >
            <span className="material-symbols-outlined text-[16px]">auto_awesome</span>
            <span className="text-xs font-bold tracking-widest uppercase font-body">Walter AI</span>
          </motion.div>
          <h1 className="font-headline font-extrabold text-5xl text-on-surface mb-3 tracking-tight">
            Your trips to <span className="text-gradient">{destination}</span>
          </h1>
          <p className="text-on-surface-variant text-xl font-body">
            We built {trips.length} options at different price points. Plus real flights and hotels you can book now.
          </p>
        </motion.div>

        {/* ─── Flights ─── */}
        {flights.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-14"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-teal-50 flex items-center justify-center">
                  <span className="material-symbols-outlined text-teal-600 text-xl">flight</span>
                </div>
                <div>
                  <h2 className="font-headline text-xl font-bold text-on-surface">Flights</h2>
                  <p className="text-[10px] uppercase tracking-widest text-outline-variant font-bold font-body">Live prices via Skyscanner</p>
                </div>
              </div>
              <span className="text-xs font-bold font-body text-outline-variant bg-surface px-3 py-1.5 rounded-full">{flights.length} found</span>
            </div>
            <div className="flex gap-5 overflow-x-auto pb-4 -mx-6 px-6 scrollbar-hide">
              {flights.map((f, i) => (
                <motion.div
                  key={f.id}
                  initial={{ opacity: 0, x: 40 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * i, duration: 0.35, ease: "easeOut" }}
                >
                  <FlightCard flight={f} cheapest={cheapestFlight?.id === f.id} />
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}

        {/* ─── Hotels ─── */}
        {hotels.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-14"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-purple-50 flex items-center justify-center">
                  <span className="material-symbols-outlined text-purple-600 text-xl">hotel</span>
                </div>
                <div>
                  <h2 className="font-headline text-xl font-bold text-on-surface">Stays</h2>
                  <p className="text-[10px] uppercase tracking-widest text-outline-variant font-bold font-body">Availability from Booking.com</p>
                </div>
              </div>
              <span className="text-xs font-bold font-body text-outline-variant bg-surface px-3 py-1.5 rounded-full">{hotels.length} found</span>
            </div>
            <div className="flex gap-5 overflow-x-auto pb-4 -mx-6 px-6 scrollbar-hide">
              {hotels.map((h, i) => (
                <motion.div
                  key={h.id}
                  initial={{ opacity: 0, x: 40 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * i, duration: 0.35, ease: "easeOut" }}
                >
                  <HotelCard hotel={h} bestValue={bestValueHotel?.id === h.id} />
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}

        {/* ─── Events ─── */}
        {(events.length > 0 || similarEvents.length > 0 || topEvents.length > 0) && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="mb-14"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-50 flex items-center justify-center">
                  <span className="material-symbols-outlined text-amber-600 text-xl">local_activity</span>
                </div>
                <div>
                  <h2 className="font-headline text-xl font-bold text-on-surface">Live Events & Experiences</h2>
                  <p className="text-[10px] uppercase tracking-widest text-outline-variant font-bold font-body">Ticketmaster events during your trip</p>
                </div>
              </div>
              <span className="text-xs font-bold font-body text-outline-variant bg-surface px-3 py-1.5 rounded-full">
                {events.length + similarEvents.length + topEvents.length} found
              </span>
            </div>
            <div className="flex gap-5 overflow-x-auto pb-4 -mx-6 px-6 scrollbar-hide">
              {[...events, ...(events.length < 3 ? similarEvents : []), ...topEvents].map((ev, i) => (
                <motion.div
                  key={ev.id}
                  initial={{ opacity: 0, x: 40 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * i, duration: 0.35, ease: "easeOut" }}
                >
                  <EventCard event={ev} />
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}

        {/* ─── AI Trip Itineraries ─── */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-14"
        >
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-primary text-xl">calendar_month</span>
            </div>
            <div>
              <h2 className="font-headline text-xl font-bold text-on-surface">Full itineraries</h2>
              <p className="text-[10px] uppercase tracking-widest text-outline-variant font-bold font-body">AI-generated day-by-day plans</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {trips.map((trip, i) => {
              const config = tierConfig[trip.tier] || tierConfig.balanced;
              return (
                <motion.div
                  key={trip.tier}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + i * 0.15 }}
                  className="card-3d rounded-[2.5rem] overflow-hidden"
                >
                  {/* Tier badge strip */}
                  <div className={`${config.badgeBg} px-6 py-4 flex items-center justify-between`}>
                    <span className="text-[10px] font-bold uppercase tracking-widest font-body">
                      {config.label}
                    </span>
                    <span className="text-3xl font-headline font-black">
                      ${trip.totalEstimatedCost.toLocaleString()}
                    </span>
                  </div>

                  <div className="p-6">
                    <h3 className="font-headline font-extrabold text-2xl text-on-surface mb-2">
                      {trip.title}
                    </h3>
                    <p className="text-on-surface-variant leading-relaxed font-body mb-6 line-clamp-3">
                      {trip.summary}
                    </p>

                    {/* Day preview */}
                    <div className="space-y-2.5 mb-6">
                      {trip.days.slice(0, 3).map((day) => (
                        <div key={day.dayNumber} className="flex items-center gap-3 text-sm">
                          <span className="w-7 h-7 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
                            {day.dayNumber}
                          </span>
                          <span className="text-on-surface-variant font-body truncate">{day.title}</span>
                        </div>
                      ))}
                      {trip.days.length > 3 && (
                        <p className="text-xs text-outline-variant font-body pl-10">
                          +{trip.days.length - 3} more days
                        </p>
                      )}
                    </div>

                    <Link
                      href={`/trip?tier=${trip.tier}`}
                      className="block w-full py-4 rounded-full bg-primary text-white text-center font-extrabold font-headline shadow-xl shadow-primary/20 hover:shadow-2xl hover:shadow-primary/30 hover:-translate-y-0.5 transition-all"
                    >
                      View full itinerary
                    </Link>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.section>

        {/* ─── Comparison Table ─── */}
        {trips.length > 1 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="card-3d p-8 rounded-[2rem] mb-10"
          >
            <h3 className="font-headline font-bold text-xl text-on-surface mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">compare</span>
              Quick comparison
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm font-body">
                <thead>
                  <tr className="border-b border-outline-variant/20">
                    <th className="text-left py-3 pr-4 text-[10px] uppercase tracking-widest text-outline-variant font-bold">Option</th>
                    <th className="text-right py-3 px-4 text-[10px] uppercase tracking-widest text-outline-variant font-bold">Total cost</th>
                    <th className="text-right py-3 px-4 text-[10px] uppercase tracking-widest text-outline-variant font-bold">Days</th>
                    <th className="text-right py-3 pl-4 text-[10px] uppercase tracking-widest text-outline-variant font-bold">Activities</th>
                  </tr>
                </thead>
                <tbody>
                  {trips.map((trip, i) => {
                    const config = tierConfig[trip.tier] || tierConfig.balanced;
                    const totalActivities = trip.days.reduce(
                      (sum, d) =>
                        sum + d.items.filter((it) => it.itemType === "activity" || it.itemType === "event" || it.itemType === "restaurant").length,
                      0
                    );
                    return (
                      <motion.tr
                        key={trip.tier}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.7 + i * 0.1, duration: 0.3, ease: "easeOut" }}
                        className="border-b border-outline-variant/10 last:border-0"
                      >
                        <td className="py-3.5 pr-4">
                          <span className={`font-bold font-headline ${config.color}`}>{config.label}</span>
                          <span className="text-outline-variant ml-2">-- {trip.title}</span>
                        </td>
                        <td className="py-3.5 px-4 text-right font-headline font-black text-on-surface">
                          ${trip.totalEstimatedCost.toLocaleString()}
                        </td>
                        <td className="py-3.5 px-4 text-right text-on-surface">{trip.days.length}</td>
                        <td className="py-3.5 pl-4 text-right text-on-surface">{totalActivities}</td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* ─── FTC Disclosure ─── */}
        <p className="text-xs text-outline-variant text-center mt-10 font-body">
          Walter earns a commission when you book through our links at no extra cost to you.
        </p>
      </main>
    </div>
  );
}
