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

  // Apenas assinaturas com status 'active' têm acesso aos recursos bloqueados
  const isActive = user?.subscriptionStatus === 'active';
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
      nivel: isActive ? 3 : 1,
      nome: 'Prática',
      preco: isAnual ? 'R$ 58,25/mês' : 'R$ 69,90/mês',
      desc: 'Acesso a todo o acervo de consulta, às aulas gravadas e aos recursos interativos de prática clínica.',
      cta: isActive ? 'Gerenciar assinatura' : 'Ativar plano Prática',
      ctaHref: isActive ? '/plataforma/assinatura' : '/plataforma/upgrade?plano=pratica',
      hasAulas: isActive,
      hasRecursos: isActive
    };
  }

  // Plano Estudo / Aulas
  if (rawPlan.includes('estudo') || rawPlan.includes('aula')) {
    return {
      tipo: 'estudo',
      nivel: isActive ? 2 : 1,
      nome: 'Estudo',
      preco: 'R$ 44,90/mês',
      desc: 'Acesso a todos os materiais do plano Consulta mais aulas gravadas em módulos.',
      cta: isActive ? 'Fazer upgrade para o Prática' : 'Ativar plano Estudo',
      ctaHref: isActive ? '/plataforma/upgrade?plano=pratica' : '/plataforma/upgrade?plano=estudo',
      hasAulas: isActive,
      hasRecursos: false
    };
  }

  // Plano Consulta (Padrão inicial de leitura/acervo)
  return {
    tipo: 'consulta',
    nivel: 1,
    nome: 'Consulta',
    preco: 'R$ 24,90/mês',
    desc: 'Todos os PDFs, guias rápidos de aplicação, modelos de laudo e compêndios para consulta.',
    cta: isActive ? 'Fazer upgrade de plano' : 'Assinar plano',
    ctaHref: '/plataforma/upgrade',
    hasAulas: false,
    hasRecursos: false
  };
}
