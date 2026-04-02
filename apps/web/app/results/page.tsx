"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import FlightCard from "@/components/results/FlightCard";
import HotelCard from "@/components/results/HotelCard";
import type { FlightResult } from "@/lib/services/flights";
import type { HotelResult } from "@/lib/services/hotels";

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

const tierConfig: Record<string, { label: string; color: string; bgColor: string; borderColor: string }> = {
  budget: { label: "Budget", color: "text-emerald-600", bgColor: "bg-emerald-50", borderColor: "border-emerald-200" },
  balanced: { label: "Balanced", color: "text-primary", bgColor: "bg-primary-50", borderColor: "border-primary-200" },
  premium: { label: "Premium", color: "text-amber-600", bgColor: "bg-amber-50", borderColor: "border-amber-200" },
};

export default function ResultsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [flights, setFlights] = useState<FlightResult[]>([]);
  const [hotels, setHotels] = useState<HotelResult[]>([]);
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
    const stored = localStorage.getItem("scoutie_prefs");
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
    const generateTimeout = setTimeout(() => generateController.abort(), 55000);
    const flightsTimeout = setTimeout(() => flightsController.abort(), 15000);
    const hotelsTimeout = setTimeout(() => hotelsController.abort(), 15000);

    // Core: generate trips — resolves loading state on its own
    fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(quizData),
      signal: generateController.signal,
    })
      .then((r) => r.json())
      .then((data: GenerateResult) => {
        clearTimeout(generateTimeout);
        if (data.error) throw new Error(data.error);
        setTrips(data.trips || []);
        localStorage.setItem("scoutie_trips", JSON.stringify(data));
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

    return () => {
      clearInterval(interval);
      clearTimeout(generateTimeout);
      clearTimeout(flightsTimeout);
      clearTimeout(hotelsTimeout);
      generateController.abort();
      flightsController.abort();
      hotelsController.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  const destination =
    (prefs as { destinations?: string[] })?.destinations?.[0] ||
    (prefs as { destination?: string })?.destination ||
    "your destination";

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          {/* Animated orb */}
          <div className="relative w-24 h-24 mx-auto mb-10">
            <div className="absolute inset-0 rounded-full bg-gradient-animated opacity-20 blur-xl animate-pulse" />
            <div className="absolute inset-2 rounded-full bg-gradient-animated opacity-40 blur-md" />
            <div className="absolute inset-4 rounded-full bg-surface flex items-center justify-center">
              <motion.span
                key={loadingPhase}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="font-display font-bold text-primary text-lg"
              >
                {loadingPhase + 1}
              </motion.span>
            </div>
          </div>
          <h2 className="font-display text-2xl font-bold text-text mb-3">
            Scouting your trip...
          </h2>
          <motion.p
            key={loadingPhase}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-text-secondary"
          >
            {phases[loadingPhase]}
          </motion.p>
          {/* Progress dots */}
          <div className="flex gap-2 justify-center mt-6">
            {phases.map((_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  i <= loadingPhase ? "bg-primary w-6" : "bg-border"
                }`}
              />
            ))}
          </div>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-6">
            <svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>
          </div>
          <p className="font-display text-2xl font-bold text-text mb-3">Something went wrong</p>
          <p className="text-text-secondary mb-6">{error}</p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 rounded-xl bg-primary text-white font-semibold hover:bg-primary-dark transition-all hover:-translate-y-0.5"
            >
              Try again
            </button>
            <Link
              href="/quiz"
              className="px-6 py-3 rounded-xl border border-border text-text font-semibold hover:bg-surface transition-colors"
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
      {/* Header */}
      <header className="glass fixed top-0 left-0 right-0 z-20">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="font-display font-extrabold text-xl text-gradient">
            scoutie
          </Link>
          <Link
            href="/quiz"
            className="text-sm font-semibold text-primary hover:text-primary-dark transition-colors flex items-center gap-1"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
            Edit trip
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 pt-24 pb-10">
        {/* Page header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-4"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-sm font-semibold text-primary">Trip generated</span>
          </motion.div>
          <h1 className="font-display font-extrabold text-4xl sm:text-5xl text-text mb-3 tracking-tight">
            Your trips to <span className="text-gradient">{destination}</span>
          </h1>
          <p className="text-text-secondary text-lg">
            We built {trips.length} options at different price points. Plus real flights and hotels you can book now.
          </p>
        </motion.div>

        {/* Real Flights */}
        {flights.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-12"
          >
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-sky-50 flex items-center justify-center">
                  <svg className="w-4 h-4 text-sky-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                </div>
                <div>
                  <h2 className="font-display text-xl font-bold text-text">Flights</h2>
                  <p className="text-xs text-text-muted">Live prices via Skyscanner</p>
                </div>
              </div>
              <span className="text-sm font-mono text-text-muted bg-surface px-3 py-1 rounded-full border border-border">{flights.length} found</span>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-4 -mx-6 px-6 scrollbar-hide">
              {flights.map((f) => (
                <FlightCard key={f.id} flight={f} cheapest={cheapestFlight?.id === f.id} />
              ))}
            </div>
          </motion.section>
        )}

        {/* Real Hotels */}
        {hotels.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-12"
          >
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-purple-50 flex items-center justify-center">
                  <svg className="w-4 h-4 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                </div>
                <div>
                  <h2 className="font-display text-xl font-bold text-text">Stays</h2>
                  <p className="text-xs text-text-muted">Availability from Booking.com</p>
                </div>
              </div>
              <span className="text-sm font-mono text-text-muted bg-surface px-3 py-1 rounded-full border border-border">{hotels.length} found</span>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-4 -mx-6 px-6 scrollbar-hide">
              {hotels.map((h) => (
                <HotelCard key={h.id} hotel={h} bestValue={bestValueHotel?.id === h.id} />
              ))}
            </div>
          </motion.section>
        )}

        {/* AI Trip Itineraries */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-12"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-9 h-9 rounded-xl bg-primary-50 flex items-center justify-center">
              <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            </div>
            <div>
              <h2 className="font-display text-xl font-bold text-text">Full itineraries</h2>
              <p className="text-xs text-text-muted">AI-generated day-by-day plans</p>
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
                  className={`bg-surface rounded-2xl border ${config.borderColor} overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all card-shine`}
                >
                  <div className={`${config.bgColor} px-5 py-4 flex items-center justify-between`}>
                    <span className={`text-sm font-bold uppercase tracking-wider ${config.color}`}>
                      {config.label}
                    </span>
                    <span className={`font-mono font-bold text-xl ${config.color}`}>
                      ${trip.totalEstimatedCost.toLocaleString()}
                    </span>
                  </div>

                  <div className="p-5">
                    <h3 className="font-display font-bold text-lg text-text mb-2">
                      {trip.title}
                    </h3>
                    <p className="text-sm text-text-secondary mb-5 line-clamp-3">
                      {trip.summary}
                    </p>

                    <div className="space-y-2 mb-5">
                      {trip.days.slice(0, 3).map((day) => (
                        <div key={day.dayNumber} className="flex items-center gap-3 text-sm">
                          <span className="w-7 h-7 rounded-lg bg-primary/10 text-primary text-xs font-bold flex items-center justify-center flex-shrink-0">
                            {day.dayNumber}
                          </span>
                          <span className="text-text-secondary truncate">{day.title}</span>
                        </div>
                      ))}
                      {trip.days.length > 3 && (
                        <p className="text-xs text-text-muted pl-10">
                          +{trip.days.length - 3} more days
                        </p>
                      )}
                    </div>

                    <Link
                      href={`/trip?tier=${trip.tier}`}
                      className="block w-full py-3.5 rounded-xl bg-primary text-white text-center font-bold hover:bg-primary-dark transition-all hover:shadow-lg hover:shadow-primary/20"
                    >
                      View full itinerary
                    </Link>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.section>

        {/* Quick comparison */}
        {trips.length > 1 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="bg-surface rounded-2xl border border-border p-6 mb-10"
          >
            <h3 className="font-display font-bold text-xl text-text mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Quick comparison
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 pr-4 text-text-muted font-medium">Option</th>
                    <th className="text-right py-3 px-4 text-text-muted font-medium">Total cost</th>
                    <th className="text-right py-3 px-4 text-text-muted font-medium">Days</th>
                    <th className="text-right py-3 pl-4 text-text-muted font-medium">Activities</th>
                  </tr>
                </thead>
                <tbody>
                  {trips.map((trip) => {
                    const config = tierConfig[trip.tier] || tierConfig.balanced;
                    const totalActivities = trip.days.reduce(
                      (sum, d) =>
                        sum + d.items.filter((it) => it.itemType === "activity" || it.itemType === "event" || it.itemType === "restaurant").length,
                      0
                    );
                    return (
                      <tr key={trip.tier} className="border-b border-border last:border-0 hover:bg-primary-50/30 transition-colors">
                        <td className="py-3 pr-4">
                          <span className={`font-semibold ${config.color}`}>{config.label}</span>
                          <span className="text-text-muted ml-2">— {trip.title}</span>
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-text">
                          ${trip.totalEstimatedCost.toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-right text-text">{trip.days.length}</td>
                        <td className="py-3 pl-4 text-right text-text">{totalActivities}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* FTC disclosure */}
        <p className="text-xs text-text-muted text-center mt-10">
          Scoutie earns a commission when you book through our links at no extra cost to you.
        </p>
      </main>
    </div>
  );
}
