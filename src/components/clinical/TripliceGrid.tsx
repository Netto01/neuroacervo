'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { TripleRow } from '@/types/clinicalSession';
import './triplice-grid.css';

interface TripliceGridProps {
  patientId: string;
  sessionId: string;
  patientCode?: string;
  initialRows?: TripleRow[];
  onRowsUpdated?: (rows: TripleRow[]) => void;
  isPrintView?: boolean;
}

type AutosaveState = 'idle' | 'saving' | 'saved' | 'error';

function autoGrow(t: HTMLElement | null) {
  if (!t) return;
  t.style.height = 'auto';
  t.style.height = t.scrollHeight + 'px';
}

export function TripliceGrid({
  patientId,
  sessionId,
  patientCode = 'Paciente',
  initialRows = [],
  onRowsUpdated,
  isPrintView = false
}: TripliceGridProps) {
  const [rows, setRows] = useState<TripleRow[]>(initialRows);
  const [modoCompartilhado, setModoCompartilhado] = useState<boolean>(false);
  const [autosaveStatus, setAutosaveStatus] = useState<AutosaveState>('idle');
  const [lastSavedTime, setLastSavedTime] = useState<string>('');
  const [deletedUndoItem, setDeletedUndoItem] = useState<{ row: TripleRow; timeoutId: any } | null>(null);

  const debounceTimers = useRef<Record<string, any>>({});
  const lastCreatedInputRef = useRef<HTMLTextAreaElement | null>(null);
  const localCacheKey = `na_triplice_cache_${patientId}_${sessionId}`;

  // 1. Carrega dados da API ou do LocalStorage
  const carregarEpisodios = useCallback(async () => {
    if (!patientId || !sessionId) return;

    let backupRows: TripleRow[] = [];
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem(localCacheKey);
        if (cached) backupRows = JSON.parse(cached);
      } catch {}
    }

    try {
      const res = await fetch(`/api/patients/${patientId}/sessions/${sessionId}/triple-rows`);
      if (res.ok) {
        const json = await res.json();
        if (json.data && Array.isArray(json.data)) {
          const finalRows = json.data.length > 0 ? json.data : backupRows;
          setRows(finalRows);
          if (onRowsUpdated) onRowsUpdated(finalRows);
          return;
        }
      }
    } catch (err) {
      console.warn('Erro ao carregar triple_rows do servidor, utilizando cache local:', err);
    }

    if (backupRows.length > 0) {
      setRows(backupRows);
      if (onRowsUpdated) onRowsUpdated(backupRows);
    }
  }, [patientId, sessionId, localCacheKey, onRowsUpdated]);

  useEffect(() => {
    carregarEpisodios();
  }, [carregarEpisodios]);

  const salvarBackupLocal = useCallback(
    (currentRows: TripleRow[]) => {
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(localCacheKey, JSON.stringify(currentRows));
        } catch {}
      }
    },
    [localCacheKey]
  );

  // 2. Atalho de teclado para Modo Compartilhado (Cmd/Ctrl + Shift + S)
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

  // 2b. Auto-grow para todos os campos de texto dos episódios
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const runGrow = () => {
        const textareas = document.querySelectorAll<HTMLTextAreaElement>(
          '.ep-grid textarea, .priv textarea'
        );
        textareas.forEach((ta) => autoGrow(ta));
      };
      runGrow();
      if (document.fonts) {
        document.fonts.ready.then(runGrow);
      }
      window.addEventListener('resize', runGrow);
      return () => window.removeEventListener('resize', runGrow);
    }
  }, [rows]);

  // 3. Atualização de campo com Debounce (800ms)
  const handleFieldChange = (rowId: string, field: keyof TripleRow, value: string) => {
    const cleanValue = value.slice(0, 2000);

    setRows((prev) => {
      const updated = prev.map((r) => {
        if (r.id === rowId) {
          return { ...r, [field]: cleanValue, updated_at: new Date().toISOString() };
        }
        return r;
      });
      salvarBackupLocal(updated);
      if (onRowsUpdated) onRowsUpdated(updated);
      return updated;
    });

    setAutosaveStatus('saving');

    const timerKey = `${rowId}_${field}`;
    if (debounceTimers.current[timerKey]) {
      clearTimeout(debounceTimers.current[timerKey]);
    }

    debounceTimers.current[timerKey] = setTimeout(async () => {
      try {
        const res = await fetch(`/api/triple-rows/${rowId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ [field]: cleanValue })
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

  // 4. Salvar imediatamente ao perder o foco (blur)
  const handleFieldBlur = async (rowId: string, field: keyof TripleRow, value: string) => {
    const timerKey = `${rowId}_${field}`;
    if (debounceTimers.current[timerKey]) {
      clearTimeout(debounceTimers.current[timerKey]);
    }

    try {
      setAutosaveStatus('saving');
      const res = await fetch(`/api/triple-rows/${rowId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [field]: value.slice(0, 2000) })
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
  };

  // 5. Adicionar novo episódio (1 clique com foco automático no antecedente)
  const handleAddEpisode = async () => {
    const tempId = 'temp_' + Date.now();
    const newPosition = rows.length;

    const newEmptyRow: TripleRow = {
      id: tempId,
      session_id: sessionId,
      patient_id: patientId,
      professional_id: '',
      antecedent: '',
      response_action: '',
      response_thought: '',
      response_body: '',
      consequence: '',
      effect_short: '',
      effect_long: '',
      note: '',
      position: newPosition,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const updated = [...rows, newEmptyRow];
    setRows(updated);
    salvarBackupLocal(updated);

    setTimeout(() => {
      if (lastCreatedInputRef.current) {
        lastCreatedInputRef.current.focus();
        autoGrow(lastCreatedInputRef.current);
      }
    }, 50);

    try {
      setAutosaveStatus('saving');
      const res = await fetch(`/api/patients/${patientId}/sessions/${sessionId}/triple-rows`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ position: newPosition })
      });

      if (res.ok) {
        const json = await res.json();
        if (json.data && json.data.id) {
          setRows((prev) => prev.map((r) => (r.id === tempId ? json.data : r)));
          setAutosaveStatus('saved');
          const now = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
          setLastSavedTime(now);
        }
      }
    } catch {
      setAutosaveStatus('error');
    }
  };

  // 6. Duplicar linha
  const handleDuplicateRow = async (row: TripleRow) => {
    const tempId = 'temp_' + Date.now();
    const duplicatedRow: TripleRow = {
      ...row,
      id: tempId,
      position: rows.length,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const updated = [...rows, duplicatedRow];
    setRows(updated);
    salvarBackupLocal(updated);

    try {
      const res = await fetch(`/api/patients/${patientId}/sessions/${sessionId}/triple-rows`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          antecedent: row.antecedent,
          response_action: row.response_action,
          response_thought: row.response_thought,
          response_body: row.response_body,
          consequence: row.consequence,
          effect_short: row.effect_short,
          effect_long: row.effect_long,
          note: row.note,
          position: rows.length
        })
      });
      if (res.ok) {
        const json = await res.json();
        if (json.data?.id) {
          setRows((prev) => prev.map((r) => (r.id === tempId ? json.data : r)));
        }
      }
    } catch (err) {
      console.error('Erro ao duplicar episódio:', err);
    }
  };

  // 7. Excluir linha com opção de desfazer (10s)
  const handleDeleteRow = async (row: TripleRow) => {
    if (!window.confirm('Deseja excluir este episódio da tríplice contingência?')) {
      return;
    }

    const filtered = rows.filter((r) => r.id !== row.id);
    setRows(filtered);
    salvarBackupLocal(filtered);

    if (deletedUndoItem?.timeoutId) {
      clearTimeout(deletedUndoItem.timeoutId);
    }

    const timeoutId = setTimeout(async () => {
      try {
        await fetch(`/api/triple-rows/${row.id}`, { method: 'DELETE' });
      } catch (err) {
        console.error('Erro ao efetivar exclusão no servidor:', err);
      }
      setDeletedUndoItem(null);
    }, 10000);

    setDeletedUndoItem({ row, timeoutId });
  };

  // 8. Desfazer exclusão
  const handleUndoDelete = async () => {
    if (!deletedUndoItem) return;
    clearTimeout(deletedUndoItem.timeoutId);

    const restoredRow = deletedUndoItem.row;
    const updated = [...rows, restoredRow].sort((a, b) => a.position - b.position);
    setRows(updated);
    salvarBackupLocal(updated);
    setDeletedUndoItem(null);

    if (!restoredRow.id.startsWith('temp_')) {
      try {
        await fetch(`/api/triple-rows/${restoredRow.id}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'restore' })
        });
      } catch {}
    }
  };

  // 9. Reordenar posições (subir / descer)
  const handleMoveRow = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= rows.length) return;

    const newRows = [...rows];
    const temp = newRows[index];
    newRows[index] = newRows[targetIndex];
    newRows[targetIndex] = temp;

    const reordered = newRows.map((r, idx) => ({ ...r, position: idx }));
    setRows(reordered);
    salvarBackupLocal(reordered);

    try {
      const validIds = reordered.map((r) => r.id).filter((id) => !id.startsWith('temp_'));
      if (validIds.length > 0) {
        await fetch('/api/triple-rows/reorder', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ids: validIds })
        });
      }
    } catch (err) {
      console.error('Erro ao reordenar:', err);
    }
  };

  return (
    <section
      className={`blk ${modoCompartilhado ? 'modo-compartilhado' : ''}`}
      id="arc"
    >
      {/* Cabeçalho da Tríplice (Versão Limpa) */}
      <div className="hd">
        <h3>
          Tríplice <em>contingência</em>
          {rows.length > 0 && (
            <small>
              {rows.length} {rows.length === 1 ? 'episódio' : 'episódios'}
            </small>
          )}
        </h3>

        <div className="tools">
          {/* Status de salvamento: só texto */}
          <span className={`save ${autosaveStatus === 'error' ? 'err' : ''}`}>
            {autosaveStatus === 'saving' ? (
              <>Salvando…</>
            ) : autosaveStatus === 'error' ? (
              <>
                <svg viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="9" />
                  <path d="M12 8v5M12 16h.01" />
                </svg>
                Não salvo<span className="lg"> ·</span>{' '}
                <button type="button" onClick={() => carregarEpisodios()}>
                  tentar<span className="lg"> de novo</span>
                </button>
              </>
            ) : (
              <>
                <svg viewBox="0 0 24 24">
                  <path d="m5 12 4.5 4.5L19 7" />
                </svg>
                Salvo
              </>
            )}
          </span>

          {!isPrintView && (
            <button
              className="sw"
              type="button"
              aria-pressed={modoCompartilhado}
              onClick={() => setModoCompartilhado((prev) => !prev)}
              title="Alternar modo compartilhado para exibição ao paciente (Cmd/Ctrl + Shift + S)"
            >
              <i></i>
              <span>
                Compartilhar<span className="lg"> com paciente</span>
              </span>
            </button>
          )}
        </div>
      </div>

      {/* Legenda elegante: uma faixa fina, sem caixas */}
      <div className="legend" aria-label="Legenda">
        <div className="lgd a">
          <b>
            <i>A</i>
            {modoCompartilhado ? 'Antes' : 'Antecedente'}
          </b>
          <small>
            {modoCompartilhado
              ? 'O que estava acontecendo logo antes'
              : 'Situação e estímulos discriminativos'}
          </small>
        </div>
        <div className="lgd r">
          <b>
            <i>R</i>
            {modoCompartilhado ? 'Resposta' : 'Resposta'}
          </b>
          <small>
            {modoCompartilhado
              ? 'O que fez, pensou e sentiu'
              : 'Ação, pensamentos e sensações'}
          </small>
        </div>
        <div className="lgd c">
          <b>
            <i>C</i>
            {modoCompartilhado ? 'Depois' : 'Consequência'}
          </b>
          <small>
            {modoCompartilhado
              ? 'O que aconteceu imediatamente depois'
              : 'Reforçadora ou aversiva'}
          </small>
        </div>
        <div className="lgd e">
          <b>
            <i>E</i>
            {modoCompartilhado ? 'Efeitos' : 'Efeitos'}
          </b>
          <small>
            {modoCompartilhado
              ? 'Ajudou na hora? E no dia seguinte?'
              : 'Curto e longo prazo'}
          </small>
        </div>
      </div>

      {/* Estado Vazio ou Lista de Episódios */}
      {rows.length === 0 ? (
        <div className="empty">
          <p>
            <b>Nenhum episódio ainda</b>
            Registre a situação, o que o paciente fez ou sentiu e o que aconteceu depois.
          </p>
          {!isPrintView && (
            <button className="btn" type="button" onClick={handleAddEpisode}>
              <svg viewBox="0 0 24 24">
                <path d="M12 5v14M5 12h14" />
              </svg>
              Adicionar episódio
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="eps" id="eps" style={{ marginTop: '16px' }}>
            {rows.map((row, index) => (
              <article className="ep" key={row.id}>
                <header className="ep-hd">
                  <div className="ep-id">
                    <span className="ep-num">{String(index + 1).padStart(2, '0')}</span>
                    <div>
                      <b>Episódio</b>
                      <span className="sub">Registrado nesta sessão</span>
                    </div>
                  </div>

                  {!isPrintView && (
                    <div className="ep-act">
                      <button
                        className="ib"
                        type="button"
                        aria-label="Mover para cima"
                        disabled={index === 0}
                        onClick={() => handleMoveRow(index, 'up')}
                        title="Mover para cima"
                      >
                        <svg viewBox="0 0 24 24">
                          <path d="m6 15 6-6 6 6" />
                        </svg>
                      </button>
                      <button
                        className="ib"
                        type="button"
                        aria-label="Mover para baixo"
                        disabled={index === rows.length - 1}
                        onClick={() => handleMoveRow(index, 'down')}
                        title="Mover para baixo"
                      >
                        <svg viewBox="0 0 24 24">
                          <path d="m6 9 6 6 6-6" />
                        </svg>
                      </button>
                      <button
                        className="ib"
                        type="button"
                        aria-label="Duplicar episódio"
                        onClick={() => handleDuplicateRow(row)}
                        title="Duplicar episódio"
                      >
                        <svg viewBox="0 0 24 24">
                          <rect x="8" y="8" width="12" height="12" rx="2" />
                          <path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" />
                        </svg>
                      </button>
                      <span className="sep" aria-hidden="true"></span>
                      <button
                        className="ib del"
                        type="button"
                        aria-label="Remover episódio"
                        onClick={() => handleDeleteRow(row)}
                        title="Remover episódio"
                      >
                        <svg viewBox="0 0 24 24">
                          <path d="M4 7h16M10 11v6M14 11v6M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12M9 7V4h6v3" />
                        </svg>
                      </button>
                    </div>
                  )}
                </header>

                <div className="ep-grid">
                  {/* Antecedente */}
                  <div className="cell a">
                    <label htmlFor={`a-${row.id}`}>
                      <i>A</i>
                      {modoCompartilhado ? 'Antes' : 'Antecedente'}
                    </label>
                    <textarea
                      id={`a-${row.id}`}
                      ref={index === rows.length - 1 ? lastCreatedInputRef : undefined}
                      placeholder={
                        modoCompartilhado
                          ? 'Onde, quando, com quem…'
                          : 'Situação e estímulos antecedentes…'
                      }
                      value={row.antecedent || ''}
                      onChange={(e) => {
                        handleFieldChange(row.id, 'antecedent', e.target.value);
                        autoGrow(e.target);
                      }}
                      onBlur={(e) => handleFieldBlur(row.id, 'antecedent', e.target.value)}
                    />
                  </div>

                  {/* Resposta */}
                  <div className="cell r">
                    <label htmlFor={`r-${row.id}`}>
                      <i>R</i>
                      {modoCompartilhado ? 'Resposta' : 'Resposta'} <small>AC</small>
                    </label>
                    <textarea
                      id={`r-${row.id}`}
                      placeholder={
                        modoCompartilhado
                          ? 'O que fez, pensou e sentiu…'
                          : 'Ação aberta, pensamentos e sensações…'
                      }
                      value={row.response_action || ''}
                      onChange={(e) => {
                        handleFieldChange(row.id, 'response_action', e.target.value);
                        autoGrow(e.target);
                      }}
                      onBlur={(e) => handleFieldBlur(row.id, 'response_action', e.target.value)}
                    />
                  </div>

                  {/* Consequência */}
                  <div className="cell c">
                    <label htmlFor={`c-${row.id}`}>
                      <i>C</i>
                      {modoCompartilhado ? 'Depois' : 'Consequência'}
                    </label>
                    <textarea
                      id={`c-${row.id}`}
                      placeholder={
                        modoCompartilhado
                          ? 'O que aconteceu depois…'
                          : 'Consequência imediata no ambiente…'
                      }
                      value={row.consequence || ''}
                      onChange={(e) => {
                        handleFieldChange(row.id, 'consequence', e.target.value);
                        autoGrow(e.target);
                      }}
                      onBlur={(e) => handleFieldBlur(row.id, 'consequence', e.target.value)}
                    />
                  </div>

                  {/* Efeitos */}
                  <div className="cell e">
                    <label htmlFor={`e-${row.id}`}>
                      <i>E</i>
                      {modoCompartilhado ? 'Efeitos' : 'Efeitos'}
                    </label>
                    <textarea
                      id={`e-${row.id}`}
                      placeholder={
                        modoCompartilhado
                          ? 'Ajudou na hora? E depois?'
                          : 'Curto prazo / longo prazo…'
                      }
                      value={
                        row.effect_short || row.effect_long
                          ? `${row.effect_short ? 'Curto: ' + row.effect_short : ''}${
                              row.effect_short && row.effect_long ? ' · ' : ''
                            }${row.effect_long ? 'Longo: ' + row.effect_long : ''}`
                          : ''
                      }
                      onChange={(e) => {
                        handleFieldChange(row.id, 'effect_short', e.target.value);
                        autoGrow(e.target);
                      }}
                      onBlur={(e) => handleFieldBlur(row.id, 'effect_short', e.target.value)}
                    />
                  </div>
                </div>

                {/* Nota privada do profissional (Sigiloso) */}
                {!modoCompartilhado && !isPrintView && (
                  <details className="priv" open={Boolean(row.note)}>
                    <summary>
                      <span className="lock" aria-hidden="true">
                        <svg viewBox="0 0 24 24">
                          <rect x="5" y="11" width="14" height="10" rx="2" />
                          <path d="M8 11V8a4 4 0 0 1 8 0v3" />
                        </svg>
                      </span>
                      <b>Nota privada</b>
                      <span className="tagp">Sigiloso</span>
                      <span className="hint">Só você vê · não entra no modo compartilhado</span>
                      <svg className="chev" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="m6 9 6 6 6-6" />
                      </svg>
                    </summary>
                    <div className="body">
                      <textarea
                        aria-label="Nota privada do profissional"
                        placeholder="Observação clínica interna, esquemas de reforçamento, funções de estímulo…"
                        value={row.note || ''}
                        onChange={(e) => {
                          handleFieldChange(row.id, 'note', e.target.value);
                          autoGrow(e.target);
                        }}
                        onBlur={(e) => handleFieldBlur(row.id, 'note', e.target.value)}
                      />
                      <p className="foot">Visível apenas para o profissional responsável.</p>
                    </div>
                  </details>
                )}
              </article>
            ))}
          </div>

          {/* Botão Novo Episódio */}
          {!isPrintView && (
            <button
              className="btn add-more"
              type="button"
              data-add
              onClick={handleAddEpisode}
              id="add-more"
              style={{ marginTop: '14px' }}
            >
              <svg viewBox="0 0 24 24">
                <path d="M12 5v14M5 12h14" />
              </svg>
              Novo episódio
            </button>
          )}
        </>
      )}

      {/* Barra de erro se falhar salvamento */}
      {autosaveStatus === 'error' && (
        <div className="errbar">
          <svg viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="9" />
            <path d="M12 8v5M12 16h.01" />
          </svg>
          <span>Houve uma falha ao sincronizar as alterações no servidor.</span>
          <button type="button" onClick={() => carregarEpisodios()}>
            Tentar de novo
          </button>
        </div>
      )}

      {/* Toast de Desfazer Exclusão */}
      {deletedUndoItem && (
        <div className="triplice-undo-toast" role="alert">
          <span>Episódio removido.</span>
          <button type="button" className="btn-undo-action" onClick={handleUndoDelete}>
            Desfazer (10s)
          </button>
        </div>
      )}
    </section>
  );
}
