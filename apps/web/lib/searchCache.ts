/*
 * Short-TTL in-memory cache for provider searches (flights, hotels,
 * events). Identical searches within the window -- refreshes, shared
 * trips, back-and-forth navigation -- reuse the result instead of
 * re-billing SerpAPI/RapidAPI/Ticketmaster. Per serverless instance.
 */

type Entry = { value: unknown; expiresAt: number };
const cache = new Map<string, Entry>();
const MAX_ENTRIES = 500;
const DEFAULT_TTL_MS = 60 * 60 * 1000;

export function cacheKey(name: string, params: Record<string, unknown>): string {
  return `${name}:${JSON.stringify(params, Object.keys(params).sort())}`;
}

export function cacheGet<T>(key: string): T | null {
  const entry = cache.get(key);
  if (!entry) return null;
  if (entry.expiresAt < Date.now()) {
    cache.delete(key);
    return null;
  }
  return entry.value as T;
}

export function cacheSet(key: string, value: unknown, ttlMs = DEFAULT_TTL_MS) {
  if (cache.size >= MAX_ENTRIES) {
    const oldest = cache.keys().next().value;
    if (oldest) cache.delete(oldest);
  }
  cache.set(key, { value, expiresAt: Date.now() + ttlMs });
}
