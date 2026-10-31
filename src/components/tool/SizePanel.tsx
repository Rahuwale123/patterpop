import { fabricToBuyCm, fabricToBuyInches, finishedSizeInches, inchesToCm, type FabricCount } from "@/lib/pattern/fabric";

const f1 = (n: number) => n.toFixed(1);

export function SizePanel({ width, height, fabric }: { width: number; height: number; fabric: FabricCount }) {
  const wIn = finishedSizeInches(width, fabric);
  const hIn = finishedSizeInches(height, fabric);
  return (
    <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1.5 text-sm">
      <dt className="font-semibold">Design</dt>
      <dd>
        {width} × {height} stitches
      </dd>
      <dt className="font-semibold">Finished</dt>
      <dd>
        {f1(wIn)} × {f1(hIn)} in
        <br />
        {f1(inchesToCm(wIn))} × {f1(inchesToCm(hIn))} cm
      </dd>
      <dt className="font-semibold">Buy fabric</dt>
      <dd>
        {f1(fabricToBuyInches(width, fabric))} × {f1(fabricToBuyInches(height, fabric))} in
        <br />
        {f1(fabricToBuyCm(width, fabric))} × {f1(fabricToBuyCm(height, fabric))} cm
        <span className="block text-xs text-muted">Includes 3 in / 7.5 cm spare on every side.</span>
      </dd>
    </dl>
  );
}
