# Sebastian Marin — Engineering Portfolio

Portfolio and engineering console for **Sebastian Marin**, Systems Engineer and Full-Stack Developer (Cochabamba, Bolivia).

The site is bilingual (Spanish by default, English toggle) and doubles as its own proof of work: the flagship section is a live vector-tile GIS console rather than a screenshot of one.

**Live:** https://dev-portfolio-lilac-chi.vercel.app

---

## What's in here

| Section | What it demonstrates |
|---|---|
| **GeoInsights Bolivia** (flagship) | Streams 247,346 real INE census block polygons from a ~90 MB PMTiles archive via MapLibre GL, using HTTP byte-range requests. No tile server, no hosted map service. |
| **AI Map Copilot** | Multi-provider streaming chat (NVIDIA NIM · Gemini · OpenAI) behind one OpenAI-compatible server proxy. Function calling lets it drive the map — switch layers, fly to a place, filter blocks by threshold — and read it back. Opens a focused map + chat workspace. |
| **Live micro-apps** | Each capability pillar is a working tool rather than a code sample: page telemetry measured from Navigation Timing, a REST tester that calls this site's real routes, a locator map centred on your inferred department, and a replayable cron/Docker console. |
| **Case studies** | Awtu Commerce (BCP QR payments, Gemini assistant), a facility reservation system with SQL conflict detection, a PHP 8 + cURL + cron sync service, and a Voronoi coverage lab. |
| **Voronoi Coverage Lab** | Exact Voronoi cells computed in the browser by half-plane intersection (Sutherland–Hodgman clipping against perpendicular bisectors), with a service-radius overlay, exportable as GeoJSON polygons. |
| **API routes** | `/api/spatial` (department query), `/api/php-sync` (response contract for the PHP service), `/api/gemini-assistant` (zone summary proxy), `/api/ai-copilot` (multi-provider SSE proxy), `/api/geo-ip` (coarse IP location). |
| **Interactive CV** | Tabbed CV with an embedded PDF viewer. Phone number gated behind an explicit reveal so it never reaches the served HTML. |

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
| `NVIDIA_API_KEY` | NVIDIA NIM provider for the AI copilot. | The provider is omitted from the selector. |
| `GEMINI_API_KEY` | Google Gemini provider, and live summaries in `/api/gemini-assistant`. | Provider omitted; the summary route returns a locally assembled answer labelled `source: "local-fallback"`. |
| `OPENAI_API_KEY` | OpenAI provider for the AI copilot. | The provider is omitted from the selector. |
| `NVIDIA_MODEL` / `GEMINI_MODEL` / `OPENAI_MODEL` | Override the default model per provider. | Uses the pinned default in `lib/aiProviders.ts`. |
| `AI_PROVIDER` | Preferred provider when the client does not pick one. | Falls back to the first configured provider. |
| `NEXT_PUBLIC_SITE_URL` | Canonical origin used for `metadataBase` and OpenGraph URLs. | Falls back to the Vercel deployment URL. |

With **no** provider key configured the site still builds and runs: the copilot
selector shows "no provider" and the chat explains what to set rather than
failing. Every key is read server-side only and never reaches the browser — a
client may *request* a provider, but the server honours that only when the key
actually exists, so a bad request cannot probe which providers are configured.

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

The flagship map mixes **real streamed census geometry** with **illustrative reference figures**, and it matters which is which. See **[DATA_SOURCES.md](./DATA_SOURCES.md)** for the full breakdown — what comes from the INE Censo 2024 PMTiles archive, what is hand-authored, and how the archive's mixed schema (absolute counts alongside 0–1 proportions) should be read.

Short version: the polygons and their per-block indicators are real. The aggregate zone summary cards are illustrative and labelled as such in the UI.

---

## Repository layout

```
app/
  api/                  Route handlers (spatial, php-sync, gemini-assistant,
                        ai-copilot SSE proxy, geo-ip)
  opengraph-image.tsx   Generated social preview card (next/og)
  layout.tsx            Metadata, fonts, root shell
  page.tsx              Single-page composition
components/
  ai/                   Map copilot, streaming/tool-loop hook, focused console
  geo/                  Location consent modal
  layout/               Header, Footer, ScrollProgress
  map/                  RealBlockMapWidget (MapLibre + PMTiles), VoronoiLab (Leaflet)
  micro/                Live pillar micro-apps and the Playwright runner panel
  motion/               Scroll reveal wrapper (honours prefers-reduced-motion)
  sections/             Hero, case studies, flagship, CV, contact, stack, workflow
  ui/                   CodeBlock, obfuscated phone, icons
context/                Language provider; GeoConsole shared map/location state
data/                   Portfolio content, CV data, census reference data, translations
lib/                    AI provider config, copilot tool schemas, geolocation helpers
tests/                  Playwright E2E suite
tools/                  Dataset inspection + MapLibre worker staging scripts
```

### How the AI copilot is wired

`AI_CHATBOT_ARCHITECTURE.md` is the reference; this repo implements it as:

- **One adapter, three providers.** `app/api/ai-copilot/route.ts` forwards to
  `${baseUrl}/chat/completions` and pipes the SSE body straight back, byte for
  byte, with `X-AI-Provider` / `X-AI-Model` headers for the response badge.
- **Tools execute client-side.** The map, its rendered features and the user's
  location already live in the browser, so `components/ai/MapCopilot.client.tsx`
  runs the tools directly instead of round-tripping. Schemas are in
  `lib/copilotTools.ts`.
- **Gemini's `thought_signature` is echoed verbatim.** Its OpenAI-compat layer
  attaches one to every tool call and returns `400 INVALID_ARGUMENT` on the next
  turn without it. Both directions are verified by a test that skips itself when
  no Gemini key is configured.
- **`temperature` is omitted unless asked for**, since reasoning-tier models
  reject any explicit value.

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
