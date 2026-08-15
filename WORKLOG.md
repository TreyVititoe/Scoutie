# WORKLOG

Running log of work sessions. Newest entry first. Short summaries and key facts only.

## 2026-08-15 — Vacation rentals fix + feature notes

**Fixed: Vacation Rentals tab showed hotels.**
- Root cause: the `vacation_rental` filter in `apps/web/lib/services/hotels.ts` included Booking.com facet 201 (apartments). Booking files aparthotels and hotel-branded serviced apartments under 201 and ranks them first (Bahia Resort Hotel, Kasa, Margot by Hilton), so the page read as all hotels.
- Fix: `vacation_rental` now uses facets 220 (holiday homes) + 222 (villas) only. Verified against the live API for San Diego and Nashville: full pages of true Airbnb/VRBO-style homes.
- One server-side change. The mobile app calls the same web API, so both surfaces are fixed.
- Note: facet `ht_id::` is silently ignored by booking-com15; `property_type::` is the working key.

**Feature notes from Trey (not built yet):**
- Larger flight tab for app and web, like a normal booking site. Advanced options: number of stops, target price, cabin class (economy / business). "Might cost a little extra, but we should have it."
- Same idea for stays: offer different price points.
- Groundwork that already exists: SerpAPI Google Flights accepts `stops`, `max_price`, and `travel_class` params (not wired in `lib/services/flights.ts` yet). Hotels API accepts `price_min` / `price_max` style filters via `categories_filter`.
- Trey's note file was cut off at the start ("...me anything, so I think we have a bug there") — first bug reference is unknown, ask him.
