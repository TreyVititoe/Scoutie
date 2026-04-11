"use client";

import Link from "next/link";
import { motion } from "framer-motion";

const destinations = [
  {
    name: "Tokyo",
    image:
      "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=600&h=400&fit=crop",
    tag: "Culture",
    price: "from $2,500",
  },
  {
    name: "Barcelona",
    image:
      "https://images.unsplash.com/photo-1583422409516-2895a77efded?w=600&h=400&fit=crop",
    tag: "Architecture",
    price: "from $1,800",
  },
  {
    name: "Bali",
    image:
      "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=600&h=400&fit=crop",
    tag: "Relaxation",
    price: "from $1,200",
  },
  {
    name: "New York",
    image:
      "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=600&h=400&fit=crop",
    tag: "Nightlife",
    price: "from $2,800",
  },
  {
    name: "Iceland",
    image:
      "https://images.unsplash.com/photo-1504829857797-ddff29c27927?w=600&h=400&fit=crop",
    tag: "Adventure",
    price: "from $3,000",
  },
  {
    name: "Paris",
    image:
      "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=600&h=400&fit=crop",
    tag: "Romance",
    price: "from $2,200",
  },
];

const steps = [
  {
    icon: "quiz",
    title: "Take the Quiz",
    desc: "Tell us where, when, how you travel, and what you love. Takes 2 minutes.",
  },
  {
    icon: "auto_awesome",
    title: "Walter Plans It",
    desc: "AI builds complete itineraries -- flights, hotels, activities, restaurants -- all real, all bookable.",
  },
  {
    icon: "flight_takeoff",
    title: "You Book It",
    desc: "Compare options side-by-side, tap to book. No extra fees, no subscriptions, ever.",
  },
];

const features = [
  { icon: "airplane_ticket", title: "Real flights", desc: "Live prices from Skyscanner" },
  { icon: "hotel", title: "Real hotels", desc: "Availability from Booking.com" },
  { icon: "route", title: "AI itineraries", desc: "Day-by-day plans built for you" },
  { icon: "payments", title: "3 budget tiers", desc: "Budget, balanced, and premium" },
  { icon: "lock_open", title: "No sign-up required", desc: "Use it free, save when ready" },
  { icon: "share", title: "Share with friends", desc: "One link, full itinerary" },
];

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* ========== HEADER ========== */}
      <nav className="fixed top-0 left-0 right-0 z-50 nav-glass">
        <div className="max-w-6xl mx-auto px-6 h-[48px] flex items-center justify-between">
          <Link
            href="/"
            className="text-white text-[15px] font-semibold"
          >
            Walter
          </Link>
          <div className="flex items-center gap-8">
            <Link
              href="/explore"
              className="text-white/80 text-[11px] hidden sm:block"
            >
              Explore
            </Link>
            <Link
              href="/quiz"
              className="text-white/80 text-[11px] hidden sm:block"
            >
              Plan a Trip
            </Link>
            <Link
              href="/quiz"
              className="bg-white/15 border border-white/20 text-white rounded-pill px-4 py-1.5 text-[11px] font-semibold hover:bg-white/25 transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* ========== HERO ========== */}
      <section className="bg-hero-gradient relative min-h-[85vh] flex">
        <div className="hero-glow absolute inset-0 pointer-events-none" />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="w-full flex flex-col md:flex-row pt-[48px]"
        >
          {/* Left side */}
          <div className="flex-[0_0_42%] p-8 md:p-12 flex flex-col justify-center">
            <div className="flex items-center gap-2 mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan animate-pulse" />
              <span className="text-cyan/70 text-[10px] uppercase tracking-[2px]">
                AI-powered travel
              </span>
            </div>
            <h1 className="text-white text-[28px] md:text-[32px] font-semibold leading-tight">
              One quiz.
              <br />
              <span className="text-cyan">Your whole trip.</span>
            </h1>
            <p className="text-on-dark-secondary text-[13px] mt-3 leading-relaxed max-w-md">
              Flights, hotels, events, restaurants. All real, all bookable.
            </p>
            <div className="flex flex-row gap-3 mt-5">
              <Link
                href="/quiz"
                className="bg-accent text-white rounded-[10px] px-5 py-2.5 text-[13px] font-semibold hover:bg-accent-light transition-colors"
              >
                Plan your trip
              </Link>
              <a
                href="#how-it-works"
                className="border border-cyan/30 text-cyan rounded-[10px] px-5 py-2.5 text-[13px] hover:bg-cyan/5 transition-colors"
              >
                How it works
              </a>
            </div>
          </div>

          {/* Right side */}
          <div className="flex-[0_0_58%] bg-accent-deep/50 p-4 md:p-6 flex flex-col gap-3 justify-center">
            {destinations.slice(0, 3).map((d) => (
              <div
                key={d.name}
                className="glass-card-dark rounded-[14px] p-3 flex items-center gap-3"
              >
                <img
                  src={d.image}
                  alt={d.name}
                  className="w-[50px] h-[36px] rounded-[8px] object-cover"
                />
                <div>
                  <p className="text-white text-[13px] font-semibold">{d.name}</p>
                  <p className="text-white/50 text-[10px]">
                    {d.tag} &middot; {d.price}
                  </p>
                </div>
                <span className="text-cyan text-[10px] ml-auto">
                  12 flights found
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ========== FEATURES STRIP ========== */}
      <section className="bg-white border-y border-[rgba(0,101,113,0.06)] py-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.3 }}
          className="max-w-6xl mx-auto px-6"
        >
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
            {features.map((f) => (
              <div key={f.title} className="flex items-start gap-3">
                <div className="icon-gradient w-9 h-9 flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined text-accent text-lg">
                    {f.icon}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-dark">{f.title}</p>
                  <p className="text-xs text-on-light-secondary">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ========== HOW IT WORKS ========== */}
      <section id="how-it-works" className="bg-page-bg py-20">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-[32px] font-semibold text-gray-dark text-center mb-12">
            Three steps to your perfect trip
          </h2>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 sm:grid-cols-3 gap-8"
          >
            {steps.map((step, i) => (
              <div key={step.title} className="card-base p-8">
                <div className="bg-accent text-white text-[11px] font-semibold w-6 h-6 rounded-[8px] flex items-center justify-center mb-4">
                  {i + 1}
                </div>
                <div className="icon-gradient w-12 h-12 flex items-center justify-center mb-4">
                  <span className="material-symbols-outlined text-accent text-xl">
                    {step.icon}
                  </span>
                </div>
                <h3 className="font-semibold text-[17px] text-gray-dark mb-2">
                  {step.title}
                </h3>
                <p className="text-on-light-secondary text-sm leading-relaxed">
                  {step.desc}
                </p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ========== EVENTS SHOWCASE ========== */}
      <section className="bg-white py-20">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-[32px] font-semibold text-gray-dark text-center">
            Never miss a moment
          </h2>
          <p className="text-on-light-secondary text-lg mt-3 mb-12 max-w-2xl mx-auto text-center">
            Concerts, games, festivals, theater — Walter finds what&apos;s happening
            during your trip and lets you add it with one tap.
          </p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {[
              {
                icon: "music_note",
                title: "Concerts & Music",
                desc: "From arena tours to intimate jazz clubs, see who is performing while you are in town.",
              },
              {
                icon: "sports_score",
                title: "Sports & Games",
                desc: "Catch live NBA, NFL, soccer, and more. Real-time ticket availability from Ticketmaster.",
              },
              {
                icon: "theater_comedy",
                title: "Theater & Comedy",
                desc: "Broadway, stand-up, improv. Find the best shows and book seats before they sell out.",
              },
              {
                icon: "celebration",
                title: "Festivals & Nightlife",
                desc: "Food festivals, art fairs, nightlife events. Discover the local scene during your dates.",
              },
            ].map((card) => (
              <div key={card.title} className="card-base p-7">
                <div className="icon-gradient w-12 h-12 flex items-center justify-center mb-4">
                  <span className="material-symbols-outlined text-accent text-xl">
                    {card.icon}
                  </span>
                </div>
                <h3 className="font-semibold text-[17px] text-gray-dark mb-2">
                  {card.title}
                </h3>
                <p className="text-on-light-secondary text-sm leading-relaxed">
                  {card.desc}
                </p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ========== DESTINATIONS ========== */}
      <section className="bg-page-bg py-20">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3 }}
            className="flex items-end justify-between mb-12"
          >
            <h2 className="text-[32px] font-semibold text-gray-dark">
              Popular destinations
            </h2>
            <Link
              href="/explore"
              className="text-accent text-sm font-semibold hover:text-accent-light"
            >
              View all
            </Link>
          </motion.div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-5">
            {destinations.map((d, i) => (
              <motion.div
                key={d.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3 }}
              >
                <Link
                  href={`/quiz?destination=${encodeURIComponent(d.name)}`}
                  className={`relative block overflow-hidden rounded-[14px] group hover:-translate-y-1 hover:shadow-[0_8px_24px_rgba(0,101,113,0.1)] transition-all duration-200 ${
                    i === 0 || i === 3
                      ? "aspect-[4/5] sm:row-span-1"
                      : "aspect-[4/3]"
                  }`}
                  style={{ boxShadow: "0 2px 12px rgba(0,101,113,0.06)" }}
                >
                  <img
                    src={d.image}
                    alt={d.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                  <div className="absolute bottom-6 left-6 right-6">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="bg-white/15 backdrop-blur-md text-white rounded-pill px-3 py-1 text-[11px] font-semibold">
                        {d.tag}
                      </span>
                    </div>
                    <p className="font-semibold text-2xl text-white">
                      {d.name}
                    </p>
                    <p className="text-white/50 text-sm mt-1">
                      {d.price}
                    </p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== FINAL CTA ========== */}
      <section className="bg-hero-gradient relative py-20 text-center">
        <div className="hero-glow absolute inset-0 pointer-events-none" />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.3 }}
          className="relative z-10 max-w-6xl mx-auto px-6"
        >
          <h2 className="text-white text-[32px] font-semibold">
            Ready to plan your next adventure?
          </h2>
          <p className="text-on-dark-secondary text-lg mt-3 mb-8 max-w-xl mx-auto">
            No sign-up required. Take the quiz, get your trip, book when
            you&apos;re ready.
          </p>
          <Link
            href="/quiz"
            className="bg-accent text-white rounded-[10px] px-6 py-3 text-[17px] font-semibold hover:bg-accent-light transition-colors inline-flex items-center gap-2"
          >
            Start planning
          </Link>
        </motion.div>
      </section>

      {/* Footer is rendered by root layout */}
    </div>
  );
}
