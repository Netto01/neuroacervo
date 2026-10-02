'use client';

import React, { useState } from 'react';
import { MaterialItem } from '@/types/neuro';
import { DOMAIN_LABELS, TYPE_LABELS, AGE_LABELS } from '@/data/neuroData';
import { useNeuro } from '@/context/NeuroContext';
import { 
  X, 
  Download, 
  Copy, 
  Check, 
  Star, 
  Clock, 
  BookOpen, 
  AlertCircle, 
  FileCheck2, 
  ExternalLink,
  Table,
  CheckCircle2
} from 'lucide-react';

interface MaterialModalProps {
  material: MaterialItem | null;
  onClose: () => void;
}

export const MaterialModal: React.FC<MaterialModalProps> = ({ material, onClose }) => {
  const { favorites, toggleFavorite } = useNeuro();
  const [copied, setCopied] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  if (!material) return null;

  const isFavorited = favorites.includes(material.id);

  const handleCopyText = () => {
    const textToCopy = material.contentPreview || material.description;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    setDownloadSuccess(true);
    // Simulate instantaneous download trigger
    setTimeout(() => setDownloadSuccess(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-start justify-between gap-4 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${TYPE_LABELS[material.type].badge}`}>
                {TYPE_LABELS[material.type].label}
              </span>

              {material.satepsiRestricted ? (
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-800 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  Privativo de Psicólogos (SATEPSI)
                </span>
              ) : (
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                  <FileCheck2 className="w-3.5 h-3.5" />
                  Rastreio Livre / Multiprofissional
                </span>
              )}

              {material.estimatedTime && (
                <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {material.estimatedTime}
                </span>
              )}
            </div>

            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white leading-tight">
              {material.title}
            </h2>
            <p className="text-sm text-teal-700 dark:text-teal-400 font-medium">
              {material.subtitle}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => toggleFavorite(material.id)}
              className={`p-2.5 rounded-xl border transition-all ${
                isFavorited
                  ? 'bg-amber-500/10 text-amber-500 border-amber-500/30'
                  : 'text-slate-400 hover:text-amber-500 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
              title={isFavorited ? 'Remover dos favoritos' : 'Salvar nos favoritos'}
            >
              <Star className={`w-5 h-5 ${isFavorited ? 'fill-current' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-700 dark:text-slate-300">
          
          {/* Domains & Age Badges */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Domínios Cognitivos Avaliados
              </p>
              <div className="flex flex-wrap gap-1.5">
                {material.domains.map((dom) => (
                  <span
                    key={dom}
                    className={`text-xs font-medium px-2 py-0.5 rounded border ${DOMAIN_LABELS[dom].bg} ${DOMAIN_LABELS[dom].color}`}
                  >
                    {DOMAIN_LABELS[dom].label}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Público / Faixa Etária
              </p>
              <div className="flex flex-wrap gap-1.5">
                {material.ageGroups.map((age) => (
                  <span
                    key={age}
                    className="text-xs font-medium px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
                  >
                    {AGE_LABELS[age]}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Description & Clinical Utility */}
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-1">
                Descrição & Fundamentação Teórica
              </h3>
              <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                {material.description}
              </p>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-1">
                Utilidade e Raciocínio Clínico
              </h3>
              <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300 bg-teal-50/50 dark:bg-teal-950/20 p-3 rounded-lg border border-teal-500/20">
                {material.clinicalUtility}
              </p>
            </div>
          </div>

          {/* Cutoffs & Normative Snippet (if available) */}
          {material.cutoffsSnippet && material.cutoffsSnippet.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Table className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                  Tabela de Referência Rápida & Pontos de Corte
                </h3>
              </div>
              <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden text-xs">
                <table className="w-full text-left">
                  <thead className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold">
                    <tr>
                      <th className="p-3">Estrato / Parâmetro</th>
                      <th className="p-3">Ponto de Corte / Valor</th>
                      <th className="p-3">Interpretação Clínica</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                    {material.cutoffsSnippet.map((row, i) => (
                      <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="p-3 font-medium text-slate-900 dark:text-slate-100">{row.label}</td>
                        <td className="p-3 font-mono font-semibold text-teal-600 dark:text-teal-400">{row.value}</td>
                        <td className="p-3 text-slate-500 dark:text-slate-400">{row.clinicalNote || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Key Instructions Checklist */}
          {material.keyInstructions && material.keyInstructions.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                Diretrizes de Aplicação Padronizada
              </h3>
              <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                {material.keyInstructions.map((inst, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>{inst}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Reference Citation */}
          <div className="text-xs text-slate-400 dark:text-slate-500 pt-2 border-t border-slate-200 dark:border-slate-800">
            <span className="font-semibold text-slate-500 dark:text-slate-400">Referência e Validação: </span>
            {material.authorReference}
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-6 border-t border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <span>Formato: <strong>{material.downloadFormat}</strong></span>
            <span>•</span>
            <span>Tamanho: <strong>{material.downloadSize}</strong></span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {material.contentPreview && (
              <button
                onClick={handleCopyText}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-semibold transition-all"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-500" />
                    <span>Texto Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copiar Texto Clínico</span>
                  </>
                )}
              </button>
            )}

            <button
              onClick={handleDownload}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-teal-600 to-indigo-600 hover:from-teal-700 hover:to-indigo-700 text-white text-xs font-bold shadow-md shadow-teal-500/20 transition-all hover:scale-[1.02]"
            >
              {downloadSuccess ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Download Concluído!</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Baixar {material.downloadFormat}</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
