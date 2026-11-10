import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Sparkles,
  X,
  Bot,
  KeyRound,
  Key,
  Check,
  Trash2,
  ExternalLink
} from 'lucide-react';
import { Project, ContextArea, Task, NavigationTab } from '../../types';
import { processAssistantMessage, AssistantActionExecuted } from '../../lib/assistantAgent';
import confetti from 'canvas-confetti';

interface DopamineParkingChatProps {
  isOpen: boolean;
  onClose: () => void;
  onOpen: () => void;
  userName?: string;
  tasks?: Task[];
  projects?: Project[];
  parkedProjects: Project[];
  activeProjects: Project[];
  onAddTask?: (task: Omit<Task, 'id' | 'created_at'>) => Task;
  onUpdateTask?: (id: string, updates: Partial<Task>) => void;
  onDeleteTask?: (id: string) => void;
  onToggleTask?: (taskId: string) => void;
  onSliceTask?: (taskId: string, microTasks: any[], mode: 'replace' | 'subtasks') => void;
  onAddProject?: (project: Omit<Project, 'id'>) => Project;
  onUpdateProject?: (id: string, updates: Partial<Project>) => void;
  onDeleteProject?: (id: string) => void;
  onParkIdea: (ideaText: string, area?: ContextArea) => Project;
  onStartFocus?: (task: Task) => void;
  onNavigateTab?: (tab: NavigationTab) => void;
  onNavigateToProjects?: () => void;
  isDarkMode?: boolean;
}

interface ChatMessage {
  id: string;
  sender: 'assistant' | 'user';
  text: string;
  actionsExecuted?: AssistantActionExecuted[];
  timestamp: string;
}

export const DopamineParkingChat: React.FC<DopamineParkingChatProps> = ({
  isOpen,
  onClose,
  onOpen,
  userName = 'Bruno',
  tasks = [],
  projects = [],
  parkedProjects,
  activeProjects,
  onAddTask,
  onUpdateTask,
  onDeleteTask,
  onToggleTask,
  onSliceTask,
  onAddProject,
  onUpdateProject,
  onDeleteProject,
  onParkIdea,
  onStartFocus,
  onNavigateTab
}) => {
  const [inputMessage, setInputMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState(() => {
    return localStorage.getItem('personal_os_gemini_key') || localStorage.getItem('personal_os_ai_key') || '';
  });
  const [isTestingKey, setIsTestingKey] = useState(false);
  const [keyFeedback, setKeyFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const initialMessage: ChatMessage = {
    id: 'msg_welcome',
    sender: 'assistant',
    text: `Oi, ${userName}! Sobre o que você quer conversar, ter ideias ou alterar no dashboard agora?`,
    timestamp: 'Agora'
  };

  const [messages, setMessages] = useState<ChatMessage[]>([initialMessage]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleTestAndSaveKey = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const key = apiKeyInput.trim();
    if (!key) {
      setKeyFeedback({ type: 'error', message: 'Insira uma chave de API válida.' });
      return;
    }

    setIsTestingKey(true);
    setKeyFeedback(null);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'verify_key',
          geminiApiKey: key
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        localStorage.setItem('personal_os_gemini_key', key);
        localStorage.setItem('personal_os_ai_key', key);
        setKeyFeedback({ type: 'success', message: 'Chave salva e conectada!' });
        setTimeout(() => setShowKeyModal(false), 1200);
      } else {
        setKeyFeedback({ type: 'error', message: data.error || 'Chave inválida.' });
      }
    } catch {
      setKeyFeedback({ type: 'error', message: 'Erro ao conectar à API.' });
    } finally {
      setIsTestingKey(false);
    }
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const query = inputMessage.trim();
    if (!query || isProcessing) return;

    const userMsg: ChatMessage = {
      id: 'user_' + Date.now(),
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputMessage('');
    setIsProcessing(true);

    try {
      const historyPayload = messages
        .filter(m => m.id !== 'msg_welcome')
        .slice(-10)
        .map(m => ({
          role: m.sender === 'user' ? ('user' as const) : ('model' as const),
          text: m.text
        }));

      const response = await processAssistantMessage(query, {
        userName,
        tasks,
        projects,
        activeProjects,
        parkedProjects,
        history: historyPayload,
        onAddTask: onAddTask || (t => ({ ...t, id: 'temp_' + Date.now(), created_at: new Date().toISOString() })),
        onUpdateTask,
        onDeleteTask,
        onToggleTask: onToggleTask || (() => {}),
        onSliceTask,
        onAddProject,
        onUpdateProject,
        onDeleteProject,
        onParkIdea,
        onStartFocus,
        onNavigateTab
      });

      const assistantReply: ChatMessage = {
        id: 'asst_' + Date.now(),
        sender: 'assistant',
        text: response.replyText,
        actionsExecuted: response.actionsExecuted,
        timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, assistantReply]);

      if (response.actionsExecuted && response.actionsExecuted.length > 0) {
        confetti({
          particleCount: 20,
          spread: 40,
          origin: { x: 0.85, y: 0.85 }
        });
      }
    } catch {
      setMessages(prev => [
        ...prev,
        {
          id: 'err_' + Date.now(),
          sender: 'assistant',
          text: 'Tive um contratempo na conexão. Pode tentar de novo?',
          timestamp: 'Agora'
        }
      ]);
    } finally {
      setIsProcessing(false);
    }
  };

  const renderFormattedText = (text: string) => {
    const lines = text.split('\n');
    return (
      <div className="space-y-1.5 text-xs sm:text-[13px] text-left leading-relaxed">
        {lines.map((line, idx) => {
          if (!line.trim()) return <div key={idx} className="h-1" />;

          const isBullet = line.trim().startsWith('•') || line.trim().startsWith('-') || /^\d+\./.test(line.trim());
          const content = line.replace(/^[\s•-]+/, '').trim();

          return (
            <div key={idx} className={isBullet ? 'pl-1.5 text-slate-200' : ''}>
              {isBullet ? formatInlineBold(line.trim()) : formatInlineBold(content)}
            </div>
          );
        })}
      </div>
    );
  };

  const formatInlineBold = (str: string) => {
    const parts = str.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={i} className="text-white font-semibold">
            {part.slice(2, -2)}
          </strong>
        );
      }
      return part;
    });
  };

  return (
    <>
      {/* Botão Flutuante quando fechado (Framer White Pill) */}
      {!isOpen && (
        <button
          type="button"
          onClick={onOpen}
          className="fixed bottom-6 right-6 z-40 px-4 py-2.5 rounded-full bg-white hover:bg-neutral-200 text-black shadow-2xl flex items-center gap-2 transition-all duration-150 hover:scale-[1.02] active:scale-[0.98] cursor-pointer tracking-tight"
          title="Abrir Chat IA"
        >
          <Sparkles className="w-3.5 h-3.5 text-black" />
          <span className="text-xs font-semibold">Chat IA</span>
        </button>
      )}

      {/* Janela de Chat Framer Dark-Canvas */}
      {isOpen && (
        <div
          className="fixed bottom-6 right-6 z-50 w-full max-w-[400px] h-[540px] max-h-[82vh] rounded-[20px] bg-[#141414] border border-[#262626] shadow-2xl flex flex-col overflow-hidden text-left font-sans animate-in slide-in-from-bottom-2 duration-150"
          data-purpose="ai-assistant-chat"
        >
          {/* Header Minimalista */}
          <div className="px-4 py-3 bg-[#141414] border-b border-[#262626] flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-6 h-6 rounded-lg bg-[#1c1c1c] border border-[#262626] flex items-center justify-center text-white">
                <Bot className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="text-xs sm:text-sm font-medium tracking-tight text-white">Chat IA</span>
            </div>

            <div className="flex items-center gap-1">
              {messages.length > 1 && (
                <button
                  type="button"
                  onClick={() => setMessages([initialMessage])}
                  className="p-1.5 rounded-lg text-[#999999] hover:text-white hover:bg-[#1c1c1c] transition-colors cursor-pointer"
                  title="Limpar conversa"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}

              <button
                type="button"
                onClick={() => setShowKeyModal(!showKeyModal)}
                className="p-1.5 rounded-lg text-[#999999] hover:text-white hover:bg-[#1c1c1c] transition-colors cursor-pointer"
                title="Chave de API"
              >
                <Key className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-lg text-[#999999] hover:text-white hover:bg-[#1c1c1c] transition-colors cursor-pointer"
                title="Fechar"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Configuração Opcional de Chave */}
          {showKeyModal && (
            <div className="p-3.5 bg-[#1c1c1c] border-b border-[#262626] space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-white flex items-center gap-1.5 tracking-tight">
                  <KeyRound className="w-3.5 h-3.5 text-white" />
                  Chave da API Gemini
                </span>
                <button
                  type="button"
                  onClick={() => setShowKeyModal(false)}
                  className="text-[#999999] hover:text-white text-xs cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <form onSubmit={handleTestAndSaveKey} className="space-y-2">
                <input
                  type="password"
                  value={apiKeyInput}
                  onChange={e => setApiKeyInput(e.target.value)}
                  placeholder="Cole sua chave caso queira trocar..."
                  className="w-full px-3 py-1.5 rounded-lg bg-[#141414] border border-[#262626] text-white text-xs placeholder:text-[#999999] focus:outline-none focus:border-[#0099ff]"
                />
                <div className="flex items-center justify-between text-[11px]">
                  <a
                    href="https://aistudio.google.com/app/apikey"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#0099ff] hover:underline flex items-center gap-1"
                  >
                    <span>Google AI Studio</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                  <button
                    type="submit"
                    disabled={isTestingKey}
                    className="px-3 py-1 rounded-full bg-white hover:bg-neutral-200 text-black font-semibold text-xs cursor-pointer flex items-center gap-1"
                  >
                    <Check className="w-3 h-3 text-black" />
                    <span>{isTestingKey ? 'Testando...' : 'Salvar'}</span>
                  </button>
                </div>
                {keyFeedback && (
                  <p className={`text-[11px] ${keyFeedback.type === 'success' ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {keyFeedback.message}
                  </p>
                )}
              </form>
            </div>
          )}

          {/* Mensagens */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 text-xs select-text">
            {messages.map(msg => {
              const isAsst = msg.sender === 'assistant';

              return (
                <div key={msg.id} className={`flex ${isAsst ? 'justify-start' : 'justify-end'}`}>
                  <div
                    className={`max-w-[85%] rounded-[18px] px-3.5 py-2.5 space-y-2 ${
                      isAsst
                        ? 'bg-[#1c1c1c] border border-[#262626] text-white'
                        : 'bg-white text-black font-normal'
                    }`}
                  >
                    {isAsst ? (
                      renderFormattedText(msg.text)
                    ) : (
                      <p className="text-xs sm:text-[13px] text-black leading-relaxed">{msg.text}</p>
                    )}

                    {/* Confirmação compacta de alterações feitas no dashboard */}
                    {msg.actionsExecuted && msg.actionsExecuted.length > 0 && (
                      <div className="pt-1.5 border-t border-[#262626] flex flex-wrap gap-1.5">
                        {msg.actionsExecuted.map((act, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[11px] font-medium"
                          >
                            <Check className="w-3 h-3 shrink-0" />
                            <span>{act.title}</span>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {isProcessing && (
              <div className="flex justify-start">
                <div className="px-3.5 py-2 rounded-full bg-[#1c1c1c] border border-[#262626] text-[#999999] text-xs flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 animate-spin text-[#0099ff]" />
                  <span>Pensando...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Limpo */}
          <form
            onSubmit={e => handleSendMessage(e)}
            className="p-3 bg-[#141414] border-t border-[#262626] flex items-center gap-2 shrink-0"
          >
            <input
              type="text"
              value={inputMessage}
              onChange={e => setInputMessage(e.target.value)}
              placeholder="Converse, peça ideias ou altere o dashboard..."
              disabled={isProcessing}
              className="flex-1 px-4 py-2.5 rounded-full text-xs sm:text-[13px] bg-[#1c1c1c] border border-[#262626] text-white placeholder-[#999999] focus:outline-none focus:border-[#0099ff] focus:ring-1 focus:ring-[#0099ff] transition-all"
            />
            <button
              type="submit"
              disabled={!inputMessage.trim() || isProcessing}
              className="w-9 h-9 rounded-full bg-white hover:bg-neutral-200 disabled:opacity-40 disabled:cursor-not-allowed text-black transition-colors cursor-pointer shrink-0 flex items-center justify-center shadow-xs"
              title="Enviar"
            >
              <Send className="w-4 h-4 text-black" />
            </button>
          </form>
        </div>
      )}
    </>
  );
};
