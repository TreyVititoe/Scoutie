"use client";

import { motion } from "framer-motion";
import { useQuizStore, ActivityInterest } from "@/lib/stores/quizStore";
import StepWrapper from "./StepWrapper";

const topTier: { value: ActivityInterest; label: string; icon: string }[] = [
  { value: "adventure", label: "Adventure & Outdoors", icon: "hiking" },
  { value: "food", label: "Food & Culinary", icon: "restaurant" },
  { value: "culture", label: "Culture & History", icon: "account_balance" },
  { value: "nightlife", label: "Nightlife & Entertainment", icon: "nightlife" },
  { value: "nature", label: "Nature & Wildlife", icon: "forest" },
  { value: "relaxation", label: "Beach & Relaxation", icon: "beach_access" },
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
        {/* Top tier: larger cards */}
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
                className={`flex flex-col items-center gap-3 p-4 rounded-[14px] border transition-colors cursor-pointer ${
                  selected
                    ? "border-accent bg-accent text-white"
                    : "border-[rgba(0,101,113,0.08)] bg-white hover:border-accent/30"
                }`}
              >
                <div
                  className={`w-12 h-12 rounded-[10px] flex items-center justify-center ${
                    selected ? "bg-white/20" : "icon-gradient"
                  }`}
                >
                  <span
                    className={`material-symbols-outlined text-[28px] ${
                      selected ? "text-white" : "text-on-light-tertiary"
                    }`}
                  >
                    {a.icon}
                  </span>
                </div>
                <span
                  className={`text-sm font-semibold text-center leading-tight ${
                    selected ? "text-white" : "text-gray-dark"
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
          <label className="block text-sm font-semibold text-gray-dark mb-2">
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
                  className={`flex items-center gap-1.5 px-4 py-2.5 rounded-pill text-sm font-medium transition-all ${
                    selected
                      ? "bg-accent text-white shadow-md"
                      : "bg-page-bg border border-[rgba(0,101,113,0.08)] text-on-light-secondary hover:bg-[#e6f7f9]"
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
          <p className="text-sm text-on-light-secondary flex items-center gap-1.5">
            <span className="material-symbols-outlined text-accent text-[18px]">check_circle</span>
            {store.activityInterests.length} selected
          </p>
        )}
      </div>
    </StepWrapper>
  );
}
