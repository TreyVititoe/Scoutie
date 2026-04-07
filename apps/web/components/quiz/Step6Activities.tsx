"use client";

import { motion } from "framer-motion";
import { useQuizStore, ActivityInterest } from "@/lib/stores/quizStore";
import StepWrapper from "./StepWrapper";

const topTier: { value: ActivityInterest; label: string; icon: string; bg: string }[] = [
  { value: "adventure", label: "Adventure & Outdoors", icon: "hiking", bg: "bg-primary-container" },
  { value: "food", label: "Food & Culinary", icon: "restaurant", bg: "bg-secondary-container" },
  { value: "culture", label: "Culture & History", icon: "account_balance", bg: "bg-tertiary-container" },
  { value: "nightlife", label: "Nightlife & Entertainment", icon: "nightlife", bg: "bg-primary-container" },
  { value: "nature", label: "Nature & Wildlife", icon: "forest", bg: "bg-secondary-container" },
  { value: "relaxation", label: "Beach & Relaxation", icon: "beach_access", bg: "bg-tertiary-container" },
];

const bottomTier: { value: ActivityInterest; label: string; icon: string }[] = [
  { value: "shopping", label: "Shopping", icon: "shopping_bag" },
  { value: "art", label: "Art & Museums", icon: "palette" },
  { value: "sports", label: "Sports & Fitness", icon: "fitness_center" },
  { value: "live_events", label: "Live Events & Concerts", icon: "stadium" },
  { value: "family_fun", label: "Family Fun", icon: "family_restroom" },
  { value: "photography", label: "Photography", icon: "photo_camera" },
];

export default function Step6Activities() {
  const store = useQuizStore();

  return (
    <StepWrapper
      title="What are you into?"
      subtitle="Select all that sound fun -- the more we know, the better."
    >
      <div className="space-y-6">
        {/* Top tier: larger cards with colored icon backgrounds */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {topTier.map((a, i) => {
            const selected = store.activityInterests.includes(a.value);
            return (
              <motion.button
                key={a.value}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.04 }}
                onClick={() => store.toggleActivityInterest(a.value)}
                className={`inner-card-3d flex flex-col items-center gap-3 p-6 rounded-2xl border-2 transition-all duration-300 cursor-pointer ${
                  selected
                    ? "border-primary bg-primary text-white shadow-lg shadow-primary/20"
                    : "border-transparent bg-surface-container-low hover:-translate-y-1"
                }`}
              >
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    selected ? "bg-white/20" : a.bg
                  }`}
                >
                  <span
                    className={`material-symbols-outlined text-[28px] ${
                      selected ? "text-white" : "text-on-surface-variant"
                    }`}
                  >
                    {a.icon}
                  </span>
                </div>
                <span
                  className={`text-sm font-body font-semibold text-center leading-tight ${
                    selected ? "text-white" : "text-on-surface"
                  }`}
                >
                  {a.label}
                </span>
                {selected && (
                  <span className="material-symbols-outlined text-white/80 text-[16px]">check_circle</span>
                )}
              </motion.button>
            );
          })}
        </div>

        {/* Bottom tier: smaller pills */}
        <div>
          <label className="block text-sm font-semibold font-body text-on-surface-variant mb-2">
            More interests
          </label>
          <div className="flex flex-wrap gap-2">
            {bottomTier.map((a, i) => {
              const selected = store.activityInterests.includes(a.value);
              return (
                <motion.button
                  key={a.value}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + i * 0.03 }}
                  onClick={() => store.toggleActivityInterest(a.value)}
                  className={`flex items-center gap-1.5 px-4 py-2.5 rounded-full text-sm font-body font-medium transition-all ${
                    selected
                      ? "bg-primary text-white shadow-md shadow-primary/20"
                      : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high"
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px]">{a.icon}</span>
                  {a.label}
                  {selected && (
                    <span className="material-symbols-outlined text-[14px] ml-0.5">check</span>
                  )}
                </motion.button>
              );
            })}
          </div>
        </div>

        {store.activityInterests.length > 0 && (
          <p className="text-sm text-on-surface-variant font-body flex items-center gap-1.5">
            <span className="material-symbols-outlined text-primary text-[18px]">check_circle</span>
            {store.activityInterests.length} selected
          </p>
        )}
      </div>
    </StepWrapper>
  );
}
