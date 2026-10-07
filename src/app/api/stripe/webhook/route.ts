import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  return createClient(url, key);
}

export async function POST(req: Request) {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    return NextResponse.json(
      { error: 'STRIPE_SECRET_KEY não configurada no servidor.' },
      { status: 500 }
    );
  }

  const stripe = new Stripe(secretKey);
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event: Stripe.Event;
  const rawBody = await req.text();
  const signature = req.headers.get('stripe-signature');

  try {
    if (webhookSecret && signature) {
      event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
    } else {
      // Modo flexível / desenvolvimento antes de cadastrar o STRIPE_WEBHOOK_SECRET
      event = JSON.parse(rawBody) as Stripe.Event;
    }
  } catch (err: unknown) {
    const e = err as Error;
    console.error('Falha na validação da assinatura do Webhook Stripe:', e.message);
    return NextResponse.json(
      { error: `Webhook signature verification failed: ${e.message}` },
      { status: 400 }
    );
  }

  const supabase = getSupabaseClient();

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.client_reference_id || session.metadata?.userId;
        const customerEmail = session.customer_email || session.customer_details?.email;
        const customerId = typeof session.customer === 'string' ? session.customer : session.customer?.id;
        const subscriptionId = typeof session.subscription === 'string' ? session.subscription : session.subscription?.id;
        const planName = session.metadata?.planName || 'Consulta';
        const billingCycle = session.metadata?.billingCycle || 'mensal';

        console.log(`[Stripe Webhook] Pagamento aprovado para: ${customerEmail || userId} (Plano: ${planName})`);

        const updateData: Record<string, any> = {
          subscription_status: 'active',
          plan: planName,
          billing_cycle: billingCycle,
          updated_at: new Date().toISOString()
        };
        if (customerId) updateData.stripe_customer_id = customerId;
        if (subscriptionId) updateData.stripe_subscription_id = subscriptionId;

        if (userId) {
          const { error } = await supabase
            .from('profiles')
            .update(updateData)
            .eq('id', userId);

          if (error) {
            console.error('[Stripe Webhook] Erro ao atualizar profile por userId:', error);
          }
        } else if (customerEmail) {
          const { error } = await supabase
            .from('profiles')
            .update(updateData)
            .eq('email', customerEmail);

          if (error) {
            console.error('[Stripe Webhook] Erro ao atualizar profile por email:', error);
          }
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const isActive = subscription.status === 'active' || subscription.status === 'trialing';
        const newStatus = isActive ? 'active' : 'past_due';

        await supabase
          .from('profiles')
          .update({
            subscription_status: newStatus,
            updated_at: new Date().toISOString()
          })
          .eq('stripe_subscription_id', subscription.id);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        console.log(`[Stripe Webhook] Assinatura cancelada: ${subscription.id}`);

        await supabase
          .from('profiles')
          .update({
            subscription_status: 'canceled',
            updated_at: new Date().toISOString()
          })
          .eq('stripe_subscription_id', subscription.id);
        break;
      }

      default:
        // Outros eventos recebidos com sucesso
        break;
    }

    return NextResponse.json({ received: true });
  } catch (err: unknown) {
    const e = err as Error;
    console.error('[Stripe Webhook] Erro ao processar evento:', e);
    return NextResponse.json(
      { error: 'Falha interna ao processar evento do Webhook.' },
      { status: 500 }
    );
  }
}
