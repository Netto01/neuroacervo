'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useNeuro } from '@/context/NeuroContext';
import { PlatformShell } from '@/components/layout/PlatformShell';
import { resolveUserPlan } from '@/utils/userPlan';
import { UpgradeGate } from '@/components/common/UpgradeGate';
import { Users } from 'lucide-react';
import './recursos.css';

function ResourceCardIcon({
  fileNames,
  alt,
  fallbackBg,
  fallbackSvg
}: {
  fileNames: string[];
  alt: string;
  fallbackBg: string;
  fallbackSvg: React.ReactNode;
}) {
  const [srcIndex, setSrcIndex] = useState<number>(0);
  const [failed, setFailed] = useState<boolean>(false);

  if (failed || srcIndex >= fileNames.length) {
    return (
      <span className="na-ic" style={{ background: fallbackBg }}>
        {fallbackSvg}
      </span>
    );
  }

  const currentFile = fileNames[srcIndex];

  return (
    <span className="na-ic na-ic--custom">
      <img
        src={`/assets/recursos/cards/${currentFile}`}
        alt={alt}
        width={58}
        height={58}
        className="na-ic-img"
        onError={() => {
          if (srcIndex + 1 < fileNames.length) {
            setSrcIndex(srcIndex + 1);
          } else {
            setFailed(true);
          }
        }}
      />
    </span>
  );
}

export default function RecursosInterativosPage() {
  const { currentUser } = useNeuro();
  const planInfo = resolveUserPlan(currentUser);

  const [filter, setFilter] = useState<'todos' | 'historias' | 'baralhos' | 'pensamento'>('todos');
  const [openCard, setOpenCard] = useState<string | null>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState<boolean>(false);

  const toggleCard = (cardId: string) => {
    const nextState = openCard === cardId ? null : cardId;
    if (typeof document !== 'undefined' && 'startViewTransition' in document) {
      (document as any).startViewTransition(() => {
        setOpenCard(nextState);
      });
    } else {
      setOpenCard(nextState);
    }
  };

  const handleFilter = (f: 'todos' | 'historias' | 'baralhos' | 'pensamento') => {
    if (typeof document !== 'undefined' && 'startViewTransition' in document) {
      (document as any).startViewTransition(() => {
        setFilter(f);
      });
    } else {
      setFilter(f);
    }
  };

  return (
    <PlatformShell activePage="recursos">
      <div className="wrap">
        {!planInfo.hasRecursos && (
          <div className="aviso-previa">
            <div className="aviso-previa__main">
              <span className="aviso-previa__badge">
                <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <rect x="5" y="11" width="14" height="10" rx="2" />
                  <path d="M8 11V7a4 4 0 0 1 8 0v4" />
                </svg>
                Modo Prévia
              </span>
              <p>
                Você está visualizando a vitrine dos recursos interativos. O acesso e a aplicação prática em sessão são exclusivos do plano <b>Prática</b>.
              </p>
            </div>
            <button
              type="button"
              className="aviso-previa__cta"
              onClick={() => setShowUpgradeModal(true)}
            >
              Conhecer plano Prática <i>→</i>
            </button>
          </div>
        )}

        <div className="hd3">
          <div>
            <div className="kick">Tecnologia clínica</div>
            <h1>
              Recursos <em>interativos</em>.
            </h1>
            <p>
              Ferramentas para usar em sessão, com apoio à prática neuropsicológica e cognitivo-comportamental. Clique em um recurso para ver os detalhes.
            </p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 14 }}>
            <Link 
              href="/recursos-interativos/pacientes"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '9px 18px',
                borderRadius: 999,
                background: '#15140f',
                color: '#efe7d2',
                fontSize: 13.5,
                fontWeight: 600,
                textDecoration: 'none',
                boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
                transition: 'all 0.15s ease'
              }}
            >
              <Users size={16} />
              Dossiê & Sessões dos Pacientes
            </Link>
            <div className="stats">
              <div>
                <b>2</b>
                <span>recursos ativos</span>
              </div>
              <div>
                <b>50</b>
                <span>histórias clínicas</span>
              </div>
              <div>
                <b>3</b>
                <span>em desenvolvimento</span>
              </div>
            </div>
          </div>
        </div>

        <div className="filtros" role="group" aria-label="Filtrar recursos">
          <button
            type="button"
            className={filter === 'todos' ? 'on' : ''}
            onClick={() => handleFilter('todos')}
          >
            Todos<span className="ct">5</span>
          </button>
          <button
            type="button"
            className={filter === 'pensamento' ? 'on' : ''}
            onClick={() => handleFilter('pensamento')}
          >
            Técnicas de pensamento<span className="ct">1</span>
          </button>
          <button
            type="button"
            className={filter === 'historias' ? 'on' : ''}
            onClick={() => handleFilter('historias')}
          >
            Histórias<span className="ct">2</span>
          </button>
          <button
            type="button"
            className={filter === 'baralhos' ? 'on' : ''}
            onClick={() => handleFilter('baralhos')}
          >
            Baralhos e atividades<span className="ct">2</span>
          </button>
          <span className="r">Novos recursos todo mês</span>
        </div>

        <div className="na-grid">
          {/* Card 1: Histórias Clínicas */}
          <div
            className={`na-card ${openCard === 'rc-hist' ? 'open' : ''}`}
            data-cat="historias"
            style={{ display: filter === 'todos' || filter === 'historias' ? undefined : 'none' }}
          >
            <button
              className="na-sq"
              type="button"
              aria-expanded={openCard === 'rc-hist'}
              aria-controls="rc-hist"
              onClick={() => toggleCard('rc-hist')}
            >
              <span className="na-sq__top">
                <ResourceCardIcon
                  fileNames={['01_historias_clinicas_e_regulacao.png', 'historias-clinicas.png']}
                  alt="Histórias Clínicas & Regulação"
                  fallbackBg="#1d5e63"
                  fallbackSvg={
                    <svg viewBox="0 0 24 24">
                      <path d="M2 5h7a3 3 0 0 1 3 3v12a2 2 0 0 0-2-2H2zM22 5h-7a3 3 0 0 0-3 3v12a2 2 0 0 1 2-2h8z" />
                    </svg>
                  }
                />
                <span className="na-plus-wrap">
                  {!planInfo.hasRecursos && (
                    <span className="na-lock-pill" title="Recurso exclusivo do plano Prática">
                      <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.4">
                        <rect x="5" y="11" width="14" height="10" rx="2" />
                        <path d="M8 11V7a4 4 0 0 1 8 0v4" />
                      </svg>
                      Prática
                    </span>
                  )}
                  <span className="na-plus" aria-hidden="true">
                    <svg viewBox="0 0 24 24">
                      <path d="M12 5v14M5 12h14" />
                    </svg>
                  </span>
                </span>
              </span>
              <span className="na-sq__main">
                <ResourceCardIcon
                  fileNames={['01_historias_clinicas_e_regulacao.png', 'historias-clinicas.png']}
                  alt="Histórias Clínicas & Regulação"
                  fallbackBg="#1d5e63"
                  fallbackSvg={
                    <svg viewBox="0 0 24 24">
                      <path d="M2 5h7a3 3 0 0 1 3 3v12a2 2 0 0 0-2-2H2zM22 5h-7a3 3 0 0 0-3 3v12a2 2 0 0 1 2-2h8z" />
                    </svg>
                  }
                />
                <span>
                  <span className="na-kick">Intervenção clínica</span>
                  <span className="na-title">
                    Histórias Clínicas &amp; <em>Regulação</em>
                  </span>
                  <span className="na-meta">
                    <span>50 histórias</span>
                    <span>6–19 anos</span>
                  </span>
                </span>
              </span>
            </button>
            <div className="na-more" id="rc-hist">
              <div className="na-sep"></div>
              <p className="na-desc">
                <b>50 narrativas estruturadas</b> e <b>50 ilustrações exclusivas</b> para usar em sessão com crianças, adolescentes e jovens adultos. Trabalham autoconsciência corporal, reestruturação de pensamentos automáticos e controle inibitório adaptativo, numa abordagem cognitivo-comportamental.
              </p>
              <div className="na-3">
                <div>
                  <i>01</i>
                  <b>Observar</b>
                  <small>Perceber o corpo e a emoção</small>
                </div>
                <div>
                  <i>02</i>
                  <b>Pensar</b>
                  <small>Rever o pensamento automático</small>
                </div>
                <div>
                  <i>03</i>
                  <b>Agir</b>
                  <small>Escolher a resposta adaptativa</small>
                </div>
              </div>
              <div className="na-lbl">
                Módulos por faixa etária <b>10 histórias cada</b>
              </div>
              <ul className="na-5">
                <li style={{ ['--c' as any]: '#6a4870' }}>
                  <b>6–8</b>
                  <small>Infantil I</small>
                  <span>10 hist.</span>
                </li>
                <li style={{ ['--c' as any]: '#2e4c78' }}>
                  <b>8–11</b>
                  <small>Infantil II</small>
                  <span>10 hist.</span>
                </li>
                <li style={{ ['--c' as any]: '#1d5e63' }}>
                  <b>11–13</b>
                  <small>Transição</small>
                  <span>10 hist.</span>
                </li>
                <li style={{ ['--c' as any]: '#8a5317' }}>
                  <b>14–16</b>
                  <small>Adolescência</small>
                  <span>10 hist.</span>
                </li>
                <li style={{ ['--c' as any]: '#2f6b31' }}>
                  <b>16–19</b>
                  <small>Jovem adulto</small>
                  <span>10 hist.</span>
                </li>
              </ul>
              <div className="na-foot">
                <span className="na-tag">
                  <svg viewBox="0 0 24 24">
                    <path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6z" />
                    <path d="m9 12 2 2 4-4" />
                  </svg>
                  Sessão interativa digital · plano Prática
                </span>
                {!planInfo.hasRecursos ? (
                  <button
                    type="button"
                    className="na-cta na-cta--locked"
                    onClick={() => setShowUpgradeModal(true)}
                  >
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" style={{ marginRight: 6 }}>
                      <rect x="5" y="11" width="14" height="10" rx="2" />
                      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
                    </svg>
                    Desbloquear no Prática <i>→</i>
                  </button>
                ) : (
                  <Link className="na-cta" href="/recursos-interativos/historias">
                    Acessar Histórias Clínicas <i>→</i>
                  </Link>
                )}
              </div>
            </div>
          </div>

          {/* Card: Dramatização dos Dois Lados */}
          <div
            className={`na-card ${openCard === 'rc-dramatizacao' ? 'open' : ''}`}
            data-cat="pensamento"
            style={{ display: filter === 'todos' || filter === 'pensamento' ? undefined : 'none' }}
          >
            <button
              className="na-sq"
              type="button"
              aria-expanded={openCard === 'rc-dramatizacao'}
              aria-controls="rc-dramatizacao"
              onClick={() => toggleCard('rc-dramatizacao')}
            >
              <span className="na-sq__top">
                <ResourceCardIcon
                  fileNames={['05_dramatizacao_dois_lados.png', 'dramatizacao.png']}
                  alt="Dramatização dos Dois Lados"
                  fallbackBg="#2f6b31"
                  fallbackSvg={
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    </svg>
                  }
                />
                <span className="na-plus-wrap">
                  {!planInfo.hasRecursos && (
                    <span className="na-lock-pill" title="Recurso exclusivo do plano Prática">
                      <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.4">
                        <rect x="5" y="11" width="14" height="10" rx="2" />
                        <path d="M8 11V7a4 4 0 0 1 8 0v4" />
                      </svg>
                      Prática
                    </span>
                  )}
                  <span className="na-plus" aria-hidden="true">
                    <svg viewBox="0 0 24 24">
                      <path d="M12 5v14M5 12h14" />
                    </svg>
                  </span>
                </span>
              </span>
              <span className="na-sq__main">
                <ResourceCardIcon
                  fileNames={['05_dramatizacao_dois_lados.png', 'dramatizacao.png']}
                  alt="Dramatização dos Dois Lados"
                  fallbackBg="#2f6b31"
                  fallbackSvg={
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    </svg>
                  }
                />
                <span>
                  <span className="na-kick">Técnica de TCC</span>
                  <span className="na-title">
                    Dramatização dos <em>Dois Lados</em>
                  </span>
                  <span className="na-meta">
                    <span>15–25 min</span>
                    <span>TCC · Leahy</span>
                  </span>
                </span>
              </span>
            </button>
            <div className="na-more" id="rc-dramatizacao">
              <div className="na-sep"></div>
              <p className="na-desc">
                Paciente e terapeuta debatem os dois lados de um pensamento negativo, trocando de papel em rodadas sucessivas. Permite identificar quais respostas racionais funcionam na prática, quais pensamentos são mais resistentes e mapear regras subjacentes.
              </p>
              <div className="na-3">
                <div>
                  <i>01</i>
                  <b>Preparar</b>
                  <small>Pensamento-alvo e crença inicial</small>
                </div>
                <div>
                  <i>02</i>
                  <b>Debater</b>
                  <small>Arena com troca ativa de papéis</small>
                </div>
                <div>
                  <i>03</i>
                  <b>Consolidar</b>
                  <small>Resumo e tarefa inter-sessões</small>
                </div>
              </div>
              <div className="na-lbl">
                Recursos clínicos inclusos <b>em tempo real</b>
              </div>
              <ul className="na-5">
                <li style={{ ['--c' as any]: '#2f6b31' }}>
                  <b>Arena</b>
                  <small>Troca de papéis</small>
                  <span>2 a 4 rodadas</span>
                </li>
                <li style={{ ['--c' as any]: '#1d5e63' }}>
                  <b>Roteiro</b>
                  <small>Camada terapeuta</small>
                  <span>Atalho R</span>
                </li>
                <li style={{ ['--c' as any]: '#2e4c78' }}>
                  <b>Métricas</b>
                  <small>Curva de crença</small>
                  <span>0 a 100%</span>
                </li>
                <li style={{ ['--c' as any]: '#8a5317' }}>
                  <b>Autosave</b>
                  <small>Anti-perda</small>
                  <span>Offline</span>
                </li>
                <li style={{ ['--c' as any]: '#6a4870' }}>
                  <b>Impressão</b>
                  <small>Folha clínica</small>
                  <span>2 páginas</span>
                </li>
              </ul>
              <div className="na-foot">
                <span className="na-tag">
                  <svg viewBox="0 0 24 24">
                    <path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6z" />
                    <path d="m9 12 2 2 4-4" />
                  </svg>
                  Sessão interativa digital · plano Prática
                </span>
                {!planInfo.hasRecursos ? (
                  <button
                    type="button"
                    className="na-cta na-cta--locked"
                    onClick={() => setShowUpgradeModal(true)}
                  >
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" style={{ marginRight: 6 }}>
                      <rect x="5" y="11" width="14" height="10" rx="2" />
                      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
                    </svg>
                    Desbloquear no Prática <i>→</i>
                  </button>
                ) : (
                  <Link className="na-cta" href="/recursos-interativos/dramatizacao?novo=1">
                    Acessar Dramatização dos Dois Lados <i>→</i>
                  </Link>
                )}
              </div>
            </div>
          </div>

          {/* Card 2: Baralho de Funções Executivas (Em desenvolvimento) */}
          <div
            className="na-card breve"
            data-cat="baralhos"
            style={{ display: filter === 'todos' || filter === 'baralhos' ? undefined : 'none' }}
          >
            <button className="na-sq" type="button" disabled>
              <span className="na-sq__top">
                <ResourceCardIcon
                  fileNames={['02_baralho_funcoes_executivas.png', 'baralho-funcoes-executivas.png']}
                  alt="Baralho de Funções Executivas"
                  fallbackBg="#6a4870"
                  fallbackSvg={
                    <svg viewBox="0 0 24 24">
                      <rect x="4" y="4" width="11" height="15" rx="2" />
                      <path d="M9 8h10a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1H9" />
                    </svg>
                  }
                />
                <span className="na-badge">Em breve</span>
              </span>
              <span className="na-sq__main">
                <ResourceCardIcon
                  fileNames={['02_baralho_funcoes_executivas.png', 'baralho-funcoes-executivas.png']}
                  alt="Baralho de Funções Executivas"
                  fallbackBg="#6a4870"
                  fallbackSvg={
                    <svg viewBox="0 0 24 24">
                      <rect x="4" y="4" width="11" height="15" rx="2" />
                      <path d="M9 8h10a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1H9" />
                    </svg>
                  }
                />
                <span>
                  <span className="na-kick">Em desenvolvimento</span>
                  <span className="na-title">
                    Baralho de <em>Funções Executivas</em>
                  </span>
                  <span className="na-meta">
                    <span>48 cartas</span>
                    <span>Infantil e adolescente</span>
                  </span>
                </span>
              </span>
            </button>
          </div>

          {/* Card 3: Atividades de atenção (breve) */}
          <div
            className="na-card breve"
            data-cat="baralhos"
            style={{ display: filter === 'todos' || filter === 'baralhos' ? undefined : 'none' }}
          >
            <button className="na-sq" type="button" disabled>
              <span className="na-sq__top">
                <ResourceCardIcon
                  fileNames={['03_atividades_atencao.png', 'atividades-atencao.png']}
                  alt="Atividades de atenção"
                  fallbackBg="#2e4c78"
                  fallbackSvg={
                    <svg viewBox="0 0 24 24">
                      <path d="M4 7h4a2 2 0 1 1 4 0h4v4a2 2 0 1 1 0 4v4H4z" />
                    </svg>
                  }
                />
                <span className="na-badge">Em breve</span>
              </span>
              <span className="na-sq__main">
                <ResourceCardIcon
                  fileNames={['03_atividades_atencao.png', 'atividades-atencao.png']}
                  alt="Atividades de atenção"
                  fallbackBg="#2e4c78"
                  fallbackSvg={
                    <svg viewBox="0 0 24 24">
                      <path d="M4 7h4a2 2 0 1 1 4 0h4v4a2 2 0 1 1 0 4v4H4z" />
                    </svg>
                  }
                />
                <span>
                  <span className="na-kick">Em desenvolvimento</span>
                  <span className="na-title">
                    Atividades de <em>atenção</em>
                  </span>
                  <span className="na-meta">
                    <span>Infantil</span>
                  </span>
                </span>
              </span>
            </button>
          </div>

          {/* Card 4: Treino de percepção (breve) */}
          <div
            className="na-card breve"
            data-cat="historias"
            style={{ display: filter === 'todos' || filter === 'historias' ? undefined : 'none' }}
          >
            <button className="na-sq" type="button" disabled>
              <span className="na-sq__top">
                <ResourceCardIcon
                  fileNames={['04_treino_percepcao.png', 'treino-percepcao.png']}
                  alt="Treino de percepção"
                  fallbackBg="#8a5317"
                  fallbackSvg={
                    <svg viewBox="0 0 24 24">
                      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  }
                />
                <span className="na-badge">Em breve</span>
              </span>
              <span className="na-sq__main">
                <ResourceCardIcon
                  fileNames={['04_treino_percepcao.png', 'treino-percepcao.png']}
                  alt="Treino de percepção"
                  fallbackBg="#8a5317"
                  fallbackSvg={
                    <svg viewBox="0 0 24 24">
                      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  }
                />
                <span>
                  <span className="na-kick">Em desenvolvimento</span>
                  <span className="na-title">
                    Treino de <em>percepção</em>
                  </span>
                  <span className="na-meta">
                    <span>Todas as idades</span>
                  </span>
                </span>
              </span>
            </button>
          </div>
        </div>

        <div className="nota-uso">
          <svg viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="9" />
            <path d="M12 11v5M12 8v.01" />
          </svg>
          <span>
            <b>Material de apoio.</b> Os recursos interativos não substituem testes psicológicos nem o julgamento clínico. Use-os dentro do seu planejamento de sessão e não registre dados que identifiquem pacientes.
          </span>
        </div>
      </div>

      {showUpgradeModal && (
        <div
          className="na-modal-overlay"
          role="dialog"
          aria-modal="true"
          onClick={() => setShowUpgradeModal(false)}
        >
          <div
            className="na-modal-dialog"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="na-modal-close"
              onClick={() => setShowUpgradeModal(false)}
              aria-label="Fechar"
            >
              <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" fill="none" strokeWidth="2.5">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
            <UpgradeGate targetPlan="pratica" />
          </div>
        </div>
      )}
    </PlatformShell>
  );
}
