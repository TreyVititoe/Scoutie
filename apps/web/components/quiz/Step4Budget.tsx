"use client";

import { useQuizStore, BudgetMode } from "@/lib/stores/quizStore";
import StepWrapper from "./StepWrapper";

const presets = [500, 1000, 2000, 3000, 5000, 10000];

type BudgetOption = BudgetMode | "skip";

const budgetOptions: { value: BudgetOption; label: string; icon: string }[] = [
  { value: "per_day", label: "Per day", icon: "today" },
  { value: "total_trip", label: "For the whole trip", icon: "savings" },
  { value: "skip", label: "Decide later", icon: "schedule" },
];

export default function Step4Budget() {
  const store = useQuizStore();

  const activeBudgetOption: BudgetOption = store.budgetSkipped
    ? "skip"
    : store.budgetMode;

  const handleBudgetOption = (option: BudgetOption) => {
    if (option === "skip") {
      store.setBudgetSkipped(true);
      store.setBudgetAmount(null);
    } else {
      store.setBudgetSkipped(false);
      store.setBudgetMode(option);
    }
  };

  const incrementBudget = () => {
    store.setBudgetAmount((store.budgetAmount || 0) + 50);
  };

  const decrementBudget = () => {
    store.setBudgetAmount(Math.max(0, (store.budgetAmount || 0) - 50));
  };

  return (
    <StepWrapper
      title="What's your budget?"
      subtitle="We'll find the best value within your range."
    >
      <div className="space-y-6">
        {/* Budget mode toggle — 3 options */}
        <div className="flex rounded-[8px] bg-gray-light p-1 gap-1">
          {budgetOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => handleBudgetOption(opt.value)}
              className={`flex-1 py-3 rounded-[8px] text-sm font-semibold transition-all flex items-center justify-center gap-1.5 ${
                activeBudgetOption === opt.value
                  ? "bg-accent text-white shadow-md"
                  : "text-on-light-secondary hover:bg-black/5"
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">{opt.icon}</span>
              {opt.label}
            </button>
          ))}
        </div>

        {/* Budget input — hidden when skipped */}
        {!store.budgetSkipped && (
          <>
            {/* Amount with +/- stepper */}
            <div className="flex items-center gap-4">
              <button
                onClick={decrementBudget}
                className="w-12 h-12 rounded-full bg-gray-light flex items-center justify-center hover:bg-black/5 transition-colors"
              >
                <span className="material-symbols-outlined text-on-light-tertiary">remove</span>
              </button>

              <div className="relative flex-1">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-light-tertiary text-[22px]">
                  payments
                </span>
                <input
                  type="number"
                  value={store.budgetAmount || ""}
                  onChange={(e) => store.setBudgetAmount(Number(e.target.value) || null)}
                  placeholder="0"
                  className="w-full bg-white border border-black/10 rounded-[8px] py-3 pl-12 pr-4 text-2xl font-semibold text-gray-dark focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                />
              </div>

              <button
                onClick={incrementBudget}
                className="w-12 h-12 rounded-full bg-gray-light flex items-center justify-center hover:bg-black/5 transition-colors"
              >
                <span className="material-symbols-outlined text-on-light-tertiary">add</span>
              </button>
            </div>

            {/* Quick presets */}
            <div className="flex flex-wrap gap-2">
              {presets.map((p) => (
                <button
                  key={p}
                  onClick={() => store.setBudgetAmount(p)}
                  className={`px-4 py-2.5 rounded-pill text-sm font-semibold transition-all ${
                    store.budgetAmount === p
                      ? "bg-accent text-white shadow-md"
                      : "bg-gray-light text-on-light-secondary hover:bg-black/5"
                  }`}
                >
                  ${p.toLocaleString()}
                </button>
              ))}
            </div>

            {/* Budget breakdown preview */}
            {store.budgetAmount && store.budgetMode === "total_trip" && (
              <div className="bg-accent/5 rounded-[8px] p-5">
                <div className="flex items-center gap-2 mb-3">
                  <span className="material-symbols-outlined text-accent text-[20px]">pie_chart</span>
                  <p className="text-sm font-semibold text-accent">Estimated breakdown</p>
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
                        <span className="material-symbols-outlined text-accent/70 text-[18px]">{item.icon}</span>
                        <span className="text-sm text-gray-dark">{item.label}</span>
                      </div>
                      <span className="text-sm font-semibold text-gray-dark">
                        ~${Math.round((store.budgetAmount! * item.pct) / 100).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Flexible toggle */}
            <label className="flex items-center gap-3 cursor-pointer p-3 rounded-[8px] hover:bg-gray-light transition-colors">
              <input
                type="checkbox"
                checked={store.budgetFlexible}
                onChange={(e) => store.setBudgetFlexible(e.target.checked)}
                className="w-5 h-5 rounded border-black/10 text-accent focus:ring-accent/20"
              />
              <span className="text-on-light-secondary text-sm">I&apos;m flexible -- show me options slightly above my budget too</span>
            </label>
          </>
        )}

        {/* Skipped state messaging */}
        {store.budgetSkipped && (
          <div className="flex items-center gap-3 bg-gray-light rounded-[8px] p-5">
            <span className="material-symbols-outlined text-on-light-tertiary text-[28px]">auto_awesome</span>
            <p className="text-sm text-on-light-secondary leading-relaxed">
              No worries — Walter will show you a range of options at different price points.
            </p>
          </div>
        )}
      </div>
    </StepWrapper>
  );
}
