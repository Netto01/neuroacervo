import { MaterialItem, CourseModule, CognitiveDomain, MaterialType, AgeGroup } from '@/types/neuro';

export const DOMAIN_LABELS: Record<CognitiveDomain, { label: string; color: string; bg: string }> = {
  atencao: { label: 'Atenção', color: 'text-amber-500 dark:text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
  memoria: { label: 'Memória', color: 'text-blue-500 dark:text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
  funcoes_executivas: { label: 'Funções Executivas', color: 'text-emerald-500 dark:text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
  linguagem: { label: 'Linguagem', color: 'text-purple-500 dark:text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20' },
  visuoespacial: { label: 'Habilidades Visuoespaciais', color: 'text-teal-500 dark:text-teal-400', bg: 'bg-teal-500/10 border-teal-500/20' },
  humor_comportamento: { label: 'Humor & Comportamento', color: 'text-rose-500 dark:text-rose-400', bg: 'bg-rose-500/10 border-rose-500/20' },
  rastreio_global: { label: 'Rastreio Global', color: 'text-indigo-500 dark:text-indigo-400', bg: 'bg-indigo-500/10 border-indigo-500/20' },
  inteligencia: { label: 'Eficiência Intelectual', color: 'text-violet-500 dark:text-violet-400', bg: 'bg-violet-500/10 border-violet-500/20' }
};

export const TYPE_LABELS: Record<MaterialType, { label: string; badge: string }> = {
  instrumento_rastreio: { label: 'Instrumento de Rastreio', badge: 'bg-teal-50 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300 border-teal-200 dark:border-teal-800' },
  guia_rapido: { label: 'Guia Rápido de Aplicação', badge: 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800' },
  modelo_laudo: { label: 'Modelo de Laudo', badge: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800' },
  entrevista_anamnese: { label: 'Entrevista & Anamnese', badge: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800' },
  compendio_estudo: { label: 'Compêndio Teórico', badge: 'bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200 dark:border-purple-800' },
  tabela_normativa: { label: 'Tabela Normativa & Cortes', badge: 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800' }
};

export const AGE_LABELS: Record<AgeGroup, string> = {
  infantil: 'Infantil (0 a 11 anos)',
  adolescente: 'Adolescentes (12 a 17 anos)',
  adulto: 'Adultos (18 a 59 anos)',
  idoso: 'Idosos (60+ anos)',
  todas: 'Todas as Idades'
};

// O acervo inicial começa vazio. Novos materiais e aulas serão cadastrados pelo painel admin ou no Supabase.
export const INITIAL_MATERIALS: MaterialItem[] = [];

export const INITIAL_MODULES: CourseModule[] = [];
