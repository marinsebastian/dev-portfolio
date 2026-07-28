'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useReducedMotion } from 'framer-motion';
import * as maplibregl from 'maplibre-gl';
import * as pmtiles from 'pmtiles';
import 'maplibre-gl/dist/maplibre-gl.css';
import { CENSUS_LAYER_GROUPS, SCOPE_CONFIG, ScopeType, LayerCode } from '@/data/mauForondaCensusData';
import { useLanguage } from '@/context/LanguageContext';
import { useGeoConsole, type VisibleStats, type SelectedBlock } from '@/context/GeoConsoleContext';
import { scopeForDepartment } from '@/lib/geolocation';
import { Layers, ZoomIn, Crosshair, SlidersHorizontal, Info } from 'lucide-react';
import { XIcon } from '@animateicons/react/lucide';
import { useIconAnimator } from '@/lib/useIconAnimator';
import Tippy from '@tippyjs/react';

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

/** The three metro areas the census archive has block-level coverage for. */
const METRO_SCOPES: Exclude<ScopeType, 'Nacional'>[] = ['Santa Cruz', 'Cochabamba', 'La Paz'];

/**
 * Bolivia's remaining six departments — listed under the "Bolivia" scope so
 * the selector is honest about the archive's actual coverage instead of
 * silently pretending the country stops at three metro areas. Disabled: no
 * block-level data exists for them yet.
 */
const OTHER_DEPARTMENTS = ['Oruro', 'Potosí', 'Chuquisaca', 'Tarija', 'Beni', 'Pando'];

const FILL_LAYER = 'ine-manzanos-fill';
const STROKE_LAYER = 'ine-manzanos-stroke';
const SELECTED_SOURCE = 'selected-block';
const SELECTED_LAYER = 'selected-block-glow';
const SELECTED_LAYER_HALO = 'selected-block-halo';

/** Fill-opacity applied to every block once one is selected — a small, even
 * dim across the whole layer (there is no per-feature id to exclude just the
 * selected one from), so the gradient-stroked block reads as the one thing
 * still at full strength. */
const DIMMED_FILL_OPACITY = 0.6;
const DIMMED_THRESHOLD_MATCH_OPACITY = 0.75;

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
  agua_caneria: 'y1', // Piped water coverage — proportion, 0 … 1 (x1/y1/z1 core indicators)
  alcantarillado: 'z1', // Sewage / Basic Services coverage — proportion, 0 … 1
  tics_internet: 'x1', // Internet / ICT coverage — proportion, 0 … 1
  telefonia_fija: 'v1', // Fixed landline telephone coverage — proportion, 0 … 1
  seguro_privado: 'i1', // Private health insurance coverage — proportion, 0 … 1
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
  HEALTH_INSURANCE: {
    field: ATLAS_FIELDS.seguro_privado,
    stops: [0.0, '#0f172a', 0.05, '#0369a1', 0.15, '#0284c7', 0.35, '#38bdf8', 0.6, '#7dd3fc'],
    unitScale: 100,
    unitLabel: '%',
  },
  TECH_CONN: {
    field: ATLAS_FIELDS.tics_internet,
    stops: [0.0, '#0f172a', 0.2, '#155e75', 0.4, '#0e7490', 0.65, '#06b6d4', 0.9, '#22d3ee'],
    unitScale: 100,
    unitLabel: '%',
  },
  LANDLINE_PHONE: {
    field: ATLAS_FIELDS.telefonia_fija,
    stops: [0.0, '#0f172a', 0.05, '#4c1d95', 0.15, '#6d28d9', 0.3, '#8b5cf6', 0.5, '#a78bfa'],
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

/**
 * The selected-block inspector, as a map tooltip anchored to the block's own
 * screen position rather than a panel below the fold — the only way a mobile
 * visitor in Focused Mode (map on top, half the viewport) ever saw this data
 * before was by scrolling to a panel that did not exist in that layout at all.
 */
function SelectedBlockTooltip({
  anchorRef,
  position,
  block,
  t,
  onClose,
}: {
  anchorRef: React.RefObject<HTMLDivElement | null>;
  position: { x: number; y: number } | null;
  block: SelectedBlock | null;
  t: (key: string) => string;
  onClose: () => void;
}) {
  const prefersReducedMotion = useReducedMotion();
  const { ref: closeIconRef, handlers: closeIconHandlers } = useIconAnimator(prefersReducedMotion ?? false);

  return (
    <>
      <div
        ref={anchorRef}
        aria-hidden="true"
        className="pointer-events-none absolute h-px w-px"
        style={{ left: position?.x ?? -9999, top: position?.y ?? -9999 }}
      />
      <Tippy
        // @tippyjs/react's `reference` type predates React 19's nullable
        // `RefObject`; the runtime accepts it fine — this only reconciles types.
        reference={anchorRef as React.RefObject<Element>}
        visible={Boolean(block && position)}
        interactive
        placement="top"
        offset={[0, 14]}
        appendTo={() => document.body}
        render={(attrs) =>
          block ? (
            <div
              {...attrs}
              className="z-[2100] w-64 space-y-2 rounded-xl border border-teal-500/50 bg-slate-900/95 p-3 font-mono-tech text-xs text-slate-200 shadow-2xl backdrop-blur-md"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="truncate font-bold uppercase text-teal-400">
                    {t('flagship.blockInspectorTitle')}
                  </div>
                  <div className="truncate text-[10px] text-slate-400">
                    {t('flagship.blockInspectorSubtitle')}
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  {/* The provenance disclaimer used to sit below as its own
                      paragraph, taking up half the tooltip's height for text
                      most visitors don't need on every single click — now
                      it's a click/hover-away instead of always-on. */}
                  <Tippy content={t('flagship.blockIndexNote')} interactive placement="left" maxWidth={200}>
                    <button
                      type="button"
                      aria-label={t('flagship.blockInfoLabel')}
                      className="flex h-6 w-6 items-center justify-center rounded text-slate-500 hover:bg-teal-500/20 hover:text-teal-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400"
                    >
                      <Info size={13} />
                    </button>
                  </Tippy>
                  <button
                    type="button"
                    onClick={onClose}
                    aria-label={t('flagship.blockClose')}
                    {...closeIconHandlers}
                    className="flex h-6 w-6 items-center justify-center rounded hover:bg-teal-500/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400"
                  >
                    <XIcon ref={closeIconRef} size={12} />
                  </button>
                </div>
              </div>

              <div className="space-y-1 text-[11px]">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-slate-400">{t('flagship.blockPopulationLabel')}</span>
                  <strong className="text-slate-100">
                    {block.population !== null ? `${block.population} hab.` : '—'}
                  </strong>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-slate-400">{t('flagship.blockDensityLabel')}</span>
                  <strong className="text-emerald-400">
                    {block.densityPerHa !== null ? `${block.densityPerHa} hab/ha` : '—'}
                  </strong>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-slate-400">{t('flagship.blockInternetLabel')}</span>
                  <strong className="text-cyan-300">
                    {block.internetPct !== null ? `${block.internetPct}%` : '—'}
                  </strong>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-slate-400">{t('flagship.blockHealthInsuranceLabel')}</span>
                  <strong className="text-sky-300">
                    {block.healthInsurancePct !== null ? `${block.healthInsurancePct}%` : '—'}
                  </strong>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-slate-400">{t('flagship.blockEducationLabel')}</span>
                  <strong className="text-teal-300">
                    {block.educationPct !== null ? `${block.educationPct}%` : '—'}
                  </strong>
                </div>
              </div>
            </div>
          ) : (
            <></>
          )
        }
      />
    </>
  );
}

/**
 * Floating "locate me" control, positioned to sit just above MapLibre's own
 * native zoom buttons (added at 'bottom-right') rather than buried in the
 * below-canvas panel — it acts on the same camera those buttons zoom, so it
 * reads as part of the same control cluster instead of an unrelated one.
 */
function LocateMeButton({
  visible,
  onClick,
  label,
}: {
  visible: boolean;
  onClick: () => void;
  label: string;
}) {
  if (!visible) return null;
  return (
    <div className="absolute bottom-20 right-3 z-10">
      <Tippy content={label} placement="left">
        <button
          type="button"
          onClick={onClick}
          aria-label={label}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-teal-500/40 bg-slate-900/90 text-teal-300 shadow-lg backdrop-blur-md transition-colors hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400"
        >
          <Crosshair className="h-4 w-4" />
        </button>
      </Tippy>
    </div>
  );
}

/**
 * Census layer picker, disguised as a small icon button rather than the
 * always-visible labeled `<select>` it used to be below the canvas. The real
 * `<select>` still does all the work — it's just made transparent and
 * stretched over the icon, so the control stays a native, fully accessible
 * dropdown instead of a custom-built one.
 */
function LayerSelectorButton({
  id,
  activeLayer,
  onChange,
  language,
  label,
}: {
  id?: string;
  activeLayer: LayerCode;
  onChange: (layer: LayerCode) => void;
  language: 'es' | 'en';
  label: string;
}) {
  return (
    <div className="absolute bottom-3 left-3 z-10">
      <Tippy content={label} placement="right">
        <div className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-slate-800 bg-slate-900/90 text-teal-400 shadow-lg backdrop-blur-md transition-colors hover:bg-slate-800">
          <Layers className="h-4 w-4 pointer-events-none" />
          <select
            id={id}
            value={activeLayer}
            onChange={(e) => onChange(e.target.value as LayerCode)}
            aria-label={label}
            className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
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
      </Tippy>
    </div>
  );
}

function legendValueLabel(rawStopValue: number, unitScale: number, unitLabel: string): string {
  const value = Math.round(rawStopValue * unitScale);
  return unitLabel === '%' ? `${value}%` : `${value} ${unitLabel}`;
}

/**
 * The legend used to be a generic 2-stop dark→color gradient with static
 * "Low"/"High" text for every layer, regardless of what was actually being
 * measured or what range it covered. This renders the SAME 5-stop ramp the
 * fill layer itself uses (LAYER_PAINT), with the real min/max it represents,
 * plus — when live viewport stats for this exact layer are available — the
 * actual highest value currently on screen, since a hand-tuned static ramp
 * still doesn't say what's really in view right now.
 */
function MapLegend({
  activeLayer,
  layerLabel,
  visibleStats,
  t,
}: {
  activeLayer: LayerCode;
  layerLabel: string;
  visibleStats: VisibleStats | null;
  t: (key: string) => string;
}) {
  const meta = LAYER_PAINT[activeLayer];
  const colors = meta.stops.filter((_, i) => i % 2 === 1) as string[];
  const minLabel = legendValueLabel(meta.stops[0] as number, meta.unitScale, meta.unitLabel);
  const maxLabel = legendValueLabel(meta.stops[meta.stops.length - 2] as number, meta.unitScale, meta.unitLabel);
  const liveMax =
    visibleStats && visibleStats.field === meta.field
      ? meta.unitLabel === '%'
        ? `${visibleStats.max}%`
        : `${visibleStats.max} ${meta.unitLabel}`
      : null;

  return (
    <div className="absolute top-3 left-3 z-10 block max-w-[190px] sm:max-w-xs bg-slate-900/90 backdrop-blur-md p-2 rounded-lg border border-slate-800 font-mono-tech text-[10px] space-y-1 shadow-xl">
      <div className="text-teal-400 font-bold tracking-wider uppercase truncate">{layerLabel}</div>
      <div className="flex items-center space-x-2">
        <span className="text-slate-400">{minLabel}</span>
        <div className="h-2 flex-1 min-w-[64px] rounded" style={{ background: `linear-gradient(to right, ${colors.join(', ')})` }} />
        <span className="text-slate-200 font-bold">{maxLabel}</span>
      </div>
      {liveMax && (
        <div className="text-slate-500 truncate">
          {t('flagship.legendCurrentView')} {liveMax}
        </div>
      )}
    </div>
  );
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
    focusedMode,
    setFocusedMode,
    visibleStats,
    setVisibleStats,
  } = useGeoConsole();

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);

  const [styleReady, setStyleReady] = useState(false);
  const [belowDataZoom, setBelowDataZoom] = useState(SCOPE_CONFIG[activeScope].zoom < BLOCK_MIN_ZOOM);

  const isFocused = variant === 'focused';

  const prefersReducedMotion = useReducedMotion();
  // Both branches below render at most one of these per mount (panel vs
  // focused), so the same ref/handlers pair is safe to reuse across them.
  const { ref: clearThresholdIconRef, handlers: clearThresholdIconHandlers } = useIconAnimator(
    prefersReducedMotion ?? false
  );


  // The imperative controller is registered once but reads the layer at call
  // time, so it needs a live value rather than the one captured at registration.
  const layerRef = useRef(activeLayer);
  useEffect(() => {
    layerRef.current = activeLayer;
  }, [activeLayer]);

  // Tracks which vector-tile feature currently carries `feature-state:
  // {selected: true}`, so a later click (or a clear from elsewhere) can turn
  // it back off before the next one is set — MapLibre never does this for
  // you, and leaving a stale flag on would light up two blocks at once.
  const selectedFeatureIdRef = useRef<string | number | null>(null);

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
            // Required for `line-gradient` below — it paints along the
            // line's own progress (0 → 1), not by feature property.
            lineMetrics: true,
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
            // A soft, wide, blurred halo sits under the crisp gradient line
            // (below) so the selection reads clearly even against a bright
            // fill colour, rather than just a thin outline competing with it.
            id: SELECTED_LAYER_HALO,
            type: 'line',
            source: SELECTED_SOURCE,
            paint: {
              // Teal → cyan → emerald: the same three stops as the top
              // scroll-progress bar, so the selected-block outline echoes the
              // site's own accent gradient instead of a fourth colour language.
              'line-gradient': ['interpolate', ['linear'], ['line-progress'], 0, '#14b8a6', 0.5, '#22d3ee', 1, '#14b8a6'],
              'line-width': 11,
              'line-opacity': 0.35,
              'line-blur': 3,
            },
          },
          {
            id: SELECTED_LAYER,
            type: 'line',
            source: SELECTED_SOURCE,
            paint: {
              'line-gradient': ['interpolate', ['linear'], ['line-progress'], 0, '#14b8a6', 0.5, '#22d3ee', 1, '#14b8a6'],
              'line-width': 4.5,
              'line-opacity': 1,
              'line-blur': 0.2,
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
      map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'bottom-right');
      setStyleReady(true);
    });

    // The block layer only exists from BLOCK_MIN_ZOOM; surface that to the user.
    const syncZoomState = () => {
      setBelowDataZoom(map.getZoom() < BLOCK_MIN_ZOOM);
      if (map.getZoom() >= BLOCK_MIN_ZOOM) {
        const { field, unitScale } = LAYER_PAINT[layerRef.current];
        const values = map
          .queryRenderedFeatures({ layers: [FILL_LAYER] })
          .map((f) => f.properties?.[field])
          .filter((v): v is number => typeof v === 'number')
          .map((v) => v * unitScale)
          .sort((a, b) => a - b);
        if (values.length > 0) {
          setVisibleStats({
            count: values.length,
            min: Math.round(values[0]),
            median: Math.round(percentile(values, 0.5)),
            p90: Math.round(percentile(values, 0.9)),
            max: Math.round(values[values.length - 1]),
            field,
          });
        }
      } else {
        setVisibleStats(null);
      }
    };
    map.on('zoomend', syncZoomState);
    map.on('moveend', syncZoomState);
    map.on('idle', syncZoomState);

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
        healthInsurancePct: toPercent(props[ATLAS_FIELDS.seguro_privado]),
      });

      const source = map.getSource(SELECTED_SOURCE) as maplibregl.GeoJSONSource | undefined;
      source?.setData({
        type: 'FeatureCollection',
        features: [{ type: 'Feature', properties: {}, geometry: feature.geometry }],
      });

      // Per-feature dimming (see the fill-opacity effect below) needs a
      // stable feature id, which vector-tile features carry only if the
      // tileset was built with them (tippecanoe's default). When it's
      // missing, `feature.id` is undefined, no feature ever gets flagged
      // selected, and the paint expression's `false` branch applies to
      // every block equally — the same flat dim as before, not a crash.
      if (selectedFeatureIdRef.current !== null) {
        map.setFeatureState(
          { source: 'atlas-pmtiles', sourceLayer: 'manzanos', id: selectedFeatureIdRef.current },
          { selected: false }
        );
      }
      if (feature.id !== undefined) {
        map.setFeatureState({ source: 'atlas-pmtiles', sourceLayer: 'manzanos', id: feature.id }, { selected: true });
        selectedFeatureIdRef.current = feature.id;
      } else {
        selectedFeatureIdRef.current = null;
      }
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
          min: Math.round(values[0]),
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

    // `['feature-state', 'selected']` reads back whatever the click handler
    // set via setFeatureState — true for the one feature carrying that flag,
    // false (the expression's default) for every other feature, and false for
    // ALL features on tilesets with no per-feature id (nothing was ever
    // flagged true), which collapses this to the old flat dim automatically.
    const isSelected = ['boolean', ['feature-state', 'selected'], false] as maplibregl.ExpressionSpecification;

    if (threshold) {
      // Dim rather than hide: keeping non-matching blocks faintly visible
      // preserves the street grid, so a filtered view still reads as a city.
      const min = threshold.min / unitScale;
      const max = threshold.max === null ? Number.MAX_SAFE_INTEGER : threshold.max / unitScale;
      map.setPaintProperty(FILL_LAYER, 'fill-opacity', [
        'case',
        ['all', ['>=', ['coalesce', ['get', field], -1], min], ['<=', ['coalesce', ['get', field], -1], max]],
        ['case', isSelected, 0.98, selectedBlock ? DIMMED_THRESHOLD_MATCH_OPACITY : 0.9],
        0.07,
      ]);
    } else {
      // Selecting a block dims every OTHER block instead of the whole layer
      // uniformly, so the selected one stays visually at full strength
      // alongside its gradient-stroked outline rather than dimming with
      // everything else around it.
      map.setPaintProperty(
        FILL_LAYER,
        'fill-opacity',
        selectedBlock ? ['case', isSelected, 0.98, DIMMED_FILL_OPACITY] : 0.85
      );
    }
  }, [activeLayer, threshold, styleReady, selectedBlock]);

  // Clearing the selection from elsewhere (scope change, copilot) must also
  // clear the highlight geometry and the feature-state flag driving the dim.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !styleReady || selectedBlock) return;
    const source = map.getSource(SELECTED_SOURCE) as maplibregl.GeoJSONSource | undefined;
    source?.setData(EMPTY_COLLECTION);

    if (selectedFeatureIdRef.current !== null) {
      map.setFeatureState(
        { source: 'atlas-pmtiles', sourceLayer: 'manzanos', id: selectedFeatureIdRef.current },
        { selected: false }
      );
      selectedFeatureIdRef.current = null;
    }
  }, [selectedBlock, styleReady]);

  // A slow breathing pulse on the halo (not the crisp gradient line itself,
  // which stays static and legible) — a lighter-weight nod to the glowing
  // CTA button's language than actually animating the line-gradient stops
  // every frame would be, and it skips entirely under reduced motion.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !styleReady || !selectedBlock || prefersReducedMotion) return;

    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const pulse = (Math.sin(((now - start) / 1000) * (Math.PI / 1.2)) + 1) / 2;
      map.setPaintProperty(SELECTED_LAYER_HALO, 'line-opacity', 0.25 + pulse * 0.25);
      map.setPaintProperty(SELECTED_LAYER_HALO, 'line-width', 10 + pulse * 4);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      map.setPaintProperty(SELECTED_LAYER_HALO, 'line-opacity', 0.35);
      map.setPaintProperty(SELECTED_LAYER_HALO, 'line-width', 11);
    };
  }, [selectedBlock, styleReady, prefersReducedMotion]);

  // Tracks the selected block's on-screen position so the tooltip can follow
  // it — projected fresh on every pan/zoom, not just once at selection time.
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);
  const tooltipAnchorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !styleReady || !selectedBlock) {
      setTooltipPos(null);
      return;
    }

    const updatePosition = () => {
      const point = map.project([selectedBlock.lng, selectedBlock.lat]);
      setTooltipPos({ x: point.x, y: point.y });
    };
    updatePosition();
    map.on('move', updatePosition);
    return () => {
      map.off('move', updatePosition);
    };
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

  // Puts the visitor's own detected department first in the scope row instead
  // of a fixed order, so the metro area they're actually in is the obvious
  // first choice rather than one of four equal-weight buttons.
  const orderedMetroScopes = useMemo(() => {
    const detected = scopeForDepartment(userLocation?.department ?? null);
    return detected ? [detected, ...METRO_SCOPES.filter((s) => s !== detected)] : METRO_SCOPES;
  }, [userLocation]);

  const scopeLabel = useCallback(
    (scope: Exclude<ScopeType, 'Nacional'>) =>
      scope === 'Santa Cruz'
        ? t('flagship.scopeSantaCruz')
        : scope === 'Cochabamba'
        ? t('flagship.scopeCochabamba')
        : t('flagship.scopeLaPaz'),
    [t]
  );

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
          {orderedMetroScopes.map((scope) => (
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
              {scopeLabel(scope)}
            </button>
          ))}

          <select
            aria-label={t('flagship.scopeNacional')}
            value="Nacional"
            onChange={(e) => {
              if (e.target.value === 'Nacional') {
                setActiveScope('Nacional');
                setSelectedBlock(null);
              }
            }}
            className={`min-h-[36px] shrink-0 rounded-lg px-2.5 py-1.5 font-mono-tech text-[11px] font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 ${
              activeScope === 'Nacional'
                ? 'bg-teal-500 text-slate-950'
                : 'border border-slate-800 bg-slate-950/80 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <option value="Nacional">{t('flagship.scopeNacional')}</option>
            <optgroup label={t('flagship.scopeOtherDepartments')}>
              {OTHER_DEPARTMENTS.map((dept) => (
                <option key={dept} value={dept} disabled>
                  {dept} — {t('flagship.scopeComingSoon')}
                </option>
              ))}
            </optgroup>
          </select>
        </div>

        <div className="relative min-h-0 flex-1">
          <div ref={mapContainerRef} className="h-full w-full bg-slate-950" />

          {!belowDataZoom && (
            <LayerSelectorButton
              id="census-layer-select-focused"
              activeLayer={activeLayer}
              onChange={setActiveLayer}
              language={language}
              label={t('flagship.layerLabel')}
            />
          )}

          <SelectedBlockTooltip
            anchorRef={tooltipAnchorRef}
            position={tooltipPos}
            block={selectedBlock}
            t={t}
            onClose={() => setSelectedBlock(null)}
          />

          <MapLegend
            activeLayer={activeLayer}
            layerLabel={language === 'es' ? activeLayerMeta.labelEs : activeLayerMeta.labelEn}
            visibleStats={visibleStats}
            t={t}
          />

          {thresholdLabel && (
            <div className="absolute left-3 top-20 z-10 flex items-center gap-2 rounded-lg border border-teal-500/40 bg-slate-900/90 px-2.5 py-1.5 font-mono-tech text-[10px] text-teal-200 backdrop-blur-md">
              <SlidersHorizontal className="h-3 w-3 shrink-0" />
              <span>{thresholdLabel}</span>
              <button
                type="button"
                onClick={() => setThreshold(null)}
                aria-label={t('flagship.thresholdClear')}
                {...clearThresholdIconHandlers}
                className="rounded p-0.5 hover:bg-teal-500/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400"
              >
                <XIcon ref={clearThresholdIconRef} size={12} />
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

          <LocateMeButton visible={!!userLocation} onClick={handleCenterOnUser} label={t('flagship.centerOnMe')} />
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col font-sans">
      {/* Map canvas (Top) — flex-1 so it grows or shrinks to match whatever
          height the flagship section's grid row ends up with (driven by the
          taller of the map vs. the side panels), with a floor so it never
          gets uncomfortably short. */}
      <div className="relative min-h-[420px] w-full flex-1 overflow-hidden rounded-t-xl border border-slate-800 shadow-2xl">
        <div ref={mapContainerRef} className="h-full w-full bg-slate-950" />

        <SelectedBlockTooltip
          anchorRef={tooltipAnchorRef}
          // Focused Mode covers this exact instance with its own map + its
          // own copy of this same tooltip — without this, both would render
          // at once (each projecting the shared selection through its own
          // camera), showing two competing tooltips for one selection.
          position={focusedMode ? null : tooltipPos}
          block={selectedBlock}
          t={t}
          onClose={() => setSelectedBlock(null)}
        />

        {/* Top Right Floating AI Copilot Button — expands on desktop hover to
            name the destination ("Map Copilot"), and a delayed tooltip spells
            out what clicking actually does (opens Focused Mode), since a bare
            two-letter label gives a first-time visitor nothing to go on. */}
        <div className="absolute top-3 right-3 z-10">
          <Tippy content={t('flagship.aiTriggerTooltip')} placement="bottom-end" delay={[500, 0]} offset={[0, 10]}>
            <button
              type="button"
              onClick={() => setFocusedMode(true)}
              aria-label={t('flagship.aiTriggerExpanded')}
              className="apple-intelligence-glow-btn group uppercase tracking-wider text-xs font-extrabold text-white"
            >
              <div className="inline-flex items-center justify-center shrink-0 text-teal-300">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z" opacity="1"></path>
                  <path d="M20 2v4" opacity="0.9"></path>
                  <path d="M22 4h-4" opacity="0.9"></path>
                  <circle cx="4" cy="20" r="2" opacity="1"></circle>
                </svg>
              </div>
              <span className="font-extrabold text-teal-300 group-hover:text-white transition-colors">
                {t('flagship.aiTriggerLabel')}
              </span>
              <span
                className="max-w-0 overflow-hidden whitespace-nowrap opacity-0 transition-all duration-300 ease-out group-hover:ml-1.5 group-hover:max-w-[140px] group-hover:opacity-100 motion-reduce:transition-none"
              >
                {t('flagship.aiTriggerExpanded')}
              </span>
            </button>
          </Tippy>
        </div>

        <MapLegend
          activeLayer={activeLayer}
          layerLabel={language === 'es' ? activeLayerMeta.labelEs : activeLayerMeta.labelEn}
          visibleStats={visibleStats}
          t={t}
        />

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

        {!belowDataZoom && (
          <LayerSelectorButton
            id="census-layer-select"
            activeLayer={activeLayer}
            onChange={setActiveLayer}
            language={language}
            label={t('flagship.layerLabel')}
          />
        )}

        <LocateMeButton visible={!!userLocation} onClick={handleCenterOnUser} label={t('flagship.centerOnMe')} />
      </div>

      {/* Scope + layer controls (Bottom) */}
      <div className="shrink-0 space-y-3 rounded-b-xl border border-t-0 border-slate-800 bg-slate-900 p-3">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2" role="group" aria-label={t('flagship.scopeSelectorLabel')}>
          {orderedMetroScopes.map((scope) => (
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
              {scopeLabel(scope)}
            </button>
          ))}

          {/* "Bolivia" doubles as a dropdown listing the six departments the
              archive has no block-level coverage for — disabled, so the
              selector is honest about scope instead of implying nationwide
              coverage while showing only three metro areas. */}
          <select
            aria-label={t('flagship.scopeNacional')}
            value="Nacional"
            onChange={(e) => {
              if (e.target.value === 'Nacional') {
                setActiveScope('Nacional');
                setSelectedBlock(null);
              }
            }}
            className={`min-h-[44px] py-2 px-3 rounded-lg text-xs font-mono-tech font-bold transition-all text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 ${
              activeScope === 'Nacional'
                ? 'bg-teal-500 text-slate-950 shadow-lg shadow-teal-500/20'
                : 'bg-slate-950/80 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-800'
            }`}
          >
            <option value="Nacional">{t('flagship.scopeNacional')}</option>
            <optgroup label={t('flagship.scopeOtherDepartments')}>
              {OTHER_DEPARTMENTS.map((dept) => (
                <option key={dept} value={dept} disabled>
                  {dept} — {t('flagship.scopeComingSoon')}
                </option>
              ))}
            </optgroup>
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
              {...clearThresholdIconHandlers}
              className="p-1.5 min-h-[32px] min-w-[32px] flex items-center justify-center rounded hover:bg-teal-500/20 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400"
            >
              <XIcon ref={clearThresholdIconRef} size={14} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
