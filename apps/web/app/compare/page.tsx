"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { useSavedTripsStore } from "@/lib/stores/savedTripsStore";
import { useTripCartStore } from "@/lib/stores/tripCartStore";

type TripDay = {
  dayNumber: number;
  title: string;
  items: {
    itemType: string;
    title: string;
    description: string;
    startTime: string;
    estimatedCost: number;
    locationName: string;
  }[];
};

type CompareTrip = {
  destination: string;
  title: string;
  summary: string;
  totalEstimatedCost: number;
  flightEstimate: number;
  hotelEstimatePerNight: number;
  topEvents: string[];
  highlights: string[];
  bestTimeToVisit: string;
  days: TripDay[];
};

type FlightData = {
  cheapest: number | null;
  fastest: { price: number; duration: string } | null;
  count: number;
  loading: boolean;
};

type RealEvent = {
  name: string;
  date: string;
  venueName: string;
  category: string;
  priceMin: number | null;
};

type EventData = {
  events: RealEvent[];
  count: number;
  loading: boolean;
};

export default function ComparePage() {
  const router = useRouter();
  const [trips, setTrips] = useState<CompareTrip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedTrip, setExpandedTrip] = useState<number | null>(null);
  const [flightData, setFlightData] = useState<Record<number, FlightData>>({});
  const [eventData, setEventData] = useState<Record<number, EventData>>({});
  const [savedIds, setSavedIds] = useState<Set<number>>(new Set());
  const [quizPrefs, setQuizPrefs] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("walter_prefs");
    if (!stored) {
      router.push("/quiz");
      return;
    }

    const quizData = JSON.parse(stored);
    setQuizPrefs(quizData);

    fetch("/api/compare", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(quizData),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
        } else {
          const tripList = data.trips || [];
          setTrips(tripList);

          // Fetch real flight prices in parallel for each destination
          const departureCity = quizData.departureCity || "";
          const startDate = quizData.startDate || "";
          const endDate = quizData.endDate || "";
          const adults = quizData.travelersCount || quizData.travelers || 1;
          const cabinClass = quizData.flightClass || "economy";

          if (departureCity && startDate && endDate) {
            tripList.forEach((trip: CompareTrip, idx: number) => {
              setFlightData((prev) => ({
                ...prev,
                [idx]: { cheapest: null, fastest: null, count: 0, loading: true },
              }));

              fetch("/api/flights", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  origin: departureCity,
                  destination: trip.destination,
                  departDate: startDate,
                  returnDate: endDate,
                  adults,
                  cabinClass,
                }),
              })
                .then((r) => r.json())
                .then((fData) => {
                  const flights = fData.flights || [];
                  const cheapest = flights.length > 0
                    ? Math.min(...flights.map((f: { price: number }) => f.price))
                    : null;
                  const fastest = flights.length > 0
                    ? flights.reduce((a: { duration: string; price: number }, b: { duration: string; price: number }) => {
                        const dA = parseInt(a.duration) || 99;
                        const dB = parseInt(b.duration) || 99;
                        return dA < dB ? a : b;
                      })
                    : null;

                  setFlightData((prev) => ({
                    ...prev,
                    [idx]: {
                      cheapest,
                      fastest: fastest ? { price: fastest.price, duration: fastest.duration } : null,
                      count: flights.length,
                      loading: false,
                    },
                  }));
                })
                .catch(() => {
                  setFlightData((prev) => ({
                    ...prev,
                    [idx]: { cheapest: null, fastest: null, count: 0, loading: false },
                  }));
                });
            });
          }

          // Fetch real events in parallel for each destination
          if (startDate && endDate) {
            const vibes = quizData.activityInterests || quizData.vibes || [];
            tripList.forEach((trip: CompareTrip, idx: number) => {
              setEventData((prev) => ({
                ...prev,
                [idx]: { events: [], count: 0, loading: true },
              }));

              fetch("/api/search", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  destination: trip.destination,
                  startDate,
                  endDate,
                  vibes,
                  travelers: adults,
                }),
              })
                .then((r) => r.json())
                .then((eData) => {
                  const all = [
                    ...(eData.exactMatches || []),
                    ...(eData.similarMatches || []),
                    ...(eData.topInArea || []),
                  ];
                  const mapped: RealEvent[] = all.slice(0, 8).map((ev: Record<string, unknown>) => ({
                    name: ev.name as string,
                    date: ev.date as string,
                    venueName: ev.venueName as string,
                    category: ev.category as string,
                    priceMin: (ev.priceMin as number) || null,
                  }));

                  setEventData((prev) => ({
                    ...prev,
                    [idx]: { events: mapped, count: all.length, loading: false },
                  }));
                })
                .catch(() => {
                  setEventData((prev) => ({
                    ...prev,
                    [idx]: { events: [], count: 0, loading: false },
                  }));
                });
            });
          }
        }
      })
      .catch(() => setError("Failed to generate trip options. Please try again."))
      .finally(() => setLoading(false));
  }, [router]);

  const handleSelectTrip = (trip: CompareTrip, tripIdx: number) => {
    // Update prefs with selected destination
    const stored = localStorage.getItem("walter_prefs");
    if (stored) {
      const prefs = JSON.parse(stored);
      prefs.destinations = [trip.destination];
      prefs.destination = trip.destination;
      prefs.surpriseMe = false;
      localStorage.setItem("walter_prefs", JSON.stringify(prefs));
    }

    // Pre-load AI itinerary items into the cart
    const cart = useTripCartStore.getState();
    cart.clearCart();

    trip.days?.forEach((day) => {
      day.items?.forEach((item, j) => {
        cart.addItem({
          id: `ai-${tripIdx}-${day.dayNumber}-${j}`,
          type: (item.itemType || "activity") as "flight" | "hotel" | "event" | "activity" | "restaurant" | "site",
          title: item.title,
          subtitle: `Day ${day.dayNumber} -- ${item.description || ""}`,
          price: item.estimatedCost || null,
          image: null,
          bookingUrl: null,
          provider: "walter-ai",
          date: null,
          meta: {
            locationName: item.locationName,
            aiGenerated: true,
            dayNumber: day.dayNumber,
            startTime: item.startTime,
          } as Record<string, unknown>,
        });
      });
    });

    router.push("/results");
  };

  const handleSaveOption = (trip: CompareTrip, idx: number) => {
    // Convert AI trip items to cart items and save
    const cartItems = trip.days?.flatMap((day) =>
      day.items.map((item, j) => ({
        id: `compare-${idx}-${day.dayNumber}-${j}`,
        type: (item.itemType || "activity") as "flight" | "hotel" | "event" | "activity" | "restaurant" | "site",
        title: item.title,
        subtitle: item.description || "",
        price: item.estimatedCost || null,
        image: null,
        bookingUrl: null,
        provider: null,
        date: null,
        meta: { locationName: item.locationName } as Record<string, unknown>,
      }))
    ) || [];

    useSavedTripsStore.getState().saveTrip(
      trip.title,
      trip.destination,
      cartItems
    );
    setSavedIds((prev) => new Set([...prev, idx]));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-page-bg">
        <header className="fixed top-0 left-0 right-0 z-20 nav-glass">
          <div className="max-w-content mx-auto px-4 lg:px-8 py-4 flex items-center justify-between">
            <Link href="/" className="text-white text-[17px] font-semibold">Walter</Link>
            <Link href="/quiz" className="text-accent-light text-sm hover:underline flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[18px]">edit</span>
              Edit trip
            </Link>
          </div>
        </header>

        <div className="flex flex-col items-center justify-center min-h-screen px-6 pt-[48px]">
          <div className="w-10 h-10 border-4 border-accent border-t-transparent rounded-full animate-spin mb-6" />
          <p className="text-[17px] font-semibold text-gray-dark mb-2">Walter is planning your options...</p>
          <p className="text-on-light-secondary text-sm">Comparing destinations, flights, and events</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-page-bg">
        <header className="fixed top-0 left-0 right-0 z-20 nav-glass">
          <div className="max-w-content mx-auto px-4 lg:px-8 py-4 flex items-center justify-between">
            <Link href="/" className="text-white text-[17px] font-semibold">Walter</Link>
          </div>
        </header>

        <div className="flex flex-col items-center justify-center min-h-screen px-6 pt-[48px]">
          <span className="material-symbols-outlined text-on-light-tertiary text-4xl mb-4">error_outline</span>
          <p className="font-semibold text-gray-dark mb-2">Something went wrong</p>
          <p className="text-on-light-secondary text-sm mb-6">{error}</p>
          <button
            onClick={() => router.push("/quiz")}
            className="bg-accent text-white rounded-[10px] px-6 py-3 font-semibold hover:bg-accent-light transition-colors"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-page-bg">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-20 nav-glass">
        <div className="max-w-content mx-auto px-4 lg:px-8 py-4 flex items-center justify-between">
          <Link href="/" className="text-white text-[17px] font-semibold">Walter</Link>
          <Link href="/quiz" className="text-accent-light text-sm hover:underline flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[18px]">edit</span>
            Edit preferences
          </Link>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 lg:px-8 pt-28 pb-16">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <h1 className="text-[28px] font-semibold text-gray-dark leading-page mb-3">
            Compare your options
          </h1>
          <p className="text-on-light-secondary text-[17px]">
            Walter found {trips.length} trip options for you. Compare them and pick your favorite.
          </p>
        </motion.div>

        {/* Comparison Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
          {trips.map((trip, i) => {
            const isExpanded = expandedTrip === i;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.1 }}
                className="card-base overflow-hidden flex flex-col"
              >
                {/* Header gradient */}
                <div className="bg-hero-gradient relative p-6 pb-8">
                  <div className="hero-glow absolute inset-0 pointer-events-none" />
                  <div className="relative z-10">
                    <p className="text-cyan text-[11px] font-semibold uppercase tracking-wider mb-2">
                      Option {i + 1}
                    </p>
                    <h2 className="text-white text-[21px] font-semibold leading-card-title mb-2">
                      {trip.destination}
                    </h2>
                    <p className="text-on-dark-secondary text-sm leading-relaxed">
                      {trip.summary}
                    </p>
                  </div>
                </div>

                {/* Key Metrics */}
                <div className="p-6 flex-1 flex flex-col">
                  {/* Price */}
                  <div className="flex items-center justify-between mb-4 pb-4 border-b border-[rgba(0,101,113,0.06)]">
                    <span className="text-on-light-secondary text-sm">Total estimated cost</span>
                    <span className="text-accent text-[21px] font-semibold">
                      ${trip.totalEstimatedCost.toLocaleString()}
                    </span>
                  </div>

                  {/* Flight & Hotel */}
                  <div className="mb-4 pb-4 border-b border-[rgba(0,101,113,0.06)]">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className="material-symbols-outlined text-accent text-[16px]">flight</span>
                          <span className="text-on-light-tertiary text-xs">Flights</span>
                        </div>
                        {flightData[i]?.loading ? (
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
                            <span className="text-on-light-tertiary text-xs">Searching...</span>
                          </div>
                        ) : flightData[i]?.cheapest != null ? (
                          <div>
                            <p className="font-semibold text-accent text-[17px]">
                              ${flightData[i].cheapest!.toLocaleString()}
                            </p>
                            <p className="text-[10px] text-on-light-tertiary">
                              cheapest of {flightData[i].count} flights
                            </p>
                          </div>
                        ) : (
                          <p className="font-semibold text-gray-dark">
                            ~${trip.flightEstimate?.toLocaleString() || "N/A"}
                            <span className="text-[10px] text-on-light-tertiary ml-1">est.</span>
                          </p>
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className="material-symbols-outlined text-accent text-[16px]">hotel</span>
                          <span className="text-on-light-tertiary text-xs">Per night</span>
                        </div>
                        <p className="font-semibold text-gray-dark">
                          ~${trip.hotelEstimatePerNight?.toLocaleString() || "N/A"}
                          <span className="text-[10px] text-on-light-tertiary ml-1">est.</span>
                        </p>
                      </div>
                    </div>
                    {/* Flight duration */}
                    {flightData[i]?.fastest && (
                      <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-[rgba(0,101,113,0.04)]">
                        <span className="material-symbols-outlined text-on-light-tertiary text-[14px]">schedule</span>
                        <span className="text-xs text-on-light-secondary">
                          Fastest flight: {flightData[i].fastest!.duration} (${flightData[i].fastest!.price})
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Highlights */}
                  <div className="mb-4 pb-4 border-b border-[rgba(0,101,113,0.06)]">
                    <p className="text-on-light-tertiary text-xs uppercase tracking-wider mb-2">Highlights</p>
                    <div className="flex flex-wrap gap-1.5">
                      {trip.highlights?.slice(0, 3).map((h, j) => (
                        <span key={j} className="bg-[#e6f7f9] text-accent rounded-pill px-2.5 py-0.5 text-[11px] font-semibold">
                          {h}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Live Events */}
                  <div className="mb-4 pb-4 border-b border-[rgba(0,101,113,0.06)]">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-on-light-tertiary text-xs uppercase tracking-wider">Live Events</p>
                      {eventData[i] && !eventData[i].loading && (
                        <span className="text-[10px] text-on-light-tertiary">
                          {eventData[i].count} found
                        </span>
                      )}
                    </div>
                    {eventData[i]?.loading ? (
                      <div className="flex items-center gap-2 py-2">
                        <div className="w-3 h-3 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
                        <span className="text-on-light-tertiary text-xs">Searching events...</span>
                      </div>
                    ) : eventData[i]?.events.length > 0 ? (
                      <ul className="space-y-2">
                        {eventData[i].events.slice(0, 4).map((ev, j) => (
                          <li key={j} className="flex items-start gap-2 text-sm">
                            <span className="material-symbols-outlined text-accent text-[14px] mt-0.5">confirmation_number</span>
                            <div className="flex-1 min-w-0">
                              <p className="text-gray-dark truncate">{ev.name}</p>
                              <p className="text-[11px] text-on-light-tertiary">
                                {ev.category} -- {ev.venueName}
                                {ev.priceMin != null && ev.priceMin > 0 && (
                                  <span className="text-accent ml-1">${ev.priceMin}+</span>
                                )}
                              </p>
                            </div>
                          </li>
                        ))}
                        {eventData[i].count > 4 && (
                          <li className="text-xs text-on-light-tertiary pl-6">
                            +{eventData[i].count - 4} more events
                          </li>
                        )}
                      </ul>
                    ) : trip.topEvents?.length > 0 ? (
                      /* Fallback to AI suggestions if no real events */
                      <ul className="space-y-1.5">
                        {trip.topEvents.slice(0, 3).map((ev, j) => (
                          <li key={j} className="flex items-start gap-2 text-sm text-gray-dark">
                            <span className="material-symbols-outlined text-on-light-tertiary text-[14px] mt-0.5">auto_awesome</span>
                            <span>{ev} <span className="text-[10px] text-on-light-tertiary">(suggested)</span></span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-xs text-on-light-tertiary py-1">No events found for these dates</p>
                    )}
                  </div>

                  {/* Trip Duration */}
                  <div className="flex items-center gap-2 mb-4">
                    <span className="material-symbols-outlined text-accent text-[16px]">schedule</span>
                    <span className="text-sm text-on-light-secondary">
                      {trip.days?.length || 0} days
                    </span>
                    {trip.bestTimeToVisit && (
                      <>
                        <span className="text-on-light-tertiary">|</span>
                        <span className="text-sm text-on-light-secondary">{trip.bestTimeToVisit}</span>
                      </>
                    )}
                  </div>

                  {/* Expandable Day-by-Day Preview */}
                  {isExpanded && trip.days && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      transition={{ duration: 0.2 }}
                      className="mb-4 pb-4 border-b border-[rgba(0,101,113,0.06)]"
                    >
                      <p className="text-on-light-tertiary text-xs uppercase tracking-wider mb-3">Day-by-day preview</p>
                      <div className="space-y-3">
                        {trip.days.map((day) => (
                          <div key={day.dayNumber} className="bg-page-bg rounded-[10px] p-3">
                            <p className="text-sm font-semibold text-gray-dark mb-1">
                              Day {day.dayNumber}: {day.title}
                            </p>
                            <div className="space-y-1">
                              {day.items?.slice(0, 3).map((item, k) => (
                                <p key={k} className="text-xs text-on-light-secondary flex items-center gap-1.5">
                                  <span className="text-on-light-tertiary">{item.startTime}</span>
                                  {item.title}
                                </p>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {/* Actions */}
                  <div className="mt-auto pt-2 space-y-2">
                    <button
                      onClick={() => setExpandedTrip(isExpanded ? null : i)}
                      className="w-full text-center text-accent text-sm font-semibold hover:text-accent-light transition-colors py-1"
                    >
                      {isExpanded ? "Show less" : "View day-by-day"}
                    </button>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleSaveOption(trip, i)}
                        disabled={savedIds.has(i)}
                        className={`flex-shrink-0 rounded-[10px] px-4 py-3 text-sm font-semibold transition-colors flex items-center gap-1.5 ${
                          savedIds.has(i)
                            ? "bg-page-bg text-accent"
                            : "border border-[rgba(0,101,113,0.08)] text-on-light-secondary hover:border-accent hover:text-accent"
                        }`}
                      >
                        <span className="material-symbols-outlined text-[16px]">
                          {savedIds.has(i) ? "check" : "bookmark"}
                        </span>
                        {savedIds.has(i) ? "Saved" : "Save"}
                      </button>
                      <button
                        onClick={() => handleSelectTrip(trip, i)}
                        className="flex-1 bg-accent text-white rounded-[10px] px-5 py-3 text-[15px] font-semibold hover:bg-accent-light transition-colors flex items-center justify-center gap-2"
                      >
                        Choose this trip
                        <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
