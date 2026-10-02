'use client';

import React from 'react';
import { useNeuro } from '@/context/NeuroContext';
import { 
  Brain, 
  BookOpen, 
  Video, 
  FileText, 
  Compass, 
  ShieldCheck, 
  User, 
  Search,
  Sparkles,
  LayoutDashboard
} from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab }) => {
  const { activeRole, setActiveRole, currentUser, favorites } = useNeuro();

  const navItems = [
    { id: 'dashboard', label: 'Início', icon: LayoutDashboard },
    { id: 'acervo', label: 'Acervo & Filtros', icon: BookOpen },
    { id: 'aulas', label: 'Videoaulas', icon: Video },
    { id: 'laudos', label: 'Laudos & Anamneses', icon: FileText },
    { id: 'guias', label: 'Guias & Cortes', icon: Compass },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Brand Logo */}
          <div 
            onClick={() => setActiveTab('dashboard')}
            className="flex items-center gap-3 cursor-pointer select-none group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-600 via-emerald-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-teal-500/20 group-hover:scale-105 transition-transform">
              <Brain className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-slate-900 via-teal-900 to-indigo-950 dark:from-white dark:via-teal-200 dark:to-indigo-200 bg-clip-text text-transparent">
                  NeuroAcervo
                </span>
                <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20">
                  PRO
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-none hidden sm:block">
                Hub de Avaliação Neuropsicológica
              </p>
            </div>
          </div>

          {/* Navigation Items (Desktop) */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id && activeRole === 'member';
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveRole('member');
                    setActiveTab(item.id);
                  }}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950 shadow-sm'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Controls: Role Switcher & User Profile */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Role Switcher Pill */}
            <div className="bg-slate-100 dark:bg-slate-900 p-0.5 rounded-lg border border-slate-200 dark:border-slate-800 flex items-center text-xs font-medium">
              <button
                onClick={() => {
                  setActiveRole('member');
                  if (activeTab === 'admin') setActiveTab('dashboard');
                }}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  activeRole === 'member'
                    ? 'bg-white dark:bg-slate-800 text-teal-700 dark:text-teal-300 shadow-sm font-semibold'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Membro
              </button>
              <button
                onClick={() => {
                  setActiveRole('admin');
                  setActiveTab('admin');
                }}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-all ${
                  activeRole === 'admin'
                    ? 'bg-teal-600 text-white shadow-sm font-semibold'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                Admin
              </button>
            </div>

            {/* Quick Favorites Count */}
            <button
              onClick={() => {
                setActiveRole('member');
                setActiveTab('acervo');
              }}
              className="relative p-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
              title="Favoritos"
            >
              <Sparkles className="w-4 h-4 text-amber-500" />
              {favorites.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 text-[10px] bg-amber-500 text-white font-bold rounded-full flex items-center justify-center">
                  {favorites.length}
                </span>
              )}
            </button>

            {/* User Profile Pill */}
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-800">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-slate-700 to-slate-900 dark:from-slate-700 dark:to-teal-900 flex items-center justify-center text-white text-xs font-semibold">
                CV
              </div>
              <div className="hidden lg:block text-left">
                <p className="text-xs font-medium text-slate-800 dark:text-slate-200 leading-tight">
                  {currentUser.name}
                </p>
                <p className="text-[10px] text-teal-600 dark:text-teal-400 font-mono">
                  {currentUser.crp}
                </p>
              </div>
            </div>

          </div>

        </div>
      </div>

      {/* Mobile Sub-Navigation Bar */}
      <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-950/95 overflow-x-auto py-2 px-4 flex items-center gap-2 no-scrollbar">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id && activeRole === 'member';
          return (
            <button
              key={item.id}
              onClick={() => {
                setActiveRole('member');
                setActiveTab(item.id);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap shrink-0 transition-all ${
                isActive
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950'
                  : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-300'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
};
