'use client';

import React, { useState, useRef, useMemo } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { UploadCloud, CheckCircle2, AlertCircle, Trash2, X, RefreshCw, Layers } from 'lucide-react';

export interface BatchFileItem {
  id: string;
  file: File;
  title: string;
  plano: 'Consulta' | 'Estudo' | 'Prática';
  funcao: string;
  sizeFormatted: string;
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

export const BatchUploadModal: React.FC<BatchUploadModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  defaultFuncoes,
  existingFuncoes
}) => {
  const [selectedTipo, setSelectedTipo] = useState('guia');
  const [defaultPlano, setDefaultPlano] = useState<'Consulta' | 'Estudo' | 'Prática'>('Consulta');
  const [defaultFuncao, setDefaultFuncao] = useState('');
  const [items, setItems] = useState<BatchFileItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentProcessingIndex, setCurrentProcessingIndex] = useState<number>(-1);
  const [globalError, setGlobalError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const funcoesSugeridas = useMemo(() => {
    return Array.from(new Set([...defaultFuncoes, ...existingFuncoes]));
  }, [defaultFuncoes, existingFuncoes]);

  if (!isOpen) return null;

  const handleFilesSelected = (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    setGlobalError('');

    const newItems: BatchFileItem[] = Array.from(fileList).map((file, idx) => ({
      id: `${Date.now()}-${idx}-${Math.random().toString(36).slice(2, 6)}`,
      file,
      title: cleanTitleFromFileName(file.name),
      plano: defaultPlano,
      funcao: defaultFuncao,
      sizeFormatted: formatBytes(file.size),
      status: 'pending'
    }));

    setItems((prev) => [...prev, ...newItems]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleApplyToAll = () => {
    setItems((prev) =>
      prev.map((item) => ({
        ...item,
        plano: defaultPlano,
        funcao: defaultFuncao
      }))
    );
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

  const handleStartBatch = async (status: 'publicado' | 'rascunho') => {
    if (items.length === 0) {
      setGlobalError('Nenhum arquivo na fila para upload.');
      return;
    }

    setIsProcessing(true);
    setGlobalError('');
    let successCount = 0;

    const dbType =
      selectedTipo === 'guia' ? 'guia_rapido' :
      selectedTipo === 'laudo' ? 'modelo_laudo' :
      selectedTipo === 'anamnese' ? 'entrevista_anamnese' :
      selectedTipo === 'compendio' ? 'compendio_estudo' :
      selectedTipo === 'instrumento' ? 'instrumento_rastreio' :
      selectedTipo === 'pdf' ? 'guia_rapido' :
      selectedTipo === 'aula' ? 'compendio_estudo' : 'instrumento_rastreio';

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

        // 1. Upload para Cloudflare R2
        setItems((prev) =>
          prev.map((it, idx) => (idx === i ? { ...it, status: 'uploading' } : it))
        );

        let downloadUrl = '';

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
          console.error(`Erro no upload do arquivo ${item.file.name}:`, uploadErr);
          setItems((prev) =>
            prev.map((it, idx) =>
              idx === i
                ? { ...it, status: 'error', errorMessage: uploadErr.message || 'Falha no envio R2' }
                : it
            )
          );
          continue;
        }

        // 2. Salvar no Supabase
        setItems((prev) =>
          prev.map((it, idx) => (idx === i ? { ...it, status: 'saving' } : it))
        );

        try {
          const targetId = `mat-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
          const payload = {
            id: targetId,
            title: item.title.trim() || cleanTitleFromFileName(item.file.name),
            description: '',
            type: dbType,
            age_groups: ['adulto'],
            clinical_utility: item.funcao.trim() || 'Geral',
            domains:
              item.plano === 'Prática'
                ? ['pratica']
                : item.plano === 'Estudo'
                ? ['estudo']
                : ['consulta'],
            download_format: item.file.name.toLowerCase().endsWith('.docx')
              ? 'DOCX'
              : item.file.name.toLowerCase().endsWith('.mp4')
              ? 'MP4'
              : item.file.name.toLowerCase().endsWith('.xlsx')
              ? 'XLSX'
              : 'PDF',
            download_size: item.sizeFormatted,
            download_url: downloadUrl,
            key_instructions: [],
            is_featured: false,
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
                ? { ...it, status: 'error', errorMessage: dbErr.message || 'Falha ao salvar no banco' }
                : it
            )
          );
        }
      }

      if (successCount > 0) {
        await onSuccess(successCount);
      }
    } catch (err: any) {
      setGlobalError(err.message || 'Erro inesperado durante o processamento do lote.');
    } finally {
      setIsProcessing(false);
      setCurrentProcessingIndex(-1);
    }
  };

  const completedCount = items.filter((i) => i.status === 'done').length;
  const progressPercent = items.length > 0 ? Math.round((completedCount / items.length) * 100) : 0;

  return (
    <div className="adm-root">
      <div className={`scrim ${isOpen ? 'on' : ''}`} onClick={() => !isProcessing && onClose()} />
      <aside
        className={`drawer ${isOpen ? 'on' : ''}`}
        style={{ width: 'min(780px, 100vw)', zIndex: 75 }}
        aria-label="Upload de Materiais em Lote"
      >
        {/* Top Header */}
        <div className="d-top">
          <div>
            <h2>
              Upload em <em>Lote</em>
            </h2>
            <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--ink-mute)' }}>
              Suba múltiplos arquivos simultaneamente para o mesmo tipo de material.
            </p>
          </div>
          <button
            type="button"
            className="d-close"
            onClick={() => !isProcessing && onClose()}
            disabled={isProcessing}
            aria-label="Fechar"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body Content */}
        <div className="d-body" style={{ gap: '20px' }}>
          {globalError && (
            <div style={{ padding: '12px 14px', borderRadius: '12px', background: '#fcebe9', border: '1px solid #f2aba4', color: '#a8261d', fontSize: '13px' }}>
              <b>Atenção:</b> {globalError}
            </div>
          )}

          {/* 1. Seleção do Tipo de Material do Lote */}
          <div className="f">
            <label htmlFor="batch-tipo">Tipo do Lote (Aplica-se a todos)</label>
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

          {/* 2. Área de Upload Múltiplo (Drag & Drop) */}
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

          {/* 3. Barra de Configuração Rápida em Massa */}
          {items.length > 0 && (
            <div style={{ padding: '16px', borderRadius: '14px', background: 'rgba(21,20,15,0.03)', border: '1px solid var(--line)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span style={{ font: '600 12px/1 var(--sans)', letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--ink)' }}>
                  Preenchimento Rápido para a Fila
                </span>
                <button
                  type="button"
                  onClick={handleApplyToAll}
                  disabled={isProcessing}
                  style={{
                    padding: '6px 12px',
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
                  Aplicar Plano e Função a Todos
                </button>
              </div>

              <div className="f2">
                <div className="f">
                  <label htmlFor="quick-plano" style={{ fontSize: '11px' }}>Plano Padrão</label>
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
                  <label htmlFor="quick-func" style={{ fontSize: '11px' }}>Função Cognitiva Padrão</label>
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
            <div style={{ padding: '14px', borderRadius: '12px', background: 'var(--ink)', color: 'var(--paper)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px', fontWeight: 600 }}>
                <span>Processando arquivos ({completedCount}/{items.length})...</span>
                <span>{progressPercent}%</span>
              </div>
              <div style={{ width: '100%', height: '8px', borderRadius: '4px', background: 'rgba(255,255,255,0.2)', overflow: 'hidden' }}>
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

          {/* 5. Lista de Arquivos da Fila com Edição Individual */}
          {items.length > 0 && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <label style={{ font: '600 11px/1.3 var(--sans)', letterSpacing: '.16em', textTransform: 'uppercase' }}>
                  Arquivos na Fila ({items.length})
                </label>
                {!isProcessing && (
                  <button
                    type="button"
                    onClick={() => setItems([])}
                    style={{ background: 'none', border: 'none', color: '#a8261d', fontSize: '12px', cursor: 'pointer' }}
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
                      background: item.status === 'done' ? '#f0f9f1' : item.status === 'error' ? '#fdf2f1' : 'var(--bone)',
                      border: `1px solid ${item.status === 'done' ? '#bce3c5' : item.status === 'error' ? '#f5c6c2' : 'var(--line)'}`,
                      display: 'grid',
                      gap: '10px'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                        <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--ink-mute)' }}>
                          #{idx + 1}
                        </span>
                        <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--ink)' }} className="truncate" title={item.file.name}>
                          {item.file.name}
                        </span>
                        <span style={{ fontSize: '11px', color: 'var(--ink-mute)', whiteSpace: 'nowrap' }}>
                          ({item.sizeFormatted})
                        </span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        {item.status === 'done' && (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#2f6b31', fontWeight: 600 }}>
                            <CheckCircle2 size={16} /> Concluído
                          </span>
                        )}
                        {item.status === 'uploading' && (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: 'var(--accent-strong)' }}>
                            <RefreshCw size={14} className="animate-spin" /> Enviando ao R2...
                          </span>
                        )}
                        {item.status === 'saving' && (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: 'var(--accent-strong)' }}>
                            <Layers size={14} /> Gravando no banco...
                          </span>
                        )}
                        {item.status === 'error' && (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#a8261d', fontWeight: 600 }} title={item.errorMessage}>
                            <AlertCircle size={16} /> Falhou
                          </span>
                        )}

                        {!isProcessing && (
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(item.id)}
                            style={{ background: 'none', border: 'none', color: 'var(--ink-mute)', cursor: 'pointer', padding: '4px' }}
                            title="Remover arquivo da fila"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Campos Individuais: Título, Plano e Função */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1fr 1fr', gap: '10px' }}>
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
                          value={item.plano}
                          disabled={isProcessing || item.status === 'done'}
                          onChange={(e) => handleUpdateItem(item.id, { plano: e.target.value as any })}
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
                          onChange={(e) => handleUpdateItem(item.id, { funcao: e.target.value })}
                          style={{ fontSize: '13px', padding: '8px 10px' }}
                          autoComplete="off"
                        />
                      </div>
                    </div>

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

        {/* Footer Actions */}
        <div className="d-foot" style={{ background: 'var(--paper)', display: 'flex', gap: '10px' }}>
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
            style={{ flex: 1.2, justifyContent: 'center', background: 'var(--bone)', color: 'var(--ink)', borderColor: 'var(--line)' }}
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
            {isProcessing ? 'Enviando Lote...' : `Publicar Todos (${items.length})`}
          </button>
        </div>
      </aside>
    </div>
  );
};
