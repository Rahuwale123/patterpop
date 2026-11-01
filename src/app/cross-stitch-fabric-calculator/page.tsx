import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo/metadata";
import { ToolPage } from "@/components/layout/ToolPage";
import { Prose } from "@/components/content/Prose";
import { StitchDivider } from "@/components/content/StitchDivider";
import { FabricCalculator } from "@/components/calc/FabricCalculator";

const description =
  "Work out how much Aida, evenweave or linen to buy for a cross stitch design. Enter the stitch count and fabric to get the finished size and fabric size.";

export const metadata: Metadata = buildMetadata({
  title: "Cross Stitch Fabric Calculator – How Much Aida to Buy",
  description,
  path: "/cross-stitch-fabric-calculator",
});

const faqs = [
  {
    q: "How do I calculate the finished size of a cross stitch?",
    a: "Divide the number of stitches by the fabric count. A design 140 stitches wide on 14-count Aida is 140 ÷ 14 = 10 inches wide.",
  },
  {
    q: "How much extra fabric should I add?",
    a: "Add about 3 inches (7.5 cm) on every side. That leaves room for a hoop while you stitch and for mounting or framing afterwards.",
  },
  {
    q: "What does stitching over two mean?",
    a: "On evenweave and linen you usually work each cross over two threads, so 28-count evenweave gives 14 stitches per inch, the same size as 14-count Aida.",
  },
  {
    q: "Is a fat quarter big enough?",
    a: "A fat quarter of Aida is usually about 18 by 21 inches. The calculator tells you whether your design plus margins fits.",
  },
];

export default function FabricCalculatorPage() {
  return (
    <ToolPage
      href="/cross-stitch-fabric-calculator"
      name="Fabric Calculator"
      h1="Cross Stitch Fabric Calculator"
      subline="Find the finished size of a design and how much fabric to buy, for Aida, evenweave and linen."
      description={description}
      tool={<FabricCalculator />}
      faqs={faqs}
      faqHeading="Fabric calculator FAQ"
    >
      <Prose>
        <p>
          This cross stitch fabric calculator tells you how big a design will be and how much fabric to buy. Enter the
          width and height in stitches from your pattern, pick your fabric, and choose how much spare fabric you want
          around the edges.
        </p>
        <h2>The quick formula</h2>
        <p>
          Finished size in inches = stitches ÷ fabric count. Fabric to buy = finished size + spare on both sides. For a
          design 98 × 126 stitches on 14-count Aida, that is 7 × 9 inches of stitching and a 13 × 15 inch piece of
          fabric with 3 inches spare each side.
        </p>
      </Prose>
      <StitchDivider />
      <Prose>
        <h2>Choosing the fabric count</h2>
        <p>
          The same pattern gets smaller as the count goes up. 14-count Aida is the friendliest for most people. 16 and
          18-count give a finer, smaller piece. 28-count evenweave stitched over two matches 14-count in size but has a
          softer look.
        </p>
      </Prose>
    </ToolPage>
  );
}
