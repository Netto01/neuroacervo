-- ==============================================================================
-- NeuroAcervo — Esquema Completo & Dados Iniciais (Supabase PostgreSQL)
-- 
-- Como rodar:
-- 1. Acesse o painel do Supabase: https://supabase.com/dashboard/
-- 2. Selecione seu projeto -> Menu lateral "SQL Editor" -> "+ New Query"
-- 3. Cole todo este código e clique no botão verde "Run"
-- ==============================================================================

-- 1. Habilitar extensão UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Tabela de Perfis de Usuário (vinculada ao auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL DEFAULT '',
  user_type TEXT NOT NULL DEFAULT 'psicologo' CHECK (user_type IN ('psicologo', 'estudante', 'outro')),
  crp TEXT DEFAULT '',
  clinical_area TEXT DEFAULT '',
  institution TEXT DEFAULT '',
  period TEXT DEFAULT '',
  profession TEXT DEFAULT '',
  phone TEXT DEFAULT '',
  newsletter BOOLEAN NOT NULL DEFAULT true,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('member', 'admin')),
  plan TEXT NOT NULL DEFAULT 'Acervo + Aulas',
  billing_cycle TEXT NOT NULL DEFAULT 'mensal',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Suporte a migrações em tabelas já criadas
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS user_type TEXT DEFAULT 'psicologo';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS clinical_area TEXT DEFAULT '';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS institution TEXT DEFAULT '';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS period TEXT DEFAULT '';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS profession TEXT DEFAULT '';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone TEXT DEFAULT '';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS newsletter BOOLEAN DEFAULT true;


-- Ativar RLS em profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Usuários podem visualizar seu próprio perfil" ON public.profiles;
CREATE POLICY "Usuários podem visualizar seu próprio perfil" 
  ON public.profiles FOR SELECT 
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Usuários podem atualizar seu próprio perfil" ON public.profiles;
CREATE POLICY "Usuários podem atualizar seu próprio perfil" 
  ON public.profiles FOR UPDATE 
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Admins podem visualizar todos os perfis" ON public.profiles;
CREATE POLICY "Admins podem visualizar todos os perfis" 
  ON public.profiles FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND (role = 'admin' OR user_type = 'admin')
    )
  );


-- 3. Tabela de Materiais, Instrumentos e Laudos
CREATE TABLE IF NOT EXISTS public.materials (
  id TEXT PRIMARY KEY,
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
  content_preview TEXT DEFAULT '',
  key_instructions TEXT[] DEFAULT '{}',
  is_featured BOOLEAN NOT NULL DEFAULT false,
  is_popular BOOLEAN NOT NULL DEFAULT false,
  published_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Ativar RLS em materials
ALTER TABLE public.materials ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Membros autenticados podem visualizar materiais" ON public.materials;
CREATE POLICY "Membros autenticados podem visualizar materiais" 
  ON public.materials FOR SELECT 
  TO authenticated 
  USING (true);

DROP POLICY IF EXISTS "Público pode visualizar prévia dos materiais" ON public.materials;
CREATE POLICY "Público pode visualizar prévia dos materiais" 
  ON public.materials FOR SELECT 
  TO anon 
  USING (true);

DROP POLICY IF EXISTS "Admins podem inserir materiais" ON public.materials;
CREATE POLICY "Admins podem inserir materiais" 
  ON public.materials FOR INSERT 
  TO authenticated 
  WITH CHECK (true);

DROP POLICY IF EXISTS "Admins podem atualizar materiais" ON public.materials;
CREATE POLICY "Admins podem atualizar materiais" 
  ON public.materials FOR UPDATE 
  TO authenticated 
  USING (true);

DROP POLICY IF EXISTS "Admins podem excluir materiais" ON public.materials;
CREATE POLICY "Admins podem excluir materiais" 
  ON public.materials FOR DELETE 
  TO authenticated 
  USING (true);


-- 4. Tabela de Módulos de Videoaulas
CREATE TABLE IF NOT EXISTS public.modules (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  subtitle TEXT DEFAULT '',
  description TEXT DEFAULT '',
  order_index INTEGER NOT NULL DEFAULT 1,
  level TEXT NOT NULL DEFAULT 'Essencial' CHECK (level IN ('Essencial', 'Intermediário', 'Avançado')),
  thumbnail_url TEXT DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Módulos visíveis para todos os usuários" ON public.modules;
CREATE POLICY "Módulos visíveis para todos os usuários" 
  ON public.modules FOR SELECT 
  USING (true);


-- 5. Tabela de Videoaulas
CREATE TABLE IF NOT EXISTS public.lessons (
  id TEXT PRIMARY KEY,
  module_id TEXT NOT NULL REFERENCES public.modules(id) ON DELETE CASCADE,
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

DROP POLICY IF EXISTS "Aulas visíveis para todos os usuários" ON public.lessons;
CREATE POLICY "Aulas visíveis para todos os usuários" 
  ON public.lessons FOR SELECT 
  USING (true);


-- 6. Tabela de Favoritos do Usuário
CREATE TABLE IF NOT EXISTS public.user_favorites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  material_id TEXT NOT NULL REFERENCES public.materials(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, material_id)
);

ALTER TABLE public.user_favorites ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Usuários gerenciam seus próprios favoritos" ON public.user_favorites;
CREATE POLICY "Usuários gerenciam seus próprios favoritos" 
  ON public.user_favorites FOR ALL 
  USING (auth.uid() = user_id);


-- 7. Tabela de Progresso em Aulas
CREATE TABLE IF NOT EXISTS public.user_lesson_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id TEXT NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  is_completed BOOLEAN NOT NULL DEFAULT false,
  notes TEXT DEFAULT '',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, lesson_id)
);

ALTER TABLE public.user_lesson_progress ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Usuários gerenciam seu próprio progresso de aulas" ON public.user_lesson_progress;
CREATE POLICY "Usuários gerenciam seu próprio progresso de aulas" 
  ON public.user_lesson_progress FOR ALL 
  USING (auth.uid() = user_id);


-- 8. Trigger para criar perfil automaticamente no SignUp (auth.users)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (
    id, 
    email, 
    full_name, 
    user_type,
    crp,
    clinical_area,
    institution,
    period,
    profession,
    phone,
    newsletter,
    role, 
    plan, 
    billing_cycle
  )
  VALUES (
    new.id, 
    new.email, 
    coalesce(new.raw_user_meta_data->>'full_name', ''), 
    coalesce(new.raw_user_meta_data->>'user_type', 'psicologo'),
    coalesce(new.raw_user_meta_data->>'crp', ''),
    coalesce(new.raw_user_meta_data->>'clinical_area', ''),
    coalesce(new.raw_user_meta_data->>'institution', ''),
    coalesce(new.raw_user_meta_data->>'period', ''),
    coalesce(new.raw_user_meta_data->>'profession', ''),
    coalesce(new.raw_user_meta_data->>'phone', ''),
    coalesce((new.raw_user_meta_data->>'newsletter')::boolean, true),
    'member',
    coalesce(new.raw_user_meta_data->>'plan', 'Acervo + Aulas'),
    coalesce(new.raw_user_meta_data->>'billing_cycle', 'mensal')
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = coalesce(excluded.full_name, profiles.full_name),
    user_type = coalesce(excluded.user_type, profiles.user_type),
    crp = coalesce(excluded.crp, profiles.crp),
    clinical_area = coalesce(excluded.clinical_area, profiles.clinical_area),
    institution = coalesce(excluded.institution, profiles.institution),
    period = coalesce(excluded.period, profiles.period),
    profession = coalesce(excluded.profession, profiles.profession),
    phone = coalesce(excluded.phone, profiles.phone),
    newsletter = coalesce(excluded.newsletter, profiles.newsletter);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ==============================================================================
-- 9. DADOS DO ACERVO
-- O acervo inicia vazio. Novos materiais e aulas serão cadastrados pela equipe.
-- 
-- Para limpar materiais ou aulas de demonstração caso tenham sido inseridos:
-- TRUNCATE public.user_lesson_progress, public.lessons, public.modules, public.materials CASCADE;
-- ==============================================================================
/*
-- Materiais Iniciais Antigos (Desativados)
  'MoCA (Montreal Cognitive Assessment) — Guia Prático & Pontos de Corte',
  'Protocolo completo de rastreio de Comprometimento Cognitivo Leve (CCL) e Demência',
  'Manual conciso de aplicação, instruções de pontuação padronizada e tabelas normativas adaptadas para a população brasileira considerando escolaridade. Inclui pontos de corte para CCL e Alzheimer.',
  'instrumento_rastreio',
  ARRAY['rastreio_global', 'funcoes_executivas', 'memoria', 'atencao', 'linguagem', 'visuoespacial'],
  ARRAY['adulto', 'idoso'],
  '10 a 15 min',
  'Adultos e idosos com queixas de perda de memória ou suspeita de declínio cognitivo',
  false,
  'PDF',
  '2.4 MB',
  'Nasreddine et al. (2005); Validação Brasileira por Memória et al. (2013)',
  'Diferenciação precisa entre envelhecimento saudável, CCL e fases iniciais de quadros demenciais. Superior ao MEEM na detecção de disfunção executiva e perdas de memória precoce.',
  '[
    {"label": "Escore Máximo", "value": "30 pontos", "clinicalNote": "Adicionar 1 ponto se escolaridade <= 12 anos"},
    {"label": "Ponto de Corte Geral (Brasil)", "value": "< 25 / 26 pontos", "clinicalNote": "Sugere investigação aprofundada de CCL"},
    {"label": "Ponto de Corte Baixa Escolaridade (1-4 anos)", "value": "< 21 pontos", "clinicalNote": "Sensibilidade de 81% e especificidade de 77%"},
    {"label": "Ponto de Corte Alta Escolaridade (>=9 anos)", "value": "< 26 pontos", "clinicalNote": "Alta sensibilidade para CCL amnéstico"}
  ]'::jsonb,
  'O Montreal Cognitive Assessment (MoCA) foi concebido como um instrumento de rastreio rápido para o comprometimento cognitivo leve (CCL)...',
  ARRAY[
    'Trail Making B: Instruir o examinando a alternar número e letra sem levantar a caneta.',
    'Cópia do Cubo: Deve ter tridimensionalidade, todas as linhas presentes e paralelas sem perda angular grosseira.',
    'Evocação Tardia de Palavras: Não oferecer pistas fonêmicas ou de categoria na pontuação espontânea.'
  ],
  true,
  true,
  '2026-01-15T00:00:00Z'
),
(
  'mat-laudo-tdah-adulto',
  'Modelo Completo de Laudo Neuropsicológico — TDAH em Adultos',
  'Estrutura detalhada em conformidade com a Resolução CFP nº 06/2019 e critérios DSM-5-TR',
  'Documento editável completo contendo introdução clínica, histórico ocupacional/acadêmico, instrumentos administrados, tabelas com escores Z e percentis, síntese integrativa, diagnóstico diferencial e plano de intervenção.',
  'modelo_laudo',
  ARRAY['funcoes_executivas', 'atencao', 'humor_comportamento'],
  ARRAY['adulto'],
  'Template de redação',
  'Adultos sob investigação de desatenção, impulsividade, procrastinação crônica e desregulação executiva',
  false,
  'DOCX',
  '480 KB',
  'Elaborado por especialistas do NeuroAcervo segundo CFP 06/2019 e DSM-5-TR',
  'Padroniza a apresentação dos resultados clínicos e psicométricos para médicos psiquiatras, neurologistas e planos de saúde com rigor técnico irrefutável.',
  '[
    {"label": "Atenção Sustentada e Alternada", "value": "Percentil < 16 ou Z < -1.0", "clinicalNote": "Indicativo de prejuízo funcional clinicamente relevante"},
    {"label": "Controle Inibitório e Flexibilidade", "value": "Percentil < 10 ou Z < -1.33", "clinicalNote": "Prejuízo severo na regulação comportamental e tarefas de interferência"}
  ]'::jsonb,
  'LAUDO DE AVALIAÇÃO NEUROPSICOLÓGICA\n\n1. IDENTIFICAÇÃO DO PACIENTE...\n2. MOTIVO DA AVALIAÇÃO E QUEIXAS PRINCIPAIS...\n3. ANAMNESE E HISTÓRICO DE DESENVOLVIMENTO...',
  ARRAY[
    'Sempre correlacionar os déficits nos testes atencionais com a história desenvolvimental desde a infância.',
    'Descartar diagnósticos diferenciais: transtorno bipolar, apneia obstrutiva do sono, hipotireoidismo e burnout.',
    'Incluir sempre recomendações de adaptação ergonômica e encaminhamento para TCC / Psiquiatria.'
  ],
  true,
  true,
  '2026-02-01T00:00:00Z'
),
(
  'mat-anamnese-adulto-idoso',
  'Roteiro de Entrevista Semiestruturada de Anamnese — Adulto e Idoso',
  'Mapeamento minucioso de queixas cognitivas, hábitos de vida, histórico mórbido e funcionalidade',
  'Ficha prática de coleta de anamnese cobrindo marcos clínicos, queixas subjetivas de memória, sono, medicamentos em uso, nível pré-mórbido e inventário funcional (AVDs básicas e instrumentais).',
  'entrevista_anamnese',
  ARRAY['rastreio_global', 'humor_comportamento', 'memoria'],
  ARRAY['adulto', 'idoso'],
  '45 a 60 min',
  'Pacientes adultos e idosos em primeira sessão de avaliação neuropsicológica',
  false,
  'DOCX',
  '320 KB',
  'Consenso Clínico NeuroAcervo / Escalas Pfeffer & Lawton integradas',
  'Levantamento da linha de base do paciente, indispensável para formular as hipóteses diagnósticas e eleger a bateria neuropsicológica mais adequada.',
  '[]'::jsonb,
  'ENTREVISTA DE ANAMNESE NEUROPSICOLÓGICA CLÍNICA\n\nData: ___/___/_____\nNome do Avaliando: ________________________________\nInformante (se houver): ____________________________\n\nI. QUEIXA PRINCIPAL E HISTÓRIA DA DOENÇA ATUAL (HDA)...',
  ARRAY[
    'Sempre que possível, realizar parte da anamnese com um informante próximo (cônjuge ou filho).',
    'Investigar o impacto do esquecimento na autonomia financeira e uso de medicamentos.',
    'Averiguar presença de flutuação de consciência e alterações comportamentais/alucinações.'
  ],
  false,
  true,
  '2026-01-20T00:00:00Z'
),
(
  'mat-ravlt-guia',
  'RAVLT (Rey Auditory Verbal Learning Test) — Guia de Aplicação e Índices',
  'Interpretação passo a passo de Curva de Aprendizagem, Interferência e Reconhecimento',
  'Guia visual para cálculo do Escore Total A1-A5, Velocidade de Aprendizagem, Interferência Proativa (B1 vs A1), Interferência Retroativa (A6 vs A5), Retenção Tardia (A7) e Índice de Falsos Positivos no Reconhecimento.',
  'guia_rapido',
  ARRAY['memoria'],
  ARRAY['adolescente', 'adulto', 'idoso'],
  '25 min (com intervalo de 20 min para evocação tardia)',
  'Indivíduos com suspeita de amnésia, demência inicial, traumatismo cranioencefálico ou epilepsia',
  true,
  'PDF',
  '1.8 MB',
  'Rey (1964); Normatização Brasileira por Malloy-Diniz et al.',
  'Padrão-ouro na avaliação da memória declarativa episódica verbal e sensibilidade aos danos no circuito hipocampal/lobo temporal medial.',
  '[
    {"label": "A1 (Span Imediato)", "value": "Média 6 a 8 palavras", "clinicalNote": "Avalia capacidade de memória imediata e atenção fonológica"},
    {"label": "Escore Total (A1 a A5)", "value": "Percentil >= 25", "clinicalNote": "Mede capacidade de armazenamento e consolidação repetitiva"},
    {"label": "Evocação Tardia (A7)", "value": "Queda > 20% em relação a A5", "clinicalNote": "Alerta clínico de perda acelerada de retenção (evocação espontânea)"}
  ]'::jsonb,
  'O RAVLT consiste na leitura sucessiva de uma lista de 15 substantivos comuns (Lista A) durante cinco tentativas consecutivas...',
  ARRAY[
    'Apresentar a lista com velocidade exata de 1 palavra por segundo, mantendo entonação neutra.',
    'Não realizar nenhuma outra tarefa com estímulos verbais auditivos durante o intervalo de 20 minutos de espera de A7.',
    'Registrar intrusões e perseverações em cada tentativa para análise de qualidade executiva.'
  ],
  true,
  true,
  '2026-02-10T00:00:00Z'
),
(
  'mat-laudo-infantil-tea',
  'Modelo de Laudo Neuropsicológico Infantil — Suspeita de TEA e Aprendizagem',
  'Comunicação empática e técnica para neuropediatras, fonoaudiólogos e coordenação escolar',
  'Estrutura completa com fundamentação psicométrica, observação lúdico-comportamental, perfil de desenvolvimento (motricidade, linguagem pragmática, inflexibilidade cognitiva) e plano de adaptações pedagógicas (PEI).',
  'modelo_laudo',
  ARRAY['funcoes_executivas', 'linguagem', 'humor_comportamento', 'inteligencia'],
  ARRAY['infantil'],
  'Template de redação',
  'Crianças de 3 a 11 anos encaminhadas por dificuldades de socialização, hiperfoco e queixas escolares',
  false,
  'DOCX',
  '512 KB',
  'Especialistas em Neurodesenvolvimento Infantil do NeuroAcervo',
  'Facilita a elaboração de laudos infantis completos, com linguagem acessível aos pais e recomendações pragmáticas para aplicação no Plano Educacional Individualizado (PEI).',
  '[]'::jsonb,
  'RELATÓRIO / LAUDO DE AVALIAÇÃO NEUROPSICOLÓGICA INFANTIL\n\nNome da Criança: __________________________________\nIdade Cronológica: __ anos e __ meses\nEscola / Ano: ____________________________________...',
  ARRAY[
    'Descrever minuciosamente a reação da criança frente a limites, frustrações e quebra de rotina.',
    'Separar os achados formais dos testes psicométricos da análise qualitativa de interação social.',
    'Especificar na conclusão as necessidades de suporte (Nível 1, 2 ou 3) segundo o DSM-5-TR.'
  ],
  false,
  false,
  '2026-02-15T00:00:00Z'
),
(
  'mat-compendio-estatistica',
  'Compêndio de Psicolometria & Estatística Prática para Laudos',
  'Domine Escores Z, T, Percentis, Curva Normal e Discrepâncias Clinicamente Relevantes',
  'Guia definitivo de bolso para converter escores brutos em padronizados, calcular intervalos de confiança (IC 95%), interpretar curvas normais gaussianas e justificar desvios com segurança científica no laudo.',
  'compendio_estudo',
  ARRAY['rastreio_global', 'inteligencia'],
  ARRAY['todas'],
  'Leitura e consulta permanente',
  'Psicólogos e neuropsicólogos clínicos em fase de tabulação e fechamento diagnóstico',
  false,
  'PDF',
  '3.1 MB',
  'Comitê Científico NeuroAcervo',
  'Elimina as dúvidas mais frequentes na elaboração de tabelas de laudo: o que fazer quando um teste usa percentil e outro usa Escore Z, e como identificar dupla dissociação com consistência.',
  '[
    {"label": "Escore Z = 0", "value": "Percentil 50 / T = 50", "clinicalNote": "Desempenho rigorosamente dentro da média esperada"},
    {"label": "Escore Z entre -1.0 e -1.5", "value": "Percentil 16 a 7", "clinicalNote": "Desempenho limítrofe / rebaixamento leve"},
    {"label": "Escore Z < -1.5", "value": "Percentil < 7", "clinicalNote": "Rebaixamento significativo / déficit clinicamente sugestivo"},
    {"label": "Escore Z < -2.0", "value": "Percentil < 2", "clinicalNote": "Déficit severo (abaixo de 2 desvios-padrão)"}
  ]'::jsonb,
  'A psicometria constitui o alicerce matemático que confere legitimidade científica à prática da avaliação neuropsicológica...',
  ARRAY[
    'Nunca confunda percentil com porcentagem de acertos!',
    'Ao comparar testes de editoras diferentes, normalize todos os resultados para Escore Z na tabela final.',
    'Sempre declare a amostra normativa utilizada (ano e região demográfica).'
  ],
  true,
  true,
  '2026-01-10T00:00:00Z'
),
(
  'mat-stroop-guia',
  'Teste de Stroop (Cores e Palavras) — Protocolo de Interpretação',
  'Avaliação de Atenção Seletiva, Controle Inibitório e Efeito de Interferência',
  'Passo a passo para aplicação dos cartões de Palavras, Cores e Cores-Palavras. Fórmulas de cálculo do Índice de Interferência e interpretação de suscetibilidade à distração.',
  'guia_rapido',
  ARRAY['funcoes_executivas', 'atencao'],
  ARRAY['adolescente', 'adulto', 'idoso'],
  '5 a 8 min',
  'Quadros de TDAH, traumatismo cranioencefálico, lesões pré-frontais e demências frontotemporais',
  true,
  'PDF',
  '1.2 MB',
  'Stroop (1935); Golden & Freshwater; Versão Victoria adaptada',
  'Mede a capacidade de inibir uma resposta automática preponderante (leitura) em benefício de um comportamento orientado a metas (nomeação da cor da tinta).',
  '[
    {"label": "Cartão 1 (Leitura)", "value": "Velocidade Basal", "clinicalNote": "Mede velocidade de processamento visual e leitura"},
    {"label": "Cartão 2 (Cores)", "value": "Nomeação Simples", "clinicalNote": "Velocidade de acesso léxico e nomeação cromática"},
    {"label": "Cartão 3 (Interferência)", "value": "Controle Inibitório", "clinicalNote": "Tempo aumentado e erros autocorrigidos refletem esforço executivo aumentado"}
  ]'::jsonb,
  'O paradigma de Stroop é amplamente utilizado na clínica e na pesquisa para estimar a integridade do córtex cingulado anterior...',
  ARRAY[
    'Garantir que o paciente não possua daltonismo antes da testagem.',
    'Cronometrar com precisão de décimos de segundo.',
    'Anotar separadamente erros espontâneos autocorrigidos e erros mantidos.'
  ],
  false,
  true,
  '2026-02-18T00:00:00Z'
),
(
  'mat-meem-cortes',
  'MEEM (Mini-Exame do Estado Mental) — Tabela de Cortes de Brucki et al.',
  'Pontos de corte ajustados para analfabetos e diferentes faixas de escolaridade no Brasil',
  'Tabela de referência rápida de escores médios e desvios padrão para 0, 1 a 4 anos, 5 a 8 anos e 9+ anos de estudo, com notas sobre os principais fatores de erro na aplicação.',
  'tabela_normativa',
  ARRAY['rastreio_global'],
  ARRAY['idoso'],
  '5 a 10 min',
  'Idosos em triagem primária para declínio cognitivo',
  false,
  'PDF',
  '650 KB',
  'Folstein et al. (1975); Normatização Brasileira por Brucki et al. (2003)',
  'Instrumento de triagem amplamente solicitado por planos de saúde e geriatras. Essencial ter os pontos de corte estratificados por escolaridade à mão.',
  '[
    {"label": "Analfabetos", "value": "Corte: 20 pontos", "clinicalNote": "Escore médio nacional: 20.3 (DP 2.3)"},
    {"label": "1 a 4 anos de estudo", "value": "Corte: 25 pontos", "clinicalNote": "Escore médio nacional: 25.1 (DP 2.8)"},
    {"label": "5 a 8 anos de estudo", "value": "Corte: 26.5 pontos", "clinicalNote": "Escore médio nacional: 26.8 (DP 2.3)"},
    {"label": "9 ou mais anos de estudo", "value": "Corte: 28 pontos", "clinicalNote": "Escore médio nacional: 28.5 (DP 1.8)"}
  ]'::jsonb,
  'A tabela de Brucki et al. (2003) permanece como um dos marcos mais citados na literatura médica e neuropsicológica brasileira...',
  ARRAY[
    'No cálculo serial (subtrações de 7 a partir de 100), se o paciente errar a primeira e continuar subtraindo 7 do número incorreto, pontuar os acertos subsequentes.',
    'No comando de 3 estágios, dar toda a instrução uma única vez sem repetir.',
    'Na frase da escrita, deve conter sujeito e verbo com sentido.'
  ],
  false,
  false,
  '2026-01-05T00:00:00Z'
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  subtitle = EXCLUDED.subtitle,
  description = EXCLUDED.description,
  type = EXCLUDED.type,
  domains = EXCLUDED.domains,
  age_groups = EXCLUDED.age_groups,
  estimated_time = EXCLUDED.estimated_time,
  target_population = EXCLUDED.target_population,
  satepsi_restricted = EXCLUDED.satepsi_restricted,
  download_format = EXCLUDED.download_format,
  download_size = EXCLUDED.download_size,
  author_reference = EXCLUDED.author_reference,
  clinical_utility = EXCLUDED.clinical_utility,
  cutoffs_snippet = EXCLUDED.cutoffs_snippet,
  content_preview = EXCLUDED.content_preview,
  key_instructions = EXCLUDED.key_instructions,
  is_featured = EXCLUDED.is_featured,
  is_popular = EXCLUDED.is_popular;


-- Módulos de Cursos Iniciais
INSERT INTO public.modules (id, title, subtitle, description, order_index, level) VALUES
(
  'mod-1',
  'Módulo 1: Raciocínio Clínico e Planejamento da Avaliação',
  'Como montar baterias flexíveis e formular hipóteses diagnósticas certeiras',
  'Aprenda a estruturar o processo avaliativo desde o primeiro contato: acolhimento, contrato, anamnese aprofundada e desenho da bateria de testes com base na queixa e na ecologia do paciente.',
  1,
  'Essencial'
),
(
  'mod-2',
  'Módulo 2: Domínios Cognitivos e Interpretação dos Testes',
  'Atenção, Memória, Funções Executivas e Funções Visuoespaciais',
  'Imersão nos principais construtos da neuropsicologia moderna, com demonstrações de aplicação dos testes mais utilizados no Brasil e interpretação de padrões de resposta.',
  2,
  'Intermediário'
),
(
  'mod-3',
  'Módulo 3: Redação de Laudos de Alto Nível & Devolutiva',
  'Da tabulação psicométrica à comunicação clínica com médicos e famílias',
  'Técnicas de redação científica acessível, organização das tabelas psicométricas, justificativas diagnósticas robustas e condução de devolutivas transformadoras.',
  3,
  'Avançado'
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  subtitle = EXCLUDED.subtitle,
  description = EXCLUDED.description,
  order_index = EXCLUDED.order_index,
  level = EXCLUDED.level;


-- Videoaulas Iniciais
INSERT INTO public.lessons (
  id, module_id, title, description, duration_minutes, video_url, video_provider, 
  order_index, key_takeaways, attached_material_ids
) VALUES
(
  'les-1-1',
  'mod-1',
  'Aula 1: A Entrevista de Anamnese como Eixo Central do Raciocínio Clínico',
  'Por que a anamnese responde por 70% do diagnóstico e como coletar dados que os testes psicométricos não revelam.',
  42,
  'https://www.youtube.com/embed/dQw4w9WgXcQ',
  'youtube',
  1,
  ARRAY[
    'Diferença entre queixa do paciente e queixa do familiar informante.',
    'Mapeamento da funcionalidade prévia (ocupacional e interpessoal).',
    'Sinais de alerta vermelho (red flags) neurológicos e psiquiátricos.'
  ],
  ARRAY['mat-anamnese-adulto-idoso']
),
(
  'les-1-2',
  'mod-1',
  'Aula 2: Baterias Fixas vs. Baterias Flexíveis: Qual abordagem escolher?',
  'Critérios pragmáticos para escolha de instrumentos: cansaço do paciente, sensibilidade psicométrica e adequação à escolaridade.',
  38,
  'https://www.youtube.com/embed/dQw4w9WgXcQ',
  'youtube',
  2,
  ARRAY[
    'Vantagens e limitações de cada modelo metodológico.',
    'Como dosar a carga cognitiva e evitar fadiga durante as sessões de testagem.',
    'A importância de testes de rastreio inicial antes do aprofundamento.'
  ],
  ARRAY['mat-moca', 'mat-meem-cortes']
),
(
  'les-2-1',
  'mod-2',
  'Aula 1: Desvendando a Memória Episódica Verbal com o RAVLT',
  'Análise aprofundada das curvas de aprendizagem, efeito de primazia e recência, vulnerabilidade à interferência e reconhecimento.',
  54,
  'https://www.youtube.com/embed/dQw4w9WgXcQ',
  'youtube',
  1,
  ARRAY[
    'Como diferenciar déficit de evocação (frontal/subcortical) de déficit de retenção/armazenamento (hipocampal).',
    'O valor clínico do reconhecimento e o papel dos falsos positivos.',
    'Análise de perseverações como pista executiva.'
  ],
  ARRAY['mat-ravlt-guia']
),
(
  'les-2-2',
  'mod-2',
  'Aula 2: Funções Executivas e Atenção: Stroop, FDT e Trilhas',
  'Interpretação de testes atencionais e de controle inibitório. Quando a lentidão é atenção e quando é velocidade de processamento?',
  47,
  'https://www.youtube.com/embed/dQw4w9WgXcQ',
  'youtube',
  2,
  ARRAY[
    'Diferenciando componentes atencionais: sustentada, alternada e dividida.',
    'O impacto da ansiedade de desempenho nos tempos de reação.',
    'Como documentar lapsos atencionais qualitativamente.'
  ],
  ARRAY['mat-stroop-guia']
),
(
  'les-3-1',
  'mod-3',
  'Aula 1: Anatomia de um Laudo Neuropsicológico Impecável (CFP 06/2019)',
  'Estruturação seções por seção: histórico, descrição comportamental, tabelas comparativas e conclusão diagnóstica.',
  62,
  'https://www.youtube.com/embed/dQw4w9WgXcQ',
  'youtube',
  1,
  ARRAY[
    'Como evitar jargões herméticos sem perder o rigor científico.',
    'Construção de tabelas claras com percentis e escores Z correlacionados.',
    'Recomendações terapêuticas que realmente auxiliam a equipe multiprofissional.'
  ],
  ARRAY['mat-laudo-tdah-adulto', 'mat-laudo-infantil-tea', 'mat-compendio-estatistica']
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  duration_minutes = EXCLUDED.duration_minutes,
  video_url = EXCLUDED.video_url,
  order_index = EXCLUDED.order_index,
  key_takeaways = EXCLUDED.key_takeaways,
  attached_material_ids = EXCLUDED.attached_material_ids;
*/

