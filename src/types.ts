// ==============================================================================
// PERSONAL OS - TYPE DEFINITIONS (Apple Editorial & Minimalist Bento System)
// ==============================================================================

export type EnergyLevel = 'low' | 'medium' | 'high';
export type Priority = 'baixa' | 'media' | 'alta' | 'urgente';
export type Difficulty = 'facil' | 'medio' | 'dificil';
export type TaskCategory = 'academico' | 'profissional' | 'pessoal' | 'saude' | 'outros';
export type TaskStatus = 'inbox' | 'a_fazer' | 'em_andamento' | 'concluido' | 'adiado';
export type ContextArea = 'Aura' | 'Littera' | 'IDP' | 'Pessoal';
export type ContextFilter = 'todos' | ContextArea;

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface TaskContextResume {
  wasDoing?: string;
  stoppedAt?: string;
  nextAction?: string;
  updatedAt?: string;
}

export interface Task {
  id: string;
  user_id?: string;
  title: string;
  description?: string;
  area: ContextArea; // Aura, Littera, IDP, Pessoal
  category: TaskCategory;
  project_id?: string | null;
  subject_id?: string | null;
  deadline?: string | null; // ISO string
  priority: Priority;
  estimated_minutes: number;
  difficulty: Difficulty;
  energy_level: EnergyLevel;
  status: TaskStatus;
  subtasks: Subtask[];
  notes?: string;
  recurrence?: 'nenhuma' | 'diaria' | 'semanal' | 'mensal';
  context_resume?: TaskContextResume;
  is_micro_action?: boolean;
  slicing_history?: string[];
  created_at: string;
  completed_at?: string | null;
}

// ------------------------------------------------------------------------------
// Projetos
// ------------------------------------------------------------------------------
export type ProjectStatus = 'planejamento' | 'ativo' | 'pausado' | 'concluido';

export interface ProjectStage {
  id: string;
  title: string;
  completed: boolean;
}

export interface DecisionRecord {
  id: string;
  date: string;
  decision: string;
  context?: string;
}

export interface ProjectDocument {
  id: string;
  title: string;
  url: string;
}

export type ProjectCategory = 
  | 'business' 
  | 'academic' 
  | 'parking' 
  | 'profissional' 
  | 'pessoal' 
  | 'academico';

// ==============================================================================
// PROTOCOLO 1-1-1 DE ALOCAÇÃO DE BANDA (3 SLOTS COGNITIVOS SIMULTÂNEOS)
// ==============================================================================
export type BandwidthSlot = 'ancora' | 'satelite' | 'valvula';

export interface BandwidthSlotDefinition {
  id: BandwidthSlot;
  slotNumber: 1 | 2 | 3;
  name: string;
  subtitle: string;
  cognitiveLoad: string;
  definition: string;
  behavior: string;
  badgeClass: string;
}

export const BANDWIDTH_SLOTS_CONFIG: Record<BandwidthSlot, BandwidthSlotDefinition> = {
  ancora: {
    id: 'ancora',
    slotNumber: 1,
    name: 'A Âncora',
    subtitle: 'Projeto Primário',
    cognitiveLoad: '~70% da banda mental',
    definition: 'O núcleo operacional. Exige trabalho profundo, contínuo e estratégico.',
    behavior: 'Consome a maior parte da banda mental (aprox. 70%) e dita a estrutura da rotina principal.',
    badgeClass: 'border-blue-500/40 bg-blue-500/20 text-blue-300'
  },
  satelite: {
    id: 'satelite',
    slotNumber: 2,
    name: 'O Satélite',
    subtitle: 'Projeto Secundário',
    cognitiveLoad: 'Tático / Sprints curtos',
    definition: 'O projeto tático. Tem escopo fechado e blindado, com começo, meio e fim definidos.',
    behavior: 'Funciona em sprints curtos ou manutenção. Existe para ser entregue e liberar o slot rápido.',
    badgeClass: 'border-purple-500/40 bg-purple-500/20 text-purple-300'
  },
  valvula: {
    id: 'valvula',
    slotNumber: 3,
    name: 'A Válvula',
    subtitle: 'Projeto de Escape (Sandbox)',
    cognitiveLoad: 'Dopamina pura / Zero pressão',
    definition: 'O sandbox do hiperfoco. Curtíssimo prazo, zero pressão de entrega.',
    behavior: 'Serve exclusivamente para hackear a dopamina, descarregar a mente e saciar a necessidade de novidade. Se virar obrigação, perde o status de Válvula.',
    badgeClass: 'border-emerald-500/40 bg-emerald-500/20 text-emerald-300'
  }
};

export interface Project {
  id: string;
  user_id?: string;
  name?: string; // MongoDB Schema name
  title: string; // Compatibilidade com frontend existente
  description?: string;
  area: ContextArea;
  category: ProjectCategory;
  main_goal: string;
  start_date?: string;
  deadline?: string | null;
  status: ProjectStatus;
  slot?: BandwidthSlot | null; // Protocolo 1-1-1: ancora | satelite | valvula | null
  locked: boolean; // 🔒 True = trancado no estacionamento de dopamina, False = ativo (máx 3 slots)
  isLocked?: boolean; // MongoDB Schema field
  unlockConditions?: string[]; // Critérios objetivos para o projeto poder ser destrancado no futuro
  stages: ProjectStage[];
  next_step: string;
  documents: ProjectDocument[];
  references?: string;
  decision_history: DecisionRecord[];
  created_at: string;
  updated_at: string;
}

export interface TradeoffCandidate {
  projectToUnlock: Project;
  activeProjects: Project[];
  targetSlot?: BandwidthSlot;
}

export interface DopamineCaptureMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  projectCreated?: {
    id: string;
    title: string;
    scope: string;
    area: ContextArea;
  };
  locked: boolean;
  timestamp: string;
}

// ------------------------------------------------------------------------------
// Estudos & Cursos
// ------------------------------------------------------------------------------
export type StudyContentType = 'disciplina' | 'curso' | 'livro' | 'certificacao';
export type StudyStatus = 'nao_iniciado' | 'estudando' | 'concluido' | 'revisar';

export interface StudyModule {
  id: string;
  title: string;
  completed: boolean;
}

export interface Flashcard {
  id: string;
  subject_id: string;
  front: string;
  back: string;
  interval_days: number;
  repetitions: number;
  next_review: string; // ISO Date
  last_reviewed?: string;
}

export interface StudySubject {
  id: string;
  user_id?: string;
  title: string;
  area: ContextArea;
  type: StudyContentType;
  institution?: string;
  status: StudyStatus;
  modules: StudyModule[];
  hours_studied: number;
  target_hours?: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

// ------------------------------------------------------------------------------
// Rotina & Hábitos
// ------------------------------------------------------------------------------
export type RoutineTimeOfDay = 'matinal' | 'tarde' | 'noturna' | 'qualquer';
export type HabitFrequency = 'diario' | 'dias_uteis' | 'fim_de_semana' | 'semanal';

export interface Habit {
  id: string;
  user_id?: string;
  title: string;
  time_of_day: RoutineTimeOfDay;
  frequency: HabitFrequency;
  min_version: string;
  duration_minutes: number;
  completed_dates: string[];
  notes?: string;
  created_at: string;
}

// ------------------------------------------------------------------------------
// Notas & Segundo Cérebro
// ------------------------------------------------------------------------------
export interface Note {
  id: string;
  user_id?: string;
  title: string;
  content: string;
  tags: string[];
  project_id?: string | null;
  subject_id?: string | null;
  pinned: boolean;
  created_at: string;
  updated_at: string;
}

// ------------------------------------------------------------------------------
// Foco & Sessões de Concentração
// ------------------------------------------------------------------------------
export interface FocusSession {
  id: string;
  task_id?: string | null;
  task_title?: string;
  duration_minutes: number;
  completed_at: string;
  mode: 'pomodoro' | 'livre';
}

// ------------------------------------------------------------------------------
// IA & Memória Contextual
// ------------------------------------------------------------------------------
export interface AIMessage {
  id: string;
  sender: 'user' | 'assistant';
  content: string;
  timestamp: string;
  actions?: Array<{
    label: string;
    action_type: 'break_task' | 'plan_day' | 'emergency_triage' | 'weekly_review' | 'start_focus';
    payload?: any;
  }>;
}

// ------------------------------------------------------------------------------
// Tema do Sistema (Experimental Hybrid Workspace)
// ------------------------------------------------------------------------------
export type ThemeMode = 'hybrid' | 'light' | 'dark';

// ------------------------------------------------------------------------------
// Navegação Estrita (Sidebar: Hoje, Tarefas, Projetos, Estudos)
// ------------------------------------------------------------------------------
export type NavigationTab = 
  | 'hoje'
  | 'tarefas'
  | 'projetos'
  | 'estudos';
