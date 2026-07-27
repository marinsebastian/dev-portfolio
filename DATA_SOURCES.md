# Data Sources & Provenance

The flagship GeoInsights section combines two kinds of data. They look similar on screen, so this document states plainly which is which.

**Summary:** the map polygons and their per-block indicators are real, streamed live from an open census dataset. The aggregate zone summary cards are hand-authored illustrative references. The UI labels them as such; this file is the long version.

---

## 1. Real — INE Censo 2024 via atlasurbano PMTiles

| | |
|---|---|
| **Source** | Mauricio Foronda (`@mauforonda`) — [atlasurbano](https://github.com/mauforonda/atlasurbano) |
| **Archive** | `https://raw.githubusercontent.com/mauforonda/atlasurbano/pmtiles/atlas.pmtiles` |
| **Underlying data** | Censo de Población y Vivienda 2024, Instituto Nacional de Estadística (INE) de Bolivia |
| **Format** | PMTiles v3, tile type MVT (`pbf`), gzip-compressed |
| **Size** | ~90 MB (`tileDataLength` 90,197,295 bytes) |
| **Features** | 247,346 polygons in a single vector layer, `manzanos` |
| **Zoom range** | **z8 – z14** (`tippecanoe -Z8 -z14`) |
| **Bounds** | -69.557, -22.854 → -57.698, -10.055 (national coverage) |
| **Transport** | HTTP byte-range requests (`Range: bytes=…`); HTTP **206 Partial Content** responses are expected and correct for this transport |

Verify any of the above yourself:

```bash
node tools/inspect-pmtiles.mjs
```

### The z8 floor

The archive contains no tiles below zoom 8, and MapLibre GL does not underzoom past a source's `minzoom`. The national scope camera sits at z5.5, so **no block geometry can render there** — only the basemap.

This is a property of the dataset, not a bug in the map, and the UI says so: below z8 the map shows an explicit notice with a "zoom to the blocks" action rather than an unexplained empty rectangle.

Confirm the coverage boundary directly:

```bash
node tools/check-tile-coverage.mjs
```

### Attribute schema

The archive minifies field names to two-character codes to keep tiles small. The mapping was recovered by reading the archive's own metadata — it is not published as documentation. Fields `a1, a2, b1, b2, c1 … z1` are all present (28 attributes total).

**The schema is mixed, and this is the part that is easy to get wrong.** Count-style fields carry absolute values; coverage-style fields are proportions in 0–1. Ranges below come from the archive's own `tilestats`:

| Code | Indicator | Kind | Range |
|---|---|---|---|
| `a1` | Inhabitants in the block | absolute count | 0 – 8,645 |
| `b1` | Density, inhabitants per hectare | absolute | 0 – 8,581 |
| `c1` | Economic dependency | absolute | 0 – 5,800 |
| `d1` | Share under 20 | proportion | 0 – 1 |
| `e1` | Share 60 and over | proportion | 0 – 0.84 |
| `g1` | Higher education | proportion | 0 – 1 |
| `r1` | Piped water coverage | proportion | 0 – 1 |
| `s1` | Sewage coverage | proportion | 0 – 1 |
| `v1` | Internet / ICT coverage | proportion | 0 – 1 |

Reproduce the table with:

```bash
node tools/inspect-pmtiles.mjs
```

### Consequences for rendering and display

- **Fill ramps must use each field's own units.** A ramp written for 0–1 applied to `b1` (which reaches into the hundreds in any real city) saturates every block at the top colour and produces a flat, meaningless choropleth. The density and population layers therefore ramp over realistic urban values; the coverage layers ramp over 0–1.
- **The block inspector reports real units**: `a1` as inhabitants, `b1` as inhabitants per hectare, and the proportion fields as percentages. Nothing is scaled by an invented constant.
- **Observed values** for reference: across Santa Cruz at z12, `b1` has a median of about 105 hab/ha, a 90th percentile near 179, and a maximum around 742. Those are plausible urban densities, which is a useful sanity check that the field is being read in its native units.

There is **no identifier field** in the layer. Individual blocks are located by the clicked coordinate, not by a block ID, because none exists in the tiles.

### Coordinate order

`SCOPE_CONFIG` in `data/mauForondaCensusData.ts` stores camera centres as `[lng, lat]` because that is what MapLibre GL and GeoJSON expect. The rest of that file uses Leaflet's `[lat, lng]`. Mixing them up moves the camera to the South Atlantic — outside the archive's bounds — at which point the block layer renders nothing while the unbounded raster basemap happily keeps loading ocean tiles, with no console error. The field is named `centerLngLat` to make the order impossible to misread, and `tests/smoke.spec.ts` guards it.

---

## 2. Illustrative — zone reference figures

Defined in [`data/mauForondaCensusData.ts`](./data/mauForondaCensusData.ts) as `RAW_ZONES`.

Twelve urban and departmental zones (Santa Cruz, Cochabamba, La Paz/El Alto, plus three national-level departments) each carry:

- `population2024`
- `densityHabKm2`
- `internetCoveragePct`
- `basicServicesIndex`
- `primarySector`
- a short narrative in Spanish and English

**These figures are hand-authored.** They are plausible reference values chosen to give each metro area a readable summary card and to drive the comparison chart. They are **not** official INE readings and were not extracted from the PMTiles archive or any other census release.

They are surfaced in the UI with an explicit provenance note:

> *Los polígonos y sus indicadores normalizados provienen del archivo PMTiles del Censo 2024. Las cifras agregadas de esta tarjeta son referencias ilustrativas de zona, no lecturas oficiales del INE.*

---

## 3. Basemap

| | |
|---|---|
| **Tiles** | CARTO Dark Matter (`basemaps.cartocdn.com/dark_all`) |
| **Underlying data** | © OpenStreetMap contributors |
| **Attribution** | Rendered on-map via MapLibre's `AttributionControl` (compact mode, bottom-right) |

OpenStreetMap's licence requires visible attribution. It is present on both the flagship map and the Voronoi lab.

---

## 4. Department reference data

[`data/boliviaGeoJson.ts`](./data/boliviaGeoJson.ts) holds simplified department outlines and summary figures for Bolivia's nine departments, served by `/api/spatial`.

The polygons are **coarse hand-drawn approximations** intended for illustration at national zoom — they are not survey-grade boundaries and should not be used for any analytical purpose. Population and area figures are approximate public reference values.

---

## 5. What is *not* live

For completeness, so nothing on the site reads as telemetry when it isn't:

| Endpoint / element | Reality |
|---|---|
| `/api/php-sync` | Publishes the **response contract** of the PHP sync service. No PHP process runs behind it; every value is an example, and the payload is labelled `kind: "api-contract-example"`. |
| `/api/gemini-assistant` | Real when `GEMINI_API_KEY` is set (calls `gemini-2.5-flash`). Without a key it assembles the summary server-side and reports `source: "local-fallback"`. The response always states which path was taken. |
| Case-study code samples | Representative extracts from the described projects, shown for review. They are not executed by this site. |

---

## Licensing & credit

- Census block geometry and indicators: **Mauricio Foronda (@mauforonda), [atlasurbano](https://github.com/mauforonda/atlasurbano)**, derived from INE Bolivia Censo 2024 open data.
- Basemap tiles: **CARTO**, data © **OpenStreetMap contributors** (ODbL).

If you reuse the census layer, credit the atlasurbano project — building that archive is the hard part, and this portfolio only consumes it.
