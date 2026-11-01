import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo/metadata";
import { Container } from "@/components/layout/Container";
import { ToolLoader } from "@/components/tool/ToolLoader";
import { StitchDivider } from "@/components/content/StitchDivider";
import { Prose } from "@/components/content/Prose";
import { HowItWorks } from "@/components/content/HowItWorks";
import { Faq } from "@/components/content/Faq";
import { RelatedTools } from "@/components/content/RelatedTools";
import { AdSlot } from "@/components/ads/AdSlot";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbList, faqPage, webApplication } from "@/lib/seo/schema";
import { homeFaqs } from "@/data/faqs/home";
import { FABRIC_COUNTS, finishedSizeInches, inchesToCm } from "@/lib/pattern/fabric";

const description =
  "Turn any photo into a printable cross stitch pattern with DMC floss colours, a symbol chart and a shopping list. Free, no sign-up, works in your browser.";

export const metadata: Metadata = buildMetadata({
  // Brand dropped to stay within 60 characters; Google shows the site name separately.
  title: "Free Cross Stitch Pattern Maker – Photo to Pattern",
  description,
  path: "/",
});

// Real pipeline output (default settings) from the photos in /public/samples.
// Swap in your own photos and regenerate before launch.
const samples = [
  {
    slug: "pet",
    label: "A pug in a blanket",
    alt: "A pug wrapped in a striped blanket",
    patternAlt: "The pug photo turned into a pattern by the cross stitch pattern maker",
    stitches: "80 × 80 stitches, 20 colours",
  },
  {
    slug: "portrait",
    label: "A summer portrait",
    alt: "A woman in sunglasses holding daisies in a field",
    patternAlt: "The portrait as a stitched cross stitch pattern",
    stitches: "80 × 80 stitches, 20 colours",
  },
  {
    slug: "flower",
    label: "A purple petunia",
    alt: "A purple petunia flower against dark leaves",
    patternAlt: "The petunia as a stitched cross stitch pattern",
    stitches: "80 × 80 stitches, 20 colours",
  },
];

const steps = [
  {
    title: "Upload a photo",
    body: "Pick a picture from your computer or phone, then crop it to the part you want to stitch. Square crops are the easiest to frame.",
  },
  {
    title: "Choose the size",
    body: "Set the width in stitches and your fabric count. The finished size in inches and centimetres updates as you go, so there are no surprises.",
  },
  {
    title: "Choose your colours",
    body: "Pick how many floss colours you want. Each one is matched to a real DMC thread, and you can swap or merge any colour you don't like.",
  },
  {
    title: "Download the PDF",
    body: "You get a cover page, a symbol chart split into printable pages, and a shopping list with the number of skeins for every colour.",
  },
];

const tableWidths = [50, 80, 100, 150];

function fmt(n: number) {
  return n.toFixed(1);
}

export default function HomePage() {
  return (
    <>
      <JsonLd data={webApplication("PatternPop Cross Stitch Pattern Maker", "/", description)} />
      <JsonLd data={faqPage(homeFaqs)} />
      <JsonLd data={breadcrumbList([{ name: "Home", path: "/" }])} />
      <section className="aida-weave border-b border-dashed border-hoop-dark/30 pb-12 pt-10 sm:pt-14">
        <Container width="tool">
          <div className="mx-auto max-w-[720px] text-center">
            <h1 className="font-serif text-[2.4rem] font-bold leading-[1.1] sm:text-5xl">
              Free Cross Stitch Pattern Maker
            </h1>
            <p className="mt-4 text-lg text-muted">
              Turn a photo into a printable pattern with real DMC thread colours. Nothing is uploaded. It all
              happens in your browser.
            </p>
          </div>
          <div id="tool" className="mt-8 min-h-[360px]">
            <ToolLoader />
          </div>
        </Container>
      </section>

      {/* DRAFT: human review — all article copy below */}
      <Container width="tool" className="mt-14">
        <section aria-labelledby="examples-heading">
          <h2 id="examples-heading" className="text-center font-serif text-[1.75rem] font-bold">
            From photo to pattern
          </h2>
          <ul className="mt-6 grid gap-6 sm:grid-cols-3">
            {samples.map((s) => (
              <li key={s.slug} className="rounded-xl border-2 border-dashed border-hoop-dark/50 bg-linen p-3">
                <div className="grid grid-cols-2 gap-2">
                  <div className="relative">
                    <img
                      src={`/samples/${s.slug}-photo.webp`}
                      alt={s.alt}
                      width={480}
                      height={480}
                      loading="lazy"
                      className="aspect-square w-full rounded-md object-cover"
                    />
                    <span className="absolute left-1.5 top-1.5 rounded bg-charcoal/75 px-1.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-linen">
                      Photo
                    </span>
                  </div>
                  <div className="relative">
                    <img
                      src={`/samples/${s.slug}-pattern.webp`}
                      alt={s.patternAlt}
                      width={480}
                      height={480}
                      loading="lazy"
                      className="aspect-square w-full rounded-md object-cover"
                    />
                    <span className="absolute left-1.5 top-1.5 rounded bg-charcoal/75 px-1.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-linen">
                      Pattern
                    </span>
                  </div>
                </div>
                <p className="mt-2 text-sm font-semibold">{s.label}</p>
                <p className="text-sm text-muted">{s.stitches}</p>
              </li>
            ))}
          </ul>
        </section>
      </Container>

      <StitchDivider />

      <Prose>
        <p>
          This cross stitch pattern maker takes a photo you love and turns it into a chart you can actually
          stitch. You choose the size and the number of colours. PatternPop matches every colour to a DMC
          floss number, adds a symbol for each one, and works out how many skeins to buy. It is free to use,
          with no sign-up and no watermark on standard patterns.
        </p>
        <h2>How to create a cross stitch pattern from a photo</h2>
        <HowItWorks steps={steps} />
      </Prose>

      <AdSlot id="home-mid" />
      <StitchDivider />

      <Prose>
        <h2>Choosing a photo that stitches well</h2>
        <p>
          Not every picture makes a good pattern. A cross stitch is one square of colour, so fine detail gets
          lost and busy scenes turn to noise. These habits give you a much cleaner chart.
        </p>
        <ul className="x-list space-y-2">
          <li>
            <strong>Use good, even light.</strong> Daylight from a window is ideal. Harsh flash makes shiny
            patches that become white blobs.
          </li>
          <li>
            <strong>Keep the background simple.</strong> A plain wall or sky lets the subject stand out, and
            you can leave a white background unstitched.
          </li>
          <li>
            <strong>Crop close.</strong> Fill the frame with the face, pet or flower. Every stitch you spend on
            background is one less on the part you care about.
          </li>
          <li>
            <strong>Look for contrast.</strong> A dark cat on a light blanket charts better than a grey cat on
            a grey rug.
          </li>
        </ul>
      </Prose>

      <StitchDivider />

      <Prose>
        <h2>What size and fabric count should I use?</h2>
        <p>
          Fabric count is the number of stitches per inch. The same chart gets smaller as the count goes up.
          A design 80 stitches wide is about 5.7 inches across on 14-count Aida, but only 4.4 inches on
          18-count. For a first custom cross stitch pattern, 14-count is the kindest choice. The holes are easy
          to see and you can work with two strands.
        </p>
        <div className="relative overflow-x-auto">
          <table className="w-full min-w-[420px] border-collapse text-left text-[15px]">
            <caption className="mb-2 text-left text-sm text-muted">
              Finished width for a design of a given width in stitches
            </caption>
            <thead>
              <tr className="border-b-2 border-charcoal/30">
                <th scope="col" className="py-2 pr-3">Width</th>
                {FABRIC_COUNTS.filter((c) => c !== 11).map((c) => (
                  <th key={c} scope="col" className="py-2 pr-3">
                    {c}-count
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tableWidths.map((w) => (
                <tr key={w} className="border-b border-dashed border-charcoal/20">
                  <th scope="row" className="py-2 pr-3 font-semibold">
                    {w} stitches
                  </th>
                  {FABRIC_COUNTS.filter((c) => c !== 11).map((c) => {
                    const inches = finishedSizeInches(w, c);
                    return (
                      <td key={c} className="py-2 pr-3">
                        {fmt(inches)} in / {fmt(inchesToCm(inches))} cm
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p>
          Always buy fabric bigger than the design. Add 3 inches (7.5 cm) on every side so there is room for
          the hoop and for framing later. The tool works this out for you.
        </p>
      </Prose>

      <StitchDivider />

      <Prose>
        <h2>How many colours does a pattern need?</h2>
        <p>
          Fewer than you think. Most good photo patterns use between 15 and 30 colours. Simple subjects like
          a flower on a plain background look lovely with 10 to 15. Portraits need more, usually 25 to 35, to
          keep skin tones soft.
        </p>
        <p>
          More colours mean more skeins to buy and more thread changes while you stitch. Start at 20, look at
          the preview, then go up or down. If two shades look almost the same, merge them in the colour key.
          You will rarely notice the difference in the finished piece.
        </p>
      </Prose>

      <StitchDivider />

      <Prose>
        <h2>Why PatternPop is different</h2>
        <ul className="x-list space-y-3">
          <li>
            <strong>Your photos stay on your device.</strong> Plenty of picture to cross stitch pattern sites
            send your image to a server. PatternPop does all the work in your browser, so private family
            photos stay private.
          </li>
          <li>
            <strong>Real DMC matching.</strong> Colours are matched with CIEDE2000, a formula built to measure
            how different two colours look to the human eye. You get the floss number you can buy, not just a
            hex code.
          </li>
          <li>
            <strong>A shopping list with skein counts.</strong> Every colour comes with a stitch count and the
            number of skeins to buy, with a little spare so you don&apos;t run out on the last row.
          </li>
          <li>
            <strong>A chart you can read.</strong> Bold lines every 10 stitches, row and column numbers, and
            symbols that stay clear when printed in black and white.
          </li>
        </ul>
      </Prose>

      <StitchDivider />

      <Faq items={homeFaqs} heading="Cross stitch pattern maker FAQ" />

      <RelatedTools current="/" />
    </>
  );
}
