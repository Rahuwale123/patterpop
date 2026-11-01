// Single source of truth for the tools: nav, footer, related links, the sitemap
// and the edge publishing gate (functions/_middleware.js) all read this file.
// A page goes live on its publishDate (UTC). Keep this file free of imports so
// the Cloudflare edge code can load it too.

export type Tool = {
  slug: string;
  href: string;
  title: string;
  blurb: string;
  /** YYYY-MM-DD (UTC). The page is hidden before this day. */
  publishDate: string;
  /** YYYY-MM-DD of the last real content change, for the sitemap */
  updated?: string;
};

export const tools: Tool[] = [
  {
    slug: "cross-stitch-pattern-maker",
    href: "/",
    title: "Cross Stitch Pattern Maker",
    blurb: "Turn a photo into a printable chart with DMC colours.",
    publishDate: "2026-11-01",
    updated: "2026-11-01",
  },
  {
    slug: "dmc-color-chart",
    href: "/dmc-color-chart",
    title: "DMC Colour Chart",
    blurb: "Every DMC floss shade with its number and name.",
    publishDate: "2026-11-03",
  },
  {
    slug: "cross-stitch-fabric-calculator",
    href: "/cross-stitch-fabric-calculator",
    title: "Fabric Calculator",
    blurb: "How much Aida or evenweave to buy for a design.",
    publishDate: "2026-11-06",
  },
  {
    slug: "floss-calculator",
    href: "/floss-calculator",
    title: "Floss Calculator",
    blurb: "How many skeins of each colour you need.",
    publishDate: "2026-11-10",
  },
  {
    slug: "perler-bead-pattern-maker",
    href: "/perler-bead-pattern-maker",
    title: "Perler Bead Pattern Maker",
    blurb: "Photo to fuse bead pattern with bead counts.",
    publishDate: "2026-11-17",
  },
  {
    slug: "cross-stitch-text-generator",
    href: "/cross-stitch-text-generator",
    title: "Cross Stitch Text Generator",
    blurb: "Type words, get a stitchable lettering chart.",
    publishDate: "2026-11-20",
  },
  {
    slug: "diamond-painting-pattern-maker",
    href: "/diamond-painting-pattern-maker",
    title: "Diamond Painting Pattern Maker",
    blurb: "Drill charts with DMC-numbered colours.",
    publishDate: "2026-11-24",
  },
  {
    slug: "crochet-graph-maker",
    href: "/crochet-graph-maker",
    title: "Crochet Graph Maker",
    blurb: "C2C and tapestry crochet graphs from a picture.",
    publishDate: "2026-12-01",
  },
  {
    slug: "knitting-chart-maker",
    href: "/knitting-chart-maker",
    title: "Knitting Chart Maker",
    blurb: "Colourwork charts shaped to your gauge.",
    publishDate: "2026-12-04",
  },
];
