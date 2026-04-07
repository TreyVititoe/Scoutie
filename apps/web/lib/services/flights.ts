const SERPAPI_KEY = process.env.SERPAPI_KEY!;

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

// Major city → primary IATA airport code mapping
const CITY_TO_IATA: Record<string, string> = {
  "new york": "JFK", "nyc": "JFK", "manhattan": "JFK",
  "los angeles": "LAX", "la": "LAX",
  "chicago": "ORD", "san francisco": "SFO", "sf": "SFO",
  "miami": "MIA", "dallas": "DFW", "houston": "IAH",
  "atlanta": "ATL", "boston": "BOS", "seattle": "SEA",
  "denver": "DEN", "las vegas": "LAS", "orlando": "MCO",
  "washington": "IAD", "dc": "IAD", "washington dc": "IAD",
  "philadelphia": "PHL", "phoenix": "PHX", "san diego": "SAN",
  "minneapolis": "MSP", "detroit": "DTW", "tampa": "TPA",
  "portland": "PDX", "austin": "AUS", "nashville": "BNA",
  "charlotte": "CLT", "salt lake city": "SLC", "honolulu": "HNL",
  "london": "LHR", "paris": "CDG", "tokyo": "NRT",
  "rome": "FCO", "berlin": "BER", "madrid": "MAD",
  "barcelona": "BCN", "amsterdam": "AMS", "dubai": "DXB",
  "singapore": "SIN", "hong kong": "HKG", "sydney": "SYD",
  "toronto": "YYZ", "vancouver": "YVR", "montreal": "YUL",
  "mexico city": "MEX", "cancun": "CUN", "bangkok": "BKK",
  "seoul": "ICN", "mumbai": "BOM", "delhi": "DEL",
  "istanbul": "IST", "lisbon": "LIS", "dublin": "DUB",
  "zurich": "ZRH", "vienna": "VIE", "prague": "PRG",
  "athens": "ATH", "cairo": "CAI", "cape town": "CPT",
  "buenos aires": "EZE", "lima": "LIM", "bogota": "BOG",
  "sao paulo": "GRU", "rio de janeiro": "GIG",
  "bali": "DPS", "phuket": "HKT", "reykjavik": "KEF",
  "iceland": "KEF", "hawaii": "HNL", "maui": "OGG",
  // Mid-size US cities
  "tallahassee": "TLH", "jacksonville": "JAX", "savannah": "SAV",
  "charleston": "CHS", "raleigh": "RDU", "richmond": "RIC",
  "pittsburgh": "PIT", "cleveland": "CLE", "columbus": "CMH",
  "indianapolis": "IND", "milwaukee": "MKE", "kansas city": "MCI",
  "st. louis": "STL", "saint louis": "STL", "new orleans": "MSY",
  "memphis": "MEM", "louisville": "SDF", "birmingham": "BHM",
  "oklahoma city": "OKC", "tulsa": "TUL", "albuquerque": "ABQ",
  "el paso": "ELP", "tucson": "TUS", "san antonio": "SAT",
  "sacramento": "SMF", "san jose": "SJC", "oakland": "OAK",
  "burbank": "BUR", "long beach": "LGB", "santa ana": "SNA",
  "fort lauderdale": "FLL", "west palm beach": "PBI",
  "reno": "RNO", "boise": "BOI", "spokane": "GEG",
  "anchorage": "ANC", "buffalo": "BUF", "hartford": "BDL",
  "providence": "PVD", "norfolk": "ORF", "omaha": "OMA",
  "des moines": "DSM", "little rock": "LIT", "knoxville": "TYS",
  // International additions
  "milan": "MXP", "florence": "FLR", "naples": "NAP", "venice": "VCE",
  "nice": "NCE", "lyon": "LYS", "munich": "MUC", "frankfurt": "FRA",
  "hamburg": "HAM", "copenhagen": "CPH", "stockholm": "ARN",
  "oslo": "OSL", "helsinki": "HEL", "warsaw": "WAW",
  "budapest": "BUD", "bucharest": "OTP", "moscow": "SVO",
  "edinburgh": "EDI", "manchester": "MAN", "birmingham uk": "BHX",
  "marrakech": "RAK", "nairobi": "NBO", "johannesburg": "JNB",
  "doha": "DOH", "abu dhabi": "AUH", "kuala lumpur": "KUL",
  "taipei": "TPE", "osaka": "KIX", "beijing": "PEK",
  "shanghai": "PVG", "guangzhou": "CAN", "hanoi": "HAN",
  "ho chi minh": "SGN", "jakarta": "CGK", "melbourne": "MEL",
  "brisbane": "BNE", "auckland": "AKL", "fiji": "NAN",
  "havana": "HAV", "san juan": "SJU", "nassau": "NAS",
  "montego bay": "MBJ", "aruba": "AUA", "cartagena": "CTG",
  "medellin": "MDE", "santiago": "SCL", "montevideo": "MVD",
};

/**
 * Resolve a city name to an IATA airport code.
 * Strips suffixes like ", California, United States" from Mapbox results.
 */
function resolveIATA(input: string): string | null {
  if (!input) return null;

  // If it's already a 3-letter uppercase code, use it directly
  const trimmed = input.trim();
  if (/^[A-Z]{3}$/.test(trimmed)) return trimmed;

  // Extract the city name (before first comma from Mapbox geocoding)
  const city = trimmed.split(",")[0].trim().toLowerCase();

  return CITY_TO_IATA[city] || null;
}

function formatMinutes(mins: number): string {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${h}h ${m}m`;
}

function formatTime(dateTimeStr: string): string {
  // Format: "2026-06-01 16:30"
  const parts = dateTimeStr.split(" ");
  if (parts.length < 2) return dateTimeStr;
  const [hours, minutes] = parts[1].split(":");
  const h = parseInt(hours, 10);
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${h12}:${minutes} ${ampm}`;
}

/**
 * Search roundtrip flights via SerpAPI (Google Flights).
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

  const originCode = resolveIATA(origin);
  const destCode = resolveIATA(destination);

  if (!originCode || !destCode) {
    console.warn("[flights] Could not resolve IATA codes for", origin, "->", destination);
    return [];
  }

  // Map cabin class to SerpAPI format
  const cabinMap: Record<string, number> = {
    economy: 1,
    premium_economy: 2,
    business: 3,
    first: 4,
  };

  const searchParams = new URLSearchParams({
    engine: "google_flights",
    departure_id: originCode,
    arrival_id: destCode,
    outbound_date: departDate,
    return_date: returnDate,
    currency: "USD",
    hl: "en",
    adults: String(adults),
    travel_class: String(cabinMap[cabinClass] || 1),
    api_key: SERPAPI_KEY,
  });

  const res = await fetch(`https://serpapi.com/search.json?${searchParams}`);
  if (!res.ok) {
    console.error("[flights] SerpAPI error:", res.status);
    return [];
  }

  const data = await res.json();

  if (data.error) {
    console.error("[flights] SerpAPI error:", data.error);
    return [];
  }

  const bestFlights = data.best_flights || [];
  const otherFlights = data.other_flights || [];
  const allFlights = [...bestFlights, ...otherFlights];

  return allFlights.slice(0, 8).map((flight: Record<string, unknown>, i: number): FlightResult => {
    const legs = (flight.flights as Array<Record<string, unknown>>) || [];
    const firstLeg = legs[0] || {};
    const depAirport = (firstLeg.departure_airport as Record<string, string>) || {};
    const arrAirport = (firstLeg.arrival_airport as Record<string, string>) || {};
    const totalDuration = (flight.total_duration as number) || 0;
    const stops = legs.length - 1;
    const price = (flight.price as number) || 0;
    const airline = (firstLeg.airline as string) || "Unknown";
    const airlineLogo = (flight.airline_logo as string) || (firstLeg.airline_logo as string) || null;

    const depTime = (depAirport.time as string) || "";
    const arrTime = (arrAirport.time as string) || "";

    // Build Google Flights booking URL
    const bookingUrl = `https://www.google.com/travel/flights?q=flights+from+${originCode}+to+${destCode}+on+${departDate}+return+${returnDate}`;

    return {
      id: `flight-${i}`,
      airline,
      airlineLogo,
      departure: depAirport.id || originCode,
      arrival: arrAirport.id || destCode,
      departTime: depTime ? formatTime(depTime) : "",
      arriveTime: arrTime ? formatTime(arrTime) : "",
      duration: formatMinutes(totalDuration),
      stops,
      price,
      currency: "USD",
      bookingUrl,
    };
  });
}
