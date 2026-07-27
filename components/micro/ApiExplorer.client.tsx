'use client';

import { useState } from 'react';
import { useReducedMotion } from 'framer-motion';
import { Loader2, Terminal } from 'lucide-react';
import { PlayIcon } from '@animateicons/react/lucide';
import { useIconAnimator } from '@/lib/useIconAnimator';
import { useLanguage } from '@/context/LanguageContext';

interface EndpointSpec {
  id: string;
  name: string;
  method: 'GET' | 'POST';
  path: string;
  /** Editable query string or JSON body, depending on the method. */
  defaultParams: string;
  paramLabel: string;
}

const ENDPOINTS: EndpointSpec[] = [
  { id: 'spatial', name: 'GET /api/spatial (Bolivia Dept GeoJSON)', method: 'GET', path: '/api/spatial', defaultParams: 'dept=CBB', paramLabel: 'query' },
  { id: 'php-sync', name: 'GET /api/php-sync (cURL Microservice Status)', method: 'GET', path: '/api/php-sync', defaultParams: '', paramLabel: 'query' },
  { id: 'geo-ip', name: 'GET /api/geo-ip (Client Location Fallback)', method: 'GET', path: '/api/geo-ip', defaultParams: '', paramLabel: 'query' },
  { id: 'ai-copilot', name: 'GET /api/ai-copilot (Multi-LLM Provider Status)', method: 'GET', path: '/api/ai-copilot', defaultParams: '', paramLabel: 'query' },
  {
    id: 'gemini',
    name: 'POST /api/gemini-assistant (Gemini REST Proxy)',
    method: 'POST',
    path: '/api/gemini-assistant',
    defaultParams: '{\n  "metroArea": "La Paz",\n  "activeLayer": "TECH_CONN",\n  "language": "es"\n}',
    paramLabel: 'body',
  },
];

interface ResponseState {
  status: number;
  ms: number;
  body: string;
  ok: boolean;
}

/**
 * Sends real requests to this site's own API routes and shows the actual
 * response. Nothing here is canned — the status code, latency and body are
 * whatever the endpoint returned just now.
 */
export default function ApiExplorer() {
  const { t } = useLanguage();
  const [endpointId, setEndpointId] = useState(ENDPOINTS[0].id);
  const [params, setParams] = useState(ENDPOINTS[0].defaultParams);
  const [response, setResponse] = useState<ResponseState | null>(null);
  const [loading, setLoading] = useState(false);
  const prefersReducedMotion = useReducedMotion();
  const { ref: sendIconRef, handlers: sendIconHandlers } = useIconAnimator(prefersReducedMotion ?? false);

  const endpoint = ENDPOINTS.find((e) => e.id === endpointId) ?? ENDPOINTS[0];

  const handleEndpointChange = (id: string) => {
    const next = ENDPOINTS.find((e) => e.id === id) ?? ENDPOINTS[0];
    setEndpointId(id);
    setParams(next.defaultParams);
    setResponse(null);
  };

  const send = async () => {
    setLoading(true);
    const started = performance.now();

    try {
      const url = endpoint.method === 'GET' && params.trim()
        ? `${endpoint.path}?${params.trim()}`
        : endpoint.path;

      const res = await fetch(url, {
        method: endpoint.method,
        headers: endpoint.method === 'POST' ? { 'Content-Type': 'application/json' } : undefined,
        body: endpoint.method === 'POST' ? params : undefined,
        cache: 'no-store',
      });

      const text = await res.text();
      let pretty = text;
      try {
        pretty = JSON.stringify(JSON.parse(text), null, 2);
      } catch {
        // Non-JSON response — show it raw.
      }

      setResponse({
        status: res.status,
        ms: Math.round(performance.now() - started),
        body: pretty,
        ok: res.ok,
      });
    } catch (err) {
      setResponse({
        status: 0,
        ms: Math.round(performance.now() - started),
        body: err instanceof Error ? err.message : 'Request failed',
        ok: false,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3 rounded-xl border border-slate-800 bg-[#070a11] p-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <div className="flex items-center gap-2">
          <Terminal className="h-3.5 w-3.5 shrink-0 text-teal-400" />
          <span className="font-mono-tech text-[11px] font-bold uppercase text-slate-300">
            {t('micro.apiTitle')}
          </span>
        </div>
        <span className="text-[10px] font-mono-tech text-teal-400 font-bold uppercase">
          5 ENDPOINTS OPERATIVOS
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span
          className={`shrink-0 rounded px-2 py-1 font-mono-tech text-[10px] font-bold ${
            endpoint.method === 'GET' ? 'bg-emerald-500/15 text-emerald-300' : 'bg-amber-500/15 text-amber-300'
          }`}
        >
          {endpoint.method}
        </span>
        <label className="min-w-[200px] flex-1">
          <span className="sr-only">{t('micro.apiEndpoint')}</span>
          <select
            value={endpointId}
            onChange={(e) => handleEndpointChange(e.target.value)}
            className="min-h-[40px] w-full rounded-lg border border-slate-800 bg-slate-950 px-2.5 py-2 font-mono-tech text-[11px] text-slate-200 focus:border-teal-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-400"
          >
            {ENDPOINTS.map((e) => (
              <option key={e.id} value={e.id}>
                {e.name}
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          onClick={send}
          disabled={loading}
          {...sendIconHandlers}
          className="flex min-h-[40px] shrink-0 items-center gap-1.5 rounded-lg bg-teal-500 px-3.5 py-2 font-mono-tech text-[11px] font-bold text-slate-950 transition-colors hover:bg-teal-400 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-300"
        >
          {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <PlayIcon ref={sendIconRef} size={14} />}
          {t('micro.apiSend')}
        </button>
      </div>

      <label className="block">
        <span className="mb-1 block font-mono-tech text-[10px] uppercase text-slate-500">
          {endpoint.paramLabel}
        </span>
        <textarea
          value={params}
          onChange={(e) => setParams(e.target.value)}
          rows={endpoint.method === 'POST' ? 4 : 1}
          spellCheck={false}
          className="w-full resize-y rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 font-mono-tech text-[11px] text-slate-200 focus:border-teal-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-400"
        />
      </label>

      {response && (
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-3 font-mono-tech text-[10px]">
            <span
              className={`rounded px-2 py-0.5 font-bold ${
                response.ok ? 'bg-emerald-500/15 text-emerald-300' : 'bg-rose-500/15 text-rose-300'
              }`}
            >
              {response.status || 'ERR'}
            </span>
            <span className="text-slate-400">{response.ms} ms</span>
            <span className="text-slate-600">{new Blob([response.body]).size} bytes</span>
          </div>
          <pre className="max-h-52 overflow-auto rounded-lg border border-slate-800 bg-slate-950 p-3 font-mono-tech text-[11px] leading-relaxed text-slate-300">
            {response.body}
          </pre>
        </div>
      )}

      {!response && (
        <p className="font-mono-tech text-[10px] leading-relaxed text-slate-600">{t('micro.apiHint')}</p>
      )}
    </div>
  );
}
