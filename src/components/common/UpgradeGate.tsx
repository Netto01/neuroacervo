'use client';

import React from 'react';
import Link from 'next/link';
import { useNeuro } from '@/context/NeuroContext';
import { resolveUserPlan } from '@/utils/userPlan';
import styles from './PraticaGate.module.css';

export interface UpgradeGatePreviewItem {
  titulo: string;
  subtitulo: string;
  bg?: string;
  icon?: React.ReactNode;
}

export interface UpgradeGateProps {
  /**
   * Plano mínimo necessário para desbloquear a tela ou recurso.
   * 'estudo' = requer nível 2 (ou 3)
   * 'pratica' = requer nível 3
   */
  targetPlan?: 'estudo' | 'pratica';
  kick?: string;
  titulo?: React.ReactNode;
  descricao?: React.ReactNode;
  previewItems?: UpgradeGatePreviewItem[];
  className?: string;
}

interface PlanoOption {
  id: string;
  nome: string;
  ordem: number;
  preco: string;
  desc: string;
  libera: boolean;
  tagTexto: string;
  tagCinza?: boolean;
}

const NOMES_PLANOS: Record<string, string> = {
  consulta: 'Consulta',
  estudo: 'Estudo',
  pratica: 'Prática'
};

export function UpgradeGate({
  targetPlan = 'pratica',
  kick,
  titulo,
  descricao,
  previewItems,
  className = ''
}: UpgradeGateProps) {
  const { currentUser } = useNeuro();
  const planInfo = resolveUserPlan(currentUser);

  const rawTipo = planInfo.tipo;
  const planoAtual = rawTipo === 'estudo' ? 'estudo' : rawTipo === 'pratica' ? 'pratica' : 'consulta';
  const ordemAtual = planoAtual === 'estudo' ? 2 : planoAtual === 'pratica' ? 3 : 1;
  const nomeExibicao = NOMES_PLANOS[planoAtual] || 'Consulta';

  // Configurações padrão por plano alvo
  const isEstudoGate = targetPlan === 'estudo';

  const defaultKick = isEstudoGate
    ? 'Exclusivo dos planos Estudo e Prática'
    : 'Exclusivo do plano Prática';

  const defaultTitulo = isEstudoGate ? (
    <>
      Aprofunde seu <em>raciocínio clínico</em>
    </>
  ) : (
    <>
      Leve o acervo para <em>dentro da sessão</em>
    </>
  );

  const defaultDescricao = isEstudoGate ? (
    <>
      Você está no plano <b>{nomeExibicao}</b>. O módulo de videoaulas formativas e discussão de casos clínicos faz parte dos planos Estudo e Prática:
    </>
  ) : (
    <>
      Você está no plano <b>{nomeExibicao}</b>. Os recursos interativos fazem parte do plano Prática:
    </>
  );

  const defaultPreviewItems: UpgradeGatePreviewItem[] = isEstudoGate
    ? [
        {
          titulo: 'Videoaulas Formativas',
          subtitulo: 'Raciocínio diagnóstico em módulos gravados',
          bg: '#245426',
          icon: (
            <svg viewBox="0 0 24 24">
              <polygon points="6 4 20 12 6 20 6 4" />
            </svg>
          )
        },
        {
          titulo: 'Estudos de Casos Clínicos',
          subtitulo: 'Discussão prática de instrumentos e laudos',
          bg: '#6a4870',
          icon: (
            <svg viewBox="0 0 24 24">
              <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z" />
              <path d="M6 6h10M6 10h10" />
            </svg>
          )
        }
      ]
    : [
        {
          titulo: 'Baralho de Funções Executivas',
          subtitulo: 'Interativo, para usar em sessão',
          bg: '#6a4870',
          icon: (
            <svg viewBox="0 0 24 24">
              <rect x="4" y="4" width="11" height="15" rx="2" />
              <path d="M9 8h10a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1H9" />
            </svg>
          )
        },
        {
          titulo: 'Histórias Temáticas',
          subtitulo: 'Ilustradas, infantil e adulto',
          bg: '#1d5e63',
          icon: (
            <svg viewBox="0 0 24 24">
              <path d="M2 5h7a3 3 0 0 1 3 3v12a2 2 0 0 0-2-2H2zM22 5h-7a3 3 0 0 0-3 3v12a2 2 0 0 1 2-2h8z" />
            </svg>
          )
        }
      ];

  const itensExibicao = previewItems && previewItems.length > 0 ? previewItems : defaultPreviewItems;

  // Montagem dinâmica das opções de planos disponíveis para upgrade
  let disponiveis: PlanoOption[] = [];

  if (isEstudoGate) {
    if (ordemAtual < 2) {
      disponiveis.push({
        id: 'estudo',
        nome: 'Estudo',
        ordem: 2,
        preco: '<b>R$ 44,90</b>/mês',
        desc: 'Tudo do Consulta, mais aulas gravadas em módulos e estudos de caso clínicos.',
        libera: true,
        tagTexto: 'Libera esta área'
      });
    }
    if (ordemAtual < 3) {
      disponiveis.push({
        id: 'pratica',
        nome: 'Prática',
        ordem: 3,
        preco: '<b>R$ 69,90</b>/mês ou R$ 699/ano',
        desc: 'Tudo do Estudo, mais os recursos interativos e novas ferramentas práticas todo mês.',
        libera: ordemAtual === 2, // Destaque se já for estudo, caso contrário opção avançada
        tagTexto: 'Inclui aulas + interativos'
      });
    }
  } else {
    // Portão do Prática
    if (ordemAtual < 2) {
      disponiveis.push({
        id: 'estudo',
        nome: 'Estudo',
        ordem: 2,
        preco: '<b>R$ 44,90</b>/mês',
        desc: 'Tudo do Consulta, mais aulas gravadas em módulos e estudos de caso clínicos.',
        libera: false,
        tagTexto: 'Não inclui os interativos',
        tagCinza: true
      });
    }
    if (ordemAtual < 3) {
      disponiveis.push({
        id: 'pratica',
        nome: 'Prática',
        ordem: 3,
        preco: '<b>R$ 69,90</b>/mês ou R$ 699/ano',
        desc: 'Tudo do Estudo, mais os recursos interativos e novas ferramentas práticas todo mês.',
        libera: true,
        tagTexto: 'Libera esta área'
      });
    }
  }

  // Fallback de segurança se nenhuma opção estiver acima
  if (disponiveis.length === 0) {
    disponiveis = [
      {
        id: 'pratica',
        nome: 'Prática',
        ordem: 3,
        preco: '<b>R$ 69,90</b>/mês ou R$ 699/ano',
        desc: 'Acesso completo com todas as videoaulas e ferramentas interativas.',
        libera: true,
        tagTexto: 'Acesso completo'
      }
    ];
  }

  return (
    <section className={`${styles.naGate} ${className}`} aria-labelledby="na-gate-title">
      <span className={styles.naGateTape} aria-hidden="true" />
      <div className={styles.naGateIcon} aria-hidden="true">
        <svg viewBox="0 0 24 24">
          <rect x="5" y="11" width="14" height="10" rx="2" />
          <path d="M8 11V7a4 4 0 0 1 8 0v4" />
        </svg>
      </div>

      <span className={styles.naGateKick}>{kick || defaultKick}</span>
      <h2 className={styles.naGateTitle} id="na-gate-title">
        {titulo || defaultTitulo}
      </h2>
      <p className={styles.naGateDesc}>{descricao || defaultDescricao}</p>

      <ul className={styles.naGateList}>
        {itensExibicao.map((item, idx) => (
          <li key={idx}>
            <span
              className={styles.naGateIc}
              style={{ background: item.bg || (idx % 2 === 0 ? '#6a4870' : '#1d5e63') }}
            >
              {item.icon || (
                <svg viewBox="0 0 24 24">
                  <rect x="4" y="4" width="11" height="15" rx="2" />
                  <path d="M9 8h10a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1H9" />
                </svg>
              )}
            </span>
            <span>
              <b>{item.titulo}</b>
              <small>{item.subtitulo}</small>
            </span>
            <svg className={styles.naGateLock} viewBox="0 0 24 24" aria-hidden="true">
              <rect x="5" y="11" width="14" height="10" rx="2" />
              <path d="M8 11V7a4 4 0 0 1 8 0v4" />
            </svg>
          </li>
        ))}
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
                  <span
                    className={`${styles.naGateTag} ${
                      p.tagCinza ? styles.cinza : ''
                    }`}
                  >
                    {p.tagTexto}
                  </span>
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

/**
 * Atalho para a tela de Prática (compatibilidade com imports existentes)
 */
export function PraticaGate(props: Omit<UpgradeGateProps, 'targetPlan'>) {
  return <UpgradeGate targetPlan="pratica" {...props} />;
}
