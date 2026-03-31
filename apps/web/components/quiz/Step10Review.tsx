"use client";

import { useQuizStore } from "@/lib/stores/quizStore";
import StepWrapper from "./StepWrapper";

export default function Step10Review() {
  const store = useQuizStore();

  const Section = ({ label, value }: { label: string; value: string }) => (
    <div className="flex justify-between items-start py-3 border-b border-border last:border-0">
      <span className="text-sm text-text-secondary">{label}</span>
      <span className="text-sm font-medium text-text text-right max-w-[60%]">{value}</span>
    </div>
  );

  const nights =
    store.startDate && store.endDate
      ? Math.round(
          (new Date(store.endDate).getTime() - new Date(store.startDate).getTime()) /
            (1000 * 60 * 60 * 24)
        )
      : store.tripDurationDays || 0;

  return (
    <StepWrapper
      title="Review your trip"
      subtitle="Make sure everything looks good before we start planning."
    >
      <div className="bg-surface rounded-2xl border border-border divide-y divide-border">
        <div className="p-4">
          <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">Trip basics</p>
          {store.destinations.length > 0 && (
            <Section label="Destination" value={store.destinations.join(", ")} />
          )}
          {store.surpriseMe && <Section label="Destination" value="Surprise me!" />}
          {store.startDate && store.endDate && (
            <Section label="Dates" value={`${store.startDate} → ${store.endDate} (${nights} nights)`} />
          )}
          {store.flexibleDates && <Section label="Dates" value="Flexible" />}
          <Section
            label="Travelers"
            value={`${store.travelersCount} ${store.travelerType || ""}`}
          />
          {store.childrenCount > 0 && (
            <Section
              label="Children"
              value={`${store.childrenCount} (ages: ${store.childrenAges.join(", ")})`}
            />
          )}
        </div>

        <div className="p-4">
          <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">Budget & flights</p>
          {store.budgetAmount && (
            <Section
              label="Budget"
              value={`$${store.budgetAmount.toLocaleString()} ${store.budgetMode === "per_day" ? "/ day" : "total"}`}
            />
          )}
          {store.departureCity && <Section label="Departing from" value={store.departureCity} />}
          <Section label="Flight class" value={store.flightClass.replace("_", " ")} />
          <Section label="Priority" value={store.flightPriority.replace("_", " ")} />
        </div>

        <div className="p-4">
          <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">Preferences</p>
          {store.accommodationTypes.length > 0 && (
            <Section label="Stay type" value={store.accommodationTypes.join(", ").replace(/_/g, " ")} />
          )}
          {store.activityInterests.length > 0 && (
            <Section label="Interests" value={store.activityInterests.join(", ").replace(/_/g, " ")} />
          )}
          {store.pace && <Section label="Pace" value={store.pace} />}
          {store.diningPreference && (
            <Section label="Dining" value={store.diningPreference.replace("_", " ")} />
          )}
          {store.dietaryRestrictions.length > 0 && (
            <Section label="Dietary" value={store.dietaryRestrictions.join(", ")} />
          )}
        </div>
      </div>
    </StepWrapper>
  );
}
