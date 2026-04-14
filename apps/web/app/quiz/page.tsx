"use client";

import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { useQuizStore } from "@/lib/stores/quizStore";
import { useTripCartStore } from "@/lib/stores/tripCartStore";
import StepAboutYou from "@/components/quiz/StepAboutYou";
import Step1WhereWhen from "@/components/quiz/Step1WhereWhen";
import Step6Activities from "@/components/quiz/Step6Activities";
import Step7Review from "@/components/quiz/Step7Review";

const steps: Record<number, React.ComponentType> = {
  1: StepAboutYou,
  2: Step1WhereWhen,
  3: Step6Activities,
  4: Step7Review,
};

const stepLabels = ["You", "Destination", "Interests", "Review"];

export default function QuizPage() {
  const router = useRouter();
  const store = useQuizStore();
  const { currentStep } = store;

  // Clamp step to new range
  const step = Math.min(currentStep, 4);
  const StepComponent = steps[step];
  const isFirstStep = step === 1;
  const isLastStep = step === 4;

  const handleGenerate = () => {
    useTripCartStore.getState().clearCart();
    localStorage.setItem(
      "walter_prefs",
      JSON.stringify({
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
        budgetSkipped: store.budgetSkipped,
        departureCity: store.departureCity,
        flightClass: store.flightClass,
        flightPriority: store.flightPriority,
        accommodationTypes: store.accommodationTypes,
        accommodationMustHaves: store.accommodationMustHaves,
        locationPreference: store.locationPreference,
        noAccommodation: store.noAccommodation,
        activityInterests: store.activityInterests,
        destination: store.destinations[0] || "Surprise me",
        travelers: store.travelersCount,
        budget: store.budgetAmount || 2000,
        vibes: store.activityInterests,
      })
    );
    const shouldCompare =
      store.surpriseMe ||
      store.destinations.length > 1 ||
      store.destinations.length === 0 ||
      !store.startDate ||
      !store.endDate;

    router.push(shouldCompare ? "/compare" : "/results");
  };

  const handleNext = () => {
    store.setStep(Math.min(step + 1, 4));
  };

  const handleBack = () => {
    store.setStep(Math.max(step - 1, 1));
  };

  return (
    <div className="min-h-screen bg-gray-light flex flex-col">
      {/* Dark Nav Header */}
      <header className="sticky top-0 z-20 nav-glass">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <a href="/" className="text-white text-[17px] font-semibold">
            Walter
          </a>

          {/* Progress Bars */}
          <div className="flex items-center gap-1.5">
            {stepLabels.map((label, i) => {
              const stepNum = i + 1;
              const isFilled = stepNum <= step;
              return (
                <div
                  key={label}
                  className="w-14 h-1 rounded-full bg-accent/15 overflow-hidden"
                >
                  <motion.div
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: isFilled ? 1 : 0 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    className="w-full h-full bg-accent rounded-full origin-left"
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
            className="bg-white/15 border border-white/20 text-white rounded-pill px-4 py-1.5 text-[11px] font-semibold hover:bg-white/25 transition-colors"
          >
            Exit
          </button>
        </div>
      </header>

      {/* Step Content */}
      <main className="flex-1 flex items-start justify-center px-6 py-12">
        <AnimatePresence mode="wait">
          <StepComponent key={step} />
        </AnimatePresence>
      </main>

      {/* Bottom Navigation */}
      <div className="sticky bottom-0 z-20 bg-white border-t border-[rgba(0,101,113,0.08)]">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <button
            onClick={handleBack}
            disabled={isFirstStep}
            className={`text-sm flex items-center gap-2 ${
              isFirstStep
                ? "opacity-0 pointer-events-none"
                : "text-on-light-secondary hover:text-gray-dark"
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">arrow_back</span>
            Back
          </button>

          {isLastStep ? (
            <button
              onClick={handleGenerate}
              className="bg-accent text-white rounded-[10px] px-8 py-3 text-[17px] flex items-center gap-2 hover:bg-accent-light transition-colors"
            >
              <span className="material-symbols-outlined text-[22px]">auto_awesome</span>
              Generate My Trip
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="bg-accent text-white rounded-[10px] px-8 py-3 text-[17px] flex items-center gap-2 hover:bg-accent-light transition-colors"
            >
              Continue
              <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
