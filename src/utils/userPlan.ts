import { UserProfile } from '@/types/neuro';

export type PlanoTipo = 'consulta' | 'estudo' | 'pratica' | 'acervo' | 'aulas' | 'completo';

export interface PlanAccessInfo {
  tipo: PlanoTipo;
  nivel: number;
  nome: string;
  preco: string;
  desc: string;
  cta: string;
  ctaHref: string;
  hasAulas: boolean;
  hasRecursos: boolean;
}

/**
 * Resolve o plano e nível de acesso do usuário a partir dos dados reais do Supabase (profiles)
 */
export function resolveUserPlan(user: UserProfile | null): PlanAccessInfo {
  // Administradores possuem acesso irrestrito de nível máximo
  if (user?.role === 'admin') {
    return {
      tipo: 'pratica',
      nivel: 3,
      nome: 'Acesso Admin',
      preco: 'Acesso Total',
      desc: 'Privilégios administrativos completos em todas as áreas da plataforma.',
      cta: 'Painel do Administrador',
      ctaHref: '/admin',
      hasAulas: true,
      hasRecursos: true
    };
  }

  const rawPlan = (user?.plan || '').toLowerCase();

  // Plano Prática / Completo / Pro / Institucional
  if (
    rawPlan.includes('pratica') ||
    rawPlan.includes('prática') ||
    rawPlan.includes('completo') || 
    rawPlan.includes('pro') || 
    rawPlan.includes('institucional')
  ) {
    const isAnual = user?.billingCycle === 'anual' || rawPlan.includes('anual');
    return {
      tipo: 'pratica',
      nivel: 3,
      nome: 'Prática',
      preco: isAnual ? 'R$ 33,25/mês' : 'R$ 49,90/mês',
      desc: 'Acesso a todo o acervo de consulta, às aulas gravadas e aos recursos interativos de prática clínica.',
      cta: 'Gerenciar assinatura',
      ctaHref: 'mailto:suporte@neuroacervo.com.br?subject=Gerenciar%20Assinatura',
      hasAulas: true,
      hasRecursos: true
    };
  }

  // Plano Estudo / Aulas
  if (rawPlan.includes('estudo') || rawPlan.includes('aula')) {
    return {
      tipo: 'estudo',
      nivel: 2,
      nome: 'Estudo',
      preco: 'R$ 39,90/mês',
      desc: 'Acesso a todos os materiais do plano Consulta mais aulas gravadas em módulos.',
      cta: 'Fazer upgrade para o Prática',
      ctaHref: '/#planos',
      hasAulas: true,
      hasRecursos: false
    };
  }

  // Plano Consulta (Padrão inicial de leitura/acervo)
  return {
    tipo: 'consulta',
    nivel: 1,
    nome: 'Consulta',
    preco: 'R$ 19,90/mês',
    desc: 'Todos os PDFs, guias rápidos de aplicação, modelos de laudo e compêndios para consulta.',
    cta: 'Fazer upgrade de plano',
    ctaHref: '/#planos',
    hasAulas: false,
    hasRecursos: false
  };
}
