-- =========================================================================
-- MIGRAÇÃO: GRADE DA TRÍPLICE CONTINGÊNCIA & AUDITORIA LGPD
-- NeuroAcervo · Módulo de Registro de Sessões (Análise do Comportamento)
-- =========================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. TABELA DE AUDITORIA DE ACESSO (LGPD - Seção 7.1)
-- Somente leitura de dados, registra data/hora, usuário, ação e IDs,
-- NUNCA gravando conteúdo textual clínico sensível.
CREATE TABLE IF NOT EXISTS public.clinical_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  patient_id UUID REFERENCES public.user_patients(id) ON DELETE SET NULL,
  record_type TEXT NOT NULL, -- 'triple_row', 'anxiety_entry', 'formulation'
  record_id UUID NOT NULL,
  action TEXT NOT NULL,      -- 'view', 'create', 'update', 'delete', 'export'
  metadata JSONB DEFAULT '{}'::jsonb, -- Apenas IDs, contadores, timestamps
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


-- 2. TABELA DE EPISÓDIOS DA TRÍPLICE CONTINGÊNCIA (triple_rows)
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

  -- Observação privada do profissional (nunca exibida ao paciente)
  note TEXT DEFAULT '',

  -- Vínculo com registro do diário de ansiedade (origem rastreável idempotente)
  source_entry_id UUID DEFAULT NULL,

  -- Ordem e posicionamento na grade
  position INT NOT NULL DEFAULT 0,

  -- Timestamps e exclusão lógica
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  deleted_at TIMESTAMPTZ DEFAULT NULL
);

-- Trigger para updated_at automático
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

-- RLS: Sigilo absoluto entre profissionais
ALTER TABLE public.triple_rows ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Profissional gerencia suas próprias tríplices" ON public.triple_rows;
CREATE POLICY "Profissional gerencia suas próprias tríplices"
  ON public.triple_rows
  FOR ALL
  TO authenticated
  USING (auth.uid() = professional_id)
  WITH CHECK (auth.uid() = professional_id);

-- Índices de consulta rápida
CREATE INDEX IF NOT EXISTS idx_triple_rows_session ON public.triple_rows (session_id, position) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_triple_rows_patient ON public.triple_rows (patient_id, session_id);
CREATE INDEX IF NOT EXISTS idx_triple_rows_professional ON public.triple_rows (professional_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_triple_rows_source_entry ON public.triple_rows (source_entry_id) WHERE source_entry_id IS NOT NULL;

GRANT ALL ON public.triple_rows TO authenticated;
GRANT ALL ON public.triple_rows TO service_role;
