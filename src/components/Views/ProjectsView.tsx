import React, { useState } from 'react';
import { 
  Plus, 
  ArrowRight, 
  ArrowLeft,
  Trash2,
  CheckCircle2,
  Circle,
  X,
  Target,
  Lock,
  Unlock,
  ShieldCheck,
  FolderLock,
  Save,
  Check,
  Play
} from 'lucide-react';
import { Project, Task, ContextFilter, ContextArea, ProjectStage, ProjectCategory, BandwidthSlot, BANDWIDTH_SLOTS_CONFIG } from '../../types';
import { ProjectCover } from '../Projects/ProjectCover';
import { getProjectProgress } from '../../lib/projectProgress';

interface ProjectsViewProps {
  projects: Project[];
  tasks: Task[];
  staleProjects: Project[];
  isDarkMode?: boolean;
  onToggleStage: (projectId: string, stageId: string) => void;
  onAddProject: (projectData: Omit<Project, 'id' | 'created_at' | 'updated_at'>) => void;
  onUpdateProject?: (id: string, updates: Partial<Project>) => void;
  onDeleteProject: (id: string) => void;
  onStartFocus: (task: Task) => void;
  onToggleLock?: (projectId: string, targetSlot?: BandwidthSlot) => void;
  onSetProjectSlot?: (projectId: string, slot: BandwidthSlot) => void;
  onOpenDopamineChat?: () => void;
}

export const ProjectsView: React.FC<ProjectsViewProps> = ({
  projects,
  tasks,
  isDarkMode = true,
  onToggleStage,
  onAddProject,
  onUpdateProject,
  onDeleteProject,
  onStartFocus,
  onToggleLock,
  onSetProjectSlot,
  onOpenDopamineChat
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [projectDraft, setProjectDraft] = useState<Project | null>(null);
  const [contextFilter, setContextFilter] = useState<ContextFilter>('todos');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveFeedback, setSaveFeedback] = useState(false);
  const [newStageInput, setNewStageInput] = useState('');
  
  // Form de criação
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [area, setArea] = useState<ContextArea>('Aura');
  const [mainGoal, setMainGoal] = useState('');
  const [category, setCategory] = useState<'profissional' | 'pessoal' | 'academico'>('profissional');
  const [nextStep, setNextStep] = useState('');
  const [createAsLocked, setCreateAsLocked] = useState(true);

  const handleOpenProjectEditor = (proj: Project) => {
    setSelectedProject(proj);
    setProjectDraft({
      ...proj,
      stages: Array.isArray(proj.stages) ? proj.stages.map(s => ({ ...s })) : []
    });
    setNewStageInput('');
    setConfirmDeleteId(null);
    setSaveFeedback(false);
  };

  const handleCloseProjectEditor = () => {
    setSelectedProject(null);
    setProjectDraft(null);
    setConfirmDeleteId(null);
    setSaveFeedback(false);
  };

  const handleSaveProjectDraft = async () => {
    if (!projectDraft || !projectDraft.title.trim()) return;
    setIsSaving(true);

    if (onUpdateProject) {
      onUpdateProject(projectDraft.id, {
        title: projectDraft.title.trim(),
        description: projectDraft.description?.trim(),
        area: projectDraft.area,
        category: projectDraft.category,
        main_goal: projectDraft.main_goal?.trim(),
        next_step: projectDraft.next_step?.trim(),
        stages: projectDraft.stages
      });
    }

    setIsSaving(false);
    setSaveFeedback(true);
    setTimeout(() => setSaveFeedback(false), 2500);
  };

  const handleToggleDraftStage = (stageId: string) => {
    if (!projectDraft) return;
    const updatedStages = projectDraft.stages.map(st => 
      st.id === stageId ? { ...st, completed: !st.completed } : st
    );
    setProjectDraft({ ...projectDraft, stages: updatedStages });
    if (onToggleStage) {
      onToggleStage(projectDraft.id, stageId);
    }
  };

  const handleAddDraftStage = () => {
    if (!projectDraft || !newStageInput.trim()) return;
    const newStage: ProjectStage = {
      id: 'st_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      title: newStageInput.trim(),
      completed: false
    };
    const updatedStages = [...projectDraft.stages, newStage];
    setProjectDraft({ ...projectDraft, stages: updatedStages });
    setNewStageInput('');
    if (onUpdateProject) {
      onUpdateProject(projectDraft.id, { stages: updatedStages });
    }
  };

  const handleRemoveDraftStage = (stageId: string) => {
    if (!projectDraft) return;
    const updatedStages = projectDraft.stages.filter(st => st.id !== stageId);
    setProjectDraft({ ...projectDraft, stages: updatedStages });
    if (onUpdateProject) {
      onUpdateProject(projectDraft.id, { stages: updatedStages });
    }
  };

  const handleUpdateDraftStageTitle = (stageId: string, newTitle: string) => {
    if (!projectDraft) return;
    const updatedStages = projectDraft.stages.map(st => 
      st.id === stageId ? { ...st, title: newTitle } : st
    );
    setProjectDraft({ ...projectDraft, stages: updatedStages });
  };

  const activeProjects = projects.filter(p => !p.locked && p.status === 'ativo');
  const lockedProjects = projects.filter(p => p.locked);

  const filteredLocked = lockedProjects.filter(p => {
    if (contextFilter !== 'todos' && p.area !== contextFilter) return false;
    return true;
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    const mustPark = activeProjects.length >= 3;

    onAddProject({
      title: title.trim(),
      area,
      description: description.trim() || undefined,
      category,
      main_goal: mainGoal.trim() || 'Concluir entregas principais',
      status: mustPark || createAsLocked ? 'planejamento' : 'ativo',
      locked: mustPark || createAsLocked,
      next_step: nextStep.trim() || 'Definir primeiro micro-passo',
      stages: [
        { id: 'st_' + Date.now() + '_1', title: 'Planejamento e alinhamento', completed: true },
        { id: 'st_' + Date.now() + '_2', title: 'Execução do primeiro bloco', completed: false }
      ],
      documents: [],
      decision_history: [
        { id: 'dh_' + Date.now(), date: new Date().toISOString().slice(0, 10), decision: 'Projeto iniciado no Personal OS' }
      ]
    });

    setTitle('');
    setDescription('');
    setMainGoal('');
    setNextStep('');
    setShowAddModal(false);
  };

  const contextOptions: ContextFilter[] = ['todos', 'Aura', 'Littera', 'IDP', 'Pessoal'];

  // ==========================================================================
  // VISÃO EM PÁGINA INTEIRA DO PROJETO (DUAL CANVAS: DARK & LIGHT)
  // ==========================================================================
  if (selectedProject && projectDraft) {
    const projectTasks = tasks.filter(
      t => t.project_id === projectDraft.id
    );
    const projectProgress = getProjectProgress(projectDraft.id, tasks);

    return (
      <div className="flex flex-col gap-6 text-left pb-14 animate-in fade-in duration-150" data-purpose="project-full-page">
        {/* Barra Superior de Navegação e Ações */}
        <header
          className={`flex flex-wrap items-center justify-between gap-3 pb-3 border-b ${
            isDarkMode ? 'border-[#262626]' : 'border-[#e4e4e7]'
          }`}
        >
          <div className="flex items-center gap-2 text-[13px]">
            <button
              type="button"
              onClick={handleCloseProjectEditor}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full font-medium border transition cursor-pointer ${
                isDarkMode
                  ? 'bg-[#141414] hover:bg-[#1c1c1c] border-[#262626] text-[#ffffff]'
                  : 'bg-[#ffffff] hover:bg-[#efefef] border-[#e4e4e7] text-[#090909]'
              }`}
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Voltar para Projetos</span>
            </button>
            <span className={isDarkMode ? 'text-[#262626]' : 'text-[#d4d4d8]'}>/</span>
            <span className={`font-medium truncate max-w-[240px] ${isDarkMode ? 'text-[#ffffff]' : 'text-[#090909]'}`}>
              {projectDraft.title}
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            {saveFeedback && (
              <span className="text-[13px] font-medium text-[#22c55e] flex items-center gap-1">
                <Check className="w-3.5 h-3.5" />
                <span>Salvo!</span>
              </span>
            )}

            {onToggleLock && (
              <button
                type="button"
                onClick={() => {
                  onToggleLock(projectDraft.id);
                  setProjectDraft(prev => (prev ? { ...prev, locked: !prev.locked } : null));
                }}
                className={`px-4 py-2 rounded-full text-[13px] font-medium tracking-[-0.13px] flex items-center gap-1.5 transition cursor-pointer border ${
                  projectDraft.locked
                    ? isDarkMode
                      ? 'bg-[#141414] text-[#ffffff] border-[#262626] hover:bg-[#1c1c1c]'
                      : 'bg-[#ffffff] text-[#090909] border-[#e4e4e7] hover:bg-[#efefef]'
                    : 'bg-[#ff5577]/10 text-[#e11d48] dark:text-[#ff5577] border-[#ff5577]/30 hover:border-[#ff5577]/50'
                }`}
              >
                {projectDraft.locked ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                <span>{projectDraft.locked ? 'Destrancar Projeto' : 'Trancar no Estacionamento'}</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleSaveProjectDraft}
              disabled={isSaving}
              className={`px-[16px] py-[10px] rounded-full active:scale-[0.98] font-medium text-[14px] tracking-[-0.14px] flex items-center gap-1.5 transition cursor-pointer ${
                isDarkMode
                  ? 'bg-[#ffffff] hover:bg-[#f0f0f0] text-[#000000]'
                  : 'bg-[#090909] hover:bg-[#222222] text-[#ffffff]'
              }`}
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSaving ? 'Salvando...' : 'Salvar Alterações'}</span>
            </button>
          </div>
        </header>

        {/* Capa Hero do Projeto em Largura Total */}
        <div className="relative h-48 sm:h-56 rounded-[30px] overflow-hidden border border-[#262626] bg-[#141414]">
          <ProjectCover project={projectDraft} tasks={tasks} isDarkMode={isDarkMode} />

          <div className="absolute inset-0 p-6 sm:p-8 flex flex-col justify-between">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 flex-wrap">
                <select
                  value={projectDraft.area}
                  onChange={e => {
                    const val = e.target.value as ContextArea;
                    setProjectDraft(prev => (prev ? { ...prev, area: val } : null));
                  }}
                  className="px-3 py-1.5 rounded-full text-[12px] font-medium bg-[#141414]/90 backdrop-blur-md border border-[#262626] text-[#ffffff] cursor-pointer focus:outline-none focus:border-[#0099ff]"
                >
                  <option value="Littera" className="bg-[#141414] text-[#ffffff]">Littera</option>
                  <option value="Aura" className="bg-[#141414] text-[#ffffff]">Aura</option>
                  <option value="IDP" className="bg-[#141414] text-[#ffffff]">IDP</option>
                  <option value="Pessoal" className="bg-[#141414] text-[#ffffff]">Pessoal</option>
                </select>

                <select
                  value={projectDraft.category}
                  onChange={e => {
                    const val = e.target.value as ProjectCategory;
                    setProjectDraft(prev => (prev ? { ...prev, category: val } : null));
                  }}
                  className="px-3 py-1.5 rounded-full text-[12px] font-medium bg-[#141414]/90 backdrop-blur-md border border-[#262626] text-[#999999] cursor-pointer focus:outline-none focus:border-[#0099ff]"
                >
                  <option value="profissional" className="bg-[#141414] text-[#ffffff]">Profissional</option>
                  <option value="pessoal" className="bg-[#141414] text-[#ffffff]">Pessoal</option>
                  <option value="academico" className="bg-[#141414] text-[#ffffff]">Acadêmico</option>
                  <option value="business" className="bg-[#141414] text-[#ffffff]">Business</option>
                  <option value="parking" className="bg-[#141414] text-[#ffffff]">Estacionamento</option>
                </select>

                {!projectDraft.locked ? (
                  <select
                    value={projectDraft.slot || 'ancora'}
                    onChange={e => {
                      const val = e.target.value as BandwidthSlot;
                      setProjectDraft(prev => (prev ? { ...prev, slot: val } : null));
                      if (onSetProjectSlot && projectDraft) {
                        onSetProjectSlot(projectDraft.id, val);
                      }
                    }}
                    className="px-3 py-1.5 rounded-full text-[12px] font-medium bg-[#1c1c1c] border border-[#0099ff]/50 text-[#ffffff] backdrop-blur-md cursor-pointer focus:outline-none"
                    title="Alocação no Protocolo 1-1-1"
                  >
                    <option value="ancora" className="bg-[#141414] text-[#ffffff]">Slot 1 | Âncora (~70%)</option>
                    <option value="satelite" className="bg-[#141414] text-[#ffffff]">Slot 2 | Satélite (Tático)</option>
                    <option value="valvula" className="bg-[#141414] text-[#ffffff]">Slot 3 | Válvula (Sandbox)</option>
                  </select>
                ) : null}

                <span
                  className={`px-3 py-1 rounded-full text-[11px] font-medium border backdrop-blur-md ${
                    projectDraft.locked
                      ? 'bg-[#ff5577]/20 text-[#ff5577] border-[#ff5577]/40'
                      : 'bg-[#22c55e]/20 text-[#22c55e] border-[#22c55e]/40'
                  }`}
                >
                  {projectDraft.locked ? 'TRANCADO 🔒' : 'ATIVO'}
                </span>
              </div>
            </div>

            <div>
              <input
                type="text"
                value={projectDraft.title}
                onChange={e => setProjectDraft(prev => (prev ? { ...prev, title: e.target.value } : null))}
                placeholder="Nome do projeto..."
                className="w-full text-[28px] sm:text-[36px] font-medium tracking-[-1.5px] text-[#ffffff] bg-transparent border-b border-transparent hover:border-[#262626] focus:border-[#0099ff] focus:outline-none transition-colors py-0.5"
              />
            </div>
          </div>
        </div>

        {/* Conteúdo Principal do Projeto em Página Inteira */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Coluna Esquerda: Descrição & Etapas */}
          <div className="lg:col-span-7 space-y-6">
            <div
              className={`p-6 rounded-[20px] border space-y-2.5 ${
                isDarkMode
                  ? 'bg-[#141414] border-[#262626]'
                  : 'bg-[#ffffff] border-[#e4e4e7] shadow-[0_1px_4px_rgba(0,0,0,0.03)]'
              }`}
            >
              <label
                className={`text-[12px] font-medium uppercase tracking-[0.06em] block ${
                  isDarkMode ? 'text-[#999999]' : 'text-[#666666]'
                }`}
              >
                Descrição & Escopo do Projeto
              </label>
              <textarea
                value={projectDraft.description || ''}
                onChange={e => setProjectDraft(prev => (prev ? { ...prev, description: e.target.value } : null))}
                placeholder="Descreva o escopo, objetivos centrais e notas deste projeto..."
                rows={4}
                className={`w-full text-[14px] border rounded-[10px] p-3.5 focus:outline-none focus:border-[#0099ff] focus:shadow-[0_0_0_3px_rgba(0,153,255,0.15)] resize-y leading-relaxed ${
                  isDarkMode
                    ? 'border-[#262626] text-[#ffffff] bg-[#090909] placeholder-[#999999]'
                    : 'border-[#e4e4e7] text-[#090909] bg-[#f7f7f8] placeholder-[#666666]'
                }`}
              />
            </div>

            {/* Etapas do Projeto */}
            <div
              className={`p-6 rounded-[20px] border space-y-4 ${
                isDarkMode
                  ? 'bg-[#141414] border-[#262626]'
                  : 'bg-[#ffffff] border-[#e4e4e7] shadow-[0_1px_4px_rgba(0,0,0,0.03)]'
              }`}
            >
              <div className="flex items-center justify-between">
                <span
                  className={`text-[16px] font-semibold tracking-[-0.3px] flex items-center gap-2 ${
                    isDarkMode ? 'text-[#ffffff]' : 'text-[#090909]'
                  }`}
                >
                  <span>Etapas do Projeto</span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[12px] border text-[#0099ff] font-mono tabular-nums ${
                      isDarkMode ? 'bg-[#1c1c1c] border-[#262626]' : 'bg-[#f7f7f8] border-[#e4e4e7]'
                    }`}
                  >
                    {projectProgress.hasPlanningPending
                      ? 'Planejamento pendente'
                      : `${projectProgress.completed}/${projectProgress.total} tarefas`}
                  </span>
                </span>
              </div>

              <div className="space-y-2">
                {projectDraft.stages.map(st => (
                  <div
                    key={st.id}
                    className={`flex items-center justify-between gap-3 p-3.5 rounded-[12px] border text-[14px] transition group ${
                      isDarkMode
                        ? 'bg-[#090909] border-[#262626] hover:border-[#444444]'
                        : 'bg-[#f7f7f8] border-[#e4e4e7] hover:border-[#d4d4d8]'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => handleToggleDraftStage(st.id)}
                      className="shrink-0 cursor-pointer text-[#999999] hover:text-[#0099ff] transition-colors"
                    >
                      {st.completed ? (
                        <CheckCircle2 className={`w-4 h-4 ${isDarkMode ? 'text-[#ffffff]' : 'text-[#090909]'}`} />
                      ) : (
                        <Circle className="w-4 h-4 text-[#999999]" />
                      )}
                    </button>

                    <input
                      type="text"
                      value={st.title}
                      onChange={e => handleUpdateDraftStageTitle(st.id, e.target.value)}
                      className={`flex-1 bg-transparent border-none outline-none text-[14px] ${
                        st.completed
                          ? 'line-through text-[#999999]'
                          : isDarkMode
                            ? 'text-[#ffffff]'
                            : 'text-[#090909]'
                      }`}
                    />

                    <button
                      type="button"
                      onClick={() => handleRemoveDraftStage(st.id)}
                      className="p-1 text-[#999999] hover:text-[#ff5577] opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                      title="Remover etapa"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Adicionar nova etapa */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="text"
                  value={newStageInput}
                  onChange={e => setNewStageInput(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddDraftStage();
                    }
                  }}
                  placeholder="Adicionar nova etapa..."
                  className={`flex-1 px-3.5 py-2.5 rounded-[10px] border text-[14px] focus:outline-none focus:border-[#0099ff] ${
                    isDarkMode
                      ? 'bg-[#090909] border-[#262626] text-[#ffffff] placeholder-[#999999]'
                      : 'bg-[#f7f7f8] border-[#e4e4e7] text-[#090909] placeholder-[#666666]'
                  }`}
                />
                <button
                  type="button"
                  onClick={handleAddDraftStage}
                  className={`px-4 py-2.5 rounded-full font-medium text-[13px] tracking-[-0.13px] transition cursor-pointer flex items-center gap-1 ${
                    isDarkMode
                      ? 'bg-[#ffffff] hover:bg-[#f0f0f0] text-[#000000]'
                      : 'bg-[#090909] hover:bg-[#222222] text-[#ffffff]'
                  }`}
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Adicionar</span>
                </button>
              </div>
            </div>
          </div>

          {/* Coluna Direita: Próximo Passo, Objetivo, Tarefas Vinculadas e Exclusão */}
          <div className="lg:col-span-5 space-y-6">
            <div
              className={`p-6 rounded-[20px] border space-y-2.5 ${
                isDarkMode
                  ? 'bg-[#1c1c1c] border-[#262626]'
                  : 'bg-[#ffffff] border-[#0099ff]/35 shadow-[0_2px_10px_rgba(0,153,255,0.06)]'
              }`}
            >
              <div className="flex items-center gap-1.5 text-[12px] font-medium text-[#0099ff] uppercase tracking-[0.06em]">
                <Target className="w-4 h-4" />
                <span>Próximo Passo Imediato</span>
              </div>
              <input
                type="text"
                value={projectDraft.next_step}
                onChange={e => setProjectDraft(prev => (prev ? { ...prev, next_step: e.target.value } : null))}
                placeholder="Qual é a próxima ação física para avançar?"
                className={`w-full px-3.5 py-2.5 rounded-[10px] border text-[14px] font-medium focus:outline-none focus:border-[#0099ff] ${
                  isDarkMode
                    ? 'bg-[#090909] border-[#262626] text-[#ffffff]'
                    : 'bg-[#f7f7f8] border-[#e4e4e7] text-[#090909]'
                }`}
              />
            </div>

            {/* Objetivo Estratégico */}
            <div
              className={`p-6 rounded-[20px] border space-y-2.5 ${
                isDarkMode
                  ? 'bg-[#141414] border-[#262626]'
                  : 'bg-[#ffffff] border-[#e4e4e7] shadow-[0_1px_4px_rgba(0,0,0,0.03)]'
              }`}
            >
              <div className="flex items-center gap-1.5 text-[12px] font-medium uppercase tracking-[0.06em] text-[#22c55e]">
                <ShieldCheck className="w-4 h-4" />
                <span>Objetivo Principal</span>
              </div>
              <input
                type="text"
                value={projectDraft.main_goal}
                onChange={e => setProjectDraft(prev => (prev ? { ...prev, main_goal: e.target.value } : null))}
                placeholder="Meta central do projeto..."
                className={`w-full px-3.5 py-2.5 rounded-[10px] border text-[14px] focus:outline-none focus:border-[#0099ff] ${
                  isDarkMode
                    ? 'bg-[#090909] border-[#262626] text-[#ffffff]'
                    : 'bg-[#f7f7f8] border-[#e4e4e7] text-[#090909]'
                }`}
              />
            </div>

            {/* Tarefas Vinculadas */}
            <div
              className={`p-6 rounded-[20px] border space-y-3 ${
                isDarkMode
                  ? 'bg-[#141414] border-[#262626]'
                  : 'bg-[#ffffff] border-[#e4e4e7] shadow-[0_1px_4px_rgba(0,0,0,0.03)]'
              }`}
            >
              <h3 className={`text-[12px] font-medium uppercase tracking-[0.06em] ${isDarkMode ? 'text-[#999999]' : 'text-[#666666]'}`}>
                Tarefas do Projeto ({projectTasks.filter(t => t.status !== 'concluido' && t.status !== 'cancelado').length})
              </h3>
              {projectTasks.filter(t => t.status !== 'concluido' && t.status !== 'cancelado').length === 0 ? (
                <p className={`text-[13px] ${isDarkMode ? 'text-[#999999]' : 'text-[#666666]'}`}>
                  {projectProgress.hasPlanningPending
                    ? 'Planejamento pendente. Crie a próxima tarefa para começar.'
                    : 'Nenhuma tarefa pendente vinculada.'}
                </p>
              ) : (
                <div className="space-y-2">
                  {projectTasks
                    .filter(t => t.status !== 'concluido' && t.status !== 'cancelado')
                    .slice(0, 6)
                    .map(t => (
                      <div
                        key={t.id}
                        className={`p-3 rounded-[12px] border flex items-center justify-between gap-2 text-[13px] ${
                          isDarkMode
                            ? 'bg-[#090909] border-[#262626] text-[#ffffff]'
                            : 'bg-[#f7f7f8] border-[#e4e4e7] text-[#090909]'
                        }`}
                      >
                        <span className="truncate font-medium">{t.title}</span>
                        <button
                          type="button"
                          onClick={() => onStartFocus(t)}
                          className={`px-3 py-1 rounded-full text-[12px] font-medium transition cursor-pointer flex items-center gap-1 shrink-0 ${
                            isDarkMode
                              ? 'bg-[#ffffff] hover:bg-[#f0f0f0] text-[#000000]'
                              : 'bg-[#090909] hover:bg-[#222222] text-[#ffffff]'
                          }`}
                        >
                          <Play className="w-2.5 h-2.5 fill-current" />
                          <span>Focar</span>
                        </button>
                      </div>
                    ))}
                </div>
              )}
            </div>

            {/* Zona de Exclusão */}
            <div
              className={`p-4 rounded-[20px] border flex items-center justify-between ${
                isDarkMode ? 'bg-[#141414] border-[#262626]' : 'bg-[#ffffff] border-[#e4e4e7]'
              }`}
            >
              {confirmDeleteId === projectDraft.id ? (
                <div className="flex items-center justify-between w-full gap-2">
                  <span className="text-[13px] text-[#ff5577] font-medium">Tem certeza que deseja excluir?</span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        onDeleteProject(projectDraft.id);
                        handleCloseProjectEditor();
                      }}
                      className="px-3.5 py-1.5 rounded-full bg-[#ff5577] hover:opacity-90 text-[#ffffff] text-[12px] font-medium transition cursor-pointer"
                    >
                      Confirmar Exclusão
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmDeleteId(null)}
                      className={`px-3 py-1.5 rounded-full text-[12px] transition cursor-pointer ${
                        isDarkMode ? 'text-[#999999] hover:text-[#ffffff]' : 'text-[#666666] hover:text-[#090909]'
                      }`}
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmDeleteId(projectDraft.id)}
                  className="text-[13px] text-[#ff5577] hover:opacity-80 flex items-center gap-1.5 cursor-pointer transition-opacity"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Excluir este projeto</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 text-left select-none pb-12" data-purpose="projects-view">
      
      {/* Top Header Row */}
      <header
        className={`flex items-center justify-between text-[13px] pb-3 border-b ${
          isDarkMode ? 'border-[#262626]' : 'border-[#e4e4e7]'
        }`}
      >
        <div className={`flex items-center gap-1.5 font-normal ${isDarkMode ? 'text-[#999999]' : 'text-[#666666]'}`}>
          <span className="hover:text-[#0099ff] transition-colors cursor-pointer">Meu espaço</span>
          <span className={isDarkMode ? 'text-[#262626]' : 'text-[#d4d4d8]'}>/</span>
          <span className={`font-medium ${isDarkMode ? 'text-[#ffffff]' : 'text-[#090909]'}`}>Projetos</span>
        </div>

        <div className="flex items-center gap-2.5">
          {onOpenDopamineChat && (
            <button
              type="button"
              onClick={onOpenDopamineChat}
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full border font-medium text-[13px] tracking-[-0.13px] transition-all cursor-pointer ${
                isDarkMode
                  ? 'bg-[#141414] hover:bg-[#1c1c1c] text-[#ffffff] border-[#262626]'
                  : 'bg-[#ffffff] hover:bg-[#efefef] text-[#090909] border-[#e4e4e7]'
              }`}
            >
              <Lock className={`w-3.5 h-3.5 ${isDarkMode ? 'text-[#999999]' : 'text-[#666666]'}`} />
              <span className="hidden sm:inline">Estacionamento de Dopamina</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className={`inline-flex items-center gap-1.5 px-[15px] py-[10px] rounded-full active:scale-[0.98] font-medium text-[14px] tracking-[-0.14px] transition-all cursor-pointer ${
              isDarkMode
                ? 'bg-[#ffffff] hover:bg-[#f0f0f0] text-[#000000]'
                : 'bg-[#090909] hover:bg-[#222222] text-[#ffffff]'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Novo projeto</span>
          </button>
        </div>
      </header>

      {/* Hero Header & Filter Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1
              className={`text-[32px] sm:text-[40px] font-medium tracking-[-1.8px] leading-[1.05] ${
                isDarkMode ? 'text-[#ffffff]' : 'text-[#090909]'
              }`}
            >
              Gestão de Projetos & Foco
            </h1>
            <span
              className={`px-2.5 py-0.5 rounded-full text-[12px] font-mono font-medium border tabular-nums ${
                isDarkMode
                  ? 'border-[#262626] bg-[#141414] text-[#999999]'
                  : 'border-[#e4e4e7] bg-[#ffffff] text-[#666666]'
              }`}
            >
              {activeProjects.length}/3 Ativos
            </span>
          </div>
          <p className={`text-[15px] mt-1 font-normal tracking-[-0.15px] ${isDarkMode ? 'text-[#999999]' : 'text-[#666666]'}`}>
            Protocolo 1-1-1 de alocação de banda mental: 1 Âncora, 1 Satélite e 1 Válvula.
          </p>
        </div>

        {/* Filtros de Contexto */}
        <div
          className={`p-1 rounded-full flex items-center gap-1 border overflow-x-auto ${
            isDarkMode
              ? 'border-[#262626] bg-[#141414]'
              : 'border-[#e4e4e7] bg-[#efefef]'
          }`}
        >
          {contextOptions.map(ctx => {
            const isActive = contextFilter === ctx;
            const count = ctx === 'todos' ? projects.length : projects.filter(p => p.area === ctx).length;

            return (
              <button
                key={ctx}
                type="button"
                onClick={() => setContextFilter(ctx)}
                className={`px-3.5 py-1.5 rounded-full text-[13px] font-medium transition-colors cursor-pointer capitalize tracking-[-0.13px] tabular-nums ${
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

      {/* ========================================================================
          SEÇÃO 1: PROTOCOLO 1-1-1 DE ALOCAÇÃO DE BANDA (3 SLOTS SIMULTÂNEOS)
          ======================================================================== */}
      <section className="space-y-4">
        <div
          className={`flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b pb-3 ${
            isDarkMode ? 'border-[#262626]' : 'border-[#e4e4e7]'
          }`}
        >
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span
                className={`px-2.5 py-0.5 rounded-full text-[11px] font-mono font-medium border ${
                  isDarkMode
                    ? 'bg-[#1c1c1c] text-[#ffffff] border-[#262626]'
                    : 'bg-[#090909] text-[#ffffff] border-[#090909]'
                }`}
              >
                PROTOCOLO 1-1-1
              </span>
              <h2
                className={`text-[18px] font-semibold tracking-[-0.4px] ${
                  isDarkMode ? 'text-[#ffffff]' : 'text-[#090909]'
                }`}
              >
                Alocação de Banda Cognitiva ({activeProjects.length}/3 slots)
              </h2>
            </div>
            <p className={`text-[13px] tracking-[-0.13px] ${isDarkMode ? 'text-[#999999]' : 'text-[#666666]'}`}>
              Apenas 3 frentes simultâneas: 1 Âncora (~70%) + 1 Satélite (Tático) + 1 Válvula (Sandbox). Protege a função executiva e evita burnout.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`px-3 py-1 rounded-full text-[12px] font-mono font-medium border flex items-center gap-1.5 ${
                isDarkMode
                  ? 'bg-[#141414] border-[#262626] text-[#999999]'
                  : 'bg-[#ffffff] border-[#e4e4e7] text-[#666666]'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-[#22c55e]" />
              <span>Trava de Segurança Ativa</span>
            </span>
          </div>
        </div>

        {/* Grid dos 3 Slots */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(['ancora', 'satelite', 'valvula'] as BandwidthSlot[]).map((slotKey) => {
            const config = BANDWIDTH_SLOTS_CONFIG[slotKey];
            
            let slotProject = activeProjects.find(p => p.slot === slotKey);
            if (!slotProject) {
              const unslotted = activeProjects.filter(p => !p.slot);
              if (slotKey === 'ancora' && unslotted[0]) slotProject = unslotted[0];
              else if (slotKey === 'satelite' && unslotted[1]) slotProject = unslotted[1];
              else if (slotKey === 'valvula' && unslotted[2]) slotProject = unslotted[2];
            }

            const isVisibleByContext = !slotProject || contextFilter === 'todos' || slotProject.area === contextFilter;
            if (!isVisibleByContext) return null;

            if (slotProject) {
              return (
                <div key={slotKey} className="flex flex-col space-y-2">
                  {/* Cabeçalho do Slot */}
                  <div className="flex items-center justify-between text-[13px] px-1">
                    <span
                      className={`font-medium flex items-center gap-1.5 tracking-[-0.13px] ${
                        isDarkMode ? 'text-[#ffffff]' : 'text-[#090909]'
                      }`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-[#0099ff]" />
                      {config.name}
                    </span>
                    <span className={`text-[11px] font-mono ${isDarkMode ? 'text-[#999999]' : 'text-[#666666]'}`}>
                      {config.cognitiveLoad}
                    </span>
                  </div>

                  {/* Card do Projeto Ocupando o Slot (Framer 30px Atmosphere Spotlight Card) */}
                  <article
                    onClick={() => handleOpenProjectEditor(slotProject!)}
                    className="relative rounded-[30px] overflow-hidden min-h-80 sm:min-h-88 flex flex-col border border-[#262626] bg-[#141414] cursor-pointer group select-none transition-all duration-200 hover:border-[#444444] shadow-lg"
                    data-purpose="project-active-card"
                  >
                    {/* Topo do Card */}
                    <div className="relative z-20 flex items-center justify-between gap-3 p-6 sm:p-7">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="px-3 py-1 rounded-full text-[12px] font-medium bg-[#1c1c1c] border border-[#262626] text-[#ffffff]">
                          {slotProject.area}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#141414] border border-[#262626] text-[#999999]">
                          {config.subtitle}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {onToggleLock && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onToggleLock(slotProject!.id);
                            }}
                            className="px-3.5 py-1.5 rounded-full bg-[#ffffff] text-[#000000] hover:bg-[#f0f0f0] text-[12px] font-medium tracking-[-0.12px] flex items-center gap-1.5 transition-colors cursor-pointer"
                            title="Liberar este slot e enviar projeto para o Estacionamento"
                          >
                            <Lock className="w-3 h-3 text-[#000000]" />
                            <span className="hidden sm:inline">Liberar Slot</span>
                          </button>
                        )}

                        <div className="w-9 h-9 rounded-full bg-[#1c1c1c] border border-[#262626] flex items-center justify-center text-[#ffffff] group-hover:bg-[#ffffff] group-hover:text-[#000000] transition-all duration-200">
                          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                        </div>
                      </div>
                    </div>

                    <ProjectCover project={slotProject} tasks={tasks} isDarkMode={isDarkMode} compact />

                    {/* Base do Card */}
                    <div className="relative z-20 space-y-1.5 text-left p-6 sm:p-7 pt-5 mt-auto">
                      <h2 className="text-[22px] sm:text-[26px] font-medium text-[#ffffff] tracking-[-0.9px] leading-[1.15]">
                        {slotProject.title}
                      </h2>
                      <p className="text-[13px] font-normal text-[#999999] tracking-[-0.13px] line-clamp-2">
                        Próximo passo: <span className="text-[#ffffff] font-medium">{slotProject.next_step}</span>
                      </p>
                    </div>
                  </article>
                </div>
              );
            }

            return (
              <div key={slotKey} className="flex flex-col space-y-2">
                <div className="flex items-center justify-between text-[13px] px-1">
                  <span className={`font-normal flex items-center gap-1.5 ${isDarkMode ? 'text-[#999999]' : 'text-[#666666]'}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${isDarkMode ? 'bg-[#262626]' : 'bg-[#d4d4d8]'}`} />
                    {config.name}
                  </span>
                  <span className={`text-[11px] font-mono ${isDarkMode ? 'text-[#999999]' : 'text-[#666666]'}`}>
                    {config.cognitiveLoad}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setShowAddModal(true)}
                  className={`rounded-[30px] border border-dashed h-80 sm:h-88 w-full flex items-center justify-center transition-colors duration-200 cursor-pointer bg-transparent group ${
                    isDarkMode
                      ? 'border-[#262626] hover:border-[#444444]'
                      : 'border-[#d4d4d8] hover:border-[#090909]'
                  }`}
                  title={`Slot Vazio • Clique para alocar projeto em ${config.name}`}
                >
                  <Plus
                    className={`w-5 h-5 transition-colors ${
                      isDarkMode
                        ? 'text-[#999999] group-hover:text-[#ffffff]'
                        : 'text-[#666666] group-hover:text-[#090909]'
                    }`}
                  />
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* ========================================================================
          SEÇÃO 2: ESTACIONAMENTO DE IDEIAS (PROJETOS TRANCADOS 🔒)
          ======================================================================== */}
      <section className={`space-y-4 pt-4 border-t ${isDarkMode ? 'border-[#262626]' : 'border-[#e4e4e7]'}`}>
        <div
          className={`flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-2 ${
            isDarkMode ? 'border-[#262626]' : 'border-[#e4e4e7]'
          }`}
        >
          <div className="flex items-center gap-2">
            <Lock className={`w-4 h-4 ${isDarkMode ? 'text-[#999999]' : 'text-[#666666]'}`} />
            <h2 className={`text-[18px] font-semibold tracking-[-0.4px] ${isDarkMode ? 'text-[#ffffff]' : 'text-[#090909]'}`}>
              Estacionamento de Ideias ({filteredLocked.length})
            </h2>
            <span
              className={`px-2.5 py-0.5 rounded-full text-[11px] font-mono font-medium border ${
                isDarkMode
                  ? 'bg-[#1c1c1c] text-[#999999] border-[#262626]'
                  : 'bg-[#efefef] text-[#666666] border-[#e4e4e7]'
              }`}
            >
              TRANCADOS 🔒
            </span>
          </div>
          <p className={`text-[13px] ${isDarkMode ? 'text-[#999999]' : 'text-[#666666]'}`}>
            Trava de Segurança: o sistema repudia o acúmulo. Ideias estacionadas só entram em produção quando um slot for liberado.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLocked.length === 0 ? (
            <div
              className={`col-span-full text-center py-10 px-4 border border-dashed rounded-[20px] ${
                isDarkMode
                  ? 'border-[#262626] bg-[#141414]/40'
                  : 'border-[#e4e4e7] bg-[#ffffff]'
              }`}
            >
              <FolderLock className={`w-7 h-7 mx-auto mb-2 ${isDarkMode ? 'text-[#999999]' : 'text-[#666666]'}`} />
              <p className={`text-[14px] ${isDarkMode ? 'text-[#999999]' : 'text-[#666666]'}`}>
                Nenhuma ideia estacionada no momento. Use o Chat de Captura para descarregar novos impulsos.
              </p>
            </div>
          ) : (
            filteredLocked.map((proj) => {
              return (
                <article
                  key={proj.id}
                  onClick={() => handleOpenProjectEditor(proj)}
                  className={`relative rounded-[20px] overflow-hidden min-h-72 flex flex-col border cursor-pointer group select-none transition-all duration-200 ${
                    isDarkMode
                      ? 'border-[#262626] bg-[#141414] hover:border-[#444444]'
                      : 'border-[#e4e4e7] bg-[#ffffff] hover:border-[#090909]/40 shadow-[0_1px_4px_rgba(0,0,0,0.03)]'
                  }`}
                  data-purpose="project-locked-card"
                >
                  {/* Topo do Card Trancado */}
                  <div className="relative z-20 flex items-center justify-between gap-3 p-5">
                    <span
                      className={`px-3 py-1 rounded-full text-[11px] font-medium border ${
                        isDarkMode
                          ? 'bg-[#1c1c1c] border-[#262626] text-[#999999]'
                          : 'bg-[#efefef] border-[#e4e4e7] text-[#666666]'
                      }`}
                    >
                      {proj.area}
                    </span>

                    {onToggleLock && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleLock(proj.id);
                        }}
                        className={`px-3.5 py-1.5 rounded-full text-[12px] font-medium tracking-[-0.12px] flex items-center gap-1.5 transition-colors cursor-pointer ${
                          isDarkMode
                            ? 'bg-[#ffffff] hover:bg-[#f0f0f0] text-[#000000]'
                            : 'bg-[#090909] hover:bg-[#222222] text-[#ffffff]'
                        }`}
                        title="Destrancar projeto"
                      >
                        <Unlock className="w-3.5 h-3.5" />
                        <span>Destrancar</span>
                      </button>
                    )}
                  </div>

                  <ProjectCover project={proj} tasks={tasks} isDarkMode={isDarkMode} compact />

                  {/* Centro: Indicador de Cadeado */}
                  <div className="relative z-20 flex flex-col gap-1.5 px-5 pt-4">
                    <div className="flex items-center gap-2 text-[#e11d48] dark:text-[#ff5577] bg-[#ff5577]/10 px-3 py-1.5 rounded-full border border-[#ff5577]/30 w-fit">
                      <Lock className="w-3.5 h-3.5" />
                      <span className="text-[10px] font-medium font-mono tracking-wider">
                        ESTACIONAMENTO DE DOPAMINA
                      </span>
                    </div>

                    {proj.unlockConditions && proj.unlockConditions.length > 0 && (
                      <div
                        className={`p-2.5 rounded-[12px] border text-[11px] space-y-1 max-w-[260px] ${
                          isDarkMode
                            ? 'bg-[#1c1c1c] border-[#262626] text-[#999999]'
                            : 'bg-[#f7f7f8] border-[#e4e4e7] text-[#666666]'
                        }`}
                      >
                        <span
                          className={`font-medium text-[10px] uppercase tracking-wider block ${
                            isDarkMode ? 'text-[#ffffff]' : 'text-[#090909]'
                          }`}
                        >
                          Destranca após:
                        </span>
                        <p className="line-clamp-2 leading-tight">
                          • {proj.unlockConditions[0]}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Base do Card */}
                  <div className="relative z-20 space-y-1 text-left p-5 pt-4 mt-auto">
                    <div className="flex items-center gap-2">
                      <h3
                        className={`text-[18px] font-semibold tracking-[-0.4px] truncate ${
                          isDarkMode ? 'text-[#ffffff]' : 'text-[#090909]'
                        }`}
                      >
                        {proj.title}
                      </h3>
                    </div>
                    <p className={`text-[13px] line-clamp-1 ${isDarkMode ? 'text-[#999999]' : 'text-[#666666]'}`}>
                      {proj.main_goal || 'Sem objetivo principal definido.'}
                    </p>
                  </div>
                </article>
              );
            })
          )}
        </div>
      </section>

      {/* Modal de Criação de Projeto */}
      {showAddModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-150"
          onClick={() => setShowAddModal(false)}
        >
          <div 
            className={`w-full max-w-lg rounded-[24px] border p-6 sm:p-7 shadow-2xl space-y-4 text-left ${
              isDarkMode
                ? 'bg-[#141414] border-[#262626] text-[#ffffff]'
                : 'bg-[#ffffff] border-[#e4e4e7] text-[#090909]'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className={`flex items-center justify-between border-b pb-3 ${
                isDarkMode ? 'border-[#262626]' : 'border-[#e4e4e7]'
              }`}
            >
              <h3 className="text-[20px] font-semibold tracking-[-0.5px]">
                Criar Novo Projeto
              </h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className={`p-1.5 rounded-full transition cursor-pointer ${
                  isDarkMode
                    ? 'text-[#999999] hover:text-[#ffffff] hover:bg-[#1c1c1c]'
                    : 'text-[#666666] hover:text-[#090909] hover:bg-[#efefef]'
                }`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4 text-[13px]">
              <div>
                <label className="block font-medium mb-1.5">
                  Título do Projeto
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Littera Analytics API"
                  className={`w-full px-3.5 py-2.5 rounded-[10px] border text-[14px] focus:outline-none focus:border-[#0099ff] ${
                    isDarkMode
                      ? 'bg-[#090909] border-[#262626] text-[#ffffff] placeholder-[#999999]'
                      : 'bg-[#f7f7f8] border-[#e4e4e7] text-[#090909] placeholder-[#666666]'
                  }`}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium mb-1.5">
                    Área de Contexto
                  </label>
                  <select
                    value={area}
                    onChange={(e) => setArea(e.target.value as ContextArea)}
                    className={`w-full px-3 py-2.5 rounded-[10px] border text-[14px] focus:outline-none focus:border-[#0099ff] ${
                      isDarkMode
                        ? 'bg-[#090909] border-[#262626] text-[#ffffff]'
                        : 'bg-[#f7f7f8] border-[#e4e4e7] text-[#090909]'
                    }`}
                  >
                    <option value="Littera">Littera</option>
                    <option value="Aura">Aura</option>
                    <option value="IDP">IDP</option>
                    <option value="Pessoal">Pessoal</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium mb-1.5">
                    Categoria
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className={`w-full px-3 py-2.5 rounded-[10px] border text-[14px] focus:outline-none focus:border-[#0099ff] ${
                      isDarkMode
                        ? 'bg-[#090909] border-[#262626] text-[#ffffff]'
                        : 'bg-[#f7f7f8] border-[#e4e4e7] text-[#090909]'
                    }`}
                  >
                    <option value="profissional">Profissional</option>
                    <option value="academico">Acadêmico</option>
                    <option value="pessoal">Pessoal</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-medium mb-1.5">
                  Próximo Passo Imediato (Micro-ação)
                </label>
                <input
                  type="text"
                  value={nextStep}
                  onChange={(e) => setNextStep(e.target.value)}
                  placeholder="Ex: Escrever testes do endpoint de login"
                  className={`w-full px-3.5 py-2.5 rounded-[10px] border text-[14px] focus:outline-none focus:border-[#0099ff] ${
                    isDarkMode
                      ? 'bg-[#090909] border-[#262626] text-[#ffffff] placeholder-[#999999]'
                      : 'bg-[#f7f7f8] border-[#e4e4e7] text-[#090909] placeholder-[#666666]'
                  }`}
                />
              </div>

              <div
                className={`p-3.5 rounded-[15px] border flex items-center justify-between gap-2 ${
                  isDarkMode ? 'bg-[#1c1c1c] border-[#262626]' : 'bg-[#f7f7f8] border-[#e4e4e7]'
                }`}
              >
                <div className="space-y-0.5">
                  <span className="font-medium text-[#ea580c] dark:text-[#ff7a3d] flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5" />
                    {activeProjects.length >= 3 ? 'Limite atingido: guardar no estacionamento' : 'Criar como Trancado no Estacionamento'}
                  </span>
                  <p className={`text-[12px] ${isDarkMode ? 'text-[#999999]' : 'text-[#666666]'}`}>
                    {activeProjects.length >= 3
                      ? 'Os 3 projetos ativos estão ocupados. A ideia não será ativada automaticamente.'
                      : 'Protege o limite dos 3 slots do Protocolo 1-1-1. Você pode destrancar via trade-off.'}
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={createAsLocked || activeProjects.length >= 3}
                  disabled={activeProjects.length >= 3}
                  onChange={(e) => setCreateAsLocked(e.target.checked)}
                  className="w-4 h-4 rounded accent-[#0099ff] cursor-pointer"
                />
              </div>

              <div
                className={`pt-3 border-t flex justify-end gap-2.5 ${
                  isDarkMode ? 'border-[#262626]' : 'border-[#e4e4e7]'
                }`}
              >
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className={`px-4 py-2 rounded-full font-medium cursor-pointer border ${
                    isDarkMode
                      ? 'bg-[#1c1c1c] border-[#262626] text-[#ffffff] hover:bg-[#262626]'
                      : 'bg-[#efefef] border-[#e4e4e7] text-[#090909] hover:bg-[#e4e4e7]'
                  }`}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className={`px-5 py-2 rounded-full font-medium cursor-pointer ${
                    isDarkMode
                      ? 'bg-[#ffffff] hover:bg-[#f0f0f0] text-[#000000]'
                      : 'bg-[#090909] hover:bg-[#222222] text-[#ffffff]'
                  }`}
                >
                  Salvar Projeto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
