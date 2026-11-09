import React, { useState } from 'react';
import { 
  Lock, 
  Unlock, 
  ArrowRight, 
  AlertTriangle, 
  ShieldAlert, 
  X, 
  Check, 
  FolderKanban, 
  Target 
} from 'lucide-react';
import { Project } from '../../types';
import confetti from 'canvas-confetti';

interface TradeoffModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectToUnlock: Project | null;
  activeProjects: Project[];
  onConfirmTradeoff: (projectToUnlockId: string, projectToLockId: string) => void;
}

export const TradeoffModal: React.FC<TradeoffModalProps> = ({
  isOpen,
  onClose,
  projectToUnlock,
  activeProjects,
  onConfirmTradeoff
}) => {
  const [selectedToLockId, setSelectedToLockId] = useState<string | null>(null);

  if (!isOpen || !projectToUnlock) return null;

  const handleConfirm = () => {
    if (!selectedToLockId) return;
    onConfirmTradeoff(projectToUnlock.id, selectedToLockId);
    confetti({
      particleCount: 35,
      spread: 45,
      colors: ['#315DFF', '#82A2FF', '#FFFFFF']
    });
    onClose();
    setSelectedToLockId(null);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150 font-sans"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-2xl rounded-3xl bg-[#101522] border border-[#315DFF]/40 p-6 sm:p-8 shadow-[0_25px_70px_rgba(0,0,0,0.8)] text-left relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        data-purpose="tradeoff-modal"
      >
        {/* Glow de ambientação no topo */}
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-[#315DFF] to-transparent" />

        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-5">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30 uppercase tracking-wider flex items-center gap-1">
                  <Lock className="w-2.5 h-2.5" />
                  Protocolo 1-1-1 · Regra da Substituição
                </span>
                <span className="text-[11px] font-semibold text-rose-400">
                  (Capacidade Máxima: 3/3 Slots Ocupados)
                </span>
              </div>
              <h3 className="text-xl font-bold text-white tracking-tight mt-1">
                Trava de Segurança: Substituição Obrigatória
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-[#747E98] hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Contexto e Explicação TDAH */}
        <div className="my-5 p-4 rounded-2xl bg-[#151D31] border border-white/5 space-y-2">
          <p className="text-xs text-[#CBD5E1] leading-relaxed">
            Você está tentando destrancar <strong className="text-white font-bold underline decoration-white/40">"{projectToUnlock.title}"</strong>, mas os <strong>3 slots de banda cognitiva</strong> (Âncora, Satélite e Válvula) já estão ocupados.
          </p>
          <p className="text-[11px] text-[#8E9BB5] leading-relaxed">
            O sistema repudia o acúmulo para proteger a função executiva e evitar burnout. Para o novo projeto entrar em produção, selecione <strong>qual projeto ativo voltará para o Estacionamento de Ideias (com cadeado 🔒)</strong> para liberar o slot.
          </p>
        </div>

        {/* Lista dos Projetos Ativos para Escolher o que vai Trancar */}
        <div className="space-y-3">
          <label className="text-xs font-bold text-white flex items-center justify-between">
            <span>Selecione qual projeto ativo você irá trancar:</span>
            <span className="text-[11px] text-[#8E9BB5] font-normal">Clique para escolher</span>
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {activeProjects.map((actProj) => {
              const isSelected = selectedToLockId === actProj.id;

              return (
                <div
                  key={actProj.id}
                  onClick={() => setSelectedToLockId(actProj.id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer relative flex flex-col justify-between gap-3 text-left ${
                    isSelected 
                      ? 'bg-[#1E1730] border-rose-500/70 ring-1 ring-rose-500/40 shadow-lg' 
                      : 'bg-[#151D31] border-white/10 hover:border-white/20 hover:bg-[#182035]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-white/10 text-white border border-white/20">
                        {actProj.area}
                      </span>
                      {actProj.slot === 'ancora' && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/40">
                          Slot 1 | Âncora (~70%)
                        </span>
                      )}
                      {actProj.slot === 'satelite' && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40">
                          Slot 2 | Satélite (Tático)
                        </span>
                      )}
                      {actProj.slot === 'valvula' && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                          Slot 3 | Válvula (Sandbox)
                        </span>
                      )}
                    </div>

                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${
                      isSelected 
                        ? 'bg-rose-500 border-rose-500 text-white' 
                        : 'border-[#747E98] bg-transparent'
                    }`}>
                      {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-white">
                      {actProj.title}
                    </h4>
                    <p className="text-[11px] text-[#8E9BB5] mt-1 line-clamp-2">
                      {actProj.description || actProj.main_goal}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[10px]">
                    <span className="text-[#8E9BB5]">Próximo passo:</span>
                    <span className="text-white font-medium truncate max-w-[130px]">
                      {actProj.next_step}
                    </span>
                  </div>

                  {isSelected && (
                    <div className="text-[10px] font-semibold text-rose-400 flex items-center gap-1">
                      <Lock className="w-3 h-3" />
                      <span>Será enviado para o Estacionamento 🔒</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Resumo do Trade-off */}
        {selectedToLockId && (
          <div className="mt-5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-rose-400 shrink-0" />
              <span className="text-rose-200">
                Trancar: <strong>{activeProjects.find(p => p.id === selectedToLockId)?.title}</strong>
              </span>
            </div>
            <ArrowRight className="w-4 h-4 text-[#8E9BB5] shrink-0" />
            <div className="flex items-center gap-2">
              <Unlock className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="text-emerald-200">
                Ativar: <strong>{projectToUnlock.title}</strong>
              </span>
            </div>
          </div>
        )}

        {/* Rodapé de Ações */}
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-end gap-3 border-t border-white/10 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-semibold text-[#8E9BB5] hover:text-white hover:bg-white/5 transition cursor-pointer"
          >
            Cancelar (Manter Foco Atual)
          </button>

          <button
            type="button"
            disabled={!selectedToLockId}
            onClick={handleConfirm}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-bold bg-[#315DFF] hover:bg-[#254ED9] disabled:opacity-40 disabled:cursor-not-allowed text-white flex items-center justify-center gap-2 cursor-pointer transition shadow-[0_2px_12px_rgba(49,93,255,0.4)]"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Confirmar Substituição e Destrancar</span>
          </button>
        </div>
      </div>
    </div>
  );
};

