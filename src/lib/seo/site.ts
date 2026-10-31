export const site = {
  name: "PatternPop",
  url: "https://patternpop.online",
  defaultOgImage: "/og/default.png",
  locale: "en_US",
  contactEmail: "hello@patternpop.online",
} as const;

export function absoluteUrl(path: string): string {
  if (path === "/" || path === "") return site.url;
  return `${site.url}${path.startsWith("/") ? path : `/${path}`}`;
}
