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
          ? 'bg-[#0b0f17]/95 backdrop-blur-md border-b border-slate-800/80 py-3 shadow-xl'
          : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-10">
          
          {/* Logo */}
          <Link href="#overview" className="flex items-center space-x-3 group whitespace-nowrap shrink-0">
            <div className="w-8 h-8 rounded-md bg-slate-900 border border-teal-500/40 flex items-center justify-center text-teal-400 font-mono-tech font-bold text-sm group-hover:border-teal-400 group-hover:shadow-[0_0_10px_rgba(20,184,166,0.3)] transition-all">
              SM
            </div>
            <span className="text-sm font-semibold tracking-tight text-slate-100 group-hover:text-teal-400 transition-colors">
              Sebastian Marin
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center space-x-1 bg-slate-900/80 p-1 rounded-lg border border-slate-800/80 text-xs font-medium whitespace-nowrap">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-slate-300 hover:text-white hover:bg-slate-800/80 transition-colors whitespace-nowrap"
                >
                  <Icon className="w-3.5 h-3.5 text-teal-400/80 shrink-0" />
                  <span className="whitespace-nowrap">{link.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right actions: language switcher (all widths) + CV download (xl and up) */}
          <div className="flex items-center gap-2 shrink-0">

            <LanguageSwitcher language={language} setLanguage={setLanguage} />

            <a
              href="/CV Sebastian Marin.pdf"
              download="CV Sebastian Marin.pdf"
              className="hidden xl:flex items-center space-x-2 px-3.5 py-2.5 min-h-[44px] rounded-lg bg-teal-500/10 border border-teal-500/40 text-teal-300 hover:bg-teal-500/20 text-xs font-mono-tech font-medium transition-all shadow-sm whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
            >
              <FileText className="w-3.5 h-3.5 text-teal-400 shrink-0" />
              <span>{t('nav.downloadCv')}</span>
            </a>

            {/* Drawer trigger — matches the drawer's own lg breakpoint so tablet
                widths are never left without navigation. */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2.5 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-md bg-slate-900 border border-slate-800 text-slate-300 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-nav-drawer"
            >
              {mobileMenuOpen ? <X className="w-5 h-5 text-teal-400" /> : <Menu className="w-5 h-5 text-slate-300" />}
            </button>
          </div>

        </div>
      </div>

      {/* Navigation drawer (below lg) */}
      {mobileMenuOpen && (
        <div
          id="mobile-nav-drawer"
          className="lg:hidden bg-[#0b0f17] border-b border-slate-800 px-4 pt-3 pb-6 space-y-2 mt-2 shadow-2xl"
        >
          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center space-x-3 px-3 py-3 min-h-[44px] rounded-md text-sm text-slate-200 hover:bg-slate-900 hover:text-teal-400 transition-colors border border-transparent hover:border-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400"
              >
                <Icon className="w-4 h-4 text-teal-400 shrink-0" />
                <span>{link.label}</span>
              </Link>
            );
          })}
          <div className="pt-2">
            <a
              href="/CV Sebastian Marin.pdf"
              download="CV Sebastian Marin.pdf"
              className="flex items-center justify-center space-x-2 w-full py-3 min-h-[44px] rounded-md bg-teal-500/15 border border-teal-500/40 text-teal-300 text-xs font-mono-tech font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400"
            >
              <FileText className="w-4 h-4 shrink-0" />
              <span>{t('nav.downloadCv')}</span>
            </a>
          </div>
        </div>
      )}
    </header>
  );
}

/**
 * ES/EN toggle. Rendered as a labelled group of pressed-state buttons so the
 * active language is announced, not conveyed by background colour alone.
 */
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
          className={`px-3 py-2 min-h-[40px] min-w-[44px] rounded-md transition-all font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 ${
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
