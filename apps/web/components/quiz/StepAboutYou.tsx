"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useQuizStore, TravelerType } from "@/lib/stores/quizStore";
import StepWrapper from "./StepWrapper";

const IATA_CODES: Record<string, string> = {
  LAX: "Los Angeles, CA", SFO: "San Francisco, CA", JFK: "New York, NY",
  ORD: "Chicago, IL", ATL: "Atlanta, GA", DFW: "Dallas, TX",
  DEN: "Denver, CO", SEA: "Seattle, WA", MIA: "Miami, FL",
  BOS: "Boston, MA", LAS: "Las Vegas, NV", MCO: "Orlando, FL",
  PHX: "Phoenix, AZ", IAH: "Houston, TX", MSP: "Minneapolis, MN",
  DTW: "Detroit, MI", PHL: "Philadelphia, PA", CLT: "Charlotte, NC",
  SLC: "Salt Lake City, UT", SAN: "San Diego, CA", TPA: "Tampa, FL",
  PDX: "Portland, OR", STL: "St. Louis, MO", BNA: "Nashville, TN",
  AUS: "Austin, TX", RDU: "Raleigh-Durham, NC", IND: "Indianapolis, IN",
  CMH: "Columbus, OH", MKE: "Milwaukee, WI", OAK: "Oakland, CA",
  SJC: "San Jose, CA", SMF: "Sacramento, CA", BUR: "Burbank, CA",
  LGA: "New York LaGuardia, NY", EWR: "Newark, NJ",
  HNL: "Honolulu, HI", ANC: "Anchorage, AK",
  LHR: "London Heathrow, UK", CDG: "Paris, France",
  NRT: "Tokyo Narita, Japan", HND: "Tokyo Haneda, Japan",
  ICN: "Seoul Incheon, South Korea", PEK: "Beijing, China",
  PVG: "Shanghai, China", HKG: "Hong Kong",
  SIN: "Singapore", BKK: "Bangkok, Thailand",
  SYD: "Sydney, Australia", MEX: "Mexico City, Mexico",
  CUN: "Cancun, Mexico", GRU: "Sao Paulo, Brazil",
  FCO: "Rome, Italy", BCN: "Barcelona, Spain",
  AMS: "Amsterdam, Netherlands", FRA: "Frankfurt, Germany",
  DXB: "Dubai, UAE", DOH: "Doha, Qatar",
};

interface MapboxFeature {
  id: string;
  place_name: string;
  text: string;
  context?: Array<{ id: string; text: string; short_code?: string }>;
}

function formatCity(feature: MapboxFeature): string {
  const city = feature.text;
  const country = feature.context?.find((c) => c.id.startsWith("country"));
  const region = feature.context?.find((c) => c.id.startsWith("region"));
  if (country) {
    return region ? `${city}, ${region.text}, ${country.text}` : `${city}, ${country.text}`;
  }
  return feature.place_name;
}

const travelerTypes: { type: TravelerType; label: string; icon: string; defaultCount: number }[] = [
  { type: "solo", label: "Solo", icon: "person", defaultCount: 1 },
  { type: "couple", label: "Couple", icon: "favorite", defaultCount: 2 },
  { type: "family", label: "Family", icon: "family_restroom", defaultCount: 3 },
  { type: "friends", label: "Friends", icon: "group", defaultCount: 3 },
  { type: "business", label: "Business", icon: "work", defaultCount: 1 },
];

const budgetPresets = [500, 1000, 2000, 3000, 5000, 10000];

export default function StepAboutYou() {
  const store = useQuizStore();

  // Departure city autocomplete
  const [cityQuery, setCityQuery] = useState(store.departureCity || "");
  const [citySuggestions, setCitySuggestions] = useState<MapboxFeature[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [iataMatches, setIataMatches] = useState<{code: string; city: string; display: string}[]>([]);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const inputRef = useRef<HTMLInputElement>(null);

  const searchCities = useCallback((query: string) => {
    if (query.length < 2) {
      setCitySuggestions([]);
      setIataMatches([]);
      return;
    }

    // Find IATA matches
    const upper = query.toUpperCase();
    const iata = Object.entries(IATA_CODES)
      .filter(([code, city]) => code.startsWith(upper) || city.toLowerCase().includes(query.toLowerCase()))
      .slice(0, 3)
      .map(([code, city]) => ({ code, city, display: `${code} - ${city}` }));
    setIataMatches(iata);

    // Also search Mapbox
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
        const res = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?types=place&limit=5&access_token=${token}`
        );
        const data = await res.json();
        setCitySuggestions(data.features || []);
        setShowSuggestions(true);
      } catch {
        setCitySuggestions([]);
      }
    }, 300);

    if (iata.length > 0) setShowSuggestions(true);
  }, []);

  useEffect(() => {
    return () => clearTimeout(debounceRef.current);
  }, []);

  const handleTypeSelect = (t: (typeof travelerTypes)[number]) => {
    store.setTravelerType(t.type);
    store.setTravelersCount(t.defaultCount);
  };

  return (
    <StepWrapper
      title="Tell us about your trip"
      subtitle="The basics -- who's going, what's the budget, and where are you flying from?"
    >
      <div className="space-y-8">
        {/* Traveler Type */}
        <div>
          <label className="block text-sm font-semibold text-gray-dark mb-3">
            Who's traveling?
          </label>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
            {travelerTypes.map((t) => {
              const isSelected = store.travelerType === t.type;
              return (
                <button
                  key={t.type}
                  onClick={() => handleTypeSelect(t)}
                  className={`flex flex-col items-center gap-1.5 p-3 rounded-[14px] border transition-colors cursor-pointer ${
                    isSelected
                      ? "border-accent bg-accent/5"
                      : "border-[rgba(37,99,235,0.08)] bg-white hover:border-accent/30"
                  }`}
                >
                  <span className={`material-symbols-outlined text-[24px] ${isSelected ? "text-accent" : "text-on-light-tertiary"}`}>
                    {t.icon}
                  </span>
                  <span className={`text-xs font-semibold ${isSelected ? "text-accent" : "text-gray-dark"}`}>
                    {t.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Traveler Count */}
        <div>
          <label className="block text-sm font-semibold text-gray-dark mb-3">
            How many travelers?
          </label>
          <div className="flex items-center gap-5">
            <button
              onClick={() => store.setTravelersCount(Math.max(1, store.travelersCount - 1))}
              className="w-10 h-10 rounded-full bg-page-bg flex items-center justify-center hover:bg-[#DBEAFE] transition-colors"
            >
              <span className="material-symbols-outlined text-on-light-tertiary text-[20px]">remove</span>
            </button>
            <span className="text-2xl font-semibold text-gray-dark w-8 text-center">
              {store.travelersCount}
            </span>
            <button
              onClick={() => store.setTravelersCount(store.travelersCount + 1)}
              className="w-10 h-10 rounded-full bg-page-bg flex items-center justify-center hover:bg-[#DBEAFE] transition-colors"
            >
              <span className="material-symbols-outlined text-on-light-tertiary text-[20px]">add</span>
            </button>
          </div>
        </div>

        {/* Budget */}
        <div>
          <label className="block text-sm font-semibold text-gray-dark mb-3">
            Total budget (USD)
          </label>
          <div className="flex flex-wrap gap-2 mb-3">
            {budgetPresets.map((amount) => (
              <button
                key={amount}
                onClick={() => {
                  store.setBudgetAmount(amount);
                  store.setBudgetSkipped(false);
                }}
                className={`px-4 py-2 rounded-pill text-sm font-semibold transition-colors ${
                  store.budgetAmount === amount && !store.budgetSkipped
                    ? "bg-accent text-white"
                    : "bg-page-bg border border-[rgba(37,99,235,0.08)] text-on-light-secondary hover:border-accent/30"
                }`}
              >
                ${amount.toLocaleString()}
              </button>
            ))}
            <button
              onClick={() => {
                store.setBudgetSkipped(true);
                store.setBudgetAmount(null);
              }}
              className={`px-4 py-2 rounded-pill text-sm font-semibold transition-colors ${
                store.budgetSkipped
                  ? "bg-accent text-white"
                  : "bg-page-bg border border-[rgba(37,99,235,0.08)] text-on-light-secondary hover:border-accent/30"
              }`}
            >
              Flexible
            </button>
          </div>
          {!store.budgetSkipped && (
            <div className="flex items-center gap-3">
              <span className="text-on-light-tertiary text-sm">$</span>
              <input
                type="number"
                value={store.budgetAmount || ""}
                onChange={(e) => {
                  store.setBudgetAmount(Number(e.target.value) || null);
                  store.setBudgetSkipped(false);
                }}
                placeholder="Or enter a custom amount"
                className="flex-1 px-4 py-2.5 rounded-[10px] border border-[rgba(37,99,235,0.08)] text-gray-dark text-sm placeholder:text-on-light-tertiary focus:outline-none focus:ring-2 focus:ring-accent/20"
              />
            </div>
          )}
        </div>

        {/* Departure Cities */}
        <div className="relative">
          <label className="block text-sm font-semibold text-gray-dark mb-3">
            Where are you flying from?
          </label>

          {/* Tags for added cities */}
          {store.departureCities.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {store.departureCities.map((city) => (
                <span
                  key={city}
                  className="bg-[#DBEAFE] text-accent rounded-pill px-3 py-1 text-sm font-semibold flex items-center gap-1.5"
                >
                  {city}
                  <button
                    onClick={() => store.removeDepartureCity(city)}
                    className="text-on-light-tertiary hover:text-accent transition-colors"
                  >
                    <span className="material-symbols-outlined text-[14px]">close</span>
                  </button>
                </span>
              ))}
            </div>
          )}

          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-light-tertiary text-[20px]">
              flight_takeoff
            </span>
            <input
              ref={inputRef}
              type="text"
              value={cityQuery}
              onChange={(e) => {
                setCityQuery(e.target.value);
                searchCities(e.target.value);
              }}
              onFocus={() => citySuggestions.length > 0 && setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && cityQuery.trim().length >= 2) {
                  e.preventDefault();
                  const value = cityQuery.trim();
                  const upper = value.toUpperCase();
                  // Expand IATA code to city name
                  const expanded = IATA_CODES[upper] ? `${upper} - ${IATA_CODES[upper]}` : value;
                  store.addDepartureCity(expanded);
                  setCityQuery("");
                  setCitySuggestions([]);
                  setIataMatches([]);
                  setShowSuggestions(false);
                }
              }}
              placeholder={store.departureCities.length > 0 ? "Add another city or airport code" : "City or airport code (e.g. LAX, Chicago)"}
              className="w-full pl-10 pr-4 py-2.5 rounded-[10px] border border-[rgba(37,99,235,0.08)] text-gray-dark text-sm placeholder:text-on-light-tertiary focus:outline-none focus:ring-2 focus:ring-accent/20"
            />
          </div>
          {showSuggestions && (iataMatches.length > 0 || citySuggestions.length > 0) && (
            <div className="absolute z-20 left-0 right-0 mt-1 bg-white rounded-[14px] border border-[rgba(37,99,235,0.08)] shadow-[0_2px_12px_rgba(37,99,235,0.06)] overflow-hidden">
              {iataMatches.map((match) => (
                <button
                  key={match.code}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    store.addDepartureCity(match.display);
                    setCityQuery("");
                    setCitySuggestions([]);
                    setIataMatches([]);
                    setShowSuggestions(false);
                  }}
                  className="w-full text-left px-4 py-3 text-sm text-gray-dark hover:bg-page-bg transition-colors flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-accent text-[16px]">flight</span>
                  <span className="text-accent font-semibold">{match.code}</span> - {match.city}
                </button>
              ))}
              {citySuggestions.map((feat) => (
                <button
                  key={feat.id}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    const formatted = formatCity(feat);
                    store.addDepartureCity(formatted);
                    setCityQuery("");
                    setCitySuggestions([]);
                    setIataMatches([]);
                    setShowSuggestions(false);
                  }}
                  className="w-full text-left px-4 py-3 text-sm text-gray-dark hover:bg-page-bg transition-colors"
                >
                  {formatCity(feat)}
                </button>
              ))}
            </div>
          )}
          <p className="text-xs text-on-light-tertiary mt-1.5">Optional -- add multiple cities or airport codes. Press Enter or select from suggestions.</p>
        </div>
      </div>
    </StepWrapper>
  );
}
