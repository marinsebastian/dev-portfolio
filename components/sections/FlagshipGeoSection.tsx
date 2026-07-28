'use client';

import dynamic from 'next/dynamic';
import { SectionReveal } from '../motion/SectionReveal';
import { CASE_STUDIES } from '@/data/portfolioData';
import { MapPin, Database, Server, CheckCircle2, Globe } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import MapCopilot, { LocationBadge } from '../ai/MapCopilot.client';

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

  const flagshipData = CASE_STUDIES.find((c) => c.id === 'geoinsights-bolivia')!;

  // The data file carries both languages; the ES variants were previously unused.
  const proofPoints =
    language === 'es' && flagshipData.proofPointsEs ? flagshipData.proofPointsEs : flagshipData.proofPoints;
  const geolabsRelevance =
    language === 'es' && flagshipData.geolabsRelevanceEs
      ? flagshipData.geolabsRelevanceEs
      : flagshipData.geolabsRelevance;

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

        {/* Main Console Grid: Map Viewer & AI Copilot — both columns stretch
            to the row's height (the taller of the two) instead of
            top-aligning at their own natural heights, so the map canvas and
            the chat panel each grow/shrink to close the gap rather than
            leaving one column visibly shorter than the other.

            The right column used to show a live-metrics/inspector card and a
            zone comparison chart. Those are hidden for now in favor of the
            AI copilot inline, right where a visitor already is — the same
            selected-block detail they showed is available via the map's own
            tooltip, so nothing that card said is otherwise lost. This is a
            separate MapCopilot instance from the one inside Focused Mode
            (opened via the map's IA button): each keeps its own chat
            history, so a conversation started here doesn't carry over to
            that full-screen view, and vice versa. */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          <div className="lg:col-span-7 h-full">
            <RealBlockMapWidgetClient />
          </div>

          <div className="lg:col-span-5 h-full min-h-[480px] overflow-hidden rounded-xl border border-slate-800 shadow-xl">
            <MapCopilot />
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
