"use client";

import type { EventOption } from "@/types";

export default function EventCard({ event }: { event: EventOption }) {
  return (
    <div className="card p-4 space-y-2">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="font-semibold text-gray-900 text-sm">{event.name}</h3>
          <p className="text-xs text-gray-400">{event.location}</p>
        </div>
        <span className="text-sm font-bold text-brand-600 shrink-0">
          {event.price === 0 ? "Free" : `$${event.price}`}
        </span>
      </div>

      <p className="text-xs text-gray-500 line-clamp-2">{event.description}</p>

      <div className="flex items-center gap-2 text-xs text-gray-400">
        <span>{event.date}</span>
        <span>·</span>
        <span>{event.time}</span>
        <span>·</span>
        <span className="capitalize">{event.category}</span>
      </div>

      <a
        href={event.affiliateUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="block text-center text-sm text-brand-600 font-medium hover:text-brand-700 pt-1"
      >
        Get Tickets →
      </a>
    </div>
  );
}
