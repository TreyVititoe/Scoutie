"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useTripCartStore } from "@/lib/stores/tripCartStore";
import { getDestinationImage } from "@/lib/destinationImages";
import { SearchBar, type SearchValue } from "@/components/quiz/SearchBar";
import { formatYMD } from "@/lib/dates";
import {
  CURATED_TRIPS,
  CATEGORY_LABELS,
  CATEGORY_TAGLINES,
  CATEGORY_ORDER,
  type CuratedTrip,
  type TripCategory,
} from "@/lib/curatedTrips";

type CommunityTrip = {
  id: string;
  title: string;
  destination: string;
  total_estimated_cost: number;
  cover_image_url: string | null;
  upvote_count: number;
  share_slug: string;
  tier: string | null;
};

const NAV_LINKS: { href: string; label: string; icon?: string }[] = [
  { href: "/quick", label: "Quick plan", icon: "bolt" },
  { href: "/explore", label: "Explore" },
  { href: "/saved", label: "Saved" },
  { href: "/dashboard", label: "Trips" },
];

function NavLink({
  href,
  label,
  icon,
  active,
  onClick,
}: {
  href: string;
  label: string;
  icon?: string;
  active: boolean;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`text-[16px] font-semibold px-4 py-2 rounded-pill transition-colors flex items-center gap-1.5 ${
        active
          ? "bg-ink/10 text-ink"
          : "text-ink-soft hover:text-ink hover:bg-ink/5"
      }`}
    >
      {icon && (
        <span className="material-symbols-outlined text-[18px] text-accent">{icon}</span>
      )}
      {label}
    </Link>
  );
}

export default function LandingPage() {
  const router = useRouter();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  /* At the top the nav sits on the hero frost with no chrome of its own;
   * scrolled past it, the pill gets its glass back. */
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  const [search, setSearch] = useState<SearchValue>({
    destination: "",
    startDate: "",
    endDate: "",
    exactDates: true,
    flexDays: 0,
    adults: 0,
    children: 0,
    infants: 0,
    pets: 0,
    description: "",
  });
  const [trips, setTrips] = useState<CommunityTrip[]>([]);
  const [tripsLoading, setTripsLoading] = useState(true);

  // Prefill from /explore cards: /?destination=Tokyo
  useEffect(() => {
    const dest = new URLSearchParams(window.location.search).get("destination");
    if (dest) setSearch((s) => ({ ...s, destination: dest }));
  }, []);

  /* "Edit trip" entry point: /?edit=1 restores the current trip facts from
   * walter_prefs and opens the search UI so the traveler adjusts instead of
   * retyping. */
  const [editOpen, setEditOpen] = useState(false);
  useEffect(() => {
    if (!new URLSearchParams(window.location.search).get("edit")) return;
    try {
      const raw = localStorage.getItem("walter_prefs");
      if (raw) {
        const p = JSON.parse(raw) as Record<string, unknown>;
        setSearch((s) => ({
          ...s,
          destination:
            (typeof p.destination === "string" && p.destination) ||
            (Array.isArray(p.destinations) && typeof p.destinations[0] === "string"
              ? p.destinations[0]
              : "") ||
            "",
          startDate: typeof p.startDate === "string" ? p.startDate : "",
          endDate: typeof p.endDate === "string" ? p.endDate : "",
          exactDates: p.exactDates !== false,
          flexDays: typeof p.flexDays === "number" ? p.flexDays : 0,
          adults: typeof p.adults === "number" ? p.adults : s.adults,
          children: typeof p.children === "number" ? p.children : s.children,
          infants: typeof p.infants === "number" ? p.infants : s.infants,
          pets: typeof p.pets === "number" ? p.pets : s.pets,
          description: typeof p.description === "string" ? p.description : "",
        }));
      }
    } catch {
      /* unreadable prefs: open the search empty rather than not at all */
    }
    setEditOpen(true);
  }, []);

  useEffect(() => {
    fetch("/api/trips/community")
      .then((r) => r.json())
      .then((d) => {
        setTrips(d.trips || []);
        setTripsLoading(false);
      })
      .catch(() => setTripsLoading(false));
  }, []);


  const handleSearch = (v: SearchValue) => {
    // SearchBar only calls this with a valid, normalized value: destination
    // present, half-picked date ranges completed, guests defaulted to 2 adults.
    useTripCartStore.getState().clearCart();
    localStorage.removeItem("walter_trip"); // fresh journey, no stale chosen trip

    const tripDurationDays =
      v.startDate && v.endDate
        ? Math.max(
            1,
            Math.round(
              (new Date(v.endDate).getTime() - new Date(v.startDate).getTime()) / 86400000
            )
          )
        : undefined;

    localStorage.setItem(
      "walter_prefs",
      JSON.stringify({
        destinations: v.destination ? [v.destination] : [],
        destination: v.destination,
        surpriseMe: !v.destination,
        startDate: v.startDate,
        endDate: v.endDate,
        exactDates: v.exactDates,
        flexDays: v.flexDays,
        ...(tripDurationDays ? { tripDurationDays } : {}),
        description: v.description,
        adults: v.adults,
        children: v.children,
        infants: v.infants,
        pets: v.pets,
        travelers: v.adults + v.children,
        budget: 2000,
        budgetAmount: 2000,
        activityInterests: [],
        vibes: [],
      })
    );

    // A complete brief (place + dates) goes straight to building the
    // trip; the three-options page is only for open questions.
    const complete = Boolean(v.destination.trim() && v.startDate);
    router.push(complete ? "/results" : "/trips");
  };

  return (
    <div className="min-h-screen bg-page-bg">
      {/* Floating liquid-glass header */}
      <header className="fixed top-0 left-0 right-0 z-50 pointer-events-none">
        <div className="max-w-[1320px] mx-auto px-4 sm:px-8 pt-3">
          <div
            className={`pointer-events-auto flex items-center justify-between gap-6 px-5 sm:px-6 py-2.5 rounded-pill transition-all duration-300 ${
              scrolled
                ? "bg-[oklch(0.99_0.004_250_/_0.72)] backdrop-blur-2xl backdrop-saturate-150 border border-black/5 shadow-[0_8px_32px_rgba(20,30,60,0.12),inset_0_1px_0_rgba(255,255,255,0.6)]"
                : "bg-transparent border border-transparent shadow-none"
            }`}
          >
            <Link href="/" className="flex items-center gap-2.5 shrink-0">
              <img src="/walter-logo.png" alt="" className="w-7 h-7 rounded-[8px]" />
              <span className="text-ink text-[16px] font-semibold tracking-tight">Walter</span>
            </Link>

            {/* At rest the links spread across the glass; once scrolling
                they gather to the right like a compact toolbar. */}
            <nav
              className={`hidden md:flex items-center transition-all duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)] ${
                scrolled ? "grow-0 justify-end gap-1" : "grow justify-evenly gap-0"
              }`}
            >
              {NAV_LINKS.map((l) => (
                <motion.div
                  key={l.href}
                  layout
                  transition={{ duration: 0.55, ease: [0.2, 0.8, 0.2, 1] }}
                >
                  <NavLink
                    href={l.href}
                    label={l.label}
                    icon={l.icon}
                    active={pathname === l.href}
                  />
                </motion.div>
              ))}
            </nav>

            <button
              type="button"
              aria-label="Open menu"
              onClick={() => setMobileOpen((v) => !v)}
              className="md:hidden w-9 h-9 rounded-full hover:bg-ink/5 flex items-center justify-center text-ink transition-colors"
            >
              <span className="material-symbols-outlined text-[22px]">
                {mobileOpen ? "close" : "menu"}
              </span>
            </button>
          </div>

          <AnimatePresence>
            {mobileOpen && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.16, ease: "easeOut" }}
                className="pointer-events-auto md:hidden mt-2 rounded-[20px] bg-[oklch(0.99_0.004_250_/_0.95)] backdrop-blur-2xl backdrop-saturate-150 border border-black/5 shadow-[0_8px_32px_rgba(20,30,60,0.12)] px-4 py-3 flex flex-col gap-1"
              >
                {NAV_LINKS.map((l) => (
                  <NavLink
                    key={l.href}
                    href={l.href}
                    label={l.label}
                    icon={l.icon}
                    active={pathname === l.href}
                    onClick={() => setMobileOpen(false)}
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </header>

      {/* Hero: plain daylight field. The cornflower radial is the only
          color up here; photography lives in the trip cards below. */}
      <section className="relative z-40">
        <div className="hero-radial bg-page-bg relative overflow-hidden pt-32 sm:pt-40 pb-24 sm:pb-28">
          {/* Quiet decoration: a dashed flight path arcing under the type,
              and thin waypoint rings drifting on the existing float cycle.
              Whisper opacity, no fills; they stay wallpaper. */}
          <div
            aria-hidden
            className="absolute inset-0 pointer-events-none select-none"
          >
            <svg
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-[46%] w-[1100px] max-w-none"
              viewBox="0 0 1100 420"
              fill="none"
            >
              <path
                d="M40 330 C 320 120, 780 90, 1052 206"
                stroke="oklch(0.65 0.135 263 / 0.22)"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeDasharray="1 12"
              />
              <circle cx="40" cy="330" r="3.5" fill="oklch(0.65 0.135 263 / 0.35)" />
              <circle cx="40" cy="330" r="9" stroke="oklch(0.65 0.135 263 / 0.18)" />
              <g transform="translate(1056 208) rotate(23)">
                <path
                  d="M0 0 L-17 6.5 L-5 0 L-17 -6.5 Z"
                  fill="oklch(0.65 0.135 263 / 0.4)"
                />
              </g>
            </svg>
            <div className="absolute right-[7%] top-[16%] w-40 h-40 rounded-full border border-accent/15 float-anim hidden sm:block" />
            <div className="absolute right-[13%] top-[30%] w-14 h-14 rounded-full border border-accent/10 float-anim-2 hidden sm:block" />
            <div className="absolute left-[9%] bottom-[14%] w-24 h-24 rounded-full border border-[oklch(0.78_0.13_230_/_0.16)] float-anim-1 hidden md:block" />
          </div>
          <div className="relative flex flex-col items-center text-center px-5">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05, duration: 0.7, ease: [0.2, 0.8, 0.2, 1] }}
              className="font-serif text-ink text-[38px] sm:text-[56px] font-semibold leading-[1.05] tracking-tight max-w-[16ch]"
            >
              Where will your trip take you?
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.12, duration: 0.6, ease: [0.2, 0.8, 0.2, 1] }}
              className="text-ink-soft text-body sm:text-title max-w-[48ch] mt-4"
            >
              Walter is your travel companion that plans complete trips
              around your interests, schedule, and travel style.
            </motion.p>
          </div>
        </div>
      </section>

      {/* SearchBar: overlaps the hero frame, then sticks under the navbar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.18, duration: 0.6, ease: [0.2, 0.8, 0.2, 1] }}
        className="sticky top-[80px] z-[45] -mt-[52px]"
      >
        <div className="max-w-6xl mx-auto px-5 sm:px-12">
          <SearchBar value={search} onChange={setSearch} onSearch={handleSearch} autoOpen={editOpen} />
        </div>
      </motion.div>

      {/* Curated trips grouped by category */}
      <section className="bg-page-bg pb-16 pt-16 relative z-0">
        {CATEGORY_ORDER.map((cat, idx) => {
          const tripsInCat = CURATED_TRIPS.filter((t) => t.category === cat);
          if (tripsInCat.length === 0) return null;
          return (
            <div key={cat} className={idx === 0 ? "" : "mt-9"}>
              <div className="px-5 sm:px-8 mb-5 flex items-end justify-between gap-4 flex-wrap">
                <div>
                  <h2 className="text-[22px] sm:text-[28px] font-semibold text-ink tracking-display leading-[1.05]">
                    {CATEGORY_LABELS[cat]}
                  </h2>
                  <p className="text-ink-faint text-label mt-1.5">
                    {CATEGORY_TAGLINES[cat]}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-4 sm:gap-5 px-5 sm:px-8">
                {tripsInCat.map((trip) => (
                  <CuratedTripCard key={trip.id} trip={trip} router={router} />
                ))}
              </div>
            </div>
          );
        })}

        {/* Community trips, only if any */}
        {!tripsLoading && trips.length > 0 && (
          <div className="mt-9">
            <div className="px-5 sm:px-8 mb-5">
              <h2 className="text-[22px] sm:text-[28px] font-semibold text-ink tracking-display leading-[1.05]">
                Trips from the community
              </h2>
              <p className="text-ink-faint text-label mt-1.5">
                Built by other travelers, public for anyone to fork.
              </p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-4 sm:gap-5 px-5 sm:px-8">
              {[...trips]
                .sort((a, b) => b.upvote_count - a.upvote_count)
                .slice(0, 14)
                .map((trip) => (
                  <Link
                    key={trip.id}
                    href={`/shared/${trip.share_slug}`}
                    className="card-base overflow-hidden block group"
                  >
                    <div className="relative aspect-[4/3] overflow-hidden">
                      <img
                        src={trip.cover_image_url || getDestinationImage(trip.destination)}
                        alt={trip.destination}
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      {trip.tier && (
                        <span className="absolute top-3 left-3 bg-tinted-pitch/85 backdrop-blur-sm text-reykjavik-sky rounded-pill px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide border border-white/10">
                          {trip.tier}
                        </span>
                      )}
                    </div>
                    <div className="p-3">
                      <p className="font-semibold text-[14px] text-ink leading-tight truncate">
                        {trip.destination}
                      </p>
                      <p className="text-ink-soft text-[12px] mt-1 line-clamp-2 leading-snug min-h-[30px]">
                        {trip.title}
                      </p>
                      <div className="mt-2">
                        <div className="flex items-baseline gap-1.5">
                          <span className="font-semibold text-ink text-label">
                            ${trip.total_estimated_cost.toLocaleString()}
                          </span>
                          <span className="text-ink-faint text-[10.5px]">per person</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

function CuratedTripCard({
  trip,
  router,
}: {
  trip: CuratedTrip;
  router: ReturnType<typeof useRouter>;
}) {
  const handleClick = () => {
    // Pre-fill walter_prefs with this curated trip's facts, then route the
    // user through the clarify quiz (travelers + accommodation + departure).
    const now = new Date();
    const start = new Date(now);
    start.setDate(start.getDate() + 21); // default: in 3 weeks
    const end = new Date(start);
    end.setDate(end.getDate() + trip.durationDays);
    const fmt = formatYMD;

    useTripCartStore.getState().clearCart();
    localStorage.removeItem("walter_trip"); // fresh journey, no stale chosen trip
    localStorage.setItem(
      "walter_prefs",
      JSON.stringify({
        destinations: [trip.destination],
        destination: trip.destination,
        surpriseMe: false,
        startDate: fmt(start),
        endDate: fmt(end),
        exactDates: false,
        flexDays: 7,
        description: trip.description,
        tripDurationDays: trip.durationDays,
        budget: trip.totalCost,
        budgetAmount: trip.totalCost,
        activityInterests: [],
        vibes: [],
      })
    );
    router.push("/clarify");
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="card-base overflow-hidden block group text-left"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-raised-slate">
        <img
          src={trip.image || `/api/photo?query=${encodeURIComponent(trip.photoQuery || trip.destination)}`}
          alt={trip.destination}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {trip.tier && (
          <span className="absolute top-3 left-3 bg-tinted-pitch/85 backdrop-blur-sm text-reykjavik-sky rounded-pill px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide border border-white/10">
            {trip.tier}
          </span>
        )}
      </div>
      <div className="p-3">
        <p className="font-semibold text-[14px] text-ink leading-tight truncate">
          {trip.destination}
        </p>
        <p className="text-ink-soft text-[12px] mt-1 line-clamp-2 leading-snug min-h-[30px]">
          {trip.title}
        </p>
        <div className="mt-2">
          <div className="flex items-baseline gap-1.5">
            <span className="font-semibold text-ink text-label">
              ${trip.totalCost.toLocaleString()}
            </span>
            <span className="text-ink-faint text-[10.5px]">
              per person
            </span>
          </div>
          <p className="text-ink-faint text-[10px] mt-0.5">
            {trip.durationDays} days, all in
          </p>
        </div>
      </div>
    </button>
  );
}
