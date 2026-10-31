import type { FaqItem } from "@/data/faqs/home";
import { Container } from "@/components/layout/Container";

export function Faq({ items, heading = "Questions people ask" }: { items: FaqItem[]; heading?: string }) {
  return (
    <Container>
      <section aria-labelledby="faq-heading">
        <h2 id="faq-heading" className="font-serif text-[1.75rem] font-bold leading-tight">
          {heading}
        </h2>
        <div className="mt-5 space-y-3">
          {items.map((f) => (
            <details
              key={f.q}
              className="rounded-lg border-2 border-dashed border-sage/60 bg-linen px-4 py-3 open:pb-4"
            >
              <summary className="cursor-pointer font-semibold">{f.q}</summary>
              <p className="mt-2 leading-relaxed text-muted">{f.a}</p>
            </details>
          ))}
        </div>
      </section>
    </Container>
  );
}
