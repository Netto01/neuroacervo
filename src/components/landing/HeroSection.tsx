import React from 'react';
import Link from 'next/link';

export function HeroSection() {
  return (
    <section className="hero" aria-labelledby="h-hero">
      <div className="container hero-grid">
        <div className="hero-copy">
          <a className="hero-pill" href="#acervo">
            <b>Acervo</b>Guias, laudos, anamnese e aulas
          </a>
          <span className="label">Para psicólogos e neuropsicólogos</span>
          <h1 className="display" id="h-hero">
            Avaliação neuropsicológica <em>com método</em>, num só <em>acervo</em><span className="dot">.</span>
          </h1>
          <p className="lead">
            Guias rápidos de aplicação e interpretação, modelos de laudo, roteiros de anamnese, compêndios de estudo e aulas, organizados para a rotina clínica e prontos para consulta.
          </p>
          <div className="hero-actions">
            <a className="btn btn-primary" href="#planos">
              Ver os planos 
              <span className="arrow">
                <svg viewBox="0 0 24 24"><path d="M7 17 17 7M9 7h8v8"/></svg>
              </span>
            </a>
            <Link className="btn btn-ghost" href="/entrar">
              Já sou assinante 
              <span className="arrow">
                <svg viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
              </span>
            </Link>
          </div>
          <div className="hero-stats">
            <div className="stat">
              <span className="ring acc">07</span>
              <span className="stat-label"><b>Tipos de material</b>num só lugar</span>
            </div>
            <div className="stat">
              <span className="ring">PDF</span>
              <span className="stat-label"><b>Modelos editáveis</b>prontos para adaptar</span>
            </div>
            <div className="stat">
              <span className="ring solid">24h</span>
              <span className="stat-label"><b>Acesso com login</b>no computador e no celular</span>
            </div>
          </div>
          <div className="hero-foot">
            <span>Material de apoio · uso profissional</span>
            <span>Média 100 · DP 15</span>
          </div>
        </div>

        <div className="hero-art" role="img" aria-label="Prancha ilustrativa: curva normal com faixas de desvio padrão, um índice de etapas e uma ficha de guia rápido">
          <span className="corner tl"></span><span className="corner tr"></span><span className="corner bl"></span><span className="corner br"></span>
          <span className="annot annot-tl"><b>Prancha 01</b><br />Distribuição normal</span>
          <span className="annot annot-tr">Escore padrão<br /><b>M 100 · DP 15</b></span>
          <span className="annot annot-bl">Fig. A — leitura por faixa</span>
          <span className="annot annot-br">Pc 2 · 16 · 50 · 84 · 98</span>
          <svg className="plate-svg" viewBox="0 0 600 300" aria-hidden="true">
            <path className="area" d="M60,250 C150,250 205,52 300,52 C395,52 450,250 540,250 Z" />
            <path className="curve" d="M20,250 C150,250 205,52 300,52 C395,52 450,250 580,250" />
            <line className="base" x1="20" y1="250" x2="580" y2="250" />
            <line className="sd" x1="140" y1="60" x2="140" y2="250" />
            <line className="sd" x1="220" y1="60" x2="220" y2="250" />
            <line className="sd" x1="300" y1="30" x2="300" y2="250" />
            <line className="sd" x1="380" y1="60" x2="380" y2="250" />
            <line className="sd" x1="460" y1="60" x2="460" y2="250" />
            <text x="128" y="272">70</text>
            <text x="208" y="272">85</text>
            <text x="286" y="272">100</text>
            <text x="366" y="272">115</text>
            <text x="446" y="272">130</text>
            <line className="pin" x1="196" y1="140" x2="196" y2="250" />
            <circle className="pin-dot" cx="196" cy="140" r="4" />
            <text className="pin-t" x="160" y="126">EP 82</text>
          </svg>
          <div className="index" aria-hidden="true">
            <span><span className="n">01</span>Aplicar</span>
            <span className="on"><span className="n">02</span>Interpretar</span>
            <span><span className="n">03</span>Redigir</span>
          </div>
          <div className="sheet" aria-hidden="true">
            <span className="tagline">Guia rápido</span>
            <h4>Span de dígitos</h4>
            <p>Aplicação, critérios de interrupção e leitura dos escores.</p>
            <div className="bar"><i className="e"></i><i className="m"></i><i className="h"></i><i className="c"></i><i className="m"></i><i className="m"></i><i className="e"></i></div>
            <div className="scale-t"><span>Pc 9–24</span><span>médio inferior</span></div>
          </div>
        </div>
      </div>
    </section>
  );
}
