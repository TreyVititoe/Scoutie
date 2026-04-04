"use client";

import { motion } from "framer-motion";
import { useQuizStore, PlanningMode } from "@/lib/stores/quizStore";
import StepWrapper from "./StepWrapper";

const options: {
  mode: PlanningMode;
  title: string;
  desc: string;
  icon: string;
  image: string;
}[] = [
  {
    mode: "destination",
    title: "I know where I want to go",
    desc: "Pick your destination, and we'll build the perfect trip around it.",
    icon: "pin_drop",
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&h=400&fit=crop",
  },
  {
    mode: "timeline",
    title: "I know when I can travel",
    desc: "Tell us your dates, and we'll suggest the best destinations.",
    icon: "calendar_month",
    image: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=600&h=400&fit=crop",
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
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {options.map((opt, i) => {
          const isSelected = planningMode === opt.mode;
          return (
            <motion.button
              key={opt.mode}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.12 }}
              onClick={() => handleSelect(opt.mode)}
              className={`group relative overflow-hidden rounded-2xl text-left transition-all duration-300 cursor-pointer border-2 ${
                isSelected
                  ? "border-primary shadow-lg shadow-primary/20"
                  : "border-transparent hover:-translate-y-2"
              }`}
              style={{ transformStyle: "preserve-3d" }}
            >
              {/* Image */}
              <div className="relative h-40 overflow-hidden">
                <img
                  src={opt.image}
                  alt={opt.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <span className="material-symbols-outlined absolute bottom-3 left-3 text-white text-[32px]">
                  {opt.icon}
                </span>
              </div>

              {/* Content */}
              <div className="p-5 bg-surface-container-lowest">
                <p className="font-headline font-extrabold text-lg text-on-surface mb-1">
                  {opt.title}
                </p>
                <p className="text-sm text-on-surface-variant font-body leading-relaxed">
                  {opt.desc}
                </p>
              </div>

              {/* Selected indicator */}
              {isSelected && (
                <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                  <span className="material-symbols-outlined text-white text-[18px]">check</span>
                </div>
              )}
            </motion.button>
          );
        })}
      </div>
    </StepWrapper>
  );
}
