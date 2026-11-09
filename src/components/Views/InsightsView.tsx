import React from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Clock, 
  CheckCircle2, 
  Download, 
  Sparkles, 
  BookOpen, 
  Repeat, 
  FolderKanban,
  HeartHandshake
} from 'lucide-react';
import { Task, Project, StudySubject, Habit, FocusSession } from '../../types';

interface InsightsViewProps {
  tasks: Task[];
  projects: Project[];
  subjects: StudySubject[];
  habits: Habit[];
  focusSessions: FocusSession[];
  onExportData: () => void;
}

export const InsightsView: React.FC<InsightsViewProps> = ({
  tasks,
  projects,
  subjects,
  habits,
  focusSessions,
  onExportData
}) => {
  const completedTasks = tasks.filter(t => t.status === 'concluido');
  const deferredTasks = tasks.filter(t => t.status === 'adiado');
  const totalStudyHours = subjects.reduce((acc, s) => acc + s.hours_studied, 0);
  const totalFocusMinutes = focusSessions.reduce((acc, f) => acc + f.duration_minutes, 0);
  const totalFocusHours = (totalFocusMinutes / 60).toFixed(1);

  return (
    <div className="space-y-5 text-left" data-purpose="insights-view">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-4">
        <div>
          <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-600 dark:text-blue-500" />
            Insights & Evolução Pessoal
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Métricas de aprendizado e consistência com ênfase no progresso sustentável, sem comparações tóxicas.
          </p>
        </div>

        <button
          type="button"
          onClick={onExportData}
          className="px-3.5 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs self-start sm:self-auto"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Exportar Backup (JSON)</span>
        </button>
      </div>

      {/* Nota de Acolhimento Neurodivergente */}
      <div className="p-4 rounded-xl border border-blue-200 dark:border-blue-900/60 bg-blue-50/50 dark:bg-blue-950/20 text-xs text-blue-900 dark:text-blue-200 flex items-start gap-3">
        <HeartHandshake className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-semibold">Métricas sem julgamento</p>
          <p className="text-blue-800/80 dark:text-blue-300/80 leading-relaxed text-[11px]">
            Tarefas adiadas não são falhas morais: são apenas limites saudáveis da sua capacidade de atenção. O Personal OS valoriza o que foi feito sem punir o que precisou esperar.
          </p>
        </div>
      </div>

      {/* 4 Cards de Métricas Principais */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
            <span>Ações Concluídas</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <span className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 font-mono">
            {completedTasks.length}
          </span>
          <span className="text-[10px] text-emerald-700 dark:text-emerald-400 block font-medium">
            Vitórias reais registradas
          </span>
        </div>

        <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
            <span>Horas de Estudo</span>
            <BookOpen className="w-4 h-4 text-blue-500" />
          </div>
          <span className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 font-mono">
            {totalStudyHours.toFixed(1)}h
          </span>
          <span className="text-[10px] text-zinc-400 block font-medium">
            Em {subjects.length} matérias/cursos
          </span>
        </div>

        <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
            <span>Tempo em Foco Total</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <span className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 font-mono">
            {totalFocusHours}h
          </span>
          <span className="text-[10px] text-zinc-400 block font-medium">
            {focusSessions.length} sessões de hiperfoco
          </span>
        </div>

        <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
            <span>Projetos em Marcha</span>
            <FolderKanban className="w-4 h-4 text-indigo-500" />
          </div>
          <span className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 font-mono">
            {projects.filter(p => p.status === 'ativo').length}
          </span>
          <span className="text-[10px] text-zinc-400 block font-medium">
            De {projects.length} projetos totais
          </span>
        </div>
      </div>

      {/* Histórico Recente de Sessões de Concentração */}
      <div className="p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs space-y-3">
        <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
          Últimas Sessões de Foco Registradas
        </h3>

        <div className="space-y-2">
          {focusSessions.slice(0, 5).map(foc => (
            <div key={foc.id} className="p-3 rounded-lg border border-zinc-100 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-800/40 flex items-center justify-between text-xs">
              <div>
                <span className="font-semibold text-zinc-900 dark:text-zinc-100 block">
                  {foc.task_title || 'Sessão Livre'}
                </span>
                <span className="text-[10px] text-zinc-400">
                  {new Date(foc.completed_at).toLocaleDateString('pt-BR')} às {new Date(foc.completed_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <span className="px-2.5 py-1 rounded-md bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-mono font-bold text-xs">
                {foc.duration_minutes} min
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

