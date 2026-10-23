-- =========================================================================
-- MIGRAÇÃO DEFINITIVA: SESSÕES INTERATIVAS NO SUPABASE
-- NeuroAcervo: Histórias Clínicas, Dramatização dos Dois Lados & Baralhos
-- =========================================================================
-- Permite que psicólogos armazenem com segurança:
-- 1. Histórias Clínicas: notas das etapas (Observar, Pensar, Agir),
--    termômetros emocionais, taxas de crença e respostas customizadas.
-- 2. Dramatização dos Dois Lados: pensamento-alvo, emoções, debates da arena
--    (falas negativas e racionais com tags), trocas de papéis e reflexões.
-- =========================================================================

-- 1. Habilita extensões necessárias
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Criação da tabela unificada com JSONB flexível
CREATE TABLE IF NOT EXISTS public.user_interactive_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  resource_type TEXT NOT NULL DEFAULT 'historia', -- 'historia', 'dramatizacao', 'baralho'
  resource_id TEXT NOT NULL DEFAULT 'arena',      -- ex: 'f1_1', 'f2_3' ou 'arena' / 'default'
  patient_code TEXT NOT NULL DEFAULT 'Paciente 01', -- Iniciais ou código (ex: 'M.S.', 'Paciente 01')
  data JSONB NOT NULL DEFAULT '{}'::jsonb,        -- Todo o estado da sessão (falas, notas, termômetros)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  CONSTRAINT uq_user_interactive_session UNIQUE(user_id, resource_type, resource_id, patient_code)
);

-- 3. Função e trigger para manter updated_at sempre atualizado automaticamente
CREATE OR REPLACE FUNCTION public.handle_user_interactive_sessions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_user_interactive_sessions_updated_at ON public.user_interactive_sessions;
CREATE TRIGGER tr_user_interactive_sessions_updated_at
  BEFORE UPDATE ON public.user_interactive_sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_user_interactive_sessions_updated_at();

-- 4. Habilita Row Level Security (RLS) para sigilo profissional rigoroso
ALTER TABLE public.user_interactive_sessions ENABLE ROW LEVEL SECURITY;

-- 5. Políticas de Segurança (RLS): cada usuário só acessa e altera seus próprios dados
DROP POLICY IF EXISTS "Usuários gerenciam suas próprias sessões interativas" ON public.user_interactive_sessions;
DROP POLICY IF EXISTS "Users can read own interactive sessions" ON public.user_interactive_sessions;
DROP POLICY IF EXISTS "Users can insert own interactive sessions" ON public.user_interactive_sessions;
DROP POLICY IF EXISTS "Users can update own interactive sessions" ON public.user_interactive_sessions;
DROP POLICY IF EXISTS "Users can delete own interactive sessions" ON public.user_interactive_sessions;

CREATE POLICY "Usuários gerenciam suas próprias sessões interativas" 
  ON public.user_interactive_sessions 
  FOR ALL 
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 6. Índices para performance instantânea de busca e ordenação
CREATE INDEX IF NOT EXISTS idx_user_sessions_lookup 
  ON public.user_interactive_sessions(user_id, resource_type, resource_id);

CREATE INDEX IF NOT EXISTS idx_user_sessions_patient 
  ON public.user_interactive_sessions(user_id, patient_code);

CREATE INDEX IF NOT EXISTS idx_user_sessions_updated 
  ON public.user_interactive_sessions(user_id, updated_at DESC);

-- 7. Garante permissões adequadas
GRANT ALL ON public.user_interactive_sessions TO authenticated;
GRANT ALL ON public.user_interactive_sessions TO service_role;

-- =========================================================================
-- 8. Tabela dedicada de pacientes por profissional (Dossiê Clínico)
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.user_patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  note TEXT DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  CONSTRAINT uq_user_patient_code UNIQUE (user_id, code)
);

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

ALTER TABLE public.user_patients ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Profissionais gerenciam apenas seus próprios pacientes" ON public.user_patients;
CREATE POLICY "Profissionais gerenciam apenas seus próprios pacientes"
  ON public.user_patients
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_user_patients_user_code ON public.user_patients (user_id, code);
CREATE INDEX IF NOT EXISTS idx_user_patients_user_updated ON public.user_patients (user_id, updated_at DESC);

GRANT ALL ON public.user_patients TO authenticated;
GRANT ALL ON public.user_patients TO service_role;

