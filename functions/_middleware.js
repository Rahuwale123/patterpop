// Cloudflare Pages middleware (runs at the edge on page requests; static files
// skip it, see public/_routes.json).
//
// 1. One public address: anything not on https://patternpop.online (the
//    *.pages.dev address, www, plain http) gets a 301 there, path and query kept.
// 2. Publishing schedule: every page is deployed, but a tool or guide whose
//    publishDate (UTC, in src/data) is still in the future answers 404, and
//    /sitemap.xml is built here from the same data. So pages go live on their
//    day with no rebuild. Set PATTERNPOP_TODAY (YYYY-MM-DD) to preview a date.

import { guides } from "../src/data/guides.ts";
import { staticPages } from "../src/data/pages.ts";
import { tools } from "../src/data/tools.ts";

const CANONICAL_HOST = "patternpop.online";
const ORIGIN = `https://${CANONICAL_HOST}`;
const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1"]);

const scheduled = [
  ...tools.map((t) => ({ path: t.href, publishDate: t.publishDate, lastmod: t.updated ?? t.publishDate, priority: t.href === "/" ? 1 : 0.8 })),
  ...guides.map((g) => ({ path: `/guides/${g.slug}`, publishDate: g.publishDate, lastmod: g.updated ?? g.publishDate, priority: 0.6 })),
];

function isHidden(path, today) {
  return scheduled.some(
    (p) =>
      p.path !== "/" &&
      p.publishDate > today &&
      (path === p.path || path === `${p.path}.html` || path === `${p.path}.txt` || path.startsWith(`${p.path}/`)),
  );
}

function sitemap(today) {
  const urls = [
    ...scheduled.filter((p) => p.publishDate <= today),
    ...staticPages.map((p) => ({ path: p.path, lastmod: p.updated, priority: p.priority })),
  ];
  const body = urls
    .map((u) => `<url>\n<loc>${u.path === "/" ? ORIGIN : ORIGIN + u.path}</loc>\n<lastmod>${u.lastmod}</lastmod>\n<priority>${u.priority}</priority>\n</url>`)
    .join("\n");
  return new Response(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`, {
    headers: { "content-type": "application/xml; charset=utf-8", "cache-control": "public, max-age=3600" },
  });
}

export async function onRequest({ request, next, env }) {
  const url = new URL(request.url);
  if (!LOCAL_HOSTS.has(url.hostname) && (url.hostname !== CANONICAL_HOST || url.protocol !== "https:")) {
    url.protocol = "https:";
    url.hostname = CANONICAL_HOST;
    url.port = "";
    return Response.redirect(url.toString(), 301);
  }

  const today = env.PATTERNPOP_TODAY || new Date().toISOString().slice(0, 10);
  const path = url.pathname.length > 1 ? url.pathname.replace(/\/$/, "") : "/";

  if (path === "/sitemap.xml") return sitemap(today);

  if (isHidden(path, today)) {
    const notFound = await env.ASSETS.fetch(new URL("/404.html", url));
    return new Response(notFound.body, {
      status: 404,
      headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" },
    });
  }
  return next();
}
