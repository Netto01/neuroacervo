'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useNeuro } from '@/context/NeuroContext';
import { PlatformShell } from '@/components/layout/PlatformShell';
import { resolveUserPlan } from '@/utils/userPlan';
import './recursos.css';

export default function RecursosInterativosPage() {
  const { currentUser } = useNeuro();
  const planInfo = resolveUserPlan(currentUser);

  const [filter, setFilter] = useState<'todos' | 'historias' | 'baralhos'>('todos');
  const [openCard, setOpenCard] = useState<string | null>(null);

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

  const handleFilter = (f: 'todos' | 'historias' | 'baralhos') => {
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
      {!planInfo.hasRecursos && (
        <div className="aviso">
          <svg viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="9" />
            <path d="M12 8v5M12 16.5v.01" />
          </svg>
          <span>
            <b>Assinatura pendente.</b>{' '}
            <span className="t">Conclua o pagamento do plano Prática para liberar os recursos interativos.</span>
          </span>
          <Link href="/assinatura">Concluir pagamento</Link>
        </div>
      )}

      <div className="wrap">
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
          <div className="stats">
            <div>
              <b>1</b>
              <span>recurso ativo</span>
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

        <div className="filtros" role="group" aria-label="Filtrar recursos">
          <button
            type="button"
            className={filter === 'todos' ? 'on' : ''}
            onClick={() => handleFilter('todos')}
          >
            Todos<span className="ct">4</span>
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
                <span className="na-ic" style={{ background: '#1d5e63' }}>
                  <svg viewBox="0 0 24 24">
                    <path d="M2 5h7a3 3 0 0 1 3 3v12a2 2 0 0 0-2-2H2zM22 5h-7a3 3 0 0 0-3 3v12a2 2 0 0 1 2-2h8z" />
                  </svg>
                </span>
                <span className="na-plus" aria-hidden="true">
                  <svg viewBox="0 0 24 24">
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                </span>
              </span>
              <span className="na-sq__main">
                <span className="na-ic" style={{ background: '#1d5e63' }}>
                  <svg viewBox="0 0 24 24">
                    <path d="M2 5h7a3 3 0 0 1 3 3v12a2 2 0 0 0-2-2H2zM22 5h-7a3 3 0 0 0-3 3v12a2 2 0 0 1 2-2h8z" />
                  </svg>
                </span>
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
                <Link className="na-cta" href="/recursos-interativos/historias">
                  Acessar Histórias Clínicas <i>→</i>
                </Link>
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
                <span className="na-ic" style={{ background: '#6a4870' }}>
                  <svg viewBox="0 0 24 24">
                    <rect x="4" y="4" width="11" height="15" rx="2" />
                    <path d="M9 8h10a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1H9" />
                  </svg>
                </span>
                <span className="na-badge">Em breve</span>
              </span>
              <span className="na-sq__main">
                <span className="na-ic" style={{ background: '#6a4870' }}>
                  <svg viewBox="0 0 24 24">
                    <rect x="4" y="4" width="11" height="15" rx="2" />
                    <path d="M9 8h10a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1H9" />
                  </svg>
                </span>
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
                <span className="na-ic" style={{ background: '#2e4c78' }}>
                  <svg viewBox="0 0 24 24">
                    <path d="M4 7h4a2 2 0 1 1 4 0h4v4a2 2 0 1 1 0 4v4H4z" />
                  </svg>
                </span>
                <span className="na-badge">Em breve</span>
              </span>
              <span className="na-sq__main">
                <span className="na-ic" style={{ background: '#2e4c78' }}>
                  <svg viewBox="0 0 24 24">
                    <path d="M4 7h4a2 2 0 1 1 4 0h4v4a2 2 0 1 1 0 4v4H4z" />
                  </svg>
                </span>
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
                <span className="na-ic" style={{ background: '#8a5317' }}>
                  <svg viewBox="0 0 24 24">
                    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                </span>
                <span className="na-badge">Em breve</span>
              </span>
              <span className="na-sq__main">
                <span className="na-ic" style={{ background: '#8a5317' }}>
                  <svg viewBox="0 0 24 24">
                    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                </span>
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
    </PlatformShell>
  );
}
