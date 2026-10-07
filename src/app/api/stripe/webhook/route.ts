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

/**
 * Atualiza o registro em profiles tentando identificar o usuário
 * por: 1. userId -> 2. stripe_subscription_id -> 3. stripe_customer_id -> 4. email
 */
async function updateProfileRecord(
  supabase: ReturnType<typeof getSupabaseClient>,
  identifiers: {
    userId?: string | null;
    customerEmail?: string | null;
    stripeSubscriptionId?: string | null;
    stripeCustomerId?: string | null;
  },
  data: Record<string, any>
) {
  const { userId, customerEmail, stripeSubscriptionId, stripeCustomerId } = identifiers;
  const updatePayload = {
    ...data,
    updated_at: new Date().toISOString()
  };

  // 1. Por userId
  if (userId) {
    const { data: updated, error } = await supabase
      .from('profiles')
      .update(updatePayload)
      .eq('id', userId)
      .select('id');
    if (!error && updated && updated.length > 0) return true;
  }

  // 2. Por stripe_subscription_id
  if (stripeSubscriptionId) {
    const { data: updated, error } = await supabase
      .from('profiles')
      .update(updatePayload)
      .eq('stripe_subscription_id', stripeSubscriptionId)
      .select('id');
    if (!error && updated && updated.length > 0) return true;
  }

  // 3. Por stripe_customer_id
  if (stripeCustomerId) {
    const { data: updated, error } = await supabase
      .from('profiles')
      .update(updatePayload)
      .eq('stripe_customer_id', stripeCustomerId)
      .select('id');
    if (!error && updated && updated.length > 0) return true;
  }

  // 4. Por customerEmail
  if (customerEmail) {
    const { data: updated, error } = await supabase
      .from('profiles')
      .update(updatePayload)
      .eq('email', customerEmail)
      .select('id');
    if (!error && updated && updated.length > 0) return true;
  }

  return false;
}

/**
 * Mapeia o status de assinatura da Stripe para o status do nosso banco
 */
function mapStripeSubscriptionStatus(stripeStatus: Stripe.Subscription.Status): 'active' | 'pending' | 'canceled' | 'past_due' | 'paused' {
  switch (stripeStatus) {
    case 'active':
    case 'trialing':
      return 'active';
    case 'past_due':
    case 'unpaid':
      return 'past_due';
    case 'canceled':
      return 'canceled';
    case 'paused':
      return 'paused';
    case 'incomplete':
    case 'incomplete_expired':
    default:
      return 'pending';
  }
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
      // Modo flexível / desenvolvimento antes de cadastrar o segredo exato do webhook
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
  console.log(`[Stripe Webhook] Evento recebido: ${event.type} (ID: ${event.id})`);

  try {
    switch (event.type) {
      // ==========================================
      // 1. CHECKOUT SESSION: CONCLUÍDO
      // ==========================================
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.client_reference_id || session.metadata?.userId;
        const customerEmail = session.customer_email || session.customer_details?.email;
        const customerId = typeof session.customer === 'string' ? session.customer : session.customer?.id;
        const subscriptionId = typeof session.subscription === 'string' ? session.subscription : session.subscription?.id;
        const planName = session.metadata?.planName || 'Consulta';
        const billingCycle = session.metadata?.billingCycle || 'mensal';

        const isPaid = session.payment_status === 'paid';
        const newStatus = isPaid ? 'active' : 'pending';

        console.log(`[Stripe Webhook] checkout.session.completed: status=${newStatus}, email=${customerEmail}, plano=${planName}`);

        const updateData: Record<string, any> = {
          subscription_status: newStatus,
          plan: planName,
          billing_cycle: billingCycle,
        };
        if (customerId) updateData.stripe_customer_id = customerId;
        if (subscriptionId) updateData.stripe_subscription_id = subscriptionId;

        await updateProfileRecord(
          supabase,
          { userId, customerEmail, stripeSubscriptionId: subscriptionId, stripeCustomerId: customerId },
          updateData
        );
        break;
      }

      // ==========================================
      // 2. CHECKOUT SESSION: PAGAMENTO ASSÍNCRONO CONCLUÍDO (Ex: Boleto pago)
      // ==========================================
      case 'checkout.session.async_payment_succeeded': {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.client_reference_id || session.metadata?.userId;
        const customerEmail = session.customer_email || session.customer_details?.email;
        const customerId = typeof session.customer === 'string' ? session.customer : session.customer?.id;
        const subscriptionId = typeof session.subscription === 'string' ? session.subscription : session.subscription?.id;
        const planName = session.metadata?.planName;
        const billingCycle = session.metadata?.billingCycle;

        console.log(`[Stripe Webhook] checkout.session.async_payment_succeeded para: ${customerEmail || userId}`);

        const updateData: Record<string, any> = {
          subscription_status: 'active'
        };
        if (planName) updateData.plan = planName;
        if (billingCycle) updateData.billing_cycle = billingCycle;
        if (customerId) updateData.stripe_customer_id = customerId;
        if (subscriptionId) updateData.stripe_subscription_id = subscriptionId;

        await updateProfileRecord(
          supabase,
          { userId, customerEmail, stripeSubscriptionId: subscriptionId, stripeCustomerId: customerId },
          updateData
        );
        break;
      }

      // ==========================================
      // 3. CHECKOUT SESSION: PAGAMENTO ASSÍNCRONO FALHOU (Ex: Boleto expirado/rejeitado)
      // ==========================================
      case 'checkout.session.async_payment_failed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.client_reference_id || session.metadata?.userId;
        const customerEmail = session.customer_email || session.customer_details?.email;
        const customerId = typeof session.customer === 'string' ? session.customer : session.customer?.id;
        const subscriptionId = typeof session.subscription === 'string' ? session.subscription : session.subscription?.id;

        console.warn(`[Stripe Webhook] checkout.session.async_payment_failed para: ${customerEmail || userId}`);

        await updateProfileRecord(
          supabase,
          { userId, customerEmail, stripeSubscriptionId: subscriptionId, stripeCustomerId: customerId },
          { subscription_status: 'pending' }
        );
        break;
      }

      // ==========================================
      // 4. CHECKOUT SESSION: EXPIRADA (Usuário não concluiu checkout)
      // ==========================================
      case 'checkout.session.expired': {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.client_reference_id || session.metadata?.userId;
        const customerEmail = session.customer_email || session.customer_details?.email;

        console.log(`[Stripe Webhook] checkout.session.expired para: ${customerEmail || userId}`);
        // Sessão expirou sem pagamento; mantém pendente se ainda não ativo
        break;
      }

      // ==========================================
      // 5. SUBSCRIPTION: CRIADA
      // ==========================================
      case 'customer.subscription.created': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = typeof subscription.customer === 'string' ? subscription.customer : subscription.customer?.id;
        const userId = subscription.metadata?.userId;
        const planName = subscription.metadata?.planName;
        const billingCycle = subscription.metadata?.billingCycle || 
          (subscription.items.data[0]?.price.recurring?.interval === 'year' ? 'anual' : 'mensal');
        const status = mapStripeSubscriptionStatus(subscription.status);

        console.log(`[Stripe Webhook] customer.subscription.created: id=${subscription.id}, status=${status}, plano=${planName}`);

        const updateData: Record<string, any> = {
          subscription_status: status,
          stripe_subscription_id: subscription.id
        };
        if (customerId) updateData.stripe_customer_id = customerId;
        if (planName) updateData.plan = planName;
        if (billingCycle) updateData.billing_cycle = billingCycle;

        await updateProfileRecord(
          supabase,
          { userId, stripeSubscriptionId: subscription.id, stripeCustomerId: customerId },
          updateData
        );
        break;
      }

      // ==========================================
      // 6. SUBSCRIPTION: ATUALIZADA (Renovação, upgrade/downgrade, status)
      // ==========================================
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = typeof subscription.customer === 'string' ? subscription.customer : subscription.customer?.id;
        const userId = subscription.metadata?.userId;
        const planName = subscription.metadata?.planName;
        const billingCycle = subscription.metadata?.billingCycle ||
          (subscription.items.data[0]?.price.recurring?.interval === 'year' ? 'anual' : 'mensal');
        const status = mapStripeSubscriptionStatus(subscription.status);

        console.log(`[Stripe Webhook] customer.subscription.updated: id=${subscription.id}, status=${status}`);

        const updateData: Record<string, any> = {
          subscription_status: status
        };
        if (planName) updateData.plan = planName;
        if (billingCycle) updateData.billing_cycle = billingCycle;
        if (customerId) updateData.stripe_customer_id = customerId;

        await updateProfileRecord(
          supabase,
          { userId, stripeSubscriptionId: subscription.id, stripeCustomerId: customerId },
          updateData
        );
        break;
      }

      // ==========================================
      // 7. SUBSCRIPTION: CANCELADA / DELETADA
      // ==========================================
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = typeof subscription.customer === 'string' ? subscription.customer : subscription.customer?.id;
        const userId = subscription.metadata?.userId;

        console.log(`[Stripe Webhook] customer.subscription.deleted: id=${subscription.id}`);

        await updateProfileRecord(
          supabase,
          { userId, stripeSubscriptionId: subscription.id, stripeCustomerId: customerId },
          { subscription_status: 'canceled' }
        );
        break;
      }

      // ==========================================
      // 8. SUBSCRIPTION: PAUSADA
      // ==========================================
      case 'customer.subscription.paused': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = typeof subscription.customer === 'string' ? subscription.customer : subscription.customer?.id;
        const userId = subscription.metadata?.userId;

        console.log(`[Stripe Webhook] customer.subscription.paused: id=${subscription.id}`);

        await updateProfileRecord(
          supabase,
          { userId, stripeSubscriptionId: subscription.id, stripeCustomerId: customerId },
          { subscription_status: 'paused' }
        );
        break;
      }

      // ==========================================
      // 9. SUBSCRIPTION: ATUALIZAÇÃO PENDENTE APLICADA (Ex: troca de plano no fim do ciclo)
      // ==========================================
      case 'customer.subscription.pending_update_applied': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = typeof subscription.customer === 'string' ? subscription.customer : subscription.customer?.id;
        const userId = subscription.metadata?.userId;
        const planName = subscription.metadata?.planName;
        const billingCycle = subscription.metadata?.billingCycle ||
          (subscription.items.data[0]?.price.recurring?.interval === 'year' ? 'anual' : 'mensal');
        const status = mapStripeSubscriptionStatus(subscription.status);

        console.log(`[Stripe Webhook] customer.subscription.pending_update_applied: id=${subscription.id}`);

        const updateData: Record<string, any> = {
          subscription_status: status
        };
        if (planName) updateData.plan = planName;
        if (billingCycle) updateData.billing_cycle = billingCycle;

        await updateProfileRecord(
          supabase,
          { userId, stripeSubscriptionId: subscription.id, stripeCustomerId: customerId },
          updateData
        );
        break;
      }

      // ==========================================
      // 10. SUBSCRIPTION: ATUALIZAÇÃO PENDENTE EXPIRADA
      // ==========================================
      case 'customer.subscription.pending_update_expired': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = typeof subscription.customer === 'string' ? subscription.customer : subscription.customer?.id;
        const userId = subscription.metadata?.userId;

        console.log(`[Stripe Webhook] customer.subscription.pending_update_expired: id=${subscription.id}`);

        // Registra que a alteração expirou e mantém o status atual da assinatura
        const status = mapStripeSubscriptionStatus(subscription.status);
        await updateProfileRecord(
          supabase,
          { userId, stripeSubscriptionId: subscription.id, stripeCustomerId: customerId },
          { subscription_status: status }
        );
        break;
      }

      default: {
        console.log(`[Stripe Webhook] Evento não mapeado ignorado com sucesso: ${event.type}`);
        break;
      }
    }

    // Retorna HTTP 200 para a Stripe confirmando o processamento
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
