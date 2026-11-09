import { Task, Project, ContextArea, NavigationTab } from '../types';
import { structureDopamineIdea, sliceTaskWithAI } from './focusProtection';
import { evaluateCognitiveIntent } from './cognitiveBrain';

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

export interface AssistantContext {
  userName: string;
  tasks: Task[];
  projects: Project[];
  activeProjects: Project[];
  parkedProjects: Project[];
  history?: Array<{ role: 'user' | 'assistant' | 'model'; text: string }>;
  apiKey?: string;
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

    let replyText = '🔒 Ideia estruturada e trancada no arquivo morto. Foco mantido nos projetos ativos.';
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
  // 6. PROCESSAMENTO COM IA GENERATIVA REAL (/api/chat - Google Gemini)
  // Envia contexto vivo do sistema e histórico completo da conversa
  // ============================================================================
  try {
    const savedGeminiKey = typeof window !== 'undefined' 
      ? localStorage.getItem('personal_os_gemini_key') || localStorage.getItem('personal_os_ai_key') || '' 
      : '';
    const savedOpenAiKey = typeof window !== 'undefined' 
      ? localStorage.getItem('personal_os_openai_key') || '' 
      : '';

    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (savedGeminiKey) headers['x-gemini-key'] = savedGeminiKey;
    if (savedOpenAiKey) headers['x-openai-key'] = savedOpenAiKey;

    const chatRes = await fetch('/api/chat', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        message: query,
        history: context.history || [],
        geminiApiKey: savedGeminiKey,
        openAiApiKey: savedOpenAiKey,
        context: {
          userName,
          activeProjects: activeProjects.map(p => p.title),
          pendingTasks: pendingTasks.map(t => ({ id: t.id, title: t.title, area: t.area, minutes: t.estimated_minutes })),
          parkedCount: parkedProjects.length
        }
      })
    });

    if (chatRes.ok) {
      const data = await chatRes.json();
      if (data.reply) {
        let cleanReply = data.reply;
        let actionExecuted: AssistantActionExecuted | undefined = undefined;

        // Extrai e executa ações de verdade geradas pela IA Generativa
        const actionMatch = cleanReply.match(/```action\s*([\s\S]*?)\s*```/);
        if (actionMatch && actionMatch[1]) {
          try {
            const parsedAction = JSON.parse(actionMatch[1].trim());
            cleanReply = cleanReply.replace(actionMatch[0], '').trim();

            if (parsedAction.type === 'create_task' && parsedAction.title) {
              const created = onAddTask({
                title: parsedAction.title,
                area: parsedAction.area || 'Littera',
                category: parsedAction.area === 'Pessoal' ? 'pessoal' : 'profissional',
                description: `Criada pelo Copiloto IA a pedido de ${userName}.`,
                priority: parsedAction.priority || 'media',
                estimated_minutes: parsedAction.estimated_minutes || 25,
                difficulty: 'medio',
                energy_level: 'medium',
                status: 'inbox',
                subtasks: []
              });
              actionExecuted = {
                type: 'task_created',
                title: created.title,
                description: `Área: ${created.area} • Estimativa: ${created.estimated_minutes} min`
              };
            } else if (parsedAction.type === 'complete_task') {
              const target = pendingTasks.find(t => 
                parsedAction.searchTitle ? t.title.toLowerCase().includes(parsedAction.searchTitle.toLowerCase()) : true
              );
              if (target) {
                onToggleTask(target.id);
                actionExecuted = {
                  type: 'task_completed',
                  title: target.title,
                  description: 'Marcada como concluída no sistema'
                };
              }
            } else if (parsedAction.type === 'start_focus') {
              const target = pendingTasks.find(t => 
                parsedAction.searchTitle ? t.title.toLowerCase().includes(parsedAction.searchTitle.toLowerCase()) : true
              ) || pendingTasks[0];
              if (target && onStartFocus) {
                onStartFocus(target);
                if (onNavigateTab) onNavigateTab('hoje');
                actionExecuted = {
                  type: 'focus_started',
                  title: target.title,
                  description: `Timer ativado para ${target.estimated_minutes} min`
                };
              }
            } else if (parsedAction.type === 'park_idea' && parsedAction.title) {
              const parked = onParkIdea(parsedAction.title);
              actionExecuted = {
                type: 'idea_parked',
                title: parked.title || parsedAction.title,
                description: 'Guardado no Estacionamento de Dopamina [🔒]'
              };
            }
          } catch (parseErr) {
            console.warn('[Action parse error]:', parseErr);
          }
        }

        return {
          replyText: cleanReply,
          actionExecuted,
          suggestedPrompts: data.suggestedPrompts || [
            'Qual tarefa tem o maior impacto hoje?',
            'Fatiar esta tarefa em passos menores',
            'Iniciar bloco de foco de 25 min'
          ]
        };
      }
    }
  } catch (apiErr) {
    console.warn('[AssistantAgent] Erro na API generativa, acionando fallback:', apiErr);
  }

  // Fallback para o motor cognitivo caso a API externa falhe
  return evaluateCognitiveIntent(query, context);
}
