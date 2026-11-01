"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import type { LinkItem } from "@/lib/publish";

// Lists links to pages that are live. The HTML holds the pages live when the
// site was built; in the browser, pages that went live since then (on their
// publishDate, see functions/_middleware.js) are added. React renders the build
// date first and then today's, so hydration always matches.

const noop = () => () => {};
const todayUtc = () => new Date().toISOString().slice(0, 10);

type Props = {
  items: LinkItem[];
  buildDate: string;
  exclude?: string;
  variant: "footer" | "related";
  /** Shown above the list, only when there is something to list */
  heading?: { text: string; className: string; level: "h2" | "h3" };
};

export function ScheduledLinks({ items, buildDate, exclude, variant, heading }: Props) {
  const today = useSyncExternalStore(noop, todayUtc, () => buildDate);
  const live = items.filter((i) => i.publishDate <= today && i.href !== exclude);
  if (live.length === 0) return null;
  const H = heading?.level ?? "h2";
  const title = heading && <H className={heading.className}>{heading.text}</H>;

  if (variant === "footer") {
    return (
      <>
      {title}
      <ul className="mt-2 space-y-1">
        {live.map((t) => (
          <li key={t.href}>
            <Link href={t.href} className="underline-offset-2 hover:underline">
              {t.title}
            </Link>
          </li>
        ))}
      </ul>
      </>
    );
  }
  return (
    <>
    {title}
    <ul className="x-list mt-4 space-y-2">
      {live.map((t) => (
        <li key={t.href}>
          <Link href={t.href} className="font-semibold text-madder underline">
            {t.title}
          </Link>{" "}
          <span className="text-muted">{t.blurb}</span>
        </li>
      ))}
    </ul>
    </>
  );
}
