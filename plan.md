# Walter Web — Production Readiness Plan

_Written 2026-07-07. Companion doc: [app_plan.md](app_plan.md) (iOS app)._

**Status 2026-07-07 (same day, executed):** Phases 1.2–1.4, 2, 4, and 5 are DONE and pushed (see SESSION_CHANGES.md). Still open: **1.1 affiliate program applications** (human signup — Booking.com Partner + Impact/Ticketmaster; IDs then go in `NEXT_PUBLIC_BOOKING_AFFILIATE_ID` / `NEXT_PUBLIC_TM_IMPACT_URL`), **Sentry** (needs an account + DSN), **Vercel Analytics dashboard enablement**, **CSP** (deferred, needs browser verification), and the Playwright smoke test (skipped by preference — CI runs lint + unit tests + build instead).

## Decisions (locked)

- **Checkout = affiliate handoff.** No real payments, no Stripe, no Duffel. Checkout becomes a booking checklist that deep-links each cart item to its provider with our affiliate tags. Real bookings ("v2" in PURCHASE_AGENT.md) stay parked.
- **Domain: stay on scoutie.vercel.app for now.** Custom domain is post-launch; expect to redo OAuth redirects and app API base when it happens.
- **Guest-first stays.** Auth (Supabase magic link + Google) remains optional; localStorage flows keep working signed-out.

## Current state (survey 2026-07-07)

The full journey works with real data: Claude Haiku trip generation, SerpAPI flights, Booking.com hotels (RapidAPI), Ticketmaster events, Unsplash photos, Supabase auth + schema (trips, saves, shares, upvotes, `affiliate_clicks`). The only fake is checkout (`app/api/checkout/route.ts` mints WLT- codes; nothing is booked). Missing entirely: rate limiting, analytics, error tracking, tests, CI, sitemap/OG, custom error pages. `.env.local` is gitignored correctly; only `.env.example` is tracked.

---

## Phase 1 — Affiliate checkout (the launch feature)

**1.1 Apply to affiliate programs first — multi-week lead time, do this before writing code.**
- Booking.com Affiliate Partner Programme (hotels). We already search via RapidAPI's booking-com15 host; approved affiliate ID gets appended to hotel `booking_url`s.
- Ticketmaster affiliate via Impact.com (events).
- Flights: no affiliate initially — link out to Google Flights / airline site from the SerpAPI result's booking URL. (Flight commission requires Duffel-class integration; parked.)
- Requirements they check: live site, privacy + terms pages (exist), contact email (use me@treyvititoe.com — never the dcctally login).

**1.2 Replace simulated checkout with a booking checklist.**
- `app/checkout/page.tsx`: traveler form goes away; page becomes "Book your trip" — each cart item rendered as a row: provider, price, **Book on [provider] →** button.
- Book button: fires `POST /api/affiliate/click` (route exists, table exists), then opens the provider URL with affiliate params in a new tab.
- Per-item "mark as booked" toggle; state in `tripCartStore` → localStorage; write through to `trip_items.is_booked` when signed in.
- Delete `app/api/checkout/route.ts` — click tracking already has its own route, so the checklist needs no checkout round-trip.

**1.3 Confirmation → trip binder.**
- `app/checkout/confirmation/page.tsx`: replace fake WLT- codes with booked/unbooked progress ("3 of 5 booked"), the trip summary, packing-list CTA (`/api/packing-list` exists), and share. Remove the "Demo checkout" disclaimer.

**1.4 Copy pass for honesty.**
- Landing/about/checkout: "ready to book in one click" claims become "everything in one place, book each piece in a click." Add FTC-required affiliate disclosure ("Walter earns a commission when you book through our links") to footer + terms.

## Phase 2 — Cost & abuse protection

Every API route is currently open and spends real money (Claude, SerpAPI, RapidAPI) per hit.

- **2.1 Rate limiting** on `/api/generate`, `/api/quick`, `/api/suggestions`, `/api/packing-list`, `/api/flights`, `/api/hotels`, `/api/search`, `/api/compare` — per-IP via Upstash Redis (Vercel Marketplace) sliding window; generous for humans, fatal for scripts.
- **2.2 Input validation + clamps** on those routes: date ranges (≤ 30 days out to 1 year), traveler counts (1–10), string length caps, reject junk destinations before they reach paid APIs.
- **2.3 Security headers** in `next.config`: HSTS, X-Frame-Options, referrer policy, a workable CSP.
- **2.4 Spend guards:** usage alerts on Anthropic/SerpAPI/RapidAPI dashboards; cache identical searches (destination+dates) in Upstash for ~1h so repeat/shared traffic doesn't re-bill.

## Phase 3 — Observability

- **3.1 Sentry** — client + server + source maps. Provider failures (SerpAPI down, RapidAPI quota) captured with context, not just `console.error`.
- **3.2 Vercel Analytics + Speed Insights** — funnel visibility: land → generate → cart → checklist → outbound click. Outbound affiliate clicks are the revenue event; make sure they're tracked (the `affiliate_clicks` table gives us this server-side).
- **3.3 API route logging** — request id + provider latency per route (console structured logs are fine on Vercel).

## Phase 4 — SEO & surface polish

- **4.1 Metadata:** `sitemap.ts`, `robots.ts`, per-page `generateMetadata`, OG/Twitter card (static card first; dynamic OG image for `/shared/[slug]` is the nice-to-have since that's the viral surface).
- **4.2 Branded `error.tsx` + `not-found.tsx`.**
- **4.3 Legal/copy:** review `/about`, `/privacy`, `/terms` for real content + affiliate disclosure (ties to 1.4).
- **4.4 Dead code:** delete `lib/mockData.ts` (unused), remove empty `packages/ui` placeholder (keep `packages/api-client` — the app uses it).

## Phase 5 — Quality floor

- **5.1 Playwright smoke test** of the money path: land → search → trips (use curated-trips fallback so CI doesn't bill Claude) → add to cart → checklist renders → outbound link has affiliate param.
- **5.2 GitHub Actions:** lint + `tsc --noEmit` + build on push/PR.
- **5.3 Root ESLint + Prettier config** so both apps share one standard.

---

## Parking lot (post-launch, deliberately not now)

- Custom domain + project rename away from "scoutie"
- Real bookings v2: Duffel (flights), Expedia Rapid (hotels), Stripe — see PURCHASE_AGENT.md
- Transactional email (email the trip binder; Resend)
- Web dashboard ↔ mobile app trip sync
- Community page moderation/reporting
- Dynamic OG images per shared trip (if not done in 4.1)
