"use client";

import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

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
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <div className="min-h-screen bg-surface">
      {/* ========== HEADER ========== */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass-header">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link
            href="/"
            className="text-2xl font-black italic text-teal-700 font-headline tracking-tight"
          >
            Walter
          </Link>
          <div className="flex items-center gap-8">
            <Link
              href="/explore"
              className="text-slate-500 font-medium text-sm hover:text-teal-700 transition-colors hidden sm:block"
            >
              Explore
            </Link>
            <Link
              href="/quiz"
              className="text-slate-500 font-medium text-sm hover:text-teal-700 transition-colors hidden sm:block"
            >
              Plan a Trip
            </Link>
            <div className="flex items-center gap-3">
              <button className="hidden sm:flex items-center justify-center w-10 h-10 rounded-full hover:bg-surface-container transition-colors active:scale-90">
                <span className="material-symbols-outlined text-on-surface-variant">
                  notifications
                </span>
              </button>
              <button className="hidden sm:flex items-center justify-center w-10 h-10 rounded-full hover:bg-surface-container transition-colors active:scale-90">
                <span className="material-symbols-outlined text-on-surface-variant">
                  account_circle
                </span>
              </button>
              <Link
                href="/quiz"
                className="btn-primary-gradient inline-flex items-center justify-center px-6 py-2.5 rounded-full text-white text-sm font-bold transition-all hover:scale-105 active:scale-95"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* ========== HERO ========== */}
      <section
        ref={heroRef}
        className="relative overflow-hidden min-h-[92vh] flex items-center"
      >
        {/* Soft background blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-[700px] h-[700px] rounded-full bg-primary-container/20 blur-[120px]" />
          <div className="absolute -bottom-60 -left-40 w-[500px] h-[500px] rounded-full bg-primary/5 blur-[100px]" />
          <motion.div
            className="absolute top-1/4 right-1/4 w-2 h-2 rounded-full bg-primary/30"
            animate={{ y: [0, -20, 0], opacity: [0.3, 0.8, 0.3] }}
            transition={{ duration: 4, repeat: Infinity }}
          />
          <motion.div
            className="absolute top-1/3 left-2/3 w-3 h-3 rounded-full bg-primary-container/40"
            animate={{ y: [0, -30, 0], opacity: [0.2, 0.6, 0.2] }}
            transition={{ duration: 5, repeat: Infinity, delay: 1 }}
          />
          <motion.div
            className="absolute bottom-1/3 right-1/5 w-1.5 h-1.5 rounded-full bg-primary/25"
            animate={{ y: [0, -15, 0], opacity: [0.3, 0.7, 0.3] }}
            transition={{ duration: 3.5, repeat: Infinity, delay: 2 }}
          />
        </div>

        <motion.div
          style={{ y: heroY, opacity: heroOpacity }}
          className="max-w-6xl mx-auto px-6 pt-36 pb-24 relative z-10"
        >
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="max-w-3xl"
          >
            {/* Walter AI badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 bg-secondary-container text-on-secondary-container rounded-full text-xs font-bold tracking-widest uppercase mb-10"
            >
              <span className="material-symbols-outlined text-base">
                auto_awesome
              </span>
              Walter AI
            </motion.div>

            <h1 className="font-headline font-extrabold text-5xl md:text-7xl text-on-surface leading-[1.05] tracking-tight mb-7">
              One quiz.
              <br />
              <span className="text-gradient">Your whole trip.</span>
            </h1>

            <p className="text-lg md:text-xl text-on-surface-variant font-body leading-relaxed mb-12 max-w-xl">
              Tell Walter how you like to travel. Get complete, bookable
              itineraries with flights, hotels, activities, and more -- in
              seconds.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/quiz"
                className="btn-primary-gradient inline-flex items-center justify-center px-8 py-4 rounded-full text-white text-lg font-bold transition-all hover:scale-105 active:scale-95"
              >
                Plan your trip
                <span className="material-symbols-outlined ml-2 text-xl">
                  arrow_forward
                </span>
              </Link>
              <a
                href="#how-it-works"
                className="inline-flex items-center justify-center px-8 py-4 rounded-full border-2 border-outline-variant text-on-surface font-bold hover:bg-surface-container-lowest hover:border-primary/30 transition-all hover:scale-105 active:scale-95"
              >
                How it works
              </a>
            </div>
          </motion.div>

          {/* Social proof strip */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="mt-16 flex flex-col sm:flex-row items-start sm:items-center gap-8"
          >
            {/* Avatar stack */}
            <div className="flex items-center">
              <div className="flex -space-x-3">
                {[
                  "bg-teal-400",
                  "bg-cyan-400",
                  "bg-emerald-400",
                  "bg-sky-400",
                  "bg-teal-300",
                ].map((color, i) => (
                  <div
                    key={i}
                    className={`w-10 h-10 rounded-full ${color} border-2 border-white flex items-center justify-center`}
                  >
                    <span className="material-symbols-outlined text-white text-sm">
                      person
                    </span>
                  </div>
                ))}
              </div>
              <p className="ml-4 text-sm text-on-surface-variant font-medium">
                Joined this week
              </p>
            </div>

            {/* Trip counter */}
            <div className="flex items-center gap-6">
              <div>
                <p className="font-headline font-extrabold text-3xl text-on-surface tracking-tight">
                  12,400+
                </p>
                <p className="text-xs uppercase tracking-[0.2em] font-black text-on-surface-variant">
                  Trips Planned
                </p>
              </div>
              <div className="w-px h-10 bg-outline-variant" />
              <div>
                <p className="font-headline font-extrabold text-3xl text-on-surface tracking-tight">
                  $0
                </p>
                <p className="text-xs uppercase tracking-[0.2em] font-black text-on-surface-variant">
                  Always Free
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* ========== FEATURES STRIP ========== */}
      <section className="border-y border-outline-variant/30 bg-surface-container-lowest overflow-hidden">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="max-w-6xl mx-auto px-6 py-8"
        >
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                className="flex items-start gap-3 py-2"
              >
                <span className="material-symbols-outlined text-primary text-xl mt-0.5">
                  {f.icon}
                </span>
                <div>
                  <p className="text-sm font-bold text-on-surface leading-tight font-headline">
                    {f.title}
                  </p>
                  <p className="text-xs text-on-surface-variant mt-0.5">
                    {f.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ========== HOW IT WORKS ========== */}
      <section id="how-it-works" className="bg-surface">
        <div className="max-w-6xl mx-auto px-6 py-28 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <span className="text-xs font-black text-primary uppercase tracking-[0.2em]">
              How It Works
            </span>
            <h2 className="font-headline font-extrabold text-4xl sm:text-5xl text-on-surface mt-4 tracking-tight">
              Three steps to{" "}
              <span className="text-gradient">your perfect trip</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {steps.map((step, i) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15, duration: 0.5 }}
                className="card-3d p-8 relative"
              >
                <div className="w-14 h-14 rounded-2xl bg-primary-container/40 flex items-center justify-center mb-6">
                  <span className="material-symbols-outlined text-primary text-2xl">
                    {step.icon}
                  </span>
                </div>
                <span className="absolute top-6 right-8 font-headline font-extrabold text-6xl text-primary/[0.06]">
                  0{i + 1}
                </span>
                <h3 className="font-headline font-extrabold text-xl text-on-surface mb-3 tracking-tight">
                  {step.title}
                </h3>
                <p className="text-on-surface-variant font-body leading-relaxed">
                  {step.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== DESTINATION TEASERS ========== */}
      <section className="bg-surface-container-lowest border-y border-outline-variant/30">
        <div className="max-w-6xl mx-auto px-6 py-28">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex items-end justify-between mb-12"
          >
            <div>
              <span className="text-xs font-black text-primary uppercase tracking-[0.2em]">
                Explore
              </span>
              <h2 className="font-headline font-extrabold text-4xl sm:text-5xl text-on-surface mt-4 tracking-tight">
                Popular destinations
              </h2>
              <p className="text-on-surface-variant mt-3 font-body">
                Click to start your trip with a destination pre-filled.
              </p>
            </div>
            <Link
              href="/explore"
              className="hidden sm:flex items-center gap-1 text-sm font-bold text-primary hover:text-primary-dark transition-colors"
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
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
              >
                <Link
                  href={`/quiz?destination=${encodeURIComponent(d.name)}`}
                  className={`group relative block overflow-hidden card-3d ${
                    i === 0 || i === 3
                      ? "aspect-[4/5] sm:row-span-1"
                      : "aspect-[4/3]"
                  }`}
                >
                  <img
                    src={d.image}
                    alt={d.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent group-hover:from-black/80 transition-colors duration-500" />
                  <div className="absolute bottom-6 left-6 right-6">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[11px] font-black uppercase tracking-[0.15em] bg-white/15 backdrop-blur-md text-white px-3 py-1 rounded-full border border-white/10">
                        {d.tag}
                      </span>
                    </div>
                    <p className="font-headline font-extrabold text-2xl text-white tracking-tight">
                      {d.name}
                    </p>
                    <p className="text-white/50 text-sm font-mono mt-1">
                      {d.price}
                    </p>
                  </div>
                  <div className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 border border-white/10 group-hover:scale-110">
                    <span className="material-symbols-outlined text-white text-lg">
                      arrow_outward
                    </span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== CTA ========== */}
      <section className="relative overflow-hidden">
        <div className="bg-gradient-animated noise">
          <div className="max-w-6xl mx-auto px-6 py-28 text-center relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 backdrop-blur-sm text-white/90 rounded-full text-xs font-bold tracking-widest uppercase mb-8 border border-white/10">
                <span className="material-symbols-outlined text-base">
                  auto_awesome
                </span>
                Powered by AI
              </span>
              <h2 className="font-headline font-extrabold text-4xl sm:text-5xl text-white mb-6 tracking-tight">
                Ready to plan your next adventure?
              </h2>
              <p className="text-white/60 text-lg mb-12 max-w-xl mx-auto font-body">
                No sign-up required. Take the quiz, get your trip, book when
                you&apos;re ready.
              </p>
              <Link
                href="/quiz"
                className="inline-flex items-center justify-center px-10 py-5 rounded-full bg-white text-primary text-lg font-bold transition-all hover:scale-105 active:scale-95 shadow-2xl shadow-black/20"
              >
                Start planning
                <span className="material-symbols-outlined ml-2 text-xl">
                  arrow_forward
                </span>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer is rendered by root layout */}
    </div>
  );
}
