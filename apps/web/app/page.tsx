"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import CommunityTrips from "../components/CommunityTrips";

const steps = [
  {
    num: "01",
    icon: "quiz",
    title: "Take the quiz",
    desc: "Where, when, and what you love. Two minutes flat.",
  },
  {
    num: "02",
    icon: "auto_awesome",
    title: "Walter plans it",
    desc: "Real flights, real hotels, real events — assembled for you.",
  },
  {
    num: "03",
    icon: "flight_takeoff",
    title: "You book it",
    desc: "Compare options, tap to book. No fees, no subscriptions.",
  },
];

const moments = [
  { icon: "music_note", label: "Concerts" },
  { icon: "sports_score", label: "Sports" },
  { icon: "theater_comedy", label: "Theater" },
  { icon: "celebration", label: "Festivals" },
  { icon: "restaurant", label: "Food" },
  { icon: "hiking", label: "Outdoors" },
];

const trustItems = [
  { icon: "flight", label: "Real flights" },
  { icon: "hotel", label: "Real hotels" },
  { icon: "music_note", label: "Real events" },
  { icon: "auto_awesome", label: "AI itineraries" },
  { icon: "share", label: "One-link share" },
];

export default function HomePage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = () => setMenuOpen(false);

  return (
    <div className="min-h-screen">
      {/* ========== NAV ========== */}
      <nav className="fixed top-3 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-1.5rem)] max-w-[1100px] rounded-[20px] nav-glass border border-white/10 shadow-[0_12px_36px_rgba(0,0,0,0.22)] overflow-hidden">
        <div className="px-5 sm:px-7 h-[72px] flex items-center justify-between">
          {/* Brand */}
          <Link href="/" className="flex items-center gap-3 group" onClick={closeMenu}>
            <span className="w-9 h-9 rounded-[10px] bg-gradient-to-br from-cyan to-accent-light flex items-center justify-center shadow-[0_2px_10px_rgba(121,231,248,0.3)] transition-transform group-hover:scale-105">
              <span className="text-accent-deep text-[18px] font-black italic leading-none -mt-px">W</span>
            </span>
            <span className="text-white text-[20px] font-semibold tracking-tight">Walter</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-7">
            <Link href="/explore" className="text-white/75 text-[15px] font-medium hover:text-white transition-colors">
              Explore
            </Link>
            <Link href="/saved" className="text-white/75 text-[15px] font-medium hover:text-white transition-colors">
              Saved trips
            </Link>
            <Link href="/auth/login" className="text-white/75 text-[15px] font-medium hover:text-white transition-colors">
              Sign in
            </Link>
            <Link
              href="/quiz"
              className="bg-white/20 border border-white/25 text-white rounded-pill px-5 py-2.5 text-[15px] font-semibold hover:bg-white/30 transition-colors flex items-center gap-1.5"
            >
              Plan a trip
              <span className="material-symbols-outlined text-[19px]">arrow_forward</span>
            </Link>
          </div>

          {/* Mobile menu trigger */}
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            className="md:hidden text-white p-2 -mr-1.5"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
          >
            <span className="material-symbols-outlined text-[28px]">
              {menuOpen ? "close" : "menu"}
            </span>
          </button>
        </div>

        {/* Mobile drawer */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              key="mobile-drawer"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
              className="md:hidden border-t border-white/10 bg-[rgba(20,22,26,0.94)] backdrop-blur-xl"
            >
              <div className="max-w-6xl mx-auto px-6 py-4 flex flex-col">
                <Link href="/explore" onClick={closeMenu} className="text-white text-[15px] font-medium py-3 border-b border-white/10">
                  Explore
                </Link>
                <Link href="/saved" onClick={closeMenu} className="text-white text-[15px] font-medium py-3 border-b border-white/10">
                  Saved trips
                </Link>
                <Link href="/auth/login" onClick={closeMenu} className="text-white text-[15px] font-medium py-3 border-b border-white/10">
                  Sign in
                </Link>
                <Link
                  href="/quiz"
                  onClick={closeMenu}
                  className="bg-cyan text-accent-deep rounded-[10px] px-4 py-3 text-[15px] font-bold flex items-center justify-center gap-2 mt-4 shadow-[0_4px_18px_rgba(121,231,248,0.35)]"
                >
                  Plan a trip
                  <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* ========== HERO ========== */}
      <section className="relative overflow-hidden bg-hero-gradient">
        {/* Full-bleed atmospheric photo */}
        <img
          src="/hero-bg.jpg"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover opacity-80"
          style={{ objectPosition: "center 55%" }}
        />
        {/* Light teal tint — image-forward */}
        <div className="absolute inset-0 bg-gradient-to-br from-[rgba(0,31,38,0.45)] via-[rgba(0,61,71,0.15)] to-[rgba(0,31,38,0.55)] pointer-events-none" />
        {/* Top + bottom darkening for nav and trust bar legibility */}
        <div className="absolute inset-0 bg-gradient-to-b from-[rgba(0,31,38,0.45)] via-transparent to-[rgba(0,31,38,0.7)] pointer-events-none" />
        {/* Cyan/teal radial glow */}
        <div className="absolute inset-0 hero-radial pointer-events-none" />

        <div className="relative z-10 max-w-6xl mx-auto px-6 pt-32 lg:pt-40 pb-24 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-10 items-center">
          {/* LEFT — text */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-6 text-center lg:text-left"
          >
            <div className="inline-flex items-center gap-2 mb-7">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan animate-pulse" />
              <span className="text-cyan text-[14px] uppercase tracking-[2.8px] font-semibold drop-shadow-[0_1px_3px_rgba(0,0,0,0.4)]">
                Skip 47 tabs
              </span>
            </div>
            <h1 className="text-white text-[44px] sm:text-[56px] lg:text-[68px] font-semibold leading-[1.02] tracking-display">
              One quiz.{" "}
              <span className="block lg:inline text-cyan">Your whole trip.</span>
            </h1>
            <p className="text-white/90 text-[17px] sm:text-[19px] mt-6 lg:mt-8 leading-relaxed max-w-lg mx-auto lg:mx-0 drop-shadow-[0_1px_4px_rgba(0,0,0,0.35)]">
              Flights, hotels, concerts, restaurants — Walter assembles the
              whole thing in 60 seconds. All real, all bookable.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 mt-10 items-center justify-center lg:justify-start">
              <Link
                href="/quick"
                className="bg-cyan text-accent-deep rounded-[14px] px-10 py-5 text-[18px] font-bold hover:brightness-105 transition-all flex items-center justify-center gap-2.5 shadow-[0_8px_30px_rgba(121,231,248,0.4)]"
              >
                <span className="material-symbols-outlined text-[22px]">bolt</span>
                Quick Plan
              </Link>
              <Link
                href="/quiz"
                className="bg-white/15 backdrop-blur-sm border border-white/25 text-white rounded-[14px] px-10 py-5 text-[18px] font-bold hover:bg-white/25 transition-all flex items-center justify-center gap-2.5"
              >
                <span className="material-symbols-outlined text-[22px]">tune</span>
                Design My Trip
              </Link>
            </div>
            <p className="text-white/80 text-[13px] font-medium mt-7 tracking-wide drop-shadow-[0_1px_3px_rgba(0,0,0,0.4)]">
              Free forever · No sign-up required
            </p>
          </motion.div>

          {/* RIGHT — floating itinerary mock */}
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-6 perspective-stack hidden lg:block lg:mt-12"
            aria-hidden="true"
          >
            <div
              className="relative mx-auto w-full max-w-[520px] aspect-[3/4] tilt-card"
              style={{ transform: "rotateY(-9deg) rotateX(7deg)" }}
            >
              {/* Soft glow halo behind the stack */}
              <div className="absolute inset-0 -m-10 rounded-[48px] bg-cyan/15 blur-3xl pointer-events-none" />

              {/* Card 1 — flight */}
              <div className="absolute top-0 left-0 right-0 float-anim z-30 rounded-[18px] bg-white shadow-[0_30px_60px_-15px_rgba(0,0,0,0.4)] p-5">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[10px] uppercase tracking-widest text-on-light-tertiary font-semibold">
                    Flight
                  </span>
                  <span className="bg-[#e6f7f9] text-accent text-[10px] font-semibold rounded-pill px-2 py-0.5">
                    Cheapest
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-center">
                    <p className="font-semibold text-gray-dark text-lg leading-none">8:14a</p>
                    <p className="text-[10px] uppercase tracking-widest text-on-light-tertiary font-semibold mt-1">
                      LAX
                    </p>
                  </div>
                  <div className="flex-1 flex flex-col items-center">
                    <p className="text-[10px] uppercase tracking-widest text-on-light-tertiary font-semibold mb-1">
                      11h 25m
                    </p>
                    <div className="w-full h-px bg-on-light-tertiary/30 relative">
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-on-light-tertiary" />
                      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-on-light-tertiary" />
                    </div>
                    <p className="text-[10px] uppercase tracking-widest text-on-light-tertiary font-semibold mt-1">
                      Nonstop
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="font-semibold text-gray-dark text-lg leading-none">9:39p</p>
                    <p className="text-[10px] uppercase tracking-widest text-on-light-tertiary font-semibold mt-1">
                      LIS
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-4 pt-3 border-t border-[rgba(0,101,113,0.06)]">
                  <p className="text-on-light-secondary text-sm">TAP Air Portugal</p>
                  <p className="font-semibold text-accent text-lg">$612</p>
                </div>
              </div>

              {/* Card 2 — hotel */}
              <div className="absolute top-[34%] left-0 right-0 float-anim-1 z-20 rounded-[18px] bg-white shadow-[0_30px_60px_-15px_rgba(0,0,0,0.4)] overflow-hidden">
                <div className="flex">
                  <div className="w-[120px] bg-gradient-to-br from-[#e6f7f9] to-[#cfe9ed] flex items-center justify-center flex-shrink-0">
                    <span className="material-symbols-outlined text-accent text-[36px]">hotel</span>
                  </div>
                  <div className="flex-1 p-4">
                    <span className="text-[10px] uppercase tracking-widest text-on-light-tertiary font-semibold">
                      Hotel · 4 nights
                    </span>
                    <p className="font-semibold text-gray-dark text-[15px] mt-1 leading-tight">
                      Memmo Alfama
                    </p>
                    <p className="text-on-light-secondary text-xs mt-1 leading-snug">
                      Lisbon · Boutique · Rooftop pool
                    </p>
                    <div className="flex items-center justify-between mt-2.5">
                      <div className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-amber-500 text-[14px]">star</span>
                        <span className="text-xs font-semibold text-gray-dark">4.7</span>
                      </div>
                      <p className="font-semibold text-accent">$480</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 3 — event */}
              <div className="absolute top-[62%] left-0 right-0 float-anim-2 z-10 rounded-[18px] bg-white shadow-[0_30px_60px_-15px_rgba(0,0,0,0.4)] p-4 flex items-center gap-4">
                <div className="w-14 h-14 rounded-[12px] bg-gradient-to-br from-accent to-accent-light flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined text-cyan text-[24px]">music_note</span>
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] uppercase tracking-widest text-on-light-tertiary font-semibold">
                    Event · Sat night
                  </span>
                  <p className="font-semibold text-gray-dark text-[15px] mt-0.5 leading-tight truncate">
                    Lisbon Jazz Festival
                  </p>
                  <p className="text-on-light-secondary text-xs mt-0.5 truncate">
                    Castelo de São Jorge · 8pm
                  </p>
                </div>
                <p className="font-semibold text-accent text-[15px] flex-shrink-0">$84</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* TRUST BAR */}
        <div className="relative z-10 border-t border-white/10 bg-black/15 backdrop-blur-sm">
          <div className="max-w-6xl mx-auto px-6 py-6 flex flex-wrap items-center justify-center gap-x-9 gap-y-3 text-white/80 text-[13px] uppercase tracking-[1.6px] font-semibold">
            {trustItems.map((t) => (
              <span key={t.label} className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-cyan text-[20px]">{t.icon}</span>
                {t.label}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ========== REAL TRIPS (community) ========== */}
      <div id="trips">
        <CommunityTrips />
      </div>

      {/* ========== FINAL CTA — single dark→light transition point ========== */}
      <section className="bg-page-bg relative -mt-10 rounded-t-[60px] pt-24 sm:pt-28 pb-8 overflow-hidden z-10">
        <div className="absolute top-0 right-0 w-[60%] h-[80%] hero-radial-light pointer-events-none opacity-70" />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="relative z-10 max-w-3xl mx-auto px-6 text-center"
        >
          <h2 className="text-gray-dark text-[36px] sm:text-[52px] font-semibold tracking-display leading-[1.04]">
            Where to next?
          </h2>
          <p className="text-on-light-secondary text-[17px] mt-4 max-w-xl mx-auto leading-relaxed">
            Take the 2-minute quiz. Get a complete trip you can actually book.
          </p>
          <Link
            href="/quiz"
            className="mt-9 inline-flex items-center gap-2 bg-accent text-white rounded-[12px] px-8 py-4 text-[16px] font-bold hover:bg-accent-light transition-all shadow-[0_8px_24px_rgba(0,101,113,0.25)]"
          >
            Start the quiz
            <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
          </Link>
          <p className="text-on-light-tertiary text-[12px] mt-7 tracking-wide">
            Free forever · No sign-up required
          </p>
        </motion.div>
      </section>

      {/* ========== HOW IT WORKS ========== */}
      <section className="bg-page-bg pt-8 sm:pt-10 pb-6">
        <div className="max-w-6xl mx-auto px-6">
         <div className="bg-white rounded-[28px] p-8 sm:p-12 lg:p-14 shadow-[0_4px_30px_rgba(0,101,113,0.06)] border border-[rgba(0,101,113,0.04)]">
          <div className="text-center mb-12 sm:mb-14">
            <p className="text-accent text-[11px] uppercase tracking-[2.5px] font-semibold mb-3">
              How it works
            </p>
            <h2 className="text-[32px] sm:text-[44px] font-semibold text-gray-dark tracking-display leading-[1.05] max-w-2xl mx-auto">
              From idea to itinerary, fast.
            </h2>
          </div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-6"
          >
            {steps.map((step) => (
              <div key={step.num} className="relative">
                <div className="relative h-full bg-page-bg rounded-[20px] p-7 sm:p-8 border border-[rgba(0,101,113,0.06)] hover:bg-white hover:shadow-[0_10px_40px_rgba(0,101,113,0.08)] hover:-translate-y-0.5 transition-all duration-300">
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-14 h-14 rounded-[14px] bg-gradient-to-br from-cyan/30 to-accent/20 border border-accent/15 flex items-center justify-center shadow-[0_4px_16px_rgba(0,101,113,0.08)]">
                      <span className="material-symbols-outlined text-accent text-[26px]">
                        {step.icon}
                      </span>
                    </div>
                    <span
                      aria-hidden="true"
                      className="text-[40px] font-black text-accent/15 leading-none tracking-tight"
                    >
                      {step.num}
                    </span>
                  </div>
                  <h3 className="font-semibold text-[20px] text-gray-dark mb-2 tracking-tight">
                    {step.title}
                  </h3>
                  <p className="text-on-light-secondary text-[14.5px] leading-relaxed">
                    {step.desc}
                  </p>
                </div>
                {/* Arrow to next card (lg only) */}
                <span
                  aria-hidden="true"
                  className="hidden lg:flex absolute top-1/2 -right-[14px] -translate-y-1/2 z-10 w-7 h-7 rounded-full bg-white border border-accent/20 items-center justify-center shadow-[0_3px_10px_rgba(0,101,113,0.1)]"
                >
                  <span className="material-symbols-outlined text-accent text-[16px]">
                    arrow_forward
                  </span>
                </span>
              </div>
            ))}

            {/* Step 4 — punchline card */}
            <div className="relative h-full bg-gradient-to-br from-accent to-accent-deep rounded-[20px] p-7 sm:p-8 shadow-[0_10px_40px_rgba(0,101,113,0.2)] hover:-translate-y-0.5 transition-all duration-300 overflow-hidden">
              <div className="absolute inset-0 hero-radial pointer-events-none opacity-50" />
              <div className="relative">
                <div className="flex items-center justify-between mb-6">
                  <div className="w-14 h-14 rounded-[14px] bg-cyan/15 border border-cyan/30 flex items-center justify-center backdrop-blur-sm">
                    <span className="material-symbols-outlined text-cyan text-[26px]">
                      celebration
                    </span>
                  </div>
                  <span
                    aria-hidden="true"
                    className="text-[40px] font-black text-white/15 leading-none tracking-tight line-through decoration-2 decoration-cyan/50"
                  >
                    04
                  </span>
                </div>
                <h3 className="font-semibold text-[20px] text-white mb-2 tracking-tight">
                  Wait — there&apos;s no step 4.
                </h3>
                <p className="text-white/75 text-[14.5px] leading-relaxed">
                  That&apos;s the whole thing. Quiz to itinerary in two minutes.
                </p>
              </div>
            </div>
          </motion.div>
         </div>
        </div>
      </section>

      {/* ========== MOMENTS CALLOUT ========== */}
      <section className="bg-page-bg pt-6 pb-20">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="card-base p-8 sm:p-12 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center"
          >
            <div className="lg:col-span-5">
              <p className="text-accent text-[11px] uppercase tracking-[2.5px] font-semibold mb-3">
                Don&apos;t miss the moment
              </p>
              <h2 className="text-[28px] sm:text-[36px] font-semibold text-gray-dark tracking-display leading-[1.12]">
                The concert, the game, the festival — added to your trip.
              </h2>
              <p className="text-on-light-secondary text-[15px] mt-4 leading-relaxed">
                Walter checks Ticketmaster for what&apos;s happening during your
                dates and adds it to your itinerary in one tap.
              </p>
            </div>
            <div className="lg:col-span-7 grid grid-cols-3 sm:grid-cols-6 gap-3">
              {moments.map((m) => (
                <div
                  key={m.label}
                  className="flex flex-col items-center justify-center p-4 rounded-[14px] bg-white/70 border border-[rgba(0,101,113,0.06)]"
                >
                  <span className="material-symbols-outlined text-accent text-[24px] mb-2">
                    {m.icon}
                  </span>
                  <span className="text-xs font-semibold text-gray-dark">{m.label}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
