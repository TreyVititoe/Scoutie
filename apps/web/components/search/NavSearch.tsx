"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import SearchCore from "./SearchCore";
import { useSearchBar } from "./useSearchBar";
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
  const { state } = useSearchBar();
  const [forcedOpen, setForcedOpen] = useState(false);
  const expandedRef = useRef<HTMLDivElement>(null);

  // Click outside the expanded bar collapses it back to the pill.
  useEffect(() => {
    if (!forcedOpen) return;
    const handler = (e: MouseEvent) => {
      if (!expandedRef.current?.contains(e.target as Node)) {
        setForcedOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [forcedOpen]);

  // Expanded above the fold on the homepage; collapsed elsewhere or once
  // the user has scrolled past the hero.
  const collapsed = !forcedOpen && (pathname !== "/" || scrollY > 80);

  const onSubmit = (s: SearchState) => {
    if (pathname === "/results" && onInPageSubmit) {
      onInPageSubmit(s);
    } else {
      router.push(`/results?tab=${s.category}`);
    }
  };

  if (collapsed) {
    const wherePill = state.where || "Anywhere";
    const whenPill = state.startDate
      ? state.endDate
        ? `${state.startDate} – ${state.endDate}`
        : state.startDate
      : "Any week";
    const total = state.adults + state.children + state.infants;
    const whoPill = total === 0 ? "Add guests" : total === 1 ? "1 guest" : `${total} guests`;

    return (
      <button
        type="button"
        onClick={() => setForcedOpen(true)}
        className="flex items-center gap-3 bg-white/15 hover:bg-white/25 border border-white/20 text-white rounded-full pl-4 pr-2 py-1.5 transition-colors"
      >
        <span className="text-[12px] font-semibold">{wherePill}</span>
        <span className="w-px h-4 bg-white/25" />
        <span className="text-[12px] font-semibold">{whenPill}</span>
        <span className="w-px h-4 bg-white/25" />
        <span className="text-[12px] text-white/70">{whoPill}</span>
        <span className="bg-accent rounded-full w-7 h-7 flex items-center justify-center">
          <span className="material-symbols-outlined text-[16px]">search</span>
        </span>
      </button>
    );
  }

  return (
    <motion.div ref={expandedRef} layout className="w-full">
      <SearchCore onSubmit={onSubmit} size="md" />
    </motion.div>
  );
}
