import { NextRequest, NextResponse } from 'next/server';
import { verifyUserRequest } from '@/lib/serverAuth';
import { softDeleteAnxietyEntry } from '@/lib/clinicalServer';

export const dynamic = 'force-dynamic';

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
    return NextResponse.json({ error: 'ID do registro obrigatório' }, { status: 400 });
  }

  try {
    const success = await softDeleteAnxietyEntry(auth.user.id, id);
    if (!success) {
      return NextResponse.json({ error: 'Registro não encontrado ou não autorizado' }, { status: 404 });
    }

    return NextResponse.json({ success: true, deletedId: id });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Erro ao excluir registro' }, { status: 500 });
  }
}
