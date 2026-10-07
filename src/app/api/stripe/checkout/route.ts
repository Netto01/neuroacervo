import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { STRIPE_PLANS } from '@/config/plans';

/**
 * Localiza dinamicamente o Price ID diretamente na API da Stripe
 * buscando pelo produto que corresponde ao plano ('Consulta', 'Estudo', 'Prática')
 * e pelo ciclo de faturamento ('mensal' -> month, 'anual' -> year).
 */
async function resolveStripePriceId(
  stripe: Stripe,
  planKey: string,
  billingCycle: 'mensal' | 'anual' = 'mensal'
): Promise<string> {
  const products = await stripe.products.list({ active: true, limit: 30 });

  const targetProduct = products.data.find((p) => {
    const name = p.name.toLowerCase();
    if (planKey === 'consulta') return name.includes('consulta');
    if (planKey === 'estudo') return name.includes('estudo');
    if (planKey === 'pratica') return name.includes('prática') || name.includes('pratica');
    return false;
  });

  if (!targetProduct) {
    throw new Error(`Produto para o plano "${planKey}" não foi encontrado na sua conta Stripe.`);
  }

  // Busca os preços ativos vinculados a este produto
  const prices = await stripe.prices.list({ product: targetProduct.id, active: true });
  const interval = billingCycle === 'anual' ? 'year' : 'month';
  const targetPrice = prices.data.find((pr) => pr.recurring?.interval === interval);

  if (!targetPrice) {
    throw new Error(
      `Preço para cobrança ${billingCycle} (${interval}) não foi encontrado no produto "${targetProduct.name}" na Stripe.`
    );
  }

  return targetPrice.id;
}

export async function POST(req: Request) {
  try {
    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey) {
      return NextResponse.json(
        { error: 'STRIPE_SECRET_KEY não configurada no servidor.' },
        { status: 500 }
      );
    }

    const body = await req.json();
    const { userId, userEmail, planKey, billingCycle = 'mensal' } = body;

    if (!userEmail || !planKey) {
      return NextResponse.json(
        { error: 'Campos obrigatórios ausentes (userEmail, planKey).' },
        { status: 400 }
      );
    }

    const stripe = new Stripe(secretKey);

    // Puxa o Price ID diretamente da API da Stripe no backend
    const priceId = await resolveStripePriceId(stripe, planKey, billingCycle);

    // Identificar a URL base (host) da aplicação
    const origin = req.headers.get('origin') || 
                   req.headers.get('referer')?.split('/').slice(0, 3).join('/') || 
                   'http://localhost:3000';

    const planName = STRIPE_PLANS[planKey as 'consulta' | 'estudo' | 'pratica']?.nome || planKey;

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer_email: userEmail,
      client_reference_id: userId || undefined,
      line_items: [
        {
          price: priceId,
          quantity: 1
        }
      ],
      subscription_data: {
        metadata: {
          userId: userId || '',
          planKey,
          planName,
          billingCycle
        }
      },
      metadata: {
        userId: userId || '',
        planKey,
        planName,
        billingCycle
      },
      allow_promotion_codes: true,
      success_url: `${origin}/sucesso?session_id={CHECKOUT_SESSION_ID}&plano=${encodeURIComponent(planName)}&ciclo=${billingCycle}`,
      cancel_url: `${origin}/cadastro?plano=${planKey}&ciclo=${billingCycle}&cancelado=true`
    });

    return NextResponse.json({ url: session.url });
  } catch (err: unknown) {
    const e = err as Error;
    console.error('Erro ao gerar Stripe Checkout Session:', e);
    return NextResponse.json(
      { error: e?.message || 'Falha ao iniciar pagamento no Stripe.' },
      { status: 500 }
    );
  }
}
