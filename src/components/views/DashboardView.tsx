'use client';

import React from 'react';
import { useNeuro } from '@/context/NeuroContext';
import { MaterialCard } from '@/components/materials/MaterialCard';
import { DOMAIN_LABELS } from '@/data/neuroData';
import { CognitiveDomain, MaterialItem } from '@/types/neuro';
import { 
  BookOpen, 
  Video, 
  FileText, 
  Sparkles, 
  Compass, 
  ArrowRight,
  TrendingUp,
  Brain,
  Award
} from 'lucide-react';

interface DashboardViewProps {
  onNavigate: (tab: string) => void;
  onSelectMaterial: (mat: MaterialItem) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigate, onSelectMaterial }) => {
  const { materials, modules, completedLessons, favorites, setFilters } = useNeuro();

  const featuredMaterials = materials.filter(m => m.isFeatured);
  const totalLessons = modules.reduce((acc, m) => acc + m.lessons.length, 0);
  const completionPercentage = Math.round((completedLessons.length / (totalLessons || 1)) * 100);

  const handleDomainQuickClick = (domain: CognitiveDomain) => {
    setFilters(prev => ({
      ...prev,
      selectedDomains: [domain]
    }));
    onNavigate('acervo');
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-teal-950 p-6 sm:p-10 text-white shadow-xl border border-slate-800">
        <div className="absolute right-0 top-0 -mt-12 -mr-12 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute left-1/3 bottom-0 -mb-12 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Área do Membro Profissional</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight">
            Seu acervo diário de prática neuropsicológica clínica.
          </h1>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Consulte guias rápidos de aplicação, tabelas de pontos de corte, modelos de laudo em conformidade com o CFP e assista às aulas de raciocínio diagnóstico.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => onNavigate('acervo')}
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-sm shadow-lg shadow-teal-500/25 transition-all hover:scale-105"
            >
              <BookOpen className="w-4 h-4" />
              <span>Explorar Acervo Completo</span>
            </button>

            <button
              onClick={() => onNavigate('laudos')}
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium text-sm border border-slate-700 transition-colors"
            >
              <FileText className="w-4 h-4 text-teal-400" />
              <span>Modelos de Laudo & Anamnese</span>
            </button>
          </div>
        </div>
      </div>

      {/* Quick Clinical Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div 
          onClick={() => onNavigate('acervo')}
          className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/90 dark:border-slate-800/90 shadow-sm hover:border-teal-500/40 cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Acervo Total</span>
            <BookOpen className="w-5 h-5 text-teal-600 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {materials.length}
          </div>
          <p className="text-xs text-slate-500 mt-1">Instrumentos, guias e laudos</p>
        </div>

        <div 
          onClick={() => onNavigate('aulas')}
          className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/90 dark:border-slate-800/90 shadow-sm hover:border-indigo-500/40 cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Progresso em Aulas</span>
            <Video className="w-5 h-5 text-indigo-600 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {completionPercentage}%
          </div>
          <p className="text-xs text-slate-500 mt-1">{completedLessons.length} de {totalLessons} aulas assistidas</p>
        </div>

        <div 
          onClick={() => onNavigate('laudos')}
          className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/90 dark:border-slate-800/90 shadow-sm hover:border-emerald-500/40 cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Modelos Prontos</span>
            <FileText className="w-5 h-5 text-emerald-600 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {materials.filter(m => m.type === 'modelo_laudo' || m.type === 'entrevista_anamnese').length}
          </div>
          <p className="text-xs text-slate-500 mt-1">Laudos DOCX & roteiros</p>
        </div>

        <div 
          onClick={() => onNavigate('acervo')}
          className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/90 dark:border-slate-800/90 shadow-sm hover:border-amber-500/40 cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Meus Favoritos</span>
            <Sparkles className="w-5 h-5 text-amber-500 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {favorites.length}
          </div>
          <p className="text-xs text-slate-500 mt-1">Itens salvos para consulta rápida</p>
        </div>

      </div>

      {/* Quick Cognitive Domains Strip */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-teal-600 dark:text-teal-400" />
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
              Navegar por Domínio Cognitivo
            </h2>
          </div>
          <span className="text-xs text-slate-400">Clique para filtrar</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {(Object.keys(DOMAIN_LABELS) as CognitiveDomain[]).map((dom) => {
            const count = materials.filter(m => m.domains.includes(dom)).length;
            return (
              <button
                key={dom}
                onClick={() => handleDomainQuickClick(dom)}
                className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-teal-500 dark:hover:border-teal-400 hover:shadow-md transition-all text-left group"
              >
                <div>
                  <p className="text-xs font-semibold text-slate-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                    {DOMAIN_LABELS[dom].label}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {count} {count === 1 ? 'material' : 'materiais'}
                  </p>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-teal-500 group-hover:translate-x-0.5 transition-all" />
              </button>
            );
          })}
        </div>
      </div>

      {/* Featured Clinical Materials */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
              Destaques Clínicos do NeuroAcervo
            </h2>
            <p className="text-xs text-slate-500">
              Protocolos e modelos indispensáveis para sua rotina de avaliação
            </p>
          </div>
          <button
            onClick={() => onNavigate('acervo')}
            className="text-xs font-semibold text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1"
          >
            <span>Ver todos</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {featuredMaterials.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {featuredMaterials.map((mat) => (
              <MaterialCard
                key={mat.id}
                material={mat}
                onSelect={onSelectMaterial}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 p-8 text-center space-y-3 bg-white/50 dark:bg-slate-900/50">
            <div className="w-10 h-10 rounded-full bg-teal-500/10 text-teal-600 dark:text-teal-400 mx-auto flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
              Nenhum material no acervo ainda
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              O acervo está sendo estruturado. Os instrumentos clínicos, testes, roteiros e modelos de laudo serão cadastrados em breve.
            </p>
          </div>
        )}
      </div>

    </div>
  );
};
