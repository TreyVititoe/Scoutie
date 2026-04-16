"use client";

import { useQuizStore, AccommodationType } from "@/lib/stores/quizStore";
import StepWrapper from "./StepWrapper";
import DestinationAutocomplete from "./DestinationAutocomplete";

const accommodationOptions: { value: AccommodationType; label: string; icon: string }[] = [
  { value: "hotel", label: "Hotel", icon: "hotel" },
  { value: "vacation_rental", label: "Rental", icon: "cottage" },
  { value: "hostel", label: "Hostel", icon: "bunk_bed" },
  { value: "resort", label: "Resort", icon: "spa" },
  { value: "boutique", label: "Boutique", icon: "store" },
];

export default function Step1WhereWhen() {
  const store = useQuizStore();

  const toggleAccommodationType = (type: AccommodationType) => {
    if (store.noAccommodation) store.setNoAccommodation(false);
    if (store.accommodationTypes.includes(type)) {
      store.setAccommodationTypes(store.accommodationTypes.filter((t) => t !== type));
    } else {
      store.setAccommodationTypes([...store.accommodationTypes, type]);
    }
  };

  const toggleNoAccommodation = () => {
    if (store.noAccommodation) {
      store.setNoAccommodation(false);
    } else {
      store.setNoAccommodation(true);
      store.setAccommodationTypes([]);
    }
  };

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
            <div className="flex items-center justify-between bg-accent/5 border border-accent rounded-[10px] py-4 px-5">
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
            className="w-full py-4 rounded-[10px] border-2 border-dashed border-accent/30 text-accent font-semibold hover:bg-accent/5 transition-all flex items-center justify-center gap-2"
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
                  className="w-full bg-white border border-[rgba(0,101,113,0.08)] rounded-[10px] py-3 pl-12 pr-4 text-gray-dark focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
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
                  className="w-full bg-white border border-[rgba(0,101,113,0.08)] rounded-[10px] py-3 pl-12 pr-4 text-gray-dark focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                />
              </div>
            </div>
          </div>

          <label className="flex items-center gap-3 cursor-pointer p-3 rounded-[10px] hover:bg-page-bg transition-colors">
            <input
              type="checkbox"
              checked={store.flexibleDates}
              onChange={(e) => store.setFlexibleDates(e.target.checked)}
              className="w-5 h-5 rounded border-[rgba(0,101,113,0.08)] text-accent focus:ring-accent/20"
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
                  className="w-full bg-white border border-[rgba(0,101,113,0.08)] rounded-[10px] py-3 pl-12 pr-4 text-gray-dark focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent appearance-none"
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

        {/* Where are you staying? */}
        <div className="space-y-3">
          <label className="block text-sm font-semibold text-gray-dark">
            Where are you staying?
          </label>
          <div className={`grid grid-cols-3 sm:grid-cols-5 gap-2 transition-opacity ${store.noAccommodation ? "opacity-30 pointer-events-none" : ""}`}>
            {accommodationOptions.map((opt) => {
              const isSelected = store.accommodationTypes.includes(opt.value);
              return (
                <button
                  key={opt.value}
                  onClick={() => toggleAccommodationType(opt.value)}
                  className={`flex flex-col items-center gap-1 p-3 rounded-[12px] border transition-colors ${
                    isSelected
                      ? "border-accent bg-accent/5"
                      : "border-[rgba(0,101,113,0.08)] bg-white hover:border-accent/30"
                  }`}
                >
                  <span className={`material-symbols-outlined text-[22px] ${isSelected ? "text-accent" : "text-on-light-tertiary"}`}>
                    {opt.icon}
                  </span>
                  <span className={`text-xs font-semibold ${isSelected ? "text-accent" : "text-gray-dark"}`}>
                    {opt.label}
                  </span>
                </button>
              );
            })}
          </div>
          <button
            onClick={toggleNoAccommodation}
            className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-[10px] border text-sm transition-colors ${
              store.noAccommodation
                ? "border-accent bg-accent text-white"
                : "border-[rgba(0,101,113,0.08)] bg-white text-on-light-secondary hover:border-accent/30"
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">group</span>
            Don&apos;t need a place (staying with friends/family)
          </button>
        </div>
      </div>
    </StepWrapper>
  );
}
