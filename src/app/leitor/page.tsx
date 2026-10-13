'use client';

import React, { useState, useEffect, useRef, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import Script from 'next/script';
import { useNeuro } from '@/context/NeuroContext';
import { supabase, isSupabaseConfigured, getMaterialNotes, saveMaterialNotes } from '@/lib/supabase';
import { AGE_LABELS, TYPE_LABELS } from '@/data/neuroData';
import { escapeHtml } from '@/utils/security';
import './leitor.css';

interface TocItem {
  title: string;
  n: string;
  page: number;
}

interface PageData {
  w: number;
  h: number;
  base?: number;
  sheetHtml?: string;
  sheetTitle?: string;
  text?: string;
  drawn?: number;
}

interface PdfPageItemProps {
  pageNum: number;
  pdfDoc: any;
  zoom: number;
  watermarkText: string;
}

function PdfPageItem({ pageNum, pdfDoc, zoom, watermarkText }: PdfPageItemProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const renderTaskRef = useRef<any>(null);
  const [pageSize, setPageSize] = useState<{ width: number; height: number }>({
    width: Math.round(794 * zoom),
    height: Math.round(1123 * zoom),
  });
  // Páginas 1 e 2 carregam imediatamente; as outras aguardam aproximação no scroll
  const [isVisible, setIsVisible] = useState(pageNum <= 2);
  const [isRendered, setIsRendered] = useState(false);

  // Lazy loading inteligente: renderiza quando a página estiver a 800px da tela
  useEffect(() => {
    if (pageNum <= 2) return;
    const el = containerRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: '800px 0px',
        threshold: 0.01,
      }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [pageNum]);

  useEffect(() => {
    if (!isVisible || !pdfDoc || !canvasRef.current) return;
    const canvas = canvasRef.current;
    let isCancelled = false;

    pdfDoc.getPage(pageNum).then((page: any) => {
      if (isCancelled || !canvas) return;

      const dpr = Math.min(window.devicePixelRatio || 1, 1.75);
      const unscaledViewport = page.getViewport({ scale: 1 });
      const targetWidth = 794 * zoom;
      const scale = (targetWidth / unscaledViewport.width) * dpr;
      const viewport = page.getViewport({ scale });

      canvas.width = viewport.width;
      canvas.height = viewport.height;
      setPageSize({
        width: Math.round(viewport.width / dpr),
        height: Math.round(viewport.height / dpr),
      });

      const ctx = canvas.getContext('2d');
      if (ctx) {
        if (renderTaskRef.current) {
          try {
            renderTaskRef.current.cancel();
          } catch {}
        }
        const task = page.render({ canvasContext: ctx, viewport });
        renderTaskRef.current = task;
        task.promise
          .then(() => {
            if (!isCancelled) setIsRendered(true);
          })
          .catch((e: any) => {
            if (e?.name !== 'RenderingCancelledException') {
              console.warn(`Erro renderizando página ${pageNum}:`, e);
            }
          });
      }
    }).catch(console.error);

    return () => {
      isCancelled = true;
      if (renderTaskRef.current) {
        try {
          renderTaskRef.current.cancel();
        } catch {}
      }
    };
  }, [isVisible, pdfDoc, pageNum, zoom]);

  return (
    <div
      ref={containerRef}
      className="pw"
      data-page={pageNum}
      role="img"
      aria-label={`Página ${pageNum}`}
      style={{
        width: `${pageSize.width}px`,
        height: `${pageSize.height}px`,
        position: 'relative',
        ['--z' as any]: zoom,
      } as any}
    >
      {isVisible ? (
        <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />
      ) : (
        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff', opacity: 0.6 }}>
          <span style={{ fontSize: '12px', fontFamily: 'var(--mono)', color: 'var(--ink-faint)' }}>Carregando pág. {pageNum}...</span>
        </div>
      )}
      <span className="num">{pageNum}</span>
      <div className="wm" aria-hidden="true">
        <span>{watermarkText}</span>
        <span>{watermarkText}</span>
        <span>{watermarkText}</span>
      </div>
    </div>
  );
}

function LeitorContent() {
  const searchParams = useSearchParams();
  const { materials, currentUser, favorites, toggleFavorite } = useNeuro();

  const paramId = searchParams.get('id');
  const paramArquivo = searchParams.get('arquivo');

  // Localiza o material no contexto ou cria fallback
  const material = useMemo(() => {
    if (paramId) {
      const found = materials.find(m => m.id === paramId);
      if (found) return found;
    }
    if (paramArquivo) {
      const found = materials.find(m => m.downloadUrl === paramArquivo || m.id === paramArquivo);
      if (found) return found;
    }
    if (materials.length > 0) {
      return materials[0];
    }
    return {
      id: 'mem-episodica',
      title: 'Compêndio de Memória Episódica',
      subtitle: 'Da teoria à avaliação neuropsicológica clínica',
      type: 'compendio_estudo' as const,
      domains: ['memoria'],
      ageGroups: ['adulto', 'idoso'],
      targetPopulation: 'Adulto e Idoso',
      satepsiRestricted: false,
      downloadFormat: 'PDF' as const,
      downloadSize: '2.4 MB',
      downloadUrl: '',
      authorReference: 'Equipe NeuroAcervo',
      clinicalUtility: 'Memória & Raciocínio Clínico',
      description: 'Conceitos, modelos teóricos, formas de avaliação e alterações em diferentes quadros clínicos, organizados para estudo e consulta rápida.',
      keyInstructions: [
        'I. Conceitos fundamentais e três etapas (Codificação, Consolidação e Evocação)',
        'II. Modelos teóricos e bases neurais',
        'III. Formas de avaliação e tipos de erros qualitativos',
        'IV. Alterações em quadros clínicos e diagnóstico diferencial',
        'V. Como redigir a síntese no laudo neuropsicológico'
      ],
      publishedAt: new Date().toISOString()
    };
  }, [materials, paramId, paramArquivo]);

  // Resolve URL do PDF imediatamente via useMemo (sem atraso de render/useEffect)
  const pdfUrl = useMemo(() => {
    const raw = paramArquivo || material.downloadUrl;
    if (!raw) return null;

    const publicR2 = (process.env.NEXT_PUBLIC_R2_PUBLIC_URL || 'https://pub-46b7a58b503e44bdb8e86a63a0cf51ba.r2.dev').replace(/\/+$/, '');

    // Se é uma URL HTTP/HTTPS direta (ex: Cloudflare R2 com CDN e CORS aberto)
    if (raw.startsWith('http://') || raw.startsWith('https://')) {
      return raw;
    }

    // Se é apenas o nome/chave do arquivo no R2 (ex: guia-pratico-wisc-iv-4.pdf)
    if (raw.toLowerCase().endsWith('.pdf') && !raw.startsWith('/')) {
      return `${publicR2}/${raw}`;
    }

    if (raw.startsWith('/')) {
      return raw;
    }

    if (isSupabaseConfigured) {
      try {
        const { data } = supabase.storage.from('materials').getPublicUrl(raw);
        if (data?.publicUrl) {
          return data.publicUrl;
        }
      } catch {}
    }
    return null;
  }, [paramArquivo, material.downloadUrl]);

  // Marca d'água personalizada do assinante
  const watermarkText = useMemo(() => {
    const nome = currentUser?.name || 'Assinante NeuroAcervo';
    const reg = currentUser?.crp 
      ? (currentUser.crp.toUpperCase().startsWith('CRP') ? currentUser.crp : `CRP ${currentUser.crp}`) 
      : (currentUser?.email || 'Uso Exclusivo');
    return `${nome} · ${reg} · uso pessoal`;
  }, [currentUser]);

  // Estados do leitor - detecta PDF.js instantaneamente se já estiver carregado no window
  const [pdfJsLoaded, setPdfJsLoaded] = useState(() => {
    if (typeof window !== 'undefined' && !!(window as any).pdfjsLib) {
      return true;
    }
    return false;
  });

  // Garante que o PDF.js seja detectado e inicializado mesmo em transições de rota do Next.js sem refresh
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const checkReady = () => {
      if ((window as any).pdfjsLib) {
        setPdfJsLoaded(true);
        return true;
      }
      return false;
    };

    if (checkReady()) return;

    // Polling rápido caso o script CDN esteja terminando de baixar
    const interval = setInterval(() => {
      if (checkReady()) {
        clearInterval(interval);
      }
    }, 50);

    // Fallback: se por qualquer razão o script não estiver presente, injeta via DOM
    const timeout = setTimeout(() => {
      clearInterval(interval);
      if (!checkReady()) {
        const existing = document.getElementById('pdfjs-cdn-script');
        if (!existing) {
          const s = document.createElement('script');
          s.id = 'pdfjs-cdn-script';
          s.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
          s.async = true;
          s.onload = () => setPdfJsLoaded(true);
          document.head.appendChild(s);
        }
      }
    }, 1200);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, []);

  const [zoom, setZoom] = useState(() => {
    if (typeof window !== 'undefined') {
      const w = window.innerWidth;
      const isMobile = w <= 860;
      const isTablet = w <= 1100;
      const panelsW = isMobile ? 0 : isTablet ? 272 : (272 + 312);
      const estViewerW = Math.max(320, w - panelsW - (isMobile ? 20 : 56));
      return Math.max(0.35, Math.min(1.8, Math.round((estViewerW / 794) * 100) / 100));
    }
    return 0.85;
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [activeLeftTab, setActiveLeftTab] = useState<'toc' | 'find'>('toc');
  const [activeRightTab, setActiveRightTab] = useState<'info' | 'notes'>('info');
  const [showLeftMobile, setShowLeftMobile] = useState(false);
  const [showRightMobile, setShowRightMobile] = useState(false);
  const [focusMode, setFocusMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{ page: number; snippet: string }[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [notesState, setNotesState] = useState<'salvo' | 'salvando' | 'erro'>('salvo');
  const [copiedNotes, setCopiedNotes] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Referências
  const viewerRef = useRef<HTMLDivElement>(null);
  const pagesWrapRef = useRef<HTMLDivElement>(null);
  const pdfDocRef = useRef<any>(null);
  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [sections, setSections] = useState<TocItem[]>([]);
  const [demoPages, setDemoPages] = useState<PageData[]>([]);

  // Carregar notas salvas (primeiro lê instantaneamente do localStorage, depois sincroniza do Supabase)
  useEffect(() => {
    let isCancelled = false;

    // 1. Carregamento imediato do cache local para resposta visual em 0ms
    try {
      const local = localStorage.getItem(`na:${material.id}:notas`);
      if (local) setNotes(local);
    } catch {}

    // 2. Sincronização em nuvem via Supabase
    if (isSupabaseConfigured) {
      getMaterialNotes(material.id).then((cloudNotes) => {
        if (isCancelled) return;
        if (cloudNotes) {
          setNotes(cloudNotes);
          try {
            localStorage.setItem(`na:${material.id}:notas`, cloudNotes);
          } catch {}
          setNotesState('salvo');
        }
      }).catch(() => {});
    }

    return () => {
      isCancelled = true;
    };
  }, [material.id]);

  const saveNotesTimeout = useRef<NodeJS.Timeout | null>(null);
  const handleNotesChange = (val: string) => {
    setNotes(val);
    setNotesState('salvando');
    if (saveNotesTimeout.current) clearTimeout(saveNotesTimeout.current);

    saveNotesTimeout.current = setTimeout(async () => {
      // Grava no localStorage imediatamente
      try {
        localStorage.setItem(`na:${material.id}:notas`, val);
      } catch {}

      // Grava no Supabase se configurado
      if (isSupabaseConfigured) {
        try {
          const success = await saveMaterialNotes(material.id, val);
          setNotesState(success ? 'salvo' : 'erro');
        } catch {
          setNotesState('erro');
        }
      } else {
        setNotesState('salvo');
      }
    }, 700);
  };

  const handleInsertPageInNotes = () => {
    const ta = textareaRef.current;
    const ref = `[p. ${currentPage}] `;
    if (ta) {
      const s = ta.selectionStart;
      const e = ta.selectionEnd;
      const v = ta.value;
      const pre = (s > 0 && v[s - 1] !== '\n' && v[s - 1] !== ' ') ? ' ' : '';
      const newVal = v.slice(0, s) + pre + ref + v.slice(e);
      setNotes(newVal);
      ta.value = newVal;
      ta.focus();
      const pos = s + pre.length + ref.length;
      ta.setSelectionRange(pos, pos);
      handleNotesChange(newVal);
    } else {
      const textToInsert = `\n[p. ${currentPage}] `;
      const updated = notes + textToInsert;
      setNotes(updated);
      handleNotesChange(updated);
    }
  };

  const handleCopyNotes = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(notes).then(() => {
        setCopiedNotes(true);
        setTimeout(() => setCopiedNotes(false), 1500);
      }).catch(() => {
        if (textareaRef.current) textareaRef.current.select();
      });
    } else if (textareaRef.current) {
      textareaRef.current.select();
    }
  };

  // Toast
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);

  // Montar demonstração caso não haja PDF direto cadastrado
  useEffect(() => {
    if (!pdfUrl) {
      // Monta páginas baseadas nos tópicos do material
      const items = material.keyInstructions && material.keyInstructions.length > 0
        ? material.keyInstructions
        : [
            'I. Visão geral e fundamentação do instrumento',
            'II. Regras de início, interrupção e administração',
            'III. Critérios de pontuação e conversão de escores',
            'IV. Interpretação psicométrica e estratificação normativa',
            'V. Redação sugerida para o laudo neuropsicológico'
          ];

      const safeTitle = escapeHtml(material.title);
      const safeSubtitle = escapeHtml(material.subtitle || material.description);
      const safeDescription = escapeHtml(material.description || 'Avalie o desempenho integrando os achados com os dados de escolaridade, idade, rotina funcional e queixas relatadas na anamnese.');
      const safeType = escapeHtml(TYPE_LABELS[material.type]?.label || 'Guia Prático');
      const safeAges = escapeHtml(material.ageGroups?.map(a => AGE_LABELS[a] || a).join(' · ') || 'Uso Clínico');

      const p1Cover: PageData = {
        w: 794,
        h: 1123,
        sheetTitle: 'Capa',
        sheetHtml: `
          <div class="sheet cover" style="--cat: var(--accent-strong)">
            <div class="k">${safeType}</div>
            <h1>${safeTitle}</h1>
            <p>${safeSubtitle}</p>
            <div class="meta">
              <span>NeuroAcervo<br>Atualizado recentemente</span>
              <span>${safeAges}</span>
            </div>
          </div>
        `
      };

      const p2Toc: PageData = {
        w: 794,
        h: 1123,
        sheetTitle: 'Sumário',
        sheetHtml: `
          <div class="sheet">
            <div class="run"><span>${safeTitle}</span><span>NeuroAcervo</span></div>
            <h2>Sumário</h2>
            <ol class="tocp">
              ${items.map((item, idx) => `
                <li><i>${String(idx + 1).padStart(2, '0')}.</i>${escapeHtml(item)}<span>${idx + 3}</span></li>
              `).join('')}
            </ol>
            <div class="foot"><span>Material de apoio técnico • NeuroAcervo</span><span>2</span></div>
          </div>
        `
      };

      const contentPages: PageData[] = items.map((item, idx) => {
        const safeItem = escapeHtml(item);
        return {
          w: 794,
          h: 1123,
          sheetTitle: item,
          sheetHtml: `
            <div class="sheet">
              <div class="run"><span>${safeTitle}</span><span>NeuroAcervo</span></div>
              <h2><span class="n">${String(idx + 1).padStart(2, '0')}.</span>${safeItem}</h2>
              <div class="box">
                <b>Diretriz de Aplicação & Consulta de Cabeceira:</b>
                <p style="margin: 8px 0 0;">Este módulo detalha os parâmetros e procedimentos padronizados para ${safeTitle.toLowerCase()}. Siga rigorosamente as instruções do manual oficial para garantir a validade psicométrica dos resultados.</p>
              </div>
              <h3>Orientações Clínicas</h3>
              <p>${safeDescription}</p>
              <h3>Critérios & Observações</h3>
              <ul>
                <li>Registrar o tempo exato e anotar comportamentos qualitativos durante a tarefa.</li>
                <li>Consultar a tabela de pontos de corte e normas estratificadas para a população brasileira.</li>
                <li>Observar se o padrão sugere dificuldade primária de atenção, velocidade ou memória.</li>
              </ul>
              <div class="box" style="margin-top: 24px; background: #faf8f0; border-left-color: var(--accent);">
                <b>Exemplo de redação para o laudo:</b>
                <p style="margin: 6px 0 0; font-style: italic;">“Na aplicação do instrumento (${safeTitle}), observou-se desempenho correspondente aos critérios normativos esperados, sem indícios de rebaixamento funcional clinicamente significativo no domínio avaliado.”</p>
              </div>
              <div class="foot"><span>Material de apoio técnico • NeuroAcervo</span><span>${idx + 3}</span></div>
            </div>
          `
        };
      });

      const allDemo = [p1Cover, p2Toc, ...contentPages];
      setDemoPages(allDemo);
      setTotalPages(allDemo.length);
      setTimeout(handleFitWidth, 50);

      const demoSections: TocItem[] = [
        { title: 'Capa', n: '·', page: 1 },
        { title: 'Sumário', n: '·', page: 2 },
        ...items.map((it, idx) => ({
          title: it,
          n: `${String(idx + 1).padStart(2, '0')}.`,
          page: idx + 3
        }))
      ];
      setSections(demoSections);
    } else {
      // Sumário inicial para PDF real enquanto o arquivo está sendo processado
      const rawItems = material.keyInstructions && material.keyInstructions.length > 0
        ? material.keyInstructions
        : [
            'Visão geral & Fundamentação',
            'Regras de administração e aplicação',
            'Critérios de pontuação e escores',
            'Interpretação psicométrica e clínica',
            'Síntese e redação para o laudo'
          ];

      const initialSections: TocItem[] = [
        { title: 'Capa / Início', n: '·', page: 1 },
        ...rawItems.map((item, idx) => {
          const cleanTitle = item.replace(/^([IVXLCDM]+|\d+)[\.\-\s:]+/, '').trim() || item;
          return {
            title: cleanTitle,
            n: `${String(idx + 1).padStart(2, '0')}.`,
            page: Math.max(1, idx + 2)
          };
        })
      ];
      setSections(initialSections);
    }
  }, [pdfUrl, material]);

  // Carregar documento PDF com PDF.js quando o script estiver pronto e houver pdfUrl
  useEffect(() => {
    if (!pdfUrl || !pdfJsLoaded || typeof window === 'undefined') return;
    const pdfjsLib = (window as any).pdfjsLib;
    if (!pdfjsLib) return;

    if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
      pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
    }

    let isCancelled = false;
    setPdfLoading(true);
    setPdfError(null);
    setPdfDoc(null);
    setCurrentPage(1);

    const loadingTask = pdfjsLib.getDocument({
      url: pdfUrl,
      withCredentials: false,
      rangeChunkSize: 65536 * 4,
      disableAutoFetch: false,
      disableStream: false
    });

    loadingTask.promise
      .then(async (doc: any) => {
        if (isCancelled) return;
        pdfDocRef.current = doc;
        setPdfDoc(doc);
        setPdfLoading(false);
        setTotalPages(doc.numPages);
        setTimeout(handleFitWidth, 50);

        // Extração Inteligente de Sumário:
        // Tier 1: Bookmarks / Outline embutido no PDF
        let resolvedSections: TocItem[] = [];

        try {
          const outline = await doc.getOutline();
          if (outline && outline.length > 0) {
            const secPromises = outline.slice(0, 40).map(async (it: any, k: number) => {
              try {
                let dest = it.dest;
                if (typeof dest === 'string') {
                  dest = await doc.getDestination(dest);
                }
                if (dest && dest[0]) {
                  const pageIdx = await doc.getPageIndex(dest[0]);
                  if (pageIdx != null) {
                    return { title: it.title, n: `${k + 1}.`, page: pageIdx + 1 };
                  }
                }
              } catch {}
              return null;
            });
            const valid = (await Promise.all(secPromises)).filter(Boolean) as TocItem[];
            if (valid.length > 0) {
              resolvedSections = valid.sort((a, b) => a.page - b.page);
            }
          }
        } catch {}

        // Tier 2: Tópicos catalogados do material com mapeamento proporcional das páginas
        if (resolvedSections.length === 0) {
          const rawItems = material.keyInstructions && material.keyInstructions.length > 0
            ? material.keyInstructions
            : null;

          if (rawItems && rawItems.length > 0) {
            const numPages = doc.numPages;
            resolvedSections = [
              { title: 'Capa / Início', n: '·', page: 1 },
              ...rawItems.map((item, idx) => {
                const cleanTitle = item.replace(/^([IVXLCDM]+|\d+)[\.\-\s:]+/, '').trim() || item;
                const step = (numPages - 1) / rawItems.length;
                const targetPage = Math.min(numPages, Math.max(1, Math.round(1 + (idx + 0.5) * step)));
                return {
                  title: cleanTitle,
                  n: `${String(idx + 1).padStart(2, '0')}.`,
                  page: targetPage
                };
              })
            ];
          } else {
            // Tier 3: Varredura rápida de cabeçalhos das páginas reais do PDF
            const numPages = doc.numPages;
            const maxPages = Math.min(numPages, 30);
            const pageEntries: TocItem[] = [];

            for (let p = 1; p <= maxPages; p++) {
              let pageTitle = p === 1 ? 'Capa / Início' : `Página ${p}`;
              try {
                const page = await doc.getPage(p);
                const tc = await page.getTextContent();
                if (tc?.items?.length) {
                  let bestStr = '';
                  let maxScale = 0;
                  for (const it of tc.items.slice(0, 8)) {
                    if (it.str && it.str.trim().length > 3 && !/^\d+$/.test(it.str.trim())) {
                      const scale = Math.abs(it.transform?.[0] || 10);
                      if (scale > maxScale) {
                        maxScale = scale;
                        bestStr = it.str.trim();
                      }
                    }
                  }
                  if (bestStr) {
                    pageTitle = bestStr.length > 40 ? bestStr.slice(0, 38) + '…' : bestStr;
                  }
                }
              } catch {}
              pageEntries.push({
                title: pageTitle,
                n: `${p}.`,
                page: p
              });
            }
            resolvedSections = pageEntries;
          }
        }

        if (!isCancelled && resolvedSections.length > 0) {
          setSections(resolvedSections);
        }
      })
      .catch((err: any) => {
        if (isCancelled) return;
        console.error('Erro ao carregar o arquivo binário do PDF via PDF.js:', err);
        setPdfDoc(null);
        setPdfLoading(false);
        setPdfError(err?.message || 'Falha ao carregar o PDF');
      });

    return () => {
      isCancelled = true;
      try {
        loadingTask.destroy?.();
      } catch {}
    };
  }, [pdfUrl, pdfJsLoaded, material]);

  // Ajustar largura (Fit to screen)
  const handleFitWidth = () => {
    if (!viewerRef.current) return;
    const clientW = viewerRef.current.clientWidth;
    if (!clientW || clientW <= 0) return;
    const padding = window.innerWidth <= 860 ? 20 : 56;
    const availableW = clientW - padding;
    const newZ = Math.max(0.35, Math.min(1.8, Math.round((availableW / 794) * 100) / 100));
    setZoom(newZ);
  };

  // Auto-ajustar à tela na abertura do leitor e no redimensionamento da janela
  useEffect(() => {
    const adjust = () => {
      handleFitWidth();
    };

    adjust();
    const t1 = setTimeout(adjust, 60);
    const t2 = setTimeout(adjust, 200);
    const t3 = setTimeout(adjust, 600);

    window.addEventListener('resize', adjust);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      window.removeEventListener('resize', adjust);
    };
  }, []);

  // Navegar para página
  const goToPage = (pageNumber: number) => {
    const target = Math.max(1, Math.min(totalPages, pageNumber));
    setCurrentPage(target);
    setShowLeftMobile(false);
    setShowRightMobile(false);

    if (pagesWrapRef.current) {
      const pageEl = pagesWrapRef.current.querySelector(`[data-page="${target}"]`) as HTMLElement;
      if (pageEl && viewerRef.current) {
        viewerRef.current.scrollTo({
          top: pageEl.offsetTop - 18,
          behavior: 'smooth'
        });
      }
    }
  };

  // Monitorar scroll para atualizar página atual
  const handleScroll = () => {
    if (!viewerRef.current || !pagesWrapRef.current) return;
    const mid = viewerRef.current.scrollTop + viewerRef.current.clientHeight * 0.35;
    const pageEls = pagesWrapRef.current.querySelectorAll('.pw');
    let active = 1;
    pageEls.forEach((el: any) => {
      if (el.offsetTop <= mid) {
        active = parseInt(el.dataset.page || '1', 10);
      }
    });
    setCurrentPage(active);
  };

  // Busca textual
  const handleSearch = (q: string) => {
    setSearchQuery(q);
    const trimmed = q.trim().toLowerCase();
    if (trimmed.length < 2) {
      setSearchResults([]);
      return;
    }
    setIsSearching(true);
    const results: { page: number; snippet: string }[] = [];

    if (pdfDoc) {
      const numPages = pdfDoc.numPages;
      const maxPages = Math.min(numPages, 35);
      const searchTasks: Promise<void>[] = [];

      for (let p = 1; p <= maxPages; p++) {
        searchTasks.push(
          pdfDoc.getPage(p).then((page: any) => page.getTextContent()).then((tc: any) => {
            const rawText = tc?.items?.map((it: any) => it.str).join(' ') || '';
            const lower = rawText.toLowerCase();
            const pos = lower.indexOf(trimmed);
            if (pos >= 0) {
              const start = Math.max(0, pos - 40);
              const snip = rawText.slice(start, pos + trimmed.length + 50);
              results.push({ page: p, snippet: `…${snip}…` });
            }
          }).catch(() => {})
        );
      }

      Promise.all(searchTasks).then(() => {
        setSearchResults(results.sort((a, b) => a.page - b.page));
        setIsSearching(false);
      });
      return;
    }

    demoPages.forEach((p, idx) => {
      const rawText = p.sheetHtml?.replace(/<[^>]+>/g, ' ') || '';
      const lower = rawText.toLowerCase();
      const pos = lower.indexOf(trimmed);
      if (pos >= 0) {
        const start = Math.max(0, pos - 40);
        const snip = rawText.slice(start, pos + trimmed.length + 50);
        results.push({ page: idx + 1, snippet: `…${snip}…` });
      }
    });

    setSearchResults(results);
    setIsSearching(false);
  };

  // Atalhos de teclado
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((document.activeElement as HTMLElement)?.tagName)) return;
      if (e.key === 'ArrowRight' || e.key === 'PageDown') {
        e.preventDefault();
        goToPage(currentPage + 1);
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault();
        goToPage(currentPage - 1);
      } else if (e.key === '+' || e.key === '=') {
        setZoom(prev => Math.min(2.2, prev + 0.1));
      } else if (e.key === '-') {
        setZoom(prev => Math.max(0.4, prev - 0.1));
      } else if (e.key === 'f') {
        setFocusMode(prev => !prev);
      } else if (e.key === '/') {
        e.preventDefault();
        setActiveLeftTab('find');
        setShowLeftMobile(true);
      } else if (e.key === 'Escape') {
        setShowLeftMobile(false);
        setShowRightMobile(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentPage, totalPages]);

  const isFavorited = favorites.includes(material.id);

  return (
    <div className={`leitor-root ${focusMode ? 'focus' : ''} ${showLeftMobile ? 'show-left' : ''} ${showRightMobile ? 'show-right' : ''}`}>
      {/* Script PDF.js */}
      <Script
        id="pdfjs-script"
        src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"
        strategy="afterInteractive"
        onLoad={() => setPdfJsLoaded(true)}
        onReady={() => setPdfJsLoaded(true)}
      />

      {/* SVG Symbols */}
      <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true">
        <defs>
          <symbol id="i-back" viewBox="0 0 24 24"><path d="M19 12H5M11 6l-6 6 6 6"/></symbol>
          <symbol id="i-prev" viewBox="0 0 24 24"><path d="m15 6-6 6 6 6"/></symbol>
          <symbol id="i-next" viewBox="0 0 24 24"><path d="m9 6 6 6-6 6"/></symbol>
          <symbol id="i-minus" viewBox="0 0 24 24"><path d="M5 12h14"/></symbol>
          <symbol id="i-plus" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></symbol>
          <symbol id="i-focus" viewBox="0 0 24 24"><path d="M4 9V5h4M20 9V5h-4M4 15v4h4M20 15v4h-4"/></symbol>
          <symbol id="i-full" viewBox="0 0 24 24"><path d="M9 4H4v5M15 4h5v5M9 20H4v-5M15 20h5v-5"/></symbol>
          <symbol id="i-down" viewBox="0 0 24 24"><path d="M12 4v11M7 10l5 5 5-5M5 20h14"/></symbol>
          <symbol id="i-bookmark" viewBox="0 0 24 24"><path d="M6 4h12v17l-6-4-6 4z"/></symbol>
          <symbol id="i-list" viewBox="0 0 24 24"><path d="M9 6h11M9 12h11M9 18h11M4.5 6h.01M4.5 12h.01M4.5 18h.01"/></symbol>
          <symbol id="i-info" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/></symbol>
          <symbol id="i-search" viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></symbol>
          <symbol id="i-compendio" viewBox="0 0 24 24"><path d="M3 5.5C5.5 4 8.5 4 12 6c3.5-2 6.5-2 9-.5V19c-2.5-1.5-5.5-1.5-9 .5-3.5-2-6.5-2-9-.5z"/><path d="M12 6v13.5"/></symbol>
          <symbol id="i-shield" viewBox="0 0 24 24"><path d="M12 3 5 6v5c0 4.5 3 8.3 7 10 4-1.7 7-5.5 7-10V6z"/><path d="m9 12 2 2 4-4"/></symbol>
        </defs>
      </svg>

      {/* Cabeçalho */}
      <header className="head">
        <Link className="brand" href="/plataforma" aria-label="NeuroAcervo, início">
          <img src="/brand/isologo-preto.svg" alt="NeuroAcervo" />
          <span>NeuroAcervo</span>
        </Link>
        <Link className="back" href="/biblioteca">
          <svg className="ico"><use href="#i-back"/></svg>
          <span>Biblioteca</span>
        </Link>
        <div className="title">
          <span className="mark" style={{ background: 'var(--accent-strong)' }}>
            <svg className="ico"><use href="#i-compendio"/></svg>
          </span>
          <div className="t">
            <b>{material.title}</b>
            <small>{TYPE_LABELS[material.type]?.label || 'Guia Prático'} · {totalPages} páginas</small>
          </div>
        </div>
        <div className="acts">
          <button 
            className="icon-btn only-m" 
            type="button" 
            aria-label="Sumário e busca"
            onClick={() => setShowLeftMobile(prev => !prev)}
          >
            <svg className="ico"><use href="#i-list"/></svg>
          </button>
          <button 
            className="icon-btn only-t" 
            type="button" 
            aria-label="Detalhes e notas"
            onClick={() => setShowRightMobile(prev => !prev)}
          >
            <svg className="ico"><use href="#i-info"/></svg>
          </button>
          <button 
            className="btn" 
            type="button" 
            aria-pressed={isFavorited}
            onClick={() => {
              toggleFavorite(material.id);
              showToast(isFavorited ? 'Removido da sua pasta.' : 'Salvo na sua pasta.');
            }}
          >
            <svg className="ico"><use href="#i-bookmark"/></svg>
            <span className="lbl-t">{isFavorited ? 'Na sua pasta' : 'Salvar na pasta'}</span>
          </button>
          <button 
            className="btn solid" 
            type="button"
            onClick={() => {
              window.print();
            }}
          >
            <svg className="ico"><use href="#i-down"/></svg>
            <span className="lbl-t">Imprimir / Salvar PDF</span>
          </button>
        </div>
      </header>

      {/* Barra de progresso */}
      <div className="progress" aria-hidden="true">
        <i style={{ width: `${(currentPage / Math.max(1, totalPages)) * 100}%` }}></i>
      </div>

      {/* Layout de 3 colunas */}
      <div className="layout">
        {/* Painel Esquerdo: Sumário e Busca */}
        <aside className="panel left" aria-label="Sumário e busca">
          <div className="tabs" role="tablist">
            <button 
              role="tab" 
              aria-selected={activeLeftTab === 'toc'} 
              onClick={() => setActiveLeftTab('toc')}
            >
              Sumário
            </button>
            <button 
              role="tab" 
              aria-selected={activeLeftTab === 'find'} 
              onClick={() => setActiveLeftTab('find')}
            >
              Buscar
            </button>
          </div>

          {activeLeftTab === 'toc' ? (
            <div className="pane" role="tabpanel">
              <div className="lbl">Neste material</div>
              {sections.length > 0 ? (
                <ol className="toc">
                  {sections.map((sec, i) => (
                    <li key={i}>
                      <button 
                        type="button" 
                        aria-current={currentPage === sec.page}
                        onClick={() => goToPage(sec.page)}
                      >
                        <span className="n">{sec.n}</span>
                        <span>{sec.title}</span>
                        <span className="p">p. {sec.page}</span>
                      </button>
                    </li>
                  ))}
                </ol>
              ) : (
                <div style={{ padding: '24px 12px', textAlign: 'center', color: 'var(--ink-mute)', fontSize: '12px' }}>
                  <div style={{ width: 16, height: 16, border: '2px solid var(--accent-strong)', borderTopColor: 'transparent', borderRadius: '50%', margin: '0 auto 8px', animation: 'spin 0.8s linear infinite' }} />
                  Carregando tópicos do sumário…
                </div>
              )}
            </div>
          ) : (
            <div className="pane" role="tabpanel">
              <label className="find">
                <svg className="ico sm"><use href="#i-search"/></svg>
                <input 
                  type="search" 
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  placeholder="Buscar no material" 
                  aria-label="Buscar no material" 
                />
              </label>
              <ul className="hits">
                {isSearching && <li className="empty">Buscando no material…</li>}
                {!isSearching && searchQuery.length >= 2 && searchResults.length === 0 && (
                  <li className="empty">Nada encontrado para &ldquo;{searchQuery}&rdquo;.</li>
                )}
                {searchResults.map((hit, i) => (
                  <li key={i}>
                    <button type="button" onClick={() => goToPage(hit.page)}>
                      <b>Página {hit.page}</b>
                      <span>{hit.snippet}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </aside>

        {/* Centro: Visualizador de Páginas */}
        <main 
          className="viewer" 
          ref={viewerRef}
          tabIndex={-1} 
          aria-label="Documento"
          onScroll={handleScroll}
        >
          <div className="pages" ref={pagesWrapRef}>
            {pdfUrl && pdfDoc ? (
              // Modo PDF real renderizado via PDF.js
              Array.from({ length: totalPages }).map((_, i) => (
                <PdfPageItem
                  key={`page-${i + 1}`}
                  pageNum={i + 1}
                  pdfDoc={pdfDoc}
                  zoom={zoom}
                  watermarkText={watermarkText}
                />
              ))
            ) : pdfUrl && pdfError ? (
              // Falha no carregamento do arquivo
              <div style={{ textAlign: 'center', padding: '60px 24px', maxWidth: '440px', margin: '0 auto', color: 'var(--ink)' }}>
                <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#fee2e2', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: '20px' }}>⚠️</div>
                <h3 style={{ fontSize: '16px', fontWeight: 700, margin: '0 0 8px' }}>Não foi possível carregar o documento</h3>
                <p style={{ fontSize: '13px', color: 'var(--ink-mute)', margin: '0 0 20px', lineHeight: 1.5 }}>
                  Ocorreu uma oscilação na conexão com o servidor de arquivos. Você pode tentar recarregar ou abrir o arquivo diretamente.
                </p>
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                  <button className="btn" type="button" onClick={() => window.location.reload()}>Recarregar leitor</button>
                  <a className="btn solid" href={pdfUrl} target="_blank" rel="noopener noreferrer">Abrir arquivo direto</a>
                </div>
              </div>
            ) : pdfUrl && (pdfLoading || !pdfDoc) ? (
              // Carregando documento real do acervo
              <div style={{ textAlign: 'center', padding: '80px 20px', color: 'var(--ink-mute)', fontFamily: 'var(--mono)', fontSize: '13px' }}>
                <div style={{ width: 28, height: 28, border: '3px solid var(--accent-strong)', borderTopColor: 'transparent', borderRadius: '50%', margin: '0 auto 16px', animation: 'spin 0.8s linear infinite' }} />
                <div>Carregando documento oficial do acervo…</div>
              </div>
            ) : (
              // Modo Demonstração / Guia Estruturado em HTML
              demoPages.map((page, i) => (
                <div 
                  key={i} 
                  className="pw" 
                  data-page={i + 1}
                  role="img" 
                  aria-label={`Página ${i + 1}`}
                  style={{
                    width: `${Math.round(page.w * zoom)}px`,
                    height: `${Math.round(page.h * zoom)}px`,
                    position: 'relative'
                  }}
                >
                  <div 
                    dangerouslySetInnerHTML={{ __html: page.sheetHtml || '' }}
                    style={{
                      transform: `scale(${zoom})`,
                      transformOrigin: '0 0'
                    }}
                  />
                  <span className="num">{i + 1}</span>
                  <div className="wm" aria-hidden="true">
                    <span>{watermarkText}</span>
                    <span>{watermarkText}</span>
                    <span>{watermarkText}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </main>

        {/* Painel Direito: Detalhes e Minhas Notas */}
        <aside className="panel right" aria-label="Detalhes e notas">
          <div className="tabs" role="tablist">
            <button 
              role="tab" 
              aria-selected={activeRightTab === 'info'}
              onClick={() => setActiveRightTab('info')}
            >
              Detalhes
            </button>
            <button 
              role="tab" 
              aria-selected={activeRightTab === 'notes'}
              onClick={() => setActiveRightTab('notes')}
            >
              Minhas notas
            </button>
          </div>

          {activeRightTab === 'info' ? (
            <div className="pane" role="tabpanel">
              <dl className="info">
                <dt>Tipo</dt><dd>{TYPE_LABELS[material.type]?.label || 'Guia Prático'}</dd>
                <dt>Formato</dt><dd>{material.downloadFormat} · {totalPages} páginas</dd>
                <dt>População</dt><dd>{material.ageGroups?.map(a => AGE_LABELS[a] || a).join(', ') || 'Clínico'}</dd>
                <dt>O que pretende avaliar</dt><dd>{material.clinicalUtility || 'Neuropsicologia'}</dd>
                <dt>Tamanho</dt><dd>{material.downloadSize}</dd>
                <dt>Autoria</dt><dd>{material.authorReference || 'Equipe NeuroAcervo'}</dd>
              </dl>
              <div className="note-card">
                <svg className="ico sm"><use href="#i-info"/></svg>
                <span>Material de apoio para estudo e prática clínica. Não substitui o manual oficial do instrumento psicométrico.</span>
              </div>
              <div className="note-card">
                <svg className="ico sm"><use href="#i-shield"/></svg>
                <span>Uso pessoal intransferível. Cada página é chancelada com a marca d&apos;água exclusiva do assinante.</span>
              </div>
            </div>
          ) : (
            <div className="pane" role="tabpanel" style={{ padding: '16px 14px' }}>
              <div className="na-notes" data-state={notesState} data-page={currentPage}>
                <div className="na-notes__head">
                  <span className="na-notes__pg">Notas da página <b>{currentPage}</b></span>
                  <span className="na-notes__sync" aria-live="polite">
                    <i />
                    <span>{notesState === 'salvando' ? 'Salvando…' : notesState === 'erro' ? 'Erro ao salvar' : 'Salvo'}</span>
                  </span>
                </div>

                <div className="na-notes__sheet">
                  <textarea
                    ref={textareaRef}
                    className="na-notes__ta"
                    value={notes}
                    onChange={(e) => handleNotesChange(e.target.value)}
                    aria-label="Notas desta página"
                    placeholder="Escreva suas anotações sobre esta página…"
                  />
                  <div className="na-notes__tools">
                    <button
                      className="na-notes__btn pri"
                      type="button"
                      onClick={handleInsertPageInNotes}
                    >
                      <svg viewBox="0 0 24 24"><path d="M7 3h7l5 5v13H7z"/><path d="M14 3v5h5"/></svg>
                      Inserir pág. <span>{currentPage}</span>
                    </button>
                    <button
                      className="na-notes__btn"
                      type="button"
                      onClick={handleCopyNotes}
                      title="Copiar notas"
                    >
                      <svg viewBox="0 0 24 24"><rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3"/></svg>
                      <span>{copiedNotes ? 'Copiado' : 'Copiar'}</span>
                    </button>
                    <span className="na-notes__count">{notes.length}</span>
                  </div>
                </div>

                <div className="na-notes__foot">
                  <svg viewBox="0 0 24 24"><path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6z"/></svg>
                  <span>Salvo na sua conta e visível só para você. Não registre dados que identifiquem pacientes.</span>
                </div>
              </div>
            </div>
          )}
        </aside>
      </div>

      {/* Scrim Mobile */}
      <div 
        className="scrim" 
        onClick={() => {
          setShowLeftMobile(false);
          setShowRightMobile(false);
        }}
      />

      {/* Barra de Ferramentas Flutuante */}
      <div className="tools" role="toolbar" aria-label="Ferramentas de leitura">
        <button 
          type="button" 
          aria-label="Página anterior"
          onClick={() => goToPage(currentPage - 1)}
        >
          <svg className="ico"><use href="#i-prev"/></svg>
        </button>
        <div className="pgn">
          <label className="sr" htmlFor="pg">Página</label>
          <input 
            id="pg" 
            inputMode="numeric" 
            value={currentPage}
            onChange={(e) => goToPage(parseInt(e.target.value, 10) || 1)}
            aria-label="Página atual" 
          />
          <span>/ <span>{totalPages}</span></span>
        </div>
        <button 
          type="button" 
          aria-label="Próxima página"
          onClick={() => goToPage(currentPage + 1)}
        >
          <svg className="ico"><use href="#i-next"/></svg>
        </button>
        <span className="sep"></span>
        <button 
          type="button" 
          aria-label="Diminuir zoom"
          onClick={() => setZoom(prev => Math.max(0.4, prev - 0.1))}
        >
          <svg className="ico"><use href="#i-minus"/></svg>
        </button>
        <span className="zv" aria-live="polite">{Math.round(zoom * 100)}%</span>
        <button 
          type="button" 
          aria-label="Aumentar zoom"
          onClick={() => setZoom(prev => Math.min(2.2, prev + 0.1))}
        >
          <svg className="ico"><use href="#i-plus"/></svg>
        </button>
        <button 
          type="button" 
          className="fit hide-m" 
          onClick={handleFitWidth}
        >
          Ajustar
        </button>
        <span className="sep hide-m"></span>
        <button 
          type="button" 
          className="hide-m" 
          aria-pressed={focusMode} 
          aria-label="Modo leitura (esconde os painéis)"
          onClick={() => {
            setFocusMode(prev => !prev);
            setTimeout(handleFitWidth, 80);
          }}
        >
          <svg className="ico"><use href="#i-focus"/></svg>
        </button>
        <button 
          type="button" 
          className="hide-m" 
          aria-label="Tela cheia"
          onClick={() => {
            if (!document.fullscreenElement) {
              document.documentElement.requestFullscreen?.();
            } else {
              document.exitFullscreen?.();
            }
          }}
        >
          <svg className="ico"><use href="#i-full"/></svg>
        </button>
      </div>

      {/* Toast Notificação */}
      <div className={`toast ${toastMessage ? 'on' : ''}`} role="status">
        <span>{toastMessage}</span>
      </div>
    </div>
  );
}

export default function LeitorPage() {
  return (
    <Suspense fallback={
      <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', background: '#efe7d2', color: '#15140f', fontFamily: 'sans-serif' }}>
        <p>Carregando leitor NeuroAcervo...</p>
      </div>
    }>
      <LeitorContent />
    </Suspense>
  );
}
