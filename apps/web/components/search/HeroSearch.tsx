"use client";

import { useRouter } from "next/navigation";
import SearchCore from "./SearchCore";
import { useSearchBar } from "./useSearchBar";
import type { SearchState } from "./searchTypes";

export default function HeroSearch() {
  const router = useRouter();
  const { persist } = useSearchBar();

  const onSubmit = (state: SearchState) => {
    // SearchCore already calls persist() before invoking onSubmit, but call it
    // again here so the latest in-memory state is on disk before navigation.
    persist();
    router.push(`/results?tab=${state.category}`);
  };

  return (
    <div className="w-full">
      <SearchCore onSubmit={onSubmit} size="lg" />
    </div>
  );
}
