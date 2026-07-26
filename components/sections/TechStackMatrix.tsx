'use client';
import { SectionReveal } from '../motion/SectionReveal';
import { TECH_STACK_GROUPS } from '@/data/portfolioData';
import { Terminal, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export function TechStackMatrix() {
  const { t, language } = useLanguage();

  return (
    <section id="stack" className="py-20 bg-[#0b0f17] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <SectionReveal className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center space-x-2 font-mono-tech text-xs text-teal-400">
            <span className="text-slate-600">//</span>
            <span className="uppercase tracking-widest font-semibold">{t('techStack.tag')}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
            {t('techStack.title')}
          </h2>
          <p className="text-slate-400 text-base leading-relaxed">
            {t('techStack.subtitle')}
          </p>
        </SectionReveal>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
          {TECH_STACK_GROUPS.map((group, idx) => {
            const category = language === 'es' && group.categoryEs ? group.categoryEs : group.category;

            return (
              <SectionReveal key={group.category} delay={idx * 0.1} className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 h-full flex flex-col justify-between space-y-5">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 border-b border-slate-800 pb-3">
                    <div className="p-2 rounded bg-teal-500/10 text-teal-400 shrink-0">
                      <Terminal className="w-5 h-5" />
                    </div>
                    <h3 className="text-lg font-bold text-white tracking-tight">{category}</h3>
                  </div>

                  <div className="space-y-3.5">
                    {group.items.map((item) => {
                      const level = language === 'es' && item.levelEs ? item.levelEs : item.level;
                      const desc = language === 'es' && item.descEs ? item.descEs : item.desc;

                      return (
                        <div key={item.name} className="p-3.5 rounded-lg bg-slate-950/60 border border-slate-800/80 space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-bold text-slate-100 flex items-center space-x-2">
                              <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
                              <span>{item.name}</span>
                            </span>
                            <span className="px-2 py-0.5 rounded bg-slate-800 text-teal-300 font-mono-tech text-[10px] shrink-0 ml-2">
                              {level}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 pl-6 leading-relaxed">{desc}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </SectionReveal>
            );
          })}
        </div>

      </div>
    </section>
  );
}
