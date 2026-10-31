import type { Metadata } from "next";
import { absoluteUrl, site } from "./site";

type PageMetaInput = {
  title: string;
  description: string;
  path: string;
  ogImage?: string;
  noIndex?: boolean;
  type?: "website" | "article";
};

export function buildMetadata({
  title,
  description,
  path,
  ogImage = site.defaultOgImage,
  noIndex = false,
  type = "website",
}: PageMetaInput): Metadata {
  const url = absoluteUrl(path);
  const image = { url: absoluteUrl(ogImage), width: 1200, height: 630, alt: title };

  return {
    title: { absolute: title },
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: site.name,
      locale: site.locale,
      type,
      images: [image],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image.url],
    },
    robots: noIndex ? { index: false, follow: true } : { index: true, follow: true },
  };
}
