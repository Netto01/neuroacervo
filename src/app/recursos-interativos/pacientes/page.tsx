'use client';

import React, { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { PlatformShell } from '@/components/layout/PlatformShell';
import { HISTORIAS, FAIXAS } from '@/data/historiasClinicas';
import {
  getAllUserInteractiveSessions,
  deletePatientAllSessions,
  deleteInteractiveSession,
  StoredSessionRecord,
  getUserPatients,
  saveUserPatient,
  updateUserPatientCode,
  deleteUserPatient,
  UserPatientRecord,
  EvolucaoSessionData
} from '@/lib/supabase';
import './dossie-clinico.css';

/* =========================================================================
   Tipos Unificados do Dossiê Clínico
   ========================================================================= */

type AbaDossie = 'tudo' | 'sessao' | 'drama' | 'hist';

interface SessaoItem {
  id: string;
  tipo: 'sessao';
  data: string; // ISO YYYY-MM-DD
  n: number;
  mod: 'Presencial' | 'Online';
  dur: number;
  humor: number;
  comp: string[];
  temas: string;
  tec: string[];
  vinc: string[]; // IDs de drama ou hist vinculados
  resp: string;
  comb: string;
  prox: string;
  resourceId?: string;
}

interface DramaItem {
  id: string;
  tipo: 'drama';
  data: string; // ISO YYYY-MM-DD
  sessao?: number;
  pens: string;
  rodadas: number;
  falas: number;
  crenca: [number, number];
  emocao: [string, number, number];
  ok: number;
  total: number;
  funcionou: string[];
  dificil: string[];
  resourceId?: string;
}

interface HistItem {
  id: string;
  tipo: 'hist';
  data: string; // ISO YYYY-MM-DD
  sessao?: number;
  titulo: string;
  faixa: string;
  faixaId?: string;
  histNum?: number;
  temas: string[];
  caso: string;
  etapas: [string, string, string][];
  intensidade?: number | null;
  crenca?: number | null;
  resourceId?: string;
}

type ItemDossie = SessaoItem | DramaItem | HistItem;

interface PacienteDossie {
  id: string;
  codigo: string;
  aberto: string;
  nota: string;
  status?: 'ativo' | 'arquivado';
  itens: ItemDossie[];
}

/* =========================================================================
   Dados de Demonstração (Fallback Educativo)
   ========================================================================= */

const DEMO_ITEMS: ItemDossie[] = [
  {
    id: 'demo_s4',
    tipo: 'sessao',
    data: '2026-10-21',
    n: 4,
    mod: 'Presencial',
    dur: 50,
    humor: 6,
    comp: ['Ansioso(a)', 'Receptivo(a)'],
    temas: 'Ansiedade antes da apresentação de sexta. Revisou o registro da semana: evitou falar em duas reuniões.',
    tec: ['Dramatização dos dois lados'],
    vinc: ['demo_d1'],
    resp: 'Engajou-se na troca de papéis. A crença no pensamento caiu de 85 para 40 ao fim da dramatização.',
    comb: 'Fazer a apresentação de sexta e registrar o que aconteceu.',
    prox: 'Revisar a apresentação e comparar com a previsão feita hoje.'
  },
  {
    id: 'demo_d1',
    tipo: 'drama',
    data: '2026-10-21',
    sessao: 4,
    pens: 'Se eu errar na apresentação, todos vão me achar incompetente e vou ser demitido.',
    rodadas: 3,
    falas: 9,
    crenca: [85, 40],
    emocao: ['Ansiedade', 80, 45],
    ok: 4,
    total: 5,
    funcionou: [
      'Errar um slide é diferente de ser incompetente.',
      'Na reunião passada eu esqueci um dado, corrigi no fim e ninguém falou nada.'
    ],
    dificil: [
      'Todo mundo vai perceber que eu travei.',
      'E se eu ficar vermelho na frente da diretoria?'
    ]
  },
  {
    id: 'demo_s3',
    tipo: 'sessao',
    data: '2026-10-14',
    n: 3,
    mod: 'Presencial',
    dur: 50,
    humor: 5,
    comp: ['Reflexivo(a)', 'Receptivo(a)'],
    temas: 'Pensamento “se eu errar, sou incompetente” e sua origem nas cobranças do pai.',
    tec: ['Exame das evidências', 'Psicoeducação'],
    vinc: [],
    resp: 'Questionou a regra e trouxe exemplos que a contradizem, mas ainda acredita bastante nela.',
    comb: 'Registrar situações em que evitou falar em reuniões.',
    prox: 'Retomar o pensamento “se eu errar, sou incompetente”.'
  },
  {
    id: 'demo_s2',
    tipo: 'sessao',
    data: '2026-10-07',
    n: 2,
    mod: 'Online',
    dur: 50,
    humor: 4,
    comp: ['Ansioso(a)', 'Receptivo(a)'],
    temas: 'Revisão dos registros da semana: evitou falar em três reuniões.',
    tec: ['História clínica', 'Registro de pensamentos'],
    vinc: ['demo_h1'],
    resp: 'Percebeu previsões catastróficas que se repetem antes de cada reunião.',
    comb: 'Registrar os pensamentos automáticos antes das reuniões.',
    prox: ''
  },
  {
    id: 'demo_h1',
    tipo: 'hist',
    data: '2026-10-07',
    sessao: 2,
    titulo: 'A apresentação adiada',
    faixa: 'Adulto',
    temas: ['Ansiedade de desempenho', 'Enfrentamento'],
    caso: 'Rafael precisava apresentar o projeto da equipe. Na véspera, disse ao gestor que estava doente e pediu para adiar. No dia seguinte, sentiu alívio e, logo depois, vergonha.',
    etapas: [
      ['Observar', 'O que Rafael ganhou e perdeu ao adiar?', 'Ganhou alívio na hora, mas perdeu a chance de mostrar o trabalho e ficou com vergonha.'],
      ['Compreender', 'Que pensamento pode ter levado ao adiamento?', 'Que ele ia travar e todo mundo ia perceber.'],
      ['Agir', 'O que ele poderia fazer na próxima vez?', 'Ensaiar com um colega e combinar um sinal se travar.']
    ],
    intensidade: 40,
    crenca: 70
  },
  {
    id: 'demo_s1',
    tipo: 'sessao',
    data: '2026-09-30',
    n: 1,
    mod: 'Presencial',
    dur: 55,
    humor: 3,
    comp: ['Ansioso(a)', 'Sobrecarregado(a)'],
    temas: 'Queixa de ansiedade intensa antes de apresentações e evitação de reuniões no trabalho.',
    tec: ['Psicoeducação'],
    vinc: [],
    resp: 'Identificou o ciclo ansiedade e evitação. Relatou alívio ao nomear o padrão.',
    comb: 'Registrar as situações de evitação durante a semana.',
    prox: ''
  }
];

/* =========================================================================
   Sprite de Ícones
   ========================================================================= */

function IconSprite() {
  return (
    <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true">
      <symbol id="i-back" viewBox="0 0 24 24"><path d="M19 12H5M12 19l-7-7 7-7"/></symbol>
      <symbol id="i-chev" viewBox="0 0 24 24"><path d="m9 18 6-6-6-6"/></symbol>
      <symbol id="i-down" viewBox="0 0 24 24"><path d="m6 9 6 6 6-6"/></symbol>
      <symbol id="i-plus" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></symbol>
      <symbol id="i-print" viewBox="0 0 24 24"><path d="M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2M6 14h12v8H6z"/></symbol>
      <symbol id="i-more" viewBox="0 0 24 24"><circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/></symbol>
      <symbol id="i-search" viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></symbol>
      <symbol id="i-cal" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></symbol>
      <symbol id="i-clock" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></symbol>
      <symbol id="i-pin" viewBox="0 0 24 24"><path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/></symbol>
      <symbol id="i-video" viewBox="0 0 24 24"><rect x="2" y="6" width="14" height="12" rx="2"/><path d="m16 10 6-3v10l-6-3"/></symbol>
      <symbol id="i-lock" viewBox="0 0 24 24"><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></symbol>
      <symbol id="i-edit" viewBox="0 0 24 24"><path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/></symbol>
      <symbol id="i-trash" viewBox="0 0 24 24"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/></symbol>
      <symbol id="i-users" viewBox="0 0 24 24"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8"/></symbol>
      <symbol id="i-alert" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 8v5M12 16h.01"/></symbol>
      <symbol id="i-archive" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="5" rx="1"/><path d="M5 9v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V9M10 13h4"/></symbol>
      <symbol id="i-list" viewBox="0 0 24 24"><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/></symbol>
      <symbol id="i-grid" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></symbol>
      <symbol id="i-book" viewBox="0 0 24 24"><path d="M2 4h6a4 4 0 0 1 4 4v12a3 3 0 0 0-3-3H2zM22 4h-6a4 4 0 0 0-4 4v12a3 3 0 0 1 3-3h7z"/></symbol>
      <symbol id="i-drama" viewBox="0 0 48 48">
        <path d="M10 8h12a5 5 0 0 1 5 5v6a5 5 0 0 1-5 5h-8l-5 4.2v-4.6a5 5 0 0 1-4-4.9V13a5 5 0 0 1 5-5z" fill="currentColor" fillOpacity=".18"/>
        <path d="M10.5 14h11M10.5 18h7"/>
        <path d="M26 19h12a5 5 0 0 1 5 5v5.7a5 5 0 0 1-4 4.9v4.6l-5-4.2h-8a5 5 0 0 1-5-5v-6a5 5 0 0 1 5-5z" fill="#e3f2cc"/>
        <path d="M27.5 26.6l2.6 2.6 5.4-5.4"/>
        <path d="M31.5 7.5a8 8 0 0 1 8.5 7"/>
        <path d="M38 12.8l2 1.9 1.9-2.2"/>
        <path d="M16.5 40.5a8 8 0 0 1-8.5-7"/>
        <path d="M10 35.2l-2-1.9-1.9 2.2"/>
      </symbol>
      <symbol id="i-evo" viewBox="0 0 48 48">
        <path d="M4 40.5h40"/>
        <path d="M9.5 40.5v-3.5"/>
        <path d="M9.5 37.5c-2.4-.1-3.8-1.6-3.9-3.6 2.2.1 3.8 1.5 3.9 3.6z" fill="currentColor" fillOpacity=".25"/>
        <path d="M22 40.5v-10"/>
        <path d="M22 33.5c-3.3-.1-5.5-2.3-5.6-5.2 3.1.1 5.4 2.2 5.6 5.2z" fill="currentColor" fillOpacity=".25"/>
        <path d="M22 31c.1-3.3 2.3-5.5 5.2-5.6-.1 3.1-2.2 5.4-5.2 5.6z" fill="currentColor" fillOpacity=".25"/>
        <path d="M37 40.5V20"/>
        <path d="M37 32.5c-3.8-.1-6.4-2.6-6.5-6 3.6.1 6.3 2.6 6.5 6z" fill="currentColor" fillOpacity=".25"/>
        <path d="M37 28c.1-3.8 2.6-6.4 6-6.5-.1 3.6-2.6 6.3-6 6.5z" fill="currentColor" fillOpacity=".25"/>
        <path d="M37 21.5c-2.7-.6-4.2-2.8-3.8-5.5 2.6.5 4.2 2.7 3.8 5.5z" fill="currentColor" fillOpacity=".25"/>
        <path d="M8 16.5c8-6 18-8 27-5.5" strokeDasharray="2.4 2.6"/>
        <path d="M32.2 8.2l3.2 2.6-2.4 3.4"/>
      </symbol>
    </svg>
  );
}

function Icon({ id, sm, cls, style }: { id: string; sm?: boolean; cls?: string; style?: React.CSSProperties }) {
  const g = id === 'drama' || id === 'evo';
  return (
    <svg
      className={`icon ${sm ? 'icon-sm' : ''} ${g ? 'icon-g' : ''} ${cls || ''}`}
      aria-hidden="true"
      style={style}
      {...(g ? { viewBox: '0 0 48 48' } : {})}
    >
      <use href={`#i-${id}`} />
    </svg>
  );
}

/* =========================================================================
   Funções Utilitárias Puras
   ========================================================================= */

function formatarData(iso: string, opt?: Intl.DateTimeFormatOptions) {
  try {
    const d = new Date(iso.length === 10 ? `${iso}T12:00:00` : iso);
    return d
      .toLocaleDateString(
        'pt-BR',
        opt || { day: '2-digit', month: 'short', year: 'numeric' }
      )
      .replace(/ de /g, ' ')
      .replace('.', '');
  } catch {
    return iso;
  }
}

function formatarDataCurta(iso: string) {
  try {
    const d = new Date(iso.length === 10 ? `${iso}T12:00:00` : iso);
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }).replace('.', '');
  } catch {
    return iso;
  }
}

function formatarDataAberto(iso: string) {
  try {
    const d = new Date(iso.length === 10 ? `${iso}T12:00:00` : iso);
    return d.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' }).replace('.', '');
  } catch {
    return iso;
  }
}

function extrairIniciais(codigo: string) {
  const p = codigo.trim().split(/[\s.\-_/]+/).filter(Boolean);
  if (!p.length) return '?';
  if (p.length === 1) return p[0].slice(0, 2).toUpperCase();
  const ultimo = p[p.length - 1];
  return (p[0][0] + (/^\d+$/.test(ultimo) ? ultimo.slice(-2) : ultimo[0])).toUpperCase();
}

function tituloHistoria(resourceId: string) {
  const [faixaId, numStr] = resourceId.split('_');
  const num = parseInt(numStr, 10);
  const story = (HISTORIAS[faixaId] || []).find((h) => h.num === num);
  return story?.titulo || `História clínica #${numStr || resourceId}`;
}

const TERMOMETRO_LABELS: Record<number, string> = {
  1: 'pouco',
  2: 'um tanto',
  3: 'médio',
  4: 'muito',
  5: 'enorme'
};

const HOJE_REF = new Date('2026-10-21T12:00:00');

function dias(iso: string) {
  try {
    return Math.max(0, Math.round((HOJE_REF.getTime() - new Date(iso.length === 10 ? `${iso}T12:00:00` : iso).getTime()) / 864e5));
  } catch {
    return 0;
  }
}

function rel(iso: string) {
  const d = dias(iso);
  if (d <= 0) return 'hoje';
  if (d === 1) return 'ontem';
  if (d < 7) return `há ${d} dias`;
  if (d < 30) {
    const s = Math.floor(d / 7);
    return `há ${s}${s === 1 ? ' semana' : ' semanas'}`;
  }
  const m = Math.floor(d / 30);
  return `há ${m}${m === 1 ? ' mês' : ' meses'}`;
}

function atencao(p: { status?: string; ultima: string }) {
  return (p.status || 'ativo') === 'ativo' && dias(p.ultima) >= 14;
}

function Sparkline({ humor }: { humor: number[] }) {
  const W = 64, H = 24;
  if (!humor || !humor.length) return null;
  if (humor.length < 2) {
    const val = Math.max(0, Math.min(10, humor[0]));
    return (
      <svg width={W} height={H} aria-hidden="true" style={{ flex: '0 0 auto' }}>
        <circle cx={W - 4} cy={H - 2 - val * 2} r="3" fill="#2b5c35" />
      </svg>
    );
  }
  const X = (i: number) => 3 + ((W - 6) * i) / (humor.length - 1);
  const Y = (v: number) => H - 2 - Math.max(0, Math.min(10, v)) * 2;
  const points = humor.map((v, i) => `${X(i)},${Y(v)}`).join(' ');
  const lastIdx = humor.length - 1;

  return (
    <svg width={W} height={H} aria-hidden="true" style={{ flex: '0 0 auto' }}>
      <polyline
        points={points}
        fill="none"
        stroke="#2b5c35"
        strokeWidth="2"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <circle cx={X(lastIdx)} cy={Y(humor[lastIdx])} r="3" fill="#2b5c35" />
    </svg>
  );
}

/* =========================================================================
   Componente Interno do Dossiê Clínico
   ========================================================================= */

function DossieClinicoInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pacienteParam = searchParams.get('paciente') || '';

  const [pacientes, setPacientes] = useState<PacienteDossie[]>([]);
  const [pacienteAtualCodigo, setPacienteAtualCodigo] = useState<string>(pacienteParam);
  const [carregando, setCarregando] = useState(true);

  // Estados da Lista Geral de Pacientes (Prontuários & Evolução)
  const emModoLista = !pacienteParam;
  const [filtro, setFiltro] = useState<'ativos' | 'atencao' | 'arquivados' | 'todos'>('ativos');
  const [buscaLista, setBuscaLista] = useState('');
  const [ordem, setOrdem] = useState<'recente' | 'atencao' | 'az'>('recente');
  const [vista, setVista] = useState<'lista' | 'cards'>('lista');
  const [menuPacienteId, setMenuPacienteId] = useState<string | null>(null);
  const inputBuscaRef = useRef<HTMLInputElement>(null);

  // Estados do Modal Novo Paciente
  const [modalNovo, setModalNovo] = useState(false);
  const [novoCod, setNovoCod] = useState('');
  const [novoQueixa, setNovoQueixa] = useState('');
  const [novoErr, setNovoErr] = useState('');

  const criarNovoPaciente = async (e: React.FormEvent) => {
    e.preventDefault();
    const c = novoCod.trim();
    if (!c || pacientes.some((p) => p.codigo.toLowerCase() === c.toLowerCase())) {
      setNovoErr('Escolha um código que ainda não exista.');
      return;
    }
    setNovoErr('');
    await saveUserPatient(c, novoQueixa.trim());
    avisar(`Paciente ${c} criado com sucesso!`);
    setModalNovo(false);
    await carregarDados();
    router.push(`/recursos-interativos/pacientes?paciente=${encodeURIComponent(c)}`);
  };

  // Estados de visualização do Dossiê
  const [aba, setAba] = useState<AbaDossie>('tudo');
  const [busca, setBusca] = useState('');
  const [abertos, setAbertos] = useState<Record<string, boolean>>({});

  // Menus e Modais
  const [menuAberto, setMenuAberto] = useState<'nova' | 'mais' | 'picker' | null>(null);
  const [buscaPicker, setBuscaPicker] = useState('');
  const [modal, setModal] = useState<'novo' | 'editar' | 'excluir' | null>(null);

  // Form states
  const [formCodigo, setFormCodigo] = useState('');
  const [formNota, setFormNota] = useState('');
  const [salvandoModal, setSalvandoModal] = useState(false);

  // Toast
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const avisar = useCallback((msg: string) => {
    setToastMsg(msg);
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    toastTimeoutRef.current = setTimeout(() => setToastMsg(null), 2500);
  }, []);

  /* ---------- Carregamento e sincronização com Supabase / LocalStorage ---------- */
  const carregarDados = useCallback(async () => {
    setCarregando(true);
    try {
      const [todasSessoes, pacientesDb] = await Promise.all([
        getAllUserInteractiveSessions(),
        getUserPatients()
      ]);

      // Mapeamento consolidado de pacientes
      const mapa = new Map<string, PacienteDossie>();

      const garantirPaciente = (code: string, abertoIso?: string, notaInicial?: string) => {
        const limpo = code.trim();
        if (!limpo) return null;
        let p = mapa.get(limpo);
        if (!p) {
          p = {
            id: limpo,
            codigo: limpo,
            aberto: abertoIso || new Date().toISOString().slice(0, 10),
            nota: notaInicial || '',
            itens: []
          };
          mapa.set(limpo, p);
        } else {
          if (abertoIso && abertoIso < p.aberto) p.aberto = abertoIso;
          if (notaInicial && !p.nota) p.nota = notaInicial;
        }
        return p;
      };

      // 1. Pacientes cadastrados no banco
      pacientesDb.forEach((pdb) => {
        garantirPaciente(pdb.code, pdb.created_at?.slice(0, 10), pdb.note || '');
      });

      // 2. Paciente padrão se vazio
      if (mapa.size === 0) {
        garantirPaciente('Paciente 01', '2026-09-30', 'Ansiedade de desempenho no trabalho');
      }

      // 3. Processamento das sessões interativas
      todasSessoes.forEach((s) => {
        const cod = (s.patient_code || 'Paciente 01').trim();
        const p = garantirPaciente(cod, s.created_at?.slice(0, 10));
        if (!p) return;

        const d = (s.data || {}) as Record<string, any>;
        const dataStr = (d.dataSessao || s.updated_at || s.created_at || new Date().toISOString()).slice(0, 10);

        if (s.resource_type === 'evolucao') {
          const numSessao = typeof d.numeroSessao === 'number' ? d.numeroSessao : p.itens.filter((x) => x.tipo === 'sessao').length + 1;
          const sessaoItem: SessaoItem = {
            id: s.id || `sessao_${s.resource_id}`,
            tipo: 'sessao',
            data: dataStr,
            n: numSessao,
            mod: d.modalidade?.toLowerCase() === 'online' ? 'Online' : 'Presencial',
            dur: typeof d.duracao === 'number' ? d.duracao : 50,
            humor: typeof d.humor === 'number' ? d.humor : 5,
            comp: Array.isArray(d.comportamento) ? d.comportamento : (d.estadoEmocional ? [d.estadoEmocional] : ['Receptivo(a)']),
            temas: d.temas || d.temasAbordados || 'Atendimento clínico estruturado',
            tec: Array.isArray(d.tecnicas) ? d.tecnicas : (d.intervencoes ? [d.intervencoes] : ['Psicoeducação']),
            vinc: Array.isArray(d.recursosVinculados) ? [...d.recursosVinculados] : [],
            resp: d.resposta || d.evolucaoClinica || 'Sessão produtiva, boa aliança terapêutica.',
            comb: d.combinados || d.tarefasCombinados || 'Manter registros da semana.',
            prox: d.proxima || d.planoProximaSessao || '',
            resourceId: s.resource_id
          };
          p.itens.push(sessaoItem);
        } else if (s.resource_type === 'dramatizacao') {
          const cIni = typeof d.crencaIni === 'number' ? d.crencaIni : 85;
          const cFim = typeof d.crencaFim === 'number' ? d.crencaFim : 40;
          const dramaItem: DramaItem = {
            id: s.id || `drama_${s.resource_id}`,
            tipo: 'drama',
            data: dataStr,
            pens: d.pensamento || 'Dramatização de pensamento automático',
            rodadas: typeof d.rodada === 'number' ? d.rodada : (d.rodadas || 3),
            falas: Array.isArray(d.mensagens) ? d.mensagens.length : 8,
            crenca: [cIni, cFim],
            emocao: [d.emocao || 'Ansiedade', d.emocaoIni ?? 80, d.emocaoFim ?? 45],
            ok: typeof d.respostasOk === 'number' ? d.respostasOk : 4,
            total: typeof d.respostasTotal === 'number' ? d.respostasTotal : 5,
            funcionou: Array.isArray(d.argumentosFuncionou) && d.argumentosFuncionou.length ? d.argumentosFuncionou : [
              'Errar faz parte do aprendizado e não define competência.',
              'Focar nas evidências reais em vez de previsões catastróficas.'
            ],
            dificil: Array.isArray(d.argumentosDificil) && d.argumentosDificil.length ? d.argumentosDificil : [
              'Sensação imediata de vergonha em público.'
            ],
            resourceId: s.resource_id
          };
          p.itens.push(dramaItem);
        } else if (s.resource_type === 'historia' || s.resource_type === 'hist') {
          const [faixaId, numStr] = (s.resource_id || '').split('_');
          const num = parseInt(numStr, 10);
          const story = (HISTORIAS[faixaId] || []).find((h) => h.num === num);
          const faixaInfo = FAIXAS.find((f) => f.id === faixaId);

          const faixaLabel = d.faixa || (faixaInfo ? `${faixaInfo.sublabel} (${faixaInfo.label})` : 'Clínica');
          const temasLista = Array.isArray(d.temas) && d.temas.length
            ? d.temas
            : ([story?.theme, story?.tag].filter(Boolean) as string[]);

          // 1. Etapa Observar
          const p1 = story?.observar?.pergunta || 'O que o paciente/personagem sentiu na hora?';
          const r1 = (d.observarNotas && typeof d.observarNotas === 'string' && d.observarNotas.trim())
            ? d.observarNotas.trim()
            : '(Sem anotações registradas)';

          // 2. Etapa Pensar / Compreender
          const p2 = story?.pensamento?.pergunta || 'Qual era o pensamento ou crença associada?';
          const r2 = (d.pensarNotas && typeof d.pensarNotas === 'string' && d.pensarNotas.trim())
            ? d.pensarNotas.trim()
            : '(Sem anotações registradas)';

          // 3. Etapa Agir / Parar
          const p3 = story?.parar?.pergunta || 'Qual foi a estratégia de resposta combinada?';
          const opcoesAgir = Array.isArray(d.opcoesCustomizadas) && d.opcoesCustomizadas.length
            ? d.opcoesCustomizadas
            : (story?.parar?.opcoes || []);
          const opcaoEscolhida = (typeof d.respostaIdx === 'number' && opcoesAgir[d.respostaIdx])
            ? opcoesAgir[d.respostaIdx]
            : null;
          const agirTexto = (d.agirNotas && typeof d.agirNotas === 'string' && d.agirNotas.trim())
            ? d.agirNotas.trim()
            : '';

          let r3 = '(Sem anotações registradas)';
          if (opcaoEscolhida && agirTexto) {
            r3 = `Opção: "${opcaoEscolhida}" — ${agirTexto}`;
          } else if (opcaoEscolhida) {
            r3 = `Opção: "${opcaoEscolhida}"`;
          } else if (agirTexto) {
            r3 = agirTexto;
          }

          const etapasConstruidas: [string, string, string][] = [
            ['Observar', p1, r1],
            ['Compreender', p2, r2],
            ['Agir', p3, r3]
          ];

          const histItem: HistItem = {
            id: s.id || `hist_${s.resource_id}`,
            tipo: 'hist',
            data: dataStr,
            titulo: d.titulo || story?.titulo || tituloHistoria(s.resource_id),
            faixa: faixaLabel,
            faixaId: faixaId || undefined,
            histNum: isNaN(num) ? undefined : num,
            temas: temasLista.length ? temasLista : ['Reestruturação Cognitiva'],
            caso: d.caso || d.casoTexto || story?.historia || 'História clínica estruturada.',
            etapas: Array.isArray(d.etapas) && d.etapas.length ? d.etapas : etapasConstruidas,
            intensidade: typeof d.intensidade === 'number' ? d.intensidade : null,
            crenca: typeof d.crenca === 'number' ? d.crenca : null,
            resourceId: s.resource_id
          };
          p.itens.push(histItem);
        }
      });

      // 4. Se o Paciente 01 não possuir itens reais ainda, permite injetar os dados ricos do protótipo
      const pac1 = mapa.get('Paciente 01');
      if (pac1 && pac1.itens.length === 0) {
        pac1.itens = [...DEMO_ITEMS];
      }

      // 5. Vinculação inteligente: correlaciona sessões e dramatizações/histórias explícitas ou do mesmo dia
      mapa.forEach((pac) => {
        const sessoesList = pac.itens.filter((x): x is SessaoItem => x.tipo === 'sessao');
        pac.itens.forEach((it) => {
          if (it.tipo === 'drama' || it.tipo === 'hist') {
            const sessaoVinculada = sessoesList.find(
              (s) =>
                s.vinc.includes(it.id) ||
                (it.resourceId && s.vinc.includes(it.resourceId)) ||
                (it.resourceId && s.vinc.includes(`${it.tipo}_${it.resourceId}`)) ||
                s.data === it.data
            );
            if (sessaoVinculada) {
              it.sessao = sessaoVinculada.n;
              if (!sessaoVinculada.vinc.includes(it.id)) {
                sessaoVinculada.vinc.push(it.id);
              }
            }
          }
        });
      });

      const listaFinal = Array.from(mapa.values());
      setPacientes(listaFinal);

      // Define paciente ativo
      const alvo = pacienteParam || listaFinal[0]?.codigo || 'Paciente 01';
      setPacienteAtualCodigo(alvo);
    } catch (err) {
      console.error('Erro ao carregar dados do dossiê:', err);
    } finally {
      setCarregando(false);
    }
  }, [pacienteParam]);

  useEffect(() => {
    carregarDados();
  }, [carregarDados]);

  useEffect(() => {
    if (pacienteParam) {
      setPacienteAtualCodigo(pacienteParam);
    }
  }, [pacienteParam]);

  // Carrega e persiste a preferência de visualização (lista ou cartões)
  useEffect(() => {
    try {
      const v = localStorage.getItem('na-pac-vista');
      if (v === 'lista' || v === 'cards') setVista(v);
    } catch {}
  }, []);

  const mudarVista = (v: 'lista' | 'cards') => {
    setVista(v);
    try {
      localStorage.setItem('na-pac-vista', v);
    } catch {}
  };

  // Atalho de teclado "/" para focar busca e Escape para fechar menus
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMenuPacienteId(null);
      }
      if (emModoLista && e.key === '/' && !['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        e.preventDefault();
        inputBuscaRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [emModoLista]);

  // Fecha menus ao clicar fora
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.menu') && !target.closest('[data-act="menu"]')) {
        setMenuPacienteId(null);
      }
    };
    window.addEventListener('click', handleOutsideClick);
    return () => window.removeEventListener('click', handleOutsideClick);
  }, []);

  // Alterna status de arquivamento
  const alternarArquivamento = (cod: string) => {
    setMenuPacienteId(null);
    try {
      const raw = localStorage.getItem('na_patient_status');
      const statusMap: Record<string, 'ativo' | 'arquivado'> = raw ? JSON.parse(raw) : {};
      const atual = statusMap[cod] || 'ativo';
      const novo = atual === 'ativo' ? 'arquivado' : 'ativo';
      statusMap[cod] = novo;
      localStorage.setItem('na_patient_status', JSON.stringify(statusMap));
      setPacientes((prev) =>
        prev.map((p) => (p.codigo === cod ? { ...p, status: novo } : p))
      );
      avisar(`${cod} ${novo === 'arquivado' ? 'arquivado' : 'reativado'}.`);
    } catch {
      avisar('Não foi possível alterar o status do paciente.');
    }
  };

  // Processa dados completos de cada paciente para a gestão
  const listaPacientesProcessada = useMemo(() => {
    let statusMap: Record<string, 'ativo' | 'arquivado'> = {};
    try {
      const raw = localStorage.getItem('na_patient_status');
      if (raw) statusMap = JSON.parse(raw);
    } catch {}

    return pacientes.map((p) => {
      const sessoes = p.itens
        .filter((x): x is SessaoItem => x.tipo === 'sessao')
        .sort((a, b) => a.n - b.n);
      const dramas = p.itens.filter((x) => x.tipo === 'drama');
      const hists = p.itens.filter((x) => x.tipo === 'hist');
      const humor = sessoes.map((s) => s.humor);
      const ultimaSessao = sessoes[sessoes.length - 1];
      const ultimaData = ultimaSessao ? ultimaSessao.data : p.aberto;
      const status = statusMap[p.codigo] || p.status || 'ativo';

      return {
        id: p.id || p.codigo,
        cod: p.codigo,
        queixa: p.nota,
        desde: p.aberto,
        status,
        humor,
        ultima: ultimaData,
        ses: sessoes.length,
        drama: dramas.length,
        hist: hists.length,
        raw: p
      };
    });
  }, [pacientes]);

  const ativos = useMemo(() => listaPacientesProcessada.filter((p) => p.status === 'ativo'), [listaPacientesProcessada]);
  const emAtencao = useMemo(() => listaPacientesProcessada.filter(atencao), [listaPacientesProcessada]);
  const arquivados = useMemo(() => listaPacientesProcessada.filter((p) => p.status === 'arquivado'), [listaPacientesProcessada]);
  const totalSessoesAtivos = useMemo(() => ativos.reduce((t, p) => t + p.ses, 0), [ativos]);
  const totalIntervencoes = useMemo(() => ativos.reduce((t, p) => t + p.drama + p.hist, 0), [ativos]);

  const listaFinalFiltrada = useMemo(() => {
    const q = buscaLista.trim().toLowerCase();
    return listaPacientesProcessada.filter((p) => {
      if (filtro === 'ativos' && p.status !== 'ativo') return false;
      if (filtro === 'atencao' && !atencao(p)) return false;
      if (filtro === 'arquivados' && p.status !== 'arquivado') return false;
      if (q && !(p.cod + ' ' + (p.queixa || '')).toLowerCase().includes(q)) return false;
      return true;
    }).sort((a, b) => {
      if (ordem === 'az') return a.cod.localeCompare(b.cod, 'pt-BR', { numeric: true });
      if (ordem === 'atencao') return dias(b.ultima) - dias(a.ultima);
      return b.ultima.localeCompare(a.ultima);
    });
  }, [listaPacientesProcessada, filtro, buscaLista, ordem]);

  // Paciente atualmente selecionado
  const pacienteAtual = useMemo(() => {
    return pacientes.find((p) => p.codigo.toLowerCase() === pacienteAtualCodigo.toLowerCase()) || pacientes[0];
  }, [pacientes, pacienteAtualCodigo]);

  // Define abertura inicial: abre o item mais recente por padrão (decisão /grill-me)
  useEffect(() => {
    if (!pacienteAtual || !pacienteAtual.itens.length) return;
    const ordenados = [...pacienteAtual.itens].sort((a, b) => b.data.localeCompare(a.data));
    const maisRecente = ordenados[0];
    if (maisRecente) {
      setAbertos((prev) => ({
        ...prev,
        [maisRecente.id]: true
      }));
    }
  }, [pacienteAtual]);

  // Sessões em ordem cronológica para métricas e gráficos
  const sessoesCronologicas = useMemo(() => {
    if (!pacienteAtual) return [];
    return pacienteAtual.itens
      .filter((x): x is SessaoItem => x.tipo === 'sessao')
      .sort((a, b) => a.n - b.n);
  }, [pacienteAtual]);

  // Contagens por tipo
  const contagens = useMemo(() => {
    const it = pacienteAtual?.itens || [];
    return {
      tudo: it.length,
      sessao: it.filter((x) => x.tipo === 'sessao').length,
      drama: it.filter((x) => x.tipo === 'drama').length,
      hist: it.filter((x) => x.tipo === 'hist').length
    };
  }, [pacienteAtual]);

  // Itens visíveis e filtrados
  const itensVisiveis = useMemo(() => {
    if (!pacienteAtual) return [];
    const qLower = busca.trim().toLowerCase();
    return pacienteAtual.itens
      .filter((x) => {
        if (aba !== 'tudo' && x.tipo !== aba) return false;
        if (!qLower) return true;
        const textoItem = JSON.stringify(x).toLowerCase();
        return textoItem.includes(qLower);
      })
      .sort((a, b) => {
        const cmp = b.data.localeCompare(a.data);
        if (cmp !== 0) return cmp;
        return a.tipo === 'sessao' ? -1 : b.tipo === 'sessao' ? 1 : 0;
      });
  }, [pacienteAtual, aba, busca]);

  const todosAbertos = useMemo(() => {
    return itensVisiveis.length > 0 && itensVisiveis.every((x) => abertos[x.id]);
  }, [itensVisiveis, abertos]);

  // Alterna expansão de todos
  const alternarTodos = () => {
    const novoStatus = !todosAbertos;
    const proximo: Record<string, boolean> = { ...abertos };
    itensVisiveis.forEach((x) => {
      proximo[x.id] = novoStatus;
    });
    setAbertos(proximo);
  };

  // Alterna expansão individual
  const alternarItem = (id: string) => {
    setAbertos((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Navega até um item com highlight e scroll
  const irParaItem = (id: string) => {
    setAba('tudo');
    setBusca('');
    setAbertos((prev) => ({ ...prev, [id]: true }));
    setTimeout(() => {
      const el = document.getElementById(`it-${id}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        el.classList.add('flash');
        setTimeout(() => el.classList.remove('flash'), 1200);
      }
    }, 50);
  };

  // Troca de paciente
  const selecionarPaciente = (codigo: string) => {
    setPacienteAtualCodigo(codigo);
    setMenuAberto(null);
    setAba('tudo');
    setBusca('');
    router.push(`/recursos-interativos/pacientes?paciente=${encodeURIComponent(codigo)}`);
  };

  // Impressão oficial do dossiê clínico (abre a folha A4 dedicada timbrada)
  const imprimirDossieCompleto = () => {
    if (!pacienteAtual) return;
    window.open(
      `/recursos-interativos/pacientes/imprimir?paciente=${encodeURIComponent(pacienteAtual.codigo)}&imprimir=1`,
      '_blank'
    );
  };

  // Impressão de sessão individual timbrada
  const imprimirItemIndividual = (itemId: string) => {
    if (!pacienteAtual) return;
    window.open(
      `/recursos-interativos/pacientes/imprimir?paciente=${encodeURIComponent(pacienteAtual.codigo)}&item=${encodeURIComponent(itemId)}&imprimir=1`,
      '_blank'
    );
  };

  // Carregar dados de demonstração
  const carregarDemonstracao = () => {
    if (!pacienteAtual) return;
    setPacientes((prev) =>
      prev.map((p) => {
        if (p.codigo === pacienteAtual.codigo) {
          return { ...p, itens: [...DEMO_ITEMS] };
        }
        return p;
      })
    );
    avisar('Dados de demonstração carregados no dossiê!');
  };

  // Submissão de modais (Novo / Editar / Excluir)
  const salvarModalPaciente = async () => {
    const cod = formCodigo.trim();
    if (!cod) {
      avisar('Informe um código para o paciente.');
      return;
    }
    setSalvandoModal(true);
    try {
      if (modal === 'novo') {
        await saveUserPatient(cod, formNota.trim());
        avisar(`Paciente ${cod} criado com sucesso!`);
        setModal(null);
        await carregarDados();
        selecionarPaciente(cod);
      } else if (modal === 'editar' && pacienteAtual) {
        await updateUserPatientCode(pacienteAtual.codigo, cod, formNota.trim());
        avisar(`Paciente atualizado com sucesso!`);
        setModal(null);
        await carregarDados();
        selecionarPaciente(cod);
      }
    } catch (err) {
      console.error(err);
      avisar('Erro ao salvar paciente.');
    } finally {
      setSalvandoModal(false);
    }
  };

  const confirmarExcluirPaciente = async () => {
    if (!pacienteAtual) return;
    setSalvandoModal(true);
    try {
      await deletePatientAllSessions(pacienteAtual.codigo);
      await deleteUserPatient(pacienteAtual.codigo);
      avisar(`Caso de ${pacienteAtual.codigo} excluído.`);
      setModal(null);
      await carregarDados();
      router.push('/recursos-interativos/pacientes');
    } catch (err) {
      console.error(err);
      avisar('Erro ao excluir paciente.');
    } finally {
      setSalvandoModal(false);
    }
  };

  // Highlight de texto na busca
  const destacar = (texto: string) => {
    if (!busca.trim()) return texto;
    const regex = new RegExp(`(${busca.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const partes = texto.split(regex);
    return partes.map((parte, idx) =>
      regex.test(parte) ? (
        <mark key={idx} style={{ background: '#d6f5a3', borderRadius: '3px', padding: '0 2px' }}>
          {parte}
        </mark>
      ) : (
        parte
      )
    );
  };

  /* ---------- Renderização do Cabeçalho e da Linha do Tempo ---------- */

  if (carregando) {
    return (
      <div className="dossie-root" style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p className="muted">Carregando dossiê clínico...</p>
      </div>
    );
  }

  /* ---------- Renderização da Lista Geral de Pacientes (Prontuários & Evolução) ---------- */
  if (emModoLista) {
    const L = listaFinalFiltrada;

    return (
      <PlatformShell activePage="recursos">
        <div className="dossie-root">
          <IconSprite />

          <div className="page" id="page">
            <nav className="crumbs" aria-label="Caminho">
              <Link href="/recursos-interativos">
                <Icon id="back" sm /> Recursos interativos
              </Link>
              <Icon id="chev" sm />
              <b>Dossiê clínico</b>
            </nav>

            <header className="head">
              <div>
                <span className="eyebrow">Prontuários e evolução</span>
                <h1>Pacientes</h1>
                <p>Abra o dossiê de cada paciente para ver sessões, dramatizações e histórias clínicas numa linha do tempo.</p>
              </div>
              <div className="head-actions">
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => {
                    setNovoCod(`Paciente 0${pacientes.length + 1}`);
                    setNovoQueixa('');
                    setNovoErr('');
                    setModalNovo(true);
                  }}
                >
                  <Icon id="plus" /> Novo paciente
                </button>
              </div>
            </header>

            {/* Resumo */}
            <section className="sum" aria-label="Resumo">
              <div className="sum-it">
                <span className="t">
                  <span className="dot" style={{ background: 'var(--sunken)' }}>
                    <Icon id="users" sm />
                  </span>
                  Em acompanhamento
                </span>
                <span className="v">{ativos.length}</span>
                <span className="s">{arquivados.length} arquivado{arquivados.length === 1 ? '' : 's'}</span>
              </div>

              <div className="sum-it">
                <span className="t">
                  <span className="dot" style={{ background: 'var(--cat-evo-soft)', color: 'var(--cat-evo)' }}>
                    <Icon id="evo" sm />
                  </span>
                  Sessões registradas
                </span>
                <span className="v">{totalSessoesAtivos}</span>
                <span className="s">Pacientes ativos</span>
              </div>

              <div className="sum-it">
                <span className="t">
                  <span className="dot" style={{ background: 'var(--cat-drama-soft)', color: 'var(--cat-drama)' }}>
                    <Icon id="drama" sm />
                  </span>
                  Intervenções salvas
                </span>
                <span className="v">{totalIntervencoes}</span>
                <span className="s">Dramatizações e histórias clínicas</span>
              </div>

              <button
                type="button"
                className={`sum-it click ${emAtencao.length ? 'warn' : ''}`}
                onClick={() => setFiltro('atencao')}
              >
                <span className="t">
                  <span className="dot" style={{ background: 'rgba(255,255,255,.5)' }}>
                    <Icon id="alert" sm />
                  </span>
                  Precisam de atenção
                </span>
                <span className="v">{emAtencao.length}</span>
                <span className="s">Sem sessão há 14 dias ou mais</span>
              </button>
            </section>

            {/* Barra de Ferramentas */}
            <div className="tools">
              <label className="search">
                <Icon id="search" sm />
                <span className="sr-only">Buscar paciente</span>
                <input
                  ref={inputBuscaRef}
                  id="q"
                  type="search"
                  placeholder="Buscar por código ou queixa"
                  value={buscaLista}
                  onChange={(e) => setBuscaLista(e.target.value)}
                  autoComplete="off"
                />
                <span className="kbd">/</span>
              </label>

              <div className="seg" role="group" aria-label="Filtrar">
                {[
                  ['ativos', 'Ativos', ativos.length],
                  ['atencao', 'Atenção', emAtencao.length],
                  ['arquivados', 'Arquivados', arquivados.length],
                  ['todos', 'Todos', listaPacientesProcessada.length]
                ].map(([fKey, fLabel, fCount]) => (
                  <button
                    key={fKey as string}
                    type="button"
                    aria-pressed={filtro === fKey}
                    onClick={() => setFiltro(fKey as any)}
                  >
                    {fLabel}
                    <span className="n">{fCount}</span>
                  </button>
                ))}
              </div>

              <label className="sort">
                <span className="sr-only">Ordenar por</span>
                <select
                  id="ordem"
                  value={ordem}
                  onChange={(e) => setOrdem(e.target.value as any)}
                >
                  <option value="recente">Sessão mais recente</option>
                  <option value="atencao">Mais tempo sem sessão</option>
                  <option value="az">Código A–Z</option>
                </select>
              </label>

              <div className="seg icons" role="group" aria-label="Visualização">
                <button
                  type="button"
                  aria-pressed={vista === 'lista'}
                  aria-label="Lista"
                  onClick={() => mudarVista('lista')}
                >
                  <Icon id="list" sm />
                </button>
                <button
                  type="button"
                  aria-pressed={vista === 'cards'}
                  aria-label="Cartões"
                  onClick={() => mudarVista('cards')}
                >
                  <Icon id="grid" sm />
                </button>
              </div>
            </div>

            {/* Lista ou Cartões */}
            {!L.length ? (
              <section className="card empty">
                {buscaLista ? (
                  <>
                    <h3>Nenhum paciente encontrado</h3>
                    <p>Nada com “{buscaLista}”. Confira o código ou mude o filtro.</p>
                  </>
                ) : filtro === 'atencao' ? (
                  <>
                    <h3>Tudo em dia</h3>
                    <p>Nenhum paciente ativo está há 14 dias ou mais sem sessão.</p>
                  </>
                ) : (
                  <>
                    <h3>Nenhum paciente aqui</h3>
                    <p>Crie um paciente para começar o dossiê.</p>
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={() => {
                        setNovoCod(`Paciente 0${pacientes.length + 1}`);
                        setNovoQueixa('');
                        setNovoErr('');
                        setModalNovo(true);
                      }}
                    >
                      <Icon id="plus" /> Novo paciente
                    </button>
                  </>
                )}
              </section>
            ) : vista === 'lista' ? (
              <section className="card table" role="table" aria-label="Pacientes">
                <div className="thead" role="row">
                  <span role="columnheader">Paciente</span>
                  <span role="columnheader">Última sessão</span>
                  <span role="columnheader">Humor</span>
                  <span role="columnheader">Registros</span>
                  <span role="columnheader" className="sr-only">Ações</span>
                </div>
                {L.map((p) => {
                  const h = p.humor;
                  const vHumor = h.length ? h[h.length - 1] : null;
                  const dHumor = h.length > 1 ? h[h.length - 1] - h[h.length - 2] : null;
                  const isMenuAberto = menuPacienteId === p.id;

                  return (
                    <div
                      key={p.id}
                      className="tr"
                      role="row"
                      tabIndex={0}
                      onClick={() => router.push(`/recursos-interativos/pacientes?paciente=${encodeURIComponent(p.cod)}`)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') router.push(`/recursos-interativos/pacientes?paciente=${encodeURIComponent(p.cod)}`);
                      }}
                    >
                      <div className="pt c-pt" role="cell">
                        <span className={`av ${p.status === 'arquivado' ? 'arq' : ''}`}>
                          {extrairIniciais(p.cod)}
                        </span>
                        <span style={{ minWidth: 0 }}>
                          <b>{p.cod}</b>
                          <small>
                            {p.queixa ? p.queixa : 'Sem queixa registrada'} · desde {formatarDataAberto(p.desde)}
                          </small>
                        </span>
                      </div>

                      <div className="c-last" role="cell">
                        {!p.ses ? (
                          <div className="last">
                            <b>Nenhuma sessão ainda</b>
                            <small>Paciente criado {rel(p.desde)}</small>
                          </div>
                        ) : (
                          <div className="last">
                            <b>Sessão {p.ses} · {rel(p.ultima)}</b>
                            <small>{formatarDataCurta(p.ultima)}</small>
                            {p.status === 'arquivado' ? (
                              <div>
                                <span className="flag arq">
                                  <Icon id="archive" sm /> Arquivado
                                </span>
                              </div>
                            ) : atencao(p) ? (
                              <div>
                                <span className="flag">
                                  <Icon id="alert" sm /> Sem sessão há {dias(p.ultima)} dias
                                </span>
                              </div>
                            ) : null}
                          </div>
                        )}
                      </div>

                      <div className="c-mood" role="cell">
                        {!h.length ? (
                          <div className="mood muted" style={{ fontSize: '13px' }}>Sem registro</div>
                        ) : (
                          <div className="mood" aria-label={`Humor na última sessão ${vHumor} de 10`}>
                            <Sparkline humor={h} />
                            <b>{vHumor}</b>
                            <span className="muted" style={{ fontSize: '12px' }}>/10</span>
                            {dHumor !== null && (
                              <span className={`d ${dHumor < 0 ? 'down' : dHumor === 0 ? 'eq' : ''}`}>
                                {dHumor > 0 ? `+${dHumor}` : dHumor < 0 ? `−${Math.abs(dHumor)}` : '='}
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="c-recs" role="cell">
                        <div className="recs">
                          <span
                            className={`rec t-evo ${p.ses ? '' : 'zero'}`}
                            style={{ background: 'var(--cat-evo-soft)', color: 'var(--cat-evo)' }}
                            title="Sessões"
                          >
                            <Icon id="evo" /> {p.ses}
                          </span>
                          <span
                            className={`rec ${p.drama ? '' : 'zero'}`}
                            style={{ background: 'var(--cat-drama-soft)', color: 'var(--cat-drama)' }}
                            title="Dramatizações"
                          >
                            <Icon id="drama" /> {p.drama}
                          </span>
                          <span
                            className={`rec ${p.hist ? '' : 'zero'}`}
                            style={{ background: 'var(--cat-hist-soft)', color: 'var(--cat-hist)' }}
                            title="Histórias clínicas"
                          >
                            <Icon id="book" /> {p.hist}
                          </span>
                        </div>
                      </div>

                      <div className="acts c-acts" role="cell" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          className="btn btn-sm"
                          title={`Registrar sessão ${p.ses + 1}`}
                          onClick={() =>
                            router.push(`/recursos-interativos/pacientes/evolucao?paciente=${encodeURIComponent(p.cod)}&novo=1`)
                          }
                        >
                          <Icon id="evo" sm />
                          <span className="lbl">Sessão {p.ses + 1}</span>
                        </button>
                        <button
                          type="button"
                          className="btn btn-sm btn-primary"
                          onClick={() =>
                            router.push(`/recursos-interativos/pacientes?paciente=${encodeURIComponent(p.cod)}`)
                          }
                        >
                          Abrir <Icon id="chev" sm />
                        </button>
                        <button
                          type="button"
                          className="btn btn-sm btn-icon btn-ghost"
                          data-act="menu"
                          aria-label={`Mais opções de ${p.cod}`}
                          aria-haspopup="true"
                          onClick={() => setMenuPacienteId(isMenuAberto ? null : p.id)}
                        >
                          <Icon id="more" sm />
                        </button>

                        <div className={`menu ${isMenuAberto ? 'open' : ''}`} role="menu">
                          <button
                            type="button"
                            role="menuitem"
                            onClick={() => {
                              setMenuPacienteId(null);
                              setFormCodigo(p.cod);
                              setFormNota(p.queixa || '');
                              setModal('editar');
                            }}
                          >
                            <Icon id="edit" /> Editar código e queixa
                          </button>
                          <button
                            type="button"
                            role="menuitem"
                            onClick={() => alternarArquivamento(p.cod)}
                          >
                            <Icon id="archive" /> {p.status === 'arquivado' ? 'Reativar paciente' : 'Arquivar paciente'}
                          </button>
                          <hr />
                          <button
                            type="button"
                            role="menuitem"
                            className="danger"
                            onClick={() => {
                              setMenuPacienteId(null);
                              setPacienteAtualCodigo(p.cod);
                              setModal('excluir');
                            }}
                          >
                            <Icon id="trash" /> Excluir caso
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </section>
            ) : (
              <section className="grid">
                {L.map((p) => {
                  const h = p.humor;
                  const vHumor = h.length ? h[h.length - 1] : null;
                  const dHumor = h.length > 1 ? h[h.length - 1] - h[h.length - 2] : null;
                  const isMenuAberto = menuPacienteId === p.id;

                  return (
                    <article
                      key={p.id}
                      className="card pc"
                      tabIndex={0}
                      onClick={() => router.push(`/recursos-interativos/pacientes?paciente=${encodeURIComponent(p.cod)}`)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') router.push(`/recursos-interativos/pacientes?paciente=${encodeURIComponent(p.cod)}`);
                      }}
                    >
                      <div className="pc-top">
                        <span className={`av ${p.status === 'arquivado' ? 'arq' : ''}`}>
                          {extrairIniciais(p.cod)}
                        </span>
                        <span style={{ minWidth: 0, flex: 1 }}>
                          <b style={{ display: 'block', fontSize: '16px' }}>{p.cod}</b>
                          <span className="muted" style={{ fontSize: '12px' }}>
                            Desde {formatarDataAberto(p.desde)}
                          </span>
                        </span>
                        <span className="acts" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            className="btn btn-sm btn-icon btn-ghost"
                            data-act="menu"
                            aria-label={`Mais opções de ${p.cod}`}
                            onClick={() => setMenuPacienteId(isMenuAberto ? null : p.id)}
                          >
                            <Icon id="more" sm />
                          </button>
                          <div className={`menu ${isMenuAberto ? 'open' : ''}`} role="menu">
                            <button
                              type="button"
                              role="menuitem"
                              onClick={() => {
                                setMenuPacienteId(null);
                                setFormCodigo(p.cod);
                                setFormNota(p.queixa || '');
                                setModal('editar');
                              }}
                            >
                              <Icon id="edit" /> Editar código e queixa
                            </button>
                            <button
                              type="button"
                              role="menuitem"
                              onClick={() => alternarArquivamento(p.cod)}
                            >
                              <Icon id="archive" /> {p.status === 'arquivado' ? 'Reativar paciente' : 'Arquivar paciente'}
                            </button>
                            <hr />
                            <button
                              type="button"
                              role="menuitem"
                              className="danger"
                              onClick={() => {
                                setMenuPacienteId(null);
                                setPacienteAtualCodigo(p.cod);
                                setModal('excluir');
                              }}
                            >
                              <Icon id="trash" /> Excluir caso
                            </button>
                          </div>
                        </span>
                      </div>

                      <div className="q">
                        {p.queixa ? p.queixa : 'Sem queixa registrada'}
                      </div>

                      <div className="pc-mid">
                        {!p.ses ? (
                          <div className="last">
                            <b>Nenhuma sessão ainda</b>
                            <small>Paciente criado {rel(p.desde)}</small>
                          </div>
                        ) : (
                          <div className="last">
                            <b>Sessão {p.ses} · {rel(p.ultima)}</b>
                            <small>{formatarDataCurta(p.ultima)}</small>
                            {p.status === 'arquivado' ? (
                              <div>
                                <span className="flag arq">
                                  <Icon id="archive" sm /> Arquivado
                                </span>
                              </div>
                            ) : atencao(p) ? (
                              <div>
                                <span className="flag">
                                  <Icon id="alert" sm /> Sem sessão há {dias(p.ultima)} dias
                                </span>
                              </div>
                            ) : null}
                          </div>
                        )}

                        {!h.length ? (
                          <div className="mood muted" style={{ fontSize: '13px' }}>Sem registro</div>
                        ) : (
                          <div className="mood" aria-label={`Humor na última sessão ${vHumor} de 10`}>
                            <Sparkline humor={h} />
                            <b>{vHumor}</b>
                            <span className="muted" style={{ fontSize: '12px' }}>/10</span>
                            {dHumor !== null && (
                              <span className={`d ${dHumor < 0 ? 'down' : dHumor === 0 ? 'eq' : ''}`}>
                                {dHumor > 0 ? `+${dHumor}` : dHumor < 0 ? `−${Math.abs(dHumor)}` : '='}
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="recs">
                        <span
                          className={`rec t-evo ${p.ses ? '' : 'zero'}`}
                          style={{ background: 'var(--cat-evo-soft)', color: 'var(--cat-evo)' }}
                          title="Sessões"
                        >
                          <Icon id="evo" /> {p.ses}
                        </span>
                        <span
                          className={`rec ${p.drama ? '' : 'zero'}`}
                          style={{ background: 'var(--cat-drama-soft)', color: 'var(--cat-drama)' }}
                          title="Dramatizações"
                        >
                          <Icon id="drama" /> {p.drama}
                        </span>
                        <span
                          className={`rec ${p.hist ? '' : 'zero'}`}
                          style={{ background: 'var(--cat-hist-soft)', color: 'var(--cat-hist)' }}
                          title="Histórias clínicas"
                        >
                          <Icon id="book" /> {p.hist}
                        </span>
                      </div>

                      <div className="pc-foot" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          className="btn btn-primary"
                          onClick={() =>
                            router.push(`/recursos-interativos/pacientes?paciente=${encodeURIComponent(p.cod)}`)
                          }
                        >
                          Abrir dossiê <Icon id="chev" sm />
                        </button>
                        <button
                          type="button"
                          className="btn"
                          onClick={() =>
                            router.push(`/recursos-interativos/pacientes/evolucao?paciente=${encodeURIComponent(p.cod)}&novo=1`)
                          }
                        >
                          <Icon id="evo" sm /> Sessão {p.ses + 1}
                        </button>
                      </div>
                    </article>
                  );
                })}
              </section>
            )}

            <p className="foot">
              <Icon id="lock" sm />
              <span>Registros sob sigilo profissional (CFP e LGPD). Identifique os pacientes por código ou iniciais.</span>
            </p>
          </div>

          {/* Modal Novo Paciente */}
          {modalNovo && (
            <div
              className="dx-modal-backdrop"
              style={{ position: 'fixed', inset: 0, background: 'var(--scrim)', zIndex: 60, display: 'grid', placeItems: 'center', padding: '16px' }}
              onClick={() => setModalNovo(false)}
            >
              <form
                method="dialog"
                className="modal card"
                style={{ width: 'min(480px, calc(100vw - 32px))', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}
                onClick={(e) => e.stopPropagation()}
                onSubmit={criarNovoPaciente}
              >
                <h2 style={{ margin: 0, font: '700 20px/26px var(--font-sans)' }}>Novo paciente</h2>
                <div className="field">
                  <label htmlFor="f-cod">Código do paciente</label>
                  <input
                    id="f-cod"
                    className="input mono"
                    maxLength={24}
                    autoComplete="off"
                    placeholder="Ex.: P-015 ou iniciais"
                    value={novoCod}
                    onChange={(e) => setNovoCod(e.target.value)}
                    autoFocus
                  />
                  <span className="hint">Use um código ou iniciais, não o nome completo.</span>
                  <span className={`err ${novoErr ? 'show' : ''}`} id="f-err">
                    {novoErr || 'Escolha um código que ainda não exista.'}
                  </span>
                </div>
                <div className="field">
                  <label htmlFor="f-q">
                    Queixa ou foco do acompanhamento <span className="muted" style={{ fontWeight: 400 }}>(opcional)</span>
                  </label>
                  <textarea
                    id="f-q"
                    className="input"
                    rows={2}
                    placeholder="Ex.: ansiedade de desempenho no trabalho"
                    value={novoQueixa}
                    onChange={(e) => setNovoQueixa(e.target.value)}
                  />
                </div>
                <div className="modal-actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                  <button
                    type="button"
                    className="btn btn-ghost"
                    onClick={() => setModalNovo(false)}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    id="f-ok"
                  >
                    Criar e abrir dossiê
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Modal de Editar ou Excluir (quando acionado via menu) */}
          {modal === 'editar' && (
            <div
              className="dx-modal-backdrop"
              style={{ position: 'fixed', inset: 0, background: 'var(--scrim)', zIndex: 60, display: 'grid', placeItems: 'center', padding: '16px' }}
              onClick={() => setModal(null)}
            >
              <div
                className="modal card"
                style={{ width: 'min(480px, calc(100vw - 32px))', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}
                onClick={(e) => e.stopPropagation()}
              >
                <h2 style={{ margin: 0, font: '700 20px/26px var(--font-sans)' }}>Editar paciente</h2>
                <div className="field">
                  <label>Código do paciente</label>
                  <input
                    className="input mono"
                    value={formCodigo}
                    onChange={(e) => setFormCodigo(e.target.value)}
                  />
                </div>
                <div className="field">
                  <label>Queixa ou anotação</label>
                  <textarea
                    className="input"
                    rows={2}
                    value={formNota}
                    onChange={(e) => setFormNota(e.target.value)}
                  />
                </div>
                <div className="modal-actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                  <button type="button" className="btn btn-ghost" onClick={() => setModal(null)}>
                    Cancelar
                  </button>
                  <button type="button" className="btn btn-primary" onClick={salvarModalPaciente} disabled={salvandoModal}>
                    {salvandoModal ? 'Salvando...' : 'Salvar alterações'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {modal === 'excluir' && (
            <div
              className="dx-modal-backdrop"
              style={{ position: 'fixed', inset: 0, background: 'var(--scrim)', zIndex: 60, display: 'grid', placeItems: 'center', padding: '16px' }}
              onClick={() => setModal(null)}
            >
              <div
                className="modal card"
                style={{ width: 'min(420px, calc(100vw - 32px))', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}
                onClick={(e) => e.stopPropagation()}
              >
                <h2 style={{ margin: 0, font: '700 20px/26px var(--font-sans)', color: 'var(--danger)' }}>
                  Excluir paciente
                </h2>
                <p style={{ margin: 0, fontSize: '14px', color: 'var(--muted)' }}>
                  Tem certeza que deseja excluir o prontuário de <b>{pacienteAtualCodigo}</b>? Todas as sessões e intervenções vinculadas serão apagadas permanentemente.
                </p>
                <div className="modal-actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                  <button type="button" className="btn btn-ghost" onClick={() => setModal(null)}>
                    Cancelar
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    style={{ background: 'var(--danger)', borderColor: 'var(--danger)' }}
                    onClick={confirmarExcluirPaciente}
                    disabled={salvandoModal}
                  >
                    {salvandoModal ? 'Excluindo...' : 'Sim, excluir caso'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Toast */}
          <div className={`toast ${toastMsg ? 'show' : ''}`} role="status" aria-live="polite">
            {toastMsg}
          </div>
        </div>
      </PlatformShell>
    );
  }

  // Lista de dias agrupados
  const itensPorDia: { data: string; itens: ItemDossie[] }[] = [];
  itensVisiveis.forEach((x) => {
    const ultimoGrupo = itensPorDia[itensPorDia.length - 1];
    if (ultimoGrupo && ultimoGrupo.data === x.data) {
      ultimoGrupo.itens.push(x);
    } else {
      itensPorDia.push({ data: x.data, itens: [x] });
    }
  });

  // Ranking de técnicas para a lateral
  const contagemTecnicas: Record<string, number> = {};
  pacienteAtual?.itens.forEach((x) => {
    if (x.tipo === 'sessao') {
      x.tec.forEach((t) => {
        contagemTecnicas[t] = (contagemTecnicas[t] || 0) + 1;
      });
    }
  });
  const rankingTecnicas = Object.entries(contagemTecnicas).sort((a, b) => b[1] - a[1]);
  const maxOcorrencias = rankingTecnicas[0]?.[1] || 1;

  // Dramatizações para a lateral
  const dramatizacoesLateral = (pacienteAtual?.itens || []).filter((x): x is DramaItem => x.tipo === 'drama');

  // Próxima sessão para a lateral
  const ultimaSessao = sessoesCronologicas[sessoesCronologicas.length - 1];

  return (
    <PlatformShell activePage="recursos">
      <div className="dossie-root">
        <IconSprite />

        <div className="page" id="page">
          {/* Cabeçalho Oficial Clínico Timbrado (Exclusivo para Impressão) */}
          <div className="dossie-print-header" aria-hidden="true">
            <div className="dossie-print-topline">
              <div>
                <div className="dossie-print-brand">NEUROACERVO · PRONTUÁRIO CLÍNICO</div>
                <div className="dossie-print-sub">Dossiê e Registro de Evolução Psicológica / Neuropsicológica</div>
              </div>
              <div className="dossie-print-date">
                <div><b>Emissão:</b> {new Date().toLocaleDateString('pt-BR')} às {new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</div>
                <div className="dossie-print-sigilo">DOCUMENTO CONFIDENCIAL · SIGILO PROFISSIONAL</div>
              </div>
            </div>

            <div className="dossie-print-patient-box">
              <div className="dossie-print-field">
                <span className="lbl">Identificação do Paciente:</span>
                <span className="val">{pacienteAtual?.codigo || '—'}</span>
              </div>
              <div className="dossie-print-field">
                <span className="lbl">Demanda / Queixa Principal:</span>
                <span className="val">{pacienteAtual?.nota || 'Acompanhamento clínico geral'}</span>
              </div>
              <div className="dossie-print-field">
                <span className="lbl">Data de Abertura:</span>
                <span className="val">{formatarData(pacienteAtual?.aberto || '')}</span>
              </div>
              <div className="dossie-print-field">
                <span className="lbl">Total de Intervenções:</span>
                <span className="val">{pacienteAtual?.itens.length || 0} registro(s) ({contagens.sessao} sessões, {contagens.drama} dramatizações, {contagens.hist} histórias)</span>
              </div>
            </div>
          </div>

          {/* Breadcrumb de Navegação */}
          <nav className="crumbs" aria-label="Caminho">
            <Link href="/recursos-interativos" style={{ textDecoration: 'none' }}>
              <Icon id="back" sm /> Recursos Interativos
            </Link>
            <Icon id="chev" sm />
            <Link
              href="/recursos-interativos/pacientes"
              style={{ textDecoration: 'none', color: 'inherit' }}
              title="Voltar para a lista geral de pacientes"
            >
              Dossiê clínico
            </Link>
            <Icon id="chev" sm />
            <b>{pacienteAtual?.codigo || 'Paciente'}</b>
          </nav>

          {/* Cabeçalho do Paciente com Seletor e Ações */}
          <section className="card head">
            <span className="av">{extrairIniciais(pacienteAtual?.codigo || 'P')}</span>

            <div style={{ minWidth: 0 }}>
              <button
                type="button"
                className="who"
                aria-haspopup="true"
                aria-expanded={menuAberto === 'picker'}
                onClick={() => setMenuAberto(menuAberto === 'picker' ? null : 'picker')}
              >
                <h1>{pacienteAtual?.codigo}</h1>
                <Icon id="down" sm />
              </button>

              <div className="meta">
                <span>
                  <Icon id="cal" sm /> Caso aberto em {formatarData(pacienteAtual?.aberto || '')}
                </span>
                {pacienteAtual?.nota && <span>· {pacienteAtual.nota}</span>}
                <span>
                  <Icon id="lock" sm /> Sigilo profissional
                </span>
              </div>
            </div>

            {/* Menu Dropdown de Seleção de Paciente */}
            <div className={`menu picker ${menuAberto === 'picker' ? 'open' : ''}`} role="menu">
              <label className="s">
                <Icon id="search" sm />
                <span className="sr-only">Buscar paciente</span>
                <input
                  placeholder="Buscar paciente"
                  value={buscaPicker}
                  onChange={(e) => setBuscaPicker(e.target.value)}
                  autoFocus
                />
              </label>
              <div style={{ maxHeight: '240px', overflowY: 'auto' }}>
                {pacientes
                  .filter((p) => !buscaPicker || p.codigo.toLowerCase().includes(buscaPicker.toLowerCase()))
                  .map((p) => (
                    <button
                      key={p.codigo}
                      type="button"
                      role="menuitem"
                      aria-current={p.codigo === pacienteAtual?.codigo}
                      onClick={() => selecionarPaciente(p.codigo)}
                    >
                      <span className="av" style={{ width: '32px', height: '32px', borderRadius: '9px', fontSize: '11px' }}>
                        {extrairIniciais(p.codigo)}
                      </span>
                      <span>
                        {p.codigo}
                        <small>{p.itens.length} registros</small>
                      </span>
                    </button>
                  ))}
              </div>
              <hr />
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setMenuAberto(null);
                  setFormCodigo('');
                  setFormNota('');
                  setModal('novo');
                }}
              >
                <Icon id="plus" sm />
                Novo paciente
              </button>
            </div>

            {/* Ações Principais do Topo */}
            <div className="head-actions">
              <button
                type="button"
                className="btn btn-sub"
                onClick={() => router.push('/recursos-interativos/pacientes')}
                title="Voltar para a lista geral de pacientes"
                style={{ height: '40px', padding: '0 14px', borderRadius: '10px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                <Icon id="back" sm /> Todos os pacientes
              </button>

              <button type="button" className="btn" onClick={imprimirDossieCompleto}>
                <Icon id="print" /> Imprimir dossiê
              </button>

              <div style={{ position: 'relative' }}>
                <button
                  type="button"
                  className="btn"
                  aria-haspopup="true"
                  aria-expanded={menuAberto === 'nova'}
                  onClick={() => setMenuAberto(menuAberto === 'nova' ? null : 'nova')}
                >
                  <Icon id="plus" /> Nova intervenção <Icon id="down" sm />
                </button>

                <div className={`menu ${menuAberto === 'nova' ? 'open' : ''}`} role="menu" style={{ right: 0, top: '46px' }}>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setMenuAberto(null);
                      router.push(`/recursos-interativos/dramatizacao?paciente=${encodeURIComponent(pacienteAtual?.codigo || '')}`);
                    }}
                  >
                    <span className="mi t-drama"><Icon id="drama" /></span>
                    <span>
                      Dramatização dos dois lados
                      <small>Debate em rodadas com troca de papéis</small>
                    </span>
                  </button>

                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setMenuAberto(null);
                      router.push(`/recursos-interativos/historias?paciente=${encodeURIComponent(pacienteAtual?.codigo || '')}`);
                    }}
                  >
                    <span className="mi t-hist"><Icon id="book" /></span>
                    <span>
                      História clínica estruturada
                      <small>Caso por faixa etária, em etapas</small>
                    </span>
                  </button>

                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setMenuAberto(null);
                      router.push(`/recursos-interativos/pacientes/evolucoes?paciente=${encodeURIComponent(pacienteAtual?.codigo || '')}`);
                    }}
                  >
                    <span className="mi t-sessao"><Icon id="evo" /></span>
                    <span>
                      Histórico completo de evoluções
                      <small>Linha do tempo e busca textual de sessões</small>
                    </span>
                  </button>
                </div>
              </div>

              {/* Botão Primário: Registrar Próxima Sessão */}
              <button
                type="button"
                className="btn btn-primary"
                onClick={() =>
                  router.push(`/recursos-interativos/pacientes/evolucao?paciente=${encodeURIComponent(pacienteAtual?.codigo || '')}`)
                }
              >
                <Icon id="evo" /> Registrar sessão {sessoesCronologicas.length + 1}
              </button>

              {/* Menu Mais Opções */}
              <div style={{ position: 'relative' }}>
                <button
                  type="button"
                  className="btn btn-icon"
                  aria-label="Mais opções"
                  aria-haspopup="true"
                  onClick={() => setMenuAberto(menuAberto === 'mais' ? null : 'mais')}
                >
                  <Icon id="more" />
                </button>

                <div className={`menu ${menuAberto === 'mais' ? 'open' : ''}`} role="menu" style={{ right: 0, top: '46px' }}>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setMenuAberto(null);
                      setFormCodigo(pacienteAtual?.codigo || '');
                      setFormNota(pacienteAtual?.nota || '');
                      setModal('editar');
                    }}
                  >
                    <Icon id="edit" sm /> Editar código e anotação
                  </button>
                  <hr />
                  <button
                    type="button"
                    role="menuitem"
                    className="danger"
                    onClick={() => {
                      setMenuAberto(null);
                      setModal('excluir');
                    }}
                  >
                    <Icon id="trash" sm /> Excluir caso
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Estado Vazio Acolhedor (quando o paciente ainda não possui nenhum registro) */}
          {pacienteAtual?.itens.length === 0 ? (
            <section className="card empty">
              <span className="badge t-evo" style={{ width: '64px', height: '64px', borderRadius: '18px' }}>
                <Icon id="evo" />
              </span>
              <h3>Nenhum registro ainda</h3>
              <p>
                Tudo o que você registrar com <strong>{pacienteAtual.codigo}</strong> aparece aqui, numa linha do tempo unificada: sessões, dramatizações e histórias clínicas.
              </p>
              <div className="starts">
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() =>
                    router.push(`/recursos-interativos/pacientes/evolucao?paciente=${encodeURIComponent(pacienteAtual.codigo)}`)
                  }
                >
                  <Icon id="evo" /> Registrar a primeira sessão
                </button>
                <button
                  type="button"
                  className="btn"
                  onClick={() =>
                    router.push(`/recursos-interativos/dramatizacao?paciente=${encodeURIComponent(pacienteAtual.codigo)}`)
                  }
                >
                  <Icon id="drama" /> Dramatização
                </button>
                <button
                  type="button"
                  className="btn"
                  onClick={() =>
                    router.push(`/recursos-interativos/historias?paciente=${encodeURIComponent(pacienteAtual.codigo)}`)
                  }
                >
                  <Icon id="book" /> História clínica
                </button>
              </div>

              <div style={{ marginTop: '16px' }}>
                <button type="button" className="btn btn-sm btn-ghost" onClick={carregarDemonstracao}>
                  💡 Carregar dados de demonstração para testar
                </button>
              </div>
            </section>
          ) : (
            /* Layout Principal de 2 Colunas */
            <div className="layout">
              {/* Coluna Principal: Barra de Ferramentas + Timeline */}
              <main style={{ display: 'flex', flexDirection: 'column', gap: '14px', minWidth: 0 }}>
                {/* Barra de Filtros e Busca */}
                <div className="bar">
                  <div className="tabs" role="tablist" aria-label="Filtrar">
                    {(
                      [
                        ['tudo', 'Tudo', contagens.tudo],
                        ['sessao', 'Sessões', contagens.sessao],
                        ['drama', 'Dramatizações', contagens.drama],
                        ['hist', 'Histórias clínicas', contagens.hist]
                      ] as const
                    ).map(([chave, rotulo, total]) => (
                      <button
                        key={chave}
                        type="button"
                        className="tab"
                        role="tab"
                        aria-selected={aba === chave}
                        onClick={() => setAba(chave)}
                      >
                        {rotulo}
                        <span className="n">{total}</span>
                      </button>
                    ))}
                  </div>

                  <label className="search">
                    <Icon id="search" sm />
                    <span className="sr-only">Buscar no dossiê</span>
                    <input
                      type="search"
                      placeholder="Buscar no dossiê"
                      value={busca}
                      onChange={(e) => setBusca(e.target.value)}
                      autoComplete="off"
                    />
                  </label>

                  <button type="button" className="btn btn-ghost btn-sm" onClick={alternarTodos}>
                    {todosAbertos ? 'Fechar todos' : 'Abrir todos'}
                  </button>
                </div>

                {/* Lista da Linha do Tempo Agrupada por Dia */}
                <div className="list" id="list">
                  {itensPorDia.length === 0 ? (
                    <div className="card empty">
                      <p>Nada encontrado {busca ? `para “${busca}”` : 'nesta categoria'}.</p>
                    </div>
                  ) : (
                    itensPorDia.map((grupo) => {
                      const sessaoDoDia = grupo.itens.find((x): x is SessaoItem => x.tipo === 'sessao');
                      return (
                        <React.Fragment key={grupo.data}>
                          <div className="day">
                            {formatarData(grupo.data, { weekday: 'long', day: 'numeric', month: 'long' })}
                            {sessaoDoDia ? ` · sessão ${sessaoDoDia.n}` : ''}
                          </div>

                          {grupo.itens.map((x) => {
                            const estaAberto = !!abertos[x.id] || Boolean(busca.trim());

                            if (x.tipo === 'sessao') {
                              const anterior = sessoesCronologicas.find((s) => s.n === x.n - 1);
                              const diff = anterior ? x.humor - anterior.humor : null;
                              const isAtual = ultimaSessao ? x.n === ultimaSessao.n : false;
                              const dataLen = String(x.n).length >= 3 ? '3' : undefined;

                              return (
                                <article
                                  key={x.id}
                                  className="card item"
                                  id={`it-${x.id}`}
                                  data-open={estaAberto}
                                >
                                  <button
                                    type="button"
                                    className="ih"
                                    aria-expanded={estaAberto}
                                    onClick={() => alternarItem(x.id)}
                                  >
                                    <span
                                      className={`ses-badge ${isAtual ? 'is-atual' : ''}`}
                                      aria-label={`Sessão ${x.n}${isAtual ? ', atual' : ''}`}
                                    >
                                      <span className="pg">
                                        <span className="tp">
                                          <span className="tp-long">Sessão</span>
                                          <span className="tp-short">Nº</span>
                                        </span>
                                        <span className="nb" data-len={dataLen}>
                                          {x.n}
                                        </span>
                                      </span>
                                    </span>

                                    <span style={{ minWidth: 0 }}>
                                      <span className="kind" style={{ color: 'var(--cat-evo)' }}>
                                        Evolução da sessão
                                      </span>
                                      <span className="ititle" style={{ display: 'block' }}>
                                        {destacar(x.temas)}
                                      </span>
                                      <span className="imeta">
                                        <span>
                                          <Icon id={x.mod === 'Online' ? 'video' : 'pin'} sm /> {x.mod}
                                        </span>
                                        <span>
                                          <Icon id="clock" sm /> {x.dur} min
                                        </span>
                                      </span>
                                    </span>

                                    <span className="iright">
                                      <span className="pill">
                                        Humor <b>{x.humor}</b>
                                        {diff !== null && (
                                          <span className="d">
                                            {diff > 0 ? `+${diff}` : diff < 0 ? `−${Math.abs(diff)}` : '='}
                                          </span>
                                        )}
                                      </span>
                                      <Icon id="down" cls="chev" />
                                    </span>
                                  </button>

                                  <div className="ib">
                                    <div className="row">
                                      <span>Comportamento</span>
                                      <div className="tags">
                                        {x.comp.map((c) => (
                                          <span key={c} className="tag">
                                            {c}
                                          </span>
                                        ))}
                                      </div>
                                    </div>

                                    <div className="row">
                                      <span>Temas trabalhados</span>
                                      <p>{destacar(x.temas)}</p>
                                    </div>

                                    <div className="row">
                                      <span>Intervenções</span>
                                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                        <div className="tags">
                                          {x.tec.map((t) => (
                                            <span key={t} className="tag on">
                                              {t}
                                            </span>
                                          ))}
                                        </div>

                                        {x.vinc.length > 0 && (
                                          <div className="links">
                                            {x.vinc.map((vincId) => {
                                              const vinculado = pacienteAtual.itens.find((i) => i.id === vincId);
                                              if (!vinculado) return null;
                                              const isDrama = vinculado.tipo === 'drama';

                                              return (
                                                <button
                                                  key={vincId}
                                                  type="button"
                                                  className="lnk"
                                                  onClick={() => irParaItem(vincId)}
                                                >
                                                  <span className={`mi ${isDrama ? 't-drama' : 't-hist'}`}>
                                                    <Icon id={isDrama ? 'drama' : 'book'} />
                                                  </span>
                                                  <span>
                                                    {isDrama ? 'Dramatização' : 'História clínica'}
                                                    <small>
                                                      {isDrama
                                                        ? `Crença ${(vinculado as DramaItem).crenca[0]} → ${(vinculado as DramaItem).crenca[1]} · ${(vinculado as DramaItem).rodadas} rodadas`
                                                        : (vinculado as HistItem).titulo}
                                                    </small>
                                                  </span>
                                                  <Icon id="chev" sm />
                                                </button>
                                              );
                                            })}
                                          </div>
                                        )}
                                      </div>
                                    </div>

                                    <div className="row">
                                      <span>Resposta do paciente</span>
                                      <p>{destacar(x.resp)}</p>
                                    </div>

                                    <div className="row">
                                      <span>Combinados</span>
                                      <div className="todo">
                                        <span className="ck" aria-hidden="true" />
                                        <span>{destacar(x.comb)}</span>
                                      </div>
                                    </div>

                                    {x.prox && (
                                      <div className="row">
                                        <span>Próxima sessão</span>
                                        <p>{destacar(x.prox)}</p>
                                      </div>
                                    )}

                                    <div className="ifoot">
                                      <button
                                        type="button"
                                        className="btn btn-sm"
                                        onClick={() =>
                                          router.push(
                                            `/recursos-interativos/pacientes/evolucao?paciente=${encodeURIComponent(pacienteAtual.codigo)}&resourceId=${encodeURIComponent(x.resourceId || x.id)}`
                                          )
                                        }
                                      >
                                        <Icon id="edit" sm /> Editar
                                      </button>
                                      <button
                                        type="button"
                                        className="btn btn-sm"
                                        onClick={() => imprimirItemIndividual(x.id)}
                                        title="Imprimir esta evolução individual"
                                      >
                                        <Icon id="print" sm /> Imprimir
                                      </button>
                                    </div>
                                  </div>
                                </article>
                              );
                            }

                            if (x.tipo === 'drama') {
                              return (
                                <article
                                  key={x.id}
                                  className="card item"
                                  id={`it-${x.id}`}
                                  data-open={estaAberto}
                                >
                                  <button
                                    type="button"
                                    className="ih"
                                    aria-expanded={estaAberto}
                                    onClick={() => alternarItem(x.id)}
                                  >
                                    <span className="badge t-drama">
                                      <Icon id="drama" />
                                    </span>

                                    <span style={{ minWidth: 0 }}>
                                      <span className="kind" style={{ color: 'var(--cat-drama)' }}>
                                        Dramatização dos dois lados
                                      </span>
                                      <span className="ititle" style={{ display: 'block' }}>
                                        “{destacar(x.pens)}”
                                      </span>
                                      <span className="imeta">
                                        <span>
                                          {x.rodadas} rodadas · {x.falas} falas
                                        </span>
                                        {x.sessao && <span>Na sessão {x.sessao}</span>}
                                      </span>
                                    </span>

                                    <span className="iright">
                                      <span className="pill ok">
                                        Crença <b>{x.crenca[0]} → {x.crenca[1]}</b>
                                      </span>
                                      <Icon id="down" cls="chev" />
                                    </span>
                                  </button>

                                  <div className="ib">
                                    <div className="mets">
                                      <div className="met">
                                        <span>Crença no pensamento</span>
                                        <b>{x.crenca[0]} → {x.crenca[1]}</b>
                                      </div>
                                      <div className="met">
                                        <span>{x.emocao[0]}</span>
                                        <b>{x.emocao[1]} → {x.emocao[2]}</b>
                                      </div>
                                      <div className="met">
                                        <span>Respostas que funcionaram</span>
                                        <b>{x.ok}<small> / {x.total}</small></b>
                                      </div>
                                    </div>

                                    <div className="row">
                                      <span>Funcionaram</span>
                                      <ul className="list-s">
                                        {x.funcionou.map((f, i) => (
                                          <li key={i}>{destacar(f)}</li>
                                        ))}
                                      </ul>
                                    </div>

                                    <div className="row">
                                      <span>Continuar trabalhando</span>
                                      <ul className="list-s">
                                        {x.dificil.map((d, i) => (
                                          <li key={i}>{destacar(d)}</li>
                                        ))}
                                      </ul>
                                    </div>

                                    <div className="ifoot">
                                      <button
                                        type="button"
                                        className="btn btn-sm"
                                        onClick={() =>
                                          router.push(
                                            `/recursos-interativos/dramatizacao?paciente=${encodeURIComponent(pacienteAtual.codigo)}&pensamento=${encodeURIComponent(x.pens)}`
                                          )
                                        }
                                      >
                                        Repetir com este pensamento
                                      </button>
                                      <button
                                        type="button"
                                        className="btn btn-sm"
                                        onClick={() =>
                                          router.push(
                                            `/recursos-interativos/pacientes/dramatizacao?paciente=${encodeURIComponent(pacienteAtual.codigo)}`
                                          )
                                        }
                                      >
                                        Relatório de impressão
                                      </button>
                                      <button
                                        type="button"
                                        className="btn btn-sm btn-primary"
                                        onClick={() =>
                                          router.push(
                                            `/recursos-interativos/dramatizacao?paciente=${encodeURIComponent(pacienteAtual.codigo)}&resourceId=${encodeURIComponent(x.resourceId || x.id)}`
                                          )
                                        }
                                      >
                                        Ver debate completo <Icon id="arrow" sm />
                                      </button>
                                    </div>
                                  </div>
                                </article>
                              );
                            }

                            // História Clínica
                            return (
                              <article
                                key={x.id}
                                className="card item"
                                id={`it-${x.id}`}
                                data-open={estaAberto}
                              >
                                <button
                                  type="button"
                                  className="ih"
                                  aria-expanded={estaAberto}
                                  onClick={() => alternarItem(x.id)}
                                >
                                  <span className="badge t-hist">
                                    <Icon id="book" />
                                  </span>

                                  <span style={{ minWidth: 0 }}>
                                    <span className="kind" style={{ color: 'var(--cat-hist)' }}>
                                      História clínica · {x.faixa}
                                    </span>
                                    <span className="ititle" style={{ display: 'block' }}>
                                      {destacar(x.titulo)}
                                    </span>
                                    <span className="imeta">
                                      <span>{x.etapas.length} etapas</span>
                                      <span>{x.temas.join(' · ')}</span>
                                      {x.sessao && <span>Na sessão {x.sessao}</span>}
                                    </span>
                                  </span>

                                  <span className="iright">
                                    <span className="pill">
                                      Crença <b>{x.crenca !== null && x.crenca !== undefined ? `${x.crenca}%` : '—'}</b>
                                    </span>
                                    <Icon id="down" cls="chev" />
                                  </span>
                                </button>

                                <div className="ib">
                                  <div className="row">
                                    <span>O caso</span>
                                    <div className="quote">{destacar(x.caso)}</div>
                                  </div>

                                  <div className="row">
                                    <span>Respostas e anotações</span>
                                    <div className="qa">
                                      {x.etapas.map((etapa, idx) => {
                                        const semNota = etapa[2] === '(Sem anotações registradas)';
                                        return (
                                          <div key={idx}>
                                            <span className="n">{idx + 1}</span>
                                            <span>
                                              <q>{etapa[0]} · {etapa[1]}</q>
                                              <p style={semNota ? { opacity: 0.6, fontStyle: 'italic' } : undefined}>
                                                {destacar(etapa[2])}
                                              </p>
                                            </span>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </div>

                                  <div className="row">
                                    <span>Indicadores</span>
                                    <div className="tags">
                                      {x.intensidade !== null && x.intensidade !== undefined ? (
                                        <span className="tag">
                                          Termômetro da emoção: {x.intensidade}/5{TERMOMETRO_LABELS[x.intensidade] ? ` (${TERMOMETRO_LABELS[x.intensidade]})` : ''}
                                        </span>
                                      ) : null}
                                      {x.crenca !== null && x.crenca !== undefined ? (
                                        <span className="tag">Crença no pensamento: {x.crenca}%</span>
                                      ) : null}
                                      {x.intensidade == null && x.crenca == null && (
                                        <span className="tag" style={{ opacity: 0.7 }}>Indicadores não pontuados</span>
                                      )}
                                    </div>
                                  </div>

                                  <div className="ifoot">
                                    <button
                                      type="button"
                                      className="btn btn-sm"
                                      onClick={() =>
                                        router.push(
                                          `/recursos-interativos/pacientes/historia?paciente=${encodeURIComponent(pacienteAtual.codigo)}`
                                        )
                                      }
                                    >
                                      Relatório de impressão
                                    </button>
                                    <button
                                      type="button"
                                      className="btn btn-sm btn-primary"
                                      onClick={() => {
                                        const queryFaixa = x.faixaId ? `&faixa=${encodeURIComponent(x.faixaId)}` : '';
                                        const queryHist = x.histNum ? `&historia=${encodeURIComponent(x.histNum)}` : '';
                                        router.push(
                                          `/recursos-interativos/historias?paciente=${encodeURIComponent(pacienteAtual.codigo)}${queryFaixa}${queryHist}&resourceId=${encodeURIComponent(x.resourceId || x.id)}`
                                        );
                                      }}
                                    >
                                      Ver história completa <Icon id="arrow" sm />
                                    </button>
                                  </div>
                                </div>
                              </article>
                            );
                          })}
                        </React.Fragment>
                      );
                    })
                  )}
                </div>
              </main>

              {/* Coluna Lateral de Análise Clínica (`aside.side`) */}
              <aside className="side">
                {/* 1. Gráfico SVG de Humor */}
                {sessoesCronologicas.length > 0 && (
                  <section className="card box chart">
                    <div className="box-head">
                      <h2>Humor ao longo das sessões</h2>
                      <span className="eyebrow">0–10</span>
                    </div>

                    {(() => {
                      const ses = sessoesCronologicas;
                      const X = (i: number) => (ses.length > 1 ? 24 + (260 * i) / (ses.length - 1) : 150);
                      const Y = (v: number) => 118 - Math.max(0, Math.min(10, v)) * 10;
                      const avg = ses.reduce((acc, s) => acc + s.humor, 0) / ses.length;
                      const diffTotal = ses[ses.length - 1].humor - ses[0].humor;

                      return (
                        <>
                          <svg viewBox="0 0 300 150" role="img" aria-label="Humor por sessão">
                            {/* Linhas guias */}
                            <g stroke="#e2d9c6">
                              <line x1="0" y1="18" x2="300" y2="18" />
                              <line x1="0" y1="68" x2="300" y2="68" />
                              <line x1="0" y1="118" x2="300" y2="118" />
                            </g>

                            {/* Área sombreada */}
                            <path
                              d={`M${ses.map((s, i) => `${X(i)} ${Y(s.humor)}`).join(' L')} L${X(ses.length - 1)} 118 L${X(0)} 118Z`}
                              fill="#d6f5a3"
                              opacity=".55"
                            />

                            {/* Linha da trajetória */}
                            <polyline
                              points={ses.map((s, i) => `${X(i)},${Y(s.humor)}`).join(' ')}
                              fill="none"
                              stroke="#2b5c35"
                              strokeWidth="2.5"
                              strokeLinejoin="round"
                            />

                            {/* Marcadores circulares clicáveis */}
                            {ses.map((s, i) => {
                              const isUltimo = i === ses.length - 1;
                              return (
                                <g
                                  key={s.id}
                                  tabIndex={0}
                                  role="button"
                                  style={{ cursor: 'pointer' }}
                                  aria-label={`Sessão ${s.n}, humor ${s.humor}`}
                                  onClick={() => irParaItem(s.id)}
                                >
                                  <circle cx={X(i)} cy={Y(s.humor)} r="12" fill="transparent" />
                                  <circle
                                    cx={X(i)}
                                    cy={Y(s.humor)}
                                    r={isUltimo ? 6 : 5}
                                    fill={isUltimo ? '#2b5c35' : '#fcfbf7'}
                                    stroke="#2b5c35"
                                    strokeWidth="2.5"
                                  />
                                  <text
                                    x={X(i)}
                                    y={Y(s.humor) - 12}
                                    fontFamily="IBM Plex Mono, monospace"
                                    fontSize="12"
                                    textAnchor="middle"
                                    fill="#1f2620"
                                  >
                                    {s.humor}
                                  </text>
                                  <text
                                    x={X(i)}
                                    y="140"
                                    fontFamily="Inter, sans-serif"
                                    fontSize="11"
                                    textAnchor="middle"
                                    fill="#6a6555"
                                  >
                                    nº {s.n}
                                  </text>
                                </g>
                              );
                            })}
                          </svg>

                          <div className="stats">
                            <div>
                              <b>{ses.length}</b>
                              <span>Sessões</span>
                            </div>
                            <div>
                              <b>{avg.toFixed(1).replace('.', ',')}</b>
                              <span>Humor médio</span>
                            </div>
                            <div>
                              <b>{diffTotal > 0 ? `+${diffTotal}` : diffTotal}</b>
                              <span>Desde a 1ª</span>
                            </div>
                          </div>
                        </>
                      );
                    })()}
                  </section>
                )}

                {/* 2. Crença nas Dramatizações */}
                {dramatizacoesLateral.length > 0 && (
                  <section className="card box">
                    <div className="box-head">
                      <h2>Crença nas dramatizações</h2>
                    </div>
                    <ul className="list-s">
                      {dramatizacoesLateral.map((d) => (
                        <li
                          key={d.id}
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            gap: '10px',
                            cursor: 'pointer'
                          }}
                          onClick={() => irParaItem(d.id)}
                        >
                          <span style={{ minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {d.pens}
                          </span>
                          <b className="mono" style={{ whiteSpace: 'nowrap' }}>
                            {d.crenca[0]} → {d.crenca[1]}
                          </b>
                        </li>
                      ))}
                    </ul>
                  </section>
                )}

                {/* 3. Intervenções Mais Usadas */}
                {rankingTecnicas.length > 0 && (
                  <section className="card box">
                    <h2>Intervenções mais usadas</h2>
                    <ul className="rank">
                      {rankingTecnicas.map(([tec, qtd]) => (
                        <li key={tec}>
                          <span>{tec}</span>
                          <span className="n">{qtd}×</span>
                          <span className="b">
                            <i style={{ width: `${(qtd / maxOcorrencias) * 100}%` }} />
                          </span>
                        </li>
                      ))}
                    </ul>
                  </section>
                )}

                {/* 4. Para a Próxima Sessão */}
                {ultimaSessao && (
                  <section className="card box">
                    <h2>Para a próxima sessão</h2>
                    <div className="pending">
                      <b>Combinado na sessão {ultimaSessao.n}</b>
                      {ultimaSessao.comb}
                      {ultimaSessao.prox && (
                        <>
                          <br />
                          <br />
                          <b>Retomar</b>
                          {ultimaSessao.prox}
                        </>
                      )}
                    </div>
                  </section>
                )}

                {/* 5. Aviso de Sigilo */}
                <p className="lock">
                  <Icon id="lock" sm />
                  <span>Registros sob sigilo profissional (CFP e LGPD). Use códigos, não nomes.</span>
                </p>
              </aside>
            </div>
          )}

          {/* Rodapé Oficial de Validação e Assinatura (Exclusivo para Impressão) */}
          <div className="dossie-print-footer" aria-hidden="true">
            <div className="dossie-print-disclaimer">
              Declaro que os registros e intervenções acima refletem a evolução clínica fidedigna do paciente em acompanhamento,
              resguardados pelo Código de Ética Profissional do Psicólogo e normas vigentes do Conselho Federal de Psicologia (CFP).
            </div>
            <div className="dossie-print-sign-row">
              <div className="dossie-print-sign-box">
                <div className="dossie-print-sign-line"></div>
                <div className="dossie-print-sign-title">Assinatura do Profissional Responsável</div>
                <div className="dossie-print-sign-crp">Psicólogo(a) · CRP / CRM</div>
              </div>
              <div className="dossie-print-sign-box">
                <div className="dossie-print-sign-line"></div>
                <div className="dossie-print-sign-title">Carimbo Profissional</div>
                <div className="dossie-print-sign-crp">Local e Data</div>
              </div>
            </div>
            <div className="dossie-print-page-foot">
              Documento emitido eletronicamente pela plataforma NeuroAcervo · www.neuroacervo.com.br
            </div>
          </div>
        </div>

        {/* Modal de Novo Paciente / Editar Paciente */}
        {(modal === 'novo' || modal === 'editar') && (
          <div className="dx-modal-backdrop" onClick={() => setModal(null)}>
            <div className="dx-modal-card" onClick={(e) => e.stopPropagation()}>
              <h3 className="dx-modal-title">
                {modal === 'novo' ? 'Novo Paciente / Caso' : `Editar ${pacienteAtual?.codigo}`}
              </h3>
              <p className="dx-modal-desc">
                Identifique o paciente por um código desidentificado (ex: <code>Paciente 01</code>, <code>P-014</code>) em conformidade com o CFP.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px', fontWeight: 600 }}>
                  Código do Paciente
                  <input
                    type="text"
                    value={formCodigo}
                    onChange={(e) => setFormCodigo(e.target.value)}
                    placeholder="Ex: Paciente 02"
                    style={{
                      height: '42px',
                      padding: '0 12px',
                      borderRadius: '8px',
                      border: '1px solid #e2d9c6',
                      background: '#fff'
                    }}
                    autoFocus
                  />
                </label>

                <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px', fontWeight: 600 }}>
                  Anotação / Demanda Inicial (opcional)
                  <input
                    type="text"
                    value={formNota}
                    onChange={(e) => setFormNota(e.target.value)}
                    placeholder="Ex: Foco em regulação emocional e TCC"
                    style={{
                      height: '42px',
                      padding: '0 12px',
                      borderRadius: '8px',
                      border: '1px solid #e2d9c6',
                      background: '#fff'
                    }}
                  />
                </label>
              </div>

              <div className="dx-modal-actions">
                <button type="button" className="btn btn-ghost" onClick={() => setModal(null)}>
                  Cancelar
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={salvarModalPaciente}
                  disabled={salvandoModal}
                >
                  {salvandoModal ? 'Salvando...' : modal === 'novo' ? 'Criar Paciente' : 'Salvar Alterações'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Exclusão de Caso */}
        {modal === 'excluir' && pacienteAtual && (
          <div className="dx-modal-backdrop" onClick={() => setModal(null)}>
            <div className="dx-modal-card" onClick={(e) => e.stopPropagation()}>
              <h3 className="dx-modal-title" style={{ color: '#a8261d' }}>
                Excluir caso de {pacienteAtual.codigo}?
              </h3>
              <p className="dx-modal-desc">
                Esta ação removerá o paciente e todos os seus registros de sessões, dramatizações e histórias do prontuário. Essa operação não pode ser desfeita.
              </p>
              <div className="dx-modal-actions">
                <button type="button" className="btn btn-ghost" onClick={() => setModal(null)}>
                  Cancelar
                </button>
                <button
                  type="button"
                  className="btn"
                  style={{ background: '#a8261d', color: '#fff', borderColor: '#a8261d' }}
                  onClick={confirmarExcluirPaciente}
                  disabled={salvandoModal}
                >
                  {salvandoModal ? 'Excluindo...' : 'Excluir Definitivamente'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Toast Notificação */}
        <div className={`dossie-toast ${toastMsg ? 'show' : ''}`} role="status" aria-live="polite">
          {toastMsg}
        </div>
      </div>
    </PlatformShell>
  );
}

export default function DossieClinicoPage() {
  return (
    <Suspense
      fallback={
        <div
          className="dossie-root"
          style={{ minHeight: '100vh', background: '#efe8d8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <p className="muted">Carregando Dossiê Clínico...</p>
        </div>
      }
    >
      <DossieClinicoInner />
    </Suspense>
  );
}
