"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
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

type QuickTrip = {
  destination: string;
  title: string;
  summary: string;
  totalEstimatedCost: number;
  flightEstimate: number;
  hotelEstimatePerNight: number;
  topEvents: string[];
  highlights: string[];
  bestTimeToVisit: string;
  startDate?: string;
  endDate?: string;
  days: TripDay[];
};

export default function QuickPlanPage() {
  const router = useRouter();
  const [tags, setTags] = useState<string[]>([]);
  const [input, setInput] = useState("");
  const [travelers, setTravelers] = useState<number>(2);
  const [accommodationTypes, setAccommodationTypes] = useState<string[]>(["hotel"]);
  const [noAccommodation, setNoAccommodation] = useState<boolean>(false);
  const [trips, setTrips] = useState<QuickTrip[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedTrip, setExpandedTrip] = useState<number | null>(null);
  const [savedIds, setSavedIds] = useState<Set<number>>(new Set());
  const [generated, setGenerated] = useState(false);
  const [flightData, setFlightData] = useState<Record<number, {
    min: number; max: number; count: number; loading: boolean;
  }>>({});
  const [eventData, setEventData] = useState<Record<number, {
    events: { name: string; venue: string; category: string; image: string | null; priceMin: number | null }[];
    count: number; categories: string[]; loading: boolean;
  }>>({});

  // Reset cart on entry — fresh start for a new trip
  useEffect(() => {
    useTripCartStore.getState().clearCart();
  }, []);

  const addTag = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed || tags.includes(trimmed) || tags.length >= 15) return;
    setTags([...tags, trimmed]);
    setInput("");
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const handleGenerate = async () => {
    if (tags.length === 0) return;
    setLoading(true);
    setError(null);
    setTrips([]);
    setGenerated(true);
    setSavedIds(new Set());
    setExpandedTrip(null);
    setFlightData({});
    setEventData({});

    try {
      const res = await fetch("/api/quick", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tags }),
      });
      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else {
        const tripList = data.trips || [];
        setTrips(tripList);

        // Generate fallback dates for API calls
        const now = new Date();
        const fallbackStart = new Date(now);
        fallbackStart.setDate(fallbackStart.getDate() + 14);
        const fallbackEnd = new Date(fallbackStart);
        fallbackEnd.setDate(fallbackEnd.getDate() + 5);
        const fallbackS = fallbackStart.toISOString().split("T")[0];
        const fallbackE = fallbackEnd.toISOString().split("T")[0];

        // Fetch flights + events for each destination — use trip dates if AI returned them
        tripList.forEach((trip: QuickTrip, idx: number) => {
          const sDate = trip.startDate || fallbackS;
          const eDate = trip.endDate || fallbackE;

          // Flights
          setFlightData((prev) => ({ ...prev, [idx]: { min: 0, max: 0, count: 0, loading: true } }));
          fetch("/api/flights", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ origin: "LAX", destination: trip.destination, departDate: sDate, returnDate: eDate, adults: travelers, cabinClass: "economy" }),
          })
            .then((r) => r.json())
            .then((fData) => {
              const fl = fData.flights || [];
              const prices = fl.map((f: { price: number }) => f.price).filter((p: number) => p > 0);
              setFlightData((prev) => ({ ...prev, [idx]: { min: prices.length ? Math.min(...prices) : 0, max: prices.length ? Math.max(...prices) : 0, count: fl.length, loading: false } }));
            })
            .catch(() => setFlightData((prev) => ({ ...prev, [idx]: { min: 0, max: 0, count: 0, loading: false } })));

          // Events
          setEventData((prev) => ({ ...prev, [idx]: { events: [], count: 0, categories: [], loading: true } }));
          fetch("/api/search", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ destination: trip.destination, startDate: sDate, endDate: eDate, vibes: tags, travelers }),
          })
            .then((r) => r.json())
            .then((eData) => {
              const all = [...(eData.exactMatches || []), ...(eData.similarMatches || []), ...(eData.topInArea || [])];
              const cats = [...new Set(all.map((e: { category: string }) => e.category))].slice(0, 3) as string[];
              const top = all.slice(0, 2).map((ev: Record<string, unknown>) => ({
                name: ev.name as string, venue: ev.venueName as string, category: ev.category as string,
                image: (ev.image as string) || null, priceMin: (ev.priceMin as number) || null,
              }));
              setEventData((prev) => ({ ...prev, [idx]: { events: top, count: all.length, categories: cats, loading: false } }));
            })
            .catch(() => setEventData((prev) => ({ ...prev, [idx]: { events: [], count: 0, categories: [], loading: false } })));
        });
      }
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectTrip = (trip: QuickTrip, idx: number) => {
    // Accepting a trip option signals "I like this destination + dates" —
    // the user picks their own itinerary items on /results. Cart stays empty.
    void idx;
    useTripCartStore.getState().clearCart();

    // Set prefs for results page
    localStorage.setItem("walter_prefs", JSON.stringify({
      destinations: [trip.destination],
      destination: trip.destination,
      surpriseMe: false,
      startDate: trip.startDate,
      endDate: trip.endDate,
      travelersCount: travelers,
      travelers,
      accommodationTypes: noAccommodation ? [] : accommodationTypes,
      noAccommodation,
      budget: trip.totalEstimatedCost || 2000,
      budgetAmount: trip.totalEstimatedCost || 2000,
      activityInterests: [],
      vibes: tags,
      tripDurationDays: trip.days?.length || 5,
    }));

    router.push("/results");
  };

  const handleSave = (trip: QuickTrip, idx: number) => {
    const cartItems = trip.days?.flatMap((day) =>
      day.items.map((item, j) => ({
        id: `quick-${idx}-${day.dayNumber}-${j}`,
        type: (item.itemType || "activity") as "flight" | "hotel" | "event" | "activity" | "restaurant" | "site",
        title: item.title,
        subtitle: item.description || "",
        price: item.estimatedCost || null,
        image: null,
        bookingUrl: null,
        provider: "walter-ai",
        date: null,
        meta: { locationName: item.locationName } as Record<string, unknown>,
      }))
    ) || [];

    useSavedTripsStore.getState().saveTrip(trip.title, trip.destination, cartItems);
    setSavedIds((prev) => new Set([...prev, idx]));
  };

  const pillColors = ["bg-accent text-white", "bg-cyan text-gray-dark", "bg-accent-dark text-white"];

  return (
    <div className="min-h-screen bg-page-bg">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-20 nav-glass">
        <div className="max-w-content mx-auto px-4 lg:px-8 py-4 flex items-center justify-between">
          <Link href="/" className="text-white text-[17px] font-semibold">Walter</Link>
          <Link href="/quiz" className="text-on-dark-secondary text-sm hover:text-white transition-colors flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[18px]">tune</span>
            Full Trip Design
          </Link>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 pt-28 pb-16">
        {/* Input Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <h1 className="text-[28px] md:text-[36px] font-semibold text-gray-dark leading-tight mb-3">
            What sounds fun?
          </h1>
          <p className="text-on-light-secondary text-[17px] mb-8">
            Add anything -- places, artists, foods, activities, vibes, dates. Walter will build trip options around everything you love.
          </p>

          {/* Tags */}
          <div className="card-base p-5 overflow-hidden">
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                <AnimatePresence>
                  {tags.map((tag, i) => (
                    <motion.span
                      key={tag}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className={`${pillColors[i % pillColors.length]} rounded-pill px-3.5 py-1.5 text-sm font-semibold flex items-center gap-1.5`}
                    >
                      {tag}
                      <button
                        onClick={() => removeTag(tag)}
                        className="opacity-70 hover:opacity-100 transition-opacity"
                      >
                        <span className="material-symbols-outlined text-[14px]">close</span>
                      </button>
                    </motion.span>
                  ))}
                </AnimatePresence>
              </div>
            )}

            <div className="flex gap-3">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addTag(input);
                  }
                }}
                placeholder={
                  tags.length === 0
                    ? 'e.g. "sushi", "hiking", "Taylor Swift", "Bali", "May"...'
                    : tags.length >= 15
                      ? "Max 15 tags reached"
                      : "Add more..."
                }
                disabled={tags.length >= 15}
                className="flex-1 px-4 py-3 rounded-[10px] border border-[rgba(0,101,113,0.08)] text-gray-dark text-[15px] placeholder:text-on-light-tertiary focus:outline-none focus:ring-2 focus:ring-accent/20 disabled:opacity-50"
              />
              <button
                onClick={() => addTag(input)}
                disabled={!input.trim() || tags.length >= 15}
                className="bg-accent text-white rounded-[10px] px-5 py-3 font-semibold hover:bg-accent-light transition-colors disabled:opacity-40 flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[18px]">add</span>
                Add
              </button>
            </div>

            {/* Trip details — travelers + accommodation */}
            <div className="flex flex-wrap items-center gap-x-5 gap-y-3 mt-4 pt-4 border-t border-[rgba(0,101,113,0.06)]">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] uppercase tracking-wide text-on-light-tertiary font-semibold">Who</span>
                {[
                  { count: 1, label: "Solo" },
                  { count: 2, label: "Couple" },
                  { count: 4, label: "Group" },
                ].map((opt) => (
                  <button
                    key={opt.label}
                    onClick={() => setTravelers(opt.count)}
                    className={`rounded-pill px-3 py-1 text-xs font-semibold transition-colors ${
                      travelers === opt.count
                        ? "bg-accent text-white"
                        : "bg-page-bg text-on-light-secondary hover:bg-accent/5"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] uppercase tracking-wide text-on-light-tertiary font-semibold">Stay</span>
                {[
                  { value: "hotel", label: "Hotel" },
                  { value: "vrbo", label: "VRBO" },
                  { value: "hostel", label: "Hostel" },
                ].map((opt) => {
                  const active = !noAccommodation && accommodationTypes.includes(opt.value);
                  return (
                    <button
                      key={opt.value}
                      onClick={() => {
                        setNoAccommodation(false);
                        setAccommodationTypes((prev) =>
                          prev.includes(opt.value)
                            ? prev.filter((v) => v !== opt.value)
                            : [...prev, opt.value]
                        );
                      }}
                      className={`rounded-pill px-3 py-1 text-xs font-semibold transition-colors ${
                        active
                          ? "bg-accent text-white"
                          : "bg-page-bg text-on-light-secondary hover:bg-accent/5"
                      }`}
                    >
                      {opt.label}
                    </button>
                  );
                })}
                <button
                  onClick={() => setNoAccommodation(true)}
                  className={`rounded-pill px-3 py-1 text-xs font-semibold transition-colors ${
                    noAccommodation
                      ? "bg-accent text-white"
                      : "bg-page-bg text-on-light-secondary hover:bg-accent/5"
                  }`}
                >
                  No accommodation
                </button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mt-4">
              <p className="text-xs text-on-light-tertiary">
                {tags.length}/15 tags -- press Enter or click Add
              </p>
              {tags.length > 0 && (
                <div className="sm:flex sm:justify-end w-full sm:w-auto">
                  <button
                    onClick={handleGenerate}
                    disabled={loading}
                    className="w-full sm:w-auto bg-accent text-white rounded-[10px] px-6 py-2.5 text-[15px] font-semibold hover:bg-accent-light transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      {loading ? "hourglass_empty" : "auto_awesome"}
                    </span>
                    {loading ? "Planning..." : "Plan My Trip"}
                  </button>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Quick suggestions */}
        {!generated && (() => {
          const allSuggestions = ["Beach", "Tokyo", "Italian food", "Hiking", "Nightlife", "Concert", "Budget-friendly", "Romantic", "Family", "Adventure"];
          const remaining = allSuggestions.filter((s) => !tags.includes(s));
          if (remaining.length === 0) return null;
          return (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-10"
            >
              <p className="text-sm font-semibold text-on-light-tertiary mb-3">Try these for inspiration:</p>
              <div className="flex flex-wrap gap-2">
                {remaining.map((s) => (
                  <button
                    key={s}
                    onClick={() => addTag(s)}
                    className="bg-white border border-[rgba(0,101,113,0.08)] text-on-light-secondary rounded-pill px-3.5 py-1.5 text-sm hover:border-accent/30 hover:text-accent transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </motion.div>
          );
        })()}

        {/* Loading skeletons */}
        {loading && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {[0, 1, 2].map((i) => (
              <div key={i} className="card-base overflow-hidden animate-pulse">
                <div className="h-1 bg-gradient-to-r from-accent/30 to-cyan/30" />
                <div className="p-5">
                  <div className="h-5 bg-page-bg rounded w-1/2 mb-3" />
                  <div className="h-4 bg-page-bg rounded w-3/4 mb-4" />
                  <div className="bg-[#e6f7f9]/30 rounded-[10px] p-4 mb-4">
                    <div className="h-8 bg-page-bg rounded w-1/3" />
                  </div>
                  <div className="space-y-2">
                    <div className="h-4 bg-page-bg rounded w-full" />
                    <div className="h-4 bg-page-bg rounded w-2/3" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="card-base p-6 text-center">
            <span className="material-symbols-outlined text-on-light-tertiary text-3xl mb-3 block">error_outline</span>
            <p className="font-semibold text-gray-dark mb-1">Something went wrong</p>
            <p className="text-on-light-secondary text-sm mb-4">{error}</p>
            <button onClick={handleGenerate} className="bg-accent text-white rounded-[10px] px-5 py-2.5 font-semibold hover:bg-accent-light transition-colors">
              Try again
            </button>
          </div>
        )}

        {/* Results */}
        {!loading && trips.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-[21px] font-semibold text-gray-dark">Your options</h2>
              <button
                onClick={handleGenerate}
                className="text-sm font-semibold text-accent hover:text-accent-light transition-colors flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-[16px]">refresh</span>
                Regenerate
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              {trips.map((trip, i) => {
                const isExpanded = expandedTrip === i;
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: i * 0.1 }}
                    className="card-base overflow-hidden"
                  >
                    <div className="h-1 bg-gradient-to-r from-accent to-cyan" />

                    <div className="p-5">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="material-symbols-outlined text-accent text-[18px]">location_on</span>
                            <h3 className="font-semibold text-gray-dark text-[17px]">{trip.destination}</h3>
                          </div>
                          <p className="text-on-light-secondary text-sm">{trip.summary}</p>
                        </div>
                        {trip.days && (
                          <span className="bg-accent text-white rounded-pill px-2.5 py-0.5 text-[11px] font-semibold flex-shrink-0 ml-3">
                            {trip.days.length} days
                          </span>
                        )}
                      </div>

                      {/* Estimated Total */}
                      <div className="bg-[#e6f7f9]/30 rounded-[10px] p-4 my-4">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-on-light-secondary text-sm">Estimated Total</span>
                          <span className="material-symbols-outlined text-accent text-[16px]">payments</span>
                        </div>
                        <p className="font-semibold text-accent text-[24px]">
                          ${trip.totalEstimatedCost?.toLocaleString() || "N/A"}
                        </p>
                        <p className="text-on-light-tertiary text-xs">per person</p>
                      </div>

                      {/* Flights row */}
                      <div className="flex items-center justify-between py-2 mb-1">
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-accent text-[16px]">flight</span>
                          <span className="text-sm text-gray-dark">Flights</span>
                        </div>
                        {flightData[i]?.loading ? (
                          <div className="w-3 h-3 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
                        ) : flightData[i]?.count > 0 ? (
                          <p className="font-semibold text-accent text-sm">${flightData[i].min.toLocaleString()} - ${flightData[i].max.toLocaleString()}</p>
                        ) : (
                          <p className="text-accent text-sm font-semibold">~${trip.flightEstimate?.toLocaleString() || "N/A"} <span className="text-on-light-tertiary font-normal text-xs">est.</span></p>
                        )}
                      </div>

                      {/* Hotels row */}
                      <div className="flex items-center justify-between py-2 mb-4">
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-accent text-[16px]">hotel</span>
                          <span className="text-sm text-gray-dark">Hotels/night</span>
                        </div>
                        <p className="text-accent text-sm font-semibold">~${trip.hotelEstimatePerNight?.toLocaleString() || "N/A"} <span className="text-on-light-tertiary font-normal text-xs">est.</span></p>
                      </div>

                      {/* Events section */}
                      <div className="mb-4 pt-3 border-t border-[rgba(0,101,113,0.06)]">
                        {eventData[i]?.loading ? (
                          <div className="flex items-center gap-2 py-2">
                            <div className="w-3 h-3 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
                            <span className="text-on-light-tertiary text-xs">Searching events...</span>
                          </div>
                        ) : eventData[i]?.count > 0 ? (
                          <>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-gray-dark text-sm font-semibold">Events Found</span>
                              <span className="font-semibold text-accent text-[24px]">{eventData[i].count}</span>
                            </div>
                            {eventData[i].categories.length > 0 && (
                              <div className="flex flex-wrap gap-1.5 mb-3">
                                {eventData[i].categories.map((cat, j) => (
                                  <span key={j} className={`${pillColors[j % pillColors.length]} rounded-pill px-2.5 py-0.5 text-[10px] font-semibold`}>{cat}</span>
                                ))}
                              </div>
                            )}
                            {eventData[i].events.map((ev, j) => (
                              <div key={j} className="flex items-center gap-2.5 mb-2">
                                {ev.image && <img src={ev.image} alt="" className="w-10 h-10 rounded-[6px] object-cover flex-shrink-0" />}
                                <div className="min-w-0">
                                  <p className="text-sm text-gray-dark font-semibold truncate">{ev.name}</p>
                                  <p className="text-[11px] text-on-light-tertiary truncate">{ev.venue}</p>
                                </div>
                              </div>
                            ))}
                          </>
                        ) : (
                          trip.topEvents && trip.topEvents.length > 0 && (
                            <div>
                              <p className="text-gray-dark text-sm font-semibold mb-2">Top Events</p>
                              {trip.topEvents.slice(0, 3).map((ev, j) => (
                                <p key={j} className="text-sm text-on-light-secondary mb-1 flex items-center gap-1.5">
                                  <span className="material-symbols-outlined text-accent text-[14px]">local_activity</span>
                                  {ev}
                                </p>
                              ))}
                            </div>
                          )
                        )}
                      </div>

                      {/* Highlights */}
                      {trip.highlights && trip.highlights.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-4">
                          {trip.highlights.map((h, j) => (
                            <span key={j} className={`${pillColors[j % pillColors.length]} rounded-pill px-2.5 py-0.5 text-[11px] font-semibold`}>
                              {h}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Day-by-day expandable */}
                      {isExpanded && trip.days && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          transition={{ duration: 0.2 }}
                          className="mb-4 pt-4 border-t border-[rgba(0,101,113,0.06)]"
                        >
                          <div className="space-y-3">
                            {trip.days.map((day) => (
                              <div key={day.dayNumber} className="bg-page-bg rounded-[10px] p-3">
                                <p className="text-sm font-semibold text-gray-dark mb-1">
                                  Day {day.dayNumber}: {day.title}
                                </p>
                                <div className="space-y-1">
                                  {day.items?.slice(0, 3).map((item, k) => (
                                    <p key={k} className="text-xs text-on-light-secondary flex items-center gap-1.5">
                                      <span className="text-on-light-tertiary w-10">{item.startTime}</span>
                                      {item.title}
                                      {item.estimatedCost > 0 && (
                                        <span className="text-accent ml-auto">${item.estimatedCost}</span>
                                      )}
                                    </p>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      )}

                      {/* Actions */}
                      <div className="flex items-center gap-2 pt-3 border-t border-[rgba(0,101,113,0.06)]">
                        <button
                          onClick={() => setExpandedTrip(isExpanded ? null : i)}
                          className="text-accent text-sm font-semibold hover:text-accent-light transition-colors"
                        >
                          {isExpanded ? "Show less" : "View itinerary"}
                        </button>
                        <div className="ml-auto flex flex-col sm:flex-row gap-2">
                          <button
                            onClick={() => handleSave(trip, i)}
                            disabled={savedIds.has(i)}
                            className={`rounded-[10px] px-4 py-2.5 text-sm font-semibold transition-colors flex items-center gap-1.5 ${
                              savedIds.has(i)
                                ? "bg-page-bg text-accent"
                                : "border border-[rgba(0,101,113,0.08)] text-on-light-secondary hover:border-accent hover:text-accent"
                            }`}
                          >
                            <span className="material-symbols-outlined text-[16px]">{savedIds.has(i) ? "check" : "bookmark"}</span>
                            {savedIds.has(i) ? "Saved" : "Save"}
                          </button>
                          <button
                            onClick={() => handleSelectTrip(trip, i)}
                            className="bg-accent text-white rounded-[10px] px-5 py-2.5 text-sm font-semibold hover:bg-accent-light transition-colors flex items-center gap-1.5"
                          >
                            Choose this trip
                            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
