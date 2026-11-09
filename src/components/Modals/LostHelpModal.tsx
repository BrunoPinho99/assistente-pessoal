import React, { useEffect } from 'react';
import { X, Compass, Play } from 'lucide-react';
import { Task, Project, StudySubject, Habit } from '../../types';
import { AIAssistantService } from '../../lib/aiAssistant';

interface LostHelpModalProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: Task[];
  projects: Project[];
  subjects: StudySubject[];
  habits: Habit[];
  onStartFocus: (task: Task) => void;
  isDarkMode?: boolean;
}

export const LostHelpModal: React.FC<LostHelpModalProps> = ({
  isOpen,
  onClose,
  tasks,
  projects,
  subjects,
  habits,
  onStartFocus,
  isDarkMode = false
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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-xs animate-in fade-in duration-150"
    >
      <div className="bg-white dark:bg-[#1C2333] border border-[#E5EAF2] dark:border-[#263248] rounded-2xl p-6 w-full max-w-lg shadow-2xl text-left space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#E5EAF2] dark:border-[#263248] pb-3.5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#EEF3FF] dark:bg-[#245BFF]/20 border border-[#245BFF]/20 text-[#245BFF] flex items-center justify-center shadow-xs">
              <Compass className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-semibold text-[#172033] dark:text-[#F1F5F9]">
                Resgate Imediato TDAH
              </h3>
              <p className="text-[11px] text-[#687386] dark:text-[#94A3B8]">
                Redução de paralisia e fatiamento executivo
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-[#687386] dark:text-[#94A3B8] hover:text-[#172033] dark:hover:text-[#F1F5F9] p-1.5 rounded-lg hover:bg-[#E9EFF8] dark:hover:bg-[#222B3D] transition-colors cursor-pointer"
            aria-label="Fechar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Mensagem Reafirmadora */}
        <div className="p-3.5 rounded-xl bg-[#EEF3FF]/80 dark:bg-[#245BFF]/10 border border-[#245BFF]/20 text-xs text-[#172033] dark:text-[#E0E7FF] leading-relaxed">
          <p className="font-semibold text-[#245BFF] dark:text-[#818CF8] mb-1">Não se culpe. Paralisia de escolha é um sintoma neurológico real.</p>
          <p className="text-[#687386] dark:text-[#94A3B8] text-[11px]">
            {guidance.rationale}
          </p>
        </div>

        {/* A Única Prioridade Escolhida */}
        {guidance.chosenTask && (
          <div className="p-4 rounded-xl border border-[#E5EAF2] dark:border-[#263248] bg-[#F5F7FB] dark:bg-[#151B28] space-y-2.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#245BFF] block">
              Sua Única Ação para Agora
            </span>
            <h4 className="text-sm sm:text-base font-bold text-[#172033] dark:text-[#F1F5F9]">
              {guidance.chosenTask.title}
            </h4>
            <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-xs text-emerald-800 dark:text-emerald-300 font-medium">
              👉 <strong>Primeiro passo (menos de 5 min):</strong> {guidance.firstStep}
            </div>
          </div>
        )}

        {/* Sub-passos sequenciais */}
        <div className="space-y-1.5">
          <span className="text-[11px] font-semibold text-[#172033] dark:text-[#F1F5F9] block">
            Roteiro sem sofrimento:
          </span>
          <div className="space-y-1 text-xs text-[#687386] dark:text-[#94A3B8]">
            {guidance.substeps.map((st, idx) => (
              <div key={idx} className="flex items-start gap-2.5">
                <span className="w-4 h-4 rounded-full bg-[#E9EFF8] dark:bg-[#222B3D] text-[10px] font-bold text-[#245BFF] flex items-center justify-center flex-shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <span>{st}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E5EAF2] dark:border-[#263248]">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-2 rounded-xl text-xs font-medium text-[#687386] dark:text-[#94A3B8] hover:bg-[#E9EFF8] dark:hover:bg-[#222B3D] transition-colors cursor-pointer"
          >
            Depois eu vejo
          </button>
          <button
            type="button"
            onClick={handleExecute}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#245BFF] hover:bg-[#1A4EE5] text-white shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Fazer só 5 minutos agora</span>
          </button>
        </div>
      </div>
    </div>
  );
};
