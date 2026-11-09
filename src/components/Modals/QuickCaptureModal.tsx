import React, { useState, useEffect } from 'react';
import { X, Check, Inbox, FileText, Zap } from 'lucide-react';

interface QuickCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode?: boolean;
  onCapture: (text: string, type: 'task' | 'note' | 'inbox') => void;
}

export const QuickCaptureModal: React.FC<QuickCaptureModalProps> = ({
  isOpen,
  onClose,
  isDarkMode = false,
  onCapture
}) => {
  const [text, setText] = useState('');
  const [type, setType] = useState<'inbox' | 'task' | 'note'>('inbox');

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    onCapture(text.trim(), type);
    setText('');
    onClose();
  };

  return (
    <div 
      role="dialog" 
      aria-modal="true" 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150"
    >
      <div className={`w-full max-w-lg rounded-2xl border p-6 shadow-[0_20px_48px_rgba(23,32,51,0.16)] text-left space-y-4 ${
        isDarkMode ? 'bg-[#1C2333] border-[#263248] text-[#F1F5F9]' : 'bg-[#FFFFFF] border-[#E5EAF2] text-[#172033]'
      }`}>
        <div className="flex items-center justify-between border-b border-[#E5EAF2] dark:border-[#263248] pb-3.5">
          <div className="flex items-center gap-2.5">
            <span className={`w-7 h-7 rounded-lg flex items-center justify-center border ${
              isDarkMode 
                ? 'bg-[#245BFF]/20 border-[#245BFF]/30 text-[#7A9CFF]' 
                : 'bg-[#EEF3FF] border-[#D4E2FF] text-[#245BFF]'
            }`}>
              <Zap className="w-4 h-4" />
            </span>
            <div>
              <h3 className={`text-sm font-bold tracking-tight ${isDarkMode ? 'text-[#F1F5F9]' : 'text-[#172033]'}`}>
                Captura Rápida (Zero Atrito)
              </h3>
              <p className={`text-[11px] ${isDarkMode ? 'text-[#94A3B8]' : 'text-[#687386]'}`}>
                Despeje pensamentos soltos da mente instantaneamente.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className={`p-1 rounded-lg transition-colors cursor-pointer ${
              isDarkMode ? 'text-[#94A3B8] hover:text-[#F1F5F9]' : 'text-[#687386] hover:text-[#172033]'
            }`}
            aria-label="Fechar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tipo de Destino (Segmented Soft Tech) */}
        <div className={`p-1 rounded-xl flex items-center gap-1 border ${
          isDarkMode ? 'bg-[#182030] border-[#263248]' : 'bg-[#E9EFF8] border-[#E5EAF2]'
        }`}>
          <button
            type="button"
            onClick={() => setType('inbox')}
            className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              type === 'inbox' 
                ? isDarkMode 
                  ? 'bg-[#315DFF] text-white font-semibold shadow-xs' 
                  : 'bg-[#FFFFFF] text-[#245BFF] font-semibold shadow-xs border border-[#E5EAF2]'
                : isDarkMode ? 'text-[#94A3B8] hover:text-[#F1F5F9]' : 'text-[#687386] hover:text-[#172033]'
            }`}
          >
            <Inbox className="w-3.5 h-3.5" />
            <span>Inbox</span>
          </button>

          <button
            type="button"
            onClick={() => setType('task')}
            className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              type === 'task' 
                ? isDarkMode 
                  ? 'bg-[#315DFF] text-white font-semibold shadow-xs' 
                  : 'bg-[#FFFFFF] text-[#245BFF] font-semibold shadow-xs border border-[#E5EAF2]'
                : isDarkMode ? 'text-[#94A3B8] hover:text-[#F1F5F9]' : 'text-[#687386] hover:text-[#172033]'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Ação Imediata</span>
          </button>

          <button
            type="button"
            onClick={() => setType('note')}
            className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              type === 'note' 
                ? isDarkMode 
                  ? 'bg-[#315DFF] text-white font-semibold shadow-xs' 
                  : 'bg-[#FFFFFF] text-[#245BFF] font-semibold shadow-xs border border-[#E5EAF2]'
                : isDarkMode ? 'text-[#94A3B8] hover:text-[#F1F5F9]' : 'text-[#687386] hover:text-[#172033]'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Anotação</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <textarea
            autoFocus
            rows={3}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
            placeholder={
              type === 'inbox' 
                ? 'Ex: Rever os slides de apresentação do IDP...' 
                : type === 'task' 
                  ? 'Ex: Rodar migrations do cluster e subir PR...' 
                  : 'Ex: Ideia de novo módulo para o Littera...'
            }
            className={`w-full p-3.5 rounded-xl border text-xs sm:text-sm focus:outline-none focus:border-[#245BFF] focus:ring-2 focus:ring-[#245BFF]/20 resize-none transition-all ${
              isDarkMode 
                ? 'bg-[#182030] border-[#263248] text-[#F1F5F9] placeholder-[#64748B]' 
                : 'bg-[#FFFFFF] border-[#E5EAF2] text-[#172033] placeholder-[#9AA4B2]'
            }`}
          />

          <div className="flex items-center justify-between text-xs pt-1">
            <span className={`text-[11px] font-mono ${isDarkMode ? 'text-[#64748B]' : 'text-[#9AA4B2]'}`}>
              Pressione <kbd className="px-1.5 py-0.5 rounded border border-[#E5EAF2] dark:border-[#263248] bg-[#F5F7FB] dark:bg-[#182030] text-[10px]">Cmd + Enter</kbd> para salvar
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium ${
                  isDarkMode ? 'text-[#94A3B8] hover:bg-[#222B3D]' : 'text-[#687386] hover:bg-[#F5F7FB]'
                }`}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#245BFF] hover:bg-[#1A4EE5] active:scale-[0.98] text-white shadow-[0_2px_8px_-1px_rgba(58,98,255,0.35)] transition cursor-pointer flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Salvar</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
