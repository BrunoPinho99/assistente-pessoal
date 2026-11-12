import React from 'react';
import { CheckCircle2, CircleDashed, Clock3, Lock, PauseCircle, Target } from 'lucide-react';
import { Project, Task } from '../../types';
import { getProjectProgress } from '../../lib/projectProgress';

interface ProjectCoverProps {
  project: Project;
  tasks: Task[];
  isDarkMode?: boolean;
  compact?: boolean;
}

const AREA_STYLES: Record<string, { icon: string; accent: string }> = {
  Aura: { icon: '✦', accent: '#a78bfa' },
  Littera: { icon: '↗', accent: '#22d3ee' },
  IDP: { icon: '◈', accent: '#60a5fa' },
  Pessoal: { icon: '○', accent: '#34d399' }
};

function formatDeadline(deadline?: string | null) {
  if (!deadline) return null;
  const parsed = new Date(deadline);
  if (Number.isNaN(parsed.getTime())) return deadline;
  return parsed.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
}

export const ProjectCover: React.FC<ProjectCoverProps> = ({
  project,
  tasks,
  isDarkMode = true,
  compact = false
}) => {
  const progress = getProjectProgress(project.id, tasks);
  const areaStyle = AREA_STYLES[project.area] || AREA_STYLES.Pessoal;
  const stateLabel = project.locked
    ? 'Estacionado'
    : project.status === 'pausado'
      ? 'Pausado'
      : project.status === 'concluido'
        ? 'Concluído'
        : project.status === 'cancelado'
          ? 'Cancelado'
          : 'Ativo';
  const StateIcon = project.locked
    ? Lock
    : project.status === 'pausado'
      ? PauseCircle
      : project.status === 'concluido'
        ? CheckCircle2
        : project.status === 'cancelado'
          ? CircleDashed
          : Target;

  return (
    <div
      className={`relative overflow-hidden rounded-[24px] border ${
        compact ? 'min-h-44 p-4' : 'min-h-52 p-6'
      } ${isDarkMode ? 'border-[#263449] text-white' : 'border-[#cbd5e1] text-slate-950'}`}
      style={{
        background: `radial-gradient(circle at 85% 10%, ${areaStyle.accent}35, transparent 42%), linear-gradient(135deg, #07111f 0%, #0b1b31 55%, #07101d 100%)`
      }}
      aria-label={`Capa do projeto ${project.title}`}
    >
      <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full border border-white/10" />
      <div className="absolute -right-2 top-7 h-24 w-24 rounded-full border border-white/10" />

      <div className="relative z-10 flex h-full flex-col justify-between gap-6">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-white/20 bg-white/10 text-lg" aria-hidden="true">
              {areaStyle.icon}
            </div>
            <div>
              <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-cyan-100/70">Personal OS</p>
              <p className="text-xs font-medium text-cyan-100">{project.area}</p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1 rounded-full border border-white/15 bg-black/20 px-2.5 py-1 text-[11px] font-medium text-white/85">
            <StateIcon className="h-3.5 w-3.5" aria-hidden="true" />
            {stateLabel}
          </span>
        </div>

        <div>
          <h3 className={`${compact ? 'text-xl' : 'text-2xl'} max-w-[85%] font-semibold leading-tight tracking-[-0.04em]`}>
            {project.title}
          </h3>
          <div className="mt-4 flex items-end justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="mb-1.5 flex items-center justify-between text-[11px] text-cyan-50/75">
                <span>{progress.hasPlanningPending ? 'Planejamento pendente' : `${progress.completed} de ${progress.total} tarefas concluídas`}</span>
                <span className="font-mono text-sm font-semibold text-white">
                  {progress.percent === null ? '—' : `${progress.percent}%`}
                </span>
              </div>
              <div
                className="h-1.5 overflow-hidden rounded-full bg-white/15"
                role="progressbar"
                aria-label={`Progresso de ${project.title}`}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={progress.percent ?? 0}
              >
                <div className="h-full rounded-full bg-cyan-300 transition-all" style={{ width: `${progress.percent ?? 0}%` }} />
              </div>
            </div>
            {formatDeadline(project.deadline) && (
              <span className="inline-flex shrink-0 items-center gap-1 text-[11px] text-white/75">
                <Clock3 className="h-3.5 w-3.5" aria-hidden="true" />
                {formatDeadline(project.deadline)}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
