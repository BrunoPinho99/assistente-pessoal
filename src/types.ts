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

export interface Project {
  id: string;
  user_id?: string;
  title: string;
  description?: string;
  area: ContextArea;
  category: 'profissional' | 'pessoal' | 'academico';
  main_goal: string;
  start_date?: string;
  deadline?: string | null;
  status: ProjectStatus;
  locked: boolean; // 🔒 True = trancado no estacionamento de dopamina, False = ativo (máx 2)
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
