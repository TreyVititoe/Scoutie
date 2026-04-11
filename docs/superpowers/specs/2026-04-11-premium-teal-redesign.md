# Premium Teal Redesign

**Date:** 2026-04-11
**Scope:** Visual overhaul of all web pages. Replace the flat Apple-inspired aesthetic with a branded premium teal design. No functionality changes.
**Approach:** Foundation-first -- update Tailwind config, globals.css, then cascade through each page and component.

---

## 1. Color System

| Token | Value | Role |
|-------|-------|------|
| `page-bg` | `#f0f4f5` | Page background -- warm teal-tinted gray |
| `gray-dark` | `#1d1d1f` | Primary text on light backgrounds |
| `accent` | `#006571` | Primary brand color, buttons, prices |
| `accent-dark` | `#003d47` | Dark end of teal gradients |
| `accent-deep` | `#001f26` | Deepest dark for hero/footer backgrounds |
| `accent-light` | `#007d8a` | Lighter teal for hover states |
| `cyan` | `#79e7f8` | Glow accents on dark backgrounds, highlights |
| `card-border` | `rgba(0,101,113,0.08)` | Subtle teal-tinted card borders |
| `card-shadow` | `0 2px 12px rgba(0,101,113,0.06)` | Teal-tinted card shadows |
| `card-shadow-hover` | `0 8px 24px rgba(0,101,113,0.1)` | Deepened shadow on hover |
| `icon-bg-from` | `#e6f7f9` | Teal gradient start for icon containers |
| `icon-bg-to` | `#ccf0f5` | Teal gradient end for icon containers |
| `on-light-secondary` | `rgba(0,0,0,0.55)` | Secondary text on light bg |
| `on-light-tertiary` | `rgba(0,0,0,0.35)` | Tertiary/disabled text |
| `on-dark-secondary` | `rgba(255,255,255,0.7)` | Secondary text on dark/teal bg |
| `on-dark-tertiary` | `rgba(255,255,255,0.4)` | Tertiary text on dark bg |

---

## 2. Typography

Keep Geist Sans from the previous redesign. Same scale, same weight rules (max semibold 600). No changes to font loading or line-height/letter-spacing tokens.

---

## 3. Components

### Navigation (all pages)
- Bold teal glass: `rgba(0,101,113,0.75)` + `backdrop-filter: saturate(180%) blur(20px)`
- Height: 48px, sticky, z-50
- Brand "Walter": white, 15px, semibold
- Links: white 80%, 11px
- CTA: glass pill -- `rgba(255,255,255,0.15)` bg, `border 1px solid rgba(255,255,255,0.2)`, white text, rounded-pill

### Cards
- Background: white
- Border: `1px solid rgba(0,101,113,0.08)`
- Shadow: `0 2px 12px rgba(0,101,113,0.06)`
- Radius: 14px
- Icon containers: `linear-gradient(135deg, #e6f7f9, #ccf0f5)` with rounded-[10px], teal icon
- Hover: `translateY(-2px)` + shadow deepens to `0 8px 24px rgba(0,101,113,0.1)`. Duration 0.2s ease.

### Buttons
- Primary: `bg-accent text-white rounded-[10px] px-5 py-2.5`. Hover: `bg-accent-light`.
- Secondary/pill: transparent bg, `border 1px solid accent`, teal text, rounded-pill. Hover: `bg-accent/5`.
- On dark backgrounds: glass pill -- `rgba(255,255,255,0.15)` bg, white border/text.
- Add-to-trip toggle: filled teal when added, outlined teal when not. Rounded-[10px].

### Section Headers
- Icon inline: `text-accent text-[20px]`
- Title: `text-[20px] font-semibold text-gray-dark`
- Optional subtitle: `text-on-light-secondary text-sm`

### Prices
- `font-semibold text-accent` everywhere. No font-mono.

### Tags/Badges
- Light teal pill: `bg-[#e6f7f9] text-accent rounded-pill px-2.5 py-0.5 text-[11px] font-semibold`
- Neutral pill: `bg-page-bg text-on-light-secondary` same shape

---

## 4. Globals & CSS

### Update `nav-glass`
Replace current dark glass with teal glass:
```css
.nav-glass {
  background: rgba(0, 101, 113, 0.75);
  backdrop-filter: saturate(180%) blur(20px);
  -webkit-backdrop-filter: saturate(180%) blur(20px);
}
```

### Add new utilities
```css
/* Hero gradient background */
.bg-hero-gradient {
  background: linear-gradient(165deg, #003d47 0%, #001f26 100%);
}

/* Hero radial glow */
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

### Keep from current
- Material Symbols styles
- `shadow-elevated` utility
- Focus rings (`outline: 2px solid #006571`)
- `.scrollbar-hide`

---

## 5. Homepage

### Hero (card-heavy split, 42/58)
- Full-width `bg-hero-gradient` with `hero-glow` overlay
- Left (42%): AI badge with cyan pulsing dot. Headline white 32px semibold, "Your whole trip." in cyan. Subtitle `on-dark-secondary`. Two CTAs: solid teal "Plan your trip" + glass pill "How it works".
- Right (58%): 3 stacked destination preview cards using `glass-card-dark` with thumbnail, name, price, flight count in cyan.
- Min-height: 85vh. Simple fade-in 0.3s.

### Features strip
- `bg-white` with `border-y border-[rgba(0,101,113,0.06)]`
- 6-column grid, icons in `.icon-gradient` containers
- Compact py-6

### How it works
- `bg-page-bg` section
- 3 `.card-base` cards
- Step number in teal gradient badge (rounded-[8px])
- Icon in `.icon-gradient` container

### Events showcase
- `bg-white` section
- 4 `.card-base` cards
- All icons in `.icon-gradient` (no per-category colors)

### Destinations
- `bg-page-bg` section
- Image cards: 14px radius, teal-tinted shadow
- Hover: `translateY(-4px)` + shadow deepens. No image scale.
- Tags: `bg-white/15 backdrop-blur-md` pill
- Gradient overlay for text readability

### Final CTA
- `bg-hero-gradient` with `hero-glow`
- Centered white heading, `on-dark-secondary` subtitle
- Solid teal button

---

## 6. Page-by-Page

### Quiz
- Page bg: `page-bg`. White step cards, 14px radius, teal-tinted border/shadow.
- Progress: `bg-accent/15` track, `bg-accent` fill.
- Inputs: white bg, `border card-border`, 10px radius, `focus:ring-accent/20`.
- Selection cards: white, teal border + `bg-accent/5` when selected.
- Continue: solid teal 10px radius. Back: plain text link.

### Results
- Page bg: `page-bg`. Teal glass nav.
- Destination name in `text-accent`.
- Cards in responsive grid, `.card-base`, hover lift.
- Teal gradient icon containers, teal prices.
- Tags: light teal pills.

### Trip
- Hero: `bg-hero-gradient` section. White text, price in `cyan`.
- Item cards: `.card-base`, type label as light teal pill.
- Sidebar: `.card-base`, teal total price.
- Map: `.card-base`.

### Dashboard
- Page bg: `page-bg`. White action cards with `.icon-gradient` containers.
- Trip cards: `.card-base`, hover lift. Teal links.

### Explore
- Filters: teal filled pill (active), white outlined pill (inactive).
- Destination cards: `.card-base` with image, shadow, hover lift.

### About
- Hero: `bg-hero-gradient` with `hero-glow`. Badge with cyan dot.
- Alternating sections: `page-bg` and `white`.
- Cards: `.card-base`.
- CTA: `bg-hero-gradient`.

### Login
- Page bg: `page-bg`. White card, 14px radius, teal shadow.
- Teal primary button, teal focus rings.

### Footer
- `bg-hero-gradient` (dark teal, matches hero).
- White brand, `on-dark-secondary` links, `cyan` hover color.
- `border-top: 1px solid rgba(121,231,248,0.1)`.

### Privacy, Terms, Shared Trip, Onboarding
- `page-bg`, white content cards, teal accents, 14px radius.

---

## 7. Animations

### Restore (gentle)
- Card hover: `translateY(-2px)` + shadow deepens, 0.2s ease
- Destination card hover: `translateY(-4px)`, 0.2s ease
- Scroll reveal: `whileInView` opacity + y, 0.3s
- Button hover: color transition, 0.15s
- Quiz page transitions: AnimatePresence slide (keep existing)

### Do not restore
- Springs, stagger delays, parallax, scale transforms
- Floating particles, animated gradients
- `whileTap` scale on buttons

---

## 8. Files Affected

### Foundation (do first)
1. `apps/web/tailwind.config.ts` -- new color tokens
2. `apps/web/app/globals.css` -- teal glass nav, card-base, icon-gradient, hero utilities
3. `apps/web/app/layout.tsx` -- update body bg class

### Pages (in order)
4. `apps/web/app/page.tsx` -- homepage
5. `apps/web/components/Footer.tsx` -- dark teal gradient footer
6. `apps/web/app/quiz/page.tsx` -- quiz
7. `apps/web/components/quiz/StepWrapper.tsx` -- step container
8. `apps/web/app/results/page.tsx` -- results
9. `apps/web/app/trip/page.tsx` -- trip
10. `apps/web/app/dashboard/page.tsx` -- dashboard
11. `apps/web/app/explore/page.tsx` -- explore
12. `apps/web/app/about/page.tsx` -- about
13. `apps/web/app/auth/login/page.tsx` -- login
14. `apps/web/app/privacy/page.tsx` -- privacy
15. `apps/web/app/terms/page.tsx` -- terms
16. `apps/web/app/shared/[slug]/page.tsx` -- shared trip
17. `apps/web/app/onboarding/page.tsx` -- onboarding

### Components (alongside pages)
18. `apps/web/components/results/FlightCard.tsx`
19. `apps/web/components/results/HotelCard.tsx`
20. `apps/web/components/results/EventCard.tsx`
21. `apps/web/components/results/SuggestionCard.tsx`
22. `apps/web/components/results/ExperienceCard.tsx`
23. `apps/web/components/results/TripTracker.tsx`
24. `apps/web/components/AffiliateDisclosure.tsx`
25. `apps/web/components/quiz/Step1WhereWhen.tsx`
26. `apps/web/components/quiz/Step3Travelers.tsx`
27. `apps/web/components/quiz/Step4Budget.tsx`
28. `apps/web/components/quiz/Step4Flights.tsx`
29. `apps/web/components/quiz/Step5Accommodation.tsx`
30. `apps/web/components/quiz/Step6Activities.tsx`
31. `apps/web/components/quiz/Step7Review.tsx`
32. `apps/web/components/quiz/DestinationAutocomplete.tsx`
33. `apps/web/components/trip/RefinementChat.tsx`
34. `apps/web/components/trip/PackingList.tsx`
35. `apps/web/components/trip/TripMap.tsx`
36. `apps/web/components/onboarding/StepWhere.tsx`
37. `apps/web/components/onboarding/StepWhen.tsx`
38. `apps/web/components/onboarding/StepBudget.tsx`
39. `apps/web/components/onboarding/StepVibes.tsx`
40. `apps/web/components/onboarding/StepWho.tsx`
41. `apps/web/components/onboarding/StepStay.tsx`
