const adsEnabled = process.env.NEXT_PUBLIC_ADS_ENABLED === "true";

// Reserves space so ads added later never shift the layout.
export function AdSlot({ id, minHeight = 280 }: { id: string; minHeight?: number }) {
  if (!adsEnabled) return null;
  return <div data-ad-slot={id} style={{ minHeight }} className="my-10 w-full" aria-hidden="true" />;
}
