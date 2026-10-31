import type { Metadata } from "next";
import Link from "next/link";
import { buildMetadata } from "@/lib/seo/metadata";
import { breadcrumbList } from "@/lib/seo/schema";
import { site } from "@/lib/seo/site";
import { JsonLd } from "@/components/seo/JsonLd";
import { PageIntro } from "@/components/layout/PageIntro";
import { Prose } from "@/components/content/Prose";

export const metadata: Metadata = buildMetadata({
  title: "Privacy Policy | PatternPop",
  description:
    "Your photos never leave your device. Here is exactly what PatternPop stores, the privacy-friendly analytics we use, and how to clear your saved pattern.",
  path: "/privacy",
});

export default function PrivacyPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbList([
          { name: "Home", path: "/" },
          { name: "Privacy", path: "/privacy" },
        ])}
      />
      <PageIntro title="Privacy policy" crumb="Privacy" path="/privacy">
        Short version: your photos never leave your device.
      </PageIntro>
      {/* DRAFT: human review */}
      <div className="mt-8">
        <Prose>
          <p className="text-sm text-muted">Last updated 31 October 2026</p>

          <h2>Your photos</h2>
          <p>
            When you choose a photo, your browser opens it and makes the pattern on your own computer or phone. The
            photo is never uploaded to PatternPop or to anyone else. The same goes for the PDF and PNG files you
            download. They are made on your device.
          </p>

          <h2>What is saved on your device</h2>
          <p>
            So you can pick up where you left off, the tool keeps your most recent pattern in your browser&apos;s own
            storage (IndexedDB). That copy includes the photo, your crop, settings and colour changes. It stays on
            your device, we can&apos;t see it, and it is replaced each time you start a new pattern. To remove it,
            clear this site&apos;s data in your browser settings.
          </p>

          <h2>Analytics</h2>
          <p>
            We use Cloudflare Web Analytics to count visits and see which pages are useful. It doesn&apos;t use
            cookies, doesn&apos;t track you across other sites, and doesn&apos;t collect personal information. It
            sees things like the page you visited, your browser type and your country.
          </p>

          <h2>Cookies and advertising</h2>
          <p>
            PatternPop doesn&apos;t set cookies and doesn&apos;t show ads right now. If that changes, we&apos;ll
            update this page first and, where the law requires it, ask for your consent.
          </p>

          <h2>Accounts and email</h2>
          <p>
            There are no accounts. If you email us, we use your message only to reply, and we don&apos;t share it.
          </p>

          <h2>Questions</h2>
          <p>
            Email <a href={`mailto:${site.contactEmail}`}>{site.contactEmail}</a> or use the{" "}
            <Link href="/contact">contact page</Link>.
          </p>
        </Prose>
      </div>
    </>
  );
}
