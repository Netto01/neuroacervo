-- =========================================================================
-- MIGRAÇÃO: TABELA DE SESSÕES INTERATIVAS E ANOTAÇÕES POR PACIENTE (SUPABASE)
-- =========================================================================
-- Permite que psicólogos salvem anotações, termômetros, pensamentos alternativos
-- e respostas de histórias clínicas e baralhos, organizados por paciente / caso.
-- =========================================================================

CREATE TABLE IF NOT EXISTS public.user_interactive_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  resource_type TEXT NOT NULL DEFAULT 'historia', -- 'historia' ou 'baralho'
  resource_id TEXT NOT NULL,                     -- ex: 'f1_1' para Faixa 1, História 1
  patient_code TEXT NOT NULL DEFAULT 'Paciente 01', -- Iniciais, código ou apelido (ex: 'M.S.')
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, resource_type, resource_id, patient_code)
);

-- Ativa Row Level Security (RLS) para proteger o sigilo dos dados do profissional
ALTER TABLE public.user_interactive_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Usuários gerenciam suas próprias sessões interativas" ON public.user_interactive_sessions;
CREATE POLICY "Usuários gerenciam suas próprias sessões interativas" 
  ON public.user_interactive_sessions FOR ALL 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Índices para busca ultrarrápida
CREATE INDEX IF NOT EXISTS idx_user_sessions_lookup 
  ON public.user_interactive_sessions(user_id, resource_type, resource_id);

CREATE INDEX IF NOT EXISTS idx_user_sessions_patient 
  ON public.user_interactive_sessions(user_id, patient_code);
