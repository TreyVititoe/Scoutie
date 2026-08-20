# Session changes - 2026-08-20

## App Store submission run (pre-Brennan-meeting push)

- EAS production build #4 (v1.0.0) built and uploaded to App Store
  Connect via `eas submit` — first binary carrying the group-trip price
  fix (7f3707f). Builds #2/#3 lack it.
- Five 6.9" screenshots (1320x2868) captured from the iPhone 17 Pro Max
  simulator at `docs/screenshots/01..05.png`: Home, Plan a trip,
  Results (live JFK->BCN fares), Trip (map + $3,130 cart), Checkout
  ("2 of 5 booked"). Journey state seeded via AsyncStorage manifest;
  navigation driven through Metro's Hermes inspector (imperative
  `router.push`) because simctl openurl trips the scheme dialog.
- Clarify screen skipped as a screenshot: its `headerLargeTitle` renders
  as a blank band in the modal on the iOS 26 simulator — worth a look
  on-device someday (title "A few details" missing; compact headers on
  the other modals render fine).
- docs/asc_listing.md now ends with a FINAL SUBMISSION CHECKLIST — the
  remaining steps are all in Trey's ASC login (rename record, privacy
  labels, screenshots, EU trader call, select build 4, submit).

# Session changes - 2026-08-07

## Landing + results polish (commits cb7dce7, 2796cbd, 4edeafd, d2b4ac2)

- Footer condensed from three link columns plus a second tier to one
  compact band: inline links, copyright, affiliate disclosure below.
- Hero photo and frosted-glass panel removed ("too loud"); replaced
  with the plain daylight field, then built up an animated shape field
  behind the type: ~35 shapes in five shades of blue (blurred color
  masses, rings, dashed/half rings, solid circles, diamonds, pills,
  triangles, plus signs, dots) on three drift cycles plus two spin
  speeds, all frozen under prefers-reduced-motion. Direction: "lots of
  different shapes, all shades of blue, moving," with solid fills.
- "View tickets" on priceless /results event cards was a styled <p>
  pretending to be a button; now a real tracked affiliate link
  (trackAndOpen + affiliateUrl) opening Ticketmaster in a new tab.
  Events with no URL say "Price at box office."

## App Store: production build #2 built and uploaded to TestFlight

- Root cause of the failed EAS build: apps/web resolved React 19.2.5 while
  React Native requires exactly 19.2.0, so npm nested react/expo-router/
  expo-font under apps/mobile and babel-preset-expo (hoisted to the root)
  could no longer resolve expo-router -- its router plugin silently never
  ran and bundling died on EXPO_ROUTER_APP_ROOT. Fixed with a root
  package.json `overrides` pinning react/react-dom to 19.2.0 so everything
  hoists again. Also added the missing @expo/metro-runtime dependency.
- `expo prebuild -p ios --clean` regenerated the native project (required
  by the July NetInfo/app.json changes), production build #2 compiled on
  EAS and was submitted to App Store Connect (Apple ID 6790163527, now
  pinned as ascAppId in eas.json for non-interactive submits).
- ASC listing draft (name, description, keywords, privacy labels, review
  notes, screenshot plan) written at docs/asc_listing.md.
- Verified after the React pin: web tsc, vitest 12/12, next build, and
  expo export all pass.
- Note: a full disk corrupted node_modules mid-session and masked the
  real error for a while; Trey freed space.

# Session changes - 2026-08-06

## Hardening: CSP enforced + durable rate limiting (commit be97cd1)

- CSP flipped from `Content-Security-Policy-Report-Only` to enforcing
  `Content-Security-Policy` in `next.config.ts`, after Trey browsed the full
  journey with the console open and saw zero violation reports. New
  third-party origins must be added to the policy or the browser blocks them
  silently.
- Rate limiter moved to Upstash Redis: Trey provisioned "Upstash for Redis"
  through the Vercel Marketplace (`upstash-kv-aquamarine-drum`, free plan)
  and connected it to the project, which injects `KV_REST_API_URL` +
  `KV_REST_API_TOKEN`. `rateLimit()` in `lib/apiGuard.ts` is now async and
  counts in Redis (INCR + PEXPIRE NX + PTTL in one pipelined round trip),
  so limits hold across serverless instances and cold starts. The old
  in-memory Map remains as the fallback when the vars are absent (local
  dev, CI) or Redis errors. All 18 route call sites now `await rateLimit()`.
- Verified: web tsc clean, vitest 12/12, `next build` passes.

# Session changes - 2026-07-31

This file is the running changelog. Each session adds a dated section at the
top. Log every user-visible or structural change here before it is pushed.

## Legal + verification

- Legal entity renamed to "Walter, Inc." in `terms/page.tsx` (IP, liability, indemnification) and the `Footer.tsx` copyright. The entity is registered as Walter, Inc.
- Live Supabase schema verified against project `gwuddjtqxmhewkfzjcos` via the Management API: `trip_days`/`trip_items` are SELECT-only (the admin-client write path is required), `affiliate_clicks.click_url` exists, `trips.is_public` + `share_slug` exist. No code changes needed.
- A read-only `supabase-walter` MCP server was added to the user config for future DB checks.

## Fixes from the first visual pass (mobile)

- Mobile search sheet: rendered through a portal to `document.body`. It was trapped in the landing page's sticky `z-[45]` stacking context, so the `z-50` site header overlapped its close button (`SearchBar.tsx`).
- `/trips` event previews: `/api/generate` now returns `liveEvents` as `{name, image}` (Ticketmaster hero image) and the cards render a 36px thumbnail per event, falling back to the ticket icon when there is no image.
- `/results` tab bar: on narrow screens a right-edge fade + chevron shows while more tabs sit off-screen; tapping it scrolls the strip. Hidden once scrolled to the end and on `md+`.
- Flights: diagnosed empty results as SerpAPI HTTP 429 -- the account quota is spent (each search costs up to 7 SerpAPI calls). `searchFlights` now throws on 429 so `/api/flights` answers 502 and the client shows its retryable error card instead of a confident empty state. Restoring flights needs the SerpAPI plan topped up.
- Landing hero copy: "your AI travel companion" -> "your travel companion". Decision: AI is not brand language on the front page.
- SerpAPI plan upgraded by Trey to 1,000 searches/month ($25/mo); new API key set in Vercel.
- "Edit trip" on `/results` now links to `/?edit=1`: the landing page restores the trip facts from `walter_prefs` into the SearchBar and auto-opens it (sheet on mobile, Where popover on desktop) instead of dumping the traveler on a blank home page.

# Session changes - 2026-06-10

## Theme: dark to bright "daylight field"

- `tailwind.config.ts`: new tokens `ink` / `ink-soft` / `ink-faint`, `paper`, `card`, `line`; `surface-1/2/3` now bright; legacy `quiet-slate` / `raised-slate` / `hover-slate` / `page-bg` / `gray-dark` re-pointed bright so unswept files flip with the theme. `tinted-pitch` stays dark, reserved for photo overlays; `snow-off-glacier` stays near-white for text on photos and accent fills.
- `globals.css`: nav-glass light, card-base white with line hairline, bright hero radials, soft shadows in `rgba(20,30,60,...)`.
- `CLAUDE.md`, `DESIGN.md`, and `.impeccable/design.json` updated to the bright system (canvas Paper, text Ink, cards Card with Line hairlines; cornflower accent unchanged).

## Canonical journey built

- `/`: search pill, validation + keyboard fixes; routes to `/trips`
- `/trips` (NEW): three AI-matched trip cards via `POST /api/generate`, curated-trips fallback, writes `walter_trip`
- `/results`: manual add only, `walter_trip` hero, sticky cart bar
- `/trip`: share-by-email via share link + mailto, "Book everything" CTA
- `/checkout` (NEW): traveler form, one-button "Book it all", `POST /api/checkout` simulated booking agent
- `/checkout/confirmation` (NEW): end page, reads `walter_booking`, confirmation codes, demo-checkout footnote

## localStorage contracts

- `walter_prefs` (search prefs), `walter_trip` (chosen trip `{id, title, destination, days, estTotal, summary, tier}`), `walter_cart` (cart store), `walter_booking` (checkout result)

## Deletions

- `app/old/home`, `app/preview`, `app/onboarding` + `components/onboarding/*`
- Root `app/compare/page.tsx` (`compare/local` and `compare/saved` kept)
- `components/quiz/Step*.tsx` + `StepWrapper` + `StepAboutYou` + `DestinationAutocomplete`, `components/trip/RefinementChat`, `components/results/ExperienceCard`, `components/CommunityTrips`
- `lib/stores/quizStore.ts`: the 7-step quiz no longer exists; the SearchBar pill on `/` plus `/clarify` and `/quick` are the entry flows

## New files

- `PURCHASE_AGENT.md` at repo root: feasibility verdict on real auto-booking

## Route audit

- Fixed 13 dead links / stale-state bugs: explore `?destination=` prefill now works, stale `walter_trip` cleared at 7 entry points, legacy `scoutie_prefs` fallback removed

---

# Session changes — 2026-05-19 to 2026-05-22

Multi-session work. Localhost first, push pending on user request.

---

## /results pass (impeccable critique, 2026-05-22)

Heuristic score went from **17/40 → projected 28-30/40**. Full session executed: all P0s, P1s, P2s, and minor sweep, plus the structural rework.

### Token migration (bulk replace across 6 results files)
- `text-gray-dark` → `text-snow-off-glacier`
- `text-on-light-secondary` → `text-white/70`
- `text-on-light-tertiary` → `text-white/45`
- `text-on-surface` → `text-snow-off-glacier`
- `text-on-surface-variant` → `text-white/55`
- `border-black/5`, `border-[rgba(91,141,239,0.06|0.08)]` → `border-white/10`
- `bg-on-light-tertiary` → `bg-white/30`
- `bg-gray-light` → `bg-raised-slate`
- `bg-page-bg` (when used inside skeletons / cart rows) → `bg-raised-slate`
- `bg-[#DBEAFE] text-accent` (light-era pale-blue chip) → `bg-tinted-pitch/85 text-reykjavik-sky border border-white/10`
- `bg-white` mobile sheet → `bg-quiet-slate`
- `border-t border-[rgba(91,141,239,0.08)]` → `border-t border-white/10`
- All em-dashes (` -- `, `->`, `--$`) → commas, periods, or " to "

### Card chip culling (one chip max per card)
- **FlightCard**: replaced 4-chip stack ("Best price", "Direct", "Quick flight", "Roundtrip") with a single "Walter's pick" badge top-right when cheapest, plus a quiet "Nonstop" label next to the airline name. Buttons reshaped to rounded-pill, primary fill = cornflower with snow-off-glacier text, ghost = white/25 outline with `hover:bg-white/10`.
- **HotelCard**: replaced 4-chip stack ("Best value", "Exceptional", "Highly rated", "Budget-friendly") with single "Walter's pick" badge when bestValue. "Exceptional" superlative deleted (Earned Superlative Rule). Price color shifted from `text-accent` to `text-snow-off-glacier` (price is no longer accent).
- **EventCard**: replaced category + Free + Under $30 + matchReason stack with single category badge. `--${event.priceMax}` em-dash range becomes " to ${event.priceMax}".
- **SuggestionCard**: dropped redundant time-of-day chip ("Best in morning" etc.), kept type label as uppercase eyebrow, simplified to one info hierarchy.

### Structural rework (the big one)
- **Glassmorphism tab bar removed.** Was `bg-white/25 backdrop-blur-2xl backdrop-saturate-150` with 4-layer box-shadow. Now a flat `bg-page-bg/85 backdrop-blur-md` band with `border-y border-white/8`. Tab pills are `bg-hover-slate` (active) and `bg-white/8 hover:` (idle). No colored shadow.
- **Hero with destination photograph.** `/results` now opens with a full-bleed photograph from `getDestinationImage(destination)` (the destination-to-Unsplash mapping helper). Tinted-pitch gradient overlay bottom. H1 is left-aligned, destination name only (no `Build your trip to <span text-accent>{dest}</span>` wrap), subhead is "Walter has picked a spine. Swap anything you don't like." Hero eyebrow shows the trip window ("May 22 to May 30").
- **"Walter's trip so far" spine.** New section above the tab bar with 3 slots: Flight / Stay / One night out. Each slot shows Walter's default pick (cheapest flight, best-value hotel, top event) with title, subtitle, price, and a "Swap" link that switches to the right tab. Empty state per slot ("Walter is still picking. Browse alternatives."). Honors the Booking Spine Rule and PRODUCT.md "the cart is the proof."
- **Section headers de-eyebrowed.** Was icon + H2 + paragraph subtitle + "{count} found" right-side label. Now a single Headline-weight line: "12 flights from Chicago", "5 stays in Reykjavík", "8 events during your trip". Honors One-Headline Rule.
- **313-line dead `DatePicker` removed.** Component was defined inside `page.tsx:618-930` but never referenced in JSX. Deleted.
- **Empty states unified.** Three near-identical "No X found" blocks collapsed into one `EmptyState` component, neutral copy, no flashy icon.
- **Skeleton placeholders use `bg-raised-slate`** (was `bg-page-bg` which was invisible against the dark canvas).
- **AiItineraryBanner** restyled: bullet icon switched to `text-accent-light`, gradient-row pills swapped to the proper Tinted-Pitch chip spec, prices to `text-snow-off-glacier`.
- **Header** restyled to match landing chrome: Walter logo with cyan→accent-light gradient chip, ghost "Edit trip" link.

### Inline pickers reskinned
- `InlineDepartureCity`: pill-shaped input with `bg-raised-slate border-white/10`, focus on cornflower border, Mapbox autocomplete dropdown switches to `bg-quiet-slate` with proper `popover-shadow`.
- `InlineDatePicker`: card-base cards with hover `border-white/20`, "Days" line uses `text-accent-light`, body in `text-snow-off-glacier`.

### Minor sweep
- `useTripCartStore.getState().clearCart()` was previously called destructively on every landing mount; that was fixed in earlier session.
- Cart count badge `bg-accent text-white` → `bg-accent text-snow-off-glacier`.
- Disabled "View My Trip" CTA: `bg-gray-light text-on-light-tertiary` → `bg-raised-slate text-white/45`.
- "Link copied" tooltip: previously `text-accent bg-accent-light` (illegible cornflower-on-cornflower) → `text-snow-off-glacier bg-tinted-pitch border border-white/15`.
- `FlightCard` cart title `->` ASCII arrow → comma.
- `HotelCard` "per night -- $total" → "per night. $total".
- `EventCard` `, ${event.priceMax}` → ` to ${event.priceMax}` (preserves comma elsewhere).
- All Add-to-Trip / View Trip / Share buttons aligned to system: rounded-pill (was rounded-[10px]), white/25 border ghost (was accent border), cornflower fill primary.

Files touched in this pass (all under apps/web):
- app/results/page.tsx (full rewrite, ~720 lines net)
- components/results/FlightCard.tsx
- components/results/HotelCard.tsx
- components/results/EventCard.tsx
- components/results/SuggestionCard.tsx
- components/results/TripTracker.tsx
- components/results/ExperienceCard.tsx (token migration only; component still unused)

---

# Session changes — 2026-05-19 to 2026-05-21

Working on localhost only this session; no pushes.

## Routing

- [x] Moved former landing (`apps/web/app/page.tsx`) → `apps/web/app/old/home/page.tsx`
- [x] Moved former `/quiz` page → new `apps/web/app/page.tsx` (so `localhost:3000/` is now the search/quiz landing)
- [x] Removed empty `apps/web/app/quiz/` directory
- [x] Rewrote 21 internal `href="/quiz"` / `router.push("/quiz")` references → `/` (across all pages)
- [x] Fixed `/quiz?destination=…` template literal on `explore/page.tsx` → `/?destination=…`
- [x] Fixed `old/home/page.tsx` import: `../components/CommunityTrips` → `@/components/CommunityTrips`

## Theme — dark palette migration (strategy: redefine existing tokens so the whole site flips)

### `tailwind.config.ts` token re-mapping

| Token | Before | After | Role |
|---|---|---|---|
| `page-bg` | `#EEF4FF` (light blue) | `#0A0A0A` (near-black) | Page background |
| `gray-dark` | `#1E2D60` (dark navy) | `#FFFFFF` (white) | Primary text |
| `gray-light` | `#f5f5f7` | `#141414` | Card surface |
| `on-light-secondary` | `rgba(0,0,0,0.55)` | `rgba(255,255,255,0.7)` | Secondary text |
| `on-light-tertiary` | `rgba(0,0,0,0.35)` | `rgba(255,255,255,0.45)` | Tertiary text |
| `surface-dark.1` | `#1F2D5A` (navy) | `#141414` | Card surface |
| `surface-dark.2` | `#283566` (navy) | `#1F1F1F` | Elevated surface |
| `accent` | `#5B8DEF` | unchanged | Highlight (small uses only) |
| `accent-light` | `#7BA3F4` | unchanged | Highlight hover |
| `cyan` | `#38BDF8` | unchanged | Secondary accent |

Added new tokens: `surface-1` (`#141414`), `surface-2` (`#1F1F1F`), `surface-3` (`#2A2A2A`).

### `globals.css`

- `body`: explicit `background: #0A0A0A; color: #FFFFFF`
- `.nav-glass`: navy translucent → `rgba(10,10,10,0.82)` + 1px white/6 bottom border
- `.bg-hero-gradient`: blue gradient → `linear-gradient(165deg, #141414 0%, #050505 100%)`
- `.hero-glow`, `.hero-radial`, `.hero-radial-light`: blue rgba opacities softened for dark backdrop
- `.glass-card-dark`: blue tint → white/4 with white/8 border
- `.card-base`: white → `#141414` with white/6 border; hover border white/12; shadows darkened
- `.icon-gradient`: light-blue gradient → flat `rgba(91,141,239,0.12)` (accent at low opacity)
- `.shadow-elevated`: darker drop shadow tuned for dark bg

### Components updated for dark theme

- `components/quiz/SearchBar.tsx`:
  - Pill base: white → `#141414` with white/10 ring + heavy dark shadow
  - Section dividers: black/10 → white/10
  - Active section: white pop → `#2A2A2A` lift with darker shadow
  - PopoverShell: white bg → `#141414` with white/8 border
  - Where popover suggestion icons: light-blue gradient → `accent/15` with `accent-light` icon color
  - When popover: Dates/Flexible toggle (`#EBEBEB` → `#2A2A2A`, active `#3A3A3A`); past-date opacity tuned; in-range cell `bg-[#EEF4FF]` → `bg-accent/20`; nav arrows hover `bg-page-bg/60` → `bg-white/8`
  - When flex chips: black borders → white/20, active state black-on-white
  - Who popover: divide-y, all border-black/* → white/8, white/25
  - What popover: textarea border + suggestion icon borders flipped to white/15

- `app/page.tsx` (new landing):
  - Card skeleton placeholders: `bg-page-bg` → `bg-white/5` and `bg-white/8` so they're visible on the now-dark card
  - Trip card cost row border: `border-[rgba(91,141,239,0.05)]` → `border-white/8`
  - Trip card upvote secondary text: `text-on-light-tertiary` → `text-white/45`

## Pages touched in this pass

- [x] `/` (new landing — former quiz)
- [ ] `/old/home` (former landing — still uses light-mode card chrome; let user decide if old/home needs reskinning or stays as a snapshot)
- [ ] `/about`
- [ ] `/auth/login`
- [ ] `/compare`, `/compare/local`, `/compare/saved`
- [ ] `/dashboard`
- [ ] `/explore`
- [ ] `/onboarding`
- [ ] `/quick`
- [ ] `/results`
- [ ] `/saved`
- [ ] `/shared/[slug]`
- [ ] `/trip`

Many of these pages will already look mostly correct thanks to the token redefinition (any `bg-page-bg`, `text-gray-dark`, `text-on-light-*` references auto-flip). Pages with hardcoded `bg-white` solid containers (about, preview, auth/login, explore tag chips, results dropdowns, etc.) will still look bright until updated — flag any that look broken and I'll fix as we go.

## Navbar — new landing

- Replaced minimal `Walter + Exit` header with a real top nav.
  - Left: Walter wordmark (logo color of letter "W" flipped from `text-accent-deep` to `text-black` since the badge gradient is light cyan).
  - Center: nav links — **Quick plan** (→ `/quick`, with `bolt` icon in accent-light), **Explore**, **Saved**, **Trips** (→ `/dashboard`).
  - Right: text **Sign in** + filled **Get started** pill (white bg, black text — Walter's first pure-white CTA, used sparingly).
- Removed the `store.resetQuiz()` Exit button (no longer makes sense on the landing).
- Bumped header `z-20` → `z-30` so popovers can't paint over it.

## Z-index fix — SearchBar popovers behind trip cards

- Hero section `<section ... relative>` → `relative z-20`. Trips section is `relative z-10`, so the hero's stacking context (containing the popovers at internal z-30) now sits above the cards. Verified at `localhost:3000/` (200 OK, typecheck clean).

## Dev

Dev server running in background (job `bsnkcgfw0`); landing returns 200 OK at `http://localhost:3000/`.

## Critique pass — 8 items shipped (impeccable critique /)

### P0 Hero gets a photograph
Replaced the dark-gradient hero (no imagery) with a full-bleed Iceland landscape from Unsplash (`photo-1529888830731-7adc663dafcf`, 2400px, fetchPriority="high"). Tinted-pitch gradient overlay at the bottom for SearchBar legibility, cornflower radial layered above at 30% opacity. Hero h1 jumped 36/52 to 40/64 with a `Reykjavík, Iceland` location eyebrow, left-aligned (was center). Honors The Field Cinematographer Rule directly.

### P0 "Steal a trip" distilled
Was a 12-tile Pinterest grid at 2/3/4/5/6 columns. Now a 1/2/3 column editorial row with 4:3 image (was h-32 fixed), 18px title, 13.5px Walter-voice description line, price + "all in" qualifier (replaces upvote chrome above the fold). Capped at 6 cards visible; "More trips" outline-bottom link reveals further. Honors the "Walter does not list, it commits" PRODUCT.md doctrine.

### P1 SearchBar uses named tokens
Replaced every raw hex (`bg-[#141414]`, `bg-[#2A2A2A]`, `bg-[#3A3A3A]`) with the named slate tokens (`bg-quiet-slate`, `bg-hover-slate`, `bg-raised-slate`). The flexible-date selected chip is `bg-snow-off-glacier text-tinted-pitch` (not `bg-white text-black`). Search button text `text-snow-off-glacier` (not `text-white`). Where input + popover titles + calendar month labels now `text-snow-off-glacier` (not legacy `text-gray-dark`).

### P2 What popover speaks trip, not Airbnb-stay
Suggested descriptions rewritten in trip-vibe register:
- "Long walks, slow mornings, a great dinner reservation."
- "Hikes, hot springs, no cell service."
- "Museums, architecture, a Tuesday opera."
- "Beach, no schedule, one good book."
Placeholder is now "Tell Walter what kind of trip. He'll handle the logistics." (was kitchen/yard listing copy).

### P2 Footer reskin
- Removed `bg-hero-gradient` and the second `hero-glow` radial (was double-radial competing with hero).
- Replaced every `hover:text-cyan` and `border-cyan/*` with `hover:text-white` and `border-white/10`. Cyan/First Light is now reserved for the logo only, per The One Voice Rule.
- Dropped uppercase column labels (Material-era pattern); column heads are sentence-case at white/45.
- Replaced product blurb with brand line: "The world is wasted on people who stay home."
- "Privacy Policy" / "Terms of Service" → "Privacy" / "Terms" (tighter).

### Minor bug sweep
- **Em dash in `app/layout.tsx` tab title removed.** "Walter -- One Quiz. Your Whole Trip." → "Walter. The world is wasted on people who stay home." Meta description rewritten in Walter voice.
- **`bg-white/8` / `border-white/8` / `ring-white/8` / `divide-white/8` / `hover:bg-white/8` all bumped to `/10`.** Tailwind's default opacity scale does not include `/8`, so all instances were silently failing. Bulk fix across `apps/web` (24 sites). Sole exception kept: `border-t border-white/8` in places where the agent flagged needing it; those got the same `/10` treatment.
- **`.card-base` rest shadow removed in `globals.css`.** Direct violation of The Float-Earns-Shadow Rule ("Shadow appears only on hover or focus, or on elements that genuinely float"). Cards are flat at rest, lifted (`translateY(-2px)` + `0 8px 24px shadow`) on hover. Transition curve switched to `cubic-bezier(0.2, 0.8, 0.2, 1)` site-wide (200ms).
- **`useTripCartStore.getState().clearCart()` removed from landing mount.** Was destructively clearing the user's cart on every visit to `/`. Now only fires when the user explicitly initiates a search via `handleSearch`.
- **"1 guest" pre-fill bug fixed.** SearchBar's initial `adults` was being pulled from `useQuizStore`'s persisted state (default 1). The landing's SearchBar now always initializes at 0 for all fields, so a fresh visit shows "Add guests" placeholder. The quiz store still persists across longer flows; this only changes the SearchBar's first-paint behavior.
- **Tailwind accent colors aligned to OKLCH.** `tailwind.config.ts` accent/accent-light/cyan/etc. were still hex while DESIGN.md normalized them to OKLCH. Now hex strings are gone; the token source-of-truth matches the doc. Registered new utility classes: `bg-tinted-pitch`, `bg-quiet-slate`, `bg-raised-slate`, `bg-hover-slate`, `text-snow-off-glacier`, `text-cornflower-beacon`, `text-reykjavik-sky` (the descriptive names from DESIGN.md now work in any class).

## Deferred to next turn
- **Hero copy rewrite** (P1) — needs voice direction before committing. Current subhead "Tell Walter the basics, or fork a trip others have built." stays for this pass.
- **Textarea-first input prototype** (Provocative #2) — needs a `shape` conversation about whether it replaces the pill or sits beside it as a /craft variant.

## Design substrate written (impeccable teach + document)

- `PRODUCT.md` written at repo root. Register: `product`. Voice: confident / cinematic / alive. Source mythology: Walter Mitty. Refs: Patagonia + Airbnb 2014-2017. Anti-refs: Kayak/Expedia/Booking, Pinterest listicles, generic AI landings. Five design principles ("Show the place", "Resist grey", "The cart is the proof", "No hype no listicles", "Confidence in motion").
- `DESIGN.md` written at repo root. North Star: "The Field Cinematographer". Tonal-layered elevation strategy. 8 named colors with descriptive slugs (Cornflower Beacon, Reykjavík Sky, First Light, Tinted Pitch, Quiet Slate, Raised Slate, Hover Slate, Snow Off Glacier). 10 Named Rules across the six sections.
- `.impeccable/design.json` sidecar with 7 component snippets (button-primary, button-ghost, nav-link, card-trip, search-pill, popover-shell, chip-tier-badge), shadow vocabulary, motion tokens, tonal ramps for primary colors.

### Outstanding token alignment (not blocking)

`tailwind.config.ts` still expresses accent blues as hex (`#5B8DEF`, `#7BA3F4`, `#38BDF8`) while DESIGN.md normalizes them to OKLCH (`oklch(0.65 0.135 263)` etc.). Tailwind accepts either format so nothing is broken; aligning the config to OKLCH later would unify the source of truth and remove the Stitch linter warning.

### Loader override note

The `load-context.mjs` script resolves `contextDir` to `apps/web` by default; for this repo, future impeccable invocations should pass `IMPECCABLE_CONTEXT_DIR=/Users/treyvititoe/projects/Walter` so PRODUCT.md and DESIGN.md at the repo root are picked up.

## How to use /impeccable on this project (suggested)

1. `/impeccable teach` — set up `PRODUCT.md` + `DESIGN.md` (currently missing; future invocations stay grounded once these exist)
2. `/impeccable critique /` — heuristic UX review of the new dark landing
3. `/impeccable polish /results` — final-pass cleanup before that page ships
4. `/impeccable adapt` — when we want mobile parity on a specific page
5. `/impeccable live` — pick elements in the browser and generate variants (best for marketing surfaces)

# Session changes - 2026-07-07

## Production push (plan.md / app_plan.md executed)

Web:
- `/checkout` rewritten as an affiliate booking checklist (deep links + click tracking + booked toggles, progress persisted in `walter_cart.bookedIds`); `/checkout/confirmation` now redirects there; `/api/checkout` deleted.
- `lib/affiliate.ts`: `providerLabel` / `affiliateUrl` / `lookupUrl`; affiliate tags env-driven (`NEXT_PUBLIC_BOOKING_AFFILIATE_ID`, `NEXT_PUBLIC_TM_IMPACT_URL`), pass-through until program approvals land.
- `lib/apiGuard.ts` + `lib/searchCache.ts`: per-IP rate limits, input clamps, and 1h caching on all paid API routes. `next.config.ts`: security headers (CSP deferred).
- SEO: metadataBase + OG/Twitter, `sitemap.ts`, `robots.ts`, branded `error.tsx`/`not-found.tsx`.
- `next lint` was broken (removed in Next 16): replaced with eslint flat config; vitest unit tests for apiGuard/affiliate; `.github/workflows/ci.yml` runs lint+test+build; Vercel Analytics + Speed Insights mounted.
- Deleted dead `lib/mockData.ts` and empty `packages/ui`.

Mobile:
- EAS project created (`1950ce6e-c7c7-4dcd-b7fa-8e28e164553d`, owner treyvititoe) + `eas.json` (dev/preview/production; `EXPO_PUBLIC_API_BASE_URL` per profile); Supabase/Mapbox env vars pushed to EAS production+preview.
- `app.json`: iOS privacy manifest added, `supportsTablet` false, removed unused `expo-secure-store` plugin (source of the stray Face ID permission).
- `app/auth-callback.tsx` (NEW): handles `walter://auth-callback` magic links (setSession or verifyOtp) - email sign-in now completes in production builds.
- Checkout parity: `TripCartItem` gained `bookingUrl`/`provider` (results screens now populate them), cart store gained `bookedIds`/`toggleBooked`, `app/checkout.tsx` (NEW) is the booking checklist, trip screen gained the "Book your trip" CTA.
- Trip map now geocodes the destination (was centered on [0,0]); packing list got an error+retry state; fixed pre-existing invalid header props in the tabs layout.

---

# Session changes - 2026-07-28

## app_issues.md register cleared (mobile pre-store audit)

Decisions locked with the user: **Section 0 = Option A** (accounts stay parked for v1), H3 = inline date prompt, H6 = wire the heart, M1 = soften the commission copy until affiliate IDs exist.

- **H3**: Results shows an inline `DatesPrompt` card (DateRangePicker) and holds all four searches until dates exist — catches the Quick tab and Compare "Build this" dateless paths.
- **H4 + M4**: NetInfo installed and react-query `onlineManager` wired at module scope; Results has isPaused ("You're offline") and isError retry cards on flights/stay/events/picks. `packages/api-client` now surfaces the route's friendly `{ error }` body (429 included) and a human timeout message — upgrades web error text too.
- **H6 + M9 + M10**: TripCard heart toggles savedTripsStore (`curated-` ids reopen into clarify); trip bookmark uses a stable destination+dates id, re-saves in place, fills when saved; bookedIds persist on SavedTrip and restore on reopen.
- **H7**: clarify gets KeyboardAvoidingView + `keyboardShouldPersistTaps="handled"`; same persist-taps on Results.
- **H8 + M1**: new `LegalLinks` (privacy/terms, env-driven base) on Home footer, checkout, Profile, login; checkout disclosure now the neutral provider-handoff line.
- **Mediums**: M3 empty-cart checkout guard, M5 persist version/migrate on all stores, M6 Compare snapshots prefs at mount (no silent regen), M11 Compare empty state, M12 map gestures off, M13 empty-trip copy + action, M14 full a11y pass (labels/roles, hitSlop, ink-soft/faint darkened to 0.78/0.62, tab-bar Dynamic Type caps, raised Home rebuilt as a sibling so its top half is tappable), M15 resolved-by-decision (keep the location string; never declare location in ASC labels).
- **Lows**: "Find online" label for web-provider items, affiliate click tripId, journey-order groups + "Free" for $0, AirportAutocomplete FlatList → plain map, dead rail chip removed, safeStorage wrapper, splash key → expo-splash-screen plugin, Android package aligned to `com.walterus.app`, 11 Expo packages bumped (`expo install --check` clean).

Verified: `apps/mobile` tsc clean, `apps/web` tsc clean, web vitest 12/12. **Native modules changed (netinfo) + app.json changed → `expo prebuild -p ios` before the next build.** Remaining in register: M1 env vars (user signups), B1/B2/B3, ASC privacy labels.
