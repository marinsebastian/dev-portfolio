'use client';

import { useState, useEffect } from 'react';
import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, Polygon, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import {
  URBAN_CENSUS_ZONES,
  CENSUS_LAYERS,
  SCOPE_CONFIG,
  UrbanCensusZone,
  ScopeType,
  LayerCode,
} from '@/data/mauForondaCensusData';
import { useLanguage } from '@/context/LanguageContext';
import { Sparkles, MapPin, Layers, ExternalLink, Activity, Info } from 'lucide-react';

// Fix leaflet default marker icons in Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

interface MapWidgetProps {
  activeScope: ScopeType;
  onScopeChange: (scope: ScopeType) => void;
  activeLayer: LayerCode;
  onLayerChange: (layer: LayerCode) => void;
  selectedZone: UrbanCensusZone;
  onSelectZone: (zone: UrbanCensusZone) => void;
}

// Map Helper component to handle view transitions
function MapController({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, zoom, { duration: 1.2 });
  }, [map, center, zoom]);
  return null;
}

export function getFeatureStyle(zone: UrbanCensusZone, activeLayer: LayerCode, isSelected: boolean) {
  let fillColor = '#1e293b';
  let opacity = 0.3;

  if (activeLayer === 'TECH_CONN') {
    const pct = zone.metrics.internetCoveragePct;
    fillColor = pct > 90 ? '#06b6d4' : pct > 75 ? '#0891b2' : pct > 60 ? '#0e7490' : '#155e75';
    opacity = Math.max(0.35, pct / 100);
  } else if (activeLayer === 'DENSITY') {
    const density = zone.metrics.densityHabKm2;
    fillColor = density > 6000 ? '#10b981' : density > 3500 ? '#059669' : density > 1500 ? '#047857' : '#065f46';
    opacity = Math.min(0.85, Math.max(0.3, density / 7000));
  } else if (activeLayer === 'HOUSING_SERVICES') {
    const srv = zone.metrics.basicServicesIndex;
    fillColor = srv > 95 ? '#f59e0b' : srv > 85 ? '#d97706' : srv > 75 ? '#b45309' : '#78350f';
    opacity = Math.max(0.35, srv / 100);
  } else if (activeLayer === 'ECONOMIC_HUBS') {
    fillColor = isSelected ? '#14b8a6' : '#2dd4bf';
    opacity = 0.55;
  }

  return {
    color: isSelected ? '#14b8a6' : '#475569',
    fillColor,
    fillOpacity: isSelected ? 0.75 : opacity,
    weight: isSelected ? 3 : 1.5,
  };
}

export default function MapWidgetClient({
  activeScope,
  onScopeChange,
  activeLayer,
  onLayerChange,
  selectedZone,
  onSelectZone,
}: MapWidgetProps) {
  const { t, language } = useLanguage();
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  const filteredZones = URBAN_CENSUS_ZONES.filter((z) => z.metroArea === activeScope);

  const formatNumber = (num: number) => {
    const separator = language === 'es' ? '.' : ',';
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, separator);
  };

  const handleRunAiAnalysis = async () => {
    setAiLoading(true);
    try {
      const res = await fetch('/api/gemini-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          metroArea: activeScope,
          zoneId: selectedZone.id,
          activeLayer,
          language,
        }),
      });
      const data = await res.json();
      if (data.reply) {
        setAiAnalysis(data.reply);
      }
    } catch {
      setAiAnalysis('AI Spatial Assistant service temporarily unavailable.');
    } finally {
      setAiLoading(false);
    }
  };

  const currentScopeConfig = SCOPE_CONFIG[activeScope];

  return (
    <div className="space-y-4 font-sans">
      {/* Scope Selector Header Tabs */}
      <div className="p-3 bg-slate-900 border border-slate-800 rounded-t-xl space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2.5">
          <div className="flex items-center space-x-2">
            <Layers className="w-4 h-4 text-teal-400" />
            <span className="text-xs font-mono-tech text-slate-300 font-bold uppercase">
              {t('flagship.scopeLabel')}
            </span>
          </div>
          
          <span className="text-[11px] font-mono-tech text-slate-400 hidden sm:inline flex items-center gap-1">
            <Info className="w-3 h-3 text-teal-400 inline" />
            {t('flagship.sourceAttribution')}
          </span>
        </div>

        {/* Scope Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {(['Nacional', 'Santa Cruz', 'Cochabamba', 'La Paz'] as ScopeType[]).map((scope) => (
            <button
              key={scope}
              onClick={() => {
                onScopeChange(scope);
                const firstInScope = URBAN_CENSUS_ZONES.find((z) => z.metroArea === scope);
                if (firstInScope) onSelectZone(firstInScope);
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

      {/* Map Canvas Container */}
      <div className="relative h-[440px] sm:h-[500px] w-full overflow-hidden border border-slate-800 shadow-2xl rounded-b-xl">
        <MapContainer
          center={currentScopeConfig.center}
          zoom={currentScopeConfig.zoom}
          scrollWheelZoom={false}
          className="h-full w-full bg-slate-950"
        >
          <MapController center={selectedZone.coordinates} zoom={activeScope === 'Nacional' ? 6 : 12.2} />

          {/* CartoDB Dark Matter Basemap */}
          <TileLayer
            attribution='&copy; <a href="https://carto.com/">CARTO</a> &copy; <a href="https://github.com/mauforonda">Mauricio Foronda Datasets</a>'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          />

          {/* Zone Polygons */}
          {filteredZones.map((zone) => {
            const isSelected = zone.id === selectedZone.id;
            const style = getFeatureStyle(zone, activeLayer, isSelected);

            return (
              <Polygon
                key={zone.id}
                positions={zone.bounds}
                pathOptions={style}
                eventHandlers={{
                  click: () => onSelectZone(zone),
                }}
              />
            );
          })}

          {/* Zone Markers */}
          {filteredZones.map((zone) => (
            <Marker
              key={`marker-${zone.id}`}
              position={zone.coordinates}
              eventHandlers={{
                click: () => onSelectZone(zone),
              }}
            >
              <Popup>
                <div className="p-1 space-y-1 font-sans text-xs text-slate-100 max-w-xs">
                  <div className="font-bold text-teal-300 text-sm border-b border-slate-700 pb-1">
                    {zone.name}
                  </div>
                  <div className="font-mono-tech text-[10px] text-slate-300">
                    <div>Población (2024): <strong>{formatNumber(zone.metrics.population2024)}</strong> hab.</div>
                    <div>Densidad: <strong>{formatNumber(zone.metrics.densityHabKm2)}</strong> hab/km²</div>
                    <div>Internet / Fibra: <strong className="text-cyan-300">{zone.metrics.internetCoveragePct}%</strong></div>
                    <div>Servicios Básicos: <strong className="text-amber-300">{zone.metrics.basicServicesIndex}/100</strong></div>
                  </div>
                  <p className="text-[11px] text-slate-300 italic pt-1 border-t border-slate-800">
                    {language === 'es' ? zone.narrativeEs : zone.narrativeEn}
                  </p>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>

        {/* AI Analysis Floating Trigger Button & Active Zone Badge */}
        <div className="absolute top-3 right-3 z-[400] flex items-center space-x-2">
          <button
            onClick={handleRunAiAnalysis}
            disabled={aiLoading}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-teal-500 hover:bg-teal-400 text-slate-950 font-mono-tech font-bold text-xs shadow-xl transition-all disabled:opacity-50"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{aiLoading ? t('flagship.aiLoading') : t('flagship.runAi')}</span>
          </button>
        </div>

        {/* Bottom Zone Quick Selection Pills */}
        <div className="absolute bottom-3 left-3 right-3 z-[400] flex flex-wrap gap-1.5 bg-slate-900/90 backdrop-blur-md p-2 rounded-lg border border-slate-800 max-h-24 overflow-y-auto">
          {filteredZones.map((zone) => (
            <button
              key={zone.id}
              onClick={() => onSelectZone(zone)}
              className={`px-2.5 py-1 rounded text-[11px] font-mono-tech transition-all ${
                zone.id === selectedZone.id
                  ? 'bg-teal-400 text-slate-950 font-bold shadow'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white'
              }`}
            >
              {zone.name}
            </button>
          ))}
        </div>
      </div>

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
