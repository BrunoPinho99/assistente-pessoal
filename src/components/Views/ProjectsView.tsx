import React, { useState } from 'react';
import { 
  FolderKanban, 
  Plus, 
  ArrowRight, 
  Trash2,
  CheckCircle2,
  Circle,
  X,
  Target,
  Lock,
  Unlock,
  ShieldCheck,
  FolderLock,
  Sparkles,
  Pencil,
  PlusCircle,
  Save,
  Check
} from 'lucide-react';
import { Project, Task, ContextFilter, ContextArea, ProjectStage, ProjectCategory } from '../../types';

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
  onToggleLock?: (projectId: string) => void;
  onOpenDopamineChat?: () => void;
}

export const ProjectsView: React.FC<ProjectsViewProps> = ({
  projects,
  tasks,
  isDarkMode = false,
  onToggleStage,
  onAddProject,
  onUpdateProject,
  onDeleteProject,
  onToggleLock,
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

  // Abre o editor unificado ao clicar em um projeto
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

  // Separação Estrita de Projetos Ativos vs Trancados
  const activeProjects = projects.filter(p => !p.locked);
  const lockedProjects = projects.filter(p => p.locked);

  const filteredActive = activeProjects.filter(p => {
    if (contextFilter !== 'todos' && p.area !== contextFilter) return false;
    return true;
  });

  const filteredLocked = lockedProjects.filter(p => {
    if (contextFilter !== 'todos' && p.area !== contextFilter) return false;
    return true;
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onAddProject({
      title: title.trim(),
      area,
      description: description.trim() || undefined,
      category,
      main_goal: mainGoal.trim() || 'Concluir entregas principais',
      status: 'ativo',
      locked: createAsLocked, // Respeita a regra de proteção
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

  // Mapeamento das 3 capas fotográficas de vidro fractal fornecidas pelo usuário
  const getProjectCover = (projArea: ContextArea, index: number) => {
    switch (projArea) {
      case 'Littera':
        return '/covers/cover-1.jpg'; // Vidro canelado azul/violeta com vortex
      case 'Aura':
        return '/covers/cover-2.jpg'; // Vidro canelado âmbar/laranja em onda negra
      case 'IDP':
        return '/covers/cover-idp.jpg'; // Vidro canelado azul elétrico profundo com feixe de luz
      case 'Pessoal':
      default:
        const covers = ['/covers/cover-1.jpg', '/covers/cover-2.jpg', '/covers/cover-idp.jpg'];
        return covers[index % covers.length];
    }
  };

  const contextOptions: ContextFilter[] = ['todos', 'Aura', 'Littera', 'IDP', 'Pessoal'];

  return (
    <div className="flex flex-col gap-8 text-left select-none pb-12" data-purpose="projects-view">
      
      {/* Top Header Row */}
      <header className="flex items-center justify-between text-xs pb-3 border-b border-[#E5EAF2] dark:border-[#263248]">
        <div className={`flex items-center gap-1.5 font-medium ${isDarkMode ? 'text-[#94A3B8]' : 'text-[#687386]'}`}>
          <span className="hover:text-[#245BFF] transition-colors cursor-pointer">Meu espaço</span>
          <span className={isDarkMode ? 'text-[#64748B]' : 'text-[#D2DCE8]'}>/</span>
          <span className={`font-semibold ${isDarkMode ? 'text-[#F1F5F9]' : 'text-[#172033]'}`}>Projetos</span>
        </div>

        <div className="flex items-center gap-2.5">
          {onOpenDopamineChat && (
            <button
              type="button"
              onClick={onOpenDopamineChat}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#101522] hover:bg-[#151D31] text-white border border-white/20 font-semibold text-xs transition-all cursor-pointer shadow-xs"
            >
              <Lock className="w-3.5 h-3.5 text-white" />
              <span className="hidden sm:inline">Estacionamento de Dopamina</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#245BFF] hover:bg-[#1A4EE5] active:scale-[0.98] text-white font-semibold text-xs tracking-wide shadow-[0_2px_8px_-1px_rgba(58,98,255,0.35)] transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Novo projeto</span>
          </button>
        </div>
      </header>

      {/* Hero Header & Filter Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className={`text-2xl sm:text-3xl font-bold tracking-tight ${
              isDarkMode ? 'text-[#F1F5F9]' : 'text-[#172033]'
            }`}>
              Gestão de Projetos & Foco
            </h1>
            <span className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold border ${
              isDarkMode 
                ? 'bg-white/10 text-white border-white/20' 
                : 'bg-[#315DFF]/20 text-[#315DFF] border-[#315DFF]/30'
            }`}>
              {activeProjects.length}/2 Ativos
            </span>
          </div>
          <p className={`text-sm mt-1 font-normal ${isDarkMode ? 'text-[#94A3B8]' : 'text-[#687386]'}`}>
            A regra da substituição protege seu foco: no máximo 2 frentes ativas simultâneas.
          </p>
        </div>

        {/* Filtros de Contexto */}
        <div className={`p-1 rounded-xl flex items-center gap-1 border overflow-x-auto ${
          isDarkMode ? 'bg-[#1C2333] border-[#263248]' : 'bg-[#E9EFF8] border-[#E5EAF2]'
        }`}>
          {contextOptions.map(ctx => {
            const isActive = contextFilter === ctx;
            const count = ctx === 'todos' ? projects.length : projects.filter(p => p.area === ctx).length;

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

      {/* ========================================================================
          SEÇÃO 1: PROJETOS ATIVOS (MÁXIMO 2)
          ======================================================================== */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b border-[#E5EAF2] dark:border-[#263248] pb-2">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <h2 className="text-base font-bold text-[#171D38] dark:text-white tracking-tight">
              Projetos Ativos no Foco ({filteredActive.length}/2)
            </h2>
            <span className="text-xs text-[#747E98]">
              (Renderizam tarefas no Meu Dia)
            </span>
          </div>
          <span className={`text-xs font-mono font-semibold ${isDarkMode ? 'text-slate-300' : 'text-[#315DFF]'}`}>
            Regra da Substituição Ativa
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredActive.length === 0 ? (
            <div className={`col-span-full text-center py-12 px-4 border border-dashed rounded-2xl ${
              isDarkMode ? 'border-[#263248] bg-[#1C2333]/50' : 'border-[#E5EAF2] bg-[#FFFFFF]'
            }`}>
              <FolderKanban className={`w-8 h-8 mx-auto mb-2 ${isDarkMode ? 'text-[#64748B]' : 'text-[#9AA4B2]'}`} />
              <p className={`text-xs ${isDarkMode ? 'text-[#94A3B8]' : 'text-[#687386]'}`}>
                Nenhum projeto ativo para este contexto. Destranque um projeto do estacionamento abaixo.
              </p>
            </div>
          ) : (
            filteredActive.map((proj, idx) => {
              const coverUrl = getProjectCover(proj.area, idx);

              return (
                <article
                  key={proj.id}
                  onClick={() => handleOpenProjectEditor(proj)}
                  className="relative rounded-2xl overflow-hidden h-80 sm:h-92 flex flex-col justify-between p-6 sm:p-7 border border-[#315DFF]/40 shadow-[0_8px_25px_rgba(49,93,255,0.12)] hover:shadow-[0_16px_40px_rgba(49,93,255,0.2)] cursor-pointer group select-none transition-all duration-300 hover:scale-[1.01]"
                  data-purpose="project-active-card"
                >
                  <img 
                    src={coverUrl} 
                    alt={proj.title}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                  <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent z-20 pointer-events-none" />
                  <div className="absolute top-0 inset-x-0 h-28 bg-gradient-to-b from-black/60 via-black/25 to-transparent z-10 pointer-events-none" />
                  <div className="absolute bottom-0 inset-x-0 h-48 bg-gradient-to-t from-black/95 via-black/60 to-transparent z-10 pointer-events-none" />

                  {/* Topo do Card: Badge de Ativo e Botão de Trancar */}
                  <div className="relative z-20 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 rounded-lg text-xs font-semibold bg-black/40 backdrop-blur-md border border-white/20 text-white/95 shadow-sm">
                        {proj.area}
                      </span>
                      <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-emerald-500/25 text-emerald-300 border border-emerald-500/40 backdrop-blur-md flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        <span>ATIVO</span>
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {onToggleLock && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleLock(proj.id);
                          }}
                          className="px-2.5 py-1.5 rounded-xl bg-black/40 hover:bg-rose-500/80 backdrop-blur-md border border-white/20 text-white text-[11px] font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                          title="Trancar este projeto e colocar no Estacionamento"
                        >
                          <Lock className="w-3 h-3" />
                          <span className="hidden sm:inline">Trancar</span>
                        </button>
                      )}

                      <div className="w-8 h-8 rounded-xl bg-black/30 backdrop-blur-md border border-white/20 flex items-center justify-center text-white/90 group-hover:bg-[#245BFF] group-hover:text-white group-hover:border-[#245BFF] transition-all duration-200 shadow-sm">
                        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                      </div>
                    </div>
                  </div>

                  {/* Base do Card */}
                  <div className="relative z-20 space-y-1.5 text-left">
                    <h2 className="text-2xl sm:text-[26px] font-bold text-white tracking-tight leading-snug drop-shadow-md transition-colors">
                      {proj.title}
                    </h2>
                    <p className="text-xs font-medium text-white/80 tracking-wide">
                      Próximo passo: <span className="text-white font-semibold underline decoration-white/40">{proj.next_step}</span>
                    </p>
                  </div>
                </article>
              );
            })
          )}
        </div>
      </section>

      {/* ========================================================================
          SEÇÃO 2: ESTACIONAMENTO DE DOPAMINA (PROJETOS TRANCADOS 🔒)
          ======================================================================== */}
      <section className="space-y-4 pt-4 border-t border-[#E5EAF2] dark:border-[#263248]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E5EAF2] dark:border-[#263248] pb-2">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-[#8E9BB5]" />
            <h2 className="text-base font-bold text-[#171D38] dark:text-white tracking-tight">
              Estacionamento de Dopamina / Arquivo Morto ({filteredLocked.length})
            </h2>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#101522] text-[#8E9BB5] border border-white/10">
              LOCKED 🔒
            </span>
          </div>
          <p className="text-xs text-[#747E98]">
            Ideias salvas sem poluir o foco. Para destrancar, use o Trade-off.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLocked.length === 0 ? (
            <div className={`col-span-full text-center py-10 px-4 border border-dashed rounded-2xl ${
              isDarkMode ? 'border-[#263248] bg-[#1C2333]/50' : 'border-[#E5EAF2] bg-[#FFFFFF]'
            }`}>
              <FolderLock className={`w-8 h-8 mx-auto mb-2 text-[#747E98]`} />
              <p className={`text-xs ${isDarkMode ? 'text-[#94A3B8]' : 'text-[#687386]'}`}>
                Nenhuma ideia estacionada no momento. Use o Chat de Captura para descarregar novos impulsos.
              </p>
            </div>
          ) : (
            filteredLocked.map((proj, idx) => {
              const coverUrl = getProjectCover(proj.area, idx + 2);

              return (
                <article
                  key={proj.id}
                  onClick={() => handleOpenProjectEditor(proj)}
                  className="relative rounded-2xl overflow-hidden h-72 flex flex-col justify-between p-5 border border-white/10 shadow-sm cursor-pointer group select-none transition-all duration-200 hover:border-[#315DFF]/40"
                  data-purpose="project-locked-card"
                >
                  <img 
                    src={coverUrl} 
                    alt={proj.title}
                    className="absolute inset-0 w-full h-full object-cover filter grayscale contrast-75 brightness-50 group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-[1px]" />

                  {/* Topo do Card Trancado */}
                  <div className="relative z-20 flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-black/60 backdrop-blur-md border border-white/20 text-[#8E9BB5]">
                      {proj.area}
                    </span>

                    {onToggleLock && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleLock(proj.id);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-[#315DFF] hover:bg-[#254ED9] text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
                        title="Destrancar projeto (dispara Trade-off se limite de 2 atingido)"
                      >
                        <Unlock className="w-3.5 h-3.5" />
                        <span>Destrancar</span>
                      </button>
                    )}
                  </div>

                  {/* Centro: Indicador de Cadeado e Categoria */}
                  <div className="relative z-20 flex flex-col gap-1.5">
                    <div className="flex items-center gap-2 text-rose-300 bg-black/60 backdrop-blur-md px-2.5 py-1.5 rounded-xl border border-white/10 w-fit">
                      <Lock className="w-3.5 h-3.5 text-rose-400" />
                      <span className="text-[10px] font-bold font-mono tracking-wider">
                        ESTACIONAMENTO DE DOPAMINA
                      </span>
                    </div>

                    {proj.unlockConditions && proj.unlockConditions.length > 0 && (
                      <div className="bg-black/75 backdrop-blur-md p-2 rounded-xl border border-white/10 text-[10px] text-amber-200/90 space-y-1 max-w-[260px]">
                        <span className="font-semibold text-[9px] uppercase tracking-wider text-amber-300/80 block">
                          Destranca após:
                        </span>
                        <p className="line-clamp-2 leading-tight">
                          • {proj.unlockConditions[0]}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Base do Card */}
                  <div className="relative z-20 space-y-1 text-left">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-bold text-white tracking-tight truncate">
                        {proj.name || proj.title}
                      </h3>
                      {proj.category && (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-mono uppercase bg-white/10 text-white/80 border border-white/10">
                          {proj.category}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-[#A6B2D1] line-clamp-2">
                      {proj.description || proj.main_goal}
                    </p>
                  </div>
                </article>
              );
            })
          )}
        </div>
      </section>

      {/* ========================================================================
          PAINEL & EDITOR UNIFICADO DE PROJETO (ESTILO NOTION / LINEAR)
          ======================================================================== */}
      {selectedProject && projectDraft && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-in fade-in duration-150 overflow-y-auto"
          onClick={handleCloseProjectEditor}
        >
          <div 
            className="w-full max-w-2xl max-h-[90vh] flex flex-col rounded-3xl overflow-hidden border border-white/20 bg-[#101522] shadow-[0_25px_80px_rgba(0,0,0,0.85)] text-left animate-in zoom-in-95 duration-150 relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 1. Capa Superior com Gradiente e Controles */}
            <div className="relative h-28 sm:h-32 shrink-0 overflow-hidden">
              <img 
                src={getProjectCover(projectDraft.area, 0)} 
                alt={projectDraft.title}
                className="w-full h-full object-cover filter brightness-90"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#101522] via-black/40 to-black/60" />

              {/* Botão Fechar no Topo Direito */}
              <button
                type="button"
                onClick={handleCloseProjectEditor}
                className="absolute top-3.5 right-3.5 p-2 rounded-xl bg-black/60 hover:bg-black/90 backdrop-blur-md border border-white/25 text-white/90 hover:text-white transition cursor-pointer z-30"
                title="Fechar"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Badges e Ações Rápidas no Banner */}
              <div className="absolute bottom-3 left-5 right-5 flex items-center justify-between z-20">
                <div className="flex items-center gap-2">
                  {/* Seletor de Área */}
                  <select
                    value={projectDraft.area}
                    onChange={(e) => {
                      const val = e.target.value as ContextArea;
                      setProjectDraft(prev => prev ? { ...prev, area: val } : null);
                    }}
                    className="px-2.5 py-1 rounded-lg text-xs font-bold bg-black/70 backdrop-blur-md border border-white/25 text-white cursor-pointer focus:outline-none focus:border-[#315DFF]"
                  >
                    <option value="Littera" className="bg-[#101522] text-white">Littera</option>
                    <option value="Aura" className="bg-[#101522] text-white">Aura</option>
                    <option value="IDP" className="bg-[#101522] text-white">IDP</option>
                    <option value="Pessoal" className="bg-[#101522] text-white">Pessoal</option>
                  </select>

                  {/* Seletor de Categoria */}
                  <select
                    value={projectDraft.category}
                    onChange={(e) => {
                      const val = e.target.value as ProjectCategory;
                      setProjectDraft(prev => prev ? { ...prev, category: val } : null);
                    }}
                    className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-black/70 backdrop-blur-md border border-white/25 text-slate-200 cursor-pointer focus:outline-none focus:border-[#315DFF]"
                  >
                    <option value="profissional" className="bg-[#101522] text-white">Profissional</option>
                    <option value="pessoal" className="bg-[#101522] text-white">Pessoal</option>
                    <option value="academico" className="bg-[#101522] text-white">Acadêmico</option>
                    <option value="business" className="bg-[#101522] text-white">Business</option>
                    <option value="parking" className="bg-[#101522] text-white">Estacionamento</option>
                  </select>
                </div>

                {/* Toggle Cadeado / Ativo */}
                {onToggleLock && (
                  <button
                    type="button"
                    onClick={() => {
                      onToggleLock(projectDraft.id);
                      setProjectDraft(prev => prev ? { ...prev, locked: !prev.locked } : null);
                    }}
                    className={`px-3 py-1 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer border shadow-sm ${
                      projectDraft.locked
                        ? 'bg-[#315DFF] hover:bg-[#254BE0] text-white border-[#315DFF]'
                        : 'bg-rose-500/25 text-rose-200 border-rose-500/40 hover:bg-rose-500/35'
                    }`}
                  >
                    {projectDraft.locked ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                    <span>{projectDraft.locked ? 'Destrancar' : 'Trancar no Estacionamento'}</span>
                  </button>
                )}
              </div>
            </div>

            {/* 2. Corpo Scrollável do Editor (Sem corte de tela) */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-7 space-y-5 text-left custom-scrollbar">
              {/* Título Editável */}
              <div className="space-y-1">
                <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold block">
                  Título do Projeto
                </label>
                <input
                  type="text"
                  value={projectDraft.title}
                  onChange={(e) => setProjectDraft(prev => prev ? { ...prev, title: e.target.value } : null)}
                  placeholder="Nome do projeto..."
                  className="w-full text-xl sm:text-2xl font-bold text-white bg-transparent border-b border-white/10 hover:border-white/30 focus:border-[#315DFF] focus:outline-none transition-colors py-1"
                />
              </div>

              {/* Descrição Editável */}
              <div className="space-y-1">
                <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold block">
                  Descrição & Contexto
                </label>
                <textarea
                  value={projectDraft.description || ''}
                  onChange={(e) => setProjectDraft(prev => prev ? { ...prev, description: e.target.value } : null)}
                  placeholder="Descreva o escopo, objetivos centrais e notas deste projeto..."
                  rows={2}
                  className="w-full text-xs text-slate-300 bg-transparent border-b border-white/10 hover:border-white/30 focus:border-[#315DFF] focus:outline-none resize-none transition-colors py-1 leading-relaxed"
                />
              </div>

              {/* Card do Próximo Passo Imediato */}
              <div className="p-4 rounded-2xl bg-[#141F36] border border-[#315DFF]/40 space-y-2">
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-blue-400 uppercase tracking-wider">
                  <Target className="w-3.5 h-3.5" />
                  <span>Próximo Passo Imediato</span>
                </div>
                <input
                  type="text"
                  value={projectDraft.next_step}
                  onChange={(e) => setProjectDraft(prev => prev ? { ...prev, next_step: e.target.value } : null)}
                  placeholder="Qual é a próxima ação física necessária para avançar?"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0C1322] border border-white/15 text-white text-xs font-semibold focus:outline-none focus:border-[#315DFF]"
                />
              </div>

              {/* Card do Objetivo Estratégico */}
              <div className="p-4 rounded-2xl bg-[#131929] border border-white/10 space-y-2">
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Objetivo Estratégico do Projeto</span>
                </div>
                <input
                  type="text"
                  value={projectDraft.main_goal}
                  onChange={(e) => setProjectDraft(prev => prev ? { ...prev, main_goal: e.target.value } : null)}
                  placeholder="Meta central (ex: Validar com 5 clientes reais)"
                  className="w-full px-3.5 py-2 rounded-xl bg-[#0C1322] border border-white/10 text-slate-200 text-xs focus:outline-none focus:border-[#315DFF]"
                />
              </div>

              {/* Condições de Desbloqueio (Se trancado) */}
              {projectDraft.locked && (
                <div className="p-4 rounded-2xl border text-xs space-y-2 bg-amber-500/10 border-amber-500/30 text-amber-200">
                  <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-amber-300 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5" />
                    <span>Condições para Destrancar (Foco Blindado)</span>
                  </span>
                  <ul className="space-y-1 text-xs text-amber-100/90 list-disc list-inside">
                    {projectDraft.unlockConditions && projectDraft.unlockConditions.length > 0 ? (
                      projectDraft.unlockConditions.map((cond, i) => (
                        <li key={i}>{cond}</li>
                      ))
                    ) : (
                      <li>Concluir entregas prioritárias do Littera e liberar slot de foco ativo.</li>
                    )}
                  </ul>
                </div>
              )}

              {/* Etapas do Projeto (Checklist & Editor Inline) */}
              <div className="space-y-3 pt-1">
                <div className="flex items-center justify-between text-xs font-medium text-slate-300">
                  <span className="font-bold flex items-center gap-1.5">
                    <span>Etapas do Projeto</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] bg-white/10 text-white font-mono">
                      {projectDraft.stages.filter(s => s.completed).length}/{projectDraft.stages.length}
                    </span>
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Clique no texto para editar o nome da etapa
                  </span>
                </div>

                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {projectDraft.stages.map((st) => (
                    <div 
                      key={st.id}
                      className="flex items-center justify-between gap-2.5 p-2.5 rounded-xl border border-white/10 bg-[#141C2E] text-xs transition hover:border-white/20 group"
                    >
                      <button
                        type="button"
                        onClick={() => handleToggleDraftStage(st.id)}
                        className="shrink-0 cursor-pointer text-slate-400 hover:text-[#315DFF] transition-colors"
                      >
                        {st.completed ? (
                          <CheckCircle2 className="w-4 h-4 text-[#315DFF]" />
                        ) : (
                          <Circle className="w-4 h-4 text-slate-500 hover:text-white" />
                        )}
                      </button>

                      <input
                        type="text"
                        value={st.title}
                        onChange={(e) => handleUpdateDraftStageTitle(st.id, e.target.value)}
                        className={`flex-1 bg-transparent border-none outline-none text-xs ${
                          st.completed ? 'line-through text-slate-500' : 'text-slate-100'
                        }`}
                      />

                      <button
                        type="button"
                        onClick={() => handleRemoveDraftStage(st.id)}
                        className="p-1 text-slate-500 hover:text-rose-400 opacity-60 group-hover:opacity-100 transition-opacity cursor-pointer"
                        title="Remover etapa"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Adicionar nova etapa */}
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="text"
                    value={newStageInput}
                    onChange={(e) => setNewStageInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddDraftStage();
                      }
                    }}
                    placeholder="Adicionar nova etapa (Pressione Enter)..."
                    className="flex-1 px-3.5 py-2 rounded-xl bg-[#0D1527] border border-white/15 text-white text-xs focus:outline-none focus:border-[#315DFF]"
                  />
                  <button
                    type="button"
                    onClick={handleAddDraftStage}
                    className="px-3.5 py-2 rounded-xl bg-[#315DFF] hover:bg-[#254BE0] text-white font-semibold text-xs transition cursor-pointer flex items-center gap-1 shadow-sm"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Adicionar</span>
                  </button>
                </div>
              </div>
            </div>

            {/* 3. Rodapé com Ações e Feedback de Salvamento */}
            <div className="p-4 sm:px-7 bg-[#151D31] border-t border-white/10 flex items-center justify-between shrink-0">
              <div>
                {confirmDeleteId === projectDraft.id ? (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-rose-400 font-semibold">Excluir do MongoDB?</span>
                    <button
                      type="button"
                      onClick={() => {
                        onDeleteProject(projectDraft.id);
                        handleCloseProjectEditor();
                      }}
                      className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition cursor-pointer"
                    >
                      Confirmar
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmDeleteId(null)}
                      className="px-2 py-1 rounded-lg text-xs text-slate-400 hover:text-white transition cursor-pointer"
                    >
                      Cancelar
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setConfirmDeleteId(projectDraft.id)}
                    className="text-xs text-rose-400 hover:text-rose-300 hover:underline flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Excluir projeto</span>
                  </button>
                )}
              </div>

              <div className="flex items-center gap-3">
                {saveFeedback && (
                  <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1 animate-in fade-in">
                    <Check className="w-3.5 h-3.5" />
                    <span>Salvo no MongoDB!</span>
                  </span>
                )}

                <button
                  type="button"
                  onClick={handleSaveProjectDraft}
                  disabled={isSaving}
                  className="px-4 py-2 rounded-xl bg-[#315DFF] hover:bg-[#254BE0] text-white font-semibold text-xs flex items-center gap-1.5 transition cursor-pointer shadow-md"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{isSaving ? 'Salvando...' : 'Salvar Alterações'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleCloseProjectEditor}
                  className="px-4 py-2 rounded-xl bg-[#222B3D] hover:bg-[#2C384E] text-slate-200 font-semibold text-xs border border-white/10 transition cursor-pointer"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Criação de Projeto */}
      {showAddModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150"
          onClick={() => setShowAddModal(false)}
        >
          <div 
            className={`w-full max-w-lg rounded-2xl border p-6 sm:p-7 shadow-[0_20px_48px_rgba(23,32,51,0.16)] space-y-4 text-left ${
              isDarkMode ? 'bg-[#1C2333] border-[#263248]' : 'bg-[#FFFFFF] border-[#E5EAF2]'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#E5EAF2] dark:border-[#263248] pb-3">
              <h3 className={`text-lg font-bold ${isDarkMode ? 'text-[#F1F5F9]' : 'text-[#172033]'}`}>
                Criar Novo Projeto
              </h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-lg text-[#9AA4B2] hover:text-[#172033] dark:hover:text-white transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              <div>
                <label className={`block font-semibold mb-1 ${isDarkMode ? 'text-[#F1F5F9]' : 'text-[#172033]'}`}>
                  Título do Projeto
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Littera Analytics API"
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-xs focus:outline-none focus:border-[#245BFF] ${
                    isDarkMode ? 'bg-[#141A26] border-[#263248] text-[#F1F5F9]' : 'bg-[#F5F7FB] border-[#E5EAF2] text-[#172033]'
                  }`}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={`block font-semibold mb-1 ${isDarkMode ? 'text-[#F1F5F9]' : 'text-[#172033]'}`}>
                    Área de Contexto
                  </label>
                  <select
                    value={area}
                    onChange={(e) => setArea(e.target.value as ContextArea)}
                    className={`w-full px-3 py-2.5 rounded-xl border text-xs focus:outline-none focus:border-[#245BFF] ${
                      isDarkMode ? 'bg-[#141A26] border-[#263248] text-[#F1F5F9]' : 'bg-[#F5F7FB] border-[#E5EAF2] text-[#172033]'
                    }`}
                  >
                    <option value="Littera">Littera</option>
                    <option value="Aura">Aura</option>
                    <option value="IDP">IDP</option>
                    <option value="Pessoal">Pessoal</option>
                  </select>
                </div>

                <div>
                  <label className={`block font-semibold mb-1 ${isDarkMode ? 'text-[#F1F5F9]' : 'text-[#172033]'}`}>
                    Categoria
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className={`w-full px-3 py-2.5 rounded-xl border text-xs focus:outline-none focus:border-[#245BFF] ${
                      isDarkMode ? 'bg-[#141A26] border-[#263248] text-[#F1F5F9]' : 'bg-[#F5F7FB] border-[#E5EAF2] text-[#172033]'
                    }`}
                  >
                    <option value="profissional">Profissional</option>
                    <option value="academico">Acadêmico</option>
                    <option value="pessoal">Pessoal</option>
                  </select>
                </div>
              </div>

              <div>
                <label className={`block font-semibold mb-1 ${isDarkMode ? 'text-[#F1F5F9]' : 'text-[#172033]'}`}>
                  Próximo Passo Imediato (Micro-ação)
                </label>
                <input
                  type="text"
                  value={nextStep}
                  onChange={(e) => setNextStep(e.target.value)}
                  placeholder="Ex: Escrever testes do endpoint de login"
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-xs focus:outline-none focus:border-[#245BFF] ${
                    isDarkMode ? 'bg-[#141A26] border-[#263248] text-[#F1F5F9]' : 'bg-[#F5F7FB] border-[#E5EAF2] text-[#172033]'
                  }`}
                />
              </div>

              {/* Status de Bloqueio (Regra de foco) */}
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-2">
                <div className="space-y-0.5">
                  <span className="font-bold text-amber-300 flex items-center gap-1">
                    <Lock className="w-3 h-3" />
                    Criar como Trancado no Estacionamento
                  </span>
                  <p className="text-[10px] text-[#8E9BB5]">
                    Protege o limite de 2 projetos ativos. Você pode destrancar via trade-off.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={createAsLocked}
                  onChange={(e) => setCreateAsLocked(e.target.checked)}
                  className="w-4 h-4 rounded text-[#315DFF] cursor-pointer"
                />
              </div>

              <div className="pt-3 border-t border-[#E5EAF2] dark:border-[#263248] flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className={`px-4 py-2 rounded-xl font-semibold cursor-pointer border ${
                    isDarkMode ? 'bg-[#222B3D] border-[#33415C] text-[#F1F5F9]' : 'bg-[#E9EFF8] border-[#E5EAF2] text-[#172033]'
                  }`}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#245BFF] hover:bg-[#1A4EE5] text-white font-semibold cursor-pointer"
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
