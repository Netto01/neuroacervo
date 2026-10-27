'use client';
/* eslint-disable @next/next/no-img-element */

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Gift } from 'lucide-react';
import { useNeuro } from '@/context/NeuroContext';
import { PresenteModal } from './PresenteModal';
import { PresenteOrigem } from '@/utils/presenteAnalytics';

interface LandingHeaderProps {
  logoSrc?: string;
}

export function LandingHeader({ logoSrc = '/brand/isologo-preto.svg' }: LandingHeaderProps) {
  const { currentUser, isLoadingUser } = useNeuro();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalOrigem, setModalOrigem] = useState<PresenteOrigem>('navbar');
  const [triggerButtonEl, setTriggerButtonEl] = useState<HTMLElement | null>(null);

  // Headroom script: esconde a barra ao rolar para baixo, mostra ao subir
  useEffect(() => {
    const nav = document.getElementById('nav');
    let last = 0;

    const handleScroll = () => {
      const y = window.scrollY;
      if (nav) {
        nav.classList.toggle('hide', y > last && y > 240);
      }
      last = y;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Controle de abertura do Modal "Presente: Escalas"
  useEffect(() => {
    // Para usuários logados, nunca abre o modal
    if (isLoadingUser || currentUser) return;

    // 1. Checagem de gatilho por URL: hash #presente ou query ?presente=1
    const checkUrlTrigger = () => {
      if (typeof window === 'undefined') return false;
      const hash = window.location.hash;
      const search = window.location.search;
      if (hash === '#presente' || search.includes('presente=1')) {
        setModalOrigem('hash');
        setIsModalOpen(true);
        return true;
      }
      return false;
    };

    if (checkUrlTrigger()) return;

    const handleHashChange = () => {
      checkUrlTrigger();
    };
    window.addEventListener('hashchange', handleHashChange);

    // 2. Checagem de exclusão automática: fechado nos últimos 7 dias OU já resgatado
    let shouldNotAutoOpen = false;
    try {
      const resgatado = localStorage.getItem('na_presente_resgatado');
      if (resgatado === 'true') {
        shouldNotAutoOpen = true;
      }

      const fechadoEm = localStorage.getItem('na_presente_fechado_em');
      if (fechadoEm) {
        const diffMs = Date.now() - parseInt(fechadoEm, 10);
        const seteDiasMs = 7 * 24 * 60 * 60 * 1000;
        if (diffMs < seteDiasMs) {
          shouldNotAutoOpen = true;
        }
      }
    } catch {
      // LocalStorage pode estar desativado em modo de navegação anônima estrita
    }

    if (shouldNotAutoOpen) {
      return () => {
        window.removeEventListener('hashchange', handleHashChange);
      };
    }

    // 3. Abertura automática SOMENTE para deslogados na página inicial
    if (typeof window !== 'undefined' && window.location.pathname !== '/') {
      return () => {
        window.removeEventListener('hashchange', handleHashChange);
      };
    }

    let autoTriggered = false;
    const triggerAutoOpen = () => {
      if (autoTriggered) return;
      autoTriggered = true;
      setModalOrigem('auto');
      setIsModalOpen(true);
    };

    // Abertura após 12 segundos
    const timer = setTimeout(() => {
      triggerAutoOpen();
    }, 12000);

    // Abertura ao rolar 50% da página
    const handleScrollAuto = () => {
      const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (scrollableHeight > 0 && window.scrollY / scrollableHeight >= 0.5) {
        triggerAutoOpen();
      }
    };

    window.addEventListener('scroll', handleScrollAuto, { passive: true });

    return () => {
      clearTimeout(timer);
      window.removeEventListener('scroll', handleScrollAuto);
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, [currentUser, isLoadingUser]);

  const handleOpenFromButton = (e: React.MouseEvent<HTMLElement>) => {
    setTriggerButtonEl(e.currentTarget);
    setModalOrigem('navbar');
    setIsModalOpen(true);
  };

  const isLogged = Boolean(currentUser);

  return (
    <>
      <a className="skip" href="#conteudo">Pular para o conteúdo</a>

      <div className="side-rail left" aria-hidden="true">
        <span className="rail-text">Avaliação · Interpretação · Anamnese · Laudo · Estudo</span>
      </div>
      <div className="side-rail right" aria-hidden="true">
        <span className="rail-text">NeuroAcervo — Acervo clínico · Edição 2026 · Uso profissional</span>
      </div>

      <div className="topbar">
        <div className="container topbar-inner">
          <span><b>NA / 2026</b> · Acervo clínico Nº 01</span>
          <span className="mid">
            <span>Avaliação <b className="acc">neuropsicológica</b></span>
            <span>Para acadêmicos de psi, psicólogos e neuropsicólogos</span>
          </span>
          <span className="right"><span className="pulse"></span>Acervo em atualização</span>
        </div>
      </div>

      <header className="nav" id="nav">
        <div className="container nav-inner">
          <Link className="brand" href="/" aria-label="NeuroAcervo, início" onClick={() => setIsMobileMenuOpen(false)}>
            <img className="brand-mark" src={logoSrc} width="26" height="34" alt="NeuroAcervo" />
            <span className="brand-name">NeuroAcervo</span>
          </Link>
          <nav aria-label="Seções">
            <ul className="nav-links">
              <li><a href="#acervo">O acervo</a></li>
              <li><a href="#metodo">Como funciona</a></li>
              <li><a href="#guia">Por dentro</a></li>
              <li><a href="#planos">Planos</a></li>
              <li><a href="#duvidas">Dúvidas</a></li>
            </ul>
          </nav>
          <div className="nav-side">
            <a className="nav-cta ghost" href="#planos">Ver planos</a>

            {/* Botão Resgatar Presente (Desktop, visível apenas para deslogados) */}
            {!isLogged && !isLoadingUser && (
              <button
                type="button"
                className="nav-btn-presente"
                onClick={handleOpenFromButton}
              >
                <Gift className="w-4 h-4" />
                <span>Resgatar presente</span>
              </button>
            )}

            {/* Ícone rápido de Presente no Mobile (ao lado do menu) */}
            {!isLogged && !isLoadingUser && (
              <button
                type="button"
                className="nav-btn-presente-mobile-icon"
                onClick={handleOpenFromButton}
                aria-label="Resgatar presente com escalas gratuitas"
                title="Resgatar presente"
              >
                <Gift className="w-4 h-4" />
              </button>
            )}

            <Link className="nav-cta" href="/entrar">Entrar</Link>

            <button
              type="button"
              className="nav-mobile-toggle"
              aria-label={isMobileMenuOpen ? "Fechar menu" : "Abrir menu"}
              aria-expanded={isMobileMenuOpen}
              onClick={() => setIsMobileMenuOpen((prev) => !prev)}
            >
              {isMobileMenuOpen ? (
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <line x1="3" y1="6" x2="21" y2="6"></line>
                  <line x1="3" y1="12" x2="21" y2="12"></line>
                  <line x1="3" y1="18" x2="21" y2="18"></line>
                </svg>
              )}
            </button>
          </div>
        </div>

        {isMobileMenuOpen && (
          <div className="nav-mobile-drawer" role="dialog" aria-label="Menu móvel">
            <ul className="nav-mobile-links">
              <li><a href="#acervo" onClick={() => setIsMobileMenuOpen(false)}>O acervo <span>→</span></a></li>
              <li><a href="#metodo" onClick={() => setIsMobileMenuOpen(false)}>Como funciona <span>→</span></a></li>
              <li><a href="#guia" onClick={() => setIsMobileMenuOpen(false)}>Por dentro <span>→</span></a></li>
              <li><a href="#planos" onClick={() => setIsMobileMenuOpen(false)}>Planos de assinatura <span>→</span></a></li>
              <li><a href="#duvidas" onClick={() => setIsMobileMenuOpen(false)}>Dúvidas frequentes <span>→</span></a></li>
            </ul>
            <div className="nav-mobile-actions">
              {/* Botão Resgatar presente em destaque no menu móvel (apenas deslogados) */}
              {!isLogged && !isLoadingUser && (
                <button
                  type="button"
                  className="btn-presente-mobile"
                  onClick={(e) => {
                    setIsMobileMenuOpen(false);
                    handleOpenFromButton(e);
                  }}
                >
                  <Gift className="w-4 h-4" />
                  <span>Resgatar presente</span>
                </button>
              )}

              <a className="btn btn-primary" href="#planos" onClick={() => setIsMobileMenuOpen(false)}>
                Ver os planos
              </a>
              <Link className="btn btn-ghost" href="/entrar" onClick={() => setIsMobileMenuOpen(false)}>
                Já sou assinante · Entrar
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Modal Presente (exibido apenas para usuários deslogados) */}
      {!isLogged && !isLoadingUser && (
        <PresenteModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          origem={modalOrigem}
          triggerElement={triggerButtonEl}
        />
      )}
    </>
  );
}
