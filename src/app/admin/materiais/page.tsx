'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useNeuro } from '@/context/NeuroContext';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import '../admin.css';

export interface MaterialAdminItem {
  id: string;
  t: string;
  tipo: string;
  plano: 'Consulta' | 'Estudo' | 'Prática';
  st: 'publicado' | 'rascunho';
  ac: number;
  up: string;
  desc?: string;
  populacao?: string[];
  funcao?: string;
  selo?: string;
  sumario?: string;
  arquivoNome?: string;
  downloadUrl?: string;
  downloadSize?: string;
  createdAt?: string;
}

export const TIPOS: Record<string, { nome: string; icon: string }> = {
  guia: { nome: 'Guia rápido', icon: 'i-guia' },
  laudo: { nome: 'Modelo de laudo', icon: 'i-laudo' },
  anamnese: { nome: 'Anamnese', icon: 'i-anamnese' },
  compendio: { nome: 'Compêndio', icon: 'i-compendio' },
  instrumento: { nome: 'Instrumento', icon: 'i-instrumento' },
  pdf: { nome: 'PDF e artigo', icon: 'i-pdf' },
  aula: { nome: 'Aula', icon: 'i-aula' },
  interativo: { nome: 'Recurso interativo', icon: 'i-cards' }
};

export const CORES: Record<string, string> = {
  guia: 'var(--cat-guia)',
  laudo: 'var(--cat-laudo)',
  anamnese: 'var(--cat-anamnese)',
  compendio: 'var(--cat-compendio)',
  instrumento: 'var(--cat-instrumento)',
  pdf: 'var(--cat-pdf)',
  aula: 'var(--cat-aula)',
  interativo: 'var(--ink)'
};

export default function AdminMateriaisPage() {
  const router = useRouter();
  const { currentUser, logout, refreshMaterials } = useNeuro();

  // Materials & Subscribers State
  const [materials, setMaterials] = useState<MaterialAdminItem[]>([]);
  const [subscriberCount, setSubscriberCount] = useState<number>(0);
  const [loadingData, setLoadingData] = useState<boolean>(true);
  const [isSavingMat, setIsSavingMat] = useState<boolean>(false);

  // Filters State - Materiais
  const [qMat, setQMat] = useState('');
  const [fTipo, setFTipo] = useState('');
  const [fStatus, setFStatus] = useState('');
  const [fOrd, setFOrd] = useState<'rec' | 'ac' | 'az'>('rec');

  // Drawer Form State (Material)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [formTitulo, setFormTitulo] = useState('');
  const [formTipo, setFormTipo] = useState('guia');
  const [formPlano, setFormPlano] = useState<'Consulta' | 'Estudo' | 'Prática'>('Consulta');
  const [formDesc, setFormDesc] = useState('');
  const [formPopulacao, setFormPopulacao] = useState<string[]>(['adulto']);
  const [formFuncao, setFormFuncao] = useState('Geral');
  const [formSelo, setFormSelo] = useState('novo');
  const [formArquivoNome, setFormArquivoNome] = useState('Escolher arquivo');
  const [formDownloadUrl, setFormDownloadUrl] = useState('');
  const [formFileSize, setFormFileSize] = useState('1.5 MB');
  const [isUploadingR2, setIsUploadingR2] = useState(false);
  const [uploadR2Error, setUploadR2Error] = useState('');
  const [formSumario, setFormSumario] = useState('');
  const [formLegal, setFormLegal] = useState(false);
  const [tituloError, setTituloError] = useState(false);
  const [legalError, setLegalError] = useState(false);

  // Toast Notification State
  const [toastText, setToastText] = useState('');
  const [toastVisible, setToastVisible] = useState(false);
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const showToast = (msg: string) => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToastText(msg);
    setToastVisible(true);
    toastTimeoutRef.current = setTimeout(() => {
      setToastVisible(false);
    }, 2600);
  };

  // Carregar dados de materiais e contagem de assinantes do Supabase
  const fetchMaterialsData = async () => {
    setLoadingData(true);
    try {
      if (!isSupabaseConfigured) {
        setLoadingData(false);
        return;
      }

      // 1. Materiais reais
      const { data: matData, error: matError } = await supabase
        .from('materials')
        .select('*')
        .order('created_at', { ascending: false });

      if (!matError && matData) {
        const mappedMats: MaterialAdminItem[] = matData.map((m: any) => {
          let tipo = 'guia';
          if (m.type === 'guia_rapido') tipo = 'guia';
          else if (m.type === 'modelo_laudo') tipo = 'laudo';
          else if (m.type === 'entrevista_anamnese') tipo = 'anamnese';
          else if (m.type === 'compendio_estudo') tipo = 'compendio';
          else if (m.type === 'instrumento_rastreio') tipo = 'instrumento';
          else if (m.type === 'tabela_normativa') tipo = 'pdf';
          else if (TIPOS[m.type]) tipo = m.type;

          let plano: 'Consulta' | 'Estudo' | 'Prática' = 'Consulta';
          if (tipo === 'interativo' || m.domains?.includes('pratica')) plano = 'Prática';
          else if (tipo === 'aula' || m.domains?.includes('estudo')) plano = 'Estudo';

          return {
            id: String(m.id),
            t: m.title || 'Sem título',
            tipo,
            plano,
            st: m.published_at ? 'publicado' : 'rascunho',
            ac: m.access_count || 0,
            up: m.published_at
              ? new Date(m.published_at).toLocaleDateString('pt-BR')
              : m.created_at
              ? new Date(m.created_at).toLocaleDateString('pt-BR')
              : '–',
            desc: m.description || '',
            populacao: Array.isArray(m.age_groups) ? m.age_groups : ['adulto'],
            funcao: m.clinical_utility || 'Geral',
            selo: m.is_featured ? 'novo' : '',
            sumario: Array.isArray(m.key_instructions)
              ? m.key_instructions.join('\n')
              : m.content_preview || '',
            arquivoNome: m.download_url ? m.download_url.split('/').pop() : undefined,
            downloadUrl: m.download_url || '',
            downloadSize: m.download_size || '1.5 MB',
            createdAt: m.created_at || m.published_at
          };
        });
        setMaterials(mappedMats);
      } else {
        setMaterials([]);
      }

      // 2. Contagem de assinantes reais (excluindo conta admin)
      const { data: profData } = await supabase
        .from('profiles')
        .select('id, email, role, user_type');

      if (profData) {
        const payingProfiles = profData.filter((p: any) => {
          const isAdminRole = p.role === 'admin' || p.user_type === 'admin';
          const isCurrentUser = Boolean(
            (currentUser?.id && p.id === currentUser.id) ||
            (currentUser?.email && p.email && p.email.toLowerCase() === currentUser.email.toLowerCase())
          );
          return !isAdminRole && !isCurrentUser;
        });
        setSubscriberCount(payingProfiles.length);
      }
    } catch (err) {
      console.error('Erro ao buscar materiais do Supabase:', err);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    fetchMaterialsData();
  }, [currentUser?.id, currentUser?.email]);

  // Estatísticas calculadas dinamicamente
  const matStats = useMemo(() => {
    const pub = materials.filter((m) => m.st === 'publicado');
    const rascunhos = materials.length - pub.length;
    const totalAcessos = pub.reduce((acc, m) => acc + m.ac, 0);

    const now = new Date();
    const currMonth = now.getMonth();
    const currYear = now.getFullYear();

    const novos = materials.filter((m) => {
      if (!m.createdAt) return false;
      const d = new Date(m.createdAt);
      return d.getMonth() === currMonth && d.getFullYear() === currYear;
    }).length;

    const countByTipo: Record<string, number> = {};
    pub.forEach((m) => {
      countByTipo[m.tipo] = (countByTipo[m.tipo] || 0) + 1;
    });

    return {
      publicados: pub.length,
      rascunhos,
      totalAcessos,
      novos,
      countByTipo
    };
  }, [materials]);

  // Lista de materiais filtrada e ordenada
  const filteredMaterials = useMemo(() => {
    const q = qMat.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const res = materials.filter((m) => {
      const matchQ =
        !q ||
        m.t.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').includes(q);
      const matchTipo = !fTipo || m.tipo === fTipo;
      const matchStatus = !fStatus || m.st === fStatus;
      return matchQ && matchTipo && matchStatus;
    });

    const parseDt = (dStr: string) => {
      const parts = dStr.split('/');
      return parts.length === 3 ? `${parts[2]}${parts[1]}${parts[0]}` : '0';
    };

    res.sort((a, b) => {
      if (fOrd === 'ac') return b.ac - a.ac;
      if (fOrd === 'az') return a.t.localeCompare(b.t, 'pt-BR');
      return parseDt(b.up).localeCompare(parseDt(a.up));
    });

    return res;
  }, [materials, qMat, fTipo, fStatus, fOrd]);

  // Funções de gerenciamento do Drawer (Novo / Editar)
  const openNewForm = () => {
    setEditingIndex(null);
    setFormTitulo('');
    setFormTipo('guia');
    setFormPlano('Consulta');
    setFormDesc('');
    setFormPopulacao(['adulto']);
    setFormFuncao('Geral');
    setFormSelo('novo');
    setFormArquivoNome('Escolher arquivo');
    setFormDownloadUrl('');
    setFormFileSize('1.5 MB');
    setIsUploadingR2(false);
    setFormSumario('');
    setFormLegal(false);
    setTituloError(false);
    setLegalError(false);
    setIsDrawerOpen(true);
  };

  const openEditForm = (index: number) => {
    const item = filteredMaterials[index] || materials[index];
    if (!item) return;
    const realIndex = materials.findIndex((m) => m.id === item.id);
    setEditingIndex(realIndex !== -1 ? realIndex : index);
    setFormTitulo(item.t);
    setFormTipo(item.tipo);
    setFormPlano(item.plano);
    setFormDesc(item.desc || '');
    setFormPopulacao(item.populacao || ['adulto']);
    setFormFuncao(item.funcao || 'Geral');
    const fileNameFromUrl = item.downloadUrl ? item.downloadUrl.split('/').pop() || '' : '';
    setFormArquivoNome(item.arquivoNome || fileNameFromUrl || 'Substituir arquivo');
    setFormDownloadUrl(item.downloadUrl || '');
    setFormFileSize(item.downloadSize || '1.5 MB');
    setIsUploadingR2(false);
    setFormSumario(item.sumario || '');
    setFormLegal(true);
    setTituloError(false);
    setLegalError(false);
    setIsDrawerOpen(true);
  };

  const closeForm = () => {
    setIsDrawerOpen(false);
  };

  // Formatação amigável de tamanho de arquivo
  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  };

  // Upload automático para o Cloudflare R2
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFormArquivoNome(file.name);
    setIsUploadingR2(true);
    setUploadR2Error('');
    showToast('Enviando arquivo para o Cloudflare R2...');

    try {
      // 1. Obter URL pré-assinada do servidor para upload direto ao R2 (sem limite de 4.5MB da Vercel)
      const preRes = await fetch('/api/admin/upload-r2/presigned', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: file.name,
          contentType: file.type || 'application/octet-stream',
        }),
      });

      if (preRes.ok) {
        const preJson = await preRes.json();
        if (preJson.success && preJson.uploadUrl) {
          const uploadRes = await fetch(preJson.uploadUrl, {
            method: 'PUT',
            body: file,
          });

          if (uploadRes.ok) {
            setFormDownloadUrl(preJson.publicUrl);
            setFormArquivoNome(file.name);
            setFormFileSize(formatBytes(file.size));
            setUploadR2Error('');
            showToast('Arquivo enviado para o Cloudflare R2 com sucesso!');
            setIsUploadingR2(false);
            return;
          } else {
            const errTxt = await uploadRes.text().catch(() => '');
            throw new Error(`Falha no upload direto para o R2 (status ${uploadRes.status}): ${errTxt || uploadRes.statusText}`);
          }
        }
      } else {
        // Se a rota presigned falhou, ler a mensagem do servidor
        const text = await preRes.text();
        let errMsg = `Erro ${preRes.status} no servidor de autenticação do R2`;
        try {
          const parsed = JSON.parse(text);
          if (parsed.error) errMsg = parsed.error;
        } catch {
          if (text) errMsg = text.slice(0, 140);
        }
        throw new Error(errMsg);
      }
    } catch (err: any) {
      console.error('Erro no upload R2:', err);
      const errMsg = err?.message || 'Falha ao conectar com Cloudflare R2.';
      setUploadR2Error(errMsg);
      showToast('Falha no upload para R2: ' + errMsg);
    } finally {
      setIsUploadingR2(false);
    }
  };

  const handleTipoChange = (newTipo: string) => {
    setFormTipo(newTipo);
    if (newTipo === 'aula') setFormPlano('Estudo');
    if (newTipo === 'interativo') setFormPlano('Prática');
  };

  // Salvar no Supabase
  const handleSaveMaterial = async (status: 'publicado' | 'rascunho') => {
    const trimmed = formTitulo.trim();
    if (!trimmed) {
      setTituloError(true);
      return;
    }
    if (status === 'publicado' && !formLegal) {
      setLegalError(true);
      return;
    }

    if (isUploadingR2) {
      showToast('Aguarde o envio do arquivo para o Cloudflare R2 terminar antes de salvar.');
      return;
    }

    // Se o usuário selecionou um arquivo mas o upload falhou e não tem URL gerada
    if (formArquivoNome !== 'Escolher arquivo' && !formDownloadUrl) {
      showToast('O arquivo ainda não foi enviado para o Cloudflare R2 com sucesso. Selecione o arquivo novamente.');
      return;
    }

    setIsSavingMat(true);

    try {
      const dbType =
        formTipo === 'guia'
          ? 'guia_rapido'
          : formTipo === 'laudo'
          ? 'modelo_laudo'
          : formTipo === 'anamnese'
          ? 'entrevista_anamnese'
          : formTipo === 'compendio'
          ? 'compendio_estudo'
          : formTipo === 'instrumento'
          ? 'instrumento_rastreio'
          : formTipo === 'pdf'
          ? 'guia_rapido'
          : formTipo === 'aula'
          ? 'compendio_estudo'
          : 'instrumento_rastreio';

      const existingId = editingIndex !== null ? materials[editingIndex]?.id : undefined;
      const targetId = existingId || `mat-${Date.now()}`;

      const payload = {
        id: targetId,
        title: trimmed,
        description: formDesc,
        type: dbType,
        age_groups: formPopulacao,
        clinical_utility: formFuncao,
        domains:
          formPlano === 'Prática' ? ['pratica'] : formPlano === 'Estudo' ? ['estudo'] : ['consulta'],
        download_format: formDownloadUrl.toLowerCase().endsWith('.docx') ? 'DOCX' : formDownloadUrl.toLowerCase().endsWith('.mp4') ? 'MP4' : 'PDF',
        download_size: formFileSize || '1.5 MB',
        download_url: formDownloadUrl || '',
        key_instructions: formSumario ? formSumario.split('\n').filter(Boolean) : [],
        is_featured: formSelo === 'novo',
        published_at: status === 'publicado' ? new Date().toISOString() : null
      };

      if (isSupabaseConfigured) {
        const { error } = await supabase.from('materials').upsert([payload]);
        if (error) {
          showToast('Erro ao salvar: ' + error.message);
          setIsSavingMat(false);
          return;
        }
      }

      if (refreshMaterials) {
        await refreshMaterials();
      }
      await fetchMaterialsData();
      closeForm();
      showToast(status === 'publicado' ? 'Material publicado com sucesso.' : 'Rascunho salvo com sucesso.');
    } catch (err: any) {
      showToast('Erro ao salvar: ' + (err?.message || 'Erro inesperado'));
    } finally {
      setIsSavingMat(false);
    }
  };

  // Excluir Material
  const handleDeleteMaterial = async (id?: string) => {
    if (!id) return;
    if (!window.confirm('Tem certeza de que deseja excluir este material permanentemente?')) return;

    try {
      if (isSupabaseConfigured) {
        const { error } = await supabase.from('materials').delete().eq('id', id);
        if (error) {
          showToast('Erro ao excluir: ' + error.message);
          return;
        }
      }
      if (refreshMaterials) {
        await refreshMaterials();
      }
      setMaterials((prev) => prev.filter((m) => m.id !== id));
      closeForm();
      showToast('Material excluído permanentemente.');
    } catch (err: any) {
      showToast('Erro ao excluir: ' + (err?.message || 'Erro inesperado'));
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push('/entrar');
  };

  return (
    <div className="adm-root" data-page="materiais">
      <a className="skip" href="#conteudo">Pular para o conteúdo</a>

      {/* SVG Symbols Icons */}
      <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true">
        <symbol id="i-home" viewBox="0 0 24 24"><path d="M4 11 12 4l8 7v8a1 1 0 0 1-1 1h-4v-6H9v6H5a1 1 0 0 1-1-1z"/></symbol>
        <symbol id="i-lib" viewBox="0 0 24 24"><path d="M3 5.5C5.5 4 8.5 4 12 6c3.5-2 6.5-2 9-.5V19c-2.5-1.5-5.5-1.5-9 .5-3.5-2-6.5-2-9-.5z"/><path d="M12 6v13.5"/></symbol>
        <symbol id="i-aula" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M10 8.5v7l6-3.5z"/></symbol>
        <symbol id="i-play" viewBox="0 0 24 24"><path d="M8 5.5v13l10-6.5z"/></symbol>
        <symbol id="i-cards" viewBox="0 0 24 24"><rect x="7" y="4" width="13" height="16" rx="2"/><path d="M4 7v11a2 2 0 0 0 2 2"/></symbol>
        <symbol id="i-folder" viewBox="0 0 24 24"><path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></symbol>
        <symbol id="i-user" viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 20c1.5-3.5 4.5-5 8-5s6.5 1.5 8 5"/></symbol>
        <symbol id="i-search" viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></symbol>
        <symbol id="i-arrow" viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6"/></symbol>
        <symbol id="i-out" viewBox="0 0 24 24"><path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3M10 16l-4-4 4-4M6 12h10"/></symbol>
        <symbol id="i-info" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/></symbol>
        <symbol id="i-pdf" viewBox="0 0 24 24"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5M9 13h6M9 17h4"/></symbol>
        <symbol id="i-guia" viewBox="0 0 24 24"><path d="M13 2 4 14h7l-1 8 9-12h-7z"/></symbol>
        <symbol id="i-laudo" viewBox="0 0 24 24"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h4"/><path d="M14 3v5h5v3M9 9h2M9 13h4"/><path d="m14 21 1-3 4.5-4.5a1.4 1.4 0 0 1 2 2L17 20z"/></symbol>
        <symbol id="i-anamnese" viewBox="0 0 24 24"><path d="M4 5h11a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1H9l-4 3v-3H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1z"/><path d="M19 9h1a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1h-1v3l-4-3h-3"/></symbol>
        <symbol id="i-compendio" viewBox="0 0 24 24"><path d="M3 5.5C5.5 4 8.5 4 12 6c3.5-2 6.5-2 9-.5V19c-2.5-1.5-5.5-1.5-9 .5-3.5-2-6.5-2-9-.5z"/><path d="M12 6v13.5"/></symbol>
        <symbol id="i-instrumento" viewBox="0 0 24 24"><rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 4V3h6v1M9 10h6M9 14h6M9 18h3"/></symbol>
        <symbol id="i-check" viewBox="0 0 24 24"><path d="m5 12 4.5 4.5L19 7"/></symbol>
      </svg>

      <div className="app">
        {/* ── BARRA LATERAL ADMINISTRATIVA ── */}
        <aside className="side adm" aria-label="Administração">
          <Link className="brand" href="/admin">
            <img src="/brand/isologo-branco.svg" width="23" height="30" alt="" />
            <span>NeuroAcervo</span>
          </Link>
          <span className="adm-tag">Admin</span>

          <div>
            <div className="nav-label">Gestão</div>
            <nav className="nav" id="adm-nav">
              <Link href="/admin">
                <svg className="ico"><use href="#i-home"/></svg>
                <span>Visão geral</span>
              </Link>
              <Link href="/admin/materiais" aria-current="page">
                <svg className="ico"><use href="#i-lib"/></svg>
                <span>Materiais</span>
                <span className="n" id="n-mat">{materials.length}</span>
              </Link>
              <Link href="/admin/assinantes">
                <svg className="ico"><use href="#i-user"/></svg>
                <span>Assinantes</span>
                <span className="n">{subscriberCount}</span>
              </Link>
              <Link href="/admin#planos">
                <svg className="ico"><use href="#i-cards"/></svg>
                <span>Planos</span>
              </Link>
            </nav>
          </div>

          <Link className="view-site" href="/plataforma">
            <svg className="ico"><use href="#i-arrow"/></svg>
            <span>Ver como assinante</span>
          </Link>

          <div className="user">
            <span className="avatar" aria-hidden="true">A</span>
            <div>
              <b>{currentUser?.name || 'Administrador'}</b>
              <span>acesso total</span>
            </div>
            <button type="button" onClick={handleLogout} aria-label="Sair da conta" title="Sair">
              <svg className="ico"><use href="#i-out"/></svg>
            </button>
          </div>
        </aside>

        {/* ── CONTEÚDO PRINCIPAL ── */}
        <main className="main" id="conteudo">
          {/* ══ MATERIAIS ══ */}
          <section className="view on" id="v-materiais" aria-labelledby="h-mat">
            <div className="head">
              <div>
                <span className="label">Conteúdo</span>
                <h1 id="h-mat"><em>Materiais</em><span className="dot">.</span></h1>
              </div>
              <div className="actions">
                <button className="btn" type="button" onClick={openNewForm}>
                  <span>Novo material</span>
                  <span className="arrow"><svg className="ico sm"><use href="#i-arrow"/></svg></span>
                </button>
              </div>
            </div>

            {/* Mini KPIs de Materiais */}
            <div className="mini" id="mat-stats">
              <div className="kpi dark">
                <div className="k">Publicados</div>
                <div className="v">{matStats.publicados}</div>
                <div className="d">visíveis na biblioteca</div>
              </div>
              <div className="kpi">
                <div className="k">Rascunhos</div>
                <div className="v">{matStats.rascunhos}</div>
                <div className="d">ainda não publicados</div>
              </div>
              <div className="kpi">
                <div className="k">Acessos</div>
                <div className="v">{matStats.totalAcessos.toLocaleString('pt-BR')}</div>
                <div className="d">somando todos os materiais</div>
              </div>
              <div className="kpi">
                <div className="k">Novos ou atualizados</div>
                <div className="v">{matStats.novos}</div>
                <div className="d">no mês atual</div>
              </div>
            </div>

            {/* Painel Acervo por Tipo */}
            <div className="panel" style={{ marginTop: '12px' }}>
              <h3>Acervo por tipo</h3>
              <p className="sub">Materiais publicados em cada categoria</p>

              {matStats.publicados === 0 ? (
                <p style={{ margin: '14px 0 0', fontStyle: 'italic', color: 'var(--ink-mute)', fontSize: '13px' }}>
                  Nenhum material publicado ainda. Clique em "Novo material" acima para começar a preencher o acervo.
                </p>
              ) : (
                <>
                  <div
                    className="typebar"
                    id="typebar"
                    role="img"
                    aria-label="Distribuição dos materiais publicados por tipo"
                  >
                    {Object.keys(TIPOS).map((k) => {
                      const count = matStats.countByTipo[k] || 0;
                      if (count === 0) return null;
                      return (
                        <span
                          key={k}
                          style={{ flex: count, background: CORES[k] }}
                          title={`${TIPOS[k].nome}: ${count}`}
                        />
                      );
                    })}
                  </div>

                  <div className="typelegend" id="typelegend">
                    {Object.keys(TIPOS).map((k) => {
                      const count = matStats.countByTipo[k] || 0;
                      return (
                        <span key={k}>
                          <i style={{ background: CORES[k] }} />
                          {TIPOS[k].nome} <b style={{ color: 'var(--ink)' }}>{count}</b>
                        </span>
                      );
                    })}
                  </div>
                </>
              )}
            </div>

            {/* Toolbar com Filtros */}
            <div className="toolbar">
              <label className="search">
                <svg className="ico"><use href="#i-search"/></svg>
                <input
                  id="q-mat"
                  type="search"
                  value={qMat}
                  onChange={(e) => setQMat(e.target.value)}
                  placeholder="Buscar material"
                  aria-label="Buscar material"
                />
              </label>

              <label className="sel">
                <span className="sr" style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden' }}>Tipo</span>
                <select
                  id="f-tipo"
                  value={fTipo}
                  onChange={(e) => setFTipo(e.target.value)}
                  aria-label="Filtrar por tipo"
                >
                  <option value="">Todos os tipos</option>
                  {Object.keys(TIPOS).map((k) => (
                    <option key={k} value={k}>{TIPOS[k].nome}</option>
                  ))}
                </select>
              </label>

              <label className="sel">
                <span className="sr" style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden' }}>Status</span>
                <select
                  id="f-status"
                  value={fStatus}
                  onChange={(e) => setFStatus(e.target.value)}
                  aria-label="Filtrar por status"
                >
                  <option value="">Todos os status</option>
                  <option value="publicado">Publicado</option>
                  <option value="rascunho">Rascunho</option>
                </select>
              </label>

              <label className="sel">
                <span className="sr" style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden' }}>Ordenar</span>
                <select
                  id="f-ord"
                  value={fOrd}
                  onChange={(e) => setFOrd(e.target.value as any)}
                  aria-label="Ordenar materiais"
                >
                  <option value="rec">Mais recentes</option>
                  <option value="ac">Mais acessados</option>
                  <option value="az">A a Z</option>
                </select>
              </label>

              <span className="count" id="c-mat">
                {filteredMaterials.length} de {materials.length} materiais
              </span>
            </div>

            {/* Tabela de Materiais */}
            <div className="table-wrap">
              <table className="t">
                <thead>
                  <tr>
                    <th scope="col">Material</th>
                    <th scope="col">Plano mínimo</th>
                    <th scope="col">Status</th>
                    <th scope="col" className="num">Acessos</th>
                    <th scope="col">Atualizado</th>
                    <th scope="col">
                      <span className="sr" style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden' }}>Ações</span>
                    </th>
                  </tr>
                </thead>
                <tbody id="tb-mat">
                  {filteredMaterials.length > 0 ? (
                    filteredMaterials.map((m, i) => {
                      const tipoConfig = TIPOS[m.tipo] || { nome: m.tipo, icon: 'i-lib' };
                      const planoRoman = m.plano === 'Consulta' ? 'I.' : m.plano === 'Estudo' ? 'II.' : 'III.';

                      return (
                        <tr key={m.id + i}>
                          <td>
                            <div className="tt">
                              <span className={`mark bg-${m.tipo}`}>
                                <svg className="ico sm"><use href={`#${tipoConfig.icon}`}/></svg>
                              </span>
                              <div>
                                <b>{m.t}</b>
                                <span>{tipoConfig.nome}</span>
                              </div>
                            </div>
                          </td>
                          <td>
                            <span className="planchip">
                              <i>{planoRoman}</i>{m.plano}
                            </span>
                          </td>
                          <td>
                            <span className={`pill ${m.st === 'publicado' ? 'ok' : 'draft'}`}>
                              {m.st === 'publicado' ? 'Publicado' : 'Rascunho'}
                            </span>
                          </td>
                          <td className="num">{m.ac ? m.ac.toLocaleString('pt-BR') : '–'}</td>
                          <td>{m.up}</td>
                          <td>
                            <div className="row-act">
                              <button
                                className="icon-sm"
                                type="button"
                                onClick={() => openEditForm(i)}
                                aria-label={`Editar ${m.t}`}
                                title="Editar material"
                              >
                                <svg className="ico sm" viewBox="0 0 24 24"><path d="M4 20h4L19 9l-4-4L4 16z"/></svg>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: 'var(--ink-mute)' }}>
                        {loadingData ? 'Carregando materiais do acervo...' : 'Nenhum material encontrado com os filtros selecionados.'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </main>
      </div>

      {/* ── TABBAR MOBILE ── */}
      <nav className="tabbar" aria-label="Administração">
        <Link href="/admin">
          <svg className="ico"><use href="#i-home"/></svg>
          <span>Geral</span>
        </Link>
        <Link href="/admin/materiais" aria-current="page">
          <svg className="ico"><use href="#i-lib"/></svg>
          <span>Materiais</span>
        </Link>
        <Link href="/admin/assinantes">
          <svg className="ico"><use href="#i-user"/></svg>
          <span>Assinantes</span>
        </Link>
        <Link href="/admin#planos">
          <svg className="ico"><use href="#i-cards"/></svg>
          <span>Planos</span>
        </Link>
      </nav>

      {/* ── DRAWER (FORMULÁRIO DE NOVO / EDITAR MATERIAL) ── */}
      <div
        className={`scrim ${isDrawerOpen ? 'on' : ''}`}
        id="scrim"
        onClick={closeForm}
        aria-hidden={!isDrawerOpen}
      />
      <aside
        className={`drawer ${isDrawerOpen ? 'on' : ''}`}
        id="drawer"
        role="dialog"
        aria-modal="true"
        aria-labelledby="d-title"
        hidden={!isDrawerOpen}
      >
        <div className="d-top">
          <h2 id="d-title">
            {editingIndex !== null ? 'Editar ' : 'Novo '}<em>material</em>
          </h2>
          <button
            className="d-close"
            type="button"
            id="d-close"
            onClick={closeForm}
            aria-label="Fechar"
          >
            <svg className="ico" viewBox="0 0 24 24"><path d="M6 6l12 12M18 6 6 18"/></svg>
          </button>
        </div>

        <form
          id="form-mat"
          noValidate
          style={{ display: 'contents' }}
          onSubmit={(e) => {
            e.preventDefault();
            handleSaveMaterial('publicado');
          }}
        >
          <div className="d-body">
            <div className="f">
              <label htmlFor="m-titulo">Título</label>
              <input
                type="text"
                id="m-titulo"
                required
                value={formTitulo}
                onChange={(e) => {
                  setFormTitulo(e.target.value);
                  setTituloError(false);
                }}
                style={{ borderColor: tituloError ? '#a8261d' : undefined }}
                placeholder="Ex.: Teste de trilhas: aplicação e interpretação"
              />
              {tituloError && (
                <span style={{ color: '#a8261d', fontSize: '12px' }}>O título é obrigatório.</span>
              )}
            </div>

            <div className="f2">
              <div className="f">
                <label htmlFor="m-tipo">Tipo</label>
                <select
                  id="m-tipo"
                  value={formTipo}
                  onChange={(e) => handleTipoChange(e.target.value)}
                >
                  {Object.keys(TIPOS).map((k) => (
                    <option key={k} value={k}>{TIPOS[k].nome}</option>
                  ))}
                </select>
              </div>

              <div className="f">
                <label htmlFor="m-plano">Plano mínimo</label>
                <select
                  id="m-plano"
                  value={formPlano}
                  onChange={(e) => setFormPlano(e.target.value as any)}
                >
                  <option value="Consulta">Consulta</option>
                  <option value="Estudo">Estudo</option>
                  <option value="Prática">Prática</option>
                </select>
                <span className="hint">Aulas pedem Estudo; interativos, Prática.</span>
              </div>
            </div>

            <div className="f">
              <label htmlFor="m-desc">Descrição curta</label>
              <textarea
                id="m-desc"
                value={formDesc}
                onChange={(e) => setFormDesc(e.target.value)}
                placeholder="Aparece no card da biblioteca (até 2 linhas)."
              />
            </div>

            <fieldset className="f">
              <legend>População</legend>
              <div className="chks">
                {[
                  { id: 'infantil', label: 'Infantil' },
                  { id: 'adolescente', label: 'Adolescente' },
                  { id: 'adulto', label: 'Adulto' },
                  { id: 'idoso', label: 'Idoso' }
                ].map((pop) => (
                  <label key={pop.id}>
                    <input
                      type="checkbox"
                      value={pop.id}
                      checked={formPopulacao.includes(pop.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFormPopulacao([...formPopulacao, pop.id]);
                        } else {
                          setFormPopulacao(formPopulacao.filter((p) => p !== pop.id));
                        }
                      }}
                    />
                    {pop.label}
                  </label>
                ))}
              </div>
            </fieldset>

            <div className="f2">
              <div className="f">
                <label htmlFor="m-func">Função cognitiva</label>
                <select
                  id="m-func"
                  value={formFuncao}
                  onChange={(e) => setFormFuncao(e.target.value)}
                >
                  <option>Geral</option>
                  <option>Atenção</option>
                  <option>Memória</option>
                  <option>Funções executivas</option>
                  <option>Linguagem</option>
                  <option>Habilidades visuoespaciais</option>
                  <option>Inteligência</option>
                  <option>Aspectos socioemocionais</option>
                </select>
              </div>

              <div className="f">
                <label htmlFor="m-selo">Selo</label>
                <select
                  id="m-selo"
                  value={formSelo}
                  onChange={(e) => setFormSelo(e.target.value)}
                >
                  <option value="novo">Novo</option>
                  <option value="atualizado">Atualizado</option>
                  <option value="">Sem selo</option>
                </select>
              </div>
            </div>

            <div className="f">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ font: '600 11px/1.3 var(--sans)', letterSpacing: '.16em', textTransform: 'uppercase' }}>
                  Arquivo (Upload para Cloudflare R2)
                </span>
                {isUploadingR2 && (
                  <span style={{ font: '500 11px/1 var(--sans)', color: 'var(--accent-strong)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    Enviando para o R2...
                  </span>
                )}
              </div>
              <label className="drop" style={{ position: 'relative', opacity: isUploadingR2 ? 0.7 : 1 }}>
                <input
                  type="file"
                  id="m-arq"
                  accept=".pdf,.docx,.mp4"
                  disabled={isUploadingR2}
                  onChange={handleFileChange}
                />
                <svg className="ico" style={{ width: 24, height: 24, color: 'var(--accent-strong)' }}>
                  <use href="#i-folder"/>
                </svg>
                <b id="m-arq-n">
                  {isUploadingR2 ? 'Enviando arquivo para o R2...' : formArquivoNome}
                </b>
                <span>PDF, DOCX ou vídeo MP4 (upload direto e seguro)</span>
              </label>

              {uploadR2Error && (
                <div style={{ marginTop: '8px', padding: '10px 12px', borderRadius: '10px', background: 'rgba(168,38,29,0.08)', border: '1px solid rgba(168,38,29,0.25)', fontSize: '12px', color: '#a8261d', lineHeight: 1.4 }}>
                  <b style={{ display: 'block', marginBottom: '2px' }}>✕ Falha no envio para o Cloudflare R2:</b>
                  <span>{uploadR2Error}</span>
                  <div style={{ marginTop: '4px', fontSize: '11px', color: 'var(--ink-mute)' }}>
                    Verifique se as variáveis do R2 estão configuradas na sua hospedagem (Vercel).
                  </div>
                </div>
              )}

              {formDownloadUrl && (
                <div style={{ marginTop: '8px', padding: '10px 12px', borderRadius: '10px', background: 'rgba(72,139,73,0.08)', border: '1px solid rgba(72,139,73,0.2)', fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
                  <div style={{ minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    <span style={{ fontWeight: 600, color: 'var(--accent-strong)', marginRight: '6px' }}>✓ R2 Vinculado:</span>
                    <span style={{ color: 'var(--ink-mute)', fontFamily: 'var(--mono)' }}>{formDownloadUrl}</span>
                  </div>
                  <a 
                    href={formDownloadUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    style={{ color: 'var(--accent-strong)', textDecoration: 'underline', flexShrink: 0, fontWeight: 600 }}
                  >
                    Testar link ↗
                  </a>
                </div>
              )}

              <div style={{ marginTop: '8px' }}>
                <input
                  type="text"
                  placeholder="Ou cole o link direto (Cloudflare R2, Google Drive, etc.)"
                  value={formDownloadUrl}
                  onChange={(e) => setFormDownloadUrl(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid var(--line-soft)',
                    background: 'var(--paper)',
                    fontSize: '12px',
                    fontFamily: 'var(--mono)',
                    color: 'var(--ink)'
                  }}
                />
              </div>
            </div>

            <div className="f">
              <label htmlFor="m-sum">
                Sumário <span style={{ textTransform: 'none', letterSpacing: 0, fontWeight: 400, color: 'var(--ink-faint)' }}>(um tópico por linha)</span>
              </label>
              <textarea
                id="m-sum"
                value={formSumario}
                onChange={(e) => setFormSumario(e.target.value)}
                placeholder={'Material necessário\nInstruções de aplicação\nInterpretação'}
              />
            </div>

            <label className={`legal ${legalError ? 'err' : ''}`} id="legal">
              <input
                type="checkbox"
                id="m-legal"
                checked={formLegal}
                onChange={(e) => {
                  setFormLegal(e.target.checked);
                  setLegalError(false);
                }}
              />
              <span>
                <b>Confirmo que este material é de autoria própria</b> e não reproduz itens, folhas de registro, tabelas normativas ou trechos de manuais de testes psicológicos.
              </span>
            </label>
            {legalError && (
              <span style={{ color: '#a8261d', fontSize: '12px' }}>
                Você deve confirmar a autoria do material para publicá-lo.
              </span>
            )}
          </div>

          <div className="d-foot">
            {editingIndex !== null && materials[editingIndex] && (
              <button
                className="btn-ghost"
                type="button"
                onClick={() => handleDeleteMaterial(materials[editingIndex]?.id)}
                style={{ color: '#a8261d', borderColor: 'rgba(168,38,29,.2)' }}
              >
                Excluir
              </button>
            )}
            <button
              className="btn-ghost"
              type="button"
              id="save-draft"
              disabled={isSavingMat || isUploadingR2}
              onClick={() => handleSaveMaterial('rascunho')}
            >
              Salvar rascunho
            </button>
            <button className="btn" type="submit" disabled={isSavingMat || isUploadingR2}>
              <span>{isSavingMat ? 'Salvando...' : isUploadingR2 ? 'Enviando arquivo...' : 'Publicar'}</span>
              <span><svg className="ico sm"><use href="#i-arrow"/></svg></span>
            </button>
          </div>
        </form>
      </aside>

      {/* ── TOAST NOTIFICATION ── */}
      <div className={`toast ${toastVisible ? 'on' : ''}`} id="toast" role="status">
        <svg className="ico"><use href="#i-check"/></svg>
        <span id="toast-t">{toastText}</span>
      </div>
    </div>
  );
}
