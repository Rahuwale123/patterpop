import type { MetadataRoute } from "next";
import { liveTools } from "@/data/tools";
import { absoluteUrl } from "@/lib/seo/site";

export const dynamic = "force-static";

// Only pages that exist. Tools come from data/tools.ts and appear here once `live` is true.
const pages = ["/about", "/privacy", "/terms", "/contact"];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return [
    ...liveTools.map((t) => ({
      url: absoluteUrl(t.href),
      lastModified,
      changeFrequency: "monthly" as const,
      priority: t.href === "/" ? 1 : 0.8,
    })),
    ...pages.map((p) => ({ url: absoluteUrl(p), lastModified, changeFrequency: "yearly" as const, priority: 0.3 })),
  ];
}
