---
name: Walter
description: Trip planning that ends in a booking, in the voice of a filmmaker.
colors:
  cornflower-beacon: "oklch(0.65 0.135 263)"
  reykjavik-sky: "oklch(0.72 0.11 261)"
  first-light: "oklch(0.78 0.13 230)"
  paper: "oklch(0.975 0.004 250)"
  card: "oklch(0.99 0.002 250)"
  surface-2: "oklch(0.955 0.005 250)"
  surface-3: "oklch(0.925 0.008 252)"
  ink: "oklch(0.25 0.02 258)"
  ink-soft: "oklch(0.25 0.02 258 / 0.72)"
  ink-faint: "oklch(0.25 0.02 258 / 0.48)"
  line: "oklch(0.25 0.02 258 / 0.10)"
  tinted-pitch: "oklch(0.28 0.005 250)"
  snow-off-glacier: "oklch(0.985 0.006 250)"
typography:
  display:
    fontFamily: "var(--font-geist-sans), system-ui, sans-serif"
    fontSize: "clamp(2.25rem, 4.4vw, 3.25rem)"
    fontWeight: 600
    lineHeight: 1.02
    letterSpacing: "-0.3px"
  headline:
    fontFamily: "var(--font-geist-sans), system-ui, sans-serif"
    fontSize: "clamp(1.5rem, 2.4vw, 1.875rem)"
    fontWeight: 600
    lineHeight: 1.1
    letterSpacing: "-0.2px"
  title:
    fontFamily: "var(--font-geist-sans), system-ui, sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 500
    lineHeight: 1.35
    letterSpacing: "-0.2px"
  body:
    fontFamily: "var(--font-geist-sans), system-ui, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 400
    lineHeight: 1.55
    letterSpacing: "normal"
  label:
    fontFamily: "var(--font-geist-sans), system-ui, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 500
    lineHeight: 1.25
    letterSpacing: "normal"
rounded:
  sm: "8px"
  md: "14px"
  lg: "24px"
  pill: "980px"
components:
  button-primary:
    backgroundColor: "{colors.cornflower-beacon}"
    textColor: "{colors.snow-off-glacier}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "12px 20px"
  button-primary-hover:
    backgroundColor: "{colors.reykjavik-sky}"
    textColor: "{colors.snow-off-glacier}"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "6px 16px"
  button-ghost-hover:
    backgroundColor: "{colors.surface-3}"
    textColor: "{colors.ink}"
  nav-link:
    backgroundColor: "transparent"
    textColor: "{colors.ink-soft}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "6px 14px"
  nav-link-active:
    backgroundColor: "{colors.surface-3}"
    textColor: "{colors.ink}"
  card-trip:
    backgroundColor: "{colors.card}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.md}"
    padding: "12px"
  popover-shell:
    backgroundColor: "{colors.card}"
    textColor: "{colors.ink}"
    rounded: "{rounded.lg}"
    padding: "16px"
  search-pill:
    backgroundColor: "{colors.card}"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    padding: "6px"
  search-pill-section-active:
    backgroundColor: "{colors.surface-3}"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
  chip-tier-badge:
    backgroundColor: "{colors.tinted-pitch}"
    textColor: "{colors.reykjavik-sky}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "2px 8px"
---

# Design System: Walter

## 1. Overview

**Creative North Star: "The Field Cinematographer"**

Walter holds the frame the way a filmmaker holds it: still, considered, and trusting that the place will do the work. The system is a daylight field: paper-bright canvas, ink for words, and photography carrying every drop of color, because Walter is the moment in the Mitty film when the road opens under a wide Icelandic sky. Restraint is in service of warmth, not corporate neutrality. Photography always beats decoration. Every screen exists to drive toward one moment: a real flight, a real hotel, and a real Tuesday dinner sitting in the same cart, ready to book.

The system rejects the lane of Kayak / Expedia / Booking.com (transactional grey portals where every screen looks like a 1099), the lane of Pinterest-pretty travel listicles ("10 stunning beaches you have to see" screensaver bait), and the lane of generic AI startup landings (gradient hero, three-icon feature row, "powered by AI" bragging). Walter does not list, it commits. Walter does not announce that it is intelligent.

The visual character borrows from Patagonia (wild, sincere, indifferent to fashion) and Airbnb 2014 to 2017 (the "Belong Anywhere" era, before the corporate veneer). It is warm in open daylight.

**Key Characteristics:**
- Paper-bright, cool-tinted canvas; ink for words; cornflower as the only voice.
- Real photography, never illustration, on any surface that has room for an image. Dark chrome (Tinted Pitch) exists only on top of photographs.
- Tonal layering for depth; shadow only on the SearchBar and popovers as a structural cue, always soft slate-blue, never grey-black.
- System sans throughout (SF Pro on Apple devices); one family, sharp scale ratios.
- Confidence in motion: exponential ease, never bounce, never announce.

**The Field Cinematographer Rule.** If a screen would still make the user want to go after the copy was removed, it's working. If the copy is doing the lifting, the imagery is too weak or the layout is too busy.

**The Booking Spine Rule.** Every page must answer the question "what gets the user closer to a real booking?" If the answer is "more options," the page is wrong.

## 2. Colors

A daylight palette: near-white paper tinted cool, deep slate-blue ink, and a single saturated blue carrying the weight of every action. Photography supplies the color; the chrome stays out of the way.

### Primary

- **Cornflower Beacon** (`oklch(0.65 0.135 263)` / `#5B8DEF`): The one voice. Used on the Search button, active selection states (date range edges, focused nav), and the eyebrow accent on copy that earns it. Never used on surfaces, never used as page background, never used as a gradient fill. Frequency cap: under ten percent of any rendered screen.

### Secondary

- **Reykjavík Sky** (`oklch(0.72 0.11 261)` / `#7BA3F4`): Cornflower one step lighter for hover and link colors. Used for trip-price labels on cards, the tier-badge text, and the bolt icon in the navbar Quick Plan link. Reads as the same color, calmer.
- **First Light** (`oklch(0.78 0.13 230)` / `#38BDF8`): Reserved for the Walter logo gradient. Almost never used elsewhere. The shift from cornflower to sky cyan is the visual signature of the brand.

### Neutral

- **Paper** (`oklch(0.975 0.004 250)`): The canvas. Tinted toward 250° so it reads cool but never reads as `#fff`. The body background and the base under the hero's cornflower radials.
- **Card** (`oklch(0.99 0.002 250)`): Cards at rest. Popover shells. The SearchBar pill in its idle state. Half a step brighter than the canvas; the Line hairline does the separating. Legacy token alias: `quiet-slate`.
- **Surface 2** (`oklch(0.955 0.005 250)`): Drawer panels, toggle tracks, skeleton placeholders. Half a step below the canvas. Legacy token alias: `raised-slate`.
- **Surface 3** (`oklch(0.925 0.008 252)`): The active SearchBar section's lift, the active toggle's button. Reserved for "this thing is engaged right now" feedback. Legacy token alias: `hover-slate`.
- **Ink** (`oklch(0.25 0.02 258)`): Primary text. Never `#000`. A deep slate-blue so words sit inside the cool field instead of punching holes in it.
- **Ink Soft** (ink at 72% alpha): Secondary text, nav link defaults, support copy.
- **Ink Faint** (ink at 48% alpha): Tertiary text, metadata, placeholders, "12 upvotes" type labels.
- **Line** (ink at 10% alpha): Hairline borders on cards, dividers, and the nav's bottom edge.
- **Tinted Pitch** (`oklch(0.28 0.005 250)`): Demoted to photography duty only: the gradient overlay that keeps type legible on photos, the chrome behind over-photo tier badges, and the landing's floating dark-glass nav pill over the hero image. Never a page or card surface.
- **Snow Off Glacier** (`oklch(0.985 0.006 250)`): Text on photographs and on accent fills (the Search button's label). Never `#fff`. No longer the body text color.

### Named Rules

**The One Voice Rule.** Cornflower Beacon appears on at most ten percent of any rendered screen. Its scarcity is the point. If two cornflower elements compete in a viewport, one of them is wrong.

**The Anti-Gradient Rule.** Linear gradients are prohibited on body surfaces. The only allowed gradient is the off-center cornflower radial in the hero, and the logo's first-light wash inside its 7x7 chip. No gradient text. Ever.

**The No-Pure-Neutral Rule.** Never `#000`, never `#fff`. Every neutral carries a cool hue tint (250° to 258°, chroma 0.002 to 0.02). If a value is added to the system that uses raw black or white, it is a bug.

## 3. Typography

**Display Font:** System sans stack (SF Pro on Apple devices)
**Body Font:** System sans stack (single-family system)
**Label/Mono Font:** System sans stack, weight 500, tracking widened for uppercase eyebrows. No mono in the system.

**Character:** The platform's own type is the only voice - the same SF Pro the native app wears. It is native without being anonymous, quick to render, and its semibold weight at display sizes carries the cinematic confidence Walter wants. Single-family makes the brand discipline visible: there is no second voice because Walter has only one thing to say.

### Hierarchy

- **Display** (600, clamp 36–52px, line-height 1.02, tracking -0.3px): Hero headlines. One per page, top of fold. "Where to next?" is the canonical use.
- **Headline** (600, clamp 24–30px, line-height 1.10, tracking -0.2px): Section headers. "Steal a trip" is the canonical use. Never paired with an eyebrow above it; the headline stands alone.
- **Title** (500, 17px, line-height 1.35, tracking -0.2px): Hero subhead, card titles in dense layouts. Used to support a Display or Headline, never on its own.
- **Body** (400, 15px, line-height 1.55, max 65–75ch): Long-form copy on `/about`, support text, descriptions. Capped at 70ch for readability.
- **Label** (500, 13px, line-height 1.25): Navigation links, button text, chip labels, search-pill section headings (uppercased at 10px with 2.5px tracking when used as eyebrows on top of forms).

### Named Rules

**The Earned Superlative Rule.** Walter never uses "amazing," "stunning," "you have to see." Type carries no exclamation marks. If a phrase needs an adjective to land, the typography is too small or the photograph above it is too weak.

**The One-Headline Rule.** A page has one Display. No double heroes, no eyebrow-plus-headline stacks. If a section needs a second visual anchor, use Headline only.

**The 65ch Rule.** Any block of body copy that exceeds 75 characters per line is wrong. Cap with `max-w-[65ch]` or its closest Tailwind equivalent.

## 4. Elevation

Walter is tonal-layered, not shadowed. Depth is conveyed by stepping the surface lightness around Paper: Card sits half a step brighter (lifted), Surface 2 half a step deeper (recessed), Surface 3 deeper still (engaged). Shadows are reserved for two specific elements that genuinely float above the page: the SearchBar pill, and the popovers it opens. Everywhere else, the system is flat at rest. Hairline borders in Line (`rgba(20,30,60,0.08–0.16)`) carry the edge contrast that shadow would otherwise provide. Every shadow in the system is a soft slate-blue (`rgba(20,30,60,…)`), never grey-black.

### Shadow Vocabulary

- **search-shadow** (`box-shadow: 0 12px 40px rgba(20,30,60,0.10)`): The floating SearchBar pill. The only "lifted" element on the landing.
- **popover-shadow** (`box-shadow: 0 12px 40px rgba(20,30,60,0.12)`): When, Where, Who, What popovers. Slightly heavier than the pill itself because they overhang the page. Same value as the `.shadow-elevated` utility.
- **card-hover-shadow** (`box-shadow: 0 8px 24px rgba(20,30,60,0.10)`): On hover only. Combined with a -2px translateY. Cards carry no shadow at rest.
- **shadow-card token** (`0 1px 2px rgba(20,30,60,0.05), 0 8px 24px rgba(20,30,60,0.08)`): Ambient definition for the floating itinerary mock cards in the hero.

### Named Rules

**The Tonal-First Rule.** When in doubt about depth, step the surface tone, do not add shadow. If three layers are needed (canvas, card, panel-on-card), use Paper → Card → Surface 2. If a fourth is needed, the design is wrong.

**The Float-Earns-Shadow Rule.** Shadow is reserved for elements that genuinely overhang the page (the SearchBar pill, the popovers). It is never decorative. If a card looks "lifted," it is on hover or focus, never at rest.

## 5. Components

Component philosophy: "Quiet metal, warm to the hand." Surfaces are restrained at rest, with a small confident response on touch. Nothing announces itself. Everything responds.

### Buttons

- **Shape:** Pill (`rounded: 980px`) for primary, ghost, and nav-link pills. The 14px-rounded rectangle is reserved for cards and inputs, not action targets.
- **Primary:** Cornflower Beacon fill, Snow Off Glacier text, weight 600, padding `12px 20px` (typically with a leading icon at 20px). Used for the Search action and on `/auth/login` for the primary CTA. **No** primary button on the marketing landing except inside the SearchBar.
- **Hover (primary):** Background lightens to Reykjavík Sky. Transition 150ms `cubic-bezier(0.2, 0.8, 0.2, 1)`. No scale, no shadow change.
- **Ghost:** Transparent fill, ink-20% border, Ink text, padding `6px 16px`. On hover the border deepens to ink-40% and the fill steps to ink-5%.
- **No tertiary text-only buttons** except the inline Sign In link in the navbar.

### Chips

- **Style:** `Tinted Pitch` 85%-alpha background with a 1px white-10% hairline. Reykjavík Sky label. Pill-radius. Padding `2px 8px`. Sits on top of card photography; this is the one place dark chrome survives.
- **State:** No interactive states. Chips are read-only metadata (trip tier, badge).

### Cards / Containers

- **Corner Style:** `14px` radius across the system. Trip cards, popover-internal rows, dashboard tiles all use this.
- **Background:** Card (near-white) at rest. Image areas overlay the card's top portion edge-to-edge; the bottom is ink text on Card.
- **Shadow Strategy:** Flat at rest. `card-hover-shadow` on group hover, plus a -2px translateY and a border step from ink-8% to ink-16%.
- **Border:** `1px solid rgba(20,30,60,0.08)` at rest, `1px solid rgba(20,30,60,0.16)` on hover.
- **Internal Padding:** `12px` (3 in Tailwind) for compact trip cards. `20–24px` for cards on `/results` and `/trip` where density relaxes.

### Inputs / Fields

- **Style:** Transparent background, no visible border (the input lives inside the SearchBar pill or a popover that already has a frame). Ink text, Ink Faint placeholder.
- **Focus:** No border or background change inside the SearchBar (the pill section's `Surface 3` lift is the focus indicator). On `/auth/login` and `/checkout`, the form-style inputs gain a 1px Cornflower Beacon border on focus, no glow.

### Navigation

- **Style (app pages):** Sticky top, `nav-glass` background (near-white at 85% alpha, 20px backdrop blur, bottom hairline in Line). 56px tall.
- **Style (landing):** A floating pill over the hero photograph: Tinted Pitch at 75% alpha, heavy blur, white-15% border, Snow Off Glacier text. Dark glass is allowed here because it sits on photography, not on Paper.
- **Typography:** Label (500, 13px). Link padding `6px 14px`.
- **Default:** Ink Soft (Snow Off Glacier 75% inside the dark landing pill).
- **Hover:** Full-strength text, background steps one tone (ink-5% on light chrome, white-10% on the dark pill).
- **Active (current route):** Background one tone deeper than hover, full-strength text. Detected via `usePathname()`.
- **Mobile:** Below 768px (md), the links collapse into a hamburger; tapping reveals a drawer with the same NavLink components stacked. Drawer animates in with a 160ms cubic-bezier(0.2, 0.8, 0.2, 1) opacity + y-translation.

### Signature Component: The SearchBar

The SearchBar is the primary action surface of the landing and the visual signature of the system. It is a horizontal pill of Card carrying four pressable "sections" (Where, When, Who, What) and a Cornflower Beacon Search button at the end. Each section is a self-contained button with an uppercase label and a value or placeholder.

- **Idle state:** Pill is Card with a 1px Line ring and a soft `search-shadow`. All sections share the same surface, separated by 1px ink-10% hairlines.
- **Active section:** Lifts to Surface 3 with a soft `0 3px 10px rgba(20,30,60,0.10)` shadow. The dividers adjacent to the active section fade to 0% opacity so the active section reads as one continuous surface with its popover.
- **Popovers:** Anchored under each section at `top: calc(100% + 12px)`. Card background, Line hairline border, `popover-shadow`. The When popover is centered (780px wide); Where is left-aligned (430px); Who and What are right-aligned (380 and 430).
- **Entry/exit:** AnimatePresence with `opacity` and `translateY: -8px → 0` over 180ms. No scale, no bounce.

The SearchBar exists to do one thing: collect the four facts Walter needs to assemble a real trip. Every other element on the landing serves it.

## 6. Do's and Don'ts

### Do:
- **Do** use real photography on any surface that has room for an image. If the design has a placeholder card, the placeholder is a photograph of where the user is going, not an illustration.
- **Do** keep Cornflower Beacon under ten percent of any rendered screen. Its scarcity is the point.
- **Do** step surface tones (Paper → Card → Surface 2 → Surface 3) when more depth is needed. Tonal layering before shadow, always.
- **Do** use exponential ease (`cubic-bezier(0.2, 0.8, 0.2, 1)`) on every transition. 150ms for state, 180ms for popovers, 600ms for hero entrances.
- **Do** cap body line length at 65–75ch.
- **Do** name colors by what they evoke (Cornflower Beacon, Reykjavík Sky) in code comments and prose. Tailwind utility names follow the existing tokens (`accent`, `page-bg`); the descriptive names are the canonical reference.
- **Do** respect `prefers-reduced-motion`. Float, parallax, and image-scale-on-hover stop. Popover open/close keeps the opacity fade, drops the translateY.
- **Do** keep one Display per page. If a section needs a second hero, use Headline instead.

### Don't:
- **Don't** look like Kayak, Expedia, or Booking.com. If a screen reads as a 1099, it is failing.
- **Don't** look like a Pinterest-pretty travel listicle ("10 stunning beaches you have to see"). Walter does not list, it commits. No grids of decontextualized photos with captions like "Tropical Paradise."
- **Don't** look like a generic AI startup landing. No three-icon feature row. No "powered by AI" copy. No gradient text. No floating illustration. Walter does not announce that it is intelligent.
- **Don't** use `#fff` or `#000`. Ever. Use Paper, Card, and Ink; Snow Off Glacier only for text on photographs and accent fills.
- **Don't** use side-stripe borders (`border-left > 1px` as a colored accent). Use a full border or background tint.
- **Don't** use gradient text (`background-clip: text` on a gradient fill). The only allowed gradient in the system is the off-center cornflower hero radial.
- **Don't** use glassmorphism decoratively. The only allowed blurs are `nav-glass` on the sticky header and the landing's floating nav pill over the hero, both purposeful (they let photography show through the chrome).
- **Don't** use em dashes in copy. Use commas, colons, semicolons, periods, or parentheses. Not `--` either.
- **Don't** use bounce or elastic easing. Walter does not announce itself.
- **Don't** pair an eyebrow with a headline (eyebrow-above-h2 is banned). The headline stands alone.
- **Don't** add a shadow to a card at rest. Shadow appears only on hover or focus, or on elements that genuinely float (SearchBar, popovers).
- **Don't** invent secondary or tertiary accent colors. Cornflower Beacon is the only voice. Reykjavík Sky and First Light are shades of the same idea.
