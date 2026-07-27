'use client';
import dynamic from 'next/dynamic';
import { LanguageProvider } from '@/context/LanguageContext';
import { GeoConsoleProvider } from '@/context/GeoConsoleContext';
import { ScrollProgress } from '@/components/layout/ScrollProgress';
import { Header } from '@/components/layout/Header';
import { HeroSection } from '@/components/sections/HeroSection';
import { ProofStrip } from '@/components/sections/ProofStrip';
import { WhatIBuild } from '@/components/sections/WhatIBuild';
import { FlagshipGeoSection } from '@/components/sections/FlagshipGeoSection';
import { CaseStudiesSection } from '@/components/sections/CaseStudiesSection';
import { TechStackMatrix } from '@/components/sections/TechStackMatrix';
import { WorkflowQASection } from '@/components/sections/WorkflowQASection';
import { InteractiveCVSection } from '@/components/sections/InteractiveCVSection';
import { ContactSection } from '@/components/sections/ContactSection';
import { Footer } from '@/components/layout/Footer';

// Overlays are only ever shown after an interaction, so they stay out of the
// initial bundle.
const FocusedConsole = dynamic(() => import('@/components/ai/FocusedConsole.client'), { ssr: false });
const GeolocationConsent = dynamic(() => import('@/components/geo/GeolocationConsent.client'), {
  ssr: false,
});

export default function Home() {
  return (
    <LanguageProvider>
      <GeoConsoleProvider>
        <main className="min-h-screen bg-[#0b0f17] text-slate-100 relative">
          <ScrollProgress />
          <Header />
          <HeroSection />
          <ProofStrip />
          <WhatIBuild />
          <FlagshipGeoSection />
          <CaseStudiesSection />
          <TechStackMatrix />
          <WorkflowQASection />
          <InteractiveCVSection />
          <ContactSection />
          <Footer />
        </main>
        <GeolocationConsent />
        <FocusedConsole />
      </GeoConsoleProvider>
    </LanguageProvider>
  );
}
