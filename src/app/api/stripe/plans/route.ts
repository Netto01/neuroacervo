import { NextResponse } from 'next/server';
import Stripe from 'stripe';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey) {
      return NextResponse.json(
        { error: 'STRIPE_SECRET_KEY não configurada.' },
        { status: 500 }
      );
    }

    const stripe = new Stripe(secretKey);
    const products = await stripe.products.list({ active: true, limit: 20 });

    const plansData: any[] = [];

    for (const prod of products.data) {
      const prices = await stripe.prices.list({ product: prod.id, active: true });
      plansData.push({
        id: prod.id,
        name: prod.name,
        description: prod.description,
        prices: prices.data.map((pr) => ({
          id: pr.id,
          unitAmount: pr.unit_amount ? pr.unit_amount / 100 : 0,
          currency: pr.currency,
          interval: pr.recurring?.interval
        }))
      });
    }

    return NextResponse.json({
      success: true,
      plans: plansData
    });
  } catch (err: unknown) {
    const e = err as Error;
    return NextResponse.json(
      { error: e?.message || 'Falha ao buscar planos na Stripe.' },
      { status: 500 }
    );
  }
}
