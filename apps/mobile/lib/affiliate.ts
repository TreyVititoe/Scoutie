import { Alert, Linking } from "react-native";
import type { TripCartItem } from "@walter/shared";

import { api } from "./apiClient";

/*
 * Mirror of apps/web/lib/affiliate.ts. Tags are env-driven so approved
 * program IDs drop in without code changes; links pass through untagged
 * until then.
 */
const BOOKING_AID = process.env.EXPO_PUBLIC_BOOKING_AFFILIATE_ID;
const TM_IMPACT_URL = process.env.EXPO_PUBLIC_TM_IMPACT_URL;

export function providerLabel(
  item: Pick<TripCartItem, "type" | "provider">
): string {
  if (item.provider) return item.provider;
  switch (item.type) {
    case "flight":
      return "Google Flights";
    case "hotel":
      return "Booking.com";
    case "event":
      return "Ticketmaster";
    default:
      return "the web";
  }
}

export function affiliateUrl(item: TripCartItem): string | null {
  const raw = item.bookingUrl;
  if (!raw) return null;

  try {
    if (item.type === "hotel" && BOOKING_AID && raw.includes("booking.com")) {
      const url = new URL(raw);
      url.searchParams.set("aid", BOOKING_AID);
      return url.toString();
    }
    if (item.type === "event" && TM_IMPACT_URL) {
      const sep = TM_IMPACT_URL.includes("?") ? "&" : "?";
      return `${TM_IMPACT_URL}${sep}u=${encodeURIComponent(raw)}`;
    }
  } catch {
    return raw;
  }
  return raw;
}

/* Items with no booking URL (a viewpoint, a neighborhood walk) hand off
 * to a search instead of a dead button. */
export function lookupUrl(item: TripCartItem, destination: string): string {
  const q = encodeURIComponent(`${item.title} ${destination}`.trim());
  return `https://www.google.com/search?q=${q}`;
}

export function trackAndOpen(item: TripCartItem, destination: string) {
  const url = affiliateUrl(item) ?? lookupUrl(item, destination);
  api.affiliate.click({
    provider: providerLabel(item),
    itemType: item.type,
    destinationUrl: url,
  });
  Linking.openURL(url).catch(() => {
    Alert.alert(
      "Couldn't open the booking page",
      "Something blocked the link. Try again in a moment."
    );
  });
}
