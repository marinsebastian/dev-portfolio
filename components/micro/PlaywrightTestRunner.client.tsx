'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { CheckCircle2, Circle, Loader2, PlayCircle, ShieldCheck } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

type StepState = 'pending' | 'running' | 'passed';

interface TestStep {
  id: string;
  /** Matches a real test name in tests/smoke.spec.ts. */
  titleEs: string;
  titleEn: string;
  /** What the simulated browser viewport shows while this step runs. */
  stage: string;
  ms: number;
}

/**
 * Replays the shape of the real suite in `tests/smoke.spec.ts`. The step names
 * and the final count are kept in sync with that file by
 * `tests/smoke.spec.ts` itself, which asserts the count rendered here.
 */
const STEPS: TestStep[] = [
  { id: 'hero', titleEs: 'Hero renderiza el titular en español', titleEn: 'Hero renders the Spanish headline', stage: 'hero', ms: 620 },
  { id: 'cv', titleEs: 'CV PDF responde 200 en ambas rutas', titleEn: 'CV PDF returns 200 on both paths', stage: 'cv', ms: 340 },
  { id: 'i18n', titleEs: 'Conmutador ES/EN sin cadenas sin traducir', titleEn: 'ES/EN switcher leaves no untranslated strings', stage: 'i18n', ms: 700 },
  { id: 'lang', titleEs: 'Atributo lang sigue al conmutador', titleEn: 'lang attribute follows the toggle', stage: 'i18n', ms: 420 },
  { id: 'tiles', titleEs: 'PMTiles transmite manzanos del Censo 2024', titleEn: 'PMTiles streams 2024 Census blocks', stage: 'map', ms: 1500 },
  { id: 'block', titleEs: 'Clic en manzano muestra hab/ha reales', titleEn: 'Block click shows real hab/ha', stage: 'map', ms: 900 },
  { id: 'zoom', titleEs: 'Vista nacional explica la falta de cobertura', titleEn: 'National view explains missing coverage', stage: 'map', ms: 560 },
  { id: 'api', titleEs: 'Rutas API responden con el contrato esperado', titleEn: 'API routes answer with the expected contract', stage: 'api', ms: 480 },
  { id: 'a11y', titleEs: 'Objetivos táctiles y focus visibles en 360px', titleEn: 'Tap targets and focus visible at 360px', stage: 'mobile', ms: 640 },
  { id: 'og', titleEs: 'Tarjeta OpenGraph responde image/png', titleEn: 'OpenGraph card responds image/png', stage: 'social', ms: 380 },
];

const STAGE_LABEL: Record<string, { es: string; en: string }> = {
  idle: { es: 'en espera', en: 'idle' },
  hero: { es: 'Cargando / …', en: 'Loading / …' },
  cv: { es: 'GET /cv.pdf', en: 'GET /cv.pdf' },
  i18n: { es: 'Alternando ES ⇄ EN', en: 'Toggling ES ⇄ EN' },
  map: { es: 'MapLibre GL + PMTiles', en: 'MapLibre GL + PMTiles' },
  api: { es: 'GET /api/spatial', en: 'GET /api/spatial' },
  mobile: { es: 'Viewport 360 × 800', en: 'Viewport 360 × 800' },
  social: { es: 'GET /opengraph-image', en: 'GET /opengraph-image' },
  done: { es: 'suite completa', en: 'suite complete' },
};

export default function PlaywrightTestRunner() {
  const { t, language } = useLanguage();
  const [states, setStates] = useState<Record<string, StepState>>({});
  const [stage, setStage] = useState('idle');
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState<number | null>(null);
  const cancelRef = useRef(false);

  useEffect(() => {
    return () => {
      cancelRef.current = true;
    };
  }, []);

  const run = useCallback(async () => {
    if (running) return;
    cancelRef.current = false;
    setRunning(true);
    setStates({});
    setElapsed(null);

    const started = performance.now();

    for (const step of STEPS) {
      if (cancelRef.current) return;
      setStage(step.stage);
      setStates((prev) => ({ ...prev, [step.id]: 'running' }));
      await new Promise((resolve) => setTimeout(resolve, step.ms));
      if (cancelRef.current) return;
      setStates((prev) => ({ ...prev, [step.id]: 'passed' }));
    }

    setStage('done');
    setElapsed(Math.round(performance.now() - started) / 1000);
    setRunning(false);
  }, [running]);

  const passed = Object.values(states).filter((s) => s === 'passed').length;
  const stageText = STAGE_LABEL[stage]?.[language === 'es' ? 'es' : 'en'] ?? stage;

  return (
    <div className="space-y-3 rounded-xl border border-slate-800 bg-[#070a11] p-4">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2">
        <span className="flex items-center gap-2 font-mono-tech text-[11px] font-bold uppercase text-slate-300">
          <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-teal-400" />
          {t('runner.title')}
        </span>
        <button
          type="button"
          onClick={run}
          disabled={running}
          data-testid="runner-start"
          className="flex min-h-[36px] items-center gap-1.5 rounded-lg bg-teal-500 px-3 py-1.5 font-mono-tech text-[11px] font-bold text-slate-950 transition-colors hover:bg-teal-400 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-300"
        >
          {running ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <PlayCircle className="h-3.5 w-3.5" />}
          {running ? t('runner.running') : t('runner.run')}
        </button>
      </div>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-5">
        {/* Simulated browser viewport */}
        <div className="lg:col-span-2">
          <div className="overflow-hidden rounded-lg border border-slate-800 bg-slate-950">
            <div className="flex items-center gap-1.5 border-b border-slate-800 bg-slate-900 px-2.5 py-1.5">
              <span className="h-2 w-2 rounded-full bg-rose-500/70" />
              <span className="h-2 w-2 rounded-full bg-amber-500/70" />
              <span className="h-2 w-2 rounded-full bg-emerald-500/70" />
              <span className="ml-2 truncate font-mono-tech text-[9px] text-slate-500">
                chromium · localhost:3000
              </span>
            </div>
            <div className="flex h-32 flex-col items-center justify-center gap-2 px-3">
              {running ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin text-teal-400" />
                  <span className="text-center font-mono-tech text-[10px] text-slate-400">{stageText}</span>
                </>
              ) : (
                <span className="text-center font-mono-tech text-[10px] text-slate-600">{stageText}</span>
              )}
            </div>
          </div>
        </div>

        {/* Test log */}
        <div className="lg:col-span-3">
          <div
            role="log"
            aria-live="polite"
            className="h-[164px] space-y-1 overflow-y-auto overscroll-contain rounded-lg border border-slate-800 bg-slate-950 p-2.5 font-mono-tech text-[10px]"
          >
            {STEPS.map((step) => {
              const state = states[step.id] ?? 'pending';
              return (
                <div
                  key={step.id}
                  className={`flex items-start gap-1.5 ${
                    state === 'passed'
                      ? 'text-emerald-400'
                      : state === 'running'
                        ? 'text-teal-300'
                        : 'text-slate-600'
                  }`}
                >
                  {state === 'passed' ? (
                    <CheckCircle2 className="mt-px h-3 w-3 shrink-0" />
                  ) : state === 'running' ? (
                    <Loader2 className="mt-px h-3 w-3 shrink-0 animate-spin" />
                  ) : (
                    <Circle className="mt-px h-3 w-3 shrink-0" />
                  )}
                  <span className="leading-relaxed">{language === 'es' ? step.titleEs : step.titleEn}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-slate-800 pt-2 font-mono-tech text-[10px]">
        <span data-testid="runner-progress" className={passed === STEPS.length ? 'text-emerald-400' : 'text-slate-400'}>
          {passed} / {STEPS.length} {t('runner.passed')}
        </span>
        {elapsed !== null && <span className="text-slate-500">{elapsed.toFixed(1)}s</span>}
        <span className="text-slate-600">{t('runner.note')}</span>
      </div>
    </div>
  );
}

export const PLAYWRIGHT_RUNNER_STEP_COUNT = STEPS.length;
