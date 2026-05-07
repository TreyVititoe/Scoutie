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
      <div className="relative h-40 bg-page-bg">
        {event.image ? (
          <img src={event.image} alt={event.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-page-bg">
            <span className="material-symbols-outlined text-on-light-tertiary text-4xl">local_activity</span>
          </div>
        )}
        <div className="absolute top-3 left-3 flex flex-wrap items-center gap-1.5">
          <span className="bg-[#FFF2D9] text-accent rounded-pill px-2.5 py-0.5 text-[11px] font-semibold">
            {event.category}
          </span>
          {(event.priceMin === null || event.priceMin === 0) && (
            <span className="bg-[#FFF2D9] text-accent rounded-pill px-2.5 py-0.5 text-[11px] font-semibold">
              Free
            </span>
          )}
          {event.priceMin !== null && event.priceMin > 0 && event.priceMin < 30 && (
            <span className="bg-[#FFF2D9] text-accent rounded-pill px-2.5 py-0.5 text-[11px] font-semibold">
              Under $30
            </span>
          )}
        </div>
        {event.matchReason && (
          <span className="absolute top-3 right-3 text-[10px] font-semibold bg-[#FFF2D9] text-accent px-2.5 py-1 rounded-full max-w-[140px] truncate">
            {event.matchReason}
          </span>
        )}
      </div>

      <div className="p-5">
        {/* Name */}
        <p className="font-semibold text-on-surface leading-tight line-clamp-2 mb-1">
          {event.name}
        </p>

        {/* Venue */}
        <div className="flex items-center gap-1.5 mb-3">
          <span className="material-symbols-outlined text-on-light-tertiary text-[14px]">location_on</span>
          <p className="text-xs text-on-light-tertiary truncate">{event.venueName}</p>
        </div>

        {/* Date/time */}
        <div className="flex items-center gap-1.5 mb-4">
          <span className="material-symbols-outlined text-on-light-tertiary text-[14px]">calendar_today</span>
          <div>
            <p className="text-sm font-semibold text-on-surface">
              {formatDate(event.date)}
              {event.time && (
                <span className="text-on-light-tertiary font-normal ml-1.5">{formatTime(event.time)}</span>
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
        <div className="flex items-center justify-between pt-4 border-t border-on-light-tertiary/15">
          <div>
            {event.priceMin ? (
              <>
                <p className="font-semibold text-accent text-[21px]">
                  ${event.priceMin}
                  {event.priceMax && event.priceMax !== event.priceMin
                    ? <span className="text-sm font-semibold text-on-light-tertiary">--${event.priceMax}</span>
                    : null}
                </p>
                <p className="text-[10px] uppercase tracking-widest text-on-light-tertiary font-semibold">per ticket</p>
              </>
            ) : (
              <p className="text-sm font-semibold text-accent">View tickets</p>
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
    </div>
  );
}
