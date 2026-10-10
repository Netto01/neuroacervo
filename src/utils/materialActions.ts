import { AGE_LABELS } from '@/data/neuroData';
import { escapeHtml } from '@/utils/security';

export interface DownloadableMaterial {
  id: string;
  title: string;
  subtitle?: string;
  downloadUrl?: string;
  downloadFormat?: string;
  downloadSize?: string;
  description?: string;
  contentPreview?: string;
  authorReference?: string;
  clinicalUtility?: string;
  targetPopulation?: string;
  ageGroups?: string[];
  satepsiRestricted?: boolean;
  keyInstructions?: string[];
}

export function getMaterialReaderUrl(material: { id: string; downloadUrl?: string }): string {
  if (material.downloadUrl) {
    return `/leitor?id=${encodeURIComponent(material.id)}&arquivo=${encodeURIComponent(material.downloadUrl)}`;
  }
  return `/leitor?id=${encodeURIComponent(material.id)}`;
}

export async function downloadMaterialFile(material: DownloadableMaterial): Promise<void> {
  const format = (material.downloadFormat || 'PDF').toUpperCase();
  const ext = format === 'DOCX' ? 'docx' : format === 'XLSX' ? 'xlsx' : format === 'ZIP' ? 'zip' : 'pdf';
  
  const cleanTitle = material.title
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, '_')
    .replace(/_+/g, '_');

  const defaultFileName = `${cleanTitle}.${ext}`;

  // 1. Tentar resolver a URL do arquivo
  let resolvedUrl: string | null = null;

  if (material.downloadUrl) {
    if (material.downloadUrl.startsWith('http://') || material.downloadUrl.startsWith('https://') || material.downloadUrl.startsWith('/')) {
      resolvedUrl = material.downloadUrl;
    } else {
      // Nome de arquivo no Cloudflare R2
      const r2Base = process.env.NEXT_PUBLIC_R2_PUBLIC_URL || 'https://pub-46b7a58b503e44bdb8e86a63a0cf51ba.r2.dev';
      resolvedUrl = `${r2Base.replace(/\/+$/, '')}/${encodeURIComponent(material.downloadUrl)}`;
    }
  }

  // 2. Se houver URL resolvida, tentar baixar o arquivo real
  if (resolvedUrl) {
    try {
      // Disparar download direto via elemento âncora
      const a = document.createElement('a');
      a.href = resolvedUrl;
      a.download = defaultFileName;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      return;
    } catch {
      window.open(resolvedUrl, '_blank');
      return;
    }
  }

  // 3. Fallback: Se não houver arquivo carregado no R2/Supabase, gerar documento clínico pronto para impressão / PDF
  generatePrintableDocument(material, defaultFileName);
}

function generatePrintableDocument(material: DownloadableMaterial, fileName: string): void {
  const safeTitle = escapeHtml(material.title);
  const safeSubtitle = material.subtitle ? escapeHtml(material.subtitle) : '';
  const safeUtility = escapeHtml(material.clinicalUtility || 'Avaliação Neuropsicológica');
  const safeTargetPop = escapeHtml(material.targetPopulation || material.ageGroups?.map(a => AGE_LABELS[a] || a).join(', ') || 'Clínico');
  const safeFormat = escapeHtml(material.downloadFormat || 'PDF');
  const safeSize = escapeHtml(material.downloadSize || '1.5 MB');
  const safeRegulation = material.satepsiRestricted ? 'Privativo (SATEPSI)' : 'Uso Multiprofissional Livre';
  const safeDesc = escapeHtml(material.description || 'Guia prático de cabeceira com parâmetros técnicos para administração e laudo.');
  const safeAuthor = material.authorReference ? escapeHtml(material.authorReference) : '';

  const printableContent = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <title>${safeTitle} - NeuroAcervo</title>
  <style>
    @media print {
      body { margin: 10mm; font-size: 11pt; }
      .no-print { display: none !important; }
      @page { margin: 15mm; }
    }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; line-height: 1.6; max-width: 820px; margin: 30px auto; padding: 24px; color: #1e293b; background: #fff; }
    .header-bar { border-bottom: 2px solid #2f6b31; padding-bottom: 12px; margin-bottom: 20px; }
    .tag { display: inline-block; padding: 3px 10px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: .08em; border-radius: 999px; background: #dafeaa; color: #15140f; margin-bottom: 8px; }
    h1 { color: #0f172a; margin: 0 0 6px; font-size: 24px; font-weight: 800; }
    .subtitle { color: #2f6b31; font-size: 15px; margin: 0 0 16px; font-weight: 600; }
    .meta-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 12px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; margin: 20px 0; font-size: 13px; }
    .meta-cell b { display: block; font-size: 10.5px; text-transform: uppercase; letter-spacing: .08em; color: #64748b; margin-bottom: 2px; }
    .meta-cell span { color: #0f172a; font-weight: 600; }
    .section-title { font-size: 16px; font-weight: 700; color: #0f172a; margin: 26px 0 10px; padding-left: 10px; border-left: 4px solid #2f6b31; }
    p.desc { font-size: 14px; line-height: 1.65; color: #334155; margin: 0 0 16px; }
    .instructions-list { list-style: none; padding: 0; margin: 0; display: grid; gap: 8px; }
    .instruction-item { padding: 10px 14px; border: 1px solid #f1f5f9; border-radius: 8px; background: #fafafa; display: flex; align-items: center; gap: 12px; font-size: 13.5px; }
    .num-pill { background: #2f6b31; color: #fff; font-size: 11px; font-weight: 700; padding: 2px 7px; border-radius: 6px; min-width: 22px; text-align: center; }
    .footer-note { margin-top: 40px; padding-top: 14px; border-top: 1px solid #e2e8f0; font-size: 11.5px; color: #94a3b8; text-align: center; }
  </style>
</head>
<body>
  <div class="header-bar">
    <span class="tag">NeuroAcervo • Guia Clínico</span>
    <h1>${safeTitle}</h1>
    ${safeSubtitle ? `<div class="subtitle">${safeSubtitle}</div>` : ''}
  </div>

  <div class="meta-grid">
    <div class="meta-cell">
      <b>Utilidade Clínica</b>
      <span>${safeUtility}</span>
    </div>
    <div class="meta-cell">
      <b>Público-Alvo</b>
      <span>${safeTargetPop}</span>
    </div>
    <div class="meta-cell">
      <b>Formato & Arquivo</b>
      <span>${safeFormat} (${safeSize})</span>
    </div>
    <div class="meta-cell">
      <b>Regulamentação</b>
      <span>${safeRegulation}</span>
    </div>
  </div>

  <div class="section-title">Descrição & Raciocínio Clínico</div>
  <p class="desc">${safeDesc}</p>

  ${material.keyInstructions && material.keyInstructions.length > 0 ? `
    <div class="section-title">Sumário do Guia & Diretrizes Técnicas</div>
    <ul class="instructions-list">
      ${material.keyInstructions.map((item, idx) => `
        <li class="instruction-item">
          <span class="num-pill">${String(idx + 1).padStart(2, '0')}</span>
          <span>${escapeHtml(item)}</span>
        </li>
      `).join('')}
    </ul>
  ` : ''}

  ${safeAuthor ? `
    <div class="section-title">Referência Técnica</div>
    <p class="desc">${safeAuthor}</p>
  ` : ''}

  <div class="footer-note">
    Documento emitido pelo NeuroAcervo • Material de apoio técnico para profissionais habilitados.
  </div>

  <script>
    window.onload = function() {
      setTimeout(function() {
        window.print();
      }, 400);
    };
  </script>
</body>
</html>
  `;

  const blob = new Blob([printableContent], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const win = window.open(url, '_blank');
  if (!win) {
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fileName.replace(/\.pdf$/i, '')}_guia.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }
}
