import type { FaqItem } from "@/data/faqs/home";
import { absoluteUrl, site } from "./site";

export type Crumb = { name: string; path: string };

export function breadcrumbList(items: Crumb[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.name,
      item: absoluteUrl(c.path),
    })),
  };
}

export function webApplication(name: string, path: string, description: string) {
  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name,
    url: absoluteUrl(path),
    description,
    applicationCategory: "DesignApplication",
    operatingSystem: "Any",
    browserRequirements: "Requires JavaScript and a modern browser (Chrome, Safari, Firefox or Edge).",
    isAccessibleForFree: true,
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    publisher: { "@type": "Organization", name: site.name, url: site.url },
  };
}

export function faqPage(items: FaqItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
}

export function organization() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: site.name,
    url: site.url,
    logo: absoluteUrl("/icon.png"),
    email: site.contactEmail,
  };
}
