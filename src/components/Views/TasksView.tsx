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
  Activity,
  ArrowRight
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
  isDarkMode = false,
  onToggleTask,
  onOpenTaskModal,
  onDeleteTask,
  onStartFocus,
  onRequestSliceTask
}) => {
  const [viewMode, setViewMode] = useState<'lista' | 'kanban' | 'calendario'>('lista');
  const [contextFilter, setContextFilter] = useState<ContextFilter>('todos');
  const [filterEnergy, setFilterEnergy] = useState<EnergyLevel | 'all'>('all');
  const [filterPriority, setFilterPriority] = useState<Priority | 'all'>('all');
  const [filterProject, setFilterProject] = useState<string | 'all'>('all');

  const filteredTasks = tasks.filter(t => {
    if (contextFilter !== 'todos' && t.area !== contextFilter) return false;
    if (filterPriority !== 'all' && t.priority !== filterPriority) return false;
    if (filterEnergy !== 'all' && t.energy_level !== filterEnergy) return false;
    if (filterProject !== 'all' && t.project_id !== filterProject) return false;
    return true;
  });

  const getEnergyBadge = (lvl: EnergyLevel) => {
    switch (lvl) {
      case 'low':
        return (
          <span className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md border ${
            isDarkMode 
              ? 'bg-emerald-950/40 text-emerald-400 border-emerald-800/40' 
              : 'bg-emerald-50 text-emerald-700 border-emerald-200'
          }`}>
            <Sparkles className="w-2.5 h-2.5" />
            <span>Baixa</span>
          </span>
        );
      case 'medium':
        return (
          <span className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md border ${
            isDarkMode 
              ? 'bg-sky-950/40 text-sky-400 border-sky-800/40' 
              : 'bg-sky-50 text-sky-700 border-sky-200'
          }`}>
            <Activity className="w-2.5 h-2.5" />
            <span>Média</span>
          </span>
        );
      case 'high':
        return (
          <span className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md border ${
            isDarkMode 
              ? 'bg-amber-950/40 text-amber-400 border-amber-800/40' 
              : 'bg-amber-50 text-amber-800 border-amber-200'
          }`}>
            <Flame className="w-2.5 h-2.5 fill-current" />
            <span>Alta</span>
          </span>
        );
    }
  };

  const getAreaBadge = (area: ContextArea) => {
    switch (area) {
      case 'Littera':
        return isDarkMode 
          ? 'bg-blue-950/70 text-white border-blue-600/40' 
          : 'bg-[#EEF4FF] text-[#245BFF] border-[#D4E2FF]';
      case 'Aura':
        return isDarkMode 
          ? 'bg-purple-950/70 text-white border-purple-500/40' 
          : 'bg-[#F0EEFF] text-[#6E56CF] border-[#D2DCE8]';
      case 'IDP':
        return isDarkMode 
          ? 'bg-emerald-950/70 text-white border-emerald-500/40' 
          : 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Pessoal':
      default:
        return isDarkMode 
          ? 'bg-[#20293B] text-slate-200 border-[#2E3C56]' 
          : 'bg-[#F5F7FB] text-[#687386] border-[#E5EAF2]';
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
      <header className="flex items-center justify-between text-xs pb-3 border-b border-[#E5EAF2] dark:border-[#263248]">
        <div className={`flex items-center gap-1.5 font-medium ${isDarkMode ? 'text-[#94A3B8]' : 'text-[#687386]'}`}>
          <span className="hover:text-[#245BFF] transition-colors cursor-pointer">Meu espaço</span>
          <span className={isDarkMode ? 'text-[#64748B]' : 'text-[#D2DCE8]'}>/</span>
          <span className={`font-semibold ${isDarkMode ? 'text-[#F1F5F9]' : 'text-[#172033]'}`}>Tarefas</span>
        </div>

        <div className="flex items-center gap-3">
          {/* View Switcher: Segmented Soft Tech Control */}
          <div className={`p-1 rounded-xl flex items-center gap-1 border ${
            isDarkMode ? 'bg-[#1C2333] border-[#263248]' : 'bg-[#E9EFF8] border-[#E5EAF2]'
          }`}>
            <button
              type="button"
              onClick={() => setViewMode('lista')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'lista'
                  ? isDarkMode
                    ? 'bg-[#315DFF] text-white font-semibold shadow-xs'
                    : 'bg-[#FFFFFF] text-[#245BFF] font-semibold shadow-xs border border-[#E5EAF2]'
                  : isDarkMode
                    ? 'text-[#94A3B8] hover:text-[#F1F5F9]'
                    : 'text-[#687386] hover:text-[#172033]'
              }`}
            >
              <LayoutList className="w-3.5 h-3.5" />
              <span>Lista</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode('kanban')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'kanban'
                  ? isDarkMode
                    ? 'bg-[#315DFF] text-white font-semibold shadow-xs'
                    : 'bg-[#FFFFFF] text-[#245BFF] font-semibold shadow-xs border border-[#E5EAF2]'
                  : isDarkMode
                    ? 'text-[#94A3B8] hover:text-[#F1F5F9]'
                    : 'text-[#687386] hover:text-[#172033]'
              }`}
            >
              <Kanban className="w-3.5 h-3.5" />
              <span>Kanban</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode('calendario')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'calendario'
                  ? isDarkMode
                    ? 'bg-[#315DFF] text-white font-semibold shadow-xs'
                    : 'bg-[#FFFFFF] text-[#245BFF] font-semibold shadow-xs border border-[#E5EAF2]'
                  : isDarkMode
                    ? 'text-[#94A3B8] hover:text-[#F1F5F9]'
                    : 'text-[#687386] hover:text-[#172033]'
              }`}
            >
              <CalendarIcon className="w-3.5 h-3.5" />
              <span>Prazos</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => onOpenTaskModal(null)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#245BFF] hover:bg-[#1A4EE5] active:scale-[0.98] text-white font-semibold text-xs tracking-wide shadow-[0_2px_8px_-1px_rgba(58,98,255,0.35)] transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Nova tarefa</span>
          </button>
        </div>
      </header>

      {/* Hero Header & Filter Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className={`text-2xl sm:text-3xl font-bold tracking-tight ${
            isDarkMode ? 'text-[#F1F5F9]' : 'text-[#172033]'
          }`}>
            Central de Tarefas
          </h1>
          <p className={`text-sm mt-1 font-normal ${isDarkMode ? 'text-[#94A3B8]' : 'text-[#687386]'}`}>
            Organização sem sobrecarga. Uma entrega de cada vez.
          </p>
        </div>

        {/* Filtros de Contexto */}
        <div className={`p-1 rounded-xl flex items-center gap-1 border overflow-x-auto ${
          isDarkMode ? 'bg-[#1C2333] border-[#263248]' : 'bg-[#E9EFF8] border-[#E5EAF2]'
        }`}>
          {contextOptions.map(ctx => {
            const isActive = contextFilter === ctx;
            const count = ctx === 'todos' ? tasks.length : tasks.filter(t => t.area === ctx).length;

            return (
              <button
                key={ctx}
                type="button"
                onClick={() => setContextFilter(ctx)}
                className={`px-3 py-1.5 rounded-lg text-xs transition-all duration-150 cursor-pointer capitalize ${
                  isActive
                    ? isDarkMode
                      ? 'bg-[#315DFF] text-white font-semibold shadow-xs'
                      : 'bg-[#FFFFFF] text-[#245BFF] font-semibold shadow-xs border border-[#E5EAF2]'
                    : isDarkMode
                      ? 'text-[#94A3B8] hover:text-[#F1F5F9]'
                      : 'text-[#687386] hover:text-[#172033]'
                }`}
              >
                {ctx} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Filtro por Temperatura de Prioridade */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <span className={`font-mono text-[11px] uppercase tracking-wider shrink-0 font-semibold ${
          isDarkMode ? 'text-[#64748B]' : 'text-[#9AA4B2]'
        }`}>
          Prioridade:
        </span>
        <button
          type="button"
          onClick={() => setFilterPriority('all')}
          className={`px-2.5 py-1 rounded-lg text-xs font-medium transition cursor-pointer border ${
            filterPriority === 'all'
              ? isDarkMode
                ? 'bg-[#222B3D] text-[#F1F5F9] border-[#33415C] font-semibold'
                : 'bg-[#FFFFFF] text-[#172033] border-[#E5EAF2] font-semibold shadow-xs'
              : isDarkMode
                ? 'bg-transparent border-transparent text-[#94A3B8] hover:text-[#F1F5F9]'
                : 'bg-transparent border-transparent text-[#687386] hover:text-[#172033]'
          }`}
        >
          Todas ({tasks.length})
        </button>
        <button
          type="button"
          onClick={() => setFilterPriority('urgente')}
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition cursor-pointer border ${
            filterPriority === 'urgente'
              ? 'bg-rose-500/20 text-rose-300 border-rose-500/50 font-semibold'
              : isDarkMode ? 'text-rose-400 hover:bg-rose-500/10 border-transparent' : 'text-rose-700 hover:bg-rose-50 border-transparent'
          }`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
          <span>Urgente ({tasks.filter(t => t.priority === 'urgente').length})</span>
        </button>
        <button
          type="button"
          onClick={() => setFilterPriority('alta')}
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition cursor-pointer border ${
            filterPriority === 'alta'
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 font-semibold'
              : isDarkMode ? 'text-amber-400 hover:bg-amber-500/10 border-transparent' : 'text-amber-800 hover:bg-amber-50 border-transparent'
          }`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
          <span>Alta ({tasks.filter(t => t.priority === 'alta').length})</span>
        </button>
        <button
          type="button"
          onClick={() => setFilterPriority('media')}
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition cursor-pointer border ${
            filterPriority === 'media'
              ? 'bg-sky-500/20 text-sky-300 border-sky-500/50 font-semibold'
              : isDarkMode ? 'text-sky-400 hover:bg-sky-500/10 border-transparent' : 'text-sky-800 hover:bg-sky-50 border-transparent'
          }`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-sky-500"></span>
          <span>Média ({tasks.filter(t => t.priority === 'media').length})</span>
        </button>
        <button
          type="button"
          onClick={() => setFilterPriority('baixa')}
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition cursor-pointer border ${
            filterPriority === 'baixa'
              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 font-semibold'
              : isDarkMode ? 'text-emerald-400 hover:bg-emerald-500/10 border-transparent' : 'text-emerald-800 hover:bg-emerald-50 border-transparent'
          }`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
          <span>Baixa ({tasks.filter(t => t.priority === 'baixa').length})</span>
        </button>
      </div>

      {/* 1. VISUALIZAÇÃO: LISTA (Soft Tech Rows) */}
      {viewMode === 'lista' && (
        <div className="space-y-2.5">
          {filteredTasks.length === 0 ? (
            <div className={`text-center py-12 px-4 border border-dashed rounded-2xl ${
              isDarkMode ? 'border-[#263248] bg-[#1C2333]/50' : 'border-[#E5EAF2] bg-[#FFFFFF]'
            }`}>
              <CheckSquare className={`w-8 h-8 mx-auto mb-2 ${isDarkMode ? 'text-[#64748B]' : 'text-[#9AA4B2]'}`} />
              <p className={`text-xs ${isDarkMode ? 'text-[#94A3B8]' : 'text-[#687386]'}`}>
                Nenhuma tarefa correspondente aos filtros atuais.
              </p>
            </div>
          ) : (
            filteredTasks.map(t => {
              const isDone = t.status === 'concluido';
              const project = projects.find(p => p.id === t.project_id);

              return (
                <div
                  key={t.id}
                  className={`p-3.5 sm:p-4 rounded-xl border transition-all duration-150 flex items-center justify-between gap-3 group ${
                    isDone
                      ? isDarkMode 
                        ? 'bg-[#182030]/60 border-[#263248] opacity-50' 
                        : 'bg-[#F5F7FB] border-[#E5EAF2] opacity-50'
                      : isDarkMode
                        ? 'bg-[#1C2333] border-[#263248] hover:border-[#33415C] hover:bg-[#20293B] shadow-xs'
                        : 'bg-[#FFFFFF] border-[#E5EAF2] hover:border-[#D2DCE8] hover:bg-[#FFFFFF] shadow-[0_1px_3px_rgba(23,32,51,0.04)] hover:shadow-[0_4px_16px_rgba(23,32,51,0.06)]'
                  }`}
                >
                  <div className="flex items-center gap-3.5 flex-1 min-w-0">
                    <button
                      type="button"
                      onClick={() => onToggleTask(t.id)}
                      className="cursor-pointer p-0.5 transition-colors shrink-0"
                    >
                      {isDone ? (
                        <CheckCircle2 className="w-5 h-5 text-[#245BFF]" />
                      ) : (
                        <Circle className={`w-5 h-5 ${isDarkMode ? 'text-[#33415C] hover:text-[#245BFF]' : 'text-[#D2DCE8] hover:text-[#245BFF]'}`} />
                      )}
                    </button>

                    <div className="min-w-0 flex-1 text-left">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-sm font-semibold truncate ${
                          isDone 
                            ? 'line-through text-[#9AA4B2] dark:text-[#64748B]' 
                            : isDarkMode ? 'text-[#F1F5F9]' : 'text-[#172033]'
                        }`}>
                          {t.title}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${getAreaBadge(t.area)}`}>
                          {t.area}
                        </span>
                        <PriorityBadge priority={t.priority} isDarkMode={isDarkMode} size="xs" />
                      </div>

                      <div className={`flex items-center gap-2 text-xs mt-1 font-medium flex-wrap ${
                        isDarkMode ? 'text-[#94A3B8]' : 'text-[#687386]'
                      }`}>
                        {project && (
                          <span className={`font-semibold ${isDarkMode ? 'text-white' : 'text-[#245BFF]'}`}>
                            {project.title}
                          </span>
                        )}
                        {project && <span>·</span>}
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {t.estimated_minutes}m
                        </span>
                        {t.deadline && (
                          <>
                            <span>·</span>
                            <span>Prazo: {t.deadline}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    {getEnergyBadge(t.energy_level)}

                    {!isDone && onRequestSliceTask && (t.estimated_minutes > 45 || !t.is_micro_action) && (
                      <button
                        type="button"
                        onClick={() => onRequestSliceTask(t)}
                        className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 border ${
                          isDarkMode
                            ? 'bg-slate-800 border-slate-700 text-white hover:bg-slate-700'
                            : 'bg-[#EEF4FF] border-[#315DFF]/30 text-[#315DFF] hover:bg-[#315DFF] hover:text-white'
                        }`}
                        title="Fatiar Tarefa com IA em micro-ações mecânicas"
                      >
                        <Sparkles className="w-3 h-3" />
                        <span className="hidden md:inline">Fatiar com IA</span>
                      </button>
                    )}

                    {!isDone && (
                      <button
                        type="button"
                        onClick={() => onStartFocus(t)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 border ${
                          isDarkMode
                            ? 'bg-[#315DFF] border-[#315DFF] text-white hover:bg-[#245BFF]'
                            : 'bg-[#EEF3FF] border-[#D4E2FF] text-[#245BFF] hover:bg-[#245BFF] hover:text-white'
                        }`}
                      >
                        <Play className="w-3 h-3 fill-current" />
                        <span className="hidden sm:inline">Focar</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => onOpenTaskModal(t)}
                      className={`p-1.5 rounded-lg transition cursor-pointer opacity-0 group-hover:opacity-100 ${
                        isDarkMode ? 'text-[#94A3B8] hover:text-[#F1F5F9]' : 'text-[#687386] hover:text-[#172033]'
                      }`}
                      title="Editar"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => onDeleteTask(t.id)}
                      className="p-1.5 rounded-lg text-[#94A3B8] hover:text-rose-500 transition cursor-pointer opacity-0 group-hover:opacity-100"
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
      )}

      {/* 2. VISUALIZAÇÃO: KANBAN (Soft Tech Bento Board) */}
      {viewMode === 'kanban' && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start overflow-x-auto pb-4">
          {kanbanColumns.map(col => {
            const colTasks = filteredTasks.filter(t => t.status === col.id);

            return (
              <div 
                key={col.id} 
                className={`rounded-2xl p-4 space-y-3 min-w-[240px] border ${
                  isDarkMode 
                    ? 'bg-[#182030] border-[#263248]' 
                    : 'bg-[#F0F4FA] border-[#E5EAF2]'
                }`}
              >
                <div className="flex items-center justify-between pb-2.5 border-b border-[#E5EAF2] dark:border-[#263248]">
                  <h4 className={`text-xs font-bold uppercase tracking-wider ${
                    isDarkMode ? 'text-[#F1F5F9]' : 'text-[#172033]'
                  }`}>
                    {col.label}
                  </h4>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded-md font-bold ${
                    isDarkMode ? 'bg-[#222B3D] text-[#7A9CFF]' : 'bg-[#FFFFFF] text-[#245BFF] shadow-xs'
                  }`}>
                    {colTasks.length}
                  </span>
                </div>

                <div className="space-y-2.5 min-h-[160px]">
                  {colTasks.map(t => (
                    <div
                      key={t.id}
                      onClick={() => onOpenTaskModal(t)}
                      className={`p-3.5 rounded-xl border transition-all duration-150 cursor-pointer text-left space-y-2.5 ${
                        isDarkMode
                          ? 'bg-[#1C2333] border-[#263248] hover:border-[#245BFF] hover:bg-[#20293B]'
                          : 'bg-[#FFFFFF] border-[#E5EAF2] hover:border-[#245BFF] shadow-[0_1px_3px_rgba(23,32,51,0.04)] hover:shadow-[0_4px_16px_rgba(58,98,255,0.08)]'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1.5">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold border ${getAreaBadge(t.area)}`}>
                          {t.area}
                        </span>
                        <PriorityBadge priority={t.priority} isDarkMode={isDarkMode} size="xs" />
                      </div>
                      <span className={`text-xs font-semibold block line-clamp-2 ${
                        isDarkMode ? 'text-[#F1F5F9]' : 'text-[#172033]'
                      }`}>
                        {t.title}
                      </span>
                      <div className={`flex items-center justify-between text-[11px] font-medium pt-2 border-t ${
                        isDarkMode ? 'border-[#263248] text-[#94A3B8]' : 'border-[#E5EAF2] text-[#687386]'
                      }`}>
                        <span>{t.estimated_minutes}m</span>
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
        <div className={`p-6 rounded-2xl border space-y-4 ${
          isDarkMode ? 'bg-[#1C2333] border-[#263248]' : 'bg-[#FFFFFF] border-[#E5EAF2] shadow-[0_2px_8px_rgba(23,32,51,0.04)]'
        }`}>
          <h3 className={`text-base font-bold ${isDarkMode ? 'text-[#F1F5F9]' : 'text-[#172033]'}`}>
            Prazos & Entregas Programadas
          </h3>
          <div className="space-y-2.5">
            {filteredTasks.filter(t => t.deadline).length === 0 ? (
              <p className={`text-xs ${isDarkMode ? 'text-[#94A3B8]' : 'text-[#687386]'}`}>
                Nenhuma tarefa com prazo programado.
              </p>
            ) : (
              filteredTasks.filter(t => t.deadline).map(t => (
                <div 
                  key={t.id} 
                  className={`flex items-center justify-between p-3.5 rounded-xl border text-xs transition-colors ${
                    isDarkMode ? 'border-[#263248] bg-[#222B3D]/50 hover:bg-[#222B3D]' : 'border-[#E5EAF2] bg-[#F8FAFD] hover:bg-[#F0F4FA]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <CalendarIcon className="w-4 h-4 text-[#245BFF]" />
                    <span className={`font-semibold ${isDarkMode ? 'text-[#F1F5F9]' : 'text-[#172033]'}`}>{t.title}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${getAreaBadge(t.area)}`}>
                      {t.area}
                    </span>
                    <PriorityBadge priority={t.priority} isDarkMode={isDarkMode} size="xs" />
                  </div>
                  <span className={`font-mono font-medium ${isDarkMode ? 'text-[#7A9CFF]' : 'text-[#245BFF]'}`}>
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
