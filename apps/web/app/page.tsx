"use client";

import Link from "next/link";
import { motion } from "framer-motion";

const destinations = [
  { name: "Tokyo", image: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=600&h=400&fit=crop", tag: "Culture" },
  { name: "Barcelona", image: "https://images.unsplash.com/photo-1583422409516-2895a77efded?w=600&h=400&fit=crop", tag: "Architecture" },
  { name: "Bali", image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=600&h=400&fit=crop", tag: "Relaxation" },
  { name: "New York", image: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=600&h=400&fit=crop", tag: "Nightlife" },
  { name: "Iceland", image: "https://images.unsplash.com/photo-1504829857797-ddff29c27927?w=600&h=400&fit=crop", tag: "Adventure" },
  { name: "Paris", image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=600&h=400&fit=crop", tag: "Romance" },
];

const steps = [
  { num: "01", title: "Take the quiz", desc: "Tell us where, when, how you travel, and what you love. Takes 2 minutes." },
  { num: "02", title: "Scoutie plans it", desc: "AI builds complete itineraries — flights, hotels, activities, restaurants — all real, all bookable." },
  { num: "03", title: "You book it", desc: "Compare options side-by-side, tap to book. No extra fees, no subscriptions, ever." },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="sticky top-0 z-20 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <span className="font-display font-bold text-2xl text-text">scoutie</span>
          <div className="flex items-center gap-4">
            <Link href="/explore" className="text-sm font-semibold text-text-secondary hover:text-text transition-colors">
              Explore
            </Link>
            <Link href="/quiz" className="text-sm font-semibold text-text-secondary hover:text-text transition-colors">
              Plan a trip
            </Link>
            <Link
              href="/quiz"
              className="px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-bold hover:bg-primary-dark transition-colors"
            >
              Get started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-6 pt-20 pb-24 sm:pt-32 sm:pb-36">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl"
          >
            <h1 className="font-display font-extrabold text-5xl sm:text-7xl text-text leading-[1.1] mb-6">
              One quiz.
              <br />
              <span className="text-primary">Your whole trip.</span>
            </h1>
            <p className="text-xl sm:text-2xl text-text-secondary leading-relaxed mb-10 max-w-xl">
              Tell Scoutie how you like to travel. Get complete, bookable itineraries with flights, hotels, activities, and more — in seconds.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/quiz"
                className="inline-flex items-center justify-center px-8 py-4 rounded-2xl bg-primary text-white text-lg font-bold hover:bg-primary-dark transition-colors shadow-xl shadow-primary/20"
              >
                Plan your trip
              </Link>
              <a
                href="#how-it-works"
                className="inline-flex items-center justify-center px-8 py-4 rounded-2xl border-2 border-border text-text font-bold hover:bg-surface transition-colors"
              >
                How it works
              </a>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="flex gap-12 mt-16"
          >
            {[
              { num: "0", label: "subscriptions" },
              { num: "0", label: "ads" },
              { num: "0", label: "fees" },
            ].map((s) => (
              <div key={s.label}>
                <p className="font-display font-extrabold text-3xl text-primary">{s.num}</p>
                <p className="text-sm text-text-muted">{s.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="bg-surface border-y border-border">
        <div className="max-w-6xl mx-auto px-6 py-20">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-display font-bold text-3xl sm:text-4xl text-text mb-12"
          >
            Three steps to your perfect trip
          </motion.h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {steps.map((step, i) => (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="relative"
              >
                <span className="font-display font-extrabold text-6xl text-primary/10">
                  {step.num}
                </span>
                <h3 className="font-display font-bold text-xl text-text mt-2 mb-2">
                  {step.title}
                </h3>
                <p className="text-text-secondary leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Destination teasers */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="font-display font-bold text-3xl sm:text-4xl text-text mb-4"
        >
          Popular destinations
        </motion.h2>
        <p className="text-text-secondary mb-10">Click one to start your quiz with it pre-filled.</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {destinations.map((d, i) => (
            <motion.div
              key={d.name}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
            >
              <Link
                href="/quiz"
                className="group relative block rounded-2xl overflow-hidden aspect-[4/3]"
              >
                <img
                  src={d.image}
                  alt={d.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-4 left-4">
                  <span className="text-[11px] font-bold uppercase tracking-wider bg-white/20 backdrop-blur-sm text-white px-2 py-0.5 rounded-full mb-2 inline-block">
                    {d.tag}
                  </span>
                  <p className="font-display font-bold text-xl text-white">{d.name}</p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary">
        <div className="max-w-6xl mx-auto px-6 py-20 text-center">
          <h2 className="font-display font-bold text-3xl sm:text-4xl text-white mb-4">
            Ready to plan your next adventure?
          </h2>
          <p className="text-primary-200 text-lg mb-8 max-w-xl mx-auto">
            No sign-up required. Take the quiz, get your trip, book when you&apos;re ready.
          </p>
          <Link
            href="/quiz"
            className="inline-flex items-center justify-center px-8 py-4 rounded-2xl bg-white text-primary text-lg font-bold hover:bg-primary-50 transition-colors"
          >
            Start planning
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-surface border-t border-border">
        <div className="max-w-6xl mx-auto px-6 py-10">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="font-display font-bold text-lg text-text">scoutie</span>
            <p className="text-sm text-text-muted text-center">
              Scoutie earns a commission when you book through our links at no extra cost to you.
            </p>
            <div className="flex gap-6 text-sm text-text-muted">
              <a href="#" className="hover:text-text transition-colors">Privacy</a>
              <a href="#" className="hover:text-text transition-colors">Terms</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
