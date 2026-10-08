import { NextRequest, NextResponse } from 'next/server';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { r2Client, R2_BUCKET, R2_PUBLIC_URL } from '@/lib/r2';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function sanitizeFileName(name: string): string {
  const parts = name.split('.');
  const ext = parts.length > 1 ? `.${parts.pop()}` : '';
  const base = parts.join('.');
  const safeBase = base
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 60);

  return `${Date.now()}-${safeBase}${ext}`;
}

export async function POST(req: NextRequest) {
  try {
    if (!process.env.R2_ACCESS_KEY_ID || !process.env.R2_SECRET_ACCESS_KEY) {
      return NextResponse.json(
        { error: 'Credenciais do Cloudflare R2 não configuradas no servidor.' },
        { status: 500 }
      );
    }

    const body = await req.json();
    const { fileName, contentType = 'application/pdf' } = body;

    if (!fileName) {
      return NextResponse.json({ error: 'Nome do arquivo não fornecido.' }, { status: 400 });
    }

    const key = sanitizeFileName(fileName);

    const command = new PutObjectCommand({
      Bucket: R2_BUCKET,
      Key: key,
      ContentType: contentType,
    });

    const uploadUrl = await getSignedUrl(r2Client, command, { expiresIn: 3600 });
    const publicUrl = `${R2_PUBLIC_URL}/${key}`;

    return NextResponse.json({
      success: true,
      uploadUrl,
      publicUrl,
      key,
    });
  } catch (error: any) {
    console.error('Erro ao gerar Presigned URL para R2:', error);
    return NextResponse.json(
      { error: error?.message || 'Falha ao gerar URL de upload para o Cloudflare R2.' },
      { status: 500 }
    );
  }
}
