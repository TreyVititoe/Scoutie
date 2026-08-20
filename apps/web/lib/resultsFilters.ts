/*
 * Client-side filtering for the /results panels. Everything here is pure:
 * the page owns the state, these functions turn (results, filters) into
 * the list to render. Distances are haversine against the geocoded city
 * center or against event venues.
 */

import type { FlightResult } from "@/lib/services/flights";
import type { HotelResult } from "@/lib/services/hotels";
import type { ScoredEvent, Suggestion } from "@/lib/types";

export type LatLng = { lat: number; lng: number };

export type FlightFilters = {
  stops: "any" | "nonstop" | "one";
  airlines: string[]; // empty = all airlines
  maxPrice: number | null;
  maxDurationH: number | null;
  sort: "best" | "cheapest" | "fastest" | "earliest";
};

export type HotelFilters = {
  maxNight: number | null;
  minRating: number | null; // Booking 10-point scale
  maxCenterKm: number | null;
  nearEventsKm: number | null; // within X km of at least one event
  sort: "value" | "cheapest" | "rating" | "closest";
};

export type EventFilters = {
  category: string | null;
  maxPrice: number | null;
  maxCenterKm: number | null;
  sort: "match" | "date" | "price" | "closest";
};

export type PickFilters = {
  type: "all" | "activity" | "restaurant" | "site";
  maxCost: number | null;
};

export const defaultFlightFilters: FlightFilters = {
  stops: "any",
  airlines: [],
  maxPrice: null,
  maxDurationH: null,
  sort: "best",
};

export const defaultHotelFilters: HotelFilters = {
  maxNight: null,
  minRating: null,
  maxCenterKm: null,
  nearEventsKm: null,
  sort: "value",
};

export const defaultEventFilters: EventFilters = {
  category: null,
  maxPrice: null,
  maxCenterKm: null,
  sort: "match",
};

export const defaultPickFilters: PickFilters = { type: "all", maxCost: null };

export function haversineKm(a: LatLng, b: LatLng): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a.lat * Math.PI) / 180) *
      Math.cos((b.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}

/** "5h 20m" -> 320. Unparseable durations return null (never filtered out). */
export function parseDurationMin(text: string): number | null {
  const h = /(\d+)\s*h/.exec(text);
  const m = /(\d+)\s*m/.exec(text);
  if (!h && !m) return null;
  return (h ? Number(h[1]) * 60 : 0) + (m ? Number(m[1]) : 0);
}

export function airlinesIn(flights: FlightResult[]): string[] {
  const seen = new Map<string, number>();
  for (const f of flights) {
    if (f.airline) seen.set(f.airline, (seen.get(f.airline) ?? 0) + 1);
  }
  return [...seen.entries()].sort((a, b) => b[1] - a[1]).map(([name]) => name);
}

export function applyFlightFilters(
  flights: FlightResult[],
  f: FlightFilters
): FlightResult[] {
  const out = flights.filter((fl) => {
    if (f.stops === "nonstop" && fl.outbound.stops !== 0) return false;
    if (f.stops === "one" && fl.outbound.stops > 1) return false;
    if (f.airlines.length && !f.airlines.includes(fl.airline)) return false;
    if (f.maxPrice != null && fl.price > f.maxPrice) return false;
    if (f.maxDurationH != null) {
      const min = parseDurationMin(fl.outbound.duration);
      if (min != null && min > f.maxDurationH * 60) return false;
    }
    return true;
  });
  const durationOf = (fl: FlightResult) =>
    parseDurationMin(fl.outbound.duration) ?? Number.MAX_SAFE_INTEGER;
  if (f.sort === "cheapest") out.sort((a, b) => a.price - b.price);
  else if (f.sort === "fastest")
    out.sort((a, b) => durationOf(a) - durationOf(b));
  else if (f.sort === "earliest")
    out.sort((a, b) =>
      (a.outbound.departTime || "").localeCompare(b.outbound.departTime || "")
    );
  return out;
}

function hotelPoint(h: HotelResult): LatLng | null {
  return h.latitude != null && h.longitude != null
    ? { lat: h.latitude, lng: h.longitude }
    : null;
}

export function eventPoints(events: ScoredEvent[]): LatLng[] {
  const pts: LatLng[] = [];
  for (const ev of events) {
    if (ev.venueLat != null && ev.venueLng != null) {
      pts.push({ lat: ev.venueLat, lng: ev.venueLng });
    }
  }
  return pts;
}

export function applyHotelFilters(
  hotels: HotelResult[],
  f: HotelFilters,
  center: LatLng | null,
  events: LatLng[]
): HotelResult[] {
  const out = hotels.filter((h) => {
    if (f.maxNight != null && h.pricePerNight > f.maxNight) return false;
    if (f.minRating != null && h.rating < f.minRating) return false;
    const pt = hotelPoint(h);
    if (f.maxCenterKm != null && center) {
      /* Hotels without coordinates stay visible; hiding them would read
       * as "far away" when the truth is "unknown". */
      if (pt && haversineKm(pt, center) > f.maxCenterKm) return false;
    }
    if (f.nearEventsKm != null && events.length) {
      if (!pt) return false;
      const near = events.some((e) => haversineKm(pt, e) <= f.nearEventsKm!);
      if (!near) return false;
    }
    return true;
  });
  const centerDist = (h: HotelResult) => {
    const pt = hotelPoint(h);
    return pt && center ? haversineKm(pt, center) : Number.MAX_SAFE_INTEGER;
  };
  if (f.sort === "cheapest")
    out.sort((a, b) => a.pricePerNight - b.pricePerNight);
  else if (f.sort === "rating") out.sort((a, b) => b.rating - a.rating);
  else if (f.sort === "closest")
    out.sort((a, b) => centerDist(a) - centerDist(b));
  return out;
}

export function eventCategories(events: ScoredEvent[]): string[] {
  const seen = new Map<string, number>();
  for (const ev of events) {
    if (ev.category) seen.set(ev.category, (seen.get(ev.category) ?? 0) + 1);
  }
  return [...seen.entries()].sort((a, b) => b[1] - a[1]).map(([name]) => name);
}

export function applyEventFilters(
  events: ScoredEvent[],
  f: EventFilters,
  center: LatLng | null
): ScoredEvent[] {
  const out = events.filter((ev) => {
    if (f.category && ev.category !== f.category) return false;
    if (f.maxPrice != null && ev.priceMin != null && ev.priceMin > f.maxPrice)
      return false;
    if (f.maxCenterKm != null && center) {
      if (
        ev.venueLat != null &&
        ev.venueLng != null &&
        haversineKm({ lat: ev.venueLat, lng: ev.venueLng }, center) >
          f.maxCenterKm
      )
        return false;
    }
    return true;
  });
  const centerDist = (ev: ScoredEvent) =>
    ev.venueLat != null && ev.venueLng != null && center
      ? haversineKm({ lat: ev.venueLat, lng: ev.venueLng }, center)
      : Number.MAX_SAFE_INTEGER;
  if (f.sort === "date") out.sort((a, b) => a.date.localeCompare(b.date));
  else if (f.sort === "price")
    out.sort((a, b) => (a.priceMin ?? 0) - (b.priceMin ?? 0));
  else if (f.sort === "closest")
    out.sort((a, b) => centerDist(a) - centerDist(b));
  return out;
}

export function applyPickFilters(
  picks: Suggestion[],
  f: PickFilters
): Suggestion[] {
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
    const d = defaults[key];
    if (Array.isArray(v)) {
      if (v.length) n++;
    } else if (v !== d) n++;
  }
  return n;
}
