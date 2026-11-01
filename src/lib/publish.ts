import { guides } from "@/data/guides";
import { tools } from "@/data/tools";

/** The date pages are judged against when building (UTC). PATTERNPOP_TODAY overrides it for previews. */
export const BUILD_DATE = process.env.PATTERNPOP_TODAY ?? new Date().toISOString().slice(0, 10);

export const isPublished = (publishDate: string, today = BUILD_DATE) => publishDate <= today;

export type LinkItem = { href: string; title: string; blurb: string; publishDate: string };

export const toolLinks: LinkItem[] = tools.map((t) => ({ href: t.href, title: t.title, blurb: t.blurb, publishDate: t.publishDate }));
export const guideLinks: LinkItem[] = guides.map((g) => ({
  href: `/guides/${g.slug}`,
  title: g.title,
  blurb: g.blurb,
  publishDate: g.publishDate,
}));
