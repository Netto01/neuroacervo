'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useNeuro } from '@/context/NeuroContext';
import { PlatformShell } from '@/components/layout/PlatformShell';
import { MaterialItem } from '@/types/neuro';

export default function GuiasPage() {
  const { materials, favorites, toggleFavorite } = useNeuro();

  // Z-Score calculator state
  const [calcScore, setCalcScore] = useState<string>('-1.2');
  const [search, setSearch] = useState('');
  const [activeMaterial, setActiveMaterial] = useState<MaterialItem | null>(null);

  // Psychometric stratification logic
  const getZInterpretation = (zVal: number) => {
    if (isNaN(zVal)) return { label: 'Inválido', color: 'var(--ink-faint)', desc: 'Insira um valor numérico válido.', redact: 'Não avaliável.' };
    if (zVal >= 1.5) {
      return { 
        label: 'Desempenho Muito Superior', 
        color: 'var(--accent-strong)', 
        desc: 'Percentil > 93. Mais de 1,5 desvios-padrão acima da média.',
        redact: 'desempenho qualitativamente muito superior ao esperado para a sua faixa etária e escolaridade'
      };
    }
    if (zVal >= 1.0) {
      return { 
        label: 'Desempenho Superior', 
        color: 'var(--accent-strong)', 
        desc: 'Percentil 84 a 93. Entre 1,0 e 1,5 desvios-padrão acima da média.',
        redact: 'desempenho superior, com facilidade acima da média populacional normatizada'
      };
    }
    if (zVal >= -1.0) {
      return { 
        label: 'Desempenho Médio / Preservado', 
        color: 'var(--accent-strong)', 
        desc: 'Percentil 16 a 84. Faixa de normalidade estatística esperada.',
        redact: 'desempenho preservado e compatível com os parâmetros normativos médios da população de referência'
      };
    }
    if (zVal >= -1.5) {
      return { 
        label: 'Desempenho Limítrofe / Rebaixamento Leve', 
        color: '#b27a00', 
        desc: 'Percentil 7 a 15. Atenção clínica recomendada (1 a 1,5 DP abaixo).',
        redact: 'rebaixamento limítrofe no domínio testado, sugerindo vulnerabilidade funcional que demanda correlação ecológica'
      };
    }
    if (zVal >= -2.0) {
      return { 
        label: 'Déficit Clinicamente Significativo', 
        color: '#d04f2f', 
        desc: 'Percentil 2 a 6. Entre 1,5 e 2,0 desvios-padrão abaixo da média.',
        redact: 'déficit cognitivo expressivo e estatisticamente significante em relação ao grupo de controle emparelhado'
      };
    }
    return { 
      label: 'Déficit Severo / Grave', 
      color: '#a31b1b', 
      desc: 'Percentil < 2. Mais de 2,0 desvios-padrão abaixo da média normativa.',
      redact: 'comprometimento neuropsicológico grave, com impacto direto e desproporcional nas rotinas adaptativas'
    };
  };

  const parsedZ = parseFloat(calcScore);
  const zInfo = getZInterpretation(parsedZ);

  // Filter materials of type guia_rapido
  const quickGuides = useMemo(() => {
    return materials.filter(m => m.type === 'guia_rapido').filter(m => {
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
      activePage="guias"
      searchValue={search}
      onSearchChange={setSearch}
      searchPlaceholder="Buscar guias de aplicação ou instrumentos..."
    >
      <header className="lib-head">
        <div>
          <span className="label">Consultas de Cabeceira</span>
          <h1>Guias Rápidos & <em>Normas</em><span className="dot">.</span></h1>
          <p>
            Critérios psicométricos de cabeceira, cálculo instantâneo de escores Z e percentis, e tabelas de corte adaptadas à realidade brasileira.
          </p>
        </div>
      </header>

      {/* Widget Interativo: Calculadora de Escore Z */}
      <section style={{ marginTop: '28px' }}>
        <div style={{
          background: 'var(--ink)',
          color: 'var(--paper)',
          borderRadius: '24px',
          padding: 'clamp(20px, 3.5vw, 36px)',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: 'var(--shadow)'
        }}>
          <div style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: 'var(--noise)',
            backgroundSize: '240px',
            opacity: 0.5,
            mixBlendMode: 'screen',
            pointerEvents: 'none'
          }} />

          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
              <span style={{ 
                font: '600 11px/1 var(--sans)', 
                letterSpacing: '.18em', 
                textTransform: 'uppercase', 
                color: 'var(--lime)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <svg className="ico sm" style={{ color: 'var(--lime)' }}><use href="#i-guia"/></svg>
                Calculadora Psicométrica Clínica
              </span>
              <span style={{ font: '400 11px/1 var(--mono)', color: '#f7f1de8c' }}>
                Curva Normal Padrão (Média = 0, DP = 1)
              </span>
            </div>

            <h2 style={{ 
              margin: '14px 0 6px', 
              font: '800 clamp(22px, 2.5vw, 32px)/1.15 var(--sans)', 
              color: '#fff',
              letterSpacing: '-.025em' 
            }}>
              Conversor de Escore Z para <em>Classificação & Laudo</em>
            </h2>
            <p style={{ margin: '0 0 24px', color: '#f7f1debf', fontSize: '14.5px', maxWidth: '64ch' }}>
              Insira o valor Z apurado no manual psicométrico para obter imediatamente o estrato descritivo, faixa percentilar e sugestão de redação para inserção direta no laudo.
            </p>

            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', 
              gap: '16px',
              alignItems: 'stretch'
            }}>
              {/* Input Z */}
              <div style={{ 
                background: 'rgba(247,241,222,0.06)', 
                border: '1px solid rgba(247,241,222,0.18)', 
                borderRadius: '16px', 
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center'
              }}>
                <label style={{ font: '500 11px/1 var(--mono)', letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--lime)', marginBottom: '8px' }}>
                  Escore Z Apurado
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ font: '700 24px/1 var(--mono)', color: 'var(--lime)' }}>Z =</span>
                  <input 
                    type="number" 
                    step="0.1" 
                    value={calcScore} 
                    onChange={(e) => setCalcScore(e.target.value)}
                    style={{
                      background: 'transparent',
                      border: '0',
                      borderBottom: '2px solid var(--lime)',
                      color: '#fff',
                      font: '700 28px/1 var(--mono)',
                      width: '120px',
                      outline: 'none',
                      padding: '4px 0'
                    }}
                  />
                </div>
              </div>

              {/* Classificação Psicométrica */}
              <div style={{ 
                background: 'rgba(247,241,222,0.06)', 
                border: '1px solid rgba(247,241,222,0.18)', 
                borderRadius: '16px', 
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center'
              }}>
                <span style={{ font: '500 11px/1 var(--mono)', letterSpacing: '.1em', textTransform: 'uppercase', color: '#f7f1de8c' }}>
                  Estrato Padronizado
                </span>
                <b style={{ font: '700 18px/1.3 var(--sans)', color: 'var(--lime)', marginTop: '6px' }}>
                  {zInfo.label}
                </b>
                <span style={{ font: '400 12px/1.3 var(--mono)', color: '#f7f1deb3', marginTop: '4px' }}>
                  {zInfo.desc}
                </span>
              </div>

              {/* Redação Pronta para o Laudo */}
              <div style={{ 
                background: 'rgba(247,241,222,0.06)', 
                border: '1px solid rgba(247,241,222,0.18)', 
                borderRadius: '16px', 
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center'
              }}>
                <span style={{ font: '500 11px/1 var(--mono)', letterSpacing: '.1em', textTransform: 'uppercase', color: '#f7f1de8c' }}>
                  Redação Sugerida para Laudo
                </span>
                <p style={{ 
                  margin: '6px 0 0', 
                  font: '400 italic 12.5px/1.4 var(--serif)', 
                  color: '#f7f1de' 
                }}>
                  &ldquo;...revelou {zInfo.redact} (Z = {calcScore}).&rdquo;
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tabelas Normativas de Referência Rápida */}
      <section style={{ marginTop: '44px' }}>
        <div className="sec-rule">
          <span className="roman">I</span>
          <span className="t">Tabelas de Pontos de Corte Oficiais no Brasil</span>
        </div>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', 
          gap: '20px', 
          marginTop: '16px' 
        }}>
          {/* Tabela 1: MEEM Brucki */}
          <div style={{ 
            background: 'var(--bone)', 
            borderRadius: '20px', 
            padding: '22px', 
            boxShadow: 'var(--shadow)',
            border: '1px solid var(--line-soft)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span className="ctag c-guia">
                <svg className="ico sm"><use href="#i-guia"/></svg>
                MEEM · Brucki et al. (2003)
              </span>
              <span style={{ font: '400 11px/1 var(--mono)', color: 'var(--ink-faint)' }}>Cognição Global</span>
            </div>
            <h3 style={{ font: '700 17px/1.2 var(--sans)', margin: '4px 0 8px' }}>
              Pontos de Corte por Escolaridade Formal
            </h3>
            <p style={{ margin: '0 0 16px', font: '400 13px/1.4 var(--body)', color: 'var(--ink-mute)' }}>
              Normatização brasileira adaptada às disparidades de escolarização. Abaixo do corte sugere rastreio neuropsicológico detalhado.
            </p>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', font: '400 13px/1.4 var(--sans)', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--line)', font: '600 11px/1 var(--mono)', color: 'var(--ink-faint)' }}>
                    <th style={{ padding: '8px 4px' }}>ESCOLARIDADE</th>
                    <th style={{ padding: '8px 4px' }}>CORTE</th>
                    <th style={{ padding: '8px 4px' }}>MÉDIA (DP)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: '1px solid var(--line-soft)' }}>
                    <td style={{ padding: '10px 4px', fontWeight: 600 }}>Analfabetos</td>
                    <td style={{ padding: '10px 4px', color: '#a31b1b', fontFamily: 'var(--mono)', fontWeight: 700 }}>&lt; 20 pts</td>
                    <td style={{ padding: '10px 4px', color: 'var(--ink-mute)' }}>20.3 (DP 2.3)</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid var(--line-soft)' }}>
                    <td style={{ padding: '10px 4px', fontWeight: 600 }}>1 a 4 anos</td>
                    <td style={{ padding: '10px 4px', color: '#b27a00', fontFamily: 'var(--mono)', fontWeight: 700 }}>&lt; 25 pts</td>
                    <td style={{ padding: '10px 4px', color: 'var(--ink-mute)' }}>25.1 (DP 2.8)</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid var(--line-soft)' }}>
                    <td style={{ padding: '10px 4px', fontWeight: 600 }}>5 a 8 anos</td>
                    <td style={{ padding: '10px 4px', color: 'var(--accent-strong)', fontFamily: 'var(--mono)', fontWeight: 700 }}>&lt; 26.5 pts</td>
                    <td style={{ padding: '10px 4px', color: 'var(--ink-mute)' }}>26.8 (DP 2.3)</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '10px 4px', fontWeight: 600 }}>&ge; 9 anos</td>
                    <td style={{ padding: '10px 4px', color: 'var(--accent-strong)', fontFamily: 'var(--mono)', fontWeight: 700 }}>&lt; 28 pts</td>
                    <td style={{ padding: '10px 4px', color: 'var(--ink-mute)' }}>28.5 (DP 1.8)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Tabela 2: MoCA Nasreddine */}
          <div style={{ 
            background: 'var(--bone)', 
            borderRadius: '20px', 
            padding: '22px', 
            boxShadow: 'var(--shadow)',
            border: '1px solid var(--line-soft)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span className="ctag c-guia">
                <svg className="ico sm"><use href="#i-guia"/></svg>
                MoCA · Nasreddine et al.
              </span>
              <span style={{ font: '400 11px/1 var(--mono)', color: 'var(--ink-faint)' }}>Rastreio Executivo</span>
            </div>
            <h3 style={{ font: '700 17px/1.2 var(--sans)', margin: '4px 0 8px' }}>
              Pontos de Corte para CCL e Síndrome Demencial
            </h3>
            <p style={{ margin: '0 0 16px', font: '400 13px/1.4 var(--body)', color: 'var(--ink-mute)' }}>
              Acrescentar +1 ponto para indivíduos com &le; 12 anos de estudo. Máximo de 30 pontos.
            </p>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', font: '400 13px/1.4 var(--sans)', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--line)', font: '600 11px/1 var(--mono)', color: 'var(--ink-faint)' }}>
                    <th style={{ padding: '8px 4px' }}>CONDIÇÃO CLÍNICA</th>
                    <th style={{ padding: '8px 4px' }}>ESCORE TOTAL</th>
                    <th style={{ padding: '8px 4px' }}>SENSIB. / ESPEC.</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: '1px solid var(--line-soft)' }}>
                    <td style={{ padding: '10px 4px', fontWeight: 600 }}>Controle Saudável</td>
                    <td style={{ padding: '10px 4px', color: 'var(--accent-strong)', fontFamily: 'var(--mono)', fontWeight: 700 }}>&ge; 26 pts</td>
                    <td style={{ padding: '10px 4px', color: 'var(--ink-mute)' }}>Padrão Normal</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid var(--line-soft)' }}>
                    <td style={{ padding: '10px 4px', fontWeight: 600 }}>Comprometimento Cognitivo Leve</td>
                    <td style={{ padding: '10px 4px', color: '#b27a00', fontFamily: 'var(--mono)', fontWeight: 700 }}>&lt; 25 / 26 pts</td>
                    <td style={{ padding: '10px 4px', color: 'var(--ink-mute)' }}>S: 90% | E: 87%</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '10px 4px', fontWeight: 600 }}>Demência Leve (DA)</td>
                    <td style={{ padding: '10px 4px', color: '#a31b1b', fontFamily: 'var(--mono)', fontWeight: 700 }}>&lt; 18 / 20 pts</td>
                    <td style={{ padding: '10px 4px', color: 'var(--ink-mute)' }}>S: 100% | E: 87%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* Lista de Guias Práticos Cadastrados */}
      <section style={{ marginTop: '48px' }}>
        <div className="sec-rule">
          <span className="roman">II</span>
          <span className="t">Guias de Aplicação e Correção para Download</span>
          <Link href="/biblioteca?tipo=guia_rapido">Ver no acervo →</Link>
        </div>

        {quickGuides.length > 0 ? (
          <div className="grid" style={{ marginTop: '16px' }}>
            {quickGuides.map(mat => (
              <article 
                key={mat.id} 
                className="mat"
                onClick={() => setActiveMaterial(mat)}
              >
                <div className="mat-top">
                  <span className="ctag c-guia">
                    <svg className="ico sm"><use href="#i-guia"/></svg>
                    <span>Guia Rápido</span>
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
                    Consultar guia
                    <span><svg className="ico sm"><use href="#i-arrow"/></svg></span>
                  </span>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <div className="ring">
              <svg className="ico" style={{ width: 26, height: 26 }}><use href="#i-guia"/></svg>
            </div>
            <h3>Nenhum guia de aplicação cadastrado ainda</h3>
            <p>
              Os manuais de cabeceira e fluxogramas práticos de administração de testes serão disponibilizados aqui assim que indexados ao acervo.
            </p>
            <Link href="/biblioteca" className="btn" style={{ marginTop: '12px' }}>
              Ver Todos os Materiais
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
              <span>Guia Rápido de Aplicação</span>
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
                <div className="mark bg-guia">
                  <svg className="ico"><use href="#i-guia"/></svg>
                </div>
              </div>

              <h2>{activeMaterial.title}</h2>
              {activeMaterial.subtitle && <p className="lead">{activeMaterial.subtitle}</p>}

              <dl className="dl">
                {activeMaterial.authorReference && (
                  <>
                    <dt>Autor / Ref.</dt>
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
                onClick={() => alert(`Iniciando download do guia "${activeMaterial.title}" (${activeMaterial.downloadFormat}).`)}
              >
                Baixar guia
                <span><svg className="ico sm"><use href="#i-arrow"/></svg></span>
              </button>
            </div>
          </>
        )}
      </aside>
    </PlatformShell>
  );
}
