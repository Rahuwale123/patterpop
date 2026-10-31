import Link from "next/link";
import { liveTools } from "@/data/tools";
import { Container } from "@/components/layout/Container";

export function RelatedTools({ currentSlug }: { currentSlug: string }) {
  const others = liveTools.filter((t) => t.slug !== currentSlug);
  if (others.length === 0) return null;
  return (
    <Container>
      <section aria-labelledby="related-heading" className="mt-12">
        <h2 id="related-heading" className="font-serif text-[1.75rem] font-bold">
          More pattern tools
        </h2>
        <ul className="x-list mt-4 space-y-2">
          {others.map((t) => (
            <li key={t.slug}>
              <Link href={t.href} className="font-semibold text-madder underline">
                {t.title}
              </Link>{" "}
              <span className="text-muted">{t.blurb}</span>
            </li>
          ))}
        </ul>
      </section>
    </Container>
  );
}
