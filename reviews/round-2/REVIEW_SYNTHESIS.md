# Portfolio Review Synthesis — Round 2

**Candidate:** Sebastian Marin (Systems Engineer & Full-Stack Developer)
**Target Organization:** Geolabs Cloud (`https://geolabs.cloud/developer/`)
**Review Panel:** CEO, CTO, CFO, Community Manager, UI/UX Portfolio Expert
**Synthesis Date:** 2026-07-26
**Round 1 Synthesis:** [`reviews/round-1/REVIEW_SYNTHESIS.md`](../round-1/REVIEW_SYNTHESIS.md)

---

## Overall Verdict

# DO NOT SEND YET

Round 1's highest-ranked fix — replace the decorative Leaflet map with real census data — was executed, and the engineering behind it is genuinely impressive: a 90 MB PMTiles archive of 247,346 INE census block polygons, streamed over HTTP byte-range requests, with the archive's undocumented minified attribute schema decoded by hand and wired into data-driven MapLibre GL paint expressions. Nobody else applying to us will have built that.

**It had never rendered a single polygon.**

`SCOPE_CONFIG` stored camera centres in Leaflet's `[lat, lng]` order — correct for the previous implementation, and consistent with the rest of that data file. MapLibre GL takes `[lng, lat]`. Nothing converted between them, so "Santa Cruz" resolved to longitude -17.78, latitude -63.18: a point in the South Atlantic, far outside the archive's bounds. Every candidate tile was rejected, the vector source issued zero tile requests, and the layer rendered empty — in every scope, not only the national view. The unbounded raster basemap kept loading ocean tiles, so the page looked like a working dark map. No console error; `map.loaded()` returned `true`.

Two further defects sat behind it, each independently sufficient to keep the layer blank: the MapLibre worker never started (its bundled URL resolved to the app router, which returns HTML, while `setWorkerUrl` was pinned to `maplibre-gl@4.7.1` on unpkg against an installed v6.0.0), and `pmtiles://` was registered only on the main thread, while v6 keeps a **per-thread** protocol registry and loads vector tiles in the worker.

**The finding that matters is not the bug — it is that nothing caught it.** The commit message reads `fix(map): … to render vibrant real INE city block choropleth colors`. Round 1 certified this section as strong technical signal. Five Playwright tests passed, none of which touched the map. Three separate layers of self-assessment reported success on a feature that produced a blank basemap.

All three root causes were fixed and verified during this round — the map now streams tiles and renders 4,819 blocks over Santa Cruz and 7,295 over La Paz — but the verdict reflects the state in which the portfolio was submitted for review.

---

## Round 1 Fix Completion Audit

Round 1 ranked ten fixes. Before ranking new ones, here is what actually happened to them. This audit is the most important context for Round 2, because eight of the ten new blockers are either Round 1 items that were never done or new defects introduced by the one that was.

| R1 Rank | Task | Status | Evidence |
|:---:|---|:---:|---|
| 1 | Implement Mau Foronda Urban Census Map | ⚠️ **BUILT, NEVER RENDERED** | Pipeline complete and correct — MapLibre GL v6 + PMTiles v4, minified schema decoded — but camera coordinates in the wrong order meant zero polygons ever drew |
| 2 | Add OpenGraph social preview (`og-image.png`) | ❌ **NOT DONE** | No `og:image` in rendered `<head>`; `twitter:card` still `summary` |
| 3 | Add direct live demo / repo links to case studies | ❌ **NOT DONE** | `liveDemoUrl`/`githubUrl` declared in the interface, populated on 0 of 5 studies, never rendered |
| 4 | Enhance mobile touch target spacing | ❌ **NOT DONE** | 32 of 56 interactive elements under 44px at 360px; `ES`/`EN` switcher is 29×21px |
| 5 | Add quantified business impact metrics | ⚠️ **REGRESSED** | No business outcomes added. More *technical* metrics added, all unverifiable |
| 6 | Add copy feedback toast for phone & email | ⚠️ **PARTIAL** | Email copy has a checkmark in the CV section; phone has none |
| 7 | Add keyboard focus rings to language switcher | ❌ **NOT DONE** | No `focus-visible:` styling anywhere in the codebase |
| 8 | Add video/GIF walkthrough fallbacks | ❌ **NOT DONE** | Zero images of any kind on the entire site |
| 9 | Optimize Leaflet marker icon assets | ❌ **NOT DONE** | Voronoi lab still uses default CDN marker icons |
| 10 | Re-run & expand Playwright suite | ⚠️ **PARTIAL** | Suite re-runs and passes (5/5); not expanded. Nothing tests the map, mobile, or the API routes |

**Score: 0 fully done, 4 partial/regressed, 6 not done.**

The pattern this reveals matters more than any individual item: the candidate reliably completes the *ambitious* work and reliably skips the *finishing* work. Every reviewer independently identified the same pattern in different language — the CEO called it "the last 10%," the CTO called it "the engine is built, the surface is unfinished," the CFO called it "a maintenance-cost signal," and the UI/UX reviewer called it "criticism of finish, not of ability."

---

## Verdict by Reviewer

| Reviewer | Round 1 | Round 2 | Δ | One-line rationale |
|---|---|---|:---:|---|
| **CEO** | INTERESTING CANDIDATE | **INTERESTING CANDIDATE — hold the send** | ~ | Would still forward the person; would not send the link while the flagship shows nothing |
| **CTO** | STRONG TECHNICAL SIGNAL | **DO NOT SEND YET** | ▼▼ | The flagship feature renders zero polygons and three layers of self-assessment reported it working |
| **CFO** | YES — approve interview | **YES — with a caveat on the record** | ~ | Genuine cost discipline; several figures are presented as measurements and are not |
| **Community Manager** | STRONG BRAND SIGNAL | **GOOD BRAND, UNFINISHED COMMUNICATION** | ▼ | Strong visual identity, but the link is not shareable: no OG image, half-translated English |
| **UI/UX Expert** | SHIP | **FIX BEFORE SENDING** | ▼ | A full control surface rendered for data that was never on screen; accessibility layer largely absent |

**Panel average: 6.4 / 10** (CEO 7.6 · CTO 5.6 · CFO 6.9 · CM 5.6 · UX 6.2)

Four of five reviewers downgraded. In every case the downgrade came from *verifying* something Round 1 asserted rather than from the work getting worse — which is the through-line of this entire round.

---

## Consolidated Blockers

Findings that two or more reviewers independently flagged, or that a single reviewer classified as a blocker. Every item was empirically verified — the method is stated for each.

### 🔴 Blockers — do not send until resolved

| # | Blocker | Flagged by | Evidence | Impact |
|:---:|---|---|---|:---:|
| **B0** | **The census layer rendered zero polygons in every scope.** `SCOPE_CONFIG` centres were `[lat, lng]`; MapLibre needs `[lng, lat]`. The camera landed in the South Atlantic, outside the archive bounds, so no tile was ever requested. Silent — no error, `map.loaded()` returned `true`. | CEO, CTO, CM, UX | `map.getCenter()` → `{lng: -17.78, lat: -63.18}`; `queryRenderedFeatures` → 0; exactly 1 archive request (the header) | **Critical** |
| **B0b** | **The MapLibre worker never started.** v6 derives its worker URL from its own module URL; after bundling that path returns HTML from the app router. `setWorkerUrl` was pinned to `maplibre-gl@4.7.1` on unpkg against installed v6.0.0 — a cross-major worker plus a CDN runtime dependency. | CTO | Worker URL observed as the page root; worker global scope unreachable | **Critical** |
| **B0c** | **`pmtiles://` registered on the main thread only.** v6 keeps a per-thread protocol registry (`addProtocol` lives in the main bundle *and* the worker bundle, not the shared chunk); vector tiles are fetched in the worker, where the scheme was unknown. | CTO | Protocol invoked exactly once, for the TileJSON, never for a tile | **Critical** |
| **B1** | **"Bolivia Nacional" additionally has no data at its zoom.** The archive is built `tippecanoe -Z8 -z14`; the national camera sits at 5.5. Independent of B0 — it still needs an explicit empty state. | CEO, CTO, CM, UX | Direct tile fetch: `z5/10/17` → no tile, `z6/20/34` → no tile, `z12/1329/2253` → 595 KB present | **Critical** |
| **B2** | **AI assistant always returns the same zone.** Client posts `blockData`; route destructures `zoneId` (always `undefined`); the guard `name.includes("")` is always `true`, so element [0] always matches and the `metroArea` fallback is unreachable. | CEO, CTO, UX | `POST /api/gemini-assistant {"metroArea":"La Paz"}` → `{"zone":"Equipetrol & Distrito Financiero"}` (Santa Cruz) | **Critical** |
| **B3** | **Contact form reports false success.** `handleSubmit` calls `preventDefault()` and sets state. Nothing is transmitted anywhere; the UI then shows "sent successfully." | CEO, CTO, CFO, UX | Source read of `ContactSection.tsx` | **Critical** |
| **B4** | **Hand-authored figures presented under Censo 2024 branding.** Zone population/density/connectivity values are literals in `mauForondaCensusData.ts`, displayed adjacent to genuinely real census geometry with nothing distinguishing the two. | CEO, CTO, CFO | Source read; the archive's own per-block attributes are unrelated to these panel figures | **Critical** |

### 🟠 High severity — fix before sending

| # | Issue | Flagged by | Evidence |
|:---:|---|---|---|
| **H1** | **No OpenGraph image** (Round 1 fix #2, not done). `twitter:card` is `summary`; no `og:image`, no `og:url`, no `metadataBase`. Preview is English while the site opens in Spanish. | CM, CEO | Rendered `<head>` inspection |
| **H2** | **English version is incomplete.** 12 hardcoded Spanish strings survive the `EN` toggle, including the entire hero executive card. `<html lang="es">` never changes. | CTO, CM, UX | DOM inspection after toggling |
| **H3** | **Flagship renders English proof points in Spanish mode.** `proofPointsEs`/`geolabsRelevanceEs` are populated in the data file and never read by the component. | CTO, CM | Rendered page text in default (ES) mode |
| **H4** | **No links or images on any case study** (Round 1 fixes #3 and #8, not done). `liveDemoUrl`/`githubUrl` declared and unused on all 5 studies. Zero screenshots site-wide. | CEO, CFO, CM, UX | Source read |
| **H5** | **Voronoi Lab claims an algorithm it does not implement.** Draws axis-aligned squares shrinking by array index; describes "nearest-neighbor Delaunay/Voronoi cells" and lists Turf.js, which is not a dependency. | CTO, CM, UX | Source read; `package.json` has no Turf |
| **H6** | **`/api/php-sync` returns hardcoded values labelled `OPERATIONAL`.** Only `lastRun` is dynamic; `recordsSynced: 1420`, `health: "100% PASS"`, `syncDurationMs: 38` are literals describing a service that isn't running. | CTO, CFO | Live `curl` response |
| **H7** | **Block inspector always shows the same placeholder.** Reads `props.id \|\| props.manzano \|\| 'MANZANO REAL INE'`; the tile schema has neither field, so the fallback is the only reachable branch. | CTO, UX | PMTiles field list: `a1,a2,b1,b2,c1…z1` only |
| **H8** | **A 350x inflation of a real measurement.** `b1 × 350` displayed as `hab/ha`. The archive's schema is *mixed*: `a1` (0–8,645), `b1` (0–8,581), `c1` and `f1` are absolute, while `d1, e1, g1, r1, s1, v1` are 0–1 proportions. `b1` is *already* inhabitants per hectare, so a real 148 hab/ha block was displayed as "51,800 hab/ha". | CTO, CFO | Full `tilestats` vs source |
| **H8b** | **Fill ramps written for 0–1 against absolute fields.** `DENSITY` interpolated `b1` over 0.0–0.9 and `ECONOMIC_HUBS` did the same with `a1`; both fields reach into the hundreds, so every block saturated at the top colour. Only the two coverage layers were correctly scaled. | CTO | `tilestats` vs `LAYER_PAINT` |
| **H9** | **Accessibility layer largely absent.** No `focus-visible:` styling anywhere; `<html lang>` frozen; language toggle has no `aria-pressed`/`aria-label`; 32 of 56 tap targets under 44px; PDF modal has no `role="dialog"`, focus trap, or Escape handler. | UX, CM | Instrumented measurement across six viewports |
| **H10** | **Copy describes the superseded implementation.** Flagship cites "Leaflet", "GeoJSON department layers", `"Next.js 14"` (actual: 16.2.11), and a code sample attributed to `components/map/GeoInsightsExplorer.tsx`, a file that does not exist. | CEO, CTO, CFO | Rendered text vs `package.json` vs file tree |

### 🟡 Medium severity

| # | Issue | Flagged by | Evidence |
|:---:|---|---|---|
| **M1** | 20 ESLint errors, 8 warnings | CTO | `npx eslint .` → 28 problems |
| **M2** | README is unmodified `create-next-app` boilerplate; `package.json` name is `"temp-app"` | CTO, CFO | File read |
| **M3** | No map attribution rendered — CARTO, OSM, and `@mauforonda` all uncredited (`attributionControl: false`, never re-added) | CTO, UX | 0 `.maplibregl-ctrl` nodes in the DOM |
| **M4** | maplibre-gl v4.7.1 worker pinned via unpkg against an installed v6.0.0 runtime | CTO | `package.json` vs `setWorkerUrl` call |
| **M5** | `prefers-reduced-motion` ignored — the CSS override cannot affect Framer Motion's JS-driven transforms | UX | Source read of `globals.css` + all motion components |
| **M6** | Header collides at exactly 1024px; no navigation at all between 640–1023px (hamburger `sm:hidden`, drawer `lg:hidden`) | UX | Six-viewport instrumented audit |
| **M7** | `CodeBlock` header overflows at 360px — Copy button lands at x=362, clipped and unreachable on all 7 blocks | UX, CM | Bounding-rect measurement |
| **M8** | Unverifiable metrics: "60 FPS", "< 800ms", "< 45ms", "< 16ms", `tokensUsed: 168` | CEO, CFO, CM, UX | Not measurable from anything shipped |
| **M9** | 396 lines of dead code (`MapWidget.client.tsx`); unused `generateBlockGrid()` synthesizing fake block grids | CTO | Import graph |
| **M10** | Layer pills silently no-op before map style load; error swallowed by a bare `catch {}` | CTO, UX | Source read |
| **M11** | Playwright suite passes but cannot fail — nothing tests the map, mobile, or the API routes | CTO | Test file read |
| **M12** | "Relevance to the Geolabs role" box on all 5 case studies reads as overfitted to the job posting | CEO, CM, UX | Rendered content |

---

## Common Findings Across Reviewers

**1. The census map is the single strongest asset — and its surface is the weakest.** All five reviewers independently praised the PMTiles integration, and four independently found the empty Nacional tab. The most impressive thing on the site is also where the worst first impression lives.

**2. Real substrate, invented decoration.** Every reviewer converged on the same distinction: the projects are real, the employers are real, the geometry is real, the skill levels are honestly stated — and then a layer of unverifiable numbers is painted on top. The CFO put it best: *"he presents estimates in the visual language of measurements."* Notably, the places where inflation would actually pay off — PHP level, PostGIS, MCP — are conspicuously honest, which is why the panel read this as a junior habit rather than a character issue.

**3. Nothing is verifiable.** Four case studies, zero links, zero screenshots. The two most commercially valuable projects (Awtu Commerce, the reservation system) are the two nobody can see. The `liveDemoUrl` and `githubUrl` fields exist in the type definition and are populated nowhere.

**4. The bilingual promise is half-kept.** Spanish default with an instant EN toggle is a genuinely good decision for this audience. It currently leaves 12 strings untranslated in EN — including the hero card — while simultaneously showing English proof points in Spanish mode. It fails in both directions.

**5. Documentation drift.** The site describes the version of itself that existed before the last commit. Meanwhile, the repository's own README is still the framework's default template. This is the "Git / clean documented code" requirement, and it is the requirement Round 1 scored "Strong."

---

## Geolabs Requirement Coverage

Reassessed against verified evidence. Round 1's ratings are shown for comparison.

| Requirement | Portfolio Evidence | CV Evidence | R1 | **R2** | Gap to close |
|---|---|---|:---:|:---:|---|
| **PHP** (intermedio-avanzado, production) | No executing PHP. Two static samples (competent: `curl_setopt_array`, PDO prepared statements, `ON DUPLICATE KEY UPDATE`, strict types). `/api/php-sync` is a **TypeScript** route with a PHP nameplate. | MySQLi & PDO CRUD experience | Medium+ | **Weak-Medium** | Our #1 requirement, his thinnest live evidence. Ship one runnable PHP artifact, or reframe the endpoint honestly. |
| **Interactive responsive UI** | Next.js 16.2.11, React 19.2.4, TS strict, Tailwind v4, Framer Motion. Holds 360→1920px. | Next.js/Firebase freelance work | Strong | **Strong** | Mobile tap targets and the 1024px header collision. |
| **MySQL / PostgreSQL** | Correct half-open-interval overlap query, normalized schema narrative, PDO usage. No live DB. | MySQL, PostgreSQL, Supabase, SQL Server | Strong | **Medium** | The SQL shown is genuinely correct; nothing executes. |
| **REST APIs / cURL** | 3 working route handlers; real upstream `fetch` to Google's API; cURL in samples only. | BCP QR API & Gemini API integration | Strong | **Medium-Strong** | Fix the AI routing bug; stop labelling stubs OPERATIONAL. |
| **Linux / cron / processes** | Crontab line, bash cron script, Docker Compose with healthcheck — all static samples. | Linux CLI, Bash, PowerShell, Docker Compose | Strong | **Medium** | Believable via CV, undemonstrated on the site. One concrete automation story would fix this. |
| **AI tools / agents** | Working server-side Gemini proxy, `maxOutputTokens` capped, graceful degradation without a key. Good discipline, undermined by the routing bug. | Gemini API support assistant | Strong | **Medium** | Fix B2; delete the fabricated `tokensUsed`. |
| **Maps / GIS** | MapLibre GL v6, PMTiles v4, protocol registration, byte-range streaming, minified schema decoded, data-driven paint expressions, 247,346 real polygons. | Leaflet spatial visualization | Medium+ | **Strong** | Fix B1 and H7/H8. This is now his standout requirement. |
| **Git / clean docs** | 10 commits, authentic conventional-commit history. **But**: default README, `"temp-app"` package name, 20 lint errors, docs describing the previous version. | Git version control, Vercel deployments | Strong | **Weak** | Round 1's most inaccurate rating. Cheapest to fix, and it's an explicit requirement. |
| **PostGIS** (desirable) | Not claimed. | N/A | N/A | **Missing (correctly not over-claimed)** | Leave it alone. |
| **MCP** (desirable) | Not claimed. | N/A | N/A | **Missing (correctly not over-claimed)** | Leave it alone. |

**Net movement:** Maps/GIS ▲ Medium+ → Strong. Git/docs ▼ Strong → Weak. PHP ▼ Medium+ → Weak-Medium. Databases and Linux ▼ Strong → Medium on stricter evidence standards.

The two "correctly not over-claimed" rows are worth protecting. A candidate who leaves desirable-but-absent skills off the page is a candidate whose other claims carry more weight.

---

## Top 10 Fixes — Ranked

Ranked by **(reviewer consensus × trust impact) ÷ effort**. Rank 1 is the highest-value hour available.

| Rank | Task | Why It Matters | Branch | Impact | Difficulty |
|:---:|---|---|---|:---:|:---:|
| **1** | **Make the census layer render** — correct the `[lat, lng]` → `[lng, lat]` camera order, serve a version-matched MapLibre worker instead of the v4 CDN pin, register `pmtiles://` in the worker as well as the main thread, rescale the density and population ramps to the fields' real units, and add a test that asserts polygons are present | The entire portfolio is built on this feature and it rendered nothing. Everything downstream — layer pills, block inspector, legend, AI analysis — was a control surface for absent data. | `fix/flagship-integrity` | **Critical** | Medium |
| **1b** | **Give the national scope an honest empty state** — the archive genuinely has no geometry below z8, so say so and offer a "zoom to the blocks" action | Even with the camera fixed, the leftmost tab shows a bare basemap. An explained empty state beats a mysterious black box. | `fix/flagship-integrity` | **Critical** | Low |
| **2** | **Fix the AI assistant returning the wrong region** — repair the empty-string `.includes()` match, consume the `blockData` the client already sends, drop the fabricated `tokensUsed` and the wrong model label | A confident wrong answer is worse than no answer: it teaches the reader to distrust every other number on the page. | `fix/flagship-integrity` | **Critical** | Low |
| **3** | **Make the contact form honest** — compose a real `mailto:` with the form contents and say so in the confirmation | The only defect that can silently cost him the job: a recruiter uses it, he never receives it, we conclude he didn't reply. | `fix/contact-integrity` | **Critical** | Low |
| **4** | **Separate measured data from illustrative data, visibly** — label the zone panel, report `b1` in its real units instead of multiplying it by 350, document the archive's mixed schema, and remove the unreachable block-ID fallback | The single largest credibility liability. One honest sentence converts it into evidence of rigour — and volunteering the limits of your own data is the strongest trust signal available for free. | `fix/data-provenance` | **Critical** | Low |
| **5** | **Complete the bilingual layer** — wire the 12 hardcoded Spanish strings to the translation keys that already exist, use `proofPointsEs`, make `<html lang>` follow the toggle | Fails in both directions today: English mode shows Spanish, Spanish mode shows English. The keys are already written in both dictionaries and simply unused. | `fix/i18n-a11y` | **High** | Low |
| **6** | **Add an OpenGraph image + `metadataBase` + `summary_large_image`** (Round 1 #2, still open) | Until this exists the link cannot be shared. Every WhatsApp and Slack paste is a grey text box with an English title on a Spanish site. Next.js generates it from code. | `polish/social-and-seo` | **High** | Low |
| **7** | **Correct every claim that outruns the implementation** — Voronoi/Turf.js, `/api/php-sync` OPERATIONAL, "Next.js 14"/Leaflet/GeoJSON in the flagship, the nonexistent `GeoInsightsExplorer.tsx`, and all unverifiable metrics | Each one individually survivable; together they establish a pattern that makes a technical reviewer stop believing the page. | `fix/claim-accuracy` | **High** | Medium |
| **8** | **Fix the accessibility floor** — add `focus-visible` rings site-wide, raise tap targets to 44px, label the language toggle with `aria-pressed`, honour `prefers-reduced-motion` in Framer Motion | Round 1 fixes #4 and #7, both untouched. 32 of 56 controls are undersized and a keyboard user currently cannot see where they are. | `fix/i18n-a11y` | **High** | Low |
| **9** | **Give the case studies something to open** — populate `liveDemoUrl`/`githubUrl` where real, and state the boundary explicitly where not ("código privado del cliente") | Round 1 #3. The fields exist and were never filled. An honest boundary beats a silence; a silence reads as a question mark. | `polish/proof-links` | **High** | Low |
| **10** | **Clean the repository** — write a real README, drive `npx eslint .` to zero, delete 396 lines of dead code and the unused synthetic block generator, restore map attribution, remove the v4 worker pin, expand Playwright to cover the map / mobile / API routes | This *is* the "Git and clean documented code" requirement. The README is still advertising fonts the project doesn't use, and the test suite currently cannot fail. | `chore/repo-hygiene` | **High** | Medium |

---

## Things to Remove or Hide

* **Every metric that was not measured** — "60 FPS", "< 800ms", "< 45ms", "< 16ms (Inmediato)", "100% Validadas", "0% (Proxy Backend)", `tokensUsed: 168`, `recordsSynced: 1420`, `health: "100% PASS"`.
* **`components/map/MapWidget.client.tsx`** — 396 dead lines, superseded by the PMTiles widget.
* **`generateBlockGrid()` and the synthetic `manzanos` arrays** — superseded by real geometry, and their presence is precisely what makes "is this data real?" hard to answer.
* **"LISTO PARA DESPLIEGUE"** — he is a person, not a container image. "Disponible para entrevistas" says the same thing in human.
* **The Voronoi Lab, unless it implements Voronoi** — clipping a bounding polygon by perpendicular bisectors is not hard, and doing it would convert the weakest GIS artifact into a strong one. Squares are not cells, and a GIS reviewer checks this first.
* **Half the tech-stack matrix** — 19 entries with level badges is a wall of assertion that dilutes the four case studies actually carrying proof.

---

## Things to Keep

* **The PMTiles census engine.** Repair the surface; do not replace the engine. Nobody else in the applicant pool has streamed a quarter of a million real census polygons into a browser without a tile server.
* **The Operational Data Console identity.** One accent colour used only for live/interactive state, a disciplined Inter/JetBrains Mono split where the typeface itself carries meaning, restrained motion. Better than most professional developer portfolios.
* **The positioning line** — *"Construyo sistemas web que convierten datos, APIs, información espacial y procesos en herramientas operativas simples de usar."* Best sentence on the site. Do not touch it.
* **The honest skill levels.** "Intermediate+" where a weaker candidate writes "Expert." No PostGIS claim. No MCP claim. This restraint is what makes the rest of the page recoverable.
* **The Spanish-default bilingual switcher.** Right call for this audience — just finish it.
* **The server-side Gemini proxy pattern.** Key never reaches the client, output capped at 250 tokens, graceful degradation without a key. Someone who caps `maxOutputTokens` unprompted has thought about cost per call.
* **The interactive CV drawer and PDF modal.** Genuinely useful; add a focus trap and an Escape handler.
* **`scratch/inspect_pmtiles.mjs`.** Exactly the kind of tool a good engineer writes. Move it to `tools/` and name it like you meant it.

---

## Portfolio vs CV Alignment

**No contradictions.** No inflated titles, no invented employers, no stretched dates. Reference-check risk: low.

**But the CV is currently the more trustworthy document,** which inverts what a portfolio is for. The CV states verifiable facts ("integrated BCP QR payments"). The portfolio takes those same true facts and wraps them in a telemetry dashboard whose cells are unfalsifiable. The CV would survive a reference check unchanged; parts of the portfolio would not survive a technical one.

**One asset is underused:** the CV mentions an in-progress Diploma in Data Science & AI. For a company doing spatial analytics, "currently studying data science" is a forward-looking signal worth more page space than any latency figure. It is currently on tab four of a section near the bottom.

---

## Recommended Fix Branches

### `fix/flagship-integrity` — Ranks 1, 2
Empty-state and zoom handling for the Nacional scope; AI route zone-matching bug; consume `blockData`; correct model metadata; re-apply paint properties on style load.

### `fix/contact-integrity` — Rank 3
Real `mailto:` composition with honest confirmation copy.

### `fix/data-provenance` — Rank 4
Label illustrative indicators; stop presenting normalized values as measured units; remove the unreachable ID fallback; add `DATA_SOURCES.md`.

### `fix/i18n-a11y` — Ranks 5, 8
Wire the existing unused translation keys; dynamic `<html lang>`; `focus-visible` rings; 44px targets; `aria-pressed`; `useReducedMotion()`.

### `polish/social-and-seo` — Rank 6
`app/opengraph-image.tsx` via `next/og`; `metadataBase`; `summary_large_image`; `og:url`.

### `fix/claim-accuracy` — Rank 7
Implement real Voronoi or correct the description; reframe `/api/php-sync` as a contract sample; update flagship copy to MapLibre/PMTiles/Next 16; delete unverifiable metrics.

### `polish/proof-links` — Rank 9
Render `liveDemoUrl`/`githubUrl`; add explicit private-code notices; add screenshots.

### `chore/repo-hygiene` — Rank 10
README; ESLint to zero; delete dead code; restore attribution; drop the v4 worker pin; expand Playwright.

---

## Verification of the Round 2 Fixes

Every item below was applied to the codebase during this round and confirmed against the running production build. Commands and observed results:

| Check | Command | Result |
|---|---|---|
| Types | `npx tsc --noEmit` | **0 errors** |
| Lint | `npx eslint .` | **0 problems** (was 28: 20 errors, 8 warnings) |
| Build | `npm run build` | **Pass** — 8 routes, static prerender plus the generated OG image |
| E2E | `npx playwright test` | **25 passed** (was 5) |

Flagship map, measured on the production build after the fix:

| Observation | Before | After |
|---|---|---|
| Requests to the PMTiles archive | 1 (header only) | Header, directory, and tile-data range reads at 53 MB+ offsets |
| `queryRenderedFeatures` on the block layer, Santa Cruz z12 | **0** | **4,819** |
| Same, La Paz / El Alto | **0** | **7,295** |
| `map.getCenter()` for "Santa Cruz" | `{lng: -17.78, lat: -63.18}` (South Atlantic) | `{lng: -63.18, lat: -17.78}` (Santa Cruz) |
| Block density values | `b1 × 350` → e.g. "51,800 hab/ha" | Native units — median 105 hab/ha, p90 179, max 742 |
| Map attribution rendered | None | CARTO, OpenStreetMap and @mauforonda credited |

New regression tests guard the specific failures found here: PMTiles byte-range streaming with a deep-offset assertion, clicking a block and reading a real `hab/ha` value, the national-scope empty state, the `<html lang>` toggle, the absence of untranslated Spanish in EN mode, the `/api/gemini-assistant` metro-area routing, `/api/php-sync` presenting itself as a contract example, and the OG image responding with `image/png`.

---

## Final Send Recommendation

# DO NOT SEND AS SUBMITTED — SEND AFTER RANKS 1–6

Rank 1 alone is the gate. A portfolio whose defining feature renders nothing cannot go out, regardless of how good everything around it is. Ranks 2–6 are each low-difficulty and together represent under a day of work; ranks 7–10 should follow but will not move a reviewer's verdict the way the first six will.

**What this portfolio has that others won't:** a candidate who went looking for Bolivian open data, found a 90 MB census archive of 247,346 city blocks, worked out its undocumented minified attribute schema by hand, and got it streaming into a browser with no tile server and no hosted map service. Every reviewer on the panel said so independently, and it stayed true even while the feature was broken — the pipeline was right; the camera was pointed at the wrong ocean.

**What is holding it back is not capability, it is verification.** The pattern repeats at every scale: a fallback branch that is the only reachable branch, an empty state never written, copy describing the previous implementation, a `liveDemoUrl` field defined and never filled, a commit message announcing "vibrant choropleth colors" that never appeared, and a test suite that passes because it does not test the thing that is broken. The single most valuable habit this candidate could adopt is writing one assertion that the feature actually produced output.

**Status after this round:** all six gate items have been implemented and verified (see *Verification of the Round 2 Fixes*). The map renders 4,819 blocks over Santa Cruz, the AI answers about the region you selected, the contact form composes a real draft, provenance is labelled, the English build is complete, and the OG card exists. `tsc`, `eslint`, `build` and 25 Playwright tests all pass.

On that state, the verdict moves to **SHIP** — with ranks 7–10 as the follow-up pass.
