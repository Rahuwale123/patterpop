import Link from "next/link";
import { Prose } from "@/components/content/Prose";
import { StitchDivider } from "@/components/content/StitchDivider";
import { stitchesPerSkein } from "@/lib/pattern/skeins";

const COUNTS = [11, 14, 16, 18];

export function Body() {
  return (
    <>
      <Prose>
        <p>
          Running out of a colour on the last row is a classic stitching frustration, especially when the new skein is
          from a slightly different dye lot. A little maths before you shop avoids it. Here is how many stitches a skein
          covers and how to work out what to buy.
        </p>
        <h2>How far does one skein go?</h2>
        <p>
          A skein of DMC six-strand floss is 8 m long. Most stitchers work with 2 strands, which gives 24 m of working
          thread. Each full cross uses roughly five stitch-widths of thread on the front and back, plus about half as
          much again for tails and travelling. That works out to:
        </p>
        <div className="relative overflow-x-auto">
          <table className="w-full min-w-[320px] border-collapse text-left text-[15px]">
            <caption className="mb-2 text-left text-sm text-muted">Approximate full cross stitches per skein</caption>
            <thead>
              <tr className="border-b-2 border-charcoal/30">
                <th scope="col" className="py-2 pr-3">Fabric</th>
                <th scope="col" className="py-2 pr-3">2 strands</th>
                <th scope="col" className="py-2 pr-3">3 strands</th>
              </tr>
            </thead>
            <tbody>
              {COUNTS.map((c) => (
                <tr key={c} className="border-b border-dashed border-charcoal/20">
                  <th scope="row" className="py-2 pr-3 font-semibold">
                    {c}-count
                  </th>
                  <td className="py-2 pr-3">{stitchesPerSkein(c, 2).toLocaleString("en-US")}</td>
                  <td className="py-2 pr-3">{stitchesPerSkein(c, 3).toLocaleString("en-US")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Prose>
      <StitchDivider />
      <Prose>
        <h2>How to work out skeins for a pattern</h2>
        <ol className="list-decimal space-y-2 pl-6">
          <li>Find the number of stitches for each colour. Many pattern keys list it.</li>
          <li>Divide by the stitches per skein for your fabric and strands.</li>
          <li>Add 10% and round up to whole skeins.</li>
        </ol>
        <p>
          Example: 2,500 stitches of DMC 310 on 14-count with 2 strands. 2,500 × 1.1 = 2,750, divided by about 1,800 per
          skein is 1.5, so buy 2 skeins. The <Link href="/floss-calculator">floss calculator</Link> does this for every
          colour at once, and the <Link href="/">pattern maker</Link> includes it in its shopping list.
        </p>
        <h2>When to buy extra</h2>
        <ul className="x-list space-y-2">
          <li>
            <strong>Large areas of one colour,</strong> such as backgrounds, where you travel a lot on the back.
          </li>
          <li>
            <strong>Dark colours,</strong> which are harder to match if the dye lot changes.
          </li>
          <li>
            <strong>Projects you&apos;ll take months to finish,</strong> in case a shade is discontinued or reformulated.
          </li>
        </ul>
      </Prose>
    </>
  );
}
