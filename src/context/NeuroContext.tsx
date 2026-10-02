'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { MaterialItem, CourseModule, UserProfile, CognitiveDomain, AgeGroup, MaterialType } from '@/types/neuro';
import { INITIAL_MATERIALS, INITIAL_MODULES } from '@/data/neuroData';
import { getMaterials, getModules, insertMaterial, removeMaterial, isSupabaseConfigured } from '@/lib/supabase';

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
  currentUser: UserProfile;
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
  addLesson: (moduleId: string, lesson: { title: string; description: string; durationMinutes: number; videoUrl: string; keyTakeaways: string[] }) => void;
  isSupabaseConnected: boolean;
}

const DEFAULT_FILTERS: FilterState = {
  searchTerm: '',
  selectedDomains: [],
  selectedAgeGroups: [],
  selectedTypes: [],
  onlySatepsiFree: false
};

const DEFAULT_USER: UserProfile = {
  id: 'usr-1',
  name: 'Dra. Camila Vasconcelos',
  email: 'camila.neuro@clinica.com.br',
  crp: 'CRP 06/142981',
  role: 'member',
  plan: 'Membro Anual Pro',
  joinedAt: 'Janeiro de 2026'
};

const NeuroContext = createContext<NeuroContextType | undefined>(undefined);

export const NeuroProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [materials, setMaterials] = useState<MaterialItem[]>(INITIAL_MATERIALS);
  const [modules, setModules] = useState<CourseModule[]>(INITIAL_MODULES);
  const [currentUser] = useState<UserProfile>(DEFAULT_USER);
  const [activeRole, setActiveRole] = useState<'member' | 'admin'>('member');
  const [favorites, setFavorites] = useState<string[]>(['mat-moca', 'mat-laudo-tdah-adulto']);
  const [completedLessons, setCompletedLessons] = useState<string[]>(['les-1-1']);
  const [activeMaterialModal, setActiveMaterialModal] = useState<MaterialItem | null>(null);
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);

  // Carregar dados de Supabase ou LocalStorage
  useEffect(() => {
    async function loadData() {
      if (isSupabaseConfigured) {
        try {
          const [dbMaterials, dbModules] = await Promise.all([
            getMaterials(),
            getModules()
          ]);
          if (dbMaterials && dbMaterials.length > 0) {
            setMaterials(dbMaterials);
          }
          if (dbModules && dbModules.length > 0) {
            setModules(dbModules);
          }
        } catch {
          // Fallback gracioso para dados locais
        }
      } else {
        try {
          const storedMats = localStorage.getItem('neuroacervo_custom_materials');
          if (storedMats) {
            const parsed = JSON.parse(storedMats);
            setMaterials([...INITIAL_MATERIALS, ...parsed]);
          }
        } catch {}
      }

      // Favoritos e aulas concluídas locais
      try {
        const storedFavs = localStorage.getItem('neuroacervo_favs');
        if (storedFavs) setFavorites(JSON.parse(storedFavs));

        const storedCompleted = localStorage.getItem('neuroacervo_lessons');
        if (storedCompleted) setCompletedLessons(JSON.parse(storedCompleted));
      } catch {}
    }

    loadData();
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

  return (
    <NeuroContext.Provider
      value={{
        materials,
        modules,
        currentUser,
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
        addLesson,
        isSupabaseConnected: isSupabaseConfigured
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
