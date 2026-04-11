"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useQuizStore } from "@/lib/stores/quizStore";

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

  const removeDestination = (dest: string) => {
    store.setDestinations(store.destinations.filter((d) => d !== dest));
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
    <div className="space-y-3">
      {store.destinations.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {store.destinations.map((d) => (
            <span
              key={d}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-pill bg-[#e6f7f9] text-accent text-sm font-semibold"
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
            placeholder="Search for a city or country..."
            className="w-full bg-white border border-[rgba(0,101,113,0.08)] rounded-[10px] py-3 pl-12 pr-4 text-gray-dark placeholder:text-on-light-tertiary/50 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
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

        {isOpen && results.length > 0 && (
          <ul
            id="destination-listbox"
            role="listbox"
            className="absolute z-50 w-full mt-2 bg-white rounded-[14px] border border-[rgba(0,101,113,0.08)] shadow-[0_2px_12px_rgba(0,101,113,0.06)] overflow-hidden"
          >
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
