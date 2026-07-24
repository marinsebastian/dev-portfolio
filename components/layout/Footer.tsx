import { Terminal, Shield, MapPin, Heart } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-[#05080e] border-t border-slate-800/80 py-10 font-mono-tech text-xs text-slate-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          
          <div className="flex items-center space-x-3">
            <div className="w-6 h-6 rounded bg-slate-900 border border-teal-500/40 flex items-center justify-center text-teal-400 font-bold text-xs">
              SM
            </div>
            <div>
              <span className="text-slate-200 font-semibold">Sebastian Marin</span>
              <span className="text-slate-600 mx-2">|</span>
              <span className="text-slate-400">Operational Engineering Console v1.0</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-[11px] text-slate-400">
            <span>Built with Next.js 14, TypeScript, Tailwind CSS, Leaflet & Framer Motion</span>
          </div>

          <div className="flex items-center space-x-2 text-[11px] text-slate-500">
            <MapPin className="w-3.5 h-3.5 text-teal-400" />
            <span>Cochabamba, Bolivia</span>
          </div>

        </div>
      </div>
    </footer>
  );
}
