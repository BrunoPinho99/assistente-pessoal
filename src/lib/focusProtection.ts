import { Task, Project } from '../types';

export const MAX_ACTIVE_PROJECTS = 2;

// Expressões ou palavras vagas que ativam paralisia por análise no TDAH
const VAGUE_PATTERNS = [
  /^(fazer|trabalhar|estudar|ver|organizar|arrumar|ajustar|desenvolver|pensar|criar)\b/i,
  /^(tarefas|coisas|projeto|sistema|tudo|geral)$/i
];

/**
 * Validação de micro-ação para o timer de 45 minutos.
 * Nenhuma tarefa pode ir para o foco de 45 minutos se for vaga ou exceder 45 minutos.
 */
export function validateTaskForFocus(task?: Task | null): { 
  isValid: boolean; 
  reason?: string; 
  isTooLong?: boolean; 
  isVague?: boolean 
} {
  if (!task) {
    return { isValid: false, reason: 'Nenhuma tarefa selecionada para foco.' };
  }

  // 1. Validação de Duração: deve caber no bloco único de 45 minutos
  if (task.estimated_minutes > 45) {
    return {
      isValid: false,
      reason: `Tarefa de ${task.estimated_minutes} min excede o limite do bloco de foco (máximo 45 min). Fatie com IA para evitar sobrecarga.`,
      isTooLong: true
    };
  }

  // 2. Validação de Clareza / Anti-Paralisia:
  // Se o título for extremamente curto ou vago e não possuir sub-tarefas mecânicas
  const trimmed = task.title.trim();
  const hasSubtasks = Array.isArray(task.subtasks) && task.subtasks.length > 0;

  if (!hasSubtasks) {
    if (trimmed.length < 8) {
      return {
        isValid: false,
        reason: 'O título é muito curto ou vago. O cérebro TDAH precisa de um verbo de ação mecânica claro.',
        isVague: true
      };
    }

    const isVagueMatch = VAGUE_PATTERNS.some(regex => regex.test(trimmed));
    if (isVagueMatch && trimmed.split(' ').length <= 2) {
      return {
        isValid: false,
        reason: 'Tarefa muito genérica ("' + trimmed + '"). Fatie com IA para definir o primeiro micro-passo mecânico imediato.',
        isVague: true
      };
    }
  }

  return { isValid: true };
}

/**
 * Fatiador de Tarefas com IA (Simulação Estruturada de IA para TDAH).
 * Decompõe uma tarefa ampla em 2 a 3 micro-ações mecânicas de 15 a 30 minutos.
 */
export async function sliceTaskWithAI(task: Task): Promise<{
  microTasks: Array<{ title: string; estimated_minutes: number; description: string }>;
  explanation: string;
}> {
  // Simulação de latência de IA (350ms para sensação realística e fluida)
  await new Promise(resolve => setTimeout(resolve, 350));

  const title = task.title;
  const area = task.area || 'Littera';

  // Decomposição mecânica e orientada a execução imediata (Anti-Procrastinação)
  const microTasks = [
    {
      title: `[Passo 1] Mapear arquivos e requisitos de: ${title}`,
      estimated_minutes: 15,
      description: 'Abrir o editor, revisar escopo imediato e listar 3 critérios de aceite.'
    },
    {
      title: `[Passo 2] Executar implementação central de: ${title}`,
      estimated_minutes: 25,
      description: 'Foco exclusivo na lógica principal sem refatoração prematura.'
    },
    {
      title: `[Passo 3] Testar fluxo e registrar checkpoint: ${title}`,
      estimated_minutes: 15,
      description: 'Validar em localhost, comitar código e salvar próximo passo.'
    }
  ];

  return {
    microTasks,
    explanation: `Quebramos "${title}" em 3 micro-etapas mecânicas que cabem com folga no bloco de 45 minutos.`
  };
}

/**
 * Estruturador de Ideias de Negócio / Projetos para o Estacionamento de Dopamina.
 */
export function structureDopamineIdea(rawText: string, defaultArea: 'Littera' | 'Aura' | 'IDP' | 'Pessoal' = 'Littera'): {
  title: string;
  scope: string;
  area: 'Littera' | 'Aura' | 'IDP' | 'Pessoal';
  main_goal: string;
  next_step: string;
} {
  const cleaned = rawText.trim();
  
  // Extrai um título conciso
  let title = cleaned.slice(0, 60);
  if (title.length < cleaned.length) {
    title = title.replace(/\s+\S*$/, '') + '...';
  }
  if (!title.toLowerCase().startsWith('ideia:')) {
    title = title.charAt(0).toUpperCase() + title.slice(1);
  }

  // Detecta área por palavras-chave
  let area = defaultArea;
  const lower = cleaned.toLowerCase();
  if (lower.includes('littera') || lower.includes('saas') || lower.includes('deploy') || lower.includes('software')) {
    area = 'Littera';
  } else if (lower.includes('aura') || lower.includes('design') || lower.includes('ui') || lower.includes('figma')) {
    area = 'Aura';
  } else if (lower.includes('idp') || lower.includes('artigo') || lower.includes('pesquisa') || lower.includes('direito')) {
    area = 'IDP';
  }

  const scope = `Hipótese: ${cleaned}. Escopo inicial de validação arquivado para não canibalizar a atenção das empresas ativas.`;
  const main_goal = `Validar MVP ou protótipo quando a vaga de foco for liberada.`;
  const next_step = `Revisar no fechamento trimestral se esta ideia substitui um projeto ativo.`;

  return {
    title,
    scope,
    area,
    main_goal,
    next_step
  };
}

