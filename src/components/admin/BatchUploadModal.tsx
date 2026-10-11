'use client';

import React, { useState, useRef, useMemo } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import {
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  Trash2,
  X,
  RefreshCw,
  Layers,
  Link2,
  ChevronDown,
  ChevronUp,
  FileText
} from 'lucide-react';

export interface BatchFileItem {
  id: string;
  file?: File;
  fileName: string;
  existingUrl?: string;
  title: string;
  tipo: string;
  plano: 'Consulta' | 'Estudo' | 'Prática';
  funcao: string;
  desc: string;
  populacao: string[];
  selo: string;
  sumario: string;
  sizeFormatted: string;
  isExpanded?: boolean;
  status: 'pending' | 'uploading' | 'saving' | 'done' | 'error';
  errorMessage?: string;
}

interface BatchUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (count: number) => Promise<void> | void;
  defaultFuncoes: string[];
  existingFuncoes: string[];
}

const TIPOS_CONFIG = [
  { id: 'guia', label: 'Guia rápido' },
  { id: 'laudo', label: 'Modelo de laudo' },
  { id: 'anamnese', label: 'Anamnese' },
  { id: 'compendio', label: 'Compêndio' },
  { id: 'instrumento', label: 'Instrumento' },
  { id: 'pdf', label: 'PDF e artigo' },
  { id: 'aula', label: 'Aula' },
  { id: 'interativo', label: 'Recurso interativo' }
];

const POPULACOES_CONFIG = [
  { id: 'infantil', label: 'Infantil' },
  { id: 'adolescente', label: 'Adolescente' },
  { id: 'adulto', label: 'Adulto' },
  { id: 'idoso', label: 'Idoso' }
];

const DEFAULT_R2_BASE = (
  process.env.NEXT_PUBLIC_R2_PUBLIC_URL ||
  'https://pub-46b7a58b503e44bdb8e86a63a0cf51ba.r2.dev'
).replace(/\/+$/, '');

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

function cleanTitleFromFileName(name: string): string {
  const parts = name.split('.');
  if (parts.length > 1) parts.pop();
  const raw = parts.join('.');
  const cleaned = raw
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return cleaned ? cleaned.charAt(0).toUpperCase() + cleaned.slice(1) : name;
}

function mapTipoToDbType(tipo: string): string {
  switch (tipo) {
    case 'guia':
      return 'guia_rapido';
    case 'laudo':
      return 'modelo_laudo';
    case 'anamnese':
      return 'entrevista_anamnese';
    case 'compendio':
      return 'compendio_estudo';
    case 'instrumento':
      return 'instrumento_rastreio';
    case 'pdf':
      return 'guia_rapido';
    case 'aula':
      return 'compendio_estudo';
    case 'interativo':
      return 'instrumento_rastreio';
    default:
      return 'guia_rapido';
  }
}

export const BatchUploadModal: React.FC<BatchUploadModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  defaultFuncoes,
  existingFuncoes
}) => {
  const [selectedTipo, setSelectedTipo] = useState('guia');
  const [inputMode, setInputMode] = useState<'upload' | 'links'>('upload');
  const [pastedLinksText, setPastedLinksText] = useState('');
  const [isParsingLinks, setIsParsingLinks] = useState(false);

  // Defaults para preenchimento rápido
  const [defaultPlano, setDefaultPlano] = useState<'Consulta' | 'Estudo' | 'Prática'>('Consulta');
  const [defaultFuncao, setDefaultFuncao] = useState('');
  const [defaultDesc, setDefaultDesc] = useState('');
  const [defaultPopulacao, setDefaultPopulacao] = useState<string[]>(['adulto']);
  const [defaultSelo, setDefaultSelo] = useState('novo');
  const [defaultSumario, setDefaultSumario] = useState('');
  const [showQuickAdvanced, setShowQuickAdvanced] = useState(false);

  // Fila de itens e execução
  const [items, setItems] = useState<BatchFileItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentProcessingIndex, setCurrentProcessingIndex] = useState<number>(-1);
  const [globalError, setGlobalError] = useState('');
  const [legalConfirmed, setLegalConfirmed] = useState(false);
  const [legalError, setLegalError] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const funcoesSugeridas = useMemo(() => {
    return Array.from(new Set([...defaultFuncoes, ...existingFuncoes]));
  }, [defaultFuncoes, existingFuncoes]);

  if (!isOpen) return null;

  // 1. Arquivos locais adicionados
  const handleFilesSelected = (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    setGlobalError('');

    const newItems: BatchFileItem[] = Array.from(fileList).map((file, idx) => ({
      id: `file-${Date.now()}-${idx}-${Math.random().toString(36).slice(2, 6)}`,
      file,
      fileName: file.name,
      title: cleanTitleFromFileName(file.name),
      tipo: selectedTipo,
      plano: defaultPlano,
      funcao: defaultFuncao,
      desc: defaultDesc,
      populacao: [...defaultPopulacao],
      selo: defaultSelo,
      sumario: defaultSumario,
      sizeFormatted: formatBytes(file.size),
      isExpanded: false,
      status: 'pending'
    }));

    setItems((prev) => [...prev, ...newItems]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // 2. Links do R2 adicionados
  const handleProcessLinks = async () => {
    const rawLines = pastedLinksText
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    if (rawLines.length === 0) {
      setGlobalError('Cole ao menos um link ou chave do R2 no campo de texto.');
      return;
    }

    setGlobalError('');
    setIsParsingLinks(true);

    try {
      const parsedItems: BatchFileItem[] = [];

      for (let idx = 0; idx < rawLines.length; idx++) {
        const line = rawLines[idx];
        let fullUrl = line;

        if (!fullUrl.startsWith('http://') && !fullUrl.startsWith('https://')) {
          fullUrl = `${DEFAULT_R2_BASE}/${fullUrl.replace(/^\/+/, '')}`;
        }

        const cleanPath = fullUrl.split('?')[0].split('#')[0];
        const segments = cleanPath.split('/');
        const rawFileName = decodeURIComponent(
          segments[segments.length - 1] || `material-${idx + 1}.pdf`
        );
        const title = cleanTitleFromFileName(rawFileName);

        let sizeFormatted = '1.5 MB';
        try {
          const headRes = await fetch(fullUrl, { method: 'HEAD', mode: 'cors' });
          const cl = headRes.headers.get('content-length');
          if (cl) {
            const bytes = parseInt(cl, 10);
            if (!isNaN(bytes) && bytes > 0) {
              sizeFormatted = formatBytes(bytes);
            }
          }
        } catch {
          // fallback padrão
        }

        parsedItems.push({
          id: `link-${Date.now()}-${idx}-${Math.random().toString(36).slice(2, 6)}`,
          fileName: rawFileName,
          existingUrl: fullUrl,
          title,
          tipo: selectedTipo,
          plano: defaultPlano,
          funcao: defaultFuncao,
          desc: defaultDesc,
          populacao: [...defaultPopulacao],
          selo: defaultSelo,
          sumario: defaultSumario,
          sizeFormatted,
          isExpanded: false,
          status: 'pending'
        });
      }

      setItems((prev) => [...prev, ...parsedItems]);
      setPastedLinksText('');
    } catch (err: any) {
      console.error('Erro ao processar links do R2:', err);
      setGlobalError(err.message || 'Falha ao processar links informados.');
    } finally {
      setIsParsingLinks(false);
    }
  };

  // 3. Aplicar defaults a todos os itens da fila
  const handleApplyToAll = () => {
    setItems((prev) =>
      prev.map((item) => ({
        ...item,
        tipo: selectedTipo,
        plano: defaultPlano,
        funcao: defaultFuncao,
        desc: defaultDesc,
        populacao: [...defaultPopulacao],
        selo: defaultSelo,
        sumario: defaultSumario
      }))
    );
  };

  const handleToggleExpandAll = (expand: boolean) => {
    setItems((prev) => prev.map((item) => ({ ...item, isExpanded: expand })));
  };

  const handleRemoveItem = (id: string) => {
    if (isProcessing) return;
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleUpdateItem = (id: string, updates: Partial<BatchFileItem>) => {
    if (isProcessing) return;
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );
  };

  // 4. Executar lote
  const handleStartBatch = async (status: 'publicado' | 'rascunho') => {
    if (items.length === 0) {
      setGlobalError('Nenhum item na fila para processar.');
      return;
    }

    if (status === 'publicado' && !legalConfirmed) {
      setLegalError(true);
      return;
    }

    setIsProcessing(true);
    setGlobalError('');
    let successCount = 0;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const authHeaders: Record<string, string> = session?.access_token
        ? { Authorization: `Bearer ${session.access_token}` }
        : {};

      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.status === 'done') {
          successCount++;
          continue;
        }

        setCurrentProcessingIndex(i);

        let downloadUrl = item.existingUrl || '';

        // Se for arquivo local, faz o upload para o Cloudflare R2
        if (!downloadUrl && item.file) {
          setItems((prev) =>
            prev.map((it, idx) => (idx === i ? { ...it, status: 'uploading' } : it))
          );

          try {
            const preRes = await fetch('/api/admin/upload-r2/presigned', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                ...authHeaders
              },
              body: JSON.stringify({
                fileName: item.file.name,
                contentType: item.file.type || 'application/octet-stream'
              })
            });

            if (!preRes.ok) {
              const errTxt = await preRes.text();
              throw new Error(`Falha no servidor R2 (${preRes.status}): ${errTxt}`);
            }

            const preJson = await preRes.json();
            if (!preJson.success || !preJson.uploadUrl) {
              throw new Error(preJson.error || 'URL de upload R2 não retornada');
            }

            const uploadRes = await fetch(preJson.uploadUrl, {
              method: 'PUT',
              body: item.file
            });

            if (!uploadRes.ok) {
              throw new Error(`Erro ao enviar bytes para o R2 (${uploadRes.status})`);
            }

            downloadUrl = preJson.publicUrl || '';
          } catch (uploadErr: any) {
            console.error(`Erro no upload do arquivo ${item.fileName}:`, uploadErr);
            setItems((prev) =>
              prev.map((it, idx) =>
                idx === i
                  ? { ...it, status: 'error', errorMessage: uploadErr.message || 'Falha no envio R2' }
                  : it
              )
            );
            continue;
          }
        }

        if (!downloadUrl) {
          setItems((prev) =>
            prev.map((it, idx) =>
              idx === i
                ? { ...it, status: 'error', errorMessage: 'Nenhum link ou arquivo fornecido' }
                : it
            )
          );
          continue;
        }

        // Gravação no Supabase
        setItems((prev) =>
          prev.map((it, idx) => (idx === i ? { ...it, status: 'saving' } : it))
        );

        try {
          const targetId = `mat-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
          const formatExt = (item.fileName || '').toLowerCase();
          const dbType = mapTipoToDbType(item.tipo || selectedTipo);

          const payload = {
            id: targetId,
            title: item.title.trim() || cleanTitleFromFileName(item.fileName),
            description: item.desc || '',
            type: dbType,
            age_groups: item.populacao && item.populacao.length > 0 ? item.populacao : ['adulto'],
            clinical_utility: item.funcao.trim() || 'Geral',
            domains:
              item.plano === 'Prática'
                ? ['pratica']
                : item.plano === 'Estudo'
                ? ['estudo']
                : ['consulta'],
            download_format: formatExt.endsWith('.docx')
              ? 'DOCX'
              : formatExt.endsWith('.mp4')
              ? 'MP4'
              : formatExt.endsWith('.xlsx')
              ? 'XLSX'
              : 'PDF',
            download_size: item.sizeFormatted,
            download_url: downloadUrl,
            key_instructions: item.sumario ? item.sumario.split('\n').filter(Boolean) : [],
            is_featured: item.selo === 'novo',
            published_at: status === 'publicado' ? new Date().toISOString() : null
          };

          if (isSupabaseConfigured) {
            const { error: dbError } = await supabase.from('materials').upsert([payload]);
            if (dbError) throw dbError;
          }

          setItems((prev) =>
            prev.map((it, idx) => (idx === i ? { ...it, status: 'done' } : it))
          );
          successCount++;
        } catch (dbErr: any) {
          console.error(`Erro ao salvar no banco o material ${item.title}:`, dbErr);
          setItems((prev) =>
            prev.map((it, idx) =>
              idx === i
                ? { ...it, status: 'error', errorMessage: dbErr.message || 'Erro ao gravar no Supabase' }
                : it
            )
          );
        }
      }

      if (successCount > 0) {
        await onSuccess(successCount);
      }
    } catch (err: any) {
      setGlobalError(err.message || 'Erro inesperado durante a execução do lote.');
    } finally {
      setIsProcessing(false);
      setCurrentProcessingIndex(-1);
    }
  };

  const completedCount = items.filter((it) => it.status === 'done').length;
  const progressPercent = items.length > 0 ? Math.round((completedCount / items.length) * 100) : 0;
  const allExpanded = items.length > 0 && items.every((it) => it.isExpanded);

  return (
    <div
      className="drawer-overlay on"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(21, 20, 15, 0.45)',
        backdropFilter: 'blur(4px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}
    >
      <aside
        className="drawer on"
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '920px',
          maxHeight: '94vh',
          borderRadius: '20px',
          boxShadow: '0 24px 60px rgba(0,0,0,0.22)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          background: 'var(--paper)'
        }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="batch-modal-title"
      >
        {/* Header */}
        <div className="d-head">
          <div>
            <span className="label">Administração do Acervo</span>
            <h2 id="batch-modal-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>Upload e Cadastro Completo em Lote</span>
              <span className="dot">.</span>
            </h2>
          </div>
          <button
            type="button"
            className="d-close"
            onClick={() => !isProcessing && onClose()}
            aria-label="Fechar"
            disabled={isProcessing}
          >
            <X size={18} />
          </button>
        </div>

        {/* Body Content */}
        <div className="d-body" style={{ gap: '20px', overflowY: 'auto' }}>
          {globalError && (
            <div
              style={{
                padding: '12px 14px',
                borderRadius: '12px',
                background: '#fcebe9',
                border: '1px solid #f2aba4',
                color: '#a8261d',
                fontSize: '13px'
              }}
            >
              <b>Atenção:</b> {globalError}
            </div>
          )}

          {/* 1. Seleção do Tipo de Material do Lote */}
          <div className="f">
            <label htmlFor="batch-tipo">Tipo Base do Lote (Padrão para novos itens)</label>
            <select
              id="batch-tipo"
              value={selectedTipo}
              disabled={isProcessing}
              onChange={(e) => setSelectedTipo(e.target.value)}
            >
              {TIPOS_CONFIG.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          {/* 2. Alternador de Abas: Upload de Arquivos vs Colar Links do R2 */}
          <div
            style={{
              display: 'flex',
              gap: '8px',
              borderBottom: '1px solid var(--line)',
              paddingBottom: '12px'
            }}
          >
            <button
              type="button"
              onClick={() => setInputMode('upload')}
              disabled={isProcessing}
              style={{
                padding: '8px 16px',
                borderRadius: '10px',
                border: 'none',
                background: inputMode === 'upload' ? 'var(--ink)' : 'var(--bone)',
                color: inputMode === 'upload' ? 'var(--paper)' : 'var(--ink)',
                fontWeight: 600,
                fontSize: '13px',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '7px',
                transition: 'all .15s ease'
              }}
            >
              <UploadCloud size={15} />
              <span>Enviar arquivos do computador</span>
            </button>
            <button
              type="button"
              onClick={() => setInputMode('links')}
              disabled={isProcessing}
              style={{
                padding: '8px 16px',
                borderRadius: '10px',
                border: 'none',
                background: inputMode === 'links' ? 'var(--ink)' : 'var(--bone)',
                color: inputMode === 'links' ? 'var(--paper)' : 'var(--ink)',
                fontWeight: 600,
                fontSize: '13px',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '7px',
                transition: 'all .15s ease'
              }}
            >
              <Link2 size={15} />
              <span>Colar links do Cloudflare R2</span>
            </button>
          </div>

          {/* Modo A: Upload Local (Drag & Drop) */}
          {inputMode === 'upload' && (
            <div className="f">
              <label>Arquivos para Envio (.pdf, .docx, .xlsx, .mp4)</label>
              <label
                className="drop"
                style={{
                  padding: '28px',
                  border: '2px dashed var(--line)',
                  background: 'var(--bone)',
                  cursor: isProcessing ? 'not-allowed' : 'pointer'
                }}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept=".pdf,.docx,.xlsx,.mp4"
                  disabled={isProcessing}
                  onChange={(e) => handleFilesSelected(e.target.files)}
                  style={{ position: 'absolute', width: 1, height: 1, opacity: 0 }}
                />
                <UploadCloud size={32} style={{ color: 'var(--accent-strong)' }} />
                <b style={{ fontSize: '15px' }}>Clique aqui ou arraste múltiplos arquivos</b>
                <span>Selecione vários arquivos segurando Shift ou Ctrl</span>
              </label>
            </div>
          )}

          {/* Modo B: Colar Links do R2 */}
          {inputMode === 'links' && (
            <div className="f">
              <label htmlFor="batch-links-textarea">
                Cole os links ou chaves do Cloudflare R2 (um por linha)
              </label>
              <textarea
                id="batch-links-textarea"
                rows={4}
                disabled={isProcessing || isParsingLinks}
                value={pastedLinksText}
                onChange={(e) => setPastedLinksText(e.target.value)}
                placeholder={`https://pub-...r2.dev/materiais/guia-tdah.pdf\nhttps://pub-...r2.dev/materiais/modelo-laudo-tea.docx\nou apenas chaves: materiais/teste-memoria.pdf`}
                style={{
                  fontFamily: 'var(--mono, monospace)',
                  fontSize: '12.5px',
                  lineHeight: '1.6',
                  padding: '12px',
                  borderRadius: '10px'
                }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px' }}>
                <span style={{ fontSize: '11px', color: 'var(--ink-faint)' }}>
                  Aceita URLs completas ou chaves relativas. Título e tamanho são extraídos automaticamente.
                </span>
                <button
                  type="button"
                  onClick={handleProcessLinks}
                  disabled={isProcessing || isParsingLinks || !pastedLinksText.trim()}
                  className="btn"
                  style={{
                    padding: '6px 14px',
                    fontSize: '12px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <RefreshCw size={13} className={isParsingLinks ? 'animate-spin' : ''} />
                  <span>{isParsingLinks ? 'Processando links...' : 'Adicionar links à fila'}</span>
                </button>
              </div>
            </div>
          )}

          {/* 3. Painel de Preenchimento Rápido com Todos os Campos */}
          {items.length > 0 && (
            <div
              style={{
                padding: '16px',
                borderRadius: '14px',
                background: 'rgba(21,20,15,0.03)',
                border: '1px solid var(--line)'
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '12px'
                }}
              >
                <div>
                  <span
                    style={{
                      font: '600 12px/1 var(--sans)',
                      letterSpacing: '.08em',
                      textTransform: 'uppercase',
                      color: 'var(--ink)'
                    }}
                  >
                    Preenchimento Rápido / Aplicar a Todos
                  </span>
                  <p style={{ margin: '3px 0 0', fontSize: '11px', color: 'var(--ink-mute)' }}>
                    Defina valores padrões e clique em aplicar para preencher todos os itens da fila de uma vez.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleApplyToAll}
                  disabled={isProcessing}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '8px',
                    border: '1px solid var(--line)',
                    background: 'var(--paper)',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <RefreshCw size={13} />
                  Aplicar tudo a todos da fila
                </button>
              </div>

              {/* Linha 1: Plano, Função e Selo */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr 1fr', gap: '10px', marginBottom: '10px' }}>
                <div className="f">
                  <label htmlFor="quick-plano" style={{ fontSize: '11px' }}>
                    Plano Mínimo Padrão
                  </label>
                  <select
                    id="quick-plano"
                    value={defaultPlano}
                    disabled={isProcessing}
                    onChange={(e) => setDefaultPlano(e.target.value as any)}
                  >
                    <option value="Consulta">Consulta (Básico)</option>
                    <option value="Estudo">Estudo (Intermediário)</option>
                    <option value="Prática">Prática (Completo)</option>
                  </select>
                </div>

                <div className="f">
                  <label htmlFor="quick-func" style={{ fontSize: '11px' }}>
                    Função Cognitiva Padrão
                  </label>
                  <input
                    id="quick-func"
                    type="text"
                    list="batch-func-list"
                    placeholder="Ex: Memória, Atenção..."
                    value={defaultFuncao}
                    disabled={isProcessing}
                    onChange={(e) => setDefaultFuncao(e.target.value)}
                    autoComplete="off"
                  />
                </div>

                <div className="f">
                  <label htmlFor="quick-selo" style={{ fontSize: '11px' }}>
                    Selo Padrão
                  </label>
                  <select
                    id="quick-selo"
                    value={defaultSelo}
                    disabled={isProcessing}
                    onChange={(e) => setDefaultSelo(e.target.value)}
                  >
                    <option value="novo">Novo</option>
                    <option value="atualizado">Atualizado</option>
                    <option value="">Sem selo</option>
                  </select>
                </div>
              </div>

              {/* População Padrão */}
              <div style={{ marginBottom: '10px' }}>
                <label style={{ fontSize: '11px', display: 'block', marginBottom: '4px', fontWeight: 600 }}>
                  População Padrão
                </label>
                <div className="chks" style={{ display: 'flex', gap: '12px' }}>
                  {POPULACOES_CONFIG.map((pop) => (
                    <label key={pop.id} style={{ fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={defaultPopulacao.includes(pop.id)}
                        disabled={isProcessing}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setDefaultPopulacao([...defaultPopulacao, pop.id]);
                          } else {
                            setDefaultPopulacao(defaultPopulacao.filter((p) => p !== pop.id));
                          }
                        }}
                      />
                      {pop.label}
                    </label>
                  ))}
                </div>
              </div>

              {/* Botão de Alternar Campos Avançados no Preenchimento Rápido */}
              <div>
                <button
                  type="button"
                  onClick={() => setShowQuickAdvanced(!showQuickAdvanced)}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '11.5px',
                    color: 'var(--accent-strong)',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: 0
                  }}
                >
                  {showQuickAdvanced ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                  <span>{showQuickAdvanced ? 'Ocultar Descrição e Sumário padrões' : 'Configurar Descrição curta e Sumário padrões'}</span>
                </button>

                {showQuickAdvanced && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '10px' }}>
                    <div className="f">
                      <label htmlFor="quick-desc" style={{ fontSize: '11px' }}>Descrição curta padrão</label>
                      <textarea
                        id="quick-desc"
                        rows={2}
                        value={defaultDesc}
                        disabled={isProcessing}
                        placeholder="Aparece no card da biblioteca..."
                        onChange={(e) => setDefaultDesc(e.target.value)}
                      />
                    </div>

                    <div className="f">
                      <label htmlFor="quick-sum" style={{ fontSize: '11px' }}>Sumário padrão (tópicos por linha)</label>
                      <textarea
                        id="quick-sum"
                        rows={2}
                        value={defaultSumario}
                        disabled={isProcessing}
                        placeholder={'Material necessário\nInstruções\nInterpretação'}
                        onChange={(e) => setDefaultSumario(e.target.value)}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Datalist Compartilhado de Sugestões de Função Cognitiva */}
          <datalist id="batch-func-list">
            {funcoesSugeridas.map((f) => (
              <option key={f} value={f} />
            ))}
          </datalist>

          {/* 4. Barra de Progresso Global durante Envio */}
          {isProcessing && (
            <div
              style={{
                padding: '14px',
                borderRadius: '12px',
                background: 'var(--ink)',
                color: 'var(--paper)'
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: '8px',
                  fontSize: '13px',
                  fontWeight: 600
                }}
              >
                <span>
                  Processando itens ({completedCount}/{items.length})...
                </span>
                <span>{progressPercent}%</span>
              </div>
              <div
                style={{
                  width: '100%',
                  height: '8px',
                  borderRadius: '4px',
                  background: 'rgba(255,255,255,0.2)',
                  overflow: 'hidden'
                }}
              >
                <div
                  style={{
                    width: `${progressPercent}%`,
                    height: '100%',
                    background: 'var(--lime)',
                    transition: 'width 0.3s ease'
                  }}
                />
              </div>
            </div>
          )}

          {/* 5. Lista de Arquivos da Fila com Edição Completa */}
          {items.length > 0 && (
            <div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '10px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <label
                    style={{
                      font: '600 11px/1.3 var(--sans)',
                      letterSpacing: '.16em',
                      textTransform: 'uppercase'
                    }}
                  >
                    Itens na Fila ({items.length})
                  </label>

                  <button
                    type="button"
                    onClick={() => handleToggleExpandAll(!allExpanded)}
                    style={{
                      background: 'none',
                      border: 'none',
                      fontSize: '12px',
                      color: 'var(--accent-strong)',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    {allExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    <span>{allExpanded ? 'Recolher todos os detalhes' : 'Expandir todos os detalhes'}</span>
                  </button>
                </div>

                {!isProcessing && (
                  <button
                    type="button"
                    onClick={() => setItems([])}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#a8261d',
                      fontSize: '12px',
                      cursor: 'pointer'
                    }}
                  >
                    Limpar fila
                  </button>
                )}
              </div>

              <div style={{ display: 'grid', gap: '12px' }}>
                {items.map((item, idx) => (
                  <div
                    key={item.id}
                    style={{
                      padding: '14px 16px',
                      borderRadius: '14px',
                      background:
                        item.status === 'done'
                          ? '#f0f9f1'
                          : item.status === 'error'
                          ? '#fdf2f1'
                          : 'var(--bone)',
                      border: `1px solid ${
                        item.status === 'done'
                          ? '#bce3c5'
                          : item.status === 'error'
                          ? '#f5c6c2'
                          : 'var(--line)'
                      }`,
                      display: 'grid',
                      gap: '12px'
                    }}
                  >
                    {/* Linha de Cabeçalho do Card */}
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          minWidth: 0
                        }}
                      >
                        <span
                          style={{
                            fontSize: '12px',
                            fontWeight: 700,
                            color: 'var(--ink-mute)'
                          }}
                        >
                          #{idx + 1}
                        </span>
                        <span
                          style={{ fontSize: '13px', fontWeight: 600, color: 'var(--ink)' }}
                          className="truncate"
                          title={item.fileName}
                        >
                          {item.fileName}
                        </span>
                        {item.existingUrl ? (
                          <span
                            style={{
                              fontSize: '10.5px',
                              background: 'rgba(21,20,15,0.06)',
                              padding: '2px 7px',
                              borderRadius: '4px',
                              color: 'var(--ink-mute)',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                            title={item.existingUrl}
                          >
                            <Link2 size={11} /> Link R2
                          </span>
                        ) : (
                          <span
                            style={{
                              fontSize: '11px',
                              color: 'var(--ink-mute)',
                              whiteSpace: 'nowrap'
                            }}
                          >
                            ({item.sizeFormatted})
                          </span>
                        )}
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        {item.status === 'done' && (
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              fontSize: '12px',
                              color: '#2f6b31',
                              fontWeight: 600
                            }}
                          >
                            <CheckCircle2 size={16} /> Concluído
                          </span>
                        )}
                        {item.status === 'uploading' && (
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              fontSize: '12px',
                              color: 'var(--accent-strong)'
                            }}
                          >
                            <RefreshCw size={14} className="animate-spin" /> Enviando ao R2...
                          </span>
                        )}
                        {item.status === 'saving' && (
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              fontSize: '12px',
                              color: 'var(--accent-strong)'
                            }}
                          >
                            <Layers size={14} /> Gravando no banco...
                          </span>
                        )}
                        {item.status === 'error' && (
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              fontSize: '12px',
                              color: '#a8261d',
                              fontWeight: 600
                            }}
                            title={item.errorMessage}
                          >
                            <AlertCircle size={16} /> Falhou
                          </span>
                        )}

                        {/* Botão Expandir / Recolher Detalhes */}
                        <button
                          type="button"
                          onClick={() => handleUpdateItem(item.id, { isExpanded: !item.isExpanded })}
                          style={{
                            background: 'var(--paper)',
                            border: '1px solid var(--line)',
                            borderRadius: '6px',
                            padding: '4px 8px',
                            fontSize: '11px',
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            color: 'var(--ink)'
                          }}
                        >
                          {item.isExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                          <span>{item.isExpanded ? 'Recolher' : 'Todos os campos'}</span>
                        </button>

                        {!isProcessing && (
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(item.id)}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: 'var(--ink-mute)',
                              cursor: 'pointer',
                              padding: '4px'
                            }}
                            title="Remover item da fila"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Linha Principal de Campos Compactos: Título, Tipo, Plano e Função */}
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '1.6fr 1fr 1fr 1fr',
                        gap: '10px'
                      }}
                    >
                      <div>
                        <input
                          type="text"
                          placeholder="Título do Material..."
                          value={item.title}
                          disabled={isProcessing || item.status === 'done'}
                          onChange={(e) => handleUpdateItem(item.id, { title: e.target.value })}
                          style={{ fontSize: '13px', padding: '8px 10px' }}
                        />
                      </div>

                      <div>
                        <select
                          value={item.tipo}
                          disabled={isProcessing || item.status === 'done'}
                          onChange={(e) => handleUpdateItem(item.id, { tipo: e.target.value })}
                          style={{ fontSize: '13px', padding: '8px 10px' }}
                        >
                          {TIPOS_CONFIG.map((t) => (
                            <option key={t.id} value={t.id}>
                              {t.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <select
                          value={item.plano}
                          disabled={isProcessing || item.status === 'done'}
                          onChange={(e) =>
                            handleUpdateItem(item.id, { plano: e.target.value as any })
                          }
                          style={{ fontSize: '13px', padding: '8px 10px' }}
                        >
                          <option value="Consulta">Consulta</option>
                          <option value="Estudo">Estudo</option>
                          <option value="Prática">Prática</option>
                        </select>
                      </div>

                      <div>
                        <input
                          type="text"
                          list="batch-func-list"
                          placeholder="Função cognitiva..."
                          value={item.funcao}
                          disabled={isProcessing || item.status === 'done'}
                          onChange={(e) =>
                            handleUpdateItem(item.id, { funcao: e.target.value })
                          }
                          style={{ fontSize: '13px', padding: '8px 10px' }}
                          autoComplete="off"
                        />
                      </div>
                    </div>

                    {/* Detalhes Expandidos: População, Selo, Descrição Curta e Sumário */}
                    {item.isExpanded && (
                      <div
                        style={{
                          paddingTop: '12px',
                          borderTop: '1px dashed var(--line)',
                          display: 'grid',
                          gap: '12px',
                          background: 'rgba(255,255,255,0.4)',
                          padding: '12px',
                          borderRadius: '10px'
                        }}
                      >
                        {/* População e Selo */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1fr', gap: '12px' }}>
                          <div>
                            <label style={{ fontSize: '11px', display: 'block', marginBottom: '4px', fontWeight: 600 }}>
                              População
                            </label>
                            <div className="chks" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                              {POPULACOES_CONFIG.map((pop) => (
                                <label key={pop.id} style={{ fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                                  <input
                                    type="checkbox"
                                    checked={item.populacao.includes(pop.id)}
                                    disabled={isProcessing || item.status === 'done'}
                                    onChange={(e) => {
                                      const nextPop = e.target.checked
                                        ? [...item.populacao, pop.id]
                                        : item.populacao.filter((p) => p !== pop.id);
                                      handleUpdateItem(item.id, { populacao: nextPop });
                                    }}
                                  />
                                  {pop.label}
                                </label>
                              ))}
                            </div>
                          </div>

                          <div className="f">
                            <label style={{ fontSize: '11px' }}>Selo</label>
                            <select
                              value={item.selo}
                              disabled={isProcessing || item.status === 'done'}
                              onChange={(e) => handleUpdateItem(item.id, { selo: e.target.value })}
                              style={{ fontSize: '12.5px', padding: '6px 10px' }}
                            >
                              <option value="novo">Novo</option>
                              <option value="atualizado">Atualizado</option>
                              <option value="">Sem selo</option>
                            </select>
                          </div>
                        </div>

                        {/* Descrição e Sumário */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                          <div className="f">
                            <label style={{ fontSize: '11px' }}>Descrição curta (até 2 linhas)</label>
                            <textarea
                              rows={2}
                              placeholder="Descrição para o card na biblioteca..."
                              value={item.desc}
                              disabled={isProcessing || item.status === 'done'}
                              onChange={(e) => handleUpdateItem(item.id, { desc: e.target.value })}
                              style={{ fontSize: '12.5px', padding: '8px' }}
                            />
                          </div>

                          <div className="f">
                            <label style={{ fontSize: '11px' }}>Sumário (um tópico por linha)</label>
                            <textarea
                              rows={2}
                              placeholder={'Material necessário\nInstruções de aplicação\nInterpretação'}
                              value={item.sumario}
                              disabled={isProcessing || item.status === 'done'}
                              onChange={(e) => handleUpdateItem(item.id, { sumario: e.target.value })}
                              style={{ fontSize: '12.5px', padding: '8px' }}
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {item.errorMessage && (
                      <div style={{ fontSize: '11px', color: '#a8261d', marginTop: '2px' }}>
                        Erro: {item.errorMessage}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions com Confirmação Legal Global */}
        <div
          className="d-foot"
          style={{
            background: 'var(--paper)',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            borderTop: '1px solid var(--line)'
          }}
        >
          {/* Confirmação Legal Global */}
          <label
            className={`legal ${legalError ? 'err' : ''}`}
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '9px',
              cursor: 'pointer',
              margin: 0
            }}
          >
            <input
              type="checkbox"
              id="batch-legal"
              checked={legalConfirmed}
              disabled={isProcessing}
              onChange={(e) => {
                setLegalConfirmed(e.target.checked);
                setLegalError(false);
              }}
              style={{ marginTop: '2px' }}
            />
            <span style={{ fontSize: '12px', lineHeight: 1.4, color: 'var(--ink)' }}>
              <b>Confirmo que todos os materiais deste lote são de autoria própria</b> e não reproduzem itens, folhas de registro, tabelas normativas ou trechos de testes psicológicos restritos.
            </span>
          </label>
          {legalError && (
            <span style={{ color: '#a8261d', fontSize: '12px', marginTop: '-6px' }}>
              Você deve confirmar a autoria dos materiais para publicá-los no lote.
            </span>
          )}

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              type="button"
              className="btn"
              onClick={() => !isProcessing && onClose()}
              disabled={isProcessing}
              style={{ flex: 1, justifyContent: 'center' }}
            >
              Cancelar
            </button>

            <button
              type="button"
              className="btn"
              disabled={isProcessing || items.length === 0}
              onClick={() => handleStartBatch('rascunho')}
              style={{
                flex: 1.2,
                justifyContent: 'center',
                background: 'var(--bone)',
                color: 'var(--ink)',
                borderColor: 'var(--line)'
              }}
            >
              Salvar como Rascunho ({items.length})
            </button>

            <button
              type="button"
              className="btn btn-primary"
              disabled={isProcessing || items.length === 0}
              onClick={() => handleStartBatch('publicado')}
              style={{ flex: 1.4, justifyContent: 'center' }}
            >
              {isProcessing ? 'Processando Lote...' : `Publicar Todos (${items.length})`}
            </button>
          </div>
        </div>
      </aside>
    </div>
  );
};
