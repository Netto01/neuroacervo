'use client';

import React, { useState, useEffect, useMemo, useRef, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { NeuroProvider, useNeuro } from '@/context/NeuroContext';
import { MaterialItem } from '@/types/neuro';
import '../plataforma/dashboard.css';

import { resolveUserPlan, PlanoTipo } from '@/utils/userPlan';

const TIPOS = {
  guia:        { nome: 'Guia rápido',        plural: 'Guias rápidos',  ico: 'i-guia',        plano: 'acervo' as PlanoTipo },
  laudo:       { nome: 'Modelo de laudo',    plural: 'Laudos',         ico: 'i-laudo',       plano: 'acervo' as PlanoTipo },
  anamnese:    { nome: 'Anamnese',           plural: 'Anamnese',       ico: 'i-anamnese',    plano: 'acervo' as PlanoTipo },
  compendio:   { nome: 'Compêndio',          plural: 'Compêndios',     ico: 'i-compendio',   plano: 'acervo' as PlanoTipo },
  instrumento: { nome: 'Instrumento',        plural: 'Instrumentos',   ico: 'i-instrumento', plano: 'acervo' as PlanoTipo },
  pdf:         { nome: 'PDF e artigo',       plural: 'PDFs',           ico: 'i-pdf',         plano: 'acervo' as PlanoTipo },
  aula:        { nome: 'Aula',               plural: 'Aulas',          ico: 'i-aula',        plano: 'aulas' as PlanoTipo },
  interativo:  { nome: 'Recurso interativo', plural: 'Interativos',    ico: 'i-cards',       plano: 'completo' as PlanoTipo }
};

const POP: Record<string, string> = {
  infantil: 'Infantil',
  adolescente: 'Adolescente',
  adulto: 'Adulto',
  idoso: 'Idoso'
};

const NOME_PLANO: Record<PlanoTipo, string> = {
  consulta: 'Consulta',
  acervo: 'Consulta',
  estudo: 'Estudo',
  aulas: 'Estudo',
  pratica: 'Prática',
  completo: 'Prática'
};

const NIVEL: Record<PlanoTipo, number> = {
  consulta: 1,
  acervo: 1,
  estudo: 2,
  aulas: 2,
  pratica: 3,
  completo: 3
};

export interface BibliotecaItem {
  id: string | number;
  tipo: keyof typeof TIPOS;
  titulo: string;
  desc: string;
  pop: string[];
  func: string;
  formato: string;
  tamanho: string;
  data: string;
  acessos: number;
  selo: 'novo' | 'atualizado' | '';
  sumario: string[];
}

function normalizeStr(str: string): string {
  return String(str || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function formatDateBR(dateStr: string): string {
  try {
    const d = new Date(dateStr + (dateStr.includes('T') ? '' : 'T12:00:00'));
    return d.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' }).replace('.', '');
  } catch {
    return dateStr;
  }
}

function BibliotecaInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { materials, currentUser, logout, isLoadingUser, favorites, toggleFavorite, modules } = useNeuro();

  const [tipo, setTipo] = useState<string>('');
  const [q, setQ] = useState<string>('');
  const [pop, setPop] = useState<string>('');
  const [func, setFunc] = useState<string>('');
  const [savedOnly, setSavedOnly] = useState<boolean>(false);
  const [sort, setSort] = useState<'recentes' | 'az' | 'acessados'>('recentes');
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [limite, setLimite] = useState<number>(12);
  const [abertoId, setAbertoId] = useState<string | number | null>(null);
  const [hoje, setHoje] = useState<string>('');
  const buscaInputRef = useRef<HTMLInputElement>(null);

  // Redireciona para o login se não houver usuário autenticado
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
        buscaInputRef.current?.focus();
      }
      if (e.key === 'Escape') {
        setAbertoId(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Leitura de parâmetros de busca da URL
  useEffect(() => {
    const paramTipo = searchParams.get('tipo');
    if (paramTipo && TIPOS[paramTipo as keyof typeof TIPOS]) {
      setTipo(paramTipo);
    }
    const paramQ = searchParams.get('q');
    if (paramQ) {
      setQ(paramQ);
    }
  }, [searchParams]);

  // Converter materiais reais do contexto para a estrutura da biblioteca
  const mappedMateriais = useMemo<BibliotecaItem[]>(() => {
    return materials.map((m: MaterialItem): BibliotecaItem => {
      let mappedTipo: keyof typeof TIPOS = 'guia';
      if (m.type === 'guia_rapido') mappedTipo = 'guia';
      else if (m.type === 'modelo_laudo') mappedTipo = 'laudo';
      else if (m.type === 'entrevista_anamnese') mappedTipo = 'anamnese';
      else if (m.type === 'compendio_estudo') mappedTipo = 'compendio';
      else if (m.type === 'instrumento_rastreio') mappedTipo = 'instrumento';
      else if (m.type === 'tabela_normativa') mappedTipo = 'pdf';

      let mappedPop: string[] = [];
      if (m.ageGroups?.includes('todas')) {
        mappedPop = ['infantil', 'adolescente', 'adulto', 'idoso'];
      } else if (m.ageGroups && m.ageGroups.length > 0) {
        mappedPop = m.ageGroups.map(String);
      } else {
        mappedPop = ['adulto'];
      }

      let mappedFunc = 'Geral';
      if (m.domains && m.domains.length > 0) {
        const d = m.domains[0];
        if (d === 'atencao') mappedFunc = 'Atenção';
        else if (d === 'memoria') mappedFunc = 'Memória';
        else if (d === 'funcoes_executivas') mappedFunc = 'Funções executivas';
        else if (d === 'linguagem') mappedFunc = 'Linguagem';
        else if (d === 'visuoespacial') mappedFunc = 'Habilidades visuoespaciais';
        else if (d === 'inteligencia') mappedFunc = 'Inteligência';
        else if (d === 'humor_comportamento') mappedFunc = 'Aspectos socioemocionais';
      }

      return {
        id: m.id,
        tipo: mappedTipo,
        titulo: m.title,
        desc: m.subtitle || m.description,
        pop: mappedPop,
        func: mappedFunc,
        formato: m.downloadFormat || 'PDF',
        tamanho: m.downloadSize || '1.0 MB',
        data: m.publishedAt ? m.publishedAt.split('T')[0] : '2026-10-01',
        acessos: m.isPopular ? 820 : 120,
        selo: m.isFeatured ? 'novo' : '',
        sumario: m.keyInstructions && m.keyInstructions.length > 0 
          ? m.keyInstructions 
          : ['Visão geral e material necessário', 'Instruções de aplicação clínica', 'Critérios de correção e pontuação', 'Interpretação e leitura das faixas normativas']
      };
    });
  }, [materials]);

  // Contagem por tipo
  const contadoresPorTipo = useMemo(() => {
    const cont: Record<string, number> = { '': mappedMateriais.length };
    mappedMateriais.forEach(m => {
      cont[m.tipo] = (cont[m.tipo] || 0) + 1;
    });
    return cont;
  }, [mappedMateriais]);

  // Filtragem dos materiais
  const materiaisFiltrados = useMemo(() => {
    const qNorm = normalizeStr(q.trim());
    const result = mappedMateriais.filter(m => {
      if (tipo && m.tipo !== tipo) return false;
      if (pop && !m.pop.includes(pop)) return false;
      if (func && m.func !== func) return false;
      if (savedOnly && !favorites.includes(String(m.id))) return false;
      if (qNorm) {
        const alvo = normalizeStr([
          m.titulo,
          m.desc,
          m.func,
          TIPOS[m.tipo]?.nome || '',
          m.pop.map(p => POP[p] || p).join(' '),
          m.sumario.join(' ')
        ].join(' '));
        const termos = qNorm.split(/\s+/);
        return termos.every(t => alvo.includes(t));
      }
      return true;
    });

    result.sort((a, b) => {
      if (sort === 'az') return a.titulo.localeCompare(b.titulo, 'pt-BR');
      if (sort === 'acessados') return b.acessos - a.acessos;
      return b.data.localeCompare(a.data);
    });

    return result;
  }, [mappedMateriais, tipo, pop, func, savedOnly, q, sort, favorites]);

  const materiaisVisiveis = useMemo(() => {
    return materiaisFiltrados.slice(0, limite);
  }, [materiaisFiltrados, limite]);

  const itemAberto = useMemo(() => {
    if (!abertoId) return null;
    return mappedMateriais.find(m => String(m.id) === String(abertoId)) || null;
  }, [abertoId, mappedMateriais]);

  const limparFiltros = () => {
    setTipo('');
    setQ('');
    setPop('');
    setFunc('');
    setSavedOnly(false);
    setLimite(12);
  };

  const planInfo = resolveUserPlan(currentUser);
  const nivelAtual = planInfo.nivel;

  const isLiberado = (item: BibliotecaItem) => {
    const infoTipo = TIPOS[item.tipo];
    if (!infoTipo) return true;
    const nivelExigido = infoTipo.plano === 'completo' ? 3 : infoTipo.plano === 'aulas' ? 2 : 1;
    return nivelAtual >= nivelExigido;
  };

  if (isLoadingUser) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', background: '#efe7d2', color: '#15140f', fontFamily: 'sans-serif' }}>
        <div style={{ textAlign: 'center' }}>
          <img src="/brand/isologo-preto.svg" width="36" height="46" alt="NeuroAcervo" style={{ opacity: 0.8, marginBottom: '16px' }} />
          <p style={{ fontSize: '14px', letterSpacing: '0.05em' }}>Carregando biblioteca...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dash-body" data-plano={planInfo.tipo}>
      <a className="skip" href="#conteudo">Pular para o conteúdo</a>

      {/* SVG Symbols */}
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
              <Link href="/plataforma">
                <svg className="ico"><use href="#i-home"/></svg>
                <span>Início</span>
              </Link>
              <Link href="/biblioteca" aria-current="page">
                <svg className="ico"><use href="#i-lib"/></svg>
                <span>Biblioteca</span>
                <span className="n">{materials.length}</span>
              </Link>
              <Link href="/aulas">
                <svg className="ico"><use href="#i-aula"/></svg>
                <span>Aulas</span>
                <span className="n">{modules.reduce((acc, m) => acc + (m.lessons?.length || 0), 0)}</span>
              </Link>
              <Link href="/recursos-interativos">
                <svg className="ico"><use href="#i-cards"/></svg>
                <span>Recursos interativos</span>
                <span className="pill">Novo</span>
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

        {/* conteúdo */}
        <main className="main" id="conteudo">
          <div className="topbar">
            <Link className="mobile-brand" href="/plataforma" aria-label="NeuroAcervo, início">
              <img src="/brand/isologo-preto.svg" width="22" height="28" alt="NeuroAcervo" />
            </Link>
            <label className="search">
              <svg className="ico"><use href="#i-search"/></svg>
              <input
                ref={buscaInputRef}
                id="busca"
                type="search"
                placeholder="Buscar teste, função ou tema"
                aria-label="Buscar na biblioteca"
                autoComplete="off"
                value={q}
                onChange={(e) => {
                  setQ(e.target.value);
                  setLimite(12);
                }}
              />
              <span className="kbd">/</span>
            </label>
            <div className="top-meta">
              <span id="hoje">{hoje}</span>
              <button className="icon-btn" type="button" aria-label="Novidades">
                <svg className="ico"><use href="#i-bell"/></svg>
                <span className="dot"></span>
              </button>
            </div>
          </div>

          <div className="lib-head">
            <div>
              <span className="label">Acervo</span>
              <h1>A <em>biblioteca</em><span className="dot">.</span></h1>
              <p>Todo o material do acervo num só lugar. Busque pelo nome do teste, pela função cognitiva ou pelo tema, e filtre por tipo, população e formato.</p>
            </div>
            <div className="stats" aria-label="Resumo do acervo">
              <div className="stat">
                <b>{materials.length}</b>
                <span>materiais no acervo</span>
              </div>
              <div className="stat">
                <b>0</b>
                <span>novos este mês</span>
              </div>
              <div className="stat">
                <b>{favorites.length}</b>
                <span>na sua pasta</span>
              </div>
            </div>
          </div>

          {/* Abas por tipo */}
          <div className="tabs" id="tabs" role="group" aria-label="Tipo de material">
            <button
              className="tab"
              type="button"
              aria-pressed={tipo === ''}
              onClick={() => {
                setTipo('');
                setLimite(12);
              }}
            >
              Tudo <span className="c">{contadoresPorTipo[''] || 0}</span>
            </button>
            {(Object.keys(TIPOS) as (keyof typeof TIPOS)[]).map((k) => {
              const tInfo = TIPOS[k];
              const bloq = nivelAtual < NIVEL[tInfo.plano];
              return (
                <button
                  key={k}
                  className="tab"
                  type="button"
                  aria-pressed={tipo === k}
                  onClick={() => {
                    setTipo(k);
                    setLimite(12);
                  }}
                >
                  <svg className="ico"><use href={`#${bloq ? 'i-lock' : tInfo.ico}`}/></svg>
                  <span>{tInfo.plural}</span>
                  <span className="c">{contadoresPorTipo[k] || 0}</span>
                </button>
              );
            })}
          </div>

          {/* Filtros */}
          <div className="filters">
            <label className={`sel ${pop ? 'on' : ''}`} id="w-pop">
              <span className="sr" style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0 0 0 0)' }}>População</span>
              <select
                id="f-pop"
                value={pop}
                onChange={(e) => {
                  setPop(e.target.value);
                  setLimite(12);
                }}
              >
                <option value="">Todas as populações</option>
                <option value="infantil">Infantil</option>
                <option value="adolescente">Adolescente</option>
                <option value="adulto">Adulto</option>
                <option value="idoso">Idoso</option>
              </select>
            </label>

            <label className={`sel ${func ? 'on' : ''}`} id="w-func">
              <span className="sr" style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0 0 0 0)' }}>Função cognitiva</span>
              <select
                id="f-func"
                value={func}
                onChange={(e) => {
                  setFunc(e.target.value);
                  setLimite(12);
                }}
              >
                <option value="">Todas as funções</option>
                <option value="Atenção">Atenção</option>
                <option value="Memória">Memória</option>
                <option value="Funções executivas">Funções executivas</option>
                <option value="Linguagem">Linguagem</option>
                <option value="Habilidades visuoespaciais">Habilidades visuoespaciais</option>
                <option value="Inteligência">Inteligência</option>
                <option value="Aspectos socioemocionais">Aspectos socioemocionais</option>
                <option value="Geral">Geral</option>
              </select>
            </label>

            <button
              className="toggle-saved"
              id="f-saved"
              type="button"
              aria-pressed={savedOnly}
              onClick={() => {
                setSavedOnly(prev => !prev);
                setLimite(12);
              }}
            >
              <svg className="ico sm"><use href="#i-bookmark"/></svg>
              <span>Só os salvos</span>
            </button>

            <div className="f-right">
              <label className="sel">
                <span className="sr" style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0 0 0 0)' }}>Ordenar por</span>
                <select
                  id="f-sort"
                  value={sort}
                  onChange={(e) => setSort(e.target.value as any)}
                >
                  <option value="recentes">Mais recentes</option>
                  <option value="az">A a Z</option>
                  <option value="acessados">Mais acessados</option>
                </select>
              </label>

              <div className="view" role="group" aria-label="Modo de exibição">
                <button
                  type="button"
                  aria-pressed={view === 'grid'}
                  aria-label="Grade"
                  onClick={() => setView('grid')}
                >
                  <svg className="ico sm" viewBox="0 0 24 24"><rect x="4" y="4" width="7" height="7" rx="1.5"/><rect x="13" y="4" width="7" height="7" rx="1.5"/><rect x="4" y="13" width="7" height="7" rx="1.5"/><rect x="13" y="13" width="7" height="7" rx="1.5"/></svg>
                </button>
                <button
                  type="button"
                  aria-pressed={view === 'list'}
                  aria-label="Lista"
                  onClick={() => setView('list')}
                >
                  <svg className="ico sm" viewBox="0 0 24 24"><path d="M9 6h11M9 12h11M9 18h11M4 6h.01M4 12h.01M4 18h.01"/></svg>
                </button>
              </div>
            </div>
          </div>

          {/* Barra de Resultados e Chips */}
          <div className="result-bar" id="result-bar" aria-live="polite">
            <span>
              <b>{materiaisFiltrados.length}</b> {materiaisFiltrados.length === 1 ? 'material' : 'materiais'}
            </span>
            {q.trim() && (
              <span className="chip">
                “{q.trim()}”
                <button type="button" onClick={() => setQ('')} aria-label="Remover busca">×</button>
              </span>
            )}
            {tipo && (
              <span className="chip">
                {TIPOS[tipo as keyof typeof TIPOS]?.plural}
                <button type="button" onClick={() => setTipo('')} aria-label="Remover filtro tipo">×</button>
              </span>
            )}
            {pop && (
              <span className="chip">
                {POP[pop] || pop}
                <button type="button" onClick={() => setPop('')} aria-label="Remover filtro população">×</button>
              </span>
            )}
            {func && (
              <span className="chip">
                {func}
                <button type="button" onClick={() => setFunc('')} aria-label="Remover filtro função">×</button>
              </span>
            )}
            {savedOnly && (
              <span className="chip">
                Só os salvos
                <button type="button" onClick={() => setSavedOnly(false)} aria-label="Remover filtro salvos">×</button>
              </span>
            )}
            {(q.trim() || tipo || pop || func || savedOnly) && (
              <button className="clear" type="button" onClick={limparFiltros}>
                Limpar tudo
              </button>
            )}
          </div>

          {/* Grid ou Lista de Materiais */}
          {materiaisFiltrados.length > 0 ? (
            <div className={`grid ${view === 'list' ? 'as-list' : ''}`} id="grid">
              {materiaisVisiveis.map((m) => {
                const t = TIPOS[m.tipo] || TIPOS.guia;
                const ok = isLiberado(m);
                const sv = favorites.includes(String(m.id));
                const selo = !ok 
                  ? <span className="badge lk"><svg className="ico sm"><use href="#i-lock"/></svg>{NOME_PLANO[t.plano]}</span>
                  : m.selo === 'novo' 
                    ? <span className="badge">Novo</span>
                    : m.selo === 'atualizado' 
                      ? <span className="badge up">Atualizado</span> 
                      : null;

                return (
                  <article
                    key={m.id}
                    className={`mat ${ok ? '' : 'is-locked'}`}
                    tabIndex={0}
                    role="button"
                    onClick={() => setAbertoId(m.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setAbertoId(m.id);
                      }
                    }}
                    aria-label={`${m.titulo}, ${t.nome}${ok ? '' : `, disponível no plano ${NOME_PLANO[t.plano]}`}`}
                  >
                    <div className="mat-top">
                      <span className={`mark bg-${m.tipo}`}>
                        <svg className="ico"><use href={`#${t.ico}`}/></svg>
                      </span>
                      {selo}
                    </div>

                    <div className="body">
                      <span className={`ctag c-${m.tipo}`}>{t.nome}</span>
                      <h3>{m.titulo}</h3>
                      <p>{m.desc}</p>
                    </div>

                    <div className="meta">
                      <span>{m.formato} · {m.tamanho}</span>
                      <span>{m.pop.map(p => POP[p] || p).join(', ')}</span>
                    </div>

                    <div className="mat-foot">
                      <span className="open">
                        {ok ? 'Abrir' : 'Ver planos'}
                        <span><svg className="ico sm"><use href="#i-arrow"/></svg></span>
                      </span>
                      {selo && <span className="lbadge">{selo}</span>}
                      <button
                        className="save"
                        type="button"
                        aria-pressed={sv}
                        aria-label={sv ? 'Remover da pasta' : 'Salvar na pasta'}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(String(m.id));
                        }}
                      >
                        <svg className="ico sm"><use href="#i-bookmark"/></svg>
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="empty-state" id="empty">
              <span className="ring"><svg className="ico"><use href="#i-search"/></svg></span>
              <h3>
                {materials.length === 0 ? 'Nenhum material no acervo ainda' : 'Nenhum material encontrado'}
              </h3>
              <p>
                {materials.length === 0
                  ? 'O acervo está preparado. Novos instrumentos de rastreio, protocolos de aplicação e laudos serão cadastrados em breve pela equipe.'
                  : 'Tente outro termo ou remova alguns filtros. Se sentir falta de algum material, conte para a gente pelo suporte.'}
              </p>
              {materials.length > 0 && (
                <button className="clear" type="button" onClick={limparFiltros}>
                  Limpar busca e filtros
                </button>
              )}
            </div>
          )}

          {/* Botão Carregar Mais */}
          {materiaisFiltrados.length > limite && (
            <div className="more" id="more">
              <button
                className="btn-ghost"
                type="button"
                id="btn-more"
                onClick={() => setLimite(prev => prev + 12)}
              >
                Carregar mais <span><svg className="ico sm"><use href="#i-arrow"/></svg></span>
              </button>
              <small id="more-info">
                Mostrando {materiaisVisiveis.length} de {materiaisFiltrados.length}
              </small>
            </div>
          )}

          <div className="notice">
            <svg className="ico"><use href="#i-info"/></svg>
            <span>
              <b>Material de apoio para profissionais habilitados.</b> Os guias não substituem os manuais oficiais dos instrumentos.
            </span>
          </div>
        </main>
      </div>

      {/* Painel lateral de detalhes (Drawer) */}
      <div 
        className={`scrim ${itemAberto ? 'on' : ''}`} 
        onClick={() => setAbertoId(null)}
      />

      <aside 
        className={`drawer ${itemAberto ? 'on' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="d-title"
        aria-hidden={!itemAberto}
      >
        {itemAberto && (() => {
          const t = TIPOS[itemAberto.tipo] || TIPOS.guia;
          const ok = isLiberado(itemAberto);
          const sv = favorites.includes(String(itemAberto.id));
          const acao = itemAberto.tipo === 'aula' ? 'Assistir aula' : itemAberto.tipo === 'interativo' ? 'Abrir recurso' : 'Abrir na plataforma';

          return (
            <>
              <div className="d-top">
                <span id="d-crumb">Biblioteca · {t.plural}</span>
                <button
                  className="d-close"
                  type="button"
                  id="d-close"
                  aria-label="Fechar"
                  onClick={() => setAbertoId(null)}
                >
                  <svg className="ico" viewBox="0 0 24 24"><path d="M6 6l12 12M18 6 6 18"/></svg>
                </button>
              </div>

              <div className="d-body" id="d-body">
                <div className="d-cover">
                  <svg className="curve" viewBox="0 0 520 120" aria-hidden="true">
                    <path className="a" d="M80,120 C190,120 220,24 300,24 C380,24 410,120 520,120 Z"/>
                    <path className="c" d="M40,120 C190,120 220,24 300,24 C380,24 410,120 560,120"/>
                  </svg>
                  <span className={`mark bg-${itemAberto.tipo}`}>
                    <svg className="ico"><use href={`#${t.ico}`}/></svg>
                  </span>
                </div>

                <span className={`ctag c-${itemAberto.tipo}`} style={{ display: 'inline-flex', marginTop: '20px' }}>
                  {t.nome}
                </span>

                <h2 id="d-title">{itemAberto.titulo}</h2>
                <p className="lead">{itemAberto.desc}</p>

                {!ok && (
                  <div className="d-lock">
                    <b>
                      <svg className="ico sm"><use href="#i-lock"/></svg>
                      Disponível no plano {NOME_PLANO[t.plano]}
                    </b>
                    <p>
                      Seu plano atual não inclui {itemAberto.tipo === 'aula' ? 'as aulas gravadas' : 'os recursos interativos'}. Você pode mudar de plano quando quiser, e a diferença é ajustada na próxima cobrança.
                    </p>
                  </div>
                )}

                <dl className="dl">
                  <dt>Formato</dt>
                  <dd>{itemAberto.formato} · {itemAberto.tamanho}</dd>
                  <dt>População</dt>
                  <dd>{itemAberto.pop.map(p => POP[p] || p).join(', ')}</dd>
                  <dt>Função</dt>
                  <dd>{itemAberto.func}</dd>
                  <dt>Atualizado</dt>
                  <dd>{formatDateBR(itemAberto.data)}</dd>
                </dl>

                <div className="toc">
                  <h4>{itemAberto.tipo === 'aula' ? 'Tópicos da aula' : 'Conteúdo'}</h4>
                  <ol>
                    {itemAberto.sumario.map((s, idx) => (
                      <li key={idx}>{s}</li>
                    ))}
                  </ol>
                </div>

                {itemAberto.tipo === 'guia' && (
                  <div className="d-note">
                    <svg className="ico"><use href="#i-info"/></svg>
                    <span><b>Material de apoio.</b> Não substitui o manual oficial do instrumento.</span>
                  </div>
                )}
              </div>

              <div className="d-foot" id="d-foot">
                {ok ? (
                  <>
                    <a className="btn" href="#">
                      {acao} <span><svg className="ico sm"><use href="#i-arrow"/></svg></span>
                    </a>
                    {/PDF|DOCX/i.test(itemAberto.formato) && (
                      <a className="btn-ghost" href="#">
                        Baixar {itemAberto.formato.toUpperCase().includes('DOCX') ? 'arquivo' : 'PDF'} <span><svg className="ico sm"><use href="#i-arrow"/></svg></span>
                      </a>
                    )}
                    <button
                      className="save"
                      type="button"
                      aria-pressed={sv}
                      aria-label={sv ? 'Remover da pasta' : 'Salvar na pasta'}
                      style={{ width: '48px', height: '48px', flex: 'none' }}
                      onClick={() => toggleFavorite(String(itemAberto.id))}
                    >
                      <svg className="ico"><use href="#i-bookmark"/></svg>
                    </button>
                  </>
                ) : (
                  <Link className="btn" href="/#planos">
                    Ver planos <span><svg className="ico sm"><use href="#i-arrow"/></svg></span>
                  </Link>
                )}
              </div>
            </>
          );
        })()}
      </aside>

      {/* Barra inferior (celular) */}
      <nav className="tabbar" aria-label="Navegação móvel">
        <Link href="/plataforma">
          <svg className="ico"><use href="#i-home"/></svg>
          <span>Início</span>
        </Link>
        <Link href="/biblioteca" aria-current="page">
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
    </div>
  );
}

export default function BibliotecaPage() {
  return (
    <Suspense fallback={
      <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', background: '#efe7d2', color: '#15140f', fontFamily: 'sans-serif' }}>
        <p style={{ fontSize: '14px', letterSpacing: '0.05em' }}>Carregando biblioteca...</p>
      </div>
    }>
      <BibliotecaInner />
    </Suspense>
  );
}
