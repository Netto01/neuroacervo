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
  stripeProductId: string;
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
    precoMensal: 'R$ 19,90/mês',
    precoMensalValor: 19.9,
    stripeProductId: 'prod_VO24kRYDVe6R5T',
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
    precoMensal: 'R$ 39,90/mês',
    precoMensalValor: 39.9,
    stripeProductId: 'prod_VO28kweV8p9TJh',
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
    precoMensal: 'R$ 49,90/mês',
    precoMensalValor: 49.9,
    precoAnual: 'R$ 399,00/ano',
    precoAnualValor: 399.0,
    equivalenteMensalAnual: 'R$ 33,25/mês',
    stripeProductId: 'prod_VO29qu4QY6mc8I',
    nivel: 3,
    destaque: true,
    descricaoCurta: 'Para quem avalia e quer, além do estudo, ferramentas para usar na sessão.',
    beneficios: [
      'Todos os PDFs e todas as aulas',
      'Baralhos interativos para usar online',
      'Histórias temáticas e demais recursos online',
      'Novos recursos interativos todo mês',
      'Acesso antecipado a lançamentos'
    ]
  }
};
