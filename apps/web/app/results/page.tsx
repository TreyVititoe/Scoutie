"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import FlightCard from "@/components/results/FlightCard";
import HotelCard from "@/components/results/HotelCard";
import EventCard from "@/components/results/EventCard";
import SuggestionCard from "@/components/results/SuggestionCard";
import TripTracker from "@/components/results/TripTracker";
import type { FlightResult } from "@/lib/services/flights";
import type { HotelResult } from "@/lib/services/hotels";
import type { ScoredEvent, Suggestion } from "@/lib/types";

export default function ResultsPage() {
  const router = useRouter();
  const [flights, setFlights] = useState<FlightResult[]>([]);
  const [hotels, setHotels] = useState<HotelResult[]>([]);
  const [events, setEvents] = useState<ScoredEvent[]>([]);
  const [similarEvents, setSimilarEvents] = useState<ScoredEvent[]>([]);
  const [topEvents, setTopEvents] = useState<ScoredEvent[]>([]);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [suggestionsLoading, setSuggestionsLoading] = useState(true);
  const [prefs, setPrefs] = useState<Record<string, unknown> | null>(null);
  const [pageReady, setPageReady] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("walter_prefs") || localStorage.getItem("scoutie_prefs");
    if (!stored) {
      router.push("/quiz");
      return;
    }
    const quizData = JSON.parse(stored);
    setPrefs(quizData);
    setPageReady(true);

    const destination = quizData.destinations?.[0] || quizData.destination || "";
    const departureCity = quizData.departureCity || "";
    const startDate = quizData.startDate || "";
    const endDate = quizData.endDate || "";
    const adults = quizData.travelersCount || quizData.travelers || 1;
    const cabinClass = quizData.flightClass || "economy";

    // AbortControllers for timeouts
    const suggestionsController = new AbortController();
    const flightsController = new AbortController();
    const hotelsController = new AbortController();
    const eventsController = new AbortController();
    const suggestionsTimeout = setTimeout(() => suggestionsController.abort(), 30000);
    const flightsTimeout = setTimeout(() => flightsController.abort(), 15000);
    const hotelsTimeout = setTimeout(() => hotelsController.abort(), 15000);
    const eventsTimeout = setTimeout(() => eventsController.abort(), 30000);

    // Fetch AI-curated suggestions
    if (destination) {
      fetch("/api/suggestions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          destination,
          startDate,
          endDate,
          interests: quizData.activityInterests || quizData.vibes || [],
          travelers: adults,
          travelerType: quizData.travelersType || quizData.travelerType || "",
        }),
        signal: suggestionsController.signal,
      })
        .then((r) => r.json())
        .then((data) => {
          clearTimeout(suggestionsTimeout);
          setSuggestions(data.suggestions || []);
        })
        .catch((err) => {
          clearTimeout(suggestionsTimeout);
          console.warn("[suggestions]", err);
        })
        .finally(() => {
          setSuggestionsLoading(false);
        });
    } else {
      setSuggestionsLoading(false);
    }

    // Flights
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

    // Hotels
    if (destination && startDate && endDate && !quizData.noAccommodation) {
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

    // Events
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
      clearTimeout(suggestionsTimeout);
      clearTimeout(flightsTimeout);
      clearTimeout(hotelsTimeout);
      clearTimeout(eventsTimeout);
      suggestionsController.abort();
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

  /* --- Initial load --- */
  if (!pageReady) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
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

  const allEvents = [...events, ...(events.length < 3 ? similarEvents : []), ...topEvents];

  return (
    <div className="min-h-screen bg-background">
      {/* --- Header --- */}
      <header className="fixed top-0 left-0 right-0 z-20 bg-white/70 backdrop-blur-xl shadow-xl shadow-teal-900/5">
        <div className="max-w-screen-2xl mx-auto px-4 lg:px-8 py-4 flex items-center justify-between">
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

      <div className="max-w-screen-2xl mx-auto px-4 lg:px-8 pt-28 pb-10">
        {/* --- Page Header --- */}
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
            <span className="text-xs font-bold tracking-widest uppercase font-body">Trip Builder</span>
          </motion.div>
          <h1 className="font-headline font-extrabold text-5xl text-on-surface mb-3 tracking-tight">
            Build your trip to <span className="text-gradient">{destination}</span>
          </h1>
          <p className="text-on-surface-variant text-xl font-body">
            Browse flights, stays, events, and curated picks. Add what you love to your trip.
          </p>
        </motion.div>

        <div className="flex gap-8">
          {/* --- Main Content --- */}
          <main className="flex-1 min-w-0 pb-20 lg:pb-0">
            {/* --- Flights --- */}
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
                <div className="flex gap-5 overflow-x-auto pb-4 -mx-4 px-4 lg:-mx-8 lg:px-8 scrollbar-hide">
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

            {/* --- Stays --- */}
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
                <div className="flex gap-5 overflow-x-auto pb-4 -mx-4 px-4 lg:-mx-8 lg:px-8 scrollbar-hide">
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

            {/* --- Events --- */}
            {allEvents.length > 0 && (
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
                    {allEvents.length} found
                  </span>
                </div>
                <div className="flex gap-5 overflow-x-auto pb-4 -mx-4 px-4 lg:-mx-8 lg:px-8 scrollbar-hide">
                  {allEvents.map((ev, i) => (
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

            {/* --- Walter's Picks --- */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mb-14"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center">
                    <span className="material-symbols-outlined text-primary text-xl">auto_awesome</span>
                  </div>
                  <div>
                    <h2 className="font-headline text-xl font-bold text-on-surface">Walter&apos;s Picks</h2>
                    <p className="text-[10px] uppercase tracking-widest text-outline-variant font-bold font-body">
                      {suggestionsLoading ? "Finding the best spots for you..." : "AI-curated activities, restaurants & sites"}
                    </p>
                  </div>
                </div>
                {suggestions.length > 0 && (
                  <span className="text-xs font-bold font-body text-outline-variant bg-surface px-3 py-1.5 rounded-full">
                    {suggestions.length} picks
                  </span>
                )}
              </div>

              {/* Skeleton loaders */}
              {suggestionsLoading && (
                <div className="flex gap-5 overflow-x-auto pb-4 -mx-4 px-4 lg:-mx-8 lg:px-8 scrollbar-hide">
                  {[0, 1, 2, 3].map((i) => (
                    <div key={i} className="min-w-[280px] w-[280px] flex-shrink-0 card-3d rounded-[2rem] p-6 animate-pulse">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-2xl bg-surface-container-low" />
                        <div className="h-4 bg-surface-container-low rounded-lg w-20" />
                      </div>
                      <div className="h-5 bg-surface-container-low rounded-lg w-3/4 mb-3" />
                      <div className="h-4 bg-surface-container-low rounded-lg w-full mb-2" />
                      <div className="h-4 bg-surface-container-low rounded-lg w-2/3 mb-4" />
                      <div className="h-10 bg-surface-container-low rounded-full mt-4" />
                    </div>
                  ))}
                </div>
              )}

              {/* Suggestion cards */}
              {!suggestionsLoading && suggestions.length > 0 && (
                <div className="flex gap-5 overflow-x-auto pb-4 -mx-4 px-4 lg:-mx-8 lg:px-8 scrollbar-hide">
                  {suggestions.map((s, i) => (
                    <motion.div
                      key={s.id}
                      initial={{ opacity: 0, x: 40 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 * i, duration: 0.35, ease: "easeOut" }}
                    >
                      <SuggestionCard suggestion={s} />
                    </motion.div>
                  ))}
                </div>
              )}

              {/* Empty state */}
              {!suggestionsLoading && suggestions.length === 0 && (
                <div className="card-3d rounded-[2rem] p-8 text-center">
                  <span className="material-symbols-outlined text-outline-variant text-3xl mb-3 block">explore</span>
                  <p className="font-headline font-bold text-on-surface mb-1">No suggestions yet</p>
                  <p className="text-on-surface-variant font-body text-sm">We could not find curated picks for this destination right now.</p>
                </div>
              )}
            </motion.section>
          </main>

          {/* --- Trip Tracker (renders its own desktop sidebar + mobile bar) --- */}
          <TripTracker />
        </div>

        {/* --- FTC Disclosure --- */}
        <p className="text-xs text-outline-variant text-center mt-10 font-body">
          Walter earns a commission when you book through our links at no extra cost to you.
        </p>
      </div>
    </div>
  );
}
