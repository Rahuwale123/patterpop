export type Tool = {
  slug: string;
  href: string;
  title: string;
  blurb: string;
  live: boolean;
};

// Single source of truth for nav, footer, sitemap and related-tools blocks.
// Only flip `live` to true once the page actually exists.
export const tools: Tool[] = [
  {
    slug: "cross-stitch-pattern-maker",
    href: "/",
    title: "Cross Stitch Pattern Maker",
    blurb: "Turn a photo into a printable chart with DMC colours.",
    live: true,
  },
  {
    slug: "perler-bead-pattern-maker",
    href: "/perler-bead-pattern-maker",
    title: "Perler Bead Pattern Maker",
    blurb: "Photo to fuse bead pattern with bead counts.",
    live: false,
  },
  {
    slug: "crochet-graph-maker",
    href: "/crochet-graph-maker",
    title: "Crochet Graph Maker",
    blurb: "Make a C2C or tapestry crochet graph from a picture.",
    live: false,
  },
  {
    slug: "knitting-chart-maker",
    href: "/knitting-chart-maker",
    title: "Knitting Chart Maker",
    blurb: "Colourwork charts sized for your gauge.",
    live: false,
  },
  {
    slug: "diamond-painting-pattern-maker",
    href: "/diamond-painting-pattern-maker",
    title: "Diamond Painting Pattern Maker",
    blurb: "Drill charts with DMC-numbered colours.",
    live: false,
  },
  {
    slug: "cross-stitch-text-generator",
    href: "/cross-stitch-text-generator",
    title: "Cross Stitch Text Generator",
    blurb: "Type words, get a stitchable alphabet chart.",
    live: false,
  },
  {
    slug: "cross-stitch-fabric-calculator",
    href: "/cross-stitch-fabric-calculator",
    title: "Fabric Calculator",
    blurb: "How much Aida or evenweave to buy.",
    live: false,
  },
  {
    slug: "floss-calculator",
    href: "/floss-calculator",
    title: "Floss Calculator",
    blurb: "Skeins needed per colour.",
    live: false,
  },
  {
    slug: "dmc-color-chart",
    href: "/dmc-color-chart",
    title: "DMC Colour Chart",
    blurb: "Every DMC floss shade with codes and names.",
    live: false,
  },
];

export const liveTools = tools.filter((t) => t.live);
