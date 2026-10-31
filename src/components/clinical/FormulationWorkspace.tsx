'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Formulation,
  FormulationVersion,
  FormulationPatternItem,
  FormulationGoalItem
} from '@/types/clinicalSession';
import './formulation.css';

interface FormulationWorkspaceProps {
  patientId: string;
  patientCode?: string;
}

type AutosaveState = 'idle' | 'saving' | 'saved' | 'error';

export function FormulationWorkspace({
  patientId,
  patientCode = 'Paciente'
}: FormulationWorkspaceProps) {
  const [formulation, setFormulation] = useState<Formulation | null>(null);
  const [versions, setVersions] = useState<FormulationVersion[]>([]);
  const [modoCompartilhado, setModoCompartilhado] = useState<boolean>(false);
  const [autosaveStatus, setAutosaveStatus] = useState<AutosaveState>('idle');
  const [lastSavedTime, setLastSavedTime] = useState<string>('');
  const [selectedVersionForCompare, setSelectedVersionForCompare] = useState<FormulationVersion | null>(null);
  const [showHistoryModal, setShowHistoryModal] = useState<boolean>(false);

  // Campos guiados da Hipótese Funcional
  const [hypoAntecedent, setHypoAntecedent] = useState<string>('');
  const [hypoResponse, setHypoResponse] = useState<string>('');
  const [hypoConsequence, setHypoConsequence] = useState<string>('');

  const debounceTimer = useRef<any>(null);

  // 1. Carrega rascunho de trabalho e histórico de versões
  const carregarDados = useCallback(async () => {
    if (!patientId) return;
    try {
      const [resForm, resVers] = await Promise.all([
        fetch(`/api/patients/${patientId}/formulation`),
        fetch(`/api/patients/${patientId}/formulation/versions`)
      ]);

      if (resForm.ok) {
        const json = await resForm.json();
        if (json.data) {
          setFormulation(json.data);
          // Tenta extrair partes da hipótese se estiver no padrão
          const h = json.data.functional_hypothesis || '';
          const match = h.match(/Quando (.*?), eu (.*?), e isso traz (.*?) — e por isso esse comportamento se mantém\./);
          if (match) {
            setHypoAntecedent(match[1]);
            setHypoResponse(match[2]);
            setHypoConsequence(match[3]);
          }
        }
      }

      if (resVers.ok) {
        const jsonV = await resVers.json();
        if (jsonV.data) setVersions(jsonV.data);
      }
    } catch (err) {
      console.warn('Erro ao carregar formulação:', err);
    }
  }, [patientId]);

  useEffect(() => {
    carregarDados();
  }, [carregarDados]);

  // Atalho de teclado para Modo Compartilhado
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === 's') {
        e.preventDefault();
        setModoCompartilhado((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // 2. Autosave com debounce de 800ms
  const triggerAutosave = (updated: Partial<Formulation>) => {
    setAutosaveStatus('saving');
    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    debounceTimer.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/patients/${patientId}/formulation`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updated)
        });

        if (res.ok) {
          const now = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
          setLastSavedTime(now);
          setAutosaveStatus('saved');
        } else {
          setAutosaveStatus('error');
        }
      } catch {
        setAutosaveStatus('error');
      }
    }, 800);
  };

  const handleFieldChange = (field: keyof Formulation, value: any) => {
    if (!formulation) return;
    const updated = { ...formulation, [field]: value };
    setFormulation(updated);
    triggerAutosave({ [field]: value });
  };

  // 3. Monta e atualiza a Hipótese Funcional a partir dos campos guiados
  const handleHypothesisPieceChange = (
    ant: string,
    resp: string,
    cons: string
  ) => {
    setHypoAntecedent(ant);
    setHypoResponse(resp);
    setHypoConsequence(cons);

    const fullPhrase = `Quando ${ant || '[situação/antecedente]'}, eu ${resp || '[ação/resposta]'}, e isso traz ${cons || '[consequência imediata]'} — e por isso esse comportamento se mantém.`;
    handleFieldChange('functional_hypothesis', fullPhrase);
  };

  // 4. Fechar e congelar versão (Seção 5.2)
  const handleCloseVersion = async () => {
    if (!formulation) return;
    if (
      !window.confirm(
        'Deseja fechar esta versão da formulação? Ela será congelada como uma versão imutável com número sequencial e data, mantendo a versão de trabalho ativa para novas edições.'
      )
    ) {
      return;
    }

    try {
      const res = await fetch(`/api/patients/${patientId}/formulation/close-version`, {
        method: 'POST'
      });
      if (res.ok) {
        const json = await res.json();
        alert(`✓ Versão ${json.data.version_number} fechada e congelada com sucesso!`);
        carregarDados();
      } else {
        alert('Não foi possível fechar a versão.');
      }
    } catch {
      alert('Erro de conexão ao fechar versão.');
    }
  };

  // 5. Adicionar / Gerenciar Padrões Recorrentes
  const handleAddPattern = () => {
    if (!formulation) return;
    const newPattern: FormulationPatternItem = {
      id: 'pat_' + Date.now(),
      title: 'Novo padrão identificado',
      description: '',
      triple_row_ids: []
    };
    const updated = [...(formulation.patterns || []), newPattern];
    handleFieldChange('patterns', updated);
  };

  const handleUpdatePattern = (id: string, updates: Partial<FormulationPatternItem>) => {
    if (!formulation) return;
    const updated = (formulation.patterns || []).map((p) =>
      p.id === id ? { ...p, ...updates } : p
    );
    handleFieldChange('patterns', updated);
  };

  const handleRemovePattern = (id: string) => {
    if (!formulation) return;
    const updated = (formulation.patterns || []).map((p) => p).filter((p) => p.id !== id);
    handleFieldChange('patterns', updated);
  };

  // 6. Adicionar / Gerenciar Objetivos com Status
  const handleAddGoal = () => {
    if (!formulation) return;
    const newGoal: FormulationGoalItem = {
      id: 'goal_' + Date.now(),
      text: 'Novo objetivo terapêutico',
      status: 'ativo',
      status_date: new Date().toISOString().slice(0, 10)
    };
    const updated = [...(formulation.goals || []), newGoal];
    handleFieldChange('goals', updated);
  };

  const handleUpdateGoalStatus = (
    id: string,
    status: 'ativo' | 'alcançado' | 'abandonado'
  ) => {
    if (!formulation) return;
    const updated = (formulation.goals || []).map((g) =>
      g.id === id ? { ...g, status, status_date: new Date().toISOString().slice(0, 10) } : g
    );
    handleFieldChange('goals', updated);
  };

  const handleRemoveGoal = (id: string) => {
    if (!formulation) return;
    const updated = (formulation.goals || []).filter((g) => g.id !== id);
    handleFieldChange('goals', updated);
  };

  // 7. Adicionar / Gerenciar O que vamos testar
  const handleAddNextTest = () => {
    if (!formulation) return;
    const updated = [...(formulation.next_tests || []), ''];
    handleFieldChange('next_tests', updated);
  };

  const handleUpdateNextTest = (index: number, text: string) => {
    if (!formulation) return;
    const updated = [...(formulation.next_tests || [])];
    updated[index] = text;
    handleFieldChange('next_tests', updated);
  };

  const handleRemoveNextTest = (index: number) => {
    if (!formulation) return;
    const updated = (formulation.next_tests || []).filter((_, idx) => idx !== index);
    handleFieldChange('next_tests', updated);
  };

  if (!formulation) {
    return (
      <div style={{ padding: '32px', textAlign: 'center', color: '#64748b' }}>
        Carregando Formulação Comportamental…
      </div>
    );
  }

  const ultimaEdicao = formulation.updated_at
    ? new Date(formulation.updated_at).toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    : 'recente';

  return (
    <section
      className={`formulation-container ${modoCompartilhado ? 'modo-compartilhado' : ''}`}
      aria-label="Grade de Formulação Comportamental"
    >
      {/* Cabeçalho de Versão e Ações */}
      <header className="formulation-header">
        <div className="formulation-title-area">
          <h2 className="formulation-title">
            <span>🧩 Formulação Comportamental</span>
            {modoCompartilhado && <span style={{ fontSize: '13px', color: '#65a30d' }}>(Modo Compartilhado)</span>}
          </h2>
          <span className="formulation-version-badge">
            Versão de trabalho · última edição em <b>{ultimaEdicao}</b> · baseada na versão{' '}
            <b>{formulation.base_version_number || 'inicial'}</b>
          </span>
        </div>

        <div className="formulation-actions">
          {/* Indicador Discreto de Autosave */}
          <div className={`triplice-autosave-status ${autosaveStatus}`}>
            {autosaveStatus === 'saving' && '● Salvando…'}
            {autosaveStatus === 'saved' && `✓ Salvo às ${lastSavedTime || 'recente'}`}
            {autosaveStatus === 'error' && '⚠ Erro ao salvar'}
            {autosaveStatus === 'idle' && '● Rascunho vivo'}
          </div>

          {/* Alternador de Modo Compartilhado */}
          <button
            type="button"
            className={`btn-toggle-shared ${modoCompartilhado ? 'active' : ''}`}
            onClick={() => setModoCompartilhado((prev) => !prev)}
            title="Trocar para visão com linguagem simples para compartilhar tela com o paciente"
          >
            <span>{modoCompartilhado ? '👁 Visão do Paciente' : '👥 Compartilhar Tela'}</span>
            <kbd>⇧S</kbd>
          </button>

          {/* Histórico e Fechar Versão (Ocultos no modo compartilhado) */}
          {!modoCompartilhado && (
            <>
              {versions.length > 0 && (
                <button
                  type="button"
                  className="btn-close-version"
                  onClick={() => setShowHistoryModal((prev) => !prev)}
                  title="Ver histórico e comparar versões anteriores"
                >
                  📜 Histórico ({versions.length})
                </button>
              )}

              <button
                type="button"
                className="btn-close-version"
                onClick={handleCloseVersion}
                style={{ background: '#0f172a', color: '#ffffff', borderColor: '#0f172a' }}
                title="Congela um retrato completo desta versão em formulation_versions"
              >
                🔒 Fechar versão
              </button>
            </>
          )}
        </div>
      </header>

      {/* Grade Principal de Campos da Formulação */}
      <div className="formulation-grid">
        {/* 1. Demanda Trazida */}
        <div className="formulation-section-card">
          <h3 className="formulation-section-title">
            {modoCompartilhado ? 'O que você quer mudar' : 'Demanda Trazida'}
          </h3>
          <span className="formulation-section-sub">
            {modoCompartilhado
              ? 'Nas suas próprias palavras, o objetivo principal do atendimento.'
              : 'Demanda inicial e queixas clínicas trazidas pelo paciente.'}
          </span>
          <textarea
            className="triplice-textarea"
            rows={3}
            placeholder="Ex.: Gostaria de parar de travar e fugir de apresentações no trabalho…"
            value={formulation.demand || ''}
            onChange={(e) => handleFieldChange('demand', e.target.value)}
          />
        </div>

        {/* 2. Contexto de Vida Atual */}
        <div className="formulation-section-card">
          <h3 className="formulation-section-title">
            {modoCompartilhado ? 'Seu momento de vida atual' : 'Contexto de Vida Atual'}
          </h3>
          <span className="formulation-section-sub">
            Trabalho, rotina, relacionamentos e contingências ambientais ativas.
          </span>
          <textarea
            className="triplice-textarea"
            rows={3}
            placeholder="Ex.: Mudança recente de cargo, sobrecarga de tarefas, cobrança da diretoria…"
            value={formulation.life_context || ''}
            onChange={(e) => handleFieldChange('life_context', e.target.value)}
          />
        </div>

        {/* 3. Histórico Relevante */}
        <div className="formulation-section-card">
          <h3 className="formulation-section-title">
            {modoCompartilhado ? 'Experiências anteriores importantes' : 'Histórico Relevante'}
          </h3>
          <span className="formulation-section-sub">
            História de aprendizagem e primeiros episódios semelhantes.
          </span>
          <textarea
            className="triplice-textarea"
            rows={3}
            placeholder="Ex.: Cobrança familiar intensa na adolescência por notas e perfeccionismo…"
            value={formulation.history_notes || ''}
            onChange={(e) => handleFieldChange('history_notes', e.target.value)}
          />
        </div>

        {/* 4. Hipótese Funcional com Máscara-Guia (AC - Seção 5.1) */}
        <div className="formulation-section-card">
          <h3 className="formulation-section-title">
            {modoCompartilhado ? 'Como esse padrão funciona' : 'Hipótese Funcional (AC)'}
          </h3>
          <span className="formulation-section-sub">
            Máscara-guia da Análise do Comportamento: Relação funcional entre estímulo, resposta e reforçamento.
          </span>

          <div className="hypothesis-box">
            <div className="hypothesis-guide-inputs">
              <div className="hypothesis-guide-col">
                <label>1. Quando [Antecedente]</label>
                <input
                  type="text"
                  className="anxiety-input"
                  style={{ minHeight: '38px', height: '38px', fontSize: '13px' }}
                  placeholder="Ex.: recebo cobranças ou prazos curtos"
                  value={hypoAntecedent}
                  onChange={(e) =>
                    handleHypothesisPieceChange(e.target.value, hypoResponse, hypoConsequence)
                  }
                />
              </div>

              <div className="hypothesis-guide-col">
                <label>2. Eu [Resposta/Ação]</label>
                <input
                  type="text"
                  className="anxiety-input"
                  style={{ minHeight: '38px', height: '38px', fontSize: '13px' }}
                  placeholder="Ex.: adio o início e fico no celular"
                  value={hypoResponse}
                  onChange={(e) =>
                    handleHypothesisPieceChange(hypoAntecedent, e.target.value, hypoConsequence)
                  }
                />
              </div>

              <div className="hypothesis-guide-col">
                <label>3. Isso me traz [Consequência]</label>
                <input
                  type="text"
                  className="anxiety-input"
                  style={{ minHeight: '38px', height: '38px', fontSize: '13px' }}
                  placeholder="Ex.: alívio imediato da tensão"
                  value={hypoConsequence}
                  onChange={(e) =>
                    handleHypothesisPieceChange(hypoAntecedent, hypoResponse, e.target.value)
                  }
                />
              </div>
            </div>

            <div className="hypothesis-full-phrase">
              💬 “{formulation.functional_hypothesis || 'Quando [antecedente], eu [resposta], e isso traz [consequência] — e por isso esse comportamento se mantém.'}”
            </div>
          </div>
        </div>

        {/* 5. Padrões que se Repetem (com link para a Tríplice) */}
        <div className="formulation-section-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 className="formulation-section-title">
              {modoCompartilhado ? 'Padrões que observamos juntos' : 'Padrões Recorrentes'}
            </h3>
            {!modoCompartilhado && (
              <button
                type="button"
                className="btn btn-sm btn-ghost"
                onClick={handleAddPattern}
              >
                + Adicionar padrão
              </button>
            )}
          </div>

          {(formulation.patterns || []).length === 0 ? (
            <p style={{ fontSize: '13px', color: '#64748b', margin: '4px 0' }}>
              Nenhum padrão cadastrado ainda. Conecte episódios da tríplice contingência aqui.
            </p>
          ) : (
            (formulation.patterns || []).map((pat) => (
              <div key={pat.id} className="pattern-item-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px' }}>
                  <input
                    type="text"
                    className="anxiety-input"
                    style={{ fontWeight: 700, fontSize: '14px', minHeight: '36px' }}
                    value={pat.title}
                    onChange={(e) => handleUpdatePattern(pat.id, { title: e.target.value })}
                  />
                  {!modoCompartilhado && (
                    <button
                      type="button"
                      className="row-action-btn delete"
                      onClick={() => handleRemovePattern(pat.id)}
                      title="Remover padrão"
                    >
                      ✕
                    </button>
                  )}
                </div>

                <textarea
                  className="triplice-textarea"
                  rows={2}
                  placeholder="Descrição da classe de respostas e função mantenedora…"
                  value={pat.description || ''}
                  onChange={(e) => handleUpdatePattern(pat.id, { description: e.target.value })}
                />

                {/* Vínculo com episódios da Tríplice */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '11px', color: '#64748b' }}>Episódios associados:</span>
                  <a
                    href={`/recursos-interativos/pacientes/evolucao?paciente=${encodeURIComponent(patientCode)}`}
                    className="pattern-triple-link"
                    title="Abrir sessão de origem deste episódio"
                  >
                    🔗 Abrir na Tríplice Contingência (1 clique)
                  </a>
                </div>
              </div>
            ))
          )}
        </div>

        {/* 6. Objetivos do Tratamento com Estado */}
        <div className="formulation-section-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 className="formulation-section-title">
              {modoCompartilhado ? 'Nossos Objetivos' : 'Objetivos do Tratamento'}
            </h3>
            {!modoCompartilhado && (
              <button
                type="button"
                className="btn btn-sm btn-ghost"
                onClick={handleAddGoal}
              >
                + Adicionar objetivo
              </button>
            )}
          </div>

          {(formulation.goals || []).length === 0 ? (
            <p style={{ fontSize: '13px', color: '#64748b', margin: '4px 0' }}>
              Nenhum objetivo cadastrado ainda.
            </p>
          ) : (
            (formulation.goals || []).map((goal) => (
              <div key={goal.id} className="goal-item-row">
                <input
                  type="text"
                  className="anxiety-input"
                  style={{ flex: 1, minHeight: '36px', height: '36px' }}
                  value={goal.text}
                  onChange={(e) => {
                    const text = e.target.value;
                    const updated = (formulation.goals || []).map((g) =>
                      g.id === goal.id ? { ...g, text } : g
                    );
                    handleFieldChange('goals', updated);
                  }}
                />

                {/* Seletor de Estado */}
                <select
                  value={goal.status}
                  onChange={(e) =>
                    handleUpdateGoalStatus(
                      goal.id,
                      e.target.value as 'ativo' | 'alcançado' | 'abandonado'
                    )
                  }
                  style={{
                    padding: '6px 10px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: 700,
                    border: '1px solid #cbd5e1'
                  }}
                >
                  <option value="ativo">Ativo</option>
                  <option value="alcançado">Alcançado</option>
                  <option value="abandonado">Abandonado</option>
                </select>

                <span className={`goal-status-badge ${goal.status}`}>
                  {goal.status}
                </span>

                {!modoCompartilhado && (
                  <button
                    type="button"
                    className="row-action-btn delete"
                    onClick={() => handleRemoveGoal(goal.id)}
                    title="Remover objetivo"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))
          )}
        </div>

        {/* 7. O que vamos testar nas próximas sessões */}
        <div className="formulation-section-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 className="formulation-section-title">
              {modoCompartilhado ? 'Próximos passos e testes práticos' : 'O Que Vamos Testar'}
            </h3>
            {!modoCompartilhado && (
              <button
                type="button"
                className="btn btn-sm btn-ghost"
                onClick={handleAddNextTest}
              >
                + Adicionar teste
              </button>
            )}
          </div>

          {(formulation.next_tests || []).length === 0 ? (
            <p style={{ fontSize: '13px', color: '#64748b', margin: '4px 0' }}>
              Nenhuma intervenção ou teste empírico listado para a próxima sessão.
            </p>
          ) : (
            (formulation.next_tests || []).map((test, idx) => (
              <div key={idx} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                <input
                  type="text"
                  className="anxiety-input"
                  style={{ minHeight: '36px', height: '36px' }}
                  placeholder="Ex.: Treinar exposição interoceptiva de 2 minutos antes do slide 1…"
                  value={test}
                  onChange={(e) => handleUpdateNextTest(idx, e.target.value)}
                />
                {!modoCompartilhado && (
                  <button
                    type="button"
                    className="row-action-btn delete"
                    onClick={() => handleRemoveNextTest(idx)}
                    title="Remover"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))
          )}
        </div>

        {/* 8. Observações Privadas do Profissional (NUNCA exibidas no modo compartilhado) */}
        {!modoCompartilhado && (
          <div
            className="formulation-section-card"
            style={{ background: '#fffbeb', borderColor: '#fde68a' }}
          >
            <h3 className="formulation-section-title" style={{ color: '#92400e' }}>
              🔒 Notas Privadas do Profissional (Sigiloso)
            </h3>
            <span className="formulation-section-sub" style={{ color: '#b45309' }}>
              Notas clínicas internas sobre esquemas de reforço e análises funcionais que nunca aparecem para o paciente.
            </span>
            <textarea
              className="triplice-textarea"
              style={{ background: '#ffffff', borderColor: '#fcd34d' }}
              rows={3}
              placeholder="Hipóteses e análises de manutenção sigilosas…"
              value={formulation.private_notes || ''}
              onChange={(e) => handleFieldChange('private_notes', e.target.value)}
            />
          </div>
        )}
      </div>

      {/* Painel / Modal de Histórico e Comparador de Versões Fechadas */}
      {showHistoryModal && (
        <div className="version-history-panel">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700 }}>
              📜 Histórico de Versões Congeladas da Formulação
            </h3>
            <button
              type="button"
              className="row-action-btn"
              onClick={() => setShowHistoryModal(false)}
            >
              ✕ Fechar
            </button>
          </div>

          <div className="version-tabs">
            {versions.map((ver) => (
              <button
                key={ver.id}
                type="button"
                className={`version-tab-btn ${selectedVersionForCompare?.id === ver.id ? 'active' : ''}`}
                onClick={() => setSelectedVersionForCompare(ver)}
              >
                Versão {ver.version_number} ({new Date(ver.closed_at).toLocaleDateString('pt-BR')})
              </button>
            ))}
          </div>

          {selectedVersionForCompare && (
            <div style={{ background: '#ffffff', padding: '14px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontWeight: 700 }}>
                  Comparando Versão de Trabalho com Versão {selectedVersionForCompare.version_number} (fechada em {new Date(selectedVersionForCompare.closed_at).toLocaleDateString('pt-BR')}):
                </span>
                <span style={{ fontSize: '11px', color: '#64748b' }}>(Campos alterados com destaque visual)</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', fontSize: '13px' }}>
                <div>
                  <b style={{ display: 'block', marginBottom: '4px', color: '#475569' }}>
                    Versão {selectedVersionForCompare.version_number} (Congelada / Somente Leitura)
                  </b>
                  <div style={{ background: '#f8fafc', padding: '8px', borderRadius: '6px' }}>
                    <p><b>Demanda:</b> {selectedVersionForCompare.snapshot.demand || '—'}</p>
                    <p><b>Hipótese:</b> {selectedVersionForCompare.snapshot.functional_hypothesis || '—'}</p>
                    <p><b>Contexto:</b> {selectedVersionForCompare.snapshot.life_context || '—'}</p>
                  </div>
                </div>

                <div>
                  <b style={{ display: 'block', marginBottom: '4px', color: '#166534' }}>
                    Versão de Trabalho Atual (Draft)
                  </b>
                  <div style={{ background: '#f0fdf4', padding: '8px', borderRadius: '6px' }}>
                    <p className={formulation.demand !== selectedVersionForCompare.snapshot.demand ? 'diff-field-highlight' : ''}>
                      <b>Demanda:</b> {formulation.demand || '—'}
                    </p>
                    <p className={formulation.functional_hypothesis !== selectedVersionForCompare.snapshot.functional_hypothesis ? 'diff-field-highlight' : ''}>
                      <b>Hipótese:</b> {formulation.functional_hypothesis || '—'}
                    </p>
                    <p className={formulation.life_context !== selectedVersionForCompare.snapshot.life_context ? 'diff-field-highlight' : ''}>
                      <b>Contexto:</b> {formulation.life_context || '—'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
