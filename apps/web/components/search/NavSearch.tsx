"use client";

import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { motion } from "framer-motion";
import SearchCore from "./SearchCore";
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
  const [forcedOpen, setForcedOpen] = useState(false);

  // Expanded above the fold on the homepage; collapsed elsewhere or once
  // the user has scrolled past the hero.
  const collapsed =
    !forcedOpen && (pathname !== "/" || scrollY > 80);

  const onSubmit = (state: SearchState) => {
    if (pathname === "/results" && onInPageSubmit) {
      onInPageSubmit(state);
    } else {
      router.push(`/results?tab=${state.category}`);
    }
  };

  if (collapsed) {
    return (
      <button
        type="button"
        onClick={() => setForcedOpen(true)}
        className="flex items-center gap-3 bg-white/15 hover:bg-white/25 border border-white/20 text-white rounded-full pl-4 pr-2 py-1.5 transition-colors"
      >
        <span className="text-[12px] font-semibold">Anywhere</span>
        <span className="w-px h-4 bg-white/25" />
        <span className="text-[12px] font-semibold">Any week</span>
        <span className="w-px h-4 bg-white/25" />
        <span className="text-[12px] text-white/70">Add guests</span>
        <span className="bg-accent rounded-full w-7 h-7 flex items-center justify-center">
          <span className="material-symbols-outlined text-[16px]">search</span>
        </span>
      </button>
    );
  }

  return (
    <motion.div layout className="w-full">
      <SearchCore onSubmit={onSubmit} size="md" />
    </motion.div>
  );
}
