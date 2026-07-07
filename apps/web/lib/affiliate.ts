import type { CartItem } from "@/lib/stores/tripCartStore";

/*
 * Affiliate tags are env-driven so approved program IDs drop in without
 * code changes; until then links pass through untagged.
 *
 * NEXT_PUBLIC_BOOKING_AFFILIATE_ID  - Booking.com Partner "aid" value
 * NEXT_PUBLIC_TM_IMPACT_URL         - Impact wrapper prefix for Ticketmaster,
 *                                     e.g. https://ticketmaster.evyy.net/c/<acct>/<campaign>/4272
 */
const BOOKING_AID = process.env.NEXT_PUBLIC_BOOKING_AFFILIATE_ID;
const TM_IMPACT_URL = process.env.NEXT_PUBLIC_TM_IMPACT_URL;

export function providerLabel(
  item: Pick<CartItem, "type" | "provider">
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

export function affiliateUrl(item: CartItem): string | null {
  const raw = item.bookingUrl;
  if (!raw) return null;

  try {
    if (item.type === "hotel" && BOOKING_AID && raw.includes("booking.com")) {
      const url = new URL(raw);
      url.searchParams.set("aid", BOOKING_AID);
      return url.toString();
    }
    if (item.type === "event" && TM_IMPACT_URL) {
      return `${TM_IMPACT_URL}?u=${encodeURIComponent(raw)}`;
    }
  } catch {
    return raw;
  }
  return raw;
}

/* For cart items with no booking URL (AI suggestions like a free viewpoint
 * or a neighborhood walk): hand off to a search instead of a dead button. */
export function lookupUrl(item: CartItem, destination: string): string {
  const q = encodeURIComponent(`${item.title} ${destination}`.trim());
  return `https://www.google.com/search?q=${q}`;
}

/**
 * Track an affiliate click and open the destination URL.
 */
export function trackAndOpen({
  tripId,
  provider,
  itemType,
  destinationUrl,
}: {
  tripId?: string;
  provider: string;
  itemType?: string;
  destinationUrl: string;
}) {
  // Fire-and-forget tracking
  fetch("/api/affiliate/click", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ tripId, provider, itemType, destinationUrl }),
  }).catch(() => {});

  // Open in new tab
  window.open(destinationUrl, "_blank", "noopener,noreferrer");
}
