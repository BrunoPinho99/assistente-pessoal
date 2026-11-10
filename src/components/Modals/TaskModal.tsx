import React, { useState, useEffect } from 'react';
import { 
  X, 
  Check, 
  Plus, 
  Trash2, 
  Zap, 
  Activity, 
  Flame, 
  Clock, 
  Folder, 
  Calendar,
  Layers,
  FileText,
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
  isDarkMode = false,
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

  // Retomada de Contexto (Recurso Anti-paralisia TDAH)
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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-150 overflow-y-auto"
    >
      <div className="w-full max-w-xl rounded-[20px] border border-[#262626] bg-[#141414] p-6 sm:p-7 shadow-2xl text-left space-y-5 my-8 max-h-[90vh] overflow-y-auto text-white">
        <div className="flex items-center justify-between border-b border-[#262626] pb-3.5">
          <div>
            <h3 className="text-base font-medium tracking-tight text-white">
              {taskToEdit ? 'Editar Ação' : 'Nova Tarefa Executável'}
            </h3>
            <p className="text-xs text-[#999999] mt-0.5 tracking-tight">
              Foco exclusivo na tarefa, sem sobrecarga ou poluição visual.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-[#999999] hover:text-white hover:bg-[#1c1c1c] transition-colors cursor-pointer"
            aria-label="Fechar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Título & Descrição */}
          <div>
            <label className="text-xs font-normal text-[#999999] mb-1.5 block tracking-tight">
              Título da Tarefa *
            </label>
            <input
              type="text"
              required
              autoFocus
              placeholder="Ex: Resolver 3 exercícios de ordenação de busca"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#262626] bg-[#1c1c1c] text-white placeholder-[#999999] text-xs sm:text-sm focus:outline-none focus:border-[#0099ff] focus:ring-1 focus:ring-[#0099ff] transition-all"
            />
          </div>

          {/* Área de Contexto */}
          <div>
            <label className="text-xs font-normal text-[#999999] mb-1.5 block tracking-tight">
              Área de Contexto
            </label>
            <div className="flex items-center gap-1.5 flex-wrap">
              {(['Aura', 'Littera', 'IDP', 'Pessoal'] as ContextArea[]).map((ar) => (
                <button
                  key={ar}
                  type="button"
                  onClick={() => setArea(ar)}
                  className={`px-3 py-1.5 rounded-full text-xs transition-colors cursor-pointer tracking-tight ${
                    area === ar
                      ? 'bg-white text-black font-semibold shadow-xs'
                      : 'bg-[#1c1c1c] border border-[#262626] text-[#999999] hover:text-white'
                  }`}
                >
                  {ar}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-normal text-[#999999] mb-1 block tracking-tight">
              Descrição ou Primeiro Passo
            </label>
            <textarea
              rows={2}
              placeholder="Detalhes essenciais para iniciar sem paralisia..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#262626] bg-[#1c1c1c] text-white placeholder-[#999999] text-xs focus:outline-none focus:border-[#0099ff] focus:ring-1 focus:ring-[#0099ff] resize-none transition-all"
            />
          </div>

          {/* Estimativa de Duração Rápida */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-normal text-[#999999] tracking-tight">
                Estimativa de Duração
              </label>
              <span className="text-xs font-mono font-medium text-white">
                {estimatedMinutes} min
              </span>
            </div>
            <div className="flex items-center gap-1.5 flex-wrap">
              {[15, 25, 45, 60].map((mins) => (
                <button
                  key={mins}
                  type="button"
                  onClick={() => setEstimatedMinutes(mins)}
                  className={`px-3 py-1.5 rounded-full text-xs transition-colors cursor-pointer tracking-tight ${
                    estimatedMinutes === mins
                      ? 'bg-white text-black font-semibold shadow-xs'
                      : 'bg-[#1c1c1c] border border-[#262626] text-[#999999] hover:text-white'
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
                  className="w-16 px-2 py-1 text-center rounded-lg border border-[#262626] bg-[#1c1c1c] text-white text-xs focus:outline-none focus:border-[#0099ff]"
                />
                <span className="text-xs text-[#999999]">min</span>
              </div>
            </div>
          </div>

          {/* Subtarefas / Micro-passos */}
          <div className="pt-2 border-t border-[#262626] space-y-2">
            <span className="text-xs font-normal text-[#999999] block tracking-tight">
              Micro-passos ({subtasks.filter(s => s.completed).length}/{subtasks.length})
            </span>

            {subtasks.length > 0 && (
              <div className="space-y-1.5 max-h-36 overflow-y-auto">
                {subtasks.map(st => (
                  <div 
                    key={st.id} 
                    className="flex items-center justify-between gap-2 p-2 rounded-xl border border-[#262626] bg-[#1c1c1c] text-xs"
                  >
                    <label className="flex items-center gap-2 cursor-pointer flex-1 min-w-0">
                      <input
                        type="checkbox"
                        checked={st.completed}
                        onChange={() => handleToggleSubtask(st.id)}
                        className="rounded border-[#262626] text-white focus:ring-0"
                      />
                      <span className={`truncate font-normal ${st.completed ? 'line-through text-[#666666]' : 'text-white'}`}>
                        {st.title}
                      </span>
                    </label>
                    <button
                      type="button"
                      onClick={() => handleDeleteSubtask(st.id)}
                      className="text-[#999999] hover:text-rose-400 p-0.5 cursor-pointer"
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
                className="flex-1 px-3.5 py-2 rounded-xl border border-[#262626] bg-[#1c1c1c] text-white placeholder-[#999999] text-xs focus:outline-none focus:border-[#0099ff]"
              />
              <button
                type="button"
                onClick={handleAddSubtask}
                className="px-3.5 py-2 rounded-full text-xs font-medium bg-[#1c1c1c] hover:bg-[#262626] border border-[#262626] text-white cursor-pointer"
              >
                + Adicionar
              </button>
            </div>
          </div>

          {/* Toggle de Opções Secundárias (Recolhido para evitar poluição visual de TDAH) */}
          <div className="pt-2 border-t border-[#262626]">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="w-full py-2 px-3 rounded-xl border border-[#262626] bg-[#1c1c1c] hover:bg-[#262626] text-xs font-normal text-[#999999] hover:text-white flex items-center justify-between transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-3.5 h-3.5 text-white" />
                <span>{showAdvanced ? 'Ocultar opções secundárias' : 'Mais opções (Projeto, Prazo, Prioridade, Contexto)'}</span>
              </div>
              {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>

          {/* Painel Recolhível de Detalhes Secundários */}
          {showAdvanced && (
            <div className="space-y-4 pt-2 border-t border-[#262626] animate-in fade-in slide-in-from-top-1 duration-150">
              {/* Categoria, Projeto e Disciplina */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-normal text-[#999999] mb-1 block">
                    Categoria
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as TaskCategory)}
                    className="w-full px-3 py-2 rounded-xl border border-[#262626] bg-[#1c1c1c] text-white text-xs cursor-pointer focus:outline-none focus:border-[#0099ff]"
                  >
                    <option value="academico">Acadêmico</option>
                    <option value="profissional">Profissional</option>
                    <option value="pessoal">Pessoal</option>
                    <option value="saude">Saúde & Bem-estar</option>
                    <option value="outros">Outros</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-normal text-[#999999] mb-1 block">
                    Projeto Relacionado
                  </label>
                  <select
                    value={projectId}
                    onChange={(e) => setProjectId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#262626] bg-[#1c1c1c] text-white text-xs cursor-pointer focus:outline-none focus:border-[#0099ff]"
                  >
                    <option value="">Sem projeto</option>
                    {projects.map(p => (
                      <option key={p.id} value={p.id}>{p.title}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-normal text-[#999999] mb-1 block">
                    Disciplina / Curso
                  </label>
                  <select
                    value={subjectId}
                    onChange={(e) => setSubjectId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#262626] bg-[#1c1c1c] text-white text-xs cursor-pointer focus:outline-none focus:border-[#0099ff]"
                  >
                    <option value="">Nenhum</option>
                    {subjects.map(s => (
                      <option key={s.id} value={s.id}>{s.title}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Nível de Energia & Prazo Final */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className={`text-xs font-medium mb-1 block ${isDarkMode ? 'text-[#94A3B8]' : 'text-[#687386]'}`}>
                    Nível de Energia Necessário
                  </label>
                  <div className="grid grid-cols-3 gap-1">
                    <button
                      type="button"
                      onClick={() => setEnergyLevel('low')}
                      className={`py-1.5 px-1 rounded-lg text-[11px] font-semibold border flex items-center justify-center gap-1 transition-all cursor-pointer ${
                        energyLevel === 'low'
                          ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 text-emerald-700 dark:text-emerald-300'
                          : isDarkMode 
                            ? 'bg-[#182030] border-[#263248] text-[#94A3B8]' 
                            : 'bg-[#F5F7FB] border-[#E5EAF2] text-[#687386]'
                      }`}
                    >
                      <Zap className="w-3 h-3 text-emerald-500" />
                      <span>Baixa</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setEnergyLevel('medium')}
                      className={`py-1.5 px-1 rounded-lg text-[11px] font-semibold border flex items-center justify-center gap-1 transition-all cursor-pointer ${
                        energyLevel === 'medium'
                          ? 'bg-sky-50 dark:bg-sky-950/60 border-sky-500 text-sky-700 dark:text-sky-300'
                          : isDarkMode 
                            ? 'bg-[#182030] border-[#263248] text-[#94A3B8]' 
                            : 'bg-[#F5F7FB] border-[#E5EAF2] text-[#687386]'
                      }`}
                    >
                      <Activity className="w-3 h-3 text-sky-500" />
                      <span>Média</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setEnergyLevel('high')}
                      className={`py-1.5 px-1 rounded-lg text-[11px] font-semibold border flex items-center justify-center gap-1 transition-all cursor-pointer ${
                        energyLevel === 'high'
                          ? 'bg-amber-50 dark:bg-amber-950/60 border-amber-500 text-amber-800 dark:text-amber-300'
                          : isDarkMode 
                            ? 'bg-[#182030] border-[#263248] text-[#94A3B8]' 
                            : 'bg-[#F5F7FB] border-[#E5EAF2] text-[#687386]'
                      }`}
                    >
                      <Flame className="w-3 h-3 text-amber-500" />
                      <span>Alta</span>
                    </button>
                  </div>
                </div>

                <div>
                  <label className={`text-xs font-medium mb-1 block ${isDarkMode ? 'text-[#94A3B8]' : 'text-[#687386]'}`}>
                    Prazo Final (Opcional)
                  </label>
                  <input
                    type="date"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className={`w-full px-3 py-1.5 rounded-xl border text-xs ${
                      isDarkMode 
                        ? 'bg-[#182030] border-[#263248] text-[#F1F5F9]' 
                        : 'bg-[#FFFFFF] border-[#E5EAF2] text-[#172033]'
                    }`}
                  />
                </div>
              </div>

              {/* Prioridade & Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className={`text-xs font-medium mb-1.5 flex items-center justify-between ${
                    isDarkMode ? 'text-[#94A3B8]' : 'text-[#687386]'
                  }`}>
                    <span>Prioridade (Escala Térmica)</span>
                    <span className="text-[10px] font-mono">
                      {priority === 'urgente' ? 'Fervendo / Crítica' : priority === 'alta' ? 'Quente / Solar' : priority === 'media' ? 'Morno / Neutro' : 'Frio / Tranquilo'}
                    </span>
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
                          className={`py-1.5 px-1.5 rounded-lg text-[11px] font-semibold border flex items-center justify-center gap-1 transition-all cursor-pointer ${
                            isSelected
                              ? thermal.activeButtonClass
                              : isDarkMode
                                ? 'bg-[#182030] border-[#263248] text-[#94A3B8] hover:text-[#F1F5F9]'
                                : 'bg-[#F5F7FB] border-[#E5EAF2] text-[#687386] hover:text-[#172033]'
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
                  <label className={`text-xs font-medium mb-1.5 block ${isDarkMode ? 'text-[#94A3B8]' : 'text-[#687386]'}`}>
                    Status Atual
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as TaskStatus)}
                    className={`w-full px-3 py-2 rounded-xl border text-xs cursor-pointer ${
                      isDarkMode 
                        ? 'bg-[#182030] border-[#263248] text-[#F1F5F9]' 
                        : 'bg-[#FFFFFF] border-[#E5EAF2] text-[#172033]'
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

              {/* Retomada de Contexto */}
              <div className={`p-3 rounded-xl border space-y-2 ${
                isDarkMode ? 'bg-[#222B3D]/50 border-[#263248]' : 'bg-[#F8FAFD] border-[#E5EAF2]'
              }`}>
                <span className={`text-[11px] font-bold block ${isDarkMode ? 'text-white' : 'text-[#245BFF]'}`}>
                  📌 Retomada de Contexto (Evita paralisia após pausas)
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                  <div>
                    <label className={`text-[10px] block mb-0.5 ${isDarkMode ? 'text-[#64748B]' : 'text-[#9AA4B2]'}`}>O que estava fazendo?</label>
                    <input
                      type="text"
                      placeholder="Ex: Escrevendo a função X..."
                      value={wasDoing}
                      onChange={(e) => setWasDoing(e.target.value)}
                      className={`w-full px-2.5 py-1.5 rounded-lg border text-xs ${
                        isDarkMode ? 'bg-[#182030] border-[#263248] text-[#F1F5F9]' : 'bg-[#FFFFFF] border-[#E5EAF2] text-[#172033]'
                      }`}
                    />
                  </div>
                  <div>
                    <label className={`text-[10px] block mb-0.5 ${isDarkMode ? 'text-[#64748B]' : 'text-[#9AA4B2]'}`}>Onde parou?</label>
                    <input
                      type="text"
                      placeholder="Ex: Na linha 42..."
                      value={stoppedAt}
                      onChange={(e) => setStoppedAt(e.target.value)}
                      className={`w-full px-2.5 py-1.5 rounded-lg border text-xs ${
                        isDarkMode ? 'bg-[#182030] border-[#263248] text-[#F1F5F9]' : 'bg-[#FFFFFF] border-[#E5EAF2] text-[#172033]'
                      }`}
                    />
                  </div>
                  <div>
                    <label className={`text-[10px] block mb-0.5 ${isDarkMode ? 'text-[#64748B]' : 'text-[#9AA4B2]'}`}>Qual é a próxima ação?</label>
                    <input
                      type="text"
                      placeholder="Ex: Testar com vetor pequeno"
                      value={nextAction}
                      onChange={(e) => setNextAction(e.target.value)}
                      className={`w-full px-2.5 py-1.5 rounded-lg border text-xs ${
                        isDarkMode ? 'bg-[#182030] border-[#263248] text-[#F1F5F9]' : 'bg-[#FFFFFF] border-[#E5EAF2] text-[#172033]'
                      }`}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Footer Actions (Framer Pills) */}
          <div className="flex justify-end gap-2 pt-3 border-t border-[#262626]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-full text-xs font-medium text-[#999999] hover:text-white bg-[#1c1c1c] border border-[#262626] transition cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-full text-xs font-semibold bg-white hover:bg-neutral-200 active:scale-[0.98] text-black shadow-sm transition cursor-pointer flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5 text-black" />
              <span>{taskToEdit ? 'Salvar Alterações' : 'Criar Tarefa'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
