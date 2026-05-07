"use client";

import { TripPrefs } from "@/app/onboarding/page";

type Props = {
  prefs: TripPrefs;
  update: (f: Partial<TripPrefs>) => void;
  onNext: () => void;
  onBack: () => void;
};

const options = [
  { id: "hotel", label: "Hotel", desc: "Room service, amenities, consistency" },
  { id: "airbnb", label: "Airbnb", desc: "Local feel, more space, unique spots" },
  { id: "hostel", label: "Hostel", desc: "Budget-friendly, social atmosphere" },
  { id: "resort", label: "Resort", desc: "All-inclusive, pools, relaxation" },
  { id: "boutique", label: "Boutique", desc: "Curated, stylish, one-of-a-kind" },
  { id: "any", label: "Surprise me", desc: "Best value, whatever fits" },
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
        <h1 className="text-3xl font-semibold text-gray-dark mb-2">Where do you like to stay?</h1>
        <p className="text-on-light-secondary">Pick one or more types.</p>
      </div>

      <div className="space-y-3 mb-10">
        {options.map((o) => {
          const selected = prefs.stay.includes(o.id);
          return (
            <button
              key={o.id}
              onClick={() => toggle(o.id)}
              className={`w-full flex items-center gap-4 px-5 py-4 rounded-[14px] border transition-all text-left ${
                selected
                  ? "bg-accent/5 border-accent"
                  : "bg-white border-[rgba(194,85,56,0.08)] hover:border-accent/30"
              }`}
            >
              <div>
                <div className={`font-semibold ${selected ? "text-accent" : "text-gray-dark"}`}>
                  {o.label}
                </div>
                <div className="text-xs text-on-light-tertiary mt-0.5">{o.desc}</div>
              </div>
              {selected && (
                <div className="ml-auto w-5 h-5 rounded-full bg-accent flex items-center justify-center">
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
        <button onClick={onBack} className="flex-1 border border-[rgba(194,85,56,0.08)] text-on-light-secondary font-semibold py-4 rounded-[10px] text-lg hover:bg-page-bg transition-colors">
          Back
        </button>
        <button
          onClick={onNext}
          disabled={prefs.stay.length === 0}
          className="flex-grow-[2] flex-1 bg-accent hover:bg-accent-light disabled:bg-gray-light disabled:text-on-light-tertiary text-white font-semibold py-4 rounded-[10px] text-lg transition-colors"
        >
          Find my trip
        </button>
      </div>
    </div>
  );
}
