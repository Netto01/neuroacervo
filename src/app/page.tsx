'use client';

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
    <>
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
    </>
  );
}
