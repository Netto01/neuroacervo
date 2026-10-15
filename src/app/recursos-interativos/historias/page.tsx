'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useNeuro } from '@/context/NeuroContext';
import { PlatformShell } from '@/components/layout/PlatformShell';
import { resolveUserPlan } from '@/utils/userPlan';
import { PraticaGate } from '@/components/common/PraticaGate';
import { 
  HISTORIAS, 
  HistoriaClinica 
} from '@/data/historiasClinicas';
import { 
  ArrowLeft, 
  ChevronLeft, 
  ChevronRight, 
  RotateCcw,
  Maximize2,
  Volume2,
  VolumeX,
  X,
  Check,
  Printer,
  Copy
} from 'lucide-react';
import '../recursos.css';

interface FaixaTab {
  id: string;
  r: string;
  n: string;
  c: string;
  c2: string;
}

const FAIXAS_TABS: FaixaTab[] = [
  { id: 'f1', r: '6–8', n: 'Infantil I', c: '#6a4870', c2: '#ece4ef' },
  { id: 'f2', r: '8–11', n: 'Infantil II', c: '#2e4c78', c2: '#e3e8f0' },
  { id: 'f3', r: '11–13', n: 'Transição', c: '#1d5e63', c2: '#e1ecec' },
  { id: 'f4', r: '14–16', n: 'Adolescência', c: '#8a5317', c2: '#f2e8dc' },
  { id: 'f5', r: '16–19', n: 'Jovem adulto', c: '#2f6b31', c2: '#e3eedf' },
];

const TERMOMETRO_VALORES = [
  { val: 1, label: 'pouco', color: '#7d9c6d' },
  { val: 2, label: 'um tanto', color: '#9a9b4d' },
  { val: 3, label: 'médio', color: '#c08b2e' },
  { val: 4, label: 'muito', color: '#c4652c' },
  { val: 5, label: 'enorme', color: '#b23b2b' },
];

const CRENCA_VALORES = ['0%', '25%', '50%', '75%', '100%'];
const LETRAS_OPCOES = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

export default function HistoriasClinicasPage() {
  const { currentUser } = useNeuro();
  const planInfo = resolveUserPlan(currentUser);

  // Navegação do Catálogo
  const [atual, setAtual] = useState<number>(0);
  const [busca, setBusca] = useState<string>('');
  const [hab, setHab] = useState<string>('');
  const [activeStoryNum, setActiveStoryNum] = useState<number | null>(null);

  // Estado da Sessão Ativa
  const [etapaAtiva, setEtapaAtiva] = useState<number>(0);
  const [fontSizeNarrativa, setFontSizeNarrativa] = useState<number>(17);
  const [lendoVoz, setLendoVoz] = useState<boolean>(false);
  const [salvandoStatus, setSalvandoStatus] = useState<'ok' | 'salvando'>('ok');
  
  // Notas e Seleções por História
  const [observarNotas, setObservarNotas] = useState<Record<string, string>>({});
  const [pensarNotas, setPensarNotas] = useState<Record<string, string>>({});
  const [agirNotas, setAgirNotas] = useState<Record<string, string>>({});
  const [intensidades, setIntensidades] = useState<Record<string, number | null>>({});
  const [crencas, setCrencas] = useState<Record<string, number | null>>({});
  const [respostas, setRespostas] = useState<Record<string, number | null>>({});
  const [opcoesCustomizadas, setOpcoesCustomizadas] = useState<Record<string, string[]>>({});
  const [novoTextoOpcao, setNovoTextoOpcao] = useState<string>('');
  
  // Controle de conclusão e Modo Paciente
  const [etapasFeitas, setEtapasFeitas] = useState<Record<string, [boolean, boolean, boolean]>>({});
  const [sessaoFinalizada, setSessaoFinalizada] = useState<boolean>(false);
  const [modoPacienteAberto, setModoPacienteAberto] = useState<boolean>(false);
  const [slidePaciente, setSlidePaciente] = useState<number>(0);
  const [copiadoTexto, setCopiadoTexto] = useState<boolean>(false);

  const currentFaixa = FAIXAS_TABS[atual] || FAIXAS_TABS[0];
  const historiasDaFaixa: HistoriaClinica[] = HISTORIAS[currentFaixa.id] || [];

  const currentStory: HistoriaClinica | undefined = activeStoryNum !== null 
    ? historiasDaFaixa.find(h => h.num === activeStoryNum) 
    : undefined;

  const storyKey = `${currentFaixa.id}_${activeStoryNum}`;

  // Sincroniza cores com a variável CSS da faixa
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.style.setProperty('--c', currentFaixa.c);
      document.documentElement.style.setProperty('--c2', currentFaixa.c2);
    }
  }, [currentFaixa]);

  // Renderizador de ilustração da história (imagem gerada com fallback para SVG)
  const renderStoryIllustration = (story: HistoriaClinica) => {
    return (
      <div style={{ width: '100%', height: '100%', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
        {story.image ? (
          <img
            src={story.image}
            alt={story.titulo}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            onError={(e) => {
              (e.currentTarget as HTMLElement).style.display = 'none';
              const nextEl = e.currentTarget.nextElementSibling as HTMLElement | null;
              if (nextEl) nextEl.style.display = 'flex';
            }}
          />
        ) : null}
        {story.illo ? (
          <div
            dangerouslySetInnerHTML={{ __html: story.illo }}
            style={{
              width: '100%',
              height: '100%',
              display: story.image ? 'none' : 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          />
        ) : (
          <div className="ph" style={{ display: story.image ? 'none' : 'flex' }}>
            <svg viewBox="0 0 24 24">
              <path d="M2 5h7a3 3 0 0 1 3 3v12a2 2 0 0 0-2-2H2zM22 5h-7a3 3 0 0 0-3 3v12a2 2 0 0 1 2-2h8z" />
            </svg>
            <span>Ilustração</span>
          </div>
        )}
      </div>
    );
  };

  // Lista de opções da etapa Agir (incluindo customizadas)
  const listaOpcoesAgir = currentStory 
    ? (opcoesCustomizadas[storyKey] || currentStory.parar.opcoes)
    : [];

  // Pistas sugeridas para a história
  const pistasSugeridas = currentStory ? [
    'Rosto / Expressão',
    'Batimentos cardíacos',
    'Mãos e punhos',
    'Voz e respiração',
    'Sensação no estômago'
  ] : [];

  // Filtro do Catálogo
  const habilidadesDisponiveis = Array.from(
    new Set(historiasDaFaixa.map(h => h.tag).filter(Boolean))
  ).sort();

  const q = busca.trim().toLowerCase();
  const historiasFiltradas = historiasDaFaixa.filter(h => {
    const matchHab = !hab || h.tag === hab;
    const matchBusca = !q || (h.titulo + ' ' + h.historia + ' ' + (h.tag || '') + ' ' + (h.theme || '')).toLowerCase().includes(q);
    return matchHab && matchBusca;
  });

  // Gatilho de salvamento simulado
  const dispararSalvamento = () => {
    setSalvandoStatus('salvando');
    setTimeout(() => {
      setSalvandoStatus('ok');
    }, 600);
  };

  // Leitura em voz alta
  const alternarVoz = (texto: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
      setLendoVoz(false);
      return;
    }
    const u = new SpeechSynthesisUtterance(texto);
    u.lang = 'pt-BR';
    u.rate = 0.92;
    u.onend = () => setLendoVoz(false);
    u.onerror = () => setLendoVoz(false);
    setLendoVoz(true);
    window.speechSynthesis.speak(u);
  };

  // Navegação entre histórias
  const irParaHistoria = (num: number) => {
    if (num >= 1 && num <= historiasDaFaixa.length) {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      setLendoVoz(false);
      setEtapaAtiva(0);
      setSessaoFinalizada(false);
      setActiveStoryNum(num);
    }
  };

  // Adicionar pista ao textarea de Observar
  const handleAdicionarPista = (pista: string) => {
    const atualTexto = observarNotas[storyKey] || '';
    const novoTexto = atualTexto ? `${atualTexto}\n• ${pista}: ` : `• ${pista}: `;
    setObservarNotas(prev => ({ ...prev, [storyKey]: novoTexto }));
    dispararSalvamento();
  };

  // Adicionar outra ideia na etapa Agir
  const handleAdicionarOutraOpcao = () => {
    if (!novoTextoOpcao.trim() || !currentStory) return;
    const base = opcoesCustomizadas[storyKey] || [...currentStory.parar.opcoes];
    const novaLista = [...base, novoTextoOpcao.trim()];
    setOpcoesCustomizadas(prev => ({ ...prev, [storyKey]: novaLista }));
    setRespostas(prev => ({ ...prev, [storyKey]: novaLista.length - 1 }));
    setNovoTextoOpcao('');
    dispararSalvamento();
  };

  // Concluir Etapa / Sessão
  const handleAvancarEtapa = () => {
    const concluidas = etapasFeitas[storyKey] || [false, false, false];
    concluidas[etapaAtiva] = true;
    setEtapasFeitas(prev => ({ ...prev, [storyKey]: [...concluidas] }));

    if (etapaAtiva < 2) {
      setEtapaAtiva(etapaAtiva + 1);
      const el = document.getElementById('etapas-player');
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      setSessaoFinalizada(true);
      setTimeout(() => {
        const elResumo = document.getElementById('resumo');
        if (elResumo) elResumo.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    }
  };

  // Copiar Resumo da Sessão
  const handleCopiarResumo = () => {
    if (!currentStory) return;
    const obs = observarNotas[storyKey] || '—';
    const pen = pensarNotas[storyKey] || '—';
    const agi = agirNotas[storyKey] || '—';
    const int = intensidades[storyKey] ? `${intensidades[storyKey]}/5` : 'Não pontuado';
    const cr = crencas[storyKey] !== null && crencas[storyKey] !== undefined ? `${crencas[storyKey]}%` : 'Não pontuado';
    const respIndex = respostas[storyKey];
    const respTxt = respIndex !== null && respIndex !== undefined && listaOpcoesAgir[respIndex] 
      ? listaOpcoesAgir[respIndex] 
      : 'Não selecionado';

    const texto = `${currentStory.titulo} (${currentFaixa.r} anos · ${currentStory.tag})\n\n` +
      `01 · OBSERVAR\nIntensidade: ${int}\nAnotações: ${obs}\n\n` +
      `02 · PENSAR\nCrença no pensamento: ${cr}\nAnotações: ${pen}\n\n` +
      `03 · AGIR\nResposta adaptativa: ${respTxt}\nAnotações: ${agi}`;

    if (navigator.clipboard) {
      navigator.clipboard.writeText(texto).then(() => {
        setCopiadoTexto(true);
        setTimeout(() => setCopiadoTexto(false), 2000);
      });
    }
  };

  // Recomeçar anotações da história
  const handleRecomecar = () => {
    if (confirm('Deseja limpar as anotações desta história e recomeçar a sessão?')) {
      setObservarNotas(prev => { const c = { ...prev }; delete c[storyKey]; return c; });
      setPensarNotas(prev => { const c = { ...prev }; delete c[storyKey]; return c; });
      setAgirNotas(prev => { const c = { ...prev }; delete c[storyKey]; return c; });
      setIntensidades(prev => { const c = { ...prev }; delete c[storyKey]; return c; });
      setCrencas(prev => { const c = { ...prev }; delete c[storyKey]; return c; });
      setRespostas(prev => { const c = { ...prev }; delete c[storyKey]; return c; });
      setEtapasFeitas(prev => { const c = { ...prev }; delete c[storyKey]; return c; });
      setSessaoFinalizada(false);
      setEtapaAtiva(0);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const statusEtapas = etapasFeitas[storyKey] || [false, false, false];
  const progressoPercent = (statusEtapas.filter(Boolean).length / 3) * 100;

  return (
    <PlatformShell activePage="recursos">
      {!planInfo.hasRecursos ? (
        <PraticaGate />
      ) : (
        <div className="wrap" id="pg">
          {!currentStory ? (
            /* ========================================================
               1. VISTA: CATÁLOGO DE HISTÓRIAS CLÍNICAS
               ======================================================== */
            <>
              {/* Breadcrumb */}
              <nav className="crumb" aria-label="Caminho">
                <Link href="/recursos-interativos">← Recursos interativos</Link>
                <span>/</span>
                <b>Histórias Clínicas</b>
              </nav>

              {/* Header com Kick, Título e Estatísticas */}
              <div className="hd4">
                <div>
                  <div className="kick">Intervenção cognitivo-comportamental</div>
                  <h1>
                    Histórias <em>Clínicas</em>.
                  </h1>
                  <p>
                    50 narrativas ilustradas para treinar autorregulação emocional, identificar pensamentos automáticos e buscar respostas adaptativas, organizadas por faixa etária.
                  </p>
                </div>
                <div className="stats">
                  <div>
                    <b>50</b>
                    <span>histórias ilustradas</span>
                  </div>
                  <div>
                    <b>5</b>
                    <span>faixas etárias</span>
                  </div>
                  <div>
                    <b>3</b>
                    <span>etapas clínicas</span>
                  </div>
                </div>
              </div>

              {/* 3 Etapas Clínicas Informativas */}
              <div className="etapas">
                <div>
                  <i>01</i>
                  <span>
                    <b>Observar</b>
                    <small>Perceber o corpo e a emoção</small>
                  </span>
                </div>
                <div>
                  <i>02</i>
                  <span>
                    <b>Pensar</b>
                    <small>Rever o pensamento automático</small>
                  </span>
                </div>
                <div>
                  <i>03</i>
                  <span>
                    <b>Agir</b>
                    <small>Escolher a resposta adaptativa</small>
                  </span>
                </div>
              </div>

              {/* Seletor de Faixas Etárias */}
              <div className="faixas" role="tablist" aria-label="Faixa etária" id="faixas">
                {FAIXAS_TABS.map((f, i) => (
                  <button
                    key={f.id}
                    type="button"
                    className="faixa"
                    role="tab"
                    aria-selected={atual === i}
                    onClick={() => {
                      setAtual(i);
                      setBusca('');
                      setHab('');
                    }}
                    style={{ ['--c' as any]: f.c }}
                  >
                    <i>{i + 1}</i>
                    <span>
                      <b>{f.r} anos</b>
                      <small>{f.n}</small>
                    </span>
                  </button>
                ))}
              </div>

              {/* Cabeçalho da Lista com Filtros */}
              <div className="lista-hd">
                <div>
                  <h2 id="lt">
                    Histórias para <em>{currentFaixa.r} anos</em> · {currentFaixa.n}
                  </h2>
                  <p>Selecione uma história para abrir a sessão guiada, com ilustração e exercícios.</p>
                </div>
                <div className="ferr">
                  <input
                    id="busca"
                    type="search"
                    placeholder="Buscar história"
                    aria-label="Buscar história"
                    value={busca}
                    onChange={(e) => setBusca(e.target.value)}
                  />
                  <select
                    id="hab"
                    aria-label="Filtrar por habilidade"
                    value={hab}
                    onChange={(e) => setHab(e.target.value)}
                  >
                    <option value="">Todas as habilidades</option>
                    {habilidadesDisponiveis.map((habil) => (
                      <option key={habil} value={habil}>
                        {habil}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Grid de Cards das Histórias */}
              <div className="grid-h" id="grid">
                {historiasFiltradas.length === 0 ? (
                  <div className="vazio">
                    <b>Nenhuma história encontrada</b>
                    Tente outra busca ou habilidade.
                  </div>
                ) : (
                  historiasFiltradas.map((h) => {
                    const n = ('0' + h.num).slice(-2);
                    return (
                      <div
                        key={h.num}
                        className="hcard"
                        onClick={() => irParaHistoria(h.num)}
                        style={{
                          ['--c' as any]: currentFaixa.c,
                          ['--c2' as any]: currentFaixa.c2,
                        }}
                      >
                        <div className="ilu">
                          {renderStoryIllustration(h)}
                          <span className="num">#{n}</span>
                          <span className="emo">{h.theme || h.tag}</span>
                        </div>
                        <div className="hc-body">
                          <span className="hab">{h.tag}</span>
                          <h3>{h.titulo}</h3>
                          <p>{h.historia}</p>
                          <div className="hc-foot">
                            <span>Abrir sessão</span>
                            <i>→</i>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Nota de Apoio no Rodapé */}
              <div className="nota-uso">
                <svg viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="9" />
                  <path d="M12 11v5M12 8v.01" />
                </svg>
                <span>
                  <b>Material de apoio.</b> As histórias complementam o seu planejamento clínico e não substituem a avaliação nem o julgamento profissional. Não registre dados que identifiquem pacientes.
                </span>
              </div>
            </>
          ) : (
            /* ========================================================
               2. VISTA: SESSÃO GUIADA COMPLETA DA HISTÓRIA
               ======================================================== */
            <>
              {/* Barra de Navegação Superior da História */}
              <div className="navh">
                <nav className="crumb" aria-label="Caminho">
                  <button
                    type="button"
                    onClick={() => {
                      if (typeof window !== 'undefined' && window.speechSynthesis) {
                        window.speechSynthesis.cancel();
                      }
                      setLendoVoz(false);
                      setActiveStoryNum(null);
                    }}
                    style={{ background: 'none', border: 0, padding: 0, cursor: 'pointer', font: 'inherit', color: 'inherit' }}
                  >
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontWeight: 700, color: 'var(--ink-mute)' }}>
                      <ChevronLeft size={16} /> Histórias Clínicas
                    </span>
                  </button>
                  <span>/</span>
                  <span id="cr-fx">{currentFaixa.r} anos</span>
                  <span>/</span>
                  <b id="cr-t">{currentStory.titulo}</b>
                </nav>

                <div className="pos">
                  <span className="pos-txt" id="pos-txt">
                    História {currentStory.num} de {historiasDaFaixa.length}
                  </span>
                  <span className="dots" id="dots">
                    {historiasDaFaixa.map((h) => (
                      <button
                        key={h.num}
                        type="button"
                        aria-label={`Ir para história ${h.num}`}
                        className={h.num === currentStory.num ? 'on' : ''}
                        onClick={() => irParaHistoria(h.num)}
                      />
                    ))}
                  </span>
                  <button
                    type="button"
                    className="pn"
                    onClick={() => irParaHistoria(currentStory.num - 1)}
                    aria-disabled={currentStory.num <= 1}
                  >
                    <ChevronLeft size={16} /> Anterior
                  </button>
                  <button
                    type="button"
                    className="pn"
                    onClick={() => irParaHistoria(currentStory.num + 1)}
                    aria-disabled={currentStory.num >= historiasDaFaixa.length}
                  >
                    Próxima <ChevronRight size={16} />
                  </button>
                </div>
              </div>

              {/* Artigo da História com Ilustração e Ferramentas */}
              <article className="hist">
                <div className="ilu" id="ilu">
                  {renderStoryIllustration(currentStory)}
                  <span className="num">#{('0' + currentStory.num).slice(-2)}</span>
                  <div className="foco">
                    <i>
                      <svg className="ico" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="9" />
                        <path d="M8.5 15s1.2-1.5 3.5-1.5 3.5 1.5 3.5 1.5M9 9.5h.01M15 9.5h.01" />
                      </svg>
                    </i>
                    <span>
                      <small>Foco clínico</small>
                      <b>{currentStory.theme || currentStory.tag}</b>
                    </span>
                  </div>
                </div>

                <div className="txt">
                  <div className="tags" id="tags">
                    <span className="tag2 fx">{currentFaixa.r} anos · {currentFaixa.n}</span>
                    <span className="tag2">{currentStory.tag}</span>
                  </div>

                  <h1 id="titulo">{currentStory.titulo}</h1>

                  <div className="narra">
                    <p id="narra" style={{ ['--fz' as any]: `${fontSizeNarrativa}px` }}>
                      {currentStory.historia}
                    </p>
                  </div>

                  <div className="ferr">
                    <button
                      className="bt pri"
                      id="b-pac"
                      type="button"
                      onClick={() => {
                        setSlidePaciente(0);
                        setModoPacienteAberto(true);
                      }}
                    >
                      <Maximize2 size={16} className="ico" />
                      <span>Mostrar ao paciente</span>
                    </button>

                    <button
                      className="bt"
                      id="b-voz"
                      type="button"
                      aria-pressed={lendoVoz}
                      onClick={() => alternarVoz(currentStory.historia)}
                    >
                      {lendoVoz ? <VolumeX size={16} className="ico" /> : <Volume2 size={16} className="ico" />}
                      <span className="lg">{lendoVoz ? 'Parar voz' : 'Ler em voz alta'}</span>
                    </button>

                    <div className="fz" role="group" aria-label="Tamanho do texto">
                      <button
                        type="button"
                        onClick={() => setFontSizeNarrativa(prev => Math.max(14, prev - 2))}
                        aria-label="Diminuir texto"
                      >
                        A−
                      </button>
                      <button
                        type="button"
                        onClick={() => setFontSizeNarrativa(prev => Math.min(24, prev + 2))}
                        aria-label="Aumentar texto"
                      >
                        A+
                      </button>
                    </div>
                  </div>
                </div>
              </article>

              {/* Cabeçalho da Sessão Guiada */}
              <div className="ses-hd">
                <div>
                  <div className="kick">Sessão guiada</div>
                  <h2>
                    Trabalhe a história em <em>três etapas</em>.
                  </h2>
                </div>
                <span className="salvo" id="salvo" data-s={salvandoStatus}>
                  <i></i>
                  <span>{salvandoStatus === 'salvando' ? 'Salvando…' : 'Anotações salvas'}</span>
                </span>
              </div>

              {/* Tabs das 3 Etapas */}
              <div className="etapas player" role="tablist" aria-label="Etapas da sessão" id="etapas-player">
                <button
                  className={`etp ${statusEtapas[0] ? 'feito' : ''}`}
                  role="tab"
                  aria-selected={etapaAtiva === 0}
                  onClick={() => setEtapaAtiva(0)}
                >
                  <i><span>01</span></i>
                  <span>
                    <b>Observar</b>
                    <small>Perceber o corpo e a emoção</small>
                  </span>
                </button>
                <button
                  className={`etp ${statusEtapas[1] ? 'feito' : ''}`}
                  role="tab"
                  aria-selected={etapaAtiva === 1}
                  onClick={() => setEtapaAtiva(1)}
                >
                  <i><span>02</span></i>
                  <span>
                    <b>Pensar</b>
                    <small>Rever o pensamento automático</small>
                  </span>
                </button>
                <button
                  className={`etp ${statusEtapas[2] ? 'feito' : ''}`}
                  role="tab"
                  aria-selected={etapaAtiva === 2}
                  onClick={() => setEtapaAtiva(2)}
                >
                  <i><span>03</span></i>
                  <span>
                    <b>Agir</b>
                    <small>Escolher a resposta adaptativa</small>
                  </span>
                </button>
              </div>

              {/* Barra de Progresso das Etapas */}
              <div className="barra">
                <span id="barra" style={{ width: `${progressoPercent}%` }}></span>
              </div>

              {/* ================= PAINEL 0: OBSERVAR ================= */}
              {etapaAtiva === 0 && (
                <section className="painel entra" role="tabpanel" id="p0">
                  <div className="cartao">
                    <span className="rot">Pergunta clínica</span>
                    <p className="perg" id="obs-p">{currentStory.observar.pergunta}</p>
                    <p className="dica" id="obs-d">Explore rosto, mãos, respiração e reações corporais com o paciente.</p>

                    <div className="sub">
                      <span className="rot">Pistas da história · toque para anotar</span>
                      <div className="pistas" id="pistas">
                        {pistasSugeridas.map((pista) => (
                          <button
                            key={pista}
                            className="pista"
                            type="button"
                            onClick={() => handleAdicionarPista(pista)}
                          >
                            {pista}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="sub">
                      <span className="rot">Termômetro da emoção</span>
                      <p className="dica" style={{ marginTop: '6px' }}>
                        Quanto <b id="obs-emo">{currentStory.theme || 'essa emoção'}</b> o paciente acha que o personagem sentiu?
                      </p>
                      <div className="term" role="radiogroup" aria-label="Intensidade da emoção" id="term">
                        {TERMOMETRO_VALORES.map((t) => (
                          <button
                            key={t.val}
                            type="button"
                            role="radio"
                            aria-checked={intensidades[storyKey] === t.val}
                            onClick={() => {
                              setIntensidades(prev => ({ ...prev, [storyKey]: t.val }));
                              dispararSalvamento();
                            }}
                            style={{ ['--t' as any]: t.color }}
                          >
                            {t.val}
                            <small>{t.label}</small>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="folha">
                    <div className="folha-hd">
                      <span><b>01</b>Anotações · Observar</span>
                    </div>
                    <div className="sheet">
                      <textarea
                        data-campo="observar"
                        aria-label="Anotações da etapa Observar"
                        placeholder="Anote com o paciente: sensações no corpo, expressões, tom de voz, intensidade…"
                        value={observarNotas[storyKey] || ''}
                        onChange={(e) => {
                          setObservarNotas(prev => ({ ...prev, [storyKey]: e.target.value }));
                          dispararSalvamento();
                        }}
                      />
                      <div className="sheet-f">
                        <svg className="ico" viewBox="0 0 24 24">
                          <path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6z" />
                        </svg>
                        Visível só para você. Não registre dados que identifiquem pacientes.
                        <em>{(observarNotas[storyKey] || '').length}</em>
                      </div>
                    </div>
                  </div>
                </section>
              )}

              {/* ================= PAINEL 1: PENSAR ================= */}
              {etapaAtiva === 1 && (
                <section className="painel entra" role="tabpanel" id="p1">
                  <div className="cartao">
                    <span className="rot">Pensamento automático</span>
                    <div className="balao">
                      <p id="pen-p">&ldquo;{currentStory.pensamento.texto}&rdquo;</p>
                      <small id="pen-q">O que o personagem pensou</small>
                    </div>

                    <div className="sub" style={{ marginTop: '34px' }}>
                      <span className="rot">Reflexão</span>
                      <p className="perg" id="pen-r">{currentStory.pensamento.pergunta}</p>
                    </div>

                    <div className="sub">
                      <span className="rot">O quanto esse pensamento é verdadeiro?</span>
                      <div className="cren" role="radiogroup" aria-label="Crença no pensamento" id="cren">
                        {CRENCA_VALORES.map((c, i) => {
                          const val = i * 25;
                          return (
                            <button
                              key={c}
                              type="button"
                              role="radio"
                              aria-checked={crencas[storyKey] === val}
                              onClick={() => {
                                setCrencas(prev => ({ ...prev, [storyKey]: val }));
                                dispararSalvamento();
                              }}
                            >
                              {c}
                            </button>
                          );
                        })}
                      </div>
                      <div className="cren-l">
                        <span>Nada verdadeiro</span>
                        <span>Totalmente</span>
                      </div>
                    </div>
                  </div>

                  <div className="folha">
                    <div className="folha-hd">
                      <span><b>02</b>Anotações · Pensar</span>
                    </div>
                    <div className="sheet">
                      <textarea
                        data-campo="pensar"
                        aria-label="Anotações da etapa Pensar"
                        placeholder="Anote o pensamento alternativo ou a reestruturação cognitiva construída com o paciente…"
                        value={pensarNotas[storyKey] || ''}
                        onChange={(e) => {
                          setPensarNotas(prev => ({ ...prev, [storyKey]: e.target.value }));
                          dispararSalvamento();
                        }}
                      />
                      <div className="sheet-f">
                        <svg className="ico" viewBox="0 0 24 24">
                          <path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6z" />
                        </svg>
                        Visível só para você. Não registre dados que identifiquem pacientes.
                        <em>{(pensarNotas[storyKey] || '').length}</em>
                      </div>
                    </div>
                  </div>
                </section>
              )}

              {/* ================= PAINEL 2: AGIR ================= */}
              {etapaAtiva === 2 && (
                <section className="painel entra" role="tabpanel" id="p2">
                  <div className="cartao">
                    <span className="rot">Escolha de resposta</span>
                    <p className="perg" id="agi-p">{currentStory.parar.pergunta}</p>

                    <div className="ops" role="radiogroup" id="ops">
                      {listaOpcoesAgir.map((opcao, optIdx) => (
                        <label
                          key={optIdx}
                          className={`op ${respostas[storyKey] === optIdx ? 'sel' : ''}`}
                          onClick={() => {
                            setRespostas(prev => ({ ...prev, [storyKey]: optIdx }));
                            dispararSalvamento();
                          }}
                        >
                          <input
                            type="radio"
                            name="resp"
                            value={optIdx}
                            checked={respostas[storyKey] === optIdx}
                            onChange={() => {}}
                          />
                          <i>{LETRAS_OPCOES[optIdx] || optIdx + 1}</i>
                          <span>{opcao}</span>
                        </label>
                      ))}
                    </div>

                    <div className="outra" style={{ marginTop: '14px' }}>
                      <input
                        id="outra"
                        type="text"
                        placeholder="Outra ideia do paciente…"
                        aria-label="Outra resposta sugerida pelo paciente"
                        value={novoTextoOpcao}
                        onChange={(e) => setNovoTextoOpcao(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAdicionarOutraOpcao();
                          }
                        }}
                      />
                      <button
                        className="bt"
                        type="button"
                        id="b-outra"
                        onClick={handleAdicionarOutraOpcao}
                      >
                        Adicionar
                      </button>
                    </div>
                  </div>

                  <div className="folha">
                    <div className="folha-hd">
                      <span><b>03</b>Anotações · Agir</span>
                    </div>
                    <div className="sheet">
                      <textarea
                        data-campo="agir"
                        aria-label="Anotações da etapa Agir"
                        placeholder="Por que essa resposta ajuda? Combine com o paciente quando usar em casa ou na escola…"
                        value={agirNotas[storyKey] || ''}
                        onChange={(e) => {
                          setAgirNotas(prev => ({ ...prev, [storyKey]: e.target.value }));
                          dispararSalvamento();
                        }}
                      />
                      <div className="sheet-f">
                        <svg className="ico" viewBox="0 0 24 24">
                          <path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6z" />
                        </svg>
                        Visível só para você. Não registre dados que identifiquem pacientes.
                        <em>{(agirNotas[storyKey] || '').length}</em>
                      </div>
                    </div>
                  </div>
                </section>
              )}

              {/* Botões do Stepper */}
              <div className="passos">
                <button
                  className="bt"
                  type="button"
                  id="voltar"
                  onClick={() => setEtapaAtiva(prev => Math.max(0, prev - 1))}
                  style={{ visibility: etapaAtiva > 0 ? 'visible' : 'hidden' }}
                >
                  <ChevronLeft size={16} /> Etapa anterior
                </button>
                <button
                  className="bt pri"
                  type="button"
                  id="avancar"
                  onClick={handleAvancarEtapa}
                >
                  <span>{etapaAtiva < 2 ? 'Concluir etapa' : 'Concluir sessão'}</span>
                  <ChevronRight size={16} />
                </button>
              </div>

              {/* ================= RESUMO CONCLUÍDO ================= */}
              {sessaoFinalizada && (
                <section className="resumo" id="resumo" aria-live="polite">
                  <div className="kick">Sessão concluída</div>
                  <h3 id="r-t">
                    {currentStory.titulo} · <em>sessão registrada</em>.
                  </h3>
                  <div className="rgrid">
                    <div>
                      <small>01 · Observar</small>
                      <p id="r0">
                        {intensidades[storyKey] ? `Intensidade da emoção: ${intensidades[storyKey]}/5\n` : ''}
                        {observarNotas[storyKey] || 'Sem anotações nesta etapa.'}
                      </p>
                    </div>
                    <div>
                      <small>02 · Pensar</small>
                      <p id="r1">
                        {crencas[storyKey] !== null && crencas[storyKey] !== undefined ? `Crença no pensamento: ${crencas[storyKey]}%\n` : ''}
                        {pensarNotas[storyKey] || 'Sem anotações nesta etapa.'}
                      </p>
                    </div>
                    <div>
                      <small>03 · Agir</small>
                      <p id="r2">
                        {respostas[storyKey] !== null && respostas[storyKey] !== undefined && listaOpcoesAgir[respostas[storyKey]!]
                          ? `Resposta escolhida: ${listaOpcoesAgir[respostas[storyKey]!]}\n`
                          : ''}
                        {agirNotas[storyKey] || 'Sem anotações nesta etapa.'}
                      </p>
                    </div>
                  </div>

                  <div className="racoes">
                    {currentStory.num < historiasDaFaixa.length ? (
                      <button
                        className="bt lime"
                        type="button"
                        id="r-prox"
                        onClick={() => irParaHistoria(currentStory.num + 1)}
                      >
                        Próxima história <ChevronRight size={16} />
                      </button>
                    ) : (
                      <button
                        className="bt lime"
                        type="button"
                        onClick={() => setActiveStoryNum(null)}
                      >
                        Voltar ao catálogo <ChevronRight size={16} />
                      </button>
                    )}

                    <button
                      className="bt"
                      type="button"
                      id="r-copiar"
                      onClick={handleCopiarResumo}
                    >
                      <Copy size={15} />
                      <span>{copiadoTexto ? 'Copiado!' : 'Copiar resumo'}</span>
                    </button>

                    <button
                      className="bt"
                      type="button"
                      id="r-imp"
                      onClick={() => window.print()}
                    >
                      <Printer size={15} /> Imprimir
                    </button>

                    <button
                      className="bt"
                      type="button"
                      id="r-nova"
                      onClick={handleRecomecar}
                    >
                      <RotateCcw size={15} /> Recomeçar
                    </button>
                  </div>
                </section>
              )}

              {/* Nota de Rodapé */}
              <div className="nota-uso">
                <svg viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="9" />
                  <path d="M12 11v5M12 8v.01" />
                </svg>
                <span>
                  <b>Material de apoio.</b> As histórias complementam o seu planejamento clínico e não substituem a avaliação nem o julgamento profissional. Adapte as perguntas à linguagem e ao momento do paciente.
                </span>
              </div>

              {/* ================= MODAL DO MODO PACIENTE ================= */}
              {modoPacienteAberto && (
                <div className="pac" role="dialog" aria-modal="true" aria-label="Modo paciente">
                  <div className="pac-top">
                    <span className="pt" id="pac-pt">
                      {[0, 1, 2, 3].map((idx) => (
                        <span key={idx} className={slidePaciente >= idx ? 'on' : ''} />
                      ))}
                    </span>
                    <button
                      className="bt"
                      type="button"
                      id="pac-x"
                      onClick={() => setModoPacienteAberto(false)}
                    >
                      <X size={16} /> Sair <kbd style={{ font: '10px var(--fm)', opacity: 0.6 }}>ESC</kbd>
                    </button>
                  </div>

                  <div className="pac-st" id="pac-st">
                    {slidePaciente === 0 && (
                      <div className="sl">
                        <div className="ilu">
                          {renderStoryIllustration(currentStory)}
                        </div>
                        <div>
                          <span className="rot">{currentStory.titulo}</span>
                          <p className="big" style={{ marginTop: '14px' }}>
                            {currentStory.historia}
                          </p>
                        </div>
                      </div>
                    )}

                    {slidePaciente === 1 && (
                      <div className="sl uma">
                        <span className="rot">01 · Observar</span>
                        <h2 style={{ marginTop: '16px' }}>{currentStory.observar.pergunta}</h2>
                      </div>
                    )}

                    {slidePaciente === 2 && (
                      <div className="sl uma">
                        <span className="rot">02 · Pensar</span>
                        <div>
                          <div className="balao">
                            <p>&ldquo;{currentStory.pensamento.texto}&rdquo;</p>
                            <small>O que o personagem pensou</small>
                          </div>
                        </div>
                        <p className="reflex">{currentStory.pensamento.pergunta}</p>
                      </div>
                    )}

                    {slidePaciente === 3 && (
                      <div className="sl uma">
                        <span className="rot">03 · Agir</span>
                        <h2 style={{ marginTop: '16px' }}>{currentStory.parar.pergunta}</h2>
                        <div className="ops">
                          {listaOpcoesAgir.map((opcao, optIdx) => (
                            <label
                              key={optIdx}
                              className={`op ${respostas[storyKey] === optIdx ? 'sel' : ''}`}
                              onClick={() => setRespostas(prev => ({ ...prev, [storyKey]: optIdx }))}
                            >
                              <input
                                type="radio"
                                name="pac-resp"
                                value={optIdx}
                                checked={respostas[storyKey] === optIdx}
                                onChange={() => {}}
                              />
                              <i>{LETRAS_OPCOES[optIdx] || optIdx + 1}</i>
                              <span>{opcao}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="pac-nav">
                    <button
                      className="bt"
                      type="button"
                      id="pac-a"
                      onClick={() => setSlidePaciente(prev => Math.max(0, prev - 1))}
                      style={{ visibility: slidePaciente > 0 ? 'visible' : 'hidden' }}
                    >
                      <ChevronLeft size={16} /> Voltar
                    </button>
                    <button
                      className="bt pri"
                      type="button"
                      id="pac-p"
                      onClick={() => {
                        if (slidePaciente < 3) {
                          setSlidePaciente(prev => prev + 1);
                        } else {
                          setModoPacienteAberto(false);
                        }
                      }}
                    >
                      <span>{slidePaciente < 3 ? 'Avançar' : 'Concluir'}</span>
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </PlatformShell>
  );
}
