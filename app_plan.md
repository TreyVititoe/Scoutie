# Walter Mobile — Production Readiness Plan (iOS App Store)

_Written 2026-07-07. Companion doc: [plan.md](plan.md) (web). Target: public App Store release under the **Praxis** developer team. Android is out of scope (parked in the parking lot)._

**Status 2026-07-07 (same day, executed):** Phases 1, 2, and most of 3 are DONE and pushed (see SESSION_CHANGES.md). EAS project `1950ce6e-c7c7-4dcd-b7fa-8e28e164553d` under account `treyvititoe`; env vars pushed to EAS production+preview. Note `supportsTablet` is now `false` (review-safety call — flip back if iPad matters). Still open: **3.3 device QA** (needs real devices + a fresh `expo prebuild -p ios` since app.json changed), **magic-link end-to-end test on device**, and all of **Phase 4** (listing, TestFlight, submission — needs App Store Connect under Praxis).

## Current state (survey 2026-07-07)

More is built than earlier notes suggested: Home/Explore rails, Explore grid, destination search modal (Mapbox), Clarify (dates/travelers/lodging/departure), Compare (three tiers), Results (Flights/Stay/Events/Do tabs with add-to-cart), Trip cart with map + packing list, and auth (Apple Sign-In + Supabase magic link). Data comes through `packages/api-client` pointed at the web deployment (`scoutie.vercel.app`). TypeScript strict, clean architecture, no tests.

**What blocks the store today:** no EAS config (projectId empty, no eas.json), no iOS privacy manifest, magic-link deep-link handler missing (`walter://auth-callback` is registered but nothing handles it — email sign-in breaks in production builds), unused Face ID permission in Info.plist, and no checkout of any kind (you can build a trip but not book it).

---

## Phase 1 — Store blockers

- **1.1 EAS setup.** `eas.json` with development / preview / production profiles; set the EAS projectId in `app.json`; first `eas build --platform ios` signed under Praxis (credentials already exist — no new $99).
- **1.2 iOS privacy manifest** (`PrivacyInfo.xcprivacy` via app.json/config plugin): declare required-reason APIs (UserDefaults ← AsyncStorage, file timestamps) and third-party SDKs (Mapbox, Supabase). Apple auto-rejects without it.
- **1.3 Fix magic-link auth callback.** Add a route/Linking handler for `walter://auth-callback` that extracts the token and calls Supabase `verifyOtp`/`exchangeCodeForSession`; confirm the Supabase project's redirect allowlist includes the scheme; test end-to-end on a physical device. (Apple Sign-In already works and is the reviewer-friendly path.)
- **1.4 Permissions hygiene.** Remove `NSFaceIDUsageDescription` (declared, never used). Keep the location string — it's accurate.
- **1.5 Env-driven API base.** `EXPO_PUBLIC_API_BASE_URL` set per EAS profile instead of the hardcoded default, so the future domain cutover is config-only.

## Phase 2 — Checkout parity (starts after web Phase 1 ships)

The app mirrors the web's affiliate booking checklist — travel is a physical service, exempt from Apple's IAP rules, so linking out is allowed.

- **2.1 Booking checklist on the Trip screen:** each cart item gets **Book on [provider] →** opening the affiliate URL via `WebBrowser.openBrowserAsync`; fire the same `POST /api/affiliate/click`; per-item booked toggle persisted in `tripCartStore` (AsyncStorage).
- **2.2 Reframe the Trip screen CTA** from share-only to "Book your trip" with booked/unbooked progress, keeping share and packing list.
- **2.3 Copy honesty pass** matching web 1.4, including an affiliate disclosure line on the Trip screen or profile/about.

## Phase 3 — Bugs & rough edges

- **3.1 Trip map centers on `[0, 0]`** (the equator) — center on the trip destination's coordinates.
- **3.2 Packing list has no error state** — spinner forever on fetch failure; add retry messaging.
- **3.3 Device QA pass:** iPhone SE (small screen) and iPad. `app.json` claims iPad orientations — either genuinely support iPad layout or set iPhone-only before review.
- **3.4 Empty/offline states:** empty cart on Saved tab, airplane-mode behavior (React Query retries + a visible offline message rather than silent hangs).

## Phase 4 — Store presence & submission

- **4.1 App Store Connect listing** under Praxis: name + subtitle, description, keywords, category (Travel), screenshots (6.9" and 6.5" iPhone; iPad only if we keep iPad support in 3.3), privacy nutrition labels (email for auth, coarse location for suggestions, **no tracking** — no ATT prompt needed since we do no cross-app tracking).
- **4.2 TestFlight internal beta** — run the full flow on real devices for a few days; fix what falls out.
- **4.3 App Review notes:** provide a reviewer test login (Apple Sign-In works without setup; note that booking buttons are affiliate links out to providers, not IAP).
- **4.4 Submit and iterate** on any rejection feedback.

---

## Parking lot (post-launch)

- Android / Play Store release
- Push notifications (trip reminders, price-drop alerts) — requires permission strings + APNs setup
- Supabase trip sync with the web dashboard (save/load trips across devices)
- Upgraded "Where?" search sheet (the old phase-2 design idea)
- Offline caching of a built trip
