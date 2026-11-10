import React, { useState } from 'react';
import { 
  CheckSquare, 
  Plus, 
  LayoutList, 
  Kanban, 
  Calendar as CalendarIcon, 
  Circle, 
  CheckCircle2, 
  Play, 
  Edit3, 
  Trash2, 
  Clock, 
  Sparkles, 
  Flame, 
  Activity
} from 'lucide-react';
import { Task, Project, EnergyLevel, Priority, TaskStatus, ContextFilter, ContextArea } from '../../types';
import { PriorityBadge } from '../../lib/priorityUtils';

interface TasksViewProps {
  tasks: Task[];
  projects: Project[];
  isDarkMode?: boolean;
  onToggleTask: (taskId: string) => void;
  onOpenTaskModal: (taskToEdit?: Task | null) => void;
  onDeleteTask: (taskId: string) => void;
  onUpdateTaskStatus?: (taskId: string, newStatus: TaskStatus) => void;
  onStartFocus: (task: Task) => void;
  onRequestSliceTask?: (task: Task) => void;
}

export const TasksView: React.FC<TasksViewProps> = ({
  tasks,
  projects,
  isDarkMode = true,
  onToggleTask,
  onOpenTaskModal,
  onDeleteTask,
  onStartFocus
}) => {
  const [viewMode, setViewMode] = useState<'lista' | 'kanban' | 'calendario'>('lista');
  const [contextFilter, setContextFilter] = useState<ContextFilter>('todos');
  const [filterEnergy] = useState<EnergyLevel | 'all'>('all');
  const [filterPriority, setFilterPriority] = useState<Priority | 'all'>('all');
  const [filterProject] = useState<string | 'all'>('all');

  const PRIORITY_WEIGHT: Record<Priority, number> = {
    urgente: 4,
    alta: 3,
    media: 2,
    baixa: 1
  };

  const filteredTasks = tasks.filter(t => {
    if (contextFilter !== 'todos' && t.area !== contextFilter) return false;
    if (filterPriority !== 'all' && t.priority !== filterPriority) return false;
    if (filterEnergy !== 'all' && t.energy_level !== filterEnergy) return false;
    if (filterProject !== 'all' && t.project_id !== filterProject) return false;
    return true;
  });

  const pendingQueue = [...filteredTasks.filter(t => t.status !== 'concluido')].sort((a, b) => {
    const wA = PRIORITY_WEIGHT[a.priority] || 2;
    const wB = PRIORITY_WEIGHT[b.priority] || 2;
    return wB - wA;
  });

  const completedQueue = [...filteredTasks.filter(t => t.status === 'concluido')].sort((a, b) => {
    const tA = a.completed_at ? new Date(a.completed_at).getTime() : 0;
    const tB = b.completed_at ? new Date(b.completed_at).getTime() : 0;
    return tB - tA;
  });

  const getEnergyBadge = (lvl: EnergyLevel) => {
    switch (lvl) {
      case 'low':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-[6px] border bg-[#22c55e]/15 text-[#16a34a] dark:text-[#22c55e] border-[#22c55e]/30 tracking-[-0.12px]">
            <Sparkles className="w-2.5 h-2.5" />
            <span>Baixa</span>
          </span>
        );
      case 'medium':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-[6px] border bg-[#0099ff]/15 text-[#0077cc] dark:text-[#0099ff] border-[#0099ff]/30 tracking-[-0.12px]">
            <Activity className="w-2.5 h-2.5" />
            <span>Média</span>
          </span>
        );
      case 'high':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-[6px] border bg-[#ff7a3d]/15 text-[#ea580c] dark:text-[#ff7a3d] border-[#ff7a3d]/30 tracking-[-0.12px]">
            <Flame className="w-2.5 h-2.5 fill-current" />
            <span>Alta</span>
          </span>
        );
    }
  };

  const getAreaBadge = (area: ContextArea) => {
    switch (area) {
      case 'Littera':
        return 'bg-[#0099ff]/15 text-[#0077cc] dark:text-[#0099ff] border-[#0099ff]/30';
      case 'Aura':
        return 'bg-[#6a4cf5]/15 text-[#6a4cf5] dark:text-[#d44df0] border-[#6a4cf5]/35';
      case 'IDP':
        return 'bg-[#22c55e]/15 text-[#16a34a] dark:text-[#22c55e] border-[#22c55e]/30';
      case 'Pessoal':
      default:
        return isDarkMode
          ? 'bg-[#1c1c1c] text-[#999999] border-[#262626]'
          : 'bg-[#efefef] text-[#666666] border-[#e4e4e7]';
    }
  };

  const contextOptions: ContextFilter[] = ['todos', 'Aura', 'Littera', 'IDP', 'Pessoal'];

  const kanbanColumns: { id: TaskStatus; label: string }[] = [
    { id: 'inbox', label: 'Inbox' },
    { id: 'a_fazer', label: 'A Fazer' },
    { id: 'em_andamento', label: 'Em Andamento' },
    { id: 'concluido', label: 'Concluído' }
  ];

  return (
    <div className="flex flex-col gap-6 text-left select-none" data-purpose="tasks-view">
      
      {/* Top Header Row */}
      <header
        className={`flex items-center justify-between text-[13px] pb-3 border-b ${
          isDarkMode ? 'border-[#262626]' : 'border-[#e4e4e7]'
        }`}
      >
        <div
          className={`flex items-center gap-1.5 font-medium ${
            isDarkMode ? 'text-[#999999]' : 'text-[#666666]'
          }`}
        >
          <span className="hover:text-[#0099ff] transition-colors cursor-pointer">Meu espaço</span>
          <span className={isDarkMode ? 'text-[#262626]' : 'text-[#d4d4d8]'}>/</span>
          <span className={`font-medium ${isDarkMode ? 'text-[#ffffff]' : 'text-[#090909]'}`}>Tarefas</span>
        </div>

        <div className="flex items-center gap-3">
          {/* View Switcher: Framer Pill Control */}
          <div
            className={`p-1 rounded-full flex items-center gap-1 border ${
              isDarkMode
                ? 'bg-[#141414] border-[#262626]'
                : 'bg-[#efefef] border-[#e4e4e7]'
            }`}
          >
            <button
              type="button"
              onClick={() => setViewMode('lista')}
              className={`px-3.5 py-1.5 rounded-full text-[13px] font-medium tracking-[-0.13px] flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'lista'
                  ? isDarkMode
                    ? 'bg-[#1c1c1c] text-[#ffffff]'
                    : 'bg-[#ffffff] text-[#090909] shadow-xs'
                  : isDarkMode
                    ? 'text-[#999999] hover:text-[#ffffff]'
                    : 'text-[#666666] hover:text-[#090909]'
              }`}
            >
              <LayoutList className="w-3.5 h-3.5" />
              <span>Lista</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode('kanban')}
              className={`px-3.5 py-1.5 rounded-full text-[13px] font-medium tracking-[-0.13px] flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'kanban'
                  ? isDarkMode
                    ? 'bg-[#1c1c1c] text-[#ffffff]'
                    : 'bg-[#ffffff] text-[#090909] shadow-xs'
                  : isDarkMode
                    ? 'text-[#999999] hover:text-[#ffffff]'
                    : 'text-[#666666] hover:text-[#090909]'
              }`}
            >
              <Kanban className="w-3.5 h-3.5" />
              <span>Kanban</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode('calendario')}
              className={`px-3.5 py-1.5 rounded-full text-[13px] font-medium tracking-[-0.13px] flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'calendario'
                  ? isDarkMode
                    ? 'bg-[#1c1c1c] text-[#ffffff]'
                    : 'bg-[#ffffff] text-[#090909] shadow-xs'
                  : isDarkMode
                    ? 'text-[#999999] hover:text-[#ffffff]'
                    : 'text-[#666666] hover:text-[#090909]'
              }`}
            >
              <CalendarIcon className="w-3.5 h-3.5" />
              <span>Prazos</span>
            </button>
          </div>

          {/* Framer Primary CTA: White Pill on Dark / Black Pill on Light */}
          <button
            type="button"
            onClick={() => onOpenTaskModal(null)}
            className={`inline-flex items-center gap-1.5 px-[15px] py-[10px] rounded-full active:scale-[0.98] font-medium text-[14px] tracking-[-0.14px] transition-all cursor-pointer ${
              isDarkMode
                ? 'bg-[#ffffff] hover:bg-[#f0f0f0] text-[#000000]'
                : 'bg-[#090909] hover:bg-[#222222] text-[#ffffff]'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Nova tarefa</span>
          </button>
        </div>
      </header>

      {/* Hero Header & Filter Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1
            className={`text-[32px] sm:text-[40px] font-medium tracking-[-1.8px] leading-[1.05] ${
              isDarkMode ? 'text-[#ffffff]' : 'text-[#090909]'
            }`}
          >
            Central de Tarefas
          </h1>
          <p
            className={`text-[15px] mt-1 font-normal tracking-[-0.15px] ${
              isDarkMode ? 'text-[#999999]' : 'text-[#666666]'
            }`}
          >
            Organização sem sobrecarga. Uma entrega de cada vez.
          </p>
        </div>

        {/* Filtros de Contexto (Framer Pill Tabs) */}
        <div
          className={`p-1 rounded-full flex items-center gap-1 border overflow-x-auto ${
            isDarkMode
              ? 'bg-[#141414] border-[#262626]'
              : 'bg-[#efefef] border-[#e4e4e7]'
          }`}
        >
          {contextOptions.map(ctx => {
            const isActive = contextFilter === ctx;
            const count = ctx === 'todos' ? tasks.length : tasks.filter(t => t.area === ctx).length;

            return (
              <button
                key={ctx}
                type="button"
                onClick={() => setContextFilter(ctx)}
                className={`px-3.5 py-1.5 rounded-full text-[13px] font-medium tracking-[-0.13px] transition-all duration-150 cursor-pointer capitalize tabular-nums ${
                  isActive
                    ? isDarkMode
                      ? 'bg-[#1c1c1c] text-[#ffffff]'
                      : 'bg-[#ffffff] text-[#090909] shadow-xs'
                    : isDarkMode
                      ? 'text-[#999999] hover:text-[#ffffff]'
                      : 'text-[#666666] hover:text-[#090909]'
                }`}
              >
                {ctx} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Filtro por Temperatura de Prioridade */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-[13px]">
        <span
          className={`font-mono text-[11px] uppercase tracking-[0.06em] shrink-0 font-medium ${
            isDarkMode ? 'text-[#999999]' : 'text-[#666666]'
          }`}
        >
          Prioridade:
        </span>
        <button
          type="button"
          onClick={() => setFilterPriority('all')}
          className={`px-3 py-1 rounded-full text-[13px] font-medium tracking-[-0.13px] transition cursor-pointer border tabular-nums ${
            filterPriority === 'all'
              ? isDarkMode
                ? 'bg-[#1c1c1c] text-[#ffffff] border-[#262626]'
                : 'bg-[#090909] text-[#ffffff] border-[#090909]'
              : isDarkMode
                ? 'bg-transparent border-transparent text-[#999999] hover:text-[#ffffff]'
                : 'bg-transparent border-transparent text-[#666666] hover:text-[#090909]'
          }`}
        >
          Todas ({tasks.length})
        </button>
        <button
          type="button"
          onClick={() => setFilterPriority('urgente')}
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[13px] font-medium tracking-[-0.13px] transition cursor-pointer border tabular-nums ${
            filterPriority === 'urgente'
              ? 'bg-[#ff5577]/15 text-[#e11d48] dark:text-[#ff5577] border-[#ff5577]/40'
              : 'text-[#e11d48] dark:text-[#ff5577]/80 hover:bg-[#ff5577]/10 border-transparent'
          }`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#ff5577]"></span>
          <span>Urgente ({tasks.filter(t => t.priority === 'urgente').length})</span>
        </button>
        <button
          type="button"
          onClick={() => setFilterPriority('alta')}
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[13px] font-medium tracking-[-0.13px] transition cursor-pointer border tabular-nums ${
            filterPriority === 'alta'
              ? 'bg-[#ff7a3d]/15 text-[#ea580c] dark:text-[#ff7a3d] border-[#ff7a3d]/40'
              : 'text-[#ea580c] dark:text-[#ff7a3d]/80 hover:bg-[#ff7a3d]/10 border-transparent'
          }`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#ff7a3d]"></span>
          <span>Alta ({tasks.filter(t => t.priority === 'alta').length})</span>
        </button>
        <button
          type="button"
          onClick={() => setFilterPriority('media')}
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[13px] font-medium tracking-[-0.13px] transition cursor-pointer border tabular-nums ${
            filterPriority === 'media'
              ? 'bg-[#0099ff]/15 text-[#0077cc] dark:text-[#0099ff] border-[#0099ff]/40'
              : 'text-[#0077cc] dark:text-[#0099ff]/80 hover:bg-[#0099ff]/10 border-transparent'
          }`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#0099ff]"></span>
          <span>Média ({tasks.filter(t => t.priority === 'media').length})</span>
        </button>
        <button
          type="button"
          onClick={() => setFilterPriority('baixa')}
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[13px] font-medium tracking-[-0.13px] transition cursor-pointer border tabular-nums ${
            filterPriority === 'baixa'
              ? 'bg-[#22c55e]/15 text-[#16a34a] dark:text-[#22c55e] border-[#22c55e]/40'
              : 'text-[#16a34a] dark:text-[#22c55e]/80 hover:bg-[#22c55e]/10 border-transparent'
          }`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e]"></span>
          <span>Baixa ({tasks.filter(t => t.priority === 'baixa').length})</span>
        </button>
      </div>

      {/* 1. VISUALIZAÇÃO: LISTA (FILA DE EXECUÇÃO + FILA DE CONCLUÍDAS) */}
      {viewMode === 'lista' && (
        <div className="space-y-6">
          {filteredTasks.length === 0 ? (
            <div
              className={`text-center py-12 px-4 border border-dashed rounded-[20px] ${
                isDarkMode
                  ? 'border-[#262626] bg-[#141414]'
                  : 'border-[#e4e4e7] bg-[#ffffff]'
              }`}
            >
              <CheckSquare className={`w-8 h-8 mx-auto mb-2 ${isDarkMode ? 'text-[#999999]' : 'text-[#666666]'}`} />
              <p className={`text-[14px] ${isDarkMode ? 'text-[#999999]' : 'text-[#666666]'}`}>
                Nenhuma tarefa correspondente aos filtros atuais.
              </p>
            </div>
          ) : (
            <>
              {/* Fila de Execução (Pendentes) */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#0099ff]" />
                    <span className={`text-[12px] font-mono uppercase tracking-wider font-semibold ${isDarkMode ? 'text-[#ffffff]' : 'text-[#090909]'}`}>
                      Fila de Execução ({pendingQueue.length})
                    </span>
                  </div>
                </div>

                {pendingQueue.length === 0 ? (
                  <div
                    className={`p-6 rounded-[15px] border border-dashed text-center text-[13px] ${
                      isDarkMode ? 'border-[#262626] bg-[#141414]/40 text-[#999999]' : 'border-[#e4e4e7] bg-[#ffffff] text-[#666666]'
                    }`}
                  >
                    Todas as tarefas filtradas foram concluídas!
                  </div>
                ) : (
                  pendingQueue.map((t, idx) => {
                    const project = projects.find(p => p.id === t.project_id);

                    return (
                      <div
                        key={t.id}
                        className={`p-4 rounded-[15px] border transition-all duration-150 flex items-center justify-between gap-3 group ${
                          idx === 0
                            ? isDarkMode
                              ? 'bg-[#1c1c1c] border-[#0099ff]/60'
                              : 'bg-[#ffffff] border-[#0099ff]'
                            : isDarkMode
                              ? 'bg-[#141414] border-[#262626] hover:bg-[#1c1c1c]'
                              : 'bg-[#ffffff] border-[#e4e4e7] hover:bg-[#efefef]/60 shadow-[0_1px_2px_rgba(0,0,0,0.02)]'
                        }`}
                      >
                        <div className="flex items-center gap-3.5 flex-1 min-w-0">
                          <button
                            type="button"
                            onClick={() => onToggleTask(t.id)}
                            className="cursor-pointer p-0.5 transition-colors shrink-0"
                            title="Concluir e subir a próxima da fila"
                          >
                            <Circle
                              className={`w-5 h-5 ${
                                isDarkMode
                                  ? 'text-[#999999] hover:text-[#22c55e]'
                                  : 'text-[#999999] hover:text-[#22c55e]'
                              }`}
                            />
                          </button>

                          <div className="min-w-0 flex-1 text-left">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span
                                className={`px-2 py-0.5 rounded-[6px] text-[11px] font-mono font-semibold border ${
                                  idx === 0
                                    ? 'bg-[#0099ff]/15 border-[#0099ff]/40 text-[#0099ff]'
                                    : idx === 1
                                      ? 'bg-[#6a4cf5]/15 border-[#6a4cf5]/40 text-[#6a4cf5] dark:text-[#d44df0]'
                                      : isDarkMode
                                        ? 'bg-[#1c1c1c] border-[#262626] text-[#999999]'
                                        : 'bg-[#efefef] border-[#e4e4e7] text-[#666666]'
                                }`}
                              >
                                {idx === 0 ? '#1 · Topo' : idx === 1 ? '#2 · Seguinte' : `#${idx + 1}`}
                              </span>

                              <span
                                className={`text-[15px] font-medium tracking-[-0.15px] truncate ${
                                  isDarkMode ? 'text-[#ffffff]' : 'text-[#090909]'
                                }`}
                              >
                                {t.title}
                              </span>
                              <span className={`px-2 py-0.5 rounded-[6px] text-[11px] font-medium border ${getAreaBadge(t.area)}`}>
                                {t.area}
                              </span>
                              <PriorityBadge priority={t.priority} isDarkMode={isDarkMode} size="xs" />
                            </div>

                            <div
                              className={`flex items-center gap-2 text-[13px] mt-1 font-normal flex-wrap ${
                                isDarkMode ? 'text-[#999999]' : 'text-[#666666]'
                              }`}
                            >
                              {project && (
                                <span className={`font-medium ${isDarkMode ? 'text-[#ffffff]' : 'text-[#090909]'}`}>
                                  {project.title}
                                </span>
                              )}
                              {project && <span>·</span>}
                              <span className="flex items-center gap-1 tabular-nums">
                                <Clock className="w-3 h-3" />
                                {t.estimated_minutes}m
                              </span>
                              {t.deadline && (
                                <>
                                  <span>·</span>
                                  <span className="tabular-nums">Prazo: {t.deadline}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 flex-shrink-0">
                          {getEnergyBadge(t.energy_level)}

                          <button
                            type="button"
                            onClick={() => onStartFocus(t)}
                            className={`px-3.5 py-1.5 rounded-full text-[13px] font-medium tracking-[-0.13px] transition cursor-pointer flex items-center gap-1.5 active:scale-[0.98] ${
                              isDarkMode
                                ? 'bg-[#ffffff] text-[#000000] hover:bg-[#f0f0f0]'
                                : 'bg-[#090909] text-[#ffffff] hover:bg-[#222222]'
                            }`}
                          >
                            <Play className="w-3 h-3 fill-current" />
                            <span className="hidden sm:inline">Focar</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => onOpenTaskModal(t)}
                            className={`p-1.5 rounded-full transition cursor-pointer opacity-0 group-hover:opacity-100 ${
                              isDarkMode
                                ? 'text-[#999999] hover:text-[#ffffff] hover:bg-[#262626]'
                                : 'text-[#666666] hover:text-[#090909] hover:bg-[#efefef]'
                            }`}
                            title="Editar"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => onDeleteTask(t.id)}
                            className="p-1.5 rounded-full text-[#999999] hover:text-[#ff5577] transition cursor-pointer opacity-0 group-hover:opacity-100"
                            title="Excluir"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Fila de Concluídas */}
              <div className={`space-y-2.5 pt-4 border-t ${isDarkMode ? 'border-[#262626]' : 'border-[#e4e4e7]'}`}>
                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#22c55e]" />
                    <span className={`text-[12px] font-mono uppercase tracking-wider font-semibold ${isDarkMode ? 'text-[#ffffff]' : 'text-[#090909]'}`}>
                      Fila de Concluídas ({completedQueue.length})
                    </span>
                  </div>
                </div>

                {completedQueue.length === 0 ? (
                  <div
                    className={`p-5 rounded-[15px] border border-dashed text-center text-[13px] ${
                      isDarkMode ? 'border-[#262626] bg-[#141414]/40 text-[#999999]' : 'border-[#e4e4e7] bg-[#ffffff] text-[#666666]'
                    }`}
                  >
                    Nenhuma tarefa concluída ainda nesta visualização.
                  </div>
                ) : (
                  completedQueue.map((t, idx) => {
                    const project = projects.find(p => p.id === t.project_id);

                    return (
                      <div
                        key={t.id}
                        className={`p-4 rounded-[15px] border transition-all duration-150 flex items-center justify-between gap-3 group ${
                          isDarkMode
                            ? 'bg-[#141414]/60 border-[#262626] opacity-75'
                            : 'bg-[#ffffff]/80 border-[#e4e4e7] opacity-80'
                        }`}
                      >
                        <div className="flex items-center gap-3.5 flex-1 min-w-0">
                          <button
                            type="button"
                            onClick={() => onToggleTask(t.id)}
                            className="cursor-pointer p-0.5 transition-colors shrink-0"
                            title="Devolver para a Fila de Execução"
                          >
                            <CheckCircle2 className="w-5 h-5 text-[#22c55e]" />
                          </button>

                          <div className="min-w-0 flex-1 text-left">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="px-2 py-0.5 rounded-[6px] text-[11px] font-mono font-medium bg-[#22c55e]/15 border border-[#22c55e]/30 text-[#16a34a] dark:text-[#22c55e]">
                                ✓ Concluída #{idx + 1}
                              </span>
                              <span className="text-[15px] font-medium tracking-[-0.15px] truncate line-through text-[#999999]">
                                {t.title}
                              </span>
                              <span className={`px-2 py-0.5 rounded-[6px] text-[11px] font-medium border ${getAreaBadge(t.area)}`}>
                                {t.area}
                              </span>
                            </div>

                            {project && (
                              <div className={`text-[12px] mt-1 ${isDarkMode ? 'text-[#999999]' : 'text-[#666666]'}`}>
                                {project.title}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 flex-shrink-0">
                          <button
                            type="button"
                            onClick={() => onDeleteTask(t.id)}
                            className="p-1.5 rounded-full text-[#999999] hover:text-[#ff5577] transition cursor-pointer opacity-0 group-hover:opacity-100"
                            title="Excluir"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </>
          )}
        </div>
      )}

      {/* 2. VISUALIZAÇÃO: KANBAN */}
      {viewMode === 'kanban' && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start overflow-x-auto pb-4">
          {kanbanColumns.map(col => {
            const colTasks = filteredTasks.filter(t => t.status === col.id);

            return (
              <div 
                key={col.id} 
                className={`rounded-[20px] p-4 space-y-3 min-w-[240px] border ${
                  isDarkMode
                    ? 'bg-[#141414] border-[#262626]'
                    : 'bg-[#efefef]/60 border-[#e4e4e7]'
                }`}
              >
                <div
                  className={`flex items-center justify-between pb-2.5 border-b ${
                    isDarkMode ? 'border-[#262626]' : 'border-[#e4e4e7]'
                  }`}
                >
                  <h4
                    className={`text-[13px] font-medium tracking-[-0.13px] ${
                      isDarkMode ? 'text-[#ffffff]' : 'text-[#090909]'
                    }`}
                  >
                    {col.label}
                  </h4>
                  <span
                    className={`text-[11px] font-mono px-2 py-0.5 rounded-full font-medium border tabular-nums ${
                      isDarkMode
                        ? 'bg-[#1c1c1c] text-[#999999] border-[#262626]'
                        : 'bg-[#ffffff] text-[#666666] border-[#e4e4e7]'
                    }`}
                  >
                    {colTasks.length}
                  </span>
                </div>

                <div className="space-y-2.5 min-h-[160px]">
                  {colTasks.map(t => (
                    <div
                      key={t.id}
                      onClick={() => onOpenTaskModal(t)}
                      className={`p-3.5 rounded-[15px] border transition-all duration-150 cursor-pointer text-left space-y-2.5 ${
                        isDarkMode
                          ? 'bg-[#1c1c1c] border-[#262626] hover:border-[#0099ff]/60'
                          : 'bg-[#ffffff] border-[#e4e4e7] hover:border-[#0099ff] shadow-[0_1px_2px_rgba(0,0,0,0.03)]'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1.5">
                        <span className={`px-2 py-0.5 rounded-[6px] text-[10px] font-medium border ${getAreaBadge(t.area)}`}>
                          {t.area}
                        </span>
                        <PriorityBadge priority={t.priority} isDarkMode={isDarkMode} size="xs" />
                      </div>
                      <span
                        className={`text-[14px] font-medium tracking-[-0.14px] block line-clamp-2 ${
                          isDarkMode ? 'text-[#ffffff]' : 'text-[#090909]'
                        }`}
                      >
                        {t.title}
                      </span>
                      <div
                        className={`flex items-center justify-between text-[12px] font-normal pt-2 border-t ${
                          isDarkMode
                            ? 'border-[#262626] text-[#999999]'
                            : 'border-[#e4e4e7] text-[#666666]'
                        }`}
                      >
                        <span className="tabular-nums">{t.estimated_minutes}m</span>
                        {getEnergyBadge(t.energy_level)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 3. VISUALIZAÇÃO: CALENDÁRIO / PRAZOS */}
      {viewMode === 'calendario' && (
        <div
          className={`p-6 rounded-[20px] border space-y-4 ${
            isDarkMode
              ? 'bg-[#141414] border-[#262626]'
              : 'bg-[#ffffff] border-[#e4e4e7] shadow-[0_1px_4px_rgba(0,0,0,0.03)]'
          }`}
        >
          <h3
            className={`text-[18px] font-semibold tracking-[-0.4px] ${
              isDarkMode ? 'text-[#ffffff]' : 'text-[#090909]'
            }`}
          >
            Prazos & Entregas Programadas
          </h3>
          <div className="space-y-2.5">
            {filteredTasks.filter(t => t.deadline).length === 0 ? (
              <p className={`text-[14px] ${isDarkMode ? 'text-[#999999]' : 'text-[#666666]'}`}>
                Nenhuma tarefa com prazo programado.
              </p>
            ) : (
              filteredTasks.filter(t => t.deadline).map(t => (
                <div 
                  key={t.id} 
                  className={`flex items-center justify-between p-4 rounded-[15px] border text-[14px] transition-colors ${
                    isDarkMode
                      ? 'border-[#262626] bg-[#1c1c1c] hover:border-[#0099ff]/50'
                      : 'border-[#e4e4e7] bg-[#f7f7f8] hover:border-[#0099ff]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <CalendarIcon className="w-4 h-4 text-[#0099ff]" />
                    <span className={`font-medium ${isDarkMode ? 'text-[#ffffff]' : 'text-[#090909]'}`}>
                      {t.title}
                    </span>
                    <span className={`px-2 py-0.5 rounded-[6px] text-[11px] font-medium border ${getAreaBadge(t.area)}`}>
                      {t.area}
                    </span>
                    <PriorityBadge priority={t.priority} isDarkMode={isDarkMode} size="xs" />
                  </div>
                  <span className="font-mono text-[13px] font-medium text-[#0099ff] tabular-nums">
                    {t.deadline}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
