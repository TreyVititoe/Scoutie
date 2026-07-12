/**
 * Typed wrappers around the Walter Next.js API routes.
 *
 * Mobile (or any non-Next consumer) calls `configureApiClient({ baseUrl })`
 * once at boot, then uses `api.flights.search(...)` etc.
 *
 * Web can call the same wrappers with `baseUrl: ""` (default) — fetch will
 * resolve relative paths against the current origin.
 */

import type {
  Flight,
  Hotel,
  ScoredEvent,
  Suggestion,
  TripPrefs,
} from "@walter/shared";

let baseUrl = "";

export function configureApiClient(opts: { baseUrl: string }) {
  baseUrl = opts.baseUrl.replace(/\/$/, "");
}

export function getApiBaseUrl() {
  return baseUrl;
}

async function post<T>(path: string, body: unknown): Promise<T> {
  const resp = await fetch(`${baseUrl}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!resp.ok) {
    const text = await resp.text().catch(() => "");
    throw new Error(`POST ${path} failed: ${resp.status} ${text}`);
  }
  return resp.json() as Promise<T>;
}

export type FlightSearchInput = {
  origin: string;
  destination: string;
  departDate: string;
  returnDate: string;
  adults?: number;
  cabinClass?: "economy" | "premium_economy" | "business" | "first";
};

export type HotelSearchInput = {
  destination: string;
  checkIn: string;
  checkOut: string;
  adults?: number;
  rooms?: number;
  stayType?: "hotel" | "vacation_rental" | "hostel";
};

export type EventSearchInput = {
  destination: string;
  startDate: string;
  endDate: string;
  vibes?: string[];
  /** Free-text "what you love" answer; expanded into event keywords. */
  description?: string;
};

export type SuggestionInput = {
  destination: string;
  startDate: string;
  endDate: string;
  interests?: string[];
  travelers?: number;
  travelerType?: string;
  /** Free-text "what you love" answer; folded into the interests. */
  description?: string;
};

export type CompareInput = TripPrefs;

export type CompareTripTier = {
  tier: "comfortable" | "balanced" | "ambitious";
  title: string;
  destination: string;
  summary: string;
  totalCost: number;
  highlights: string[];
  /** Real Ticketmaster events happening there during the dates. */
  events?: string[];
  image?: string;
};

export type PackingItem = { name: string; quantity: number; essential: boolean };
export type PackingCategory = { name: string; items: PackingItem[] };

export const api = {
  flights: {
    search: (input: FlightSearchInput) =>
      post<{ flights: Flight[] }>("/api/flights", input),
  },
  hotels: {
    search: (input: HotelSearchInput) =>
      post<{ hotels: Hotel[] }>("/api/hotels", input),
  },
  events: {
    search: (input: EventSearchInput) =>
      post<{
        exactMatches: ScoredEvent[];
        similarMatches: ScoredEvent[];
        topInArea: ScoredEvent[];
      }>("/api/search", input),
  },
  suggestions: {
    generate: (input: SuggestionInput) =>
      post<{ suggestions: Suggestion[] }>("/api/suggestions", input),
  },
  compare: {
    generate: (input: CompareInput) =>
      post<{ trips: CompareTripTier[] }>("/api/compare", input),
  },
  packingList: {
    generate: (input: {
      destination: string;
      startDate: string;
      endDate: string;
      activities: string[];
      pace: string;
      travelers: number;
    }) => post<{ categories: PackingCategory[] }>("/api/packing-list", input),
  },
  photo: {
    /** Returns the proxied photo URL (Next route handles redirect + cache). */
    url: (query: string) =>
      `${baseUrl}/api/photo?query=${encodeURIComponent(query)}`,
  },
  trips: {
    /** Creates a public shared trip; link is `<origin>/shared/<slug>`. */
    share: (input: {
      title: string;
      destination: string;
      totalCost: number;
      items: unknown[];
    }) => post<{ shareSlug: string }>("/api/trips/share", input),
  },
  affiliate: {
    /** Fire-and-forget click tracking; never throws. */
    click: (input: {
      tripId?: string;
      provider: string;
      itemType?: string;
      destinationUrl: string;
    }) =>
      post<{ ok: boolean }>("/api/affiliate/click", input).catch(() => ({
        ok: false,
      })),
  },
};

export type WalterApi = typeof api;
