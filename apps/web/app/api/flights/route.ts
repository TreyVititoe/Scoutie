import { NextRequest, NextResponse } from "next/server";
import { searchFlights } from "@/lib/services/flights";

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
      return NextResponse.json(
        { error: "Missing required fields: origin, destination, departDate, returnDate" },
        { status: 400 }
      );
    }

    const flights = await searchFlights({
      origin,
      destination,
      departDate,
      returnDate,
      adults,
      cabinClass,
    });

    return NextResponse.json({ flights });
  } catch (err) {
    console.error("[/api/flights]", err);
    return NextResponse.json({ error: "Flight search failed" }, { status: 500 });
  }
}
