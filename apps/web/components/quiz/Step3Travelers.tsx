"use client";

import { useQuizStore, TravelerType } from "@/lib/stores/quizStore";
import StepWrapper from "./StepWrapper";

const travelerTypes: { type: TravelerType; icon: string; label: string }[] = [
  { type: "solo", icon: "🧑", label: "Solo" },
  { type: "couple", icon: "👫", label: "Couple" },
  { type: "family", icon: "👨‍👩‍👧‍👦", label: "Family" },
  { type: "friends", icon: "👯", label: "Friends" },
  { type: "business", icon: "💼", label: "Business" },
];

export default function Step3Travelers() {
  const store = useQuizStore();

  return (
    <StepWrapper
      title="Who's coming along?"
      subtitle="This helps us pick the right activities and accommodation."
    >
      <div className="space-y-6">
        {/* Traveler type */}
        <div className="flex flex-wrap gap-3">
          {travelerTypes.map((t) => (
            <button
              key={t.type}
              onClick={() => store.setTravelerType(t.type)}
              className={`px-5 py-3 rounded-xl border-2 font-medium transition-all ${
                store.travelerType === t.type
                  ? "border-primary bg-primary-50 text-primary-700"
                  : "border-border bg-surface text-text hover:border-primary-light"
              }`}
            >
              <span className="mr-2">{t.icon}</span>
              {t.label}
            </button>
          ))}
        </div>

        {/* Traveler count */}
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-2">
            How many travelers?
          </label>
          <div className="flex items-center gap-4">
            <button
              onClick={() => store.setTravelersCount(Math.max(1, store.travelersCount - 1))}
              className="w-10 h-10 rounded-full border border-border flex items-center justify-center text-lg font-bold hover:bg-primary-50 transition-colors"
            >
              -
            </button>
            <span className="text-2xl font-display font-bold w-8 text-center">
              {store.travelersCount}
            </span>
            <button
              onClick={() => store.setTravelersCount(store.travelersCount + 1)}
              className="w-10 h-10 rounded-full border border-border flex items-center justify-center text-lg font-bold hover:bg-primary-50 transition-colors"
            >
              +
            </button>
          </div>
        </div>

        {/* Children */}
        {store.travelerType === "family" && (
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Children?
            </label>
            <div className="flex items-center gap-4">
              <button
                onClick={() => {
                  const next = Math.max(0, store.childrenCount - 1);
                  store.setChildrenCount(next);
                  store.setChildrenAges(store.childrenAges.slice(0, next));
                }}
                className="w-10 h-10 rounded-full border border-border flex items-center justify-center text-lg font-bold hover:bg-primary-50 transition-colors"
              >
                -
              </button>
              <span className="text-2xl font-display font-bold w-8 text-center">
                {store.childrenCount}
              </span>
              <button
                onClick={() => {
                  store.setChildrenCount(store.childrenCount + 1);
                  store.setChildrenAges([...store.childrenAges, 5]);
                }}
                className="w-10 h-10 rounded-full border border-border flex items-center justify-center text-lg font-bold hover:bg-primary-50 transition-colors"
              >
                +
              </button>
            </div>

            {store.childrenCount > 0 && (
              <div className="flex flex-wrap gap-3 mt-3">
                {store.childrenAges.map((age, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <label className="text-sm text-text-secondary">Child {i + 1} age:</label>
                    <input
                      type="number"
                      min={0}
                      max={17}
                      value={age}
                      onChange={(e) => {
                        const newAges = [...store.childrenAges];
                        newAges[i] = Number(e.target.value);
                        store.setChildrenAges(newAges);
                      }}
                      className="w-16 px-2 py-1 rounded-lg border border-border text-center"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </StepWrapper>
  );
}
