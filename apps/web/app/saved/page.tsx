"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  useSavedTripsStore,
  type SavedTrip,
} from "@/lib/stores/savedTripsStore";
import { useTripCartStore } from "@/lib/stores/tripCartStore";

export default function SavedTripsPage() {
  const router = useRouter();
  const trips = useSavedTripsStore((s) => s.trips);
  const deleteTrip = useSavedTripsStore((s) => s.deleteTrip);
  const [compareMode, setCompareMode] = useState(false);
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const toggleCompare = (id: string) => {
    setCompareIds((prev) =>
      prev.includes(id)
        ? prev.filter((x) => x !== id)
        : prev.length < 3
          ? [...prev, id]
          : prev
    );
  };

  const handleCompare = () => {
    if (compareIds.length < 2) return;
    localStorage.setItem("walter_compare_local", JSON.stringify(compareIds));
    router.push("/compare/local");
  };

  const handleLoadTrip = (trip: SavedTrip) => {
    if (compareMode) {
      toggleCompare(trip.id);
      return;
    }
    // Load this trip's items into the cart
    const cart = useTripCartStore.getState();
    cart.clearCart();
    trip.items.forEach((item) => cart.addItem(item));

    // Set prefs so the trip page shows the right destination
    const prefs = { destinations: [trip.destination], destination: trip.destination };
    localStorage.setItem("walter_prefs", JSON.stringify(prefs));

    router.push("/trip");
  };

  return (
    <div className="min-h-screen bg-page-bg">
      <header className="fixed top-0 left-0 right-0 z-20 nav-glass">
        <div className="max-w-content mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-white text-[17px] font-semibold">Walter</Link>
          <div className="flex items-center gap-4">
            <Link href="/quiz" className="text-on-dark-secondary text-[11px] hidden sm:block hover:text-white transition-colors">
              Plan a Trip
            </Link>
            <Link
              href="/quiz"
              className="bg-white/15 border border-white/20 text-white rounded-pill px-4 py-1.5 text-[11px] font-semibold hover:bg-white/25 transition-colors"
            >
              New Trip
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-content mx-auto px-6 pt-28 pb-16">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="font-semibold text-[28px] text-gray-dark leading-page mb-2">
              Saved Trips
            </h1>
            <p className="text-on-light-secondary text-[17px]">
              {trips.length === 0
                ? "No saved trips yet. Plan a trip and save it here."
                : `${trips.length} trip${trips.length !== 1 ? "s" : ""} saved`}
            </p>
          </div>
          {trips.length >= 2 && (
            <button
              onClick={() => {
                setCompareMode(!compareMode);
                if (compareMode) setCompareIds([]);
              }}
              className={`text-sm font-semibold flex items-center gap-1.5 transition-colors ${
                compareMode ? "text-accent" : "text-on-light-secondary hover:text-accent"
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">compare_arrows</span>
              {compareMode ? "Cancel" : "Compare"}
            </button>
          )}
        </div>

        {/* Compare bar */}
        {compareMode && compareIds.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="card-base p-4 mb-6 flex items-center justify-between"
          >
            <p className="text-sm text-on-light-secondary">
              {compareIds.length} selected <span className="text-on-light-tertiary">(pick 2-3)</span>
            </p>
            <button
              onClick={handleCompare}
              disabled={compareIds.length < 2}
              className="bg-accent text-white rounded-[10px] px-5 py-2 text-sm font-semibold hover:bg-accent-light transition-colors disabled:opacity-40"
            >
              Compare
            </button>
          </motion.div>
        )}

        {trips.length === 0 ? (
          <div className="card-base p-10 text-center">
            <span className="material-symbols-outlined text-on-light-tertiary text-4xl mb-4 block">bookmark_border</span>
            <p className="font-semibold text-gray-dark text-[17px] mb-2">No saved trips</p>
            <p className="text-on-light-secondary text-sm mb-6 max-w-sm mx-auto">
              Take the quiz, build your trip, and save it here to compare with other options later.
            </p>
            <Link
              href="/quiz"
              className="inline-flex bg-accent text-white rounded-[10px] px-6 py-3 font-semibold hover:bg-accent-light transition-colors"
            >
              Plan your first trip
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence>
              {trips.map((trip) => {
                const isSelected = compareIds.includes(trip.id);
                const flightCount = trip.items.filter((i) => i.type === "flight").length;
                const hotelCount = trip.items.filter((i) => i.type === "hotel").length;
                const eventCount = trip.items.filter((i) => i.type === "event").length;
                const activityCount = trip.items.filter(
                  (i) => i.type === "activity" || i.type === "restaurant" || i.type === "site"
                ).length;

                return (
                  <motion.div
                    key={trip.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="relative"
                  >
                    {compareMode && (
                      <button
                        onClick={() => toggleCompare(trip.id)}
                        className={`absolute top-4 right-4 z-10 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                          isSelected
                            ? "bg-accent border-accent text-white"
                            : "border-on-light-tertiary text-transparent hover:border-accent"
                        }`}
                      >
                        {isSelected && (
                          <span className="material-symbols-outlined text-[14px]">check</span>
                        )}
                      </button>
                    )}

                    <div
                      onClick={() => handleLoadTrip(trip)}
                      className={`card-base p-5 cursor-pointer transition-all ${
                        compareMode && isSelected ? "ring-2 ring-accent" : ""
                      }`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-semibold text-gray-dark text-[17px] mb-1">
                            {trip.name}
                          </h3>
                          <p className="text-sm text-on-light-secondary">{trip.destination}</p>
                        </div>
                      </div>

                      {/* Stats row */}
                      <div className="flex flex-wrap gap-2 mb-3">
                        {flightCount > 0 && (
                          <span className="bg-[#e6f7f9] text-accent rounded-pill px-2 py-0.5 text-[10px] font-semibold flex items-center gap-1">
                            <span className="material-symbols-outlined text-[12px]">flight</span>
                            {flightCount}
                          </span>
                        )}
                        {hotelCount > 0 && (
                          <span className="bg-[#e6f7f9] text-accent rounded-pill px-2 py-0.5 text-[10px] font-semibold flex items-center gap-1">
                            <span className="material-symbols-outlined text-[12px]">hotel</span>
                            {hotelCount}
                          </span>
                        )}
                        {eventCount > 0 && (
                          <span className="bg-[#e6f7f9] text-accent rounded-pill px-2 py-0.5 text-[10px] font-semibold flex items-center gap-1">
                            <span className="material-symbols-outlined text-[12px]">confirmation_number</span>
                            {eventCount}
                          </span>
                        )}
                        {activityCount > 0 && (
                          <span className="bg-[#e6f7f9] text-accent rounded-pill px-2 py-0.5 text-[10px] font-semibold flex items-center gap-1">
                            <span className="material-symbols-outlined text-[12px]">hiking</span>
                            {activityCount}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-[rgba(0,101,113,0.06)]">
                        <span className="font-semibold text-accent">
                          {trip.totalCost > 0 ? `$${trip.totalCost.toLocaleString()}` : "No pricing"}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] text-on-light-tertiary">
                            {new Date(trip.createdAt).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                            })}
                          </span>
                          {deleteConfirm === trip.id ? (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteTrip(trip.id);
                                setDeleteConfirm(null);
                              }}
                              className="text-red-500 text-[11px] font-semibold"
                            >
                              Confirm
                            </button>
                          ) : (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setDeleteConfirm(trip.id);
                                setTimeout(() => setDeleteConfirm(null), 3000);
                              }}
                              className="text-on-light-tertiary hover:text-red-500 transition-colors"
                            >
                              <span className="material-symbols-outlined text-[16px]">delete</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </main>
    </div>
  );
}
