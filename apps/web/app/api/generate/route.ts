import { NextRequest, NextResponse } from "next/server";
import { generateTrips } from "@/lib/services/claude";
import { rateLimit, readJsonCapped } from "@/lib/apiGuard";
import { fetchTopEventsInArea } from "@/lib/services/ticketmaster";

export const maxDuration = 300;

export async function POST(req: NextRequest) {
  const limited = rateLimit(req, { name: "generate", limit: 10 });
  if (limited) return limited;

  try {
    const parsed = await readJsonCapped(req);
    if ("errorResponse" in parsed) return parsed.errorResponse;
    const quizData = parsed.body as Parameters<typeof generateTrips>[0];
    const result = (await generateTrips(quizData)) as {
      trips?: Record<string, unknown>[];
    };

    /* Attach real events happening there during the dates. */
    if (Array.isArray(result?.trips) && quizData.startDate && quizData.endDate) {
      await Promise.all(
        result.trips.map(async (t) => {
          const dest = typeof t.destination === "string" ? t.destination : "";
          if (!dest) return;
          try {
            const evs = await fetchTopEventsInArea(dest, quizData.startDate!, quizData.endDate!, 8);
            t.liveEvents = [...new Set(evs.map((e) => e.name))].slice(0, 3);
          } catch {
            /* the card just goes without */
          }
        })
      );
    }

    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[/api/generate]", message);
    return NextResponse.json(
      { error: `Trip generation failed: ${message}` },
      { status: 500 }
    );
  }
}
