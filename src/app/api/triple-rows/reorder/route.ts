import { NextRequest, NextResponse } from 'next/server';
import { verifyUserRequest } from '@/lib/serverAuth';
import { reorderTripleRows } from '@/lib/clinicalServer';

export const dynamic = 'force-dynamic';

export async function PATCH(req: NextRequest) {
  const auth = await verifyUserRequest(req);
  if (!auth.authorized || !auth.user) {
    return auth.errorResponse || NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const ids: string[] = body.ids || [];

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: 'Lista de IDs obrigatória para reordenação' }, { status: 400 });
    }

    const success = await reorderTripleRows(auth.user.id, ids);
    if (!success) {
      return NextResponse.json({ error: 'Falha ao salvar nova ordem' }, { status: 500 });
    }

    return NextResponse.json({ success: true, count: ids.length });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Erro ao reordenar episódios' }, { status: 500 });
  }
}
