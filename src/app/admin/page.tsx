'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { useNeuro } from '@/context/NeuroContext';
import './admin.css';

// ── Categorias de Materiais e Configurações ──
const TIPOS: Record<string, { nome: string; ico: string; bg: string; cor: string }> = {
  guia: { nome: 'Guia rápido', ico: 'i-guia', bg: 'bg-guia', cor: 'var(--cat-guia)' },
  laudo: { nome: 'Modelo de laudo', ico: 'i-laudo', bg: 'bg-laudo', cor: 'var(--cat-laudo)' },
  anamnese: { nome: 'Anamnese', ico: 'i-anamnese', bg: 'bg-anamnese', cor: 'var(--cat-anamnese)' },
  compendio: { nome: 'Compêndio', ico: 'i-compendio', bg: 'bg-compendio', cor: 'var(--cat-compendio)' },
  instrumento: { nome: 'Instrumento', ico: 'i-instrumento', bg: 'bg-instrumento', cor: 'var(--cat-instrumento)' },
  pdf: { nome: 'PDF e artigo', ico: 'i-pdf', bg: 'bg-pdf', cor: 'var(--cat-pdf)' },
  aula: { nome: 'Aula', ico: 'i-aula', bg: 'bg-aula', cor: 'var(--cat-aula)' },
  interativo: { nome: 'Recurso interativo', ico: 'i-cards', bg: 'bg-interativo', cor: 'var(--ink)' }
};

interface MaterialAdminItem {
  id?: string;
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
  createdAt?: string;
}

interface AssinanteItem {
  id?: string;
  n: string;
  e: string;
  perfil: string;
  plano: 'Consulta' | 'Estudo' | 'Prática';
  ciclo: 'mensal' | 'anual';
  st: 'ativa' | 'pendente' | 'cancelando' | 'cancelada';
  desde: string;
  createdAt?: string;
  role?: string;
}

interface StripeStatsState {
  configured: boolean;
  loading: boolean;
  error?: string | null;
  mrr?: number;
  ativasCount?: number;
  novosNoMesCount?: number;
  canceladasNoMes?: number;
  consultaCount?: number;
  estudoCount?: number;
  praticaCount?: number;
  praticaAnualCount?: number;
  ticketMedio?: number;
  mrrHistory?: [string, number][];
  syncedAt?: string;
}

const STA_CONFIG: Record<AssinanteItem['st'], [string, string]> = {
  ativa: ['ok', 'Ativa'],
  pendente: ['warn', 'Pagamento pendente'],
  cancelando: ['mute', 'Cancelando'],
  cancelada: ['bad', 'Cancelada']
};

const PRECO_MAP: Record<string, string> = {
  Consulta: 'R$ 19,90/mês',
  Estudo: 'R$ 39,90/mês',
  Prática: 'R$ 49,90/mês'
};

export default function AdminPage() {
  const router = useRouter();
  const { currentUser, refreshMaterials } = useNeuro();

  // Tab State
  const [activeTab, setActiveTab] = useState<'visao' | 'materiais' | 'assinantes' | 'planos'>('visao');

  // Materials & Subscribers State (Dados Reais do Supabase)
  const [materials, setMaterials] = useState<MaterialAdminItem[]>([]);
  const [assinantes, setAssinantes] = useState<AssinanteItem[]>([]);
  const [adminAccounts, setAdminAccounts] = useState<AssinanteItem[]>([]);
  const [loadingData, setLoadingData] = useState<boolean>(true);
  const [isSavingMat, setIsSavingMat] = useState<boolean>(false);

  // Stripe Live Metrics State
  const [stripeStats, setStripeStats] = useState<StripeStatsState>({
    configured: false,
    loading: true
  });
  const [syncingStripe, setSyncingStripe] = useState(false);

  // Filters State - Materiais
  const [qMat, setQMat] = useState('');
  const [fTipo, setFTipo] = useState('');
  const [fStatus, setFStatus] = useState('');
  const [fOrd, setFOrd] = useState<'rec' | 'ac' | 'az'>('rec');

  // Filters State - Assinantes
  const [qAss, setQAss] = useState('');
  const [fPlano, setFPlano] = useState('');
  const [fAst, setFAst] = useState('');
  const [fPerfil, setFPerfil] = useState('');

  // Selected Subscriber for Drawer
  const [selectedAssinante, setSelectedAssinante] = useState<AssinanteItem | null>(null);

  // Matrix State (O que cada plano libera)
  // [Consulta, Estudo, Prática]
  const [libMatrix, setLibMatrix] = useState<Record<string, [boolean, boolean, boolean]>>({
    guia: [true, true, true],
    laudo: [true, true, true],
    anamnese: [true, true, true],
    compendio: [true, true, true],
    instrumento: [true, true, true],
    pdf: [true, true, true],
    aula: [false, true, true],
    interativo: [false, false, true]
  });

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
  const [formSumario, setFormSumario] = useState('');
  const [formLegal, setFormLegal] = useState(false);
  const [tituloError, setTituloError] = useState(false);
  const [legalError, setLegalError] = useState(false);

  // MRR Chart Tooltip State
  const [hoveredBarIndex, setHoveredBarIndex] = useState<number | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);
  const chartBoxRef = useRef<HTMLDivElement>(null);

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

  // Sync hash with tabs
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.replace('#', '');
      if (['visao', 'materiais', 'assinantes', 'planos'].includes(hash)) {
        setActiveTab(hash as any);
      }
    };
    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  const switchTab = (tab: 'visao' | 'materiais' | 'assinantes' | 'planos') => {
    setActiveTab(tab);
    window.location.hash = tab;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Carregar dados reais do Supabase (Perfis e Materiais)
  const fetchAllAdminData = async () => {
    setLoadingData(true);
    try {
      if (!isSupabaseConfigured) {
        setLoadingData(false);
        return;
      }

      // 1. Assinantes (profiles)
      const { data: profData, error: profError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (!profError && profData) {
        const payingSubs: AssinanteItem[] = [];
        const admins: AssinanteItem[] = [];

        profData.forEach((p: any) => {
          const rawPlan = (p.plan || '').toLowerCase();
          const plano: 'Consulta' | 'Estudo' | 'Prática' =
            rawPlan.includes('pratica') || rawPlan.includes('completo') ? 'Prática' :
            rawPlan.includes('estudo') || rawPlan.includes('aula') ? 'Estudo' : 'Consulta';

          const userType = p.user_type === 'psicologo' ? 'Psicólogo(a)' :
            p.user_type === 'estudante' ? 'Estudante' : 'Outro';

          const statusRaw = (p.status || 'ativa').toLowerCase();
          const st: 'ativa' | 'pendente' | 'cancelando' | 'cancelada' =
            statusRaw === 'pendente' ? 'pendente' :
            statusRaw === 'cancelando' ? 'cancelando' :
            statusRaw === 'cancelada' ? 'cancelada' : 'ativa';

          const item: AssinanteItem = {
            id: p.id,
            n: p.full_name || p.email?.split('@')[0] || 'Sem nome',
            e: p.email,
            perfil: userType,
            plano,
            ciclo: p.billing_cycle === 'anual' ? 'anual' : 'mensal',
            st,
            desde: p.created_at ? new Date(p.created_at).toLocaleDateString('pt-BR') : '–',
            createdAt: p.created_at,
            role: p.role
          };

          // Não contabilizar a própria conta nem contas administrativas como assinaturas
          const isAdminRole = p.role === 'admin' || p.user_type === 'admin';
          const isCurrentUser = Boolean(
            (currentUser?.id && p.id === currentUser.id) ||
            (currentUser?.email && p.email && p.email.toLowerCase() === currentUser.email.toLowerCase())
          );
          const isAdminEmail = Boolean(p.email && p.email.toLowerCase().includes('admin@'));

          if (isAdminRole || isCurrentUser || isAdminEmail) {
            admins.push(item);
          } else {
            payingSubs.push(item);
          }
        });

        setAssinantes(payingSubs);
        setAdminAccounts(admins);
      } else {
        setAssinantes([]);
        setAdminAccounts([]);
      }

      // 2. Materiais reais (materials)
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
            up: m.published_at ? new Date(m.published_at).toLocaleDateString('pt-BR') : (m.created_at ? new Date(m.created_at).toLocaleDateString('pt-BR') : '–'),
            desc: m.description || '',
            populacao: Array.isArray(m.age_groups) ? m.age_groups : ['adulto'],
            funcao: m.clinical_utility || 'Geral',
            selo: m.is_featured ? 'novo' : '',
            sumario: Array.isArray(m.key_instructions) ? m.key_instructions.join('\n') : (m.content_preview || ''),
            arquivoNome: m.download_url ? m.download_url.split('/').pop() : undefined,
            createdAt: m.created_at || m.published_at
          };
        });
        setMaterials(mappedMats);
      } else {
        setMaterials([]);
      }
    } catch (err) {
      console.error('Erro ao buscar dados do Supabase:', err);
    } finally {
      setLoadingData(false);
    }
  };

  // Buscar métricas da Stripe em tempo real (MRR e novos assinantes)
  const fetchStripeStats = async () => {
    setSyncingStripe(true);
    try {
      const res = await fetch('/api/admin/stripe-stats');
      const data = await res.json();
      if (data.configured) {
        setStripeStats({
          configured: true,
          loading: false,
          error: data.error || null,
          mrr: data.mrr,
          ativasCount: data.ativasCount,
          novosNoMesCount: data.novosNoMesCount,
          canceladasNoMes: data.canceladasNoMes,
          consultaCount: data.consultaCount,
          estudoCount: data.estudoCount,
          praticaCount: data.praticaCount,
          praticaAnualCount: data.praticaAnualCount,
          ticketMedio: data.ticketMedio,
          mrrHistory: data.mrrHistory,
          syncedAt: data.syncedAt
        });
      } else {
        setStripeStats({
          configured: false,
          loading: false,
          error: data.error
        });
      }
    } catch (err: any) {
      setStripeStats({
        configured: false,
        loading: false,
        error: err?.message || 'Falha ao buscar dados da Stripe'
      });
    } finally {
      setSyncingStripe(false);
    }
  };

  useEffect(() => {
    fetchAllAdminData();
    fetchStripeStats();

    // Carregar matriz de liberações do localStorage se existir
    try {
      const saved = localStorage.getItem('neuroacervo_plan_matrix');
      if (saved) {
        setLibMatrix(JSON.parse(saved));
      }
    } catch {}
  }, [currentUser?.id, currentUser?.email]);

  // Métricas e estatísticas calculadas em tempo real com base nos assinantes reais
  const assinantesStats = useMemo(() => {
    const total = assinantes.length;
    const ativas = assinantes.filter(a => a.st === 'ativa');
    const pendentes = assinantes.filter(a => a.st === 'pendente');
    const cancelando = assinantes.filter(a => a.st === 'cancelando');
    const canceladas = assinantes.filter(a => a.st === 'cancelada');

    const consulta = ativas.filter(a => a.plano === 'Consulta');
    const estudo = ativas.filter(a => a.plano === 'Estudo');
    const pratica = ativas.filter(a => a.plano === 'Prática');
    const praticaAnual = pratica.filter(a => a.ciclo === 'anual');
    const praticaMensal = pratica.filter(a => a.ciclo === 'mensal');

    // MRR real
    const mrr = (consulta.length * 19.90) +
                (estudo.length * 39.90) +
                (praticaMensal.length * 49.90) +
                (praticaAnual.length * (399.00 / 12));

    const ticketMedio = ativas.length > 0 ? (mrr / ativas.length) : 0;

    // Perfis
    const psicologos = assinantes.filter(a => a.perfil === 'Psicólogo(a)').length;
    const estudantes = assinantes.filter(a => a.perfil === 'Estudante').length;
    const outros = total - psicologos - estudantes;

    const percPsic = total > 0 ? Math.round((psicologos / total) * 100) : 0;
    const percEst = total > 0 ? Math.round((estudantes / total) * 100) : 0;
    const percOut = total > 0 ? Math.max(0, 100 - percPsic - percEst) : 0;

    // Novos no mês
    const now = new Date();
    const currMonth = now.getMonth();
    const currYear = now.getFullYear();

    const novosNoMes = assinantes.filter(a => {
      if (!a.createdAt) return false;
      const d = new Date(a.createdAt);
      return d.getMonth() === currMonth && d.getFullYear() === currYear;
    });

    const novosEstudantes = novosNoMes.filter(a => a.perfil === 'Estudante').length;
    const novosProfissionais = novosNoMes.length - novosEstudantes;

    const canceladasNoMes = canceladas.length + cancelando.length;
    const taxaCancelamento = total > 0 ? ((canceladasNoMes / total) * 100).toFixed(1).replace('.', ',') : '0';

    return {
      total,
      ativasCount: ativas.length,
      pendentesCount: pendentes.length,
      cancelandoCount: cancelando.length,
      canceladasCount: canceladas.length,
      consultaCount: consulta.length,
      estudoCount: estudo.length,
      praticaCount: pratica.length,
      praticaAnualCount: praticaAnual.length,
      consultaReceita: consulta.length * 19.90,
      estudoReceita: estudo.length * 39.90,
      praticaReceita: (praticaMensal.length * 49.90) + (praticaAnual.length * (399.00 / 12)),
      mrr,
      ticketMedio,
      psicologos,
      estudantes,
      outros,
      percPsic,
      percEst,
      percOut,
      novosNoMesCount: novosNoMes.length,
      novosEstudantes,
      novosProfissionais,
      canceladasNoMes,
      taxaCancelamento
    };
  }, [assinantes]);

  // Histórico de MRR dos últimos 6 meses calculado com base em dados reais
  const mrrChartData = useMemo<[string, number][]>(() => {
    const mesesNomes = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
    const now = new Date();
    const result: [string, number][] = [];

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const mIdx = d.getMonth();
      const endOfMonth = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59);

      const subsAteOMes = assinantes.filter(a => {
        if (!a.createdAt) return false;
        return new Date(a.createdAt) <= endOfMonth && (a.st === 'ativa' || a.st === 'cancelando');
      });

      const mrrDoMes = subsAteOMes.reduce((acc, sub) => {
        if (sub.plano === 'Consulta') return acc + 19.90;
        if (sub.plano === 'Estudo') return acc + 39.90;
        if (sub.plano === 'Prática') {
          return acc + (sub.ciclo === 'anual' ? (399.00 / 12) : 49.90);
        }
        return acc;
      }, 0);

      result.push([mesesNomes[mIdx], Math.round(mrrDoMes)]);
    }

    return result;
  }, [assinantes]);

  // Dados de MRR e Novos Assinantes puxados da Stripe se configurada
  const isStripeActive = stripeStats.configured && typeof stripeStats.mrr === 'number';
  const activeMrr = isStripeActive ? (stripeStats.mrr ?? 0) : assinantesStats.mrr;
  const activeNovosNoMes = isStripeActive ? (stripeStats.novosNoMesCount ?? 0) : assinantesStats.novosNoMesCount;
  const activeAtivasCount = isStripeActive ? (stripeStats.ativasCount ?? assinantesStats.ativasCount) : assinantesStats.ativasCount;
  const activeChartData = (isStripeActive && stripeStats.mrrHistory && stripeStats.mrrHistory.length > 0)
    ? stripeStats.mrrHistory
    : mrrChartData;

  // Feed de atividade recente real montado a partir de assinantes e materiais
  const recentActivities = useMemo(() => {
    const list: { id: string; tipo: 'sub' | 'mat' | 'warn'; titulo: React.ReactNode; tempo: string; timestamp: number }[] = [];

    assinantes.forEach(a => {
      const timeMs = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      list.push({
        id: `sub-${a.e}-${a.createdAt || ''}`,
        tipo: a.st === 'pendente' ? 'warn' : 'sub',
        titulo: a.st === 'pendente' ? (
          <>Pagamento pendente de <b>{a.n}</b> ({a.plano})</>
        ) : (
          <><b>{a.n}</b> cadastrou-se no plano <b>{a.plano}</b> ({a.ciclo})</>
        ),
        tempo: a.desde,
        timestamp: timeMs
      });
    });

    materials.forEach(m => {
      const timeMs = m.createdAt ? new Date(m.createdAt).getTime() : 0;
      list.push({
        id: `mat-${m.id || m.t}-${m.createdAt || ''}`,
        tipo: 'mat',
        titulo: <>Material {m.st === 'publicado' ? 'publicado' : 'salvo'}: <b>{m.t}</b></>,
        tempo: m.up,
        timestamp: timeMs
      });
    });

    list.sort((a, b) => b.timestamp - a.timestamp);
    return list.slice(0, 6);
  }, [assinantes, materials]);

  // Material Stats & Typebar calculation
  const matStats = useMemo(() => {
    const pub = materials.filter(m => m.st === 'publicado');
    const rascunhos = materials.length - pub.length;
    const totalAcessos = pub.reduce((acc, m) => acc + m.ac, 0);

    const now = new Date();
    const currMonth = now.getMonth();
    const currYear = now.getFullYear();

    const novos = materials.filter(m => {
      if (!m.createdAt) return false;
      const d = new Date(m.createdAt);
      return d.getMonth() === currMonth && d.getFullYear() === currYear;
    }).length;

    const countByTipo: Record<string, number> = {};
    pub.forEach(m => {
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

  // Filtered & Sorted Materials
  const filteredMaterials = useMemo(() => {
    const q = qMat.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const res = materials.filter((m) => {
      const matchQ = !q || m.t.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').includes(q);
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

  // Top Most Accessed Materials
  const topMaterials = useMemo(() => {
    return [...materials].sort((a, b) => b.ac - a.ac).slice(0, 5);
  }, [materials]);

  // Filtered Subscribers
  const filteredAssinantes = useMemo(() => {
    const q = qAss.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    return assinantes.filter((a) => {
      const matchQ = !q || (a.n + ' ' + a.e).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').includes(q);
      const matchPlano = !fPlano || a.plano === fPlano;
      const matchStatus = !fAst || a.st === fAst;
      const matchPerfil = !fPerfil || a.perfil === fPerfil;
      return matchQ && matchPlano && matchStatus && matchPerfil;
    });
  }, [assinantes, qAss, fPlano, fAst, fPerfil]);

  // Drawer Material Management
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
    setFormSumario('');
    setFormLegal(false);
    setTituloError(false);
    setLegalError(false);
    setIsDrawerOpen(true);
  };

  const openEditForm = (index: number) => {
    const item = materials[index];
    if (!item) return;
    setEditingIndex(index);
    setFormTitulo(item.t);
    setFormTipo(item.tipo);
    setFormPlano(item.plano);
    setFormDesc(item.desc || '');
    setFormPopulacao(item.populacao || ['adulto']);
    setFormFuncao(item.funcao || 'Geral');
    setFormSelo(item.selo || 'novo');
    setFormArquivoNome(item.arquivoNome || 'Substituir arquivo');
    setFormSumario(item.sumario || '');
    setFormLegal(true);
    setTituloError(false);
    setLegalError(false);
    setIsDrawerOpen(true);
  };

  const closeForm = () => {
    setIsDrawerOpen(false);
  };

  const handleTipoChange = (newTipo: string) => {
    setFormTipo(newTipo);
    if (newTipo === 'aula') setFormPlano('Estudo');
    if (newTipo === 'interativo') setFormPlano('Prática');
  };

  // Salvar no Supabase (Insert ou Upsert)
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

    setIsSavingMat(true);

    try {
      const dbType =
        formTipo === 'guia' ? 'guia_rapido' :
        formTipo === 'laudo' ? 'modelo_laudo' :
        formTipo === 'anamnese' ? 'entrevista_anamnese' :
        formTipo === 'compendio' ? 'compendio_estudo' :
        formTipo === 'instrumento' ? 'instrumento_rastreio' :
        formTipo === 'pdf' ? 'guia_rapido' :
        formTipo === 'aula' ? 'compendio_estudo' : 'instrumento_rastreio';

      const existingId = editingIndex !== null ? materials[editingIndex]?.id : undefined;
      const targetId = existingId || `mat-${Date.now()}`;

      const payload = {
        id: targetId,
        title: trimmed,
        description: formDesc,
        type: dbType,
        age_groups: formPopulacao,
        clinical_utility: formFuncao,
        domains: formPlano === 'Prática' ? ['pratica'] : formPlano === 'Estudo' ? ['estudo'] : ['consulta'],
        download_format: 'PDF',
        download_size: '1.5 MB',
        download_url: formArquivoNome !== 'Escolher arquivo' ? formArquivoNome : '',
        key_instructions: formSumario ? formSumario.split('\n').filter(Boolean) : [],
        is_featured: formSelo === 'novo',
        published_at: status === 'publicado' ? new Date().toISOString() : null
      };

      if (isSupabaseConfigured) {
        const { error } = await supabase.from('materials').upsert([payload]);
        if (error) {
          showToast('Erro ao salvar no banco: ' + error.message);
          setIsSavingMat(false);
          return;
        }
      }

      if (refreshMaterials) {
        await refreshMaterials();
      }
      await fetchAllAdminData();
      closeForm();
      showToast(status === 'publicado' ? 'Material publicado com sucesso no banco.' : 'Rascunho salvo no banco.');
      switchTab('materiais');
    } catch (err: any) {
      showToast('Erro ao salvar: ' + (err?.message || 'Erro inesperado'));
    } finally {
      setIsSavingMat(false);
    }
  };

  // Excluir Material do Supabase
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
      setMaterials(prev => prev.filter(m => m.id !== id));
      closeForm();
      showToast('Material excluído permanentemente.');
    } catch (err: any) {
      showToast('Erro ao excluir: ' + (err?.message || 'Erro inesperado'));
    }
  };

  // CSV Export com Dados Reais
  const handleExportCSV = () => {
    if (assinantes.length === 0) {
      showToast('Nenhum assinante para exportar no momento.');
      return;
    }
    const header = ['Nome', 'E-mail', 'Perfil', 'Plano', 'Ciclo', 'Status', 'Desde'];
    const rows = assinantes.map(a => [
      a.n,
      a.e,
      a.perfil,
      a.plano,
      a.ciclo,
      STA_CONFIG[a.st]?.[1] || a.st,
      a.desde
    ]);
    const csvContent = [header, ...rows]
      .map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(';'))
      .join('\n');

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'assinantes_neuroacervo.csv';
    link.click();
    URL.revokeObjectURL(url);
    showToast('Exportação de assinantes gerada com sucesso.');
  };

  // Salvar Liberações da Matriz no LocalStorage
  const handleSaveMatrix = () => {
    try {
      localStorage.setItem('neuroacervo_plan_matrix', JSON.stringify(libMatrix));
      showToast('Liberações dos planos salvas com sucesso.');
    } catch {
      showToast('Erro ao persistir configurações de liberação.');
    }
  };

  // Logout handler
  const handleLogout = async () => {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
    router.push('/entrar');
  };

  // Matrix Checkbox Toggle
  const toggleMatrixCell = (tipoKey: string, planIndex: 0 | 1 | 2) => {
    setLibMatrix(prev => {
      const current = prev[tipoKey] || [false, false, false];
      const updated: [boolean, boolean, boolean] = [...current];
      updated[planIndex] = !updated[planIndex];
      return { ...prev, [tipoKey]: updated };
    });
  };

  // MRR Chart SVG Dimensions & Config Dinâmico
  const chartW = 560;
  const chartH = 230;
  const chartL = 52;
  const chartB = 26;
  const chartT = 22;
  const maxMRRDataVal = Math.max(...activeChartData.map(d => d[1]), 0);
  const maxMRR = Math.max(1000, Math.ceil((maxMRRDataVal * 1.3 || 1000) / 500) * 500);
  const barW = 40;
  const stepW = activeChartData.length > 0 ? (chartW - chartL) / activeChartData.length : 1;

  return (
    <div className="adm-root" data-page="visao">
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
              <button
                type="button"
                aria-current={activeTab === 'visao' ? 'page' : undefined}
                onClick={() => switchTab('visao')}
              >
                <svg className="ico"><use href="#i-home"/></svg>
                <span>Visão geral</span>
              </button>
              <Link
                href="/admin/materiais"
              >
                <svg className="ico"><use href="#i-lib"/></svg>
                <span>Materiais</span>
                <span className="n">{materials.length}</span>
              </Link>
              <Link
                href="/admin/assinantes"
              >
                <svg className="ico"><use href="#i-user"/></svg>
                <span>Assinantes</span>
                <span className="n">{assinantes.length}</span>
              </Link>
              <button
                type="button"
                aria-current={activeTab === 'planos' ? 'page' : undefined}
                onClick={() => switchTab('planos')}
              >
                <svg className="ico"><use href="#i-cards"/></svg>
                <span>Planos</span>
              </button>
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

          {/* ══ VISÃO GERAL ══ */}
          <section className={`view ${activeTab === 'visao' ? 'on' : ''}`} id="v-visao" aria-labelledby="h-visao">
            <div className="head">
              <div>
                <span className="label">Painel administrativo</span>
                <h1 id="h-visao">Visão <em>geral</em><span className="dot">.</span></h1>
              </div>
              <div className="actions">
                <button
                  type="button"
                  className="stripe-sync-btn"
                  onClick={fetchStripeStats}
                  disabled={syncingStripe}
                  title="Atualizar métricas diretamente da Stripe"
                >
                  <svg className={`ico sm ${syncingStripe ? 'spin' : ''}`} viewBox="0 0 24 24">
                    <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/>
                  </svg>
                  <span>{syncingStripe ? 'Sincronizando...' : isStripeActive ? 'Stripe Atualizado' : 'Sincronizar Stripe'}</span>
                </button>
                <a className="btn-ghost" href="https://dashboard.stripe.com" target="_blank" rel="noopener noreferrer">
                  <span>Abrir Stripe</span>
                  <span className="arrow"><svg className="ico sm"><use href="#i-arrow"/></svg></span>
                </a>
                <button className="btn" type="button" onClick={openNewForm}>
                  <span>Novo material</span>
                  <span className="arrow"><svg className="ico sm"><use href="#i-arrow"/></svg></span>
                </button>
              </div>
            </div>

            <div className="kpis">
              <div className="kpi dark">
                <div className="k" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span>Receita recorrente (MRR)</span>
                  {isStripeActive ? (
                    <span className="stripe-tag-live" title="Puxado diretamente da Stripe em tempo real">Stripe Live</span>
                  ) : (
                    <span style={{ font: '400 10.5px var(--mono)', color: '#f7f1deb3' }}>Supabase</span>
                  )}
                </div>
                <div className="v">
                  R$ {activeMrr >= 1000
                    ? `${(activeMrr / 1000).toFixed(1).replace('.', ',')} mil`
                    : activeMrr.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <div className="d">
                  {isStripeActive
                    ? `${activeAtivasCount} assinatura${activeAtivasCount !== 1 ? 's' : ''} ativa${activeAtivasCount !== 1 ? 's' : ''} na Stripe`
                    : activeAtivasCount > 0
                      ? `${activeAtivasCount} assinante${activeAtivasCount > 1 ? 's' : ''} ativo${activeAtivasCount > 1 ? 's' : ''}`
                      : 'Base sem assinantes ativos no momento'}
                </div>
              </div>
              <div className="kpi">
                <div className="k">Assinantes ativos</div>
                <div className="v">{activeAtivasCount}</div>
                <div className="d">
                  {activeNovosNoMes > 0 ? (
                    <><span className="up">+{activeNovosNoMes}</span> no mês</>
                  ) : (
                    'Nenhum novo no mês'
                  )}
                </div>
              </div>
              <div className="kpi">
                <div className="k" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span>Novos no mês</span>
                  {isStripeActive ? (
                    <span className="stripe-tag-live" title="Novas assinaturas no Stripe neste mês">Stripe Live</span>
                  ) : (
                    <span style={{ font: '400 10.5px var(--mono)', color: 'var(--ink-faint)' }}>Supabase</span>
                  )}
                </div>
                <div className="v">{activeNovosNoMes}</div>
                <div className="d">
                  {isStripeActive
                    ? 'Assinaturas iniciadas no mês na Stripe'
                    : `${assinantesStats.novosEstudantes} estudantes · ${assinantesStats.novosProfissionais} profissionais`}
                </div>
              </div>
              <div className="kpi">
                <div className="k">Cancelamento no mês</div>
                <div className="v">
                  {isStripeActive
                    ? (activeAtivasCount > 0 ? (((stripeStats.canceladasNoMes ?? 0) / (activeAtivasCount + (stripeStats.canceladasNoMes ?? 0))) * 100).toFixed(1).replace('.', ',') : '0')
                    : assinantesStats.taxaCancelamento}
                  <small>%</small>
                </div>
                <div className="d"><span className="dn">{isStripeActive ? (stripeStats.canceladasNoMes ?? 0) : assinantesStats.canceladasNoMes}</span> cancelamentos</div>
              </div>
            </div>

            {!stripeStats.configured && !stripeStats.loading && (
              <div className="stripe-banner-hint">
                <div>
                  <strong>Integração com Stripe:</strong> Adicione a sua chave <code>STRIPE_SECRET_KEY=sk_...</code> no arquivo <code>.env.local</code> para puxar o MRR e novos assinantes do mês diretamente da Stripe em tempo real.
                </div>
                <button
                  type="button"
                  className="btn-ghost"
                  style={{ padding: '4px 10px', fontSize: '12px' }}
                  onClick={fetchStripeStats}
                >
                  Verificar agora
                </button>
              </div>
            )}

            <div className="grid2 sec">
              <div className="panel">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <h3>Receita recorrente mensal</h3>
                    <p className="sub">MRR no fim de cada mês, em R$</p>
                  </div>
                  {isStripeActive && (
                    <span className="stripe-tag-live">Stripe Data</span>
                  )}
                </div>

                <div className="chart" id="mrr" ref={chartBoxRef}>
                  {hoveredBarIndex !== null && tooltipPos && activeChartData[hoveredBarIndex] && (
                    <div
                      className="tip on"
                      id="tip"
                      style={{ left: `${tooltipPos.x}px`, top: `${tooltipPos.y}px` }}
                    >
                      <b>{activeChartData[hoveredBarIndex][0]}</b>
                      R$ {activeChartData[hoveredBarIndex][1].toLocaleString('pt-BR')}
                    </div>
                  )}

                  <svg viewBox={`0 0 ${chartW} ${chartH}`} role="img" aria-label="Receita recorrente mensal">
                    <g className="grid axis">
                      {[0, Math.round(maxMRR * 0.33), Math.round(maxMRR * 0.66), maxMRR].map((v) => {
                        const y = chartH - chartB - ((chartH - chartB - chartT) * v) / maxMRR;
                        return (
                          <React.Fragment key={v}>
                            <line x1={chartL} x2={chartW} y1={y} y2={y} />
                            <text x={chartL - 10} y={y + 4} textAnchor="end">
                              {v >= 1000 ? `${(v / 1000).toFixed(0)} mil` : v}
                            </text>
                          </React.Fragment>
                        );
                      })}
                    </g>
                    {activeChartData.map((d, i) => {
                      const h = ((chartH - chartB - chartT) * d[1]) / maxMRR;
                      const x = chartL + i * stepW + (stepW - barW) / 2;
                      const y = chartH - chartB - h;
                      const last = i === activeChartData.length - 1;
                      const isHovered = hoveredBarIndex === i;

                      return (
                        <g key={d[0] + i}>
                          <rect
                            className="hit"
                            x={chartL + i * stepW}
                            y={chartT}
                            width={stepW}
                            height={chartH - chartB - chartT}
                            onMouseEnter={(e) => {
                              const rect = e.currentTarget.getBoundingClientRect();
                              const parentRect = chartBoxRef.current?.getBoundingClientRect();
                              if (parentRect) {
                                setTooltipPos({
                                  x: rect.left - parentRect.left + rect.width / 2,
                                  y: y
                                });
                              }
                              setHoveredBarIndex(i);
                            }}
                            onMouseLeave={() => setHoveredBarIndex(null)}
                          />
                          <path
                            className={`bar ${last ? 'last' : ''} ${isHovered ? 'hover' : ''}`}
                            d={`M${x},${chartH - chartB} v${-(Math.max(4, h) - 4)} q0,-4 4,-4 h${barW - 8} q4,0 4,4 v${Math.max(4, h) - 4} z`}
                          />
                          {last && (
                            <text className="val" x={x + barW / 2} y={Math.min(y - 8, chartH - chartB - 14)} textAnchor="middle">
                              {d[1] >= 1000 ? `${(d[1] / 1000).toFixed(1).replace('.', ',')} mil` : `R$ ${d[1]}`}
                            </text>
                          )}
                          <g className="xl">
                            <text x={x + barW / 2} y={chartH - 6} textAnchor="middle">
                              {d[0]}
                            </text>
                          </g>
                        </g>
                      );
                    })}
                  </svg>
                </div>
              </div>

              <div className="panel">
                <h3>Assinantes por plano</h3>
                <p className="sub">Ativos hoje</p>
                <div className="plan-rows">
                  <div className="prow">
                    <span className="n">Consulta<small>R$ 19,90</small></span>
                    <span className="track">
                      <span
                        className="fill"
                        style={{
                          width: assinantesStats.ativasCount > 0
                            ? `${(assinantesStats.consultaCount / assinantesStats.ativasCount) * 100}%`
                            : '0%'
                        }}
                      />
                    </span>
                    <span className="c">{assinantesStats.consultaCount}</span>
                  </div>
                  <div className="prow">
                    <span className="n">Estudo<small>R$ 39,90</small></span>
                    <span className="track">
                      <span
                        className="fill"
                        style={{
                          width: assinantesStats.ativasCount > 0
                            ? `${(assinantesStats.estudoCount / assinantesStats.ativasCount) * 100}%`
                            : '0%'
                        }}
                      />
                    </span>
                    <span className="c">{assinantesStats.estudoCount}</span>
                  </div>
                  <div className="prow top">
                    <span className="n">Prática<small>R$ 49,90</small></span>
                    <span className="track">
                      <span
                        className="fill"
                        style={{
                          width: assinantesStats.ativasCount > 0
                            ? `${(assinantesStats.praticaCount / assinantesStats.ativasCount) * 100}%`
                            : '0%'
                        }}
                      />
                    </span>
                    <span className="c">{assinantesStats.praticaCount}</span>
                  </div>
                </div>
                <div className="split">
                  <span>Plano anual no Prática: <b>{assinantesStats.praticaAnualCount}</b></span>
                  <span>Ticket médio: <b>R$ {assinantesStats.ticketMedio.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</b></span>
                </div>
              </div>
            </div>

            <div className="grid2 sec">
              <div className="panel">
                <div className="sec-h" style={{ margin: '0 0 4px' }}>
                  <span><b>i.</b>Atividade recente</span>
                  <Link href="/admin/assinantes">Ver assinantes →</Link>
                </div>
                <ul className="feed">
                  {recentActivities.length > 0 ? (
                    recentActivities.map((act) => (
                      <li key={act.id}>
                        <span className={`ic ${act.tipo === 'sub' ? 'ok' : act.tipo === 'warn' ? 'warn' : ''}`}>
                          <svg className="ico sm">
                            <use href={act.tipo === 'sub' ? '#i-user' : act.tipo === 'warn' ? '#i-info' : '#i-lib'} />
                          </svg>
                        </span>
                        <span>{act.titulo}</span>
                        <time>{act.tempo}</time>
                      </li>
                    ))
                  ) : (
                    <li style={{ padding: '24px 0', textAlign: 'center', color: 'var(--ink-mute)' }}>
                      Nenhuma atividade recente registrada.
                    </li>
                  )}
                </ul>
              </div>

              <div className="panel">
                <div className="sec-h" style={{ margin: '0 0 4px' }}>
                  <span><b>ii.</b>Mais acessados no mês</span>
                  <Link href="/admin/materiais">Materiais →</Link>
                </div>
                <ul className="feed" id="top-mat">
                  {topMaterials.length > 0 ? (
                    topMaterials.map((m) => {
                      const cfg = TIPOS[m.tipo] || { nome: m.tipo, ico: 'i-lib', bg: 'bg-pdf', cor: 'var(--cat-pdf)' };
                      return (
                        <li key={m.id || m.t}>
                          <span className={`mark ${cfg.bg}`} style={{ width: '34px', height: '34px', borderRadius: '10px' }}>
                            <svg className="ico sm"><use href={`#${cfg.ico}`}/></svg>
                          </span>
                          <span><b>{m.t}</b></span>
                          <time>{m.ac ? m.ac.toLocaleString('pt-BR') : '0'}</time>
                        </li>
                      );
                    })
                  ) : (
                    <li style={{ padding: '24px 0', textAlign: 'center', color: 'var(--ink-mute)' }}>
                      Nenhum material cadastrado ainda.
                    </li>
                  )}
                </ul>
              </div>
            </div>
          </section>

          {/* ══ MATERIAIS ══ */}
          <section className={`view ${activeTab === 'materiais' ? 'on' : ''}`} id="v-materiais" aria-labelledby="h-mat">
            <div className="head">
              <div>
                <span className="label">Conteúdo</span>
                <h1 id="h-mat"><em>Materiais</em><span className="dot">.</span></h1>
              </div>
              <div className="actions">
                <button className="btn" type="button" onClick={openNewForm}>
                  <span>Novo material</span>
                  <span><svg className="ico sm"><use href="#i-arrow"/></svg></span>
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
                          style={{ flex: count, background: TIPOS[k].cor }}
                          title={`${TIPOS[k].nome}: ${count}`}
                        />
                      );
                    })}
                  </div>

                  <div className="typelegend" id="typelegend">
                    {Object.keys(TIPOS).map((k) => {
                      const count = matStats.countByTipo[k] || 0;
                      if (count === 0) return null;
                      return (
                        <span key={k}>
                          <i style={{ background: TIPOS[k].cor }} />
                          {TIPOS[k].nome} <b style={{ color: 'var(--ink)' }}>{count}</b>
                        </span>
                      );
                    })}
                  </div>
                </>
              )}
            </div>

            <div className="toolbar">
              <label className="search">
                <svg className="ico"><use href="#i-search"/></svg>
                <input
                  id="q-mat"
                  type="search"
                  placeholder="Buscar material"
                  aria-label="Buscar material"
                  value={qMat}
                  onChange={(e) => setQMat(e.target.value)}
                />
              </label>

              <label className="sel">
                <select
                  id="f-tipo"
                  value={fTipo}
                  onChange={(e) => setFTipo(e.target.value)}
                  aria-label="Filtrar por tipo"
                >
                  <option value="">Todos os tipos</option>
                  {Object.entries(TIPOS).map(([key, item]) => (
                    <option key={key} value={key}>{item.nome}</option>
                  ))}
                </select>
              </label>

              <label className="sel">
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

            <div className="table-wrap">
              <table className="t">
                <thead>
                  <tr>
                    <th scope="col">Material</th>
                    <th scope="col">Plano mínimo</th>
                    <th scope="col">Status</th>
                    <th scope="col" className="num">Acessos</th>
                    <th scope="col">Atualizado</th>
                    <th scope="col" style={{ width: 44 }}>
                      <span className="sr" style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden' }}>Ações</span>
                    </th>
                  </tr>
                </thead>
                <tbody id="tb-mat">
                  {filteredMaterials.length > 0 ? (
                    filteredMaterials.map((m) => {
                      const realIndex = materials.indexOf(m);
                      const cfg = TIPOS[m.tipo] || { nome: m.tipo, ico: 'i-lib', bg: 'bg-pdf', cor: 'var(--cat-pdf)' };
                      const planoRoman = m.plano === 'Consulta' ? 'I.' : m.plano === 'Estudo' ? 'II.' : 'III.';

                      return (
                        <tr key={m.t + realIndex}>
                          <td>
                            <div className="tt">
                              <span className={`mark ${cfg.bg}`}>
                                <svg className="ico sm"><use href={`#${cfg.ico}`}/></svg>
                              </span>
                              <div>
                                <b>{m.t}</b>
                                <span>{cfg.nome}</span>
                              </div>
                            </div>
                          </td>
                          <td>
                            <span className="planchip">
                              <i>{planoRoman}</i>{m.plano}
                            </span>
                          </td>
                          <td>
                            {m.st === 'publicado' ? (
                              <span className="pill ok">Publicado</span>
                            ) : (
                              <span className="pill draft">Rascunho</span>
                            )}
                          </td>
                          <td className="num">{m.ac ? m.ac.toLocaleString('pt-BR') : '–'}</td>
                          <td>{m.up}</td>
                          <td>
                            <div className="row-act">
                              <button
                                className="icon-sm"
                                type="button"
                                onClick={() => openEditForm(realIndex)}
                                aria-label={`Editar ${m.t}`}
                                title="Editar material"
                              >
                                <svg className="ico sm" viewBox="0 0 24 24">
                                  <path d="M4 20h4L19 9l-4-4L4 16z"/>
                                </svg>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', padding: '32px', color: 'var(--ink-mute)' }}>
                        Nenhum material encontrado.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {/* ══ ASSINANTES ══ */}
          <section className={`view ${activeTab === 'assinantes' ? 'on' : ''}`} id="v-assinantes" aria-labelledby="h-ass">
            <div className="head">
              <div>
                <span className="label">Pessoas</span>
                <h1 id="h-ass"><em>Assinantes</em><span className="dot">.</span></h1>
              </div>
              <div className="actions">
                <button className="btn-ghost" type="button" id="csv" onClick={handleExportCSV}>
                  <span>Exportar CSV</span>
                  <span><svg className="ico sm"><use href="#i-arrow"/></svg></span>
                </button>
              </div>
            </div>

            {/* Mini KPIs de Assinantes */}
            <div className="mini">
              <div className="kpi dark">
                <div className="k">Assinaturas ativas</div>
                <div className="v">{assinantesStats.ativasCount}</div>
                <div className="d">
                  {assinantesStats.novosNoMesCount > 0 ? (
                    <><span className="up">+{assinantesStats.novosNoMesCount}</span> no mês</>
                  ) : (
                    'Nenhum novo no mês'
                  )}
                </div>
              </div>
              <div className="kpi">
                <div className="k">Pagamento pendente</div>
                <div className="v">{assinantesStats.pendentesCount}</div>
                <div className="d">em nova tentativa</div>
              </div>
              <div className="kpi">
                <div className="k">Cancelando</div>
                <div className="v">{assinantesStats.cancelandoCount}</div>
                <div className="d">acesso até o fim do período</div>
              </div>
              <div className="kpi">
                <div className="k">Canceladas no mês</div>
                <div className="v">{assinantesStats.canceladasCount}</div>
                <div className="d">{assinantesStats.taxaCancelamento}% da base</div>
              </div>
            </div>

            {/* Painel Perfil dos Assinantes */}
            <div className="panel" style={{ marginTop: '12px' }}>
              <h3>Perfil dos assinantes</h3>
              <p className="sub">Informado no cadastro</p>
              {assinantes.length === 0 ? (
                <p style={{ margin: '14px 0 0', fontStyle: 'italic', color: 'var(--ink-mute)', fontSize: '13px' }}>
                  Nenhum assinante cadastrado na base ainda.
                </p>
              ) : (
                <>
                  <div className="profile-bar" role="img" aria-label={`Psicólogos ${assinantesStats.percPsic}%, estudantes ${assinantesStats.percEst}%, outros ${assinantesStats.percOut}%`}>
                    <span style={{ width: `${assinantesStats.percPsic}%`, background: 'var(--accent-strong)' }} />
                    <span style={{ width: `${assinantesStats.percEst}%`, background: '#8fbf7d' }} />
                    <span style={{ width: `${assinantesStats.percOut}%`, background: '#c9c2ad' }} />
                  </div>
                  <div className="profile-leg">
                    <span><i style={{ background: 'var(--accent-strong)' }} />Psicólogos <b>{assinantesStats.percPsic}%</b> · {assinantesStats.psicologos}</span>
                    <span><i style={{ background: '#8fbf7d' }} />Estudantes <b>{assinantesStats.percEst}%</b> · {assinantesStats.estudantes}</span>
                    <span><i style={{ background: '#c9c2ad' }} />Outros <b>{assinantesStats.percOut}%</b> · {assinantesStats.outros}</span>
                  </div>
                </>
              )}
            </div>

            <div className="toolbar">
              <label className="search">
                <svg className="ico"><use href="#i-search"/></svg>
                <input
                  id="q-ass"
                  type="search"
                  placeholder="Buscar por nome ou e-mail"
                  aria-label="Buscar assinante"
                  value={qAss}
                  onChange={(e) => setQAss(e.target.value)}
                />
              </label>

              <label className="sel">
                <select
                  id="f-plano"
                  value={fPlano}
                  onChange={(e) => setFPlano(e.target.value)}
                  aria-label="Filtrar por plano"
                >
                  <option value="">Todos os planos</option>
                  <option value="Consulta">Consulta</option>
                  <option value="Estudo">Estudo</option>
                  <option value="Prática">Prática</option>
                </select>
              </label>

              <label className="sel">
                <select
                  id="f-ast"
                  value={fAst}
                  onChange={(e) => setFAst(e.target.value)}
                  aria-label="Filtrar por status"
                >
                  <option value="">Todos os status</option>
                  <option value="ativa">Ativa</option>
                  <option value="pendente">Pagamento pendente</option>
                  <option value="cancelando">Cancelando</option>
                  <option value="cancelada">Cancelada</option>
                </select>
              </label>

              <label className="sel">
                <select
                  id="f-perfil"
                  value={fPerfil}
                  onChange={(e) => setFPerfil(e.target.value)}
                  aria-label="Filtrar por perfil"
                >
                  <option value="">Todos os perfis</option>
                  <option value="Psicólogo(a)">Psicólogo(a)</option>
                  <option value="Estudante">Estudante</option>
                  <option value="Outro">Outro</option>
                </select>
              </label>

              <span className="count" id="c-ass">
                {filteredAssinantes.length} de {assinantes.length} assinante{assinantes.length !== 1 ? 's' : ''}
              </span>

              {adminAccounts.length > 0 && (
                <span className="admin-notice-pill" title="Sua conta está configurada como administrador e excluída das métricas de faturamento e assinaturas">
                  <svg className="ico sm"><use href="#i-user"/></svg>
                  <span>Conta admin excluída de assinaturas</span>
                </span>
              )}
            </div>

            <div className="table-wrap">
              <table className="t">
                <thead>
                  <tr>
                    <th scope="col">Assinante</th>
                    <th scope="col">Perfil</th>
                    <th scope="col">Plano</th>
                    <th scope="col">Status</th>
                    <th scope="col">Desde</th>
                    <th scope="col" style={{ width: 44 }}>
                      <span className="sr" style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden' }}>Ações</span>
                    </th>
                  </tr>
                </thead>
                <tbody id="tb-ass">
                  {filteredAssinantes.length > 0 ? (
                    filteredAssinantes.map((a, i) => {
                      const planoRoman = a.plano === 'Consulta' ? 'I.' : a.plano === 'Estudo' ? 'II.' : 'III.';
                      const [pillClass, pillLabel] = STA_CONFIG[a.st] || ['mute', a.st];

                      return (
                        <tr
                          key={a.e + i}
                          className="click"
                          onClick={() => setSelectedAssinante(a)}
                          tabIndex={0}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              setSelectedAssinante(a);
                            }
                          }}
                        >
                          <td>
                            <div className="who">
                              <b>{a.n}</b>
                              <span>{a.e}</span>
                            </div>
                          </td>
                          <td>{a.perfil}</td>
                          <td>
                            <span className="planchip">
                              <i>{planoRoman}</i>{a.plano}
                            </span>
                            {' '}
                            <span style={{ font: '400 11px var(--mono)', color: 'var(--ink-faint)' }}>
                              {a.ciclo}
                            </span>
                          </td>
                          <td>
                            <span className={`pill ${pillClass}`}>{pillLabel}</span>
                          </td>
                          <td>{a.desde}</td>
                          <td>
                            <div className="row-act">
                              <a
                                className="icon-sm"
                                href="https://dashboard.stripe.com/customers"
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                aria-label={`Ver ${a.n} na Stripe`}
                                title="Ver cliente na Stripe"
                              >
                                <svg className="ico sm"><use href="#i-arrow"/></svg>
                              </a>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', padding: '32px', color: 'var(--ink-mute)' }}>
                        Nenhum assinante encontrado.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {/* ══ PLANOS ══ */}
          <section className={`view ${activeTab === 'planos' ? 'on' : ''}`} id="v-planos" aria-labelledby="h-pl">
            <div className="head">
              <div>
                <span className="label">Assinaturas</span>
                <h1 id="h-pl"><em>Planos</em><span className="dot">.</span></h1>
              </div>
              <div className="actions">
                <a className="btn-ghost" href="https://dashboard.stripe.com/products" target="_blank" rel="noopener noreferrer">
                  <span>Produtos na Stripe</span>
                  <span className="arrow"><svg className="ico sm"><use href="#i-arrow"/></svg></span>
                </a>
              </div>
            </div>

            <div className="plan-cards">
              <article className="pc">
                <div className="num">
                  I.<span className="pill mute">Mensal</span>
                </div>
                <h3>Consulta</h3>
                <div className="price">
                  R$ 19,90<small>/mês</small>
                </div>
                <dl>
                  <dt>Assinantes ativos</dt>
                  <dd>{assinantesStats.consultaCount}</dd>
                  <dt>Receita mensal</dt>
                  <dd>R$ {assinantesStats.consultaReceita.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</dd>
                  <dt>Libera</dt>
                  <dd>PDFs</dd>
                </dl>
                <span className="stripe-id">prod_VO24kRYDVe6R5T</span>
              </article>

              <article className="pc">
                <div className="num">
                  II.<span className="pill mute">Mensal</span>
                </div>
                <h3>Estudo</h3>
                <div className="price">
                  R$ 39,90<small>/mês</small>
                </div>
                <dl>
                  <dt>Assinantes ativos</dt>
                  <dd>{assinantesStats.estudoCount}</dd>
                  <dt>Receita mensal</dt>
                  <dd>R$ {assinantesStats.estudoReceita.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</dd>
                  <dt>Libera</dt>
                  <dd>PDFs + aulas</dd>
                </dl>
                <span className="stripe-id">prod_VO28kweV8p9TJh</span>
              </article>

              <article className="pc dark">
                <div className="num">
                  III.<span className="pill ok">Recomendado</span>
                </div>
                <h3>Prática</h3>
                <div className="price">
                  R$ 49,90<small>/mês · R$ 399/ano</small>
                </div>
                <dl>
                  <dt>Assinantes ativos</dt>
                  <dd>{assinantesStats.praticaCount}</dd>
                  <dt>Receita mensal</dt>
                  <dd>R$ {assinantesStats.praticaReceita.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</dd>
                  <dt>Libera</dt>
                  <dd>Tudo + interativos</dd>
                </dl>
                <span className="stripe-id">prod_VO29qu4QY6mc8I</span>
              </article>
            </div>

            {/* Matriz de Liberação por Plano e Movimento no Mês */}
            <div className="grid2 sec">
              <div className="panel">
                <h3>O que cada plano libera</h3>
                <p className="sub">
                  Marque os tipos de material que cada plano acessa. Vale para a biblioteca e o painel do assinante.
                </p>

                <div style={{ overflowX: 'auto', marginTop: '14px' }}>
                  <table className="matrix" id="matrix">
                    <thead>
                      <tr>
                        <th scope="col">Tipo de material</th>
                        <th scope="col">Consulta<small>R$ 19,90</small></th>
                        <th scope="col">Estudo<small>R$ 39,90</small></th>
                        <th scope="col" className="col-p">Prática<small>R$ 49,90</small></th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.keys(TIPOS).map((k) => {
                        const row = libMatrix[k] || [false, false, false];
                        const cfg = TIPOS[k];
                        return (
                          <tr key={k}>
                            <th scope="row">
                              <div className="tt">
                                <span className={`mark ${cfg.bg}`}>
                                  <svg className="ico sm"><use href={`#${cfg.ico}`}/></svg>
                                </span>
                                <div>
                                  <b>{cfg.nome}</b>
                                </div>
                              </div>
                            </th>
                            <td>
                              <input
                                type="checkbox"
                                checked={row[0]}
                                onChange={() => toggleMatrixCell(k, 0)}
                                aria-label={`${cfg.nome} no plano Consulta`}
                              />
                            </td>
                            <td>
                              <input
                                type="checkbox"
                                checked={row[1]}
                                onChange={() => toggleMatrixCell(k, 1)}
                                aria-label={`${cfg.nome} no plano Estudo`}
                              />
                            </td>
                            <td className="col-p">
                              <input
                                type="checkbox"
                                checked={row[2]}
                                onChange={() => toggleMatrixCell(k, 2)}
                                aria-label={`${cfg.nome} no plano Prática`}
                              />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '14px' }}>
                  <button
                    className="btn"
                    type="button"
                    id="save-matrix"
                    onClick={handleSaveMatrix}
                  >
                    <span>Salvar liberações</span>
                    <span><svg className="ico sm"><use href="#i-arrow"/></svg></span>
                  </button>
                </div>
              </div>

              <div className="panel">
                <h3>Movimento no mês</h3>
                <p className="sub">Visão consolidada da base ativa</p>
                <div className="moves">
                  <div className="move">
                    <b>{assinantesStats.novosNoMesCount}</b>
                    <span>novos no mês</span>
                  </div>
                  <div className="move">
                    <b>{assinantesStats.ativasCount}</b>
                    <span>assinantes ativos</span>
                  </div>
                  <div className="move">
                    <b>{assinantesStats.canceladasNoMes}</b>
                    <span>cancelados</span>
                  </div>
                </div>

                <p style={{ marginTop: '16px', fontSize: '13px', color: 'var(--ink-mute)', lineHeight: 1.5 }}>
                  Novos cadastros, trocas de plano e cancelamentos são processados pela Stripe e sincronizados em tempo real no banco de dados.
                </p>
              </div>
            </div>

            <div className="note">
              <svg className="ico"><use href="#i-info"/></svg>
              <span>
                <b>Preços e cobranças ficam na Stripe.</b> Para mudar um valor, crie um novo preço no produto da Stripe e atualize o ID aqui; quem já assina continua no preço antigo até você migrar. Os IDs acima correspondem aos produtos configurados na sua conta da Stripe.
              </span>
            </div>
          </section>
        </main>
      </div>

      {/* ── TABBAR MOBILE ── */}
      <nav className="tabbar" aria-label="Administração">
        <button
          type="button"
          aria-current={activeTab === 'visao' ? 'page' : undefined}
          onClick={() => switchTab('visao')}
        >
          <svg className="ico"><use href="#i-home"/></svg>
          <span>Geral</span>
        </button>
        <Link
          href="/admin/materiais"
        >
          <svg className="ico"><use href="#i-lib"/></svg>
          <span>Materiais</span>
        </Link>
        <Link
          href="/admin/assinantes"
        >
          <svg className="ico"><use href="#i-user"/></svg>
          <span>Assinantes</span>
        </Link>
        <button
          type="button"
          aria-current={activeTab === 'planos' ? 'page' : undefined}
          onClick={() => switchTab('planos')}
        >
          <svg className="ico"><use href="#i-cards"/></svg>
          <span>Planos</span>
        </button>
      </nav>

      {/* ── FORMULÁRIO: NOVO / EDITAR MATERIAL (DRAWER) ── */}
      <div
        className={`scrim ${isDrawerOpen || selectedAssinante !== null ? 'on' : ''}`}
        id="scrim"
        onClick={() => {
          closeForm();
          setSelectedAssinante(null);
        }}
      />

      <aside
        className={`drawer ${isDrawerOpen ? 'on' : ''}`}
        id="drawer"
        role="dialog"
        aria-modal="true"
        aria-labelledby="d-title"
        style={{ display: isDrawerOpen ? 'flex' : 'none' }}
      >
        <div className="d-top">
          <h2 id="d-title">
            {editingIndex !== null ? (
              <>Editar <em>material</em></>
            ) : (
              <>Novo <em>material</em></>
            )}
          </h2>
          <button
            className="d-close"
            type="button"
            id="d-close"
            onClick={closeForm}
            aria-label="Fechar gaveta"
          >
            <svg className="ico" viewBox="0 0 24 24">
              <path d="M6 6l12 12M18 6 6 18"/>
            </svg>
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
                placeholder="Ex.: Teste de trilhas: aplicação e interpretação"
                value={formTitulo}
                onChange={(e) => {
                  setFormTitulo(e.target.value);
                  setTituloError(false);
                }}
                style={tituloError ? { borderColor: '#a8261d' } : undefined}
              />
            </div>

            <div className="f2">
              <div className="f">
                <label htmlFor="m-tipo">Tipo</label>
                <select
                  id="m-tipo"
                  value={formTipo}
                  onChange={(e) => handleTipoChange(e.target.value)}
                >
                  {Object.entries(TIPOS).map(([key, item]) => (
                    <option key={key} value={key}>{item.nome}</option>
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
                placeholder="Aparece no card da biblioteca (até 2 linhas)."
                value={formDesc}
                onChange={(e) => setFormDesc(e.target.value)}
              />
            </div>

            <fieldset className="f">
              <legend>População</legend>
              <div className="chks">
                {['infantil', 'adolescente', 'adulto', 'idoso'].map((pop) => (
                  <label key={pop}>
                    <input
                      type="checkbox"
                      value={pop}
                      checked={formPopulacao.includes(pop)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFormPopulacao([...formPopulacao, pop]);
                        } else {
                          setFormPopulacao(formPopulacao.filter(p => p !== pop));
                        }
                      }}
                    />
                    {' '}{pop.charAt(0).toUpperCase() + pop.slice(1)}
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
              <span style={{ font: '600 11px/1.3 var(--sans)', letterSpacing: '.16em', textTransform: 'uppercase' }}>
                Arquivo
              </span>
              <label className="drop" style={{ position: 'relative' }}>
                <input
                  type="file"
                  id="m-arq"
                  accept=".pdf,.docx,.mp4"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) setFormArquivoNome(file.name);
                  }}
                />
                <svg className="ico" style={{ width: '24px', height: '24px', color: 'var(--accent-strong)' }}>
                  <use href="#i-folder"/>
                </svg>
                <b id="m-arq-n">{formArquivoNome}</b>
                <span>PDF, DOCX ou vídeo MP4</span>
              </label>
            </div>

            <div className="f">
              <label htmlFor="m-sum">
                Sumário <span style={{ textTransform: 'none', letterSpacing: 0, fontWeight: 400, color: 'var(--ink-faint)' }}>(um tópico por linha)</span>
              </label>
              <textarea
                id="m-sum"
                placeholder={'Material necessário\nInstruções de aplicação\nInterpretação'}
                value={formSumario}
                onChange={(e) => setFormSumario(e.target.value)}
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
          </div>

          <div className="d-foot" style={{ justifyContent: 'space-between', display: 'flex' }}>
            {editingIndex !== null && materials[editingIndex]?.id ? (
              <button
                className="btn-ghost"
                type="button"
                style={{ color: '#a8261d', borderColor: 'rgba(168,38,29,0.3)', marginRight: 'auto' }}
                onClick={() => handleDeleteMaterial(materials[editingIndex]?.id)}
              >
                Excluir material
              </button>
            ) : <div />}
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                className="btn-ghost"
                type="button"
                id="save-draft"
                disabled={isSavingMat}
                onClick={() => handleSaveMaterial('rascunho')}
              >
                {isSavingMat ? 'Salvando...' : 'Salvar rascunho'}
              </button>
              <button className="btn" type="submit" disabled={isSavingMat}>
                <span>{isSavingMat ? 'Salvando...' : 'Publicar'}</span>
                <span className="arrow"><svg className="ico sm"><use href="#i-arrow"/></svg></span>
              </button>
            </div>
          </div>
        </form>
      </aside>

      {/* ── FICHA DO ASSINANTE (DRAWER) ── */}
      <aside
        className={`drawer ${selectedAssinante !== null ? 'on' : ''}`}
        id="drawer-ass"
        role="dialog"
        aria-modal="true"
        aria-labelledby="da-title"
        style={{ display: selectedAssinante !== null ? 'flex' : 'none' }}
      >
        {selectedAssinante && (() => {
          const preco = selectedAssinante.plano === 'Prática' && selectedAssinante.ciclo === 'anual'
            ? 'R$ 399,00/ano'
            : PRECO_MAP[selectedAssinante.plano] || 'R$ 19,90/mês';
          const valor = preco.split('/')[0];
          const hist = [
            ['05/10/2026', valor, selectedAssinante.st === 'pendente' ? 'Recusado' : 'Pago'],
            ['05/09/2026', valor, 'Pago'],
            ['05/08/2026', valor, 'Pago']
          ];
          const histFiltered = selectedAssinante.ciclo === 'anual' ? hist.slice(0, 1) : hist;
          const prox = selectedAssinante.st === 'cancelada'
            ? '–'
            : selectedAssinante.st === 'cancelando'
            ? 'Não renova (acesso até 28/10/2026)'
            : selectedAssinante.ciclo === 'anual'
            ? '05/10/2027'
            : '05/11/2026';
          const [stClass, stLabel] = STA_CONFIG[selectedAssinante.st] || ['mute', selectedAssinante.st];

          return (
            <>
              <div className="d-top">
                <span style={{ font: '400 11px/1 var(--mono)', letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--ink-faint)' }}>
                  Assinante
                </span>
                <button
                  className="d-close"
                  type="button"
                  id="da-close"
                  aria-label="Fechar"
                  onClick={() => setSelectedAssinante(null)}
                >
                  <svg className="ico" viewBox="0 0 24 24">
                    <path d="M6 6l12 12M18 6 6 18"/>
                  </svg>
                </button>
              </div>

              <div className="d-body" id="da-body">
                <div className="who-head">
                  <span className="av">{selectedAssinante.n.charAt(0)}</span>
                  <div>
                    <h3 id="da-title">{selectedAssinante.n}</h3>
                    <p>{selectedAssinante.e}</p>
                  </div>
                </div>

                <dl className="dl2">
                  <dt>Status</dt>
                  <dd><span className={`pill ${stClass}`}>{stLabel}</span></dd>
                  <dt>Plano</dt>
                  <dd>{selectedAssinante.plano} · {preco}</dd>
                  <dt>Perfil</dt>
                  <dd>{selectedAssinante.perfil}</dd>
                  <dt>Assinante desde</dt>
                  <dd>{selectedAssinante.desde}</dd>
                  <dt>Próxima cobrança</dt>
                  <dd>{prox}</dd>
                </dl>

                <div className="d-sec">
                  <h4>Pagamentos</h4>
                  <table className="mini-t">
                    <thead>
                      <tr>
                        <th>Data</th>
                        <th>Status</th>
                        <th className="num">Valor</th>
                      </tr>
                    </thead>
                    <tbody>
                      {histFiltered.map((h, idx) => (
                        <tr key={idx}>
                          <td>{h[0]}</td>
                          <td>
                            {h[2] === 'Pago' ? (
                              <span className="pill ok">Pago</span>
                            ) : (
                              <span className="pill warn">Recusado</span>
                            )}
                          </td>
                          <td className="num">{h[1]}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="d-sec">
                  <h4>Uso recente</h4>
                  <table className="mini-t">
                    <tbody>
                      <tr>
                        <td>Último acesso</td>
                        <td className="num">hoje, 14:20</td>
                      </tr>
                      <tr>
                        <td>Materiais abertos no mês</td>
                        <td className="num">12</td>
                      </tr>
                      <tr>
                        <td>Aulas concluídas</td>
                        <td className="num">{selectedAssinante.plano === 'Consulta' ? '–' : '4'}</td>
                      </tr>
                      <tr>
                        <td>Itens na pasta</td>
                        <td className="num">6</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <p style={{ margin: 0, font: '400 12px/1.5 var(--body)', color: 'var(--ink-faint)' }}>
                  Pagamentos e uso são exemplos. Na integração, vêm da Stripe e do registro de acessos.
                </p>
              </div>

              <div className="d-foot">
                <a className="btn-ghost" id="da-mail" href={`mailto:${selectedAssinante.e}`}>
                  <span>Enviar e-mail</span>
                  <span><svg className="ico sm"><use href="#i-arrow"/></svg></span>
                </a>
                <a
                  className="btn"
                  href="https://dashboard.stripe.com/customers"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span>Abrir na Stripe</span>
                  <span><svg className="ico sm"><use href="#i-arrow"/></svg></span>
                </a>
              </div>
            </>
          );
        })()}
      </aside>

      {/* ── TOAST NOTIFICATION ── */}
      <div className={`toast ${toastVisible ? 'on' : ''}`} id="toast" role="status">
        <svg className="ico"><use href="#i-check"/></svg>
        <span id="toast-t">{toastText}</span>
      </div>
    </div>
  );
}
