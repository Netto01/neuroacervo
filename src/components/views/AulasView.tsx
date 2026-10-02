'use client';

import React, { useState, useEffect } from 'react';
import { useNeuro } from '@/context/NeuroContext';
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
  ExternalLink
} from 'lucide-react';

interface AulasViewProps {
  onSelectMaterial: (mat: MaterialItem) => void;
}

export const AulasView: React.FC<AulasViewProps> = ({ onSelectMaterial }) => {
  const { modules, materials, completedLessons, toggleLessonCompletion } = useNeuro();

  // Selected module & lesson state
  const [selectedModuleId, setSelectedModuleId] = useState<string>(modules[0]?.id || '');
  const [selectedLessonId, setSelectedLessonId] = useState<string>(modules[0]?.lessons[0]?.id || '');
  
  // Student notes state
  const [notes, setNotes] = useState<string>('');
  const [notesSaved, setNotesSaved] = useState<boolean>(false);

  const currentModule = modules.find(m => m.id === selectedModuleId) || modules[0];
  const currentLesson = currentModule?.lessons.find(l => l.id === selectedLessonId) || currentModule?.lessons[0];

  const isCompleted = currentLesson ? completedLessons.includes(currentLesson.id) : false;

  // Load and save notes per lesson from localStorage
  useEffect(() => {
    if (!currentLesson?.id) return;
    const timer = setTimeout(() => {
      try {
        const savedNotes = localStorage.getItem(`neuro_notes_${currentLesson.id}`);
        setNotes(savedNotes || '');
      } catch {}
    }, 0);
    return () => clearTimeout(timer);
  }, [currentLesson?.id]);

  const handleSaveNotes = () => {
    if (!currentLesson) return;
    try {
      localStorage.setItem(`neuro_notes_${currentLesson.id}`, notes);
      setNotesSaved(true);
      setTimeout(() => setNotesSaved(false), 2000);
    } catch {}
  };

  // Find attached materials
  const attachedMaterials = materials.filter(m => currentLesson?.attachedMaterialIds?.includes(m.id));

  // Overall progress
  const totalLessons = modules.reduce((acc, m) => acc + m.lessons.length, 0);
  const completedCount = completedLessons.length;
  const progressPercent = Math.round((completedCount / (totalLessons || 1)) * 100);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Top Banner with Progress */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800/90 p-5 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
            Formação Clínica em Avaliação Neuropsicológica
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Aulas práticas ministradas por especialistas focadas em raciocínio diagnóstico e estudos de caso.
          </p>
        </div>

        <div className="w-full md:w-64 space-y-1.5 shrink-0">
          <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
            <span>Progresso da Formação</span>
            <span className="text-teal-600 dark:text-teal-400">{progressPercent}%</span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-teal-500 to-indigo-600 rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <p className="text-[11px] text-slate-400 text-right">
            {completedCount} de {totalLessons} aulas concluídas
          </p>
        </div>
      </div>

      {/* Main Content Layout: Player on Left, Modules List on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Player & Lesson Info (2 cols on large) */}
        <div className="lg:col-span-2 space-y-5">
          
          {/* Responsive Video Container */}
          <div className="relative aspect-video rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 shadow-xl flex items-center justify-center group">
            {currentLesson?.videoUrl ? (
              <iframe
                src={currentLesson.videoUrl}
                title={currentLesson.title}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <div className="text-center p-6 space-y-3">
                <div className="w-16 h-16 rounded-full bg-teal-500/20 text-teal-400 mx-auto flex items-center justify-center">
                  <Play className="w-8 h-8 fill-current ml-1" />
                </div>
                <p className="text-sm font-medium text-slate-300">
                  Selecione uma aula ao lado para assistir
                </p>
              </div>
            )}
          </div>

          {/* Lesson Header & Complete Action */}
          {currentLesson && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800/90 p-5 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <span className="text-xs font-semibold text-teal-600 dark:text-teal-400">
                    {currentModule?.title}
                  </span>
                  <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mt-0.5">
                    {currentLesson.title}
                  </h2>
                  <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {currentLesson.durationMinutes} minutos
                    </span>
                    <span>•</span>
                    <span>Nível: {currentModule?.level}</span>
                  </div>
                </div>

                <button
                  onClick={() => toggleLessonCompletion(currentLesson.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                    isCompleted
                      ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                      : 'bg-slate-900 text-white hover:bg-slate-800 dark:bg-teal-500 dark:text-slate-950 dark:hover:bg-teal-400 shadow-sm'
                  }`}
                >
                  {isCompleted ? (
                    <>
                      <CheckCircle className="w-4 h-4 text-emerald-600" />
                      <span>Concluída</span>
                    </>
                  ) : (
                    <>
                      <Circle className="w-4 h-4" />
                      <span>Marcar como Concluída</span>
                    </>
                  )}
                </button>
              </div>

              {/* Lesson Description */}
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                {currentLesson.description}
              </p>

              {/* Key Takeaways */}
              {currentLesson.keyTakeaways?.length > 0 && (
                <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    Pontos-Chave Desta Aula
                  </h4>
                  <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                    {currentLesson.keyTakeaways.map((takeaway, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-teal-500 mt-1.5 shrink-0" />
                        <span>{takeaway}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Attached Materials from this Lesson */}
              {attachedMaterials.length > 0 && (
                <div className="space-y-2 pt-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-teal-600" />
                    Materiais de Apoio desta Aula
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {attachedMaterials.map((mat) => (
                      <div
                        key={mat.id}
                        onClick={() => onSelectMaterial(mat)}
                        className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-teal-500 cursor-pointer transition-all flex items-center justify-between group"
                      >
                        <div className="space-y-0.5">
                          <p className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1 group-hover:text-teal-600">
                            {mat.title}
                          </p>
                          <p className="text-[11px] text-slate-400">
                            {mat.downloadFormat} • {mat.downloadSize}
                          </p>
                        </div>
                        <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-teal-500" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Student Notes Editor */}
              <div className="space-y-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Minhas Anotações Clínicas da Aula
                  </label>
                  <button
                    onClick={handleSaveNotes}
                    className="flex items-center gap-1 text-xs font-semibold text-teal-600 dark:text-teal-400 hover:underline"
                  >
                    {notesSaved ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                        <span className="text-emerald-500">Salvo!</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-3.5 h-3.5" />
                        <span>Salvar Anotação</span>
                      </>
                    )}
                  </button>
                </div>
                <textarea
                  rows={4}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Escreva aqui seus insights sobre o teste, raciocínio diagnóstico ou dúvidas para a supervisão..."
                  className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/50"
                />
              </div>

            </div>
          )}

        </div>

        {/* Right Column: Module & Lessons Curriculum */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
            <Video className="w-4 h-4 text-indigo-500" />
            Grade Curricular dos Módulos
          </h3>

          <div className="space-y-3">
            {modules.map((mod) => (
              <div
                key={mod.id}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800/90 overflow-hidden shadow-sm"
              >
                {/* Module Header */}
                <div className="p-3.5 bg-slate-50/80 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                      {mod.level}
                    </span>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white mt-1.5">
                      {mod.title}
                    </h4>
                  </div>
                  <span className="text-[11px] text-slate-400 shrink-0 font-medium">
                    {mod.lessons.length} {mod.lessons.length === 1 ? 'aula' : 'aulas'}
                  </span>
                </div>

                {/* Lessons List in Module */}
                <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {mod.lessons.map((lesson) => {
                    const isCurrent = lesson.id === currentLesson?.id;
                    const isLessonDone = completedLessons.includes(lesson.id);

                    return (
                      <button
                        key={lesson.id}
                        onClick={() => {
                          setSelectedModuleId(mod.id);
                          setSelectedLessonId(lesson.id);
                        }}
                        className={`w-full p-3 text-left flex items-start gap-3 transition-colors ${
                          isCurrent
                            ? 'bg-teal-50/60 dark:bg-teal-950/30'
                            : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                        }`}
                      >
                        <div className="pt-0.5 shrink-0">
                          {isLessonDone ? (
                            <CheckCircle className="w-4 h-4 text-emerald-500" />
                          ) : (
                            <Circle className={`w-4 h-4 ${isCurrent ? 'text-teal-600' : 'text-slate-300 dark:text-slate-600'}`} />
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className={`text-xs font-medium line-clamp-2 ${
                            isCurrent ? 'font-bold text-teal-700 dark:text-teal-300' : 'text-slate-800 dark:text-slate-200'
                          }`}>
                            {lesson.title}
                          </p>
                          <span className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                            <Clock className="w-3 h-3" />
                            {lesson.durationMinutes} min
                          </span>
                        </div>

                        {isCurrent && (
                          <ChevronRight className="w-4 h-4 text-teal-600 shrink-0 mt-1" />
                        )}
                      </button>
                    );
                  })}
                </div>

              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
