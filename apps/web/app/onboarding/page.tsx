"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import StepWhere from "@/components/onboarding/StepWhere";
import StepWhen from "@/components/onboarding/StepWhen";
import StepWho from "@/components/onboarding/StepWho";
import StepBudget from "@/components/onboarding/StepBudget";
import StepVibes from "@/components/onboarding/StepVibes";
import StepStay from "@/components/onboarding/StepStay";

export type TripPrefs = {
  destination: string;
  startDate: string;
  endDate: string;
  travelers: number;
  travelersType: string;
  budget: number;
  budgetType: "total" | "per_day";
  vibes: string[];
  stay: string[];
};

const TOTAL_STEPS = 6;

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [prefs, setPrefs] = useState<TripPrefs>({
    destination: "",
    startDate: "",
    endDate: "",
    travelers: 1,
    travelersType: "solo",
    budget: 1500,
    budgetType: "total",
    vibes: [],
    stay: [],
  });

  const update = (fields: Partial<TripPrefs>) =>
    setPrefs((p) => ({ ...p, ...fields }));

  const next = () => {
    if (step < TOTAL_STEPS) setStep((s) => s + 1);
    else {
      localStorage.setItem("walter_prefs", JSON.stringify(prefs));
      router.push("/results");
    }
  };

  const back = () => setStep((s) => s - 1);

  const progress = (step / TOTAL_STEPS) * 100;

  return (
    <div className="min-h-screen bg-gray-light flex flex-col">
      {/* Header */}
      <div className="px-6 pt-8 pb-4">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center justify-between mb-6">
            <span className="text-[17px] font-semibold text-gray-dark">Walter</span>
            <span className="text-sm text-on-light-tertiary">{step} of {TOTAL_STEPS}</span>
          </div>
          {/* Progress bar */}
          <div className="h-1 bg-black/5 rounded-full overflow-hidden">
            <div
              className="h-full bg-accent rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Step content */}
      <div className="flex-1 flex flex-col px-6 py-8">
        <div className="max-w-lg mx-auto w-full flex-1 flex flex-col">
          {step === 1 && <StepWhere prefs={prefs} update={update} onNext={next} />}
          {step === 2 && <StepWhen prefs={prefs} update={update} onNext={next} onBack={back} />}
          {step === 3 && <StepWho prefs={prefs} update={update} onNext={next} onBack={back} />}
          {step === 4 && <StepBudget prefs={prefs} update={update} onNext={next} onBack={back} />}
          {step === 5 && <StepVibes prefs={prefs} update={update} onNext={next} onBack={back} />}
          {step === 6 && <StepStay prefs={prefs} update={update} onNext={next} onBack={back} />}
        </div>
      </div>
    </div>
  );
}
