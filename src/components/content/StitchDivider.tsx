import clsx from "clsx";

// A row of small X stitches in alternating thread colours.
export function StitchDivider({ className }: { className?: string }) {
  const colours = ["#9b2c23", "#c4922a", "#6f8763", "#2c3e6b"];
  const count = 13;
  return (
    <div className={clsx("flex justify-center py-10", className)} aria-hidden="true">
      <svg width={count * 18} height="12" viewBox={`0 0 ${count * 18} 12`}>
        {Array.from({ length: count }, (_, i) => {
          const x = i * 18 + 3;
          const c = colours[i % colours.length];
          return (
            <g key={i} stroke={c} strokeWidth="2" strokeLinecap="round">
              <line x1={x} y1="1" x2={x + 10} y2="11" />
              <line x1={x + 10} y1="1" x2={x} y2="11" />
            </g>
          );
        })}
      </svg>
    </div>
  );
}
