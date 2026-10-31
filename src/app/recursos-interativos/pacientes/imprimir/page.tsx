'use client';

import React, { Suspense, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  getAllUserInteractiveSessions,
  getUserPatients,
  getUserProfile,
  supabase,
  isSupabaseConfigured
} from '@/lib/supabase';
import { HISTORIAS, FAIXAS } from '@/data/historiasClinicas';
import './imprimir.css';

/* =========================================================================
   Tipos
   ========================================================================= */

interface FalaItem {
  autor: string;
  texto: string;
  marca?: 'ok' | 'no' | 'hard' | 'new' | '';
}

interface RodadaDrama {
  lado: string;
  crenca: number;
  neg: FalaItem[];
  rac: FalaItem[];
}

interface ItemSessao {
  id: string;
  tipo: 'sessao';
  data: string;
  n: number;
  mod: string;
  dur: number;
  humor: number;
  comp: string[];
  temas: string;
  tec: string[];
  vinc: string[];
  resp: string;
  comb: string;
  prox: string;
  triplices?: any[];
}

interface ItemDrama {
  id: string;
  tipo: 'drama';
  data: string;
  sessao?: number;
  dur: number;
  pens: string;
  crenca: [number, number];
  emocao: [string, number, number];
  ok: number;
  total: number;
  rodadas: RodadaDrama[];
  funcionou: string[];
  dificil: string[];
  pressupostos: string[];
  tarefa: string;
  privado?: string;
}

interface ItemHist {
  id: string;
  tipo: 'hist';
  data: string;
  sessao?: number;
  titulo: string;
  faixa: string;
  temas: string[];
  caso: string;
  etapas: [string, string, string][];
  intensidade: number;
  crenca: number;
}

type ItemImpressao = ItemSessao | ItemDrama | ItemHist;

interface DossieImpressaoData {
  profissional: { nome: string; crp: string };
  paciente: { codigo: string; aberto: string; queixa: string };
  itens: ItemImpressao[];
}

/* =========================================================================
   Dados Padrão de Demonstração (Referência Oficial P-014)
   ========================================================================= */

const DEMO_DOSSIE: DossieImpressaoData = {
  profissional: { nome: '', crp: '' },
  paciente: {
    codigo: 'P-014',
    aberto: '2026-09-30',
    queixa: 'Ansiedade de desempenho no trabalho'
  },
  itens: [
    {
      id: 's1',
      tipo: 'sessao',
      data: '2026-09-30',
      n: 1,
      mod: 'Presencial',
      dur: 55,
      humor: 3,
      comp: ['Ansioso(a)', 'Sobrecarregado(a)'],
      temas: 'Queixa de ansiedade intensa antes de apresentações e evitação de reuniões no trabalho.',
      tec: ['Psicoeducação'],
      vinc: [],
      resp: 'Identificou o ciclo ansiedade e evitação. Relatou alívio ao nomear o padrão.',
      comb: 'Registrar as situações de evitação durante a semana.',
      prox: ''
    },
    {
      id: 's2',
      tipo: 'sessao',
      data: '2026-10-07',
      n: 2,
      mod: 'Online',
      dur: 50,
      humor: 4,
      comp: ['Ansioso(a)', 'Receptivo(a)'],
      temas: 'Revisão dos registros da semana: evitou falar em três reuniões.',
      tec: ['História clínica', 'Registro de pensamentos'],
      vinc: ['h1'],
      resp: 'Percebeu previsões catastróficas que se repetem antes de cada reunião.',
      comb: 'Registrar os pensamentos automáticos antes das reuniões.',
      prox: ''
    },
    {
      id: 'h1',
      tipo: 'hist',
      data: '2026-10-07',
      sessao: 2,
      titulo: 'A apresentação adiada',
      faixa: 'Adulto',
      temas: ['Ansiedade de desempenho', 'Enfrentamento'],
      caso: 'Rafael precisava apresentar o projeto da equipe. Na véspera, disse ao gestor que estava doente e pediu para adiar. No dia seguinte, sentiu alívio e, logo depois, vergonha.',
      etapas: [
        ['Observar', 'O que Rafael ganhou e perdeu ao adiar?', 'Ganhou alívio na hora, mas perdeu a chance de mostrar o trabalho e ficou com vergonha.'],
        ['Compreender', 'Que pensamento pode ter levado ao adiamento?', 'Que ele ia travar e todo mundo ia perceber.'],
        ['Agir', 'O que ele poderia fazer na próxima vez?', 'Ensaiar com um colega e combinar um sinal se travar.']
      ],
      intensidade: 40,
      crenca: 70
    },
    {
      id: 's3',
      tipo: 'sessao',
      data: '2026-10-14',
      n: 3,
      mod: 'Presencial',
      dur: 50,
      humor: 5,
      comp: ['Reflexivo(a)', 'Receptivo(a)'],
      temas: 'Pensamento “se eu errar, sou incompetente” e sua origem nas cobranças do pai.',
      tec: ['Exame das evidências', 'Psicoeducação'],
      vinc: [],
      resp: 'Questionou a regra e trouxe exemplos que a contradizem, mas ainda acredita bastante nela.',
      comb: 'Registrar situações em que evitou falar em reuniões.',
      prox: 'Retomar o pensamento “se eu errar, sou incompetente”.'
    },
    {
      id: 's4',
      tipo: 'sessao',
      data: '2026-10-21',
      n: 4,
      mod: 'Presencial',
      dur: 50,
      humor: 6,
      comp: ['Ansioso(a)', 'Receptivo(a)'],
      temas: 'Ansiedade antes da apresentação de sexta. Revisou o registro da semana: evitou falar em duas reuniões.',
      tec: ['Dramatização dos dois lados'],
      vinc: ['d1'],
      resp: 'Engajou-se na troca de papéis. A crença no pensamento caiu de 85 para 40 ao fim da dramatização.',
      comb: 'Fazer a apresentação de sexta e registrar o que aconteceu.',
      prox: 'Revisar a apresentação e comparar com a previsão feita hoje.'
    },
    {
      id: 'd1',
      tipo: 'drama',
      data: '2026-10-21',
      sessao: 4,
      dur: 22,
      pens: 'Se eu errar na apresentação, todos vão me achar incompetente e vou ser demitido.',
      crenca: [85, 40],
      emocao: ['Ansiedade', 80, 45],
      ok: 4,
      total: 5,
      rodadas: [
        {
          lado: 'Terapeuta no lado racional',
          crenca: 70,
          neg: [
            { autor: 'Paciente', texto: 'Todo mundo vai perceber que eu travei. Não tem como disfarçar.', marca: 'hard' },
            { autor: 'Paciente', texto: 'Se eu errar uma vez, meu chefe vai lembrar disso para sempre.', marca: '' }
          ],
          rac: [
            { autor: 'Terapeuta', texto: 'Errar um slide é diferente de ser incompetente. Você conhece alguém que foi demitido por um erro numa apresentação?', marca: 'ok' },
            { autor: 'Terapeuta', texto: 'Você é uma pessoa dedicada.', marca: 'no' }
          ]
        },
        {
          lado: 'Paciente no lado racional',
          crenca: 55,
          neg: [
            { autor: 'Terapeuta', texto: 'Na última reunião ninguém comentou porque ficaram com pena de você.', marca: '' },
            { autor: 'Terapeuta', texto: 'E se eu ficar vermelho na frente da diretoria?', marca: 'new' }
          ],
          rac: [
            { autor: 'Paciente', texto: 'Na reunião passada eu esqueci um dado, corrigi no fim e ninguém falou nada.', marca: 'ok' },
            { autor: 'Paciente', texto: 'Ficar vermelho é desconfortável, mas não mostra que eu não sei o assunto.', marca: 'ok' }
          ]
        },
        {
          lado: 'Terapeuta no lado racional',
          crenca: 40,
          neg: [
            { autor: 'Paciente', texto: 'Mas desta vez é a diretoria.', marca: '' }
          ],
          rac: [
            { autor: 'Terapeuta', texto: 'Você já apresentou para a diretoria em março. O que aconteceu de fato?', marca: 'ok' }
          ]
        }
      ],
      funcionou: [
        'Errar um slide é diferente de ser incompetente.',
        'Na reunião passada eu esqueci um dado, corrigi no fim e ninguém falou nada.'
      ],
      dificil: [
        'Todo mundo vai perceber que eu travei.',
        'E se eu ficar vermelho na frente da diretoria?'
      ],
      pressupostos: [
        'Se eu errar, sou incompetente.',
        'Preciso ter desempenho perfeito para ser aceito no trabalho.'
      ],
      tarefa: 'Resumo + folha “Os dois lados, em casa” · trazer na próxima sessão',
      privado: 'Respondeu melhor a evidências do próprio histórico. Levar “todo mundo vai perceber” para o Exame das evidências.'
    }
  ]
};

/* =========================================================================
   Helpers de Formatação
   ========================================================================= */

const MESES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];

const TIPO_LABEL: Record<string, string> = {
  sessao: 'Evolução da sessão',
  drama: 'Dramatização dos dois lados',
  hist: 'História clínica'
};

const MARCAS_MAP: Record<string, [string, string]> = {
  ok: ['ok', 'Funcionou'],
  no: ['no', 'Não funcionou'],
  hard: ['hard', 'Difícil de rebater'],
  new: ['new', 'Novo']
};

function formatarDataExtensa(iso: string, incluirAno = false) {
  if (!iso) return '–';
  const parts = iso.split('-');
  if (parts.length < 3) return iso;
  const dia = parseInt(parts[2], 10);
  const mes = MESES[parseInt(parts[1], 10) - 1] || '';
  return `${dia} ${mes}${incluirAno ? ` ${parts[0]}` : ''}`;
}

function formatarDataNumerica(iso: string) {
  if (!iso) return '–';
  const parts = iso.split('-');
  if (parts.length < 3) return iso;
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

function textoCurto(txt: string, max: number) {
  if (!txt) return '';
  return txt.length > max ? txt.slice(0, max).replace(/\s+\S*$/, '') + '…' : txt;
}

/* =========================================================================
   Componente Principal de Impressão do Dossiê
   ========================================================================= */

function ImpressaoDossieInner() {
  const searchParams = useSearchParams();
  const pacienteParam = searchParams.get('paciente') || 'P-014';
  const itemAlvoId = searchParams.get('item');
  const autoImprimir = searchParams.get('imprimir') === '1';

  // Opções interativas da barra de ferramentas
  const [incSessao, setIncSessao] = useState(true);
  const [incDrama, setIncDrama] = useState(true);
  const [incHist, setIncHist] = useState(true);
  const [incPrivado, setIncPrivado] = useState(false);
  const [ordem, setOrdem] = useState<'asc' | 'desc'>('asc');

  // Estado dos dados do dossiê
  const [dossie, setDossie] = useState<DossieImpressaoData>(DEMO_DOSSIE);
  const [carregando, setCarregando] = useState(true);

  // Carregamento de dados (Supabase / LocalStorage / Fallback)
  useEffect(() => {
    let ativo = true;

    async function carregar() {
      setCarregando(true);
      try {
        const codigoAlvo = pacienteParam.trim();

        // 1. Informações do profissional
        let nomeProfissional = '';
        let crpProfissional = '';
        if (isSupabaseConfigured) {
          const { data: authData } = await supabase.auth.getUser();
          if (authData?.user) {
            const profile = await getUserProfile(authData.user.id);
            if (profile) {
              nomeProfissional = profile.name || '';
              crpProfissional = profile.crp || '';
            }
          }
        }

        // 2. Busca do paciente no banco
        const [todasSessoes, pacientesDb] = await Promise.all([
          getAllUserInteractiveSessions(),
          getUserPatients()
        ]);

        const pacienteDb = pacientesDb.find((p) => p.code.toLowerCase() === codigoAlvo.toLowerCase());
        const sessoesPaciente = todasSessoes.filter(
          (s) => (s.patient_code || '').toLowerCase() === codigoAlvo.toLowerCase()
        );

        if (!ativo) return;

        // Se for o código demo P-014 ou se não houver dados no banco, usa a referência rica
        if (codigoAlvo === 'P-014' || (!pacienteDb && sessoesPaciente.length === 0)) {
          setDossie({
            ...DEMO_DOSSIE,
            profissional: {
              nome: nomeProfissional || DEMO_DOSSIE.profissional.nome,
              crp: crpProfissional || DEMO_DOSSIE.profissional.crp
            },
            paciente: {
              codigo: codigoAlvo,
              aberto: pacienteDb?.created_at?.slice(0, 10) || DEMO_DOSSIE.paciente.aberto,
              queixa: pacienteDb?.note || DEMO_DOSSIE.paciente.queixa
            }
          });
          setCarregando(false);
          return;
        }

        // Busca tríplices contingências registradas no banco ou no cache local
        let todasTriplices: any[] = [];
        if (isSupabaseConfigured) {
          try {
            const { data: trData } = await supabase
              .from('triple_rows')
              .select('*')
              .is('deleted_at', null)
              .order('position', { ascending: true });
            if (trData) todasTriplices = trData;
          } catch {}
        }

        // Mapeamento dinâmico das sessões reais do paciente
        const itensMapeados: ItemImpressao[] = [];

        sessoesPaciente.forEach((s) => {
          const d = (s.data || {}) as Record<string, any>;
          const dataStr = (d.dataSessao || s.updated_at || s.created_at || new Date().toISOString()).slice(0, 10);

          if (s.resource_type === 'evolucao') {
            const numSessao = typeof d.numeroSessao === 'number' ? d.numeroSessao : itensMapeados.filter((x) => x.tipo === 'sessao').length + 1;

            // Filtra tríplices vinculadas a esta sessão
            let triplicesDaSessao = todasTriplices.filter(
              (tr) => tr.session_id === s.id || tr.session_id === s.resource_id || tr.session_id === `sessao_${numSessao}`
            );

            // Fallback para cache do localStorage
            if (triplicesDaSessao.length === 0 && typeof window !== 'undefined') {
              for (let i = 0; i < localStorage.length; i++) {
                const k = localStorage.key(i);
                if (
                  k &&
                  k.startsWith('na_triplice_cache_') &&
                  (k.includes(s.resource_id) || (s.id && k.includes(s.id)) || k.includes(`sessao_${numSessao}`))
                ) {
                  try {
                    const raw = localStorage.getItem(k);
                    if (raw) {
                      const parsed = JSON.parse(raw);
                      if (Array.isArray(parsed) && parsed.length > 0) {
                        triplicesDaSessao = parsed;
                        break;
                      }
                    }
                  } catch {}
                }
              }
            }

            itensMapeados.push({
              id: s.id || `sessao_${s.resource_id}`,
              tipo: 'sessao',
              data: dataStr,
              n: numSessao,
              mod: d.modalidade?.toLowerCase() === 'online' ? 'Online' : 'Presencial',
              dur: typeof d.duracao === 'number' ? d.duracao : 50,
              humor: typeof d.humor === 'number' ? d.humor : 5,
              comp: Array.isArray(d.comportamento) ? d.comportamento : (d.estadoEmocional ? [d.estadoEmocional] : ['Receptivo(a)']),
              temas: d.temas || d.temasAbordados || 'Atendimento clínico estruturado',
              tec: Array.isArray(d.tecnicas) ? d.tecnicas : (d.intervencoes ? [d.intervencoes] : ['Psicoeducação']),
              vinc: Array.isArray(d.recursosVinculados) ? [...d.recursosVinculados] : [],
              resp: d.resposta || d.evolucaoClinica || 'Sessão produtiva, boa aliança terapêutica.',
              comb: d.combinados || d.tarefasCombinados || 'Manter registros da semana.',
              prox: d.proxima || d.planoProximaSessao || '',
              triplices: triplicesDaSessao
            });
          } else if (s.resource_type === 'dramatizacao') {
            const rodadasFormatadas: RodadaDrama[] = Array.isArray(d.rodadas) && d.rodadas.length
              ? d.rodadas.map((r: any) => ({
                  lado: r.lado || 'Debate dos dois lados',
                  crenca: typeof r.crenca === 'number' ? r.crenca : 50,
                  neg: Array.isArray(r.neg) ? r.neg.map((f: any) => ({ autor: f[0] || 'Lado Negativo', texto: f[1] || '', marca: f[2] || '' })) : [],
                  rac: Array.isArray(r.rac) ? r.rac.map((f: any) => ({ autor: f[0] || 'Lado Racional', texto: f[1] || '', marca: f[2] || '' })) : []
                }))
              : (DEMO_DOSSIE.itens.find((x) => x.tipo === 'drama') as ItemDrama)?.rodadas || [];

            itensMapeados.push({
              id: s.id || `drama_${s.resource_id}`,
              tipo: 'drama',
              data: dataStr,
              sessao: d.sessao || 4,
              dur: typeof d.duracao === 'number' ? d.duracao : 20,
              pens: d.pensamento || 'Pensamento disfuncional identificado',
              crenca: [d.crencaIni ?? 85, d.crencaFim ?? 40],
              emocao: [d.emocao || 'Ansiedade', d.emocaoIni ?? 80, d.emocaoFim ?? 45],
              ok: d.respostasOk ?? 4,
              total: d.respostasTotal ?? 5,
              rodadas: rodadasFormatadas,
              funcionou: Array.isArray(d.argumentosFuncionou) ? d.argumentosFuncionou : ['Focar nas evidências reais.'],
              dificil: Array.isArray(d.argumentosDificil) ? d.argumentosDificil : ['Medo do julgamento de terceiros.'],
              pressupostos: Array.isArray(d.pressupostos) ? d.pressupostos : ['Preciso ter controle de tudo.'],
              tarefa: d.tarefa || 'Registro de situações em casa',
              privado: d.obs || d.privado || ''
            });
          } else if (s.resource_type === 'historia' || s.resource_type === 'hist') {
            const [faixaId, numStr] = (s.resource_id || '').split('_');
            const num = parseInt(numStr, 10);
            const story = (HISTORIAS[faixaId] || []).find((h) => h.num === num);
            const faixaInfo = FAIXAS.find((f) => f.id === faixaId);

            itensMapeados.push({
              id: s.id || `hist_${s.resource_id}`,
              tipo: 'hist',
              data: dataStr,
              sessao: d.sessao || 2,
              titulo: story?.titulo || d.titulo || 'História clínica estruturada',
              faixa: faixaInfo?.sublabel || d.faixa || 'Adulto',
              temas: Array.isArray(d.temas) && d.temas.length ? d.temas : [story?.theme || 'Enfrentamento'],
              caso: story?.historia || d.caso || 'Descrição do caso clínico e desafio emocional.',
              etapas: [
                ['Observar', story?.observar?.pergunta || 'O que ocorreu?', d.observarNotas || '(Sem anotações)'],
                ['Compreender', story?.pensamento?.pergunta || 'Qual era o pensamento?', d.pensarNotas || '(Sem anotações)'],
                ['Agir', story?.parar?.pergunta || 'Qual foi a resposta adaptativa?', d.agirNotas || '(Sem anotações)']
              ],
              intensidade: d.intensidade ?? 40,
              crenca: d.crenca ?? 70
            });
          }
        });

        setDossie({
          profissional: {
            nome: nomeProfissional,
            crp: crpProfissional
          },
          paciente: {
            codigo: codigoAlvo,
            aberto: pacienteDb?.created_at?.slice(0, 10) || new Date().toISOString().slice(0, 10),
            queixa: pacienteDb?.note || 'Acompanhamento clínico'
          },
          itens: itensMapeados.length ? itensMapeados : DEMO_DOSSIE.itens
        });
      } catch (err) {
        console.error('Erro ao carregar dados do dossiê:', err);
      } finally {
        if (ativo) setCarregando(false);
      }
    }

    carregar();
    return () => {
      ativo = false;
    };
  }, [pacienteParam]);

  // Se autoImprimir estiver ativo, dispara o diálogo de impressão do navegador
  useEffect(() => {
    if (!carregando && autoImprimir) {
      const timer = setTimeout(() => {
        window.print();
      }, 350);
      return () => clearTimeout(timer);
    }
  }, [carregando, autoImprimir]);

  // Filtros e ordenação
  const itensOrdenados = useMemo(() => {
    const tiposPermitidos: Record<string, boolean> = {
      sessao: incSessao,
      drama: incDrama,
      hist: incHist
    };

    let lista = dossie.itens.filter((x) => tiposPermitidos[x.tipo]);

    // Se houver um item específico filtrado por query param
    if (itemAlvoId) {
      const filtrado = lista.filter((x) => x.id === itemAlvoId);
      if (filtrado.length > 0) lista = filtrado;
    }

    const pesoTipo: Record<string, number> = { hist: 1, sessao: 0, drama: 2 };

    lista = lista.slice().sort((a, b) => {
      if (a.data < b.data) return -1;
      if (a.data > b.data) return 1;
      return (pesoTipo[a.tipo] || 0) - (pesoTipo[b.tipo] || 0);
    });

    return ordem === 'desc' ? lista.reverse() : lista;
  }, [dossie.itens, incSessao, incDrama, incHist, ordem, itemAlvoId]);

  // Sessões em ordem cronológica para métricas e gráfico
  const sessoesCronologicas = useMemo(() => {
    return (dossie.itens.filter((x) => x.tipo === 'sessao') as ItemSessao[]).sort((a, b) => a.n - b.n);
  }, [dossie.itens]);

  const dramas = useMemo(() => {
    return dossie.itens.filter((x) => x.tipo === 'drama') as ItemDrama[];
  }, [dossie.itens]);

  // Métricas do Resumo
  const resumoMetricas = useMemo(() => {
    const s = sessoesCronologicas;
    const mediaHumor = s.length
      ? (s.reduce((acc, o) => acc + o.humor, 0) / s.length).toFixed(1).replace('.', ',')
      : '–';
    const deltaHumor = s.length > 1 ? s[s.length - 1].humor - s[0].humor : 0;

    // Contagem de técnicas
    const contagem: Record<string, number> = {};
    dossie.itens.forEach((x) => {
      if (x.tipo === 'sessao' && x.tec) {
        x.tec.forEach((t) => {
          contagem[t] = (contagem[t] || 0) + 1;
        });
      }
    });

    const rankingTecnicas = Object.entries(contagem)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    const maxOcorrencias = rankingTecnicas.length ? rankingTecnicas[0][1] : 1;
    const ultimaSessao = s[s.length - 1];

    return {
      mediaHumor,
      deltaHumor,
      rankingTecnicas,
      maxOcorrencias,
      ultimaSessao
    };
  }, [sessoesCronologicas, dossie.itens]);

  // Contagem por tipo
  const contagens = useMemo(() => {
    const c = { sessao: 0, drama: 0, hist: 0 };
    dossie.itens.forEach((x) => {
      if (c[x.tipo] !== undefined) c[x.tipo]++;
    });
    return c;
  }, [dossie.itens]);

  // Intervalo de datas
  const intervaloDatas = useMemo(() => {
    const datas = dossie.itens.map((x) => x.data).sort();
    if (!datas.length) return '–';
    return `${formatarDataExtensa(datas[0])} a ${formatarDataExtensa(datas[datas.length - 1], true)}`;
  }, [dossie.itens]);

  const tituloItem = (x: ItemImpressao) => {
    if (x.tipo === 'sessao') return `Sessão ${x.n}`;
    if (x.tipo === 'drama') return `“${textoCurto(x.pens, 46)}”`;
    return x.titulo;
  };

  const getVinculado = (id: string) => {
    return dossie.itens.find((x) => x.id === id);
  };

  return (
    <div className="print-root">
      {/* ---------- Barra de opções (só na tela) ---------- */}
      <div className="print-tools" role="region" aria-label="Opções de impressão">
        <div className="print-tools-in">
          <Link
            href={`/recursos-interativos/pacientes?paciente=${encodeURIComponent(dossie.paciente.codigo)}`}
            className="btn-back"
            title="Voltar ao Dossiê Clínico"
          >
            ← Voltar ao dossiê
          </Link>

          <b>Imprimir dossiê · {dossie.paciente.codigo}</b>

          <label>
            <input
              type="checkbox"
              checked={incSessao}
              onChange={(e) => setIncSessao(e.target.checked)}
            />
            Sessões
          </label>

          <label>
            <input
              type="checkbox"
              checked={incDrama}
              onChange={(e) => setIncDrama(e.target.checked)}
            />
            Dramatizações
          </label>

          <label>
            <input
              type="checkbox"
              checked={incHist}
              onChange={(e) => setIncHist(e.target.checked)}
            />
            Histórias clínicas
          </label>

          <label>
            <input
              type="checkbox"
              checked={incPrivado}
              onChange={(e) => setIncPrivado(e.target.checked)}
            />
            Observações privadas
          </label>

          <label>
            Ordem
            <select
              value={ordem}
              onChange={(e) => setOrdem(e.target.value as 'asc' | 'desc')}
            >
              <option value="asc">Mais antigo primeiro</option>
              <option value="desc">Mais recente primeiro</option>
            </select>
          </label>

          <button
            type="button"
            className="btn-print"
            onClick={() => window.print()}
          >
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M6 9V3h12v6M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
              <rect x="6" y="14" width="12" height="7" />
            </svg>
            Imprimir ou salvar PDF
          </button>
        </div>
      </div>

      {/* ---------- Folha de Impressão A4 ---------- */}
      <main className="print-sheet" id="sheet">
        {/* Cabeçalho */}
        <header className="doc-head">
          <div>
            <div className="brand">
              <i aria-hidden="true"></i>
              NeuroAcervo
            </div>
            <h1 className="doc-title">
              Dossiê clínico <span>· {dossie.paciente.codigo}</span>
            </h1>
          </div>

          <div className="conf">
            <strong>Documento sigiloso</strong>
            <br />
            Emitido em {new Date().toLocaleDateString('pt-BR')} às{' '}
            {new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
          </div>
        </header>

        {/* Identificação */}
        <section className="ident" aria-label="Identificação">
          <div>
            <span className="lab">Paciente</span>
            <span className="val mono">{dossie.paciente.codigo}</span>
          </div>

          <div>
            <span className="lab">Caso aberto em</span>
            <span className="val">{formatarDataNumerica(dossie.paciente.aberto)}</span>
          </div>

          <div className="wide">
            <span className="lab">Queixa ou foco do acompanhamento</span>
            <span className="val">{dossie.paciente.queixa || '–'}</span>
          </div>

          <div>
            <span className="lab">Período dos registros</span>
            <span className="val">{intervaloDatas}</span>
          </div>

          <div>
            <span className="lab">Registros</span>
            <span className="val">
              {contagens.sessao} sessões · {contagens.drama} dramat. · {contagens.hist} hist.
            </span>
          </div>

          <div>
            <span className="lab">Profissional</span>
            {dossie.profissional.nome ? (
              <span className="val">{dossie.profissional.nome}</span>
            ) : (
              <span className="blank"></span>
            )}
          </div>

          <div>
            <span className="lab">CRP</span>
            {dossie.profissional.crp ? (
              <span className="val mono">{dossie.profissional.crp}</span>
            ) : (
              <span className="blank"></span>
            )}
          </div>
        </section>

        {/* 01. Resumo do acompanhamento */}
        <h2 className="sec">
          <span className="n">01</span>Resumo do acompanhamento
        </h2>

        {sessoesCronologicas.length > 0 ? (
          <>
            <div className="sum">
              {/* Box 1: Humor e KPIs */}
              <div className="box">
                <h3>Humor observado ao longo das sessões (0 a 10)</h3>

                {/* Gráfico SVG de Humor */}
                {(() => {
                  const s = sessoesCronologicas;
                  const W = 320;
                  const H = 96;
                  const L = 22;
                  const R = 10;
                  const T = 14;
                  const B = 20;
                  const n = s.length;

                  const x = (i: number) => (n === 1 ? (L + W - R) / 2 : L + (i * (W - L - R)) / (n - 1));
                  const y = (v: number) => T + ((10 - v) * (H - T - B)) / 10;
                  const pts = s.map((o, i) => `${x(i)},${y(o.humor)}`).join(' ');

                  return (
                    <svg
                      className="mini"
                      viewBox={`0 0 ${W} ${H}`}
                      role="img"
                      aria-label="Humor por sessão"
                    >
                      {[0, 5, 10].map((v) => (
                        <React.Fragment key={v}>
                          <line
                            x1={L}
                            x2={W - R}
                            y1={y(v)}
                            y2={y(v)}
                            stroke="#ddd5c4"
                            strokeWidth="1"
                          />
                          <text
                            x={L - 6}
                            y={y(v) + 3}
                            fontSize="8"
                            textAnchor="end"
                            fill="#6a6555"
                          >
                            {v}
                          </text>
                        </React.Fragment>
                      ))}

                      <polyline
                        points={pts}
                        fill="none"
                        stroke="#2b5c35"
                        strokeWidth="2"
                      />

                      {s.map((o, i) => (
                        <React.Fragment key={o.id}>
                          <circle
                            cx={x(i)}
                            cy={y(o.humor)}
                            r={3.2}
                            fill={i === n - 1 ? '#2b5c35' : '#fff'}
                            stroke="#2b5c35"
                            strokeWidth="1.6"
                          />
                          <text
                            x={x(i)}
                            y={y(o.humor) - 7}
                            fontSize="8.5"
                            fontWeight="600"
                            textAnchor="middle"
                            fill="#1f2620"
                          >
                            {o.humor}
                          </text>
                          <text
                            x={x(i)}
                            y={H - 5}
                            fontSize="8"
                            textAnchor="middle"
                            fill="#6a6555"
                          >
                            nº {o.n}
                          </text>
                        </React.Fragment>
                      ))}
                    </svg>
                  );
                })()}

                <div className="kpis">
                  <div className="kpi">
                    <b>{sessoesCronologicas.length}</b>
                    <span>Sessões</span>
                  </div>
                  <div className="kpi">
                    <b>{resumoMetricas.mediaHumor}</b>
                    <span>Humor médio</span>
                  </div>
                  <div className="kpi">
                    <b>{resumoMetricas.deltaHumor > 0 ? `+${resumoMetricas.deltaHumor}` : resumoMetricas.deltaHumor}</b>
                    <span>Desde a 1ª sessão</span>
                  </div>
                </div>
              </div>

              {/* Box 2: Intervenções e Crença */}
              <div className="box">
                <h3>Intervenções mais usadas</h3>
                <ul className="bars">
                  {resumoMetricas.rankingTecnicas.map(([tecNome, count]) => (
                    <li key={tecNome}>
                      <span>{tecNome}</span>
                      <em>{count}×</em>
                      <i>
                        <b style={{ width: `${(count / resumoMetricas.maxOcorrencias) * 100}%` }}></b>
                      </i>
                    </li>
                  ))}
                </ul>

                {dramas.length > 0 && (
                  <>
                    <h3 style={{ marginTop: '10px' }}>Crença nas dramatizações</h3>
                    {dramas.map((d) => (
                      <div className="belief" key={d.id}>
                        <span>{d.pens}</span>
                        <b>
                          {d.crenca[0]} → {d.crenca[1]}
                        </b>
                      </div>
                    ))}
                  </>
                )}
              </div>
            </div>

            {resumoMetricas.ultimaSessao && (
              <div className="next">
                <div>
                  <span className="lab">Combinado na sessão {resumoMetricas.ultimaSessao.n}</span>
                  <p>{resumoMetricas.ultimaSessao.comb || '–'}</p>
                </div>
                <div>
                  <span className="lab">Para a próxima sessão</span>
                  <p>{resumoMetricas.ultimaSessao.prox || '–'}</p>
                </div>
              </div>
            )}
          </>
        ) : (
          <p className="empty">Nenhuma sessão registrada ainda.</p>
        )}

        {/* 02. Índice dos registros */}
        <h2 className="sec">
          <span className="n">02</span>Índice dos registros
          <span className="r">
            {itensOrdenados.length} registros · {ordem === 'asc' ? 'mais antigo primeiro' : 'mais recente primeiro'}
          </span>
        </h2>

        {itensOrdenados.length > 0 ? (
          <ol className="toc">
            {itensOrdenados.map((x, i) => (
              <li key={x.id}>
                <span className="d">{formatarDataNumerica(x.data).slice(0, 5)}</span>
                <span>
                  {i + 1}. {TIPO_LABEL[x.tipo]} · {tituloItem(x)}
                </span>
              </li>
            ))}
          </ol>
        ) : (
          <p className="empty">Nenhum tipo de registro selecionado.</p>
        )}

        {/* 03. Registros em ordem cronológica */}
        <h2 className="sec">
          <span className="n">03</span>Registros em ordem{' '}
          {ordem === 'asc' ? 'cronológica' : 'do mais recente ao mais antigo'}
        </h2>

        {itensOrdenados.map((x, i) => {
          const metaStr =
            formatarDataExtensa(x.data, true) +
            (x.tipo === 'sessao' ? '' : ` · na sessão ${x.sessao}`) +
            (x.tipo === 'drama' ? ` · ${x.rodadas.length} rodadas · ${x.dur} min` : '');

          return (
            <article
              key={x.id}
              className={`rec ${x.tipo === 'drama' ? '' : 'keep'}`}
            >
              <header className="rec-h">
                <span className={`tag ${x.tipo}`}>
                  {i + 1} · {TIPO_LABEL[x.tipo]}
                </span>
                <h3>{x.tipo === 'drama' ? `Dramatização · sessão ${x.sessao}` : tituloItem(x)}</h3>
                <span className="meta">{metaStr}</span>
              </header>

              {/* Registro: Sessão de Evolução */}
              {x.tipo === 'sessao' && (
                <div className="rec-b">
                  <div className="row">
                    <span className="lab">Atendimento</span>
                    <div>{x.mod} · {x.dur} min</div>
                  </div>

                  <div className="row">
                    <span className="lab">Humor observado</span>
                    <div>
                      <b className="val mono" style={{ display: 'inline' }}>
                        {x.humor} / 10
                      </b>
                    </div>
                  </div>

                  {x.comp && x.comp.length > 0 && (
                    <div className="row">
                      <span className="lab">Comportamento</span>
                      <div>
                        <div className="chips">
                          {x.comp.map((c, ci) => (
                            <span className="chip" key={ci}>{c}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {x.temas && (
                    <div className="row">
                      <span className="lab">Temas trabalhados</span>
                      <div><p>{x.temas}</p></div>
                    </div>
                  )}

                  {x.tec && x.tec.length > 0 && (
                    <div className="row">
                      <span className="lab">Intervenções</span>
                      <div>
                        <div className="chips">
                          {x.tec.map((t, ti) => (
                            <span className="chip on" key={ti}>{t}</span>
                          ))}
                        </div>
                        {x.vinc && x.vinc.length > 0 && (
                          <div style={{ marginTop: '4px' }}>
                            {x.vinc.map(getVinculado).filter(Boolean).map((v: any, vi: number) => (
                              <div className="ref" key={vi}>
                                → {TIPO_LABEL[v.tipo]}
                                {v.tipo === 'drama'
                                  ? ` · crença ${v.crenca[0]} → ${v.crenca[1]}`
                                  : ` · “${v.titulo}”`}{' '}
                                (registro detalhado neste documento)
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {x.resp && (
                    <div className="row">
                      <span className="lab">Resposta do paciente</span>
                      <div><p>{x.resp}</p></div>
                    </div>
                  )}

                  {x.comb && (
                    <div className="row">
                      <span className="lab">Combinados</span>
                      <div>
                        <div className="check">
                          <i aria-hidden="true"></i>
                          <p>{x.comb}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {x.prox && (
                    <div className="row">
                      <span className="lab">Próxima sessão</span>
                      <div><p>{x.prox}</p></div>
                    </div>
                  )}

                  {x.triplices && x.triplices.length > 0 && (
                    <div className="row full" style={{ marginTop: '14px' }}>
                      <span className="lab">Grade da Tríplice Contingência (AC)</span>
                      <table className="rounds" style={{ width: '100%', marginTop: '6px', fontSize: '11px' }}>
                        <thead>
                          <tr>
                            <th style={{ width: '28%', textAlign: 'left' }}>Antecedente (A)</th>
                            <th style={{ width: '38%', textAlign: 'left' }}>Resposta (R: Ação, Pensamento, Sensação)</th>
                            <th style={{ width: '20%', textAlign: 'left' }}>Consequência (C)</th>
                            <th style={{ width: '14%', textAlign: 'left' }}>Efeitos</th>
                          </tr>
                        </thead>
                        <tbody>
                          {x.triplices.map((tr: any, triIdx: number) => (
                            <tr key={triIdx}>
                              <td style={{ verticalAlign: 'top', padding: '6px' }}>
                                {tr.antecedent || '—'}
                              </td>
                              <td style={{ verticalAlign: 'top', padding: '6px' }}>
                                {tr.response_action && <div style={{ marginBottom: '2px' }}><b>Fez:</b> {tr.response_action}</div>}
                                {tr.response_thought && <div style={{ marginBottom: '2px' }}><b>Pensou:</b> “{tr.response_thought}”</div>}
                                {tr.response_body && <div><b>Sentiu no corpo:</b> {tr.response_body}</div>}
                              </td>
                              <td style={{ verticalAlign: 'top', padding: '6px' }}>
                                {tr.consequence || '—'}
                              </td>
                              <td style={{ verticalAlign: 'top', padding: '6px' }}>
                                {tr.effect_short && <div><b>Curto:</b> {tr.effect_short}</div>}
                                {tr.effect_long && <div><b>Longo:</b> {tr.effect_long}</div>}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {incPrivado && x.triplices[0]?.note && (
                        <div style={{ marginTop: '8px', fontSize: '11px', color: '#92400e', background: '#fffbeb', padding: '6px 8px', borderRadius: '4px', border: '1px dashed #f59e0b' }}>
                          <b>🔒 Observação Privada do Profissional:</b> {x.triplices[0].note}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Registro: Dramatização Cognitiva */}
              {x.tipo === 'drama' && (
                <div className="rec-b">
                  <div className="row">
                    <span className="lab">Pensamento</span>
                    <div><p className="thought">“{x.pens}”</p></div>
                  </div>

                  <div className="row">
                    <span className="lab">Antes e depois</span>
                    <div>
                      <div className="ab">
                        <div>
                          <small>Crença no pensamento</small>
                          <b>{x.crenca[0]} → {x.crenca[1]}</b>
                        </div>
                        <div>
                          <small>{x.emocao[0]}</small>
                          <b>{x.emocao[1]} → {x.emocao[2]}</b>
                        </div>
                        <div>
                          <small>Respostas que funcionaram</small>
                          <b>{x.ok} / {x.total}</b>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="row full">
                    <span className="lab">O debate, rodada a rodada</span>
                    <table className="rounds">
                      <thead>
                        <tr>
                          <th>Rodada</th>
                          <th>Lado negativo</th>
                          <th>Lado racional</th>
                          <th style={{ textAlign: 'right' }}>Crença</th>
                        </tr>
                      </thead>
                      <tbody>
                        {x.rodadas.map((r, ri) => (
                          <tr key={ri}>
                            <td className="rn">
                              R{ri + 1}
                              <span className="who">{r.lado}</span>
                            </td>
                            <td>
                              {r.neg.map((f, fi) => {
                                const m = f.marca ? MARCAS_MAP[f.marca] : null;
                                return (
                                  <p key={fi}>
                                    {f.texto}
                                    {m && <span className={`mk ${m[0]}`}>{m[1]}</span>}
                                    <span className="who">{f.autor}</span>
                                  </p>
                                );
                              })}
                            </td>
                            <td>
                              {r.rac.map((f, fi) => {
                                const m = f.marca ? MARCAS_MAP[f.marca] : null;
                                return (
                                  <p key={fi}>
                                    {f.texto}
                                    {m && <span className={`mk ${m[0]}`}>{m[1]}</span>}
                                    <span className="who">{f.autor}</span>
                                  </p>
                                );
                              })}
                            </td>
                            <td className="rn" style={{ textAlign: 'right' }}>
                              {r.crenca}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {x.funcionou && x.funcionou.length > 0 && (
                    <div className="row">
                      <span className="lab">Funcionaram</span>
                      <div>
                        <p>{x.funcionou.join('\n')}</p>
                      </div>
                    </div>
                  )}

                  {x.dificil && x.dificil.length > 0 && (
                    <div className="row">
                      <span className="lab">Para continuar</span>
                      <div>
                        <p>{x.dificil.join('\n')}</p>
                      </div>
                    </div>
                  )}

                  {x.pressupostos && x.pressupostos.length > 0 && (
                    <div className="row">
                      <span className="lab">Pressupostos</span>
                      <div>
                        <p>{x.pressupostos.join('\n')}</p>
                      </div>
                    </div>
                  )}

                  {x.tarefa && (
                    <div className="row">
                      <span className="lab">Tarefa de casa</span>
                      <div><p>{x.tarefa}</p></div>
                    </div>
                  )}

                  {incPrivado && x.privado && (
                    <div className="row">
                      <span className="lab">Observações privadas</span>
                      <div><p className="private">{x.privado}</p></div>
                    </div>
                  )}
                </div>
              )}

              {/* Registro: História Clínica */}
              {x.tipo === 'hist' && (
                <div className="rec-b">
                  <div className="row">
                    <span className="lab">Faixa e temas</span>
                    <div>
                      <div className="chips">
                        <span className="chip on">{x.faixa}</span>
                        {x.temas.map((t, ti) => (
                          <span className="chip" key={ti}>{t}</span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="row">
                    <span className="lab">O caso</span>
                    <div>
                      <p className="case">“{x.caso}”</p>
                    </div>
                  </div>

                  <div className="row">
                    <span className="lab">Respostas</span>
                    <div>
                      <ol className="steps">
                        {x.etapas.map((e, ei) => (
                          <li key={ei}>
                            <div>
                              <span className="q">{e[0]} · {e[1]}</span>
                              <p>{e[2]}</p>
                            </div>
                          </li>
                        ))}
                      </ol>
                    </div>
                  </div>

                  <div className="row">
                    <span className="lab">Indicadores</span>
                    <div>
                      <div className="ab" style={{ gridTemplateColumns: '1fr 1fr' }}>
                        <div>
                          <small>Intensidade da emoção</small>
                          <b>{x.intensidade} / 100</b>
                        </div>
                        <div>
                          <small>Crença no pensamento</small>
                          <b>{x.crenca} / 100</b>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </article>
          );
        })}

        {/* 04. Observações do profissional e Assinatura */}
        <section className="sign">
          <h2 className="sec">
            <span className="n">04</span>Observações do profissional
          </h2>

          <div className="lines" aria-hidden="true">
            <span></span>
            <span></span>
            <span></span>
          </div>

          <div className="sign-grid">
            <div>Assinatura do(a) profissional</div>
            <div>
              Nome{dossie.profissional.nome ? `: ${dossie.profissional.nome}` : ''}
            </div>
            <div>
              CRP{dossie.profissional.crp ? `: ${dossie.profissional.crp}` : ''}
            </div>
          </div>

          <p className="legal">
            Documento sigiloso, de uso restrito do(a) profissional responsável pelo atendimento. Paciente identificado(a) por código para preservar o sigilo. Gerado pelo NeuroAcervo a partir dos registros do Dossiê clínico.
          </p>
        </section>
      </main>
    </div>
  );
}

export default function ImpressaoDossiePage() {
  return (
    <Suspense fallback={<div style={{ padding: '40px', textAlign: 'center' }}>Carregando folha de impressão...</div>}>
      <ImpressaoDossieInner />
    </Suspense>
  );
}
