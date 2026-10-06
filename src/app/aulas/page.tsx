'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { NeuroProvider, useNeuro } from '@/context/NeuroContext';
import { PlatformShell } from '@/components/layout/PlatformShell';
import { CourseModule, VideoLesson, MaterialItem } from '@/types/neuro';
import { 
  Play, 
  CheckCircle, 
  Circle, 
  Clock, 
  BookOpen, 
  FileText, 
  ChevronRight, 
  Check, 
  Save, 
  Video,
  Sparkles,
  Download
} from 'lucide-react';

import { resolveUserPlan } from '@/utils/userPlan';

function AulasInner() {
  const { modules, materials, completedLessons, toggleLessonCompletion, currentUser } = useNeuro();

  const planInfo = resolveUserPlan(currentUser);

  const [selectedModuleId, setSelectedModuleId] = useState<string>(modules[0]?.id || '');
  const [selectedLessonId, setSelectedLessonId] = useState<string>(modules[0]?.lessons[0]?.id || '');
  const [notes, setNotes] = useState<string>('');
  const [notesSaved, setNotesSaved] = useState<boolean>(false);

  const currentModule = modules.find(m => m.id === selectedModuleId) || modules[0];
  const currentLesson = currentModule?.lessons?.find(l => l.id === selectedLessonId) || currentModule?.lessons?.[0];

  const isCompleted = currentLesson ? completedLessons.includes(currentLesson.id) : false;

  useEffect(() => {
    if (!currentLesson?.id) return;
    try {
      const savedNotes = localStorage.getItem(`neuro_notes_${currentLesson.id}`);
      setNotes(savedNotes || '');
    } catch {}
  }, [currentLesson?.id]);

  const handleSaveNotes = () => {
    if (!currentLesson) return;
    try {
      localStorage.setItem(`neuro_notes_${currentLesson.id}`, notes);
      setNotesSaved(true);
      setTimeout(() => setNotesSaved(false), 2000);
    } catch {}
  };

  const attachedMaterials = materials.filter(m => currentLesson?.attachedMaterialIds?.includes(m.id));
  const totalLessons = modules.reduce((acc, m) => acc + (m.lessons?.length || 0), 0);
  const completedCount = completedLessons.length;
  const progressPercent = Math.round((completedCount / (totalLessons || 1)) * 100);

  return (
    <PlatformShell activePage="aulas">
      {/* Header editorial */}
      <div className="lib-head">
        <div>
          <span className="label">Formação Clínica</span>
          <h1>Aulas &amp; <em>vídeos</em><span className="dot">.</span></h1>
          <p>Assista a aulas práticas e estudos de caso com raciocínio diagnóstico direto ao ponto. Salve suas anotações e acompanhe seu progresso módulo a módulo.</p>
        </div>
        <div className="stats" aria-label="Progresso da formação">
          <div className="stat">
            <b>{totalLessons}</b>
            <span>aulas disponíveis</span>
          </div>
          <div className="stat">
            <b>{completedCount}</b>
            <span>concluídas ({progressPercent}%)</span>
          </div>
          <div className="stat">
            <b>{modules.length}</b>
            <span>módulos formativos</span>
          </div>
        </div>
      </div>

      {!planInfo.hasAulas ? (
        <div className="empty-state" style={{ marginTop: '32px' }}>
          <span className="ring">
            <svg className="ico"><use href="#i-lock"/></svg>
          </span>
          <h3>Acesso às Videoaulas no Plano Estudo</h3>
          <p>
            Seu plano atual no perfil é <b>{planInfo.nome}</b>. O módulo de videoaulas com raciocínio diagnóstico e estudos de caso clínicos faz parte dos planos <b>Estudo</b> e <b>Prática</b>.
          </p>
          <Link className="btn" href="/#planos" style={{ marginTop: '8px' }}>
            <span>Fazer upgrade para o Plano Estudo</span>
            <svg className="ico sm"><use href="#i-arrow"/></svg>
          </Link>
        </div>
      ) : modules.length === 0 ? (
        <div className="empty-state" style={{ marginTop: '32px' }}>
          <span className="ring">
            <svg className="ico"><use href="#i-aula"/></svg>
          </span>
          <h3>Nenhuma aula cadastrada no momento</h3>
          <p>Os módulos de videoaulas com raciocínio diagnóstico e estudos de caso clínicos estão sendo preparados e serão liberados em breve pela equipe.</p>
          <Link className="btn-ghost" href="/biblioteca">
            Explorar biblioteca de materiais <span><svg className="ico sm"><use href="#i-arrow"/></svg></span>
          </Link>
        </div>
      ) : (
        <div className="resume" style={{ gridTemplateColumns: 'minmax(0, 1.6fr) minmax(0, 1fr)', marginTop: '28px', gap: '24px' }}>
          {/* Coluna Esquerda: Player e Detalhes da Aula */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Player Responsivo */}
            <div style={{ position: 'relative', aspectRatio: '16/9', borderRadius: '20px', overflow: 'hidden', background: '#15140f', border: '1px solid var(--line)', display: 'grid', placeItems: 'center' }}>
              {currentLesson?.videoUrl ? (
                <iframe
                  src={currentLesson.videoUrl}
                  title={currentLesson.title}
                  style={{ width: '100%', height: '100%', border: 0 }}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <div style={{ textAlign: 'center', padding: '24px', color: '#f7f1de' }}>
                  <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'var(--lime)', color: 'var(--ink)', display: 'grid', placeItems: 'center', margin: '0 auto 12px' }}>
                    <Play className="w-6 h-6 fill-current" />
                  </div>
                  <p style={{ margin: 0, fontSize: '14px', fontFamily: 'var(--sans)', fontWeight: 500 }}>Selecione uma aula ao lado para iniciar</p>
                </div>
              )}
            </div>

            {currentLesson && (
              <div style={{ background: 'var(--bone)', borderRadius: '20px', border: '1px solid #15140f0f', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', boxShadow: 'var(--shadow)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px', borderBottom: '1px solid var(--line)', paddingBottom: '16px' }}>
                  <div>
                    <span style={{ fontSize: '11px', fontFamily: 'var(--mono)', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--accent-strong)' }}>
                      {currentModule?.title}
                    </span>
                    <h2 style={{ margin: '6px 0 4px', fontSize: '22px', fontFamily: 'var(--sans)', fontWeight: 700, letterSpacing: '-0.02em' }}>
                      {currentLesson.title}
                    </h2>
                    <span style={{ fontSize: '12px', color: 'var(--ink-mute)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Clock className="w-3.5 h-3.5" />
                      {currentLesson.durationMinutes} minutos · Nível {currentModule?.level || 'Essencial'}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => toggleLessonCompletion(currentLesson.id)}
                    className={isCompleted ? "btn" : "btn-ghost"}
                    style={{ flexShrink: 0 }}
                  >
                    {isCompleted ? (
                      <>Aula concluída <span><Check className="w-4 h-4" /></span></>
                    ) : (
                      <>Marcar concluída <span><Circle className="w-4 h-4" /></span></>
                    )}
                  </button>
                </div>

                <p style={{ margin: 0, fontSize: '14px', lineHeight: 1.6, color: 'var(--ink-soft)' }}>
                  {currentLesson.description}
                </p>

                {currentLesson.keyTakeaways && currentLesson.keyTakeaways.length > 0 && (
                  <div style={{ background: 'var(--paper)', borderRadius: '14px', padding: '16px', border: '1px solid var(--line)' }}>
                    <h4 style={{ margin: '0 0 10px', fontSize: '11px', fontFamily: 'var(--mono)', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ink-faint)' }}>
                      Pontos-chave &amp; Aprendizados
                    </h4>
                    <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13px', lineHeight: 1.6, color: 'var(--ink-soft)' }}>
                      {currentLesson.keyTakeaways.map((p, i) => (
                        <li key={i}>{p}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Anotações do aluno */}
                <div style={{ borderTop: '1px solid var(--line)', paddingTop: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <label style={{ fontSize: '12px', fontWeight: 600, fontFamily: 'var(--sans)' }}>
                      Suas Anotações Pessoais da Aula
                    </label>
                    <button
                      type="button"
                      onClick={handleSaveNotes}
                      className="btn-ghost"
                      style={{ padding: '6px 12px', fontSize: '12px' }}
                    >
                      {notesSaved ? 'Salvo!' : 'Salvar anotações'}
                    </button>
                  </div>
                  <textarea
                    rows={4}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Anote aqui seus insights clínicos, raciocínios diagnósticos ou dúvidas para esta aula..."
                    style={{ width: '100%', borderRadius: '12px', border: '1px solid var(--line)', padding: '12px', background: 'var(--paper)', font: '400 13.5px/1.5 var(--body)', outline: 'none' }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Coluna Direita: Módulos e Grade de Aulas */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ padding: '0 4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '11px', fontFamily: 'var(--mono)', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--ink-faint)' }}>
                Módulos do Curso
              </span>
              <span style={{ fontSize: '11px', fontFamily: 'var(--mono)', color: 'var(--ink-mute)' }}>
                {totalLessons} aulas
              </span>
            </div>

            {modules.map((mod) => (
              <div 
                key={mod.id} 
                style={{ background: 'var(--bone)', borderRadius: '18px', border: '1px solid #15140f0f', overflow: 'hidden', boxShadow: 'var(--shadow)' }}
              >
                <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--line)', background: 'var(--paper)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <span style={{ fontSize: '10px', fontFamily: 'var(--mono)', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--accent-strong)', fontWeight: 600 }}>
                      Nível {mod.level}
                    </span>
                    <h3 style={{ margin: '2px 0 0', fontSize: '15px', fontWeight: 700, fontFamily: 'var(--sans)' }}>
                      {mod.title}
                    </h3>
                  </div>
                  <span style={{ fontSize: '11px', fontFamily: 'var(--mono)', color: 'var(--ink-faint)' }}>
                    {mod.lessons.length} aulas
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {mod.lessons.map((lesson) => {
                    const isCur = lesson.id === currentLesson?.id;
                    const isDone = completedLessons.includes(lesson.id);

                    return (
                      <button
                        key={lesson.id}
                        type="button"
                        onClick={() => {
                          setSelectedModuleId(mod.id);
                          setSelectedLessonId(lesson.id);
                        }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          padding: '14px 20px',
                          border: 0,
                          borderBottom: '1px solid var(--line-soft)',
                          background: isCur ? 'rgba(218,254,170,0.3)' : 'transparent',
                          textAlign: 'left',
                          cursor: 'pointer',
                          transition: 'background 0.15s'
                        }}
                      >
                        <div style={{ flexShrink: 0, color: isDone ? 'var(--accent-strong)' : 'var(--ink-faint)' }}>
                          {isDone ? <CheckCircle className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
                        </div>

                        <div style={{ flex: 1, minWidth: 0 }}>
                          <b style={{ display: 'block', fontSize: '13px', fontWeight: isCur ? 700 : 500, color: isCur ? 'var(--accent-strong)' : 'var(--ink)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {lesson.title}
                          </b>
                          <span style={{ fontSize: '11px', color: 'var(--ink-faint)', fontFamily: 'var(--mono)' }}>
                            {lesson.durationMinutes} min
                          </span>
                        </div>

                        {isCur && <ChevronRight className="w-4 h-4" style={{ color: 'var(--accent-strong)', flexShrink: 0 }} />}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </PlatformShell>
  );
}

export default function AulasPage() {
  return <AulasInner />;
}
