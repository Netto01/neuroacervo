'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { NeuroProvider, useNeuro } from '@/context/NeuroContext';
import { MaterialModal } from '@/components/materials/MaterialModal';
import { MaterialItem } from '@/types/neuro';
import './dashboard.css';

import { resolveUserPlan } from '@/utils/userPlan';

function DashboardInner() {
  const router = useRouter();
  const { materials, modules, favorites, currentUser, activeMaterialModal, setActiveMaterialModal, logout, isLoadingUser } = useNeuro();

  const [activeTab, setActiveTab] = useState<'inicio' | 'biblioteca' | 'aulas' | 'recursos' | 'pasta'>('inicio');
  const [busca, setBusca] = useState('');
  const [saudacao, setSaudacao] = useState('Boa noite');
  const [hoje, setHoje] = useState('');
  const buscaInputRef = useRef<HTMLInputElement>(null);

  // Redireciona para o login se não houver usuário autenticado
  useEffect(() => {
    if (!isLoadingUser && !currentUser) {
      router.push('/entrar');
    }
  }, [isLoadingUser, currentUser, router]);

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

  if (isLoadingUser) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', background: '#efe7d2', color: '#15140f', fontFamily: 'sans-serif' }}>
        <div style={{ textAlign: 'center' }}>
          <img src="/brand/isologo-preto.svg" width="36" height="46" alt="NeuroAcervo" style={{ opacity: 0.8, marginBottom: '16px' }} />
          <p style={{ fontSize: '14px', letterSpacing: '0.05em' }}>Carregando sua plataforma...</p>
        </div>
      </div>
    );
  }

  const planInfo = resolveUserPlan(currentUser);
  const nivelAtual = planInfo.nivel;

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
    <div className="dash-body" data-plano={planInfo.tipo}>
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
              <Link
                href="/plataforma"
                aria-current="page"
              >
                <svg className="ico"><use href="#i-home"/></svg>
                <span>Início</span>
              </Link>

              <Link href="/biblioteca">
                <svg className="ico"><use href="#i-lib"/></svg>
                <span>Biblioteca</span>
                <span className="n">{materials.length}</span>
              </Link>

              <Link href="/aulas">
                <svg className="ico"><use href={!planInfo.hasAulas ? "#i-lock" : "#i-aula"}/></svg>
                <span>Aulas</span>
                {!planInfo.hasAulas ? (
                  <span className="pill" style={{ opacity: 0.7, background: 'rgba(21,20,15,0.06)' }}>Estudo</span>
                ) : (
                  <span className="n">{modules.reduce((acc, m) => acc + (m.lessons?.length || 0), 0)}</span>
                )}
              </Link>

              <Link href="/recursos-interativos">
                <svg className="ico"><use href={!planInfo.hasRecursos ? "#i-lock" : "#i-cards"}/></svg>
                <span>Recursos interativos</span>
                {!planInfo.hasRecursos ? (
                  <span className="pill" style={{ opacity: 0.7, background: 'rgba(21,20,15,0.06)' }}>Prática</span>
                ) : (
                  <span className="pill">Novo</span>
                )}
              </Link>

              <Link href="/minha-pasta">
                <svg className="ico"><use href="#i-folder"/></svg>
                <span>Minha pasta</span>
                <span className="n">{favorites.length}</span>
              </Link>
            </nav>
          </div>

          <div>
            <div className="nav-label">Atalhos Clínicos</div>
            <nav className="nav" aria-label="Atalhos">
              <Link href="/guias">
                <svg className="ico"><use href="#i-guia"/></svg>
                <span>Guias rápidos</span>
              </Link>
              <Link href="/laudos">
                <svg className="ico"><use href="#i-laudo"/></svg>
                <span>Modelos de laudo</span>
              </Link>
              <Link href="/anamnese">
                <svg className="ico"><use href="#i-anamnese"/></svg>
                <span>Anamnese</span>
              </Link>
              <Link href="/compendios">
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
                <span id="saudacao">{saudacao}</span>, <em>{currentUser?.name ? currentUser.name.split(' ')[0] : 'colega'}</em><span className="dot">.</span>
              </h1>
              <p>
                {materials.length > 0 
                  ? `Você tem ${materials.length} material(is) no acervo. Continue de onde parou ou explore o acervo.`
                  : 'Bem-vindo(a) ao seu painel. O acervo está preparado para receber os novos materiais e instrumentos.'}
              </p>
            </div>
            <div className="stats" aria-label="Seu mês">
              <div className="stat">
                <b>0</b>
                <span>materiais abertos este mês</span>
              </div>
              <div className="stat">
                <b>0</b>
                <span>aulas concluídas</span>
              </div>
              <div className="stat">
                <b>{favorites.length}</b>
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
              {materials.length === 0 ? (
                <div style={{ gridColumn: '1 / -1', background: 'var(--bone)', border: '1px dashed var(--line)', borderRadius: '16px', padding: '36px 24px', textAlign: 'center' }}>
                  <svg className="ico" style={{ width: 32, height: 32, opacity: 0.4, margin: '0 auto 8px', display: 'block' }}><use href="#i-lib"/></svg>
                  <h4 style={{ margin: '0 0 6px', fontSize: '15px', fontWeight: 600 }}>Nenhum material em andamento</h4>
                  <p style={{ margin: 0, fontSize: '13px', color: 'var(--ink-faint)' }}>Os materiais e aulas cadastrados aparecerão aqui para você retomar seus estudos de onde parou.</p>
                </div>
              ) : (
                <div className="recent" style={{ gridColumn: '1 / -1' }}>
                  <h4>Materiais disponíveis</h4>
                  {materials.slice(0, 3).map((mat) => (
                    <div 
                      key={mat.id}
                      className="row" 
                      role="button" 
                      tabIndex={0} 
                      onClick={() => handleOpenMaterialModal(mat.id)}
                    >
                      <span className="mark bg-guia"><svg className="ico"><use href="#i-guia"/></svg></span>
                      <span className="t">
                        <b>{mat.title}</b>
                        <span>{mat.subtitle || mat.type}</span>
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* II. categorias */}
          <section aria-labelledby="h-cat">
            <div className="sec-rule">
              <span className="roman">II.</span>
              <span className="t" id="h-cat">Explore o acervo</span>
              <Link href="/biblioteca">Ver biblioteca →</Link>
            </div>
            <div className="cats">
              <Link href="/guias" className="cat">
                <span className="mark bg-guia"><svg className="ico"><use href="#i-guia"/></svg></span>
                <b>Guias rápidos</b>
                <span className="cnt">{materials.filter(m => m.type === 'guia_rapido').length} itens</span>
              </Link>
              <Link href="/laudos" className="cat">
                <span className="mark bg-laudo"><svg className="ico"><use href="#i-laudo"/></svg></span>
                <b>Modelos de laudo</b>
                <span className="cnt">{materials.filter(m => m.type === 'modelo_laudo').length} itens</span>
              </Link>
              <Link href="/anamnese" className="cat">
                <span className="mark bg-anamnese"><svg className="ico"><use href="#i-anamnese"/></svg></span>
                <b>Anamnese</b>
                <span className="cnt">{materials.filter(m => m.type === 'entrevista_anamnese').length} itens</span>
              </Link>
              <Link href="/compendios" className="cat">
                <span className="mark bg-compendio"><svg className="ico"><use href="#i-compendio"/></svg></span>
                <b>Compêndios</b>
                <span className="cnt">{materials.filter(m => m.type === 'compendio_estudo').length} itens</span>
              </Link>
              <Link href="/biblioteca?tipo=instrumento_rastreio" className="cat">
                <span className="mark bg-instrumento"><svg className="ico"><use href="#i-instrumento"/></svg></span>
                <b>Instrumentos</b>
                <span className="cnt">{materials.filter(m => m.type === 'instrumento_rastreio').length} itens</span>
              </Link>
              <Link href="/biblioteca?tipo=tabela_normativa" className="cat">
                <span className="mark bg-pdf"><svg className="ico"><use href="#i-pdf"/></svg></span>
                <b>Tabelas normativas</b>
                <span className="cnt">{materials.filter(m => m.type === 'tabela_normativa').length} itens</span>
              </Link>
              <Link 
                href={nivelAtual >= 2 ? "/aulas" : "/#planos"}
                className="cat" 
              >
                <span className="mark bg-aula"><svg className="ico"><use href="#i-aula"/></svg></span>
                <b>Aulas</b>
                {nivelAtual >= 2 ? (
                  <span className="cnt">{modules.reduce((acc, m) => acc + (m.lessons?.length || 0), 0)} aulas</span>
                ) : (
                  <span className="cnt" style={{ display: 'inline-flex', gap: 5, alignItems: 'center' }}>
                    <svg className="ico sm"><use href="#i-lock"/></svg>Plano Aulas
                  </span>
                )}
              </Link>
            </div>
          </section>

          {/* III. recursos interativos */}
          <section aria-labelledby="h-tools">
            <div className="sec-rule">
              <span className="roman">III.</span>
              <span className="t" id="h-tools">Recursos interativos</span>
              {nivelAtual >= 3 && <Link href="/recursos-interativos">Ver todos →</Link>}
            </div>
            <div className="tools" id="tools">
              <div 
                className={`tool ${nivelAtual < 3 ? 'locked' : ''}`}
                role="button" 
                tabIndex={0} 
                onClick={() => {
                  if (nivelAtual < 3) router.push('/#planos');
                  else router.push('/recursos-interativos');
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
                    <b><svg className="ico sm"><use href="#i-lock"/></svg>Disponível no plano Prática</b>
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
                    <b><svg className="ico sm"><use href="#i-lock"/></svg>Disponível no plano Prática</b>
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
                    <b><svg className="ico sm"><use href="#i-lock"/></svg>Disponível no plano Prática</b>
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
                <Link href="/biblioteca">Ver todas →</Link>
              </div>
              <div className="list">
                {materials.length === 0 ? (
                  <div style={{ background: 'var(--bone)', border: '1px dashed var(--line)', borderRadius: '14px', padding: '24px 16px', textAlign: 'center' }}>
                    <p style={{ margin: 0, fontSize: '13px', color: 'var(--ink-faint)' }}>Nenhum material cadastrado ainda. As novidades aparecerão aqui quando forem publicadas.</p>
                  </div>
                ) : (
                  materials.slice(0, 4).map((m) => (
                    <div
                      key={m.id}
                      className="row"
                      role="button"
                      tabIndex={0}
                      onClick={() => handleOpenMaterialModal(m.id)}
                    >
                      <span className="mark bg-guia"><svg className="ico"><use href="#i-guia"/></svg></span>
                      <span className="t">
                        <b>{m.title}</b>
                        <span>{m.subtitle || m.type}</span>
                      </span>
                      <span className="badge">Novo</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div aria-labelledby="h-pasta">
              <div className="sec-rule">
                <span className="roman">V.</span>
                <span className="t" id="h-pasta">Minha pasta</span>
              </div>
              <div className="folder">
                {favorites.length === 0 ? (
                  <div style={{ background: 'var(--bone)', border: '1px dashed var(--line)', borderRadius: '14px', padding: '24px 16px', textAlign: 'center' }}>
                    <p style={{ margin: 0, fontSize: '13px', color: 'var(--ink-faint)' }}>Sua pasta de materiais salvos está vazia.</p>
                  </div>
                ) : (
                  favorites.map((favId) => {
                    const mat = materials.find(m => m.id === favId);
                    return (
                      <div 
                        key={favId}
                        className="row" 
                        role="button" 
                        tabIndex={0} 
                        onClick={() => handleOpenMaterialModal(favId)}
                      >
                        <span className="mark bg-anamnese"><svg className="ico"><use href="#i-anamnese"/></svg></span>
                        <span className="t">
                          <b>{mat?.title || favId}</b>
                          <span>{mat?.type || 'Material'}</span>
                        </span>
                        <svg className="ico" style={{ color: 'var(--accent-strong)' }}><use href="#i-bookmark"/></svg>
                      </div>
                    );
                  })
                )}
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
      <nav className="tabbar" aria-label="Navegação móvel">
        <Link href="/plataforma" aria-current="page">
          <svg className="ico"><use href="#i-home"/></svg>
          <span>Início</span>
        </Link>
        <Link href="/biblioteca">
          <svg className="ico"><use href="#i-lib"/></svg>
          <span>Biblioteca</span>
        </Link>
        <Link href="/aulas">
          <svg className="ico"><use href="#i-aula"/></svg>
          <span>Aulas</span>
        </Link>
        <Link href="/recursos-interativos">
          <svg className="ico"><use href="#i-cards"/></svg>
          <span>Recursos</span>
        </Link>
        <Link href="/minha-pasta">
          <svg className="ico"><use href="#i-folder"/></svg>
          <span>Pasta</span>
        </Link>
      </nav>

      {/* Modal de detalhes do material se aberto */}
      <MaterialModal
        material={activeMaterialModal}
        onClose={() => setActiveMaterialModal(null)}
      />
    </div>
  );
}

export default function PlataformaPage() {
  return <DashboardInner />;
}
