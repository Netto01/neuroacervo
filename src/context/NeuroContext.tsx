'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { MaterialItem, CourseModule, UserProfile, CognitiveDomain, AgeGroup, MaterialType } from '@/types/neuro';
import { INITIAL_MATERIALS, INITIAL_MODULES } from '@/data/neuroData';
import { getMaterials, getModules, insertMaterial, removeMaterial, isSupabaseConfigured, getUserProfile, signOut, supabase, cleanupDemoData } from '@/lib/supabase';

interface FilterState {
  searchTerm: string;
  selectedDomains: CognitiveDomain[];
  selectedAgeGroups: AgeGroup[];
  selectedTypes: MaterialType[];
  onlySatepsiFree: boolean;
}

interface NeuroContextType {
  materials: MaterialItem[];
  modules: CourseModule[];
  currentUser: UserProfile | null;
  setCurrentUser: React.Dispatch<React.SetStateAction<UserProfile | null>>;
  activeRole: 'member' | 'admin';
  setActiveRole: (role: 'member' | 'admin') => void;
  favorites: string[];
  toggleFavorite: (materialId: string) => void;
  completedLessons: string[];
  toggleLessonCompletion: (lessonId: string) => void;
  activeMaterialModal: MaterialItem | null;
  setActiveMaterialModal: (material: MaterialItem | null) => void;
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  resetFilters: () => void;
  addMaterial: (newMat: Omit<MaterialItem, 'id' | 'publishedAt'>) => Promise<void>;
  deleteMaterial: (id: string) => Promise<void>;
  refreshMaterials: () => Promise<void>;
  addLesson: (moduleId: string, lesson: { title: string; description: string; durationMinutes: number; videoUrl: string; keyTakeaways: string[] }) => void;
  isSupabaseConnected: boolean;
  logout: () => Promise<void>;
  isLoadingUser: boolean;
}

const DEFAULT_FILTERS: FilterState = {
  searchTerm: '',
  selectedDomains: [],
  selectedAgeGroups: [],
  selectedTypes: [],
  onlySatepsiFree: false
};

const NeuroContext = createContext<NeuroContextType | undefined>(undefined);

export const NeuroProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [materials, setMaterials] = useState<MaterialItem[]>([]);
  const [modules, setModules] = useState<CourseModule[]>([]);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState<boolean>(true);
  const [activeRole, setActiveRole] = useState<'member' | 'admin'>('member');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  const [activeMaterialModal, setActiveMaterialModal] = useState<MaterialItem | null>(null);
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);

  // Carregar dados de autenticação e materiais
  useEffect(() => {
    async function loadAuthAndData() {
      if (isSupabaseConfigured) {
        try {
          setIsLoadingUser(true);
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            // Se o usuário está autenticado, limpa dados demo se ainda existirem
            cleanupDemoData().catch(() => {});

            const user = session.user;
            const profile = await getUserProfile(user.id);
            if (profile) {
              setCurrentUser(profile);
              setActiveRole(profile.role);
            } else {
              const meta = user.user_metadata || {};
              const fallback: UserProfile = {
                id: user.id,
                name: meta.full_name || user.email?.split('@')[0] || 'Assinante',
                email: user.email || '',
                crp: meta.crp ? (meta.crp.toUpperCase().startsWith('CRP') ? meta.crp : `CRP ${meta.crp}`) : '',
                role: (meta.role as 'member' | 'admin') || 'member',
                plan: (meta.plan as any) || 'Membro Anual Pro',
                joinedAt: user.created_at ? new Date(user.created_at).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }) : 'Recente'
              };
              setCurrentUser(fallback);
              setActiveRole(fallback.role);
            }
          } else {
            setCurrentUser(null);
          }
        } catch (err) {
          console.error('Erro ao carregar sessão do usuário:', err);
          setCurrentUser(null);
        } finally {
          setIsLoadingUser(false);
        }

        try {
          const [dbMaterials, dbModules] = await Promise.all([
            getMaterials(),
            getModules()
          ]);
          setMaterials(dbMaterials || []);
          setModules(dbModules || []);
        } catch {
          // Fallback gracioso para dados padrão
          setMaterials([]);
          setModules([]);
        }
      } else {
        setIsLoadingUser(false);
      }

      // Favoritos e aulas concluídas locais
      try {
        const storedFavs = localStorage.getItem('neuroacervo_favs');
        if (storedFavs) setFavorites(JSON.parse(storedFavs));

        const storedCompleted = localStorage.getItem('neuroacervo_lessons');
        if (storedCompleted) setCompletedLessons(JSON.parse(storedCompleted));
      } catch {}
    }

    loadAuthAndData();

    // Ouvir alterações de sessão do Supabase em tempo real
    let subscription: { unsubscribe: () => void } | null = null;
    if (isSupabaseConfigured) {
      const { data } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (session?.user) {
          const user = session.user;
          const profile = await getUserProfile(user.id);
          if (profile) {
            setCurrentUser(profile);
            setActiveRole(profile.role);
          } else {
            const meta = user.user_metadata || {};
            const fallback: UserProfile = {
              id: user.id,
              name: meta.full_name || user.email?.split('@')[0] || 'Assinante',
              email: user.email || '',
              crp: meta.crp ? (meta.crp.toUpperCase().startsWith('CRP') ? meta.crp : `CRP ${meta.crp}`) : '',
              role: (meta.role as 'member' | 'admin') || 'member',
              plan: (meta.plan as any) || 'Membro Anual Pro',
              joinedAt: user.created_at ? new Date(user.created_at).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }) : 'Recente'
            };
            setCurrentUser(fallback);
            setActiveRole(fallback.role);
          }
        } else if (event === 'SIGNED_OUT') {
          setCurrentUser(null);
        }
      });
      subscription = data.subscription;
    }

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const toggleFavorite = (materialId: string) => {
    setFavorites(prev => {
      const next = prev.includes(materialId) 
        ? prev.filter(id => id !== materialId)
        : [...prev, materialId];
      try {
        localStorage.setItem('neuroacervo_favs', JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const toggleLessonCompletion = (lessonId: string) => {
    setCompletedLessons(prev => {
      const next = prev.includes(lessonId)
        ? prev.filter(id => id !== lessonId)
        : [...prev, lessonId];
      try {
        localStorage.setItem('neuroacervo_lessons', JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const resetFilters = () => {
    setFilters(DEFAULT_FILTERS);
  };

  const addMaterial = async (newMat: Omit<MaterialItem, 'id' | 'publishedAt'>) => {
    const item: MaterialItem = {
      ...newMat,
      id: `mat-${Date.now()}`,
      publishedAt: new Date().toISOString().split('T')[0]
    };

    setMaterials(prev => [item, ...prev]);

    if (isSupabaseConfigured) {
      await insertMaterial(newMat);
    } else {
      try {
        const stored = localStorage.getItem('neuroacervo_custom_materials');
        const list = stored ? JSON.parse(stored) : [];
        localStorage.setItem('neuroacervo_custom_materials', JSON.stringify([item, ...list]));
      } catch {}
    }
  };

  const deleteMaterial = async (id: string) => {
    setMaterials(prev => prev.filter(m => m.id !== id));
    if (isSupabaseConfigured) {
      await removeMaterial(id);
    }
  };

  const refreshMaterials = async () => {
    if (isSupabaseConfigured) {
      try {
        const dbMaterials = await getMaterials();
        setMaterials(dbMaterials || []);
      } catch (err) {
        console.error('Erro ao recarregar materiais:', err);
      }
    }
  };

  const addLesson = (moduleId: string, lesson: { title: string; description: string; durationMinutes: number; videoUrl: string; keyTakeaways: string[] }) => {
    setModules(prev => prev.map(m => {
      if (m.id !== moduleId) return m;
      const newLesson = {
        id: `les-${Date.now()}`,
        moduleId,
        ...lesson,
        videoProvider: 'youtube' as const,
        orderIndex: m.lessons.length + 1
      };
      return {
        ...m,
        lessons: [...m.lessons, newLesson]
      };
    }));
  };

  const logout = async () => {
    await signOut();
    setCurrentUser(null);
    if (typeof window !== 'undefined') {
      window.location.href = '/entrar';
    }
  };

  return (
    <NeuroContext.Provider
      value={{
        materials,
        modules,
        currentUser,
        setCurrentUser,
        activeRole,
        setActiveRole,
        favorites,
        toggleFavorite,
        completedLessons,
        toggleLessonCompletion,
        activeMaterialModal,
        setActiveMaterialModal,
        filters,
        setFilters,
        resetFilters,
        addMaterial,
        deleteMaterial,
        refreshMaterials,
        addLesson,
        isSupabaseConnected: isSupabaseConfigured,
        logout,
        isLoadingUser
      }}
    >
      {children}
    </NeuroContext.Provider>
  );
};

export const useNeuro = () => {
  const context = useContext(NeuroContext);
  if (!context) {
    throw new Error('useNeuro must be used within a NeuroProvider');
  }
  return context;
};
