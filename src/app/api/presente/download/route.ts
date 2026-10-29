import { NextRequest, NextResponse } from 'next/server';
import {
  generateDownloadUrl,
  buildPresenteObrigadoHtml,
  DEFAULT_WHATSAPP_GRUPO_URL
} from '@/lib/presenteDownload';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const downloadUrl = await generateDownloadUrl();

  // Se for solicitado download direto sem página (ex: ?direct=1)
  if (req.nextUrl.searchParams.get('direct') === '1') {
    return NextResponse.redirect(downloadUrl, 302);
  }

  const whatsappGrupoUrl =
    process.env.WHATSAPP_GRUPO_URL?.trim() ||
    process.env.PRESENTE_WHATSAPP_URL?.trim() ||
    DEFAULT_WHATSAPP_GRUPO_URL;

  const html = buildPresenteObrigadoHtml({
    downloadUrl,
    whatsappGrupoUrl,
  });

  return new Response(html, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store, max-age=0',
    },
  });
}
