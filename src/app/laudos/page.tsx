'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useNeuro } from '@/context/NeuroContext';
import { PlatformShell } from '@/components/layout/PlatformShell';
import { MaterialItem } from '@/types/neuro';

interface ClauseItem {
  id: string;
  title: string;
  tag: string;
  text: string;
  note: string;
}

const STANDARD_CLAUSES: ClauseItem[] = [
  {
    id: 'clause-cfp',
    title: 'Cláusula de Validade e Sigilo Profissional',
    tag: 'Resolução CFP 06/2019',
    text: 'O presente Laudo Neuropsicológico tem caráter estritamente confidencial, devendo ser manuseado apenas por profissionais diretamente envolvidos no acompanhamento do paciente. Conforme a Resolução CFP nº 06/2019, os dados aqui apresentados refletem o estado cognitivo e funcional apurado no período da avaliação, tendo validade estimada de até 2 (dois) anos, salvo intercorrências clínicas agudas ou intervenções substanciais.',
    note: 'Inserir ao final da seção de Conclusão / Encaminhamentos.'
  },
  {
    id: 'clause-limites',
    title: 'Cláusula de Limitações Metodológicas da Testagem',
    tag: 'Rigor Metodológico',
    text: 'Os instrumentos psicométricos utilizados possuem amostras normativas padronizadas para a população brasileira. Não obstante, o desempenho em ambiente estruturado de consultório pode diferir do funcionamento cognitivo sob estressores e rotinas da vida real (validade ecológica). Por conseguinte, as inferências quantitativas foram sistematicamente integradas ao histórico clínico, relato de informantes e observações comportamentais.',
    note: 'Inserir na seção de Análise dos Resultados antes da conclusão diagnóstica.'
  },
  {
    id: 'clause-encaminhamento',
    title: 'Cláusula de Conclusão e Conduta Multidisciplinar',
    tag: 'Direcionamento Terapêutico',
    text: 'Diante do perfil neuropsicológico delineado, sugere-se: 1) Encaminhamento ao Médico Especialista (Neurologista/Psiquiatra) para correlação clínica e eventual conduta terapêutica; 2) Início de intervenção de Reabilitação Neuropsicológica e Treino Metacognitivo focado nas funções com menor eficiência; 3) Reavaliação neuropsicológica evolutiva no intervalo de 12 a 18 meses para monitoramento da curva adaptativa.',
    note: 'Modelo padronizado de encaminhamento escalonado.'
  }
];

export default function LaudosPage() {
  const { materials, favorites, toggleFavorite } = useNeuro();

  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [activeMaterial, setActiveMaterial] = useState<MaterialItem | null>(null);

  const handleCopyClause = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const reportMaterials = useMemo(() => {
    return materials.filter(m => m.type === 'modelo_laudo').filter(m => {
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
      activePage="laudos"
      searchValue={search}
      onSearchChange={setSearch}
      searchPlaceholder="Buscar modelos de laudo e templates..."
    >
      <header className="lib-head">
        <div>
          <span className="label">Padronização Clínica</span>
          <h1>Modelos de <em>Laudo</em><span className="dot">.</span></h1>
          <p>
            Templates editáveis (DOCX) e cláusulas técnicas em estrita consonância com a Resolução CFP nº 06/2019 e os preceitos de validade ecológica.
          </p>
        </div>
      </header>

      {/* Cláusulas Padronizadas com Cópia com 1 Clique */}
      <section style={{ marginTop: '28px' }}>
        <div className="sec-rule">
          <span className="roman">I</span>
          <span className="t">Cláusulas e Textos-Padrão para Inserção Direta</span>
          <span style={{ font: '400 11px/1 var(--mono)', color: 'var(--ink-faint)' }}>Clique para copiar</span>
        </div>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(310px, 1fr))', 
          gap: '16px', 
          marginTop: '16px' 
        }}>
          {STANDARD_CLAUSES.map(clause => {
            const isCopied = copiedId === clause.id;
            return (
              <div 
                key={clause.id}
                style={{
                  background: 'var(--bone)',
                  borderRadius: '20px',
                  padding: '20px',
                  boxShadow: 'var(--shadow)',
                  border: isCopied ? '1px solid var(--accent-strong)' : '1px solid var(--line-soft)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  transition: 'border-color .2s'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ 
                      font: '600 10px/1 var(--sans)', 
                      letterSpacing: '.14em', 
                      textTransform: 'uppercase', 
                      color: 'var(--accent-strong)' 
                    }}>
                      {clause.tag}
                    </span>
                    {isCopied && (
                      <span style={{ 
                        font: '600 10.5px/1 var(--mono)', 
                        color: 'var(--accent-strong)',
                        background: 'var(--lime)',
                        padding: '3px 8px',
                        borderRadius: '999px'
                      }}>
                        Copiado! ✓
                      </span>
                    )}
                  </div>

                  <h3 style={{ font: '700 16px/1.25 var(--sans)', margin: '0 0 10px', color: 'var(--ink)' }}>
                    {clause.title}
                  </h3>

                  <p style={{ 
                    margin: '0', 
                    font: '400 italic 13px/1.55 var(--serif)', 
                    color: 'var(--ink-soft)',
                    background: 'var(--paper)',
                    padding: '12px 14px',
                    borderRadius: '12px',
                    border: '1px solid var(--line-soft)'
                  }}>
                    &ldquo;{clause.text}&rdquo;
                  </p>
                </div>

                <div style={{ 
                  marginTop: '16px', 
                  paddingTop: '12px', 
                  borderTop: '1px dashed var(--line)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between' 
                }}>
                  <span style={{ font: '400 11px/1 var(--mono)', color: 'var(--ink-faint)' }}>
                    {clause.note}
                  </span>
                  <button 
                    type="button" 
                    onClick={() => handleCopyClause(clause.id, clause.text)}
                    className="btn"
                    style={{ 
                      padding: '7px 12px', 
                      fontSize: '12px',
                      background: isCopied ? 'var(--accent-strong)' : 'var(--ink)'
                    }}
                  >
                    {isCopied ? 'Texto Copiado' : 'Copiar Texto'}
                    <span style={{ width: '20px', height: '20px' }}>
                      <svg className="ico sm"><use href="#i-laudo"/></svg>
                    </span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Estrutura Canônica do Laudo CFP 06/2019 */}
      <section style={{ marginTop: '44px' }}>
        <div className="sec-rule">
          <span className="roman">II</span>
          <span className="t">Estrutura Obrigatória do Documento Escrito (CFP)</span>
        </div>

        <div style={{ 
          background: 'var(--bone)', 
          borderRadius: '20px', 
          padding: '24px', 
          marginTop: '16px',
          boxShadow: 'var(--shadow)',
          border: '1px solid var(--line-soft)'
        }}>
          <ol style={{ 
            margin: 0, 
            padding: 0, 
            listStyle: 'none',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '18px'
          }}>
            <li style={{ borderLeft: '2px solid var(--accent-strong)', paddingLeft: '14px' }}>
              <b style={{ font: '700 14px/1.2 var(--sans)', color: 'var(--ink)' }}>1. Identificação</b>
              <p style={{ margin: '4px 0 0', font: '400 12.5px/1.4 var(--body)', color: 'var(--ink-mute)' }}>
                Dados do paciente, responsável legal (se houver), solicitante e neuropsicólogo responsável com registro no CRP.
              </p>
            </li>
            <li style={{ borderLeft: '2px solid var(--accent-strong)', paddingLeft: '14px' }}>
              <b style={{ font: '700 14px/1.2 var(--sans)', color: 'var(--ink)' }}>2. Descrição da Demanda</b>
              <p style={{ margin: '4px 0 0', font: '400 12.5px/1.4 var(--body)', color: 'var(--ink-mute)' }}>
                Motivo do encaminhamento, queixas clínicas, hipóteses diagnósticas iniciais e objetivos da avaliação.
              </p>
            </li>
            <li style={{ borderLeft: '2px solid var(--accent-strong)', paddingLeft: '14px' }}>
              <b style={{ font: '700 14px/1.2 var(--sans)', color: 'var(--ink)' }}>3. Procedimentos</b>
              <p style={{ margin: '4px 0 0', font: '400 12.5px/1.4 var(--body)', color: 'var(--ink-mute)' }}>
                Número e duração das sessões, instrumentos psicométricos aplicados com parecer favorável do SATEPSI e informantes.
              </p>
            </li>
            <li style={{ borderLeft: '2px solid var(--accent-strong)', paddingLeft: '14px' }}>
              <b style={{ font: '700 14px/1.2 var(--sans)', color: 'var(--ink)' }}>4. Análise dos Resultados</b>
              <p style={{ margin: '4px 0 0', font: '400 12.5px/1.4 var(--body)', color: 'var(--ink-mute)' }}>
                Integração qualitativa e quantitativa por domínio (Atenção, Memória, Funções Executivas, Afetividade).
              </p>
            </li>
            <li style={{ borderLeft: '2px solid var(--accent-strong)', paddingLeft: '14px' }}>
              <b style={{ font: '700 14px/1.2 var(--sans)', color: 'var(--ink)' }}>5. Conclusão Diagnóstica</b>
              <p style={{ margin: '4px 0 0', font: '400 12.5px/1.4 var(--body)', color: 'var(--ink-mute)' }}>
                Síntese do funcionamento, correlação com critérios do DSM-5-TR / CID-11 e hipóteses sustentadas.
              </p>
            </li>
            <li style={{ borderLeft: '2px solid var(--accent-strong)', paddingLeft: '14px' }}>
              <b style={{ font: '700 14px/1.2 var(--sans)', color: 'var(--ink)' }}>6. Recomendações e Sigilo</b>
              <p style={{ margin: '4px 0 0', font: '400 12.5px/1.4 var(--body)', color: 'var(--ink-mute)' }}>
                Encaminhamentos terapêuticos individualizados, data, assinatura com carimbo CRP e prazo de validade.
              </p>
            </li>
          </ol>
        </div>
      </section>

      {/* Modelos de Laudo Cadastrados */}
      <section style={{ marginTop: '48px' }}>
        <div className="sec-rule">
          <span className="roman">III</span>
          <span className="t">Modelos de Laudo Editáveis em DOCX</span>
          <Link href="/biblioteca?tipo=modelo_laudo">Ver no acervo →</Link>
        </div>

        {reportMaterials.length > 0 ? (
          <div className="grid" style={{ marginTop: '16px' }}>
            {reportMaterials.map(mat => (
              <article 
                key={mat.id} 
                className="mat"
                onClick={() => setActiveMaterial(mat)}
              >
                <div className="mat-top">
                  <span className="ctag c-laudo">
                    <svg className="ico sm"><use href="#i-laudo"/></svg>
                    <span>Modelo de Laudo</span>
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
                    Ver modelo
                    <span><svg className="ico sm"><use href="#i-arrow"/></svg></span>
                  </span>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <div className="ring">
              <svg className="ico" style={{ width: 26, height: 26 }}><use href="#i-laudo"/></svg>
            </div>
            <h3>Nenhum modelo de laudo cadastrado ainda</h3>
            <p>
              Os templates editáveis em Word estruturados por transtorno (TDAH, TEA, Declínio Cognitivo, Dificuldades de Aprendizagem) serão listados aqui.
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
              <span>Modelo de Laudo Editável</span>
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
                <div className="mark bg-laudo">
                  <svg className="ico"><use href="#i-laudo"/></svg>
                </div>
              </div>

              <h2>{activeMaterial.title}</h2>
              {activeMaterial.subtitle && <p className="lead">{activeMaterial.subtitle}</p>}

              <dl className="dl">
                {activeMaterial.downloadFormat && (
                  <>
                    <dt>Formato</dt>
                    <dd>{activeMaterial.downloadFormat} (Editável)</dd>
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
                    <dt>Estruturação</dt>
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
                onClick={() => alert(`Iniciando download do modelo "${activeMaterial.title}" (${activeMaterial.downloadFormat}).`)}
              >
                Baixar modelo ({activeMaterial.downloadFormat})
                <span><svg className="ico sm"><use href="#i-arrow"/></svg></span>
              </button>
            </div>
          </>
        )}
      </aside>
    </PlatformShell>
  );
}
