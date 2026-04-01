"use client";

import { useQuizStore, AccommodationType } from "@/lib/stores/quizStore";
import StepWrapper from "./StepWrapper";

const types: { value: AccommodationType; label: string }[] = [
  { value: "hotel", label: "Hotel" },
  { value: "vacation_rental", label: "Vacation rental" },
  { value: "hostel", label: "Hostel" },
  { value: "resort", label: "Resort" },
  { value: "boutique", label: "Boutique" },
];

const mustHaveOptions = [
  "Pool",
  "Kitchen",
  "WiFi",
  "Parking",
  "Pet-friendly",
  "Gym",
  "Breakfast included",
  "Washer/Dryer",
  "Air conditioning",
  "Ocean view",
];

const locationOptions = [
  "City center",
  "Near attractions",
  "Quiet neighborhood",
  "Beachfront",
  "Near public transit",
  "Near airport",
];

export default function Step6Accommodation() {
  const store = useQuizStore();

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
      subtitle="Pick one or more — we'll search them all."
    >
      <div className="space-y-6">
        {/* Type */}
        <div className="flex flex-wrap gap-3">
          {types.map((t) => (
            <button
              key={t.value}
              onClick={() => toggleType(t.value)}
              className={`px-5 py-3 rounded-xl border-2 font-medium transition-all ${
                store.accommodationTypes.includes(t.value)
                  ? "border-primary bg-primary-50 text-primary-700"
                  : "border-border bg-surface text-text hover:border-primary-light"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Must-haves */}
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-2">
            Must-haves
          </label>
          <div className="flex flex-wrap gap-2">
            {mustHaveOptions.map((item) => (
              <button
                key={item}
                onClick={() => toggleMustHave(item)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                  store.accommodationMustHaves.includes(item)
                    ? "bg-primary text-white"
                    : "bg-surface border border-border text-text-secondary hover:border-primary-light"
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        {/* Location preference */}
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-2">
            Location preference
          </label>
          <div className="flex flex-wrap gap-2">
            {locationOptions.map((loc) => (
              <button
                key={loc}
                onClick={() => store.setLocationPreference(loc)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                  store.locationPreference === loc
                    ? "bg-primary text-white"
                    : "bg-surface border border-border text-text-secondary hover:border-primary-light"
                }`}
              >
                {loc}
              </button>
            ))}
          </div>
        </div>
      </div>
    </StepWrapper>
  );
}
