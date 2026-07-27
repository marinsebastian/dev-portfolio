'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useReducedMotion } from 'framer-motion';
import { RotateCcw, Bot, Cpu, MapPin } from 'lucide-react';
import { SendIcon, SparklesIcon } from '@animateicons/react/lucide';
import { useIconAnimator } from '@/lib/useIconAnimator';
import { useLanguage } from '@/context/LanguageContext';
import { useGeoConsole } from '@/context/GeoConsoleContext';
import { LAYER_DESCRIPTIONS } from '@/lib/copilotTools';
import { layerUnit } from '@/components/map/RealBlockMapWidget.client';
import type { LayerCode, ScopeType } from '@/data/mauForondaCensusData';
import type { ProviderId } from '@/lib/aiProviders';
import { useCopilotChat } from './useCopilotChat';

interface AvailableProvider {
  id: ProviderId;
  label: string;
  model: string;
}

const SUGGESTION_SEEDS_ES = [
  'Analizar mi barrio',
  'Ver áreas con fibra > 80%',
  'Cambiar a densidad poblacional',
  '¿Qué muestra este manzano?',
];

const SUGGESTION_SEEDS_EN = [
  'Analyse my neighbourhood',
  'Show areas with fibre > 80%',
  'Switch to population density',
  'What does this block show?',
];

export default function MapCopilot() {
  const { t, language } = useLanguage();
  const {
    activeScope,
    setActiveScope,
    activeLayer,
    setActiveLayer,
    threshold,
    setThreshold,
    selectedBlock,
    userLocation,
    getMapController,
  } = useGeoConsole();

  const [providers, setProviders] = useState<AvailableProvider[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<ProviderId | null>(null);
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const { ref: sendIconRef, handlers: sendIconHandlers } = useIconAnimator(prefersReducedMotion ?? false);

  // Which providers actually have a key server-side. Rendering only working
  // options avoids offering the user a provider that will fail on click.
  useEffect(() => {
    let cancelled = false;
    fetch('/api/ai-copilot')
      .then((res) => res.json())
      .then((data: { available?: AvailableProvider[] }) => {
        if (cancelled) return;
        const available = data.available ?? [];
        setProviders(available);
        setSelectedProvider((current) => current ?? available[0]?.id ?? null);
      })
      .catch(() => {
        /* Selector stays empty; the copilot reports the misconfiguration on send. */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  /**
   * Tools run here rather than server-side: the map instance, its rendered
   * features and the user's location all live in this browser, so a round trip
   * would double latency to read state we already hold.
   */
  const executeTool = useCallback(
    (name: string, args: Record<string, unknown>): unknown => {
      const controller = getMapController();

      switch (name) {
        case 'set_map_layer': {
          const layer = args.layer as LayerCode;
          if (!LAYER_DESCRIPTIONS[layer]) return { error: `Unknown layer: ${String(args.layer)}` };
          setActiveLayer(layer);
          return { ok: true, layer, description: LAYER_DESCRIPTIONS[layer] };
        }

        case 'set_map_scope': {
          const scope = args.scope as ScopeType;
          const valid: ScopeType[] = ['Nacional', 'Santa Cruz', 'Cochabamba', 'La Paz'];
          if (!valid.includes(scope)) return { error: `Unknown scope: ${String(args.scope)}` };
          setActiveScope(scope);
          return {
            ok: true,
            scope,
            note:
              scope === 'Nacional'
                ? 'The national view sits below zoom 8, where the archive has no block geometry.'
                : undefined,
          };
        }

        case 'fly_to_location': {
          const lat = Number(args.lat);
          const lng = Number(args.lng);
          if (!Number.isFinite(lat) || !Number.isFinite(lng)) return { error: 'lat and lng must be numbers.' };
          const zoom = Number.isFinite(Number(args.zoom)) ? Number(args.zoom) : 13;
          controller?.flyTo(lat, lng, Math.min(16, Math.max(8, zoom)));
          return { ok: true, lat, lng, zoom, label: args.label ?? null };
        }

        case 'set_metric_threshold': {
          const rawMin = Number(args.min);
          if (!Number.isFinite(rawMin)) return { error: 'min must be a number.' };
          const rawMax = Number.isFinite(Number(args.max)) ? Number(args.max) : null;

          // Models frequently pass a coverage threshold as the raw 0–1 field
          // value ("0.8") instead of the percentage the user said ("80%").
          // Both readings are unambiguous here, so normalise rather than
          // rendering a filter that dims the entire city.
          const { unitLabel } = layerUnit(activeLayer);
          const asPercent = unitLabel === '%';
          const scale = asPercent && rawMin <= 1 && (rawMax === null || rawMax <= 1) ? 100 : 1;

          const min = Math.round(rawMin * scale);
          const max = rawMax === null ? null : Math.round(rawMax * scale);

          setThreshold({ min, max });
          return { ok: true, min, max, unit: unitLabel, layer: activeLayer, normalized: scale !== 1 };
        }

        case 'clear_metric_threshold': {
          setThreshold(null);
          return { ok: true };
        }

        case 'get_map_state': {
          const center = controller?.getCenter() ?? { lat: 0, lng: 0 };
          const zoom = controller?.getZoom() ?? 0;
          return {
            scope: activeScope,
            layer: activeLayer,
            layerDescription: LAYER_DESCRIPTIONS[activeLayer],
            unit: layerUnit(activeLayer).unitLabel,
            center: { lat: Number(center.lat.toFixed(5)), lng: Number(center.lng.toFixed(5)) },
            zoom: Number(zoom.toFixed(2)),
            blocksRendered: controller?.getRenderedBlockCount() ?? 0,
            blocksBelowDataZoom: zoom < 8,
            threshold,
          };
        }

        case 'get_selected_block': {
          if (!selectedBlock) return null;
          return {
            coordinates: selectedBlock.lngLat,
            populationInhabitants: selectedBlock.population,
            densityInhabitantsPerHectare: selectedBlock.densityPerHa,
            internetCoveragePercent: selectedBlock.internetPct,
            pipedWaterCoveragePercent: selectedBlock.waterPct,
            higherEducationPercent: selectedBlock.educationPct,
          };
        }

        case 'get_user_location': {
          if (!userLocation) return null;
          return {
            lat: Number(userLocation.lat.toFixed(5)),
            lng: Number(userLocation.lng.toFixed(5)),
            department: userLocation.department,
            city: userLocation.city,
            source: userLocation.source,
            accuracyMeters: userLocation.accuracyM,
          };
        }

        case 'get_visible_block_stats': {
          const stats = controller?.getVisibleStats();
          if (!stats) return { count: 0, note: 'No census blocks are rendered at this zoom.' };
          return { ...stats, unit: layerUnit(activeLayer).unitLabel, layer: activeLayer };
        }

        default:
          return { error: `Unknown tool: ${name}` };
      }
    },
    [
      activeLayer,
      activeScope,
      getMapController,
      selectedBlock,
      setActiveLayer,
      setActiveScope,
      setThreshold,
      threshold,
      userLocation,
    ]
  );

  const { messages, streamingText, isStreaming, suggestions, activeProvider, send, reset } =
    useCopilotChat(executeTool, language);

  // Keep the newest message in view as it streams.
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, streamingText]);

  const seeds = language === 'es' ? SUGGESTION_SEEDS_ES : SUGGESTION_SEEDS_EN;
  const chips = suggestions.length > 0 ? suggestions : messages.length === 0 ? seeds : [];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const text = input;
    setInput('');
    void send(text, selectedProvider);
  };

  const providerBadge = useMemo(() => {
    const match = providers.find((p) => p.id === (activeProvider ?? selectedProvider));
    return match ?? null;
  }, [providers, activeProvider, selectedProvider]);

  return (
    <div className="flex h-full flex-col bg-slate-950/60 font-sans">
      {/* Header: provider selector + reset */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 bg-slate-900/80 px-3 py-2.5">
        <div className="flex items-center gap-2 min-w-0">
          <Bot className="h-4 w-4 shrink-0 text-teal-400" />
          <span className="truncate font-mono-tech text-xs font-bold uppercase text-slate-200">
            {t('copilot.title')}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {providers.length > 0 ? (
            <label className="flex items-center gap-1.5">
              <span className="sr-only">{t('copilot.providerLabel')}</span>
              <Cpu className="h-3.5 w-3.5 shrink-0 text-slate-400" />
              <select
                value={selectedProvider ?? ''}
                onChange={(e) => setSelectedProvider(e.target.value as ProviderId)}
                aria-label={t('copilot.providerLabel')}
                className="min-h-[36px] rounded-lg border border-slate-700 bg-slate-950 px-2 py-1 font-mono-tech text-[11px] text-slate-200 focus:border-teal-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-400"
              >
                {providers.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.label}
                  </option>
                ))}
              </select>
            </label>
          ) : (
            <span className="rounded border border-slate-700 px-2 py-1 font-mono-tech text-[10px] text-slate-400">
              {t('copilot.noProvider')}
            </span>
          )}

          {messages.length > 0 && (
            <button
              type="button"
              onClick={reset}
              aria-label={t('copilot.reset')}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-700 text-slate-400 transition-colors hover:bg-slate-800 hover:text-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Message list. overscroll-contain stops chat scrolling from bleeding
          into the page once the list hits its end. */}
      <div
        ref={scrollRef}
        className="flex-1 space-y-3 overflow-y-auto overscroll-contain px-3 py-4"
      >
        {messages.length === 0 && !isStreaming && (
          <div className="space-y-3 rounded-xl border border-slate-800 bg-slate-900/60 p-4">
            <p className="text-sm leading-relaxed text-slate-300">{t('copilot.intro')}</p>
            <p className="font-mono-tech text-[11px] leading-relaxed text-slate-500">
              {t('copilot.introTools')}
            </p>
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={message.role === 'user' ? 'flex justify-end' : 'flex justify-start'}
          >
            <div
              className={`max-w-[88%] rounded-xl px-3.5 py-2.5 text-sm leading-relaxed ${
                message.role === 'user'
                  ? 'bg-teal-500/15 text-teal-50 border border-teal-500/30'
                  : message.error
                    ? 'border border-amber-500/40 bg-amber-500/10 text-amber-100'
                    : 'border border-slate-800 bg-slate-900 text-slate-200'
              }`}
            >
              <p className="whitespace-pre-line">{message.content}</p>

              {(message.actions?.length || message.provider) && (
                <div className="mt-2 flex flex-wrap items-center gap-1.5 border-t border-slate-800 pt-2">
                  {message.actions?.map((action) => (
                    <span
                      key={action}
                      className="rounded bg-slate-800 px-1.5 py-0.5 font-mono-tech text-[10px] text-teal-300"
                    >
                      {action}()
                    </span>
                  ))}
                  {message.provider && (
                    <span className="ml-auto font-mono-tech text-[10px] text-slate-500">
                      {message.provider}
                      {message.model ? ` · ${message.model}` : ''}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}

        {isStreaming && (
          <div className="flex justify-start">
            {/* Kept on its own non-flex element: a flex bubble turns streamed
                multi-paragraph text into a broken multi-column layout. */}
            <div className="max-w-[88%] rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2.5 text-sm leading-relaxed text-slate-200">
              {streamingText ? (
                <p className="whitespace-pre-line">{streamingText}</p>
              ) : (
                <span className="inline-flex items-center gap-1.5 font-mono-tech text-xs text-slate-400">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-teal-400" />
                  {t('copilot.thinking')}
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Suggestion chips */}
      {chips.length > 0 && !isStreaming && (
        <div className="flex flex-wrap gap-1.5 border-t border-slate-800 px-3 py-2">
          {chips.map((chip) => (
            <button
              key={chip}
              type="button"
              onClick={() => void send(chip, selectedProvider)}
              className="rounded-full border border-teal-500/40 bg-teal-500/10 px-3 py-2 text-[11px] text-teal-200 transition-colors hover:bg-teal-500/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400"
            >
              {chip}
            </button>
          ))}
        </div>
      )}

      {/* Composer */}
      <form onSubmit={handleSubmit} className="flex items-center gap-2 border-t border-slate-800 bg-slate-900/80 p-3">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={t('copilot.placeholder')}
          aria-label={t('copilot.placeholder')}
          disabled={isStreaming}
          className="min-h-[44px] flex-1 rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-600 focus:border-teal-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={isStreaming || !input.trim()}
          aria-label={t('copilot.send')}
          {...sendIconHandlers}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-teal-500 text-slate-950 transition-colors hover:bg-teal-400 disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-300"
        >
          <SendIcon ref={sendIconRef} size={16} />
        </button>
      </form>

      {providerBadge && (
        <div className="border-t border-slate-800 px-3 py-1.5 font-mono-tech text-[10px] text-slate-500">
          {providerBadge.label} · {providerBadge.model}
        </div>
      )}
    </div>
  );
}

/**
 * Trigger button with the rotating conic-gradient border. The gradient lives on
 * a `::before` pseudo-element driven by an `@property`-registered angle so the
 * browser can animate it on the compositor instead of repainting a background.
 */
export function CopilotTrigger({ onClick }: { onClick: () => void }) {
  const prefersReducedMotion = useReducedMotion();
  const { ref: sparklesRef, handlers: sparklesHandlers } = useIconAnimator(prefersReducedMotion ?? false);
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Abrir Copiloto IA del mapa"
      {...sparklesHandlers}
      className="apple-intelligence-glow-btn group uppercase tracking-wider text-xs font-extrabold text-white"
    >
      <SparklesIcon ref={sparklesRef} size={16} className="shrink-0 text-teal-300" />
      <span className="font-extrabold text-teal-300 group-hover:text-white transition-colors">IA</span>
    </button>
  );
}

/** Small badge showing where the user's location came from. */
export function LocationBadge() {
  const { t } = useLanguage();
  const { userLocation } = useGeoConsole();
  if (!userLocation) return null;

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-700 bg-slate-900/80 px-2.5 py-1 font-mono-tech text-[10px] text-slate-300">
      <MapPin className="h-3 w-3 shrink-0 text-teal-400" />
      {userLocation.city ?? userLocation.department ?? t('geo.unknownPlace')} ·{' '}
      {userLocation.source === 'gps' ? t('geo.sourceGps') : t('geo.sourceIp')}
    </span>
  );
}
