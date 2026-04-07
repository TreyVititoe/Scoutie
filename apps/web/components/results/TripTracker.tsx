"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  useTripCartStore,
  selectTotalPrice,
  selectItemCount,
  selectItemsByType,
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

/* ─── Desktop Sidebar ─── */
function DesktopSidebar() {
  const removeItem = useTripCartStore((s) => s.removeItem);
  const totalPrice = useTripCartStore(selectTotalPrice);
  const itemCount = useTripCartStore(selectItemCount);
  const grouped = useTripCartStore(selectItemsByType);

  return (
    <aside className="hidden lg:block w-[320px] flex-shrink-0">
      <div className="card-3d bg-white rounded-[2rem] p-6 sticky top-24">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-headline font-extrabold text-xl text-on-surface">
            Your Trip
          </h2>
          {itemCount > 0 && (
            <span className="inline-flex items-center justify-center min-w-[24px] h-6 px-2 rounded-full bg-primary text-white text-xs font-bold font-body">
              {itemCount}
            </span>
          )}
        </div>

        {/* Item list */}
        {itemCount === 0 ? (
          <div className="py-8 text-center">
            <span className="material-symbols-outlined text-outline-variant text-4xl mb-3 block">
              add_shopping_cart
            </span>
            <p className="text-on-surface-variant text-sm font-body leading-relaxed">
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
                  <p className="text-[10px] font-bold uppercase tracking-widest text-outline-variant font-body mb-2">
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
                        className="flex items-center gap-3 py-2 mb-1 group"
                      >
                        <span className="material-symbols-outlined text-on-surface-variant text-lg flex-shrink-0">
                          {typeIcons[item.type]}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-body font-medium text-on-surface truncate">
                            {item.title}
                          </p>
                        </div>
                        <span className="text-sm font-mono text-on-surface-variant flex-shrink-0">
                          {formatPrice(item.price)}
                        </span>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full hover:bg-surface-container-highest"
                          aria-label={`Remove ${item.title}`}
                        >
                          <span className="material-symbols-outlined text-outline-variant text-base">
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
        <div className="border-t border-outline-variant/20 mt-4 pt-4">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-body text-on-surface-variant">
              Estimated total
            </span>
            <span className="font-headline font-black text-primary text-2xl">
              {totalPrice > 0 ? `$${totalPrice.toLocaleString()}` : "--"}
            </span>
          </div>
          <Link
            href="/trip"
            className={`block w-full py-3.5 rounded-full text-center font-extrabold font-headline text-sm transition-all ${
              itemCount > 0
                ? "btn-primary-gradient text-white shadow-xl shadow-primary/20 hover:shadow-2xl hover:shadow-primary/30 hover:-translate-y-0.5"
                : "bg-surface-container-low text-outline-variant pointer-events-none"
            }`}
            aria-disabled={itemCount === 0}
            tabIndex={itemCount === 0 ? -1 : undefined}
          >
            View My Trip
          </Link>
        </div>
      </div>
    </aside>
  );
}

/* ─── Mobile Bottom Bar + Sheet ─── */
function MobileBar() {
  const [expanded, setExpanded] = useState(false);
  const removeItem = useTripCartStore((s) => s.removeItem);
  const totalPrice = useTripCartStore(selectTotalPrice);
  const itemCount = useTripCartStore(selectItemCount);
  const grouped = useTripCartStore(selectItemsByType);

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
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-white rounded-t-[2rem] max-h-[70vh] flex flex-col shadow-2xl"
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-outline-variant/30" />
            </div>

            {/* Sheet header */}
            <div className="flex items-center justify-between px-6 py-3 border-b border-outline-variant/15">
              <h2 className="font-headline font-extrabold text-lg text-on-surface">
                Your Trip
              </h2>
              <button
                onClick={() => setExpanded(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface-container-highest"
              >
                <span className="material-symbols-outlined text-on-surface-variant text-xl">
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
                    <p className="text-[10px] font-bold uppercase tracking-widest text-outline-variant font-body mb-2">
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
                          className="flex items-center gap-3 py-2.5 mb-1"
                        >
                          <span className="material-symbols-outlined text-on-surface-variant text-lg flex-shrink-0">
                            {typeIcons[item.type]}
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-body font-medium text-on-surface truncate">
                              {item.title}
                            </p>
                          </div>
                          <span className="text-sm font-mono text-on-surface-variant flex-shrink-0">
                            {formatPrice(item.price)}
                          </span>
                          <button
                            onClick={() => removeItem(item.id)}
                            className="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-full hover:bg-surface-container-highest"
                            aria-label={`Remove ${item.title}`}
                          >
                            <span className="material-symbols-outlined text-outline-variant text-base">
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
            <div className="border-t border-outline-variant/15 px-6 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-body text-on-surface-variant">
                  Estimated total
                </span>
                <span className="font-headline font-black text-primary text-2xl">
                  ${totalPrice.toLocaleString()}
                </span>
              </div>
              <Link
                href="/trip"
                className="block w-full py-3.5 rounded-full text-center font-extrabold font-headline text-sm btn-primary-gradient text-white shadow-xl shadow-primary/20"
              >
                View My Trip
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Collapsed bottom bar */}
      <div className="fixed bottom-0 left-0 right-0 z-30 lg:hidden pb-[env(safe-area-inset-bottom)]">
        <div className="bg-white/90 backdrop-blur-xl border-t border-outline-variant/15 px-5 py-3 flex items-center justify-between">
          <button
            onClick={() => setExpanded(true)}
            className="flex items-center gap-3"
          >
            <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-primary text-white text-xs font-bold font-body">
              {itemCount}
            </span>
            <span className="font-headline font-black text-on-surface text-lg">
              ${totalPrice.toLocaleString()}
            </span>
          </button>
          <Link
            href="/trip"
            className="px-5 py-2.5 rounded-full font-extrabold font-headline text-sm btn-primary-gradient text-white shadow-lg shadow-primary/20"
          >
            View Trip
          </Link>
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
