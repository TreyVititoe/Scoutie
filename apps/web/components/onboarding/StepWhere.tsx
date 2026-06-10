"use client";

import { TripPrefs } from "@/app/onboarding/page";

type Props = {
  prefs: TripPrefs;
  update: (f: Partial<TripPrefs>) => void;
  onNext: () => void;
};

const popular = ["Paris", "Tokyo", "New York", "Bali", "Rome", "Cancún", "Barcelona", "Tulum"];

export default function StepWhere({ prefs, update, onNext }: Props) {
  return (
    <div className="flex flex-col flex-1">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-ink mb-2">Where to?</h1>
        <p className="text-ink-soft">Type a city, country, or region.</p>
      </div>

      <input
        type="text"
        placeholder="e.g. Tokyo, Japan"
        value={prefs.destination}
        onChange={(e) => update({ destination: e.target.value })}
        className="w-full bg-white border border-[rgba(91,141,239,0.08)] rounded-[10px] px-5 py-4 text-lg text-ink placeholder-ink-faint focus:outline-none focus:ring-2 focus:ring-accent transition mb-6"
        autoFocus
      />

      <p className="text-xs font-semibold text-ink-faint uppercase tracking-widest mb-3">Popular</p>
      <div className="flex flex-wrap gap-2 mb-10">
        {popular.map((place) => (
          <button
            key={place}
            onClick={() => update({ destination: place })}
            className={`px-4 py-2 rounded-pill border text-sm font-medium transition-colors ${
              prefs.destination === place
                ? "bg-accent border-accent text-white"
                : "border-[rgba(91,141,239,0.08)] text-ink-soft hover:border-accent/30"
            }`}
          >
            {place}
          </button>
        ))}
      </div>

      <div className="mt-auto">
        <button
          onClick={onNext}
          disabled={!prefs.destination.trim()}
          className="w-full bg-accent hover:bg-accent-light disabled:bg-hover-slate disabled:text-ink-faint text-white font-semibold py-4 rounded-[10px] text-lg transition-colors"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
