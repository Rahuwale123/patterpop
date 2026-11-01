/** Size and supplies summary; the rows come from the craft (lib/crafts.ts). */
export function SizePanel({ rows }: { rows: [string, string][] }) {
  return (
    <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1.5 text-sm">
      {rows.map(([k, v]) => (
        <div key={k} className="contents">
          <dt className="font-semibold">{k}</dt>
          <dd>{v}</dd>
        </div>
      ))}
    </dl>
  );
}
