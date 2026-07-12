"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";

const EASE = [0.2, 0.8, 0.2, 1] as const;

const ACCOMMODATION_OPTIONS: { id: string; label: string; sub: string; icon: string }[] = [
  { id: "hotel", label: "Hotel", sub: "Cleaned daily, room service.", icon: "hotel" },
  { id: "boutique", label: "Boutique", sub: "Smaller, considered, more design.", icon: "apartment" },
  { id: "rental", label: "Rental", sub: "Whole place, a kitchen, more space.", icon: "house" },
  { id: "hostel", label: "Hostel", sub: "Cheap and social.", icon: "bed" },
  { id: "anything", label: "Surprise me", sub: "Walter picks based on the place.", icon: "auto_awesome" },
];

interface MapboxFeature {
  id: string;
  place_name: string;
  place_type?: string[];
  text: string;
  properties?: { category?: string };
  context?: Array<{ id: string; text: string }>;
}

export default function ClarifyPage() {
  const router = useRouter();
  const [destination, setDestination] = useState("");
  const [travelers, setTravelers] = useState(2);
  const [accommodation, setAccommodation] = useState("hotel");
  const [departureCity, setDepartureCity] = useState("");
  const [departureSuggestions, setDepartureSuggestions] = useState<MapboxFeature[]>([]);
  const [showDepartureSuggestions, setShowDepartureSuggestions] = useState(false);
  const [ready, setReady] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    const stored = localStorage.getItem("walter_prefs");
    if (!stored) {
      router.push("/");
      return;
    }
    const prefs = JSON.parse(stored);
    setDestination(prefs.destination || prefs.destinations?.[0] || "your trip");
    if (prefs.travelersCount) setTravelers(prefs.travelersCount);
    if (prefs.accommodationTypes?.[0]) setAccommodation(prefs.accommodationTypes[0]);
    if (prefs.departureCity) setDepartureCity(prefs.departureCity);
    setReady(true);
  }, [router]);

  const searchDeparture = useCallback((q: string) => {
    if (q.length < 2) {
      setDepartureSuggestions([]);
      return;
    }
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
        const res = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(q)}.json?types=place,poi&limit=8&access_token=${token}`
        );
        const data: { features?: MapboxFeature[] } = await res.json();
        const filtered = (data.features || []).filter((f) => {
          // Keep cities, plus POIs that look like airports
          if (!f.place_type?.includes("poi")) return true;
          const category = (f.properties?.category || "").toLowerCase();
          const text = (f.text || "").toLowerCase();
          const placeName = (f.place_name || "").toLowerCase();
          return (
            category.includes("airport") ||
            text.includes("airport") ||
            placeName.includes("airport") ||
            text.includes("intl")
          );
        });
        setDepartureSuggestions(filtered);
        setShowDepartureSuggestions(true);
      } catch {
        setDepartureSuggestions([]);
      }
    }, 250);
  }, []);

  useEffect(() => () => clearTimeout(debounceRef.current), []);

  const isAirport = (f: MapboxFeature) =>
    f.place_type?.includes("poi") &&
    ((f.properties?.category || "").toLowerCase().includes("airport") ||
      (f.text || "").toLowerCase().includes("airport"));

  const formatCity = (f: MapboxFeature) => {
    const country = f.context?.find((c) => c.id.startsWith("country"));
    return country ? `${f.text}, ${country.text}` : f.place_name;
  };

  const handleSubmit = () => {
    if (!departureCity.trim()) return;
    const stored = localStorage.getItem("walter_prefs");
    const prefs = stored ? JSON.parse(stored) : {};
    prefs.travelersCount = travelers;
    prefs.travelers = travelers;
    prefs.adults = travelers;
    prefs.accommodationTypes = [accommodation];
    prefs.departureCity = departureCity.trim();
    prefs.departureCities = [departureCity.trim()];
    localStorage.setItem("walter_prefs", JSON.stringify(prefs));
    router.push("/results");
  };

  if (!ready) {
    return (
      <div className="min-h-screen bg-product-bg flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const canSubmit = departureCity.trim().length >= 2;

  return (
    <div className="min-h-screen bg-product-bg">
      <header className="sticky top-0 z-50 nav-glass">
        <div className="max-w-content mx-auto px-5 lg:px-8 py-3.5 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 shrink-0">
            <img src="/walter-logo.png" alt="" className="w-7 h-7 rounded-[8px]" />
            <span className="text-ink text-[16px] font-semibold tracking-tight">Walter</span>
          </Link>
          <Link
            href="/"
            className="text-ink-soft hover:text-ink text-[13px] font-medium px-3.5 py-1.5 rounded-pill hover:bg-ink/5 transition-colors flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            Back
          </Link>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-5 lg:px-8 pt-16 pb-24">
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: EASE }}
          className="text-accent text-[11px] uppercase tracking-[2.5px] font-semibold mb-3"
        >
          Three last things
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05, duration: 0.6, ease: EASE }}
          className="text-ink text-[32px] sm:text-[40px] font-semibold tracking-display leading-[1.05] mb-3"
        >
          {destination}, locked in.
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.6, ease: EASE }}
          className="text-ink-soft text-[15px] sm:text-[16px] mb-12 max-w-[55ch]"
        >
          Walter needs three more facts before he books your spine.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18, duration: 0.6, ease: EASE }}
          className="space-y-10"
        >
          {/* Travelers */}
          <section>
            <h2 className="text-ink text-[18px] font-semibold mb-1">How many of you?</h2>
            <p className="text-ink-faint text-[13px] mb-5">Adults only. We will ask about kids on the booking page if you need it.</p>
            <div className="flex items-center gap-5">
              <button
                type="button"
                disabled={travelers <= 1}
                onClick={() => setTravelers(Math.max(1, travelers - 1))}
                className="w-11 h-11 rounded-full border border-ink/20 text-ink hover:border-ink disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
                aria-label="Decrease travelers"
              >
                <span className="material-symbols-outlined text-[20px]">remove</span>
              </button>
              <span className="text-ink text-[28px] font-semibold tabular-nums w-12 text-center">
                {travelers}
              </span>
              <button
                type="button"
                onClick={() => setTravelers(travelers + 1)}
                className="w-11 h-11 rounded-full border border-ink/20 text-ink hover:border-ink flex items-center justify-center transition-colors"
                aria-label="Increase travelers"
              >
                <span className="material-symbols-outlined text-[20px]">add</span>
              </button>
              <span className="text-ink-faint text-[13px] ml-2">
                {travelers === 1 ? "Solo trip" : travelers === 2 ? "Two of you" : `${travelers} travelers`}
              </span>
            </div>
          </section>

          {/* Accommodation */}
          <section>
            <h2 className="text-ink text-[18px] font-semibold mb-1">Where do you want to stay?</h2>
            <p className="text-ink-faint text-[13px] mb-5">Pick one. You can always swap on the results page.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {ACCOMMODATION_OPTIONS.map((opt) => {
                const selected = accommodation === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setAccommodation(opt.id)}
                    className={`text-left card-base p-4 flex items-center gap-4 transition-colors ${
                      selected ? "border-accent ring-1 ring-accent" : "hover:border-ink/20"
                    }`}
                  >
                    <span
                      className={`w-10 h-10 rounded-[10px] flex items-center justify-center shrink-0 ${
                        selected ? "bg-accent/15" : "bg-raised-slate"
                      }`}
                    >
                      <span className={`material-symbols-outlined text-[20px] ${selected ? "text-accent" : "text-ink-soft"}`}>
                        {opt.icon}
                      </span>
                    </span>
                    <div className="min-w-0">
                      <p className="text-ink text-[14px] font-semibold">{opt.label}</p>
                      <p className="text-ink-faint text-[12px] truncate">{opt.sub}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Departure */}
          <section>
            <h2 className="text-ink text-[18px] font-semibold mb-1">Where are you flying from?</h2>
            <p className="text-ink-faint text-[13px] mb-5">A city or an airport code, whichever you know.</p>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-ink-faint text-[18px] pointer-events-none">
                flight_takeoff
              </span>
              <input
                type="text"
                value={departureCity}
                onChange={(e) => {
                  setDepartureCity(e.target.value);
                  searchDeparture(e.target.value);
                }}
                onFocus={() => departureSuggestions.length > 0 && setShowDepartureSuggestions(true)}
                onBlur={() => setTimeout(() => setShowDepartureSuggestions(false), 200)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && canSubmit) {
                    e.preventDefault();
                    handleSubmit();
                  }
                }}
                placeholder="A city or airport (Chicago, JFK, Heathrow...)"
                className="w-full pl-11 pr-4 py-3.5 rounded-pill bg-raised-slate border border-line text-ink text-[15px] placeholder:text-ink-faint focus:outline-none focus:border-accent transition-colors"
              />
              {showDepartureSuggestions && departureSuggestions.length > 0 && (
                <div className="absolute z-20 left-0 right-0 mt-2 bg-card rounded-[14px] border border-line shadow-[0_12px_40px_rgba(20,30,60,0.12)] overflow-hidden">
                  {departureSuggestions.map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => {
                        setDepartureCity(formatCity(f));
                        setShowDepartureSuggestions(false);
                      }}
                      className="w-full text-left px-4 py-3 text-[14px] text-ink hover:bg-ink/5 transition-colors flex items-center gap-2.5"
                    >
                      <span
                        className="material-symbols-outlined text-[18px] text-ink-faint shrink-0"
                        style={{ fontVariationSettings: "'FILL' 1, 'wght' 500" }}
                      >
                        {isAirport(f) ? "flight" : "location_on"}
                      </span>
                      <span className="truncate">{formatCity(f)}</span>
                      {isAirport(f) && (
                        <span className="ml-auto text-[10px] uppercase tracking-wide text-ink-faint font-medium shrink-0">
                          Airport
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* Submit */}
          <div className="pt-4">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!canSubmit}
              className="w-full sm:w-auto bg-accent text-snow-off-glacier rounded-pill px-7 py-3.5 text-[15px] font-semibold hover:bg-accent-light transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              Build my trip
              <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
            </button>
            {!canSubmit && (
              <p className="text-ink-faint text-[12px] mt-3">Add a departure city to continue.</p>
            )}
          </div>
        </motion.div>
      </main>
    </div>
  );
}
