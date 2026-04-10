"use client";

import { useQuizStore, AccommodationType } from "@/lib/stores/quizStore";
import StepWrapper from "./StepWrapper";

const types: { value: AccommodationType; label: string; icon: string }[] = [
  { value: "hotel", label: "Hotel", icon: "hotel" },
  { value: "vacation_rental", label: "Vacation rental", icon: "cottage" },
  { value: "hostel", label: "Hostel", icon: "bunk_bed" },
  { value: "resort", label: "Resort", icon: "spa" },
  { value: "boutique", label: "Boutique", icon: "store" },
];

const mustHaveOptions: { label: string; icon: string }[] = [
  { label: "Pool", icon: "pool" },
  { label: "Kitchen", icon: "kitchen" },
  { label: "WiFi", icon: "wifi" },
  { label: "Parking", icon: "local_parking" },
  { label: "Pet-friendly", icon: "pets" },
  { label: "Gym", icon: "fitness_center" },
  { label: "Breakfast included", icon: "free_breakfast" },
  { label: "Washer/Dryer", icon: "local_laundry_service" },
  { label: "Air conditioning", icon: "ac_unit" },
  { label: "Ocean view", icon: "waves" },
];

const locationOptions: { label: string; icon: string }[] = [
  { label: "City center", icon: "location_city" },
  { label: "Near attractions", icon: "attractions" },
  { label: "Quiet neighborhood", icon: "night_shelter" },
  { label: "Beachfront", icon: "beach_access" },
  { label: "Near public transit", icon: "directions_transit" },
  { label: "Near airport", icon: "connecting_airports" },
];

export default function Step5Accommodation() {
  const store = useQuizStore();

  const toggleNoAccommodation = () => {
    if (store.noAccommodation) {
      store.setNoAccommodation(false);
    } else {
      store.setNoAccommodation(true);
      store.setAccommodationTypes([]);
      store.setAccommodationMustHaves([]);
      store.setLocationPreference("");
    }
  };

  const toggleType = (type: AccommodationType) => {
    if (store.accommodationTypes.includes(type)) {
      store.setAccommodationTypes(store.accommodationTypes.filter((t) => t !== type));
    } else {
      store.setAccommodationTypes([...store.accommodationTypes, type]);
    }
  };

  const toggleMustHave = (item: string) => {
    if (store.accommodationMustHaves.includes(item)) {
      store.setAccommodationMustHaves(store.accommodationMustHaves.filter((m) => m !== item));
    } else {
      store.setAccommodationMustHaves([...store.accommodationMustHaves, item]);
    }
  };

  return (
    <StepWrapper
      title="Where do you want to stay?"
      subtitle="Pick one or more -- we'll search them all."
    >
      <div className="space-y-6">
        {/* No accommodation toggle */}
        <button
          onClick={toggleNoAccommodation}
          className={`w-full flex items-center gap-3 p-4 rounded-[8px] border transition-colors ${
            store.noAccommodation
              ? "border-accent bg-accent text-white"
              : "border-black/10 bg-white hover:border-accent/30"
          }`}
        >
          <span className={`material-symbols-outlined text-[24px] ${store.noAccommodation ? "text-white" : "text-on-light-tertiary"}`}>
            group
          </span>
          <div className="text-left flex-1">
            <p className={`font-semibold text-sm ${store.noAccommodation ? "text-white" : "text-gray-dark"}`}>
              Don't need a place
            </p>
            <p className={`text-xs mt-0.5 ${store.noAccommodation ? "text-white/80" : "text-on-light-secondary"}`}>
              Staying with friends or family
            </p>
          </div>
          {store.noAccommodation && (
            <span className="material-symbols-outlined text-white text-[20px]">check_circle</span>
          )}
        </button>

        {store.noAccommodation && (
          <div className="flex items-center gap-2 px-4 py-3 rounded-[8px] bg-accent/5 border border-accent/10">
            <span className="material-symbols-outlined text-accent text-[18px]">info</span>
            <p className="text-sm text-on-light-secondary">
              We'll skip accommodation and focus on everything else.
            </p>
          </div>
        )}

        {/* Accommodation types */}
        <div className={`transition-all duration-300 ${store.noAccommodation ? "opacity-30 pointer-events-none" : ""}`}>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {types.map((t) => {
              const isSelected = store.accommodationTypes.includes(t.value);
              return (
                <button
                  key={t.value}
                  onClick={() => toggleType(t.value)}
                  className={`flex flex-col items-center gap-2 p-4 rounded-[8px] border transition-colors ${
                    isSelected
                      ? "border-accent bg-accent/5"
                      : "border-black/10 bg-white hover:border-accent/30"
                  }`}
                >
                  <span className={`material-symbols-outlined text-[28px] ${isSelected ? "text-accent" : "text-on-light-tertiary"}`}>
                    {t.icon}
                  </span>
                  <span className={`text-sm font-semibold ${isSelected ? "text-accent" : "text-gray-dark"}`}>
                    {t.label}
                  </span>
                  {isSelected && (
                    <span className="material-symbols-outlined text-accent text-[16px]">check_circle</span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Must-haves */}
          <div className="mt-6">
            <label className="block text-sm font-semibold text-gray-dark mb-2">
              Must-haves
            </label>
            <div className="flex flex-wrap gap-2">
              {mustHaveOptions.map((item) => {
                const isSelected = store.accommodationMustHaves.includes(item.label);
                return (
                  <button
                    key={item.label}
                    onClick={() => toggleMustHave(item.label)}
                    className={`flex items-center gap-1.5 px-4 py-2.5 rounded-pill text-sm font-medium transition-all ${
                      isSelected
                        ? "bg-accent text-white shadow-md"
                        : "bg-gray-light text-on-light-secondary hover:bg-black/5"
                    }`}
                  >
                    <span className="material-symbols-outlined text-[16px]">{item.icon}</span>
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Location preference */}
          <div className="mt-6">
            <label className="block text-sm font-semibold text-gray-dark mb-2">
              Location preference
            </label>
            <div className="flex flex-wrap gap-2">
              {locationOptions.map((loc) => {
                const isSelected = store.locationPreference === loc.label;
                return (
                  <button
                    key={loc.label}
                    onClick={() => store.setLocationPreference(loc.label)}
                    className={`flex items-center gap-1.5 px-4 py-2.5 rounded-pill text-sm font-medium transition-all ${
                      isSelected
                        ? "bg-accent text-white shadow-md"
                        : "bg-gray-light text-on-light-secondary hover:bg-black/5"
                    }`}
                  >
                    <span className="material-symbols-outlined text-[16px]">{loc.icon}</span>
                    {loc.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </StepWrapper>
  );
}
