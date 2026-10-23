'use client';

import React, { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  getAllUserInteractiveSessions,
  getInteractiveSession,
  saveInteractiveSession,
  StoredSessionRecord,
  EvolucaoSessionData
} from '@/lib/supabase';
import { HISTORIAS } from '@/data/historiasClinicas';
import './evolucao-detalhe.css';

function tituloHistoria(resourceId: string) {
  const [faixaId, numStr] = resourceId.split('_');
  const num = parseInt(numStr, 10);
  const story = (HISTORIAS[faixaId] || []).find((h) => h.num === num);
  return story?.titulo || `História clínica #${numStr || resourceId}`;
}

/* =========================================================================
   Ícones Sprite Auxiliares
   ========================================================================= */

function IconSprite() {
  return (
    <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true">
      <symbol id="i-back" viewBox="0 0 24 24">
        <path d="M19 12H5M12 19l-7-7 7-7" />
      </symbol>
      <symbol id="i-print" viewBox="0 0 24 24">
        <path d="M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2M6 14h12v8H6z" />
      </symbol>
      <symbol id="i-check" viewBox="0 0 24 24">
        <path d="M20 6 9 17l-5-5" />
      </symbol>
      <symbol id="i-plus" viewBox="0 0 24 24">
        <path d="M12 5v14M5 12h14" />
      </symbol>
      <symbol id="i-refresh" viewBox="0 0 24 24">
        <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
      </symbol>
      <symbol id="i-book" viewBox="0 0 24 24">
        <path d="M2 4h6a4 4 0 0 1 4 4v12a3 3 0 0 0-3-3H2zM22 4h-6a4 4 0 0 0-4 4v12a3 3 0 0 1 3-3h7z" />
      </symbol>
      <symbol id="i-drama" viewBox="0 0 48 48">
        <path d="M10 8h12a5 5 0 0 1 5 5v6a5 5 0 0 1-5 5h-8l-5 4.2v-4.6a5 5 0 0 1-4-4.9V13a5 5 0 0 1 5-5z" fill="currentColor" fillOpacity=".18" />
        <path d="M10.5 14h11M10.5 18h7" />
        <path d="M26 19h12a5 5 0 0 1 5 5v5.7a5 5 0 0 1-4 4.9v4.6l-5-4.2h-8a5 5 0 0 1-5-5v-6a5 5 0 0 1 5-5z" fill="#e3f2cc" />
        <path d="M27.5 26.6l2.6 2.6 5.4-5.4" />
        <path d="M31.5 7.5a8 8 0 0 1 8.5 7" />
        <path d="M38 12.8l2 1.9 1.9-2.2" />
        <path d="M16.5 40.5a8 8 0 0 1-8.5-7" />
        <path d="M10 35.2l-2-1.9-1.9 2.2" />
      </symbol>
      <symbol id="i-user" viewBox="0 0 24 24">
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21v-1a6 6 0 0 1 6-6h4a6 6 0 0 1 6 6v1" />
      </symbol>
      <symbol id="i-lock" viewBox="0 0 24 24">
        <rect x="4" y="11" width="16" height="10" rx="2" />
        <path d="M8 11V7a4 4 0 0 1 8 0v4" />
      </symbol>
      <symbol id="i-cal" viewBox="0 0 24 24">
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <path d="M16 2v4M8 2v4M3 10h18" />
      </symbol>
      <symbol id="i-evo" viewBox="0 0 48 48">
        <path d="M4 40.5h40" />
        <path d="M9.5 40.5v-3.5" />
        <path
          d="M9.5 37.5c-2.4-.1-3.8-1.6-3.9-3.6 2.2.1 3.8 1.5 3.9 3.6z"
          fill="#a9b897"
          fillOpacity=".55"
        />
        <path d="M22 40.5v-10" />
        <path
          d="M22 33.5c-3.3-.1-5.5-2.3-5.6-5.2 3.1.1 5.4 2.2 5.6 5.2z"
          fill="#a9b897"
          fillOpacity=".55"
        />
        <path
          d="M22 31c.1-3.3 2.3-5.5 5.2-5.6-.1 3.1-2.2 5.4-5.2 5.6z"
          fill="#a9b897"
          fillOpacity=".55"
        />
        <path d="M37 40.5V20" />
        <path
          d="M37 32.5c-3.8-.1-6.4-2.6-6.5-6 3.6.1 6.3 2.6 6.5 6z"
          fill="#a9b897"
          fillOpacity=".55"
        />
        <path
          d="M37 28c.1-3.8 2.6-6.4 6-6.5-.1 3.6-2.6 6.3-6 6.5z"
          fill="#a9b897"
          fillOpacity=".55"
        />
        <path
          d="M37 21.5c-2.7-.6-4.2-2.8-3.8-5.5 2.6.5 4.2 2.7 3.8 5.5z"
          fill="#a9b897"
          fillOpacity=".55"
        />
        <path d="M8 16.5c8-6 18-8 27-5.5" strokeDasharray="2.4 2.6" />
        <path d="M32.2 8.2l3.2 2.6-2.4 3.4" />
      </symbol>
    </svg>
  );
}

const HUMOR_LABELS = [
  'Muito rebaixado',
  'Muito rebaixado',
  'Rebaixado',
  'Rebaixado',
  'Instável',
  'Razoável',
  'Razoável / estável',
  'Bom',
  'Bom',
  'Ótimo',
  'Pleno'
];

const COMPORTAMENTOS_DEFAULT = [
  'Calmo(a)',
  'Ansioso(a)',
  'Triste ou rebaixado(a)',
  'Eutímico(a)',
  'Receptivo(a)',
  'Reflexivo(a)',
  'Mobilizado(a) emocionalmente',
  'Sobrecarregado(a)',
  'Resistente ou evitativo(a)'
];

const TECNICAS_DEFAULT = [
  'Dramatização dos dois lados',
  'História clínica',
  'Registro de pensamentos',
  'Psicoeducação',
  'Exame das evidências',
  'Respiração e relaxamento'
];

function formatarDataCurta(iso?: string): string {
  if (!iso) return '';
  try {
    const raw = iso.includes('T') ? iso.split('T')[0] : iso;
    const partes = raw.split('-');
    if (partes.length === 3) {
      const d = new Date(Number(partes[0]), Number(partes[1]) - 1, Number(partes[2]));
      return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
    }
    return iso;
  } catch {
    return iso;
  }
}

/* =========================================================================
   Componente Principal de Conteúdo
   ========================================================================= */

function EvolucaoContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const pacienteCodigo = searchParams.get('paciente') || 'Paciente 01';
  const resourceIdParam = searchParams.get('resourceId') || searchParams.get('id') || '';
  const isNovo = searchParams.get('novo') === '1' || !resourceIdParam;

  // Estado do formulário - Começa em branco por padrão
  const [sessao, setSessao] = useState<number>(1);
  const [data, setData] = useState<string>(() => new Date().toISOString().slice(0, 10));
  const [duracao, setDuracao] = useState<string>('50');
  const [modalidade, setModalidade] = useState<'Presencial' | 'Online'>('Presencial');

  // Seção 2: Como o paciente chegou (começa vazio)
  const [humor, setHumor] = useState<number | null>(null);
  const [comportamentos, setComportamentos] = useState<string[]>([]);
  const [obs, setObs] = useState<string>('');

  // Seção 3: O que aconteceu na sessão (começa vazio)
  const [temas, setTemas] = useState<string>('');
  const [tecnicas, setTecnicas] = useState<string[]>([]);
  const [intervencoes, setIntervencoes] = useState<string>('');
  const [resposta, setResposta] = useState<string>('');

  // Seção 4: Combinados e próximos passos (começa vazio)
  const [combinados, setCombinados] = useState<string>('');
  const [proxima, setProxima] = useState<string>('');
  const [encaminhamentos, setEncaminhamentos] = useState<string>('');

  // Recursos interativos vinculados à sessão
  const [recursosDisponiveis, setRecursosDisponiveis] = useState<StoredSessionRecord[]>([]);
  const [recursosVinculados, setRecursosVinculados] = useState<string[]>([]);

  // Sessão anterior real e histórico recuperados do banco
  const [ultimaEvolucao, setUltimaEvolucao] = useState<EvolucaoSessionData | null>(null);
  const [historicoHumor, setHistoricoHumor] = useState<{ num: number; humor: number }[]>([]);

  // Status de salvamento e feedback
  const [statusText, setStatusText] = useState<string>('Pronto para registrar');
  const [isPending, setIsPending] = useState<boolean>(false);
  const [toast, setToast] = useState<string | null>(null);

  const debounceTimer = useRef<NodeJS.Timeout | null>(null);
  const toastTimer = useRef<NodeJS.Timeout | null>(null);

  const avisar = (msg: string) => {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2500);
  };

  // Carrega sessões reais do paciente para recuperar a anterior e calcular o número da sessão
  useEffect(() => {
    let ativo = true;

    async function carregar() {
      try {
        const todas = await getAllUserInteractiveSessions();
        if (!ativo) return;

        const doPaciente = todas.filter(
          (s) => (s.patient_code || '').trim().toLowerCase() === pacienteCodigo.trim().toLowerCase()
        );

        // Recursos interativos disponíveis do paciente (dramatizações e histórias)
        const recursos = doPaciente.filter(
          (s) => s.resource_type === 'dramatizacao' || s.resource_type === 'historia' || s.resource_type === 'hist'
        );
        setRecursosDisponiveis(recursos);

        // Ordena da mais recente para a mais antiga
        const evols = doPaciente
          .filter((s) => s.resource_type === 'evolucao')
          .sort((a, b) => {
            const numA = (a.data as EvolucaoSessionData)?.numeroSessao ?? 0;
            const numB = (b.data as EvolucaoSessionData)?.numeroSessao ?? 0;
            if (numB !== numA) return numB - numA;
            return (b.updated_at || b.created_at || '').localeCompare(a.updated_at || a.created_at || '');
          });

        // 1. Identifica a sessão anterior real (se existir)
        const anteriores = evols.filter((s) => s.resource_id !== resourceIdParam && s.id !== resourceIdParam);
        if (anteriores.length > 0 && anteriores[0].data) {
          const ult = anteriores[0].data as EvolucaoSessionData;
          setUltimaEvolucao(ult);

          // Extrai o histórico real de humor de até 4 sessões passadas em ordem cronológica
          const humoresReais: { num: number; humor: number }[] = [];
          const cronologicas = [...anteriores].slice(0, 4).reverse();
          for (const s of cronologicas) {
            const d = s.data as EvolucaoSessionData;
            if (d && typeof d.humor === 'number') {
              humoresReais.push({
                num: d.numeroSessao || humoresReais.length + 1,
                humor: d.humor
              });
            }
          }
          setHistoricoHumor(humoresReais);
        } else {
          setUltimaEvolucao(null);
          setHistoricoHumor([]);
        }

        // 2. Se estiver editando uma sessão existente, carrega seus dados salvos
        if (resourceIdParam) {
          const sessaoAtual = await getInteractiveSession('evolucao', resourceIdParam, pacienteCodigo);
          if (sessaoAtual && ativo) {
            const d = sessaoAtual as EvolucaoSessionData;
            if (d.numeroSessao) setSessao(d.numeroSessao);
            if (d.dataSessao) setData(d.dataSessao);
            if (d.duracao) setDuracao(d.duracao);
            if (d.modalidade) {
              setModalidade(d.modalidade.toLowerCase() === 'online' ? 'Online' : 'Presencial');
            }
            if (typeof d.humor === 'number') setHumor(d.humor);
            if (Array.isArray(d.comportamento)) setComportamentos(d.comportamento);
            if (d.obs) setObs(d.obs);
            if (d.temas || d.temasAbordados) setTemas(d.temas || d.temasAbordados || '');
            if (Array.isArray(d.tecnicas)) setTecnicas(d.tecnicas);
            if (d.intervencoes) setIntervencoes(d.intervencoes);
            if (d.resposta || d.evolucaoClinica) setResposta(d.resposta || d.evolucaoClinica || '');
            if (d.combinados || d.tarefasCombinados) setCombinados(d.combinados || d.tarefasCombinados || '');
            if (d.proxima || d.planoProximaSessao) setProxima(d.proxima || d.planoProximaSessao || '');
            if (d.encaminhamentos) setEncaminhamentos(d.encaminhamentos);
            if (Array.isArray(d.recursosVinculados)) setRecursosVinculados(d.recursosVinculados);
            setStatusText('Sessão carregada');
            return;
          }
        }

        // 3. Se for uma nova sessão, começa 100% em branco com o próximo número sequencial
        if (isNovo && ativo) {
          const proximoNum = evols.length > 0 ? (evols[0].data as EvolucaoSessionData)?.numeroSessao ? ((evols[0].data as EvolucaoSessionData).numeroSessao + 1) : (evols.length + 1) : 1;
          setSessao(proximoNum);
          setHumor(null);
          setComportamentos([]);
          setObs('');
          setTemas('');
          setTecnicas([]);
          setIntervencoes('');
          setResposta('');
          setCombinados('');
          setProxima('');
          setEncaminhamentos('');
          setStatusText('Nova evolução');
        }
      } catch (err) {
        console.warn('Erro ao carregar dados de evolução:', err);
      }
    }

    carregar();
    return () => {
      ativo = false;
    };
  }, [pacienteCodigo, resourceIdParam, isNovo]);

  // Checagem de conclusão de cada seção
  const s1Ok = !!(sessao && data && duracao && modalidade);
  const s2Ok = humor !== null;
  const s3Ok = !!(temas.trim() && resposta.trim());
  const s4Ok = !!combinados.trim();

  const completasCount = useMemo(() => {
    let c = 0;
    if (s1Ok) c++;
    if (s2Ok) c++;
    if (s3Ok) c++;
    if (s4Ok) c++;
    return c;
  }, [s1Ok, s2Ok, s3Ok, s4Ok]);

  // Salvar no prontuário e/ou rascunho
  const salvar = async (final = false) => {
    const dados: EvolucaoSessionData = {
      numeroSessao: Number(sessao) || 1,
      dataSessao: data,
      duracao,
      modalidade,
      humor,
      comportamento: comportamentos,
      obs: obs.trim(),
      estadoEmocional: [comportamentos.join(', '), obs.trim()].filter(Boolean).join(' · '),
      temas: temas.trim(),
      temasAbordados: temas.trim(),
      tecnicas,
      intervencoes: [tecnicas.join(', '), intervencoes.trim()].filter(Boolean).join('\n'),
      resposta: resposta.trim(),
      evolucaoClinica: resposta.trim(),
      combinados: combinados.trim(),
      tarefasCombinados: combinados.trim(),
      proxima: proxima.trim(),
      planoProximaSessao: proxima.trim(),
      encaminhamentos: encaminhamentos.trim(),
      recursosVinculados,
      updatedAt: new Date().toISOString()
    };

    // Cache local por paciente
    try {
      localStorage.setItem(`na_evolucao_draft_${pacienteCodigo}`, JSON.stringify(dados));
    } catch {}

    const hora = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    if (!final) {
      setIsPending(false);
      setStatusText(`Rascunho salvo às ${hora}`);
      return;
    }

    // Salvamento final no prontuário (Supabase)
    setIsPending(true);
    setStatusText('Salvando no prontuário…');

    try {
      const resourceId = resourceIdParam || `sessao_${sessao}`;
      await saveInteractiveSession('evolucao', resourceId, pacienteCodigo, dados);
      setIsPending(false);
      setStatusText(`Salvo no prontuário às ${hora}`);
      avisar('Evolução gravada com sucesso no prontuário!');
    } catch (err) {
      console.error(err);
      setIsPending(false);
      setStatusText('Erro ao salvar no prontuário');
      avisar('Erro ao sincronizar na nuvem. Rascunho mantido localmente.');
    }
  };

  // Disparo com debounce ao digitar
  const triggerAutoSave = () => {
    setIsPending(true);
    setStatusText('Salvando…');
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      salvar(false);
    }, 700);
  };

  // Atalho de teclado Ctrl+S / Cmd+S
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        salvar(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [sessao, data, duracao, modalidade, humor, comportamentos, obs, temas, tecnicas, intervencoes, resposta, combinados, proxima, encaminhamentos, recursosVinculados]);

  // Alterna chip
  const toggleChip = (
    list: string[],
    setList: React.Dispatch<React.SetStateAction<string[]>>,
    item: string
  ) => {
    setList((prev) => {
      const next = prev.includes(item) ? prev.filter((x) => x !== item) : [...prev, item];
      return next;
    });
    triggerAutoSave();
  };

  // Alterna vinculação de um recurso interativo à sessão
  const toggleRecursoVinculado = (rec: StoredSessionRecord) => {
    const recId = rec.id || `${rec.resource_type}_${rec.resource_id}`;
    const jaVinculado = recursosVinculados.includes(recId);
    let novos: string[];
    if (jaVinculado) {
      novos = recursosVinculados.filter((id) => id !== recId);
      avisar('Recurso desvinculado desta sessão.');
    } else {
      novos = [...recursosVinculados, recId];
      // Marca automaticamente a técnica correspondente nos chips
      const nomeTec = rec.resource_type === 'dramatizacao' ? 'Dramatização dos dois lados' : 'História clínica';
      setTecnicas((prev) => (prev.includes(nomeTec) ? prev : [...prev, nomeTec]));
      avisar('Recurso vinculado à sessão!');
    }
    setRecursosVinculados(novos);
    triggerAutoSave();
  };

  // Puxa síntese dos resultados do recurso para o campo de Resposta do Paciente
  const puxarSinteseRecurso = (rec: StoredSessionRecord) => {
    const d = (rec.data || {}) as Record<string, any>;
    let sintese = '';
    if (rec.resource_type === 'dramatizacao') {
      const pens = d.pensamento || 'Pensamento automático';
      const cIni = typeof d.crencaIni === 'number' ? d.crencaIni : 85;
      const cFim = typeof d.crencaFim === 'number' ? d.crencaFim : 40;
      const emocao = d.emocao || 'Ansiedade';
      const eIni = typeof d.emocaoIni === 'number' ? d.emocaoIni : 80;
      const eFim = typeof d.emocaoFim === 'number' ? d.emocaoFim : 45;
      sintese = `Dramatização dos dois lados: "${pens}". A crença no pensamento caiu de ${cIni}% para ${cFim}%. Emoção trabalhada: ${emocao} (${eIni}% → ${eFim}%). O paciente formulou respostas assertivas que reduziram a autocrítica.`;
    } else {
      const titulo = d.titulo || tituloHistoria(rec.resource_id);
      const etapasCount = Array.isArray(d.etapas) ? d.etapas.length : 3;
      sintese = `História clínica estruturada: "${titulo}". Cumpridas ${etapasCount} etapas de observação, compreensão e plano de ação com reestruturação cognitiva.`;
    }

    setResposta((prev) => {
      const p = prev.trim();
      return p ? `${p}\n\n${sintese}` : sintese;
    });

    const nomeTec = rec.resource_type === 'dramatizacao' ? 'Dramatização dos dois lados' : 'História clínica';
    setTecnicas((prev) => (prev.includes(nomeTec) ? prev : [...prev, nomeTec]));

    triggerAutoSave();
    avisar('Síntese do recurso importada para a Resposta do Paciente!');
  };

  // Recarrega recursos do paciente caso o profissional tenha acabado de realizar um em outra aba
  const recarregarRecursos = async () => {
    try {
      const todas = await getAllUserInteractiveSessions();
      const doPaciente = todas.filter(
        (s) => (s.patient_code || '').trim().toLowerCase() === pacienteCodigo.trim().toLowerCase()
      );
      const recursos = doPaciente.filter(
        (s) => s.resource_type === 'dramatizacao' || s.resource_type === 'historia' || s.resource_type === 'hist'
      );
      setRecursosDisponiveis(recursos);
      avisar('Lista de recursos interativos atualizada!');
    } catch {
      avisar('Erro ao atualizar recursos.');
    }
  };

  // Recupera dados da sessão anterior para a sessão atual
  const puxarCombinadosAnteriores = () => {
    if (!ultimaEvolucao) {
      avisar('Nenhuma evolução anterior encontrada para este paciente.');
      return;
    }
    const c = ultimaEvolucao.combinados || ultimaEvolucao.tarefasCombinados;
    const p = ultimaEvolucao.proxima || ultimaEvolucao.planoProximaSessao;

    if (!c && !p) {
      avisar('A sessão anterior não possui combinados específicos registrados.');
      return;
    }

    const notas: string[] = [];
    if (c) notas.push(`Acompanhamento de combinados da Sessão #${ultimaEvolucao.numeroSessao}: ${c}`);
    if (p) notas.push(`Retomada planejada: ${p}`);

    setTemas((prev) => {
      const t = prev.trim();
      const novo = notas.join('\n');
      return t ? `${t}\n\n${novo}` : novo;
    });

    triggerAutoSave();
    avisar('Combinados da sessão anterior integrados nos temas!');
  };

  // Cálculo da variação de humor em relação à sessão anterior real
  const diffHumor = useMemo(() => {
    if (humor === null || !ultimaEvolucao || typeof ultimaEvolucao.humor !== 'number') return null;
    return humor - ultimaEvolucao.humor;
  }, [humor, ultimaEvolucao]);

  // Geração dinâmica do Sparkline SVG com histórico real
  const sparklineSvg = useMemo(() => {
    const pontosPassados = historicoHumor;

    // Se não há histórico passado e humor não foi marcado hoje
    if (pontosPassados.length === 0 && humor === null) {
      return (
        <text x="140" y="48" fontFamily="Inter, sans-serif" fontSize="12" textAnchor="middle" fill="#6a6555">
          Histórico começará a partir desta sessão
        </text>
      );
    }

    const lista = pontosPassados.map((p) => ({
      label: `nº ${p.num}`,
      val: p.humor,
      isToday: false
    }));

    if (humor !== null) {
      lista.push({
        label: 'Hoje',
        val: humor,
        isToday: true
      });
    }

    const W = 280;
    const H = 90;
    const x0 = 24;
    const x1 = 256;
    const totalPontos = lista.length + (humor === null ? 1 : 0);
    const n = Math.max(2, totalPontos);

    const X = (i: number) => x0 + ((x1 - x0) * i) / (n - 1);
    const Y = (v: number) => 68 - Math.max(0, Math.min(10, v)) * 5.2;

    const points = lista.map((p, i) => `${X(i)},${Y(p.val)}`).join(' ');

    return (
      <>
        <line x1="0" y1="68" x2="280" y2="68" stroke="#e2d9c6" />
        {lista.length > 1 && (
          <polyline points={points} fill="none" stroke="#2b5c35" strokeWidth="2.5" strokeLinejoin="round" />
        )}
        {lista.map((p, i) => {
          return (
            <React.Fragment key={i}>
              <circle
                cx={X(i)}
                cy={Y(p.val)}
                r={p.isToday ? 5 : 4}
                fill={p.isToday ? '#2b5c35' : '#fcfbf7'}
                stroke="#2b5c35"
                strokeWidth="2"
              />
              <text
                x={X(i)}
                y={Y(p.val) - 9}
                fontFamily="IBM Plex Mono, monospace"
                fontSize="11"
                textAnchor="middle"
                fill="#1f2620"
              >
                {p.val}
              </text>
              <text
                x={X(i)}
                y="85"
                fontFamily="Inter, sans-serif"
                fontSize="10"
                textAnchor="middle"
                fill="#6a6555"
              >
                {p.label}
              </text>
            </React.Fragment>
          );
        })}
        {humor === null && lista.length > 0 && (
          <>
            <circle
              cx={X(n - 1)}
              cy={Y(lista[lista.length - 1].val)}
              r="4"
              fill="none"
              stroke="#a39a85"
              strokeDasharray="2 2"
            />
            <text
              x={X(n - 1)}
              y="85"
              fontFamily="Inter, sans-serif"
              fontSize="10"
              textAnchor="middle"
              fill="#a39a85"
            >
              Hoje
            </text>
          </>
        )}
      </>
    );
  }, [historicoHumor, humor]);

  return (
    <div className="ev-root">
      <IconSprite />

      {/* Barra superior fixa */}
      <header className="top">
        <div className="top-in">
          <div className="ttl">
            <span className="ttl-ico">
              <svg width="30" height="30" viewBox="0 0 48 48" fill="none" stroke="#56704f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <use href="#i-evo" />
              </svg>
            </span>
            <div style={{ minWidth: 0 }}>
              <Link
                href={`/recursos-interativos/pacientes?paciente=${encodeURIComponent(pacienteCodigo)}`}
                className="back"
              >
                <svg className="icon icon-sm">
                  <use href="#i-back" />
                </svg>
                Dossiê · {pacienteCodigo}
              </Link>
              <h1>Evolução da sessão</h1>
            </div>
          </div>

          <span className={`status ${isPending ? 'pending' : ''}`} id="status" role="status" aria-live="polite">
            <i />
            <span>{statusText}</span>
          </span>

          <Link
            href={`/recursos-interativos/pacientes/evolucoes?paciente=${encodeURIComponent(pacienteCodigo)}`}
            className="btn"
            style={{ textDecoration: 'none' }}
            title="Ver todas as evoluções deste paciente"
          >
            <svg className="icon">
              <use href="#i-cal" />
            </svg>
            Ver todas as evoluções
          </Link>

          <button
            type="button"
            className="btn"
            onClick={() => window.print()}
          >
            <svg className="icon">
              <use href="#i-print" />
            </svg>
            Imprimir
          </button>

          <button
            type="button"
            className="btn btn-primary"
            onClick={() => salvar(true)}
          >
            <svg className="icon">
              <use href="#i-check" />
            </svg>
            Salvar no prontuário
          </button>
        </div>
      </header>

      {/* Conteúdo principal */}
      <div className="page">
        <form className="form" id="f" onSubmit={(e) => e.preventDefault()}>
          {/* Seção 1: Atendimento */}
          <section className={`card sec ${s1Ok ? 'ok' : ''}`} id="s1">
            <div className="sec-head">
              <span className="sec-n">1</span>
              <div>
                <h2>Atendimento</h2>
                <p>Dados da sessão de hoje.</p>
              </div>
              <span className="done">
                <svg className="icon icon-sm">
                  <use href="#i-check" />
                </svg>
                Completo
              </span>
            </div>

            <div className="grid">
              <div className="field">
                <label htmlFor="sessao">Sessão nº</label>
                <input
                  id="sessao"
                  name="sessao"
                  className="input mono"
                  type="number"
                  min="1"
                  value={sessao}
                  onChange={(e) => {
                    setSessao(parseInt(e.target.value, 10) || 1);
                    triggerAutoSave();
                  }}
                />
              </div>

              <div className="field">
                <label htmlFor="data">Data</label>
                <input
                  id="data"
                  name="data"
                  className="input"
                  type="date"
                  value={data}
                  onChange={(e) => {
                    setData(e.target.value);
                    triggerAutoSave();
                  }}
                />
              </div>

              <div className="field">
                <span className="lbl" id="l-dur">
                  Duração <small>(min)</small>
                </span>
                <div className="seg" role="group" aria-labelledby="l-dur">
                  {['30', '45', '50', '60'].map((d) => (
                    <button
                      key={d}
                      type="button"
                      aria-pressed={duracao === d}
                      onClick={() => {
                        setDuracao(d);
                        triggerAutoSave();
                      }}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              <div className="field">
                <span className="lbl" id="l-mod">Modalidade</span>
                <div className="seg" role="group" aria-labelledby="l-mod">
                  {(['Presencial', 'Online'] as const).map((m) => (
                    <button
                      key={m}
                      type="button"
                      aria-pressed={modalidade === m}
                      onClick={() => {
                        setModalidade(m);
                        triggerAutoSave();
                      }}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Seção 2: Como o paciente chegou */}
          <section className={`card sec ${s2Ok ? 'ok' : ''}`} id="s2">
            <div className="sec-head">
              <span className="sec-n">2</span>
              <div>
                <h2>Como o paciente chegou</h2>
                <p>Humor e comportamento observados.</p>
              </div>
              <span className="done">
                <svg className="icon icon-sm">
                  <use href="#i-check" />
                </svg>
                Completo
              </span>
            </div>

            <div className="mood">
              <div className="mood-top">
                <span className="lbl" id="l-humor">
                  Humor observado <small>de 0 a 10</small>
                </span>
                <span className={`mood-val ${humor === null ? 'none' : ''}`} id="humor-lbl">
                  {humor === null
                    ? 'Não marcado'
                    : `${humor} · ${HUMOR_LABELS[humor]}${
                        diffHumor !== null && diffHumor !== 0
                          ? ` (${diffHumor > 0 ? '+' : '−'}${Math.abs(diffHumor)} desde a anterior)`
                          : ''
                      }`}
                </span>
              </div>

              <div className="scale" role="group" aria-labelledby="l-humor" id="scale">
                {Array.from({ length: 11 }, (_, i) => {
                  const isSelected = humor === i;
                  const isFill = humor !== null && i < humor;
                  return (
                    <button
                      key={i}
                      type="button"
                      aria-pressed={isSelected}
                      aria-label={`${i}, ${HUMOR_LABELS[i]}`}
                      className={isFill ? 'fill' : ''}
                      onClick={() => {
                        setHumor(humor === i ? null : i);
                        triggerAutoSave();
                      }}
                    >
                      {i}
                    </button>
                  );
                })}
              </div>

              <div className="scale-ends">
                <span>0 · Muito rebaixado</span>
                <span className="prev-mark">
                  {ultimaEvolucao && typeof ultimaEvolucao.humor === 'number'
                    ? `Sessão anterior: ${ultimaEvolucao.humor}`
                    : 'Sem registro anterior'}
                </span>
                <span>10 · Pleno</span>
              </div>
            </div>

            <div className="field">
              <div className="group-lbl">
                <span className="lbl" id="l-comp">
                  Comportamento observado <small>(marque o que se aplica)</small>
                </span>
              </div>
              <div className="chips" role="group" aria-labelledby="l-comp">
                {COMPORTAMENTOS_DEFAULT.map((c) => {
                  const selected = comportamentos.includes(c);
                  return (
                    <button
                      key={c}
                      type="button"
                      className="chip"
                      aria-pressed={selected}
                      onClick={() => toggleChip(comportamentos, setComportamentos, c)}
                    >
                      <svg className="icon icon-sm">
                        <use href="#i-check" />
                      </svg>
                      {c}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="field">
              <label htmlFor="obs">
                Observações <small>(opcional)</small>
              </label>
              <textarea
                id="obs"
                name="obs"
                className="ta"
                rows={2}
                placeholder="Ex.: discurso coerente e orientado, chegou pontual, contato visual mantido."
                value={obs}
                onChange={(e) => {
                  setObs(e.target.value);
                  triggerAutoSave();
                }}
              />
            </div>
          </section>

          {/* Seção 3: O que aconteceu na sessão */}
          <section className={`card sec ${s3Ok ? 'ok' : ''}`} id="s3">
            <div className="sec-head">
              <span className="sec-n">3</span>
              <div>
                <h2>O que aconteceu na sessão</h2>
                <p>Temas, intervenções e como o paciente respondeu.</p>
              </div>
              <span className="done">
                <svg className="icon icon-sm">
                  <use href="#i-check" />
                </svg>
                Completo
              </span>
            </div>

            <div className="field">
              <label htmlFor="temas">Temas trabalhados</label>
              <textarea
                id="temas"
                name="temas"
                className="ta"
                rows={3}
                placeholder="Queixas e assuntos trazidos pelo paciente hoje."
                value={temas}
                onChange={(e) => {
                  setTemas(e.target.value);
                  triggerAutoSave();
                }}
              />
            </div>

            <div className="field">
              <span className="lbl" id="l-int">Intervenções e técnicas</span>
              <div className="chips" role="group" aria-labelledby="l-int">
                {TECNICAS_DEFAULT.map((t) => {
                  const selected = tecnicas.includes(t);
                  return (
                    <button
                      key={t}
                      type="button"
                      className="chip res"
                      aria-pressed={selected}
                      onClick={() => toggleChip(tecnicas, setTecnicas, t)}
                    >
                      <svg className="icon icon-sm">
                        <use href="#i-check" />
                      </svg>
                      {t}
                    </button>
                  );
                })}
              </div>
              <textarea
                id="intervencoes"
                name="intervencoes"
                className="ta"
                rows={2}
                placeholder="Detalhe o que foi feito, se quiser."
                value={intervencoes}
                onChange={(e) => {
                  setIntervencoes(e.target.value);
                  triggerAutoSave();
                }}
              />
              <span className="hint">
                As dramatizações e histórias clínicas salvas pelo paciente podem ser vinculadas abaixo.
              </span>

              {/* Vinculação de recursos interativos realizados pelo paciente */}
              <div className="vinc-box">
                <div className="vinc-top">
                  <span className="vinc-title">
                    <svg className="icon icon-sm" style={{ color: 'var(--action)' }}>
                      <use href="#i-check" />
                    </svg>
                    Recursos interativos realizados pelo paciente
                  </span>
                  <div className="vinc-actions">
                    <a
                      href={`/recursos-interativos/dramatizacao?paciente=${encodeURIComponent(pacienteCodigo)}&sessao=${sessao}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-sm"
                      title="Abrir Dramatização em nova aba para aplicar nesta sessão"
                    >
                      <svg className="icon icon-sm">
                        <use href="#i-plus" />
                      </svg>
                      + Iniciar Dramatização
                    </a>
                    <a
                      href={`/recursos-interativos/historias?paciente=${encodeURIComponent(pacienteCodigo)}&sessao=${sessao}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-sm"
                      title="Abrir História Clínica em nova aba para aplicar nesta sessão"
                    >
                      <svg className="icon icon-sm">
                        <use href="#i-plus" />
                      </svg>
                      + Iniciar História
                    </a>
                    <button
                      type="button"
                      className="btn btn-sm btn-ghost"
                      onClick={recarregarRecursos}
                      title="Atualizar lista de recursos"
                    >
                      <svg className="icon icon-sm">
                        <use href="#i-refresh" />
                      </svg>
                      Atualizar
                    </button>
                  </div>
                </div>

                {recursosDisponiveis.length === 0 ? (
                  <p className="hint" style={{ margin: 0 }}>
                    Nenhum recurso interativo registrado ainda para este paciente. Use os botões acima para iniciar uma atividade durante o atendimento.
                  </p>
                ) : (
                  <div className="vinc-grid">
                    {recursosDisponiveis.map((rec) => {
                      const recId = rec.id || `${rec.resource_type}_${rec.resource_id}`;
                      const isVinculado = recursosVinculados.includes(recId);
                      const d = (rec.data || {}) as Record<string, any>;
                      const isDrama = rec.resource_type === 'dramatizacao';
                      const titulo = isDrama
                        ? `“${d.pensamento || 'Pensamento automático'}”`
                        : (d.titulo || tituloHistoria(rec.resource_id));
                      const dataFormatada = (d.dataSessao || rec.updated_at || rec.created_at || '').slice(0, 10);

                      return (
                        <div key={recId} className={`vinc-card ${isVinculado ? 'active' : ''}`}>
                          <div className="vinc-card-left">
                            <span className={`vinc-ico ${isDrama ? 'drama' : 'hist'}`}>
                              <svg className="icon" style={{ width: '20px', height: '20px' }}>
                                <use href={isDrama ? '#i-drama' : '#i-book'} />
                              </svg>
                            </span>
                            <div className="vinc-meta">
                              <strong>{titulo}</strong>
                              <span>
                                {isDrama ? 'Dramatização dos dois lados' : 'História clínica'}
                                {isDrama && typeof d.crencaIni === 'number' && typeof d.crencaFim === 'number' && (
                                  <> · Crença {d.crencaIni}% → {d.crencaFim}%</>
                                )}
                                {!isDrama && Array.isArray(d.etapas) && (
                                  <> · {d.etapas.length} etapas</>
                                )}
                                {dataFormatada && <> · {dataFormatada}</>}
                              </span>
                            </div>
                          </div>

                          <div className="vinc-btns">
                            {isVinculado && (
                              <button
                                type="button"
                                className="btn btn-sm btn-ghost"
                                onClick={() => puxarSinteseRecurso(rec)}
                                title="Importar resumo deste recurso para a resposta do paciente"
                              >
                                Puxar síntese
                              </button>
                            )}

                            <button
                              type="button"
                              className={`btn btn-sm ${isVinculado ? 'btn-primary' : ''}`}
                              onClick={() => toggleRecursoVinculado(rec)}
                            >
                              {isVinculado ? '✓ Vinculado' : 'Vincular à sessão'}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            <div className="field">
              <label htmlFor="resposta">Resposta do paciente</label>
              <textarea
                id="resposta"
                name="resposta"
                className="ta"
                rows={3}
                placeholder="Como reagiu às intervenções, o que percebeu, o que mudou."
                value={resposta}
                onChange={(e) => {
                  setResposta(e.target.value);
                  triggerAutoSave();
                }}
              />
            </div>
          </section>

          {/* Seção 4: Combinados e próximos passos */}
          <section className={`card sec ${s4Ok ? 'ok' : ''}`} id="s4">
            <div className="sec-head">
              <span className="sec-n">4</span>
              <div>
                <h2>Combinados e próximos passos</h2>
                <p>O que fica para a semana e para a próxima sessão.</p>
              </div>
              <span className="done">
                <svg className="icon icon-sm">
                  <use href="#i-check" />
                </svg>
                Completo
              </span>
            </div>

            <div className="field">
              <label htmlFor="combinados">Tarefa de casa e combinados</label>
              <textarea
                id="combinados"
                name="combinados"
                className="ta"
                rows={2}
                placeholder="Ex.: registrar dois pensamentos automáticos antes de reuniões."
                value={combinados}
                onChange={(e) => {
                  setCombinados(e.target.value);
                  triggerAutoSave();
                }}
              />
            </div>

            <div className="field">
              <label htmlFor="proxima">
                Para a próxima sessão <small>(opcional)</small>
              </label>
              <textarea
                id="proxima"
                name="proxima"
                className="ta"
                rows={2}
                placeholder="Temas a retomar, materiais a levar."
                value={proxima}
                onChange={(e) => {
                  setProxima(e.target.value);
                  triggerAutoSave();
                }}
              />
            </div>

            <div className="field">
              <label htmlFor="encaminhamentos">
                Encaminhamentos <small>(opcional)</small>
              </label>
              <input
                id="encaminhamentos"
                name="encaminhamentos"
                className="input"
                placeholder="Ex.: avaliação psiquiátrica, contato com a escola."
                value={encaminhamentos}
                onChange={(e) => {
                  setEncaminhamentos(e.target.value);
                  triggerAutoSave();
                }}
              />
            </div>
          </section>
        </form>

        {/* Barra lateral */}
        <aside className="side">
          <section className="card box">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <h3>Preenchimento</h3>
              <span className="mono" style={{ fontSize: 13 }} id="pct">
                {completasCount}/4
              </span>
            </div>
            <div className="progress">
              <i id="bar" style={{ width: `${completasCount * 25}%` }} />
            </div>
            <ul className="nav" id="nav">
              <li className={s1Ok ? 'ok' : ''}>
                <a href="#s1">
                  <span className="dot" />
                  Atendimento
                </a>
              </li>
              <li className={s2Ok ? 'ok' : ''}>
                <a href="#s2">
                  <span className="dot" />
                  Como o paciente chegou
                </a>
              </li>
              <li className={s3Ok ? 'ok' : ''}>
                <a href="#s3">
                  <span className="dot" />
                  O que aconteceu
                </a>
              </li>
              <li className={s4Ok ? 'ok' : ''}>
                <a href="#s4">
                  <span className="dot" />
                  Combinados
                </a>
              </li>
            </ul>
          </section>

          {/* Sessão anterior real recuperada do prontuário */}
          <section className="card box">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <h3>Sessão anterior</h3>
              <span className="muted" style={{ fontSize: 12 }}>
                {ultimaEvolucao?.dataSessao
                  ? `${formatarDataCurta(ultimaEvolucao.dataSessao)} · nº ${ultimaEvolucao.numeroSessao || 1}`
                  : 'Nenhuma anterior'}
              </span>
            </div>

            {ultimaEvolucao ? (
              <div className="prev">
                <div className="prev-row">
                  <span className="muted">Humor observado</span>
                  <b className="mono">
                    {typeof ultimaEvolucao.humor === 'number'
                      ? `${ultimaEvolucao.humor} / 10`
                      : 'Não registrado'}
                  </b>
                </div>

                <div className="prev-q">
                  <b>Combinado</b>
                  {ultimaEvolucao.combinados ||
                    ultimaEvolucao.tarefasCombinados ||
                    'Nenhum combinado específico registrado.'}
                </div>

                <div className="prev-q">
                  <b>Retomar</b>
                  {ultimaEvolucao.proxima ||
                    ultimaEvolucao.planoProximaSessao ||
                    'Nenhum ponto registrado para retomar.'}
                </div>

                {(ultimaEvolucao.combinados ||
                  ultimaEvolucao.tarefasCombinados ||
                  ultimaEvolucao.proxima ||
                  ultimaEvolucao.planoProximaSessao) && (
                  <button
                    type="button"
                    className="btn"
                    style={{ height: 34, fontSize: 12, marginTop: 4, width: '100%', justifyContent: 'center' }}
                    onClick={puxarCombinadosAnteriores}
                    title="Copiar combinados e retomada para os temas da sessão de hoje"
                  >
                    <svg className="icon icon-sm" style={{ width: 14, height: 14 }}>
                      <use href="#i-check" />
                    </svg>
                    Puxar combinados para hoje
                  </button>
                )}
              </div>
            ) : (
              <div className="prev">
                <div
                  className="prev-q"
                  style={{ color: 'var(--muted)', fontSize: 13, background: 'transparent', padding: '6px 0' }}
                >
                  Esta é a primeira evolução registrada para <strong>{pacienteCodigo}</strong>. O histórico de humor e os combinados serão acompanhados a partir desta sessão.
                </div>
              </div>
            )}

            <div className="spark">
              <span className="eyebrow">Humor nas últimas sessões</span>
              <svg viewBox="0 0 280 90" role="img" aria-label="Humor por sessão" id="spark">
                {sparklineSvg}
              </svg>
            </div>
          </section>

          <p className="lock">
            <svg className="icon icon-sm">
              <use href="#i-lock" />
            </svg>
            <span>Registro sob sigilo profissional (CFP e LGPD). Visível só para você.</span>
          </p>
        </aside>
      </div>

      {/* Toast de notificação */}
      <div className={`ev-toast ${toast ? 'ev-toast--show' : ''}`} role="status" aria-live="polite">
        {toast}
      </div>
    </div>
  );
}

export default function EvolucaoPage() {
  return (
    <Suspense
      fallback={
        <div style={{ padding: 40, textAlign: 'center', color: '#6a6555', background: '#efe8d8', minHeight: '100vh' }}>
          Carregando evolução da sessão…
        </div>
      }
    >
      <EvolucaoContent />
    </Suspense>
  );
}
