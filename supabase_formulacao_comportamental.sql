-- =========================================================================
-- MIGRAÇÃO: GRADE DE FORMULAÇÃO COMPORTAMENTAL (AC) & VERSIONAMENTO
-- NeuroAcervo · Entrega 3 do Módulo de Registro de Sessões
-- =========================================================================

-- 1. TABELA DE FORMULAÇÃO VIVA (VERSÃO DE TRABALHO / DRAFT)
-- Uma única formulação ativa por paciente e tratamento (Seção 6.3 do PDF).
CREATE TABLE IF NOT EXISTS public.formulations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES public.user_patients(id) ON DELETE CASCADE,
  professional_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Campos principais
  demand TEXT DEFAULT '',
  life_context TEXT DEFAULT '',
  history_notes TEXT DEFAULT '',
  functional_hypothesis TEXT DEFAULT '',

  -- Listas estruturadas
  patterns JSONB NOT NULL DEFAULT '[]'::jsonb, -- Itens com triple_row_ids[] vinculados
  goals JSONB NOT NULL DEFAULT '[]'::jsonb,    -- Itens com { text, status: 'ativo'|'alcançado'|'abandonado', date }
  next_tests JSONB NOT NULL DEFAULT '[]'::jsonb, -- Lista de hipóteses/testes a aplicar

  -- Observações privadas do profissional (NUNCA compartilhadas com o paciente)
  private_notes TEXT DEFAULT '',

  -- Controle de versão base da versão de trabalho
  base_version_number INT NOT NULL DEFAULT 0,

  -- Timestamps e exclusão lógica
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  deleted_at TIMESTAMPTZ DEFAULT NULL,

  CONSTRAINT uq_formulation_patient UNIQUE (patient_id)
);

-- Trigger para updated_at automático em formulations
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

-- RLS para formulations
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


-- 2. TABELA DE VERSÕES FECHADAS E IMUTÁVEIS (formulation_versions)
CREATE TABLE IF NOT EXISTS public.formulation_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  formulation_id UUID NOT NULL REFERENCES public.formulations(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES public.user_patients(id) ON DELETE CASCADE,
  version_number INT NOT NULL,
  snapshot JSONB NOT NULL, -- Retrato completo imutável de todos os campos
  closed_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  closed_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  deleted_at TIMESTAMPTZ DEFAULT NULL,

  CONSTRAINT uq_formulation_version UNIQUE (formulation_id, version_number)
);

-- RLS para formulation_versions: Leitura e inserção apenas, edições bloqueadas
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
