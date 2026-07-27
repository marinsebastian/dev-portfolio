'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import * as maplibregl from 'maplibre-gl';
import * as pmtiles from 'pmtiles';
import 'maplibre-gl/dist/maplibre-gl.css';
import { CENSUS_LAYER_GROUPS, SCOPE_CONFIG, ScopeType, LayerCode } from '@/data/mauForondaCensusData';
import { useLanguage } from '@/context/LanguageContext';
import { useGeoConsole, type VisibleStats } from '@/context/GeoConsoleContext';
import { Layers, ZoomIn, Crosshair, SlidersHorizontal, X } from 'lucide-react';

const PMTILES_URL = 'https://raw.githubusercontent.com/mauforonda/atlasurbano/pmtiles/atlas.pmtiles';

/**
 * Two pieces of worker wiring are required before any census block can render,
 * and both fail silently when missing — the map still reports `loaded: true`
 * because the main thread resolves the source's TileJSON on its own.
 *
 * 1. maplibre-gl v6 derives its worker URL from its own module URL. After
 *    bundling, that relative path no longer resolves, the request falls through
 *    to the app router, and the module worker dies on an HTML response. We
 *    serve a version-matched copy instead.
 *
 * 2. The custom-protocol registry in v6 is per-thread. Vector tiles are fetched
 *    and parsed in the worker, so `pmtiles://` has to be registered there too —
 *    a main-thread-only `addProtocol` leaves the worker unable to fetch a single
 *    tile.
 *
 * tools/copy-maplibre-worker.mjs stages all of these assets during predev and
 * prebuild.
 */
if (typeof window !== 'undefined') {
  maplibregl.setWorkerUrl('/maplibre/maplibre-gl-worker.mjs');
}

/** Resolves once the worker has the pmtiles protocol. */
let workerProtocolReady: Promise<void> | null = null;

function ensureWorkerProtocol(): Promise<void> {
  workerProtocolReady ??= maplibregl
    .importScriptInWorkers('/maplibre/pmtiles-protocol.worker.mjs')
    .catch((err) => {
      console.error('Failed to register the pmtiles protocol in the MapLibre worker:', err);
    });
  return workerProtocolReady;
}

/**
 * The atlas archive is built with `tippecanoe -Z8 -z14`, so no block geometry
 * exists below zoom 8. MapLibre does not underzoom past a source's minzoom, so
 * any camera below this renders the basemap only — the UI has to say so.
 */
const BLOCK_MIN_ZOOM = 8;

/** Zoom used when the user asks to jump from the national view down to real blocks. */
const BLOCK_ENTRY_ZOOM = 12;

const FILL_LAYER = 'ine-manzanos-fill';
const STROKE_LAYER = 'ine-manzanos-stroke';
const SELECTED_SOURCE = 'selected-block';
const SELECTED_LAYER = 'selected-block-glow';

/**
 * Mauricio Foronda minifies the Censo 2024 attribute names to two-character
 * codes to keep tiles small. The schema is *mixed*, which is easy to get wrong:
 * count-style fields carry absolute values, while coverage-style fields are
 * proportions in 0–1. Ranges below are the archive's own tilestats — see
 * `node tools/inspect-pmtiles.mjs`.
 */
export const ATLAS_FIELDS = {
  personas: 'a1', // Inhabitants per block — absolute, 0 … 8,645
  personas_por_hectarea: 'b1', // Density in inhabitants/hectare — absolute, 0 … 8,581
  dependencia_economica: 'c1', // Economic dependency — absolute, 0 … 5,800
  porcentaje_menor20: 'd1', // Share under 20 — proportion, 0 … 1
  porcentaje_60omas: 'e1', // Share 60 and over — proportion, 0 … 0.84
  educacion_superior: 'g1', // Higher education — proportion, 0 … 1
  agua_caneria: 'r1', // Piped water coverage — proportion, 0 … 1
  alcantarillado: 's1', // Sewage coverage — proportion, 0 … 1
  tics_internet: 'v1', // Internet / ICT coverage — proportion, 0 … 1
} as const;

interface LayerPaint {
  field: string;
  stops: (number | string)[];
  /**
   * Divisor converting a user-facing number into the field's own scale.
   * Coverage layers are quoted in percent but stored as 0–1, so "fibre above
   * 80%" has to become `v1 >= 0.8`. Count layers are already in native units.
   */
  unitScale: number;
  unitLabel: string;
}

/**
 * Fill ramp per layer. Stops are expressed in each field's own units, so the
 * absolute-count layers ramp over realistic urban values rather than 0–1 (which
 * would saturate every block at the top colour). The archive's maxima are
 * extreme outliers, so the ramps top out at a readable urban range instead.
 */
const LAYER_PAINT: Record<LayerCode, LayerPaint> = {
  TECH_CONN: {
    field: ATLAS_FIELDS.tics_internet,
    stops: [0.0, '#0f172a', 0.2, '#155e75', 0.4, '#0e7490', 0.65, '#06b6d4', 0.9, '#22d3ee'],
    unitScale: 100,
    unitLabel: '%',
  },
  DENSITY: {
    field: ATLAS_FIELDS.personas_por_hectarea,
    stops: [0, '#0f172a', 50, '#047857', 120, '#059669', 250, '#10b981', 450, '#34d399'],
    unitScale: 1,
    unitLabel: 'hab/ha',
  },
  HOUSING_SERVICES: {
    field: ATLAS_FIELDS.agua_caneria,
    stops: [0.0, '#0f172a', 0.25, '#b45309', 0.5, '#d97706', 0.75, '#f59e0b', 0.95, '#fbbf24'],
    unitScale: 100,
    unitLabel: '%',
  },
  ECONOMIC_HUBS: {
    field: ATLAS_FIELDS.personas,
    stops: [0, '#0f172a', 80, '#0d9488', 200, '#14b8a6', 400, '#2dd4bf', 800, '#5eead4'],
    unitScale: 1,
    unitLabel: 'hab',
  },
};

export function layerUnit(layer: LayerCode): { unitScale: number; unitLabel: string } {
  return { unitScale: LAYER_PAINT[layer].unitScale, unitLabel: LAYER_PAINT[layer].unitLabel };
}

/** Rounds an absolute count-style attribute, or null when the block lacks it. */
function toCount(value: unknown): number | null {
  return typeof value === 'number' ? Math.round(value) : null;
}

/** Converts a 0–1 proportion to whole percent, or null when the block lacks it. */
function toPercent(value: unknown): number | null {
  return typeof value === 'number' ? Math.round(value * 100) : null;
}

function percentile(sorted: number[], p: number): number {
  if (sorted.length === 0) return 0;
  const index = Math.min(sorted.length - 1, Math.floor(sorted.length * p));
  return sorted[index];
}

const EMPTY_COLLECTION: GeoJSON.FeatureCollection = { type: 'FeatureCollection', features: [] };

interface RealBlockMapWidgetProps {
  /** Focused mode renders the map full-height beside the chat, without chrome. */
  variant?: 'panel' | 'focused';
}

export default function RealBlockMapWidgetClient({ variant = 'panel' }: RealBlockMapWidgetProps) {
  const { t, language } = useLanguage();
  const {
    activeScope,
    setActiveScope,
    activeLayer,
    setActiveLayer,
    threshold,
    setThreshold,
    selectedBlock,
    setSelectedBlock,
    userLocation,
    registerMapController,
  } = useGeoConsole();

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);

  const [styleReady, setStyleReady] = useState(false);
  const [belowDataZoom, setBelowDataZoom] = useState(SCOPE_CONFIG[activeScope].zoom < BLOCK_MIN_ZOOM);

  const isFocused = variant === 'focused';


  // The imperative controller is registered once but reads the layer at call
  // time, so it needs a live value rather than the one captured at registration.
  const layerRef = useRef(activeLayer);
  useEffect(() => {
    layerRef.current = activeLayer;
  }, [activeLayer]);

  // Initialize the MapLibre GL map with the PMTiles vector source.
  useEffect(() => {
    const container = mapContainerRef.current;
    if (!container) return;

    // Main-thread registration: resolves the source's TileJSON and powers
    // queryRenderedFeatures. The worker gets its own copy via the module staged
    // by ensureWorkerProtocol().
    const protocol = new pmtiles.Protocol();
    maplibregl.addProtocol('pmtiles', protocol.tile);

    // Read once on mount: later scope changes are handled by the camera effect.
    const initialScope = SCOPE_CONFIG[activeScope];

    const map = new maplibregl.Map({
      container,
      style: {
        version: 8,
        sources: {
          'carto-dark': {
            type: 'raster',
            tiles: ['https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'],
            tileSize: 256,
          },
          'atlas-pmtiles': {
            type: 'vector',
            url: `pmtiles://${PMTILES_URL}`,
          },
          [SELECTED_SOURCE]: {
            type: 'geojson',
            data: EMPTY_COLLECTION,
          },
        },
        layers: [
          { id: 'carto-dark-bg', type: 'raster', source: 'carto-dark', minzoom: 0, maxzoom: 20 },
          {
            id: FILL_LAYER,
            type: 'fill',
            source: 'atlas-pmtiles',
            'source-layer': 'manzanos',
            paint: {
              'fill-color': [
                'interpolate',
                ['linear'],
                ['coalesce', ['get', LAYER_PAINT.DENSITY.field], 0],
                ...LAYER_PAINT.DENSITY.stops,
              ],
              'fill-opacity': 0.85,
            },
          },
          {
            id: STROKE_LAYER,
            type: 'line',
            source: 'atlas-pmtiles',
            'source-layer': 'manzanos',
            paint: { 'line-color': '#020617', 'line-width': 0.7, 'line-opacity': 0.7 },
          },
          {
            // The vector layer carries no id field, so the selected block is
            // highlighted by copying its geometry into a small GeoJSON source
            // rather than by filtering on a key that does not exist.
            id: SELECTED_LAYER,
            type: 'line',
            source: SELECTED_SOURCE,
            paint: {
              'line-color': '#14b8a6',
              'line-width': 3.5,
              'line-opacity': 0.9,
              'line-blur': 0.6,
            },
          },
        ],
      },
      center: initialScope.centerLngLat,
      zoom: initialScope.zoom,
      // Attribution is rendered as discrete text beneath the map instead of a
      // canvas overlay: the licence obligation is met without the watermark.
      attributionControl: false,
    });

    void ensureWorkerProtocol();

    map.on('load', () => {
      map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right');
      setStyleReady(true);
    });

    // The block layer only exists from BLOCK_MIN_ZOOM; surface that to the user.
    const syncZoomState = () => setBelowDataZoom(map.getZoom() < BLOCK_MIN_ZOOM);
    map.on('zoomend', syncZoomState);
    map.on('moveend', syncZoomState);

    map.on('click', FILL_LAYER, (e) => {
      const feature = e.features?.[0];
      if (!feature) return;
      const props = feature.properties ?? {};

      setSelectedBlock({
        lngLat: `${e.lngLat.lat.toFixed(5)}, ${e.lngLat.lng.toFixed(5)}`,
        lat: e.lngLat.lat,
        lng: e.lngLat.lng,
        densityPerHa: toCount(props[ATLAS_FIELDS.personas_por_hectarea]),
        population: toCount(props[ATLAS_FIELDS.personas]),
        internetPct: toPercent(props[ATLAS_FIELDS.tics_internet]),
        waterPct: toPercent(props[ATLAS_FIELDS.agua_caneria]),
        educationPct: toPercent(props[ATLAS_FIELDS.educacion_superior]),
      });

      const source = map.getSource(SELECTED_SOURCE) as maplibregl.GeoJSONSource | undefined;
      source?.setData({
        type: 'FeatureCollection',
        features: [{ type: 'Feature', properties: {}, geometry: feature.geometry }],
      });
    });

    map.on('mouseenter', FILL_LAYER, () => {
      map.getCanvas().style.cursor = 'pointer';
    });
    map.on('mouseleave', FILL_LAYER, () => {
      map.getCanvas().style.cursor = '';
    });

    mapRef.current = map;

    return () => {
      maplibregl.removeProtocol('pmtiles');
      map.remove();
      mapRef.current = null;
    };
    // Intentionally mount-only: `activeScope` seeds the initial camera and is
    // then owned by the camera effect below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Publish the imperative surface the copilot and geolocation flow drive.
  useEffect(() => {
    if (!styleReady) return;

    return registerMapController({
      flyTo: (lat, lng, zoom) => {
        mapRef.current?.flyTo({
          center: [lng, lat],
          zoom: zoom ?? Math.max(mapRef.current.getZoom(), BLOCK_ENTRY_ZOOM),
          duration: 1600,
        });
      },
      getCenter: () => {
        const c = mapRef.current?.getCenter();
        return { lat: c?.lat ?? 0, lng: c?.lng ?? 0 };
      },
      getZoom: () => mapRef.current?.getZoom() ?? 0,
      getRenderedBlockCount: () =>
        mapRef.current?.queryRenderedFeatures({ layers: [FILL_LAYER] }).length ?? 0,
      getVisibleStats: (): VisibleStats | null => {
        const map = mapRef.current;
        if (!map) return null;

        const { field, unitScale } = LAYER_PAINT[layerRef.current];
        const values = map
          .queryRenderedFeatures({ layers: [FILL_LAYER] })
          .map((f) => f.properties?.[field])
          .filter((v): v is number => typeof v === 'number')
          .map((v) => v * unitScale)
          .sort((a, b) => a - b);

        if (values.length === 0) return null;
        return {
          count: values.length,
          median: Math.round(percentile(values, 0.5)),
          p90: Math.round(percentile(values, 0.9)),
          max: Math.round(values[values.length - 1]),
          field,
        };
      },
    });
  }, [styleReady, registerMapController]);

  // Move the camera when the scope changes.
  useEffect(() => {
    if (!mapRef.current) return;
    const config = SCOPE_CONFIG[activeScope];
    mapRef.current.flyTo({ center: config.centerLngLat, zoom: config.zoom, duration: 1200 });
  }, [activeScope]);

  // Repaint the fill ramp whenever the layer or threshold changes — and once
  // the style is ready, so a change made during the initial load is not
  // silently dropped.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !styleReady) return;

    const { field, stops, unitScale } = LAYER_PAINT[activeLayer];
    map.setPaintProperty(FILL_LAYER, 'fill-color', [
      'interpolate',
      ['linear'],
      ['coalesce', ['get', field], 0],
      ...stops,
    ]);

    if (threshold) {
      // Dim rather than hide: keeping non-matching blocks faintly visible
      // preserves the street grid, so a filtered view still reads as a city.
      const min = threshold.min / unitScale;
      const max = threshold.max === null ? Number.MAX_SAFE_INTEGER : threshold.max / unitScale;
      map.setPaintProperty(FILL_LAYER, 'fill-opacity', [
        'case',
        ['all', ['>=', ['coalesce', ['get', field], -1], min], ['<=', ['coalesce', ['get', field], -1], max]],
        0.9,
        0.07,
      ]);
    } else {
      map.setPaintProperty(FILL_LAYER, 'fill-opacity', 0.85);
    }
  }, [activeLayer, threshold, styleReady]);

  // Clearing the selection from elsewhere (scope change, copilot) must also
  // clear the highlight geometry.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !styleReady || selectedBlock) return;
    const source = map.getSource(SELECTED_SOURCE) as maplibregl.GeoJSONSource | undefined;
    source?.setData(EMPTY_COLLECTION);
  }, [selectedBlock, styleReady]);

  const handleZoomToBlocks = useCallback(() => {
    const map = mapRef.current;
    if (!map) return;
    const target = activeScope === 'Nacional' ? SCOPE_CONFIG['Santa Cruz'] : SCOPE_CONFIG[activeScope];
    map.flyTo({
      center: target.centerLngLat,
      zoom: Math.max(target.zoom, BLOCK_ENTRY_ZOOM),
      duration: 1400,
    });
    if (activeScope === 'Nacional') setActiveScope('Santa Cruz');
  }, [activeScope, setActiveScope]);

  const handleCenterOnUser = useCallback(() => {
    if (!userLocation) return;
    mapRef.current?.flyTo({
      center: [userLocation.lng, userLocation.lat],
      zoom: 14,
      duration: 1600,
    });
  }, [userLocation]);

  const activeLayerMeta = useMemo(() => {
    for (const group of CENSUS_LAYER_GROUPS) {
      const found = group.layers.find((l) => l.code === activeLayer);
      if (found) return found;
    }
    return CENSUS_LAYER_GROUPS[0].layers[0];
  }, [activeLayer]);

  const thresholdLabel = threshold
    ? `${threshold.min}${threshold.max !== null ? `–${threshold.max}` : '+'} ${LAYER_PAINT[activeLayer].unitLabel}`
    : null;

  // In focused mode the chat is the primary control surface and vertical space
  // is scarce, so the controls collapse to a single scrollable row — otherwise
  // the full panel eats most of the mobile half and leaves a sliver of map.
  if (isFocused) {
    return (
      <div className="flex h-full flex-col font-sans">
        <div className="flex shrink-0 items-center gap-2 overflow-x-auto border-b border-slate-800 bg-slate-900 px-3 py-2">
          {(['Nacional', 'Santa Cruz', 'Cochabamba', 'La Paz'] as ScopeType[]).map((scope) => (
            <button
              key={scope}
              type="button"
              aria-pressed={activeScope === scope}
              onClick={() => {
                setActiveScope(scope);
                setSelectedBlock(null);
              }}
              className={`min-h-[36px] shrink-0 rounded-lg px-2.5 py-1.5 font-mono-tech text-[11px] font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 ${
                activeScope === scope
                  ? 'bg-teal-500 text-slate-950'
                  : 'border border-slate-800 bg-slate-950/80 text-slate-300 hover:bg-slate-800'
              }`}
            >
              {scope === 'Nacional' ? t('flagship.scopeNacional').split(' ')[1] ?? 'Nacional' : scope}
            </button>
          ))}

          <select
            value={activeLayer}
            onChange={(e) => setActiveLayer(e.target.value as LayerCode)}
            aria-label={t('flagship.layerLabel')}
            className="ml-auto min-h-[36px] shrink-0 rounded-lg border border-slate-800 bg-slate-950 px-2 py-1 font-mono-tech text-[11px] text-slate-200 focus:border-teal-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-400"
          >
            {CENSUS_LAYER_GROUPS.map((group) => (
              <optgroup key={group.code} label={language === 'es' ? group.labelEs : group.labelEn}>
                {group.layers.map((layer) => (
                  <option key={layer.code} value={layer.code}>
                    {language === 'es' ? layer.labelEs : layer.labelEn} ({layer.unitLabel})
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>

        <div className="relative min-h-0 flex-1">
          <div ref={mapContainerRef} className="h-full w-full bg-slate-950" />

          {thresholdLabel && (
            <div className="absolute left-3 top-3 z-10 flex items-center gap-2 rounded-lg border border-teal-500/40 bg-slate-900/90 px-2.5 py-1.5 font-mono-tech text-[10px] text-teal-200 backdrop-blur-md">
              <SlidersHorizontal className="h-3 w-3 shrink-0" />
              <span>{thresholdLabel}</span>
              <button
                type="button"
                onClick={() => setThreshold(null)}
                aria-label={t('flagship.thresholdClear')}
                className="rounded p-0.5 hover:bg-teal-500/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          )}

          {belowDataZoom && (
            <div className="absolute inset-x-3 bottom-3 z-10 space-y-1.5 rounded-lg border border-amber-500/50 bg-slate-900/95 p-2.5 font-mono-tech text-[10px] shadow-2xl backdrop-blur-md">
              <div className="font-bold uppercase text-amber-300">{t('flagship.zoomNoticeTitle')}</div>
              <button
                type="button"
                onClick={handleZoomToBlocks}
                className="flex min-h-[36px] items-center gap-1.5 rounded border border-amber-500/50 bg-amber-500/20 px-2.5 py-1.5 font-bold text-amber-200 hover:bg-amber-500/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
              >
                <ZoomIn className="h-3 w-3 shrink-0" />
                {t('flagship.zoomNoticeAction')}
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 font-sans">
      {/* Scope + layer controls */}
      <div className="space-y-3 rounded-t-xl border border-slate-800 bg-slate-900 p-3">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2.5">
          <div className="flex items-center space-x-2 min-w-0">
            <Layers className="w-4 h-4 text-teal-400 shrink-0" />
            <span className="text-xs font-mono-tech text-slate-300 font-bold uppercase truncate">
              {t('flagship.scopeSelectorLabel')}
            </span>
          </div>

          {userLocation && (
            <button
              type="button"
              onClick={handleCenterOnUser}
              className="flex items-center gap-1.5 px-2.5 py-1.5 min-h-[36px] rounded-lg bg-slate-950/80 border border-teal-500/40 text-teal-300 hover:bg-slate-800 text-[11px] font-mono-tech transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400"
            >
              <Crosshair className="w-3.5 h-3.5 shrink-0" />
              <span>{t('flagship.centerOnMe')}</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2" role="group" aria-label={t('flagship.scopeSelectorLabel')}>
          {(['Nacional', 'Santa Cruz', 'Cochabamba', 'La Paz'] as ScopeType[]).map((scope) => (
            <button
              key={scope}
              type="button"
              aria-pressed={activeScope === scope}
              onClick={() => {
                setActiveScope(scope);
                setSelectedBlock(null);
              }}
              className={`min-h-[44px] py-2 px-3 rounded-lg text-xs font-mono-tech font-bold transition-all text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 ${
                activeScope === scope
                  ? 'bg-teal-500 text-slate-950 shadow-lg shadow-teal-500/20'
                  : 'bg-slate-950/80 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-800'
              }`}
            >
              {scope === 'Nacional'
                ? t('flagship.scopeNacional')
                : scope === 'Santa Cruz'
                ? t('flagship.scopeSantaCruz')
                : scope === 'Cochabamba'
                ? t('flagship.scopeCochabamba')
                : t('flagship.scopeLaPaz')}
            </button>
          ))}
        </div>

        {/* Categorized census layer selector */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <label
            htmlFor="census-layer-select"
            className="text-[10px] font-mono-tech text-slate-400 uppercase"
          >
            {t('flagship.layerLabel')}
          </label>
          <select
            id="census-layer-select"
            value={activeLayer}
            onChange={(e) => setActiveLayer(e.target.value as LayerCode)}
            className="flex-1 min-w-[200px] min-h-[44px] px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 text-xs font-mono-tech focus:outline-none focus:border-teal-500 focus-visible:ring-2 focus-visible:ring-teal-400"
          >
            {CENSUS_LAYER_GROUPS.map((group) => (
              <optgroup key={group.code} label={language === 'es' ? group.labelEs : group.labelEn}>
                {group.layers.map((layer) => (
                  <option key={layer.code} value={layer.code}>
                    {language === 'es' ? layer.labelEs : layer.labelEn} ({layer.unitLabel})
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>

        {thresholdLabel && (
          <div className="flex items-center justify-between gap-2 px-3 py-2 rounded-lg bg-teal-500/10 border border-teal-500/40 text-[11px] font-mono-tech text-teal-200">
            <span className="flex items-center gap-1.5 min-w-0">
              <SlidersHorizontal className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">
                {t('flagship.thresholdActive')} {thresholdLabel}
              </span>
            </span>
            <button
              type="button"
              onClick={() => setThreshold(null)}
              aria-label={t('flagship.thresholdClear')}
              className="p-1.5 min-h-[32px] min-w-[32px] flex items-center justify-center rounded hover:bg-teal-500/20 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Map canvas */}
      <div className="relative h-[460px] w-full overflow-hidden rounded-b-xl border border-slate-800 shadow-2xl sm:h-[520px]">
        <div ref={mapContainerRef} className="h-full w-full bg-slate-950" />

        {/* Legend */}
        <div className="absolute top-3 left-3 z-10 hidden sm:block bg-slate-900/90 backdrop-blur-md p-2 rounded-lg border border-slate-800 font-mono-tech text-[10px] space-y-1 shadow-xl max-w-xs">
          <div className="text-teal-400 font-bold tracking-wider uppercase">
            {language === 'es' ? activeLayerMeta.labelEs : activeLayerMeta.labelEn}
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-slate-400">{t('flagship.legendLow')}</span>
            <div
              className="h-2 w-20 rounded"
              style={{ background: `linear-gradient(to right, #0f172a, ${activeLayerMeta.primaryColor})` }}
            />
            <span className="text-slate-200 font-bold">{t('flagship.legendHigh')}</span>
          </div>
          <div className="text-slate-500">{activeLayerMeta.unitLabel}</div>
        </div>

        {/* Honest empty state: the archive has no geometry below zoom 8. */}
        {belowDataZoom && (
          <div className="absolute inset-x-3 bottom-3 sm:inset-x-auto sm:left-3 sm:max-w-sm z-10 p-3 rounded-lg bg-slate-900/95 backdrop-blur-md border border-amber-500/50 font-mono-tech text-[11px] space-y-2 shadow-2xl">
            <div className="text-amber-300 font-bold uppercase tracking-wide">
              {t('flagship.zoomNoticeTitle')}
            </div>
            <p className="text-slate-300 leading-relaxed font-sans text-xs">
              {t('flagship.zoomNoticeBody')}
            </p>
            <button
              type="button"
              onClick={handleZoomToBlocks}
              className="flex items-center gap-1.5 px-3 py-2 min-h-[40px] rounded bg-amber-500/20 border border-amber-500/50 text-amber-200 hover:bg-amber-500/30 transition-colors font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
            >
              <ZoomIn className="w-3.5 h-3.5 shrink-0" />
              <span>{t('flagship.zoomNoticeAction')}</span>
            </button>
          </div>
        )}
      </div>

      {/* Block inspector */}
      {selectedBlock && (
        <div className="p-3.5 rounded-xl bg-slate-900 border border-teal-500/50 font-mono-tech text-xs text-slate-200 space-y-2.5 shadow-xl">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <span className="text-teal-400 font-bold block uppercase">
                {t('flagship.blockInspectorTitle')}
              </span>
              <span className="text-slate-400 text-[10px]">
                {t('flagship.blockInspectorSubtitle')} · {selectedBlock.lngLat}
              </span>
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px]">
              <div>
                {t('flagship.blockPopulationLabel')}:{' '}
                <strong className="text-slate-100">
                  {selectedBlock.population !== null ? `${selectedBlock.population} hab.` : '—'}
                </strong>
              </div>
              <div>
                {t('flagship.blockDensityLabel')}:{' '}
                <strong className="text-emerald-400">
                  {selectedBlock.densityPerHa !== null ? `${selectedBlock.densityPerHa} hab/ha` : '—'}
                </strong>
              </div>
              <div>
                {t('flagship.blockInternetLabel')}:{' '}
                <strong className="text-cyan-300">
                  {selectedBlock.internetPct !== null ? `${selectedBlock.internetPct}%` : '—'}
                </strong>
              </div>
              <div>
                {t('flagship.blockWaterLabel')}:{' '}
                <strong className="text-amber-400">
                  {selectedBlock.waterPct !== null ? `${selectedBlock.waterPct}%` : '—'}
                </strong>
              </div>
              <div>
                {t('flagship.blockEducationLabel')}:{' '}
                <strong className="text-teal-300">
                  {selectedBlock.educationPct !== null ? `${selectedBlock.educationPct}%` : '—'}
                </strong>
              </div>
            </div>
          </div>
          <p className="text-[10px] text-slate-500 leading-relaxed font-sans border-t border-slate-800 pt-2">
            {t('flagship.blockIndexNote')}
          </p>
        </div>
      )}
    </div>
  );
}
