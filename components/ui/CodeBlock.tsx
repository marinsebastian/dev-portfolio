'use client';
import { useState } from 'react';
import { Check, Copy, Terminal } from 'lucide-react';

interface CodeBlockProps {
  filename?: string;
  language?: string;
  code: string;
}

export function CodeBlock({ filename, language = 'text', code }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-lg border border-slate-800 bg-[#070a11] overflow-hidden font-mono-tech text-xs shadow-xl">
      {filename && (
        <div className="flex items-center justify-between px-4 py-2 bg-slate-900/80 border-b border-slate-800 text-slate-400">
          <div className="flex items-center space-x-2">
            <Terminal className="w-3.5 h-3.5 text-teal-400" />
            <span className="text-slate-300 font-medium">{filename}</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 uppercase">{language}</span>
          </div>
          <button
            onClick={handleCopy}
            className="flex items-center space-x-1 hover:text-slate-200 transition-colors p-1 rounded hover:bg-slate-800"
            title="Copy code"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span className="text-[11px]">{copied ? 'Copied!' : 'Copy'}</span>
          </button>
        </div>
      )}
      <div className="p-4 overflow-x-auto text-slate-300 leading-relaxed max-h-[360px] scrollbar-thin">
        <pre>
          <code>{code}</code>
        </pre>
      </div>
    </div>
  );
}
