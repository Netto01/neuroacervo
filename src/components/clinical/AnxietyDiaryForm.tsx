'use client';

import React, { useState, useEffect, useRef } from 'react';
import { AnxietyEntry } from '@/types/clinicalSession';
import './anxiety-diary.css';

interface AnxietyDiaryFormProps {
  patientId: string;
  patientCode?: string;
  onEntrySaved?: (entry: AnxietyEntry) => void;
}

const ACTION_SUGGESTIONS = [
  'Fugir / Evitar',
  'Adiar',
  'Checar de novo',
  'Pedir ajuda',
  'Enfrentar',
  'Outro'
];

export function AnxietyDiaryForm({
  patientId,
  patientCode = 'Paciente',
  onEntrySaved
}: AnxietyDiaryFormProps) {
  // 1. Data e hora (pre-preenchido com agora)
  const [occurredAt, setOccurredAt] = useState<string>(() => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  });

  // 2. Situação (obrigatório)
  const [situation, setSituation] = useState<string>('');

  // 3. Sensações e pensamentos na hora
  const [bodyThoughts, setBodyThoughts] = useState<string>('');

  // 4. O que fiz na hora (obrigatório): chips + texto livre
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [freeTextAction, setFreeTextAction] = useState<string>('');

  // 5. O que aconteceu depois (consequência)
  const [aftermath, setAftermath] = useState<string>('');

  // 6. Intensidade (0 a 10 obrigatório)
  const [intensity, setIntensity] = useState<number | null>(null);

  // 7. O que era importante e ficou de lado (valor)
  const [valueBlocked, setValueBlocked] = useState<string>('');

  // 8. Compartilhado com o profissional (padrão true com aviso claro)
  const [shared, setShared] = useState<boolean>(true);

  // Estados de controle e feedback
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isOffline, setIsOffline] = useState<boolean>(false);
  const [hasOfflineQueue, setHasOfflineQueue] = useState<boolean>(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const localDraftKey = `na_anxiety_draft_${patientId}`;
  const offlineQueueKey = `na_anxiety_queue_${patientId}`;

  // Recupera rascunho local se o paciente saiu no meio
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const draft = localStorage.getItem(localDraftKey);
      if (draft) {
        const d = JSON.parse(draft);
        if (d.situation) setSituation(d.situation);
        if (d.bodyThoughts) setBodyThoughts(d.bodyThoughts);
        if (Array.isArray(d.selectedTags)) setSelectedTags(d.selectedTags);
        if (d.freeTextAction) setFreeTextAction(d.freeTextAction);
        if (d.aftermath) setAftermath(d.aftermath);
        if (typeof d.intensity === 'number') setIntensity(d.intensity);
        if (d.valueBlocked) setValueBlocked(d.valueBlocked);
        if (typeof d.shared === 'boolean') setShared(d.shared);
      }
    } catch {}

    // Verifica fila offline pendente
    const queue = localStorage.getItem(offlineQueueKey);
    if (queue && JSON.parse(queue).length > 0) {
      setHasOfflineQueue(true);
    }

    const updateOnlineStatus = () => {
      setIsOffline(!navigator.onLine);
      if (navigator.onLine) {
        sincronizarFilaOffline();
      }
    };

    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);
    setIsOffline(!navigator.onLine);

    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
    };
  }, [localDraftKey, offlineQueueKey]);

  // Salva rascunho automaticamente a cada alteração
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const draft = {
        situation,
        bodyThoughts,
        selectedTags,
        freeTextAction,
        aftermath,
        intensity,
        valueBlocked,
        shared
      };
      localStorage.setItem(localDraftKey, JSON.stringify(draft));
    } catch {}
  }, [situation, bodyThoughts, selectedTags, freeTextAction, aftermath, intensity, valueBlocked, shared, localDraftKey]);

  // Sincroniza registros que ficaram na fila offline
  const sincronizarFilaOffline = async () => {
    if (typeof window === 'undefined') return;
    try {
      const raw = localStorage.getItem(offlineQueueKey);
      if (!raw) return;
      const queue: any[] = JSON.parse(raw);
      if (!Array.isArray(queue) || queue.length === 0) return;

      const remaining: any[] = [];
      for (const item of queue) {
        try {
          const res = await fetch(`/api/patients/${patientId}/anxiety-entries`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(item)
          });
          if (!res.ok) remaining.push(item);
        } catch {
          remaining.push(item);
        }
      }

      localStorage.setItem(offlineQueueKey, JSON.stringify(remaining));
      setHasOfflineQueue(remaining.length > 0);
    } catch {}
  };

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedbackMsg(null);

    // Validação dos 3 campos obrigatórios conforme o PDF
    if (!situation.trim()) {
      setFeedbackMsg({ type: 'error', text: 'Por favor, descreva o que estava acontecendo logo antes.' });
      return;
    }

    if (selectedTags.length === 0 && !freeTextAction.trim()) {
      setFeedbackMsg({ type: 'error', text: 'Por favor, selecione ou descreva o que você fez na hora.' });
      return;
    }

    if (intensity === null) {
      setFeedbackMsg({ type: 'error', text: 'Por favor, selecione a intensidade de 0 a 10.' });
      return;
    }

    // Validação de horário no futuro (máximo 1 hora)
    const selectedDate = new Date(occurredAt);
    const maxFuture = new Date(Date.now() + 60 * 60 * 1000);
    if (selectedDate.getTime() > maxFuture.getTime()) {
      setFeedbackMsg({
        type: 'error',
        text: 'A data e hora do registro não pode ser superior a 1 hora no futuro.'
      });
      return;
    }

    const clientUuid = crypto.randomUUID();
    const payload = {
      client_uuid: clientUuid,
      occurred_at: selectedDate.toISOString(),
      situation: situation.trim(),
      body_thoughts: bodyThoughts.trim(),
      action_taken: {
        tags: selectedTags,
        free_text: freeTextAction.trim()
      },
      aftermath: aftermath.trim(),
      intensity,
      value_blocked: valueBlocked.trim(),
      shared
    };

    setIsSubmitting(true);

    // Se estiver offline, enfileira localmente
    if (isOffline || !navigator.onLine) {
      try {
        const raw = localStorage.getItem(offlineQueueKey);
        const queue = raw ? JSON.parse(raw) : [];
        queue.push(payload);
        localStorage.setItem(offlineQueueKey, JSON.stringify(queue));
        setHasOfflineQueue(true);
        localStorage.removeItem(localDraftKey);

        setFeedbackMsg({
          type: 'success',
          text: '✓ Registro salvo no aparelho! Será sincronizado automaticamente ao reconectar.'
        });
        resetForm();
      } catch {
        setFeedbackMsg({ type: 'error', text: 'Erro ao salvar offline no aparelho.' });
      }
      setIsSubmitting(false);
      return;
    }

    try {
      const res = await fetch(`/api/patients/${patientId}/anxiety-entries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const json = await res.json();
        localStorage.removeItem(localDraftKey);
        setFeedbackMsg({
          type: 'success',
          text: '✓ Registro enviado com sucesso! Estará visível para a próxima sessão.'
        });
        if (onEntrySaved && json.data) {
          onEntrySaved(json.data);
        }
        resetForm();
      } else {
        const errJson = await res.json().catch(() => ({}));
        setFeedbackMsg({
          type: 'error',
          text: errJson.error || 'Não foi possível registrar agora. Rascunho mantido.'
        });
      }
    } catch {
      // Salva na fila offline em caso de falha de conexão
      try {
        const raw = localStorage.getItem(offlineQueueKey);
        const queue = raw ? JSON.parse(raw) : [];
        queue.push(payload);
        localStorage.setItem(offlineQueueKey, JSON.stringify(queue));
        setHasOfflineQueue(true);
        setFeedbackMsg({
          type: 'success',
          text: 'Conexão instável: registro guardado com segurança no aparelho (aguardando envio).'
        });
        resetForm();
      } catch {
        setFeedbackMsg({ type: 'error', text: 'Erro de conexão. Tente novamente em instantes.' });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setSituation('');
    setBodyThoughts('');
    setSelectedTags([]);
    setFreeTextAction('');
    setAftermath('');
    setIntensity(null);
    setValueBlocked('');
  };

  return (
    <div className="anxiety-diary-container">
      {/* 1. Texto Fixo Obrigatório da AC no topo (Não editável pelo paciente) */}
      <div className="ac-orientation-banner" role="note">
        <p>
          <b>A ansiedade não é a causa do que você fez</b> — ela faz parte do que aconteceu.
          Registrar o que veio antes, o que você fez e o que aconteceu depois ajuda a enxergar o padrão
          na próxima sessão com o profissional.
        </p>
      </div>

      {/* Selo de sincronização offline se houver pendências */}
      {hasOfflineQueue && (
        <div className="offline-sync-badge">
          ⏳ Existem registros salvos no aparelho aguardando sincronização.
        </div>
      )}

      {/* Mensagem de Feedback */}
      {feedbackMsg && (
        <div
          style={{
            padding: '12px 14px',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: 600,
            background: feedbackMsg.type === 'success' ? '#f0fdf4' : '#fef2f2',
            color: feedbackMsg.type === 'success' ? '#15803d' : '#b91c1c',
            border: `1px solid ${feedbackMsg.type === 'success' ? '#bbf7d0' : '#fecaca'}`
          }}
        >
          {feedbackMsg.text}
        </div>
      )}

      {/* Formulário em página única (preenchimento rápido em ~2 min) */}
      <form onSubmit={handleSubmit} className="anxiety-form">
        {/* Campo 1: Data e Hora */}
        <div className="anxiety-field-group">
          <label htmlFor="occurred_at" className="anxiety-label">
            <span>Quando aconteceu?</span>
            <span className="required-badge">Obrigatório</span>
          </label>
          <input
            id="occurred_at"
            type="datetime-local"
            className="anxiety-input"
            value={occurredAt}
            onChange={(e) => setOccurredAt(e.target.value)}
            required
          />
        </div>

        {/* Campo 2: Situação (Contexto anterior) */}
        <div className="anxiety-field-group">
          <label htmlFor="situation" className="anxiety-label">
            <span>O que estava acontecendo logo antes?</span>
            <span className="required-badge">Obrigatório</span>
          </label>
          <textarea
            id="situation"
            className="anxiety-textarea"
            placeholder="Onde você estava, com quem, qual era a situação ou o que tinha acabado de acontecer?"
            value={situation}
            onChange={(e) => setSituation(e.target.value)}
            required
          />
        </div>

        {/* Campo 3: Sensações e pensamentos na hora (Rótulo único AC) */}
        <div className="anxiety-field-group">
          <label htmlFor="body_thoughts" className="anxiety-label">
            <span>Sensações corporais e pensamentos na hora</span>
            <span className="anxiety-label-sub">Opcional</span>
          </label>
          <textarea
            id="body_thoughts"
            className="anxiety-textarea"
            placeholder="O que passou pela sua cabeça? O que sentiu no corpo (coração acelerado, aperto, respiração curta)?"
            value={bodyThoughts}
            onChange={(e) => setBodyThoughts(e.target.value)}
          />
        </div>

        {/* Campo 4: O que eu fiz na hora (Chips múltiplos + texto livre) */}
        <div className="anxiety-field-group">
          <label className="anxiety-label">
            <span>O que eu fiz na hora?</span>
            <span className="required-badge">Obrigatório</span>
          </label>
          <div className="action-chips-grid">
            {ACTION_SUGGESTIONS.map((tag) => {
              const active = selectedTags.includes(tag);
              return (
                <button
                  key={tag}
                  type="button"
                  className={`action-chip-btn ${active ? 'active' : ''}`}
                  onClick={() => toggleTag(tag)}
                  aria-pressed={active}
                >
                  <span>{active ? '✓' : '+'}</span>
                  <span>{tag}</span>
                </button>
              );
            })}
          </div>
          <input
            type="text"
            className="anxiety-input"
            placeholder="Outras ações ou detalhes do que fez (ex.: rolei o celular, saí da sala)"
            value={freeTextAction}
            onChange={(e) => setFreeTextAction(e.target.value)}
          />
        </div>

        {/* Campo 5: O que aconteceu depois (consequência) */}
        <div className="anxiety-field-group">
          <label htmlFor="aftermath" className="anxiety-label">
            <span>O que aconteceu depois?</span>
            <span className="anxiety-label-sub">Opcional</span>
          </label>
          <textarea
            id="aftermath"
            className="anxiety-textarea"
            placeholder="Qual foi o resultado imediato? Ajudou a aliviar na hora? O que aconteceu em seguida?"
            value={aftermath}
            onChange={(e) => setAftermath(e.target.value)}
          />
        </div>

        {/* Campo 6: Intensidade de 0 a 10 (Botões grandes para uso com uma mão) */}
        <div className="anxiety-field-group">
          <div className="anxiety-label">
            <span>Intensidade da ansiedade</span>
            <span className="required-badge">Obrigatório</span>
          </div>
          <div className="intensity-scale-wrapper">
            <div className="intensity-anchors">
              <span>0 (Nada / Calmo)</span>
              <span>10 (O máximo / Intolerável)</span>
            </div>
            <div className="intensity-buttons-grid" role="radiogroup" aria-label="Intensidade de 0 a 10">
              {Array.from({ length: 11 }, (_, i) => i).map((num) => {
                const isSelected = intensity === num;
                const isHigh = num >= 7;
                return (
                  <button
                    key={num}
                    type="button"
                    className={`intensity-btn ${isSelected ? 'selected' : ''} ${isHigh ? 'level-high' : ''}`}
                    onClick={() => setIntensity(num)}
                    role="radio"
                    aria-checked={isSelected}
                  >
                    {num}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Campo 7: O que era importante e ficou de lado (valor) */}
        <div className="anxiety-field-group">
          <label htmlFor="value_blocked" className="anxiety-label">
            <span>O que era importante para você e ficou de lado?</span>
            <span className="anxiety-label-sub">Opcional</span>
          </label>
          <input
            id="value_blocked"
            type="text"
            className="anxiety-input"
            placeholder="Ex.: Trabalhar na apresentação, estar com a família, descansar…"
            value={valueBlocked}
            onChange={(e) => setValueBlocked(e.target.value)}
          />
        </div>

        {/* Campo 8: Compartilhado com o profissional */}
        <div className="share-toggle-row">
          <div>
            <div className="share-toggle-label">Liberar visualização para o profissional</div>
            <div style={{ fontSize: '11px', color: '#64748b' }}>
              Se ativado, seu terapeuta poderá ver este registro na próxima sessão.
            </div>
          </div>
          <input
            type="checkbox"
            checked={shared}
            onChange={(e) => setShared(e.target.checked)}
            style={{ width: '20px', height: '20px', cursor: 'pointer' }}
          />
        </div>

        {/* Botão Fixo CTA */}
        <button
          type="submit"
          className="btn-submit-diary"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Enviando registro…' : 'Registrar agora'}
        </button>
      </form>
    </div>
  );
}
