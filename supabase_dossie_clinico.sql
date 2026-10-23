-- =========================================================================
-- MIGRAÇÃO CONSOLIDADA: DOSSIÊ CLÍNICO & SESSÕES INTERATIVAS
-- NeuroAcervo · Evoluções, Dramatizações, Histórias Clínicas & Pacientes
-- =========================================================================
-- Execute este script no SQL Editor do seu projeto Supabase.
-- É 100% idempotente (pode ser executado múltiplas vezes com segurança sem
-- perder dados pré-existentes).
-- =========================================================================

-- 1. Habilitar extensões necessárias para UUID e criptografia
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =========================================================================
-- TABELA 1: user_patients (Cadastro de Casos e Pacientes desidentificados)
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.user_patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  code TEXT NOT NULL,                                  -- Código CFP (ex: 'Paciente 01', 'P-014', 'M.S.')
  note TEXT DEFAULT '',                                -- Anotação clínica interna / demanda terapêutica
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  CONSTRAINT uq_user_patient_code UNIQUE (user_id, code)
);

-- Trigger para updated_at automático em user_patients
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

-- RLS (Row Level Security): Sigilo profissional estrito por psicólogo
ALTER TABLE public.user_patients ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Profissionais gerenciam apenas seus próprios pacientes" ON public.user_patients;
CREATE POLICY "Profissionais gerenciam apenas seus próprios pacientes"
  ON public.user_patients
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Índices otimizados para busca e ordenação no Dossiê
CREATE INDEX IF NOT EXISTS idx_user_patients_user_code 
  ON public.user_patients (user_id, code);

CREATE INDEX IF NOT EXISTS idx_user_patients_user_updated 
  ON public.user_patients (user_id, updated_at DESC);

GRANT ALL ON public.user_patients TO authenticated;
GRANT ALL ON public.user_patients TO service_role;


-- =========================================================================
-- TABELA 2: user_interactive_sessions (Timeline do Dossiê Clínico)
-- Integra:
-- - 'evolucao'     : Registro e evolução estruturada de atendimento (Sessão 1, 2, 3...)
-- - 'dramatizacao' : Debates da arena de crenças e troca de papéis
-- - 'historia'     : Casos clínicos com etapas estruturadas
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.user_interactive_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  resource_type TEXT NOT NULL,                         -- 'evolucao', 'dramatizacao', 'historia'
  resource_id TEXT NOT NULL,                           -- ex: 'sessao_1', 'arena', 'f1_1'
  patient_code TEXT NOT NULL DEFAULT 'Paciente 01',     -- Código do paciente vinculado
  data JSONB NOT NULL DEFAULT '{}'::jsonb,             -- Conteúdo estruturado completo
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  CONSTRAINT uq_user_interactive_session UNIQUE (user_id, resource_type, resource_id, patient_code)
);

-- Trigger para updated_at automático em user_interactive_sessions
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

-- RLS: Acesso exclusivo do profissional autenticado
ALTER TABLE public.user_interactive_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Usuários gerenciam suas próprias sessões interativas" ON public.user_interactive_sessions;
CREATE POLICY "Usuários gerenciam suas próprias sessões interativas" 
  ON public.user_interactive_sessions 
  FOR ALL 
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Índices de alta performance
CREATE INDEX IF NOT EXISTS idx_user_sessions_lookup 
  ON public.user_interactive_sessions(user_id, resource_type, resource_id);

CREATE INDEX IF NOT EXISTS idx_user_sessions_patient 
  ON public.user_interactive_sessions(user_id, patient_code);

CREATE INDEX IF NOT EXISTS idx_user_sessions_updated 
  ON public.user_interactive_sessions(user_id, updated_at DESC);

-- Índice GIN no campo JSONB para buscas textuais e filtros avançados instantâneos
CREATE INDEX IF NOT EXISTS idx_user_sessions_data_gin 
  ON public.user_interactive_sessions USING gin (data);

GRANT ALL ON public.user_interactive_sessions TO authenticated;
GRANT ALL ON public.user_interactive_sessions TO service_role;

-- =========================================================================
-- FIM DA MIGRAÇÃO
-- =========================================================================
