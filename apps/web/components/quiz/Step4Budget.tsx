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
        <div className="flex rounded-2xl bg-surface-container-low p-1 gap-1">
          {(["total_trip", "per_day"] as BudgetMode[]).map((mode) => (
            <button
              key={mode}
              onClick={() => store.setBudgetMode(mode)}
              className={`flex-1 py-3 rounded-xl text-sm font-bold font-body transition-all ${
                store.budgetMode === mode
                  ? "bg-primary text-white shadow-md shadow-primary/20"
                  : "text-on-surface-variant hover:bg-surface-container-high"
              }`}
            >
              {mode === "total_trip" ? "Total trip" : "Per day"}
            </button>
          ))}
        </div>

        {/* Budget input */}
        <div className="relative">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-[22px]">
            payments
          </span>
          <input
            type="number"
            value={store.budgetAmount || ""}
            onChange={(e) => store.setBudgetAmount(Number(e.target.value) || null)}
            placeholder="0"
            className="w-full bg-surface-container-low border-none rounded-xl py-4 pl-12 pr-4 text-2xl font-headline font-extrabold text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        {/* Quick presets */}
        <div className="flex flex-wrap gap-2">
          {presets.map((p) => (
            <button
              key={p}
              onClick={() => store.setBudgetAmount(p)}
              className={`px-4 py-2.5 rounded-full text-sm font-body font-semibold transition-all ${
                store.budgetAmount === p
                  ? "bg-primary text-white shadow-md shadow-primary/20"
                  : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high"
              }`}
            >
              ${p.toLocaleString()}
            </button>
          ))}
        </div>

        {/* Budget breakdown preview */}
        {store.budgetAmount && store.budgetMode === "total_trip" && (
          <div className="bg-primary/5 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <span className="material-symbols-outlined text-primary text-[20px]">pie_chart</span>
              <p className="text-sm font-bold font-body text-primary">Estimated breakdown</p>
            </div>
            <div className="space-y-2.5">
              {[
                { label: "Flights", pct: 30, icon: "flight" },
                { label: "Accommodation", pct: 40, icon: "hotel" },
                { label: "Activities", pct: 20, icon: "confirmation_number" },
                { label: "Food & other", pct: 10, icon: "restaurant" },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary/70 text-[18px]">{item.icon}</span>
                    <span className="text-sm text-on-surface font-body">{item.label}</span>
                  </div>
                  <span className="text-sm font-headline font-bold text-on-surface">
                    ~${Math.round((store.budgetAmount! * item.pct) / 100).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Flexible toggle */}
        <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl hover:bg-surface-container-low transition-colors">
          <input
            type="checkbox"
            checked={store.budgetFlexible}
            onChange={(e) => store.setBudgetFlexible(e.target.checked)}
            className="w-5 h-5 rounded border-outline-variant text-primary focus:ring-primary/20"
          />
          <span className="text-on-surface-variant font-body text-sm">I&apos;m flexible -- show me options slightly above my budget too</span>
        </label>
      </div>
    </StepWrapper>
  );
}
