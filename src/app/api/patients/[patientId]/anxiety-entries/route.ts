import { NextRequest, NextResponse } from 'next/server';
import { verifyUserRequest } from '@/lib/serverAuth';
import {
  getSharedAnxietyEntriesForPatient,
  createOrSyncAnxietyEntry
} from '@/lib/clinicalServer';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ patientId: string }> }
) {
  const auth = await verifyUserRequest(req);
  if (!auth.authorized || !auth.user) {
    return auth.errorResponse || NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  const { patientId } = await context.params;
  if (!patientId) {
    return NextResponse.json({ error: 'ID do paciente obrigatório' }, { status: 400 });
  }

  const url = new URL(req.url);
  const from = url.searchParams.get('from') || undefined;
  const to = url.searchParams.get('to') || undefined;
  const sinceLastSession = url.searchParams.get('since_last_session') === 'true';

  try {
    const entries = await getSharedAnxietyEntriesForPatient(auth.user.id, patientId, {
      from,
      to
    });
    return NextResponse.json({ success: true, data: entries });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Erro ao buscar diário de ansiedade' }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ patientId: string }> }
) {
  const auth = await verifyUserRequest(req);
  if (!auth.authorized || !auth.user) {
    return auth.errorResponse || NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  const { patientId } = await context.params;
  if (!patientId) {
    return NextResponse.json({ error: 'ID do paciente obrigatório' }, { status: 400 });
  }

  try {
    const body = await req.json().catch(() => ({}));
    if (!body.client_uuid) {
      body.client_uuid = crypto.randomUUID();
    }

    const saved = await createOrSyncAnxietyEntry(patientId, body);
    return NextResponse.json({ success: true, data: saved }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Erro ao registrar diário' }, { status: 400 });
  }
}
