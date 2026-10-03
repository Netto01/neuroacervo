'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import './landing.css';

const BRAND_LOGO_SRC = "/brand/isologo-preto.svg";

export default function LandingPage() {
  const [billingCycle, setBillingCycle] = useState<'mensal' | 'anual'>('mensal');
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

  const isAnual = billingCycle === 'anual';

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
            <img className="brand-mark" src={BRAND_LOGO_SRC} width="26" height="34" alt="NeuroAcervo" />
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

      <main id="conteudo">

        {/* hero */}
        <section className="hero" aria-labelledby="h-hero">
          <div className="container hero-grid">
            <div className="hero-copy">
              <a className="hero-pill" href="#acervo"><b>Acervo</b>Guias, laudos, anamnese e aulas</a>
              <span className="label">Para psicólogos e neuropsicólogos</span>
              <h1 className="display" id="h-hero">Avaliação neuropsicológica <em>com método</em>, num só <em>acervo</em><span className="dot">.</span></h1>
              <p className="lead">Guias rápidos de aplicação e interpretação, modelos de laudo, roteiros de anamnese, compêndios de estudo e aulas, organizados para a rotina clínica e prontos para consulta.</p>
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
                <div className="stat"><span className="ring acc">07</span><span className="stat-label"><b>Tipos de material</b>num só lugar</span></div>
                <div className="stat"><span className="ring">PDF</span><span className="stat-label"><b>Modelos editáveis</b>prontos para adaptar</span></div>
                <div className="stat"><span className="ring solid">24h</span><span className="stat-label"><b>Acesso com login</b>no computador e no celular</span></div>
              </div>
              <div className="hero-foot"><span>Material de apoio · uso profissional</span><span>Média 100 · DP 15</span></div>
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

        {/* wire */}
        <section className="wire" aria-label="Temas cobertos pelo acervo">
          <div className="container wire-inner">
            <div className="wire-left">
              <span className="ring acc" aria-hidden="true">∞</span>
              <span className="wire-title"><b>Temas do acervo</b>Funções · quadros · etapas</span>
            </div>
            <div className="wire-rows" aria-hidden="true">
              <div className="wire-row">
                <div className="marquee-track">
                  <span className="wire-item"><span className="wire-dot">·</span><span className="wire-coord">F.01</span><span className="wire-name">Atenção</span></span>
                  <span className="wire-item"><span className="wire-dot">·</span><span className="wire-coord">F.02</span><span className="wire-name">Memória operacional</span></span>
                  <span className="wire-item"><span className="wire-dot">·</span><span className="wire-coord">F.03</span><span className="wire-name">Memória episódica</span></span>
                  <span className="wire-item"><span className="wire-dot">·</span><span className="wire-coord">F.04</span><span className="wire-name">Funções executivas</span></span>
                  <span className="wire-item"><span className="wire-dot">·</span><span className="wire-coord">F.05</span><span className="wire-name">Linguagem</span></span>
                  <span className="wire-item"><span className="wire-dot">·</span><span className="wire-coord">F.06</span><span className="wire-name">Velocidade de processamento</span></span>
                  <span className="wire-item"><span className="wire-dot">·</span><span className="wire-coord">F.07</span><span className="wire-name">Habilidades visuoespaciais</span></span>
                  <span className="wire-item"><span className="wire-dot">·</span><span className="wire-coord">F.08</span><span className="wire-name">Praxias e gnosias</span></span>
                  <span className="wire-item"><span className="wire-dot">·</span><span className="wire-coord">F.09</span><span className="wire-name">Cognição social</span></span>
                  <span className="wire-item"><span className="wire-dot">·</span><span className="wire-coord">F.01</span><span className="wire-name">Atenção</span></span>
                  <span className="wire-item"><span className="wire-dot">·</span><span className="wire-coord">F.02</span><span className="wire-name">Memória operacional</span></span>
                  <span className="wire-item"><span className="wire-dot">·</span><span className="wire-coord">F.03</span><span className="wire-name">Memória episódica</span></span>
                  <span className="wire-item"><span className="wire-dot">·</span><span className="wire-coord">F.04</span><span className="wire-name">Funções executivas</span></span>
                  <span className="wire-item"><span className="wire-dot">·</span><span className="wire-coord">F.05</span><span className="wire-name">Linguagem</span></span>
                  <span className="wire-item"><span className="wire-dot">·</span><span className="wire-coord">F.06</span><span className="wire-name">Velocidade de processamento</span></span>
                  <span className="wire-item"><span className="wire-dot">·</span><span className="wire-coord">F.07</span><span className="wire-name">Habilidades visuoespaciais</span></span>
                  <span className="wire-item"><span className="wire-dot">·</span><span className="wire-coord">F.08</span><span className="wire-name">Praxias e gnosias</span></span>
                  <span className="wire-item"><span className="wire-dot">·</span><span className="wire-coord">F.09</span><span className="wire-name">Cognição social</span></span>
                </div>
              </div>
              <div className="wire-row reverse">
                <div className="marquee-track">
                  <span className="wire-item"><span className="wire-dot">·</span><span className="wire-name">TDAH</span></span>
                  <span className="wire-item"><span className="wire-dot">·</span><span className="wire-name">Transtorno do espectro autista</span></span>
                  <span className="wire-item"><span className="wire-dot">·</span><span className="wire-name">Dislexia e transtornos de aprendizagem</span></span>
                  <span className="wire-item"><span className="wire-dot">·</span><span className="wire-name">Comprometimento cognitivo leve</span></span>
                  <span className="wire-item"><span className="wire-dot">·</span><span className="wire-name">Demências</span></span>
                  <span className="wire-item"><span className="wire-dot">·</span><span className="wire-name">Deficiência intelectual</span></span>
                  <span className="wire-item"><span className="wire-dot">·</span><span className="wire-name">Avaliação infantil</span></span>
                  <span className="wire-item"><span className="wire-dot">·</span><span className="wire-name">Avaliação do idoso</span></span>
                  <span className="wire-item"><span className="wire-dot">·</span><span className="wire-name">TDAH</span></span>
                  <span className="wire-item"><span className="wire-dot">·</span><span className="wire-name">Transtorno do espectro autista</span></span>
                  <span className="wire-item"><span className="wire-dot">·</span><span className="wire-name">Dislexia e transtornos de aprendizagem</span></span>
                  <span className="wire-item"><span className="wire-dot">·</span><span className="wire-name">Comprometimento cognitivo leve</span></span>
                  <span className="wire-item"><span className="wire-dot">·</span><span className="wire-name">Demências</span></span>
                  <span className="wire-item"><span className="wire-dot">·</span><span className="wire-name">Deficiência intelectual</span></span>
                  <span className="wire-item"><span className="wire-dot">·</span><span className="wire-name">Avaliação infantil</span></span>
                  <span className="wire-item"><span className="wire-dot">·</span><span className="wire-name">Avaliação do idoso</span></span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* I. acervo */}
        <section className="block" id="acervo" aria-labelledby="h-acervo">
          <div className="container">
            <div className="sec-rule">
              <span className="roman">I.</span>
              <span className="meta-grp"><span>O acervo</span><span className="dot-mark">•</span><span>Sete tipos de material</span></span>
              <span>001 / 006</span>
            </div>
            <div className="head-split">
              <h2 className="display" id="h-acervo">Tudo o que a avaliação <em>pede</em>, do <em>primeiro contato</em> ao laudo<span className="dot">.</span></h2>
              <div className="right"><span className="plus" aria-hidden="true">+</span><p>Cada material mostra categoria, população, formato e tamanho antes de abrir. Você encontra o que precisa pela busca ou pelos filtros, e volta a ele quando quiser.</p></div>
            </div>
            <div className="cards">
              <a className="card feature" href="#guia">
                <div className="num">01<span className="tag">Destaque</span></div>
                <svg className="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M13 2 4 14h7l-1 8 9-12h-7z"/></svg>
                <h3>Guias rápidos <span>de aplicação e interpretação</span></h3>
                <p>O passo a passo de cada teste em poucas páginas: material necessário, instruções, critérios de interrupção, correção e leitura das faixas de desempenho.</p>
                <span className="arrow-mark" aria-hidden="true">→</span>
              </a>
              <a className="card" href="#planos">
                <div className="num">02<span className="tag">DOCX · PDF</span></div>
                <svg className="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h4"/><path d="M14 3v5h5v3M9 9h2M9 13h4"/><path d="m14 21 1-3 4.5-4.5a1.4 1.4 0 0 1 2 2L17 20z"/></svg>
                <h3>Modelos <span>de laudo</span></h3>
                <p>Estruturas editáveis por faixa etária e queixa, com exemplos de redação.</p>
                <span className="arrow-mark" aria-hidden="true">→</span>
              </a>
              <a className="card" href="#planos">
                <div className="num">03<span className="tag">Entrevista</span></div>
                <svg className="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5h11a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1H9l-4 3v-3H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1z"/><path d="M19 9h1a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1h-1v3l-4-3h-3"/></svg>
                <h3>Roteiros <span>de anamnese</span></h3>
                <p>Entrevistas semiestruturadas para paciente, família e escola.</p>
                <span className="arrow-mark" aria-hidden="true">→</span>
              </a>
              <a className="card" href="#planos">
                <div className="num">04<span className="tag">Estudo</span></div>
                <svg className="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M3 5.5C5.5 4 8.5 4 12 6c3.5-2 6.5-2 9-.5V19c-2.5-1.5-5.5-1.5-9 .5-3.5-2-6.5-2-9-.5z"/><path d="M12 6v13.5"/></svg>
                <h3>Compêndios <span>de estudo</span></h3>
                <p>Sínteses aprofundadas por função cognitiva e por quadro clínico.</p>
                <span className="arrow-mark" aria-hidden="true">→</span>
              </a>
              <a className="card" href="#planos">
                <div className="num">05<span className="tag">Vídeo</span></div>
                <svg className="icon" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M10 8.5v7l6-3.5z"/></svg>
                <h3>Aulas <span>em módulos</span></h3>
                <p>Com progresso salvo, para assistir no seu ritmo.</p>
                <span className="arrow-mark" aria-hidden="true">→</span>
              </a>
              <a className="card" href="#planos">
                <div className="num">06<span className="tag">Fichas</span></div>
                <svg className="icon" viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 4V3h6v1M9 10h6M9 14h6M9 18h3"/></svg>
                <h3>Instrumentos <span>e protocolos</span></h3>
                <p>Folhas de registro e protocolos para o dia a dia.</p>
                <span className="arrow-mark" aria-hidden="true">→</span>
              </a>
              <a className="card" href="#planos">
                <div className="num">07<span className="tag">Referência</span></div>
                <svg className="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5M9 13h6M9 17h4"/></svg>
                <h3>PDFs <span>e artigos</span></h3>
                <p>Materiais de referência selecionados e organizados por tema.</p>
                <span className="arrow-mark" aria-hidden="true">→</span>
              </a>
            </div>
          </div>
        </section>

        {/* II. método */}
        <section className="block" id="metodo" aria-labelledby="h-metodo">
          <div className="container">
            <div className="sec-rule">
              <span className="roman">II.</span>
              <span className="meta-grp"><span>Como funciona</span><span className="dot-mark">•</span><span>Quatro etapas</span></span>
              <span>002 / 006</span>
            </div>
            <div className="head-split">
              <h2 className="display" id="h-metodo">Do caso ao laudo, <em>com o material certo</em> em mãos<span className="dot">.</span></h2>
              <div className="right"><span className="plus" aria-hidden="true">+</span><p>O acervo acompanha a sequência real de uma avaliação, para você consultar exatamente o que a etapa pede.</p></div>
            </div>
            <div className="method-grid">
              <div className="method-step"><span className="num">01</span><h4>Entrar <span className="arrow-r">→</span></h4><p>Acesso individual com login, no computador ou no celular, a qualquer hora.</p></div>
              <div className="method-step"><span className="num">02</span><h4>Encontrar <span className="arrow-r">→</span></h4><p>Busque pelo teste, pela função cognitiva ou pelo tema e filtre por tipo de material.</p></div>
              <div className="method-step"><span className="num">03</span><h4>Aplicar e interpretar <span className="arrow-r">→</span></h4><p>Consulte o guia durante a aplicação e use o roteiro na entrevista.</p></div>
              <div className="method-step"><span className="num">04</span><h4>Redigir</h4><p>Adapte o modelo de laudo ao seu caso, com a estrutura e a linguagem já resolvidas.</p></div>
            </div>
            <div className="method-foot"><span className="left"><span className="ring" aria-hidden="true"></span>Etapas da avaliação neuropsicológica</span><span>Anamnese → testagem → integração → devolutiva</span></div>
          </div>
        </section>

        {/* III. ink panel */}
        <section className="work" id="guia" aria-labelledby="h-guia">
          <div className="work-rule">
            <span className="roman">III.</span>
            <span>Por dentro do acervo • Amostras</span>
            <span>003 / 006</span>
          </div>
          <div className="work-grid">
            <div className="work-copy">
              <h2 id="h-guia">Rigor técnico <em>em formato</em> de <em>consulta</em><span className="dot">.</span></h2>
              <p>Cada guia cabe numa leitura rápida entre um atendimento e outro, sem perder a precisão.</p>
              <ul className="work-list">
                <li><b>01</b>Aplicação passo a passo, com critérios de início e interrupção.</li>
                <li><b>02</b>Correção e conversão de escores explicadas sem rodeios.</li>
                <li><b>03</b>Leitura das faixas de desempenho e cuidados na interpretação.</li>
                <li><b>04</b>Fonte e edição do manual citadas em cada material.</li>
              </ul>
            </div>
            <div className="work-card" role="img" aria-label="Amostra de guia rápido com régua de percentis">
              <div className="label-row"><b>Guia rápido</b><span>Adulto e idoso · 6 p.</span></div>
              <h3>Span <em>de dígitos</em></h3>
              <p>Aplicação, critérios de interrupção e leitura dos escores por faixa etária.</p>
              <div className="scale"><div className="bar"><i className="e"></i><i className="m"></i><i className="h"></i><i className="c"></i><i className="m"></i><i className="m"></i><i className="e"></i></div></div>
              <div className="scale-rows">
                <span>Baixo</span><span className="v">Pc 3–8</span>
                <span className="hl">Médio inferior</span><span className="v hl">Pc 9–24</span>
                <span>Médio</span><span className="v">Pc 25–74</span>
              </div>
              <div className="note">Material de apoio para profissionais habilitados. Não substitui o manual oficial do instrumento.</div>
            </div>
            <div className="work-card alt" role="img" aria-label="Amostra de modelo de laudo com seções">
              <div className="label-row"><b>Modelo de laudo</b><span>DOCX · PDF</span></div>
              <h3>Laudo <em>infantil</em></h3>
              <div className="laudo-lines">
                <div><span>I.</span><div>Identificação<i style={{ width: '70%' }}></i></div></div>
                <div><span>II.</span><div>Demanda e anamnese<i style={{ width: '88%' }}></i></div></div>
                <div><span>III.</span><div>Procedimentos<i style={{ width: '60%' }}></i></div></div>
                <div><span>IV.</span><div>Resultados<i style={{ width: '92%' }}></i></div></div>
                <div><span>V.</span><div>Conclusão<i style={{ width: '76%' }}></i></div></div>
              </div>
              <div className="meta-row"><span>Seções editáveis</span><span>Ex. de redação</span></div>
            </div>
          </div>
        </section>

        {/* IV. para quem */}
        <section className="block" id="para-quem" aria-labelledby="h-quem">
          <div className="container">
            <div className="sec-rule">
              <span className="roman">IV.</span>
              <span className="meta-grp"><span>Para quem é</span><span className="dot-mark">•</span><span>Três momentos da carreira</span></span>
              <span>004 / 006</span>
            </div>
            <div className="head-split">
              <h2 className="display" id="h-quem">Feito para <em>quem avalia</em><span className="dot">.</span></h2>
              <div className="right"><span className="plus" aria-hidden="true">+</span><p>Psicólogos e estudantes de psicologia em formação ou já na clínica.</p></div>
            </div>
            <div className="labs-grid">
              <div className="lab">
                <div className="lab-img"><span className="badge">Formação</span>
                  <svg className="lab-art" viewBox="0 0 200 140" aria-hidden="true"><path className="f" d="M40 110 Q100 20 160 110 Z"/><path className="s" d="M20 110h160M40 110 Q100 20 160 110"/><path className="a" d="M70 110V72"/></svg>
                </div>
                <div className="num-row"><b>i.</b><span>Começando</span></div>
                <h4>Quem está começando</h4>
                <p>Um caminho organizado para aprender a aplicar, interpretar e redigir com segurança.</p>
              </div>
              <div className="lab">
                <div className="lab-img"><span className="badge">Clínica</span>
                  <svg className="lab-art" viewBox="0 0 200 140" aria-hidden="true"><rect className="f" x="56" y="22" width="88" height="104" rx="6"/><path className="s" d="M56 28a6 6 0 0 1 6-6h76a6 6 0 0 1 6 6v92a6 6 0 0 1-6 6H62a6 6 0 0 1-6-6zM72 50h56M72 66h56M72 82h36"/><path className="a" d="m110 104 8 8 16-18"/></svg>
                </div>
                <div className="num-row"><b>ii.</b><span>Atendendo</span></div>
                <h4>Quem já atende</h4>
                <p>Consulta rápida no consultório e modelos que economizam horas na escrita do laudo.</p>
              </div>
              <div className="lab">
                <div className="lab-img"><span className="badge">Supervisão</span>
                  <svg className="lab-art" viewBox="0 0 200 140" aria-hidden="true"><circle className="f" cx="100" cy="70" r="40"/><circle className="s" cx="76" cy="70" r="30"/><circle className="s" cx="124" cy="70" r="30"/><path className="a" d="M100 46v48"/></svg>
                </div>
                <div className="num-row"><b>iii.</b><span>Orientando</span></div>
                <h4>Quem supervisiona</h4>
                <p>Material padronizado para orientar estagiários e equipes.</p>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════ V. SEÇÃO DE PLANOS ═══════════════ */}
        <section className="block" id="planos" aria-labelledby="h-planos">
          <div className="container">
            <div className="sec-rule">
              <span className="roman">V.</span>
              <span className="meta-grp"><span>Planos</span><span className="dot-mark">•</span><span>Assinatura flexível</span></span>
              <span>005 / 006</span>
            </div>

            <div className="plans-head">
              <h2 className="display" id="h-planos">Escolha o <em>seu</em> acervo<span className="dot">.</span></h2>
              <div className="right">
                <p>Três planos, um acervo que cresce todo mês. Comece por onde fizer sentido e mude de plano quando quiser.</p>
                <div className="billing" role="group" aria-label="Forma de cobrança do plano Completo">
                  <button
                    type="button"
                    aria-pressed={!isAnual}
                    onClick={() => setBillingCycle('mensal')}
                  >
                    Mensal
                  </button>
                  <button
                    type="button"
                    aria-pressed={isAnual}
                    onClick={() => setBillingCycle('anual')}
                  >
                    Anual <b>−33%</b>
                  </button>
                </div>
                <span className="billing-note">O pagamento anual está disponível no plano Completo.</span>
              </div>
            </div>

            <div className="plans">
              {/* Plano 01 */}
              <article className="plan" aria-labelledby="p1">
                <div className="num">01<span className="tag">Leitura</span></div>
                <h3 id="p1">Acervo <span>PDFs</span></h3>
                <p className="for">Para quem quer os materiais de consulta para baixar e usar.</p>
                <div className="price">
                  <span className="cur">R$</span>
                  <span className="val">19<small>,90</small></span>
                  <span className="per">/mês</span>
                </div>
                <div className="price-note">Cobrança mensal</div>
                <ul className="feat">
                  <li><svg viewBox="0 0 24 24"><path d="m5 12 4.5 4.5L19 7"/></svg><span>Guias rápidos de aplicação e interpretação</span></li>
                  <li><svg viewBox="0 0 24 24"><path d="m5 12 4.5 4.5L19 7"/></svg><span>Modelos de laudo e roteiros de anamnese</span></li>
                  <li><svg viewBox="0 0 24 24"><path d="m5 12 4.5 4.5L19 7"/></svg><span>Compêndios de estudo e instrumentos</span></li>
                  <li className="off"><svg viewBox="0 0 24 24"><path d="M6 12h12"/></svg><span>Aulas gravadas</span></li>
                  <li className="off"><svg viewBox="0 0 24 24"><path d="M6 12h12"/></svg><span>Recursos interativos</span></li>
                </ul>
                <Link className="btn btn-ghost" href="/cadastro?plano=acervo&ciclo=mensal">
                  <span>Assinar o Acervo</span>
                  <span className="arrow"><svg viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6"/></svg></span>
                </Link>
              </article>

              {/* Plano 02 */}
              <article className="plan" aria-labelledby="p2">
                <div className="num">02<span className="tag">Estudo</span></div>
                <h3 id="p2">Acervo <span>+ Aulas</span></h3>
                <p className="for">Para quem quer os materiais e as aulas gravadas em módulos.</p>
                <div className="price">
                  <span className="cur">R$</span>
                  <span className="val">39<small>,90</small></span>
                  <span className="per">/mês</span>
                </div>
                <div className="price-note">Cobrança mensal</div>
                <ul className="feat">
                  <li><svg viewBox="0 0 24 24"><path d="m5 12 4.5 4.5L19 7"/></svg><span>Todos os PDFs do plano Acervo</span></li>
                  <li><svg viewBox="0 0 24 24"><path d="m5 12 4.5 4.5L19 7"/></svg><span><b>Aulas gravadas</b> em módulos, com progresso salvo</span></li>
                  <li className="off"><svg viewBox="0 0 24 24"><path d="M6 12h12"/></svg><span>Baralhos interativos</span></li>
                  <li className="off"><svg viewBox="0 0 24 24"><path d="M6 12h12"/></svg><span>Histórias temáticas</span></li>
                  <li className="off"><svg viewBox="0 0 24 24"><path d="M6 12h12"/></svg><span>Novos recursos interativos todo mês</span></li>
                </ul>
                <Link className="btn btn-ghost" href="/cadastro?plano=aulas&ciclo=mensal">
                  <span>Assinar Acervo + Aulas</span>
                  <span className="arrow"><svg viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6"/></svg></span>
                </Link>
              </article>

              {/* Plano 03 (destaque) */}
              <article className="plan featured" aria-labelledby="p3">
                <div className="num">03<span className="tag">Recomendado</span></div>
                <h3 id="p3">Completo <span>tudo + prática</span></h3>
                <p className="for">Para quem avalia e quer, além do estudo, ferramentas para usar na sessão.</p>
                <div className="price">
                  <span className="cur">R$</span>
                  <span className="val">
                    {isAnual ? '399' : <>49<small>,90</small></>}
                  </span>
                  <span className="per">{isAnual ? '/ano' : '/mês'}</span>
                </div>
                <div className="price-note">
                  {isAnual ? 'Equivale a R$ 33,25 por mês' : 'Só R$ 10 a mais que o plano Aulas'}
                </div>
                <ul className="feat">
                  <li><svg viewBox="0 0 24 24"><path d="m5 12 4.5 4.5L19 7"/></svg><span>Todos os PDFs e todas as aulas</span></li>
                  <li><svg viewBox="0 0 24 24"><path d="m5 12 4.5 4.5L19 7"/></svg><span><b>Baralhos interativos</b> para usar online</span></li>
                  <li><svg viewBox="0 0 24 24"><path d="m5 12 4.5 4.5L19 7"/></svg><span><b>Histórias temáticas</b> e demais recursos online</span></li>
                  <li><svg viewBox="0 0 24 24"><path d="m5 12 4.5 4.5L19 7"/></svg><span>Novos recursos interativos todo mês</span></li>
                  <li><svg viewBox="0 0 24 24"><path d="m5 12 4.5 4.5L19 7"/></svg><span>Acesso antecipado a lançamentos</span></li>
                </ul>
                {isAnual && (
                  <p className="upsell">
                    No anual você paga R$ 399 de uma vez, o equivalente a R$ 33,25 por mês.
                  </p>
                )}
                <Link
                  className="btn btn-primary"
                  href={`/cadastro?plano=completo&ciclo=${billingCycle}`}
                >
                  <span>Assinar o Completo</span>
                  <span className="arrow"><svg viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6"/></svg></span>
                </Link>
              </article>
            </div>

            <div className="compare-wrap">
              <div className="compare-header-row">
                <span className="compare-caption-text">Compare os recursos de cada plano</span>
              </div>
              <table className="compare">
                <caption className="sr">Compare os planos do NeuroAcervo</caption>
                <thead>
                  <tr>
                    <th scope="col" className="col-resource">O que está incluído</th>
                    <th scope="col" className="col-plan">
                      <div className="th-plan">
                        <span className="th-title">Acervo</span>
                        <small className="th-price">R$ 19,90<span className="th-period">/mês</span></small>
                        <Link href="/cadastro" className="btn-table-cta">Assinar</Link>
                      </div>
                    </th>
                    <th scope="col" className="col-plan">
                      <div className="th-plan">
                        <span className="th-title"><span className="hide-mobile">Acervo </span>+ Aulas</span>
                        <small className="th-price">R$ 39,90<span className="th-period">/mês</span></small>
                        <Link href="/cadastro" className="btn-table-cta">Assinar</Link>
                      </div>
                    </th>
                    <th scope="col" className="col-plan col-feat">
                      <div className="th-plan">
                        <span className="th-tag">Recomendado</span>
                        <span className="th-title">Completo</span>
                        {billingCycle === 'anual' ? (
                          <small className="th-price th-price-promo">
                            <span className="th-val">R$ 33,25</span><span className="th-period">/mês</span>
                            <span className="th-subtext">R$ 399/ano</span>
                          </small>
                        ) : (
                          <small className="th-price">R$ 49,90<span className="th-period">/mês</span></small>
                        )}
                        <Link href="/cadastro" className="btn-table-cta btn-table-feat">Assinar</Link>
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <th scope="row">Guias rápidos de aplicação e interpretação</th>
                    <td className="yes"><svg viewBox="0 0 24 24" aria-label="Incluído"><path d="m5 12 4.5 4.5L19 7"/></svg></td>
                    <td className="yes"><svg viewBox="0 0 24 24" aria-label="Incluído"><path d="m5 12 4.5 4.5L19 7"/></svg></td>
                    <td className="yes col-feat"><svg viewBox="0 0 24 24" aria-label="Incluído"><path d="m5 12 4.5 4.5L19 7"/></svg></td>
                  </tr>
                  <tr>
                    <th scope="row">Modelos de laudo e roteiros de anamnese</th>
                    <td className="yes"><svg viewBox="0 0 24 24" aria-label="Incluído"><path d="m5 12 4.5 4.5L19 7"/></svg></td>
                    <td className="yes"><svg viewBox="0 0 24 24" aria-label="Incluído"><path d="m5 12 4.5 4.5L19 7"/></svg></td>
                    <td className="yes col-feat"><svg viewBox="0 0 24 24" aria-label="Incluído"><path d="m5 12 4.5 4.5L19 7"/></svg></td>
                  </tr>
                  <tr>
                    <th scope="row">Compêndios de estudo e instrumentos</th>
                    <td className="yes"><svg viewBox="0 0 24 24" aria-label="Incluído"><path d="m5 12 4.5 4.5L19 7"/></svg></td>
                    <td className="yes"><svg viewBox="0 0 24 24" aria-label="Incluído"><path d="m5 12 4.5 4.5L19 7"/></svg></td>
                    <td className="yes col-feat"><svg viewBox="0 0 24 24" aria-label="Incluído"><path d="m5 12 4.5 4.5L19 7"/></svg></td>
                  </tr>
                  <tr>
                    <th scope="row">Aulas gravadas em módulos</th>
                    <td className="no"><span className="dash-icon" aria-label="Não incluído">—</span></td>
                    <td className="yes"><svg viewBox="0 0 24 24" aria-label="Incluído"><path d="m5 12 4.5 4.5L19 7"/></svg></td>
                    <td className="yes col-feat"><svg viewBox="0 0 24 24" aria-label="Incluído"><path d="m5 12 4.5 4.5L19 7"/></svg></td>
                  </tr>
                  <tr>
                    <th scope="row">Baralhos interativos online</th>
                    <td className="no"><span className="dash-icon" aria-label="Não incluído">—</span></td>
                    <td className="no"><span className="dash-icon" aria-label="Não incluído">—</span></td>
                    <td className="yes col-feat"><svg viewBox="0 0 24 24" aria-label="Incluído"><path d="m5 12 4.5 4.5L19 7"/></svg></td>
                  </tr>
                  <tr>
                    <th scope="row">Histórias temáticas de aplicação</th>
                    <td className="no"><span className="dash-icon" aria-label="Não incluído">—</span></td>
                    <td className="no"><span className="dash-icon" aria-label="Não incluído">—</span></td>
                    <td className="yes col-feat"><svg viewBox="0 0 24 24" aria-label="Incluído"><path d="m5 12 4.5 4.5L19 7"/></svg></td>
                  </tr>
                  <tr>
                    <th scope="row">Novos recursos interativos todo mês</th>
                    <td className="no"><span className="dash-icon" aria-label="Não incluído">—</span></td>
                    <td className="no"><span className="dash-icon" aria-label="Não incluído">—</span></td>
                    <td className="yes col-feat"><svg viewBox="0 0 24 24" aria-label="Incluído"><path d="m5 12 4.5 4.5L19 7"/></svg></td>
                  </tr>
                  <tr>
                    <th scope="row">Opção de desconto no plano anual</th>
                    <td className="no"><span className="dash-icon" aria-label="Não disponível">—</span></td>
                    <td className="no"><span className="dash-icon" aria-label="Não disponível">—</span></td>
                    <td className="col-feat">
                      {billingCycle === 'anual' ? (
                        <span className="anual-highlight">R$ 399/ano <em>(-33%)</em></span>
                      ) : (
                        <span>R$ 399/ano</span>
                      )}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="plans-foot">
              <span>
                <svg viewBox="0 0 24 24"><rect x="5" y="10" width="14" height="10" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></svg>
                Pagamento seguro no cartão, processado pela Stripe
              </span>
              <span>
                <svg viewBox="0 0 24 24"><path d="M4 12a8 8 0 1 0 2.3-5.6M4 4v4h4"/></svg>
                Troque de plano ou cancele quando quiser
              </span>
            </div>
          </div>
        </section>
        {/* ═══════════════ /SEÇÃO DE PLANOS ═══════════════ */}

        {/* VI. faq */}
        <section className="block" id="duvidas" aria-labelledby="h-faq">
          <div className="container">
            <div className="sec-rule">
              <span className="roman">VI.</span>
              <span className="meta-grp"><span>Dúvidas</span><span className="dot-mark">•</span><span>Perguntas frequentes</span></span>
              <span>006 / 006</span>
            </div>
            <div className="faq-grid">
              <div className="faq-head">
                <h2 id="h-faq">Perguntas <em>antes</em> de <em>entrar</em><span className="dot">.</span></h2>
                <p>Não encontrou o que procurava? Fale com o suporte pelo link no rodapé.</p>
              </div>
              <div className="faq-list">
                <details className="faq-item"><summary><span className="faq-index">01</span><span className="faq-q">Quem pode acessar o acervo?</span><span className="faq-toggle" aria-hidden="true">+</span></summary><p className="faq-a">Psicólogos e estudantes de psicologia. Os guias são material de apoio e não substituem o manual oficial dos instrumentos, que segue necessário para a aplicação.</p></details>
                <details className="faq-item"><summary><span className="faq-index">02</span><span className="faq-q">Posso editar os modelos de laudo?</span><span className="faq-toggle" aria-hidden="true">+</span></summary><p className="faq-a">Sim. Os modelos estão em formatos editáveis para você adaptar à sua prática e a cada caso.</p></details>
                <details className="faq-item"><summary><span className="faq-index">03</span><span className="faq-q">Consigo acessar pelo celular?</span><span className="faq-toggle" aria-hidden="true">+</span></summary><p className="faq-a">Sim. A plataforma funciona no navegador do computador, do tablet e do celular, com o progresso das aulas salvo na sua conta.</p></details>
                <details className="faq-item"><summary><span className="faq-index">04</span><span className="faq-q">O acervo recebe novos materiais?</span><span className="faq-toggle" aria-hidden="true">+</span></summary><p className="faq-a">Sim. Materiais novos e revisados aparecem com os selos &ldquo;Novo&rdquo; e &ldquo;Atualizado&rdquo; na biblioteca.</p></details>
                <details className="faq-item"><summary><span className="faq-index">05</span><span className="faq-q">Esqueci minha senha. E agora?</span><span className="faq-toggle" aria-hidden="true">+</span></summary><p className="faq-a">Na tela de login, use &ldquo;Esqueci a senha&rdquo; para receber um link de redefinição no e-mail cadastrado.</p></details>
                <details className="faq-item"><summary><span className="faq-index">06</span><span className="faq-q">Posso trocar de plano depois?</span><span className="faq-toggle" aria-hidden="true">+</span></summary><p className="faq-a">Sim. Você pode subir ou descer de plano a qualquer momento pela sua conta. A diferença de valor é ajustada automaticamente na próxima cobrança.</p></details>
                <details className="faq-item"><summary><span className="faq-index">07</span><span className="faq-q">Como faço para cancelar?</span><span className="faq-toggle" aria-hidden="true">+</span></summary><p className="faq-a">Pela sua conta, em poucos cliques e sem multa. O acesso continua até o fim do período que você já pagou.</p></details>
              </div>
            </div>
          </div>
        </section>

        {/* cta */}
        <section className="cta" id="acesso" aria-labelledby="h-cta">
          <div className="container">
            <span className="label">Comece hoje</span>
            <h2 className="display" id="h-cta">Seu próximo laudo <em>começa</em> no <em>acervo</em><span className="dot">.</span></h2>
            <p className="lead">Garanta seu acesso e tenha guias, modelos e aulas à mão em cada etapa da avaliação.</p>
            <div className="cta-actions">
              <a className="btn btn-primary" href="#planos">
                Escolher meu plano 
                <span className="arrow"><svg viewBox="0 0 24 24"><path d="M7 17 17 7M9 7h8v8"/></svg></span>
              </a>
              <Link className="btn btn-ghost" href="/entrar">
                Entrar 
                <span className="arrow"><svg viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6"/></svg></span>
              </Link>
            </div>
            <div className="cta-foot"><span className="stamp">NA · 2026</span><span>Acervo clínico Nº 01</span><span className="push">Uso profissional · Material de apoio</span></div>
          </div>
        </section>

      </main>

      <footer>
        <div className="container">
          <div className="foot-grid">
            <div className="foot-brand">
              <Link className="brand" href="/"><img className="brand-mark" src={BRAND_LOGO_SRC} width="26" height="34" alt="NeuroAcervo" /><span className="brand-name">NeuroAcervo</span></Link>
              <p>Acervo de avaliação neuropsicológica para a prática clínica. Materiais de apoio destinados a profissionais habilitados.</p>
            </div>
            <div className="foot-col"><h5>Acervo</h5><ul><li><a href="#acervo">Guias rápidos</a></li><li><a href="#acervo">Modelos de laudo</a></li><li><a href="#acervo">Anamnese</a></li><li><a href="#acervo">Aulas</a></li></ul></div>
            <div className="foot-col"><h5>Conta</h5><ul><li><Link href="/entrar">Entrar</Link></li><li><a href="#planos">Planos</a></li><li><Link href="/cadastro">Criar conta</Link></li><li><Link href="/entrar">Esqueci a senha</Link></li></ul></div>
            <div className="foot-col"><h5>Ajuda</h5><ul><li><a href="#duvidas">Dúvidas</a></li><li><a href="#">Suporte</a></li><li><a href="#">Termos de uso</a></li><li><a href="#">Privacidade</a></li></ul></div>
          </div>
          <div className="foot-bottom"><span><span className="pulse"></span>Acervo em atualização</span><span>© 2026 NeuroAcervo</span></div>
        </div>
        <div className="foot-mega" aria-hidden="true"><div className="container"><div className="word">Neuro<span>Acervo</span>.</div></div></div>
      </footer>
    </>
  );
}
