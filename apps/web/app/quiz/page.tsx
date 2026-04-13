"use client";

import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { useQuizStore } from "@/lib/stores/quizStore";
import { useTripCartStore } from "@/lib/stores/tripCartStore";
import Step1WhereWhen from "@/components/quiz/Step1WhereWhen";
import Step3Travelers from "@/components/quiz/Step3Travelers";
import Step4Budget from "@/components/quiz/Step4Budget";
import Step4Flights from "@/components/quiz/Step4Flights";
import Step5Accommodation from "@/components/quiz/Step5Accommodation";
import Step6Activities from "@/components/quiz/Step6Activities";
import Step7Review from "@/components/quiz/Step7Review";

const steps: Record<number, React.ComponentType> = {
  1: Step1WhereWhen,
  2: Step3Travelers,
  3: Step4Budget,
  4: Step4Flights,
  5: Step5Accommodation,
  6: Step6Activities,
  7: Step7Review,
};

const stepLabels = [
  "Trip", "Travelers", "Budget", "Flights", "Stay", "Interests", "Review",
];

export default function QuizPage() {
  const router = useRouter();
  const store = useQuizStore();
  const { currentStep } = store;

  const StepComponent = steps[currentStep];
  const isFirstStep = currentStep === 1;
  const isLastStep = currentStep === 7;

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
    // Route to compare page if multiple destinations or surprise me
    const shouldCompare =
      store.surpriseMe ||
      store.destinations.length > 1 ||
      store.destinations.length === 0;

    router.push(shouldCompare ? "/compare" : "/results");
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
              const isFilled = stepNum <= currentStep;
              return (
                <div
                  key={label}
                  className="w-12 h-0.5 rounded-full bg-accent/15 overflow-hidden"
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
      <div className="sticky bottom-0 z-20 bg-white border-t border-[rgba(0,101,113,0.08)]">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => store.prevStep()}
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
              onClick={() => store.nextStep()}
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
