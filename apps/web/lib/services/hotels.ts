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

async function lookupDestination(query: string): Promise<string | null> {
  const res = await fetch(
    `https://${RAPIDAPI_HOST}/api/v1/hotels/searchDestination?query=${encodeURIComponent(query)}`,
    {
      headers: {
        "x-rapidapi-key": RAPIDAPI_KEY,
        "x-rapidapi-host": RAPIDAPI_HOST,
      },
    }
  );

  if (res.status === 401 || res.status === 403) {
    throw new Error("provider-unavailable");
  }
  if (!res.ok) return null;
  const data = await res.json();
  const list = (data?.data ?? []) as Record<string, unknown>[];
  /* Suffixed queries often match a HOTEL named after the city first;
   * we search with search_type=CITY, so only a city entry works. */
  const city = list.find(
    (d) => String(d.search_type ?? d.dest_type ?? "").toLowerCase() === "city"
  );
  return (city?.dest_id as string) || (city?.destId as string) || null;
}

/**
 * Get the Booking.com destination ID. Their search chokes on suffixed
 * forms ("Mexico City, Mexico" finds nothing while "Mexico City"
 * works), so try the full string, then progressively shorter ones.
 */
async function getDestinationId(city: string): Promise<string | null> {
  const parts = city.split(",").map((s) => s.trim()).filter(Boolean);
  const candidates = [
    ...new Set([
      city,
      ...(parts.length > 2 ? [parts.slice(0, 2).join(", ")] : []),
      ...(parts.length > 1 ? [parts[0]] : []),
    ]),
  ];
  for (const q of candidates) {
    const id = await lookupDestination(q);
    if (id) return id;
  }
  return null;
}

/**
 * Search hotels in a destination.
 */
export type StayType = "hotel" | "vacation_rental" | "hostel";

/* Booking.com property-type facet ids: 204 hotels, 201 apartments,
 * 220 holiday homes, 222 villas, 203 hostels. */
const STAY_TYPE_FILTERS: Record<StayType, string> = {
  hotel: "property_type::204",
  vacation_rental: "property_type::220,property_type::201,property_type::222",
  hostel: "property_type::203",
};

export async function searchHotels(params: {
  destination: string;
  checkIn: string;
  checkOut: string;
  adults?: number;
  rooms?: number;
  stayType?: StayType;
}): Promise<HotelResult[]> {
  const { destination, checkIn, checkOut, adults = 2, rooms = 1, stayType = "hotel" } = params;

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
  url.searchParams.set("categories_filter", STAY_TYPE_FILTERS[stayType]);
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

  if (res.status === 401 || res.status === 403) {
    throw new Error("provider-unavailable");
  }
  if (!res.ok) {
    console.error("[hotels] API error:", res.status, await res.text());
    return [];
  }

  const data = await res.json();
  const hotels = data?.data?.hotels || [];

  // Booking returns roughly a 20-result page; show the whole page.
  return hotels.slice(0, 24).map((h: Record<string, unknown>, i: number): HotelResult => {
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
