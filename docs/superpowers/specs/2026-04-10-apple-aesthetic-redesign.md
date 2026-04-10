# Apple-Inspired Aesthetic Redesign

**Date:** 2026-04-10
**Scope:** Visual-only update to all web app pages. No functionality changes.
**Approach:** Foundation-first -- update design system (tailwind, CSS, fonts, layout), then cascade through each page.

---

## 1. Color System

Strip all teal gradients, glass morphism, animated gradients, noise textures, and MD3 semantic color layers. Replace with a stark black/white/gray canvas with teal as the singular interactive accent.

| Token | Value | Role |
|-------|-------|------|
| `black` | `#000000` | Dark section backgrounds, immersive hero |
| `white` | `#ffffff` | Text on dark, card backgrounds |
| `gray-light` | `#f5f5f7` | Light section backgrounds (replaces `bg-surface`) |
| `gray-dark` | `#1d1d1f` | Primary text on light backgrounds, dark button fills |
| `accent` | `#006571` | The ONE interactive color -- CTAs, links, focus rings |
| `accent-light` | `#007d8a` | Accent on dark backgrounds (higher luminance) |
| `on-dark-secondary` | `rgba(255,255,255,0.8)` | Secondary text on dark sections |
| `on-dark-tertiary` | `rgba(255,255,255,0.48)` | Tertiary text on dark sections |
| `on-light-secondary` | `rgba(0,0,0,0.8)` | Secondary text on light sections |
| `on-light-tertiary` | `rgba(0,0,0,0.48)` | Tertiary/disabled on light sections |
| `surface-dark-1` | `#272729` | Card backgrounds in dark sections |
| `surface-dark-2` | `#2a2a2d` | Elevated cards on dark backgrounds |

No other chromatic colors. Event category colors (purple, emerald, amber, rose) on result cards get replaced with neutral tags or subtle teal variants.

---

## 2. Typography

Replace Plus Jakarta Sans + Manrope with **Geist Sans** for everything. One font family, two optical roles.

| Role | Size | Weight | Line Height | Letter Spacing | Use |
|------|------|--------|-------------|----------------|-----|
| Display Hero | 56px (3.5rem) | 600 | 1.07 | -0.3px | Homepage hero headline |
| Section Heading | 40px (2.5rem) | 600 | 1.10 | -0.2px | Section titles |
| Page Heading | 28px (1.75rem) | 600 | 1.14 | normal | Page-level headings |
| Card Title | 21px (1.31rem) | 600 | 1.19 | 0.2px | Card headings, feature titles |
| Body | 17px (1.06rem) | 400 | 1.47 | -0.4px | Standard reading text |
| Body Emphasis | 17px (1.06rem) | 600 | 1.24 | -0.4px | Labels, emphasized body |
| Button | 17px (1.06rem) | 400 | 1.0 | normal | Button text |
| Link/Caption | 14px (0.88rem) | 400 | 1.43 | -0.2px | "Learn more" links, secondary text |
| Micro | 12px (0.75rem) | 400 | 1.33 | -0.1px | Fine print, tags, badges |

**Key rules:**
- Max weight is 600 (semibold). Kill all `font-extrabold` (800) and `font-black` (900).
- Negative letter-spacing at all sizes.
- Compressed headline line-heights (1.07-1.14).
- Kill `.text-gradient` -- solid colors only.

---

## 3. Components

### Navigation
- Background: `rgba(0,0,0,0.8)` + `backdrop-filter: saturate(180%) blur(20px)` (Apple dark glass)
- Height: 48px
- Brand "Scoutie": white, 17px, weight 600, no italic
- Links: white, 12px, weight 400
- CTA: small teal pill button, 14px
- Sticky, floats above all content

### Buttons
- **Primary CTA:** `#006571` background, white text, 8px radius, `8px 15px` padding. No gradients.
- **Secondary:** `#1d1d1f` background, white text, same shape.
- **Pill link ("Learn more"):** transparent background, teal text, 1px teal border, 980px radius. On dark backgrounds: `accent-light` color.
- Kill: `.btn-primary-gradient`, all gradient buttons.

### Cards
- Solid background: `#f5f5f7` on white sections, `#272729` on dark sections, or white on gray-light sections.
- 8px border-radius. No border. No shadow by default.
- Elevated cards (with images): single shadow `rgba(0,0,0,0.22) 3px 5px 30px 0px`.
- No hover state on cards. Links within cards are interactive, cards are static.
- Kill: `.card-3d`, hover lift, scale transforms, 2rem border radius.

### Section Rhythm
- Alternating backgrounds: `#000000` then `#f5f5f7` then back.
- Each section near full-viewport height with generous vertical padding (80-120px).
- Centered content within ~980px max-width container.

### Focus States
- `2px solid #006571` outline on all interactive elements.

### Shadows
- One shadow only: `rgba(0,0,0,0.22) 3px 5px 30px 0px` for elevated cards.
- Most elements have NO shadow.

---

## 4. Globals & CSS

### Kill
- `.glass-panel`, `.glass-header`, `.glass` -- all glass morphism
- `.card-3d` -- hover lift and shadow
- `.text-gradient` -- gradient text
- `.btn-primary-gradient` -- gradient button
- `.inner-card-3d` -- hover effects
- `.noise` -- texture overlay
- `.bg-gradient-animated` -- animated gradient
- `@keyframes gradient-shift` -- gradient animation
- `::selection` teal styling (replace with accent)
- Global `button:active` scale transform

### Add
- Apple dark nav glass: `rgba(0,0,0,0.8)` + `saturate(180%) blur(20px)`
- Single card shadow utility
- Typography utilities for the new scale (letter-spacing, line-heights)
- Focus ring: `2px solid #006571`

---

## 5. Page-by-Page Changes

### Homepage (`app/page.tsx`)
- **Hero:** Black background, white text, no blobs/particles. 56px/600 headline. One subtitle. Two CTAs: "Learn more" pill (teal outline) + "Get started" (teal filled, 8px radius).
- **Features strip:** Light gray background, clean grid, teal icons, no stagger animation.
- **How it works:** Black background, white text, three step cards on `surface-dark-1`.
- **Events showcase:** Light gray background, neutral cards, 8px radius.
- **Destinations:** Black background, image cards with subtle shadow, no hover lift/scale.
- **Final CTA:** Light gray section, centered text, single teal button. No animated gradient.
- **Kill:** Walter AI badge, value props strip, background blobs, noise texture.

### Quiz (`app/quiz/page.tsx`)
- Light gray background throughout.
- Kill glass header/footer -- use global dark nav.
- Step cards: white background, 8px radius.
- Inputs: clean borders, teal focus ring.
- Continue button: teal filled, 8px radius. Back: plain text link.
- Progress bar: thin line, teal fill on gray track.

### Results (`app/results/page.tsx`)
- Light gray background.
- Section headers: clean text, no colored icon badges. 28px/600 heading.
- Cards: white background, 8px radius, single shadow. Neutral tags instead of colored category badges.
- Replace horizontal scroll card rows with responsive grid (2-3 columns).

### Trip (`app/trip/page.tsx`)
- Light gray background.
- Hero overview: black section, white text, no gradient text on destination name.
- Item cards: white, 8px radius, type via micro text label not colored badges.
- Sidebar: white card, clean typography.
- Map widget: white card, 8px radius.

### Dashboard (`app/dashboard/page.tsx`)
- Light gray background.
- Kill colored action cards. Replace with white cards, teal text links.
- Trip cards: white, 8px radius, clean text hierarchy.
- Empty state: minimal icon, text, single teal button.

### Explore (`app/explore/page.tsx`)
- Light gray background.
- Filter tags: pill-shaped, teal active, gray outline inactive.
- Destination cards: image with subtle shadow, 8px radius, clean text overlay.

### About (`app/about/page.tsx`)
- Same system: alternating black/light gray sections, teal accent, Geist, 8px radius.
- Kill gradient CTAs, noise texture, colored badges.

### Login (`app/auth/login/page.tsx`)
- Light gray background, white centered card, 8px radius.
- Teal primary button, clean inputs.

### Footer
- Black background, white text, teal links. Clean, minimal.
- Kill glass-panel effect.

### Terms, Privacy
- Light gray background, clean typography, no decorative elements.

---

## 6. Animations (Framer Motion)

### Keep
- Subtle fade-in on scroll (`whileInView` with opacity + y)
- Page transitions (AnimatePresence in quiz)

### Kill
- Hover lifts (`whileHover={{ y: -4 }}`)
- Scale transforms on buttons (`whileTap={{ scale: 0.95 }}`)
- Parallax hero (`useScroll` / `useTransform`)
- Floating particles
- Staggered card entrances (delay * index)
- Spring-based progress bars (simplify to ease)

### Rules
- Max duration: 0.3s
- Only opacity + translateY transforms
- No springs, no bouncy easing

---

## 7. Files Affected

### Foundation (do first)
1. `apps/web/tailwind.config.ts` -- new color palette, font family, border-radius scale
2. `apps/web/app/globals.css` -- strip old utilities, add new ones
3. `apps/web/app/layout.tsx` -- swap to Geist font, update body classes
4. `apps/web/package.json` -- add `geist` font package

### Pages (do second, in order)
5. `apps/web/app/page.tsx` -- homepage
6. `apps/web/app/quiz/page.tsx` -- quiz
7. `apps/web/app/results/page.tsx` -- results
8. `apps/web/app/trip/page.tsx` -- trip
9. `apps/web/app/dashboard/page.tsx` -- dashboard
10. `apps/web/app/explore/page.tsx` -- explore
11. `apps/web/app/about/page.tsx` -- about
12. `apps/web/app/auth/login/page.tsx` -- login
13. `apps/web/app/privacy/page.tsx` -- privacy
14. `apps/web/app/terms/page.tsx` -- terms

### Components (do alongside pages as needed)
15. `apps/web/components/Footer.tsx`
16. `apps/web/components/FlightCard.tsx`
17. `apps/web/components/HotelCard.tsx`
18. `apps/web/components/EventCard.tsx`
19. `apps/web/components/TripTracker.tsx`
20. Any other shared components referenced by pages
