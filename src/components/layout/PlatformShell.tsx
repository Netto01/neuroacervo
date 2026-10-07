'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useNeuro } from '@/context/NeuroContext';
import '@/app/plataforma/dashboard.css';

import { resolveUserPlan } from '@/utils/userPlan';

export type PlatformPageId = 
  | 'inicio' 
  | 'biblioteca' 
  | 'aulas' 
  | 'recursos' 
  | 'pasta' 
  | 'guias' 
  | 'laudos' 
  | 'anamnese' 
  | 'compendios';

interface PlatformShellProps {
  activePage: PlatformPageId;
  children: React.ReactNode;
  searchValue?: string;
  onSearchChange?: (val: string) => void;
  searchPlaceholder?: string;
}

export const PlatformShell: React.FC<PlatformShellProps> = ({
  activePage,
  children,
  searchValue = '',
  onSearchChange,
  searchPlaceholder = 'Buscar teste, função ou tema'
}) => {
  const router = useRouter();
  const { currentUser, isLoadingUser, logout, materials, modules, favorites } = useNeuro();

  const [hoje, setHoje] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Redirecionamento de segurança para login
  useEffect(() => {
    if (!isLoadingUser && !currentUser) {
      router.push('/entrar');
    }
  }, [isLoadingUser, currentUser, router]);

  useEffect(() => {
    try {
      setHoje(new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' }));
    } catch {
      setHoje('');
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const planInfo = resolveUserPlan(currentUser);
  const totalLessons = modules.reduce((acc, m) => acc + (m.lessons?.length || 0), 0);

  if (isLoadingUser) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', background: 'var(--paper)', color: 'var(--ink)', fontFamily: 'var(--body)' }}>
        <div style={{ textAlign: 'center' }}>
          <img src="/brand/isologo-preto.svg" width="36" height="46" alt="NeuroAcervo" style={{ opacity: 0.8, marginBottom: '16px' }} />
          <p style={{ fontSize: '14px', letterSpacing: '0.05em' }}>Carregando sua plataforma...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dash-body" data-plano={planInfo.tipo}>
      <a className="skip" href="#conteudo">Pular para o conteúdo</a>

      {/* SVG Symbols Centralizados */}
      <svg width="0" height="0" style={{ position: 'absolute', display: 'none' }} aria-hidden="true">
        <defs>
          <symbol id="i-home" viewBox="0 0 24 24"><path d="M4 11 12 4l8 7v8a1 1 0 0 1-1 1h-4v-6H9v6H5a1 1 0 0 1-1-1z"/></symbol>
          <symbol id="i-lib" viewBox="0 0 24 24"><path d="M3 5.5C5.5 4 8.5 4 12 6c3.5-2 6.5-2 9-.5V19c-2.5-1.5-5.5-1.5-9 .5-3.5-2-6.5-2-9-.5z"/><path d="M12 6v13.5"/></symbol>
          <symbol id="i-aula" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M10 8.5v7l6-3.5z"/></symbol>
          <symbol id="i-play" viewBox="0 0 24 24"><path d="M8 5.5v13l10-6.5z"/></symbol>
          <symbol id="i-cards" viewBox="0 0 24 24"><rect x="7" y="4" width="13" height="16" rx="2"/><path d="M4 7v11a2 2 0 0 0 2 2"/></symbol>
          <symbol id="i-story" viewBox="0 0 24 24"><path d="M4 5h7a3 3 0 0 1 3 3v12a2 2 0 0 0-2-2H4zM20 5h-3a3 3 0 0 0-3 3"/><path d="M17 12h3v6h-3"/></symbol>
          <symbol id="i-folder" viewBox="0 0 24 24"><path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></symbol>
          <symbol id="i-user" viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 20c1.5-3.5 4.5-5 8-5s6.5 1.5 8 5"/></symbol>
          <symbol id="i-search" viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></symbol>
          <symbol id="i-bell" viewBox="0 0 24 24"><path d="M6 16V11a6 6 0 0 1 12 0v5l2 2H4z"/><path d="M10 20a2 2 0 0 0 4 0"/></symbol>
          <symbol id="i-lock" viewBox="0 0 24 24"><rect x="5" y="10" width="14" height="10" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></symbol>
          <symbol id="i-arrow" viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6"/></symbol>
          <symbol id="i-out" viewBox="0 0 24 24"><path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3M10 16l-4-4 4-4M6 12h10"/></symbol>
          <symbol id="i-info" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/></symbol>
          <symbol id="i-bookmark" viewBox="0 0 24 24"><path d="M6 4h12v17l-6-4-6 4z"/></symbol>
          <symbol id="i-pdf" viewBox="0 0 24 24"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5M9 13h6M9 17h4"/></symbol>
          <symbol id="i-guia" viewBox="0 0 24 24"><path d="M13 2 4 14h7l-1 8 9-12h-7z"/></symbol>
          <symbol id="i-laudo" viewBox="0 0 24 24"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h4"/><path d="M14 3v5h5v3M9 9h2M9 13h4"/><path d="m14 21 1-3 4.5-4.5a1.4 1.4 0 0 1 2 2L17 20z"/></symbol>
          <symbol id="i-anamnese" viewBox="0 0 24 24"><path d="M4 5h11a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1H9l-4 3v-3H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1z"/><path d="M19 9h1a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1h-1v3l-4-3h-3"/></symbol>
          <symbol id="i-compendio" viewBox="0 0 24 24"><path d="M3 5.5C5.5 4 8.5 4 12 6c3.5-2 6.5-2 9-.5V19c-2.5-1.5-5.5-1.5-9 .5-3.5-2-6.5-2-9-.5z"/><path d="M12 6v13.5"/></symbol>
          <symbol id="i-instrumento" viewBox="0 0 24 24"><rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 4V3h6v1M9 10h6M9 14h6M9 18h3"/></symbol>
        </defs>
      </svg>

      <div className="app">
        {/* Barra Lateral Padronizada */}
        <aside className="side" aria-label="Navegação principal">
          <Link className="brand" href="/plataforma">
            <img src="/brand/isologo-preto.svg" width="23" height="30" alt="NeuroAcervo" />
            <span>NeuroAcervo</span>
          </Link>

          <div>
            <div className="nav-label">Acervo</div>
            <nav className="nav">
              <Link 
                href="/plataforma"
                aria-current={activePage === 'inicio' ? 'page' : undefined}
              >
                <svg className="ico"><use href="#i-home"/></svg>
                <span>Início</span>
              </Link>

              <Link 
                href="/biblioteca"
                aria-current={activePage === 'biblioteca' ? 'page' : undefined}
              >
                <svg className="ico"><use href="#i-lib"/></svg>
                <span>Biblioteca</span>
                <span className="n">{materials.length}</span>
              </Link>

              <Link 
                href="/aulas"
                aria-current={activePage === 'aulas' ? 'page' : undefined}
              >
                <svg className="ico"><use href={!planInfo.hasAulas ? "#i-lock" : "#i-aula"}/></svg>
                <span>Aulas</span>
                {!planInfo.hasAulas ? (
                  <span className="pill" style={{ opacity: 0.7, background: 'rgba(21,20,15,0.06)' }}>Estudo</span>
                ) : (
                  <span className="n">{totalLessons}</span>
                )}
              </Link>

              <Link 
                href="/recursos-interativos"
                aria-current={activePage === 'recursos' ? 'page' : undefined}
              >
                <svg className="ico"><use href={!planInfo.hasRecursos ? "#i-lock" : "#i-cards"}/></svg>
                <span>Recursos interativos</span>
                {!planInfo.hasRecursos ? (
                  <span className="pill" style={{ opacity: 0.7, background: 'rgba(21,20,15,0.06)' }}>Prática</span>
                ) : (
                  <span className="pill">Novo</span>
                )}
              </Link>

              <Link 
                href="/minha-pasta"
                aria-current={activePage === 'pasta' ? 'page' : undefined}
              >
                <svg className="ico"><use href="#i-folder"/></svg>
                <span>Minha pasta</span>
                <span className="n">{favorites.length}</span>
              </Link>
            </nav>
          </div>

          <div>
            <div className="nav-label">Atalhos Clínicos</div>
            <nav className="nav" aria-label="Atalhos">
              <Link 
                href="/guias"
                aria-current={activePage === 'guias' ? 'page' : undefined}
              >
                <svg className="ico"><use href="#i-guia"/></svg>
                <span>Guias rápidos</span>
              </Link>

              <Link 
                href="/laudos"
                aria-current={activePage === 'laudos' ? 'page' : undefined}
              >
                <svg className="ico"><use href="#i-laudo"/></svg>
                <span>Modelos de laudo</span>
              </Link>

              <Link 
                href="/anamnese"
                aria-current={activePage === 'anamnese' ? 'page' : undefined}
              >
                <svg className="ico"><use href="#i-anamnese"/></svg>
                <span>Anamnese</span>
              </Link>

              <Link 
                href="/compendios"
                aria-current={activePage === 'compendios' ? 'page' : undefined}
              >
                <svg className="ico"><use href="#i-compendio"/></svg>
                <span>Compêndios</span>
              </Link>
            </nav>
          </div>

          <div className="plan-box">
            <div className="k">Seu plano</div>
            <div className="v">{planInfo.nome} <em>· {planInfo.preco}</em></div>
            <p>{planInfo.desc}</p>
            <Link href={planInfo.ctaHref}>
              <span>{planInfo.cta}</span>
              <svg className="ico sm"><use href="#i-arrow"/></svg>
            </Link>
          </div>

          {/* Bloco de Usuário com Prevenção de Overflow */}
          <div className="user">
            <span className="avatar" aria-hidden="true">
              {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
            </span>
            <div className="user-info">
              <b title={currentUser?.name || currentUser?.email || 'Assinante'}>
                {currentUser?.name || currentUser?.email || 'Assinante'}
              </b>
              <span title={currentUser?.crp ? (currentUser.crp.toUpperCase().startsWith('CRP') ? currentUser.crp : `CRP ${currentUser.crp}`) : (currentUser?.email || '')}>
                {currentUser?.crp ? (currentUser.crp.toUpperCase().startsWith('CRP') ? currentUser.crp : `CRP ${currentUser.crp}`) : (currentUser?.email || '')}
              </span>
            </div>
            <button
              type="button"
              onClick={async () => {
                await logout();
              }}
              aria-label="Sair da conta"
              title="Sair da conta"
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', padding: 0 }}
            >
              <svg className="ico"><use href="#i-out"/></svg>
            </button>
          </div>
        </aside>

        {/* Conteúdo Principal */}
        <main className="main" id="conteudo">
          {/* Topbar */}
          <div className="topbar">
            <Link className="mobile-brand" href="/plataforma" aria-label="NeuroAcervo, início">
              <img src="/brand/isologo-preto.svg" width="22" height="28" alt="NeuroAcervo" />
            </Link>
            <label className="search">
              <svg className="ico"><use href="#i-search"/></svg>
              <input
                ref={searchInputRef}
                type="search"
                placeholder={searchPlaceholder}
                aria-label="Buscar"
                autoComplete="off"
                value={searchValue}
                onChange={(e) => onSearchChange?.(e.target.value)}
              />
              <span className="kbd">/</span>
            </label>
            <div className="top-meta">
              <span>{hoje}</span>
              <button className="icon-btn" type="button" aria-label="Notificações">
                <svg className="ico"><use href="#i-bell"/></svg>
                <span className="dot"></span>
              </button>
            </div>
          </div>

          {children}
        </main>
      </div>

      {/* Barra Inferior (Celular) */}
      <nav className="tabbar" aria-label="Navegação móvel">
        <Link href="/plataforma" aria-current={activePage === 'inicio' ? 'page' : undefined}>
          <svg className="ico"><use href="#i-home"/></svg>
          <span>Início</span>
        </Link>
        <Link href="/biblioteca" aria-current={activePage === 'biblioteca' ? 'page' : undefined}>
          <svg className="ico"><use href="#i-lib"/></svg>
          <span>Biblioteca</span>
        </Link>
        <Link href="/aulas" aria-current={activePage === 'aulas' ? 'page' : undefined}>
          <svg className="ico"><use href="#i-aula"/></svg>
          <span>Aulas</span>
        </Link>
        <Link href="/recursos-interativos" aria-current={activePage === 'recursos' ? 'page' : undefined}>
          <svg className="ico"><use href="#i-cards"/></svg>
          <span>Recursos</span>
        </Link>
        <Link href="/minha-pasta" aria-current={activePage === 'pasta' ? 'page' : undefined}>
          <svg className="ico"><use href="#i-folder"/></svg>
          <span>Pasta</span>
        </Link>
      </nav>
    </div>
  );
};
