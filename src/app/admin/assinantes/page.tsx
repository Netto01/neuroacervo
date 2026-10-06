'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useNeuro } from '@/context/NeuroContext';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import '../admin.css';

export interface AssinanteItem {
  id: string;
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

export interface StripeStatsState {
  configured: boolean;
  loading: boolean;
  mrr?: number;
  activeSubscriptions?: number;
  novosNoMes?: number;
  canceladasNoMes?: number;
  taxaCancelamento?: number;
  error?: string;
}

const STA_CONFIG: Record<string, [string, string]> = {
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


export default function AdminAssinantesPage() {
  const router = useRouter();
  const { currentUser, logout } = useNeuro();

  // State
  const [assinantes, setAssinantes] = useState<AssinanteItem[]>([]);
  const [adminAccounts, setAdminAccounts] = useState<AssinanteItem[]>([]);
  const [materialsCount, setMaterialsCount] = useState<number>(0);
  const [loadingData, setLoadingData] = useState<boolean>(true);

  // Stripe Live Metrics State
  const [stripeStats, setStripeStats] = useState<StripeStatsState>({
    configured: false,
    loading: true
  });

  // Filters State - Assinantes
  const [qAss, setQAss] = useState('');
  const [fPlano, setFPlano] = useState('');
  const [fAst, setFAst] = useState('');
  const [fPerfil, setFPerfil] = useState('');

  // Selected Subscriber for Drawer
  const [selectedAssinante, setSelectedAssinante] = useState<AssinanteItem | null>(null);

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

  // Carregar dados de assinantes e materiais reais do banco
  const fetchData = async () => {
    setLoadingData(true);
    try {
      if (!isSupabaseConfigured) {
        setAssinantes([]);
        setLoadingData(false);
        return;
      }

      // 1. Assinantes reais do banco (profiles)
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

      // 2. Contagem de Materiais
      const { count: mCount } = await supabase
        .from('materials')
        .select('*', { count: 'exact', head: true });
      if (mCount !== null && mCount !== undefined) {
        setMaterialsCount(mCount);
      }
    } catch (err) {
      console.error('Erro ao buscar assinantes:', err);
      setAssinantes([]);
    } finally {
      setLoadingData(false);
    }
  };

  // Buscar métricas da Stripe
  const fetchStripeStats = async () => {
    try {
      const res = await fetch('/api/admin/stripe-stats');
      if (res.ok) {
        const json = await res.json();
        setStripeStats({
          configured: json.configured ?? false,
          loading: false,
          mrr: json.mrr,
          activeSubscriptions: json.activeSubscriptions,
          novosNoMes: json.novosNoMes,
          canceladasNoMes: json.canceladasNoMes,
          taxaCancelamento: json.taxaCancelamento,
          error: json.error
        });
      } else {
        setStripeStats({ configured: false, loading: false });
      }
    } catch (e: any) {
      setStripeStats({ configured: false, loading: false, error: e?.message });
    }
  };

  useEffect(() => {
    fetchData();
    fetchStripeStats();
  }, [currentUser?.id, currentUser?.email]);

  // Fechar drawer no ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && selectedAssinante) {
        setSelectedAssinante(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedAssinante]);

  // Estatísticas calculadas de Assinantes
  const assinantesStats = useMemo(() => {
    const total = assinantes.length;
    const ativas = assinantes.filter((a) => a.st === 'ativa').length;
    const pendentes = assinantes.filter((a) => a.st === 'pendente').length;
    const cancelando = assinantes.filter((a) => a.st === 'cancelando').length;
    const canceladas = assinantes.filter((a) => a.st === 'cancelada').length;

    // Perfil
    const psicologos = assinantes.filter((a) => a.perfil === 'Psicólogo(a)').length;
    const estudantes = assinantes.filter((a) => a.perfil === 'Estudante').length;
    const outros = assinantes.filter((a) => a.perfil === 'Outro').length;

    const percPsic = total > 0 ? Math.round((psicologos / total) * 100) : 0;
    const percEst = total > 0 ? Math.round((estudantes / total) * 100) : 0;
    const percOut = total > 0 ? Math.max(0, 100 - percPsic - percEst) : 0;

    // Novos no mês
    const now = new Date();
    const curYear = now.getFullYear();
    const curMonth = now.getMonth();
    const novosMes = assinantes.filter((a) => {
      if (!a.createdAt) return false;
      const d = new Date(a.createdAt);
      return d.getFullYear() === curYear && d.getMonth() === curMonth;
    }).length;

    // Métricas reais (Stripe live se disponível, ou contagem real do banco)
    const finalAtivas = (stripeStats.configured && typeof stripeStats.activeSubscriptions === 'number')
      ? stripeStats.activeSubscriptions
      : ativas;

    const finalNovos = (stripeStats.configured && typeof stripeStats.novosNoMes === 'number')
      ? stripeStats.novosNoMes
      : novosMes;

    const finalCanceladas = (stripeStats.configured && typeof stripeStats.canceladasNoMes === 'number')
      ? stripeStats.canceladasNoMes
      : canceladas;

    const taxa = (stripeStats.configured && typeof stripeStats.taxaCancelamento === 'number')
      ? stripeStats.taxaCancelamento
      : (total > 0 ? Math.round((canceladas / total) * 1000) / 10 : 0);

    return {
      total,
      ativasCount: finalAtivas,
      pendentesCount: pendentes,
      cancelandoCount: cancelando,
      canceladasCount: finalCanceladas,
      novosNoMesCount: finalNovos,
      taxaCancelamento: taxa,
      psicologos,
      estudantes,
      outros,
      percPsic,
      percEst,
      percOut
    };
  }, [assinantes, stripeStats]);

  // Assinantes Filtrados
  const filteredAssinantes = useMemo(() => {
    return assinantes.filter((a) => {
      const matchQ =
        !qAss.trim() ||
        a.n.toLowerCase().includes(qAss.toLowerCase()) ||
        a.e.toLowerCase().includes(qAss.toLowerCase());

      const matchPlano = !fPlano || a.plano === fPlano;
      const matchStatus = !fAst || a.st === fAst;
      const matchPerfil = !fPerfil || a.perfil === fPerfil;

      return matchQ && matchPlano && matchStatus && matchPerfil;
    });
  }, [assinantes, qAss, fPlano, fAst, fPerfil]);

  // Exportar CSV
  const handleExportCSV = () => {
    const listToExport = filteredAssinantes.length > 0 ? filteredAssinantes : assinantes;
    const rows = [
      ['Nome', 'E-mail', 'Perfil', 'Plano', 'Ciclo', 'Status', 'Desde'],
      ...listToExport.map((a) => [
        a.n,
        a.e,
        a.perfil,
        a.plano,
        a.ciclo,
        STA_CONFIG[a.st]?.[1] || a.st,
        a.desde
      ])
    ];

    const csvContent = rows
      .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(';'))
      .join('\n');

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `assinantes_neuroacervo_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Arquivo CSV de assinantes exportado.');
  };

  const handleLogout = async () => {
    await logout();
    router.push('/entrar');
  };

  return (
    <div className="adm-root" data-page="assinantes">
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
              <Link href="/admin/materiais">
                <svg className="ico"><use href="#i-lib"/></svg>
                <span>Materiais</span>
                <span className="n" id="n-mat">{materialsCount}</span>
              </Link>
              <Link href="/admin/assinantes" aria-current="page">
                <svg className="ico"><use href="#i-user"/></svg>
                <span>Assinantes</span>
                <span className="n">{assinantesStats.total}</span>
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
          {/* ══ ASSINANTES ══ */}
          <section className="view on" id="v-assinantes" aria-labelledby="h-ass">
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
                  <div
                    className="profile-bar"
                    role="img"
                    aria-label={`Psicólogos ${assinantesStats.percPsic}%, estudantes ${assinantesStats.percEst}%, outros ${assinantesStats.percOut}%`}
                  >
                    <span style={{ width: `${assinantesStats.percPsic}%`, background: 'var(--accent-strong)' }} />
                    <span style={{ width: `${assinantesStats.percEst}%`, background: '#8fbf7d' }} />
                    <span style={{ width: `${assinantesStats.percOut}%`, background: '#c9c2ad' }} />
                  </div>
                  <div className="profile-leg">
                    <span>
                      <i style={{ background: 'var(--accent-strong)' }} />
                      Psicólogos <b>{assinantesStats.percPsic}%</b> · {assinantesStats.psicologos}
                    </span>
                    <span>
                      <i style={{ background: '#8fbf7d' }} />
                      Estudantes <b>{assinantesStats.percEst}%</b> · {assinantesStats.estudantes}
                    </span>
                    <span>
                      <i style={{ background: '#c9c2ad' }} />
                      Outros <b>{assinantesStats.percOut}%</b> · {assinantesStats.outros}
                    </span>
                  </div>
                </>
              )}
            </div>

            {/* Barra de Ferramentas / Filtros */}
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
                <span className="sr" style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden' }}>Plano</span>
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
                <span className="sr" style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden' }}>Status</span>
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
                <span className="sr" style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden' }}>Perfil</span>
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
                <span
                  className="admin-notice-pill"
                  title="Sua conta está configurada como administrador e excluída das métricas de faturamento e assinaturas"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '4px 10px',
                    borderRadius: '999px',
                    background: 'rgba(47,107,49,0.08)',
                    border: '1px dashed var(--accent-strong)',
                    color: 'var(--accent-strong)',
                    fontSize: '11px',
                    fontFamily: 'var(--mono)'
                  }}
                >
                  <svg className="ico sm"><use href="#i-user"/></svg>
                  <span>Conta admin excluída de assinaturas</span>
                </span>
              )}
            </div>

            {/* Tabela de Assinantes */}
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
        </main>
      </div>

      {/* ── BARRA INFERIOR (CELULAR) ── */}
      <nav className="tabbar" aria-label="Administração">
        <Link href="/admin">
          <svg className="ico"><use href="#i-home"/></svg>
          <span>Geral</span>
        </Link>
        <Link href="/admin/materiais">
          <svg className="ico"><use href="#i-lib"/></svg>
          <span>Materiais</span>
        </Link>
        <Link href="/admin/assinantes" aria-current="page">
          <svg className="ico"><use href="#i-user"/></svg>
          <span>Assinantes</span>
        </Link>
        <Link href="/admin#planos">
          <svg className="ico"><use href="#i-cards"/></svg>
          <span>Planos</span>
        </Link>
      </nav>

      {/* ── SCRIM / BACKDROP DO DRAWER ── */}
      <div
        className={`scrim ${selectedAssinante ? 'on' : ''}`}
        id="scrim"
        onClick={() => setSelectedAssinante(null)}
        role="presentation"
      />

      {/* ── FICHA DO ASSINANTE (DRAWER) ── */}
      <aside
        className={`drawer ${selectedAssinante ? 'on' : ''}`}
        id="drawer-ass"
        role="dialog"
        aria-modal="true"
        aria-labelledby="da-title"
        style={{ display: selectedAssinante ? 'flex' : 'none' }}
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

      {/* ── NOTIFICAÇÃO TOAST ── */}
      <div className={`toast ${toastVisible ? 'on' : ''}`} id="toast" role="status">
        <svg className="ico"><use href="#i-check"/></svg>
        <span id="toast-t">{toastText}</span>
      </div>
    </div>
  );
}
