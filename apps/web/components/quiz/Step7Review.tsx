"use client";

import { useQuizStore } from "@/lib/stores/quizStore";
import StepWrapper from "./StepWrapper";

export default function Step7Review() {
  const store = useQuizStore();

  const nights =
    store.startDate && store.endDate
      ? Math.round(
          (new Date(store.endDate).getTime() - new Date(store.startDate).getTime()) /
            (1000 * 60 * 60 * 24)
        )
      : store.tripDurationDays || 0;

  // Build the summary paragraph
  const parts: string[] = [];

  // Who
  const travelerDesc =
    store.travelersCount === 1
      ? "a solo traveler"
      : store.travelerType === "couple"
        ? "a couple"
        : `${store.travelersCount} ${store.travelerType || "travelers"}`;
  parts.push(`You're ${travelerDesc}`);

  // Children
  if (store.childrenCount > 0) {
    parts[parts.length - 1] += ` with ${store.childrenCount} kid${store.childrenCount !== 1 ? "s" : ""}`;
  }

  // Where
  if (store.destinations.length > 0) {
    parts.push(`heading to ${store.destinations.join(" and ")}`);
  } else if (store.surpriseMe) {
    parts.push("looking for Walter to surprise you with the perfect destination");
  } else {
    parts.push("open to wherever Walter suggests");
  }

  // When
  if (store.startDate && store.endDate) {
    const start = new Date(store.startDate).toLocaleDateString("en-US", { month: "short", day: "numeric" });
    const end = new Date(store.endDate).toLocaleDateString("en-US", { month: "short", day: "numeric" });
    parts.push(`from ${start} to ${end} (${nights} nights)`);
  } else if (nights > 0) {
    parts.push(`for about ${nights} nights`);
  } else {
    parts.push("with flexible dates");
  }

  // Departure
  if (store.departureCities.length > 0) {
    parts.push(`flying from ${store.departureCities.join(" or ")}`);
  } else if (store.departureCity) {
    parts.push(`flying from ${store.departureCity}`);
  }

  // Budget
  if (store.budgetAmount) {
    parts.push(`with a budget of $${store.budgetAmount.toLocaleString()}`);
  } else if (store.budgetSkipped) {
    parts.push("with a flexible budget");
  }

  // Interests
  if (store.activityInterests.length > 0) {
    const interests = store.activityInterests
      .map((i) => i.replace(/_/g, " "))
      .slice(0, 4);
    const remaining = store.activityInterests.length - interests.length;
    let interestStr = interests.join(", ");
    if (remaining > 0) interestStr += `, and ${remaining} more`;
    parts.push(`You're into ${interestStr}`);
  }

  // Join into a paragraph
  const summary = parts.join(", ") + ".";
  // Capitalize first letter
  const finalSummary = summary.charAt(0).toUpperCase() + summary.slice(1);

  return (
    <StepWrapper
      title="Here's what we got"
      subtitle="Sound right? Hit generate and Walter will plan your trip."
    >
      <div className="card-base p-6">
        <p className="text-[17px] text-gray-dark leading-relaxed">
          {finalSummary}
        </p>
      </div>

      {/* Quick edit hints */}
      <p className="text-xs text-on-light-tertiary text-center mt-4">
        Need to change something? Use the Back button to edit any step.
      </p>
    </StepWrapper>
  );
}
