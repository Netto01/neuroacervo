import { MaterialItem, CourseModule, CognitiveDomain, MaterialType, AgeGroup } from '@/types/neuro';

export const DOMAIN_LABELS: Record<CognitiveDomain, { label: string; color: string; bg: string }> = {
  atencao: { label: 'Atenção', color: 'text-amber-500 dark:text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
  memoria: { label: 'Memória', color: 'text-blue-500 dark:text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
  funcoes_executivas: { label: 'Funções Executivas', color: 'text-emerald-500 dark:text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
  linguagem: { label: 'Linguagem', color: 'text-purple-500 dark:text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20' },
  visuoespacial: { label: 'Habilidades Visuoespaciais', color: 'text-teal-500 dark:text-teal-400', bg: 'bg-teal-500/10 border-teal-500/20' },
  humor_comportamento: { label: 'Humor & Comportamento', color: 'text-rose-500 dark:text-rose-400', bg: 'bg-rose-500/10 border-rose-500/20' },
  rastreio_global: { label: 'Rastreio Global', color: 'text-indigo-500 dark:text-indigo-400', bg: 'bg-indigo-500/10 border-indigo-500/20' },
  inteligencia: { label: 'Eficiência Intelectual', color: 'text-violet-500 dark:text-violet-400', bg: 'bg-violet-500/10 border-violet-500/20' }
};

export const TYPE_LABELS: Record<MaterialType, { label: string; badge: string }> = {
  instrumento_rastreio: { label: 'Instrumento de Rastreio', badge: 'bg-teal-50 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300 border-teal-200 dark:border-teal-800' },
  guia_rapido: { label: 'Guia Rápido de Aplicação', badge: 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800' },
  modelo_laudo: { label: 'Modelo de Laudo', badge: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800' },
  entrevista_anamnese: { label: 'Entrevista & Anamnese', badge: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800' },
  compendio_estudo: { label: 'Compêndio Teórico', badge: 'bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200 dark:border-purple-800' },
  tabela_normativa: { label: 'Tabela Normativa & Cortes', badge: 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800' }
};

export const AGE_LABELS: Record<AgeGroup, string> = {
  infantil: 'Infantil (0 a 11 anos)',
  adolescente: 'Adolescentes (12 a 17 anos)',
  adulto: 'Adultos (18 a 59 anos)',
  idoso: 'Idosos (60+ anos)',
  todas: 'Todas as Idades'
};

export const INITIAL_MATERIALS: MaterialItem[] = [
  {
    id: 'mat-moca',
    title: 'MoCA (Montreal Cognitive Assessment) — Guia Prático & Pontos de Corte',
    subtitle: 'Protocolo completo de rastreio de Comprometimento Cognitivo Leve (CCL) e Demência',
    description: 'Manual conciso de aplicação, instruções de pontuação padronizada e tabelas normativas adaptadas para a população brasileira considerando escolaridade. Inclui pontos de corte para CCL e Alzheimer.',
    type: 'instrumento_rastreio',
    domains: ['rastreio_global', 'funcoes_executivas', 'memoria', 'atencao', 'linguagem', 'visuoespacial'],
    ageGroups: ['adulto', 'idoso'],
    estimatedTime: '10 a 15 min',
    targetPopulation: 'Adultos e idosos com queixas de perda de memória ou suspeita de declínio cognitivo',
    satepsiRestricted: false,
    downloadFormat: 'PDF',
    downloadSize: '2.4 MB',
    authorReference: 'Nasreddine et al. (2005); Validação Brasileira por Memória et al. (2013)',
    clinicalUtility: 'Diferenciação precisa entre envelhecimento saudável, CCL e fases iniciais de quadros demenciais. Superior ao MEEM na detecção de disfunção executiva e perdas de memória precoce.',
    cutoffsSnippet: [
      { label: 'Escore Máximo', value: '30 pontos', clinicalNote: 'Adicionar 1 ponto se escolaridade <= 12 anos' },
      { label: 'Ponto de Corte Geral (Brasil)', value: '< 25 / 26 pontos', clinicalNote: 'Sugere investigação aprofundada de CCL' },
      { label: 'Ponto de Corte Baixa Escolaridade (1-4 anos)', value: '< 21 pontos', clinicalNote: 'Sensibilidade de 81% e especificidade de 77%' },
      { label: 'Ponto de Corte Alta Escolaridade (>=9 anos)', value: '< 26 pontos', clinicalNote: 'Alta sensibilidade para CCL amnéstico' }
    ],
    keyInstructions: [
      'Trail Making B: Instruir o examinando a alternar número e letra sem levantar a caneta.',
      'Cópia do Cubo: Deve ter tridimensionalidade, todas as linhas presentes e paralelas sem perda angular grosseira.',
      'Evocação Tardia de Palavras: Não oferecer pistas fonêmicas ou de categoria na pontuação espontânea.'
    ],
    contentPreview: 'O Montreal Cognitive Assessment (MoCA) foi concebido como um instrumento de rastreio rápido para o comprometimento cognitivo leve (CCL)...',
    isFeatured: true,
    isPopular: true,
    publishedAt: '2026-01-15'
  },
  {
    id: 'mat-laudo-tdah-adulto',
    title: 'Modelo Completo de Laudo Neuropsicológico — TDAH em Adultos',
    subtitle: 'Estrutura detalhada em conformidade com a Resolução CFP nº 06/2019 e critérios DSM-5-TR',
    description: 'Documento editável completo contendo introdução clínica, histórico ocupacional/acadêmico, instrumentos administrados, tabelas com escores Z e percentis, síntese integrativa, diagnóstico diferencial e plano de intervenção.',
    type: 'modelo_laudo',
    domains: ['funcoes_executivas', 'atencao', 'humor_comportamento'],
    ageGroups: ['adulto'],
    estimatedTime: 'Template de redação',
    targetPopulation: 'Adultos sob investigação de desatenção, impulsividade, procrastinação crônica e desregulação executiva',
    satepsiRestricted: false,
    downloadFormat: 'DOCX',
    downloadSize: '480 KB',
    authorReference: 'Elaborado por especialistas do NeuroAcervo segundo CFP 06/2019 e DSM-5-TR',
    clinicalUtility: 'Padroniza a apresentação dos resultados clínicos e psicométricos para médicos psiquiatras, neurologistas e planos de saúde com rigor técnico irrefutável.',
    cutoffsSnippet: [
      { label: 'Atenção Sustentada e Alternada', value: 'Percentil < 16 ou Z < -1.0', clinicalNote: 'Indicativo de prejuízo funcional clinicamente relevante' },
      { label: 'Controle Inibitório e Flexibilidade', value: 'Percentil < 10 ou Z < -1.33', clinicalNote: 'Prejuízo severo na regulação comportamental e tarefas de interferência' }
    ],
    keyInstructions: [
      'Sempre correlacionar os déficits nos testes atencionais com a história desenvolvimental desde a infância.',
      'Descartar diagnósticos diferenciais: transtorno bipolar, apneia obstrutiva do sono, hipotireoidismo e burnout.',
      'Incluir sempre recomendações de adaptação ergonômica e encaminhamento para TCC / Psiquiatria.'
    ],
    contentPreview: 'LAUDO DE AVALIAÇÃO NEUROPSICOLÓGICA\n\n1. IDENTIFICAÇÃO DO PACIENTE...\n2. MOTIVO DA AVALIAÇÃO E QUEIXAS PRINCIPAIS...\n3. ANAMNESE E HISTÓRICO DE DESENVOLVIMENTO...',
    isFeatured: true,
    isPopular: true,
    publishedAt: '2026-02-01'
  },
  {
    id: 'mat-anamnese-adulto-idoso',
    title: 'Roteiro de Entrevista Semiestruturada de Anamnese — Adulto e Idoso',
    subtitle: 'Mapeamento minucioso de queixas cognitivas, hábitos de vida, histórico mórbido e funcionalidade',
    description: 'Ficha prática de coleta de anamnese cobrindo marcos clínicos, queixas subjetivas de memória, sono, medicamentos em uso, nível pré-mórbido e inventário funcional (AVDs básicas e instrumentais).',
    type: 'entrevista_anamnese',
    domains: ['rastreio_global', 'humor_comportamento', 'memoria'],
    ageGroups: ['adulto', 'idoso'],
    estimatedTime: '45 a 60 min',
    targetPopulation: 'Pacientes adultos e idosos em primeira sessão de avaliação neuropsicológica',
    satepsiRestricted: false,
    downloadFormat: 'DOCX',
    downloadSize: '320 KB',
    authorReference: 'Consenso Clínico NeuroAcervo / Escalas Pfeffer & Lawton integradas',
    clinicalUtility: 'Levantamento da linha de base do paciente, indispensável para formular as hipóteses diagnósticas e eleger a bateria neuropsicológica mais adequada.',
    keyInstructions: [
      'Sempre que possível, realizar parte da anamnese com um informante próximo (cônjuge ou filho).',
      'Investigar o impacto do esquecimento na autonomia financeira e uso de medicamentos.',
      'Averiguar presença de flutuação de consciência e alterações comportamentais/alucinações.'
    ],
    contentPreview: 'ENTREVISTA DE ANAMNESE NEUROPSICOLÓGICA CLÍNICA\n\nData: ___/___/_____\nNome do Avaliando: ________________________________\nInformante (se houver): ____________________________\n\nI. QUEIXA PRINCIPAL E HISTÓRIA DA DOENÇA ATUAL (HDA)...',
    isFeatured: false,
    isPopular: true,
    publishedAt: '2026-01-20'
  },
  {
    id: 'mat-ravlt-guia',
    title: 'RAVLT (Rey Auditory Verbal Learning Test) — Guia de Aplicação e Índices',
    subtitle: 'Interpretação passo a passo de Curva de Aprendizagem, Interferência e Reconhecimento',
    description: 'Guia visual para cálculo do Escore Total A1-A5, Velocidade de Aprendizagem, Interferência Proativa (B1 vs A1), Interferência Retroativa (A6 vs A5), Retenção Tardia (A7) e Índice de Falsos Positivos no Reconhecimento.',
    type: 'guia_rapido',
    domains: ['memoria'],
    ageGroups: ['adolescente', 'adulto', 'idoso'],
    estimatedTime: '25 min (com intervalo de 20 min para evocação tardia)',
    targetPopulation: 'Indivíduos com suspeita de amnésia, demência inicial, traumatismo cranioencefálico ou epilepsia',
    satepsiRestricted: true,
    downloadFormat: 'PDF',
    downloadSize: '1.8 MB',
    authorReference: 'Rey (1964); Normatização Brasileira por Malloy-Diniz et al.',
    clinicalUtility: 'Padrão-ouro na avaliação da memória declarativa episódica verbal e sensibilidade aos danos no circuito hipocampal/lobo temporal medial.',
    cutoffsSnippet: [
      { label: 'A1 (Span Imediato)', value: 'Média 6 a 8 palavras', clinicalNote: 'Avalia capacidade de memória imediata e atenção fonológica' },
      { label: 'Escore Total (A1 a A5)', value: 'Percentil >= 25', clinicalNote: 'Mede capacidade de armazenamento e consolidação repetitiva' },
      { label: 'Evocação Tardia (A7)', value: 'Queda > 20% em relação a A5', clinicalNote: 'Alerta clínico de perda acelerada de retenção (evocação espontânea)' }
    ],
    keyInstructions: [
      'Apresentar a lista com velocidade exata de 1 palavra por segundo, mantendo entonação neutra.',
      'Não realizar nenhuma outra tarefa com estímulos verbais auditivos durante o intervalo de 20 minutos de espera de A7.',
      'Registrar intrusões e perseverações em cada tentativa para análise de qualidade executiva.'
    ],
    contentPreview: 'O RAVLT consiste na leitura sucessiva de uma lista de 15 substantivos comuns (Lista A) durante cinco tentativas consecutivas...',
    isFeatured: true,
    isPopular: true,
    publishedAt: '2026-02-10'
  },
  {
    id: 'mat-laudo-infantil-tea',
    title: 'Modelo de Laudo Neuropsicológico Infantil — Suspeita de TEA e Aprendizagem',
    subtitle: 'Comunicação empática e técnica para neuropediatras, fonoaudiólogos e coordenação escolar',
    description: 'Estrutura completa com fundamentação psicométrica, observação lúdico-comportamental, perfil de desenvolvimento (motricidade, linguagem pragmática, inflexibilidade cognitiva) e plano de adaptações pedagógicas (PEI).',
    type: 'modelo_laudo',
    domains: ['funcoes_executivas', 'linguagem', 'humor_comportamento', 'inteligencia'],
    ageGroups: ['infantil'],
    estimatedTime: 'Template de redação',
    targetPopulation: 'Crianças de 3 a 11 anos encaminhadas por dificuldades de socialização, hiperfoco e queixas escolares',
    satepsiRestricted: false,
    downloadFormat: 'DOCX',
    downloadSize: '512 KB',
    authorReference: 'Especialistas em Neurodesenvolvimento Infantil do NeuroAcervo',
    clinicalUtility: 'Facilita a elaboração de laudos infantis completos, com linguagem acessível aos pais e recomendações pragmáticas para aplicação no Plano Educacional Individualizado (PEI).',
    keyInstructions: [
      'Descrever minuciosamente a reação da criança frente a limites, frustrações e quebra de rotina.',
      'Separar os achados formais dos testes psicométricos da análise qualitativa de interação social.',
      'Especificar na conclusão as necessidades de suporte (Nível 1, 2 ou 3) segundo o DSM-5-TR.'
    ],
    contentPreview: 'RELATÓRIO / LAUDO DE AVALIAÇÃO NEUROPSICOLÓGICA INFANTIL\n\nNome da Criança: __________________________________\nIdade Cronológica: __ anos e __ meses\nEscola / Ano: ____________________________________...',
    isFeatured: false,
    isPopular: false,
    publishedAt: '2026-02-15'
  },
  {
    id: 'mat-compendio-estatistica',
    title: 'Compêndio de Psicolometria & Estatística Prática para Laudos',
    subtitle: 'Domine Escores Z, T, Percentis, Curva Normal e Discrepâncias Clinicamente Relevantes',
    description: 'Guia definitivo de bolso para converter escores brutos em padronizados, calcular intervalos de confiança (IC 95%), interpretar curvas normais gaussianas e justificar desvios com segurança científica no laudo.',
    type: 'compendio_estudo',
    domains: ['rastreio_global', 'inteligencia'],
    ageGroups: ['todas'],
    estimatedTime: 'Leitura e consulta permanente',
    targetPopulation: 'Psicólogos e neuropsicólogos clínicos em fase de tabulação e fechamento diagnóstico',
    satepsiRestricted: false,
    downloadFormat: 'PDF',
    downloadSize: '3.1 MB',
    authorReference: 'Comitê Científico NeuroAcervo',
    clinicalUtility: 'Elimina as dúvidas mais frequentes na elaboração de tabelas de laudo: o que fazer quando um teste usa percentil e outro usa Escore Z, e como identificar dupla dissociação com consistência.',
    cutoffsSnippet: [
      { label: 'Escore Z = 0', value: 'Percentil 50 / T = 50', clinicalNote: 'Desempenho rigorosamente dentro da média esperada' },
      { label: 'Escore Z entre -1.0 e -1.5', value: 'Percentil 16 a 7', clinicalNote: 'Desempenho limítrofe / rebaixamento leve' },
      { label: 'Escore Z < -1.5', value: 'Percentil < 7', clinicalNote: 'Rebaixamento significativo / déficit clinicamente sugestivo' },
      { label: 'Escore Z < -2.0', value: 'Percentil < 2', clinicalNote: 'Déficit severo (abaixo de 2 desvios-padrão)' }
    ],
    keyInstructions: [
      'Nunca confunda percentil com porcentagem de acertos!',
      'Ao comparar testes de editoras diferentes, normalize todos os resultados para Escore Z na tabela final.',
      'Sempre declare a amostra normativa utilizada (ano e região demográfica).'
    ],
    contentPreview: 'A psicometria constitui o alicerce matemático que confere legitimidade científica à prática da avaliação neuropsicológica...',
    isFeatured: true,
    isPopular: true,
    publishedAt: '2026-01-10'
  },
  {
    id: 'mat-stroop-guia',
    title: 'Teste de Stroop (Cores e Palavras) — Protocolo de Interpretação',
    subtitle: 'Avaliação de Atenção Seletiva, Controle Inibitório e Efeito de Interferência',
    description: 'Passo a passo para aplicação dos cartões de Palavras, Cores e Cores-Palavras. Fórmulas de cálculo do Índice de Interferência e interpretação de suscetibilidade à distração.',
    type: 'guia_rapido',
    domains: ['funcoes_executivas', 'atencao'],
    ageGroups: ['adolescente', 'adulto', 'idoso'],
    estimatedTime: '5 a 8 min',
    targetPopulation: 'Quadros de TDAH, traumatismo cranioencefálico, lesões pré-frontais e demências frontotemporais',
    satepsiRestricted: true,
    downloadFormat: 'PDF',
    downloadSize: '1.2 MB',
    authorReference: 'Stroop (1935); Golden & Freshwater; Versão Victoria adaptada',
    clinicalUtility: 'Mede a capacidade de inibir uma resposta automática preponderante (leitura) em benefício de um comportamento orientado a metas (nomeação da cor da tinta).',
    cutoffsSnippet: [
      { label: 'Cartão 1 (Leitura)', value: 'Velocidade Basal', clinicalNote: 'Mede velocidade de processamento visual e leitura' },
      { label: 'Cartão 2 (Cores)', value: 'Nomeação Simples', clinicalNote: 'Velocidade de acesso léxico e nomeação cromática' },
      { label: 'Cartão 3 (Interferência)', value: 'Controle Inibitório', clinicalNote: 'Tempo aumentado e erros autocorrigidos refletem esforço executivo aumentado' }
    ],
    keyInstructions: [
      'Garantir que o paciente não possua daltonismo antes da testagem.',
      'Cronometrar com precisão de décimos de segundo.',
      'Anotar separadamente erros espontâneos autocorrigidos e erros mantidos.'
    ],
    contentPreview: 'O paradigma de Stroop é amplamente utilizado na clínica e na pesquisa para estimar a integridade do córtex cingulado anterior...',
    isFeatured: false,
    isPopular: true,
    publishedAt: '2026-02-18'
  },
  {
    id: 'mat-meem-cortes',
    title: 'MEEM (Mini-Exame do Estado Mental) — Tabela de Cortes de Brucki et al.',
    subtitle: 'Pontos de corte ajustados para analfabetos e diferentes faixas de escolaridade no Brasil',
    description: 'Tabela de referência rápida de escores médios e desvios padrão para 0, 1 a 4 anos, 5 a 8 anos e 9+ anos de estudo, com notas sobre os principais fatores de erro na aplicação.',
    type: 'tabela_normativa',
    domains: ['rastreio_global'],
    ageGroups: ['idoso'],
    estimatedTime: '5 a 10 min',
    targetPopulation: 'Idosos em triagem primária para declínio cognitivo',
    satepsiRestricted: false,
    downloadFormat: 'PDF',
    downloadSize: '650 KB',
    authorReference: 'Folstein et al. (1975); Normatização Brasileira por Brucki et al. (2003)',
    clinicalUtility: 'Instrumento de triagem amplamente solicitado por planos de saúde e geriatras. Essencial ter os pontos de corte estratificados por escolaridade à mão.',
    cutoffsSnippet: [
      { label: 'Analfabetos', value: 'Corte: 20 pontos', clinicalNote: 'Escore médio nacional: 20.3 (DP 2.3)' },
      { label: '1 a 4 anos de estudo', value: 'Corte: 25 pontos', clinicalNote: 'Escore médio nacional: 25.1 (DP 2.8)' },
      { label: '5 a 8 anos de estudo', value: 'Corte: 26.5 pontos', clinicalNote: 'Escore médio nacional: 26.8 (DP 2.3)' },
      { label: '9 ou mais anos de estudo', value: 'Corte: 28 pontos', clinicalNote: 'Escore médio nacional: 28.5 (DP 1.8)' }
    ],
    keyInstructions: [
      'No cálculo serial (subtrações de 7 a partir de 100), se o paciente errar a primeira e continuar subtraindo 7 do número incorreto, pontuar os acertos subsequentes.',
      'No comando de 3 estágios, dar toda a instrução uma única vez sem repetir.',
      'Na frase da escrita, deve conter sujeito e verbo com sentido.'
    ],
    contentPreview: 'A tabela de Brucki et al. (2003) permanece como um dos marcos mais citados na literatura médica e neuropsicológica brasileira...',
    isFeatured: false,
    isPopular: false,
    publishedAt: '2026-01-05'
  }
];

export const INITIAL_MODULES: CourseModule[] = [
  {
    id: 'mod-1',
    title: 'Módulo 1: Raciocínio Clínico e Planejamento da Avaliação',
    subtitle: 'Como montar baterias flexíveis e formular hipóteses diagnósticas certeiras',
    description: 'Aprenda a estruturar o processo avaliativo desde o primeiro contato: acolhimento, contrato, anamnese aprofundada e desenho da bateria de testes com base na queixa e na ecologia do paciente.',
    orderIndex: 1,
    level: 'Essencial',
    lessons: [
      {
        id: 'les-1-1',
        moduleId: 'mod-1',
        title: 'Aula 1: A Entrevista de Anamnese como Eixo Central do Raciocínio Clínico',
        description: 'Por que a anamnese responde por 70% do diagnóstico e como coletar dados que os testes psicométricos não revelam.',
        durationMinutes: 42,
        videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', // Placeholder embed
        videoProvider: 'youtube',
        orderIndex: 1,
        keyTakeaways: [
          'Diferença entre queixa do paciente e queixa do familiar informante.',
          'Mapeamento da funcionalidade prévia (ocupacional e interpessoal).',
          'Sinais de alerta vermelho (red flags) neurológicos e psiquiátricos.'
        ],
        attachedMaterialIds: ['mat-anamnese-adulto-idoso']
      },
      {
        id: 'les-1-2',
        moduleId: 'mod-1',
        title: 'Aula 2: Baterias Fixas vs. Baterias Flexíveis: Qual abordagem escolher?',
        description: 'Critérios pragmáticos para escolha de instrumentos: cansaço do paciente, sensibilidade psicométrica e adequação à escolaridade.',
        durationMinutes: 38,
        videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        videoProvider: 'youtube',
        orderIndex: 2,
        keyTakeaways: [
          'Vantagens e limitações de cada modelo metodológico.',
          'Como dosar a carga cognitiva e evitar fadiga durante as sessões de testagem.',
          'A importância de testes de rastreio inicial antes do aprofundamento.'
        ],
        attachedMaterialIds: ['mat-moca', 'mat-meem-cortes']
      }
    ]
  },
  {
    id: 'mod-2',
    title: 'Módulo 2: Domínios Cognitivos e Interpretação dos Testes',
    subtitle: 'Atenção, Memória, Funções Executivas e Funções Visuoespaciais',
    description: 'Imersão nos principais construtos da neuropsicologia moderna, com demonstrações de aplicação dos testes mais utilizados no Brasil e interpretação de padrões de resposta.',
    orderIndex: 2,
    level: 'Intermediário',
    lessons: [
      {
        id: 'les-2-1',
        moduleId: 'mod-2',
        title: 'Aula 1: Desvendando a Memória Episódica Verbal com o RAVLT',
        description: 'Análise aprofundada das curvas de aprendizagem, efeito de primazia e recência, vulnerabilidade à interferência e reconhecimento.',
        durationMinutes: 54,
        videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        videoProvider: 'youtube',
        orderIndex: 1,
        keyTakeaways: [
          'Como diferenciar déficit de evocação (frontal/subcortical) de déficit de retenção/armazenamento (hipocampal).',
          'O valor clínico do reconhecimento e o papel dos falsos positivos.',
          'Análise de perseverações como pista executiva.'
        ],
        attachedMaterialIds: ['mat-ravlt-guia']
      },
      {
        id: 'les-2-2',
        moduleId: 'mod-2',
        title: 'Aula 2: Funções Executivas e Atenção: Stroop, FDT e Trilhas',
        description: 'Interpretação de testes atencionais e de controle inibitório. Quando a lentidão é atenção e quando é velocidade de processamento?',
        durationMinutes: 47,
        videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        videoProvider: 'youtube',
        orderIndex: 2,
        keyTakeaways: [
          'Diferenciando componentes atencionais: sustentada, alternada e dividida.',
          'O impacto da ansiedade de desempenho nos tempos de reação.',
          'Como documentar lapsos atencionais qualitativamente.'
        ],
        attachedMaterialIds: ['mat-stroop-guia']
      }
    ]
  },
  {
    id: 'mod-3',
    title: 'Módulo 3: Redação de Laudos de Alto Nível & Devolutiva',
    subtitle: 'Da tabulação psicométrica à comunicação clínica com médicos e famílias',
    description: 'Técnicas de redação científica acessível, organização das tabelas psicométricas, justificativas diagnósticas robustas e condução de devolutivas transformadoras.',
    orderIndex: 3,
    level: 'Avançado',
    lessons: [
      {
        id: 'les-3-1',
        moduleId: 'mod-3',
        title: 'Aula 1: Anatomia de um Laudo Neuropsicológico Impecável (CFP 06/2019)',
        description: 'Estruturação seções por seção: histórico, descrição comportamental, tabelas comparativas e conclusão diagnóstica.',
        durationMinutes: 62,
        videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        videoProvider: 'youtube',
        orderIndex: 1,
        keyTakeaways: [
          'Como evitar jargões herméticos sem perder o rigor científico.',
          'Construção de tabelas claras com percentis e escores Z correlacionados.',
          'Recomendações terapêuticas que realmente auxiliam a equipe multiprofissional.'
        ],
        attachedMaterialIds: ['mat-laudo-tdah-adulto', 'mat-laudo-infantil-tea', 'mat-compendio-estatistica']
      }
    ]
  }
];
