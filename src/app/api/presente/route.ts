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

/* ── Template HTML Editorial do E-mail ── */
function buildPresenteEmailHtml({
  nome,
  downloadUrl,
}: {
  nome?: string;
  downloadUrl: string;
}): string {
  const primeiroNome = nome && nome.trim() ? nome.trim().split(' ')[0] : '';
  const saudacao = primeiroNome ? `Olá, ${primeiroNome}!` : 'Olá!';

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Seu presente chegou: escalas para a avaliação</title>
</head>
<body style="margin: 0; padding: 0; background-color: #efe7d2; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #15140f; -webkit-font-smoothing: antialiased;">
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #efe7d2; padding: 36px 14px;">
    <tr>
      <td align="center">
        <!-- Container Principal -->
        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 590px; background-color: #f7f1de; border: 1.5px solid rgba(21, 20, 15, 0.14); border-radius: 18px; overflow: hidden; box-shadow: 0 16px 40px rgba(21, 20, 15, 0.08);">
          
          <!-- Topo Editorial -->
          <tr>
            <td style="padding: 32px 36px 22px 36px; border-bottom: 1px solid rgba(21, 20, 15, 0.1); background-color: #fbf7ec;">
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td>
                    <div style="display: inline-block; padding: 4px 10px; border-radius: 6px; background-color: #dafeaa; color: #15140f; font-family: 'Courier New', Courier, monospace; font-size: 11px; font-weight: bold; letter-spacing: 0.12em; text-transform: uppercase;">
                      PRESENTE · 5 ESCALAS EM PDF
                    </div>
                    <h1 style="margin: 14px 0 0 0; font-size: 26px; font-weight: 800; color: #15140f; line-height: 1.15; letter-spacing: -0.03em;">
                      Seu pacote de escalas chegou.
                    </h1>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Conteúdo da Mensagem -->
          <tr>
            <td style="padding: 32px 36px 36px 36px;">
              <p style="margin: 0 0 18px 0; font-size: 16px; font-weight: 600; line-height: 1.5; color: #15140f;">
                ${saudacao}
              </p>
              
              <p style="margin: 0 0 18px 0; font-size: 15px; line-height: 1.65; color: #2a2620;">
                Cansou de caçar escalas na internet e encontrar arquivos com baixa resolução, links quebrados ou versões sem fonte confiável?
              </p>

              <p style="margin: 0 0 24px 0; font-size: 15px; line-height: 1.65; color: #2a2620;">
                Para facilitar a sua rotina clínica, separei as <strong>5 escalas essenciais</strong> mais utilizadas na identificação dos transtornos que mais aparecem na clínica:
              </p>

              <!-- Grade das 5 Escalas -->
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border: 1.5px solid rgba(21, 20, 15, 0.1); border-radius: 12px; margin-bottom: 28px; padding: 18px 20px;">
                <tr>
                  <td>
                    <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
                      <tr>
                        <td style="padding: 7px 0; border-bottom: 1px dashed rgba(21, 20, 15, 0.08); font-size: 14px; color: #15140f;">
                          <strong style="color: #2f6b31;">AQ-10</strong> — Rastreio de traços autistas (Adultos)
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 7px 0; border-bottom: 1px dashed rgba(21, 20, 15, 0.08); font-size: 14px; color: #15140f;">
                          <strong style="color: #2f6b31;">ASRS-18</strong> — Rastreio de sintomas de TDAH (Adultos / DSM-5)
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 7px 0; border-bottom: 1px dashed rgba(21, 20, 15, 0.08); font-size: 14px; color: #15140f;">
                          <strong style="color: #2f6b31;">GAD-7</strong> — Avaliação de ansiedade generalizada (Adultos)
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 7px 0; border-bottom: 1px dashed rgba(21, 20, 15, 0.08); font-size: 14px; color: #15140f;">
                          <strong style="color: #2f6b31;">SCARED (Crianças)</strong> — Ansiedade na infância (Autoaplicação)
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 7px 0 0 0; font-size: 14px; color: #15140f;">
                          <strong style="color: #2f6b31;">SCARED (Pais)</strong> — Ansiedade na infância (Heterorrelato)
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Botão Principal de Download -->
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 16px;">
                <tr>
                  <td align="center">
                    <a href="${downloadUrl}" target="_blank" style="display: inline-block; background-color: #dafeaa; color: #15140f; font-size: 16px; font-weight: 800; text-decoration: none; padding: 18px 36px; border-radius: 12px; border: 1.5px solid #15140f; box-shadow: 0 4px 0 #15140f; text-align: center; letter-spacing: -0.01em;">
                      Baixar as 5 escalas em PDF (.zip) &rarr;
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 0 0 28px 0; font-size: 12.5px; line-height: 1.5; color: #5a5448; text-align: center;">
                <em>O arquivo <strong>presente-escalas-neuroacervo.zip</strong> também foi anexado diretamente a esta mensagem.</em>
              </p>

              <!-- Bloco Informativo sobre Correção e Interpretação -->
              <div style="background-color: rgba(47, 107, 49, 0.07); border-left: 3.5px solid #2f6b31; padding: 16px 18px; border-radius: 8px; margin-bottom: 28px;">
                <p style="margin: 0 0 8px 0; font-size: 13.5px; font-weight: 700; color: #2f6b31;">
                  Precisa da correção e interpretação clínica?
                </p>
                <p style="margin: 0 0 10px 0; font-size: 13px; line-height: 1.6; color: #2a2620;">
                  As folhas de aplicação em PDF são gratuitas. Já os <strong>roteiros de correção, tabelas com pontos de corte normativos e modelos de laudo e síntese diagnóstica</strong> fazem parte da plataforma completa da NeuroAcervo, disponível a partir de <strong>R$ 24,90/mês</strong>.
                </p>
                <p style="margin: 0; font-size: 13px;">
                  <a href="https://www.neuroacervo.com.br/#planos" target="_blank" style="color: #2f6b31; font-weight: 700; text-decoration: underline;">
                    Conhecer os planos e o acervo completo &rarr;
                  </a>
                </p>
              </div>

              <p style="margin: 0; font-size: 14.5px; line-height: 1.6; color: #5a5448;">
                Ótimas avaliações e bom trabalho clínico,<br>
                <strong style="color: #15140f;">Netto & Equipe NeuroAcervo</strong>
              </p>
            </td>
          </tr>

          <!-- Rodapé -->
          <tr>
            <td style="padding: 24px 36px; background-color: #efe7d2; border-top: 1px solid rgba(21, 20, 15, 0.1); font-size: 11.5px; line-height: 1.6; color: #7c7768; text-align: center;">
              <p style="margin: 0 0 8px 0;">
                NeuroAcervo — Hub de Avaliação Neuropsicológica · <a href="https://www.neuroacervo.com.br" style="color: #15140f; text-decoration: underline;">neuroacervo.com.br</a>
              </p>
              <p style="margin: 0;">
                <a href="https://www.neuroacervo.com.br/termos" style="color: #7c7768; text-decoration: underline;">Termos de Uso</a> · 
                <a href="https://www.neuroacervo.com.br/privacidade" style="color: #7c7768; text-decoration: underline;">Política de Privacidade</a> · 
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
