'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { MapPin, ShieldCheck, X, Loader2 } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useGeoConsole } from '@/context/GeoConsoleContext';
import {
  locationFromIp,
  locationFromPosition,
  lookupIpLocation,
  nearestScope,
  readStoredConsent,
  requestBrowserLocation,
  scopeForDepartment,
  storeConsent,
} from '@/lib/geolocation';

type Phase = 'hidden' | 'asking' | 'locating';

/**
 * Location consent modal.
 *
 * Precise coordinates never leave the browser: a GPS fix is turned into a
 * department by comparing it against three local metro anchors, and the IP
 * fallback is proxied through our own route so no third party sees the
 * visitor's address next to this site's referrer.
 */
export default function GeolocationConsent() {
  const { t } = useLanguage();
  const { setUserLocation, setActiveScope } = useGeoConsole();
  const [phase, setPhase] = useState<Phase>('hidden');
  const [error, setError] = useState<string | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const primaryRef = useRef<HTMLButtonElement>(null);

  const applyIpFallback = useCallback(async () => {
    const result = await lookupIpLocation();
    if (!result) return false;

    const location = locationFromIp(result);
    setUserLocation(location);

    if (result.inBolivia) {
      const scope = scopeForDepartment(result.department) ?? nearestScope(result.lat, result.lng);
      setActiveScope(scope);
    }
    return true;
  }, [setActiveScope, setUserLocation]);

  // Re-apply a previous decision silently; only a first-time visitor is asked.
  useEffect(() => {
    const stored = readStoredConsent();

    if (stored === 'declined') return;

    if (stored === 'granted' || stored === 'ip-only') {
      void (async () => {
        if (stored === 'granted') {
          try {
            const position = await requestBrowserLocation(8000);
            const location = locationFromPosition(position);
            setUserLocation(location);
            setActiveScope(nearestScope(location.lat, location.lng));
            return;
          } catch {
            // Permission was revoked since last visit — fall through to IP.
          }
        }
        await applyIpFallback();
      })();
      return;
    }

    // First visit: let the page settle before interrupting.
    const timer = setTimeout(() => setPhase('asking'), 2500);
    return () => clearTimeout(timer);
  }, [applyIpFallback, setActiveScope, setUserLocation]);


  const handleAllow = async () => {
    setPhase('locating');
    setError(null);

    try {
      const position = await requestBrowserLocation();
      const location = locationFromPosition(position);
      setUserLocation(location);
      setActiveScope(nearestScope(location.lat, location.lng));
      storeConsent('granted');
      setPhase('hidden');
      return;
    } catch {
      // Denied, unavailable, or timed out — try the coarse fallback before
      // giving up, and tell the user which one ended up being used.
    }

    const ok = await applyIpFallback();
    storeConsent(ok ? 'ip-only' : 'declined');
    if (!ok) setError(t('geo.errorFallback'));
    setPhase(ok ? 'hidden' : 'asking');
  };

  const handleApproximate = async () => {
    setPhase('locating');
    setError(null);
    const ok = await applyIpFallback();
    storeConsent(ok ? 'ip-only' : 'declined');
    if (!ok) setError(t('geo.errorFallback'));
    setPhase(ok ? 'hidden' : 'asking');
  };

  const handleDismiss = useCallback(() => {
    storeConsent('declined');
    setPhase('hidden');
  }, []);

  // Escape closes the prompt and records the decision, same as the X button.
  useEffect(() => {
    if (phase !== 'asking') return;
    primaryRef.current?.focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleDismiss();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [phase, handleDismiss]);

  if (phase === 'hidden') return null;

  return (
    <div className="fixed inset-0 z-[1500] flex items-end justify-center p-4 sm:items-center">
      <div
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
        onClick={handleDismiss}
        aria-hidden="true"
      />

      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="geo-consent-title"
        aria-describedby="geo-consent-body"
        data-testid="geo-consent"
        className="relative w-full max-w-md rounded-2xl border border-slate-700/60 bg-slate-900/80 p-6 shadow-[0_0_50px_rgba(20,184,166,0.15)] backdrop-blur-xl"
      >
        <button
          type="button"
          onClick={handleDismiss}
          aria-label={t('geo.dismiss')}
          className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-800 hover:text-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-teal-500/40 bg-teal-500/10">
            <MapPin className="h-5 w-5 text-teal-400" />
          </div>
          <h2 id="geo-consent-title" className="text-base font-bold tracking-tight text-white">
            {t('geo.title')}
          </h2>
        </div>

        <p id="geo-consent-body" className="mb-4 text-sm leading-relaxed text-slate-300">
          {t('geo.body')}
        </p>

        <p className="mb-5 flex items-start gap-2 font-mono-tech text-[11px] leading-relaxed text-slate-500">
          <ShieldCheck className="mt-px h-3.5 w-3.5 shrink-0 text-teal-500/70" />
          <span>{t('geo.privacy')}</span>
        </p>

        {error && (
          <p className="mb-4 rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-xs text-amber-200">
            {error}
          </p>
        )}

        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            ref={primaryRef}
            type="button"
            onClick={handleAllow}
            disabled={phase === 'locating'}
            className="flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-lg bg-teal-500 px-4 py-2.5 font-mono-tech text-xs font-bold text-slate-950 transition-colors hover:bg-teal-400 disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
          >
            {phase === 'locating' && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            {t('geo.allow')}
          </button>
          <button
            type="button"
            onClick={handleApproximate}
            disabled={phase === 'locating'}
            className="min-h-[44px] flex-1 rounded-lg border border-slate-700 px-4 py-2.5 font-mono-tech text-xs text-slate-300 transition-colors hover:bg-slate-800 hover:text-white disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400"
          >
            {t('geo.approximate')}
          </button>
        </div>
      </div>
    </div>
  );
}
