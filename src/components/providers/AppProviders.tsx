'use client';

import React from 'react';
import { NeuroProvider } from '@/context/NeuroContext';

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <NeuroProvider>
      {children}
    </NeuroProvider>
  );
}
