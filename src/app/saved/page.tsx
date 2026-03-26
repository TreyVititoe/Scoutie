"use client";

import Link from "next/link";
import { useTripStore } from "@/lib/store";

export default function SavedPage() {
  const { savedTrips, removeSavedTrip } = useTripStore();

  return (
    <div className="py-8 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Saved Trips</h1>

      {savedTrips.length === 0 ? (
        <div className="text-center py-16 space-y-4">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
            </svg>
          </div>
          <p className="text-gray-500">No saved trips yet.</p>
          <Link href="/quiz" className="btn-primary inline-block">
            Plan Your First Trip
          </Link>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {savedTrips.map((trip) => (
            <div key={trip.id} className="card p-5 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="font-semibold text-gray-900">{trip.name}</h2>
                  <p className="text-sm text-gray-400">
                    {trip.plan.startDate} → {trip.plan.endDate}
                  </p>
                </div>
                <button
                  onClick={() => removeSavedTrip(trip.id)}
                  className="text-gray-300 hover:text-red-400 transition-colors"
                  aria-label="Remove trip"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 6h18" />
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  </svg>
                </button>
              </div>

              <div className="flex items-center gap-4 text-sm">
                <span className="text-brand-600 font-semibold">${trip.plan.totalBudget.toLocaleString()}</span>
                <span className="text-gray-300">·</span>
                <span className="text-gray-500">{trip.plan.flights.length} flights</span>
                <span className="text-gray-300">·</span>
                <span className="text-gray-500">{trip.plan.accommodations.length} stays</span>
              </div>

              <p className="text-sm text-gray-500 line-clamp-2">{trip.plan.summary}</p>

              <p className="text-xs text-gray-300">
                Saved {new Date(trip.createdAt).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
