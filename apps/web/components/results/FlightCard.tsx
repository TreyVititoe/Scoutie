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
    <div className="min-w-[300px] w-[300px] flex-shrink-0 card-3d rounded-[2rem] p-6 cursor-pointer group">
      {/* Tags */}
      <div className="flex items-center gap-2 mb-4">
        {cheapest && (
          <span className="text-[10px] font-bold uppercase tracking-widest bg-secondary-container text-on-secondary-container px-2.5 py-1 rounded-full font-body">
            Best price
          </span>
        )}
        {flight.stops === 0 && (
          <span className="text-[10px] font-bold uppercase tracking-widest bg-primary/10 text-primary px-2.5 py-1 rounded-full font-body">
            Direct
          </span>
        )}
      </div>

      {/* Airline */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-9 h-9 rounded-full bg-teal-50 flex items-center justify-center flex-shrink-0">
          {flight.airlineLogo ? (
            <img src={flight.airlineLogo} alt="" className="w-5 h-5 rounded" />
          ) : (
            <span className="material-symbols-outlined text-teal-600 text-lg">airlines</span>
          )}
        </div>
        <p className="font-headline font-bold text-on-surface text-sm">{flight.airline}</p>
      </div>

      {/* Route */}
      <div className="flex items-center gap-3 mb-4">
        <div className="text-center">
          <p className="font-headline font-bold text-on-surface text-lg">{flight.departTime}</p>
          <p className="text-[10px] uppercase tracking-widest text-outline-variant font-bold font-body">{flight.departure}</p>
        </div>
        <div className="flex-1 flex flex-col items-center">
          <p className="text-[10px] uppercase tracking-widest text-outline-variant font-bold font-body mb-1">{flight.duration}</p>
          <div className="w-full h-px bg-outline-variant/30 relative">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-outline-variant" />
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-outline-variant" />
          </div>
          <p className="text-[10px] uppercase tracking-widest text-outline-variant font-bold font-body mt-1">
            {flight.stops === 0 ? "Nonstop" : `${flight.stops} stop${flight.stops > 1 ? "s" : ""}`}
          </p>
        </div>
        <div className="text-center">
          <p className="font-headline font-bold text-on-surface text-lg">{flight.arriveTime}</p>
          <p className="text-[10px] uppercase tracking-widest text-outline-variant font-bold font-body">{flight.arrival}</p>
        </div>
      </div>

      {/* Price & Book */}
      <div className="flex items-center justify-between pt-4 border-t border-outline-variant/15">
        <p className="font-headline font-black text-primary text-xl">${flight.price}</p>
        <button
          onClick={handleBook}
          className="btn-primary-gradient rounded-full px-5 py-2 text-sm font-bold font-headline"
        >
          Book
        </button>
      </div>
    </div>
  );
}
