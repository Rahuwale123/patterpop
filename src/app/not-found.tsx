import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { StitchDivider } from "@/components/content/StitchDivider";

export const metadata: Metadata = {
  title: { absolute: "Page Not Found | PatternPop" },
  description: "This page doesn't exist. Head back to the free cross stitch pattern maker.",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <Container className="py-16 text-center">
      <p className="font-serif text-6xl font-bold text-madder" aria-hidden="true">
        404
      </p>
      <h1 className="mt-4 font-serif text-[2.2rem] font-bold leading-tight">This page has come unstitched</h1>
      <p className="mt-3 text-lg text-muted">
        The link may be old, or there may be a typo in the address. Nothing you did, promise.
      </p>
      <StitchDivider />
      <div className="flex flex-wrap justify-center gap-3">
        <Link href="/" className="rounded-lg bg-madder px-5 py-2.5 font-semibold text-linen hover:bg-madder-dark">
          Make a cross stitch pattern
        </Link>
        <Link
          href="/about"
          className="rounded-lg border-2 border-dashed border-madder px-5 py-2 font-semibold text-madder hover:bg-aida-deep"
        >
          About PatternPop
        </Link>
      </div>
    </Container>
  );
}
