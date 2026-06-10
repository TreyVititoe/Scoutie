"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  useTripCartStore,
  selectTotalPrice,
  getItemsByType,
  type CartItem,
  type CartItemType,
} from "@/lib/stores/tripCartStore";

/* ── Section config ── */
const sectionConfig: Record<
  string,
  { label: string; icon: string; stage: string }
> = {
  flight: { label: "Flights", icon: "flight", stage: "Holding your flight." },
  hotel: { label: "Stays", icon: "hotel", stage: "Confirming the stay." },
  event: {
    label: "Events",
    icon: "confirmation_number",
    stage: "Locking in tickets.",
  },
  activity: {
    label: "Activities & Sites",
    icon: "hiking",
    stage: "Reserving your spots.",
  },
  restaurant: {
    label: "Restaurants",
    icon: "restaurant",
    stage: "Securing the table.",
  },
};

const sectionOrder: Array<{ key: string; types: CartItemType[] }> = [
  { key: "flight", types: ["flight"] },
  { key: "hotel", types: ["hotel"] },
  { key: "event", types: ["event"] },
  { key: "activity", types: ["activity", "site"] },
  { key: "restaurant", types: ["restaurant"] },
];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function CheckoutPage() {
  const router = useRouter();
  const items = useTripCartStore((s) => s.items);
  const clearCart = useTripCartStore((s) => s.clearCart);
  const totalPrice = useTripCartStore(selectTotalPrice);

  /* Avoid SSR/client mismatch while the cart hydrates from localStorage */
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [touched, setTouched] = useState<{ name?: boolean; email?: boolean }>(
    {}
  );
  const [booking, setBooking] = useState(false);
  const [stageIndex, setStageIndex] = useState(0);
  const [bookError, setBookError] = useState<string | null>(null);

  const grouped = useMemo(() => getItemsByType(items), [items]);

  const sections = useMemo(() => {
    return sectionOrder
      .map((sec) => {
        const sectionItems = sec.types.flatMap((t) => grouped[t] || []);
        if (sectionItems.length === 0) return null;
        return { key: sec.key, ...sectionConfig[sec.key], items: sectionItems };
      })
      .filter(Boolean) as Array<{
      key: string;
      label: string;
      icon: string;
      stage: string;
      items: CartItem[];
    }>;
  }, [grouped]);

  /* Staged progress lines, built from what is actually in the cart */
  const stages = useMemo(
    () => [
      "Walter is on it.",
      ...sections.map((s) => s.stage),
      "Packing your confirmations.",
    ],
    [sections]
  );

  const nameError = !name.trim()
    ? "Walter needs a name for the reservations."
    : null;
  const emailError = !EMAIL_RE.test(email.trim())
    ? "That email does not look right."
    : null;

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ name: true, email: true });
    if (nameError || emailError || items.length === 0) return;

    setBooking(true);
    setBookError(null);
    setStageIndex(0);

    /* Play the staged progress, about 800ms per stage */
    const playStages = (async () => {
      for (let i = 0; i < stages.length; i++) {
        setStageIndex(i);
        await new Promise((r) => setTimeout(r, 800));
      }
    })();

    try {
      const [res] = await Promise.all([
        fetch("/api/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            items,
            traveler: { name: name.trim(), email: email.trim() },
          }),
        }),
        playStages,
      ]);
      if (!res.ok) throw new Error("checkout failed");
      const data = await res.json();
      localStorage.setItem("walter_booking", JSON.stringify(data));
      clearCart();
      router.push("/checkout/confirmation");
    } catch {
      setBooking(false);
      setBookError(
        "Walter hit turbulence. Nothing was booked or charged. Try again."
      );
    }
  };

  /* ── Loading shell while cart hydrates ── */
  if (!mounted) {
    return (
      <div className="min-h-screen bg-product-bg flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  /* ── Empty cart ── */
  if (items.length === 0 && !booking) {
    return (
      <div className="min-h-screen bg-product-bg">
        <header className="nav-glass sticky top-0 z-20">
          <div className="max-w-[1280px] mx-auto px-6 py-4 flex items-center justify-between">
            <Link href="/" className="text-[17px] font-semibold text-ink">
              Walter
            </Link>
          </div>
        </header>
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
          <span className="material-symbols-outlined text-[64px] text-ink-faint mb-4">
            shopping_bag
          </span>
          <h1 className="font-semibold text-[28px] text-ink mb-3">
            Nothing to book yet
          </h1>
          <p className="text-ink-soft text-lg max-w-md mb-8">
            Add flights, stays, and tickets to your trip first. Walter only
            books what you choose.
          </p>
          <Link
            href="/trip"
            className="bg-accent text-white rounded-[10px] px-8 py-3 text-sm font-semibold flex items-center gap-2 hover:bg-accent-light transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">
              arrow_back
            </span>
            Back to your trip
          </Link>
        </div>
      </div>
    );
  }

  /* ── Main render ── */
  return (
    <div className="min-h-screen bg-product-bg">
      <header className="nav-glass sticky top-0 z-20">
        <div className="max-w-[1280px] mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-[17px] font-semibold text-ink">
            Walter
          </Link>
          <Link
            href="/trip"
            className="flex items-center gap-1.5 text-sm font-semibold text-ink-soft hover:text-ink transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">
              arrow_back
            </span>
            Back to your trip
          </Link>
        </div>
      </header>

      <div className="max-w-[1080px] mx-auto px-6 py-10">
        <p className="text-ink-faint text-[12px] tracking-wider uppercase mb-2">
          Checkout
        </p>
        <h1 className="text-[36px] font-semibold text-ink leading-section mb-8">
          Review and book.
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* ── Left: itemized review ── */}
          <div className="lg:col-span-7 space-y-6">
            {sections.map((section) => {
              const sectionTotal = section.items.reduce(
                (sum, i) => sum + (i.price ?? 0),
                0
              );
              return (
                <motion.div
                  key={section.key}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="card-base p-5"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-accent text-[22px]">
                        {section.icon}
                      </span>
                      <h2 className="font-semibold text-[17px] text-ink">
                        {section.label}
                      </h2>
                    </div>
                    <span className="font-semibold text-sm text-ink-soft">
                      ${sectionTotal.toLocaleString()}
                    </span>
                  </div>
                  <div>
                    {section.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between py-3 border-b border-line last:border-b-0 last:pb-0"
                      >
                        <div className="min-w-0 pr-4">
                          <p className="font-semibold text-[15px] text-ink truncate">
                            {item.title}
                          </p>
                          {item.subtitle && (
                            <p className="text-ink-soft text-xs truncate mt-0.5">
                              {item.subtitle}
                            </p>
                          )}
                          {item.date && (
                            <p className="text-ink-faint text-xs mt-0.5">
                              {item.date}
                            </p>
                          )}
                        </div>
                        <p className="font-semibold text-[15px] text-ink flex-shrink-0">
                          {item.price != null && item.price > 0
                            ? `$${item.price.toLocaleString()}`
                            : "Included"}
                        </p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* ── Right: traveler + book ── */}
          <div className="lg:col-span-5 lg:sticky lg:top-24 lg:self-start">
            <form onSubmit={handleBook} className="card-base p-6" noValidate>
              <h2 className="font-semibold text-[21px] text-ink mb-1">
                Who is traveling
              </h2>
              <p className="text-ink-soft text-sm mb-6">
                Confirmations go to this name and inbox.
              </p>

              <label
                htmlFor="traveler-name"
                className="block text-sm font-semibold text-ink mb-1.5"
              >
                Full name
              </label>
              <input
                id="traveler-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onBlur={() => setTouched((t) => ({ ...t, name: true }))}
                placeholder="Ada Calhoun"
                autoComplete="name"
                className={`w-full px-4 py-3 rounded-[10px] border bg-card text-ink placeholder:text-ink-faint focus:outline-none focus:ring-2 focus:ring-accent/20 ${
                  touched.name && nameError ? "border-red-400" : "border-line"
                }`}
              />
              {touched.name && nameError && (
                <p className="text-xs text-red-600 mt-1.5">{nameError}</p>
              )}

              <label
                htmlFor="traveler-email"
                className="block text-sm font-semibold text-ink mb-1.5 mt-4"
              >
                Email
              </label>
              <input
                id="traveler-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={() => setTouched((t) => ({ ...t, email: true }))}
                placeholder="you@somewhere.com"
                autoComplete="email"
                className={`w-full px-4 py-3 rounded-[10px] border bg-card text-ink placeholder:text-ink-faint focus:outline-none focus:ring-2 focus:ring-accent/20 ${
                  touched.email && emailError ? "border-red-400" : "border-line"
                }`}
              />
              {touched.email && emailError && (
                <p className="text-xs text-red-600 mt-1.5">{emailError}</p>
              )}

              <div className="border-t border-line pt-4 mt-6 mb-5 flex items-center justify-between">
                <span className="font-semibold text-ink">Total</span>
                <span className="font-semibold text-accent text-[24px]">
                  ${totalPrice.toLocaleString()}
                </span>
              </div>

              {bookError && (
                <p className="text-sm text-red-600 mb-3">{bookError}</p>
              )}

              <button
                type="submit"
                disabled={booking}
                className="w-full bg-accent text-white rounded-[10px] py-3.5 text-sm font-semibold flex items-center justify-center gap-2 hover:bg-accent-light transition-colors disabled:opacity-60"
              >
                <span className="material-symbols-outlined text-[18px]">
                  credit_card
                </span>
                Book it all
              </button>
              <p className="text-xs text-ink-faint text-center mt-3">
                One charge. {items.length}{" "}
                {items.length === 1 ? "booking" : "bookings"}. Walter handles
                every confirmation.
              </p>
            </form>
          </div>
        </div>
      </div>

      {/* ── Booking overlay: staged Walter progress ── */}
      {booking && (
        <div className="fixed inset-0 z-50 bg-paper/95 backdrop-blur-sm flex items-center justify-center px-6">
          <div className="max-w-sm w-full text-center">
            <div className="w-10 h-10 mx-auto mb-8 border-4 border-accent border-t-transparent rounded-full animate-spin" />
            <AnimatePresence mode="wait">
              <motion.p
                key={stageIndex}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
                className="font-semibold text-[24px] text-ink"
              >
                {stages[stageIndex]}
              </motion.p>
            </AnimatePresence>
            <div className="flex items-center justify-center gap-2 mt-8">
              {stages.map((_, i) => (
                <span
                  key={i}
                  className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                    i <= stageIndex ? "bg-accent" : "bg-line"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
