/*
 * Walter's cart builder: when the traveler explicitly asks him to put the
 * trip together, this runs the same live searches as /results and picks a
 * sensible cart. Picks favor value over extremes: a nonstop flight when
 * it is close in price to the cheapest, the best rating-for-money stay,
 * and the top-scoring affordable events.
 */

import type { TripPrefs } from "@walter/shared";

import { searchFlights, type FlightResult } from "./flights";
import { searchHotels, type HotelResult } from "./hotels";
import { fetchEventsByVibes, fetchTopEventsInArea } from "./ticketmaster";

export type BuiltCartItem = {
  id: string;
  type: "flight" | "hotel" | "event";
  title: string;
  subtitle: string;
  price: number | null;
  image: string | null;
  bookingUrl: string | null;
  provider: string;
  date: string | null;
  meta: Record<string, unknown>;
};

export type BuiltCart = {
  items: BuiltCartItem[];
  /* One line per category, in plain language, for Walter's reply. */
  notes: string[];
  total: number;
};

function withTimeout<T>(p: Promise<T>, ms: number, fallback: T): Promise<T> {
  return Promise.race([
    p.catch(() => fallback),
    new Promise<T>((resolve) => setTimeout(() => resolve(fallback), ms)),
  ]);
}

function pickFlight(flights: FlightResult[]): FlightResult | null {
  if (!flights.length) return null;
  const cheapest = flights.reduce((a, b) => (a.price < b.price ? a : b));
  /* A nonstop within 30% of the cheapest fare beats the cheapest. */
  const nonstops = flights.filter((f) => f.outbound.stops === 0);
  if (nonstops.length) {
    const bestNonstop = nonstops.reduce((a, b) => (a.price < b.price ? a : b));
    if (bestNonstop.price <= cheapest.price * 1.3) return bestNonstop;
  }
  return cheapest;
}

function pickHotel(hotels: HotelResult[], maxTotal: number | null): HotelResult | null {
  if (!hotels.length) return null;
  const affordable =
    maxTotal != null ? hotels.filter((h) => h.totalPrice <= maxTotal) : hotels;
  const pool = affordable.length ? affordable : hotels;
  return pool.reduce((a, b) =>
    a.rating / (a.pricePerNight || 1) > b.rating / (b.pricePerNight || 1) ? a : b
  );
}

/* Legs may arrive without dates; split the overall window evenly so every
 * search has a real check-in and check-out. */
function datedLegs(trip: Partial<TripPrefs>) {
  const legs = trip.legs ?? [];
  const start = trip.startDate ? Date.parse(trip.startDate) : NaN;
  const end = trip.endDate ? Date.parse(trip.endDate) : NaN;
  if (legs.every((l) => l.startDate && l.endDate)) {
    return legs.map((l) => ({ ...l, startDate: l.startDate!, endDate: l.endDate! }));
  }
  if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) {
    return legs
      .filter((l) => l.startDate && l.endDate)
      .map((l) => ({ ...l, startDate: l.startDate!, endDate: l.endDate! }));
  }
  const totalNights = Math.max(legs.length, Math.round((end - start) / 86400000));
  const base = Math.floor(totalNights / legs.length);
  let cursor = start;
  return legs.map((l, i) => {
    const nights = i === legs.length - 1 ? Math.max(1, Math.round((end - cursor) / 86400000)) : Math.max(1, base);
    const s = new Date(cursor).toISOString().slice(0, 10);
    cursor += nights * 86400000;
    const e = new Date(Math.min(cursor, end)).toISOString().slice(0, 10);
    return { destination: l.destination, startDate: l.startDate ?? s, endDate: l.endDate ?? e };
  });
}

async function buildMultiLegCart(trip: Partial<TripPrefs>): Promise<BuiltCart> {
  const travelers = trip.travelers ?? 2;
  const budget = trip.budget ?? 0;
  const origin = trip.departureAirportCode || trip.departureCity || "";
  const legs = datedLegs(trip);
  if (legs.length < 2) return buildSingleLegCart(trip);

  /* Hop chain: home to leg 1, city to city, last city home. */
  const hops: { origin: string; destination: string; date: string }[] = [];
  if (origin) {
    hops.push({ origin, destination: legs[0].destination, date: legs[0].startDate });
    for (let i = 1; i < legs.length; i++) {
      hops.push({
        origin: legs[i - 1].destination,
        destination: legs[i].destination,
        date: legs[i].startDate,
      });
    }
    hops.push({
      origin: legs[legs.length - 1].destination,
      destination: origin,
      date: legs[legs.length - 1].endDate,
    });
  }

  const [hopResults, hotelResults, eventResults] = await Promise.all([
    Promise.all(
      hops.map((h) =>
        withTimeout(
          searchFlights({
            origin: h.origin,
            destination: h.destination,
            departDate: h.date,
            returnDate: "",
            adults: travelers,
            oneWay: true,
          }),
          20000,
          [] as FlightResult[]
        )
      )
    ),
    Promise.all(
      legs.map((l) =>
        withTimeout(
          searchHotels({
            destination: l.destination,
            checkIn: l.startDate,
            checkOut: l.endDate,
            adults: travelers,
          }),
          15000,
          [] as HotelResult[]
        )
      )
    ),
    Promise.all(
      legs.map((l) =>
        withTimeout(
          fetchEventsByVibes(l.destination, l.startDate, l.endDate, trip.vibes ?? [], []).then(
            (evs) => (evs.length ? evs : fetchTopEventsInArea(l.destination, l.startDate, l.endDate))
          ),
          15000,
          []
        )
      )
    ),
  ]);

  const items: BuiltCartItem[] = [];
  const notes: string[] = [];

  hops.forEach((h, i) => {
    const flight = pickFlight(hopResults[i]);
    if (!flight) return;
    items.push({
      id: flight.id,
      type: "flight",
      title: `${flight.airline} ${flight.outbound.departure} to ${flight.outbound.arrival}`,
      subtitle: `${flight.outbound.departTime}, ${flight.outbound.duration}, one way`,
      price: flight.price,
      image: null,
      bookingUrl: flight.bookingUrl,
      provider: "google-flights",
      date: h.date,
      meta: { ...(flight as unknown as Record<string, unknown>), legDestination: h.destination },
    });
    notes.push(`${h.origin.split(",")[0]} to ${h.destination.split(",")[0]}: ${flight.airline} $${flight.price}`);
  });

  const stayBudgetPerLeg =
    budget > 0 ? Math.round((budget * 0.45) / legs.length) : null;
  legs.forEach((l, i) => {
    const hotel = pickHotel(hotelResults[i], stayBudgetPerLeg);
    if (!hotel) {
      notes.push(`${l.destination.split(",")[0]}: no stay found, pick one on the Stays tab`);
      return;
    }
    items.push({
      id: hotel.id,
      type: "hotel",
      title: hotel.name,
      subtitle: `${l.destination.split(",")[0]}${hotel.neighborhood ? ` · ${hotel.neighborhood}` : ""}`,
      price: hotel.totalPrice,
      image: hotel.image,
      bookingUrl: hotel.bookingUrl,
      provider: "booking",
      date: l.startDate,
      meta: { ...(hotel as unknown as Record<string, unknown>), legDestination: l.destination },
    });
    notes.push(
      `${l.destination.split(",")[0]} stay: ${hotel.name}, $${hotel.totalPrice}`
    );
  });

  let eventCount = 0;
  legs.forEach((l, i) => {
    if (eventCount >= 3) return;
    const ev = eventResults[i]
      .filter(
        (e) =>
          e.priceMin == null ||
          budget <= 0 ||
          e.priceMin * travelers <= Math.max(60, budget * 0.1)
      )
      .sort((a, b) => b.popularity - a.popularity)[0];
    if (!ev) return;
    eventCount++;
    items.push({
      id: ev.id,
      type: "event",
      title: ev.name,
      subtitle: `${l.destination.split(",")[0]} · ${ev.venueName}${travelers > 1 ? ` · ${travelers} tickets` : ""}`,
      price: ev.priceMin != null ? ev.priceMin * travelers : null,
      image: ev.image,
      bookingUrl: ev.url,
      provider: "ticketmaster",
      date: ev.date,
      meta: { ...(ev as unknown as Record<string, unknown>), legDestination: l.destination },
    });
  });
  if (eventCount) notes.push(`${eventCount} event${eventCount > 1 ? "s" : ""} across the stops`);

  const total = items.reduce((sum, i) => sum + (i.price ?? 0), 0);
  return { items, notes, total };
}

export async function buildTripCart(trip: Partial<TripPrefs>): Promise<BuiltCart> {
  if ((trip.legs?.length ?? 0) >= 2) return buildMultiLegCart(trip);
  return buildSingleLegCart(trip);
}

async function buildSingleLegCart(trip: Partial<TripPrefs>): Promise<BuiltCart> {
  const destination = trip.destination ?? "";
  const startDate = trip.startDate ?? "";
  const endDate = trip.endDate ?? "";
  const travelers = trip.travelers ?? 2;
  const budget = trip.budget ?? 0;
  const origin = trip.departureAirportCode || trip.departureCity || "";

  const [flights, hotels, events] = await Promise.all([
    origin
      ? withTimeout(
          searchFlights({
            origin,
            destination,
            departDate: startDate,
            returnDate: endDate,
            adults: travelers,
          }),
          20000,
          [] as FlightResult[]
        )
      : Promise.resolve([] as FlightResult[]),
    withTimeout(
      searchHotels({
        destination,
        checkIn: startDate,
        checkOut: endDate,
        adults: travelers,
      }),
      15000,
      [] as HotelResult[]
    ),
    withTimeout(
      fetchEventsByVibes(destination, startDate, endDate, trip.vibes ?? [], [])
        .then((evs) =>
          evs.length ? evs : fetchTopEventsInArea(destination, startDate, endDate)
        ),
      15000,
      []
    ),
  ]);

  const items: BuiltCartItem[] = [];
  const notes: string[] = [];

  const flight = pickFlight(flights);
  if (flight) {
    items.push({
      id: flight.id,
      type: "flight",
      title: `${flight.airline} ${flight.outbound.departure} to ${flight.outbound.arrival}`,
      subtitle: flight.return
        ? `${flight.outbound.duration} out, ${flight.return.duration} back, roundtrip`
        : `${flight.outbound.departTime}, ${flight.outbound.duration}`,
      price: flight.price,
      image: null,
      bookingUrl: flight.bookingUrl,
      provider: "google-flights",
      date: startDate || null,
      meta: flight as unknown as Record<string, unknown>,
    });
    notes.push(
      `Flight: ${flight.airline}, ${flight.outbound.stops === 0 ? "nonstop" : `${flight.outbound.stops} stop`}, $${flight.price} roundtrip${flights.length > 1 ? ` (picked from ${flights.length} options)` : ""}`
    );
  } else if (origin) {
    notes.push("Flight: the search came back empty, so pick one on the Flights tab");
  } else {
    notes.push("Flight: no departure city given, so none added");
  }

  const hotel = pickHotel(hotels, budget > 0 ? Math.round(budget * 0.45) : null);
  if (hotel) {
    items.push({
      id: hotel.id,
      type: "hotel",
      title: hotel.name,
      subtitle: hotel.neighborhood || "",
      price: hotel.totalPrice,
      image: hotel.image,
      bookingUrl: hotel.bookingUrl,
      provider: "booking",
      date: null,
      meta: hotel as unknown as Record<string, unknown>,
    });
    notes.push(
      `Stay: ${hotel.name}, ${hotel.rating > 0 ? `${hotel.rating}/10, ` : ""}$${hotel.totalPrice} total`
    );
  } else {
    notes.push("Stay: the search came back empty, so pick one on the Stays tab");
  }

  const affordableEvents = events
    .filter(
      (e) =>
        e.priceMin == null ||
        budget <= 0 ||
        e.priceMin * travelers <= Math.max(60, budget * 0.15)
    )
    .sort((a, b) => b.popularity - a.popularity)
    .slice(0, 2);
  for (const e of affordableEvents) {
    items.push({
      id: e.id,
      type: "event",
      title: e.name,
      subtitle:
        travelers > 1 ? `${e.venueName} · ${travelers} tickets` : e.venueName,
      price: e.priceMin != null ? e.priceMin * travelers : null,
      image: e.image,
      bookingUrl: e.url,
      provider: "ticketmaster",
      date: e.date,
      meta: e as unknown as Record<string, unknown>,
    });
  }
  if (affordableEvents.length) {
    notes.push(
      `Events: ${affordableEvents.map((e) => e.name).join(" and ")}`
    );
  }

  const total = items.reduce((sum, i) => sum + (i.price ?? 0), 0);
  return { items, notes, total };
}
