import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { r2Client, R2_BUCKET } from '@/lib/r2';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/* ── Rate Limit em Memória (5 tentativas a cada 10 minutos) ── */
interface RateLimitEntry {
  count: number;
  resetAt: number;
}
const rateLimitStore = new Map<string, RateLimitEntry>();

function isRateLimited(key: string, maxAttempts = 5, windowMs = 10 * 60 * 1000): boolean {
  const now = Date.now();
  const entry = rateLimitStore.get(key);

  if (!entry || now > entry.resetAt) {
    rateLimitStore.set(key, { count: 1, resetAt: now + windowMs });
    return false;
  }

  if (entry.count >= maxAttempts) {
    return true;
  }

  entry.count += 1;
  return false;
}

/* ── Gerar Link de Download (R2 com validade de 7 dias ou Fallback Público) ── */
async function generateDownloadUrl(): Promise<string> {
  const zipFileName = process.env.PRESENTE_ZIP_KEY || 'presente.zip';

  // Se as credenciais do Cloudflare R2 estiverem configuradas, gera URL assinada válida por 7 dias (604.800 seg)
  if (process.env.R2_ACCESS_KEY_ID && process.env.R2_SECRET_ACCESS_KEY) {
    try {
      const command = new GetObjectCommand({
        Bucket: R2_BUCKET,
        Key: zipFileName,
      });
      // 7 dias é o prazo máximo suportado pela assinatura SigV4 do S3
      const signedUrl = await getSignedUrl(r2Client, command, { expiresIn: 604800 });
      return signedUrl;
    } catch (err) {
      console.warn('[Presente] Não foi possível gerar URL assinada no R2, usando fallback:', err);
    }
  }

  // Fallback: URL direta do Cloudflare R2 fornecida
  return 'https://pub-46b7a58b503e44bdb8e86a63a0cf51ba.r2.dev/presente.zip';
}

/* ── Template HTML do E-mail (Estrutura Oficial NeuroAcervo) ── */
function buildPresenteEmailHtml({
  nome,
  downloadUrl,
}: {
  nome?: string;
  downloadUrl: string;
}): string {
  const nomeExibicao = nome && nome.trim() ? nome.trim() : 'colega';
  const linkDownload = downloadUrl;
  const assinatura = 'Netto';
  const linkDescadastro = 'mailto:contato@neuroacervo.com.br?subject=Descadastrar';

  return `<!doctype html>
<html lang="pt-BR" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<meta name="x-apple-disable-message-reformatting">
<meta name="color-scheme" content="light">
<meta name="supported-color-schemes" content="light">
<title>Seu presente chegou: escalas para a avaliação</title>
<!--[if mso]><noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript><![endif]-->
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter+Tight:wght@800&family=Inter:wght@400;600&family=Playfair+Display:ital,wght@1,500&display=swap');
  body,table,td,a{-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%}
  table,td{mso-table-lspace:0;mso-table-rspace:0}
  img{border:0;outline:none;text-decoration:none;-ms-interpolation-mode:bicubic}
  body{margin:0!important;padding:0!important;width:100%!important;background:#efe7d2}
  a{color:#2f6b31}
  @media (max-width:620px){
    .wrap{width:100%!important}
    .px{padding-left:22px!important;padding-right:22px!important}
    .h1{font-size:30px!important;line-height:34px!important}
    .btn a{display:block!important}
    .col{display:block!important;width:100%!important}
  }
</style>
</head>
<body style="margin:0;padding:0;background:#efe7d2;">

<!-- Pré-cabeçalho (aparece na lista de e-mails) -->
<div style="display:none;max-height:0;overflow:hidden;mso-hide:all;font-size:1px;line-height:1px;color:#efe7d2;opacity:0;">
  Suas 5 escalas estão aqui, prontas para imprimir.&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;
</div>

<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#efe7d2;">
<tr><td align="center" style="padding:28px 12px 40px;">

  <!--[if mso]><table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0"><tr><td><![endif]-->
  <table role="presentation" class="wrap" width="600" cellpadding="0" cellspacing="0" border="0" style="width:600px;max-width:600px;">

    <!-- Marca -->
    <tr><td class="px" style="padding:0 8px 18px;">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
        <td valign="middle" style="padding-right:9px;"><img src="https://www.neuroacervo.com.br/brand/email-simbolo.png" width="20" height="26" alt="" style="display:block;width:20px;height:26px;"></td>
        <td valign="middle" style="font-family:'Inter Tight',Arial,Helvetica,sans-serif;font-weight:800;font-size:19px;letter-spacing:-0.4px;color:#15140f;">NeuroAcervo</td>
      </tr></table>
    </td></tr>

    <!-- Cartão principal -->
    <tr><td style="background:#f7f1de;border-radius:20px;border:1px solid #e2d9c1;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">

        <!-- Faixa verde -->
        <tr><td style="background:#2f6b31;border-radius:20px 20px 0 0;padding:34px 40px 30px;" class="px">
          <p style="margin:0;font-family:'Courier New',Courier,monospace;font-size:12px;letter-spacing:2.4px;text-transform:uppercase;color:#dafeaa;">Seu presente chegou</p>
          <h1 class="h1" style="margin:12px 0 0;font-family:'Inter Tight',Arial,Helvetica,sans-serif;font-weight:800;font-size:36px;line-height:40px;letter-spacing:-1.2px;color:#ffffff;">
            Olá, ${nomeExibicao}. Aqui estão as suas <span style="font-family:'Playfair Display',Georgia,'Times New Roman',serif;font-style:italic;font-weight:500;letter-spacing:0;color:#dafeaa;">escalas</span>.
          </h1>
        </td></tr>

        <!-- Texto -->
        <tr><td class="px" style="padding:30px 40px 6px;font-family:Inter,Arial,Helvetica,sans-serif;font-size:16px;line-height:26px;color:#3d3930;">
          <p style="margin:0 0 14px;">Quem faz avaliação sabe o quanto se perde de tempo procurando escala na internet: versões incompletas, arquivos sem fonte confiável, links que não abrem.</p>
          <p style="margin:0;">Por isso separei as escalas que considero <strong style="color:#15140f;">imprescindíveis na avaliação</strong>, as que mais ajudam na identificação dos transtornos que mais aparecem na clínica. Estão todas em PDF, prontas para imprimir.</p>
        </td></tr>

        <!-- Lista das escalas -->
        <tr><td class="px" style="padding:22px 40px 4px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-top:1px dashed #d6ccb2;">
            <tr><td style="padding:12px 0;border-bottom:1px dashed #d6ccb2;font-family:Inter,Arial,Helvetica,sans-serif;font-size:15px;color:#5a5448;">
              <span style="display:inline-block;width:30px;font-family:'Courier New',Courier,monospace;font-weight:bold;color:#2f6b31;">01</span><strong style="color:#15140f;font-family:'Inter Tight',Arial,Helvetica,sans-serif;">AQ-10</strong> &nbsp;·&nbsp; autismo, adultos</td></tr>
            <tr><td style="padding:12px 0;border-bottom:1px dashed #d6ccb2;font-family:Inter,Arial,Helvetica,sans-serif;font-size:15px;color:#5a5448;">
              <span style="display:inline-block;width:30px;font-family:'Courier New',Courier,monospace;font-weight:bold;color:#2f6b31;">02</span><strong style="color:#15140f;font-family:'Inter Tight',Arial,Helvetica,sans-serif;">ASRS-18</strong> &nbsp;·&nbsp; TDAH, adultos</td></tr>
            <tr><td style="padding:12px 0;border-bottom:1px dashed #d6ccb2;font-family:Inter,Arial,Helvetica,sans-serif;font-size:15px;color:#5a5448;">
              <span style="display:inline-block;width:30px;font-family:'Courier New',Courier,monospace;font-weight:bold;color:#2f6b31;">03</span><strong style="color:#15140f;font-family:'Inter Tight',Arial,Helvetica,sans-serif;">GAD-7</strong> &nbsp;·&nbsp; ansiedade, adultos</td></tr>
            <tr><td style="padding:12px 0;border-bottom:1px dashed #d6ccb2;font-family:Inter,Arial,Helvetica,sans-serif;font-size:15px;color:#5a5448;">
              <span style="display:inline-block;width:30px;font-family:'Courier New',Courier,monospace;font-weight:bold;color:#2f6b31;">04</span><strong style="color:#15140f;font-family:'Inter Tight',Arial,Helvetica,sans-serif;">SCARED</strong> &nbsp;·&nbsp; ansiedade, versão crianças</td></tr>
            <tr><td style="padding:12px 0;border-bottom:1px dashed #d6ccb2;font-family:Inter,Arial,Helvetica,sans-serif;font-size:15px;color:#5a5448;">
              <span style="display:inline-block;width:30px;font-family:'Courier New',Courier,monospace;font-weight:bold;color:#2f6b31;">05</span><strong style="color:#15140f;font-family:'Inter Tight',Arial,Helvetica,sans-serif;">SCARED</strong> &nbsp;·&nbsp; ansiedade, versão pais</td></tr>
          </table>
        </td></tr>

        <!-- Botão principal (à prova de Outlook) -->
        <tr><td class="px btn" align="left" style="padding:28px 40px 8px;">
          <!--[if mso]>
          <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" href="${linkDownload}" style="height:56px;v-text-anchor:middle;width:300px;" arcsize="22%" stroke="f" fillcolor="#15140f">
            <w:anchorlock/><center style="color:#dafeaa;font-family:Arial,sans-serif;font-size:17px;font-weight:bold;">Baixar as 5 escalas</center>
          </v:roundrect>
          <![endif]-->
          <!--[if !mso]><!-->
          <a href="${linkDownload}" target="_blank" style="display:inline-block;background:#15140f;color:#dafeaa;text-decoration:none;font-family:'Inter Tight',Arial,Helvetica,sans-serif;font-weight:800;font-size:17px;letter-spacing:-0.3px;line-height:56px;height:56px;padding:0 32px;border-radius:12px;text-align:center;mso-hide:all;">Baixar as 5 escalas &rarr;</a>
          <!--<![endif]-->
        </td></tr>
        <tr><td class="px" style="padding:4px 40px 30px;font-family:Inter,Arial,Helvetica,sans-serif;font-size:13px;line-height:20px;color:#7a7262;">
          O link fica disponível por 7 dias. Salve os arquivos no seu computador.
        </td></tr>

        <!-- Bloco acervo -->
        <tr><td class="px" style="padding:0 40px 34px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#efe7d2;border-radius:14px;">
            <tr><td style="padding:24px 24px 22px;">
              <p style="margin:0;font-family:'Courier New',Courier,monospace;font-size:11px;letter-spacing:2.2px;text-transform:uppercase;color:#2f6b31;">E a correção?</p>
              <p style="margin:8px 0 0;font-family:'Inter Tight',Arial,Helvetica,sans-serif;font-weight:800;font-size:21px;line-height:26px;letter-spacing:-0.5px;color:#15140f;">A correção e a interpretação de cada escala estão no acervo completo.</p>
              <p style="margin:10px 0 0;font-family:Inter,Arial,Helvetica,sans-serif;font-size:15px;line-height:23px;color:#5a5448;">Lá você também encontra guias rápidos de aplicação e interpretação, modelos de laudo editáveis, roteiros de anamnese e o prontuário com dossiê clínico. Planos <strong style="color:#15140f;">a partir de R$&nbsp;24,90/mês</strong>.</p>
              <p style="margin:16px 0 0;">
                <a href="https://www.neuroacervo.com.br/#planos" target="_blank" style="display:inline-block;font-family:'Inter Tight',Arial,Helvetica,sans-serif;font-weight:800;font-size:15px;color:#15140f;text-decoration:none;border:1.5px solid #15140f;border-radius:10px;padding:11px 18px;">Conhecer os planos &rarr;</a>
              </p>
            </td></tr>
          </table>
        </td></tr>

        <!-- Assinatura -->
        <tr><td class="px" style="padding:0 40px 34px;font-family:Inter,Arial,Helvetica,sans-serif;font-size:15px;line-height:24px;color:#3d3930;">
          Bom uso, e me conta depois qual escala você mais usa.<br>
          <span style="font-family:'Playfair Display',Georgia,'Times New Roman',serif;font-style:italic;font-size:18px;color:#2f6b31;">${assinatura}</span><br>
          <span style="font-size:13px;color:#7a7262;">Criador do NeuroAcervo</span>
        </td></tr>

      </table>
    </td></tr>

    <!-- Rodapé -->
    <tr><td class="px" align="center" style="padding:24px 24px 0;font-family:Inter,Arial,Helvetica,sans-serif;font-size:12px;line-height:19px;color:#7a7262;">
      Material de apoio para estudantes, psicólogos e neuropsicólogos. Não substitui os manuais e as publicações originais dos instrumentos.<br><br>
      Você recebeu este e-mail porque pediu o presente em <a href="https://www.neuroacervo.com.br" target="_blank" style="color:#5a5448;">neuroacervo.com.br</a>.<br>
      <a href="${linkDescadastro}" target="_blank" style="color:#5a5448;">Não quero mais receber e-mails</a>
    </td></tr>

  </table>
  <!--[if mso]></td></tr></table><![endif]-->

</td></tr>
</table>
</body>
</html>`;
}

/* ── POST /api/presente ── */
export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || req.headers.get('x-real-ip') || '127.0.0.1';
    const userAgent = req.headers.get('user-agent') || '';

    // 1. Extração do corpo
    const body = await req.json().catch(() => null);
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ ok: false, error: 'Dados inválidos.' }, { status: 400 });
    }

    const {
      email,
      nome = '',
      consentimento,
      honeypot,
      utm_source = '',
      utm_medium = '',
      utm_campaign = '',
      utm_content = ''
    } = body;

    // 2. Honeypot silencioso (se preenchido, é bot)
    if (honeypot && String(honeypot).trim() !== '') {
      console.warn(`[Presente] Honeypot ativado para IP ${ip}`);
      return NextResponse.json({ ok: true });
    }

    // 3. Validação de e-mail e consentimento
    const cleanEmail = String(email || '').trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    if (!cleanEmail || !emailRegex.test(cleanEmail)) {
      return NextResponse.json({ ok: false, error: 'Informe um endereço de e-mail válido.' }, { status: 400 });
    }

    if (consentimento !== true) {
      return NextResponse.json({ ok: false, error: 'É necessário concordar com os termos para receber o presente.' }, { status: 400 });
    }

    // 4. Rate limit simples por IP e por e-mail
    if (isRateLimited(`ip_${ip}`, 5) || isRateLimited(`email_${cleanEmail}`, 5)) {
      return NextResponse.json(
        { ok: false, error: 'Muitas tentativas em pouco tempo. Por favor, aguarde alguns minutos antes de tentar novamente.' },
        { status: 429 }
      );
    }

    // 5. Salva no banco (Supabase) sem duplicar
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

    if (supabaseUrl && supabaseKey) {
      try {
        const supabase = createClient(supabaseUrl, supabaseKey, {
          auth: { persistSession: false }
        });

        const { error: dbError } = await supabase
          .from('leads_presente')
          .upsert(
            {
              email: cleanEmail,
              nome: String(nome || '').trim(),
              consentimento: true,
              data_consentimento: new Date().toISOString(),
              origem: 'modal-presente',
              utm_source: String(utm_source || '').slice(0, 100),
              utm_medium: String(utm_medium || '').slice(0, 100),
              utm_campaign: String(utm_campaign || '').slice(0, 100),
              utm_content: String(utm_content || '').slice(0, 100),
              user_agent: userAgent.slice(0, 300),
              updated_at: new Date().toISOString()
            },
            { onConflict: 'email' }
          );

        if (dbError) {
          console.warn('[Presente] Aviso ao salvar lead no Supabase (verifique se executou a migração SQL):', dbError.message);
        }
      } catch (dbErr) {
        console.warn('[Presente] Erro inesperado ao interagir com Supabase:', dbErr);
      }
    }

    // 6. Gera link de download (R2 assinado ou fallback)
    const downloadUrl = await generateDownloadUrl();

    // 7. Envio do e-mail com Resend
    const resendApiKey = process.env.RESEND_API_KEY;
    const fromSender = process.env.EMAIL_FROM || 'NeuroAcervo <contato@neuroacervo.com.br>';

    if (resendApiKey) {
      try {
        const emailHtml = buildPresenteEmailHtml({
          nome: String(nome || '').trim(),
          downloadUrl
        });

        const resendResponse = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${resendApiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            from: fromSender,
            to: [cleanEmail],
            subject: 'Seu presente chegou: escalas para a avaliação',
            html: emailHtml,
            attachments: [
              {
                filename: 'presente-escalas-neuroacervo.zip',
                path: 'https://pub-46b7a58b503e44bdb8e86a63a0cf51ba.r2.dev/presente.zip'
              }
            ]
          })
        });

        if (!resendResponse.ok) {
          const resendErr = await resendResponse.text();
          console.error('[Presente] Erro retornado pela API do Resend:', resendResponse.status, resendErr);
        } else {
          console.log(`[Presente] E-mail enviado com sucesso para ${cleanEmail} via Resend.`);
        }
      } catch (mailErr) {
        console.error('[Presente] Falha na requisição para o Resend:', mailErr);
      }
    } else {
      console.log(`[Presente DEV] RESEND_API_KEY não configurada no .env.local. Simulando envio para ${cleanEmail}. Link gerado: ${downloadUrl}`);
    }

    // 8. Resposta de sucesso (nunca expor erros internos)
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('[Presente] Erro inesperado no endpoint:', error);
    // Mesmo em falha inesperada, não expõe stack trace
    return NextResponse.json({ ok: false, error: 'Ocorreu um erro ao processar seu pedido. Tente novamente em instantes.' }, { status: 500 });
  }
}
