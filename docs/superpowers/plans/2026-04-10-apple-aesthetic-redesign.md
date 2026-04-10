# Apple-Inspired Aesthetic Redesign — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Visually transform all Scoutie web pages from the current teal MD3/glass-morphism design to an Apple-inspired aesthetic with black/white/gray canvas, single teal accent, Geist typography, and cinematic section rhythm.

**Architecture:** Foundation-first approach. Update the design system layer (Tailwind config, globals.css, layout, fonts) so pages inherit most changes automatically, then update each page and component to complete the transformation.

**Tech Stack:** Next.js 16, Tailwind CSS 3.4, Geist font (via `geist` npm package), Framer Motion 12

---

## File Map

### Foundation (modify)
- `apps/web/package.json` — add `geist` dependency
- `apps/web/tailwind.config.ts` — new color palette, font family, border-radius
- `apps/web/app/globals.css` — strip old utilities, add new ones
- `apps/web/app/layout.tsx` — swap fonts to Geist, update body classes

### Pages (modify)
- `apps/web/app/page.tsx` — homepage
- `apps/web/app/quiz/page.tsx` — quiz
- `apps/web/components/quiz/StepWrapper.tsx` — quiz step container
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
- `apps/web/components/results/FlightCard.tsx`
- `apps/web/components/results/HotelCard.tsx`
- `apps/web/components/results/EventCard.tsx`
- `apps/web/components/results/SuggestionCard.tsx`
- `apps/web/components/results/ExperienceCard.tsx`
- `apps/web/components/results/TripTracker.tsx`
- `apps/web/components/AffiliateDisclosure.tsx`

---

### Task 1: Install Geist Font

**Files:**
- Modify: `apps/web/package.json`

- [ ] **Step 1: Install the geist package**

```bash
cd /Users/treyvititoe/projects/scoutie/apps/web && npm install geist
```

- [ ] **Step 2: Verify installation**

```bash
cd /Users/treyvititoe/projects/scoutie/apps/web && npm ls geist
```

Expected: `geist@x.x.x` listed

- [ ] **Step 3: Commit**

```bash
cd /Users/treyvititoe/projects/scoutie && git add apps/web/package.json apps/web/package-lock.json && git commit -m "chore: install geist font package"
```

---

### Task 2: Rewrite Tailwind Config

**Files:**
- Modify: `apps/web/tailwind.config.ts`

- [ ] **Step 1: Replace the entire tailwind config**

Replace the full contents of `apps/web/tailwind.config.ts` with:

```typescript
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "gray-light": "#f5f5f7",
        "gray-dark": "#1d1d1f",
        accent: {
          DEFAULT: "#006571",
          light: "#007d8a",
        },
        "on-dark-secondary": "rgba(255,255,255,0.8)",
        "on-dark-tertiary": "rgba(255,255,255,0.48)",
        "on-light-secondary": "rgba(0,0,0,0.8)",
        "on-light-tertiary": "rgba(0,0,0,0.48)",
        "surface-dark": {
          1: "#272729",
          2: "#2a2a2d",
        },
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        DEFAULT: "8px",
        pill: "980px",
      },
      boxShadow: {
        card: "3px 5px 30px 0px rgba(0, 0, 0, 0.22)",
      },
      letterSpacing: {
        "display": "-0.3px",
        "section": "-0.2px",
        "body": "-0.4px",
        "caption": "-0.2px",
        "micro": "-0.1px",
      },
      lineHeight: {
        "display": "1.07",
        "section": "1.10",
        "page": "1.14",
        "card-title": "1.19",
      },
      maxWidth: {
        "content": "980px",
      },
    },
  },
  plugins: [],
};

export default config;
```

- [ ] **Step 2: Verify config is valid**

```bash
cd /Users/treyvititoe/projects/scoutie/apps/web && npx tailwindcss --help > /dev/null 2>&1 && echo "OK"
```

- [ ] **Step 3: Commit**

```bash
cd /Users/treyvititoe/projects/scoutie && git add apps/web/tailwind.config.ts && git commit -m "style: rewrite tailwind config for Apple aesthetic

Replace MD3 teal color system with black/white/gray + teal accent.
Add Geist font family, Apple-style spacing tokens, card shadow."
```

---

### Task 3: Rewrite globals.css

**Files:**
- Modify: `apps/web/app/globals.css`

- [ ] **Step 1: Replace the entire globals.css**

Replace the full contents of `apps/web/app/globals.css` with:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  * {
    box-sizing: border-box;
    padding: 0;
    margin: 0;
  }

  html,
  body {
    max-width: 100vw;
    overflow-x: hidden;
  }

  ::selection {
    background-color: #006571;
    color: white;
  }
}

/* Material Symbols */
.material-symbols-outlined {
  font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
  display: inline-block;
  line-height: 1;
}

/* Apple dark glass navigation */
.nav-glass {
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: saturate(180%) blur(20px);
  -webkit-backdrop-filter: saturate(180%) blur(20px);
}

/* Elevated card shadow */
.shadow-elevated {
  box-shadow: 3px 5px 30px 0px rgba(0, 0, 0, 0.22);
}

/* Focus rings */
*:focus-visible {
  outline: 2px solid #006571;
  outline-offset: 2px;
}

/* Hide scrollbar for card rows */
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
```

- [ ] **Step 2: Commit**

```bash
cd /Users/treyvititoe/projects/scoutie && git add apps/web/app/globals.css && git commit -m "style: rewrite globals.css for Apple aesthetic

Strip glass morphism, card-3d, text-gradient, animated gradients,
noise texture. Add dark glass nav, elevated shadow, clean focus rings."
```

---

### Task 4: Update Layout and Fonts

**Files:**
- Modify: `apps/web/app/layout.tsx`

- [ ] **Step 1: Replace the entire layout.tsx**

Replace the full contents of `apps/web/app/layout.tsx` with:

```tsx
import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import Footer from "../components/Footer";
import "./globals.css";

export const metadata: Metadata = {
  title: "Scoutie -- One Quiz. Your Whole Trip.",
  description:
    "AI-powered trip planning. Take a quick quiz, get complete bookable itineraries with flights, hotels, activities, and more.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={GeistSans.variable}>
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0"
        />
      </head>
      <body className="font-sans bg-gray-light text-gray-dark antialiased">
        {children}
        <Footer />
      </body>
    </html>
  );
}
```

- [ ] **Step 2: Verify the dev server starts**

```bash
cd /Users/treyvititoe/projects/scoutie && npm run build --workspace=apps/web 2>&1 | tail -5
```

Expected: Build succeeds (may have warnings from pages not yet updated, but no fatal errors)

- [ ] **Step 3: Commit**

```bash
cd /Users/treyvititoe/projects/scoutie && git add apps/web/app/layout.tsx && git commit -m "style: swap to Geist Sans font, update body classes

Replace Plus Jakarta Sans + Manrope with Geist Sans.
Update body background to gray-light, text to gray-dark."
```

---

### Task 5: Update Footer

**Files:**
- Modify: `apps/web/components/Footer.tsx`
- Modify: `apps/web/components/AffiliateDisclosure.tsx`

- [ ] **Step 1: Replace Footer.tsx**

Replace the full contents of `apps/web/components/Footer.tsx` with:

```tsx
import Link from "next/link";
import AffiliateDisclosure from "./AffiliateDisclosure";

export default function Footer() {
  return (
    <footer className="bg-black">
      <div className="max-w-content mx-auto px-6 py-12">
        <div className="flex flex-col sm:flex-row items-start justify-between gap-8">
          <div>
            <Link
              href="/"
              className="text-[17px] font-semibold text-white"
            >
              Scoutie
            </Link>
            <p className="text-sm text-on-dark-tertiary mt-2 max-w-xs tracking-caption leading-[1.43]">
              AI-powered trip planning. One quiz, your whole trip planned and
              bookable.
            </p>
          </div>
          <div className="flex gap-8">
            <div className="flex flex-col gap-2">
              <span className="text-[12px] font-semibold text-on-dark-tertiary uppercase tracking-wider">
                Product
              </span>
              <Link
                href="/quiz"
                className="text-sm text-on-dark-secondary hover:text-accent-light transition-colors tracking-caption"
              >
                Plan a trip
              </Link>
              <Link
                href="/explore"
                className="text-sm text-on-dark-secondary hover:text-accent-light transition-colors tracking-caption"
              >
                Explore
              </Link>
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-[12px] font-semibold text-on-dark-tertiary uppercase tracking-wider">
                Company
              </span>
              <Link
                href="/about"
                className="text-sm text-on-dark-secondary hover:text-accent-light transition-colors tracking-caption"
              >
                About
              </Link>
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-[12px] font-semibold text-on-dark-tertiary uppercase tracking-wider">
                Legal
              </span>
              <Link
                href="/privacy"
                className="text-sm text-on-dark-secondary hover:text-accent-light transition-colors tracking-caption"
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms"
                className="text-sm text-on-dark-secondary hover:text-accent-light transition-colors tracking-caption"
              >
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
        <div className="border-t border-white/10 mt-8 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <AffiliateDisclosure />
          <p className="text-[12px] text-on-dark-tertiary tracking-micro">
            &copy; {new Date().getFullYear()} Scoutie Travel, Inc. All rights
            reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
```

- [ ] **Step 2: Update AffiliateDisclosure.tsx colors**

In `apps/web/components/AffiliateDisclosure.tsx`, update all text color classes to use `text-on-dark-tertiary` and `text-[12px] tracking-micro` since it now sits on a black footer.

- [ ] **Step 3: Commit**

```bash
cd /Users/treyvititoe/projects/scoutie && git add apps/web/components/Footer.tsx apps/web/components/AffiliateDisclosure.tsx && git commit -m "style: update Footer to Apple aesthetic

Black background, white brand text, teal links, clean typography.
Kill glass-panel effect."
```

---

### Task 6: Update Homepage

**Files:**
- Modify: `apps/web/app/page.tsx`

- [ ] **Step 1: Rewrite the homepage**

Replace the full contents of `apps/web/app/page.tsx`. Key changes:

1. **Nav:** Replace `glass-header` with `nav-glass`. Brand "Scoutie" white 17px semibold (no italic, no black). Links white 12px. CTA: teal filled pill, 14px. Height 48px.

2. **Hero:** Black background. Kill all background blobs, particles, parallax (`useScroll`, `useTransform`, `heroRef`). Remove `heroY`, `heroOpacity` transforms. Simple `motion.div` with fade-in only (duration 0.3s, ease). Headline: white, `text-[56px] font-semibold leading-display tracking-display`. Kill "Walter AI" badge. Kill `.text-gradient` span -- just white text. Subtitle: `text-on-dark-secondary text-[21px] leading-[1.19]`. Two CTAs: "Learn more" pill (`border border-accent-light text-accent-light rounded-pill px-5 py-2 text-sm`) + "Get started" filled (`bg-accent text-white rounded-[8px] px-4 py-2 text-[17px]`). Kill value props strip.

3. **Features strip:** `bg-gray-light` background. Kill border-y. Kill stagger animation (no `delay: i * 0.06`). Single `motion.div` fade-in. Icons: `text-accent`. Text: `text-gray-dark` title, `text-on-light-secondary` description. Kill `font-headline font-extrabold` -- use `font-semibold`.

4. **How it works:** `bg-black` background. White heading (`text-[40px] font-semibold leading-section tracking-section`). Kill "HOW IT WORKS" uppercase label. Kill `.text-gradient`. Cards: `bg-surface-dark-1 rounded-[8px] p-8`. Kill `.card-3d`. Icon container: `bg-accent/20`. Title: white semibold. Description: `text-on-dark-secondary`. Kill ghost number (absolute `0{i+1}`). Kill stagger delays.

5. **Events showcase:** `bg-gray-light`. Kill border-y. Cards: `bg-white rounded-[8px] p-7`. Kill `.card-3d`. Kill colored icon circles (purple, emerald, amber, rose) -- use `bg-gray-light text-accent` for all. Kill uppercase label. Heading: `text-gray-dark text-[40px] font-semibold`. Kill `.text-gradient`. Kill stagger.

6. **Destinations:** `bg-black`. Image cards: `rounded-[8px] shadow-elevated`. Kill `.card-3d`. Kill `whileHover={{ y: -8 }}`. Kill hover scale on images (`group-hover:scale-110`). Keep gradient overlay for text readability. Tag badge: `bg-white/15 backdrop-blur-md`. Title: white semibold (not extrabold). Price: `text-on-dark-tertiary text-sm` (kill font-mono). Kill hover arrow icon.

7. **CTA section:** `bg-gray-light` (not animated gradient). Kill `.noise`, `.bg-gradient-animated`. Kill "Powered by AI" badge. Heading: `text-gray-dark text-[40px] font-semibold`. Description: `text-on-light-secondary`. Button: `bg-accent text-white rounded-[8px] px-6 py-3 text-[17px]`. Kill `whileHover`/`whileTap` scale. Kill shadow-2xl.

8. **All animations:** Max duration 0.3s. Only `opacity` + `y` transforms. No `whileHover`, `whileTap`, springs, stagger. Remove `useScroll`, `useTransform`, `useRef` imports.

- [ ] **Step 2: Verify homepage renders**

```bash
cd /Users/treyvititoe/projects/scoutie && npm run build --workspace=apps/web 2>&1 | tail -5
```

- [ ] **Step 3: Commit**

```bash
cd /Users/treyvititoe/projects/scoutie && git add apps/web/app/page.tsx && git commit -m "style: redesign homepage with Apple aesthetic

Black/gray alternating sections, dark glass nav, single teal accent.
Kill gradients, glass morphism, parallax, particles, stagger animations."
```

---

### Task 7: Update Quiz Page and StepWrapper

**Files:**
- Modify: `apps/web/app/quiz/page.tsx`
- Modify: `apps/web/components/quiz/StepWrapper.tsx`

- [ ] **Step 1: Update StepWrapper.tsx**

Replace `apps/web/components/quiz/StepWrapper.tsx`:

```tsx
"use client";

import { motion } from "framer-motion";

export default function StepWrapper({
  children,
  title,
  subtitle,
}: {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
      className="w-full max-w-2xl mx-auto"
    >
      <div className="bg-white rounded-[8px] p-8">
        <h2 className="font-semibold text-[28px] text-gray-dark leading-page mb-2">
          {title}
        </h2>
        {subtitle && (
          <p className="text-on-light-secondary text-sm leading-[1.43] tracking-caption mb-8">
            {subtitle}
          </p>
        )}
        <div className="mt-6">{children}</div>
      </div>
    </motion.div>
  );
}
```

- [ ] **Step 2: Update quiz/page.tsx**

Key changes to `apps/web/app/quiz/page.tsx`:

1. **Background:** `bg-gray-light` (kill `bg-background`)
2. **Header:** Replace glass header with the dark `nav-glass` nav. Brand "Scoutie" white 17px semibold. Kill italic, font-black.
3. **Progress bars:** Thin line style. Track: `bg-on-light-tertiary/20 h-0.5 rounded-full`. Fill: `bg-accent`. Kill spring animation -- use `transition={{ duration: 0.3, ease: "easeOut" }}`.
4. **Footer nav buttons:** Back button: plain text `text-on-light-secondary text-sm hover:text-gray-dark`. Kill rounded-full, font-bold. Continue button: `bg-accent text-white rounded-[8px] px-8 py-3 text-[17px]`. Kill `btn-primary-gradient`, rounded-full, shadow-2xl. Kill `whileHover`/`whileTap` scale.
5. **Exit button:** `text-sm text-on-light-secondary hover:text-gray-dark`.
6. **Kill:** Glass footer, `shadow-xl shadow-teal-900/5`, all `font-headline`, `font-extrabold`, `font-black`.

- [ ] **Step 3: Commit**

```bash
cd /Users/treyvititoe/projects/scoutie && git add apps/web/app/quiz/page.tsx apps/web/components/quiz/StepWrapper.tsx && git commit -m "style: update quiz page and step wrapper for Apple aesthetic

White step cards with 8px radius, dark nav, clean progress bar,
teal filled buttons. Kill glass morphism and gradient buttons."
```

---

### Task 8: Update Result Cards (Flight, Hotel, Event, Suggestion, Experience)

**Files:**
- Modify: `apps/web/components/results/FlightCard.tsx`
- Modify: `apps/web/components/results/HotelCard.tsx`
- Modify: `apps/web/components/results/EventCard.tsx`
- Modify: `apps/web/components/results/SuggestionCard.tsx`
- Modify: `apps/web/components/results/ExperienceCard.tsx`

- [ ] **Step 1: Update FlightCard.tsx**

Key changes:
1. Kill `motion.div` wrapper with `whileHover`. Use plain `div`.
2. Card classes: `w-full bg-white rounded-[8px] p-6` (kill min-w, flex-shrink-0 since we're switching to grid; kill `card-3d rounded-[2rem]`).
3. Tags: Kill colored backgrounds (emerald, teal, sky). All tags: `text-[12px] font-semibold text-on-light-tertiary tracking-micro`.
4. Airline logo bg: `bg-gray-light` (kill `bg-teal-50`).
5. Airline icon fallback: `text-accent` (kill `text-teal-600`).
6. Route text: `font-semibold` (kill `font-bold` and `font-headline`).
7. Price: `font-semibold text-accent text-[21px]` (kill `font-black`, `font-headline`).
8. Price animation: Kill spring motion. Static text.
9. Button: Kill `whileHover`/`whileTap`. Use plain `button`. Added state: `bg-accent text-white rounded-[8px] px-4 py-2 text-sm font-semibold`. Not-added: `border border-accent text-accent rounded-[8px] px-4 py-2 text-sm`. Kill rounded-full.

- [ ] **Step 2: Update HotelCard.tsx**

Key changes:
1. Kill `motion.div` wrapper with `whileHover`. Use plain `div`.
2. Card: `w-full bg-white rounded-[8px] overflow-hidden` (kill `card-3d rounded-[2rem]`).
3. Tags: All neutral -- `text-[12px] font-semibold text-on-light-tertiary tracking-micro` on white/light bg. Kill colored backgrounds (emerald, teal, amber).
4. Fallback gradient: `bg-gray-light` (kill `from-blue-50 to-purple-100`). Icon: `text-on-light-tertiary` (kill `text-purple-300/60`).
5. Star icon: `text-accent` (kill `text-amber-500`).
6. Price: `font-semibold text-accent text-[21px]` (kill `font-black`). Kill price spring animation.
7. Button: Same as FlightCard. `rounded-[8px]`, kill rounded-full, kill motion.

- [ ] **Step 3: Update EventCard.tsx**

Key changes:
1. Kill `motion.div` wrapper. Plain `div`.
2. Card: `w-full bg-white rounded-[8px] overflow-hidden`.
3. Kill colored category badges. Category: `text-[12px] font-semibold text-gray-dark bg-white/90 backdrop-blur-sm rounded-pill px-2.5 py-1`.
4. Kill "Free" / "Under $30" colored tags. Use neutral: `text-[12px] text-on-light-tertiary`.
5. Match reason badge: `bg-gray-light text-gray-dark` (kill secondary-container colors).
6. Fallback image bg: `bg-gray-light` (kill primary gradient).
7. Price: `font-semibold text-accent text-[21px]`. Kill `font-black`.
8. Button: Same as FlightCard.

- [ ] **Step 4: Update SuggestionCard.tsx**

Key changes:
1. Kill `motion.div` wrapper. Plain `div`.
2. Card: `bg-white rounded-[8px] p-5`.
3. Type icon: All use `bg-gray-light text-accent` (kill per-type teal/amber/purple colors).
4. Type badge: `text-[12px] text-on-light-tertiary` neutral.
5. "Best time" badge: `bg-gray-light text-gray-dark` (kill colored variants).
6. Title: `font-semibold text-gray-dark` (kill `font-bold font-headline`).
7. Cost estimate: `font-semibold text-accent` (kill `font-black`).
8. Button: Same pattern as other cards.

- [ ] **Step 5: Update ExperienceCard.tsx**

Key changes:
1. Card: `bg-white rounded-[8px] overflow-hidden` (kill `border border-gray-100 rounded-2xl hover:shadow-lg hover:border-sky-200`).
2. Category badge: neutral styling.
3. Rating: `text-accent` (kill `text-amber-500`).
4. Price: `font-semibold text-gray-dark text-[21px]` (kill `text-2xl font-bold`).
5. "Book" link: `text-accent font-semibold` (kill `text-sky-500`).

- [ ] **Step 6: Commit**

```bash
cd /Users/treyvititoe/projects/scoutie && git add apps/web/components/results/ && git commit -m "style: update all result cards for Apple aesthetic

White cards with 8px radius, neutral tags, static (no hover lift),
teal accent for prices and buttons. Kill colored badges and animations."
```

---

### Task 9: Update Results Page

**Files:**
- Modify: `apps/web/app/results/page.tsx`

- [ ] **Step 1: Update results/page.tsx**

Key changes:
1. **Background:** `bg-gray-light` (kill `bg-background`).
2. **Header:** Dark `nav-glass` nav. Brand "Scoutie" white 17px semibold. Kill `bg-white/70 backdrop-blur-xl shadow-xl shadow-teal-900/5`.
3. **Page title:** Kill badge (`bg-secondary-container`). Heading: `text-[28px] font-semibold text-gray-dark leading-page`. Kill `.text-gradient` on destination name -- plain `text-accent`. Subtitle: `text-on-light-secondary text-[17px]`.
4. **Section headers:** Kill colored icon badges (`bg-teal-50/purple-50/amber-50`). Icon: `text-accent text-[21px]`. Title: `text-[21px] font-semibold text-gray-dark`. Kill uppercase tracking subtitle.
5. **Card layout:** Replace horizontal scroll (`flex gap-5 overflow-x-auto`) with responsive grid: `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6`. Kill `min-w-[300px] w-[300px] flex-shrink-0` from cards (already done in Task 8).
6. **Skeleton loaders:** Update to `bg-white rounded-[8px]` with `bg-gray-light` pulse bars.
7. **Loading spinner:** `border-accent border-t-transparent`.
8. **Edit trip link:** `text-accent text-sm hover:underline` (kill `font-bold text-primary`).
9. **Kill:** All `font-headline`, `font-extrabold`, `font-black`, `card-3d`, stagger delays.

- [ ] **Step 2: Commit**

```bash
cd /Users/treyvititoe/projects/scoutie && git add apps/web/app/results/page.tsx && git commit -m "style: update results page for Apple aesthetic

Responsive grid layout, dark nav, clean section headers,
teal accents. Kill horizontal scroll, colored badges, glass header."
```

---

### Task 10: Update TripTracker Component

**Files:**
- Modify: `apps/web/components/results/TripTracker.tsx`

- [ ] **Step 1: Update TripTracker.tsx**

Key changes:
1. **Desktop sidebar card:** `bg-white rounded-[8px] p-6` (kill `card-3d rounded-[2rem] shadow-2xl`).
2. **Header:** `text-[21px] font-semibold text-gray-dark` (kill `font-headline font-extrabold`).
3. **Item count badge:** `bg-accent text-white text-[12px] font-semibold rounded-pill px-2 h-5`.
4. **View Trip button:** `bg-accent text-white rounded-[8px] px-4 py-2 text-sm font-semibold` (kill `btn-primary-gradient rounded-full`).
5. **Share button:** `border border-gray-dark text-gray-dark rounded-[8px] px-4 py-2 text-sm` (kill rounded-full).
6. **Mobile bar:** `bg-white border-t border-black/5` (kill `bg-white/90 backdrop-blur-xl`).
7. **Mobile slide-up sheet:** `bg-white rounded-t-[8px]` (kill `rounded-t-[2rem]`). Handle: `bg-on-light-tertiary`.
8. **Item cards within tracker:** `bg-gray-light rounded-[8px] p-3` (kill colored type badges).
9. **Prices:** `font-semibold text-accent` (kill `font-mono`).
10. **Kill:** All `whileHover`, `whileTap`, spring transitions on buttons.

- [ ] **Step 2: Commit**

```bash
cd /Users/treyvititoe/projects/scoutie && git add apps/web/components/results/TripTracker.tsx && git commit -m "style: update TripTracker for Apple aesthetic

White card with 8px radius, teal accent, clean mobile sheet.
Kill glass blur, gradient buttons, card-3d, spring animations."
```

---

### Task 11: Update Trip Page

**Files:**
- Modify: `apps/web/app/trip/page.tsx`

- [ ] **Step 1: Update trip/page.tsx**

Key changes:
1. **Background:** `bg-gray-light`.
2. **Header:** Dark `nav-glass` nav. Kill `bg-white/70 backdrop-blur-xl shadow-xl shadow-teal-900/5`.
3. **Hero overview:** `bg-black` section. All text white. Destination: plain white (kill `.text-gradient`). Label: `text-on-dark-tertiary text-[12px] tracking-wider uppercase`. Title: `text-[40px] font-semibold text-white leading-section`. Info dividers: `bg-white/10`. Icons: `text-accent-light`. Price: `font-semibold text-[28px] text-white` (kill `font-mono`).
4. **Item cards:** `bg-white rounded-[8px] p-5` (kill `card-3d !rounded-2xl`). Type indicator: `text-[12px] text-on-light-tertiary font-semibold tracking-micro uppercase` (kill colored badges). Title: `font-semibold text-[17px] text-gray-dark`. Price: `font-semibold text-accent text-[17px]` (kill `font-mono`). CTA button: `bg-accent text-white rounded-[8px] px-4 py-1.5 text-[12px] font-semibold` (kill `btn-primary-gradient rounded-full`).
5. **Map widget:** `bg-white rounded-[8px] p-6`.
6. **Cost breakdown:** `bg-white rounded-[8px] p-6`. Total: `font-semibold text-accent text-[21px]` (kill `font-mono`). Border: `border-black/5`.
7. **Packing list:** `bg-white rounded-[8px] p-6`.
8. **Empty state:** Icon: `text-on-light-tertiary`. Heading: `font-semibold text-[28px]`. CTA: `bg-accent text-white rounded-[8px]` (kill gradient, rounded-full).
9. **Kill:** All `font-headline`, `font-extrabold`, `font-black`, `card-3d`, `btn-primary-gradient`.

- [ ] **Step 2: Commit**

```bash
cd /Users/treyvititoe/projects/scoutie && git add apps/web/app/trip/page.tsx && git commit -m "style: update trip page for Apple aesthetic

Black hero overview, white item cards with 8px radius, clean typography.
Kill gradients, colored badges, font-mono, glass header."
```

---

### Task 12: Update Dashboard Page

**Files:**
- Modify: `apps/web/app/dashboard/page.tsx`

- [ ] **Step 1: Update dashboard/page.tsx**

Key changes:
1. **Background:** `bg-gray-light`.
2. **Header:** Dark `nav-glass` nav.
3. **Heading:** `font-semibold text-[28px] text-gray-dark leading-page` (kill `font-headline font-extrabold text-4xl`).
4. **Quick action cards:** Both use `bg-white rounded-[8px] p-6` (kill colored backgrounds -- `bg-primary`, `bg-secondary-container`). Icon container: `bg-gray-light rounded-[8px]` with `text-accent` icon. Title: `font-semibold text-[17px] text-gray-dark`. Description: `text-on-light-secondary text-sm`.
5. **Saved trips section:** Kill colored icon badge. Icon: `text-accent`. Title: `text-[21px] font-semibold`. Kill uppercase tracking subtitle.
6. **Trip cards:** `bg-white rounded-[8px] p-5` (kill `card-3d rounded-[2rem]`). Kill stagger animation. Simple fade-in. Title: `font-semibold text-gray-dark`. Subtitle: `text-sm text-on-light-secondary`. Date: `text-[12px] text-on-light-tertiary`.
7. **Empty state:** `bg-white rounded-[8px] p-10`. Icon: `text-on-light-tertiary`. CTA: `bg-accent text-white rounded-[8px] px-6 py-3 font-semibold`.
8. **Kill:** All `font-headline`, `font-extrabold`, `font-bold`, `card-3d`, stagger, colored cards.

- [ ] **Step 2: Commit**

```bash
cd /Users/treyvititoe/projects/scoutie && git add apps/web/app/dashboard/page.tsx && git commit -m "style: update dashboard for Apple aesthetic

White cards, clean typography, teal accent. Kill colored action cards,
glass header, card-3d, stagger animations."
```

---

### Task 13: Update Explore Page

**Files:**
- Modify: `apps/web/app/explore/page.tsx`

- [ ] **Step 1: Update explore/page.tsx**

Key changes:
1. **Background:** `bg-gray-light`.
2. **Header:** Dark `nav-glass` nav (kill `bg-surface border-b border-border`).
3. **Heading:** `font-semibold text-[28px] text-gray-dark leading-page` (kill `font-display font-bold text-3xl sm:text-4xl`).
4. **Filter tags:** Active: `bg-accent text-white rounded-pill px-4 py-2 text-sm`. Inactive: `bg-white border border-black/10 text-on-light-secondary rounded-pill px-4 py-2 text-sm hover:border-accent/30`.
5. **Destination cards:** `bg-white rounded-[8px] overflow-hidden shadow-elevated` (kill `border border-border rounded-2xl hover:shadow-lg hover:border-primary-light`). Image: kill `group-hover:scale-105`. Tag: `text-[12px] font-semibold text-on-light-tertiary bg-gray-light rounded-pill px-2 py-0.5`. Title: `font-semibold text-gray-dark`. Description: `text-on-light-secondary text-sm`.
6. **CTA section:** `bg-black` section. Heading white. Button: `bg-accent text-white rounded-[8px]`. Kill `bg-gradient-animated`.
7. **Kill:** All `font-display`, `text-gradient`, stagger delays, hover scale.

- [ ] **Step 2: Commit**

```bash
cd /Users/treyvititoe/projects/scoutie && git add apps/web/app/explore/page.tsx && git commit -m "style: update explore page for Apple aesthetic

Dark nav, pill filters, white cards with shadow, clean typography.
Kill colored borders, hover scale, gradient backgrounds."
```

---

### Task 14: Update About Page

**Files:**
- Modify: `apps/web/app/about/page.tsx`

- [ ] **Step 1: Update about/page.tsx**

Key changes:
1. **Nav:** Dark `nav-glass` nav. Kill `border-b border-border bg-surface`. Brand: white 17px semibold. CTA: `bg-accent text-white rounded-[8px] px-5 py-2 text-sm` (kill `bg-gradient-animated rounded-xl`).
2. **Hero section:** `bg-black`. Kill background blobs. Badge: `bg-surface-dark-1 text-on-dark-secondary rounded-pill px-4 py-1.5 border border-white/10`. Heading: `text-white text-[56px] font-semibold leading-display tracking-display`. Kill `.text-gradient`. Description: `text-on-dark-secondary`.
3. **Mission section:** `bg-gray-light` (kill `border-y border-border`). Label: `text-accent text-sm font-semibold uppercase tracking-wider`. Title: `text-[40px] font-semibold text-gray-dark leading-section`. Body: `text-on-light-secondary`.
4. **How it works:** `bg-black`. Kill `.noise`. Cards: `bg-surface-dark-1 rounded-[8px] p-8` (kill `border border-border hover:shadow-xl`). Number badge: `bg-accent rounded-[8px]` (kill `bg-gradient-animated`). Kill ghost numbers. Title: `text-white font-semibold`. Description: `text-on-dark-secondary`.
5. **Values section:** `bg-gray-light`. Cards: `bg-white rounded-[8px] p-8` (kill `border border-border`). Bullet: `bg-accent`. Title: `font-semibold text-gray-dark`. Body: `text-on-light-secondary`.
6. **CTA section:** `bg-black` (kill `bg-gradient-animated noise`). Heading: `text-white text-[40px] font-semibold`. Button: `bg-accent text-white rounded-[8px] px-10 py-5 text-[17px] font-semibold` (kill hover translate).

- [ ] **Step 2: Commit**

```bash
cd /Users/treyvititoe/projects/scoutie && git add apps/web/app/about/page.tsx && git commit -m "style: update about page for Apple aesthetic

Alternating black/gray sections, clean typography, teal accent.
Kill gradients, noise texture, colored badges, hover effects."
```

---

### Task 15: Update Login Page

**Files:**
- Modify: `apps/web/app/auth/login/page.tsx`

- [ ] **Step 1: Update login/page.tsx**

Key changes:
1. **Background:** `bg-gray-light`.
2. **Card:** `bg-white rounded-[8px] p-8` (kill `border border-border rounded-2xl`).
3. **Brand:** `font-semibold text-[21px] text-gray-dark` (kill `font-display font-bold text-2xl`).
4. **Subtitle:** `text-on-light-secondary`.
5. **Google button:** `bg-white border border-black/10 rounded-[8px] px-4 py-3 font-semibold text-gray-dark hover:bg-gray-light` (kill `border-border bg-surface hover:bg-background`).
6. **Divider:** `bg-black/5` lines. Text: `text-on-light-tertiary text-sm`.
7. **Email input:** `border border-black/10 rounded-[8px] px-4 py-3 text-gray-dark placeholder:text-on-light-tertiary focus:outline-none focus:ring-2 focus:ring-accent` (kill `border-border bg-surface focus:ring-primary`).
8. **Submit button:** `bg-accent text-white rounded-[8px] py-3 font-semibold` (kill `bg-primary hover:bg-primary-dark rounded-xl`).
9. **Success state icon:** `bg-accent/10` circle with `text-accent` icon (kill `bg-primary-50 text-primary`).
10. **Kill:** All `font-display`, `text-text`, `text-text-secondary`, `text-text-muted`.

- [ ] **Step 2: Commit**

```bash
cd /Users/treyvititoe/projects/scoutie && git add apps/web/app/auth/login/page.tsx && git commit -m "style: update login page for Apple aesthetic

White card on gray, 8px radius, teal accent, clean inputs."
```

---

### Task 16: Update Privacy, Terms, Shared Trip, and Onboarding Pages

**Files:**
- Modify: `apps/web/app/privacy/page.tsx`
- Modify: `apps/web/app/terms/page.tsx`
- Modify: `apps/web/app/shared/[slug]/page.tsx`
- Modify: `apps/web/app/onboarding/page.tsx`

- [ ] **Step 1: Update privacy/page.tsx**

Key changes:
1. Nav: Dark `nav-glass` nav.
2. Background: `bg-gray-light`.
3. Content card: `bg-white rounded-[8px] p-8`.
4. Typography: `font-semibold` headings, `text-gray-dark` primary text, `text-on-light-secondary` body.
5. Kill all `font-display`, `font-bold`, `text-text`, old color tokens.

- [ ] **Step 2: Update terms/page.tsx**

Same changes as privacy page.

- [ ] **Step 3: Update shared/[slug]/page.tsx**

Key changes:
1. Background: `bg-gray-light`.
2. Hero: `bg-black` with white text. Kill `.text-gradient` on destination.
3. Day cards: `bg-white rounded-[8px]`. Kill colored type indicators (teal, purple, amber, rose, emerald) -- use `text-on-light-tertiary` micro text for type labels.
4. Timeline: `bg-black/10` line (kill colored lines).
5. CTA: `bg-accent text-white rounded-[8px]`.
6. Kill all old color tokens, `font-headline`, `font-extrabold`.

- [ ] **Step 4: Update onboarding/page.tsx**

Key changes:
1. Background: `bg-gray-light`.
2. Step cards: `bg-white rounded-[8px]`.
3. Buttons: `bg-accent text-white rounded-[8px]`.
4. Typography: `font-semibold`, kill `font-bold font-headline`.
5. Kill old color tokens.

- [ ] **Step 5: Commit**

```bash
cd /Users/treyvititoe/projects/scoutie && git add apps/web/app/privacy/page.tsx apps/web/app/terms/page.tsx "apps/web/app/shared/[slug]/page.tsx" apps/web/app/onboarding/page.tsx && git commit -m "style: update privacy, terms, shared trip, onboarding pages

Gray background, white cards, 8px radius, clean typography, teal accent.
Kill colored type indicators, gradients, old color tokens."
```

---

### Task 17: Update Quiz Step Components

**Files:**
- Modify: `apps/web/components/quiz/Step1WhereWhen.tsx`
- Modify: `apps/web/components/quiz/Step3Travelers.tsx`
- Modify: `apps/web/components/quiz/Step4Budget.tsx`
- Modify: `apps/web/components/quiz/Step4Flights.tsx`
- Modify: `apps/web/components/quiz/Step5Accommodation.tsx`
- Modify: `apps/web/components/quiz/Step6Activities.tsx`
- Modify: `apps/web/components/quiz/Step7Review.tsx`
- Modify: `apps/web/components/quiz/DestinationAutocomplete.tsx`

- [ ] **Step 1: Update all quiz step components**

Common changes across all step components:
1. Input fields: `bg-white border border-black/10 rounded-[8px] py-3 px-4 text-gray-dark focus:ring-2 focus:ring-accent focus:border-transparent` (kill `bg-surface-container-low border-none rounded-xl focus:ring-primary/20`).
2. Labels: `text-sm font-semibold text-gray-dark` (kill `font-bold font-headline`).
3. Selection cards/options: `bg-white border border-black/10 rounded-[8px] p-4 hover:border-accent/30`. Active state: `bg-accent/5 border-accent` (kill `bg-primary/5 border-primary/20`).
4. Icons: `text-accent` (kill `text-primary`, `text-teal-600`).
5. Kill: All `font-headline`, `font-extrabold`, `font-body`, old color tokens (`primary`, `on-surface`, `surface-container`, `outline-variant`).
6. Checkboxes: `text-accent focus:ring-accent/20` (kill `text-primary focus:ring-primary/20`).

**DestinationAutocomplete.tsx** specific:
1. Dropdown: `bg-white rounded-[8px] shadow-elevated border border-black/5`.
2. Suggestion items: `hover:bg-gray-light`.
3. Selected destination tags: `bg-gray-light text-gray-dark rounded-pill px-3 py-1 text-sm`. Remove button: `text-on-light-tertiary hover:text-gray-dark`.

- [ ] **Step 2: Commit**

```bash
cd /Users/treyvititoe/projects/scoutie && git add apps/web/components/quiz/ && git commit -m "style: update all quiz step components for Apple aesthetic

Clean inputs with 8px radius, teal focus rings, white selection cards.
Kill old color tokens, font-headline, gradient accents."
```

---

### Task 18: Update Trip Sub-Components

**Files:**
- Modify: `apps/web/components/trip/RefinementChat.tsx`
- Modify: `apps/web/components/trip/PackingList.tsx`
- Modify: `apps/web/components/trip/TripMap.tsx`

- [ ] **Step 1: Update RefinementChat.tsx**

Key changes:
1. Chat container: `bg-white rounded-[8px] shadow-elevated` (kill glass/blur effects).
2. User message bubble: `bg-accent text-white rounded-[8px]`.
3. AI message bubble: `bg-gray-light text-gray-dark rounded-[8px]`.
4. Input: `border border-black/10 rounded-[8px]`.
5. Send button: `bg-accent text-white rounded-[8px]`.
6. Quick suggestion buttons: `border border-black/10 text-on-light-secondary rounded-pill hover:border-accent/30`.

- [ ] **Step 2: Update PackingList.tsx**

Key changes:
1. Container: `bg-white rounded-[8px] p-6`.
2. Category headers: `font-semibold text-gray-dark`.
3. Checkbox items: `text-accent` when checked.
4. Progress bar: `bg-gray-light` track, `bg-accent` fill.
5. Copy button: `text-accent hover:underline`.

- [ ] **Step 3: Update TripMap.tsx**

Key changes:
1. Container: `bg-white rounded-[8px] p-6` (kill `card-3d`).
2. Section header icon: `text-accent`.
3. Kill any colored badges or old tokens.

- [ ] **Step 4: Commit**

```bash
cd /Users/treyvititoe/projects/scoutie && git add apps/web/components/trip/ && git commit -m "style: update trip sub-components for Apple aesthetic

Clean chat widget, packing list, map container with white bg,
8px radius, teal accent. Kill glass effects and old tokens."
```

---

### Task 19: Update Onboarding Step Components

**Files:**
- Modify: `apps/web/components/onboarding/StepWhere.tsx`
- Modify: `apps/web/components/onboarding/StepWhen.tsx`
- Modify: `apps/web/components/onboarding/StepBudget.tsx`
- Modify: `apps/web/components/onboarding/StepVibes.tsx`
- Modify: `apps/web/components/onboarding/StepWho.tsx`
- Modify: `apps/web/components/onboarding/StepStay.tsx`

- [ ] **Step 1: Update all onboarding step components**

Same pattern as quiz step components (Task 17):
1. Inputs: `bg-white border border-black/10 rounded-[8px]`.
2. Selection cards: `bg-white border border-black/10 rounded-[8px]`. Active: `bg-accent/5 border-accent`.
3. Icons: `text-accent`.
4. Labels: `font-semibold text-gray-dark`.
5. Sliders: accent track color.
6. Quick preset buttons: `rounded-pill border border-black/10 hover:border-accent/30`.
7. Kill: All old color tokens, `font-headline`, `font-bold`, glass effects.

- [ ] **Step 2: Commit**

```bash
cd /Users/treyvititoe/projects/scoutie && git add apps/web/components/onboarding/ && git commit -m "style: update onboarding step components for Apple aesthetic

Clean inputs, teal accents, white selection cards, 8px radius.
Kill old color tokens and font-headline."
```

---

### Task 20: Final Build Verification

- [ ] **Step 1: Run the full build**

```bash
cd /Users/treyvititoe/projects/scoutie && npm run build --workspace=apps/web 2>&1
```

Expected: Build succeeds with no errors. Warnings about unused imports are OK.

- [ ] **Step 2: Fix any build errors**

If there are TypeScript or build errors (likely from leftover references to old Tailwind tokens), fix them. Common issues:
- References to `primary`, `on-surface`, `surface-container`, `outline-variant` — replace with new tokens
- References to `font-headline`, `font-body` — replace with `font-sans` or remove (Geist is the default)
- Missing `font-extrabold`, `font-black` — replace with `font-semibold`

- [ ] **Step 3: Visual spot-check**

```bash
cd /Users/treyvititoe/projects/scoutie && npm run dev:web
```

Open `http://localhost:3000` and verify:
- Dark glass navigation on all pages
- Black/gray alternating sections on homepage
- White cards with 8px radius
- Teal as the only accent color
- Geist Sans typography
- No gradients, glass effects, or animated backgrounds

- [ ] **Step 4: Commit any fixes**

```bash
cd /Users/treyvititoe/projects/scoutie && git add -A && git commit -m "fix: resolve build errors from aesthetic redesign

Fix remaining references to old color tokens and font classes."
```
