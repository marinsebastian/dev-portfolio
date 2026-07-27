'use client';

import { useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { useReducedMotion } from 'framer-motion';
import { XIcon } from '@animateicons/react/lucide';
import { useIconAnimator } from '@/lib/useIconAnimator';
import { useLanguage } from '@/context/LanguageContext';
import { useGeoConsole } from '@/context/GeoConsoleContext';
import MapCopilot, { LocationBadge } from './MapCopilot.client';

const RealBlockMapWidget = dynamic(() => import('../map/RealBlockMapWidget.client'), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-slate-950 font-mono-tech text-xs text-slate-400">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-teal-400 border-t-transparent" />
    </div>
  ),
});

/**
 * Full-screen map + copilot workspace.
 *
 * Desktop (≥1024px): a 50/50 split, map left, chat right.
 * Mobile: stacked halves, map on top, chat below — each takes half the visible
 * viewport, using `dvh` so the mobile browser's collapsing address bar does not
 * push the composer off screen.
 *
 * The map inside this overlay is a second MapLibre instance, not a moved one:
 * relocating a live canvas across React trees loses WebGL context. Both share
 * the same GeoConsole state, so scope, layer, threshold and selection stay in
 * sync when the overlay closes.
 */
export default function FocusedConsole() {
  const { t } = useLanguage();
  const { focusedMode, setFocusedMode } = useGeoConsole();
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const previouslyFocused = useRef<Element | null>(null);
  const prefersReducedMotion = useReducedMotion();
  const { ref: closeIconRef, handlers: closeIconHandlers } = useIconAnimator(prefersReducedMotion ?? false);

  useEffect(() => {
    if (!focusedMode) return;

    previouslyFocused.current = document.activeElement;
    closeButtonRef.current?.focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setFocusedMode(false);
    };
    document.addEventListener('keydown', onKeyDown);

    // The overlay owns the viewport; let the page behind it stay put.
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
      (previouslyFocused.current as HTMLElement | null)?.focus?.();
    };
  }, [focusedMode, setFocusedMode]);

  if (!focusedMode) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={t('copilot.focusedTitle')}
      data-testid="focused-console"
      className="fixed inset-0 z-[2000] flex flex-col bg-[#0b0f17]"
    >
      <header className="flex shrink-0 items-center justify-between gap-3 border-b border-slate-800 bg-slate-900/90 px-4 py-2.5">
        <div className="flex min-w-0 items-center gap-3">
          <span className="truncate font-mono-tech text-xs font-bold uppercase tracking-wide text-teal-300">
            {t('copilot.focusedTitle')}
          </span>
          <LocationBadge />
        </div>
        <button
          ref={closeButtonRef}
          type="button"
          onClick={() => setFocusedMode(false)}
          aria-label={t('copilot.exitFocused')}
          {...closeIconHandlers}
          className="flex h-11 min-w-[44px] items-center justify-center gap-1.5 rounded-lg border border-slate-700 px-3 font-mono-tech text-xs text-slate-300 transition-colors hover:bg-slate-800 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400"
        >
          <XIcon ref={closeIconRef} size={16} className="shrink-0" />
          <span className="hidden sm:inline">{t('copilot.exitFocused')}</span>
        </button>
      </header>

      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        <div className="h-[calc(50dvh-2rem)] min-h-0 shrink-0 lg:h-auto lg:w-1/2 lg:flex-1">
          <RealBlockMapWidget variant="focused" />
        </div>
        <div className="min-h-0 flex-1 border-t border-slate-800 lg:w-1/2 lg:border-l lg:border-t-0">
          <MapCopilot />
        </div>
      </div>
    </div>
  );
}
