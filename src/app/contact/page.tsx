import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo/metadata";
import { breadcrumbList } from "@/lib/seo/schema";
import { site } from "@/lib/seo/site";
import { JsonLd } from "@/components/seo/JsonLd";
import { PageIntro } from "@/components/layout/PageIntro";
import { Prose } from "@/components/content/Prose";

export const metadata: Metadata = buildMetadata({
  title: "Contact PatternPop",
  description:
    "Found a bug, have an idea for the pattern maker, or want to say hello? Email PatternPop. A real person reads every message and replies as soon as they can.",
  path: "/contact",
});

export default function ContactPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbList([
          { name: "Home", path: "/" },
          { name: "Contact", path: "/contact" },
        ])}
      />
      <PageIntro title="Contact" crumb="Contact" path="/contact">
        A real person reads every message.
      </PageIntro>
      {/* DRAFT: human review */}
      <div className="mt-8">
        <Prose>
          <p>
            <a
              href={`mailto:${site.contactEmail}`}
              className="inline-block rounded-lg bg-madder px-5 py-3 font-semibold text-linen no-underline hover:bg-madder-dark"
              style={{ color: "var(--color-linen)", textDecoration: "none" }}
            >
              Email {site.contactEmail}
            </a>
          </p>
          <h2>Helpful things to include</h2>
          <ul className="x-list space-y-2">
            <li>If something went wrong: your device, your browser, and what you clicked just before.</li>
            <li>If a colour looks off: the DMC number and what you expected instead.</li>
            <li>If you have an idea: what you were trying to stitch. Real projects make the best features.</li>
          </ul>
          <p>
            Please don&apos;t attach photos unless you&apos;re happy for us to see them. The tool itself never needs
            your photo to leave your device.
          </p>
        </Prose>
      </div>
    </>
  );
}
