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
      "walter_prefs",
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
      {/* Glass Header */}
      <header className="sticky top-0 z-20 bg-white/70 backdrop-blur-xl shadow-xl shadow-teal-900/5">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <a href="/" className="text-2xl font-black italic text-teal-700 font-headline">
            Walter
          </a>

          {/* Progress Bars */}
          <div className="flex items-center gap-1.5">
            {stepLabels.map((label, i) => {
              const stepNum = i + 1;
              const isFilled = stepNum <= currentStep;
              return (
                <div
                  key={label}
                  className="w-12 h-1 rounded-full bg-primary/20 overflow-hidden"
                >
                  <motion.div
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: isFilled ? 1 : 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    className="w-full h-full bg-primary rounded-full origin-left"
                  />
                </div>
              );
            })}
          </div>

          <button
            onClick={() => {
              store.resetQuiz();
              router.push("/");
            }}
            className="flex items-center gap-1 text-sm font-body text-on-surface-variant hover:text-on-surface transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
            Exit
          </button>
        </div>
      </header>

      {/* Step Content */}
      <main className="flex-1 flex items-start justify-center px-6 py-12">
        <AnimatePresence mode="wait">
          <StepComponent key={currentStep} />
        </AnimatePresence>
      </main>

      {/* Bottom Navigation */}
      <div className="sticky bottom-0 z-20 bg-white/70 backdrop-blur-xl shadow-[0_-4px_24px_rgba(0,101,113,0.05)]">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <motion.button
            onClick={() => store.prevStep()}
            disabled={isFirstStep}
            whileHover={isFirstStep ? {} : { scale: 1.03 }}
            whileTap={isFirstStep ? {} : { scale: 0.95 }}
            className={`px-8 py-4 rounded-full font-bold font-body flex items-center gap-2 ${
              isFirstStep
                ? "opacity-0 pointer-events-none"
                : "text-on-surface hover:bg-surface-container-high"
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">arrow_back</span>
            Back
          </motion.button>

          {isLastStep ? (
            <motion.button
              onClick={handleGenerate}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.95 }}
              className="px-14 py-4 rounded-full btn-primary-gradient text-white font-bold font-body shadow-2xl shadow-primary/30 flex items-center gap-2 text-lg"
            >
              <span className="material-symbols-outlined text-[22px]">auto_awesome</span>
              Generate My Trip
            </motion.button>
          ) : (
            <motion.button
              onClick={() => store.nextStep()}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.95 }}
              className="px-12 py-4 rounded-full btn-primary-gradient text-white font-bold font-body shadow-2xl shadow-primary/30 flex items-center gap-2"
            >
              Continue
              <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
            </motion.button>
          )}
        </div>
      </div>
    </div>
  );
}
