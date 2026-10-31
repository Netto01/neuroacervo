-- =========================================================================
-- NEUROACERVO · MÓDULO CLÍNICO COMPLETO (ANÁLISE DO COMPORTAMENTO)
-- Script unificado para execução no Supabase SQL Editor
-- Inclui:
--   1. clinical_audit_logs (Auditoria de Acesso LGPD)
--   2. triple_rows (Grade da Tríplice Contingência)
--   3. anxiety_entries (Diário de Ansiedade)
--   4. formulations (Formulação Comportamental Viva)
--   5. formulation_versions (Snapshots Imutáveis de Versões)
-- =========================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =========================================================================
-- 1. AUDITORIA LGPD (clinical_audit_logs)
-- Registra data/hora, usuário, ação e IDs, SEM armazenar texto clínico sensível
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.clinical_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  patient_id UUID REFERENCES public.user_patients(id) ON DELETE SET NULL,
  record_type TEXT NOT NULL, -- 'triple_row', 'anxiety_entry', 'formulation'
  record_id UUID NOT NULL,
  action TEXT NOT NULL,      -- 'view', 'create', 'update', 'delete', 'export'
  metadata JSONB DEFAULT '{}'::jsonb, -- IDs, contadores, timestamps
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.clinical_audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Profissional insere auditoria de suas ações" ON public.clinical_audit_logs;
CREATE POLICY "Profissional insere auditoria de suas ações"
  ON public.clinical_audit_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Profissional lê auditoria de seus pacientes" ON public.clinical_audit_logs;
CREATE POLICY "Profissional lê auditoria de seus pacientes"
  ON public.clinical_audit_logs
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_audit_user_created ON public.clinical_audit_logs (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_record ON public.clinical_audit_logs (record_type, record_id);

GRANT ALL ON public.clinical_audit_logs TO authenticated;
GRANT ALL ON public.clinical_audit_logs TO service_role;


-- =========================================================================
-- 2. TRÍPLICE CONTINGÊNCIA (triple_rows)
-- Episódios comportamentais (A -> R -> C -> E) com nota privada
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.triple_rows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.user_interactive_sessions(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES public.user_patients(id) ON DELETE CASCADE,
  professional_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Tríplice Contingência (AC)
  antecedent TEXT DEFAULT '',
  response_action TEXT DEFAULT '',
  response_thought TEXT DEFAULT '',
  response_body TEXT DEFAULT '',
  consequence TEXT DEFAULT '',
  effect_short TEXT DEFAULT '',
  effect_long TEXT DEFAULT '',

  -- Observação privada do profissional (sigilosa, nunca visível ao paciente)
  note TEXT DEFAULT '',

  -- Vínculo com registro do diário de ansiedade
  source_entry_id UUID DEFAULT NULL,

  -- Posição do episódio na grade
  position INT NOT NULL DEFAULT 0,

  -- Timestamps e soft delete
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  deleted_at TIMESTAMPTZ DEFAULT NULL
);

-- Trigger de updated_at para triple_rows
CREATE OR REPLACE FUNCTION public.handle_triple_rows_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_triple_rows_updated_at ON public.triple_rows;
CREATE TRIGGER tr_triple_rows_updated_at
  BEFORE UPDATE ON public.triple_rows
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_triple_rows_updated_at();

ALTER TABLE public.triple_rows ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Profissional gerencia suas próprias tríplices" ON public.triple_rows;
CREATE POLICY "Profissional gerencia suas próprias tríplices"
  ON public.triple_rows
  FOR ALL
  TO authenticated
  USING (auth.uid() = professional_id)
  WITH CHECK (auth.uid() = professional_id);

CREATE INDEX IF NOT EXISTS idx_triple_rows_session ON public.triple_rows (session_id, position) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_triple_rows_patient ON public.triple_rows (patient_id, session_id);
CREATE INDEX IF NOT EXISTS idx_triple_rows_professional ON public.triple_rows (professional_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_triple_rows_source_entry ON public.triple_rows (source_entry_id) WHERE source_entry_id IS NOT NULL;

GRANT ALL ON public.triple_rows TO authenticated;
GRANT ALL ON public.triple_rows TO service_role;


-- =========================================================================
-- 3. DIÁRIO DA ANSIEDADE (anxiety_entries)
-- Registros do paciente sob o viés da Análise do Comportamento
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.anxiety_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_uuid UUID NOT NULL, -- UUID do cliente para idempotência de sync offline
  patient_id UUID NOT NULL REFERENCES public.user_patients(id) ON DELETE CASCADE,

  -- 1. Data e hora real do episódio
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),

  -- 2. Contexto antecedente (situação)
  situation TEXT NOT NULL,

  -- 3. Sensações e pensamentos na hora (classe de respostas)
  body_thoughts TEXT DEFAULT '',

  -- 4. O que fez na hora: ação observável / esquiva / enfrentamento
  action_taken JSONB NOT NULL DEFAULT '{"tags": [], "free_text": ""}'::jsonb,

  -- 5. O que aconteceu depois (consequência)
  aftermath TEXT DEFAULT '',

  -- 6. Intensidade de 0 a 10
  intensity SMALLINT NOT NULL CHECK (intensity >= 0 AND intensity <= 10),

  -- 7. Valor que ficou de lado
  value_blocked TEXT DEFAULT '',

  -- 8. Compartilhado com o terapeuta
  shared BOOLEAN NOT NULL DEFAULT true,

  -- 9. Conversão idempotente em episódio da tríplice
  converted_triple_row_id UUID REFERENCES public.triple_rows(id) ON DELETE SET NULL DEFAULT NULL,

  -- Timestamps e soft delete
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  deleted_at TIMESTAMPTZ DEFAULT NULL,

  CONSTRAINT uq_anxiety_client_uuid UNIQUE (client_uuid)
);

-- Trigger de updated_at para anxiety_entries
CREATE OR REPLACE FUNCTION public.handle_anxiety_entries_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_anxiety_entries_updated_at ON public.anxiety_entries;
CREATE TRIGGER tr_anxiety_entries_updated_at
  BEFORE UPDATE ON public.anxiety_entries
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_anxiety_entries_updated_at();

ALTER TABLE public.anxiety_entries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Profissional lê registros compartilhados de seus pacientes" ON public.anxiety_entries;
CREATE POLICY "Profissional lê registros compartilhados de seus pacientes"
  ON public.anxiety_entries
  FOR SELECT
  TO authenticated
  USING (
    shared = true
    AND deleted_at IS NULL
    AND patient_id IN (
      SELECT id FROM public.user_patients WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Profissional atualiza conversão de registros de seus pacientes" ON public.anxiety_entries;
CREATE POLICY "Profissional atualiza conversão de registros de seus pacientes"
  ON public.anxiety_entries
  FOR UPDATE
  TO authenticated
  USING (
    patient_id IN (
      SELECT id FROM public.user_patients WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    patient_id IN (
      SELECT id FROM public.user_patients WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Paciente ou profissional gerenciam seus registros" ON public.anxiety_entries;
CREATE POLICY "Paciente ou profissional gerenciam seus registros"
  ON public.anxiety_entries
  FOR ALL
  TO authenticated
  USING (
    patient_id IN (
      SELECT id FROM public.user_patients WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    patient_id IN (
      SELECT id FROM public.user_patients WHERE user_id = auth.uid()
    )
  );

CREATE INDEX IF NOT EXISTS idx_anxiety_patient_occurred ON public.anxiety_entries (patient_id, occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_anxiety_shared ON public.anxiety_entries (patient_id, shared) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_anxiety_conversion ON public.anxiety_entries (converted_triple_row_id);
CREATE INDEX IF NOT EXISTS idx_anxiety_intensity ON public.anxiety_entries (patient_id, intensity);

GRANT ALL ON public.anxiety_entries TO authenticated;
GRANT ALL ON public.anxiety_entries TO service_role;


-- =========================================================================
-- 4. FORMULAÇÃO COMPORTAMENTAL VIVA (formulations)
-- Versão única e dinâmica de trabalho por paciente
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.formulations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES public.user_patients(id) ON DELETE CASCADE,
  professional_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  demand TEXT DEFAULT '',
  life_context TEXT DEFAULT '',
  history_notes TEXT DEFAULT '',
  functional_hypothesis TEXT DEFAULT '',

  patterns JSONB NOT NULL DEFAULT '[]'::jsonb,
  goals JSONB NOT NULL DEFAULT '[]'::jsonb,
  next_tests JSONB NOT NULL DEFAULT '[]'::jsonb,

  -- Notas sigilosas (nunca no relatório do paciente)
  private_notes TEXT DEFAULT '',

  base_version_number INT NOT NULL DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  deleted_at TIMESTAMPTZ DEFAULT NULL,

  CONSTRAINT uq_formulation_patient UNIQUE (patient_id)
);

CREATE OR REPLACE FUNCTION public.handle_formulations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_formulations_updated_at ON public.formulations;
CREATE TRIGGER tr_formulations_updated_at
  BEFORE UPDATE ON public.formulations
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_formulations_updated_at();

ALTER TABLE public.formulations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Profissional gerencia suas formulações" ON public.formulations;
CREATE POLICY "Profissional gerencia suas formulações"
  ON public.formulations
  FOR ALL
  TO authenticated
  USING (auth.uid() = professional_id)
  WITH CHECK (auth.uid() = professional_id);

CREATE INDEX IF NOT EXISTS idx_formulations_patient ON public.formulations (patient_id);
CREATE INDEX IF NOT EXISTS idx_formulations_professional ON public.formulations (professional_id);

GRANT ALL ON public.formulations TO authenticated;
GRANT ALL ON public.formulations TO service_role;


-- =========================================================================
-- 5. VERSÕES FECHADAS DE FORMULAÇÃO (formulation_versions)
-- Snapshots imutáveis e auditáveis com histórico de evolução
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.formulation_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  formulation_id UUID NOT NULL REFERENCES public.formulations(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES public.user_patients(id) ON DELETE CASCADE,
  version_number INT NOT NULL,
  snapshot JSONB NOT NULL,
  closed_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  closed_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  deleted_at TIMESTAMPTZ DEFAULT NULL,

  CONSTRAINT uq_formulation_version UNIQUE (formulation_id, version_number)
);

ALTER TABLE public.formulation_versions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Profissional visualiza e cria versões de suas formulações" ON public.formulation_versions;
CREATE POLICY "Profissional visualiza e cria versões de suas formulações"
  ON public.formulation_versions
  FOR ALL
  TO authenticated
  USING (auth.uid() = closed_by)
  WITH CHECK (auth.uid() = closed_by);

CREATE INDEX IF NOT EXISTS idx_form_versions_form ON public.formulation_versions (formulation_id, version_number DESC);
CREATE INDEX IF NOT EXISTS idx_form_versions_patient ON public.formulation_versions (patient_id);

GRANT ALL ON public.formulation_versions TO authenticated;
GRANT ALL ON public.formulation_versions TO service_role;
