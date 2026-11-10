import React, { useState } from 'react';
import { 
  Lock, 
  Unlock, 
  ArrowRight, 
  ShieldAlert, 
  X, 
  Check 
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
      colors: ['#ffffff', '#0099ff', '#d44df0']
    });
    onClose();
    setSelectedToLockId(null);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-150 font-sans"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-2xl rounded-[20px] bg-[#141414] border border-[#262626] p-6 sm:p-7 shadow-2xl text-left relative overflow-hidden text-white"
        onClick={(e) => e.stopPropagation()}
        data-purpose="tradeoff-modal"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-[#262626] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#1c1c1c] border border-[#262626] flex items-center justify-center text-white shrink-0">
              <ShieldAlert className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-medium bg-[#1c1c1c] text-[#999999] border border-[#262626] uppercase tracking-wider flex items-center gap-1">
                  <Lock className="w-2.5 h-2.5" />
                  Protocolo 1-1-1 · Regra da Substituição
                </span>
                <span className="text-[11px] font-medium text-rose-400">
                  (Capacidade Máxima: 3 Slots Ocupados)
                </span>
              </div>
              <h3 className="text-lg font-medium text-white tracking-tight mt-1">
                Substituição Obrigatória de Projeto
              </h3>
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

        {/* Contexto e Explicação */}
        <div className="my-4 p-4 rounded-xl bg-[#1c1c1c] border border-[#262626] space-y-1.5">
          <p className="text-xs text-white leading-relaxed">
            Você está tentando destrancar <strong className="text-white font-medium underline decoration-white/40">"{projectToUnlock.title}"</strong>, mas os <strong>3 slots de banda cognitiva</strong> (Âncora, Satélite e Válvula) já estão ocupados.
          </p>
          <p className="text-[11px] text-[#999999] leading-relaxed">
            Para o novo projeto entrar em produção, selecione <strong>qual projeto ativo voltará para o Estacionamento de Ideias (🔒)</strong> para liberar o slot.
          </p>
        </div>

        {/* Lista dos Projetos Ativos para Escolher o que vai Trancar */}
        <div className="space-y-3">
          <label className="text-xs font-medium text-white flex items-center justify-between tracking-tight">
            <span>Selecione qual projeto ativo você irá trancar:</span>
            <span className="text-[11px] text-[#999999] font-normal">Clique para escolher</span>
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {activeProjects.map((actProj) => {
              const isSelected = selectedToLockId === actProj.id;

              return (
                <div
                  key={actProj.id}
                  onClick={() => setSelectedToLockId(actProj.id)}
                  className={`p-3.5 rounded-xl border transition-colors cursor-pointer relative flex flex-col justify-between gap-2.5 text-left ${
                    isSelected 
                      ? 'bg-[#1c1c1c] border-rose-500/80 ring-1 ring-rose-500/50 shadow-sm' 
                      : 'bg-[#141414] border-[#262626] hover:bg-[#1c1c1c]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-[#1c1c1c] text-white border border-[#262626]">
                        {actProj.area}
                      </span>
                      {actProj.slot === 'ancora' && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#1c1c1c] text-[#999999] border border-[#262626]">
                          Slot 1 | Âncora
                        </span>
                      )}
                      {actProj.slot === 'satelite' && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#1c1c1c] text-[#999999] border border-[#262626]">
                          Slot 2 | Satélite
                        </span>
                      )}
                      {actProj.slot === 'valvula' && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#1c1c1c] text-[#999999] border border-[#262626]">
                          Slot 3 | Válvula
                        </span>
                      )}
                    </div>

                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${
                      isSelected 
                        ? 'bg-rose-500 border-rose-500 text-white' 
                        : 'border-[#444444] bg-transparent'
                    }`}>
                      {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xs sm:text-sm font-medium text-white tracking-tight">
                      {actProj.title}
                    </h4>
                    <p className="text-[11px] text-[#999999] mt-0.5 line-clamp-2">
                      {actProj.description || actProj.main_goal}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-[#262626] flex items-center justify-between text-[10px]">
                    <span className="text-[#999999]">Próximo passo:</span>
                    <span className="text-white font-medium truncate max-w-[130px]">
                      {actProj.next_step}
                    </span>
                  </div>

                  {isSelected && (
                    <div className="text-[10px] font-medium text-rose-400 flex items-center gap-1">
                      <Lock className="w-3 h-3" />
                      <span>Irá para o Estacionamento 🔒</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Resumo do Trade-off */}
        {selectedToLockId && (
          <div className="mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/25 flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <Lock className="w-3.5 h-3.5 text-rose-400 shrink-0" />
              <span className="text-rose-200">
                Trancar: <strong>{activeProjects.find(p => p.id === selectedToLockId)?.title}</strong>
              </span>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-[#999999] shrink-0" />
            <div className="flex items-center gap-2">
              <Unlock className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="text-emerald-200">
                Ativar: <strong>{projectToUnlock.title}</strong>
              </span>
            </div>
          </div>
        )}

        {/* Rodapé de Ações (Framer Pills) */}
        <div className="mt-5 flex flex-col sm:flex-row items-center justify-end gap-2.5 border-t border-[#262626] pt-4">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2 rounded-full text-xs font-medium text-[#999999] hover:text-white bg-[#1c1c1c] border border-[#262626] transition cursor-pointer"
          >
            Cancelar
          </button>

          <button
            type="button"
            disabled={!selectedToLockId}
            onClick={handleConfirm}
            className="w-full sm:w-auto px-5 py-2 rounded-full text-xs font-semibold bg-white hover:bg-neutral-200 disabled:opacity-40 disabled:cursor-not-allowed text-black flex items-center justify-center gap-2 cursor-pointer transition shadow-sm"
          >
            <Lock className="w-3 h-3 text-black" />
            <span>Confirmar Substituição</span>
          </button>
        </div>
      </div>
    </div>
  );
};
