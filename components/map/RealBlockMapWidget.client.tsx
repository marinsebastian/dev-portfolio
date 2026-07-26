'use client';

import { useEffect, useRef, useState } from 'react';
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
import { Sparkles, Layers, ExternalLink, Info } from 'lucide-react';

// Set MapLibre GL CSP worker URL to avoid Next.js MIME text/html worker loading issue
if (typeof window !== 'undefined') {
  (maplibregl as any).setWorkerUrl?.('https://unpkg.com/maplibre-gl@4.7.1/dist/maplibre-gl-csp-worker.js');
}

const PMTILES_URL = 'https://raw.githubusercontent.com/mauforonda/atlasurbano/pmtiles/atlas.pmtiles';

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

  const [selectedBlockData, setSelectedBlockData] = useState<any | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  // Initialize MapLibre GL Map with PMTiles vector tile source
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Register PMTiles protocol handler
    const protocol = new pmtiles.Protocol();
    maplibregl.addProtocol('pmtiles', protocol.tile);

    const initialScope = SCOPE_CONFIG[activeScope];

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: {
        version: 8,
        sources: {
          'carto-dark': {
            type: 'raster',
            tiles: ['https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'],
            tileSize: 256,
            attribution: '&copy; CARTO &copy; OpenStreetMap',
          },
          'atlas-pmtiles': {
            type: 'vector',
            url: `pmtiles://${PMTILES_URL}`,
            attribution: '&copy; Mauricio Foronda Atlas Urbano Censo 2024',
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
                ['coalesce', ['get', 'personas_por_hectarea'], ['get', 'personas'], 0],
                0, '#1e293b',
                20, '#0e7490',
                60, '#06b6d4',
                120, '#10b981',
                200, '#f59e0b',
                350, '#ef4444',
              ],
              'fill-opacity': 0.75,
            },
          },
          {
            id: 'ine-manzanos-stroke',
            type: 'line',
            source: 'atlas-pmtiles',
            'source-layer': 'manzanos',
            paint: {
              'line-color': '#0f172a',
              'line-width': 0.8,
              'line-opacity': 0.6,
            },
          },
        ],
      },
      center: initialScope.center,
      zoom: initialScope.zoom,
      attributionControl: false,
    });

    map.on('load', () => {
      map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right');
    });

    // Click handler to inspect individual INE city block properties
    map.on('click', 'ine-manzanos-fill', (e: any) => {
      if (e.features && e.features.length > 0) {
        const feat = e.features[0];
        const props = feat.properties || {};

        setSelectedBlockData({
          id: props.id || props.manzano || 'MANZANO REAL INE',
          personas: props.personas ?? props.poblacion ?? 'N/A',
          density: props.personas_por_hectarea ?? 'N/A',
          dependencia: props.dependencia_economica ?? 'N/A',
          educacion: props.educacion_superior ? `${Math.round(props.educacion_superior * 100)}%` : 'N/A',
          jovenes: props.porcentaje_menor20 ? `${Math.round(props.porcentaje_menor20 * 100)}%` : 'N/A',
        });
      }
    });

    // Cursor pointer on block hover
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
    };
  }, []);

  // Update map camera when scope changes
  useEffect(() => {
    if (!mapRef.current) return;
    const config = SCOPE_CONFIG[activeScope];
    mapRef.current.flyTo({
      center: config.center,
      zoom: config.zoom,
      duration: 1200,
    });
  }, [activeScope]);

  // Update layer fill color scale when activeLayer changes
  useEffect(() => {
    if (!mapRef.current || !mapRef.current.isStyleLoaded()) return;

    let propertyKey = 'personas_por_hectarea';
    let colorStops: any[] = [];

    if (activeLayer === 'TECH_CONN') {
      propertyKey = 'educacion_superior';
      colorStops = [
        0, '#1e293b',
        0.15, '#155e75',
        0.35, '#0e7490',
        0.55, '#06b6d4',
        0.75, '#22d3ee',
      ];
    } else if (activeLayer === 'DENSITY') {
      propertyKey = 'personas_por_hectarea';
      colorStops = [
        0, '#1e293b',
        40, '#047857',
        100, '#059669',
        180, '#10b981',
        300, '#34d399',
      ];
    } else if (activeLayer === 'HOUSING_SERVICES') {
      propertyKey = 'dependencia_economica';
      colorStops = [
        50, '#78350f',
        100, '#b45309',
        140, '#d97706',
        180, '#f59e0b',
        220, '#fbbf24',
      ];
    } else if (activeLayer === 'ECONOMIC_HUBS') {
      propertyKey = 'personas';
      colorStops = [
        0, '#1e293b',
        50, '#0d9488',
        150, '#14b8a6',
        300, '#2dd4bf',
        600, '#5eead4',
      ];
    }

    try {
      mapRef.current.setPaintProperty('ine-manzanos-fill', 'fill-color', [
        'interpolate',
        ['linear'],
        ['coalesce', ['get', propertyKey], 0],
        ...colorStops,
      ]);
    } catch {
      // Style setting fallback
    }
  }, [activeLayer]);

  const handleRunAiAnalysis = async () => {
    setAiLoading(true);
    try {
      const res = await fetch('/api/gemini-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          metroArea: activeScope,
          blockData: selectedBlockData,
          activeLayer,
          language,
        }),
      });
      const data = await res.json();
      if (data.reply) {
        setAiAnalysis(data.reply);
      }
    } catch {
      setAiAnalysis('AI Spatial Assistant proxy temporarily unavailable.');
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="space-y-4 font-sans">
      {/* Scope Selector Header Tabs */}
      <div className="p-3 bg-slate-900 border border-slate-800 rounded-t-xl space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2.5">
          <div className="flex items-center space-x-2">
            <Layers className="w-4 h-4 text-teal-400" />
            <span className="text-xs font-mono-tech text-slate-300 font-bold uppercase">
              ALCANCE ESPACIAL (PMTILES INE):
            </span>
          </div>
          
          <a
            href="https://mauforonda.github.io/atlasurbano/"
            target="_blank"
            rel="noreferrer"
            className="text-[11px] font-mono-tech text-teal-300 hover:text-teal-200 hidden sm:flex items-center gap-1 transition-colors"
          >
            <Info className="w-3.5 h-3.5 text-teal-400 shrink-0 inline" />
            <span>Atlas Urbano Censo 2024 (100% Manzanos Reales INE)</span>
            <ExternalLink className="w-3 h-3 text-slate-400 shrink-0 inline" />
          </a>
        </div>

        {/* Scope Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {(['Nacional', 'Santa Cruz', 'Cochabamba', 'La Paz'] as ScopeType[]).map((scope) => (
            <button
              key={scope}
              onClick={() => {
                onScopeChange(scope);
                setSelectedBlockData(null);
              }}
              className={`py-1.5 px-3 rounded-lg text-xs font-mono-tech font-bold transition-all text-center ${
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

        {/* Censo 2024 Layer Pills */}
        <div className="pt-1 flex flex-wrap items-center gap-1.5">
          <span className="text-[10px] font-mono-tech text-slate-400 uppercase mr-1">
            {t('flagship.layerLabel')}
          </span>
          {CENSUS_LAYERS.map((layer) => (
            <button
              key={layer.code}
              onClick={() => onLayerChange(layer.code)}
              className={`px-2.5 py-1 rounded text-[11px] font-mono-tech transition-all flex items-center space-x-1.5 ${
                activeLayer === layer.code
                  ? 'bg-slate-800 text-teal-300 border border-teal-500/50 shadow'
                  : 'bg-slate-950/60 text-slate-400 hover:text-slate-200 border border-slate-800/60'
              }`}
            >
              <span
                className="w-2 h-2 rounded-full inline-block"
                style={{ backgroundColor: layer.primaryColor }}
              />
              <span>{language === 'es' ? layer.labelEs : layer.labelEn}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Map Canvas Container (MapLibre GL + PMTiles) */}
      <div className="relative h-[460px] sm:h-[520px] w-full overflow-hidden border border-slate-800 shadow-2xl rounded-b-xl">
        <div ref={mapContainerRef} className="h-full w-full bg-slate-950" />

        {/* AI Analysis Floating Trigger Button */}
        <div className="absolute top-3 right-3 z-10 flex items-center space-x-2">
          <button
            onClick={handleRunAiAnalysis}
            disabled={aiLoading}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-teal-500 hover:bg-teal-400 text-slate-950 font-mono-tech font-bold text-xs shadow-xl transition-all disabled:opacity-50"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{aiLoading ? t('flagship.aiLoading') : t('flagship.runAi')}</span>
          </button>
        </div>

        {/* Floating Layer Metric Legend Bar */}
        <div className="absolute top-3 left-3 z-10 hidden sm:block bg-slate-900/90 backdrop-blur-md p-2 rounded-lg border border-slate-800 font-mono-tech text-[10px] space-y-1 shadow-xl max-w-xs">
          <div className="text-teal-400 font-bold tracking-wider uppercase">
            MANZANOS REALES INE (PMTILES)
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-slate-400">Bajo</span>
            <div
              className="h-2 w-20 rounded"
              style={{
                background: `linear-gradient(to right, #1e293b, ${
                  CENSUS_LAYERS.find((l) => l.code === activeLayer)?.primaryColor || '#14b8a6'
                })`,
              }}
            />
            <span className="text-slate-200 font-bold">Alto</span>
          </div>
        </div>
      </div>

      {/* Real Block Inspector Panel */}
      {selectedBlockData && (
        <div className="p-3.5 rounded-xl bg-slate-900 border border-teal-500/50 font-mono-tech text-xs text-slate-200 flex flex-wrap items-center justify-between gap-3 shadow-xl animate-fade-in">
          <div>
            <span className="text-teal-400 font-bold block uppercase">{selectedBlockData.id}</span>
            <span className="text-slate-400 text-[10px]">MANZANO REAL CENSO 2024 INE</span>
          </div>
          <div className="flex flex-wrap gap-4 text-[11px]">
            <div>Población: <strong className="text-white">{selectedBlockData.personas} hab.</strong></div>
            <div>Densidad: <strong className="text-emerald-400">{selectedBlockData.density} hab/ha</strong></div>
            <div>Educación Superior: <strong className="text-cyan-300">{selectedBlockData.educacion}</strong></div>
            <div>Población Joven (&lt;20): <strong className="text-amber-400">{selectedBlockData.jovenes}</strong></div>
          </div>
        </div>
      )}

      {/* AI Narrative Result Box */}
      {aiAnalysis && (
        <div className="p-4 rounded-xl bg-slate-900 border border-teal-500/40 font-mono-tech text-xs text-slate-200 space-y-2 shadow-xl animate-fade-in">
          <div className="flex items-center justify-between text-teal-400 font-bold border-b border-slate-800 pb-2">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-teal-400" />
              <span>{t('flagship.aiHeaderTitle')}</span>
            </div>
            <span className="text-[10px] text-slate-400 font-normal">GEMINI REST PROXY</span>
          </div>
          <p className="whitespace-pre-line leading-relaxed text-slate-300">{aiAnalysis}</p>
        </div>
      )}
    </div>
  );
}
