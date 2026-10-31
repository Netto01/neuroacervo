export interface TripleRow {
  id: string;
  session_id: string;
  patient_id: string;
  professional_id: string;
  antecedent: string;
  response_action: string;
  response_thought: string;
  response_body: string;
  consequence: string;
  effect_short: string;
  effect_long: string;
  note?: string; // Observação privada do profissional
  source_entry_id?: string | null;
  position: number;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

export type AuditAction = 'view' | 'create' | 'update' | 'delete' | 'export';
export type AuditRecordType = 'triple_row' | 'anxiety_entry' | 'formulation';

export interface ClinicalAuditLog {
  id: string;
  user_id: string;
  patient_id?: string | null;
  record_type: AuditRecordType;
  record_id: string;
  action: AuditAction;
  metadata?: Record<string, unknown>;
  created_at: string;
}

export interface ActionTakenData {
  tags: string[];
  free_text: string;
}

export interface AnxietyEntry {
  id: string;
  client_uuid: string;
  patient_id: string;
  occurred_at: string;
  situation: string;
  body_thoughts?: string;
  action_taken: ActionTakenData;
  aftermath?: string;
  intensity: number; // 0 a 10
  value_blocked?: string;
  shared: boolean;
  converted_triple_row_id?: string | null;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

export interface FormulationPatternItem {
  id: string;
  title: string;
  description?: string;
  triple_row_ids: string[];
}

export interface FormulationGoalItem {
  id: string;
  text: string;
  status: 'ativo' | 'alcançado' | 'abandonado';
  status_date: string;
}

export interface Formulation {
  id: string;
  patient_id: string;
  professional_id: string;
  demand: string;
  life_context: string;
  history_notes: string;
  functional_hypothesis: string;
  patterns: FormulationPatternItem[];
  goals: FormulationGoalItem[];
  next_tests: string[];
  private_notes: string;
  base_version_number: number;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

export interface FormulationVersion {
  id: string;
  formulation_id: string;
  patient_id: string;
  version_number: number;
  snapshot: Partial<Formulation>;
  closed_at: string;
  closed_by: string;
  created_at: string;
  updated_at?: string;
}


