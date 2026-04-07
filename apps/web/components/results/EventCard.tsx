"use client";

import { motion } from "framer-motion";
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
    <motion.div
      whileHover={{ y: -4, boxShadow: "0 20px 40px -10px rgba(0,0,0,0.1)" }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className="min-w-[300px] w-[300px] flex-shrink-0 card-3d rounded-[2rem] overflow-hidden cursor-pointer group"
    >
      {/* Image */}
      <div className="relative h-40 bg-surface-container-lowest">
        {event.image ? (
          <img src={event.image} alt={event.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/5 to-primary/15">
            <span className="material-symbols-outlined text-primary/30 text-4xl">local_activity</span>
          </div>
        )}
        <span className="absolute top-3 left-3 text-[10px] font-bold uppercase tracking-widest bg-white/90 backdrop-blur-sm text-on-surface px-2.5 py-1 rounded-full font-body">
          {event.category}
        </span>
        {event.matchReason && (
          <span className="absolute top-3 right-3 text-[10px] font-bold bg-secondary-container text-on-secondary-container px-2.5 py-1 rounded-full font-body max-w-[140px] truncate">
            {event.matchReason}
          </span>
        )}
      </div>

      <div className="p-5">
        {/* Name */}
        <p className="font-headline font-bold text-on-surface leading-tight line-clamp-2 mb-1">
          {event.name}
        </p>

        {/* Venue */}
        <div className="flex items-center gap-1.5 mb-3">
          <span className="material-symbols-outlined text-outline-variant text-[14px]">location_on</span>
          <p className="text-xs text-outline-variant font-body truncate">{event.venueName}</p>
        </div>

        {/* Date/time */}
        <div className="flex items-center gap-1.5 mb-4">
          <span className="material-symbols-outlined text-outline-variant text-[14px]">calendar_today</span>
          <p className="text-sm font-bold text-on-surface font-body">
            {formatDate(event.date)}
            {event.time && (
              <span className="text-outline-variant font-normal ml-1.5">{formatTime(event.time)}</span>
            )}
          </p>
        </div>

        {/* Price & Add to Trip */}
        <div className="flex items-center justify-between pt-4 border-t border-outline-variant/15">
          <div>
            {event.priceMin ? (
              <>
                <p className="font-headline font-black text-primary text-xl">
                  ${event.priceMin}
                  {event.priceMax && event.priceMax !== event.priceMin
                    ? <span className="text-sm font-bold text-outline-variant">--${event.priceMax}</span>
                    : null}
                </p>
                <p className="text-[10px] uppercase tracking-widest text-outline-variant font-bold font-body">per ticket</p>
              </>
            ) : (
              <p className="text-sm font-bold text-outline-variant font-body">See prices</p>
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
      </div>
    </motion.div>
  );
}
