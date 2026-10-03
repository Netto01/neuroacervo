import React from 'react';
import Link from 'next/link';

export function CtaSection() {
  return (
    <section className="cta" id="acesso" aria-labelledby="h-cta">
      <div className="container">
        <span className="label">Comece hoje</span>
        <h2 className="display" id="h-cta">
          Seu próximo laudo <em>começa</em> no <em>acervo</em><span className="dot">.</span>
        </h2>
        <p className="lead">Garanta seu acesso e tenha guias, modelos e aulas à mão em cada etapa da avaliação.</p>
        <div className="cta-actions">
          <a className="btn btn-primary" href="#planos">
            Escolher meu plano 
            <span className="arrow">
              <svg viewBox="0 0 24 24"><path d="M7 17 17 7M9 7h8v8"/></svg>
            </span>
          </a>
          <Link className="btn btn-ghost" href="/entrar">
            Entrar 
            <span className="arrow">
              <svg viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
            </span>
          </Link>
        </div>
        <div className="cta-foot">
          <span className="stamp">NA · 2026</span>
          <span>Acervo clínico Nº 01</span>
          <span className="push">Uso profissional · Material de apoio</span>
        </div>
      </div>
    </section>
  );
}
