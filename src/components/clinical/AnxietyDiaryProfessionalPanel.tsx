'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { AnxietyEntry, TripleRow } from '@/types/clinicalSession';
import { PatientDiaryShareModal } from './PatientDiaryShareModal';
import './anxiety-diary.css';

interface AnxietyDiaryProfessionalPanelProps {
  patientId: string;
  sessionId: string;
  patientCode?: string;
  patientName?: string;
  onEpisodeConverted?: (row: TripleRow) => void;
}

export function AnxietyDiaryProfessionalPanel({
  patientId,
  sessionId,
  patientCode,
  patientName,
  onEpisodeConverted
}: AnxietyDiaryProfessionalPanelProps) {
  const [entries, setEntries] = useState<AnxietyEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filterIntensity, setFilterIntensity] = useState<string>('all');
  const [convertingId, setConvertingId] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [shareModalOpen, setShareModalOpen] = useState<boolean>(false);

  const carregarRegistros = useCallback(async () => {
    if (!patientId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/patients/${patientId}/anxiety-entries`);
      if (res.ok) {
        const json = await res.json();
        if (json.data && Array.isArray(json.data)) {
          setEntries(json.data);
        }
      }
    } catch (err) {
      console.warn('Erro ao carregar registros do diário de ansiedade:', err);
    } finally {
      setLoading(false);
    }
  }, [patientId]);

  useEffect(() => {
    carregarRegistros();
  }, [carregarRegistros]);

  // Conversão em 1 clique (Seção 4.3 do PDF)
  const handleConvert = async (entry: AnxietyEntry) => {
    if (!sessionId) {
      alert('É necessário ter uma sessão ativa para converter o registro em episódio da tríplice.');
      return;
    }

    setConvertingId(entry.id);
    try {
      const res = await fetch(`/api/anxiety-entries/${entry.id}/convert`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: sessionId })
      });

      if (res.ok) {
        const json = await res.json();
        const tripleRow: TripleRow = json.data;

        // Atualiza status localmente
        setEntries((prev) =>
          prev.map((e) =>
            e.id === entry.id ? { ...e, converted_triple_row_id: tripleRow.id } : e
          )
        );

        setToastMsg(
          json.alreadyConverted
            ? 'Este registro já havia sido convertido anteriormente (não duplicado).'
            : '✓ Registro do diário convertido em episódio na grade da tríplice!'
        );
        setTimeout(() => setToastMsg(null), 3500);

        if (onEpisodeConverted) {
          onEpisodeConverted(tripleRow);
        }
      } else {
        const errJson = await res.json().catch(() => ({}));
        alert(errJson.error || 'Falha ao converter registro em tríplice contingência.');
      }
    } catch {
      alert('Erro de conexão ao tentar converter registro.');
    } finally {
      setConvertingId(null);
    }
  };

  const registrosFiltrados = entries.filter((e) => {
    if (filterIntensity === 'high') return e.intensity >= 7;
    if (filterIntensity === 'medium') return e.intensity >= 4 && e.intensity <= 6;
    if (filterIntensity === 'low') return e.intensity <= 3;
    return true;
  });

  return (
    <section className="card">
      {/* Cabeçalho da referência NeuroAcervo */}
      <div className="card-hd">
        <div className="ttl">
          <span className="ico" aria-hidden="true">
            <svg viewBox="0 0 24 24">
              <path d="M4 5a2 2 0 0 1 2-2h12v18H6a2 2 0 0 1-2-2z" />
              <path d="M8 7h6M8 11h6" />
            </svg>
          </span>
          <div>
            <span className="tag">Registros do paciente</span>
            <h3>
              Diário de <em>ansiedade</em>
              <span className="count">{entries.length}</span>
            </h3>
          </div>
        </div>

        <div className="filter">
          <label htmlFor="int-filter">Intensidade</label>
          <select
            id="int-filter"
            value={filterIntensity}
            onChange={(e) => setFilterIntensity(e.target.value)}
          >
            <option value="all">Todas</option>
            <option value="low">Leve</option>
            <option value="medium">Moderada</option>
            <option value="high">Intensa</option>
          </select>
          <button
            className="btn btn-ghost btn-icon"
            type="button"
            aria-label="Atualizar registros"
            onClick={carregarRegistros}
            title="Atualizar diário do paciente"
          >
            <svg viewBox="0 0 24 24">
              <path d="M20 11a8 8 0 1 0-2.3 5.7" />
              <path d="M20 4v7h-7" />
            </svg>
          </button>

          <button
            type="button"
            onClick={() => setShareModalOpen(true)}
            title="Copiar link ou QR Code para o paciente registrar no celular"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              height: '40px',
              padding: '0 12px',
              borderRadius: '11px',
              border: '1.5px solid var(--line)',
              background: 'var(--paper)',
              color: 'var(--ink)',
              font: '600 12.5px var(--f-t)',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 0.15s ease'
            }}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--accent)"
              strokeWidth="2.2"
              strokeLinecap="round"
            >
              <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
              <line x1="12" y1="18" x2="12.01" y2="18" />
            </svg>
            <span>Link do paciente</span>
          </button>
        </div>
      </div>

      <div className="card-bd">
        {toastMsg && (
          <div
            style={{
              padding: '10px 14px',
              marginBottom: '12px',
              borderRadius: '10px',
              background: 'var(--c-bg)',
              color: 'var(--c)',
              border: '1px solid rgba(47, 107, 49, 0.25)',
              fontSize: '13px',
              fontWeight: 600,
              fontFamily: 'var(--f-t)'
            }}
          >
            {toastMsg}
          </div>
        )}

        {loading ? (
          <div style={{ padding: '18px', textAlign: 'center', color: 'var(--mute)', font: '500 13.5px var(--f-t)' }}>
            Carregando registros do diário…
          </div>
        ) : registrosFiltrados.length === 0 ? (
          <div className="empty">
            <i aria-hidden="true">
              <svg viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-4-4" />
              </svg>
            </i>
            <div>
              <b>Nenhum registro compartilhado</b>
              <span>
                {entries.length === 0
                  ? 'Quando o paciente compartilhar entradas do diário, elas aparecem aqui para você comentar na sessão.'
                  : 'Nenhum registro corresponde ao filtro de intensidade selecionado.'}
              </span>
            </div>
          </div>
        ) : (
          <ul className="diary">
            {registrosFiltrados.map((entry) => {
              const isConverted = Boolean(entry.converted_triple_row_id);
              const d = new Date(entry.occurred_at);
              const day = isNaN(d.getTime()) ? '--' : String(d.getDate()).padStart(2, '0');
              const month = isNaN(d.getTime())
                ? ''
                : d.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '').toUpperCase();
              const time = isNaN(d.getTime())
                ? ''
                : d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

              const lvlClass =
                entry.intensity >= 7 ? 'l3' : entry.intensity >= 4 ? 'l2' : 'l1';

              const actionData = (entry.action_taken || {}) as { tags?: string[]; free_text?: string };
              const tags = Array.isArray(actionData.tags) ? actionData.tags : [];
              const freeText = actionData.free_text || '';
              const details = [
                entry.body_thoughts,
                tags.length > 0 ? `[${tags.join(', ')}]` : null,
                freeText,
                entry.aftermath ? `Depois: ${entry.aftermath}` : null
              ]
                .filter(Boolean)
                .join(' · ');

              return (
                <li
                  key={entry.id}
                  className={`entry ${isConverted ? 'is-converted' : ''}`}
                >
                  <time>
                    <b>{day}</b>
                    {month} · {time}
                  </time>

                  <p>
                    {entry.situation || 'Registro sem situação descrita'}
                    <small>{details || 'Sem relato adicional de pensamentos ou ações'}</small>
                  </p>

                  <span className={`lvl ${lvlClass}`}>
                    <span className="meter" aria-hidden="true">
                      <i></i>
                      <i></i>
                      <i></i>
                      <i></i>
                      <i></i>
                      <i></i>
                      <i></i>
                      <i></i>
                      <i></i>
                      <i></i>
                    </span>
                    {entry.intensity}/10
                  </span>

                  <button
                    type="button"
                    className={`btn-convert-pill ${isConverted ? 'converted-badge' : 'convert-ready'}`}
                    onClick={() => handleConvert(entry)}
                    disabled={convertingId === entry.id || isConverted}
                    title={
                      isConverted
                        ? 'Registro já convertido em episódio da Tríplice Contingência'
                        : 'Converter em episódio da Tríplice Contingência nesta sessão'
                    }
                  >
                    {convertingId === entry.id
                      ? 'Convertendo…'
                      : isConverted
                      ? '✓ Na Tríplice'
                      : '⚡ Usar na Tríplice'}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <PatientDiaryShareModal
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        patientCode={patientCode || patientId}
        patientName={patientName}
      />
    </section>
  );
}
