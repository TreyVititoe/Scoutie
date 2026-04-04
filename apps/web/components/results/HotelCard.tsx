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
    <div className="min-w-[300px] w-[300px] flex-shrink-0 card-3d rounded-[2rem] overflow-hidden cursor-pointer group">
      {/* Image */}
      <div className="relative h-40 bg-background">
        {hotel.image ? (
          <img src={hotel.image} alt={hotel.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-purple-50">
            <span className="material-symbols-outlined text-purple-300 text-3xl">hotel</span>
          </div>
        )}
        {bestValue && (
          <span className="absolute top-3 left-3 text-[10px] font-bold uppercase tracking-widest bg-secondary-container text-on-secondary-container px-3 py-1 rounded-full font-body">
            Best value
          </span>
        )}
      </div>

      <div className="p-6">
        {/* Name & Location */}
        <p className="font-headline font-bold text-on-surface mb-1 leading-tight line-clamp-2">{hotel.name}</p>
        {hotel.neighborhood && (
          <p className="text-[10px] uppercase tracking-widest text-outline-variant font-bold font-body mb-3">{hotel.neighborhood}</p>
        )}

        {/* Rating */}
        <div className="flex items-center gap-1.5 mb-4">
          {hotel.rating > 0 && (
            <>
              <span className="material-symbols-outlined text-amber-500 text-base">star</span>
              <span className="text-sm font-bold font-headline text-on-surface">{hotel.rating}/10</span>
              {hotel.reviewWord && (
                <span className="text-xs text-on-surface-variant font-body">{hotel.reviewWord}</span>
              )}
              {hotel.reviewCount > 0 && (
                <span className="text-xs text-outline-variant font-body">({hotel.reviewCount.toLocaleString()})</span>
              )}
            </>
          )}
        </div>

        {/* Price & Book */}
        <div className="flex items-end justify-between pt-4 border-t border-outline-variant/15">
          <div>
            <p className="font-headline font-black text-primary text-xl">${hotel.pricePerNight}</p>
            <p className="text-[10px] uppercase tracking-widest text-outline-variant font-bold font-body">
              per night -- ${hotel.totalPrice.toLocaleString()} total
            </p>
          </div>
          <button
            onClick={handleBook}
            className="rounded-full bg-on-background text-white px-5 py-2 text-sm font-bold font-headline hover:opacity-90 transition-opacity"
          >
            Book
          </button>
        </div>
      </div>
    </div>
  );
}
