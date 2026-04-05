"use client";

import { useQuizStore } from "@/lib/stores/quizStore";
import StepWrapper from "./StepWrapper";
import DestinationAutocomplete from "./DestinationAutocomplete";

function DatesSection() {
  const store = useQuizStore();

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold font-body text-on-surface-variant mb-1.5">
            Start date
          </label>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">
              calendar_today
            </span>
            <input
              type="date"
              value={store.startDate || ""}
              onChange={(e) => store.setStartDate(e.target.value)}
              className="w-full bg-surface-container-low border-none rounded-xl py-4 pl-12 pr-4 text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 font-body"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-semibold font-body text-on-surface-variant mb-1.5">
            End date
          </label>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">
              event
            </span>
            <input
              type="date"
              value={store.endDate || ""}
              onChange={(e) => store.setEndDate(e.target.value)}
              className="w-full bg-surface-container-low border-none rounded-xl py-4 pl-12 pr-4 text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 font-body"
            />
          </div>
        </div>
      </div>

      <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl hover:bg-surface-container-low transition-colors">
        <input
          type="checkbox"
          checked={store.flexibleDates}
          onChange={(e) => store.setFlexibleDates(e.target.checked)}
          className="w-5 h-5 rounded border-outline-variant text-primary focus:ring-primary/20"
        />
        <span className="text-on-surface-variant font-body text-sm">My dates are flexible (show me cheaper options nearby)</span>
      </label>

      {store.flexibleDates && (
        <div>
          <label className="block text-sm font-semibold font-body text-on-surface-variant mb-1.5">
            Roughly how many days?
          </label>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">
              date_range
            </span>
            <select
              value={store.tripDurationDays || ""}
              onChange={(e) => store.setTripDurationDays(Number(e.target.value) || null)}
              className="w-full bg-surface-container-low border-none rounded-xl py-4 pl-12 pr-4 text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 font-body appearance-none"
            >
              <option value="">Select...</option>
              <option value="3">Long weekend (3 days)</option>
              <option value="5">About 5 days</option>
              <option value="7">About a week</option>
              <option value="10">10 days</option>
              <option value="14">2 weeks</option>
              <option value="21">3 weeks</option>
            </select>
          </div>
        </div>
      )}
    </div>
  );
}

function DestinationSection() {
  const store = useQuizStore();

  return (
    <div className="space-y-4">
      <DestinationAutocomplete />

      <button
        onClick={() => {
          store.setSurpriseMe(true);
          store.nextStep();
        }}
        className="w-full py-4 rounded-xl border-2 border-dashed border-primary/30 text-primary font-bold font-body hover:bg-primary/5 transition-all flex items-center justify-center gap-2"
      >
        <span className="material-symbols-outlined text-[20px]">explore</span>
        Surprise me!
      </button>
    </div>
  );
}

export default function Step2Destination() {
  const store = useQuizStore();

  const isDestinationMode = store.planningMode === "destination";

  if (isDestinationMode) {
    return (
      <StepWrapper
        title="Where are you headed?"
        subtitle="Add one or more destinations, then pick your dates."
      >
        <div className="space-y-6">
          <DestinationSection />
          <DatesSection />
        </div>
      </StepWrapper>
    );
  }

  // Timeline mode -- pick dates first, then destination
  return (
    <StepWrapper
      title="When can you travel?"
      subtitle="Pick your dates, then choose a destination."
    >
      <div className="space-y-6">
        <DatesSection />
        <DestinationSection />
      </div>
    </StepWrapper>
  );
}
