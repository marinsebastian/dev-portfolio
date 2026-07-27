'use client';
import { useState } from 'react';
import dynamic from 'next/dynamic';
import { useReducedMotion } from 'framer-motion';
import { SectionReveal } from '../motion/SectionReveal';
import { CheckCircle2 } from 'lucide-react';
import { TerminalIcon } from '@animateicons/react/lucide';
import { useIconAnimator } from '@/lib/useIconAnimator';
import { useLanguage } from '@/context/LanguageContext';

function WorkflowModuleButton({
  isActive,
  onClick,
  title,
  subtitle,
  prefersReducedMotion,
  index,
}: {
  isActive: boolean;
  onClick: () => void;
  title: string;
  subtitle: string;
  prefersReducedMotion: boolean;
  index: number;
}) {
  const { ref, handlers } = useIconAnimator(prefersReducedMotion, index * 350);
  return (
    <button
      type="button"
      onClick={onClick}
      {...handlers}
      className={`w-full text-left p-4.5 rounded-xl border transition-all ${
        isActive
          ? 'bg-slate-900 border-teal-500 text-teal-300 font-bold shadow-lg'
          : 'bg-slate-900/40 border-slate-800 text-slate-400 hover:bg-slate-900 hover:text-slate-200'
      }`}
    >
      <div className="flex items-center space-x-3 font-mono-tech text-xs">
        <TerminalIcon ref={ref} size={18} className="text-teal-400 shrink-0" />
        <div>
          <div className="text-slate-100 font-bold text-sm">{title}</div>
          <div className="text-xs text-slate-400 mt-0.5">{subtitle}</div>
        </div>
      </div>
    </button>
  );
}

const PlaywrightTestRunner = dynamic(() => import('../micro/PlaywrightTestRunner.client'), {
  ssr: false,
  loading: () => (
    <div className="flex h-64 w-full items-center justify-center rounded-xl border border-slate-800 bg-[#070a11]">
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-teal-400 border-t-transparent" />
    </div>
  ),
});

const LinuxTerminalConsole = dynamic(() => import('../micro/LinuxTerminalConsole.client'), {
  ssr: false,
  loading: () => (
    <div className="flex h-64 w-full items-center justify-center rounded-xl border border-slate-800 bg-[#070a11]">
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-teal-400 border-t-transparent" />
    </div>
  ),
});

export function WorkflowQASection() {
  const { t, language } = useLanguage();

  const WORKFLOW_MODULES = [
    {
      id: 'playwright',
      title: 'Playwright E2E Smoke Tests',
      subtitle: language === 'es' ? 'Ejecución Live de Pruebas Automatizadas' : 'Live Automated QA Execution',
    },
    {
      id: 'php-cron',
      title: 'PHP & Linux Cron Automation',
      subtitle: language === 'es' ? 'Consola CLI de Sincronización cURL & PDO' : 'cURL & PDO Sync CLI Console',
    },
  ];

  const [activeModuleId, setActiveModuleId] = useState(WORKFLOW_MODULES[0].id);
  const prefersReducedMotion = useReducedMotion();

  return (
    <section className="py-20 bg-[#070a11] relative border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <SectionReveal className="text-center max-w-3xl mx-auto mb-14 space-y-4">
          <div className="inline-flex items-center space-x-2 font-mono-tech text-xs text-teal-400">
            <span className="text-slate-600" aria-hidden="true">{'//'}</span>
            <span className="uppercase tracking-widest font-semibold">{t('workflow.tag')}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
            {t('workflow.title')}
          </h2>
          <p className="text-slate-400 text-base leading-relaxed">
            {t('workflow.subtitle')}
          </p>
        </SectionReveal>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Module Switcher Tabs */}
          <div className="lg:col-span-4 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              {WORKFLOW_MODULES.map((mod, index) => (
                <WorkflowModuleButton
                  key={mod.id}
                  isActive={mod.id === activeModuleId}
                  onClick={() => setActiveModuleId(mod.id)}
                  title={mod.title}
                  subtitle={mod.subtitle}
                  prefersReducedMotion={prefersReducedMotion ?? false}
                  index={index}
                />
              ))}
            </div>

            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 font-mono-tech text-xs text-slate-300 space-y-2 mt-auto">
              <div className="flex items-center space-x-2 text-emerald-400 font-bold">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{t('workflow.qaVerified')}</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
                {t('workflow.qaNote')}
              </p>
            </div>
          </div>

          {/* Active Interactive Micro-App Console */}
          <div className="lg:col-span-8 h-full space-y-4">
            {activeModuleId === 'playwright' ? (
              <PlaywrightTestRunner />
            ) : (
              <LinuxTerminalConsole />
            )}
          </div>

        </div>

      </div>
    </section>
  );
}
