import { useState, useEffect } from 'react';
import { 
  Project, 
  Task, 
  StudySubject, 
  Flashcard, 
  Habit, 
  Note, 
  FocusSession,
  TaskStatus,
  EnergyLevel,
  Priority,
  ThemeMode,
  ContextArea,
  Subtask
} from '../types';
import { 
  INITIAL_PROJECTS, 
  INITIAL_TASKS, 
  INITIAL_SUBJECTS, 
  INITIAL_FLASHCARDS, 
  INITIAL_HABITS, 
  INITIAL_NOTES, 
  INITIAL_FOCUS_SESSIONS 
} from './initialData';
import { MAX_ACTIVE_PROJECTS, structureDopamineIdea } from './focusProtection';
import { supabase, isSupabaseConfigured } from './supabase';

const STORAGE_KEYS = {
  PROJECTS: 'personal_os_projects',
  TASKS: 'personal_os_tasks',
  SUBJECTS: 'personal_os_subjects',
  FLASHCARDS: 'personal_os_flashcards',
  HABITS: 'personal_os_habits',
  NOTES: 'personal_os_notes',
  FOCUS: 'personal_os_focus_sessions',
  THEME: 'personal_os_theme',
  CALM_MODE: 'personal_os_calm_mode'
};

export function usePersonalOS() {
  // Load state with LocalStorage persistence and fallback
  const [projects, setProjects] = useState<Project[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.PROJECTS);
      const parsed = raw ? JSON.parse(raw) : null;
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map((p: Project) => ({
          ...p,
          locked: p.locked !== undefined ? Boolean(p.locked) : (p.id === 'proj_idp')
        }));
      }
    } catch (e) {
      console.warn('Erro ao restaurar projects:', e);
    }
    return INITIAL_PROJECTS;
  });

  const [tasks, setTasks] = useState<Task[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.TASKS);
      const parsed = raw ? JSON.parse(raw) : null;
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Garantir que as tarefas de empresas existam se o usuário estiver usando dados legados
        const hasCompanyTask = parsed.some((t: Task) => 
          t.area === 'Littera' || 
          t.area === 'Aura' || 
          t.category === 'profissional' ||
          t.project_id === 'proj_littera' ||
          t.project_id === 'proj_aura'
        );
        if (!hasCompanyTask) {
          return [...INITIAL_TASKS, ...parsed];
        }
        return parsed;
      }
    } catch (e) {
      console.warn('Erro ao restaurar tasks:', e);
    }
    return INITIAL_TASKS;
  });

  const [subjects, setSubjects] = useState<StudySubject[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.SUBJECTS);
      const parsed = raw ? JSON.parse(raw) : null;
      if (Array.isArray(parsed)) return parsed;
    } catch {}
    return INITIAL_SUBJECTS;
  });

  const [flashcards, setFlashcards] = useState<Flashcard[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.FLASHCARDS);
      const parsed = raw ? JSON.parse(raw) : null;
      if (Array.isArray(parsed)) return parsed;
    } catch {}
    return INITIAL_FLASHCARDS;
  });

  const [habits, setHabits] = useState<Habit[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.HABITS);
      const parsed = raw ? JSON.parse(raw) : null;
      if (Array.isArray(parsed)) return parsed;
    } catch {}
    return INITIAL_HABITS;
  });

  const [notes, setNotes] = useState<Note[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.NOTES);
      const parsed = raw ? JSON.parse(raw) : null;
      if (Array.isArray(parsed)) return parsed;
    } catch {}
    return INITIAL_NOTES;
  });

  const [focusSessions, setFocusSessions] = useState<FocusSession[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.FOCUS);
      const parsed = raw ? JSON.parse(raw) : null;
      if (Array.isArray(parsed)) return parsed;
    } catch {}
    return INITIAL_FOCUS_SESSIONS;
  });

  // Preferences (Default: 'hybrid' as in the reference image)
  const [themeMode, setThemeMode] = useState<ThemeMode>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.THEME);
      if (raw === 'hybrid' || raw === 'light' || raw === 'dark') return raw;
    } catch {}
    return 'hybrid';
  });

  const isDarkMode = themeMode === 'dark';
  const setIsDarkMode = (val: boolean | ((prev: boolean) => boolean)) => {
    if (typeof val === 'function') {
      const next = val(isDarkMode);
      setThemeMode(next ? 'dark' : 'hybrid');
    } else {
      setThemeMode(val ? 'dark' : 'hybrid');
    }
  };

  const [isCalmMode, setIsCalmMode] = useState<boolean>(() => {
    const raw = localStorage.getItem(STORAGE_KEYS.CALM_MODE);
    return raw === 'true';
  });

  // Sincronização inicial com o MongoDB Atlas
  useEffect(() => {
    let isMounted = true;
    fetch('/api/projects')
      .then(res => {
        if (!res.ok) throw new Error('Falha HTTP');
        return res.json();
      })
      .then(data => {
        if (isMounted && data.success && Array.isArray(data.projects) && data.projects.length > 0) {
          setProjects(data.projects);
        }
      })
      .catch(err => {
        console.warn('Usando armazenamento local para projetos:', err.message);
      });
    return () => { isMounted = false; };
  }, []);

  // Save to LocalStorage automatically
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
  }, [projects]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SUBJECTS, JSON.stringify(subjects));
  }, [subjects]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.FLASHCARDS, JSON.stringify(flashcards));
  }, [flashcards]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.HABITS, JSON.stringify(habits));
  }, [habits]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(notes));
  }, [notes]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.FOCUS, JSON.stringify(focusSessions));
  }, [focusSessions]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.THEME, themeMode);
    if (themeMode === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [themeMode]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CALM_MODE, String(isCalmMode));
  }, [isCalmMode]);

  // ----------------------------------------------------------------------------
  // Tasks Actions
  // ----------------------------------------------------------------------------
  const addTask = (taskData: Omit<Task, 'id' | 'created_at'>) => {
    const newTask: Task = {
      ...taskData,
      id: 'task_' + Date.now(),
      created_at: new Date().toISOString()
    };
    setTasks(prev => [newTask, ...prev]);
    return newTask;
  };

  const updateTask = (id: string, updates: Partial<Task>) => {
    setTasks(prev => prev.map(t => {
      if (t.id === id) {
        const isNowCompleted = updates.status === 'concluido' && t.status !== 'concluido';
        return {
          ...t,
          ...updates,
          completed_at: isNowCompleted ? new Date().toISOString() : t.completed_at
        };
      }
      return t;
    }));
  };

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  const toggleTaskStatus = (id: string) => {
    setTasks(prev => prev.map(t => {
      if (t.id === id) {
        const nextStatus: TaskStatus = t.status === 'concluido' ? 'a_fazer' : 'concluido';
        return {
          ...t,
          status: nextStatus,
          completed_at: nextStatus === 'concluido' ? new Date().toISOString() : null
        };
      }
      return t;
    }));
  };

  const toggleSubtask = (taskId: string, subtaskId: string) => {
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        const nextSubtasks = t.subtasks.map(st => 
          st.id === subtaskId ? { ...st, completed: !st.completed } : st
        );
        return { ...t, subtasks: nextSubtasks };
      }
      return t;
    }));
  };

  const updateTaskResume = (taskId: string, resumeData: { wasDoing: string; stoppedAt: string; nextAction: string }) => {
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        return {
          ...t,
          context_resume: {
            ...resumeData,
            updatedAt: new Date().toISOString()
          }
        };
      }
      return t;
    }));
  };

  // ----------------------------------------------------------------------------
  // Projects Actions (com sincronização em tempo real com MongoDB Atlas)
  // ----------------------------------------------------------------------------
  const addProject = (projectData: Omit<Project, 'id' | 'created_at' | 'updated_at'>) => {
    const newProj: Project = {
      ...projectData,
      id: 'proj_' + Date.now(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    setProjects(prev => [newProj, ...prev]);

    // Persistência assíncrona no MongoDB Atlas
    fetch('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newProj)
    }).catch(err => console.warn('Erro ao salvar projeto no MongoDB Atlas:', err));

    return newProj;
  };

  const updateProject = (id: string, updates: Partial<Project>) => {
    setProjects(prev => prev.map(p => 
      p.id === id ? { ...p, ...updates, updated_at: new Date().toISOString() } : p
    ));

    // Atualização assíncrona no MongoDB Atlas
    fetch(`/api/projects?id=${encodeURIComponent(id)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    }).catch(err => console.warn('Erro ao atualizar projeto no MongoDB Atlas:', err));
  };

  const deleteProject = (id: string) => {
    setProjects(prev => prev.filter(p => p.id !== id));
    // Set project_id to null in tasks associated
    setTasks(prev => prev.map(t => t.project_id === id ? { ...t, project_id: null } : t));

    // Exclusão assíncrona no MongoDB Atlas
    fetch(`/api/projects?id=${encodeURIComponent(id)}`, {
      method: 'DELETE'
    }).catch(err => console.warn('Erro ao excluir projeto no MongoDB Atlas:', err));
  };

  const toggleProjectStage = (projectId: string, stageId: string) => {
    let updatedStages: any[] = [];
    setProjects(prev => prev.map(p => {
      if (p.id === projectId) {
        const stages = p.stages.map(st => 
          st.id === stageId ? { ...st, completed: !st.completed } : st
        );
        updatedStages = stages;
        return { ...p, stages, updated_at: new Date().toISOString() };
      }
      return p;
    }));

    if (updatedStages.length > 0) {
      fetch(`/api/projects?id=${encodeURIComponent(projectId)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stages: updatedStages })
      }).catch(err => console.warn('Erro ao atualizar etapa no MongoDB:', err));
    }
  };

  // ----------------------------------------------------------------------------
  // A Regra da Substituição: Limite de 2 Projetos Ativos (locked: false)
  // ----------------------------------------------------------------------------
  const toggleProjectLock = (id: string): {
    success: boolean;
    requiresTradeoff?: boolean;
    projectToUnlock?: Project;
    activeProjects?: Project[];
  } => {
    const project = projects.find(p => p.id === id);
    if (!project) return { success: false };

    // Se o projeto está trancado e o usuário deseja DESTRANCAR (locked -> false)
    if (project.locked) {
      const activeProjects = projects.filter(p => !p.locked && p.id !== id);
      if (activeProjects.length >= MAX_ACTIVE_PROJECTS) {
        // Disparar Modal de Trade-off Obrigatório
        return {
          success: false,
          requiresTradeoff: true,
          projectToUnlock: project,
          activeProjects
        };
      }
      // Vaga livre: desbloqueia imediatamente
      updateProject(id, { locked: false });
      return { success: true };
    } else {
      // Trancar projeto ativo: permitido imediatamente
      updateProject(id, { locked: true });
      return { success: true };
    }
  };

  const executeProjectTradeoff = (projectToUnlockId: string, projectToLockId: string) => {
    setProjects(prev => prev.map(p => {
      if (p.id === projectToLockId) {
        return { ...p, locked: true, updated_at: new Date().toISOString() };
      }
      if (p.id === projectToUnlockId) {
        return { ...p, locked: false, updated_at: new Date().toISOString() };
      }
      return p;
    }));

    // Sincroniza ambos no MongoDB Atlas
    fetch(`/api/projects?id=${encodeURIComponent(projectToLockId)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ locked: true })
    }).catch(() => {});

    fetch(`/api/projects?id=${encodeURIComponent(projectToUnlockId)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ locked: false })
    }).catch(() => {});
  };

  // Estacionamento de Dopamina: Salvar ideia de negócio IMEDIATAMENTE com locked: true / category: parking
  const parkDopamineIdea = (rawText: string, customArea?: ContextArea): Project => {
    const structured = structureDopamineIdea(rawText, customArea || 'Littera');
    const newProj: Project = {
      id: 'proj_' + Date.now(),
      name: structured.title,
      title: structured.title,
      description: structured.scope,
      area: structured.area,
      category: 'parking',
      main_goal: structured.main_goal,
      next_step: structured.next_step,
      status: 'planejamento',
      locked: true, // 🔒 IMEDIATAMENTE trancado para blindar o foco atual
      isLocked: true,
      unlockConditions: [
        'Concluir entrega prioritária do Littera em produção',
        'Liberar 1 dos 2 slots de foco ativo (Regra da Substituição)'
      ],
      stages: [
        { id: 'st_dp_1', title: 'Ideia capturada no Estacionamento de Dopamina', completed: true },
        { id: 'st_dp_2', title: 'Refinar escopo quando vaga de foco for liberada', completed: false }
      ],
      documents: [],
      decision_history: [
        {
          id: 'dh_' + Date.now(),
          date: new Date().toISOString().slice(0, 10),
          decision: 'Ideia estacionada com cadeado [🔒] para blindar foco de Littera e Aura.'
        }
      ],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    setProjects(prev => [newProj, ...prev]);
    return newProj;
  };

  // Fatiar Tarefa com IA em micro-ações mecânicas
  const applyTaskSlice = (
    taskId: string, 
    microTasks: Array<{ title: string; estimated_minutes: number; description: string }>,
    mode: 'subtasks' | 'replace' = 'subtasks'
  ) => {
    const originalTask = tasks.find(t => t.id === taskId);
    if (!originalTask) return;

    if (mode === 'subtasks') {
      const generatedSubtasks: Subtask[] = microTasks.map((mt, idx) => ({
        id: `st_slice_${Date.now()}_${idx}`,
        title: `${mt.title} (${mt.estimated_minutes}m)`,
        completed: false
      }));

      updateTask(taskId, {
        subtasks: [...(originalTask.subtasks || []), ...generatedSubtasks],
        estimated_minutes: 45, // Limita ao bloco de 45 min
        is_micro_action: true,
        slicing_history: [
          ...(originalTask.slicing_history || []),
          `Fatiada com IA em ${microTasks.length} micro-etapas em ${new Date().toLocaleTimeString('pt-BR')}`
        ]
      });
    } else {
      deleteTask(taskId);
      microTasks.forEach(mt => {
        addTask({
          title: mt.title,
          description: mt.description,
          area: originalTask.area,
          category: originalTask.category,
          project_id: originalTask.project_id,
          priority: originalTask.priority,
          estimated_minutes: mt.estimated_minutes,
          difficulty: 'facil',
          energy_level: 'medium',
          status: 'a_fazer',
          subtasks: [],
          is_micro_action: true
        });
      });
    }
  };

  // ----------------------------------------------------------------------------
  // Studies Actions
  // ----------------------------------------------------------------------------
  const addSubject = (subjectData: Omit<StudySubject, 'id' | 'created_at' | 'updated_at'>) => {
    const newSubj: StudySubject = {
      ...subjectData,
      id: 'subj_' + Date.now(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    setSubjects(prev => [newSubj, ...prev]);
    return newSubj;
  };

  const updateSubject = (id: string, updates: Partial<StudySubject>) => {
    setSubjects(prev => prev.map(s => 
      s.id === id ? { ...s, ...updates, updated_at: new Date().toISOString() } : s
    ));
  };

  const deleteSubject = (id: string) => {
    setSubjects(prev => prev.filter(s => s.id !== id));
    setFlashcards(prev => prev.filter(f => f.subject_id !== id));
  };

  const addFlashcard = (cardData: Omit<Flashcard, 'id' | 'interval_days' | 'repetitions' | 'next_review'>) => {
    const card: Flashcard = {
      ...cardData,
      id: 'fc_' + Date.now(),
      interval_days: 1,
      repetitions: 0,
      next_review: new Date().toISOString()
    };
    setFlashcards(prev => [card, ...prev]);
    return card;
  };

  const reviewFlashcard = (id: string, quality: 'facil' | 'bom' | 'dificil') => {
    setFlashcards(prev => prev.map(fc => {
      if (fc.id === id) {
        let nextInterval = fc.interval_days;
        let reps = fc.repetitions + 1;

        if (quality === 'facil') {
          nextInterval = Math.max(3, fc.interval_days * 2.5);
        } else if (quality === 'bom') {
          nextInterval = Math.max(2, fc.interval_days * 1.8);
        } else {
          // Errou ou achou difícil: recomeça intervalo
          nextInterval = 1;
          reps = 0;
        }

        const nextDate = new Date();
        nextDate.setDate(nextDate.getDate() + Math.round(nextInterval));

        return {
          ...fc,
          interval_days: Math.round(nextInterval),
          repetitions: reps,
          next_review: nextDate.toISOString(),
          last_reviewed: new Date().toISOString()
        };
      }
      return fc;
    }));
  };

  const logStudyHours = (subjectId: string, hours: number) => {
    setSubjects(prev => prev.map(s => 
      s.id === subjectId ? { ...s, hours_studied: s.hours_studied + hours, updated_at: new Date().toISOString() } : s
    ));
  };

  // ----------------------------------------------------------------------------
  // Habits Actions
  // ----------------------------------------------------------------------------
  const addHabit = (habitData: Omit<Habit, 'id' | 'created_at' | 'completed_dates'>) => {
    const newHabit: Habit = {
      ...habitData,
      id: 'hab_' + Date.now(),
      completed_dates: [],
      created_at: new Date().toISOString()
    };
    setHabits(prev => [...prev, newHabit]);
    return newHabit;
  };

  const toggleHabitDate = (habitId: string, dateStr: string = new Date().toISOString().slice(0, 10)) => {
    setHabits(prev => prev.map(h => {
      if (h.id === habitId) {
        const isDone = h.completed_dates.includes(dateStr);
        const nextDates = isDone 
          ? h.completed_dates.filter(d => d !== dateStr)
          : [...h.completed_dates, dateStr];
        return { ...h, completed_dates: nextDates };
      }
      return h;
    }));
  };

  const deleteHabit = (id: string) => {
    setHabits(prev => prev.filter(h => h.id !== id));
  };

  // ----------------------------------------------------------------------------
  // Notes Actions
  // ----------------------------------------------------------------------------
  const addNote = (noteData: Omit<Note, 'id' | 'created_at' | 'updated_at'>) => {
    const newNote: Note = {
      ...noteData,
      id: 'note_' + Date.now(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    setNotes(prev => [newNote, ...prev]);
    return newNote;
  };

  const updateNote = (id: string, updates: Partial<Note>) => {
    setNotes(prev => prev.map(n => 
      n.id === id ? { ...n, ...updates, updated_at: new Date().toISOString() } : n
    ));
  };

  const deleteNote = (id: string) => {
    setNotes(prev => prev.filter(n => n.id !== id));
  };

  // ----------------------------------------------------------------------------
  // Focus Session Actions
  // ----------------------------------------------------------------------------
  const addFocusSession = (session: Omit<FocusSession, 'id' | 'completed_at'>) => {
    const newSession: FocusSession = {
      ...session,
      id: 'foc_' + Date.now(),
      completed_at: new Date().toISOString()
    };
    setFocusSessions(prev => [newSession, ...prev]);
    return newSession;
  };

  // ----------------------------------------------------------------------------
  // ADHD Executive Superpowers & Calculations
  // ----------------------------------------------------------------------------
  
  // 1. Detector de Sobrecarga (calcula horas planejadas vs limite saudável)
  const pendingTasks = tasks.filter(t => t.status !== 'concluido');
  const todayEstimatedMinutes = pendingTasks.reduce((acc, t) => acc + (t.estimated_minutes || 20), 0);
  const isOverloaded = todayEstimatedMinutes > 360; // mais de 6 horas estimadas para um único dia

  // 2. Projetos Paralisados (sem atualização nos últimos 7 dias)
  const staleProjects = projects.filter(p => {
    if (p.status !== 'ativo') return false;
    const lastUpdate = new Date(p.updated_at).getTime();
    const daysSince = (Date.now() - lastUpdate) / (1000 * 60 * 60 * 24);
    return daysSince >= 7;
  });

  // 3. Captura Rápida Inteligente (Processa pensamentos soltos da Inbox)
  const quickCapture = (text: string, type: 'task' | 'note' | 'inbox' = 'inbox') => {
    if (!text.trim()) return;

    if (type === 'note') {
      addNote({
        title: text.slice(0, 45) + (text.length > 45 ? '...' : ''),
        content: text,
        tags: ['captura-rapida'],
        pinned: false
      });
    } else {
      const lower = text.toLowerCase();
      const detectedArea = lower.includes('aura') ? 'Aura' : lower.includes('littera') ? 'Littera' : lower.includes('idp') ? 'IDP' : 'Pessoal';
      addTask({
        title: text,
        area: detectedArea,
        category: 'pessoal',
        priority: 'media',
        estimated_minutes: 15,
        difficulty: 'facil',
        energy_level: 'low',
        status: type === 'inbox' ? 'inbox' : 'a_fazer',
        subtasks: []
      });
    }
  };

  // Reset/Export/Import Database
  const exportData = () => {
    const data = {
      projects,
      tasks,
      subjects,
      flashcards,
      habits,
      notes,
      focusSessions,
      exported_at: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `personal_os_backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return {
    // Data
    projects,
    tasks,
    subjects,
    flashcards,
    habits,
    notes,
    focusSessions,
    // Preferences
    themeMode,
    setThemeMode,
    isDarkMode,
    setIsDarkMode,
    isCalmMode,
    setIsCalmMode,
    // Task operations
    addTask,
    updateTask,
    deleteTask,
    toggleTaskStatus,
    toggleSubtask,
    updateTaskResume,
    // Project operations
    addProject,
    updateProject,
    deleteProject,
    toggleProjectStage,
    toggleProjectLock,
    executeProjectTradeoff,
    parkDopamineIdea,
    applyTaskSlice,
    // Studies operations
    addSubject,
    updateSubject,
    deleteSubject,
    addFlashcard,
    reviewFlashcard,
    logStudyHours,
    // Habit operations
    addHabit,
    toggleHabitDate,
    deleteHabit,
    // Note operations
    addNote,
    updateNote,
    deleteNote,
    // Focus operations
    addFocusSession,
    // ADHD metrics & tools
    isOverloaded,
    todayEstimatedMinutes,
    staleProjects,
    quickCapture,
    exportData
  };
}

