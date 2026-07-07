import { describe, expect, it } from "vitest";
import { NextRequest } from "next/server";
import {
  rateLimit,
  isReasonableDate,
  clampInt,
  cleanString,
  cleanStringArray,
} from "../apiGuard";

function reqFrom(ip: string) {
  return new NextRequest("http://localhost/api/test", {
    method: "POST",
    headers: { "x-forwarded-for": ip },
  });
}

describe("rateLimit", () => {
  it("allows requests under the limit and blocks over it", () => {
    const opts = { name: "test-a", limit: 3 };
    const req = reqFrom("10.0.0.1");
    expect(rateLimit(req, opts)).toBeNull();
    expect(rateLimit(req, opts)).toBeNull();
    expect(rateLimit(req, opts)).toBeNull();
    const blocked = rateLimit(req, opts);
    expect(blocked?.status).toBe(429);
    expect(blocked?.headers.get("Retry-After")).toBeTruthy();
  });

  it("tracks IPs independently", () => {
    const opts = { name: "test-b", limit: 1 };
    expect(rateLimit(reqFrom("10.0.0.2"), opts)).toBeNull();
    expect(rateLimit(reqFrom("10.0.0.3"), opts)).toBeNull();
    expect(rateLimit(reqFrom("10.0.0.2"), opts)?.status).toBe(429);
  });
});

describe("isReasonableDate", () => {
  it("accepts a near-future ISO date", () => {
    const d = new Date(Date.now() + 30 * 86400_000)
      .toISOString()
      .slice(0, 10);
    expect(isReasonableDate(d)).toBe(true);
  });

  it("rejects junk, ancient, and far-future values", () => {
    expect(isReasonableDate("not-a-date")).toBe(false);
    expect(isReasonableDate("1999-01-01")).toBe(false);
    expect(isReasonableDate("2099-01-01")).toBe(false);
    expect(isReasonableDate(12345)).toBe(false);
    expect(isReasonableDate(undefined)).toBe(false);
  });
});

describe("clamps", () => {
  it("clampInt bounds and falls back", () => {
    expect(clampInt(5, 1, 10, 1)).toBe(5);
    expect(clampInt(99, 1, 10, 1)).toBe(10);
    expect(clampInt(-3, 1, 10, 1)).toBe(1);
    expect(clampInt("junk", 1, 10, 2)).toBe(2);
  });

  it("cleanString trims, caps, and rejects non-strings", () => {
    expect(cleanString("  Lisbon  ", 80)).toBe("Lisbon");
    expect(cleanString("x".repeat(100), 10)).toHaveLength(10);
    expect(cleanString("", 10)).toBeNull();
    expect(cleanString({ evil: true }, 10)).toBeNull();
  });

  it("cleanStringArray filters and caps", () => {
    expect(cleanStringArray(["a", "", 42, "b"], 10, 5)).toEqual(["a", "b"]);
    expect(cleanStringArray(["a", "b", "c"], 2, 5)).toHaveLength(2);
    expect(cleanStringArray("nope", 2, 5)).toEqual([]);
  });
});
