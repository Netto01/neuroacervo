import { createClient } from '@supabase/supabase-js';
import { MaterialItem, CourseModule } from '@/types/neuro';
import { INITIAL_MATERIALS, INITIAL_MODULES } from '@/data/neuroData';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  !supabaseUrl.includes('placeholder') && 
  supabaseAnonKey.length > 20
);

// Client instance (usa valores seguros em fallback durante build ou quando ausente)
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-anon-key'
);

/* ── Autenticação ── */
export async function signUp(email: string, password: string, metadata?: Record<string, unknown>) {
  if (!isSupabaseConfigured) {
    return { data: { user: { id: 'usr-new', email } }, error: null };
  }
  return await supabase.auth.signUp({
    email,
    password,
    options: {
      data: metadata,
      emailRedirectTo: `${typeof window !== 'undefined' ? window.location.origin : ''}/entrar?confirmed=true`
    }
  });
}

export async function signIn(email: string, password: string) {
  if (!isSupabaseConfigured) {
    // Modo simulação para demonstração local
    return { data: { user: { id: 'usr-demo', email } }, error: null };
  }
  return await supabase.auth.signInWithPassword({ email, password });
}

export async function signOut() {
  if (!isSupabaseConfigured) return { error: null };
  return await supabase.auth.signOut();
}

export async function resetPasswordForEmail(email: string) {
  if (!isSupabaseConfigured) return { error: null };
  return await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${typeof window !== 'undefined' ? window.location.origin : ''}/entrar?reset=true`
  });
}

/* ── Materiais e Acervo ── */
export async function getMaterials(): Promise<MaterialItem[]> {
  if (!isSupabaseConfigured) {
    return INITIAL_MATERIALS;
  }

  try {
    const { data, error } = await supabase
      .from('materials')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data || data.length === 0) {
      return INITIAL_MATERIALS;
    }

    return data as MaterialItem[];
  } catch {
    return INITIAL_MATERIALS;
  }
}

export async function insertMaterial(material: Omit<MaterialItem, 'id' | 'publishedAt'>) {
  if (!isSupabaseConfigured) {
    return { data: null, error: null };
  }

  const { data, error } = await supabase
    .from('materials')
    .insert([
      {
        ...material,
        published_at: new Date().toISOString()
      }
    ])
    .select();

  return { data, error };
}

export async function removeMaterial(id: string) {
  if (!isSupabaseConfigured) return { error: null };
  return await supabase.from('materials').delete().eq('id', id);
}

/* ── Módulos e Aulas ── */
export async function getModules(): Promise<CourseModule[]> {
  if (!isSupabaseConfigured) {
    return INITIAL_MODULES;
  }

  try {
    const { data, error } = await supabase
      .from('modules')
      .select(`
        *,
        lessons (*)
      `)
      .order('order_index', { ascending: true });

    if (error || !data || data.length === 0) {
      return INITIAL_MODULES;
    }

    return data as CourseModule[];
  } catch {
    return INITIAL_MODULES;
  }
}
