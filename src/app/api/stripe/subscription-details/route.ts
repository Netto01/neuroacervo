import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import { verifyUserRequest } from '@/lib/serverAuth';

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  if (!url || !key) return null;
  return createClient(url, key);
}

export async function POST(req: Request) {
  try {
    const authCheck = await verifyUserRequest(req);
    if (!authCheck.authorized) {
      return authCheck.errorResponse!;
    }

    const rawSecretKey = process.env.STRIPE_SECRET_KEY || '';
    const secretKey = rawSecretKey.trim().replace(/^["']|["']$/g, '');
    if (!secretKey) {
      return NextResponse.json({ error: 'STRIPE_SECRET_KEY não configurada.' }, { status: 500 });
    }

    let body: any = {};
    try {
      body = await req.json();
    } catch {}

    const authUser = authCheck.user!;
    const authProfile = authCheck.profile;
    const isAdmin = authCheck.isAdmin;

    // Apenas administradores podem consultar dados de outro e-mail
    const targetEmail = (isAdmin && body?.userEmail ? body.userEmail : authUser.email || '').trim().toLowerCase();
    const targetUserId = isAdmin && body?.userId ? body.userId : authUser.id;

    const stripe = new Stripe(secretKey, {
      httpClient: Stripe.createFetchHttpClient(),
      timeout: 30000,
      maxNetworkRetries: 3
    });

    let customerId = (targetUserId === authUser.id ? authProfile?.stripe_customer_id : body?.stripeCustomerId) || body?.stripeCustomerId;

    // Se não tiver stripeCustomerId, procura pelo e-mail
    if (!customerId && targetEmail) {
      const customers = await stripe.customers.list({
        email: targetEmail,
        limit: 1
      });
      if (customers.data && customers.data.length > 0) {
        customerId = customers.data[0].id;

        // Salva no perfil do Supabase se houver userId
        if (targetUserId) {
          try {
            const supabase = getSupabaseAdmin();
            if (supabase) {
              await supabase.from('profiles').update({ stripe_customer_id: customerId }).eq('id', targetUserId);
            }
          } catch (e) {
            console.warn('Erro ao atualizar stripe_customer_id no perfil:', e);
          }
        }
      }
    }

    if (!customerId) {
      return NextResponse.json({
        hasStripe: false,
        message: 'Nenhum cliente localizado na Stripe para este e-mail.'
      });
    }

    // Busca cliente para obter forma de pagamento padrão se necessário
    const customer = await stripe.customers.retrieve(customerId, {
      expand: ['invoice_settings.default_payment_method']
    });

    // Busca assinaturas ativas / existentes
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: 'all',
      limit: 5,
      expand: ['data.default_payment_method', 'data.items.data.price.product']
    });

    // Pega a assinatura ativa ou a mais recente
    const activeSub =
      subscriptions.data.find((s) => s.status === 'active' || s.status === 'trialing') ||
      subscriptions.data[0];

    // Busca método de pagamento do cartão
    let cardInfo: {
      brand: string;
      last4: string;
      expMonth: number;
      expYear: number;
      textoValidade: string;
    } | null = null;

    let pm: Stripe.PaymentMethod | null = null;
    if (activeSub?.default_payment_method && typeof activeSub.default_payment_method === 'object') {
      pm = activeSub.default_payment_method as Stripe.PaymentMethod;
    } else if (
      customer &&
      !('deleted' in customer) &&
      customer.invoice_settings?.default_payment_method &&
      typeof customer.invoice_settings.default_payment_method === 'object'
    ) {
      pm = customer.invoice_settings.default_payment_method as Stripe.PaymentMethod;
    }

    // Se ainda não achou, lista os métodos de pagamento do cliente
    if (!pm) {
      const pms = await stripe.paymentMethods.list({
        customer: customerId,
        type: 'card',
        limit: 1
      });
      if (pms.data && pms.data.length > 0) {
        pm = pms.data[0];
      }
    }

    if (pm?.card) {
      const expMonthStr = String(pm.card.exp_month).padStart(2, '0');
      const expYearStr = String(pm.card.exp_year).slice(-2);
      cardInfo = {
        brand: pm.card.brand,
        last4: pm.card.last4,
        expMonth: pm.card.exp_month,
        expYear: pm.card.exp_year,
        textoValidade: `Val. ${expMonthStr}/${expYearStr}`
      };
    }

    if (!activeSub) {
      return NextResponse.json({
        hasStripe: true,
        customerId,
        hasSubscription: false,
        cartao: cardInfo,
        message: 'Cliente Stripe existe, mas não possui assinatura ativa no momento.'
      });
    }

    // Extrai dados da assinatura
    const priceItem = activeSub.items?.data?.[0]?.price;
    const interval = priceItem?.recurring?.interval || 'month';
    const isAnual = interval === 'year';
    const unitAmount = priceItem?.unit_amount || 0;
    const valorReais = (unitAmount / 100).toLocaleString('pt-BR', {
      minimumFractionDigits: unitAmount % 100 === 0 ? 0 : 2,
      maximumFractionDigits: 2
    });

    // Identifica plano pelo nome do produto ou price ID
    let planoId: 'consulta' | 'estudo' | 'pratica' = 'consulta';
    let planoNome = 'Consulta';

    const prod = priceItem?.product;
    const prodName = (typeof prod === 'object' && prod && 'name' in prod ? prod.name : '').toLowerCase();
    const priceId = priceItem?.id || '';

    if (
      priceId === 'price_1UNG544tkFt5D3Aylakaifea' ||
      priceId === 'price_1UNG5S4tkFt5D3AyWfb1HXZK' ||
      prodName.includes('pratica') ||
      prodName.includes('prática')
    ) {
      planoId = 'pratica';
      planoNome = 'Prática';
    } else if (priceId === 'price_1UNG4A4tkFt5D3AyO9jPp9YU' || prodName.includes('estudo')) {
      planoId = 'estudo';
      planoNome = 'Estudo';
    } else if (priceId === 'price_1UNFzt4tkFt5D3AyhwChug8K' || prodName.includes('consulta')) {
      planoId = 'consulta';
      planoNome = 'Consulta';
    }

    // Formata a data do próximo vencimento / renovação
    let renovacao = 'Renovação automática';
    const periodEnd = (activeSub as any).current_period_end || (activeSub.items?.data?.[0] as any)?.current_period_end;
    if (periodEnd) {
      const d = new Date(periodEnd * 1000);
      renovacao = d.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    }

    const isCancelando = Boolean((activeSub as any).cancel_at_period_end && activeSub.status !== 'canceled');

    // Tradução de status
    const statusMap: Record<string, string> = {
      active: isCancelando ? 'Cancelamento agendado' : 'Ativa',
      trialing: 'Período de teste',
      past_due: 'Pagamento pendente',
      canceled: 'Cancelada',
      unpaid: 'Inadimplente',
      incomplete: 'Incompleta'
    };

    return NextResponse.json({
      hasStripe: true,
      hasSubscription: true,
      customerId,
      subscriptionId: activeSub.id,
      status: statusMap[activeSub.status] || activeSub.status,
      rawStatus: activeSub.status,
      cancelAtPeriodEnd: isCancelando,
      isCancelando,
      renovacao: isCancelando ? `Acesso ativo até ${renovacao}` : renovacao,
      currentPeriodEnd: periodEnd || null,
      valor: valorReais,
      unitAmount,
      ciclo: isAnual ? 'anual' : 'mensal',
      planoId,
      planoNome,
      cartao: cardInfo
    });
  } catch (error: any) {
    console.error('Erro ao consultar detalhes da assinatura no Stripe:', error);
    return NextResponse.json(
      { error: error?.message || 'Falha ao buscar dados na Stripe.' },
      { status: 500 }
    );
  }
}
