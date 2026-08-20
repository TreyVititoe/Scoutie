/*
 * Honest trip economics from a saved cart. Cart prices are what the whole
 * group pays; per-person and per-day views derive from them. The one
 * estimate is the daily food and getting-around allowance, always labeled.
 * Mirrors apps/web/lib/tripEconomics.ts.
 */

import type { SavedTrip } from "./stores/savedTripsStore";

export type TripEconomics = {
  days: number | null;
  travelers: number;
  flights: number;
  stay: number;
  fun: number;
  extras: number;
  total: number;
  perPerson: number | null;
  perDay: number | null;
  flightDuration: string | null;
  flightStops: number | null;
  tier: { label: string; blurb: string };
};

export const DAILY_EXTRAS_PER_PERSON = 60;

function daysBetween(start?: string, end?: string): number | null {
  if (!start || !end) return null;
  const ms = Date.parse(end) - Date.parse(start);
  return Number.isFinite(ms) && ms > 0
    ? Math.max(1, Math.round(ms / 86400000))
    : null;
}

export function parseDurationMin(text: string): number {
  const h = /(\d+)\s*h/.exec(text);
  const m = /(\d+)\s*m/.exec(text);
  return (h ? Number(h[1]) * 60 : 0) + (m ? Number(m[1]) : 0);
}

export function tripEconomics(trip: SavedTrip, travelers = 2): TripEconomics {
  const days = daysBetween(trip.startDate, trip.endDate) ?? trip.durationDays ?? null;

  const sum = (types: string[]) =>
    trip.items
      .filter((i) => types.includes(i.type))
      .reduce((s, i) => s + (i.price ?? 0), 0);

  const flights = sum(["flight"]);
  const stay = sum(["hotel"]);
  const fun = sum(["event", "activity", "restaurant", "site"]);
  const extras = days ? days * travelers * DAILY_EXTRAS_PER_PERSON : 0;
  const total = flights + stay + fun + extras;

  const perPerson = travelers > 0 ? Math.round(total / travelers) : null;
  const perDay = days ? Math.round(total / days) : null;

  let flightDuration: string | null = null;
  let flightStops: number | null = null;
  const flight = trip.items.find((i) => i.type === "flight");
  if (flight) {
    const meta = flight.meta as
      | { outbound?: { duration?: string; stops?: number } }
      | undefined;
    if (meta?.outbound?.duration) {
      flightDuration = meta.outbound.duration;
      flightStops =
        typeof meta.outbound.stops === "number" ? meta.outbound.stops : null;
    } else {
      const m = /(\d+h(?:\s*\d+m)?)/.exec(flight.subtitle || "");
      if (m) flightDuration = m[1];
    }
  }

  const ppd = days && travelers > 0 ? total / days / travelers : null;
  const blurb =
    ppd != null
      ? `About $${Math.round(ppd)} per person per day, with a $${DAILY_EXTRAS_PER_PERSON}/day food and getting-around allowance built in.`
      : "Add dates to this trip for the per-day picture.";
  const tier =
    ppd == null
      ? { label: "Needs dates", blurb }
      : ppd < 125
        ? { label: "Budget-friendly", blurb }
        : ppd < 250
          ? { label: "Comfortable", blurb }
          : { label: "Premium", blurb };

  return {
    days,
    travelers,
    flights,
    stay,
    fun,
    extras,
    total,
    perPerson,
    perDay,
    flightDuration,
    flightStops,
    tier,
  };
}
