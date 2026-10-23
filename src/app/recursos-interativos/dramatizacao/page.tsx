'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useNeuro } from '@/context/NeuroContext';
import { PlatformShell } from '@/components/layout/PlatformShell';
import { resolveUserPlan } from '@/utils/userPlan';
import { PraticaGate } from '@/components/common/PraticaGate';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  RotateCw,
  Check,
  Plus,
  X,
  Star,
  Flag,
  RefreshCw,
  ArrowLeftRight,
  EyeOff,
  Printer,
  Download,
  Lock,
  Trash2,
  ChevronRight,
  Cloud,
  Shield,
  CornerDownLeft,
  Users,
  User
} from 'lucide-react';
import { 
  getInteractiveSession, 
  saveInteractiveSession, 
  deleteInteractiveSession,
  getUserInteractivePatients,
  saveUserPatient
} from '@/lib/supabase';
import './dramatizacao.css';

interface FalaItem {
  id: string;
  lado: 'neg' | 'rac';
  texto: string;
  rodada: number;
  autor: string;
  marcas: {
    funcionou?: boolean;
    nao?: boolean;
    dificil?: boolean;
    novo?: boolean;
  };
}

interface RegistroCrenca {
  rotulo: string;
  valor: number;
}

const KEY = 'na-dramatizacao-v1';
const EMOCOES = ['Ansiedade', 'Tristeza', 'Culpa', 'Vergonha', 'Raiva', 'Desesperança'];

export default function DramatizacaoPage() {
  const { currentUser } = useNeuro();
  const planInfo = resolveUserPlan(currentUser);

  // Estado geral
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [pensamento, setPensamento] = useState<string>('');
  const [emocao, setEmocao] = useState<string>('Ansiedade');
  const [emocaoOutra, setEmocaoOutra] = useState<string>('');
  const [emoIni, setEmoIni] = useState<number>(50);
  const [crencaIni, setCrencaIni] = useState<number>(50);
  const [racionalInicial, setRacionalInicial] = useState<'Terapeuta' | 'Paciente'>('Terapeuta');
  const [rodada, setRodada] = useState<number>(1);
  const [falas, setFalas] = useState<FalaItem[]>([]);
  const [crencas, setCrencas] = useState<RegistroCrenca[]>([]);
  const [emoFim, setEmoFim] = useState<number | null>(null);
  const [crencaFim, setCrencaFim] = useState<number | null>(null);
  const [pressupostos, setPressupostos] = useState<string>('');
  const [obs, setObs] = useState<string>('');
  const [codigo, setCodigo] = useState<string>('');
  const [pacientes, setPacientes] = useState<string[]>(['Paciente 01']);
  const [pacienteAtivo, setPacienteAtivo] = useState<string>('Paciente 01');
  const [showNovoPacienteModal, setShowNovoPacienteModal] = useState<boolean>(false);
  const [novoPacienteInput, setNovoPacienteInput] = useState<string>('');
  const [incluirResumo, setIncluirResumo] = useState<boolean>(true);
  const [incluirBranco, setIncluirBranco] = useState<boolean>(true);
  const [roteiro, setRoteiro] = useState<boolean>(true);

  // Controles de interface
  const [erroPensamento, setErroPensamento] = useState<boolean>(false);
  const [showBeliefModal, setShowBeliefModal] = useState<boolean>(false);
  const [tempCrencaSwap, setTempCrencaSwap] = useState<number>(50);
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Inputs controlados da arena
  const [textoNegativo, setTextoNegativo] = useState<string>('');
  const [textoRacional, setTextoRacional] = useState<string>('');
  const [mobileActiveCol, setMobileActiveCol] = useState<'neg' | 'rac'>('neg');
  const [whoSwap, setWhoSwap] = useState<boolean>(false);

  const inputNegRef = useRef<HTMLTextAreaElement>(null);
  const inputRacRef = useRef<HTMLTextAreaElement>(null);
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isInitialLoadRef = useRef<boolean>(true);
  const [salvandoStatus, setSalvandoStatus] = useState<'ok' | 'salvando'>('ok');

  // Exibir toast temporário
  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    toastTimeoutRef.current = setTimeout(() => {
      setToastMessage(null);
    }, 2200);
  }, []);

  // Helpers de papéis
  const outro = (p: string) => (p === 'Terapeuta' ? 'Paciente' : 'Terapeuta');
  const quemRacional = (r: number) => (r % 2 === 1 ? racionalInicial : outro(racionalInicial));
  const quemNegativo = (r: number) => outro(quemRacional(r));
  const emocaoNome = () => (emocao === 'Outra' ? emocaoOutra.trim() || 'Outra emoção' : emocao);
  const crencaAtual = () => (crencas.length ? crencas[crencas.length - 1].valor : crencaIni);
  const pacienteCode = (pacienteAtivo || codigo || 'Paciente 01').trim();

  // Carregar dados de um paciente específico (local + nuvem)
  const carregarSessaoPaciente = useCallback(async (pacienteAlvo: string, forcarInicioNovo: boolean = false) => {
    isInitialLoadRef.current = true;
    setSalvandoStatus('salvando');

    let dados: any = null;

    // 1. LocalStorage
    try {
      const raw = localStorage.getItem(`na_session_dramatizacao_arena_${pacienteAlvo}`) || 
                  (pacienteAlvo === 'Paciente 01' ? localStorage.getItem(KEY) : null);
      if (raw) dados = JSON.parse(raw);
    } catch (e) {
      console.warn('Erro ao ler cache local do paciente:', e);
    }

    // 2. Supabase
    try {
      const cloud = await getInteractiveSession('dramatizacao', 'arena', pacienteAlvo);
      if (cloud) {
        dados = { ...dados, ...cloud };
      }
    } catch (e) {
      console.warn('Erro ao ler Supabase:', e);
    }

    if (dados && (dados.pensamento || (Array.isArray(dados.falas) && dados.falas.length > 0))) {
      if (!forcarInicioNovo && dados.step) setStep(dados.step);
      else setStep(1);

      if (dados.pensamento !== undefined) setPensamento(dados.pensamento);
      if (dados.emocao) setEmocao(dados.emocao);
      if (dados.emocaoOutra !== undefined) setEmocaoOutra(dados.emocaoOutra);
      if (typeof dados.emoIni === 'number') setEmoIni(dados.emoIni);
      if (typeof dados.crencaIni === 'number') setCrencaIni(dados.crencaIni);
      if (dados.racionalInicial) setRacionalInicial(dados.racionalInicial);
      if (typeof dados.rodada === 'number') setRodada(dados.rodada);
      if (Array.isArray(dados.falas)) setFalas(dados.falas);
      if (Array.isArray(dados.crencas)) setCrencas(dados.crencas);
      if (dados.emoFim !== undefined) setEmoFim(dados.emoFim);
      if (dados.crencaFim !== undefined) setCrencaFim(dados.crencaFim);
      if (dados.pressupostos !== undefined) setPressupostos(dados.pressupostos);
      if (dados.obs !== undefined) setObs(dados.obs);
      if (typeof dados.incluirResumo === 'boolean') setIncluirResumo(dados.incluirResumo);
      if (typeof dados.incluirBranco === 'boolean') setIncluirBranco(dados.incluirBranco);
      if (typeof dados.roteiro === 'boolean') setRoteiro(dados.roteiro);
    } else {
      // Paciente sem sessão prévia: inicializa na Etapa 1
      setStep(1);
      setPensamento('');
      setEmocao('Ansiedade');
      setEmocaoOutra('');
      setEmoIni(50);
      setCrencaIni(50);
      setRacionalInicial('Terapeuta');
      setRodada(1);
      setFalas([]);
      setCrencas([]);
      setEmoFim(null);
      setCrencaFim(null);
      setPressupostos('');
      setObs('');
    }

    setSalvandoStatus('ok');
    setTimeout(() => {
      isInitialLoadRef.current = false;
    }, 350);
  }, []);

  // Troca de paciente pelo seletor
  const handleTrocarPaciente = (novo: string) => {
    setPacienteAtivo(novo);
    setCodigo(novo);
    carregarSessaoPaciente(novo, false);
  };

  // Criação de novo paciente com seleção imediata e persistência
  const handleCriarPaciente = async () => {
    const nomeLimpo = novoPacienteInput.trim();
    if (!nomeLimpo) return;
    if (!pacientes.includes(nomeLimpo)) {
      const novaLista = [...pacientes, nomeLimpo];
      setPacientes(novaLista);
      await saveUserPatient(nomeLimpo);
    }
    setPacienteAtivo(nomeLimpo);
    setCodigo(nomeLimpo);
    setNovoPacienteInput('');
    setShowNovoPacienteModal(false);

    // Inicia limpo na Etapa 1
    isInitialLoadRef.current = true;
    setStep(1);
    setPensamento('');
    setEmocao('Ansiedade');
    setEmocaoOutra('');
    setEmoIni(50);
    setCrencaIni(50);
    setRacionalInicial('Terapeuta');
    setRodada(1);
    setFalas([]);
    setCrencas([]);
    setEmoFim(null);
    setCrencaFim(null);
    setPressupostos('');
    setObs('');
    showToast(`Paciente ${nomeLimpo} selecionado`);
    setTimeout(() => {
      isInitialLoadRef.current = false;
    }, 350);
  };

  // Carrega lista de pacientes do usuário ao montar e suporta atalhos de URL / Dossiê
  useEffect(() => {
    let active = true;
    let urlPaciente = '';
    let urlPensamento = '';
    let isContinuar = false;

    if (typeof window !== 'undefined') {
      const sp = new URLSearchParams(window.location.search);
      const qPac = sp.get('paciente');
      const qPen = sp.get('pensamento');
      const qContinuar = sp.get('continuar');

      if (qPac) {
        urlPaciente = qPac;
        setCodigo(qPac);
        setPacienteAtivo(qPac);
      }
      if (qPen) {
        urlPensamento = qPen;
        setPensamento(qPen);
      }
      if (qContinuar === '1' || qContinuar === 'true') {
        isContinuar = true;
      }
    }

    getUserInteractivePatients().then((list) => {
      if (!active) return;
      if (list && list.length > 0) {
        const fullList = urlPaciente && !list.includes(urlPaciente) 
          ? [urlPaciente, ...list] 
          : list;
        setPacientes(fullList);

        const targetPac = urlPaciente || fullList[0];
        setPacienteAtivo(targetPac);
        setCodigo(targetPac);

        if (isContinuar) {
          carregarSessaoPaciente(targetPac, false);
        } else {
          // Início padrão sempre na Etapa 1: Preparação
          setStep(1);
          setRodada(1);
          setFalas([]);
          setCrencas([]);
          setEmoFim(null);
          setCrencaFim(null);
          setPressupostos('');
          setObs('');
          setRacionalInicial('Terapeuta');
          if (!urlPensamento) {
            setPensamento('');
            setEmoIni(50);
            setCrencaIni(50);
            setEmocao('Ansiedade');
            setEmocaoOutra('');
          }
          setTimeout(() => {
            isInitialLoadRef.current = false;
          }, 350);
        }
      } else {
        setTimeout(() => {
          isInitialLoadRef.current = false;
        }, 350);
      }
    });

    return () => {
      active = false;
    };
  }, [carregarSessaoPaciente]);

  // Autosave contínuo (localStorage imediato + Supabase com debounce)
  useEffect(() => {
    const state = {
      step,
      pensamento,
      emocao,
      emocaoOutra,
      emoIni,
      crencaIni,
      racionalInicial,
      rodada,
      falas,
      crencas,
      emoFim,
      crencaFim,
      pressupostos,
      obs,
      codigo: pacienteCode,
      incluirResumo,
      incluirBranco,
      roteiro,
      updatedAt: new Date().toISOString()
    };

    // Backup local por paciente e global
    try {
      localStorage.setItem(`na_session_dramatizacao_arena_${pacienteCode}`, JSON.stringify(state));
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch (e) {
      console.warn('Erro ao salvar estado:', e);
    }

    if (isInitialLoadRef.current) return;

    // Se a tela estiver limpa (ex: ao reiniciar para novo exercício sem conteúdo ainda),
    // NÃO sobrescreve nem apaga o registro salvo no Supabase
    const temConteudo = Boolean(pensamento.trim() || falas.length > 0 || obs.trim() || pressupostos.trim());
    if (!temConteudo) {
      setSalvandoStatus('ok');
      return;
    }

    // Dispara salvamento em nuvem no Supabase
    setSalvandoStatus('salvando');
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(async () => {
      await saveInteractiveSession('dramatizacao', 'arena', pacienteCode, state);
      setSalvandoStatus('ok');
    }, 700);

    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, [
    step,
    pensamento,
    emocao,
    emocaoOutra,
    emoIni,
    crencaIni,
    racionalInicial,
    rodada,
    falas,
    crencas,
    emoFim,
    crencaFim,
    pressupostos,
    obs,
    codigo,
    incluirResumo,
    incluirBranco,
    roteiro,
    pacienteCode
  ]);

  // Sincronizar body.script-hidden
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.body.classList.toggle('script-hidden', !roteiro);
    }
    return () => {
      if (typeof document !== 'undefined') {
        document.body.classList.remove('script-hidden');
      }
    };
  }, [roteiro]);

  // Iniciar troca de papéis
  const iniciarTrocaPapeis = useCallback(() => {
    const atual = crencas.length ? crencas[crencas.length - 1].valor : crencaIni;
    setTempCrencaSwap(atual);
    setShowBeliefModal(true);
  }, [crencas, crencaIni]);

  // Atalhos de teclado
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (showBeliefModal || showConfirmModal) return;

      const el = e.target as HTMLElement;
      const digitando =
        el &&
        ((el.tagName === 'INPUT' && (el as HTMLInputElement).type !== 'range' && (el as HTMLInputElement).type !== 'checkbox') ||
          el.tagName === 'TEXTAREA' ||
          el.isContentEditable);

      if (digitando) return;

      const k = e.key.toLowerCase();
      if (k === 'r') {
        e.preventDefault();
        setRoteiro((prev) => !prev);
      } else if (k === 't' && step === 2) {
        e.preventDefault();
        iniciarTrocaPapeis();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [step, showBeliefModal, showConfirmModal, iniciarTrocaPapeis]);

  // Ações de navegação
  const irPara = (n: 1 | 2 | 3 | 4) => {
    setStep(n);
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleIniciarRodada1 = () => {
    if (!pensamento.trim()) {
      setErroPensamento(true);
      return;
    }
    setErroPensamento(false);
    irPara(2);
  };

  const handleReiniciarConfirmado = () => {
    localStorage.removeItem(KEY);
    // Preserva o registro salvo no Supabase (não deleta do banco)
    setStep(1);
    setPensamento('');
    setEmocao('Ansiedade');
    setEmocaoOutra('');
    setEmoIni(50);
    setCrencaIni(50);
    setRacionalInicial('Terapeuta');
    setRodada(1);
    setFalas([]);
    setCrencas([]);
    setEmoFim(null);
    setCrencaFim(null);
    setPressupostos('');
    setObs('');
    setCodigo('');
    setIncluirResumo(true);
    setIncluirBranco(true);
    setShowConfirmModal(false);
    showToast('Nova sessão iniciada');
  };

  // Falas
  const adicionarFala = (lado: 'neg' | 'rac', texto: string) => {
    const limpo = texto.trim();
    if (!limpo) return;
    const autor = lado === 'neg' ? quemNegativo(rodada) : quemRacional(rodada);
    const nova: FalaItem = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
      lado,
      texto: limpo,
      rodada,
      autor,
      marcas: {}
    };
    setFalas((prev) => [...prev, nova]);
    if (lado === 'neg') {
      setTextoNegativo('');
      inputNegRef.current?.focus();
    } else {
      setTextoRacional('');
      inputRacRef.current?.focus();
    }
  };

  const alternarMarca = (id: string, m: 'funcionou' | 'nao' | 'dificil' | 'novo') => {
    setFalas((prev) =>
      prev.map((f) => {
        if (f.id !== id) return f;
        const marcas = { ...f.marcas };
        marcas[m] = !marcas[m];
        if (m === 'funcionou' && marcas[m]) marcas.nao = false;
        if (m === 'nao' && marcas[m]) marcas.funcionou = false;
        return { ...f, marcas };
      })
    );
  };

  const apagarFala = (id: string) => {
    setFalas((prev) => prev.filter((f) => f.id !== id));
    showToast('Fala apagada');
  };

  const confirmarTrocaComCrenca = (salvar: boolean) => {
    if (salvar) {
      setCrencas((prev) => [...prev, { rotulo: `Troca ${rodada}`, valor: tempCrencaSwap }]);
    }
    const prox = rodada + 1;
    setRodada(prox);
    setShowBeliefModal(false);
    setWhoSwap(true);
    setTimeout(() => setWhoSwap(false), 500);
    showToast(`Rodada ${prox}: ${quemRacional(prox)} no lado racional`);
  };

  const handleEncerrar = () => {
    if (crencaFim === null) setCrencaFim(crencaAtual());
    if (emoFim === null) setEmoFim(emoIni);
    irPara(3);
  };

  // Impressão e exportação
  const handleImprimir = () => {
    window.print();
  };

  const handleExportarJSON = () => {
    const dados = {
      step,
      pensamento,
      emocao,
      emocaoOutra,
      emoIni,
      crencaIni,
      racionalInicial,
      rodada,
      falas,
      crencas,
      emoFim,
      crencaFim,
      pressupostos,
      obs,
      codigo,
      incluirResumo,
      incluirBranco,
      exportadoEm: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(dados, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    const nome = `dramatizacao-${codigo.trim() ? codigo.trim().replace(/[^\w-]+/g, '') + '-' : ''}${new Date().toISOString().slice(0, 10)}.json`;
    a.href = URL.createObjectURL(blob);
    a.download = nome;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      URL.revokeObjectURL(a.href);
      a.remove();
    }, 0);
    showToast('Dados exportados');
  };

  // Gráfico da Etapa 3
  const cFinalVal = crencaFim === null ? crencaAtual() : crencaFim;
  const eFinalVal = emoFim === null ? emoIni : emoFim;

  const renderGrafico = (fim: number) => {
    const pts = [{ r: 'Início', v: crencaIni }, ...crencas.map((c) => ({ r: c.rotulo, v: c.valor })), { r: 'Final', v: fim }];
    const W = 600,
      x0 = 70,
      x1 = 570,
      top = 20,
      bot = 180;
    const n = pts.length,
      step = n > 1 ? (x1 - x0) / (n - 1) : 0;
    const X = (i: number) => x0 + i * step;
    const Y = (v: number) => bot - (v / 100) * (bot - top);
    const poly = pts.map((p, i) => `${X(i)},${Y(p.v)}`).join(' ');
    const aria = 'Crença: ' + pts.map((p) => `${p.r} ${p.v}`).join(', ');

    return (
      <svg viewBox={`0 0 ${W} 210`} role="img" aria-label={aria}>
        <g fontFamily="var(--font-mono)" fontSize="11" fill="#566152">
          <text x="0" y="24">100</text>
          <text x="10" y="104">50</text>
          <text x="18" y="184">0</text>
        </g>
        <g stroke="var(--line)" strokeWidth="1">
          <line x1="40" y1="20" x2="590" y2="20" />
          <line x1="40" y1="100" x2="590" y2="100" />
          <line x1="40" y1="180" x2="590" y2="180" />
        </g>
        <polyline points={poly} fill="none" stroke="var(--action)" strokeWidth="2.5" strokeLinejoin="round" />
        {pts.map((p, i) => {
          const last = i === n - 1;
          return (
            <g key={i}>
              <circle
                cx={X(i)}
                cy={Y(p.v)}
                r={last ? 6 : 5}
                fill={last ? 'var(--action)' : '#fff'}
                stroke="var(--action)"
                strokeWidth="2"
              />
              <text
                x={X(i)}
                y={Y(p.v) - 12}
                fontFamily="var(--font-mono)"
                fontSize="13"
                fill="var(--ink)"
                textAnchor="middle"
              >
                {p.v}
              </text>
              <text
                x={X(i)}
                y="202"
                fontFamily="var(--font-sans)"
                fontSize="12"
                fill="#566152"
                textAnchor="middle"
              >
                {p.r}
              </text>
            </g>
          );
        })}
      </svg>
    );
  };

  // Folhas A4
  const okList = falas.filter((f) => f.lado === 'rac' && f.marcas && f.marcas.funcionou);
  const resList = falas.filter((f) => f.lado === 'neg' && f.marcas && (f.marcas.dificil || f.marcas.novo));
  const dataHoje = new Date().toLocaleDateString('pt-BR');

  const renderFolha1 = () => (
    <div className="sheet" aria-label="Folha 1, resumo da sessão">
      <div className="s-top">
        <span className="s-brand">
          Neuro<span>Acervo</span>
        </span>
        <span className="s-h">Resumo da sessão</span>
      </div>
      <div className="s-title">Dramatização dos dois lados</div>
      <div style={{ color: '#566152' }}>
        {codigo.trim() ? `Paciente: ${codigo.trim()} · ` : ''}
        {dataHoje}
      </div>
      <div className="s-box">
        <div className="s-h">Pensamento trabalhado</div>
        <div className="s-thought">“{pensamento}”</div>
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <div className="s-box" style={{ flex: 1 }}>
          <div className="s-h">Crença</div>
          <div className="s-num">{crencaIni} → {cFinalVal}</div>
        </div>
        <div className="s-box" style={{ flex: 1 }}>
          <div className="s-h">{emocaoNome()}</div>
          <div className="s-num">{emoIni} → {eFinalVal}</div>
        </div>
      </div>
      <div>
        <div className="s-h">Respostas que funcionaram para mim</div>
        {okList.length ? (
          <ul>
            {okList.map((f) => (
              <li key={f.id}>{f.texto}</li>
            ))}
          </ul>
        ) : (
          <div>—</div>
        )}
      </div>
      <div>
        <div className="s-h">Pensamentos para continuar trabalhando</div>
        {resList.length ? (
          <ul>
            {resList.map((f) => (
              <li key={f.id}>{f.texto}</li>
            ))}
          </ul>
        ) : (
          <div>—</div>
        )}
      </div>
      <div className="s-foot">
        Material de uso em psicoterapia. Baseado em Leahy, Técnicas de Terapia Cognitiva, cap. 3.
      </div>
    </div>
  );

  const renderFolha2 = () => (
    <div className="sheet" aria-label="Folha 2, tarefa de casa">
      <div className="s-top">
        <span className="s-brand">
          Neuro<span>Acervo</span>
        </span>
        <span className="s-h">Tarefa de casa</span>
      </div>
      <div className="s-title">Os dois lados, em casa</div>
      <div style={{ color: '#566152' }}>
        Quando um pensamento negativo aparecer, escreva um argumento racional para ele. Depois, escreva o que o lado negativo responderia. Marque se ainda é difícil.
      </div>
      <table>
        <thead>
          <tr>
            <th style={{ width: '28%' }}>Meu pensamento negativo</th>
            <th style={{ width: '28%' }}>Argumento racional</th>
            <th style={{ width: '28%' }}>O que o lado negativo responde</th>
            <th>Ainda difícil?</th>
          </tr>
        </thead>
        <tbody>
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <tr key={i}>
              <td></td>
              <td></td>
              <td></td>
              <td>☐ sim ☐ não</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="s-foot">Traga esta folha na próxima sessão.</div>
    </div>
  );

  return (
    <PlatformShell activePage="recursos">
      {!planInfo.hasRecursos ? (
        <div className="wrap">
          <PraticaGate
            kick="Recurso Exclusivo Prática"
            titulo="Dramatização dos Dois Lados do Pensamento"
            descricao="O acesso à ferramenta clínica estruturada para role-play entre paciente e terapeuta é exclusivo do plano Prática."
          />
        </div>
      ) : (
        <div className="na-dr-root">
          <div className="wrap">
            {/* Cabeçalho */}
            <header className="tool-head">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, minWidth: 0 }}>
                <Link href="/recursos-interativos" className="back">
                  <ArrowLeft className="icon-sm" /> Recursos interativos
                </Link>
                <h1 className="h1">Dramatização dos dois lados do pensamento</h1>
                <div className="cap" style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 14px' }}>
                  <span>Avaliação e teste de pensamentos</span>
                  <span aria-hidden="true">·</span>
                  <span>15–25 min</span>
                  <span aria-hidden="true">·</span>
                  <span>Leahy, cap. 3</span>
                </div>
              </div>

              <div className="head-actions">
                <button
                  type="button"
                  className="btn"
                  onClick={() => setRoteiro((r) => !r)}
                  aria-pressed={roteiro}
                >
                  <BookOpen className="icon" /> Roteiro <span className="kbd">R</span>
                </button>
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => setShowConfirmModal(true)}
                >
                  <RotateCw className="icon" /> Reiniciar
                </button>
              </div>
            </header>

            {/* Barra de Seleção de Paciente / Sessão */}
            <div className="bar-paciente">
              <div className="bar-paciente__left">
                <span className="bar-paciente__label">
                  <User size={15} />
                  <span>Paciente em atendimento:</span>
                </span>
                <select
                  className="bar-paciente__select"
                  value={pacienteAtivo}
                  onChange={(e) => handleTrocarPaciente(e.target.value)}
                  aria-label="Selecionar paciente"
                >
                  {pacientes.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  className="bar-paciente__btn-add"
                  onClick={() => setShowNovoPacienteModal(true)}
                  title="Cadastrar novo código/iniciais de paciente"
                >
                  <Plus size={14} />
                  <span>Novo paciente</span>
                </button>
                <Link
                  href="/recursos-interativos/pacientes"
                  className="bar-paciente__btn-add"
                  title="Ver dossiê completo deste paciente"
                  style={{ textDecoration: 'none' }}
                >
                  <Users size={14} />
                  <span>Dossiê</span>
                </Link>
              </div>

              <div className="bar-paciente__right">
                <span className="salvo" id="salvo" data-s={salvandoStatus}>
                  <i></i>
                  <span>{salvandoStatus === 'salvando' ? 'Salvando na nuvem…' : 'Salvo na nuvem'}</span>
                </span>
                <span className="bar-paciente__sigilo">
                  Sigilo preservado (use iniciais ou código)
                </span>
              </div>
            </div>

            {/* Etapas */}
            <nav className="steps" aria-label="Etapas">
              <ol>
                {['Preparação', 'Arena do debate', 'Reflexão', 'Tarefa de casa'].map((nome, i) => {
                  const k = (i + 1) as 1 | 2 | 3 | 4;
                  const st = k < step ? 'done' : k === step ? 'current' : 'todo';
                  return (
                    <li
                      key={k}
                      data-state={st}
                      aria-current={st === 'current' ? 'step' : undefined}
                      onClick={() => {
                        if (k === 1) irPara(1);
                        else if (k === 2 && pensamento.trim()) irPara(2);
                        else if (k === 3 && falas.length) irPara(3);
                        else if (k === 4 && pensamento.trim()) irPara(4);
                      }}
                    >
                      <span className="dot">
                        {st === 'done' ? <Check className="icon-sm" /> : k}
                      </span>
                      <span>{nome}</span>
                      {k < 4 && <span className="bar"></span>}
                    </li>
                  );
                })}
              </ol>
            </nav>

            {/* ================= ETAPA 1 ================= */}
            {step === 1 && (
              <div className={`with-script ${roteiro ? 'has-script' : 'no-script'}`}>
                <section className="card prep main-col" style={{ gap: 0 }}>
                  <div className="block">
                    <div className="row-between" style={{ alignItems: 'baseline' }}>
                      <label htmlFor="pensamento" className="field-label">
                        Pensamento negativo-alvo
                      </label>
                      <span className="cap" style={{ fontSize: 12 }}>
                        Nas palavras do paciente, em primeira pessoa
                      </span>
                    </div>
                    <textarea
                      id="pensamento"
                      className="textarea thought-input"
                      rows={2}
                      placeholder="Ex.: “Se eu errar na apresentação, todos vão me achar incompetente.”"
                      value={pensamento}
                      onChange={(e) => {
                        setPensamento(e.target.value);
                        if (erroPensamento && e.target.value.trim()) setErroPensamento(false);
                      }}
                    />
                    <span className={`err ${erroPensamento ? 'show' : ''}`} id="err-pensamento">
                      Escreva o pensamento antes de começar.
                    </span>
                  </div>

                  <div className="block">
                    <span className="field-label" id="lbl-emo">
                      Emoção predominante
                    </span>
                    <div role="group" aria-labelledby="lbl-emo" style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                      {EMOCOES.concat(['Outra']).map((e) => {
                        const on = emocao === e;
                        return (
                          <button
                            key={e}
                            type="button"
                            className="chip"
                            onClick={() => setEmocao(e)}
                            aria-pressed={on}
                            style={e === 'Outra' ? { borderStyle: 'dashed' } : undefined}
                          >
                            {e === 'Outra' ? <Plus className="icon-sm" /> : on ? <Check className="icon-sm" /> : null}
                            {e}
                          </button>
                        );
                      })}
                    </div>
                    {emocao === 'Outra' && (
                      <input
                        id="emo-outra"
                        className="input"
                        placeholder="Qual emoção?"
                        value={emocaoOutra}
                        onChange={(e) => setEmocaoOutra(e.target.value)}
                        style={{ marginTop: 8 }}
                      />
                    )}
                  </div>

                  <div className="baseline">
                    <div className="meter">
                      <div className="eyebrow">Linha de base</div>
                      <div className="meter-head">
                        <label htmlFor="m-emoIni" className="field-label">
                          Intensidade da {emocaoNome().toLowerCase()}
                        </label>
                        <span className="meter-val">
                          {emoIni}
                          <small>/100</small>
                        </span>
                      </div>
                      <input
                        id="m-emoIni"
                        className="range"
                        type="range"
                        min={0}
                        max={100}
                        step={5}
                        value={emoIni}
                        onChange={(e) => setEmoIni(+e.target.value)}
                        style={{ '--p': `${emoIni}%` } as React.CSSProperties}
                      />
                      <div className="meter-scale">
                        <span>Nenhuma</span>
                        <span>Moderada</span>
                        <span>Máxima</span>
                      </div>
                    </div>

                    <div className="meter">
                      <div className="eyebrow">&nbsp;</div>
                      <div className="meter-head">
                        <label htmlFor="m-crencaIni" className="field-label">
                          Quanto acredita no pensamento
                        </label>
                        <span className="meter-val">
                          {crencaIni}
                          <small>/100</small>
                        </span>
                      </div>
                      <input
                        id="m-crencaIni"
                        className="range"
                        type="range"
                        min={0}
                        max={100}
                        step={5}
                        value={crencaIni}
                        onChange={(e) => setCrencaIni(+e.target.value)}
                        style={{ '--p': `${crencaIni}%` } as React.CSSProperties}
                      />
                      <div className="meter-scale">
                        <span>Não acredita</span>
                        <span>Em parte</span>
                        <span>Totalmente</span>
                      </div>
                    </div>

                    <p className="cap" style={{ flexBasis: '100%', margin: 0 }}>
                      A crença é medida de novo a cada troca de papéis e no final.
                    </p>
                  </div>

                  <div className="block">
                    <span className="field-label" id="lbl-papel">
                      Quem começa no lado racional
                    </span>
                    <div className="roles" role="group" aria-labelledby="lbl-papel">
                      <button
                        type="button"
                        className="role"
                        onClick={() => setRacionalInicial('Terapeuta')}
                        aria-pressed={racionalInicial === 'Terapeuta'}
                      >
                        <span className="role-title">
                          Terapeuta no lado racional
                          <span className="badge-rec">Recomendado</span>
                        </span>
                        <span className="role-map">
                          <span className="role-side role-side-neg">
                            <span style={{ opacity: 0.8 }}>Negativo</span>
                            <strong>Paciente</strong>
                          </span>
                          <span className="role-side role-side-rac">
                            <span>Racional</span>
                            <strong>Terapeuta</strong>
                          </span>
                        </span>
                        <span className="cap">
                          Você mostra primeiro como contestar. Na troca, o paciente repete o que viu.
                        </span>
                      </button>

                      <button
                        type="button"
                        className="role"
                        onClick={() => setRacionalInicial('Paciente')}
                        aria-pressed={racionalInicial === 'Paciente'}
                      >
                        <span className="role-title">Paciente no lado racional</span>
                        <span className="role-map">
                          <span className="role-side role-side-neg">
                            <span style={{ opacity: 0.8 }}>Negativo</span>
                            <strong>Terapeuta</strong>
                          </span>
                          <span className="role-side role-side-rac">
                            <span>Racional</span>
                            <strong>Paciente</strong>
                          </span>
                        </span>
                        <span className="cap">
                          Para quem já tem repertório de contestação e quer testar autonomia.
                        </span>
                      </button>
                    </div>
                  </div>

                  <footer className="card-foot">
                    <span className="cap">Etapa 1 de 4</span>
                    <button type="button" className="btn btn-primary" onClick={handleIniciarRodada1}>
                      Iniciar rodada 1 <ChevronRight className="icon" />
                    </button>
                  </footer>
                </section>

                <aside className="script" aria-label="Roteiro do terapeuta">
                  <div className="script-head">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <span className="eyebrow">Só para você</span>
                      <h2 className="h2">Roteiro</h2>
                    </div>
                    <button
                      type="button"
                      className="btn btn-ghost"
                      style={{ minHeight: 36 }}
                      onClick={() => setRoteiro(false)}
                    >
                      <EyeOff className="icon-sm" /> Ocultar <span className="kbd">R</span>
                    </button>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <span style={{ fontSize: 13, fontWeight: 600 }}>Para dizer ao paciente</span>
                    <p className="quote">
                      “Vamos fazer uma dramatização com o seu pensamento. Eu faço o papel do lado racional. Você tenta me convencer de que o pensamento negativo é verdadeiro.”
                    </p>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <span style={{ fontSize: 13, fontWeight: 600 }}>Antes de começar</span>
                    <ul>
                      <li>Escolha um pensamento específico, não um tema geral.</li>
                      <li>Comece no lado racional para modelar a contestação.</li>
                      <li>Combine que vocês vão trocar de papel algumas vezes.</li>
                    </ul>
                  </div>
                  <div className="links">
                    <span style={{ fontSize: 13, fontWeight: 600 }}>Técnicas relacionadas</span>
                    <Link href="/recursos-interativos">Análise de custo-benefício</Link>
                    <Link href="/recursos-interativos">Exame das evidências</Link>
                    <Link href="/recursos-interativos">Advogado de defesa</Link>
                  </div>
                  <p className="src">Leahy, R. L. Técnicas de Terapia Cognitiva: manual do terapeuta, cap. 3.</p>
                </aside>
              </div>
            )}

            {/* ================= ETAPA 2 ================= */}
            {step === 2 && (
              <>
                <header className="arena-bar">
                  <div className="arena-title">
                    <span className="eyebrow">Etapa 2 de 4 · Arena do debate</span>
                    <strong>Dramatização dos dois lados</strong>
                  </div>

                  <div className="seg" aria-label="Rodadas">
                    <span className="seg-lbl">Rodada</span>
                    {Array.from({ length: rodada }).map((_, i) => (
                      <span key={i} className="round" aria-current={i + 1 === rodada ? 'true' : undefined}>
                        {i + 1}
                      </span>
                    ))}
                  </div>

                  <div className="belief-pill" title="Crença no pensamento">
                    <span className="cap" style={{ fontSize: 12 }}>
                      Crença
                    </span>
                    <span className="from">{crencaIni}</span>
                    <ArrowRight className="icon-sm" />
                    <span className="to">{crencaAtual()}</span>
                  </div>

                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={iniciarTrocaPapeis}
                    title="Começar uma nova rodada e trocar papéis (T)"
                  >
                    <ArrowLeftRight className="icon" size={17} strokeWidth={2.4} />
                    Nova rodada <span className="kbd">T</span>
                  </button>

                  <button
                    type="button"
                    className="btn"
                    onClick={handleEncerrar}
                    title="Encerrar o debate e ir para consolidação"
                  >
                    <Check className="icon icon-check" size={20} strokeWidth={2.5} /> Encerrar
                  </button>
                  <button
                    type="button"
                    className="btn icon-btn"
                    onClick={() => setRoteiro((r) => !r)}
                    aria-pressed={roteiro}
                    aria-label="Roteiro do terapeuta (R)"
                    title="Roteiro (R)"
                  >
                    <BookOpen className="icon icon-book" size={18} strokeWidth={1.9} />
                  </button>
                </header>

                <div className="pinned">
                  <span className="eyebrow">Pensamento-alvo</span>
                  <p>“{pensamento}”</p>
                  <span className="emo-tag">
                    {emocaoNome()} <span className="mono">{emoIni}</span>
                  </span>
                </div>

                <div className="arena-wrap">
                  <div className="arena">
                    {/* Coluna Negativa */}
                    <section className="col col-neg" aria-label="Voz do pensamento negativo">
                      <div className="col-head">
                        <span className="col-mark">
                          <Cloud className="icon" />
                        </span>
                        <div className="col-title">
                          <h2>Voz do pensamento negativo</h2>
                          <span>Defende que o pensamento é verdadeiro</span>
                        </div>
                        <div className="speaker">
                          <small>Fala agora</small>
                          <span className={`who ${whoSwap ? 'swap' : ''}`}>{quemNegativo(rodada)}</span>
                        </div>
                      </div>

                      <div className="col-body" data-body="neg">
                        {falas.filter((f) => f.lado === 'neg').length ? (
                          falas
                            .filter((f) => f.lado === 'neg')
                            .map((f) => {
                              const ultima = falas.length ? falas[falas.length - 1].id === f.id : false;
                              const m = f.marcas || {};
                              return (
                                <article key={f.id} className="fala">
                                  <p>{f.texto}</p>
                                  <div className="fala-meta">
                                    <span className="fala-who">
                                      <span className="rn">R{f.rodada}</span>
                                      {f.autor}
                                      {ultima && <span className="now">Última</span>}
                                    </span>
                                    <button
                                      type="button"
                                      className="tag t-flag"
                                      onClick={() => alternarMarca(f.id, 'dificil')}
                                      aria-pressed={!!m.dificil}
                                    >
                                      <Flag className="icon-sm" /> Difícil de rebater
                                    </button>
                                    <button
                                      type="button"
                                      className="tag t-new"
                                      onClick={() => alternarMarca(f.id, 'novo')}
                                      aria-pressed={!!m.novo}
                                    >
                                      <Plus className="icon-sm" /> Novo
                                    </button>
                                    <button
                                      type="button"
                                      className="tag t-del"
                                      onClick={() => apagarFala(f.id)}
                                      aria-label="Apagar fala"
                                      title="Apagar"
                                    >
                                      <Trash2 className="icon-sm" />
                                    </button>
                                  </div>
                                </article>
                              );
                            })
                        ) : (
                          <div className="empty">
                            <Cloud className="icon" />
                            <span>Os argumentos a favor do pensamento negativo aparecem aqui.</span>
                          </div>
                        )}
                      </div>

                      <div className="composer">
                        <label className="sr-only" htmlFor="add-neg">
                          Registrar fala: Voz do pensamento negativo
                        </label>
                        <textarea
                          id="add-neg"
                          ref={inputNegRef}
                          rows={1}
                          data-add="neg"
                          placeholder={`Fala ${quemNegativo(rodada) === 'Terapeuta' ? 'do terapeuta' : 'do paciente'}…`}
                          value={textoNegativo}
                          onChange={(e) => {
                            setTextoNegativo(e.target.value);
                            e.target.style.height = 'auto';
                            e.target.style.height = Math.min(e.target.scrollHeight + 2, 120) + 'px';
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              adicionarFala('neg', textoNegativo);
                            } else if (e.key === 'Tab' && !e.shiftKey) {
                              e.preventDefault();
                              inputRacRef.current?.focus();
                            }
                          }}
                        />
                        <button
                          type="button"
                          className="btn"
                          onClick={() => adicionarFala('neg', textoNegativo)}
                          aria-label="Registrar fala"
                        >
                          <CornerDownLeft className="icon" />
                        </button>
                      </div>
                    </section>

                    {/* Rail Central de Troca */}
                    <div className="rail">
                      <span className="rail-lbl">
                        Trocar
                        <br />
                        papéis
                      </span>
                      <button
                        type="button"
                        className="swap-btn"
                        onClick={iniciarTrocaPapeis}
                        aria-label="Trocar papéis (T)"
                        title="Trocar papéis (T)"
                      >
                        <ArrowLeftRight className="icon" />
                      </button>
                      <span className="kbd">T</span>
                    </div>

                    {/* Coluna Racional */}
                    <section className="col col-rac" aria-label="Voz racional">
                      <div className="col-head">
                        <span className="col-mark">
                          <Shield className="icon" />
                        </span>
                        <div className="col-title">
                          <h2>Voz racional</h2>
                          <span>Contesta o pensamento com lógica e evidências</span>
                        </div>
                        <div className="speaker">
                          <small>Fala agora</small>
                          <span className={`who ${whoSwap ? 'swap' : ''}`}>{quemRacional(rodada)}</span>
                        </div>
                      </div>

                      <div className="col-body" data-body="rac">
                        {falas.filter((f) => f.lado === 'rac').length ? (
                          falas
                            .filter((f) => f.lado === 'rac')
                            .map((f) => {
                              const ultima = falas.length ? falas[falas.length - 1].id === f.id : false;
                              const m = f.marcas || {};
                              return (
                                <article key={f.id} className="fala">
                                  <p>{f.texto}</p>
                                  <div className="fala-meta">
                                    <span className="fala-who">
                                      <span className="rn">R{f.rodada}</span>
                                      {f.autor}
                                      {ultima && <span className="now">Última</span>}
                                    </span>
                                    <button
                                      type="button"
                                      className="tag t-ok"
                                      onClick={() => alternarMarca(f.id, 'funcionou')}
                                      aria-pressed={!!m.funcionou}
                                    >
                                      <Star className="icon-sm" /> Funcionou
                                    </button>
                                    <button
                                      type="button"
                                      className="tag t-no"
                                      onClick={() => alternarMarca(f.id, 'nao')}
                                      aria-pressed={!!m.nao}
                                    >
                                      <X className="icon-sm" /> Não funcionou
                                    </button>
                                    <button
                                      type="button"
                                      className="tag t-del"
                                      onClick={() => apagarFala(f.id)}
                                      aria-label="Apagar fala"
                                      title="Apagar"
                                    >
                                      <Trash2 className="icon-sm" />
                                    </button>
                                  </div>
                                </article>
                              );
                            })
                        ) : (
                          <div className="empty">
                            <Shield className="icon" />
                            <span>As respostas que contestam o pensamento aparecem aqui.</span>
                          </div>
                        )}
                      </div>

                      <div className="composer">
                        <label className="sr-only" htmlFor="add-rac">
                          Registrar fala: Voz racional
                        </label>
                        <textarea
                          id="add-rac"
                          ref={inputRacRef}
                          rows={1}
                          data-add="rac"
                          placeholder={`Fala ${quemRacional(rodada) === 'Terapeuta' ? 'do terapeuta' : 'do paciente'}…`}
                          value={textoRacional}
                          onChange={(e) => {
                            setTextoRacional(e.target.value);
                            e.target.style.height = 'auto';
                            e.target.style.height = Math.min(e.target.scrollHeight + 2, 120) + 'px';
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              adicionarFala('rac', textoRacional);
                            } else if (e.key === 'Tab' && !e.shiftKey) {
                              e.preventDefault();
                              inputNegRef.current?.focus();
                            }
                          }}
                        />
                        <button
                          type="button"
                          className="btn"
                          onClick={() => adicionarFala('rac', textoRacional)}
                          aria-label="Registrar fala"
                        >
                          <CornerDownLeft className="icon" />
                        </button>
                      </div>
                    </section>
                  </div>

                  {/* Aside do roteiro na Arena */}
                  {roteiro && (
                    <aside className="script script-compact" aria-label="Roteiro do terapeuta">
                      <div className="script-head">
                        <span className="eyebrow">Roteiro · só você</span>
                        <button
                          type="button"
                          className="btn btn-ghost"
                          style={{ minHeight: 32, padding: '0 8px' }}
                          onClick={() => setRoteiro(false)}
                          aria-label="Ocultar roteiro"
                        >
                          <EyeOff className="icon-sm" /> <span className="kbd">R</span>
                        </button>
                      </div>
                      <ul>
                        <li>No lado racional, responda ao pensamento exato: lógica, evidências, justiça. Frase positiva solta não conta.</li>
                        <li>Se o paciente travar no lado racional, dê uma pista, não a resposta.</li>
                        <li>Observe quais respostas ele aceita e quais derruba fácil.</li>
                      </ul>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        <span style={{ fontSize: 13, fontWeight: 600 }}>Distorções para nomear</span>
                        <div className="dist">
                          <span>Leitura mental</span>
                          <span>Catastrofização</span>
                          <span>Adivinhação do futuro</span>
                          <span>Tudo-ou-nada</span>
                          <span>Rótulo</span>
                          <span>“Deveria”</span>
                        </div>
                      </div>
                      <p className="src" style={{ marginTop: 'auto' }}>
                        Sugestão: 2 a 4 rodadas.
                      </p>
                    </aside>
                  )}
                </div>

                <footer className="shortcuts">
                  <span><span className="kbd">Enter</span> registra</span>
                  <span><span className="kbd">Shift</span>+<span className="kbd">Enter</span> quebra a linha</span>
                  <span><span className="kbd">Tab</span> alterna a coluna</span>
                  <span><span className="kbd">T</span> troca os papéis</span>
                  <span><span className="kbd">R</span> roteiro</span>
                </footer>
              </>
            )}

            {/* ================= ETAPA 3 ================= */}
            {step === 3 && (
              <div className={`with-script ${roteiro ? 'has-script' : 'no-script'}`}>
                <div className="main-col">
                  <section className="card summary">
                    <div className="row-between" style={{ alignItems: 'baseline' }}>
                      <h2 className="h2">Antes e depois</h2>
                      <span className="cap">
                        {rodada} {rodada === 1 ? 'rodada' : 'rodadas'} · {falas.length} {falas.length === 1 ? 'fala registrada' : 'falas registradas'}
                      </span>
                    </div>

                    <div className="ba">
                      {/* Antes/depois Crença */}
                      <div className="ba-item">
                        <span style={{ fontSize: 14, fontWeight: 600 }}>Crença no pensamento</span>
                        <div className="ba-nums">
                          <span className="from">{crencaIni}</span>
                          <ArrowRight className="icon" />
                          <span className="to">{cFinalVal}</span>
                          <span className={`delta ${cFinalVal > crencaIni ? 'up' : ''}`}>
                            {cFinalVal - crencaIni === 0
                              ? 'sem mudança'
                              : `${cFinalVal - crencaIni > 0 ? '+' : '−'}${Math.abs(cFinalVal - crencaIni)} pontos`}
                          </span>
                        </div>
                        <label className="sr-only" htmlFor="m-crencaFim">
                          Crença no pensamento agora
                        </label>
                        <input
                          id="m-crencaFim"
                          className="range"
                          type="range"
                          min={0}
                          max={100}
                          step={5}
                          value={cFinalVal}
                          onChange={(e) => setCrencaFim(+e.target.value)}
                          style={{ '--p': `${cFinalVal}%` } as React.CSSProperties}
                        />
                        <div className="meter-scale">
                          <span>Não acredita</span>
                          <span>Agora</span>
                          <span>Totalmente</span>
                        </div>
                      </div>

                      {/* Antes/depois Emoção */}
                      <div className="ba-item">
                        <span style={{ fontSize: 14, fontWeight: 600 }}>
                          Intensidade da {emocaoNome().toLowerCase()}
                        </span>
                        <div className="ba-nums">
                          <span className="from">{emoIni}</span>
                          <ArrowRight className="icon" />
                          <span className="to">{eFinalVal}</span>
                          <span className={`delta ${eFinalVal > emoIni ? 'up' : ''}`}>
                            {eFinalVal - emoIni === 0
                              ? 'sem mudança'
                              : `${eFinalVal - emoIni > 0 ? '+' : '−'}${Math.abs(eFinalVal - emoIni)} pontos`}
                          </span>
                        </div>
                        <label className="sr-only" htmlFor="m-emoFim">
                          Intensidade da emoção agora
                        </label>
                        <input
                          id="m-emoFim"
                          className="range"
                          type="range"
                          min={0}
                          max={100}
                          step={5}
                          value={eFinalVal}
                          onChange={(e) => setEmoFim(+e.target.value)}
                          style={{ '--p': `${eFinalVal}%` } as React.CSSProperties}
                        />
                        <div className="meter-scale">
                          <span>Nenhuma</span>
                          <span>Agora</span>
                          <span>Máxima</span>
                        </div>
                      </div>
                    </div>

                    <figure className="chart" style={{ margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
                      <figcaption style={{ fontSize: 14, fontWeight: 600 }}>
                        Crença ao longo das rodadas
                      </figcaption>
                      <div id="chart">{renderGrafico(cFinalVal)}</div>
                    </figure>
                  </section>

                  {/* Listas Agrupadas */}
                  <section className="lists">
                    {/* 1. Respostas que funcionaram */}
                    <div className="card list-card">
                      <div className="list-head">
                        <span className="list-ico" style={{ background: 'var(--select)', color: 'var(--action-hover)' }}>
                          <Star className="icon-sm" />
                        </span>
                        Respostas que funcionaram
                        <span className="n">{okList.length}</span>
                      </div>
                      {okList.length ? (
                        <ul className="list">
                          {okList.map((x) => (
                            <li key={x.id}>{x.texto}</li>
                          ))}
                        </ul>
                      ) : (
                        <p className="empty" style={{ margin: 0, padding: 0 }}>
                          Nada marcado.
                        </p>
                      )}
                    </div>

                    {/* 2. Mais difíceis de rebater */}
                    <div className="card list-card">
                      <div className="list-head">
                        <span className="list-ico" style={{ background: 'var(--warn-bg)', color: 'var(--warn-ink)' }}>
                          <Flag className="icon-sm" />
                        </span>
                        Mais difíceis de rebater
                        <span className="n">
                          {falas.filter((x) => x.lado === 'neg' && x.marcas && x.marcas.dificil).length}
                        </span>
                      </div>
                      {falas.filter((x) => x.lado === 'neg' && x.marcas && x.marcas.dificil).length ? (
                        <ul className="list">
                          {falas
                            .filter((x) => x.lado === 'neg' && x.marcas && x.marcas.dificil)
                            .map((x) => (
                              <li key={x.id}>{x.texto}</li>
                            ))}
                        </ul>
                      ) : (
                        <p className="empty" style={{ margin: 0, padding: 0 }}>
                          Nada marcado.
                        </p>
                      )}
                    </div>

                    {/* 3. Não funcionaram */}
                    <div className="card list-card">
                      <div className="list-head">
                        <span className="list-ico" style={{ background: 'var(--sunken)', color: 'var(--ink)' }}>
                          <X className="icon-sm" />
                        </span>
                        Não funcionaram
                        <span className="n">
                          {falas.filter((x) => x.lado === 'rac' && x.marcas && x.marcas.nao).length}
                        </span>
                      </div>
                      {falas.filter((x) => x.lado === 'rac' && x.marcas && x.marcas.nao).length ? (
                        <ul className="list">
                          {falas
                            .filter((x) => x.lado === 'rac' && x.marcas && x.marcas.nao)
                            .map((x) => (
                              <li key={x.id}>{x.texto}</li>
                            ))}
                        </ul>
                      ) : (
                        <p className="empty" style={{ margin: 0, padding: 0 }}>
                          Nada marcado.
                        </p>
                      )}
                    </div>

                    {/* 4. Pensamentos novos */}
                    <div className="card list-card">
                      <div className="list-head">
                        <span className="list-ico" style={{ background: 'var(--sunken)', color: 'var(--ink)' }}>
                          <Plus className="icon-sm" />
                        </span>
                        Pensamentos novos
                        <span className="n">
                          {falas.filter((x) => x.lado === 'neg' && x.marcas && x.marcas.novo).length}
                        </span>
                      </div>
                      {falas.filter((x) => x.lado === 'neg' && x.marcas && x.marcas.novo).length ? (
                        <ul className="list">
                          {falas
                            .filter((x) => x.lado === 'neg' && x.marcas && x.marcas.novo)
                            .map((x) => (
                              <li key={x.id}>{x.texto}</li>
                            ))}
                        </ul>
                      ) : (
                        <p className="empty" style={{ margin: 0, padding: 0 }}>
                          Nada marcado.
                        </p>
                      )}
                    </div>
                  </section>

                  {/* Notas e pressupostos */}
                  <section className="card notes">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      <div className="row-between" style={{ alignItems: 'baseline' }}>
                        <label htmlFor="pressupostos" className="field-label">
                          Possíveis pressupostos subjacentes
                        </label>
                        <Link href="/recursos-interativos" style={{ fontSize: 13, fontWeight: 600 }}>
                          Abrir em Identificação de regras →
                        </Link>
                      </div>
                      <textarea
                        id="pressupostos"
                        className="textarea"
                        rows={3}
                        placeholder="Ex.: Se eu errar, sou incompetente. Preciso ser perfeito para ser aceito."
                        value={pressupostos}
                        onChange={(e) => setPressupostos(e.target.value)}
                      />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      <div className="row-between" style={{ alignItems: 'baseline' }}>
                        <label htmlFor="obs" className="field-label">
                          Observações da sessão
                        </label>
                        <span className="cap" style={{ fontSize: 12 }}>
                          Não sai na impressão
                        </span>
                      </div>
                      <textarea
                        id="obs"
                        className="textarea"
                        rows={3}
                        placeholder="Como o paciente reagiu às trocas, o que levar para a próxima sessão…"
                        value={obs}
                        onChange={(e) => setObs(e.target.value)}
                      />
                    </div>
                  </section>

                  <div className="row-between">
                    <button type="button" className="btn btn-ghost" onClick={() => irPara(2)}>
                      <ArrowLeft className="icon" /> Voltar à arena
                    </button>
                    <button type="button" className="btn btn-primary" onClick={() => irPara(4)}>
                      Gerar tarefa de casa <ChevronRight className="icon" />
                    </button>
                  </div>
                </div>

                <aside className="script" aria-label="Roteiro do terapeuta">
                  <div className="script-head">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <span className="eyebrow">Só para você</span>
                      <h2 className="h2">Perguntas de fechamento</h2>
                    </div>
                    <button
                      type="button"
                      className="btn btn-ghost"
                      style={{ minHeight: 36 }}
                      onClick={() => setRoteiro(false)}
                    >
                      <EyeOff className="icon-sm" /> Ocultar <span className="kbd">R</span>
                    </button>
                  </div>
                  <ol style={{ fontSize: 15, lineHeight: '22px', gap: 12 }}>
                    <li>Quais respostas racionais funcionaram melhor para você?</li>
                    <li>Quais não funcionaram?</li>
                    <li>Quais pensamentos negativos foram mais difíceis de manejar?</li>
                    <li>Há outros pensamentos negativos que não apareceram aqui?</li>
                  </ol>
                  <p className="quote" style={{ font: '400 14px/21px var(--font-sans)' }}>
                    Os pensamentos resistentes costumam apontar para regras como “devo ser sempre perfeito”. Vale anotá-las ao lado.
                  </p>
                </aside>
              </div>
            )}

            {/* ================= ETAPA 4 ================= */}
            {step === 4 && (
              <div className="with-script">
                <section className="preview" aria-label="Prévia da impressão">
                  {incluirResumo && (
                    <div className="sheet-wrap">
                      {renderFolha1()}
                      <span className="cap">Resumo preenchido</span>
                    </div>
                  )}
                  {incluirBranco && (
                    <div className="sheet-wrap">
                      {renderFolha2()}
                      <span className="cap">Para preencher em casa</span>
                    </div>
                  )}
                  {!incluirResumo && !incluirBranco && (
                    <p className="cap" style={{ alignSelf: 'center' }}>
                      Escolha ao menos uma folha.
                    </p>
                  )}
                </section>

                <aside className="options" aria-label="Opções de impressão">
                  <h2 className="h2">Para o paciente levar</h2>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <label className="check">
                      <input
                        type="checkbox"
                        checked={incluirResumo}
                        onChange={(e) => setIncluirResumo(e.target.checked)}
                      />
                      <span style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <span style={{ fontSize: 15, fontWeight: 600 }}>Resumo da sessão</span>
                        <span className="cap">
                          Pensamento, antes e depois, respostas que funcionaram
                        </span>
                      </span>
                    </label>

                    <label className="check">
                      <input
                        type="checkbox"
                        checked={incluirBranco}
                        onChange={(e) => setIncluirBranco(e.target.checked)}
                      />
                      <span style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <span style={{ fontSize: 15, fontWeight: 600 }}>
                          Folha de tarefa em branco
                        </span>
                        <span className="cap">Quatro colunas, oito linhas</span>
                      </span>
                    </label>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <label htmlFor="codigo" style={{ fontSize: 14, fontWeight: 600 }}>
                      Código do paciente{' '}
                      <span style={{ fontWeight: 400, color: 'var(--muted)' }}>(opcional)</span>
                    </label>
                    <input
                      id="codigo"
                      className="input mono"
                      value={codigo}
                      onChange={(e) => {
                        const val = e.target.value;
                        setCodigo(val);
                        setPacienteAtivo(val);
                      }}
                      placeholder="Ex.: P-014 ou iniciais"
                      autoComplete="off"
                    />
                    <span className="cap" style={{ fontSize: 12 }}>
                      Use um código ou iniciais, não o nome completo.
                    </span>
                  </div>

                  <div className="lock-note">
                    <Lock className="icon" />
                    <span>O roteiro e as observações da sessão nunca são impressos.</span>
                  </div>

                  <div className="options-actions">
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={handleImprimir}
                      disabled={!incluirResumo && !incluirBranco}
                    >
                      <Printer className="icon" /> Imprimir
                    </button>
                    <button
                      type="button"
                      className="btn"
                      onClick={() => {
                        showToast('Na janela de impressão, escolha “Salvar como PDF”');
                        setTimeout(handleImprimir, 400);
                      }}
                      disabled={!incluirResumo && !incluirBranco}
                    >
                      <Download className="icon" /> Baixar PDF
                    </button>
                  </div>

                  <button
                    type="button"
                    className="btn btn-ghost options-back"
                    onClick={() => irPara(3)}
                  >
                    <ArrowLeft className="icon" /> Voltar à reflexão
                  </button>
                </aside>
              </div>
            )}
          </div>

          {/* ================= MODAL DE TROCA DE PAPÉIS ================= */}
          {showBeliefModal && (
            <div className="dr-dialog-backdrop" onClick={() => setShowBeliefModal(false)}>
              <div className="dr-dialog-card" onClick={(e) => e.stopPropagation()}>
                <div>
                  <div className="eyebrow" id="bd-eyebrow">
                    Fim da rodada {rodada}
                  </div>
                  <h2 className="h2" id="bd-title">
                    Quanto acredita no pensamento agora?
                  </h2>
                </div>

                <div className="meter">
                  <div className="meter-head">
                    <label htmlFor="bd-range" className="field-label">
                      Crença
                    </label>
                    <span className="meter-val" id="bd-val">
                      {tempCrencaSwap}
                      <small>/100</small>
                    </span>
                  </div>
                  <input
                    id="bd-range"
                    className="range"
                    type="range"
                    min={0}
                    max={100}
                    value={tempCrencaSwap}
                    onChange={(e) => setTempCrencaSwap(+e.target.value)}
                    style={{ '--p': `${tempCrencaSwap}%` } as React.CSSProperties}
                  />
                  <div className="meter-scale">
                    <span>Não acredita</span>
                    <span>Em parte</span>
                    <span>Totalmente</span>
                  </div>
                </div>

                <div className="modal-actions">
                  <button
                    type="button"
                    className="btn btn-ghost"
                    onClick={() => confirmarTrocaComCrenca(false)}
                  >
                    Pular
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => confirmarTrocaComCrenca(true)}
                  >
                    Registrar e trocar
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ================= MODAL DE CONFIRMAR REINÍCIO ================= */}
          {showConfirmModal && (
            <div className="dr-dialog-backdrop" onClick={() => setShowConfirmModal(false)}>
              <div className="dr-dialog-card" onClick={(e) => e.stopPropagation()}>
                <h2 className="h2" id="cd-title">
                  Começar uma nova sessão?
                </h2>
                <p className="cap" style={{ margin: 0, fontSize: 15, lineHeight: '23px' }}>
                  Tudo o que foi registrado nesta dramatização será apagado deste navegador. Exporte os dados antes, se quiser guardar.
                </p>
                <div className="modal-actions">
                  <button
                    type="button"
                    className="btn btn-ghost"
                    onClick={() => setShowConfirmModal(false)}
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={handleReiniciarConfirmado}
                  >
                    Apagar e recomeçar
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Modal de Cadastro de Novo Paciente */}
          {showNovoPacienteModal && (
            <div
              className="na-modal-overlay"
              role="dialog"
              aria-modal="true"
              onClick={() => setShowNovoPacienteModal(false)}
            >
              <div
                className="na-modal-dialog"
                style={{ maxWidth: 460, padding: 28, background: 'var(--card, #ffffff)' }}
                onClick={(e) => e.stopPropagation()}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: 'var(--ink)' }}>
                    Cadastrar Paciente / Caso
                  </h3>
                  <button
                    type="button"
                    onClick={() => setShowNovoPacienteModal(false)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', display: 'grid', placeItems: 'center' }}
                    aria-label="Fechar"
                  >
                    <X size={20} />
                  </button>
                </div>

                <p style={{ margin: '0 0 16px', fontSize: 13, color: 'var(--muted)', lineHeight: 1.5 }}>
                  Identifique o paciente por <b>iniciais</b>, <b>código</b> ou <b>apelido</b> (ex: <i>"M.S."</i>, <i>"Caso 02"</i> ou <i>"Enzo (8a)"</i>) para preservar o sigilo clínico profissional (CFP/LGPD).
                </p>

                <form onSubmit={(e) => { e.preventDefault(); handleCriarPaciente(); }}>
                  <input
                    type="text"
                    value={novoPacienteInput}
                    onChange={(e) => setNovoPacienteInput(e.target.value)}
                    placeholder="Ex: Paciente M.S. ou Caso 04"
                    autoFocus
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      borderRadius: 12,
                      border: '1px solid var(--line)',
                      background: 'var(--sunken, #f7f1de)',
                      color: 'var(--ink)',
                      fontSize: 14,
                      outline: 'none',
                      marginBottom: 20,
                      boxSizing: 'border-box'
                    }}
                  />

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                    <button
                      type="button"
                      className="btn btn-ghost"
                      onClick={() => setShowNovoPacienteModal(false)}
                      style={{ padding: '8px 16px', fontSize: 13 }}
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary"
                      style={{ padding: '8px 18px', fontSize: 13 }}
                    >
                      Cadastrar e Selecionar
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Toast */}
          <div className={`toast ${toastMessage ? 'show' : ''}`} role="status" aria-live="polite">
            {toastMessage}
          </div>

          {/* Raiz de impressão A4 dedicada */}
          <div id="print-root" aria-hidden="true">
            {incluirResumo && renderFolha1()}
            {incluirBranco && renderFolha2()}
          </div>
        </div>
      )}
    </PlatformShell>
  );
}
