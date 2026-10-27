-- ==============================================================================
-- NeuroAcervo — Tabela de Leads do Fluxo "Presente: Escalas"
-- 
-- Como executar:
-- 1. Acesse o painel do Supabase: https://supabase.com/dashboard/
-- 2. Selecione seu projeto -> Menu lateral "SQL Editor" -> "+ New Query"
-- 3. Cole todo este código e clique em "Run" (botão verde)
-- ==============================================================================

-- 1. Criar tabela de leads_presente
CREATE TABLE IF NOT EXISTS public.leads_presente (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  nome TEXT DEFAULT '',
  consentimento BOOLEAN NOT NULL DEFAULT true,
  data_consentimento TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  origem TEXT DEFAULT 'modal-presente',
  utm_source TEXT DEFAULT '',
  utm_medium TEXT DEFAULT '',
  utm_campaign TEXT DEFAULT '',
  utm_content TEXT DEFAULT '',
  user_agent TEXT DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Ativar Row Level Security (RLS)
ALTER TABLE public.leads_presente ENABLE ROW LEVEL SECURITY;

-- 3. Políticas de segurança (RLS)
-- Permitir inserção de novos leads (público / visitantes)
DROP POLICY IF EXISTS "Permitir inserção anônima de leads" ON public.leads_presente;
CREATE POLICY "Permitir inserção anônima de leads"
  ON public.leads_presente FOR INSERT
  WITH CHECK (true);

-- Permitir atualização do próprio lead caso o email já exista
DROP POLICY IF EXISTS "Permitir atualização anônima por email de leads" ON public.leads_presente;
CREATE POLICY "Permitir atualização anônima por email de leads"
  ON public.leads_presente FOR UPDATE
  USING (true);

-- Permitir leitura apenas para administradores
DROP POLICY IF EXISTS "Apenas admins podem visualizar leads" ON public.leads_presente;
CREATE POLICY "Apenas admins podem visualizar leads"
  ON public.leads_presente FOR SELECT
  USING (
    coalesce((auth.jwt() -> 'user_metadata' ->> 'role'), '') = 'admin'
    OR EXISTS (
      SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- 4. Índices para performance
CREATE INDEX IF NOT EXISTS idx_leads_presente_email ON public.leads_presente(email);
CREATE INDEX IF NOT EXISTS idx_leads_presente_created_at ON public.leads_presente(created_at DESC);
