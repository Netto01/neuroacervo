/**
 * Utilitário de Métricas e Eventos para o Fluxo "Presente: Escalas"
 * Dispara eventos para Google Analytics (gtag) e Meta Pixel (fbq).
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
    // 1. Google Analytics 4 (GA4 já configurado em src/app/layout.tsx)
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'presente_modal_aberto', {
        origem,
        page_location: window.location.href,
      });
    }

    // TODO: Meta Pixel evento customizado caso deseje rastrear abertura de anúncio
    if (typeof window.fbq === 'function') {
      window.fbq('trackCustom', 'PresenteModalAberto', { origem });
    }
  } catch (err) {
    console.debug('[Analytics] Falha silenciosa ao rastrear abertura:', err);
  }
}

export function trackPresenteModalFechado() {
  if (typeof window === 'undefined') return;

  try {
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'presente_modal_fechado', {
        page_location: window.location.href,
      });
    }

    // TODO: Meta Pixel
    if (typeof window.fbq === 'function') {
      window.fbq('trackCustom', 'PresenteModalFechado');
    }
  } catch (err) {
    console.debug('[Analytics] Falha silenciosa ao rastrear fechamento:', err);
  }
}

export function trackPresenteLeadEnviado(email: string) {
  if (typeof window === 'undefined') return;

  try {
    // 1. Google Analytics
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'presente_lead_enviado', {
        event_category: 'Lead',
        event_label: 'Presente: Escalas',
        lead_presente: true,
      });
    }

    // 2. Meta Pixel — Dispara o evento padrão de "Lead" para otimização de campanhas de tráfego pago
    if (typeof window.fbq === 'function') {
      window.fbq('track', 'Lead', {
        content_name: 'Presente: Escalas',
        content_category: 'Captação Gratuita',
        user_email: email,
      });
    } else {
      // TODO: Caso o Meta Pixel venha a ser instalado no layout, este ponto já disparará automaticamente.
    }
  } catch (err) {
    console.debug('[Analytics] Falha silenciosa ao rastrear envio de lead:', err);
  }
}
