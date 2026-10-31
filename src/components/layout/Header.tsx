import Link from "next/link";
import { LogoMark } from "./Logo";
import { Container } from "./Container";

export function Header() {
  return (
    <header className="border-b border-dashed border-hoop-dark/40 bg-aida">
      <Container width="tool" className="flex items-center justify-between py-3">
        <Link href="/" className="flex items-center gap-2 font-serif text-xl font-bold text-charcoal">
          <LogoMark className="h-8 w-8" />
          PatternPop
        </Link>
        <nav aria-label="Main">
          <ul className="flex gap-5 text-[15px] font-semibold">
            <li>
              <Link href="/" className="hover:text-madder">
                Pattern Maker
              </Link>
            </li>
            <li>
              <Link href="/about" className="hover:text-madder">
                About
              </Link>
            </li>
          </ul>
        </nav>
      </Container>
    </header>
  );
}
