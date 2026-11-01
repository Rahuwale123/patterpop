import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo/metadata";
import { ToolPage } from "@/components/layout/ToolPage";
import { ToolLoader } from "@/components/tool/ToolLoader";
import { Prose } from "@/components/content/Prose";
import { StitchDivider } from "@/components/content/StitchDivider";

const description =
  "Turn any photo into a Perler bead pattern with real bead colours, bead counts and a pegboard layout. Free, no sign-up, and your photo stays on your device.";

export const metadata: Metadata = buildMetadata({
  title: "Free Perler Bead Pattern Maker – Photo to Bead Pattern",
  description,
  path: "/perler-bead-pattern-maker",
});

const faqs = [
  {
    q: "Is this Perler bead pattern maker free?",
    a: "Yes. Make, edit and download as many bead patterns as you like. There is no account and no watermark on standard patterns.",
  },
  {
    q: "Which bead colours does it use?",
    a: "It matches your photo to the Perler standard (5 mm) bead range, so every colour in the key is a bead you can buy. Hama Midi and Artkal beads are the same size, so the pattern works for them too if you pick the closest shades.",
  },
  {
    q: "How many pegboards will I need?",
    a: "The size panel works it out for you, using the large square Perler pegboard of 29 by 29 pegs. The size presets match one, two or three boards across.",
  },
  {
    q: "How many beads should I buy?",
    a: "The colour key lists the beads for each colour with 10% spare, because beads roll away and a few always end up in the carpet.",
  },
  {
    q: "Are my photos uploaded?",
    a: "No. The pattern is made in your browser, so the photo never leaves your phone or computer.",
  },
];

export default function PerlerPage() {
  return (
    <ToolPage
      href="/perler-bead-pattern-maker"
      name="Perler Bead Pattern Maker"
      h1="Free Perler Bead Pattern Maker"
      subline="Turn a photo into a fuse bead pattern with real Perler colours, bead counts and pegboard layout."
      description={description}
      tool={<ToolLoader craft="perler" />}
      faqs={faqs}
      faqHeading="Perler bead pattern maker FAQ"
    >
      <Prose>
        <p>
          This Perler bead pattern maker turns a photo into a bead-by-bead chart. Pick a picture, crop it, and choose
          how many beads wide it should be. Every colour is matched to a real Perler bead, and you get a bead count for
          each one, so you know exactly what to buy before you start ironing.
        </p>
        <h2>How to make a Perler bead pattern from a photo</h2>
        <ol className="list-decimal space-y-2 pl-6">
          <li>
            <strong>Choose a simple photo.</strong> Bold shapes and strong colours work best. A pet on a plain
            background or a cartoon-like logo of your own beats a busy landscape.
          </li>
          <li>
            <strong>Pick the size in boards.</strong> One large square pegboard holds 29 by 29 beads. Start with one or
            two boards across; bigger pieces get heavy and harder to iron flat.
          </li>
          <li>
            <strong>Keep the colours low.</strong> 10 to 20 colours is plenty for bead art. Fewer colours means fewer
            bags to buy and a cleaner, more graphic result.
          </li>
          <li>
            <strong>Download the chart.</strong> The PDF splits big designs into pages and adds a bead shopping list.
          </li>
        </ol>
      </Prose>
      <StitchDivider />
      <Prose>
        <h2>Tips for bead patterns that look good</h2>
        <ul className="x-list space-y-2">
          <li>
            <strong>Think in big pixels.</strong> Each bead is 5 mm, so small details disappear. Crop close to the part
            that matters.
          </li>
          <li>
            <strong>Use Simplify background.</strong> It gives the background just a few colours so more go to your
            subject.
          </li>
          <li>
            <strong>Iron with parchment paper</strong> and medium heat, then flip and iron the back lightly so the piece
            stays flat.
          </li>
        </ul>
      </Prose>
    </ToolPage>
  );
}
