import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  return createClient(url, key);
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get('session_id');

    if (!sessionId) {
      return NextResponse.json({ error: 'session_id ausente.' }, { status: 400 });
    }

    const rawSecretKey = process.env.STRIPE_SECRET_KEY || '';
    const secretKey = rawSecretKey.trim().replace(/^["']|["']$/g, '');

    if (!secretKey) {
      return NextResponse.json({ error: 'STRIPE_SECRET_KEY não configurada.' }, { status: 500 });
    }

    const stripe = new Stripe(secretKey, {
      httpClient: Stripe.createFetchHttpClient(),
      timeout: 30000,
    });

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (!session || (session.payment_status !== 'paid' && session.status !== 'complete')) {
      return NextResponse.json({
        success: false,
        message: 'Pagamento ainda não confirmado pela Stripe.',
        status: session?.payment_status
      });
    }

    const userId = session.client_reference_id || session.metadata?.userId;
    const customerEmail = session.customer_email || session.customer_details?.email;
    const customerId = typeof session.customer === 'string' ? session.customer : session.customer?.id;
    const subscriptionId = typeof session.subscription === 'string' ? session.subscription : session.subscription?.id;
    const planName = session.metadata?.planName || 'Consulta';
    const billingCycle = session.metadata?.billingCycle || 'mensal';

    const supabase = getSupabaseAdmin();

    const updatePayload: Record<string, any> = {
      subscription_status: 'active',
      plan: planName,
      billing_cycle: billingCycle,
      updated_at: new Date().toISOString()
    };
    if (customerId) updatePayload.stripe_customer_id = customerId;
    if (subscriptionId) updatePayload.stripe_subscription_id = subscriptionId;

    let updated = false;

    // 1. Tenta por userId
    if (userId) {
      const { data, error } = await supabase
        .from('profiles')
        .update(updatePayload)
        .eq('id', userId)
        .select('id');
      if (!error && data && data.length > 0) updated = true;
    }

    // 2. Tenta por email
    if (!updated && customerEmail) {
      const { data, error } = await supabase
        .from('profiles')
        .update(updatePayload)
        .eq('email', customerEmail)
        .select('id');
      if (!error && data && data.length > 0) updated = true;
    }

    return NextResponse.json({
      success: true,
      activated: updated,
      plan: planName,
      billingCycle,
      email: customerEmail
    });
  } catch (err: unknown) {
    const e = err as Error;
    console.error('Erro ao verificar sessão do Stripe:', e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
