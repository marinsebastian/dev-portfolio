'use client';

import { useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { motion, useReducedMotion } from 'framer-motion';
import { XIcon } from '@animateicons/react/lucide';
import { useIconAnimator } from '@/lib/useIconAnimator';
import { useLanguage } from '@/context/LanguageContext';
import { useGeoConsole } from '@/context/GeoConsoleContext';
import { LocationBadge } from './MapCopilot.client';
import { COCKPIT_SLOT_ID } from './CopilotSurface.client';

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
 *
 * The chat half is *not* rendered here. `CopilotSurface` owns the only
 * copilot instance and flies it into the slot this leaves for it, so the
 * conversation survives the trip between the inline teaser and this overlay.
 */
export default function FocusedConsole() {
  const { t } = useLanguage();
  const { focusedMode, setFocusedMode, focusedOrigin } = useGeoConsole();
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const previouslyFocused = useRef<Element | null>(null);
  const prefersReducedMotion = useReducedMotion();
  const { ref: closeIconRef, handlers: closeIconHandlers } = useIconAnimator(prefersReducedMotion ?? false);

  useEffect(() => {
    if (!focusedMode) return;

    previouslyFocused.current = document.activeElement;
    // A teaser handoff fires while the visitor is still in the composer,
    // having just pressed Enter. Grabbing focus for the close button here
    // would yank it straight back out of the input they are using.
    if (focusedOrigin !== 'teaser') closeButtonRef.current?.focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setFocusedMode(false);
    };
    document.addEventListener('keydown', onKeyDown);

    // The overlay owns the viewport; let the page behind it stay put.
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // `aria-modal` is only advice to assistive tech; the page behind stays in
    // the tab order regardless. Marking it inert is what actually takes it out
    // of reach — including the flagship section, which is where the copilot
    // was a moment ago and must not still be tabbable from.
    const main = document.querySelector('main');
    main?.setAttribute('inert', '');

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
      main?.removeAttribute('inert');
      (previouslyFocused.current as HTMLElement | null)?.focus?.();
    };
  }, [focusedMode, focusedOrigin, setFocusedMode]);

  if (!focusedMode) return null;

  return (
    /* The backdrop fades rather than cutting in. The copilot flies from the
       teaser into this overlay at the same moment, and it is a dark panel on a
       dark background — against an instant cut there is nothing to perceive
       that motion against, so the handoff reads as a hard jump even though it
       is animating. Letting the page behind stay briefly visible gives the
       flight something to move over. */
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-label={t('copilot.focusedTitle')}
      data-testid="focused-console"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: prefersReducedMotion ? 0 : 0.22, ease: 'easeOut' }}
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
        {/* Anchor only: CopilotSurface measures this and flies the live
            copilot into it. Left empty on purpose. */}
        <div id={COCKPIT_SLOT_ID} className="flex min-h-0 flex-1 p-2 lg:w-1/2" />
      </div>
    </motion.div>
  );
}
