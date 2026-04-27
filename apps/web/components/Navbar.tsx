"use client";

import Link from "next/link";
import NavSearch from "./search/NavSearch";
import { EXPANDING_SEARCH_ENABLED } from "@/lib/featureFlags";
import type { SearchState } from "./search/searchTypes";

interface Props {
  /** When set, NavSearch refines in-page instead of navigating. */
  onInPageSubmit?: (state: SearchState) => void;
  /** Hide the search bar on pages where it should not appear (e.g. quiz). */
  hideSearch?: boolean;
}

export default function Navbar({ onInPageSubmit, hideSearch = false }: Props) {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 nav-glass">
      <div className="max-w-content mx-auto px-6 h-[64px] flex items-center justify-between gap-6">
        <Link href="/" className="text-white text-[15px] font-semibold shrink-0">
          Walter
        </Link>

        <div className="flex-1 flex items-center justify-center">
          {EXPANDING_SEARCH_ENABLED && !hideSearch ? (
            <NavSearch onInPageSubmit={onInPageSubmit} />
          ) : (
            <div className="flex items-center gap-8">
              <Link href="/explore" className="text-white/80 text-[11px] hidden sm:block">
                Explore
              </Link>
              <Link href="/quiz" className="text-white/80 text-[11px] hidden sm:block">
                Plan a Trip
              </Link>
              <Link href="/saved" className="text-white/80 text-[11px] hidden sm:block">
                Saved Trips
              </Link>
            </div>
          )}
        </div>

        <Link
          href="/quiz"
          className="bg-white/15 border border-white/20 text-white rounded-pill px-4 py-1.5 text-[11px] font-semibold hover:bg-white/25 transition-colors shrink-0"
        >
          Get Started
        </Link>
      </div>
    </nav>
  );
}
