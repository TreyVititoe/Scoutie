"use client";

import type { HotelResult } from "@/lib/services/hotels";
import { trackAndOpen } from "@/lib/affiliate";

export default function HotelCard({ hotel, bestValue }: { hotel: HotelResult; bestValue: boolean }) {
  const handleBook = () => {
    if (hotel.bookingUrl) {
      trackAndOpen({
        provider: "booking",
        itemType: "hotel",
        destinationUrl: hotel.bookingUrl,
      });
    }
  };

  return (
    <div
      onClick={handleBook}
      className="min-w-[280px] w-[280px] flex-shrink-0 bg-surface border border-border rounded-2xl overflow-hidden hover:shadow-lg hover:border-primary-light transition-all group cursor-pointer">
      {/* Image */}
      <div className="relative h-40 bg-background">
        {hotel.image ? (
          <img src={hotel.image} alt={hotel.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-3xl">🏨</div>
        )}
        {bestValue && (
          <span className="absolute top-3 left-3 text-[11px] font-bold uppercase tracking-wider bg-emerald-500 text-white px-2.5 py-1 rounded-full">
            Best value
          </span>
        )}
      </div>

      <div className="p-4">
        {/* Name & Location */}
        <p className="font-bold text-text mb-1 leading-tight line-clamp-2">{hotel.name}</p>
        {hotel.neighborhood && (
          <p className="text-xs text-text-muted mb-3">{hotel.neighborhood}</p>
        )}

        {/* Rating */}
        <div className="flex items-center gap-1.5 mb-3">
          {hotel.rating > 0 && (
            <>
              <span className="text-sm font-bold text-accent">★ {hotel.rating}</span>
              {hotel.reviewWord && (
                <span className="text-xs text-text-muted">{hotel.reviewWord}</span>
              )}
              {hotel.reviewCount > 0 && (
                <span className="text-xs text-text-muted">({hotel.reviewCount.toLocaleString()})</span>
              )}
            </>
          )}
        </div>

        {/* Price */}
        <div className="flex items-end justify-between pt-3 border-t border-border">
          <div>
            <p className="text-2xl font-mono font-bold text-text">${hotel.pricePerNight}</p>
            <p className="text-[11px] text-text-muted">
              per night · ${hotel.totalPrice.toLocaleString()} total
            </p>
          </div>
          <span className="text-xs text-primary font-semibold group-hover:underline">Book →</span>
        </div>
      </div>
    </div>
  );
}
