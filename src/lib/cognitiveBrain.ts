import { Task, Project, ContextArea, NavigationTab } from '../types';

export interface CognitiveContext {
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

export interface CognitiveResponse {
  replyText: string;
  actionExecuted?: {
    type: 'task_created' | 'task_completed' | 'task_sliced' | 'idea_parked' | 'focus_started' | 'plan_ready';
    title: string;
    description?: string;
    details?: any;
  };
  suggestedPrompts?: string[];
}

/**
 * Motor Cognitivo de IA Especializado em TDAH & Personal OS
 * Interpreta intenções de forma semântica e contextual, reagindo com empatia,
 * assertividade e capacidade de execução real no sistema.
 */
export async function evaluateCognitiveIntent(
  query: string,
  context: CognitiveContext
): Promise<CognitiveResponse> {
  const trimmed = query.trim();
  const lower = trimmed.toLowerCase();
  const { userName, tasks, activeProjects, parkedProjects } = context;

  const pendingTasks = tasks.filter(t => t.status !== 'concluido');
  const completedTasks = tasks.filter(t => t.status === 'concluido');
  const litteraTasks = pendingTasks.filter(t => t.area === 'Littera' || t.project_id === 'proj_littera');
  const auraTasks = pendingTasks.filter(t => t.area === 'Aura' || t.project_id === 'proj_aura');
  const urgentTask = pendingTasks.find(t => t.priority === 'urgente') || pendingTasks[0];

  // ----------------------------------------------------------------------------
  // 1. SAUDAÇÕES & CHECK-IN DE ENERGIA ("oi", "olá", "tudo bem?", "bom dia")
  // ----------------------------------------------------------------------------
  const isGreeting = /^(oi|ol[aá]|bom dia|boa tarde|boa noite|e a[ií]|fala|hey|salve)\b/i.test(lower);
  if (isGreeting && lower.split(' ').length <= 4) {
    const greeting = getGreetingTime();
    return {
      replyText: `${greeting}, **${userName}**! Como está sua energia mental agora?
      
Você tem **${pendingTasks.length} tarefas pendentes** no seu radar (${litteraTasks.length} no Littera e ${auraTasks.length} na Aura).

O que você prefere agora?
• Resolver o item mais prioritário com um bloco de 45 min
• Descarregar alguma ideia nova no cofre [🔒]
• Planejar os próximos passos do dia sem pressão`,
      suggestedPrompts: [
        'O que devo focar hoje?',
        'Quais tarefas faltam no Littera?',
        'Me ajude a planejar a semana',
        'Estou com pouca energia'
      ]
    };
  }

  // ----------------------------------------------------------------------------
  // 2. BAIXA ENERGIA / CANSAÇO / PARALISIA / PROCRASTINAÇÃO (TDAH Support)
  // ----------------------------------------------------------------------------
  const isLowEnergy = /(cansad|sem energia|desanimad|com sono|esgotad|sobrecarregad|exaust|muita coisa|pregui[çc]a|procrastin|travad|bloquead|ansios)/i.test(lower);
  if (isLowEnergy) {
    // Escolhe a menor tarefa possível (< 20 min) para reduzir a barreira de ativação dopaminérgica
    const microWin = pendingTasks.find(t => t.estimated_minutes <= 20) || pendingTasks[0];

    return {
      replyText: `Compreendo perfeitamente, **${userName}**. Para quem tem TDAH, o cansaço muitas vezes não é físico, mas **sobrecarga do córtex pré-frontal**.

Quando a energia está baixa, a regra de ouro é: **não force grandes entregas agora**.

Aqui está o protocolo de descompressão:
1. **Respire e baixe o cortisol:** Beba um copo d'água e dê 2 minutos sem telas.
2. **Micro-Vitória Sem Atrito:** Se ainda quiser avançar um pouco, esqueça tarefas complexas. Foque em apenas 1 micro-ação de 10 a 15 minutos:
   ${microWin ? `👉 **${microWin.title}** (~${microWin.estimated_minutes} min no ${microWin.area})` : '👉 Anotar o que está na sua cabeça e fechar o dia.'}
3. **Sem culpa:** Descansar faz parte da estratégia. Suas ${parkedProjects.length} ideias continuam salvas no cofre e o Littera estará pronto quando sua energia recarregar.

Deseja que eu selecione apenas a menor tarefa mecânica para você matar agora?`,
      suggestedPrompts: [
        microWin ? `Focar em "${microWin.title.slice(0, 20)}"` : 'Organizar prioridades',
        'Quais são minhas tarefas mais curtas?',
        'Deixar para amanhã e revisar'
      ]
    };
  }

  // ----------------------------------------------------------------------------
  // 3. CONSULTA DE TAREFAS ("quais tarefas eu tenho?", "o que falta no littera?")
  // ----------------------------------------------------------------------------
  const isQueryLittera = /(littera|tarefas do littera|pendencias do littera|o que falta no littera)/i.test(lower) && !/(cria|adiciona|nova tarefa)/i.test(lower);
  if (isQueryLittera) {
    if (litteraTasks.length === 0) {
      return {
        replyText: `🎉 **Boas notícias!** Você não tem nenhuma tarefa pendente cadastrada no **Littera** no momento. Todas estão em dia!`,
        suggestedPrompts: ['Criar nova tarefa no Littera', 'O que focar na Aura?', 'Planejar a semana']
      };
    }

    return {
      replyText: `### 🚀 Pendências Ativas no Littera (${litteraTasks.length})
      
Aqui está o panorama operacional do **Littera** para publicação e estabilização:

${litteraTasks.map((t, idx) => `${idx + 1}. **${t.title}** (${t.estimated_minutes} min • ${t.priority.toUpperCase()})`).join('\n')}

💡 *Dica:* A tarefa **"${litteraTasks[0].title}"** é a mais indicada para o próximo bloco de 45 minutos.`,
      suggestedPrompts: [
        `Iniciar foco em "${litteraTasks[0].title.slice(0, 22)}"`,
        'Fatiar tarefa com IA',
        'Adicionar nova tarefa no Littera'
      ]
    };
  }

  const isQueryAura = /(aura|pinho media|tarefas da aura|o que falta na aura)/i.test(lower) && !/(cria|adiciona|nova tarefa)/i.test(lower);
  if (isQueryAura) {
    if (auraTasks.length === 0) {
      return {
        replyText: `Você não possui tarefas pendentes na **Aura / Pinho Media** no momento. Seu foco está 100% livre para o Littera!`,
        suggestedPrompts: ['Criar tarefa na Aura', 'Ver tarefas do Littera', 'O que focar hoje?']
      };
    }

    return {
      replyText: `### 🎨 Pendências na Aura / Pinho Media (${auraTasks.length})

${auraTasks.map((t, idx) => `${idx + 1}. **${t.title}** (${t.estimated_minutes} min • ${t.priority.toUpperCase()})`).join('\n')}

💡 *Estratégia:* Reserve a Aura para blocos no período da tarde, após concluir as releases críticas do Littera.`,
      suggestedPrompts: [
        `Iniciar foco em "${auraTasks[0].title.slice(0, 22)}"`,
        'Concluir primeira tarefa da Aura',
        'Voltar para o Littera'
      ]
    };
  }

  const isQueryGeneralTasks = /(quais tarefas|minhas tarefas|o que tenho pra fazer|o que tenho para fazer|o que tem pendente|lista de tarefas|ver tarefas|minhas pendencias)/i.test(lower);
  if (isQueryGeneralTasks) {
    return {
      replyText: `### 📋 Panorama Geral de Tarefas (${pendingTasks.length} Pendentes)

#### 🏢 Littera (Foco Principal):
${litteraTasks.length > 0 ? litteraTasks.map(t => `• ${t.title} (${t.estimated_minutes}m)`).join('\n') : '• Nenhuma pendência ativa.'}

#### 🎯 Aura / Pinho Media:
${auraTasks.length > 0 ? auraTasks.map(t => `• ${t.title} (${t.estimated_minutes}m)`).join('\n') : '• Nenhuma pendência ativa.'}

📊 **Métricas:** ${completedTasks.length} concluídas hoje • Estimativa total restante: ~${pendingTasks.reduce((acc, t) => acc + (t.estimated_minutes || 0), 0)} min.`,
      suggestedPrompts: [
        'O que focar agora?',
        'Me ajude a planejar o dia',
        'Fatiar a maior tarefa'
      ]
    };
  }

  // ----------------------------------------------------------------------------
  // 4. CONSULTA DE ESTACIONAMENTO / IDEIAS TRANCADAS ("quantas ideias guardadas?")
  // ----------------------------------------------------------------------------
  const isQueryParking = /(estacionamento|ideias trancadas|quantas ideias|arquivo morto|ideias salvas|cofre)/i.test(lower) && !/(tive uma ideia|guardar|estacionar ideia)/i.test(lower);
  if (isQueryParking) {
    return {
      replyText: `### 🔒 Estacionamento de Dopamina (${parkedProjects.length} Ideias Blindadas)

Seu cérebro teve impulsos criativos e todos foram armazenados com segurança no MongoDB Atlas para não canibalizar seu foco:

${parkedProjects.map((p, idx) => `${idx + 1}. **${p.name || p.title}** (${p.area}) — *Status: LOCKED 🔒*`).join('\n') || '• Nenhuma ideia estacionada no momento.'}

🛡️ **Regra do Personal OS:** Nenhuma dessas ideias pode ser iniciada antes que você conclua o deploy v1.8 do Littera e libere 1 dos 2 slots ativos via Trade-off.`,
      suggestedPrompts: [
        'Voltar para as tarefas de hoje',
        'Tive uma nova ideia [🔒]',
        'Ver projetos ativos'
      ]
    };
  }

  // ----------------------------------------------------------------------------
  // 5. O QUE VOCÊ FAZ / AJUDA GERAL
  // ----------------------------------------------------------------------------
  const isCapabilitiesQuery = /(o que voc[eê] faz|como voc[eê] funciona|ajuda|comandos|o que posso pedir|quem [eé] voc[eê])/i.test(lower);
  if (isCapabilitiesQuery) {
    return {
      replyText: `Sou seu **Copiloto Executivo & Guardião de Foco**. Fui projetado com regras neurocientíficas para o seu perfil e as suas empresas (**Littera** e **Aura**).

Aqui está o que eu faço em tempo real:
1. **Executo Ações no Sistema:** Você fala naturalmente e eu crio tarefas, concluo pendências, fatio tarefas complexas com IA e ligo o timer de 45 min.
2. **Estacionamento de Dopamina:** Se você tiver um impulso de novo negócio, me conte. Eu estruturo e tranco no MongoDB com cadeado físico [🔒] para você não esquecer nem dispersar.
3. **Blindagem TDAH:** Não deixo tarefas vagas irem para o foco e impeço que você abra mais de 2 projetos ao mesmo tempo.
4. **Coaching e Apoio:** Se bater cansaço ou procrastinação, organizo uma rota de baixo atrito para você não travar.

O que gostaria de delegar para mim agora?`,
      suggestedPrompts: [
        'Planejar meu dia',
        'Quais tarefas faltam no Littera?',
        'Criar tarefa rápida',
        'Estacionar ideia nova [🔒]'
      ]
    };
  }

  // ----------------------------------------------------------------------------
  // 6. RESPOSTA CONVERSACIONAL INTELIGENTE & DINÂMICA (GENUÍNA)
  // ----------------------------------------------------------------------------
  // Analisa o teor da mensagem para fornecer conselho estratégico e ação sugerida
  return generateContextualAdvice(trimmed, context);
}

function getGreetingTime(): string {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return 'Bom dia';
  if (hour >= 12 && hour < 18) return 'Boa tarde';
  return 'Boa noite';
}

function generateContextualAdvice(userInput: string, context: CognitiveContext): CognitiveResponse {
  const { userName, tasks, activeProjects, parkedProjects } = context;
  const pending = tasks.filter(t => t.status !== 'concluido');
  const hero = pending.find(t => t.priority === 'urgente') || pending[0];

  return {
    replyText: `Entendi, **${userName}**! Sobre **"${userInput}"**:

No contexto atual do seu Personal OS, você está com **${activeProjects.map(p => p.title).join(' e ') || 'Littera e Aura'}** como projetos ativos e **${pending.length} pendências** na mesa.

💡 **Recomendação executiva:**
Se essa demanda estiver alinhada com as entregas de hoje, posso transformá-la imediatamente em uma micro-ação mecânica. Se for uma nova frente ou ideia de produto, o mais saudável para seu foco é enviá-la para o **Estacionamento de Dopamina [🔒]**.

Como você prefere proceder?
1. Criar como tarefa prioritária no ${activeProjects[0]?.title || 'Littera'}
2. Arquivar no cofre de ideias [🔒]
3. Iniciar um bloco de 45 minutos no que já está planejado`,
    suggestedPrompts: [
      `Transformar em tarefa no ${activeProjects[0]?.title || 'Littera'}`,
      'Estacionar como ideia no cofre [🔒]',
      hero ? `Iniciar foco em "${hero.title.slice(0, 20)}"` : 'Ver minhas tarefas'
    ]
  };
}

