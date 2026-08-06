import { NextRequest, NextResponse } from "next/server";
import { getDestinationImage } from "@/lib/destinationImages";
import { rateLimit } from "@/lib/apiGuard";

/**
 * GET /api/photo?query=<destination>
 *
 * Returns a 302 redirect to a verified Unsplash photo tagged with the query.
 * Cached in-memory per process and via CDN headers (24h) so we don't burn
 * Unsplash quota. When the Unsplash search is unavailable (no key, rate limit,
 * no result) we fall back to the curated per-destination photo map rather than
 * one generic image, so cards stay place-specific.
 */

/* Bounded and FIFO-evicted. An unbounded forever-Map keyed on a
 * caller-supplied string is a slow memory leak that anyone can drive. */
const CACHE_MAX = 500;
const MAX_QUERY = 120;
const cache = new Map<string, string>();

function cacheSetBounded(key: string, value: string) {
  if (cache.size >= CACHE_MAX) {
    const oldest = cache.keys().next().value;
    if (oldest !== undefined) cache.delete(oldest);
  }
  cache.set(key, value);
}

async function searchUnsplash(query: string): Promise<string | null> {
  const key = process.env.UNSPLASH_ACCESS_KEY;
  if (!key) {
    console.warn("[/api/photo] UNSPLASH_ACCESS_KEY not set");
    return null;
  }

  const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(
    query
  )}&orientation=landscape&content_filter=high&per_page=1&order_by=relevant`;

  try {
    const resp = await fetch(url, {
      headers: { Authorization: `Client-ID ${key}` },
      signal: AbortSignal.timeout(6000),
      // Next.js server-side fetch is cached by default; we want it stale-fresh.
      next: { revalidate: 60 * 60 * 24 }, // 24h
    });
    if (!resp.ok) {
      console.warn(`[/api/photo] unsplash ${resp.status} for "${query}"`);
      return null;
    }
    const data: {
      results?: Array<{ urls?: { regular?: string; full?: string } }>;
    } = await resp.json();
    const first = data.results?.[0];
    return first?.urls?.regular || first?.urls?.full || null;
  } catch (err) {
    console.warn(`[/api/photo] fetch error for "${query}"`, err);
    return null;
  }
}

export async function GET(req: NextRequest) {
  const limited = await rateLimit(req, { name: "photo", limit: 300 });
  if (limited) return limited;

  const raw = req.nextUrl.searchParams.get("query")?.trim();
  if (!raw) {
    return new NextResponse("missing query", { status: 400 });
  }
  // Capped before it becomes a cache key or an upstream query string.
  const query = raw.slice(0, MAX_QUERY);

  const normalized = query.toLowerCase();

  let photoUrl = cache.get(normalized) || null;
  if (!photoUrl) {
    photoUrl = await searchUnsplash(query);
    if (photoUrl) cacheSetBounded(normalized, photoUrl);
  }

  const finalUrl = photoUrl || getDestinationImage(query);

  return NextResponse.redirect(finalUrl, {
    status: 302,
    headers: {
      // CDN can cache the redirect for 24h, browsers for 1h.
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  });
}
