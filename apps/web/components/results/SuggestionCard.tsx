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
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-[10px] icon-gradient flex items-center justify-center">
          <span className="material-symbols-outlined text-accent-light text-xl">{icon}</span>
        </div>
        <span className="text-[11px] uppercase tracking-widest text-white/55 font-medium">
          {suggestion.type === "restaurant" ? "Dining" : suggestion.type === "site" ? "Landmark" : suggestion.type}
        </span>
      </div>

      <h3 className="font-semibold text-snow-off-glacier text-lg leading-tight mb-2 line-clamp-2">
        {suggestion.title}
      </h3>

      <p className="text-sm text-white/70 leading-relaxed mb-4 line-clamp-3">
        {suggestion.description}
      </p>

      <div className="flex items-center gap-1.5 mb-4">
        <span className="material-symbols-outlined text-white/45 text-[14px]">location_on</span>
        <p className="text-xs text-white/55 truncate">{suggestion.locationName}</p>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-white/10">
        <div>
          {suggestion.estimatedCost != null && suggestion.estimatedCost > 0 ? (
            <>
              <p className="font-semibold text-snow-off-glacier text-[21px]">
                ${suggestion.estimatedCost}
              </p>
              <p className="text-[10px] uppercase tracking-widest text-white/45 font-semibold">estimated</p>
            </>
          ) : (
            <p className="text-sm font-semibold text-white/55">Free or varies</p>
          )}
        </div>
        <button
          onClick={handleToggle}
          className={`rounded-pill px-4 py-2 text-sm font-semibold flex items-center gap-1.5 transition-colors ${
            added
              ? "bg-accent text-snow-off-glacier hover:bg-accent-light"
              : "border border-white/25 text-snow-off-glacier hover:bg-white/10 hover:border-white/40"
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
