"use client";

import type { AccommodationOption } from "@/types";

export default function AccommodationCard({ accommodation }: { accommodation: AccommodationOption }) {
  return (
    <div className="card overflow-hidden">
      <div className="h-40 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
        {accommodation.imageUrl ? (
          <img src={accommodation.imageUrl} alt={accommodation.name} className="w-full h-full object-cover" />
        ) : (
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="1.5">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <polyline points="21 15 16 10 5 21" />
          </svg>
        )}
      </div>
      <div className="p-4 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="font-semibold text-gray-900 text-sm leading-tight">{accommodation.name}</h3>
            <p className="text-xs text-gray-400">{accommodation.location}</p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-lg font-bold text-brand-600">${accommodation.pricePerNight}</p>
            <p className="text-[10px] text-gray-400">per night</p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <span className="text-xs font-semibold text-amber-500">★ {accommodation.rating}</span>
          <span className="text-xs text-gray-400">({accommodation.reviewCount})</span>
          <span className="text-xs text-gray-300 mx-1">·</span>
          <span className="text-xs text-gray-500 capitalize">{accommodation.type}</span>
        </div>

        {accommodation.highlights.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {accommodation.highlights.slice(0, 3).map((h) => (
              <span key={h} className="text-[10px] px-2 py-0.5 bg-gray-50 text-gray-500 rounded-full">
                {h}
              </span>
            ))}
          </div>
        )}

        <a
          href={accommodation.affiliateUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="block text-center text-sm text-brand-600 font-medium hover:text-brand-700 pt-1"
        >
          Book Now →
        </a>
      </div>
    </div>
  );
}
