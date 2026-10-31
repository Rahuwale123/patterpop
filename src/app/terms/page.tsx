import type { Metadata } from "next";
import Link from "next/link";
import { buildMetadata } from "@/lib/seo/metadata";
import { breadcrumbList } from "@/lib/seo/schema";
import { JsonLd } from "@/components/seo/JsonLd";
import { PageIntro } from "@/components/layout/PageIntro";
import { Prose } from "@/components/content/Prose";

export const metadata: Metadata = buildMetadata({
  title: "Terms of Use | PatternPop",
  description:
    "Plain-English terms for PatternPop: use your own photos, sell only patterns you have the rights to, and keep patterns of characters for personal use only.",
  path: "/terms",
});

export default function TermsPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbList([
          { name: "Home", path: "/" },
          { name: "Terms", path: "/terms" },
        ])}
      />
      <PageIntro title="Terms of use" crumb="Terms" path="/terms">
        The rules for using PatternPop, in plain English.
      </PageIntro>
      {/* DRAFT: human review — have this checked before you sell anything through the site */}
      <div className="mt-8">
        <Prose>
          <p className="text-sm text-muted">Last updated 31 October 2026</p>

          <h2>Using the tool</h2>
          <p>
            PatternPop is free to use for making cross stitch patterns. Please don&apos;t try to break it, overload
            it, or pass it off as your own product.
          </p>

          <h2>Your photos and your rights</h2>
          <p>
            Only use photos you are allowed to use. A photo you took yourself is fine. A photo someone else took
            belongs to them, even if you found it online.
          </p>
          <ul className="x-list space-y-2">
            <li>
              <strong>Selling patterns.</strong> You may sell patterns made here only if you own the rights to the
              original image, or have permission from the person who does.
            </li>
            <li>
              <strong>Characters, logos and artwork.</strong> Patterns of copyrighted characters, brands or other
              people&apos;s art are for your own personal use only. Don&apos;t sell them or the finished pieces.
            </li>
          </ul>

          <h2>The patterns you make</h2>
          <p>
            PatternPop claims no ownership of your patterns. The small &quot;Made with PatternPop&quot; line on the
            PDF is a credit, not a claim.
          </p>

          <h2>Colours and amounts are estimates</h2>
          <p>
            Thread colours on screen are approximate, and skein and fabric amounts are estimates. Tension, strands and
            habits vary. Buy a little extra if a project matters to you.
          </p>

          <h2>No guarantees</h2>
          <p>
            The tool is provided as it is, without warranties. We aren&apos;t responsible for losses that come from
            using it, as far as the law allows.
          </p>

          <h2>Changes</h2>
          <p>
            We may update these terms. The date at the top shows the latest version. Questions are welcome on the{" "}
            <Link href="/contact">contact page</Link>.
          </p>
        </Prose>
      </div>
    </>
  );
}
