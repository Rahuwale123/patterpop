import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo/metadata";
import { ToolPage } from "@/components/layout/ToolPage";
import { ToolLoader } from "@/components/tool/ToolLoader";
import { Prose } from "@/components/content/Prose";
import { StitchDivider } from "@/components/content/StitchDivider";

const description =
  "Make a custom diamond painting pattern from any photo. Get a drill chart with DMC-numbered colours, drill counts and canvas size. Free and private.";

export const metadata: Metadata = buildMetadata({
  title: "Diamond Painting Pattern Maker – Free Photo to Drill Chart",
  description,
  path: "/diamond-painting-pattern-maker",
});

const faqs = [
  {
    q: "What drill size does this diamond painting pattern maker use?",
    a: "It assumes standard 2.5 mm square drills, which most kits use. The size panel shows the picture size and a canvas size with a 5 cm border.",
  },
  {
    q: "Why are the colours numbered with DMC codes?",
    a: "Most diamond painting drills are numbered with DMC floss codes, so the chart uses the same numbers. That makes it easy to buy loose drills to match.",
  },
  {
    q: "How many drills should I order?",
    a: "The colour key lists drills per colour with 10% spare. Loose drills usually come in bags of a few hundred, so round up to whole bags.",
  },
  {
    q: "Can I print the canvas myself?",
    a: "You can download a chart PDF and a PNG. For a sticky canvas, send the pattern to a print shop that makes custom diamond painting canvases, or work from the chart on a blank adhesive canvas.",
  },
  {
    q: "Is my photo uploaded?",
    a: "No. Everything happens in your browser and the photo stays on your device.",
  },
];

export default function DiamondPage() {
  return (
    <ToolPage
      href="/diamond-painting-pattern-maker"
      name="Diamond Painting Pattern Maker"
      h1="Free Diamond Painting Pattern Maker"
      subline="Turn a photo into a drill chart with DMC-numbered colours, drill counts and canvas size."
      description={description}
      tool={<ToolLoader craft="diamond" />}
      faqs={faqs}
      faqHeading="Diamond painting pattern maker FAQ"
    >
      <Prose>
        <p>
          This diamond painting pattern maker turns your own photo into a drill chart. Each square on the chart is one
          drill, matched to a DMC colour number. You also get the number of drills for each colour and the size of
          canvas you need.
        </p>
        <h2>How to make a custom diamond painting pattern</h2>
        <ol className="list-decimal space-y-2 pl-6">
          <li>
            <strong>Upload a photo and crop it.</strong> Faces, pets and places with clear light all work well.
          </li>
          <li>
            <strong>Choose the size.</strong> With 2.5 mm drills, 100 drills across is 25 cm. Larger pieces show more
            detail but take far longer to finish.
          </li>
          <li>
            <strong>Choose the colours.</strong> Diamond painting looks good with more colours than stitching, so 25 to
            40 is a good range.
          </li>
          <li>
            <strong>Download the chart</strong> with its colour key and drill list.
          </li>
        </ol>
      </Prose>
      <StitchDivider />
      <Prose>
        <h2>Getting a sharp result</h2>
        <ul className="x-list space-y-2">
          <li>
            <strong>Go bigger for faces.</strong> Use Optimise for a face, then crop close so features get enough
            drills.
          </li>
          <li>
            <strong>Square drills</strong> give a smoother, more photo-like finish than round ones.
          </li>
          <li>
            <strong>Work one colour at a time</strong> on a small section, and use a ruler or the bold lines every 10
            drills to keep your place.
          </li>
        </ul>
      </Prose>
    </ToolPage>
  );
}
