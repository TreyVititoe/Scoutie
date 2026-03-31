const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY!;
const RAPIDAPI_HOST = process.env.RAPIDAPI_FLIGHTS_HOST || "fly-scraper.p.rapidapi.com";

export type FlightResult = {
  id: string;
  airline: string;
  airlineLogo: string | null;
  departure: string;
  arrival: string;
  departTime: string;
  arriveTime: string;
  duration: string;
  stops: number;
  price: number;
  currency: string;
  bookingUrl: string | null;
};

/**
 * Search for the SkyId of a city/airport.
 */
async function getSkyId(query: string): Promise<{ skyId: string; entityId: string } | null> {
  const res = await fetch(
    `https://${RAPIDAPI_HOST}/api/v1/flights/searchAirport?query=${encodeURIComponent(query)}`,
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
  if (!first) return null;

  return {
    skyId: first.skyId || first.navigation?.relevantFlightParams?.skyId,
    entityId: first.entityId || first.navigation?.relevantFlightParams?.entityId,
  };
}

function formatMinutes(mins: number): string {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${h}h ${m}m`;
}

/**
 * Search roundtrip flights.
 */
export async function searchFlights(params: {
  origin: string;
  destination: string;
  departDate: string;
  returnDate: string;
  adults?: number;
  cabinClass?: string;
}): Promise<FlightResult[]> {
  const { origin, destination, departDate, returnDate, adults = 1, cabinClass = "economy" } = params;

  // Resolve sky IDs
  const [originData, destData] = await Promise.all([
    getSkyId(origin),
    getSkyId(destination),
  ]);

  if (!originData || !destData) {
    console.warn("[flights] Could not resolve airport IDs for", origin, destination);
    return [];
  }

  const url = new URL(`https://${RAPIDAPI_HOST}/api/v2/flights/search-roundtrip`);
  url.searchParams.set("originSkyId", originData.skyId);
  url.searchParams.set("destinationSkyId", destData.skyId);
  url.searchParams.set("originEntityId", originData.entityId);
  url.searchParams.set("destinationEntityId", destData.entityId);
  url.searchParams.set("date", departDate);
  url.searchParams.set("returnDate", returnDate);
  url.searchParams.set("adults", String(adults));
  url.searchParams.set("cabinClass", cabinClass);
  url.searchParams.set("currency", "USD");
  url.searchParams.set("market", "US");
  url.searchParams.set("locale", "en-US");

  const res = await fetch(url.toString(), {
    headers: {
      "x-rapidapi-key": RAPIDAPI_KEY,
      "x-rapidapi-host": RAPIDAPI_HOST,
    },
  });

  if (!res.ok) {
    console.error("[flights] API error:", res.status, await res.text());
    return [];
  }

  const data = await res.json();
  const itineraries = data?.data?.itineraries || [];

  return itineraries.slice(0, 8).map((it: Record<string, unknown>, i: number): FlightResult => {
    const legs = (it.legs as Array<Record<string, unknown>>) || [];
    const outbound = legs[0] || {};
    const price = (it.price as Record<string, unknown>) || {};
    const carriers = (outbound.carriers as Record<string, unknown>) || {};
    const marketing = (carriers.marketing as Array<Record<string, unknown>>) || [];
    const stops = (outbound.stopCount as number) || 0;
    const durationMins = (outbound.durationInMinutes as number) || 0;

    const origin = (outbound.origin as Record<string, string>) || {};
    const dest = (outbound.destination as Record<string, string>) || {};

    const departureTime = outbound.departure
      ? new Date(outbound.departure as string).toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        })
      : "";
    const arrivalTime = outbound.arrival
      ? new Date(outbound.arrival as string).toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        })
      : "";

    return {
      id: `flight-${i}`,
      airline: marketing[0]?.name as string || "Unknown Airline",
      airlineLogo: (marketing[0]?.logoUrl as string) || null,
      departure: origin.displayCode || origin.id || "",
      arrival: dest.displayCode || dest.id || "",
      departTime: departureTime,
      arriveTime: arrivalTime,
      duration: formatMinutes(durationMins),
      stops,
      price: (price.raw as number) || 0,
      currency: "USD",
      bookingUrl: null,
    };
  });
}
