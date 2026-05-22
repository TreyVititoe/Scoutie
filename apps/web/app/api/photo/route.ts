import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/photo?query=<destination>
 *
 * Returns a 302 redirect to a verified Unsplash photo tagged with the query.
 * Cached in-memory per process and via CDN headers (24h) so we don't burn
 * Unsplash quota. Falls back to a known-good landscape photo on any error.
 */

const FALLBACK_PHOTO =
  "https://images.unsplash.com/photo-1488085061387-422e29b40080?w=1600&q=85&auto=format&fit=crop";

const cache = new Map<string, string>();

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
  const query = req.nextUrl.searchParams.get("query")?.trim();
  if (!query) {
    return new NextResponse("missing query", { status: 400 });
  }

  const normalized = query.toLowerCase();

  let photoUrl = cache.get(normalized) || null;
  if (!photoUrl) {
    photoUrl = await searchUnsplash(query);
    if (photoUrl) cache.set(normalized, photoUrl);
  }

  const finalUrl = photoUrl || FALLBACK_PHOTO;

  return NextResponse.redirect(finalUrl, {
    status: 302,
    headers: {
      // CDN can cache the redirect for 24h, browsers for 1h.
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  });
}
