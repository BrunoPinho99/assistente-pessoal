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
      <header className="flex items-center justify-between text-[13px] pb-3 border-b border-[#262626]">
        <div className="flex items-center gap-1.5 font-medium text-[#999999]">
          <span className="hover:text-[#0099ff] transition-colors cursor-pointer">Meu espaço</span>
          <span className="text-[#262626]">/</span>
          <span className="font-medium text-[#ffffff]">Estudos & Cursos</span>
        </div>

        {/* View & Add Controls */}
        <div className="flex items-center gap-3">
          <div className="p-1 rounded-full flex items-center gap-1 border bg-[#141414] border-[#262626]">
            <button
              type="button"
              onClick={() => setActiveTab('disciplinas')}
              className={`px-3.5 py-1.5 rounded-full text-[13px] font-medium tracking-[-0.13px] transition-all duration-150 cursor-pointer ${
                activeTab === 'disciplinas'
                  ? 'bg-[#1c1c1c] text-[#ffffff]'
                  : 'text-[#999999] hover:text-[#ffffff]'
              }`}
            >
              Disciplinas & Cursos
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('flashcards')}
              className={`px-3.5 py-1.5 rounded-full text-[13px] font-medium tracking-[-0.13px] transition-all duration-150 cursor-pointer ${
                activeTab === 'flashcards'
                  ? 'bg-[#1c1c1c] text-[#ffffff]'
                  : 'text-[#999999] hover:text-[#ffffff]'
              }`}
            >
              Flashcards ({flashcards.length})
            </button>
          </div>

          <button
            type="button"
            onClick={() => activeTab === 'disciplinas' ? setShowSubjectModal(true) : setShowCardModal(true)}
            className="inline-flex items-center gap-1.5 px-[15px] py-[10px] rounded-full bg-[#ffffff] hover:bg-[#f0f0f0] active:scale-[0.98] text-[#000000] font-medium text-[14px] tracking-[-0.14px] transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-[#000000]" />
            <span>{activeTab === 'disciplinas' ? 'Nova Disciplina' : 'Novo Card'}</span>
          </button>
        </div>
      </header>

      {/* Hero Header */}
      <div>
        <h1 className="text-[32px] sm:text-[40px] font-medium tracking-[-1.8px] text-[#ffffff] leading-[1.05]">
          Central de Estudos & Pesquisa
        </h1>
        <p className="text-[15px] mt-1 font-normal text-[#999999] tracking-[-0.15px]">
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
                className="p-5 rounded-[20px] border border-[#262626] bg-[#141414] hover:border-[#333333] transition-all duration-200 flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-mono uppercase tracking-[0.08em] block mb-0.5 text-[#0099ff]">
                        {s.type} {s.institution ? `· ${s.institution}` : ''}
                      </span>
                      <h3 className="text-[16px] font-medium tracking-[-0.2px] text-[#ffffff] leading-snug">
                        {s.title}
                      </h3>
                    </div>
                    <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full border capitalize bg-[#1c1c1c] text-[#ffffff] border-[#262626]">
                      {s.status.replace('_', ' ')}
                    </span>
                  </div>

                  {/* Horas Estudadas */}
                  <div className="flex items-center justify-between text-[13px] p-3 rounded-[12px] border bg-[#1c1c1c] border-[#262626] text-[#999999]">
                    <span className="flex items-center gap-1.5 font-medium text-[#ffffff]">
                      <Clock className="w-3.5 h-3.5 text-[#0099ff]" />
                      {s.hours_studied}h estudadas {s.target_hours ? `/ meta: ${s.target_hours}h` : ''}
                    </span>
                    <button
                      type="button"
                      onClick={() => onLogStudyHours(s.id, 0.5)}
                      className="px-2.5 py-1 rounded-full text-[11px] font-medium transition cursor-pointer border bg-[#141414] text-[#ffffff] border-[#262626] hover:bg-[#262626]"
                    >
                      +30 min
                    </button>
                  </div>

                  {/* Módulos do Conteúdo */}
                  <div className="space-y-1.5 pt-1">
                    <div className="flex justify-between text-[12px] font-medium text-[#999999]">
                      <span>Módulos ({completedMods}/{totalMods})</span>
                      <span className="font-mono text-[#ffffff] font-medium">{progress}%</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full overflow-hidden bg-[#262626]">
                      <div 
                        className="bg-[#ffffff] h-full rounded-full transition-all duration-300" 
                        style={{ width: `${progress}%` }} 
                      />
                    </div>
                    <div className="space-y-1.5 pt-2">
                      {s.modules.map(mod => (
                        <label 
                          key={mod.id} 
                          className="flex items-center gap-2 text-[13px] transition cursor-pointer text-[#999999] hover:text-[#ffffff]"
                        >
                          <input
                            type="checkbox"
                            checked={mod.completed}
                            onChange={() => {
                              const updatedMods = s.modules.map(m => m.id === mod.id ? { ...m, completed: !m.completed } : m);
                              onUpdateSubject(s.id, { modules: updatedMods });
                            }}
                            className="w-4 h-4 rounded accent-[#0099ff] cursor-pointer"
                          />
                          <span className={`truncate font-normal ${mod.completed ? 'line-through text-[#666666]' : 'text-[#ffffff]'}`}>
                            {mod.title}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-[#262626] flex items-center justify-between text-[13px]">
                  <button
                    type="button"
                    onClick={() => { setSelectedSubjectId(s.id); setActiveTab('flashcards'); }}
                    className="text-[#0099ff] hover:underline text-[12px] font-medium cursor-pointer"
                  >
                    Ver Flashcards ({flashcards.filter(f => f.subject_id === s.id).length})
                  </button>
                  <button
                    type="button"
                    onClick={() => onDeleteSubject(s.id)}
                    className="p-1.5 rounded-full text-[#999999] hover:text-rose-400 hover:bg-[#1c1c1c] transition cursor-pointer"
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
          <div className="flex items-center justify-between text-[13px]">
            <span className="font-medium text-[#999999]">Filtrar por Disciplina:</span>
            <select
              value={selectedSubjectId}
              onChange={(e) => { setSelectedSubjectId(e.target.value); setActiveCardIndex(0); setIsFlipped(false); }}
              className="px-3.5 py-1.5 rounded-full border text-[13px] font-medium cursor-pointer bg-[#141414] border-[#262626] text-[#ffffff] focus:outline-none focus:border-[#0099ff]"
            >
              <option value="">Todas as Disciplinas</option>
              {subjects.map(s => (
                <option key={s.id} value={s.id}>{s.title}</option>
              ))}
            </select>
          </div>

          {currentCards.length === 0 ? (
            <div className="text-center py-16 px-4 border border-dashed rounded-[20px] border-[#262626] bg-[#141414]">
              <Brain className="w-10 h-10 mx-auto mb-2 text-[#999999]" />
              <p className="text-[14px] font-medium text-[#ffffff]">
                Nenhum flashcard para esta matéria.
              </p>
              <button
                type="button"
                onClick={() => setShowCardModal(true)}
                className="mt-3 px-5 py-2 rounded-full bg-[#ffffff] hover:bg-[#f0f0f0] text-[#000000] text-[14px] font-medium transition cursor-pointer"
              >
                + Criar Primeiro Card
              </button>
            </div>
          ) : activeCard ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-[13px] text-[#999999]">
                <span className="font-medium">Card {activeCardIndex + 1} de {currentCards.length}</span>
                <span className="font-mono text-[#ffffff] font-medium">Intervalo: {activeCard.interval_days} dias</span>
              </div>

              {/* O Cartão Interativo com Virada */}
              <div
                onClick={() => setIsFlipped(!isFlipped)}
                className="min-h-[220px] p-8 rounded-[20px] border border-[#262626] bg-[#141414] hover:border-[#0099ff] cursor-pointer transition-all duration-200 flex flex-col justify-between text-center select-none"
              >
                <span className="text-[11px] font-mono uppercase tracking-[0.08em] text-[#0099ff]">
                  {isFlipped ? 'Resposta (Verso)' : 'Pergunta (Frente) — Clique para virar'}
                </span>

                <div className="my-auto py-5">
                  <p className="text-[18px] sm:text-[20px] font-medium leading-relaxed text-[#ffffff] tracking-[-0.2px]">
                    {isFlipped ? activeCard.back : activeCard.front}
                  </p>
                </div>

                <div className="text-[12px] font-medium flex items-center justify-center gap-1.5 text-[#999999]">
                  <RotateCw className="w-3.5 h-3.5 text-[#0099ff]" />
                  <span>{isFlipped ? 'Clique para ver a pergunta' : 'Clique para revelar a resposta'}</span>
                </div>
              </div>

              {/* Botões de Classificação de Dificuldade */}
              {isFlipped && (
                <div className="grid grid-cols-3 gap-2.5 animate-in fade-in duration-150">
                  <button
                    type="button"
                    onClick={() => handleAnswerCard('dificil')}
                    className="p-3 rounded-full border border-[#ff5577]/40 bg-[#ff5577]/15 text-[#ff5577] text-[13px] font-medium hover:bg-[#ff5577]/25 transition cursor-pointer"
                  >
                    Difícil (+1 dia)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAnswerCard('bom')}
                    className="p-3 rounded-full border border-[#0099ff]/40 bg-[#0099ff]/15 text-[#0099ff] text-[13px] font-medium hover:bg-[#0099ff]/25 transition cursor-pointer"
                  >
                    Bom (+2 dias)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAnswerCard('facil')}
                    className="p-3 rounded-full border border-[#22c55e]/40 bg-[#22c55e]/15 text-[#22c55e] text-[13px] font-medium hover:bg-[#22c55e]/25 transition cursor-pointer"
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
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150"
        >
          <div className="w-full max-w-md rounded-[20px] border border-[#262626] bg-[#141414] p-6 text-left space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#262626] pb-3">
              <h3 className="text-[16px] font-medium tracking-[-0.2px] text-[#ffffff]">
                Nova Disciplina ou Curso
              </h3>
              <button
                type="button"
                onClick={() => setShowSubjectModal(false)}
                className="p-1.5 rounded-full text-[#999999] hover:text-[#ffffff] hover:bg-[#1c1c1c] transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSubject} className="space-y-4">
              <div>
                <label className="text-[13px] font-medium mb-1.5 block text-[#ffffff]">
                  Título
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  placeholder="Ex: Estatística Aplicada"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-[10px] border text-[14px] bg-[#090909] border-[#262626] text-[#ffffff] placeholder-[#999999] focus:outline-none focus:border-[#0099ff]"
                />
              </div>

              <div>
                <label className="text-[13px] font-medium mb-1.5 block text-[#ffffff]">
                  Tipo
                </label>
                <select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-[10px] border text-[14px] bg-[#090909] border-[#262626] text-[#ffffff] focus:outline-none focus:border-[#0099ff]"
                >
                  <option value="disciplina">Disciplina Faculdade/Escola</option>
                  <option value="curso">Curso Online</option>
                  <option value="livro">Leitura de Livro</option>
                  <option value="certificacao">Certificação</option>
                </select>
              </div>

              <div>
                <label className="text-[13px] font-medium mb-1.5 block text-[#ffffff]">
                  Meta de Horas de Estudo
                </label>
                <input
                  type="number"
                  min="5"
                  step="5"
                  value={newTargetHours}
                  onChange={(e) => setNewTargetHours(parseInt(e.target.value) || 20)}
                  className="w-full px-3.5 py-2.5 rounded-[10px] border text-[14px] bg-[#090909] border-[#262626] text-[#ffffff] focus:outline-none focus:border-[#0099ff]"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-[#262626]">
                <button
                  type="button"
                  onClick={() => setShowSubjectModal(false)}
                  className="px-4 py-2 rounded-full font-medium cursor-pointer border bg-[#1c1c1c] border-[#262626] text-[#ffffff] hover:bg-[#262626] text-[13px]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-full bg-[#ffffff] hover:bg-[#f0f0f0] text-[#000000] font-medium cursor-pointer text-[14px]"
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
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150"
        >
          <div className="w-full max-w-md rounded-[20px] border border-[#262626] bg-[#141414] p-6 text-left space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#262626] pb-3">
              <h3 className="text-[16px] font-medium tracking-[-0.2px] text-[#ffffff]">
                Novo Flashcard
              </h3>
              <button
                type="button"
                onClick={() => setShowCardModal(false)}
                className="p-1.5 rounded-full text-[#999999] hover:text-[#ffffff] hover:bg-[#1c1c1c] transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateCard} className="space-y-4">
              <div>
                <label className="text-[13px] font-medium mb-1.5 block text-[#ffffff]">
                  Frente (Pergunta ou Conceito)
                </label>
                <textarea
                  required
                  rows={2}
                  autoFocus
                  placeholder="Ex: O que é memoization?"
                  value={cardFront}
                  onChange={(e) => setCardFront(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-[10px] border text-[14px] resize-none bg-[#090909] border-[#262626] text-[#ffffff] placeholder-[#999999] focus:outline-none focus:border-[#0099ff]"
                />
              </div>

              <div>
                <label className="text-[13px] font-medium mb-1.5 block text-[#ffffff]">
                  Verso (Resposta Clara e Sucinta)
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Ex: Técnica de otimização que armazena os resultados de chamadas de funções caras..."
                  value={cardBack}
                  onChange={(e) => setCardBack(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-[10px] border text-[14px] resize-none bg-[#090909] border-[#262626] text-[#ffffff] placeholder-[#999999] focus:outline-none focus:border-[#0099ff]"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-[#262626]">
                <button
                  type="button"
                  onClick={() => setShowCardModal(false)}
                  className="px-4 py-2 rounded-full font-medium cursor-pointer border bg-[#1c1c1c] border-[#262626] text-[#ffffff] hover:bg-[#262626] text-[13px]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-full bg-[#ffffff] hover:bg-[#f0f0f0] text-[#000000] font-medium cursor-pointer text-[14px]"
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
