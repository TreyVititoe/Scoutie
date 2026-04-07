import type { ScoutEvent, ScoredEvent } from "@/lib/types";
import { VIBE_TO_TM_KEYWORDS } from "./ticketmaster";

function daysBetween(dateStr: string, refStr: string): number {
  const d = new Date(dateStr).getTime();
  const r = new Date(refStr).getTime();
  return Math.abs((d - r) / (1000 * 60 * 60 * 24));
}

function proximityScore(eventDate: string, startDate: string, endDate: string): number {
  const start = new Date(startDate).getTime();
  const end = new Date(endDate).getTime();
  const ev = new Date(eventDate).getTime();
  if (ev >= start && ev <= end) return 1.0;
  const daysOut = Math.min(daysBetween(eventDate, startDate), daysBetween(eventDate, endDate));
  return Math.max(0, 1 - daysOut / 14);
}

function interestScore(event: ScoutEvent, vibes: string[], expandedInterests: string[]): number {
  const eventText = `${event.name} ${event.category}`.toLowerCase();
  let score = 0;

  for (const vibe of vibes) {
    const tms = VIBE_TO_TM_KEYWORDS[vibe.toLowerCase()] ?? [];
    if (tms.some((t) => eventText.includes(t.toLowerCase()))) score += 0.4;

    // Also check if the vibe word itself appears in the event text
    if (eventText.includes(vibe.toLowerCase())) score += 0.2;
  }

  for (const interest of expandedInterests) {
    if (eventText.includes(interest.toLowerCase())) score += 0.15;
  }

  return Math.min(score, 1.0);
}

function matchReason(event: ScoutEvent, vibes: string[], expandedInterests: string[]): string {
  const eventText = `${event.name} ${event.category}`.toLowerCase();

  for (const vibe of vibes) {
    const tms = VIBE_TO_TM_KEYWORDS[vibe.toLowerCase()] ?? [];
    if (tms.some((t) => eventText.includes(t.toLowerCase()))) {
      return `Matches your ${vibe} interest`;
    }
  }

  for (const interest of expandedInterests) {
    if (eventText.includes(interest.toLowerCase())) {
      return `Related to your interests`;
    }
  }

  return "Popular in this area";
}

export type ScoredBuckets = {
  exactMatches: ScoredEvent[];
  similarMatches: ScoredEvent[];
  topInArea: ScoredEvent[];
};

export function scoreAndBucket(
  events: ScoutEvent[],
  topAreaEvents: ScoutEvent[],
  vibes: string[],
  expandedInterests: string[],
  startDate: string,
  endDate: string
): ScoredBuckets {
  const scored: ScoredEvent[] = events.map((e) => {
    const interest = interestScore(e, vibes, expandedInterests);
    const proximity = proximityScore(e.date, startDate, endDate);
    const popularity = e.popularity / 100;

    const score = interest * 0.5 + proximity * 0.3 + popularity * 0.2;

    return {
      ...e,
      score,
      matchReason: matchReason(e, vibes, expandedInterests),
    };
  });

  scored.sort((a, b) => b.score - a.score);

  const exactMatches = scored.filter((e) => e.score >= 0.5).slice(0, 6);
  const similarMatches = scored.filter((e) => e.score >= 0.2 && e.score < 0.5).slice(0, 6);

  // topInArea: always populate — use general area events, exclude already shown
  const shownIds = new Set([...exactMatches, ...similarMatches].map((e) => e.id));
  const topInArea: ScoredEvent[] = topAreaEvents
    .filter((e) => !shownIds.has(e.id))
    .slice(0, 6)
    .map((e) => ({
      ...e,
      score: proximityScore(e.date, startDate, endDate) * 0.5 + e.popularity / 100 * 0.5,
      matchReason: "Popular in this area",
    }));

  return { exactMatches, similarMatches, topInArea };
}
