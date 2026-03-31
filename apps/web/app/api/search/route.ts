import { NextRequest, NextResponse } from "next/server";
import { fetchEventsByVibes, fetchTopEventsInArea } from "@/lib/services/ticketmaster";
import { scoreAndBucket } from "@/lib/services/scoring";
import { expandInterests, generateTripSummary } from "@/lib/services/claude";
import type { TripPrefs, SearchResults } from "@/lib/types";

export async function POST(req: NextRequest) {
  try {
    const prefs: TripPrefs = await req.json();

    if (!prefs.destination || !prefs.startDate || !prefs.endDate) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // 1. Expand interests with Claude
    const expandedInterests = await expandInterests(prefs.vibes);

    // 2. Fetch events from Ticketmaster (in parallel)
    const [vibeEvents, topAreaEvents] = await Promise.all([
      fetchEventsByVibes(
        prefs.destination,
        prefs.startDate,
        prefs.endDate,
        prefs.vibes,
        expandedInterests
      ),
      fetchTopEventsInArea(prefs.destination, prefs.startDate, prefs.endDate),
    ]);

    // 3. Score and bucket
    const { exactMatches, similarMatches, topInArea } = scoreAndBucket(
      vibeEvents,
      topAreaEvents,
      prefs.vibes,
      expandedInterests,
      prefs.startDate,
      prefs.endDate
    );

    // 4. Generate AI summary
    const allEvents = [...exactMatches, ...similarMatches, ...topInArea];
    const aiSummary = await generateTripSummary({
      destination: prefs.destination,
      vibes: prefs.vibes,
      budget: prefs.budget,
      travelers: prefs.travelers,
      travelersType: prefs.travelersType,
      eventCount: allEvents.length,
      topEvents: exactMatches.slice(0, 3).map((e) => e.name),
    });

    const results: SearchResults = {
      exactMatches,
      similarMatches,
      topInArea,
      expandedInterests,
      aiSummary,
    };

    return NextResponse.json(results);
  } catch (err) {
    console.error("[/api/search]", err);
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}
