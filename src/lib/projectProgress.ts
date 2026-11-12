import { Project, Task } from '../types';

export interface ProjectProgress {
  total: number;
  completed: number;
  percent: number | null;
  hasPlanningPending: boolean;
}

/**
 * Project progress is derived from its tasks so it cannot drift from reality.
 * Cancelled tasks are intentionally excluded from the denominator.
 */
export function getProjectProgress(projectId: string, tasks: Task[]): ProjectProgress {
  const projectTasks = tasks.filter(
    task => task.project_id === projectId && task.status !== 'cancelado'
  );
  const completed = projectTasks.filter(task => task.status === 'concluido').length;

  if (projectTasks.length === 0) {
    return { total: 0, completed: 0, percent: null, hasPlanningPending: true };
  }

  return {
    total: projectTasks.length,
    completed,
    percent: Math.round((completed / projectTasks.length) * 100),
    hasPlanningPending: false
  };
}

export function getProjectLabel(project: Project, tasks: Task[]): string {
  const progress = getProjectProgress(project.id, tasks);
  return progress.hasPlanningPending
    ? 'Planejamento pendente'
    : `${progress.completed} de ${progress.total} tarefas concluídas`;
}
