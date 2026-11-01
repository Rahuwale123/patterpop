import type { MetadataRoute } from "next";
import { guides } from "@/data/guides";
import { staticPages } from "@/data/pages";
import { tools } from "@/data/tools";
import { isPublished } from "@/lib/publish";
import { absoluteUrl } from "@/lib/seo/site";

export const dynamic = "force-static";

// Built-in fallback. On Cloudflare, functions/_middleware.js answers /sitemap.xml
// itself from the same data, so pages appear on their publish day without a rebuild.
// lastmod is each page's real publish or last-edited date, never the build time.
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    ...tools
      .filter((t) => isPublished(t.publishDate))
      .map((t) => ({
        url: absoluteUrl(t.href),
        lastModified: t.updated ?? t.publishDate,
        priority: t.href === "/" ? 1 : 0.8,
      })),
    ...guides
      .filter((g) => isPublished(g.publishDate))
      .map((g) => ({ url: absoluteUrl(`/guides/${g.slug}`), lastModified: g.updated ?? g.publishDate, priority: 0.6 })),
    ...staticPages.map((p) => ({ url: absoluteUrl(p.path), lastModified: p.updated, priority: p.priority })),
  ];
}

