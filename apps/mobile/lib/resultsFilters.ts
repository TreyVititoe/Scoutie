/*
 * Client-side filters for the results screen. Structural typings so the
 * api-client's concrete result types flow through unchanged.
 */

export type FlightLike = {
  id: string;
  airline: string;
  price: number;
  outbound: { stops: number; duration: string; departTime?: string };
};

export type HotelLike = {
  id: string;
  rating: number;
  pricePerNight: number;
};

export type EventLike = {
  id: string;
  category: string;
  date: string;
  priceMin: number | null;
};

export type PickLike = {
  id: string;
  type: string;
  estimatedCost: number | null;
};

export type FlightFilters = {
  stops: "any" | "nonstop" | "one";
  airlines: string[];
  maxPrice: number | null;
  sort: "best" | "cheapest" | "fastest";
};

export type HotelFilters = {
  maxNight: number | null;
  minRating: number | null;
  sort: "value" | "cheapest" | "rating";
};

export type EventFilters = {
  category: string | null;
  maxPrice: number | null;
  sort: "match" | "date" | "price";
};

export type PickFilters = {
  type: "all" | "activity" | "restaurant" | "site";
  maxCost: number | null;
};

export const defaultFlightFilters: FlightFilters = {
  stops: "any",
  airlines: [],
  maxPrice: null,
  sort: "best",
};
export const defaultHotelFilters: HotelFilters = {
  maxNight: null,
  minRating: null,
  sort: "value",
};
export const defaultEventFilters: EventFilters = {
  category: null,
  maxPrice: null,
  sort: "match",
};
export const defaultPickFilters: PickFilters = { type: "all", maxCost: null };

/** "5h 20m" -> 320. Unparseable durations return null (never filtered out). */
export function parseDurationMin(text: string): number | null {
  const h = /(\d+)\s*h/.exec(text);
  const m = /(\d+)\s*m/.exec(text);
  if (!h && !m) return null;
  return (h ? Number(h[1]) * 60 : 0) + (m ? Number(m[1]) : 0);
}

export function airlinesIn(flights: FlightLike[]): string[] {
  const seen = new Map<string, number>();
  for (const f of flights) {
    if (f.airline) seen.set(f.airline, (seen.get(f.airline) ?? 0) + 1);
  }
  return [...seen.entries()].sort((a, b) => b[1] - a[1]).map(([name]) => name);
}

export function applyFlightFilters<T extends FlightLike>(
  flights: T[],
  f: FlightFilters
): T[] {
  const out = flights.filter((fl) => {
    if (f.stops === "nonstop" && fl.outbound.stops !== 0) return false;
    if (f.stops === "one" && fl.outbound.stops > 1) return false;
    if (f.airlines.length && !f.airlines.includes(fl.airline)) return false;
    if (f.maxPrice != null && fl.price > f.maxPrice) return false;
    return true;
  });
  const durationOf = (fl: T) =>
    parseDurationMin(fl.outbound.duration) ?? Number.MAX_SAFE_INTEGER;
  if (f.sort === "cheapest") out.sort((a, b) => a.price - b.price);
  else if (f.sort === "fastest")
    out.sort((a, b) => durationOf(a) - durationOf(b));
  return out;
}

export function applyHotelFilters<T extends HotelLike>(
  hotels: T[],
  f: HotelFilters
): T[] {
  const out = hotels.filter((h) => {
    if (f.maxNight != null && h.pricePerNight > f.maxNight) return false;
    if (f.minRating != null && h.rating < f.minRating) return false;
    return true;
  });
  if (f.sort === "cheapest")
    out.sort((a, b) => a.pricePerNight - b.pricePerNight);
  else if (f.sort === "rating") out.sort((a, b) => b.rating - a.rating);
  return out;
}

export function eventCategories(events: EventLike[]): string[] {
  const seen = new Map<string, number>();
  for (const ev of events) {
    if (ev.category) seen.set(ev.category, (seen.get(ev.category) ?? 0) + 1);
  }
  return [...seen.entries()].sort((a, b) => b[1] - a[1]).map(([name]) => name);
}

export function applyEventFilters<T extends EventLike>(
  events: T[],
  f: EventFilters
): T[] {
  const out = events.filter((ev) => {
    if (f.category && ev.category !== f.category) return false;
    if (f.maxPrice != null && ev.priceMin != null && ev.priceMin > f.maxPrice)
      return false;
    return true;
  });
  if (f.sort === "date") out.sort((a, b) => a.date.localeCompare(b.date));
  else if (f.sort === "price")
    out.sort((a, b) => (a.priceMin ?? 0) - (b.priceMin ?? 0));
  return out;
}

export function applyPickFilters<T extends PickLike>(
  picks: T[],
  f: PickFilters
): T[] {
  return picks.filter((p) => {
    if (f.type !== "all" && p.type !== f.type) return false;
    if (
      f.maxCost != null &&
      p.estimatedCost != null &&
      p.estimatedCost > f.maxCost
    )
      return false;
    return true;
  });
}

export function countActive(
  filters: Record<string, unknown>,
  defaults: Record<string, unknown>
): number {
  let n = 0;
  for (const key of Object.keys(defaults)) {
    if (key === "sort") continue;
    const v = filters[key];
    if (Array.isArray(v)) {
      if (v.length) n++;
    } else if (v !== defaults[key]) n++;
  }
  return n;
}
