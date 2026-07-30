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
