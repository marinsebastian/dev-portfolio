# GeoInsights Bolivia Map Issue Report

## Executive Summary

An in-depth technical audit of the "GeoInsights Bolivia" portfolio section was conducted to investigate data mismatches between Mauricio Foronda's `@mauforonda/atlasurbano` project and the Santa Cruz metro area visualization. The investigation revealed that while the map canvas correctly streams real 2024 INE Bolivian census blocks (*manzanos*) from `atlas.pmtiles` using MapLibre GL v6, the adjacent analytics card in `FlagshipGeoSection.tsx` displays hardcoded, static reference numbers from `mauForondaCensusData.ts` (`RAW_ZONES`) that are not spatially joined or dynamically calculated from the vector blocks on screen. Furthermore, unit discrepancies exist between block tooltips (`hab/ha`) and panel cards (`hab/km²`), and the "Bolivia Nacional" scope camera sits at zoom 5.5—below the PMTiles archive's `z8` floor (`tippecanoe -Z8 -z14`)—rendering zero block polygons at national zoom. This creates a disconnect between the UI text and the map canvas. The credibility risk is rated **Alto** (High) for technical reviewers (e.g. CTO/GIS Lead). The recommended solution is **Option B — Correct Data Fix**, connecting MapLibre's `queryRenderedFeatures()` live viewport statistics directly to the analytics card and harmonizing density units across the application.

## Current Behavior

1. **National Scope (Bolivia Nacional):** Selecting "Bolivia Nacional" flies the camera to `[-64.5, -16.5]` at zoom `5.5`. Because `atlas.pmtiles` was compiled with a minimum zoom of 8 (`tippecanoe -Z8 -z14`), MapLibre GL does not render any vector blocks at zoom 5.5. The map displays an empty dark CARTO raster basemap alongside a zoom warning overlay, while the adjacent right-hand panel displays static national-level metrics.
2. **Santa Cruz Scope (ZM Santa Cruz):** Selecting "Santa Cruz" flies the camera to `[-63.18, -17.78]` at zoom `12.2`, rendering all ~247,346 Censo 2024 urban blocks across Santa Cruz, Cochabamba, and La Paz.
3. **Block Clicking & Tooltip:** Clicking an individual block in Santa Cruz opens a MapLibre tooltip displaying raw Censo 2024 indicators extracted from PMTiles fields: `a1` (inhabitants), `b1` (density in `hab/ha`), `v1` (internet coverage %), and `r1` (piped water %).
4. **Right-Column Analytics Panel Disconnect:** The adjacent panel card in `FlagshipGeoSection.tsx` displays hardcoded static figures for `scz-equipetrol` (`84,500 hab.`, `4,200 hab/km²`, `94.5% Internet`). Clicking different blocks across Plan 3000, Urubó, or Norte does not update the reference card; the card remains fixed to `scopeZones[0]`.
5. **Unit Mismatch:** The block inspector tooltip displays block density in **inhabitants per hectare (`hab/ha`)**, whereas the right-column card displays density in **inhabitants per square kilometer (`hab/km²`)** (where 4,200 hab/km² corresponds to 42 hab/ha), creating apparent numerical contradictions when comparing a block with the adjacent summary card.

## Expected Behavior

1. **Synchronized Map & Analytics Panel:** The analytics panel and map canvas must be 100% synchronized in data, bounds, and units.
2. **Live Viewport Aggregation:** When panning or zooming across Santa Cruz (or any other scope), the analytics panel should display live aggregate metrics calculated dynamically from the vector block features currently visible in the MapLibre viewport via `queryRenderedFeatures()`.
3. **Selected Block Inspection Mode:** Clicking an individual block on the map should update the right-hand analytics card to display that specific block's Censo 2024 indicators (`a1`, `b1`, `v1`, `r1`, `g1`) with matching units.
4. **Harmonized Units:** Density metrics must consistently use the same unit system (`hab/ha` throughout, or auto-converted with explicit formulas: $1\text{ ha} = 10,000\text{ m}^2$, $1\text{ km}^2 = 100\text{ ha}$).
5. **Graceful Scope Transition:** The scope selector should handle the `z8` dataset floor transparently—either rendering department-level GeoJSON polygons at zoom 5.5 (`/api/spatial`) or automatically prompting a zoom-in to metropolitan block clusters upon selecting a layer.

## Data Sources Found

| Source Name | Location / Path | Data Type | Purpose | Provenance Kind | Confidence Level |
|---|---|---|---|---|---|
| **atlas.pmtiles** | `https://raw.githubusercontent.com/mauforonda/atlasurbano/pmtiles/atlas.pmtiles` | PMTiles v3 (MVT vector tiles) | Real Censo 2024 urban block polygons & indicators (`a1`..`v1`) | Real (INE Censo 2024 processed by `@mauforonda`) | High (247,346 real census blocks) |
| **RAW_ZONES / URBAN_CENSUS_ZONES** | `data/mauForondaCensusData.ts` | Static TypeScript Objects | Aggregate reference figures for 12 urban zones across 4 scopes | Illustrative (Hand-authored reference values) | Medium (Reference summaries, not live INE aggregations) |
| **boliviaGeoJson.ts** | `data/boliviaGeoJson.ts` | Static JS GeoJSON | Department boundaries served via `/api/spatial` | Illustrative (Coarse simplified outlines) | Medium (For overview display only) |
| **CARTO Dark Matter** | `https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png` | Raster PNG tiles | Dark-themed basemap tile layer | Real (CARTO / © OpenStreetMap) | High |

## Files and Components Involved

| File | Role | Relevant Finding |
|---|---|---|
| [`components/sections/FlagshipGeoSection.tsx`](file:///e:/data%20resnet/dev-portfolio/components/sections/FlagshipGeoSection.tsx) | Main Section Container | Renders title, scope controls, dynamic import of `RealBlockMapWidgetClient`, right-hand reference card (`referenceZone = scopeZones[0]`), and Recharts bar chart. Hardcodes reference card to static `RAW_ZONES` instead of reading live MapLibre feature state. |
| [`components/map/RealBlockMapWidget.client.tsx`](file:///e:/data%20resnet/dev-portfolio/components/map/RealBlockMapWidget.client.tsx) | MapLibre GL + PMTiles Map Widget | Initializes MapLibre GL, fetches `atlas.pmtiles`, registers `pmtiles://` protocol in main thread and web worker, maps minified fields (`a1`..`v1`), renders vector fill/stroke layers, and exposes `getVisibleStats()` controller. |
| [`data/mauForondaCensusData.ts`](file:///e:/data%20resnet/dev-portfolio/data/mauForondaCensusData.ts) | Data Schema & Config | Defines `RAW_ZONES`, `SCOPE_CONFIG`, `GEOBOLIVIA_DATASET_METADATA`, layer paint codes, and camera centers (`centerLngLat`). |
| [`context/GeoConsoleContext.tsx`](file:///e:/data%20resnet/dev-portfolio/context/GeoConsoleContext.tsx) | Global State Provider | Manages state for `activeScope`, `activeLayer`, `threshold`, `selectedBlock`, `visibleStats`, and imperative map controller registration. |
| [`DATA_SOURCES.md`](file:///e:/data%20resnet/dev-portfolio/DATA_SOURCES.md) | Provenance Documentation | Documents the dual nature of real PMTiles block data vs illustrative reference figures. |

## Root Cause Analysis

### Root Cause 1: Decoupling of Vector Tile Layer and Panel State
The map component (`RealBlockMapWidget`) streams real PMTiles census blocks via MapLibre GL. However, the right-hand panel in `FlagshipGeoSection.tsx` computes `referenceZone = scopeZones[0] ?? URBAN_CENSUS_ZONES[0]`. Consequently, the panel always displays static values for `Equipetrol & Distrito Financiero` regardless of where the user pans on the map or which specific census block they click. There is no reactive binding between the clicked/rendered MapLibre vector features and the summary card.

### Root Cause 2: Unit Inconsistency (`hab/ha` vs `hab/km²`)
The PMTiles archive stores block density in attribute `b1` as **inhabitants per hectare (`hab/ha`)**, which is rendered in the block inspector tooltip. `FlagshipGeoSection.tsx` and `mauForondaCensusData.ts` define density in **inhabitants per square kilometer (`hab/km²`)**. Because $1\text{ km}^2 = 100\text{ ha}$, a block with density $110\text{ hab/ha}$ corresponds to $11,000\text{ hab/km}^2$. Displaying $110\text{ hab/ha}$ on the map tooltip next to $4,200\text{ hab/km}^2$ on the card without explicit unit conversion creates an apparent contradiction.

### Root Cause 3: MinZoom Floor Discrepancy (z8 vs z5.5)
The `@mauforonda/atlasurbano` archive was tiled using `tippecanoe -Z8 -z14`. The "Bolivia Nacional" scope camera is set to zoom `5.5`. Because vector tiles do not exist below zoom 8, MapLibre GL renders zero census blocks at national zoom. The UI displays an empty basemap with a zoom warning while the right panel displays national reference figures, creating a visual mismatch between the empty map canvas and the populated panel.

## Atlas Urbano vs Santa Cruz Mismatch

1. **Textual / Conceptual Mismatch:** The UI banner references `@mauforonda / atlasurbano` and "Censo 2024". Mauricio Foronda's `atlasurbano` repository contains urban block geometries for **all urban areas across Bolivia** (Santa Cruz, La Paz, Cochabamba, Oruro, Sucre, Tarija, Potosí, Trinidad, Cobija). When the user selects "Santa Cruz", the map renders Santa Cruz blocks, but the static reference card hardcodes Equipetrol metrics.
2. **Interaction Mismatch:** Clicking different blocks across Santa Cruz (e.g. Plan 3000, Parque Industrial, Urubó) updates the map popup tooltip, but leaves the right-side summary card fixed on Equipetrol.
3. **Data Provenance Mismatch:** The PMTiles vector tiles contain granular per-block indicators (`a1`..`v1`), while the summary card displays static estimates (`RAW_ZONES`). A technical evaluator inspecting both will recognize that the card is not derived from the map's vector tiles.

## Credibility Risk

* **Classification:** **Alto** (High)
* **Explanation:** For a full-stack developer applying to Geolabs Cloud (a spatial data & cloud engineering company), a technical evaluator (CTO, Lead GIS Architect) will scrutinize map data integrations. Seeing unit mismatches (`hab/ha` vs `hab/km²`), static unlinked cards next to live vector tiles, or an empty map canvas at national zoom signals a superficial frontend wrapper rather than genuine geospatial engineering competence.

## Solution Options

### Option A — Minimal Safe Fix
* **Description:** Update `FlagshipGeoSection.tsx` so that clicking a block on the map updates the right-hand panel card with the clicked block's real attributes (`a1`, `b1`, `v1`, `r1`). Harmonize density unit labels to `hab/ha` across both tooltips and cards. Update the "Nacional" scope button to automatically transition to Santa Cruz at zoom 12 when a census layer is activated.
* **Pros:** Fast implementation, zero breaking changes, eliminates static hardcoded card disconnect.
* **Cons:** Does not compute aggregate viewport statistics when panning.
* **Affected Files:** `components/sections/FlagshipGeoSection.tsx`, `data/mauForondaCensusData.ts`.
* **Estimated Time:** ~30 minutes.
* **Risk:** Low.

### Option B — Correct Data Fix (Recommended)
* **Description:** Connect `GeoConsoleContext`'s `getVisibleStats()` controller (which calls MapLibre's `queryRenderedFeatures()` on the active viewport) directly to the right-hand panel card.
  1. When panning/zooming over Santa Cruz, the panel card displays **live aggregated viewport metrics**: *Median Density (hab/ha)*, *90th Percentile Density*, *Median Internet Coverage (%)*, and *Total Rendered Blocks Count* calculated dynamically from the PMTiles features on screen.
  2. When an individual block is clicked, the panel card seamlessly switches to **Selected Block Inspection Mode**, displaying exact `a1`, `b1`, `v1`, `r1`, `g1` values for that block.
  3. Harmonize density units to `hab/ha` across all components (with an explicit conversion tooltip: $1\text{ ha} = 10,000\text{ m}^2$).
  4. At national zoom (`z5.5`), render the lightweight GeoJSON department outlines from `/api/spatial` or provide an explicit prompt to select a metropolitan area.
* **Pros:** 100% technically authentic, live viewport spatial aggregation, proves advanced MapLibre GL API mastery to the CTO.
* **Cons:** Requires minor state wiring in `FlagshipGeoSection.tsx` and `GeoConsoleContext.tsx`.
* **Affected Files:** `components/sections/FlagshipGeoSection.tsx`, `components/map/RealBlockMapWidget.client.tsx`, `context/GeoConsoleContext.tsx`, `data/mauForondaCensusData.ts`.
* **Estimated Time:** ~1 hour.
* **Risk:** Low.

### Option C — Ideal Future Improvement
* **Description:** Deploy a PostGIS + Martin/pg_tileserv backend tile server executing server-side SQL spatial aggregation queries (`ST_Union`, `ST_SummaryStats`) over the INE Censo 2024 dataset.
* **Pros:** Enterprise-grade GIS architecture.
* **Cons:** Requires running a live database server; unnecessary overengineering for a portfolio web app.
* **Affected Files:** New backend microservice.
* **Estimated Time:** 1–2 days.
* **Risk:** High (infrastructure cost and operational overhead).

## Recommended Implementation Plan

1. **Step 1: Wire Live Viewport Statistics to Analytics Panel**
   - Update `FlagshipGeoSection.tsx` to read `visibleStats` and `selectedBlock` from `GeoConsoleContext`.
   - When no individual block is selected, render live aggregate viewport metrics (*Median Density*, *90th Percentile Density*, *Median Internet Coverage*, *Blocks in View*) derived from MapLibre's `queryRenderedFeatures()`.
2. **Step 2: Connect Block Selection to Panel Card**
   - When a user clicks a block, update the right-hand panel card to display that block's exact INE Censo 2024 metrics (`personas`, `densityPerHa`, `internetPct`, `waterPct`, `educationPct`).
3. **Step 3: Harmonize Unit Definitions**
   - Standardize all density metrics to `hab/ha` across map tooltips, panel cards, Recharts bar charts, and legend scales. Add an explanatory footnote: *"Densidad medida en habitantes por hectárea (1 ha = 10,000 m²)"*.
4. **Step 4: Resolve National Scope Handling**
   - At zoom levels below 8, render the department boundary GeoJSON from `boliviaGeoJson.ts` or automatically fly to Santa Cruz (`z12.2`) when selecting a census indicator layer.
5. **Step 5: Refine Data Provenance Banner**
   - Update dataset attribution text: *"Manzanos urbanos Censo 2024 procesados por Mauricio Foronda (@mauforonda/atlasurbano PMTiles). Métricas de vista calculadas en tiempo real en el cliente vía MapLibre GL queryRenderedFeatures()."*

## Validation Plan

### Manual Verification
1. **Scope Switching:** Select "Santa Cruz", "Cochabamba", and "La Paz". Verify the map flies smoothly to each metropolitan area and that the analytics card displays live viewport statistics for the rendered blocks.
2. **Block Inspection:** Click blocks in different neighborhoods (e.g. Equipetrol vs Plan 3000 in Santa Cruz). Verify that the tooltip and right-hand panel update instantly with identical values and matching units (`hab/ha` and `%`).
3. **Unit Consistency:** Confirm no component displays `hab/km²` while another displays `hab/ha` without conversion.
4. **Console & Performance Check:** Open browser Developer Tools, verify 0 console errors, 0 warnings, and smooth 60 FPS map panning.

### Automated Verification
1. **TypeScript Build:** Run `npm run build` and verify static page generation succeeds with 0 errors.
2. **Playwright E2E Test:** Run `npx playwright test` to verify that all E2E smoke tests (including scope switching, block selection, and i18n language toggling) pass 100%.

## Questions / Unknowns

1. **Departmental Layer at z5.5:** Should national zoom (z5.5) overlay the coarse department GeoJSON polygons from `/api/spatial`, or should clicking a census layer automatically zoom down to z12 in Santa Cruz? *(Option B supports both seamlessly).*

## Final Recommendation

**IMPLEMENT FULL DATA FIX BEFORE SENDING (Option B)**

* **Rationale:** Connecting MapLibre's live `queryRenderedFeatures()` viewport statistics to the analytics card eliminates all data mismatches, resolves unit inconsistencies, and transforms a potential credibility risk into a major technical showcase. It proves to the CTO of Geolabs Cloud that the candidate possesses real expertise in MapLibre GL, vector tiles, spatial data handling, and reactive state management.
