'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { NeuroProvider, useNeuro } from '@/context/NeuroContext';
import { MaterialModal } from '@/components/materials/MaterialModal';
import { MaterialItem } from '@/types/neuro';
import './dashboard.css';

type PlanoTipo = 'acervo' | 'aulas' | 'completo';

const PLANOS_INFO = {
  acervo: {
    nome: 'Acervo',
    preco: 'R$ 19,90/mês',
    desc: 'Todos os PDFs do acervo. Renova em 03/11/2026.',
    cta: 'Fazer upgrade',
    ctaHref: '/#planos'
  },
  aulas: {
    nome: 'Acervo + Aulas',
    preco: 'R$ 39,90/mês',
    desc: 'PDFs e aulas gravadas. Renova em 03/11/2026.',
    cta: 'Fazer upgrade',
    ctaHref: '/#planos'
  },
  completo: {
    nome: 'Completo',
    preco: 'R$ 49,90/mês',
    desc: 'Acesso a todo o acervo, às aulas e aos recursos interativos. Renova em 03/11/2026.',
    cta: 'Gerenciar assinatura',
    ctaHref: '#'
  }
};

const NIVEL: Record<PlanoTipo, number> = {
  acervo: 1,
  aulas: 2,
  completo: 3
};

function DashboardInner() {
  const router = useRouter();
  const { materials, currentUser, activeMaterialModal, setActiveMaterialModal } = useNeuro();

  const [plano, setPlano] = useState<PlanoTipo>('completo');
  const [activeTab, setActiveTab] = useState<'inicio' | 'biblioteca' | 'aulas' | 'recursos' | 'pasta'>('inicio');
  const [busca, setBusca] = useState('');
  const [saudacao, setSaudacao] = useState('Boa noite');
  const [hoje, setHoje] = useState('');
  const buscaInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const h = new Date().getHours();
    setSaudacao(h < 12 ? 'Bom dia' : h < 18 ? 'Boa tarde' : 'Boa noite');
    try {
      setHoje(new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' }));
    } catch {
      setHoje('');
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
        e.preventDefault();
        buscaInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const nivelAtual = NIVEL[plano];
  const infoPlano = PLANOS_INFO[plano];

  const handleOpenMaterialModal = (idOuTitulo: string) => {
    const achado = materials.find(m => 
      m.id === idOuTitulo || 
      m.title.toLowerCase().includes(idOuTitulo.toLowerCase())
    );
    if (achado) {
      setActiveMaterialModal(achado);
    } else if (materials.length > 0) {
      setActiveMaterialModal(materials[0]);
    }
  };

  return (
    <div className="dash-body" data-plano={plano}>
      <a className="skip" href="#conteudo">Pular para o conteúdo</a>

      {/* SVG Symbols centralizados */}
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
        {/* barra lateral */}
        <aside className="side" aria-label="Navegação principal">
          <Link className="brand" href="/plataforma">
            <img src="/brand/isologo-preto.svg" width="23" height="30" alt="NeuroAcervo" />
            <span>NeuroAcervo</span>
          </Link>

          <div>
            <div className="nav-label">Acervo</div>
            <nav className="nav">
              <button
                type="button"
                onClick={() => setActiveTab('inicio')}
                aria-current={activeTab === 'inicio' ? 'page' : undefined}
              >
                <svg className="ico"><use href="#i-home"/></svg>
                <span>Início</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  handleOpenMaterialModal('mat-moca');
                }}
              >
                <svg className="ico"><use href="#i-lib"/></svg>
                <span>Biblioteca</span>
                <span className="n">{materials.length > 0 ? materials.length : 248}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (nivelAtual < 2) {
                    router.push('/#planos');
                  } else {
                    handleOpenMaterialModal('Aulas');
                  }
                }}
              >
                <svg className="ico"><use href="#i-aula"/></svg>
                <span>Aulas</span>
                {nivelAtual >= 2 ? (
                  <span className="n">38</span>
                ) : (
                  <svg className="ico sm lock"><use href="#i-lock"/></svg>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  if (nivelAtual < 3) {
                    router.push('/#planos');
                  } else {
                    const el = document.getElementById('tools');
                    el?.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
              >
                <svg className="ico"><use href="#i-cards"/></svg>
                <span>Recursos interativos</span>
                {nivelAtual >= 3 ? (
                  <span className="pill">Novo</span>
                ) : (
                  <svg className="ico sm lock"><use href="#i-lock"/></svg>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  const el = document.getElementById('h-pasta');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                <svg className="ico"><use href="#i-folder"/></svg>
                <span>Minha pasta</span>
                <span className="n">6</span>
              </button>
            </nav>
          </div>

          <div>
            <div className="nav-label">Atalhos</div>
            <nav className="nav" aria-label="Atalhos">
              <button type="button" onClick={() => handleOpenMaterialModal('Span de dígitos')}>
                <svg className="ico"><use href="#i-guia"/></svg>
                <span>Guias rápidos</span>
              </button>
              <button type="button" onClick={() => handleOpenMaterialModal('Modelo de laudo')}>
                <svg className="ico"><use href="#i-laudo"/></svg>
                <span>Modelos de laudo</span>
              </button>
              <button type="button" onClick={() => handleOpenMaterialModal('Anamnese')}>
                <svg className="ico"><use href="#i-anamnese"/></svg>
                <span>Anamnese</span>
              </button>
            </nav>
          </div>

          <div className="plan-box">
            <div className="k">Seu plano</div>
            <div className="v">{infoPlano.nome} <em>· {infoPlano.preco}</em></div>
            <p>{infoPlano.desc}</p>
            <Link href={infoPlano.ctaHref}>
              <span>{infoPlano.cta}</span>
              <svg className="ico sm"><use href="#i-arrow"/></svg>
            </Link>
          </div>

          <div className="user">
            <span className="avatar" aria-hidden="true">
              {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'M'}
            </span>
            <div>
              <b>{currentUser.name || 'Marina Souza'}</b>
              <span>{currentUser.crp || 'CRP 06/12345'}</span>
            </div>
            <Link href="/entrar" aria-label="Sair">
              <svg className="ico"><use href="#i-out"/></svg>
            </Link>
          </div>
        </aside>

        {/* conteúdo principal */}
        <main className="main" id="conteudo">
          <div className="topbar">
            <Link className="mobile-brand" href="/plataforma" aria-label="NeuroAcervo, início">
              <img src="/brand/isologo-preto.svg" width="22" height="28" alt="NeuroAcervo" />
            </Link>
            <label className="search">
              <svg className="ico"><use href="#i-search"/></svg>
              <input
                id="busca"
                ref={buscaInputRef}
                type="search"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Buscar teste, função ou tema"
                aria-label="Buscar no acervo"
              />
              <span className="kbd">/</span>
            </label>
            <div className="top-meta">
              <span id="hoje">{hoje}</span>
              <button className="icon-btn" type="button" aria-label="Novidades (3 novas)">
                <svg className="ico"><use href="#i-bell"/></svg>
                <span className="dot"></span>
              </button>
            </div>
          </div>

          {/* saudação */}
          <div className="hello">
            <div>
              <span className="label">Área do assinante</span>
              <h1>
                <span id="saudacao">{saudacao}</span>, <em>{currentUser.name ? currentUser.name.split(' ')[0] : 'Marina'}</em><span className="dot">.</span>
              </h1>
              <p>Chegaram 3 materiais novos desde a sua última visita. Continue de onde parou ou explore o acervo.</p>
            </div>
            <div className="stats" aria-label="Seu mês">
              <div className="stat">
                <b>12</b>
                <span>materiais abertos este mês</span>
              </div>
              <div className="stat">
                <b>{nivelAtual >= 2 ? '4' : '–'}</b>
                <span>aulas concluídas</span>
              </div>
              <div className="stat">
                <b>6</b>
                <span>itens na sua pasta</span>
              </div>
            </div>
          </div>

          {/* I. continuar */}
          <section aria-labelledby="h-cont">
            <div className="sec-rule">
              <span className="roman">I.</span>
              <span className="t" id="h-cont">Continue de onde parou</span>
            </div>
            <div className="resume">
              {nivelAtual >= 2 ? (
                <div 
                  className="lesson" 
                  role="button" 
                  tabIndex={0} 
                  onClick={() => handleOpenMaterialModal('Raciocínio clínico na anamnese')}
                >
                  <div>
                    <div className="lr">
                      <b>Aula em andamento</b>
                      <span>Módulo 3 · Aula 2</span>
                    </div>
                    <h3>Raciocínio clínico <em>na anamnese</em> do TDAH</h3>
                    <p>Como conduzir a entrevista com pais e professores e o que registrar para o laudo.</p>
                    <div className="prog">
                      <span>25:12</span>
                      <div className="bar"><i style={{ width: '60%' }}></i></div>
                      <span>42:05</span>
                    </div>
                    <span className="go">
                      Continuar aula 
                      <span><svg className="ico sm"><use href="#i-arrow"/></svg></span>
                    </span>
                  </div>
                  <div className="thumb" aria-hidden="true">
                    <svg className="curve" viewBox="0 0 240 90">
                      <path className="a" d="M30,90 C80,90 95,20 120,20 C145,20 160,90 210,90 Z"/>
                      <path className="c" d="M0,90 C80,90 95,20 120,20 C145,20 160,90 240,90"/>
                    </svg>
                    <span className="play"><svg className="ico"><use href="#i-play"/></svg></span>
                    <span className="t">60% assistido</span>
                  </div>
                </div>
              ) : (
                <div className="locked-panel">
                  <svg className="ico" style={{ width: 28, height: 28, color: 'var(--accent-strong)' }}>
                    <use href="#i-aula"/>
                  </svg>
                  <h3>Aulas gravadas em módulos</h3>
                  <p>Estude no seu ritmo, com o progresso salvo, a partir do plano Acervo + Aulas.</p>
                  <Link className="btn" href="/#planos">
                    <span>Ver planos</span>
                    <span><svg className="ico sm"><use href="#i-arrow"/></svg></span>
                  </Link>
                </div>
              )}

              <div className="recent">
                <h4>Abertos recentemente</h4>
                <div 
                  className="row" 
                  role="button" 
                  tabIndex={0} 
                  onClick={() => handleOpenMaterialModal('Span de dígitos')}
                >
                  <span className="mark bg-guia"><svg className="ico"><use href="#i-guia"/></svg></span>
                  <span className="t">
                    <b>Span de dígitos: aplicação e interpretação</b>
                    <span>Guia rápido · 6 páginas</span>
                  </span>
                  <span className="when">hoje</span>
                </div>
                <div 
                  className="row" 
                  role="button" 
                  tabIndex={0} 
                  onClick={() => handleOpenMaterialModal('Modelo de laudo: criança e adolescente')}
                >
                  <span className="mark bg-laudo"><svg className="ico"><use href="#i-laudo"/></svg></span>
                  <span className="t">
                    <b>Modelo de laudo: criança e adolescente</b>
                    <span>Modelo de laudo · DOCX e PDF</span>
                  </span>
                  <span className="when">ontem</span>
                </div>
                <div 
                  className="row" 
                  role="button" 
                  tabIndex={0} 
                  onClick={() => handleOpenMaterialModal('Roteiro de anamnese para adultos')}
                >
                  <span className="mark bg-anamnese"><svg className="ico"><use href="#i-anamnese"/></svg></span>
                  <span className="t">
                    <b>Roteiro de anamnese para adultos</b>
                    <span>Anamnese · 9 páginas</span>
                  </span>
                  <span className="when">2 dias</span>
                </div>
              </div>
            </div>
          </section>

          {/* II. categorias */}
          <section aria-labelledby="h-cat">
            <div className="sec-rule">
              <span className="roman">II.</span>
              <span className="t" id="h-cat">Explore o acervo</span>
              <button type="button" onClick={() => handleOpenMaterialModal('mat-moca')}>Ver biblioteca →</button>
            </div>
            <div className="cats">
              <div className="cat" role="button" tabIndex={0} onClick={() => handleOpenMaterialModal('Guia rápido')}>
                <span className="mark bg-guia"><svg className="ico"><use href="#i-guia"/></svg></span>
                <b>Guias rápidos</b>
                <span className="cnt">41 itens</span>
              </div>
              <div className="cat" role="button" tabIndex={0} onClick={() => handleOpenMaterialModal('Modelo de laudo')}>
                <span className="mark bg-laudo"><svg className="ico"><use href="#i-laudo"/></svg></span>
                <b>Modelos de laudo</b>
                <span className="cnt">18 itens</span>
              </div>
              <div className="cat" role="button" tabIndex={0} onClick={() => handleOpenMaterialModal('Anamnese')}>
                <span className="mark bg-anamnese"><svg className="ico"><use href="#i-anamnese"/></svg></span>
                <b>Anamnese</b>
                <span className="cnt">22 itens</span>
              </div>
              <div className="cat" role="button" tabIndex={0} onClick={() => handleOpenMaterialModal('Compêndio')}>
                <span className="mark bg-compendio"><svg className="ico"><use href="#i-compendio"/></svg></span>
                <b>Compêndios</b>
                <span className="cnt">12 itens</span>
              </div>
              <div className="cat" role="button" tabIndex={0} onClick={() => handleOpenMaterialModal('Instrumento')}>
                <span className="mark bg-instrumento"><svg className="ico"><use href="#i-instrumento"/></svg></span>
                <b>Instrumentos</b>
                <span className="cnt">53 itens</span>
              </div>
              <div className="cat" role="button" tabIndex={0} onClick={() => handleOpenMaterialModal('PDF')}>
                <span className="mark bg-pdf"><svg className="ico"><use href="#i-pdf"/></svg></span>
                <b>PDFs e artigos</b>
                <span className="cnt">64 itens</span>
              </div>
              <div 
                className="cat" 
                role="button" 
                tabIndex={0} 
                onClick={() => {
                  if (nivelAtual < 2) router.push('/#planos');
                  else handleOpenMaterialModal('Aulas');
                }}
              >
                <span className="mark bg-aula"><svg className="ico"><use href="#i-aula"/></svg></span>
                <b>Aulas</b>
                {nivelAtual >= 2 ? (
                  <span className="cnt">38 aulas</span>
                ) : (
                  <span className="cnt" style={{ display: 'inline-flex', gap: 5, alignItems: 'center' }}>
                    <svg className="ico sm"><use href="#i-lock"/></svg>Plano Aulas
                  </span>
                )}
              </div>
            </div>
          </section>

          {/* III. recursos interativos */}
          <section aria-labelledby="h-tools">
            <div className="sec-rule">
              <span className="roman">III.</span>
              <span className="t" id="h-tools">Recursos interativos</span>
              {nivelAtual >= 3 && <button type="button">Ver todos →</button>}
            </div>
            <div className="tools" id="tools">
              <div 
                className={`tool ${nivelAtual < 3 ? 'locked' : ''}`}
                role="button"
                tabIndex={0}
                onClick={() => {
                  if (nivelAtual < 3) router.push('/#planos');
                }}
              >
                <div className="tool-body" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div className="art">
                    <div className="deck" aria-hidden="true"><i></i><i></i><i>?</i></div>
                  </div>
                  <div className="num">01<span className="tag new">Novo</span></div>
                  <h3>Baralho de funções executivas</h3>
                  <p>Cartas online para usar na sessão, com instruções de aplicação.</p>
                </div>
                {nivelAtual < 3 && (
                  <div className="lock-over">
                    <b><svg className="ico sm"><use href="#i-lock"/></svg>Disponível no plano Completo</b>
                    <span className="btn">
                      Por R$ {nivelAtual === 2 ? '10' : '30'} a mais por mês 
                      <span><svg className="ico sm"><use href="#i-arrow"/></svg></span>
                    </span>
                  </div>
                )}
              </div>

              <div 
                className={`tool ${nivelAtual < 3 ? 'locked' : ''}`}
                role="button"
                tabIndex={0}
                onClick={() => {
                  if (nivelAtual < 3) router.push('/#planos');
                }}
              >
                <div className="tool-body" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div className="art">
                    <svg viewBox="0 0 120 70" width="120" height="70" aria-hidden="true">
                      <rect x="10" y="12" width="44" height="46" rx="6" fill="#f7f1de" stroke="rgba(21,20,15,.25)"/>
                      <rect x="66" y="12" width="44" height="46" rx="6" fill="#dafeaa" stroke="#2f6b31"/>
                      <path d="M20 26h24M20 34h24M20 42h14M76 26h24M76 34h18" stroke="#15140f" strokeWidth="1.4" strokeLinecap="round"/>
                    </svg>
                  </div>
                  <div className="num">02<span className="tag">Infantil</span></div>
                  <h3>Histórias temáticas</h3>
                  <p>Narrativas ilustradas para avaliar compreensão, memória e linguagem.</p>
                </div>
                {nivelAtual < 3 && (
                  <div className="lock-over">
                    <b><svg className="ico sm"><use href="#i-lock"/></svg>Disponível no plano Completo</b>
                    <span className="btn">
                      Por R$ {nivelAtual === 2 ? '10' : '30'} a mais por mês 
                      <span><svg className="ico sm"><use href="#i-arrow"/></svg></span>
                    </span>
                  </div>
                )}
              </div>

              <div 
                className={`tool ${nivelAtual < 3 ? 'locked' : ''}`}
                role="button"
                tabIndex={0}
                onClick={() => {
                  if (nivelAtual < 3) router.push('/#planos');
                }}
              >
                <div className="tool-body" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div className="art">
                    <svg viewBox="0 0 120 70" width="120" height="70" aria-hidden="true">
                      <circle cx="34" cy="35" r="18" fill="none" stroke="#15140f" strokeWidth="1.4" strokeDasharray="3 4"/>
                      <circle cx="34" cy="35" r="7" fill="#2f6b31"/>
                      <path d="M62 24h44M62 35h34M62 46h40" stroke="#15140f" strokeWidth="1.4" strokeLinecap="round"/>
                    </svg>
                  </div>
                  <div className="num">03<span className="tag">Atenção</span></div>
                  <h3>Cronômetro de aplicação</h3>
                  <p>Marque tempos e erros durante a tarefa e leve o registro para a correção.</p>
                </div>
                {nivelAtual < 3 && (
                  <div className="lock-over">
                    <b><svg className="ico sm"><use href="#i-lock"/></svg>Disponível no plano Completo</b>
                    <span className="btn">
                      Por R$ {nivelAtual === 2 ? '10' : '30'} a mais por mês 
                      <span><svg className="ico sm"><use href="#i-arrow"/></svg></span>
                    </span>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* IV. novidades + pasta */}
          <section className="two">
            <div aria-labelledby="h-new">
              <div className="sec-rule">
                <span className="roman">IV.</span>
                <span className="t" id="h-new">Novidades no acervo</span>
                <button type="button" onClick={() => handleOpenMaterialModal('mat-moca')}>Ver todas →</button>
              </div>
              <div className="list">
                <div 
                  className="row" 
                  role="button" 
                  tabIndex={0} 
                  onClick={() => handleOpenMaterialModal('Teste de trilhas: aplicação e interpretação')}
                >
                  <span className="mark bg-guia"><svg className="ico"><use href="#i-guia"/></svg></span>
                  <span className="t">
                    <b>Teste de trilhas: aplicação e interpretação</b>
                    <span>Guia rápido · Adulto · 5 páginas</span>
                  </span>
                  <span className="badge">Novo</span>
                </div>

                <div 
                  className="row" 
                  role="button" 
                  tabIndex={0} 
                  onClick={() => handleOpenMaterialModal('Compêndio de memória episódica')}
                >
                  <span className="mark bg-compendio"><svg className="ico"><use href="#i-compendio"/></svg></span>
                  <span className="t">
                    <b>Compêndio de memória episódica</b>
                    <span>Compêndio · 32 páginas</span>
                  </span>
                  <span className="badge">Novo</span>
                </div>

                <div 
                  className="row" 
                  role="button" 
                  tabIndex={0} 
                  onClick={() => {
                    if (nivelAtual < 3) router.push('/#planos');
                    else handleOpenMaterialModal('Baralho de funções executivas');
                  }}
                >
                  <span className="mark bg-instrumento"><svg className="ico"><use href="#i-cards"/></svg></span>
                  <span className="t">
                    <b>Baralho de funções executivas</b>
                    <span>Recurso interativo · online</span>
                  </span>
                  {nivelAtual >= 3 ? (
                    <span className="badge">Novo</span>
                  ) : (
                    <span className="badge lk">
                      <svg className="ico sm"><use href="#i-lock"/></svg>Completo
                    </span>
                  )}
                </div>

                <div 
                  className="row" 
                  role="button" 
                  tabIndex={0} 
                  onClick={() => handleOpenMaterialModal('Modelo de laudo: idoso com queixa de memória')}
                >
                  <span className="mark bg-laudo"><svg className="ico"><use href="#i-laudo"/></svg></span>
                  <span className="t">
                    <b>Modelo de laudo: idoso com queixa de memória</b>
                    <span>Modelo de laudo · DOCX e PDF</span>
                  </span>
                  <span className="badge up">Atualizado</span>
                </div>
              </div>
            </div>

            <div aria-labelledby="h-pasta">
              <div className="sec-rule">
                <span className="roman">V.</span>
                <span className="t" id="h-pasta">Minha pasta</span>
                <button type="button" onClick={() => handleOpenMaterialModal('mat-moca')}>Abrir →</button>
              </div>
              <div className="folder">
                <div 
                  className="row" 
                  role="button" 
                  tabIndex={0} 
                  onClick={() => handleOpenMaterialModal('Roteiro de entrevista com a escola')}
                >
                  <span className="mark bg-anamnese"><svg className="ico"><use href="#i-anamnese"/></svg></span>
                  <span className="t">
                    <b>Roteiro de entrevista com a escola</b>
                    <span>Anamnese</span>
                  </span>
                  <svg className="ico" style={{ color: 'var(--accent-strong)' }}><use href="#i-bookmark"/></svg>
                </div>

                <div 
                  className="row" 
                  role="button" 
                  tabIndex={0} 
                  onClick={() => handleOpenMaterialModal('Folha de registro: fluência verbal')}
                >
                  <span className="mark bg-instrumento"><svg className="ico"><use href="#i-instrumento"/></svg></span>
                  <span className="t">
                    <b>Folha de registro: fluência verbal</b>
                    <span>Instrumento</span>
                  </span>
                  <svg className="ico" style={{ color: 'var(--accent-strong)' }}><use href="#i-bookmark"/></svg>
                </div>

                <div 
                  className="row" 
                  role="button" 
                  tabIndex={0} 
                  onClick={() => handleOpenMaterialModal('Critérios diagnósticos: síntese comentada')}
                >
                  <span className="mark bg-pdf"><svg className="ico"><use href="#i-pdf"/></svg></span>
                  <span className="t">
                    <b>Critérios diagnósticos: síntese comentada</b>
                    <span>PDF</span>
                  </span>
                  <svg className="ico" style={{ color: 'var(--accent-strong)' }}><use href="#i-bookmark"/></svg>
                </div>
              </div>
            </div>
          </section>

          <div className="notice">
            <svg className="ico"><use href="#i-info"/></svg>
            <span>
              <b>Material de apoio para profissionais habilitados.</b> Os guias não substituem os manuais oficiais dos instrumentos.
            </span>
          </div>
        </main>
      </div>

      {/* barra inferior (celular) */}
      <nav className="tabbar" aria-label="Navegação">
        <button 
          type="button" 
          onClick={() => setActiveTab('inicio')}
          aria-current={activeTab === 'inicio' ? 'page' : undefined}
        >
          <svg className="ico"><use href="#i-home"/></svg>
          <span>Início</span>
        </button>
        <button 
          type="button" 
          onClick={() => handleOpenMaterialModal('mat-moca')}
        >
          <svg className="ico"><use href="#i-lib"/></svg>
          <span>Biblioteca</span>
        </button>
        <button 
          type="button" 
          onClick={() => {
            if (nivelAtual < 2) router.push('/#planos');
            else handleOpenMaterialModal('Aulas');
          }}
        >
          <svg className="ico"><use href="#i-aula"/></svg>
          <span>Aulas</span>
        </button>
        <Link href="/entrar">
          <svg className="ico"><use href="#i-user"/></svg>
          <span>Conta</span>
        </Link>
      </nav>

      {/* Seletor flutuante para demonstração de planos */}
      <div className="demo" role="group" aria-label="Demonstração: ver o painel como">
        <span className="lbl">Ver como</span>
        <button
          type="button"
          onClick={() => setPlano('acervo')}
          aria-pressed={plano === 'acervo'}
        >
          Acervo
        </button>
        <button
          type="button"
          onClick={() => setPlano('aulas')}
          aria-pressed={plano === 'aulas'}
        >
          Aulas
        </button>
        <button
          type="button"
          onClick={() => setPlano('completo')}
          aria-pressed={plano === 'completo'}
        >
          Completo
        </button>
      </div>

      {/* Modal de detalhes do material se aberto */}
      <MaterialModal
        material={activeMaterialModal}
        onClose={() => setActiveMaterialModal(null)}
      />
    </div>
  );
}

export default function PlataformaPage() {
  return (
    <NeuroProvider>
      <DashboardInner />
    </NeuroProvider>
  );
}
