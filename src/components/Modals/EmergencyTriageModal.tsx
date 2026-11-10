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
  onCompleteTask
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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-150 overflow-y-auto font-sans"
    >
      <div className="bg-[#141414] border border-[#262626] rounded-[20px] p-6 sm:p-7 w-full max-w-4xl shadow-2xl text-left space-y-5 my-8 max-h-[90vh] overflow-y-auto text-white">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#262626] pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#1c1c1c] border border-[#262626] text-white flex items-center justify-center">
              <ShieldAlert className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-base font-medium text-white tracking-tight">
                Modo Emergência: Triagem sem Culpa
              </h3>
              <p className="text-xs text-[#999999]">
                Alívio cognitivo imediato para destravar tarefas acumuladas.
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

        {/* 4 Quadrantes de Triagem */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Quadrante 1: Urgentes (Fazer Hoje) */}
          <div className="p-4 rounded-xl border border-rose-500/20 bg-[#1c1c1c] space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-semibold text-rose-300 uppercase tracking-wide flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5" />
                1. Urgente ({triage.urgent.length})
              </h4>
              <span className="text-[10px] text-rose-400 font-medium">Tem prazo imediato</span>
            </div>
            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {triage.urgent.length === 0 ? (
                <p className="text-xs text-[#999999] py-3 text-center">Nenhuma urgência crítica pendente!</p>
              ) : (
                triage.urgent.map(t => (
                  <div key={t.id} className="p-2.5 rounded-lg bg-[#141414] border border-[#262626] flex items-center justify-between text-xs gap-2 shadow-xs">
                    <span className="font-medium text-white truncate">{t.title}</span>
                    <button
                      type="button"
                      onClick={() => onCompleteTask(t.id)}
                      className="p-1 rounded text-[#999999] hover:text-white transition-colors cursor-pointer"
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
          <div className="p-4 rounded-xl border border-[#262626] bg-[#1c1c1c] space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-semibold text-white uppercase tracking-wide flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 text-[#0099ff]" />
                2. Importante ({triage.important.length})
              </h4>
              <span className="text-[10px] text-[#999999] font-medium">Requer foco calmo</span>
            </div>
            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {triage.important.length === 0 ? (
                <p className="text-xs text-[#999999] py-3 text-center">Nenhuma tarefa pesada acumulada.</p>
              ) : (
                triage.important.map(t => (
                  <div key={t.id} className="p-2.5 rounded-lg bg-[#141414] border border-[#262626] flex items-center justify-between text-xs gap-2 shadow-xs">
                    <span className="font-medium text-white truncate">{t.title}</span>
                    <button
                      type="button"
                      onClick={() => onDeferTask(t.id)}
                      className="text-[10px] px-2 py-0.5 rounded-full bg-[#1c1c1c] border border-[#262626] hover:bg-[#262626] text-white font-medium transition-colors cursor-pointer flex-shrink-0"
                    >
                      Adiar
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Quadrante 3: Pode Esperar (Sem Culpa) */}
          <div className="p-4 rounded-xl border border-[#262626] bg-[#1c1c1c] space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-semibold text-[#999999] uppercase tracking-wide flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                3. Pode Esperar ({triage.canWait.length})
              </h4>
              <span className="text-[10px] text-[#999999] font-medium">Tire do radar hoje</span>
            </div>
            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {triage.canWait.length === 0 ? (
                <p className="text-xs text-[#999999] py-3 text-center">Nenhuma tarefa em espera.</p>
              ) : (
                triage.canWait.map(t => (
                  <div key={t.id} className="p-2.5 rounded-lg bg-[#141414] border border-[#262626] flex items-center justify-between text-xs gap-2 shadow-xs">
                    <span className="font-medium text-white truncate">{t.title}</span>
                    <button
                      type="button"
                      onClick={() => onDeferTask(t.id)}
                      className="text-[10px] px-2 py-0.5 rounded-full bg-[#1c1c1c] border border-[#262626] hover:bg-[#262626] text-[#999999] hover:text-white font-medium transition-colors cursor-pointer flex-shrink-0"
                    >
                      Adiar 1 sem
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Quadrante 4: Pode ser Descartada (Desapego Mental) */}
          <div className="p-4 rounded-xl border border-[#262626] bg-[#1c1c1c] space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-semibold text-[#999999] uppercase tracking-wide flex items-center gap-1.5">
                <Trash2 className="w-3.5 h-3.5" />
                4. Descartáveis / Arquivadas ({triage.canDiscard.length})
              </h4>
              <span className="text-[10px] text-[#999999] font-medium">Elimine sem remorso</span>
            </div>
            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {triage.canDiscard.length === 0 ? (
                <p className="text-xs text-[#999999] py-3 text-center">Nenhuma tarefa irrelevante detectada.</p>
              ) : (
                triage.canDiscard.map(t => (
                  <div key={t.id} className="p-2.5 rounded-lg bg-[#141414] border border-[#262626] flex items-center justify-between text-xs gap-2 shadow-xs">
                    <span className="text-[#999999] truncate">{t.title}</span>
                    <button
                      type="button"
                      onClick={() => onDeleteTask(t.id)}
                      className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-300 font-medium transition-colors cursor-pointer flex-shrink-0 hover:bg-rose-500/25"
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
        <div className="flex items-center justify-between pt-3 border-t border-[#262626]">
          <p className="text-[11px] text-[#999999]">
            Dizer "não" para tarefas antigas é o melhor tratamento contra o esgotamento executivo.
          </p>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-full text-xs font-semibold bg-white hover:bg-neutral-200 text-black transition-colors cursor-pointer shadow-sm"
          >
            Concluir Triagem
          </button>
        </div>
      </div>
    </div>
  );
};
