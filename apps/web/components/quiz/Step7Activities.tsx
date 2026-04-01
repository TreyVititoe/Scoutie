"use client";

import { motion } from "framer-motion";
import { useQuizStore, ActivityInterest } from "@/lib/stores/quizStore";
import StepWrapper from "./StepWrapper";

const activities: { value: ActivityInterest; label: string }[] = [
  { value: "adventure", label: "Adventure & Outdoors" },
  { value: "culture", label: "Culture & History" },
  { value: "food", label: "Food & Culinary" },
  { value: "nightlife", label: "Nightlife" },
  { value: "nature", label: "Nature & Wildlife" },
  { value: "relaxation", label: "Beach & Relaxation" },
  { value: "shopping", label: "Shopping" },
  { value: "history", label: "History" },
  { value: "art", label: "Art & Museums" },
  { value: "sports", label: "Sports & Fitness" },
  { value: "live_events", label: "Live Events & Concerts" },
  { value: "family_fun", label: "Family Fun" },
  { value: "photography", label: "Photography" },
];

export default function Step7Activities() {
  const store = useQuizStore();

  return (
    <StepWrapper
      title="What are you into?"
      subtitle="Select all that sound fun — the more we know, the better."
    >
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {activities.map((a, i) => {
          const selected = store.activityInterests.includes(a.value);
          return (
            <motion.button
              key={a.value}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.03 }}
              onClick={() => store.toggleActivityInterest(a.value)}
              className={`p-4 rounded-xl border-2 text-left transition-all ${
                selected
                  ? "border-primary bg-primary-50"
                  : "border-border bg-surface hover:border-primary-light"
              }`}
            >
              <span className="text-sm font-medium text-text">{a.label}</span>
            </motion.button>
          );
        })}
      </div>
      {store.activityInterests.length > 0 && (
        <p className="text-sm text-text-muted mt-4">
          {store.activityInterests.length} selected
        </p>
      )}
    </StepWrapper>
  );
}
