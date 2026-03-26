"use client";

import { useQuizStore } from "@/lib/store";
import type { BudgetRange } from "@/types";

const budgetOptions: { value: BudgetRange; label: string; range: string; desc: string }[] = [
  { value: "budget", label: "Budget", range: "Under $500", desc: "Hostels, street food, free activities" },
  { value: "moderate", label: "Moderate", range: "$500 – $1,500", desc: "Mid-range hotels, good restaurants" },
  { value: "premium", label: "Premium", range: "$1,500 – $3,000", desc: "4-star stays, curated experiences" },
  { value: "luxury", label: "Luxury", range: "$3,000+", desc: "5-star everything, VIP access" },
];

export default function BudgetStep() {
  const { preferences, setBudget, setTravelers, nextStep } = useQuizStore();

  return (
    <div className="space-y-6 max-w-md mx-auto w-full">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-gray-900">What&apos;s your budget?</h2>
        <p className="text-gray-500">Per person, for the whole trip.</p>
      </div>

      <div className="space-y-3">
        {budgetOptions.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setBudget(opt.value)}
            className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
              preferences.budget === opt.value
                ? "border-brand-500 bg-brand-50"
                : "border-gray-100 hover:border-gray-200"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-semibold text-gray-900">{opt.label}</span>
              <span className="text-sm text-brand-600 font-medium">{opt.range}</span>
            </div>
            <p className="text-sm text-gray-500 mt-0.5">{opt.desc}</p>
          </button>
        ))}
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium text-gray-600">Number of travelers</label>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setTravelers(Math.max(1, preferences.travelers - 1))}
            className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50"
          >
            -
          </button>
          <span className="text-lg font-semibold tabular-nums w-8 text-center">{preferences.travelers}</span>
          <button
            onClick={() => setTravelers(Math.min(10, preferences.travelers + 1))}
            className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50"
          >
            +
          </button>
        </div>
      </div>

      <button onClick={nextStep} className="btn-primary w-full">
        Continue
      </button>
    </div>
  );
}
