"use client";

import { motion } from "framer-motion";
import { useTripCartStore } from "@/lib/stores/tripCartStore";
import type { Suggestion } from "@/lib/types";

const typeIcons: Record<string, string> = {
  activity: "hiking",
  restaurant: "restaurant",
  site: "location_on",
};

const typeColors: Record<string, { bg: string; text: string }> = {
  activity: { bg: "bg-teal-50", text: "text-teal-600" },
  restaurant: { bg: "bg-amber-50", text: "text-amber-600" },
  site: { bg: "bg-purple-50", text: "text-purple-600" },
};

export default function SuggestionCard({ suggestion }: { suggestion: Suggestion }) {
  const addItem = useTripCartStore((s) => s.addItem);
  const removeItem = useTripCartStore((s) => s.removeItem);
  const added = useTripCartStore((s) => s.items.some((i) => i.id === suggestion.id));

  const icon = typeIcons[suggestion.type] || "explore";
  const colors = typeColors[suggestion.type] || typeColors.activity;

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
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className="min-w-[280px] w-[280px] flex-shrink-0 card-3d rounded-[2rem] p-6 cursor-pointer"
    >
      {/* Type badge */}
      <div className="flex items-center gap-3 mb-4">
        <div className={`w-10 h-10 rounded-2xl ${colors.bg} flex items-center justify-center`}>
          <span className={`material-symbols-outlined ${colors.text} text-xl`}>{icon}</span>
        </div>
        <span className="text-[10px] font-bold uppercase tracking-widest text-outline-variant font-body">
          {suggestion.type}
        </span>
      </div>

      {/* Title */}
      <h3 className="font-headline font-bold text-on-surface text-lg leading-tight mb-2 line-clamp-2">
        {suggestion.title}
      </h3>

      {/* Description */}
      <p className="text-sm text-on-surface-variant font-body leading-relaxed mb-4 line-clamp-3">
        {suggestion.description}
      </p>

      {/* Location */}
      <div className="flex items-center gap-1.5 mb-2">
        <span className="material-symbols-outlined text-outline-variant text-[14px]">location_on</span>
        <p className="text-xs text-outline-variant font-body truncate">{suggestion.locationName}</p>
      </div>

      {/* Best time */}
      {suggestion.bestTime && (
        <div className="flex items-center gap-1.5 mb-4">
          <span className="material-symbols-outlined text-outline-variant text-[14px]">schedule</span>
          <p className="text-xs text-outline-variant font-body">{suggestion.bestTime}</p>
        </div>
      )}

      {/* Cost & Add to Trip */}
      <div className="flex items-center justify-between pt-4 border-t border-outline-variant/15">
        <div>
          {suggestion.estimatedCost != null ? (
            <>
              <p className="font-headline font-black text-primary text-xl">
                ${suggestion.estimatedCost}
              </p>
              <p className="text-[10px] uppercase tracking-widest text-outline-variant font-bold font-body">estimated</p>
            </>
          ) : (
            <p className="text-sm font-bold text-outline-variant font-body">Free / varies</p>
          )}
        </div>
        <motion.button
          onClick={handleToggle}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          className={`rounded-full px-5 py-2 text-sm font-bold font-headline flex items-center gap-1.5 transition-colors ${
            added
              ? "bg-primary text-white"
              : "border border-primary text-primary hover:bg-primary/5"
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">
            {added ? "check" : "add"}
          </span>
          {added ? "Added" : "Add to Trip"}
        </motion.button>
      </div>
    </motion.div>
  );
}
