"use client";

import { Experience } from "@/lib/mockData";

export default function ExperienceCard({ experience }: { experience: Experience }) {
  return (
    <a
      href={experience.link}
      target="_blank"
      rel="noopener noreferrer"
      className="card-base block overflow-hidden cursor-pointer group"
    >
      {/* Image */}
      <div className="relative h-40 bg-page-bg">
        <img src={experience.image} alt={experience.name} className="w-full h-full object-cover" />
        <span className="absolute top-3 left-3 bg-[#DBEAFE] text-accent rounded-pill px-2.5 py-0.5 text-[11px] font-semibold">
          {experience.category}
        </span>
      </div>

      <div className="p-4">
        {/* Name */}
        <p className="font-semibold text-gray-dark mb-2 leading-tight">{experience.name}</p>

        {/* Rating & Duration */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex items-center gap-1">
            <span className="text-sm font-semibold text-accent">{experience.rating}/5</span>
            <span className="text-xs text-on-light-tertiary">({experience.reviews.toLocaleString()})</span>
          </div>
          <span className="text-xs text-on-light-tertiary">{experience.duration}</span>
        </div>

        {/* Price */}
        <div className="flex items-end justify-between pt-3 border-t border-on-light-tertiary/10">
          <div>
            <p className="font-semibold text-gray-dark text-[21px]">${experience.price}</p>
            <p className="text-[11px] text-on-light-tertiary">per person</p>
          </div>
          <span className="text-xs text-accent font-semibold group-hover:underline">Book →</span>
        </div>
      </div>
    </a>
  );
}
