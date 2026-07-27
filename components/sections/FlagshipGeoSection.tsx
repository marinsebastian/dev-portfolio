'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { SectionReveal } from '../motion/SectionReveal';
import {
  URBAN_CENSUS_ZONES,
  UrbanCensusZone,
  ScopeType,
  LayerCode,
} from '@/data/mauForondaCensusData';
import { CASE_STUDIES } from '@/data/portfolioData';
import { CodeBlock } from '../ui/CodeBlock';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { MapPin, Database, Server, CheckCircle2, Globe, Info } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

// Dynamic import for MapLibre GL + PMTiles map component
const RealBlockMapWidgetClient = dynamic(() => import('../map/RealBlockMapWidget.client'), {
  ssr: false,
  loading: () => (
    <div className="h-[480px] w-full rounded-xl bg-slate-900 border border-slate-800 flex flex-col items-center justify-center space-y-3 font-mono-tech text-xs text-slate-400">
      <div className="w-8 h-8 rounded-full border-2 border-teal-400 border-t-transparent animate-spin" />
      <span>Loading Mauricio Foronda Censo 2024 PMTiles Vector Engine (100% Real INE Block Geometry)...</span>
    </div>
  ),
});

export function FlagshipGeoSection() {
  const { t, language } = useLanguage();
  const [activeScope, setActiveScope] = useState<ScopeType>('Santa Cruz');
  const [activeLayer, setActiveLayer] = useState<LayerCode>('DENSITY');
  const [selectedZone, setSelectedZone] = useState<UrbanCensusZone>(
    URBAN_CENSUS_ZONES.find((z) => z.metroArea === 'Santa Cruz') || URBAN_CENSUS_ZONES[0]
  );

  const flagshipData = CASE_STUDIES.find((c) => c.id === 'geoinsights-bolivia')!;

  // The data file carries both languages; the ES variants were previously unused.
  const proofPoints =
    language === 'es' && flagshipData.proofPointsEs ? flagshipData.proofPointsEs : flagshipData.proofPoints;
  const geolabsRelevance =
    language === 'es' && flagshipData.geolabsRelevanceEs
      ? flagshipData.geolabsRelevanceEs
      : flagshipData.geolabsRelevance;

  const formatNumber = (num: number) => {
    const separator = language === 'es' ? '.' : ',';
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, separator);
  };

  const scopeZones = URBAN_CENSUS_ZONES.filter((z) => z.metroArea === activeScope);

  const chartData = scopeZones.map((z) => ({
    name: z.name.split(' ')[0],
    Connectivity: z.metrics.internetCoveragePct,
    Services: z.metrics.basicServicesIndex,
    DensityIndex: Math.min(100, Math.round((z.metrics.densityHabKm2 / 8000) * 100)),
  }));

  return (
    <section id="flagship" className="py-20 bg-[#070a11] relative border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* Flagship Header */}
        <SectionReveal className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded bg-teal-500/10 border border-teal-500/40 text-teal-300 font-mono-tech text-xs">
              <MapPin className="w-3.5 h-3.5 text-teal-400" />
              <span className="font-bold">{t('flagship.badge')}</span>
            </div>
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 font-mono-tech text-xs">
              <Globe className="w-3.5 h-3.5 text-cyan-400" />
              <span>PMTiles Vector Tiles (@mauforonda atlasurbano)</span>
            </div>
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            {t('flagship.title')} — {t('flagship.subtitle')}
          </h2>
          <p className="text-slate-300 text-base max-w-3xl leading-relaxed">
            {t('flagship.summary')}
          </p>

          {/* PMTiles dataset provenance banner */}
          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 font-mono-tech text-xs space-y-1.5 max-w-4xl text-slate-300">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-1.5">
              <span className="text-teal-300 font-bold flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                {t('flagship.datasetBannerTitle')}
              </span>
              <a
                href="https://mauforonda.github.io/atlasurbano/"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-cyan-400 hover:underline inline-flex items-center gap-1 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400"
              >
                <span>mauforonda/atlasurbano</span>
              </a>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
              {t('flagship.datasetBannerDesc')}
            </p>
          </div>
        </SectionReveal>

        {/* Main Console Grid: Map Viewer & Urban Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Interactive MapLibre GL PMTiles Map with Multi-Scope Switcher */}
          <div className="lg:col-span-7">
            <RealBlockMapWidgetClient
              activeScope={activeScope}
              onScopeChange={(scope) => {
                setActiveScope(scope);
                const firstZone = URBAN_CENSUS_ZONES.find((z) => z.metroArea === scope);
                if (firstZone) setSelectedZone(firstZone);
              }}
              activeLayer={activeLayer}
              onLayerChange={(layer) => setActiveLayer(layer)}
            />
          </div>

          {/* Right Column: Selected Urban Zone Metrics & Comparative Chart */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Active Urban Zone Card */}
            <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <span className="text-[10px] font-mono-tech text-slate-400 uppercase">
                    {t('flagship.activeZone')}
                  </span>
                  <h3 className="text-lg font-bold text-teal-300">{selectedZone.name}</h3>
                </div>
                <span className="px-2.5 py-1 bg-slate-800 rounded text-xs font-mono-tech text-teal-400 border border-teal-500/30">
                  {selectedZone.metroArea}
                </span>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-3 font-mono-tech text-xs">
                <div className="p-3 rounded bg-slate-950/70 border border-slate-800">
                  <span className="text-slate-400 block text-[10px] uppercase">
                    {t('flagship.population')}
                  </span>
                  <span className="text-white font-bold text-sm">
                    {formatNumber(selectedZone.metrics.population2024)} hab.
                  </span>
                </div>

                <div className="p-3 rounded bg-slate-950/70 border border-slate-800">
                  <span className="text-slate-400 block text-[10px] uppercase">
                    {t('flagship.densityBadge')}
                  </span>
                  <span className="text-emerald-400 font-bold text-sm">
                    {formatNumber(selectedZone.metrics.densityHabKm2)} hab/km²
                  </span>
                </div>

                <div className="p-3 rounded bg-slate-950/70 border border-slate-800">
                  <span className="text-slate-400 block text-[10px] uppercase">
                    {t('flagship.connectivityBadge')}
                  </span>
                  <span className="text-cyan-400 font-bold text-sm">
                    {selectedZone.metrics.internetCoveragePct}%
                  </span>
                </div>

                <div className="p-3 rounded bg-slate-950/70 border border-slate-800">
                  <span className="text-slate-400 block text-[10px] uppercase">
                    {t('flagship.servicesBadge')}
                  </span>
                  <span className="text-amber-400 font-bold text-sm">
                    {selectedZone.metrics.basicServicesIndex} / 100
                  </span>
                </div>
              </div>

              {/* Sector */}
              <div className="space-y-1.5 text-xs">
                <span className="font-mono-tech text-slate-400 block text-[10px] uppercase">
                  {t('flagship.sectorBadge')}:
                </span>
                <span className="px-2.5 py-1 rounded bg-slate-800 text-teal-300 font-mono-tech text-xs inline-block border border-slate-700">
                  {selectedZone.metrics.primarySector}
                </span>
              </div>

              {/* Narrative Description */}
              <p className="text-xs text-slate-300 leading-relaxed pt-1 border-t border-slate-800/80">
                {language === 'es' ? selectedZone.narrativeEs : selectedZone.narrativeEn}
              </p>

              {/* Provenance: which numbers are measured and which are illustrative */}
              <p className="flex items-start gap-2 text-[10px] text-slate-500 leading-relaxed pt-3 border-t border-slate-800/80">
                <Info className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-px" />
                <span>{t('flagship.provenanceNote')}</span>
              </p>
            </div>

            {/* Scope Comparison Bar Chart */}
            <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-3 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-xs font-mono-tech text-slate-300 font-bold uppercase">
                  {t('flagship.comparisonTitle')}
                </span>
                <span className="text-[10px] font-mono-tech text-teal-400 font-bold">
                  {activeScope} ({scopeZones.length} {t('flagship.zonesSuffix')})
                </span>
              </div>
              <div className="h-44 w-full pt-1">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} />
                    <YAxis stroke="#64748b" fontSize={10} domain={[0, 100]} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        borderColor: '#334155',
                        borderRadius: '6px',
                        fontSize: '11px',
                        fontFamily: 'monospace',
                      }}
                    />
                    {activeLayer === 'DENSITY' ? (
                      <>
                        <Bar dataKey="DensityIndex" fill="#10b981" name="Densidad Index" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="Connectivity" fill="#06b6d4" name="Internet %" radius={[4, 4, 0, 0]} />
                      </>
                    ) : activeLayer === 'HOUSING_SERVICES' ? (
                      <>
                        <Bar dataKey="Services" fill="#f59e0b" name="Servicios Index" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="Connectivity" fill="#06b6d4" name="Internet %" radius={[4, 4, 0, 0]} />
                      </>
                    ) : activeLayer === 'ECONOMIC_HUBS' ? (
                      <>
                        <Bar dataKey="Services" fill="#14b8a6" name="Nodos Index" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="DensityIndex" fill="#10b981" name="Densidad Index" radius={[4, 4, 0, 0]} />
                      </>
                    ) : (
                      <>
                        <Bar dataKey="Connectivity" fill="#06b6d4" name="Internet %" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="Services" fill="#f59e0b" name="Servicios Index" radius={[4, 4, 0, 0]} />
                      </>
                    )}
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>

        </div>

        {/* Technical Proof & Geolabs Relevance Summary */}
        <div className="p-6 rounded-xl bg-slate-900/70 border border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-6 shadow-2xl">
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white uppercase font-mono-tech flex items-center space-x-2">
              <Database className="w-4 h-4 text-teal-400" />
              <span>{t('flagship.proofTitle')}</span>
            </h4>
            <ul className="space-y-2 text-xs text-slate-300">
              {proofPoints.map((point, i) => (
                <li key={i} className="flex items-start space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white uppercase font-mono-tech flex items-center space-x-2">
              <Server className="w-4 h-4 text-cyan-400" />
              <span>{t('flagship.relevanceTitle')}</span>
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              {geolabsRelevance}
            </p>

            <div className="pt-2">
              <CodeBlock
                filename="components/map/RealBlockMapWidget.client.tsx"
                language="typescript"
                code={`// Protocol registration for PMTiles vector tile stream\nconst protocol = new pmtiles.Protocol();\nmaplibregl.addProtocol('pmtiles', protocol.tile);\n\nconst PMTILES_URL = 'https://raw.githubusercontent.com/mauforonda/atlasurbano/pmtiles/atlas.pmtiles';`}
              />
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
