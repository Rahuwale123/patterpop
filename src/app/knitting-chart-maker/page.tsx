import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo/metadata";
import { ToolPage } from "@/components/layout/ToolPage";
import { ToolLoader } from "@/components/tool/ToolLoader";
import { Prose } from "@/components/content/Prose";
import { StitchDivider } from "@/components/content/StitchDivider";

const description =
  "Turn a photo into a knitting chart for intarsia or colourwork. The chart is drawn to your gauge, so the picture keeps its shape when knitted. Free.";

export const metadata: Metadata = buildMetadata({
  title: "Free Knitting Chart Maker – Colourwork Charts from Photos",
  description,
  path: "/knitting-chart-maker",
});

const faqs = [
  {
    q: "Why does this knitting chart maker ask for my gauge?",
    a: "Knitted stitches are wider than they are tall. Using your stitches and rows per 10 cm, the chart is drawn with the right proportions, so a circle in your photo is still a circle once it is knitted.",
  },
  {
    q: "Is it for intarsia or Fair Isle?",
    a: "Both. For intarsia, large areas of colour work well. For stranded colourwork, keep to two or three colours per row and avoid long floats.",
  },
  {
    q: "How many colours should I use?",
    a: "Between 3 and 8 for most projects. Each colour means another ball and more ends to weave in.",
  },
  {
    q: "Which way do I read the chart?",
    a: "Usually from the bottom right, reading right-side rows from right to left and wrong-side rows from left to right. Row and column numbers are printed every 10 stitches.",
  },
  {
    q: "Is it free?",
    a: "Yes. Make and download as many charts as you like, with no account.",
  },
];

export default function KnittingPage() {
  return (
    <ToolPage
      href="/knitting-chart-maker"
      name="Knitting Chart Maker"
      h1="Free Knitting Chart Maker"
      subline="Turn a photo into a colourwork chart drawn to your knitting gauge."
      description={description}
      tool={<ToolLoader craft="knitting" />}
      faqs={faqs}
      faqHeading="Knitting chart maker FAQ"
    >
      <Prose>
        <p>
          This knitting chart maker turns a picture into a colourwork chart. Most chart tools use square cells, but
          knitted stitches are wider than they are tall, so the knitted picture comes out squashed. Here the cells are
          shaped to your gauge, so what you see on the chart is what you get in the fabric.
        </p>
        <h2>How to make a knitting chart from a photo</h2>
        <ol className="list-decimal space-y-2 pl-6">
          <li>
            <strong>Knit a swatch</strong> in your yarn and count stitches and rows in 10 cm. Enter both numbers.
          </li>
          <li>
            <strong>Upload a photo and crop it</strong> to the shape of the piece, for example a square for a cushion.
          </li>
          <li>
            <strong>Choose the width in stitches and the colours.</strong> Start with 4 to 6 colours.
          </li>
          <li>
            <strong>Download the chart</strong> with numbered rows, a colour key, and the finished size.
          </li>
        </ol>
      </Prose>
      <StitchDivider />
      <Prose>
        <h2>Tips for knitted pictures</h2>
        <ul className="x-list space-y-2">
          <li>
            <strong>Bold beats detailed.</strong> Strong outlines and few colours read well from across the room.
          </li>
          <li>
            <strong>Use Simplify background</strong> so the background is one or two colours and your subject gets the
            rest.
          </li>
          <li>
            <strong>Block the finished piece</strong> to even out the stitches.
          </li>
        </ul>
      </Prose>
    </ToolPage>
  );
}
