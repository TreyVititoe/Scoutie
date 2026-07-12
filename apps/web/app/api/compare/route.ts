import { NextRequest, NextResponse } from "next/server";
import { generateCompareTrips } from "@/lib/services/claude";
import { rateLimit, readJsonCapped } from "@/lib/apiGuard";
import { fetchTopEventsInArea } from "@/lib/services/ticketmaster";

export const maxDuration = 300;

export async function POST(req: NextRequest) {
  const limited = rateLimit(req, { name: "compare", limit: 10 });
  if (limited) return limited;

  try {
    const parsed = await readJsonCapped(req);
    if ("errorResponse" in parsed) return parsed.errorResponse;
    const quizData = parsed.body as Parameters<typeof generateCompareTrips>[0];
    /* A chosen destination means three takes on THAT place; only a truly
     * empty search is "surprise me" with three different cities. */
    if (!quizData.destinations?.length && quizData.destination) {
      quizData.destinations = [quizData.destination];
    }
    const result = (await generateCompareTrips(quizData)) as {
      trips?: Record<string, unknown>[];
    };

    /* Claude's raw shape (totalEstimatedCost, no tier) crashed the app;
     * normalize to the CompareTripTier contract, cheapest tier first. */
    const TIERS = ["comfortable", "balanced", "ambitious"] as const;
    const cost = (t: Record<string, unknown>) =>
      Number(t.totalEstimatedCost ?? t.totalCost ?? 0) || 0;
    const trips = (result?.trips ?? [])
      .slice(0, 3)
      .sort((a, b) => cost(a) - cost(b))
      .map((t, i) => ({
        tier: TIERS[Math.min(i, TIERS.length - 1)],
        title: String(t.title ?? t.destination ?? "Trip option"),
        destination: String(t.destination ?? ""),
        summary: String(t.summary ?? ""),
        totalCost: cost(t),
        highlights: Array.isArray(t.highlights) ? (t.highlights as string[]) : [],
        events: [] as string[],
      }));

    /* Real events happening there during the dates, when dates exist. */
    const q = quizData as { startDate?: string | null; endDate?: string | null };
    if (q.startDate && q.endDate) {
      await Promise.all(
        trips.map(async (trip) => {
          if (!trip.destination) return;
          try {
            const evs = await fetchTopEventsInArea(trip.destination, q.startDate!, q.endDate!, 8);
            trip.events = [...new Set(evs.map((e) => e.name))].slice(0, 3);
          } catch {
            /* the card just goes without */
          }
        })
      );
    }

    return NextResponse.json({ trips });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[/api/compare]", message);
    return NextResponse.json(
      { error: `Comparison generation failed: ${message}` },
      { status: 500 }
    );
  }
}
