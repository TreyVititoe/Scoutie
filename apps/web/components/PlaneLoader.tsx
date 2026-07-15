"use client";

import { motion } from "framer-motion";

/*
 * Loading bar as a flight: the plane makes one pass, decelerating as it
 * nears the far end (a progress feel, not a loop), pulling a cornflower
 * contrail behind it. The rotation lives on an inner span because the
 * motion transform on the outer element would overwrite it.
 * Mirror of apps/mobile/components/PlaneLoader.tsx.
 */
export default function PlaneLoader({
  width = 220,
  durationMs = 14000,
}: {
  width?: number;
  durationMs?: number;
}) {
  const PLANE = 22;
  const track = width - PLANE;
  /* Ease out to ~96% and hold; the component unmounts when loading ends. */
  const flight = {
    duration: durationMs / 1000,
    ease: [0.1, 0.6, 0.3, 1] as const,
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
        initial={{ width: 0 }}
        animate={{ width: track * 0.96 }}
        transition={flight}
      />
      {/* the plane */}
      <motion.span
        aria-hidden
        className="absolute"
        initial={{ x: 0 }}
        animate={{ x: track * 0.96 }}
        transition={flight}
      >
        <span
          className="material-symbols-outlined block rotate-90 translate-y-[1.95px] text-accent"
          style={{ fontSize: PLANE }}
        >
          flight
        </span>
      </motion.span>
    </div>
  );
}
