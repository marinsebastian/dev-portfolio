'use client';
import { useState, useEffect } from 'react';
import { Menu, X, FileText, MapPin, Code, Cpu, Mail, Terminal, Globe } from 'lucide-react';
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
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        scrolled
          ? 'bg-[#0b0f17]/95 backdrop-blur-md border-b border-slate-800/80 py-3 shadow-xl'
          : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          
          {/* Logo & Operational Status */}
          <Link href="#overview" className="flex items-center space-x-3 group">
            <div className="w-8 h-8 rounded-md bg-slate-900 border border-teal-500/40 flex items-center justify-center text-teal-400 font-mono-tech font-bold text-sm group-hover:border-teal-400 group-hover:shadow-[0_0_10px_rgba(20,184,166,0.3)] transition-all">
              SM
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold tracking-tight text-slate-100 group-hover:text-teal-400 transition-colors">
                Sebastian Marin
              </span>
              <div className="flex items-center space-x-1.5 font-mono-tech text-[10px] text-slate-400">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>{t('nav.operationalStatus')}</span>
              </div>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center space-x-1 bg-slate-900/80 p-1 rounded-lg border border-slate-800/80 text-xs font-medium">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-slate-300 hover:text-white hover:bg-slate-800/80 transition-colors"
                >
                  <Icon className="w-3.5 h-3.5 text-teal-400/80" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right Action: Language Switcher & Download CV Button */}
          <div className="hidden sm:flex items-center space-x-3">
            
            {/* Language Switcher Pill Toggle (ES default / EN) */}
            <div className="flex items-center p-1 rounded-lg bg-slate-900 border border-slate-800 font-mono-tech text-xs">
              <button
                onClick={() => setLanguage('es')}
                className={`px-2.5 py-1 rounded-md transition-all font-bold ${
                  language === 'es'
                    ? 'bg-teal-500 text-slate-950 shadow-[0_0_10px_rgba(20,184,166,0.3)]'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                ES
              </button>
              <button
                onClick={() => setLanguage('en')}
                className={`px-2.5 py-1 rounded-md transition-all font-bold ${
                  language === 'en'
                    ? 'bg-teal-500 text-slate-950 shadow-[0_0_10px_rgba(20,184,166,0.3)]'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                EN
              </button>
            </div>

            <a
              href="/CV Sebastian Marin.pdf"
              download="CV Sebastian Marin.pdf"
              className="flex items-center space-x-2 px-3.5 py-1.5 rounded-lg bg-teal-500/10 border border-teal-500/40 text-teal-300 hover:bg-teal-500/20 text-xs font-mono-tech font-medium transition-all shadow-sm"
            >
              <FileText className="w-3.5 h-3.5 text-teal-400" />
              <span>{t('nav.downloadCv')}</span>
            </a>
          </div>

          {/* Mobile Menu & Language Toggle */}
          <div className="flex items-center space-x-2 sm:hidden">
            {/* Mobile Language Switcher */}
            <div className="flex items-center p-0.5 rounded-lg bg-slate-900 border border-slate-800 font-mono-tech text-[11px]">
              <button
                onClick={() => setLanguage('es')}
                className={`px-2 py-0.5 rounded ${language === 'es' ? 'bg-teal-500 text-slate-950 font-bold' : 'text-slate-400'}`}
              >
                ES
              </button>
              <button
                onClick={() => setLanguage('en')}
                className={`px-2 py-0.5 rounded ${language === 'en' ? 'bg-teal-500 text-slate-950 font-bold' : 'text-slate-400'}`}
              >
                EN
              </button>
            </div>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-md bg-slate-900 border border-slate-800 text-slate-300 hover:text-white focus:outline-none"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5 text-teal-400" /> : <Menu className="w-5 h-5 text-slate-300" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#0b0f17] border-b border-slate-800 px-4 pt-3 pb-6 space-y-2 mt-2 shadow-2xl">
          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center space-x-3 px-3 py-2.5 rounded-md text-sm text-slate-200 hover:bg-slate-900 hover:text-teal-400 transition-colors border border-transparent hover:border-slate-800"
              >
                <Icon className="w-4 h-4 text-teal-400" />
                <span>{link.label}</span>
              </Link>
            );
          })}
          <div className="pt-2">
            <a
              href="/CV Sebastian Marin.pdf"
              download="CV Sebastian Marin.pdf"
              className="flex items-center justify-center space-x-2 w-full py-2.5 rounded-md bg-teal-500/15 border border-teal-500/40 text-teal-300 text-xs font-mono-tech font-medium"
            >
              <FileText className="w-4 h-4" />
              <span>{t('nav.downloadCv')}</span>
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
