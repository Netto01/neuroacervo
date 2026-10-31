import { NextRequest, NextResponse } from 'next/server';
import { verifyUserRequest } from '@/lib/serverAuth';
import { updateTripleRowField, softDeleteTripleRow, restoreTripleRow } from '@/lib/clinicalServer';

export const dynamic = 'force-dynamic';

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const auth = await verifyUserRequest(req);
  if (!auth.authorized || !auth.user) {
    return auth.errorResponse || NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  const { id } = await context.params;
  if (!id) {
    return NextResponse.json({ error: 'ID do episódio obrigatório' }, { status: 400 });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const updated = await updateTripleRowField(auth.user.id, id, body);

    if (!updated) {
      return NextResponse.json({ error: 'Episódio não encontrado ou não autorizado' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Erro ao atualizar episódio' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const auth = await verifyUserRequest(req);
  if (!auth.authorized || !auth.user) {
    return auth.errorResponse || NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  const { id } = await context.params;
  if (!id) {
    return NextResponse.json({ error: 'ID do episódio obrigatório' }, { status: 400 });
  }

  try {
    const success = await softDeleteTripleRow(auth.user.id, id);
    if (!success) {
      return NextResponse.json({ error: 'Episódio não encontrado ou não autorizado' }, { status: 404 });
    }

    return NextResponse.json({ success: true, deletedId: id });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Erro ao excluir episódio' }, { status: 500 });
  }
}

/**
 * Ação de restauração/desfazer exclusão dentro da janela de 10 segundos
 */
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
    return NextResponse.json({ error: 'ID do episódio obrigatório' }, { status: 400 });
  }

  try {
    const body = await req.json().catch(() => ({}));
    if (body.action === 'restore') {
      const restored = await restoreTripleRow(auth.user.id, id);
      if (!restored) {
        return NextResponse.json({ error: 'Não foi possível restaurar o episódio' }, { status: 400 });
      }
      return NextResponse.json({ success: true, restoredId: id });
    }

    return NextResponse.json({ error: 'Ação não suportada' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Erro ao processar ação' }, { status: 500 });
  }
}
