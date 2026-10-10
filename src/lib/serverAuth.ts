import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export interface VerifyAdminResult {
  authorized: boolean;
  user?: { id: string; email?: string };
  errorResponse?: NextResponse;
}

/**
 * Valida se a requisição originou de um usuário autenticado com perfil de administrador.
 * Verifica o token JWT em Authorization: Bearer <token> ou nos cookies de autenticação do Supabase.
 */
export async function verifyAdminRequest(req: NextRequest): Promise<VerifyAdminResult> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey;

  const isConfigured = Boolean(
    supabaseUrl &&
    supabaseAnonKey &&
    !supabaseUrl.includes('placeholder') &&
    supabaseAnonKey.length > 20
  );

  // Se o Supabase não estiver configurado (ex: modo demo / desenvolvimento local sem chaves)
  if (!isConfigured) {
    if (process.env.NODE_ENV === 'development') {
      return { authorized: true, user: { id: 'usr-demo-admin', email: 'admin@demo.local' } };
    }
    return {
      authorized: false,
      errorResponse: NextResponse.json(
        { error: 'Servidor de autenticação não configurado.' },
        { status: 500 }
      )
    };
  }

  // 1. Extrair token do header Authorization ou Cookies
  let token = req.headers.get('authorization')?.replace(/^Bearer\s+/i, '').trim();

  if (!token) {
    // Tenta encontrar o token em cookies do Supabase
    const cookieHeader = req.headers.get('cookie') || '';
    const match = cookieHeader.match(/sb-[a-z0-9_-]+-auth-token=([^;]+)/i);
    if (match) {
      try {
        const decoded = decodeURIComponent(match[1]);
        const parsed = JSON.parse(decoded);
        token = Array.isArray(parsed) ? parsed[0] : parsed?.access_token || parsed;
      } catch {}
    }
  }

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

    // 2. Verificar se o usuário possui papel de administrador na tabela profiles
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('role, user_type')
      .eq('id', user.id)
      .single();

    const isAdmin =
      profile?.role === 'admin' ||
      profile?.user_type === 'admin' ||
      user.user_metadata?.role === 'admin';

    if (!isAdmin) {
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
      user: { id: user.id, email: user.email }
    };
  } catch (err: any) {
    console.error('Erro na validação de permissão de admin:', err);
    return {
      authorized: false,
      errorResponse: NextResponse.json(
        { error: 'Falha interna ao verificar permissões de acesso.' },
        { status: 500 }
      )
    };
  }
}
