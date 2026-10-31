import { NextRequest, NextResponse } from 'next/server';
import { verifyUserRequest } from '@/lib/serverAuth';
import { convertAnxietyEntryToTripleRow } from '@/lib/clinicalServer';

export const dynamic = 'force-dynamic';

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const auth = await verifyUserRequest(req);
  if (!auth.authorized || !auth.user) {
    return auth.errorResponse || NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  const { id } = await context.params;
  if (!id) {
    return NextResponse.json({ error: 'ID do registro obrigatório' }, { status: 400 });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const sessionId = body.session_id;

    if (!sessionId) {
      return NextResponse.json({ error: 'session_id é obrigatório para converter em tríplice' }, { status: 400 });
    }

    const result = await convertAnxietyEntryToTripleRow(auth.user.id, id, sessionId);
    return NextResponse.json({
      success: true,
      data: result.tripleRow,
      alreadyConverted: result.alreadyConverted
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Falha ao converter registro em tríplice' }, { status: 500 });
  }
}
