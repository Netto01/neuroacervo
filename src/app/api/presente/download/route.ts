import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Link de download do presente servido pelo próprio domínio do NeuroAcervo.
 * Os e-mails apontam para cá (e não direto para r2.dev) para melhorar a
 * reputação do e-mail nos filtros de spam; aqui redirecionamos ao arquivo.
 */
const ZIP_PUBLICO = 'https://pub-46b7a58b503e44bdb8e86a63a0cf51ba.r2.dev/presente.zip';

export async function GET() {
  return NextResponse.redirect(ZIP_PUBLICO, 302);
}
