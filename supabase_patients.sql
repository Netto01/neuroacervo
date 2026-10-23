-- =========================================================================
-- TABELA DE PACIENTES: NEUROACERVO (DOSSIÊ CLÍNICO)
-- =========================================================================
-- Armazena o cadastro seguro de pacientes e notas internas por profissional.
-- Cada psicólogo tem acesso estrito apenas aos seus próprios pacientes (RLS).
-- =========================================================================

CREATE TABLE IF NOT EXISTS public.user_patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  code TEXT NOT NULL,                                  -- Código/Prontuário (ex: 'Paciente 01', 'P-014', 'M.S.')
  note TEXT DEFAULT '',                                -- Anotação interna do caso
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  CONSTRAINT uq_user_patient_code UNIQUE (user_id, code)
);

-- Trigger para updated_at automático
CREATE OR REPLACE FUNCTION public.handle_user_patients_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_user_patients_updated_at ON public.user_patients;
CREATE TRIGGER tr_user_patients_updated_at
  BEFORE UPDATE ON public.user_patients
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_user_patients_updated_at();

-- Habilita Row Level Security (RLS) para sigilo profissional rigoroso
ALTER TABLE public.user_patients ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Profissionais gerenciam apenas seus próprios pacientes" ON public.user_patients;
CREATE POLICY "Profissionais gerenciam apenas seus próprios pacientes"
  ON public.user_patients
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Índices de consulta rápida
CREATE INDEX IF NOT EXISTS idx_user_patients_user_code ON public.user_patients (user_id, code);
CREATE INDEX IF NOT EXISTS idx_user_patients_user_updated ON public.user_patients (user_id, updated_at DESC);

-- Permissões
GRANT ALL ON public.user_patients TO authenticated;
GRANT ALL ON public.user_patients TO service_role;
