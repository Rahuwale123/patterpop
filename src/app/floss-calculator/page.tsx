import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo/metadata";
import { ToolPage } from "@/components/layout/ToolPage";
import { Prose } from "@/components/content/Prose";
import { StitchDivider } from "@/components/content/StitchDivider";
import { FlossCalculator } from "@/components/calc/FlossCalculator";

const description =
  "Find out how many skeins of embroidery floss you need for each colour. Enter the stitch count, fabric and strands, and get skeins with a little spare.";

export const metadata: Metadata = buildMetadata({
  title: "Floss Calculator – How Many Skeins of DMC Do I Need?",
  description,
  path: "/floss-calculator",
});

const faqs = [
  {
    q: "How many cross stitches does one skein of floss make?",
    a: "With 2 strands on 14-count Aida, one 8 m skein of DMC covers roughly 1,800 full cross stitches. On 18-count it goes further, and with 3 strands it covers less.",
  },
  {
    q: "Where do I find the stitch count for each colour?",
    a: "Many pattern keys list stitches per colour. If yours doesn't, count the symbols on the chart, or make the pattern with the free pattern maker, which lists stitches and skeins for every colour.",
  },
  {
    q: "Why does the floss calculator add 10%?",
    a: "Thread is lost to tails, starting and finishing, and travelling between areas. A little spare saves you from running out on the last row, or finding a new dye lot doesn't quite match.",
  },
  {
    q: "Does it work for other brands?",
    a: "Yes, for any standard six-strand cotton skein of about 8 m, such as Anchor.",
  },
];

export default function FlossCalculatorPage() {
  return (
    <ToolPage
      href="/floss-calculator"
      name="Floss Calculator"
      h1="Floss Calculator"
      subline="How many skeins of each colour your cross stitch needs, worked out from stitch counts."
      description={description}
      tool={<FlossCalculator />}
      faqs={faqs}
      faqHeading="Floss calculator FAQ"
    >
      <Prose>
        <p>
          This floss calculator works out how many skeins to buy for each colour in a cross stitch pattern. Add a row
          per colour with its stitch count, choose your fabric and the number of strands, and it gives you the skeins
          for each colour and in total.
        </p>
        <h2>How it works</h2>
        <p>
          A skein of DMC is 8 m of six strands. Stitching with 2 strands gives 24 m of working thread. A full cross
          uses about five stitch-widths of thread front and back, and about half as much again goes on tails and
          travelling. The smaller the fabric count, the bigger each stitch, so the same skein covers fewer stitches on
          11-count than on 18-count.
        </p>
      </Prose>
      <StitchDivider />
      <Prose>
        <h2>Avoiding running out</h2>
        <ul className="x-list space-y-2">
          <li>
            <strong>Buy all of one colour at once</strong> so the dye lot matches.
          </li>
          <li>
            <strong>Round up for dark colours and backgrounds.</strong> Large areas use more thread than the estimate
            suggests if you travel a lot on the back.
          </li>
          <li>
            <strong>Keep the label</strong> with the number on it until the project is done.
          </li>
        </ul>
      </Prose>
    </ToolPage>
  );
}
