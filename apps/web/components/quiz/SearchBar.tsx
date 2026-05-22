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
  onSearch: () => void;
};

const SUGGESTED_DESTINATIONS: { name: string; tagline: string; icon: string }[] = [
  { name: "Nearby", tagline: "Find what's around you", icon: "near_me" },
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

const FLEX_OPTIONS = [1, 2, 3, 7, 14] as const;

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
function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}
function addMonths(d: Date, n: number) {
  return new Date(d.getFullYear(), d.getMonth() + n, 1);
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

export function SearchBar({ value, onChange, onSearch }: Props) {
  const [active, setActive] = useState<Section>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

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
    };
  }, []);

  const whenLabel = (() => {
    if (value.startDate && value.endDate) return `${shortDate(value.startDate)} – ${shortDate(value.endDate)}`;
    if (value.startDate) return shortDate(value.startDate);
    return "Add dates";
  })();

  const whoLabel = (() => {
    const guests = value.adults + value.children;
    const parts: string[] = [];
    if (guests > 0) parts.push(`${guests} guest${guests > 1 ? "s" : ""}`);
    if (value.infants > 0) parts.push(`${value.infants} infant${value.infants > 1 ? "s" : ""}`);
    if (value.pets > 0) parts.push(`${value.pets} pet${value.pets > 1 ? "s" : ""}`);
    return parts.join(", ") || "Add guests";
  })();

  const whatLabel = value.description || "Add description";
  const whereLabel = value.destination || "Search destinations";

  const pillBaseClass = active
    ? "bg-quiet-slate ring-1 ring-white/10"
    : "bg-quiet-slate ring-1 ring-white/10 shadow-[0_12px_40px_rgba(0,0,0,0.5)]";

  return (
    <div ref={wrapRef} className="relative max-w-3xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.16 }}
        className={`rounded-full flex items-stretch p-1.5 transition-colors duration-200 ${pillBaseClass}`}
      >
        <SectionButton
          isActive={active === "where"}
          isAnyActive={active !== null}
          label="Where"
          value={whereLabel}
          placeholder={!value.destination}
          onClick={() => setActive(active === "where" ? null : "where")}
        />
        <Divider show={active !== "where" && active !== "when"} />
        <SectionButton
          isActive={active === "when"}
          isAnyActive={active !== null}
          label="When"
          value={whenLabel}
          placeholder={!value.startDate}
          onClick={() => setActive(active === "when" ? null : "when")}
        />
        <Divider show={active !== "when" && active !== "who"} />
        <SectionButton
          isActive={active === "who"}
          isAnyActive={active !== null}
          label="Who"
          value={whoLabel}
          placeholder={value.adults + value.children + value.infants + value.pets === 0}
          onClick={() => setActive(active === "who" ? null : "who")}
        />
        <Divider show={active !== "who" && active !== "what"} />
        <SectionButton
          isActive={active === "what"}
          isAnyActive={active !== null}
          label="What"
          value={whatLabel}
          placeholder={!value.description}
          onClick={() => setActive(active === "what" ? null : "what")}
        />
        <button
          onClick={() => {
            setActive(null);
            onSearch();
          }}
          className="bg-accent text-snow-off-glacier rounded-full px-5 py-3 text-[14px] font-semibold hover:bg-accent-light transition-colors flex items-center gap-2 ml-1 shrink-0"
        >
          <span className="material-symbols-outlined text-[20px]">search</span>
          Search
        </button>
      </motion.div>

      <AnimatePresence>
        {active === "where" && (
          <WherePopover key="where" value={value} onChange={onChange} onClose={() => setActive(null)} />
        )}
        {active === "when" && (
          <WhenPopover key="when" value={value} onChange={onChange} />
        )}
        {active === "who" && (
          <WhoPopover key="who" value={value} onChange={onChange} />
        )}
        {active === "what" && (
          <WhatPopover key="what" value={value} onChange={onChange} />
        )}
      </AnimatePresence>
    </div>
  );
}

function Divider({ show }: { show: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={`w-px my-2.5 transition-opacity ${show ? "bg-white/10 opacity-100" : "opacity-0"}`}
    />
  );
}

type SectionButtonProps = {
  isActive: boolean;
  isAnyActive: boolean;
  label: string;
  value: string;
  placeholder: boolean;
  onClick: () => void;
};

function SectionButton({ isActive, isAnyActive, label, value, placeholder, onClick }: SectionButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 px-5 py-2 text-left rounded-full transition-colors min-w-0 ${
        isActive
          ? "bg-hover-slate shadow-[0_3px_10px_rgba(0,0,0,0.4)]"
          : isAnyActive
            ? "hover:bg-white/5"
            : "hover:bg-white/5"
      }`}
    >
      <p className="text-[10px] uppercase tracking-wide text-white/55 font-bold mb-0.5">
        {label}
      </p>
      <p
        className={`text-[14px] truncate ${
          placeholder ? "text-white/45" : "text-snow-off-glacier font-medium"
        }`}
      >
        {value}
      </p>
    </button>
  );
}

function PopoverShell({
  children,
  className = "",
  align = "left",
  width = "auto",
}: {
  children: React.ReactNode;
  className?: string;
  align?: "left" | "center" | "right";
  width?: string;
}) {
  const positionClass =
    align === "center" ? "left-1/2 -translate-x-1/2" : align === "right" ? "right-0" : "left-0";

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
      className={`absolute top-[calc(100%+12px)] ${positionClass} bg-quiet-slate rounded-[24px] shadow-[0_12px_40px_rgba(0,0,0,0.6)] border border-white/10 z-30 ${className}`}
      style={{ width }}
    >
      {children}
    </motion.div>
  );
}

function WherePopover({
  value,
  onChange,
  onClose,
}: {
  value: SearchValue;
  onChange: (n: SearchValue) => void;
  onClose: () => void;
}) {
  return (
    <PopoverShell align="left" width="430px" className="p-2">
      <div className="px-4 pt-3 pb-2">
        <input
          autoFocus
          type="text"
          value={value.destination}
          onChange={(e) => onChange({ ...value, destination: e.target.value })}
          placeholder="Search destinations"
          className="w-full text-[15px] text-snow-off-glacier placeholder:text-white/45 bg-transparent focus:outline-none"
        />
      </div>
      <div className="border-t border-white/10 pt-3 pb-2 px-2">
        <p className="text-[11px] text-white/55 px-3 mb-2 font-medium">
          Suggested destinations
        </p>
        <div className="max-h-[320px] overflow-y-auto">
          {SUGGESTED_DESTINATIONS.map((d) => (
            <button
              key={d.name}
              type="button"
              onClick={() => {
                onChange({ ...value, destination: d.name === "Nearby" ? "" : d.name });
                onClose();
              }}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-[12px] hover:bg-white/5 transition-colors text-left"
            >
              <span className="w-10 h-10 rounded-[10px] bg-accent/15 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-accent-light text-[20px]">{d.icon}</span>
              </span>
              <div className="min-w-0">
                <p className="text-[14px] font-semibold text-snow-off-glacier truncate">{d.name}</p>
                <p className="text-[12px] text-on-light-secondary truncate">{d.tagline}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </PopoverShell>
  );
}

function WhenPopover({
  value,
  onChange,
}: {
  value: SearchValue;
  onChange: (n: SearchValue) => void;
}) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const initialMonth = (() => {
    const d = parseYMD(value.startDate) || today;
    return startOfMonth(d);
  })();
  const [viewMonth, setViewMonth] = useState<Date>(initialMonth);

  const startDate = parseYMD(value.startDate);
  const endDate = parseYMD(value.endDate);

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
    <PopoverShell align="center" width="780px" className="p-6">
      <div className="flex items-center justify-center gap-2 mb-5">
        <div className="inline-flex bg-raised-slate rounded-full p-1">
          <button
            type="button"
            onClick={() => onChange({ ...value, exactDates: true })}
            className={`px-5 py-1.5 rounded-full text-[13px] font-semibold transition-colors ${
              value.exactDates ? "bg-hover-slate text-snow-off-glacier shadow-sm" : "text-white/60"
            }`}
          >
            Dates
          </button>
          <button
            type="button"
            onClick={() => onChange({ ...value, exactDates: false })}
            className={`px-5 py-1.5 rounded-full text-[13px] font-semibold transition-colors ${
              !value.exactDates ? "bg-hover-slate text-snow-off-glacier shadow-sm" : "text-white/60"
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
                    onClick={() => setViewMonth(addMonths(viewMonth, -1))}
                    className="w-7 h-7 rounded-full hover:bg-white/10 flex items-center justify-center text-white"
                    aria-label="Previous month"
                  >
                    <span className="material-symbols-outlined text-[18px]">chevron_left</span>
                  </button>
                ) : (
                  <span className="w-7 h-7" />
                )}
                <p className="text-[14px] font-semibold text-snow-off-glacier">{monthLabel(month)}</p>
                {offset === 1 ? (
                  <button
                    type="button"
                    onClick={() => setViewMonth(addMonths(viewMonth, 1))}
                    className="w-7 h-7 rounded-full hover:bg-white/10 flex items-center justify-center text-white"
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
                  <div key={i} className="text-[11px] text-on-light-tertiary font-medium pb-2">
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
                          ? "text-white/20 cursor-not-allowed"
                          : isEdge
                            ? "bg-accent text-white rounded-full font-semibold"
                            : inR
                              ? "bg-accent/20 text-white"
                              : "hover:bg-white/10 rounded-full text-white"
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

      {!value.exactDates && (
        <div className="flex items-center justify-center gap-2 mt-6 flex-wrap">
          <button
            type="button"
            onClick={() => onChange({ ...value, flexDays: 0 })}
            className={`px-4 py-1.5 rounded-full text-[12px] font-medium border transition-colors ${
              value.flexDays === 0
                ? "border-snow-off-glacier bg-snow-off-glacier text-tinted-pitch"
                : "border-white/20 text-white hover:border-white/60"
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
                  ? "border-snow-off-glacier bg-snow-off-glacier text-tinted-pitch"
                  : "border-white/20 text-white hover:border-white/60"
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
}: {
  value: SearchValue;
  onChange: (n: SearchValue) => void;
}) {
  const rows: { key: keyof SearchValue; label: string; sub: string; min?: number }[] = [
    { key: "adults", label: "Adults", sub: "Ages 13 or above" },
    { key: "children", label: "Children", sub: "Ages 2 – 12" },
    { key: "infants", label: "Infants", sub: "Under 2" },
    { key: "pets", label: "Pets", sub: "Bringing a service animal?" },
  ];

  return (
    <PopoverShell align="right" width="380px" className="p-2">
      <div className="px-4 py-2 divide-y divide-white/10">
        {rows.map((row) => {
          const v = value[row.key] as number;
          return (
            <div key={row.key} className="py-4 flex items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="text-[15px] font-semibold text-white">{row.label}</p>
                <p className="text-[12px] text-white/55">{row.sub}</p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <button
                  type="button"
                  disabled={v <= 0}
                  onClick={() => onChange({ ...value, [row.key]: Math.max(0, v - 1) })}
                  className="w-8 h-8 rounded-full border border-white/25 text-white hover:border-white disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
                  aria-label={`Decrease ${row.label}`}
                >
                  <span className="material-symbols-outlined text-[16px]">remove</span>
                </button>
                <span className="text-[14px] text-white w-5 text-center tabular-nums">{v}</span>
                <button
                  type="button"
                  onClick={() => onChange({ ...value, [row.key]: v + 1 })}
                  className="w-8 h-8 rounded-full border border-white/25 text-white hover:border-white flex items-center justify-center transition-colors"
                  aria-label={`Increase ${row.label}`}
                >
                  <span className="material-symbols-outlined text-[16px]">add</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </PopoverShell>
  );
}

function WhatPopover({
  value,
  onChange,
}: {
  value: SearchValue;
  onChange: (n: SearchValue) => void;
}) {
  return (
    <PopoverShell align="right" width="430px" className="p-4">
      <textarea
        autoFocus
        value={value.description}
        onChange={(e) => onChange({ ...value, description: e.target.value })}
        placeholder="Tell Walter what kind of trip. He'll handle the logistics."
        rows={4}
        className="w-full text-[14px] text-white placeholder:text-white/40 bg-transparent border border-white/15 rounded-[14px] p-3 focus:outline-none focus:border-white/50 resize-none"
      />
      <p className="text-[11px] text-white/55 mt-4 mb-2 px-1 font-medium">
        Suggested descriptions
      </p>
      <div className="space-y-1">
        {SUGGESTED_DESCRIPTIONS.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => onChange({ ...value, description: s })}
            className="w-full flex items-center gap-3 px-2 py-2 rounded-[12px] hover:bg-white/5 transition-colors text-left"
          >
            <span className="w-9 h-9 rounded-full border border-white/15 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-white text-[18px]">search</span>
            </span>
            <span className="text-[13px] text-white leading-snug">{s}</span>
          </button>
        ))}
      </div>
    </PopoverShell>
  );
}
