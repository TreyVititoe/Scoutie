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
  const [mode, setMode] = useState<"destinations" | "dates" | null>(null);
  const [trips, setTrips] = useState<CompareTrip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedTrip, setExpandedTrip] = useState<number | null>(null);
  const [flightData, setFlightData] = useState<Record<number, FlightData>>({});
  const [eventData, setEventData] = useState<Record<number, EventData>>({});
  const [savedIds, setSavedIds] = useState<Set<number>>(new Set());
  const [quizPrefs, setQuizPrefs] = useState<Record<string, unknown> | null>(null);
  const [regenHint, setRegenHint] = useState("");
  const [regenOpen, setRegenOpen] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("walter_prefs");
    if (!stored) {
      router.push("/quiz");
      return;
    }

    const quizData = JSON.parse(stored);
    setQuizPrefs(quizData);

    const hasDestination = (quizData.destinations?.length === 1 && !quizData.surpriseMe);
    const hasDates = quizData.startDate && quizData.endDate;

    // Single destination but no dates → date comparison mode
    if (hasDestination && !hasDates) {
      setMode("dates");
      setLoading(false);
      return;
    }

    // Multiple destinations, no destinations, or surprise me → AI destination comparison
    setMode("destinations");

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
          const adults = quizData.travelersCount || quizData.travelers || 1;
          const cabinClass = quizData.flightClass || "economy";

          // Generate fallback dates if none set (2 weeks out, trip duration or 5 days)
          let startDate = quizData.startDate || "";
          let endDate = quizData.endDate || "";
          if (!startDate || !endDate) {
            const now = new Date();
            const fallbackStart = new Date(now);
            fallbackStart.setDate(fallbackStart.getDate() + 14);
            const tripDays = quizData.tripDurationDays || 5;
            const fallbackEnd = new Date(fallbackStart);
            fallbackEnd.setDate(fallbackEnd.getDate() + tripDays);
            startDate = fallbackStart.toISOString().split("T")[0];
            endDate = fallbackEnd.toISOString().split("T")[0];
          }

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
                    ? flights.reduce((a: { outbound: { duration: string }; price: number }, b: { outbound: { duration: string }; price: number }) => {
                        const dA = parseInt(a.outbound?.duration ?? "") || 99;
                        const dB = parseInt(b.outbound?.duration ?? "") || 99;
                        return dA < dB ? a : b;
                      })
                    : null;

                  setFlightData((prev) => ({
                    ...prev,
                    [idx]: {
                      cheapest,
                      fastest: fastest ? { price: fastest.price, duration: fastest.outbound?.duration ?? "" } : null,
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

    // Accepting a trip option signals "I like this destination + dates" —
    // the user picks their own itinerary items on /results. Cart stays empty.
    void tripIdx;
    useTripCartStore.getState().clearCart();

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

  if (error && trips.length === 0) {
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
        {/* Date Comparison Mode */}
        {mode === "dates" && (
          <DateCompare
            quizPrefs={quizPrefs}
            onSelect={(start, end) => {
              const stored = localStorage.getItem("walter_prefs");
              if (stored) {
                const p = JSON.parse(stored);
                p.startDate = start;
                p.endDate = end;
                localStorage.setItem("walter_prefs", JSON.stringify(p));
              }
              router.push("/results");
            }}
          />
        )}

        {/* Destination Comparison Mode */}
        {mode === "destinations" && (
        <>
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <h1 className="text-[28px] font-semibold text-gray-dark leading-page mb-3">
            Compare your options
          </h1>
          <p className="text-on-light-secondary text-[17px] mb-5">
            {loading
              ? "Walter is finding the best options for you..."
              : `Walter found ${trips.length} trip options for you. Compare them and pick your favorite.`}
          </p>

          {/* Regenerate bar */}
          {!loading && <div className="card-base p-4">
            <div
              className="flex items-center justify-between cursor-pointer"
              onClick={() => setRegenOpen(!regenOpen)}
            >
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-accent text-[18px]">refresh</span>
                <span className="text-sm font-semibold text-gray-dark">Not what you had in mind? Regenerate</span>
              </div>
              <span className="material-symbols-outlined text-on-light-tertiary text-[18px]">
                {regenOpen ? "expand_less" : "expand_more"}
              </span>
            </div>

            {regenOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                transition={{ duration: 0.2 }}
                className="mt-4 pt-4 border-t border-[rgba(194,85,56,0.06)]"
              >
                <p className="text-on-light-secondary text-sm mb-3">
                  Tell Walter what you are looking for -- a city, country, region, or vibe.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="text"
                    value={regenHint}
                    onChange={(e) => setRegenHint(e.target.value)}
                    placeholder='e.g. "tropical", "Japan", "Malibu", "European cities"'
                    className="flex-1 px-4 py-2.5 rounded-[10px] border border-[rgba(194,85,56,0.08)] text-gray-dark text-sm placeholder:text-on-light-tertiary focus:outline-none focus:ring-2 focus:ring-accent/20"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        document.getElementById("regen-btn")?.click();
                      }
                    }}
                  />
                  <button
                    id="regen-btn"
                    onClick={() => {
                      setTrips([]);
                      setFlightData({});
                      setEventData({});
                      setSavedIds(new Set());
                      setExpandedTrip(null);
                      setLoading(true);
                      setError(null);
                      setRegenOpen(false);

                      const stored = localStorage.getItem("walter_prefs");
                      if (!stored) return;
                      const quizData = JSON.parse(stored);
                      if (regenHint.trim()) {
                        quizData.destinationHint = regenHint.trim();
                      }

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

                            const dCity = quizData.departureCity || "";
                            const adults = quizData.travelersCount || quizData.travelers || 1;
                            const cabinClass = quizData.flightClass || "economy";
                            const vibes = quizData.activityInterests || quizData.vibes || [];

                            let sDate = quizData.startDate || "";
                            let eDate = quizData.endDate || "";
                            if (!sDate || !eDate) {
                              const now = new Date();
                              const fs = new Date(now); fs.setDate(fs.getDate() + 14);
                              const td = quizData.tripDurationDays || 5;
                              const fe = new Date(fs); fe.setDate(fe.getDate() + td);
                              sDate = fs.toISOString().split("T")[0];
                              eDate = fe.toISOString().split("T")[0];
                            }

                            if (dCity && sDate && eDate) {
                              tripList.forEach((trip: CompareTrip, idx: number) => {
                                setFlightData((prev) => ({ ...prev, [idx]: { cheapest: null, fastest: null, count: 0, loading: true } }));
                                fetch("/api/flights", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ origin: dCity, destination: trip.destination, departDate: sDate, returnDate: eDate, adults, cabinClass }) })
                                  .then((r) => r.json())
                                  .then((fData) => {
                                    const fl = fData.flights || [];
                                    const prices = fl.map((f: { price: number }) => f.price);
                                    const cheapest = prices.length ? Math.min(...prices) : null;
                                    const fastest = fl.length ? fl.reduce((a: { outbound: { duration: string }; price: number }, b: { outbound: { duration: string }; price: number }) => (parseInt(a.outbound?.duration ?? "") || 99) < (parseInt(b.outbound?.duration ?? "") || 99) ? a : b) : null;
                                    setFlightData((prev) => ({ ...prev, [idx]: { cheapest, fastest: fastest ? { price: fastest.price, duration: fastest.outbound?.duration ?? "" } : null, count: fl.length, loading: false } }));
                                  })
                                  .catch(() => setFlightData((prev) => ({ ...prev, [idx]: { cheapest: null, fastest: null, count: 0, loading: false } })));
                              });
                            }

                            if (sDate && eDate) {
                              tripList.forEach((trip: CompareTrip, idx: number) => {
                                setEventData((prev) => ({ ...prev, [idx]: { events: [], count: 0, loading: true } }));
                                fetch("/api/search", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ destination: trip.destination, startDate: sDate, endDate: eDate, vibes, travelers: adults }) })
                                  .then((r) => r.json())
                                  .then((eData) => {
                                    const all = [...(eData.exactMatches || []), ...(eData.similarMatches || []), ...(eData.topInArea || [])];
                                    const mapped = all.slice(0, 8).map((ev: Record<string, unknown>) => ({ name: ev.name as string, date: ev.date as string, venueName: ev.venueName as string, category: ev.category as string, priceMin: (ev.priceMin as number) || null }));
                                    setEventData((prev) => ({ ...prev, [idx]: { events: mapped, count: all.length, loading: false } }));
                                  })
                                  .catch(() => setEventData((prev) => ({ ...prev, [idx]: { events: [], count: 0, loading: false } })));
                              });
                            }
                          }
                        })
                        .catch(() => setError("Failed to regenerate. Please try again."))
                        .finally(() => setLoading(false));
                    }}
                    className="bg-accent text-white rounded-[10px] px-5 py-2.5 text-sm font-semibold hover:bg-accent-light transition-colors flex items-center gap-1.5 flex-shrink-0"
                  >
                    <span className="material-symbols-outlined text-[16px]">refresh</span>
                    Regenerate
                  </button>
                </div>
              </motion.div>
            )}
          </div>}
        </motion.div>

        {/* Comparison Cards */}
        {/* Skeleton cards while loading */}
        {loading && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
            {[0, 1, 2].map((i) => (
              <div key={i} className="card-base overflow-hidden animate-pulse">
                <div className="h-1 bg-gradient-to-r from-accent/30 to-cyan/30" />
                <div className="p-5 pb-4 border-b border-[rgba(194,85,56,0.06)]">
                  <div className="flex items-center justify-between mb-3">
                    <div className="h-5 bg-page-bg rounded w-2/3" />
                    <div className="h-5 bg-page-bg rounded-pill w-16" />
                  </div>
                  <div className="h-3 bg-page-bg rounded w-1/2" />
                </div>
                <div className="p-5">
                  <div className="bg-[#FFF2D9]/30 rounded-[10px] p-4 mb-5">
                    <div className="h-3 bg-page-bg rounded w-1/3 mb-2" />
                    <div className="h-8 bg-page-bg rounded w-2/3 mb-1" />
                    <div className="h-3 bg-page-bg rounded w-1/4" />
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between py-3 border-t border-[rgba(194,85,56,0.06)]">
                      <div className="h-4 bg-page-bg rounded w-20" />
                      <div className="h-4 bg-page-bg rounded w-24" />
                    </div>
                    <div className="flex justify-between py-3 border-t border-[rgba(194,85,56,0.06)]">
                      <div className="h-4 bg-page-bg rounded w-16" />
                      <div className="h-4 bg-page-bg rounded w-24" />
                    </div>
                    <div className="py-3 border-t border-[rgba(194,85,56,0.06)]">
                      <div className="flex justify-between mb-3">
                        <div className="h-4 bg-page-bg rounded w-24" />
                        <div className="h-6 bg-page-bg rounded w-8" />
                      </div>
                      <div className="flex gap-1.5">
                        <div className="h-5 bg-page-bg rounded-pill w-16" />
                        <div className="h-5 bg-page-bg rounded-pill w-14" />
                      </div>
                    </div>
                  </div>
                  <div className="h-12 bg-page-bg rounded-[10px] mt-6" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Real cards */}
        {!loading && <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
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
                  <div className="flex items-center justify-between mb-4 pb-4 border-b border-[rgba(194,85,56,0.06)]">
                    <span className="text-on-light-secondary text-sm">Total estimated cost</span>
                    <span className="text-accent text-[21px] font-semibold">
                      ${trip.totalEstimatedCost.toLocaleString()}
                    </span>
                  </div>

                  {/* Flight & Hotel */}
                  <div className="mb-4 pb-4 border-b border-[rgba(194,85,56,0.06)]">
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
                      <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-[rgba(194,85,56,0.04)]">
                        <span className="material-symbols-outlined text-on-light-tertiary text-[14px]">schedule</span>
                        <span className="text-xs text-on-light-secondary">
                          Fastest flight: {flightData[i].fastest!.duration} (${flightData[i].fastest!.price})
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Highlights */}
                  <div className="mb-4 pb-4 border-b border-[rgba(194,85,56,0.06)]">
                    <p className="text-on-light-tertiary text-xs uppercase tracking-wider mb-2">Highlights</p>
                    <div className="flex flex-wrap gap-1.5">
                      {trip.highlights?.slice(0, 3).map((h, j) => (
                        <span key={j} className="bg-[#FFF2D9] text-accent rounded-pill px-2.5 py-0.5 text-[11px] font-semibold">
                          {h}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Live Events */}
                  <div className="mb-4 pb-4 border-b border-[rgba(194,85,56,0.06)]">
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
                      className="mb-4 pb-4 border-b border-[rgba(194,85,56,0.06)]"
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
                            : "border border-[rgba(194,85,56,0.08)] text-on-light-secondary hover:border-accent hover:text-accent"
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
        </div>}
        </>
        )}
      </div>
    </div>
  );
}

/* ── Date Comparison Component ── */
function DateCompare({
  quizPrefs,
  onSelect,
}: {
  quizPrefs: Record<string, unknown> | null;
  onSelect: (start: string, end: string) => void;
}) {
  const [data, setData] = useState<Record<number, {
    flights: { min: number; max: number; count: number; loading: boolean };
    hotels: { min: number; max: number; count: number; loading: boolean };
    events: { count: number; categories: string[]; topEvents: { name: string; venue: string; image: string | null }[]; loading: boolean };
  }>>({});
  const [dateRegenOpen, setDateRegenOpen] = useState(false);
  const [dateRegenHint, setDateRegenHint] = useState("");
  const [fetchKey, setFetchKey] = useState(0);

  const prefs = quizPrefs || {};
  const tripDays = (prefs.tripDurationDays as number) || 5;
  const destination = (prefs.destinations as string[])?.[0] || (prefs.destination as string) || "";
  const departureCity = (prefs.departureCity as string) || "";
  const adults = (prefs.travelersCount as number) || (prefs.travelers as number) || 1;
  const cabinClass = (prefs.flightClass as string) || "economy";
  const vibes = (prefs.activityInterests as string[]) || (prefs.vibes as string[]) || [];

  const formatDateStr = (d: Date) => d.toISOString().split("T")[0];
  const formatDisplay = (d: Date) =>
    d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });

  // Parse hint into a base date. Supports: "May", "June", "December", "May 15", "next month", etc.
  function getBaseDateFromHint(hint: string): Date | null {
    if (!hint.trim()) return null;
    const h = hint.trim().toLowerCase();

    const months: Record<string, number> = {
      january: 0, jan: 0, february: 1, feb: 1, march: 2, mar: 2,
      april: 3, apr: 3, may: 4, june: 5, jun: 5, july: 6, jul: 6,
      august: 7, aug: 7, september: 8, sep: 8, october: 9, oct: 9,
      november: 10, nov: 10, december: 11, dec: 11,
    };

    // Check for month name (with optional day)
    for (const [name, monthIdx] of Object.entries(months)) {
      if (h.startsWith(name)) {
        const rest = h.slice(name.length).trim();
        const day = parseInt(rest) || 1;
        const now = new Date();
        let year = now.getFullYear();
        // If the month has already passed this year, use next year
        if (monthIdx < now.getMonth() || (monthIdx === now.getMonth() && day < now.getDate())) {
          year++;
        }
        return new Date(year, monthIdx, day);
      }
    }

    // Try parsing as a date string
    const parsed = new Date(hint);
    if (!isNaN(parsed.getTime()) && parsed > new Date()) return parsed;

    return null;
  }

  const now = new Date();
  const hintDate = getBaseDateFromHint(dateRegenHint);
  const baseDate = hintDate || now;

  const options = hintDate
    ? [
        { label: `Early ${hintDate.toLocaleDateString("en-US", { month: "long" })}`, offset: 0 },
        { label: `Mid ${hintDate.toLocaleDateString("en-US", { month: "long" })}`, offset: 10 },
        { label: `Late ${hintDate.toLocaleDateString("en-US", { month: "long" })}`, offset: 20 },
      ]
    : [
        { label: "Next week", offset: 7 },
        { label: "In 2 weeks", offset: 14 },
        { label: "In 3 weeks", offset: 21 },
      ];

  const dateRanges = options.map((opt) => {
    const start = new Date(baseDate);
    start.setDate(start.getDate() + opt.offset);
    const end = new Date(start);
    end.setDate(end.getDate() + tripDays);
    return { ...opt, start, end, startStr: formatDateStr(start), endStr: formatDateStr(end) };
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
            setData((prev) => ({ ...prev, [idx]: { ...prev[idx], flights: { min: prices.length ? Math.min(...prices) : 0, max: prices.length ? Math.max(...prices) : 0, count: fl.length, loading: false } } }));
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
          setData((prev) => ({ ...prev, [idx]: { ...prev[idx], hotels: { min: prices.length ? Math.min(...prices) : 0, max: prices.length ? Math.max(...prices) : 0, count: ht.length, loading: false } } }));
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
            name: e.name as string, venue: e.venueName as string, image: (e.image as string) || null,
          }));
          setData((prev) => ({ ...prev, [idx]: { ...prev[idx], events: { count: all.length, categories: cats, topEvents: top, loading: false } } }));
        })
        .catch(() => setData((prev) => ({ ...prev, [idx]: { ...prev[idx], events: { count: 0, categories: [], topEvents: [], loading: false } } })));
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchKey]);

  return (
    <>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
        <h1 className="text-[28px] font-semibold text-gray-dark leading-page mb-3">
          When should you visit <span className="text-accent">{destination}</span>?
        </h1>
        <p className="text-on-light-secondary text-[17px]">
          Compare real prices and events across different dates.
        </p>
      </motion.div>

      {/* Regenerate bar */}
      <div className="card-base p-4 mb-6">
        <div
          className="flex items-center justify-between cursor-pointer"
          onClick={() => setDateRegenOpen(!dateRegenOpen)}
        >
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-accent text-[18px]">refresh</span>
            <span className="text-sm font-semibold text-gray-dark">Not what you had in mind? Regenerate</span>
          </div>
          <span className="material-symbols-outlined text-on-light-tertiary text-[18px]">
            {dateRegenOpen ? "expand_less" : "expand_more"}
          </span>
        </div>

        {dateRegenOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            transition={{ duration: 0.2 }}
            className="mt-4 pt-4 border-t border-[rgba(194,85,56,0.06)]"
          >
            <p className="text-on-light-secondary text-sm mb-3">
              Tell Walter what dates you prefer -- a month, season, or time frame.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={dateRegenHint}
                onChange={(e) => setDateRegenHint(e.target.value)}
                placeholder='e.g. "May", "June 15", "December", "August"'
                className="flex-1 px-4 py-2.5 rounded-[10px] border border-[rgba(194,85,56,0.08)] text-gray-dark text-sm placeholder:text-on-light-tertiary focus:outline-none focus:ring-2 focus:ring-accent/20"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    document.getElementById("date-regen-btn")?.click();
                  }
                }}
              />
              <button
                id="date-regen-btn"
                onClick={() => {
                  setData({});
                  setDateRegenOpen(false);
                  setFetchKey((k) => k + 1);
                }}
                className="px-5 py-2.5 bg-accent text-white rounded-[10px] text-sm font-semibold hover:bg-accent-light transition-colors flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-[16px]">refresh</span>
                Regenerate
              </button>
            </div>
          </motion.div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {dateRanges.map((range, idx) => {
          const d = data[idx];
          const someLoading = d && (d.flights.loading || d.hotels.loading || d.events.loading);
          const flMin = d?.flights.min || 0;
          const flMax = d?.flights.max || 0;
          const htMin = d?.hotels.min || 0;
          const htMax = d?.hotels.max || 0;
          const totalMin = flMin + htMin;
          const totalMax = flMax + htMax;

          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: idx * 0.1 }}
              className="card-base overflow-hidden flex flex-col"
            >
              {/* Accent bar */}
              <div className="h-1 bg-gradient-to-r from-accent to-cyan" />

              {/* Header */}
              <div className="p-5 pb-4 border-b border-[rgba(194,85,56,0.06)]">
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
                <p className="text-on-light-secondary text-sm flex items-center gap-1.5 mt-1">
                  <span className="material-symbols-outlined text-[14px]">group</span>
                  {adults} traveler{adults !== 1 ? "s" : ""}
                </p>
              </div>

              <div className="p-5 flex-1 flex flex-col">
                {/* Estimated Total */}
                <div className="mb-5 bg-[#FFF2D9]/30 rounded-[10px] p-4 -mx-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-on-light-secondary text-sm">Estimated Total</span>
                    <span className="material-symbols-outlined text-accent text-[16px]">payments</span>
                  </div>
                  {!d || (d.flights.loading && d.hotels.loading) ? (
                    <div className="h-8 bg-page-bg rounded animate-pulse w-2/3" />
                  ) : totalMin > 0 ? (
                    <div>
                      <p className="font-semibold text-accent text-[24px]">
                        ${totalMin.toLocaleString()} - ${totalMax.toLocaleString()}
                      </p>
                      <p className="text-on-light-tertiary text-xs">per person</p>
                    </div>
                  ) : (
                    <p className="text-on-light-tertiary text-sm">No pricing available</p>
                  )}
                </div>

                {/* Flights */}
                <div className="flex items-center justify-between py-3 border-t border-[rgba(194,85,56,0.06)]">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-accent text-[18px]">flight</span>
                    <span className="text-gray-dark text-sm font-semibold">Flights</span>
                  </div>
                  {d?.flights.loading ? (
                    <div className="w-3 h-3 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
                  ) : d?.flights.count > 0 ? (
                    <p className="font-semibold text-accent text-sm">${d.flights.min.toLocaleString()} - ${d.flights.max.toLocaleString()}</p>
                  ) : (
                    <span className="text-on-light-tertiary text-xs">No flights found</span>
                  )}
                </div>

                {/* Hotels */}
                <div className="flex items-center justify-between py-3 border-t border-[rgba(194,85,56,0.06)]">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-accent text-[18px]">hotel</span>
                    <span className="text-gray-dark text-sm font-semibold">Hotels</span>
                  </div>
                  {d?.hotels.loading ? (
                    <div className="w-3 h-3 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
                  ) : d?.hotels.count > 0 ? (
                    <p className="font-semibold text-accent text-sm">${d.hotels.min.toLocaleString()} - ${d.hotels.max.toLocaleString()}</p>
                  ) : (
                    <span className="text-on-light-tertiary text-xs">No hotels found</span>
                  )}
                </div>

                {/* Events */}
                <div className="py-3 border-t border-[rgba(194,85,56,0.06)]">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-accent text-[18px]">confirmation_number</span>
                      <span className="text-gray-dark text-sm font-semibold">Events Found</span>
                    </div>
                    {d?.events.loading ? (
                      <div className="w-3 h-3 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
                    ) : (
                      <span className="font-semibold text-accent text-[24px]">{d?.events.count || 0}</span>
                    )}
                  </div>
                  {d?.events.categories && d.events.categories.length > 0 && (() => {
                    const pillColors = ["bg-accent text-white", "bg-cyan text-gray-dark", "bg-accent-dark text-white"];
                    return (
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {d.events.categories.map((cat, j) => (
                          <span key={j} className={`${pillColors[j % pillColors.length]} rounded-pill px-2.5 py-0.5 text-[10px] font-semibold`}>{cat}</span>
                        ))}
                      </div>
                    );
                  })()}
                  {d?.events.topEvents && d.events.topEvents.length > 0 && (
                    <div className="space-y-2 mt-2">
                      {d.events.topEvents.map((ev, j) => (
                        <div key={j} className="flex items-center gap-2.5">
                          {ev.image && <img src={ev.image} alt="" className="w-10 h-10 rounded-[6px] object-cover flex-shrink-0" />}
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
    </>
  );
}
