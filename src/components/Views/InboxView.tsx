import React, { useState } from 'react';
import { 
  Inbox, 
  Plus, 
  ArrowRight, 
  FileText, 
  Trash2, 
  Check, 
  Calendar,
  Folder,
  Zap,
  CheckCircle2
} from 'lucide-react';
import { Task, Project } from '../../types';

interface InboxViewProps {
  tasks: Task[];
  projects: Project[];
  onAddTask: (task: Omit<Task, 'id' | 'created_at'>) => void;
  onUpdateTask: (id: string, updates: Partial<Task>) => void;
  onDeleteTask: (id: string) => void;
  onConvertToNote?: (task: Task) => void;
  onStartFocus: (task: Task) => void;
}

export const InboxView: React.FC<InboxViewProps> = ({
  tasks,
  projects,
  onAddTask,
  onUpdateTask,
  onDeleteTask,
  onConvertToNote,
  onStartFocus
}) => {
  const [quickInput, setQuickInput] = useState('');
  const inboxTasks = tasks.filter(t => t.status === 'inbox');

  const handleQuickAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickInput.trim()) return;

    onAddTask({
      title: quickInput.trim(),
      area: 'Pessoal',
      category: 'pessoal',
      priority: 'media',
      estimated_minutes: 15,
      difficulty: 'facil',
      energy_level: 'low',
      status: 'inbox',
      subtasks: []
    });

    setQuickInput('');
  };

  const handleMoveToTodo = (id: string) => {
    onUpdateTask(id, { status: 'a_fazer' });
  };

  return (
    <div className="space-y-5 text-left" data-purpose="inbox-view">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-200 dark:border-zinc-800 pb-4">
        <div>
          <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
            <Inbox className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            Inbox & Descarrego Mental
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Tire pensamentos e tarefas soltas da sua cabeça sem se preocupar em organizar agora.
          </p>
        </div>

        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 self-start sm:self-auto">
          {inboxTasks.length} {inboxTasks.length === 1 ? 'item pendente' : 'itens pendentes'}
        </span>
      </div>

      {/* Input de Captura Imediata */}
      <form onSubmit={handleQuickAdd} className="flex gap-2">
        <input
          type="text"
          value={quickInput}
          onChange={(e) => setQuickInput(e.target.value)}
          placeholder="Despeje qualquer pensamento aqui e aperte Enter..."
          className="flex-1 px-4 py-2.5 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 shadow-xs"
          autoFocus
        />
        <button
          type="submit"
          className="px-4 py-2.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs flex-shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Capturar</span>
        </button>
      </form>

      {/* Lista de Itens da Inbox com Triagem em 1 Clique */}
      <div className="space-y-2">
        {inboxTasks.length === 0 ? (
          <div className="text-center py-12 px-4 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl bg-zinc-50/50 dark:bg-zinc-900/30">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">
              Inbox Zerada!
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-sm mx-auto">
              Nenhum pensamento solto aguardando processamento. Sua mente está livre para focar no que importa.
            </p>
          </div>
        ) : (
          inboxTasks.map(task => (
            <div
              key={task.id}
              className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
            >
              <div className="min-w-0 flex-1">
                <span className="text-xs sm:text-sm font-semibold text-zinc-900 dark:text-zinc-100 block">
                  {task.title}
                </span>
                <span className="text-[10px] text-zinc-400 block mt-0.5">
                  Capturado em: {new Date(task.created_at).toLocaleDateString('pt-BR')} às {new Date(task.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>

              {/* Botões Rápidos de Triagem */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  type="button"
                  onClick={() => handleMoveToTodo(task.id)}
                  className="px-2.5 py-1.5 rounded-md text-xs font-medium bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900 transition-colors cursor-pointer flex items-center gap-1"
                  title="Mover para A Fazer"
                >
                  <ArrowRight className="w-3 h-3" />
                  <span>Mover p/ Fazer</span>
                </button>

                <button
                  type="button"
                  onClick={() => onStartFocus(task)}
                  className="px-2.5 py-1.5 rounded-md text-xs font-medium bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900 transition-colors cursor-pointer flex items-center gap-1"
                  title="Fazer agora em 5 min"
                >
                  <Zap className="w-3 h-3" />
                  <span>Fazer Agora</span>
                </button>

                {onConvertToNote && (
                  <button
                    type="button"
                    onClick={() => onConvertToNote(task)}
                    className="p-1.5 rounded-md text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                    title="Transformar em Nota de Conhecimento"
                  >
                    <FileText className="w-3.5 h-3.5" />
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => onDeleteTask(task.id)}
                  className="p-1.5 rounded-md text-zinc-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors cursor-pointer"
                  title="Descartar sem culpa"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

