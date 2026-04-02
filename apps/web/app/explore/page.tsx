"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";

type Destination = {
  city: string;
  country: string;
  image: string;
  tagline: string;
  avgCost: string;
  bestMonths: string;
  tags: string[];
};

const destinations: Destination[] = [
  {
    city: "Tokyo",
    country: "Japan",
    image: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=600&q=80",
    tagline: "Neon lights meet ancient temples",
    avgCost: "$2,500–4,500",
    bestMonths: "Mar–May, Sep–Nov",
    tags: ["Culture", "Food", "Nightlife"],
  },
  {
    city: "Barcelona",
    country: "Spain",
    image: "https://images.unsplash.com/photo-1583422409516-2895a77efded?w=600&q=80",
    tagline: "Art, tapas, and Mediterranean sun",
    avgCost: "$1,800–3,200",
    bestMonths: "May–Jun, Sep–Oct",
    tags: ["Beach", "Architecture", "Food"],
  },
  {
    city: "Bali",
    country: "Indonesia",
    image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=600&q=80",
    tagline: "Tropical paradise on a budget",
    avgCost: "$1,200–2,800",
    bestMonths: "Apr–Oct",
    tags: ["Beach", "Wellness", "Nature"],
  },
  {
    city: "New York",
    country: "United States",
    image: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=600&q=80",
    tagline: "The city that never sleeps",
    avgCost: "$2,800–5,500",
    bestMonths: "Apr–Jun, Sep–Nov",
    tags: ["Culture", "Food", "Shopping"],
  },
  {
    city: "Reykjavik",
    country: "Iceland",
    image: "https://images.unsplash.com/photo-1504829857797-ddff29c27927?w=600&q=80",
    tagline: "Northern lights and volcanic landscapes",
    avgCost: "$3,000–5,000",
    bestMonths: "Jun–Aug, Sep–Mar (lights)",
    tags: ["Nature", "Adventure", "Photography"],
  },
  {
    city: "Paris",
    country: "France",
    image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=600&q=80",
    tagline: "Romance, art, and croissants",
    avgCost: "$2,200–4,000",
    bestMonths: "Apr–Jun, Sep–Oct",
    tags: ["Culture", "Food", "Romance"],
  },
  {
    city: "Bangkok",
    country: "Thailand",
    image: "https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=600&q=80",
    tagline: "Street food capital of the world",
    avgCost: "$800–2,000",
    bestMonths: "Nov–Feb",
    tags: ["Food", "Culture", "Budget"],
  },
  {
    city: "Cape Town",
    country: "South Africa",
    image: "https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=600&q=80",
    tagline: "Where mountains meet the ocean",
    avgCost: "$1,500–3,000",
    bestMonths: "Oct–Apr",
    tags: ["Nature", "Adventure", "Wine"],
  },
  {
    city: "Lisbon",
    country: "Portugal",
    image: "https://images.unsplash.com/photo-1585208798174-6cedd86e019a?w=600&q=80",
    tagline: "Pastel de nata and ocean views",
    avgCost: "$1,400–2,800",
    bestMonths: "Mar–Oct",
    tags: ["Food", "Culture", "Budget"],
  },
];

const allTags = Array.from(new Set(destinations.flatMap((d) => d.tags)));

export default function ExplorePage() {
  const [activeTag, setActiveTag] = useState<string | null>(null);

  const filtered = activeTag
    ? destinations.filter((d) => d.tags.includes(activeTag))
    : destinations;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-surface border-b border-border sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="font-display font-bold text-xl text-text">
            walter
          </Link>
          <Link
            href="/quiz"
            className="px-4 py-2 rounded-xl bg-primary text-white text-sm font-bold hover:bg-primary-dark transition-colors"
          >
            Plan a trip
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <h1 className="font-display font-bold text-3xl sm:text-4xl text-text mb-2">
            Explore destinations
          </h1>
          <p className="text-text-secondary text-lg">
            Not sure where to go? Browse popular destinations and start planning.
          </p>
        </motion.div>

        {/* Tag filter */}
        <div className="flex gap-2 flex-wrap mb-8">
          <button
            onClick={() => setActiveTag(null)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              activeTag === null
                ? "bg-primary text-white"
                : "bg-surface border border-border text-text-secondary hover:border-primary-light"
            }`}
          >
            All
          </button>
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setActiveTag(activeTag === tag ? null : tag)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                activeTag === tag
                  ? "bg-primary text-white"
                  : "bg-surface border border-border text-text-secondary hover:border-primary-light"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>

        {/* Destination grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((dest, i) => (
            <motion.div
              key={dest.city}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Link
                href={`/quiz?destination=${encodeURIComponent(dest.city)}`}
                className="block bg-surface rounded-2xl border border-border overflow-hidden hover:shadow-lg hover:border-primary-light transition-all group"
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={dest.image}
                    alt={dest.city}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  <div className="absolute bottom-4 left-4">
                    <h3 className="font-display font-bold text-xl text-white">{dest.city}</h3>
                    <p className="text-white/80 text-sm">{dest.country}</p>
                  </div>
                </div>
                <div className="p-5">
                  <p className="text-sm text-text-secondary mb-3">{dest.tagline}</p>
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-xs text-text-muted uppercase tracking-wider">Avg. cost</p>
                      <p className="font-mono font-bold text-text text-sm">{dest.avgCost}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-text-muted uppercase tracking-wider">Best time</p>
                      <p className="text-sm font-medium text-text">{dest.bestMonths}</p>
                    </div>
                  </div>
                  <div className="flex gap-1.5 flex-wrap">
                    {dest.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-primary-50 text-primary"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-16 text-center"
        >
          <h2 className="font-display font-bold text-2xl text-text mb-3">
            Can&apos;t decide?
          </h2>
          <p className="text-text-secondary mb-6">
            Let Walter pick for you. Select &quot;Surprise me&quot; in the quiz and we&apos;ll find your perfect match.
          </p>
          <Link
            href="/quiz"
            className="inline-flex px-8 py-4 rounded-xl bg-primary text-white font-bold hover:bg-primary-dark transition-colors"
          >
            Surprise me
          </Link>
        </motion.div>
      </main>
    </div>
  );
}
