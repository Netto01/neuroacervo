import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getStripePriceId, STRIPE_PLANS } from '@/config/plans';

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

    const priceId = getStripePriceId(planKey, billingCycle);
    if (!priceId) {
      return NextResponse.json(
        { error: `Nenhum Price ID encontrado para o plano ${planKey} no ciclo ${billingCycle}.` },
        { status: 400 }
      );
    }

    const stripe = new Stripe(secretKey);

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
