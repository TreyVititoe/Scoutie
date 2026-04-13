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
import { useTripCartStore, selectItemCount } from "@/lib/stores/tripCartStore";
import type { FlightResult } from "@/lib/services/flights";
import type { HotelResult } from "@/lib/services/hotels";
import type { ScoredEvent, Suggestion } from "@/lib/types";

const tabs = [
  { id: "flights", label: "Flights", icon: "flight" },
  { id: "stays", label: "Stays", icon: "hotel" },
  { id: "events", label: "Events", icon: "local_activity" },
  { id: "picks", label: "Walter's Picks", icon: "auto_awesome" },
] as const;

type TabId = (typeof tabs)[number]["id"];

export default function ResultsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabId>("flights");
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

      <div className="max-w-content mx-auto px-4 lg:px-8 pt-28">
        {/* --- Page Header --- */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-[28px] font-semibold text-gray-dark leading-page mb-3">
            Build your trip to <span className="text-accent">{destination}</span>
          </h1>
          <p className="text-on-light-secondary text-[17px]">
            Browse flights, stays, events, and curated picks. Add what you love to your trip.
          </p>
        </motion.div>

        {/* AI Itinerary Banner -- show when items came from compare page */}
        <AiItineraryBanner />
      </div>

      {/* --- Sticky Tab Bar (outside content container so sticky works) --- */}
      <div className="sticky top-[56px] z-30 flex justify-center py-3">
            <div className="flex items-center gap-1.5 p-2 rounded-full bg-white/25 backdrop-blur-2xl backdrop-saturate-150 border border-white/30 shadow-[0_8px_32px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,0.4),0_0_0_0.5px_rgba(255,255,255,0.2)]">
              {tabs.map((tab) => {
                const isActive = activeTab === tab.id;
                const isLoading =
                  (tab.id === "flights" && flightsLoading) ||
                  (tab.id === "stays" && hotelsLoading) ||
                  (tab.id === "events" && eventsLoading) ||
                  (tab.id === "picks" && suggestionsLoading);
                const count =
                  tab.id === "flights" ? flights.length :
                  tab.id === "stays" ? hotels.length :
                  tab.id === "events" ? allEvents.length :
                  suggestions.length;

                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`relative flex items-center gap-2 px-5 py-2.5 rounded-full text-[14px] font-semibold transition-all duration-200 ${
                      isActive
                        ? "bg-accent/90 text-white shadow-[0_2px_16px_rgba(0,101,113,0.35)] backdrop-blur-sm"
                        : "text-gray-dark/70 hover:text-gray-dark hover:bg-white/30"
                    }`}
                  >
                    <span className="material-symbols-outlined text-[18px]">{tab.icon}</span>
                    <span className="hidden sm:inline">{tab.label}</span>
                    {!isLoading && count > 0 && (
                      <span className={`text-[10px] font-semibold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 ${
                        isActive ? "bg-white/20 text-white" : "bg-accent/10 text-accent"
                      }`}>
                        {count}
                      </span>
                    )}
                    {isLoading && (
                      <span className={`w-3 h-3 border-2 rounded-full animate-spin ${
                        isActive ? "border-white/40 border-t-white" : "border-accent/30 border-t-accent"
                      }`} />
                    )}
                  </button>
                );
              })}
            </div>
      </div>

      <div className="max-w-content mx-auto px-4 lg:px-8 pb-10">
        <div>
          {/* --- Tab Content --- */}
          <main className="pb-24 lg:pb-0 pt-6">
            {/* --- Flights Tab --- */}
            {activeTab === "flights" && (
              <motion.section
                key="flights"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
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
                  {!flightsLoading && flights.length > 0 && (
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

                {!flightsLoading && flights.length === 0 && (
                  <div className="card-base p-8 text-center">
                    <span className="material-symbols-outlined text-on-light-tertiary text-3xl mb-3 block">flight_off</span>
                    <p className="font-semibold text-gray-dark mb-1">No flights found</p>
                    <p className="text-on-light-secondary text-sm">Try adjusting your dates or departure city.</p>
                  </div>
                )}
              </motion.section>
            )}

            {/* --- Stays Tab --- */}
            {activeTab === "stays" && (
              <motion.section
                key="stays"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
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
                  {!hotelsLoading && hotels.length > 0 && (
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

                {!hotelsLoading && hotels.length === 0 && (
                  <div className="card-base p-8 text-center">
                    <span className="material-symbols-outlined text-on-light-tertiary text-3xl mb-3 block">night_shelter</span>
                    <p className="font-semibold text-gray-dark mb-1">No stays found</p>
                    <p className="text-on-light-secondary text-sm">Try adjusting your dates or destination.</p>
                  </div>
                )}
              </motion.section>
            )}

            {/* --- Events Tab --- */}
            {activeTab === "events" && (
              <motion.section
                key="events"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
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
                  {!eventsLoading && allEvents.length > 0 && (
                    <span className="text-xs text-on-light-tertiary">{allEvents.length} found</span>
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

                {!eventsLoading && allEvents.length === 0 && (
                  <div className="card-base p-8 text-center">
                    <span className="material-symbols-outlined text-on-light-tertiary text-3xl mb-3 block">event_busy</span>
                    <p className="font-semibold text-gray-dark mb-1">No events found</p>
                    <p className="text-on-light-secondary text-sm">No live events during your travel dates.</p>
                  </div>
                )}
              </motion.section>
            )}

            {/* --- Walter's Picks Tab --- */}
            {activeTab === "picks" && (
              <motion.section
                key="picks"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
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
                    <span className="text-xs text-on-light-tertiary">{suggestions.length} picks</span>
                  )}
                </div>

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

                {!suggestionsLoading && suggestions.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {suggestions.map((s) => (
                      <div key={s.id}>
                        <SuggestionCard suggestion={s} />
                      </div>
                    ))}
                  </div>
                )}

                {!suggestionsLoading && suggestions.length === 0 && (
                  <div className="card-base p-8 text-center">
                    <span className="material-symbols-outlined text-on-light-tertiary text-3xl mb-3 block">explore</span>
                    <p className="font-semibold text-gray-dark mb-1">No suggestions yet</p>
                    <p className="text-on-light-secondary text-sm">We could not find curated picks for this destination right now.</p>
                  </div>
                )}
              </motion.section>
            )}
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

/* ── Date Comparison Picker ── */
function DatePicker({ onSelect }: { onSelect: (start: string, end: string) => void }) {
  const [data, setData] = useState<Record<number, {
    flights: { min: number; max: number; count: number; loading: boolean };
    hotels: { min: number; max: number; count: number; loading: boolean };
    events: { count: number; categories: string[]; topEvents: { name: string; venue: string; date: string; image: string | null }[]; loading: boolean };
  }>>({});

  const tripDays = (() => {
    try {
      const stored = localStorage.getItem("walter_prefs");
      if (stored) {
        const p = JSON.parse(stored);
        return p.tripDurationDays || 5;
      }
    } catch {}
    return 5;
  })();

  const prefs = (() => {
    try {
      const stored = localStorage.getItem("walter_prefs");
      return stored ? JSON.parse(stored) : {};
    } catch { return {}; }
  })();

  const destination = prefs.destinations?.[0] || prefs.destination || "";
  const departureCity = prefs.departureCity || "";
  const adults = prefs.travelersCount || prefs.travelers || 1;
  const cabinClass = prefs.flightClass || "economy";
  const vibes = prefs.activityInterests || prefs.vibes || [];

  const formatDate = (d: Date) => d.toISOString().split("T")[0];
  const formatDisplay = (d: Date) =>
    d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });

  const now = new Date();
  const options = [
    { label: "Next week", offset: 7 },
    { label: "In 2 weeks", offset: 14 },
    { label: "In 3 weeks", offset: 21 },
  ];

  const dateRanges = options.map((opt) => {
    const start = new Date(now);
    start.setDate(start.getDate() + opt.offset);
    const end = new Date(start);
    end.setDate(end.getDate() + tripDays);
    return { ...opt, start, end, startStr: formatDate(start), endStr: formatDate(end) };
  });

  useEffect(() => {
    if (!destination) return;

    dateRanges.forEach((range, idx) => {
      setData((prev) => ({
        ...prev,
        [idx]: {
          flights: { min: 0, max: 0, count: 0, loading: true },
          hotels: { min: 0, max: 0, count: 0, loading: true },
          events: { count: 0, categories: [], topEvents: [], loading: true },
        },
      }));

      // Flights
      if (departureCity) {
        fetch("/api/flights", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ origin: departureCity, destination, departDate: range.startStr, returnDate: range.endStr, adults, cabinClass }),
        })
          .then((r) => r.json())
          .then((d) => {
            const fl = d.flights || [];
            const prices = fl.map((f: { price: number }) => f.price).filter((p: number) => p > 0);
            setData((prev) => ({
              ...prev,
              [idx]: {
                ...prev[idx],
                flights: {
                  min: prices.length ? Math.min(...prices) : 0,
                  max: prices.length ? Math.max(...prices) : 0,
                  count: fl.length,
                  loading: false,
                },
              },
            }));
          })
          .catch(() => setData((prev) => ({ ...prev, [idx]: { ...prev[idx], flights: { min: 0, max: 0, count: 0, loading: false } } })));
      } else {
        setData((prev) => ({ ...prev, [idx]: { ...prev[idx], flights: { min: 0, max: 0, count: 0, loading: false } } }));
      }

      // Hotels
      fetch("/api/hotels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ destination, checkIn: range.startStr, checkOut: range.endStr, adults }),
      })
        .then((r) => r.json())
        .then((d) => {
          const ht = d.hotels || [];
          const prices = ht.map((h: { totalPrice: number }) => h.totalPrice).filter((p: number) => p > 0);
          setData((prev) => ({
            ...prev,
            [idx]: {
              ...prev[idx],
              hotels: {
                min: prices.length ? Math.min(...prices) : 0,
                max: prices.length ? Math.max(...prices) : 0,
                count: ht.length,
                loading: false,
              },
            },
          }));
        })
        .catch(() => setData((prev) => ({ ...prev, [idx]: { ...prev[idx], hotels: { min: 0, max: 0, count: 0, loading: false } } })));

      // Events
      fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ destination, startDate: range.startStr, endDate: range.endStr, vibes, travelers: adults }),
      })
        .then((r) => r.json())
        .then((d) => {
          const all = [...(d.exactMatches || []), ...(d.similarMatches || []), ...(d.topInArea || [])];
          const cats = [...new Set(all.map((e: { category: string }) => e.category))].slice(0, 3) as string[];
          const top = all.slice(0, 2).map((e: Record<string, unknown>) => ({
            name: e.name as string,
            venue: e.venueName as string,
            date: e.date as string,
            image: (e.image as string) || null,
          }));
          setData((prev) => ({
            ...prev,
            [idx]: { ...prev[idx], events: { count: all.length, categories: cats, topEvents: top, loading: false } },
          }));
        })
        .catch(() => setData((prev) => ({ ...prev, [idx]: { ...prev[idx], events: { count: 0, categories: [], topEvents: [], loading: false } } })));
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="mb-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="icon-gradient w-9 h-9 flex items-center justify-center">
          <span className="material-symbols-outlined text-accent text-[18px]">calendar_month</span>
        </div>
        <div>
          <p className="font-semibold text-gray-dark text-[17px]">When do you want to go?</p>
          <p className="text-on-light-tertiary text-sm">Compare real prices and events across different dates</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {dateRanges.map((range, idx) => {
          const d = data[idx];
          const allLoading = !d || d.flights.loading || d.hotels.loading || d.events.loading;
          const someLoading = d && (d.flights.loading || d.hotels.loading || d.events.loading);

          // Estimate total
          const flightMin = d?.flights.min || 0;
          const flightMax = d?.flights.max || 0;
          const hotelMin = d?.hotels.min || 0;
          const hotelMax = d?.hotels.max || 0;
          const totalMin = flightMin + hotelMin;
          const totalMax = flightMax + hotelMax;

          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: idx * 0.1 }}
              className="card-base overflow-hidden flex flex-col"
            >
              {/* Header */}
              <div className="p-5 pb-4 border-b border-[rgba(0,101,113,0.06)]">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-accent text-[18px]">location_on</span>
                    <h3 className="font-semibold text-gray-dark text-[17px]">{destination}</h3>
                  </div>
                  <span className="bg-accent text-white rounded-pill px-2.5 py-0.5 text-[11px] font-semibold">
                    {tripDays} nights
                  </span>
                </div>
                <p className="text-on-light-secondary text-sm flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[14px]">calendar_today</span>
                  {formatDisplay(range.start)} - {formatDisplay(range.end)}
                </p>
              </div>

              <div className="p-5 flex-1 flex flex-col">
                {/* Estimated Total */}
                <div className="mb-5">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-on-light-secondary text-sm">Estimated Total</span>
                    <span className="material-symbols-outlined text-accent text-[16px]">payments</span>
                  </div>
                  {allLoading ? (
                    <div className="h-8 bg-page-bg rounded animate-pulse w-2/3" />
                  ) : totalMin > 0 ? (
                    <div>
                      <p className="font-semibold text-gray-dark text-[24px]">
                        ${totalMin.toLocaleString()} - ${totalMax.toLocaleString()}
                      </p>
                      <p className="text-on-light-tertiary text-xs">per person</p>
                    </div>
                  ) : (
                    <p className="text-on-light-tertiary text-sm">No pricing available</p>
                  )}
                </div>

                {/* Flights */}
                <div className="flex items-center justify-between py-3 border-t border-[rgba(0,101,113,0.06)]">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-accent text-[18px]">flight</span>
                    <span className="text-gray-dark text-sm font-semibold">Flights</span>
                  </div>
                  {d?.flights.loading ? (
                    <div className="w-3 h-3 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
                  ) : d?.flights.count > 0 ? (
                    <div className="text-right">
                      <p className="font-semibold text-gray-dark text-sm">
                        ${d.flights.min.toLocaleString()} - ${d.flights.max.toLocaleString()}
                      </p>
                    </div>
                  ) : (
                    <span className="text-on-light-tertiary text-xs">No flights found</span>
                  )}
                </div>

                {/* Hotels */}
                <div className="flex items-center justify-between py-3 border-t border-[rgba(0,101,113,0.06)]">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-accent text-[18px]">hotel</span>
                    <span className="text-gray-dark text-sm font-semibold">Hotels</span>
                  </div>
                  {d?.hotels.loading ? (
                    <div className="w-3 h-3 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
                  ) : d?.hotels.count > 0 ? (
                    <div className="text-right">
                      <p className="font-semibold text-gray-dark text-sm">
                        ${d.hotels.min.toLocaleString()} - ${d.hotels.max.toLocaleString()}
                      </p>
                    </div>
                  ) : (
                    <span className="text-on-light-tertiary text-xs">No hotels found</span>
                  )}
                </div>

                {/* Events */}
                <div className="py-3 border-t border-[rgba(0,101,113,0.06)]">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-accent text-[18px]">confirmation_number</span>
                      <span className="text-gray-dark text-sm font-semibold">Events Found</span>
                    </div>
                    {d?.events.loading ? (
                      <div className="w-3 h-3 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
                    ) : (
                      <span className="font-semibold text-gray-dark text-[17px]">{d?.events.count || 0}</span>
                    )}
                  </div>

                  {/* Category pills */}
                  {d?.events.categories && d.events.categories.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {d.events.categories.map((cat, j) => (
                        <span key={j} className="bg-gray-dark text-white rounded-pill px-2.5 py-0.5 text-[10px] font-semibold">
                          {cat}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Top events */}
                  {d?.events.topEvents && d.events.topEvents.length > 0 && (
                    <div className="space-y-2 mt-2">
                      {d.events.topEvents.map((ev, j) => (
                        <div key={j} className="flex items-center gap-2.5">
                          {ev.image && (
                            <img src={ev.image} alt="" className="w-10 h-10 rounded-[6px] object-cover flex-shrink-0" />
                          )}
                          <div className="min-w-0">
                            <p className="text-sm text-gray-dark font-semibold truncate">{ev.name}</p>
                            <p className="text-[11px] text-on-light-tertiary truncate">{ev.venue}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* CTA */}
                <button
                  onClick={() => onSelect(range.startStr, range.endStr)}
                  disabled={someLoading}
                  className="mt-auto w-full bg-accent text-white rounded-[10px] px-5 py-3 text-[15px] font-semibold hover:bg-accent-light transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  View Full Details
                  <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

/* ── AI Itinerary Banner ── */
function AiItineraryBanner() {
  const items = useTripCartStore((s) => s.items);
  const itemCount = useTripCartStore(selectItemCount);
  const aiItems = items.filter((i) => i.provider === "walter-ai");

  if (aiItems.length === 0) return null;

  // Group by day
  const byDay = new Map<number, typeof aiItems>();
  aiItems.forEach((item) => {
    const day = (item.meta?.dayNumber as number) || 1;
    if (!byDay.has(day)) byDay.set(day, []);
    byDay.get(day)!.push(item);
  });

  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="card-base p-5 mb-6"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="icon-gradient w-9 h-9 flex items-center justify-center">
            <span className="material-symbols-outlined text-accent text-[18px]">auto_awesome</span>
          </div>
          <div>
            <p className="font-semibold text-gray-dark text-sm">
              Walter&apos;s itinerary loaded ({aiItems.length} items)
            </p>
            <p className="text-on-light-tertiary text-xs">
              Your AI-planned trip is in the cart. Swap items with real bookings below.
            </p>
          </div>
        </div>
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-accent text-sm font-semibold hover:text-accent-light transition-colors flex items-center gap-1"
        >
          {expanded ? "Hide" : "View"}
          <span className="material-symbols-outlined text-[16px]">
            {expanded ? "expand_less" : "expand_more"}
          </span>
        </button>
      </div>

      {expanded && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          transition={{ duration: 0.2 }}
          className="mt-4 pt-4 border-t border-[rgba(0,101,113,0.06)]"
        >
          <div className="space-y-3">
            {Array.from(byDay.entries())
              .sort(([a], [b]) => a - b)
              .map(([day, dayItems]) => (
                <div key={day}>
                  <p className="text-xs font-semibold text-on-light-tertiary uppercase tracking-wider mb-1.5">
                    Day {day}
                  </p>
                  <div className="space-y-1">
                    {dayItems.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-2 text-sm bg-page-bg rounded-[8px] px-3 py-2"
                      >
                        <span className="text-[10px] text-on-light-tertiary w-12">
                          {(item.meta?.startTime as string) || ""}
                        </span>
                        <span className="bg-[#e6f7f9] text-accent rounded-pill px-1.5 py-0.5 text-[9px] font-semibold uppercase">
                          {item.type}
                        </span>
                        <span className="flex-1 truncate text-gray-dark">{item.title}</span>
                        {item.price != null && item.price > 0 && (
                          <span className="text-accent font-semibold text-xs">${item.price}</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
          </div>
          <p className="text-xs text-on-light-tertiary mt-3">
            These are AI estimates. Browse the tabs below to find real bookable options and swap them in.
          </p>
        </motion.div>
      )}
    </motion.div>
  );
}
