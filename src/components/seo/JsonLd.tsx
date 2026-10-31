type Json = string | number | boolean | null | Json[] | { [key: string]: Json };

export function JsonLd({ data }: { data: { [key: string]: Json } }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}
