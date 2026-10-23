'use client';

import React, { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { PlatformShell } from '@/components/layout/PlatformShell';
import { getInteractiveSession, deleteInteractiveSession, StoredSessionRecord } from '@/lib/supabase';
import './dramatizacao-detalhe.css';

/* =========================================================================
   Tipos
   ========================================================================= */

interface FalaItem {
  id: string;
  lado: 'neg' | 'rac';
  texto: string;
  rodada: number;
  autor: string;
  marcas: {
    funcionou?: boolean;
    nao?: boolean;
    dificil?: boolean;
    novo?: boolean;
  };
}

interface RegistroCrenca {
  rotulo: string;
  valor: number;
}

interface DramatizacaoData {
  pensamento: string;
  emocao?: string;
  emocaoOutra?: string;
  emoIni?: number;
  crencaIni?: number;
  racionalInicial?: 'Terapeuta' | 'Paciente';
  rodada?: number;
  falas?: FalaItem[];
  crencas?: RegistroCrenca[];
  emoFim?: number | null;
  crencaFim?: number | null;
  pressupostos?: string;
  obs?: string;
  codigo?: string;
  updatedAt?: string;
}

/* =========================================================================
   Dados Demonstrativos de Referência (Fallback quando não houver registro)
   ========================================================================= */

const DEMO_DRAMATIZACAO: DramatizacaoData = {
  pensamento: 'Se eu errar na apresentação, todos vão me achar incompetente e vou ser demitido.',
  emocao: 'Ansiedade',
  emoIni: 80,
  emoFim: 45,
  crencaIni: 85,
  crencaFim: 40,
  racionalInicial: 'Terapeuta',
  rodada: 3,
  codigo: 'P-014',
  updatedAt: new Date().toISOString(),
  crencas: [
    { rotulo: 'Início', valor: 85 },
    { rotulo: 'R1', valor: 70 },
    { rotulo: 'R2', valor: 55 },
    { rotulo: 'Final', valor: 40 }
  ],
  falas: [
    // Rodada 1
    {
      id: 'f1',
      rodada: 1,
      lado: 'neg',
      autor: 'Paciente',
      texto: 'Todo mundo vai perceber que eu travei. Não tem como disfarçar.',
      marcas: { dificil: true }
    },
    {
      id: 'f2',
      rodada: 1,
      lado: 'neg',
      autor: 'Paciente',
      texto: 'Se eu errar uma vez, meu chefe vai lembrar disso para sempre.',
      marcas: {}
    },
    {
      id: 'f3',
      rodada: 1,
      lado: 'rac',
      autor: 'Terapeuta',
      texto: 'Errar um slide é diferente de ser incompetente. Você conhece alguém que foi demitido por um erro numa apresentação?',
      marcas: { funcionou: true }
    },
    {
      id: 'f4',
      rodada: 1,
      lado: 'rac',
      autor: 'Terapeuta',
      texto: 'Você é uma pessoa dedicada.',
      marcas: { nao: true }
    },
    // Rodada 2
    {
      id: 'f5',
      rodada: 2,
      lado: 'neg',
      autor: 'Terapeuta',
      texto: 'Na última reunião ninguém comentou porque ficaram com pena de você.',
      marcas: {}
    },
    {
      id: 'f6',
      rodada: 2,
      lado: 'neg',
      autor: 'Terapeuta',
      texto: 'E se eu ficar vermelho na frente da diretoria?',
      marcas: { novo: true }
    },
    {
      id: 'f7',
      rodada: 2,
      lado: 'rac',
      autor: 'Paciente',
      texto: 'Na reunião passada eu esqueci um dado, corrigi no fim e ninguém falou nada.',
      marcas: { funcionou: true }
    },
    {
      id: 'f8',
      rodada: 2,
      lado: 'rac',
      autor: 'Paciente',
      texto: 'Ficar vermelho é desconfortável, mas não mostra que eu não sei o assunto.',
      marcas: { funcionou: true }
    },
    // Rodada 3
    {
      id: 'f9',
      rodada: 3,
      lado: 'neg',
      autor: 'Paciente',
      texto: 'Mas desta vez é a diretoria.',
      marcas: {}
    },
    {
      id: 'f10',
      rodada: 3,
      lado: 'rac',
      autor: 'Terapeuta',
      texto: 'Você já apresentou para a diretoria em março. O que aconteceu de fato?',
      marcas: { funcionou: true }
    }
  ],
  pressupostos: 'Se eu errar, sou incompetente.\nPreciso ter desempenho perfeito para ser aceito no trabalho.',
  obs: 'Respondeu melhor a evidências do próprio histórico. Levar “todo mundo vai perceber” para o Exame das evidências.'
};

/* =========================================================================
   Sprite de Ícones SVG
   ========================================================================= */

function IconSprite() {
  return (
    <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true">
      <symbol id="dd-back" viewBox="0 0 24 24"><path d="M19 12H5M12 19l-7-7 7-7" /></symbol>
      <symbol id="dd-chev" viewBox="0 0 24 24"><path d="m9 18 6-6-6-6" /></symbol>
      <symbol id="dd-print" viewBox="0 0 24 24"><path d="M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2M6 14h12v8H6z" /></symbol>
      <symbol id="dd-more" viewBox="0 0 24 24"><circle cx="5" cy="12" r="1" /><circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /></symbol>
      <symbol id="dd-repeat" viewBox="0 0 24 24"><path d="M17 2l4 4-4 4" /><path d="M3 11v-1a4 4 0 0 1 4-4h14M7 22l-4-4 4-4" /><path d="M21 13v1a4 4 0 0 1-4 4H3" /></symbol>
      <symbol id="dd-cal" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></symbol>
      <symbol id="dd-clock" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></symbol>
      <symbol id="dd-layers" viewBox="0 0 24 24"><path d="m12 2 10 5-10 5L2 7z" /><path d="m2 17 10 5 10-5M2 12l10 5 10-5" /></symbol>
      <symbol id="dd-lock" viewBox="0 0 24 24"><rect x="4" y="11" width="16" height="10" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" /></symbol>
      <symbol id="dd-star" viewBox="0 0 24 24"><path d="M12 2l3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1z" /></symbol>
      <symbol id="dd-flag" viewBox="0 0 24 24"><path d="M4 22V4M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1" /></symbol>
      <symbol id="dd-x" viewBox="0 0 24 24"><path d="M18 6 6 18M6 6l12 12" /></symbol>
      <symbol id="dd-plus" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14" /></symbol>
      <symbol id="dd-check" viewBox="0 0 24 24"><path d="M20 6 9 17l-5-5" /></symbol>
      <symbol id="dd-rule" viewBox="0 0 24 24"><path d="M4 6h16M4 12h10M4 18h7" /></symbol>
      <symbol id="dd-drama" viewBox="0 0 48 48">
        <path d="M10 8h12a5 5 0 0 1 5 5v6a5 5 0 0 1-5 5h-8l-5 4.2v-4.6a5 5 0 0 1-4-4.9V13a5 5 0 0 1 5-5z" fill="currentColor" fillOpacity=".18" />
        <path d="M10.5 14h11M10.5 18h7" />
        <path d="M26 19h12a5 5 0 0 1 5 5v5.7a5 5 0 0 1-4 4.9v4.6l-5-4.2h-8a5 5 0 0 1-5-5v-6a5 5 0 0 1 5-5z" fill="#e3f2cc" />
        <path d="M27.5 26.6l2.6 2.6 5.4-5.4" />
        <path d="M31.5 7.5a8 8 0 0 1 8.5 7" />
        <path d="M38 12.8l2 1.9 1.9-2.2" />
        <path d="M16.5 40.5a8 8 0 0 1-8.5-7" />
        <path d="M10 35.2l-2-1.9-1.9 2.2" />
      </symbol>
    </svg>
  );
}

function Icon({ id, sm }: { id: string; sm?: boolean }) {
  return (
    <svg className={`dd-icon ${sm ? 'dd-icon-sm' : ''}`} aria-hidden="true">
      <use href={`#dd-${id}`} />
    </svg>
  );
}

/* =========================================================================
   Componente do Gráfico de Crença
   ========================================================================= */

function GraficoCrenca({ crencas }: { crencas: { rotulo: string; valor: number }[] }) {
  const pontos = useMemo(() => {
    if (!crencas || crencas.length < 2) return null;
    const n = crencas.length;
    const paddingX = 40;
    const totalW = 400;
    const stepX = (totalW - paddingX * 2) / (n - 1);
    
    // Y vai de 20 (valor 100) a 180 (valor 0)
    const mapY = (val: number) => {
      const clamped = Math.max(0, Math.min(100, val));
      return 180 - (clamped / 100) * 160;
    };

    return crencas.map((c, i) => ({
      ...c,
      x: paddingX + i * stepX,
      y: mapY(c.valor)
    }));
  }, [crencas]);

  if (!pontos) return null;

  const polylineStr = pontos.map((p) => `${p.x},${p.y}`).join(' ');
  const areaPath = `M${pontos[0].x} ${pontos[0].y} ` +
    pontos.slice(1).map((p) => `L${p.x} ${p.y}`).join(' ') +
    ` L${pontos[pontos.length - 1].x} 180 L${pontos[0].x} 180 Z`;

  return (
    <svg viewBox="0 0 400 210" role="img" aria-label="Evolução da crença por rodada">
      {/* Linhas de grade horizontais */}
      <g stroke="#e2d9c6">
        <line x1="20" y1="20" x2="380" y2="20" strokeDasharray="3 3" />
        <line x1="20" y1="100" x2="380" y2="100" strokeDasharray="3 3" />
        <line x1="20" y1="180" x2="380" y2="180" />
      </g>

      {/* Área sob a linha */}
      <path d={areaPath} fill="#d6f5a3" opacity=".5" />

      {/* Linha da crença */}
      <polyline
        points={polylineStr}
        fill="none"
        stroke="#2b5c35"
        strokeWidth="3"
        strokeLinejoin="round"
      />

      {/* Círculos nos pontos */}
      <g fill="#fcfbf7" stroke="#2b5c35" strokeWidth="2.5">
        {pontos.map((p, i) => (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r={i === pontos.length - 1 ? 6 : 5}
            fill={i === pontos.length - 1 ? '#2b5c35' : '#fcfbf7'}
          />
        ))}
      </g>

      {/* Valores numéricos acima dos pontos */}
      <g fontFamily="IBM Plex Mono, monospace" fontSize="13" fill="#1f2620" textAnchor="middle">
        {pontos.map((p, i) => (
          <text key={i} x={p.x} y={Math.max(16, p.y - 12)}>
            {p.valor}
          </text>
        ))}
      </g>

      {/* Rótulos dos eixos */}
      <g fontFamily="Inter, sans-serif" fontSize="11" fill="#6a6555" textAnchor="middle">
        {pontos.map((p, i) => (
          <text key={i} x={p.x} y="200">
            {p.rotulo}
          </text>
        ))}
      </g>
    </svg>
  );
}

/* =========================================================================
   Conteúdo Interno do Detalhe da Dramatização
   ========================================================================= */

function DetalheDramatizacaoContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const pacienteQuery = searchParams.get('paciente') || '';
  const [dataSessao, setDataSessao] = useState<DramatizacaoData>(DEMO_DRAMATIZACAO);
  const [carregando, setCarregando] = useState<boolean>(true);
  const [menuAberto, setMenuAberto] = useState<boolean>(false);
  const [showModalExcluir, setShowModalExcluir] = useState<boolean>(false);
  const [excluindo, setExcluindo] = useState<boolean>(false);
  const [toast, setToast] = useState<string | null>(null);

  const menuRef = useRef<HTMLDivElement>(null);
  const toastTimer = useRef<NodeJS.Timeout | null>(null);

  const avisar = (msg: string) => {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2400);
  };

  // Carrega a sessão salva no Supabase ou localStorage
  useEffect(() => {
    let ativo = true;

    async function carregar() {
      const codigoAlvo = pacienteQuery.trim() || 'Paciente 01';

      // 1. Tenta cache local
      try {
        const raw =
          localStorage.getItem(`na_session_dramatizacao_arena_${codigoAlvo}`) ||
          localStorage.getItem('na-dramatizacao-v1');
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed && (parsed.pensamento || parsed.falas?.length)) {
            setDataSessao({ ...DEMO_DRAMATIZACAO, ...parsed, codigo: codigoAlvo });
          }
        }
      } catch (e) {
        console.warn('Erro ao carregar cache local:', e);
      }

      // 2. Busca do Supabase
      try {
        const sessao = await getInteractiveSession('dramatizacao', 'arena', codigoAlvo);
        if (ativo && sessao && sessao.data) {
          setDataSessao({
            ...DEMO_DRAMATIZACAO,
            ...sessao.data,
            codigo: codigoAlvo,
            updatedAt: sessao.updated_at || sessao.created_at || new Date().toISOString()
          });
        }
      } catch (err) {
        console.warn('Erro ao carregar sessão em nuvem:', err);
      } finally {
        if (ativo) setCarregando(false);
      }
    }

    carregar();
    return () => {
      ativo = false;
    };
  }, [pacienteQuery]);

  // Fechar menu ao clicar fora
  useEffect(() => {
    const clickFora = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuAberto(false);
      }
    };
    document.addEventListener('mousedown', clickFora);
    return () => document.removeEventListener('mousedown', clickFora);
  }, []);

  // Variáveis calculadas
  const codigo = dataSessao.codigo || pacienteQuery || 'Paciente 01';
  const pensamento = dataSessao.pensamento || 'Pensamento disfuncional sem registro';
  const crencaIni = typeof dataSessao.crencaIni === 'number' ? dataSessao.crencaIni : 85;
  const crencaFim = typeof dataSessao.crencaFim === 'number' ? dataSessao.crencaFim : 40;
  const deltaCrenca = crencaFim - crencaIni;

  const emoIni = typeof dataSessao.emoIni === 'number' ? dataSessao.emoIni : 80;
  const emoFim = typeof dataSessao.emoFim === 'number' ? dataSessao.emoFim : 45;
  const deltaEmo = emoFim - emoIni;

  const falas = dataSessao.falas || [];
  const totalFalas = falas.length;
  const falasRacionais = falas.filter((f) => f.lado === 'rac');
  const falasQueFuncionaram = falasRacionais.filter((f) => f.marcas?.funcionou);
  const falasDificeisOuNovas = falas.filter((f) => f.marcas?.dificil || f.marcas?.novo);

  // Agrupamento por rodadas
  const rodadas = useMemo(() => {
    const mapa = new Map<number, { neg: FalaItem[]; rac: FalaItem[] }>();
    falas.forEach((f) => {
      const r = f.rodada || 1;
      if (!mapa.has(r)) mapa.set(r, { neg: [], rac: [] });
      const grupo = mapa.get(r)!;
      if (f.lado === 'neg') grupo.neg.push(f);
      else grupo.rac.push(f);
    });

    const lista = Array.from(mapa.entries()).map(([num, cols]) => {
      // Quem está no lado racional nesta rodada?
      const ini = dataSessao.racionalInicial || 'Terapeuta';
      const outro = ini === 'Terapeuta' ? 'Paciente' : 'Terapeuta';
      const quemRac = num % 2 === 1 ? ini : outro;
      const quemNeg = quemRac === 'Terapeuta' ? 'Paciente' : 'Terapeuta';

      // Crença ao fim da rodada
      let crencaFimRodada = crencaFim;
      if (dataSessao.crencas && dataSessao.crencas.length) {
        const achou = dataSessao.crencas.find(
          (c) => c.rotulo.toLowerCase() === `r${num}` || c.rotulo.toLowerCase().includes(`rodada ${num}`)
        );
        if (achou) crencaFimRodada = achou.valor;
      }

      return {
        num,
        quemRac,
        quemNeg,
        crencaFimRodada,
        neg: cols.neg,
        rac: cols.rac
      };
    });

    return lista.sort((a, b) => a.num - b.num);
  }, [falas, dataSessao.racionalInicial, dataSessao.crencas, crencaFim]);

  // Lista de crenças para o gráfico
  const crencasGrafico = useMemo(() => {
    if (dataSessao.crencas && dataSessao.crencas.length >= 2) {
      return dataSessao.crencas;
    }
    // Fallback derivado
    const g = [{ rotulo: 'Início', valor: crencaIni }];
    rodadas.forEach((r) => {
      g.push({ rotulo: `R${r.num}`, valor: r.crencaFimRodada });
    });
    if (g.length === 1) g.push({ rotulo: 'Final', valor: crencaFim });
    return g;
  }, [dataSessao.crencas, crencaIni, crencaFim, rodadas]);

  // Data formatada
  const dataFormatada = useMemo(() => {
    try {
      const d = new Date(dataSessao.updatedAt || Date.now());
      return d.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch {
      return '20 out 2026';
    }
  }, [dataSessao.updatedAt]);

  // Repetir dramatização com o mesmo pensamento
  const handleRepetir = () => {
    router.push(
      `/recursos-interativos/dramatizacao?paciente=${encodeURIComponent(codigo)}&pensamento=${encodeURIComponent(pensamento)}`
    );
  };

  // Copiar resumo
  const handleCopiarResumo = () => {
    const texto = `Dramatização dos Dois Lados (${codigo})\nPensamento: "${pensamento}"\nCrença: ${crencaIni} → ${crencaFim} (${deltaCrenca > 0 ? `+${deltaCrenca}` : deltaCrenca} pts)\nAnsiedade: ${emoIni} → ${emoFim} (${deltaEmo > 0 ? `+${deltaEmo}` : deltaEmo} pts)\n${totalFalas} falas em ${rodadas.length || 1} rodadas.`;
    navigator.clipboard?.writeText(texto);
    avisar('Resumo copiado para a área de transferência');
    setMenuAberto(false);
  };

  // Excluir a sessão salva de dramatização
  const handleExcluir = async () => {
    setExcluindo(true);
    try {
      const sessionId = searchParams.get('id') || undefined;
      await deleteInteractiveSession('dramatizacao', 'arena', codigo, sessionId);
      avisar('Intervenção excluída com sucesso');
      setTimeout(() => {
        router.push(`/recursos-interativos/pacientes?paciente=${encodeURIComponent(codigo)}`);
      }, 350);
    } catch (e) {
      console.warn('Erro ao excluir:', e);
      setExcluindo(false);
      setShowModalExcluir(false);
    }
  };

  return (
    <div className="dd">
      <IconSprite />

      <div className="dd-page">
        {/* Caminho de Navegação (Breadcrumbs) */}
        <nav className="dd-crumbs" aria-label="Caminho">
          <Link href="/recursos-interativos/pacientes">
            <Icon id="back" sm />
            Dossiê clínico
          </Link>
          <Icon id="chev" sm />
          <Link href={`/recursos-interativos/pacientes?paciente=${encodeURIComponent(codigo)}`}>
            {codigo}
          </Link>
          <Icon id="chev" sm />
          <b>Dramatização · {dataFormatada}</b>
        </nav>

        {/* Hero Card */}
        <section className="dd-card dd-hero" id="hero">
          <div className="dd-hero-top">
            <div className="dd-hero-main">
              <span className="dd-type">
                <span className="dd-type-ico">
                  <img
                    src="/assets/recursos/cards/05_dramatizacao_dois_lados.png"
                    alt="Dramatização dos dois lados"
                    width={40}
                    height={40}
                  />
                </span>
                Dramatização dos dois lados
              </span>
              <h1>“{pensamento}”</h1>
              <div className="dd-meta">
                <span>
                  <Icon id="cal" sm />
                  {dataFormatada}
                </span>
                <span>
                  <Icon id="layers" sm />
                  {rodadas.length || 1} {rodadas.length === 1 ? 'rodada' : 'rodadas'} · {totalFalas} falas
                </span>
                <span>
                  <Icon id="clock" sm />
                  ~20 min
                </span>
                <span>
                  <Icon id="lock" sm />
                  Sigilo profissional
                </span>
              </div>
            </div>

            <div className="dd-hero-actions" ref={menuRef}>
              <button
                type="button"
                className="dd-btn dd-btn-primary"
                onClick={handleRepetir}
              >
                <Icon id="repeat" />
                Repetir com este pensamento
              </button>
              <button
                type="button"
                className="dd-btn"
                onClick={() => window.print()}
              >
                <Icon id="print" />
                Imprimir
              </button>
              <button
                type="button"
                className="dd-btn dd-btn-icon"
                aria-label="Mais opções"
                title="Mais opções"
                onClick={() => setMenuAberto((a) => !a)}
              >
                <Icon id="more" />
              </button>

              {menuAberto && (
                <div className="dd-menu" role="menu">
                  <button type="button" role="menuitem" onClick={handleCopiarResumo}>
                    Copiar resumo do caso
                  </button>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      router.push(`/recursos-interativos/pacientes?paciente=${encodeURIComponent(codigo)}`);
                    }}
                  >
                    Voltar ao Dossiê do paciente
                  </button>
                  <hr style={{ border: 0, borderTop: '1px solid var(--dd-line)', margin: '4px 0' }} />
                  <button
                    type="button"
                    role="menuitem"
                    style={{ color: '#a8261d', fontWeight: 600 }}
                    onClick={() => {
                      setMenuAberto(false);
                      setShowModalExcluir(true);
                    }}
                  >
                    Excluir intervenção
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Métricas Principais */}
          <div className="dd-metrics" id="metrics">
            <div className="dd-metric">
              <span className="dd-lbl">Crença no pensamento</span>
              <div className="dd-nums">
                <span className="dd-from">{crencaIni}</span>
                <span className="dd-muted">→</span>
                <span className="dd-to">{crencaFim}</span>
                <span className="dd-delta">
                  {deltaCrenca < 0 ? `${deltaCrenca} pontos` : `+${deltaCrenca} pontos`}
                </span>
              </div>
            </div>

            <div className="dd-metric">
              <span className="dd-lbl">Intensidade da ansiedade</span>
              <div className="dd-nums">
                <span className="dd-from">{emoIni}</span>
                <span className="dd-muted">→</span>
                <span className="dd-to">{emoFim}</span>
                <span className="dd-delta">
                  {deltaEmo < 0 ? `${deltaEmo} pontos` : `+${deltaEmo} pontos`}
                </span>
              </div>
            </div>

            <div className="dd-metric">
              <span className="dd-lbl">Respostas racionais</span>
              <div className="dd-nums">
                <span className="dd-to">{falasQueFuncionaram.length}</span>
                <span className="dd-from">/ {falasRacionais.length || 1}</span>
                <span className="dd-delta">funcionaram</span>
              </div>
            </div>
          </div>
        </section>

        {/* Grade de 2 Colunas: Debate + Painéis Laterais */}
        <div className="dd-two">
          {/* Coluna Esquerda: O Debate Rodada a Rodada */}
          <section className="dd-card dd-panel" id="debate">
            <div className="dd-panel-head">
              <h2>O debate, rodada a rodada</h2>
              <span className="dd-eyebrow">{totalFalas} falas</span>
            </div>

            {rodadas.length === 0 ? (
              <div className="dd-muted" style={{ padding: '24px', textAlign: 'center' }}>
                Nenhuma fala registrada nesta dramatização.
              </div>
            ) : (
              rodadas.map((r) => (
                <div className="dd-round" key={r.num}>
                  <div className="dd-round-head">
                    <span className="dd-rn">R{r.num}</span>
                    <span>{r.quemRac} no lado racional</span>
                    <span className="dd-bel">
                      Crença ao fim <b>{r.crencaFimRodada}</b>
                    </span>
                  </div>

                  <div className="dd-cols">
                    {/* Coluna Negativa */}
                    <div className="dd-col dd-col-neg">
                      <span className="dd-col-lbl">
                        Negativo <span className="dd-who">{r.quemNeg}</span>
                      </span>
                      {r.neg.length === 0 ? (
                        <div className="dd-muted" style={{ fontSize: '12px', padding: '6px' }}>
                          Sem falas negativas nesta rodada.
                        </div>
                      ) : (
                        r.neg.map((f) => (
                          <div className="dd-fala" key={f.id}>
                            {f.texto}
                            <div className="dd-tags">
                              {f.marcas?.dificil && (
                                <span className="dd-tag t-flag">
                                  <Icon id="flag" sm />
                                  Difícil de rebater
                                </span>
                              )}
                              {f.marcas?.novo && (
                                <span className="dd-tag t-new">
                                  <Icon id="plus" sm />
                                  Novo
                                </span>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Coluna Racional */}
                    <div className="dd-col dd-col-rac">
                      <span className="dd-col-lbl">
                        Racional <span className="dd-who">{r.quemRac}</span>
                      </span>
                      {r.rac.length === 0 ? (
                        <div className="dd-muted" style={{ fontSize: '12px', padding: '6px' }}>
                          Sem falas racionais nesta rodada.
                        </div>
                      ) : (
                        r.rac.map((f) => (
                          <div className="dd-fala" key={f.id}>
                            {f.texto}
                            <div className="dd-tags">
                              {f.marcas?.funcionou && (
                                <span className="dd-tag t-ok">
                                  <Icon id="star" sm />
                                  Funcionou
                                </span>
                              )}
                              {f.marcas?.nao && (
                                <span className="dd-tag t-no">
                                  <Icon id="x" sm />
                                  Não funcionou
                                </span>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </section>

          {/* Coluna Direita: Gráficos, Resumos e Anotações */}
          <div className="dd-side-stack">
            {/* Gráfico de Crença */}
            <section className="dd-card dd-panel dd-chart" id="chart">
              <div className="dd-panel-head">
                <h2>Crença por rodada</h2>
                <span className="dd-eyebrow">0–100</span>
              </div>
              <GraficoCrenca crencas={crencasGrafico} />
            </section>

            {/* Resumo de Respostas */}
            <section className="dd-card dd-panel" id="resumo">
              <div className="dd-lh">
                <span className="dd-ico" style={{ background: 'var(--dd-select)', color: 'var(--dd-action-hover)' }}>
                  <Icon id="star" sm />
                </span>
                Respostas que funcionaram
                <span className="dd-n">{falasQueFuncionaram.length}</span>
              </div>
              <ul className="dd-list">
                {falasQueFuncionaram.length === 0 ? (
                  <li className="dd-muted" style={{ fontStyle: 'italic' }}>
                    Nenhuma resposta marcada como funcionou ainda.
                  </li>
                ) : (
                  falasQueFuncionaram.map((f) => <li key={f.id}>{f.texto}</li>)
                )}
              </ul>

              {falasDificeisOuNovas.length > 0 && (
                <>
                  <div className="dd-lh" style={{ marginTop: '8px' }}>
                    <span className="dd-ico" style={{ background: 'var(--dd-warn-bg)', color: 'var(--dd-warn-ink)' }}>
                      <Icon id="flag" sm />
                    </span>
                    Para continuar trabalhando
                    <span className="dd-n">{falasDificeisOuNovas.length}</span>
                  </div>
                  <ul className="dd-list">
                    {falasDificeisOuNovas.map((f) => (
                      <li key={f.id}>{f.texto}</li>
                    ))}
                  </ul>
                </>
              )}
            </section>

            {/* Pressupostos e Observações */}
            <section className="dd-card dd-panel" id="notas">
              {dataSessao.pressupostos ? (
                <>
                  <div className="dd-lh">
                    <span className="dd-ico" style={{ background: 'var(--dd-sunken)' }}>
                      <Icon id="rule" sm />
                    </span>
                    Pressupostos subjacentes
                  </div>
                  <ul className="dd-list">
                    {dataSessao.pressupostos
                      .split('\n')
                      .map((p) => p.trim())
                      .filter(Boolean)
                      .map((p, idx) => (
                        <li key={idx}>{p}</li>
                      ))}
                  </ul>
                </>
              ) : null}

              {dataSessao.obs ? (
                <>
                  <div className="dd-panel-head" style={{ marginTop: '4px' }}>
                    <span className="dd-lh">Observações da sessão</span>
                    <span className="dd-private">
                      <Icon id="lock" sm />
                      Só você vê
                    </span>
                  </div>
                  <div className="dd-note">{dataSessao.obs}</div>
                </>
              ) : null}

              <div className="dd-hw">
                <span className="dd-ok">
                  <Icon id="check" sm />
                </span>
                <div>
                  <b style={{ fontSize: '14px', display: 'block' }}>Tarefa de casa registrada</b>
                  <div className="dd-muted" style={{ fontSize: '12px' }}>
                    Resumo do caso + folha “Os dois lados, em casa”
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>

        {/* Rodapé da Página */}
        <p className="dd-muted" style={{ margin: 0, fontSize: '12px' }}>
          Base: Leahy, R. L. Técnicas de Terapia Cognitiva, cap. 3.
        </p>
      </div>

      {/* Modal de Confirmação de Exclusão */}
      {showModalExcluir && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 100,
            background: 'rgba(31, 38, 32, 0.45)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px'
          }}
          onClick={() => !excluindo && setShowModalExcluir(false)}
        >
          <div
            className="dd-card dd-panel"
            style={{ maxWidth: '440px', width: '100%', gap: '14px' }}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <h2>Excluir esta intervenção?</h2>
            <p className="dd-muted" style={{ margin: 0 }}>
              Os dados desta dramatização de <strong style={{ color: 'var(--dd-ink)' }}>{codigo}</strong> serão apagados permanentemente do histórico do paciente.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
              <button
                type="button"
                className="dd-btn"
                disabled={excluindo}
                onClick={() => setShowModalExcluir(false)}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="dd-btn"
                style={{ background: '#a8261d', color: '#fff', borderColor: '#a8261d' }}
                disabled={excluindo}
                onClick={handleExcluir}
              >
                {excluindo ? 'Excluindo...' : 'Excluir intervenção'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Informativo */}
      <div className={`dd-toast ${toast ? 'dd-toast--show' : ''}`} role="status" aria-live="polite">
        {toast}
      </div>
    </div>
  );
}

/* =========================================================================
   Página Exportada com Suspense (obrigatório pelo Next.js com useSearchParams)
   ========================================================================= */

export default function DramatizacaoDetalhePage() {
  return (
    <PlatformShell activePage="recursos">
      <Suspense
        fallback={
          <div style={{ padding: '60px 20px', textAlign: 'center', color: '#6a6555' }}>
            Carregando dramatização...
          </div>
        }
      >
        <DetalheDramatizacaoContent />
      </Suspense>
    </PlatformShell>
  );
}
