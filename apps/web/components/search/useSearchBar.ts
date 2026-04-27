"use client";

import { useCallback, useEffect, useState } from "react";
import type { Category, SearchState } from "./searchTypes";

const PREFS_KEY = "walter_prefs";

const EMPTY: SearchState = {
  category: "flights",
  where: "",
  whereOrigin: "",
  startDate: null,
  endDate: null,
  flexibleDates: false,
  adults: 0,
  children: 0,
  infants: 0,
  cabin: undefined,
  vibe: [],
  interests: [],
};

function readPrefs(): Partial<SearchState> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    if (!raw) return {};
    const p = JSON.parse(raw);
    const adults = Math.max(
      0,
      (p.travelersCount ?? 0) - (p.childrenCount ?? 0) - (p.infantsCount ?? 0),
    );
    return {
      where: p.destinations?.[0] ?? "",
      whereOrigin: p.departureCity ?? "",
      startDate: p.startDate ?? null,
      endDate: p.endDate ?? null,
      flexibleDates: !!p.flexibleDates,
      adults,
      children: p.childrenCount ?? 0,
      infants: p.infantsCount ?? 0,
      cabin: p.flightClass,
      vibe: p.activityInterests ?? [],
      interests: p.activityInterests ?? [],
    };
  } catch {
    return {};
  }
}

export function useSearchBar(initial?: Partial<SearchState>) {
  const [state, setState] = useState<SearchState>({
    ...EMPTY,
    ...readPrefs(),
    ...initial,
  });

  // Re-hydrate once on mount in case server-rendered state was empty.
  useEffect(() => {
    setState((s) => ({ ...s, ...readPrefs(), ...initial }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setField = useCallback(
    <K extends keyof SearchState>(key: K, value: SearchState[K]) => {
      setState((s) => ({ ...s, [key]: value }));
    },
    [],
  );

  const setCategory = useCallback((c: Category) => {
    setState((s) => ({ ...s, category: c }));
  }, []);

  const reset = useCallback(() => setState(EMPTY), []);

  const toPrefs = useCallback(() => {
    const existing =
      typeof window !== "undefined" ? localStorage.getItem(PREFS_KEY) : null;
    const base = existing ? JSON.parse(existing) : {};
    const interests =
      state.category === "events" ? state.interests : state.vibe;
    return {
      ...base,
      destinations: state.where ? [state.where] : base.destinations ?? [],
      departureCity: state.whereOrigin ?? base.departureCity ?? "",
      startDate: state.startDate,
      endDate: state.endDate,
      flexibleDates: state.flexibleDates,
      travelersCount: state.adults + state.children + state.infants,
      childrenCount: state.children,
      infantsCount: state.infants,
      flightClass: state.cabin ?? base.flightClass ?? "economy",
      activityInterests:
        interests && interests.length > 0
          ? interests
          : base.activityInterests ?? [],
    };
  }, [state]);

  const persist = useCallback(() => {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(PREFS_KEY, JSON.stringify(toPrefs()));
    } catch {
      // localStorage unavailable — keep in-memory state, no error UI per spec.
    }
  }, [toPrefs]);

  return { state, setField, setCategory, reset, toPrefs, persist };
}
