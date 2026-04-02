const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY!;
const RAPIDAPI_HOST = process.env.RAPIDAPI_HOTELS_HOST || "booking-com15.p.rapidapi.com";

export type HotelResult = {
  id: string;
  name: string;
  image: string | null;
  rating: number;
  reviewCount: number;
  reviewWord: string;
  pricePerNight: number;
  totalPrice: number;
  currency: string;
  neighborhood: string;
  latitude: number | null;
  longitude: number | null;
  amenities: string[];
  bookingUrl: string | null;
};

/**
 * Get Booking.com destination ID for a city.
 */
async function getDestinationId(city: string): Promise<string | null> {
  const res = await fetch(
    `https://${RAPIDAPI_HOST}/api/v1/hotels/searchDestination?query=${encodeURIComponent(city)}`,
    {
      headers: {
        "x-rapidapi-key": RAPIDAPI_KEY,
        "x-rapidapi-host": RAPIDAPI_HOST,
      },
    }
  );

  if (!res.ok) return null;
  const data = await res.json();
  const first = data?.data?.[0];
  return first?.dest_id || first?.destId || null;
}

/**
 * Search hotels in a destination.
 */
export async function searchHotels(params: {
  destination: string;
  checkIn: string;
  checkOut: string;
  adults?: number;
  rooms?: number;
}): Promise<HotelResult[]> {
  const { destination, checkIn, checkOut, adults = 2, rooms = 1 } = params;

  const destId = await getDestinationId(destination);
  if (!destId) {
    console.warn("[hotels] Could not resolve destination ID for", destination);
    return [];
  }

  const nights = Math.max(
    1,
    Math.round(
      (new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24)
    )
  );

  const url = new URL(`https://${RAPIDAPI_HOST}/api/v1/hotels/searchHotels`);
  url.searchParams.set("dest_id", destId);
  url.searchParams.set("search_type", "CITY");
  url.searchParams.set("arrival_date", checkIn);
  url.searchParams.set("departure_date", checkOut);
  url.searchParams.set("adults", String(adults));
  url.searchParams.set("room_qty", String(rooms));
  url.searchParams.set("currency_code", "USD");
  url.searchParams.set("locale", "en-us");
  url.searchParams.set("units", "metric");
  url.searchParams.set("temperature_unit", "f");
  url.searchParams.set("page_number", "1");

  const res = await fetch(url.toString(), {
    headers: {
      "x-rapidapi-key": RAPIDAPI_KEY,
      "x-rapidapi-host": RAPIDAPI_HOST,
    },
  });

  if (!res.ok) {
    console.error("[hotels] API error:", res.status, await res.text());
    return [];
  }

  const data = await res.json();
  const hotels = data?.data?.hotels || [];

  return hotels.slice(0, 8).map((h: Record<string, unknown>, i: number): HotelResult => {
    const property = (h.property as Record<string, unknown>) || h;
    const priceBreakdown = (property.priceBreakdown as Record<string, unknown>) || {};
    const grossPrice = (priceBreakdown.grossPrice as Record<string, unknown>) || {};
    const totalPrice = (grossPrice.value as number) || 0;
    const perNight = nights > 0 ? Math.round(totalPrice / nights) : totalPrice;

    const reviewScore = (property.reviewScore as number) || 0;
    const reviewWord = (property.reviewScoreWord as string) || "";
    const reviewCount = (property.reviewCount as number) || 0;

    const photoUrls = (property.photoUrls as string[]) || [];
    const mainPhoto = (property.mainPhotoUrl as string) || photoUrls[0] || null;

    // Build Booking.com search URL
    const hotelName = (property.name as string) || "Unknown Hotel";
    const bookingParams = new URLSearchParams({
      ss: hotelName,
      checkin: checkIn,
      checkout: checkOut,
      group_adults: String(adults),
      no_rooms: String(rooms),
    });
    const bookingUrl = `https://www.booking.com/searchresults.html?${bookingParams.toString()}`;

    return {
      id: `hotel-${i}`,
      name: hotelName,
      image: mainPhoto,
      rating: Math.round(reviewScore * 10) / 10,
      reviewCount,
      reviewWord,
      pricePerNight: perNight,
      totalPrice: Math.round(totalPrice),
      currency: "USD",
      neighborhood: (property.wishlistName as string) || "",
      latitude: (property.latitude as number) || null,
      longitude: (property.longitude as number) || null,
      amenities: [],
      bookingUrl,
    };
  });
}
