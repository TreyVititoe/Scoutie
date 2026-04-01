"use client";

import { TripPrefs } from "@/app/onboarding/page";

type Props = {
  prefs: TripPrefs;
  update: (f: Partial<TripPrefs>) => void;
  onNext: () => void;
  onBack: () => void;
};

const vibes = [
  { id: "adventure", label: "Adventure" },
  { id: "relaxation", label: "Relaxation" },
  { id: "culture", label: "Culture" },
  { id: "food", label: "Food & Drink" },
  { id: "nightlife", label: "Nightlife" },
  { id: "nature", label: "Nature" },
  { id: "shopping", label: "Shopping" },
  { id: "romance", label: "Romance" },
];

export default function StepVibes({ prefs, update, onNext, onBack }: Props) {
  const toggle = (id: string) => {
    const current = prefs.vibes;
    const next = current.includes(id)
      ? current.filter((v) => v !== id)
      : [...current, id];
    update({ vibes: next });
  };

  return (
    <div className="flex flex-col flex-1">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">What&apos;s your vibe?</h1>
        <p className="text-gray-500">Pick everything that fits. We&apos;ll match your style.</p>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-10">
        {vibes.map((v) => {
          const selected = prefs.vibes.includes(v.id);
          return (
            <button
              key={v.id}
              onClick={() => toggle(v.id)}
              className={`flex items-center gap-3 px-4 py-4 rounded-2xl border-2 transition-all text-left ${
                selected
                  ? "border-sky-500 bg-sky-50"
                  : "border-gray-100 bg-gray-50 hover:border-gray-200"
              }`}
            >
              <span className={`font-semibold text-sm ${selected ? "text-sky-600" : "text-gray-700"}`}>
                {v.label}
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-auto flex gap-3">
        <button onClick={onBack} className="flex-1 border border-gray-200 text-gray-600 font-semibold py-4 rounded-2xl text-lg hover:bg-gray-50 transition-colors">
          Back
        </button>
        <button
          onClick={onNext}
          disabled={prefs.vibes.length === 0}
          className="flex-grow-[2] flex-1 bg-sky-500 hover:bg-sky-600 disabled:bg-gray-100 disabled:text-gray-300 text-white font-semibold py-4 rounded-2xl text-lg transition-colors"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
