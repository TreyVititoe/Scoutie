import type { NextConfig } from "next";

/* Content-Security-Policy ships REPORT-ONLY first, on purpose. Mapbox GL,
 * Google Fonts, Unsplash, Supabase, and Vercel Analytics each need their own
 * allowance, and a wrong value breaks production silently. Report-Only
 * enforces nothing -- it only logs violations to the browser console, so the
 * policy can be verified against real traffic before it is switched to the
 * enforcing `Content-Security-Policy` header.
 *
 * TO ENFORCE: browse the whole journey with the console open, confirm zero
 * violation reports, then rename the header key below. Do not flip it blind.
 *
 * img-src stays wide (https:) because shared trip pages render image URLs
 * supplied by whoever built the trip. */
const cspReportOnly = [
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
  { key: "Content-Security-Policy-Report-Only", value: cspReportOnly },
];

const nextConfig: NextConfig = {
  async headers() {
    return [{ source: "/(.*)", headers: securityHeaders }];
  },
};

export default nextConfig;
