import type { MetadataRoute } from "next";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://scoutie.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = ["", "/explore", "/quick", "/clarify", "/about", "/privacy", "/terms"];
  return routes.map((route) => ({
    url: `${SITE_URL}${route}`,
    changeFrequency: route === "" || route === "/explore" ? "weekly" : "monthly",
    priority: route === "" ? 1 : route === "/explore" ? 0.8 : 0.4,
  }));
}
