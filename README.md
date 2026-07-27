# Sebastian Marin — Engineering Portfolio

Portfolio and engineering console for **Sebastian Marin**, Systems Engineer and Full-Stack Developer (Cochabamba, Bolivia).

The site is bilingual (Spanish by default, English toggle) and doubles as its own proof of work: the flagship section is a live vector-tile GIS console rather than a screenshot of one.

**Live:** https://dev-portfolio-lilac-chi.vercel.app

---

## What's in here

| Section | What it demonstrates |
|---|---|
| **GeoInsights Bolivia** (flagship) | Streams 247,346 real INE census block polygons from a ~90 MB PMTiles archive via MapLibre GL, using HTTP byte-range requests. No tile server, no hosted map service. |
| **Case studies** | Awtu Commerce (BCP QR payments, Gemini assistant), a facility reservation system with SQL conflict detection, a PHP 8 + cURL + cron sync service, and a Voronoi coverage lab. |
| **Voronoi Coverage Lab** | Exact Voronoi cells computed in the browser by half-plane intersection (Sutherland–Hodgman clipping against perpendicular bisectors), exportable as GeoJSON polygons. |
| **API routes** | `/api/spatial` (department query), `/api/php-sync` (response contract for the PHP service), `/api/gemini-assistant` (server-side Gemini proxy). |
| **Interactive CV** | Tabbed CV with an embedded PDF viewer. |

---

## Stack

- **Framework:** Next.js 16 (App Router, Turbopack) · React 19 · TypeScript (strict)
- **Styling:** Tailwind CSS v4 · Framer Motion
- **Maps:** MapLibre GL v6 + PMTiles v4 (flagship) · Leaflet + react-leaflet (Voronoi lab)
- **Charts:** Recharts
- **Testing:** Playwright (Chromium)

---

## Running locally

```bash
npm install
npm run dev
```

Open http://localhost:3000.

### Production build

```bash
npm run build
npm run start
```

---

## Environment variables

All are optional — the site runs fully without them.

| Variable | Purpose | Behaviour when unset |
|---|---|---|
| `GEMINI_API_KEY` | Enables live Gemini summaries in `/api/gemini-assistant`. Read server-side only; never exposed to the browser. | The route returns a locally assembled summary and labels it `source: "local-fallback"`. |
| `NEXT_PUBLIC_SITE_URL` | Canonical origin used for `metadataBase` and OpenGraph URLs. | Falls back to the Vercel deployment URL. |

Copy `.env.example` to `.env.local` to set them.

---

## Verification

```bash
npx tsc --noEmit
```

```bash
npm run build
```

```bash
npx playwright test
```

```bash
npx eslint .
```

All four are expected to pass with zero errors. The Playwright suite starts the production server itself (see `playwright.config.ts`).

---

## Data sources and provenance

The flagship map mixes **real streamed census geometry** with **illustrative reference figures**, and it matters which is which. See **[DATA_SOURCES.md](./DATA_SOURCES.md)** for the full breakdown — what comes from the INE Censo 2024 PMTiles archive, what is hand-authored, and how the archive's normalized 0–1 attributes should be read.

Short version: the polygons and their per-block indicators are real. The aggregate zone summary cards are illustrative and labelled as such in the UI.

---

## Repository layout

```
app/
  api/                  Route handlers (spatial, php-sync, gemini-assistant)
  opengraph-image.tsx   Generated social preview card (next/og)
  layout.tsx            Metadata, fonts, root shell
  page.tsx              Single-page composition
components/
  layout/               Header, Footer, ScrollProgress
  map/                  RealBlockMapWidget (MapLibre + PMTiles), VoronoiLab (Leaflet)
  motion/               Scroll reveal wrapper (honours prefers-reduced-motion)
  sections/             Hero, case studies, flagship, CV, contact, stack, workflow
  ui/                   CodeBlock, icons
context/                Language provider (ES default, EN toggle)
data/                   Portfolio content, CV data, census reference data, translations
tests/                  Playwright E2E suite
tools/                  Dataset inspection scripts (PMTiles header, tile coverage)
```

---

## Tools

```bash
node tools/inspect-pmtiles.mjs
```
Prints the atlasurbano archive's header, metadata, vector layers, and per-attribute tile statistics.

```bash
node tools/check-tile-coverage.mjs
```
Probes whether tiles exist at each scope's camera zoom. This is how the archive's `z8` floor was confirmed — and why the national view shows an explicit "no coverage at this zoom" notice instead of an empty map.

---

## Contact

- **Email:** marinsebastian143@gmail.com
- **GitHub:** [github.com/marinsebastian](https://github.com/marinsebastian)
- **Location:** Cochabamba, Bolivia
