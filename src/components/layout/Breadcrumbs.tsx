import Link from "next/link";

export type Crumb = { name: string; href: string };

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb" className="pt-6 text-sm text-muted">
      <ol className="flex flex-wrap gap-1">
        {items.map((c, i) => {
          const last = i === items.length - 1;
          return (
            <li key={c.href} className="flex gap-1">
              {last ? (
                <span aria-current="page">{c.name}</span>
              ) : (
                <>
                  <Link href={c.href} className="underline underline-offset-2 hover:text-madder">
                    {c.name}
                  </Link>
                  <span aria-hidden="true">/</span>
                </>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
