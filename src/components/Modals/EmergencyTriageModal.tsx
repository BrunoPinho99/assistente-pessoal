import React, { useEffect } from 'react';
import { X, Flame, AlertCircle, Clock, Trash2, CheckCircle2, ShieldAlert } from 'lucide-react';
import { Task } from '../../types';
import { AIAssistantService } from '../../lib/aiAssistant';

interface EmergencyTriageModalProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: Task[];
  onDeferTask: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
  onCompleteTask: (taskId: string) => void;
  isDarkMode?: boolean;
}

export const EmergencyTriageModal: React.FC<EmergencyTriageModalProps> = ({
  isOpen,
  onClose,
  tasks,
  onDeferTask,
  onDeleteTask,
  onCompleteTask,
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

  const triage = AIAssistantService.runEmergencyTriage(tasks);

  return (
    <div 
      role="dialog" 
      aria-modal="true" 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-xs animate-in fade-in duration-150 overflow-y-auto"
    >
      <div className="bg-white dark:bg-[#1C2333] border border-[#E5EAF2] dark:border-[#263248] rounded-2xl p-6 w-full max-w-4xl shadow-2xl text-left space-y-5 my-8 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#E5EAF2] dark:border-[#263248] pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shadow-xs">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-[#172033] dark:text-[#F1F5F9]">
                Modo Emergência: Triagem sem Culpa
              </h3>
              <p className="text-xs text-[#687386] dark:text-[#94A3B8]">
                Alívio cognitivo imediato para destravar tarefas acumuladas.
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

        {/* 4 Quadrantes de Triagem */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Quadrante 1: Urgentes (Fazer Hoje) */}
          <div className="p-4 rounded-xl border border-rose-200 dark:border-rose-900/50 bg-rose-50/50 dark:bg-rose-950/20 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-rose-700 dark:text-rose-300 uppercase tracking-wide flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5" />
                1. Urgente ({triage.urgent.length})
              </h4>
              <span className="text-[10px] text-rose-600 dark:text-rose-400 font-medium">Tem prazo imediato</span>
            </div>
            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {triage.urgent.length === 0 ? (
                <p className="text-xs text-[#687386] dark:text-[#94A3B8] py-3 text-center">Nenhuma urgência crítica pendente!</p>
              ) : (
                triage.urgent.map(t => (
                  <div key={t.id} className="p-2.5 rounded-lg bg-white dark:bg-[#151B28] border border-rose-200/70 dark:border-rose-900/40 flex items-center justify-between text-xs gap-2 shadow-xs">
                    <span className="font-medium text-[#172033] dark:text-[#F1F5F9] truncate">{t.title}</span>
                    <button
                      type="button"
                      onClick={() => onCompleteTask(t.id)}
                      className="p-1 rounded text-[#687386] hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-pointer"
                      title="Concluir"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Quadrante 2: Importante (Próximos Dias) */}
          <div className="p-4 rounded-xl border border-[#245BFF]/20 dark:border-[#245BFF]/30 bg-[#EEF3FF]/70 dark:bg-[#245BFF]/10 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-[#245BFF] dark:text-[#818CF8] uppercase tracking-wide flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5" />
                2. Importante ({triage.important.length})
              </h4>
              <span className="text-[10px] text-[#245BFF] dark:text-[#818CF8] font-medium">Requer foco calmo</span>
            </div>
            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {triage.important.length === 0 ? (
                <p className="text-xs text-[#687386] dark:text-[#94A3B8] py-3 text-center">Nenhuma tarefa pesada acumulada.</p>
              ) : (
                triage.important.map(t => (
                  <div key={t.id} className="p-2.5 rounded-lg bg-white dark:bg-[#151B28] border border-[#E5EAF2] dark:border-[#263248] flex items-center justify-between text-xs gap-2 shadow-xs">
                    <span className="font-medium text-[#172033] dark:text-[#F1F5F9] truncate">{t.title}</span>
                    <button
                      type="button"
                      onClick={() => onDeferTask(t.id)}
                      className="text-[10px] px-2 py-0.5 rounded-md bg-[#E9EFF8] dark:bg-[#222B3D] hover:bg-[#DCE5F3] text-[#245BFF] dark:text-[#818CF8] font-medium transition-colors cursor-pointer flex-shrink-0"
                    >
                      Adiar
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Quadrante 3: Pode Esperar (Sem Culpa) */}
          <div className="p-4 rounded-xl border border-[#E5EAF2] dark:border-[#263248] bg-[#F5F7FB] dark:bg-[#151B28]/60 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-[#687386] dark:text-[#94A3B8] uppercase tracking-wide flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                3. Pode Esperar ({triage.canWait.length})
              </h4>
              <span className="text-[10px] text-[#687386] dark:text-[#94A3B8] font-medium">Tire do radar hoje</span>
            </div>
            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {triage.canWait.length === 0 ? (
                <p className="text-xs text-[#687386] dark:text-[#94A3B8] py-3 text-center">Nenhuma tarefa em espera.</p>
              ) : (
                triage.canWait.map(t => (
                  <div key={t.id} className="p-2.5 rounded-lg bg-white dark:bg-[#1C2333] border border-[#E5EAF2] dark:border-[#263248] flex items-center justify-between text-xs gap-2 shadow-xs">
                    <span className="font-medium text-[#172033] dark:text-[#F1F5F9] truncate">{t.title}</span>
                    <button
                      type="button"
                      onClick={() => onDeferTask(t.id)}
                      className="text-[10px] px-2 py-0.5 rounded-md bg-[#E9EFF8] dark:bg-[#222B3D] hover:bg-[#DCE5F3] text-[#687386] dark:text-[#94A3B8] font-medium transition-colors cursor-pointer flex-shrink-0"
                    >
                      Adiar 1 sem
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Quadrante 4: Pode ser Descartada (Desapego Mental) */}
          <div className="p-4 rounded-xl border border-[#E5EAF2] dark:border-[#263248] bg-[#F5F7FB] dark:bg-[#151B28]/60 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-[#687386] dark:text-[#94A3B8] uppercase tracking-wide flex items-center gap-1.5">
                <Trash2 className="w-3.5 h-3.5" />
                4. Descartáveis / Arquivadas ({triage.canDiscard.length})
              </h4>
              <span className="text-[10px] text-[#687386] dark:text-[#94A3B8] font-medium">Elimine sem remorso</span>
            </div>
            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {triage.canDiscard.length === 0 ? (
                <p className="text-xs text-[#687386] dark:text-[#94A3B8] py-3 text-center">Nenhuma tarefa irrelevante detectada.</p>
              ) : (
                triage.canDiscard.map(t => (
                  <div key={t.id} className="p-2.5 rounded-lg bg-white dark:bg-[#1C2333] border border-[#E5EAF2] dark:border-[#263248] flex items-center justify-between text-xs gap-2 shadow-xs">
                    <span className="text-[#687386] dark:text-[#94A3B8] truncate">{t.title}</span>
                    <button
                      type="button"
                      onClick={() => onDeleteTask(t.id)}
                      className="text-[10px] px-2 py-0.5 rounded-md bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 dark:hover:bg-rose-900/40 text-rose-700 dark:text-rose-400 font-medium transition-colors cursor-pointer flex-shrink-0"
                    >
                      Descartar
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-[#E5EAF2] dark:border-[#263248]">
          <p className="text-[11px] text-[#687386] dark:text-[#94A3B8]">
            Dizer "não" para tarefas antigas é o melhor tratamento contra o esgotamento executivo.
          </p>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#245BFF] hover:bg-[#1A4EE5] text-white transition-colors cursor-pointer shadow-xs"
          >
            Concluir Triagem
          </button>
        </div>
      </div>
    </div>
  );
};
