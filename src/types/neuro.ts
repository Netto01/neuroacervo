export type CognitiveDomain = 
  | 'atencao'
  | 'memoria'
  | 'funcoes_executivas'
  | 'linguagem'
  | 'visuoespacial'
  | 'humor_comportamento'
  | 'rastreio_global'
  | 'inteligencia';

export type AgeGroup = 'infantil' | 'adolescente' | 'adulto' | 'idoso' | 'todas';

export type MaterialType = 
  | 'instrumento_rastreio'
  | 'guia_rapido'
  | 'modelo_laudo'
  | 'entrevista_anamnese'
  | 'compendio_estudo'
  | 'tabela_normativa';

export interface MaterialItem {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  type: MaterialType;
  domains: CognitiveDomain[];
  ageGroups: AgeGroup[];
  estimatedTime?: string;
  targetPopulation: string;
  satepsiRestricted: boolean;
  downloadFormat: 'PDF' | 'DOCX' | 'XLSX' | 'ZIP';
  downloadSize: string;
  authorReference: string;
  clinicalUtility: string;
  cutoffsSnippet?: {
    label: string;
    value: string;
    clinicalNote?: string;
  }[];
  contentPreview?: string;
  keyInstructions?: string[];
  isFeatured?: boolean;
  isPopular?: boolean;
  publishedAt: string;
}

export interface VideoLesson {
  id: string;
  moduleId: string;
  title: string;
  description: string;
  durationMinutes: number;
  videoUrl: string;
  videoProvider: 'youtube' | 'vimeo' | 'panda';
  orderIndex: number;
  keyTakeaways: string[];
  attachedMaterialIds?: string[];
  isCompleted?: boolean;
}

export interface CourseModule {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  orderIndex: number;
  level: 'Essencial' | 'Intermediário' | 'Avançado';
  thumbnailUrl?: string;
  lessons: VideoLesson[];
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  crp?: string;
  role: 'admin' | 'member';
  plan: 'Membro Anual Pro' | 'Membro Mensal' | 'Acesso Institucional';
  avatarUrl?: string;
  joinedAt: string;
}
