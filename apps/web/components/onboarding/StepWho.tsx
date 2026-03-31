"use client";

import { TripPrefs } from "@/app/onboarding/page";

type Props = {
  prefs: TripPrefs;
  update: (f: Partial<TripPrefs>) => void;
  onNext: () => void;
  onBack: () => void;
};

const types = [
  { id: "solo", label: "Solo", emoji: "🧍" },
  { id: "couple", label: "Couple", emoji: "👫" },
  { id: "friends", label: "Friends", emoji: "👯" },
  { id: "family", label: "Family", emoji: "👨‍👩‍👧‍👦" },
];

export default function StepWho({ prefs, update, onNext, onBack }: Props) {
  return (
    <div className="flex flex-col flex-1">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Who&apos;s coming?</h1>
        <p className="text-gray-500">This helps us tailor everything.</p>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-8">
        {types.map((t) => (
          <button
            key={t.id}
            onClick={() => update({ travelersType: t.id })}
            className={`flex flex-col items-center justify-center py-6 rounded-2xl border-2 transition-all ${
              prefs.travelersType === t.id
                ? "border-sky-500 bg-sky-50"
                : "border-gray-100 bg-gray-50 hover:border-gray-200"
            }`}
          >
            <span className="text-3xl mb-2">{t.emoji}</span>
            <span className={`font-semibold ${prefs.travelersType === t.id ? "text-sky-600" : "text-gray-700"}`}>
              {t.label}
            </span>
          </button>
        ))}
      </div>

      {/* Traveler count */}
      <div className="bg-gray-50 rounded-2xl px-5 py-4 flex items-center justify-between mb-10">
        <span className="text-gray-700 font-medium">Travelers</span>
        <div className="flex items-center gap-4">
          <button
            onClick={() => update({ travelers: Math.max(1, prefs.travelers - 1) })}
            className="w-9 h-9 rounded-full border border-gray-200 bg-white text-gray-700 font-bold text-lg flex items-center justify-center hover:border-sky-400 transition"
          >
            −
          </button>
          <span className="text-xl font-bold text-gray-900 w-6 text-center">{prefs.travelers}</span>
          <button
            onClick={() => update({ travelers: prefs.travelers + 1 })}
            className="w-9 h-9 rounded-full border border-gray-200 bg-white text-gray-700 font-bold text-lg flex items-center justify-center hover:border-sky-400 transition"
          >
            +
          </button>
        </div>
      </div>

      <div className="mt-auto flex gap-3">
        <button onClick={onBack} className="flex-1 border border-gray-200 text-gray-600 font-semibold py-4 rounded-2xl text-lg hover:bg-gray-50 transition-colors">
          Back
        </button>
        <button onClick={onNext} className="flex-grow-[2] flex-1 bg-sky-500 hover:bg-sky-600 text-white font-semibold py-4 rounded-2xl text-lg transition-colors">
          Continue
        </button>
      </div>
    </div>
  );
}
