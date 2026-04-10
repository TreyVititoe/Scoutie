"use client";

import { useQuizStore } from "@/lib/stores/quizStore";
import StepWrapper from "./StepWrapper";
import DestinationAutocomplete from "./DestinationAutocomplete";

export default function Step1WhereWhen() {
  const store = useQuizStore();

  const handleSurpriseMe = () => {
    store.setDestinations([]);
    store.setSurpriseMe(true);
  };

  const handleDestinationFocus = () => {
    // If user starts typing a destination, turn off surprise me
    if (store.surpriseMe) {
      store.setSurpriseMe(false);
    }
  };

  return (
    <StepWrapper
      title="Tell us about your trip"
      subtitle="Fill in what you know — leave the rest to Walter."
    >
      <div className="space-y-6">
        {/* Destination */}
        <div>
          <label className="block text-sm font-semibold text-gray-dark mb-1.5">
            Where to?
          </label>
          {store.surpriseMe ? (
            <div className="flex items-center justify-between bg-accent/5 border border-accent rounded-[8px] py-4 px-5">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-accent text-[22px]">explore</span>
                <span className="font-semibold text-accent text-sm">
                  Walter will pick the perfect destination
                </span>
              </div>
              <button
                onClick={() => store.setSurpriseMe(false)}
                className="text-on-light-tertiary hover:text-gray-dark transition-colors"
                aria-label="Clear surprise me"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>
          ) : (
            <div onFocus={handleDestinationFocus}>
              <DestinationAutocomplete />
            </div>
          )}
        </div>

        {/* Surprise me button */}
        {!store.surpriseMe && (
          <button
            onClick={handleSurpriseMe}
            className="w-full py-4 rounded-[8px] border-2 border-dashed border-accent/30 text-accent font-semibold hover:bg-accent/5 transition-all flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-[20px]">explore</span>
            Surprise me
          </button>
        )}

        {/* Dates */}
        <div className="space-y-4">
          <label className="block text-sm font-semibold text-gray-dark">
            When?
          </label>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-dark mb-1.5">
                Start date
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-light-tertiary text-[20px]">
                  calendar_today
                </span>
                <input
                  type="date"
                  value={store.startDate || ""}
                  onChange={(e) => store.setStartDate(e.target.value)}
                  className="w-full bg-white border border-black/10 rounded-[8px] py-3 pl-12 pr-4 text-gray-dark focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-dark mb-1.5">
                End date
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-light-tertiary text-[20px]">
                  event
                </span>
                <input
                  type="date"
                  value={store.endDate || ""}
                  onChange={(e) => store.setEndDate(e.target.value)}
                  className="w-full bg-white border border-black/10 rounded-[8px] py-3 pl-12 pr-4 text-gray-dark focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                />
              </div>
            </div>
          </div>

          <label className="flex items-center gap-3 cursor-pointer p-3 rounded-[8px] hover:bg-gray-light transition-colors">
            <input
              type="checkbox"
              checked={store.flexibleDates}
              onChange={(e) => store.setFlexibleDates(e.target.checked)}
              className="w-5 h-5 rounded border-black/10 text-accent focus:ring-accent/20"
            />
            <span className="text-on-light-secondary text-sm">
              My dates are flexible
            </span>
          </label>

          {store.flexibleDates && (
            <div>
              <label className="block text-sm font-semibold text-gray-dark mb-1.5">
                Roughly how many days?
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-light-tertiary text-[20px]">
                  date_range
                </span>
                <select
                  value={store.tripDurationDays || ""}
                  onChange={(e) => store.setTripDurationDays(Number(e.target.value) || null)}
                  className="w-full bg-white border border-black/10 rounded-[8px] py-3 pl-12 pr-4 text-gray-dark focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent appearance-none"
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
      </div>
    </StepWrapper>
  );
}
