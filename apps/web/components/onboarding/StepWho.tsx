"use client";

import { TripPrefs } from "@/app/onboarding/page";

type Props = {
  prefs: TripPrefs;
  update: (f: Partial<TripPrefs>) => void;
  onNext: () => void;
  onBack: () => void;
};

const types = [
  { id: "solo", label: "Solo" },
  { id: "couple", label: "Couple" },
  { id: "friends", label: "Friends" },
  { id: "family", label: "Family" },
];

export default function StepWho({ prefs, update, onNext, onBack }: Props) {
  return (
    <div className="flex flex-col flex-1">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-ink mb-2">Who&apos;s coming?</h1>
        <p className="text-ink-soft">This helps us tailor everything.</p>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-8">
        {types.map((t) => (
          <button
            key={t.id}
            onClick={() => update({ travelersType: t.id })}
            className={`flex flex-col items-center justify-center py-6 rounded-[14px] border transition-all ${
              prefs.travelersType === t.id
                ? "bg-accent/5 border-accent"
                : "bg-white border-[rgba(91,141,239,0.08)] hover:border-accent/30"
            }`}
          >
            <span className={`font-semibold ${prefs.travelersType === t.id ? "text-accent" : "text-ink"}`}>
              {t.label}
            </span>
          </button>
        ))}
      </div>

      {/* Traveler count */}
      <div className="bg-page-bg rounded-[14px] px-5 py-4 flex items-center justify-between mb-10">
        <span className="text-ink font-medium">Travelers</span>
        <div className="flex items-center gap-4">
          <button
            onClick={() => update({ travelers: Math.max(1, prefs.travelers - 1) })}
            className="w-9 h-9 rounded-full border border-[rgba(91,141,239,0.08)] bg-white text-ink font-semibold text-lg flex items-center justify-center hover:border-accent/30 transition"
          >
            −
          </button>
          <span className="text-xl font-semibold text-ink w-6 text-center">{prefs.travelers}</span>
          <button
            onClick={() => update({ travelers: prefs.travelers + 1 })}
            className="w-9 h-9 rounded-full border border-[rgba(91,141,239,0.08)] bg-white text-ink font-semibold text-lg flex items-center justify-center hover:border-accent/30 transition"
          >
            +
          </button>
        </div>
      </div>

      <div className="mt-auto flex gap-3">
        <button onClick={onBack} className="flex-1 border border-[rgba(91,141,239,0.08)] text-ink-soft font-semibold py-4 rounded-[10px] text-lg hover:bg-page-bg transition-colors">
          Back
        </button>
        <button onClick={onNext} className="flex-grow-[2] flex-1 bg-accent hover:bg-accent-light text-white font-semibold py-4 rounded-[10px] text-lg transition-colors">
          Continue
        </button>
      </div>
    </div>
  );
}
