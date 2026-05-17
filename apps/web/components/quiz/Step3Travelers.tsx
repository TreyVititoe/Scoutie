"use client";

import { useQuizStore, TravelerType } from "@/lib/stores/quizStore";
import StepWrapper from "./StepWrapper";

const travelerTypes: { type: TravelerType; label: string; icon: string; defaultCount: number }[] = [
  { type: "solo", label: "Solo", icon: "person", defaultCount: 1 },
  { type: "couple", label: "Couple", icon: "favorite", defaultCount: 2 },
  { type: "family", label: "Family", icon: "family_restroom", defaultCount: 3 },
  { type: "friends", label: "Friends", icon: "group", defaultCount: 3 },
  { type: "business", label: "Business", icon: "work", defaultCount: 1 },
];

export default function Step3Travelers() {
  const store = useQuizStore();

  const handleTypeSelect = (t: (typeof travelerTypes)[number]) => {
    store.setTravelerType(t.type);
    store.setTravelersCount(t.defaultCount);
  };

  return (
    <StepWrapper
      title="Who's coming along?"
      subtitle="This helps us pick the right activities and accommodation."
    >
      <div className="space-y-6">
        {/* Traveler type */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {travelerTypes.map((t) => {
            const isSelected = store.travelerType === t.type;
            return (
              <button
                key={t.type}
                onClick={() => handleTypeSelect(t)}
                className={`flex flex-col items-center gap-2 p-4 rounded-[14px] border transition-colors cursor-pointer ${
                  isSelected
                    ? "border-accent bg-accent/5"
                    : "border-[rgba(37,99,235,0.08)] bg-white hover:border-accent/30"
                }`}
              >
                <span className={`material-symbols-outlined text-[28px] ${isSelected ? "text-accent" : "text-on-light-tertiary"}`}>
                  {t.icon}
                </span>
                <span className={`text-sm font-semibold ${isSelected ? "text-accent" : "text-gray-dark"}`}>
                  {t.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* Traveler count */}
        <div>
          <label className="block text-sm font-semibold text-gray-dark mb-3">
            How many travelers?
          </label>
          <div className="flex items-center gap-5">
            <button
              onClick={() => store.setTravelersCount(Math.max(1, store.travelersCount - 1))}
              className="w-12 h-12 rounded-full bg-page-bg flex items-center justify-center hover:bg-[#DBEAFE] transition-colors"
            >
              <span className="material-symbols-outlined text-on-light-tertiary">remove</span>
            </button>
            <span className="text-3xl font-semibold text-gray-dark w-10 text-center">
              {store.travelersCount}
            </span>
            <button
              onClick={() => store.setTravelersCount(store.travelersCount + 1)}
              className="w-12 h-12 rounded-full bg-page-bg flex items-center justify-center hover:bg-[#DBEAFE] transition-colors"
            >
              <span className="material-symbols-outlined text-on-light-tertiary">add</span>
            </button>
          </div>
        </div>

        {/* Children */}
        {store.travelerType === "family" && (
          <div>
            <label className="block text-sm font-semibold text-gray-dark mb-3">
              Children?
            </label>
            <div className="flex items-center gap-5">
              <button
                onClick={() => {
                  const next = Math.max(0, store.childrenCount - 1);
                  store.setChildrenCount(next);
                  store.setChildrenAges(store.childrenAges.slice(0, next));
                }}
                className="w-12 h-12 rounded-full bg-page-bg flex items-center justify-center hover:bg-[#DBEAFE] transition-colors"
              >
                <span className="material-symbols-outlined text-on-light-tertiary">remove</span>
              </button>
              <span className="text-3xl font-semibold text-gray-dark w-10 text-center">
                {store.childrenCount}
              </span>
              <button
                onClick={() => {
                  store.setChildrenCount(store.childrenCount + 1);
                  store.setChildrenAges([...store.childrenAges, 5]);
                }}
                className="w-12 h-12 rounded-full bg-page-bg flex items-center justify-center hover:bg-[#DBEAFE] transition-colors"
              >
                <span className="material-symbols-outlined text-on-light-tertiary">add</span>
              </button>
            </div>

            {store.childrenCount > 0 && (
              <div className="flex flex-wrap gap-3 mt-4">
                {store.childrenAges.map((age, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <label className="text-sm text-on-light-secondary">Child {i + 1} age:</label>
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
                      className="w-16 bg-white border border-[rgba(37,99,235,0.08)] rounded-[10px] py-2 px-3 text-center text-gray-dark focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
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
