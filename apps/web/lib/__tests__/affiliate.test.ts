import { describe, expect, it } from "vitest";
import { affiliateUrl, lookupUrl, providerLabel } from "../affiliate";
import type { CartItem } from "../stores/tripCartStore";

function item(overrides: Partial<CartItem>): CartItem {
  return {
    id: "i1",
    type: "hotel",
    title: "Test Hotel",
    subtitle: "",
    price: 100,
    image: null,
    bookingUrl: null,
    provider: null,
    date: null,
    meta: {},
    ...overrides,
  };
}

describe("providerLabel", () => {
  it("prefers the item's own provider", () => {
    expect(providerLabel(item({ provider: "Booking.com" }))).toBe(
      "Booking.com"
    );
  });

  it("falls back by type", () => {
    expect(providerLabel(item({ type: "flight" }))).toBe("Google Flights");
    expect(providerLabel(item({ type: "event" }))).toBe("Ticketmaster");
    expect(providerLabel(item({ type: "activity" }))).toBe("the web");
  });
});

describe("affiliateUrl", () => {
  it("returns null without a booking URL", () => {
    expect(affiliateUrl(item({ bookingUrl: null }))).toBeNull();
  });

  it("passes non-affiliate URLs through untouched when no tags are set", () => {
    const url = "https://www.booking.com/hotel/pt/test.html";
    expect(affiliateUrl(item({ bookingUrl: url }))).toBe(url);
  });
});

describe("lookupUrl", () => {
  it("builds a search URL from title and destination", () => {
    const url = lookupUrl(item({ title: "Miradouro walk" }), "Lisbon");
    expect(url).toContain("google.com/search");
    expect(url).toContain("Miradouro%20walk%20Lisbon");
  });
});
