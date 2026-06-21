"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

export type SearchValue = {
  destination: string;
  startDate: string;
  endDate: string;
  exactDates: boolean;
  flexDays: number;
  adults: number;
  children: number;
  infants: number;
  pets: number;
  description: string;
};

type Section = "where" | "when" | "who" | "what" | null;

type Props = {
  value: SearchValue;
  onChange: (next: SearchValue) => void;
  /** Called only when the search is valid; receives the normalized value. */
  onSearch: (next: SearchValue) => void;
};

const SUGGESTED_DESTINATIONS: { name: string; tagline: string; icon: string }[] = [
  { name: "Tokyo, Japan", tagline: "Neon nights and ramen alleys", icon: "location_city" },
  { name: "Barcelona, Spain", tagline: "Gaudí, tapas, and the beach", icon: "location_city" },
  { name: "Paris, France", tagline: "Cafés, galleries, golden hour", icon: "location_city" },
  { name: "Bali, Indonesia", tagline: "Beach and jungle escape", icon: "beach_access" },
  { name: "New York, NY", tagline: "The city that never sleeps", icon: "location_city" },
  { name: "Lisbon, Portugal", tagline: "Hills, tile, ocean light", icon: "location_city" },
  { name: "Bangkok, Thailand", tagline: "Street food capital", icon: "ramen_dining" },
  { name: "Reykjavik, Iceland", tagline: "Northern lights, hot springs", icon: "ac_unit" },
];

const SUGGESTED_DESCRIPTIONS = [
  "Long walks, slow mornings, a great dinner reservation.",
  "Hikes, hot springs, no cell service.",
  "Museums, architecture, a Tuesday opera.",
  "Beach, no schedule, one good book.",
];

// Tappable interest categories for the What popover. Selecting them adds the
// label to the free-text description, so categories and full sentences coexist.
const WHAT_CATEGORIES: { label: string; icon: string }[] = [
  { label: "Food & dining", icon: "restaurant" },
  { label: "Hiking & nature", icon: "forest" },
  { label: "Museums & culture", icon: "museum" },
  { label: "Nightlife", icon: "nightlife" },
  { label: "Beaches", icon: "beach_access" },
  { label: "Architecture", icon: "apartment" },
  { label: "Live music", icon: "music_note" },
  { label: "Shopping", icon: "shopping_bag" },
  { label: "Adventure & sports", icon: "hiking" },
  { label: "Wellness & spa", icon: "spa" },
  { label: "Local markets", icon: "storefront" },
  { label: "Photography", icon: "photo_camera" },
];

function escapeRegExp(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Add or remove a category label from the free-text description. */
function toggleCategory(desc: string, cat: string): string {
  const present = new RegExp(`(^|,\\s*)${escapeRegExp(cat)}(\\s*,|$)`, "i").test(desc);
  if (present) {
    return desc
      .replace(new RegExp(`\\s*,?\\s*${escapeRegExp(cat)}`, "i"), "")
      .replace(/^\s*,\s*/, "")
      .replace(/\s*,\s*,/g, ", ")
      .trim();
  }
  const base = desc.trim();
  return base ? `${base}, ${cat}` : cat;
}

function hasCategory(desc: string, cat: string): boolean {
  return new RegExp(`(^|,\\s*)${escapeRegExp(cat)}(\\s*,|$)`, "i").test(desc);
}

type GeoItem = { id: string; label: string; value: string; secondary: string; icon: string };

/** Worldwide place lookup via Mapbox: cities, regions, countries, airports. */
async function geocodePlaces(query: string, signal: AbortSignal): Promise<GeoItem[]> {
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
  if (!token) return [];
  const url =
    `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json` +
    `?access_token=${token}&autocomplete=true&limit=6&language=en` +
    `&types=country,region,place,locality,district,poi`;
  const res = await fetch(url, { signal });
  if (!res.ok) return [];
  const data = (await res.json()) as {
    features?: {
      id: string;
      text: string;
      place_name: string;
      place_type: string[];
      properties?: { category?: string; maki?: string };
    }[];
  };
  return (data.features ?? []).map((f) => {
    const type = f.place_type?.[0] ?? "";
    const isAirport =
      f.properties?.maki === "airport" || (f.properties?.category ?? "").includes("airport");
    const icon = isAirport
      ? "flight"
      : type === "country"
        ? "public"
        : type === "region"
          ? "map"
          : type === "poi"
            ? "place"
            : "location_city";
    // Secondary = the place_name minus the leading short name.
    const secondary = f.place_name.startsWith(f.text)
      ? f.place_name.slice(f.text.length).replace(/^,\s*/, "")
      : f.place_name;
    return { id: f.id, label: f.text, value: f.place_name, secondary, icon };
  });
}

const FLEX_OPTIONS = [1, 2, 3, 7, 14] as const;
const DEFAULT_TRIP_DAYS = 7;

function pad(n: number) {
  return String(n).padStart(2, "0");
}
function formatYMD(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
function parseYMD(s: string): Date | null {
  if (!s) return null;
  const [y, m, d] = s.split("-").map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
}
function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}
function startOfToday() {
  const t = new Date();
  t.setHours(0, 0, 0, 0);
  return t;
}
function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}
function addMonths(d: Date, n: number) {
  return new Date(d.getFullYear(), d.getMonth() + n, 1);
}
function addDays(d: Date, n: number) {
  const next = new Date(d);
  next.setDate(next.getDate() + n);
  return next;
}
function monthLabel(d: Date) {
  return d.toLocaleString("en-US", { month: "long", year: "numeric" });
}
function buildMonthCells(year: number, month: number): (Date | null)[] {
  const first = new Date(year, month, 1);
  const startDow = first.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (Date | null)[] = [];
  for (let i = 0; i < startDow; i++) cells.push(null);
  for (let i = 1; i <= daysInMonth; i++) cells.push(new Date(year, month, i));
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

function shortDate(s: string): string {
  const d = parseYMD(s);
  if (!d) return "";
  return d.toLocaleString("en-US", { month: "short", day: "numeric" });
}

/** "May 22 to 30" within a month, "May 28 to Jun 3" across months. */
function rangeLabel(startS: string, endS: string): string {
  const s = parseYMD(startS);
  const e = parseYMD(endS);
  if (!s) return "";
  if (!e) return shortDate(startS);
  if (s.getFullYear() === e.getFullYear() && s.getMonth() === e.getMonth()) {
    return `${s.toLocaleString("en-US", { month: "short" })} ${s.getDate()} to ${e.getDate()}`;
  }
  return `${shortDate(startS)} to ${shortDate(endS)}`;
}

/**
 * Fill in whatever the user left open: a half-picked date range becomes a
 * sensible full range, untouched guests become 2 adults.
 */
export function normalizeSearch(v: SearchValue): SearchValue {
  const next = { ...v, destination: v.destination.trim() };
  if (next.startDate && !next.endDate) {
    const s = parseYMD(next.startDate);
    if (s) next.endDate = formatYMD(addDays(s, DEFAULT_TRIP_DAYS));
  } else if (next.endDate && !next.startDate) {
    const e = parseYMD(next.endDate);
    if (e) {
      const s = addDays(e, -DEFAULT_TRIP_DAYS);
      const today = startOfToday();
      next.startDate = formatYMD(s.getTime() < today.getTime() ? today : s);
    }
  }
  if (next.adults <= 0) next.adults = 2;
  return next;
}

export function SearchBar({ value, onChange, onSearch }: Props) {
  const [active, setActive] = useState<Section>(null);
  // +1 when the newly opened tab is to the right of the current one, -1 to the
  // left; drives the directional slide between popovers.
  const [direction, setDirection] = useState(1);
  const [whereError, setWhereError] = useState(false);
  const [shakeKey, setShakeKey] = useState(0);
  const wrapRef = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Hovering a segment opens it; moving to the next slides the open state over.
  // A short close delay bridges the gap between the bar and the popover so the
  // panel doesn't flicker shut as the cursor travels down into it.
  const cancelClose = () => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  };
  const openSection = (s: Section) => {
    cancelClose();
    if (s && active && s !== active) {
      const order: Section[] = ["where", "when", "who", "what"];
      setDirection(order.indexOf(s) > order.indexOf(active) ? 1 : -1);
    }
    setActive(s);
  };
  const scheduleClose = () => {
    cancelClose();
    closeTimer.current = setTimeout(() => setActive(null), 160);
  };

  useEffect(() => {
    function onDown(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setActive(null);
      }
    }
    function onEsc(e: KeyboardEvent) {
      if (e.key === "Escape") setActive(null);
    }
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onEsc);
      if (closeTimer.current) clearTimeout(closeTimer.current);
    };
  }, []);

  // The hint clears itself the moment a destination exists.
  useEffect(() => {
    if (value.destination.trim()) setWhereError(false);
  }, [value.destination]);

  function attemptSearch() {
    if (!value.destination.trim()) {
      setWhereError(true);
      setShakeKey((k) => k + 1);
      setActive("where");
      return;
    }
    const next = normalizeSearch(value);
    onChange(next);
    setActive(null);
    onSearch(next);
  }

  function handleWrapKeyDown(e: React.KeyboardEvent) {
    if (e.key !== "Enter") return;
    const target = e.target as HTMLElement;
    // Shift+Enter keeps its newline in the free-text box.
    if (target.tagName === "TEXTAREA" && e.shiftKey) return;
    e.preventDefault();
    attemptSearch();
  }

  const whenLabel = (() => {
    if (value.startDate) {
      const base = rangeLabel(value.startDate, value.endDate);
      if (!value.exactDates && value.flexDays > 0) return `${base}, ± ${value.flexDays}d`;
      return base;
    }
    return "Add dates";
  })();

  const whoTouched = value.adults + value.children + value.infants + value.pets > 0;
  const whoLabel = (() => {
    if (!whoTouched) return "Add travelers";
    const travelers = (value.adults || 2) + value.children;
    const parts = [`${travelers} ${travelers === 1 ? "traveler" : "travelers"}`];
    if (value.infants > 0) parts.push(`${value.infants} ${value.infants === 1 ? "infant" : "infants"}`);
    if (value.pets > 0) parts.push(`${value.pets} ${value.pets === 1 ? "pet" : "pets"}`);
    return parts.join(", ");
  })();

  const whereLabel = value.destination || (whereError ? "Add a destination" : "Search destinations");
  const whatLabel = value.description || "What you love to do";

  return (
    <div
      ref={wrapRef}
      onKeyDown={handleWrapKeyDown}
      onMouseEnter={cancelClose}
      onMouseLeave={scheduleClose}
      className="relative max-w-3xl mx-auto"
    >
      <motion.div
        key={shakeKey}
        initial={false}
        animate={shakeKey > 0 ? { x: [0, -10, 10, -6, 6, 0] } : { x: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="rounded-full flex items-stretch p-1.5 bg-card ring-1 ring-line shadow-[0_12px_40px_rgba(20,30,60,0.10)]"
      >
        <SectionButton
          isActive={active === "where"}
          isExpanded={active === "where"}
          onHover={() => openSection("where")}
          label="Where"
          value={whereLabel}
          placeholder={!value.destination}
          error={whereError && !value.destination}
          onClick={() => setActive(active === "where" ? null : "where")}
          onClear={value.destination ? () => onChange({ ...value, destination: "" }) : undefined}
          clearLabel="Clear destination"
        />
        <Divider show={active !== "where" && active !== "when"} />
        <SectionButton
          isActive={active === "when"}
          isExpanded={active === "when"}
          onHover={() => openSection("when")}
          label="When"
          value={whenLabel}
          placeholder={!value.startDate}
          onClick={() => setActive(active === "when" ? null : "when")}
          onClear={
            value.startDate || value.endDate
              ? () => onChange({ ...value, startDate: "", endDate: "", exactDates: true, flexDays: 0 })
              : undefined
          }
          clearLabel="Clear dates"
        />
        <Divider show={active !== "when" && active !== "who"} />
        <SectionButton
          isActive={active === "who"}
          isExpanded={active === "who"}
          onHover={() => openSection("who")}
          label="Who"
          value={whoLabel}
          placeholder={!whoTouched}
          onClick={() => setActive(active === "who" ? null : "who")}
          onClear={
            whoTouched
              ? () => onChange({ ...value, adults: 0, children: 0, infants: 0, pets: 0 })
              : undefined
          }
          clearLabel="Clear travelers"
        />
        <Divider show={active !== "who" && active !== "what"} />
        <SectionButton
          isActive={active === "what"}
          isExpanded={active === "what"}
          onHover={() => openSection("what")}
          label="What"
          value={whatLabel}
          placeholder={!value.description}
          onClick={() => setActive(active === "what" ? null : "what")}
          onClear={value.description ? () => onChange({ ...value, description: "" }) : undefined}
          clearLabel="Clear interests"
        />
        <button
          type="button"
          onClick={attemptSearch}
          className="bg-accent text-snow-off-glacier rounded-full px-5 py-3 text-[14px] font-semibold hover:bg-accent-light transition-colors flex items-center gap-2 ml-1 shrink-0"
        >
          <span className="material-symbols-outlined text-[20px]">search</span>
          Search
        </button>
      </motion.div>

      <AnimatePresence custom={direction} initial={false}>
        {active === "where" && (
          <WherePopover
            key="where"
            direction={direction}
            value={value}
            onChange={onChange}
            onClose={() => setActive(null)}
            error={whereError && !value.destination}
          />
        )}
        {active === "when" && (
          <WhenPopover key="when" direction={direction} value={value} onChange={onChange} />
        )}
        {active === "who" && (
          <WhoPopover key="who" direction={direction} value={value} onChange={onChange} />
        )}
        {active === "what" && (
          <WhatPopover key="what" direction={direction} value={value} onChange={onChange} />
        )}
      </AnimatePresence>
    </div>
  );
}

function Divider({ show }: { show: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={`w-px my-2.5 transition-opacity ${show ? "bg-ink/10 opacity-100" : "opacity-0"}`}
    />
  );
}

type SectionButtonProps = {
  isActive: boolean;
  isExpanded: boolean;
  onHover: () => void;
  label: string;
  value: string;
  placeholder: boolean;
  error?: boolean;
  onClick: () => void;
  onClear?: () => void;
  clearLabel: string;
};

function SectionButton({
  isActive,
  isExpanded,
  onHover,
  label,
  value,
  placeholder,
  error,
  onClick,
  onClear,
  clearLabel,
}: SectionButtonProps) {
  return (
    <motion.div
      role="button"
      tabIndex={0}
      aria-expanded={isActive}
      onClick={onClick}
      onMouseEnter={onHover}
      onKeyDown={(e) => {
        // Space opens the section. Enter bubbles up and submits the search.
        if (e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
      // The hovered/open segment grows and its neighbours shrink; framer
      // animates flex-grow so the widening slides smoothly across the bar.
      initial={false}
      animate={{ flexGrow: isExpanded ? 1.85 : 1 }}
      transition={{ duration: 0.34, ease: [0.2, 0.8, 0.2, 1] }}
      style={{ flexBasis: 0 }}
      className="group relative min-w-0 px-5 py-2 text-left rounded-full cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
    >
      {isActive ? (
        // Shared element: framer slides this highlight between segments.
        <motion.div
          layoutId="search-active-seg"
          transition={{ type: "spring", stiffness: 420, damping: 36 }}
          className="absolute inset-0 rounded-full bg-hover-slate shadow-[0_3px_10px_rgba(20,30,60,0.10)]"
        />
      ) : (
        <div className="absolute inset-0 rounded-full bg-ink/0 group-hover:bg-ink/5 transition-colors" />
      )}
      <div className="relative z-10">
        <p className="text-[12px] uppercase tracking-[1.5px] text-ink font-bold mb-1">{label}</p>
        <p
          className={`text-[14px] truncate ${onClear ? "pr-7" : ""} ${
            error
              ? "text-[oklch(0.55_0.19_25)] font-medium"
              : placeholder
                ? "text-ink-faint"
                : "text-ink font-medium"
          }`}
        >
          {value}
        </p>
      </div>
      {onClear && (
        <button
          type="button"
          tabIndex={-1}
          aria-label={clearLabel}
          onClick={(e) => {
            e.stopPropagation();
            onClear();
          }}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 z-20 w-6 h-6 rounded-full bg-ink/10 hover:bg-ink/20 text-ink items-center justify-center hidden group-hover:flex group-focus-within:flex"
        >
          <span className="material-symbols-outlined text-[14px]">close</span>
        </button>
      )}
    </motion.div>
  );
}

// Directional slide: a tab to the right enters from the right and the old one
// leaves to the left; reversing flips it. custom = the slide direction (±1).
const SHELL_VARIANTS = {
  hidden: (dir: number) => ({ opacity: 0, x: 64 * dir }),
  shown: { opacity: 1, x: 0 },
  // Stay fully visible while sliding out, fading only at the tail, so the panel
  // reads as gliding away in the cursor's direction rather than snapping shut.
  exit: (dir: number) => ({ opacity: [1, 1, 0], x: -64 * dir }),
};

function PopoverShell({
  children,
  className = "",
  align = "left",
  width = "auto",
  direction = 1,
}: {
  children: React.ReactNode;
  className?: string;
  align?: "left" | "center" | "right";
  width?: string;
  direction?: number;
}) {
  const isCenter = align === "center";
  const positionClass = isCenter ? "left-1/2" : align === "right" ? "right-0" : "left-0";
  // Center via margin, not transform, so framer's x stays free for the slide.
  const halfWidth = Number.parseInt(width, 10) / 2;

  return (
    <motion.div
      custom={direction}
      variants={SHELL_VARIANTS}
      initial="hidden"
      animate="shown"
      exit="exit"
      transition={{ duration: 0.5, ease: [0.2, 0.8, 0.2, 1] }}
      className={`absolute top-[calc(100%+12px)] ${positionClass} bg-card rounded-[24px] shadow-[0_12px_40px_rgba(20,30,60,0.12)] border border-line z-30 ${className}`}
      style={{
        width,
        marginLeft: isCenter && Number.isFinite(halfWidth) ? -halfWidth : undefined,
      }}
    >
      {children}
    </motion.div>
  );
}

function WherePopover({
  value,
  onChange,
  onClose,
  error,
  direction,
}: {
  value: SearchValue;
  onChange: (n: SearchValue) => void;
  onClose: () => void;
  error: boolean;
  direction: number;
}) {
  const [highlight, setHighlight] = useState(-1);
  const [results, setResults] = useState<GeoItem[]>([]);
  const [loading, setLoading] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  const query = value.destination.trim();
  const suggestions: GeoItem[] = SUGGESTED_DESTINATIONS.map((d) => ({
    id: d.name,
    label: d.name,
    value: d.name,
    secondary: d.tagline,
    icon: d.icon,
  }));
  const matches = query ? results : suggestions;

  // Debounced worldwide geocoding: cities, regions, countries, airports.
  useEffect(() => {
    if (!query) {
      setResults([]);
      setLoading(false);
      return;
    }
    const controller = new AbortController();
    setLoading(true);
    const t = setTimeout(() => {
      geocodePlaces(query, controller.signal)
        .then(setResults)
        .catch(() => {})
        .finally(() => setLoading(false));
    }, 250);
    return () => {
      clearTimeout(t);
      controller.abort();
    };
  }, [query]);

  useEffect(() => {
    if (highlight < 0) return;
    const el = listRef.current?.children[highlight] as HTMLElement | undefined;
    el?.scrollIntoView({ block: "nearest" });
  }, [highlight]);

  function pick(dest: string) {
    onChange({ ...value, destination: dest });
    onClose();
  }

  function handleInputKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlight((h) => Math.min(h + 1, matches.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlight((h) => Math.max(h - 1, -1));
    } else if (e.key === "Enter" && highlight >= 0 && matches[highlight]) {
      // A highlighted suggestion takes priority over submitting.
      e.preventDefault();
      e.stopPropagation();
      pick(matches[highlight].value);
    }
  }

  return (
    <PopoverShell align="left" width="430px" className="p-2" direction={direction}>
      <div className="px-4 pt-3 pb-2">
        <input
          autoFocus
          type="text"
          role="combobox"
          aria-expanded="true"
          aria-autocomplete="list"
          value={value.destination}
          onChange={(e) => {
            onChange({ ...value, destination: e.target.value });
            setHighlight(-1);
          }}
          onKeyDown={handleInputKeyDown}
          placeholder="City, country, state, or airport"
          className="w-full text-[15px] text-ink placeholder:text-ink-faint bg-transparent focus:outline-none"
        />
        {error && (
          <p className="text-[12px] text-[oklch(0.55_0.19_25)] mt-1.5 font-medium">
            Walter needs a destination.
          </p>
        )}
      </div>
      <div className="border-t border-line pt-3 pb-2 px-2">
        <p className="text-[11px] text-ink-faint px-3 mb-2 font-medium">
          {query ? (loading ? "Searching…" : "Destinations") : "Suggested destinations"}
        </p>
        {matches.length === 0 ? (
          <p className="text-[13px] text-ink-soft px-3 pb-2">
            {loading
              ? "Looking…"
              : `No matches. Press Enter to search "${query}".`}
          </p>
        ) : (
          <div ref={listRef} className="max-h-[320px] overflow-y-auto" role="listbox">
            {matches.map((d, i) => (
              <button
                key={d.id}
                type="button"
                role="option"
                aria-selected={i === highlight}
                tabIndex={-1}
                onClick={() => pick(d.value)}
                onMouseEnter={() => setHighlight(i)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-[12px] transition-colors text-left ${
                  i === highlight ? "bg-ink/5" : ""
                }`}
              >
                <span className="w-10 h-10 rounded-[10px] bg-accent/15 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-accent text-[20px]">{d.icon}</span>
                </span>
                <div className="min-w-0">
                  <p className="text-[14px] font-semibold text-ink truncate">{d.label}</p>
                  {d.secondary && (
                    <p className="text-[12px] text-ink-soft truncate">{d.secondary}</p>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </PopoverShell>
  );
}

function WhenPopover({
  value,
  onChange,
  direction,
}: {
  value: SearchValue;
  onChange: (n: SearchValue) => void;
  direction: number;
}) {
  const today = startOfToday();

  const [viewMonth, setViewMonth] = useState<Date>(() => {
    const d = parseYMD(value.startDate);
    // Never open onto a month that is entirely in the past.
    if (d && d.getTime() >= startOfMonth(today).getTime()) return startOfMonth(d);
    return startOfMonth(today);
  });

  const startDate = parseYMD(value.startDate);
  const endDate = parseYMD(value.endDate);
  const canGoBack = viewMonth.getTime() > startOfMonth(today).getTime();

  function selectDate(d: Date) {
    if (d.getTime() < today.getTime()) return;
    if (!startDate || (startDate && endDate)) {
      onChange({ ...value, startDate: formatYMD(d), endDate: "" });
      return;
    }
    if (d.getTime() < startDate.getTime()) {
      onChange({ ...value, startDate: formatYMD(d), endDate: "" });
    } else if (isSameDay(d, startDate)) {
      onChange({ ...value, startDate: "", endDate: "" });
    } else {
      onChange({ ...value, endDate: formatYMD(d) });
    }
  }

  function inRange(d: Date) {
    if (!startDate || !endDate) return false;
    return d.getTime() >= startDate.getTime() && d.getTime() <= endDate.getTime();
  }

  return (
    <PopoverShell align="center" width="780px" className="p-6" direction={direction}>
      <div className="flex items-center justify-center gap-2 mb-5">
        <div className="inline-flex bg-raised-slate rounded-full p-1">
          <button
            type="button"
            onClick={() => onChange({ ...value, exactDates: true, flexDays: 0 })}
            className={`px-5 py-1.5 rounded-full text-[13px] font-semibold transition-colors ${
              value.exactDates ? "bg-card text-ink shadow-sm" : "text-ink-soft"
            }`}
          >
            Dates
          </button>
          <button
            type="button"
            onClick={() => onChange({ ...value, exactDates: false })}
            className={`px-5 py-1.5 rounded-full text-[13px] font-semibold transition-colors ${
              !value.exactDates ? "bg-card text-ink shadow-sm" : "text-ink-soft"
            }`}
          >
            Flexible
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-8">
        {[0, 1].map((offset) => {
          const month = addMonths(viewMonth, offset);
          const cells = buildMonthCells(month.getFullYear(), month.getMonth());
          return (
            <div key={offset}>
              <div className="flex items-center justify-between mb-3">
                {offset === 0 ? (
                  <button
                    type="button"
                    disabled={!canGoBack}
                    onClick={() => setViewMonth(addMonths(viewMonth, -1))}
                    className={`w-7 h-7 rounded-full flex items-center justify-center ${
                      canGoBack ? "hover:bg-ink/5 text-ink" : "text-ink/20 cursor-not-allowed"
                    }`}
                    aria-label="Previous month"
                  >
                    <span className="material-symbols-outlined text-[18px]">chevron_left</span>
                  </button>
                ) : (
                  <span className="w-7 h-7" />
                )}
                <p className="text-[14px] font-semibold text-ink">{monthLabel(month)}</p>
                {offset === 1 ? (
                  <button
                    type="button"
                    onClick={() => setViewMonth(addMonths(viewMonth, 1))}
                    className="w-7 h-7 rounded-full hover:bg-ink/5 flex items-center justify-center text-ink"
                    aria-label="Next month"
                  >
                    <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                  </button>
                ) : (
                  <span className="w-7 h-7" />
                )}
              </div>
              <div className="grid grid-cols-7 gap-y-1 text-center">
                {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
                  <div key={i} className="text-[11px] text-ink-faint font-medium pb-2">
                    {d}
                  </div>
                ))}
                {cells.map((cell, i) => {
                  if (!cell) return <div key={i} />;
                  const past = cell.getTime() < today.getTime();
                  const isStart = startDate && isSameDay(cell, startDate);
                  const isEnd = endDate && isSameDay(cell, endDate);
                  const inR = inRange(cell);
                  const isEdge = isStart || isEnd;
                  return (
                    <button
                      key={i}
                      type="button"
                      disabled={past}
                      onClick={() => selectDate(cell)}
                      className={`relative h-10 text-[13px] transition-colors ${
                        past
                          ? "text-ink/20 cursor-not-allowed"
                          : isEdge
                            ? "bg-accent text-snow-off-glacier rounded-full font-semibold"
                            : inR
                              ? "bg-accent/20 text-ink"
                              : "hover:bg-ink/5 rounded-full text-ink"
                      }`}
                    >
                      {cell.getDate()}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {value.startDate && !value.endDate && (
        <p className="text-[12px] text-ink-faint text-center mt-4">
          Pick an end date, or search now and Walter assumes a week.
        </p>
      )}

      {!value.exactDates && (
        <div className="flex items-center justify-center gap-2 mt-6 flex-wrap">
          <button
            type="button"
            onClick={() => onChange({ ...value, flexDays: 0 })}
            className={`px-4 py-1.5 rounded-full text-[12px] font-medium border transition-colors ${
              value.flexDays === 0
                ? "border-ink bg-ink text-snow-off-glacier"
                : "border-ink/20 text-ink hover:border-ink/60"
            }`}
          >
            Exact dates
          </button>
          {FLEX_OPTIONS.map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => onChange({ ...value, flexDays: n })}
              className={`px-4 py-1.5 rounded-full text-[12px] font-medium border transition-colors ${
                value.flexDays === n
                  ? "border-ink bg-ink text-snow-off-glacier"
                  : "border-ink/20 text-ink hover:border-ink/60"
              }`}
            >
              ± {n} {n === 1 ? "day" : "days"}
            </button>
          ))}
        </div>
      )}
    </PopoverShell>
  );
}

function WhoPopover({
  value,
  onChange,
  direction,
}: {
  value: SearchValue;
  onChange: (n: SearchValue) => void;
  direction: number;
}) {
  // Untouched adults read as the default party of 2; the first tap edits from there.
  const shownAdults = value.adults <= 0 ? 2 : value.adults;

  const rows: {
    key: "adults" | "children" | "infants" | "pets";
    label: string;
    sub: string;
    min: number;
    count: number;
  }[] = [
    { key: "adults", label: "Adults", sub: "13 or older", min: 1, count: shownAdults },
    { key: "children", label: "Children", sub: "Ages 2 to 12", min: 0, count: value.children },
    { key: "infants", label: "Infants", sub: "Under 2", min: 0, count: value.infants },
    { key: "pets", label: "Pets", sub: "Dogs and cats", min: 0, count: value.pets },
  ];

  return (
    <PopoverShell align="right" width="380px" className="p-5 mr-36" direction={direction}>
      {rows.map((row, i) => (
        <div
          key={row.key}
          className={`flex items-center justify-between py-3.5 ${
            i < rows.length - 1 ? "border-b border-line" : ""
          }`}
        >
          <div>
            <p className="text-[14px] font-semibold text-ink">{row.label}</p>
            <p className="text-[12px] text-ink-faint">{row.sub}</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              aria-label={`Fewer ${row.label.toLowerCase()}`}
              disabled={row.count <= row.min}
              onClick={() => onChange({ ...value, [row.key]: row.count - 1 })}
              className={`w-8 h-8 rounded-full border flex items-center justify-center transition-colors ${
                row.count <= row.min
                  ? "border-line text-ink/20 cursor-not-allowed"
                  : "border-ink/30 text-ink hover:border-ink"
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">remove</span>
            </button>
            <span className="w-6 text-center text-[14px] font-medium text-ink tabular-nums">
              {row.count}
            </span>
            <button
              type="button"
              aria-label={`More ${row.label.toLowerCase()}`}
              onClick={() => onChange({ ...value, [row.key]: row.count + 1 })}
              className="w-8 h-8 rounded-full border border-ink/30 text-ink hover:border-ink flex items-center justify-center transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
            </button>
          </div>
        </div>
      ))}
    </PopoverShell>
  );
}

function WhatPopover({
  value,
  onChange,
  direction,
}: {
  value: SearchValue;
  onChange: (n: SearchValue) => void;
  direction: number;
}) {
  return (
    <PopoverShell align="right" width="460px" className="p-4" direction={direction}>
      <textarea
        autoFocus
        value={value.description}
        onChange={(e) => onChange({ ...value, description: e.target.value })}
        placeholder="Hikes, museums, slow dinners. Tell Walter what you love doing."
        rows={3}
        className="w-full text-[14px] text-ink placeholder:text-ink-faint bg-transparent border border-line rounded-[14px] p-3 focus:outline-none focus:border-accent resize-none"
      />
      <p className="text-[11px] text-ink-faint mt-1 px-1">Enter searches. Shift+Enter for a new line.</p>

      <p className="text-[11px] text-ink-faint mt-4 mb-2 px-1 font-medium">
        Tap categories, and mix in your own words
      </p>
      <div className="flex flex-wrap gap-2 px-1">
        {WHAT_CATEGORIES.map((c) => {
          const on = hasCategory(value.description, c.label);
          return (
            <button
              key={c.label}
              type="button"
              onClick={() =>
                onChange({ ...value, description: toggleCategory(value.description, c.label) })
              }
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[13px] font-medium border transition-colors ${
                on
                  ? "border-accent bg-accent/10 text-accent"
                  : "border-line text-ink hover:border-ink/40"
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">{c.icon}</span>
              {c.label}
            </button>
          );
        })}
      </div>

      <p className="text-[11px] text-ink-faint mt-4 mb-2 px-1 font-medium">Or start from an example</p>
      <div className="space-y-1">
        {SUGGESTED_DESCRIPTIONS.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => onChange({ ...value, description: s })}
            className="w-full flex items-center gap-3 px-2 py-2 rounded-[12px] hover:bg-ink/5 transition-colors text-left"
          >
            <span className="w-9 h-9 rounded-full border border-line flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-ink-soft text-[18px]">search</span>
            </span>
            <span className="text-[13px] text-ink leading-snug">{s}</span>
          </button>
        ))}
      </div>
    </PopoverShell>
  );
}
