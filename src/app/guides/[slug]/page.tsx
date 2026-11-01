import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { guides } from "@/data/guides";
import { guideContent } from "@/content/guides";
import { buildMetadata } from "@/lib/seo/metadata";
import { article, breadcrumbList, howTo } from "@/lib/seo/schema";
import { JsonLd } from "@/components/seo/JsonLd";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { Container } from "@/components/layout/Container";
import { RelatedTools } from "@/components/content/RelatedTools";

// Every guide is built; the edge (functions/_middleware.js) hides each one until its publishDate.
export const dynamicParams = false;

export function generateStaticParams() {
  return guides.map((g) => ({ slug: g.slug }));
}

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const g = guides.find((x) => x.slug === slug);
  if (!g) return {};
  return buildMetadata({ title: g.seoTitle, description: g.description, path: `/guides/${g.slug}`, type: "article" });
}

const dateLabel = (d: string) =>
  new Date(`${d}T00:00:00Z`).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });

export default async function GuidePage({ params }: Params) {
  const { slug } = await params;
  const g = guides.find((x) => x.slug === slug);
  const content = guideContent[slug];
  if (!g || !content) notFound();
  const path = `/guides/${g.slug}`;
  const { Body, steps } = content;
  return (
    <article>
      <JsonLd data={article({ title: g.title, description: g.description, path, published: g.publishDate, modified: g.updated ?? g.publishDate })} />
      {steps && <JsonLd data={howTo(g.title, g.description, steps)} />}
      <JsonLd
        data={breadcrumbList([
          { name: "Home", path: "/" },
          { name: g.title, path },
        ])}
      />
      <Container>
        <Breadcrumbs items={[{ name: "Home", href: "/" }, { name: g.title, href: path }]} />
        <h1 className="mt-4 font-serif text-[2.2rem] font-bold leading-tight sm:text-[2.6rem]">{g.title}</h1>
        <p className="mt-2 text-sm text-muted">
          <time dateTime={g.updated ?? g.publishDate}>{dateLabel(g.updated ?? g.publishDate)}</time>
        </p>
      </Container>
      {/* DRAFT: human review */}
      <div className="mt-8">
        <Body />
      </div>
      <RelatedTools current={path} />
    </article>
  );
}
