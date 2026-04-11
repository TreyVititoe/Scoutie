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
  const [flightsLoading, setFlightsLoading] = useState(true);
  const [hotelsLoading, setHotelsLoading] = useState(true);
  const [eventsLoading, setEventsLoading] = useState(true);
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
        })
        .finally(() => {
          setFlightsLoading(false);
        });
    } else {
      setFlightsLoading(false);
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
        })
        .finally(() => {
          setHotelsLoading(false);
        });
    } else {
      setHotelsLoading(false);
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
        })
        .finally(() => {
          setEventsLoading(false);
        });
    } else {
      setEventsLoading(false);
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
      <div className="min-h-screen bg-page-bg flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-accent border-t-transparent rounded-full animate-spin" />
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
    <div className="min-h-screen bg-page-bg">
      {/* --- Header --- */}
      <header className="fixed top-0 left-0 right-0 z-20 nav-glass">
        <div className="max-w-content mx-auto px-4 lg:px-8 py-4 flex items-center justify-between">
          <Link href="/" className="text-white text-[17px] font-semibold">
            Walter
          </Link>
          <Link
            href="/quiz"
            className="text-accent text-sm hover:underline transition-colors flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[18px]">edit</span>
            Edit trip
          </Link>
        </div>
      </header>

      <div className="max-w-content mx-auto px-4 lg:px-8 pt-28 pb-10">
        {/* --- Page Header --- */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-14"
        >
          <h1 className="text-[28px] font-semibold text-gray-dark leading-page mb-3">
            Build your trip to <span className="text-accent">{destination}</span>
          </h1>
          <p className="text-on-light-secondary text-[17px]">
            Browse flights, stays, events, and curated picks. Add what you love to your trip.
          </p>
        </motion.div>

        <div>
          {/* --- Main Content --- */}
          <main className="pb-20 lg:pb-0">
            {/* --- Flights --- */}
            {(flightsLoading || flights.length > 0) && (
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3 }}
                className="mb-14"
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-accent text-[21px]">flight</span>
                    <div>
                      <h2 className="text-[21px] font-semibold text-gray-dark">Flights</h2>
                      <p className="text-on-light-tertiary text-sm">
                        {flightsLoading ? "Searching..." : "Live prices via Skyscanner"}
                      </p>
                    </div>
                  </div>
                  {!flightsLoading && (
                    <span className="text-xs text-on-light-tertiary">{flights.length} found</span>
                  )}
                </div>

                {flightsLoading && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[0, 1, 2].map((i) => (
                      <div key={i} className="card-base p-6 animate-pulse">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-8 h-8 rounded-lg bg-page-bg" />
                          <div className="h-4 bg-page-bg rounded-lg w-24" />
                        </div>
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <div className="h-5 bg-page-bg rounded-lg w-12 mb-1" />
                            <div className="h-3 bg-page-bg rounded-lg w-16" />
                          </div>
                          <div className="h-3 bg-page-bg rounded-lg w-16" />
                          <div>
                            <div className="h-5 bg-page-bg rounded-lg w-12 mb-1" />
                            <div className="h-3 bg-page-bg rounded-lg w-16" />
                          </div>
                        </div>
                        <div className="h-6 bg-page-bg rounded-full w-20 mt-4" />
                      </div>
                    ))}
                  </div>
                )}

                {!flightsLoading && flights.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {flights.map((f) => (
                      <div key={f.id}>
                        <FlightCard flight={f} cheapest={cheapestFlight?.id === f.id} />
                      </div>
                    ))}
                  </div>
                )}
              </motion.section>
            )}

            {/* --- Stays --- */}
            {(hotelsLoading || hotels.length > 0) && (
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3 }}
                className="mb-14"
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-accent text-[21px]">hotel</span>
                    <div>
                      <h2 className="text-[21px] font-semibold text-gray-dark">Stays</h2>
                      <p className="text-on-light-tertiary text-sm">
                        {hotelsLoading ? "Searching..." : "Availability from Booking.com"}
                      </p>
                    </div>
                  </div>
                  {!hotelsLoading && (
                    <span className="text-xs text-on-light-tertiary">{hotels.length} found</span>
                  )}
                </div>

                {hotelsLoading && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[0, 1, 2].map((i) => (
                      <div key={i} className="card-base overflow-hidden animate-pulse">
                        <div className="w-full h-40 bg-page-bg" />
                        <div className="p-5">
                          <div className="h-5 bg-page-bg rounded-lg w-3/4 mb-3" />
                          <div className="h-4 bg-page-bg rounded-lg w-1/2 mb-3" />
                          <div className="h-6 bg-page-bg rounded-full w-24 mt-3" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {!hotelsLoading && hotels.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {hotels.map((h) => (
                      <div key={h.id}>
                        <HotelCard hotel={h} bestValue={bestValueHotel?.id === h.id} />
                      </div>
                    ))}
                  </div>
                )}
              </motion.section>
            )}

            {/* --- Events --- */}
            {(eventsLoading || allEvents.length > 0) && (
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3 }}
                className="mb-14"
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-accent text-[21px]">local_activity</span>
                    <div>
                      <h2 className="text-[21px] font-semibold text-gray-dark">Live Events & Experiences</h2>
                      <p className="text-on-light-tertiary text-sm">
                        {eventsLoading ? "Searching..." : "Ticketmaster events during your trip"}
                      </p>
                    </div>
                  </div>
                  {!eventsLoading && (
                    <span className="text-xs text-on-light-tertiary">
                      {allEvents.length} found
                    </span>
                  )}
                </div>

                {eventsLoading && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[0, 1, 2].map((i) => (
                      <div key={i} className="card-base overflow-hidden animate-pulse">
                        <div className="w-full h-40 bg-page-bg" />
                        <div className="p-5">
                          <div className="h-5 bg-page-bg rounded-lg w-3/4 mb-3" />
                          <div className="h-4 bg-page-bg rounded-lg w-1/2 mb-2" />
                          <div className="h-3 bg-page-bg rounded-lg w-2/3" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {!eventsLoading && allEvents.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {allEvents.map((ev) => (
                      <div key={ev.id}>
                        <EventCard event={ev} />
                      </div>
                    ))}
                  </div>
                )}
              </motion.section>
            )}

            {/* --- Walter's Picks --- */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3 }}
              className="mb-14"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-accent text-[21px]">auto_awesome</span>
                  <div>
                    <h2 className="text-[21px] font-semibold text-gray-dark">Walter&apos;s Picks</h2>
                    <p className="text-on-light-tertiary text-sm">
                      {suggestionsLoading ? "Finding the best spots for you..." : "AI-curated activities, restaurants & sites"}
                    </p>
                  </div>
                </div>
                {suggestions.length > 0 && (
                  <span className="text-xs text-on-light-tertiary">
                    {suggestions.length} picks
                  </span>
                )}
              </div>

              {/* Skeleton loaders */}
              {suggestionsLoading && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[0, 1, 2].map((i) => (
                    <div key={i} className="card-base p-6 animate-pulse">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-2xl bg-page-bg" />
                        <div className="h-4 bg-page-bg rounded-lg w-20" />
                      </div>
                      <div className="h-5 bg-page-bg rounded-lg w-3/4 mb-3" />
                      <div className="h-4 bg-page-bg rounded-lg w-full mb-2" />
                      <div className="h-4 bg-page-bg rounded-lg w-2/3 mb-4" />
                      <div className="h-10 bg-page-bg rounded-full mt-4" />
                    </div>
                  ))}
                </div>
              )}

              {/* Suggestion cards */}
              {!suggestionsLoading && suggestions.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {suggestions.map((s) => (
                    <div key={s.id}>
                      <SuggestionCard suggestion={s} />
                    </div>
                  ))}
                </div>
              )}

              {/* Empty state */}
              {!suggestionsLoading && suggestions.length === 0 && (
                <div className="card-base p-8 text-center">
                  <span className="material-symbols-outlined text-on-light-tertiary text-3xl mb-3 block">explore</span>
                  <p className="font-semibold text-gray-dark mb-1">No suggestions yet</p>
                  <p className="text-on-light-secondary text-sm">We could not find curated picks for this destination right now.</p>
                </div>
              )}
            </motion.section>
          </main>

          {/* --- Trip Tracker (renders its own desktop sidebar + mobile bar) --- */}
          <TripTracker />
        </div>

        {/* --- FTC Disclosure --- */}
        <p className="text-xs text-on-light-tertiary text-center mt-10">
          Walter earns a commission when you book through our links at no extra cost to you.
        </p>
      </div>
    </div>
  );
}
