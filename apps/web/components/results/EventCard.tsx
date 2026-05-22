"use client";

import type { ScoredEvent } from "@/lib/types";
import { useTripCartStore } from "@/lib/stores/tripCartStore";

function formatDate(dateStr: string): string {
  if (!dateStr) return "Date TBD";
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", weekday: "short" });
}

function formatTime(timeStr: string | null): string {
  if (!timeStr) return "";
  const [h, m] = timeStr.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hour = h % 12 || 12;
  return `${hour}:${String(m).padStart(2, "0")} ${period}`;
}

export default function EventCard({ event }: { event: ScoredEvent }) {
  const addItem = useTripCartStore((s) => s.addItem);
  const removeItem = useTripCartStore((s) => s.removeItem);
  const added = useTripCartStore((s) => s.items.some((i) => i.id === event.id));

  const handleToggle = () => {
    if (added) {
      removeItem(event.id);
    } else {
      addItem({
        id: event.id,
        type: "event",
        title: event.name,
        subtitle: event.venueName,
        price: event.priceMin,
        image: event.image,
        bookingUrl: event.url,
        provider: "ticketmaster",
        date: event.date,
        meta: event as unknown as Record<string, unknown>,
      });
    }
  };

  return (
    <div className="w-full card-base overflow-hidden">
      {/* Image */}
      <div className="relative h-40 bg-raised-slate">
        {event.image ? (
          <img src={event.image} alt={event.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-raised-slate">
            <span className="material-symbols-outlined text-white/45 text-4xl">local_activity</span>
          </div>
        )}
        <span className="absolute top-3 left-3 bg-tinted-pitch/85 backdrop-blur-sm text-reykjavik-sky border border-white/10 rounded-pill px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide">
          {event.category}
        </span>
      </div>

      <div className="p-5">
        {/* Name */}
        <p className="font-semibold text-snow-off-glacier leading-tight line-clamp-2 mb-1">
          {event.name}
        </p>

        {/* Venue */}
        <div className="flex items-center gap-1.5 mb-3">
          <span className="material-symbols-outlined text-white/45 text-[14px]">location_on</span>
          <p className="text-xs text-white/45 truncate">{event.venueName}</p>
        </div>

        {/* Date/time */}
        <div className="flex items-center gap-1.5 mb-4">
          <span className="material-symbols-outlined text-white/45 text-[14px]">calendar_today</span>
          <div>
            <p className="text-sm font-semibold text-snow-off-glacier">
              {formatDate(event.date)}
              {event.time && (
                <span className="text-white/45 font-normal ml-1.5">{formatTime(event.time)}</span>
              )}
            </p>
            {event.additionalDates != null && event.additionalDates > 0 && (
              <p className="text-[11px] text-accent font-semibold mt-0.5">
                +{event.additionalDates} more date{event.additionalDates !== 1 ? "s" : ""} during your trip
              </p>
            )}
          </div>
        </div>

        {/* Price & Add to Trip */}
        <div className="flex items-center justify-between pt-4 border-t border-white/10">
          <div>
            {event.priceMin ? (
              <>
                <p className="font-semibold text-snow-off-glacier text-[21px]">
                  ${event.priceMin}
                  {event.priceMax && event.priceMax !== event.priceMin
                    ? <span className="text-sm font-semibold text-white/45"> to ${event.priceMax}</span>
                    : null}
                </p>
                <p className="text-[10px] uppercase tracking-widest text-white/45 font-semibold">per ticket</p>
              </>
            ) : (
              <p className="text-sm font-semibold text-snow-off-glacier">View tickets</p>
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
    </div>
  );
}
