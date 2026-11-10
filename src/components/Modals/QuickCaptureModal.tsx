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
  isDarkMode = true,
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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-150"
    >
      <div
        className={`w-full max-w-lg rounded-[24px] border p-6 shadow-2xl text-left space-y-4 font-sans ${
          isDarkMode
            ? 'border-[#262626] bg-[#141414] text-[#ffffff]'
            : 'border-[#e4e4e7] bg-[#ffffff] text-[#090909]'
        }`}
      >
        <div
          className={`flex items-center justify-between border-b pb-3.5 ${
            isDarkMode ? 'border-[#262626]' : 'border-[#e4e4e7]'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <span
              className={`w-7 h-7 rounded-full flex items-center justify-center border ${
                isDarkMode
                  ? 'border-[#262626] bg-[#1c1c1c] text-[#ffffff]'
                  : 'border-[#e4e4e7] bg-[#f7f7f8] text-[#090909]'
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-[#0099ff]" />
            </span>
            <div>
              <h3 className="text-sm font-medium tracking-tight">
                Captura Rápida
              </h3>
              <p className={`text-[11px] ${isDarkMode ? 'text-[#999999]' : 'text-[#666666]'}`}>
                Despeje pensamentos soltos da mente instantaneamente sem atrito.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className={`p-1 rounded-full transition-colors cursor-pointer ${
              isDarkMode
                ? 'text-[#999999] hover:text-[#ffffff] hover:bg-[#1c1c1c]'
                : 'text-[#666666] hover:text-[#090909] hover:bg-[#efefef]'
            }`}
            aria-label="Fechar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tipo de Destino (Pill Tabs) */}
        <div
          className={`p-1 rounded-full flex items-center gap-1 border ${
            isDarkMode
              ? 'border-[#262626] bg-[#090909]'
              : 'border-[#e4e4e7] bg-[#efefef]'
          }`}
        >
          <button
            type="button"
            onClick={() => setType('inbox')}
            className={`flex-1 py-1.5 px-2 rounded-full text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
              type === 'inbox' 
                ? isDarkMode
                  ? 'bg-[#1c1c1c] text-[#ffffff]'
                  : 'bg-[#ffffff] text-[#090909] shadow-xs'
                : isDarkMode
                  ? 'text-[#999999] hover:text-[#ffffff]'
                  : 'text-[#666666] hover:text-[#090909]'
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
                ? isDarkMode
                  ? 'bg-[#1c1c1c] text-[#ffffff]'
                  : 'bg-[#ffffff] text-[#090909] shadow-xs'
                : isDarkMode
                  ? 'text-[#999999] hover:text-[#ffffff]'
                  : 'text-[#666666] hover:text-[#090909]'
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
                ? isDarkMode
                  ? 'bg-[#1c1c1c] text-[#ffffff]'
                  : 'bg-[#ffffff] text-[#090909] shadow-xs'
                : isDarkMode
                  ? 'text-[#999999] hover:text-[#ffffff]'
                  : 'text-[#666666] hover:text-[#090909]'
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
            className={`w-full px-3.5 py-2.5 rounded-[10px] border text-xs focus:outline-none focus:border-[#0099ff] resize-none transition-all ${
              isDarkMode
                ? 'border-[#262626] bg-[#090909] text-[#ffffff] placeholder-[#999999]'
                : 'border-[#e4e4e7] bg-[#f7f7f8] text-[#090909] placeholder-[#666666]'
            }`}
          />

          <div className="flex items-center justify-between pt-1">
            <span className={`text-[10px] ${isDarkMode ? 'text-[#999999]' : 'text-[#666666]'}`}>
              Pressione{' '}
              <kbd
                className={`font-mono px-1.5 py-0.5 rounded border ${
                  isDarkMode
                    ? 'bg-[#1c1c1c] border-[#262626] text-[#ffffff]'
                    : 'bg-[#f7f7f8] border-[#e4e4e7] text-[#090909]'
                }`}
              >
                ⌘ + Enter
              </kbd>{' '}
              para salvar
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className={`px-4 py-2 rounded-full text-xs font-medium border transition cursor-pointer ${
                  isDarkMode
                    ? 'text-[#999999] hover:text-[#ffffff] bg-[#1c1c1c] border-[#262626]'
                    : 'text-[#666666] hover:text-[#090909] bg-[#efefef] border-[#e4e4e7]'
                }`}
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={!text.trim()}
                className={`px-5 py-2 rounded-full text-xs font-medium active:scale-[0.98] disabled:opacity-40 transition cursor-pointer ${
                  isDarkMode
                    ? 'bg-[#ffffff] hover:bg-[#f0f0f0] text-[#000000]'
                    : 'bg-[#090909] hover:bg-[#222222] text-[#ffffff]'
                }`}
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
