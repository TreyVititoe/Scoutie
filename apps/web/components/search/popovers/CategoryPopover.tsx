"use client";

import type { Category, SearchState } from "../searchTypes";
import type { ActivityInterest, FlightClass } from "@/lib/stores/quizStore";

const CABINS: { value: FlightClass; label: string }[] = [
  { value: "economy", label: "Economy" },
  { value: "premium_economy", label: "Premium Economy" },
  { value: "business", label: "Business" },
  { value: "first", label: "First" },
];

const VIBES: { value: ActivityInterest; label: string }[] = [
  { value: "adventure", label: "Adventure" },
  { value: "culture", label: "Culture" },
  { value: "food", label: "Food" },
  { value: "nightlife", label: "Nightlife" },
  { value: "nature", label: "Nature" },
  { value: "relaxation", label: "Relaxation" },
  { value: "shopping", label: "Shopping" },
  { value: "history", label: "History" },
  { value: "art", label: "Art" },
  { value: "sports", label: "Sports" },
  { value: "live_events", label: "Live events" },
  { value: "family_fun", label: "Family fun" },
  { value: "photography", label: "Photography" },
];

interface Props {
  category: Category;
  state: SearchState;
  onChange: <K extends keyof SearchState>(k: K, v: SearchState[K]) => void;
}

export default function CategoryPopover({ category, state, onChange }: Props) {
  if (category === "flights") {
    return (
      <div className="bg-white rounded-2xl shadow-elevated p-5 w-[280px] space-y-1">
        {CABINS.map((c) => (
          <button
            key={c.value}
            type="button"
            onClick={() => onChange("cabin", c.value)}
            className={`w-full text-left px-3 py-2 rounded-lg text-[14px] ${
              state.cabin === c.value
                ? "bg-accent/10 text-accent font-semibold"
                : "text-gray-dark hover:bg-gray-50"
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>
    );
  }

  // stays / events / picks: multi-select chips
  const field: "vibe" | "interests" =
    category === "events" ? "interests" : "vibe";
  const selected = (state[field] ?? []) as ActivityInterest[];
  const toggle = (v: ActivityInterest) => {
    const next = selected.includes(v)
      ? selected.filter((x) => x !== v)
      : [...selected, v];
    onChange(field, next as SearchState[typeof field]);
  };

  return (
    <div className="bg-white rounded-2xl shadow-elevated p-5 w-[360px]">
      <div className="flex flex-wrap gap-2">
        {VIBES.map((v) => {
          const active = selected.includes(v.value);
          return (
            <button
              key={v.value}
              type="button"
              onClick={() => toggle(v.value)}
              className={`px-3 py-1.5 rounded-full text-[12px] font-semibold border transition-colors ${
                active
                  ? "bg-accent text-white border-accent"
                  : "bg-white text-gray-dark border-gray-200 hover:border-gray-dark"
              }`}
            >
              {v.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
