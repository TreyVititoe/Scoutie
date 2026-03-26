"use client";

import type { FlightOption } from "@/types";

export default function FlightCard({ flight }: { flight: FlightOption }) {
  return (
    <div className="card p-4 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-gray-900">{flight.airline}</span>
        <span className="text-lg font-bold text-brand-600">${flight.price}</span>
      </div>

      <div className="flex items-center gap-3">
        <div className="text-center">
          <p className="text-sm font-semibold text-gray-900">{flight.departureTime}</p>
          <p className="text-xs text-gray-400">{flight.departureAirport}</p>
        </div>
        <div className="flex-1 flex flex-col items-center">
          <p className="text-[10px] text-gray-400">{flight.duration}</p>
          <div className="w-full h-px bg-gray-200 relative">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-gray-300 rounded-full" />
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-gray-300 rounded-full" />
          </div>
          <p className="text-[10px] text-gray-400">
            {flight.stops === 0 ? "Nonstop" : `${flight.stops} stop${flight.stops > 1 ? "s" : ""}`}
          </p>
        </div>
        <div className="text-center">
          <p className="text-sm font-semibold text-gray-900">{flight.arrivalTime}</p>
          <p className="text-xs text-gray-400">{flight.arrivalAirport}</p>
        </div>
      </div>

      <a
        href={flight.affiliateUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="block text-center text-sm text-brand-600 font-medium hover:text-brand-700"
      >
        View Deal →
      </a>
    </div>
  );
}
