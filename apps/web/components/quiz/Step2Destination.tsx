"use client";

import { useState } from "react";
import { useQuizStore } from "@/lib/stores/quizStore";
import StepWrapper from "./StepWrapper";

export default function Step2Destination() {
  const store = useQuizStore();
  const [input, setInput] = useState("");

  const isDestinationMode = store.planningMode === "destination";

  const addDestination = () => {
    const trimmed = input.trim();
    if (trimmed && !store.destinations.includes(trimmed)) {
      store.setDestinations([...store.destinations, trimmed]);
      setInput("");
    }
  };

  const removeDestination = (dest: string) => {
    store.setDestinations(store.destinations.filter((d) => d !== dest));
  };

  if (isDestinationMode) {
    return (
      <StepWrapper
        title="Where are you headed?"
        subtitle="Add one or more destinations. Or let us surprise you."
      >
        <div className="space-y-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addDestination()}
              placeholder="Type a city or country..."
              className="flex-1 px-4 py-3 rounded-xl border border-border bg-surface text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
            <button
              onClick={addDestination}
              className="px-5 py-3 rounded-xl bg-primary text-white font-semibold hover:bg-primary-dark transition-colors"
            >
              Add
            </button>
          </div>

          {store.destinations.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {store.destinations.map((d) => (
                <span
                  key={d}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary-50 text-primary-700 text-sm font-medium"
                >
                  {d}
                  <button
                    onClick={() => removeDestination(d)}
                    className="hover:text-primary-dark"
                  >
                    x
                  </button>
                </span>
              ))}
            </div>
          )}

          <button
            onClick={() => {
              store.setSurpriseMe(true);
              store.nextStep();
            }}
            className="w-full py-3 rounded-xl border-2 border-dashed border-accent text-accent-dark font-semibold hover:bg-accent-50 transition-colors"
          >
            Surprise me!
          </button>
        </div>
      </StepWrapper>
    );
  }

  // Timeline mode — pick dates first
  return (
    <StepWrapper
      title="When can you travel?"
      subtitle="We'll find the best destinations for your dates."
    >
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">
              Start date
            </label>
            <input
              type="date"
              value={store.startDate || ""}
              onChange={(e) => store.setStartDate(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-border bg-surface text-text focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">
              End date
            </label>
            <input
              type="date"
              value={store.endDate || ""}
              onChange={(e) => store.setEndDate(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-border bg-surface text-text focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={store.flexibleDates}
            onChange={(e) => store.setFlexibleDates(e.target.checked)}
            className="w-5 h-5 rounded border-border text-primary focus:ring-primary"
          />
          <span className="text-text-secondary">My dates are flexible (show me cheaper options nearby)</span>
        </label>

        {store.flexibleDates && (
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">
              Roughly how many days?
            </label>
            <select
              value={store.tripDurationDays || ""}
              onChange={(e) => store.setTripDurationDays(Number(e.target.value) || null)}
              className="w-full px-4 py-3 rounded-xl border border-border bg-surface text-text focus:outline-none focus:ring-2 focus:ring-primary"
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
        )}
      </div>
    </StepWrapper>
  );
}
