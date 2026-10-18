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
      return NextResponse.json(
        { error: 'STRIPE_SECRET_KEY não configurada no servidor.' },
        { status: 500 }
      );
    }

    let body: any = {};
    try {
      body = await req.json();
    } catch {}

    const authUser = authCheck.user!;
    const authProfile = authCheck.profile;
    const isAdmin = authCheck.isAdmin;

    // Apenas administradores podem solicitar portal em nome de outro e-mail
    const targetEmail = (isAdmin && body?.userEmail ? body.userEmail : authUser.email || '').trim().toLowerCase();
    const targetUserId = isAdmin && body?.userId ? body.userId : authUser.id;

    if (!targetEmail) {
      return NextResponse.json(
        { error: 'E-mail do usuário não identificado.' },
        { status: 400 }
      );
    }

    const stripe = new Stripe(secretKey, {
      httpClient: Stripe.createFetchHttpClient(),
      timeout: 30000,
      maxNetworkRetries: 3
    });

    let customerId = (targetUserId === authUser.id ? authProfile?.stripe_customer_id : body?.stripeCustomerId) || body?.stripeCustomerId;

    // Se o cliente não tem o stripeCustomerId informado, busca na Stripe pelo e-mail
    if (!customerId) {
      const customers = await stripe.customers.list({
        email: targetEmail,
        limit: 1
      });

      if (customers.data && customers.data.length > 0) {
        customerId = customers.data[0].id;

        // Atualiza no Supabase se houver userId e cliente administrativo
        if (targetUserId) {
          try {
            const supabase = getSupabaseAdmin();
            if (supabase) {
              await supabase
                .from('profiles')
                .update({ stripe_customer_id: customerId })
                .eq('id', targetUserId);
            }
          } catch (updateErr) {
            console.warn('Aviso ao salvar stripe_customer_id no perfil:', updateErr);
          }
        }
      }
    }

    if (!customerId) {
      return NextResponse.json(
        {
          error: 'no_stripe_customer',
          message: 'Nenhum registro de assinatura ou cliente localizado na Stripe para este e-mail.'
        },
        { status: 404 }
      );
    }

    const origin = req.headers.get('origin') || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const returnUrl = `${origin}/plataforma/assinatura`;

    // Cria a sessão do portal do cliente Stripe
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl
    });

    return NextResponse.json({
      url: portalSession.url
    });
  } catch (error: any) {
    console.error('Erro ao gerar sessão do Stripe Billing Portal:', error);
    return NextResponse.json(
      { error: error?.message || 'Falha ao conectar com o Portal Stripe.' },
      { status: 500 }
    );
  }
}
