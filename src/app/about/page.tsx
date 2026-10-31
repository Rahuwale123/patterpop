import type { Metadata } from "next";
import Link from "next/link";
import { buildMetadata } from "@/lib/seo/metadata";
import { breadcrumbList, organization } from "@/lib/seo/schema";
import { site } from "@/lib/seo/site";
import { JsonLd } from "@/components/seo/JsonLd";
import { PageIntro } from "@/components/layout/PageIntro";
import { Prose } from "@/components/content/Prose";
import { StitchDivider } from "@/components/content/StitchDivider";
import { CopyButton } from "@/components/content/CopyButton";
import dmcData from "@/data/dmc.json";

export const metadata: Metadata = buildMetadata({
  title: "About PatternPop – Who Made It and How It Works",
  description:
    "Why PatternPop exists, how it matches your photo to real DMC floss colours, where the thread colour data comes from, and how to link to us from your blog.",
  path: "/about",
});

const linkSnippet = `<a href="${site.url}">PatternPop – free cross stitch pattern maker</a>`;

export default function AboutPage() {
  return (
    <>
      <JsonLd data={organization()} />
      <JsonLd
        data={breadcrumbList([
          { name: "Home", path: "/" },
          { name: "About", path: "/about" },
        ])}
      />
      <PageIntro title="About PatternPop" crumb="About" path="/about">
        A small, free tool for turning photos into patterns you can actually stitch.
      </PageIntro>

      {/* DRAFT: human review — replace the bracketed parts with your own story */}
      <div className="mt-8">
        <Prose>
          <h2>Why I made it</h2>
          <p>
            Hi, I&apos;m [your name]. I&apos;ve been stitching since [year], mostly [what you like to stitch]. A while
            ago I wanted to turn a photo of [a pet, a place, a person] into a pattern. The free tools I tried either
            wanted me to sign up, put a watermark on the chart, or uploaded my photo to who knows where.
          </p>
          <p>
            So I built PatternPop. It does one job well: you give it a photo, it gives you a clear chart, a list of
            DMC threads to buy, and a PDF you can print. Your photo stays on your own device the whole time.
          </p>
        </Prose>

        <StitchDivider />

        <Prose>
          <h2>How the colour matching works</h2>
          <p>
            A photo has thousands of colours. A pattern needs a few dozen at most, and each one has to be a thread you
            can buy. PatternPop gets there in a few steps.
          </p>
          <ol className="list-decimal space-y-2 pl-6">
            <li>
              <strong>Shrink the photo to the stitch grid.</strong> Each stitch takes the average colour of the patch of
              photo it covers, so fine detail blends the way your eye would blend it.
            </li>
            <li>
              <strong>Find the main colours.</strong> The tool groups similar colours together until only the number
              you asked for is left. It does this in a colour space built around how people see, not how screens store
              colour.
            </li>
            <li>
              <strong>Match each colour to DMC floss.</strong> Every group is matched to the nearest of {dmcData.colors.length}{" "}
              DMC colours using CIEDE2000, a formula designed to measure how different two colours look to a person.
              If two groups land on the same thread, they become one colour.
            </li>
            <li>
              <strong>Tidy up.</strong> Single stray stitches of a colour, which are fiddly and rarely noticed, are
              swapped for the colour around them. You can turn this off.
            </li>
          </ol>
          <p>
            Everything runs in your browser. Nothing is sent to a server, which is also why it&apos;s quick.
          </p>
        </Prose>

        <StitchDivider />

        <Prose>
          <h2>Where the DMC colours come from</h2>
          <p>
            DMC has never published official screen colours for its threads, so every pattern tool uses an
            approximation. PatternPop uses the community-made list from the{" "}
            <a href="https://github.com/sharlagelfand/dmc" rel="noopener">dmc project by Sharla Gelfand</a> (MIT
            licence), which is based on the colour list from{" "}
            <a href="https://github.com/adrianj/CrossStitchCreator" rel="noopener">CrossStitchCreator by adrianj</a>.
            Thank you to both.
          </p>
          <p>
            Colours on screen are approximate. Screens differ, and thread has a sheen that no screen can show. If a
            colour matters, hold the real skein up to your photo in daylight before you start. DMC is a trademark of
            DMC. PatternPop isn&apos;t connected with DMC.
          </p>
        </Prose>

        <StitchDivider />

        <Prose id="link">
          <h2>Link to PatternPop</h2>
          <p>
            If PatternPop helped you and you write about stitching, a link means a lot. It&apos;s how other stitchers
            find the tool. Copy this into your blog post or resources page:
          </p>
          <pre className="overflow-x-auto rounded-lg border-2 border-dashed border-hoop-dark/50 bg-linen p-3 text-sm">
            <code>{linkSnippet}</code>
          </pre>
          <CopyButton text={linkSnippet} label="Copy the link code" />
          <p>
            Questions or ideas? <Link href="/contact">Get in touch</Link>.
          </p>
        </Prose>
      </div>
    </>
  );
}
