"use client";

import { useQuizStore } from "@/lib/store";

const suggestions = [
  "Paris", "Tokyo", "Barcelona", "New York", "Bali",
  "Rome", "London", "Cancún", "Dubai", "Reykjavik",
];

export default function DestinationStep() {
  const { preferences, setDestination, nextStep } = useQuizStore();

  return (
    <div className="space-y-6 max-w-md mx-auto w-full">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-gray-900">Where are you headed?</h2>
        <p className="text-gray-500">Enter a city or pick from popular spots.</p>
      </div>

      <input
        type="text"
        className="input-field text-lg"
        placeholder="Search a destination..."
        value={preferences.destination}
        onChange={(e) => setDestination(e.target.value)}
        autoFocus
      />

      <div className="flex flex-wrap gap-2">
        {suggestions.map((city) => (
          <button
            key={city}
            onClick={() => setDestination(city)}
            className={`chip ${
              preferences.destination === city ? "chip-selected" : "chip-unselected"
            }`}
          >
            {city}
          </button>
        ))}
      </div>

      <button
        onClick={nextStep}
        disabled={!preferences.destination.trim()}
        className="btn-primary w-full"
      >
        Continue
      </button>
    </div>
  );
}
