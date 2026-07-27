'use client';
import { useEffect, useRef, useState } from 'react';
import { SectionReveal } from '../motion/SectionReveal';
import { SEBASTIAN_CV_DATA } from '@/data/cvData';
import { GithubIcon } from '../ui/GithubIcon';
import ObfuscatedPhone from '../ui/ObfuscatedPhone.client';
import {
  FileText,
  Download,
  Eye,
  User,
  Briefcase,
  GraduationCap,
  Award,
  Mail,
  MapPin,
  CheckCircle2,
  X,
  Check,
  LucideIcon
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

type CvTab = 'profile' | 'experience' | 'skills' | 'education';

export function InteractiveCVSection() {
  const { t, language } = useLanguage();
  const [activeTab, setActiveTab] = useState<CvTab>('profile');
  const [pdfModalOpen, setPdfModalOpen] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const previewButtonRef = useRef<HTMLButtonElement>(null);

  const cv = SEBASTIAN_CV_DATA;

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(cv.personal.email);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  // Escape closes the PDF dialog and focus returns to the trigger that opened it.
  useEffect(() => {
    if (!pdfModalOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setPdfModalOpen(false);
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [pdfModalOpen]);

  useEffect(() => {
    if (!pdfModalOpen) previewButtonRef.current?.focus();
  }, [pdfModalOpen]);

  return (
    <section id="cv" className="py-20 bg-[#0b0f17] relative border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <SectionReveal className="text-center max-w-3xl mx-auto mb-12 space-y-4">
          <div className="inline-flex items-center space-x-2 font-mono-tech text-xs text-teal-400">
            <span className="text-slate-600" aria-hidden="true">{'//'}</span>
            <span className="uppercase tracking-widest font-semibold">{t('cv.tag')}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
            {t('cv.title')}
          </h2>
          <p className="text-slate-400 text-base leading-relaxed">
            {t('cv.subtitle')}
          </p>

          {/* Action Bar for PDF & Quick Contact */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2 font-mono-tech text-xs">
            <button
              ref={previewButtonRef}
              type="button"
              onClick={() => setPdfModalOpen(true)}
              className="flex items-center space-x-2 px-4 py-2.5 min-h-[44px] rounded-lg bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold transition-all shadow-[0_0_15px_rgba(20,184,166,0.3)] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
            >
              <Eye className="w-4 h-4" />
              <span>{t('cv.previewPdf')}</span>
            </button>

            <a
              href={cv.personal.pdfPath}
              download="CV Sebastian Marin.pdf"
              className="flex items-center space-x-2 px-4 py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-teal-500/40 text-teal-300 transition-all font-semibold"
            >
              <Download className="w-4 h-4 text-teal-400" />
              <span>{t('cv.downloadPdf')}</span>
            </a>

            <button
              onClick={handleCopyEmail}
              className="flex items-center space-x-2 px-4 py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 transition-all"
            >
              {copiedEmail ? <Check className="w-4 h-4 text-emerald-400" /> : <Mail className="w-4 h-4 text-teal-400" />}
              <span>{copiedEmail ? t('cv.emailCopied') : cv.personal.email}</span>
            </button>
          </div>
        </SectionReveal>

        {/* Tab Switcher */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {([
            { id: 'profile', label: t('cv.tabProfile'), icon: User },
            { id: 'experience', label: t('cv.tabExperience'), icon: Briefcase },
            { id: 'skills', label: t('cv.tabSkills'), icon: Award },
            { id: 'education', label: t('cv.tabEducation'), icon: GraduationCap },
          ] satisfies { id: CvTab; label: string; icon: LucideIcon }[]).map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                aria-pressed={isActive}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2.5 min-h-[44px] rounded-lg border text-xs font-mono-tech transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 ${
                  isActive
                    ? 'bg-teal-500/15 border-teal-500 text-teal-300 font-bold shadow-lg'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                <Icon className="w-4 h-4 text-teal-400 shrink-0" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Active Tab Panel */}
        <SectionReveal key={activeTab} className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-8">
          
          {/* TAB 1: PROFILE */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-800 pb-6 gap-4">
                <div>
                  <h3 className="text-2xl font-extrabold text-white">{cv.personal.name}</h3>
                  <p className="text-teal-400 font-mono-tech text-sm mt-0.5">
                    {language === 'es' ? cv.personal.title : cv.personal.titleEn}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-xs font-mono-tech text-slate-300">
                  <span className="flex items-center space-x-1.5 px-3 py-1 bg-slate-950 rounded border border-slate-800">
                    <MapPin className="w-3.5 h-3.5 text-teal-400" />
                    <span>{cv.personal.location}</span>
                  </span>
                  {/* Same gate as the contact section: printing the number in
                      plain text here would defeat the protection there. */}
                  <ObfuscatedPhone variant="inline" />
                  <a
                    href={cv.personal.githubUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center space-x-1.5 px-3 py-1 bg-slate-950 hover:bg-slate-800 rounded border border-slate-800 text-teal-300"
                  >
                    <GithubIcon className="w-3.5 h-3.5" />
                    <span>{cv.personal.github}</span>
                  </a>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-mono-tech uppercase font-bold text-slate-400">{t('cv.summaryEsTitle')}</h4>
                <p className="text-sm text-slate-200 leading-relaxed bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                  {cv.personal.profileSummaryEs}
                </p>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-mono-tech uppercase font-bold text-slate-400">{t('cv.summaryEnTitle')}</h4>
                <p className="text-sm text-slate-300 leading-relaxed bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                  {cv.personal.profileSummaryEn}
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: EXPERIENCE */}
          {activeTab === 'experience' && (
            <div className="space-y-8">
              {cv.experience.map((exp, idx) => {
                const role = language === 'es' ? exp.role : exp.roleEn;
                const company = language === 'es' || !exp.companyEn ? exp.company : exp.companyEn;
                const period = language === 'es' ? exp.period : exp.periodEn;
                const location = language === 'es' ? exp.location : exp.locationEn;
                const bullets = language === 'es' ? exp.bullets : exp.bulletsEn;

                return (
                  <div key={idx} className="p-5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-3 gap-2">
                      <div>
                        <h4 className="text-lg font-bold text-white">{role} — <span className="text-teal-300">{company}</span></h4>
                        <p className="text-xs font-mono-tech text-slate-400">{location}</p>
                      </div>
                      <span className="px-3 py-1 bg-slate-900 rounded border border-slate-800 text-xs font-mono-tech text-teal-400 shrink-0">
                        {period}
                      </span>
                    </div>

                    <ul className="space-y-2 text-xs text-slate-300 pt-1">
                      {bullets.map((bullet, bIdx) => (
                        <li key={bIdx} className="flex items-start space-x-2">
                          <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                          <span className="leading-relaxed">{bullet}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          )}

          {/* TAB 3: SKILLS with equal height card alignment */}
          {activeTab === 'skills' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch">
              {cv.skills.map((skill, sIdx) => {
                const category = language === 'es' ? skill.category : skill.categoryEn;
                const items = language === 'es' ? skill.items : skill.itemsEn;

                return (
                  <div key={sIdx} className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2 h-full flex flex-col justify-start">
                    <h4 className="text-sm font-bold text-teal-300 font-mono-tech">{category}</h4>
                    <p className="text-xs text-slate-300 leading-relaxed pt-1">{items}</p>
                  </div>
                );
              })}
            </div>
          )}

          {/* TAB 4: EDUCATION & CERTIFICATIONS */}
          {activeTab === 'education' && (
            <div className="space-y-6">
              <div className="space-y-4">
                <h4 className="text-xs font-mono-tech font-bold uppercase text-slate-400">{t('cv.academicTitle')}</h4>
                {cv.education.map((edu, eIdx) => {
                  const degree = language === 'es' ? edu.degree : edu.degreeEn;
                  const description = language === 'es' ? edu.description : (edu.descriptionEn || edu.description);

                  return (
                    <div key={eIdx} className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                      <div className="flex justify-between items-center">
                        <h5 className="text-sm font-bold text-white">{degree}</h5>
                        <span className="text-xs font-mono-tech text-teal-400 shrink-0">{edu.period}</span>
                      </div>
                      <p className="text-xs text-teal-300/90 font-mono-tech">{edu.institution} — {edu.location}</p>
                      {description && <p className="text-xs text-slate-300 pt-1">{description}</p>}
                    </div>
                  );
                })}
              </div>

              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-mono-tech font-bold uppercase text-slate-400">{t('cv.certsTitle')}</h4>
                <div className="space-y-2">
                  {(language === 'es' ? cv.certifications : cv.certificationsEn).map((cert, cIdx) => (
                    <div key={cIdx} className="p-3 rounded-lg bg-slate-950/40 border border-slate-800 text-xs text-slate-200 flex items-center space-x-2">
                      <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
                      <span>{cert}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-mono-tech font-bold uppercase text-slate-400">{t('cv.languagesTitle')}</h4>
                <div className="flex flex-wrap gap-4 text-xs font-mono-tech">
                  {cv.languages.map((lang, lIdx) => {
                    const lName = language === 'es' ? lang.language : lang.languageEn;
                    const lLevel = language === 'es' ? lang.level : lang.levelEn;
                    return (
                      <div key={lIdx} className="px-3 py-1.5 rounded bg-slate-950 border border-slate-800 text-slate-200">
                        <strong className="text-teal-400">{lName}:</strong> {lLevel}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

        </SectionReveal>

      </div>

      {/* PDF Document Preview Modal */}
      {pdfModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md"
          role="dialog"
          aria-modal="true"
          aria-labelledby="cv-pdf-dialog-title"
        >
          <div className="bg-[#0f172a] border border-slate-800 rounded-2xl w-full max-w-5xl h-[85vh] flex flex-col shadow-2xl overflow-hidden">

            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900">
              <div className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-teal-400" />
                <span id="cv-pdf-dialog-title" className="font-bold text-white text-sm">CV Sebastian Marin.pdf</span>
                <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 text-[10px] font-mono-tech">{t('cv.officialDoc')}</span>
              </div>

              <div className="flex items-center space-x-3">
                <a
                  href={cv.personal.pdfPath}
                  download="CV Sebastian Marin.pdf"
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded bg-teal-500 text-slate-950 font-bold text-xs hover:bg-teal-400 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{t('cv.downloadPdf')}</span>
                </a>
                <button
                  type="button"
                  onClick={() => setPdfModalOpen(false)}
                  aria-label="Cerrar / Close"
                  className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center rounded hover:bg-slate-800 text-slate-400 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Modal Body: Embedded PDF Iframe Viewer */}
            <div className="flex-1 bg-slate-950 relative">
              <iframe
                src={`${cv.personal.pdfPath}#toolbar=0`}
                className="w-full h-full border-none"
                title="CV Sebastian Marin PDF Viewer"
              />
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
