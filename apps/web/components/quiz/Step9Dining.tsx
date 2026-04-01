"use client";

import { useQuizStore, DiningPreference } from "@/lib/stores/quizStore";
import StepWrapper from "./StepWrapper";

const diningOptions: { value: DiningPreference; label: string }[] = [
  { value: "budget", label: "Budget eats" },
  { value: "mid_range", label: "Mid-range" },
  { value: "fine_dining", label: "Fine dining" },
  { value: "mixed", label: "Mix of everything" },
];

const restrictions = [
  "Vegetarian",
  "Vegan",
  "Halal",
  "Kosher",
  "Gluten-free",
  "Dairy-free",
  "Nut allergy",
  "Shellfish allergy",
  "Pescatarian",
];

export default function Step9Dining() {
  const store = useQuizStore();

  const toggleRestriction = (r: string) => {
    if (store.dietaryRestrictions.includes(r)) {
      store.setDietaryRestrictions(store.dietaryRestrictions.filter((d) => d !== r));
    } else {
      store.setDietaryRestrictions([...store.dietaryRestrictions, r]);
    }
  };

  return (
    <StepWrapper
      title="Food preferences"
      subtitle="So we can recommend the right restaurants and food experiences."
    >
      <div className="space-y-6">
        {/* Dining style */}
        <div className="grid grid-cols-2 gap-3">
          {diningOptions.map((d) => (
            <button
              key={d.value}
              onClick={() => store.setDiningPreference(d.value)}
              className={`p-4 rounded-xl border-2 text-left transition-all ${
                store.diningPreference === d.value
                  ? "border-primary bg-primary-50"
                  : "border-border bg-surface hover:border-primary-light"
              }`}
            >
              <span className="text-sm font-medium text-text">{d.label}</span>
            </button>
          ))}
        </div>

        {/* Dietary restrictions */}
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-2">
            Dietary restrictions (optional)
          </label>
          <div className="flex flex-wrap gap-2">
            {restrictions.map((r) => (
              <button
                key={r}
                onClick={() => toggleRestriction(r)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                  store.dietaryRestrictions.includes(r)
                    ? "bg-primary text-white"
                    : "bg-surface border border-border text-text-secondary hover:border-primary-light"
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
      </div>
    </StepWrapper>
  );
}
