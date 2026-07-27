'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { TerminalSquare } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

interface Line {
  text: string;
  tone: 'prompt' | 'out' | 'ok' | 'warn' | 'dim';
}

const TONE_CLASS: Record<Line['tone'], string> = {
  prompt: 'text-teal-300',
  out: 'text-slate-300',
  ok: 'text-emerald-400',
  warn: 'text-amber-300',
  dim: 'text-slate-500',
};

/**
 * A replayable transcript of the sync job's operational surface: the crontab
 * entry, a run of the PHP sync script, and container health.
 *
 * The output is a recorded transcript, not live shell access — the label says
 * so. Running arbitrary commands from a browser is the one thing a portfolio
 * terminal must not actually do.
 */
const COMMANDS: { cmd: string; output: Line[] }[] = [
  {
    cmd: 'crontab -l',
    output: [
      { text: '# m h  dom mon dow   command', tone: 'dim' },
      { text: '0 */2 * * * /usr/bin/php /var/www/sync/cron_sync.php >> /var/log/sync.log 2>&1', tone: 'out' },
      { text: '30 3 * * 0 /usr/bin/find /var/log -name "*.log" -mtime +30 -delete', tone: 'out' },
    ],
  },
  {
    cmd: 'php /var/www/sync/cron_sync.php --verbose',
    output: [
      { text: '[sync] curl GET https://api.publicdata.gov/v1/spatial-records', tone: 'out' },
      { text: '[sync] HTTP 200 in 412 ms · 1,420 records decoded', tone: 'out' },
      { text: '[sync] PDO prepared INSERT ... ON DUPLICATE KEY UPDATE', tone: 'out' },
      { text: '[sync] 1,388 updated · 32 inserted · 0 rejected', tone: 'ok' },
      { text: '[sync] done in 1.84s, exit 0', tone: 'ok' },
    ],
  },
  {
    cmd: 'tail -n 3 /var/log/sync.log',
    output: [
      { text: '2026-07-27 02:00:01  OK   1420 records  1.84s', tone: 'out' },
      { text: '2026-07-27 00:00:02  OK   1418 records  1.79s', tone: 'out' },
      { text: '2026-07-26 22:00:01  WARN retry 1/3 upstream 503, recovered', tone: 'warn' },
    ],
  },
  {
    cmd: 'docker ps --format "table {{.Names}}\\t{{.Status}}"',
    output: [
      { text: 'NAMES        STATUS', tone: 'dim' },
      { text: 'web          Up 6 days (healthy)', tone: 'ok' },
      { text: 'database     Up 6 days (healthy)', tone: 'ok' },
      { text: 'sync-worker  Up 6 days', tone: 'out' },
    ],
  },
];

const TYPE_MS = 22;
const LINE_MS = 130;

export default function LinuxTerminalConsole() {
  const { t } = useLanguage();
  const [lines, setLines] = useState<Line[]>([]);
  const [typing, setTyping] = useState('');
  const [running, setRunning] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const cancelRef = useRef(false);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [lines, typing]);

  useEffect(() => {
    return () => {
      cancelRef.current = true;
    };
  }, []);

  const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  const run = useCallback(async () => {
    if (running) return;
    cancelRef.current = false;
    setRunning(true);
    setLines([]);
    setTyping('');

    for (const step of COMMANDS) {
      // Type the command out character by character.
      for (let i = 1; i <= step.cmd.length; i++) {
        if (cancelRef.current) return;
        setTyping(step.cmd.slice(0, i));
        await sleep(TYPE_MS);
      }
      if (cancelRef.current) return;

      setTyping('');
      setLines((prev) => [...prev, { text: `sebastian@geo-node:~$ ${step.cmd}`, tone: 'prompt' }]);
      await sleep(LINE_MS);

      for (const line of step.output) {
        if (cancelRef.current) return;
        setLines((prev) => [...prev, line]);
        await sleep(LINE_MS);
      }
      setLines((prev) => [...prev, { text: '', tone: 'dim' }]);
    }

    if (!cancelRef.current) {
      setLines((prev) => [...prev, { text: 'sebastian@geo-node:~$ ', tone: 'prompt' }]);
      setRunning(false);
    }
  }, [running]);

  return (
    <div className="space-y-3 rounded-xl border border-slate-800 bg-[#070a11] p-4">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2">
        <span className="flex items-center gap-2 font-mono-tech text-[11px] font-bold uppercase text-slate-300">
          <TerminalSquare className="h-3.5 w-3.5 shrink-0 text-teal-400" />
          {t('micro.terminalTitle')}
        </span>
        <button
          type="button"
          onClick={run}
          disabled={running}
          className="min-h-[36px] rounded-lg bg-teal-500 px-3 py-1.5 font-mono-tech text-[11px] font-bold text-slate-950 transition-colors hover:bg-teal-400 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-300"
        >
          {running ? t('micro.terminalRunning') : t('micro.terminalRun')}
        </button>
      </div>

      <div
        ref={scrollRef}
        role="log"
        aria-live="polite"
        aria-label={t('micro.terminalTitle')}
        className="h-56 overflow-y-auto overscroll-contain rounded-lg border border-slate-800 bg-slate-950 p-3 font-mono-tech text-[11px] leading-relaxed"
      >
        {lines.length === 0 && !typing && (
          <p className="text-slate-600">{t('micro.terminalIdle')}</p>
        )}
        {lines.map((line, i) => (
          <div key={i} className={`whitespace-pre-wrap break-words ${TONE_CLASS[line.tone]}`}>
            {line.text || ' '}
          </div>
        ))}
        {typing && (
          <div className="whitespace-pre-wrap break-words text-teal-300">
            sebastian@geo-node:~$ {typing}
            <span className="ml-0.5 inline-block h-3 w-1.5 animate-pulse bg-teal-300 align-middle" />
          </div>
        )}
      </div>

      <p className="font-mono-tech text-[10px] leading-relaxed text-slate-600">
        {t('micro.terminalNote')}
      </p>
    </div>
  );
}
