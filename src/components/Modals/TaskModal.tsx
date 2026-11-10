import React, { useState, useEffect } from 'react';
import { 
  X, 
  Check, 
  Zap, 
  Activity, 
  Flame, 
  ChevronDown,
  ChevronUp,
  SlidersHorizontal
} from 'lucide-react';
import { 
  Task, 
  Project, 
  StudySubject, 
  TaskCategory, 
  Priority, 
  Difficulty, 
  EnergyLevel, 
  TaskStatus,
  Subtask,
  ContextArea
} from '../../types';
import { getPriorityThermalConfig } from '../../lib/priorityUtils';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskToEdit?: Task | null;
  projects: Project[];
  subjects: StudySubject[];
  isDarkMode?: boolean;
  onSave: (taskData: Omit<Task, 'id' | 'created_at'>) => void;
}

export const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  onClose,
  taskToEdit,
  projects,
  subjects,
  isDarkMode = true,
  onSave
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [area, setArea] = useState<ContextArea>('Aura');
  const [category, setCategory] = useState<TaskCategory>('profissional');
  const [projectId, setProjectId] = useState<string>('');
  const [subjectId, setSubjectId] = useState<string>('');
  const [deadline, setDeadline] = useState('');
  const [priority, setPriority] = useState<Priority>('media');
  const [estimatedMinutes, setEstimatedMinutes] = useState(25);
  const [difficulty, setDifficulty] = useState<Difficulty>('medio');
  const [energyLevel, setEnergyLevel] = useState<EnergyLevel>('medium');
  const [status, setStatus] = useState<TaskStatus>('a_fazer');
  const [recurrence, setRecurrence] = useState<'nenhuma' | 'diaria' | 'semanal' | 'mensal'>('nenhuma');
  const [notes, setNotes] = useState('');
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);

  const [wasDoing, setWasDoing] = useState('');
  const [stoppedAt, setStoppedAt] = useState('');
  const [nextAction, setNextAction] = useState('');

  useEffect(() => {
    if (taskToEdit) {
      setTitle(taskToEdit.title);
      setDescription(taskToEdit.description || '');
      setArea(taskToEdit.area || 'Aura');
      setCategory(taskToEdit.category);
      setProjectId(taskToEdit.project_id || '');
      setSubjectId(taskToEdit.subject_id || '');
      setDeadline(taskToEdit.deadline ? taskToEdit.deadline.slice(0, 10) : '');
      setPriority(taskToEdit.priority);
      setEstimatedMinutes(taskToEdit.estimated_minutes);
      setDifficulty(taskToEdit.difficulty);
      setEnergyLevel(taskToEdit.energy_level);
      setStatus(taskToEdit.status);
      setRecurrence(taskToEdit.recurrence || 'nenhuma');
      setNotes(taskToEdit.notes || '');
      setSubtasks(taskToEdit.subtasks || []);
      setShowAdvanced(false);
      
      if (taskToEdit.context_resume) {
        setWasDoing(taskToEdit.context_resume.wasDoing || '');
        setStoppedAt(taskToEdit.context_resume.stoppedAt || '');
        setNextAction(taskToEdit.context_resume.nextAction || '');
      } else {
        setWasDoing('');
        setStoppedAt('');
        setNextAction('');
      }
    } else {
      setTitle('');
      setDescription('');
      setArea('Aura');
      setCategory('profissional');
      setProjectId('');
      setSubjectId('');
      setDeadline('');
      setPriority('media');
      setEstimatedMinutes(25);
      setDifficulty('medio');
      setEnergyLevel('medium');
      setStatus('a_fazer');
      setRecurrence('nenhuma');
      setNotes('');
      setSubtasks([]);
      setShowAdvanced(false);
      setWasDoing('');
      setStoppedAt('');
      setNextAction('');
    }
  }, [taskToEdit, isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleAddSubtask = () => {
    if (!newSubtaskTitle.trim()) return;
    setSubtasks(prev => [
      ...prev,
      { id: 'sub_' + Date.now(), title: newSubtaskTitle.trim(), completed: false }
    ]);
    setNewSubtaskTitle('');
  };

  const handleToggleSubtask = (id: string) => {
    setSubtasks(prev => prev.map(st => st.id === id ? { ...st, completed: !st.completed } : st));
  };

  const handleDeleteSubtask = (id: string) => {
    setSubtasks(prev => prev.filter(st => st.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSave({
      title: title.trim(),
      description: description.trim() || undefined,
      area,
      category,
      project_id: projectId || null,
      subject_id: subjectId || null,
      deadline: deadline ? new Date(deadline).toISOString() : null,
      priority,
      estimated_minutes: estimatedMinutes,
      difficulty,
      energy_level: energyLevel,
      status,
      recurrence,
      notes: notes.trim() || undefined,
      subtasks,
      context_resume: (wasDoing || stoppedAt || nextAction) ? {
        wasDoing,
        stoppedAt,
        nextAction,
        updatedAt: new Date().toISOString()
      } : undefined
    });

    onClose();
  };

  return (
    <div 
      role="dialog" 
      aria-modal="true" 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-150 overflow-y-auto"
    >
      <div
        className={`w-full max-w-xl rounded-[24px] border p-6 sm:p-7 shadow-2xl text-left space-y-5 my-8 max-h-[90vh] overflow-y-auto ${
          isDarkMode
            ? 'border-[#262626] bg-[#141414] text-[#ffffff]'
            : 'border-[#e4e4e7] bg-[#ffffff] text-[#090909]'
        }`}
      >
        <div
          className={`flex items-center justify-between border-b pb-3.5 ${
            isDarkMode ? 'border-[#262626]' : 'border-[#e4e4e7]'
          }`}
        >
          <div>
            <h3 className="text-[18px] font-semibold tracking-[-0.4px]">
              {taskToEdit ? 'Editar Ação' : 'Nova Tarefa Executável'}
            </h3>
            <p className={`text-xs mt-0.5 tracking-tight ${isDarkMode ? 'text-[#999999]' : 'text-[#666666]'}`}>
              Foco exclusivo na tarefa, sem sobrecarga ou poluição visual.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className={`p-1.5 rounded-full transition-colors cursor-pointer ${
              isDarkMode
                ? 'text-[#999999] hover:text-[#ffffff] hover:bg-[#1c1c1c]'
                : 'text-[#666666] hover:text-[#090909] hover:bg-[#efefef]'
            }`}
            aria-label="Fechar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Título */}
          <div>
            <label className={`text-xs font-medium mb-1.5 block tracking-tight ${isDarkMode ? 'text-[#999999]' : 'text-[#666666]'}`}>
              Título da Tarefa *
            </label>
            <input
              type="text"
              required
              autoFocus
              placeholder="Ex: Resolver 3 exercícios de ordenação de busca"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={`w-full px-3.5 py-2.5 rounded-[10px] border text-xs sm:text-sm focus:outline-none focus:border-[#0099ff] transition-all ${
                isDarkMode
                  ? 'border-[#262626] bg-[#090909] text-[#ffffff] placeholder-[#999999]'
                  : 'border-[#e4e4e7] bg-[#f7f7f8] text-[#090909] placeholder-[#666666]'
              }`}
            />
          </div>

          {/* Área de Contexto */}
          <div>
            <label className={`text-xs font-medium mb-1.5 block tracking-tight ${isDarkMode ? 'text-[#999999]' : 'text-[#666666]'}`}>
              Área de Contexto
            </label>
            <div className="flex items-center gap-1.5 flex-wrap">
              {(['Aura', 'Littera', 'IDP', 'Pessoal'] as ContextArea[]).map((ar) => (
                <button
                  key={ar}
                  type="button"
                  onClick={() => setArea(ar)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer tracking-tight ${
                    area === ar
                      ? isDarkMode
                        ? 'bg-[#ffffff] text-[#000000]'
                        : 'bg-[#090909] text-[#ffffff]'
                      : isDarkMode
                        ? 'bg-[#1c1c1c] border border-[#262626] text-[#999999] hover:text-[#ffffff]'
                        : 'bg-[#efefef] border border-[#e4e4e7] text-[#666666] hover:text-[#090909]'
                  }`}
                >
                  {ar}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className={`text-xs font-medium mb-1 block tracking-tight ${isDarkMode ? 'text-[#999999]' : 'text-[#666666]'}`}>
              Descrição ou Primeiro Passo
            </label>
            <textarea
              rows={2}
              placeholder="Detalhes essenciais para iniciar sem paralisia..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={`w-full px-3.5 py-2.5 rounded-[10px] border text-xs focus:outline-none focus:border-[#0099ff] resize-none transition-all ${
                isDarkMode
                  ? 'border-[#262626] bg-[#090909] text-[#ffffff] placeholder-[#999999]'
                  : 'border-[#e4e4e7] bg-[#f7f7f8] text-[#090909] placeholder-[#666666]'
              }`}
            />
          </div>

          {/* Estimativa de Duração Rápida */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className={`text-xs font-medium tracking-tight ${isDarkMode ? 'text-[#999999]' : 'text-[#666666]'}`}>
                Estimativa de Duração
              </label>
              <span className="text-xs font-mono font-medium">
                {estimatedMinutes} min
              </span>
            </div>
            <div className="flex items-center gap-1.5 flex-wrap">
              {[15, 25, 45, 60].map((mins) => (
                <button
                  key={mins}
                  type="button"
                  onClick={() => setEstimatedMinutes(mins)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer tracking-tight ${
                    estimatedMinutes === mins
                      ? isDarkMode
                        ? 'bg-[#ffffff] text-[#000000]'
                        : 'bg-[#090909] text-[#ffffff]'
                      : isDarkMode
                        ? 'bg-[#1c1c1c] border border-[#262626] text-[#999999] hover:text-[#ffffff]'
                        : 'bg-[#efefef] border border-[#e4e4e7] text-[#666666] hover:text-[#090909]'
                  }`}
                >
                  {mins === 25 ? '🍅 25m (Pomodoro)' : `${mins} min`}
                </button>
              ))}
              <div className="flex items-center gap-1 ml-auto">
                <input
                  type="number"
                  min="5"
                  step="5"
                  value={estimatedMinutes}
                  onChange={(e) => setEstimatedMinutes(Math.max(5, parseInt(e.target.value) || 5))}
                  className={`w-16 px-2 py-1 text-center rounded-[8px] border text-xs focus:outline-none focus:border-[#0099ff] ${
                    isDarkMode
                      ? 'border-[#262626] bg-[#090909] text-[#ffffff]'
                      : 'border-[#e4e4e7] bg-[#f7f7f8] text-[#090909]'
                  }`}
                />
                <span className={`text-xs ${isDarkMode ? 'text-[#999999]' : 'text-[#666666]'}`}>min</span>
              </div>
            </div>
          </div>

          {/* Subtarefas / Micro-passos */}
          <div className={`pt-2 border-t space-y-2 ${isDarkMode ? 'border-[#262626]' : 'border-[#e4e4e7]'}`}>
            <span className={`text-xs font-medium block tracking-tight ${isDarkMode ? 'text-[#999999]' : 'text-[#666666]'}`}>
              Micro-passos ({subtasks.filter(s => s.completed).length}/{subtasks.length})
            </span>

            {subtasks.length > 0 && (
              <div className="space-y-1.5 max-h-36 overflow-y-auto">
                {subtasks.map(st => (
                  <div 
                    key={st.id} 
                    className={`flex items-center justify-between gap-2 p-2.5 rounded-[10px] border text-xs ${
                      isDarkMode
                        ? 'border-[#262626] bg-[#090909]'
                        : 'border-[#e4e4e7] bg-[#f7f7f8]'
                    }`}
                  >
                    <label className="flex items-center gap-2 cursor-pointer flex-1 min-w-0">
                      <input
                        type="checkbox"
                        checked={st.completed}
                        onChange={() => handleToggleSubtask(st.id)}
                        className="rounded accent-[#0099ff] focus:ring-0"
                      />
                      <span className={`truncate font-normal ${st.completed ? 'line-through opacity-50' : ''}`}>
                        {st.title}
                      </span>
                    </label>
                    <button
                      type="button"
                      onClick={() => handleDeleteSubtask(st.id)}
                      className="text-[#999999] hover:text-[#ff5577] p-0.5 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Adicionar micro-passo para facilitar o início..."
                value={newSubtaskTitle}
                onChange={(e) => setNewSubtaskTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSubtask();
                  }
                }}
                className={`flex-1 px-3.5 py-2 rounded-[10px] border text-xs focus:outline-none focus:border-[#0099ff] ${
                  isDarkMode
                    ? 'border-[#262626] bg-[#090909] text-[#ffffff] placeholder-[#999999]'
                    : 'border-[#e4e4e7] bg-[#f7f7f8] text-[#090909] placeholder-[#666666]'
                }`}
              />
              <button
                type="button"
                onClick={handleAddSubtask}
                className={`px-3.5 py-2 rounded-full text-xs font-medium border cursor-pointer ${
                  isDarkMode
                    ? 'bg-[#1c1c1c] hover:bg-[#262626] border-[#262626] text-[#ffffff]'
                    : 'bg-[#efefef] hover:bg-[#e4e4e7] border-[#e4e4e7] text-[#090909]'
                }`}
              >
                + Adicionar
              </button>
            </div>
          </div>

          {/* Toggle de Opções Secundárias */}
          <div className={`pt-2 border-t ${isDarkMode ? 'border-[#262626]' : 'border-[#e4e4e7]'}`}>
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className={`w-full py-2.5 px-3.5 rounded-[12px] border text-xs font-medium flex items-center justify-between transition-colors cursor-pointer ${
                isDarkMode
                  ? 'border-[#262626] bg-[#1c1c1c] hover:bg-[#262626] text-[#999999] hover:text-[#ffffff]'
                  : 'border-[#e4e4e7] bg-[#f7f7f8] hover:bg-[#efefef] text-[#666666] hover:text-[#090909]'
              }`}
            >
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-3.5 h-3.5 text-[#0099ff]" />
                <span>{showAdvanced ? 'Ocultar opções secundárias' : 'Mais opções (Projeto, Prazo, Prioridade, Contexto)'}</span>
              </div>
              {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>

          {showAdvanced && (
            <div className={`space-y-4 pt-2 border-t animate-in fade-in slide-in-from-top-1 duration-150 ${isDarkMode ? 'border-[#262626]' : 'border-[#e4e4e7]'}`}>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className={`text-xs font-medium mb-1 block ${isDarkMode ? 'text-[#999999]' : 'text-[#666666]'}`}>
                    Categoria
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as TaskCategory)}
                    className={`w-full px-3 py-2 rounded-[10px] border text-xs cursor-pointer focus:outline-none focus:border-[#0099ff] ${
                      isDarkMode ? 'border-[#262626] bg-[#090909] text-[#ffffff]' : 'border-[#e4e4e7] bg-[#f7f7f8] text-[#090909]'
                    }`}
                  >
                    <option value="academico">Acadêmico</option>
                    <option value="profissional">Profissional</option>
                    <option value="pessoal">Pessoal</option>
                    <option value="saude">Saúde & Bem-estar</option>
                    <option value="outros">Outros</option>
                  </select>
                </div>

                <div>
                  <label className={`text-xs font-medium mb-1 block ${isDarkMode ? 'text-[#999999]' : 'text-[#666666]'}`}>
                    Projeto Relacionado
                  </label>
                  <select
                    value={projectId}
                    onChange={(e) => setProjectId(e.target.value)}
                    className={`w-full px-3 py-2 rounded-[10px] border text-xs cursor-pointer focus:outline-none focus:border-[#0099ff] ${
                      isDarkMode ? 'border-[#262626] bg-[#090909] text-[#ffffff]' : 'border-[#e4e4e7] bg-[#f7f7f8] text-[#090909]'
                    }`}
                  >
                    <option value="">Sem projeto</option>
                    {projects.map(p => (
                      <option key={p.id} value={p.id}>{p.title}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={`text-xs font-medium mb-1 block ${isDarkMode ? 'text-[#999999]' : 'text-[#666666]'}`}>
                    Disciplina / Curso
                  </label>
                  <select
                    value={subjectId}
                    onChange={(e) => setSubjectId(e.target.value)}
                    className={`w-full px-3 py-2 rounded-[10px] border text-xs cursor-pointer focus:outline-none focus:border-[#0099ff] ${
                      isDarkMode ? 'border-[#262626] bg-[#090909] text-[#ffffff]' : 'border-[#e4e4e7] bg-[#f7f7f8] text-[#090909]'
                    }`}
                  >
                    <option value="">Nenhum</option>
                    {subjects.map(s => (
                      <option key={s.id} value={s.id}>{s.title}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className={`text-xs font-medium mb-1 block ${isDarkMode ? 'text-[#999999]' : 'text-[#666666]'}`}>
                    Nível de Energia Necessário
                  </label>
                  <div className="grid grid-cols-3 gap-1">
                    <button
                      type="button"
                      onClick={() => setEnergyLevel('low')}
                      className={`py-1.5 px-1 rounded-[8px] text-[11px] font-medium border flex items-center justify-center gap-1 transition-all cursor-pointer ${
                        energyLevel === 'low'
                          ? 'bg-[#22c55e]/15 border-[#22c55e] text-[#16a34a] dark:text-[#22c55e]'
                          : isDarkMode 
                            ? 'bg-[#090909] border-[#262626] text-[#999999]' 
                            : 'bg-[#f7f7f8] border-[#e4e4e7] text-[#666666]'
                      }`}
                    >
                      <Zap className="w-3 h-3 text-[#22c55e]" />
                      <span>Baixa</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setEnergyLevel('medium')}
                      className={`py-1.5 px-1 rounded-[8px] text-[11px] font-medium border flex items-center justify-center gap-1 transition-all cursor-pointer ${
                        energyLevel === 'medium'
                          ? 'bg-[#0099ff]/15 border-[#0099ff] text-[#0077cc] dark:text-[#0099ff]'
                          : isDarkMode 
                            ? 'bg-[#090909] border-[#262626] text-[#999999]' 
                            : 'bg-[#f7f7f8] border-[#e4e4e7] text-[#666666]'
                      }`}
                    >
                      <Activity className="w-3 h-3 text-[#0099ff]" />
                      <span>Média</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setEnergyLevel('high')}
                      className={`py-1.5 px-1 rounded-[8px] text-[11px] font-medium border flex items-center justify-center gap-1 transition-all cursor-pointer ${
                        energyLevel === 'high'
                          ? 'bg-[#ff7a3d]/15 border-[#ff7a3d] text-[#ea580c] dark:text-[#ff7a3d]'
                          : isDarkMode 
                            ? 'bg-[#090909] border-[#262626] text-[#999999]' 
                            : 'bg-[#f7f7f8] border-[#e4e4e7] text-[#666666]'
                      }`}
                    >
                      <Flame className="w-3 h-3 text-[#ff7a3d]" />
                      <span>Alta</span>
                    </button>
                  </div>
                </div>

                <div>
                  <label className={`text-xs font-medium mb-1 block ${isDarkMode ? 'text-[#999999]' : 'text-[#666666]'}`}>
                    Prazo Final (Opcional)
                  </label>
                  <input
                    type="date"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className={`w-full px-3 py-1.5 rounded-[10px] border text-xs ${
                      isDarkMode 
                        ? 'bg-[#090909] border-[#262626] text-[#ffffff]' 
                        : 'bg-[#f7f7f8] border-[#e4e4e7] text-[#090909]'
                    }`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className={`text-xs font-medium mb-1.5 flex items-center justify-between ${isDarkMode ? 'text-[#999999]' : 'text-[#666666]'}`}>
                    <span>Prioridade</span>
                  </label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {(['baixa', 'media', 'alta', 'urgente'] as Priority[]).map((p) => {
                      const thermal = getPriorityThermalConfig(p, isDarkMode);
                      const isSelected = priority === p;
                      return (
                        <button
                          key={p}
                          type="button"
                          onClick={() => setPriority(p)}
                          className={`py-1.5 px-1.5 rounded-[8px] text-[11px] font-medium border flex items-center justify-center gap-1 transition-all cursor-pointer ${
                            isSelected
                              ? thermal.activeButtonClass
                              : isDarkMode
                                ? 'bg-[#090909] border-[#262626] text-[#999999]'
                                : 'bg-[#f7f7f8] border-[#e4e4e7] text-[#666666]'
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${thermal.dotClass}`} />
                          <span>{thermal.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className={`text-xs font-medium mb-1.5 block ${isDarkMode ? 'text-[#999999]' : 'text-[#666666]'}`}>
                    Status Atual
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as TaskStatus)}
                    className={`w-full px-3 py-2 rounded-[10px] border text-xs cursor-pointer ${
                      isDarkMode 
                        ? 'bg-[#090909] border-[#262626] text-[#ffffff]' 
                        : 'bg-[#f7f7f8] border-[#e4e4e7] text-[#090909]'
                    }`}
                  >
                    <option value="inbox">Inbox</option>
                    <option value="a_fazer">A Fazer</option>
                    <option value="em_andamento">Em Andamento</option>
                    <option value="concluido">Concluído</option>
                    <option value="adiado">Adiado</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div className={`flex justify-end gap-2 pt-3 border-t ${isDarkMode ? 'border-[#262626]' : 'border-[#e4e4e7]'}`}>
            <button
              type="button"
              onClick={onClose}
              className={`px-4 py-2 rounded-full text-xs font-medium border transition cursor-pointer ${
                isDarkMode
                  ? 'text-[#999999] hover:text-[#ffffff] bg-[#1c1c1c] border-[#262626]'
                  : 'text-[#666666] hover:text-[#090909] bg-[#efefef] border-[#e4e4e7]'
              }`}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className={`px-5 py-2 rounded-full text-xs font-medium active:scale-[0.98] transition cursor-pointer flex items-center gap-1.5 ${
                isDarkMode
                  ? 'bg-[#ffffff] hover:bg-[#f0f0f0] text-[#000000]'
                  : 'bg-[#090909] hover:bg-[#222222] text-[#ffffff]'
              }`}
            >
              <Check className="w-3.5 h-3.5" />
              <span>{taskToEdit ? 'Salvar Alterações' : 'Criar Tarefa'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
