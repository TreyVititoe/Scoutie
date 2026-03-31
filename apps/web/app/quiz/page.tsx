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

const stepLabels = [
  "Mode", "Where", "Who", "Budget", "Flights",
  "Stay", "Activities", "Pace", "Dining", "Review",
];

export default function QuizPage() {
  const router = useRouter();
  const store = useQuizStore();
  const { currentStep } = store;

  const StepComponent = steps[currentStep];
  const isFirstStep = currentStep === 1;
  const isLastStep = currentStep === 10;

  const handleGenerate = () => {
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
      <header className="glass sticky top-0 z-20">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <a href="/" className="font-display font-extrabold text-xl text-gradient">
            scoutie
          </a>
          <button
            onClick={() => {
              store.resetQuiz();
              router.push("/");
            }}
            className="text-sm text-text-muted hover:text-text transition-colors flex items-center gap-1"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
            Exit
          </button>
        </div>
      </header>

      {/* Progress */}
      <div className="bg-surface/80 backdrop-blur-sm border-b border-border">
        <div className="max-w-3xl mx-auto px-6">
          {/* Step dots */}
          <div className="flex items-center justify-between py-3">
            {stepLabels.map((label, i) => {
              const stepNum = i + 1;
              const isActive = stepNum === currentStep;
              const isComplete = stepNum < currentStep;
              return (
                <div key={label} className="flex flex-col items-center gap-1.5">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                      isActive
                        ? "bg-gradient-animated text-white shadow-md shadow-primary/30 scale-110"
                        : isComplete
                        ? "bg-primary text-white"
                        : "bg-border/50 text-text-muted"
                    }`}
                  >
                    {isComplete ? (
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      stepNum
                    )}
                  </div>
                  <span className={`text-[10px] font-medium hidden sm:block ${isActive ? "text-primary" : "text-text-muted"}`}>
                    {label}
                  </span>
                </div>
              );
            })}
          </div>
          {/* Progress bar */}
          <div className="h-1 bg-border/50 rounded-full overflow-hidden mb-1">
            <motion.div
              className="h-full bg-gradient-animated rounded-full"
              initial={false}
              animate={{ width: `${(currentStep / 10) * 100}%` }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            />
          </div>
        </div>
      </div>

      {/* Step content */}
      <main className="flex-1 flex items-start justify-center px-6 py-12">
        <AnimatePresence mode="wait">
          <StepComponent key={currentStep} />
        </AnimatePresence>
      </main>

      {/* Bottom nav */}
      <div className="glass sticky bottom-0 border-t border-border">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => store.prevStep()}
            disabled={isFirstStep}
            className={`px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 ${
              isFirstStep
                ? "opacity-0 pointer-events-none"
                : "text-text-secondary hover:bg-primary-50 hover:text-primary"
            }`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 17l-5-5m0 0l5-5m-5 5h12" />
            </svg>
            Back
          </button>

          {isLastStep ? (
            <button
              onClick={handleGenerate}
              className="btn-glow px-8 py-3 rounded-xl bg-gradient-animated text-white font-bold transition-all hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5 flex items-center gap-2"
            >
              Generate My Trip
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
          ) : (
            <button
              onClick={() => store.nextStep()}
              className="px-8 py-3 rounded-xl bg-primary text-white font-bold hover:bg-primary-dark transition-all hover:shadow-lg hover:shadow-primary/20 flex items-center gap-2"
            >
              Continue
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
