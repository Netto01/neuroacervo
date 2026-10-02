'use client';

import React, { useState } from 'react';
import { NeuroProvider, useNeuro } from '@/context/NeuroContext';
import { Navbar } from '@/components/layout/Navbar';
import { DashboardView } from '@/components/views/DashboardView';
import { AcervoView } from '@/components/views/AcervoView';
import { AulasView } from '@/components/views/AulasView';
import { LaudosView } from '@/components/views/LaudosView';
import { GuiasView } from '@/components/views/GuiasView';
import { AdminView } from '@/components/views/AdminView';
import { MaterialModal } from '@/components/materials/MaterialModal';
import { MaterialItem } from '@/types/neuro';
import { Brain, Shield, HeartHandshake, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

function NeuroAcervoMemberPlatform() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const { activeRole, activeMaterialModal, setActiveMaterialModal } = useNeuro();

  const handleSelectMaterial = (mat: MaterialItem) => {
    setActiveMaterialModal(mat);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors selection:bg-teal-500 selection:text-white">
      {/* Return to Public Portal Bar */}
      <div className="bg-slate-900 text-slate-300 text-xs py-1.5 px-4 flex items-center justify-between border-b border-slate-800">
        <Link href="/" className="inline-flex items-center gap-1.5 hover:text-white transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Voltar para Página Pública / Apresentação</span>
        </Link>
        <span className="hidden sm:inline text-teal-400 font-mono">
          Ambiente do Membro Autenticado
        </span>
      </div>

      {/* Top Navigation */}
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeRole === 'admin' ? (
          <AdminView />
        ) : (
          <>
            {activeTab === 'dashboard' && (
              <DashboardView 
                onNavigate={setActiveTab} 
                onSelectMaterial={handleSelectMaterial} 
              />
            )}
            {activeTab === 'acervo' && (
              <AcervoView 
                onSelectMaterial={handleSelectMaterial} 
              />
            )}
            {activeTab === 'aulas' && (
              <AulasView 
                onSelectMaterial={handleSelectMaterial} 
              />
            )}
            {activeTab === 'laudos' && (
              <LaudosView 
                onSelectMaterial={handleSelectMaterial} 
              />
            )}
            {activeTab === 'guias' && (
              <GuiasView 
                onSelectMaterial={handleSelectMaterial} 
              />
            )}
          </>
        )}
      </main>

      {/* Material Modal Dialog */}
      <MaterialModal
        material={activeMaterialModal}
        onClose={() => setActiveMaterialModal(null)}
      />

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/50 py-8 px-4 sm:px-6 lg:px-8 mt-12 transition-colors">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-teal-600 flex items-center justify-center text-white">
              <Brain className="w-3.5 h-3.5" />
            </div>
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              NeuroAcervo
            </span>
            <span>—</span>
            <span>Hub de Materiais & Educação Continuada em Avaliação Neuropsicológica</span>
          </div>

          <div className="flex items-center gap-4 text-[11px] text-slate-400">
            <span className="flex items-center gap-1">
              <Shield className="w-3 h-3 text-teal-600" />
              Conformidade com CFP nº 06/2019
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <HeartHandshake className="w-3 h-3 text-indigo-600" />
              Uso estritamente profissional
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function PlataformaPage() {
  return (
    <NeuroProvider>
      <NeuroAcervoMemberPlatform />
    </NeuroProvider>
  );
}
