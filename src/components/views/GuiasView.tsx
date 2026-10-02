'use client';

import React, { useState } from 'react';
import { useNeuro } from '@/context/NeuroContext';
import { MaterialItem } from '@/types/neuro';
import { 
  Compass, 
  Calculator, 
  Table, 
  CheckCircle2, 
  AlertCircle,
  HelpCircle,
  BookOpen
} from 'lucide-react';

interface GuiasViewProps {
  onSelectMaterial: (mat: MaterialItem) => void;
}

export const GuiasView: React.FC<GuiasViewProps> = ({ onSelectMaterial }) => {
  const { materials } = useNeuro();

  // Z-Score calculator state
  const [calcScore, setCalcScore] = useState<string>('-1.2');

  const getZInterpretation = (zVal: number) => {
    if (isNaN(zVal)) return { label: 'Inválido', color: 'text-slate-400', desc: 'Digite um número válido.' };
    if (zVal >= 1.5) return { label: 'Desempenho Muito Superior', color: 'text-blue-600 dark:text-blue-400', desc: 'Percentil > 93. Acima de 1.5 desvio-padrão.' };
    if (zVal >= 1.0) return { label: 'Desempenho Superior', color: 'text-teal-600 dark:text-teal-400', desc: 'Percentil 84 a 93. Acima de 1 desvio-padrão.' };
    if (zVal >= -1.0) return { label: 'Desempenho Médio / Preservado', color: 'text-emerald-600 dark:text-emerald-400', desc: 'Percentil 16 a 84. Faixa de normalidade estatística.' };
    if (zVal >= -1.5) return { label: 'Desempenho Limítrofe / Rebaixamento Leve', color: 'text-amber-600 dark:text-amber-400', desc: 'Percentil 7 a 15. Atenção clínica recomendada.' };
    if (zVal >= -2.0) return { label: 'Déficit Clinicamente Relevante', color: 'text-orange-600 dark:text-orange-400', desc: 'Percentil 2 a 6. Abaixo de 1.5 desvio-padrão.' };
    return { label: 'Déficit Grave / Severo', color: 'text-rose-600 dark:text-rose-400', desc: 'Percentil < 2. Abaixo de 2 desvios-padrão da média.' };
  };

  const parsedZ = parseFloat(calcScore);
  const zInfo = getZInterpretation(parsedZ);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="space-y-1">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/10 text-teal-600 dark:text-teal-400 text-xs font-semibold">
          <Compass className="w-3.5 h-3.5" />
          <span>Consultas de Cabeceira</span>
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Guias Rápidos de Aplicação & Tabelas de Corte
        </h1>
        <p className="text-sm text-slate-500 max-w-2xl">
          Consulte rapidamente critérios psicométricos, cálculos de escores padronizados e pontos de corte sem precisar abrir manuais volumosos.
        </p>
      </div>

      {/* Interactive Z-Score / Percentile Calculator Widget */}
      <div className="bg-gradient-to-r from-teal-900 via-slate-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-800 space-y-4">
        <div className="flex items-center gap-2">
          <Calculator className="w-5 h-5 text-teal-400" />
          <h2 className="text-lg font-bold">
            Calculadora Rápida de Interpretação de Escore Z
          </h2>
        </div>

        <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
          Insira o Escore Z obtido pelo avaliando para visualizar imediatamente o estrato psicométrico correspondente e a redação para o laudo.
        </p>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
          <div className="flex items-center gap-2 bg-white/10 rounded-xl px-4 py-3 border border-white/20">
            <span className="text-xs font-mono font-bold text-teal-300">Z =</span>
            <input
              type="number"
              step="0.1"
              value={calcScore}
              onChange={(e) => setCalcScore(e.target.value)}
              className="w-24 bg-transparent text-lg font-mono font-bold focus:outline-none text-white"
            />
          </div>

          <div className="flex-1 bg-white/5 rounded-xl p-3 border border-white/10 flex flex-col justify-center">
            <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">Classificação Psicométrica</span>
            <p className={`text-base font-bold ${zInfo.color}`}>
              {zInfo.label}
            </p>
            <p className="text-xs text-slate-300 mt-0.5">{zInfo.desc}</p>
          </div>
        </div>
      </div>

      {/* Quick Comparison Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Table 1: MEEM Brucki et al. */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Table className="w-4 h-4 text-teal-600" />
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                MEEM — Brucki et al. (2003) por Escolaridade
              </h3>
            </div>
          </div>
          <p className="text-xs text-slate-500">
            Pontos de corte oficiais adaptados para a realidade socioeducacional brasileira.
          </p>

          <div className="overflow-hidden border border-slate-200 dark:border-slate-800 rounded-xl text-xs">
            <table className="w-full text-left">
              <thead className="bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold">
                <tr>
                  <th className="p-3">Escolaridade</th>
                  <th className="p-3">Ponto de Corte</th>
                  <th className="p-3">Média (DP)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="p-3 font-medium">Analfabetos</td>
                  <td className="p-3 font-mono font-bold text-rose-600">&lt; 20 pontos</td>
                  <td className="p-3 text-slate-400">20.3 (DP 2.3)</td>
                </tr>
                <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="p-3 font-medium">1 a 4 anos</td>
                  <td className="p-3 font-mono font-bold text-amber-600">&lt; 25 pontos</td>
                  <td className="p-3 text-slate-400">25.1 (DP 2.8)</td>
                </tr>
                <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="p-3 font-medium">5 a 8 anos</td>
                  <td className="p-3 font-mono font-bold text-teal-600">&lt; 26.5 pontos</td>
                  <td className="p-3 text-slate-400">26.8 (DP 2.3)</td>
                </tr>
                <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="p-3 font-medium">9 ou mais anos</td>
                  <td className="p-3 font-mono font-bold text-teal-600">&lt; 28 pontos</td>
                  <td className="p-3 text-slate-400">28.5 (DP 1.8)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Table 2: MoCA Nasreddine et al. */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Table className="w-4 h-4 text-indigo-600" />
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                MoCA — Pontos de Corte para CCL e Demência
              </h3>
            </div>
          </div>
          <p className="text-xs text-slate-500">
            Validação Memória et al. e Nasreddine (ajuste de +1 ponto para &le; 12 anos de estudo).
          </p>

          <div className="overflow-hidden border border-slate-200 dark:border-slate-800 rounded-xl text-xs">
            <table className="w-full text-left">
              <thead className="bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold">
                <tr>
                  <th className="p-3">Condição Clínica</th>
                  <th className="p-3">Escore MoCA</th>
                  <th className="p-3">Sensibilidade / Espec.</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="p-3 font-medium">Controle Saudável</td>
                  <td className="p-3 font-mono font-bold text-emerald-600">&ge; 26 pontos</td>
                  <td className="p-3 text-slate-400">Normalidade</td>
                </tr>
                <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="p-3 font-medium">Comprometimento Cognitivo Leve</td>
                  <td className="p-3 font-mono font-bold text-amber-600">&lt; 25 / 26</td>
                  <td className="p-3 text-slate-400">Sensib. 90% / Espec. 87%</td>
                </tr>
                <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="p-3 font-medium">Demência Leve (DA)</td>
                  <td className="p-3 font-mono font-bold text-rose-600">&lt; 18 / 20</td>
                  <td className="p-3 text-slate-400">Sensib. 100% / Espec. 87%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </div>

    </div>
  );
};
