'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useNeuro } from '@/context/NeuroContext';
import { 
  Brain, 
  BookOpen, 
  Video, 
  FileText, 
  Compass, 
  ShieldCheck, 
  Sparkles,
  LayoutDashboard,
  FolderHeart
} from 'lucide-react';

interface NavbarProps {
  activeTab?: string;
  setActiveTab?: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab }) => {
  const pathname = usePathname();
  const { activeRole, setActiveRole, currentUser, favorites } = useNeuro();

  const navItems = [
    { id: 'dashboard', label: 'Início', href: '/plataforma', icon: LayoutDashboard },
    { id: 'biblioteca', label: 'Biblioteca', href: '/biblioteca', icon: BookOpen },
    { id: 'aulas', label: 'Aulas', href: '/aulas', icon: Video },
    { id: 'recursos', label: 'Recursos', href: '/recursos-interativos', icon: Sparkles },
    { id: 'pasta', label: 'Minha Pasta', href: '/minha-pasta', icon: FolderHeart },
    { id: 'guias', label: 'Guias', href: '/guias', icon: Compass },
    { id: 'laudos', label: 'Laudos', href: '/laudos', icon: FileText },
    { id: 'anamnese', label: 'Anamnese', href: '/anamnese', icon: FileText },
    { id: 'compendios', label: 'Compêndios', href: '/compendios', icon: BookOpen },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Brand Logo */}
          <Link 
            href="/plataforma"
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
          </Link>

          {/* Navigation Items (Desktop) */}
          <nav className="hidden lg:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (activeTab === item.id && activeRole === 'member');
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  onClick={() => {
                    setActiveRole('member');
                    setActiveTab?.(item.id);
                  }}
                  className={`flex items-center gap-1.5 px-2.5 py-2 rounded-lg text-xs xl:text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950 shadow-sm'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
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
                  setActiveTab?.('dashboard');
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
                  setActiveTab?.('admin');
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
            <Link
              href="/minha-pasta"
              className="relative p-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
              title="Minha Pasta"
            >
              <Sparkles className="w-4 h-4 text-amber-500" />
              {favorites.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 text-[10px] bg-amber-500 text-white font-bold rounded-full flex items-center justify-center">
                  {favorites.length}
                </span>
              )}
            </Link>

            {/* User Profile Pill */}
            {currentUser ? (
              <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-800">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-slate-700 to-slate-900 dark:from-slate-700 dark:to-teal-900 flex items-center justify-center text-white text-xs font-semibold">
                  {currentUser.name ? currentUser.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() : 'U'}
                </div>
                <div className="hidden lg:block text-left">
                  <p className="text-xs font-medium text-slate-800 dark:text-slate-200 leading-tight">
                    {currentUser.name}
                  </p>
                  <p className="text-[10px] text-teal-600 dark:text-teal-400 font-mono">
                    {currentUser.crp || currentUser.email}
                  </p>
                </div>
              </div>
            ) : (
              <Link href="/entrar" className="text-xs font-medium text-teal-600 dark:text-teal-400 px-3 py-1 rounded-md border border-teal-500/30 hover:bg-teal-500/10">
                Entrar
              </Link>
            )}

          </div>

        </div>
      </div>

      {/* Mobile Sub-Navigation Bar */}
      <div className="lg:hidden border-t border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-950/95 overflow-x-auto py-2 px-4 flex items-center gap-2 no-scrollbar">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (activeTab === item.id && activeRole === 'member');
          return (
            <Link
              key={item.id}
              href={item.href}
              onClick={() => {
                setActiveRole('member');
                setActiveTab?.(item.id);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap shrink-0 transition-all ${
                isActive
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950'
                  : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-300'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </header>
  );
};
