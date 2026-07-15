"use client";

import { useState } from "react";
import type { HotelResult } from "@/lib/services/hotels";
import { useTripCartStore } from "@/lib/stores/tripCartStore";

export default function HotelCard({ hotel, bestValue }: { hotel: HotelResult; bestValue: boolean }) {
  const basePhotos =
    hotel.images && hotel.images.length > 0
      ? hotel.images
      : hotel.image
        ? [hotel.image]
        : [];
  const [photos, setPhotos] = useState<string[]>(basePhotos);
  const [photoIndex, setPhotoIndex] = useState(0);
  const [fetchedMore, setFetchedMore] = useState(false);
  /* The search list carries one photo; the full set loads on the first
   * arrow press so browsing costs nothing until someone cares. */
  const step = (dir: number) => {
    if (!fetchedMore && hotel.hotelId) {
      setFetchedMore(true);
      fetch(`/api/hotels/photos?hotelId=${encodeURIComponent(hotel.hotelId)}`)
        .then((r) => r.json())
        .then((data: { photos?: string[] }) => {
          if (data.photos && data.photos.length > 0) {
            setPhotos((prev) => [...new Set([...prev, ...data.photos!])]);
          }
        })
        .catch(() => {});
    }
    setPhotos((prev) => {
      setPhotoIndex((i) => (i + dir + prev.length) % prev.length);
      return prev;
    });
  };

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

  /* The pick earns a taller photograph, a full row, and a reason. */
  const curatorNote = bestValue
    ? hotel.rating > 0 && hotel.reviewCount > 0
      ? `The math favors this one: ${hotel.rating}/10 from ${hotel.reviewCount.toLocaleString()} guests at $${hotel.pricePerNight} a night. We'd book it.`
      : `The best stay for the money on this search. We'd book it.`
    : null;

  return (
    <div className={`w-full card-base overflow-hidden ${bestValue ? "sm:col-span-2" : ""}`}>
      {/* Image */}
      <div className={`relative bg-raised-slate group ${bestValue ? "h-64 lg:h-72" : "h-40"}`}>
        {photos.length > 0 ? (
          <img src={photos[photoIndex]} alt={hotel.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-raised-slate">
            <span className="material-symbols-outlined text-ink-faint text-4xl">hotel</span>
          </div>
        )}
        {(photos.length > 1 || hotel.hotelId) && (
          <>
            <button
              type="button"
              aria-label="Previous photo"
              onClick={() => step(-1)}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-card/90 shadow-[0_2px_10px_rgba(20,30,60,0.18)] flex items-center justify-center text-ink hover:bg-card transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">chevron_left</span>
            </button>
            <button
              type="button"
              aria-label="Next photo"
              onClick={() => step(1)}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-card/90 shadow-[0_2px_10px_rgba(20,30,60,0.18)] flex items-center justify-center text-ink hover:bg-card transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">chevron_right</span>
            </button>
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
              {photos.map((_, i) => (
                <span
                  key={i}
                  className={`w-1.5 h-1.5 rounded-full ${
                    i === photoIndex ? "bg-white" : "bg-white/50"
                  }`}
                />
              ))}
            </div>
          </>
        )}
        {bestValue && (
          <span className="absolute top-3 left-3 bg-tinted-pitch/85 backdrop-blur-sm text-snow-off-glacier border border-white/10 rounded-pill px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide">
            Walter&apos;s pick
          </span>
        )}
      </div>

      <div className="p-6">
        {/* Name & Location */}
        <p className="font-semibold text-ink mb-1 leading-tight line-clamp-2">{hotel.name}</p>
        {hotel.neighborhood && (
          <p className="text-[10px] uppercase tracking-widest text-ink-faint font-semibold mb-3">{hotel.neighborhood}</p>
        )}
        {curatorNote && (
          <p className="text-body text-ink-soft leading-relaxed mb-3 max-w-[52ch]">{curatorNote}</p>
        )}

        {/* Rating */}
        <div className="flex items-center gap-1.5 mb-4">
          {hotel.rating > 0 && (
            <>
              <span className="material-symbols-outlined text-accent text-base">star</span>
              <span className="text-sm font-semibold text-ink">{hotel.rating}/10</span>
              {hotel.reviewWord && (
                <span className="text-xs text-ink-soft">{hotel.reviewWord}</span>
              )}
              {hotel.reviewCount > 0 && (
                <span className="text-xs text-ink-faint">({hotel.reviewCount.toLocaleString()})</span>
              )}
            </>
          )}
        </div>

        {/* Price & Add to Trip */}
        <div className="flex items-end justify-between pt-4 border-t border-line">
          <div>
            <p className="font-semibold text-ink text-[21px]">
              ${hotel.pricePerNight}
            </p>
            <p className="text-[10px] uppercase tracking-widest text-ink-faint font-semibold">
              per night. ${hotel.totalPrice.toLocaleString()} total
            </p>
          </div>
          <button
            onClick={handleToggle}
            className={`rounded-pill px-4 py-2 text-sm font-semibold flex items-center gap-1.5 transition-all active:scale-[0.96] ${
              added
                ? "bg-accent text-snow-off-glacier hover:bg-accent-light"
                : "border border-ink/20 text-ink hover:bg-ink/5 hover:border-ink/40"
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
