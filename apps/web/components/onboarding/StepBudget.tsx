"use client";

import { TripPrefs } from "@/app/onboarding/page";

type Props = {
  prefs: TripPrefs;
  update: (f: Partial<TripPrefs>) => void;
  onNext: () => void;
  onBack: () => void;
};

const presets = [500, 1000, 2000, 5000, 10000];

export default function StepBudget({ prefs, update, onNext, onBack }: Props) {
  return (
    <div className="flex flex-col flex-1">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-gray-dark mb-2">What&apos;s your budget?</h1>
        <p className="text-on-light-secondary">We&apos;ll find options that fit.</p>
      </div>

      {/* Toggle */}
      <div className="flex bg-page-bg rounded-pill p-1 mb-6">
        {(["total", "per_day"] as const).map((type) => (
          <button
            key={type}
            onClick={() => update({ budgetType: type })}
            className={`flex-1 py-2 rounded-pill text-sm font-semibold transition-all ${
              prefs.budgetType === type
                ? "bg-white text-gray-dark shadow-sm"
                : "text-on-light-secondary"
            }`}
          >
            {type === "total" ? "Total trip" : "Per day"}
          </button>
        ))}
      </div>

      {/* Amount display */}
      <div className="text-center mb-6">
        <span className="text-5xl font-semibold text-gray-dark">
          ${prefs.budget.toLocaleString()}
        </span>
        <span className="text-on-light-tertiary text-lg ml-2">
          {prefs.budgetType === "per_day" ? "/ day" : "total"}
        </span>
      </div>

      {/* Slider */}
      <input
        type="range"
        min={100}
        max={prefs.budgetType === "per_day" ? 1000 : 20000}
        step={prefs.budgetType === "per_day" ? 50 : 100}
        value={prefs.budget}
        onChange={(e) => update({ budget: Number(e.target.value) })}
        className="w-full accent-accent mb-6"
      />

      {/* Quick picks */}
      <div className="flex gap-2 flex-wrap mb-10">
        {presets
          .filter((p) => (prefs.budgetType === "per_day" ? p <= 1000 : p <= 20000))
          .map((p) => (
            <button
              key={p}
              onClick={() => update({ budget: p })}
              className={`px-4 py-2 rounded-pill border text-sm font-medium transition-colors ${
                prefs.budget === p
                  ? "bg-accent border-accent text-white"
                  : "border-[rgba(0,101,113,0.08)] text-on-light-secondary hover:border-accent/30"
              }`}
            >
              ${p.toLocaleString()}
            </button>
          ))}
      </div>

      <div className="mt-auto flex gap-3">
        <button onClick={onBack} className="flex-1 border border-[rgba(0,101,113,0.08)] text-on-light-secondary font-semibold py-4 rounded-[10px] text-lg hover:bg-page-bg transition-colors">
          Back
        </button>
        <button onClick={onNext} className="flex-grow-[2] flex-1 bg-accent hover:bg-accent-light text-white font-semibold py-4 rounded-[10px] text-lg transition-colors">
          Continue
        </button>
      </div>
    </div>
  );
}
