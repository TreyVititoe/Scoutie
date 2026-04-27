# Expanding Search Bar Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build an Airbnb-style expanding search bar with category switcher (Flights / Stays / Events / Walter's Picks) shared across the homepage hero, global navbar, and `/results` page.

**Architecture:** Headless `<SearchCore>` owns categories, fields, popovers, and state. Three thin wrappers (`HeroSearch`, `NavSearch`, `InlineSearch`) supply chrome and submit handlers. State backed by existing `walter_prefs` localStorage key.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Tailwind 3.4 (existing MD3 teal tokens), Zustand 5, Framer Motion 12.

**Spec:** `docs/superpowers/specs/2026-04-26-expanding-navbar-design.md`

## Testing Strategy (deviation from spec)

The spec calls for vitest component tests and a Playwright e2e. Walter currently has **zero test infrastructure** (no vitest, jest, or playwright in `package.json`). Standing up a full test harness for this single feature is out of scope (YAGNI). Verification for each task is:

1. **`npx tsc --noEmit`** — type check (catches signature/shape bugs).
2. **`npm run lint`** — lint clean.
3. **`npm run dev`** — manual smoke test in a real browser at the listed URL.

If the team adds test infra later, the relevant components (`useSearchBar.toPrefs`, the category-to-prefs mapping) are pure and easy to backfill.

---

## File Structure

**New files:**

```
apps/web/lib/featureFlags.ts                              // EXPANDING_SEARCH_ENABLED constant
apps/web/lib/hooks/useScrollPosition.ts                   // scroll-Y tracking
apps/web/components/search/searchTypes.ts                 // Category, SearchState
apps/web/components/search/useSearchBar.ts                // hook: state + walter_prefs sync
apps/web/components/search/SearchCore.tsx                 // headless: categories + fields + popovers
apps/web/components/search/HeroSearch.tsx                 // homepage hero wrapper
apps/web/components/search/NavSearch.tsx                  // navbar wrapper (collapses-to-pill)
apps/web/components/search/InlineSearch.tsx               // /results wrapper
apps/web/components/search/popovers/WherePopover.tsx
apps/web/components/search/popovers/WhenPopover.tsx
apps/web/components/search/popovers/WhoPopover.tsx
apps/web/components/search/popovers/CategoryPopover.tsx
apps/web/components/Navbar.tsx                            // shared global navbar
```

**Modified files:**

```
apps/web/lib/stores/quizStore.ts                          // add infantsCount field
apps/web/app/globals.css                                  // add .search-glass utility
apps/web/app/page.tsx                                     // use Navbar + HeroSearch
apps/web/app/results/page.tsx                             // use Navbar + InlineSearch (replace tabs)
apps/web/app/explore/page.tsx                             // swap inline header for Navbar
apps/web/app/quiz/page.tsx                                // swap inline header for Navbar
apps/web/app/saved/page.tsx                               // swap inline header for Navbar
apps/web/app/quick/page.tsx                               // swap inline header for Navbar
apps/web/app/dashboard/page.tsx                           // swap inline header for Navbar
apps/web/app/trip/page.tsx                                // swap inline header for Navbar
apps/web/app/about/page.tsx                               // swap inline header for Navbar
apps/web/app/privacy/page.tsx                             // swap inline header for Navbar
apps/web/app/terms/page.tsx                               // swap inline header for Navbar
apps/web/app/shared/[slug]/page.tsx                       // swap inline header for Navbar
```

---

### Task 1: Add `infantsCount` to quizStore

**Files:**
- Modify: `apps/web/lib/stores/quizStore.ts`

- [ ] **Step 1: Add the field to QuizState interface**

In the `QuizState` interface in `apps/web/lib/stores/quizStore.ts`, add `infantsCount` next to `childrenCount`:

```ts
// Step 2: Travelers
travelersCount: number;
travelerType: TravelerType | null;
childrenCount: number;
infantsCount: number;
childrenAges: number[];
accessibilityNeeds: string[];
```

- [ ] **Step 2: Add the action signature**

In the `QuizActions` interface in the same file, add a setter near `setChildrenCount`:

```ts
setInfantsCount: (n: number) => void;
```

- [ ] **Step 3: Add the default and the setter implementation**

Find the initial-state object (where `childrenCount: 0` lives) and add `infantsCount: 0` next to it. Find the `setChildrenCount` implementation and add below it:

```ts
setInfantsCount: (n) => set({ infantsCount: n }),
```

- [ ] **Step 4: Type-check**

```bash
cd apps/web && npx tsc --noEmit
```

Expected: no errors. (If errors mention persisted shape mismatch, that is fine — Zustand `persist` tolerates new optional-by-default fields; users who had the old key will get `0` from the default.)

- [ ] **Step 5: Commit**

```bash
git add apps/web/lib/stores/quizStore.ts
git commit -m "feat(quiz-store): add infantsCount field"
```

---

### Task 2: Add `.search-glass` utility

**Files:**
- Modify: `apps/web/app/globals.css`

- [ ] **Step 1: Add the utility class**

After the `.nav-glass` block (around line 36) in `apps/web/app/globals.css`, add:

```css
/* Search bar glass — heavier blur, lower opacity than nav-glass */
.search-glass {
  background: rgba(0, 101, 113, 0.55);
  backdrop-filter: saturate(180%) blur(28px);
  -webkit-backdrop-filter: saturate(180%) blur(28px);
  border-top: 1px solid rgba(255, 255, 255, 0.12);
}

/* Active column inside the search bar — white surface that floats */
.search-cell-active {
  background: #fff;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.18);
  border-radius: 9999px;
}
```

- [ ] **Step 2: Visual smoke**

```bash
cd apps/web && npm run dev
```

Open http://localhost:3000 — confirm nothing visually regressed (we haven't used the new class yet, so the page should be identical).

- [ ] **Step 3: Commit**

```bash
git add apps/web/app/globals.css
git commit -m "feat(styles): add .search-glass and .search-cell-active utilities"
```

---

### Task 3: Add feature flag

**Files:**
- Create: `apps/web/lib/featureFlags.ts`

- [ ] **Step 1: Create the file**

`apps/web/lib/featureFlags.ts`:

```ts
export const EXPANDING_SEARCH_ENABLED = true;
```

- [ ] **Step 2: Commit**

```bash
git add apps/web/lib/featureFlags.ts
git commit -m "feat(flags): add EXPANDING_SEARCH_ENABLED"
```

---

### Task 4: Create `searchTypes.ts`

**Files:**
- Create: `apps/web/components/search/searchTypes.ts`

- [ ] **Step 1: Create the file**

`apps/web/components/search/searchTypes.ts`:

```ts
import type { FlightClass, ActivityInterest } from "@/lib/stores/quizStore";

export type Category = "flights" | "stays" | "events" | "picks";

export interface SearchState {
  category: Category;
  where: string;
  whereOrigin?: string;
  startDate: string | null;
  endDate: string | null;
  flexibleDates: boolean;
  adults: number;
  children: number;
  infants: number;
  cabin?: FlightClass;
  vibe?: ActivityInterest[];
  interests?: ActivityInterest[];
}

export type SubmitHandler = (state: SearchState) => void;

export const CATEGORIES: { id: Category; label: string; icon: string }[] = [
  { id: "flights", label: "Flights", icon: "flight" },
  { id: "stays", label: "Stays", icon: "hotel" },
  { id: "events", label: "Events", icon: "local_activity" },
  { id: "picks", label: "Walter's Picks", icon: "auto_awesome" },
];

export const FOURTH_SLOT_LABEL: Record<Category, string> = {
  flights: "Cabin",
  stays: "Vibe",
  events: "Interests",
  picks: "Vibe",
};
```

- [ ] **Step 2: Type-check**

```bash
cd apps/web && npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add apps/web/components/search/searchTypes.ts
git commit -m "feat(search): add search types and category constants"
```

---

### Task 5: Create `useSearchBar` hook

**Files:**
- Create: `apps/web/components/search/useSearchBar.ts`

- [ ] **Step 1: Create the hook**

`apps/web/components/search/useSearchBar.ts`:

```ts
"use client";

import { useCallback, useEffect, useState } from "react";
import type { Category, SearchState } from "./searchTypes";

const PREFS_KEY = "walter_prefs";

const EMPTY: SearchState = {
  category: "flights",
  where: "",
  whereOrigin: "",
  startDate: null,
  endDate: null,
  flexibleDates: false,
  adults: 0,
  children: 0,
  infants: 0,
  cabin: undefined,
  vibe: [],
  interests: [],
};

function readPrefs(): Partial<SearchState> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    if (!raw) return {};
    const p = JSON.parse(raw);
    const adults = Math.max(
      0,
      (p.travelersCount ?? 0) - (p.childrenCount ?? 0) - (p.infantsCount ?? 0),
    );
    return {
      where: p.destinations?.[0] ?? "",
      whereOrigin: p.departureCity ?? "",
      startDate: p.startDate ?? null,
      endDate: p.endDate ?? null,
      flexibleDates: !!p.flexibleDates,
      adults,
      children: p.childrenCount ?? 0,
      infants: p.infantsCount ?? 0,
      cabin: p.flightClass,
      vibe: p.activityInterests ?? [],
      interests: p.activityInterests ?? [],
    };
  } catch {
    return {};
  }
}

export function useSearchBar(initial?: Partial<SearchState>) {
  const [state, setState] = useState<SearchState>({
    ...EMPTY,
    ...readPrefs(),
    ...initial,
  });

  // Re-hydrate once on mount in case server-rendered state was empty.
  useEffect(() => {
    setState((s) => ({ ...s, ...readPrefs(), ...initial }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setField = useCallback(
    <K extends keyof SearchState>(key: K, value: SearchState[K]) => {
      setState((s) => ({ ...s, [key]: value }));
    },
    [],
  );

  const setCategory = useCallback((c: Category) => {
    setState((s) => ({ ...s, category: c }));
  }, []);

  const reset = useCallback(() => setState(EMPTY), []);

  const toPrefs = useCallback(() => {
    const existing =
      typeof window !== "undefined" ? localStorage.getItem(PREFS_KEY) : null;
    const base = existing ? JSON.parse(existing) : {};
    const interests =
      state.category === "events" ? state.interests : state.vibe;
    return {
      ...base,
      destinations: state.where ? [state.where] : base.destinations ?? [],
      departureCity: state.whereOrigin ?? base.departureCity ?? "",
      startDate: state.startDate,
      endDate: state.endDate,
      flexibleDates: state.flexibleDates,
      travelersCount: state.adults + state.children + state.infants,
      childrenCount: state.children,
      infantsCount: state.infants,
      flightClass: state.cabin ?? base.flightClass ?? "economy",
      activityInterests:
        interests && interests.length > 0
          ? interests
          : base.activityInterests ?? [],
    };
  }, [state]);

  const persist = useCallback(() => {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(PREFS_KEY, JSON.stringify(toPrefs()));
    } catch {
      // localStorage unavailable — keep in-memory state, no error UI per spec.
    }
  }, [toPrefs]);

  return { state, setField, setCategory, reset, toPrefs, persist };
}
```

- [ ] **Step 2: Type-check**

```bash
cd apps/web && npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add apps/web/components/search/useSearchBar.ts
git commit -m "feat(search): add useSearchBar hook with walter_prefs sync"
```

---

### Task 6: Create `WherePopover`

**Files:**
- Create: `apps/web/components/search/popovers/WherePopover.tsx`

- [ ] **Step 1: Create the popover**

`apps/web/components/search/popovers/WherePopover.tsx`:

```tsx
"use client";

import { useEffect, useRef } from "react";

interface Props {
  value: string;
  onChange: (next: string) => void;
  placeholder?: string;
  onClose: () => void;
}

export default function WherePopover({ value, onChange, placeholder, onClose }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <div className="bg-white rounded-2xl shadow-elevated p-5 w-[360px]">
      <label className="block text-[11px] font-semibold text-gray-dark mb-2">
        Search destinations
      </label>
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") onClose();
        }}
        placeholder={placeholder ?? "City, region, or country"}
        className="w-full text-[15px] text-gray-dark border-b border-gray-200 pb-2 focus:outline-none focus:border-accent"
      />
    </div>
  );
}
```

> Note: Walter has a richer `DestinationAutocomplete` component, but it is tightly coupled to the quiz store. A small bare input is sufficient for v1 of the search bar; upgrading to autocomplete is a follow-up.

- [ ] **Step 2: Type-check**

```bash
cd apps/web && npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add apps/web/components/search/popovers/WherePopover.tsx
git commit -m "feat(search): add WherePopover"
```

---

### Task 7: Create `WhenPopover`

**Files:**
- Create: `apps/web/components/search/popovers/WhenPopover.tsx`

- [ ] **Step 1: Create the popover**

Walter's quiz uses native `<input type="date">`. We follow that pattern here for consistency and to avoid pulling in a calendar library.

`apps/web/components/search/popovers/WhenPopover.tsx`:

```tsx
"use client";

interface Props {
  startDate: string | null;
  endDate: string | null;
  flexibleDates: boolean;
  onStartChange: (d: string | null) => void;
  onEndChange: (d: string | null) => void;
  onFlexibleChange: (b: boolean) => void;
}

export default function WhenPopover({
  startDate,
  endDate,
  flexibleDates,
  onStartChange,
  onEndChange,
  onFlexibleChange,
}: Props) {
  return (
    <div className="bg-white rounded-2xl shadow-elevated p-5 w-[360px] space-y-4">
      <div>
        <label className="block text-[11px] font-semibold text-gray-dark mb-1">
          Check-in
        </label>
        <input
          type="date"
          value={startDate ?? ""}
          onChange={(e) => onStartChange(e.target.value || null)}
          className="w-full text-[15px] text-gray-dark border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-accent"
        />
      </div>
      <div>
        <label className="block text-[11px] font-semibold text-gray-dark mb-1">
          Check-out
        </label>
        <input
          type="date"
          value={endDate ?? ""}
          min={startDate ?? undefined}
          onChange={(e) => onEndChange(e.target.value || null)}
          className="w-full text-[15px] text-gray-dark border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-accent"
        />
      </div>
      <label className="flex items-center gap-2 text-[13px] text-gray-dark">
        <input
          type="checkbox"
          checked={flexibleDates}
          onChange={(e) => onFlexibleChange(e.target.checked)}
          className="w-4 h-4 accent-accent"
        />
        I'm flexible on these dates
      </label>
    </div>
  );
}
```

- [ ] **Step 2: Type-check**

```bash
cd apps/web && npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add apps/web/components/search/popovers/WhenPopover.tsx
git commit -m "feat(search): add WhenPopover"
```

---

### Task 8: Create `WhoPopover`

**Files:**
- Create: `apps/web/components/search/popovers/WhoPopover.tsx`

- [ ] **Step 1: Create the popover**

`apps/web/components/search/popovers/WhoPopover.tsx`:

```tsx
"use client";

interface Props {
  adults: number;
  children: number;
  infants: number;
  onAdultsChange: (n: number) => void;
  onChildrenChange: (n: number) => void;
  onInfantsChange: (n: number) => void;
}

interface RowProps {
  title: string;
  subtitle: string;
  value: number;
  onChange: (n: number) => void;
  min?: number;
}

function Row({ title, subtitle, value, onChange, min = 0 }: RowProps) {
  return (
    <div className="flex items-center justify-between py-3">
      <div>
        <div className="text-[14px] font-semibold text-gray-dark">{title}</div>
        <div className="text-[12px] text-gray-dark/60">{subtitle}</div>
      </div>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => onChange(Math.max(min, value - 1))}
          disabled={value <= min}
          aria-label={`Decrease ${title}`}
          className="w-8 h-8 rounded-full border border-gray-300 text-gray-dark disabled:opacity-30 hover:border-gray-dark"
        >
          -
        </button>
        <span className="w-6 text-center text-[14px] text-gray-dark">{value}</span>
        <button
          type="button"
          onClick={() => onChange(value + 1)}
          aria-label={`Increase ${title}`}
          className="w-8 h-8 rounded-full border border-gray-300 text-gray-dark hover:border-gray-dark"
        >
          +
        </button>
      </div>
    </div>
  );
}

export default function WhoPopover({
  adults,
  children,
  infants,
  onAdultsChange,
  onChildrenChange,
  onInfantsChange,
}: Props) {
  return (
    <div className="bg-white rounded-2xl shadow-elevated p-5 w-[360px] divide-y divide-gray-100">
      <Row title="Adults" subtitle="Ages 13 or above" value={adults} onChange={onAdultsChange} />
      <Row title="Children" subtitle="Ages 2 - 12" value={children} onChange={onChildrenChange} />
      <Row title="Infants" subtitle="Under 2" value={infants} onChange={onInfantsChange} />
    </div>
  );
}
```

- [ ] **Step 2: Type-check**

```bash
cd apps/web && npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add apps/web/components/search/popovers/WhoPopover.tsx
git commit -m "feat(search): add WhoPopover"
```

---

### Task 9: Create `CategoryPopover`

**Files:**
- Create: `apps/web/components/search/popovers/CategoryPopover.tsx`

- [ ] **Step 1: Create the popover**

`apps/web/components/search/popovers/CategoryPopover.tsx`:

```tsx
"use client";

import type { Category, SearchState } from "../searchTypes";
import type { ActivityInterest, FlightClass } from "@/lib/stores/quizStore";

const CABINS: { value: FlightClass; label: string }[] = [
  { value: "economy", label: "Economy" },
  { value: "premium_economy", label: "Premium Economy" },
  { value: "business", label: "Business" },
  { value: "first", label: "First" },
];

const VIBES: { value: ActivityInterest; label: string }[] = [
  { value: "adventure", label: "Adventure" },
  { value: "culture", label: "Culture" },
  { value: "food", label: "Food" },
  { value: "nightlife", label: "Nightlife" },
  { value: "nature", label: "Nature" },
  { value: "relaxation", label: "Relaxation" },
  { value: "shopping", label: "Shopping" },
  { value: "history", label: "History" },
  { value: "art", label: "Art" },
  { value: "sports", label: "Sports" },
  { value: "live_events", label: "Live events" },
  { value: "family_fun", label: "Family fun" },
  { value: "photography", label: "Photography" },
];

interface Props {
  category: Category;
  state: SearchState;
  onChange: <K extends keyof SearchState>(k: K, v: SearchState[K]) => void;
}

export default function CategoryPopover({ category, state, onChange }: Props) {
  if (category === "flights") {
    return (
      <div className="bg-white rounded-2xl shadow-elevated p-5 w-[280px] space-y-1">
        {CABINS.map((c) => (
          <button
            key={c.value}
            type="button"
            onClick={() => onChange("cabin", c.value)}
            className={`w-full text-left px-3 py-2 rounded-lg text-[14px] ${
              state.cabin === c.value
                ? "bg-accent/10 text-accent font-semibold"
                : "text-gray-dark hover:bg-gray-50"
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>
    );
  }

  // stays / events / picks: multi-select chips
  const field: "vibe" | "interests" =
    category === "events" ? "interests" : "vibe";
  const selected = (state[field] ?? []) as ActivityInterest[];
  const toggle = (v: ActivityInterest) => {
    const next = selected.includes(v)
      ? selected.filter((x) => x !== v)
      : [...selected, v];
    onChange(field, next as SearchState[typeof field]);
  };

  return (
    <div className="bg-white rounded-2xl shadow-elevated p-5 w-[360px]">
      <div className="flex flex-wrap gap-2">
        {VIBES.map((v) => {
          const active = selected.includes(v.value);
          return (
            <button
              key={v.value}
              type="button"
              onClick={() => toggle(v.value)}
              className={`px-3 py-1.5 rounded-full text-[12px] font-semibold border transition-colors ${
                active
                  ? "bg-accent text-white border-accent"
                  : "bg-white text-gray-dark border-gray-200 hover:border-gray-dark"
              }`}
            >
              {v.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Type-check**

```bash
cd apps/web && npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add apps/web/components/search/popovers/CategoryPopover.tsx
git commit -m "feat(search): add CategoryPopover (cabin / vibe / interests)"
```

---

### Task 10: Create `useScrollPosition` hook

**Files:**
- Create: `apps/web/lib/hooks/useScrollPosition.ts`

- [ ] **Step 1: Create directory and file**

```bash
mkdir -p apps/web/lib/hooks
```

`apps/web/lib/hooks/useScrollPosition.ts`:

```ts
"use client";

import { useEffect, useState } from "react";

export function useScrollPosition() {
  const [y, setY] = useState(0);

  useEffect(() => {
    const onScroll = () => setY(window.scrollY);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return y;
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/web/lib/hooks/useScrollPosition.ts
git commit -m "feat(hooks): add useScrollPosition"
```

---

### Task 11: Create `SearchCore`

**Files:**
- Create: `apps/web/components/search/SearchCore.tsx`

- [ ] **Step 1: Create the component**

`apps/web/components/search/SearchCore.tsx`:

```tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CATEGORIES,
  FOURTH_SLOT_LABEL,
  type Category,
  type SearchState,
  type SubmitHandler,
} from "./searchTypes";
import { useSearchBar } from "./useSearchBar";
import WherePopover from "./popovers/WherePopover";
import WhenPopover from "./popovers/WhenPopover";
import WhoPopover from "./popovers/WhoPopover";
import CategoryPopover from "./popovers/CategoryPopover";

type ColumnId = "where" | "when" | "who" | "fourth";

interface Props {
  initial?: Partial<SearchState>;
  onSubmit: SubmitHandler;
  onCategoryChange?: (c: Category) => void;
  size?: "lg" | "md";
}

function whoSummary(s: SearchState): string {
  const total = s.adults + s.children + s.infants;
  if (total === 0) return "Add guests";
  if (total === 1) return "1 guest";
  return `${total} guests`;
}

function whenSummary(s: SearchState): string {
  if (!s.startDate) return "Add dates";
  if (!s.endDate) return s.startDate;
  return `${s.startDate} – ${s.endDate}`;
}

function fourthSummary(s: SearchState): string {
  if (s.category === "flights") return s.cabin ? s.cabin.replace("_", " ") : "Any";
  const list = s.category === "events" ? s.interests : s.vibe;
  if (!list || list.length === 0) return "Any";
  if (list.length === 1) return list[0].replace("_", " ");
  return `${list.length} selected`;
}

export default function SearchCore({
  initial,
  onSubmit,
  onCategoryChange,
  size = "lg",
}: Props) {
  const { state, setField, setCategory, persist } = useSearchBar(initial);
  const [open, setOpen] = useState<ColumnId | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(e.target as Node)) setOpen(null);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const handleCategory = (c: Category) => {
    setCategory(c);
    onCategoryChange?.(c);
  };

  const submit = () => {
    persist();
    onSubmit(state);
    setOpen(null);
  };

  const cellBase =
    "flex flex-col text-left px-5 py-2 rounded-full transition-colors";
  const cellActive = "search-cell-active";
  const cellInactive = "hover:bg-white/15";

  const labelCls = "text-[11px] font-semibold uppercase tracking-wide";
  const labelActive = "text-gray-dark";
  const labelInactive = "text-white/80";

  const valueCls = "text-[13px]";
  const valueActive = "text-gray-dark/80";
  const valueInactive = "text-white/60";

  const isActive = (id: ColumnId) => open === id;

  return (
    <div ref={containerRef} className="w-full max-w-[860px] mx-auto">
      {/* Categories row */}
      <div className="flex items-center justify-center gap-2 mb-3">
        {CATEGORIES.map((c) => {
          const active = state.category === c.id;
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => handleCategory(c.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-[12px] font-semibold transition-colors ${
                active
                  ? "bg-white text-gray-dark shadow-elevated"
                  : "text-white/70 hover:text-white hover:bg-white/10"
              }`}
              aria-pressed={active}
            >
              <span className="material-symbols-outlined text-[18px]">{c.icon}</span>
              <span>{c.label}</span>
            </button>
          );
        })}
      </div>

      {/* Search bar row */}
      <div
        className={`relative search-glass rounded-full flex items-center ${
          size === "lg" ? "p-2" : "p-1.5"
        }`}
      >
        {/* Where */}
        <button
          type="button"
          onClick={() => setOpen(isActive("where") ? null : "where")}
          className={`${cellBase} flex-1 ${isActive("where") ? cellActive : cellInactive}`}
        >
          <span className={`${labelCls} ${isActive("where") ? labelActive : labelInactive}`}>
            Where
          </span>
          <span className={`${valueCls} ${isActive("where") ? valueActive : valueInactive}`}>
            {state.where || "Search destinations"}
          </span>
        </button>

        <div className="w-px h-8 bg-white/15" />

        {/* When */}
        <button
          type="button"
          onClick={() => setOpen(isActive("when") ? null : "when")}
          className={`${cellBase} flex-1 ${isActive("when") ? cellActive : cellInactive}`}
        >
          <span className={`${labelCls} ${isActive("when") ? labelActive : labelInactive}`}>
            When
          </span>
          <span className={`${valueCls} ${isActive("when") ? valueActive : valueInactive}`}>
            {whenSummary(state)}
          </span>
        </button>

        <div className="w-px h-8 bg-white/15" />

        {/* Who */}
        <button
          type="button"
          onClick={() => setOpen(isActive("who") ? null : "who")}
          className={`${cellBase} flex-1 ${isActive("who") ? cellActive : cellInactive}`}
        >
          <span className={`${labelCls} ${isActive("who") ? labelActive : labelInactive}`}>
            Who
          </span>
          <span className={`${valueCls} ${isActive("who") ? valueActive : valueInactive}`}>
            {whoSummary(state)}
          </span>
        </button>

        <div className="w-px h-8 bg-white/15" />

        {/* Fourth slot */}
        <button
          type="button"
          onClick={() => setOpen(isActive("fourth") ? null : "fourth")}
          className={`${cellBase} flex-1 ${isActive("fourth") ? cellActive : cellInactive}`}
        >
          <span className={`${labelCls} ${isActive("fourth") ? labelActive : labelInactive}`}>
            {FOURTH_SLOT_LABEL[state.category]}
          </span>
          <span className={`${valueCls} ${isActive("fourth") ? valueActive : valueInactive}`}>
            {fourthSummary(state)}
          </span>
        </button>

        {/* Submit */}
        <button
          type="button"
          onClick={submit}
          className="ml-2 flex items-center gap-2 bg-accent text-white rounded-full px-5 py-2.5 font-semibold hover:bg-accent/90 transition-colors"
          aria-label="Search"
        >
          <span className="material-symbols-outlined text-[20px]">search</span>
          <span className="hidden md:inline text-[13px]">Search</span>
        </button>
      </div>

      {/* Popover layer */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="absolute left-1/2 -translate-x-1/2 mt-2 z-50"
          >
            {open === "where" && (
              <WherePopover
                value={state.where}
                onChange={(v) => setField("where", v)}
                onClose={() => setOpen(null)}
              />
            )}
            {open === "when" && (
              <WhenPopover
                startDate={state.startDate}
                endDate={state.endDate}
                flexibleDates={state.flexibleDates}
                onStartChange={(v) => setField("startDate", v)}
                onEndChange={(v) => setField("endDate", v)}
                onFlexibleChange={(v) => setField("flexibleDates", v)}
              />
            )}
            {open === "who" && (
              <WhoPopover
                adults={state.adults}
                children={state.children}
                infants={state.infants}
                onAdultsChange={(v) => setField("adults", v)}
                onChildrenChange={(v) => setField("children", v)}
                onInfantsChange={(v) => setField("infants", v)}
              />
            )}
            {open === "fourth" && (
              <CategoryPopover
                category={state.category}
                state={state}
                onChange={(k, v) => setField(k, v)}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
```

- [ ] **Step 2: Type-check**

```bash
cd apps/web && npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add apps/web/components/search/SearchCore.tsx
git commit -m "feat(search): add SearchCore (categories + fields + popovers)"
```

---

### Task 12: Create `HeroSearch` wrapper

**Files:**
- Create: `apps/web/components/search/HeroSearch.tsx`

- [ ] **Step 1: Create the wrapper**

`apps/web/components/search/HeroSearch.tsx`:

```tsx
"use client";

import { useRouter } from "next/navigation";
import SearchCore from "./SearchCore";
import { useSearchBar } from "./useSearchBar";
import type { SearchState } from "./searchTypes";

export default function HeroSearch() {
  const router = useRouter();
  const { persist } = useSearchBar();

  const onSubmit = (state: SearchState) => {
    // SearchCore already calls persist() before invoking onSubmit, but call it
    // again here so the latest in-memory state is on disk before navigation.
    persist();
    router.push(`/results?tab=${state.category}`);
  };

  return (
    <div className="w-full">
      <SearchCore onSubmit={onSubmit} size="lg" />
    </div>
  );
}
```

- [ ] **Step 2: Type-check**

```bash
cd apps/web && npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add apps/web/components/search/HeroSearch.tsx
git commit -m "feat(search): add HeroSearch wrapper"
```

---

### Task 13: Create `NavSearch` wrapper

**Files:**
- Create: `apps/web/components/search/NavSearch.tsx`

- [ ] **Step 1: Create the wrapper**

`apps/web/components/search/NavSearch.tsx`:

```tsx
"use client";

import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { motion } from "framer-motion";
import SearchCore from "./SearchCore";
import { useScrollPosition } from "@/lib/hooks/useScrollPosition";
import type { SearchState } from "./searchTypes";

interface Props {
  /** When provided, submit calls this instead of routing — used by /results. */
  onInPageSubmit?: (state: SearchState) => void;
}

export default function NavSearch({ onInPageSubmit }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const scrollY = useScrollPosition();
  const [forcedOpen, setForcedOpen] = useState(false);

  // Expanded above the fold on the homepage; collapsed elsewhere or once
  // the user has scrolled past the hero.
  const collapsed =
    !forcedOpen && (pathname !== "/" || scrollY > 80);

  const onSubmit = (state: SearchState) => {
    if (pathname === "/results" && onInPageSubmit) {
      onInPageSubmit(state);
    } else {
      router.push(`/results?tab=${state.category}`);
    }
  };

  if (collapsed) {
    return (
      <button
        type="button"
        onClick={() => setForcedOpen(true)}
        className="flex items-center gap-3 bg-white/15 hover:bg-white/25 border border-white/20 text-white rounded-full pl-4 pr-2 py-1.5 transition-colors"
      >
        <span className="text-[12px] font-semibold">Anywhere</span>
        <span className="w-px h-4 bg-white/25" />
        <span className="text-[12px] font-semibold">Any week</span>
        <span className="w-px h-4 bg-white/25" />
        <span className="text-[12px] text-white/70">Add guests</span>
        <span className="bg-accent rounded-full w-7 h-7 flex items-center justify-center">
          <span className="material-symbols-outlined text-[16px]">search</span>
        </span>
      </button>
    );
  }

  return (
    <motion.div layout className="w-full">
      <SearchCore onSubmit={onSubmit} size="md" />
    </motion.div>
  );
}
```

- [ ] **Step 2: Type-check**

```bash
cd apps/web && npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add apps/web/components/search/NavSearch.tsx
git commit -m "feat(search): add NavSearch wrapper with collapse-to-pill"
```

---

### Task 14: Create `InlineSearch` wrapper

**Files:**
- Create: `apps/web/components/search/InlineSearch.tsx`

- [ ] **Step 1: Create the wrapper**

`apps/web/components/search/InlineSearch.tsx`:

```tsx
"use client";

import SearchCore from "./SearchCore";
import type { Category, SearchState } from "./searchTypes";

interface Props {
  initial?: Partial<SearchState>;
  onCategoryChange: (c: Category) => void;
  onRefine: (state: SearchState) => void;
}

export default function InlineSearch({ initial, onCategoryChange, onRefine }: Props) {
  return (
    <div className="w-full px-4 lg:px-8 py-3">
      <SearchCore
        initial={initial}
        onSubmit={onRefine}
        onCategoryChange={onCategoryChange}
        size="md"
      />
    </div>
  );
}
```

- [ ] **Step 2: Type-check**

```bash
cd apps/web && npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add apps/web/components/search/InlineSearch.tsx
git commit -m "feat(search): add InlineSearch wrapper"
```

---

### Task 15: Create shared `Navbar` component

**Files:**
- Create: `apps/web/components/Navbar.tsx`

- [ ] **Step 1: Create the component**

`apps/web/components/Navbar.tsx`:

```tsx
"use client";

import Link from "next/link";
import NavSearch from "./search/NavSearch";
import { EXPANDING_SEARCH_ENABLED } from "@/lib/featureFlags";
import type { SearchState } from "./search/searchTypes";

interface Props {
  /** When set, NavSearch refines in-page instead of navigating. */
  onInPageSubmit?: (state: SearchState) => void;
  /** Hide the search bar on pages where it should not appear (e.g. quiz). */
  hideSearch?: boolean;
}

export default function Navbar({ onInPageSubmit, hideSearch = false }: Props) {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 nav-glass">
      <div className="max-w-content mx-auto px-6 h-[64px] flex items-center justify-between gap-6">
        <Link href="/" className="text-white text-[15px] font-semibold shrink-0">
          Walter
        </Link>

        <div className="flex-1 flex items-center justify-center">
          {EXPANDING_SEARCH_ENABLED && !hideSearch ? (
            <NavSearch onInPageSubmit={onInPageSubmit} />
          ) : (
            <div className="flex items-center gap-8">
              <Link href="/explore" className="text-white/80 text-[11px] hidden sm:block">
                Explore
              </Link>
              <Link href="/quiz" className="text-white/80 text-[11px] hidden sm:block">
                Plan a Trip
              </Link>
              <Link href="/saved" className="text-white/80 text-[11px] hidden sm:block">
                Saved Trips
              </Link>
            </div>
          )}
        </div>

        <Link
          href="/quiz"
          className="bg-white/15 border border-white/20 text-white rounded-pill px-4 py-1.5 text-[11px] font-semibold hover:bg-white/25 transition-colors shrink-0"
        >
          Get Started
        </Link>
      </div>
    </nav>
  );
}
```

- [ ] **Step 2: Type-check**

```bash
cd apps/web && npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add apps/web/components/Navbar.tsx
git commit -m "feat(nav): add shared Navbar with NavSearch slot"
```

---

### Task 16: Wire homepage to Navbar + HeroSearch

**Files:**
- Modify: `apps/web/app/page.tsx`

- [ ] **Step 1: Replace inline nav and hero CTA**

In `apps/web/app/page.tsx`:

1. At the top, add imports next to the existing ones:

```tsx
import Navbar from "@/components/Navbar";
import HeroSearch from "@/components/search/HeroSearch";
```

2. Replace the inline `<nav className="fixed top-0 left-0 right-0 z-50 nav-glass"> ... </nav>` block (currently lines 38–73) with:

```tsx
<Navbar />
```

3. In the `<section>` hero, replace the existing "Get Started" CTA block (the prominent button currently in the hero) with:

```tsx
<div className="relative z-10 w-full max-w-4xl px-4">
  <HeroSearch />
</div>
```

Keep the hero background image and headline copy unchanged.

- [ ] **Step 2: Type-check and lint**

```bash
cd apps/web && npx tsc --noEmit && npm run lint
```

Expected: no errors.

- [ ] **Step 3: Smoke test**

```bash
cd apps/web && npm run dev
```

Open http://localhost:3000 and verify:
- The new search bar renders in the hero with category pills above it.
- Clicking each column opens the correct popover.
- Filling Where + dates + Who + clicking Search routes to `/results?tab=flights` (or whichever category is active).
- Scrolling past the hero collapses NavSearch into the pill.

- [ ] **Step 4: Commit**

```bash
git add apps/web/app/page.tsx
git commit -m "feat(home): wire homepage to Navbar + HeroSearch"
```

---

### Task 17: Wire `/results` to Navbar + InlineSearch

**Files:**
- Modify: `apps/web/app/results/page.tsx`

- [ ] **Step 1: Add imports and remove the tab rendering**

In `apps/web/app/results/page.tsx`:

1. Add imports next to the existing ones:

```tsx
import Navbar from "@/components/Navbar";
import InlineSearch from "@/components/search/InlineSearch";
import type { Category, SearchState } from "@/components/search/searchTypes";
```

2. Keep the existing `tabs` array (lines 17–22) — it is still consumed by some downstream code paths in this file. The replacement only swaps the *rendering* block.

3. Read the active tab from `?tab=` so HeroSearch links land on the right tab. Just below the existing `useState<TabId>("flights")` line, add:

```tsx
import { useSearchParams } from "next/navigation";
// ... inside the component:
const searchParams = useSearchParams();
useEffect(() => {
  const t = searchParams.get("tab");
  if (t === "flights" || t === "stays" || t === "events" || t === "picks") {
    setActiveTab(t);
  }
}, [searchParams]);
```

4. Replace the sticky tab bar block (currently the `<div className="sticky top-[56px] ...">` wrapping the `tabs.map(...)` around lines 281–325) with:

```tsx
<div className="sticky top-[64px] z-30 bg-transparent">
  <InlineSearch
    initial={{ category: activeTab as Category }}
    onCategoryChange={(c) => setActiveTab(c)}
    onRefine={(state: SearchState) => {
      handleInlineUpdate({
        destinations: state.where ? [state.where] : undefined,
        departureCity: state.whereOrigin,
        startDate: state.startDate,
        endDate: state.endDate,
        flexibleDates: state.flexibleDates,
        travelersCount: state.adults + state.children + state.infants,
        childrenCount: state.children,
        infantsCount: state.infants,
        flightClass: state.cabin,
        activityInterests:
          state.category === "events" ? state.interests : state.vibe,
      });
      setActiveTab(state.category);
    }}
  />
</div>
```

5. At the top of the JSX return, add the Navbar above the existing content. Find the outer container and prepend:

```tsx
<Navbar
  onInPageSubmit={(state) => {
    handleInlineUpdate({
      destinations: state.where ? [state.where] : undefined,
      departureCity: state.whereOrigin,
      startDate: state.startDate,
      endDate: state.endDate,
      flexibleDates: state.flexibleDates,
      travelersCount: state.adults + state.children + state.infants,
      childrenCount: state.children,
      infantsCount: state.infants,
      flightClass: state.cabin,
      activityInterests:
        state.category === "events" ? state.interests : state.vibe,
    });
    setActiveTab(state.category);
  }}
/>
```

- [ ] **Step 2: Type-check and lint**

```bash
cd apps/web && npx tsc --noEmit && npm run lint
```

Expected: no errors.

- [ ] **Step 3: Smoke test**

```bash
cd apps/web && npm run dev
```

Open http://localhost:3000/results (after running the homepage flow at least once to seed `walter_prefs`). Verify:
- Categories switch which tab content is shown (`flights` / `stays` / `events` / `picks`).
- Changing Where + Dates and clicking Search re-fetches via `handleInlineUpdate` (network tab shows new requests).
- The page does not navigate.

- [ ] **Step 4: Commit**

```bash
git add apps/web/app/results/page.tsx
git commit -m "feat(results): replace tab bar with InlineSearch + add Navbar"
```

---

### Task 18: Sweep remaining pages onto shared Navbar

**Files:**
- Modify: `apps/web/app/explore/page.tsx`
- Modify: `apps/web/app/quiz/page.tsx` (use `<Navbar hideSearch />` — quiz has its own focus)
- Modify: `apps/web/app/saved/page.tsx`
- Modify: `apps/web/app/quick/page.tsx`
- Modify: `apps/web/app/dashboard/page.tsx`
- Modify: `apps/web/app/trip/page.tsx`
- Modify: `apps/web/app/about/page.tsx`
- Modify: `apps/web/app/privacy/page.tsx`
- Modify: `apps/web/app/terms/page.tsx`
- Modify: `apps/web/app/shared/[slug]/page.tsx`

- [ ] **Step 1: Replace each page's inline header with `<Navbar />`**

For each file above, find the existing `<header>` or `<nav>` block that uses `nav-glass` (matched earlier in this design). Replace the entire block with one of:

- For pages where the search bar should be visible: `<Navbar />`
- For pages where it should be hidden: `<Navbar hideSearch />` (use this for `/quiz` only — keep all others showing the search bar)

Add this import at the top of each file:

```tsx
import Navbar from "@/components/Navbar";
```

Remove any now-unused `Link` imports if `Link` is no longer referenced in the file.

- [ ] **Step 2: Type-check and lint**

```bash
cd apps/web && npx tsc --noEmit && npm run lint
```

Expected: no errors.

- [ ] **Step 3: Smoke test each route**

```bash
cd apps/web && npm run dev
```

Visit each route in the browser and verify the navbar renders correctly with the search bar (or pill) and that nothing on the page is hidden behind the navbar:
- http://localhost:3000/explore
- http://localhost:3000/quiz (search hidden)
- http://localhost:3000/saved
- http://localhost:3000/quick
- http://localhost:3000/dashboard
- http://localhost:3000/trip
- http://localhost:3000/about
- http://localhost:3000/privacy
- http://localhost:3000/terms
- http://localhost:3000/shared/test-slug (any slug, even 404 — only the navbar matters)

If any page's content is now hidden behind the fixed navbar (the new bar is 64px tall vs. the old 48px), bump the page's top padding accordingly.

- [ ] **Step 4: Commit**

```bash
git add apps/web/app/explore/page.tsx apps/web/app/quiz/page.tsx apps/web/app/saved/page.tsx apps/web/app/quick/page.tsx apps/web/app/dashboard/page.tsx apps/web/app/trip/page.tsx apps/web/app/about/page.tsx apps/web/app/privacy/page.tsx apps/web/app/terms/page.tsx "apps/web/app/shared/[slug]/page.tsx"
git commit -m "feat(nav): adopt shared Navbar across all pages"
```

---

### Task 19: Final integration smoke + cleanup

**Files:**
- (no new files; verification + final commit)

- [ ] **Step 1: Full type-check and lint**

```bash
cd apps/web && npx tsc --noEmit && npm run lint
```

Expected: clean.

- [ ] **Step 2: Build**

```bash
cd apps/web && npm run build
```

Expected: build succeeds with no new warnings beyond what `main` already emits.

- [ ] **Step 3: End-to-end smoke**

```bash
cd apps/web && npm run dev
```

Run this manual scenario:

1. Open http://localhost:3000 in a fresh incognito window (clears localStorage).
2. Verify HeroSearch is visible in the hero with all four categories and an empty search bar.
3. Click "Stays" category — the active pill should switch.
4. Click "Where", type "Miami", press Tab to close the popover.
5. Click "When", pick a check-in and check-out two days apart.
6. Click "Who", set Adults to 2.
7. Click "Vibe", pick "food" and "nature".
8. Click "Search". You should land on `/results?tab=stays` with the Stays tab active and content loading.
9. On `/results`, click the "Flights" category in the InlineSearch bar. The active tab should switch to flights without a navigation.
10. Scroll up to the navbar — `NavSearch` should be in its collapsed pill state on `/results`.
11. Click the pill, change "Where" to "New York", click Search. The page should re-fetch (no navigation) and the URL should still be `/results`.
12. Open `localStorage.walter_prefs` in DevTools and verify it contains `destinations: ["New York"]`, `travelersCount: 2`, `activityInterests: ["food", "nature"]`.

- [ ] **Step 4: Optional rollback verification**

Toggle `EXPANDING_SEARCH_ENABLED` to `false` in `apps/web/lib/featureFlags.ts`, reload, and verify the old link-based navbar comes back. Then flip it back to `true` and commit nothing.

- [ ] **Step 5: Final commit (if any cleanup was needed)**

```bash
git status
# If any files were touched during smoke (e.g., padding tweaks for navbar height):
git add -A
git commit -m "chore(nav): integration smoke fixes"
```

If `git status` is clean, no commit needed.

---

## Out of scope (follow-ups)

- Mobile full-screen sheet variant (current popovers are desktop-first; mobile users see the same popovers, which renders acceptably under 768px but is not the Airbnb mobile pattern).
- Calendar component (currently native `<input type="date">` — matches the rest of Walter).
- Autocomplete in `WherePopover` (currently a bare input — `DestinationAutocomplete` is tightly coupled to the quiz store).
- Deletion of the `tabs` array in `app/results/page.tsx` (kept for now in case other code paths reference it; remove in a follow-up PR after a week in production).
- Tests (Walter has no test infra; backfill once vitest/Playwright are introduced).
- Empty-`where` submit feedback (shake the Where column on submit when empty). Spec calls for this; deferring to a polish PR — current behavior is "submit fires anyway and `/results` handles the empty destination".
