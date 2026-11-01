import { Container } from "@/components/layout/Container";
import { BUILD_DATE, guideLinks, isPublished, toolLinks } from "@/lib/publish";
import { ScheduledLinks } from "./ScheduledLinks";

/** "More tools" and "Guides" blocks. `current` is this page's href, left out of the list. */
export function RelatedTools({ current }: { current: string }) {
  const anyTools = toolLinks.some((t) => t.href !== current && isPublished(t.publishDate));
  return (
    <Container>
      <section aria-labelledby="related-heading" className="mt-12">
        <h2 id="related-heading" className="font-serif text-[1.75rem] font-bold">
          More free pattern tools
        </h2>
        {/* Lists fill in on the day new pages go live, even before the next build. */}
        <ScheduledLinks items={toolLinks} buildDate={BUILD_DATE} exclude={current} variant="related" />
        {!anyTools && <p className="mt-2 text-muted">More tools are on the way.</p>}
        <ScheduledLinks
          items={guideLinks}
          buildDate={BUILD_DATE}
          exclude={current}
          variant="related"
          heading={{ text: "Guides", level: "h3", className: "mt-8 font-serif text-xl font-bold" }}
        />
      </section>
    </Container>
  );
}
