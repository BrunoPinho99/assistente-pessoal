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
  CornerDownLeft,
  KeyRound,
  Key,
  Check
} from 'lucide-react';
import { Project, ContextArea, Task, NavigationTab } from '../../types';
import { processAssistantMessage, AssistantActionExecuted } from '../../lib/assistantAgent';
import { playLockSnapSound } from '../../lib/audioSynthesizer';
import confetti from 'canvas-confetti';

interface PhysicalPadlockSealProps {
  title: string;
  description?: string;
  details?: any;
  onNavigateToProjects?: () => void;
}

/**
 * Componente Visual de Fechamento Físico do Cadeado (TDAH Focus Seal)
 * Executa a animação física de encaixe da haste de aço no corpo de titânio do cadeado,
 * reproduzindo o som mecânico de trava ("*CH-LACK*") via Web Audio API.
 * Proporciona fechamento psicológico instantâneo: a ideia está salva e segura no MongoDB,
 * cortando a compulsão de abandonar o Littera para começar a codar a nova ideia.
 */
export const PhysicalPadlockSeal: React.FC<PhysicalPadlockSealProps> = ({
  title,
  description,
  details,
  onNavigateToProjects
}) => {
  const [lockStage, setLockStage] = useState<'open' | 'snapping' | 'locked'>('open');
  const [pulseKey, setPulseKey] = useState(0);

  const triggerSnap = () => {
    setLockStage('open');
    setTimeout(() => {
      setLockStage('snapping');
      playLockSnapSound();
      setTimeout(() => {
        setLockStage('locked');
        setPulseKey(prev => prev + 1);
        confetti({
          particleCount: 28,
          spread: 45,
          origin: { x: 0.82, y: 0.8 },
          colors: ['#F43F5E', '#3B82F6', '#10B981', '#F59E0B']
        });
      }, 150);
    }, 280);
  };

  useEffect(() => {
    triggerSnap();
  }, []);

  const isLocked = lockStage === 'locked';
  const isSnapping = lockStage === 'snapping';
  const isOpen = lockStage === 'open';

  return (
    <div 
      className={`relative mt-2.5 p-3.5 rounded-2xl border transition-all duration-300 text-left overflow-hidden ${
        isLocked
          ? 'bg-gradient-to-b from-[#182035] to-[#0E1524] border-rose-500/50 shadow-[0_4px_24px_rgba(244,63,94,0.22)]'
          : 'bg-[#151D31] border-amber-500/40 shadow-[0_4px_20px_rgba(245,158,11,0.15)]'
      }`}
    >
      {/* Luz ambiente de fundo */}
      <div 
        className={`absolute -top-10 -right-10 w-28 h-28 rounded-full blur-2xl transition-opacity duration-500 pointer-events-none ${
          isLocked ? 'bg-rose-500/20 opacity-80' : 'bg-amber-500/20 opacity-100'
        }`} 
      />

      {/* Mecanismo do Cadeado Físico em SVG */}
      <div className="relative z-10 flex items-center gap-3.5">
        <div 
          onClick={triggerSnap}
          title="Clique para testar a trava física do cadeado"
          className="relative w-12 h-12 shrink-0 cursor-pointer flex items-center justify-center group"
        >
          {/* Brilho de impacto quando a trava engata */}
          <div 
            key={pulseKey}
            className={`absolute inset-0 rounded-2xl transition-all duration-300 ${
              isLocked ? 'scale-110 ring-2 ring-rose-400/60 bg-rose-500/10' : ''
            }`}
          />

          <svg 
            className={`w-11 h-11 transition-transform duration-200 ${
              isSnapping ? 'scale-90' : isLocked ? 'scale-100' : 'scale-95'
            }`} 
            viewBox="0 0 48 48" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient id="shackleMetal" x1="14" y1="4" x2="34" y2="24" gradientUnits="userSpaceOnUse">
                <stop stopColor={isLocked ? '#E2E8F0' : '#FEF08A'} />
                <stop offset="0.5" stopColor={isLocked ? '#94A3B8' : '#F59E0B'} />
                <stop offset="1" stopColor={isLocked ? '#475569' : '#B45309'} />
              </linearGradient>
              <linearGradient id="padlockBody" x1="8" y1="20" x2="40" y2="44" gradientUnits="userSpaceOnUse">
                <stop stopColor={isLocked ? '#1E293B' : '#27272A'} />
                <stop offset="0.6" stopColor={isLocked ? '#0F172A' : '#18181B'} />
                <stop offset="1" stopColor={isLocked ? '#020617' : '#09090B'} />
              </linearGradient>
            </defs>

            {/* Haste de Aço (Shackle) com Animação Física de Encaixe */}
            <g 
              style={{
                transformOrigin: '16px 22px',
                transition: 'transform 180ms cubic-bezier(0.34, 1.56, 0.64, 1)'
              }}
              className={
                isOpen
                  ? '-translate-y-2.5 -rotate-12'
                  : isSnapping
                  ? 'translate-y-0.5 scale-95'
                  : 'translate-y-0 rotate-0'
              }
            >
              <path
                d="M16 22V13C16 8.58172 19.5817 5 24 5C28.4183 5 32 8.58172 32 13V22"
                stroke="url(#shackleMetal)"
                strokeWidth="4.5"
                strokeLinecap="round"
              />
            </g>

            {/* Corpo Pesado de Metal do Cadeado */}
            <rect
              x="9"
              y="20"
              width="30"
              height="24"
              rx="6"
              fill="url(#padlockBody)"
              stroke={isLocked ? '#F43F5E' : '#F59E0B'}
              strokeWidth="1.8"
            />

            {/* Placa Metálica de Reforço */}
            <rect
              x="13"
              y="23"
              width="22"
              height="4"
              rx="2"
              fill={isLocked ? '#334155' : '#3F3F46'}
              opacity="0.85"
            />

            {/* Orifício da Chave com Brilho de Segurança */}
            <circle cx="24" cy="30" r="2.5" fill={isLocked ? '#F43F5E' : '#F59E0B'} />
            <path
              d="M22.5 31L21.5 37H26.5L25.5 31H22.5Z"
              fill={isLocked ? '#F43F5E' : '#F59E0B'}
            />
          </svg>
        </div>

        {/* Textos de Identificação */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span 
              className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono tracking-wider flex items-center gap-1 transition-colors duration-200 border ${
                isLocked 
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/40' 
                  : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
              }`}
            >
              <Lock className="w-2.5 h-2.5 shrink-0" />
              <span>{isLocked ? 'CADEADO FECHADO [🔒]' : 'ENGASTANDO TRAVA...'}</span>
            </span>

            {isLocked && (
              <span className="text-[9px] text-emerald-400 font-mono font-semibold flex items-center gap-0.5">
                <span>✓ Salvo no Mongo</span>
              </span>
            )}
          </div>

          <h4 className="text-xs font-bold text-white mt-1 truncate">
            {title}
          </h4>
        </div>
      </div>

      {/* Alívio Cognitivo TDAH & Proteção de Foco */}
      <div className="relative z-10 mt-3 pt-2.5 border-t border-white/10 space-y-1.5 text-[11px]">
        <div className="flex items-start gap-1.5 text-emerald-300">
          <span className="text-emerald-400 font-bold shrink-0">🔒</span>
          <p className="leading-tight font-semibold">
            Ideia estruturada e trancada no arquivo morto. Foco mantido nos projetos ativos.
          </p>
        </div>

        <div className="flex items-start gap-1.5 text-slate-300 text-[10px]">
          <span className="shrink-0 font-bold text-rose-400">🛡️</span>
          <p className="leading-tight">
            <strong>Cofre Ativo:</strong> A ideia está salva no MongoDB com <code>isLocked: true</code>. Seu cérebro pode relaxar e manter a atenção plena em execução.
          </p>
        </div>

        {details?.unlockConditions && details.unlockConditions.length > 0 && (
          <div className="mt-1 p-2 rounded-lg bg-black/40 border border-white/10 text-[10px] text-amber-200/90">
            <span className="font-semibold block text-[9px] uppercase tracking-wider text-amber-300/80">
              Desbloqueio futuro condicionado a:
            </span>
            <p className="truncate mt-0.5">
              • {details.unlockConditions[0]}
            </p>
          </div>
        )}
      </div>

      {/* Rodapé Interativo */}
      <div className="relative z-10 mt-2 pt-2 border-t border-white/5 flex items-center justify-between">
        <button
          type="button"
          onClick={triggerSnap}
          className="text-[10px] text-slate-400 hover:text-white transition-colors cursor-pointer flex items-center gap-1"
          title="Ouvir e rever a trava física"
        >
          <span>Testar trava [🔒]</span>
        </button>

        {onNavigateToProjects && (
          <button
            type="button"
            onClick={onNavigateToProjects}
            className="text-[10px] text-[#4D8DFF] hover:text-white transition-colors cursor-pointer flex items-center gap-1 underline decoration-[#4D8DFF]/40"
          >
            <span>Ver no Estacionamento</span>
            <ExternalLink className="w-2.5 h-2.5" />
          </button>
        )}
      </div>
    </div>
  );
};

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
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState(() => {
    return localStorage.getItem('personal_os_gemini_key') || localStorage.getItem('personal_os_ai_key') || '';
  });
  const [keySaved, setKeySaved] = useState(() => {
    return Boolean(localStorage.getItem('personal_os_gemini_key') || localStorage.getItem('personal_os_ai_key'));
  });
  const [isTestingKey, setIsTestingKey] = useState(false);
  const [keyFeedback, setKeyFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleTestAndSaveKey = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const key = apiKeyInput.trim();
    if (!key) {
      setKeyFeedback({ type: 'error', message: 'Por favor, insira uma chave de API válida.' });
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
        setKeySaved(true);
        setKeyFeedback({ type: 'success', message: 'IA Generativa conectada com sucesso (Gemini 1.5 Flash)!' });
        setTimeout(() => setShowKeyModal(false), 1500);
      } else {
        setKeyFeedback({ type: 'error', message: data.error || 'Chave inválida. Verifique e tente novamente.' });
      }
    } catch (err: any) {
      setKeyFeedback({ type: 'error', message: 'Erro ao conectar à API. Verifique sua conexão.' });
    } finally {
      setIsTestingKey(false);
    }
  };

  const initialWelcomeMessage: ChatMessage = {
    id: 'msg_welcome',
    sender: 'assistant',
    text: `Olá, **${userName}**! Sou seu Assistente Executivo e Copiloto com **Inteligência Artificial Generativa**.

Estou conectado aos seus projetos (**${activeProjects.map(p => p.title).join(' e ') || 'Littera e Aura'}**) e ao seu backlog de tarefas.

Podemos conversar naturalmente sobre:
• 🧠 Estratégias e tomada de decisão para suas empresas
• 📅 Planejamento semanal ou descompressão de rotina
• 🎯 Fatiamento de tarefas complexas em micro-passos
• 🔒 Estruturação de novas ideias no Estacionamento de Dopamina

Como posso te ajudar agora?`,
    suggestedPrompts: [
      'O que focar hoje no Littera?',
      'Me ajude a planejar a semana',
      'Como não procrastinar na tarefa atual?',
      'Estacionar nova ideia [🔒]'
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

    // Se o usuário clicar em prompt de configurar chave
    if (query.toLowerCase().includes('configurar') && query.toLowerCase().includes('chave')) {
      setShowKeyModal(true);
      return;
    }

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

    // 2. Processamento com IA Generativa Real (passando histórico conversacional)
    try {
      const historyPayload = messages.slice(-8).map(m => ({
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

      // Feedback visual se executou ação
      if (response.actionExecuted?.type === 'task_completed' || response.actionExecuted?.type === 'task_created') {
        confetti({
          particleCount: 30,
          spread: 45,
          origin: { x: 0.85, y: 0.85 },
          colors: ['#315DFF', '#10B981', '#ffffff']
        });
      }
    } catch (err: any) {
      setMessages(prev => [
        ...prev,
        {
          id: 'asst_err_' + Date.now(),
          sender: 'assistant',
          text: 'Ocorreu uma oscilação na resposta da IA generativa. Por favor, tente enviar novamente.',
          timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsProcessing(false);
    }
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
                  {keySaved ? (
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      <span>IA GENERATIVA</span>
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setShowKeyModal(true)}
                      className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30 transition cursor-pointer flex items-center gap-1"
                    >
                      <Key className="w-2.5 h-2.5" />
                      <span>CONFIGURAR IA</span>
                    </button>
                  )}
                </div>
                <p className="text-[11px] text-slate-300 mt-0.5">
                  {keySaved ? 'Google Gemini Generativo conectado' : 'Conversação executiva & blindagem de foco'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setShowKeyModal(!showKeyModal)}
                className={`p-1.5 rounded-xl transition-colors cursor-pointer border ${
                  keySaved
                    ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20 hover:bg-emerald-500/20'
                    : 'text-amber-300 bg-amber-500/10 border-amber-500/20 hover:bg-amber-500/20'
                }`}
                title={keySaved ? 'Chave de IA configurada (Clique para alterar)' : 'Configurar chave de IA generativa'}
              >
                <Key className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                title="Fechar"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Drawer / Painel de Configuração da Chave de IA Generativa */}
          {showKeyModal && (
            <div className="p-4 bg-[#141C2E] border-b border-white/15 animate-in slide-in-from-top-2 duration-150 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                  <KeyRound className="w-4 h-4 text-[#315DFF]" />
                  <span>Configurar Inteligência Artificial Generativa</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowKeyModal(false)}
                  className="text-slate-400 hover:text-white text-xs cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <p className="text-[11px] text-slate-300 leading-relaxed">
                Para conversar com IA Generativa real (sem respostas pré-definidas), insira sua chave gratuita do Google Gemini (ou OpenAI).
              </p>

              <form onSubmit={handleTestAndSaveKey} className="space-y-2.5">
                <div className="relative">
                  <input
                    type="password"
                    value={apiKeyInput}
                    onChange={(e) => setApiKeyInput(e.target.value)}
                    placeholder="Cole sua chave: AIzaSy... ou sk-..."
                    className="w-full px-3 py-2 rounded-xl bg-[#0B101D] border border-white/20 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-[#315DFF]"
                  />
                </div>

                <div className="flex items-center justify-between text-[11px]">
                  <a
                    href="https://aistudio.google.com/app/apikey"
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-400 hover:text-blue-300 flex items-center gap-1 underline decoration-blue-500/40"
                  >
                    <span>Obter chave gratuita no Google AI Studio</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>

                  <button
                    type="submit"
                    disabled={isTestingKey}
                    className="px-3 py-1.5 rounded-lg bg-[#315DFF] hover:bg-[#254BE0] disabled:opacity-50 text-white font-semibold text-xs transition cursor-pointer flex items-center gap-1.5"
                  >
                    {isTestingKey ? (
                      <span>Validando...</span>
                    ) : (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Salvar Chave</span>
                      </>
                    )}
                  </button>
                </div>

                {keyFeedback && (
                  <div className={`p-2 rounded-lg text-[11px] font-medium ${
                    keyFeedback.type === 'success' 
                      ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30' 
                      : 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                  }`}>
                    {keyFeedback.message}
                  </div>
                )}
              </form>
            </div>
          )}

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
                    {msg.actionExecuted && msg.actionExecuted.type === 'idea_parked' ? (
                      <PhysicalPadlockSeal
                        title={msg.actionExecuted.title}
                        description={msg.actionExecuted.description}
                        details={msg.actionExecuted.details}
                        onNavigateToProjects={onNavigateToProjects}
                      />
                    ) : msg.actionExecuted ? (
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
                    ) : null}

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
