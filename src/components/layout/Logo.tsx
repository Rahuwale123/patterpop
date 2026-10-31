// A slightly uneven X stitch, like one done by hand.
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true" className={className}>
      <rect x="1" y="1" width="30" height="30" rx="6" fill="#9b2c23" />
      <path d="M8.5 9 L23 23.5" stroke="#f7f3ea" strokeWidth="4" strokeLinecap="round" />
      <path d="M23.5 8.5 L9 23" stroke="#f7f3ea" strokeWidth="4" strokeLinecap="round" />
    </svg>
  );
}
