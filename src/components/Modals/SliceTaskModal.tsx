import React, { useState, useEffect } from 'react';
import { 
  Scissors, 
  Check, 
  X, 
  CheckCircle2,
  Layers
} from 'lucide-react';
import { Task } from '../../types';
import { sliceTaskWithAI } from '../../lib/focusProtection';
import confetti from 'canvas-confetti';

interface SliceTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task | null;
  onApplySlice: (
    taskId: string, 
    microTasks: Array<{ title: string; estimated_minutes: number; description: string }>,
    mode: 'subtasks' | 'replace'
  ) => void;
}

export const SliceTaskModal: React.FC<SliceTaskModalProps> = ({
  isOpen,
  onClose,
  task,
  onApplySlice
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [microTasks, setMicroTasks] = useState<Array<{ title: string; estimated_minutes: number; description: string }>>([]);
  const [explanation, setExplanation] = useState('');
  const [mode, setMode] = useState<'subtasks' | 'replace'>('subtasks');

  useEffect(() => {
    if (isOpen && task) {
      setIsLoading(true);
      sliceTaskWithAI(task).then(res => {
        setMicroTasks(res.microTasks);
        setExplanation(res.explanation);
        setIsLoading(false);
      });
    }
  }, [isOpen, task]);

  if (!isOpen || !task) return null;

  const handleConfirm = () => {
    onApplySlice(task.id, microTasks, mode);
    confetti({
      particleCount: 40,
      spread: 50,
      colors: ['#ffffff', '#0099ff', '#d44df0']
    });
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-150 font-sans"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-xl rounded-[20px] bg-[#141414] border border-[#262626] p-6 sm:p-7 shadow-2xl text-left relative overflow-hidden text-white"
        onClick={(e) => e.stopPropagation()}
        data-purpose="slice-task-modal"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-[#262626] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#1c1c1c] border border-[#262626] flex items-center justify-center text-white shrink-0">
              <Scissors className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-base font-medium text-white tracking-tight">
                Fatiar Ação em Micro-passos
              </h3>
              <p className="text-xs text-[#999999] mt-0.5">
                Reduza a resistência de início transformando uma tarefa grande em passos de 15 minutos.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-[#999999] hover:text-white hover:bg-[#1c1c1c] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tarefa Original */}
        <div className="my-4 p-3.5 rounded-xl bg-[#1c1c1c] border border-[#262626] space-y-1">
          <span className="text-[10px] font-mono text-[#999999] uppercase tracking-wider block">
            Tarefa Original
          </span>
          <h4 className="text-xs sm:text-sm font-medium text-white">
            {task.title}
          </h4>
        </div>

        {/* Micro-passos Gerados */}
        <div className="space-y-2.5">
          <span className="text-xs font-normal text-[#999999] block tracking-tight">
            Micro-passos sugeridos:
          </span>

          {isLoading ? (
            <div className="p-8 text-center text-xs text-[#999999] space-y-2 border border-[#262626] rounded-xl bg-[#1c1c1c]">
              <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin mx-auto" />
              <p>Fatiando a tarefa para destravar o início...</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-52 overflow-y-auto">
              {microTasks.map((mt, idx) => (
                <div 
                  key={idx}
                  className="p-3 rounded-xl border border-[#262626] bg-[#1c1c1c] flex items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-0.5 min-w-0">
                    <span className="font-medium text-white truncate block">
                      {idx + 1}. {mt.title}
                    </span>
                    <span className="text-[11px] text-[#999999] line-clamp-1">
                      {mt.description}
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-white px-2 py-0.5 rounded-full bg-[#141414] border border-[#262626] shrink-0">
                    {mt.estimated_minutes}m
                  </span>
                </div>
              ))}
            </div>
          )}

          {explanation && (
            <p className="text-[11px] text-[#999999] italic pt-1">
              {explanation}
            </p>
          )}
        </div>

        {/* Modo de Aplicação */}
        <div className="mt-4 pt-3 border-t border-[#262626] flex items-center gap-2">
          <button
            type="button"
            onClick={() => setMode('subtasks')}
            className={`px-3 py-1.5 rounded-full text-xs transition cursor-pointer flex items-center gap-1.5 ${
              mode === 'subtasks'
                ? 'bg-white text-black font-semibold shadow-xs'
                : 'bg-[#1c1c1c] text-[#999999] border border-[#262626] hover:text-white'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Sub-etapas</span>
          </button>

          <button
            type="button"
            onClick={() => setMode('replace')}
            className={`px-3 py-1.5 rounded-full text-xs transition cursor-pointer flex items-center gap-1.5 ${
              mode === 'replace'
                ? 'bg-white text-black font-semibold shadow-xs'
                : 'bg-[#1c1c1c] text-[#999999] border border-[#262626] hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Novas tarefas</span>
          </button>
        </div>

        {/* Rodapé de Ações (Framer Pills) */}
        <div className="mt-5 pt-3 border-t border-[#262626] flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-full text-xs font-medium text-[#999999] hover:text-white bg-[#1c1c1c] border border-[#262626] transition cursor-pointer"
          >
            Cancelar
          </button>

          <button
            type="button"
            disabled={isLoading || microTasks.length === 0}
            onClick={handleConfirm}
            className="px-5 py-2 rounded-full text-xs font-semibold bg-white hover:bg-neutral-200 text-black flex items-center gap-2 cursor-pointer transition shadow-sm disabled:opacity-40"
          >
            <Check className="w-3.5 h-3.5 text-black" />
            <span>Aplicar Micro-ações</span>
          </button>
        </div>
      </div>
    </div>
  );
};
