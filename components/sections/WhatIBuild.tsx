'use client';
import { useState } from 'react';
import dynamic from 'next/dynamic';
import { SectionReveal } from '../motion/SectionReveal';
import { CAPABILITY_PILLARS } from '@/data/portfolioData';
import { Layout, Server, MapPin, Terminal, CheckCircle2, LucideIcon } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

const ICON_MAP: Record<string, LucideIcon> = {
  Layout,
  Server,
  MapPin,
  Terminal,
};

/** Placeholder sized to each panel so switching pillars does not jump the layout. */
function MicroAppSkeleton() {
  return (
    <div className="flex h-64 w-full items-center justify-center rounded-xl border border-slate-800 bg-[#070a11]">
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-teal-400 border-t-transparent" />
    </div>
  );
}

// Options are inlined rather than shared: the bundler statically analyses this
// call, so it cannot follow a hoisted options object.
const WebTelemetryDashboard = dynamic(() => import('../micro/WebTelemetryDashboard.client'), {
  ssr: false,
  loading: MicroAppSkeleton,
});
const ApiExplorer = dynamic(() => import('../micro/ApiExplorer.client'), {
  ssr: false,
  loading: MicroAppSkeleton,
});
const UserSpatialMiniMap = dynamic(() => import('../micro/UserSpatialMiniMap.client'), {
  ssr: false,
  loading: MicroAppSkeleton,
});
const LinuxTerminalConsole = dynamic(() => import('../micro/LinuxTerminalConsole.client'), {
  ssr: false,
  loading: MicroAppSkeleton,
});

function PillarMicroApp({ pillarId }: { pillarId: string }) {
  switch (pillarId) {
    case 'web-interfaces':
      return <WebTelemetryDashboard />;
    case 'apis-backend':
      return <ApiExplorer />;
    case 'spatial-data':
      return <UserSpatialMiniMap />;
    case 'automation-devops':
      return <LinuxTerminalConsole />;
    default:
      return null;
  }
}

export function WhatIBuild() {
  const { t, language } = useLanguage();
  const [activePillarId, setActivePillarId] = useState(CAPABILITY_PILLARS[0].id);

  const activePillar = CAPABILITY_PILLARS.find((p) => p.id === activePillarId) || CAPABILITY_PILLARS[0];

  return (
    <section className="py-20 bg-[#0b0f17] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <SectionReveal className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center space-x-2 font-mono-tech text-xs text-teal-400">
            <span className="text-slate-600" aria-hidden="true">{'//'}</span>
            <span className="uppercase tracking-widest font-semibold">{t('pillars.tag')}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
            {t('pillars.title')}
          </h2>
          <p className="text-slate-400 text-base leading-relaxed">
            {t('pillars.subtitle')}
          </p>
        </SectionReveal>

        {/* 4 Pillars Grid & Interactive Architecture Preview */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Left Column: 4 Pillar Selection Cards */}
          <div className="lg:col-span-5 flex flex-col space-y-4 h-full">
            {CAPABILITY_PILLARS.map((pillar) => {
              const Icon = ICON_MAP[pillar.iconName] || Layout;
              const isActive = pillar.id === activePillarId;
              const title = language === 'es' ? pillar.titleEs : pillar.title;
              const subtitle = language === 'es' ? pillar.subtitleEs : pillar.subtitle;
              const description = language === 'es' ? pillar.descriptionEs : pillar.description;

              return (
                <button
                  key={pillar.id}
                  onClick={() => setActivePillarId(pillar.id)}
                  className={`w-full text-left p-5 rounded-xl border transition-all duration-200 cursor-pointer flex-1 flex flex-col justify-center ${
                    isActive
                      ? 'bg-slate-900 border-teal-500/80 shadow-[0_0_20px_rgba(20,184,166,0.15)] ring-1 ring-teal-500/50'
                      : 'bg-slate-900/40 border-slate-800 hover:border-slate-700 hover:bg-slate-900/70'
                  }`}
                >
                  <div className="flex items-start space-x-4">
                    <div
                      className={`p-3 rounded-lg border transition-colors shrink-0 ${
                        isActive
                          ? 'bg-teal-500/10 border-teal-500/40 text-teal-400'
                          : 'bg-slate-800/80 border-slate-700/60 text-slate-400'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <h3 className="text-base font-bold text-white tracking-tight">{title}</h3>
                        {isActive && <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />}
                      </div>
                      <p className="text-xs font-mono-tech text-teal-400/90">{subtitle}</p>
                      <p className="text-xs text-slate-400 line-clamp-2 pt-1">{description}</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Right Column: Active Pillar Code & Details Viewer */}
          <div className="lg:col-span-7 h-full">
            <SectionReveal key={activePillar.id} className="h-full flex flex-col justify-between space-y-6 bg-slate-900/90 border border-slate-800 rounded-xl p-6 shadow-2xl">
              
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                  <div>
                    <h3 className="text-xl font-bold text-white">
                      {language === 'es' ? activePillar.titleEs : activePillar.title}
                    </h3>
                    <p className="text-xs text-slate-400 font-mono-tech mt-0.5">
                      {language === 'es' ? activePillar.subtitleEs : activePillar.subtitle}
                    </p>
                  </div>
                  <span className="px-2.5 py-1 rounded bg-teal-500/10 border border-teal-500/40 text-teal-300 font-mono-tech text-xs shrink-0">
                    {t('pillars.verifiedPattern')}
                  </span>
                </div>

                <p className="text-sm text-slate-300 leading-relaxed">
                  {language === 'es' ? activePillar.descriptionEs : activePillar.description}
                </p>

                {/* Tech Stack Tags */}
                <div className="space-y-2">
                  <span className="text-xs font-mono-tech text-slate-400 block">{t('pillars.keyTechnologies')}</span>
                  <div className="flex flex-wrap gap-2">
                    {activePillar.techTags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2.5 py-1 rounded bg-slate-800 text-slate-200 border border-slate-700 text-xs font-mono-tech"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Live micro-app for the active pillar — a working tool rather
                  than a code sample of one. */}
              <div className="space-y-2 pt-2">
                <span className="text-xs font-mono-tech text-slate-400 block">
                  {t('pillars.liveDemo')}
                </span>
                <PillarMicroApp pillarId={activePillar.id} />
              </div>

            </SectionReveal>
          </div>

        </div>

      </div>
    </section>
  );
}
