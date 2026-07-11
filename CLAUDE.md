# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## No Emojis

Never use emojis anywhere in the codebase — no emoji in UI text, component code, icons, placeholder content, or comments. Use SVG icons, text labels, or design system elements instead. Emojis undermine the premium, professional feel of the product.

## Build & Dev Commands

```bash
# From repo root
npm run dev:web        # Next.js dev server (apps/web)
npm run dev:mobile     # Expo dev server (apps/mobile)
npm run build          # Build web app
npm run lint           # Turbo lint across all workspaces

# From apps/web
npm run dev            # next dev
npm run build          # next build
npm run lint           # next lint

# From apps/mobile
npm start              # expo start
npm run ios            # expo start --ios
npm run android        # expo start --android
```

## Architecture

**Turborepo monorepo** with npm workspaces:

- **apps/web** — Next.js 16 (App Router, React 19, TypeScript). The main product. Deployed on Vercel.
- **apps/mobile** — Expo 55 / React Native. Currently skeleton only.
- **packages/shared** — Core TypeScript types (`TripPrefs`, `WalterEvent`, `ScoredEvent`, `SearchResults`)
- **packages/ui** — Placeholder for shared UI components between web and mobile
- **packages/api-client** — Placeholder for typed API client (backend is currently in Next.js API routes)

## Web App Stack

- **Styling:** Tailwind CSS 3.4 with the bright "daylight field" token system in `tailwind.config.ts` (all OKLCH). Core tokens: `paper` (canvas), `card` (near-white surfaces), `ink` / `ink-soft` / `ink-faint` (text), `line` (hairline borders), `surface-1/2/3` (bright tonal steps). Legacy names (`quiet-slate`, `raised-slate`, `hover-slate`, `page-bg`, `gray-dark`) are re-pointed to bright values so unswept files flip with the theme. `tinted-pitch` stays dark and is reserved for photo overlays and over-photo chips; `snow-off-glacier` stays near-white and is only for text on photos and on accent fills. Accent: `accent` / `cornflower-beacon` with `accent-light` / `reykjavik-sky` hover. Font: the system sans stack (SF Pro on Apple devices), matching the native app's typography; no webfont is loaded. Icons: Material Symbols Outlined (loaded via Google Fonts, used as `<span className="material-symbols-outlined">`).
- **State:** Zustand 5: `tripCartStore.ts` (cart state with manual localStorage sync to `walter_cart`) and `savedTripsStore.ts` (saved trips). See State Management below.
- **Animation:** Framer Motion 12
- **Auth & DB:** Supabase (clients in `lib/supabase/`)
- **Maps:** Mapbox GL (also used server-side for geocoding in Ticketmaster radius search)
- **AI:** Anthropic SDK — Claude Haiku 4.5 for trip generation, interest expansion, suggestions, and summaries

## Key Web Routes

| Route | Purpose |
|-------|---------|
| `/` | Landing page with the SearchBar pill: writes `walter_prefs`, routes to `/trips` |
| `/trips` | Three AI-matched trip cards via `POST /api/generate` (curated-trips fallback); choosing one writes `walter_trip` |
| `/results` | Trip builder: browse flights, hotels, events, and AI suggestions; manual add to cart; `walter_trip` hero and sticky cart bar |
| `/trip` | Cart-based trip view: items grouped by type, map, cost breakdown, packing list, share by email, Book everything CTA |
| `/checkout` | Traveler form and one-button "Book it all" via `POST /api/checkout` |
| `/checkout/confirmation` | End of journey: reads `walter_booking`, shows confirmation codes |
| `/clarify` | Conversational entry flow: refines `walter_prefs`, routes to `/results` |
| `/quick` | Quick-plan entry flow: one-line prompt via `POST /api/quick`, routes to `/results` |
| `/explore` | Browse destinations (`?destination=` links prefill the landing SearchBar) |
| `/dashboard` | User dashboard |
| `/compare/local`, `/compare/saved` | Trip comparison |
| `/shared/[slug]` | Shared trip link |

## API Routes (`apps/web/app/api/`)

- `POST /api/suggestions`: AI-curated activity/restaurant/site suggestions via Claude Haiku (main flow)
- `POST /api/generate`: Generate full trip itineraries via Claude (streaming or non-streaming; powers `/trips`)
- `POST /api/checkout`: Simulated booking agent; books the whole cart, returns the `walter_booking` payload with confirmation codes
- `POST /api/flights`: Flight search via SerpAPI (Google Flights)
- `POST /api/hotels`: Hotel search via RapidAPI (Booking.com)
- `POST /api/search`: Event search (Ticketmaster + AI interest expansion)
- `POST /api/quick`: Parse a one-line trip prompt into prefs (powers `/quick`)
- `POST /api/packing-list`: AI-generated packing list
- `POST /api/affiliate/click`: Affiliate click tracking
- `POST /api/trips/save`: Save trip to Supabase
- `POST /api/trips/share`: Create shared trip link
- `GET /api/trips/shared`: Fetch a shared trip by slug or id
- `POST /api/trips/refine`: Refine generated trip

## Service Layer (`apps/web/lib/services/`)

- **claude.ts** — `generateTrips()` / `generateTripsStream()` (Haiku 4.5, 3-tier itineraries), `generateSuggestions()` (Haiku 4.5, curated picks), `expandInterests()` (Haiku 4.5, vibe-to-keyword expansion), `generateTripSummary()` (Haiku 4.5)
- **flights.ts** — `searchFlights()` via SerpAPI Google Flights engine. Uses a built-in `CITY_TO_IATA` mapping dictionary to resolve city names (including Mapbox geocoding suffixes) to airport codes. No external IATA lookup API.
- **hotels.ts** — `searchHotels()` via RapidAPI Booking.com (`booking-com15.p.rapidapi.com`). Two-step: `getDestinationId()` then hotel search.
- **ticketmaster.ts** — Event search with vibe-to-category mapping (`VIBE_TO_TM_KEYWORDS`). Uses Mapbox geocoding to convert destination names to lat/lng for radius-based search (30 mi radius). Falls back to city name if geocoding fails.
- **scoring.ts** — Categorize events into exactMatches/similarMatches/topInArea

## Journey

The canonical chain: `/` to `/trips` to `/results` to `/trip` to `/checkout` to `/checkout/confirmation`.

1. **`/`**: The SearchBar pill (Where, When, Who, What) collects the trip facts, with validation and keyboard support. On search: prefs are serialized to `walter_prefs`, any stale `walter_trip` is cleared, user is routed to `/trips`.
2. **`/trips`**: Three AI-matched trip cards via `POST /api/generate`, with a silent curated-trips fallback. Choosing one writes `walter_trip` and routes to `/results`.
3. **`/results`**: Reads `walter_prefs` and `walter_trip`, fires parallel calls to `/api/flights`, `/api/hotels`, `/api/search`, and `/api/suggestions`. Manual add to cart only; chosen-trip hero and sticky cart bar.
4. **`/trip`**: Cart-based trip view. Share by email (share link via `/api/trips/share`, then mailto) and a Book everything CTA into `/checkout`.
5. **`/checkout`**: Traveler form, one-button "Book it all" posts the cart to `/api/checkout` (simulated booking agent), writes `walter_booking`.
6. **`/checkout/confirmation`**: Reads `walter_booking`, shows per-item confirmation codes with a demo-checkout footnote.

`/clarify` and `/quick` are alternate entry flows that refine `walter_prefs` and feed the same chain. The 7-step quiz no longer exists.

### localStorage contracts

- `walter_prefs`: search preferences from the entry flows
- `walter_trip`: the chosen trip, `{ id, title, destination, days, estTotal, summary, tier }`
- `walter_cart`: cart items (synced by `tripCartStore`)
- `walter_booking`: checkout result, read by `/checkout/confirmation`

## State Management

- **tripCartStore** (`lib/stores/tripCartStore.ts`): Shopping cart for trip items (flights, hotels, events, activities, restaurants, sites). Manual localStorage sync to `walter_cart`. Provides `addItem`, `removeItem`, `isInCart`, `clearCart`. Computed selectors: `selectTotalPrice`, `selectItemCount`, `getItemsByType`.
- **savedTripsStore** (`lib/stores/savedTripsStore.ts`): Saved trips (`saveTrip`, `deleteTrip`, `renameTrip`).
- `quizStore` was deleted along with the 7-step quiz. Entry-flow state lives in `walter_prefs` (plain localStorage), not in a Zustand store.

## Environment Variables

See `.env.example`. Required keys:
- `ANTHROPIC_API_KEY` — Claude AI
- `SERPAPI_KEY` — Google Flights via SerpAPI
- `RAPIDAPI_KEY` — Hotels via Booking.com
- `RAPIDAPI_HOTELS_HOST` — Booking.com API host (default: `booking-com15.p.rapidapi.com`)
- `TICKETMASTER_API_KEY` — Event search
- `NEXT_PUBLIC_SUPABASE_URL` — Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Supabase anon key
- `SUPABASE_SERVICE_ROLE_KEY` — Supabase service role key
- `NEXT_PUBLIC_MAPBOX_TOKEN` — Mapbox (maps + server-side geocoding)

## Deployment

Vercel with config in `vercel.json`. Output directory: `apps/web/.next`.

## Reference Docs (repo root)

- `PRODUCT.md`: product doctrine and voice
- `DESIGN.md`: design system ("The Field Cinematographer"), with machine-readable sidecar at `.impeccable/design.json`
- `PURCHASE_AGENT.md`: feasibility verdict on real auto-booking
- `SESSION_CHANGES.md`: running session changelog
