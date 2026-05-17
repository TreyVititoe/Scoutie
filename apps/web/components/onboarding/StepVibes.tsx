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
        <h1 className="text-3xl font-semibold text-gray-dark mb-2">What&apos;s your vibe?</h1>
        <p className="text-on-light-secondary">Pick everything that fits. We&apos;ll match your style.</p>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-10">
        {vibes.map((v) => {
          const selected = prefs.vibes.includes(v.id);
          return (
            <button
              key={v.id}
              onClick={() => toggle(v.id)}
              className={`flex items-center gap-3 px-4 py-4 rounded-[14px] border transition-all text-left ${
                selected
                  ? "bg-accent/5 border-accent"
                  : "bg-white border-[rgba(37,99,235,0.08)] hover:border-accent/30"
              }`}
            >
              <span className={`font-semibold text-sm ${selected ? "text-accent" : "text-gray-dark"}`}>
                {v.label}
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-auto flex gap-3">
        <button onClick={onBack} className="flex-1 border border-[rgba(37,99,235,0.08)] text-on-light-secondary font-semibold py-4 rounded-[10px] text-lg hover:bg-page-bg transition-colors">
          Back
        </button>
        <button
          onClick={onNext}
          disabled={prefs.vibes.length === 0}
          className="flex-grow-[2] flex-1 bg-accent hover:bg-accent-light disabled:bg-gray-light disabled:text-on-light-tertiary text-white font-semibold py-4 rounded-[10px] text-lg transition-colors"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
