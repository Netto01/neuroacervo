import crypto from 'crypto';
import { META_PIXEL_ID, META_GRAPH_API_VERSION } from '@/config/meta';

export interface MetaCapiLeadParams {
  eventId: string;
  email: string;
  nome?: string;
  eventSourceUrl?: string;
  ip?: string;
  userAgent?: string;
  fbpCookie?: string;
  fbcCookie?: string;
  fbclid?: string;
}

/**
 * Realiza hash SHA-256 em formato hexadecimal minúsculo
 */
function hashSha256(value: string): string {
  return crypto
    .createHash('sha256')
    .update(value.trim().toLowerCase())
    .digest('hex');
}

/**
 * Envia o evento Lead para a Meta Conversions API (CAPI) de forma resiliente,
 * com timeout curto e sem propagar exceções para a resposta da API pública.
 */
export async function sendMetaCapiLead(params: MetaCapiLeadParams): Promise<void> {
  const capiToken = process.env.META_CAPI_TOKEN?.trim();

  if (!capiToken) {
    console.log('[Meta CAPI] META_CAPI_TOKEN não configurado. Ignorando envio do evento Lead via servidor.');
    return;
  }

  try {
    const cleanEmail = params.email.trim().toLowerCase();
    if (!cleanEmail) {
      console.warn('[Meta CAPI] E-mail não fornecido para o evento Lead.');
      return;
    }

    // 1. Monta user_data com hashes recomendados pela Meta
    const userData: Record<string, unknown> = {
      em: [hashSha256(cleanEmail)],
    };

    const firstName = params.nome?.trim().split(/\s+/)[0]?.toLowerCase();
    if (firstName) {
      userData.fn = [hashSha256(firstName)];
    }

    if (params.ip) {
      userData.client_ip_address = params.ip;
    }

    if (params.userAgent) {
      userData.client_user_agent = params.userAgent;
    }

    if (params.fbpCookie) {
      userData.fbp = params.fbpCookie;
    }

    // Monta fbc: se existir cookie _fbc usa ele, se não existir mas tiver fbclid monta no formato fb.1.<timestamp_ms>.<fbclid>
    let fbc = params.fbcCookie;
    if (!fbc && params.fbclid) {
      fbc = `fb.1.${Date.now()}.${params.fbclid}`;
    } else if (!fbc && params.eventSourceUrl) {
      try {
        const parsedUrl = new URL(params.eventSourceUrl);
        const urlFbclid = parsedUrl.searchParams.get('fbclid');
        if (urlFbclid) {
          fbc = `fb.1.${Date.now()}.${urlFbclid}`;
        }
      } catch {
        // URL mal formatada, ignora extração de fbclid
      }
    }

    if (fbc) {
      userData.fbc = fbc;
    }

    // 2. Monta o evento
    const eventTime = Math.floor(Date.now() / 1000);
    const eventSourceUrl = params.eventSourceUrl || 'https://www.neuroacervo.com.br/#presente';

    const eventPayload: Record<string, unknown> = {
      event_name: 'Lead',
      event_time: eventTime,
      event_id: params.eventId,
      action_source: 'website',
      event_source_url: eventSourceUrl,
      user_data: userData,
      custom_data: {
        content_name: 'presente-escalas',
        value: 0,
        currency: 'BRL',
      },
    };

    const requestBody: Record<string, unknown> = {
      data: [eventPayload],
    };

    // Código de teste opcional para visualização no Gerenciador de Eventos da Meta
    const testEventCode = process.env.META_TEST_EVENT_CODE?.trim();
    if (testEventCode) {
      requestBody.test_event_code = testEventCode;
    }

    // 3. Chamada para a Graph API com timeout curto de 3.5 segundos
    const endpoint = `https://graph.facebook.com/${META_GRAPH_API_VERSION}/${META_PIXEL_ID}/events?access_token=${encodeURIComponent(capiToken)}`;

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
      signal: AbortSignal.timeout(3500),
    });

    if (!response.ok) {
      const errorResponse = await response.text();
      console.error(
        '[Meta CAPI] Erro ao enviar evento Lead para a Graph API:',
        response.status,
        errorResponse
      );
    } else {
      const responseData = await response.json().catch(() => null);
      console.log(
        `[Meta CAPI] Evento Lead enviado com sucesso (event_id: ${params.eventId}):`,
        responseData
      );
    }
  } catch (err) {
    // Registra o erro no log do servidor sem quebrar o fluxo principal
    console.error('[Meta CAPI] Falha inesperada durante a chamada da Conversions API:', err);
  }
}
