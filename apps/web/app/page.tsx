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
        <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
          <Link
            href="/"
            className="text-white text-[17px] font-semibold"
          >
            Walter
          </Link>
          <div className="flex items-center gap-8">
            <Link
              href="/explore"
              className="text-white text-[12px] hidden sm:block"
            >
              Explore
            </Link>
            <Link
              href="/quiz"
              className="text-white text-[12px] hidden sm:block"
            >
              Plan a Trip
            </Link>
            <Link
              href="/quiz"
              className="bg-accent text-white rounded-pill px-4 py-1.5 text-[14px]"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* ========== HERO ========== */}
      <section className="bg-gray-light min-h-[92vh] flex items-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="max-w-6xl mx-auto px-6 pt-36 pb-24"
        >
          <div className="max-w-3xl">
            <h1 className="text-gray-dark text-[56px] font-semibold leading-display tracking-display mb-7">
              One quiz.
              <br />
              Your whole trip.
            </h1>

            <p className="text-on-light-secondary text-[21px] leading-card-title mb-12 max-w-xl">
              Tell Walter how you like to travel. Get complete, bookable
              itineraries with flights, hotels, activities, and more -- in
              seconds.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href="#how-it-works"
                className="border border-accent text-accent rounded-pill px-5 py-2 text-sm inline-flex items-center justify-center"
              >
                Learn more
              </a>
              <Link
                href="/quiz"
                className="bg-accent text-white rounded-[8px] px-4 py-2 text-[17px] inline-flex items-center justify-center"
              >
                Get started
              </Link>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ========== FEATURES STRIP ========== */}
      <section className="bg-gray-light overflow-hidden">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.3 }}
          className="max-w-6xl mx-auto px-6 py-8"
        >
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
            {features.map((f) => (
              <div
                key={f.title}
                className="flex items-start gap-3 py-2"
              >
                <span className="material-symbols-outlined text-accent text-xl mt-0.5">
                  {f.icon}
                </span>
                <div>
                  <p className="text-sm font-semibold text-gray-dark leading-tight">
                    {f.title}
                  </p>
                  <p className="text-xs text-on-light-secondary mt-0.5">
                    {f.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ========== HOW IT WORKS ========== */}
      <section id="how-it-works" className="bg-gray-light">
        <div className="max-w-6xl mx-auto px-6 py-28">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.3 }}
            className="text-center mb-20"
          >
            <h2 className="text-gray-dark text-[40px] font-semibold leading-section tracking-section">
              Three steps to your perfect trip
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {steps.map((step) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-[8px] p-8"
              >
                <div className="w-14 h-14 rounded-[8px] bg-accent/20 flex items-center justify-center mb-6">
                  <span className="material-symbols-outlined text-accent text-2xl">
                    {step.icon}
                  </span>
                </div>
                <h3 className="text-gray-dark font-semibold text-[17px] mb-3">
                  {step.title}
                </h3>
                <p className="text-on-light-secondary leading-relaxed">
                  {step.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== EVENTS SHOWCASE ========== */}
      <section className="bg-gray-light">
        <div className="max-w-6xl mx-auto px-6 py-28">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.3 }}
            className="text-center mb-16"
          >
            <h2 className="text-gray-dark text-[40px] font-semibold leading-section tracking-section">
              Never miss a moment
            </h2>
            <p className="text-on-light-secondary mt-4 text-lg max-w-2xl mx-auto leading-relaxed">
              Concerts, games, festivals, theater — Walter finds what&apos;s happening
              during your trip and lets you add it with one tap.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-[8px] p-7"
              >
                <div className="w-14 h-14 rounded-full bg-gray-light flex items-center justify-center mb-5">
                  <span className="material-symbols-outlined text-accent text-2xl">
                    {card.icon}
                  </span>
                </div>
                <h3 className="font-semibold text-[17px] text-gray-dark mb-2">
                  {card.title}
                </h3>
                <p className="text-on-light-secondary text-sm leading-relaxed">
                  {card.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== DESTINATION TEASERS ========== */}
      <section className="bg-gray-light">
        <div className="max-w-6xl mx-auto px-6 py-28">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.3 }}
            className="flex items-end justify-between mb-12"
          >
            <div>
              <h2 className="text-gray-dark text-[40px] font-semibold">
                Popular destinations
              </h2>
              <p className="text-on-light-secondary mt-3">
                Click to start your trip with a destination pre-filled.
              </p>
            </div>
            <Link
              href="/explore"
              className="hidden sm:flex items-center gap-1 text-accent text-sm"
            >
              View all
              <span className="material-symbols-outlined text-lg">
                arrow_forward
              </span>
            </Link>
          </motion.div>

          {/* Bento grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-5">
            {destinations.map((d, i) => (
              <motion.div
                key={d.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.3 }}
              >
                <Link
                  href={`/quiz?destination=${encodeURIComponent(d.name)}`}
                  className={`relative block overflow-hidden rounded-[8px] shadow-elevated ${
                    i === 0 || i === 3
                      ? "aspect-[4/5] sm:row-span-1"
                      : "aspect-[4/3]"
                  }`}
                >
                  <img
                    src={d.image}
                    alt={d.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                  <div className="absolute bottom-6 left-6 right-6">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[11px] font-semibold uppercase tracking-[0.15em] bg-white/15 backdrop-blur-md text-white px-3 py-1 rounded-full">
                        {d.tag}
                      </span>
                    </div>
                    <p className="font-semibold text-2xl text-white">
                      {d.name}
                    </p>
                    <p className="text-on-dark-tertiary text-sm mt-1">
                      {d.price}
                    </p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== CTA ========== */}
      <section className="bg-gray-light">
        <div className="max-w-6xl mx-auto px-6 py-28 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.3 }}
          >
            <h2 className="text-gray-dark text-[40px] font-semibold mb-6">
              Ready to plan your next adventure?
            </h2>
            <p className="text-on-light-secondary text-lg mb-12 max-w-xl mx-auto">
              No sign-up required. Take the quiz, get your trip, book when
              you&apos;re ready.
            </p>
            <Link
              href="/quiz"
              className="bg-accent text-white rounded-[8px] px-6 py-3 text-[17px] inline-flex items-center justify-center"
            >
              Start planning
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer is rendered by root layout */}
    </div>
  );
}
