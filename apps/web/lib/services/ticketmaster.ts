import type { ScoutEvent } from "@/lib/types";

const BASE_URL = "https://app.ticketmaster.com/discovery/v2";

// Map our vibe keywords to Ticketmaster segment/genre names
export const VIBE_TO_TM_KEYWORDS: Record<string, string[]> = {
  music: ["Music"],
  concerts: ["Music"],
  sports: ["Sports"],
  comedy: ["Comedy", "Arts & Theatre"],
  arts: ["Arts & Theatre"],
  culture: ["Arts & Theatre", "Film"],
  food: ["Miscellaneous"],
  nightlife: ["Music", "Comedy"],
  adventure: ["Sports", "Miscellaneous"],
  family: ["Family", "Arts & Theatre"],
  festival: ["Music", "Arts & Theatre"],
  theater: ["Arts & Theatre"],
  wine: ["Arts & Theatre", "Music"],
  "craft beer": ["Comedy", "Music"],
  nature: ["Sports", "Miscellaneous"],
  "live events": ["Music", "Sports", "Arts & Theatre"],
  photography: ["Arts & Theatre"],
  "beach": ["Miscellaneous"],
};

type TMEvent = {
  id: string;
  name: string;
  images?: { url: string; ratio?: string }[];
  dates?: {
    start?: { localDate?: string; localTime?: string };
  };
  _embedded?: {
    venues?: {
      name?: string;
      city?: { name?: string };
    }[];
  };
  classifications?: {
    segment?: { name?: string };
    genre?: { name?: string };
  }[];
  url?: string;
  priceRanges?: { min?: number; max?: number }[];
};

function parseTMEvent(e: TMEvent): ScoutEvent {
  const venue = e._embedded?.venues?.[0];
  const classification = e.classifications?.[0];
  const images = e.images ?? [];
  const heroImage =
    images.find((i) => i.ratio === "16_9" && i.url.includes("LARGE"))?.url ||
    images.find((i) => i.ratio === "16_9")?.url ||
    images[0]?.url ||
    null;

  return {
    id: e.id,
    name: e.name,
    image: heroImage,
    date: e.dates?.start?.localDate ?? "",
    time: e.dates?.start?.localTime ?? null,
    venueName: venue?.name ?? "TBD",
    venueCity: venue?.city?.name ?? "",
    category:
      (classification?.segment?.name !== "Undefined"
        ? classification?.segment?.name
        : null) ??
      classification?.genre?.name ??
      "Event",
    url: e.url ?? "#",
    priceMin: e.priceRanges?.[0]?.min ?? null,
    priceMax: e.priceRanges?.[0]?.max ?? null,
    popularity: Math.random() * 100,
  };
}

/**
 * Geocode a destination to lat/lng via Mapbox for radius-based search.
 */
async function geocodeDestination(
  destination: string
): Promise<{ lat: number; lng: number } | null> {
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
  if (!token) return null;

  try {
    const res = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
        destination
      )}.json?access_token=${token}&limit=1&types=place,locality`
    );
    if (!res.ok) return null;
    const data = await res.json();
    const coords = data.features?.[0]?.center;
    if (!coords) return null;
    return { lng: coords[0], lat: coords[1] };
  } catch {
    return null;
  }
}

/**
 * Build Ticketmaster search params with latlong radius instead of city name.
 */
async function buildLocationParams(
  destination: string
): Promise<Record<string, string>> {
  // Try geocoding first for radius search (catches small cities near big ones)
  const coords = await geocodeDestination(destination);
  if (coords) {
    return {
      latlong: `${coords.lat},${coords.lng}`,
      radius: "30",
      unit: "miles",
    };
  }
  // Fallback to city name
  const city = destination.split(",")[0].trim();
  return { city };
}

export async function fetchEventsByKeyword(
  destination: string,
  startDate: string,
  endDate: string,
  keyword: string,
  locationParams: Record<string, string>,
  size = 10
): Promise<ScoutEvent[]> {
  const apiKey = process.env.TICKETMASTER_API_KEY;
  if (!apiKey) return [];

  const params = new URLSearchParams({
    apikey: apiKey,
    ...locationParams,
    keyword,
    startDateTime: `${startDate}T00:00:00Z`,
    endDateTime: `${endDate}T23:59:59Z`,
    size: String(size),
    sort: "date,asc",
  });

  try {
    const res = await fetch(`${BASE_URL}/events.json?${params}`);
    if (!res.ok) return [];
    const data = await res.json();
    return (data._embedded?.events ?? []).map(parseTMEvent);
  } catch {
    return [];
  }
}

export async function fetchTopEventsInArea(
  destination: string,
  startDate: string,
  endDate: string,
  size = 40
): Promise<ScoutEvent[]> {
  const apiKey = process.env.TICKETMASTER_API_KEY;
  if (!apiKey) return [];

  const locationParams = await buildLocationParams(destination);
  const params = new URLSearchParams({
    apikey: apiKey,
    ...locationParams,
    startDateTime: `${startDate}T00:00:00Z`,
    endDateTime: `${endDate}T23:59:59Z`,
    size: String(size),
    sort: "relevance,desc",
  });

  try {
    const res = await fetch(`${BASE_URL}/events.json?${params}`);
    if (!res.ok) return [];
    const data = await res.json();
    return (data._embedded?.events ?? []).map(parseTMEvent);
  } catch {
    return [];
  }
}

export async function fetchEventsByVibes(
  destination: string,
  startDate: string,
  endDate: string,
  vibes: string[],
  expandedInterests: string[]
): Promise<ScoutEvent[]> {
  const allKeywords = new Set<string>();

  for (const vibe of vibes) {
    const mapped = VIBE_TO_TM_KEYWORDS[vibe.toLowerCase()] ?? [];
    mapped.forEach((k) => allKeywords.add(k));
  }

  for (const interest of expandedInterests) {
    allKeywords.add(interest);
  }

  if (allKeywords.size === 0) {
    // No specific vibes — just search for general events
    allKeywords.add("Music");
    allKeywords.add("Sports");
  }

  // Geocode once, reuse for all keyword searches
  const locationParams = await buildLocationParams(destination);

  // Fetch in parallel for top keyword groups
  const keywordList = Array.from(allKeywords).slice(0, 6);
  const results = await Promise.all(
    keywordList.map((kw) =>
      fetchEventsByKeyword(destination, startDate, endDate, kw, locationParams, 25)
    )
  );

  // Deduplicate by event id
  const seen = new Set<string>();
  const all: ScoutEvent[] = [];
  for (const batch of results) {
    for (const event of batch) {
      if (!seen.has(event.id)) {
        seen.add(event.id);
        all.push(event);
      }
    }
  }

  return all;
}
