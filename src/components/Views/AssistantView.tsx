import React, { useState } from 'react';
import { 
  Bot, 
  Send, 
  Sparkles, 
  Zap, 
  Compass, 
  Calendar, 
  ShieldAlert, 
  RotateCw,
  Play,
  Layers,
  ArrowRight
} from 'lucide-react';
import { Task, Project, StudySubject, Habit, AIMessage } from '../../types';
import { AIAssistantService } from '../../lib/aiAssistant';

interface AssistantViewProps {
  tasks: Task[];
  projects: Project[];
  subjects: StudySubject[];
  habits: Habit[];
  onStartFocus: (task: Task) => void;
  onOpenLostHelp: () => void;
  onOpenEmergencyTriage: () => void;
  onNavigateTab: (tab: any) => void;
}

export const AssistantView: React.FC<AssistantViewProps> = ({
  tasks,
  projects,
  subjects,
  habits,
  onStartFocus,
  onOpenLostHelp,
  onOpenEmergencyTriage,
  onNavigateTab
}) => {
  const [inputPrompt, setInputPrompt] = useState('');
  const [messages, setMessages] = useState<AIMessage[]>([
    {
      id: 'msg_initial',
      sender: 'assistant',
      timestamp: new Date().toISOString(),
      content: `Olá, Alex! Sou o seu **Copiloto Executivo do Personal OS**.

Tenho acesso aos seus **${tasks.filter(t => t.status !== 'concluido').length} itens pendentes**, **${projects.filter(p => p.status === 'ativo').length} projetos ativos** e suas matérias de estudo.

Diferente de um assistente genérico, meu trabalho aqui é **reduzir atrito, fatiar tarefas difíceis e evitar que você fique sobrecarregado(a)**.

Como posso te ajudar agora?`,
      actions: [
        { label: '🎯 Planejar meu dia', action_type: 'plan_day' },
        { label: '✂️ Fatiar tarefa difícil', action_type: 'break_task' },
        { label: '🆘 Estou perdido(a)', action_type: 'emergency_triage' },
        { label: '📊 Revisão semanal', action_type: 'weekly_review' }
      ]
    }
  ]);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSend = async (textToSend: string) => {
    const prompt = textToSend.trim();
    if (!prompt) return;

    const userMsg: AIMessage = {
      id: 'user_' + Date.now(),
      sender: 'user',
      content: prompt,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputPrompt('');
    setIsProcessing(true);

    try {
      const response = await AIAssistantService.processUserQuery(prompt, {
        tasks,
        projects,
        subjects,
        habits
      });
      setMessages(prev => [...prev, response]);
    } catch (e) {
      setMessages(prev => [
        ...prev,
        {
          id: 'err_' + Date.now(),
          sender: 'assistant',
          timestamp: new Date().toISOString(),
          content: 'Desculpe, ocorreu uma instabilidade momentânea no processamento contextual. Tente novamente em alguns segundos.'
        }
      ]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleActionClick = (action: any) => {
    if (action.action_type === 'emergency_triage') {
      onOpenEmergencyTriage();
    } else if (action.action_type === 'plan_day') {
      onNavigateTab('hoje');
    } else if (action.action_type === 'start_focus' && action.payload) {
      onStartFocus(action.payload);
    } else if (action.action_type === 'weekly_review') {
      onNavigateTab('insights');
    } else if (action.action_type === 'break_task') {
      handleSend('Como fatiar essa tarefa em micropassos de 5 minutos?');
    }
  };

  return (
    <div className="space-y-4 text-left max-w-3xl mx-auto" data-purpose="assistant-view">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-50">
              Assistente IA — Copiloto Executivo TDAH
            </h2>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
              Planejamento realista, fatiamento de objetivos e apoio na paralisia decisória.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onOpenLostHelp}
          className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900 flex items-center gap-1 cursor-pointer"
        >
          <Compass className="w-3.5 h-3.5" />
          <span>Socorro Imediato</span>
        </button>
      </div>

      {/* Sugestões Rápidas de Prompt */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
        <button
          type="button"
          onClick={() => handleSend('Planeje meu dia de forma realista sem me sobrecarregar')}
          className="px-2.5 py-1 rounded-md bg-zinc-100 dark:bg-zinc-800 hover:bg-blue-50 dark:hover:bg-blue-950/60 text-zinc-700 dark:text-zinc-300 hover:text-blue-600 transition-colors whitespace-nowrap cursor-pointer"
        >
          🎯 Planejar meu dia
        </button>
        <button
          type="button"
          onClick={() => handleSend('Estou com paralisia e não sei o que fazer agora')}
          className="px-2.5 py-1 rounded-md bg-zinc-100 dark:bg-zinc-800 hover:bg-rose-50 dark:hover:bg-rose-950/60 text-zinc-700 dark:text-zinc-300 hover:text-rose-600 transition-colors whitespace-nowrap cursor-pointer"
        >
          🆘 Estou perdido(a)
        </button>
        <button
          type="button"
          onClick={() => handleSend('Fatie minha tarefa mais difícil em passos de 5 minutos')}
          className="px-2.5 py-1 rounded-md bg-zinc-100 dark:bg-zinc-800 hover:bg-amber-50 dark:hover:bg-amber-950/60 text-zinc-700 dark:text-zinc-300 hover:text-amber-600 transition-colors whitespace-nowrap cursor-pointer"
        >
          ✂️ Fatiar tarefa difícil
        </button>
        <button
          type="button"
          onClick={() => handleSend('Faça uma revisão semanal com foco em consistência e aprendizado')}
          className="px-2.5 py-1 rounded-md bg-zinc-100 dark:bg-zinc-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 text-zinc-700 dark:text-zinc-300 hover:text-emerald-600 transition-colors whitespace-nowrap cursor-pointer"
        >
          📊 Revisão da semana
        </button>
      </div>

      {/* Histórico de Mensagens */}
      <div className="space-y-3.5 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 min-h-[420px] max-h-[520px] overflow-y-auto">
        {messages.map(msg => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`p-3.5 rounded-xl text-xs sm:text-sm leading-relaxed max-w-xl ${
                msg.sender === 'user'
                  ? 'bg-blue-600 text-white rounded-br-none'
                  : 'bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 rounded-bl-none whitespace-pre-wrap'
              }`}
            >
              {msg.content}
            </div>

            {/* Ações interativas embutidas na mensagem da IA */}
            {msg.actions && msg.actions.length > 0 && (
              <div className="flex items-center gap-1.5 flex-wrap mt-2">
                {msg.actions.map((act, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleActionClick(act)}
                    className="px-2.5 py-1 rounded-md text-xs font-semibold bg-blue-50 dark:bg-blue-950/70 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <span>{act.label}</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}

        {isProcessing && (
          <div className="flex items-center gap-2 text-xs text-zinc-400 p-2">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            <span>Consultando contexto do seu Personal OS...</span>
          </div>
        )}
      </div>

      {/* Barra de Entrada de Mensagem */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend(inputPrompt);
        }}
        className="flex gap-2"
      >
        <input
          type="text"
          value={inputPrompt}
          onChange={(e) => setInputPrompt(e.target.value)}
          placeholder="Ex: Como posso avançar no projeto do artigo hoje?"
          className="flex-1 px-3.5 py-2 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40"
        />
        <button
          type="submit"
          disabled={!inputPrompt.trim() || isProcessing}
          className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
        >
          <Send className="w-3.5 h-3.5" />
          <span>Enviar</span>
        </button>
      </form>
    </div>
  );
};

