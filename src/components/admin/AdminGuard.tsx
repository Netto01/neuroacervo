'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useNeuro } from '@/context/NeuroContext';

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { currentUser, isLoadingUser } = useNeuro();

  useEffect(() => {
    if (!isLoadingUser) {
      // Em ambiente de desenvolvimento local, permite inspecionar as telas sem travar redirecionamento
      if (process.env.NODE_ENV === 'development' && !currentUser) {
        return;
      }
      if (!currentUser) {
        router.replace('/entrar?redirect=/admin');
      } else if (currentUser.role !== 'admin') {
        router.replace('/plataforma');
      }
    }
  }, [currentUser, isLoadingUser, router]);

  if (isLoadingUser) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '80vh',
          fontFamily: 'var(--sans)',
          color: 'var(--ink)'
        }}
      >
        <div
          style={{
            width: '36px',
            height: '36px',
            border: '3px solid var(--accent-strong)',
            borderTopColor: 'transparent',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
            marginBottom: '16px'
          }}
        />
        <p style={{ fontSize: '14px', color: 'var(--ink-mute)' }}>Verificando privilégios de administrador…</p>
      </div>
    );
  }

  return <>{children}</>;
}
