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

**DECIDED 2026-07-28: Option A.**
- [x] **Option A — ship with accounts parked (recommended for v1).** Smallest review surface, zero auth risk. Update app_plan.md 1.3/4.3 and the App Review notes to describe an auth-less app. The M-AUTH items below become post-launch work.
- [ ] ~~**Option B — go live with accounts.**~~ Not chosen. For the record, going live would require: in-app account deletion (server endpoint calling `auth.admin.deleteUser` + Apple token revocation — anon client cannot delete users) [B], magic-link end-to-end test on a physical device [B], Supabase redirect-allowlist confirmation for `walter://auth-callback` [B], and the M-AUTH fixes below [H].

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
- [x] **H3. Dateless paths dead-end the Results screen.** Quick tab wipes dates to `""`; Compare "Build this" never sets them. Result: flights query disabled ("No flights found"), hotels/events POST empty dates and get 400s rendered as empty states, packing list 400s with a Retry that can never succeed. _Fixed 07-28 (user chose inline prompt): Results shows a date-picker card and holds all four searches until dates exist._ (`app/results/index.tsx`)
- [x] **H4. Results screen renders every API error as "No flights/stays/events found."** _Fixed 07-28: isError + isPaused (offline) branches with retry cards on all four queries; api-client now surfaces the route's friendly `{ error }` message (429 included) instead of a raw status dump, which also upgrades Compare and the root ErrorBoundary._ (`app/results/index.tsx`; `packages/api-client/src/index.ts`)
- [x] **H5. No request timeout in the API client.** Bare `fetch`; a hung Vercel/upstream call means up to ~2 minutes of skeletons before settling into H4's fake-empty. Add `AbortSignal` timeout (~20s) in `get`/`post`. (`packages/api-client/src/index.ts:29-49`)
- [x] **H6. TripCard heart is a no-op.** _Fixed 07-28 (user chose wiring): heart toggles the trip in savedTripsStore with a `curated-` id; hearted trips appear in the Trips tab and reopen into clarify to resume planning._ (`components/TripCard.tsx`, `lib/stores/savedTripsStore.ts`)
- [x] **H7. Keyboard/tap handling on forms.** _Fixed 07-28: clarify wrapped in KeyboardAvoidingView with `keyboardShouldPersistTaps="handled"`; same persist-taps on the Results ScrollView, so autocomplete suggestions take one tap._ (`app/clarify.tsx`, `app/results/index.tsx`)
- [x] **H8. No privacy policy or terms link anywhere in the app** (5.1.1(i)). _Fixed 07-28: `LegalLinks` component (env-driven base URL) on the Home footer, checkout footer, Profile (both states), and login footer. Setting the ASC privacy-policy URL still happens at B1._ (`components/LegalLinks.tsx`)

---

## 3. Medium — fix soon (before or shortly after launch)

**Revenue & correctness**
- [ ] **M1. Affiliate tags wired to nothing — VERIFIED.** `EXPO_PUBLIC_BOOKING_AFFILIATE_ID` / `EXPO_PUBLIC_TM_IMPACT_URL` absent from eas.json, apps/mobile/.env, and every EAS environment (`eas env:list` all three). Every "Book on" link ships untagged: zero revenue, and fixing it post-submission costs a review cycle. Blocked on user affiliate signups (Booking.com Partner, Impact/Ticketmaster). _07-28: disclosure copy softened to a neutral provider-handoff line (user's call), so nothing false ships; restore the commission line when the IDs land._ (`lib/affiliate.ts:11-12`)
- [x] **M2. "Activitys" misspelling** — naive pluralization in the trip group header. (`app/trip/index.tsx:195-197`)
- [x] **M3. Empty-cart checkout reachable** — _Fixed 07-28: empty state with a "Build your trip" action._ (`app/checkout.tsx`)
- [x] **M4. No offline detection anywhere.** _Fixed 07-28: NetInfo installed, onlineManager wired at module scope; offline queries pause and Results shows "You're offline" cards (H4)._ (`app/_layout.tsx`)
- [x] **M5. Zustand persist has no version/migrate on any store** — _Fixed 07-28: version 1 + passthrough migrate on cart, prefs, and saved-trips stores._ (`lib/stores/*.ts`)
- [x] **M6. Picking a Compare tier silently regenerates all three trips** — _Fixed 07-28: Compare snapshots prefs at mount, so the tier tap's patch no longer changes the queryKey._ (`app/compare.tsx`)
- [x] **M7. bootApiClient runs after child screens mount** — first-render queries can hit a blank baseUrl (relative URLs on native). Configure at module scope. (`app/_layout.tsx:109-113`)
- [x] **M8. Hotel carousel modulo-by-zero** — arrows show for zero-photo hotels; one tap makes photoIndex NaN and blanks the image permanently. (`components/results/ResultCards.tsx:361, 388`)
- [x] **M9. Bookmark saves a duplicate trip on every tap** — _Fixed 07-28: stable destination+dates id, save() re-saves in place, bookmark is a fill/unfill toggle._ (`app/trip/index.tsx`)
- [x] **M10. Reopening a saved trip wipes booked progress** — _Fixed 07-28: bookedIds persist on SavedTrip and restore on reopen._ (`app/(tabs)/saved.tsx`)
- [x] **M11. Compare renders a confident heading over zero cards** — _Fixed 07-28: empty state with retry._ (`app/compare.tsx`)
- [x] **M12. Map inside the trip ScrollView traps vertical scrolling** — _Fixed 07-28: map gestures disabled; it's a static preview._ (`app/trip/index.tsx`)
- [x] **M13. Empty-trip modal copy references a "search above" that doesn't exist** — _Fixed 07-28: copy rewritten + "Go exploring" action._ (`app/trip/index.tsx`)

**Accessibility batch (one pass)**
- [x] **M14.** _Fixed 07-28:_ labels/roles on every icon-only control (tab bar, trip bookmark/share, saved trash, checkout checkboxes, TripCard heart, results cart pill, steppers, date fields) · hitSlop bumps on small targets · `ink-soft`/`ink-faint` darkened to 0.78/0.62 alpha (~4:1 on paper; check visually) · `maxFontSizeMultiplier` caps on the fixed-height tab bar labels · raised Home rebuilt as a sibling of the bar so its top half actually receives touches. (`theme/colors.ts`, `tailwind.config.js`, `app/(tabs)/_layout.tsx`)

**Compliance hygiene**
- [x] **M15. Location permission string declared but location never used** — _Resolved 07-28 by decision: KEEP the string for v1. Mapbox links CoreLocation and removal risks ITMS-90683 at upload; an unused purpose string is harmless as long as the ASC privacy labels do NOT declare location collection. Revisit post-launch if desired, with a throwaway upload test._ (`app.json`)
- [x] **M16. Mapbox attribution and logo disabled** (`attributionEnabled={false}`, `logoEnabled={false}`) — violates Mapbox ToS on a production app. Re-enable. (`app/trip/index.tsx:184-185`)

**M-AUTH (only matters under Option B / when accounts go live)**
- [ ] Missing AppState `startAutoRefresh` wiring (documented Supabase RN requirement) (`lib/supabase.ts:14`) · `router.back()` no-op strands cold-start deep-link users on Sign in (`auth/login.tsx:70`) · auth-callback one-shot latch ignores a second magic link (`auth-callback.tsx:35-39`) · expired-link error shows raw `+` encoding and the parser can throw into an infinite spinner (`auth-callback.tsx:20`) · sign-in copy promises cross-device sync/sharing that doesn't exist (`auth/login.tsx:98`) · Apple Sign-In omits nonce and discards the one-time fullName (`auth/login.tsx:52`) · sign-out failure always reported as success (`profile.tsx:61-64`) · successful magic link lands on a hidden tab with a raw lowercase "profile" header (`auth-callback.tsx:56`).

---

## 4. Low — polish / parking lot

- [x] Share message renders "My undefined trip" when destination is empty — use the `?? "somewhere good"` fallback from three lines below. (`app/trip/index.tsx:111`)
- [x] "Trip complete. Go pack." pushes a duplicate /trip modal onto the stack. (`app/checkout.tsx:193-194`)
- [x] AI suggestions say "Book on the web" but open a Google search — checkout now shows "Find online" for web-provider items. (`app/checkout.tsx`)
- [x] Affiliate click tracking never sends tripId — checkout passes a stable destination+dates trip id. (`lib/affiliate.ts`)
- [x] `Linking.openURL` failures silently swallowed — Book button can appear dead; plan 2.1 specified `WebBrowser.openBrowserAsync` (in-app sheet) instead. (`lib/affiliate.ts:63`)
- [x] TM Impact wrapper appends `?u=` blindly — breaks if the env value ever carries a query string. (`lib/affiliate.ts:40-42`)
- [x] Trip/checkout groups render in cart-insertion order, not journey order; free items show "$0". — Fixed: flight → hotel → event → activity → restaurant → site everywhere; $0 renders "Free". (`app/checkout.tsx`, `app/trip/index.tsx`)
- [x] Event/highlight strings used as React keys — duplicate-key collisions possible. (`app/compare.tsx:210, 230`)
- [x] `formatEventTime` renders "12:NaN AM" on malformed Ticketmaster times. (`components/results/ResultCards.tsx:479-485`)
- [x] FlatList nested in ScrollViews (AirportAutocomplete) — replaced with a plain map (max 6 rows). (`components/AirportAutocomplete.tsx`)
- [x] Home rail arrow chip looks like "see all" but is a non-interactive View — removed (there is no "all" page; the rail already shows everything). (`app/(tabs)/index.tsx`)
- [x] Store writes silently lost on AsyncStorage failure — safeStorage wrapper catches and warns on all three stores. (`lib/stores/storage.ts`)
- [x] Deprecated top-level `splash` key; migrated to the expo-splash-screen plugin. (`app.json`)
- [x] Android `com.walter.app` diverges from iOS `com.walterus.app` — aligned to `com.walterus.app` (no Play upload has happened, so still changeable). (`app.json`)
- [x] 11 Expo packages behind SDK 55 patch versions — bumped; `npx expo install --check` clean. (`package.json`)
- [x] Stale committed `apps/mobile/package-lock.json` (pre-SDK-55; root lockfile is authoritative) — delete it. 
- [ ] Privacy manifest declares only accessed-API types; when ASC privacy labels are filled, keep them consistent (email for auth only under Option B, no tracking, no ATT). (`app.json:23-42`)

---

## 5. Verified clean (for the record)

- Trip map no longer centers on [0,0] — plan 3.1 genuinely fixed. (`app/trip/index.tsx:50-52, 175`)
- Packing list has a proper error state with retry — plan 3.2 genuinely fixed. (`app/trip/index.tsx:268-287`)
- `npx tsc --noEmit` clean (strict mode). No secrets committed (note: the GitHub repo is PUBLIC). No emoji anywhere in mobile UI code.
- EAS production env delivery confirmed working (see Section 1). EAS pipeline proven by the 07-12 build.
- iPad question settled: `supportsTablet: false`, iPhone-only — no iPad layouts or screenshots needed.

## Suggested order of attack (updated 2026-07-28)

1. ~~Decide Section 0~~ — DONE: Option A, accounts parked.
2. ~~Fix the highs, mediums, and lows~~ — DONE: every code-fixable item in this register is fixed (mobile `tsc` clean, web `tsc` + 12 vitest green). Open code work is only M1 (blocked on affiliate signups) and the two ASC-time notes (privacy labels, unlabeled parking-lot manifest item).
3. Affiliate IDs (M1): sign up for Booking.com Partner + Impact/Ticketmaster, set `EXPO_PUBLIC_*` (EAS) and `NEXT_PUBLIC_*` (Vercel) twins, restore the commission disclosure copy.
4. `expo prebuild -p ios` (app.json changed: splash plugin, android package; netinfo added a native module) then `eas build --platform ios --profile production` — that also clears B2. Run B3 device QA on the new build; give the new date prompt, offline cards, tab bar Home button, and darker faint text a visual once-over.
5. B1: ASC listing under Praxis + TestFlight + submit, with review notes describing the affiliate-handoff checkout and the auth-less v1 (see app_plan.md 07-28 status block). Set the ASC privacy-policy URL (H8's in-app half is done).
