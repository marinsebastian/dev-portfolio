'use client';
import { useState, useEffect } from 'react';
import { Menu, X, FileText, MapPin, Code, Cpu, Mail, Terminal } from 'lucide-react';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { language, setLanguage, t } = useLanguage();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: t('nav.overview'), href: '#overview', icon: Cpu },
    { label: t('nav.flagship'), href: '#flagship', icon: MapPin },
    { label: t('nav.projects'), href: '#projects', icon: Code },
    { label: t('nav.stack'), href: '#stack', icon: Terminal },
    { label: t('nav.cv'), href: '#cv', icon: FileText },
    { label: t('nav.contact'), href: '#contact', icon: Mail },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-[1000] transition-all duration-300 ${
        scrolled
          ? 'bg-[#0b0f17]/95 backdrop-blur-md border-b border-slate-800/80 py-3 shadow-2xl'
          : 'bg-transparent py-4'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-11">
          
          {/* Main Name & Irrefutable Title Branding */}
          <Link href="#overview" className="flex items-center space-x-3 group min-w-0 flex-1">
            <div className="w-9 h-9 rounded-lg bg-slate-900 border border-teal-500/50 flex items-center justify-center text-teal-400 font-mono-tech font-extrabold text-sm shrink-0 group-hover:border-teal-400 group-hover:shadow-[0_0_15px_rgba(20,184,166,0.4)] transition-all">
              SM
            </div>
            <div className="flex flex-col min-w-0">
              <span className="truncate text-base sm:text-lg font-extrabold tracking-tight text-white group-hover:text-teal-400 transition-colors leading-none">
                Sebastian Marin
              </span>
              <span className="truncate text-[10px] font-mono-tech text-teal-400/90 font-semibold tracking-wide mt-0.5">
                {language === 'es' ? 'Ingeniero de Sistemas | Full-Stack' : 'Systems Engineer | Full-Stack'}
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links (Icon-focused, smoothly expands text on hover) */}
          <nav className="hidden lg:flex items-center space-x-1.5 bg-slate-900/90 p-1.5 rounded-xl border border-slate-800/90 text-xs font-medium">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="group relative flex items-center space-x-0 hover:space-x-2 px-3 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800/90 border border-transparent hover:border-teal-500/40 transition-all duration-300 ease-out overflow-hidden"
                >
                  <Icon className="w-4 h-4 text-teal-400 shrink-0 group-hover:scale-110 transition-transform duration-300" />
                  <span className="max-w-0 opacity-0 group-hover:max-w-xs group-hover:opacity-100 transition-all duration-300 ease-out whitespace-nowrap text-xs font-semibold">
                    {link.label}
                  </span>
                </Link>
              );
            })}
          </nav>

          {/* Right Actions: Language Switcher & CV Download */}
          <div className="flex items-center gap-2.5 shrink-0">
            <LanguageSwitcher language={language} setLanguage={setLanguage} />

            <a
              href="/CV Sebastian Marin.pdf"
              download="CV Sebastian Marin.pdf"
              className="hidden sm:flex items-center space-x-2 px-3.5 py-2 min-h-[40px] rounded-lg bg-teal-500/10 border border-teal-500/40 text-teal-300 hover:bg-teal-500/20 text-xs font-mono-tech font-bold transition-all shadow-sm whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400"
            >
              <FileText className="w-3.5 h-3.5 text-teal-400 shrink-0" />
              <span>{t('nav.downloadCv')}</span>
            </a>

            {/* Mobile Drawer Trigger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2.5 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400"
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-5 h-5 text-teal-400" /> : <Menu className="w-5 h-5 text-slate-300" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div
          id="mobile-nav-drawer"
          className="lg:hidden bg-[#0b0f17]/98 backdrop-blur-xl border-b border-slate-800 px-4 pt-4 pb-6 space-y-2 mt-2 shadow-2xl animate-fade-in"
        >
          <div className="pb-2 border-b border-slate-800/80 mb-2">
            <span className="text-xs font-mono-tech text-teal-400 font-bold block uppercase tracking-wider">
              Sebastian Marin
            </span>
            <span className="text-[11px] font-mono-tech text-slate-400">
              {language === 'es' ? 'Ingeniero de Sistemas | Full-Stack' : 'Systems Engineer | Full-Stack'}
            </span>
          </div>

          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center space-x-3 px-3.5 py-3 min-h-[44px] rounded-lg text-sm text-slate-200 hover:bg-slate-900 hover:text-teal-400 transition-colors border border-transparent hover:border-slate-800 font-medium"
              >
                <Icon className="w-4 h-4 text-teal-400 shrink-0" />
                <span>{link.label}</span>
              </Link>
            );
          })}
          <div className="pt-3">
            <a
              href="/CV Sebastian Marin.pdf"
              download="CV Sebastian Marin.pdf"
              className="flex items-center justify-center space-x-2 w-full py-3 min-h-[44px] rounded-lg bg-teal-500/20 border border-teal-500/50 text-teal-300 text-xs font-mono-tech font-bold"
            >
              <FileText className="w-4 h-4 shrink-0 text-teal-400" />
              <span>{t('nav.downloadCv')}</span>
            </a>
          </div>
        </div>
      )}
    </header>
  );
}

function LanguageSwitcher({
  language,
  setLanguage,
}: {
  language: 'es' | 'en';
  setLanguage: (lang: 'es' | 'en') => void;
}) {
  return (
    <div
      role="group"
      aria-label="Idioma del sitio / Site language"
      className="flex items-center p-1 rounded-lg bg-slate-900 border border-slate-800 font-mono-tech text-xs"
    >
      {(['es', 'en'] as const).map((code) => (
        <button
          key={code}
          type="button"
          onClick={() => setLanguage(code)}
          aria-pressed={language === code}
          aria-label={code === 'es' ? 'Español' : 'English'}
          className={`px-2.5 py-1.5 min-h-[36px] min-w-[40px] rounded-md transition-all font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 ${
            language === code
              ? 'bg-teal-500 text-slate-950 shadow-[0_0_10px_rgba(20,184,166,0.3)]'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          {code.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
