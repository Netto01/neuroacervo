import { NextResponse } from 'next/server';
import Stripe from 'stripe';

export const dynamic = 'force-dynamic';

export async function GET() {
  const secretKey = process.env.STRIPE_SECRET_KEY?.trim();

  if (!secretKey) {
    return NextResponse.json({
      success: false,
      configured: false,
      error: 'STRIPE_SECRET_KEY não configurada no ambiente (.env.local).'
    });
  }

  try {
    const stripe = new Stripe(secretKey);

    // 1. Obter todas as assinaturas ativas e trialing da Stripe
    const activeSubs: Stripe.Subscription[] = [];

    // Paginação para assinaturas ativas
    for await (const sub of stripe.subscriptions.list({
      status: 'active',
      limit: 100,
      expand: ['data.customer', 'data.items.data.price']
    })) {
      activeSubs.push(sub);
    }

    // Assinaturas em período de teste (trialing)
    for await (const sub of stripe.subscriptions.list({
      status: 'trialing',
      limit: 100,
      expand: ['data.customer', 'data.items.data.price']
    })) {
      activeSubs.push(sub);
    }

    // 2. Calcular o MRR (Monthly Recurring Revenue) real a partir da Stripe
    let mrrTotal = 0;
    let consultaCount = 0;
    let estudoCount = 0;
    let praticaCount = 0;
    let praticaAnualCount = 0;

    for (const sub of activeSubs) {
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

        // Identificação por ID de produto ou valor
        const prodId = typeof price.product === 'string' ? price.product : price.product?.id;
        if (prodId === 'prod_VO24kRYDVe6R5T' || Math.abs(valorReal - 19.9) < 0.5) {
          consultaCount += qty;
        } else if (prodId === 'prod_VO28kweV8p9TJh' || Math.abs(valorReal - 39.9) < 0.5) {
          estudoCount += qty;
        } else if (prodId === 'prod_VO29qu4QY6mc8I' || Math.abs(valorReal - 49.9) < 0.5 || Math.abs(valorReal - 399) < 2) {
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
    const subsPool = [...activeSubs, ...canceledSubsThisMonth];

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

    const totalSubscribers = activeSubs.length;
    const ticketMedio = totalSubscribers > 0 ? Number((mrrTotal / totalSubscribers).toFixed(2)) : 0;

    return NextResponse.json({
      success: true,
      configured: true,
      source: 'stripe',
      mrr: Number(mrrTotal.toFixed(2)),
      ativasCount: totalSubscribers,
      novosNoMesCount: newSubsThisMonth.length,
      canceladasNoMes: canceledSubsThisMonth.length,
      consultaCount,
      estudoCount,
      praticaCount,
      praticaAnualCount,
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
