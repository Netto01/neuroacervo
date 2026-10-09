import { NextRequest, NextResponse } from 'next/server';
import { R2_PUBLIC_URL } from '@/lib/r2';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
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

    // Redireciona com 307 diretamente para o CDN público do Cloudflare R2
    // Suporta streaming byte-range nativo, CORS liberado e sem limite de 4.5MB da Vercel
    const directUrl = `${R2_PUBLIC_URL}/${targetKey}`;
    return NextResponse.redirect(directUrl, 307);
  } catch (error: any) {
    console.error('Erro ao redirecionar para PDF do R2:', error);
    return NextResponse.json(
      { error: error?.message || 'Falha ao recuperar o arquivo do Cloudflare R2.' },
      { status: 500 }
    );
  }
}
