import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo/metadata";
import { ToolPage } from "@/components/layout/ToolPage";
import { Prose } from "@/components/content/Prose";
import { StitchDivider } from "@/components/content/StitchDivider";
import { TextTool } from "@/components/calc/TextTool";

const description =
  "Type any words and get a cross stitch lettering pattern. Choose the font, letter height and DMC colour, then download a chart PDF. Free, no sign-up.";

export const metadata: Metadata = buildMetadata({
  title: "Cross Stitch Text Generator – Free Lettering Patterns",
  description,
  path: "/cross-stitch-text-generator",
});

const faqs = [
  {
    q: "How tall should cross stitch letters be?",
    a: "10 to 14 stitches for capital letters reads well and keeps curves smooth. Below about 8 stitches, letters start to look blocky.",
  },
  {
    q: "Can I add a name to a pattern I already have?",
    a: "Yes. Make the lettering here, download the chart, and stitch it under or around your main design. Count from the centre arrows to place it.",
  },
  {
    q: "Which thread colour works best for text?",
    a: "Strong contrast with the fabric. DMC 310 black, 321 red and 820 navy are classics on white or cream Aida.",
  },
  {
    q: "Is this cross stitch text generator free?",
    a: "Yes, with no account and no watermark on standard patterns.",
  },
];

export default function TextGeneratorPage() {
  return (
    <ToolPage
      href="/cross-stitch-text-generator"
      name="Cross Stitch Text Generator"
      h1="Cross Stitch Text Generator"
      subline="Type a name, date or saying and get a stitchable lettering chart in seconds."
      description={description}
      tool={<TextTool />}
      faqs={faqs}
      faqHeading="Cross stitch text generator FAQ"
    >
      <Prose>
        <p>
          This cross stitch text generator turns words into a lettering chart. It is handy for names and dates on baby
          samplers, wedding gifts, or a favourite saying. Type your text, pick a font and colour, and download the
          chart with the skeins you need.
        </p>
        <h2>Tips for lettering that looks good</h2>
        <ul className="x-list space-y-2">
          <li>
            <strong>Keep it short.</strong> A few words at a good height looks better than a long line of tiny letters.
          </li>
          <li>
            <strong>Use bold for small text.</strong> Thin strokes can drop out below about 12 stitches tall.
          </li>
          <li>
            <strong>Centre it by counting.</strong> Find the middle of the chart with the red arrows and start there.
          </li>
        </ul>
      </Prose>
      <StitchDivider />
      <Prose>
        <h2>Adding backstitch</h2>
        <p>
          For a crisper edge, outline the letters with one strand of backstitch in a darker shade once the crosses are
          done. It also helps thin parts of script letters stand out.
        </p>
      </Prose>
    </ToolPage>
  );
}
