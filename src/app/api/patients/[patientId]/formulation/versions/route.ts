import { NextRequest, NextResponse } from 'next/server';
import { verifyUserRequest } from '@/lib/serverAuth';
import { listFormulationVersions } from '@/lib/clinicalServer';

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
    const versions = await listFormulationVersions(auth.user.id, patientId);
    return NextResponse.json({ success: true, data: versions });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Erro ao listar versões da formulação' }, { status: 500 });
  }
}
