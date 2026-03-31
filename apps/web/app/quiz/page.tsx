"use client";

import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { useQuizStore } from "@/lib/stores/quizStore";
import Step1PlanningMode from "@/components/quiz/Step1PlanningMode";
import Step2Destination from "@/components/quiz/Step2Destination";
import Step3Travelers from "@/components/quiz/Step3Travelers";
import Step4Budget from "@/components/quiz/Step4Budget";
import Step5Flights from "@/components/quiz/Step5Flights";
import Step6Accommodation from "@/components/quiz/Step6Accommodation";
import Step7Activities from "@/components/quiz/Step7Activities";
import Step8Pace from "@/components/quiz/Step8Pace";
import Step9Dining from "@/components/quiz/Step9Dining";
import Step10Review from "@/components/quiz/Step10Review";

const steps: Record<number, React.ComponentType> = {
  1: Step1PlanningMode,
  2: Step2Destination,
  3: Step3Travelers,
  4: Step4Budget,
  5: Step5Flights,
  6: Step6Accommodation,
  7: Step7Activities,
  8: Step8Pace,
  9: Step9Dining,
  10: Step10Review,
};

export default function QuizPage() {
  const router = useRouter();
  const store = useQuizStore();
  const { currentStep } = store;

  const StepComponent = steps[currentStep];
  const isFirstStep = currentStep === 1;
  const isLastStep = currentStep === 10;

  const handleGenerate = () => {
    // Save quiz data to localStorage for the results page to read
    localStorage.setItem(
      "scoutie_prefs",
      JSON.stringify({
        planningMode: store.planningMode,
        destinations: store.destinations,
        surpriseMe: store.surpriseMe,
        startDate: store.startDate,
        endDate: store.endDate,
        flexibleDates: store.flexibleDates,
        tripDurationDays: store.tripDurationDays,
        travelersCount: store.travelersCount,
        travelerType: store.travelerType,
        childrenCount: store.childrenCount,
        childrenAges: store.childrenAges,
        budgetMode: store.budgetMode,
        budgetAmount: store.budgetAmount,
        budgetCurrency: store.budgetCurrency,
        departureCity: store.departureCity,
        flightClass: store.flightClass,
        flightPriority: store.flightPriority,
        accommodationTypes: store.accommodationTypes,
        accommodationMustHaves: store.accommodationMustHaves,
        locationPreference: store.locationPreference,
        activityInterests: store.activityInterests,
        pace: store.pace,
        diningPreference: store.diningPreference,
        dietaryRestrictions: store.dietaryRestrictions,
        // Legacy compat for existing results page
        destination: store.destinations[0] || "Surprise me",
        travelers: store.travelersCount,
        budget: store.budgetAmount || 2000,
        vibes: store.activityInterests,
      })
    );
    router.push("/results");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="bg-surface border-b border-border sticky top-0 z-20">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <a href="/" className="font-display font-bold text-xl text-text">
            scoutie
          </a>
          <button
            onClick={() => {
              store.resetQuiz();
              router.push("/");
            }}
            className="text-sm text-text-muted hover:text-text transition-colors"
          >
            Exit
          </button>
        </div>
      </header>

      {/* Progress bar */}
      <div className="bg-surface border-b border-border">
        <div className="max-w-3xl mx-auto px-6">
          <div className="h-1 bg-border rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-primary rounded-full"
              initial={false}
              animate={{ width: `${(currentStep / 10) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
          <p className="text-xs text-text-muted py-2">
            Step {currentStep} of 10
          </p>
        </div>
      </div>

      {/* Step content */}
      <main className="flex-1 flex items-start justify-center px-6 py-12">
        <AnimatePresence mode="wait">
          <StepComponent key={currentStep} />
        </AnimatePresence>
      </main>

      {/* Bottom nav */}
      <div className="bg-surface border-t border-border sticky bottom-0">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => store.prevStep()}
            disabled={isFirstStep}
            className={`px-6 py-3 rounded-xl font-semibold transition-all ${
              isFirstStep
                ? "opacity-0 pointer-events-none"
                : "text-text-secondary hover:bg-primary-50"
            }`}
          >
            Back
          </button>

          {isLastStep ? (
            <button
              onClick={handleGenerate}
              className="px-8 py-3 rounded-xl bg-primary text-white font-bold hover:bg-primary-dark transition-colors shadow-lg shadow-primary/20"
            >
              Generate My Trip
            </button>
          ) : (
            <button
              onClick={() => store.nextStep()}
              className="px-8 py-3 rounded-xl bg-primary text-white font-bold hover:bg-primary-dark transition-colors"
            >
              Continue
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
