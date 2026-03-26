"use client";

import { useRouter } from "next/navigation";
import { useQuizStore } from "@/lib/store";
import type { TripPace } from "@/types";

const options: { value: TripPace; label: string; desc: string }[] = [
  { value: "relaxed", label: "Relaxed", desc: "2-3 activities per day, plenty of downtime" },
  { value: "moderate", label: "Balanced", desc: "3-4 activities per day, good mix" },
  { value: "packed", label: "Action-packed", desc: "5+ activities per day, see everything" },
];

export default function PaceStep() {
  const router = useRouter();
  const { preferences, setPace } = useQuizStore();

  const handleFinish = () => {
    router.push("/results");
  };

  return (
    <div className="space-y-6 max-w-md mx-auto w-full">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-gray-900">What&apos;s your pace?</h2>
        <p className="text-gray-500">How packed do you want your days?</p>
      </div>

      <div className="space-y-3">
        {options.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setPace(opt.value)}
            className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
              preferences.pace === opt.value
                ? "border-brand-500 bg-brand-50"
                : "border-gray-100 hover:border-gray-200"
            }`}
          >
            <span className="font-semibold text-gray-900">{opt.label}</span>
            <p className="text-sm text-gray-500 mt-0.5">{opt.desc}</p>
          </button>
        ))}
      </div>

      <button onClick={handleFinish} className="btn-primary w-full">
        Build My Trip
      </button>
    </div>
  );
}
