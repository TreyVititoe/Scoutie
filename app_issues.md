# Walter Mobile — Issue Register (pre-App-Store audit, 2026-07-19)

_Every known issue in `apps/mobile`, marked by severity. Compiled from an 8-dimension multi-agent audit (store compliance, build config, auth, checkout/affiliate, per-screen bugs, state/data, UX edges, plan verification) — 99 raw findings deduplicated to the list below. The adversarial verification pass was cut short to save usage, so treat uncited line numbers as approximate; the two highest-stakes claims were re-verified by hand and are marked VERIFIED. Companion docs: [app_plan.md](app_plan.md), [plan.md](plan.md)._

Severity: **[B] blocker** = gates submission · **[H] high** = fix before launch · **[M] medium** = fix soon after · **[L] low** = polish

---

## 0. The decision that shapes everything: accounts are parked

**VERIFIED:** `app/(tabs)/_layout.tsx:152-154` hides both the explore and profile tabs (`href: null`, comment: "Accounts are parked; the screen stays reachable by code only"). The only route to `/auth/login` is through the hidden profile screen — **no user or App Store reviewer can ever reach sign-in in the shipping UI.**

Consequences:
- **As shipped, Apple's account-deletion rule (5.1.1(v)) does not apply** — three audit dimensions flagged "no in-app account deletion = guaranteed rejection," but that only bites if account creation is reachable.
- The still-open "magic-link end-to-end device test" from app_plan.md is moot while parked.
- The latent `usesAppleSignIn` entitlement and unreachable login screen are harmless.

**Choose before submission:**
- [ ] **Option A — ship with accounts parked (recommended for v1).** Smallest review surface, zero auth risk. Update app_plan.md 1.3/4.3 and the App Review notes to describe an auth-less app. The M-AUTH items below become post-launch work.
- [ ] **Option B — go live with accounts.** Then these become mandatory pre-submission: in-app account deletion (server endpoint calling `auth.admin.deleteUser` + Apple token revocation — anon client cannot delete users) [B], magic-link end-to-end test on a physical device [B], Supabase redirect-allowlist confirmation for `walter://auth-callback` [B], and the M-AUTH fixes below [H].

---

## 1. Submission gate (blockers regardless of the accounts decision)

- [ ] **B1. Phase 4 untouched — no store presence.** `eas.json` `submit.production` is `{}` (no ascAppId/appleTeamId); no App Store Connect record, listing metadata, screenshots, or privacy nutrition labels exist. Create the ASC app under the Praxis team, write the listing, fill submit config, nominate for featuring. (`eas.json:27`)
- [ ] **B2. Only finished production build (v1.0.0 #1, 2026-07-12) is stale** — predates the home redesign (761840c), hotel photo carousels, and flights-origin hardening. Rebuild from main before submitting; screenshots must match the shipping binary. (`eas.json`, `eas build:list`)
- [ ] **B3. Device QA (plan 3.3) never performed.** Full flow (home → search → compare → results → trip → checkout → affiliate link-out) on a physical iPhone + SE-class simulator is the entry ticket to TestFlight. iPad is settled: `supportsTablet: false`, iPhone-only. (`app_plan.md:35`)

**Refuted blocker, for the record — VERIFIED:** an auditor claimed production builds ship without Supabase/Mapbox env vars (crash at launch). `eas env:list --environment production` (run 2026-07-19) shows `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY`, and `EXPO_PUBLIC_MAPBOX_TOKEN` all present. Env delivery is fine. Still worth hardening `lib/supabase.ts:14` to fail soft instead of throwing on a missing var.

---

## 2. High — fix before the production build

- [x] **H1. Date picker stores the wrong day for all US timezones.** `toISO()` uses `toISOString()` (UTC) and `new Date('YYYY-MM-DD')` parses as UTC midnight; combined, a CDT user tapping Jul 20 stores Jul 21, the calendar highlights the day before the stored date, and flights/hotels/events are searched on wrong dates while the UI shows the day the user picked. Build ISO from local date parts and parse with the `T12:00:00` convention used everywhere else. (`components/DateRangePicker.tsx:15-53`)
- [x] **H2. Typed destination silently discarded unless a Mapbox suggestion is tapped.** Typing "Paris," setting dates, and hitting Search routes to surprise mode — trips to places the user never asked for. Fall back to the raw query in `submit()`. (`app/search.tsx:142-144, 106-117`)
- [ ] **H3. Dateless paths dead-end the Results screen.** Quick tab wipes dates to `""`; Compare "Build this" never sets them. Result: flights query disabled ("No flights found"), hotels/events POST empty dates and get 400s rendered as empty states, packing list 400s with a Retry that can never succeed. Derive default dates or prompt inline on Results. (`app/(tabs)/quick.tsx:32`, `app/compare.tsx:145-156`)
- [ ] **H4. Results screen renders every API error as "No flights/stays/events found."** Zero `isError` branches on any of the four queries; offline or 500/429 shows confident fake-empty states with no retry, and the error result is cached. The 429 friendly message from the web API is discarded; Compare and the root ErrorBoundary show raw technical strings. Add error cards with Retry (the packing-list pattern at `trip/index.tsx:268-287`). (`app/results/index.tsx:113-115, 186-187, 226, 256-257`; `packages/api-client/src/index.ts:44-48`)
- [x] **H5. No request timeout in the API client.** Bare `fetch`; a hung Vercel/upstream call means up to ~2 minutes of skeletons before settling into H4's fake-empty. Add `AbortSignal` timeout (~20s) in `get`/`post`. (`packages/api-client/src/index.ts:29-49`)
- [ ] **H6. TripCard heart is a no-op.** Fills red, saves nothing, resets on FlatList recycle; users find "No trips yet" after hearting. Wire to savedTripsStore or remove the heart. (`components/TripCard.tsx:22, 60-77`)
- [ ] **H7. Keyboard/tap handling on forms.** Clarify: no KeyboardAvoidingView, no `keyboardShouldPersistTaps` — the gating "Leaving from" field is typed blind under the keyboard and suggestions need two taps. Same double-tap on the Results departure prompt. (`app/clarify.tsx:32-35`, `app/results/index.tsx:328-331`)
- [ ] **H8. No privacy policy or terms link anywhere in the app** (5.1.1(i)). Pages already exist at scoutie.vercel.app/privacy and /terms — add rows on Profile and a login footer link, and set the ASC privacy-policy URL. (`app/(tabs)/profile.tsx:45`)

---

## 3. Medium — fix soon (before or shortly after launch)

**Revenue & correctness**
- [ ] **M1. Affiliate tags wired to nothing — VERIFIED.** `EXPO_PUBLIC_BOOKING_AFFILIATE_ID` / `EXPO_PUBLIC_TM_IMPACT_URL` absent from eas.json, apps/mobile/.env, and every EAS environment (`eas env:list` all three). Every "Book on" link ships untagged: zero revenue, and fixing it post-submission costs a review cycle. Blocked on user affiliate signups (Booking.com Partner, Impact/Ticketmaster). Until set, the checkout disclosure "Walter earns a commission" (`checkout.tsx:213-216`) is false — soften it or set the vars. (`lib/affiliate.ts:11-12`)
- [x] **M2. "Activitys" misspelling** — naive pluralization in the trip group header. (`app/trip/index.tsx:195-197`)
- [ ] **M3. Empty-cart checkout reachable** — "0 of 0 booked", $0 total, disclosure floating over nothing. Add an empty state / guard. (`app/checkout.tsx:82-110`)
- [ ] **M4. No offline detection anywhere.** NetInfo not installed; react-query's onlineManager never wired (RN requires it); no reconnect refetch, no offline UI. (`app/_layout.tsx:94-113`)
- [ ] **M5. Zustand persist has no version/migrate on any store** — AsyncStorage schema drift after an update can crash screens. (`lib/stores/*.ts`)
- [ ] **M6. Picking a Compare tier silently regenerates all three trips** — queryKey includes the prefs object that the tier tap mutates. (`app/compare.tsx:51, 145-156`)
- [x] **M7. bootApiClient runs after child screens mount** — first-render queries can hit a blank baseUrl (relative URLs on native). Configure at module scope. (`app/_layout.tsx:109-113`)
- [x] **M8. Hotel carousel modulo-by-zero** — arrows show for zero-photo hotels; one tap makes photoIndex NaN and blanks the image permanently. (`components/results/ResultCards.tsx:361, 388`)
- [ ] **M9. Bookmark saves a duplicate trip on every tap** — `trip-${Date.now()}` id, no dedupe, no toggle feedback. (`app/trip/index.tsx:87-100`)
- [ ] **M10. Reopening a saved trip wipes booked progress** (`bookedIds: []`), contradicting the Trips-tab promise "reopens exactly where you left it." Persist bookedIds on SavedTrip. (`app/(tabs)/saved.tsx:57`)
- [ ] **M11. Compare renders a confident heading over zero cards** when the API 200s with an empty trips array. (`app/compare.tsx:142`)
- [ ] **M12. Map inside the trip ScrollView traps vertical scrolling** — drags starting on the 240pt map pan the map. Disable gestures or add a fullscreen affordance. (`app/trip/index.tsx:180-189`)
- [ ] **M13. Empty-trip modal copy references a "search above" that doesn't exist** and offers no action. (`app/trip/index.tsx:142-157`)

**Accessibility batch (one pass)**
- [ ] **M14.** Zero `accessibilityLabel`/`accessibilityRole` in the app — icon-only buttons invisible to VoiceOver · touch targets under 44pt (trip Share ~20pt) · `ink-faint` 48%-alpha text ≈2.8:1 contrast on 10-13px labels · no `maxFontSizeMultiplier` anywhere, Dynamic Type breaks the fixed 64pt tab bar · raised Home tab's top ~30pt is a dead touch zone. (`theme/colors.ts:12`, `app/(tabs)/_layout.tsx:38-70`, `app/trip/index.tsx:109-132`)

**Compliance hygiene**
- [ ] **M15. Location permission string declared but location never used** (no expo-location, no user puck) — drop `NSLocationWhenInUseUsageDescription` or actually use it; privacy-label mismatch risk. Plan 1.4's "keep it, it's accurate" was wrong. (`app.json:21`)
- [x] **M16. Mapbox attribution and logo disabled** (`attributionEnabled={false}`, `logoEnabled={false}`) — violates Mapbox ToS on a production app. Re-enable. (`app/trip/index.tsx:184-185`)

**M-AUTH (only matters under Option B / when accounts go live)**
- [ ] Missing AppState `startAutoRefresh` wiring (documented Supabase RN requirement) (`lib/supabase.ts:14`) · `router.back()` no-op strands cold-start deep-link users on Sign in (`auth/login.tsx:70`) · auth-callback one-shot latch ignores a second magic link (`auth-callback.tsx:35-39`) · expired-link error shows raw `+` encoding and the parser can throw into an infinite spinner (`auth-callback.tsx:20`) · sign-in copy promises cross-device sync/sharing that doesn't exist (`auth/login.tsx:98`) · Apple Sign-In omits nonce and discards the one-time fullName (`auth/login.tsx:52`) · sign-out failure always reported as success (`profile.tsx:61-64`) · successful magic link lands on a hidden tab with a raw lowercase "profile" header (`auth-callback.tsx:56`).

---

## 4. Low — polish / parking lot

- [x] Share message renders "My undefined trip" when destination is empty — use the `?? "somewhere good"` fallback from three lines below. (`app/trip/index.tsx:111`)
- [x] "Trip complete. Go pack." pushes a duplicate /trip modal onto the stack. (`app/checkout.tsx:193-194`)
- [ ] AI suggestions say "Book on the web" but open a Google search; "Find online" label unreachable. (`app/results/index.tsx:272-275`)
- [ ] Affiliate click tracking never sends tripId (web sends it — attribution parity). (`lib/affiliate.ts:56-64`)
- [x] `Linking.openURL` failures silently swallowed — Book button can appear dead; plan 2.1 specified `WebBrowser.openBrowserAsync` (in-app sheet) instead. (`lib/affiliate.ts:63`)
- [x] TM Impact wrapper appends `?u=` blindly — breaks if the env value ever carries a query string. (`lib/affiliate.ts:40-42`)
- [ ] Trip/checkout groups render in cart-insertion order, not journey order; free items show "$0". (`app/checkout.tsx:113`)
- [x] Event/highlight strings used as React keys — duplicate-key collisions possible. (`app/compare.tsx:210, 230`)
- [x] `formatEventTime` renders "12:NaN AM" on malformed Ticketmaster times. (`components/results/ResultCards.tsx:479-485`)
- [ ] FlatList nested in ScrollViews (AirportAutocomplete) — VirtualizedList warning, broken inner scroll. (`components/AirportAutocomplete.tsx:97`)
- [ ] Home rail arrow chip looks like "see all" but is a non-interactive View. (`app/(tabs)/index.tsx:226-236`)
- [ ] Store writes silently lost on AsyncStorage failure (persist rejections unhandled). (`lib/stores/savedTripsStore.ts:23-37`)
- [ ] Deprecated top-level `splash` key; migrate to the expo-splash-screen plugin. (`app.json:10-14`)
- [ ] Android `com.walter.app` diverges from iOS `com.walterus.app` — fix before any future Play upload; permanent after first upload. (`app.json:45`)
- [ ] 11 Expo packages behind SDK 55 patch versions (`npx expo install --check`). (`package.json`)
- [x] Stale committed `apps/mobile/package-lock.json` (pre-SDK-55; root lockfile is authoritative) — delete it. 
- [ ] Privacy manifest declares only accessed-API types; when ASC privacy labels are filled, keep them consistent (email for auth only under Option B, no tracking, no ATT). (`app.json:23-42`)

---

## 5. Verified clean (for the record)

- Trip map no longer centers on [0,0] — plan 3.1 genuinely fixed. (`app/trip/index.tsx:50-52, 175`)
- Packing list has a proper error state with retry — plan 3.2 genuinely fixed. (`app/trip/index.tsx:268-287`)
- `npx tsc --noEmit` clean (strict mode). No secrets committed (note: the GitHub repo is PUBLIC). No emoji anywhere in mobile UI code.
- EAS production env delivery confirmed working (see Section 1). EAS pipeline proven by the 07-12 build.
- iPad question settled: `supportsTablet: false`, iPhone-only — no iPad layouts or screenshots needed.

## Suggested order of attack for today

1. Decide Section 0 (recommend Option A: parked).
2. Fix H1-H8 (all small, contained code changes) + M2, M15, M16 (one-liners).
3. Affiliate IDs (M1): sign up or soften the disclosure copy for v1.
4. `eas build --platform ios --profile production`, run B3 device QA on the new build.
5. B1: ASC listing + TestFlight + submit, with review notes describing the affiliate-handoff checkout and (if Option A) the auth-less app.
