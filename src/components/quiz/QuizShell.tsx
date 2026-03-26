"use client";

import { useQuizStore } from "@/lib/store";

const TOTAL_STEPS = 6;

export default function QuizShell({ children }: { children: React.ReactNode }) {
  const { step, prevStep } = useQuizStore();

  return (
    <div className="min-h-[calc(100vh-56px)] flex flex-col">
      {/* Progress bar */}
      <div className="py-4">
        <div className="flex items-center gap-3">
          {step > 0 && (
            <button
              onClick={prevStep}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Go back"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5" />
                <polyline points="12 19 5 12 12 5" />
              </svg>
            </button>
          )}
          <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-brand-500 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${((step + 1) / TOTAL_STEPS) * 100}%` }}
            />
          </div>
          <span className="text-xs text-gray-400 font-medium tabular-nums">
            {step + 1}/{TOTAL_STEPS}
          </span>
        </div>
      </div>

      {/* Step content */}
      <div className="flex-1 flex flex-col justify-center py-8">
        {children}
      </div>
    </div>
  );
}
