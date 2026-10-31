import type { ReactNode } from "react";
import { Breadcrumbs } from "./Breadcrumbs";
import { Container } from "./Container";

export function PageIntro({ title, crumb, path, children }: { title: string; crumb: string; path: string; children?: ReactNode }) {
  return (
    <Container>
      <Breadcrumbs items={[{ name: "Home", href: "/" }, { name: crumb, href: path }]} />
      <h1 className="mt-4 font-serif text-[2.2rem] font-bold leading-tight sm:text-[2.6rem]">{title}</h1>
      {children && <div className="mt-3 text-lg text-muted">{children}</div>}
    </Container>
  );
}
