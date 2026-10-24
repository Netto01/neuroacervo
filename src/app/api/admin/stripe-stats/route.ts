import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { verifyAdminRequest } from '@/lib/serverAuth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const authCheck = await verifyAdminRequest(req);
  if (!authCheck.authorized) {
    return authCheck.errorResponse!;
  }

  const secretKey = process.env.STRIPE_SECRET_KEY?.trim();

  if (!secretKey) {
    return NextResponse.json({
      success: false,
      configured: false,
      error: 'STRIPE_SECRET_KEY não configurada no ambiente (.env.local).'
    });
  }

  try {
    const stripe = new Stripe(secretKey, {
      httpClient: Stripe.createFetchHttpClient(),
      timeout: 30000,
      maxNetworkRetries: 3
    });

    // 1. Obter todas as assinaturas ativas, trialing e com falha de pagamento da Stripe
    const activeSubs: Stripe.Subscription[] = [];
    const trialingSubs: Stripe.Subscription[] = [];
    const pastDueSubs: Stripe.Subscription[] = [];

    // Paginação para assinaturas ativas
    for await (const sub of stripe.subscriptions.list({
      status: 'active',
      limit: 100,
      expand: ['data.customer', 'data.items.data.price', 'data.items.data.price.product']
    })) {
      activeSubs.push(sub);
    }

    // Assinaturas em período de teste (trialing)
    for await (const sub of stripe.subscriptions.list({
      status: 'trialing',
      limit: 100,
      expand: ['data.customer', 'data.items.data.price', 'data.items.data.price.product']
    })) {
      trialingSubs.push(sub);
    }

    // Assinaturas com pagamento pendente / atrasado (past_due, unpaid)
    for await (const sub of stripe.subscriptions.list({
      status: 'past_due',
      limit: 100,
      expand: ['data.customer', 'data.items.data.price', 'data.items.data.price.product']
    })) {
      pastDueSubs.push(sub);
    }

    for await (const sub of stripe.subscriptions.list({
      status: 'unpaid',
      limit: 100,
      expand: ['data.customer', 'data.items.data.price', 'data.items.data.price.product']
    })) {
      pastDueSubs.push(sub);
    }

    const allPayingOrActive = [...activeSubs, ...trialingSubs];

    // Diferenciar quem está ativo normal de quem já solicitou cancelamento no fim do período
    const realmenteAtivas = allPayingOrActive.filter(s => !s.cancel_at_period_end);
    const cancelandoAgendadas = allPayingOrActive.filter(s => Boolean(s.cancel_at_period_end));

    // 2. Calcular o MRR (Monthly Recurring Revenue) real a partir da Stripe
    let mrrTotal = 0;
    let consultaCount = 0;
    let estudoCount = 0;
    let praticaCount = 0;
    let praticaAnualCount = 0;

    for (const sub of allPayingOrActive) {
      for (const item of sub.items.data) {
        const price = item.price;
        if (!price || typeof price.unit_amount !== 'number') continue;

        const qty = item.quantity || 1;
        const valorReal = (price.unit_amount * qty) / 100;
        const interval = price.recurring?.interval || 'month';
        const intervalCount = price.recurring?.interval_count || 1;

        if (interval === 'month') {
          mrrTotal += valorReal / intervalCount;
        } else if (interval === 'year') {
          mrrTotal += valorReal / (12 * intervalCount);
          praticaAnualCount += qty;
        } else if (interval === 'week') {
          mrrTotal += (valorReal * 52) / (12 * intervalCount);
        } else if (interval === 'day') {
          mrrTotal += (valorReal * 30.41) / intervalCount;
        }

        // Identificação por ID de produto, nome ou valor
        const prod = price.product;
        const prodId = typeof prod === 'string' ? prod : prod?.id;
        const prodName = typeof prod === 'object' && prod && 'name' in prod ? (prod.name || '').toLowerCase() : '';

        if (
          prodId === 'prod_VO24kRYDVe6R5T' ||
          prodName.includes('consulta') ||
          Math.abs(valorReal - 24.9) < 0.5 ||
          Math.abs(valorReal - 19.9) < 0.5
        ) {
          consultaCount += qty;
        } else if (
          prodId === 'prod_VO28kweV8p9TJh' ||
          prodName.includes('estudo') ||
          Math.abs(valorReal - 44.9) < 0.5 ||
          Math.abs(valorReal - 39.9) < 0.5
        ) {
          estudoCount += qty;
        } else if (
          prodId === 'prod_VO29qu4QY6mc8I' ||
          prodName.includes('pratica') ||
          prodName.includes('prática') ||
          Math.abs(valorReal - 69.9) < 0.5 ||
          Math.abs(valorReal - 49.9) < 0.5 ||
          Math.abs(valorReal - 699) < 2 ||
          Math.abs(valorReal - 399) < 2
        ) {
          praticaCount += qty;
        }
      }
    }

    // 3. Novos assinantes do mês corrente diretamente da Stripe
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0);
    const startOfMonthUnix = Math.floor(startOfMonth.getTime() / 1000);

    const newSubsThisMonth: Stripe.Subscription[] = [];
    for await (const sub of stripe.subscriptions.list({
      created: { gte: startOfMonthUnix },
      limit: 100,
      expand: ['data.customer']
    })) {
      // Ignorar compras incompletas / checkout abandonado
      if (sub.status !== 'incomplete' && sub.status !== 'incomplete_expired') {
        newSubsThisMonth.push(sub);
      }
    }

    // Cancelamentos ocorridos no mês corrente
    const canceledSubsThisMonth: Stripe.Subscription[] = [];
    for await (const sub of stripe.subscriptions.list({
      status: 'canceled',
      limit: 100
    })) {
      if (sub.canceled_at && sub.canceled_at >= startOfMonthUnix) {
        canceledSubsThisMonth.push(sub);
      }
    }

    // 4. Histórico de MRR dos últimos 6 meses com base na Stripe
    const mesesNomes = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
    const mrrHistory: [string, number][] = [];

    // Juntar ativas e canceladas do mês para estimativa retroativa
    const subsPool = [...allPayingOrActive, ...canceledSubsThisMonth];

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const endOfMonth = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59);
      const endOfMonthUnix = Math.floor(endOfMonth.getTime() / 1000);

      let mrrNoMes = 0;
      for (const sub of subsPool) {
        const criadaAntes = sub.created <= endOfMonthUnix;
        const canceladaDepois = !sub.canceled_at || sub.canceled_at > endOfMonthUnix;

        if (criadaAntes && canceladaDepois) {
          for (const item of sub.items.data) {
            const price = item.price;
            if (!price || typeof price.unit_amount !== 'number') continue;
            const qty = item.quantity || 1;
            const valorReal = (price.unit_amount * qty) / 100;
            const interval = price.recurring?.interval || 'month';
            const count = price.recurring?.interval_count || 1;

            if (interval === 'month') {
              mrrNoMes += valorReal / count;
            } else if (interval === 'year') {
              mrrNoMes += valorReal / (12 * count);
            }
          }
        }
      }
      mrrHistory.push([mesesNomes[d.getMonth()], Math.round(mrrNoMes)]);
    }

    const totalSubscribers = realmenteAtivas.length;
    const ticketMedio = totalSubscribers > 0 ? Number((mrrTotal / totalSubscribers).toFixed(2)) : 0;
    const baseTotal = totalSubscribers + canceledSubsThisMonth.length;
    const taxaCancelamento = baseTotal > 0
      ? Number(((canceledSubsThisMonth.length / baseTotal) * 100).toFixed(1))
      : 0;

    // 5. Métricas Financeiras & SaaS Avançadas
    const arrTotal = Number((mrrTotal * 12).toFixed(2));

    // MRR em risco devido a inadimplência (past_due / unpaid)
    let mrrEmRisco = 0;
    for (const sub of pastDueSubs) {
      for (const item of sub.items.data) {
        const price = item.price;
        if (!price || typeof price.unit_amount !== 'number') continue;
        const qty = item.quantity || 1;
        const valorReal = (price.unit_amount * qty) / 100;
        const interval = price.recurring?.interval || 'month';
        const intervalCount = price.recurring?.interval_count || 1;
        if (interval === 'month') {
          mrrEmRisco += valorReal / intervalCount;
        } else if (interval === 'year') {
          mrrEmRisco += valorReal / (12 * intervalCount);
        }
      }
    }
    mrrEmRisco = Number(mrrEmRisco.toFixed(2));

    const totalAtivasEPendentes = totalSubscribers + pastDueSubs.length;
    const taxaInadimplencia = totalAtivasEPendentes > 0
      ? Number(((pastDueSubs.length / totalAtivasEPendentes) * 100).toFixed(1))
      : 0;

    // LTV Estimado (Lifetime Value)
    // Se churn > 0: Ticket Médio / Churn Decimal. Fallback de 12 meses (8.33% ao mês) se churn zerado.
    const churnDecimal = taxaCancelamento > 0 ? (taxaCancelamento / 100) : 0.0833;
    const ltvEstimado = ticketMedio > 0 ? Number((ticketMedio / churnDecimal).toFixed(2)) : 0;

    // Receita por Plano detalhada
    const consultaReceita = Number((consultaCount * 24.90).toFixed(2));
    const estudoReceita = Number((estudoCount * 44.90).toFixed(2));
    const praticaMensalCount = Math.max(0, praticaCount - praticaAnualCount);
    const praticaReceita = Number(((praticaMensalCount * 69.90) + (praticaAnualCount * (699 / 12))).toFixed(2));

    return NextResponse.json({
      success: true,
      configured: true,
      source: 'stripe',
      mrr: Number(mrrTotal.toFixed(2)),
      arr: arrTotal,
      ltv: ltvEstimado,
      mrrEmRisco,
      taxaInadimplencia,
      // Fornecido em múltiplos formatos para compatibilidade perfeita
      ativasCount: totalSubscribers,
      activeSubscriptions: totalSubscribers,
      cancelandoCount: cancelandoAgendadas.length,
      pendentesCount: pastDueSubs.length,
      novosNoMesCount: newSubsThisMonth.length,
      novosNoMes: newSubsThisMonth.length,
      canceladasNoMes: canceledSubsThisMonth.length,
      canceladasCount: canceledSubsThisMonth.length,
      taxaCancelamento,
      consultaCount,
      estudoCount,
      praticaCount,
      praticaAnualCount,
      consultaReceita,
      estudoReceita,
      praticaReceita,
      ticketMedio,
      mrrHistory,
      syncedAt: new Date().toISOString()
    });
  } catch (err: any) {
    console.error('Erro na API Stripe Stats:', err);
    return NextResponse.json({
      success: false,
      configured: true,
      error: err?.message || 'Falha ao buscar métricas da Stripe.'
    });
  }
}
