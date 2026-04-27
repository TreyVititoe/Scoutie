"use client";

import { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";

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
    <div className="min-h-screen bg-page-bg">
      <Navbar />

      <main className="max-w-content mx-auto px-6 py-10">
        <div className="mb-10">
          <h1 className="font-semibold text-[28px] text-gray-dark leading-page mb-2">
            Explore destinations
          </h1>
          <p className="text-on-light-secondary text-lg">
            Not sure where to go? Browse popular destinations and start planning.
          </p>
        </div>

        {/* Tag filter */}
        <div className="flex gap-2 flex-wrap mb-8">
          <button
            onClick={() => setActiveTag(null)}
            className={`px-4 py-2 rounded-pill text-sm transition-all ${
              activeTag === null
                ? "bg-accent text-white"
                : "bg-white border border-[rgba(0,101,113,0.08)] text-on-light-secondary hover:border-accent/30"
            }`}
          >
            All
          </button>
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setActiveTag(activeTag === tag ? null : tag)}
              className={`px-4 py-2 rounded-pill text-sm transition-all ${
                activeTag === tag
                  ? "bg-accent text-white"
                  : "bg-white border border-[rgba(0,101,113,0.08)] text-on-light-secondary hover:border-accent/30"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>

        {/* Destination grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((dest) => (
            <Link
              key={dest.city}
              href={`/quiz?destination=${encodeURIComponent(dest.city)}`}
              className="block card-base overflow-hidden transition-all group"
            >
              <div className="relative h-48 overflow-hidden">
                <img
                  src={dest.image}
                  alt={dest.city}
                  className="w-full h-full object-cover transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                <div className="absolute bottom-4 left-4">
                  <h3 className="font-semibold text-xl text-white">{dest.city}</h3>
                  <p className="text-white/80 text-sm">{dest.country}</p>
                </div>
              </div>
              <div className="p-5">
                <p className="text-sm text-on-light-secondary mb-3">{dest.tagline}</p>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-[12px] text-on-light-tertiary uppercase tracking-wider">Avg. cost</p>
                    <p className="font-semibold text-gray-dark text-sm">{dest.avgCost}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[12px] text-on-light-tertiary uppercase tracking-wider">Best time</p>
                    <p className="text-sm font-semibold text-gray-dark">{dest.bestMonths}</p>
                  </div>
                </div>
                <div className="flex gap-1.5 flex-wrap">
                  {dest.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[12px] font-semibold text-on-light-tertiary bg-page-bg rounded-pill px-2 py-0.5"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-16 bg-hero-gradient relative rounded-[14px] p-10 text-center overflow-hidden">
          <div className="hero-glow absolute inset-0 pointer-events-none" />
          <div className="relative z-10">
            <h2 className="text-white font-semibold text-[40px] mb-3">
              Can&apos;t decide?
            </h2>
            <p className="text-on-dark-secondary mb-6">
              Let Walter pick for you. Select &quot;Surprise me&quot; in the quiz and we&apos;ll find your perfect match.
            </p>
            <Link
              href="/quiz"
              className="inline-flex px-8 py-4 rounded-[10px] bg-accent text-white font-semibold hover:bg-accent-light transition-colors"
            >
              Surprise me
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
