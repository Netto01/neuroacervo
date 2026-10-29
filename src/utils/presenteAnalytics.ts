/**
 * Utilitário de Métricas e Eventos para o Fluxo "Presente: Escalas"
 * Mantém eventos de GA4 e garante conformidade com regras de analytics da Meta.
 */

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
  }
}

export type PresenteOrigem = 'navbar' | 'auto' | 'hash';

export function trackPresenteModalAberto(origem: PresenteOrigem) {
  if (typeof window === 'undefined') return;

  try {
    // Google Analytics 4
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'presente_modal_aberto', {
        origem,
        page_location: window.location.href,
      });
    }
  } catch (err) {
    console.debug('[Analytics] Falha silenciosa ao rastrear abertura:', err);
  }
}

export function trackPresenteModalFechado() {
  if (typeof window === 'undefined') return;

  try {
    // Google Analytics 4
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'presente_modal_fechado', {
        page_location: window.location.href,
      });
    }
  } catch (err) {
    console.debug('[Analytics] Falha silenciosa ao rastrear fechamento:', err);
  }
}

export function trackPresenteLeadEnviado(_email?: string) {
  if (typeof window === 'undefined') return;

  try {
    // Google Analytics 4
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'presente_lead_enviado', {
        event_category: 'Lead',
        event_label: 'Presente: Escalas',
        lead_presente: true,
      });
    }
  } catch (err) {
    console.debug('[Analytics] Falha silenciosa ao rastrear envio de lead:', err);
  }
}
