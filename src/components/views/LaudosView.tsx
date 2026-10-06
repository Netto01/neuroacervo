'use client';

import React, { useState } from 'react';
import { useNeuro } from '@/context/NeuroContext';
import { MaterialItem } from '@/types/neuro';
import { 
  FileText, 
  Download, 
  Copy, 
  Check, 
  FileCheck, 
  Sparkles, 
  ShieldCheck, 
  ExternalLink,
  ClipboardList
} from 'lucide-react';

interface LaudosViewProps {
  onSelectMaterial: (mat: MaterialItem) => void;
}

export const LaudosView: React.FC<LaudosViewProps> = ({ onSelectMaterial }) => {
  const { materials } = useNeuro();
  const [copiedClause, setCopiedClause] = useState<string | null>(null);

  const reportMaterials = materials.filter(
    m => m.type === 'modelo_laudo' || m.type === 'entrevista_anamnese'
  );

  const standardClauses = [
    {
      id: 'clause-cfp',
      title: 'Cláusula Padrão de Validade e Sigilo (CFP 06/2019)',
      text: 'O presente Laudo Neuropsicológico tem caráter estritamente confidencial, devendo ser manuseado apenas por profissionais diretamente envolvidos no acompanhamento do paciente. Conforme a Resolução CFP nº 06/2019, os dados aqui apresentados refletem o estado cognitivo e emocional no período em que a avaliação foi realizada, tendo validade estimada de até 2 (dois) anos, salvo eventos clínicos agudos ou intervenções neurocirúrgicas/medicamentosas substanciais.'
    },
    {
      id: 'clause-limites',
      title: 'Cláusula de Limitações Metodológicas da Testagem',
      text: 'Os instrumentos psicométricos utilizados possuem amostras normativas validadas para a população brasileira. Não obstante, o desempenho em situações estruturadas de consultório pode não espelhar integralmente o funcionamento ecológico do indivíduo em suas rotinas habituais sob estressores do mundo real, motivo pelo qual os resultados quantitativos foram estritamente cotejados com a história clínica e relatos ecológicos.'
    },
    {
      id: 'clause-encaminhamento',
      title: 'Cláusula de Conclusão e Encaminhamento Multidisciplinar',
      text: 'Diante do perfil neuropsicológico delineado, sugere-se: 1) Encaminhamento a Neurologista/Psiquiatra para correlação clínica e eventual conduta medicamentosa; 2) Início de intervenção em Terapia Cognitivo-Comportamental com foco em treino metacognitivo e autorregulação; 3) Reavaliação neuropsicológica evolutiva no prazo de 12 a 18 meses para monitoramento da curva funcional.'
    }
  ];

  const handleCopyClause = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedClause(id);
    setTimeout(() => setCopiedClause(null), 2000);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="space-y-1">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-semibold">
          <FileCheck className="w-3.5 h-3.5" />
          <span>Central de Produtividade Clínica</span>
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Modelos de Laudo & Roteiros de Anamnese
        </h1>
        <p className="text-sm text-slate-500 max-w-2xl">
          Templates completos em formato editável (Word/DOCX) estruturados rigorosamente segundo as resoluções vigentes do Conselho Federal de Psicologia (CFP).
        </p>
      </div>

      {/* Grid of Report & Anamnesis Templates */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <FileText className="w-4 h-4 text-teal-600" />
          Templates de Laudos e Entrevistas Prontos para Download
        </h2>

        {reportMaterials.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {reportMaterials.map((mat) => (
              <div
                key={mat.id}
                onClick={() => onSelectMaterial(mat)}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800/90 p-5 shadow-sm hover:shadow-lg hover:border-teal-500/50 cursor-pointer transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                      {mat.downloadFormat} Editável
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">
                      {mat.downloadSize}
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors line-clamp-2 text-base mb-1.5">
                    {mat.title}
                  </h3>
                  <p className="text-xs text-slate-500 line-clamp-3 mb-4">
                    {mat.subtitle}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-xs text-teal-700 dark:text-teal-400 font-semibold group-hover:underline">
                    Ver estrutura do modelo
                  </span>
                  <div className="p-2 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-xs font-bold flex items-center gap-1 group-hover:scale-105 transition-transform">
                    <Download className="w-3.5 h-3.5" />
                    <span>Baixar</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 p-8 text-center space-y-3 bg-white dark:bg-slate-900">
            <div className="w-10 h-10 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 mx-auto flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
              Nenhum modelo de laudo cadastrado ainda
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Os modelos editáveis de laudos e roteiros de anamnese estruturados conforme o CFP serão adicionados em breve.
            </p>
          </div>
        )}
      </div>

      {/* Copy-Paste Standard Clinical Clauses */}
      <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <ClipboardList className="w-4 h-4 text-indigo-600" />
            Cláusulas e Textos-Padrão para Agilizar seus Laudos
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Copie diretamente para o seu documento com um clique.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {standardClauses.map((clause) => {
            const isCopied = copiedClause === clause.id;
            return (
              <div
                key={clause.id}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm flex flex-col justify-between space-y-3"
              >
                <div>
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white mb-2">
                    {clause.title}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed italic bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                    &ldquo;{clause.text}&rdquo;
                  </p>
                </div>

                <button
                  onClick={() => handleCopyClause(clause.id, clause.text)}
                  className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-100 transition-colors"
                >
                  {isCopied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                      <span className="text-emerald-500">Copiado para Área de Transferência!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copiar Cláusula</span>
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
