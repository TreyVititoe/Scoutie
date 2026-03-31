import type { ScoutEvent } from "@/lib/types";

const BASE_URL = "https://app.ticketmaster.com/discovery/v2";

// Clean city name for better Ticketmaster API matching
function cleanCityName(destination: string): string {
  return destination
    .replace(/,.*$/, "") // Remove ", State" or ", Country" suffix
    .trim();
}

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
};

// Lifestyle interests that don't map directly to TM categories
// but can still surface good results via keyword search
export const LIFESTYLE_KEYWORDS: Record<string, string> = {
  food: "food festival culinary",
  wine: "wine tasting vineyard",
  "craft beer": "craft beer brewery festival",
  wellness: "yoga wellness retreat",
  art: "art gallery exhibition",
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
  sales?: { public?: { startDateTime?: string } };
  pleaseNote?: string;
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
    category: (classification?.segment?.name !== "Undefined" ? classification?.segment?.name : null) ?? classification?.genre?.name ?? "Event",
    url: e.url ?? "#",
    priceMin: e.priceRanges?.[0]?.min ?? null,
    priceMax: e.priceRanges?.[0]?.max ?? null,
    popularity: Math.random() * 100, // TM doesn't expose popularity directly; replace with real signal if available
  };
}

export async function fetchEventsByKeyword(
  destination: string,
  startDate: string,
  endDate: string,
  keyword: string,
  size = 10
): Promise<ScoutEvent[]> {
  const apiKey = process.env.TICKETMASTER_API_KEY;
  if (!apiKey) throw new Error("TICKETMASTER_API_KEY not set");

  const city = cleanCityName(destination);
  const params = new URLSearchParams({
    apikey: apiKey,
    city,
    keyword,
    startDateTime: `${startDate}T00:00:00Z`,
    endDateTime: `${endDate}T23:59:59Z`,
    size: String(size),
    sort: "date,asc",
  });

  const res = await fetch(`${BASE_URL}/events.json?${params}`);
  if (!res.ok) return [];

  const data = await res.json();
  const events: TMEvent[] = data._embedded?.events ?? [];
  return events.map(parseTMEvent);
}

export async function fetchTopEventsInArea(
  destination: string,
  startDate: string,
  endDate: string,
  size = 8
): Promise<ScoutEvent[]> {
  const apiKey = process.env.TICKETMASTER_API_KEY;
  if (!apiKey) throw new Error("TICKETMASTER_API_KEY not set");

  const city = cleanCityName(destination);
  const params = new URLSearchParams({
    apikey: apiKey,
    city,
    startDateTime: `${startDate}T00:00:00Z`,
    endDateTime: `${endDate}T23:59:59Z`,
    size: String(size),
    sort: "relevance,desc",
  });

  const res = await fetch(`${BASE_URL}/events.json?${params}`);
  if (!res.ok) return [];

  const data = await res.json();
  const events: TMEvent[] = data._embedded?.events ?? [];
  return events.map(parseTMEvent);
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

    const lifestyle = LIFESTYLE_KEYWORDS[vibe.toLowerCase()];
    if (lifestyle) {
      lifestyle.split(" ").forEach((k) => allKeywords.add(k));
    }
  }

  for (const interest of expandedInterests) {
    allKeywords.add(interest);
  }

  if (allKeywords.size === 0) return [];

  // Fetch in parallel for top 3 keyword groups
  const keywordList = Array.from(allKeywords).slice(0, 3);
  const results = await Promise.all(
    keywordList.map((kw) =>
      fetchEventsByKeyword(destination, startDate, endDate, kw, 5)
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
