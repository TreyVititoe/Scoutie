"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useTripCartStore } from "@/lib/stores/tripCartStore";
import { getDestinationImage } from "@/lib/destinationImages";
import { SearchBar, type SearchValue } from "@/components/quiz/SearchBar";
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
      className={`text-[15px] font-medium px-4 py-2 rounded-pill transition-colors flex items-center gap-1.5 ${
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
        destinations: [v.destination],
        destination: v.destination,
        surpriseMe: false,
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

    // Skip /trips: the Where/When/Who/What search goes straight to /results,
    // which renders from walter_prefs (no chosen trip needed).
    router.push("/results");
  };

  return (
    <div className="min-h-screen bg-page-bg">
      {/* Floating liquid-glass header */}
      <header className="fixed top-0 left-0 right-0 z-50 pointer-events-none">
        <div className="max-w-6xl mx-auto px-3 sm:px-6 pt-3">
          <div className="pointer-events-auto flex items-center justify-between gap-6 px-5 sm:px-6 py-2.5 rounded-pill bg-[oklch(0.99_0.004_250_/_0.72)] backdrop-blur-2xl backdrop-saturate-150 border border-black/5 shadow-[0_8px_32px_rgba(20,30,60,0.12),inset_0_1px_0_rgba(255,255,255,0.6)]">
            <Link href="/" className="flex items-center gap-2.5 shrink-0">
              <span className="w-7 h-7 rounded-[8px] bg-gradient-to-br from-cyan to-accent-light flex items-center justify-center shadow-[0_2px_10px_rgba(56,189,248,0.3)]">
                <span className="text-[oklch(0.28_0.005_250)] text-[14px] font-black italic leading-none -mt-px">W</span>
              </span>
              <span className="text-ink text-[17px] font-semibold tracking-tight">Walter</span>
            </Link>

            <nav className="hidden md:flex items-center gap-1">
              {NAV_LINKS.map((l) => (
                <NavLink
                  key={l.href}
                  href={l.href}
                  label={l.label}
                  icon={l.icon}
                  active={pathname === l.href}
                />
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

      {/* Hero with full-bleed photograph (The Field Cinematographer Rule) */}
      <section className="relative z-40 h-[380px] sm:h-[420px] flex flex-col">
        {/* Image + overlays clipped, kept separate so SearchBar popovers can escape */}
        <div className="absolute inset-0 overflow-hidden">
          <img
            src="/new_walter_hero.jpg"
            alt="Walter travel hero"
            className="absolute inset-0 w-full h-full object-cover object-[center_37.5%]"
            fetchPriority="high"
          />
          {/* Top scrim: light touch now that the nav is a bright pill */}
          <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-tinted-pitch/35 to-transparent pointer-events-none" />
          {/* Legibility scrim: darken the photo behind the headline + subtitle */}
          <div className="absolute inset-x-0 bottom-0 h-full bg-gradient-to-t from-tinted-pitch/80 via-tinted-pitch/40 to-transparent pointer-events-none" />
          {/* Very bottom: soft dissolve into the white page */}
          <div className="absolute inset-x-0 bottom-0 h-[90px] bg-gradient-to-t from-page-bg to-transparent pointer-events-none" />
          <div className="absolute inset-0 hero-radial opacity-25 pointer-events-none" />
        </div>

        <div className="relative z-10 flex-1 flex flex-col justify-end max-w-7xl w-full mx-auto px-8 sm:px-14 pt-20 pb-8 [text-shadow:0_1px_3px_rgba(0,0,0,0.55),0_2px_22px_rgba(0,0,0,0.6)]">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05, duration: 0.7, ease: [0.2, 0.8, 0.2, 1] }}
            className="text-white text-[52px] sm:text-[76px] font-semibold tracking-display leading-[1.02] mb-3 max-w-[20ch]"
          >
            Where to next?
          </motion.h1>
          <div className="flex items-end justify-between gap-6 mb-32">
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.12, duration: 0.6, ease: [0.2, 0.8, 0.2, 1] }}
              className="text-white text-[18px] sm:text-[22px] max-w-[44ch]"
            >
              Tell Walter the basics, or fork a trip others have built.
            </motion.p>
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.18, duration: 0.6, ease: [0.2, 0.8, 0.2, 1] }}
              className="shrink-0 text-white text-[14px] sm:text-[16px] uppercase tracking-[2.5px] font-semibold flex items-center gap-1.5"
            >
              <span
                className="material-symbols-outlined text-[18px] sm:text-[19px] text-emerald-400"
                style={{ fontVariationSettings: "'FILL' 1, 'wght' 500" }}
              >
                location_on
              </span>
              Mount Egmont, Taranaki, New Zealand
            </motion.p>
          </div>
        </div>
      </section>

      {/* SearchBar: sticks just below the navbar as the user scrolls.
          Negative top margin pulls it up to overlap the bottom of the hero
          so on initial load it appears as part of the hero composition. */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.18, duration: 0.6, ease: [0.2, 0.8, 0.2, 1] }}
        className="sticky top-[80px] z-[45] -mt-[110px]"
      >
        <div className="max-w-6xl mx-auto px-5 sm:px-12">
          <SearchBar value={search} onChange={setSearch} onSearch={handleSearch} />
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
                  <p className="text-ink-faint text-[13px] mt-1.5">
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
              <p className="text-ink-faint text-[13px] mt-1.5">
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
                          <span className="font-semibold text-ink text-[13px]">
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
    const fmt = (d: Date) => d.toISOString().split("T")[0];

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
            <span className="font-semibold text-ink text-[13px]">
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
