"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useQuizStore, FlightClass, FlightPriority } from "@/lib/stores/quizStore";
import StepWrapper from "./StepWrapper";

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

const flightClasses: { value: FlightClass; label: string; icon: string }[] = [
  { value: "economy", label: "Economy", icon: "airline_seat_recline_normal" },
  { value: "premium_economy", label: "Premium Economy", icon: "airline_seat_recline_extra" },
  { value: "business", label: "Business", icon: "airline_seat_flat" },
  { value: "first", label: "First", icon: "airline_seat_individual_suite" },
  { value: "no_preference", label: "No preference", icon: "help_outline" },
];

const priorities: { value: FlightPriority; label: string; desc: string; icon: string }[] = [
  { value: "cheapest", label: "Cheapest", desc: "Lowest price, any stops", icon: "savings" },
  { value: "shortest", label: "Shortest", desc: "Least travel time", icon: "speed" },
  { value: "best_value", label: "Best value", desc: "Balance of price & time", icon: "thumb_up" },
  { value: "fewest_stops", label: "Direct flights", desc: "Nonstop when possible", icon: "flight_takeoff" },
];

export default function Step4Flights() {
  const store = useQuizStore();
  const [input, setInput] = useState(store.departureCity || "");
  const [results, setResults] = useState<MapboxFeature[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
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
        const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encoded}.json?access_token=${token}&types=place&limit=5`;
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

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      searchPlaces(value);
    }, 300);
  };

  const selectPlace = (feature: MapboxFeature) => {
    const label = formatCity(feature);
    store.setDepartureCity(label);
    setInput(label);
    setResults([]);
    setIsOpen(false);
    setHighlightedIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || results.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev < results.length - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : results.length - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (highlightedIndex >= 0 && highlightedIndex < results.length) {
        selectPlace(results[highlightedIndex]);
      }
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
    <StepWrapper
      title="Flight preferences"
      subtitle="We'll search for the best flights matching your style."
    >
      <div className="space-y-6">
        {/* Departure city autocomplete */}
        <div>
          <label className="block text-sm font-semibold text-gray-dark mb-1.5">
            Flying out of
          </label>
          <div ref={containerRef} className="relative">
            <div className="relative">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-light-tertiary text-[22px]">
                flight_takeoff
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
                placeholder="Search for a city..."
                className="w-full bg-white border border-[rgba(37,99,235,0.08)] rounded-[10px] py-3 pl-12 pr-4 text-gray-dark placeholder:text-on-light-tertiary/50 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                role="combobox"
                aria-expanded={isOpen}
                aria-autocomplete="list"
                aria-controls="departure-city-listbox"
              />
              {isLoading && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <div className="w-5 h-5 border-2 border-black/10 border-t-accent rounded-full animate-spin" />
                </div>
              )}
            </div>

            {isOpen && results.length > 0 && (
              <ul
                id="departure-city-listbox"
                role="listbox"
                className="absolute z-50 w-full mt-2 bg-white rounded-[14px] border border-[rgba(37,99,235,0.08)] shadow-[0_2px_12px_rgba(37,99,235,0.06)] overflow-hidden"
              >
                {results.map((feature, index) => {
                  const label = formatCity(feature);
                  const isHighlighted = index === highlightedIndex;

                  return (
                    <li
                      key={feature.id}
                      role="option"
                      aria-selected={isHighlighted}
                      className={`px-4 py-3 cursor-pointer text-sm transition-colors flex items-center gap-3 ${
                        isHighlighted
                          ? "bg-accent/10 text-accent"
                          : "text-gray-dark hover:bg-page-bg"
                      } ${index < results.length - 1 ? "border-b border-black/5" : ""}`}
                      onClick={() => selectPlace(feature)}
                      onMouseEnter={() => setHighlightedIndex(index)}
                    >
                      <span className="material-symbols-outlined text-[18px] text-on-light-tertiary">
                        location_city
                      </span>
                      <div>
                        <span className="font-semibold">{feature.text}</span>
                        {feature.place_name !== feature.text && (
                          <span className="text-on-light-secondary ml-1">
                            {feature.place_name.replace(feature.text + ", ", "")}
                          </span>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {store.departureCity && !isOpen && (
            <div className="flex items-center gap-2 mt-2">
              <span className="material-symbols-outlined text-accent text-[16px]">check_circle</span>
              <span className="text-sm text-on-light-secondary">
                Flying out of <span className="font-semibold text-gray-dark">{store.departureCity}</span>
              </span>
              <button
                onClick={() => {
                  store.setDepartureCity("");
                  setInput("");
                  inputRef.current?.focus();
                }}
                className="ml-auto text-on-light-tertiary hover:text-red-500 transition-colors"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            </div>
          )}
        </div>

        {/* Class */}
        <div>
          <label className="block text-sm font-semibold text-gray-dark mb-2">Class</label>
          <div className="flex flex-wrap gap-2">
            {flightClasses.map((fc) => (
              <button
                key={fc.value}
                onClick={() => store.setFlightClass(fc.value)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-pill text-sm font-semibold transition-all ${
                  store.flightClass === fc.value
                    ? "bg-accent text-white shadow-md"
                    : "bg-page-bg border border-[rgba(37,99,235,0.08)] text-on-light-secondary hover:bg-[#DBEAFE]"
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">{fc.icon}</span>
                {fc.label}
              </button>
            ))}
          </div>
        </div>

        {/* Priority */}
        <div>
          <label className="block text-sm font-semibold text-gray-dark mb-2">
            What matters most?
          </label>
          <div className="grid grid-cols-2 gap-3">
            {priorities.map((p) => {
              const isSelected = store.flightPriority === p.value;
              return (
                <button
                  key={p.value}
                  onClick={() => store.setFlightPriority(p.value)}
                  className={`p-4 rounded-[14px] border text-left transition-colors ${
                    isSelected
                      ? "border-accent bg-accent/5"
                      : "border-[rgba(37,99,235,0.08)] bg-white hover:border-accent/30"
                  }`}
                >
                  <span className={`material-symbols-outlined text-[24px] mb-2 block ${isSelected ? "text-accent" : "text-on-light-tertiary"}`}>
                    {p.icon}
                  </span>
                  <p className="font-semibold text-gray-dark text-sm">{p.label}</p>
                  <p className="text-xs text-on-light-secondary mt-0.5">{p.desc}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Carry-on only */}
        <label className="flex items-center gap-3 cursor-pointer p-3 rounded-[10px] hover:bg-page-bg transition-colors">
          <input
            type="checkbox"
            checked={store.carryOnOnly}
            onChange={(e) => store.setCarryOnOnly(e.target.checked)}
            className="w-5 h-5 rounded border-[rgba(37,99,235,0.08)] text-accent focus:ring-accent/20"
          />
          <span className="material-symbols-outlined text-on-light-tertiary text-[20px]">luggage</span>
          <span className="text-on-light-secondary text-sm">Carry-on only (no checked bags)</span>
        </label>
      </div>
    </StepWrapper>
  );
}
