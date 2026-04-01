"use client";

import type { ScoredEvent } from "@/lib/types";

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
  return (
    <a
      href={event.url}
      target="_blank"
      rel="noopener noreferrer"
      className="min-w-[280px] w-[280px] flex-shrink-0 bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-lg hover:border-sky-200 transition-all cursor-pointer group"
    >
      {/* Image */}
      <div className="relative h-40 bg-gray-100">
        {event.image ? (
          <img src={event.image} alt={event.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-sky-50 to-indigo-100">
            <svg className="w-8 h-8 text-indigo-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" /></svg>
          </div>
        )}
        <span className="absolute top-3 left-3 text-[11px] font-bold uppercase tracking-wider bg-white/90 backdrop-blur-sm text-gray-700 px-2.5 py-1 rounded-full">
          {event.category}
        </span>
      </div>

      <div className="p-4">
        {/* Name */}
        <p className="font-bold text-gray-900 mb-1 leading-tight line-clamp-2">{event.name}</p>

        {/* Venue */}
        <p className="text-xs text-gray-400 mb-2">{event.venueName}</p>

        {/* Date/time + match reason */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm font-semibold text-gray-700">{formatDate(event.date)}</p>
            {event.time && (
              <p className="text-xs text-gray-400">{formatTime(event.time)}</p>
            )}
          </div>
          <span className="text-[11px] bg-sky-50 text-sky-600 px-2 py-0.5 rounded-full text-right max-w-[120px] leading-tight">
            {event.matchReason}
          </span>
        </div>

        {/* Price */}
        <div className="flex items-end justify-between pt-3 border-t border-gray-50">
          <div>
            {event.priceMin ? (
              <>
                <p className="text-xl font-bold text-gray-900">
                  ${event.priceMin}
                  {event.priceMax && event.priceMax !== event.priceMin
                    ? `–$${event.priceMax}`
                    : ""}
                </p>
                <p className="text-[11px] text-gray-400">per ticket</p>
              </>
            ) : (
              <p className="text-sm font-semibold text-gray-500">See tickets</p>
            )}
          </div>
          <span className="text-xs text-sky-500 font-semibold group-hover:underline">Book →</span>
        </div>
      </div>
    </a>
  );
}
