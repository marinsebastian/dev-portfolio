'use client';

import { useMemo } from 'react';
import dynamic from 'next/dynamic';
import { SectionReveal } from '../motion/SectionReveal';
import { URBAN_CENSUS_ZONES, CENSUS_LAYER_GROUPS } from '@/data/mauForondaCensusData';
import { CASE_STUDIES } from '@/data/portfolioData';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { MapPin, Database, Server, CheckCircle2, Globe, Info } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useGeoConsole } from '@/context/GeoConsoleContext';
import { LocationBadge } from '../ai/MapCopilot.client';

// Dynamic import for MapLibre GL + PMTiles map component
const RealBlockMapWidgetClient = dynamic(() => import('../map/RealBlockMapWidget.client'), {
  ssr: false,
  loading: () => (
    <div className="h-[480px] w-full rounded-xl bg-slate-900 border border-slate-800 flex flex-col items-center justify-center space-y-3 font-mono-tech text-xs text-slate-400">
      <div className="w-8 h-8 rounded-full border-2 border-teal-400 border-t-transparent animate-spin" />
      <span>Cargando manzanos reales del Censo 2024 (PMTiles)…</span>
    </div>
  ),
});

export function FlagshipGeoSection() {
  const { t, language } = useLanguage();
  const { activeScope, activeLayer, visibleStats, selectedBlock, setSelectedBlock } = useGeoConsole();

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

  const scopeZones = useMemo(
    () => URBAN_CENSUS_ZONES.filter((z) => z.metroArea === activeScope),
    [activeScope]
  );

  // Drives the live-metrics card's labels/units below, so a switch to e.g.
  // internet coverage doesn't keep showing "Densidad ... hab/ha" over a
  // percentage that has nothing to do with density.
  const activeLayerMeta = useMemo(() => {
    for (const group of CENSUS_LAYER_GROUPS) {
      const found = group.layers.find((l) => l.code === activeLayer);
      if (found) return found;
    }
    return CENSUS_LAYER_GROUPS[0].layers[0];
  }, [activeLayer]);

  // The reference card follows the scope rather than a separate selection, so
  // the panel and the map can never disagree about which area is in view.
  const referenceZone = scopeZones[0] ?? URBAN_CENSUS_ZONES[0];

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
              <span>{t('flagship.liveMapBadge')}</span>
            </div>
            <LocationBadge />
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            {t('flagship.title')} — {t('flagship.subtitle')}
          </h2>
          <p className="text-slate-300 text-base max-w-3xl leading-relaxed">
            {t('flagship.summary')}
          </p>
        </SectionReveal>

        {/* Main Console Grid: Map Viewer & Urban Analytics — both columns
            stretch to the row's height (the taller of the two) instead of
            top-aligning at their own natural heights, so the map canvas and
            comparison chart each grow/shrink to close the gap rather than
            leaving one column visibly shorter than the other. */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          <div className="lg:col-span-7 h-full">
            <RealBlockMapWidgetClient />
          </div>

          {/* Right Column: Zone reference card & comparative chart */}
          <div className="lg:col-span-5 flex h-full flex-col gap-6">

            <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl shrink-0">
              {selectedBlock ? (
                /* Selected Block Inspection Card */
                <>
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div>
                      <span className="text-[10px] font-mono-tech text-teal-400 uppercase font-bold tracking-wider">
                        {t('flagship.blockInspectorTitle')}
                      </span>
                      <h3 className="text-sm font-bold text-white font-mono-tech">{selectedBlock.lngLat}</h3>
                    </div>
                    <button
                      onClick={() => setSelectedBlock(null)}
                      className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 rounded text-[11px] font-mono-tech text-slate-300 border border-slate-700 transition-colors"
                    >
                      {t('flagship.blockClose')}
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-3 font-mono-tech text-xs">
                    <div className="p-3 rounded bg-slate-950/70 border border-slate-800">
                      <span className="text-slate-400 block text-[10px] uppercase">
                        {t('flagship.blockPopulationLabel')}
                      </span>
                      <span className="text-white font-bold text-sm">
                        {selectedBlock.population !== null ? `${formatNumber(selectedBlock.population)} hab.` : '—'}
                      </span>
                    </div>

                    <div className="p-3 rounded bg-slate-950/70 border border-slate-800">
                      <span className="text-slate-400 block text-[10px] uppercase">
                        {t('flagship.blockDensityLabel')}
                      </span>
                      <span className="text-emerald-400 font-bold text-sm">
                        {selectedBlock.densityPerHa !== null ? `${formatNumber(selectedBlock.densityPerHa)} hab/ha` : '—'}
                      </span>
                    </div>

                    <div className="p-3 rounded bg-slate-950/70 border border-slate-800">
                      <span className="text-slate-400 block text-[10px] uppercase">
                        {t('flagship.blockInternetLabel')}
                      </span>
                      <span className="text-cyan-400 font-bold text-sm">
                        {selectedBlock.internetPct !== null ? `${selectedBlock.internetPct}%` : '—'}
                      </span>
                    </div>

                    <div className="p-3 rounded bg-slate-950/70 border border-slate-800">
                      <span className="text-slate-400 block text-[10px] uppercase">
                        {t('flagship.blockWaterLabel')}
                      </span>
                      <span className="text-amber-400 font-bold text-sm">
                        {selectedBlock.waterPct !== null ? `${selectedBlock.waterPct}%` : '—'}
                      </span>
                    </div>
                  </div>

                  <p className="flex items-start gap-2 text-[10px] font-mono-tech text-teal-400/90 leading-relaxed pt-2 border-t border-slate-800/80">
                    <Info className="w-3.5 h-3.5 text-teal-400 shrink-0 mt-px" />
                    <span>
                      {language === 'es'
                        ? 'Datos reales por manzano del Censo 2024 (INE / @mauforonda). Densidad en hab/ha (Sistema Métrico SI: 1 ha = 10.000 m²).'
                        : 'Real block-level Censo 2024 data (INE / @mauforonda). Density in hab/ha (SI Metric System: 1 ha = 10,000 m²).'}
                    </span>
                  </p>
                </>
              ) : visibleStats ? (
                /* Live Viewport Aggregate Stats Card */
                <>
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div>
                      <span className="text-[10px] font-mono-tech text-cyan-400 uppercase font-bold tracking-wider">
                        {language === 'es' ? 'MÉTRICAS DE VISTA EN VIVO' : 'LIVE VIEWPORT METRICS'}
                      </span>
                      <h3 className="text-lg font-bold text-teal-300">{activeScope}</h3>
                      <span className="text-[11px] font-mono-tech text-slate-400">
                        {language === 'es' ? activeLayerMeta.labelEs : activeLayerMeta.labelEn}
                      </span>
                    </div>
                    <span className="px-2.5 py-1 bg-slate-800 rounded text-xs font-mono-tech text-cyan-300 border border-cyan-500/30">
                      {formatNumber(visibleStats.count)} {t('flagship.blocksInViewSuffix')}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 font-mono-tech text-xs">
                    <div className="p-3 rounded bg-slate-950/70 border border-slate-800">
                      <span className="text-slate-400 block text-[10px] uppercase">{t('flagship.metricMin')}</span>
                      <span className="text-sky-400 font-bold text-sm">
                        {formatNumber(visibleStats.min)} {activeLayerMeta.unitLabel}
                      </span>
                    </div>

                    <div className="p-3 rounded bg-slate-950/70 border border-slate-800">
                      <span className="text-slate-400 block text-[10px] uppercase">{t('flagship.metricMedian')}</span>
                      <span className="text-emerald-400 font-bold text-sm">
                        {formatNumber(visibleStats.median)} {activeLayerMeta.unitLabel}
                      </span>
                    </div>

                    <div className="p-3 rounded bg-slate-950/70 border border-slate-800">
                      <span className="text-slate-400 block text-[10px] uppercase">{t('flagship.metricTop10')}</span>
                      <span className="text-teal-300 font-bold text-sm">
                        {formatNumber(visibleStats.p90)} {activeLayerMeta.unitLabel}
                      </span>
                    </div>

                    <div className="p-3 rounded bg-slate-950/70 border border-slate-800">
                      <span className="text-slate-400 block text-[10px] uppercase">{t('flagship.metricMax')}</span>
                      <span className="text-cyan-400 font-bold text-sm">
                        {formatNumber(visibleStats.max)} {activeLayerMeta.unitLabel}
                      </span>
                    </div>
                  </div>

                  <p className="flex items-start gap-2 text-[10px] font-mono-tech text-slate-400 leading-relaxed pt-2 border-t border-slate-800/80">
                    <Info className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-px" />
                    <span>
                      {language === 'es'
                        ? 'Estadísticas agregadas en tiempo real sobre los manzanos visibles en pantalla.'
                        : 'Real-time aggregate statistics over the blocks currently visible on screen.'}
                    </span>
                  </p>
                </>
              ) : (
                /* Fallback Reference Card with SI Metric System Standard */
                <>
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div>
                      <span className="text-[10px] font-mono-tech text-slate-400 uppercase">
                        {t('flagship.activeZone')}
                      </span>
                      <h3 className="text-lg font-bold text-teal-300">{referenceZone.name}</h3>
                    </div>
                    <span className="px-2.5 py-1 bg-slate-800 rounded text-xs font-mono-tech text-teal-400 border border-teal-500/30">
                      {referenceZone.metroArea}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 font-mono-tech text-xs">
                    <div className="p-3 rounded bg-slate-950/70 border border-slate-800">
                      <span className="text-slate-400 block text-[10px] uppercase">
                        {t('flagship.population')}
                      </span>
                      <span className="text-white font-bold text-sm">
                        {formatNumber(referenceZone.metrics.population2024)} hab.
                      </span>
                    </div>

                    <div className="p-3 rounded bg-slate-950/70 border border-slate-800">
                      <span className="text-slate-400 block text-[10px] uppercase">
                        {t('flagship.densityBadge')}
                      </span>
                      <span className="text-emerald-400 font-bold text-sm">
                        {formatNumber(Math.round(referenceZone.metrics.densityHabKm2 / 100))} hab/ha
                      </span>
                    </div>

                    <div className="p-3 rounded bg-slate-950/70 border border-slate-800">
                      <span className="text-slate-400 block text-[10px] uppercase">
                        {t('flagship.connectivityBadge')}
                      </span>
                      <span className="text-cyan-400 font-bold text-sm">
                        {referenceZone.metrics.internetCoveragePct}%
                      </span>
                    </div>

                    <div className="p-3 rounded bg-slate-950/70 border border-slate-800">
                      <span className="text-slate-400 block text-[10px] uppercase">
                        {t('flagship.servicesBadge')}
                      </span>
                      <span className="text-amber-400 font-bold text-sm">
                        {referenceZone.metrics.basicServicesIndex} / 100
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-xs">
                    <span className="font-mono-tech text-slate-400 block text-[10px] uppercase">
                      {t('flagship.sectorBadge')}:
                    </span>
                    <span className="px-2.5 py-1 rounded bg-slate-800 text-teal-300 font-mono-tech text-xs inline-block border border-slate-700">
                      {referenceZone.metrics.primarySector}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed pt-1 border-t border-slate-800/80">
                    {language === 'es' ? referenceZone.narrativeEs : referenceZone.narrativeEn}
                  </p>

                  <p className="flex items-start gap-2 text-[10px] text-slate-500 leading-relaxed pt-3 border-t border-slate-800/80 font-mono-tech">
                    <Info className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-px" />
                    <span>{t('flagship.provenanceNote')} · Densidad expresada en el Sistema Métrico SI (hab/ha).</span>
                  </p>
                </>
              )}
            </div>

            {/* Scope Comparison Bar Chart — flex-1 so it absorbs whatever
                extra height the row picked up from the map/inspector card,
                with Recharts' own ResponsiveContainer (height 100%) filling
                whatever that ends up being instead of a fixed h-44. */}
            <div className="flex min-h-0 flex-1 flex-col space-y-3 rounded-xl border border-slate-800 bg-slate-900 p-5 shadow-xl">
              <div className="flex shrink-0 items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-xs font-mono-tech text-slate-300 font-bold uppercase">
                  {t('flagship.comparisonTitle')}
                </span>
                <span className="text-[10px] font-mono-tech text-teal-400 font-bold">
                  {activeScope} ({scopeZones.length} {t('flagship.zonesSuffix')})
                </span>
              </div>
              <div className="min-h-[140px] w-full flex-1 pt-1">
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

        {/* Technical Proof & dataset attribution */}
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

            {/* Discrete attribution: the licence obligation is met here in text
                rather than as a watermark over the map canvas. */}
            <p className="pt-3 border-t border-slate-800 font-mono-tech text-[10px] leading-relaxed text-slate-500">
              {t('flagship.datasetBannerTitle')} ·{' '}
              <a
                href="https://github.com/mauforonda/atlasurbano"
                target="_blank"
                rel="noreferrer"
                className="text-teal-400 hover:underline rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400"
              >
                @mauforonda / atlasurbano
              </a>{' '}
              ·{' '}
              <a
                href="https://www.openstreetmap.org/copyright"
                target="_blank"
                rel="noreferrer"
                className="text-slate-400 hover:underline rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400"
              >
                © OpenStreetMap
              </a>{' '}
              ·{' '}
              <a
                href="https://carto.com/attributions"
                target="_blank"
                rel="noreferrer"
                className="text-slate-400 hover:underline rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400"
              >
                © CARTO
              </a>
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white uppercase font-mono-tech flex items-center space-x-2">
              <Server className="w-4 h-4 text-cyan-400" />
              <span>{t('flagship.relevanceTitle')}</span>
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">{geolabsRelevance}</p>

            {/* Interactive Visual Tool Schema Card */}
            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3 font-mono-tech text-xs">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2 text-[11px]">
                <span className="text-teal-400 font-bold">tools/copilot-schema.json</span>
                <span className="text-slate-500">9 MAP TOOLS ACTIVE</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px]">
                <div className="p-2.5 rounded bg-slate-900 border border-slate-800 text-slate-300">
                  <span className="text-teal-400 font-bold block">set_map_layer</span>
                  <span className="text-[10px] text-slate-400">Switches metric layer & color scale</span>
                </div>
                <div className="p-2.5 rounded bg-slate-900 border border-slate-800 text-slate-300">
                  <span className="text-cyan-400 font-bold block">fly_to_location</span>
                  <span className="text-[10px] text-slate-400">Centers map on target city/block</span>
                </div>
                <div className="p-2.5 rounded bg-slate-900 border border-slate-800 text-slate-300">
                  <span className="text-emerald-400 font-bold block">set_metric_threshold</span>
                  <span className="text-[10px] text-slate-400">Filters blocks by metric range</span>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
