import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo/metadata";
import { ToolPage } from "@/components/layout/ToolPage";
import { Prose } from "@/components/content/Prose";
import { StitchDivider } from "@/components/content/StitchDivider";
import { DmcChart, type ChartColour } from "@/components/calc/DmcChart";
import { brandPalette } from "@/lib/pattern/palettes";
import { chromaHue } from "@/lib/color/skin";

const description =
  "Every DMC embroidery floss colour in one searchable chart: all 489 shades with numbers, names and swatches. Filter by colour family or search by number.";

export const metadata: Metadata = buildMetadata({
  title: "DMC Color Chart: All 489 Floss Shades, Numbers and Names",
  description,
  path: "/dmc-color-chart",
});

function family(L: number, a: number, b: number): string {
  const { C, h } = chromaHue(a, b);
  if (L > 90 && C < 10) return "Whites";
  if (L < 22 && C < 12) return "Blacks";
  if (C < 9) return "Greys";
  if (h >= 35 && h < 95 && L < 60 && C < 45) return "Browns";
  if (h >= 345 || h < 25) return L > 62 ? "Pinks" : "Reds";
  if (h < 65) return "Oranges";
  if (h < 105) return "Yellows";
  if (h < 200) return "Greens";
  if (h < 290) return "Blues";
  return L > 70 && h > 320 ? "Pinks" : "Purples";
}

// Sorted by DMC number (numbers first, then named threads like Blanc and Ecru)
const colours: ChartColour[] = brandPalette("dmc")
  .colours.map((c) => ({ code: c.code, name: c.name, hex: c.hex, family: family(...c.lab) }))
  .sort((x, y) => {
    const nx = Number(x.code);
    const ny = Number(y.code);
    if (Number.isNaN(nx) || Number.isNaN(ny)) return Number.isNaN(nx) ? (Number.isNaN(ny) ? x.code.localeCompare(y.code) : 1) : -1;
    return nx - ny;
  });

const faqs = [
  {
    q: "How many DMC floss colours are there?",
    a: "This chart lists 489 shades of DMC six-strand embroidery floss, including Blanc, Ecru, B5200 and the newer colours numbered 01 to 35.",
  },
  {
    q: "Are the colours on this DMC colour chart exact?",
    a: "No screen can show thread exactly. DMC has never published official screen colours, so these are careful approximations. Use them to plan, then check against a real skein or a printed DMC card before you buy lots.",
  },
  {
    q: "What is the difference between Blanc, B5200 and Ecru?",
    a: "B5200 is the brightest, snowy white. Blanc is a soft white, and Ecru is a warm off-white with a hint of beige.",
  },
  {
    q: "How do I find the DMC number for a colour in my photo?",
    a: "Use the free cross stitch pattern maker. It matches every colour in your photo to the nearest DMC number for you.",
  },
];

export default function DmcChartPage() {
  return (
    <ToolPage
      href="/dmc-color-chart"
      name="DMC Colour Chart"
      h1="DMC Color Chart"
      subline="All 489 DMC embroidery floss colours with numbers, names and swatches. Search or filter by colour."
      description={description}
      tool={<DmcChart colours={colours} />}
      faqs={faqs}
      faqHeading="DMC colour chart FAQ"
    >
      <Prose>
        <p>
          This DMC color chart lists every shade of DMC stranded cotton with its number, name and an on-screen swatch.
          Search by number when a pattern calls for a thread you don&apos;t know, or filter by colour family to plan a
          palette.
        </p>
        <h2>How to read DMC numbers</h2>
        <p>
          DMC numbers are labels, not a scale, so 310 and 311 are not neighbours in colour. Within a family the names
          help: &quot;Very Light&quot;, &quot;Light&quot;, &quot;Medium&quot;, &quot;Dark&quot; and &quot;Very Dark&quot; are
          steps of the same hue, which is useful when you need a shade for highlights or shadows.
        </p>
      </Prose>
      <StitchDivider />
      <Prose>
        <h2>Picking threads for a project</h2>
        <ul className="x-list space-y-2">
          <li>
            <strong>Check in daylight.</strong> Thread looks different under warm indoor light.
          </li>
          <li>
            <strong>Buy all skeins of a colour together</strong> so they come from the same dye lot.
          </li>
          <li>
            <strong>Let the pattern maker choose for you.</strong> It picks DMC numbers for a photo and lists the skeins
            to buy.
          </li>
        </ul>
      </Prose>
    </ToolPage>
  );
}
