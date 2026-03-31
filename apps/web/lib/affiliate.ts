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
