"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import CommunityTrips from "../components/CommunityTrips";
import Navbar from "@/components/Navbar";

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
      <Navbar />

      {/* ========== HERO ========== */}
      <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden">
        <img
          src="/hero-bg.jpg"
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/30" />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative z-10 text-center px-6 pt-[48px]"
        >
          <div className="flex items-center justify-center gap-2 mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan animate-pulse" />
            <span className="text-white/60 text-[10px] uppercase tracking-[2px]">
              AI-powered travel
            </span>
          </div>
          <h1 className="text-white text-[40px] md:text-[56px] font-semibold leading-display tracking-display">
            One quiz.
            <br />
            <span className="text-cyan">Your whole trip.</span>
          </h1>
          <p className="text-white/70 text-[17px] mt-4 leading-relaxed max-w-lg mx-auto">
            Flights, hotels, events, restaurants. All real, all bookable.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 mt-10 justify-center">
            <Link
              href="/quick"
              className="bg-accent text-white rounded-[14px] px-10 py-5 text-[19px] font-semibold hover:bg-accent-light transition-colors flex items-center justify-center gap-3 shadow-[0_4px_20px_rgba(0,101,113,0.3)]"
            >
              <span className="material-symbols-outlined text-[24px]">bolt</span>
              Quick Plan
            </Link>
            <Link
              href="/quiz"
              className="bg-white/15 backdrop-blur-sm border border-white/25 text-white rounded-[14px] px-10 py-5 text-[19px] font-semibold hover:bg-white/25 transition-colors flex items-center justify-center gap-3"
            >
              <span className="material-symbols-outlined text-[24px]">tune</span>
              Design My Trip
            </Link>
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

      {/* ========== COMMUNITY TRIPS ========== */}
      <CommunityTrips />

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
