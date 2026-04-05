import { NextRequest, NextResponse } from "next/server";
import { fetchEventsByVibes, fetchTopEventsInArea } from "@/lib/services/ticketmaster";
import { scoreAndBucket } from "@/lib/services/scoring";

export const maxDuration = 30;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const destination = body.destination as string;
    const startDate = body.startDate as string;
    const endDate = body.endDate as string;
    const vibes = (body.vibes as string[]) || [];

    if (!destination || !startDate || !endDate) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

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

    return NextResponse.json({
      exactMatches,
      similarMatches,
      topInArea,
    });
  } catch (err) {
    console.error("[/api/search]", err);
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}
