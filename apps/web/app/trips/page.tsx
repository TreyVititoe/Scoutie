"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { getDestinationImage } from "@/lib/destinationImages";
import { CURATED_TRIPS, type CuratedTrip } from "@/lib/curatedTrips";

const EASE = [0.2, 0.8, 0.2, 1] as const;

/** Tier labels in Walter voice. API returns budget / balanced / premium. */
const TIER_LABELS: Record<string, string> = {
  budget: "Essential",
  balanced: "Signature",
  premium: "Grand",
};

type Prefs = {
  destination?: string;
  destinations?: string[];
  surpriseMe?: boolean;
  startDate?: string;
  endDate?: string;
  description?: string;
  budget?: number;
  budgetAmount?: number;
  tripDurationDays?: number;
  activityInterests?: string[];
  vibes?: string[];
};

type ApiTrip = {
  tier?: string;
  title?: string;
  summary?: string;
  destination?: string;
  totalEstimatedCost?: number;
  days?: unknown[];
  topEvents?: string[];
  highlights?: string[];
};

type TripOption = {
  id: string;
  title: string;
  destination: string;
  days: number;
  estTotal: number;
  summary: string;
  tier: string;
  image: string;
  why: string;
  /** Suggested items for the trip: events first, then highlights. */
  list: string[];
};

function prefDays(prefs: Prefs): number {
  if (prefs.startDate && prefs.endDate) {
    const diff = Math.round(
      (new Date(prefs.endDate).getTime() - new Date(prefs.startDate).getTime()) /
        (1000 * 60 * 60 * 24)
    );
    if (diff > 0) return diff;
  }
  return prefs.tripDurationDays || 7;
}

function formatDay(iso: string): string {
  return new Date(`${iso}T00:00:00`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function prefInterests(prefs: Prefs): string[] {
  if (prefs.activityInterests?.length) return prefs.activityInterests;
  if (prefs.vibes?.length) return prefs.vibes;
  return [];
}

/** One line that echoes what the user typed: budget, dates, interests. */
function whyItFits(prefs: Prefs, estTotal: number, days: number): string {
  const budget = prefs.budgetAmount || prefs.budget || 0;
  const parts: string[] = [];

  if (budget > 0 && estTotal > 0) {
    parts.push(
      estTotal <= budget
        ? `$${estTotal.toLocaleString()} against your $${budget.toLocaleString()}`
        : `runs past your $${budget.toLocaleString()} if you want the upgrade`
    );
  }

  if (prefs.startDate && prefs.endDate) {
    parts.push(`fits your ${formatDay(prefs.startDate)} to ${formatDay(prefs.endDate)} window`);
  } else {
    parts.push(`${days} days, paced right`);
  }

  const interests = prefInterests(prefs);
  if (interests.length > 0) {
    parts.push(`leans into ${interests.slice(0, 2).join(" and ")}`);
  } else if (prefs.description?.trim()) {
    const d = prefs.description.trim();
    parts.push(`built around "${d.length > 48 ? `${d.slice(0, 48)}...` : d}"`);
  }

  const line = parts.join(", ");
  return line ? `${line.charAt(0).toUpperCase()}${line.slice(1)}.` : "Walter's call.";
}

/** Score a curated trip against the user's prefs for the silent fallback. */
function scoreCurated(trip: CuratedTrip, prefs: Prefs): number {
  let score = 0;

  const wanted = (prefs.destinations?.[0] || prefs.destination || "").toLowerCase().trim();
  const dest = trip.destination.toLowerCase();
  if (wanted && wanted !== "surprise me") {
    if (dest.includes(wanted) || wanted.includes(dest)) {
      score += 50;
    } else {
      const tokens = wanted.split(/[\s,]+/).filter((t) => t.length > 3);
      if (tokens.some((t) => dest.includes(t))) score += 30;
    }
  }

  const budget = prefs.budgetAmount || prefs.budget || 0;
  if (budget > 0) {
    if (trip.totalCost <= budget) {
      score += 20 + 10 * (trip.totalCost / budget);
    } else {
      score -= Math.min(25, (25 * (trip.totalCost - budget)) / budget);
    }
  }

  const haystack = `${trip.title} ${trip.description} ${trip.category}`.toLowerCase();
  const terms = [
    ...prefInterests(prefs).map((t) => t.toLowerCase()),
    ...(prefs.description || "").toLowerCase().split(/[\s,.]+/).filter((w) => w.length > 3),
  ];
  let hits = 0;
  for (const term of new Set(terms)) {
    if (haystack.includes(term)) hits++;
  }
  score += Math.min(24, hits * 8);

  score += Math.max(0, 10 - 2 * Math.abs(trip.durationDays - prefDays(prefs)));
  return score;
}

function curatedFallback(prefs: Prefs): TripOption[] {
  return [...CURATED_TRIPS]
    .map((trip) => ({ trip, score: scoreCurated(trip, prefs) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(({ trip }) => ({
      id: trip.id,
      title: trip.title,
      destination: trip.destination,
      days: trip.durationDays,
      estTotal: trip.totalCost,
      summary: trip.description,
      tier: trip.tier || "Walter's pick",
      image:
        trip.image ||
        `/api/photo?query=${encodeURIComponent(trip.photoQuery || trip.destination)}`,
      why: whyItFits(prefs, trip.totalCost, trip.durationDays),
      list: [],
    }));
}

function apiTripToOption(trip: ApiTrip, index: number, prefs: Prefs): TripOption {
  const destination = trip.destination || "";
  const days = Array.isArray(trip.days) && trip.days.length > 0 ? trip.days.length : prefDays(prefs);
  const estTotal = trip.totalEstimatedCost || 0;
  const tierKey = (trip.tier || "").toLowerCase();
  return {
    id: `generated-${tierKey || index}-${Date.now()}`,
    title: trip.title || destination,
    destination,
    days,
    estTotal,
    summary: trip.summary || "",
    tier: TIER_LABELS[tierKey] || trip.tier || "Signature",
    image: `/api/photo?query=${encodeURIComponent(destination)}`,
    why: whyItFits(prefs, estTotal, days),
    list: [...new Set([...(trip.topEvents || []), ...(trip.highlights || [])])].slice(0, 4),
  };
}

export default function TripsPage() {
  const router = useRouter();
  const [prefs, setPrefs] = useState<Prefs | null>(null);
  const [missing, setMissing] = useState(false);
  const [options, setOptions] = useState<TripOption[] | null>(null);

  // Friendly redirect when there is no search to work from.
  useEffect(() => {
    if (!missing) return;
    const t = setTimeout(() => router.push("/"), 2000);
    return () => clearTimeout(t);
  }, [missing, router]);

  useEffect(() => {
    const stored = localStorage.getItem("walter_prefs");
    let parsed: Prefs | null = null;
    try {
      parsed = stored ? (JSON.parse(stored) as Prefs) : null;
    } catch {
      parsed = null;
    }
    if (!parsed) {
      setMissing(true);
      return;
    }
    setPrefs(parsed);

    let cancelled = false;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 90_000);

    fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(parsed),
      signal: controller.signal,
    })
      .then((res) => {
        if (!res.ok) throw new Error(`generate ${res.status}`);
        return res.json();
      })
      .then((data: { trips?: ApiTrip[]; error?: string }) => {
        if (cancelled) return;
        const usable = (data?.trips || []).filter(
          (t) =>
            t &&
            typeof t.title === "string" &&
            t.title.length > 0 &&
            typeof t.destination === "string" &&
            t.destination.length > 0 &&
            typeof t.totalEstimatedCost === "number" &&
            t.totalEstimatedCost > 0
        );
        if (data?.error || usable.length < 3) throw new Error("unusable response");
        setOptions(usable.slice(0, 3).map((t, i) => apiTripToOption(t, i, parsed as Prefs)));
      })
      .catch(() => {
        // Silent fallback: score the curated trips against the prefs.
        if (!cancelled) setOptions(curatedFallback(parsed as Prefs));
      })
      .finally(() => clearTimeout(timer));

    return () => {
      cancelled = true;
      controller.abort();
      clearTimeout(timer);
    };
  }, []);

  const choose = (opt: TripOption) => {
    localStorage.setItem(
      "walter_trip",
      JSON.stringify({
        id: opt.id,
        title: opt.title,
        destination: opt.destination,
        days: opt.days,
        estTotal: opt.estTotal,
        summary: opt.summary,
        tier: opt.tier,
      })
    );
    // Keep prefs pointed at the chosen destination so downstream pages agree.
    try {
      const stored = JSON.parse(localStorage.getItem("walter_prefs") || "{}");
      stored.destination = opt.destination;
      stored.destinations = [opt.destination];
      localStorage.setItem("walter_prefs", JSON.stringify(stored));
    } catch {
      // prefs stay as they were; the query param still carries the destination
    }
    router.push(`/results?destination=${encodeURIComponent(opt.destination)}`);
  };

  if (missing) {
    return (
      <div className="min-h-screen bg-paper flex flex-col items-center justify-center px-6 text-center">
        <span className="material-symbols-outlined text-accent text-[40px] mb-4">travel_explore</span>
        <h1 className="text-ink text-[24px] font-semibold tracking-tight mb-2">
          Walter needs a search first.
        </h1>
        <p className="text-ink-soft text-[14px] mb-6 max-w-[40ch]">
          Tell him where, when, and what kind of trip. Taking you back to start.
        </p>
        <Link
          href="/"
          className="bg-accent text-snow-off-glacier text-[14px] font-semibold px-5 py-2.5 rounded-pill hover:bg-accent-dark transition-colors"
        >
          Back to the search
        </Link>
      </div>
    );
  }

  const loading = options === null;
  const destinationLabel =
    prefs?.destinations?.[0] || prefs?.destination || "your trip";

  return (
    <div className="min-h-screen bg-paper">
      <header className="sticky top-0 z-50 nav-glass">
        <div className="max-w-6xl mx-auto px-5 lg:px-8 py-3.5 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 shrink-0">
            <img src="/walter-logo.png" alt="" className="w-7 h-7 rounded-[8px]" />
            <span className="text-ink text-[16px] font-semibold tracking-tight">Walter</span>
          </Link>
          <Link
            href="/"
            className="text-ink-soft hover:text-ink text-label font-medium px-3.5 py-1.5 rounded-pill hover:bg-ink/5 transition-colors flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            Edit search
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-5 lg:px-8 pt-14 pb-24">
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: EASE }}
          className="text-accent text-[11px] uppercase tracking-[2.5px] font-semibold mb-3"
        >
          {prefs?.surpriseMe ? "Surprise brief" : destinationLabel}
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05, duration: 0.6, ease: EASE }}
          className="text-ink text-[32px] sm:text-[42px] font-semibold tracking-display leading-[1.05] mb-3"
        >
          {prefs?.surpriseMe
            ? "Walter picked three places for you."
            : "Walter found three ways to do this."}
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.6, ease: EASE }}
          className="text-ink-soft text-body sm:text-[16px] mb-12 max-w-[55ch]"
        >
          Same brief, three cuts. Pick one and Walter builds it out.
        </motion.p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {loading
            ? [0, 1, 2].map((i) => <SkeletonCard key={i} index={i} />)
            : options.map((opt, i) => (
                <TripCard key={opt.id} option={opt} index={i} onChoose={choose} />
              ))}
        </div>
      </main>
    </div>
  );
}

function SkeletonCard({ index }: { index: number }) {
  return (
    <div
      className="card-base overflow-hidden animate-pulse"
      style={{ animationDelay: `${index * 150}ms` }}
    >
      <div className="aspect-[4/3] bg-raised-slate" />
      <div className="p-5 space-y-3">
        <div className="h-3 w-20 bg-raised-slate rounded-pill" />
        <div className="h-5 w-3/4 bg-raised-slate rounded-pill" />
        <div className="h-3.5 w-full bg-raised-slate rounded-pill" />
        <div className="h-3.5 w-2/3 bg-raised-slate rounded-pill" />
        <div className="pt-3 border-t border-line">
          <div className="h-3.5 w-5/6 bg-raised-slate rounded-pill" />
        </div>
      </div>
    </div>
  );
}

function TripCard({
  option,
  index,
  onChoose,
}: {
  option: TripOption;
  index: number;
  onChoose: (opt: TripOption) => void;
}) {
  return (
    <motion.button
      type="button"
      onClick={() => onChoose(option)}
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.08 * index, duration: 0.5, ease: EASE }}
      className="card-base overflow-hidden text-left group flex flex-col"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-raised-slate">
        <img
          src={option.image}
          alt={option.destination}
          loading={index === 0 ? "eager" : "lazy"}
          onError={(e) => {
            e.currentTarget.src = getDestinationImage(option.destination);
          }}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-tinted-pitch/60 to-transparent pointer-events-none" />
        <span className="absolute top-3 left-3 bg-tinted-pitch/85 backdrop-blur-sm text-reykjavik-sky rounded-pill px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide border border-white/10">
          {option.tier}
        </span>
        <span className="absolute bottom-3 left-3 text-snow-off-glacier text-label font-semibold drop-shadow">
          {option.destination}
        </span>
      </div>

      <div className="p-5 flex flex-col flex-1">
        <h2 className="text-ink text-[18px] font-semibold leading-card-title">
          {option.title}
        </h2>
        {option.summary && (
          <p className="text-ink-soft text-label mt-1.5 line-clamp-2 leading-snug">
            {option.summary}
          </p>
        )}

        {option.list.length > 0 && (
          <div className="mt-3">
            <p className="text-ink-faint text-[10px] font-semibold uppercase tracking-widest mb-1.5">
              On the list
            </p>
            {option.list.map((item) => (
              <div key={item} className="flex items-start gap-1.5 py-0.5">
                <span className="material-symbols-outlined text-accent text-[14px] mt-px">
                  arrow_forward
                </span>
                <p className="text-ink-soft text-[12.5px] leading-snug">{item}</p>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-baseline gap-3 mt-3 mb-4">
          <span className="text-ink text-title font-semibold tabular-nums">
            ${option.estTotal.toLocaleString()}
          </span>
          <span className="text-ink-faint text-[12px]">{option.days} days, all in</span>
        </div>

        <div className="mt-auto pt-4 border-t border-line flex items-start gap-2">
          <span className="material-symbols-outlined text-accent text-title mt-px">
            check_circle
          </span>
          <p className="text-ink-soft text-[12.5px] leading-snug">{option.why}</p>
        </div>
      </div>
    </motion.button>
  );
}
