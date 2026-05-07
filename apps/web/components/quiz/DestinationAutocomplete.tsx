"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useQuizStore } from "@/lib/stores/quizStore";

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

function formatPlace(feature: MapboxFeature): string {
  const city = feature.text;
  const country = feature.context?.find((c) => c.id.startsWith("country"));
  const region = feature.context?.find((c) => c.id.startsWith("region"));

  if (country) {
    return region ? `${city}, ${region.text}, ${country.text}` : `${city}, ${country.text}`;
  }

  // If the feature itself is a country, just return the name
  return feature.place_name;
}

export default function DestinationAutocomplete() {
  const store = useQuizStore();
  const [input, setInput] = useState("");
  const [results, setResults] = useState<MapboxFeature[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [iataMatches, setIataMatches] = useState<{code: string; city: string; display: string}[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

  const searchPlaces = useCallback(
    async (query: string) => {
      if (!query.trim() || !token) {
        setResults([]);
        setIsOpen(false);
        return;
      }

      setIsLoading(true);

      try {
        const encoded = encodeURIComponent(query.trim());
        const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encoded}.json?access_token=${token}&types=place,country,region&limit=5`;
        const res = await fetch(url);
        const data = await res.json();

        if (data.features && data.features.length > 0) {
          setResults(data.features);
          setIsOpen(true);
          setHighlightedIndex(-1);
        } else {
          setResults([]);
          setIsOpen(false);
        }
      } catch {
        setResults([]);
        setIsOpen(false);
      } finally {
        setIsLoading(false);
      }
    },
    [token]
  );

  const handleInputChange = (value: string) => {
    setInput(value);

    // Find IATA matches immediately
    if (value.trim().length >= 2) {
      const upper = value.toUpperCase().trim();
      const iata = Object.entries(IATA_CODES)
        .filter(([code, city]) => code.startsWith(upper) || city.toLowerCase().includes(value.toLowerCase()))
        .slice(0, 3)
        .map(([code, city]) => ({ code, city, display: `${code} - ${city}` }));
      setIataMatches(iata);
      if (iata.length > 0) setIsOpen(true);
    } else {
      setIataMatches([]);
    }

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      searchPlaces(value);
    }, 300);
  };

  const selectPlace = (feature: MapboxFeature) => {
    const label = formatPlace(feature);
    if (!store.destinations.includes(label)) {
      store.setDestinations([...store.destinations, label]);
    }
    setInput("");
    setResults([]);
    setIsOpen(false);
    setHighlightedIndex(-1);
    inputRef.current?.focus();
  };

  const selectIata = (match: {code: string; city: string; display: string}) => {
    if (!store.destinations.includes(match.display)) {
      store.setDestinations([...store.destinations, match.display]);
    }
    setInput("");
    setResults([]);
    setIataMatches([]);
    setIsOpen(false);
    setHighlightedIndex(-1);
    inputRef.current?.focus();
  };

  const removeDestination = (dest: string) => {
    store.setDestinations(store.destinations.filter((d) => d !== dest));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && input.trim().length >= 2) {
      e.preventDefault();
      if (isOpen && highlightedIndex >= 0 && highlightedIndex < results.length) {
        selectPlace(results[highlightedIndex]);
      } else {
        // Expand IATA code on Enter
        const upper = input.trim().toUpperCase();
        if (IATA_CODES[upper]) {
          selectIata({ code: upper, city: IATA_CODES[upper], display: `${upper} - ${IATA_CODES[upper]}` });
        }
      }
      return;
    }

    if (!isOpen || results.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev < results.length - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : results.length - 1));
    } else if (e.key === "Escape") {
      setIsOpen(false);
      setHighlightedIndex(-1);
    }
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setHighlightedIndex(-1);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Clean up debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  return (
    <div className="space-y-3">
      {store.destinations.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {store.destinations.map((d) => (
            <span
              key={d}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-pill bg-[#FFF2D9] text-accent text-sm font-semibold"
            >
              <span className="material-symbols-outlined text-[16px]">location_on</span>
              {d}
              <button
                onClick={() => removeDestination(d)}
                className="text-on-light-tertiary hover:text-accent ml-0.5"
                aria-label={`Remove ${d}`}
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            </span>
          ))}
        </div>
      )}

      <div ref={containerRef} className="relative">
        <div className="relative">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-light-tertiary text-[22px]">
            location_on
          </span>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => handleInputChange(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => {
              if (results.length > 0) setIsOpen(true);
            }}
            placeholder="Search for a city, country, or airport code..."
            className="w-full bg-white border border-[rgba(194,85,56,0.08)] rounded-[10px] py-3 pl-12 pr-4 text-gray-dark placeholder:text-on-light-tertiary/50 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
            role="combobox"
            aria-expanded={isOpen}
            aria-autocomplete="list"
            aria-controls="destination-listbox"
          />
          {isLoading && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <div className="w-5 h-5 border-2 border-black/10 border-t-accent rounded-full animate-spin" />
            </div>
          )}
        </div>

        {isOpen && (iataMatches.length > 0 || results.length > 0) && (
          <ul
            id="destination-listbox"
            role="listbox"
            className="absolute z-50 w-full mt-2 bg-white rounded-[14px] border border-[rgba(194,85,56,0.08)] shadow-[0_2px_12px_rgba(194,85,56,0.06)] overflow-hidden"
          >
            {iataMatches.map((match) => {
              const isAlreadyAdded = store.destinations.includes(match.display);
              return (
                <li
                  key={match.code}
                  role="option"
                  aria-selected={false}
                  className={`px-4 py-3 cursor-pointer text-sm transition-colors flex items-center gap-3 text-gray-dark hover:bg-page-bg ${isAlreadyAdded ? "opacity-50" : ""} border-b border-black/5`}
                  onClick={() => { if (!isAlreadyAdded) selectIata(match); }}
                >
                  <span className="material-symbols-outlined text-[18px] text-accent">flight</span>
                  <div>
                    <span className="font-semibold text-accent">{match.code}</span>
                    <span className="text-on-light-secondary ml-1">- {match.city}</span>
                    {isAlreadyAdded && (
                      <span className="text-on-light-tertiary ml-2 text-xs">(already added)</span>
                    )}
                  </div>
                </li>
              );
            })}
            {results.map((feature, index) => {
              const label = formatPlace(feature);
              const isHighlighted = index === highlightedIndex;
              const isAlreadyAdded = store.destinations.includes(label);

              return (
                <li
                  key={feature.id}
                  role="option"
                  aria-selected={isHighlighted}
                  className={`px-4 py-3 cursor-pointer text-sm transition-colors flex items-center gap-3 ${
                    isHighlighted
                      ? "bg-accent/10 text-accent"
                      : "text-gray-dark hover:bg-page-bg"
                  } ${isAlreadyAdded ? "opacity-50" : ""} ${
                    index < results.length - 1 ? "border-b border-black/5" : ""
                  }`}
                  onClick={() => {
                    if (!isAlreadyAdded) selectPlace(feature);
                  }}
                  onMouseEnter={() => setHighlightedIndex(index)}
                >
                  <span className="material-symbols-outlined text-[18px] text-on-light-tertiary">
                    location_on
                  </span>
                  <div>
                    <span className="font-semibold">{feature.text}</span>
                    {feature.place_name !== feature.text && (
                      <span className="text-on-light-secondary ml-1">
                        {feature.place_name.replace(feature.text + ", ", "")}
                      </span>
                    )}
                    {isAlreadyAdded && (
                      <span className="text-on-light-tertiary ml-2 text-xs">(already added)</span>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
