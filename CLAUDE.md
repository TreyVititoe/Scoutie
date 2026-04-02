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

- **Styling:** Tailwind CSS 3.4 with custom design tokens in `tailwind.config.ts` (primary=teal, accent=amber, fonts: Bricolage Grotesque/DM Sans/JetBrains Mono)
- **State:** Zustand 5 with localStorage persistence (`lib/stores/quizStore.ts`)
- **Animation:** Framer Motion 12
- **Auth & DB:** Supabase (clients in `lib/supabase/`)
- **Maps:** Mapbox GL
- **AI:** Anthropic SDK — Claude Sonnet for trip generation, Claude Haiku for expansions/summaries

## Key Web Routes

| Route | Purpose |
|-------|---------|
| `/` | Landing page |
| `/quiz` | 10-step trip planning quiz |
| `/results` | Generated trip display (budget/balanced/premium tiers) |
| `/explore` | Browse destinations |
| `/dashboard` | User dashboard |
| `/trip` | Single trip detail |
| `/shared/[slug]` | Shared trip link |

## API Routes (`apps/web/app/api/`)

- `POST /api/generate` — Generate trip itineraries via Claude AI
- `POST /api/flights` — Flight search (RapidAPI fly-scraper)
- `POST /api/hotels` — Hotel search (RapidAPI Booking.com)
- `POST /api/search` — Event search (Ticketmaster + AI expansion)
- `POST /api/trips/save` — Save trip to Supabase
- `POST /api/trips/shared` — Create shared trip link
- `POST /api/trips/refine` — Refine generated trip

## Service Layer (`apps/web/lib/services/`)

- **claude.ts** — `generateTrips()` (Sonnet, 3-tier day-by-day itineraries), `expandInterests()` (Haiku), `generateTripSummary()` (Haiku)
- **flights.ts** — `searchFlights()`, `getSkyId()` via RapidAPI
- **hotels.ts** — `searchHotels()`, `getDestinationId()` via RapidAPI
- **ticketmaster.ts** — Event search with vibe-to-category mapping
- **scoring.ts** — Categorize events into exactMatches/similarMatches/topInArea

## Quiz Flow

10 steps managed by Zustand store (`quizStore.ts`): planning mode -> destination -> travelers -> budget -> flights -> accommodation -> activities -> pace -> dining -> review. State persisted to localStorage (`walter-quiz`). Results cached in `walter_trips`.

## Environment Variables

See `.env.example`. Required keys: `ANTHROPIC_API_KEY`, `TICKETMASTER_API_KEY`, `RAPIDAPI_KEY`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_MAPBOX_TOKEN`.

## Deployment

Vercel with config in `vercel.json`. Output directory: `apps/web/.next`.
