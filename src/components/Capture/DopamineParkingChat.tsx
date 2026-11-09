import React, { useState, useRef, useEffect } from 'react';
import { 
  Lock, 
  Send, 
  Sparkles, 
  X, 
  ShieldCheck, 
  Bot, 
  User, 
  ExternalLink, 
  CheckCircle2, 
  Scissors, 
  Play, 
  Calendar, 
  PlusCircle,
  Zap,
  CornerDownLeft
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
  onToggleTask?: (taskId: string) => void;
  onSliceTask?: (taskId: string, microTasks: any[], mode: 'replace' | 'subtasks') => void;
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
  actionExecuted?: AssistantActionExecuted;
  suggestedPrompts?: string[];
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
  onToggleTask,
  onSliceTask,
  onParkIdea,
  onStartFocus,
  onNavigateTab,
  onNavigateToProjects,
  isDarkMode = true
}) => {
  const [inputMessage, setInputMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const initialWelcomeMessage: ChatMessage = {
    id: 'msg_welcome',
    sender: 'assistant',
    text: `Olá, **${userName}**! Sou seu Assistente Executivo e Copiloto de Foco.

Posso **conversar**, te ajudar a **planejar a semana/dia** ou **executar ações reais no sistema**:
• 📅 *Me ajude a planejar a semana*
• ➕ *Criar tarefa [X] no Littera ou Aura*
• 🎯 *Concluir tarefa [X]*
• ✂️ *Fatiar tarefa longa com IA*
• 🔒 *Tive uma ideia de negócio...* (salva no Estacionamento)

Como posso te ajudar agora?`,
    suggestedPrompts: [
      'Me ajude a planejar a semana',
      'O que focar hoje?',
      'Criar tarefa rápida',
      'Estacionar ideia [🔒]'
    ],
    timestamp: 'Agora'
  };

  const [messages, setMessages] = useState<ChatMessage[]>([initialWelcomeMessage]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (e?: React.FormEvent, customText?: string) => {
    if (e) e.preventDefault();
    const query = (customText || inputMessage).trim();
    if (!query || isProcessing) return;

    // 1. Mensagem do Usuário
    const userMsg: ChatMessage = {
      id: 'user_' + Date.now(),
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputMessage('');
    setIsProcessing(true);

    // 2. Processamento Inteligente do Assistente (Conversação + Execução no Sistema)
    setTimeout(async () => {
      const response = await processAssistantMessage(query, {
        userName,
        tasks,
        projects,
        activeProjects,
        parkedProjects,
        onAddTask: onAddTask || ((t) => ({ ...t, id: 'temp_' + Date.now(), created_at: new Date().toISOString() })),
        onToggleTask: onToggleTask || (() => {}),
        onSliceTask,
        onParkIdea,
        onStartFocus,
        onNavigateTab
      });

      const assistantReply: ChatMessage = {
        id: 'asst_' + Date.now(),
        sender: 'assistant',
        text: response.replyText,
        actionExecuted: response.actionExecuted,
        suggestedPrompts: response.suggestedPrompts,
        timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, assistantReply]);
      setIsProcessing(false);

      // Feedback visual especial quando uma ação for concluída
      if (response.actionExecuted?.type === 'task_completed' || response.actionExecuted?.type === 'task_created') {
        confetti({
          particleCount: 30,
          spread: 45,
          origin: { x: 0.85, y: 0.85 },
          colors: ['#315DFF', '#10B981', '#ffffff']
        });
      }
    }, 450);
  };

  const handleQuickPromptClick = (prompt: string) => {
    handleSendMessage(undefined, prompt);
  };

  // Renderizador simples de markdown para listas e negritos
  const renderFormattedText = (text: string) => {
    const lines = text.split('\n');

    return (
      <div className="space-y-1.5 text-xs text-left leading-relaxed">
        {lines.map((line, idx) => {
          if (!line.trim()) {
            return <div key={idx} className="h-1" />;
          }

          // Headers
          if (line.startsWith('### ')) {
            return (
              <h4 key={idx} className="text-sm font-bold text-white pt-1 pb-0.5">
                {line.replace('### ', '')}
              </h4>
            );
          }
          if (line.startsWith('#### ')) {
            return (
              <h5 key={idx} className="text-xs font-bold text-white pt-1">
                {line.replace('#### ', '')}
              </h5>
            );
          }

          // Divisores
          if (line.startsWith('---')) {
            return <div key={idx} className="border-t border-white/10 my-2" />;
          }

          // Bullets
          const isBullet = line.trim().startsWith('•') || line.trim().startsWith('-');
          const content = isBullet ? line.replace(/^[\s•-]+/, '').trim() : line;

          return (
            <div key={idx} className={`flex items-start gap-1.5 ${isBullet ? 'pl-2 text-slate-200' : ''}`}>
              {isBullet && <span className="text-white shrink-0 font-bold">•</span>}
              <span className="flex-1">
                {formatInlineBold(content)}
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  const formatInlineBold = (str: string) => {
    const parts = str.split(/(\*\*.*?\*\*|\*.*?\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="text-white font-bold">{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith('*') && part.endsWith('*')) {
        return <em key={i} className="text-slate-300 italic">{part.slice(1, -1)}</em>;
      }
      return part;
    });
  };

  return (
    <>
      {/* Botão Flutuante quando fechado */}
      {!isOpen && (
        <button
          type="button"
          onClick={onOpen}
          className="fixed bottom-6 right-6 z-40 px-4 py-3 rounded-2xl bg-[#101522] hover:bg-[#151D31] text-white border border-[#315DFF]/40 shadow-[0_8px_30px_rgba(49,93,255,0.25)] flex items-center gap-2.5 transition-all duration-200 hover:scale-[1.03] active:scale-[0.98] cursor-pointer group"
          title="Abrir Assistente IA & Copiloto"
        >
          <div className="w-8 h-8 rounded-xl bg-[#315DFF]/20 border border-[#315DFF]/40 flex items-center justify-center text-white group-hover:bg-[#315DFF] group-hover:text-white transition-colors">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="text-left">
            <div className="text-[11px] font-bold text-white flex items-center gap-1.5">
              <span>Assistente IA</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <p className="text-[10px] text-slate-300 font-medium">
              Copiloto & Estacionamento
            </p>
          </div>
        </button>
      )}

      {/* Painel Flutuante / Drawer Lateral do Assistente */}
      {isOpen && (
        <div 
          className="fixed bottom-6 right-6 z-50 w-full max-w-[440px] h-[620px] max-h-[88vh] rounded-3xl bg-[#101522] border border-white/15 shadow-[0_20px_60px_rgba(0,0,0,0.7)] flex flex-col overflow-hidden text-left font-sans animate-in slide-in-from-bottom-4 duration-200"
          data-purpose="ai-assistant-chat"
        >
          {/* Header do Assistente */}
          <div className="p-4 sm:p-5 bg-[#151D31] border-b border-white/10 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#315DFF] flex items-center justify-center text-white shadow-[0_2px_10px_rgba(49,93,255,0.4)]">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-white tracking-tight">
                    Assistente IA & Copiloto
                  </h3>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>ONLINE</span>
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 mt-0.5">
                  Conversas, ações no sistema e foco blindado
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              title="Fechar"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Banner de Status do Foco e Ideias Trancadas */}
          <div className="px-4 py-2 bg-[#17264E]/70 border-b border-white/10 flex items-center justify-between text-[11px] text-white">
            <span className="flex items-center gap-1.5 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-white" />
              Foco Atual ({activeProjects.length}/2 Ativos)
            </span>
            {onNavigateToProjects ? (
              <button
                type="button"
                onClick={() => {
                  onNavigateToProjects();
                  onClose();
                }}
                className="font-mono text-[10px] text-slate-200 hover:text-white flex items-center gap-1 cursor-pointer underline decoration-white/30"
              >
                <span>{parkedProjects.length} ideias trancadas 🔒</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </button>
            ) : (
              <span className="font-mono text-[10px] text-slate-200">
                {parkedProjects.length} trancadas 🔒
              </span>
            )}
          </div>

          {/* Área de Mensagens com Scroll */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs select-text">
            {messages.map((msg) => {
              const isAsst = msg.sender === 'assistant';

              return (
                <div
                  key={msg.id}
                  className={`flex gap-2.5 ${isAsst ? 'justify-start' : 'justify-end'}`}
                >
                  {isAsst && (
                    <div className="w-7 h-7 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center text-white shrink-0 mt-0.5">
                      <Bot className="w-3.5 h-3.5" />
                    </div>
                  )}

                  <div className={`max-w-[88%] rounded-2xl p-3.5 space-y-2.5 leading-relaxed ${
                    isAsst 
                      ? 'bg-[#151D31] border border-white/10 text-white shadow-sm' 
                      : 'bg-[#315DFF] text-white font-medium self-end shadow-sm'
                  }`}>
                    {/* Texto da mensagem */}
                    {isAsst ? renderFormattedText(msg.text) : <p className="text-xs">{msg.text}</p>}

                    {/* CARD DE AÇÃO EXECUTADA NO SISTEMA */}
                    {msg.actionExecuted && (
                      <div className="mt-2.5 p-3 rounded-xl bg-[#101522] border border-white/15 space-y-2 text-left animate-in fade-in duration-200">
                        {/* Header da Ação */}
                        <div className="flex items-center justify-between gap-2">
                          {msg.actionExecuted.type === 'task_created' && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                              <PlusCircle className="w-3 h-3" />
                              <span>TAREFA CRIADA NO SISTEMA</span>
                            </span>
                          )}

                          {msg.actionExecuted.type === 'task_completed' && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-200 border border-blue-500/40 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                              <span>TAREFA CONCLUÍDA</span>
                            </span>
                          )}

                          {msg.actionExecuted.type === 'task_sliced' && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-purple-500/20 text-purple-200 border border-purple-500/40 flex items-center gap-1">
                              <Scissors className="w-3 h-3" />
                              <span>FATIADA EM MICRO-AÇÕES</span>
                            </span>
                          )}

                          {msg.actionExecuted.type === 'idea_parked' && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 flex items-center gap-1">
                              <Lock className="w-2.5 h-2.5" />
                              <span>TRANCADO NO ESTACIONAMENTO</span>
                            </span>
                          )}

                          {msg.actionExecuted.type === 'focus_started' && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1">
                              <Play className="w-3 h-3 fill-current" />
                              <span>FOCO ATIVADO NO TIMER</span>
                            </span>
                          )}

                          {msg.actionExecuted.type === 'plan_ready' && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-white/10 text-white border border-white/20 flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              <span>PLANO ESTRATÉGICO</span>
                            </span>
                          )}
                        </div>

                        {/* Conteúdo da Ação */}
                        <div>
                          <h4 className="text-xs font-bold text-white">
                            {msg.actionExecuted.title}
                          </h4>
                          {msg.actionExecuted.description && (
                            <p className="text-[11px] text-slate-300 mt-0.5 leading-normal">
                              {msg.actionExecuted.description}
                            </p>
                          )}
                        </div>

                        {/* Micro-etapas quando fatiado */}
                        {msg.actionExecuted.type === 'task_sliced' && Array.isArray(msg.actionExecuted.details) && (
                          <div className="space-y-1 pt-1 border-t border-white/5">
                            {msg.actionExecuted.details.map((st: any, sIdx: number) => (
                              <div key={sIdx} className="text-[10px] text-slate-300 flex items-center justify-between">
                                <span>• {st.title}</span>
                                <span className="font-mono text-slate-400">{st.estimated_minutes}m</span>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Rodapé com atalho */}
                        <div className="pt-1.5 border-t border-white/10 flex items-center justify-between text-[10px] text-slate-300">
                          <span className="flex items-center gap-1">
                            <Zap className="w-3 h-3 text-white" />
                            Ação sincronizada com seu workspace
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Prompts Sugeridos Rápidos abaixo da mensagem */}
                    {isAsst && msg.suggestedPrompts && msg.suggestedPrompts.length > 0 && (
                      <div className="pt-1 flex flex-wrap gap-1.5">
                        {msg.suggestedPrompts.map((p, pIdx) => (
                          <button
                            key={pIdx}
                            type="button"
                            onClick={() => handleQuickPromptClick(p)}
                            className="px-2 py-1 rounded-lg bg-white/5 hover:bg-white/15 border border-white/10 text-[10px] font-medium text-slate-200 hover:text-white transition-colors cursor-pointer text-left"
                          >
                            + {p}
                          </button>
                        ))}
                      </div>
                    )}

                    <span className={`block text-[9px] font-mono mt-1 ${isAsst ? 'text-slate-400' : 'text-white/80 text-right'}`}>
                      {msg.timestamp}
                    </span>
                  </div>

                  {!isAsst && (
                    <div className="w-7 h-7 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center text-white shrink-0 mt-0.5">
                      <User className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>
              );
            })}

            {isProcessing && (
              <div className="flex items-center gap-2 text-[11px] text-white bg-[#151D31] border border-white/10 p-3 rounded-2xl w-fit">
                <Sparkles className="w-3.5 h-3.5 animate-spin text-white" />
                <span>Processando intenção e sincronizando ações no sistema...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Sugestões Rápidas de Ação */}
          <div className="px-4 py-2 border-t border-white/10 flex items-center gap-1.5 overflow-x-auto shrink-0 text-[10px] bg-[#151D31]/40">
            <span className="text-slate-400 shrink-0">Ações rápidas:</span>
            <button
              type="button"
              onClick={() => handleQuickPromptClick('Me ajude a planejar a semana')}
              className="px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-200 hover:text-white shrink-0 transition-colors cursor-pointer border border-white/10"
            >
              📅 Planejar semana
            </button>
            <button
              type="button"
              onClick={() => handleQuickPromptClick('O que focar hoje?')}
              className="px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-200 hover:text-white shrink-0 transition-colors cursor-pointer border border-white/10"
            >
              🎯 O que focar hoje?
            </button>
            <button
              type="button"
              onClick={() => handleQuickPromptClick('Criar tarefa no Littera: ')}
              className="px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-200 hover:text-white shrink-0 transition-colors cursor-pointer border border-white/10"
            >
              ➕ Criar tarefa
            </button>
            <button
              type="button"
              onClick={() => handleQuickPromptClick('Fatiar a tarefa mais longa')}
              className="px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-200 hover:text-white shrink-0 transition-colors cursor-pointer border border-white/10"
            >
              ✂️ Fatiar IA
            </button>
            <button
              type="button"
              onClick={() => handleQuickPromptClick('Tive uma ideia de: ')}
              className="px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-200 hover:text-white shrink-0 transition-colors cursor-pointer border border-white/10"
            >
              🔒 Estacionar ideia
            </button>
          </div>

          {/* Formulário de Envio */}
          <form 
            onSubmit={(e) => handleSendMessage(e)}
            className="p-3 sm:p-4 bg-[#151D31] border-t border-white/10 flex items-center gap-2 shrink-0"
          >
            <div className="relative flex-1">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Converse ou peça ações (ex: planejar a semana, criar tarefa...)"
                disabled={isProcessing}
                className="w-full pl-3.5 pr-9 py-2.5 rounded-xl text-xs bg-[#101522] border border-white/15 text-white placeholder-slate-400 focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition-all"
              />
              <button
                type="button"
                onClick={() => setInputMessage('Tive uma ideia de ')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-white transition-colors cursor-pointer"
                title="Atalho para descarrego no Estacionamento de Dopamina [🔒]"
              >
                <Lock className="w-3.5 h-3.5" />
              </button>
            </div>

            <button
              type="submit"
              disabled={!inputMessage.trim() || isProcessing}
              className="p-2.5 rounded-xl bg-[#315DFF] hover:bg-[#254ED9] disabled:opacity-40 disabled:cursor-not-allowed text-white transition-colors cursor-pointer shrink-0 shadow-sm"
              title="Enviar mensagem"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

        </div>
      )}
    </>
  );
};
