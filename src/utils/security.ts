/**
 * Utilitário de escape de HTML para prevenir Cross-Site Scripting (XSS)
 * ao gerar ou interpolar strings em documentos HTML / renderizadores DOM.
 */
export function escapeHtml(str: string | undefined | null): string {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
