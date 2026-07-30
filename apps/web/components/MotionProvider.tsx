"use client";

import { MotionConfig } from "framer-motion";

/* Honors the OS "reduce motion" setting across every Framer animation in the
 * app. Without it, users who set that preference -- often because motion
 * makes them ill -- still got the full parallax, scale, and slide treatment.
 *
 * `reducedMotion="user"` defers to the system setting rather than forcing a
 * choice, so nothing changes for everyone else. */
export default function MotionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
