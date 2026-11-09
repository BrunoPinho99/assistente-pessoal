import { Task, Project, ContextArea, NavigationTab } from '../types';

export interface AssistantActionExecuted {
  type:
    | 'task_created'
    | 'task_updated'
    | 'task_completed'
    | 'task_deleted'
    | 'task_sliced'
    | 'project_created'
    | 'project_updated'
    | 'project_deleted'
    | 'idea_parked'
    | 'focus_started'
    | 'navigated';
  title: string;
  description?: string;
  details?: any;
}

export interface AssistantResponse {
  replyText: string;
  actionExecuted?: AssistantActionExecuted;
  actionsExecuted?: AssistantActionExecuted[];
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
  onUpdateTask?: (id: string, updates: Partial<Task>) => void;
  onDeleteTask?: (id: string) => void;
  onToggleTask: (taskId: string) => void;
  onSliceTask?: (taskId: string, microTasks: any[], mode: 'replace' | 'subtasks') => void;
  onAddProject?: (project: Omit<Project, 'id'>) => Project;
  onUpdateProject?: (id: string, updates: Partial<Project>) => void;
  onDeleteProject?: (id: string) => void;
  onParkIdea: (ideaText: string, area?: ContextArea) => Project;
  onStartFocus?: (task: Task) => void;
  onNavigateTab?: (tab: NavigationTab) => void;
}

/**
 * Processador do Chat de IA — Conversa Natural + Controle Total do Dashboard
 */
export async function processAssistantMessage(
  userInput: string,
  context: AssistantContext
): Promise<AssistantResponse> {
  const query = userInput.trim();

  const {
    userName,
    tasks,
    projects,
    activeProjects,
    parkedProjects,
    onAddTask,
    onUpdateTask,
    onDeleteTask,
    onToggleTask,
    onAddProject,
    onUpdateProject,
    onDeleteProject,
    onParkIdea,
    onStartFocus,
    onNavigateTab
  } = context;

  const pendingTasks = tasks.filter(t => t.status !== 'concluido');

  try {
    const savedGeminiKey =
      typeof window !== 'undefined'
        ? localStorage.getItem('personal_os_gemini_key') || localStorage.getItem('personal_os_ai_key') || ''
        : '';
    const savedOpenAiKey =
      typeof window !== 'undefined' ? localStorage.getItem('personal_os_openai_key') || '' : '';

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
          allProjects: projects.map(p => ({
            id: p.id,
            title: p.title,
            area: p.area,
            locked: Boolean(p.locked || p.isLocked)
          })),
          pendingTasks: pendingTasks.map(t => ({
            id: t.id,
            title: t.title,
            area: t.area,
            priority: t.priority,
            minutes: t.estimated_minutes
          })),
          parkedCount: parkedProjects.length
        }
      })
    });

    if (chatRes.ok) {
      const data = await chatRes.json();
      if (data.reply) {
        let cleanReply = data.reply;
        const executedList: AssistantActionExecuted[] = [];

        // Extrai blocos ```action ... ``` (suporta múltiplos blocos ou array JSON)
        const actionRegex = /```actions?\s*([\s\S]*?)\s*```/g;
        let match: RegExpExecArray | null;

        while ((match = actionRegex.exec(data.reply)) !== null) {
          cleanReply = cleanReply.replace(match[0], '').trim();
          try {
            const rawJson = JSON.parse(match[1].trim());
            const actionsArray = Array.isArray(rawJson) ? rawJson : [rawJson];

            for (const act of actionsArray) {
              if (!act || !act.type) continue;

              // 1. CRIAR TAREFA
              if (act.type === 'create_task' && act.title) {
                const area: ContextArea = act.area || 'Littera';
                const created = onAddTask({
                  title: act.title,
                  area,
                  category: area === 'Pessoal' ? 'pessoal' : 'profissional',
                  description: act.description || '',
                  priority: act.priority || 'media',
                  estimated_minutes: act.estimated_minutes || 25,
                  difficulty: 'medio',
                  energy_level: 'medium',
                  status: 'a_fazer',
                  subtasks: []
                });
                executedList.push({
                  type: 'task_created',
                  title: `Tarefa criada: ${created.title}`
                });
              }

              // 2. EDITAR TAREFA
              else if (act.type === 'update_task' && onUpdateTask) {
                const target = tasks.find(t =>
                  act.searchTitle
                    ? t.title.toLowerCase().includes(act.searchTitle.toLowerCase())
                    : t.id === act.id
                );
                if (target) {
                  const updates: Partial<Task> = {};
                  if (act.title) updates.title = act.title;
                  if (act.priority) updates.priority = act.priority;
                  if (act.area) updates.area = act.area;
                  if (act.status) updates.status = act.status;
                  if (act.estimated_minutes) updates.estimated_minutes = act.estimated_minutes;
                  if (act.description !== undefined) updates.description = act.description;
                  onUpdateTask(target.id, updates);
                  executedList.push({
                    type: 'task_updated',
                    title: `Tarefa atualizada: ${updates.title || target.title}`
                  });
                }
              }

              // 3. CONCLUIR TAREFA
              else if (act.type === 'complete_task') {
                const target = pendingTasks.find(t =>
                  act.searchTitle
                    ? t.title.toLowerCase().includes(act.searchTitle.toLowerCase())
                    : true
                );
                if (target) {
                  onToggleTask(target.id);
                  executedList.push({
                    type: 'task_completed',
                    title: `Tarefa concluída: ${target.title}`
                  });
                }
              }

              // 4. EXCLUIR TAREFA
              else if (act.type === 'delete_task' && onDeleteTask) {
                const target = tasks.find(t =>
                  act.searchTitle
                    ? t.title.toLowerCase().includes(act.searchTitle.toLowerCase())
                    : t.id === act.id
                );
                if (target) {
                  onDeleteTask(target.id);
                  executedList.push({
                    type: 'task_deleted',
                    title: `Tarefa removida: ${target.title}`
                  });
                }
              }

              // 5. CRIAR PROJETO
              else if (act.type === 'create_project' && act.title && onAddProject) {
                const isLocked = Boolean(act.locked);
                const nowIso = new Date().toISOString();
                const createdProj = onAddProject({
                  title: act.title,
                  name: act.title,
                  area: act.area || 'Littera',
                  category: isLocked ? 'parking' : 'business',
                  main_goal: act.description || act.title,
                  status: 'ativo',
                  slot: isLocked ? null : (act.slot || 'valvula'),
                  locked: isLocked,
                  isLocked,
                  description: act.description || '',
                  next_step: act.nextStep || 'Definir primeiro entregável',
                  stages: [
                    { id: 'st_' + Date.now() + '_1', title: 'Escopo inicial e validação', completed: false },
                    { id: 'st_' + Date.now() + '_2', title: 'Execução do MVP', completed: false }
                  ],
                  documents: [],
                  decision_history: [],
                  created_at: nowIso,
                  updated_at: nowIso
                });
                executedList.push({
                  type: 'project_created',
                  title: `Projeto criado: ${createdProj.title}`
                });
              }

              // 6. EDITAR PROJETO
              else if (act.type === 'update_project' && onUpdateProject) {
                const targetProj = projects.find(p =>
                  act.searchTitle
                    ? (p.title || p.name || '').toLowerCase().includes(act.searchTitle.toLowerCase())
                    : p.id === act.id
                );
                if (targetProj) {
                  const updates: Partial<Project> = {};
                  if (act.title) {
                    updates.title = act.title;
                    updates.name = act.title;
                  }
                  if (act.description !== undefined) updates.description = act.description;
                  if (act.nextStep !== undefined) updates.next_step = act.nextStep;
                  if (act.area) updates.area = act.area;
                  if (act.slot) updates.slot = act.slot;
                  if (typeof act.locked === 'boolean') {
                    updates.locked = act.locked;
                    updates.isLocked = act.locked;
                    updates.category = act.locked ? 'parking' : 'business';
                  }
                  onUpdateProject(targetProj.id, updates);
                  executedList.push({
                    type: 'project_updated',
                    title: `Projeto atualizado: ${updates.title || targetProj.title}`
                  });
                }
              }

              // 7. EXCLUIR PROJETO
              else if (act.type === 'delete_project' && onDeleteProject) {
                const targetProj = projects.find(p =>
                  act.searchTitle
                    ? (p.title || p.name || '').toLowerCase().includes(act.searchTitle.toLowerCase())
                    : p.id === act.id
                );
                if (targetProj) {
                  onDeleteProject(targetProj.id);
                  executedList.push({
                    type: 'project_deleted',
                    title: `Projeto removido: ${targetProj.title}`
                  });
                }
              }

              // 8. ESTACIONAR IDEIA
              else if (act.type === 'park_idea' && act.title) {
                const parked = onParkIdea(act.title);
                executedList.push({
                  type: 'idea_parked',
                  title: `Ideia salva: ${parked.title || act.title}`
                });
              }

              // 9. INICIAR FOCO
              else if (act.type === 'start_focus') {
                const target =
                  pendingTasks.find(t =>
                    act.searchTitle
                      ? t.title.toLowerCase().includes(act.searchTitle.toLowerCase())
                      : true
                  ) || pendingTasks[0];
                if (target && onStartFocus) {
                  onStartFocus(target);
                  executedList.push({
                    type: 'focus_started',
                    title: `Em foco: ${target.title}`
                  });
                }
              }

              // 10. NAVEGAR ABA
              else if (act.type === 'navigate' && act.tab && onNavigateTab) {
                onNavigateTab(act.tab as NavigationTab);
                executedList.push({
                  type: 'navigated',
                  title: `Tela aberta: ${act.tab}`
                });
              }
            }
          } catch (parseErr) {
            console.warn('[Action parse error]:', parseErr);
          }
        }

        return {
          replyText: cleanReply || 'Pronto, atualizado no dashboard!',
          actionExecuted: executedList[0],
          actionsExecuted: executedList
        };
      }
    } else {
      const errData = await chatRes.json().catch(() => ({}));
      return {
        replyText: errData.error || 'Não consegui responder agora. Tente novamente em instantes.'
      };
    }
  } catch (apiErr: any) {
    console.error('[AssistantAgent] Erro na chamada à IA:', apiErr);
    return {
      replyText: 'Erro de conexão com a IA. Verifique sua internet e tente novamente.'
    };
  }

  return {
    replyText: 'Sem resposta da IA.'
  };
}
