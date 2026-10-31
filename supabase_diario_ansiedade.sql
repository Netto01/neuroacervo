-- =========================================================================
-- MIGRAÇÃO: DIÁRIO DA ANSIEDADE SOB O VIÉS DA ANÁLISE DO COMPORTAMENTO (AC)
-- NeuroAcervo · Entrega 2 do Módulo de Registro de Sessões
-- =========================================================================

CREATE TABLE IF NOT EXISTS public.anxiety_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_uuid UUID NOT NULL, -- Gerado no aparelho; garante idempotência do sync offline
  patient_id UUID NOT NULL REFERENCES public.user_patients(id) ON DELETE CASCADE,

  -- 1. Data e hora do episódio (ocorrência real)
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),

  -- 2. Contexto antecedente (situação)
  situation TEXT NOT NULL,

  -- 3. Sensações e pensamentos na hora (classe de respostas)
  body_thoughts TEXT DEFAULT '',

  -- 4. O que fez na hora: ação observável / esquiva / enfrentamento
  -- Armazenado como JSONB estruturado: { "tags": string[], "free_text": string }
  action_taken JSONB NOT NULL DEFAULT '{"tags": [], "free_text": ""}'::jsonb,

  -- 5. O que aconteceu depois (consequência)
  aftermath TEXT DEFAULT '',

  -- 6. Intensidade com constraint rígida de 0 a 10
  intensity SMALLINT NOT NULL CHECK (intensity >= 0 AND intensity <= 10),

  -- 7. Valor que ficou de lado (o que era importante para o paciente)
  value_blocked TEXT DEFAULT '',

  -- 8. Compartilhado com o profissional
  shared BOOLEAN NOT NULL DEFAULT true,

  -- 9. Vínculo de conversão idempotente em episódio da tríplice contingência
  converted_triple_row_id UUID REFERENCES public.triple_rows(id) ON DELETE SET NULL DEFAULT NULL,

  -- Timestamps e exclusão lógica
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  deleted_at TIMESTAMPTZ DEFAULT NULL,

  CONSTRAINT uq_anxiety_client_uuid UNIQUE (client_uuid)
);

-- Trigger para updated_at automático
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

-- Habilita RLS
ALTER TABLE public.anxiety_entries ENABLE ROW LEVEL SECURITY;

-- Política 1: Profissional visualiza apenas registros liberados (shared = true) de seus pacientes
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

-- Política 2: Profissional pode atualizar vínculo de conversão (converted_triple_row_id)
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

-- Política 3: Paciente gerencia seus próprios registros (criar, editar, excluir)
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

-- Índices de performance
CREATE INDEX IF NOT EXISTS idx_anxiety_patient_occurred ON public.anxiety_entries (patient_id, occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_anxiety_shared ON public.anxiety_entries (patient_id, shared) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_anxiety_conversion ON public.anxiety_entries (converted_triple_row_id);
CREATE INDEX IF NOT EXISTS idx_anxiety_intensity ON public.anxiety_entries (patient_id, intensity);

GRANT ALL ON public.anxiety_entries TO authenticated;
GRANT ALL ON public.anxiety_entries TO service_role;
