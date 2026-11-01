import type { ReactNode } from "react";
import type { FaqItem } from "@/data/faqs/home";
import { breadcrumbList, faqPage, webApplication } from "@/lib/seo/schema";
import { JsonLd } from "@/components/seo/JsonLd";
import { Faq } from "@/components/content/Faq";
import { RelatedTools } from "@/components/content/RelatedTools";
import { StitchDivider } from "@/components/content/StitchDivider";
import { Breadcrumbs } from "./Breadcrumbs";
import { Container } from "./Container";

type Props = {
  href: string;
  /** Short name for the breadcrumb and structured data */
  name: string;
  h1: string;
  subline: string;
  description: string;
  tool: ReactNode;
  faqs: FaqItem[];
  faqHeading: string;
  /** The article sections, each usually a <Prose> */
  children: ReactNode;
};

/** Shared layout for every tool page: hero + tool, article, FAQ, related tools, JSON-LD. */
export function ToolPage({ href, name, h1, subline, description, tool, faqs, faqHeading, children }: Props) {
  return (
    <>
      <JsonLd data={webApplication(name, href, description)} />
      <JsonLd data={faqPage(faqs)} />
      <JsonLd
        data={breadcrumbList([
          { name: "Home", path: "/" },
          { name, path: href },
        ])}
      />
      <section className="aida-weave border-b border-dashed border-hoop-dark/30 pb-12">
        <Container width="tool">
          <Breadcrumbs items={[{ name: "Home", href: "/" }, { name, href }]} />
          <div className="mx-auto mt-4 max-w-[720px] text-center">
            <h1 className="font-serif text-[2.2rem] font-bold leading-[1.1] sm:text-5xl">{h1}</h1>
            <p className="mt-4 text-lg text-muted">{subline}</p>
          </div>
          <div id="tool" className="mt-8 min-h-[360px]">
            {tool}
          </div>
        </Container>
      </section>
      {/* DRAFT: human review — article copy */}
      <div className="mt-12">{children}</div>
      <StitchDivider />
      <Faq items={faqs} heading={faqHeading} />
      <RelatedTools current={href} />
    </>
  );
}
