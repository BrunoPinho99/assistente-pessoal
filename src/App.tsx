import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { NavigationTab, Task, Project, ThemeMode } from './types';
import { usePersonalOS } from './lib/store';

// Navigation Components
import { Sidebar } from './components/Navigation/Sidebar';

// Modals
import { QuickCaptureModal } from './components/Modals/QuickCaptureModal';
import { LostHelpModal } from './components/Modals/LostHelpModal';
import { EmergencyTriageModal } from './components/Modals/EmergencyTriageModal';
import { TaskModal } from './components/Modals/TaskModal';
import { TradeoffModal } from './components/Modals/TradeoffModal';
import { SliceTaskModal } from './components/Modals/SliceTaskModal';
import { DopamineParkingChat } from './components/Capture/DopamineParkingChat';

// Views estritas do Personal OS (Hoje, Tarefas, Projetos, Estudos)
import { DashboardView } from './components/Views/DashboardView';
import { TasksView } from './components/Views/TasksView';
import { ProjectsView } from './components/Views/ProjectsView';
import { StudiesView } from './components/Views/StudiesView';

export function App() {
  const {
    // Data
    projects,
    tasks,
    subjects,
    flashcards,
    habits,
    // Preferences
    themeMode,
    setThemeMode,
    isCalmMode,
    setIsCalmMode,
    // Tasks
    addTask,
    updateTask,
    deleteTask,
    toggleTaskStatus,
    // Projects
    addProject,
    updateProject,
    deleteProject,
    toggleProjectStage,
    toggleProjectLock,
    setProjectSlot,
    executeProjectTradeoff,
    parkDopamineIdea,
    applyTaskSlice,
    // Studies
    addSubject,
    updateSubject,
    deleteSubject,
    addFlashcard,
    reviewFlashcard,
    logStudyHours,
    // Habits
    toggleHabitDate,
    // Metrics & Tools
    staleProjects,
    quickCapture
  } = usePersonalOS();

  // Navigation State
  const [activeTab, setActiveTab] = useState<NavigationTab>('hoje');
  const [searchQuery] = useState('');

  // Modals State
  const [isQuickCaptureOpen, setIsQuickCaptureOpen] = useState(false);
  const [isLostHelpOpen, setIsLostHelpOpen] = useState(false);
  const [isEmergencyTriageOpen, setIsEmergencyTriageOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);

  // Estacionamento de Dopamina (Chat de Captura)
  const [isDopamineChatOpen, setIsDopamineChatOpen] = useState(false);

  // Trade-off Modal (A Regra da Substituição: Máx 3 Slots Protocolo 1-1-1)
  const [isTradeoffOpen, setIsTradeoffOpen] = useState(false);
  const [projectToUnlockCandidate, setProjectToUnlockCandidate] = useState<Project | null>(null);

  // Fatiar Tarefa com IA (Bloco de 45m / Anti-Paralisia)
  const [isSliceModalOpen, setIsSliceModalOpen] = useState(false);
  const [taskToSlice, setTaskToSlice] = useState<Task | null>(null);

  // Active Focus Task
  const [, setActiveFocusTask] = useState<Task | null>(tasks[0] || null);

  const handleStartFocus = (task: Task) => {
    setActiveFocusTask(task);
    setActiveTab('hoje');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenTaskModal = (task?: Task | null) => {
    setTaskToEdit(task || null);
    setIsTaskModalOpen(true);
  };

  const handleToggleProjectLock = (projectId: string, targetSlot?: any) => {
    const res = toggleProjectLock(projectId, targetSlot);
    if (res.requiresTradeoff && res.projectToUnlock) {
      setProjectToUnlockCandidate(res.projectToUnlock);
      setIsTradeoffOpen(true);
    }
  };

  const handleRequestSliceTask = (task: Task) => {
    setTaskToSlice(task);
    setIsSliceModalOpen(true);
  };

  const handleSaveTask = (taskData: Omit<Task, 'id' | 'created_at'>) => {
    if (taskToEdit) {
      updateTask(taskToEdit.id, taskData);
    } else {
      addTask(taskData);
      confetti({
        particleCount: 30,
        spread: 40,
        colors: ['#ffffff', '#0099ff', '#d44df0', '#6a4cf5']
      });
    }
  };

  const handleToggleTaskWithConfetti = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    toggleTaskStatus(taskId);
    if (task && task.status !== 'concluido') {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.75 },
        colors: ['#ffffff', '#0099ff', '#d44df0', '#6a4cf5']
      });
    }
  };

  const filteredTasks = (tasks || []).filter(t => 
    t && (
      !searchQuery || 
      (t.title && t.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (t.description && t.description.toLowerCase().includes(searchQuery.toLowerCase()))
    )
  );

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleToggleTheme = () => {
    const nextMode: ThemeMode = 'dark';
    setThemeMode(nextMode);
  };

  return (
    <div className="h-full w-full flex overflow-hidden antialiased font-sans bg-[#090909] text-[#ffffff] dark selection:bg-[#0099ff]/30 selection:text-white">
      {/* Sidebar — Framer Dark Canvas (#090909) with #262626 hairline */}
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        userName="Bruno Pinho"
        userRole="Espaço pessoal"
        themeMode={themeMode}
        onChangeThemeMode={setThemeMode}
        isCalmMode={isCalmMode}
        onToggleCalmMode={() => setIsCalmMode(!isCalmMode)}
        isMobileOpen={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Artboard Canvas (#090909) */}
      <main
        className="flex-1 flex flex-col h-full overflow-y-auto overflow-x-hidden min-w-0 relative bg-[#090909]"
        data-purpose="main-content-scroll"
      >
        <div className="max-w-[1200px] w-full mx-auto px-5 sm:px-8 lg:px-10 py-7 flex flex-col gap-8 min-w-0">
          {/* 1. MÓDULO HOJE (Meu Dia) */}
          {activeTab === 'hoje' && (
            <DashboardView
              userName="Bruno"
              tasks={filteredTasks}
              projects={projects}
              habits={habits}
              subjects={subjects}
              isCalmMode={isCalmMode}
              themeMode="dark"
              isDarkMode={true}
              onChangeThemeMode={setThemeMode}
              onToggleTheme={handleToggleTheme}
              onToggleTask={handleToggleTaskWithConfetti}
              onStartFocus={handleStartFocus}
              onToggleHabit={toggleHabitDate}
              onOpenLostHelp={() => setIsLostHelpOpen(true)}
              onOpenQuickCapture={() => setIsQuickCaptureOpen(true)}
              onNavigateTab={setActiveTab}
              onEditTask={handleOpenTaskModal}
              onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
              onRequestSliceTask={handleRequestSliceTask}
              onOpenDopamineChat={() => setIsDopamineChatOpen(true)}
            />
          )}

          {/* 2. MÓDULO TAREFAS */}
          {activeTab === 'tarefas' && (
            <TasksView
              tasks={filteredTasks}
              projects={projects}
              isDarkMode={true}
              onToggleTask={handleToggleTaskWithConfetti}
              onOpenTaskModal={handleOpenTaskModal}
              onDeleteTask={deleteTask}
              onUpdateTaskStatus={(id, status) => updateTask(id, { status })}
              onStartFocus={handleStartFocus}
              onRequestSliceTask={handleRequestSliceTask}
            />
          )}

          {/* 3. MÓDULO PROJETOS */}
          {activeTab === 'projetos' && (
            <ProjectsView
              projects={projects}
              tasks={tasks}
              staleProjects={staleProjects}
              isDarkMode={true}
              onToggleStage={toggleProjectStage}
              onAddProject={addProject}
              onUpdateProject={updateProject}
              onDeleteProject={deleteProject}
              onStartFocus={handleStartFocus}
              onToggleLock={handleToggleProjectLock}
              onSetProjectSlot={setProjectSlot}
              onOpenDopamineChat={() => setIsDopamineChatOpen(true)}
            />
          )}

          {/* 4. MÓDULO ESTUDOS & CURSOS */}
          {activeTab === 'estudos' && (
            <StudiesView
              subjects={subjects}
              flashcards={flashcards}
              isDarkMode={true}
              onAddSubject={addSubject}
              onUpdateSubject={updateSubject}
              onDeleteSubject={deleteSubject}
              onAddFlashcard={addFlashcard}
              onReviewFlashcard={reviewFlashcard}
              onLogStudyHours={logStudyHours}
            />
          )}
        </div>
      </main>

      {/* 1. Assistente IA & Copiloto */}
      <DopamineParkingChat
        isOpen={isDopamineChatOpen}
        onOpen={() => setIsDopamineChatOpen(true)}
        onClose={() => setIsDopamineChatOpen(false)}
        userName="Bruno"
        tasks={tasks}
        projects={projects}
        parkedProjects={projects.filter(p => p.locked)}
        activeProjects={projects.filter(p => !p.locked)}
        onAddTask={addTask}
        onUpdateTask={updateTask}
        onDeleteTask={deleteTask}
        onToggleTask={handleToggleTaskWithConfetti}
        onSliceTask={applyTaskSlice}
        onAddProject={addProject}
        onUpdateProject={updateProject}
        onDeleteProject={deleteProject}
        onParkIdea={parkDopamineIdea}
        onStartFocus={handleStartFocus}
        onNavigateTab={setActiveTab}
        onNavigateToProjects={() => setActiveTab('projetos')}
        isDarkMode={true}
      />

      {/* 2. Modal de Trade-off */}
      <TradeoffModal
        isOpen={isTradeoffOpen}
        onClose={() => {
          setIsTradeoffOpen(false);
          setProjectToUnlockCandidate(null);
        }}
        projectToUnlock={projectToUnlockCandidate}
        activeProjects={projects.filter(p => !p.locked)}
        onConfirmTradeoff={executeProjectTradeoff}
      />

      {/* 3. Modal de Fatiar Tarefa com IA */}
      <SliceTaskModal
        isOpen={isSliceModalOpen}
        onClose={() => {
          setIsSliceModalOpen(false);
          setTaskToSlice(null);
        }}
        task={taskToSlice}
        onApplySlice={applyTaskSlice}
      />

      {/* Modais Globais de Apoio */}
      <QuickCaptureModal
        isOpen={isQuickCaptureOpen}
        isDarkMode={true}
        onClose={() => setIsQuickCaptureOpen(false)}
        onCapture={(text, type) => quickCapture(text, type)}
      />

      <LostHelpModal
        isOpen={isLostHelpOpen}
        isDarkMode={true}
        onClose={() => setIsLostHelpOpen(false)}
        tasks={tasks}
        projects={projects}
        subjects={subjects}
        habits={habits}
        onStartFocus={handleStartFocus}
      />

      <EmergencyTriageModal
        isOpen={isEmergencyTriageOpen}
        isDarkMode={true}
        onClose={() => setIsEmergencyTriageOpen(false)}
        tasks={tasks}
        onDeferTask={(id) => updateTask(id, { status: 'adiado' })}
        onDeleteTask={deleteTask}
        onCompleteTask={handleToggleTaskWithConfetti}
      />

      <TaskModal
        isOpen={isTaskModalOpen}
        isDarkMode={true}
        onClose={() => {
          setIsTaskModalOpen(false);
          setTaskToEdit(null);
        }}
        taskToEdit={taskToEdit}
        projects={projects}
        subjects={subjects}
        onSave={handleSaveTask}
      />
    </div>
  );
}

export default App;
