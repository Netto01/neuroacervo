'use client';

import React, { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  getAllUserInteractiveSessions,
  deleteInteractiveSession,
  StoredSessionRecord,
  EvolucaoSessionData
} from '@/lib/supabase';
import './evolucoes-historico.css';

/* =========================================================================
   Sprite de Ícones
   ========================================================================= */

function IconSprite() {
  return (
    <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true">
      <symbol id="i-back" viewBox="0 0 24 24">
        <path d="M19 12H5M12 19l-7-7 7-7" />
      </symbol>
      <symbol id="i-print" viewBox="0 0 24 24">
        <path d="M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2M6 14h12v8H6z" />
      </symbol>
      <symbol id="i-check" viewBox="0 0 24 24">
        <path d="M20 6 9 17l-5-5" />
      </symbol>
      <symbol id="i-plus" viewBox="0 0 24 24">
        <path d="M12 5v14M5 12h14" />
      </symbol>
      <symbol id="i-edit" viewBox="0 0 24 24">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
      </symbol>
      <symbol id="i-trash" viewBox="0 0 24 24">
        <polyline points="3 6 5 6 21 6" />
        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      </symbol>
      <symbol id="i-search" viewBox="0 0 24 24">
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </symbol>
      <symbol id="i-lock" viewBox="0 0 24 24">
        <rect x="4" y="11" width="16" height="10" rx="2" />
        <path d="M8 11V7a4 4 0 0 1 8 0v4" />
      </symbol>
      <symbol id="i-evo" viewBox="0 0 48 48">
        <path d="M4 40.5h40" />
        <path d="M9.5 40.5v-3.5" />
        <path
          d="M9.5 37.5c-2.4-.1-3.8-1.6-3.9-3.6 2.2.1 3.8 1.5 3.9 3.6z"
          fill="#a9b897"
          fillOpacity=".55"
        />
        <path d="M22 40.5v-10" />
        <path
          d="M22 33.5c-3.3-.1-5.5-2.3-5.6-5.2 3.1.1 5.4 2.2 5.6 5.2z"
          fill="#a9b897"
          fillOpacity=".55"
        />
        <path
          d="M22 31c.1-3.3 2.3-5.5 5.2-5.6-.1 3.1-2.2 5.4-5.2 5.6z"
          fill="#a9b897"
          fillOpacity=".55"
        />
        <path d="M37 40.5V20" />
        <path
          d="M37 32.5c-3.8-.1-6.4-2.6-6.5-6 3.6.1 6.3 2.6 6.5 6z"
          fill="#a9b897"
          fillOpacity=".55"
        />
        <path
          d="M37 28c.1-3.8 2.6-6.4 6-6.5-.1 3.6-2.6 6.3-6 6.5z"
          fill="#a9b897"
          fillOpacity=".55"
        />
        <path
          d="M37 21.5c-2.7-.6-4.2-2.8-3.8-5.5 2.6.5 4.2 2.7 3.8 5.5z"
          fill="#a9b897"
          fillOpacity=".55"
        />
        <path d="M8 16.5c8-6 18-8 27-5.5" strokeDasharray="2.4 2.6" />
        <path d="M32.2 8.2l3.2 2.6-2.4 3.4" />
      </symbol>
    </svg>
  );
}

const HUMOR_LABELS = [
  'Muito rebaixado',
  'Muito rebaixado',
  'Rebaixado',
  'Rebaixado',
  'Instável',
  'Razoável',
  'Razoável / estável',
  'Bom',
  'Bom',
  'Ótimo',
  'Pleno'
];

function formatarData(iso?: string): string {
  if (!iso) return 'Data não informada';
  try {
    const raw = iso.includes('T') ? iso.split('T')[0] : iso;
    const partes = raw.split('-');
    if (partes.length === 3) {
      const d = new Date(Number(partes[0]), Number(partes[1]) - 1, Number(partes[2]));
      return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
    }
    return iso;
  } catch {
    return iso;
  }
}

function formatarDataCurta(iso?: string): string {
  if (!iso) return '';
  try {
    const raw = iso.includes('T') ? iso.split('T')[0] : iso;
    const partes = raw.split('-');
    if (partes.length === 3) {
      const d = new Date(Number(partes[0]), Number(partes[1]) - 1, Number(partes[2]));
      return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
    }
    return iso;
  } catch {
    return iso;
  }
}

/* =========================================================================
   Componente de Conteúdo do Prontuário de Evoluções
   ========================================================================= */

function EvolucoesHistoricoContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const pacienteCodigo = searchParams.get('paciente') || 'Paciente 01';

  const [sessoes, setSessoes] = useState<StoredSessionRecord[]>([]);
  const [carregando, setCarregando] = useState<boolean>(true);
  const [busca, setBusca] = useState<string>('');
  const [ordem, setOrdem] = useState<'desc' | 'asc'>('desc');
  const [itemParaExcluir, setItemParaExcluir] = useState<StoredSessionRecord | null>(null);
  const [excluindo, setExcluindo] = useState<boolean>(false);
  const [toast, setToast] = useState<string | null>(null);

  const toastTimer = useRef<NodeJS.Timeout | null>(null);
  const avisar = (msg: string) => {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2500);
  };

  // Carrega todas as sessões de evolução do paciente
  const carregarSessoes = async () => {
    setCarregando(true);
    try {
      const todas = await getAllUserInteractiveSessions();
      const doPaciente = todas.filter(
        (s) => (s.patient_code || '').trim().toLowerCase() === pacienteCodigo.trim().toLowerCase()
      );
      const evols = doPaciente.filter((s) => s.resource_type === 'evolucao');
      setSessoes(evols);
    } catch (err) {
      console.warn('Erro ao carregar evoluções:', err);
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    carregarSessoes();
  }, [pacienteCodigo]);

  // Lista ordenada e filtrada
  const sessoesFiltradas = useMemo(() => {
    const termo = busca.trim().toLowerCase();

    const filtradas = sessoes.filter((s) => {
      if (!termo) return true;
      const d = (s.data || {}) as EvolucaoSessionData;
      const numMatch = String(d.numeroSessao || '').includes(termo);
      const temasMatch = (d.temas || d.temasAbordados || '').toLowerCase().includes(termo);
      const tecnicasMatch = (Array.isArray(d.tecnicas) ? d.tecnicas.join(' ') : (d.intervencoes || '')).toLowerCase().includes(termo);
      const respMatch = (d.resposta || d.evolucaoClinica || '').toLowerCase().includes(termo);
      const combMatch = (d.combinados || d.tarefasCombinados || '').toLowerCase().includes(termo);
      const obsMatch = (d.obs || '').toLowerCase().includes(termo);
      const compMatch = (Array.isArray(d.comportamento) ? d.comportamento.join(' ') : '').toLowerCase().includes(termo);
      const modMatch = (d.modalidade || '').toLowerCase().includes(termo);
      return numMatch || temasMatch || tecnicasMatch || respMatch || combMatch || obsMatch || compMatch || modMatch;
    });

    return filtradas.sort((a, b) => {
      const dA = a.data as EvolucaoSessionData;
      const dB = b.data as EvolucaoSessionData;
      const numA = dA?.numeroSessao ?? 0;
      const numB = dB?.numeroSessao ?? 0;
      if (ordem === 'asc') {
        return numA - numB;
      }
      return numB - numA;
    });
  }, [sessoes, busca, ordem]);

  // Métricas do caso
  const metricas = useMemo(() => {
    const total = sessoes.length;
    if (total === 0) {
      return {
        total: 0,
        periodo: 'Nenhum atendimento',
        mediaHumor: '—',
        humorRotulo: '',
        modalidadeRatio: '—'
      };
    }

    // Datas ordenadas
    const datas = sessoes
      .map((s) => (s.data as EvolucaoSessionData)?.dataSessao)
      .filter(Boolean)
      .sort();

    const primeira = datas[0] ? formatarDataCurta(datas[0]) : '';
    const ultima = datas[datas.length - 1] ? formatarDataCurta(datas[datas.length - 1]) : '';
    const periodo = primeira && ultima ? (primeira === ultima ? primeira : `${primeira} — ${ultima}`) : 'Período recente';

    // Média de humor
    const humores = sessoes
      .map((s) => (s.data as EvolucaoSessionData)?.humor)
      .filter((h): h is number => typeof h === 'number');

    const soma = humores.reduce((acc, v) => acc + v, 0);
    const media = humores.length > 0 ? (soma / humores.length).toFixed(1) : '—';
    const mediaInt = humores.length > 0 ? Math.round(soma / humores.length) : null;
    const humorRotulo = mediaInt !== null ? HUMOR_LABELS[mediaInt] : '';

    // Modalidades
    const presenciais = sessoes.filter((s) => {
      const m = ((s.data as EvolucaoSessionData)?.modalidade || '').toLowerCase();
      return m === 'presencial';
    }).length;
    const pctPresencial = Math.round((presenciais / total) * 100);
    const modalidadeRatio = `${pctPresencial}% Presencial`;

    return {
      total,
      periodo,
      mediaHumor: media,
      humorRotulo,
      modalidadeRatio
    };
  }, [sessoes]);

  // Gráfico cronológico de humor
  const historicoCronologicoHumor = useMemo(() => {
    const ordenadasPorSessao = [...sessoes].sort((a, b) => {
      const numA = (a.data as EvolucaoSessionData)?.numeroSessao ?? 0;
      const numB = (b.data as EvolucaoSessionData)?.numeroSessao ?? 0;
      return numA - numB;
    });

    const pontos: { num: number; data?: string; humor: number }[] = [];
    for (const s of ordenadasPorSessao) {
      const d = s.data as EvolucaoSessionData;
      if (d && typeof d.humor === 'number') {
        pontos.push({
          num: d.numeroSessao || 1,
          data: d.dataSessao,
          humor: d.humor
        });
      }
    }
    return pontos;
  }, [sessoes]);

  // Exclusão de evolução
  const confirmarExclusao = async () => {
    if (!itemParaExcluir) return;
    setExcluindo(true);
    try {
      await deleteInteractiveSession(
        'evolucao',
        itemParaExcluir.resource_id,
        pacienteCodigo,
        itemParaExcluir.id
      );
      avisar('Evolução de sessão excluída com sucesso.');
      setItemParaExcluir(null);
      carregarSessoes();
    } catch (err) {
      console.error(err);
      avisar('Erro ao excluir evolução.');
    } finally {
      setExcluindo(false);
    }
  };

  return (
    <div className="evs-root">
      <IconSprite />

      {/* Topo fixo com ações */}
      <header className="top">
        <div className="top-in">
          <div className="ttl">
            <span className="ttl-ico">
              <svg width="30" height="30" viewBox="0 0 48 48" fill="none" stroke="#56704f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <use href="#i-evo" />
              </svg>
            </span>
            <div style={{ minWidth: 0 }}>
              <Link
                href={`/recursos-interativos/pacientes?paciente=${encodeURIComponent(pacienteCodigo)}`}
                className="back"
              >
                <svg className="icon icon-sm">
                  <use href="#i-back" />
                </svg>
                Dossiê · {pacienteCodigo}
              </Link>
              <h1>Prontuário de Evoluções</h1>
            </div>
            <span className="badge">
              <svg className="icon icon-sm">
                <use href="#i-lock" />
              </svg>
              Sigilo CFP / LGPD
            </span>
          </div>

          <button
            type="button"
            className="btn"
            onClick={() => window.print()}
            disabled={sessoes.length === 0}
          >
            <svg className="icon">
              <use href="#i-print" />
            </svg>
            Imprimir Prontuário Completo
          </button>

          <Link
            href={`/recursos-interativos/pacientes/evolucao?paciente=${encodeURIComponent(pacienteCodigo)}&novo=1`}
            className="btn btn-primary"
          >
            <svg className="icon">
              <use href="#i-plus" />
            </svg>
            Nova Evolução de Sessão
          </Link>
        </div>
      </header>

      {/* Conteúdo em tela */}
      <main className="page">
        {/* Cards de Métricas Clínicas do Paciente */}
        <div className="evs-metrics">
          <div className="card evs-metric-card">
            <span className="eyebrow">Total de Atendimentos</span>
            <div className="evs-metric-val">
              {metricas.total}
              <small style={{ fontSize: 13, fontWeight: 500, color: 'var(--muted)' }}>
                {metricas.total === 1 ? 'sessão' : 'sessões'}
              </small>
            </div>
            <span className="evs-metric-sub">Registradas no prontuário</span>
          </div>

          <div className="card evs-metric-card">
            <span className="eyebrow">Período de Acompanhamento</span>
            <div className="evs-metric-val" style={{ fontSize: 18, lineHeight: '28px' }}>
              {metricas.periodo}
            </div>
            <span className="evs-metric-sub">Histórico do tratamento</span>
          </div>

          <div className="card evs-metric-card">
            <span className="eyebrow">Média de Humor Observado</span>
            <div className="evs-metric-val">
              {metricas.mediaHumor}
              {metricas.mediaHumor !== '—' && (
                <small style={{ fontSize: 14, fontWeight: 500, color: 'var(--muted)' }}>/ 10</small>
              )}
            </div>
            <span className="evs-metric-sub">
              {metricas.humorRotulo ? `${metricas.humorRotulo}` : 'Sem dados suficientes'}
            </span>
          </div>

          <div className="card evs-metric-card">
            <span className="eyebrow">Modalidade de Atendimento</span>
            <div className="evs-metric-val" style={{ fontSize: 18, lineHeight: '28px' }}>
              {metricas.modalidadeRatio}
            </div>
            <span className="evs-metric-sub">Distribuição dos encontros</span>
          </div>
        </div>

        {/* Gráfico da Curva de Humor ao Longo das Sessões */}
        {historicoCronologicoHumor.length > 0 && (
          <div className="card evs-chart-card">
            <div className="evs-chart-head">
              <h2>Trajetória do Humor ao Longo das Sessões</h2>
              <span className="muted" style={{ fontSize: 13 }}>
                Evolução clínica sessão a sessão
              </span>
            </div>

            <div className="evs-spark-wrap">
              <svg
                viewBox={`0 0 ${Math.max(640, historicoCronologicoHumor.length * 90)} 110`}
                className="evs-spark-svg"
                role="img"
                aria-label="Gráfico de humor por sessão"
              >
                {(() => {
                  const pts = historicoCronologicoHumor;
                  const totalW = Math.max(640, pts.length * 90);
                  const x0 = 40;
                  const x1 = totalW - 40;
                  const n = Math.max(2, pts.length);
                  const X = (i: number) => (n === 1 ? totalW / 2 : x0 + ((x1 - x0) * i) / (n - 1));
                  const Y = (v: number) => 80 - Math.max(0, Math.min(10, v)) * 6.5;

                  const polylinePoints = pts.map((p, i) => `${X(i)},${Y(p.humor)}`).join(' ');

                  return (
                    <>
                      {/* Linhas guias */}
                      <line x1="0" y1="80" x2={totalW} y2="80" stroke="#e2d9c6" strokeDasharray="3 3" />
                      <line x1="0" y1="47.5" x2={totalW} y2="47.5" stroke="#f3eee3" />
                      <line x1="0" y1="15" x2={totalW} y2="15" stroke="#f3eee3" />

                      {pts.length > 1 && (
                        <polyline
                          points={polylinePoints}
                          fill="none"
                          stroke="#2b5c35"
                          strokeWidth="3"
                          strokeLinejoin="round"
                        />
                      )}

                      {pts.map((p, i) => (
                        <React.Fragment key={i}>
                          <circle
                            cx={X(i)}
                            cy={Y(p.humor)}
                            r="5.5"
                            fill="#fcfbf7"
                            stroke="#2b5c35"
                            strokeWidth="2.5"
                          />
                          <text
                            x={X(i)}
                            y={Y(p.humor) - 10}
                            fontFamily="IBM Plex Mono, monospace"
                            fontSize="12"
                            fontWeight="600"
                            textAnchor="middle"
                            fill="#1f2620"
                          >
                            {p.humor}
                          </text>
                          <text
                            x={X(i)}
                            y="102"
                            fontFamily="Inter, sans-serif"
                            fontSize="11"
                            textAnchor="middle"
                            fill="#6a6555"
                          >
                            Sessão #{p.num}
                          </text>
                        </React.Fragment>
                      ))}
                    </>
                  );
                })()}
              </svg>
            </div>
          </div>
        )}

        {/* Barra de Filtros e Busca Textual */}
        <div className="evs-toolbar">
          <div className="evs-search">
            <svg className="icon">
              <use href="#i-search" />
            </svg>
            <input
              type="text"
              placeholder="Buscar em queixas, técnicas, combinados ou resposta..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
            />
          </div>

          <div className="evs-filters-right">
            <label htmlFor="evs-sort" className="muted" style={{ fontSize: 13 }}>
              Ordem:
            </label>
            <select
              id="evs-sort"
              className="evs-select"
              value={ordem}
              onChange={(e) => setOrdem(e.target.value as 'desc' | 'asc')}
            >
              <option value="desc">Mais recentes primeiro</option>
              <option value="asc">Mais antigas primeiro</option>
            </select>
          </div>
        </div>

        {/* Linha do Tempo de Sessões */}
        <div className="evs-timeline">
          {carregando ? (
            <div className="card evs-empty-card">
              <span className="muted">Carregando prontuário de evoluções…</span>
            </div>
          ) : sessoesFiltradas.length === 0 ? (
            <div className="card evs-empty-card">
              {busca ? (
                <>
                  <h3>Nenhuma evolução encontrada para &quot;{busca}&quot;</h3>
                  <p className="muted" style={{ margin: 0 }}>
                    Tente buscar por outro termo clínico ou limpe o campo de busca.
                  </p>
                  <button type="button" className="btn btn-sm" onClick={() => setBusca('')}>
                    Limpar busca
                  </button>
                </>
              ) : (
                <>
                  <span className="ttl-ico" style={{ width: 56, height: 56 }}>
                    <svg width="34" height="34" viewBox="0 0 48 48" fill="none" stroke="#56704f" strokeWidth="2">
                      <use href="#i-evo" />
                    </svg>
                  </span>
                  <h3>Nenhuma evolução registrada para {pacienteCodigo}</h3>
                  <p className="muted" style={{ margin: 0, maxWidth: 440 }}>
                    Comece o prontuário deste paciente registrando a evolução da primeira sessão clínica.
                  </p>
                  <Link
                    href={`/recursos-interativos/pacientes/evolucao?paciente=${encodeURIComponent(pacienteCodigo)}&novo=1`}
                    className="btn btn-primary"
                  >
                    <svg className="icon">
                      <use href="#i-plus" />
                    </svg>
                    Registrar 1ª Evolução
                  </Link>
                </>
              )}
            </div>
          ) : (
            sessoesFiltradas.map((item) => {
              const d = (item.data || {}) as EvolucaoSessionData;
              const numSessao = d.numeroSessao || 1;
              const modalidadeLabel = d.modalidade?.toLowerCase() === 'online' ? 'Online' : 'Presencial';
              const humorVal = typeof d.humor === 'number' ? d.humor : null;

              return (
                <article key={item.id || item.resource_id} className="card evs-session-card">
                  {/* Cabeçalho do Card da Sessão */}
                  <div className="evs-session-head">
                    <div className="evs-session-title-wrap">
                      <span className="evs-sess-num-pill">{numSessao}</span>
                      <div>
                        <h3>Sessão #{numSessao}</h3>
                        <div className="evs-session-meta">
                          <span>{formatarData(d.dataSessao)}</span>
                          <span>·</span>
                          <span>{modalidadeLabel}</span>
                          {d.duracao && (
                            <>
                              <span>·</span>
                              <span>{d.duracao}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                      {humorVal !== null && (
                        <span className="evs-mood-badge">
                          Humor {humorVal}/10 · {HUMOR_LABELS[humorVal]}
                        </span>
                      )}

                      <div className="evs-session-actions">
                        <Link
                          href={`/recursos-interativos/pacientes/evolucao?paciente=${encodeURIComponent(
                            pacienteCodigo
                          )}&resourceId=${encodeURIComponent(item.resource_id)}&id=${encodeURIComponent(item.id || '')}`}
                          className="btn btn-sm"
                          title="Abrir página dedicada da evolução"
                        >
                          <svg className="icon icon-sm">
                            <use href="#i-edit" />
                          </svg>
                          Abrir / Editar
                        </Link>

                        <button
                          type="button"
                          className="btn btn-sm"
                          onClick={() => {
                            // Redireciona para impressão focada da sessão
                            router.push(
                              `/recursos-interativos/pacientes/evolucao?paciente=${encodeURIComponent(
                                pacienteCodigo
                              )}&resourceId=${encodeURIComponent(item.resource_id)}&id=${encodeURIComponent(item.id || '')}`
                            );
                          }}
                          title="Imprimir prontuário individual desta sessão"
                        >
                          <svg className="icon icon-sm">
                            <use href="#i-print" />
                          </svg>
                          Imprimir
                        </button>

                        <button
                          type="button"
                          className="btn btn-sm"
                          style={{ color: '#a8261d' }}
                          onClick={() => setItemParaExcluir(item)}
                          title="Excluir esta evolução do prontuário"
                        >
                          <svg className="icon icon-sm">
                            <use href="#i-trash" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Comportamento observado (se houver) */}
                  {((Array.isArray(d.comportamento) && d.comportamento.length > 0) || d.obs) && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      <span className="evs-block-label">Como o paciente chegou / Conduta</span>
                      {Array.isArray(d.comportamento) && d.comportamento.length > 0 && (
                        <div className="evs-chips-row">
                          {d.comportamento.map((comp) => (
                            <span key={comp} className="evs-chip-tag">
                              ✓ {comp}
                            </span>
                          ))}
                        </div>
                      )}
                      {d.obs && <p className="evs-block-text" style={{ fontStyle: 'italic' }}>“{d.obs}”</p>}
                    </div>
                  )}

                  {/* Conteúdo Clínico Estruturado da Sessão */}
                  <div className="evs-session-content">
                    {/* Bloco 1: Temas Trabalhados */}
                    <div className="evs-block">
                      <span className="evs-block-label">Pauta & Queixas Trabalhadas</span>
                      <p className="evs-block-text">
                        {d.temas || d.temasAbordados || 'Nenhuma queixa específica discriminada.'}
                      </p>
                    </div>

                    {/* Bloco 2: Intervenções e Técnicas */}
                    <div className="evs-block">
                      <span className="evs-block-label">Procedimentos & Técnicas Conduzidas</span>
                      {Array.isArray(d.tecnicas) && d.tecnicas.length > 0 && (
                        <div className="evs-chips-row" style={{ marginBottom: 4 }}>
                          {d.tecnicas.map((tec) => (
                            <span key={tec} className="evs-chip-tag" style={{ borderStyle: 'dashed' }}>
                              {tec}
                            </span>
                          ))}
                        </div>
                      )}
                      <p className="evs-block-text">
                        {d.intervencoes || 'Procedimentos psicoterápicos de rotina.'}
                      </p>
                    </div>

                    {/* Bloco 3: Resposta do Paciente e Evolução */}
                    <div className="evs-block">
                      <span className="evs-block-label">Resposta & Evolução Clínica</span>
                      <p className="evs-block-text">
                        {d.resposta || d.evolucaoClinica || 'Resposta clínica satisfatória.'}
                      </p>
                    </div>

                    {/* Bloco 4: Combinados e Próxima Sessão */}
                    <div className="evs-block">
                      <span className="evs-block-label">Combinados / Próxima Sessão</span>
                      <p className="evs-block-text">
                        {d.combinados || d.tarefasCombinados ? (
                          <>
                            <strong>Tarefas:</strong> {d.combinados || d.tarefasCombinados}
                            {d.proxima || d.planoProximaSessao ? (
                              <>
                                <br />
                                <strong>Retomar:</strong> {d.proxima || d.planoProximaSessao}
                              </>
                            ) : null}
                          </>
                        ) : d.proxima || d.planoProximaSessao ? (
                          <>
                            <strong>Retomar:</strong> {d.proxima || d.planoProximaSessao}
                          </>
                        ) : (
                          'Nenhum combinado específico registrado.'
                        )}
                      </p>
                      {d.encaminhamentos && (
                        <p className="evs-block-text" style={{ marginTop: 4 }}>
                          <strong>Encaminhamento:</strong> {d.encaminhamentos}
                        </p>
                      )}
                    </div>
                  </div>
                </article>
              );
            })
          )}
        </div>
      </main>

      {/* Modal de confirmação de exclusão */}
      {itemParaExcluir && (
        <div className="evs-modal-overlay" onClick={() => setItemParaExcluir(null)}>
          <div className="evs-modal" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ margin: 0, fontSize: 18 }}>Excluir evolução de sessão?</h3>
            <p className="muted" style={{ margin: 0, fontSize: 14 }}>
              Tem certeza que deseja excluir o registro da{' '}
              <strong>
                Sessão #{((itemParaExcluir.data as EvolucaoSessionData)?.numeroSessao) || 1}
              </strong>{' '}
              de <strong>{pacienteCodigo}</strong>? Esta ação não pode ser desfeita.
            </p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
              <button
                type="button"
                className="btn btn-sm"
                onClick={() => setItemParaExcluir(null)}
                disabled={excluindo}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="btn btn-sm"
                style={{ background: '#a8261d', borderColor: '#a8261d', color: '#fff' }}
                onClick={confirmarExclusao}
                disabled={excluindo}
              >
                {excluindo ? 'Excluindo…' : 'Sim, excluir evolução'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
         Folha de Impressão Timbrada Consolidada (Apenas para Impressão)
         ========================================================================= */}
      <div className="evs-printable" aria-hidden="true">
        <div
          style={{
            borderBottom: '2px solid #222',
            paddingBottom: 14,
            marginBottom: 20,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end'
          }}
        >
          <div>
            <h1 style={{ fontSize: '18pt', margin: 0, fontWeight: 800, letterSpacing: '-0.02em' }}>
              NEUROACERVO · PRONTUÁRIO CLÍNICO
            </h1>
            <p style={{ fontSize: '10pt', margin: '4px 0 0', color: '#555' }}>
              Relatório Geral e Histórico Completo de Evoluções de Sessão
            </p>
          </div>
          <div style={{ textAlign: 'right', fontSize: '10pt' }}>
            <strong>Caso: {pacienteCodigo}</strong>
            <p style={{ margin: '2px 0 0', color: '#666' }}>
              Emissão: {new Date().toLocaleDateString('pt-BR')}
            </p>
          </div>
        </div>

        {/* Resumo Consolidado do Caso */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 12,
            background: '#f7f7f7',
            padding: '12px 16px',
            borderRadius: 6,
            marginBottom: 24,
            fontSize: '10pt'
          }}
        >
          <div>
            <span style={{ fontSize: '8pt', textTransform: 'uppercase', color: '#666', display: 'block' }}>
              Total de Sessões
            </span>
            <strong>{metricas.total}</strong>
          </div>
          <div>
            <span style={{ fontSize: '8pt', textTransform: 'uppercase', color: '#666', display: 'block' }}>
              Período
            </span>
            <strong>{metricas.periodo}</strong>
          </div>
          <div>
            <span style={{ fontSize: '8pt', textTransform: 'uppercase', color: '#666', display: 'block' }}>
              Média de Humor
            </span>
            <strong>{metricas.mediaHumor} / 10</strong>
          </div>
          <div>
            <span style={{ fontSize: '8pt', textTransform: 'uppercase', color: '#666', display: 'block' }}>
              Modalidade
            </span>
            <strong>{metricas.modalidadeRatio}</strong>
          </div>
        </div>

        {/* Lista Sequencial de Todas as Sessões para o Prontuário Impresso */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {[...sessoesFiltradas]
            .sort((a, b) => {
              const numA = (a.data as EvolucaoSessionData)?.numeroSessao ?? 0;
              const numB = (b.data as EvolucaoSessionData)?.numeroSessao ?? 0;
              return numA - numB; // Ordem cronológica na folha de prontuário
            })
            .map((item) => {
              const d = (item.data || {}) as EvolucaoSessionData;
              const numSessao = d.numeroSessao || 1;
              const mod = d.modalidade?.toLowerCase() === 'online' ? 'Online' : 'Presencial';

              return (
                <div
                  key={item.id || item.resource_id}
                  style={{
                    border: '1px solid #ccc',
                    borderRadius: 6,
                    padding: '14px 16px',
                    pageBreakInside: 'avoid',
                    marginBottom: 12
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      borderBottom: '1px solid #e5e5e5',
                      paddingBottom: 8,
                      marginBottom: 10
                    }}
                  >
                    <div>
                      <strong style={{ fontSize: '11pt' }}>SESSÃO Nº {numSessao}</strong>
                      <span style={{ fontSize: '9.5pt', color: '#666', marginLeft: 8 }}>
                        {formatarData(d.dataSessao)} · {mod} {d.duracao ? `(${d.duracao})` : ''}
                      </span>
                    </div>
                    {typeof d.humor === 'number' && (
                      <span style={{ fontSize: '9.5pt', fontWeight: 600 }}>
                        Humor: {d.humor}/10 ({HUMOR_LABELS[d.humor]})
                      </span>
                    )}
                  </div>

                  {((Array.isArray(d.comportamento) && d.comportamento.length > 0) || d.obs) && (
                    <div style={{ marginBottom: 8, fontSize: '9.5pt' }}>
                      <strong>Conduta observada:</strong>{' '}
                      {[
                        Array.isArray(d.comportamento) && d.comportamento.join(', '),
                        d.obs
                      ]
                        .filter(Boolean)
                        .join(' — ')}
                    </div>
                  )}

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, fontSize: '9.5pt' }}>
                    <div>
                      <strong>Temas trabalhados:</strong>
                      <p style={{ margin: '2px 0 0', lineHeight: 1.4, whiteSpace: 'pre-wrap' }}>
                        {d.temas || d.temasAbordados || '—'}
                      </p>
                    </div>

                    <div>
                      <strong>Intervenções & Técnicas:</strong>
                      <p style={{ margin: '2px 0 0', lineHeight: 1.4, whiteSpace: 'pre-wrap' }}>
                        {[
                          Array.isArray(d.tecnicas) && d.tecnicas.length > 0 ? d.tecnicas.join(', ') : '',
                          d.intervencoes
                        ]
                          .filter(Boolean)
                          .join('\n') || '—'}
                      </p>
                    </div>

                    <div>
                      <strong>Resposta clínica do paciente:</strong>
                      <p style={{ margin: '2px 0 0', lineHeight: 1.4, whiteSpace: 'pre-wrap' }}>
                        {d.resposta || d.evolucaoClinica || '—'}
                      </p>
                    </div>

                    <div>
                      <strong>Combinados & Planejamento:</strong>
                      <p style={{ margin: '2px 0 0', lineHeight: 1.4, whiteSpace: 'pre-wrap' }}>
                        {[
                          (d.combinados || d.tarefasCombinados) && `Tarefas: ${d.combinados || d.tarefasCombinados}`,
                          (d.proxima || d.planoProximaSessao) && `Retomar: ${d.proxima || d.planoProximaSessao}`,
                          d.encaminhamentos && `Encaminhamento: ${d.encaminhamentos}`
                        ]
                          .filter(Boolean)
                          .join('\n') || '—'}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
        </div>

        {/* Rodapé Ético e Assinatura */}
        <div
          style={{
            marginTop: 40,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            pageBreakInside: 'avoid'
          }}
        >
          <div>
            <p style={{ fontSize: '8.5pt', color: '#555', maxWidth: 360, margin: 0 }}>
              Documento de caráter confidencial. Resguardado pelo Código de Ética Profissional do Psicólogo (CFP) e Lei Geral de Proteção de Dados (LGPD).
            </p>
          </div>
          <div style={{ width: 260, borderTop: '1px solid #000', textAlign: 'center', paddingTop: 6, fontSize: '9.5pt' }}>
            Responsável Técnico / CRP
          </div>
        </div>
      </div>

      {/* Toast de notificação */}
      <div className={`ev-toast ${toast ? 'ev-toast--show' : ''}`} role="status" aria-live="polite">
        {toast}
      </div>
    </div>
  );
}

export default function EvolucoesPage() {
  return (
    <Suspense
      fallback={
        <div style={{ padding: 40, textAlign: 'center', color: '#6a6555', background: '#efe8d8', minHeight: '100vh' }}>
          Carregando prontuário de evoluções…
        </div>
      }
    >
      <EvolucoesHistoricoContent />
    </Suspense>
  );
}
