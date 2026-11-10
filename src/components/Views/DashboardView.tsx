import React, { useState, useEffect, useMemo } from 'react';
import confetti from 'canvas-confetti';
import { 
  Check,
  Search,
  Bell,
  Calendar,
  Sun,
  Moon,
  List,
  MoreHorizontal,
  Volume2,
  VolumeX,
  Zap,
  Play,
  Pause,
  RotateCcw,
  Menu,
  Briefcase,
  Sparkles,
  Eye,
  CheckCircle2,
  Circle,
  Plus,
  ArrowUpRight,
  RotateCw
} from 'lucide-react';
import { Task, Project, Habit, StudySubject, ThemeMode, Priority } from '../../types';
import { soundSynthesizer } from '../../lib/audioSynthesizer';

interface DashboardViewProps {
  userName?: string;
  tasks: Task[];
  projects: Project[];
  habits: Habit[];
  subjects?: StudySubject[];
  themeMode?: ThemeMode;
  isDarkMode?: boolean;
  externalFocusTask?: Task | null;
  focusStartTrigger?: number;
  onChangeThemeMode?: (mode: ThemeMode) => void;
  onToggleTheme?: () => void;
  onToggleTask: (taskId: string) => void;
  onUpdateTask?: (id: string, updates: Partial<Task>) => void;
  onStartFocus: (task: Task) => void;
  onToggleHabit?: (habitId: string) => void;
  onOpenLostHelp: () => void;
  onOpenQuickCapture: () => void;
  onNavigateTab: (tab: any) => void;
  onEditTask?: (task: Task) => void;
  onOpenMobileMenu?: () => void;
  onRequestSliceTask?: (task: Task) => void;
  onOpenDopamineChat?: () => void;
}

const PRIORITY_WEIGHT: Record<Priority, number> = {
  urgente: 4,
  alta: 3,
  media: 2,
  baixa: 1
};

export const DashboardView: React.FC<DashboardViewProps> = ({
  userName = 'Bruno',
  tasks,
  projects,
  themeMode = 'dark',
  isDarkMode = true,
  externalFocusTask,
  focusStartTrigger,
  onChangeThemeMode,
  onToggleTheme,
  onToggleTask,
  onUpdateTask,
  onOpenQuickCapture,
  onNavigateTab,
  onEditTask,
  onOpenMobileMenu,
  onOpenDopamineChat
}) => {
  const [taskStatusFilter, setTaskStatusFilter] = useState<'todas' | 'pendentes' | 'concluidas'>('todas');
  const [searchQuery, setSearchQuery] = useState('');
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(45 * 60);
  const [activeAudioTone, setActiveAudioTone] = useState<'none' | 'brown'>('none');
  const [selectedFocusTaskId, setSelectedFocusTaskId] = useState<string>('');
  const [quickStepInput, setQuickStepInput] = useState('');
  const [queueAdvanceNotice, setQueueAdvanceNotice] = useState<string | null>(null);

  // Quando o usuário clica em "Focar" a partir da aba Tarefas ou Projetos, seleciona a tarefa e inicia o Modo Foco Difuso
  useEffect(() => {
    if (externalFocusTask && focusStartTrigger && focusStartTrigger > 0) {
      setSelectedFocusTaskId(externalFocusTask.id);
      setTimerSeconds((externalFocusTask.estimated_minutes || 45) * 60);
      setIsTimerRunning(true);
    }
  }, [externalFocusTask, focusStartTrigger]);

  // Limpa aviso de avanço da fila após 4 segundos
  useEffect(() => {
    if (!queueAdvanceNotice) return;
    const timer = setTimeout(() => setQueueAdvanceNotice(null), 4000);
    return () => clearTimeout(timer);
  }, [queueAdvanceNotice]);

  const lockedProjectIds = useMemo(
    () => new Set((projects || []).filter(p => p.locked).map(p => p.id)),
    [projects]
  );

  const safeTasks = useMemo(() => (Array.isArray(tasks) ? tasks.filter(Boolean) : []), [tasks]);

  // Todas as tarefas de projetos destrancados entram na fila do dia
  const baseTasks = useMemo(() => {
    const unlocked = safeTasks.filter(t => !t.project_id || !lockedProjectIds.has(t.project_id));
    return unlocked.length > 0 ? unlocked : safeTasks;
  }, [safeTasks, lockedProjectIds]);

  // ============================================================================
  // FILA DE EXECUÇÃO (PENDENTES) & FILA DE CONCLUÍDAS
  // ============================================================================
  const sortedPendingTasks = useMemo(() => {
    const pending = baseTasks.filter(t => t.status !== 'concluido');
    return [...pending].sort((a, b) => {
      const weightA = PRIORITY_WEIGHT[a.priority] || 2;
      const weightB = PRIORITY_WEIGHT[b.priority] || 2;
      if (weightA !== weightB) return weightB - weightA;
      return 0;
    });
  }, [baseTasks]);

  // Se o usuário selecionou uma tarefa específica pendente para focar, ela fica no topo (#1 da fila)
  const pendingQueue = useMemo(() => {
    if (!selectedFocusTaskId) return sortedPendingTasks;
    const selectedIdx = sortedPendingTasks.findIndex(t => t.id === selectedFocusTaskId);
    if (selectedIdx <= 0) return sortedPendingTasks;
    const selectedTask = sortedPendingTasks[selectedIdx];
    const rest = sortedPendingTasks.filter((_, idx) => idx !== selectedIdx);
    return [selectedTask, ...rest];
  }, [sortedPendingTasks, selectedFocusTaskId]);

  // Fila de Concluídas: mais recentes no topo
  const completedQueue = useMemo(() => {
    const completed = baseTasks.filter(t => t.status === 'concluido');
    return [...completed].sort((a, b) => {
      const timeA = a.completed_at ? new Date(a.completed_at).getTime() : 0;
      const timeB = b.completed_at ? new Date(b.completed_at).getTime() : 0;
      return timeB - timeA;
    });
  }, [baseTasks]);

  // Tarefa #1 no topo da fila (Hero Card) e Tarefa #2 (Seguinte na fila)
  const currentHeroTask: Task | null = pendingQueue[0] || null;
  const nextTaskInQueue: Task | null = pendingQueue[1] || null;

  // Sincroniza o selectedFocusTaskId quando a tarefa atual é concluída para que a seguinte suba automaticamente
  useEffect(() => {
    if (selectedFocusTaskId) {
      const stillPending = sortedPendingTasks.some(t => t.id === selectedFocusTaskId);
      if (!stillPending) {
        const nextTop = sortedPendingTasks[0];
        setSelectedFocusTaskId(nextTop ? nextTop.id : '');
        setTimerSeconds(((nextTop?.estimated_minutes) || 45) * 60);
      }
    }
  }, [sortedPendingTasks, selectedFocusTaskId]);

  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds(s => s - 1);
      }, 1000);
    } else if (timerSeconds === 0 && isTimerRunning) {
      setIsTimerRunning(false);
      confetti({ 
        particleCount: 50, 
        spread: 60,
        colors: ['#0099ff', '#d44df0', '#6a4cf5', '#ff7a3d']
      });
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timerSeconds]);

  // ESC sai do modo foco imersivo se o usuário desejar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isTimerRunning) {
        setIsTimerRunning(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isTimerRunning]);

  useEffect(() => {
    return () => {
      soundSynthesizer.stop();
    };
  }, []);

  const toggleBrownNoise = () => {
    if (activeAudioTone === 'brown') {
      soundSynthesizer.stop();
      setActiveAudioTone('none');
    } else {
      soundSynthesizer.startBrownNoise(0.25);
      setActiveAudioTone('brown');
    }
  };

  const formatTimerTime = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleToggleFocusSubtask = (subtaskId: string) => {
    if (!currentHeroTask || !onUpdateTask) return;
    const updated = (currentHeroTask.subtasks || []).map(st =>
      st.id === subtaskId ? { ...st, completed: !st.completed } : st
    );
    onUpdateTask(currentHeroTask.id, { subtasks: updated });
  };

  const handleAddFocusSubtask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickStepInput.trim() || !currentHeroTask || !onUpdateTask) return;
    const updated = [
      ...(currentHeroTask.subtasks || []),
      { id: 'sub_' + Date.now(), title: quickStepInput.trim(), completed: false }
    ];
    onUpdateTask(currentHeroTask.id, { subtasks: updated });
    setQuickStepInput('');
  };

  // ============================================================================
  // CONCLUIR TAREFA E SUBIR A SEGUINTE NA FILA
  // ============================================================================
  const handleCompleteTaskAndAdvanceQueue = (taskToComplete: Task) => {
    if (!taskToComplete) return;

    const isCompleting = taskToComplete.status !== 'concluido';

    if (isCompleting) {
      // Descobre qual tarefa vai subir para o #1 da fila assim que esta sair
      const remainingQueue = pendingQueue.filter(t => t.id !== taskToComplete.id);
      const nextUpTask = remainingQueue[0] || null;

      // Marca como concluída (move para a Fila de Concluídas no store)
      onToggleTask(taskToComplete.id);

      // Sobe imediatamente a próxima tarefa da fila para o topo (Hero Card)
      if (nextUpTask) {
        setSelectedFocusTaskId(nextUpTask.id);
        setTimerSeconds((nextUpTask.estimated_minutes || 45) * 60);
        setQueueAdvanceNotice(
          `✓ "${taskToComplete.title}" foi para a Fila de Concluídas. "${nextUpTask.title}" subiu para o #1!`
        );
      } else {
        setSelectedFocusTaskId('');
        setIsTimerRunning(false);
        setQueueAdvanceNotice(
          `✓ "${taskToComplete.title}" concluída! Todas as tarefas da fila foram finalizadas.`
        );
      }

      // Sai do modo difuso para o usuário visualizar a tarefa na Fila de Concluídas e a nova tarefa no topo
      if (isTimerRunning) {
        setIsTimerRunning(false);
        if (activeAudioTone === 'brown') {
          soundSynthesizer.stop();
          setActiveAudioTone('none');
        }
      }
    } else {
      // Reabrir tarefa da fila de concluídas -> volta para a fila de pendentes
      onToggleTask(taskToComplete.id);
      setQueueAdvanceNotice(`"${taskToComplete.title}" voltou para a Fila de Execução.`);
    }
  };

  const now = new Date();
  const dayName = now.toLocaleDateString('pt-BR', { weekday: 'long' });
  const dayNumber = now.getDate();
  const monthName = now.toLocaleDateString('pt-BR', { month: 'long' });
  const formattedDate = `${dayName.charAt(0).toUpperCase() + dayName.slice(1)}, ${dayNumber} de ${monthName}`;

  const matchesSearch = (task: Task) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const matchTitle = task.title.toLowerCase().includes(q);
    const matchDesc = task.description?.toLowerCase().includes(q);
    const matchArea = task.area?.toLowerCase().includes(q);
    return Boolean(matchTitle || matchDesc || matchArea);
  };

  const filteredPendingQueue = useMemo(
    () => pendingQueue.filter(matchesSearch),
    [pendingQueue, searchQuery]
  );

  const filteredCompletedQueue = useMemo(
    () => completedQueue.filter(matchesSearch),
    [completedQueue, searchQuery]
  );

  const totalTasksCount = baseTasks.length;
  const pendingTasksCount = pendingQueue.length;
  const completedTasksCount = completedQueue.length;

  const getPriorityBadge = (priority: Priority) => {
    switch (priority) {
      case 'urgente':
        return (
          <span className="px-2 py-0.5 rounded-[6px] text-[11px] font-medium bg-[#ff5577]/15 border border-[#ff5577]/30 text-[#e11d48] dark:text-[#ff5577] flex items-center gap-1 shrink-0 tracking-[-0.12px]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#ff5577] animate-pulse" />
            Urgente
          </span>
        );
      case 'alta':
        return (
          <span className="px-2 py-0.5 rounded-[6px] text-[11px] font-medium bg-[#ff7a3d]/15 border border-[#ff7a3d]/30 text-[#ea580c] dark:text-[#ff7a3d] shrink-0 tracking-[-0.12px]">
            Alta
          </span>
        );
      case 'media':
        return (
          <span className="px-2 py-0.5 rounded-[6px] text-[11px] font-medium bg-[#0099ff]/15 border border-[#0099ff]/30 text-[#0077cc] dark:text-[#0099ff] shrink-0 tracking-[-0.12px]">
            Média
          </span>
        );
      case 'baixa':
        return (
          <span
            className={`px-2 py-0.5 rounded-[6px] text-[11px] font-medium border shrink-0 tracking-[-0.12px] ${
              isDarkMode
                ? 'bg-[#1c1c1c] border-[#262626] text-[#999999]'
                : 'bg-[#efefef] border-[#e4e4e7] text-[#666666]'
            }`}
          >
            Baixa
          </span>
        );
      default:
        return null;
    }
  };

  const formatDeadline = (raw?: string | null): string => {
    if (!raw) return '';
    const trimmed = raw.trim();
    if (trimmed.includes('T') || (trimmed.includes('-') && trimmed.length >= 10)) {
      const d = new Date(trimmed);
      if (!isNaN(d.getTime())) {
        const today = new Date();
        if (
          d.getDate() === today.getDate() &&
          d.getMonth() === today.getMonth() &&
          d.getFullYear() === today.getFullYear()
        ) {
          return 'Hoje';
        }
        return d.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' }).replace('.', '');
      }
    }
    return trimmed;
  };

  const getProjectAndCompanyBadge = (task: Task) => {
    if (!task) return null;
    const project = task.project_id ? projects.find(p => p.id === task.project_id) : undefined;
    const area = task.area || '';
    const proj = task.project_id || '';
    const isLittera = area === 'Littera' || proj === 'proj_littera';
    const isAura = area === 'Aura' || proj === 'proj_aura';
    const companyLabel = isLittera ? 'Littera' : isAura ? 'Aura · Pinho' : (task.area || 'Empresa');

    return (
      <span
        className={`px-2.5 py-0.5 rounded-[6px] text-[11px] font-medium shrink-0 border tracking-[-0.12px] ${
          isDarkMode
            ? 'bg-[#1c1c1c] border-[#262626] text-[#999999]'
            : 'bg-[#efefef] border-[#e4e4e7] text-[#666666]'
        }`}
      >
        {project ? `${project.title} · ${companyLabel}` : companyLabel}
      </span>
    );
  };

  const totalFocusSeconds = (currentHeroTask?.estimated_minutes || 45) * 60;
  const elapsedPercentage = Math.min(
    100,
    Math.max(0, Math.round(((totalFocusSeconds - timerSeconds) / totalFocusSeconds) * 100))
  );

  const allSubtasksCompleted =
    currentHeroTask &&
    Array.isArray(currentHeroTask.subtasks) &&
    currentHeroTask.subtasks.length > 0 &&
    currentHeroTask.subtasks.every(s => s.completed);

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col gap-8 select-none text-left min-w-0 relative" data-purpose="dashboard-view">
      
      {/* ========================================================================
          1. HEADER DO WORKSPACE (Fica difuso quando o Foco está ativo)
          ======================================================================== */}
      <header
        className={`flex flex-col sm:flex-row items-center justify-between gap-3.5 transition-all duration-500 ${
          isTimerRunning
            ? 'blur-[5px] opacity-25 pointer-events-none scale-[0.99]'
            : 'blur-0 opacity-100 scale-100'
        }`}
        data-purpose="workspace-header"
      >
        {/* Search Bar with Mobile Menu Toggle */}
        <div className="flex items-center gap-2 w-full sm:max-w-md">
          {onOpenMobileMenu && (
            <button
              type="button"
              onClick={onOpenMobileMenu}
              className={`md:hidden w-10 h-10 rounded-full border flex items-center justify-center transition-colors cursor-pointer shrink-0 ${
                isDarkMode
                  ? 'border-[#262626] bg-[#141414] hover:bg-[#1c1c1c] text-[#ffffff]'
                  : 'border-[#e4e4e7] bg-[#ffffff] hover:bg-[#efefef] text-[#090909]'
              }`}
              title="Abrir menu lateral"
            >
              <Menu className="w-4 h-4" />
            </button>
          )}
          <div className="relative flex-1 min-w-0">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <Search className={`w-4 h-4 ${isDarkMode ? 'text-[#999999]' : 'text-[#666666]'}`} />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar na fila de tarefas..."
              className={`w-full pl-9.5 pr-14 py-2.5 rounded-[10px] text-[14px] font-normal border transition-all focus:outline-none focus:border-[#0099ff] focus:shadow-[0_0_0_3px_rgba(0,153,255,0.15)] ${
                isDarkMode
                  ? 'border-[#262626] bg-[#141414] text-[#ffffff] placeholder-[#999999]'
                  : 'border-[#e4e4e7] bg-[#ffffff] text-[#090909] placeholder-[#666666] shadow-[0_1px_2px_rgba(0,0,0,0.03)]'
              }`}
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <span
                className={`text-[11px] font-mono px-1.5 py-0.5 rounded-[4px] border ${
                  isDarkMode
                    ? 'text-[#999999] border-[#262626] bg-[#090909]'
                    : 'text-[#666666] border-[#e4e4e7] bg-[#f7f7f8]'
                }`}
              >
                ⌘ K
              </span>
            </div>
          </div>
        </div>

        {/* Right Header Actions */}
        <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
          {onOpenDopamineChat && (
            <button
              type="button"
              onClick={onOpenDopamineChat}
              className={`h-10 px-4 rounded-full border flex items-center gap-2 text-[14px] font-medium tracking-[-0.14px] transition-colors cursor-pointer ${
                isDarkMode
                  ? 'border-[#262626] bg-[#141414] hover:bg-[#1c1c1c] text-[#ffffff]'
                  : 'border-[#e4e4e7] bg-[#ffffff] hover:bg-[#efefef] text-[#090909] shadow-[0_1px_2px_rgba(0,0,0,0.03)]'
              }`}
              title="Assistente IA & Copiloto"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#0099ff]" />
              <span className="hidden md:inline">Assistente IA</span>
            </button>
          )}

          <button
            type="button"
            onClick={onOpenQuickCapture}
            className={`relative w-10 h-10 rounded-full border flex items-center justify-center transition-colors cursor-pointer ${
              isDarkMode
                ? 'border-[#262626] bg-[#141414] hover:bg-[#1c1c1c] text-[#999999] hover:text-[#ffffff]'
                : 'border-[#e4e4e7] bg-[#ffffff] hover:bg-[#efefef] text-[#666666] hover:text-[#090909]'
            }`}
            title="Nova tarefa rápida"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-2.5 right-2.5 w-1.5 h-1.5 rounded-full bg-[#0099ff]" />
          </button>

          <button
            type="button"
            onClick={() => onNavigateTab('hoje')}
            className={`w-10 h-10 rounded-full border flex items-center justify-center transition-colors cursor-pointer ${
              isDarkMode
                ? 'border-[#262626] bg-[#141414] hover:bg-[#1c1c1c] text-[#999999] hover:text-[#ffffff]'
                : 'border-[#e4e4e7] bg-[#ffffff] hover:bg-[#efefef] text-[#666666] hover:text-[#090909]'
            }`}
            title="Hoje"
          >
            <Calendar className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => {
              if (onChangeThemeMode) {
                const nextMode: ThemeMode = themeMode === 'dark' ? 'light' : 'dark';
                onChangeThemeMode(nextMode);
              } else if (onToggleTheme) {
                onToggleTheme();
              }
            }}
            className={`h-10 px-3.5 rounded-full border flex items-center gap-1.5 text-[13px] font-medium tracking-[-0.13px] transition-colors cursor-pointer ${
              isDarkMode
                ? 'border-[#262626] bg-[#141414] hover:bg-[#1c1c1c] text-[#ffffff]'
                : 'border-[#e4e4e7] bg-[#ffffff] hover:bg-[#efefef] text-[#090909] shadow-[0_1px_2px_rgba(0,0,0,0.03)]'
            }`}
            title={isDarkMode ? 'Mudar para versão clara' : 'Mudar para versão escura'}
          >
            {isDarkMode ? (
              <>
                <Sun className="w-4 h-4 text-[#ff7a3d]" />
                <span className="hidden sm:inline">Claro</span>
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 text-[#6a4cf5]" />
                <span className="hidden sm:inline">Escuro</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* ========================================================================
          2. CABEÇALHO DE BOAS-VINDAS (Fica difuso quando o Foco está ativo)
          ======================================================================== */}
      <div
        className={`space-y-1.5 transition-all duration-500 ${
          isTimerRunning
            ? 'blur-[5px] opacity-25 pointer-events-none scale-[0.99]'
            : 'blur-0 opacity-100 scale-100'
        }`}
      >
        <div
          className={`flex items-center gap-2 text-[13px] font-medium tracking-[-0.13px] ${
            isDarkMode ? 'text-[#999999]' : 'text-[#666666]'
          }`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#0099ff]" />
          <span>{formattedDate}</span>
          <span className={isDarkMode ? 'text-[#262626]' : 'text-[#d4d4d8]'}>•</span>
          <span>Fila Executiva ({pendingTasksCount} pendentes · {completedTasksCount} concluídas)</span>
        </div>

        <h1
          className={`text-[36px] sm:text-[48px] font-medium tracking-[-2.2px] leading-[1.0] ${
            isDarkMode ? 'text-[#ffffff]' : 'text-[#090909]'
          }`}
        >
          Olá, {userName}.
        </h1>

        <p
          className={`text-[15px] font-normal tracking-[-0.15px] leading-[1.3] ${
            isDarkMode ? 'text-[#999999]' : 'text-[#666666]'
          }`}
        >
          Ao concluir a tarefa em foco, ela vai para a Fila de Concluídas e a seguinte sobe automaticamente.
        </p>
      </div>

      {/* Banner de transição da fila quando uma tarefa acaba de ser concluída */}
      {queueAdvanceNotice && (
        <div
          className="px-4 py-3 rounded-[15px] bg-[#22c55e]/15 border border-[#22c55e]/40 text-[#22c55e] text-[13px] font-medium flex items-center justify-between gap-3 animate-in fade-in duration-200"
          role="status"
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-[#22c55e]" />
            <span>{queueAdvanceNotice}</span>
          </div>
          <button
            type="button"
            onClick={() => setQueueAdvanceNotice(null)}
            className="text-[11px] font-mono uppercase tracking-wider opacity-75 hover:opacity-100 cursor-pointer shrink-0"
          >
            Fechar
          </button>
        </div>
      )}

      {/* ========================================================================
          3. CARD PRINCIPAL — #1 DA FILA / SEU FOCO AGORA
          ======================================================================== */}
      {currentHeroTask ? (
        <div 
          className={`relative p-7 sm:p-8 rounded-[30px] framer-spotlight-violet text-[#ffffff] min-w-0 overflow-hidden transition-all duration-500 ${
            isTimerRunning
              ? 'z-30 scale-[1.015] ring-2 ring-[#0099ff] shadow-[0_30px_90px_-15px_rgba(106,76,245,0.55)]'
              : 'z-10 scale-100'
          }`}
          data-purpose="hero-focus-card"
        >
          {/* Top Right Controls: Editar */}
          <div className="absolute top-5 right-5 flex items-center gap-2 z-20">
            <button
              type="button"
              onClick={() => {
                if (currentHeroTask && onEditTask) {
                  onEditTask(currentHeroTask);
                } else {
                  onOpenQuickCapture();
                }
              }}
              className="w-9 h-9 rounded-full text-[#ffffff]/70 hover:text-[#ffffff] hover:bg-black/25 flex items-center justify-center transition-colors cursor-pointer"
              title="Editar detalhes da tarefa"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center relative z-10">
            
            {/* Lado Esquerdo: Posição na Fila, Título, Descrição, Subtarefas e Próxima da Fila */}
            <div className="md:col-span-7 flex flex-col justify-center space-y-3.5 min-w-0">
              
              {/* Badge: Posição #1 da Fila / Modo Imersão */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/35 backdrop-blur-md border border-white/20 text-[#ffffff] text-[12px] font-medium self-start tracking-[-0.12px]">
                <span
                  className={`w-2 h-2 rounded-full ${
                    isTimerRunning ? 'bg-[#22c55e] animate-ping' : 'bg-[#0099ff] animate-pulse'
                  }`}
                />
                <span>
                  {isTimerRunning
                    ? 'Modo Imersão Ativo · Foco Exclusivo (#1 da Fila)'
                    : `Topo da Fila (#1 de ${pendingTasksCount}) · Seu foco agora`}
                </span>
              </div>

              {/* Título da Tarefa #1 da Fila */}
              <h2 className="text-[24px] sm:text-[32px] font-medium tracking-[-1.0px] text-[#ffffff] leading-[1.13] break-words pr-10">
                {currentHeroTask.title}
              </h2>

              {/* Descrição */}
              <p className="text-[15px] text-[#ffffff]/85 leading-[1.35] font-normal tracking-[-0.15px]">
                {currentHeroTask.description || 'Foco executivo imediato sem distrações ou interrupções.'}
              </p>

              {/* Micro-passos / Subtarefas da tarefa em foco (visíveis em foco ou se houver subtarefas) */}
              {(isTimerRunning || (currentHeroTask.subtasks && currentHeroTask.subtasks.length > 0)) && (
                <div className="pt-1 space-y-2.5">
                  <div className="p-3.5 rounded-[18px] bg-black/30 backdrop-blur-md border border-white/15 space-y-2">
                    <div className="flex items-center justify-between text-[11px] font-mono uppercase tracking-wider text-white/75">
                      <span>Micro-passos desta entrega</span>
                      <span>
                        {(currentHeroTask.subtasks || []).filter(s => s.completed).length}/
                        {(currentHeroTask.subtasks || []).length}
                      </span>
                    </div>

                    {(currentHeroTask.subtasks || []).length > 0 ? (
                      <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                        {(currentHeroTask.subtasks || []).map(st => (
                          <button
                            key={st.id}
                            type="button"
                            onClick={() => handleToggleFocusSubtask(st.id)}
                            className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-[10px] hover:bg-white/10 text-left text-[13px] transition-colors cursor-pointer"
                          >
                            {st.completed ? (
                              <CheckCircle2 className="w-4 h-4 text-[#22c55e] shrink-0" />
                            ) : (
                              <Circle className="w-4 h-4 text-white/60 shrink-0" />
                            )}
                            <span className={st.completed ? 'line-through text-white/50' : 'text-white font-medium'}>
                              {st.title}
                            </span>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[12px] text-white/60">
                        Divida em micro-passos abaixo se sentir travamento:
                      </p>
                    )}

                    {isTimerRunning && onUpdateTask && (
                      <form onSubmit={handleAddFocusSubtask} className="flex items-center gap-1.5 pt-1">
                        <input
                          type="text"
                          value={quickStepInput}
                          onChange={e => setQuickStepInput(e.target.value)}
                          placeholder="Adicionar micro-passo agora..."
                          className="flex-1 px-3 py-1.5 rounded-full bg-black/40 border border-white/15 text-[12px] text-white placeholder-white/50 focus:outline-none focus:border-[#0099ff]"
                        />
                        <button
                          type="submit"
                          className="px-3 py-1.5 rounded-full bg-white/15 hover:bg-white/25 text-white text-[12px] font-medium transition cursor-pointer flex items-center gap-1"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Passo</span>
                        </button>
                      </form>
                    )}
                  </div>
                </div>
              )}

              {/* Tags Row */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="px-3 py-1.5 rounded-full text-[12px] font-medium bg-black/30 backdrop-blur-md text-[#ffffff] border border-white/20 flex items-center gap-1.5 tracking-[-0.12px]">
                  <Zap className="w-3.5 h-3.5 fill-current text-[#ff7a3d]" />
                  <span>Prioridade {currentHeroTask.priority === 'urgente' ? 'Urgente' : currentHeroTask.priority === 'alta' ? 'Alta' : 'Média'}</span>
                </span>

                <span className="px-3 py-1.5 rounded-full text-[12px] font-medium bg-black/30 backdrop-blur-md text-[#ffffff]/90 border border-white/20 flex items-center gap-1.5 tracking-[-0.12px]">
                  <Briefcase className="w-3.5 h-3.5 text-[#ffffff]/80" />
                  <span>{currentHeroTask.area || 'Trabalho'}</span>
                </span>

                {/* Ruído Marrom Toggle */}
                <button
                  type="button"
                  onClick={toggleBrownNoise}
                  className={`px-3 py-1.5 rounded-full text-[12px] font-medium transition-colors cursor-pointer flex items-center gap-1.5 border tracking-[-0.12px] ${
                    activeAudioTone === 'brown'
                      ? 'bg-[#ffffff] text-[#000000] border-[#ffffff]'
                      : 'bg-black/30 backdrop-blur-md text-[#ffffff]/90 border-white/20 hover:bg-black/45'
                  }`}
                  title="Ruído Marrom para Foco TDAH"
                >
                  {activeAudioTone === 'brown' ? <Volume2 className="w-3.5 h-3.5 text-[#000000]" /> : <VolumeX className="w-3.5 h-3.5 text-[#ffffff]/80" />}
                  <span>{activeAudioTone === 'brown' ? 'Som ativo' : 'Som foco'}</span>
                </button>
              </div>

              {/* Indicador de Próxima Tarefa na Fila (Queue Preview) */}
              {nextTaskInQueue && (
                <div className="pt-1">
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/25 border border-white/15 text-[12px] text-white/80 max-w-full">
                    <ArrowUpRight className="w-3.5 h-3.5 text-[#0099ff] shrink-0" />
                    <span className="font-mono text-[11px] uppercase tracking-wider text-white/60 shrink-0">
                      Seguinte na fila (#2):
                    </span>
                    <span className="font-medium text-white truncate">
                      {nextTaskInQueue.title}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Lado Direito: Timer Pomodoro & Botão Iniciar/Pausar Foco */}
            <div className="md:col-span-5 flex flex-col items-center justify-center text-center md:pl-6 md:border-l md:border-[#ffffff]/20">
              
              {/* Timer */}
              <div className="text-[52px] lg:text-[62px] font-medium tracking-[-3.1px] text-[#ffffff] tabular-nums my-0.5 leading-none">
                {formatTimerTime(timerSeconds)}
              </div>

              <p className="text-[13px] text-[#ffffff]/80 font-medium mt-1.5 mb-3 tracking-[-0.13px]">
                {isTimerRunning ? 'Restante do bloco de hiperfoco' : 'minutos de foco profundo'}
              </p>

              {/* Barra de Progresso quando Foco Ativo */}
              {isTimerRunning && (
                <div className="w-full max-w-[200px] h-1.5 rounded-full bg-black/35 overflow-hidden mb-4">
                  <div
                    className="h-full bg-[#0099ff] rounded-full transition-all duration-500"
                    style={{ width: `${Math.max(4, elapsedPercentage)}%` }}
                  />
                </div>
              )}

              {/* Framer Primary CTA: White Pill + Botão Concluir Tarefa sempre visível */}
              <div className="flex flex-col items-center gap-2.5 w-full justify-center">
                <div className="flex items-center gap-2 w-full justify-center">
                  <button
                    type="button"
                    onClick={() => setIsTimerRunning(!isTimerRunning)}
                    className="flex-1 max-w-[200px] py-[11px] px-[18px] rounded-full text-[14px] font-medium tracking-[-0.14px] bg-[#ffffff] text-[#000000] hover:bg-[#f0f0f0] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
                  >
                    {isTimerRunning ? (
                      <>
                        <Pause className="w-3.5 h-3.5 fill-current text-[#000000]" />
                        <span>Pausar foco</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5 fill-current text-[#000000]" />
                        <span>Iniciar foco</span>
                      </>
                    )}
                  </button>

                  {isTimerRunning && (
                    <button
                      type="button"
                      onClick={() => setTimerSeconds((currentHeroTask.estimated_minutes || 45) * 60)}
                      className="w-10 h-10 rounded-full bg-black/30 hover:bg-black/50 border border-white/20 text-white flex items-center justify-center transition cursor-pointer shrink-0"
                      title="Reiniciar cronômetro"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Único Botão Concluir Tarefa diretamente abaixo do botão de Foco */}
                <button
                  type="button"
                  onClick={() => handleCompleteTaskAndAdvanceQueue(currentHeroTask)}
                  className={`w-full max-w-[200px] py-[10px] px-[18px] rounded-full text-[13px] font-semibold tracking-[-0.13px] bg-[#22c55e] hover:bg-[#16a34a] text-[#000000] active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md ${
                    allSubtasksCompleted ? 'ring-2 ring-white animate-pulse' : ''
                  }`}
                  title="Marcar como concluída, colocar na Fila de Concluídas e subir a próxima tarefa"
                >
                  <Check className="w-4 h-4 stroke-[2.5]" />
                  <span>Concluir tarefa</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      ) : (
        /* Caso todas as tarefas da fila tenham sido concluídas */
        <div className="p-8 rounded-[30px] framer-spotlight-violet text-[#ffffff] flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/35 border border-white/20 text-[12px] font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#22c55e]" />
              <span>Fila de Execução Zerada</span>
            </div>
            <h2 className="text-[28px] sm:text-[32px] font-medium tracking-[-1.0px] leading-[1.13]">
              Todas as tarefas da fila foram concluídas!
            </h2>
            <p className="text-[15px] text-white/80">
              Suas entregas estão na Fila de Concluídas abaixo. Adicione uma nova tarefa se precisar continuar.
            </p>
          </div>
          <button
            type="button"
            onClick={onOpenQuickCapture}
            className="px-5 py-3 rounded-full bg-[#ffffff] text-[#000000] font-medium text-[14px] hover:bg-[#f0f0f0] transition cursor-pointer shrink-0 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Nova tarefa na fila</span>
          </button>
        </div>
      )}

      {/* ========================================================================
          4. SISTEMA DE FILAS:
             - FILA DE EXECUÇÃO (Sobe a seguinte automaticamente ao concluir)
             - FILA DE CONCLUÍDAS (Recebe as tarefas finalizadas)
          ======================================================================== */}
      <section className="space-y-6 pt-1 min-w-0 relative" data-purpose="tasks-queue-section">
        
        {/* Banner sutil de aviso quando o modo de foco difuso está ativo */}
        {isTimerRunning && (
          <div
            className={`px-4 py-2.5 rounded-full border flex items-center justify-between text-[12px] font-medium animate-in fade-in duration-300 ${
              isDarkMode
                ? 'bg-[#141414] border-[#0099ff]/40 text-[#ffffff]'
                : 'bg-[#ffffff] border-[#0099ff]/40 text-[#090909] shadow-sm'
            }`}
          >
            <div className="flex items-center gap-2">
              <Eye className="w-3.5 h-3.5 text-[#0099ff]" />
              <span>
                Modo Túnel de Visão ativo — outras tarefas da fila foram difusas para proteger sua atenção.
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsTimerRunning(false)}
              className="text-[#0099ff] hover:underline font-semibold cursor-pointer ml-3 shrink-0"
            >
              Mostrar fila completa (ESC)
            </button>
          </div>
        )}

        {/* Header: Title + Status Filter Pills (Difuso quando em foco) */}
        <div
          className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all duration-500 ${
            isTimerRunning ? 'blur-[4px] opacity-25 pointer-events-none' : 'blur-0 opacity-100'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <List className={`w-4 h-4 ${isDarkMode ? 'text-[#ffffff]' : 'text-[#090909]'}`} />
            <h3
              className={`text-[18px] font-semibold tracking-[-0.4px] ${
                isDarkMode ? 'text-[#ffffff]' : 'text-[#090909]'
              }`}
            >
              Fila de Tarefas de Hoje
            </h3>
            <span
              className={`text-[13px] font-medium tabular-nums ${
                isDarkMode ? 'text-[#999999]' : 'text-[#666666]'
              }`}
            >
              ({pendingTasksCount} na fila · {completedTasksCount} concluídas)
            </span>
          </div>

          {/* Status Filter Pills */}
          <div
            className={`p-1 rounded-full border flex items-center gap-1 self-start sm:self-auto ${
              isDarkMode
                ? 'bg-[#141414] border-[#262626]'
                : 'bg-[#efefef] border-[#e4e4e7]'
            }`}
          >
            <button
              type="button"
              onClick={() => setTaskStatusFilter('todas')}
              className={`px-3.5 py-1.5 rounded-full text-[13px] font-medium transition-all cursor-pointer tracking-[-0.13px] tabular-nums ${
                taskStatusFilter === 'todas'
                  ? isDarkMode
                    ? 'bg-[#1c1c1c] text-[#ffffff]'
                    : 'bg-[#ffffff] text-[#090909] shadow-xs'
                  : isDarkMode
                    ? 'bg-transparent text-[#999999] hover:text-[#ffffff]'
                    : 'bg-transparent text-[#666666] hover:text-[#090909]'
              }`}
            >
              Todas {totalTasksCount}
            </button>

            <button
              type="button"
              onClick={() => setTaskStatusFilter('pendentes')}
              className={`px-3.5 py-1.5 rounded-full text-[13px] font-medium transition-all cursor-pointer tracking-[-0.13px] tabular-nums ${
                taskStatusFilter === 'pendentes'
                  ? isDarkMode
                    ? 'bg-[#1c1c1c] text-[#ffffff]'
                    : 'bg-[#ffffff] text-[#090909] shadow-xs'
                  : isDarkMode
                    ? 'bg-transparent text-[#999999] hover:text-[#ffffff]'
                    : 'bg-transparent text-[#666666] hover:text-[#090909]'
              }`}
            >
              Fila Ativa {pendingTasksCount}
            </button>

            <button
              type="button"
              onClick={() => setTaskStatusFilter('concluidas')}
              className={`px-3.5 py-1.5 rounded-full text-[13px] font-medium transition-all cursor-pointer tracking-[-0.13px] tabular-nums ${
                taskStatusFilter === 'concluidas'
                  ? isDarkMode
                    ? 'bg-[#1c1c1c] text-[#ffffff]'
                    : 'bg-[#ffffff] text-[#090909] shadow-xs'
                  : isDarkMode
                    ? 'bg-transparent text-[#999999] hover:text-[#ffffff]'
                    : 'bg-transparent text-[#666666] hover:text-[#090909]'
              }`}
            >
              Fila de Concluídas {completedTasksCount}
            </button>
          </div>
        </div>

        {/* ====================================================================
            BLOCO A: FILA DE EXECUÇÃO (TAREFAS PENDENTES EM ORDEM DE FILA)
            ==================================================================== */}
        {taskStatusFilter !== 'concluidas' && (
          <div className="space-y-2.5 min-w-0">
            <div
              className={`flex items-center justify-between px-1 transition-all duration-500 ${
                isTimerRunning ? 'blur-[4px] opacity-25' : ''
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#0099ff]" />
                <span
                  className={`text-[13px] font-mono uppercase tracking-wider font-semibold ${
                    isDarkMode ? 'text-[#ffffff]' : 'text-[#090909]'
                  }`}
                >
                  Fila de Execução (Próximas a Subir)
                </span>
              </div>
              <span
                className={`text-[12px] font-mono tabular-nums ${
                  isDarkMode ? 'text-[#999999]' : 'text-[#666666]'
                }`}
              >
                {filteredPendingQueue.length} {filteredPendingQueue.length === 1 ? 'tarefa na fila' : 'tarefas na fila'}
              </span>
            </div>

            {filteredPendingQueue.length === 0 ? (
              <div
                className={`py-8 px-4 rounded-[20px] border text-center space-y-1 transition-all duration-500 ${
                  isTimerRunning ? 'blur-[5px] opacity-20 pointer-events-none' : ''
                } ${
                  isDarkMode
                    ? 'border-[#262626] bg-[#141414]'
                    : 'border-[#e4e4e7] bg-[#ffffff]'
                }`}
              >
                <p className={`text-[14px] font-medium ${isDarkMode ? 'text-[#ffffff]' : 'text-[#090909]'}`}>
                  Nenhuma tarefa pendente na fila de execução.
                </p>
                <p className={`text-[13px] ${isDarkMode ? 'text-[#999999]' : 'text-[#666666]'}`}>
                  Todas as tarefas foram movidas para a Fila de Concluídas abaixo.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {filteredPendingQueue.map((task, queueIndex) => {
                  const isTopHero = Boolean(currentHeroTask?.id && task.id === currentHeroTask.id);
                  const isNextUp = queueIndex === 1;
                  const isBlurredOut = isTimerRunning && !isTopHero;

                  return (
                    <div
                      key={task.id}
                      onClick={() => {
                        if (isBlurredOut) return;
                        setSelectedFocusTaskId(task.id);
                        setTimerSeconds((task.estimated_minutes || 45) * 60);
                      }}
                      className={`group px-4 py-3.5 rounded-[15px] border flex items-center justify-between gap-3 transition-all duration-500 cursor-pointer min-w-0 ${
                        isBlurredOut
                          ? 'blur-[6px] opacity-20 pointer-events-none select-none scale-[0.985] grayscale'
                          : isTopHero
                            ? isTimerRunning
                              ? isDarkMode
                                ? 'bg-[#1c1c1c] border-[#0099ff] ring-2 ring-[#0099ff]/30 shadow-[0_12px_36px_rgba(0,153,255,0.2)] scale-[1.01] z-20'
                                : 'bg-[#ffffff] border-[#0099ff] ring-2 ring-[#0099ff]/30 shadow-[0_12px_36px_rgba(0,153,255,0.18)] scale-[1.01] z-20'
                              : isDarkMode
                                ? 'bg-[#1c1c1c] border-[#0099ff]/60 shadow-[0_0_0_2px_rgba(0,153,255,0.15)]'
                                : 'bg-[#ffffff] border-[#0099ff] shadow-[0_0_0_3px_rgba(0,153,255,0.12)]'
                            : isDarkMode
                              ? 'bg-[#141414] border-[#262626] hover:bg-[#1c1c1c]'
                              : 'bg-[#ffffff] border-[#e4e4e7] hover:bg-[#efefef]/60 shadow-[0_1px_2px_rgba(0,0,0,0.02)]'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {/* Botão Checkbox para Concluir e Avançar a Fila */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCompleteTaskAndAdvanceQueue(task);
                          }}
                          className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all cursor-pointer shrink-0 group/check ${
                            isDarkMode
                              ? 'border-[#262626] hover:border-[#22c55e] hover:bg-[#22c55e]/20 bg-[#090909]'
                              : 'border-[#d4d4d8] hover:border-[#22c55e] hover:bg-[#22c55e]/15 bg-[#f7f7f8]'
                          }`}
                          title="Concluir tarefa e subir a próxima da fila"
                        >
                          <Check className="w-3 h-3 text-[#22c55e] opacity-0 group-hover/check:opacity-100 transition-opacity stroke-[3]" />
                        </button>

                        {/* Posição na Fila (#1, #2 Seguinte, #3...) */}
                        <span
                          className={`px-2 py-0.5 rounded-[6px] text-[11px] font-mono font-semibold shrink-0 border ${
                            isTopHero
                              ? 'bg-[#0099ff]/15 border-[#0099ff]/40 text-[#0099ff]'
                              : isNextUp
                                ? 'bg-[#6a4cf5]/15 border-[#6a4cf5]/40 text-[#6a4cf5] dark:text-[#d44df0]'
                                : isDarkMode
                                  ? 'bg-[#1c1c1c] border-[#262626] text-[#999999]'
                                  : 'bg-[#efefef] border-[#e4e4e7] text-[#666666]'
                          }`}
                        >
                          {isTopHero
                            ? '#1 · Em Foco'
                            : isNextUp
                              ? '#2 · Seguinte'
                              : `#${queueIndex + 1} na fila`}
                        </span>

                        {/* Badge de Prioridade */}
                        {getPriorityBadge(task.priority)}

                        {/* Task Title */}
                        <span
                          className={`text-[14px] font-medium tracking-[-0.14px] truncate transition-colors ${
                            isDarkMode ? 'text-[#ffffff]' : 'text-[#090909]'
                          }`}
                        >
                          {task.title}
                        </span>
                      </div>

                      {/* Right side: Concluir Rápido (sempre visível) + Focar + Project Badge + Deadline */}
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCompleteTaskAndAdvanceQueue(task);
                          }}
                          className="px-3 py-1 rounded-full text-[11px] font-semibold bg-[#22c55e]/15 hover:bg-[#22c55e] text-[#16a34a] dark:text-[#22c55e] hover:text-[#000000] border border-[#22c55e]/35 flex items-center gap-1 transition-all cursor-pointer"
                          title="Marcar como concluída e subir a seguinte"
                        >
                          <Check className="w-3 h-3 stroke-[2.5]" />
                          <span>Concluir</span>
                        </button>

                        {!isTimerRunning && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedFocusTaskId(task.id);
                              setTimerSeconds((task.estimated_minutes || 45) * 60);
                              setIsTimerRunning(true);
                              window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                            className={`px-3 py-1 rounded-full text-[11px] font-medium flex items-center gap-1 transition-all cursor-pointer ${
                              isDarkMode
                                ? 'bg-[#ffffff] text-[#000000] hover:bg-[#e5e5e5]'
                                : 'bg-[#090909] text-[#ffffff] hover:bg-[#222222]'
                            }`}
                            title="Subir para o topo e iniciar foco exclusivo"
                          >
                            <Play className="w-2.5 h-2.5 fill-current" />
                            <span>Focar</span>
                          </button>
                        )}

                        {getProjectAndCompanyBadge(task)}
                        
                        {task.deadline && (
                          <span
                            className={`hidden sm:inline-flex text-[12px] font-normal tabular-nums ${
                              isDarkMode ? 'text-[#999999]' : 'text-[#666666]'
                            }`}
                          >
                            {formatDeadline(task.deadline)}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ====================================================================
            BLOCO B: FILA DE CONCLUÍDAS (TAREFAS FINALIZADAS)
            ==================================================================== */}
        {taskStatusFilter !== 'pendentes' && (
          <div
            className={`space-y-2.5 pt-4 border-t transition-all duration-500 ${
              isDarkMode ? 'border-[#262626]' : 'border-[#e4e4e7]'
            } ${
              isTimerRunning ? 'blur-[6px] opacity-20 pointer-events-none select-none scale-[0.99]' : ''
            }`}
            data-purpose="completed-queue-section"
          >
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#22c55e]" />
                <span
                  className={`text-[13px] font-mono uppercase tracking-wider font-semibold ${
                    isDarkMode ? 'text-[#ffffff]' : 'text-[#090909]'
                  }`}
                >
                  Fila de Concluídas
                </span>
              </div>
              <span
                className={`text-[12px] font-mono tabular-nums ${
                  isDarkMode ? 'text-[#999999]' : 'text-[#666666]'
                }`}
              >
                {filteredCompletedQueue.length} {filteredCompletedQueue.length === 1 ? 'concluída' : 'concluídas'}
              </span>
            </div>

            {filteredCompletedQueue.length === 0 ? (
              <div
                className={`py-6 px-4 rounded-[15px] border border-dashed text-center ${
                  isDarkMode
                    ? 'border-[#262626] bg-[#141414]/40 text-[#999999]'
                    : 'border-[#e4e4e7] bg-[#ffffff]/60 text-[#666666]'
                }`}
              >
                <p className="text-[13px]">
                  As tarefas que você concluir aparecerão aqui na Fila de Concluídas.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {filteredCompletedQueue.map((task, idx) => (
                  <div
                    key={task.id}
                    onClick={() => {
                      if (onEditTask) onEditTask(task);
                    }}
                    className={`group px-4 py-3 rounded-[15px] border flex items-center justify-between gap-3 transition-all cursor-pointer min-w-0 ${
                      isDarkMode
                        ? 'bg-[#141414]/65 border-[#262626] hover:bg-[#1c1c1c]/80'
                        : 'bg-[#ffffff]/80 border-[#e4e4e7] hover:bg-[#efefef]/60'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Botão Concluído (clique para reabrir e devolver à fila se quiser) */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCompleteTaskAndAdvanceQueue(task);
                        }}
                        className="w-5 h-5 rounded-full bg-[#22c55e] border border-[#22c55e] text-[#000000] flex items-center justify-center transition-transform hover:scale-105 cursor-pointer shrink-0"
                        title="Concluída! Clique se quiser devolver para a Fila de Execução"
                      >
                        <Check className="w-3 h-3 stroke-[3] text-[#000000]" />
                      </button>

                      {/* Badge de Concluída */}
                      <span className="px-2 py-0.5 rounded-[6px] text-[11px] font-mono font-medium bg-[#22c55e]/15 border border-[#22c55e]/30 text-[#16a34a] dark:text-[#22c55e] shrink-0">
                        ✓ Concluída #{idx + 1}
                      </span>

                      {/* Título riscado */}
                      <span
                        className={`text-[14px] font-medium tracking-[-0.14px] truncate line-through ${
                          isDarkMode ? 'text-[#999999]' : 'text-[#666666]'
                        }`}
                      >
                        {task.title}
                      </span>
                    </div>

                    <div className="flex items-center gap-2.5 shrink-0">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCompleteTaskAndAdvanceQueue(task);
                        }}
                        className={`opacity-0 group-hover:opacity-100 px-2.5 py-1 rounded-full text-[11px] font-medium border flex items-center gap-1 transition-all cursor-pointer ${
                          isDarkMode
                            ? 'bg-[#1c1c1c] border-[#262626] text-[#999999] hover:text-[#ffffff]'
                            : 'bg-[#efefef] border-[#e4e4e7] text-[#666666] hover:text-[#090909]'
                        }`}
                        title="Devolver para a Fila de Execução"
                      >
                        <RotateCw className="w-2.5 h-2.5" />
                        <span>Voltar à fila</span>
                      </button>

                      {getProjectAndCompanyBadge(task)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </section>

    </div>
  );
};
