import React, { useState, useEffect, useMemo } from 'react';
import confetti from 'canvas-confetti';
import { 
  Check,
  Search,
  Bell,
  Calendar,
  Sun,
  List,
  ChevronRight,
  MoreHorizontal,
  Volume2,
  VolumeX,
  Zap,
  Play,
  Pause,
  Menu,
  Briefcase,
  Sparkles
} from 'lucide-react';
import { Task, Project, Habit, StudySubject, ThemeMode, Priority } from '../../types';
import { soundSynthesizer } from '../../lib/audioSynthesizer';

interface DashboardViewProps {
  userName?: string;
  tasks: Task[];
  projects: Project[];
  habits: Habit[];
  subjects?: StudySubject[];
  isCalmMode: boolean;
  themeMode?: ThemeMode;
  isDarkMode?: boolean;
  onChangeThemeMode?: (mode: ThemeMode) => void;
  onToggleTheme?: () => void;
  onToggleTask: (taskId: string) => void;
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

export const DashboardView: React.FC<DashboardViewProps> = ({
  userName = 'Bruno',
  tasks,
  projects,
  themeMode = 'dark',
  onChangeThemeMode,
  onToggleTheme,
  onToggleTask,
  onOpenQuickCapture,
  onNavigateTab,
  onEditTask,
  onOpenMobileMenu,
  onOpenDopamineChat
}) => {
  // Filtro de status das tarefas das empresas (Todas, Pendentes, Concluídas)
  const [taskStatusFilter, setTaskStatusFilter] = useState<'todas' | 'pendentes' | 'concluidas'>('todas');

  // Search query
  const [searchQuery, setSearchQuery] = useState('');

  // Pomodoro Timer State
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(45 * 60);
  const [activeAudioTone, setActiveAudioTone] = useState<'none' | 'brown'>('none');
  
  // Selected task for Hero Focus card (Default to company tasks)
  const [selectedFocusTaskId, setSelectedFocusTaskId] = useState<string>('task_prioridades_empresas');

  // IDs dos projetos trancados (Estacionamento de Dopamina)
  const lockedProjectIds = new Set(
    (projects || []).filter(p => p.locked).map(p => p.id)
  );

  // Filtragem estrita: SOMENTE tarefas do dia cujos projetos estejam DESTRANCADOS (locked: false)
  const isCompanyTask = (t: Task) => {
    if (!t) return false;
    
    // REGRA DE PROTEÇÃO: Se a tarefa pertence a um projeto trancado, ela NÃO entra no Hoje/Meu Dia
    if (t.project_id && lockedProjectIds.has(t.project_id)) {
      return false;
    }

    const area = (t.area || '').toLowerCase();
    const cat = (t.category || '').toLowerCase();
    const proj = (t.project_id || '').toLowerCase();
    return (
      area.includes('littera') || 
      area.includes('aura') || 
      cat === 'profissional' ||
      proj.includes('littera') ||
      proj.includes('aura')
    );
  };

  const safeTasks = Array.isArray(tasks) ? tasks.filter(Boolean) : [];
  const companyTasks = safeTasks.filter(isCompanyTask);

  // Fallback seguro caso não haja tarefas cadastradas ainda
  const fallbackHeroTask: Task = {
    id: 'task_prioridades_empresas',
    title: 'Definir as 3 prioridades essenciais de hoje',
    area: 'Littera',
    category: 'profissional',
    description: 'Escrever no topo do dia para não se perder em tarefas secundárias.',
    priority: 'urgente',
    estimated_minutes: 45,
    difficulty: 'medio',
    energy_level: 'high',
    status: 'em_andamento',
    subtasks: [],
    created_at: new Date().toISOString()
  };

  // Tarefa de Foco Ativa das Empresas
  const currentHeroTask: Task = 
    (selectedFocusTaskId ? companyTasks.find(t => t.id === selectedFocusTaskId) : undefined) ||
    companyTasks.find(t => t.id === 'task_prioridades_empresas') ||
    companyTasks.find(t => t.id === 'task_highlight') ||
    companyTasks.find(t => t.id === 'task_landing_littera') ||
    companyTasks[0] ||
    safeTasks[0] ||
    fallbackHeroTask;

  // Timer interval
  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds(s => s - 1);
      }, 1000);
    } else if (timerSeconds === 0) {
      setIsTimerRunning(false);
      confetti({ 
        particleCount: 50, 
        spread: 60,
        colors: ['#ffffff', '#0099ff', '#d44df0', '#6a4cf5']
      });
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timerSeconds]);

  // Audio cleanup
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

  // Data dinâmica em português
  const now = new Date();
  const dayName = now.toLocaleDateString('pt-BR', { weekday: 'long' });
  const dayNumber = now.getDate();
  const monthName = now.toLocaleDateString('pt-BR', { month: 'long' });
  const formattedDate = `${dayName.charAt(0).toUpperCase() + dayName.slice(1)}, ${dayNumber} de ${monthName}`;

  // Tarefas exibidas (filtradas por busca e status)
  const displayTasks = companyTasks.filter(task => {
    if (searchQuery.trim()) {
      const matchTitle = task.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchDesc = task.description?.toLowerCase().includes(searchQuery.toLowerCase());
      if (!matchTitle && !matchDesc) return false;
    }

    if (taskStatusFilter === 'pendentes') {
      if (task.status === 'concluido') return false;
    } else if (taskStatusFilter === 'concluidas') {
      if (task.status !== 'concluido') return false;
    }

    return true;
  });

  const totalCompanyTasks = companyTasks.length;
  const completedCompanyTasks = companyTasks.filter(t => t.status === 'concluido').length;
  const pendingCompanyTasks = companyTasks.filter(t => t.status !== 'concluido').length;

  const PRIORITY_WEIGHT: Record<Priority, number> = {
    urgente: 4,
    alta: 3,
    media: 2,
    baixa: 1
  };

  const getPriorityBadge = (priority: Priority) => {
    switch (priority) {
      case 'urgente':
        return (
          <span className="px-2 py-0.5 rounded-[6px] text-[11px] font-medium bg-[#ff5577]/15 border border-[#ff5577]/30 text-[#ff5577] flex items-center gap-1 shrink-0 tracking-[-0.12px]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#ff5577] animate-pulse" />
            Urgente
          </span>
        );
      case 'alta':
        return (
          <span className="px-2 py-0.5 rounded-[6px] text-[11px] font-medium bg-[#ff7a3d]/15 border border-[#ff7a3d]/30 text-[#ff7a3d] shrink-0 tracking-[-0.12px]">
            Alta
          </span>
        );
      case 'media':
        return (
          <span className="px-2 py-0.5 rounded-[6px] text-[11px] font-medium bg-[#0099ff]/15 border border-[#0099ff]/30 text-[#0099ff] shrink-0 tracking-[-0.12px]">
            Média
          </span>
        );
      case 'baixa':
        return (
          <span className="px-2 py-0.5 rounded-[6px] text-[11px] font-medium bg-[#1c1c1c] border border-[#262626] text-[#999999] shrink-0 tracking-[-0.12px]">
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

  interface TaskGroup {
    id: string;
    projectName: string;
    companyName: string;
    tasks: Task[];
    maxPriorityWeight: number;
  }

  // Agrupamento por Projeto com separação por Empresa e ordenação estrita por Urgência
  const groupedTasks = useMemo(() => {
    const groupsMap = new Map<string, TaskGroup>();

    displayTasks.forEach(task => {
      const project = task.project_id ? projects.find(p => p.id === task.project_id) : undefined;
      const groupId = project ? project.id : (task.area || 'Geral');
      const projectName = project ? project.title : (task.area ? `Operações ${task.area}` : 'Geral');
      const companyName = project?.area || task.area || 'Empresas';

      if (!groupsMap.has(groupId)) {
        groupsMap.set(groupId, {
          id: groupId,
          projectName,
          companyName,
          tasks: [],
          maxPriorityWeight: 0
        });
      }

      groupsMap.get(groupId)!.tasks.push(task);
    });

    const groups = Array.from(groupsMap.values());

    // 1. Em cada projeto/empresa, ordena as tarefas começando pela MAIS URGENTE
    groups.forEach(g => {
      g.tasks.sort((a, b) => {
        const aDone = a.status === 'concluido' ? 1 : 0;
        const bDone = b.status === 'concluido' ? 1 : 0;
        if (aDone !== bDone) return aDone - bDone;

        const weightA = PRIORITY_WEIGHT[a.priority] || 2;
        const weightB = PRIORITY_WEIGHT[b.priority] || 2;
        if (weightA !== weightB) return weightB - weightA;

        return 0;
      });

      const pendingTasks = g.tasks.filter(t => t.status !== 'concluido');
      g.maxPriorityWeight = pendingTasks.length > 0
        ? Math.max(...pendingTasks.map(t => PRIORITY_WEIGHT[t.priority] || 2))
        : 0;
    });

    // 2. Ordena os projetos colocando o mais urgente no topo da hierarquia
    groups.sort((a, b) => {
      if (a.maxPriorityWeight !== b.maxPriorityWeight) {
        return b.maxPriorityWeight - a.maxPriorityWeight;
      }
      return a.projectName.localeCompare(b.projectName);
    });

    return groups;
  }, [displayTasks, projects]);

  const getCompanyBadge = (task: Task) => {
    if (!task) return null;
    const area = task.area || '';
    const proj = task.project_id || '';
    const isLittera = area === 'Littera' || proj === 'proj_littera';
    const isAura = area === 'Aura' || proj === 'proj_aura';

    return (
      <span className="px-2.5 py-0.5 rounded-[6px] text-[11px] font-medium shrink-0 bg-[#1c1c1c] border border-[#262626] text-[#999999] tracking-[-0.12px]">
        {isLittera ? 'Littera' : isAura ? 'Aura · Pinho' : (task.area || 'Empresa')}
      </span>
    );
  };

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col gap-8 select-none text-left min-w-0" data-purpose="dashboard-view">
      
      {/* ========================================================================
          1. HEADER DO WORKSPACE (Search bar, notificações, calendário, tema)
          ======================================================================== */}
      <header className="flex flex-col sm:flex-row items-center justify-between gap-3.5" data-purpose="workspace-header">
        
        {/* Search Bar with Mobile Menu Toggle */}
        <div className="flex items-center gap-2 w-full sm:max-w-md">
          {onOpenMobileMenu && (
            <button
              type="button"
              onClick={onOpenMobileMenu}
              className="md:hidden w-10 h-10 rounded-full border border-[#262626] bg-[#141414] hover:bg-[#1c1c1c] text-[#ffffff] flex items-center justify-center transition-colors cursor-pointer shrink-0"
              title="Abrir menu lateral"
            >
              <Menu className="w-4 h-4" />
            </button>
          )}
          <div className="relative flex-1 min-w-0">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <Search className="w-4 h-4 text-[#999999]" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar tarefas das empresas..."
              className="w-full pl-9.5 pr-14 py-2.5 rounded-[10px] text-[14px] font-normal border border-[#262626] bg-[#141414] text-[#ffffff] placeholder-[#999999] transition-all focus:outline-none focus:border-[#0099ff] focus:shadow-[0_0_0_3px_rgba(0,153,255,0.15)]"
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <span className="text-[11px] font-mono text-[#999999] px-1.5 py-0.5 rounded-[4px] border border-[#262626] bg-[#090909]">
                ⌘ K
              </span>
            </div>
          </div>
        </div>

        {/* Right Header Actions */}
        <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
          {/* Assistente IA CTA (Framer Translucent Pill) */}
          {onOpenDopamineChat && (
            <button
              type="button"
              onClick={onOpenDopamineChat}
              className="h-10 px-4 rounded-full border border-[#262626] bg-[#141414] hover:bg-[#1c1c1c] text-[#ffffff] flex items-center gap-2 text-[14px] font-medium tracking-[-0.14px] transition-colors cursor-pointer"
              title="Assistente IA & Copiloto"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#0099ff]" />
              <span className="hidden md:inline">Assistente IA</span>
            </button>
          )}

          {/* Quick Notification */}
          <button
            type="button"
            onClick={onOpenQuickCapture}
            className="relative w-10 h-10 rounded-full border border-[#262626] bg-[#141414] hover:bg-[#1c1c1c] text-[#999999] hover:text-[#ffffff] flex items-center justify-center transition-colors cursor-pointer"
            title="Nova tarefa rápida"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-2.5 right-2.5 w-1.5 h-1.5 rounded-full bg-[#0099ff]" />
          </button>

          {/* Calendar Button */}
          <button
            type="button"
            onClick={() => onNavigateTab('hoje')}
            className="w-10 h-10 rounded-full border border-[#262626] bg-[#141414] hover:bg-[#1c1c1c] text-[#999999] hover:text-[#ffffff] flex items-center justify-center transition-colors cursor-pointer"
            title="Hoje"
          >
            <Calendar className="w-4 h-4" />
          </button>

          {/* Theme Toggle */}
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
            className="w-10 h-10 rounded-full border border-[#262626] bg-[#141414] hover:bg-[#1c1c1c] text-[#999999] hover:text-[#ffffff] flex items-center justify-center transition-colors cursor-pointer"
            title={`Tema: ${themeMode}`}
          >
            <Sun className="w-4 h-4" />
          </button>
        </div>

      </header>

      {/* ========================================================================
          2. CABEÇALHO DE BOAS-VINDAS (Framer Poster Typography)
          ======================================================================== */}
      <div className="space-y-1.5">
        <div className="flex items-center gap-2 text-[13px] font-medium text-[#999999] tracking-[-0.13px]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#0099ff]" />
          <span>{formattedDate}</span>
          <span className="text-[#262626]">•</span>
          <span className="text-[#999999]">Operações & Empresas</span>
        </div>

        {/* Display Typography with Aggressive Negative Tracking */}
        <h1 className="text-[36px] sm:text-[48px] font-medium tracking-[-2.2px] text-[#ffffff] leading-[1.0]">
          Olá, {userName}.
        </h1>

        <p className="text-[15px] font-normal text-[#999999] tracking-[-0.15px] leading-[1.3]">
          Prioridades executivas e entregas do dia para suas empresas.
        </p>
      </div>

      {/* ========================================================================
          3. CARD PRINCIPAL — SEU FOCO AGORA (Framer Gradient Spotlight Tile 30px)
          ======================================================================== */}
      <div 
        className="relative p-7 sm:p-8 rounded-[30px] framer-spotlight-violet text-[#ffffff] min-w-0 overflow-hidden" 
        data-purpose="hero-focus-card"
      >
        {/* Options button */}
        <button
          type="button"
          onClick={onOpenQuickCapture}
          className="absolute top-5 right-5 w-9 h-9 rounded-full text-[#999999] hover:text-[#ffffff] hover:bg-[#1c1c1c]/80 flex items-center justify-center transition-colors cursor-pointer z-10"
          title="Opções da tarefa"
        >
          <MoreHorizontal className="w-4 h-4" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center relative z-10">
          
          {/* Lado Esquerdo: Badge, Título, Descrição, Tags */}
          <div className="md:col-span-7 flex flex-col justify-center space-y-3.5 min-w-0">
            
            {/* Badge: "Seu foco agora" */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#141414]/80 backdrop-blur-md border border-[#262626] text-[#ffffff] text-[12px] font-medium self-start tracking-[-0.12px]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0099ff] animate-pulse" />
              <span>Seu foco agora</span>
            </div>

            {/* Título da Tarefa de Foco */}
            <h2 className="text-[24px] sm:text-[32px] font-medium tracking-[-1.0px] text-[#ffffff] leading-[1.13] break-words">
              {currentHeroTask?.title || 'Definir as 3 prioridades essenciais de hoje'}
            </h2>

            {/* Descrição */}
            <p className="text-[15px] text-[#ffffff]/80 leading-[1.3] font-normal line-clamp-2 tracking-[-0.15px]">
              {currentHeroTask?.description || 'Foco executivo imediato sem distrações ou interrupções.'}
            </p>

            {/* Tags Row */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="px-3 py-1.5 rounded-full text-[12px] font-medium bg-[#141414]/80 backdrop-blur-md text-[#ffffff] border border-[#262626] flex items-center gap-1.5 tracking-[-0.12px]">
                <Zap className="w-3.5 h-3.5 fill-current text-[#ff7a3d]" />
                <span>Prioridade {currentHeroTask?.priority === 'urgente' ? 'Urgente' : currentHeroTask?.priority === 'alta' ? 'Alta' : 'Média'}</span>
              </span>

              <span className="px-3 py-1.5 rounded-full text-[12px] font-medium bg-[#141414]/80 backdrop-blur-md text-[#999999] border border-[#262626] flex items-center gap-1.5 tracking-[-0.12px]">
                <Briefcase className="w-3.5 h-3.5 text-[#999999]" />
                <span>{currentHeroTask?.area || 'Trabalho'}</span>
              </span>

              {/* Ruído Marrom Toggle */}
              <button
                type="button"
                onClick={toggleBrownNoise}
                className={`px-3 py-1.5 rounded-full text-[12px] font-medium transition-colors cursor-pointer flex items-center gap-1.5 border tracking-[-0.12px] ${
                  activeAudioTone === 'brown'
                    ? 'bg-[#ffffff] text-[#000000] border-[#ffffff]'
                    : 'bg-[#141414]/80 backdrop-blur-md text-[#999999] border-[#262626] hover:text-[#ffffff]'
                }`}
                title="Ruído Marrom para Foco TDAH"
              >
                {activeAudioTone === 'brown' ? <Volume2 className="w-3.5 h-3.5 text-[#000000]" /> : <VolumeX className="w-3.5 h-3.5 text-[#999999]" />}
                <span>{activeAudioTone === 'brown' ? 'Som ativo' : 'Som foco'}</span>
              </button>
            </div>
          </div>

          {/* Lado Direito: Timer Pomodoro & Botão Iniciar Foco (White Pill) */}
          <div className="md:col-span-5 flex flex-col items-center justify-center text-center md:pl-6 md:border-l md:border-[#ffffff]/15">
            
            {/* Timer */}
            <div className="text-[52px] lg:text-[62px] font-medium tracking-[-3.1px] text-[#ffffff] tabular-nums my-0.5 leading-none">
              {formatTimerTime(timerSeconds)}
            </div>

            <p className="text-[13px] text-[#ffffff]/70 font-medium mt-1.5 mb-5 tracking-[-0.13px]">
              minutos de foco profundo
            </p>

            {/* Framer Primary CTA: White Pill on Dark */}
            <button
              type="button"
              onClick={() => setIsTimerRunning(!isTimerRunning)}
              className="w-full max-w-[200px] py-[11px] px-[18px] rounded-full text-[14px] font-medium tracking-[-0.14px] bg-[#ffffff] text-[#000000] hover:bg-[#f0f0f0] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
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
          </div>

        </div>
      </div>

      {/* ========================================================================
          4. SEÇÃO DE TAREFAS DAS EMPRESAS ("Tarefas de hoje · Empresas")
          ======================================================================== */}
      <section className="space-y-4 pt-1 min-w-0" data-purpose="tasks-list-section">
        
        {/* Header: Title + Status Filter Pills */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <List className="w-4 h-4 text-[#ffffff]" />
            <h3 className="text-[18px] font-semibold tracking-[-0.4px] text-[#ffffff]">
              Tarefas de hoje · Empresas
            </h3>
            <span className="text-[13px] font-medium text-[#999999] tabular-nums">
              ({displayTasks.length})
            </span>
          </div>

          {/* Status Filter Pills (Framer Pricing-Tab Rule: surface-2 #1c1c1c for selected, transparent/#999999 for default) */}
          <div className="p-1 rounded-full bg-[#141414] border border-[#262626] flex items-center gap-1 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setTaskStatusFilter('todas')}
              className={`px-3.5 py-1.5 rounded-full text-[13px] font-medium transition-colors cursor-pointer tracking-[-0.13px] tabular-nums ${
                taskStatusFilter === 'todas'
                  ? 'bg-[#1c1c1c] text-[#ffffff]'
                  : 'bg-transparent text-[#999999] hover:text-[#ffffff]'
              }`}
            >
              Todas {totalCompanyTasks}
            </button>

            <button
              type="button"
              onClick={() => setTaskStatusFilter('pendentes')}
              className={`px-3.5 py-1.5 rounded-full text-[13px] font-medium transition-colors cursor-pointer tracking-[-0.13px] tabular-nums ${
                taskStatusFilter === 'pendentes'
                  ? 'bg-[#1c1c1c] text-[#ffffff]'
                  : 'bg-transparent text-[#999999] hover:text-[#ffffff]'
              }`}
            >
              Pendentes {pendingCompanyTasks}
            </button>

            <button
              type="button"
              onClick={() => setTaskStatusFilter('concluidas')}
              className={`px-3.5 py-1.5 rounded-full text-[13px] font-medium transition-colors cursor-pointer tracking-[-0.13px] tabular-nums ${
                taskStatusFilter === 'concluidas'
                  ? 'bg-[#1c1c1c] text-[#ffffff]'
                  : 'bg-transparent text-[#999999] hover:text-[#ffffff]'
              }`}
            >
              Concluídas {completedCompanyTasks}
            </button>
          </div>
        </div>

        {/* List of Tasks Grouped by Project with Fine Separator Line (#262626) */}
        <div className="flex flex-col gap-5 min-w-0">
          {displayTasks.length === 0 ? (
            <div className="py-12 px-4 rounded-[20px] border border-[#262626] bg-[#141414] text-center space-y-1">
              <p className="text-[14px] font-medium text-[#ffffff]">Nenhuma tarefa pendente das empresas para hoje.</p>
              <p className="text-[13px] text-[#999999]">Tudo em dia nas suas operações executivas.</p>
            </div>
          ) : (
            groupedTasks.map((group, groupIdx) => (
              <div 
                key={group.id} 
                className={`space-y-2.5 ${
                  groupIdx > 0 ? 'pt-4 border-t border-[#262626]' : ''
                }`}
              >
                {/* Linha de Identificação do Projeto / Empresa */}
                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#0099ff]" />
                    <span className="text-[14px] font-medium tracking-[-0.14px] text-[#ffffff]">
                      {group.projectName}
                    </span>
                    <span className="px-2 py-0.5 rounded-[6px] text-[11px] font-medium bg-[#1c1c1c] border border-[#262626] text-[#999999]">
                      {group.companyName}
                    </span>
                  </div>

                  <span className="text-[12px] font-mono text-[#999999] tabular-nums">
                    {group.tasks.length} {group.tasks.length === 1 ? 'tarefa' : 'tarefas'}
                  </span>
                </div>

                {/* Lista de Tarefas do Projeto (Hierarquia pela Mais Urgente) */}
                <div className="flex flex-col gap-2">
                  {group.tasks.map((task) => {
                    const isCompleted = task.status === 'concluido';
                    const isSelectedHero = Boolean(currentHeroTask?.id && task.id === currentHeroTask.id);

                    return (
                      <div
                        key={task.id}
                        onClick={() => {
                          setSelectedFocusTaskId(task.id);
                          if (onEditTask) onEditTask(task);
                        }}
                        className={`group px-4 py-3.5 rounded-[15px] border flex items-center justify-between gap-3 transition-all cursor-pointer min-w-0 ${
                          isSelectedHero 
                            ? 'bg-[#1c1c1c] border-[#0099ff]/60 shadow-[0_0_0_2px_rgba(0,153,255,0.15)]' 
                            : 'bg-[#141414] border-[#262626] hover:bg-[#1c1c1c]'
                        } ${isCompleted ? 'opacity-50' : 'opacity-100'}`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {/* Checkbox */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onToggleTask(task.id);
                            }}
                            className={`w-4.5 h-4.5 rounded-full border flex items-center justify-center transition-colors cursor-pointer shrink-0 ${
                              isCompleted
                                ? 'bg-[#ffffff] border-[#ffffff] text-[#000000]'
                                : 'border-[#262626] hover:border-[#ffffff] bg-[#090909]'
                            }`}
                            title={isCompleted ? "Marcar como pendente" : "Marcar como concluída"}
                          >
                            {isCompleted && <Check className="w-2.5 h-2.5 text-[#000000] stroke-[3]" />}
                          </button>

                          {/* Badge de Prioridade */}
                          {getPriorityBadge(task.priority)}

                          {/* Task Title */}
                          <span className={`text-[14px] font-medium tracking-[-0.14px] truncate transition-colors ${
                            isCompleted 
                              ? 'line-through text-[#999999]' 
                              : 'text-[#ffffff]'
                          }`}>
                            {task.title}
                          </span>
                        </div>

                        {/* Right side: Company Badge, Deadline & Chevron */}
                        <div className="flex items-center gap-2.5 shrink-0">
                          {getCompanyBadge(task)}
                          
                          {task.deadline && (
                            <span className="hidden sm:inline-flex text-[12px] font-normal text-[#999999] tabular-nums">
                              {formatDeadline(task.deadline)}
                            </span>
                          )}

                          <ChevronRight className="w-4 h-4 text-[#999999] group-hover:text-[#ffffff] transition-colors" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      </section>

    </div>
  );
};
