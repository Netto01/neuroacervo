'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useNeuro } from '@/context/NeuroContext';
import { PlatformShell } from '@/components/layout/PlatformShell';
import { resolveUserPlan } from '@/utils/userPlan';
import { PraticaGate } from '@/components/common/PraticaGate';
import { 
  ArrowLeft, 
  Layers, 
  RotateCw, 
  Sparkles, 
  CheckCircle2, 
  ChevronLeft, 
  ChevronRight,
  Shuffle,
  Eye,
  Sliders,
  Check
} from 'lucide-react';

interface CartaEF {
  id: number;
  categoria: 'planejamento' | 'flexibilidade' | 'inibicao' | 'memoria' | 'metacognicao';
  categoriaNome: string;
  cor: string;
  bgLight: string;
  titulo: string;
  missao: string;
  regra: string;
  perguntaClinica: string;
  dica: string;
}

const CATEGORIAS: Record<string, { nome: string; cor: string; bg: string }> = {
  todos: { nome: 'Todas as cartas (48)', cor: '#2f6b31', bg: '#f7f1de' },
  planejamento: { nome: 'Planejamento (10)', cor: '#2e4c78', bg: '#e8f0fe' },
  flexibilidade: { nome: 'Flexibilidade (10)', cor: '#8a5317', bg: '#fef3c7' },
  inibicao: { nome: 'Controle Inibitório (10)', cor: '#991b1b', bg: '#fee2e2' },
  memoria: { nome: 'Memória Operacional (10)', cor: '#1d5e63', bg: '#e0f2f1' },
  metacognicao: { nome: 'Metacognição (8)', cor: '#6a4870', bg: '#f3e8ff' },
};

// 48 Cartas Clínicas de Funções Executivas
const CARTAS_BASE: CartaEF[] = [
  // 1-10: Planejamento & Organização
  { id: 1, categoria: 'planejamento', categoriaNome: 'Planejamento', cor: '#2e4c78', bgLight: '#e8f0fe', titulo: 'O Primeiro Passo', missao: 'Escolha uma tarefa difícil que você tem que fazer hoje. Qual é a primeiríssima coisa que precisa acontecer?', regra: 'Não pode pular etapas. Divida a tarefa em no mínimo 3 partes.', perguntaClinica: 'Como o paciente delimita o início de uma ação complexa?', dica: 'Incentive a decomposição em micro-passos visuais.' },
  { id: 2, categoria: 'planejamento', categoriaNome: 'Planejamento', cor: '#2e4c78', bgLight: '#e8f0fe', titulo: 'O Desafio do Tempo', missao: 'Estime quantos minutos leva para arrumar a sua mochila. Depois conte mentalmente ou use o cronômetro.', regra: 'Compare sua estimativa antes e depois do tempo real.', perguntaClinica: 'Há percepção temporal realista ou subestimação sistemática?', dica: 'Ajude a criar âncoras temporais cotidianas.' },
  { id: 3, categoria: 'planejamento', categoriaNome: 'Planejamento', cor: '#2e4c78', bgLight: '#e8f0fe', titulo: 'Mala de Viagem', missao: 'Você vai viajar para o Polo Norte por 3 dias. Você só pode levar 5 itens na mala.', regra: 'Justifique a ordem de importância de cada item.', perguntaClinica: 'Consegue priorizar itens essenciais vs desejos supérfluos?', dica: 'Trabalha hierarquização de necessidades.' },
  { id: 4, categoria: 'planejamento', categoriaNome: 'Planejamento', cor: '#2e4c78', bgLight: '#e8f0fe', titulo: 'Receita Maluca', missao: 'Crie uma receita de bolo invisível. Diga os passos do fim para o começo: do prato servido até quebrar os ovos.', regra: 'Ordem estritamente reversa sem esquecer de assar.', perguntaClinica: 'Capacidade de encadeamento retroativo (backward chaining).', dica: 'Estimula visão do produto final antes da execução.' },
  { id: 5, categoria: 'planejamento', categoriaNome: 'Planejamento', cor: '#2e4c78', bgLight: '#e8f0fe', titulo: 'O Obstáculo Surpresa', missao: 'Você está no meio de um trabalho importante e a luz acaba. Qual é o seu Plano B imediato?', regra: 'Diga duas alternativas viáveis sem perder a calma.', perguntaClinica: 'Antecipação de contingências e prevenção de travamento.', dica: 'Discuta o conceito de plano de contingência.' },
  { id: 6, categoria: 'planejamento', categoriaNome: 'Planejamento', cor: '#2e4c78', bgLight: '#e8f0fe', titulo: 'Mapa do Tesouro', missao: 'Dê 4 instruções claras para alguém sair desta sala e encontrar um objeto escondido.', regra: 'Use pontos de referência espaciais (direita, esquerda, após).', perguntaClinica: 'Organização sequencial espacial e clareza instrucional.', dica: 'Treine formulação precisa de comandos.' },
  { id: 7, categoria: 'planejamento', categoriaNome: 'Planejamento', cor: '#2e4c78', bgLight: '#e8f0fe', titulo: 'Checklist Mental', missao: 'Antes de sair de casa para a escola/trabalho, quais são os 4 itens obrigatórios que você checa?', regra: 'Crie um acrônimo ou rima para memorizar a lista.', perguntaClinica: 'Criação de rotinas sistemáticas de conferência.', dica: 'Associe ao bolso, à chave e ao material escolar.' },
  { id: 8, categoria: 'planejamento', categoriaNome: 'Planejamento', cor: '#2e4c78', bgLight: '#e8f0fe', titulo: 'Dividir para Conquistar', missao: 'Organizar um quarto bagunçado parece impossível. Por onde você começa e qual área fica por último?', regra: 'Separe o quarto em 3 zonas (cama, chão, mesa).', perguntaClinica: 'Enfrentamento de sobrecarga visual e cognitiva.', dica: 'Evite tentar fazer tudo simultaneamente.' },
  { id: 9, categoria: 'planejamento', categoriaNome: 'Planejamento', cor: '#2e4c78', bgLight: '#e8f0fe', titulo: 'Controle de Prioridade', missao: 'Três coisas urgentes acontecem ao mesmo tempo: telefone toca, campainha toca e água ferve. O que você atende primeiro?', regra: 'Justifique pelo critério de risco e segurança.', perguntaClinica: 'Triagem rápida de riscos e urgência.', dica: 'Foque na hierarquia do perigo imediato.' },
  { id: 10, categoria: 'planejamento', categoriaNome: 'Planejamento', cor: '#2e4c78', bgLight: '#e8f0fe', titulo: 'Construção da Ponte', missao: 'Se você quer tirar nota 10 na próxima prova daqui a 2 semanas, o que você faz hoje, na semana que vem e na véspera?', regra: 'Cada semana tem que ter uma ação diferente.', perguntaClinica: 'Planejamento a médio prazo e diluição de esforço.', dica: 'Desconstrua a ilusão de estudar só na véspera.' },

  // 11-20: Flexibilidade Cognitiva
  { id: 11, categoria: 'flexibilidade', categoriaNome: 'Flexibilidade', cor: '#8a5317', bgLight: '#fef3c7', titulo: 'Troca de Regra', missao: 'Quando eu disser VERDE, levante a mão direita. Se eu bater duas palmas, agora VERDE significa levantar a mão esquerda.', regra: 'Atenção à mudança de regra instantânea.', perguntaClinica: 'Alternância atencional e custo de troca de tarefa (task switching).', dica: 'Observe se ocorrem erros de perseveração.' },
  { id: 12, categoria: 'flexibilidade', categoriaNome: 'Flexibilidade', cor: '#8a5317', bgLight: '#fef3c7', titulo: 'Outro Olhar', missao: 'Pense em algo chato que aconteceu hoje. Encontre 2 aspectos positivos ou úteis nessa mesma situação.', regra: 'Não vale dizer "nenhum". Reescreva o significado.', perguntaClinica: 'Reavaliação cognitiva e flexibilidade interpretativa.', dica: 'Mostre que eventos neutros admitem múltiplas lentes.' },
  { id: 13, categoria: 'flexibilidade', categoriaNome: 'Flexibilidade', cor: '#8a5317', bgLight: '#fef3c7', titulo: 'Uso Inusitado', missao: 'Cite 5 utilidades para um tijolo que não seja construir uma parede.', regra: 'Quanto mais criativo e diferente, melhor.', perguntaClinica: 'Fluência ideativa e desprendimento de rigidez funcional.', dica: 'Estimule pensar fora da utilidade óbvia do objeto.' },
  { id: 14, categoria: 'flexibilidade', categoriaNome: 'Flexibilidade', cor: '#8a5317', bgLight: '#fef3c7', titulo: 'O Advogado do Diabo', missao: 'Defenda um ponto de vista totalmente oposto ao que você acredita por 1 minuto.', regra: 'Mantenha argumentos sérios sem rir ou desqualificar.', perguntaClinica: 'Descentração egocêntrica e flexibilidade conceitual.', dica: 'Excelente para trabalhar empatia e tolerância.' },
  { id: 15, categoria: 'flexibilidade', categoriaNome: 'Flexibilidade', cor: '#8a5317', bgLight: '#fef3c7', titulo: 'Mudança de Rota', missao: 'Você estava indo para o cinema e a sessão esgotou. Diga 2 passeios substitutos em menos de 10 segundos.', regra: 'Sem reclamar do plano que deu errado.', perguntaClinica: 'Tolerância à frustração e adaptação em tempo real.', dica: 'Treine a transição imediata para a solução.' },
  { id: 16, categoria: 'flexibilidade', categoriaNome: 'Flexibilidade', cor: '#8a5317', bgLight: '#fef3c7', titulo: 'Sinônimos em Ação', missao: 'Conte uma história de 3 frases sem usar a letra "A" ou sem usar a palavra "EU".', regra: 'Respeite a restrição gramatical imposta.', perguntaClinica: 'Supressão de padrões automáticos de linguagem.', dica: 'Observe a pausa de busca lexical.' },
  { id: 17, categoria: 'flexibilidade', categoriaNome: 'Flexibilidade', cor: '#8a5317', bgLight: '#fef3c7', titulo: 'O Encaixe Alternativo', missao: 'Você perdeu a colher para tomar a sopa. Como você toma a sopa sem a colher?', regra: 'Pense em 3 maneiras higiênicas e funcionais.', perguntaClinica: 'Resolução prática de problemas cotidianos.', dica: 'Evite a paralisia diante da falta do recurso ideal.' },
  { id: 18, categoria: 'flexibilidade', categoriaNome: 'Flexibilidade', cor: '#8a5317', bgLight: '#fef3c7', titulo: 'Camaleão Emocional', missao: 'Como uma pessoa com raiva andaria pela sala? E agora, como uma pessoa curiosa andaria?', regra: 'Mude a postura corporal e expressão facial imediatamente.', perguntaClinica: 'Flexibilidade motora e transição de estado afetivo.', dica: 'Conecte expressão somática à regulação interna.' },
  { id: 19, categoria: 'flexibilidade', categoriaNome: 'Flexibilidade', cor: '#8a5317', bgLight: '#fef3c7', titulo: 'Categorias Cruzadas', missao: 'Nomeie 4 animais que voam, depois 4 animais que nadam, e depois 2 que fazem ambos.', regra: 'Alterne rápido sem repetir espécies.', perguntaClinica: 'Busca semântica com mudança de critério inclusivo.', dica: 'Avalie fluência e flexibilidade conceitual.' },
  { id: 20, categoria: 'flexibilidade', categoriaNome: 'Flexibilidade', cor: '#8a5317', bgLight: '#fef3c7', titulo: 'O Final Diferente', missao: 'Lembre da história da Chapeuzinho Vermelho. Mude o final para que o Lobo se torne amigo dela.', regra: 'O desfecho precisa fazer sentido lógico.', perguntaClinica: 'Reorganização narrativa e flexibilização de esquemas fixos.', dica: 'Ajuda a quebrar scripts mentais pré-formatados.' },

  // 21-30: Controle Inibitório
  { id: 21, categoria: 'inibicao', categoriaNome: 'Controle Inibitório', cor: '#991b1b', bgLight: '#fee2e2', titulo: 'Sinal Vermelho', missao: 'Quando eu disser SIM, balance a cabeça dizendo NÃO. Quando eu disser NÃO, balance dizendo SIM.', regra: 'Responda com o gesto oposto sem hesitar.', perguntaClinica: 'Inibição de resposta prepotente reflexa.', dica: 'Observe a latência de resposta e contenção motora.' },
  { id: 22, categoria: 'inibicao', categoriaNome: 'Controle Inibitório', cor: '#991b1b', bgLight: '#fee2e2', titulo: 'A Pausa dos 5 Segundos', missao: 'Antes de responder à próxima pergunta, respire fundo e conte 5 segundos em silêncio.', regra: 'Proibido responder imediatamente, mesmo se souber a resposta.', perguntaClinica: 'Capacidade de postergar impulsividade verbal.', dica: 'Cria o espaço entre o estímulo e a reação.' },
  { id: 23, categoria: 'inibicao', categoriaNome: 'Controle Inibitório', cor: '#991b1b', bgLight: '#fee2e2', titulo: 'Estátua Atenta', missao: 'Fique totalmente imóvel por 30 segundos enquanto eu conto uma piada ou faço barulhos.', regra: 'Mantenha os olhos abertos e os braços soltos sem mexer.', perguntaClinica: 'Controle motor voluntário sob interferência externa.', dica: 'Avalia suscetibilidade a distratores ambientais.' },
  { id: 24, categoria: 'inibicao', categoriaNome: 'Controle Inibitório', cor: '#991b1b', bgLight: '#fee2e2', titulo: 'Palavra Proibida', missao: 'Converse comigo por 1 minuto respondendo sobre seu dia, mas você NÃO PODE dizer "NÃO" nem "É".', regra: 'Se falar a palavra proibida, recomeça o cronômetro.', perguntaClinica: 'Monitoramento contínuo da fala e inibição verbal.', dica: 'Estimula autocorreção antes da vocalização.' },
  { id: 25, categoria: 'inibicao', categoriaNome: 'Controle Inibitório', cor: '#991b1b', bgLight: '#fee2e2', titulo: 'Mão Travada', missao: 'Coloque as duas mãos sobre a mesa. Quando eu bater uma palma, levante apenas a mão esquerda.', regra: 'A mão direita tem que ficar 100% colada à mesa.', perguntaClinica: 'Inibição de movimentos espelho ou sincinésias.', dica: 'Fortalece individuação do comando motor.' },
  { id: 26, categoria: 'inibicao', categoriaNome: 'Controle Inibitório', cor: '#991b1b', bgLight: '#fee2e2', titulo: 'Resista à Tentação', missao: 'Imagine que seu doce favorito está na sua frente e você só pode comer depois do almoço. O que você faz?', regra: 'Diga uma estratégia física para não olhar para o doce.', perguntaClinica: 'Estratégias ecológicas de adiamento de gratificação.', dica: 'Discuta o distanciamento físico do estímulo.' },
  { id: 27, categoria: 'inibicao', categoriaNome: 'Controle Inibitório', cor: '#991b1b', bgLight: '#fee2e2', titulo: 'Leitura Silenciosa', missao: 'Leia uma frase mentalmente sem mover os lábios nem emitir som nenhum.', regra: 'Nenhum músculo da boca pode se mover.', perguntaClinica: 'Internalização da linguagem e controle da subvocalização.', dica: 'Passo fundamental para o pensamento mediado.' },
  { id: 28, categoria: 'inibicao', categoriaNome: 'Controle Inibitório', cor: '#991b1b', bgLight: '#fee2e2', titulo: 'O Freio do Desabafo', missao: 'Você ficou muito bravo com um amigo num jogo. O que você faz com a mão e com a boca nos primeiros 10 segundos?', regra: 'Nenhuma palavra ofensiva pode escapar.', perguntaClinica: 'Inibição de agressividade verbal reativa.', dica: 'Conecte à técnica do "freio de mão" mental.' },
  { id: 29, categoria: 'inibicao', categoriaNome: 'Controle Inibitório', cor: '#991b1b', bgLight: '#fee2e2', titulo: 'Câmera Lenta', missao: 'Pegue um copo de água e leve até a boca demorando exatamente 20 segundos para o movimento.', regra: 'Movimento contínuo, extremamente suave e lento.', perguntaClinica: 'Modulação e desaceleração de impulsos motores rápidos.', dica: 'Útil para pacientes hipercinéticos.' },
  { id: 30, categoria: 'inibicao', categoriaNome: 'Controle Inibitório', cor: '#991b1b', bgLight: '#fee2e2', titulo: 'Filtro de Ruído', missao: 'Vou falar números e palavras misturados (ex: 3, Bola, 7, Casa). Repita APENAS os números.', regra: 'Ignore completamente todas as palavras.', perguntaClinica: 'Atenção seletiva auditiva com inibição de distratores.', dica: 'Treina o filtro de relevância perceptual.' },

  // 31-40: Memória Operacional
  { id: 31, categoria: 'memoria', categoriaNome: 'Memória Operacional', cor: '#1d5e63', bgLight: '#e0f2f1', titulo: 'Dígitos Inversos', missao: 'Ouça a sequência: 4 - 8 - 2. Diga-a de trás para a frente.', regra: 'Processamento mental sem anotar.', perguntaClinica: 'Manipulação ativa na memória operacional fonológica.', dica: 'Aumente o span de 3 para 4 e 5 dígitos progressivamente.' },
  { id: 32, categoria: 'memoria', categoriaNome: 'Memória Operacional', cor: '#1d5e63', bgLight: '#e0f2f1', titulo: 'Cesta de Compras', missao: 'Fui à feira e comprei: Maçã, Pão, Queijo e Leite. Repita em ordem ALFABÉTICA.', regra: 'Reorganize os itens mentalmente antes de falar.', perguntaClinica: 'Reorganização categórica em memória ativa.', dica: 'Exige retenção e comparação simultânea.' },
  { id: 33, categoria: 'memoria', categoriaNome: 'Memória Operacional', cor: '#1d5e63', bgLight: '#e0f2f1', titulo: 'Cálculo com Distração', missao: 'Some 7 + 5. Guarde o resultado. Agora me diga a cor dos meus olhos. Qual era a soma?', regra: 'Mantenha o dado numérico retido durante o diálogo.', perguntaClinica: 'Resistência ao decaimento do traço mnêmico.', dica: 'Mede o impacto da interferência concorrente.' },
  { id: 34, categoria: 'memoria', categoriaNome: 'Memória Operacional', cor: '#1d5e63', bgLight: '#e0f2f1', titulo: 'O Detetive Visual', missao: 'Olhe para a sala por 10 segundos. Feche os olhos e liste 3 objetos azuis que você viu.', regra: 'Olhos fechados durante a recuperação dos itens.', perguntaClinica: 'Retenção no esboço visuoespacial.', dica: 'Trabalha varredura visual atenta e retenção.' },
  { id: 35, categoria: 'memoria', categoriaNome: 'Memória Operacional', cor: '#1d5e63', bgLight: '#e0f2f1', titulo: 'História em Cadeia', missao: 'Eu digo uma frase, você repete a minha e adiciona uma nova frase continuando a história.', regra: 'Não pode esquecer nenhuma frase anterior.', perguntaClinica: 'Atualização progressiva de memória de trabalho (updating).', dica: 'Exercício lúdico de retenção sequencial acumulativa.' },
  { id: 36, categoria: 'memoria', categoriaNome: 'Memória Operacional', cor: '#1d5e63', bgLight: '#e0f2f1', titulo: 'O Telefone Perdido', missao: 'Grave este número imaginário: 9-8-1-3-0. Agora me diga o dobro do primeiro e do último número.', regra: 'Calcule mentalmente mantendo os outros números ativos.', perguntaClinica: 'Dual-task e capacidade de trabalho executivo.', dica: 'Observe se o paciente perde a sequência original.' },
  { id: 37, categoria: 'memoria', categoriaNome: 'Memória Operacional', cor: '#1d5e63', bgLight: '#e0f2f1', titulo: 'Soletrar ao Contrário', missao: 'Soletre a palavra CASA de trás para frente. Agora tente com LIVRO.', regra: 'Visualização interna das letras em ordem invertida.', perguntaClinica: 'Manipulação visuoespacial de grafemas.', dica: 'Incentive criar a "lousa mental" na imaginação.' },
  { id: 38, categoria: 'memoria', categoriaNome: 'Memória Operacional', cor: '#1d5e63', bgLight: '#e0f2f1', titulo: 'Mosaico de Formas', missao: 'Imagine um triângulo vermelho dentro de um círculo azul. O que está dentro de quem?', regra: 'Manipule as formas geometricamente na imaginação.', perguntaClinica: 'Representação mental de relações espaciais.', dica: 'Base para raciocínio abstrato e geometria.' },
  { id: 39, categoria: 'memoria', categoriaNome: 'Memória Operacional', cor: '#1d5e63', bgLight: '#e0f2f1', titulo: 'Sequência de Meses', missao: 'Diga os meses do ano começando em Outubro e indo de trás para a frente até Junho.', regra: 'Ordem cronológica inversa sem pular meses.', perguntaClinica: 'Recuperação não automática de sequências automatizadas.', dica: 'Exige alto controle executivo sobre rotinas consolidadas.' },
  { id: 40, categoria: 'memoria', categoriaNome: 'Memória Operacional', cor: '#1d5e63', bgLight: '#e0f2f1', titulo: 'Quem é Quem?', missao: 'João é mais alto que Pedro. Pedro é mais alto que Lucas. Quem é o mais baixo de todos?', regra: 'Resolva mentalmente sem usar caneta.', perguntaClinica: 'Raciocínio dedutivo baseado em memória operacional.', dica: 'Estimule ordenar a fila imaginária na mente.' },

  // 41-48: Metacognição & Automonitoramento
  { id: 41, categoria: 'metacognicao', categoriaNome: 'Metacognição', cor: '#6a4870', bgLight: '#f3e8ff', titulo: 'O Termômetro do Erro', missao: 'Antes de eu corrigir sua resposta, dê uma nota de 0 a 10 para a certeza que você tem de que acertou.', regra: 'Monitore sua própria precisão sem medo de errar.', perguntaClinica: 'Sensibilidade de calibração metacognitiva (confidence judgment).', dica: 'Reduz tanto o excesso de confiança quanto a insegurança.' },
  { id: 42, categoria: 'metacognicao', categoriaNome: 'Metacognição', cor: '#6a4870', bgLight: '#f3e8ff', titulo: 'Onde Me Distraio?', missao: 'Identifique qual é o seu maior "ladrão de atenção" quando você senta para estudar.', regra: 'Diga como ele começa e como você se sente na hora.', perguntaClinica: 'Autoconsciência dos gatilhos internos de desatenção.', dica: 'Diferencie gatilho externo (celular) de interno (tédio).' },
  { id: 43, categoria: 'metacognicao', categoriaNome: 'Metacognição', cor: '#6a4870', bgLight: '#f3e8ff', titulo: 'O Espelho Crítico', missao: 'Como você saberia se esteve falando rápido demais ou devagar demais agora?', regra: 'Cite um sinal físico que mostra a velocidade da sua fala.', perguntaClinica: 'Automonitoramento em tempo real (on-line monitoring).', dica: 'Trabalha percepção do impacto no ouvinte.' },
  { id: 44, categoria: 'metacognicao', categoriaNome: 'Metacognição', cor: '#6a4870', bgLight: '#f3e8ff', titulo: 'Aprender com a Falha', missao: 'Lembre de um erro recente. Se você pudesse voltar no tempo com o que sabe hoje, o que faria diferente?', regra: 'Foque na atitude alternativa, não na culpa.', perguntaClinica: 'Uso formativo do feedback e autocrítica construtiva.', dica: 'Desdramatiza o erro transformando-o em dado de ajuste.' },
  { id: 45, categoria: 'metacognicao', categoriaNome: 'Metacognição', cor: '#6a4870', bgLight: '#f3e8ff', titulo: 'Bateria de Energia', missao: 'Em qual período do dia seu cérebro funciona melhor: de manhã, à tarde ou à noite?', regra: 'Planeje como alocar as matérias mais difíceis nesse horário.', perguntaClinica: 'Gestão estratégica de recursos atencionais próprios.', dica: 'Personalização do plano de estudos ao ritmo circadiano.' },
  { id: 46, categoria: 'metacognicao', categoriaNome: 'Metacognição', cor: '#6a4870', bgLight: '#f3e8ff', titulo: 'Pedir Ajuda na Hora Certa', missao: 'Quanto tempo você tenta resolver um problema sozinho antes de pedir ajuda? É muito cedo ou tarde demais?', regra: 'Defina a regra dos 10 minutos de tentativa autônoma.', perguntaClinica: 'Equilíbrio entre autonomia e busca de suporte eficiente.', dica: 'Previne dependência precoce e frustração solitária.' },
  { id: 47, categoria: 'metacognicao', categoriaNome: 'Metacognição', cor: '#6a4870', bgLight: '#f3e8ff', titulo: 'Auditoria de Leitura', missao: 'Leia um parágrafo. Você entendeu tudo ou seus olhos só passaram pelas palavras sem registrar?', regra: 'Resuma em uma única frase o que acabou de ler.', perguntaClinica: 'Monitoramento da compreensão textual.', dica: 'Combate o hábito da leitura zumbi automática.' },
  { id: 48, categoria: 'metacognicao', categoriaNome: 'Metacognição', cor: '#6a4870', bgLight: '#f3e8ff', titulo: 'Meu Superpoder Executivo', missao: 'Entre Planejar, Ter Flexibilidade, Frear e Lembrar: qual é o seu ponto mais forte hoje?', regra: 'Reconheça sua principal força e como usá-la a seu favor.', perguntaClinica: 'Autoeficácia percebida e reforço de recursos positivos.', dica: 'Encerre sessões com ênfase nas competências dominadas.' },
];

export default function BaralhoPage() {
  const { currentUser } = useNeuro();
  const planInfo = resolveUserPlan(currentUser);

  const [categoriaAtiva, setCategoriaAtiva] = useState<string>('todos');
  const [indiceAtual, setIndiceAtual] = useState<number>(0);
  const [virada, setVirada] = useState<boolean>(false);
  const [cartasConcluidas, setCartasConcluidas] = useState<Record<number, boolean>>({});
  const [anotacoes, setAnotacoes] = useState<Record<number, string>>({});

  const cartasFiltradas = categoriaAtiva === 'todos' 
    ? CARTAS_BASE 
    : CARTAS_BASE.filter(c => c.categoria === categoriaAtiva);

  const cartaAtual = cartasFiltradas[indiceAtual] || CARTAS_BASE[0];

  const mudarCategoria = (cat: string) => {
    setCategoriaAtiva(cat);
    setIndiceAtual(0);
    setVirada(false);
  };

  const proximaCarta = () => {
    setVirada(false);
    setIndiceAtual((prev) => (prev + 1) % cartasFiltradas.length);
  };

  const cartaAnterior = () => {
    setVirada(false);
    setIndiceAtual((prev) => (prev - 1 + cartasFiltradas.length) % cartasFiltradas.length);
  };

  const sortearAleatoria = () => {
    setVirada(false);
    const novoIndex = Math.floor(Math.random() * cartasFiltradas.length);
    setIndiceAtual(novoIndex);
  };

  const alternarConcluida = (id: number) => {
    setCartasConcluidas(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <PlatformShell activePage="recursos">
      {!planInfo.hasRecursos ? (
        <PraticaGate />
      ) : (
        <div className="wrap" style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px 80px' }}>
          {/* Top navigation */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
            <Link 
              href="/recursos-interativos"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                fontSize: 14,
                fontWeight: 600,
                color: 'var(--ink-mute)',
                textDecoration: 'none',
                padding: '8px 14px',
                borderRadius: 999,
                background: 'var(--bone)',
                boxShadow: 'inset 0 0 0 1px var(--line)'
              }}
            >
              <ArrowLeft size={16} /> Voltar aos Recursos
            </Link>

            <span style={{ fontSize: 13, color: 'var(--ink-mute)', fontFamily: 'var(--fm)' }}>
              Carta <b>{indiceAtual + 1}</b> de <b>{cartasFiltradas.length}</b>
            </span>
          </div>

          {/* Header */}
          <div className="hd3" style={{ marginBottom: 30 }}>
            <div>
              <div className="kick">Baralho Clínico Interativo</div>
              <h1>Baralho de <em>Funções Executivas</em>.</h1>
              <p>48 cartas estruturadas para aplicação e registro direto em sessão clínica infantil e adolescente.</p>
            </div>
            <div className="stats">
              <div><b>48</b><span>cartas no baralho</span></div>
              <div><b>5</b><span>domínios executivos</span></div>
              <div><b>{Object.values(cartasConcluidas).filter(Boolean).length}</b><span>aplicadas na sessão</span></div>
            </div>
          </div>

          {/* Filtros de Categoria */}
          <div className="filtros" style={{ marginBottom: 30 }}>
            {Object.entries(CATEGORIAS).map(([catKey, cat]) => (
              <button
                key={catKey}
                type="button"
                className={categoriaAtiva === catKey ? 'on' : ''}
                onClick={() => mudarCategoria(catKey)}
              >
                {cat.nome}
              </button>
            ))}
          </div>

          {/* Container do Baralho / Carta Interativa */}
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 480px) 1fr', gap: 32, alignItems: 'start' }}>
            {/* Card visual 3D flip */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18 }}>
              <div 
                onClick={() => setVirada(!virada)}
                style={{
                  width: '100%',
                  aspectRatio: '3 / 4.2',
                  maxHeight: 520,
                  perspective: 1000,
                  cursor: 'pointer',
                  position: 'relative'
                }}
              >
                <div 
                  style={{
                    width: '100%',
                    height: '100%',
                    position: 'relative',
                    transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
                    transformStyle: 'preserve-3d',
                    transform: virada ? 'rotateY(180deg)' : 'none',
                    borderRadius: 24,
                    boxShadow: '0 18px 40px rgba(21,20,15,0.12), inset 0 0 0 1.5px var(--line)'
                  }}
                >
                  {/* Frente da Carta */}
                  <div 
                    style={{
                      position: 'absolute',
                      inset: 0,
                      backfaceVisibility: 'hidden',
                      borderRadius: 24,
                      background: 'var(--bone)',
                      padding: 28,
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      border: `3px solid ${cartaAtual.cor}`,
                      boxSizing: 'border-box'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span 
                          style={{
                            fontSize: 11,
                            fontFamily: 'var(--fm)',
                            letterSpacing: '0.12em',
                            textTransform: 'uppercase',
                            padding: '4px 10px',
                            borderRadius: 999,
                            background: cartaAtual.cor,
                            color: '#fff',
                            fontWeight: 700
                          }}
                        >
                          {cartaAtual.categoriaNome}
                        </span>
                        <span style={{ fontFamily: 'var(--fm)', fontSize: 13, color: 'var(--ink-faint)', fontWeight: 600 }}>
                          #{cartaAtual.id}
                        </span>
                      </div>

                      <h2 style={{ fontFamily: 'var(--fd)', fontSize: 24, fontWeight: 800, color: 'var(--ink)', margin: '20px 0 12px' }}>
                        {cartaAtual.titulo}
                      </h2>

                      <div style={{ padding: '16px', borderRadius: 16, background: '#fff', boxShadow: 'inset 0 0 0 1px var(--line)', marginTop: 14 }}>
                        <small style={{ display: 'block', fontFamily: 'var(--fm)', fontSize: 10.5, letterSpacing: '0.1em', textTransform: 'uppercase', color: cartaAtual.cor, fontWeight: 700, marginBottom: 6 }}>
                          Missão do Paciente
                        </small>
                        <p style={{ margin: 0, fontSize: 15, lineHeight: 1.5, color: 'var(--ink)' }}>
                          {cartaAtual.missao}
                        </p>
                      </div>

                      <div style={{ marginTop: 16, padding: '12px 14px', borderRadius: 12, background: 'rgba(21,20,15,0.04)', fontSize: 13, color: 'var(--ink-soft)' }}>
                        <b>Regra:</b> {cartaAtual.regra}
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 16, borderTop: '1px dashed var(--line)' }}>
                      <span style={{ fontSize: 12, color: 'var(--ink-faint)', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                        <RotateCw size={14} /> Toque para ver notas clínicas
                      </span>
                      {cartasConcluidas[cartaAtual.id] && (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: 'var(--accent-strong)', fontSize: 12, fontWeight: 700 }}>
                          <CheckCircle2 size={16} /> Feita
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Verso da Carta (Guia Clínico) */}
                  <div 
                    style={{
                      position: 'absolute',
                      inset: 0,
                      backfaceVisibility: 'hidden',
                      transform: 'rotateY(180deg)',
                      borderRadius: 24,
                      background: 'var(--ink)',
                      color: 'var(--paper)',
                      padding: 28,
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      border: `3px solid var(--lime)`,
                      boxSizing: 'border-box'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span 
                          style={{
                            fontSize: 11,
                            fontFamily: 'var(--fm)',
                            letterSpacing: '0.12em',
                            textTransform: 'uppercase',
                            padding: '4px 10px',
                            borderRadius: 999,
                            background: 'var(--lime)',
                            color: 'var(--ink)',
                            fontWeight: 700
                          }}
                        >
                          Guia do Terapeuta
                        </span>
                        <span style={{ fontFamily: 'var(--fm)', fontSize: 13, color: 'rgba(239,231,210,0.6)' }}>
                          #{cartaAtual.id}
                        </span>
                      </div>

                      <h3 style={{ fontFamily: 'var(--fd)', fontSize: 20, fontWeight: 700, color: 'var(--paper)', margin: '18px 0 14px' }}>
                        O que observar na sessão:
                      </h3>

                      <div style={{ padding: '14px', borderRadius: 14, background: 'rgba(239,231,210,0.08)', marginBottom: 14 }}>
                        <small style={{ display: 'block', fontFamily: 'var(--fm)', fontSize: 10.5, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--lime)', marginBottom: 4 }}>
                          Foco Neuropsicológico
                        </small>
                        <p style={{ margin: 0, fontSize: 14, lineHeight: 1.5, color: 'rgba(239,231,210,0.9)' }}>
                          {cartaAtual.perguntaClinica}
                        </p>
                      </div>

                      <div style={{ padding: '14px', borderRadius: 14, background: 'rgba(239,231,210,0.08)' }}>
                        <small style={{ display: 'block', fontFamily: 'var(--fm)', fontSize: 10.5, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--lime)', marginBottom: 4 }}>
                          Dica de Mediação
                        </small>
                        <p style={{ margin: 0, fontSize: 14, lineHeight: 1.5, color: 'rgba(239,231,210,0.9)' }}>
                          {cartaAtual.dica}
                        </p>
                      </div>
                    </div>

                    <div style={{ textAlign: 'center', paddingTop: 14, borderTop: '1px solid rgba(239,231,210,0.15)', fontSize: 12, color: 'rgba(239,231,210,0.6)' }}>
                      Toque para virar para a frente
                    </div>
                  </div>
                </div>
              </div>

              {/* Botões de Navegação da Carta */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', justifyContent: 'center' }}>
                <button
                  type="button"
                  onClick={cartaAnterior}
                  aria-label="Carta anterior"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '10px 18px',
                    borderRadius: 999,
                    border: 0,
                    background: 'var(--bone)',
                    boxShadow: 'inset 0 0 0 1px var(--line)',
                    cursor: 'pointer',
                    fontWeight: 700,
                    fontFamily: 'var(--fd)',
                    fontSize: 14
                  }}
                >
                  <ChevronLeft size={18} /> Anterior
                </button>

                <button
                  type="button"
                  onClick={sortearAleatoria}
                  title="Sortear carta aleatória"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '10px 16px',
                    borderRadius: 999,
                    border: 0,
                    background: 'var(--bone)',
                    boxShadow: 'inset 0 0 0 1px var(--line)',
                    cursor: 'pointer',
                    fontWeight: 600,
                    fontSize: 13
                  }}
                >
                  <Shuffle size={16} /> Sortear
                </button>

                <button
                  type="button"
                  onClick={proximaCarta}
                  aria-label="Próxima carta"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '10px 18px',
                    borderRadius: 999,
                    border: 0,
                    background: 'var(--ink)',
                    color: 'var(--paper)',
                    cursor: 'pointer',
                    fontWeight: 700,
                    fontFamily: 'var(--fd)',
                    fontSize: 14
                  }}
                >
                  Próxima <ChevronRight size={18} />
                </button>
              </div>
            </div>

            {/* Painel de Registro Clínico e Instruções de Uso */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* Box de Ação / Registro da Carta */}
              <div style={{ padding: 24, borderRadius: 20, background: 'var(--bone)', boxShadow: 'inset 0 0 0 1px var(--line)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                  <h3 style={{ margin: 0, fontFamily: 'var(--fd)', fontSize: 18, fontWeight: 800 }}>
                    Registro Clínico da Sessão
                  </h3>
                  <button
                    type="button"
                    onClick={() => alternarConcluida(cartaAtual.id)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '6px 12px',
                      borderRadius: 999,
                      border: 0,
                      cursor: 'pointer',
                      fontFamily: 'var(--fd)',
                      fontSize: 13,
                      fontWeight: 700,
                      background: cartasConcluidas[cartaAtual.id] ? 'var(--accent-strong)' : 'rgba(21,20,15,0.06)',
                      color: cartasConcluidas[cartaAtual.id] ? '#fff' : 'var(--ink-mute)'
                    }}
                  >
                    <Check size={14} /> {cartasConcluidas[cartaAtual.id] ? 'Concluída' : 'Marcar como feita'}
                  </button>
                </div>

                <p style={{ fontSize: 13.5, color: 'var(--ink-mute)', margin: '0 0 12px' }}>
                  Anote o desempenho do paciente nesta atividade (latência, necessidade de mediação, tipo de erro ou facilidade):
                </p>

                <textarea
                  value={anotacoes[cartaAtual.id] || ''}
                  onChange={(e) => setAnotacoes(prev => ({ ...prev, [cartaAtual.id]: e.target.value }))}
                  placeholder="Ex: Paciente hesitou 8 segundos antes de iniciar. Conseguiu elencar 3 passos lógicos sem auxílio..."
                  rows={4}
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    borderRadius: 14,
                    border: '1px solid var(--line)',
                    background: '#fff',
                    fontFamily: 'var(--ft)',
                    fontSize: 14,
                    color: 'var(--ink)',
                    resize: 'vertical',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {/* Guia Rápido de Aplicação em 3 Passos */}
              <div style={{ padding: 24, borderRadius: 20, background: 'var(--bone)', boxShadow: 'inset 0 0 0 1px var(--line)' }}>
                <h4 style={{ margin: '0 0 14px', fontFamily: 'var(--fd)', fontSize: 16, fontWeight: 800 }}>
                  Como aplicar em sessão
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
                  <div style={{ padding: 12, borderRadius: 12, background: '#fff', boxShadow: 'inset 0 0 0 1px var(--line)' }}>
                    <i style={{ display: 'inline-block', fontStyle: 'normal', fontFamily: 'var(--fm)', fontSize: 11, background: 'var(--ink)', color: 'var(--lime)', padding: '2px 6px', borderRadius: 6, marginBottom: 6 }}>01</i>
                    <b style={{ display: 'block', fontSize: 13.5, color: 'var(--ink)' }}>Apresente a Missão</b>
                    <small style={{ fontSize: 12, color: 'var(--ink-mute)' }}>Deixe o paciente ler ou leia em voz alta sem antecipar a resposta.</small>
                  </div>
                  <div style={{ padding: 12, borderRadius: 12, background: '#fff', boxShadow: 'inset 0 0 0 1px var(--line)' }}>
                    <i style={{ display: 'inline-block', fontStyle: 'normal', fontFamily: 'var(--fm)', fontSize: 11, background: 'var(--ink)', color: 'var(--lime)', padding: '2px 6px', borderRadius: 6, marginBottom: 6 }}>02</i>
                    <b style={{ display: 'block', fontSize: 13.5, color: 'var(--ink)' }}>Observe o Processo</b>
                    <small style={{ fontSize: 12, color: 'var(--ink-mute)' }}>Avalie se houve impulsividade, congelamento ou busca imediata de apoio.</small>
                  </div>
                  <div style={{ padding: 12, borderRadius: 12, background: '#fff', boxShadow: 'inset 0 0 0 1px var(--line)' }}>
                    <i style={{ display: 'inline-block', fontStyle: 'normal', fontFamily: 'var(--fm)', fontSize: 11, background: 'var(--ink)', color: 'var(--lime)', padding: '2px 6px', borderRadius: 6, marginBottom: 6 }}>03</i>
                    <b style={{ display: 'block', fontSize: 13.5, color: 'var(--ink)' }}>Medie a Estratégia</b>
                    <small style={{ fontSize: 12, color: 'var(--ink-mute)' }}>Vire a carta para consultar a dica clínica e consolidar o aprendizado.</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </PlatformShell>
  );
}
