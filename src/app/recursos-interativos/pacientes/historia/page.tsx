'use client';

import React, { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { PlatformShell } from '@/components/layout/PlatformShell';
import { HISTORIAS, FAIXAS, HistoriaClinica, FaixaEtaria } from '@/data/historiasClinicas';
import { getInteractiveSession, deleteInteractiveSession } from '@/lib/supabase';
import './historia-detalhe.css';

/* =========================================================================
   Tipos
   ========================================================================= */

interface HistoriaSessionData {
  observarNotas?: string;
  intensidade?: number | null;
  pensarNotas?: string;
  crenca?: number | null;
  respostaIdx?: number | null;
  opcoesCustomizadas?: string[];
  agirNotas?: string;
  etapasFeitas?: boolean[];
  updatedAt?: string;
}

/* =========================================================================
   Dados Demonstrativos de Referência (Fallback quando não houver sessão)
   ========================================================================= */

const DEMO_FALLBACK_DATA: HistoriaSessionData = {
  observarNotas:
    'Ela quis falar o que pensava na hora, mas acabou não sendo ouvida. A professora ficou irritada e a turma achou que ela estava exagerando.',
  intensidade: 3,
  pensarNotas:
    'Raiva. Acho que ela pensou que, se não falasse naquela hora, ninguém ia saber que ela discordava.',
  crenca: 50,
  respostaIdx: 0,
  agirNotas:
    'Esperar a professora terminar, levantar a mão e dizer que pensa diferente e por quê. Ou conversar no fim da aula.',
  etapasFeitas: [true, true, true],
  updatedAt: new Date().toISOString()
};

/* =========================================================================
   Sprite de Ícones SVG
   ========================================================================= */

function IconSprite() {
  return (
    <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true">
      <symbol id="i-back" viewBox="0 0 24 24"><path d="M19 12H5M12 19l-7-7 7-7" /></symbol>
      <symbol id="i-chev" viewBox="0 0 24 24"><path d="m9 18 6-6-6-6" /></symbol>
      <symbol id="i-print" viewBox="0 0 24 24"><path d="M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2M6 14h12v8H6z" /></symbol>
      <symbol id="i-more" viewBox="0 0 24 24"><circle cx="5" cy="12" r="1" /><circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /></symbol>
      <symbol id="i-play" viewBox="0 0 24 24"><path d="M7 4v16l13-8z" /></symbol>
      <symbol id="i-book" viewBox="0 0 24 24"><path d="M2 4h6a4 4 0 0 1 4 4v12a3 3 0 0 0-3-3H2zM22 4h-6a4 4 0 0 0-4 4v12a3 3 0 0 1 3-3h7z" /></symbol>
      <symbol id="i-cal" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></symbol>
      <symbol id="i-clock" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></symbol>
      <symbol id="i-check" viewBox="0 0 24 24"><path d="M20 6 9 17l-5-5" /></symbol>
      <symbol id="i-lock" viewBox="0 0 24 24"><rect x="4" y="11" width="16" height="10" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" /></symbol>
      <symbol id="i-msg" viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></symbol>
      <symbol id="i-bulb" viewBox="0 0 24 24"><path d="M9 18h6M10 22h4M12 2a7 7 0 0 0-4 12.7V17h8v-2.3A7 7 0 0 0 12 2z" /></symbol>
      <symbol id="i-drama" viewBox="0 0 48 48"><path d="M10 8h12a5 5 0 0 1 5 5v6a5 5 0 0 1-5 5h-8l-5 4.2v-4.6a5 5 0 0 1-4-4.9V13a5 5 0 0 1 5-5z" fill="currentColor" fillOpacity=".18" /><path d="M10.5 14h11M10.5 18h7" /><path d="M26 19h12a5 5 0 0 1 5 5v5.7a5 5 0 0 1-4 4.9v4.6l-5-4.2h-8a5 5 0 0 1-5-5v-6a5 5 0 0 1 5-5z" fill="#e3f2cc" /><path d="M27.5 26.6l2.6 2.6 5.4-5.4" /></symbol>
      <symbol id="i-copy" viewBox="0 0 24 24"><rect x="9" y="9" width="12" height="12" rx="2" /><path d="M5 15V5a2 2 0 0 1 2-2h10" /></symbol>
      <symbol id="i-trash" viewBox="0 0 24 24"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6M10 11v6M14 11v6" /></symbol>
    </svg>
  );
}

function Icon({ id, sm, className }: { id: string; sm?: boolean; className?: string }) {
  return (
    <svg className={`icon ${sm ? 'icon-sm' : ''} ${className || ''}`} aria-hidden="true">
      <use href={`#i-${id}`} />
    </svg>
  );
}

function extrairPersonagem(texto?: string): string {
  if (!texto) return 'Protagonista da narrativa';
  const m = texto.match(/([A-ZÁÉÍÓÚÂÊÔÃÕ][a-záéíóúâêôãõç]+(?:,\s*\d+\s*anos)?)/);
  return m ? m[1] : 'Protagonista da narrativa';
}

/* =========================================================================
   Conteúdo do Detalhe da História Clínica
   ========================================================================= */

function DetalheHistoriaContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const pacienteQuery = searchParams.get('paciente') || '';
  const resourceIdQuery = searchParams.get('resourceId') || '';
  const sessionIdQuery = searchParams.get('id') || '';

  const [dataSessao, setDataSessao] = useState<HistoriaSessionData>(DEMO_FALLBACK_DATA);
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

  // Identificação da história e faixa etária
  const { story, faixa, storyKey } = useMemo(() => {
    const rawKey = resourceIdQuery.trim() || 'f5_1';
    const [faixaId, numStr] = rawKey.split('_');
    const num = parseInt(numStr, 10) || 1;

    const faixaEncontrada = FAIXAS.find((f) => f.id === faixaId) || FAIXAS[FAIXAS.length - 1];
    const lista = HISTORIAS[faixaId] || HISTORIAS['f5'] || HISTORIAS['f2'] || [];
    const historiaEncontrada = lista.find((h) => h.num === num) || lista[0];

    return {
      story: historiaEncontrada,
      faixa: faixaEncontrada,
      storyKey: `${faixaEncontrada.id}_${historiaEncontrada.num}`
    };
  }, [resourceIdQuery]);

  const codigo = pacienteQuery.trim() || 'Paciente 01';

  // Carrega dados do Supabase ou localStorage
  useEffect(() => {
    let ativo = true;

    async function carregar() {
      // 1. Tenta cache local
      try {
        const raw =
          localStorage.getItem(`na_session_historia_${storyKey}_${codigo}`) ||
          localStorage.getItem(`na_session_historia_${resourceIdQuery}_${codigo}`);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed && (parsed.observarNotas || parsed.pensarNotas || parsed.agirNotas)) {
            setDataSessao({ ...DEMO_FALLBACK_DATA, ...parsed });
          }
        }
      } catch (e) {
        console.warn('Erro ao ler cache local de história:', e);
      }

      // 2. Busca do Supabase
      try {
        const sessao = await getInteractiveSession('historia', storyKey, codigo);
        if (ativo && sessao && sessao.data) {
          setDataSessao({
            ...DEMO_FALLBACK_DATA,
            ...sessao.data,
            updatedAt: sessao.updated_at || sessao.created_at || new Date().toISOString()
          });
        }
      } catch (err) {
        console.warn('Erro ao carregar história em nuvem:', err);
      } finally {
        if (ativo) setCarregando(false);
      }
    }

    carregar();
    return () => {
      ativo = false;
    };
  }, [storyKey, codigo, resourceIdQuery]);

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
  const intensidade = typeof dataSessao.intensidade === 'number' ? dataSessao.intensidade : 3;
  const crenca = typeof dataSessao.crenca === 'number' ? dataSessao.crenca : 50;

  const etapasFeitas = dataSessao.etapasFeitas || [
    Boolean(dataSessao.observarNotas),
    Boolean(dataSessao.pensarNotas),
    Boolean(dataSessao.agirNotas || dataSessao.respostaIdx !== null)
  ];
  const etapasConcluidasCount = etapasFeitas.filter(Boolean).length;

  const todasOpcoes = useMemo(() => {
    return [...(story.parar?.opcoes || []), ...(dataSessao.opcoesCustomizadas || [])];
  }, [story.parar?.opcoes, dataSessao.opcoesCustomizadas]);

  const opcaoEscolhidaTexto = useMemo(() => {
    if (dataSessao.respostaIdx !== null && dataSessao.respostaIdx !== undefined && todasOpcoes[dataSessao.respostaIdx]) {
      return todasOpcoes[dataSessao.respostaIdx];
    }
    return todasOpcoes[0] || 'Estratégia de enfrentamento ativo';
  }, [dataSessao.respostaIdx, todasOpcoes]);

  const dataFormatada = useMemo(() => {
    try {
      const d = new Date(dataSessao.updatedAt || Date.now());
      return d.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch {
      return '21 out 2026';
    }
  }, [dataSessao.updatedAt]);

  // Ação: Continuar / Abrir no recurso
  const handleContinuar = () => {
    router.push(
      `/recursos-interativos/historias?faixa=${faixa.id}&historia=${story.num}&paciente=${encodeURIComponent(codigo)}`
    );
  };

  // Ação: Ir para Dramatização com o pensamento trabalhado
  const irParaDramatizacao = () => {
    const p = dataSessao.pensarNotas ? encodeURIComponent(dataSessao.pensarNotas) : '';
    router.push(
      `/recursos-interativos/dramatizacao?paciente=${encodeURIComponent(codigo)}${p ? `&pensamento=${p}` : ''}`
    );
  };

  // Ação: Copiar resumo clínico
  const handleCopiarResumo = () => {
    const texto = `História Clínica: "${story.titulo}" (${faixa.label})\nPaciente: ${codigo}\nEtapas: ${etapasConcluidasCount}/3 preenchidas\nIntensidade emocional: ${intensidade}/100\nCrença no pensamento: ${crenca}/100\nEstratégia escolhida: "${opcaoEscolhidaTexto}".`;
    navigator.clipboard?.writeText(texto);
    avisar('Resumo clínico copiado para a área de transferência');
    setMenuAberto(false);
  };

  // Ação: Excluir intervenção
  const handleExcluir = async () => {
    setExcluindo(true);
    try {
      await deleteInteractiveSession('historia', storyKey, codigo, sessionIdQuery || undefined);
      avisar('História clínica excluída com sucesso');
      setTimeout(() => {
        router.push(`/recursos-interativos/pacientes?paciente=${encodeURIComponent(codigo)}`);
      }, 350);
    } catch (e) {
      console.warn('Erro ao excluir história:', e);
      setExcluindo(false);
      setShowModalExcluir(false);
    }
  };

  return (
    <div className="hd">
      <IconSprite />

      <div className="page">
        {/* Breadcrumbs */}
        <nav className="crumbs" aria-label="Caminho">
          <Link href="/recursos-interativos/pacientes">
            <Icon id="back" sm />
            Dossiê clínico
          </Link>
          <Icon id="chev" sm />
          <Link href={`/recursos-interativos/pacientes?paciente=${encodeURIComponent(codigo)}`}>
            {codigo}
          </Link>
          <Icon id="chev" sm />
          <b>História clínica · {dataFormatada}</b>
        </nav>

        {/* Cabeçalho com indicadores */}
        <section className="card hero">
          <div className="hero-top">
            <div style={{ minWidth: 0 }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 10 }}>
                <span className="type">
                  <span className="type-ico">
                    <img
                      src="/assets/recursos/cards/01_historias_clinicas_e_regulacao.png"
                      alt="História clínica estruturada"
                      width={38}
                      height={38}
                    />
                  </span>
                  História clínica estruturada
                </span>
                <span className="age">{faixa.label} · {faixa.sublabel}</span>
              </div>
              <h1>{story.titulo}</h1>
              <div className="tags">
                <span className="tag">{story.theme}</span>
                <span className="tag alt">{story.tag}</span>
              </div>
              <div className="meta">
                <span>
                  <Icon id="cal" sm />
                  {dataFormatada}
                </span>
                <span>
                  <Icon id="clock" sm />
                  ~25 min
                </span>
                <span>
                  <Icon id="lock" sm />
                  Sigilo profissional
                </span>
              </div>
            </div>

            <div className="hero-actions" ref={menuRef}>
              <button type="button" className="btn btn-primary" onClick={handleContinuar}>
                <Icon id="play" />
                Abrir no recurso
              </button>
              <button type="button" className="btn" onClick={() => window.print()}>
                <Icon id="print" />
                Imprimir
              </button>
              <button
                type="button"
                className="btn btn-icon"
                aria-label="Mais opções"
                onClick={() => setMenuAberto((a) => !a)}
              >
                <Icon id="more" />
              </button>

              {menuAberto && (
                <div className="menu" role="menu">
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
                  <hr style={{ border: 0, borderTop: '1px solid var(--line)', margin: '4px 0' }} />
                  <button
                    type="button"
                    role="menuitem"
                    style={{ color: '#a8261d', fontWeight: 600 }}
                    onClick={() => {
                      setMenuAberto(false);
                      setShowModalExcluir(true);
                    }}
                  >
                    <Icon id="trash" sm />
                    Excluir intervenção
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="ind">
            <div>
              <div className="ind-top">
                <span className="ind-lbl">Etapas</span>
                <span className={`lvl ${etapasConcluidasCount === 3 ? 'ok' : ''}`}>
                  {etapasConcluidasCount === 3 ? 'Concluída' : 'Em andamento'}
                </span>
              </div>
              <div className="ind-val">
                {etapasConcluidasCount}<small> / 3</small>
              </div>
              <div className="dots" aria-hidden="true">
                <i style={{ opacity: etapasFeitas[0] ? 1 : 0.25 }} />
                <i style={{ opacity: etapasFeitas[1] ? 1 : 0.25 }} />
                <i style={{ opacity: etapasFeitas[2] ? 1 : 0.25 }} />
              </div>
            </div>

            <div>
              <div className="ind-top">
                <span className="ind-lbl">Intensidade da emoção</span>
                <span className="lvl">
                  {intensidade > 70 ? 'Elevada' : intensidade > 40 ? 'Moderada' : 'Leve'}
                </span>
              </div>
              <div className="ind-val">
                {intensidade}<small> / 100</small>
              </div>
              <div className="bar ink" role="img" aria-label={`${intensidade} de 100`}>
                <i style={{ width: `${Math.min(100, Math.max(3, intensidade))}%` }}></i>
              </div>
            </div>

            <div>
              <div className="ind-top">
                <span className="ind-lbl">Crença no pensamento</span>
                <span className="lvl">
                  {crenca > 70 ? 'Forte' : crenca > 40 ? 'Média' : 'Baixa'}
                </span>
              </div>
              <div className="ind-val">
                {crenca}<small> / 100</small>
              </div>
              <div className="bar" role="img" aria-label={`${crenca} de 100`}>
                <i style={{ width: `${Math.min(100, Math.max(3, crenca))}%` }}></i>
              </div>
            </div>
          </div>
        </section>

        {/* Corpo 2 Colunas */}
        <div className="two">
          {/* Coluna Esquerda: Caso e Etapas */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
            <section className="card panel">
              <div className="panel-head">
                <h2>O caso apresentado</h2>
                <span className="eyebrow">Caso clínico</span>
              </div>
              <div className="case">
                <p>{story.historia}</p>
                <div className="who">
                  Personagem: {extrairPersonagem(story.historia)}
                </div>
              </div>
            </section>

            <section className="card panel">
              <div className="panel-head">
                <h2>Respostas do paciente</h2>
                <span className="eyebrow">{etapasConcluidasCount} de 3 etapas</span>
              </div>
              <ol className="steps">
                <li className="step">
                  <span className="step-n">1</span>
                  <div>
                    <div className="step-head">
                      <span className="verb">Observar</span>
                      <b>O que aconteceu?</b>
                      <span className="st">
                        {etapasFeitas[0] ? (
                          <>
                            <Icon id="check" sm />
                            Preenchida
                          </>
                        ) : (
                          'Pendente'
                        )}
                      </span>
                    </div>
                    <p className="q">
                      {story.observar?.pergunta ||
                        'O que você priorizou no momento: expressar-se ou ser ouvido? Que consequências isso gerou?'}
                    </p>
                    <div className="a">
                      <span className="lbl">
                        <Icon id="msg" sm />
                        Resposta
                      </span>
                      <p>
                        {dataSessao.observarNotas || (
                          <span className="muted" style={{ fontStyle: 'italic' }}>
                            Nenhuma resposta registrada nesta etapa.
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                </li>

                <li className="step">
                  <span className="step-n">2</span>
                  <div>
                    <div className="step-head">
                      <span className="verb">Compreender</span>
                      <b>O que ela sentiu e pensou?</b>
                      <span className="st">
                        {etapasFeitas[1] ? (
                          <>
                            <Icon id="check" sm />
                            Preenchida
                          </>
                        ) : (
                          'Pendente'
                        )}
                      </span>
                    </div>
                    <p className="q">
                      {story.pensamento?.pergunta ||
                        'Que emoção apareceu e que pensamento pode ter levado à reação?'}
                    </p>
                    <div className="a">
                      <span className="lbl">
                        <Icon id="msg" sm />
                        Resposta
                      </span>
                      <p>
                        {dataSessao.pensarNotas || (
                          <span className="muted" style={{ fontStyle: 'italic' }}>
                            Nenhuma resposta registrada nesta etapa.
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                </li>

                <li className="step">
                  <span className="step-n">3</span>
                  <div>
                    <div className="step-head">
                      <span className="verb">Agir</span>
                      <b>O que poderia ser diferente?</b>
                      <span className="st">
                        {etapasFeitas[2] ? (
                          <>
                            <Icon id="check" sm />
                            Preenchida
                          </>
                        ) : (
                          'Pendente'
                        )}
                      </span>
                    </div>
                    <p className="q">
                      {story.parar?.pergunta ||
                        'Como agir de maneira mais adaptativa e defender sua posição com calma?'}
                    </p>
                    <div className="a">
                      <span className="lbl">
                        <Icon id="msg" sm />
                        {dataSessao.respostaIdx !== null && dataSessao.respostaIdx !== undefined
                          ? 'Estratégia escolhida'
                          : 'Resposta'}
                      </span>
                      <p>
                        {dataSessao.agirNotas || opcaoEscolhidaTexto || (
                          <span className="muted" style={{ fontStyle: 'italic' }}>
                            Nenhuma estratégia registrada nesta etapa.
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                </li>
              </ol>
            </section>
          </div>

          {/* Coluna Direita: Estratégia, Anotações, Continuar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
            <section className="card panel">
              <h2>Estratégia terapêutica</h2>
              <div className="kv">
                <div>
                  <span>Tema central</span>
                  <b>{story.theme}</b>
                </div>
                <div>
                  <span>Habilidade trabalhada</span>
                  <b>{story.tag}</b>
                </div>
              </div>
              <div className="tip">
                <Icon id="bulb" />
                <div>
                  <span className="lb">Dica do terapeuta</span>
                  <p>
                    {story.parar?.dica ||
                      'A forma como falamos determina se seremos ouvidos. Discordar com calma é uma forma de cuidar da própria opinião.'}
                  </p>
                </div>
              </div>
            </section>

            <section className="card panel">
              <div className="panel-head">
                <h2>Anotações da sessão</h2>
                <span className="private">
                  <Icon id="lock" sm />
                  Só você vê
                </span>
              </div>
              <div className="note">
                {dataSessao.observarNotas && dataSessao.pensarNotas
                  ? `Sessão estruturada concluída com foco em ${story.tag.toLowerCase()} e regulação de intensidade emocional (${intensidade}/100).`
                  : 'Nenhuma anotação ainda. Registre como o paciente se relacionou com o caso e o que levar para a próxima sessão.'}
              </div>
            </section>

            <section className="card panel">
              <h2>Continuar o trabalho</h2>
              <div className="next">
                <button type="button" onClick={irParaDramatizacao}>
                  <span className="mi" style={{ background: '#e3f2cc', color: '#2b5c35' }}>
                    <Icon id="drama" />
                  </span>
                  <span>
                    Dramatização dos dois lados
                    <small>
                      {dataSessao.pensarNotas
                        ? `Com o pensamento “${dataSessao.pensarNotas.slice(0, 48)}...”`
                        : 'Debate de pensamento na Arena'}
                    </small>
                  </span>
                  <Icon id="chev" className="go" />
                </button>
                <button type="button" onClick={handleContinuar}>
                  <span
                    className="mi"
                    style={{ background: 'var(--cat-hist-soft)', color: 'var(--cat-hist)' }}
                  >
                    <Icon id="copy" />
                  </span>
                  <span>
                    Outra história com o mesmo tema
                    <small>
                      {story.theme} · {faixa.label}
                    </small>
                  </span>
                  <Icon id="chev" className="go" />
                </button>
              </div>
            </section>
          </div>
        </div>

        {/* Modal de Exclusão */}
        {showModalExcluir && (
          <div className="hd-modal-backdrop" onClick={() => !excluindo && setShowModalExcluir(false)}>
            <div className="hd-modal-box" onClick={(e) => e.stopPropagation()}>
              <h3>Excluir história clínica do dossiê?</h3>
              <p>
                Tem certeza que deseja remover esta história clínica salva do prontuário do paciente{' '}
                <b>{codigo}</b>? Esta ação removerá os registros das 3 etapas e métricas no Supabase.
              </p>
              <div className="hd-modal-actions">
                <button
                  type="button"
                  className="btn"
                  onClick={() => setShowModalExcluir(false)}
                  disabled={excluindo}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  className="btn"
                  style={{ background: '#a8261d', borderColor: '#a8261d', color: '#fff' }}
                  onClick={handleExcluir}
                  disabled={excluindo}
                >
                  {excluindo ? 'Excluindo...' : 'Sim, excluir'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Toast Notificação */}
        {toast && <div className="hd-toast">{toast}</div>}
      </div>
    </div>
  );
}

export default function DetalheHistoriaPage() {
  return (
    <PlatformShell activePage="recursos">
      <Suspense
        fallback={
          <div
            style={{
              padding: '80px 24px',
              textAlign: 'center',
              fontFamily: 'var(--font-sans, system-ui)',
              color: '#6a6555'
            }}
          >
            Carregando história clínica...
          </div>
        }
      >
        <DetalheHistoriaContent />
      </Suspense>
    </PlatformShell>
  );
}
