"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useQuizStore } from "@/lib/stores/quizStore";
import { useTripCartStore } from "@/lib/stores/tripCartStore";
import { getDestinationImage } from "@/lib/destinationImages";
import { SearchBar, type SearchValue } from "@/components/quiz/SearchBar";

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
      className={`text-[13px] font-medium px-3.5 py-1.5 rounded-pill transition-colors flex items-center gap-1.5 ${
        active ? "bg-white/10 text-white" : "text-white/75 hover:text-white hover:bg-white/10"
      }`}
    >
      {icon && (
        <span className="material-symbols-outlined text-[16px] text-accent-light">{icon}</span>
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
    const travelers = Math.max(1, search.adults + search.children);
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
        travelersCount: travelers,
        travelers,
        adults: search.adults,
        children: search.children,
        infants: search.infants,
        pets: search.pets,
        description: search.description,
        budget: 2000,
        budgetAmount: 2000,
        activityInterests: [],
        vibes: [],
        accommodationTypes: ["hotel"],
      })
    );

    const shouldCompare = !search.destination || !search.startDate || !search.endDate;
    router.push(shouldCompare ? "/compare" : "/results");
  };

  return (
    <div className="min-h-screen bg-page-bg">
      {/* Header */}
      <header className="sticky top-0 z-50 nav-glass">
        <div className="max-w-6xl mx-auto px-5 sm:px-6 py-3.5 flex items-center justify-between gap-6">
          <Link href="/" className="flex items-center gap-2.5 shrink-0">
            <span className="w-7 h-7 rounded-[8px] bg-gradient-to-br from-cyan to-accent-light flex items-center justify-center shadow-[0_2px_10px_rgba(56,189,248,0.3)]">
              <span className="text-[oklch(0.12_0.008_250)] text-[14px] font-black italic leading-none -mt-px">W</span>
            </span>
            <span className="text-white text-[16px] font-semibold tracking-tight">Walter</span>
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

          <div className="hidden sm:flex items-center gap-2">
            <Link
              href="/auth/login"
              className="text-white/75 hover:text-white text-[13px] font-medium px-3.5 py-1.5 rounded-pill hover:bg-white/10 transition-colors"
            >
              Sign in
            </Link>
            <Link
              href="/auth/login"
              className="border border-white/25 text-white rounded-pill px-4 py-1.5 text-[13px] font-semibold hover:bg-white/10 hover:border-white/40 transition-colors"
            >
              Get started
            </Link>
          </div>

          <button
            type="button"
            aria-label="Open menu"
            onClick={() => setMobileOpen((v) => !v)}
            className="md:hidden w-9 h-9 rounded-full hover:bg-white/10 flex items-center justify-center text-white transition-colors"
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
              className="md:hidden border-t border-white/10 bg-[oklch(0.13_0.008_250)] px-5 py-3 flex flex-col gap-1"
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
              <div className="h-px bg-white/10 my-2" />
              <Link
                href="/auth/login"
                onClick={() => setMobileOpen(false)}
                className="text-white/80 text-[14px] font-medium px-3.5 py-2 rounded-pill hover:bg-white/10"
              >
                Sign in
              </Link>
              <Link
                href="/auth/login"
                onClick={() => setMobileOpen(false)}
                className="text-center border border-white/25 text-white rounded-pill px-4 py-2 text-[14px] font-semibold mt-1"
              >
                Get started
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
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
          <div className="absolute inset-0 bg-gradient-to-b from-tinted-pitch/40 via-tinted-pitch/10 to-tinted-pitch pointer-events-none" />
          <div className="absolute inset-0 hero-radial opacity-30 pointer-events-none" />
        </div>

        <div className="relative z-10 flex-1 flex flex-col justify-end max-w-6xl w-full mx-auto px-5 sm:px-6 pt-20 pb-8">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.2, 0.8, 0.2, 1] }}
            className="text-snow-off-glacier/65 text-[11px] uppercase tracking-[2.5px] font-medium mb-3"
          >
            Reykjavík, Iceland
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05, duration: 0.7, ease: [0.2, 0.8, 0.2, 1] }}
            className="text-snow-off-glacier text-[32px] sm:text-[44px] font-semibold tracking-display leading-[1.02] mb-2 max-w-[20ch]"
          >
            Where to next?
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12, duration: 0.6, ease: [0.2, 0.8, 0.2, 1] }}
            className="text-snow-off-glacier/75 text-[14px] sm:text-[15px] mb-6 max-w-[44ch]"
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

      {/* Curated steal-a-trip feature row (The Booking Spine Rule) */}
      <section className="bg-page-bg pb-24 pt-12 relative z-0">
        <div className="max-w-6xl mx-auto px-5 sm:px-6 mb-6">
          <h2 className="text-[22px] sm:text-[28px] font-semibold text-snow-off-glacier tracking-display leading-[1.05]">
            Steal a trip
          </h2>
        </div>

        {tripsLoading ? (
          <div className="max-w-6xl mx-auto grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5 sm:gap-6 px-5 sm:px-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="card-base overflow-hidden animate-pulse">
                <div className="aspect-[4/3] bg-white/10" />
                <div className="p-4 space-y-2">
                  <div className="h-3.5 bg-white/10 rounded w-2/3" />
                  <div className="h-3 bg-white/10 rounded w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : trips.length === 0 ? (
          <p className="text-white/55 text-center py-12 max-w-6xl mx-auto">
            No community trips yet, check back soon.
          </p>
        ) : (
          <div className="max-w-6xl mx-auto grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5 sm:gap-6 px-5 sm:px-6">
            {[...trips]
              .sort((a, b) => b.upvote_count - a.upvote_count)
              .slice(0, 12)
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
                  <div className="p-4">
                    <p className="font-semibold text-[15px] text-snow-off-glacier leading-tight truncate">
                      {trip.destination}
                    </p>
                    <p className="text-white/65 text-[12.5px] mt-1.5 line-clamp-2 leading-snug min-h-[34px]">
                      {trip.title}
                    </p>
                    <div className="flex items-baseline gap-1.5 mt-3">
                      <span className="font-semibold text-snow-off-glacier text-[14px]">
                        ${trip.total_estimated_cost.toLocaleString()}
                      </span>
                      <span className="text-white/45 text-[11px]">all in</span>
                    </div>
                  </div>
                </Link>
              ))}
          </div>
        )}

        {trips.length > 12 && (
          <div className="max-w-6xl mx-auto px-5 sm:px-6 mt-10">
            <Link
              href="/explore"
              className="inline-flex items-center gap-1.5 text-snow-off-glacier text-[14px] font-medium border-b border-white/30 hover:border-white pb-0.5 transition-colors"
            >
              More trips
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}
