"use client";

import { motion } from "framer-motion";
import { useQuizStore, PlanningMode } from "@/lib/stores/quizStore";
import StepWrapper from "./StepWrapper";

const options: { mode: PlanningMode; icon: string; title: string; desc: string }[] = [
  {
    mode: "destination",
    icon: "📍",
    title: "I know where I want to go",
    desc: "Pick your destination, and we'll build the perfect trip around it.",
  },
  {
    mode: "timeline",
    icon: "📅",
    title: "I know when I can travel",
    desc: "Tell us your dates, and we'll suggest the best destinations.",
  },
];

export default function Step1PlanningMode() {
  const { planningMode, setPlanningMode, nextStep } = useQuizStore();

  const handleSelect = (mode: PlanningMode) => {
    setPlanningMode(mode);
    setTimeout(() => nextStep(), 300);
  };

  return (
    <StepWrapper
      title="How do you want to plan?"
      subtitle="We'll tailor the whole experience to you."
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {options.map((opt, i) => (
          <motion.button
            key={opt.mode}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            onClick={() => handleSelect(opt.mode)}
            className={`p-6 rounded-2xl border-2 text-left transition-all cursor-pointer ${
              planningMode === opt.mode
                ? "border-primary bg-primary-50"
                : "border-border bg-surface hover:border-primary-light hover:shadow-md"
            }`}
          >
            <span className="text-3xl mb-3 block">{opt.icon}</span>
            <p className="font-display font-bold text-lg text-text mb-1">{opt.title}</p>
            <p className="text-sm text-text-secondary">{opt.desc}</p>
          </motion.button>
        ))}
      </div>
    </StepWrapper>
  );
}
