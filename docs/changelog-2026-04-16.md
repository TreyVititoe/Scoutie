# Changelog — 2026-04-16

Recap of fixes shipped this session.

## Shared trips: items now actually save

**Problem:** Shared links opened to a one-day trip with random/missing events.

**Cause:** The cart includes a `"site"` item type, but the `trip_items.item_type` CHECK constraint only allows `flight | hotel | rental | activity | restaurant | event | transport | note`. The batch insert in `/api/trips/share` failed silently for any cart containing landmarks/sites, leaving an empty placeholder day.

**Fix:** Map `"site"` → `"activity"` before insert + log insert errors instead of swallowing them.
*Commit `b25235f`.*

## Shared page: grouped-by-type view for single-day trips

**Problem:** Hand-curated trips (built from the cart on `/results`) all land on Day 1 because cart items don't carry `meta.dayNumber`. The shared page rendered them as one big "Day 1" timeline pile.

**Fix:** When `trip.trip_days.length === 1`, hide the day selector and render items grouped into **Flights / Stays / Events / Activities / Dining / Rentals / Transport / Notes** sections in a 2-col grid. Multi-day AI itineraries (from `/quick` or `/compare`) still get the per-day timeline. Hero badge now shows `N items` instead of `1 days`.
*Commit `d0eee19`.*

## Quiz: accommodation question restored

Brought back the "Where are you staying?" question, now as a compact 5-chip picker (Hotel / Rental / Hostel / Resort / Boutique) plus a "Don't need a place" toggle. Lives at the bottom of page 2 (Destination), so the shortened 4-step flow stays intact. Wires into existing `accommodationTypes` / `noAccommodation` store fields.
*Commit `3bf7141`.*

## Flights API: diagnostics + timeout

**Problem:** Flights sometimes silently empty.

**Fix:**
- Bumped client abort timeout 15s → 25s (SerpAPI Google Flights commonly takes 15-20s on cold lookups, the old timeout was killing in-flight requests).
- Server now logs missing `SERPAPI_KEY`, IATA resolution failures with the actual input strings, and `[/api/flights] origin -> dest | N results in Xms` on every call.
- Errors return `200` with `flights:[]` instead of `500`, so the UI shows "No flights found" cleanly.

Verified directly: SerpAPI key works, IATA resolver handles both `"LAX - Los Angeles, CA"` and `"Paris, France"`. Remaining failure mode is destinations not in the IATA city table (countries like `"Italy"` or obscure cities).
*Commit `0f30fca`.*

## "Make this trip mine" actually works

**Problem:** "Fork this trip" duplicated the trip in the DB and redirected to *another* read-only `/shared/{newSlug}` page. Nothing was editable, so it felt broken.

**Fix:** Forking is now fully client-side — it replaces the cart with the shared trip's items, seeds `walter_prefs` with destination + dates, and routes to `/trip` where the user can edit, save, re-share, etc. CTA renamed to **"Make this trip mine"**. Expanded `/api/trips/shared` select to include `image_url` + `booking_url` so forked items keep their images and booking links. DB types `rental` / `transport` / `note` map to cart's `activity`.
*Commit `a283bae`.*

## Cleanup: deleted `/api/trips/fork`

The old server-side fork route is no longer referenced anywhere — removed.
*Last commit of the session.*

## Trip page: shows trip length

Added a **Length** stat (`N days`) to the `/trip` hero, computed from `startDate` / `endDate`. Sits between Dates and Travelers. Hides automatically when dates are missing.
*Last commit of the session.*
