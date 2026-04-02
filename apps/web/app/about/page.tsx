"use client";

import Link from "next/link";
import { motion } from "framer-motion";

const steps = [
  {
    num: "01",
    title: "Take the quiz",
    desc: "Tell us where you want to go, when, how you travel, and what you love. It takes about 2 minutes.",
  },
  {
    num: "02",
    title: "Get your itinerary",
    desc: "Walter builds complete, day-by-day plans with real flights, hotels, activities, and restaurants -- all bookable.",
  },
  {
    num: "03",
    title: "Book everything",
    desc: "Compare options across budget tiers, tap to book through our partners. No extra fees, no subscriptions.",
  },
];

const values = [
  {
    title: "No subscriptions",
    desc: "Walter is free to use. We earn commissions when you book, not from your wallet.",
  },
  {
    title: "Real prices, real availability",
    desc: "Every flight, hotel, and activity we show is live and bookable. No bait-and-switch.",
  },
  {
    title: "Your preferences, not ours",
    desc: "AI recommendations are based on what you tell us, not on which partner pays the most.",
  },
  {
    title: "One place for everything",
    desc: "Flights, hotels, restaurants, activities -- planned together, not scattered across ten tabs.",
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="border-b border-border bg-surface">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link
            href="/"
            className="font-display font-extrabold text-2xl text-gradient"
          >
            walter
          </Link>
          <Link
            href="/quiz"
            className="px-5 py-2.5 rounded-xl bg-gradient-animated text-white text-sm font-bold transition-all hover:shadow-lg hover:shadow-primary/25 hover:-translate-y-0.5"
          >
            Get started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-primary/5 blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-[400px] h-[400px] rounded-full bg-accent/5 blur-3xl" />
        </div>

        <div className="max-w-4xl mx-auto px-6 py-24 sm:py-32 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-8">
              <span className="w-2 h-2 rounded-full bg-primary" />
              <span className="text-sm font-semibold text-primary">
                About Walter
              </span>
            </span>

            <h1 className="font-display font-extrabold text-5xl sm:text-7xl text-text leading-[1.05] mb-6 tracking-tight">
              One quiz.
              <br />
              <span className="text-gradient">Your whole trip.</span>
            </h1>

            <p className="text-xl sm:text-2xl text-text-secondary leading-relaxed max-w-2xl mx-auto">
              Walter is an AI-powered travel planner that turns a short quiz
              into a complete, bookable itinerary -- flights, hotels,
              activities, restaurants, and more.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Mission */}
      <section className="bg-surface border-y border-border">
        <div className="max-w-4xl mx-auto px-6 py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <span className="text-sm font-bold text-primary uppercase tracking-widest">
              Our mission
            </span>
            <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-text mt-3 mb-6">
              Eliminate the tab overload
            </h2>
            <div className="space-y-4 text-lg text-text-secondary leading-relaxed">
              <p>
                Planning a trip should be exciting, not exhausting. But right
                now, it means juggling flight search engines, hotel aggregators,
                review sites, blog posts, spreadsheets, and group chats -- often
                for weeks before you book anything.
              </p>
              <p>
                We built Walter to fix that. Tell us how you like to travel, and
                Walter handles the rest: finding real flights, matching hotels to
                your budget, building a day-by-day itinerary, and surfacing
                restaurants and activities you will actually enjoy.
              </p>
              <p>
                No subscriptions. No sign-up walls. No ads. Walter earns a
                commission when you book through our partner links, which means
                the service stays free and our incentives stay aligned with
                yours: help you book a great trip.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* How it works */}
      <section className="noise">
        <div className="max-w-6xl mx-auto px-6 py-24 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="text-sm font-bold text-primary uppercase tracking-widest">
              How it works
            </span>
            <h2 className="font-display font-extrabold text-4xl sm:text-5xl text-text mt-3">
              Three steps to{" "}
              <span className="text-gradient">your perfect trip</span>
            </h2>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {steps.map((step, i) => (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="relative bg-surface rounded-2xl border border-border p-8 hover:shadow-xl hover:border-primary/20 hover:-translate-y-1 transition-all card-shine"
              >
                <div className="w-12 h-12 rounded-2xl bg-gradient-animated flex items-center justify-center mb-5">
                  <span className="text-white font-display font-bold text-lg">
                    {step.num}
                  </span>
                </div>
                <span className="absolute top-6 right-6 font-display font-extrabold text-5xl text-primary/[0.07]">
                  {step.num}
                </span>
                <h3 className="font-display font-bold text-xl text-text mb-2">
                  {step.title}
                </h3>
                <p className="text-text-secondary leading-relaxed">
                  {step.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="bg-surface border-y border-border">
        <div className="max-w-6xl mx-auto px-6 py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="text-sm font-bold text-primary uppercase tracking-widest">
              What we believe
            </span>
            <h2 className="font-display font-extrabold text-4xl sm:text-5xl text-text mt-3">
              Built different
            </h2>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {values.map((v, i) => (
              <motion.div
                key={v.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-background rounded-2xl border border-border p-8"
              >
                <div className="flex items-start gap-4">
                  <span className="w-2 h-2 rounded-full bg-primary mt-2.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-display font-bold text-lg text-text mb-2">
                      {v.title}
                    </h3>
                    <p className="text-text-secondary leading-relaxed">
                      {v.desc}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden">
        <div className="bg-gradient-animated noise">
          <div className="max-w-6xl mx-auto px-6 py-24 text-center relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="font-display font-extrabold text-4xl sm:text-5xl text-white mb-5">
                Ready to plan your next adventure?
              </h2>
              <p className="text-white/70 text-lg mb-10 max-w-xl mx-auto">
                No sign-up required. Take the quiz, get your trip, book when
                you are ready.
              </p>
              <Link
                href="/quiz"
                className="inline-flex items-center justify-center px-10 py-5 rounded-2xl bg-white text-primary text-lg font-bold hover:bg-primary-50 transition-all hover:shadow-2xl hover:-translate-y-0.5"
              >
                Start planning
                <svg
                  className="ml-2 w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
