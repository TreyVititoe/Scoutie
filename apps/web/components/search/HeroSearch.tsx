"use client";

import { useRouter } from "next/navigation";
import SearchCore from "./SearchCore";
import type { SearchState } from "./searchTypes";

export default function HeroSearch() {
  const router = useRouter();

  const onSubmit = (state: SearchState) => {
    router.push(`/results?tab=${state.category}`);
  };

  return (
    <div className="w-full">
      <SearchCore onSubmit={onSubmit} size="lg" />
    </div>
  );
}
