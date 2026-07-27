'use client';

import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import { Activity, MousePointerClick, Timer, Gauge } from 'lucide-react';
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useLanguage } from '@/context/LanguageContext';

interface Sample {
  t: number;
  fps: number;
}

interface NavTiming {
  ttfb: number;
  domReady: number;
}

/**
 * Navigation Timing never changes after load, so the snapshot is memoised at
 * module level: `useSyncExternalStore` requires getSnapshot to return a stable
 * reference or it will loop.
 */
let navTimingSnapshot: NavTiming | null | undefined;

function getNavTiming(): NavTiming | null {
  if (navTimingSnapshot !== undefined) return navTimingSnapshot;

  const [nav] = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
  navTimingSnapshot = nav
    ? {
        ttfb: Math.round(nav.responseStart - nav.requestStart),
        domReady: Math.round(nav.domContentLoadedEventEnd - nav.startTime),
      }
    : null;
  return navTimingSnapshot;
}

function getServerNavTiming(): NavTiming | null {
  return null;
}

/** The value is immutable, so there is nothing to subscribe to. */
function subscribeNoop(): () => void {
  return () => {};
}

/**
 * Live telemetry for the page you are currently on.
 *
 * Everything here is measured in the browser rather than mocked: frame rate
 * comes from rAF deltas, load timings from the Navigation Timing API, and the
 * API latency figure from an actual round trip to /api/spatial.
 */
const globalTelemetryState = {
  clicks: 0,
  seconds: 0,
};

export default function WebTelemetryDashboard() {
  const { t, language } = useLanguage();

  const [fps, setFps] = useState(0);
  const [samples, setSamples] = useState<Sample[]>([]);
  const [clicks, setClicks] = useState(globalTelemetryState.clicks);
  const [seconds, setSeconds] = useState(globalTelemetryState.seconds);
  const [latency, setLatency] = useState<number | null>(null);

  // Navigation timings are fixed for the life of the page, so they are read
  // once through an external-store snapshot rather than pushed into state by an
  // effect. The server snapshot is null, which is also what the client renders
  // before hydration completes.
  const navTiming = useSyncExternalStore(subscribeNoop, getNavTiming, getServerNavTiming);
  const ttfb = navTiming?.ttfb ?? null;
  const domReady = navTiming?.domReady ?? null;

  const frameCount = useRef(0);
  const lastTick = useRef(0);

  // Frame rate, sampled once a second from requestAnimationFrame deltas.
  useEffect(() => {
    let raf = 0;
    lastTick.current = performance.now();

    const loop = (now: number) => {
      frameCount.current += 1;
      const elapsed = now - lastTick.current;

      if (elapsed >= 1000) {
        const measured = Math.round((frameCount.current * 1000) / elapsed);
        setFps(measured);
        setSamples((prev) => [...prev.slice(-29), { t: prev.length, fps: measured }]);
        frameCount.current = 0;
        lastTick.current = now;
      }
      raf = requestAnimationFrame(loop);
    };

    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  // Session timer and click counter (synced globally so state persists across tab mounts)
  useEffect(() => {
    const timer = setInterval(() => {
      globalTelemetryState.seconds += 1;
      setSeconds(globalTelemetryState.seconds);
    }, 1000);
    const onClick = () => {
      globalTelemetryState.clicks += 1;
      setClicks(globalTelemetryState.clicks);
    };
    window.addEventListener('click', onClick);
    return () => {
      clearInterval(timer);
      window.removeEventListener('click', onClick);
    };
  }, []);

  // Measured round trip to a real endpoint, refreshed periodically.
  useEffect(() => {
    let cancelled = false;

    const measure = async () => {
      const started = performance.now();
      try {
        await fetch('/api/spatial?dept=CBB', { cache: 'no-store' });
        if (!cancelled) setLatency(Math.round(performance.now() - started));
      } catch {
        if (!cancelled) setLatency(null);
      }
    };

    void measure();
    const interval = setInterval(measure, 15_000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  const uptime = useMemo(() => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }, [seconds]);

  const tiles = [
    { icon: Gauge, label: t('micro.telemetryFps'), value: `${fps}`, unit: 'fps', tone: 'text-emerald-400' },
    { icon: Timer, label: t('micro.telemetrySession'), value: uptime, unit: '', tone: 'text-teal-300' },
    {
      icon: MousePointerClick,
      label: t('micro.telemetryClicks'),
      value: `${clicks}`,
      unit: '',
      tone: 'text-cyan-300',
    },
    {
      icon: Activity,
      label: t('micro.telemetryLatency'),
      value: latency === null ? '—' : `${latency}`,
      unit: latency === null ? '' : 'ms',
      tone: 'text-amber-300',
    },
  ];

  return (
    <div className="space-y-3 rounded-xl border border-slate-800 bg-[#070a11] p-4">
      <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-2">
        <span className="flex items-center gap-2 font-mono-tech text-[11px] font-bold uppercase text-slate-300">
          <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
          {t('micro.telemetryTitle')}
        </span>
        <span className="font-mono-tech text-[10px] text-slate-500">{t('micro.telemetryLive')}</span>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {tiles.map((tile) => {
          const Icon = tile.icon;
          return (
            <div key={tile.label} className="rounded-lg border border-slate-800 bg-slate-950/60 p-2.5">
              <span className="flex items-center gap-1.5 font-mono-tech text-[9px] uppercase text-slate-500">
                <Icon className="h-3 w-3 shrink-0" />
                <span className="truncate">{tile.label}</span>
              </span>
              <span className={`font-mono-tech text-lg font-bold ${tile.tone}`}>
                {tile.value}
                <span className="ml-0.5 text-[10px] font-normal text-slate-500">{tile.unit}</span>
              </span>
            </div>
          );
        })}
      </div>

      <div className="h-24 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={samples} margin={{ top: 4, right: 4, bottom: 0, left: -28 }}>
            <defs>
              <linearGradient id="fpsFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#14b8a6" stopOpacity={0.5} />
                <stop offset="100%" stopColor="#14b8a6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="t" hide />
            <YAxis domain={[0, 70]} stroke="#475569" fontSize={9} tickLine={false} axisLine={false} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#0f172a',
                borderColor: '#334155',
                borderRadius: 6,
                fontSize: 11,
                fontFamily: 'monospace',
              }}
              labelFormatter={() => (language === 'es' ? 'Muestra' : 'Sample')}
            />
            <Area type="monotone" dataKey="fps" stroke="#14b8a6" strokeWidth={1.5} fill="url(#fpsFill)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="flex flex-wrap gap-x-4 gap-y-1 border-t border-slate-800 pt-2 font-mono-tech text-[10px] text-slate-500">
        <span>
          TTFB: <strong className="text-slate-300">{ttfb === null ? '—' : `${ttfb} ms`}</strong>
        </span>
        <span>
          DOM ready: <strong className="text-slate-300">{domReady === null ? '—' : `${domReady} ms`}</strong>
        </span>
        <span className="text-slate-600">{t('micro.telemetryNote')}</span>
      </div>
    </div>
  );
}
