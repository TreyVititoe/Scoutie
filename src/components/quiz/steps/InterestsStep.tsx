"use client";

import { useQuizStore } from "@/lib/store";
import type { Interest } from "@/types";

const interests: { value: Interest; label: string }[] = [
  { value: "culture", label: "Culture" },
  { value: "food", label: "Food & Dining" },
  { value: "nightlife", label: "Nightlife" },
  { value: "outdoors", label: "Outdoors" },
  { value: "shopping", label: "Shopping" },
  { value: "relaxation", label: "Relaxation" },
  { value: "adventure", label: "Adventure" },
  { value: "history", label: "History" },
  { value: "art", label: "Art & Museums" },
  { value: "music", label: "Music & Shows" },
  { value: "sports", label: "Sports" },
  { value: "family", label: "Family Fun" },
];

export default function InterestsStep() {
  const { preferences, toggleInterest, nextStep } = useQuizStore();

  return (
    <div className="space-y-6 max-w-md mx-auto w-full">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-gray-900">What do you enjoy?</h2>
        <p className="text-gray-500">Pick at least 2 so we can personalize your trip.</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {interests.map((interest) => {
          const selected = preferences.interests.includes(interest.value);
          return (
            <button
              key={interest.value}
              onClick={() => toggleInterest(interest.value)}
              className={`chip ${selected ? "chip-selected" : "chip-unselected"}`}
            >
              {interest.label}
            </button>
          );
        })}
      </div>

      <button
        onClick={nextStep}
        disabled={preferences.interests.length < 2}
        className="btn-primary w-full"
      >
        Continue
      </button>
    </div>
  );
}
