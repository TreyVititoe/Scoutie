# Premium Teal Redesign — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform all Walter web pages from the flat Apple-inspired aesthetic to a branded premium teal design with teal glass nav, teal-tinted cards with hover lift, dark teal gradient hero, and warm page backgrounds.

**Architecture:** Foundation-first. Update Tailwind config + globals.css + layout for new tokens and utilities, then update each page/component to use them.

**Tech Stack:** Next.js 16, Tailwind CSS 3.4, Geist Sans, Framer Motion 12

---

## File Map

### Foundation (modify)
- `apps/web/tailwind.config.ts` — add new color tokens
- `apps/web/app/globals.css` — teal glass nav, card-base, icon-gradient, hero utilities
- `apps/web/app/layout.tsx` — update body bg class to `page-bg`

### Pages (modify)
- `apps/web/app/page.tsx` — homepage with split hero
- `apps/web/app/quiz/page.tsx` — quiz
- `apps/web/components/quiz/StepWrapper.tsx` — step container
- `apps/web/app/results/page.tsx` — results
- `apps/web/app/trip/page.tsx` — trip
- `apps/web/app/dashboard/page.tsx` — dashboard
- `apps/web/app/explore/page.tsx` — explore
- `apps/web/app/about/page.tsx` — about
- `apps/web/app/auth/login/page.tsx` — login
- `apps/web/app/privacy/page.tsx` — privacy
- `apps/web/app/terms/page.tsx` — terms
- `apps/web/app/shared/[slug]/page.tsx` — shared trip
- `apps/web/app/onboarding/page.tsx` — onboarding

### Components (modify)
- `apps/web/components/Footer.tsx`
- `apps/web/components/AffiliateDisclosure.tsx`
- `apps/web/components/results/FlightCard.tsx`
- `apps/web/components/results/HotelCard.tsx`
- `apps/web/components/results/EventCard.tsx`
- `apps/web/components/results/SuggestionCard.tsx`
- `apps/web/components/results/ExperienceCard.tsx`
- `apps/web/components/results/TripTracker.tsx`
- `apps/web/components/quiz/Step1WhereWhen.tsx`
- `apps/web/components/quiz/Step3Travelers.tsx`
- `apps/web/components/quiz/Step4Budget.tsx`
- `apps/web/components/quiz/Step4Flights.tsx`
- `apps/web/components/quiz/Step5Accommodation.tsx`
- `apps/web/components/quiz/Step6Activities.tsx`
- `apps/web/components/quiz/Step7Review.tsx`
- `apps/web/components/quiz/DestinationAutocomplete.tsx`
- `apps/web/components/trip/RefinementChat.tsx`
- `apps/web/components/trip/PackingList.tsx`
- `apps/web/components/trip/TripMap.tsx`
- `apps/web/components/onboarding/StepWhere.tsx`
- `apps/web/components/onboarding/StepWhen.tsx`
- `apps/web/components/onboarding/StepBudget.tsx`
- `apps/web/components/onboarding/StepVibes.tsx`
- `apps/web/components/onboarding/StepWho.tsx`
- `apps/web/components/onboarding/StepStay.tsx`

---

### Task 1: Update Foundation (Tailwind, globals.css, layout)

**Files:**
- Modify: `apps/web/tailwind.config.ts`
- Modify: `apps/web/app/globals.css`
- Modify: `apps/web/app/layout.tsx`

- [ ] **Step 1: Update tailwind.config.ts**

Add the new color tokens. Keep existing tokens (`gray-dark`, `accent`, `accent-light`, `on-light-secondary`, `on-light-tertiary`, `surface-dark`). Add new ones and update `on-dark-secondary` and `on-dark-tertiary` values. Update `page-bg`, add `accent-dark`, `accent-deep`, `cyan`. Update `borderRadius` default to 14px.

In `apps/web/tailwind.config.ts`, make these changes:
- Add `"page-bg": "#f0f4f5"` to colors
- Add `"accent-dark": "#003d47"` to colors
- Add `"accent-deep": "#001f26"` to colors
- Add `cyan: "#79e7f8"` to colors
- Change `"on-dark-secondary"` from `"rgba(255,255,255,0.8)"` to `"rgba(255,255,255,0.7)"`
- Change `"on-dark-tertiary"` from `"rgba(255,255,255,0.48)"` to `"rgba(255,255,255,0.4)"`
- Change `"on-light-secondary"` from `"rgba(0,0,0,0.8)"` to `"rgba(0,0,0,0.55)"`
- Change `"on-light-tertiary"` from `"rgba(0,0,0,0.48)"` to `"rgba(0,0,0,0.35)"`
- Change `borderRadius.DEFAULT` from `"8px"` to `"14px"`

- [ ] **Step 2: Update globals.css**

Replace the `nav-glass` rule and add new utility classes. Keep Material Symbols, `shadow-elevated`, focus rings, `scrollbar-hide`.

Replace `.nav-glass` with:
```css
.nav-glass {
  background: rgba(0, 101, 113, 0.75);
  backdrop-filter: saturate(180%) blur(20px);
  -webkit-backdrop-filter: saturate(180%) blur(20px);
}
```

Add after `shadow-elevated`:
```css
/* Hero gradient background */
.bg-hero-gradient {
  background: linear-gradient(165deg, #003d47 0%, #001f26 100%);
}

/* Hero radial glow overlay */
.hero-glow {
  background: radial-gradient(circle at 70% 30%, rgba(121, 231, 248, 0.1) 0%, transparent 50%);
}

/* Glass card on dark backgrounds */
.glass-card-dark {
  background: rgba(0, 101, 113, 0.2);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(121, 231, 248, 0.1);
}

/* Card base styles */
.card-base {
  background: white;
  border: 1px solid rgba(0, 101, 113, 0.08);
  box-shadow: 0 2px 12px rgba(0, 101, 113, 0.06);
  border-radius: 14px;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.card-base:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 101, 113, 0.1);
}

/* Icon gradient container */
.icon-gradient {
  background: linear-gradient(135deg, #e6f7f9, #ccf0f5);
  border-radius: 10px;
}
```

- [ ] **Step 3: Update layout.tsx**

Change body class from `bg-gray-light` to `bg-page-bg`:
```tsx
<body className="font-sans bg-page-bg text-gray-dark antialiased">
```

- [ ] **Step 4: Commit**

```bash
cd /Users/treyvititoe/projects/scoutie && git add apps/web/tailwind.config.ts apps/web/app/globals.css apps/web/app/layout.tsx && git commit -m "style: add premium teal design tokens and utilities

Teal glass nav, card-base with hover lift, icon-gradient,
hero gradient, glass-card-dark. Warm page-bg background."
```

---

### Task 2: Rewrite Homepage

**Files:**
- Modify: `apps/web/app/page.tsx`

- [ ] **Step 1: Rewrite the entire homepage**

Read the current file first, then rewrite applying these changes:

1. **Nav:** Keep `nav-glass` class (now teal glass via CSS). Brand "Walter" `text-white text-[15px] font-semibold`. Links `text-white/80 text-[11px]`. CTA: `bg-white/15 border border-white/20 text-white rounded-pill px-4 py-1.5 text-[11px] font-semibold hover:bg-white/25 transition-colors`. Height 48px (py-3).

2. **Hero (card-heavy split):** Full-width `bg-hero-gradient` with `hero-glow` overlay div (absolute, inset-0). Min-height `min-h-[85vh]`. Flex layout.
   - Left (42%, `flex-[0_0_42%]`): Padding p-8 md:p-12, flex col, justify-center. AI badge: flex items-center gap-2, cyan pulsing dot (`w-1.5 h-1.5 rounded-full bg-cyan animate-pulse`), text `text-cyan/70 text-[10px] uppercase tracking-[2px]`. Headline: `text-white text-[28px] md:text-[32px] font-semibold leading-tight tracking-display`, second line "Your whole trip." in `text-cyan`. Subtitle: `text-on-dark-secondary text-[13px] mt-3 leading-relaxed`. Two CTAs: "Plan your trip" = `bg-accent text-white rounded-[10px] px-5 py-2.5 text-[13px] font-semibold hover:bg-accent-light transition-colors`, "How it works" = `border border-cyan/30 text-cyan rounded-[10px] px-5 py-2.5 text-[13px] hover:bg-cyan/5 transition-colors`.
   - Right (58%, `flex-[0_0_58%]`): `bg-accent-deep/50` padding p-4 md:p-6, flex col gap-3 justify-center. 3 stacked destination cards using `glass-card-dark rounded-[14px] p-3 flex items-center gap-3`. Each card: thumbnail `w-[50px] h-[36px] rounded-[8px] object-cover`, destination name `text-white text-[13px] font-semibold`, subtitle `text-white/50 text-[10px]`, right side `text-cyan text-[10px]` (flight count). Use existing `destinations` array data (first 3).
   - Wrap in `motion.div` with `initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}`.

3. **Features strip:** `bg-white` section with `border-y` using `border-[rgba(0,101,113,0.06)]`. Compact `py-6`. Grid `grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6`. Each feature: icon in `.icon-gradient` container (`w-9 h-9 flex items-center justify-center`), icon `text-accent text-lg`. Title `text-sm font-semibold text-gray-dark`. Desc `text-xs text-on-light-secondary`. Single `motion.div` fade-in, no stagger.

4. **How it works:** `bg-page-bg` section, `py-20`. Centered heading `text-[32px] font-semibold text-gray-dark`. 3 `.card-base` cards in grid. Each: step number in `bg-accent text-white text-[11px] font-semibold w-6 h-6 rounded-[8px] flex items-center justify-center`. Icon in `.icon-gradient` container. Title `font-semibold text-[17px] text-gray-dark`. Desc `text-on-light-secondary text-sm`. `motion.div` whileInView fade-in.

5. **Events showcase:** `bg-white` section, `py-20`. Heading `text-[32px] font-semibold text-gray-dark`. Subtitle `text-on-light-secondary text-lg`. 4 `.card-base` cards in grid. ALL icons in `.icon-gradient` with `text-accent`. Title `font-semibold text-[17px] text-gray-dark`. Desc `text-on-light-secondary text-sm`. `motion.div` whileInView fade-in.

6. **Destinations:** `bg-page-bg` section, `py-20`. Heading `text-[32px] font-semibold text-gray-dark`. "View all" link `text-accent text-sm font-semibold hover:text-accent-light`. Image cards: `rounded-[14px] overflow-hidden` with inline style `box-shadow: 0 2px 12px rgba(0,101,113,0.06)` and hover class for `translateY(-4px)` + deeper shadow. Keep gradient overlay for text. Tag `bg-white/15 backdrop-blur-md rounded-pill`. Title `font-semibold text-2xl text-white`. Price `text-white/50 text-sm`.

7. **Final CTA:** `bg-hero-gradient` section with `hero-glow` overlay. `py-20`. White heading `text-[32px] font-semibold`. Subtitle `text-on-dark-secondary`. Button `bg-accent text-white rounded-[10px] px-6 py-3 text-[17px] font-semibold hover:bg-accent-light transition-colors`.

8. **Animations:** `motion.div` whileInView with `initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.3 }}`. No stagger, no springs, no whileTap.

- [ ] **Step 2: Verify build**

```bash
cd /Users/treyvititoe/projects/scoutie && npm run build --workspace=apps/web 2>&1 | tail -5
```

- [ ] **Step 3: Commit**

```bash
cd /Users/treyvititoe/projects/scoutie && git add apps/web/app/page.tsx && git commit -m "style: redesign homepage with premium teal aesthetic

Card-heavy split hero with dark teal gradient, teal glass nav,
teal-tinted cards with hover lift, icon gradients, warm bg."
```

---

### Task 3: Update Footer and AffiliateDisclosure

**Files:**
- Modify: `apps/web/components/Footer.tsx`
- Modify: `apps/web/components/AffiliateDisclosure.tsx`

- [ ] **Step 1: Update Footer.tsx**

Read the file first. Change:
- Footer bg: `bg-hero-gradient` (replaces `bg-gray-light`). Add `relative` and a `hero-glow` overlay div.
- Brand "Walter": keep `text-white text-[17px] font-semibold`.
- Description: `text-on-dark-secondary` (was `text-on-light-tertiary`).
- Section headers: `text-on-dark-tertiary` (was `text-on-light-tertiary`).
- Links: `text-on-dark-secondary hover:text-cyan transition-colors` (was `hover:text-accent-light` and `text-on-light-secondary`).
- Divider: `border-cyan/10` (was `border-black/5`).
- Copyright: `text-on-dark-tertiary`.

- [ ] **Step 2: Update AffiliateDisclosure.tsx**

Change text colors to `text-on-dark-tertiary` (matching dark footer bg).

- [ ] **Step 3: Commit**

```bash
cd /Users/treyvititoe/projects/scoutie && git add apps/web/components/Footer.tsx apps/web/components/AffiliateDisclosure.tsx && git commit -m "style: update footer with dark teal gradient

Hero gradient background, cyan hover links, on-dark text tokens."
```

---

### Task 4: Update Quiz Page and StepWrapper

**Files:**
- Modify: `apps/web/app/quiz/page.tsx`
- Modify: `apps/web/components/quiz/StepWrapper.tsx`

- [ ] **Step 1: Update StepWrapper.tsx**

Read file first. Change:
- Card container: `card-base p-8` (replaces `bg-white rounded-[8px] p-8`). This gives it the teal-tinted border, shadow, 14px radius, and hover lift.

- [ ] **Step 2: Update quiz/page.tsx**

Read file first. Change:
- Nav CTA: `bg-white/15 border border-white/20 text-white rounded-pill px-4 py-1.5 text-[11px] font-semibold` (glass pill style).
- Progress track: `bg-accent/15` (was `bg-on-light-tertiary/20`). Fill stays `bg-accent`.
- Continue button: `bg-accent text-white rounded-[10px] px-8 py-3 text-[17px] font-semibold hover:bg-accent-light transition-colors` (was `rounded-[8px]`).
- All `rounded-[8px]` on cards/containers become `rounded-[14px]`.

- [ ] **Step 3: Commit**

```bash
cd /Users/treyvititoe/projects/scoutie && git add apps/web/app/quiz/page.tsx apps/web/components/quiz/StepWrapper.tsx && git commit -m "style: update quiz with premium teal card treatment

Card-base step containers, teal progress bar, rounded-[10px] buttons."
```

---

### Task 5: Update Result Cards

**Files:**
- Modify: `apps/web/components/results/FlightCard.tsx`
- Modify: `apps/web/components/results/HotelCard.tsx`
- Modify: `apps/web/components/results/EventCard.tsx`
- Modify: `apps/web/components/results/SuggestionCard.tsx`
- Modify: `apps/web/components/results/ExperienceCard.tsx`

- [ ] **Step 1: Update all 5 card components**

Read each file first. Common changes across all:

1. Card wrapper: Replace `bg-white rounded-[8px]` with `card-base` class. Remove inline shadow/border if any (card-base provides them). Remove any `w-full` (card-base doesn't constrain width).
2. Icon containers: Replace `bg-gray-light` with `icon-gradient` class. Keep icon `text-accent`.
3. Tags: Replace neutral tags (`text-on-light-tertiary` etc) with teal pills: `bg-[#e6f7f9] text-accent rounded-pill px-2.5 py-0.5 text-[11px] font-semibold`.
4. Buttons: Replace `rounded-[8px]` with `rounded-[10px]`. Added state: `bg-accent text-white rounded-[10px] px-4 py-2 text-sm font-semibold hover:bg-accent-light transition-colors`. Not-added: `border border-accent text-accent rounded-[10px] px-4 py-2 text-sm font-semibold hover:bg-accent/5 transition-colors`.
5. Image fallback bg: Replace `bg-gray-light` with `bg-page-bg`.
6. All `rounded-[8px]` on card wrappers become handled by `card-base` (14px).
7. Star/rating icons: keep `text-accent`.

**ExperienceCard.tsx** specific: It doesn't use Framer Motion so just update the classes. Replace the outer `<a>` classes with `card-base block overflow-hidden`. Update inner radius to match.

- [ ] **Step 2: Commit**

```bash
cd /Users/treyvititoe/projects/scoutie && git add apps/web/components/results/FlightCard.tsx apps/web/components/results/HotelCard.tsx apps/web/components/results/EventCard.tsx apps/web/components/results/SuggestionCard.tsx apps/web/components/results/ExperienceCard.tsx && git commit -m "style: update result cards with premium teal treatment

Card-base with hover lift, icon-gradient containers, teal pill tags,
rounded-[10px] buttons with hover transitions."
```

---

### Task 6: Update Results Page and TripTracker

**Files:**
- Modify: `apps/web/app/results/page.tsx`
- Modify: `apps/web/components/results/TripTracker.tsx`

- [ ] **Step 1: Update results/page.tsx**

Read file first. Change:
- Background: already `bg-page-bg` via layout (was `bg-gray-light`, now `bg-page-bg`). If page has explicit bg class, update to `bg-page-bg`.
- Page heading: destination name `text-accent` (keep).
- Section headers: icon `text-accent`. Title `text-[20px] font-semibold text-gray-dark`.
- Skeleton loaders: container `card-base` (replaces `bg-white rounded-[8px]`). Pulse bars `bg-page-bg` (replaces `bg-gray-light`).
- Loading spinner: `border-accent` (keep).
- Add `motion.section` or `motion.div` with `whileInView={{ opacity: 1, y: 0 }} initial={{ opacity: 0, y: 20 }} viewport={{ once: true }} transition={{ duration: 0.3 }}` on each section if not already present.

- [ ] **Step 2: Update TripTracker.tsx**

Read file first. Change:
- Desktop sidebar: `card-base p-6` (replaces `bg-white rounded-[8px] p-6`).
- View Trip button: `bg-accent text-white rounded-[10px] px-4 py-2 text-sm font-semibold hover:bg-accent-light transition-colors`.
- Share button: `border border-accent text-accent rounded-[10px] px-4 py-2 text-sm hover:bg-accent/5 transition-colors` (was `border-gray-dark text-gray-dark`).
- Item count badge: keep `bg-accent text-white rounded-pill`.
- Items: `bg-page-bg rounded-[14px] p-3` (was `bg-gray-light rounded-[8px]`).
- Mobile bar: `bg-white border-t border-[rgba(0,101,113,0.08)]` (teal-tinted border).
- Mobile sheet: `rounded-t-[14px]` (was `rounded-t-[8px]`).
- Handle: `bg-on-light-tertiary` (keep).

- [ ] **Step 3: Commit**

```bash
cd /Users/treyvititoe/projects/scoutie && git add apps/web/app/results/page.tsx apps/web/components/results/TripTracker.tsx && git commit -m "style: update results page and TripTracker with premium teal

Card-base containers, teal-tinted borders, rounded-[10px] buttons,
scroll-reveal animations."
```

---

### Task 7: Update Trip Page

**Files:**
- Modify: `apps/web/app/trip/page.tsx`

- [ ] **Step 1: Update trip/page.tsx**

Read file first. Change:
- Hero overview section: `bg-hero-gradient relative`. Add `hero-glow` overlay div (absolute inset-0). Label: `text-on-dark-tertiary`. Title: `text-white`. Destination: `text-white`. Price: `text-cyan font-semibold text-[28px]`. Icons: `text-cyan`. Dividers: `bg-cyan/10`.
- Item cards: `card-base p-5`. Type label: `bg-[#e6f7f9] text-accent rounded-pill px-2.5 py-0.5 text-[11px] font-semibold`. CTA button: `bg-accent text-white rounded-[10px] px-4 py-1.5 text-[12px] font-semibold hover:bg-accent-light`.
- Map/cost/packing widgets: `card-base p-6`.
- Cost total: `font-semibold text-accent text-[21px]`. Border: `border-[rgba(0,101,113,0.08)]`.
- Empty state CTA: `bg-accent text-white rounded-[10px] px-8 py-3 font-semibold hover:bg-accent-light`.

- [ ] **Step 2: Commit**

```bash
cd /Users/treyvititoe/projects/scoutie && git add apps/web/app/trip/page.tsx && git commit -m "style: update trip page with premium teal

Hero gradient with glow, card-base items, teal pill type labels,
cyan prices and accents."
```

---

### Task 8: Update Dashboard and Explore

**Files:**
- Modify: `apps/web/app/dashboard/page.tsx`
- Modify: `apps/web/app/explore/page.tsx`

- [ ] **Step 1: Update dashboard/page.tsx**

Read file first. Change:
- Action cards: `card-base p-6`. Icon containers: `icon-gradient` with `text-accent`. Title: `font-semibold text-[17px] text-gray-dark`. Desc: `text-on-light-secondary text-sm`.
- Trip cards: `card-base p-5`. Title: `font-semibold text-gray-dark`. Date: `text-[12px] text-on-light-tertiary`.
- Empty state: `card-base p-10`. CTA: `bg-accent text-white rounded-[10px] px-6 py-3 font-semibold hover:bg-accent-light`.

- [ ] **Step 2: Update explore/page.tsx**

Read file first. Change:
- Filter active: `bg-accent text-white rounded-pill` (keep). Inactive: `bg-white border border-[rgba(0,101,113,0.08)] text-on-light-secondary rounded-pill hover:border-accent/30` (was `border-black/10`).
- Destination cards: `card-base overflow-hidden`. Kill inline `shadow-elevated` if present (card-base has its own shadow). Image stays as-is.
- CTA section: `bg-hero-gradient relative` with `hero-glow` overlay. Heading `text-white`. Button `bg-accent text-white rounded-[10px] hover:bg-accent-light`.

- [ ] **Step 3: Commit**

```bash
cd /Users/treyvititoe/projects/scoutie && git add apps/web/app/dashboard/page.tsx apps/web/app/explore/page.tsx && git commit -m "style: update dashboard and explore with premium teal

Card-base containers, icon-gradient badges, teal filters,
hero gradient CTA section."
```

---

### Task 9: Update About Page

**Files:**
- Modify: `apps/web/app/about/page.tsx`

- [ ] **Step 1: Update about/page.tsx**

Read file first. Change:
- Nav CTA: `bg-accent text-white rounded-[10px] px-5 py-2 text-sm font-semibold hover:bg-accent-light` (was `rounded-[8px]`).
- Hero: `bg-hero-gradient relative` with `hero-glow` overlay. Badge: `bg-accent-deep/50 text-on-dark-secondary rounded-pill px-4 py-1.5 border border-cyan/10`. Add cyan pulsing dot. Heading: `text-white`. Desc: `text-on-dark-secondary`.
- Mission section: `bg-white` (alternate from page-bg). Cards/content stay light theme.
- How it works: `bg-page-bg`. Cards: `card-base p-8`. Number badge: `bg-accent text-white rounded-[8px]`.
- Values: `bg-white`. Cards: `card-base p-8`. Bullet: `bg-accent`.
- CTA: `bg-hero-gradient relative` with `hero-glow`. Button: `bg-accent text-white rounded-[10px] hover:bg-accent-light`.
- Alternating rhythm: hero (gradient) -> mission (white) -> how it works (page-bg) -> values (white) -> CTA (gradient).

- [ ] **Step 2: Commit**

```bash
cd /Users/treyvititoe/projects/scoutie && git add apps/web/app/about/page.tsx && git commit -m "style: update about page with premium teal

Hero gradient with glow, alternating white/page-bg sections,
card-base treatment, teal accents throughout."
```

---

### Task 10: Update Login, Privacy, Terms, Shared Trip, Onboarding Pages

**Files:**
- Modify: `apps/web/app/auth/login/page.tsx`
- Modify: `apps/web/app/privacy/page.tsx`
- Modify: `apps/web/app/terms/page.tsx`
- Modify: `apps/web/app/shared/[slug]/page.tsx`
- Modify: `apps/web/app/onboarding/page.tsx`

- [ ] **Step 1: Update login/page.tsx**

Read file first. Change:
- Card: `card-base p-8 max-w-md w-full` (replaces `bg-white rounded-[8px] p-8`).
- Google button: `rounded-[10px] border border-[rgba(0,101,113,0.08)] hover:bg-page-bg` (was `border-black/10 hover:bg-gray-light`).
- Input: `rounded-[10px] border border-[rgba(0,101,113,0.08)] focus:ring-accent/20` (was `border-black/10 rounded-[8px]`).
- Submit: `bg-accent rounded-[10px] hover:bg-accent-light` (was `rounded-[8px]`).
- Divider: `bg-[rgba(0,101,113,0.06)]` (was `bg-black/5`).
- Success icon bg: `bg-[#e6f7f9]` (was `bg-accent/10`).

- [ ] **Step 2: Update privacy/page.tsx and terms/page.tsx**

Read each file. Change:
- Content container: `card-base p-8 max-w-3xl mx-auto` (replaces `bg-white rounded-[8px] p-8`).
- Links: `text-accent hover:text-accent-light` (was `hover:underline`).

- [ ] **Step 3: Update shared/[slug]/page.tsx**

Read file first. Change:
- Hero/banner: `bg-hero-gradient relative` with `hero-glow` overlay. Text stays white.
- Day cards/timeline: `card-base`. Type labels: `bg-[#e6f7f9] text-accent rounded-pill`.
- Timeline line: `bg-[rgba(0,101,113,0.08)]` (was `bg-black/10`).
- Cost: `text-accent font-semibold`.
- CTA: `bg-accent text-white rounded-[10px] hover:bg-accent-light`.

- [ ] **Step 4: Update onboarding/page.tsx**

Read file first. Change:
- Step cards: `card-base`.
- Buttons: `bg-accent text-white rounded-[10px] hover:bg-accent-light`.
- Progress: `bg-accent`.

- [ ] **Step 5: Commit**

```bash
cd /Users/treyvititoe/projects/scoutie && git add apps/web/app/auth/login/page.tsx apps/web/app/privacy/page.tsx apps/web/app/terms/page.tsx "apps/web/app/shared/[slug]/page.tsx" apps/web/app/onboarding/page.tsx && git commit -m "style: update remaining pages with premium teal

Card-base containers, teal-tinted borders, rounded-[10px] inputs/buttons,
hero gradient on shared trip, consistent teal accents."
```

---

### Task 11: Update Quiz Step Components

**Files:**
- Modify: `apps/web/components/quiz/Step1WhereWhen.tsx`
- Modify: `apps/web/components/quiz/Step3Travelers.tsx`
- Modify: `apps/web/components/quiz/Step4Budget.tsx`
- Modify: `apps/web/components/quiz/Step4Flights.tsx`
- Modify: `apps/web/components/quiz/Step5Accommodation.tsx`
- Modify: `apps/web/components/quiz/Step6Activities.tsx`
- Modify: `apps/web/components/quiz/Step7Review.tsx`
- Modify: `apps/web/components/quiz/DestinationAutocomplete.tsx`

- [ ] **Step 1: Update all 8 quiz step components**

Read each file first. Common changes:
1. Inputs: `rounded-[10px] border border-[rgba(0,101,113,0.08)] focus:ring-2 focus:ring-accent/20` (was `border-black/10 rounded-[8px]`).
2. Selection cards: `rounded-[14px] border border-[rgba(0,101,113,0.08)] hover:border-accent/30`. Active: `bg-accent/5 border-accent`.
3. Stepper buttons (+/-): `bg-page-bg hover:bg-[#e6f7f9]` (was `bg-gray-light hover:bg-black/5`).
4. Pill preset buttons: Active `bg-accent text-white`. Inactive `bg-page-bg text-on-light-secondary rounded-pill hover:border-accent/30`.
5. Icon containers on activity cards: `icon-gradient` class (was `bg-gray-light`).

**DestinationAutocomplete.tsx** specific:
- Dropdown: `card-base` (replaces `bg-white rounded-[8px] shadow-elevated border border-black/5`). Override hover on dropdown to not lift -- add `[&]:hover:transform-none [&]:hover:shadow-none` or use inline styles.
- Suggestion items: `hover:bg-page-bg` (was `hover:bg-gray-light`).
- Tags: `bg-[#e6f7f9] text-accent rounded-pill px-3 py-1 text-sm` (was `bg-gray-light text-gray-dark`). Remove button: `text-on-light-tertiary hover:text-accent`.

- [ ] **Step 2: Commit**

```bash
cd /Users/treyvititoe/projects/scoutie && git add apps/web/components/quiz/ && git commit -m "style: update quiz components with premium teal

Teal-tinted input borders, icon-gradient activity cards,
teal pill tags, accent selection states."
```

---

### Task 12: Update Trip and Onboarding Sub-Components

**Files:**
- Modify: `apps/web/components/trip/RefinementChat.tsx`
- Modify: `apps/web/components/trip/PackingList.tsx`
- Modify: `apps/web/components/trip/TripMap.tsx`
- Modify: `apps/web/components/onboarding/StepWhere.tsx`
- Modify: `apps/web/components/onboarding/StepWhen.tsx`
- Modify: `apps/web/components/onboarding/StepBudget.tsx`
- Modify: `apps/web/components/onboarding/StepVibes.tsx`
- Modify: `apps/web/components/onboarding/StepWho.tsx`
- Modify: `apps/web/components/onboarding/StepStay.tsx`

- [ ] **Step 1: Update trip sub-components**

Read each file first.

**RefinementChat.tsx:**
- Container: `card-base` (replaces `bg-white rounded-[8px] shadow-elevated`).
- User bubble: `bg-accent text-white rounded-[14px]`.
- AI bubble: `bg-page-bg text-gray-dark rounded-[14px]`.
- Input: `border border-[rgba(0,101,113,0.08)] rounded-[10px] focus:ring-accent/20`.
- Send button: `bg-accent text-white rounded-[10px] hover:bg-accent-light`.
- Quick suggestions: `border border-[rgba(0,101,113,0.08)] text-on-light-secondary rounded-pill hover:border-accent/30 hover:bg-accent/5`.

**PackingList.tsx:**
- Container: `card-base p-6`.
- Progress bar track: `bg-page-bg`. Fill: `bg-accent`.
- Checkboxes: `text-accent`.
- Copy button: `text-accent hover:text-accent-light`.

**TripMap.tsx:**
- Container: `card-base p-6`.
- Loading/empty states: `bg-page-bg rounded-[14px]`.

- [ ] **Step 2: Update onboarding step components**

Read each file first. Common changes (same as quiz steps):
1. Inputs: `rounded-[10px] border border-[rgba(0,101,113,0.08)] focus:ring-accent/20`.
2. Selection cards: `rounded-[14px] border border-[rgba(0,101,113,0.08)] hover:border-accent/30`. Active: `bg-accent/5 border-accent`.
3. Primary buttons: `bg-accent rounded-[10px] hover:bg-accent-light`.
4. Back buttons: `border border-[rgba(0,101,113,0.08)] text-on-light-secondary rounded-[10px] hover:bg-page-bg`.
5. Preset pills: `rounded-pill border border-[rgba(0,101,113,0.08)] hover:border-accent/30`.

- [ ] **Step 3: Commit**

```bash
cd /Users/treyvititoe/projects/scoutie && git add apps/web/components/trip/ apps/web/components/onboarding/ && git commit -m "style: update trip and onboarding components with premium teal

Card-base containers, teal-tinted borders, rounded-[14px] cards,
accent progress bars and checkboxes."
```

---

### Task 13: Final Build Verification

- [ ] **Step 1: Run the full build**

```bash
cd /Users/treyvititoe/projects/scoutie && npm run build --workspace=apps/web 2>&1
```

Expected: Build succeeds with no errors.

- [ ] **Step 2: Fix any build errors**

Common issues to fix:
- References to `bg-gray-light` -- replace with `bg-page-bg`
- References to `rounded-[8px]` that should be `rounded-[14px]` or `card-base`
- Any remaining `border-black/5` or `border-black/10` -- replace with `border-[rgba(0,101,113,0.08)]`

- [ ] **Step 3: Commit fixes if any**

```bash
cd /Users/treyvititoe/projects/scoutie && git add -A && git commit -m "fix: resolve build errors from premium teal redesign"
```
