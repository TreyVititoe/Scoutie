const SERPAPI_KEY = process.env.SERPAPI_KEY!;

export type FlightLeg = {
  airline: string;
  airlineLogo: string | null;
  flightNumber: string | null;
  departure: string;
  arrival: string;
  departTime: string;
  arriveTime: string;
  duration: string;
  aircraft: string | null;
};

export type FlightLayover = {
  airport: string;
  city: string | null;
  duration: string;
  overnight: boolean;
};

export type FlightJourney = {
  legs: FlightLeg[];
  layovers: FlightLayover[];
  duration: string;
  stops: number;
  departure: string;
  arrival: string;
  departTime: string;
  arriveTime: string;
};

export type FlightResult = {
  id: string;
  airline: string;
  airlineLogo: string | null;
  outbound: FlightJourney;
  return: FlightJourney | null;
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

  const trimmed = input.trim();

  // If it's already a 3-letter uppercase code, use it directly
  if (/^[A-Z]{3}$/.test(trimmed)) return trimmed;

  // Handle "LAX - Los Angeles, CA" format (from IATA autocomplete)
  const iataMatch = trimmed.match(/^([A-Z]{3})\s*-/);
  if (iataMatch) return iataMatch[1];

  // Handle "lax" or "LAX" without dash
  if (/^[a-zA-Z]{3}$/.test(trimmed) && CITY_TO_IATA[trimmed.toLowerCase()]) {
    return CITY_TO_IATA[trimmed.toLowerCase()];
  }
  if (/^[a-zA-Z]{3}$/.test(trimmed)) return trimmed.toUpperCase();

  // Extract the city name (before first comma from Mapbox geocoding)
  const city = trimmed.split(",")[0].trim().toLowerCase();

  // Also try stripping " - ..." suffix (e.g. "Los Angeles - LAX")
  const dashCity = city.split(" - ")[0].trim();

  return CITY_TO_IATA[city] || CITY_TO_IATA[dashCity] || null;
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

function parseLeg(leg: Record<string, unknown>): FlightLeg {
  const depAirport = (leg.departure_airport as Record<string, string>) || {};
  const arrAirport = (leg.arrival_airport as Record<string, string>) || {};
  const depTime = depAirport.time || "";
  const arrTime = arrAirport.time || "";
  return {
    airline: (leg.airline as string) || "Unknown",
    airlineLogo: (leg.airline_logo as string) || null,
    flightNumber: (leg.flight_number as string) || null,
    departure: depAirport.id || "",
    arrival: arrAirport.id || "",
    departTime: depTime ? formatTime(depTime) : "",
    arriveTime: arrTime ? formatTime(arrTime) : "",
    duration: formatMinutes((leg.duration as number) || 0),
    aircraft: (leg.airplane as string) || null,
  };
}

function parseLayover(lay: Record<string, unknown>): FlightLayover {
  return {
    airport: (lay.id as string) || "",
    city: (lay.name as string) || null,
    duration: formatMinutes((lay.duration as number) || 0),
    overnight: Boolean(lay.overnight),
  };
}

function buildJourney(flightObj: Record<string, unknown>): FlightJourney {
  const rawLegs = (flightObj.flights as Array<Record<string, unknown>>) || [];
  const rawLayovers = (flightObj.layovers as Array<Record<string, unknown>>) || [];
  const legs = rawLegs.map(parseLeg);
  const layovers = rawLayovers.map(parseLayover);
  const first = legs[0];
  const last = legs[legs.length - 1] || first;
  return {
    legs,
    layovers,
    duration: formatMinutes((flightObj.total_duration as number) || 0),
    stops: Math.max(0, legs.length - 1),
    departure: first?.departure || "",
    arrival: last?.arrival || "",
    departTime: first?.departTime || "",
    arriveTime: last?.arriveTime || "",
  };
}

/**
 * Fetch the cheapest matching return journey for a given outbound via its departure_token.
 * SerpAPI requires a 2nd google_flights call with the token to get return options.
 */
async function fetchReturnJourney(
  departureToken: string,
  baseParams: URLSearchParams
): Promise<FlightJourney | null> {
  const params = new URLSearchParams(baseParams);
  params.set("departure_token", departureToken);
  try {
    const res = await fetch(`https://serpapi.com/search.json?${params}`);
    if (!res.ok) return null;
    const data = await res.json();
    if (data.error) return null;
    const options: Array<Record<string, unknown>> = [
      ...(data.best_flights || []),
      ...(data.other_flights || []),
    ];
    if (options.length === 0) return null;
    options.sort(
      (a, b) => ((a.price as number) ?? Infinity) - ((b.price as number) ?? Infinity)
    );
    return buildJourney(options[0]);
  } catch (err) {
    console.warn("[flights] return fetch failed:", err);
    return null;
  }
}

/**
 * Search roundtrip flights via SerpAPI (Google Flights).
 * Outbound options come from the first call; the matching return journey for each
 * is fetched in parallel via a second call per departure_token.
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
    console.warn(`[flights] Could not resolve IATA: origin="${origin}"=>${originCode} dest="${destination}"=>${destCode}`);
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

  const top = allFlights.slice(0, 8) as Array<Record<string, unknown>>;

  // Fetch return journey for each outbound in parallel
  const returnJourneys = await Promise.all(
    top.map((flight) => {
      const token = flight.departure_token as string | undefined;
      return token ? fetchReturnJourney(token, searchParams) : Promise.resolve(null);
    })
  );

  const bookingUrl = `https://www.google.com/travel/flights?q=flights+from+${originCode}+to+${destCode}+on+${departDate}+return+${returnDate}`;

  return top.map((flight, i): FlightResult => {
    const outbound = buildJourney(flight);
    const ret = returnJourneys[i];
    const price = (flight.price as number) || 0;
    const airline = outbound.legs[0]?.airline || "Unknown";
    const airlineLogo =
      (flight.airline_logo as string) || outbound.legs[0]?.airlineLogo || null;

    return {
      id: `flight-${i}`,
      airline,
      airlineLogo,
      outbound,
      return: ret,
      price,
      currency: "USD",
      bookingUrl,
    };
  });
}
