"use client";

import { useTripCartStore } from "@/lib/stores/tripCartStore";
import type { Suggestion } from "@/lib/types";

const typeIcons: Record<string, string> = {
  activity: "hiking",
  restaurant: "restaurant",
  site: "location_on",
};

export default function SuggestionCard({ suggestion }: { suggestion: Suggestion }) {
  const addItem = useTripCartStore((s) => s.addItem);
  const removeItem = useTripCartStore((s) => s.removeItem);
  const added = useTripCartStore((s) => s.items.some((i) => i.id === suggestion.id));

  const icon = typeIcons[suggestion.type] || "explore";

  const handleToggle = () => {
    if (added) {
      removeItem(suggestion.id);
    } else {
      addItem({
        id: suggestion.id,
        type: suggestion.type,
        title: suggestion.title,
        subtitle: suggestion.locationName,
        price: suggestion.estimatedCost,
        image: null,
        bookingUrl: `https://www.google.com/search?q=${encodeURIComponent(suggestion.title + " " + suggestion.locationName + " book")}`,
        provider: "google",
        date: null,
        meta: suggestion as unknown as Record<string, unknown>,
      });
    }
  };

  return (
    <div className="card-base p-5">
      {/* Type badge & context badges */}
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-2xl icon-gradient flex items-center justify-center">
          <span className="material-symbols-outlined text-accent text-xl">{icon}</span>
        </div>
        <span className="text-[12px] text-on-light-tertiary">
          {suggestion.type === "restaurant" ? "Dining" : suggestion.type === "site" ? "Landmark" : suggestion.type}
        </span>
      </div>
      <div className="flex flex-wrap items-center gap-1.5 mb-4">
        {suggestion.bestTime && (
          <span className="bg-[#FFF2D9] text-accent rounded-pill px-2.5 py-0.5 text-[11px] font-semibold">
            {suggestion.bestTime.toLowerCase().includes("morning")
              ? "Best in morning"
              : suggestion.bestTime.toLowerCase().includes("evening")
                ? "Best in evening"
                : suggestion.bestTime.toLowerCase().includes("night")
                  ? "Best at night"
                  : suggestion.bestTime.toLowerCase().includes("afternoon")
                    ? "Best in afternoon"
                    : "Anytime"}
          </span>
        )}
        {(suggestion.estimatedCost === null || suggestion.estimatedCost === 0) && (
          <span className="text-[12px] font-semibold text-on-light-tertiary tracking-micro">
            Free
          </span>
        )}
      </div>

      {/* Title */}
      <h3 className="font-semibold text-gray-dark text-lg leading-tight mb-2 line-clamp-2">
        {suggestion.title}
      </h3>

      {/* Description */}
      <p className="text-sm text-on-light-secondary leading-relaxed mb-4 line-clamp-3">
        {suggestion.description}
      </p>

      {/* Location */}
      <div className="flex items-center gap-1.5 mb-2">
        <span className="material-symbols-outlined text-on-light-tertiary text-[14px]">location_on</span>
        <p className="text-xs text-on-light-tertiary truncate">{suggestion.locationName}</p>
      </div>

      {/* Best time (raw value, shown if not already captured by badge) */}
      {suggestion.bestTime && !["morning", "evening", "night", "afternoon", "anytime"].some(
        (t) => suggestion.bestTime.toLowerCase().includes(t)
      ) && (
        <div className="flex items-center gap-1.5 mb-4">
          <span className="material-symbols-outlined text-on-light-tertiary text-[14px]">schedule</span>
          <p className="text-xs text-on-light-tertiary">{suggestion.bestTime}</p>
        </div>
      )}

      {/* Cost & Add to Trip */}
      <div className="flex items-center justify-between pt-4 border-t border-on-light-tertiary/15">
        <div>
          {suggestion.estimatedCost != null ? (
            <>
              <p className="font-semibold text-accent text-[21px]">
                ${suggestion.estimatedCost}
              </p>
              <p className="text-[10px] uppercase tracking-widest text-on-light-tertiary font-semibold">estimated</p>
            </>
          ) : (
            <p className="text-sm font-semibold text-on-light-tertiary">Free / varies</p>
          )}
        </div>
        <button
          onClick={handleToggle}
          className={`rounded-[10px] px-4 py-2 text-sm font-semibold flex items-center gap-1.5 transition-colors ${
            added
              ? "bg-accent text-white hover:bg-accent-light"
              : "border border-accent text-accent hover:bg-accent/5"
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">
            {added ? "check" : "add"}
          </span>
          {added ? "Added" : "Add to Trip"}
        </button>
      </div>
    </div>
  );
}
