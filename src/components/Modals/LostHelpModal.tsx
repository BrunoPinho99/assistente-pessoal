import React, { useEffect } from 'react';
import { X, Play, Compass } from 'lucide-react';
import { Task, Project, StudySubject, Habit } from '../../types';
import { AIAssistantService } from '../../lib/aiAssistant';

interface LostHelpModalProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: Task[];
  projects: Project[];
  subjects: StudySubject[];
  habits: Habit[];
  isDarkMode?: boolean;
  onStartFocus: (task: Task) => void;
}

export const LostHelpModal: React.FC<LostHelpModalProps> = ({
  isOpen,
  onClose,
  tasks,
  projects,
  subjects,
  habits,
  onStartFocus
}) => {
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

  const guidance = AIAssistantService.handleEstouPerdido({
    tasks,
    projects,
    subjects,
    habits
  });

  const handleExecute = () => {
    if (guidance.chosenTask) {
      onStartFocus(guidance.chosenTask);
    }
    onClose();
  };

  return (
    <div 
      role="dialog" 
      aria-modal="true" 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-150 font-sans"
    >
      <div className="w-full max-w-lg rounded-[20px] border border-[#262626] bg-[#141414] p-6 shadow-2xl text-left space-y-4 text-white">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#262626] pb-3.5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#1c1c1c] border border-[#262626] text-white flex items-center justify-center">
              <Compass className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-medium tracking-tight text-white">
                Resgate Imediato TDAH
              </h3>
              <p className="text-[11px] text-[#999999]">
                Redução de paralisia e fatiamento executivo
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-[#999999] hover:text-white p-1.5 rounded-full hover:bg-[#1c1c1c] transition-colors cursor-pointer"
            aria-label="Fechar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Mensagem Reafirmadora */}
        <div className="p-3.5 rounded-xl bg-[#1c1c1c] border border-[#262626] text-xs text-[#999999] leading-relaxed">
          <p className="font-medium text-white mb-1">Não se culpe. Paralisia de escolha é um sintoma neurológico real.</p>
          <p className="text-[11px]">
            {guidance.rationale}
          </p>
        </div>

        {/* A Única Prioridade Escolhida */}
        {guidance.chosenTask && (
          <div className="p-4 rounded-xl border border-[#262626] bg-[#1c1c1c] space-y-2.5">
            <span className="text-[10px] font-mono text-[#0099ff] uppercase tracking-wider block">
              Sua Única Ação para Agora
            </span>
            <h4 className="text-sm sm:text-base font-medium text-white">
              {guidance.chosenTask.title}
            </h4>
            <div className="p-2.5 rounded-lg bg-[#141414] border border-[#262626] text-xs text-white font-normal">
              👉 <strong className="font-medium">Primeiro passo (menos de 5 min):</strong> {guidance.firstStep}
            </div>
          </div>
        )}

        {/* Sub-passos sequenciais */}
        <div className="space-y-1.5">
          <span className="text-[11px] font-medium text-white block">
            Roteiro sem sofrimento:
          </span>
          <div className="space-y-1 text-xs text-[#999999]">
            {guidance.substeps.map((st: string, idx: number) => (
              <div key={idx} className="flex items-start gap-2.5">
                <span className="w-4 h-4 rounded-full bg-white text-black text-[10px] font-semibold flex items-center justify-center flex-shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <span>{st}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Actions (Framer Pills) */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#262626]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-full text-xs font-medium text-[#999999] hover:text-white bg-[#1c1c1c] border border-[#262626] transition-colors cursor-pointer"
          >
            Depois eu vejo
          </button>
          <button
            type="button"
            onClick={handleExecute}
            className="px-5 py-2 rounded-full text-xs font-semibold bg-white hover:bg-neutral-200 text-black shadow-sm transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <Play className="w-3.5 h-3.5 fill-current text-black" />
            <span>Fazer só 5 minutos agora</span>
          </button>
        </div>
      </div>
    </div>
  );
};
