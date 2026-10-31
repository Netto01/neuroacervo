import { NextRequest, NextResponse } from 'next/server';
import { verifyUserRequest } from '@/lib/serverAuth';
import { getTripleRowsForSession, createTripleRow } from '@/lib/clinicalServer';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ patientId: string; sessionId: string }> }
) {
  const auth = await verifyUserRequest(req);
  if (!auth.authorized || !auth.user) {
    return auth.errorResponse || NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  const { patientId, sessionId } = await context.params;

  if (!patientId || !sessionId) {
    return NextResponse.json({ error: 'Parâmetros inválidos' }, { status: 400 });
  }

  try {
    const rows = await getTripleRowsForSession(auth.user.id, patientId, sessionId);
    return NextResponse.json({ success: true, data: rows });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Erro ao buscar episódios' }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ patientId: string; sessionId: string }> }
) {
  const auth = await verifyUserRequest(req);
  if (!auth.authorized || !auth.user) {
    return auth.errorResponse || NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  const { patientId, sessionId } = await context.params;

  if (!patientId || !sessionId) {
    return NextResponse.json({ error: 'Parâmetros inválidos' }, { status: 400 });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const newRow = await createTripleRow(auth.user.id, patientId, sessionId, body);

    if (!newRow) {
      return NextResponse.json({ error: 'Não foi possível criar o episódio' }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: newRow }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Erro ao criar episódio' }, { status: 500 });
  }
}
