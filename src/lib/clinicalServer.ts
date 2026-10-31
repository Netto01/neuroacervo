import { createClient } from '@supabase/supabase-js';
import {
  TripleRow,
  AnxietyEntry,
  Formulation,
  FormulationVersion,
  AuditAction,
  AuditRecordType
} from '@/types/clinicalSession';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export function getSupabaseAdmin() {
  return createClient(
    supabaseUrl || 'https://placeholder.supabase.co',
    serviceRoleKey || 'placeholder-key'
  );
}

/**
 * Registra evento de auditoria LGPD (Seção 7.1).
 * Nunca grava conteúdo textual clínico, apenas IDs, ação e timestamp.
 */
export async function recordClinicalAudit({
  userId,
  patientId,
  recordType,
  recordId,
  action,
  metadata = {}
}: {
  userId: string;
  patientId?: string | null;
  recordType: AuditRecordType;
  recordId: string;
  action: AuditAction;
  metadata?: Record<string, unknown>;
}) {
  try {
    const supabase = getSupabaseAdmin();
    await supabase.from('clinical_audit_logs').insert({
      user_id: userId,
      patient_id: patientId || null,
      record_type: recordType,
      record_id: recordId,
      action,
      metadata: {
        ...metadata,
        timestamp: new Date().toISOString()
      }
    });
  } catch (err) {
    // Falhas de auditoria são registradas silenciosamente para não interromper a sessão clínica
    console.warn('[Audit Log Warning] Falha ao registrar log:', err);
  }
}

/**
 * Lista episódios da tríplice contingência para uma sessão específica.
 * Filtra estritamente por professional_id e exclui os que possuem deleted_at preenchido.
 */
export async function getTripleRowsForSession(
  userId: string,
  patientId: string,
  sessionId: string
): Promise<TripleRow[]> {
  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from('triple_rows')
    .select('*')
    .eq('professional_id', userId)
    .eq('patient_id', patientId)
    .eq('session_id', sessionId)
    .is('deleted_at', null)
    .order('position', { ascending: true })
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Erro ao buscar triple_rows:', error);
    return [];
  }

  // Registra visualização na auditoria
  if (data && data.length > 0) {
    await recordClinicalAudit({
      userId,
      patientId,
      recordType: 'triple_row',
      recordId: sessionId,
      action: 'view',
      metadata: { count: data.length }
    });
  }

  return (data as TripleRow[]) || [];
}

/**
 * Cria um novo episódio na tríplice contingência.
 */
export async function createTripleRow(
  userId: string,
  patientId: string,
  sessionId: string,
  row: Partial<TripleRow>
): Promise<TripleRow | null> {
  const supabase = getSupabaseAdmin();

  // Determina a próxima posição
  const { data: lastRows } = await supabase
    .from('triple_rows')
    .select('position')
    .eq('professional_id', userId)
    .eq('session_id', sessionId)
    .is('deleted_at', null)
    .order('position', { ascending: false })
    .limit(1);

  const nextPos = (lastRows && lastRows[0]?.position !== undefined) ? lastRows[0].position + 1 : 0;

  const newRecord = {
    professional_id: userId,
    patient_id: patientId,
    session_id: sessionId,
    antecedent: (row.antecedent || '').slice(0, 2000),
    response_action: (row.response_action || '').slice(0, 2000),
    response_thought: (row.response_thought || '').slice(0, 2000),
    response_body: (row.response_body || '').slice(0, 2000),
    consequence: (row.consequence || '').slice(0, 2000),
    effect_short: (row.effect_short || '').slice(0, 500),
    effect_long: (row.effect_long || '').slice(0, 500),
    note: (row.note || '').slice(0, 2000),
    source_entry_id: row.source_entry_id || null,
    position: row.position ?? nextPos
  };

  const { data, error } = await supabase
    .from('triple_rows')
    .insert(newRecord)
    .select('*')
    .single();

  if (error || !data) {
    console.error('Erro ao criar triple_row:', error);
    return null;
  }

  await recordClinicalAudit({
    userId,
    patientId,
    recordType: 'triple_row',
    recordId: data.id,
    action: 'create'
  });

  return data as TripleRow;
}

/**
 * Atualiza campos de um episódio da tríplice (Autosave).
 */
export async function updateTripleRowField(
  userId: string,
  rowId: string,
  updates: Partial<TripleRow>
): Promise<TripleRow | null> {
  const supabase = getSupabaseAdmin();

  const allowedFields: (keyof TripleRow)[] = [
    'antecedent',
    'response_action',
    'response_thought',
    'response_body',
    'consequence',
    'effect_short',
    'effect_long',
    'note',
    'position'
  ];

  const payload: Record<string, unknown> = {};
  for (const field of allowedFields) {
    if (updates[field] !== undefined) {
      payload[field] = typeof updates[field] === 'string'
        ? (updates[field] as string).slice(0, 2000)
        : updates[field];
    }
  }

  if (Object.keys(payload).length === 0) return null;

  payload.updated_at = new Date().toISOString();

  const { data, error } = await supabase
    .from('triple_rows')
    .update(payload)
    .eq('id', rowId)
    .eq('professional_id', userId)
    .is('deleted_at', null)
    .select('*')
    .single();

  if (error || !data) {
    console.error('Erro ao atualizar triple_row:', error);
    return null;
  }

  await recordClinicalAudit({
    userId,
    patientId: data.patient_id,
    recordType: 'triple_row',
    recordId: rowId,
    action: 'update',
    metadata: { changed_fields: Object.keys(payload) }
  });

  return data as TripleRow;
}

/**
 * Exclusão lógica de episódio (soft delete).
 */
export async function softDeleteTripleRow(
  userId: string,
  rowId: string
): Promise<boolean> {
  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from('triple_rows')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', rowId)
    .eq('professional_id', userId)
    .select('id, patient_id')
    .single();

  if (error || !data) {
    console.error('Erro na exclusão lógica de triple_row:', error);
    return false;
  }

  await recordClinicalAudit({
    userId,
    patientId: data.patient_id,
    recordType: 'triple_row',
    recordId: rowId,
    action: 'delete'
  });

  return true;
}

/**
 * Restaura um episódio previamente excluído logicamente (Undo/Desfazer).
 */
export async function restoreTripleRow(
  userId: string,
  rowId: string
): Promise<boolean> {
  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from('triple_rows')
    .update({ deleted_at: null, updated_at: new Date().toISOString() })
    .eq('id', rowId)
    .eq('professional_id', userId)
    .select('id, patient_id')
    .single();

  if (error || !data) {
    return false;
  }

  await recordClinicalAudit({
    userId,
    patientId: data.patient_id,
    recordType: 'triple_row',
    recordId: rowId,
    action: 'update',
    metadata: { restored: true }
  });

  return true;
}

/**
 * Reordena episódios da tríplice contingência.
 */
export async function reorderTripleRows(
  userId: string,
  orderedIds: string[]
): Promise<boolean> {
  const supabase = getSupabaseAdmin();

  try {
    for (let index = 0; index < orderedIds.length; index++) {
      const id = orderedIds[index];
      await supabase
        .from('triple_rows')
        .update({ position: index, updated_at: new Date().toISOString() })
        .eq('id', id)
        .eq('professional_id', userId);
    }
    return true;
  } catch (err) {
    console.error('Erro ao reordenar triple_rows:', err);
    return false;
  }
}

/* =========================================================================
   DIÁRIO DA ANSIEDADE (Seções 4 e 6.2 do PDF)
   ========================================================================= */

/**
 * Cria ou sincroniza um registro de ansiedade vindo do aparelho do paciente.
 * Valida intensidade (0-10) e trava ocorrências superiores a 1h no futuro.
 * client_uuid garante idempotência em sincronização offline.
 */
export async function createOrSyncAnxietyEntry(
  patientId: string,
  entry: Partial<AnxietyEntry> & { client_uuid: string }
): Promise<AnxietyEntry> {
  const supabase = getSupabaseAdmin();

  // Validação 1: Situação é obrigatória
  const situation = (entry.situation || '').trim();
  if (!situation) {
    throw new Error('O campo "situação" é obrigatório.');
  }

  // Validação 2: Intensidade de 0 a 10 obrigatória
  const intensity = Number(entry.intensity);
  if (isNaN(intensity) || intensity < 0 || intensity > 10) {
    throw new Error('A intensidade deve ser um número inteiro entre 0 e 10.');
  }

  // Validação 3: Data e hora - aceitar até 1h à frente (fuso), rejeitar além disso
  const occurredAt = entry.occurred_at ? new Date(entry.occurred_at) : new Date();
  const maxAllowedFuture = new Date(Date.now() + 60 * 60 * 1000);
  if (occurredAt.getTime() > maxAllowedFuture.getTime()) {
    throw new Error('A data e hora do registro não pode ultrapassar 1 hora no futuro.');
  }

  const payload = {
    client_uuid: entry.client_uuid,
    patient_id: patientId,
    occurred_at: occurredAt.toISOString(),
    situation: situation.slice(0, 2000),
    body_thoughts: (entry.body_thoughts || '').slice(0, 2000),
    action_taken: entry.action_taken || { tags: [], free_text: '' },
    aftermath: (entry.aftermath || '').slice(0, 2000),
    intensity: Math.round(intensity),
    value_blocked: (entry.value_blocked || '').slice(0, 500),
    shared: entry.shared !== false, // default true
    updated_at: new Date().toISOString()
  };

  const { data, error } = await supabase
    .from('anxiety_entries')
    .upsert(payload, { onConflict: 'client_uuid' })
    .select('*')
    .single();

  if (error || !data) {
    console.error('Erro ao salvar anxiety_entry:', error);
    throw new Error(error?.message || 'Falha ao salvar registro do diário.');
  }

  return data as AnxietyEntry;
}

/**
 * Busca registros compartilhados de ansiedade para a visão do profissional.
 * Registros com shared = false são NUNCA retornados.
 */
export async function getSharedAnxietyEntriesForPatient(
  userId: string,
  patientId: string,
  options: { sinceLastSessionDate?: string; from?: string; to?: string } = {}
): Promise<AnxietyEntry[]> {
  const supabase = getSupabaseAdmin();

  let query = supabase
    .from('anxiety_entries')
    .select('*')
    .eq('patient_id', patientId)
    .eq('shared', true)
    .is('deleted_at', null)
    .order('occurred_at', { ascending: false });

  if (options.sinceLastSessionDate) {
    query = query.gte('occurred_at', options.sinceLastSessionDate);
  }
  if (options.from) {
    query = query.gte('occurred_at', options.from);
  }
  if (options.to) {
    query = query.lte('occurred_at', options.to);
  }

  const { data, error } = await query;
  if (error) {
    console.error('Erro ao buscar anxiety_entries:', error);
    return [];
  }

  // Registra visualização na auditoria LGPD
  if (data && data.length > 0) {
    await recordClinicalAudit({
      userId,
      patientId,
      recordType: 'anxiety_entry',
      recordId: patientId,
      action: 'view',
      metadata: { count: data.length }
    });
  }

  return (data as AnxietyEntry[]) || [];
}

/**
 * Converte um registro do diário de ansiedade em um episódio da tríplice contingência (Seção 4.3).
 * Mapeamento:
 * - situation -> antecedent
 * - action_taken -> response_action
 * - body_thoughts -> response_thought & response_body
 * - aftermath -> consequence
 * - intensity e value_blocked -> note (observação privada)
 * Garante idempotência: se já convertido, retorna o episódio já criado sem duplicar.
 */
export async function convertAnxietyEntryToTripleRow(
  userId: string,
  entryId: string,
  sessionId: string
): Promise<{ tripleRow: TripleRow; alreadyConverted: boolean }> {
  const supabase = getSupabaseAdmin();

  // 1. Busca o registro do diário
  const { data: entry, error: entryErr } = await supabase
    .from('anxiety_entries')
    .select('*')
    .eq('id', entryId)
    .single();

  if (entryErr || !entry) {
    throw new Error('Registro do diário não encontrado.');
  }

  // 2. Trava de Idempotência: Se já foi convertido, retorna o episódio existente
  if (entry.converted_triple_row_id) {
    const { data: existingRow } = await supabase
      .from('triple_rows')
      .select('*')
      .eq('id', entry.converted_triple_row_id)
      .is('deleted_at', null)
      .maybeSingle();

    if (existingRow) {
      return { tripleRow: existingRow as TripleRow, alreadyConverted: true };
    }
  }

  // 3. Monta o texto consolidado de ação (tags + texto livre)
  const actionData = (entry.action_taken || {}) as { tags?: string[]; free_text?: string };
  const tagsStr = Array.isArray(actionData.tags) && actionData.tags.length > 0 ? actionData.tags.join(', ') : '';
  const freeTextStr = (actionData.free_text || '').trim();
  const actionConsolidado = [tagsStr, freeTextStr].filter(Boolean).join(' - ') || 'Comportamento registrado';

  // 4. Monta a nota privada com intensidade e o valor que ficou de lado
  const noteParts = [
    `[Origem: Diário de Ansiedade] Intensidade: ${entry.intensity}/10`,
    entry.value_blocked ? `O que era importante e ficou de lado: ${entry.value_blocked}` : ''
  ].filter(Boolean);
  const notaPrivada = noteParts.join(' | ');

  // 5. Cria o novo episódio na grade da sessão
  const newEpisode = await createTripleRow(userId, entry.patient_id, sessionId, {
    antecedent: entry.situation,
    response_action: actionConsolidado,
    response_thought: entry.body_thoughts || '',
    response_body: entry.body_thoughts || '',
    consequence: entry.aftermath || '',
    note: notaPrivada,
    source_entry_id: entry.id
  });

  if (!newEpisode) {
    throw new Error('Falha ao criar episódio da tríplice na sessão.');
  }

  // 6. Atualiza o diário com o ID convertido
  await supabase
    .from('anxiety_entries')
    .update({ converted_triple_row_id: newEpisode.id, updated_at: new Date().toISOString() })
    .eq('id', entry.id);

  await recordClinicalAudit({
    userId,
    patientId: entry.patient_id,
    recordType: 'anxiety_entry',
    recordId: entry.id,
    action: 'update',
    metadata: { converted_to_triple_row_id: newEpisode.id }
  });

  return { tripleRow: newEpisode, alreadyConverted: false };
}

/**
 * Exclusão de registro de ansiedade (soft delete).
 * Se o registro já tiver sido convertido em tríplice, a exclusão não apaga a tríplice.
 */
export async function softDeleteAnxietyEntry(
  userId: string,
  entryId: string
): Promise<boolean> {
  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from('anxiety_entries')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', entryId)
    .select('id, patient_id')
    .single();

  if (error || !data) {
    return false;
  }

  await recordClinicalAudit({
    userId,
    patientId: data.patient_id,
    recordType: 'anxiety_entry',
    recordId: entryId,
    action: 'delete'
  });

  return true;
}

/* =========================================================================
   FORMULAÇÃO COMPORTAMENTAL & VERSIONAMENTO (Seções 5 e 6.3 do PDF)
   ========================================================================= */

/**
 * Obtém ou inicializa a versão de trabalho (draft) da formulação do paciente.
 */
export async function getOrCreateDraftFormulation(
  userId: string,
  patientId: string
): Promise<Formulation> {
  const supabase = getSupabaseAdmin();

  // 1. Tenta buscar formulação existente
  const { data: existing } = await supabase
    .from('formulations')
    .select('*')
    .eq('patient_id', patientId)
    .is('deleted_at', null)
    .maybeSingle();

  if (existing) {
    await recordClinicalAudit({
      userId,
      patientId,
      recordType: 'formulation',
      recordId: existing.id,
      action: 'view'
    });
    return existing as Formulation;
  }

  // 2. Se não existir, inicializa rascunho de trabalho
  const initialPayload = {
    patient_id: patientId,
    professional_id: userId,
    demand: '',
    life_context: '',
    history_notes: '',
    functional_hypothesis: '',
    patterns: [],
    goals: [],
    next_tests: [],
    private_notes: '',
    base_version_number: 0
  };

  const { data: created, error } = await supabase
    .from('formulations')
    .insert(initialPayload)
    .select('*')
    .single();

  if (error || !created) {
    console.error('Erro ao criar formulação:', error);
    throw new Error(error?.message || 'Falha ao inicializar formulação.');
  }

  await recordClinicalAudit({
    userId,
    patientId,
    recordType: 'formulation',
    recordId: created.id,
    action: 'create'
  });

  return created as Formulation;
}

/**
 * Atualiza campos da versão de trabalho (draft) da formulação.
 * Versões fechadas nunca são alteradas aqui (imutabilidade na API).
 */
export async function updateDraftFormulation(
  userId: string,
  patientId: string,
  updates: Partial<Formulation>
): Promise<Formulation> {
  const supabase = getSupabaseAdmin();

  const allowedFields: (keyof Formulation)[] = [
    'demand',
    'life_context',
    'history_notes',
    'functional_hypothesis',
    'patterns',
    'goals',
    'next_tests',
    'private_notes'
  ];

  const payload: Record<string, unknown> = {};
  for (const f of allowedFields) {
    if (updates[f] !== undefined) {
      payload[f] = updates[f];
    }
  }

  payload.updated_at = new Date().toISOString();

  const { data, error } = await supabase
    .from('formulations')
    .update(payload)
    .eq('patient_id', patientId)
    .eq('professional_id', userId)
    .is('deleted_at', null)
    .select('*')
    .single();

  if (error || !data) {
    console.error('Erro ao atualizar formulação:', error);
    throw new Error(error?.message || 'Falha ao atualizar versão de trabalho.');
  }

  await recordClinicalAudit({
    userId,
    patientId,
    recordType: 'formulation',
    recordId: data.id,
    action: 'update',
    metadata: { changed_fields: Object.keys(payload) }
  });

  return data as Formulation;
}

/**
 * Fecha uma versão da formulação, congelando um snapshot imutável em formulation_versions (Seção 5.2).
 */
export async function closeFormulationVersion(
  userId: string,
  patientId: string
): Promise<FormulationVersion> {
  const supabase = getSupabaseAdmin();

  // 1. Obtém o draft ativo
  const draft = await getOrCreateDraftFormulation(userId, patientId);

  // 2. Determina o próximo número sequencial de versão
  const { data: lastVersions } = await supabase
    .from('formulation_versions')
    .select('version_number')
    .eq('formulation_id', draft.id)
    .order('version_number', { ascending: false })
    .limit(1);

  const nextVersionNum = (lastVersions && lastVersions[0]?.version_number !== undefined)
    ? lastVersions[0].version_number + 1
    : 1;

  // 3. Monta o retrato (snapshot) completo da versão de trabalho
  const snapshot = {
    demand: draft.demand,
    life_context: draft.life_context,
    history_notes: draft.history_notes,
    functional_hypothesis: draft.functional_hypothesis,
    patterns: draft.patterns,
    goals: draft.goals,
    next_tests: draft.next_tests,
    private_notes: draft.private_notes
  };

  const versionPayload = {
    formulation_id: draft.id,
    patient_id: patientId,
    version_number: nextVersionNum,
    snapshot,
    closed_by: userId,
    closed_at: new Date().toISOString()
  };

  const { data: closedVersion, error: closeErr } = await supabase
    .from('formulation_versions')
    .insert(versionPayload)
    .select('*')
    .single();

  if (closeErr || !closedVersion) {
    console.error('Erro ao fechar versão da formulação:', closeErr);
    throw new Error(closeErr?.message || 'Falha ao congelar versão.');
  }

  // 4. Atualiza a versão base da formulação de trabalho
  await supabase
    .from('formulations')
    .update({ base_version_number: nextVersionNum, updated_at: new Date().toISOString() })
    .eq('id', draft.id);

  await recordClinicalAudit({
    userId,
    patientId,
    recordType: 'formulation',
    recordId: closedVersion.id,
    action: 'create',
    metadata: { version_number: nextVersionNum, formulation_id: draft.id }
  });

  return closedVersion as FormulationVersion;
}

/**
 * Lista todas as versões fechadas para histórico e comparação.
 */
export async function listFormulationVersions(
  userId: string,
  patientId: string
): Promise<FormulationVersion[]> {
  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from('formulation_versions')
    .select('*')
    .eq('patient_id', patientId)
    .is('deleted_at', null)
    .order('version_number', { ascending: false });

  if (error) {
    console.error('Erro ao listar versões da formulação:', error);
    return [];
  }

  return (data as FormulationVersion[]) || [];
}


