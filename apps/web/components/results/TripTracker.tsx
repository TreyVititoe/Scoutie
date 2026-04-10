"use client";

import { useState, useMemo, useCallback } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  useTripCartStore,
  getItemsByType,
  type CartItemType,
} from "@/lib/stores/tripCartStore";

/* ─── Type icon map (Material Symbols) ─── */
const typeIcons: Record<CartItemType, string> = {
  flight: "flight",
  hotel: "hotel",
  event: "event",
  activity: "hiking",
  restaurant: "restaurant",
  site: "location_on",
};

const typeLabels: Record<CartItemType, string> = {
  flight: "Flights",
  hotel: "Stays",
  event: "Events",
  activity: "Activities",
  restaurant: "Restaurants",
  site: "Sites",
};

/* Group display order */
const groupOrder: CartItemType[] = [
  "flight",
  "hotel",
  "event",
  "activity",
  "restaurant",
  "site",
];

/* ─── Format price ─── */
function formatPrice(price: number | null): string {
  if (price === null) return "--";
  return `$${price.toLocaleString()}`;
}

/* ─── Share hook ─── */
function useShareTrip() {
  const [copied, setCopied] = useState(false);

  const share = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement("textarea");
      textarea.value = window.location.href;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, []);

  return { share, copied };
}

/* ─── Desktop Sidebar ─── */
function DesktopSidebar() {
  const removeItem = useTripCartStore((s) => s.removeItem);
  const items = useTripCartStore((s) => s.items);
  const totalPrice = useMemo(() => items.reduce((sum, i) => sum + (i.price ?? 0), 0), [items]);
  const itemCount = items.length;
  const grouped = useMemo(() => getItemsByType(items), [items]);
  const { share, copied } = useShareTrip();

  return (
    <aside className="hidden lg:block fixed top-24 right-8 w-[300px] z-30">
      <div className="bg-white rounded-[8px] p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-[21px] font-semibold text-gray-dark">
            Your Trip
          </h2>
          {itemCount > 0 && (
            <span className="bg-accent text-white text-[12px] font-semibold rounded-pill px-2 h-5 flex items-center justify-center">
              {itemCount}
            </span>
          )}
        </div>

        {/* Item list */}
        {itemCount === 0 ? (
          <div className="py-8 text-center">
            <span className="material-symbols-outlined text-on-light-tertiary text-4xl mb-3 block">
              add_shopping_cart
            </span>
            <p className="text-on-light-tertiary text-sm font-sans leading-relaxed">
              Add flights, stays, and events to build your trip
            </p>
          </div>
        ) : (
          <div className="max-h-[calc(100vh-320px)] overflow-y-auto -mx-2 px-2 scrollbar-hide">
            {groupOrder.map((type) => {
              const items = grouped[type];
              if (!items || items.length === 0) return null;
              return (
                <div key={type} className="mb-4 last:mb-0">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-on-light-tertiary mb-2">
                    {typeLabels[type]}
                  </p>
                  <AnimatePresence mode="popLayout">
                    {items.map((item) => (
                      <motion.div
                        key={item.id}
                        layout
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20, height: 0, marginBottom: 0 }}
                        transition={{ duration: 0.25, ease: "easeOut" }}
                        className="bg-gray-light rounded-[8px] p-3 flex items-center gap-3 mb-2 group"
                      >
                        <span className="material-symbols-outlined text-on-light-secondary text-lg flex-shrink-0">
                          {typeIcons[item.type]}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-dark truncate">
                            {item.title}
                          </p>
                        </div>
                        <span className="text-sm font-semibold text-accent flex-shrink-0">
                          {formatPrice(item.price)}
                        </span>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-[8px] hover:bg-white"
                          aria-label={`Remove ${item.title}`}
                        >
                          <span className="material-symbols-outlined text-on-light-tertiary text-base">
                            close
                          </span>
                        </button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        )}

        {/* Footer */}
        <div className="border-t border-black/5 mt-4 pt-4">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-on-light-secondary">
              Estimated total
            </span>
            <span className="font-semibold text-accent text-2xl">
              {totalPrice > 0 ? `$${totalPrice.toLocaleString()}` : "--"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/trip"
              className={`flex-1 block text-center text-sm font-semibold transition-colors ${
                itemCount > 0
                  ? "bg-accent text-white rounded-[8px] px-4 py-2"
                  : "bg-gray-light text-on-light-tertiary rounded-[8px] px-4 py-2 pointer-events-none"
              }`}
              aria-disabled={itemCount === 0}
              tabIndex={itemCount === 0 ? -1 : undefined}
            >
              View My Trip
            </Link>
            {itemCount > 0 && (
              <button
                onClick={share}
                className="relative flex-shrink-0 border border-gray-dark text-gray-dark rounded-[8px] px-4 py-2 text-sm flex items-center justify-center transition-colors"
                aria-label="Share trip"
                title="Share trip"
              >
                <span className="material-symbols-outlined text-lg">
                  {copied ? "check" : "share"}
                </span>
                <AnimatePresence>
                  {copied && (
                    <motion.span
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] font-semibold text-accent bg-accent-light px-2 py-0.5 rounded-[8px]"
                    >
                      Link copied
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}

/* ─── Mobile Bottom Bar + Sheet ─── */
function MobileBar() {
  const [expanded, setExpanded] = useState(false);
  const removeItem = useTripCartStore((s) => s.removeItem);
  const items = useTripCartStore((s) => s.items);
  const totalPrice = useMemo(() => items.reduce((sum, i) => sum + (i.price ?? 0), 0), [items]);
  const itemCount = items.length;
  const grouped = useMemo(() => getItemsByType(items), [items]);
  const { share, copied } = useShareTrip();

  if (itemCount === 0) return null;

  return (
    <>
      {/* Backdrop */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 z-40 lg:hidden"
            onClick={() => setExpanded(false)}
          />
        )}
      </AnimatePresence>

      {/* Slide-up sheet */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-white rounded-t-[8px] max-h-[70vh] flex flex-col shadow-elevated"
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-on-light-tertiary" />
            </div>

            {/* Sheet header */}
            <div className="flex items-center justify-between px-6 py-3 border-b border-black/5">
              <h2 className="text-[21px] font-semibold text-gray-dark">
                Your Trip
              </h2>
              <button
                onClick={() => setExpanded(false)}
                className="w-8 h-8 flex items-center justify-center rounded-[8px] hover:bg-gray-light"
              >
                <span className="material-symbols-outlined text-on-light-secondary text-xl">
                  close
                </span>
              </button>
            </div>

            {/* Sheet items */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {groupOrder.map((type) => {
                const items = grouped[type];
                if (!items || items.length === 0) return null;
                return (
                  <div key={type} className="mb-4 last:mb-0">
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-on-light-tertiary mb-2">
                      {typeLabels[type]}
                    </p>
                    <AnimatePresence mode="popLayout">
                      {items.map((item) => (
                        <motion.div
                          key={item.id}
                          layout
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{
                            opacity: 0,
                            x: -20,
                            height: 0,
                            marginBottom: 0,
                          }}
                          transition={{ duration: 0.25, ease: "easeOut" }}
                          className="bg-gray-light rounded-[8px] p-3 flex items-center gap-3 mb-2"
                        >
                          <span className="material-symbols-outlined text-on-light-secondary text-lg flex-shrink-0">
                            {typeIcons[item.type]}
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-dark truncate">
                              {item.title}
                            </p>
                          </div>
                          <span className="text-sm font-semibold text-accent flex-shrink-0">
                            {formatPrice(item.price)}
                          </span>
                          <button
                            onClick={() => removeItem(item.id)}
                            className="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-[8px] hover:bg-white"
                            aria-label={`Remove ${item.title}`}
                          >
                            <span className="material-symbols-outlined text-on-light-tertiary text-base">
                              close
                            </span>
                          </button>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>

            {/* Sheet footer */}
            <div className="border-t border-black/5 px-6 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-on-light-secondary">
                  Estimated total
                </span>
                <span className="font-semibold text-accent text-2xl">
                  ${totalPrice.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Link
                  href="/trip"
                  className="flex-1 block bg-accent text-white rounded-[8px] px-4 py-2 text-center text-sm font-semibold"
                >
                  View My Trip
                </Link>
                <button
                  onClick={share}
                  className="relative flex-shrink-0 border border-gray-dark text-gray-dark rounded-[8px] px-4 py-2 text-sm flex items-center justify-center transition-colors"
                  aria-label="Share trip"
                  title="Share trip"
                >
                  <span className="material-symbols-outlined text-lg">
                    {copied ? "check" : "share"}
                  </span>
                  <AnimatePresence>
                    {copied && (
                      <motion.span
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] font-semibold text-accent bg-accent-light px-2 py-0.5 rounded-[8px]"
                      >
                        Link copied
                      </motion.span>
                    )}
                  </AnimatePresence>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Collapsed bottom bar */}
      <div className="fixed bottom-0 left-0 right-0 z-30 lg:hidden pb-[env(safe-area-inset-bottom)]">
        <div className="bg-white border-t border-black/5 px-5 py-3 flex items-center justify-between">
          <button
            onClick={() => setExpanded(true)}
            className="flex items-center gap-3"
          >
            <span className="bg-accent text-white text-[12px] font-semibold rounded-pill px-2 h-5 flex items-center justify-center">
              {itemCount}
            </span>
            <span className="font-semibold text-gray-dark text-lg">
              ${totalPrice.toLocaleString()}
            </span>
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={share}
              className="relative border border-gray-dark text-gray-dark rounded-[8px] px-3 py-1.5 flex items-center justify-center transition-colors"
              aria-label="Share trip"
            >
              <span className="material-symbols-outlined text-lg">
                {copied ? "check" : "share"}
              </span>
              <AnimatePresence>
                {copied && (
                  <motion.span
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] font-semibold text-accent bg-accent-light px-2 py-0.5 rounded-[8px]"
                  >
                    Link copied
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
            <Link
              href="/trip"
              className="bg-accent text-white rounded-[8px] px-4 py-2 text-sm font-semibold"
            >
              View Trip
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

/* ─── Main export ─── */
export default function TripTracker() {
  return (
    <>
      <DesktopSidebar />
      <MobileBar />
    </>
  );
}
