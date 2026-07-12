"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import PlaneLoader from "@/components/PlaneLoader";
import Link from "next/link";
import FlightCard from "@/components/results/FlightCard";
import HotelCard from "@/components/results/HotelCard";
import EventCard from "@/components/results/EventCard";
import SuggestionCard from "@/components/results/SuggestionCard";
import TripTracker from "@/components/results/TripTracker";
import { useTripCartStore, selectItemCount } from "@/lib/stores/tripCartStore";
import { getDestinationImage } from "@/lib/destinationImages";
import type { FlightResult } from "@/lib/services/flights";
import type { HotelResult } from "@/lib/services/hotels";
import type { ScoredEvent, Suggestion } from "@/lib/types";

const tabs = [
  { id: "flights", label: "Flights", icon: "flight" },
  { id: "stays", label: "Stays", icon: "hotel" },
  { id: "events", label: "Events", icon: "local_activity" },
  { id: "picks", label: "Picks", icon: "explore" },
] as const;

type TabId = (typeof tabs)[number]["id"];
const EASE = [0.2, 0.8, 0.2, 1] as const;

const STAY_TYPES = [
  { id: "hotel", label: "Hotels" },
  { id: "vacation_rental", label: "Vacation Rentals" },
  { id: "hostel", label: "Hostels" },
] as const;
type StayType = (typeof STAY_TYPES)[number]["id"];

type ChosenTrip = {
  id: string;
  title: string;
  destination: string;
  days: number;
  estTotal: number;
  summary: string;
  tier: string;
};

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
  const [trip, setTrip] = useState<ChosenTrip | null>(null);
  const [pageReady, setPageReady] = useState(false);
  const [fetchKey, setFetchKey] = useState(0);
  const [stayType, setStayType] = useState<StayType>("hotel");
  const [hotelsUnavailable, setHotelsUnavailable] = useState(false);
  /* Lets the main fetch effect read the current stay type without
   * re-running everything when it changes. */
  const stayTypeRef = useRef<StayType>("hotel");
  const stayTypeMounted = useRef(false);

  const handleInlineUpdate = (updates: Record<string, unknown>) => {
    const stored = localStorage.getItem("walter_prefs");
    if (stored) {
      const p = JSON.parse(stored);
      Object.assign(p, updates);
      localStorage.setItem("walter_prefs", JSON.stringify(p));
      setPrefs(p);
    }
    setFlights([]);
    setHotels([]);
    setEvents([]);
    setSimilarEvents([]);
    setTopEvents([]);
    setFlightsLoading(true);
    setHotelsLoading(true);
    setEventsLoading(true);
    setFetchKey((k) => k + 1);
  };

  useEffect(() => {
    let chosenTrip: ChosenTrip | null = null;
    try {
      const storedTrip = localStorage.getItem("walter_trip");
      if (storedTrip) chosenTrip = JSON.parse(storedTrip);
    } catch {}
    setTrip(chosenTrip);

    const stored = localStorage.getItem("walter_prefs");
    if (!stored && !chosenTrip) {
      router.push("/");
      return;
    }
    const quizData = stored ? JSON.parse(stored) : {};
    setPrefs(quizData);
    setPageReady(true);

    const destination = chosenTrip?.destination || quizData.destinations?.[0] || quizData.destination || "";
    const departureCity = quizData.departureCity || "";
    const startDate = quizData.startDate || "";
    const endDate = quizData.endDate || "";
    const adults = quizData.travelersCount || quizData.travelers || 1;
    const cabinClass = quizData.flightClass || "economy";

    const suggestionsController = new AbortController();
    const flightsController = new AbortController();
    const hotelsController = new AbortController();
    const eventsController = new AbortController();
    const suggestionsTimeout = setTimeout(() => suggestionsController.abort(), 30000);
    const flightsTimeout = setTimeout(() => flightsController.abort(), 25000);
    const hotelsTimeout = setTimeout(() => hotelsController.abort(), 15000);
    const eventsTimeout = setTimeout(() => eventsController.abort(), 30000);

    if (destination) {
      fetch("/api/suggestions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          destination,
          startDate,
          endDate,
          interests: quizData.activityInterests || quizData.vibes || [],
          description: quizData.description || "",
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
        .finally(() => setSuggestionsLoading(false));
    } else {
      setSuggestionsLoading(false);
    }

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
        .finally(() => setFlightsLoading(false));
    } else {
      setFlightsLoading(false);
    }

    if (destination && startDate && endDate && !quizData.noAccommodation) {
      fetch("/api/hotels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ destination, checkIn: startDate, checkOut: endDate, adults, stayType: stayTypeRef.current }),
        signal: hotelsController.signal,
      })
        .then((r) => r.json())
        .then((data) => {
          clearTimeout(hotelsTimeout);
          setHotels(data.hotels || []);
          setHotelsUnavailable(!!data.unavailable);
        })
        .catch((err) => {
          clearTimeout(hotelsTimeout);
          console.warn("[hotels]", err);
        })
        .finally(() => setHotelsLoading(false));
    } else {
      setHotelsLoading(false);
    }

    if (destination && startDate && endDate) {
      fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          destination,
          startDate,
          endDate,
          vibes: quizData.activityInterests || quizData.vibes || [],
          description: quizData.description || "",
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
        .finally(() => setEventsLoading(false));
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
  }, [router, fetchKey]);

  /* Stay-type switches refetch hotels only; the other searches stand. */
  useEffect(() => {
    stayTypeRef.current = stayType;
    if (!stayTypeMounted.current) {
      stayTypeMounted.current = true;
      return;
    }
    const p = prefs as Record<string, unknown> | null;
    const dest =
      trip?.destination ||
      (p?.destinations as string[])?.[0] ||
      (p?.destination as string) ||
      "";
    const startDate = (p?.startDate as string) || "";
    const endDate = (p?.endDate as string) || "";
    const adults = (p?.travelersCount as number) || (p?.travelers as number) || 1;
    if (!dest || !startDate || !endDate) return;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    setHotels([]);
    setHotelsLoading(true);
    fetch("/api/hotels", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ destination: dest, checkIn: startDate, checkOut: endDate, adults, stayType }),
      signal: controller.signal,
    })
      .then((r) => r.json())
      .then((data) => {
        setHotels(data.hotels || []);
        setHotelsUnavailable(!!data.unavailable);
      })
      .catch((err) => console.warn("[hotels]", err))
      .finally(() => {
        clearTimeout(timeout);
        setHotelsLoading(false);
      });
    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stayType]);

  const destination =
    trip?.destination ||
    (prefs as { destinations?: string[] })?.destinations?.[0] ||
    (prefs as { destination?: string })?.destination ||
    "your destination";

  if (!pageReady) {
    return (
      <div className="min-h-screen bg-product-bg flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-accent border-t-transparent rounded-full animate-spin" />
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

  const heroImage = getDestinationImage(destination);

  const startDate = (prefs as { startDate?: string })?.startDate || "";
  const endDate = (prefs as { endDate?: string })?.endDate || "";
  const tripWindow = formatTripWindow(startDate, endDate);

  return (
    <div className="min-h-screen bg-product-bg">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-30 nav-glass">
        <div className="max-w-content mx-auto px-5 lg:px-8 py-3.5 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 shrink-0">
            <img src="/walter-logo.png" alt="" className="w-7 h-7 rounded-[8px]" />
            <span className="text-ink text-[16px] font-semibold tracking-tight">Walter</span>
          </Link>
          <Link
            href="/"
            className="text-ink-soft hover:text-ink text-label font-medium px-3.5 py-1.5 rounded-pill hover:bg-ink/5 transition-colors flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[16px]">edit</span>
            Edit trip
          </Link>
        </div>
      </header>

      {/* Hero: text on the canvas, destination photograph boxed on the right */}
      <section className="pt-14">
        <div className="max-w-content w-full mx-auto px-5 lg:px-8 pt-10 pb-4 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 order-2 lg:order-1">
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: EASE }}
              className="text-ink-faint text-[11px] uppercase tracking-[2.5px] font-medium mb-3"
            >
              {trip
                ? [trip.destination, tripWindow || `${trip.days} days`].join("  |  ")
                : tripWindow || "Your trip"}
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05, duration: 0.7, ease: EASE }}
              className="text-ink text-[36px] sm:text-[48px] font-semibold tracking-display leading-[1.02] mb-3 max-w-[20ch]"
            >
              {trip?.title || destination}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.12, duration: 0.6, ease: EASE }}
              className="text-ink-soft text-body max-w-[44ch]"
            >
              {trip?.summary || "Nothing is booked yet. Add the pieces you want."}
            </motion.p>
          </div>
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1, duration: 0.6, ease: EASE }}
            className="lg:col-span-5 order-1 lg:order-2"
          >
            <div className="rounded-[20px] overflow-hidden border border-line shadow-[0_12px_40px_rgba(20,30,60,0.10)] aspect-[4/3]">
              <img
                src={heroImage}
                alt={`${destination} landscape`}
                className="w-full h-full object-cover"
                fetchPriority="high"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* AI Itinerary Banner */}
      <div className="max-w-content mx-auto px-5 lg:px-8 pt-10">
        <AiItineraryBanner />
      </div>

      {/* Flat tab bar */}
      <div className="sticky top-[56px] z-20 bg-page-bg/85 backdrop-blur-md border-y border-line">
        <div className="max-w-content mx-auto px-5 lg:px-8 py-3">
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide">
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
                  className={`relative flex items-center gap-2 px-4 py-2 rounded-pill text-label font-medium transition-colors ${
                    isActive
                      ? "bg-hover-slate text-ink"
                      : "text-ink-soft hover:text-ink hover:bg-ink/5"
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px]">{tab.icon}</span>
                  {tab.label}
                  {!isLoading && count > 0 && (
                    <span className="text-[11px] text-ink-faint tabular-nums">
                      {count}
                    </span>
                  )}
                  {isLoading && (
                    <span className="w-3 h-3 border-2 rounded-full animate-spin border-ink/20 border-t-ink/60" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="max-w-content mx-auto px-5 lg:px-8 pb-10">
        <main className="pb-24 lg:pb-0 pt-8">
          {/* Flights */}
          {activeTab === "flights" && (
            <motion.section
              key="flights"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.18, ease: EASE }}
            >
              <SectionHeading
                title={
                  flightsLoading
                    ? "Searching flights"
                    : flights.length > 0
                      ? `${flights.length} flights ${(prefs as { departureCity?: string })?.departureCity ? `from ${(prefs as { departureCity?: string }).departureCity}` : ""}`
                      : "Flights"
                }
              />

              {flightsLoading && (
                <LoadingBackdrop image={heroImage}>
                  <div className="flex flex-col items-center justify-center py-20 gap-5">
                    <PlaneLoader />
                    <p className="text-ink-soft text-sm">
                      Searching real flights — this usually takes 10 to 20 seconds.
                    </p>
                  </div>
                </LoadingBackdrop>
              )}

              {!flightsLoading && flights.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...flights]
                    .sort((a, b) =>
                      a.id === cheapestFlight?.id ? -1 : b.id === cheapestFlight?.id ? 1 : 0
                    )
                    .map((f) => (
                      <FlightCard key={f.id} flight={f} cheapest={cheapestFlight?.id === f.id} />
                    ))}
                </div>
              )}

              {!flightsLoading && flights.length === 0 && (() => {
                const p = prefs as Record<string, unknown> | null;
                const hasDeparture = !!(p?.departureCity || (p?.departureCities as string[])?.length);
                const hasDates = !!(p?.startDate && p?.endDate);
                if (!hasDeparture) {
                  return <InlineDepartureCity onSubmit={(city) => handleInlineUpdate({ departureCity: city, departureCities: [city] })} />;
                }
                if (!hasDates) {
                  return <InlineDatePicker onSubmit={(start, end) => handleInlineUpdate({ startDate: start, endDate: end })} tripDays={(p?.tripDurationDays as number) || 5} />;
                }
                return <EmptyState icon="flight_off" message="No flights found. Try different dates, or enter a 3-letter airport code like AUS or JFK as your departure." />;
              })()}
            </motion.section>
          )}

          {/* Stays */}
          {activeTab === "stays" && (
            <motion.section
              key="stays"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.18, ease: EASE }}
            >
              <SectionHeading
                title={
                  hotelsLoading
                    ? "Searching stays"
                    : hotels.length > 0
                      ? `${hotels.length} stays in ${destination}`
                      : "Stays"
                }
              />

              <div className="flex items-center gap-2 mb-6 flex-wrap">
                {STAY_TYPES.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setStayType(t.id)}
                    className={`px-4 py-2 rounded-pill text-label font-semibold border transition-colors ${
                      stayType === t.id
                        ? "bg-ink text-snow-off-glacier border-ink"
                        : "border-line text-ink-soft hover:text-ink hover:border-ink/40"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {hotelsLoading && <LoadingBackdrop image={heroImage} caption="Talking to Booking.com…"><CardSkeletonGrid withImage /></LoadingBackdrop>}

              {!hotelsLoading && hotels.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...hotels]
                    .sort((a, b) =>
                      a.id === bestValueHotel?.id ? -1 : b.id === bestValueHotel?.id ? 1 : 0
                    )
                    .map((h) => (
                      <HotelCard key={h.id} hotel={h} bestValue={bestValueHotel?.id === h.id} />
                    ))}
                </div>
              )}

              {!hotelsLoading && hotels.length === 0 && (() => {
                if (hotelsUnavailable) {
                  return <EmptyState icon="construction" message="Stay search is down on our end right now, not because the city is booked out. The rest of your trip still works." />;
                }
                const p = prefs as Record<string, unknown> | null;
                const hasDates = !!(p?.startDate && p?.endDate);
                if (!hasDates) {
                  return <InlineDatePicker onSubmit={(start, end) => handleInlineUpdate({ startDate: start, endDate: end })} tripDays={(p?.tripDurationDays as number) || 5} />;
                }
                return <EmptyState icon="night_shelter" message="No stays found. Try different dates or destination." />;
              })()}
            </motion.section>
          )}

          {/* Events */}
          {activeTab === "events" && (
            <motion.section
              key="events"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.18, ease: EASE }}
            >
              <SectionHeading
                title={
                  eventsLoading
                    ? "Searching events"
                    : allEvents.length > 0
                      ? `${allEvents.length} events during your trip`
                      : "Events"
                }
              />

              {eventsLoading && <LoadingBackdrop image={heroImage} caption="Checking Ticketmaster for your dates…"><CardSkeletonGrid withImage /></LoadingBackdrop>}

              {!eventsLoading && allEvents.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {allEvents.map((ev, i) => (
                    <EventCard key={ev.id} event={ev} featured={i === 0 && events.length > 0} />
                  ))}
                </div>
              )}

              {!eventsLoading && allEvents.length === 0 && (() => {
                const p = prefs as Record<string, unknown> | null;
                const hasDates = !!(p?.startDate && p?.endDate);
                if (!hasDates) {
                  return <InlineDatePicker onSubmit={(start, end) => handleInlineUpdate({ startDate: start, endDate: end })} tripDays={(p?.tripDurationDays as number) || 5} />;
                }
                return <EmptyState icon="event_busy" message="No live events during your travel dates." />;
              })()}
            </motion.section>
          )}

          {/* Picks */}
          {activeTab === "picks" && (
            <motion.section
              key="picks"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.18, ease: EASE }}
            >
              <SectionHeading
                title={
                  suggestionsLoading
                    ? "Walter is picking spots"
                    : suggestions.length > 0
                      ? `${suggestions.length} spots Walter likes`
                      : "Walter's picks"
                }
              />

              {suggestionsLoading && <LoadingBackdrop image={heroImage} caption="Walter is thinking…"><CardSkeletonGrid /></LoadingBackdrop>}

              {!suggestionsLoading && suggestions.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {suggestions.map((s) => (
                    <SuggestionCard key={s.id} suggestion={s} />
                  ))}
                </div>
              )}

              {!suggestionsLoading && suggestions.length === 0 && (
                <EmptyState icon="explore" message="No curated picks for this destination yet." />
              )}
            </motion.section>
          )}
        </main>

        <TripTracker />

        <p className="text-[11px] text-ink-faint text-center mt-12">
          Walter earns a commission when you book through our links at no extra cost to you.
        </p>
      </div>
    </div>
  );
}

/* ── Trip window formatter ── */
function formatTripWindow(start: string, end: string): string {
  if (!start || !end) return "";
  try {
    const s = new Date(start + "T12:00:00");
    const e = new Date(end + "T12:00:00");
    const fmt = (d: Date) =>
      d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    return `${fmt(s)} to ${fmt(e)}`;
  } catch {
    return "";
  }
}

/* ── Section heading (single line, no eyebrow, no subtitle) ── */
function SectionHeading({ title }: { title: string }) {
  return (
    <h2 className="text-[22px] sm:text-[26px] font-semibold text-ink tracking-display leading-[1.1] mb-6">
      {title}
    </h2>
  );
}

/* ── Empty state (single template, no decoration) ── */
function EmptyState({ icon, message }: { icon: string; message: string }) {
  return (
    <div className="card-base p-10 text-center">
      <span className="material-symbols-outlined text-ink-faint text-3xl mb-3 block">{icon}</span>
      <p className="text-ink-soft text-sm max-w-[40ch] mx-auto">{message}</p>
    </div>
  );
}

/* ── Loading skeleton grid ── */
/* Loading never sits on a blank surface; the destination shows through. */
function LoadingBackdrop({
  image,
  caption,
  children,
}: {
  image: string;
  caption?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="relative rounded-[14px] overflow-hidden">
      <img
        src={image}
        alt=""
        className="absolute inset-0 w-full h-full object-cover opacity-[0.06]"
      />
      <div className="relative">
        {caption && (
          <p className="text-ink-soft text-sm text-center pt-6 pb-4">{caption}</p>
        )}
        {children}
      </div>
    </div>
  );
}

function CardSkeletonGrid({ withImage = false }: { withImage?: boolean }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {[0, 1, 2].map((i) => (
        <div key={i} className="card-base overflow-hidden animate-pulse">
          {withImage && <div className="w-full h-40 bg-raised-slate" />}
          <div className="p-5 space-y-3">
            <div className="h-4 bg-raised-slate rounded w-2/3" />
            <div className="h-3 bg-raised-slate rounded w-full" />
            <div className="h-3 bg-raised-slate rounded w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── AI Itinerary Banner ── */
function AiItineraryBanner() {
  const items = useTripCartStore((s) => s.items);
  const aiItems = items.filter((i) => i.provider === "walter-ai");
  void useTripCartStore(selectItemCount);

  const [expanded, setExpanded] = useState(false);

  if (aiItems.length === 0) return null;

  const byDay = new Map<number, typeof aiItems>();
  aiItems.forEach((item) => {
    const day = (item.meta?.dayNumber as number) || 1;
    if (!byDay.has(day)) byDay.set(day, []);
    byDay.get(day)!.push(item);
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="card-base p-5"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="icon-gradient w-9 h-9 flex items-center justify-center">
            <span className="material-symbols-outlined text-accent text-[18px]">auto_awesome</span>
          </div>
          <div>
            <p className="font-semibold text-ink text-sm">
              Walter&apos;s draft itinerary ({aiItems.length} items)
            </p>
            <p className="text-ink-soft text-xs">
              Swap any item with a real booking below.
            </p>
          </div>
        </div>
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-ink text-sm font-medium border-b border-ink/30 hover:border-ink pb-0.5 transition-colors flex items-center gap-1"
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
          transition={{ duration: 0.18, ease: EASE }}
          className="mt-4 pt-4 border-t border-line"
        >
          <div className="space-y-3">
            {Array.from(byDay.entries())
              .sort(([a], [b]) => a - b)
              .map(([day, dayItems]) => (
                <div key={day}>
                  <p className="text-xs font-semibold text-ink-faint uppercase tracking-wider mb-1.5">
                    Day {day}
                  </p>
                  <div className="space-y-1">
                    {dayItems.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-2 text-sm bg-raised-slate rounded-[8px] px-3 py-2"
                      >
                        <span className="text-[10px] text-ink-faint w-12">
                          {(item.meta?.startTime as string) || ""}
                        </span>
                        <span className="bg-card text-ink border border-line rounded-pill px-1.5 py-0.5 text-[9px] font-semibold uppercase">
                          {item.type}
                        </span>
                        <span className="flex-1 truncate text-ink">{item.title}</span>
                        {item.price != null && item.price > 0 && (
                          <span className="text-ink font-semibold text-xs">${item.price}</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

/* ── Inline Departure City Input ── */
interface MapboxFeature {
  id: string;
  place_name: string;
  text: string;
  context?: Array<{ id: string; text: string }>;
}

function InlineDepartureCity({ onSubmit }: { onSubmit: (city: string) => void }) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<MapboxFeature[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const search = useCallback((q: string) => {
    if (q.length < 2) { setSuggestions([]); return; }
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
        const res = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(q)}.json?types=place&limit=5&access_token=${token}`);
        const data = await res.json();
        setSuggestions(data.features || []);
        setShowSuggestions(true);
      } catch { setSuggestions([]); }
    }, 300);
  }, []);

  useEffect(() => () => clearTimeout(debounceRef.current), []);

  const formatCity = (f: MapboxFeature) => {
    const country = f.context?.find((c) => c.id.startsWith("country"));
    return country ? `${f.text}, ${country.text}` : f.place_name;
  };

  return (
    <div className="card-base p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="icon-gradient w-10 h-10 flex items-center justify-center">
          <span className="material-symbols-outlined text-accent text-[20px]">flight_takeoff</span>
        </div>
        <div>
          <p className="font-semibold text-ink">Where are you flying from?</p>
          <p className="text-ink-soft text-xs">Add your departure city to search flights.</p>
        </div>
      </div>
      <div className="relative">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint text-[18px]">search</span>
            <input
              type="text"
              value={query}
              onChange={(e) => { setQuery(e.target.value); search(e.target.value); }}
              onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && query.trim().length >= 2) {
                  e.preventDefault();
                  onSubmit(query.trim());
                }
              }}
              placeholder="City or airport code"
              className="w-full pl-10 pr-4 py-3 rounded-pill bg-raised-slate border border-line text-ink placeholder:text-ink-faint focus:outline-none focus:border-accent transition-colors"
            />
          </div>
          <button
            onClick={() => query.trim().length >= 2 && onSubmit(query.trim())}
            disabled={query.trim().length < 2}
            className="bg-accent text-snow-off-glacier rounded-pill px-5 py-3 font-semibold hover:bg-accent-light transition-colors disabled:opacity-40 flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[18px]">search</span>
            Search
          </button>
        </div>
        {showSuggestions && (suggestions.length > 0 || /^[a-zA-Z]{3}$/.test(query.trim())) && (
          <div className="absolute z-20 left-0 right-0 mt-2 bg-card rounded-[14px] border border-line shadow-[0_12px_40px_rgba(20,30,60,0.12)] overflow-hidden">
            {/^[a-zA-Z]{3}$/.test(query.trim()) && (
              <button
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  onSubmit(query.trim().toUpperCase());
                  setShowSuggestions(false);
                }}
                className="w-full text-left px-4 py-3 text-sm text-ink hover:bg-ink/5 transition-colors flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-accent text-[18px]">flight_takeoff</span>
                Use airport code <span className="font-semibold">{query.trim().toUpperCase()}</span>
              </button>
            )}
            {suggestions.map((f) => (
              <button
                key={f.id}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  onSubmit(formatCity(f));
                  setShowSuggestions(false);
                }}
                className="w-full text-left px-4 py-3 text-sm text-ink hover:bg-ink/5 transition-colors"
              >
                {formatCity(f)}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Inline Date Picker ── */
function InlineDatePicker({ onSubmit, tripDays }: { onSubmit: (start: string, end: string) => void; tripDays: number }) {
  const fmt = (d: Date) => d.toISOString().split("T")[0];
  const display = (d: Date) => d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
  const now = new Date();

  const options = [
    { label: "Next week", offset: 7 },
    { label: "In 2 weeks", offset: 14 },
    { label: "In 3 weeks", offset: 21 },
    { label: "Next month", offset: 30 },
  ];

  return (
    <div className="card-base p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="icon-gradient w-10 h-10 flex items-center justify-center">
          <span className="material-symbols-outlined text-accent text-[20px]">calendar_month</span>
        </div>
        <div>
          <p className="font-semibold text-ink">When do you want to go?</p>
          <p className="text-ink-soft text-xs">Pick your travel dates.</p>
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {options.map((opt) => {
          const start = new Date(now);
          start.setDate(start.getDate() + opt.offset);
          const end = new Date(start);
          end.setDate(end.getDate() + tripDays);
          return (
            <button
              key={opt.offset}
              onClick={() => onSubmit(fmt(start), fmt(end))}
              className="card-base p-3 text-center hover:border-ink/20 transition-colors cursor-pointer"
            >
              <p className="font-semibold text-ink text-sm mb-1">{opt.label}</p>
              <p className="text-ink-faint text-[11px]">{display(start)} to {display(end)}</p>
              <p className="text-accent-dark text-[11px] font-semibold mt-1">{tripDays} days</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
