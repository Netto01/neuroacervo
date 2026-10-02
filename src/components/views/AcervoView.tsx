'use client';

import React, { useMemo } from 'react';
import { useNeuro } from '@/context/NeuroContext';
import { FilterPanel } from '@/components/materials/FilterPanel';
import { MaterialCard } from '@/components/materials/MaterialCard';
import { MaterialItem } from '@/types/neuro';
import { BookOpen, AlertCircle, Sparkles } from 'lucide-react';

interface AcervoViewProps {
  onSelectMaterial: (mat: MaterialItem) => void;
}

export const AcervoView: React.FC<AcervoViewProps> = ({ onSelectMaterial }) => {
  const { materials, filters, resetFilters } = useNeuro();

  const filteredMaterials = useMemo(() => {
    return materials.filter((mat) => {
      // Search term filter
      if (filters.searchTerm.trim() !== '') {
        const query = filters.searchTerm.toLowerCase();
        const matchesTitle = mat.title.toLowerCase().includes(query);
        const matchesSubtitle = mat.subtitle.toLowerCase().includes(query);
        const matchesDesc = mat.description.toLowerCase().includes(query);
        const matchesAuthor = mat.authorReference.toLowerCase().includes(query);
        const matchesUtility = mat.clinicalUtility.toLowerCase().includes(query);
        const matchesCutoff = mat.cutoffsSnippet?.some(c => 
          c.label.toLowerCase().includes(query) || 
          c.value.toLowerCase().includes(query) || 
          c.clinicalNote?.toLowerCase().includes(query)
        );

        if (!matchesTitle && !matchesSubtitle && !matchesDesc && !matchesAuthor && !matchesUtility && !matchesCutoff) {
          return false;
        }
      }

      // Domains filter (OR logic: material has at least one of the selected domains)
      if (filters.selectedDomains.length > 0) {
        const hasMatchingDomain = filters.selectedDomains.some(d => mat.domains.includes(d));
        if (!hasMatchingDomain) return false;
      }

      // Age group filter
      if (filters.selectedAgeGroups.length > 0) {
        const hasMatchingAge = filters.selectedAgeGroups.some(a => mat.ageGroups.includes(a) || mat.ageGroups.includes('todas'));
        if (!hasMatchingAge) return false;
      }

      // Material type filter
      if (filters.selectedTypes.length > 0) {
        if (!filters.selectedTypes.includes(mat.type)) {
          return false;
        }
      }

      // SATEPSI filter (only free/multiprofessional)
      if (filters.onlySatepsiFree) {
        if (mat.satepsiRestricted) return false;
      }

      return true;
    });
  }, [materials, filters]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Catálogo & Acervo Neuropsicológico
        </h1>
        <p className="text-sm text-slate-500">
          Encontre rapidamente instrumentos de rastreio, protocolos de aplicação, tabelas de corte e laudos editáveis.
        </p>
      </div>

      {/* Filter Component */}
      <FilterPanel />

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs text-slate-500 pt-2">
        <span>
          Mostrando <strong className="text-slate-900 dark:text-white">{filteredMaterials.length}</strong> de {materials.length} materiais cadastrados
        </span>
      </div>

      {/* Results Grid */}
      {filteredMaterials.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredMaterials.map((mat) => (
            <MaterialCard
              key={mat.id}
              material={mat}
              onSelect={onSelectMaterial}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 p-12 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 mx-auto flex items-center justify-center">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Nenhum material encontrado com esses filtros
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Tente buscar por termos mais genéricos ou desmarcar alguns dos domínios e faixas etárias selecionados.
            </p>
          </div>
          <button
            onClick={resetFilters}
            className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold shadow-sm transition-all"
          >
            Limpar todos os filtros
          </button>
        </div>
      )}

    </div>
  );
};
