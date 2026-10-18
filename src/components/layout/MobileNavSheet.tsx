'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useNeuro } from '@/context/NeuroContext';
import { resolveUserPlan } from '@/utils/userPlan';

interface MobileNavSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileNavSheet: React.FC<MobileNavSheetProps> = ({ isOpen, onClose }) => {
  const router = useRouter();
  const pathname = usePathname();
  const { currentUser, logout } = useNeuro();
  const planInfo = resolveUserPlan(currentUser);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Fechar no ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const isAdmin = currentUser?.role === 'admin';
  const isAtivo = isAdmin || currentUser?.subscriptionStatus === 'active';

  return (
    <>
      {/* Scrim com animação de fade */}
      <div
        className="mobile-sheet-scrim"
        onClick={onClose}
        aria-hidden="true"
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(21, 20, 15, 0.65)',
          backdropFilter: 'blur(6px)',
          WebkitBackdropFilter: 'blur(6px)',
          zIndex: 90,
          animation: 'fadeInSheet 0.2s ease-out forwards'
        }}
      />

      {/* Bottom Sheet com animação de slide-up */}
      <div
        className="mobile-sheet-panel"
        role="dialog"
        aria-modal="true"
        aria-label="Menu da conta e navegação móvel"
        style={{
          position: 'fixed',
          left: 0,
          right: 0,
          bottom: 0,
          maxHeight: '90vh',
          zIndex: 100,
          background: 'var(--paper, #f7f1de)',
          borderTopLeftRadius: '24px',
          borderTopRightRadius: '24px',
          boxShadow: '0 -20px 40px rgba(21, 20, 15, 0.28)',
          borderTop: '1px solid var(--line, rgba(21, 20, 15, 0.12))',
          padding: '12px 20px calc(24px + env(safe-area-inset-bottom, 12px))',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
          animation: 'slideUpSheet 0.26s cubic-bezier(0.16, 1, 0.3, 1) forwards'
        }}
      >
        {/* Puxador nativo móvel */}
        <div style={{ display: 'flex', justifyContent: 'center', padding: '4px 0 6px' }}>
          <div
            style={{
              width: '44px',
              height: '4px',
              borderRadius: '999px',
              background: 'rgba(21, 20, 15, 0.22)'
            }}
          />
        </div>

        {/* Cabeçalho do Perfil */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            paddingBottom: '14px',
            borderBottom: '1px solid var(--line, rgba(21, 20, 15, 0.12))'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
            <div
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '50%',
                background: 'var(--ink, #15140f)',
                color: 'var(--lime, #dafeaa)',
                display: 'grid',
                placeItems: 'center',
                font: '500 italic 20px/1 var(--serif, serif)',
                flexShrink: 0
              }}
            >
              {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <b
                  style={{
                    fontSize: '16px',
                    fontWeight: 700,
                    color: 'var(--ink, #15140f)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}
                >
                  {currentUser?.name || 'Assinante'}
                </b>
                {isAdmin && (
                  <span
                    style={{
                      font: '700 9px/1 var(--sans, sans-serif)',
                      letterSpacing: '.12em',
                      textTransform: 'uppercase',
                      padding: '3px 6px',
                      borderRadius: '999px',
                      background: 'var(--lime, #dafeaa)',
                      color: 'var(--accent-strong, #1f4721)'
                    }}
                  >
                    Admin
                  </span>
                )}
              </div>
              <p
                style={{
                  margin: '3px 0 0',
                  fontSize: '12px',
                  color: 'var(--ink-mute, #686558)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}
              >
                {currentUser?.email}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar menu"
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              border: '1px solid var(--line, rgba(21, 20, 15, 0.15))',
              background: 'transparent',
              color: 'var(--ink, #15140f)',
              cursor: 'pointer',
              display: 'grid',
              placeItems: 'center',
              flexShrink: 0
            }}
          >
            <svg style={{ width: '16px', height: '16px' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Badge / Status do Plano Atual */}
        <div
          style={{
            padding: '12px 14px',
            borderRadius: '14px',
            background: 'rgba(21, 20, 15, 0.05)',
            border: '1px solid rgba(21, 20, 15, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '8px'
          }}
        >
          <div>
            <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '.08em', color: 'var(--ink-faint, #949080)', display: 'block' }}>
              Plano Ativo
            </span>
            <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--ink, #15140f)', marginTop: '2px' }}>
              {planInfo.nome} <span style={{ fontWeight: 400, color: 'var(--ink-mute, #686558)' }}>· {planInfo.preco}</span>
            </div>
          </div>
          <span
            style={{
              fontSize: '11px',
              fontWeight: 600,
              padding: '4px 8px',
              borderRadius: '999px',
              background: isAtivo ? 'rgba(31, 71, 33, 0.12)' : 'rgba(168, 38, 29, 0.12)',
              color: isAtivo ? 'var(--accent-strong, #1f4721)' : '#a8261d'
            }}
          >
            {isAtivo ? 'Ativa' : 'Pendente'}
          </span>
        </div>

        {/* Lista de Ações */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          
          {/* Opção Principal: Gerenciar Assinatura */}
          <Link
            href="/plataforma/assinatura"
            onClick={onClose}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '13px 16px',
              borderRadius: '14px',
              background: 'var(--ink, #15140f)',
              color: '#ffffff',
              textDecoration: 'none',
              fontWeight: 600,
              fontSize: '14px',
              boxShadow: '0 8px 18px rgba(21, 20, 15, 0.2)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <svg style={{ width: '18px', height: '18px', color: 'var(--lime, #dafeaa)' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect width="20" height="14" x="2" y="5" rx="2" />
                <line x1="2" x2="22" y1="10" y2="10" />
              </svg>
              <span>Gerenciar assinatura</span>
            </div>
            <svg style={{ width: '16px', height: '16px', color: 'var(--lime, #dafeaa)' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="m9 18 6-6-6-6" />
            </svg>
          </Link>

          {/* Opção Admin: Painel do Administrador (quando na plataforma) */}
          {isAdmin && !pathname?.startsWith('/admin') && (
            <Link
              href="/admin"
              onClick={onClose}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '13px 16px',
                borderRadius: '14px',
                background: 'rgba(218, 254, 170, 0.25)',
                border: '1px solid rgba(31, 71, 33, 0.25)',
                color: 'var(--accent-strong, #1f4721)',
                textDecoration: 'none',
                fontWeight: 700,
                fontSize: '14px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <svg style={{ width: '18px', height: '18px', color: 'var(--accent-strong, #1f4721)' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
                  <path d="m9 12 2 2 4-4" />
                </svg>
                <span>Painel do Administrador</span>
              </div>
              <span
                style={{
                  fontSize: '10px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '.1em',
                  padding: '2px 7px',
                  borderRadius: '999px',
                  background: 'var(--accent-strong, #1f4721)',
                  color: '#ffffff'
                }}
              >
                Acesso Total
              </span>
            </Link>
          )}

          {/* Opção Admin: Voltar à Plataforma Clínica (quando dentro do admin) */}
          {pathname?.startsWith('/admin') && (
            <Link
              href="/plataforma"
              onClick={onClose}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '13px 16px',
                borderRadius: '14px',
                background: 'rgba(31, 71, 33, 0.08)',
                border: '1px solid rgba(31, 71, 33, 0.2)',
                color: 'var(--accent-strong, #1f4721)',
                textDecoration: 'none',
                fontWeight: 700,
                fontSize: '14px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <svg style={{ width: '18px', height: '18px' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                  <polyline points="9 22 9 12 15 12 15 22" />
                </svg>
                <span>Voltar à Plataforma</span>
              </div>
              <svg style={{ width: '16px', height: '16px' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="m9 18 6-6-6-6" />
              </svg>
            </Link>
          )}

          {/* Opção de Upgrade (se não for Prática e não for admin) */}
          {planInfo.tipo !== 'pratica' && !isAdmin && (
            <Link
              href="/plataforma/upgrade"
              onClick={onClose}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 16px',
                borderRadius: '14px',
                background: 'transparent',
                border: '1px solid var(--line, rgba(21, 20, 15, 0.15))',
                color: 'var(--ink, #15140f)',
                textDecoration: 'none',
                fontWeight: 600,
                fontSize: '13.5px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <svg style={{ width: '18px', height: '18px', color: 'var(--accent-strong, #1f4721)' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z" />
                </svg>
                <span>Fazer upgrade de plano</span>
              </div>
              <svg style={{ width: '15px', height: '15px', color: 'var(--ink-mute, #686558)' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m9 18 6-6-6-6" />
              </svg>
            </Link>
          )}

          {/* Atalho de Minha Pasta */}
          <Link
            href="/minha-pasta"
            onClick={onClose}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 16px',
              borderRadius: '14px',
              background: 'transparent',
              border: '1px solid var(--line, rgba(21, 20, 15, 0.15))',
              color: 'var(--ink, #15140f)',
              textDecoration: 'none',
              fontWeight: 500,
              fontSize: '13.5px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <svg style={{ width: '18px', height: '18px', color: 'var(--ink-mute, #686558)' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              </svg>
              <span>Minha pasta de materiais</span>
            </div>
            <svg style={{ width: '15px', height: '15px', color: 'var(--ink-mute, #686558)' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m9 18 6-6-6-6" />
            </svg>
          </Link>

          {/* Botão Sair da Conta */}
          <button
            type="button"
            disabled={isLoggingOut}
            onClick={async () => {
              setIsLoggingOut(true);
              try {
                await logout();
              } finally {
                onClose();
                router.push('/entrar');
              }
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              padding: '13px 16px',
              borderRadius: '14px',
              background: 'rgba(168, 38, 29, 0.06)',
              border: '1px solid rgba(168, 38, 29, 0.28)',
              color: '#a8261d',
              fontWeight: 600,
              fontSize: '13.5px',
              cursor: isLoggingOut ? 'not-allowed' : 'pointer',
              marginTop: '6px',
              transition: 'background 0.15s ease'
            }}
          >
            <svg style={{ width: '18px', height: '18px' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" x2="9" y1="12" y2="12" />
            </svg>
            <span>{isLoggingOut ? 'Encerrando sessão...' : 'Sair da conta'}</span>
          </button>
        </div>
      </div>

      <style jsx global>{`
        @keyframes fadeInSheet {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUpSheet {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
      `}</style>
    </>
  );
};
