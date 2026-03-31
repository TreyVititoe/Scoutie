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

    // Fire all three requests in parallel
    const generatePromise = fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(quizData),
    })
      .then((r) => r.json())
      .then((data: GenerateResult) => {
        if (data.error) throw new Error(data.error);
        setTrips(data.trips || []);
        localStorage.setItem("scoutie_trips", JSON.stringify(data));
      });

    const flightsPromise =
      departureCity && destination && startDate && endDate
        ? fetch("/api/flights", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              origin: departureCity,
              destination,
              departDate: startDate,
              returnDate: endDate,
              adults,
              cabinClass,
            }),
          })
            .then((r) => r.json())
            .then((data) => setFlights(data.flights || []))
            .catch((err) => console.warn("[flights]", err))
        : Promise.resolve();

    const hotelsPromise =
      destination && startDate && endDate
        ? fetch("/api/hotels", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              destination,
              checkIn: startDate,
              checkOut: endDate,
              adults,
            }),
          })
            .then((r) => r.json())
            .then((data) => setHotels(data.hotels || []))
            .catch((err) => console.warn("[hotels]", err))
        : Promise.resolve();

    Promise.all([generatePromise, flightsPromise, hotelsPromise])
      .catch((err) => {
        console.error(err);
        setError("Couldn't generate your trip. Please try again.");
      })
      .finally(() => {
        clearInterval(interval);
        setLoading(false);
      });

    return () => clearInterval(interval);
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
          <div className="w-14 h-14 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-8" />
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
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
        <div className="text-center max-w-md">
          <p className="font-display text-2xl font-bold text-text mb-3">Something went wrong</p>
          <p className="text-text-secondary mb-6">{error}</p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 rounded-xl bg-primary text-white font-semibold hover:bg-primary-dark transition-colors"
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
      <header className="bg-surface border-b border-border sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="font-display font-bold text-xl text-text">
            scoutie
          </Link>
          <Link
            href="/quiz"
            className="text-sm font-semibold text-primary hover:text-primary-dark transition-colors"
          >
            Edit trip
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10">
        {/* Page header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <h1 className="font-display font-bold text-3xl sm:text-4xl text-text mb-2">
            Your trips to {destination}
          </h1>
          <p className="text-text-secondary text-lg">
            We built {trips.length} options at different price points. Plus real flights and hotels you can book now.
          </p>
        </motion.div>

        {/* Real Flights */}
        {flights.length > 0 && (
          <section className="mb-10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-xl font-bold text-text">Flights</h2>
              <span className="text-sm text-text-muted">{flights.length} options</span>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-4 -mx-6 px-6 scrollbar-hide">
              {flights.map((f) => (
                <FlightCard
                  key={f.id}
                  flight={f}
                  cheapest={cheapestFlight?.id === f.id}
                />
              ))}
            </div>
          </section>
        )}

        {/* Real Hotels */}
        {hotels.length > 0 && (
          <section className="mb-10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-xl font-bold text-text">Stays</h2>
              <span className="text-sm text-text-muted">{hotels.length} options</span>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-4 -mx-6 px-6 scrollbar-hide">
              {hotels.map((h) => (
                <HotelCard
                  key={h.id}
                  hotel={h}
                  bestValue={bestValueHotel?.id === h.id}
                />
              ))}
            </div>
          </section>
        )}

        {/* AI Trip Itineraries */}
        <section className="mb-10">
          <h2 className="font-display text-xl font-bold text-text mb-4">
            Full itineraries
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {trips.map((trip, i) => {
              const config = tierConfig[trip.tier] || tierConfig.balanced;
              return (
                <motion.div
                  key={trip.tier}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.15 }}
                  className={`bg-surface rounded-2xl border ${config.borderColor} overflow-hidden hover:shadow-lg transition-shadow`}
                >
                  <div className={`${config.bgColor} px-5 py-3 flex items-center justify-between`}>
                    <span className={`text-sm font-bold uppercase tracking-wider ${config.color}`}>
                      {config.label}
                    </span>
                    <span className={`font-mono font-bold text-lg ${config.color}`}>
                      ${trip.totalEstimatedCost.toLocaleString()}
                    </span>
                  </div>

                  <div className="p-5">
                    <h3 className="font-display font-bold text-lg text-text mb-2">
                      {trip.title}
                    </h3>
                    <p className="text-sm text-text-secondary mb-4 line-clamp-3">
                      {trip.summary}
                    </p>

                    <div className="space-y-2 mb-5">
                      {trip.days.slice(0, 3).map((day) => (
                        <div key={day.dayNumber} className="flex items-center gap-2 text-sm">
                          <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center flex-shrink-0">
                            {day.dayNumber}
                          </span>
                          <span className="text-text-secondary truncate">{day.title}</span>
                        </div>
                      ))}
                      {trip.days.length > 3 && (
                        <p className="text-xs text-text-muted pl-8">
                          +{trip.days.length - 3} more days
                        </p>
                      )}
                    </div>

                    <Link
                      href={`/trip?tier=${trip.tier}`}
                      className="block w-full py-3 rounded-xl bg-primary text-white text-center font-bold hover:bg-primary-dark transition-colors"
                    >
                      View full itinerary
                    </Link>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* Quick comparison */}
        {trips.length > 1 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="bg-surface rounded-2xl border border-border p-6 mb-10"
          >
            <h3 className="font-display font-bold text-xl text-text mb-4">
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
                        sum +
                        d.items.filter(
                          (it) =>
                            it.itemType === "activity" ||
                            it.itemType === "event" ||
                            it.itemType === "restaurant"
                        ).length,
                      0
                    );
                    return (
                      <tr key={trip.tier} className="border-b border-border last:border-0">
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
