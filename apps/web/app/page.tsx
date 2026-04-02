"use client";

import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

const destinations = [
  { name: "Tokyo", image: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=600&h=400&fit=crop", tag: "Culture", price: "from $2,500" },
  { name: "Barcelona", image: "https://images.unsplash.com/photo-1583422409516-2895a77efded?w=600&h=400&fit=crop", tag: "Architecture", price: "from $1,800" },
  { name: "Bali", image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=600&h=400&fit=crop", tag: "Relaxation", price: "from $1,200" },
  { name: "New York", image: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=600&h=400&fit=crop", tag: "Nightlife", price: "from $2,800" },
  { name: "Iceland", image: "https://images.unsplash.com/photo-1504829857797-ddff29c27927?w=600&h=400&fit=crop", tag: "Adventure", price: "from $3,000" },
  { name: "Paris", image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=600&h=400&fit=crop", tag: "Romance", price: "from $2,200" },
];

const steps = [
  { num: "01", title: "Take the quiz", desc: "Tell us where, when, how you travel, and what you love. Takes 2 minutes." },
  { num: "02", title: "Walter plans it", desc: "AI builds complete itineraries — flights, hotels, activities, restaurants — all real, all bookable." },
  { num: "03", title: "You book it", desc: "Compare options side-by-side, tap to book. No extra fees, no subscriptions, ever." },
];

const features = [
  { title: "Real flights", desc: "Live prices from Skyscanner" },
  { title: "Real hotels", desc: "Availability from Booking.com" },
  { title: "AI itineraries", desc: "Day-by-day plans built for you" },
  { title: "3 budget tiers", desc: "Budget, balanced, and premium" },
  { title: "No sign-up required", desc: "Use it free, save when ready" },
  { title: "Share with friends", desc: "One link, full itinerary" },
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
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="font-display font-extrabold text-2xl text-gradient">
            walter
          </Link>
          <div className="flex items-center gap-6">
            <Link href="/explore" className="text-sm font-semibold text-text-secondary hover:text-text transition-colors hidden sm:block">
              Explore
            </Link>
            <Link href="/quiz" className="text-sm font-semibold text-text-secondary hover:text-text transition-colors hidden sm:block">
              Plan a trip
            </Link>
            <Link
              href="/quiz"
              className="px-5 py-2.5 rounded-xl bg-gradient-animated text-white text-sm font-bold transition-all hover:shadow-lg hover:shadow-primary/25 hover:-translate-y-0.5"
            >
              Get started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section ref={heroRef} className="relative overflow-hidden min-h-[90vh] flex items-center">
        {/* Background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-primary/5 blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full bg-accent/5 blur-3xl" />
          <motion.div
            className="absolute top-1/4 right-1/4 w-2 h-2 rounded-full bg-primary/30"
            animate={{ y: [0, -20, 0], opacity: [0.3, 0.8, 0.3] }}
            transition={{ duration: 4, repeat: Infinity }}
          />
          <motion.div
            className="absolute top-1/3 right-1/3 w-3 h-3 rounded-full bg-accent/20"
            animate={{ y: [0, -30, 0], opacity: [0.2, 0.6, 0.2] }}
            transition={{ duration: 5, repeat: Infinity, delay: 1 }}
          />
          <motion.div
            className="absolute bottom-1/3 right-1/5 w-1.5 h-1.5 rounded-full bg-primary/25"
            animate={{ y: [0, -15, 0], opacity: [0.3, 0.7, 0.3] }}
            transition={{ duration: 3.5, repeat: Infinity, delay: 2 }}
          />

          {/* Giant background watermark stats */}
          <div className="absolute right-0 top-1/2 -translate-y-1/2 flex flex-col items-end gap-0 pr-6 sm:pr-12 select-none">
            {[
              { num: "0", label: "subscriptions" },
              { num: "0", label: "ads" },
              { num: "0", label: "fees" },
            ].map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + i * 0.15, duration: 0.8 }}
                className="text-right"
              >
                <span className="font-display font-extrabold text-[10rem] sm:text-[14rem] leading-[0.8] text-primary/[0.08] block">
                  {s.num}
                </span>
                <span className="font-display font-bold text-sm sm:text-base uppercase tracking-[0.2em] text-primary/[0.14] -mt-4 block">
                  {s.label}
                </span>
              </motion.div>
            ))}
          </div>
        </div>

        <motion.div
          style={{ y: heroY, opacity: heroOpacity }}
          className="max-w-6xl mx-auto px-6 pt-32 pb-20 relative z-10"
        >
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="max-w-3xl"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-8"
            >
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-sm font-semibold text-primary">AI-powered trip planning</span>
            </motion.div>

            <h1 className="font-display font-extrabold text-6xl sm:text-8xl text-text leading-[1.05] mb-6 tracking-tight">
              One quiz.
              <br />
              <span className="text-gradient">Your whole trip.</span>
            </h1>
            <p className="text-xl sm:text-2xl text-text-secondary leading-relaxed mb-10 max-w-xl">
              Tell Walter how you like to travel. Get complete, bookable itineraries with flights, hotels, activities, and more — in seconds.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/quiz"
                className="btn-glow inline-flex items-center justify-center px-8 py-4 rounded-2xl bg-gradient-animated text-white text-lg font-bold transition-all hover:shadow-2xl hover:shadow-primary/30 hover:-translate-y-0.5"
              >
                Plan your trip
                <svg className="ml-2 w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              <a
                href="#how-it-works"
                className="inline-flex items-center justify-center px-8 py-4 rounded-2xl border-2 border-border text-text font-bold hover:bg-surface hover:border-primary/30 transition-all"
              >
                How it works
              </a>
            </div>
          </motion.div>

        </motion.div>
      </section>

      {/* Features strip */}
      <section className="border-y border-border bg-surface/50 overflow-hidden">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="max-w-6xl mx-auto px-6 py-6"
        >
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center gap-3 py-2"
              >
                <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0"></span>
                <div>
                  <p className="text-sm font-bold text-text leading-tight">{f.title}</p>
                  <p className="text-[11px] text-text-muted">{f.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="noise">
        <div className="max-w-6xl mx-auto px-6 py-24 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="text-sm font-bold text-primary uppercase tracking-widest">How it works</span>
            <h2 className="font-display font-extrabold text-4xl sm:text-5xl text-text mt-3">
              Three steps to <span className="text-gradient">your perfect trip</span>
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
                  <span className="text-white font-display font-bold text-lg">{step.num}</span>
                </div>
                <span className="absolute top-6 right-6 font-display font-extrabold text-5xl text-primary/[0.07]">
                  {step.num}
                </span>
                <h3 className="font-display font-bold text-xl text-text mb-2">
                  {step.title}
                </h3>
                <p className="text-text-secondary leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Destination teasers */}
      <section className="bg-surface border-y border-border">
        <div className="max-w-6xl mx-auto px-6 py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex items-end justify-between mb-10"
          >
            <div>
              <span className="text-sm font-bold text-primary uppercase tracking-widest">Explore</span>
              <h2 className="font-display font-extrabold text-4xl sm:text-5xl text-text mt-3">
                Popular destinations
              </h2>
              <p className="text-text-secondary mt-2">Click to start your trip with a destination pre-filled.</p>
            </div>
            <Link
              href="/explore"
              className="hidden sm:flex items-center gap-1 text-sm font-bold text-primary hover:text-primary-dark transition-colors"
            >
              View all
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </motion.div>
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
                  className="group relative block rounded-2xl overflow-hidden aspect-[4/3] card-shine"
                >
                  <img
                    src={d.image}
                    alt={d.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent group-hover:from-black/80 transition-colors" />
                  <div className="absolute bottom-5 left-5 right-5">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider bg-white/15 backdrop-blur-md text-white px-2.5 py-1 rounded-full border border-white/10">
                        {d.tag}
                      </span>
                    </div>
                    <p className="font-display font-bold text-2xl text-white">{d.name}</p>
                    <p className="text-white/60 text-sm font-mono mt-0.5">{d.price}</p>
                  </div>
                  <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity border border-white/10">
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </div>
                </Link>
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
                No sign-up required. Take the quiz, get your trip, book when you&apos;re ready.
              </p>
              <Link
                href="/quiz"
                className="inline-flex items-center justify-center px-10 py-5 rounded-2xl bg-white text-primary text-lg font-bold hover:bg-primary-50 transition-all hover:shadow-2xl hover:-translate-y-0.5"
              >
                Start planning
                <svg className="ml-2 w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-text">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="flex flex-col sm:flex-row items-start justify-between gap-8">
            <div>
              <span className="font-display font-extrabold text-xl text-gradient">walter</span>
              <p className="text-sm text-white/40 mt-2 max-w-xs">
                AI-powered trip planning. One quiz, your whole trip planned and bookable.
              </p>
            </div>
            <div className="flex gap-8">
              <div className="flex flex-col gap-2">
                <span className="text-xs font-bold text-white/30 uppercase tracking-wider">Product</span>
                <Link href="/quiz" className="text-sm text-white/60 hover:text-white transition-colors">Plan a trip</Link>
                <Link href="/explore" className="text-sm text-white/60 hover:text-white transition-colors">Explore</Link>
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-xs font-bold text-white/30 uppercase tracking-wider">Legal</span>
                <a href="#" className="text-sm text-white/60 hover:text-white transition-colors">Privacy</a>
                <a href="#" className="text-sm text-white/60 hover:text-white transition-colors">Terms</a>
              </div>
            </div>
          </div>
          <div className="border-t border-white/10 mt-8 pt-8">
            <p className="text-xs text-white/30 text-center">
              Walter earns a commission when you book through our links at no extra cost to you. &copy; {new Date().getFullYear()} Walter.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
