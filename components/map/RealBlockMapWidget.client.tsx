'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import * as maplibregl from 'maplibre-gl';
import * as pmtiles from 'pmtiles';
import 'maplibre-gl/dist/maplibre-gl.css';
import {
  CENSUS_LAYERS,
  SCOPE_CONFIG,
  ScopeType,
  LayerCode,
} from '@/data/mauForondaCensusData';
import { useLanguage } from '@/context/LanguageContext';
import { Sparkles, Layers, ExternalLink, Info, ZoomIn } from 'lucide-react';

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

/** Resolves once the worker has the pmtiles protocol; awaited before map creation. */
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

/**
 * Fill ramp per layer. Stops are expressed in each field's own units, so the
 * absolute-count layers ramp over realistic urban values rather than 0–1 (which
 * would saturate every block at the top colour). The archive's maxima are
 * extreme outliers, so the ramps top out at a readable urban range instead.
 */
const LAYER_PAINT: Record<LayerCode, { field: string; stops: (number | string)[] }> = {
  TECH_CONN: {
    field: ATLAS_FIELDS.tics_internet, // 0–1
    stops: [0.0, '#0f172a', 0.2, '#155e75', 0.4, '#0e7490', 0.65, '#06b6d4', 0.9, '#22d3ee'],
  },
  DENSITY: {
    field: ATLAS_FIELDS.personas_por_hectarea, // inhabitants per hectare
    stops: [0, '#0f172a', 50, '#047857', 120, '#059669', 250, '#10b981', 450, '#34d399'],
  },
  HOUSING_SERVICES: {
    field: ATLAS_FIELDS.agua_caneria, // 0–1
    stops: [0.0, '#0f172a', 0.25, '#b45309', 0.5, '#d97706', 0.75, '#f59e0b', 0.95, '#fbbf24'],
  },
  ECONOMIC_HUBS: {
    field: ATLAS_FIELDS.personas, // inhabitants per block
    stops: [0, '#0f172a', 80, '#0d9488', 200, '#14b8a6', 400, '#2dd4bf', 800, '#5eead4'],
  },
};

/** Rounds an absolute count-style attribute, or null when the block lacks it. */
function toCount(value: unknown): number | null {
  return typeof value === 'number' ? Math.round(value) : null;
}

/** Converts a 0–1 proportion to whole percent, or null when the block lacks it. */
function toPercent(value: unknown): number | null {
  return typeof value === 'number' ? Math.round(value * 100) : null;
}

interface SelectedBlock {
  lngLat: string;
  /** Inhabitants per hectare, straight from the archive. */
  densityPerHa: number | null;
  /** Inhabitants in this block. */
  population: number | null;
  internetPct: number | null;
  waterPct: number | null;
  educationPct: number | null;
}

interface RealBlockMapWidgetProps {
  activeScope: ScopeType;
  onScopeChange: (scope: ScopeType) => void;
  activeLayer: LayerCode;
  onLayerChange: (layer: LayerCode) => void;
}

export default function RealBlockMapWidgetClient({
  activeScope,
  onScopeChange,
  activeLayer,
  onLayerChange,
}: RealBlockMapWidgetProps) {
  const { t, language } = useLanguage();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);

  const [styleReady, setStyleReady] = useState(false);
  const [belowDataZoom, setBelowDataZoom] = useState(SCOPE_CONFIG[activeScope].zoom < BLOCK_MIN_ZOOM);
  const [selectedBlock, setSelectedBlock] = useState<SelectedBlock | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

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
            attribution: '&copy; <a href="https://carto.com/attributions">CARTO</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          },
          'atlas-pmtiles': {
            type: 'vector',
            url: `pmtiles://${PMTILES_URL}`,
            attribution: 'Manzanos Censo 2024 INE &mdash; <a href="https://github.com/mauforonda/atlasurbano" target="_blank" rel="noreferrer">@mauforonda / atlasurbano</a>',
          },
        },
        layers: [
          {
            id: 'carto-dark-bg',
            type: 'raster',
            source: 'carto-dark',
            minzoom: 0,
            maxzoom: 20,
          },
          {
            id: 'ine-manzanos-fill',
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
            id: 'ine-manzanos-stroke',
            type: 'line',
            source: 'atlas-pmtiles',
            'source-layer': 'manzanos',
            paint: {
              'line-color': '#020617',
              'line-width': 0.7,
              'line-opacity': 0.7,
            },
          },
        ],
      },
      center: initialScope.centerLngLat,
      zoom: initialScope.zoom,
      attributionControl: false,
    });

    // The worker exists by the time the map is constructed, so this is where the
    // worker-side protocol gets installed. It resolves well before the first
    // tile request; if it ever failed, the block layer would stay empty and the
    // error surfaces in the console rather than silently.
    void ensureWorkerProtocol();

    map.on('load', () => {
      map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right');
      map.addControl(new maplibregl.AttributionControl({ compact: true }), 'bottom-right');
      setStyleReady(true);
    });

    // The block layer only exists from BLOCK_MIN_ZOOM; surface that to the user.
    const syncZoomState = () => setBelowDataZoom(map.getZoom() < BLOCK_MIN_ZOOM);
    map.on('zoomend', syncZoomState);
    map.on('moveend', syncZoomState);

    map.on('click', 'ine-manzanos-fill', (e) => {
      const feature = e.features?.[0];
      if (!feature) return;
      const props = feature.properties ?? {};

      setSelectedBlock({
        lngLat: `${e.lngLat.lat.toFixed(5)}, ${e.lngLat.lng.toFixed(5)}`,
        densityPerHa: toCount(props[ATLAS_FIELDS.personas_por_hectarea]),
        population: toCount(props[ATLAS_FIELDS.personas]),
        internetPct: toPercent(props[ATLAS_FIELDS.tics_internet]),
        waterPct: toPercent(props[ATLAS_FIELDS.agua_caneria]),
        educationPct: toPercent(props[ATLAS_FIELDS.educacion_superior]),
      });
    });

    map.on('mouseenter', 'ine-manzanos-fill', () => {
      map.getCanvas().style.cursor = 'pointer';
    });

    map.on('mouseleave', 'ine-manzanos-fill', () => {
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

  // Move the camera when the scope changes.
  useEffect(() => {
    if (!mapRef.current) return;
    const config = SCOPE_CONFIG[activeScope];
    mapRef.current.flyTo({
      center: config.centerLngLat,
      zoom: config.zoom,
      duration: 1200,
    });
  }, [activeScope]);

  // Repaint the fill ramp whenever the layer changes — and once the style is
  // ready, so a pill clicked during the initial load is not silently dropped.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !styleReady) return;

    const { field, stops } = LAYER_PAINT[activeLayer];
    map.setPaintProperty('ine-manzanos-fill', 'fill-color', [
      'interpolate',
      ['linear'],
      ['coalesce', ['get', field], 0],
      ...stops,
    ]);
  }, [activeLayer, styleReady]);

  const handleZoomToBlocks = useCallback(() => {
    const map = mapRef.current;
    if (!map) return;
    const target = activeScope === 'Nacional' ? SCOPE_CONFIG['Santa Cruz'] : SCOPE_CONFIG[activeScope];
    map.flyTo({
      center: target.centerLngLat,
      zoom: Math.max(target.zoom, BLOCK_ENTRY_ZOOM),
      duration: 1400,
    });
    if (activeScope === 'Nacional') onScopeChange('Santa Cruz');
  }, [activeScope, onScopeChange]);

  const handleRunAiAnalysis = async () => {
    setAiLoading(true);
    try {
      const res = await fetch('/api/gemini-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          metroArea: activeScope,
          blockData: selectedBlock,
          activeLayer,
          language,
        }),
      });
      const data = await res.json();
      setAiAnalysis(data.reply ?? 'AI Spatial Assistant proxy returned no content.');
    } catch {
      setAiAnalysis('AI Spatial Assistant proxy temporarily unavailable.');
    } finally {
      setAiLoading(false);
    }
  };

  const activeLayerColor =
    CENSUS_LAYERS.find((l) => l.code === activeLayer)?.primaryColor || '#14b8a6';

  return (
    <div className="space-y-4 font-sans">
      {/* Scope selector */}
      <div className="p-3 bg-slate-900 border border-slate-800 rounded-t-xl space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2.5">
          <div className="flex items-center space-x-2 min-w-0">
            <Layers className="w-4 h-4 text-teal-400 shrink-0" />
            <span className="text-xs font-mono-tech text-slate-300 font-bold uppercase truncate">
              {t('flagship.scopeSelectorLabel')}
            </span>
          </div>

          <a
            href="https://mauforonda.github.io/atlasurbano/"
            target="_blank"
            rel="noreferrer"
            className="text-[11px] font-mono-tech text-teal-300 hover:text-teal-200 hidden sm:flex items-center gap-1 transition-colors rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
          >
            <Info className="w-3.5 h-3.5 text-teal-400 shrink-0" />
            <span>{t('flagship.atlasLinkLabel')}</span>
            <ExternalLink className="w-3 h-3 text-slate-400 shrink-0" />
          </a>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2" role="group" aria-label={t('flagship.scopeSelectorLabel')}>
          {(['Nacional', 'Santa Cruz', 'Cochabamba', 'La Paz'] as ScopeType[]).map((scope) => (
            <button
              key={scope}
              type="button"
              aria-pressed={activeScope === scope}
              onClick={() => {
                onScopeChange(scope);
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

        {/* Census layer pills */}
        <div className="pt-1 flex flex-wrap items-center gap-1.5" role="group" aria-label={t('flagship.layerLabel')}>
          <span className="text-[10px] font-mono-tech text-slate-400 uppercase mr-1">
            {t('flagship.layerLabel')}
          </span>
          {CENSUS_LAYERS.map((layer) => (
            <button
              key={layer.code}
              type="button"
              aria-pressed={activeLayer === layer.code}
              onClick={() => onLayerChange(layer.code)}
              className={`min-h-[44px] px-3 py-2 rounded text-[11px] font-mono-tech transition-all flex items-center space-x-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 ${
                activeLayer === layer.code
                  ? 'bg-slate-800 text-teal-300 border border-teal-500/50 shadow'
                  : 'bg-slate-950/60 text-slate-400 hover:text-slate-200 border border-slate-800/60'
              }`}
            >
              <span
                className="w-2 h-2 rounded-full inline-block shrink-0"
                style={{ backgroundColor: layer.primaryColor }}
              />
              <span>{language === 'es' ? layer.labelEs : layer.labelEn}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Map canvas */}
      <div className="relative h-[460px] sm:h-[520px] w-full overflow-hidden border border-slate-800 shadow-2xl rounded-b-xl">
        <div ref={mapContainerRef} className="h-full w-full bg-slate-950" />

        <div className="absolute top-3 right-3 z-10 flex items-center space-x-2">
          <button
            type="button"
            onClick={handleRunAiAnalysis}
            disabled={aiLoading}
            className="flex items-center space-x-1.5 px-3 py-2.5 min-h-[44px] rounded-lg bg-teal-500 hover:bg-teal-400 text-slate-950 font-mono-tech font-bold text-xs shadow-xl transition-all disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
          >
            <Sparkles className="w-3.5 h-3.5 shrink-0" />
            <span>{aiLoading ? t('flagship.aiLoading') : t('flagship.runAi')}</span>
          </button>
        </div>

        {/* Legend */}
        <div className="absolute top-3 left-3 z-10 hidden sm:block bg-slate-900/90 backdrop-blur-md p-2 rounded-lg border border-slate-800 font-mono-tech text-[10px] space-y-1 shadow-xl max-w-xs">
          <div className="text-teal-400 font-bold tracking-wider uppercase">
            {t('flagship.legendLayerTitle')}
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-slate-400">{t('flagship.legendLow')}</span>
            <div
              className="h-2 w-20 rounded"
              style={{ background: `linear-gradient(to right, #0f172a, ${activeLayerColor})` }}
            />
            <span className="text-slate-200 font-bold">{t('flagship.legendHigh')}</span>
          </div>
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

      {/* AI narrative */}
      {aiAnalysis && (
        <div className="p-4 rounded-xl bg-slate-900 border border-teal-500/40 font-mono-tech text-xs text-slate-200 space-y-2 shadow-xl">
          <div className="flex items-center justify-between text-teal-400 font-bold border-b border-slate-800 pb-2 gap-2">
            <div className="flex items-center space-x-2 min-w-0">
              <Sparkles className="w-4 h-4 text-teal-400 shrink-0" />
              <span className="truncate">{t('flagship.aiHeaderTitle')}</span>
            </div>
            <span className="text-[10px] text-slate-400 font-normal shrink-0">GEMINI REST PROXY</span>
          </div>
          <p className="whitespace-pre-line leading-relaxed text-slate-300">{aiAnalysis}</p>
          {!selectedBlock && (
            <p className="text-[10px] text-slate-500 font-sans">{t('flagship.aiNoBlockSelected')}</p>
          )}
        </div>
      )}
    </div>
  );
}
