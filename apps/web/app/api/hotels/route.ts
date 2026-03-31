import { NextRequest, NextResponse } from "next/server";
import { searchHotels } from "@/lib/services/hotels";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      destination,
      checkIn,
      checkOut,
      adults = 2,
      rooms = 1,
    } = body;

    if (!destination || !checkIn || !checkOut) {
      return NextResponse.json(
        { error: "Missing required fields: destination, checkIn, checkOut" },
        { status: 400 }
      );
    }

    const hotels = await searchHotels({
      destination,
      checkIn,
      checkOut,
      adults,
      rooms,
    });

    return NextResponse.json({ hotels });
  } catch (err) {
    console.error("[/api/hotels]", err);
    return NextResponse.json({ error: "Hotel search failed" }, { status: 500 });
  }
}
