# WORKLOG

Running log of work sessions. Newest entry first. Short summaries and key facts only.

## 2026-08-15 — Pricing accuracy audit + fixes

Trey reported inaccurate prices in app build 3. Audited every price path.

**Verified correct (no change):**
- Flights: SerpAPI Google Flights price is the roundtrip total for ALL passengers (tested live: $66 for 1 adult became $132 for 2). Both surfaces pass the traveler count. Cards say "Roundtrip total."
- Hotels: cart stores the whole-stay total; card shows "per night · $X total."

**Fixed (were undercounting group trips):**
- Events: cart stored one ticket's price. Now stores priceMin x travelers, subtitle says "N tickets." Both surfaces.
- AI suggestions: `estimatedCost` is per person by prompt contract but was added to the cart once. Now multiplied by travelers, subtitle says "for N." Card caption now reads "est. per person." Both surfaces.
- AI trip estimates: the generate prompts never said whether `totalEstimatedCost` was per person or for the group, so Haiku picked a basis at random - this is the likely source of "inaccurate prices" on trip cards. Both prompts now pin a strict basis: totalEstimatedCost and flightEstimate = all travelers combined; hotelEstimatePerNight = one room one night; item estimatedCost = per person.

**Build note: app build 3 still has the old client code.** The prompt fixes are server-side (live for the app after Vercel deploy), but the event/suggestion cart math is in the app bundle - it lands in the NEXT EAS build.

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
