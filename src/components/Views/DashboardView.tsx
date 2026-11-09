import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { 
  Check,
  Search,
  Bell,
  Calendar,
  Sun,
  Clock,
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
  Lock,
  Unlock,
  Sparkles,
  AlertTriangle,
  ShieldCheck
} from 'lucide-react';
import { Task, Project, Habit, StudySubject, ThemeMode } from '../../types';
import { soundSynthesizer } from '../../lib/audioSynthesizer';
import { validateTaskForFocus } from '../../lib/focusProtection';

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
  themeMode = 'hybrid',
  isDarkMode = false,
  onChangeThemeMode,
  onToggleTheme,
  onToggleTask,
  onOpenQuickCapture,
  onNavigateTab,
  onEditTask,
  onOpenMobileMenu,
  onRequestSliceTask,
  onOpenDopamineChat
}) => {
  const isDark = themeMode === 'dark' || isDarkMode;

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

  // Validação de Micro-ação para o timer de 45 minutos (Anti-Paralisia TDAH)
  const heroValidation = validateTaskForFocus(currentHeroTask);

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
        particleCount: 70, 
        spread: 80,
        colors: ['#315DFF', '#172D69', '#ffffff']
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
    // Busca por texto
    if (searchQuery.trim()) {
      const matchTitle = task.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchDesc = task.description?.toLowerCase().includes(searchQuery.toLowerCase());
      if (!matchTitle && !matchDesc) return false;
    }

    // Filtro por status
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

  // Badge da empresa (garantindo letras brancas e sem azul ilegível no modo escuro)
  const getCompanyBadge = (task: Task) => {
    if (!task) return null;
    const area = task.area || '';
    const proj = task.project_id || '';
    if (area === 'Littera' || proj === 'proj_littera') {
      return (
        <span className={`px-2.5 py-0.5 rounded-md text-[11px] font-semibold shrink-0 border ${
          isDark
            ? 'bg-blue-950/70 text-white border-blue-600/50'
            : 'bg-[#EEF4FF] text-[#315DFF] border-[#315DFF]/20'
        }`}>
          Littera
        </span>
      );
    }
    if (area === 'Aura' || proj === 'proj_aura') {
      return (
        <span className={`px-2.5 py-0.5 rounded-md text-[11px] font-semibold shrink-0 border ${
          isDark
            ? 'bg-purple-950/70 text-white border-purple-500/40'
            : 'bg-[#F0EEFF] text-[#6E56CF] border-[#6E56CF]/20'
        }`}>
          Aura · Pinho
        </span>
      );
    }
    return (
      <span className={`px-2.5 py-0.5 rounded-md text-[11px] font-semibold shrink-0 border ${
        isDark
          ? 'bg-teal-950/70 text-white border-teal-500/40'
          : 'bg-[#E6F8F3] text-[#0D9488] border-[#0D9488]/20'
      }`}>
        {task.area || 'Empresa'}
      </span>
    );
  };

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col gap-6 select-none text-left min-w-0" data-purpose="dashboard-view">
      
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
              className={`md:hidden w-8.5 h-8.5 rounded-xl border flex items-center justify-center transition-colors cursor-pointer shrink-0 shadow-xs ${
                isDark 
                  ? 'bg-[#151D31] hover:bg-[#1C2742] border-[rgba(255,255,255,0.08)] text-white' 
                  : 'bg-white hover:bg-[#F3F5FC] border-[#E3E8F3] text-[#171D38]'
              }`}
              title="Abrir menu lateral"
            >
              <Menu className="w-4 h-4" />
            </button>
          )}
          <div className="relative flex-1 min-w-0">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <Search className={`w-4 h-4 ${isDark ? 'text-slate-400' : 'text-[#747E98]'}`} />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar tarefas das empresas..."
              className={`w-full pl-9.5 pr-14 py-2 rounded-xl text-xs font-normal border transition-all shadow-xs focus:outline-none ${
                isDark
                  ? 'bg-[#151D31] border-[rgba(255,255,255,0.08)] text-white placeholder-slate-400 focus:border-white focus:ring-1 focus:ring-white'
                  : 'bg-white border-[#E3E8F3] text-[#171D38] placeholder-[#747E98] focus:border-[#315DFF] focus:ring-1 focus:ring-[#315DFF]'
              }`}
            />
            <div className="absolute inset-y-0 right-0 pr-2.5 flex items-center pointer-events-none">
              <span className={`text-[10px] font-mono font-medium px-1.5 py-0.5 rounded border ${
                isDark
                  ? 'bg-[#101522] text-slate-300 border-white/10'
                  : 'bg-[#F3F5FC] text-[#747E98] border-[#E3E8F3]'
              }`}>
                ⌘ K
              </span>
            </div>
          </div>
        </div>

        {/* Right Header Actions */}
        <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
          {/* Assistente IA & Copiloto Button */}
          {onOpenDopamineChat && (
            <button
              type="button"
              onClick={onOpenDopamineChat}
              className={`h-8.5 px-3 rounded-xl border flex items-center gap-1.5 text-xs font-semibold transition-colors cursor-pointer shadow-xs ${
                isDark
                  ? 'bg-[#151D31] hover:bg-[#1C2742] border-[rgba(255,255,255,0.08)] text-white'
                  : 'bg-white hover:bg-[#F3F5FC] border-[#E3E8F3] text-[#171D38] hover:text-[#315DFF]'
              }`}
              title="Assistente IA & Copiloto (Conversas e Ações)"
            >
              <Sparkles className={`w-3.5 h-3.5 ${isDark ? 'text-white' : 'text-[#315DFF]'}`} />
              <span className="hidden md:inline">Assistente IA</span>
            </button>
          )}

          {/* Notification Button */}
          <button
            type="button"
            onClick={onOpenQuickCapture}
            className={`relative w-8.5 h-8.5 rounded-xl border flex items-center justify-center transition-colors cursor-pointer shadow-xs ${
              isDark
                ? 'bg-[#151D31] hover:bg-[#1C2742] border-[rgba(255,255,255,0.08)] text-slate-300 hover:text-white'
                : 'bg-white hover:bg-[#F3F5FC] border-[#E3E8F3] text-[#747E98] hover:text-[#171D38]'
            }`}
            title="Nova tarefa rápida"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-rose-500" />
          </button>

          {/* Calendar Button */}
          <button
            type="button"
            onClick={() => onNavigateTab('hoje')}
            className={`w-8.5 h-8.5 rounded-xl border flex items-center justify-center transition-colors cursor-pointer shadow-xs ${
              isDark
                ? 'bg-[#151D31] hover:bg-[#1C2742] border-[rgba(255,255,255,0.08)] text-slate-300 hover:text-white'
                : 'bg-white hover:bg-[#F3F5FC] border-[#E3E8F3] text-[#747E98] hover:text-[#171D38]'
            }`}
            title="Hoje"
          >
            <Calendar className="w-4 h-4" />
          </button>

          {/* Theme Toggle */}
          <button
            type="button"
            onClick={() => {
              if (onChangeThemeMode) {
                const nextMode: ThemeMode = themeMode === 'hybrid' ? 'dark' : themeMode === 'dark' ? 'light' : 'hybrid';
                onChangeThemeMode(nextMode);
              } else if (onToggleTheme) {
                onToggleTheme();
              }
            }}
            className={`w-8.5 h-8.5 rounded-xl border flex items-center justify-center transition-colors cursor-pointer shadow-xs ${
              isDark
                ? 'bg-[#151D31] hover:bg-[#1C2742] border-[rgba(255,255,255,0.08)] text-white'
                : 'bg-white hover:bg-[#F3F5FC] border-[#E3E8F3] text-[#747E98] hover:text-[#315DFF]'
            }`}
            title={`Tema: ${themeMode}`}
          >
            <Sun className={`w-4 h-4 ${isDark ? 'text-white' : 'text-[#315DFF]'}`} />
          </button>
        </div>

      </header>

      {/* ========================================================================
          2. CABEÇALHO DE BOAS-VINDAS (Sem letras azuis no modo escuro)
          ======================================================================== */}
      <div className="space-y-1">
        {/* Dynamic Date */}
        <div className={`flex items-center gap-1.5 text-xs font-medium ${isDark ? 'text-slate-300' : 'text-[#747E98]'}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${isDark ? 'bg-white' : 'bg-[#315DFF]'}`} />
          <span>{formattedDate}</span>
          <span className={isDark ? 'text-slate-600' : 'text-[#CBD5E1]'}>•</span>
          <span className={`font-semibold ${isDark ? 'text-slate-200' : 'text-[#315DFF]'}`}>Operações & Empresas</span>
        </div>

        {/* Welcome Heading (Evita azul no modo escuro para máxima legibilidade) */}
        <h1 className={`text-2xl sm:text-3xl font-extrabold tracking-tight leading-tight ${isDark ? 'text-white' : 'text-[#171D38]'}`}>
          Olá, <span className={isDark ? 'text-white' : 'text-[#315DFF]'}>{userName}.</span>
        </h1>

        {/* Subheading */}
        <p className={`text-xs sm:text-[13px] font-normal ${isDark ? 'text-slate-300' : 'text-[#747E98]'}`}>
          Prioridades executivas e entregas do dia para suas empresas.
        </p>
      </div>

      {/* ========================================================================
          3. CARD PRINCIPAL — SEU FOCO AGORA (Littera / Aura / Empresas)
          ======================================================================== */}
      <div className="relative p-6 sm:p-7 card-focus-refined text-white min-w-0" data-purpose="hero-focus-card">
        
        {/* Options button */}
        <button
          type="button"
          onClick={onOpenQuickCapture}
          className="absolute top-5 right-5 p-1 rounded-lg text-[#747E98] hover:text-white transition-colors cursor-pointer"
          title="Opções da tarefa"
        >
          <MoreHorizontal className="w-4 h-4" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          
          {/* Lado Esquerdo: Badge, Título, Descrição, Tags */}
          <div className="md:col-span-7 flex flex-col justify-center space-y-2.5 min-w-0">
            
            {/* Badge: "Seu foco agora" (Sem texto azul ilegível no modo escuro) */}
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/10 border border-white/20 text-white text-[11px] font-semibold self-start">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              <span>Seu foco agora</span>
            </div>

            {/* Título da Tarefa de Foco das Empresas */}
            <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white leading-snug break-words">
              {currentHeroTask?.title || 'Definir as 3 prioridades essenciais de hoje'}
            </h2>

            {/* Descrição */}
            <p className="text-xs text-slate-200 leading-relaxed font-normal line-clamp-2">
              {currentHeroTask?.description || 'Foco executivo imediato sem distrações ou interrupções.'}
            </p>

            {/* Tags Row (Sem letras azuis para máxima legibilidade) */}
            <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
              <span className="px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-white/10 text-white border border-white/20 flex items-center gap-1">
                <Zap className="w-3 h-3 fill-current text-white" />
                <span>Prioridade {currentHeroTask?.priority === 'urgente' ? 'Urgente' : currentHeroTask?.priority === 'alta' ? 'Alta' : 'Média'}</span>
              </span>

              <span className="px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-white/5 text-slate-200 border border-white/10 flex items-center gap-1">
                <Briefcase className="w-3 h-3 text-slate-300" />
                <span>{currentHeroTask?.area || 'Trabalho'}</span>
              </span>

              {/* Ruído Marrom Toggle */}
              <button
                type="button"
                onClick={toggleBrownNoise}
                className={`px-2.5 py-0.5 rounded-md text-[11px] font-medium transition-colors cursor-pointer flex items-center gap-1 border ${
                  activeAudioTone === 'brown'
                    ? 'bg-white text-slate-900 border-white font-semibold'
                    : 'bg-white/5 text-slate-200 border-white/10 hover:text-white'
                }`}
                title="Ruído Marrom para Foco TDAH"
              >
                {activeAudioTone === 'brown' ? <Volume2 className="w-3 h-3" /> : <VolumeX className="w-3 h-3 text-slate-300" />}
                <span>{activeAudioTone === 'brown' ? 'Som ativo' : 'Som foco'}</span>
              </button>
            </div>
          </div>

          {/* Lado Direito: Timer Pomodoro & Botão Iniciar Foco */}
          <div className="md:col-span-5 flex flex-col items-center justify-center text-center md:pl-6 md:border-l md:border-[rgba(255,255,255,0.08)]">
            
            {/* Timer */}
            <div className="text-5xl lg:text-[54px] font-bold tracking-tight text-white font-mono my-0.5 leading-none">
              {formatTimerTime(timerSeconds)}
            </div>

            <p className="text-[11px] text-slate-300 font-medium mt-1 mb-3.5">
              minutos de foco
            </p>

            {/* Action Button */}
            <button
              type="button"
              onClick={() => setIsTimerRunning(!isTimerRunning)}
              className="w-full max-w-[180px] py-2.5 px-4 rounded-xl text-xs font-semibold btn-electric-clean flex items-center justify-center gap-2 cursor-pointer text-white"
            >
              {isTimerRunning ? (
                <>
                  <Pause className="w-3.5 h-3.5 fill-current" />
                  <span>Pausar foco</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
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
      <section className="space-y-3 pt-1 min-w-0" data-purpose="tasks-list-section">
        
        {/* Header: Title + Status Filter Pills */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="flex items-center gap-2">
            <List className={`w-4 h-4 ${isDark ? 'text-white' : 'text-[#315DFF]'}`} />
            <h3 className={`text-sm font-bold tracking-tight ${isDark ? 'text-white' : 'text-[#171D38]'}`}>
              Tarefas de hoje · Empresas
            </h3>
            <span className={`text-xs font-medium ${isDark ? 'text-slate-400' : 'text-[#747E98]'}`}>
              ({displayTasks.length})
            </span>
          </div>

          {/* Status Filter Pills */}
          <div className="flex items-center gap-1.5 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setTaskStatusFilter('todas')}
              className={`px-2.5 py-0.5 rounded-md text-[11px] font-semibold transition-colors cursor-pointer ${
                taskStatusFilter === 'todas'
                  ? 'bg-[#315DFF] text-white shadow-xs'
                  : isDark
                    ? 'bg-[#151D31] text-slate-300 border border-[rgba(255,255,255,0.08)] hover:text-white'
                    : 'bg-white text-[#747E98] border border-[#E3E8F3]'
              }`}
            >
              Todas {totalCompanyTasks}
            </button>

            <button
              type="button"
              onClick={() => setTaskStatusFilter('pendentes')}
              className={`px-2.5 py-0.5 rounded-md text-[11px] font-semibold transition-colors cursor-pointer ${
                taskStatusFilter === 'pendentes'
                  ? 'bg-[#315DFF] text-white shadow-xs'
                  : isDark
                    ? 'bg-[#151D31] text-slate-300 border border-[rgba(255,255,255,0.08)] hover:text-white'
                    : 'bg-white text-[#747E98] border border-[#E3E8F3]'
              }`}
            >
              Pendentes {pendingCompanyTasks}
            </button>

            <button
              type="button"
              onClick={() => setTaskStatusFilter('concluidas')}
              className={`px-2.5 py-0.5 rounded-md text-[11px] font-semibold transition-colors cursor-pointer ${
                taskStatusFilter === 'concluidas'
                  ? 'bg-[#315DFF] text-white shadow-xs'
                  : isDark
                    ? 'bg-[#151D31] text-slate-300 border border-[rgba(255,255,255,0.08)] hover:text-white'
                    : 'bg-white text-[#747E98] border border-[#E3E8F3]'
              }`}
            >
              Concluídas {completedCompanyTasks}
            </button>
          </div>
        </div>

        {/* List of Tasks (Linear Horizontal Rows) */}
        <div className="flex flex-col gap-2 min-w-0">
          {displayTasks.length === 0 ? (
            <div className={`py-12 px-4 rounded-xl border text-center space-y-1 ${
              isDark 
                ? 'bg-[#151D31] border-[rgba(255,255,255,0.08)] text-white' 
                : 'bg-white border-[#E3E8F3] text-[#171D38]'
            }`}>
              <p className="text-xs font-semibold">Nenhuma tarefa pendente das empresas para hoje.</p>
              <p className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-[#747E98]'}`}>Tudo em dia nas suas operações executivas.</p>
            </div>
          ) : (
            displayTasks.map((task) => {
              const isCompleted = task.status === 'concluido';
              const isSelectedHero = Boolean(currentHeroTask?.id && task.id === currentHeroTask.id);

              return (
                <div
                  key={task.id}
                  onClick={() => {
                    setSelectedFocusTaskId(task.id);
                    if (onEditTask) onEditTask(task);
                  }}
                  className={`group px-4 py-3 rounded-xl border flex items-center justify-between gap-3 transition-colors cursor-pointer shadow-xs min-w-0 ${
                    isDark 
                      ? isSelectedHero 
                        ? 'bg-[#182238] border-white/40 ring-1 ring-white/20' 
                        : 'bg-[#151D31] border-[rgba(255,255,255,0.08)] hover:border-slate-600'
                      : isSelectedHero
                        ? 'bg-white border-[#315DFF] ring-1 ring-[#315DFF]/20'
                        : 'bg-white border-[#E3E8F3] hover:border-[#CBD5E1]'
                  } ${isCompleted ? 'opacity-60' : 'opacity-100'}`}
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    {/* Checkbox */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleTask(task.id);
                      }}
                      className={`w-4.5 h-4.5 rounded-full border flex items-center justify-center transition-colors cursor-pointer shrink-0 ${
                        isCompleted
                          ? 'bg-[#315DFF] border-[#315DFF] text-white'
                          : isDark
                            ? 'border-slate-600 hover:border-white bg-[#151D31]'
                            : 'border-[#CBD5E1] hover:border-[#315DFF] bg-white'
                      }`}
                      title={isCompleted ? "Marcar como pendente" : "Marcar como concluída"}
                    >
                      {isCompleted && <Check className="w-2.5 h-2.5 text-white stroke-[3]" />}
                    </button>

                    {/* Task Title (Sem texto azul no modo escuro) */}
                    <span className={`text-xs sm:text-[13.5px] font-medium truncate transition-colors ${
                      isCompleted 
                        ? isDark ? 'line-through text-slate-500' : 'line-through text-[#747E98]' 
                        : isDark
                          ? 'text-white group-hover:text-slate-100'
                          : 'text-[#171D38] group-hover:text-[#315DFF]'
                    }`}>
                      {task.title}
                    </span>
                  </div>

                  {/* Right side: Company Badge, Deadline & Chevron */}
                  <div className="flex items-center gap-2.5 shrink-0">
                    {getCompanyBadge(task)}
                    
                    {task.deadline && (
                      <span className={`hidden sm:inline-flex text-[11px] font-medium ${isDark ? 'text-slate-300' : 'text-[#747E98]'}`}>
                        {task.deadline}
                      </span>
                    )}

                    <ChevronRight className={`w-4 h-4 transition-transform group-hover:translate-x-0.5 ${
                      isDark ? 'text-slate-500 group-hover:text-white' : 'text-[#CBD5E1] group-hover:text-[#315DFF]'
                    }`} />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>

    </div>
  );
};
