'use client';
import { useState } from 'react';
import dynamic from 'next/dynamic';
import { SectionReveal } from '../motion/SectionReveal';
import { CASE_STUDIES } from '@/data/portfolioData';
import { CodeBlock } from '../ui/CodeBlock';
import { GithubIcon } from '../ui/GithubIcon';
import { ShoppingBag, Calendar, Server, MapPin, CheckCircle2, ArrowUpRight, ExternalLink, Lock, LucideIcon } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

const VoronoiLabClient = dynamic(() => import('../map/VoronoiLab.client'), {
  ssr: false,
  loading: () => (
    <div className="h-[360px] w-full bg-slate-900 rounded-xl flex items-center justify-center font-mono-tech text-xs text-slate-400">
      Loading Voronoi Spatial Engine...
    </div>
  ),
});

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  commercial: ShoppingBag,
  operational: Calendar,
  backend: Server,
  'spatial-lab': MapPin,
};

export function CaseStudiesSection() {
  const { t, language } = useLanguage();
  const supportingStudies = CASE_STUDIES.filter((c) => c.category !== 'flagship');
  const [activeStudyId, setActiveStudyId] = useState(supportingStudies[0].id);

  const activeStudy = supportingStudies.find((s) => s.id === activeStudyId) || supportingStudies[0];

  const title = language === 'es' && activeStudy.titleEs ? activeStudy.titleEs : activeStudy.title;
  const subtitle = language === 'es' && activeStudy.subtitleEs ? activeStudy.subtitleEs : activeStudy.subtitle;
  const badge = language === 'es' && activeStudy.badgeEs ? activeStudy.badgeEs : activeStudy.badge;
  const problem = language === 'es' && activeStudy.problemEs ? activeStudy.problemEs : activeStudy.problem;
  const solution = language === 'es' && activeStudy.solutionEs ? activeStudy.solutionEs : activeStudy.solution;
  const proofPoints = language === 'es' && activeStudy.proofPointsEs ? activeStudy.proofPointsEs : activeStudy.proofPoints;
  const geolabsRelevance = language === 'es' && activeStudy.geolabsRelevanceEs ? activeStudy.geolabsRelevanceEs : activeStudy.geolabsRelevance;
  const availabilityNote = language === 'es' && activeStudy.availabilityNoteEs ? activeStudy.availabilityNoteEs : activeStudy.availabilityNote;

  return (
    <section id="projects" className="py-20 bg-[#090d14] relative border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <SectionReveal className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center space-x-2 font-mono-tech text-xs text-teal-400">
            <span className="text-slate-600" aria-hidden="true">{'//'}</span>
            <span className="uppercase tracking-widest font-semibold">{t('caseStudies.tag')}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
            {t('caseStudies.title')}
          </h2>
          <p className="text-slate-400 text-base leading-relaxed">
            {t('caseStudies.subtitle')}
          </p>
        </SectionReveal>

        {/* Case Study Tab Navigation */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {supportingStudies.map((study) => {
            const Icon = CATEGORY_ICONS[study.category] || Server;
            const isActive = study.id === activeStudyId;
            const tabTitle = language === 'es' && study.titleEs ? study.titleEs : study.title;

            return (
              <button
                key={study.id}
                onClick={() => setActiveStudyId(study.id)}
                className={`flex items-center space-x-2 px-4 py-2.5 rounded-lg border text-xs font-mono-tech transition-all cursor-pointer ${
                  isActive
                    ? 'bg-teal-500/15 border-teal-500 text-teal-300 font-bold shadow-[0_0_15px_rgba(20,184,166,0.2)]'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                }`}
              >
                <Icon className="w-4 h-4 text-teal-400 shrink-0" />
                <span>{tabTitle}</span>
              </button>
            );
          })}
        </div>

        {/* Active Case Study Detail Card */}
        <SectionReveal key={activeStudy.id} className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-8">
          
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-800 pb-6 gap-4">
            <div className="space-y-1">
              <span className="px-2.5 py-1 rounded bg-slate-800 text-teal-400 border border-slate-700 text-xs font-mono-tech">
                {badge}
              </span>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-white pt-2">{title}</h3>
              <p className="text-slate-400 text-sm font-mono-tech">{subtitle}</p>
            </div>

            {/* Metrics pills if present */}
            {activeStudy.metrics && (
              <div className="flex flex-wrap gap-2">
                {activeStudy.metrics.map((m, i) => {
                  const mLabel = language === 'es' && m.labelEs ? m.labelEs : m.label;
                  return (
                    <div key={i} className="px-3 py-1.5 rounded bg-slate-950/80 border border-slate-800 font-mono-tech text-xs">
                      <span className="text-slate-500 block text-[10px]">{mLabel}</span>
                      <span className="text-teal-300 font-bold">{m.value}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Problem & Solution Grid with equal height stretch */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
            <div className="p-5 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-2 h-full flex flex-col justify-start">
              <h4 className="text-xs font-bold font-mono-tech uppercase text-rose-400 flex items-center space-x-1.5">
                <span>{t('caseStudies.problemTitle')}</span>
              </h4>
              <p className="text-sm text-slate-300 leading-relaxed pt-1">{problem}</p>
            </div>

            <div className="p-5 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-2 h-full flex flex-col justify-start">
              <h4 className="text-xs font-bold font-mono-tech uppercase text-emerald-400 flex items-center space-x-1.5">
                <span>{t('caseStudies.solutionTitle')}</span>
              </h4>
              <p className="text-sm text-slate-300 leading-relaxed pt-1">{solution}</p>
            </div>
          </div>

          {/* Where to see it: real links where they exist, an explicit note where they don't */}
          {(activeStudy.liveDemoUrl || activeStudy.githubUrl || availabilityNote) && (
            <div className="flex flex-wrap items-center gap-3 p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
              {activeStudy.liveDemoUrl && (
                <a
                  href={activeStudy.liveDemoUrl}
                  className="flex items-center gap-2 px-3.5 py-2 min-h-[40px] rounded-lg bg-teal-500/15 border border-teal-500/40 text-teal-300 hover:bg-teal-500/25 text-xs font-mono-tech font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400"
                >
                  <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                  <span>{language === 'es' ? 'Ver en vivo' : 'View live'}</span>
                </a>
              )}
              {activeStudy.githubUrl && (
                <a
                  href={activeStudy.githubUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 px-3.5 py-2 min-h-[40px] rounded-lg bg-slate-900 border border-slate-700 text-slate-200 hover:border-slate-600 text-xs font-mono-tech transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400"
                >
                  <GithubIcon className="w-3.5 h-3.5 shrink-0" />
                  <span>{language === 'es' ? 'Repositorio' : 'Repository'}</span>
                </a>
              )}
              {availabilityNote && (
                <p className="flex items-start gap-2 text-[11px] text-slate-400 leading-relaxed flex-1 min-w-[220px]">
                  <Lock className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-px" />
                  <span>{availabilityNote}</span>
                </p>
              )}
            </div>
          )}

          {/* Tech Stack Pills */}
          <div className="space-y-2">
            <span className="text-xs font-mono-tech text-slate-400 block">{t('caseStudies.stackTitle')}</span>
            <div className="flex flex-wrap gap-2">
              {activeStudy.techStack.map((tech) => (
                <span key={tech} className="px-3 py-1 rounded bg-slate-800 text-slate-200 border border-slate-700 text-xs font-mono-tech">
                  {tech}
                </span>
              ))}
            </div>
          </div>

          {/* Key Proof Bullet Points */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold font-mono-tech text-slate-300 uppercase">{t('caseStudies.proofTitle')}</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-stretch">
              {proofPoints.map((point, idx) => (
                <div key={idx} className="flex items-start space-x-2.5 p-3 rounded bg-slate-950/40 border border-slate-800 text-xs text-slate-300 h-full">
                  <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{point}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Interactive Feature Demo OR Code Snippet */}
          {activeStudy.id === 'voronoi-coverage-lab' ? (
            <div className="pt-2">
              <VoronoiLabClient />
            </div>
          ) : activeStudy.codeSnippet ? (
            <div className="space-y-2 pt-2">
              <span className="text-xs font-mono-tech text-slate-400 block">{t('caseStudies.codeSampleTitle')}</span>
              <CodeBlock
                filename={activeStudy.codeSnippet.filename}
                language={activeStudy.codeSnippet.language}
                code={activeStudy.codeSnippet.code}
              />
            </div>
          ) : null}

          {/* Relevance for target hiring team */}
          <div className="p-4 rounded-xl bg-teal-500/10 border border-teal-500/30 font-mono-tech text-xs text-slate-200 flex items-start space-x-3">
            <ArrowUpRight className="w-5 h-5 text-teal-400 shrink-0 mt-0.5" />
            <div>
              <span className="text-teal-400 font-bold block mb-1">{t('caseStudies.relevanceTitle')}</span>
              <p className="text-slate-300 text-xs leading-relaxed font-sans">{geolabsRelevance}</p>
            </div>
          </div>

        </SectionReveal>

      </div>
    </section>
  );
}
