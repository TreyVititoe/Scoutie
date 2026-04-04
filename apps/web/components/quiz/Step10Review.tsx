"use client";

import { useQuizStore } from "@/lib/stores/quizStore";
import StepWrapper from "./StepWrapper";

export default function Step10Review() {
  const store = useQuizStore();

  const Section = ({ icon, label, value }: { icon: string; label: string; value: string }) => (
    <div className="flex items-start gap-3 py-3 border-b border-outline-variant/15 last:border-0">
      <span className="material-symbols-outlined text-primary text-[20px] mt-0.5 shrink-0">{icon}</span>
      <div className="flex-1 flex justify-between items-start">
        <span className="text-sm text-on-surface-variant font-body">{label}</span>
        <span className="text-sm font-semibold text-on-surface font-body text-right max-w-[55%]">{value}</span>
      </div>
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
      <div className="space-y-4">
        {/* Trip Basics */}
        <div className="bg-surface-container-low rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <span className="material-symbols-outlined text-primary text-[20px]">flight_takeoff</span>
            <p className="text-xs font-bold font-body text-primary uppercase tracking-wider">Trip basics</p>
          </div>
          {store.destinations.length > 0 && (
            <Section icon="location_on" label="Destination" value={store.destinations.join(", ")} />
          )}
          {store.surpriseMe && <Section icon="explore" label="Destination" value="Surprise me!" />}
          {store.startDate && store.endDate && (
            <Section icon="calendar_today" label="Dates" value={`${store.startDate} to ${store.endDate} (${nights} nights)`} />
          )}
          {store.flexibleDates && <Section icon="event_available" label="Dates" value="Flexible" />}
          <Section
            icon="group"
            label="Travelers"
            value={`${store.travelersCount} ${store.travelerType || ""}`}
          />
          {store.childrenCount > 0 && (
            <Section
              icon="child_care"
              label="Children"
              value={`${store.childrenCount} (ages: ${store.childrenAges.join(", ")})`}
            />
          )}
        </div>

        {/* Budget & Flights */}
        <div className="bg-surface-container-low rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <span className="material-symbols-outlined text-primary text-[20px]">payments</span>
            <p className="text-xs font-bold font-body text-primary uppercase tracking-wider">Budget & flights</p>
          </div>
          {store.budgetAmount && (
            <Section
              icon="savings"
              label="Budget"
              value={`$${store.budgetAmount.toLocaleString()} ${store.budgetMode === "per_day" ? "/ day" : "total"}`}
            />
          )}
          {store.departureCity && <Section icon="flight_takeoff" label="Departing from" value={store.departureCity} />}
          <Section icon="airline_seat_recline_extra" label="Flight class" value={store.flightClass.replace("_", " ")} />
          <Section icon="thumb_up" label="Priority" value={store.flightPriority.replace("_", " ")} />
        </div>

        {/* Preferences */}
        <div className="bg-surface-container-low rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <span className="material-symbols-outlined text-primary text-[20px]">tune</span>
            <p className="text-xs font-bold font-body text-primary uppercase tracking-wider">Preferences</p>
          </div>
          {store.accommodationTypes.length > 0 && (
            <Section icon="hotel" label="Stay type" value={store.accommodationTypes.join(", ").replace(/_/g, " ")} />
          )}
          {store.activityInterests.length > 0 && (
            <Section icon="interests" label="Interests" value={store.activityInterests.join(", ").replace(/_/g, " ")} />
          )}
          {store.pace && <Section icon="speed" label="Pace" value={store.pace} />}
          {store.diningPreference && (
            <Section icon="restaurant" label="Dining" value={store.diningPreference.replace("_", " ")} />
          )}
          {store.dietaryRestrictions.length > 0 && (
            <Section icon="eco" label="Dietary" value={store.dietaryRestrictions.join(", ")} />
          )}
        </div>
      </div>
    </StepWrapper>
  );
}
