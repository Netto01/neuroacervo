'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { NeuroProvider, useNeuro } from '@/context/NeuroContext';
import { PlatformShell } from '@/components/layout/PlatformShell';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Plus, 
  Minus, 
  BookOpen, 
  Sparkles, 
  Layers, 
  Timer, 
  Check, 
  ChevronLeft, 
  ChevronRight,
  ArrowRight
} from 'lucide-react';

const EXECUTIVE_CARDS = [
  { id: 1, categoria: 'Planejamento', titulo: 'Decomposição em Metas', prompt: 'Divida a tarefa complexa em 3 subtarefas de até 15 minutos cada.', dica: 'Ajuda a contornar paralisia inicial e sobrecarga de memória de trabalho.' },
  { id: 2, categoria: 'Flexibilidade', titulo: 'Mudança de Perspectiva', prompt: 'Se sua primeira estratégia falhar, formule imediatamente uma via alternativa oposta.', dica: 'Estimula a alternância de set cognitivo em situações de frustração.' },
  { id: 3, categoria: 'Controle Inibitório', titulo: 'Pausa Estratégica (Stop & Think)', prompt: 'Conte mentalmente 3 segundos antes de registrar a resposta final.', dica: 'Reduz erros por impulsividade motora ou cognitiva em testagens.' },
  { id: 4, categoria: 'Memória de Trabalho', titulo: 'Chunking / Agrupamento', prompt: 'Agrupe a sequência numérica ou verbal em blocos de 2 a 3 itens com significado.', dica: 'Expande a capacidade aparente de retenção do span imediato.' },
  { id: 5, categoria: 'Monitoramento', titulo: 'Checagem de Qualidade', prompt: 'Revise o resultado final comparando estritamente com o critério inicial exigido.', dica: 'Treina a autocrítica metacognitiva e a detecção autônoma de inconsistências.' }
];

const HISTORIAS_TEMATICAS = [
  {
    id: 1,
    titulo: 'A Rotina Escolar de Lucas',
    contexto: 'Avaliação de compreensão auditiva, retenção episódica e inferência lógica.',
    etapas: [
      { passo: 1, texto: 'Lucas acordou às 7 horas. Ao colocar a mochila nas costas, percebeu que havia esquecido o estojo sobre a escrivaninha.', pergunta: 'O que Lucas havia esquecido antes de sair de casa?' },
      { passo: 2, texto: 'Na escola, a professora pediu para a turma abrir o caderno na lição de matemática, mas o lápis de Lucas estava sem ponta.', pergunta: 'Qual era a matéria e qual obstáculo Lucas encontrou?' },
      { passo: 3, texto: 'Seu colega Gabriel emprestou um apontador, e Lucas conseguiu terminar a tarefa antes do sinal do recreio tocar.', pergunta: 'Como o problema foi resolvido e quem ajudou Lucas?' }
    ]
  },
  {
    id: 2,
    titulo: 'O Passeio no Parque com a Avó',
    contexto: 'Avaliação de sequenciamento temporal, atenção seletiva e vocabulário contextual.',
    etapas: [
      { passo: 1, texto: 'Dona Clara levou seu neto Pedro para caminhar no parque municipal em uma manhã ensolarada de primavera.', pergunta: 'Quem eram os personagens e qual era o local do passeio?' },
      { passo: 2, texto: 'Eles viram patos nadando no lago e pararam para alimentar os peixes com migalhas de pão.', pergunta: 'Quais animais eles observaram no caminho?' },
      { passo: 3, texto: 'Antes de voltar para casa, compraram água de coco e sentaram-se em um banco de madeira sob a sombra de uma árvore.', pergunta: 'O que fizeram antes de retornar para casa?' }
    ]
  }
];

import { resolveUserPlan } from '@/utils/userPlan';

function RecursosInterativosInner() {
  const { currentUser } = useNeuro();
  const planInfo = resolveUserPlan(currentUser);

  const [activeTool, setActiveTool] = useState<'cronometro' | 'baralho' | 'historias'>('cronometro');

  // Cronômetro Clínico
  const [seconds, setSeconds] = useState<number>(0);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [erros, setErros] = useState<number>(0);
  const [acertos, setAcertos] = useState<number>(0);
  const [registros, setRegistros] = useState<{ id: number; tempo: string; erros: number; acertos: number }[]>([]);

  useEffect(() => {
    let interval: any = null;
    if (isRunning) {
      interval = setInterval(() => {
        setSeconds((s) => s + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handleReset = () => {
    setIsRunning(false);
    setSeconds(0);
    setErros(0);
    setAcertos(0);
  };

  const handleLap = () => {
    const novo = {
      id: Date.now(),
      tempo: formatTime(seconds),
      erros,
      acertos
    };
    setRegistros([novo, ...registros]);
  };

  // Baralho de Funções Executivas
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [cardFlipped, setCardFlipped] = useState(false);
  const currentCard = EXECUTIVE_CARDS[currentCardIndex];

  // Histórias Temáticas
  const [activeStoryId, setActiveStoryId] = useState(1);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const currentStory = HISTORIAS_TEMATICAS.find(h => h.id === activeStoryId) || HISTORIAS_TEMATICAS[0];
  const currentStep = currentStory.etapas[currentStepIndex];

  return (
    <PlatformShell activePage="recursos">
      {/* Header */}
      <div className="lib-head">
        <div>
          <span className="label">Tecnologia Clínica</span>
          <h1>Recursos <em>interativos</em><span className="dot">.</span></h1>
          <p>Ferramentas dinâmicas para apoiar sua aplicação prática de testes, cronometragem precisa com contagem de erros, cartas clínicas e histórias ilustradas para sessões.</p>
        </div>
        <div className="stats" aria-label="Estatísticas">
          <div className="stat">
            <b>3</b>
            <span>ferramentas ativas</span>
          </div>
          <div className="stat">
            <b>100%</b>
            <span>interativo</span>
          </div>
          <div className="stat">
            <b>0</b>
            <span>instalações necessárias</span>
          </div>
        </div>
      </div>

      {!planInfo.hasRecursos ? (
        <div className="empty-state" style={{ marginTop: '32px' }}>
          <span className="ring">
            <svg className="ico"><use href="#i-lock"/></svg>
          </span>
          <h3>Recursos Interativos Disponíveis no Plano Prática</h3>
          <p>
            Seu plano atual no perfil é <b>{planInfo.nome}</b>. O Cronômetro Clínico com contagem de erros, o Baralho de Funções Executivas e as Histórias Temáticas fazem parte do plano <b>Prática</b>.
          </p>
          <Link className="btn" href="/#planos" style={{ marginTop: '8px' }}>
            <span>Fazer upgrade para o Plano Prática</span>
            <svg className="ico sm"><use href="#i-arrow"/></svg>
          </Link>
        </div>
      ) : (
        <>
          {/* Seletor de Ferramenta */}
          <div className="tabs" style={{ marginTop: '24px' }}>
            <button
              className="tab"
              type="button"
              aria-pressed={activeTool === 'cronometro'}
              onClick={() => setActiveTool('cronometro')}
            >
              <Timer className="w-4 h-4" />
              <span>Cronômetro Clínico &amp; Erros</span>
            </button>
        <button
          className="tab"
          type="button"
          aria-pressed={activeTool === 'baralho'}
          onClick={() => setActiveTool('baralho')}
        >
          <Layers className="w-4 h-4" />
          <span>Baralho de Funções Executivas</span>
        </button>
        <button
          className="tab"
          type="button"
          aria-pressed={activeTool === 'historias'}
          onClick={() => setActiveTool('historias')}
        >
          <BookOpen className="w-4 h-4" />
          <span>Histórias Temáticas &amp; Compreensão</span>
        </button>
      </div>

      {/* Ferramenta 1: Cronômetro Clínico */}
      {activeTool === 'cronometro' && (
        <div style={{ marginTop: '28px', display: 'grid', gridTemplateColumns: 'minmax(0, 1.4fr) minmax(0, 1fr)', gap: '24px' }}>
          <div style={{ background: 'var(--bone)', borderRadius: '24px', border: '1px solid #15140f0f', padding: '36px 28px', textAlign: 'center', boxShadow: 'var(--shadow)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
            <span style={{ fontSize: '11px', fontFamily: 'var(--mono)', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--ink-faint)' }}>
              Cronometragem de Testagem (Stroop, Trilhas, TAVEC, Dígitos)
            </span>

            <div style={{ fontSize: '72px', fontWeight: 800, fontFamily: 'var(--mono)', letterSpacing: '-0.04em', color: 'var(--ink)' }}>
              {formatTime(seconds)}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <button
                type="button"
                onClick={() => setIsRunning(!isRunning)}
                className="btn"
                style={{ padding: '14px 28px', fontSize: '15px' }}
              >
                {isRunning ? (
                  <>Pausar <span><Pause className="w-4 h-4" /></span></>
                ) : (
                  <>Iniciar <span><Play className="w-4 h-4 fill-current ml-0.5" /></span></>
                )}
              </button>

              <button
                type="button"
                onClick={handleLap}
                disabled={seconds === 0}
                className="btn-ghost"
                style={{ padding: '13px 20px', opacity: seconds === 0 ? 0.4 : 1 }}
              >
                Registrar parcial
              </button>

              <button
                type="button"
                onClick={handleReset}
                className="icon-btn"
                title="Zerar cronômetro"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>

            {/* Contadores Clínicos de Erros e Acertos */}
            <div style={{ width: '100%', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', borderTop: '1px solid var(--line)', paddingTop: '20px', marginTop: '10px' }}>
              <div style={{ background: 'var(--paper)', borderRadius: '16px', padding: '16px', border: '1px solid var(--line)' }}>
                <span style={{ fontSize: '11px', fontFamily: 'var(--mono)', textTransform: 'uppercase', color: 'var(--accent-strong)', fontWeight: 600 }}>
                  Acertos / Respostas
                </span>
                <div style={{ fontSize: '32px', fontWeight: 800, margin: '8px 0' }}>
                  {acertos}
                </div>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                  <button type="button" onClick={() => setAcertos(a => Math.max(0, a - 1))} className="icon-btn" style={{ width: 34, height: 34 }}>
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <button type="button" onClick={() => setAcertos(a => a + 1)} className="btn" style={{ padding: '6px 14px', fontSize: '13px' }}>
                    +1 Acerto
                  </button>
                </div>
              </div>

              <div style={{ background: 'var(--paper)', borderRadius: '16px', padding: '16px', border: '1px solid var(--line)' }}>
                <span style={{ fontSize: '11px', fontFamily: 'var(--mono)', textTransform: 'uppercase', color: '#9c3f33', fontWeight: 600 }}>
                  Erros / Intrusões
                </span>
                <div style={{ fontSize: '32px', fontWeight: 800, margin: '8px 0', color: '#9c3f33' }}>
                  {erros}
                </div>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                  <button type="button" onClick={() => setErros(e => Math.max(0, e - 1))} className="icon-btn" style={{ width: 34, height: 34 }}>
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <button type="button" onClick={() => setErros(e => e + 1)} className="btn" style={{ padding: '6px 14px', fontSize: '13px', background: '#9c3f33' }}>
                    +1 Erro
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Histórico de Parciais */}
          <div style={{ background: 'var(--bone)', borderRadius: '24px', border: '1px solid #15140f0f', padding: '24px', boxShadow: 'var(--shadow)', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '14px', borderBottom: '1px solid var(--line)' }}>
              <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, fontFamily: 'var(--sans)' }}>
                Registros Parciais da Sessão
              </h3>
              {registros.length > 0 && (
                <button type="button" onClick={() => setRegistros([])} className="clear">
                  Limpar lista
                </button>
              )}
            </div>

            {registros.length === 0 ? (
              <div style={{ padding: '48px 16px', textAlign: 'center', color: 'var(--ink-faint)', fontSize: '13px' }}>
                Nenhuma parcial registrada ainda. Conforme a aplicação avança, clique em &quot;Registrar parcial&quot; para salvar o tempo e pontuação de cada etapa.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '12px', maxHeight: '340px', overflowY: 'auto' }}>
                {registros.map((r, i) => (
                  <div key={r.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: 'var(--paper)', borderRadius: '12px', border: '1px solid var(--line)', fontSize: '13px' }}>
                    <span style={{ fontWeight: 600, fontFamily: 'var(--mono)' }}>Etapa {registros.length - i}</span>
                    <span style={{ fontFamily: 'var(--mono)', color: 'var(--accent-strong)', fontWeight: 700 }}>{r.tempo}</span>
                    <span style={{ fontSize: '11px', color: 'var(--ink-mute)' }}>{r.acertos} acertos · {r.erros} erros</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Ferramenta 2: Baralho de Funções Executivas */}
      {activeTool === 'baralho' && (
        <div style={{ marginTop: '28px', maxWidth: '640px', margin: '28px auto 0' }}>
          <div style={{ background: 'var(--bone)', borderRadius: '24px', border: '1px solid #15140f0f', padding: '36px 32px', boxShadow: 'var(--shadow)', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
              <span className="badge">{currentCard.categoria}</span>
              <span style={{ fontSize: '12px', fontFamily: 'var(--mono)', color: 'var(--ink-faint)' }}>
                Carta {currentCardIndex + 1} de {EXECUTIVE_CARDS.length}
              </span>
            </div>

            <div 
              onClick={() => setCardFlipped(!cardFlipped)}
              style={{
                width: '100%',
                minHeight: '220px',
                borderRadius: '18px',
                background: cardFlipped ? 'var(--ink)' : 'var(--paper)',
                color: cardFlipped ? '#f7f1de' : 'var(--ink)',
                border: '1px solid var(--line)',
                display: 'grid',
                placeItems: 'center',
                padding: '32px 24px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                boxShadow: 'var(--shadow)'
              }}
            >
              <div>
                <h2 style={{ margin: '0 0 12px', fontSize: '24px', fontWeight: 800, letterSpacing: '-0.02em', color: cardFlipped ? 'var(--lime)' : 'var(--ink)' }}>
                  {cardFlipped ? 'Fundamentação Clínica' : currentCard.titulo}
                </h2>
                <p style={{ margin: 0, fontSize: '15px', lineHeight: 1.6, color: cardFlipped ? '#f7f1debf' : 'var(--ink-soft)' }}>
                  {cardFlipped ? currentCard.dica : currentCard.prompt}
                </p>
                <small style={{ display: 'block', marginTop: '16px', fontSize: '11px', fontFamily: 'var(--mono)', opacity: 0.6 }}>
                  (Clique para {cardFlipped ? 'ver o exercício' : 'ver a dica clínica'})
                </small>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <button
                type="button"
                onClick={() => {
                  setCardFlipped(false);
                  setCurrentCardIndex(i => (i === 0 ? EXECUTIVE_CARDS.length - 1 : i - 1));
                }}
                className="btn-ghost"
              >
                <span><ChevronLeft className="w-4 h-4" /></span> Anterior
              </button>
              <button
                type="button"
                onClick={() => {
                  setCardFlipped(false);
                  setCurrentCardIndex(i => (i === EXECUTIVE_CARDS.length - 1 ? 0 : i + 1));
                }}
                className="btn"
              >
                Próxima carta <span><ChevronRight className="w-4 h-4" /></span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Ferramenta 3: Histórias Temáticas */}
      {activeTool === 'historias' && (
        <div style={{ marginTop: '28px', display: 'grid', gridTemplateColumns: 'minmax(0, 1.6fr) minmax(0, 1fr)', gap: '24px' }}>
          <div style={{ background: 'var(--bone)', borderRadius: '24px', border: '1px solid #15140f0f', padding: '32px', boxShadow: 'var(--shadow)', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <span className="badge">Narrativa Clínica</span>
                <h2 style={{ margin: '8px 0 4px', fontSize: '22px', fontWeight: 800 }}>
                  {currentStory.titulo}
                </h2>
                <p style={{ margin: 0, fontSize: '12px', color: 'var(--ink-mute)' }}>
                  {currentStory.contexto}
                </p>
              </div>
              <span style={{ fontSize: '12px', fontFamily: 'var(--mono)', color: 'var(--ink-faint)', flexShrink: 0 }}>
                Etapa {currentStepIndex + 1} de {currentStory.etapas.length}
              </span>
            </div>

            {/* Texto do Passo */}
            <div style={{ background: 'var(--paper)', borderRadius: '18px', padding: '24px', border: '1px solid var(--line)', fontSize: '16px', lineHeight: 1.7, color: 'var(--ink)' }}>
              {currentStep.texto}
            </div>

            {/* Pergunta de Checagem */}
            <div style={{ background: 'rgba(218,254,170,0.3)', borderRadius: '16px', padding: '18px 20px', border: '1px solid var(--accent-strong)' }}>
              <span style={{ fontSize: '11px', fontFamily: 'var(--mono)', textTransform: 'uppercase', color: 'var(--accent-strong)', fontWeight: 700 }}>
                Pergunta de Checagem Imediata
              </span>
              <p style={{ margin: '6px 0 0', fontSize: '14px', fontWeight: 600, color: 'var(--ink)' }}>
                {currentStep.pergunta}
              </p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
              <button
                type="button"
                disabled={currentStepIndex === 0}
                onClick={() => setCurrentStepIndex(i => i - 1)}
                className="btn-ghost"
                style={{ opacity: currentStepIndex === 0 ? 0.3 : 1 }}
              >
                <span><ChevronLeft className="w-4 h-4" /></span> Trecho anterior
              </button>

              <button
                type="button"
                disabled={currentStepIndex === currentStory.etapas.length - 1}
                onClick={() => setCurrentStepIndex(i => i + 1)}
                className="btn"
                style={{ opacity: currentStepIndex === currentStory.etapas.length - 1 ? 0.4 : 1 }}
              >
                Próximo trecho <span><ChevronRight className="w-4 h-4" /></span>
              </button>
            </div>
          </div>

          {/* Lista de Histórias Disponíveis */}
          <div style={{ background: 'var(--bone)', borderRadius: '24px', border: '1px solid #15140f0f', padding: '24px', boxShadow: 'var(--shadow)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <h3 style={{ margin: '0 0 8px', fontSize: '14px', fontWeight: 700, fontFamily: 'var(--sans)' }}>
              Histórias Clínicas Cadastradas
            </h3>
            {HISTORIAS_TEMATICAS.map((h) => (
              <div
                key={h.id}
                onClick={() => {
                  setActiveStoryId(h.id);
                  setCurrentStepIndex(0);
                }}
                style={{
                  padding: '16px',
                  borderRadius: '14px',
                  background: h.id === activeStoryId ? 'var(--ink)' : 'var(--paper)',
                  color: h.id === activeStoryId ? '#f7f1de' : 'var(--ink)',
                  border: '1px solid var(--line)',
                  cursor: 'pointer',
                  transition: 'all 0.15s'
                }}
              >
                <b style={{ display: 'block', fontSize: '14px', color: h.id === activeStoryId ? 'var(--lime)' : 'var(--ink)' }}>
                  {h.titulo}
                </b>
                <p style={{ margin: '4px 0 0', fontSize: '12px', opacity: 0.8, lineHeight: 1.4 }}>
                  {h.contexto}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  )}
    </PlatformShell>
  );
}

export default function RecursosInterativosPage() {
  return <RecursosInterativosInner />;
}
