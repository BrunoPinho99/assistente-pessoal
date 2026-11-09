import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Scissors, 
  Clock, 
  Check, 
  X, 
  ArrowRight, 
  ShieldCheck, 
  Layers, 
  CheckCircle2 
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
      colors: ['#315DFF', '#82A2FF', '#FFFFFF']
    });
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150 font-sans"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-xl rounded-3xl bg-[#101522] border border-[#315DFF]/40 p-6 sm:p-7 shadow-[0_25px_70px_rgba(0,0,0,0.8)] text-left relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        data-purpose="slice-task-modal"
      >
        {/* Glow Superior */}
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-[#315DFF] to-transparent" />

        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-white shrink-0">
              <Scissors className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-white/10 text-white border border-white/20 uppercase tracking-wider flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5" />
                  Anti-Paralisia TDAH
                </span>
                <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Bloco de 45 Minutos
                </span>
              </div>
              <h3 className="text-lg font-bold text-white tracking-tight mt-1">
                Fatiar Tarefa com IA
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-[#747E98] hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tarefa Original */}
        <div className="my-4 p-3.5 rounded-2xl bg-[#151D31] border border-white/5 space-y-1">
          <span className="text-[10px] font-mono uppercase tracking-wider text-[#747E98]">
            Tarefa Original Selecionada
          </span>
          <div className="flex items-center justify-between gap-2">
            <h4 className="text-sm font-bold text-white truncate">
              {task.title}
            </h4>
            <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-rose-500/15 text-rose-300 border border-rose-500/30 shrink-0">
              {task.estimated_minutes} min
            </span>
          </div>
        </div>

        {/* Micro-etapas geradas pela IA */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-white flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-white" />
              Micro-ações Mecânicas Geradas:
            </span>
            <span className="text-[11px] text-[#8E9BB5]">
              Total: {microTasks.reduce((acc, curr) => acc + curr.estimated_minutes, 0)} min (≤ 45m)
            </span>
          </div>

          {isLoading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-3 text-xs text-white">
              <Sparkles className="w-6 h-6 animate-spin text-white" />
              <span>Decompondo em passos mecânicos imediatos...</span>
            </div>
          ) : (
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {microTasks.map((mt, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-[#151D31] border border-white/10 flex items-start justify-between gap-3"
                >
                  <div className="space-y-1 flex-1 min-w-0">
                    <span className="text-xs font-semibold text-white block">
                      {mt.title}
                    </span>
                    <p className="text-[11px] text-[#CBD5E1] leading-relaxed">
                      {mt.description}
                    </p>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-white/10 text-white border border-white/20 shrink-0">
                    {mt.estimated_minutes}m
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Escolha do Modo de Aplicação */}
        <div className="mt-4 pt-3 border-t border-white/10 flex items-center gap-3 text-xs">
          <span className="text-[#8E9BB5] shrink-0 font-medium">Modo:</span>
          
          <button
            type="button"
            onClick={() => setMode('subtasks')}
            className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
              mode === 'subtasks'
                ? 'bg-[#315DFF] text-white border-[#315DFF]'
                : 'bg-[#151D31] text-[#8E9BB5] border-white/10 hover:text-white'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Sub-etapas da tarefa atual (Recomendado)</span>
          </button>

          <button
            type="button"
            onClick={() => setMode('replace')}
            className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
              mode === 'replace'
                ? 'bg-[#315DFF] text-white border-[#315DFF]'
                : 'bg-[#151D31] text-[#8E9BB5] border-white/10 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>3 novas tarefas no backlog</span>
          </button>
        </div>

        {/* Rodapé de Ações */}
        <div className="mt-5 pt-3 border-t border-white/10 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-[#8E9BB5] hover:text-white hover:bg-white/5 transition cursor-pointer"
          >
            Cancelar
          </button>

          <button
            type="button"
            disabled={isLoading || microTasks.length === 0}
            onClick={handleConfirm}
            className="px-5 py-2.5 rounded-xl text-xs font-bold bg-[#315DFF] hover:bg-[#254ED9] text-white flex items-center gap-2 cursor-pointer transition shadow-[0_2px_12px_rgba(49,93,255,0.4)] disabled:opacity-40"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Aplicar Micro-ações</span>
          </button>
        </div>
      </div>
    </div>
  );
};

