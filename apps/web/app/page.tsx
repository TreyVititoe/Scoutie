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
  { href: "/map", label: "Map", icon: "map" },
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
  light = false,
}: {
  href: string;
  label: string;
  icon?: string;
  active: boolean;
  onClick?: () => void;
  /* Over the dark hero the links render white; on glass they render ink. */
  light?: boolean;
}) {
  const rest = light
    ? "text-white hover:text-white hover:bg-white/10"
    : "text-ink hover:text-ink hover:bg-ink/5";
  const activeCls = light ? "bg-white/15 text-white" : "bg-ink/10 text-ink";
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`text-[17px] font-bold px-4 py-2 rounded-pill transition-colors flex items-center gap-1.5 ${
        active ? activeCls : rest
      }`}
    >
      {icon && (
        <span
          className={`material-symbols-outlined text-[20px] ${light ? "text-[#8FB3F5]" : "text-accent"}`}
        >
          {icon}
        </span>
      )}
      {label}
    </Link>
  );
}

/* One card per category, floated in the hero as a preview of the product. */
const HERO_CARDS: CuratedTrip[] = CATEGORY_ORDER.map((cat) =>
  CURATED_TRIPS.find((t) => t.category === cat)
)
  .filter((t): t is CuratedTrip => Boolean(t))
  .slice(0, 2);

/* Decorative sample facts so the floating cards read like the real,
 * data-heavy proposals Walter sends back in chat. */
const HERO_CARD_FACTS = [
  { when: "Mar 5 to Mar 11 · 6 nights", who: "2 travelers", vibes: ["beach", "food"] },
  { when: "Sep 12 to Sep 19 · 7 nights", who: "4 travelers", vibes: ["culture", "outdoors"] },
];

function HeroFloatCard({
  trip,
  facts,
  rotate,
}: {
  trip: CuratedTrip;
  facts: (typeof HERO_CARD_FACTS)[number];
  rotate: string;
}) {
  return (
    <div
      className={`${rotate} w-[260px] overflow-hidden rounded-3xl bg-white shadow-[0_30px_70px_-20px_rgba(0,0,0,0.65)] ring-1 ring-white/25`}
    >
      <div className="relative h-32">
        {/* eslint-disable-next-line @next/next/no-img-element -- /api/photo 302s to the provider */}
        <img
          src={
            trip.image ||
            `/api/photo?query=${encodeURIComponent(trip.photoQuery || trip.destination)}`
          }
          alt=""
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[rgba(10,14,24,0.85)] via-transparent to-transparent" />
        <div className="absolute inset-x-0 bottom-0 px-4 pb-2.5">
          <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-white/80">
            Your trip is ready
          </p>
          <p className="truncate text-[18px] font-bold tracking-tight text-white">
            {trip.destination.split(",")[0]}
          </p>
        </div>
      </div>
      <div className="space-y-1 px-4 py-3 text-[12px]">
        <p className="text-[#141926]">
          <span className="mr-2 font-semibold text-[#5A6072]">When</span>
          <span className="font-medium">{facts.when}</span>
        </p>
        <p className="text-[#141926]">
          <span className="mr-2 font-semibold text-[#5A6072]">Who</span>
          <span className="font-medium">{facts.who}</span>
        </p>
        <p className="text-[#141926]">
          <span className="mr-2 font-semibold text-[#5A6072]">Budget</span>
          <span className="font-medium">
            ${trip.totalCost.toLocaleString()} for the group
          </span>
        </p>
        <div className="flex flex-wrap gap-1.5 pt-1.5">
          {facts.vibes.map((v) => (
            <span
              key={v}
              className="rounded-full bg-[#EFF1F5] px-2.5 py-1 text-[10px] font-semibold capitalize text-[#141926]"
            >
              {v}
            </span>
          ))}
        </div>
      </div>
      <div className="px-3 pb-3">
        <div className="rounded-full bg-accent py-2.5 text-center text-[12px] font-bold text-white">
          Open live flights and stays
        </div>
      </div>
    </div>
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
              <img src="/walter-logo.png" alt="" className="w-8 h-8 rounded-[9px]" />
              <span
                className={`text-[18px] font-bold tracking-tight transition-colors ${scrolled ? "text-ink" : "text-white"}`}
              >
                Walter
              </span>
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
                    light={!scrolled}
                  />
                </motion.div>
              ))}
            </nav>

            <button
              type="button"
              aria-label="Open menu"
              onClick={() => setMobileOpen((v) => !v)}
              className={`md:hidden w-9 h-9 rounded-full flex items-center justify-center transition-colors ${
                scrolled
                  ? "text-ink hover:bg-ink/5"
                  : "text-white hover:bg-white/10"
              }`}
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
        {/* Extra bottom padding so the rounded trips shelf overlaps navy,
            not the white page behind the hero's end */}
        <div className="relative overflow-hidden bg-[#0C182E] pt-32 sm:pt-40 pb-44 sm:pb-52">
          {/* Dark-blue textured field: layered radials, grain, and a faint
              dot grid. Photography floats on top as real trip cards. */}
          <div aria-hidden className="absolute inset-0 pointer-events-none select-none">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(91,141,239,0.28),transparent_60%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_12%_110%,rgba(38,74,158,0.35),transparent_65%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_45%_at_88%_100%,rgba(102,213,241,0.12),transparent_60%)]" />
            <div
              className="absolute inset-0 opacity-[0.22]"
              style={{
                backgroundImage:
                  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='140' height='140' filter='url(%23n)' opacity='0.45'/%3E%3C/svg%3E\")",
              }}
            />
            <div
              className="absolute inset-0 opacity-[0.14]"
              style={{
                backgroundImage:
                  "radial-gradient(rgba(255,255,255,0.5) 1px, transparent 1px)",
                backgroundSize: "26px 26px",
              }}
            />
          </div>

          {/* Floating trip cards: the elaborate proposals Walter sends back
              in chat, drifting on either side of the headline */}
          <div aria-hidden className="absolute inset-0 pointer-events-none select-none hidden lg:block">
            <div className="hero-drift-a absolute left-[3%] top-[28%]">
              <HeroFloatCard
                trip={HERO_CARDS[0]}
                facts={HERO_CARD_FACTS[0]}
                rotate="-rotate-6"
              />
            </div>
            <div className="hero-drift-b absolute right-[3%] top-[12%]" style={{ animationDelay: "-7s" }}>
              <HeroFloatCard
                trip={HERO_CARDS[1]}
                facts={HERO_CARD_FACTS[1]}
                rotate="rotate-6"
              />
            </div>
          </div>

          <div className="relative flex flex-col items-center text-center px-5">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05, duration: 0.7, ease: [0.2, 0.8, 0.2, 1] }}
              className="font-serif text-white text-[38px] sm:text-[56px] font-semibold leading-[1.05] tracking-tight max-w-[16ch]"
            >
              Where will your trip take you?
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.12, duration: 0.6, ease: [0.2, 0.8, 0.2, 1] }}
              className="text-white/70 text-body sm:text-title max-w-[48ch] mt-4"
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
        className="sticky top-[80px] z-[45] -mt-[110px] md:-mt-[150px]"
      >
        <div className="max-w-6xl mx-auto px-5 sm:px-12">
          <SearchBar value={search} onChange={setSearch} onSearch={handleSearch} autoOpen={editOpen} />
        </div>
      </motion.div>

      {/* Curated trips grouped by category */}
      {/* The trips shelf rides up over the dark hero like a massive card */}
      {/* Pulled up just far enough that its rounded top edge cuts through
          the middle of the search bar — the bar straddles navy and white */}
      <section className="bg-page-bg pb-16 pt-16 relative z-[41] -mt-7 md:-mt-10 rounded-t-[44px] shadow-[0_-18px_50px_-20px_rgba(0,0,0,0.45)]">
        {CATEGORY_ORDER.map((cat, idx) => {
          /* Six per section: a seventh card overflows the typical screen. */
          const tripsInCat = CURATED_TRIPS.filter((t) => t.category === cat).slice(0, 6);
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
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-6 gap-4 sm:gap-5 px-5 sm:px-8">
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
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-6 gap-4 sm:gap-5 px-5 sm:px-8">
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
                        <span className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm text-[#141926] rounded-pill px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide">
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
          <span className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm text-[#141926] rounded-pill px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide">
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
