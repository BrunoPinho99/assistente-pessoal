import React, { useState } from 'react';
import { 
  GraduationCap, 
  Plus, 
  RotateCw, 
  Clock, 
  BookOpen, 
  CheckCircle2, 
  Brain,
  Trash2,
  X
} from 'lucide-react';
import { StudySubject, Flashcard } from '../../types';

interface StudiesViewProps {
  subjects: StudySubject[];
  flashcards: Flashcard[];
  isDarkMode?: boolean;
  onAddSubject: (subjectData: Omit<StudySubject, 'id' | 'created_at' | 'updated_at'>) => void;
  onUpdateSubject: (id: string, updates: Partial<StudySubject>) => void;
  onDeleteSubject: (id: string) => void;
  onAddFlashcard: (cardData: Omit<Flashcard, 'id' | 'interval_days' | 'repetitions' | 'next_review'>) => void;
  onReviewFlashcard: (cardId: string, quality: 'facil' | 'bom' | 'dificil') => void;
  onLogStudyHours: (subjectId: string, hours: number) => void;
}

export const StudiesView: React.FC<StudiesViewProps> = ({
  subjects,
  flashcards,
  isDarkMode = false,
  onAddSubject,
  onUpdateSubject,
  onDeleteSubject,
  onAddFlashcard,
  onReviewFlashcard,
  onLogStudyHours
}) => {
  const [activeTab, setActiveTab] = useState<'disciplinas' | 'flashcards'>('disciplinas');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(subjects[0]?.id || '');
  
  // Flashcard review state
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // New subject modal state
  const [showSubjectModal, setShowSubjectModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState<any>('disciplina');
  const [newTargetHours, setNewTargetHours] = useState(40);

  // New flashcard modal state
  const [showCardModal, setShowCardModal] = useState(false);
  const [cardFront, setCardFront] = useState('');
  const [cardBack, setCardBack] = useState('');

  const currentCards = flashcards.filter(f => !selectedSubjectId || f.subject_id === selectedSubjectId);
  const activeCard = currentCards[activeCardIndex] || null;

  const handleCreateSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    onAddSubject({
      title: newTitle.trim(),
      area: 'IDP',
      type: newType,
      status: 'estudando',
      hours_studied: 0,
      target_hours: newTargetHours,
      modules: [
        { id: 'm_1', title: 'Fundamentos e Leitura Inicial', completed: false },
        { id: 'm_2', title: 'Aprofundamento e Exercícios', completed: false }
      ]
    });

    setNewTitle('');
    setShowSubjectModal(false);
  };

  const handleCreateCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cardFront.trim() || !cardBack.trim() || !selectedSubjectId) return;

    onAddFlashcard({
      subject_id: selectedSubjectId,
      front: cardFront.trim(),
      back: cardBack.trim()
    });

    setCardFront('');
    setCardBack('');
    setShowCardModal(false);
  };

  const handleAnswerCard = (quality: 'facil' | 'bom' | 'dificil') => {
    if (!activeCard) return;
    onReviewFlashcard(activeCard.id, quality);
    setIsFlipped(false);
    if (activeCardIndex < currentCards.length - 1) {
      setActiveCardIndex(prev => prev + 1);
    } else {
      setActiveCardIndex(0);
    }
  };

  return (
    <div className="flex flex-col gap-6 text-left select-none" data-purpose="studies-view">
      
      {/* Top Header Row */}
      <header className="flex items-center justify-between text-xs pb-3 border-b border-[#E5EAF2] dark:border-[#263248]">
        <div className={`flex items-center gap-1.5 font-medium ${isDarkMode ? 'text-[#94A3B8]' : 'text-[#687386]'}`}>
          <span className="hover:text-[#245BFF] transition-colors cursor-pointer">Meu espaço</span>
          <span className={isDarkMode ? 'text-[#64748B]' : 'text-[#D2DCE8]'}>/</span>
          <span className={`font-semibold ${isDarkMode ? 'text-[#F1F5F9]' : 'text-[#172033]'}`}>Estudos & Cursos</span>
        </div>

        {/* View & Add Controls */}
        <div className="flex items-center gap-3">
          <div className={`p-1 rounded-xl flex items-center gap-1 border ${
            isDarkMode ? 'bg-[#1C2333] border-[#263248]' : 'bg-[#E9EFF8] border-[#E5EAF2]'
          }`}>
            <button
              type="button"
              onClick={() => setActiveTab('disciplinas')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 cursor-pointer ${
                activeTab === 'disciplinas'
                  ? isDarkMode
                    ? 'bg-[#222B3D] text-[#7A9CFF] font-semibold border border-[#33415C] shadow-xs'
                    : 'bg-[#FFFFFF] text-[#245BFF] font-semibold shadow-xs border border-[#E5EAF2]'
                  : isDarkMode
                    ? 'text-[#94A3B8] hover:text-[#F1F5F9]'
                    : 'text-[#687386] hover:text-[#172033]'
              }`}
            >
              Disciplinas & Cursos
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('flashcards')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 cursor-pointer ${
                activeTab === 'flashcards'
                  ? isDarkMode
                    ? 'bg-[#222B3D] text-[#7A9CFF] font-semibold border border-[#33415C] shadow-xs'
                    : 'bg-[#FFFFFF] text-[#245BFF] font-semibold shadow-xs border border-[#E5EAF2]'
                  : isDarkMode
                    ? 'text-[#94A3B8] hover:text-[#F1F5F9]'
                    : 'text-[#687386] hover:text-[#172033]'
              }`}
            >
              Flashcards ({flashcards.length})
            </button>
          </div>

          <button
            type="button"
            onClick={() => activeTab === 'disciplinas' ? setShowSubjectModal(true) : setShowCardModal(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#245BFF] hover:bg-[#1A4EE5] active:scale-[0.98] text-white font-semibold text-xs tracking-wide shadow-[0_2px_8px_-1px_rgba(58,98,255,0.35)] transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{activeTab === 'disciplinas' ? 'Nova Disciplina' : 'Novo Card'}</span>
          </button>
        </div>
      </header>

      {/* Hero Header */}
      <div>
        <h1 className={`text-2xl sm:text-3xl font-bold tracking-tight ${
          isDarkMode ? 'text-[#F1F5F9]' : 'text-[#172033]'
        }`}>
          Central de Estudos & Pesquisa
        </h1>
        <p className={`text-sm mt-1 font-normal ${isDarkMode ? 'text-[#94A3B8]' : 'text-[#687386]'}`}>
          Organização acadêmica, módulos de conteúdo e revisão ativa com repetição espaçada.
        </p>
      </div>

      {/* 1. ABA: DISCIPLINAS & CURSOS */}
      {activeTab === 'disciplinas' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {subjects.map(s => {
            const completedMods = s.modules.filter(m => m.completed).length;
            const totalMods = s.modules.length;
            const progress = totalMods > 0 ? Math.round((completedMods / totalMods) * 100) : 0;

            return (
              <div
                key={s.id}
                className={`p-5 rounded-2xl border transition-all duration-200 flex flex-col justify-between space-y-4 ${
                  isDarkMode 
                    ? 'bg-[#1C2333] border-[#263248] hover:border-[#33415C] shadow-xs' 
                    : 'bg-[#FFFFFF] border-[#E5EAF2] hover:border-[#D2DCE8] shadow-[0_2px_8px_rgba(23,32,51,0.04)] hover:shadow-[0_8px_24px_rgba(23,32,51,0.06)]'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className={`text-[10px] font-bold uppercase tracking-wider block mb-0.5 ${
                        isDarkMode ? 'text-[#7A9CFF]' : 'text-[#245BFF]'
                      }`}>
                        {s.type} {s.institution ? `· ${s.institution}` : ''}
                      </span>
                      <h3 className={`text-sm font-bold leading-snug ${
                        isDarkMode ? 'text-[#F1F5F9]' : 'text-[#172033]'
                      }`}>
                        {s.title}
                      </h3>
                    </div>
                    <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-md border capitalize ${
                      isDarkMode 
                        ? 'bg-[#222B3D] text-[#7A9CFF] border-[#33415C]' 
                        : 'bg-[#EEF3FF] text-[#245BFF] border-[#D4E2FF]'
                    }`}>
                      {s.status.replace('_', ' ')}
                    </span>
                  </div>

                  {/* Horas Estudadas */}
                  <div className={`flex items-center justify-between text-xs p-2.5 rounded-xl border ${
                    isDarkMode 
                      ? 'bg-[#222B3D]/60 border-[#263248] text-[#94A3B8]' 
                      : 'bg-[#F8FAFD] border-[#E5EAF2] text-[#687386]'
                  }`}>
                    <span className="flex items-center gap-1.5 font-medium">
                      <Clock className="w-3.5 h-3.5 text-[#245BFF]" />
                      {s.hours_studied}h estudadas {s.target_hours ? `/ meta: ${s.target_hours}h` : ''}
                    </span>
                    <button
                      type="button"
                      onClick={() => onLogStudyHours(s.id, 0.5)}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition cursor-pointer border ${
                        isDarkMode 
                          ? 'bg-[#245BFF]/20 text-[#7A9CFF] border-[#245BFF]/30 hover:bg-[#245BFF]/30' 
                          : 'bg-[#EEF3FF] text-[#245BFF] border-[#D4E2FF] hover:bg-[#D4E2FF]'
                      }`}
                    >
                      +30 min
                    </button>
                  </div>

                  {/* Módulos do Conteúdo */}
                  <div className="space-y-1.5 pt-1">
                    <div className={`flex justify-between text-[11px] font-medium ${
                      isDarkMode ? 'text-[#94A3B8]' : 'text-[#687386]'
                    }`}>
                      <span>Módulos ({completedMods}/{totalMods})</span>
                      <span className="font-mono text-[#245BFF] font-semibold">{progress}%</span>
                    </div>
                    <div className={`w-full h-1.5 rounded-full overflow-hidden ${
                      isDarkMode ? 'bg-[#263248]' : 'bg-[#E9EFF8]'
                    }`}>
                      <div 
                        className="bg-[#245BFF] h-full rounded-full transition-all duration-300" 
                        style={{ width: `${progress}%` }} 
                      />
                    </div>
                    <div className="space-y-1 pt-2">
                      {s.modules.map(mod => (
                        <label 
                          key={mod.id} 
                          className={`flex items-center gap-2 text-xs transition cursor-pointer ${
                            isDarkMode ? 'text-[#94A3B8] hover:text-[#F1F5F9]' : 'text-[#687386] hover:text-[#172033]'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={mod.completed}
                            onChange={() => {
                              const updatedMods = s.modules.map(m => m.id === mod.id ? { ...m, completed: !m.completed } : m);
                              onUpdateSubject(s.id, { modules: updatedMods });
                            }}
                            className="rounded text-[#245BFF] focus:ring-0"
                          />
                          <span className={`truncate font-medium ${mod.completed ? 'line-through text-[#9AA4B2] dark:text-[#64748B]' : ''}`}>
                            {mod.title}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                <div className={`pt-3 border-t flex items-center justify-between text-xs ${
                  isDarkMode ? 'border-[#263248]' : 'border-[#E5EAF2]'
                }`}>
                  <button
                    type="button"
                    onClick={() => { setSelectedSubjectId(s.id); setActiveTab('flashcards'); }}
                    className="text-[#245BFF] dark:text-[#7A9CFF] hover:underline text-[11px] font-semibold cursor-pointer"
                  >
                    Ver Flashcards ({flashcards.filter(f => f.subject_id === s.id).length})
                  </button>
                  <button
                    type="button"
                    onClick={() => onDeleteSubject(s.id)}
                    className="p-1.5 rounded-lg text-[#94A3B8] hover:text-rose-500 transition cursor-pointer"
                    title="Excluir"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 2. ABA: FLASHCARDS COM REPETIÇÃO ESPAÇADA */}
      {activeTab === 'flashcards' && (
        <div className="max-w-xl mx-auto space-y-4 w-full">
          {/* Seletor de Disciplina */}
          <div className="flex items-center justify-between text-xs">
            <span className={`font-semibold ${isDarkMode ? 'text-[#94A3B8]' : 'text-[#687386]'}`}>Filtrar por Disciplina:</span>
            <select
              value={selectedSubjectId}
              onChange={(e) => { setSelectedSubjectId(e.target.value); setActiveCardIndex(0); setIsFlipped(false); }}
              className={`px-3 py-1.5 rounded-xl border text-xs font-medium cursor-pointer ${
                isDarkMode 
                  ? 'bg-[#1C2333] border-[#263248] text-[#F1F5F9]' 
                  : 'bg-[#FFFFFF] border-[#E5EAF2] text-[#172033] shadow-xs'
              }`}
            >
              <option value="">Todas as Disciplinas</option>
              {subjects.map(s => (
                <option key={s.id} value={s.id}>{s.title}</option>
              ))}
            </select>
          </div>

          {currentCards.length === 0 ? (
            <div className={`text-center py-16 px-4 border border-dashed rounded-2xl ${
              isDarkMode ? 'border-[#263248] bg-[#1C2333]/50' : 'border-[#E5EAF2] bg-[#FFFFFF]'
            }`}>
              <Brain className={`w-10 h-10 mx-auto mb-2 ${isDarkMode ? 'text-[#64748B]' : 'text-[#9AA4B2]'}`} />
              <p className={`text-xs font-semibold ${isDarkMode ? 'text-[#F1F5F9]' : 'text-[#172033]'}`}>
                Nenhum flashcard para esta matéria.
              </p>
              <button
                type="button"
                onClick={() => setShowCardModal(true)}
                className="mt-3 px-4 py-2 rounded-xl bg-[#245BFF] hover:bg-[#1A4EE5] text-white text-xs font-semibold shadow-xs transition"
              >
                + Criar Primeiro Card
              </button>
            </div>
          ) : activeCard ? (
            <div className="space-y-4">
              <div className={`flex items-center justify-between text-xs ${isDarkMode ? 'text-[#94A3B8]' : 'text-[#687386]'}`}>
                <span className="font-medium">Card {activeCardIndex + 1} de {currentCards.length}</span>
                <span className={`font-mono ${isDarkMode ? 'text-white font-semibold' : 'text-[#245BFF]'}`}>Intervalo: {activeCard.interval_days} dias</span>
              </div>

              {/* O Cartão Interativo com Virada */}
              <div
                onClick={() => setIsFlipped(!isFlipped)}
                className={`min-h-[220px] p-7 rounded-2xl border flex flex-col justify-between cursor-pointer transition-all duration-200 text-center select-none ${
                  isDarkMode 
                    ? 'bg-[#1C2333] border-[#263248] hover:border-[#245BFF] shadow-md' 
                    : 'bg-[#FFFFFF] border-[#E5EAF2] hover:border-[#245BFF] shadow-[0_4px_20px_rgba(23,32,51,0.06)]'
                }`}
              >
                <span className={`text-[10px] font-mono font-bold uppercase tracking-wider ${
                  isDarkMode ? 'text-white' : 'text-[#245BFF]'
                }`}>
                  {isFlipped ? 'Resposta (Verso)' : 'Pergunta (Frente) — Clique para virar'}
                </span>

                <div className="my-auto py-5">
                  <p className={`text-base sm:text-lg font-semibold leading-relaxed ${
                    isDarkMode ? 'text-[#F1F5F9]' : 'text-[#172033]'
                  }`}>
                    {isFlipped ? activeCard.back : activeCard.front}
                  </p>
                </div>

                <div className={`text-[11px] font-medium flex items-center justify-center gap-1.5 ${
                  isDarkMode ? 'text-[#64748B]' : 'text-[#9AA4B2]'
                }`}>
                  <RotateCw className={`w-3.5 h-3.5 ${isDarkMode ? 'text-white' : 'text-[#245BFF]'}`} />
                  <span>{isFlipped ? 'Clique para ver a pergunta' : 'Clique para revelar a resposta'}</span>
                </div>
              </div>

              {/* Botões de Classificação de Dificuldade */}
              {isFlipped && (
                <div className="grid grid-cols-3 gap-2.5 animate-in fade-in duration-150">
                  <button
                    type="button"
                    onClick={() => handleAnswerCard('dificil')}
                    className="p-3 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-xs font-semibold hover:bg-rose-100 transition cursor-pointer"
                  >
                    Difícil (+1 dia)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAnswerCard('bom')}
                    className="p-3 rounded-xl border border-blue-200 dark:border-blue-900/60 bg-[#EEF3FF] dark:bg-[#245BFF]/30 text-[#245BFF] dark:text-white text-xs font-semibold hover:bg-[#D4E2FF] transition cursor-pointer"
                  >
                    Bom (+2 dias)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAnswerCard('facil')}
                    className="p-3 rounded-xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs font-semibold hover:bg-emerald-100 transition cursor-pointer"
                  >
                    Fácil (+4 dias)
                  </button>
                </div>
              )}
            </div>
          ) : null}
        </div>
      )}

      {/* Modal Criar Disciplina */}
      {showSubjectModal && (
        <div 
          role="dialog" 
          aria-modal="true" 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150"
        >
          <div className={`w-full max-w-md rounded-2xl border p-6 shadow-[0_20px_48px_rgba(23,32,51,0.16)] text-left space-y-4 ${
            isDarkMode ? 'bg-[#1C2333] border-[#263248]' : 'bg-[#FFFFFF] border-[#E5EAF2]'
          }`}>
            <div className="flex items-center justify-between border-b border-[#E5EAF2] dark:border-[#263248] pb-3">
              <h3 className={`text-sm font-bold ${isDarkMode ? 'text-[#F1F5F9]' : 'text-[#172033]'}`}>
                Nova Disciplina ou Curso
              </h3>
              <button
                type="button"
                onClick={() => setShowSubjectModal(false)}
                className={`p-1 rounded-lg ${isDarkMode ? 'text-[#94A3B8] hover:text-[#F1F5F9]' : 'text-[#687386] hover:text-[#172033]'}`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSubject} className="space-y-3.5">
              <div>
                <label className={`text-xs font-semibold mb-1 block ${isDarkMode ? 'text-[#94A3B8]' : 'text-[#687386]'}`}>
                  Título
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  placeholder="Ex: Estatística Aplicada"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className={`w-full px-3 py-2 rounded-xl border text-xs sm:text-sm focus:outline-none focus:border-[#245BFF] focus:ring-2 focus:ring-[#245BFF]/20 ${
                    isDarkMode 
                      ? 'bg-[#182030] border-[#263248] text-[#F1F5F9] placeholder-[#64748B]' 
                      : 'bg-[#FFFFFF] border-[#E5EAF2] text-[#172033] placeholder-[#9AA4B2]'
                  }`}
                />
              </div>

              <div>
                <label className={`text-xs font-semibold mb-1 block ${isDarkMode ? 'text-[#94A3B8]' : 'text-[#687386]'}`}>
                  Tipo
                </label>
                <select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value)}
                  className={`w-full px-3 py-2 rounded-xl border text-xs ${
                    isDarkMode 
                      ? 'bg-[#182030] border-[#263248] text-[#F1F5F9]' 
                      : 'bg-[#FFFFFF] border-[#E5EAF2] text-[#172033]'
                  }`}
                >
                  <option value="disciplina">Disciplina Faculdade/Escola</option>
                  <option value="curso">Curso Online</option>
                  <option value="livro">Leitura de Livro</option>
                  <option value="certificacao">Certificação</option>
                </select>
              </div>

              <div>
                <label className={`text-xs font-semibold mb-1 block ${isDarkMode ? 'text-[#94A3B8]' : 'text-[#687386]'}`}>
                  Meta de Horas de Estudo
                </label>
                <input
                  type="number"
                  min="5"
                  step="5"
                  value={newTargetHours}
                  onChange={(e) => setNewTargetHours(parseInt(e.target.value) || 20)}
                  className={`w-full px-3 py-2 rounded-xl border text-xs ${
                    isDarkMode 
                      ? 'bg-[#182030] border-[#263248] text-[#F1F5F9]' 
                      : 'bg-[#FFFFFF] border-[#E5EAF2] text-[#172033]'
                  }`}
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#E5EAF2] dark:border-[#263248]">
                <button
                  type="button"
                  onClick={() => setShowSubjectModal(false)}
                  className={`px-4 py-2 rounded-xl text-xs font-medium ${
                    isDarkMode ? 'text-[#94A3B8] hover:bg-[#222B3D]' : 'text-[#687386] hover:bg-[#F5F7FB]'
                  }`}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#245BFF] hover:bg-[#1A4EE5] text-white shadow-xs"
                >
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Criar Flashcard */}
      {showCardModal && (
        <div 
          role="dialog" 
          aria-modal="true" 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150"
        >
          <div className={`w-full max-w-md rounded-2xl border p-6 shadow-[0_20px_48px_rgba(23,32,51,0.16)] text-left space-y-4 ${
            isDarkMode ? 'bg-[#1C2333] border-[#263248]' : 'bg-[#FFFFFF] border-[#E5EAF2]'
          }`}>
            <div className="flex items-center justify-between border-b border-[#E5EAF2] dark:border-[#263248] pb-3">
              <h3 className={`text-sm font-bold ${isDarkMode ? 'text-[#F1F5F9]' : 'text-[#172033]'}`}>
                Novo Flashcard
              </h3>
              <button
                type="button"
                onClick={() => setShowCardModal(false)}
                className={`p-1 rounded-lg ${isDarkMode ? 'text-[#94A3B8] hover:text-[#F1F5F9]' : 'text-[#687386] hover:text-[#172033]'}`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateCard} className="space-y-3.5">
              <div>
                <label className={`text-xs font-semibold mb-1 block ${isDarkMode ? 'text-[#94A3B8]' : 'text-[#687386]'}`}>
                  Frente (Pergunta ou Conceito)
                </label>
                <textarea
                  required
                  rows={2}
                  autoFocus
                  placeholder="Ex: O que é memoization?"
                  value={cardFront}
                  onChange={(e) => setCardFront(e.target.value)}
                  className={`w-full px-3 py-2 rounded-xl border text-xs resize-none focus:outline-none focus:border-[#245BFF] ${
                    isDarkMode 
                      ? 'bg-[#182030] border-[#263248] text-[#F1F5F9] placeholder-[#64748B]' 
                      : 'bg-[#FFFFFF] border-[#E5EAF2] text-[#172033] placeholder-[#9AA4B2]'
                  }`}
                />
              </div>

              <div>
                <label className={`text-xs font-semibold mb-1 block ${isDarkMode ? 'text-[#94A3B8]' : 'text-[#687386]'}`}>
                  Verso (Resposta Clara e Sucinta)
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Ex: Técnica de otimização que armazena os resultados de chamadas de funções caras..."
                  value={cardBack}
                  onChange={(e) => setCardBack(e.target.value)}
                  className={`w-full px-3 py-2 rounded-xl border text-xs resize-none focus:outline-none focus:border-[#245BFF] ${
                    isDarkMode 
                      ? 'bg-[#182030] border-[#263248] text-[#F1F5F9] placeholder-[#64748B]' 
                      : 'bg-[#FFFFFF] border-[#E5EAF2] text-[#172033] placeholder-[#9AA4B2]'
                  }`}
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#E5EAF2] dark:border-[#263248]">
                <button
                  type="button"
                  onClick={() => setShowCardModal(false)}
                  className={`px-4 py-2 rounded-xl text-xs font-medium ${
                    isDarkMode ? 'text-[#94A3B8] hover:bg-[#222B3D]' : 'text-[#687386] hover:bg-[#F5F7FB]'
                  }`}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#245BFF] hover:bg-[#1A4EE5] text-white shadow-xs"
                >
                  Adicionar Card
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
