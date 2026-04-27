"use client";

import SearchCore from "./SearchCore";
import type { Category, SearchState } from "./searchTypes";

interface Props {
  initial?: Partial<SearchState>;
  onCategoryChange: (c: Category) => void;
  onRefine: (state: SearchState) => void;
}

export default function InlineSearch({ initial, onCategoryChange, onRefine }: Props) {
  return (
    <div className="w-full px-4 lg:px-8 py-3">
      <SearchCore
        initial={initial}
        onSubmit={onRefine}
        onCategoryChange={onCategoryChange}
        size="md"
      />
    </div>
  );
}
