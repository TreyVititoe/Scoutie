"use client";

import { useState, useEffect } from "react";
import { useQuizStore, TripPace } from "@/lib/stores/quizStore";
import StepWrapper from "./StepWrapper";

const paceValues: TripPace[] = ["relaxed", "moderate", "packed"];

const paceDetails: Record<TripPace, { label: string; desc: string; icon: string }> = {
  relaxed: {
    label: "Zen Master",
    desc: "2-3 things per day, plenty of downtime and spontaneity.",
    icon: "self_improvement",
  },
  moderate: {
    label: "Explorer",
    desc: "3-5 activities per day, balanced between plans and free time.",
    icon: "explore",
  },
  packed: {
    label: "Adrenaline Junkie",
    desc: "Maximize every hour -- see everything, sleep later.",
    icon: "bolt",
  },
};

export default function Step8Pace() {
  const store = useQuizStore();

  // Map pace to slider index
  const paceToIndex = (pace: TripPace | null): number => {
    if (!pace) return 1;
    return paceValues.indexOf(pace);
  };

  const [sliderValue, setSliderValue] = useState(paceToIndex(store.pace));

  useEffect(() => {
    setSliderValue(paceToIndex(store.pace));
  }, [store.pace]);

  const handleSliderChange = (val: number) => {
    setSliderValue(val);
    store.setPace(paceValues[val]);
  };

  const currentPace = paceValues[sliderValue];
  const details = paceDetails[currentPace];

  return (
    <StepWrapper
      title="What's your pace?"
      subtitle="How much do you want to fit into each day?"
    >
      <div className="space-y-8">
        {/* Current pace display */}
        <div className="text-center py-6">
          <span className="material-symbols-outlined text-primary text-[56px] mb-3 block">
            {details.icon}
          </span>
          <h3 className="font-headline font-extrabold text-2xl text-on-surface mb-2">
            {details.label}
          </h3>
          <p className="text-on-surface-variant font-body text-sm leading-relaxed max-w-sm mx-auto">
            {details.desc}
          </p>
        </div>

        {/* Slider */}
        <div className="px-2">
          <input
            type="range"
            min={0}
            max={2}
            step={1}
            value={sliderValue}
            onChange={(e) => handleSliderChange(Number(e.target.value))}
            className="w-full h-2 bg-surface-container-low rounded-full appearance-none cursor-pointer accent-primary
              [&::-webkit-slider-thumb]:appearance-none
              [&::-webkit-slider-thumb]:w-6
              [&::-webkit-slider-thumb]:h-6
              [&::-webkit-slider-thumb]:rounded-full
              [&::-webkit-slider-thumb]:bg-primary
              [&::-webkit-slider-thumb]:shadow-lg
              [&::-webkit-slider-thumb]:shadow-primary/30
              [&::-webkit-slider-thumb]:cursor-pointer
              [&::-webkit-slider-thumb]:transition-transform
              [&::-webkit-slider-thumb]:hover:scale-110"
          />
          <div className="flex justify-between mt-3">
            <span className="text-xs font-body font-semibold text-on-surface-variant">Zen Master</span>
            <span className="text-xs font-body font-semibold text-on-surface-variant">Explorer</span>
            <span className="text-xs font-body font-semibold text-on-surface-variant">Adrenaline Junkie</span>
          </div>
        </div>

        {/* Step indicators */}
        <div className="flex justify-center gap-2">
          {paceValues.map((p, i) => (
            <button
              key={p}
              onClick={() => handleSliderChange(i)}
              className={`w-3 h-3 rounded-full transition-all ${
                sliderValue === i ? "bg-primary scale-125" : "bg-surface-container-high"
              }`}
            />
          ))}
        </div>
      </div>
    </StepWrapper>
  );
}
