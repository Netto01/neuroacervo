'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useNeuro } from '@/context/NeuroContext';
import { PlatformShell } from '@/components/layout/PlatformShell';
import { MaterialItem } from '@/types/neuro';

interface AnamneseTrilha {
  id: string;
  titulo: string;
  populacao: string;
  icone: string;
  foco: string;
  secoes: {
    nome: string;
    perguntas: string[];
  }[];
}

const TRILHAS_ANAMNESE: AnamneseTrilha[] = [
  {
    id: 'adulto',
    titulo: 'Anamnese Neuropsicológica do Adulto & Idoso',
    populacao: 'Adultos e Idosos (com informante colateral)',
    icone: '#i-user',
    foco: 'Investigação de declínio cognitivo, queixas atencionais tardias e impacto funcional em AVDs.',
    secoes: [
      {
        nome: '1. História da Queixa & Instalação Temporal',
        perguntas: [
          'Quando exatamente foram notadas as primeiras alterações de memória ou atenção?',
          'O início dos sintomas foi insidioso (gradual e lento) ou súbito (após evento específico, luto, trauma, AVC)?',
          'O próprio paciente percebe os esquecimentos ou a iniciativa da busca partiu de familiares (anosognosia)?'
        ]
      },
      {
        nome: '2. Impacto na Vida Diária (AIVDs e ABVDs)',
        perguntas: [
          'Houve perda de autonomia na administração de finanças, contas bancárias ou compras complexas?',
          'Como está a capacidade de gerenciamento da tomada de medicações e horários?',
          'Houve desorientação espacial recente em trajetos conhecidos ao dirigir ou caminhar?'
        ]
      },
      {
        nome: '3. Sono, Humor e Antecedentes Clínicos',
        perguntas: [
          'Presença de insônia, despertares frequentes ou movimentos anormais durante o sono REM?',
          'Sintomas depressivos ou ansiosos antecederam as queixas cognitivas?',
          'Histórico de hipertensão, diabetes, hipotireoidismo, hipovitaminose B12 ou histórico familiar de demência?'
        ]
      }
    ]
  },
  {
    id: 'infantil',
    titulo: 'Anamnese do Neurodesenvolvimento Infantil',
    populacao: 'Crianças e Adolescentes (entrevista com pais)',
    icone: '#i-cards',
    foco: 'Marcos motores e de linguagem, autorregulação comportamental e rastreio precoce de TEA/TDAH.',
    secoes: [
      {
        nome: '1. Período Gestacional e Neonatal',
        perguntas: [
          'Intercorrências gestacionais (infecções, pré-eclâmpsia, estresse agudo, medicações)?',
          'Idade gestacional ao nascer, tipo de parto, escores de Apgar e necessidade de UTI neonatal?',
          'Sucção inicial, sono do lactente e facilidade de acalento nos primeiros 6 meses?'
        ]
      },
      {
        nome: '2. Marcos do Desenvolvimento Psicomotor e Linguagem',
        perguntas: [
          'Idade em que sustentou a cabeça, sentou sem apoio e deambulou de forma autônoma?',
          'Primeiras palavras com intenção comunicativa (antes dos 18 meses) e combinação de duas palavras (aos 24 meses)?',
          'Contato visual sustentado, resposta ao chamado pelo próprio nome e atenção compartilhada?'
        ]
      },
      {
        nome: '3. Comportamento e Autorregulação',
        perguntas: [
          'Como a criança reage a frustrações cotidianas e mudanças imprevistas de rotina?',
          'Presença de hiperfocos temáticos, estereotipias motoras ou sensibilidade atípica a sons/texturas?',
          'Capacidade de brincar simbólico (faz de conta) e interação com pares na mesma faixa etária?'
        ]
      }
    ]
  },
  {
    id: 'escolar',
    titulo: 'Roteiro de Investigação Pedagógica / Escolar',
    populacao: 'Contato com Educadores e Equipe Pedagógica',
    icone: '#i-story',
    foco: 'Aquisição de leitura, escrita, cálculo e comportamento no ambiente de sala de aula.',
    secoes: [
      {
        nome: '1. Aprendizagem Acadêmica Formal',
        perguntas: [
          'A criança domina a correspondência grafema-fonema compatível com o seu ano escolar?',
          'Apresenta trocas, inversões fonológicas recorrentes ou velocidade de leitura marcadamente lenta?',
          'Dificuldade com conceitos numéricos básicos, conservação de quantidades ou tabuada?'
        ]
      },
      {
        nome: '2. Atenção Sustentada e Funções Executivas em Sala',
        perguntas: [
          'Consegue iniciar e concluir as tarefas individuais sem comandos orais constantes?',
          'Frequentemente esquece materiais escolares, perde objetos ou não anota tarefas na agenda?',
          'Com que frequência levanta do lugar, fala excessivamente ou interrompe a fala do professor?'
        ]
      }
    ]
  }
];

export default function AnamnesePage() {
  const { materials, favorites, toggleFavorite } = useNeuro();

  const [trilhaAtiva, setTrilhaAtiva] = useState<string>('adulto');
  const [search, setSearch] = useState('');
  const [activeMaterial, setActiveMaterial] = useState<MaterialItem | null>(null);

  const trilha = TRILHAS_ANAMNESE.find(t => t.id === trilhaAtiva) || TRILHAS_ANAMNESE[0];

  const anamneseMaterials = useMemo(() => {
    return materials.filter(m => m.type === 'entrevista_anamnese').filter(m => {
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        m.title.toLowerCase().includes(q) ||
        m.subtitle?.toLowerCase().includes(q) ||
        m.authorReference?.toLowerCase().includes(q) ||
        m.description?.toLowerCase().includes(q)
      );
    });
  }, [materials, search]);

  return (
    <PlatformShell 
      activePage="anamnese"
      searchValue={search}
      onSearchChange={setSearch}
      searchPlaceholder="Buscar roteiros de anamnese e entrevistas..."
    >
      <header className="lib-head">
        <div>
          <span className="label">Entrevista Clínica</span>
          <h1>Roteiros de <em>Anamnese</em><span className="dot">.</span></h1>
          <p>
            Perguntas-chave semiestruturadas, investigação de marcos do desenvolvimento e levantamento de história de vida para fundamentação diagnóstica.
          </p>
        </div>
      </header>

      {/* Seletor de Trilhas Clínicas */}
      <section style={{ marginTop: '28px' }}>
        <div className="tabs" style={{ borderBottom: 'none', paddingBottom: '0' }}>
          {TRILHAS_ANAMNESE.map(t => (
            <button
              key={t.id}
              type="button"
              className="tab"
              aria-pressed={trilhaAtiva === t.id}
              onClick={() => setTrilhaAtiva(t.id)}
            >
              <svg className="ico sm"><use href={t.icone}/></svg>
              <span>{t.titulo.split(' ')[2] || t.titulo}</span>
            </button>
          ))}
        </div>

        {/* Card da Trilha Ativa */}
        <div style={{
          background: 'var(--bone)',
          borderRadius: '24px',
          padding: 'clamp(20px, 3.5vw, 32px)',
          marginTop: '16px',
          boxShadow: 'var(--shadow)',
          border: '1px solid var(--line-soft)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
            <span className="ctag c-anamnese">
              <svg className="ico sm"><use href="#i-anamnese"/></svg>
              <span>{trilha.populacao}</span>
            </span>
            <span style={{ font: '400 11.5px/1 var(--mono)', color: 'var(--ink-faint)' }}>
              Roteiro Semiestruturado
            </span>
          </div>

          <h2 style={{ font: '800 24px/1.2 var(--sans)', margin: '12px 0 6px', color: 'var(--ink)', letterSpacing: '-.02em' }}>
            {trilha.titulo}
          </h2>
          <p style={{ margin: '0 0 24px', font: '400 14px/1.55 var(--body)', color: 'var(--ink-mute)', maxWidth: '64ch' }}>
            {trilha.foco}
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {trilha.secoes.map((sec, idx) => (
              <div 
                key={idx}
                style={{
                  background: 'var(--paper)',
                  borderRadius: '16px',
                  padding: '18px 20px',
                  border: '1px solid var(--line-soft)'
                }}
              >
                <h3 style={{ font: '700 15px/1.3 var(--sans)', margin: '0 0 12px', color: 'var(--accent-strong)' }}>
                  {sec.nome}
                </h3>
                <ul style={{ margin: 0, paddingLeft: '18px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {sec.perguntas.map((perg, pIdx) => (
                    <li key={pIdx} style={{ font: '400 13.5px/1.5 var(--body)', color: 'var(--ink-soft)' }}>
                      {perg}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Roteiros e Fichas para Download Cadastrados */}
      <section style={{ marginTop: '48px' }}>
        <div className="sec-rule">
          <span className="roman">II</span>
          <span className="t">Roteiros Prontos para Download e Impressão</span>
          <Link href="/biblioteca?tipo=entrevista_anamnese">Ver no acervo →</Link>
        </div>

        {anamneseMaterials.length > 0 ? (
          <div className="grid" style={{ marginTop: '16px' }}>
            {anamneseMaterials.map(mat => (
              <article 
                key={mat.id} 
                className="mat"
                onClick={() => setActiveMaterial(mat)}
              >
                <div className="mat-top">
                  <span className="ctag c-anamnese">
                    <svg className="ico sm"><use href="#i-anamnese"/></svg>
                    <span>Anamnese</span>
                  </span>
                  <button 
                    type="button" 
                    className="save" 
                    aria-pressed={favorites.includes(mat.id)}
                    title="Favoritar"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(mat.id);
                    }}
                  >
                    <svg className="ico sm"><use href="#i-bookmark"/></svg>
                  </button>
                </div>

                <div className="body">
                  <h3>{mat.title}</h3>
                  {mat.subtitle && <p>{mat.subtitle}</p>}
                </div>

                <div className="meta">
                  {mat.downloadFormat && <span>{mat.downloadFormat}</span>}
                  {mat.downloadSize && <span>{mat.downloadSize}</span>}
                  {mat.authorReference && <span>{mat.authorReference}</span>}
                </div>

                <div className="mat-foot">
                  <span className="open">
                    Ver roteiro
                    <span><svg className="ico sm"><use href="#i-arrow"/></svg></span>
                  </span>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <div className="ring">
              <svg className="ico" style={{ width: 26, height: 26 }}><use href="#i-anamnese"/></svg>
            </div>
            <h3>Nenhum roteiro de anamnese cadastrado ainda</h3>
            <p>
              As fichas de entrevista clínica para adultos, idosos e neuropediatria serão listadas aqui para download direto.
            </p>
            <Link href="/biblioteca" className="btn" style={{ marginTop: '12px' }}>
              Explorar a Biblioteca
              <span><svg className="ico sm"><use href="#i-arrow"/></svg></span>
            </Link>
          </div>
        )}
      </section>

      {/* Drawer */}
      <div 
        className={`scrim ${activeMaterial ? 'on' : ''}`} 
        onClick={() => setActiveMaterial(null)}
      />
      <aside className={`drawer ${activeMaterial ? 'on' : ''}`} aria-hidden={!activeMaterial}>
        {activeMaterial && (
          <>
            <div className="d-top">
              <span>Roteiro de Anamnese</span>
              <button 
                type="button" 
                className="d-close" 
                onClick={() => setActiveMaterial(null)}
              >
                ✕
              </button>
            </div>

            <div className="d-body">
              <div className="d-cover">
                <div className="mark bg-anamnese">
                  <svg className="ico"><use href="#i-anamnese"/></svg>
                </div>
              </div>

              <h2>{activeMaterial.title}</h2>
              {activeMaterial.subtitle && <p className="lead">{activeMaterial.subtitle}</p>}

              <dl className="dl">
                {activeMaterial.downloadFormat && (
                  <>
                    <dt>Formato</dt>
                    <dd>{activeMaterial.downloadFormat}</dd>
                  </>
                )}
                {activeMaterial.downloadSize && (
                  <>
                    <dt>Tamanho</dt>
                    <dd>{activeMaterial.downloadSize}</dd>
                  </>
                )}
                {activeMaterial.authorReference && (
                  <>
                    <dt>Autoria / Ref.</dt>
                    <dd>{activeMaterial.authorReference}</dd>
                  </>
                )}
              </dl>

              {activeMaterial.description && (
                <div className="d-note" style={{ marginTop: '18px' }}>
                  <svg className="ico"><use href="#i-info"/></svg>
                  <span>{activeMaterial.description}</span>
                </div>
              )}
            </div>

            <div className="d-foot">
              <button 
                type="button" 
                className="btn-ghost"
                onClick={() => toggleFavorite(activeMaterial.id)}
              >
                {favorites.includes(activeMaterial.id) ? 'Remover da pasta' : 'Salvar na pasta'}
              </button>
              <button 
                type="button" 
                className="btn"
                onClick={() => alert(`Iniciando download do roteiro "${activeMaterial.title}" (${activeMaterial.downloadFormat}).`)}
              >
                Baixar roteiro ({activeMaterial.downloadFormat})
                <span><svg className="ico sm"><use href="#i-arrow"/></svg></span>
              </button>
            </div>
          </>
        )}
      </aside>
    </PlatformShell>
  );
}
