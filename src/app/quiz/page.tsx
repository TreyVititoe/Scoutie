"use client";

import { Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useQuizStore } from "@/lib/store";
import QuizShell from "@/components/quiz/QuizShell";
import DestinationStep from "@/components/quiz/steps/DestinationStep";
import DatesStep from "@/components/quiz/steps/DatesStep";
import BudgetStep from "@/components/quiz/steps/BudgetStep";
import InterestsStep from "@/components/quiz/steps/InterestsStep";
import AccommodationStep from "@/components/quiz/steps/AccommodationStep";
import PaceStep from "@/components/quiz/steps/PaceStep";

const steps = [DestinationStep, DatesStep, BudgetStep, InterestsStep, AccommodationStep, PaceStep];

function QuizContent() {
  const searchParams = useSearchParams();
  const { step, setDestination, reset } = useQuizStore();

  useEffect(() => {
    reset();
    const dest = searchParams.get("destination");
    if (dest) setDestination(dest);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const StepComponent = steps[step] || steps[0];

  return (
    <QuizShell>
      <StepComponent />
    </QuizShell>
  );
}

export default function QuizPage() {
  return (
    <Suspense fallback={<div className="min-h-[60vh] flex items-center justify-center"><div className="w-8 h-8 border-4 border-brand-200 border-t-brand-500 rounded-full animate-spin" /></div>}>
      <QuizContent />
    </Suspense>
  );
}
