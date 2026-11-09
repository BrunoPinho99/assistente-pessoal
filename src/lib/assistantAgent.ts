import { Task, Project, ContextArea, NavigationTab } from '../types';

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
 * Processador do Copiloto de IA — 100% Generativo (Google Gemini)
 * Todas as mensagens vão diretamente ao modelo de linguagem. Não há respostas estáticas
 * nem regras de chatbot pré-programadas.
 */
export async function processAssistantMessage(
  userInput: string,
  context: AssistantContext
): Promise<AssistantResponse> {
  const query = userInput.trim();

  const {
    userName,
    tasks,
    activeProjects,
    parkedProjects,
    onAddTask,
    onToggleTask,
    onParkIdea,
    onStartFocus,
    onNavigateTab
  } = context;

  const pendingTasks = tasks.filter(t => t.status !== 'concluido');

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

        // Extrai e executa ações geradas genuinamente pelo modelo
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
                description: `Criada pelo Copiloto IA para ${userName}.`,
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
    } else {
      const errData = await chatRes.json().catch(() => ({}));
      return {
        replyText: errData.error || 'Não foi possível obter resposta da IA no momento. Tente novamente em instantes.'
      };
    }
  } catch (apiErr: any) {
    console.error('[AssistantAgent] Erro na chamada à IA:', apiErr);
    return {
      replyText: 'Erro de conexão com o serviço de IA. Verifique sua conexão e tente novamente.'
    };
  }

  return {
    replyText: 'Sem resposta da IA.'
  };
}
