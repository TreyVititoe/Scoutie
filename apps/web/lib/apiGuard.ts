import { NextRequest, NextResponse } from "next/server";
import { Redis } from "@upstash/redis";

/*
 * Per-IP fixed-window rate limiter for the paid API routes (Claude,
 * SerpAPI, RapidAPI, Ticketmaster). Counters live in Upstash Redis
 * (KV_REST_API_URL/KV_REST_API_TOKEN, injected by the Vercel Upstash
 * integration) so limits hold across serverless instances and cold
 * starts. When those vars are absent -- local dev, CI -- it falls back
 * to the old in-memory Map, and it also falls back per-request if Redis
 * errors, so a Redis outage can never take the API down.
 */

const redis =
  process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN
    ? new Redis({
        url: process.env.KV_REST_API_URL,
        token: process.env.KV_REST_API_TOKEN,
      })
    : null;

type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();
const MAX_BUCKETS = 5000;

function clientIp(req: NextRequest): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "anon";
}

function tooMany(retryAfterSec: number): NextResponse {
  return NextResponse.json(
    { error: "Too many requests. Give Walter a minute." },
    {
      status: 429,
      headers: { "Retry-After": String(Math.max(1, retryAfterSec)) },
    }
  );
}

async function redisRateLimit(
  client: Redis,
  key: string,
  limit: number,
  windowMs: number
): Promise<NextResponse | null> {
  const pipeline = client.pipeline();
  pipeline.incr(key);
  // NX: only set the expiry when the key has none, i.e. the window's
  // first request. Pipelined, so this stays one round trip.
  pipeline.pexpire(key, windowMs, "NX");
  pipeline.pttl(key);
  const [count, , ttlMs] = await pipeline.exec<[number, number, number]>();

  if (count <= limit) return null;
  const retryMs = ttlMs > 0 ? ttlMs : windowMs;
  return tooMany(Math.ceil(retryMs / 1000));
}

function memoryRateLimit(
  key: string,
  limit: number,
  windowMs: number
): NextResponse | null {
  const now = Date.now();

  if (buckets.size > MAX_BUCKETS) {
    for (const [k, b] of buckets) {
      if (b.resetAt < now) buckets.delete(k);
    }
  }

  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return null;
  }

  bucket.count += 1;
  if (bucket.count <= limit) return null;
  return tooMany(Math.ceil((bucket.resetAt - now) / 1000));
}

export async function rateLimit(
  req: NextRequest,
  opts: { name: string; limit: number; windowMs?: number }
): Promise<NextResponse | null> {
  const windowMs = opts.windowMs ?? 10 * 60 * 1000;
  const key = `${opts.name}:${clientIp(req)}`;

  if (redis) {
    try {
      return await redisRateLimit(redis, `rl:${key}`, opts.limit, windowMs);
    } catch (err) {
      console.error("rateLimit: redis unavailable, using memory", err);
    }
  }
  return memoryRateLimit(key, opts.limit, windowMs);
}

/* ── Input clamps ── */

const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

/** Valid YYYY-MM-DD between 30 days ago and ~18 months out. */
export function isReasonableDate(value: unknown): value is string {
  if (typeof value !== "string" || !ISO_DATE_RE.test(value)) return false;
  const t = Date.parse(value);
  if (Number.isNaN(t)) return false;
  const now = Date.now();
  return t > now - 30 * 86400_000 && t < now + 550 * 86400_000;
}

export function clampInt(
  value: unknown,
  min: number,
  max: number,
  fallback: number
): number {
  const n = typeof value === "number" ? value : parseInt(String(value), 10);
  if (Number.isNaN(n)) return fallback;
  return Math.min(max, Math.max(min, Math.trunc(n)));
}

/** Trimmed string capped at maxLen, or null when empty/not a string. */
export function cleanString(value: unknown, maxLen: number): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  return trimmed.slice(0, maxLen);
}

export function cleanStringArray(
  value: unknown,
  maxItems: number,
  maxLen: number
): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((v): v is string => typeof v === "string" && v.trim().length > 0)
    .slice(0, maxItems)
    .map((v) => v.trim().slice(0, maxLen));
}

/** Parse a JSON body with a size cap (default 16KB) for pass-through payloads. */
export async function readJsonCapped(
  req: NextRequest,
  maxBytes = 16 * 1024
): Promise<{ body: unknown } | { errorResponse: NextResponse }> {
  const text = await req.text();
  if (text.length > maxBytes) {
    return {
      errorResponse: NextResponse.json(
        { error: "Request too large" },
        { status: 413 }
      ),
    };
  }
  try {
    return { body: JSON.parse(text) };
  } catch {
    return {
      errorResponse: NextResponse.json(
        { error: "Invalid JSON" },
        { status: 400 }
      ),
    };
  }
}
