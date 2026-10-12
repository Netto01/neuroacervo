'use client';

import React from 'react';
import Link from 'next/link';
import { useNeuro } from '@/context/NeuroContext';
import { resolveUserPlan } from '@/utils/userPlan';
import styles from './PraticaGate.module.css';

interface PlanoOption {
  id: string;
  nome: string;
  ordem: number;
  preco: string;
  desc: string;
  libera: boolean;
}

const PLANOS: PlanoOption[] = [
  {
    id: 'estudo',
    nome: 'Estudo',
    ordem: 2,
    preco: '<b>R$ 39,90</b>/mês',
    desc: 'Tudo do Consulta, mais aulas gravadas em módulos e estudos de caso clínicos.',
    libera: false
  },
  {
    id: 'pratica',
    nome: 'Prática',
    ordem: 3,
    preco: '<b>R$ 49,90</b>/mês ou R$ 399/ano',
    desc: 'Tudo do Estudo, mais os recursos interativos e novas ferramentas práticas todo mês.',
    libera: true
  }
];

const NOMES_PLANOS: Record<string, string> = {
  consulta: 'Consulta',
  estudo: 'Estudo',
  pratica: 'Prática'
};

export function PraticaGate() {
  const { currentUser } = useNeuro();
  const planInfo = resolveUserPlan(currentUser);

  const rawTipo = planInfo.tipo;
  const planoAtual = rawTipo === 'estudo' ? 'estudo' : rawTipo === 'pratica' ? 'pratica' : 'consulta';
  const ordemAtual = planoAtual === 'estudo' ? 2 : planoAtual === 'pratica' ? 3 : 1;
  const nomeExibicao = NOMES_PLANOS[planoAtual] || 'Consulta';

  let disponiveis = PLANOS.filter((p) => p.ordem > ordemAtual);
  if (disponiveis.length === 0) {
    disponiveis = [PLANOS[1]]; // Garante exibição do Prática caso necessário
  }

  return (
    <section className={styles.naGate} aria-labelledby="na-gate-title">
      <span className={styles.naGateTape} aria-hidden="true" />
      <div className={styles.naGateIcon} aria-hidden="true">
        <svg viewBox="0 0 24 24">
          <rect x="5" y="11" width="14" height="10" rx="2" />
          <path d="M8 11V7a4 4 0 0 1 8 0v4" />
        </svg>
      </div>

      <span className={styles.naGateKick}>Exclusivo do plano Prática</span>
      <h2 className={styles.naGateTitle} id="na-gate-title">
        Leve o acervo para <em>dentro da sessão</em>
      </h2>
      <p className={styles.naGateDesc}>
        Você está no plano <b>{nomeExibicao}</b>. Os recursos interativos fazem parte do plano Prática:
      </p>

      <ul className={styles.naGateList}>
        <li>
          <span className={styles.naGateIc} style={{ background: '#6a4870' }}>
            <svg viewBox="0 0 24 24">
              <rect x="4" y="4" width="11" height="15" rx="2" />
              <path d="M9 8h10a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1H9" />
            </svg>
          </span>
          <span>
            <b>Baralho de Funções Executivas</b>
            <small>Interativo, para usar em sessão</small>
          </span>
          <svg className={styles.naGateLock} viewBox="0 0 24 24" aria-hidden="true">
            <rect x="5" y="11" width="14" height="10" rx="2" />
            <path d="M8 11V7a4 4 0 0 1 8 0v4" />
          </svg>
        </li>
        <li>
          <span className={styles.naGateIc} style={{ background: '#1d5e63' }}>
            <svg viewBox="0 0 24 24">
              <path d="M2 5h7a3 3 0 0 1 3 3v12a2 2 0 0 0-2-2H2zM22 5h-7a3 3 0 0 0-3 3v12a2 2 0 0 1 2-2h8z" />
            </svg>
          </span>
          <span>
            <b>Histórias Temáticas</b>
            <small>Ilustradas, infantil e adulto</small>
          </span>
          <svg className={styles.naGateLock} viewBox="0 0 24 24" aria-hidden="true">
            <rect x="5" y="11" width="14" height="10" rx="2" />
            <path d="M8 11V7a4 4 0 0 1 8 0v4" />
          </svg>
        </li>
      </ul>

      <p className={styles.naGateOptsT}>Planos disponíveis para você</p>
      <div className={styles.naGateOpts}>
        {disponiveis.map((p) => {
          const isDestaque = p.libera;
          return (
            <div
              key={p.id}
              className={`${styles.naGateOpt} ${isDestaque ? styles.destaque : ''}`}
            >
              <div className={styles.naGateOptTxt}>
                <span className={styles.naGateOptNome}>
                  {p.nome}
                  {p.libera ? (
                    <span className={styles.naGateTag}>Libera esta área</span>
                  ) : (
                    <span className={`${styles.naGateTag} ${styles.cinza}`}>
                      Não inclui os interativos
                    </span>
                  )}
                </span>
                <span className={styles.naGateOptDesc}>{p.desc}</span>
                <span
                  className={styles.naGateOptPreco}
                  dangerouslySetInnerHTML={{ __html: p.preco }}
                />
              </div>
              <Link
                className={`${styles.naGateCta} ${isDestaque ? '' : styles.sec}`}
                href={`/plataforma/upgrade?plano=${p.id}`}
              >
                Upgrade para o {p.nome} <i>&rarr;</i>
              </Link>
            </div>
          );
        })}
      </div>

      <p className={styles.naGateSub}>
        Liberação imediata após o pagamento · Cancele quando quiser ·{' '}
        <Link className={styles.naGateLink} href="/plataforma/upgrade">
          Comparar planos
        </Link>
      </p>
    </section>
  );
}
