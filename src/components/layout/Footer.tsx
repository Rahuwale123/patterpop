import Link from "next/link";
import { liveTools } from "@/data/tools";
import { Container } from "./Container";
import { StitchDivider } from "@/components/content/StitchDivider";

const pages = [
  { href: "/about", label: "About" },
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
  { href: "/contact", label: "Contact" },
];

export function Footer() {
  return (
    <footer className="mt-20 bg-aida-deep pb-10 text-[15px]">
      <StitchDivider className="pt-0" />
      <Container width="tool" className="grid gap-8 pt-6 sm:grid-cols-2">
        <div>
          <h2 className="font-serif text-lg font-bold">All tools</h2>
          <ul className="mt-2 space-y-1">
            {liveTools.map((t) => (
              <li key={t.slug}>
                <Link href={t.href} className="underline-offset-2 hover:underline">
                  {t.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <nav aria-label="Site">
          <h2 className="font-serif text-lg font-bold">PatternPop</h2>
          <ul className="mt-2 space-y-1">
            {pages.map((p) => (
              <li key={p.href}>
                <Link href={p.href} className="underline-offset-2 hover:underline">
                  {p.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </Container>
      <Container width="tool">
        <p className="mt-8 text-muted">© {new Date().getFullYear()} PatternPop</p>
      </Container>
    </footer>
  );
}
