import { createClient } from '@supabase/supabase-js';
import { MaterialItem, CourseModule, UserProfile } from '@/types/neuro';
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

export async function resendConfirmationEmail(email: string) {
  if (!isSupabaseConfigured) {
    return { data: {}, error: null };
  }
  return await supabase.auth.resend({
    type: 'signup',
    email,
    options: {
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

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  if (!isSupabaseConfigured) return null;
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error || !data) return null;

    return {
      id: data.id,
      name: data.full_name || 'Assinante',
      email: data.email,
      crp: data.crp ? (data.crp.toUpperCase().startsWith('CRP') ? data.crp : `CRP ${data.crp}`) : '',
      role: (data.role as 'member' | 'admin') || 'member',
      plan: data.plan || 'Estudo',
      billingCycle: data.billing_cycle || 'mensal',
      avatarUrl: data.avatar_url,
      joinedAt: data.created_at ? new Date(data.created_at).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }) : 'Recente'
    };
  } catch {
    return null;
  }
}

export async function resetPasswordForEmail(email: string) {
  if (!isSupabaseConfigured) return { error: null };
  return await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${typeof window !== 'undefined' ? window.location.origin : ''}/entrar?reset=true`
  });
}

export const SEED_DEMO_MATERIAL_IDS = new Set([
  'mat-moca',
  'mat-laudo-tdah-adulto',
  'mat-anamnese-adulto-idoso',
  'mat-ravlt-guia',
  'mat-laudo-infantil-tea',
  'mat-compendio-estatistica',
  'mat-stroop-guia',
  'mat-meem-cortes'
]);

export const SEED_DEMO_MODULE_IDS = new Set([
  'mod-1',
  'mod-2',
  'mod-3'
]);

/* ── Perfis / Assinantes ── */
export async function getAllProfiles() {
  if (!isSupabaseConfigured) return [];
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });
    if (error || !data) return [];
    return data;
  } catch {
    return [];
  }
}

/* ── Materiais e Acervo ── */
export async function getMaterials(): Promise<MaterialItem[]> {
  if (!isSupabaseConfigured) {
    return [];
  }

  try {
    const { data, error } = await supabase
      .from('materials')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data || data.length === 0) {
      return [];
    }

    // Filtra itens de demonstração/mock e rascunhos para exibir apenas itens publicados aos assinantes
    const realData = (data as Record<string, any>[]).filter(
      item => !SEED_DEMO_MATERIAL_IDS.has(String(item.id)) && item.published_at !== null
    );

    return realData.map((item) => ({
      id: String(item.id),
      title: item.title,
      subtitle: item.subtitle || '',
      description: item.description || '',
      type: item.type,
      domains: item.domains || [],
      ageGroups: item.ageGroups || item.age_groups || [],
      estimatedTime: item.estimatedTime || item.estimated_time || '',
      targetPopulation: item.targetPopulation || item.target_population || '',
      satepsiRestricted: item.satepsiRestricted ?? item.satepsi_restricted ?? false,
      downloadFormat: item.downloadFormat || item.download_format || 'PDF',
      downloadSize: item.downloadSize || item.download_size || '1.0 MB',
      downloadUrl: item.downloadUrl || item.download_url || '',
      authorReference: item.authorReference || item.author_reference || '',
      clinicalUtility: item.clinicalUtility || item.clinical_utility || '',
      cutoffsSnippet: item.cutoffsSnippet || item.cutoffs_snippet || [],
      contentPreview: item.contentPreview || item.content_preview || '',
      keyInstructions: item.keyInstructions || item.key_instructions || [],
      isFeatured: item.isFeatured ?? item.is_featured ?? false,
      isPopular: item.isPopular ?? item.is_popular ?? false,
      publishedAt: item.publishedAt || item.published_at || new Date().toISOString()
    })) as MaterialItem[];
  } catch {
    return [];
  }
}

export async function insertMaterial(material: Omit<MaterialItem, 'id' | 'publishedAt'> & { id?: string }) {
  if (!isSupabaseConfigured) {
    return { data: null, error: null };
  }

  const { data, error } = await supabase
    .from('materials')
    .insert([
      {
        id: material.id || `mat-${Date.now()}`,
        title: material.title,
        subtitle: material.subtitle,
        description: material.description,
        type: material.type,
        domains: material.domains,
        age_groups: material.ageGroups,
        estimated_time: material.estimatedTime,
        target_population: material.targetPopulation,
        satepsi_restricted: material.satepsiRestricted,
        download_format: material.downloadFormat,
        download_size: material.downloadSize,
        author_reference: material.authorReference,
        clinical_utility: material.clinicalUtility,
        cutoffs_snippet: material.cutoffsSnippet,
        content_preview: material.contentPreview,
        key_instructions: material.keyInstructions,
        is_featured: material.isFeatured,
        is_popular: material.isPopular,
        published_at: new Date().toISOString()
      }
    ])
    .select();

  return { data, error };
}

export async function upsertMaterial(material: any) {
  if (!isSupabaseConfigured) return { data: null, error: null };
  return await supabase.from('materials').upsert([material]).select();
}

export async function removeMaterial(id: string) {
  if (!isSupabaseConfigured) return { error: null };
  return await supabase.from('materials').delete().eq('id', id);
}

/* ── Módulos e Aulas ── */
export async function getModules(): Promise<CourseModule[]> {
  if (!isSupabaseConfigured) {
    return [];
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
      return [];
    }

    // Filtra módulos de demonstração para manter limpo até cadastro real
    const realModules = (data as Record<string, any>[]).filter(
      mod => !SEED_DEMO_MODULE_IDS.has(String(mod.id))
    );

    return realModules.map((mod) => ({
      id: String(mod.id),
      title: mod.title,
      subtitle: mod.subtitle || '',
      description: mod.description || '',
      orderIndex: mod.orderIndex || mod.order_index || 1,
      level: mod.level || 'Essencial',
      thumbnailUrl: mod.thumbnailUrl || mod.thumbnail_url || '',
      lessons: ((mod.lessons || []) as Record<string, any>[]).map((les) => ({
        id: String(les.id),
        moduleId: String(les.moduleId || les.module_id || mod.id),
        title: les.title,
        description: les.description || '',
        durationMinutes: les.durationMinutes || les.duration_minutes || 30,
        videoUrl: les.videoUrl || les.video_url || '',
        videoProvider: les.videoProvider || les.video_provider || 'youtube',
        orderIndex: les.orderIndex || les.order_index || 1,
        keyTakeaways: les.keyTakeaways || les.key_takeaways || [],
        attachedMaterialIds: les.attachedMaterialIds || les.attached_material_ids || []
      }))
    })) as CourseModule[];
  } catch {
    return [];
  }
}

/* ── Utilitário para exclusão dos dados de demonstração no Supabase ── */
export async function cleanupDemoData() {
  if (!isSupabaseConfigured) return;
  try {
    for (const matId of Array.from(SEED_DEMO_MATERIAL_IDS)) {
      await supabase.from('materials').delete().eq('id', matId);
    }
    for (const modId of Array.from(SEED_DEMO_MODULE_IDS)) {
      await supabase.from('modules').delete().eq('id', modId);
    }
  } catch (err) {
    console.warn('cleanupDemoData log:', err);
  }
}

