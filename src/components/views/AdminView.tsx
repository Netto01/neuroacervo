'use client';

import React, { useState, useEffect } from 'react';
import { useNeuro } from '@/context/NeuroContext';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';
import { CognitiveDomain, MaterialType, AgeGroup } from '@/types/neuro';
import { DOMAIN_LABELS, TYPE_LABELS } from '@/data/neuroData';
import { 
  ShieldCheck, 
  Plus, 
  Trash2, 
  Users, 
  BookOpen, 
  Video, 
  Check, 
  AlertCircle,
  FileUp,
  Layers,
  Sparkles
} from 'lucide-react';

export const AdminView: React.FC = () => {
  const { materials, modules, addMaterial, deleteMaterial, addLesson } = useNeuro();

  const [activeAdminTab, setActiveAdminTab] = useState<'materiais' | 'aulas' | 'membros'>('materiais');

  // New Material Form State
  const [showAddMaterialModal, setShowAddMaterialModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newSubtitle, setNewSubtitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newType, setNewType] = useState<MaterialType>('instrumento_rastreio');
  const [newDomains, setNewDomains] = useState<CognitiveDomain[]>(['atencao']);
  const [newAge, setNewAge] = useState<AgeGroup>('adulto');
  const [newSatepsi, setNewSatepsi] = useState(false);
  const [newFormat, setNewFormat] = useState<'PDF' | 'DOCX'>('PDF');
  const [newAuthor, setNewAuthor] = useState('');
  const [newUtility, setNewUtility] = useState('');
  const [materialSavedSuccess, setMaterialSavedSuccess] = useState(false);

  // New Lesson Form State
  const [showAddLessonModal, setShowAddLessonModal] = useState(false);
  const [selectedModuleForLesson, setSelectedModuleForLesson] = useState(modules[0]?.id || '');
  const [lessonTitle, setLessonTitle] = useState('');
  const [lessonDesc, setLessonDesc] = useState('');
  const [lessonDuration, setLessonDuration] = useState('40');
  const [lessonVideoUrl, setLessonVideoUrl] = useState('https://www.youtube.com/embed/dQw4w9WgXcQ');
  const [lessonTakeaway, setLessonTakeaway] = useState('');

  // Real members list from Supabase
  const [members, setMembers] = useState<{ id: string; name: string; email: string; crp: string; plan: string; status: string; date: string }[]>([]);

  useEffect(() => {
    async function loadMembers() {
      if (isSupabaseConfigured) {
        try {
          const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
          if (!error && data && data.length > 0) {
            setMembers(data.map(p => ({
              id: p.id,
              name: p.full_name || 'Sem nome informado',
              email: p.email,
              crp: p.crp || '–',
              plan: p.plan || 'Membro Anual Pro',
              status: 'Ativo',
              date: p.created_at ? new Date(p.created_at).toLocaleDateString('pt-BR') : '–'
            })));
          } else {
            setMembers([]);
          }
        } catch {
          setMembers([]);
        }
      } else {
        setMembers([]);
      }
    }
    loadMembers();
  }, []);

  const handleSaveMaterial = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    addMaterial({
      title: newTitle,
      subtitle: newSubtitle || 'Material adicionado pelo painel administrativo',
      description: newDesc || 'Sem descrição cadastrada.',
      type: newType,
      domains: newDomains,
      ageGroups: [newAge],
      targetPopulation: 'Profissionais e pacientes clínicos',
      satepsiRestricted: newSatepsi,
      downloadFormat: newFormat,
      downloadSize: '1.5 MB',
      authorReference: newAuthor || 'Docente NeuroAcervo',
      clinicalUtility: newUtility || 'Aplicabilidade clínica geral.',
      isFeatured: false,
      isPopular: false
    });

    setMaterialSavedSuccess(true);
    setTimeout(() => {
      setMaterialSavedSuccess(false);
      setShowAddMaterialModal(false);
      setNewTitle('');
      setNewSubtitle('');
      setNewDesc('');
      setNewAuthor('');
      setNewUtility('');
    }, 1200);
  };

  const handleSaveLesson = (e: React.FormEvent) => {
    e.preventDefault();
    if (!lessonTitle.trim()) return;

    addLesson(selectedModuleForLesson, {
      title: lessonTitle,
      description: lessonDesc,
      durationMinutes: parseInt(lessonDuration) || 30,
      videoUrl: lessonVideoUrl,
      keyTakeaways: lessonTakeaway ? [lessonTakeaway] : ['Fundamentação do tema e dicas de raciocínio clínico.']
    });

    setShowAddLessonModal(false);
    setLessonTitle('');
    setLessonDesc('');
    setLessonTakeaway('');
  };

  const toggleDomainSelection = (d: CognitiveDomain) => {
    setNewDomains(prev => 
      prev.includes(d) ? prev.filter(item => item !== d) : [...prev, d]
    );
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/10 text-teal-600 dark:text-teal-400 text-xs font-semibold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Gestão da Plataforma & Conteúdo</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1">
            Painel Administrativo
          </h1>
          <p className="text-sm text-slate-500">
            Cadastre novos instrumentos, videoaulas, modelos de laudo e gerencie a base de membros.
          </p>
        </div>

        {/* Action Button */}
        {activeAdminTab === 'materiais' && (
          <button
            onClick={() => setShowAddMaterialModal(true)}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md shadow-teal-600/20 transition-all hover:scale-105"
          >
            <Plus className="w-4 h-4" />
            <span>Novo Material / Laudo</span>
          </button>
        )}

        {activeAdminTab === 'aulas' && (
          <button
            onClick={() => setShowAddLessonModal(true)}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition-all hover:scale-105"
          >
            <Plus className="w-4 h-4" />
            <span>Nova Videoaula</span>
          </button>
        )}
      </div>

      {/* Admin Subtabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
        <button
          onClick={() => setActiveAdminTab('materiais')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeAdminTab === 'materiais'
              ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Materiais ({materials.length})</span>
        </button>

        <button
          onClick={() => setActiveAdminTab('aulas')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeAdminTab === 'aulas'
              ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Video className="w-3.5 h-3.5" />
          <span>Videoaulas ({modules.reduce((acc, m) => acc + m.lessons.length, 0)})</span>
        </button>

        <button
          onClick={() => setActiveAdminTab('membros')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeAdminTab === 'membros'
              ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Membros Assinantes ({members.length})</span>
        </button>
      </div>

      {/* Tab 1: Materials Management */}
      {activeAdminTab === 'materiais' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              Todos os Materiais Cadastrados no Acervo
            </h3>
            <span className="text-xs text-slate-400">Total: {materials.length} itens</span>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {materials.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                Nenhum material cadastrado ainda. Clique em &quot;+ Novo Material&quot; acima para cadastrar o primeiro.
              </div>
            ) : (
              materials.map((mat) => (
                <div key={mat.id} className="p-4 flex items-center justify-between gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${TYPE_LABELS[mat.type].badge}`}>
                        {TYPE_LABELS[mat.type].label}
                      </span>
                      <span className="text-xs text-slate-400 font-mono">
                        Formato: {mat.downloadFormat}
                      </span>
                    </div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                      {mat.title}
                    </h4>
                    <p className="text-xs text-slate-500 line-clamp-1">
                      {mat.subtitle}
                    </p>
                  </div>

                  <button
                    onClick={() => deleteMaterial(mat.id)}
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors shrink-0"
                    title="Excluir Material"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Lessons Management */}
      {activeAdminTab === 'aulas' && (
        <div className="space-y-4">
          {modules.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 p-8 text-center text-slate-400 text-xs">
              Nenhum módulo ou aula cadastrada ainda.
            </div>
          ) : (
            modules.map((mod) => (
            <div key={mod.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase text-indigo-600 dark:text-indigo-400">
                    {mod.level}
                  </span>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                    {mod.title}
                  </h3>
                </div>
                <span className="text-xs text-slate-400">{mod.lessons.length} aulas cadastradas</span>
              </div>

              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {mod.lessons.map((lesson) => (
                  <div key={lesson.id} className="p-3.5 flex items-center justify-between text-xs hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-white">{lesson.title}</p>
                      <p className="text-slate-400 mt-0.5">{lesson.durationMinutes} min • Vídeo: {lesson.videoProvider}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    )}

      {/* Tab 3: Members List */}
      {activeAdminTab === 'membros' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
          <div className="overflow-x-auto text-xs">
            <table className="w-full text-left">
              <thead className="bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="p-3.5">Nome do Membro</th>
                  <th className="p-3.5">E-mail</th>
                  <th className="p-3.5">Registro CRP</th>
                  <th className="p-3.5">Plano de Assinatura</th>
                  <th className="p-3.5">Data de Início</th>
                  <th className="p-3.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {members.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="p-3.5 font-bold text-slate-900 dark:text-white">{m.name}</td>
                    <td className="p-3.5 text-slate-500 font-mono">{m.email}</td>
                    <td className="p-3.5 text-slate-600 dark:text-slate-400">{m.crp}</td>
                    <td className="p-3.5 font-medium">{m.plan}</td>
                    <td className="p-3.5 text-slate-400">{m.date}</td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-bold">
                        {m.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal: Add Material */}
      {showAddMaterialModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 max-w-2xl w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Cadastrar Novo Material no NeuroAcervo
              </h3>
              <button
                onClick={() => setShowAddMaterialModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveMaterial} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Título do Instrumento / Laudo / Guia *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: TAVEC — Teste de Aprendizagem Verbal de Califórnia"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Subtítulo / Objetivo Resumido</label>
                <input
                  type="text"
                  placeholder="Ex: Protocolo de aplicação e curvas de aprendizagem verbal"
                  value={newSubtitle}
                  onChange={(e) => setNewSubtitle(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Tipo de Material</label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as MaterialType)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="instrumento_rastreio">Instrumento de Rastreio</option>
                    <option value="guia_rapido">Guia Rápido de Aplicação</option>
                    <option value="modelo_laudo">Modelo de Laudo</option>
                    <option value="entrevista_anamnese">Entrevista / Anamnese</option>
                    <option value="compendio_estudo">Compêndio Teórico</option>
                    <option value="tabela_normativa">Tabela Normativa</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Formato do Arquivo</label>
                  <select
                    value={newFormat}
                    onChange={(e) => setNewFormat(e.target.value as 'PDF' | 'DOCX')}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="PDF">PDF (Guia / Protocolo)</option>
                    <option value="DOCX">DOCX (Modelo Editável)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">Domínios Cognitivos (Selecione ao menos um)</label>
                <div className="flex flex-wrap gap-1.5">
                  {(Object.keys(DOMAIN_LABELS) as CognitiveDomain[]).map((dom) => (
                    <button
                      type="button"
                      key={dom}
                      onClick={() => toggleDomainSelection(dom)}
                      className={`px-2.5 py-1 rounded-lg border ${
                        newDomains.includes(dom)
                          ? 'bg-teal-600 text-white border-teal-600 font-bold'
                          : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      {DOMAIN_LABELS[dom].label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Descrição Detalhada</label>
                <textarea
                  rows={3}
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Explicação do instrumento, administração e particularidades psicométricas..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="satepsiCheck"
                  checked={newSatepsi}
                  onChange={(e) => setNewSatepsi(e.target.checked)}
                  className="w-4 h-4 rounded text-teal-600"
                />
                <label htmlFor="satepsiCheck" className="text-slate-700 dark:text-slate-300 font-medium">
                  Marcar como restrito a psicólogos (SATEPSI/CFP)
                </label>
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddMaterialModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 dark:text-slate-400 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold shadow-md shadow-teal-600/20"
                >
                  {materialSavedSuccess ? 'Salvo com Sucesso!' : 'Publicar Material'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Lesson */}
      {showAddLessonModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Adicionar Nova Videoaula
              </h3>
              <button
                onClick={() => setShowAddLessonModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveLesson} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Módulo Destino</label>
                <select
                  value={selectedModuleForLesson}
                  onChange={(e) => setSelectedModuleForLesson(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  {modules.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Título da Aula *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Como aplicar e cotar o Teste dos Cinco Dígitos (FDT)"
                  value={lessonTitle}
                  onChange={(e) => setLessonTitle(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Duração (Minutos)</label>
                  <input
                    type="number"
                    value={lessonDuration}
                    onChange={(e) => setLessonDuration(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">URL de Incorporação (Embed)</label>
                  <input
                    type="text"
                    value={lessonVideoUrl}
                    onChange={(e) => setLessonVideoUrl(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Descrição</label>
                <textarea
                  rows={2}
                  value={lessonDesc}
                  onChange={(e) => setLessonDesc(e.target.value)}
                  placeholder="Resumo do conteúdo ministrado na aula..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Ponto-Chave Principal</label>
                <input
                  type="text"
                  placeholder="Ex: Diferenciar tempo de contagem de velocidade de alternância"
                  value={lessonTakeaway}
                  onChange={(e) => setLessonTakeaway(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddLessonModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 dark:text-slate-400 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
                >
                  Salvar Aula
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
