'use client';
import { LanguageProvider } from '@/context/LanguageContext';
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

export default function Home() {
  return (
    <LanguageProvider>
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
    </LanguageProvider>
  );
}
