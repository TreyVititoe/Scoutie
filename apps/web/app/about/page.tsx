"use client";

import Link from "next/link";

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
    <div className="min-h-screen">
      {/* Nav */}
      <nav className="nav-glass">
        <div className="max-w-content mx-auto px-6 py-4 flex items-center justify-between">
          <Link
            href="/"
            className="font-semibold text-[17px] text-white"
          >
            Walter
          </Link>
          <Link
            href="/quiz"
            className="bg-accent text-white rounded-[10px] px-5 py-2 text-sm font-semibold hover:bg-accent-light transition-colors"
          >
            Get started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="bg-hero-gradient relative">
        <div className="hero-glow" />
        <div className="max-w-content mx-auto px-6 py-24 sm:py-32">
          <div className="text-center">
            <span className="inline-flex items-center gap-2 bg-accent-deep/50 text-on-dark-secondary rounded-pill px-4 py-1.5 border border-cyan/10 mb-8">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan animate-pulse" />
              <span className="text-sm font-semibold">
                About Walter
              </span>
            </span>

            <h1 className="text-white text-[56px] font-semibold leading-display tracking-display mb-6">
              One quiz.
              <br />
              Your whole trip.
            </h1>

            <p className="text-xl sm:text-2xl text-on-dark-secondary leading-relaxed max-w-2xl mx-auto">
              Walter is an AI-powered travel planner that turns a short quiz
              into a complete, bookable itinerary -- flights, hotels,
              activities, restaurants, and more.
            </p>
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="bg-white">
        <div className="max-w-content mx-auto px-6 py-20">
          <div>
            <span className="text-accent text-sm font-semibold uppercase tracking-wider">
              Our mission
            </span>
            <h2 className="text-[40px] font-semibold text-gray-dark leading-section mt-3 mb-6">
              Eliminate the tab overload
            </h2>
            <div className="space-y-4 text-lg text-on-light-secondary leading-relaxed">
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
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-page-bg">
        <div className="max-w-content mx-auto px-6 py-24">
          <div className="text-center mb-16">
            <span className="text-accent text-sm font-semibold uppercase tracking-wider">
              How it works
            </span>
            <h2 className="text-[40px] font-semibold text-gray-dark leading-section tracking-section mt-3">
              Three steps to your perfect trip
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {steps.map((step) => (
              <div
                key={step.num}
                className="card-base p-8"
              >
                <div className="w-12 h-12 rounded-[8px] bg-accent flex items-center justify-center mb-5">
                  <span className="text-white font-semibold text-lg">
                    {step.num}
                  </span>
                </div>
                <h3 className="text-gray-dark font-semibold text-xl mb-2">
                  {step.title}
                </h3>
                <p className="text-on-light-secondary leading-relaxed">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="bg-white">
        <div className="max-w-content mx-auto px-6 py-24">
          <div className="text-center mb-16">
            <span className="text-accent text-sm font-semibold uppercase tracking-wider">
              What we believe
            </span>
            <h2 className="text-[40px] font-semibold text-gray-dark leading-section tracking-section mt-3">
              Built different
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {values.map((v) => (
              <div
                key={v.title}
                className="card-base p-8"
              >
                <div className="flex items-start gap-4">
                  <span className="w-2 h-2 rounded-full bg-accent mt-2.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-lg text-gray-dark mb-2">
                      {v.title}
                    </h3>
                    <p className="text-on-light-secondary leading-relaxed">
                      {v.desc}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-hero-gradient relative">
        <div className="hero-glow" />
        <div className="max-w-content mx-auto px-6 py-24 text-center">
          <div>
            <h2 className="text-white text-[40px] font-semibold leading-section tracking-section mb-5">
              Ready to plan your next adventure?
            </h2>
            <p className="text-on-dark-secondary text-lg mb-10 max-w-xl mx-auto">
              No sign-up required. Take the quiz, get your trip, book when
              you are ready.
            </p>
            <Link
              href="/quiz"
              className="inline-flex items-center justify-center bg-accent text-white rounded-[10px] px-10 py-5 text-[17px] font-semibold hover:bg-accent-light transition-colors"
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
          </div>
        </div>
      </section>
    </div>
  );
}
