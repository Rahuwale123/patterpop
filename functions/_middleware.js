// Cloudflare Pages middleware: one public address only.
// Anything not on https://patternpop.online (the *.pages.dev address, www,
// plain http) gets a permanent redirect there, keeping the path and query.
// Static files skip this (see public/_routes.json), so only page loads run it.

const CANONICAL_HOST = "patternpop.online";
const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1"]);

export async function onRequest({ request, next }) {
  const url = new URL(request.url);
  if (LOCAL_HOSTS.has(url.hostname)) return next();
  if (url.hostname === CANONICAL_HOST && url.protocol === "https:") return next();
  url.protocol = "https:";
  url.hostname = CANONICAL_HOST;
  url.port = "";
  return Response.redirect(url.toString(), 301);
}
