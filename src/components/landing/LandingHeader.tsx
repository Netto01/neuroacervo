'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

interface LandingHeaderProps {
  logoSrc?: string;
}

export function LandingHeader({ logoSrc = '/brand/isologo-preto.svg' }: LandingHeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    // Headroom script: esconde a barra ao rolar para baixo, mostra ao subir
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
            <span>Para psicólogos e neuropsicólogos</span>
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
    </>
  );
}
