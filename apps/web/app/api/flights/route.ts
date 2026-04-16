import { NextRequest, NextResponse } from "next/server";
import { searchFlights } from "@/lib/services/flights";

export const maxDuration = 30;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      origin,
      destination,
      departDate,
      returnDate,
      adults = 1,
      cabinClass = "economy",
    } = body;

    if (!origin || !destination || !departDate || !returnDate) {
      console.warn("[/api/flights] missing fields", { origin, destination, departDate, returnDate });
      return NextResponse.json(
        { error: "Missing required fields", missing: { origin: !origin, destination: !destination, departDate: !departDate, returnDate: !returnDate } },
        { status: 400 }
      );
    }

    if (!process.env.SERPAPI_KEY) {
      console.error("[/api/flights] SERPAPI_KEY not set");
      return NextResponse.json({ error: "Flight provider not configured", flights: [] }, { status: 200 });
    }

    const t0 = Date.now();
    const flights = await searchFlights({
      origin,
      destination,
      departDate,
      returnDate,
      adults,
      cabinClass,
    });
    const elapsed = Date.now() - t0;
    console.log(`[/api/flights] ${origin} -> ${destination} ${departDate}..${returnDate} | ${flights.length} results in ${elapsed}ms`);

    return NextResponse.json({ flights });
  } catch (err) {
    console.error("[/api/flights]", err);
    return NextResponse.json({ error: "Flight search failed", flights: [] }, { status: 200 });
  }
}
