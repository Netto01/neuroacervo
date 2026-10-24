export interface PlanDefinition {
  id: 'consulta' | 'estudo' | 'pratica';
  legacyTipo: 'acervo' | 'aulas' | 'completo';
  nome: string;
  tag: string;
  precoMensal: string;
  precoMensalValor: number;
  precoAnual?: string;
  precoAnualValor?: number;
  equivalenteMensalAnual?: string;
  nivel: number;
  descricaoCurta: string;
  destaque?: boolean;
  beneficios: string[];
}

export const STRIPE_PLANS: Record<'consulta' | 'estudo' | 'pratica', PlanDefinition> = {
  consulta: {
    id: 'consulta',
    legacyTipo: 'acervo',
    nome: 'Consulta',
    tag: 'Leitura',
    precoMensal: 'R$ 24,90/mês',
    precoMensalValor: 24.9,
    nivel: 1,
    descricaoCurta: 'Para quem quer os materiais de consulta para baixar e usar.',
    beneficios: [
      'Guias rápidos de aplicação e interpretação',
      'Modelos de laudo e roteiros de anamnese',
      'Compêndios de estudo e instrumentos'
    ]
  },
  estudo: {
    id: 'estudo',
    legacyTipo: 'aulas',
    nome: 'Estudo',
    tag: 'Estudo',
    precoMensal: 'R$ 44,90/mês',
    precoMensalValor: 44.9,
    nivel: 2,
    descricaoCurta: 'Para quem quer os materiais e as aulas gravadas em módulos.',
    beneficios: [
      'Todos os PDFs do plano Consulta',
      'Aulas gravadas em módulos, com progresso salvo'
    ]
  },
  pratica: {
    id: 'pratica',
    legacyTipo: 'completo',
    nome: 'Prática',
    tag: 'Recomendado',
    precoMensal: 'R$ 69,90/mês',
    precoMensalValor: 69.9,
    precoAnual: 'R$ 699,00/ano',
    precoAnualValor: 699.0,
    equivalenteMensalAnual: 'R$ 58,25/mês',
    nivel: 3,
    destaque: true,
    descricaoCurta: 'Para quem avalia e quer, além do estudo, ferramentas para usar na sessão.',
    beneficios: [
      'Todos os PDFs e todas as aulas',
      'Prontuário do paciente com linha do tempo e dossiê',
      'Baralhos interativos para usar online',
      'Histórias temáticas e demais recursos online',
      'Novos recursos interativos todo mês',
      'Acesso antecipado a lançamentos'
    ]
  }
};
