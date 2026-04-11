"use client";

import { useQuizStore } from "@/lib/stores/quizStore";
import StepWrapper from "./StepWrapper";

export default function Step7Review() {
  const store = useQuizStore();

  const Section = ({ icon, label, value }: { icon: string; label: string; value: string }) => (
    <div className="flex items-start gap-3 py-3 border-b border-black/5 last:border-0">
      <span className="material-symbols-outlined text-accent text-[20px] mt-0.5 shrink-0">{icon}</span>
      <div className="flex-1 flex justify-between items-start">
        <span className="text-sm text-on-light-secondary">{label}</span>
        <span className="text-sm font-semibold text-gray-dark text-right max-w-[55%]">{value}</span>
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
        <div className="bg-page-bg rounded-[10px] p-5">
          <div className="flex items-center gap-2 mb-3">
            <span className="material-symbols-outlined text-accent text-[20px]">explore</span>
            <p className="text-xs font-semibold text-accent uppercase tracking-wider">Trip basics</p>
          </div>
          {store.destinations.length > 0 && (
            <Section icon="location_on" label="Destination" value={store.destinations.join(", ")} />
          )}
          {store.surpriseMe && <Section icon="explore" label="Destination" value="Surprise me!" />}
          {!store.surpriseMe && store.destinations.length === 0 && (
            <Section icon="explore" label="Destination" value="Surprise me" />
          )}
          {store.startDate && store.endDate ? (
            <Section icon="calendar_today" label="Dates" value={`${store.startDate} to ${store.endDate} (${nights} nights)`} />
          ) : store.flexibleDates ? (
            <Section icon="event_available" label="Dates" value="Flexible" />
          ) : (
            <Section icon="event_available" label="Dates" value="Flexible" />
          )}
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
          {store.budgetAmount ? (
            <Section
              icon="savings"
              label="Budget"
              value={`$${store.budgetAmount.toLocaleString()} ${store.budgetMode === "per_day" ? "/ day" : "total"}`}
            />
          ) : (
            <Section icon="savings" label="Budget" value="Decide later" />
          )}
        </div>

        {/* Flights */}
        <div className="bg-page-bg rounded-[10px] p-5">
          <div className="flex items-center gap-2 mb-3">
            <span className="material-symbols-outlined text-accent text-[20px]">flight</span>
            <p className="text-xs font-semibold text-accent uppercase tracking-wider">Flights</p>
          </div>
          {store.departureCity ? (
            <Section icon="flight_takeoff" label="Departing from" value={store.departureCity} />
          ) : (
            <Section icon="flight_takeoff" label="Departing from" value="Not set" />
          )}
          <Section icon="airline_seat_recline_extra" label="Class" value={store.flightClass.replace(/_/g, " ")} />
          <Section icon="thumb_up" label="Priority" value={store.flightPriority.replace(/_/g, " ")} />
          {store.carryOnOnly && <Section icon="luggage" label="Bags" value="Carry-on only" />}
        </div>

        {/* Accommodation */}
        <div className="bg-page-bg rounded-[10px] p-5">
          <div className="flex items-center gap-2 mb-3">
            <span className="material-symbols-outlined text-accent text-[20px]">hotel</span>
            <p className="text-xs font-semibold text-accent uppercase tracking-wider">Accommodation</p>
          </div>
          {store.noAccommodation ? (
            <Section icon="group" label="Stay" value="Not needed (staying with friends/family)" />
          ) : store.accommodationTypes.length > 0 ? (
            <Section icon="hotel" label="Stay type" value={store.accommodationTypes.join(", ").replace(/_/g, " ")} />
          ) : (
            <Section icon="hotel" label="Stay type" value="No preference" />
          )}
          {!store.noAccommodation && store.accommodationMustHaves.length > 0 && (
            <Section icon="check_circle" label="Must-haves" value={store.accommodationMustHaves.join(", ")} />
          )}
          {!store.noAccommodation && store.locationPreference && (
            <Section icon="location_on" label="Location" value={store.locationPreference} />
          )}
        </div>

        {/* Interests */}
        {store.activityInterests.length > 0 && (
          <div className="bg-page-bg rounded-[10px] p-5">
            <div className="flex items-center gap-2 mb-3">
              <span className="material-symbols-outlined text-accent text-[20px]">interests</span>
              <p className="text-xs font-semibold text-accent uppercase tracking-wider">Interests</p>
            </div>
            <Section
              icon="interests"
              label="Activities"
              value={store.activityInterests.join(", ").replace(/_/g, " ")}
            />
          </div>
        )}
      </div>
    </StepWrapper>
  );
}
