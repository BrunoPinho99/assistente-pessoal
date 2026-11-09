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
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [contextFilter, setContextFilter] = useState<ContextFilter>('todos');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  
  // Form de criação
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [area, setArea] = useState<ContextArea>('Aura');
  const [mainGoal, setMainGoal] = useState('');
  const [category, setCategory] = useState<'profissional' | 'pessoal' | 'academico'>('profissional');
  const [nextStep, setNextStep] = useState('');
  const [createAsLocked, setCreateAsLocked] = useState(true);

  // Form de Edição (Update)
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editArea, setEditArea] = useState<ContextArea>('Littera');
  const [editCategory, setEditCategory] = useState<ProjectCategory>('profissional');
  const [editMainGoal, setEditMainGoal] = useState('');
  const [editNextStep, setEditNextStep] = useState('');
  const [editStages, setEditStages] = useState<ProjectStage[]>([]);
  const [newStageInput, setNewStageInput] = useState('');

  const openEditModal = (proj: Project) => {
    setEditingProjectId(proj.id);
    setEditTitle(proj.title);
    setEditDescription(proj.description || '');
    setEditArea(proj.area);
    setEditCategory(proj.category);
    setEditMainGoal(proj.main_goal);
    setEditNextStep(proj.next_step);
    setEditStages(Array.isArray(proj.stages) ? [...proj.stages] : []);
    setNewStageInput('');
    setShowEditModal(true);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProjectId || !editTitle.trim()) return;

    const updates: Partial<Project> = {
      title: editTitle.trim(),
      description: editDescription.trim(),
      area: editArea,
      category: editCategory,
      main_goal: editMainGoal.trim() || 'Entregar objetivos estratégicos',
      next_step: editNextStep.trim() || 'Definir primeiro passo',
      stages: editStages
    };

    if (onUpdateProject) {
      onUpdateProject(editingProjectId, updates);
    }

    // Atualiza o projeto selecionado se o modal de detalhes estiver aberto
    if (selectedProject && selectedProject.id === editingProjectId) {
      setSelectedProject(prev => prev ? { ...prev, ...updates } : null);
    }

    setShowEditModal(false);
    setEditingProjectId(null);
  };

  const handleAddEditStage = () => {
    if (!newStageInput.trim()) return;
    const newStage: ProjectStage = {
      id: 'st_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      title: newStageInput.trim(),
      completed: false
    };
    setEditStages(prev => [...prev, newStage]);
    setNewStageInput('');
  };

  const handleRemoveEditStage = (stageId: string) => {
    setEditStages(prev => prev.filter(s => s.id !== stageId));
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
                  onClick={() => setSelectedProject(proj)}
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
                  onClick={() => setSelectedProject(proj)}
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

      {/* Modal de Detalhes do Projeto */}
      {selectedProject && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150"
          onClick={() => setSelectedProject(null)}
        >
          <div 
            className={`w-full max-w-xl rounded-2xl border p-6 sm:p-7 shadow-[0_20px_48px_rgba(23,32,51,0.16)] space-y-5 text-left relative overflow-hidden ${
              isDarkMode ? 'bg-[#1C2333] border-[#263248]' : 'bg-[#FFFFFF] border-[#E5EAF2]'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Banner Superior com a Capa */}
            <div className="relative h-28 -mx-6 -mt-6 sm:-mx-7 sm:-mt-7 overflow-hidden rounded-t-2xl mb-4">
              <img 
                src={getProjectCover(selectedProject.area, 0)} 
                alt={selectedProject.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
              <button
                type="button"
                onClick={() => setSelectedProject(null)}
                className="absolute top-3.5 right-3.5 p-1.5 rounded-lg bg-black/50 backdrop-blur-md border border-white/20 text-white/90 hover:text-white transition cursor-pointer z-30"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Cabeçalho do Modal */}
            <div className="border-b border-[#E5EAF2] dark:border-[#263248] pb-3 flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-0.5 rounded-md text-[11px] font-semibold border ${
                    isDarkMode ? 'bg-white/10 text-white border-white/20' : 'bg-[#EEF3FF] text-[#245BFF] border-[#D4E2FF]'
                  }`}>
                    {selectedProject.area} · {selectedProject.category}
                  </span>
                  {selectedProject.locked ? (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 flex items-center gap-1">
                      <Lock className="w-2.5 h-2.5" />
                      TRANCADO
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      ATIVO
                    </span>
                  )}
                </div>

                <h3 className={`text-xl font-bold tracking-tight mt-1.5 ${
                  isDarkMode ? 'text-[#F1F5F9]' : 'text-[#172033]'
                }`}>
                  {selectedProject.title}
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => openEditModal(selectedProject)}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer border bg-[#101522] hover:bg-[#151D31] text-white border-white/20 shadow-xs"
                  title="Editar detalhes do projeto"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  <span>Editar</span>
                </button>

                {onToggleLock && (
                  <button
                    type="button"
                    onClick={() => {
                      onToggleLock(selectedProject.id);
                      setSelectedProject(null);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer border ${
                      selectedProject.locked
                        ? 'bg-[#315DFF] text-white border-[#315DFF]'
                        : 'bg-rose-500/20 text-rose-300 border-rose-500/40 hover:bg-rose-500/30'
                    }`}
                  >
                    {selectedProject.locked ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                    <span>{selectedProject.locked ? 'Destrancar Projeto' : 'Trancar no Estacionamento'}</span>
                  </button>
                )}
              </div>
            </div>

            {/* Descrição e Próximo Passo */}
            <div className="space-y-4">
              {selectedProject.description && (
                <p className={`text-sm leading-relaxed ${isDarkMode ? 'text-[#94A3B8]' : 'text-[#687386]'}`}>
                  {selectedProject.description}
                </p>
              )}

              {/* Condições de Desbloqueio (Se trancado) */}
              {(selectedProject.locked || selectedProject.isLocked) && selectedProject.unlockConditions && selectedProject.unlockConditions.length > 0 && (
                <div className="p-4 rounded-xl border text-xs space-y-2 bg-amber-500/10 border-amber-500/30">
                  <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-amber-300 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5" />
                    Condições para Destrancar (Foco Blindado)
                  </span>
                  <ul className="space-y-1 text-xs text-amber-100/90 list-disc list-inside">
                    {selectedProject.unlockConditions.map((cond, i) => (
                      <li key={i}>{cond}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Próximo Passo */}
              <div className={`p-4 rounded-xl border text-xs space-y-1 ${
                isDarkMode ? 'bg-[#222B3D] border-[#33415C]' : 'bg-[#EEF3FF] border-[#D4E2FF]'
              }`}>
                <span className={`text-[10px] font-mono uppercase tracking-wider font-bold flex items-center gap-1.5 ${
                  isDarkMode ? 'text-white' : 'text-[#245BFF]'
                }`}>
                  <Target className="w-3.5 h-3.5" />
                  Próximo Passo Imediato
                </span>
                <p className={`font-semibold text-sm leading-relaxed ${
                  isDarkMode ? 'text-[#F1F5F9]' : 'text-[#172033]'
                }`}>
                  {selectedProject.next_step}
                </p>
              </div>

              {/* Etapas / Checklist */}
              <div className="space-y-2 pt-1">
                <div className={`flex justify-between text-xs font-medium ${
                  isDarkMode ? 'text-[#94A3B8]' : 'text-[#687386]'
                }`}>
                  <span>Etapas do Projeto</span>
                  <span>
                    {selectedProject.stages.filter(s => s.completed).length} de {selectedProject.stages.length} concluídas
                  </span>
                </div>

                <div className="space-y-1.5">
                  {selectedProject.stages.map(st => (
                    <div
                      key={st.id}
                      onClick={() => onToggleStage(selectedProject.id, st.id)}
                      className={`flex items-center gap-2.5 p-2.5 rounded-lg border text-xs cursor-pointer transition ${
                        st.completed 
                          ? isDarkMode ? 'bg-[#182030] border-[#263248] text-[#64748B]' : 'bg-[#F5F7FB] border-[#E5EAF2] text-[#9AA4B2]'
                          : isDarkMode ? 'bg-[#1C2333] border-[#263248] text-[#F1F5F9]' : 'bg-[#FFFFFF] border-[#E5EAF2] text-[#172033]'
                      }`}
                    >
                      {st.completed ? (
                        <CheckCircle2 className="w-4 h-4 text-[#245BFF] shrink-0" />
                      ) : (
                        <Circle className="w-4 h-4 text-[#9AA4B2] shrink-0" />
                      )}
                      <span className={st.completed ? 'line-through' : 'font-medium'}>
                        {st.title}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Ações Inferiores */}
            <div className="pt-2 border-t border-[#E5EAF2] dark:border-[#263248] flex justify-between items-center">
              {confirmDeleteId === selectedProject.id ? (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-rose-500 font-semibold">Excluir do MongoDB?</span>
                  <button
                    type="button"
                    onClick={() => {
                      onDeleteProject(selectedProject.id);
                      setSelectedProject(null);
                      setConfirmDeleteId(null);
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
                  onClick={() => setConfirmDeleteId(selectedProject.id)}
                  className="text-xs text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Excluir projeto</span>
                </button>
              )}

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => openEditModal(selectedProject)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold cursor-pointer border flex items-center gap-1.5 ${
                    isDarkMode ? 'bg-[#222B3D] border-[#33415C] text-[#F1F5F9]' : 'bg-[#E9EFF8] border-[#E5EAF2] text-[#172033]'
                  }`}
                >
                  <Pencil className="w-3.5 h-3.5" />
                  <span>Editar</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedProject(null);
                    setConfirmDeleteId(null);
                  }}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer border ${
                    isDarkMode ? 'bg-[#315DFF] text-white border-[#315DFF]' : 'bg-[#245BFF] text-white border-[#245BFF]'
                  }`}
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Edição de Projeto (Update CRUD) */}
      {showEditModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150"
          onClick={() => setShowEditModal(false)}
        >
          <div 
            className={`w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border p-6 sm:p-7 shadow-[0_20px_48px_rgba(23,32,51,0.16)] space-y-4 text-left ${
              isDarkMode ? 'bg-[#1C2333] border-[#263248]' : 'bg-[#FFFFFF] border-[#E5EAF2]'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#E5EAF2] dark:border-[#263248] pb-3">
              <div className="flex items-center gap-2">
                <Pencil className="w-4 h-4 text-[#315DFF]" />
                <h3 className={`text-lg font-bold ${isDarkMode ? 'text-[#F1F5F9]' : 'text-[#172033]'}`}>
                  Editar Projeto
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowEditModal(false)}
                className="p-1 rounded-lg text-[#9AA4B2] hover:text-[#172033] dark:hover:text-white transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
              <div>
                <label className={`block font-semibold mb-1 ${isDarkMode ? 'text-[#F1F5F9]' : 'text-[#172033]'}`}>
                  Título do Projeto
                </label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
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
                    value={editArea}
                    onChange={(e) => setEditArea(e.target.value as ContextArea)}
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
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value as ProjectCategory)}
                    className={`w-full px-3 py-2.5 rounded-xl border text-xs focus:outline-none focus:border-[#245BFF] ${
                      isDarkMode ? 'bg-[#141A26] border-[#263248] text-[#F1F5F9]' : 'bg-[#F5F7FB] border-[#E5EAF2] text-[#172033]'
                    }`}
                  >
                    <option value="profissional">Profissional</option>
                    <option value="pessoal">Pessoal</option>
                    <option value="academico">Acadêmico</option>
                    <option value="business">Business</option>
                    <option value="parking">Estacionamento</option>
                  </select>
                </div>
              </div>

              <div>
                <label className={`block font-semibold mb-1 ${isDarkMode ? 'text-[#F1F5F9]' : 'text-[#172033]'}`}>
                  Objetivo Principal
                </label>
                <input
                  type="text"
                  value={editMainGoal}
                  onChange={(e) => setEditMainGoal(e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-xs focus:outline-none focus:border-[#245BFF] ${
                    isDarkMode ? 'bg-[#141A26] border-[#263248] text-[#F1F5F9]' : 'bg-[#F5F7FB] border-[#E5EAF2] text-[#172033]'
                  }`}
                />
              </div>

              <div>
                <label className={`block font-semibold mb-1 ${isDarkMode ? 'text-[#F1F5F9]' : 'text-[#172033]'}`}>
                  Próximo Passo Imediato
                </label>
                <input
                  type="text"
                  value={editNextStep}
                  onChange={(e) => setEditNextStep(e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-xs focus:outline-none focus:border-[#245BFF] ${
                    isDarkMode ? 'bg-[#141A26] border-[#263248] text-[#F1F5F9]' : 'bg-[#F5F7FB] border-[#E5EAF2] text-[#172033]'
                  }`}
                />
              </div>

              <div>
                <label className={`block font-semibold mb-1 ${isDarkMode ? 'text-[#F1F5F9]' : 'text-[#172033]'}`}>
                  Descrição do Projeto
                </label>
                <textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  rows={2}
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-xs focus:outline-none focus:border-[#245BFF] resize-none ${
                    isDarkMode ? 'bg-[#141A26] border-[#263248] text-[#F1F5F9]' : 'bg-[#F5F7FB] border-[#E5EAF2] text-[#172033]'
                  }`}
                />
              </div>

              {/* Gerenciador de Etapas */}
              <div className="space-y-2 pt-2 border-t border-[#E5EAF2] dark:border-[#263248]">
                <label className={`block font-semibold ${isDarkMode ? 'text-[#F1F5F9]' : 'text-[#172033]'}`}>
                  Etapas do Projeto ({editStages.length})
                </label>

                <div className="space-y-1.5 max-h-40 overflow-y-auto">
                  {editStages.map((st, i) => (
                    <div 
                      key={st.id || i}
                      className={`flex items-center justify-between gap-2 p-2 rounded-lg border text-xs ${
                        isDarkMode ? 'bg-[#141A26] border-[#263248]' : 'bg-[#F5F7FB] border-[#E5EAF2]'
                      }`}
                    >
                      <div className="flex items-center gap-2 flex-1">
                        <input
                          type="checkbox"
                          checked={st.completed}
                          onChange={() => {
                            setEditStages(prev => prev.map((s, idx) => idx === i ? { ...s, completed: !s.completed } : s));
                          }}
                          className="rounded border-[#263248] text-[#315DFF] cursor-pointer"
                        />
                        <input
                          type="text"
                          value={st.title}
                          onChange={(e) => {
                            const val = e.target.value;
                            setEditStages(prev => prev.map((s, idx) => idx === i ? { ...s, title: val } : s));
                          }}
                          className={`flex-1 bg-transparent border-none outline-none text-xs ${st.completed ? 'line-through text-slate-500' : isDarkMode ? 'text-white' : 'text-slate-900'}`}
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveEditStage(st.id)}
                        className="p-1 text-slate-400 hover:text-rose-400 transition cursor-pointer"
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
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddEditStage(); } }}
                    placeholder="Nova etapa do projeto..."
                    className={`flex-1 px-3 py-2 rounded-xl border text-xs focus:outline-none focus:border-[#245BFF] ${
                      isDarkMode ? 'bg-[#141A26] border-[#263248] text-[#F1F5F9]' : 'bg-[#F5F7FB] border-[#E5EAF2] text-[#172033]'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={handleAddEditStage}
                    className="px-3 py-2 rounded-xl bg-[#245BFF]/15 hover:bg-[#245BFF]/25 text-[#245BFF] dark:text-blue-300 font-semibold text-xs transition cursor-pointer"
                  >
                    Adicionar
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#E5EAF2] dark:border-[#263248]">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className={`px-4 py-2.5 rounded-xl font-medium transition cursor-pointer ${
                    isDarkMode ? 'hover:bg-[#222B3D] text-[#94A3B8]' : 'hover:bg-[#E9EFF8] text-[#687386]'
                  }`}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#245BFF] hover:bg-[#1A4EE5] text-white font-semibold flex items-center gap-1.5 shadow-sm transition cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Salvar Alterações</span>
                </button>
              </div>
            </form>
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
