'use client';
import { SectionReveal } from '../motion/SectionReveal';
import { TECH_STACK_GROUPS } from '@/data/portfolioData';
import { Cpu, Terminal, CheckCircle2 } from 'lucide-react';

export function TechStackMatrix() {
  return (
    <section id="stack" className="py-20 bg-[#0b0f17] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <SectionReveal className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center space-x-2 font-mono-tech text-xs text-teal-400">
            <span className="text-slate-600">//</span>
            <span className="uppercase tracking-widest font-semibold">TECHNICAL MATRIX</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
            Engineering Tooling & Stack Experience
          </h2>
          <p className="text-slate-400 text-base leading-relaxed">
            Honest, verified breakdown of tech proficiency across frontend, backend, databases, Linux administration, and spatial AI.
          </p>
        </SectionReveal>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {TECH_STACK_GROUPS.map((group, idx) => (
            <SectionReveal key={group.category} delay={idx * 0.1} className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-5">
              <div className="flex items-center space-x-3 border-b border-slate-800 pb-3">
                <div className="p-2 rounded bg-teal-500/10 text-teal-400">
                  <Terminal className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-white tracking-tight">{group.category}</h3>
              </div>

              <div className="space-y-4">
                {group.items.map((item) => (
                  <div key={item.name} className="p-3.5 rounded-lg bg-slate-950/60 border border-slate-800/80 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-slate-100 flex items-center space-x-2">
                        <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
                        <span>{item.name}</span>
                      </span>
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-teal-300 font-mono-tech text-[10px]">
                        {item.level}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 pl-6 leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>
            </SectionReveal>
          ))}
        </div>

      </div>
    </section>
  );
}
