"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

/* ── Types ── */
type BookedItem = {
  id: string;
  type: string;
  title: string;
  subtitle?: string | null;
  price?: number | null;
  date?: string | null;
  confirmationCode: string;
};

type Booking = {
  id: string;
  bookedAt: string;
  traveler: { name: string; email: string };
  items: BookedItem[];
  total: number;
};

/* ── Section config ── */
const sectionConfig: Record<string, { label: string; icon: string }> = {
  flight: { label: "Flights", icon: "flight" },
  hotel: { label: "Stays", icon: "hotel" },
  event: { label: "Events", icon: "confirmation_number" },
  activity: { label: "Activities & Sites", icon: "hiking" },
  restaurant: { label: "Restaurants", icon: "restaurant" },
};

/* "site" items are folded into "activity" when grouping */
const sectionKeys = ["flight", "hotel", "event", "activity", "restaurant"];

export default function ConfirmationPage() {
  const router = useRouter();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [destination, setDestination] = useState("");
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("walter_booking");
      if (stored) {
        setBooking(JSON.parse(stored));
      }
    } catch {
      /* fall through to redirect */
    }

    /* Destination context: chosen trip first, then search prefs */
    try {
      const trip = localStorage.getItem("walter_trip");
      const parsedTrip = trip ? JSON.parse(trip) : null;
      if (parsedTrip?.destination) {
        setDestination(parsedTrip.destination as string);
      } else {
        const prefs = localStorage.getItem("walter_prefs");
        const parsedPrefs = prefs ? JSON.parse(prefs) : null;
        const dest =
          (parsedPrefs?.destinations as string[])?.[0] ||
          (parsedPrefs?.destination as string) ||
          "";
        if (dest) setDestination(dest);
      }
    } catch {
      /* destination stays generic */
    }

    setChecked(true);
  }, []);

  /* No booking, nothing to show. Gentle redirect home. */
  useEffect(() => {
    if (checked && !booking) router.replace("/");
  }, [checked, booking, router]);

  const sections = useMemo(() => {
    if (!booking) return [];
    const grouped: Record<string, BookedItem[]> = {};
    for (const item of booking.items) {
      const key = item.type === "site" ? "activity" : item.type;
      (grouped[key] ??= []).push(item);
    }
    return sectionKeys
      .map((key) => {
        const sectionItems = grouped[key] || [];
        if (sectionItems.length === 0) return null;
        return { key, ...sectionConfig[key], items: sectionItems };
      })
      .filter(Boolean) as Array<{
      key: string;
      label: string;
      icon: string;
      items: BookedItem[];
    }>;
  }, [booking]);

  /* Share by email: same mailto pattern as /trip, with confirmation codes */
  const handleShare = () => {
    if (!booking) return;
    const subject = `Your trip to ${destination || "somewhere good"}`;
    const lines: string[] = [];
    for (const sec of sections) {
      lines.push(sec.label.toUpperCase());
      for (const item of sec.items) {
        lines.push(`  ${item.title} - ${item.confirmationCode}`);
      }
      lines.push("");
    }
    const body = `Booked. ${booking.items.length} ${
      booking.items.length === 1 ? "confirmation" : "confirmations"
    }, $${booking.total.toLocaleString()} all in.\n\n${lines.join(
      "\n"
    )}Walter handled the rest.`;
    window.location.href = `mailto:?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(body)}`;
  };

  if (!checked || !booking) {
    return (
      <div className="min-h-screen bg-product-bg flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const bookedDate = (() => {
    try {
      return new Date(booking.bookedAt).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return "";
    }
  })();

  const passCode = booking.id.replace(/-/g, "").slice(0, 8).toUpperCase();
  const photoUrl = `/api/photo?query=${encodeURIComponent(
    destination ? `${destination} travel landscape` : "travel landscape"
  )}`;

  return (
    <div className="min-h-screen bg-product-bg">
      {/* ── Photographic hero: the boarding pass moment ── */}
      <section className="relative h-[46vh] min-h-[360px] overflow-hidden">
        <img
          src={photoUrl}
          alt={destination || "Your destination"}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-tinted-pitch/85 via-tinted-pitch/35 to-tinted-pitch/25" />

        <header className="absolute top-0 left-0 right-0 z-10">
          <div className="max-w-[1080px] mx-auto px-6 py-5 flex items-center justify-between">
            <Link
              href="/"
              className="text-[17px] font-semibold text-snow-off-glacier"
            >
              Walter
            </Link>
            <Link
              href="/"
              className="text-sm font-semibold text-snow-off-glacier/80 hover:text-snow-off-glacier transition-colors"
            >
              Plan another trip
            </Link>
          </div>
        </header>

        <div className="absolute bottom-0 left-0 right-0">
          <div className="max-w-[1080px] mx-auto px-6 pb-20">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease: "easeOut" }}
            >
              <p className="text-snow-off-glacier/70 text-[12px] tracking-wider uppercase mb-2">
                Booked {bookedDate}
              </p>
              <h1 className="text-[40px] sm:text-[56px] font-semibold text-snow-off-glacier leading-display tracking-display">
                {destination
                  ? `You're going to ${destination}.`
                  : `You're going.`}
              </h1>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Boarding pass card ── */}
      <div className="max-w-[1080px] mx-auto px-6 -mt-12 relative z-10 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: "easeOut", delay: 0.15 }}
          className="card-base shadow-elevated overflow-hidden"
        >
          {/* Pass header */}
          <div className="flex flex-wrap items-start justify-between gap-4 p-6 sm:p-8 border-b border-dashed border-line">
            <div>
              <p className="text-ink-faint text-[12px] tracking-wider uppercase mb-1">
                Traveler
              </p>
              <p className="font-semibold text-[21px] text-ink">
                {booking.traveler.name}
              </p>
              <p className="text-ink-soft text-sm mt-1 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-accent">
                  mark_email_read
                </span>
                Confirmations sent to {booking.traveler.email}
              </p>
            </div>
            <div className="text-right">
              <p className="text-ink-faint text-[12px] tracking-wider uppercase mb-1">
                Walter booking
              </p>
              <p className="font-mono font-semibold text-[17px] text-ink tracking-wide">
                {passCode}
              </p>
            </div>
          </div>

          {/* Itinerary with confirmation codes */}
          <div className="p-6 sm:p-8 space-y-7">
            {sections.map((section) => (
              <div key={section.key}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="material-symbols-outlined text-accent text-[20px]">
                    {section.icon}
                  </span>
                  <h2 className="font-semibold text-[15px] text-ink uppercase tracking-wider">
                    {section.label}
                  </h2>
                </div>
                <div>
                  {section.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-start justify-between gap-4 py-3 border-b border-line last:border-b-0"
                    >
                      <div className="min-w-0">
                        <p className="font-semibold text-[15px] text-ink">
                          {item.title}
                        </p>
                        {item.subtitle && (
                          <p className="text-ink-soft text-xs mt-0.5">
                            {item.subtitle}
                          </p>
                        )}
                        {item.date && (
                          <p className="text-ink-faint text-xs mt-0.5">
                            {item.date}
                          </p>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                        <span className="font-mono text-[12px] font-semibold text-ink bg-raised-slate border border-line rounded-[6px] px-2 py-1 tracking-wide">
                          {item.confirmationCode}
                        </span>
                        {item.price != null && item.price > 0 && (
                          <p className="text-sm font-semibold text-ink-soft">
                            ${item.price.toLocaleString()}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Pass footer: total + actions */}
          <div className="p-6 sm:p-8 border-t border-dashed border-line">
            <div className="flex items-center justify-between mb-6">
              <span className="font-semibold text-[17px] text-ink">Total</span>
              <span className="font-semibold text-accent text-[28px]">
                ${booking.total.toLocaleString()}
              </span>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleShare}
                className="flex-1 bg-accent text-white rounded-[10px] py-3 text-sm font-semibold flex items-center justify-center gap-2 hover:bg-accent-light transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">
                  mail
                </span>
                Share this trip
              </button>
              <Link
                href="/"
                className="flex-1 rounded-[10px] border border-ink/20 text-ink py-3 text-sm font-semibold flex items-center justify-center gap-2 hover:bg-ink/5 transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">
                  travel_explore
                </span>
                Plan another trip
              </Link>
            </div>
          </div>
        </motion.div>

        <p className="text-xs text-ink-faint text-center mt-6">
          Demo checkout. No real charges or reservations were made.
        </p>
      </div>
    </div>
  );
}
