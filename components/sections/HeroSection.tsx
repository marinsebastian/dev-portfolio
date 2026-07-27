'use client';
import { motion } from 'framer-motion';
import { ArrowRight, FileText, MapPin, Server, Terminal, ShieldCheck, Sparkles, Code2, Database } from 'lucide-react';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';

export function HeroSection() {
  const { t, language } = useLanguage();

  return (
    <section id="overview" className="relative min-h-[90vh] pt-28 pb-16 flex items-center bg-telemetry-grid bg-radial-glow overflow-hidden">
      {/* Background Radial Glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[380px] bg-teal-500/10 blur-[130px] pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Core Positioning Narrative */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Candidate Tag */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-slate-900/90 border border-slate-800 font-mono-tech text-xs text-slate-300 shadow-inner"
            >
              <span className="w-2 h-2 rounded-full bg-teal-400 animate-ping" />
              <span className="text-teal-400 font-semibold">{t('hero.tag')}</span>
            </motion.div>

            {/* Main Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight"
            >
              {t('hero.titleStart')}
              <span className="bg-gradient-to-r from-teal-400 via-cyan-300 to-emerald-400 bg-clip-text text-transparent">
                {t('hero.titleAccent')}
              </span>
            </motion.h1>

            {/* Value Proposition Statement */}
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-slate-300 text-base sm:text-lg leading-relaxed max-w-2xl font-medium"
            >
              {language === 'es' ? t('hero.headlineEs') : t('hero.headlineEn')}
            </motion.p>

            {/* Stack Highlights */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-wrap gap-2 pt-1 font-mono-tech text-xs text-slate-400"
            >
              <span className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center space-x-1.5 text-slate-200">
                <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
                <span>{t('hero.badgeNext')}</span>
              </span>
              <span className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center space-x-1.5 text-slate-200">
                <Server className="w-3.5 h-3.5 text-cyan-400" />
                <span>{t('hero.badgePhp')}</span>
              </span>
              <span className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center space-x-1.5 text-slate-200">
                <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                <span>{t('hero.badgeGis')}</span>
              </span>
              <span className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center space-x-1.5 text-slate-200">
                <Terminal className="w-3.5 h-3.5 text-amber-400" />
                <span>{t('hero.badgeLinux')}</span>
              </span>
            </motion.div>

            {/* Primary Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-wrap items-center gap-4 pt-4"
            >
              <Link
                href="#flagship"
                className="flex items-center space-x-2 px-5 py-3 rounded-lg bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs font-mono-tech transition-all shadow-[0_0_20px_rgba(20,184,166,0.3)] hover:shadow-[0_0_25px_rgba(20,184,166,0.5)]"
              >
                <span>{t('hero.launchGeo')}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="#projects"
                className="flex items-center space-x-2 px-5 py-3 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-medium text-xs font-mono-tech transition-all"
              >
                <span>{t('hero.viewProjects')}</span>
              </Link>
              <a
                href="/CV Sebastian Marin.pdf"
                download="CV Sebastian Marin.pdf"
                className="flex items-center space-x-2 px-4 py-3 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-teal-500/40 text-teal-300 font-mono-tech text-xs transition-all"
              >
                <FileText className="w-4 h-4 text-teal-400" />
                <span>{t('hero.cvPdf')}</span>
              </a>
            </motion.div>

          </div>

          {/* Right Column: Executive Product Summary Card (Designed for CEO/CFO/CTO/Designers) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="lg:col-span-5"
          >
            <div className="rounded-2xl border border-slate-800 bg-[#0f172a]/95 shadow-2xl p-6 space-y-5">
              
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-teal-400" />
                  <span className="font-mono-tech text-xs font-bold text-white tracking-wide">
                    {t('hero.telemetryTitle')}
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono-tech text-[10px] font-bold">
                  {t('hero.telemetryStatus')}
                </span>
              </div>

              {/* High-Impact Executive Highlights */}
              <div className="space-y-3 font-mono-tech text-xs">
                
                <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 flex items-start space-x-3">
                  <Code2 className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-slate-500 text-[10px] block">{t('hero.telemetryDegreeLabel')}</span>
                    <span className="text-slate-100 font-bold">{t('hero.telemetryDegree')}</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 flex items-start space-x-3">
                  <Database className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-slate-500 text-[10px] block">{t('hero.telemetryWorkLabel')}</span>
                    <span className="text-slate-100 font-bold">{t('hero.telemetryWork')}</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 flex items-start space-x-3">
                  <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-slate-500 text-[10px] block">{t('hero.telemetrySpecialtyLabel')}</span>
                    <span className="text-slate-100 font-bold">{t('hero.telemetrySpecialty')}</span>
                  </div>
                </div>

              </div>

              {/* Executive Metrics Bar */}
              <div className="grid grid-cols-2 gap-2 pt-1 font-mono-tech text-[11px]">
                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-center">
                  <span className="text-slate-400 block text-[10px]">{t('hero.telemetryQaLabel')}</span>
                  <span className="text-emerald-400 font-bold">{t('hero.telemetryQaValue')}</span>
                </div>
                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-center">
                  <span className="text-slate-400 block text-[10px]">{t('hero.telemetryDeployLabel')}</span>
                  <span className="text-teal-400 font-bold">{t('hero.telemetryDeployValue')}</span>
                </div>
              </div>

            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
