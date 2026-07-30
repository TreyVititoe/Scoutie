/*
 * Helpers for reading walter_prefs, which the entry flows fill in
 * inconsistently.
 */

/** The user's interest tags, wherever the entry flow happened to put them.
 *
 * Must not be written as `activityInterests || vibes`: an empty array is
 * truthy, so a flow that sets `activityInterests: []` and puts the real tags
 * in `vibes` (which /quick and /clarify both do) silently loses every tag.
 * Length is the only safe test. */
export function prefInterests(prefs: {
  activityInterests?: unknown;
  vibes?: unknown;
}): string[] {
  const activity = prefs.activityInterests;
  if (Array.isArray(activity) && activity.length) return activity as string[];
  const vibes = prefs.vibes;
  if (Array.isArray(vibes) && vibes.length) return vibes as string[];
  return [];
}

/** Merge updates into the stored walter_prefs instead of replacing them.
 *
 * Loading a saved trip used to write `{destination}` over the whole object,
 * throwing away dates, travelers, and departure city -- so /results had
 * nothing left to search with. */
export function mergePrefs(updates: Record<string, unknown>): void {
  let current: Record<string, unknown> = {};
  try {
    const stored = localStorage.getItem("walter_prefs");
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed && typeof parsed === "object") current = parsed;
    }
  } catch {
    /* corrupt prefs are replaced, not inherited */
  }
  localStorage.setItem("walter_prefs", JSON.stringify({ ...current, ...updates }));
}

/** Stored prefs are loosely shaped -- each entry flow writes a different
 *  subset, and callers index them freely. Deliberately permissive so reading
 *  them stays as ergonomic as the bare JSON.parse it replaced. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type StoredPrefs = Record<string, any>;

/** Read and JSON-parse a localStorage key, returning `fallback` on anything
 *  unexpected.
 *
 *  Bare JSON.parse on stored state throws on corrupt or truncated data and
 *  takes the whole page into the error boundary -- a blank screen for what
 *  should be a recoverable "start over". */
export function readStored<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return (parsed ?? fallback) as T;
  } catch {
    return fallback;
  }
}
