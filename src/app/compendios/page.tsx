'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useNeuro } from '@/context/NeuroContext';
import { PlatformShell } from '@/components/layout/PlatformShell';
import { MaterialItem } from '@/types/neuro';

interface DominioSintese {
  id: string;
  nome: string;
  circuito: string;
  descricao: string;
  testesChave: string[];
  sindromes: string[];
}

const DOMINIOS_SINTESE: DominioSintese[] = [
  {
    id: 'executivas',
    nome: 'Funções Executivas & Autorregulação',
    circuito: 'Córtex Pré-Frontal (Dorsolateral, Orbitofrontal e Cingulado Anterior) + Circuitos Frontostriatais',
    descricao: 'Conjunto de processos cognitivos de ordem superior responsáveis pela formulação de metas, planejamento sequencial, flexibilidade cognitiva, inibição de respostas prepotentes e monitoramento de erros.',
    testesChave: ['Wisconsin Card Sorting Test (WCST)', 'Trail Making Test B', 'Teste de Stroop', 'Torre de Londres / Hanói', 'FDT (Cinco Dígitos)'],
    sindromes: ['Síndrome Disexecutiva', 'TDAH', 'Lesão Pré-Frontal Traumática', 'Demência Frontotemporal (variante comportamental)']
  },
  {
    id: 'memoria',
    nome: 'Memória & Aprendizagem Episódica',
    circuito: 'Lobo Temporal Medial (Hipocampo, Córtex Entorrinal) e Circuito Límbico de Papez',
    descricao: 'Subsistemas diferenciados entre memória declarativa (episódica e semântica) e não-declarativa (procedimental). A amnésia anterógrada reflete falha no processo de consolidação sináptica hipocampal.',
    testesChave: ['RAVLT (Rey Auditory Verbal Learning Test)', 'Figura Complexa de Rey (Evocação Tardia)', 'WMS (Wechsler Memory Scale)', 'Teste de Memória Comportamental de Rivermead'],
    sindromes: ['Doença de Alzheimer Típica', 'Amnésia Global Transitória', 'Encefalopatia de Wernicke-Korsakoff', 'Epilepsia de Lobo Temporal']
  },
  {
    id: 'atencao',
    nome: 'Atenção & Processamento Cognitivo',
    circuito: 'Rede de Alerta (Locus Coeruleus), Rede de Orientação (Colículos e Parietal Posterior) e Rede Executiva Frontoparietal',
    descricao: 'Capacidade de selecionar estímulos relevantes (atenção seletiva), manter o foco ao longo do tempo (sustentada), alternar demandas (alternada) e processar múltiplos fluxos informacionais (dividida).',
    testesChave: ['D2-R / BPA', 'Teste de Atenção Concentrada (TEACO)', 'Trail Making Test A', 'Continuous Performance Test (CPT-3)', 'Span de Dígitos Direto'],
    sindromes: ['Heminegligência Visoespacial', 'Síndromes Confusionais Agudas (Delirium)', 'Transtorno de Déficit de Atenção']
  },
  {
    id: 'linguagem',
    nome: 'Linguagem, Praxias & Gnosias Visoespaciais',
    circuito: 'Perissilviano Hemisférico Esquerdo (Broca e Wernicke, Fascículo Arqueado) e Vias Visuais Dorsal (Onde) e Ventral (O quê)',
    descricao: 'Processamento expressivo e compreensivo oral e escrito, nomeação rápida por confrontação visual, além de habilidades visuoconstrutivas e práxicas ideomotoras e construcionais.',
    testesChave: ['Boston Naming Test', 'Token Test', 'Figura Complexa de Rey (Cópia)', 'Fluência Verbal Fonêmica (FAS) e Semântica (Animais)'],
    sindromes: ['Afasias Primárias Progressivas (APP)', 'Afasia de Broca / Wernicke pós-AVC', 'Apraxia Ideomotora', 'Agnosia Visual']
  }
];

export default function CompendiosPage() {
  const { materials, favorites, toggleFavorite } = useNeuro();

  const [dominioAtivo, setDominioAtivo] = useState<string>('executivas');
  const [search, setSearch] = useState('');
  const [activeMaterial, setActiveMaterial] = useState<MaterialItem | null>(null);

  const dominio = DOMINIOS_SINTESE.find(d => d.id === dominioAtivo) || DOMINIOS_SINTESE[0];

  const compendioMaterials = useMemo(() => {
    return materials.filter(m => m.type === 'compendio_estudo').filter(m => {
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
      activePage="compendios"
      searchValue={search}
      onSearchChange={setSearch}
      searchPlaceholder="Buscar compêndios teóricos e domínios..."
    >
      <header className="lib-head">
        <div>
          <span className="label">Fundamentação Científica</span>
          <h1>Compêndios <em>Teóricos</em><span className="dot">.</span></h1>
          <p>
            Sínteses conceituais aprofundadas dos grandes domínios da neuropsicologia, correlatos neuroanatômicos e raciocínio fisiopatológico.
          </p>
        </div>
      </header>

      {/* Navegador de Domínios Cognitivos */}
      <section style={{ marginTop: '28px' }}>
        <div className="tabs" style={{ borderBottom: 'none', paddingBottom: '0' }}>
          {DOMINIOS_SINTESE.map(d => (
            <button
              key={d.id}
              type="button"
              className="tab"
              aria-pressed={dominioAtivo === d.id}
              onClick={() => setDominioAtivo(d.id)}
            >
              <svg className="ico sm"><use href="#i-compendio"/></svg>
              <span>{d.nome.split(' ')[0]} {d.nome.split(' ')[1] || ''}</span>
            </button>
          ))}
        </div>

        {/* Card do Domínio Teórico Selecionado */}
        <div style={{
          background: 'var(--bone)',
          borderRadius: '24px',
          padding: 'clamp(20px, 3.5vw, 32px)',
          marginTop: '16px',
          boxShadow: 'var(--shadow)',
          border: '1px solid var(--line-soft)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
            <span className="ctag c-compendio">
              <svg className="ico sm"><use href="#i-compendio"/></svg>
              <span>Síntese de Domínio</span>
            </span>
            <span style={{ font: '400 11px/1 var(--mono)', color: 'var(--ink-faint)' }}>
              Mapeamento Neuropsicológico
            </span>
          </div>

          <h2 style={{ font: '800 24px/1.2 var(--sans)', margin: '14px 0 6px', color: 'var(--ink)', letterSpacing: '-.02em' }}>
            {dominio.nome}
          </h2>

          <div style={{ 
            font: '500 12.5px/1.4 var(--mono)', 
            color: 'var(--cat-compendio)', 
            background: 'rgba(106,72,112,0.08)',
            padding: '8px 12px',
            borderRadius: '10px',
            margin: '10px 0 16px',
            display: 'inline-block'
          }}>
            Substrato Neural: {dominio.circuito}
          </div>

          <p style={{ margin: '0 0 24px', font: '400 15px/1.6 var(--body)', color: 'var(--ink-soft)', maxWidth: '72ch' }}>
            {dominio.descricao}
          </p>

          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', 
            gap: '16px' 
          }}>
            {/* Testes Chave */}
            <div style={{ 
              background: 'var(--paper)', 
              borderRadius: '16px', 
              padding: '16px 18px', 
              border: '1px solid var(--line-soft)' 
            }}>
              <span style={{ font: '600 11px/1 var(--mono)', letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--ink-faint)' }}>
                Instrumentos Psicométricos Padrão-Ouro
              </span>
              <ul style={{ margin: '10px 0 0', paddingLeft: '16px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {dominio.testesChave.map((t, i) => (
                  <li key={i} style={{ font: '500 13px/1.4 var(--sans)', color: 'var(--ink)' }}>
                    {t}
                  </li>
                ))}
              </ul>
            </div>

            {/* Síndromes Associadas */}
            <div style={{ 
              background: 'var(--paper)', 
              borderRadius: '16px', 
              padding: '16px 18px', 
              border: '1px solid var(--line-soft)' 
            }}>
              <span style={{ font: '600 11px/1 var(--mono)', letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--ink-faint)' }}>
                Quadros Clínicos & Fisiopatologias
              </span>
              <ul style={{ margin: '10px 0 0', paddingLeft: '16px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {dominio.sindromes.map((s, i) => (
                  <li key={i} style={{ font: '500 13px/1.4 var(--sans)', color: 'var(--cat-compendio)' }}>
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Compêndios Cadastrados para Download */}
      <section style={{ marginTop: '48px' }}>
        <div className="sec-rule">
          <span className="roman">II</span>
          <span className="t">Compêndios e Manuais Teóricos Completos</span>
          <Link href="/biblioteca?tipo=compendio_estudo">Ver no acervo →</Link>
        </div>

        {compendioMaterials.length > 0 ? (
          <div className="grid" style={{ marginTop: '16px' }}>
            {compendioMaterials.map(mat => (
              <article 
                key={mat.id} 
                className="mat"
                onClick={() => setActiveMaterial(mat)}
              >
                <div className="mat-top">
                  <span className="ctag c-compendio">
                    <svg className="ico sm"><use href="#i-compendio"/></svg>
                    <span>Compêndio</span>
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
                  {mat.authorReference && <span>{mat.authorReference}</span>}
                  {mat.downloadFormat && <span>{mat.downloadFormat}</span>}
                  {mat.downloadSize && <span>{mat.downloadSize}</span>}
                </div>

                <div className="mat-foot">
                  <span className="open">
                    Acessar compêndio
                    <span><svg className="ico sm"><use href="#i-arrow"/></svg></span>
                  </span>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <div className="ring">
              <svg className="ico" style={{ width: 26, height: 26 }}><use href="#i-compendio"/></svg>
            </div>
            <h3>Nenhum compêndio teórico cadastrado ainda</h3>
            <p>
              As monografias científicas, revisões de consenso e sínteses conceituais serão disponibilizadas aqui no formato digital.
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
              <span>Compêndio de Estudo</span>
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
                <div className="mark bg-compendio">
                  <svg className="ico"><use href="#i-compendio"/></svg>
                </div>
              </div>

              <h2>{activeMaterial.title}</h2>
              {activeMaterial.subtitle && <p className="lead">{activeMaterial.subtitle}</p>}

              <dl className="dl">
                {activeMaterial.authorReference && (
                  <>
                    <dt>Autores / Ref.</dt>
                    <dd>{activeMaterial.authorReference}</dd>
                  </>
                )}
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
                onClick={() => alert(`Iniciando download do compêndio "${activeMaterial.title}" (${activeMaterial.downloadFormat}).`)}
              >
                Baixar compêndio ({activeMaterial.downloadFormat})
                <span><svg className="ico sm"><use href="#i-arrow"/></svg></span>
              </button>
            </div>
          </>
        )}
      </aside>
    </PlatformShell>
  );
}
