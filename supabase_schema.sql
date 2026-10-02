-- ==============================================================================
-- NeuroAcervo — Esquema Completo do Banco de Dados (Supabase PostgreSQL)
-- Cole e execute este script no "SQL Editor" do seu painel Supabase:
-- https://supabase.com/dashboard/project/zvobmczvkbsugiiaehvz/sql
-- ==============================================================================

-- 1. Habilitar extensão UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Tabela de Perfis de Usuário (vinculada ao auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL DEFAULT '',
  crp TEXT DEFAULT '',
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('member', 'admin')),
  plan TEXT NOT NULL DEFAULT 'Membro Anual Pro',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Ativar RLS em profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários podem visualizar seu próprio perfil" 
  ON public.profiles FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Usuários podem atualizar seu próprio perfil" 
  ON public.profiles FOR UPDATE 
  USING (auth.uid() = id);

-- 3. Tabela de Materiais, Instrumentos e Laudos
CREATE TABLE IF NOT EXISTS public.materials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  subtitle TEXT DEFAULT '',
  description TEXT DEFAULT '',
  type TEXT NOT NULL CHECK (type IN (
    'instrumento_rastreio',
    'guia_rapido',
    'modelo_laudo',
    'entrevista_anamnese',
    'compendio_estudo',
    'tabela_normativa'
  )),
  domains TEXT[] NOT NULL DEFAULT '{}',
  age_groups TEXT[] NOT NULL DEFAULT '{}',
  estimated_time TEXT DEFAULT '',
  target_population TEXT DEFAULT '',
  satepsi_restricted BOOLEAN NOT NULL DEFAULT false,
  download_format TEXT NOT NULL DEFAULT 'PDF' CHECK (download_format IN ('PDF', 'DOCX', 'XLSX', 'ZIP')),
  download_size TEXT NOT NULL DEFAULT '1.5 MB',
  download_url TEXT DEFAULT '',
  author_reference TEXT DEFAULT '',
  clinical_utility TEXT DEFAULT '',
  cutoffs_snippet JSONB DEFAULT '[]'::jsonb,
  key_instructions TEXT[] DEFAULT '{}',
  is_featured BOOLEAN NOT NULL DEFAULT false,
  is_popular BOOLEAN NOT NULL DEFAULT false,
  published_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Ativar RLS em materials
ALTER TABLE public.materials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Membros autenticados podem visualizar materiais" 
  ON public.materials FOR SELECT 
  TO authenticated 
  USING (true);

CREATE POLICY "Público pode visualizar prévia dos materiais" 
  ON public.materials FOR SELECT 
  TO anon 
  USING (true);

-- 4. Tabela de Módulos de Videoaulas
CREATE TABLE IF NOT EXISTS public.modules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  subtitle TEXT DEFAULT '',
  description TEXT DEFAULT '',
  order_index INTEGER NOT NULL DEFAULT 1,
  level TEXT NOT NULL DEFAULT 'Essencial' CHECK (level IN ('Essencial', 'Intermediário', 'Avançado')),
  thumbnail_url TEXT DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Módulos visíveis para usuários autenticados" 
  ON public.modules FOR SELECT 
  TO authenticated 
  USING (true);

-- 5. Tabela de Videoaulas
CREATE TABLE IF NOT EXISTS public.lessons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  module_id UUID NOT NULL REFERENCES public.modules(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  duration_minutes INTEGER NOT NULL DEFAULT 30,
  video_url TEXT NOT NULL,
  video_provider TEXT NOT NULL DEFAULT 'youtube' CHECK (video_provider IN ('youtube', 'vimeo', 'panda')),
  order_index INTEGER NOT NULL DEFAULT 1,
  key_takeaways TEXT[] DEFAULT '{}',
  attached_material_ids TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Aulas visíveis para usuários autenticados" 
  ON public.lessons FOR SELECT 
  TO authenticated 
  USING (true);

-- 6. Tabela de Favoritos do Usuário
CREATE TABLE IF NOT EXISTS public.user_favorites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  material_id UUID NOT NULL REFERENCES public.materials(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, material_id)
);

ALTER TABLE public.user_favorites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários gerenciam seus próprios favoritos" 
  ON public.user_favorites FOR ALL 
  USING (auth.uid() = user_id);

-- 7. Tabela de Progresso em Aulas
CREATE TABLE IF NOT EXISTS public.user_lesson_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  is_completed BOOLEAN NOT NULL DEFAULT false,
  notes TEXT DEFAULT '',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, lesson_id)
);

ALTER TABLE public.user_lesson_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários gerenciam seu próprio progresso de aulas" 
  ON public.user_lesson_progress FOR ALL 
  USING (auth.uid() = user_id);

-- 8. Trigger para criar perfil automaticamente no SignUp
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name', ''), 'member');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
