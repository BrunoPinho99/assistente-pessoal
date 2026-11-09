-- ==============================================================================
-- PERSONAL OS - INTELIGENTE & TDAH RESILIENTE (SUPABASE POSTGRESQL SCHEMA)
-- ==============================================================================

-- 1. TIPOS ENUMERADOS (ENUMs)
CREATE TYPE public.task_energy_level AS ENUM ('low', 'medium', 'high');
CREATE TYPE public.task_priority AS ENUM ('baixa', 'media', 'alta', 'urgente');
CREATE TYPE public.task_difficulty AS ENUM ('facil', 'medio', 'dificil');
CREATE TYPE public.task_category AS ENUM ('academico', 'profissional', 'pessoal', 'saude', 'outros');
CREATE TYPE public.task_status AS ENUM ('inbox', 'a_fazer', 'em_andamento', 'concluido', 'adiado');

CREATE TYPE public.project_status AS ENUM ('planejamento', 'ativo', 'pausado', 'concluido');
CREATE TYPE public.study_type AS ENUM ('disciplina', 'curso', 'livro', 'certificacao');
CREATE TYPE public.study_status AS ENUM ('nao_iniciado', 'estudando', 'concluido', 'revisar');

CREATE TYPE public.routine_time_of_day AS ENUM ('matinal', 'tarde', 'noturna', 'qualquer');
CREATE TYPE public.habit_frequency AS ENUM ('diario', 'dias_uteis', 'fim_de_semana', 'semanal');

-- 2. TABELA DE PROJETOS
CREATE TABLE public.projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
    title TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL DEFAULT 'profissional',
    main_goal TEXT NOT NULL,
    start_date DATE,
    deadline DATE,
    status public.project_status NOT NULL DEFAULT 'ativo',
    stages JSONB NOT NULL DEFAULT '[]'::jsonb,
    next_step TEXT NOT NULL DEFAULT 'Definir primeiro passo',
    documents JSONB NOT NULL DEFAULT '[]'::jsonb,
    references TEXT,
    decision_history JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. TABELA DE ESTUDOS & DISCIPLINAS
CREATE TABLE public.study_subjects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
    title TEXT NOT NULL,
    type public.study_type NOT NULL DEFAULT 'disciplina',
    institution TEXT,
    status public.study_status NOT NULL DEFAULT 'estudando',
    modules JSONB NOT NULL DEFAULT '[]'::jsonb,
    hours_studied NUMERIC(6, 2) NOT NULL DEFAULT 0.0,
    target_hours NUMERIC(6, 2),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 4. TABELA DE TAREFAS
CREATE TABLE public.tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
    project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
    subject_id UUID REFERENCES public.study_subjects(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT,
    category public.task_category NOT NULL DEFAULT 'pessoal',
    deadline TIMESTAMPTZ,
    priority public.task_priority NOT NULL DEFAULT 'media',
    estimated_minutes INTEGER NOT NULL DEFAULT 20,
    difficulty public.task_difficulty NOT NULL DEFAULT 'medio',
    energy_level public.task_energy_level NOT NULL DEFAULT 'low',
    status public.task_status NOT NULL DEFAULT 'a_fazer',
    subtasks JSONB NOT NULL DEFAULT '[]'::jsonb,
    notes TEXT,
    recurrence TEXT DEFAULT 'nenhuma',
    context_resume JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    completed_at TIMESTAMPTZ
);

-- 5. TABELA DE FLASHCARDS (REPETIÇÃO ESPAÇADA)
CREATE TABLE public.flashcards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
    subject_id UUID NOT NULL REFERENCES public.study_subjects(id) ON DELETE CASCADE,
    front TEXT NOT NULL,
    back TEXT NOT NULL,
    interval_days INTEGER NOT NULL DEFAULT 1,
    repetitions INTEGER NOT NULL DEFAULT 0,
    next_review TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    last_reviewed TIMESTAMPTZ
);

-- 6. TABELA DE ROTINA & HÁBITOS
CREATE TABLE public.habits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
    title TEXT NOT NULL,
    time_of_day public.routine_time_of_day NOT NULL DEFAULT 'matinal',
    frequency public.habit_frequency NOT NULL DEFAULT 'diario',
    min_version TEXT NOT NULL,
    duration_minutes INTEGER NOT NULL DEFAULT 15,
    completed_dates JSONB NOT NULL DEFAULT '[]'::jsonb,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 7. TABELA DE NOTAS (SEGUNDO CÉREBRO)
CREATE TABLE public.notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
    title TEXT NOT NULL,
    content TEXT NOT NULL DEFAULT '',
    tags JSONB NOT NULL DEFAULT '[]'::jsonb,
    project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
    subject_id UUID REFERENCES public.study_subjects(id) ON DELETE SET NULL,
    pinned BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 8. TABELA DE SESSÕES DE FOCO
CREATE TABLE public.focus_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
    task_id UUID REFERENCES public.tasks(id) ON DELETE SET NULL,
    task_title TEXT,
    duration_minutes INTEGER NOT NULL DEFAULT 25,
    completed_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    mode TEXT NOT NULL DEFAULT 'pomodoro'
);

-- 9. ÍNDICES DE ALTA PERFORMANCE
CREATE INDEX idx_projects_user ON public.projects(user_id);
CREATE INDEX idx_tasks_user ON public.tasks(user_id);
CREATE INDEX idx_tasks_status ON public.tasks(status);
CREATE INDEX idx_tasks_project ON public.tasks(project_id);
CREATE INDEX idx_study_subjects_user ON public.study_subjects(user_id);
CREATE INDEX idx_flashcards_subject ON public.flashcards(subject_id);
CREATE INDEX idx_habits_user ON public.habits(user_id);
CREATE INDEX idx_notes_user ON public.notes(user_id);
CREATE INDEX idx_focus_sessions_user ON public.focus_sessions(user_id);

-- 10. ROW LEVEL SECURITY (RLS)
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flashcards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.focus_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own projects" ON public.projects FOR ALL TO authenticated USING ((select auth.uid()) = user_id) WITH CHECK ((select auth.uid()) = user_id);
CREATE POLICY "Users can manage own study_subjects" ON public.study_subjects FOR ALL TO authenticated USING ((select auth.uid()) = user_id) WITH CHECK ((select auth.uid()) = user_id);
CREATE POLICY "Users can manage own tasks" ON public.tasks FOR ALL TO authenticated USING ((select auth.uid()) = user_id) WITH CHECK ((select auth.uid()) = user_id);
CREATE POLICY "Users can manage own flashcards" ON public.flashcards FOR ALL TO authenticated USING ((select auth.uid()) = user_id) WITH CHECK ((select auth.uid()) = user_id);
CREATE POLICY "Users can manage own habits" ON public.habits FOR ALL TO authenticated USING ((select auth.uid()) = user_id) WITH CHECK ((select auth.uid()) = user_id);
CREATE POLICY "Users can manage own notes" ON public.notes FOR ALL TO authenticated USING ((select auth.uid()) = user_id) WITH CHECK ((select auth.uid()) = user_id);
CREATE POLICY "Users can manage own focus_sessions" ON public.focus_sessions FOR ALL TO authenticated USING ((select auth.uid()) = user_id) WITH CHECK ((select auth.uid()) = user_id);
