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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-150"
    >
      <div className="w-full max-w-lg rounded-[20px] border border-[#262626] bg-[#141414] p-6 shadow-2xl text-left space-y-4 text-white font-sans">
        <div className="flex items-center justify-between border-b border-[#262626] pb-3.5">
          <div className="flex items-center gap-2.5">
            <span className="w-7 h-7 rounded-full flex items-center justify-center border border-[#262626] bg-[#1c1c1c] text-white">
              <Zap className="w-3.5 h-3.5 text-white" />
            </span>
            <div>
              <h3 className="text-sm font-medium tracking-tight text-white">
                Captura Rápida
              </h3>
              <p className="text-[11px] text-[#999999]">
                Despeje pensamentos soltos da mente instantaneamente sem atrito.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-full text-[#999999] hover:text-white hover:bg-[#1c1c1c] transition-colors cursor-pointer"
            aria-label="Fechar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tipo de Destino (Pill Tabs) */}
        <div className="p-1 rounded-full flex items-center gap-1 border border-[#262626] bg-[#1c1c1c]">
          <button
            type="button"
            onClick={() => setType('inbox')}
            className={`flex-1 py-1.5 px-2 rounded-full text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
              type === 'inbox' 
                ? 'bg-white text-black font-semibold shadow-xs' 
                : 'text-[#999999] hover:text-white'
            }`}
          >
            <Inbox className="w-3.5 h-3.5" />
            <span>Inbox</span>
          </button>

          <button
            type="button"
            onClick={() => setType('task')}
            className={`flex-1 py-1.5 px-2 rounded-full text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
              type === 'task' 
                ? 'bg-white text-black font-semibold shadow-xs' 
                : 'text-[#999999] hover:text-white'
            }`}
          >
            <Check className="w-3.5 h-3.5" />
            <span>Tarefa</span>
          </button>

          <button
            type="button"
            onClick={() => setType('note')}
            className={`flex-1 py-1.5 px-2 rounded-full text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
              type === 'note' 
                ? 'bg-white text-black font-semibold shadow-xs' 
                : 'text-[#999999] hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Nota</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <textarea
            autoFocus
            rows={3}
            placeholder={
              type === 'task' 
                ? "Qual ação precisa ser feita? (Ex: Enviar proposta do Littera)" 
                : type === 'note'
                ? "Qual ideia ou insight você teve agora?"
                : "Pensamento solto para organizar depois..."
            }
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                handleSubmit(e);
              }
            }}
            className="w-full px-3.5 py-2.5 rounded-xl border border-[#262626] bg-[#1c1c1c] text-white placeholder-[#999999] text-xs focus:outline-none focus:border-[#0099ff] focus:ring-1 focus:ring-[#0099ff] resize-none transition-all"
          />

          <div className="flex items-center justify-between pt-1">
            <span className="text-[10px] text-[#999999]">
              Pressione <kbd className="font-mono bg-[#1c1c1c] px-1.5 py-0.5 rounded border border-[#262626] text-white">⌘ + Enter</kbd> para salvar
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-full text-xs font-medium text-[#999999] hover:text-white bg-[#1c1c1c] border border-[#262626] transition cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={!text.trim()}
                className="px-5 py-2 rounded-full text-xs font-semibold bg-white hover:bg-neutral-200 active:scale-[0.98] text-black shadow-sm disabled:opacity-40 transition cursor-pointer"
              >
                Capturar
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
