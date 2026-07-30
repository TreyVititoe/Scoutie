import { NextRequest, NextResponse } from "next/server";
import { searchFlights } from "@/lib/services/flights";
import {
  rateLimit,
  cleanString,
  clampInt,
  isReasonableDate,
} from "@/lib/apiGuard";
import { cacheKey, cacheGet, cacheSet } from "@/lib/searchCache";

export const maxDuration = 30;

export async function POST(req: NextRequest) {
  const limited = rateLimit(req, { name: "flights", limit: 30 });
  if (limited) return limited;

  try {
    const body = await req.json();
    const origin = cleanString(body?.origin, 80);
    const destination = cleanString(body?.destination, 80);
    const { departDate, returnDate } = body ?? {};
    const adults = clampInt(body?.adults, 1, 10, 1);
    const cabinClass = cleanString(body?.cabinClass, 20) || "economy";

    if (
      !origin ||
      !destination ||
      !isReasonableDate(departDate) ||
      !isReasonableDate(returnDate)
    ) {
      // Detail stays in the server log; the body must not enumerate which
      // fields were missing back to the caller.
      console.warn("[/api/flights] missing fields", { origin, destination, departDate, returnDate });
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (!process.env.SERPAPI_KEY) {
      console.error("[/api/flights] SERPAPI_KEY not set");
      return NextResponse.json(
        { error: "Flight provider not configured" },
        { status: 503 }
      );
    }

    const params = { origin, destination, departDate, returnDate, adults, cabinClass };
    const key = cacheKey("flights", params);
    const cached = cacheGet<{ flights: unknown[] }>(key);
    if (cached) return NextResponse.json(cached);

    const t0 = Date.now();
    const flights = await searchFlights(params);
    const elapsed = Date.now() - t0;
    console.log(`[/api/flights] ${origin} -> ${destination} ${departDate}..${returnDate} | ${flights.length} results in ${elapsed}ms`);

    if (flights.length > 0) cacheSet(key, { flights });
    return NextResponse.json({ flights });
  } catch (err) {
    /* Was HTTP 200 with an empty flights array, which made a provider
     * outage indistinguishable from "no flights on this route" -- the client
     * rendered a confident empty state over a real failure. */
    console.error("[/api/flights]", err);
    return NextResponse.json({ error: "Flight search failed" }, { status: 502 });
  }
}
