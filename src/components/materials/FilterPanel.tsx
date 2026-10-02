'use client';

import React from 'react';
import { useNeuro } from '@/context/NeuroContext';
import { CognitiveDomain, AgeGroup, MaterialType } from '@/types/neuro';
import { DOMAIN_LABELS, TYPE_LABELS, AGE_LABELS } from '@/data/neuroData';
import { 
  Search, 
  RotateCcw, 
  Filter, 
  Layers, 
  Users, 
  ShieldAlert,
  Sparkles
} from 'lucide-react';

export const FilterPanel: React.FC = () => {
  const { filters, setFilters, resetFilters, materials } = useNeuro();

  const allDomains: CognitiveDomain[] = [
    'atencao',
    'memoria',
    'funcoes_executivas',
    'linguagem',
    'visuoespacial',
    'humor_comportamento',
    'rastreio_global',
    'inteligencia'
  ];

  const allAges: AgeGroup[] = ['infantil', 'adolescente', 'adulto', 'idoso'];

  const allTypes: MaterialType[] = [
    'instrumento_rastreio',
    'guia_rapido',
    'modelo_laudo',
    'entrevista_anamnese',
    'compendio_estudo',
    'tabela_normativa'
  ];

  const handleDomainToggle = (domain: CognitiveDomain) => {
    setFilters(prev => ({
      ...prev,
      selectedDomains: prev.selectedDomains.includes(domain)
        ? prev.selectedDomains.filter(d => d !== domain)
        : [...prev.selectedDomains, domain]
    }));
  };

  const handleAgeToggle = (age: AgeGroup) => {
    setFilters(prev => ({
      ...prev,
      selectedAgeGroups: prev.selectedAgeGroups.includes(age)
        ? prev.selectedAgeGroups.filter(a => a !== age)
        : [...prev.selectedAgeGroups, age]
    }));
  };

  const handleTypeToggle = (type: MaterialType) => {
    setFilters(prev => ({
      ...prev,
      selectedTypes: prev.selectedTypes.includes(type)
        ? prev.selectedTypes.filter(t => t !== type)
        : [...prev.selectedTypes, type]
    }));
  };

  const hasActiveFilters = 
    filters.searchTerm.trim() !== '' ||
    filters.selectedDomains.length > 0 ||
    filters.selectedAgeGroups.length > 0 ||
    filters.selectedTypes.length > 0 ||
    filters.onlySatepsiFree;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800/90 p-5 shadow-sm space-y-5">
      
      {/* Top Search Bar & Quick Reset */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por teste, autor, ponto de corte ou patologia (ex: MoCA, TDAH, RAVLT, Brucki)..."
            value={filters.searchTerm}
            onChange={(e) => setFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition-all"
          />
        </div>

        {hasActiveFilters && (
          <button
            onClick={resetFilters}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-rose-200 dark:border-rose-900/40 transition-colors whitespace-nowrap shrink-0"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Limpar Filtros</span>
          </button>
        )}
      </div>

      {/* Filter Row 1: Cognitive Domains */}
      <div>
        <div className="flex items-center gap-1.5 mb-2.5">
          <Layers className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            Domínio Cognitivo
          </span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {allDomains.map((dom) => {
            const isSelected = filters.selectedDomains.includes(dom);
            return (
              <button
                key={dom}
                onClick={() => handleDomainToggle(dom)}
                className={`text-xs px-3 py-1.5 rounded-xl border font-medium transition-all ${
                  isSelected
                    ? 'bg-slate-900 text-white dark:bg-teal-500 dark:text-slate-950 border-slate-900 dark:border-teal-400 shadow-sm'
                    : 'bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-teal-500/50'
                }`}
              >
                {DOMAIN_LABELS[dom].label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Filter Row 2: Types & Age Groups */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-slate-100 dark:border-slate-800">
        
        {/* Material Types */}
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 block mb-2">
            Tipo de Material
          </span>
          <div className="flex flex-wrap gap-1.5">
            {allTypes.map((type) => {
              const isSelected = filters.selectedTypes.includes(type);
              return (
                <button
                  key={type}
                  onClick={() => handleTypeToggle(type)}
                  className={`text-xs px-2.5 py-1 rounded-lg border transition-all ${
                    isSelected
                      ? 'bg-teal-600 text-white border-teal-600 font-semibold'
                      : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {TYPE_LABELS[type].label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Age Groups & SATEPSI switch */}
        <div className="space-y-3">
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <Users className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Público / Faixa Etária
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {allAges.map((age) => {
                const isSelected = filters.selectedAgeGroups.includes(age);
                return (
                  <button
                    key={age}
                    onClick={() => handleAgeToggle(age)}
                    className={`text-xs px-2.5 py-1 rounded-lg border transition-all ${
                      isSelected
                        ? 'bg-indigo-600 text-white border-indigo-600 font-semibold'
                        : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {age === 'infantil' && 'Infantil (0-11)'}
                    {age === 'adolescente' && 'Adolescentes (12-17)'}
                    {age === 'adulto' && 'Adultos (18-59)'}
                    {age === 'idoso' && 'Idosos (60+)'}
                  </button>
                );
              })}
            </div>
          </div>

          <label className="flex items-center gap-2 cursor-pointer select-none text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white pt-1">
            <input
              type="checkbox"
              checked={filters.onlySatepsiFree}
              onChange={(e) => setFilters(prev => ({ ...prev, onlySatepsiFree: e.target.checked }))}
              className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800"
            />
            <span>Apenas instrumentos de livre aplicação (Multiprofissionais / Não restritos ao CFP)</span>
          </label>
        </div>

      </div>

    </div>
  );
};
