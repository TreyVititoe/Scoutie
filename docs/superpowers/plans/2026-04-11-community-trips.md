# Community Trips — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the static destinations section on the homepage with community-upvoted trips that users can browse, upvote, and fork into their own accounts.

**Architecture:** Add `upvote_count` column to existing `trips` table. Create 3 new API routes (community list, upvote, fork). Replace the homepage destinations section with a client-side component that fetches community trips. Add a "Fork this trip" button to the shared trip page. Add `isPublic` toggle to the trip save route.

**Tech Stack:** Next.js 16 API routes, Supabase (PostgreSQL + JS client), localStorage for upvote tracking, React client components

---

## File Map

### New files
- `apps/web/lib/supabase/migrations/002_add_upvote_count.sql` — migration script
- `apps/web/app/api/trips/community/route.ts` — GET community trips
- `apps/web/app/api/trips/upvote/route.ts` — POST upvote
- `apps/web/app/api/trips/fork/route.ts` — POST fork trip
- `apps/web/components/CommunityTrips.tsx` — homepage community section component

### Modified files
- `apps/web/app/api/trips/save/route.ts` — add `isPublic` field
- `apps/web/app/page.tsx` — replace destinations section with CommunityTrips component
- `apps/web/app/shared/[slug]/page.tsx` — add "Fork this trip" button

---

### Task 1: Database Migration

**Files:**
- Create: `apps/web/lib/supabase/migrations/002_add_upvote_count.sql`

- [ ] **Step 1: Create migration file**

Create `apps/web/lib/supabase/migrations/002_add_upvote_count.sql`:

```sql
-- Add upvote count to trips table for community feature
ALTER TABLE trips ADD COLUMN upvote_count integer NOT NULL DEFAULT 0;

-- Index for community query (public trips sorted by upvotes)
CREATE INDEX idx_trips_community ON trips (is_public, upvote_count DESC) WHERE is_public = true;
```

- [ ] **Step 2: Run the migration against your Supabase database**

Go to Supabase dashboard > SQL Editor > paste and run the SQL above. Or use the Supabase CLI:

```bash
cd /Users/treyvititoe/projects/scoutie && npx supabase db push
```

- [ ] **Step 3: Commit**

```bash
cd /Users/treyvititoe/projects/scoutie && git add apps/web/lib/supabase/migrations/002_add_upvote_count.sql && git commit -m "feat: add upvote_count column to trips table

Migration adds integer column with index for community query."
```

---

### Task 2: Community Trips API Route

**Files:**
- Create: `apps/web/app/api/trips/community/route.ts`

- [ ] **Step 1: Create the route**

Create `apps/web/app/api/trips/community/route.ts`:

```typescript
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();

    const { data: trips, error } = await supabase
      .from("trips")
      .select("id, title, destination, total_estimated_cost, cover_image_url, upvote_count, share_slug, tier")
      .eq("is_public", true)
      .order("upvote_count", { ascending: false })
      .limit(6);

    if (error) {
      console.error("[/api/trips/community]", error);
      return NextResponse.json({ error: "Failed to fetch community trips" }, { status: 500 });
    }

    return NextResponse.json({ trips: trips || [] });
  } catch (err) {
    console.error("[/api/trips/community]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
```

- [ ] **Step 2: Verify it builds**

```bash
cd /Users/treyvititoe/projects/scoutie && npm run build --workspace=apps/web 2>&1 | tail -5
```

- [ ] **Step 3: Commit**

```bash
cd /Users/treyvititoe/projects/scoutie && git add apps/web/app/api/trips/community/route.ts && git commit -m "feat: add GET /api/trips/community route

Returns top 6 public trips sorted by upvote count."
```

---

### Task 3: Upvote API Route

**Files:**
- Create: `apps/web/app/api/trips/upvote/route.ts`

- [ ] **Step 1: Create the route**

Create `apps/web/app/api/trips/upvote/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const { tripId } = await req.json();

    if (!tripId) {
      return NextResponse.json({ error: "Missing tripId" }, { status: 400 });
    }

    const supabase = await createClient();

    // Verify trip exists and is public
    const { data: trip, error: fetchError } = await supabase
      .from("trips")
      .select("id, upvote_count, is_public")
      .eq("id", tripId)
      .single();

    if (fetchError || !trip) {
      return NextResponse.json({ error: "Trip not found" }, { status: 404 });
    }

    if (!trip.is_public) {
      return NextResponse.json({ error: "Trip is not public" }, { status: 403 });
    }

    // Increment upvote count
    const { data: updated, error: updateError } = await supabase
      .from("trips")
      .update({ upvote_count: trip.upvote_count + 1 })
      .eq("id", tripId)
      .select("upvote_count")
      .single();

    if (updateError) {
      console.error("[/api/trips/upvote]", updateError);
      return NextResponse.json({ error: "Failed to upvote" }, { status: 500 });
    }

    return NextResponse.json({ upvoteCount: updated.upvote_count });
  } catch (err) {
    console.error("[/api/trips/upvote]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
```

- [ ] **Step 2: Commit**

```bash
cd /Users/treyvititoe/projects/scoutie && git add apps/web/app/api/trips/upvote/route.ts && git commit -m "feat: add POST /api/trips/upvote route

Increments upvote_count on public trips. No auth required."
```

---

### Task 4: Fork Trip API Route

**Files:**
- Create: `apps/web/app/api/trips/fork/route.ts`

- [ ] **Step 1: Create the route**

Create `apps/web/app/api/trips/fork/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { nanoid } from "@/lib/utils";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { tripId } = await req.json();

    if (!tripId) {
      return NextResponse.json({ error: "Missing tripId" }, { status: 400 });
    }

    // Fetch source trip with days and items
    const { data: source, error: fetchError } = await supabase
      .from("trips")
      .select(`
        title, summary, destination, tier, start_date, end_date,
        total_estimated_cost, currency, cover_image_url,
        trip_days (
          day_number, title, summary, estimated_cost,
          trip_items (
            item_type, title, description, start_time, end_time,
            duration_minutes, estimated_cost, booking_url,
            affiliate_provider, external_id, location_name,
            location_lat, location_lng, rating, image_url,
            metadata, sort_order
          )
        )
      `)
      .eq("id", tripId)
      .eq("is_public", true)
      .single();

    if (fetchError || !source) {
      return NextResponse.json({ error: "Trip not found or not public" }, { status: 404 });
    }

    const newSlug = nanoid(10);

    // Create new trip
    const { data: newTrip, error: tripError } = await supabase
      .from("trips")
      .insert({
        user_id: user.id,
        title: source.title,
        summary: source.summary,
        destination: source.destination,
        tier: source.tier,
        start_date: source.start_date,
        end_date: source.end_date,
        total_estimated_cost: source.total_estimated_cost,
        currency: source.currency,
        cover_image_url: source.cover_image_url,
        status: "draft",
        is_public: false,
        share_slug: newSlug,
        upvote_count: 0,
      })
      .select("id, share_slug")
      .single();

    if (tripError || !newTrip) {
      console.error("[/api/trips/fork] trip insert", tripError);
      return NextResponse.json({ error: "Failed to fork trip" }, { status: 500 });
    }

    // Copy days and items
    const sortedDays = (source.trip_days || []).sort(
      (a: { day_number: number }, b: { day_number: number }) => a.day_number - b.day_number
    );

    for (const day of sortedDays) {
      const { data: newDay } = await supabase
        .from("trip_days")
        .insert({
          trip_id: newTrip.id,
          day_number: day.day_number,
          title: day.title,
          summary: day.summary,
          estimated_cost: day.estimated_cost,
        })
        .select("id")
        .single();

      if (newDay && day.trip_items && day.trip_items.length > 0) {
        const itemInserts = day.trip_items.map((item: Record<string, unknown>) => ({
          trip_day_id: newDay.id,
          trip_id: newTrip.id,
          item_type: item.item_type,
          title: item.title,
          description: item.description,
          start_time: item.start_time,
          end_time: item.end_time,
          duration_minutes: item.duration_minutes,
          estimated_cost: item.estimated_cost,
          booking_url: item.booking_url,
          affiliate_provider: item.affiliate_provider,
          external_id: item.external_id,
          location_name: item.location_name,
          location_lat: item.location_lat,
          location_lng: item.location_lng,
          rating: item.rating,
          image_url: item.image_url,
          metadata: item.metadata,
          sort_order: item.sort_order,
        }));

        await supabase.from("trip_items").insert(itemInserts);
      }
    }

    // Add to user's saved trips
    await supabase.from("saved_trips").insert({
      user_id: user.id,
      trip_id: newTrip.id,
    });

    return NextResponse.json({
      tripId: newTrip.id,
      shareSlug: newTrip.share_slug,
    });
  } catch (err) {
    console.error("[/api/trips/fork]", err);
    return NextResponse.json({ error: "Fork failed" }, { status: 500 });
  }
}
```

- [ ] **Step 2: Verify build**

```bash
cd /Users/treyvititoe/projects/scoutie && npm run build --workspace=apps/web 2>&1 | tail -5
```

- [ ] **Step 3: Commit**

```bash
cd /Users/treyvititoe/projects/scoutie && git add apps/web/app/api/trips/fork/route.ts && git commit -m "feat: add POST /api/trips/fork route

Deep copies a public trip (days + items) into authenticated user's account.
New trip gets fresh slug, draft status, is_public=false."
```

---

### Task 5: Update Trip Save Route with isPublic Toggle

**Files:**
- Modify: `apps/web/app/api/trips/save/route.ts`

- [ ] **Step 1: Update the save route**

In `apps/web/app/api/trips/save/route.ts`, change line 63 from:

```typescript
        is_public: false,
```

to:

```typescript
        is_public: body.isPublic === true,
```

This reads the optional `isPublic` boolean from the request body. Defaults to `false` if not provided (since `undefined === true` is false).

- [ ] **Step 2: Commit**

```bash
cd /Users/treyvititoe/projects/scoutie && git add apps/web/app/api/trips/save/route.ts && git commit -m "feat: add isPublic toggle to trip save route

When isPublic is true, trip becomes visible in community section."
```

---

### Task 6: Create CommunityTrips Homepage Component

**Files:**
- Create: `apps/web/components/CommunityTrips.tsx`

- [ ] **Step 1: Create the component**

Create `apps/web/components/CommunityTrips.tsx`:

```tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";

type CommunityTrip = {
  id: string;
  title: string;
  destination: string;
  total_estimated_cost: number;
  cover_image_url: string | null;
  upvote_count: number;
  share_slug: string;
  tier: string | null;
};

const UPVOTES_KEY = "walter_upvotes";

function getUpvotedIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(UPVOTES_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveUpvotedIds(ids: string[]) {
  localStorage.setItem(UPVOTES_KEY, JSON.stringify(ids));
}

export default function CommunityTrips() {
  const [trips, setTrips] = useState<CommunityTrip[]>([]);
  const [loading, setLoading] = useState(true);
  const [upvotedIds, setUpvotedIds] = useState<string[]>([]);

  useEffect(() => {
    setUpvotedIds(getUpvotedIds());

    fetch("/api/trips/community")
      .then((res) => res.json())
      .then((data) => {
        setTrips(data.trips || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleUpvote = async (e: React.MouseEvent, tripId: string) => {
    e.preventDefault();
    e.stopPropagation();

    if (upvotedIds.includes(tripId)) return;

    try {
      const res = await fetch("/api/trips/upvote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tripId }),
      });

      if (!res.ok) return;

      const data = await res.json();

      // Update local state
      setTrips((prev) =>
        prev.map((t) =>
          t.id === tripId ? { ...t, upvote_count: data.upvoteCount } : t
        )
      );

      const newIds = [...upvotedIds, tripId];
      setUpvotedIds(newIds);
      saveUpvotedIds(newIds);
    } catch {
      // Silently fail
    }
  };

  if (!loading && trips.length === 0) return null;

  return (
    <section className="bg-page-bg py-20">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.3 }}
          className="text-center mb-12"
        >
          <h2 className="text-[32px] font-semibold text-gray-dark">
            Trips the community loves
          </h2>
          <p className="text-on-light-secondary text-lg mt-3 max-w-2xl mx-auto">
            Real trips built by real travelers. Upvote your favorites or fork
            one to make it your own.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading
            ? Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="card-base overflow-hidden animate-pulse">
                  <div className="h-40 bg-page-bg" />
                  <div className="p-5 space-y-3">
                    <div className="h-4 bg-page-bg rounded w-2/3" />
                    <div className="h-3 bg-page-bg rounded w-full" />
                    <div className="h-3 bg-page-bg rounded w-1/2" />
                  </div>
                </div>
              ))
            : trips.map((trip) => {
                const isUpvoted = upvotedIds.includes(trip.id);
                return (
                  <motion.div
                    key={trip.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3 }}
                  >
                    <Link
                      href={`/shared/${trip.share_slug}`}
                      className="card-base overflow-hidden block"
                    >
                      <div className="relative h-40">
                        {trip.cover_image_url ? (
                          <img
                            src={trip.cover_image_url}
                            alt={trip.destination}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-accent-dark to-accent-deep flex items-center justify-center">
                            <span className="material-symbols-outlined text-cyan/30 text-4xl">
                              travel_explore
                            </span>
                          </div>
                        )}
                        {trip.tier && (
                          <span className="absolute bottom-3 left-3 bg-[#e6f7f9] text-accent rounded-pill px-2.5 py-0.5 text-[11px] font-semibold">
                            {trip.tier.charAt(0).toUpperCase() + trip.tier.slice(1)}
                          </span>
                        )}
                      </div>
                      <div className="p-5">
                        <p className="font-semibold text-[17px] text-gray-dark">
                          {trip.destination}
                        </p>
                        <p className="text-on-light-secondary text-sm mt-1 line-clamp-2">
                          {trip.title}
                        </p>
                        <div className="flex items-center justify-between pt-3 mt-3 border-t border-[rgba(0,101,113,0.06)]">
                          <span className="font-semibold text-accent">
                            ${trip.total_estimated_cost.toLocaleString()}
                          </span>
                          <button
                            onClick={(e) => handleUpvote(e, trip.id)}
                            className={`flex items-center gap-1.5 rounded-[10px] px-3 py-1.5 text-sm font-semibold transition-colors ${
                              isUpvoted
                                ? "bg-accent text-white"
                                : "border border-accent text-accent hover:bg-accent/5"
                            }`}
                          >
                            <span className="material-symbols-outlined text-[16px]">
                              arrow_upward
                            </span>
                            {trip.upvote_count}
                          </button>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Commit**

```bash
cd /Users/treyvititoe/projects/scoutie && git add apps/web/components/CommunityTrips.tsx && git commit -m "feat: add CommunityTrips component

Fetches top community trips, displays in card grid with upvote buttons.
Uses localStorage for upvote tracking. Hides if no trips."
```

---

### Task 7: Replace Destinations Section on Homepage

**Files:**
- Modify: `apps/web/app/page.tsx`

- [ ] **Step 1: Add import**

At the top of `apps/web/app/page.tsx`, add after the existing imports:

```typescript
import CommunityTrips from "../components/CommunityTrips";
```

- [ ] **Step 2: Remove the destinations data**

Delete the entire `destinations` array (the const starting with `const destinations = [` and ending with `];` -- approximately lines 6-49 of the current file).

- [ ] **Step 3: Replace destinations section**

Find the section commented `{/* ========== DESTINATIONS ========== */}` and replace the entire `<section>` (from the opening `<section className="bg-page-bg py-20">` through its closing `</section>`) with:

```tsx
      {/* ========== COMMUNITY TRIPS ========== */}
      <CommunityTrips />
```

- [ ] **Step 4: Verify build**

```bash
cd /Users/treyvititoe/projects/scoutie && npm run build --workspace=apps/web 2>&1 | tail -5
```

- [ ] **Step 5: Commit**

```bash
cd /Users/treyvititoe/projects/scoutie && git add apps/web/app/page.tsx && git commit -m "feat: replace destinations with community trips on homepage

Remove static destinations array and bento grid. Add CommunityTrips
component that fetches and displays upvoted community trips."
```

---

### Task 8: Add Fork Button to Shared Trip Page

**Files:**
- Modify: `apps/web/app/shared/[slug]/page.tsx`

- [ ] **Step 1: Read the file and add fork functionality**

Read `apps/web/app/shared/[slug]/page.tsx`. Add the following:

1. Add state for forking at the top of the component (alongside existing state):

```typescript
const [forking, setForking] = useState(false);
```

2. Add the fork handler function inside the component:

```typescript
const handleFork = async () => {
  if (!trip || forking) return;
  setForking(true);

  try {
    const res = await fetch("/api/trips/fork", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tripId: trip.id }),
    });

    if (res.status === 401) {
      // Not logged in -- redirect to login with return URL
      window.location.href = `/auth/login?redirect=/shared/${params.slug}`;
      return;
    }

    if (!res.ok) {
      setForking(false);
      return;
    }

    const data = await res.json();
    window.location.href = `/dashboard`;
  } catch {
    setForking(false);
  }
};
```

3. Add a "Fork this trip" button next to or near the existing "Plan your own trip" CTA at the bottom of the page. Place it as a sibling button:

```tsx
<button
  onClick={handleFork}
  disabled={forking}
  className="bg-accent text-white rounded-[10px] px-6 py-3 text-[15px] font-semibold hover:bg-accent-light transition-colors disabled:opacity-50 flex items-center gap-2"
>
  <span className="material-symbols-outlined text-[18px]">
    content_copy
  </span>
  {forking ? "Forking..." : "Fork this trip"}
</button>
```

4. Also add a fork button near the top of the trip details (in the header area alongside destination info) so it's visible without scrolling:

```tsx
<button
  onClick={handleFork}
  disabled={forking}
  className="bg-accent text-white rounded-[10px] px-4 py-2 text-sm font-semibold hover:bg-accent-light transition-colors disabled:opacity-50 flex items-center gap-1.5"
>
  <span className="material-symbols-outlined text-[16px]">
    content_copy
  </span>
  {forking ? "Forking..." : "Fork this trip"}
</button>
```

- [ ] **Step 2: Verify build**

```bash
cd /Users/treyvititoe/projects/scoutie && npm run build --workspace=apps/web 2>&1 | tail -5
```

- [ ] **Step 3: Commit**

```bash
cd /Users/treyvititoe/projects/scoutie && git add "apps/web/app/shared/[slug]/page.tsx" && git commit -m "feat: add fork button to shared trip page

Fork deep copies the trip into user's account. Redirects to login
if not authenticated, then to dashboard on success."
```

---

### Task 9: Final Build and Push

- [ ] **Step 1: Full build**

```bash
cd /Users/treyvititoe/projects/scoutie && npm run build --workspace=apps/web 2>&1
```

Expected: Build succeeds with no errors.

- [ ] **Step 2: Fix any build errors if needed**

- [ ] **Step 3: Push to GitHub**

```bash
cd /Users/treyvititoe/projects/scoutie && git push origin main
```
