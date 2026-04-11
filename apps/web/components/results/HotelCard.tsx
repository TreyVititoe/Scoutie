"use client";

import type { HotelResult } from "@/lib/services/hotels";
import { useTripCartStore } from "@/lib/stores/tripCartStore";

export default function HotelCard({ hotel, bestValue }: { hotel: HotelResult; bestValue: boolean }) {
  const addItem = useTripCartStore((s) => s.addItem);
  const removeItem = useTripCartStore((s) => s.removeItem);
  const added = useTripCartStore((s) => s.items.some((i) => i.id === hotel.id));

  const handleToggle = () => {
    if (added) {
      removeItem(hotel.id);
    } else {
      addItem({
        id: hotel.id,
        type: "hotel",
        title: hotel.name,
        subtitle: hotel.neighborhood || "",
        price: hotel.totalPrice,
        image: hotel.image,
        bookingUrl: hotel.bookingUrl,
        provider: "booking",
        date: null,
        meta: hotel as unknown as Record<string, unknown>,
      });
    }
  };

  return (
    <div className="w-full card-base overflow-hidden">
      {/* Image */}
      <div className="relative h-40 bg-background">
        {hotel.image ? (
          <img src={hotel.image} alt={hotel.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-page-bg">
            <span className="material-symbols-outlined text-on-light-tertiary text-4xl">hotel</span>
          </div>
        )}
        <div className="absolute top-3 left-3 flex flex-wrap items-center gap-1.5">
          {bestValue && (
            <span className="bg-[#e6f7f9] text-accent rounded-pill px-2.5 py-0.5 text-[11px] font-semibold">
              Best value
            </span>
          )}
          {hotel.rating >= 9.0 && (
            <span className="bg-[#e6f7f9] text-accent rounded-pill px-2.5 py-0.5 text-[11px] font-semibold">
              Exceptional
            </span>
          )}
          {hotel.rating >= 8.0 && hotel.rating < 9.0 && (
            <span className="bg-[#e6f7f9] text-accent rounded-pill px-2.5 py-0.5 text-[11px] font-semibold">
              Highly rated
            </span>
          )}
          {!bestValue && hotel.pricePerNight < 150 && (
            <span className="bg-[#e6f7f9] text-accent rounded-pill px-2.5 py-0.5 text-[11px] font-semibold">
              Budget-friendly
            </span>
          )}
        </div>
      </div>

      <div className="p-6">
        {/* Name & Location */}
        <p className="font-semibold text-on-surface mb-1 leading-tight line-clamp-2">{hotel.name}</p>
        {hotel.neighborhood && (
          <p className="text-[10px] uppercase tracking-widest text-on-light-tertiary font-semibold mb-3">{hotel.neighborhood}</p>
        )}

        {/* Rating */}
        <div className="flex items-center gap-1.5 mb-4">
          {hotel.rating > 0 && (
            <>
              <span className="material-symbols-outlined text-accent text-base">star</span>
              <span className="text-sm font-semibold text-on-surface">{hotel.rating}/10</span>
              {hotel.reviewWord && (
                <span className="text-xs text-on-surface-variant">{hotel.reviewWord}</span>
              )}
              {hotel.reviewCount > 0 && (
                <span className="text-xs text-on-light-tertiary">({hotel.reviewCount.toLocaleString()})</span>
              )}
            </>
          )}
        </div>

        {/* Price & Add to Trip */}
        <div className="flex items-end justify-between pt-4 border-t border-on-light-tertiary/15">
          <div>
            <p className="font-semibold text-accent text-[21px]">
              ${hotel.pricePerNight}
            </p>
            <p className="text-[10px] uppercase tracking-widest text-on-light-tertiary font-semibold">
              per night -- ${hotel.totalPrice.toLocaleString()} total
            </p>
          </div>
          <button
            onClick={handleToggle}
            className={`rounded-[10px] px-4 py-2 text-sm font-semibold flex items-center gap-1.5 transition-colors ${
              added
                ? "bg-accent text-white hover:bg-accent-light"
                : "border border-accent text-accent hover:bg-accent/5"
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">
              {added ? "check" : "add"}
            </span>
            {added ? "Added" : "Add to Trip"}
          </button>
        </div>
      </div>
    </div>
  );
}
