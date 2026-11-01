import Link from "next/link";
import { Prose } from "@/components/content/Prose";
import { StitchDivider } from "@/components/content/StitchDivider";
import { finishedSizeInches, inchesToCm, type FabricCount } from "@/lib/pattern/fabric";

const COUNTS: FabricCount[] = [11, 14, 16, 18];
const WIDTHS = [60, 100, 150];

export function Body() {
  return (
    <>
      <Prose>
        <p>
          Fabric count is the number of stitches that fit in one inch of fabric. It doesn&apos;t change your pattern at
          all; it changes how big the finished piece is and how fine it looks. Choosing it well makes the difference
          between a relaxing project and squinting at tiny holes.
        </p>
        <h2>What the numbers mean</h2>
        <p>
          On 14-count Aida, 14 cross stitches fit in an inch. On 18-count, 18 fit, so each stitch is smaller and the
          same pattern comes out smaller. Evenweave and linen are counted in threads and usually stitched over two, so
          28-count evenweave gives 14 stitches per inch, the same size as 14-count Aida.
        </p>
      </Prose>
      <StitchDivider />
      <Prose>
        <h2>How big will my design be?</h2>
        <div className="relative overflow-x-auto">
          <table className="w-full min-w-[420px] border-collapse text-left text-[15px]">
            <caption className="mb-2 text-left text-sm text-muted">Finished width for common design widths</caption>
            <thead>
              <tr className="border-b-2 border-charcoal/30">
                <th scope="col" className="py-2 pr-3">Width</th>
                {COUNTS.map((c) => (
                  <th key={c} scope="col" className="py-2 pr-3">
                    {c}-count
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {WIDTHS.map((w) => (
                <tr key={w} className="border-b border-dashed border-charcoal/20">
                  <th scope="row" className="py-2 pr-3 font-semibold">
                    {w} stitches
                  </th>
                  {COUNTS.map((c) => {
                    const inches = finishedSizeInches(w, c);
                    return (
                      <td key={c} className="py-2 pr-3">
                        {inches.toFixed(1)} in / {inchesToCm(inches).toFixed(1)} cm
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p>
          For any other size, use the <Link href="/cross-stitch-fabric-calculator">fabric calculator</Link>.
        </p>
      </Prose>
      <StitchDivider />
      <Prose>
        <h2>Which count should I choose?</h2>
        <ul className="x-list space-y-2">
          <li>
            <strong>11-count:</strong> big holes, big stitches. Good for children, beginners and anyone who finds small
            holes hard to see. Use 3 strands so the stitches cover the fabric.
          </li>
          <li>
            <strong>14-count:</strong> the all-rounder and the most common choice. 2 strands give full coverage.
          </li>
          <li>
            <strong>16-count:</strong> a little finer and smaller, still easy with 2 strands.
          </li>
          <li>
            <strong>18-count:</strong> fine detail in a small space. Many people use 1 or 2 strands and a magnifier.
          </li>
        </ul>
        <h2>Strands and coverage</h2>
        <p>
          The lower the count, the more strands you need to cover the fabric. As a rule of thumb: 3 strands on 11-count,
          2 on 14 and 16, and 1 or 2 on 18. Fewer strands use less thread; the{" "}
          <Link href="/floss-calculator">floss calculator</Link> shows how much.
        </p>
      </Prose>
    </>
  );
}
