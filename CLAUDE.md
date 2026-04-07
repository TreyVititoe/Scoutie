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

- **Styling:** Tailwind CSS 3.4 with MD3-inspired teal color system in `tailwind.config.ts`. Custom semantic colors (primary, on-primary, surface, on-surface, outline, etc.) following Material Design 3 naming. Fonts: Plus Jakarta Sans (headline), Manrope (body/label). Icons: Material Symbols Outlined (loaded via Google Fonts, used as `<span className="material-symbols-outlined">`).
- **State:** Zustand 5 — two stores: `quizStore.ts` (quiz state with `zustand/persist` to `walter-quiz`) and `tripCartStore.ts` (cart state with manual localStorage sync to `walter_cart`).
- **Animation:** Framer Motion 12
- **Auth & DB:** Supabase (clients in `lib/supabase/`)
- **Maps:** Mapbox GL (also used server-side for geocoding in Ticketmaster radius search)
- **AI:** Anthropic SDK — Claude Haiku 4.5 for trip generation, interest expansion, suggestions, and summaries

## Key Web Routes

| Route | Purpose |
|-------|---------|
| `/` | Landing page |
| `/quiz` | 7-step trip planning quiz |
| `/results` | Trip builder — browse flights, hotels, events, and AI suggestions; add items to cart |
| `/trip` | Cart-based trip view — shows all added items grouped by type, map, cost breakdown, packing list |
| `/explore` | Browse destinations |
| `/dashboard` | User dashboard |
| `/shared/[slug]` | Shared trip link |

## API Routes (`apps/web/app/api/`)

- `POST /api/suggestions` — AI-curated activity/restaurant/site suggestions via Claude Haiku (main flow)
- `POST /api/generate` — Generate full trip itineraries via Claude (streaming or non-streaming; not used in main builder flow)
- `POST /api/flights` — Flight search via SerpAPI (Google Flights)
- `POST /api/hotels` — Hotel search via RapidAPI (Booking.com)
- `POST /api/search` — Event search (Ticketmaster + AI interest expansion)
- `POST /api/packing-list` — AI-generated packing list
- `POST /api/affiliate/click` — Affiliate click tracking
- `POST /api/trips/save` — Save trip to Supabase
- `POST /api/trips/shared` — Create shared trip link
- `POST /api/trips/refine` — Refine generated trip

## Service Layer (`apps/web/lib/services/`)

- **claude.ts** — `generateTrips()` / `generateTripsStream()` (Haiku 4.5, 3-tier itineraries), `generateSuggestions()` (Haiku 4.5, curated picks), `expandInterests()` (Haiku 4.5, vibe-to-keyword expansion), `generateTripSummary()` (Haiku 4.5)
- **flights.ts** — `searchFlights()` via SerpAPI Google Flights engine. Uses a built-in `CITY_TO_IATA` mapping dictionary to resolve city names (including Mapbox geocoding suffixes) to airport codes. No external IATA lookup API.
- **hotels.ts** — `searchHotels()` via RapidAPI Booking.com (`booking-com15.p.rapidapi.com`). Two-step: `getDestinationId()` then hotel search.
- **ticketmaster.ts** — Event search with vibe-to-category mapping (`VIBE_TO_TM_KEYWORDS`). Uses Mapbox geocoding to convert destination names to lat/lng for radius-based search (30 mi radius). Falls back to city name if geocoding fails.
- **scoring.ts** — Categorize events into exactMatches/similarMatches/topInArea

## Quiz Flow

7 steps managed by Zustand store (`quizStore.ts`):

1. **Trip** (Where & When) — destination picker, dates, flexible dates, trip duration
2. **Travelers** — count, type (solo/couple/family/friends/business), children
3. **Budget** — total trip or per-day, amount, currency, skip option
4. **Flights** — departure city, cabin class, priority (cheapest/shortest/best value/fewest stops)
5. **Stay** — accommodation types, must-haves, location preference, no-accommodation toggle
6. **Interests** — activity interests (adventure, culture, food, nightlife, nature, etc.)
7. **Review** — summary of all selections, "Generate My Trip" button

On generate: quiz prefs are serialized to `walter_prefs` in localStorage, cart is cleared, user is routed to `/results`. The results page reads `walter_prefs` and fires parallel API calls to `/api/flights`, `/api/hotels`, `/api/search`, and `/api/suggestions`.

## State Management

- **quizStore** (`lib/stores/quizStore.ts`) — All quiz form state. Persisted via `zustand/persist` middleware to localStorage key `walter-quiz`.
- **tripCartStore** (`lib/stores/tripCartStore.ts`) — Shopping cart for trip items (flights, hotels, events, activities, restaurants, sites). Manual localStorage sync to `walter_cart`. Provides `addItem`, `removeItem`, `isInCart`, `clearCart`. Computed selectors: `selectTotalPrice`, `selectItemCount`, `getItemsByType`.

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
