import { Task, Project, StudySubject, Habit, AIMessage } from '../types';

interface ContextPayload {
  tasks: Task[];
  projects: Project[];
  subjects: StudySubject[];
  habits: Habit[];
}

export class AIAssistantService {
  /**
   * Recurso TDAH: "Estou Perdido"
   * Analisa todas as pendências, ignora o ruído e devolve APENAS 1 ação clara com micropasso de 5 min.
   */
  static handleEstouPerdido(context: ContextPayload): {
    chosenTask: Task | null;
    firstStep: string;
    rationale: string;
    substeps: string[];
  } {
    const pendingTasks = context.tasks.filter(t => t.status !== 'concluido');

    if (pendingTasks.length === 0) {
      return {
        chosenTask: null,
        firstStep: 'Respirar fundo e registrar o que está na sua cabeça na Inbox.',
        rationale: 'Você não tem tarefas ativas no momento. Seu cérebro está livre de prazos imediatos!',
        substeps: [
          'Beba um copo de água fresca',
          'Escreva qualquer pensamento na captura rápida',
          'Escolha um projeto que você gosta para avançar 10 minutos'
        ]
      };
    }

    // Prioriza: 1. Urgente -> 2. Alta com Baixa/Média Energia -> 3. Qualquer com Baixa Energia (Quick Win)
    const urgent = pendingTasks.find(t => t.priority === 'urgente');
    const quickWin = pendingTasks.find(t => t.energy_level === 'low');
    const highPriority = pendingTasks.find(t => t.priority === 'alta');

    // Para quem está perdido, uma tarefa de baixa energia (quick win) é 10x melhor para quebrar a inércia do que uma urgente complexa
    const selected = quickWin || urgent || highPriority || pendingTasks[0];

    const firstStepsDict: Record<string, string> = {
      task_2: 'Abrir o editor e apenas escrever o cabeçalho da função quicksort() sem tentar resolver tudo.',
      task_3: 'Abrir a aba do e-mail, colar o endereço e escrever apenas "Olá professor, boa tarde."',
      task_4: 'Abrir a página inicial do Personal OS e apertar a tecla C para testar o modal.',
      task_5: 'Digitar "lâmpada amarela inteligente" no site de compras e adicionar a primeira aos favoritos.'
    };

    const firstStep = firstStepsDict[selected.id] || 
      `Gaste apenas 2 minutos abrindo o arquivo ou aplicativo necessário para: "${selected.title}". Você não precisa terminar agora.`;

    return {
      chosenTask: selected,
      firstStep,
      rationale: `Quando estamos sobrecarregados, o cérebro trava tentando resolver tudo junto. Escolhemos "${selected.title}" porque ela tem o menor atrito para ativar sua dopamina executiva.`,
      substeps: [
        'Elimine abas paralelas do navegador',
        'Coloque um timer de apenas 5 minutos',
        firstStep,
        'Se der vontade de parar aos 5 minutos, você pode. Mas quase sempre o início já destrava o restante.'
      ]
    };
  }

  /**
   * Recurso TDAH: Modo Emergência (Triagem sem Culpa)
   * Classifica as pendências em 4 quadrantes para eliminar o backlog sufocante.
   */
  static runEmergencyTriage(tasks: Task[]): {
    urgent: Task[];
    important: Task[];
    canWait: Task[];
    canDiscard: Task[];
  } {
    const pending = tasks.filter(t => t.status !== 'concluido');

    const urgent: Task[] = [];
    const important: Task[] = [];
    const canWait: Task[] = [];
    const canDiscard: Task[] = [];

    pending.forEach(t => {
      if (t.priority === 'urgente' || t.deadline) {
        urgent.push(t);
      } else if (t.priority === 'alta') {
        important.push(t);
      } else if (t.priority === 'media') {
        canWait.push(t);
      } else {
        canDiscard.push(t);
      }
    });

    return { urgent, important, canWait, canDiscard };
  }

  /**
   * Recurso TDAH: Fatiamento Inteligente de Tarefa (Task Slicing)
   */
  static sliceTaskIntoSubtasks(taskTitle: string): string[] {
    const lower = taskTitle.toLowerCase();

    if (lower.includes('estudo') || lower.includes('prova') || lower.includes('ler') || lower.includes('algoritmo')) {
      return [
        'Separar o material e fechar todas as abas irrelevantes (2 min)',
        'Ler apenas os títulos e o primeiro parágrafo do conteúdo (5 min)',
        'Escrever com as próprias palavras o conceito central em 2 linhas (10 min)',
        'Resolver 1 exercício guiado ou criar 2 flashcards de fixação (15 min)'
      ];
    }

    if (lower.includes('email') || lower.includes('mensagem') || lower.includes('contato')) {
      return [
        'Abrir a caixa de correio e criar rascunho em branco (1 min)',
        'Escrever o objetivo da mensagem em 1 frase direta (3 min)',
        'Revisar ortografia e clicar em Enviar (1 min)'
      ];
    }

    if (lower.includes('código') || lower.includes('bug') || lower.includes('feature') || lower.includes('desenvolver')) {
      return [
        'Reproduzir o comportamento esperado ou desenhar o fluxo no papel (5 min)',
        'Criar a assinatura da função ou componente isolado (10 min)',
        'Implementar a lógica central para o caso de sucesso mais simples (15 min)',
        'Rodar os testes e salvar commit com mensagem limpa (5 min)'
      ];
    }

    // Genérico inteligente
    return [
      `Preparar o ambiente físico ou digital para iniciar "${taskTitle.slice(0, 30)}..." (2 min)`,
      'Executar a primeira micro-etapa que não exige raciocínio complexo (5 min)',
      'Avançar na parte principal por 1 bloco de 20 minutos de foco',
      'Registrar onde parou caso precise pausar'
    ];
  }

  /**
   * Planejamento do Dia baseado em Capacidade
   */
  static generateDailyPlan(context: ContextPayload): string {
    const pending = context.tasks.filter(t => t.status !== 'concluido');
    const urgent = pending.filter(t => t.priority === 'urgente' || t.priority === 'alta');
    const lowEnergy = pending.filter(t => t.energy_level === 'low');
    const habitsToday = context.habits.slice(0, 3);

    return `### 🎯 Plano Realista para Hoje (Anti-Sobrecarga)

**1. Bloco de Ativação Inicial (Manhã):**
- Hábito rápido: ${habitsToday[0]?.title || 'Beber água e alongar'}
- Tarefa de entrada rápida (5 min): ${lowEnergy[0]?.title || 'Organizar a mesa'}

**2. O Foco Principal (Hiperfoco de 45-60 min):**
${urgent.length > 0 
  ? `- **${urgent[0].title}** (Prioridade alta - faça antes de abrir redes sociais)` 
  : '- Escolha um módulo de projeto para avançar sem pressa.'}

**3. Tarefas de Apoio (Tarde):**
${pending.slice(1, 3).map(t => `- ${t.title} (~${t.estimated_minutes} min)`).join('\n') || '- Nenhuma tarefa adicional exigida.'}

💡 *Lembre-se: Concluir 1 tarefa importante vale 10x mais do que iniciar 5 tarefas e deixar todas pela metade.*`;
  }

  /**
   * Revisão Semanal sem Culpa
   */
  static generateWeeklyReview(context: ContextPayload): string {
    const completedTasks = context.tasks.filter(t => t.status === 'concluido');
    const pendingTasks = context.tasks.filter(t => t.status !== 'concluido');
    const activeProjects = context.projects.filter(p => p.status === 'ativo');

    return `### 📊 Revisão da Semana: Aprendizado & Consistência

**Vitórias Concretas:**
- Você concluiu **${completedTasks.length} tarefas** registradas!
- Projetos em movimento: **${activeProjects.map(p => p.title).join(', ') || 'Nenhum'}**.

**Ajuste de Rota (Sem Autojulgamento):**
- Restam **${pendingTasks.length} tarefas** no seu radar.
- Algumas tarefas estão paradas há dias? Isso geralmente indica que elas são vagas demais ou que o primeiro passo não está óbvio.
- Recomendo rodar o **Modo Emergência** para descartar aquilo que perdeu o sentido e desinchar a mente.

**Foco para os próximos dias:**
Escolha **1 único projeto** para ser a estrela da sua próxima semana.`;
  }

  /**
   * Resposta do Chat do Assistente IA
   */
  static async processUserQuery(prompt: string, context: ContextPayload): Promise<AIMessage> {
    const lower = prompt.toLowerCase();

    // 1. Comando: Estou Perdido
    if (lower.includes('perdido') || lower.includes('perdida') || lower.includes('por onde começo') || lower.includes('socorro') || lower.includes('sobrecarregado')) {
      const guidance = this.handleEstouPerdido(context);
      return {
        id: 'ai_' + Date.now(),
        sender: 'assistant',
        timestamp: new Date().toISOString(),
        content: `**Calma, vamos respirar juntos. O cérebro TDAH trava quando vê a montanha inteira.**\n\n${guidance.rationale}\n\n👉 **Sua ÚNICA missão agora:**\n\n**${guidance.chosenTask ? guidance.chosenTask.title : 'Respiro Consciente'}**\n\n*Micro-passo de 5 min:* ${guidance.firstStep}\n\nPodemos iniciar o timer de foco nessa ação agora?`,
        actions: guidance.chosenTask ? [
          { label: 'Iniciar Timer nesta tarefa', action_type: 'start_focus', payload: guidance.chosenTask },
          { label: 'Fatiar em passos menores', action_type: 'break_task', payload: guidance.chosenTask }
        ] : []
      };
    }

    // 2. Comando: Planejar o dia
    if (lower.includes('planejar') || lower.includes('meu dia') || lower.includes('agenda') || lower.includes('rotina')) {
      return {
        id: 'ai_' + Date.now(),
        sender: 'assistant',
        timestamp: new Date().toISOString(),
        content: this.generateDailyPlan(context),
        actions: [
          { label: 'Ver Meu Dia', action_type: 'plan_day' }
        ]
      };
    }

    // 3. Comando: Fatiar / Quebrar tarefa
    if (lower.includes('fatiar') || lower.includes('quebrar') || lower.includes('subtarefa') || lower.includes('dividir')) {
      const targetTask = context.tasks.find(t => t.status !== 'concluido' && t.difficulty === 'dificil') || context.tasks[0];
      const steps = this.sliceTaskIntoSubtasks(targetTask ? targetTask.title : prompt);
      
      return {
        id: 'ai_' + Date.now(),
        sender: 'assistant',
        timestamp: new Date().toISOString(),
        content: `Dividi a tarefa **"${targetTask?.title || prompt}"** em micro-passos executáveis para você não sentir paralisia de escolha:\n\n${steps.map((s, idx) => `${idx + 1}. ${s}`).join('\n')}\n\nQual desses passos você consegue fazer agora mesmo?`,
        actions: targetTask ? [
          { label: 'Aplicar como subtarefas', action_type: 'break_task', payload: { taskId: targetTask.id, steps } }
        ] : []
      };
    }

    // 4. Comando: Modo Emergência / Descarte
    if (lower.includes('emergencia') || lower.includes('emergência') || lower.includes('acumulou') || lower.includes('atrasad') || lower.includes('triagem')) {
      const triage = this.runEmergencyTriage(context.tasks);
      return {
        id: 'ai_' + Date.now(),
        sender: 'assistant',
        timestamp: new Date().toISOString(),
        content: `### 🚨 Triagem de Emergência Ativada\n\nAnalisei suas ${context.tasks.filter(t => t.status !== 'concluido').length} tarefas pendentes e agrupei sem culpa:\n\n- 🔥 **Urgentes (${triage.urgent.length}):** ${triage.urgent.map(t => t.title).slice(0, 2).join(', ') || 'Nenhuma'}\n- ⚡ **Importantes (${triage.important.length}):** ${triage.important.map(t => t.title).slice(0, 2).join(', ') || 'Nenhuma'}\n- ⏳ **Podem Esperar (${triage.canWait.length}):** Não toque nelas hoje.\n- 🗑️ **Podem ser Descartadas (${triage.canDiscard.length}):** Tarefas antigas que só estão gerando peso mental.\n\nQuer abrir a triagem interativa para limpar o backlog?`,
        actions: [
          { label: 'Abrir Painel de Triagem', action_type: 'emergency_triage' }
        ]
      };
    }

    // 5. Comando: Revisão semanal
    if (lower.includes('revisão') || lower.includes('revisao') || lower.includes('semana') || lower.includes('como fui')) {
      return {
        id: 'ai_' + Date.now(),
        sender: 'assistant',
        timestamp: new Date().toISOString(),
        content: this.generateWeeklyReview(context),
        actions: [
          { label: 'Ver Insights & Tendências', action_type: 'weekly_review' }
        ]
      };
    }

    // Resposta padrão orientada a ação
    return {
      id: 'ai_' + Date.now(),
      sender: 'assistant',
      timestamp: new Date().toISOString(),
      content: `Entendido! Estou com acesso ao seu contexto de **${context.tasks.filter(t => t.status !== 'concluido').length} tarefas**, **${context.projects.filter(p => p.status === 'ativo').length} projetos ativos** e **${context.subjects.length} disciplinas**.\n\nComo seu copiloto executivo, posso:\n- 🎯 **Planejar seu dia** sem sobrecarga\n- ✂️ **Fatiar tarefas difíceis** em micropassos de 5 minutos\n- 🆘 **Te ajudar se estiver perdido(a)**\n- 🚨 **Fazer triagem de emergência** em tarefas acumuladas`,
      actions: [
        { label: 'Estou perdido(a)', action_type: 'emergency_triage' },
        { label: 'Planejar meu dia', action_type: 'plan_day' },
        { label: 'Fatiar tarefa difícil', action_type: 'break_task' }
      ]
    };
  }
}

