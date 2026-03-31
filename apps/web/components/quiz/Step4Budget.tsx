"use client";

import { useQuizStore, BudgetMode } from "@/lib/stores/quizStore";
import StepWrapper from "./StepWrapper";

const presets = [500, 1000, 2000, 3000, 5000, 10000];

export default function Step4Budget() {
  const store = useQuizStore();

  return (
    <StepWrapper
      title="What's your budget?"
      subtitle="We'll find the best value within your range."
    >
      <div className="space-y-6">
        {/* Budget mode toggle */}
        <div className="flex rounded-xl border border-border overflow-hidden">
          {(["total_trip", "per_day"] as BudgetMode[]).map((mode) => (
            <button
              key={mode}
              onClick={() => store.setBudgetMode(mode)}
              className={`flex-1 py-3 text-sm font-semibold transition-colors ${
                store.budgetMode === mode
                  ? "bg-primary text-white"
                  : "bg-surface text-text-secondary hover:bg-primary-50"
              }`}
            >
              {mode === "total_trip" ? "Total trip" : "Per day"}
            </button>
          ))}
        </div>

        {/* Budget input */}
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary font-mono text-lg">
            $
          </span>
          <input
            type="number"
            value={store.budgetAmount || ""}
            onChange={(e) => store.setBudgetAmount(Number(e.target.value) || null)}
            placeholder="0"
            className="w-full pl-10 pr-4 py-4 rounded-xl border border-border bg-surface text-2xl font-mono font-bold text-text focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* Quick presets */}
        <div className="flex flex-wrap gap-2">
          {presets.map((p) => (
            <button
              key={p}
              onClick={() => store.setBudgetAmount(p)}
              className={`px-4 py-2 rounded-full text-sm font-mono font-semibold transition-all ${
                store.budgetAmount === p
                  ? "bg-primary text-white"
                  : "bg-surface border border-border text-text-secondary hover:border-primary-light"
              }`}
            >
              ${p.toLocaleString()}
            </button>
          ))}
        </div>

        {/* Budget breakdown preview */}
        {store.budgetAmount && store.budgetMode === "total_trip" && (
          <div className="bg-primary-50 rounded-xl p-4">
            <p className="text-sm font-semibold text-primary-700 mb-3">Estimated breakdown</p>
            <div className="space-y-2">
              {[
                { label: "Flights", pct: 30 },
                { label: "Accommodation", pct: 40 },
                { label: "Activities", pct: 20 },
                { label: "Food & other", pct: 10 },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between">
                  <span className="text-sm text-primary-700">{item.label}</span>
                  <span className="text-sm font-mono font-semibold text-primary-700">
                    ~${Math.round((store.budgetAmount! * item.pct) / 100).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Flexible toggle */}
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={store.budgetFlexible}
            onChange={(e) => store.setBudgetFlexible(e.target.checked)}
            className="w-5 h-5 rounded border-border text-primary focus:ring-primary"
          />
          <span className="text-text-secondary">I&apos;m flexible — show me options slightly above my budget too</span>
        </label>
      </div>
    </StepWrapper>
  );
}
