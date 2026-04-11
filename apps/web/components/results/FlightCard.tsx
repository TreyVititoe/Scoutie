"use client";

import type { FlightResult } from "@/lib/services/flights";
import { useTripCartStore } from "@/lib/stores/tripCartStore";

function parseDurationHours(duration: string): number {
  const match = duration.match(/(\d+)h/);
  return match ? parseInt(match[1], 10) : 99;
}

export default function FlightCard({ flight, cheapest }: { flight: FlightResult; cheapest: boolean }) {
  const addItem = useTripCartStore((s) => s.addItem);
  const removeItem = useTripCartStore((s) => s.removeItem);
  const added = useTripCartStore((s) => s.items.some((i) => i.id === flight.id));

  const stopsLabel = flight.stops === 0 ? "nonstop" : `${flight.stops} stop${flight.stops > 1 ? "s" : ""}`;
  const isQuickFlight = parseDurationHours(flight.duration) < 4;

  const handleToggle = () => {
    if (added) {
      removeItem(flight.id);
    } else {
      addItem({
        id: flight.id,
        type: "flight",
        title: `${flight.airline} ${flight.departure} -> ${flight.arrival}`,
        subtitle: `${flight.departTime} | ${flight.duration} | ${stopsLabel}`,
        price: flight.price,
        image: flight.airlineLogo,
        bookingUrl: flight.bookingUrl,
        provider: "google_flights",
        date: null,
        meta: flight as unknown as Record<string, unknown>,
      });
    }
  };

  return (
    <div className="w-full card-base p-6">
      {/* Tags */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        {cheapest && (
          <span className="bg-[#e6f7f9] text-accent rounded-pill px-2.5 py-0.5 text-[11px] font-semibold">
            Best price
          </span>
        )}
        {flight.stops === 0 && (
          <span className="bg-[#e6f7f9] text-accent rounded-pill px-2.5 py-0.5 text-[11px] font-semibold">
            Direct
          </span>
        )}
        {!cheapest && flight.stops === 0 && isQuickFlight && (
          <span className="bg-[#e6f7f9] text-accent rounded-pill px-2.5 py-0.5 text-[11px] font-semibold">
            Quick flight
          </span>
        )}
        {flight.stops === 1 && (
          <span className="bg-[#e6f7f9] text-accent rounded-pill px-2.5 py-0.5 text-[11px] font-semibold">
            1 stop
          </span>
        )}
      </div>

      {/* Airline */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-9 h-9 rounded-full icon-gradient flex items-center justify-center flex-shrink-0">
          {flight.airlineLogo ? (
            <img src={flight.airlineLogo} alt="" className="w-5 h-5 rounded" />
          ) : (
            <span className="material-symbols-outlined text-accent text-lg">airlines</span>
          )}
        </div>
        <p className="font-semibold text-on-surface text-sm">{flight.airline}</p>
      </div>

      {/* Route */}
      <div className="flex items-center gap-3 mb-4">
        <div className="text-center">
          <p className="font-semibold text-on-surface text-lg">{flight.departTime}</p>
          <p className="text-[10px] uppercase tracking-widest text-on-light-tertiary font-semibold">{flight.departure}</p>
        </div>
        <div className="flex-1 flex flex-col items-center">
          <p className="text-[10px] uppercase tracking-widest text-on-light-tertiary font-semibold mb-1">{flight.duration}</p>
          <div className="w-full h-px bg-on-light-tertiary/30 relative">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-on-light-tertiary" />
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-on-light-tertiary" />
          </div>
          <p className="text-[10px] uppercase tracking-widest text-on-light-tertiary font-semibold mt-1">
            {flight.stops === 0 ? "Nonstop" : `${flight.stops} stop${flight.stops > 1 ? "s" : ""}`}
          </p>
        </div>
        <div className="text-center">
          <p className="font-semibold text-on-surface text-lg">{flight.arriveTime}</p>
          <p className="text-[10px] uppercase tracking-widest text-on-light-tertiary font-semibold">{flight.arrival}</p>
        </div>
      </div>

      {/* Price & Add to Trip */}
      <div className="flex items-center justify-between pt-4 border-t border-on-light-tertiary/15">
        <p className="font-semibold text-accent text-[21px]">
          ${flight.price}
        </p>
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
  );
}
