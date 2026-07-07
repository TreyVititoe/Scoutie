import { NextRequest, NextResponse } from "next/server";
import { fetchEventsByVibes, fetchTopEventsInArea } from "@/lib/services/ticketmaster";
import { scoreAndBucket } from "@/lib/services/scoring";
import {
  rateLimit,
  cleanString,
  cleanStringArray,
  isReasonableDate,
} from "@/lib/apiGuard";
import { cacheKey, cacheGet, cacheSet } from "@/lib/searchCache";

export const maxDuration = 30;

export async function POST(req: NextRequest) {
  const limited = rateLimit(req, { name: "events", limit: 30 });
  if (limited) return limited;

  try {
    const body = await req.json();
    const destination = cleanString(body?.destination, 80);
    const { startDate, endDate } = body ?? {};
    const vibes = cleanStringArray(body?.vibes, 10, 40);

    if (
      !destination ||
      !isReasonableDate(startDate) ||
      !isReasonableDate(endDate)
    ) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const key = cacheKey("events", { destination, startDate, endDate, vibes });
    const cached = cacheGet<Record<string, unknown>>(key);
    if (cached) return NextResponse.json(cached);

    // Fetch events from Ticketmaster in parallel — skip Claude expansion to keep it fast
    const [vibeEvents, topAreaEvents] = await Promise.all([
      fetchEventsByVibes(destination, startDate, endDate, vibes, []),
      fetchTopEventsInArea(destination, startDate, endDate),
    ]);

    // Score and bucket
    const { exactMatches, similarMatches, topInArea } = scoreAndBucket(
      vibeEvents,
      topAreaEvents,
      vibes,
      [],
      startDate,
      endDate
    );

    const payload = { exactMatches, similarMatches, topInArea };
    if (exactMatches.length + similarMatches.length + topInArea.length > 0) {
      cacheSet(key, payload);
    }
    return NextResponse.json(payload);
  } catch (err) {
    console.error("[/api/search]", err);
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}
