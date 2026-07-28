# Walter Web — Issue Register (production audit, 2026-07-28)

_Every known issue in `apps/web` (desktop + mobile-web), marked by severity. Compiled from a 3-dimension audit (journey/state, API/security, mobile-web/a11y/SEO/perf) — lean by design. The four highest-stakes claims (B1, B3, B4, B5) were re-verified by hand and are marked VERIFIED. Findings involving live Supabase RLS are marked SCHEMA — the repo migrations say one thing; confirm against the live dashboard before acting. Companion docs: [app_issues.md](app_issues.md) (mobile, cleared 07-28), [plan.md](plan.md)._

Severity: **[B] blocker** = gates a public launch · **[H] high** = fix before promoting the site · **[M] medium** = fix soon after · **[L] low** = polish

---

## 1. Launch gates

- [ ] **B1. False affiliate commission claims app-wide — VERIFIED.** "Walter earns a commission when you book through our links" renders in the global Footer (every page), /checkout, /results, /about, /terms, /privacy — but the affiliate env vars are absent in production, so every link is untagged and no commission exists. Terms even name Skyscanner, which isn't integrated. Replace with the softened mobile copy ("Each booking is completed on the provider's own site…"), and rewrite the terms/about/privacy affiliate sections. Flip back when M1-web (affiliate IDs) lands. (`components/AffiliateDisclosure.tsx:3`, `app/terms/page.tsx:67-74`)
- [ ] **B2. Dead legal contact emails on an unowned domain.** Privacy and terms publish privacy@scoutie.com and legal@scoutie.com; the product only controls scoutie.vercel.app, so the legal contact channels are fictional. Point both at a real monitored address (me@treyvititoe.com until a Walter domain exists). (`app/privacy/page.tsx:278`, `app/terms/page.tsx:245-248`)
- [ ] **B3. /api/trips/share: unauthenticated service-role writes — VERIFIED.** No auth, no rate limit, no body cap; anyone can flood the DB and mint public scoutie.vercel.app/shared/* pages carrying arbitrary phishing booking links and images. Fix: rateLimit + readJsonCapped + http(s)-URL validation + string/item caps. (`app/api/trips/share/route.ts:15-36`)
- [ ] **B4. /api/trips/shared serves private trips — VERIFIED.** The service-role query (bypasses RLS) selects `is_public` but never filters on it, and /api/trips/save assigns every trip a share_slug even when isPublic=false — every "private" trip is world-readable by slug or raw uuid. Fix: `.eq("is_public", true)`, drop the id lookup, only mint slugs on share. (`app/api/trips/shared/route.ts:30-32`)
- [ ] **B5. /api/trips/refine: no rate limit, unbounded body into Claude — VERIFIED.** The only Claude route with neither rateLimit nor readJsonCapped; message/trip/quizData are stringified verbatim into the prompt with a 120s maxDuration — unmetered token spend. Fix: mirror the guards on /api/generate. (`app/api/trips/refine/route.ts:8-46`)
- [ ] **B6. /api/trips/save silently drops the itinerary — SCHEMA.** Repo migrations enable RLS on trip_days/trip_items with no INSERT policies, and the route ignores every insert error — it would return success with an empty trip. Verify against the live dashboard, then check insert errors + add owner INSERT policies (or use the admin client post-auth). (`app/api/trips/save/route.ts:77-118`, `lib/supabase/migrations/001_initial_schema.sql:155-179`)

---

## 2. High — fix before promoting the site

**Journey & correctness**
- [ ] **H1. Results renders every API failure as fake "no results" with no retry.** All four fetches use `.then(r => r.json())` with no ok-check or error state; /api/flights even returns HTTP 200 with `{error, flights: []}`, making failure indistinguishable from empty by design. Mirror the mobile fix: per-fetch error cards with retry. (`app/results/page.tsx:475`, `app/api/flights/route.ts:40,57`)
- [ ] **H2. Date-shift bug class (same one fixed on mobile 07-20).** UTC parse/format shifts dates a day for US timezones: /trip hero (`new Date("YYYY-MM-DD")`, `trip/page.tsx:150`), /shared/[slug] dates (`shared/[slug]/page.tsx:247`), and `toISOString()` in results InlineDatePicker (`results/page.tsx:917`), curated-card prefill (`page.tsx:398`), quick fallback dates (`quick/page.tsx:107-108`). SearchBar's `parseYMD`/`formatYMD` are correct — reuse them everywhere.
- [ ] **H3. Empty `activityInterests: []` shadows real interests via `||`.** Entry flows put tags in `vibes`, but /results and /trip send `activityInterests || vibes` and `[]` is truthy — the /quick journey silently loses all user tags for events, suggestions, and packing. Use `?.length ? … : …` like trips/page.tsx:80-84. (`app/results/page.tsx:130,202`, `app/trip/page.tsx:88-89`)
- [ ] **H4. Dashboard "Your Trips" is permanently empty; /compare/saved unreachable.** Nothing ever inserts a trip with user_id (/api/trips/save has zero client callers). Wire the save modal to it for authed users, or drop the section. (`app/dashboard/page.tsx:40`)

**API & cost**
- [ ] **H5. Rate limiter is per-instance in-memory, and 8 routes have none at all.** Limits multiply with Vercel concurrency and reset on cold start; uncovered: trips/refine, trips/share, trips/shared, trips/save, trips/upvote, trips/community, affiliate/click, photo. Fix: shared store (Upstash/KV or WAF rules) + cover the stragglers. (`lib/apiGuard.ts:10-12`)
- [ ] **H6. Raw exception messages returned in body.error on generate/quick/suggestions/compare** — Anthropic SDK internals reach end users verbatim (clients render body.error directly). Log server-side, return a fixed friendly string like packing-list does. (`app/api/generate/route.ts:41`)
- [ ] **H7. /api/affiliate/click: clicks silently lost — SCHEMA.** Insert errors unchecked and the repo's only RLS policy requires auth.uid()=user_id, so logged-out clicks fail silently ({ok:true} anyway); migration column `click_url` vs route's `destination_url` is another silent mismatch. Revenue attribution is dead until fixed. (`app/api/affiliate/click/route.ts:16-24`)
- [ ] **H8. /api/trips/upvote broken under shipped RLS, vote-stuffable if opened — SCHEMA.** Community trips have user_id NULL so the anon update matches zero rows and 500s; fixing via an open policy would allow unlimited anonymous rewrites. Use a security-definer RPC + rate limit + dedup. (`app/api/trips/upvote/route.ts:28-40`)

**Presentation & reach**
- [ ] **H9. `ink-faint` fails contrast (~2.7:1) — the exact token bug mobile fixed 07-28.** Used for real reading text (prices, taglines, form headings, footer, the disclosure). Raise alpha 0.48 → 0.62 and mirror `on-light-tertiary`. (`tailwind.config.ts:15,38`)
- [ ] **H10. Shared-trip pages have zero metadata/OG.** The product's main viral surface previews as the generic homepage title + a 1.4MB hero. Add a server wrapper with per-trip generateMetadata. (`app/shared/[slug]/page.tsx:1`)
- [ ] **H11. No per-route metadata anywhere** — all 15 pages are client components; only privacy/terms export metadata. Add layout-level metadata or split static routes into server components. (`app/about/page.tsx:1`)
- [ ] **H12. Zero next/image usage.** 446KB hero to 375px phones with no srcset; explore grid (~12 images) not lazy. Biggest mobile LCP/bandwidth cost. (`app/page.tsx:240`, `app/explore/page.tsx:172`)
- [ ] **H13. OG image is a 1.37MB 4747x4000 JPEG declared as 1200x630** — scrapers reject or mangle it; link previews break. Export a real ~300KB 1200x630 crop. (`app/layout.tsx:26`)
- [ ] **H14. /trip mobile header: icon-only buttons with display:none labels (invisible to screen readers too) and probable 375px overflow clipping the Book CTA.** Add aria-labels + aria-hidden icons; hide the back-link text on mobile. (`app/trip/page.tsx:359`) _Overflow SUSPECTED — check visually._

---

## 3. Medium — fix soon

**Journey & state**
- [ ] **M1-web. Affiliate env vars absent** (`NEXT_PUBLIC_BOOKING_AFFILIATE_ID` / `NEXT_PUBLIC_TM_IMPACT_URL`) — same blocker-on-user as mobile M1; blocked on affiliate signups. When they land, also fix the /trip "Book Now" bypass (see Lows) and restore B1's copy. (`lib/affiliate.ts:11-12`)
- [ ] **M2. Save modal "Share with community" checkbox is a no-op** — collected, never used; users think they published. Wire it or remove it. (`app/trip/page.tsx:703`)
- [ ] **M3. Loading a saved trip destroys prefs** (dates/travelers/departure) — /saved and /compare/local overwrite walter_prefs with destination only; downstream /results can't search. Merge into prefs + persist dates on SavedTrip. (`app/saved/page.tsx:48`, `app/compare/local/page.tsx:44-47`)
- [ ] **M4. Hydration mismatch on /trip and /saved** — stores hydrate at module scope; non-empty carts flash the empty state + React hydration errors. Apply /checkout's `mounted` guard. (`app/trip/page.tsx:277`, `app/saved/page.tsx:15`)
- [ ] **M5. TripTracker "Share trip" copies a dead link** — copies the /results URL, which redirects everyone else to "/". Route through /api/trips/share or remove. (`components/results/TripTracker.tsx:51`)
- [ ] **M6. Silent curated fallback shows wrong-destination trips under the searched destination's heading.** Say so when the fallback can't match the city. (`app/trips/page.tsx:267`)
- [ ] **M7. Unguarded JSON.parse of walter_prefs at 5 sites** drops whole pages into the error boundary on corrupt data. (`app/results/page.tsx:73,102`, `app/clarify/page.tsx:44,101`, `app/compare/local/page.tsx:22,35`, `app/compare/saved/page.tsx:50`)
- [ ] **M8. Quick-plan flight prices hardcoded from LAX for everyone**, presented with no origin caveat. (`app/quick/page.tsx:120`)
- [ ] **M9. Doc drift: CLAUDE.md documents the deleted simulated checkout**, /checkout/confirmation journey, walter_booking contract; "/" now routes complete briefs straight to /results; walter_saved_trips / walter_compare_* / bookedIds undocumented. Rewrite Journey + API + contracts sections. (`CLAUDE.md`)

**API & cost**
- [ ] **M10. /api/photo: no rate limit, unbounded query, unbounded forever-cache Map** — trivial to burn the Unsplash quota (kills card images site-wide). (`app/api/photo/route.ts:14,48-60`)
- [ ] **M11. No timeouts on any upstream fetch** (SerpAPI, RapidAPI, Ticketmaster, Mapbox, Unsplash) — hung upstreams hold functions to maxDuration while mobile clients abort at 20s and retry, paying twice. `AbortSignal.timeout(8000)` everywhere. (`lib/services/flights.ts:252,315`, `hotels.ts`, `ticketmaster.ts`)
- [ ] **M12. Flight search fans out up to 17 billable SerpAPI calls per request** (1 list + 16 return-journey). Lazy-load returns or cut the cap to ~6. (`lib/services/flights.ts:334-342`)
- [ ] **M13. share_slug generated with Math.random** — predictable, and slugs are the only gate on shared trips; collisions 500 on the unique constraint. Use crypto.randomUUID/getRandomValues. (`lib/utils.ts:4-11`)
- [ ] **M14. /api/flights masks failures as HTTP 200 and leaks a `missing:{...}` debug object in 400s.** (`app/api/flights/route.ts:33,40,57`)
- [ ] **M15. /api/trips/save: no rate limit, raw req.json(), unbounded sequential per-day insert loop, unclamped numerics.** (`app/api/trips/save/route.ts:16,76-111`)

**A11y & mobile-web batch (one pass)**
- [ ] **M16.** No prefers-reduced-motion handling for Framer Motion (`<MotionConfig reducedMotion="user">`) · modals/sheets lack dialog roles, focus traps, Escape (`trip/page.tsx:674`, `TripTracker.tsx:246`, `SearchBar.tsx:538`) · cart remove buttons opacity-0 until hover — invisible to keyboard/touch (`TripTracker.tsx:140`) · Material Symbols render-blocking with no preconnect, ligature FOUT, ~150 icon spans not aria-hidden (`layout.tsx:44`) · duplicate `md:` breakpoint class in landing grids makes one dead (`page.tsx:315,335`) · white-on-accent CTAs ~3.2:1 (SUSPECTED — check) (`tailwind.config.ts:26`) · 780px When-popover overflows 768-820px viewports (SUSPECTED) (`SearchBar.tsx:1118`) · placeholder-only form labeling in quick input + SearchBar popovers (`quick/page.tsx:262`, `SearchBar.tsx:1011,1366`)
- [ ] **M17. Journey-internal routes are crawlable empty shells** (/results, /trip, /saved, /compare/*) — thin/duplicate content for bots. Disallow or noindex. (`app/robots.ts:11`)

---

## 4. Low — polish / parking lot

- [ ] Cross-tab drift: last-write-wins localStorage sync, no `storage` listener (stale tab reverts bookedIds). (`lib/stores/tripCartStore.ts:83`)
- [ ] /compare/saved renders "comparison of 0 trips" when fetches fail (also unreachable per H4). (`app/compare/saved/page.tsx:66`)
- [ ] Checkout shows raw ISO dates and "Book on google" lowercase provider labels. (`app/checkout/page.tsx:259`, `SuggestionCard.tsx:31`)
- [ ] /trip "Book Now" bypasses `affiliateUrl()` — untagged revenue leakage the moment IDs land. (`app/trip/page.tsx:853`)
- [ ] Duplicate saves by name allowed; /about still sells the deleted 7-step quiz. (`lib/stores/savedTripsStore.ts:31`, `app/about/page.tsx:8,76,82,201`)
- [ ] Middleware fires a Supabase auth round-trip on every request incl. all API routes — exclude /api in the matcher. (`middleware.ts:29,34-37`)
- [ ] Server-side geocoding rides on the public NEXT_PUBLIC_MAPBOX_TOKEN — breaks silently if the public token ever gets URL restrictions. Split a server-only token. (`lib/services/ticketmaster.ts:92`, `flights.ts:154`)
- [ ] No CSP — ship Report-Only first (shared pages render user-suppliable image URLs). (`next.config.ts:3-16`)
- [ ] mailto: share sets window.location on handsets — prefer navigator.share with fallback. (`app/trip/page.tsx:214`)
- [ ] NEXT_PUBLIC_SITE_URL must be set in Vercel prod or canonical/OG/sitemap silently stay on scoutie.vercel.app after a domain cutover. (`app/layout.tsx:7`, `robots.ts:3`, `sitemap.ts:3`)
- [ ] No structured data (Organization/WebSite JSON-LD, TouristTrip on shared/curated). (`app/layout.tsx:13`)

---

## 5. Verified clean (for the record)

- No secrets in git history (placeholder .env.example only); service-role key server-only; security headers (HSTS+preload, nosniff, X-Frame-Options DENY, Referrer-Policy, Permissions-Policy) actually applied.
- Core search/AI routes (flights, hotels, search, suggestions, quick, packing-list, generate, compare) all have rateLimit + real input validation (cleanString/clampInt/isReasonableDate) with 16KB body caps on generate/compare; all Claude calls have max_tokens caps; no URL-injection into providers; searchCache bounded + TTL'd, no poisoning vector; /api/photo is a redirect (no open-redirect, no hotlink proxy).
- No walter_booking or /api/checkout remnants; /checkout handles empty cart, $0 ("Included"), all-booked; SearchBar calendar is timezone-safe; stale-state hygiene on new journeys is solid; cart adds idempotent; store JSON.parse guarded.
- No emoji anywhere in apps/web; Mapbox GL only dynamically imported on /trip; MobileSearchSheet does mobile right (scroll lock, 44px targets, 16px inputs, safe-area insets); global focus-visible styles; robots+sitemap env-driven; branded 404/error pages.

## Suggested order of attack

1. **B1 + B2 (copy honesty + legal contact)** — small edits, no infra. Then **B3/B4/B5** (guard the three trips routes) — each is a contained route fix.
2. **B6, H7, H8** need the live Supabase schema checked first (repo migrations vs dashboard) — one look settles three items.
3. **H1-H3** (results error cards, date class, `||` bug) — direct ports of the mobile fixes.
4. **H9-H13** (contrast token, metadata/OG, next/image) — the reach/perf batch.
5. Mediums top-down, then lows. M1-web stays blocked on affiliate signups (same as mobile).
