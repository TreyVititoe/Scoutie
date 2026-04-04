"use client";

import { useQuizStore, FlightClass, FlightPriority } from "@/lib/stores/quizStore";
import StepWrapper from "./StepWrapper";

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
          <label className="block text-sm font-semibold font-body text-on-surface-variant mb-1.5">
            Departing from
          </label>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-[22px]">
              flight_takeoff
            </span>
            <input
              type="text"
              value={store.departureCity}
              onChange={(e) => store.setDepartureCity(e.target.value)}
              placeholder="City or airport code (e.g. Los Angeles or LAX)"
              className="w-full bg-surface-container-low border-none rounded-xl py-4 pl-12 pr-4 text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/20 font-body"
            />
          </div>
        </div>

        {/* Class */}
        <div>
          <label className="block text-sm font-semibold font-body text-on-surface-variant mb-2">Class</label>
          <div className="flex flex-wrap gap-2">
            {flightClasses.map((fc) => (
              <button
                key={fc.value}
                onClick={() => store.setFlightClass(fc.value)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-body font-semibold transition-all ${
                  store.flightClass === fc.value
                    ? "bg-primary text-white shadow-md shadow-primary/20"
                    : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high"
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
          <label className="block text-sm font-semibold font-body text-on-surface-variant mb-2">
            What matters most?
          </label>
          <div className="grid grid-cols-2 gap-3">
            {priorities.map((p) => {
              const isSelected = store.flightPriority === p.value;
              return (
                <button
                  key={p.value}
                  onClick={() => store.setFlightPriority(p.value)}
                  className={`card-3d p-5 rounded-2xl border-2 text-left transition-all duration-300 ${
                    isSelected
                      ? "border-primary shadow-lg shadow-primary/15"
                      : "border-transparent hover:-translate-y-2"
                  }`}
                >
                  <span className={`material-symbols-outlined text-[24px] mb-2 block ${isSelected ? "text-primary" : "text-on-surface-variant"}`}>
                    {p.icon}
                  </span>
                  <p className="font-headline font-bold text-on-surface text-sm">{p.label}</p>
                  <p className="text-xs text-on-surface-variant font-body mt-0.5">{p.desc}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Carry-on only */}
        <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl hover:bg-surface-container-low transition-colors">
          <input
            type="checkbox"
            checked={store.carryOnOnly}
            onChange={(e) => store.setCarryOnOnly(e.target.checked)}
            className="w-5 h-5 rounded border-outline-variant text-primary focus:ring-primary/20"
          />
          <span className="material-symbols-outlined text-on-surface-variant text-[20px]">luggage</span>
          <span className="text-on-surface-variant font-body text-sm">Carry-on only (no checked bags)</span>
        </label>
      </div>
    </StepWrapper>
  );
}
