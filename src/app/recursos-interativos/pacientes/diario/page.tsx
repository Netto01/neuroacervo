'use client';

import React, { Suspense, useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getUserPatients } from '@/lib/supabase';
import { AnxietyEntry } from '@/types/clinicalSession';
import './meus-registros.css';

interface RegistroItem {
  id: string | number;
  tipo: 'ansiedade' | 'situacao';
  data: string; // YYYY-MM-DD
  hora: string; // HH:MM
  compartilhado: boolean;
  intensidade?: number;
  situacao?: string;
  sensacoes?: string[];
  pensamentos?: string;
  o_que_fez?: string;
  antecedente?: string;
  resposta?: string;
  consequencia?: string;
  efeitos?: string;
}

const SENSACOES_PADRAO = [
  'Coração acelerado',
  'Falta de ar',
  'Aperto no peito',
  'Tremor',
  'Suor',
  'Tensão muscular',
  'Estômago',
  'Tontura',
  'Inquietação'
];

function isoLocal(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function cor(v: number): string {
  return v <= 3 ? 'var(--low)' : v <= 6 ? 'var(--mid)' : 'var(--high)';
}

function palavra(v: number): string {
  if (v === 0) return 'Nenhuma';
  if (v <= 3) return 'Leve';
  if (v <= 6) return 'Moderada';
  if (v <= 8) return 'Forte';
  return 'Muito forte';
}

function rotuloDia(iso: string, hoje: Date): string {
  try {
    const x = new Date(`${iso}T00:00:00`);
    const diffMs = hoje.getTime() - x.getTime();
    const n = Math.round(diffMs / 864e5);
    if (n === 0) return 'Hoje';
    if (n === 1) return 'Ontem';
    return x.toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: '2-digit',
      month: 'short'
    }).replace('.', '');
  } catch {
    return iso;
  }
}

function DiarioContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pacienteCodigo = searchParams.get('paciente') || 'Paciente 01';
  const [patientId, setPatientId] = useState<string>('');
  const [nomeProfissional, setNomeProfissional] = useState<string>('NeuroAcervo');

  // Abas e visualizações
  const [activeTab, setActiveTab] = useState<'tab-ans' | 'tab-sit' | 'tab-reg'>('tab-ans');
  const [lastFormTab, setLastFormTab] = useState<'tab-ans' | 'tab-sit'>('tab-ans');
  const [isDone, setIsDone] = useState<boolean>(false);
  const [doneData, setDoneData] = useState<{ tipo: 'ansiedade' | 'situacao'; compartilhado: boolean }>({
    tipo: 'ansiedade',
    compartilhado: true
  });

  // Estado de Formulário
  const now = useMemo(() => new Date(), []);
  const initialData = useMemo(() => isoLocal(now), [now]);
  const initialHora = useMemo(() => {
    return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  }, [now]);

  const [formData, setFormData] = useState({
    data: initialData,
    hora: initialHora,
    ans_situacao: '',
    ans_intensidade: 5,
    ans_sensacoes: [] as string[],
    ans_sensacao_outra: '',
    ans_pensamentos: '',
    ans_o_que_fez: '',
    sit_antecedente: '',
    sit_resposta: '',
    sit_consequencia: '',
    sit_efeito_curto: '',
    sit_efeito_longo: '',
    compartilhado: true
  });

  const [editWhenAns, setEditWhenAns] = useState<boolean>(false);
  const [editWhenSit, setEditWhenSit] = useState<boolean>(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, boolean>>({});
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [hasFail, setHasFail] = useState<boolean>(false);

  // Lista de Meus Registros
  const [dados, setDados] = useState<RegistroItem[]>([]);
  const [filtro, setFiltro] = useState<'todos' | 'ansiedade' | 'situacao' | 'privados'>('todos');
  const [openItems, setOpenItems] = useState<Record<string | number, boolean>>({});

  // Toast
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [toastAtivo, setToastAtivo] = useState<boolean>(false);
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const dispararToast = useCallback((msg: string) => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToastMsg(msg);
    setToastAtivo(true);
    toastTimeoutRef.current = setTimeout(() => {
      setToastAtivo(false);
    }, 2400);
  }, []);

  const hoje = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  // 1. Inicializa paciente
  useEffect(() => {
    async function init() {
      try {
        const pts = await getUserPatients();
        const p = pts.find(
          (x) => (x.code || '').trim().toLowerCase() === pacienteCodigo.trim().toLowerCase()
        );
        if (p?.id) {
          setPatientId(p.id);
        } else {
          setPatientId(pacienteCodigo);
        }
      } catch {
        setPatientId(pacienteCodigo);
      }
    }
    init();
  }, [pacienteCodigo]);

  // 2. Busca registros do paciente
  const carregarRegistros = useCallback(async () => {
    if (!patientId) return;
    try {
      const res = await fetch(`/api/patients/${patientId}/anxiety-entries`);
      let list: AnxietyEntry[] = [];
      if (res.ok) {
        const json = await res.json();
        if (json.data && Array.isArray(json.data)) {
          list = json.data;
        }
      }

      if (list.length > 0) {
        const adaptados: RegistroItem[] = list.map((e) => {
          const dt = new Date(e.occurred_at || new Date().toISOString());
          const dStr = isoLocal(dt);
          const hStr = `${String(dt.getHours()).padStart(2, '0')}:${String(dt.getMinutes()).padStart(2, '0')}`;
          const tags = e.action_taken?.tags || [];
          const freeText = e.action_taken?.free_text || '';

          const isSituacao = tags.includes('Situação A-R-C');

          if (isSituacao) {
            return {
              id: e.id,
              tipo: 'situacao',
              data: dStr,
              hora: hStr,
              compartilhado: e.shared ?? true,
              antecedente: e.situation,
              resposta: e.body_thoughts || '',
              consequencia: freeText.replace(/^Consequência:\s*/, ''),
              efeitos: e.aftermath || ''
            };
          }

          const acaoCompleta = [tags.join(', '), freeText].filter(Boolean).join(' - ');

          return {
            id: e.id,
            tipo: 'ansiedade',
            data: dStr,
            hora: hStr,
            compartilhado: e.shared ?? true,
            intensidade: e.intensity,
            situacao: e.situation,
            sensacoes: tags.length ? tags : ['Ansiedade'],
            pensamentos: e.body_thoughts || '',
            o_que_fez: acaoCompleta
          };
        });
        setDados(adaptados);
      } else {
        // Exemplo inicial de demonstração
        const d = new Date();
        const dia = (n: number) => {
          const x = new Date(d);
          x.setDate(d.getDate() - n);
          return isoLocal(x);
        };
        setDados([
          {
            id: 1,
            tipo: 'situacao',
            data: dia(0),
            hora: '08:40',
            compartilhado: true,
            antecedente: 'Reunião de equipe às 8h; chefe pediu apresentação sem aviso.',
            resposta: 'Pensei "vou travar", o coração disparou e pedi para apresentar depois.',
            consequencia: 'Um colega apresentou no meu lugar e senti alívio.',
            efeitos: 'Curto: menos ansiedade / Longo: medo da próxima reunião'
          },
          {
            id: 2,
            tipo: 'ansiedade',
            data: dia(0),
            hora: '08:10',
            compartilhado: true,
            intensidade: 8,
            situacao: 'Antes da reunião de equipe, no trabalho',
            sensacoes: ['Coração acelerado', 'Tensão muscular', 'Falta de ar'],
            pensamentos: '"Vou travar e todo mundo vai perceber"',
            o_que_fez: ''
          },
          {
            id: 3,
            tipo: 'ansiedade',
            data: dia(2),
            hora: '21:40',
            compartilhado: true,
            intensidade: 6,
            situacao: 'Ao deitar',
            sensacoes: ['Inquietação'],
            pensamentos: 'Ruminação sobre o dia seguinte',
            o_que_fez: 'Tentei ler um pouco'
          },
          {
            id: 4,
            tipo: 'ansiedade',
            data: dia(4),
            hora: '15:00',
            compartilhado: false,
            intensidade: 3,
            situacao: 'No trânsito',
            sensacoes: ['Tensão muscular'],
            pensamentos: '',
            o_que_fez: 'Usei a respiração; passou em 10 min'
          },
          {
            id: 5,
            tipo: 'ansiedade',
            data: dia(7),
            hora: '10:20',
            compartilhado: true,
            intensidade: 7,
            situacao: 'Fila do banco, muita gente',
            sensacoes: ['Suor', 'Tontura'],
            pensamentos: '"Vou passar mal aqui"',
            o_que_fez: 'Saí da fila'
          },
          {
            id: 6,
            tipo: 'ansiedade',
            data: dia(10),
            hora: '19:05',
            compartilhado: true,
            intensidade: 5,
            situacao: 'Esperando resposta de mensagem',
            sensacoes: ['Estômago'],
            pensamentos: '',
            o_que_fez: ''
          }
        ]);
      }
    } catch {
      // Fallback gracioso
    }
  }, [patientId]);

  useEffect(() => {
    if (patientId) {
      carregarRegistros();
    }
  }, [patientId, carregarRegistros]);

  // 3. Hash e aba inicial
  const selectTab = useCallback((tab: 'tab-ans' | 'tab-sit' | 'tab-reg') => {
    setActiveTab(tab);
    if (tab !== 'tab-reg') {
      setLastFormTab(tab);
    }
    setHasFail(false);
    const hash = { 'tab-ans': '#ansiedade', 'tab-sit': '#situacao', 'tab-reg': '#registros' }[tab];
    if (typeof window !== 'undefined') {
      if (window.location.hash !== hash) {
        window.history.replaceState(null, '', hash);
      }
      try {
        localStorage.setItem('na_registro_aba', tab);
      } catch {}
      window.scrollTo(0, 0);
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    let startTab: 'tab-ans' | 'tab-sit' | 'tab-reg' | null = null;
    const h = window.location.hash;
    if (h === '#ansiedade') startTab = 'tab-ans';
    else if (h === '#situacao') startTab = 'tab-sit';
    else if (h === '#registros') startTab = 'tab-reg';

    if (!startTab) {
      try {
        const saved = localStorage.getItem('na_registro_aba') as any;
        if (saved === 'tab-ans' || saved === 'tab-sit' || saved === 'tab-reg') {
          startTab = saved;
        }
      } catch {}
    }

    if (startTab) {
      selectTab(startTab);
    }
  }, [selectTab]);

  // 4. Rascunho (Salvar e Restaurar)
  const DRAFT_KEY = 'na_registro_rascunho';

  useEffect(() => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        setFormData((prev) => ({
          ...prev,
          ...parsed,
          data: prev.data,
          hora: prev.hora
        }));
      }
    } catch {}
  }, []);

  const saveDraft = useCallback((newData: typeof formData) => {
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(newData));
    } catch {}
  }, []);

  const updateFormData = (updater: Partial<typeof formData> | ((prev: typeof formData) => typeof formData)) => {
    setFormData((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : { ...prev, ...updater };
      saveDraft(next);
      return next;
    });
  };

  // Textarea auto-grow
  const handleTextareaInput = (e: React.FormEvent<HTMLTextAreaElement>) => {
    const target = e.currentTarget;
    target.style.height = 'auto';
    target.style.height = `${target.scrollHeight}px`;
    if (target.value.trim()) {
      target.removeAttribute('aria-invalid');
    }
  };

  // Toggle de data/hora
  const whenLabel = useMemo(() => {
    if (formData.data === initialData && formData.hora === initialHora) {
      return 'agora';
    }
    const p = formData.data.split('-');
    return p.length === 3 ? `${p[2]}/${p[1]} às ${formData.hora}` : `${formData.data} às ${formData.hora}`;
  }, [formData.data, formData.hora, initialData, initialHora]);

  // Alterna compartilhamento em "Meus registros"
  const alternarCompartilhamentoItem = (id: string | number, valor: boolean) => {
    setDados((prev) =>
      prev.map((r) => (r.id === id ? { ...r, compartilhado: valor } : r))
    );
    dispararToast(
      valor
        ? 'Agora seu psicólogo pode ver este registro'
        : 'Este registro agora é só seu'
    );
  };

  // Accordion do registro
  const alternarAberto = (id: string | number) => {
    setOpenItems((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Alternar chips de sensação
  const toggleSensacao = (val: string) => {
    updateFormData((prev) => {
      const exists = prev.ans_sensacoes.includes(val);
      const nextSens = exists
        ? prev.ans_sensacoes.filter((s) => s !== val)
        : [...prev.ans_sensacoes, val];
      return { ...prev, ans_sensacoes: nextSens };
    });
  };

  // 5. Envio do Formulário
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const isSituacao = activeTab === 'tab-sit';

    // Validação de campos obrigatórios
    const errors: Record<string, boolean> = {};
    if (isSituacao) {
      if (!formData.sit_antecedente.trim()) errors.sit_antecedente = true;
      if (!formData.sit_resposta.trim()) errors.sit_resposta = true;
    } else {
      if (!formData.ans_situacao.trim()) errors.ans_situacao = true;
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      const firstKey = Object.keys(errors)[0];
      const el = document.getElementById(firstKey === 'sit_antecedente' ? 'sit-a' : firstKey === 'sit_resposta' ? 'sit-r' : 'ans-sit');
      if (el) {
        el.focus();
        el.scrollIntoView({ block: 'center', behavior: 'smooth' });
      }
      return;
    }

    setFieldErrors({});
    setIsSaving(true);
    setHasFail(false);

    try {
      const combinedDateTime = new Date(`${formData.data}T${formData.hora}:00`);

      let itemSalvo: RegistroItem;

      if (!isSituacao) {
        const sensacoesCompletas = [...formData.ans_sensacoes];
        if (formData.ans_sensacao_outra.trim()) {
          sensacoesCompletas.push(formData.ans_sensacao_outra.trim());
        }

        const payload = {
          situation: formData.ans_situacao.trim(),
          intensity: formData.ans_intensidade,
          occurred_at: combinedDateTime.toISOString(),
          body_thoughts: formData.ans_pensamentos.trim(),
          action_taken: {
            tags: sensacoesCompletas,
            free_text: formData.ans_o_que_fez.trim()
          },
          shared: formData.compartilhado
        };

        let serverId: string | number = Date.now();
        if (patientId) {
          try {
            const res = await fetch(`/api/patients/${patientId}/anxiety-entries`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload)
            });
            if (res.ok) {
              const resJson = await res.json();
              if (resJson.data?.id) serverId = resJson.data.id;
            }
          } catch {}
        }

        itemSalvo = {
          id: serverId,
          tipo: 'ansiedade',
          data: formData.data,
          hora: formData.hora,
          compartilhado: formData.compartilhado,
          intensidade: formData.ans_intensidade,
          situacao: formData.ans_situacao.trim(),
          sensacoes: sensacoesCompletas,
          pensamentos: formData.ans_pensamentos.trim(),
          o_que_fez: formData.ans_o_que_fez.trim()
        };
      } else {
        const ec = formData.sit_efeito_curto.trim();
        const el = formData.sit_efeito_longo.trim();
        const efeitosComb = [ec && `Curto: ${ec}`, el && `Longo: ${el}`].filter(Boolean).join(' / ');

        const payload = {
          situation: formData.sit_antecedente.trim(),
          intensity: 5,
          occurred_at: combinedDateTime.toISOString(),
          body_thoughts: formData.sit_resposta.trim(),
          action_taken: {
            tags: ['Situação A-R-C'],
            free_text: formData.sit_consequencia.trim() ? `Consequência: ${formData.sit_consequencia.trim()}` : ''
          },
          aftermath: efeitosComb,
          shared: formData.compartilhado
        };

        let serverId: string | number = Date.now();
        if (patientId) {
          try {
            const res = await fetch(`/api/patients/${patientId}/anxiety-entries`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload)
            });
            if (res.ok) {
              const resJson = await res.json();
              if (resJson.data?.id) serverId = resJson.data.id;
            }
          } catch {}
        }

        itemSalvo = {
          id: serverId,
          tipo: 'situacao',
          data: formData.data,
          hora: formData.hora,
          compartilhado: formData.compartilhado,
          antecedente: formData.sit_antecedente.trim(),
          resposta: formData.sit_resposta.trim(),
          consequencia: formData.sit_consequencia.trim(),
          efeitos: efeitosComb
        };
      }

      // Adiciona na lista
      setDados((prev) => [itemSalvo, ...prev]);

      // Limpa rascunho
      try {
        localStorage.removeItem(DRAFT_KEY);
      } catch {}

      // Registra sucesso
      setDoneData({
        tipo: isSituacao ? 'situacao' : 'ansiedade',
        compartilhado: formData.compartilhado
      });
      setIsDone(true);
      if (typeof window !== 'undefined') window.scrollTo(0, 0);
    } catch {
      setHasFail(true);
    } finally {
      setIsSaving(false);
    }
  };

  const resetForm = () => {
    setFormData({
      data: initialData,
      hora: initialHora,
      ans_situacao: '',
      ans_intensidade: 5,
      ans_sensacoes: [],
      ans_sensacao_outra: '',
      ans_pensamentos: '',
      ans_o_que_fez: '',
      sit_antecedente: '',
      sit_resposta: '',
      sit_consequencia: '',
      sit_efeito_curto: '',
      sit_efeito_longo: '',
      compartilhado: true
    });
    setFieldErrors({});
    setIsDone(false);
  };

  // 6. Resumo e Gráfico de 14 dias
  const resumo = useMemo(() => {
    const lim = new Date(hoje);
    lim.setDate(lim.getDate() - 13);

    const rec = dados.filter((r) => new Date(`${r.data}T00:00:00`) >= lim);
    const ans = rec.filter((r) => r.tipo === 'ansiedade');
    const total = rec.length;
    const sit = rec.length - ans.length;

    const media = ans.length
      ? (ans.reduce((a, r) => a + (r.intensidade || 0), 0) / ans.length)
          .toFixed(1)
          .replace('.', ',')
      : '–';

    const barItems: { diaNum: number; max: number; iso: string }[] = [];
    for (let i = 13; i >= 0; i--) {
      const x = new Date(hoje);
      x.setDate(x.getDate() - i);
      const iso = isoLocal(x);
      let max = -1;
      ans.forEach((r) => {
        if (r.data === iso && (r.intensidade ?? -1) > max) {
          max = r.intensidade ?? -1;
        }
      });
      barItems.push({
        diaNum: i % 2 === 0 ? x.getDate() : 0,
        max,
        iso
      });
    }

    return { total, sit, media, barItems };
  }, [dados, hoje]);

  // Lista filtrada e agrupada por dia
  const { grupos, totalFiltrados } = useMemo(() => {
    const lista = dados
      .filter((r) => {
        if (filtro === 'todos') return true;
        if (filtro === 'privados') return !r.compartilhado;
        return r.tipo === filtro;
      })
      .sort((a, b) => `${b.data} ${b.hora}`.localeCompare(`${a.data} ${a.hora}`));

    const grp: Record<string, RegistroItem[]> = {};
    lista.forEach((r) => {
      grp[r.data] = grp[r.data] || [];
      grp[r.data].push(r);
    });

    return { grupos: grp, totalFiltrados: lista.length };
  }, [dados, filtro]);

  const viewMode = activeTab === 'tab-reg' ? 'reg' : 'form';

  return (
    <div
      className={`paciente-diario-root ${isDone ? 'is-done' : ''}`}
      data-view={viewMode}
    >
      <main className="wrap">
        {/* Topo */}
        <div className="top">
          <button
            className="back"
            type="button"
            aria-label="Voltar"
            onClick={() => {
              if (typeof window !== 'undefined' && window.history.length > 1) {
                window.history.back();
              } else {
                router.push(
                  `/recursos-interativos/pacientes?paciente=${encodeURIComponent(pacienteCodigo)}`
                );
              }
            }}
          >
            <svg viewBox="0 0 24 24">
              <path d="M15 6l-6 6 6 6" />
            </svg>
          </button>
          <span className="who">
            com <b>Psic. {nomeProfissional}</b>
          </span>
        </div>

        {/* Abas */}
        <div className="tabs" role="tablist" aria-label="Telas">
          <button
            className="tab"
            role="tab"
            id="tab-ans"
            aria-controls="p-ans"
            aria-selected={activeTab === 'tab-ans'}
            tabIndex={activeTab === 'tab-ans' ? 0 : -1}
            onClick={() => selectTab('tab-ans')}
            onKeyDown={(e) => {
              if (e.key === 'ArrowRight') selectTab('tab-sit');
              if (e.key === 'ArrowLeft') selectTab('tab-reg');
            }}
          >
            Ansiedade
          </button>
          <button
            className="tab"
            role="tab"
            id="tab-sit"
            aria-controls="p-sit"
            aria-selected={activeTab === 'tab-sit'}
            tabIndex={activeTab === 'tab-sit' ? 0 : -1}
            onClick={() => selectTab('tab-sit')}
            onKeyDown={(e) => {
              if (e.key === 'ArrowRight') selectTab('tab-reg');
              if (e.key === 'ArrowLeft') selectTab('tab-ans');
            }}
          >
            Situação
          </button>
          <button
            className="tab"
            role="tab"
            id="tab-reg"
            aria-controls="p-reg"
            aria-selected={activeTab === 'tab-reg'}
            tabIndex={activeTab === 'tab-reg' ? 0 : -1}
            onClick={() => selectTab('tab-reg')}
            onKeyDown={(e) => {
              if (e.key === 'ArrowRight') selectTab('tab-ans');
              if (e.key === 'ArrowLeft') selectTab('tab-sit');
            }}
          >
            Meus registros
          </button>
        </div>

        {/* Área do Formulário */}
        <div className="form-area">
          <form id="form" noValidate onSubmit={handleSubmit}>
            {/* ================= ANSIEDADE ================= */}
            <section
              role="tabpanel"
              id="p-ans"
              aria-labelledby="tab-ans"
              hidden={activeTab !== 'tab-ans'}
            >
              <header className="hero">
                <h1>
                  Como você está <em>agora</em>?
                </h1>
                <p>Leva menos de 2 minutos. Escreva do seu jeito.</p>
              </header>

              <div className="q">
                <div className="when">
                  <span className="when-v">
                    Registrando para <b data-when-text>{whenLabel}</b>
                  </span>
                  <button
                    className="linkbtn"
                    type="button"
                    onClick={() => setEditWhenAns(!editWhenAns)}
                  >
                    {editWhenAns ? 'Ok' : 'Alterar'}
                  </button>
                </div>
                <div className={`when-edit ${editWhenAns ? 'on' : ''}`}>
                  <input
                    type="date"
                    name="data"
                    aria-label="Data"
                    value={formData.data}
                    onChange={(e) => updateFormData({ data: e.target.value })}
                  />
                  <input
                    type="time"
                    name="hora"
                    aria-label="Hora"
                    value={formData.hora}
                    onChange={(e) => updateFormData({ hora: e.target.value })}
                  />
                </div>
              </div>

              <div className="q">
                <label className="lbl" htmlFor="ans-sit">
                  Onde você estava e o que estava acontecendo?
                </label>
                <textarea
                  id="ans-sit"
                  name="ans_situacao"
                  data-required
                  aria-invalid={fieldErrors.ans_situacao ? 'true' : undefined}
                  placeholder="Ex.: no trabalho, antes de uma reunião"
                  value={formData.ans_situacao}
                  onInput={handleTextareaInput}
                  onChange={(e) => {
                    updateFormData({ ans_situacao: e.target.value });
                    if (e.target.value.trim() && fieldErrors.ans_situacao) {
                      setFieldErrors((p) => ({ ...p, ans_situacao: false }));
                    }
                  }}
                />
                <span className="err">Conte em poucas palavras onde você estava.</span>
              </div>

              <div className="q">
                <label className="lbl" htmlFor="ans-int">
                  Quanto de ansiedade você sentiu?
                </label>
                <div className="lvl">
                  <span
                    className="lvl-n"
                    id="lvl-n"
                    style={{ '--lk': cor(formData.ans_intensidade) } as any}
                  >
                    {formData.ans_intensidade}
                  </span>
                  <span
                    className="lvl-w"
                    id="lvl-w"
                    style={{ '--lk': cor(formData.ans_intensidade) } as any}
                  >
                    {palavra(formData.ans_intensidade)}
                  </span>
                </div>
                <input
                  type="range"
                  id="ans-int"
                  name="ans_intensidade"
                  min="0"
                  max="10"
                  step="1"
                  value={formData.ans_intensidade}
                  aria-valuetext={`${formData.ans_intensidade} de 10, ${palavra(formData.ans_intensidade)}`}
                  onChange={(e) => updateFormData({ ans_intensidade: Number(e.target.value) })}
                />
                <div className="scale">
                  <span>0 · nada</span>
                  <span>10 · máxima</span>
                </div>
                <div
                  className={`support ${formData.ans_intensidade >= 9 ? 'on' : ''}`}
                  id="support"
                  role="status"
                >
                  Você não precisa passar por isso sozinho(a). Se estiver em crise agora, ligue para o{' '}
                  <b>CVV 188</b> (24h, gratuito). Em emergência, <b>SAMU 192</b>.
                </div>
              </div>

              <fieldset className="q" style={{ border: 0, margin: 0, minWidth: 0 }}>
                <legend className="lbl" style={{ padding: 0, float: 'left', width: '100%' }}>
                  O que você sentiu no corpo? <span className="opt">· opcional</span>
                </legend>
                <div className="chips">
                  {SENSACOES_PADRAO.map((item) => {
                    const isChecked = formData.ans_sensacoes.includes(item);
                    return (
                      <label className="chip" key={item}>
                        <input
                          type="checkbox"
                          name="ans_sensacoes"
                          value={item}
                          checked={isChecked}
                          onChange={() => toggleSensacao(item)}
                        />
                        <span>{item}</span>
                      </label>
                    );
                  })}
                </div>
                <input
                  className="inp"
                  name="ans_sensacao_outra"
                  placeholder="Outra sensação"
                  aria-label="Outra sensação"
                  value={formData.ans_sensacao_outra}
                  onChange={(e) => updateFormData({ ans_sensacao_outra: e.target.value })}
                />
              </fieldset>

              <div className="q">
                <label className="lbl" htmlFor="ans-pen">
                  O que passou pela sua cabeça? <span className="opt">· opcional</span>
                </label>
                <textarea
                  id="ans-pen"
                  name="ans_pensamentos"
                  placeholder='Ex.: "vou travar e todo mundo vai perceber"'
                  value={formData.ans_pensamentos}
                  onInput={handleTextareaInput}
                  onChange={(e) => updateFormData({ ans_pensamentos: e.target.value })}
                />
              </div>

              <div className="q">
                <label className="lbl" htmlFor="ans-fez">
                  O que você fez? <span className="opt">· opcional</span>
                </label>
                <textarea
                  id="ans-fez"
                  name="ans_o_que_fez"
                  placeholder="Ex.: saí da sala, usei a respiração"
                  value={formData.ans_o_que_fez}
                  onInput={handleTextareaInput}
                  onChange={(e) => updateFormData({ ans_o_que_fez: e.target.value })}
                />
              </div>
            </section>

            {/* ================= SITUAÇÃO (A-R-C) ================= */}
            <section
              role="tabpanel"
              id="p-sit"
              aria-labelledby="tab-sit"
              hidden={activeTab !== 'tab-sit'}
            >
              <header className="hero">
                <h1>
                  O que <em>aconteceu</em>?
                </h1>
                <p>Descreva uma situação marcante, do começo ao fim, com suas palavras.</p>
              </header>

              <div className="q">
                <div className="when">
                  <span className="when-v">
                    Registrando para <b data-when-text>{whenLabel}</b>
                  </span>
                  <button
                    className="linkbtn"
                    type="button"
                    onClick={() => setEditWhenSit(!editWhenSit)}
                  >
                    {editWhenSit ? 'Ok' : 'Alterar'}
                  </button>
                </div>
                <div className={`when-edit ${editWhenSit ? 'on' : ''}`}>
                  <input
                    type="date"
                    name="data"
                    aria-label="Data"
                    value={formData.data}
                    onChange={(e) => updateFormData({ data: e.target.value })}
                  />
                  <input
                    type="time"
                    name="hora"
                    aria-label="Hora"
                    value={formData.hora}
                    onChange={(e) => updateFormData({ hora: e.target.value })}
                  />
                </div>
              </div>

              <div className="q a">
                <span className="step">Antes</span>
                <label className="lbl" htmlFor="sit-a">
                  O que estava acontecendo logo antes?
                </label>
                <span className="help">Onde você estava, com quem, o que foi dito ou feito.</span>
                <textarea
                  id="sit-a"
                  name="sit_antecedente"
                  data-required
                  aria-invalid={fieldErrors.sit_antecedente ? 'true' : undefined}
                  placeholder="Ex.: meu chefe pediu que eu apresentasse o relatório na frente de todos"
                  value={formData.sit_antecedente}
                  onInput={handleTextareaInput}
                  onChange={(e) => {
                    updateFormData({ sit_antecedente: e.target.value });
                    if (e.target.value.trim() && fieldErrors.sit_antecedente) {
                      setFieldErrors((p) => ({ ...p, sit_antecedente: false }));
                    }
                  }}
                />
                <span className="err">Conte o que aconteceu antes.</span>
              </div>

              <div className="q r">
                <span className="step">O que você fez</span>
                <label className="lbl" htmlFor="sit-r">
                  O que você fez, pensou e sentiu?
                </label>
                <span className="help">Atitudes, pensamentos e sensações no corpo.</span>
                <textarea
                  id="sit-r"
                  name="sit_resposta"
                  data-required
                  aria-invalid={fieldErrors.sit_resposta ? 'true' : undefined}
                  placeholder='Ex.: pensei "vou travar", o coração disparou e pedi para apresentar outro dia'
                  value={formData.sit_resposta}
                  onInput={handleTextareaInput}
                  onChange={(e) => {
                    updateFormData({ sit_resposta: e.target.value });
                    if (e.target.value.trim() && fieldErrors.sit_resposta) {
                      setFieldErrors((p) => ({ ...p, sit_resposta: false }));
                    }
                  }}
                />
                <span className="err">Conte o que você fez, pensou ou sentiu.</span>
              </div>

              <div className="q c">
                <span className="step">Logo depois</span>
                <label className="lbl" htmlFor="sit-c">
                  O que aconteceu em seguida? <span className="opt">· opcional</span>
                </label>
                <span className="help">Como as pessoas reagiram e como você ficou na hora.</span>
                <textarea
                  id="sit-c"
                  name="sit_consequencia"
                  placeholder="Ex.: um colega apresentou no meu lugar e senti alívio"
                  value={formData.sit_consequencia}
                  onInput={handleTextareaInput}
                  onChange={(e) => updateFormData({ sit_consequencia: e.target.value })}
                />
              </div>

              <div className="q e">
                <span className="step">E depois disso</span>
                <span className="lbl">
                  Como isso ficou com você? <span className="opt">· opcional</span>
                </span>
                <div className="pair">
                  <div>
                    <label htmlFor="sit-ec">Nas horas seguintes</label>
                    <textarea
                      id="sit-ec"
                      name="sit_efeito_curto"
                      placeholder="Ex.: fiquei mais tranquilo"
                      value={formData.sit_efeito_curto}
                      onInput={handleTextareaInput}
                      onChange={(e) => updateFormData({ sit_efeito_curto: e.target.value })}
                    />
                  </div>
                  <div>
                    <label htmlFor="sit-el">Pensando no futuro</label>
                    <textarea
                      id="sit-el"
                      name="sit_efeito_longo"
                      placeholder="Ex.: fiquei com medo da próxima reunião"
                      value={formData.sit_efeito_longo}
                      onInput={handleTextareaInput}
                      onChange={(e) => updateFormData({ sit_efeito_longo: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* ================= COMUM ================= */}
            <div className="q">
              <label className="share">
                <input
                  type="checkbox"
                  name="compartilhado"
                  checked={formData.compartilhado}
                  onChange={(e) => updateFormData({ compartilhado: e.target.checked })}
                />
                <span className="sw" aria-hidden="true" />
                <span>
                  <b>Compartilhar com meu psicólogo</b>
                  <small>
                    Ele poderá ver e conversar sobre isso na próxima sessão. Desligue para guardar só para você.
                  </small>
                </span>
              </label>
            </div>
          </form>
        </div>

        {/* ================= MEUS REGISTROS ================= */}
        <section
          role="tabpanel"
          id="p-reg"
          aria-labelledby="tab-reg"
          hidden={activeTab !== 'tab-reg'}
        >
          <header className="hero">
            <h1>
              Meus <em>registros</em>
            </h1>
            <p>Tudo o que você anotou entre as sessões.</p>
          </header>

          <section className="sum" aria-label="Resumo das últimas 2 semanas">
            <div className="sum-row">
              <div className="stat">
                <b id="s-total">{resumo.total}</b>
                <span>registros</span>
              </div>
              <div className="stat">
                <b id="s-media">{resumo.media}</b>
                <span>ansiedade média</span>
              </div>
              <div className="stat">
                <b id="s-sit">{resumo.sit}</b>
                <span>situações</span>
              </div>
            </div>

            <div className="chart">
              <div className="chart-hd">
                <span>Ansiedade nas últimas 2 semanas</span>
                <span>maior do dia</span>
              </div>
              <div className="bars" id="bars" role="img" aria-label="Gráfico de intensidade por dia">
                {resumo.barItems.map((bar, i) => {
                  const temValor = bar.max >= 0;
                  const altura = temValor ? `${Math.max(10, bar.max * 10)}%` : '4px';
                  const corBar = temValor ? cor(bar.max) : 'rgba(21, 20, 15, 0.08)';

                  return (
                    <i
                      key={i}
                      data-v={temValor ? bar.max : undefined}
                      style={{
                        height: altura,
                        backgroundColor: corBar
                      }}
                      title={`${bar.iso}: ${temValor ? `${bar.max}/10` : 'sem registro'}`}
                    />
                  );
                })}
              </div>
              <div className="days" id="days" aria-hidden="true">
                {resumo.barItems.map((bar, i) => (
                  <span key={i}>{bar.diaNum > 0 ? bar.diaNum : ''}</span>
                ))}
              </div>
              <div className="legend">
                <span style={{ '--k': 'var(--low)' } as any}>Leve</span>
                <span style={{ '--k': 'var(--mid)' } as any}>Moderada</span>
                <span style={{ '--k': 'var(--high)' } as any}>Forte</span>
              </div>
            </div>
          </section>

          <div className="seg" role="group" aria-label="Filtrar registros">
            <button
              type="button"
              data-f="todos"
              aria-pressed={filtro === 'todos'}
              onClick={() => setFiltro('todos')}
            >
              Todos
            </button>
            <button
              type="button"
              data-f="ansiedade"
              aria-pressed={filtro === 'ansiedade'}
              onClick={() => setFiltro('ansiedade')}
            >
              Ansiedade
            </button>
            <button
              type="button"
              data-f="situacao"
              aria-pressed={filtro === 'situacao'}
              onClick={() => setFiltro('situacao')}
            >
              Situações
            </button>
            <button
              type="button"
              data-f="privados"
              aria-pressed={filtro === 'privados'}
              onClick={() => setFiltro('privados')}
            >
              Só meus
            </button>
          </div>

          <div id="list">
            {Object.keys(grupos).map((d) => (
              <section className="day" key={d}>
                <h2>{rotuloDia(d, hoje)}</h2>
                {grupos[d].map((r) => {
                  const isOpen = !!openItems[r.id];
                  const sit = r.tipo === 'situacao';
                  const titulo = sit ? r.antecedente : r.situacao;

                  return (
                    <article className={`item ${isOpen ? 'open' : ''}`} key={r.id}>
                      <button
                        className="head"
                        type="button"
                        aria-expanded={isOpen}
                        onClick={() => alternarAberto(r.id)}
                      >
                        <span className="ico" aria-hidden="true">
                          {sit ? (
                            <svg viewBox="0 0 24 24">
                              <path d="M5 12h14M13 6l6 6-6 6" />
                            </svg>
                          ) : (
                            <svg viewBox="0 0 24 24">
                              <path d="M3 12h4l3-8 4 16 3-8h4" />
                            </svg>
                          )}
                        </span>
                        <span className="ttl">
                          <b>{titulo || '(Sem descrição)'}</b>
                          <span>
                            {sit ? 'Situação' : 'Ansiedade'} · {r.hora} ·{' '}
                            {r.compartilhado ? (
                              <span className="priv on">
                                <svg viewBox="0 0 24 24">
                                  <path d="m5 12 4.5 4.5L19 7" />
                                </svg>
                                Compartilhado
                              </span>
                            ) : (
                              <span className="priv">
                                <svg viewBox="0 0 24 24">
                                  <rect x="5" y="11" width="14" height="10" rx="2" />
                                  <path d="M8 11V8a4 4 0 0 1 8 0v3" />
                                </svg>
                                Só seu
                              </span>
                            )}
                          </span>
                        </span>
                        <span className="rt">
                          {sit ? (
                            <span className="arc" aria-label="Situação">
                              <i
                                style={{ '--k': 'var(--a)' } as any}
                                className={r.antecedente ? '' : 'off'}
                              />
                              <i
                                style={{ '--k': 'var(--r)' } as any}
                                className={r.resposta ? '' : 'off'}
                              />
                              <i
                                style={{ '--k': 'var(--c)' } as any}
                                className={r.consequencia ? '' : 'off'}
                              />
                              <i
                                style={{ '--k': 'var(--e)' } as any}
                                className={r.efeitos ? '' : 'off'}
                              />
                            </span>
                          ) : (
                            <span
                              className="rlvl"
                              style={{ '--k': cor(r.intensidade ?? 0) } as any}
                            >
                              <i />
                              {r.intensidade}
                            </span>
                          )}
                          <svg
                            className="chev"
                            viewBox="0 0 24 24"
                            aria-hidden="true"
                          >
                            <path d="m6 9 6 6 6-6" />
                          </svg>
                        </span>
                      </button>

                      <div className="det">
                        {sit ? (
                          <>
                            <div className="f" style={{ '--k': 'var(--a)' } as any}>
                              <small>Antes</small>
                              <p>{r.antecedente}</p>
                            </div>
                            <div className="f" style={{ '--k': 'var(--r)' } as any}>
                              <small>O que fiz</small>
                              <p>{r.resposta}</p>
                            </div>
                            {r.consequencia && (
                              <div className="f" style={{ '--k': 'var(--c)' } as any}>
                                <small>Logo depois</small>
                                <p>{r.consequencia}</p>
                              </div>
                            )}
                            {r.efeitos && (
                              <div className="f" style={{ '--k': 'var(--e)' } as any}>
                                <small>E depois disso</small>
                                <p>{r.efeitos}</p>
                              </div>
                            )}
                          </>
                        ) : (
                          <>
                            <div className="f">
                              <small>Onde estava</small>
                              <p>{r.situacao}</p>
                            </div>
                            <div
                              className="f"
                              style={{ '--k': cor(r.intensidade ?? 0) } as any}
                            >
                              <small>Intensidade</small>
                              <p>
                                {r.intensidade}/10 · {palavra(r.intensidade ?? 0)}
                              </p>
                            </div>
                            {r.sensacoes && r.sensacoes.length > 0 && (
                              <div className="f">
                                <small>No corpo</small>
                                <div className="tags">
                                  {r.sensacoes.map((s, idx) => (
                                    <span key={idx}>{s}</span>
                                  ))}
                                </div>
                              </div>
                            )}
                            {r.pensamentos && (
                              <div className="f">
                                <small>Pensamentos</small>
                                <p>{r.pensamentos}</p>
                              </div>
                            )}
                            {r.o_que_fez && (
                              <div className="f">
                                <small>O que fiz</small>
                                <p>{r.o_que_fez}</p>
                              </div>
                            )}
                          </>
                        )}

                        <div className="rshare">
                          <span>
                            <b>Compartilhar com Psic. {nomeProfissional}</b>
                          </span>
                          <button
                            className="rsw"
                            type="button"
                            role="switch"
                            aria-checked={r.compartilhado}
                            aria-label="Compartilhar com meu psicólogo"
                            onClick={() => alternarCompartilhamentoItem(r.id, !r.compartilhado)}
                          />
                        </div>
                      </div>
                    </article>
                  );
                })}
              </section>
            ))}
          </div>

          <div className={`empty ${totalFiltrados === 0 ? 'on' : ''}`} id="empty">
            <b>Nada por aqui ainda</b>
            <p>Quando você fizer um registro, ele aparece nesta lista.</p>
          </div>
        </section>

        {/* ================= SUCESSO ================= */}
        <section className="done" aria-live="polite">
          <div className="ok">
            <svg viewBox="0 0 24 24">
              <path d="m5 12 4.5 4.5L19 7" />
            </svg>
          </div>
          <h2 id="done-t">
            {doneData.tipo === 'situacao' ? 'Situação' : 'Registro'}{' '}
            <em>{doneData.tipo === 'situacao' ? 'registrada' : 'salvo'}</em>.
          </h2>
          <p id="done-p">
            {doneData.compartilhado
              ? 'Seu psicólogo vai poder ver este registro na próxima sessão. Obrigado por registrar.'
              : 'O registro ficou só com você. Obrigado por registrar.'}
          </p>
          <div className="acts">
            <button
              className="see"
              type="button"
              id="see"
              onClick={() => {
                resetForm();
                selectTab('tab-reg');
              }}
            >
              Ver meus registros
            </button>
            <button
              className="again"
              type="button"
              id="again"
              onClick={() => {
                resetForm();
                selectTab(lastFormTab);
              }}
            >
              Fazer outro registro
            </button>
          </div>
        </section>
      </main>

      {/* Rodapé fixo */}
      <div className="bar">
        <div className="bar-in">
          <p className={`fail ${hasFail ? 'on' : ''}`} id="fail" role="alert">
            Não foi possível salvar. Verifique a conexão e tente de novo.
          </p>
          <button
            className="save"
            type="submit"
            form="form"
            id="save"
            disabled={isSaving}
          >
            {isSaving
              ? 'Salvando…'
              : activeTab === 'tab-sit'
              ? 'Salvar situação'
              : 'Salvar registro'}
          </button>
          <button
            className="new"
            type="button"
            id="new"
            onClick={() => selectTab(lastFormTab)}
          >
            <svg viewBox="0 0 24 24">
              <path d="M12 5v14M5 12h14" />
            </svg>
            Novo registro
          </button>
          <p className="note">Seus registros são confidenciais.</p>
        </div>
      </div>

      {/* Toast */}
      <div
        className={`toast ${toastAtivo ? 'on' : ''}`}
        id="toast"
        role="status"
        aria-live="polite"
      >
        {toastMsg}
      </div>
    </div>
  );
}

export default function PacienteDiarioPage() {
  return (
    <Suspense
      fallback={
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#f7f1de',
            color: '#5a5448',
            fontFamily: 'system-ui, sans-serif'
          }}
        >
          Carregando diário do paciente…
        </div>
      }
    >
      <DiarioContent />
    </Suspense>
  );
}
