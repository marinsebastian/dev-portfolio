# CTO Portfolio Review

**Round:** 2
**Reviewer persona:** CTO, Geolabs Cloud
**Review date:** 2026-07-26
**Method:** live production build first (`npm run build && npm run start`), then DevTools/network/console, then selective source review, then CV
**Verification performed:** `npx tsc --noEmit`, `npm run build`, `npx playwright test`, `npx eslint .`, direct PMTiles archive inspection, direct API endpoint calls

---

## Hiring Verdict

**DO NOT SEND YET.**

This is a two-step downgrade from Round 1's "STRONG TECHNICAL SIGNAL", and the reason is narrow and specific: **the flagship feature does not work.** Not "works with rough edges" — the census map that the entire portfolio is built around renders zero polygons, in every scope, on the deployed build. Evidence below.

I want to be equally clear about what is *not* wrong. The architecture around that failure is sound and ambitious. Reaching for PMTiles over byte-range requests instead of standing up a tile server is the right instinct. Reverse-engineering the archive's undocumented minified attribute schema is real work. `npx tsc --noEmit` is clean, the production build is clean and mostly static, and the API key handling is correct. Had the map worked, my verdict would have been PROMISING BUT NEEDS CLEANUP and I would have said so.

The reason it reads as DO NOT SEND is not the bug itself — bugs happen, and this one is genuinely subtle. It is that **nothing in the process caught it.** The commit history says `fix(map): map PMTiles minified feature keys … to render vibrant real INE city block choropleth colors`. There are no vibrant colours; there is a dark basemap over the South Atlantic. Round 1's review certified this section as strong technical signal. Five Playwright tests pass, none of which touches the map. The gap between what the repository asserts about itself and what it does is the actual finding, and it is the one that would worry me about putting this person in front of a client dataset.

Fix the map and this becomes a strong candidate. Send it as-is and the first reviewer who clicks the primary CTA sees an empty rectangle.

---

## First Technical Impression

I opened the production build, not the dev server. Positives, in order of how much they moved me:

- **The PMTiles integration is real and correctly done at the protocol layer.** `new pmtiles.Protocol()` registered via `maplibregl.addProtocol('pmtiles', …)`, source declared as `pmtiles://<url>`, byte-range streaming working. The HTTP 206 responses are expected behaviour and he understood that. Most candidates who say "vector tiles" mean "I used Mapbox's hosted tiles."
- **He solved the minified-attribute problem.** The atlas encodes census fields as `a1`, `b1`, `v1`, `r1`, `g1`. Paint expressions read `['get', 'b1']` and friends. That means he opened the tile metadata and worked out the schema himself. That is genuine debugging, not tutorial-following.
- **`npx tsc --noEmit` is clean.** Zero errors, strict mode. Confirmed.
- **The production build is clean and mostly static.** Seven routes: `/` and `/_not-found` prerendered, three API routes server-rendered on demand. Compiled in 4.2s.
- **Server-side API key handling is correct.** `GEMINI_API_KEY` is read in a route handler, never shipped to the client, `.env*` is gitignored. No secrets anywhere in the tree. I checked.

Then I checked whether the census blocks were actually on screen. They were not — and not just in the national view I expected to be sparse. Nowhere.

---

## Requirement-by-Requirement Fit

| Requirement | Evidence in portfolio | Strength |
|---|---|---|
| **PHP** | No executing PHP. Two static code samples (`sync_service.php`, `cron_sync.php`) rendered in a viewer, plus `/api/php-sync` — which is a **TypeScript** route returning a hardcoded object describing a PHP service that isn't running. The samples themselves are competent: `curl_setopt_array`, PDO prepared statements, `ON DUPLICATE KEY UPDATE`, stderr/exit-code discipline, `declare(strict_types=1)`. | **weak-to-medium** — the code he shows is right; nothing demonstrates it runs. This is our #1 requirement and his thinnest live evidence. |
| **Interactive responsive UI** | Next.js 16.2.11 App Router, React 19.2.4, TypeScript strict, Tailwind v4, Framer Motion. Layout holds from 360px to 1920px with no page-level horizontal scroll. | **strong** |
| **MySQL/PostgreSQL** | SQL overlap-detection query in the reservation case study (correct half-open interval logic: `start < p_end AND end > p_start`), schema narrative, PDO usage in samples. No live database. | **medium** — the SQL shown is correct and non-trivial. |
| **REST APIs / cURL** | Three working Next.js route handlers (`/api/spatial`, `/api/php-sync`, `/api/gemini-assistant`). Real upstream `fetch` to Google's generative API. cURL only in static samples. | **medium-strong** |
| **Linux / cron / processes** | Crontab line, bash cron script, Docker Compose with healthcheck, all as static samples. CV corroborates daily Linux use and UMSS IT automation. | **medium** — believable via CV, undemonstrated on the site. |
| **AI tools / agents** | Working server-side Gemini proxy with graceful degradation to a mock when no key is present. Good pattern. Undermined by the routing bug below. | **medium** |
| **Maps / GIS** | The most ambitious area and the one that fails. MapLibre GL v6, PMTiles v4, protocol registration, data-driven `interpolate` expressions, layer switching, click-to-inspect, `flyTo` camera control — all wired up, all pointed at a camera in the wrong ocean, so **no census polygon is ever rendered**. The knowledge is visibly there; the verification is not. | **strong on paper, broken in the build** |
| **Git / clean docs** | 10 commits, conventional-commit style, messages that describe actual changes (`fix(map): map PMTiles minified feature keys…`). History looks authentic. **But**: README is unmodified `create-next-app` boilerplate, `package.json` name is `"temp-app"`, and `npx eslint .` reports 20 errors. | **weak** — Round 1 scored this "Strong". It is not. |
| **MCP** | Not claimed anywhere on the site. | **missing (correctly not over-claimed)** |
| **PostGIS** | Not claimed. Correct — he doesn't have it. | **missing (correctly not over-claimed)** |

The two "not over-claimed" rows deserve credit. A candidate who leaves the desirable-but-absent skills off the page rather than padding them is a candidate whose other claims I'm more inclined to believe.

---

## Project Credibility Review

### GeoInsights Bolivia (flagship) — real engine, unreliable surface

The rendering pipeline is legitimate. Everything wrapped around it needs work.

- **🔴 THE MAP RENDERS NO CENSUS BLOCKS AT ALL. In any scope.** This is the finding that reframes the whole review, and I want to lay out the evidence because it is not something you can see by looking at the page — the map *looks* like a working dark basemap that happens to be over open water.

  `SCOPE_CONFIG` stores camera centres as `[lat, lng]` — Leaflet's order, consistent with the rest of that data file, which was written for the previous Leaflet implementation. MapLibre GL takes `[lng, lat]`. The centres are passed through unchanged, so `map.getCenter()` returns `{lng: -17.78, lat: -63.18}` for "Santa Cruz": longitude −17.78 is the mid-Atlantic, latitude −63.18 is the Southern Ocean. That point is far outside the archive's bounds (`sw -69.56,-22.85` / `ne -57.70,-10.05`), so `hasTile()` rejects every candidate tile and the vector source issues **zero** tile requests. The raster basemap declares no bounds, so it cheerfully keeps loading ocean tiles — which is exactly why the failure is invisible.

  Measured on the running production build: `queryRenderedFeatures({layers:['ine-manzanos-fill']})` → **0**. Exactly one request ever reaches the archive (the 16 KB header read that resolves the TileJSON on the main thread), and none after it. Canvas output is byte-identical between the national view and the Santa Cruz view. No console error, no `error` event on the map, `map.loaded()` returns `true`.

  So the single most impressive claim in this portfolio — 247,346 real INE census polygons rendered in the browser — currently produces a blank basemap. Everything downstream of it is decoration: the layer pills repaint a layer with nothing in it, the block inspector can never fire, and the legend describes a colour ramp nobody can see.

- **Two further defects sat behind the coordinate bug, each independently fatal.** Both would have kept the map empty even with the camera fixed, and both are worth noting because they are the kind of thing that only surfaces when you actually verify:
  1. **The worker never started.** maplibre-gl v6 derives its worker URL from its own module URL and launches it as a module worker. After bundling, that relative path doesn't resolve — the request falls through to the app router, which returns HTML, and the worker dies. The existing code pinned `setWorkerUrl` to `maplibre-gl@4.7.1`'s CSP worker **on unpkg**, against an installed v6.0.0. A v4 worker cannot talk to a v6 main thread, and it also makes the flagship depend on a third-party CDN at runtime.
  2. **The custom protocol was registered on the wrong thread.** In v6 the protocol registry is per-thread — `addProtocol` exists in the main bundle *and* separately on the worker's global scope, but not in the shared chunk. A main-thread-only `pmtiles://` registration resolves the source's TileJSON and nothing else, because vector tiles are fetched and parsed in the worker, where the scheme is unknown.

- **The "Bolivia Nacional" scope has a second, genuine reason to be empty.** Independent of the above: the archive is built `tippecanoe -Z8 -z14`, so no geometry exists below zoom 8, and the national camera sits at 5.5. Verified by direct tile fetch — `z5/10/17` → no tile, `z6/20/34` → no tile, `z12/1329/2253` → 595 KB present. MapLibre does not underzoom past a source's minzoom. Even with the camera fixed, the national view needs an explicit empty state; there is none.

- **The block inspector cannot identify a block.** It reads `props.id || props.manzano || 'MANZANO REAL INE'`. The vector layer's field list is `a1, a2, b1, b2, c1…z1` — there is no `id` and no `manzano`. Every block would therefore show the identical placeholder string. He wrote a fallback and never noticed it is the only branch that can execute. (Moot today, since the inspector can never open.)

- **A 350× inflation of a real measurement.** `density: Math.round(props.b1 * 350) + ' hab/ha'`.

  I want to be precise here, because I got this wrong on my first pass and the correct version is more interesting. I initially assumed every attribute in the archive was normalized 0–1 — that is what the tile stats show for the attribute I happened to sample first. Reading the full `tilestats` shows the schema is **mixed**: `a1` (population) ranges 0–8,645, `b1` (density) 0–8,581, `c1` 0–5,800 and `f1` 12–20,700 are absolute values, while `d1, e1, g1, r1, s1, v1` are genuine 0–1 proportions.

  So `b1` is *already* inhabitants per hectare. The unit on the label was right; the number was multiplied by 350 for no reason. A real block reading 148 hab/ha would have been displayed as "51,800 hab/ha" — a physically absurd figure presented in the visual language of a measurement. Same category of error as I first described, larger in magnitude.

  The same mixed schema also means the paint ramps are wrong: `DENSITY` interpolates `b1` across stops 0.0→0.9 when the field's real urban range is roughly 0–450, so every block saturates at the top colour. Same for `ECONOMIC_HUBS` on `a1`. Only the two coverage layers (`v1`, `r1`) have correctly scaled ramps.
- **Layer switching silently no-ops before style load.** The paint-property effect opens with `if (!mapRef.current || !mapRef.current.isStyleLoaded()) return;` and depends only on `[activeLayer]`. Click a layer pill during the initial load and the click is swallowed with no retry on `load`. There's also a bare `try { … } catch {}` around `setPaintProperty` that discards the error.
- **Worker URL is pinned to the wrong major version.** `setWorkerUrl('https://unpkg.com/maplibre-gl@4.7.1/dist/maplibre-gl-csp-worker.js')` while `package.json` installs `maplibre-gl@^6.0.0` (6.0.0 resolved). A v4 worker against a v6 main thread is an unsupported combination — the protocols between them are not stable across majors. It also makes first paint of our flagship feature depend on unpkg being reachable, which fails behind a strict CSP or an offline demo. I observed the runtime creating a blob worker anyway, which suggests the pin is not even taking effect and the original MIME error may have been a dev-server-only artifact.
- **No attribution is rendered.** `attributionControl: false` is passed to the constructor and no `AttributionControl` is added back. The `attribution` strings on both sources are therefore never displayed — CARTO, OpenStreetMap, and `@mauforonda` all go uncredited. OSM's licence requires attribution. For a candidate applying to a geospatial company, silently dropping basemap attribution is a professional-judgement flag, not a cosmetic one.
- **The `useEffect` that constructs the map reads `activeScope` with `[]` deps** — ESLint flags it. It happens to be harmless because a second effect handles camera moves, but it's the kind of thing that becomes a bug the moment someone edits it.

### Awtu Commerce — the most valuable claim, the least verifiable

BCP QR polling with webhooks, a Gemini assistant behind a backend proxy, admin CRUD, Playwright coverage. The `pollBcpTransactionStatus` sample is sensible: bounded attempts, terminal-state short-circuit, fixed 2.5s interval, explicit `POLL_TIMEOUT`. I'd have asked about backoff and idempotency in review, but as a portfolio sample it's fine.

The problem is that **nothing links anywhere.** No demo, no repository, no screenshot, no video. The `CaseStudy` interface literally declares `liveDemoUrl?: string` and `githubUrl?: string` — and neither field is populated on any of the five entries, nor rendered by the component. The intent to link was there and never landed. This is real commercial work, and it is currently presented as an assertion.

### PHP Data Sync API Service — the requirement/evidence mismatch

Our job posting leads with PHP. This case study is the site's answer, and it is a TypeScript route handler returning:

```json
{"service":"PHP Data Sync REST API","status":"OPERATIONAL","recordsSynced":1420,
 "health":"100% PASS","samplePayload":{"syncDurationMs":38,"status":200}}
```

Only `lastRun` is dynamic (`new Date()`). `recordsSynced: 1420`, `syncDurationMs: 38`, `health: "100% PASS"` are literals. Labelled `"status": "OPERATIONAL"`, it reads as live telemetry from a running PHP service. There is no PHP service. If this were framed as *"example response contract for the PHP sync service"* it would be a perfectly reasonable artifact. Framed as OPERATIONAL, it's the kind of thing that ends an interview badly if the interviewer probes it.

### Voronoi Spatial Coverage Lab — the claim does not match the code

The case study says it *"calculates nearest-neighbor Delaunay/Voronoi cells"* and lists **Turf.js** in the stack. The implementation is:

```ts
function generateApproximateVoronoiBox(pt: Point, delta = 0.25): [number, number][] {
  return [[pt.lat+delta, pt.lng-delta], [pt.lat+delta, pt.lng+delta],
          [pt.lat-delta, pt.lng+delta], [pt.lat-delta, pt.lng-delta]];
}
```

Axis-aligned squares, one per point, with the size shrinking by array index (`0.08 - idx*0.005`). No Delaunay triangulation, no perpendicular bisectors, no adjacency, no tessellation — the polygons overlap each other and leave gaps. Turf.js is not a dependency; it is not in `package.json` and is not imported anywhere. The GeoJSON export is real, but it exports the *points*, not the coverage polygons the section is about.

I want to be fair: it is presented as a "Lab," and labs are allowed to be sketches. But the description claims a specific, well-known algorithm that is not implemented, and lists a library that is not installed, next to a visual that a non-specialist would read as Voronoi cells. Any interviewer who knows GIS will open this first — Voronoi is the one thing on the page a geospatial person can verify by eye. Squares are not Voronoi cells and the shrinking-by-index sizing makes it obvious on inspection.

### Facility Reservation System

The least flashy and the most solid. The overlap query is correct — the half-open interval comparison is the version people get wrong. Normalized schema, role-based approval, capacity constraints. No inflated claims. I'd happily discuss this one in an interview.

---

## Code / Repo Findings

**Verified command output:**

| Command | Result |
|---|---|
| `npx tsc --noEmit` | **PASS** — 0 errors |
| `npm run build` | **PASS** — compiled in 4.2s, 7 routes, TypeScript checked |
| `npx playwright test` | **PASS** — 5/5 in 4.7s (chromium) |
| `npx eslint .` | **FAIL** — 28 problems (20 errors, 8 warnings) |

**ESLint breakdown (20 errors):**
- 10 × `@typescript-eslint/no-explicit-any` — including `useState<any>` for the block inspector payload and `(maplibregl as any)`
- 6 × `react/jsx-no-comment-textnodes` — the decorative `//` used as a section marker is being parsed as a stray comment in JSX children
- 2 × `prefer-const` in `MapWidget.client.tsx`
- 1 × `react-hooks/set-state-in-effect` in `LanguageContext` — the localStorage hydration triggers a cascading render
- 1 × `react-hooks/exhaustive-deps` — the map-init effect's missing `activeScope`

**Dead code:** `components/map/MapWidget.client.tsx` is 396 lines and imported by nothing — the Leaflet implementation the PMTiles widget replaced. `data/mauForondaCensusData.ts` still exports `generateBlockGrid()`, which synthesizes fake 3×3 block grids with seeded pseudo-random variation and attaches them to every zone as `manzanos`; nothing renders them anymore. `scratch/` contains two working scripts and is committed. `TranslationKey`, `CaseStudy`, `L`, `MapPin`, `Globe` are imported and unused.

**Data provenance.** This is my most substantive concern about the flagship. `URBAN_CENSUS_ZONES` in `data/mauForondaCensusData.ts` contains hand-authored figures — Equipetrol at 84,500 inhabitants, 4,200 hab/km², 94.5% internet coverage, 98.2/100 services index. These are displayed in a panel headed with census branding, adjacent to a map that *is* streaming genuine census geometry. Nothing distinguishes the two. The real data and the illustrative data are visually identical. At a company that sells geographic truth, an undeclared boundary between measured and invented values is the finding I would want addressed before anything else on this list.

**The AI route has a logic bug that produces confidently wrong output.** The client posts `{ metroArea, blockData, activeLayer, language }`. The route destructures `{ metroArea, zoneId, activeLayer, language }` — `blockData` is read by nobody, `zoneId` is always `undefined`. The lookup then does:

```ts
URBAN_CENSUS_ZONES.find(z => z.id === zoneId || z.name.toLowerCase().includes((zoneId || "").toLowerCase()))
```

`"anything".includes("")` is `true`, so the first predicate branch always matches the **first array element** and the `metroArea` fallback is unreachable. Verified live:

```
POST /api/gemini-assistant {"metroArea":"La Paz", …}
→ {"zone":"Equipetrol & Distrito Financiero", … "(Santa Cruz)" …}
```

Select La Paz, get Santa Cruz. Every time. The response also reports `"model": "gemini-1.5-pro-mock-proxy"` (the route calls `gemini-2.5-flash`) and `"tokensUsed": 168`, a hardcoded number in the mock path — a fabricated telemetry value in a field an evaluator would reasonably read as measured.

**Test suite.** Five tests, all real and all passing. They hardcode `http://localhost:3000` despite `baseURL` being configured. Coverage gaps that matter: nothing tests the map (the flagship), nothing tests a mobile viewport, nothing tests the API routes, nothing tests the EN language path beyond two strings. `retries: 0` and `workers: 1` are fine for a smoke suite. The suite passes because it doesn't test the parts that are broken.

**Copy/implementation drift.** The flagship case study still describes the *previous* implementation: proof points cite "Dynamic GeoJSON layer loading for 9 departments" and "Leaflet UI integration"; `techStack` says `"Next.js 14"` (actual: 16.2.11); the code sample is attributed to `components/map/GeoInsightsExplorer.tsx`, a file that does not exist. He shipped a new engine and left the old description in place.

**Bilingual defects.** `FlagshipGeoSection` renders `flagshipData.proofPoints` and `.geolabsRelevance` — the **English** fields — while the site's default language is Spanish. `proofPointsEs` and `geolabsRelevanceEs` are populated in the data file and never read. So the default Spanish experience shows an English block on the flagship section. Symmetrically, 12 hardcoded Spanish strings survive the EN toggle, including the entire hero executive card. And `<html lang="es">` is static in `layout.tsx` — it never updates, so assistive technology announces English content with a Spanish voice. Notably, `translations.ts` *already defines* `activeZone`, `legendTitle`, `legendLow`, `legendHigh`, `scopeLabel`, `geoBoliviaTitle/Provider/Desc` in both dictionaries — the keys exist and the components hardcode Spanish instead of using them.

---

## Broken or Weak Areas

| # | Issue | Severity | Verified how |
|---|---|:---:|---|
| 1 | **The map renders zero census blocks in every scope** — `SCOPE_CONFIG` centres are `[lat, lng]`, MapLibre wants `[lng, lat]`, so the camera sits in the South Atlantic outside the archive bounds | **Critical** | `map.getCenter()` → `{lng: -17.78, lat: -63.18}`; `queryRenderedFeatures` → 0; one archive request total |
| 1b | maplibre worker never starts (bundled URL returns HTML; `setWorkerUrl` pinned to v4.7.1 on unpkg against installed v6.0.0) | **Critical** | Worker URL observed as the page root; worker scope unreachable |
| 1c | `pmtiles://` registered only on the main thread; v6's protocol registry is per-thread, and tiles are fetched in the worker | **Critical** | `addProtocol` present in main + worker bundles, absent from the shared chunk |
| 1d | "Nacional" scope has no data below z8 and no empty state | **High** | Direct PMTiles tile fetch at z5/z6/z12 |
| 2 | AI assistant always returns zone #1 regardless of selection | **Critical** | `curl` with `metroArea: "La Paz"` → returned Equipetrol/Santa Cruz |
| 3 | Contact form reports success, sends nothing | **Critical** | `handleSubmit` sets state only |
| 4 | Hand-authored figures presented under census branding | **High** | Source read of `URBAN_CENSUS_ZONES` |
| 5 | Voronoi Lab implements squares, claims Voronoi + Turf.js | **High** | Source read; Turf absent from `package.json` |
| 6 | `/api/php-sync` hardcoded values labelled `OPERATIONAL` | **High** | `curl` response |
| 7 | Block inspector always shows the same placeholder ID | **High** | Tile field list has no `id`/`manzano` |
| 8 | `b1 × 350` presented as measured `hab/ha` — `b1` is *already* inhabitants/hectare, so a real 148 reads as "51,800" | **High** | Full `tilestats`: `b1` ranges 0–8,581, not 0–1 |
| 8b | Density and population fill ramps written for 0–1 against fields whose real range is in the hundreds — every block saturates at the top colour | **High** | `tilestats` vs `LAYER_PAINT` stops |
| 9 | Flagship copy describes the superseded Leaflet/Next 14 build | **Medium** | Rendered text vs `package.json` |
| 10 | English proof points render in Spanish mode | **Medium** | Rendered page text |
| 11 | 12 Spanish strings survive the EN toggle; `<html lang>` frozen | **Medium** | DOM inspection after toggling |
| 12 | No map attribution rendered (OSM licence) | **Medium** | `attributionControl: false`, 0 `.maplibregl-ctrl` nodes |
| 13 | maplibre v4 worker pinned against v6 runtime, via unpkg | **Medium** | `package.json` vs `setWorkerUrl` call |
| 14 | 20 ESLint errors | **Medium** | `npx eslint .` |
| 15 | README is untouched `create-next-app`; package name `temp-app` | **Medium** | File read |
| 16 | No links on any case study (`liveDemoUrl`/`githubUrl` unused) | **Medium** | Source read |
| 17 | Layer switch no-ops before style load; error swallowed | **Low** | Source read |
| 18 | 396 lines of dead Leaflet widget + unused synthetic block generator | **Low** | Import graph |
| 19 | Unverifiable metrics (60 FPS, <800ms, <45ms, <16ms) | **Low** | Not measurable from anything shipped |
| 20 | No OG image; no `metadataBase`; no Twitter card | **Low** | `layout.tsx` metadata |

**Console errors:** none observed on load. **Broken links:** none — every external link resolves. **Fake buttons:** the contact submit; the AI button in the sense that it answers about the wrong place.

---

## What to Remove or Hide

1. **`/api/php-sync` as currently framed.** Either stand up something real, or relabel it `"contract": "example response"` and drop `status: OPERATIONAL`, `health: 100% PASS`, and the invented counters.
2. **The Turf.js claim and the "Delaunay/Voronoi" wording** — unless the algorithm is actually implemented. It is not hard to implement properly (clip a bounding box by the perpendicular bisectors of each point pair); doing so would turn the weakest GIS artifact into a strong one.
3. **`components/map/MapWidget.client.tsx`** — 396 dead lines.
4. **`generateBlockGrid()` and the synthetic `manzanos` arrays** — superseded by real geometry, and their continued presence is what makes the "is this data real?" question hard to answer.
5. **All unverifiable performance numbers.**
6. **`scratch/`** — or move it to a documented `tools/` directory. The two scripts in it are actually good; `inspect_pmtiles.mjs` is exactly the kind of thing I like to see a candidate write. Name it like you meant it.

---

## What to Improve Before Sending

**Must fix (I would not send without these):**

1. Nacional view: render something, or say why it's empty.
2. AI route: fix the empty-string `.includes()` match; accept and use `blockData`; delete the fabricated `tokensUsed` and the wrong model label.
3. Contact form: make it send, or make it honest.
4. Label illustrative data as illustrative, everywhere it appears next to real data.
5. Correct the Voronoi and Turf.js claims — or implement them.
6. Reframe `/api/php-sync` as a contract sample.

**Should fix (cheap, high signal):**

7. `npx eslint .` to zero. It is 20 mechanical errors.
8. Write the README. This is our "clean documented code" requirement and the file is still advertising Geist fonts the project doesn't use.
9. Fix both bilingual leaks and make `<html lang>` follow the toggle.
10. Update the flagship copy to describe MapLibre/PMTiles/Next 16.
11. Restore map attribution.
12. Remove the v4 worker pin.
13. Delete dead code.
14. Extend Playwright to cover the map, a mobile viewport, and the API routes — the suite should be able to fail.

**What to move to "Labs":** the Voronoi tool (once honest) and the national-scale view. Both are legitimate experiments; neither is a finished feature.

**What to document better:** data provenance, above all. A short `DATA_SOURCES.md` stating exactly which fields come from the atlasurbano PMTiles archive, which are illustrative, and — critically — that the archive's schema is mixed (absolute counts *and* 0–1 proportions in the same feature) would do more for his technical credibility than any new feature. The mixed schema is the trap the current code fell into twice.

---

## Best Technical Positioning Sentence

> "Streamed 247,346 real INE census block polygons into the browser as PMTiles vector tiles over HTTP byte-range requests, decoded the archive's minified attribute schema by hand, and rendered it with data-driven MapLibre GL paint expressions — no tile server, no hosted map service, no PostGIS."

Every clause is verifiable from the repository, and it is a more specific and more impressive claim than anything currently on the page.

---

## Final Recommendation

**Do not send in this state. Fix the map, then interview him — and I would expect to be impressed.**

I want to be careful not to let one bug swallow the assessment, because the underlying signal here is good and the failure mode is instructive rather than damning.

What the evidence supports: he can pick up an unfamiliar geospatial stack fast and build most of the way through it without hand-holding. Between Round 1 and Round 2 he went from Leaflet/GeoJSON to a PMTiles vector-tile pipeline — protocol registration, byte-range streaming, an undocumented minified schema decoded by hand. Nobody else in this pile attempted anything of that scope. The coordinate-order bug is exactly the kind of mistake you make while porting from Leaflet (`[lat, lng]`) to MapLibre (`[lng, lat]`) — it is a *migration* error, not a competence error, and every geospatial engineer I know has made it at least once.

What the evidence does not support, and this is the real concern: **he did not verify the thing he was proudest of.** The bug is silent — no console error, `map.loaded()` returns true, the basemap renders — so I understand how it survived a visual check. But the commit message claims "vibrant real INE city block choropleth colors" that have never once appeared on screen, and a five-test Playwright suite exists that never touches the map. He built the harder thing (a vector-tile pipeline) and skipped the easier one (a test asserting a polygon rendered).

Also not supported: PHP in production. Our headline requirement, and his live evidence is static code samples plus a TypeScript endpoint wearing a PHP nameplate. The samples are competent and the CV backs the experience, but the portfolio doesn't prove it.

The recurring pattern across every defect: the engine gets built, the last verifying step is skipped, and the description is written as though it had passed. Empty state missing. Fallback branch that is the only reachable branch. Copy describing the previous implementation. A `liveDemoUrl` field defined and never filled. A map that was never confirmed to draw anything. That is coachable in a junior-to-mid engineer and expensive in a senior one — and he is applying at the level where it is still coachable.

**Four interview questions:**

1. "Your map renders no census blocks at all. Walk me through how you'd debug that." *(The path I want to hear: check `map.getCenter()` before blaming the data. The coordinate order is the bug; the z8 floor is a real but separate constraint. A candidate who reaches for `queryRenderedFeatures` and the tile metadata rather than re-reading the paint expression is a candidate I'd hire.)*
2. "Where do the 84,500 inhabitants and 94.5% coverage figures in the zone panel come from?" *(I want a straight answer. A straight answer here recovers most of what the finding costs him.)*
3. "Show me PHP you've written that ran in production against a real database, and tell me what broke."
4. "Your Voronoi lab draws squares. Talk me through what a real implementation would need." *(Tests whether he knows the algorithm and shipped a placeholder, or doesn't know the difference. These are very different candidates.)*
