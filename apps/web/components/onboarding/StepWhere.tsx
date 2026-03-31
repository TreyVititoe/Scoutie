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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Where to?</h1>
        <p className="text-gray-500">Type a city, country, or region.</p>
      </div>

      <input
        type="text"
        placeholder="e.g. Tokyo, Japan"
        value={prefs.destination}
        onChange={(e) => update({ destination: e.target.value })}
        className="w-full border border-gray-200 rounded-2xl px-5 py-4 text-lg text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-sky-400 transition mb-6"
        autoFocus
      />

      <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Popular</p>
      <div className="flex flex-wrap gap-2 mb-10">
        {popular.map((place) => (
          <button
            key={place}
            onClick={() => update({ destination: place })}
            className={`px-4 py-2 rounded-full border text-sm font-medium transition-colors ${
              prefs.destination === place
                ? "bg-sky-500 border-sky-500 text-white"
                : "border-gray-200 text-gray-600 hover:border-sky-300 hover:text-sky-500"
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
          className="w-full bg-sky-500 hover:bg-sky-600 disabled:bg-gray-100 disabled:text-gray-300 text-white font-semibold py-4 rounded-2xl text-lg transition-colors"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
