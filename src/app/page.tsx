import React from 'react';
import './landing.css';
import {
  LandingHeader,
  HeroSection,
  WireSection,
  AcervoCardsSection,
  MethodSection,
  InsidePreviewSection,
  AudienceSection,
  PricingSection,
  FaqSection,
  CtaSection,
  LandingFooter
} from '@/components/landing';

export default function LandingPage() {
  return (
    <div className="landing-root">
      <LandingHeader />

      <main id="conteudo">
        <HeroSection />
        <WireSection />
        <AcervoCardsSection />
        <MethodSection />
        <InsidePreviewSection />
        <AudienceSection />
        <PricingSection />
        <FaqSection />
        <CtaSection />
      </main>

      <LandingFooter />
    </div>
  );
}
