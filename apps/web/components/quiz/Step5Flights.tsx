"use client";

import { useQuizStore, FlightClass, FlightPriority } from "@/lib/stores/quizStore";
import StepWrapper from "./StepWrapper";

const flightClasses: { value: FlightClass; label: string }[] = [
  { value: "economy", label: "Economy" },
  { value: "premium_economy", label: "Premium Economy" },
  { value: "business", label: "Business" },
  { value: "first", label: "First" },
  { value: "no_preference", label: "No preference" },
];

const priorities: { value: FlightPriority; label: string; desc: string }[] = [
  { value: "cheapest", label: "Cheapest", desc: "Lowest price, any stops" },
  { value: "shortest", label: "Shortest", desc: "Least travel time" },
  { value: "best_value", label: "Best value", desc: "Balance of price & time" },
  { value: "fewest_stops", label: "Direct flights", desc: "Nonstop when possible" },
];

export default function Step5Flights() {
  const store = useQuizStore();

  return (
    <StepWrapper
      title="Flight preferences"
      subtitle="We'll search for the best flights matching your style."
    >
      <div className="space-y-6">
        {/* Departure city */}
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">
            Departing from
          </label>
          <input
            type="text"
            value={store.departureCity}
            onChange={(e) => store.setDepartureCity(e.target.value)}
            placeholder="City or airport code (e.g. Los Angeles or LAX)"
            className="w-full px-4 py-3 rounded-xl border border-border bg-surface text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* Class */}
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-2">Class</label>
          <div className="flex flex-wrap gap-2">
            {flightClasses.map((fc) => (
              <button
                key={fc.value}
                onClick={() => store.setFlightClass(fc.value)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  store.flightClass === fc.value
                    ? "bg-primary text-white"
                    : "border border-border bg-surface text-text-secondary hover:border-primary-light"
                }`}
              >
                {fc.label}
              </button>
            ))}
          </div>
        </div>

        {/* Priority */}
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-2">
            What matters most?
          </label>
          <div className="grid grid-cols-2 gap-3">
            {priorities.map((p) => (
              <button
                key={p.value}
                onClick={() => store.setFlightPriority(p.value)}
                className={`p-4 rounded-xl border-2 text-left transition-all ${
                  store.flightPriority === p.value
                    ? "border-primary bg-primary-50"
                    : "border-border bg-surface hover:border-primary-light"
                }`}
              >
                <p className="font-semibold text-text text-sm">{p.label}</p>
                <p className="text-xs text-text-secondary mt-0.5">{p.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Carry-on only */}
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={store.carryOnOnly}
            onChange={(e) => store.setCarryOnOnly(e.target.checked)}
            className="w-5 h-5 rounded border-border text-primary focus:ring-primary"
          />
          <span className="text-text-secondary">Carry-on only (no checked bags)</span>
        </label>
      </div>
    </StepWrapper>
  );
}
