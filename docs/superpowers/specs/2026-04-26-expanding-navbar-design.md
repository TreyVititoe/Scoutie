# Expanding Search Bar — Design

**Date:** 2026-04-26
**Status:** Approved (brainstorming complete; ready for implementation plan)

## Problem

Walter's current global navbar is a thin Apple-style glass strip with a fixed link set (Explore / Plan a Trip / Saved Trips / Get Started). It does not let a returning user search directly. The quiz is the only way in, which is slow for power users and offers no equivalent to Airbnb's homepage and global navbar search bar that anchors their entire product.

The four product surfaces — Flights, Stays, Events, Walter's Picks — already exist as tabs on `/results` but are not represented anywhere else in the navigation. Users have no global way to switch between them or to start a new search from any page.

## Goal

Build an Airbnb-style expanding search bar that:

1. Surfaces the four product categories (Flights / Stays / Events / Walter's Picks) as a top-level switcher.
2. Lets users fill `Where / When / Who / [category-specific 4th slot]` inline and submit.
3. Lives on three surfaces: homepage hero, global navbar (every page), and the `/results` page (replacing the current tabs).
4. Reads and writes the existing `walter_prefs` localStorage key so it composes cleanly with the quiz.

## Non-goals

- Saved searches / recent searches dropdown.
- Airbnb's "I'm flexible" flexible-month picker. Walter already has a `flexibleDates: boolean` — keep that as a simple checkbox in the When popover.
- Map-based destination picker. The existing `DestinationAutocomplete` is sufficient.
- Replacing the quiz. The quiz remains the canonical onboarding for first-time users; the bar is a power-user shortcut and a refinement surface.

## Architecture

A headless `<SearchCore>` component owns categories, fields, popovers, and state. Three thin wrappers supply chrome and submit behavior for each surface.

```
apps/web/components/search/
  SearchCore.tsx          // headless: renders categories + fields + popovers
  HeroSearch.tsx          // homepage hero wrapper
  NavSearch.tsx           // global navbar wrapper (collapses-to-pill on scroll)
  InlineSearch.tsx        // /results wrapper (sticky, no nav chrome)
  popovers/
    WherePopover.tsx      // wraps existing DestinationAutocomplete
    WhenPopover.tsx       // dual-month calendar + flexible-dates checkbox
    WhoPopover.tsx        // adults / children / infants steppers
    CategoryPopover.tsx   // 4th-slot, branches by category
  useSearchBar.ts         // hook: state, walter_prefs sync, submit
  searchTypes.ts          // Category, SearchState, SubmitHandler
```

Files stay small (target: SearchCore < 250 lines, popovers < 120 each). The wrappers are ~30 lines each and contain no search logic — only chrome and a `submit` handler passed into `<SearchCore>`.

## Data model

```ts
// searchTypes.ts
export type Category = "flights" | "stays" | "events" | "picks";

export interface SearchState {
  category: Category;
  where: string;                     // destination
  whereOrigin?: string;              // departure city — flights only
  startDate: string | null;
  endDate: string | null;
  flexibleDates: boolean;
  adults: number;
  children: number;
  infants: number;
  // 4th-slot — only one is read at submit time based on category
  cabin?: FlightClass;               // flights
  vibe?: ActivityInterest[];         // stays + picks
  interests?: ActivityInterest[];    // events
}

export type SubmitHandler = (state: SearchState) => void;
```

`FlightClass` and `ActivityInterest` are imported from `lib/stores/quizStore.ts` (already defined). No new shared types in `packages/shared` — this is web-only chrome.

### `walter_prefs` mapping

The hook reads from and writes to the existing `walter_prefs` key. No schema change. Mapping:

| SearchState         | walter_prefs                        |
| ------------------- | ----------------------------------- |
| `where`             | `destinations[0]`                   |
| `whereOrigin`       | `departureCity`                     |
| `startDate`         | `startDate`                         |
| `endDate`           | `endDate`                           |
| `flexibleDates`     | `flexibleDates`                     |
| `adults`            | `travelersCount` (minus children)   |
| `children`          | `childrenCount`                     |
| `infants`           | `infantsCount` (new field; defaults to 0 if absent) |
| `cabin`             | `flightClass`                       |
| `vibe` / `interests`| `activityInterests`                 |

`infantsCount` is a new field; `lib/stores/quizStore.ts` gets a one-line addition. All other fields exist.

## Visual structure

Two stacked rows, matching Airbnb:

**Row 1 — Categories.** Four pill buttons centered above the search bar. Material Symbols icons reused from the existing `/results` tabs array:

| Category       | Icon              |
| -------------- | ----------------- |
| Flights        | `flight`          |
| Stays          | `hotel`           |
| Events         | `local_activity`  |
| Walter's Picks | `auto_awesome`    |

Active category: filled white surface, MD3 elevation. Inactive: ghost (transparent + 60% white text on the dark glass). No "NEW" badge.

**Row 2 — Search bar.** Rounded-pill container split into four columns by faint dividers. Columns: `Where`, `When`, `Who`, `[4th]`. Each column is a button. Active column raises onto a white surface with shadow (Airbnb's floating-cell pattern). Submit button sits at the right end as a circular icon button using Walter's MD3 `primary` teal (no pink — stays on-brand). Submit shows a `search` icon with the label hidden on smaller widths.

**4th-slot label per category:**

| Category | Label    | Popover content                                    |
| -------- | -------- | -------------------------------------------------- |
| Flights  | `Cabin`  | Radio list: economy / premium / business / first   |
| Stays    | `Vibe`   | Multi-select chips of `ActivityInterest` values    |
| Events   | `Interests` | Same multi-select as Stays                      |
| Picks    | `Vibe`   | Same multi-select as Stays                         |

**Glass.** New utility `.search-glass` in `globals.css`. Same teal as `nav-glass` at lower opacity (~`rgba(0, 101, 113, 0.55)`), heavier blur (`saturate(180%) blur(28px)`), plus a 1px top border in `rgba(255,255,255,0.12)` for the highlight edge.

## Interaction states

### Collapsed pill (NavSearch only)
- Triggered when scrolled past the hero on the homepage, or whenever NavSearch is rendered on an inner page.
- Single pill showing summary text: `"Anywhere · Any week · Add guests"` if empty, or `"Miami · Apr 26 – May 2 · 2 guests"` when filled.
- Click expands the full two-row layout with a framer-motion `layoutId` animation (~220ms).

### Expanded (default for HeroSearch and InlineSearch)
- Two-row layout always visible.
- Clicking a column opens its popover; clicking another column swaps the popover.
- Click outside the bar collapses NavSearch (back to pill) and closes any open popover for HeroSearch and InlineSearch.

### Mobile (< 768px)
- Clicking any field opens a full-screen sheet that slides up from the bottom (framer-motion `y: 100%` → `y: 0`).
- The sheet contains: a sticky header with the category pills (horizontal scroll) and the four field sections stacked vertically. Submit button anchored to the bottom.
- The collapsed-pill state on NavSearch becomes the only visible bar on mobile until tapped.

## Per-surface behavior

### HeroSearch (`apps/web/app/page.tsx`)
- Replaces the existing "Get Started" CTA block in the hero.
- Always expanded; no collapsed state.
- Submit handler: write `walter_prefs`, then `router.push("/results?tab=<category>")`.

### NavSearch (`apps/web/components/Navbar.tsx`, new shared component)
- New shared `Navbar` component extracted from the per-page header pattern. Replaces the inline `<nav>` block currently duplicated across `app/page.tsx`, `app/explore/page.tsx`, `app/quiz/page.tsx`, `app/saved/page.tsx`, `app/quick/page.tsx`, `app/dashboard/page.tsx`, `app/trip/page.tsx`, `app/about/page.tsx`, `app/privacy/page.tsx`, `app/terms/page.tsx`, `app/shared/[slug]/page.tsx`.
- Layout: Walter logo (left), `<NavSearch>` (center), Get Started + auth icon (right).
- On homepage above the fold: expanded. On scroll-Y > 80 or on any inner page: collapsed pill. State managed via `useScrollPosition` (a small hook in `lib/hooks/`).
- Submit handler: if `pathname === "/results"`, call the `onSubmit` prop (which the results page wires to its existing `handleInlineUpdate`). Otherwise, write `walter_prefs` and `router.push("/results?tab=<category>")`.

### InlineSearch (`apps/web/app/results/page.tsx`)
- Replaces the rendering block around line 284 that maps the current `tabs` array. The `tabs` array itself (lines 17–22) is kept in source through this PR and removed in the rollout follow-up — see Rollout.
- Sticky at top of the results content, below the global Navbar.
- Always expanded.
- Submit handler: call `handleInlineUpdate` (already exists at line 44). The existing `setActiveTab` becomes a side-effect of category change inside `<SearchCore>` via the `onCategoryChange` prop.

## State and the hook

```ts
// useSearchBar.ts
function useSearchBar(initial?: Partial<SearchState>): {
  state: SearchState;
  setField: <K extends keyof SearchState>(key: K, value: SearchState[K]) => void;
  setCategory: (c: Category) => void;
  reset: () => void;
  toPrefs: () => WalterPrefs;
}
```

- On mount: hydrate from `walter_prefs` (or `initial` if provided — used by InlineSearch to take the page's current prefs).
- `setField` updates only in-memory state. `walter_prefs` is written on submit, not on every keystroke.
- `toPrefs()` returns the merged prefs object ready for `localStorage.setItem`. Merging preserves any quiz-only fields (budget, accommodationTypes, etc.) so a user with a saved quiz never loses them.

## Error handling

- Submit with empty `where` → focus `WherePopover` and shake the column (no toast).
- Submit with `endDate < startDate` → already prevented by the calendar (the second click only registers if it's >= startDate).
- localStorage unavailable (private browsing, quota) → fall back to in-memory state for the session; submit still routes correctly. No user-facing error.

## Testing

- **Component tests** (`*.test.tsx`, vitest):
  - `SearchCore` renders all four categories and switches active.
  - Each popover opens/closes via column click.
  - `useSearchBar.toPrefs()` produces the correct merged object for each category.
  - Submit fires with the expected `SearchState`.
- **One Playwright e2e** (`tests/e2e/search-bar.spec.ts`):
  - Open homepage → click Where → type "Miami" → pick suggestion → click When → pick a date range → click Search → land on `/results?tab=flights` and verify the flights tab is active.
- Wrappers (`HeroSearch`, `NavSearch`, `InlineSearch`) are not unit-tested — they're chrome only. The Playwright test covers their behavior end-to-end.

## Rollout

- Single PR. The bar is gated by a constant `EXPANDING_SEARCH_ENABLED` in `lib/featureFlags.ts` (default true) so it can be flipped off if a regression appears post-merge.
- The `tabs` array on `/results` stays in source until the `<InlineSearch>` ships and is verified in production, then is removed in a follow-up PR.
