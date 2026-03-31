"use client";

import { useQuizStore, TripPace } from "@/lib/stores/quizStore";
import StepWrapper from "./StepWrapper";

const paces: { value: TripPace; icon: string; title: string; desc: string }[] = [
  {
    value: "relaxed",
    icon: "🧘",
    title: "Relaxed",
    desc: "2-3 things per day, plenty of downtime and spontaneity.",
  },
  {
    value: "moderate",
    icon: "🚶",
    title: "Moderate",
    desc: "3-5 activities per day, balanced between plans and free time.",
  },
  {
    value: "packed",
    icon: "🏃",
    title: "Packed",
    desc: "Maximize every hour — see everything, sleep later.",
  },
];

export default function Step8Pace() {
  const store = useQuizStore();

  return (
    <StepWrapper
      title="What's your pace?"
      subtitle="How much do you want to fit into each day?"
    >
      <div className="space-y-3">
        {paces.map((p) => (
          <button
            key={p.value}
            onClick={() => store.setPace(p.value)}
            className={`w-full p-5 rounded-xl border-2 text-left transition-all ${
              store.pace === p.value
                ? "border-primary bg-primary-50"
                : "border-border bg-surface hover:border-primary-light"
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">{p.icon}</span>
              <div>
                <p className="font-display font-bold text-text">{p.title}</p>
                <p className="text-sm text-text-secondary">{p.desc}</p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </StepWrapper>
  );
}
