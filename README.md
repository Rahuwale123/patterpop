# PatternPop

A free, browser-only cross stitch pattern maker: [patternpop.online](https://patternpop.online).
Photos are processed entirely on the visitor's device. There is no server, database or account system.

## Run locally

Requires Node.js 20.9 or newer (developed on Node 26 via nvm).

```bash
npm install
npm run dev          # http://localhost:3000
```

Dev-only pages:

- `/dev/compare` runs the colour pipeline on the three sample photos side by side, with live settings.
  It uses the `.dev.tsx` page extension, which only `next dev` routes, so it never reaches the build.

## Test, lint, build

```bash
npm test             # Vitest: Lab, CIEDE2000 (all 34 Sharma pairs), k-means, skeins, fabric, colour edits, pipeline
npm run lint
npm run build        # static export to ./out
npm run audit:seo    # after a build: title, description, canonical, OG image, one H1, JSON-LD on every page
```

Preview the production build: `npx serve out`.

## Deploy to Cloudflare Pages

1. Push this repo to GitHub (or GitLab).
2. Cloudflare dashboard → **Workers & Pages** → **Create** → **Pages** → **Connect to Git** → pick the repo.
3. Build settings:
   - Framework preset: **None** (or Next.js (Static HTML Export))
   - Build command: `npm run build`
   - Build output directory: `out`
   - Environment variable: `NODE_VERSION` = `22` (or newer)
4. Optional environment variables:
   - `NEXT_PUBLIC_CF_BEACON`: your Cloudflare Web Analytics token. Nothing is loaded if unset.
   - `NEXT_PUBLIC_ADS_ENABLED`: `true` turns on the reserved `AdSlot` spaces. Off by default.
5. Save and deploy. Every push to the main branch redeploys.

### Connect patternpop.online

1. In the Pages project → **Custom domains** → **Set up a custom domain** → enter `patternpop.online`.
2. If the domain's DNS is already on Cloudflare, it adds the record for you. Otherwise either move the
   domain's nameservers to Cloudflare (recommended), or add the `CNAME` record Cloudflare shows you at your
   registrar.
3. Add `www.patternpop.online` too, then add a **Redirect Rule** (Rules → Redirect Rules) sending
   `www.patternpop.online/*` to `https://patternpop.online/${1}` with a 301, so there is one canonical host.
4. SSL is issued automatically. Under SSL/TLS, set mode to **Full** and turn on **Always Use HTTPS**.
5. Add the site to Google Search Console and submit `https://patternpop.online/sitemap.xml`.

## Before launch

- Replace the bracketed placeholders on `/about` with your own story. All long copy is marked
  `{/* DRAFT: human review */}`.
- Set up the inbox for `hello@patternpop.online` (in `src/lib/seo/site.ts`), e.g. with Cloudflare Email Routing.
- Swap `/public/samples/*.jpg` for your own photos, then regenerate the before/after WebPs
  (run the pipeline in `/dev/compare` and export the realistic previews at 480 px).

## Sample photos

The before/after examples and `/dev/compare` use three local photos in `public/samples/` (no images are
loaded from other sites). They are from Unsplash, under the [Unsplash Licence](https://unsplash.com/license),
which allows commercial use without attribution:

| File | Photographer | Source |
|---|---|---|
| `pet.jpg` | Matthew Wiebe | https://unsplash.com/photos/U5rMrSI7Pn4 |
| `portrait.jpg` | Alexander Shustov | https://unsplash.com/photos/AHBiSKaENwc |
| `flower.jpg` | Steven Spassov | https://unsplash.com/photos/tVIqMgGlAG0 |

The `*-photo.webp` and `*-pattern.webp` files are generated from them by the pattern pipeline at default
settings. Replace them with your own photos before launch if you prefer.

## Where things live

- `src/lib/color`: Lab conversion, CIEDE2000, seeded k-means++, dithering, stray-stitch cleanup
- `src/lib/pattern`: grid resampling, pipeline, symbols, DMC data, skeins, fabric maths, colour edits, rendering
- `src/workers/pattern.worker.ts`: runs the pipeline off the main thread
- `src/lib/pdf/buildPdf.ts`: PDF export (jsPDF, loaded only when someone downloads)
- `src/lib/storage/project.ts`: last project auto-saved in IndexedDB
- `src/data/tools.ts`: the list of tools. Set `live: true` only once a page exists. It drives the sitemap,
  footer and related-tools block.
- `src/data/dmc.json`: DMC colours with source and licence recorded at the top

Look for `TODO(pro)` for the places a future Pro licence check would go.
