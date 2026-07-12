"use client";

import type { FlightJourney, FlightResult } from "@/lib/services/flights";
import { useTripCartStore } from "@/lib/stores/tripCartStore";

function parseDurationHours(duration: string): number {
  const match = duration.match(/(\d+)h/);
  return match ? parseInt(match[1], 10) : 99;
}

function stopsLabel(stops: number): string {
  if (stops === 0) return "Nonstop";
  return `${stops} stop${stops > 1 ? "s" : ""}`;
}

function layoverHint(journey: FlightJourney): string | null {
  if (journey.stops === 0 || journey.layovers.length === 0) return null;
  if (journey.layovers.length === 1) {
    const l = journey.layovers[0];
    return `${l.duration} layover in ${l.city || l.airport}`;
  }
  return journey.layovers
    .map((l) => `${l.duration} in ${l.airport}`)
    .join(" - ");
}

function JourneyRow({ label, journey }: { label: string; journey: FlightJourney }) {
  const hint = layoverHint(journey);
  return (
    <div>
      <p className="text-[10px] uppercase tracking-widest text-ink-faint font-semibold mb-2">
        {label}
      </p>
      <div className="flex items-center gap-3">
        <div className="text-center">
          <p className="font-semibold text-ink text-lg">{journey.departTime}</p>
          <p className="text-[10px] uppercase tracking-widest text-ink-faint font-semibold">
            {journey.departure}
          </p>
        </div>
        <div className="flex-1 flex flex-col items-center">
          <p className="text-[10px] uppercase tracking-widest text-ink-faint font-semibold mb-1">
            {journey.duration}
          </p>
          <div className="w-full h-px bg-ink/15 relative">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-ink/40" />
            {journey.layovers.map((_, idx) => {
              const pct = ((idx + 1) / (journey.layovers.length + 1)) * 100;
              return (
                <div
                  key={idx}
                  className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-ink/30"
                  style={{ left: `${pct}%` }}
                />
              );
            })}
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-ink/40" />
          </div>
          <p className="text-[10px] uppercase tracking-widest text-ink-faint font-semibold mt-1">
            {stopsLabel(journey.stops)}
          </p>
        </div>
        <div className="text-center">
          <p className="font-semibold text-ink text-lg">{journey.arriveTime}</p>
          <p className="text-[10px] uppercase tracking-widest text-ink-faint font-semibold">
            {journey.arrival}
          </p>
        </div>
      </div>
      {hint && (
        <p className="text-[11px] text-ink-faint mt-1.5 pl-1">{hint}</p>
      )}
    </div>
  );
}

export default function FlightCard({ flight, cheapest }: { flight: FlightResult; cheapest: boolean }) {
  const addItem = useTripCartStore((s) => s.addItem);
  const removeItem = useTripCartStore((s) => s.removeItem);
  const added = useTripCartStore((s) => s.items.some((i) => i.id === flight.id));

  const outbound = flight.outbound;
  const ret = flight.return;
  const totalStops = outbound.stops + (ret?.stops ?? 0);
  const isDirect = totalStops === 0;
  const isQuickFlight = parseDurationHours(outbound.duration) < 4;

  const handleToggle = () => {
    if (added) {
      removeItem(flight.id);
    } else {
      addItem({
        id: flight.id,
        type: "flight",
        title: `${flight.airline} ${outbound.departure}, ${outbound.arrival}`,
        subtitle: ret
          ? `${outbound.duration} out | ${ret.duration} back | roundtrip`
          : `${outbound.departTime} | ${outbound.duration} | ${stopsLabel(outbound.stops)}`,
        price: flight.price,
        image: flight.airlineLogo,
        bookingUrl: flight.bookingUrl,
        provider: "google_flights",
        date: null,
        meta: flight as unknown as Record<string, unknown>,
      });
    }
  };

  /* The pick gets a wider berth and a reason. */
  const curatorNote = cheapest
    ? isDirect
      ? `Nonstop, ${outbound.duration} in the air, and the lowest fare on this search. This is the one.`
      : `The lowest fare on this search. ${stopsLabel(totalStops)} total, but the hours are decent.`
    : null;

  return (
    <div className={`w-full card-base p-6 relative ${cheapest ? "sm:col-span-2" : ""}`}>
      {cheapest && (
        <span className="absolute top-4 right-4 bg-raised-slate text-ink border border-line rounded-pill px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide">
          Walter&apos;s pick
        </span>
      )}

      {/* Airline */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-9 h-9 rounded-full icon-gradient flex items-center justify-center flex-shrink-0">
          {flight.airlineLogo ? (
            <img src={flight.airlineLogo} alt="" className="w-5 h-5 rounded" />
          ) : (
            <span className="material-symbols-outlined text-accent text-lg">airlines</span>
          )}
        </div>
        <p className="font-semibold text-ink text-sm">{flight.airline}</p>
        {isDirect && (
          <span className="text-[11px] text-ink-faint ml-auto">Nonstop</span>
        )}
      </div>

      {curatorNote && (
        <p className="text-body text-ink-soft leading-relaxed mb-4 max-w-[52ch]">
          {curatorNote}
        </p>
      )}

      {/* Outbound + return */}
      <div className="space-y-4 mb-4">
        <JourneyRow label="Outbound" journey={outbound} />
        {ret && <JourneyRow label="Return" journey={ret} />}
      </div>

      {/* Price & Add to Trip */}
      <div className="flex items-center justify-between pt-4 border-t border-line">
        <div>
          <p className="font-semibold text-ink text-[21px]">${flight.price}</p>
          <p className="text-[10px] uppercase tracking-widest text-ink-faint font-semibold">
            {ret ? "Roundtrip total" : "One way"}
          </p>
        </div>
        <button
          onClick={handleToggle}
          className={`rounded-pill px-4 py-2 text-sm font-semibold flex items-center gap-1.5 transition-colors ${
            added
              ? "bg-accent text-snow-off-glacier hover:bg-accent-light"
              : "border border-ink/20 text-ink hover:bg-ink/5 hover:border-ink/40"
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
