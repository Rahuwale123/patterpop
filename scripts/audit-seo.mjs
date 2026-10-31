// Checks every exported HTML page for the SEO basics. Run after `npm run build`.
import fs from "node:fs";
import path from "node:path";

const OUT = "out";
const pages = fs.readdirSync(OUT, { recursive: true }).filter((f) => f.endsWith(".html") && !f.startsWith("_"));
const seenTitles = new Map();
let problems = 0;
const flag = (page, msg) => (problems++, console.log(`  ✗ ${page}: ${msg}`));
const decode = (s) => s.replace(/&amp;/g, "&").replace(/&#x27;|&#39;/g, "'").replace(/&quot;/g, '"');

for (const file of pages.sort()) {
  const html = fs.readFileSync(path.join(OUT, file), "utf8");
  const head = html.slice(0, html.indexOf("</head>"));
  const title = decode(head.match(/<title>([^<]*)<\/title>/)?.[1] ?? "");
  const desc = decode(head.match(/<meta name="description" content="([^"]*)"/)?.[1] ?? "");
  const canonical = head.match(/<link rel="canonical" href="([^"]*)"/)?.[1];
  const ogImage = head.match(/<meta property="og:image" content="([^"]*)"/)?.[1];
  const robots = head.match(/<meta name="robots" content="([^"]*)"/)?.[1] ?? "";
  const h1s = (html.match(/<h1[\s>]/g) ?? []).length;
  const ld = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((m) => {
    try { return JSON.parse(m[1])["@type"]; } catch { return "INVALID"; }
  });
  const noindex = robots.includes("noindex");
  console.log(`${file}\n  title (${title.length}): ${title}\n  desc (${desc.length})  canonical: ${canonical ?? "-"}  og:image: ${ogImage ? "yes" : "no"}  h1: ${h1s}  json-ld: ${ld.join(", ") || "-"}${noindex ? "  [noindex]" : ""}`);
  if (!title) flag(file, "missing title");
  if (title.length > 60) flag(file, "title over 60 chars");
  if (seenTitles.has(title)) flag(file, `title duplicates ${seenTitles.get(title)}`);
  seenTitles.set(title, file);
  if (h1s !== 1) flag(file, `${h1s} h1 elements`);
  if (ld.includes("INVALID")) flag(file, "invalid JSON-LD");
  if (!noindex) {
    if (desc.length < 140 || desc.length > 155) flag(file, `description is ${desc.length} chars (want 140-155)`);
    if (!canonical) flag(file, "missing canonical");
    if (!ogImage) flag(file, "missing og:image");
  }
}
console.log(problems ? `\n${problems} problem(s)` : "\nAll pages pass");
process.exit(problems ? 1 : 0);
