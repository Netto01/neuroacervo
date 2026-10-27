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
  const zipFileName = 'presente-escalas-neuroacervo.zip';

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

  // Fallback: URL do CDN do R2 ou caminho público da aplicação
  if (process.env.NEXT_PUBLIC_R2_PUBLIC_URL) {
    return `${process.env.NEXT_PUBLIC_R2_PUBLIC_URL.replace(/\/+$/, '')}/${zipFileName}`;
  }

  return `https://www.neuroacervo.com.br/${zipFileName}`;
}

/* ── Template HTML do E-mail (Identidade Visual da Marca) ── */
function buildPresenteEmailHtml({
  nome,
  downloadUrl,
}: {
  nome?: string;
  downloadUrl: string;
}): string {
  const saudacao = nome && nome.trim() ? `Olá, ${nome.trim()}!` : 'Olá!';

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Seu presente chegou: escalas para a avaliação</title>
</head>
<body style="margin: 0; padding: 0; background-color: #efe7d2; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #15140f; -webkit-font-smoothing: antialiased;">
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #efe7d2; padding: 32px 16px;">
    <tr>
      <td align="center">
        <!-- Card Principal -->
        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 580px; background-color: #f7f1de; border: 1px solid rgba(21, 20, 15, 0.12); border-radius: 16px; overflow: hidden; box-shadow: 0 12px 30px rgba(21, 20, 15, 0.06);">
          
          <!-- Cabeçalho com Logo -->
          <tr>
            <td style="padding: 32px 36px 20px 36px; border-bottom: 1px solid rgba(21, 20, 15, 0.08);">
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td>
                    <span style="font-family: 'Courier New', Courier, monospace; font-size: 11px; font-weight: bold; letter-spacing: 0.14em; text-transform: uppercase; color: #2f6b31;">
                      NEUROACERVO · ACERVO CLÍNICO
                    </span>
                    <h1 style="margin: 6px 0 0 0; font-size: 24px; font-weight: 800; color: #15140f; line-height: 1.2;">
                      Seu presente chegou
                    </h1>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Corpo do E-mail -->
          <tr>
            <td style="padding: 32px 36px 36px 36px;">
              <p style="margin: 0 0 16px 0; font-size: 16px; line-height: 1.6; color: #15140f;">
                ${saudacao}
              </p>
              
              <p style="margin: 0 0 20px 0; font-size: 15px; line-height: 1.65; color: #2a2620;">
                Aqui está o seu pacote com as <strong>5 escalas em PDF</strong> selecionadas para a prática clínica da avaliação neuropsicológica e psicológica:
              </p>

              <!-- Lista das 5 Escalas -->
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border: 1px solid rgba(21, 20, 15, 0.1); border-radius: 12px; margin-bottom: 28px; padding: 18px 20px;">
                <tr>
                  <td>
                    <ul style="margin: 0; padding-left: 18px; font-size: 14px; line-height: 1.8; color: #15140f;">
                      <li><strong>AQ-10</strong> — Rastreio de traços autistas (adultos)</li>
                      <li><strong>ASRS-18</strong> — Rastreio de TDAH no adulto (critérios DSM-5)</li>
                      <li><strong>GAD-7</strong> — Avaliação de ansiedade generalizada (adultos)</li>
                      <li><strong>SCARED (Versão Crianças)</strong> — Rastreio de transtornos de ansiedade na infância</li>
                      <li><strong>SCARED (Versão Pais)</strong> — Heterorrelato complementar para pais/responsáveis</li>
                    </ul>
                  </td>
                </tr>
              </table>

              <!-- Botão de Download em Destaque -->
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 24px;">
                <tr>
                  <td align="center">
                    <a href="${downloadUrl}" target="_blank" style="display: inline-block; background-color: #dafeaa; color: #15140f; font-size: 16px; font-weight: 800; text-decoration: none; padding: 16px 32px; border-radius: 12px; border: 1px solid rgba(21, 20, 15, 0.12); box-shadow: 0 4px 14px rgba(21, 20, 15, 0.08); text-align: center;">
                      Baixar as escalas em PDF (.zip)
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 0 0 24px 0; font-size: 12.5px; line-height: 1.5; color: #5a5448; text-align: center;">
                <em>Este link de download é seguro e expira em 7 dias.</em>
              </p>

              <!-- Bloco Informativo sobre Acervo Completo -->
              <div style="background-color: rgba(47, 107, 49, 0.06); border-left: 3px solid #2f6b31; padding: 14px 16px; border-radius: 6px; margin-bottom: 28px;">
                <p style="margin: 0; font-size: 13.5px; line-height: 1.55; color: #2a2620;">
                  <strong>Importante:</strong> os PDFs enviados trazem as folhas de aplicação das escalas. As <strong>tabelas de corte, roteiros de correção detalhados e guias clínicos de interpretação</strong> fazem parte do acervo fechado da NeuroAcervo, disponível para assinantes a partir de <strong>R$ 24,90/mês</strong>.
                </p>
                <p style="margin: 10px 0 0 0; font-size: 13px;">
                  <a href="https://www.neuroacervo.com.br/#planos" target="_blank" style="color: #2f6b31; font-weight: 700; text-decoration: underline;">
                    Conhecer todos os recursos do acervo completo &rarr;
                  </a>
                </p>
              </div>

              <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #5a5448;">
                Bom trabalho e ótimas avaliações,<br>
                <strong>Equipe NeuroAcervo</strong>
              </p>
            </td>
          </tr>

          <!-- Rodapé -->
          <tr>
            <td style="padding: 20px 36px; background-color: #efe7d2; border-top: 1px solid rgba(21, 20, 15, 0.08); font-size: 11.5px; line-height: 1.6; color: #7c7768; text-align: center;">
              <p style="margin: 0 0 8px 0;">
                Você recebeu esta mensagem porque solicitou o pacote gratuito de escalas em <a href="https://www.neuroacervo.com.br" style="color: #15140f; text-decoration: underline;">neuroacervo.com.br</a>.
              </p>
              <p style="margin: 0;">
                <a href="https://www.neuroacervo.com.br/termos" style="color: #7c7768; text-decoration: underline;">Termos de Uso</a> · 
                <a href="https://www.neuroacervo.com.br/privacidade" style="color: #7c7768; text-decoration: underline;">Privacidade</a> · 
                <a href="mailto:contato@neuroacervo.com.br?subject=Descadastrar" style="color: #7c7768; text-decoration: underline;">Cancelar recebimento</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
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
            html: emailHtml
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
