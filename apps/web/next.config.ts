import type { NextConfig } from "next";

/* Content-Security-Policy, ENFORCING since 2026-08-01 after the full journey
 * was browsed with the console open and produced zero violation reports.
 * Mapbox GL, Google Fonts, Unsplash, Supabase, and Vercel Analytics each need
 * their own allowance. If a new third-party origin is added, extend the
 * matching directive here or the browser blocks it silently in production.
 *
 * img-src stays wide (https:) because shared trip pages render image URLs
 * supplied by whoever built the trip. */
const csp = [
  "default-src 'self'",
  // 'unsafe-inline'/'unsafe-eval': Next's hydration bootstrap and Mapbox GL.
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://va.vercel-scripts.com",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' data: https://fonts.gstatic.com",
  "img-src 'self' data: blob: https:",
  "connect-src 'self' https://api.mapbox.com https://events.mapbox.com https://*.supabase.co https://vitals.vercel-insights.com",
  "worker-src 'self' blob:",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join("; ");
const securityHeaders = [
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), payment=()",
  },
  { key: "Content-Security-Policy", value: csp },
];

const nextConfig: NextConfig = {
  async headers() {
    return [{ source: "/(.*)", headers: securityHeaders }];
  },
};

export default nextConfig;
