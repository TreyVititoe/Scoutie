"use client";

import type { FlightResult } from "@/lib/services/flights";
import { trackAndOpen } from "@/lib/affiliate";

export default function FlightCard({ flight, cheapest }: { flight: FlightResult; cheapest: boolean }) {
  const handleBook = () => {
    if (flight.bookingUrl) {
      trackAndOpen({
        provider: "skyscanner",
        itemType: "flight",
        destinationUrl: flight.bookingUrl,
      });
    }
  };

  return (
    <div
      onClick={handleBook}
      className="min-w-[280px] w-[280px] flex-shrink-0 bg-surface border border-border rounded-2xl p-5 hover:shadow-lg hover:border-primary-light transition-all group cursor-pointer">
      {/* Tags */}
      <div className="flex items-center gap-2 mb-3">
        {cheapest && (
          <span className="text-[11px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full">
            Best price
          </span>
        )}
        {flight.stops === 0 && (
          <span className="text-[11px] font-bold uppercase tracking-wider bg-primary-50 text-primary px-2 py-0.5 rounded-full">
            Direct
          </span>
        )}
      </div>

      {/* Airline */}
      <div className="flex items-center gap-2 mb-3">
        {flight.airlineLogo && (
          <img src={flight.airlineLogo} alt="" className="w-5 h-5 rounded" />
        )}
        <p className="text-sm font-semibold text-text">{flight.airline}</p>
      </div>

      {/* Route */}
      <div className="flex items-center gap-3 mb-3">
        <div className="text-center">
          <p className="text-lg font-bold text-text">{flight.departTime}</p>
          <p className="text-xs text-text-muted">{flight.departure}</p>
        </div>
        <div className="flex-1 flex flex-col items-center">
          <p className="text-[10px] text-text-muted mb-1">{flight.duration}</p>
          <div className="w-full h-px bg-border relative">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-text-muted" />
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-text-muted" />
          </div>
          <p className="text-[10px] text-text-muted mt-1">
            {flight.stops === 0 ? "Nonstop" : `${flight.stops} stop${flight.stops > 1 ? "s" : ""}`}
          </p>
        </div>
        <div className="text-center">
          <p className="text-lg font-bold text-text">{flight.arriveTime}</p>
          <p className="text-xs text-text-muted">{flight.arrival}</p>
        </div>
      </div>

      {/* Price */}
      <div className="flex items-end justify-between pt-3 border-t border-border">
        <p className="text-2xl font-mono font-bold text-text">${flight.price}</p>
        <span className="text-xs text-primary font-semibold group-hover:underline">Book →</span>
      </div>
    </div>
  );
}
