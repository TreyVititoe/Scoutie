# Community Trips Feature

**Date:** 2026-04-11
**Scope:** Replace the static destinations section on the homepage with a community-upvoted trips section. Add upvoting, trip forking, and a "share with community" toggle on trip save.

---

## 1. Database Changes

### Add column to `trips` table
```sql
ALTER TABLE trips ADD COLUMN upvote_count integer NOT NULL DEFAULT 0;
```

### Existing columns used (no changes needed)
- `is_public` (boolean, default false) -- controls whether a trip appears in the community section
- `share_slug` (text, unique) -- used for the public trip URL

### Seeding
Manually mark a few existing trips as `is_public = true` and set reasonable `upvote_count` values via Supabase dashboard to launch with content in the community section.

---

## 2. API Routes

### `GET /api/trips/community`
Fetch top community trips for the homepage.

- **Auth:** None required
- **Input:** None
- **Query:** `SELECT id, title, destination, total_estimated_cost, cover_image_url, upvote_count, share_slug, tier FROM trips WHERE is_public = true ORDER BY upvote_count DESC LIMIT 6`
- **Response:**
```typescript
{
  trips: Array<{
    id: string
    title: string
    destination: string
    total_estimated_cost: number
    cover_image_url: string | null
    upvote_count: number
    share_slug: string
    tier: string | null
  }>
}
```

### `POST /api/trips/upvote`
Increment a trip's upvote count.

- **Auth:** None required
- **Input:** `{ tripId: string }`
- **Validation:** Trip must exist and `is_public = true`
- **Action:** `UPDATE trips SET upvote_count = upvote_count + 1 WHERE id = $1`
- **Response:** `{ upvoteCount: number }`
- **Rate limiting:** Client-side only via localStorage (no server-side dedup)

### `POST /api/trips/fork`
Deep copy a public trip into the authenticated user's account.

- **Auth:** Required (Supabase session)
- **Input:** `{ tripId: string }`
- **Validation:** Trip must exist and `is_public = true`
- **Action:**
  1. Read source trip + trip_days + trip_items
  2. Create new trip row: new UUID, new share_slug (nanoid(10)), user's ID, `is_public = false`, `status = 'draft'`, `upvote_count = 0`, copy all other fields
  3. Create new trip_days rows linked to new trip
  4. Create new trip_items rows linked to new trip and new days
  5. Add entry to `saved_trips` for the user
- **Response:** `{ tripId: string, shareSlug: string }`

### Update `POST /api/trips/save`
Add community toggle.

- **Input change:** Add optional `isPublic: boolean` field (default false)
- **Action:** Sets `is_public` on the trips row when saving

---

## 3. Homepage Section

### Replace destinations section
Remove the static `destinations` array and the bento grid from `app/page.tsx`. Replace with a "Community Trips" section.

### Section layout
- Background: `bg-page-bg`
- Heading: "Trips the community loves" -- `text-[32px] font-semibold text-gray-dark text-center`
- Subtitle: "Real trips built by real travelers. Upvote your favorites or fork one to make it your own." -- `text-on-light-secondary text-lg`
- Grid: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6`
- Cards: `card-base overflow-hidden`

### Community trip card content
Each card displays:
1. **Image header** (h-40): `cover_image_url` as `object-cover` background. If null, show a placeholder gradient or destination-based Unsplash image
2. **Tier pill** (positioned over image, bottom-left): `bg-[#e6f7f9] text-accent rounded-pill px-2.5 py-0.5 text-[11px] font-semibold` showing "Budget", "Balanced", or "Premium"
3. **Card body** (p-5):
   - Destination: `font-semibold text-[17px] text-gray-dark`
   - Title: `text-on-light-secondary text-sm mt-1 line-clamp-2`
   - Bottom row (flex, justify-between, items-center, pt-3, mt-3, border-t border-[rgba(0,101,113,0.06)]):
     - Cost: `font-semibold text-accent` -- formatted as "$X,XXX"
     - Upvote button: inline flex, icon + count. If upvoted (localStorage): `bg-accent text-white rounded-[10px] px-3 py-1.5 text-sm`. If not upvoted: `border border-accent text-accent rounded-[10px] px-3 py-1.5 text-sm hover:bg-accent/5 transition-colors`

### Card click behavior
- Clicking the card body navigates to `/shared/[share_slug]`
- Clicking the upvote button calls `POST /api/trips/upvote` (does NOT navigate)
- The upvote button uses `e.stopPropagation()` to prevent card navigation

### Data loading
- Section fetches from `GET /api/trips/community` on mount (client-side)
- Show skeleton cards while loading (3 placeholder `card-base` with pulse animation)
- If no trips returned, hide the section entirely

---

## 4. localStorage Upvote Tracking

- **Key:** `walter_upvotes`
- **Value:** JSON stringified `string[]` of trip IDs
- **On upvote click:**
  1. Read array from localStorage
  2. If trip ID already in array: do nothing (button already shows filled state)
  3. If not: call `POST /api/trips/upvote`, on success add trip ID to array, save to localStorage, update local UI state
- **No un-upvote.** Once upvoted, it stays. Button shows filled state permanently for that trip.
- **On page load:** Read array to determine initial filled/outlined state for each card's upvote button

---

## 5. Fork Flow on Shared Trip Page

### Add "Fork this trip" button to `/shared/[slug]`
- Position: prominent CTA alongside the existing "Plan your own trip" link
- Style: `bg-accent text-white rounded-[10px] px-6 py-3 text-[15px] font-semibold hover:bg-accent-light transition-colors`
- Icon: Material Symbols "content_copy" or "fork_right"

### Click behavior
1. Check if user is authenticated (Supabase session)
2. If not: redirect to `/auth/login?redirect=/shared/[slug]`
3. If yes: call `POST /api/trips/fork`
4. Show loading state on button while forking
5. On success: redirect to `/trip` -- the forked trip is now in their saved trips and loads via their dashboard

### Update "Share with community" toggle
- Add a toggle to the trip save flow (wherever `POST /api/trips/save` is called from)
- Label: "Share with community"
- Subtitle: "Let others discover and fork your trip"
- Default: off
- Sets `isPublic: true` on the save request

---

## 6. Files Affected

### New files
- `apps/web/app/api/trips/community/route.ts` -- GET community trips
- `apps/web/app/api/trips/upvote/route.ts` -- POST upvote
- `apps/web/app/api/trips/fork/route.ts` -- POST fork trip

### Modified files
- `apps/web/app/page.tsx` -- replace destinations section with community trips
- `apps/web/app/api/trips/save/route.ts` -- add `isPublic` field
- `apps/web/app/shared/[slug]/page.tsx` -- add "Fork this trip" button
- `apps/web/lib/supabase/migrations/001_initial_schema.sql` -- add `upvote_count` column (or create new migration file)
