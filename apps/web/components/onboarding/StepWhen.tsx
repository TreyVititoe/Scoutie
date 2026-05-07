"use client";

import { TripPrefs } from "@/app/onboarding/page";

type Props = {
  prefs: TripPrefs;
  update: (f: Partial<TripPrefs>) => void;
  onNext: () => void;
  onBack: () => void;
};

export default function StepWhen({ prefs, update, onNext, onBack }: Props) {
  const nights =
    prefs.startDate && prefs.endDate
      ? Math.max(
          0,
          Math.round(
            (new Date(prefs.endDate).getTime() - new Date(prefs.startDate).getTime()) /
              (1000 * 60 * 60 * 24)
          )
        )
      : null;

  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="flex flex-col flex-1">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-gray-dark mb-2">When are you going?</h1>
        <p className="text-on-light-secondary">Pick your travel dates.</p>
      </div>

      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-sm font-semibold text-gray-dark mb-1 ml-1">Departure</label>
          <input
            type="date"
            min={today}
            value={prefs.startDate}
            onChange={(e) => update({ startDate: e.target.value })}
            className="w-full bg-white border border-[rgba(194,85,56,0.08)] rounded-[10px] px-5 py-4 text-lg text-gray-dark focus:outline-none focus:ring-2 focus:ring-accent transition"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-dark mb-1 ml-1">Return</label>
          <input
            type="date"
            min={prefs.startDate || today}
            value={prefs.endDate}
            onChange={(e) => update({ endDate: e.target.value })}
            className="w-full bg-white border border-[rgba(194,85,56,0.08)] rounded-[10px] px-5 py-4 text-lg text-gray-dark focus:outline-none focus:ring-2 focus:ring-accent transition"
          />
        </div>
      </div>

      {nights !== null && nights > 0 && (
        <div className="bg-accent-light rounded-[8px] px-5 py-4 text-accent font-medium text-center mb-6">
          {nights} night{nights !== 1 ? "s" : ""} in {prefs.destination}
        </div>
      )}

      <div className="mt-auto flex gap-3">
        <button
          onClick={onBack}
          className="flex-1 border border-[rgba(194,85,56,0.08)] text-on-light-secondary font-semibold py-4 rounded-[10px] text-lg hover:bg-page-bg transition-colors"
        >
          Back
        </button>
        <button
          onClick={onNext}
          disabled={!prefs.startDate || !prefs.endDate || nights === 0}
          className="flex-2 flex-grow-[2] bg-accent hover:bg-accent-light disabled:bg-gray-light disabled:text-on-light-tertiary text-white font-semibold py-4 rounded-[10px] text-lg transition-colors"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
