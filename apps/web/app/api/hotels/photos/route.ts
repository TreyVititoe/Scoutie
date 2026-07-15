import { NextRequest, NextResponse } from "next/server";
import { getHotelPhotos } from "@/lib/services/hotels";
import { rateLimit, cleanString } from "@/lib/apiGuard";
import { cacheGet, cacheSet } from "@/lib/searchCache";

export async function GET(req: NextRequest) {
  const limited = rateLimit(req, { name: "hotel-photos", limit: 60 });
  if (limited) return limited;

  const hotelId = cleanString(req.nextUrl.searchParams.get("hotelId"), 20);
  if (!hotelId || !/^\d+$/.test(hotelId)) {
    return NextResponse.json({ error: "Bad hotelId" }, { status: 400 });
  }

  const key = `hotel-photos:${hotelId}`;
  const cached = cacheGet<string[]>(key);
  if (cached) return NextResponse.json({ photos: cached });

  try {
    const photos = await getHotelPhotos(hotelId);
    /* Photo sets barely change; cache for a day. */
    if (photos.length > 0) cacheSet(key, photos, 24 * 60 * 60 * 1000);
    return NextResponse.json({ photos });
  } catch (err) {
    console.error("[/api/hotels/photos]", err);
    return NextResponse.json({ photos: [] });
  }
}
