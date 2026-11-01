import Link from "next/link";
import { Prose } from "@/components/content/Prose";
import { StitchDivider } from "@/components/content/StitchDivider";

export const steps = [
  { name: "Choose a photo that will stitch well", text: "Pick a sharp photo with good light, a simple background and clear contrast between the subject and what is behind it." },
  { name: "Crop close to the subject", text: "Crop away everything you don't want to stitch. Every stitch spent on background is one less on the part you care about." },
  { name: "Decide the size", text: "Choose the width in stitches. 80 to 100 stitches suits most pets and objects; faces need 100 to 150." },
  { name: "Choose the number of colours", text: "Start with about 20 DMC colours, check the preview, then go up for faces or down for simple shapes." },
  { name: "Check and tidy the chart", text: "Merge colours that look alike, swap any that look wrong, and keep stray single stitches to a minimum." },
  { name: "Print the pattern and buy the threads", text: "Download the PDF with chart pages and a shopping list, and buy the fabric and skeins it lists." },
];

export function Body() {
  return (
    <>
      <Prose>
        <p>
          Turning a photo into a cross stitch pattern is mostly about choices before you press a button: which photo,
          how close a crop, how big and how many colours. Get those right and the chart almost makes itself. Here is
          how to do it, step by step, with the free <Link href="/">cross stitch pattern maker</Link>.
        </p>
        <h2>1. Choose a photo that will stitch well</h2>
        <p>
          Each cross stitch is one square of colour, so fine detail disappears and busy scenes turn to noise. The best
          photos have soft, even light (daylight from a window is ideal), a plain background, and clear contrast between
          the subject and its surroundings. Avoid flash, which leaves shiny patches that stitch as white blobs.
        </p>
        <h2>2. Crop close to the subject</h2>
        <p>
          Crop away anything you don&apos;t want to stitch. A face that fills the frame gets far more stitches than the
          same face in a full-length photo. For a head-and-shoulders portrait, a 4:5 crop works well.
        </p>
      </Prose>
      <StitchDivider />
      <Prose>
        <h2>3. Decide the size</h2>
        <p>
          The width in stitches sets the detail; the fabric count sets the finished size. As a rough guide: 60 stitches
          for simple shapes, 80 to 100 for pets and objects, and 100 to 150 for faces. Divide by the fabric count for
          the size in inches: 100 stitches on 14-count Aida is about 7 inches across.
        </p>
        <h2>4. Choose the number of colours</h2>
        <p>
          Around 20 colours is a good start. Simple subjects look clean with 10 to 15; portraits need 25 to 35 for soft
          skin tones. More colours means more skeins and more thread changes, so add them only where they help.
        </p>
      </Prose>
      <StitchDivider />
      <Prose>
        <h2>5. Check and tidy the chart</h2>
        <p>
          Look at the preview at fit-to-screen size, as you will see the finished piece from a distance. If two colours
          look the same, merge them. If one looks wrong, swap it for a nearby DMC shade. Leave &quot;Clean up stray
          stitches&quot; on: single stitches of a colour are fiddly and rarely noticed.
        </p>
        <h2>6. Print the pattern and buy the threads</h2>
        <p>
          Download the PDF. It splits large charts into pages with numbered rows and columns, and finishes with a
          shopping list of DMC numbers and skeins. Buy all the skeins of each colour at once so the dye lots match, and
          use the <Link href="/cross-stitch-fabric-calculator">fabric calculator</Link> if you are working on a
          different fabric.
        </p>
      </Prose>
    </>
  );
}
