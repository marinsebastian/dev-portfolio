'use client';
import { useState } from 'react';
import { SectionReveal } from '../motion/SectionReveal';
import { CAPABILITY_PILLARS } from '@/data/portfolioData';
import { CodeBlock } from '../ui/CodeBlock';
import { Layout, Server, MapPin, Terminal, CheckCircle2 } from 'lucide-react';

const ICON_MAP: Record<string, any> = {
  Layout,
  Server,
  MapPin,
  Terminal,
};

export function WhatIBuild() {
  const [activePillarId, setActivePillarId] = useState(CAPABILITY_PILLARS[0].id);

  const activePillar = CAPABILITY_PILLARS.find((p) => p.id === activePillarId) || CAPABILITY_PILLARS[0];

  return (
    <section className="py-20 bg-[#0b0f17] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <SectionReveal className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center space-x-2 font-mono-tech text-xs text-teal-400">
            <span className="text-slate-600">//</span>
            <span className="uppercase tracking-widest font-semibold">CAPABILITIES & PILLARS</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
            What I Build: Operational Systems Architecture
          </h2>
          <p className="text-slate-400 text-base leading-relaxed">
            I don&apos;t just code static web pages. I architect operational interfaces, backend API services, spatial data visualizers, and automation scripts.
          </p>
        </SectionReveal>

        {/* 4 Pillars Grid & Interactive Architecture Preview */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: 4 Pillar Selection Cards */}
          <div className="lg:col-span-5 space-y-4">
            {CAPABILITY_PILLARS.map((pillar) => {
              const Icon = ICON_MAP[pillar.iconName] || Layout;
              const isActive = pillar.id === activePillarId;

              return (
                <button
                  key={pillar.id}
                  onClick={() => setActivePillarId(pillar.id)}
                  className={`w-full text-left p-5 rounded-xl border transition-all duration-200 cursor-pointer ${
                    isActive
                      ? 'bg-slate-900 border-teal-500/80 shadow-[0_0_20px_rgba(20,184,166,0.15)] ring-1 ring-teal-500/50'
                      : 'bg-slate-900/40 border-slate-800 hover:border-slate-700 hover:bg-slate-900/70'
                  }`}
                >
                  <div className="flex items-start space-x-4">
                    <div
                      className={`p-3 rounded-lg border transition-colors ${
                        isActive
                          ? 'bg-teal-500/10 border-teal-500/40 text-teal-400'
                          : 'bg-slate-800/80 border-slate-700/60 text-slate-400'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <h3 className="text-base font-bold text-white tracking-tight">{pillar.title}</h3>
                        {isActive && <CheckCircle2 className="w-4 h-4 text-teal-400" />}
                      </div>
                      <p className="text-xs font-mono-tech text-teal-400/90">{pillar.subtitle}</p>
                      <p className="text-xs text-slate-400 line-clamp-2 pt-1">{pillar.description}</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Right Column: Active Pillar Code & Details Viewer */}
          <div className="lg:col-span-7">
            <SectionReveal key={activePillar.id} className="space-y-6 bg-slate-900/90 border border-slate-800 rounded-xl p-6 shadow-2xl">
              
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div>
                  <h3 className="text-xl font-bold text-white">{activePillar.title}</h3>
                  <p className="text-xs text-slate-400 font-mono-tech mt-0.5">{activePillar.titleEs}</p>
                </div>
                <span className="px-2.5 py-1 rounded bg-teal-500/10 border border-teal-500/40 text-teal-300 font-mono-tech text-xs">
                  VERIFIED PATTERN
                </span>
              </div>

              <p className="text-sm text-slate-300 leading-relaxed">
                {activePillar.description}
              </p>

              {/* Tech Stack Tags */}
              <div className="space-y-2">
                <span className="text-xs font-mono-tech text-slate-400 block">KEY TECHNOLOGIES:</span>
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

              {/* Code Snippet Preview */}
              <div className="space-y-2 pt-2">
                <span className="text-xs font-mono-tech text-slate-400 block">IMPLEMENTATION SAMPLE:</span>
                <CodeBlock
                  filename={`${activePillar.id}_implementation.ts`}
                  language="typescript"
                  code={activePillar.highlightSnippet}
                />
              </div>

            </SectionReveal>
          </div>

        </div>

      </div>
    </section>
  );
}
