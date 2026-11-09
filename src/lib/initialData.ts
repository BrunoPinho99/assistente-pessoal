import { Project, Task, StudySubject, Flashcard, Habit, Note, FocusSession } from '../types';

export const INITIAL_PROJECTS: Project[] = [
  {
    id: 'proj_littera',
    name: 'Littera Platform',
    title: 'Littera Platform',
    area: 'Littera',
    description: 'Infraestrutura SaaS, engine de publicação e deploy de microsserviços.',
    category: 'business',
    main_goal: 'Finalizar deploy estável da v2.4 com isolamento de tenant.',
    start_date: '2026-10-01',
    deadline: '2026-11-20',
    status: 'ativo',
    slot: 'ancora', // Slot 1 | A Âncora (Projeto Primário ~70% de banda)
    locked: false, // ⚡ Ativo (Slot 1 de 3)
    isLocked: false,
    unlockConditions: [],
    stages: [
      { id: 'st_l1', title: 'Testes de regressão em Staging', completed: true },
      { id: 'st_l2', title: 'Script de migração de banco e secrets', completed: true },
      { id: 'st_l3', title: 'Deploy no cluster de Produção e Health Check', completed: false },
    ],
    next_step: 'Executar pipeline de deploy e monitorar logs de latência.',
    documents: [],
    decision_history: [],
    created_at: '2026-10-01T10:00:00.000Z',
    updated_at: '2026-11-07T14:00:00.000Z'
  },
  {
    id: 'proj_aura',
    name: 'Aura Studio & Design System',
    title: 'Aura Studio & Design System',
    area: 'Aura',
    description: 'Identidade visual, biblioteca de componentes espaciais e prototipagem interativa.',
    category: 'business',
    main_goal: 'Entregar o kit de componentes v1.0 no Figma e tokens em Tailwind.',
    start_date: '2026-10-15',
    deadline: '2026-11-30',
    status: 'ativo',
    slot: 'satelite', // Slot 2 | O Satélite (Projeto Secundário - Tático / Sprints curtos)
    locked: false, // ⚡ Ativo (Slot 2 de 3)
    isLocked: false,
    unlockConditions: [],
    stages: [
      { id: 'st_a1', title: 'Tokens semânticos e paleta de alto contraste', completed: true },
      { id: 'st_a2', title: 'Componentes de cards Bento com efeito glass', completed: true },
      { id: 'st_a3', title: 'Documentação de microinterações e transições', completed: false }
    ],
    next_step: 'Ajustar o contraste tipográfico dos cards no Dark Mode.',
    documents: [],
    decision_history: [],
    created_at: '2026-10-15T14:00:00.000Z',
    updated_at: '2026-11-06T18:00:00.000Z'
  },
  {
    id: 'proj_idp',
    name: 'IDP — Governança e Regulação de IA',
    title: 'IDP — Governança e Regulação de IA',
    area: 'IDP',
    description: 'Pesquisa acadêmica, seminários de pós-graduação e publicação científica.',
    category: 'academic',
    main_goal: 'Submissão do paper final e apresentação no simpósio.',
    start_date: '2026-09-01',
    deadline: '2026-12-05',
    status: 'ativo',
    slot: null,
    locked: true, // 🔒 Trancado no Estacionamento de Ideias (Aguardando vaga nos 3 slots)
    isLocked: true,
    unlockConditions: [
      'Publicar v1.8 do Littera em produção',
      'Liberar 1 dos 3 slots de banda (Regra da Substituição)'
    ],
    stages: [
      { id: 'st_i1', title: 'Fichamento dos textos base e acórdãos', completed: true },
      { id: 'st_i2', title: 'Redação do capítulo metodológico', completed: true },
      { id: 'st_i3', title: 'Revisão final com o orientador', completed: false }
    ],
    next_step: 'Finalizar conclusão do ensaio e formatar referências ABNT.',
    documents: [],
    decision_history: [],
    created_at: '2026-09-01T08:00:00.000Z',
    updated_at: '2026-11-07T10:00:00.000Z'
  }
];

export const INITIAL_TASKS: Task[] = [
  {
    id: 'task_prioridades_empresas',
    title: 'Definir as 3 prioridades essenciais de hoje',
    area: 'Littera',
    description: 'Escrever no topo do dia para não se perder em tarefas secundárias.',
    category: 'profissional',
    project_id: 'proj_littera',
    priority: 'urgente',
    estimated_minutes: 45,
    difficulty: 'medio',
    energy_level: 'high',
    status: 'em_andamento',
    deadline: 'Hoje, até 10h',
    subtasks: [
      { id: 'sub_pe1', title: 'Mapear entregas críticas do Littera', completed: true },
      { id: 'sub_pe2', title: 'Alinhar blockers com Tales (Pinho Media)', completed: false }
    ],
    notes: 'Prioridade Urgente · Trabalho',
    context_resume: {
      wasDoing: 'Listando as 3 tarefas decisivas do dia',
      stoppedAt: 'Alinhamento do cronograma com a equipe',
      nextAction: 'Executar a primeira prioridade sem distrações'
    },
    created_at: '2026-11-08T07:30:00.000Z'
  },
  {
    id: 'task_quicksort',
    title: 'Revisar algoritmos de ordenação rápida (Quicksort)',
    area: 'IDP',
    description: 'Implementar a função de partição e rodar 3 testes de borda.',
    category: 'academico',
    project_id: 'proj_idp',
    priority: 'alta',
    estimated_minutes: 45,
    difficulty: 'dificil',
    energy_level: 'high',
    status: 'em_andamento',
    deadline: 'Hoje, até 11h',
    subtasks: [
      { id: 'sub_qs1', title: 'Implementar função partition com pivô mediano', completed: true },
      { id: 'sub_qs2', title: 'Rodar 3 testes de borda com arrays já ordenados', completed: false }
    ],
    notes: 'Prioridade Alta · Estudo',
    context_resume: {
      wasDoing: 'Implementando a lógica de particionamento',
      stoppedAt: 'Verificação dos índices left/right',
      nextAction: 'Executar os 3 testes unitários de borda'
    },
    created_at: '2026-11-08T08:00:00.000Z'
  },
  {
    id: 'task_landing_littera',
    title: 'Finalizar landing page do Littera',
    area: 'Littera',
    description: 'Ajustar copy de conversão e animações de scroll da home.',
    category: 'profissional',
    project_id: 'proj_littera',
    priority: 'urgente',
    estimated_minutes: 35,
    difficulty: 'medio',
    energy_level: 'high',
    status: 'a_fazer',
    deadline: 'Hoje',
    subtasks: [
      { id: 'sub_ll1', title: 'Ajustar hero text e CTA principal', completed: true },
      { id: 'sub_ll2', title: 'Verificar responsividade mobile', completed: false }
    ],
    created_at: '2026-11-08T08:30:00.000Z'
  },
  {
    id: 'task_arq_sistemas',
    title: 'Estudar arquitetura de sistemas',
    area: 'IDP',
    description: 'Fichamento dos padrões de mensageria assíncrona e event sourcing.',
    category: 'academico',
    project_id: 'proj_idp',
    priority: 'media',
    estimated_minutes: 45,
    difficulty: 'medio',
    energy_level: 'medium',
    status: 'a_fazer',
    deadline: 'Estudos',
    subtasks: [
      { id: 'sub_as1', title: 'Revisar diagrama de filas e dead-letter', completed: false }
    ],
    created_at: '2026-11-08T09:00:00.000Z'
  },
  {
    id: 'task_reuniao_tales',
    title: 'Reunião com Tales – Pinho Media',
    area: 'Aura',
    description: 'Alinhamento estratégico do trimestre e novos entregáveis.',
    category: 'profissional',
    project_id: 'proj_aura',
    priority: 'media',
    estimated_minutes: 30,
    difficulty: 'facil',
    energy_level: 'medium',
    status: 'a_fazer',
    deadline: 'Trabalho',
    subtasks: [
      { id: 'sub_rt1', title: 'Montar pauta da conversa', completed: true }
    ],
    created_at: '2026-11-08T10:00:00.000Z'
  },
  {
    id: 'task_highlight',
    title: 'Publicar o Littera em produção',
    area: 'Littera',
    description: 'Validar o checklist de release e executar o deploy da v1.8.',
    category: 'profissional',
    project_id: 'proj_littera',
    priority: 'urgente',
    estimated_minutes: 45,
    difficulty: 'dificil',
    energy_level: 'high',
    status: 'a_fazer',
    deadline: 'Hoje, até 11h',
    subtasks: [
      { id: 'sub_h1', title: 'Revisar checklist de release e variáveis', completed: true },
      { id: 'sub_h2', title: 'Executar deploy da v1.8 no cluster', completed: false },
      { id: 'sub_h3', title: 'Confirmar healthcheck pós-deploy', completed: false }
    ],
    notes: 'Notificações pausadas ao iniciar.',
    context_resume: {
      wasDoing: 'Revisando credenciais do cluster e secrets de release',
      stoppedAt: 'Verificação do token de staging',
      nextAction: 'Executar pipeline e acompanhar o rollout'
    },
    created_at: '2026-11-09T08:00:00.000Z'
  },
  {
    id: 'task_aura_1',
    title: 'Finalizar o design da navegação',
    area: 'Aura',
    description: 'Revisar os estados e preparar o handoff.',
    category: 'profissional',
    project_id: 'proj_aura',
    priority: 'alta',
    estimated_minutes: 60,
    difficulty: 'medio',
    energy_level: 'high',
    status: 'a_fazer',
    deadline: 'Até 14h',
    subtasks: [
      { id: 'sub_a1', title: 'Revisar estados hover, active e focus', completed: true },
      { id: 'sub_a2', title: 'Exportar especificações para o time', completed: false }
    ],
    created_at: '2026-11-09T09:00:00.000Z'
  },
  {
    id: 'task_idp_1',
    title: 'Enviar a entrega final do IDP',
    area: 'IDP',
    description: 'Conferir os anexos e submeter no portal.',
    category: 'academico',
    project_id: 'proj_idp',
    deadline: 'Até 17h',
    priority: 'media',
    estimated_minutes: 30,
    difficulty: 'medio',
    energy_level: 'medium',
    status: 'a_fazer',
    subtasks: [
      { id: 'sub_i1', title: 'Conferir anexos e notas de rodapé', completed: false },
      { id: 'sub_i2', title: 'Submeter no portal acadêmico', completed: false }
    ],
    created_at: '2026-11-09T10:00:00.000Z'
  },
  {
    id: 'task_littera_2',
    title: 'Revisar endpoints de autenticação do Littera',
    area: 'Littera',
    description: 'Garantir renovação silenciosa de tokens antes da sessão expirar.',
    category: 'profissional',
    project_id: 'proj_littera',
    priority: 'media',
    estimated_minutes: 25,
    difficulty: 'medio',
    energy_level: 'medium',
    status: 'a_fazer',
    subtasks: [],
    created_at: '2026-11-09T11:00:00.000Z'
  },
  {
    id: 'task_pessoal_1',
    title: 'Treino funcional & 20 min de corrida regenerativa',
    area: 'Pessoal',
    description: 'Atividade física para oxigenação cerebral e redução de cortisol.',
    category: 'saude',
    priority: 'media',
    estimated_minutes: 35,
    difficulty: 'facil',
    energy_level: 'medium',
    status: 'concluido',
    subtasks: [],
    created_at: '2026-11-09T07:00:00.000Z',
    completed_at: '2026-11-09T07:45:00.000Z'
  },
  {
    id: 'task_aura_2',
    title: 'Exportar microinterações em Lottie para o time de frontend',
    area: 'Aura',
    description: 'Separar loaders e transições de página em formato JSON leve.',
    category: 'profissional',
    project_id: 'proj_aura',
    priority: 'baixa',
    estimated_minutes: 15,
    difficulty: 'facil',
    energy_level: 'low',
    status: 'a_fazer',
    subtasks: [],
    created_at: '2026-11-07T14:30:00.000Z'
  },
  {
    id: 'task_pessoal_2',
    title: 'Organizar ambiente de trabalho físico & hidratação',
    area: 'Pessoal',
    description: 'Manter mesa limpa e garrafa cheia para quebrar a inércia do dia.',
    category: 'pessoal',
    priority: 'baixa',
    estimated_minutes: 5,
    difficulty: 'facil',
    energy_level: 'low',
    status: 'a_fazer',
    subtasks: [],
    created_at: '2026-11-07T15:00:00.000Z'
  }
];

export const INITIAL_SUBJECTS: StudySubject[] = [
  {
    id: 'sub_idp',
    title: 'Direito Digital & Regulação de Inteligência Artificial',
    area: 'IDP',
    type: 'disciplina',
    institution: 'Instituto Brasileiro de Ensino, Desenvolvimento e Pesquisa (IDP)',
    status: 'estudando',
    hours_studied: 28.5,
    target_hours: 45,
    modules: [
      { id: 'mod_idp1', title: 'Marco Legal da IA no Brasil e UE', completed: true },
      { id: 'mod_idp2', title: 'Responsabilidade Civil por Sistemas Autônomos', completed: true },
      { id: 'mod_idp3', title: 'Transparência Algorítmica e Auditoria', completed: false }
    ],
    notes: 'Seminários quinzenais às quintas-feiras.',
    created_at: '2026-08-15T09:00:00.000Z',
    updated_at: '2026-11-07T11:00:00.000Z'
  },
  {
    id: 'sub_aura_ds',
    title: 'Spatial UI & Arquitetura de Design Systems',
    area: 'Aura',
    type: 'curso',
    institution: 'Apple Developer Academy & Design Lab',
    status: 'estudando',
    hours_studied: 19.0,
    target_hours: 30,
    modules: [
      { id: 'mod_a1', title: 'Profundidade visual e Z-index espacial', completed: true },
      { id: 'mod_a2', title: 'Glassmorphism com acessibilidade WCAG AAA', completed: true },
      { id: 'mod_a3', title: 'Haptics e microinterações de alto impacto', completed: false }
    ],
    notes: 'Referência principal para a evolução da identidade da Aura.',
    created_at: '2026-09-10T10:00:00.000Z',
    updated_at: '2026-11-06T15:00:00.000Z'
  }
];

export const INITIAL_FLASHCARDS: Flashcard[] = [
  {
    id: 'fc_1',
    subject_id: 'sub_idp',
    front: 'O que define o princípio do "Risk-Based Approach" na regulação de IA?',
    back: 'Classificação dos sistemas em níveis de risco (inaceitável, alto risco, transparência mínima e baixo risco), impondo obrigações proporcionais ao potencial de dano.',
    interval_days: 4,
    repetitions: 3,
    next_review: new Date().toISOString()
  },
  {
    id: 'fc_2',
    subject_id: 'sub_aura_ds',
    front: 'Qual o valor de contraste mínimo exigido pela WCAG AA e AAA para textos normais?',
    back: 'WCAG AA: 4.5:1 | WCAG AAA: 7:1 contra o fundo imediato.',
    interval_days: 7,
    repetitions: 4,
    next_review: new Date(Date.now() + 86400000 * 3).toISOString()
  }
];

export const INITIAL_HABITS: Habit[] = [
  {
    id: 'hab_1',
    title: 'Hidratação de 500ml ao despertar',
    time_of_day: 'matinal',
    frequency: 'diario',
    min_version: '3 goles de água',
    duration_minutes: 2,
    completed_dates: [new Date().toISOString().slice(0, 10)],
    created_at: '2026-10-01T07:00:00.000Z'
  }
];

export const INITIAL_NOTES: Note[] = [
  {
    id: 'note_1',
    title: 'Princípios Editoriais Apple & Personal OS',
    content: 'Clareza antes da decoração. Se uma informação não responde "O que fazer hoje" ou "Onde focar agora", ela não pertence ao Bento inicial.',
    tags: ['design', 'filosofia'],
    pinned: true,
    created_at: '2026-11-01T10:00:00.000Z',
    updated_at: '2026-11-07T12:00:00.000Z'
  }
];

export const INITIAL_FOCUS_SESSIONS: FocusSession[] = [
  {
    id: 'foc_1',
    task_id: 'task_highlight',
    task_title: 'Deploy da versão v2.4 do Littera (Staging & Produção)',
    duration_minutes: 25,
    completed_at: new Date().toISOString(),
    mode: 'pomodoro'
  }
];
