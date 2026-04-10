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
    <div className="w-full bg-white rounded-[8px] overflow-hidden">
      {/* Image */}
      <div className="relative h-40 bg-gray-light">
        {event.image ? (
          <img src={event.image} alt={event.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-light">
            <span className="material-symbols-outlined text-on-light-tertiary text-4xl">local_activity</span>
          </div>
        )}
        <div className="absolute top-3 left-3 flex flex-wrap items-center gap-1.5">
          <span className="text-[12px] font-semibold text-gray-dark bg-white/90 backdrop-blur-sm rounded-pill px-2.5 py-1">
            {event.category}
          </span>
          {(event.priceMin === null || event.priceMin === 0) && (
            <span className="text-[12px] text-on-light-tertiary">
              Free
            </span>
          )}
          {event.priceMin !== null && event.priceMin > 0 && event.priceMin < 30 && (
            <span className="text-[12px] text-on-light-tertiary">
              Under $30
            </span>
          )}
        </div>
        {event.matchReason && (
          <span className="absolute top-3 right-3 text-[10px] font-semibold bg-gray-light text-gray-dark px-2.5 py-1 rounded-full max-w-[140px] truncate">
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
          <p className="text-sm font-semibold text-on-surface">
            {formatDate(event.date)}
            {event.time && (
              <span className="text-on-light-tertiary font-normal ml-1.5">{formatTime(event.time)}</span>
            )}
          </p>
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
              <p className="text-sm font-semibold text-on-light-tertiary">See prices</p>
            )}
          </div>
          <button
            onClick={handleToggle}
            className={`rounded-[8px] px-4 py-2 text-sm font-semibold flex items-center gap-1.5 transition-colors ${
              added
                ? "bg-accent text-white"
                : "border border-accent text-accent"
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
