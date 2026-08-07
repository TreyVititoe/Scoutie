# App Store Connect — listing draft (v1.0.0)

Prepared 2026-08-07 for the first submission under the Praxis team.
Paste-ready; edit freely. Companion: app_plan.md Phase 4.

## Identity

- **Name** (30 chars max): `Walter — Trip Planner`
  ("Walter" alone is likely taken; check availability first and drop the
  suffix if the bare name is free.)
- **Subtitle** (30 chars max): `From daydream to booked`
- **Category:** Travel (primary). No secondary.
- **Bundle ID:** com.walterus.app
- **Age rating:** 4+ (nothing objectionable)

## Description

Walter takes you from "I should go somewhere" to "I'm booked" in one
sitting.

Tell Walter where you're headed — or let him make the case for
somewhere new. He assembles the whole trip: real flights, real places
to stay, and the things actually worth doing while you're there. One
cart instead of eight open tabs.

When the trip looks right, book it. Every item hands you off to the
provider's own site — the airline, the hotel, the box office — so you
book directly with them, at their price.

- Build a complete trip in minutes: flights, stays, events, and
  activities in one place
- Compare three takes on the same trip before you commit
- A live map, cost breakdown, and packing list for every trip
- A booking checklist that tracks what's booked and what's left
- Your trips stay on your device — no account needed

The world is enormous. Walter exists to get you into it.

## Keywords (100 chars max)

`trip,planner,travel,itinerary,flights,hotels,vacation,booking,getaway,events,weekend`

## URLs

- **Support URL:** https://scoutie.vercel.app (swap when the real domain
  lands)
- **Privacy Policy URL:** https://scoutie.vercel.app/privacy
- **Marketing URL:** https://scoutie.vercel.app

## Privacy nutrition labels (per the 07-28 auth-less decision)

Accounts are unreachable in v1, so do NOT declare account creation,
email, or precise location.

- **Data collection:** "Data Not Collected" is the intended answer.
  Searches and affiliate-click pings hit our API but are not linked to
  any identity and are not used for tracking.
- **Tracking:** None. No ATT prompt.
- Revisit all of this the day accounts unpark.

## Screenshots

Required: 6.9" iPhone set (1320 × 2868). iPad not needed
(`supportsTablet` is false). Suggested five, in journey order:

1. Home — destination rails
2. Clarify — dates and travelers
3. Results — flights tab with add-to-cart
4. Trip — map + cost breakdown
5. Checkout — booking checklist with progress

## App Review notes (paste into the Review Information box)

> Walter is a trip-planning app. There is no login and no account
> system in this version — no reviewer credentials are needed. Trips
> and carts are stored on the device.
>
> The "Book on …" buttons are hand-off links that open the travel
> provider's own website (airline, hotel, ticket seller) in a browser
> sheet. Walter sells nothing in-app; bookings for physical travel
> services are completed on the provider's site, per guideline 3.1.5(a).
> No in-app purchases exist.
>
> Flight, hotel, and event results are live data; availability varies
> by date and destination. Any future dates work for testing.

## Submission order

1. Wait for the EAS production build to finish processing.
2. Create the app record in ASC (Praxis team, bundle com.walterus.app).
3. `npx eas-cli submit -p ios --latest` uploads the build.
4. TestFlight internal test on a real device (Phase 4.2) before
   submitting for review.
