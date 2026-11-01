import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo/metadata";
import { ToolPage } from "@/components/layout/ToolPage";
import { ToolLoader } from "@/components/tool/ToolLoader";
import { Prose } from "@/components/content/Prose";
import { StitchDivider } from "@/components/content/StitchDivider";

const description =
  "Make a crochet graph from any photo for C2C, tapestry or mosaic crochet. Set your gauge, choose the colours and print a numbered graph. Free, no sign-up.";

export const metadata: Metadata = buildMetadata({
  title: "Free Crochet Graph Maker – C2C and Tapestry Graphs",
  description,
  path: "/crochet-graph-maker",
});

const faqs = [
  {
    q: "Can I use this crochet graph maker for C2C?",
    a: "Yes. Each square on the graph is one C2C tile. Enter your tile gauge (tiles per 10 cm) and the size panel shows how big the blanket will be.",
  },
  {
    q: "Does it work for tapestry or mosaic crochet?",
    a: "Yes. Treat each square as one single crochet. Enter your stitch and row gauge so the graph keeps the picture's shape.",
  },
  {
    q: "Which yarn colours should I buy?",
    a: "The colours come from your photo rather than a yarn brand. Each one gets a plain name and a swatch, and the key shows its share of the graph, which helps you estimate how much of each yarn you need.",
  },
  {
    q: "How many colours should a crochet graph have?",
    a: "Fewer than a stitched pattern. 4 to 10 colours keeps colour changes manageable and the result clear.",
  },
  {
    q: "Is it free?",
    a: "Yes. Make and download as many graphs as you like, with no account.",
  },
];

export default function CrochetPage() {
  return (
    <ToolPage
      href="/crochet-graph-maker"
      name="Crochet Graph Maker"
      h1="Free Crochet Graph Maker"
      subline="Turn a photo into a C2C or tapestry crochet graph sized to your gauge."
      description={description}
      tool={<ToolLoader craft="crochet" />}
      faqs={faqs}
      faqHeading="Crochet graph maker FAQ"
    >
      <Prose>
        <p>
          This crochet graph maker turns a picture into a squared graph you can follow row by row. It works for
          corner-to-corner (C2C) blankets, tapestry crochet and mosaic-style colourwork. Enter your gauge and you get the
          finished size before you buy a single ball of yarn.
        </p>
        <h2>How to make a crochet graph from a picture</h2>
        <ol className="list-decimal space-y-2 pl-6">
          <li>
            <strong>Pick a bold image.</strong> Simple shapes and strong contrast read best in yarn.
          </li>
          <li>
            <strong>Set your gauge.</strong> Crochet a small swatch, count the squares and rows in 10 cm and enter them.
          </li>
          <li>
            <strong>Choose the size and colours.</strong> Start with 6 to 8 colours. You can merge any two that look
            alike in the colour key.
          </li>
          <li>
            <strong>Download the graph</strong> as a PDF with numbered rows and columns, or as a PNG.
          </li>
        </ol>
      </Prose>
      <StitchDivider />
      <Prose>
        <h2>Working a C2C graph</h2>
        <p>
          In C2C you work diagonally, starting in one corner and adding a tile at each end of every row. Follow the
          graph along the diagonal and count the tiles of each colour before you start the row. Bobbins or small balls
          for each colour block keep the back tidy.
        </p>
      </Prose>
    </ToolPage>
  );
}
