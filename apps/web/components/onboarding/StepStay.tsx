"use client";

import { TripPrefs } from "@/app/onboarding/page";

type Props = {
  prefs: TripPrefs;
  update: (f: Partial<TripPrefs>) => void;
  onNext: () => void;
  onBack: () => void;
};

const options = [
  { id: "hotel", label: "Hotel", emoji: "🏨", desc: "Room service, amenities, consistency" },
  { id: "airbnb", label: "Airbnb", emoji: "🏡", desc: "Local feel, more space, unique spots" },
  { id: "hostel", label: "Hostel", emoji: "🛏️", desc: "Budget-friendly, social atmosphere" },
  { id: "resort", label: "Resort", emoji: "🌴", desc: "All-inclusive, pools, relaxation" },
  { id: "boutique", label: "Boutique", emoji: "✨", desc: "Curated, stylish, one-of-a-kind" },
  { id: "any", label: "Surprise me", emoji: "🎲", desc: "Best value, whatever fits" },
];

export default function StepStay({ prefs, update, onNext, onBack }: Props) {
  const toggle = (id: string) => {
    const current = prefs.stay;
    const next = current.includes(id)
      ? current.filter((s) => s !== id)
      : [...current, id];
    update({ stay: next });
  };

  return (
    <div className="flex flex-col flex-1">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Where do you like to stay?</h1>
        <p className="text-gray-500">Pick one or more types.</p>
      </div>

      <div className="space-y-3 mb-10">
        {options.map((o) => {
          const selected = prefs.stay.includes(o.id);
          return (
            <button
              key={o.id}
              onClick={() => toggle(o.id)}
              className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl border-2 transition-all text-left ${
                selected
                  ? "border-sky-500 bg-sky-50"
                  : "border-gray-100 bg-gray-50 hover:border-gray-200"
              }`}
            >
              <span className="text-2xl">{o.emoji}</span>
              <div>
                <div className={`font-semibold ${selected ? "text-sky-700" : "text-gray-800"}`}>
                  {o.label}
                </div>
                <div className="text-xs text-gray-400 mt-0.5">{o.desc}</div>
              </div>
              {selected && (
                <div className="ml-auto w-5 h-5 rounded-full bg-sky-500 flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
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
          disabled={prefs.stay.length === 0}
          className="flex-grow-[2] flex-1 bg-sky-500 hover:bg-sky-600 disabled:bg-gray-100 disabled:text-gray-300 text-white font-semibold py-4 rounded-2xl text-lg transition-colors"
        >
          Find my trip ✦
        </button>
      </div>
    </div>
  );
}
