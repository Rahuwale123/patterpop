import type { ReactNode } from "react";
import { Container } from "@/components/layout/Container";

export function Prose({ children, id }: { children: ReactNode; id?: string }) {
  return (
    <Container>
      <section
        id={id}
        className="space-y-4 text-[17px] leading-relaxed [&_h2]:font-serif [&_h2]:text-[1.75rem] [&_h2]:font-bold [&_h2]:leading-tight [&_h2]:text-charcoal [&_h3]:font-serif [&_h3]:text-xl [&_h3]:font-bold [&_a]:text-madder [&_a]:underline"
      >
        {children}
      </section>
    </Container>
  );
}
