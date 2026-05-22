"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useQuizStore } from "@/lib/stores/quizStore";
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
        active ? "bg-white/15 text-snow-off-glacier" : "text-snow-off-glacier/85 hover:text-snow-off-glacier hover:bg-white/10"
      }`}
    >
      {icon && (
        <span className="material-symbols-outlined text-[18px] text-accent-light">{icon}</span>
      )}
      {label}
    </Link>
  );
}

export default function LandingPage() {
  const router = useRouter();
  const pathname = usePathname();
  const store = useQuizStore();
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

  useEffect(() => {
    fetch("/api/trips/community")
      .then((r) => r.json())
      .then((d) => {
        setTrips(d.trips || []);
        setTripsLoading(false);
      })
      .catch(() => setTripsLoading(false));
  }, []);

  void store;

  const handleSearch = () => {
    useTripCartStore.getState().clearCart();
    // Landing only collects three facts: Destination, Duration, Aspiration.
    // Travelers / accommodation / departure are collected on /clarify after trip pick.
    localStorage.setItem(
      "walter_prefs",
      JSON.stringify({
        destinations: search.destination ? [search.destination] : [],
        destination: search.destination || "Surprise me",
        surpriseMe: !search.destination,
        startDate: search.startDate,
        endDate: search.endDate,
        exactDates: search.exactDates,
        flexDays: search.flexDays,
        description: search.description,
        budget: 2000,
        budgetAmount: 2000,
        activityInterests: [],
        vibes: [],
      })
    );

    router.push("/compare");
  };

  return (
    <div className="min-h-screen bg-page-bg">
      {/* Floating liquid-glass header */}
      <header className="fixed top-0 left-0 right-0 z-50 pointer-events-none">
        <div className="max-w-6xl mx-auto px-3 sm:px-6 pt-3">
          <div className="pointer-events-auto flex items-center justify-between gap-6 px-5 sm:px-6 py-2.5 rounded-pill bg-tinted-pitch/40 backdrop-blur-2xl backdrop-saturate-150 border border-white/15 shadow-[0_8px_32px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.10)]">
            <Link href="/" className="flex items-center gap-2.5 shrink-0">
              <span className="w-7 h-7 rounded-[8px] bg-gradient-to-br from-cyan to-accent-light flex items-center justify-center shadow-[0_2px_10px_rgba(56,189,248,0.3)]">
                <span className="text-[oklch(0.12_0.008_250)] text-[14px] font-black italic leading-none -mt-px">W</span>
              </span>
              <span className="text-snow-off-glacier text-[17px] font-semibold tracking-tight">Walter</span>
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
              className="md:hidden w-9 h-9 rounded-full hover:bg-white/10 flex items-center justify-center text-snow-off-glacier transition-colors"
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
                className="pointer-events-auto md:hidden mt-2 rounded-[20px] bg-tinted-pitch/40 backdrop-blur-2xl backdrop-saturate-150 border border-white/15 shadow-[0_8px_32px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.10)] px-4 py-3 flex flex-col gap-1"
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
            src="https://images.unsplash.com/photo-1504829857797-ddff29c27927?w=2400&q=85&auto=format&fit=crop"
            alt="Reykjavík at low light"
            className="absolute inset-0 w-full h-full object-cover"
            fetchPriority="high"
          />
          {/* Top scrim: keeps nav legible over bright sky areas */}
          <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-tinted-pitch/70 to-transparent pointer-events-none" />
          {/* Bottom scrim: keeps hero text legible regardless of photo content */}
          <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-tinted-pitch via-tinted-pitch/85 to-transparent pointer-events-none" />
          <div className="absolute inset-0 hero-radial opacity-25 pointer-events-none" />
        </div>

        <div className="relative z-10 flex-1 flex flex-col justify-end max-w-6xl w-full mx-auto px-16 sm:px-24 pt-20 pb-8">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.2, 0.8, 0.2, 1] }}
            className="text-snow-off-glacier/90 text-[12px] uppercase tracking-[2.5px] font-semibold mb-3"
          >
            Reykjavík, Iceland
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05, duration: 0.7, ease: [0.2, 0.8, 0.2, 1] }}
            className="text-snow-off-glacier text-[40px] sm:text-[56px] font-semibold tracking-display leading-[1.02] mb-3 max-w-[20ch]"
          >
            Where to next?
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12, duration: 0.6, ease: [0.2, 0.8, 0.2, 1] }}
            className="text-snow-off-glacier/90 text-[16px] sm:text-[18px] mb-7 max-w-[44ch]"
          >
            Tell Walter the basics, or fork a trip others have built.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.18, duration: 0.6, ease: [0.2, 0.8, 0.2, 1] }}
            className="ml-0 mr-auto w-full"
          >
            <SearchBar value={search} onChange={setSearch} onSearch={handleSearch} />
          </motion.div>
        </div>
      </section>

      {/* Curated trips grouped by category */}
      <section className="bg-page-bg pb-16 pt-12 relative z-0">
        {CATEGORY_ORDER.map((cat, idx) => {
          const tripsInCat = CURATED_TRIPS.filter((t) => t.category === cat);
          if (tripsInCat.length === 0) return null;
          return (
            <div key={cat} className={idx === 0 ? "" : "mt-9"}>
              <div className="px-5 sm:px-8 mb-5 flex items-end justify-between gap-4 flex-wrap">
                <div>
                  <h2 className="text-[22px] sm:text-[28px] font-semibold text-snow-off-glacier tracking-display leading-[1.05]">
                    {CATEGORY_LABELS[cat]}
                  </h2>
                  <p className="text-white/55 text-[13px] mt-1.5">
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
              <h2 className="text-[22px] sm:text-[28px] font-semibold text-snow-off-glacier tracking-display leading-[1.05]">
                Trips from the community
              </h2>
              <p className="text-white/55 text-[13px] mt-1.5">
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
                      <p className="font-semibold text-[14px] text-snow-off-glacier leading-tight truncate">
                        {trip.destination}
                      </p>
                      <p className="text-white/65 text-[12px] mt-1 line-clamp-2 leading-snug min-h-[30px]">
                        {trip.title}
                      </p>
                      <div className="mt-2">
                        <div className="flex items-baseline gap-1.5">
                          <span className="font-semibold text-snow-off-glacier text-[13px]">
                            ${trip.total_estimated_cost.toLocaleString()}
                          </span>
                          <span className="text-white/45 text-[10.5px]">per person</span>
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
        <p className="font-semibold text-[14px] text-snow-off-glacier leading-tight truncate">
          {trip.destination}
        </p>
        <p className="text-white/65 text-[12px] mt-1 line-clamp-2 leading-snug min-h-[30px]">
          {trip.title}
        </p>
        <div className="mt-2">
          <div className="flex items-baseline gap-1.5">
            <span className="font-semibold text-snow-off-glacier text-[13px]">
              ${trip.totalCost.toLocaleString()}
            </span>
            <span className="text-white/45 text-[10.5px]">
              per person
            </span>
          </div>
          <p className="text-white/35 text-[10px] mt-0.5">
            {trip.durationDays} days, all in
          </p>
        </div>
      </div>
    </button>
  );
}
