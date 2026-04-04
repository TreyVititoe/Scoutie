"use client";

import { motion } from "framer-motion";
import { useQuizStore, ActivityInterest } from "@/lib/stores/quizStore";
import StepWrapper from "./StepWrapper";

const activities: { value: ActivityInterest; label: string; icon: string }[] = [
  { value: "adventure", label: "Adventure & Outdoors", icon: "hiking" },
  { value: "culture", label: "Culture & History", icon: "account_balance" },
  { value: "food", label: "Food & Culinary", icon: "restaurant" },
  { value: "nightlife", label: "Nightlife", icon: "nightlife" },
  { value: "nature", label: "Nature & Wildlife", icon: "park" },
  { value: "relaxation", label: "Beach & Relaxation", icon: "beach_access" },
  { value: "shopping", label: "Shopping", icon: "shopping_bag" },
  { value: "history", label: "History", icon: "castle" },
  { value: "art", label: "Art & Museums", icon: "palette" },
  { value: "sports", label: "Sports & Fitness", icon: "sports_soccer" },
  { value: "live_events", label: "Live Events & Concerts", icon: "stadium" },
  { value: "family_fun", label: "Family Fun", icon: "attractions" },
  { value: "photography", label: "Photography", icon: "photo_camera" },
];

export default function Step7Activities() {
  const store = useQuizStore();

  return (
    <StepWrapper
      title="What are you into?"
      subtitle="Select all that sound fun -- the more we know, the better."
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
              className={`inner-card-3d flex flex-col items-center gap-2 p-5 rounded-2xl border-2 transition-all duration-300 cursor-pointer ${
                selected
                  ? "border-primary bg-primary text-white shadow-lg shadow-primary/20"
                  : "border-transparent bg-surface-container-low hover:-translate-y-1"
              }`}
            >
              <span className={`material-symbols-outlined text-[28px] ${selected ? "text-white" : "text-on-surface-variant"}`}>
                {a.icon}
              </span>
              <span className={`text-xs font-body font-semibold text-center leading-tight ${selected ? "text-white" : "text-on-surface"}`}>
                {a.label}
              </span>
              {selected && (
                <span className="material-symbols-outlined text-white/80 text-[16px]">check_circle</span>
              )}
            </motion.button>
          );
        })}
      </div>
      {store.activityInterests.length > 0 && (
        <p className="text-sm text-on-surface-variant font-body mt-4 flex items-center gap-1.5">
          <span className="material-symbols-outlined text-primary text-[18px]">check_circle</span>
          {store.activityInterests.length} selected
        </p>
      )}
    </StepWrapper>
  );
}
