"use client";

import { useQuizStore } from "@/lib/store";

export default function DatesStep() {
  const { preferences, setDates, nextStep } = useQuizStore();

  const canContinue = preferences.startDate && preferences.endDate && preferences.startDate < preferences.endDate;

  return (
    <div className="space-y-6 max-w-md mx-auto w-full">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-gray-900">When are you going?</h2>
        <p className="text-gray-500">Pick your travel dates.</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-600">Start date</label>
          <input
            type="date"
            className="input-field"
            value={preferences.startDate}
            onChange={(e) => setDates(e.target.value, preferences.endDate)}
            min={new Date().toISOString().split("T")[0]}
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-600">End date</label>
          <input
            type="date"
            className="input-field"
            value={preferences.endDate}
            onChange={(e) => setDates(preferences.startDate, e.target.value)}
            min={preferences.startDate || new Date().toISOString().split("T")[0]}
          />
        </div>
      </div>

      {preferences.startDate && preferences.endDate && preferences.startDate < preferences.endDate && (
        <p className="text-sm text-brand-600 font-medium">
          {Math.ceil((new Date(preferences.endDate).getTime() - new Date(preferences.startDate).getTime()) / (1000 * 60 * 60 * 24))} nights
        </p>
      )}

      <button onClick={nextStep} disabled={!canContinue} className="btn-primary w-full">
        Continue
      </button>
    </div>
  );
}
