import { NextRequest, NextResponse } from 'next/server';
import { verifyUserRequest } from '@/lib/serverAuth';
import {
  getOrCreateDraftFormulation,
  updateDraftFormulation
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

  try {
    const formulation = await getOrCreateDraftFormulation(auth.user.id, patientId);
    return NextResponse.json({ success: true, data: formulation });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Erro ao buscar formulação' }, { status: 500 });
  }
}

export async function PATCH(
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
    const updated = await updateDraftFormulation(auth.user.id, patientId, body);
    return NextResponse.json({ success: true, data: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Erro ao atualizar formulação' }, { status: 500 });
  }
}
