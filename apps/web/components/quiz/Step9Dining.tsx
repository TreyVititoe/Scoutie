"use client";

import { useQuizStore, DiningPreference } from "@/lib/stores/quizStore";
import StepWrapper from "./StepWrapper";

const diningOptions: { value: DiningPreference; label: string; icon: string; desc: string }[] = [
  { value: "budget", label: "Budget eats", icon: "fastfood", desc: "Street food & casual spots" },
  { value: "mid_range", label: "Mid-range", icon: "restaurant", desc: "Nice sit-down restaurants" },
  { value: "fine_dining", label: "Fine dining", icon: "dining", desc: "Upscale & Michelin-level" },
  { value: "mixed", label: "Mix of everything", icon: "brunch_dining", desc: "A bit of it all" },
];

const restrictions: { label: string; icon: string }[] = [
  { label: "Vegetarian", icon: "eco" },
  { label: "Vegan", icon: "spa" },
  { label: "Halal", icon: "verified" },
  { label: "Kosher", icon: "star_border" },
  { label: "Gluten-free", icon: "grain" },
  { label: "Dairy-free", icon: "water_drop" },
  { label: "Nut allergy", icon: "warning" },
  { label: "Shellfish allergy", icon: "set_meal" },
  { label: "Pescatarian", icon: "phishing" },
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
          {diningOptions.map((d) => {
            const isSelected = store.diningPreference === d.value;
            return (
              <button
                key={d.value}
                onClick={() => store.setDiningPreference(d.value)}
                className={`card-3d flex flex-col items-center gap-2 p-5 rounded-2xl border-2 text-center transition-all duration-300 ${
                  isSelected
                    ? "border-primary shadow-lg shadow-primary/15"
                    : "border-transparent hover:-translate-y-2"
                }`}
              >
                <span className={`material-symbols-outlined text-[28px] ${isSelected ? "text-primary" : "text-on-surface-variant"}`}>
                  {d.icon}
                </span>
                <span className={`text-sm font-body font-semibold ${isSelected ? "text-primary" : "text-on-surface"}`}>
                  {d.label}
                </span>
                <span className="text-xs text-on-surface-variant font-body">{d.desc}</span>
              </button>
            );
          })}
        </div>

        {/* Dietary restrictions */}
        <div>
          <label className="block text-sm font-semibold font-body text-on-surface-variant mb-2">
            Dietary restrictions (optional)
          </label>
          <div className="flex flex-wrap gap-2">
            {restrictions.map((r) => {
              const isSelected = store.dietaryRestrictions.includes(r.label);
              return (
                <button
                  key={r.label}
                  onClick={() => toggleRestriction(r.label)}
                  className={`flex items-center gap-1.5 px-4 py-2.5 rounded-full text-sm font-body font-medium transition-all ${
                    isSelected
                      ? "bg-primary text-white shadow-md shadow-primary/20"
                      : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high"
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px]">{r.icon}</span>
                  {r.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </StepWrapper>
  );
}
