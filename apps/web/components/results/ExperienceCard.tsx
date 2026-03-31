"use client";

import { Experience } from "@/lib/mockData";

export default function ExperienceCard({ experience }: { experience: Experience }) {
  return (
    <a
      href={experience.link}
      target="_blank"
      rel="noopener noreferrer"
      className="min-w-[280px] w-[280px] flex-shrink-0 bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-lg hover:border-sky-200 transition-all cursor-pointer group"
    >
      {/* Image */}
      <div className="relative h-40 bg-gray-100">
        <img src={experience.image} alt={experience.name} className="w-full h-full object-cover" />
        <span className="absolute top-3 left-3 text-[11px] font-bold uppercase tracking-wider bg-white/90 backdrop-blur-sm text-gray-700 px-2.5 py-1 rounded-full">
          {experience.category}
        </span>
      </div>

      <div className="p-4">
        {/* Name */}
        <p className="font-bold text-gray-900 mb-2 leading-tight">{experience.name}</p>

        {/* Rating & Duration */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex items-center gap-1">
            <span className="text-sm font-bold text-amber-500">★ {experience.rating}</span>
            <span className="text-xs text-gray-400">({experience.reviews.toLocaleString()})</span>
          </div>
          <span className="text-xs text-gray-400">{experience.duration}</span>
        </div>

        {/* Price */}
        <div className="flex items-end justify-between pt-3 border-t border-gray-50">
          <div>
            <p className="text-2xl font-bold text-gray-900">${experience.price}</p>
            <p className="text-[11px] text-gray-400">per person</p>
          </div>
          <span className="text-xs text-sky-500 font-semibold group-hover:underline">Book →</span>
        </div>
      </div>
    </a>
  );
}
