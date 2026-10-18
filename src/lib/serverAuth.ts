import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export interface VerifyUserResult {
  authorized: boolean;
  user?: { id: string; email?: string };
  profile?: {
    id: string;
    email: string;
    role: string;
    plan: string;
    subscription_status?: string;
    stripe_customer_id?: string;
  };
  isAdmin?: boolean;
  errorResponse?: NextResponse;
}

export interface VerifyAdminResult {
  authorized: boolean;
  user?: { id: string; email?: string };
  errorResponse?: NextResponse;
}

/**
 * Extrai o token JWT de autenticação do header Authorization ou de cookies do Supabase.
 */
function extractAuthToken(req: Request | NextRequest): string | null {
  const authHeader = req.headers.get('authorization');
  if (authHeader) {
    const bearerToken = authHeader.replace(/^Bearer\s+/i, '').trim();
    if (bearerToken) return bearerToken;
  }

  const cookieHeader = req.headers.get('cookie') || '';
  const match = cookieHeader.match(/sb-[a-z0-9_-]+-auth-token=([^;]+)/i);
  if (match) {
    try {
      const decoded = decodeURIComponent(match[1]);
      const parsed = JSON.parse(decoded);
      return Array.isArray(parsed) ? parsed[0] : parsed?.access_token || parsed;
    } catch {}
  }

  return null;
}

/**
 * Valida se a requisição originou de um usuário autenticado.
 * Retorna os dados do usuário e do seu perfil no Supabase.
 */
export async function verifyUserRequest(req: Request | NextRequest): Promise<VerifyUserResult> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey;

  const isConfigured = Boolean(
    supabaseUrl &&
    supabaseAnonKey &&
    !supabaseUrl.includes('placeholder') &&
    supabaseAnonKey.length > 20
  );

  if (!isConfigured) {
    if (process.env.NODE_ENV === 'development') {
      return {
        authorized: true,
        user: { id: 'usr-demo', email: 'demo@neuroacervo.local' },
        profile: {
          id: 'usr-demo',
          email: 'demo@neuroacervo.local',
          role: 'member',
          plan: 'Prática',
          subscription_status: 'active'
        },
        isAdmin: false
      };
    }
    return {
      authorized: false,
      errorResponse: NextResponse.json(
        { error: 'Servidor de autenticação não configurado.' },
        { status: 500 }
      )
    };
  }

  const token = extractAuthToken(req);
  if (!token) {
    return {
      authorized: false,
      errorResponse: NextResponse.json(
        { error: 'Acesso negado: token de autenticação não fornecido.' },
        { status: 401 }
      )
    };
  }

  try {
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);

    if (userError || !user) {
      return {
        authorized: false,
        errorResponse: NextResponse.json(
          { error: 'Sessão inválida ou expirada.' },
          { status: 401 }
        )
      };
    }

    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('id, email, role, plan, subscription_status, stripe_customer_id')
      .eq('id', user.id)
      .single();

    const isAdmin = profile?.role === 'admin';

    return {
      authorized: true,
      user: { id: user.id, email: user.email },
      profile: profile || {
        id: user.id,
        email: user.email || '',
        role: 'member',
        plan: 'Consulta',
        subscription_status: 'pending'
      },
      isAdmin
    };
  } catch (err: any) {
    console.error('Erro na validação do usuário:', err);
    return {
      authorized: false,
      errorResponse: NextResponse.json(
        { error: 'Falha interna ao verificar autenticação.' },
        { status: 500 }
      )
    };
  }
}

/**
 * Valida se a requisição originou de um usuário autenticado com perfil de administrador.
 * Verifica o token JWT em Authorization: Bearer <token> ou nos cookies de autenticação do Supabase.
 * Nunca confia em dados fornecidos no client-side como user_metadata.
 */
export async function verifyAdminRequest(req: NextRequest): Promise<VerifyAdminResult> {
  const userCheck = await verifyUserRequest(req);
  if (!userCheck.authorized) {
    return {
      authorized: false,
      errorResponse: userCheck.errorResponse
    };
  }

  if (!userCheck.isAdmin) {
    return {
      authorized: false,
      errorResponse: NextResponse.json(
        { error: 'Acesso negado: requer privilégios de administrador.' },
        { status: 403 }
      )
    };
  }

  return {
    authorized: true,
    user: userCheck.user
  };
}
