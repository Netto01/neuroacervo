import { NextRequest, NextResponse } from 'next/server';
import { R2_PUBLIC_URL } from '@/lib/r2';
import { verifyUserRequest } from '@/lib/serverAuth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const authCheck = await verifyUserRequest(req);
    if (!authCheck.authorized) {
      return authCheck.errorResponse!;
    }

    const isAdmin = authCheck.isAdmin;
    const isActiveSubscriber = authCheck.profile?.subscription_status === 'active';

    if (!isAdmin && !isActiveSubscriber) {
      return NextResponse.json(
        { error: 'Acesso restrito. Assine um plano para acessar e baixar os materiais completos.' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const key = searchParams.get('key');
    const urlParam = searchParams.get('url');

    let targetKey = key;

    if (!targetKey && urlParam) {
      try {
        const parsed = new URL(urlParam);
        targetKey = parsed.pathname.replace(/^\/+/, '');
      } catch {
        targetKey = urlParam.replace(/^https?:\/\/[^/]+\//, '');
      }
    }

    if (!targetKey) {
      return NextResponse.json({ error: 'Parâmetro key ou url ausente.' }, { status: 400 });
    }

    // Redireciona com 307 diretamente para o CDN do Cloudflare R2
    const directUrl = `${R2_PUBLIC_URL}/${targetKey}`;
    return new NextResponse(null, {
      status: 307,
      headers: {
        Location: directUrl,
        'Cache-Control': 'private, no-cache, no-store, must-revalidate'
      }
    });
  } catch (error: any) {
    console.error('Erro ao redirecionar para PDF do R2:', error);
    return NextResponse.json(
      { error: error?.message || 'Falha ao recuperar o arquivo do Cloudflare R2.' },
      { status: 500 }
    );
  }
}
