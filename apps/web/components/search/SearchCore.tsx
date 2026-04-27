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
