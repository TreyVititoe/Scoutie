import { NextRequest, NextResponse } from "next/server";
import { searchHotels } from "@/lib/services/hotels";
import {
  rateLimit,
  cleanString,
  clampInt,
  isReasonableDate,
} from "@/lib/apiGuard";
import { cacheKey, cacheGet, cacheSet } from "@/lib/searchCache";

export const maxDuration = 30;

export async function POST(req: NextRequest) {
  const limited = rateLimit(req, { name: "hotels", limit: 30 });
  if (limited) return limited;

  try {
    const body = await req.json();
    const destination = cleanString(body?.destination, 80);
    const { checkIn, checkOut } = body ?? {};
    const adults = clampInt(body?.adults, 1, 10, 2);
    const rooms = clampInt(body?.rooms, 1, 5, 1);

    if (
      !destination ||
      !isReasonableDate(checkIn) ||
      !isReasonableDate(checkOut)
    ) {
      return NextResponse.json(
        { error: "Missing required fields: destination, checkIn, checkOut" },
        { status: 400 }
      );
    }

    const params = { destination, checkIn, checkOut, adults, rooms };
    const key = cacheKey("hotels", params);
    const cached = cacheGet<{ hotels: unknown[] }>(key);
    if (cached) return NextResponse.json(cached);

    const hotels = await searchHotels(params);

    if (hotels.length > 0) cacheSet(key, { hotels });
    return NextResponse.json({ hotels });
  } catch (err) {
    console.error("[/api/hotels]", err);
    return NextResponse.json({ error: "Hotel search failed" }, { status: 500 });
  }
}
