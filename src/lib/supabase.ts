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
      plan: data.plan || 'Consulta',
      billingCycle: data.billing_cycle || 'mensal',
      subscriptionStatus: (data.subscription_status as any) || 'pending',
      stripeCustomerId: data.stripe_customer_id || undefined,
      stripeSubscriptionId: data.stripe_subscription_id || undefined,
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

export async function updateUserPassword(password: string) {
  if (!isSupabaseConfigured) return { data: null, error: null };
  return await supabase.auth.updateUser({ password });
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

/* ── Anotações Pessoais de Materiais / PDFs ── */
export async function getMaterialNotes(materialId: string): Promise<string> {
  if (!isSupabaseConfigured) return '';
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user?.id) return '';

    const { data, error } = await supabase
      .from('user_material_notes')
      .select('notes')
      .eq('user_id', session.user.id)
      .eq('material_id', materialId)
      .maybeSingle();

    if (error || !data) return '';
    return data.notes || '';
  } catch {
    return '';
  }
}

export async function saveMaterialNotes(materialId: string, notes: string): Promise<boolean> {
  if (!isSupabaseConfigured) return false;
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user?.id) return false;

    const { error } = await supabase
      .from('user_material_notes')
      .upsert({
        user_id: session.user.id,
        material_id: materialId,
        notes: notes,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id,material_id'
      });

    return !error;
  } catch {
    return false;
  }
}

/* ── Sessões Interativas e Anotações por Paciente ── */
export interface InteractiveSessionData {
  observarNotas?: string;
  intensidade?: number | null;
  pensarNotas?: string;
  crenca?: number | null;
  respostaIdx?: number | null;
  opcoesCustomizadas?: string[];
  agirNotas?: string;
  etapasFeitas?: [boolean, boolean, boolean];
  updatedAt?: string;
  [key: string]: any;
}

export interface EvolucaoSessionData {
  numeroSessao: number;
  dataSessao: string;
  modalidade: 'presencial' | 'online' | 'Presencial' | 'Online';
  duracao?: string;
  humor?: number | null;
  comportamento?: string[];
  obs?: string;
  estadoEmocional?: string;
  temas?: string;
  temasAbordados?: string;
  tecnicas?: string[];
  intervencoes?: string;
  resposta?: string;
  evolucaoClinica?: string;
  combinados?: string;
  tarefasCombinados?: string;
  proxima?: string;
  planoProximaSessao?: string;
  encaminhamentos?: string;
  recursosVinculados?: string[];
  updatedAt?: string;
  [key: string]: any;
}


export async function getUserInteractivePatients(): Promise<string[]> {
  const defaultList = ['Paciente 01'];
  const localList = (() => {
    if (typeof window === 'undefined') return defaultList;
    try {
      const saved = localStorage.getItem('na_interactive_patients');
      return saved ? JSON.parse(saved) : defaultList;
    } catch {
      return defaultList;
    }
  })();

  if (!isSupabaseConfigured) return localList;

  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user?.id) return localList;

    const [sessRes, patRes] = await Promise.all([
      supabase.from('user_interactive_sessions').select('patient_code').eq('user_id', session.user.id),
      supabase.from('user_patients').select('code').eq('user_id', session.user.id)
    ]);

    const sessCodes = sessRes.data ? sessRes.data.map((d: any) => String(d.patient_code)).filter(Boolean) : [];
    const patCodes = patRes.data ? patRes.data.map((d: any) => String(d.code)).filter(Boolean) : [];

    const dbCodes = Array.from(new Set([...sessCodes, ...patCodes]));
    const merged = Array.from(new Set([...localList, ...dbCodes]));
    return merged.length > 0 ? merged : defaultList;
  } catch {
    return localList;
  }
}

export async function getInteractiveSession(
  resourceType: string,
  resourceId: string,
  patientCode: string
): Promise<InteractiveSessionData | null> {
  const localKey = `na_session_${resourceType}_${resourceId}_${patientCode}`;
  const getLocal = (): InteractiveSessionData | null => {
    if (typeof window === 'undefined') return null;
    try {
      const saved = localStorage.getItem(localKey);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  };

  if (!isSupabaseConfigured) return getLocal();

  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user?.id) return getLocal();

    const { data, error } = await supabase
      .from('user_interactive_sessions')
      .select('data')
      .eq('user_id', session.user.id)
      .eq('resource_type', resourceType)
      .eq('resource_id', resourceId)
      .eq('patient_code', patientCode)
      .maybeSingle();

    if (error) {
      // Fallback local se a tabela ainda não tiver sido criada no DB
      return getLocal();
    }

    if (data?.data) {
      try {
        localStorage.setItem(localKey, JSON.stringify(data.data));
      } catch {}
      return data.data as InteractiveSessionData;
    }

    return getLocal();
  } catch {
    return getLocal();
  }
}

export async function saveInteractiveSession(
  resourceType: string,
  resourceId: string,
  patientCode: string,
  sessionData: InteractiveSessionData
): Promise<boolean> {
  const localKey = `na_session_${resourceType}_${resourceId}_${patientCode}`;

  // Salva no localStorage imediatamente para garantir zero latência e backup
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(localKey, JSON.stringify(sessionData));

      // Garante que o paciente esteja na lista salva
      const savedPatients = localStorage.getItem('na_interactive_patients');
      const list: string[] = savedPatients ? JSON.parse(savedPatients) : ['Paciente 01'];
      if (!list.includes(patientCode)) {
        list.push(patientCode);
        localStorage.setItem('na_interactive_patients', JSON.stringify(list));
      }
    } catch {}
  }

  if (!isSupabaseConfigured) return true;

  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user?.id) return true;

    const { error } = await supabase
      .from('user_interactive_sessions')
      .upsert({
        user_id: session.user.id,
        resource_type: resourceType,
        resource_id: resourceId,
        patient_code: patientCode,
        data: sessionData,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id,resource_type,resource_id,patient_code'
      });

    // Auto-registra o paciente na tabela user_patients se não existir
    try {
      await supabase
        .from('user_patients')
        .upsert(
          {
            user_id: session.user.id,
            code: patientCode,
            updated_at: new Date().toISOString()
          },
          { onConflict: 'user_id,code', ignoreDuplicates: true }
        );
    } catch {}

    return !error;
  } catch {
    return false;
  }
}

export const saveUserSession = saveInteractiveSession;

export async function ensureInteractiveSessionRecord(
  resourceType: string,
  resourceId: string,
  patientCode: string,
  initialData: InteractiveSessionData = {}
): Promise<{ id: string; isNew: boolean } | null> {
  const localKey = `na_session_${resourceType}_${resourceId}_${patientCode}`;

  if (!isSupabaseConfigured) {
    let localId = '';
    if (typeof window !== 'undefined') {
      try {
        const existing = localStorage.getItem(`na_session_uuid_${localKey}`);
        if (existing) {
          localId = existing;
        } else {
          localId = 'sess_' + Math.random().toString(36).substring(2, 10);
          localStorage.setItem(`na_session_uuid_${localKey}`, localId);
        }
      } catch {}
    }
    return { id: localId || 'sess-local-id', isNew: false };
  }

  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user?.id) return null;

    // 1. Tenta recuperar sessão existente
    const { data: existing } = await supabase
      .from('user_interactive_sessions')
      .select('id')
      .eq('user_id', session.user.id)
      .eq('resource_type', resourceType)
      .eq('resource_id', resourceId)
      .eq('patient_code', patientCode)
      .maybeSingle();

    if (existing?.id) {
      return { id: existing.id, isNew: false };
    }

    // 2. Se não existir, insere e obtém o UUID gerado
    const { data: inserted, error } = await supabase
      .from('user_interactive_sessions')
      .upsert({
        user_id: session.user.id,
        resource_type: resourceType,
        resource_id: resourceId,
        patient_code: patientCode,
        data: initialData,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id,resource_type,resource_id,patient_code'
      })
      .select('id')
      .single();

    if (error || !inserted?.id) return null;
    return { id: inserted.id, isNew: true };
  } catch {
    return null;
  }
}


export async function deleteInteractiveSession(
  resourceType: string,
  resourceId: string,
  patientCode: string,
  sessionId?: string
): Promise<boolean> {
  const localKey = `na_session_${resourceType}_${resourceId}_${patientCode}`;
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem(localKey);
      if (resourceType === 'dramatizacao') {
        localStorage.removeItem('na-dramatizacao-v1');
      }
    } catch {}
  }

  if (!isSupabaseConfigured) return true;

  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user?.id) return true;

    // Se possui UUID válido do banco, apaga por id
    if (sessionId && !sessionId.includes('_')) {
      const { error } = await supabase
        .from('user_interactive_sessions')
        .delete()
        .eq('id', sessionId)
        .eq('user_id', session.user.id);
      return !error;
    }

    const { error } = await supabase
      .from('user_interactive_sessions')
      .delete()
      .eq('user_id', session.user.id)
      .eq('resource_type', resourceType)
      .eq('resource_id', resourceId)
      .eq('patient_code', patientCode);

    return !error;
  } catch {
    return false;
  }
}

export interface StoredSessionRecord {
  id?: string;
  resource_type: string;
  resource_id: string;
  patient_code: string;
  data: InteractiveSessionData;
  created_at?: string;
  updated_at?: string;
}

export async function getAllUserInteractiveSessions(): Promise<StoredSessionRecord[]> {
  // 1. Coleta itens locais como base/fallback
  const localItems: StoredSessionRecord[] = [];
  if (typeof window !== 'undefined') {
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith('na_session_')) {
          const parts = k.replace('na_session_', '').split('_');
          if (parts.length >= 3) {
            const type = parts[0];
            const code = parts[parts.length - 1];
            const resId = parts.slice(1, -1).join('_');
            const raw = localStorage.getItem(k);
            if (raw) {
              const data = JSON.parse(raw);
              localItems.push({
                resource_type: type,
                resource_id: resId,
                patient_code: code,
                data: data,
                updated_at: data.updatedAt || new Date().toISOString()
              });
            }
          }
        }
      }
    } catch {}
  }

  if (!isSupabaseConfigured) return localItems;

  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user?.id) return localItems;

    const { data, error } = await supabase
      .from('user_interactive_sessions')
      .select('id, resource_type, resource_id, patient_code, data, created_at, updated_at')
      .eq('user_id', session.user.id)
      .order('updated_at', { ascending: false });

    if (error || !data || data.length === 0) return localItems;

    return data as StoredSessionRecord[];
  } catch {
    return localItems;
  }
}

export async function deletePatientAllSessions(patientCode: string): Promise<boolean> {
  if (typeof window !== 'undefined') {
    try {
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith('na_session_') && k.endsWith(`_${patientCode}`)) {
          keysToRemove.push(k);
        }
      }
      keysToRemove.forEach(k => localStorage.removeItem(k));

      const savedPatients = localStorage.getItem('na_interactive_patients');
      if (savedPatients) {
        const list: string[] = JSON.parse(savedPatients);
        const filtered = list.filter(p => p !== patientCode);
        localStorage.setItem('na_interactive_patients', JSON.stringify(filtered));
      }
    } catch {}
  }

  if (!isSupabaseConfigured) return true;

  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user?.id) return true;

    const { error } = await supabase
      .from('user_interactive_sessions')
      .delete()
      .eq('user_id', session.user.id)
      .eq('patient_code', patientCode);

    return !error;
  } catch {
    return false;
  }
}

/* =========================================================================
   PACIENTES & NOTAS CLÍNICAS (user_patients)
   ========================================================================= */

export interface UserPatientRecord {
  id?: string;
  code: string;
  note?: string;
  created_at?: string;
  updated_at?: string;
}

export async function getUserPatients(): Promise<UserPatientRecord[]> {
  const defaultCodes = ['Paciente 01'];
  const localItems: UserPatientRecord[] = [];

  // 1. Carrega do localStorage como fallback e para resposta instantânea
  if (typeof window !== 'undefined') {
    try {
      const savedPatients = localStorage.getItem('na_interactive_patients');
      const list: string[] = savedPatients ? JSON.parse(savedPatients) : defaultCodes;
      const notesRaw = localStorage.getItem('na_patient_notes');
      const notes: Record<string, string> = notesRaw ? JSON.parse(notesRaw) : {};

      list.forEach((c) => {
        if (c) {
          localItems.push({
            code: c,
            note: notes[c] || '',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
        }
      });
    } catch {}
  }

  if (!isSupabaseConfigured) return localItems;

  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user?.id) return localItems;

    const { data, error } = await supabase
      .from('user_patients')
      .select('id, code, note, created_at, updated_at')
      .eq('user_id', session.user.id)
      .order('updated_at', { ascending: false });

    if (error || !data || data.length === 0) {
      return localItems;
    }

    // Mantém o cache local atualizado com o Supabase
    if (typeof window !== 'undefined') {
      try {
        const codes = Array.from(new Set([...data.map((p) => p.code), ...localItems.map((p) => p.code)]));
        const notesObj: Record<string, string> = {};
        localItems.forEach((li) => { if (li.note) notesObj[li.code] = li.note; });
        data.forEach((p) => { if (p.note) notesObj[p.code] = p.note; });
        localStorage.setItem('na_interactive_patients', JSON.stringify(codes));
        localStorage.setItem('na_patient_notes', JSON.stringify(notesObj));
      } catch {}
    }

    return data as UserPatientRecord[];
  } catch {
    return localItems;
  }
}

export async function saveUserPatient(code: string, note: string = ''): Promise<boolean> {
  const cleanCode = code.trim();
  if (!cleanCode) return false;

  // 1. Atualiza imediatamente o localStorage (backup offline e reatividade rápida)
  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem('na_interactive_patients');
      const list: string[] = saved ? JSON.parse(saved) : ['Paciente 01'];
      if (!list.includes(cleanCode)) {
        list.push(cleanCode);
        localStorage.setItem('na_interactive_patients', JSON.stringify(list));
      }
      const notesRaw = localStorage.getItem('na_patient_notes');
      const notes: Record<string, string> = notesRaw ? JSON.parse(notesRaw) : {};
      notes[cleanCode] = note;
      localStorage.setItem('na_patient_notes', JSON.stringify(notes));
    } catch {}
  }

  if (!isSupabaseConfigured) return true;

  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user?.id) return true;

    const { error } = await supabase
      .from('user_patients')
      .upsert({
        user_id: session.user.id,
        code: cleanCode,
        note: note,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id,code'
      });

    return !error;
  } catch {
    return false;
  }
}

export async function updateUserPatientCode(
  oldCode: string,
  newCode: string,
  note?: string
): Promise<boolean> {
  const cleanOld = oldCode.trim();
  const cleanNew = newCode.trim();
  if (!cleanOld || !cleanNew) return false;

  // 1. Atualiza no localStorage
  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem('na_interactive_patients');
      if (saved) {
        const list: string[] = JSON.parse(saved);
        const idx = list.indexOf(cleanOld);
        if (idx > -1) list[idx] = cleanNew;
        else if (!list.includes(cleanNew)) list.push(cleanNew);
        localStorage.setItem('na_interactive_patients', JSON.stringify(list));
      }
      const notesRaw = localStorage.getItem('na_patient_notes');
      const notes: Record<string, string> = notesRaw ? JSON.parse(notesRaw) : {};
      const currentNote = note !== undefined ? note : notes[cleanOld] || '';
      delete notes[cleanOld];
      notes[cleanNew] = currentNote;
      localStorage.setItem('na_patient_notes', JSON.stringify(notes));

      // Atualiza chaves das sessões locais
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith('na_session_') && k.endsWith(`_${cleanOld}`)) {
          const newK = k.slice(0, -cleanOld.length) + cleanNew;
          const val = localStorage.getItem(k);
          if (val) {
            localStorage.setItem(newK, val);
            localStorage.removeItem(k);
          }
        }
      }
    } catch {}
  }

  if (!isSupabaseConfigured) return true;

  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user?.id) return true;

    if (cleanOld !== cleanNew) {
      // Atualiza registro em user_patients
      await supabase
        .from('user_patients')
        .update({
          code: cleanNew,
          ...(note !== undefined ? { note } : {}),
          updated_at: new Date().toISOString()
        })
        .eq('user_id', session.user.id)
        .eq('code', cleanOld);

      // Cascata a alteração em user_interactive_sessions
      await supabase
        .from('user_interactive_sessions')
        .update({
          patient_code: cleanNew,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', session.user.id)
        .eq('patient_code', cleanOld);
    } else if (note !== undefined) {
      await supabase
        .from('user_patients')
        .update({
          note,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', session.user.id)
        .eq('code', cleanOld);
    }

    return true;
  } catch {
    return false;
  }
}

export async function deleteUserPatient(code: string): Promise<boolean> {
  const cleanCode = code.trim();
  if (!cleanCode) return false;

  // 1. Remove do localStorage
  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem('na_interactive_patients');
      if (saved) {
        const list: string[] = JSON.parse(saved);
        localStorage.setItem(
          'na_interactive_patients',
          JSON.stringify(list.filter((c) => c !== cleanCode))
        );
      }
      const notesRaw = localStorage.getItem('na_patient_notes');
      if (notesRaw) {
        const notes: Record<string, string> = JSON.parse(notesRaw);
        delete notes[cleanCode];
        localStorage.setItem('na_patient_notes', JSON.stringify(notes));
      }
    } catch {}
  }

  if (!isSupabaseConfigured) return true;

  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user?.id) return true;

    const { error } = await supabase
      .from('user_patients')
      .delete()
      .eq('user_id', session.user.id)
      .eq('code', cleanCode);

    return !error;
  } catch {
    return false;
  }
}




