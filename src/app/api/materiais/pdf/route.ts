import { NextRequest, NextResponse } from 'next/server';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import { r2Client, R2_BUCKET } from '@/lib/r2';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const key = searchParams.get('key');
    const urlParam = searchParams.get('url');

    let targetKey = key;

    // Se passou uma URL completa (ex: https://pub-.../chave.pdf), extrai a chave
    if (!targetKey && urlParam) {
      try {
        const parsed = new URL(urlParam);
        targetKey = parsed.pathname.replace(/^\/+/, '');
      } catch {
        targetKey = urlParam.replace(/^https?:\/\/[^/]+\//, '');
      }
    }

    if (!targetKey) {
      return NextResponse.json({ error: 'Parâmetro key ou url ausente.' }, { status: 400 });
    }

    // Busca o arquivo diretamente no Cloudflare R2
    const command = new GetObjectCommand({
      Bucket: R2_BUCKET,
      Key: targetKey,
    });

    const s3Response = await r2Client.send(command);

    if (!s3Response.Body) {
      return NextResponse.json({ error: 'Arquivo não encontrado no bucket.' }, { status: 404 });
    }

    // Converte o stream do S3 para buffer/ReadableStream
    const byteArray = await s3Response.Body.transformToByteArray();

    const contentType = s3Response.ContentType || 'application/pdf';
    const contentLength = s3Response.ContentLength?.toString() || byteArray.length.toString();

    return new Response(Buffer.from(byteArray), {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Length': contentLength,
        'Content-Disposition': 'inline',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
        'Access-Control-Allow-Headers': '*',
        'Cache-Control': 'public, max-age=86400, s-maxage=86400',
      },
    });
  } catch (error: any) {
    console.error('Erro ao servir PDF do R2:', error);
    return NextResponse.json(
      { error: error?.message || 'Falha ao recuperar o arquivo do Cloudflare R2.' },
      { status: error?.$metadata?.httpStatusCode || 500 }
    );
  }
}
