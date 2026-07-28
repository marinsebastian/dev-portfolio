'use client';
import { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { FileText } from 'lucide-react';
import {
  DashboardIcon,
  MapPinIcon,
  CodeIcon,
  TerminalIcon,
  FileTextIcon,
  MailIcon,
} from '@animateicons/react/lucide';
import UseAnimations from 'react-useanimations';
import menuAnimation from 'react-useanimations/lib/menu';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import { useIconAnimator, type AnimatedIconComponent } from '@/lib/useIconAnimator';

interface NavLink {
  label: string;
  href: string;
  id: string;
  icon: AnimatedIconComponent;
  featured?: boolean;
  featuredLabel?: string;
}

/** Desktop nav item: icon-first, hover-expanding label, active pill + uppercase
 * label for the current section. The whole link is the animation's hover/focus
 * trigger (not just the icon itself), so hovering the label works too. */
function DesktopNavItem({
  link,
  isActive,
  index,
  prefersReducedMotion,
}: {
  link: NavLink;
  isActive: boolean;
  index: number;
  prefersReducedMotion: boolean;
}) {
  const Icon = link.icon;
  const { ref: iconRef, handlers } = useIconAnimator(prefersReducedMotion, index * 400);

  return (
    <Link
      href={link.href}
      aria-current={isActive ? 'true' : undefined}
      {...handlers}
      className={`group relative flex items-center px-3 py-2 rounded-lg border transition-colors duration-300 ease-out overflow-hidden ${
        isActive ? 'text-white border-transparent' : 'text-slate-300 hover:text-white border-transparent hover:border-teal-500/40'
      }`}
    >
      {isActive && (
        <motion.span
          layoutId="nav-active-pill"
          className="absolute inset-0 rounded-lg bg-slate-800/90 border border-teal-500/40 shadow-[0_0_12px_rgba(20,184,166,0.25)]"
          transition={prefersReducedMotion ? { duration: 0 } : { type: 'spring', stiffness: 380, damping: 32 }}
        />
      )}
      {/* Icon + label share their own spacing context, kept separate from the
          pill above so the pill is never counted as a sibling by Tailwind's
          space-x selector (that mismatch was throwing off the right padding
          specifically on the active item, since it's the only one rendering
          the pill). */}
      <span
        className={`relative z-10 flex items-center transition-[gap] duration-300 ease-out ${
          isActive ? 'gap-2' : 'gap-0 group-hover:gap-2'
        }`}
      >
        <span className="relative shrink-0">
          <Icon ref={iconRef} size={16} className="text-teal-400" />
          {link.featured && (
            <span
              aria-hidden="true"
              className="absolute -top-1 -right-1 w-1.5 h-1.5 rounded-full bg-teal-400 ring-2 ring-slate-900"
            />
          )}
        </span>
        <span
          className={`transition-all duration-300 ease-out whitespace-nowrap text-xs font-semibold uppercase tracking-wider ${
            isActive ? 'max-w-xs opacity-100' : 'max-w-0 opacity-0 group-hover:max-w-xs group-hover:opacity-100'
          }`}
        >
          {link.label}
        </span>
      </span>
      {link.featured && <span className="sr-only"> ({link.featuredLabel})</span>}
    </Link>
  );
}

/** Mobile drawer row — same animator hook, simpler static layout. */
function MobileNavItem({
  link,
  isActive,
  index,
  prefersReducedMotion,
  onNavigate,
}: {
  link: NavLink;
  isActive: boolean;
  index: number;
  prefersReducedMotion: boolean;
  onNavigate: () => void;
}) {
  const Icon = link.icon;
  const { ref: iconRef, handlers } = useIconAnimator(prefersReducedMotion, index * 400);

  return (
    <Link
      href={link.href}
      onClick={onNavigate}
      aria-current={isActive ? 'true' : undefined}
      {...handlers}
      className={`flex items-center space-x-3 px-3.5 py-3 min-h-[44px] rounded-lg text-sm transition-colors border font-medium ${
        isActive
          ? 'bg-slate-900 text-teal-300 border-teal-500/40'
          : 'text-slate-200 hover:bg-slate-900 hover:text-teal-400 border-transparent hover:border-slate-800'
      }`}
    >
      <Icon ref={iconRef} size={16} className="text-teal-400 shrink-0" />
      <span className="uppercase tracking-wider font-semibold">{link.label}</span>
      {link.featured && (
        <span className="ml-auto text-[9px] font-bold tracking-wider uppercase text-teal-400 bg-teal-500/10 border border-teal-500/30 rounded-full px-2 py-0.5 shrink-0">
          {link.featuredLabel}
        </span>
      )}
    </Link>
  );
}

// Matches each section's own `id` in DOM order — stable module-level
// reference so the observer effect below doesn't re-run every render.
const SECTION_IDS = ['overview', 'flagship', 'projects', 'stack', 'cv', 'contact'];

/**
 * Tracks which section is currently under the reading line (roughly the
 * upper third of the viewport, via `rootMargin`) rather than merely
 * "on screen at all" — the usual scroll-spy trick for picking one active
 * section out of several simultaneously-visible ones.
 */
function useActiveSection(): string {
  const [active, setActive] = useState(SECTION_IDS[0]);

  useEffect(() => {
    const sections = SECTION_IDS.map((id) => document.getElementById(id)).filter(
      (el): el is HTMLElement => el !== null
    );
    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((entry) => entry.isIntersecting);
        if (visible.length === 0) return;
        const topmost = visible.reduce((a, b) =>
          a.boundingClientRect.top <= b.boundingClientRect.top ? a : b
        );
        setActive(topmost.target.id);
      },
      { rootMargin: '-40% 0px -55% 0px', threshold: 0 }
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  return active;
}

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { language, setLanguage, t } = useLanguage();
  const activeSection = useActiveSection();
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks: NavLink[] = [
    { label: t('nav.overview'), href: '#overview', id: 'overview', icon: DashboardIcon },
    { label: t('nav.flagship'), href: '#flagship', id: 'flagship', icon: MapPinIcon, featured: true, featuredLabel: t('nav.flagshipBadge') },
    { label: t('nav.projects'), href: '#projects', id: 'projects', icon: CodeIcon },
    { label: t('nav.stack'), href: '#stack', id: 'stack', icon: TerminalIcon },
    { label: t('nav.cv'), href: '#cv', id: 'cv', icon: FileTextIcon },
    { label: t('nav.contact'), href: '#contact', id: 'contact', icon: MailIcon },
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

          {/* Desktop Nav Links (Icon-focused, smoothly expands text on hover).
              The active section's pill is a single shared-layout element that
              glides between icons as you scroll, via framer-motion's layoutId. */}
          <nav className="hidden lg:flex items-center space-x-1.5 bg-slate-900/90 p-1.5 rounded-xl border border-slate-800/90 text-xs font-medium">
            {navLinks.map((link, index) => (
              <DesktopNavItem
                key={link.href}
                link={link}
                isActive={activeSection === link.id}
                index={index}
                prefersReducedMotion={prefersReducedMotion ?? false}
              />
            ))}
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

            {/* Mobile Drawer Trigger — a Lottie-driven hamburger-to-X morph
                (react-useanimations). The `render` prop lets the library's own
                click-triggered animation logic attach to a real <button>
                (keyboard + a11y intact) instead of the bare <div> it renders
                by default. */}
            <UseAnimations
              animation={menuAnimation}
              reverse={mobileMenuOpen}
              size={20}
              strokeColor="currentColor"
              render={(eventProps, animationProps) => (
                <button
                  {...eventProps}
                  onClick={(e) => {
                    eventProps.onClick?.(e);
                    setMobileMenuOpen((prev) => !prev);
                  }}
                  type="button"
                  className="lg:hidden p-2.5 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400"
                  aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
                  aria-expanded={mobileMenuOpen}
                >
                  <div {...animationProps} />
                </button>
              )}
            />
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

          {navLinks.map((link, index) => (
            <MobileNavItem
              key={link.href}
              link={link}
              isActive={activeSection === link.id}
              index={index}
              prefersReducedMotion={prefersReducedMotion ?? false}
              onNavigate={() => setMobileMenuOpen(false)}
            />
          ))}
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
              ? 'bg-teal-500 text-white shadow-[0_0_10px_rgba(20,184,166,0.3)]'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          {code.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
