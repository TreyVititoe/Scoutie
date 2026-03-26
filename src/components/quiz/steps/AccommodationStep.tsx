"use client";

import { useQuizStore } from "@/lib/store";
import type { AccommodationType } from "@/types";

const options: { value: AccommodationType; label: string; desc: string }[] = [
  { value: "hotel", label: "Hotel", desc: "Reliable, amenities included" },
  { value: "airbnb", label: "Airbnb / Rental", desc: "Local feel, more space" },
  { value: "hostel", label: "Hostel", desc: "Social, budget-friendly" },
  { value: "resort", label: "Resort", desc: "All-inclusive, premium" },
  { value: "any", label: "Surprise me", desc: "Show me the best options" },
];

export default function AccommodationStep() {
  const { preferences, setAccommodation, nextStep } = useQuizStore();

  return (
    <div className="space-y-6 max-w-md mx-auto w-full">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-gray-900">Where do you want to stay?</h2>
        <p className="text-gray-500">Pick your preferred accommodation type.</p>
      </div>

      <div className="space-y-3">
        {options.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setAccommodation(opt.value)}
            className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
              preferences.accommodation === opt.value
                ? "border-brand-500 bg-brand-50"
                : "border-gray-100 hover:border-gray-200"
            }`}
          >
            <span className="font-semibold text-gray-900">{opt.label}</span>
            <p className="text-sm text-gray-500 mt-0.5">{opt.desc}</p>
          </button>
        ))}
      </div>

      <button onClick={nextStep} className="btn-primary w-full">
        Continue
      </button>
    </div>
  );
}
