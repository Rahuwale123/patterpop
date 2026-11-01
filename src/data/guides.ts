// Guide list (metadata only; the articles live in src/content/guides). Same
// publishing rules as data/tools.ts, and also kept free of imports.

export type GuideMeta = {
  slug: string;
  title: string;
  /** Under 60 characters, for the <title> */
  seoTitle: string;
  description: string;
  blurb: string;
  publishDate: string;
  updated?: string;
};

export const guides: GuideMeta[] = [
  {
    slug: "how-to-turn-a-photo-into-a-cross-stitch-pattern",
    title: "How to Turn a Photo into a Cross Stitch Pattern",
    seoTitle: "How to Turn a Photo into a Cross Stitch Pattern",
    description:
      "A step-by-step guide to turning a photo into a cross stitch pattern: picking the photo, cropping, size, colours, and checking the chart before you stitch.",
    blurb: "Picking, cropping and sizing a photo so it stitches well.",
    publishDate: "2026-11-13",
  },
  {
    slug: "cross-stitch-fabric-count-guide",
    title: "Which Fabric Count Should I Use for Cross Stitch?",
    seoTitle: "Cross Stitch Fabric Count Guide: 11, 14, 16 or 18?",
    description:
      "What Aida fabric count means, how it changes the size of your finished piece, and how to choose between 11, 14, 16 and 18-count for your next project.",
    blurb: "Aida counts explained, with sizes for each.",
    publishDate: "2026-11-27",
  },
  {
    slug: "how-many-skeins-of-floss-do-i-need",
    title: "How Many Skeins of Floss Do I Need?",
    seoTitle: "How Many Skeins of Embroidery Floss Do I Need?",
    description:
      "Work out how many skeins of embroidery floss a cross stitch project needs, with stitches per skein for each fabric count and tips to avoid running out.",
    blurb: "Stitches per skein and how to avoid running out.",
    publishDate: "2026-12-08",
  },
];
