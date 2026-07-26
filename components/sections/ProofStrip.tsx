'use client';
import { SectionReveal } from '../motion/SectionReveal';
import { useLanguage } from '@/context/LanguageContext';

const TECH_ITEMS = [
  { name: 'Next.js 16 App Router', category: 'Frontend' },
  { name: 'TypeScript', category: 'Core' },
  { name: 'PHP 8 (PDO / cURL)', category: 'Backend' },
  { name: 'MySQL & PostgreSQL', category: 'SQL Data' },
  { name: 'Leaflet Spatial Maps', category: 'GIS' },
  { name: 'Linux CLI & Cron', category: 'Automation' },
  { name: 'Docker Compose', category: 'DevOps' },
  { name: 'Gemini API Proxy', category: 'AI Integration' },
  { name: 'Playwright QA', category: 'Testing' },
];

export function ProofStrip() {
  const { t } = useLanguage();

  return (
    <section className="py-6 bg-[#090d14] border-y border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionReveal>
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-2 font-mono-tech text-xs text-slate-400 shrink-0">
              <span className="w-2 h-2 rounded-full bg-teal-400" />
              <span className="uppercase tracking-widest text-slate-300 font-semibold">{t('proofStrip.title')}</span>
            </div>

            <div className="flex flex-wrap items-center justify-center md:justify-end gap-2 text-xs font-mono-tech">
              {TECH_ITEMS.map((item) => (
                <span
                  key={item.name}
                  className="px-3 py-1 rounded bg-slate-900 border border-slate-800 text-slate-300 hover:border-teal-500/50 hover:text-teal-300 transition-all cursor-default"
                >
                  <span className="text-slate-500 mr-1.5 font-normal">[{item.category}]</span>
                  <span className="font-semibold text-slate-200">{item.name}</span>
                </span>
              ))}
            </div>
          </div>
        </SectionReveal>
      </div>
    </section>
  );
}
