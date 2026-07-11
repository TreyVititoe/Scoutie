"use client";

import { motion } from "framer-motion";

/*
 * Loading bar as a flight: a little plane sweeps the track and pulls a
 * cornflower contrail behind it, then banks back for another pass.
 * Mirror of apps/mobile/components/PlaneLoader.tsx.
 */
export default function PlaneLoader({ width = 220 }: { width?: number }) {
  const PLANE = 22;
  const track = width - PLANE;
  const sweep = {
    duration: 1.8,
    repeat: Infinity,
    ease: "easeInOut" as const,
  };

  return (
    <div
      className="relative flex items-center"
      style={{ width, height: PLANE }}
      role="progressbar"
      aria-label="Loading"
    >
      {/* faint track */}
      <div className="absolute inset-x-0 h-[3px] rounded-full bg-accent-tint" />
      {/* contrail */}
      <motion.div
        className="absolute left-0 h-[3px] rounded-full bg-accent"
        initial={{ width: 0, opacity: 0 }}
        animate={{ width: [0, track], opacity: [0, 1, 1, 0] }}
        transition={sweep}
      />
      {/* the plane */}
      <motion.span
        aria-hidden
        className="material-symbols-outlined absolute text-accent rotate-90"
        style={{ fontSize: PLANE }}
        initial={{ x: 0, opacity: 0 }}
        animate={{ x: [0, track], opacity: [0, 1, 1, 0] }}
        transition={sweep}
      >
        flight
      </motion.span>
    </div>
  );
}
