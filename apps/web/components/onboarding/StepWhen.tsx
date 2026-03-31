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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">When are you going?</h1>
        <p className="text-gray-500">Pick your travel dates.</p>
      </div>

      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-500 mb-1 ml-1">Departure</label>
          <input
            type="date"
            min={today}
            value={prefs.startDate}
            onChange={(e) => update({ startDate: e.target.value })}
            className="w-full border border-gray-200 rounded-2xl px-5 py-4 text-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-sky-400 transition"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-500 mb-1 ml-1">Return</label>
          <input
            type="date"
            min={prefs.startDate || today}
            value={prefs.endDate}
            onChange={(e) => update({ endDate: e.target.value })}
            className="w-full border border-gray-200 rounded-2xl px-5 py-4 text-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-sky-400 transition"
          />
        </div>
      </div>

      {nights !== null && nights > 0 && (
        <div className="bg-sky-50 rounded-2xl px-5 py-4 text-sky-700 font-medium text-center mb-6">
          {nights} night{nights !== 1 ? "s" : ""} in {prefs.destination}
        </div>
      )}

      <div className="mt-auto flex gap-3">
        <button
          onClick={onBack}
          className="flex-1 border border-gray-200 text-gray-600 font-semibold py-4 rounded-2xl text-lg hover:bg-gray-50 transition-colors"
        >
          Back
        </button>
        <button
          onClick={onNext}
          disabled={!prefs.startDate || !prefs.endDate || nights === 0}
          className="flex-2 flex-grow-[2] bg-sky-500 hover:bg-sky-600 disabled:bg-gray-100 disabled:text-gray-300 text-white font-semibold py-4 rounded-2xl text-lg transition-colors"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
