import { Task, Project, ContextArea, NavigationTab } from '../types';
import { structureDopamineIdea, sliceTaskWithAI } from './focusProtection';

export interface AssistantActionExecuted {
  type: 'task_created' | 'task_completed' | 'task_sliced' | 'idea_parked' | 'focus_started' | 'plan_ready';
  title: string;
  description?: string;
  details?: any;
}

export interface AssistantResponse {
  replyText: string;
  actionExecuted?: AssistantActionExecuted;
  suggestedPrompts?: string[];
}

interface AssistantContext {
  userName: string;
  tasks: Task[];
  projects: Project[];
  activeProjects: Project[];
  parkedProjects: Project[];
  onAddTask: (task: Omit<Task, 'id' | 'created_at'>) => Task;
  onToggleTask: (taskId: string) => void;
  onSliceTask?: (taskId: string, microTasks: any[], mode: 'replace' | 'subtasks') => void;
  onParkIdea: (ideaText: string, area?: ContextArea) => Project;
  onStartFocus?: (task: Task) => void;
  onNavigateTab?: (tab: NavigationTab) => void;
}

/**
 * Processador Inteligente do Assistente IA (Conversação + Execução de Ações)
 */
export async function processAssistantMessage(
  userInput: string,
  context: AssistantContext
): Promise<AssistantResponse> {
  const query = userInput.trim();
  const lower = query.toLowerCase();

  const {
    userName,
    tasks,
    activeProjects,
    parkedProjects,
    onAddTask,
    onToggleTask,
    onSliceTask,
    onParkIdea,
    onStartFocus,
    onNavigateTab
  } = context;

  const pendingTasks = tasks.filter(t => t.status !== 'concluido');
  const completedTasks = tasks.filter(t => t.status === 'concluido');

  // ============================================================================
  // 1. AÇÃO: CRIAR NOVA TAREFA NO SISTEMA
  // Exemplos: "Criar tarefa X", "Adicione a tarefa X", "Nova tarefa: X"
  // ============================================================================
  const isCreateTaskIntent = 
    lower.startsWith('criar tarefa') || 
    lower.startsWith('crie a tarefa') || 
    lower.startsWith('crie uma tarefa') || 
    lower.startsWith('adicionar tarefa') || 
    lower.startsWith('adicione a tarefa') || 
    lower.startsWith('nova tarefa') ||
    lower.includes('adicione na lista') ||
    lower.includes('crie na lista');

  if (isCreateTaskIntent) {
    // Extrai o título da tarefa removendo os prefixos comuns
    let rawTitle = query
      .replace(/^(criar tarefa|crie a tarefa|crie uma tarefa|adicionar tarefa|adicione a tarefa|nova tarefa:|nova tarefa|adicione|crie)/i, '')
      .replace(/^(de|para|em|no|na)\s+/i, '')
      .trim();

    // Detectar área/empresa mencionada
    let area: ContextArea = 'Littera';
    let projectId: string | undefined = activeProjects.find(p => p.area === 'Littera')?.id || activeProjects[0]?.id;

    if (lower.includes('aura') || lower.includes('pinho media')) {
      area = 'Aura';
      projectId = activeProjects.find(p => p.area === 'Aura')?.id || projectId;
    } else if (lower.includes('pessoal') || lower.includes('casa') || lower.includes('saude')) {
      area = 'Pessoal';
      projectId = undefined;
    } else if (lower.includes('littera')) {
      area = 'Littera';
      projectId = activeProjects.find(p => p.area === 'Littera')?.id || projectId;
    }

    // Limpar menções de empresa do título final se necessário
    const cleanTitle = rawTitle
      .replace(/\s+(no|na|para)\s+(littera|aura|pessoal)/i, '')
      .trim() || 'Nova tarefa operacional';

    // Cria a tarefa de verdade no store
    const newTask = onAddTask({
      title: cleanTitle.charAt(0).toUpperCase() + cleanTitle.slice(1),
      area,
      category: area === 'Pessoal' ? 'pessoal' : 'profissional',
      description: `Criada pelo Assistente IA a pedido de ${userName}.`,
      priority: lower.includes('urgente') ? 'urgente' : lower.includes('alta') ? 'alta' : 'media',
      estimated_minutes: 30,
      difficulty: 'medio',
      energy_level: 'medium',
      status: 'inbox',
      subtasks: [],
      project_id: projectId
    });

    return {
      replyText: `Com certeza, ${userName}! Criei a tarefa no sistema vinculada a **${area}**. Ela já está disponível no seu painel de tarefas de hoje.`,
      actionExecuted: {
        type: 'task_created',
        title: newTask.title,
        description: `Área: ${newTask.area} • Estimativa: ${newTask.estimated_minutes} min • Status: A Fazer`,
        details: newTask
      },
      suggestedPrompts: [
        `Iniciar foco em "${cleanTitle.slice(0, 20)}"`,
        'Fatiar esta tarefa em passos menores',
        'Planejar o resto do dia'
      ]
    };
  }

  // ============================================================================
  // 2. AÇÃO: CONCLUIR TAREFA NO SISTEMA
  // Exemplos: "Concluir tarefa X", "Marcar X como feita", "Finalizei X"
  // ============================================================================
  const isCompleteTaskIntent =
    lower.startsWith('concluir tarefa') ||
    lower.startsWith('conclua a tarefa') ||
    lower.startsWith('finalizar tarefa') ||
    lower.startsWith('finalizei') ||
    lower.startsWith('terminei') ||
    lower.includes('marcar como concluida') ||
    lower.includes('marcar como feita');

  if (isCompleteTaskIntent && pendingTasks.length > 0) {
    // Tenta encontrar por matching de texto
    const searchPart = lower
      .replace(/(concluir tarefa|conclua a tarefa|finalizar tarefa|finalizei a tarefa|finalizei|terminei|marcar como concluida|marcar como feita)/g, '')
      .trim();

    let matchedTask = searchPart 
      ? pendingTasks.find(t => t.title.toLowerCase().includes(searchPart))
      : undefined;

    // Fallback: se não especificou o nome, usa a primeira tarefa pendente de prioridade alta
    if (!matchedTask) {
      matchedTask = pendingTasks.find(t => t.priority === 'urgente') || pendingTasks[0];
    }

    if (matchedTask) {
      onToggleTask(matchedTask.id);
      return {
        replyText: `Excelente, ${userName}! Marquei a tarefa **"${matchedTask.title}"** como concluída no sistema. Menos uma pendência disputando sua atenção!`,
        actionExecuted: {
          type: 'task_completed',
          title: matchedTask.title,
          description: `Concluída às ${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`
        },
        suggestedPrompts: [
          'O que devo fazer agora?',
          'Planejar próximas tarefas',
          'Ver tarefas restantes'
        ]
      };
    }
  }

  // ============================================================================
  // 3. AÇÃO: FATIAR TAREFA COM IA (Task Slicing)
  // Exemplos: "Fatiar tarefa X", "Quebrar tarefa de deploy", "Dividir tarefa"
  // ============================================================================
  const isSliceIntent = 
    lower.startsWith('fatiar tarefa') || 
    lower.startsWith('quebrar a tarefa') || 
    lower.startsWith('dividir tarefa') ||
    lower.includes('fatiar com ia') ||
    lower.includes('micro-passos') ||
    lower.includes('passos menores');

  if (isSliceIntent && pendingTasks.length > 0) {
    const searchPart = lower
      .replace(/(fatiar tarefa|quebrar a tarefa|dividir tarefa|fatiar com ia|em micro-passos|em passos menores)/g, '')
      .trim();

    const targetTask = (searchPart ? pendingTasks.find(t => t.title.toLowerCase().includes(searchPart)) : null) ||
      pendingTasks.find(t => t.estimated_minutes > 45) ||
      pendingTasks[0];

    if (targetTask && onSliceTask) {
      const sliceResult = await sliceTaskWithAI(targetTask);
      const microSteps = sliceResult.microTasks;
      onSliceTask(targetTask.id, microSteps, 'subtasks');

      return {
        replyText: `Fatiei a tarefa **"${targetTask.title}"** em ${microSteps.length} micro-ações mecânicas de 15 a 25 minutos. Cada uma foi inserida diretamente no checklist da tarefa para eliminar o atrito de início.`,
        actionExecuted: {
          type: 'task_sliced',
          title: targetTask.title,
          description: `${microSteps.length} micro-etapas inseridas no sistema.`,
          details: microSteps
        },
        suggestedPrompts: [
          `Iniciar foco em "${targetTask.title.slice(0, 20)}"`,
          'Planejar a semana',
          'Qual é o primeiro passo?'
        ]
      };
    }
  }

  // ============================================================================
  // 4. AÇÃO: INICIAR FOCO NO TIMER
  // Exemplos: "Iniciar foco na tarefa X", "Quero focar em Y", "Vamos focar"
  // ============================================================================
  const isFocusIntent = 
    lower.startsWith('iniciar foco') || 
    lower.startsWith('focar na tarefa') || 
    lower.startsWith('vamos focar') ||
    lower.startsWith('abrir foco');

  if (isFocusIntent) {
    const searchPart = lower.replace(/(iniciar foco em|iniciar foco na tarefa|focar na tarefa|focar em|vamos focar em|vamos focar)/g, '').trim();
    const targetTask = (searchPart ? pendingTasks.find(t => t.title.toLowerCase().includes(searchPart)) : null) || pendingTasks[0];

    if (targetTask && onStartFocus) {
      onStartFocus(targetTask);
      if (onNavigateTab) onNavigateTab('hoje');

      return {
        replyText: `Perfeito, ${userName}! Configurei o timer de 45 minutos com a tarefa **"${targetTask.title}"** no topo do seu dia. Concentre-se apenas nessa entrega.`,
        actionExecuted: {
          type: 'focus_started',
          title: targetTask.title,
          description: `Bloco de foco ativo: ${targetTask.estimated_minutes} min • Ruído marrom disponível.`
        },
        suggestedPrompts: [
          'Me ajude com o primeiro passo',
          'Concluir esta tarefa',
          'Fatiar esta tarefa'
        ]
      };
    }
  }

  // ============================================================================
  // 5. AÇÃO: ESTACIONAR IDEIA NO ESTACIONAMENTO DE DOPAMINA [🔒]
  // Detecta quando o usuário explicitamente traz uma nova ideia de negócio ou pede para estacionar
  // ============================================================================
  const isIdeaParkingIntent =
    lower.startsWith('estacionar') ||
    lower.startsWith('estacione') ||
    lower.startsWith('guardar ideia') ||
    lower.startsWith('tive uma ideia') ||
    lower.startsWith('nova ideia de negócio') ||
    lower.startsWith('nova ideia de negocio') ||
    lower.startsWith('novo projeto:') ||
    lower.startsWith('ideia de app') ||
    lower.startsWith('ideia de saas') ||
    lower.includes('estacionamento de dopamina');

  if (isIdeaParkingIntent) {
    const cleanIdea = query
      .replace(/(estacionar ideia|estacione a ideia|estacionar|estacione|guardar ideia|tive uma ideia de|tive uma ideia:|nova ideia de negócio:|nova ideia de negócio|nova ideia de negocio|novo projeto:|ideia de app:|ideia de saas:)/i, '')
      .trim() || query;

    let replyText = 'Escopo estruturado e trancado no arquivo morto 🔒. Foco mantido no Littera.';
    let parked = onParkIdea(cleanIdea);
    let structuredDetails: any = null;

    try {
      // Chamada à rota backend /api/dopamine-dump
      const response = await fetch('/api/dopamine-dump', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: cleanIdea })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.reply) {
          replyText = data.reply;
        }
        if (data.project) {
          parked = {
            ...parked,
            id: data.project.id || parked.id,
            name: data.project.name || parked.title,
            title: data.project.name || parked.title,
            locked: true,
            isLocked: true,
            category: 'parking',
            unlockConditions: data.project.unlockConditions || parked.unlockConditions,
            description: data.project.description || parked.description
          };
        }
        structuredDetails = data.structuredIdea;
      }
    } catch (apiErr) {
      console.warn('[AssistantAgent] API /api/dopamine-dump offline, usando persistência local segura:', apiErr);
    }

    return {
      replyText: `${replyText}\n\n• **Projeto:** ${parked.title || parked.name}\n• **Status:** Cadeado Ativo [🔒]\n• **Destranca após:** ${parked.unlockConditions?.[0] || 'Concluir entrega prioritária do Littera'}`,
      actionExecuted: {
        type: 'idea_parked',
        title: parked.title || parked.name || 'Nova Ideia',
        description: `Status: TRANCADO [🔒] • Categoria: parking • Foco mantido no Littera.`,
        details: parked
      },
      suggestedPrompts: [
        'Voltar para as prioridades de hoje',
        'Me ajude a planejar a semana',
        'O que focar agora?'
      ]
    };
  }

  // ============================================================================
  // 6. CONVERSA & PLANEJAMENTO: PLANEJAR A SEMANA
  // Exemplos: "Me ajude a planejar a semana", "Como planejar a semana", "Planejamento semanal"
  // ============================================================================
  const isPlanWeekIntent = 
    lower.includes('planejar a semana') || 
    lower.includes('planejamento da semana') || 
    lower.includes('planejar semana') ||
    lower.includes('organizar a semana');

  if (isPlanWeekIntent) {
    const litteraTasks = pendingTasks.filter(t => t.area === 'Littera' || t.project_id === 'proj_littera');
    const auraTasks = pendingTasks.filter(t => t.area === 'Aura' || t.project_id === 'proj_aura');

    return {
      replyText: `### 🗓️ Planejamento Estratégico da Semana — Personal OS

Olá, **${userName}**! Como você tem **TDAH**, a chave para uma semana produtiva não é fazer mais coisas, mas proteger sua energia e respeitar a **Regra dos 2 Projetos Ativos**.

---

#### 1. Foco Principal: **Littera** (Operação & Deploy)
- **Meta da semana:** Publicação e estabilização em produção.
- **Entregas imediatas:** ${litteraTasks.slice(0, 2).map(t => `\n  • ${t.title} (~${t.estimated_minutes} min)`).join('') || '\n  • Finalizar release e validar checklist.'}
- **Estratégia:** Agendar 2 blocos diários de **45 minutos** pela manhã, quando o córtex pré-frontal está com maior reserva dopaminérgica.

#### 2. Foco Secundário: **Aura / Pinho Media** (Crescimento & Alinhamento)
- **Meta da semana:** Alinhamento executivo e prospecção.
- **Entregas imediatas:** ${auraTasks.slice(0, 2).map(t => `\n  • ${t.title} (~${t.estimated_minutes} min)`).join('') || '\n  • Alinhar métricas com a equipe.'}
- **Estratégia:** Resolver no período da tarde em sessões de baixa resistência.

#### 3. Blindagem de Foco (Anti-Paralisia TDAH)
- Atualmente você tem **${parkedProjects.length} ideias guardadas no Estacionamento 🔒**. Não inicie nenhum projeto novo até validar a entrega do Littera!
- Se surgir impulso de criar outra coisa, digite aqui para eu arquivar imediatamente.

---
💡 **Quer que eu crie ou organize alguma tarefa prioritária para a sua semana agora?**`,
      actionExecuted: {
        type: 'plan_ready',
        title: 'Plano Semanal Personal OS',
        description: `Estruturado para ${activeProjects.map(p => p.title).join(' & ') || 'Littera e Aura'}`
      },
      suggestedPrompts: [
        'Criar tarefa: Revisar checklist de release no Littera',
        'O que devo fazer hoje primeiro?',
        'Fatiar a maior tarefa da semana'
      ]
    };
  }

  // ============================================================================
  // 7. CONVERSA & PLANEJAMENTO: PLANEJAR O DIA / O QUE FAZER AGORA
  // Exemplos: "O que fazer hoje?", "Planejar meu dia", "Estou perdido"
  // ============================================================================
  const isPlanDayIntent =
    lower.includes('planejar o dia') ||
    lower.includes('planejar meu dia') ||
    lower.includes('o que fazer hoje') ||
    lower.includes('o que focar') ||
    lower.includes('por onde começo') ||
    lower.includes('estou perdido');

  if (isPlanDayIntent) {
    const urgent = pendingTasks.find(t => t.priority === 'urgente');
    const heroTask = urgent || pendingTasks[0];

    return {
      replyText: `### 🎯 Prioridades Executivas para Hoje

${userName}, analisando suas **${pendingTasks.length} tarefas pendentes**, montei uma rota sem atrito para vencer a inércia:

1. **Hiperfoco Único (O Elefante do Dia):**
   ${heroTask ? `👉 **${heroTask.title}** (${heroTask.area} • ${heroTask.estimated_minutes} min)` : '👉 Definir as 3 prioridades essenciais de hoje.'}
   *Dica TDAH:* Não abra e-mails nem mensagens antes de rodar pelo menos 1 bloco de 45 min nessa entrega.

2. **Apoio da Tarde:**
   ${pendingTasks.slice(1, 3).map(t => `• ${t.title} (~${t.estimated_minutes} min)`).join('\n') || '• Nenhuma tarefa secundária restante.'}

3. **Status das Empresas:**
   • Littera: ${pendingTasks.filter(t => t.area === 'Littera').length} pendências ativas
   • Aura: ${pendingTasks.filter(t => t.area === 'Aura').length} pendências ativas

Deseja que eu inicie o timer agora na prioridade principal?`,
      suggestedPrompts: [
        `Iniciar foco em "${heroTask ? heroTask.title.slice(0, 22) : 'Hoje'}"`,
        'Concluir primeira tarefa',
        'Fatiar tarefa difícil'
      ]
    };
  }

  // ============================================================================
  // 8. CONVERSA GERAL / DIÁLOGO COM O ASSISTENTE
  // Resposta inteligente, contextual e prestativa
  // ============================================================================
  return {
    replyText: `Olá, **${userName}**! Estou pronto para ajudar você a executar suas metas sem dispersão.

Você pode conversar comigo ou me dar ordens diretas para eu implementar no sistema:
- 📅 *"Me ajude a planejar a semana"* ou *"Planejar meu dia"*
- ➕ *"Criar tarefa [nome da tarefa] no Littera"*
- 🎯 *"Concluir tarefa [nome]"*
- ✂️ *"Fatiar tarefa [nome] com IA"*
- ⏱️ *"Iniciar foco em [nome da tarefa]"*
- 🔒 *"Tive uma ideia de [novo negócio]"* (para descarrego no Estacionamento)

Como posso te ajudar agora?`,
    suggestedPrompts: [
      'Me ajude a planejar a semana',
      'O que focar hoje?',
      'Criar tarefa rápida',
      'Estacionar ideia [🔒]'
    ]
  };
}
