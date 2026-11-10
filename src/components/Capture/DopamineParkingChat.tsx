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
  ExternalLink,
  Mic,
  Square,
  Paperclip,
  Radio
} from 'lucide-react';
import { Project, ContextArea, Task, NavigationTab } from '../../types';
import { processAssistantMessage, AssistantActionExecuted } from '../../lib/assistantAgent';
import { AudioRecorderService, RecordedAudioData } from '../../lib/audioRecorder';
import { AudioMessagePlayer } from '../Common/AudioMessagePlayer';
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
  audioUrl?: string;
  audioDuration?: number;
  isAudio?: boolean;
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
  onNavigateTab,
  isDarkMode = true
}) => {
  const [inputMessage, setInputMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState(() => {
    return localStorage.getItem('personal_os_gemini_key') || localStorage.getItem('personal_os_ai_key') || '';
  });
  const [isTestingKey, setIsTestingKey] = useState(false);
  const [keyFeedback, setKeyFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Estados de Gravação e Áudio
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [liveTranscript, setLiveTranscript] = useState('');
  const audioRecorderRef = useRef<AudioRecorderService | null>(null);
  const recordingTimerRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const initialMessage: ChatMessage = {
    id: 'msg_welcome',
    sender: 'assistant',
    text: `Oi, ${userName}! Sobre o que você quer conversar, ter ideias ou alterar no dashboard agora? Você também pode me mandar um áudio gravado que eu interpreto sua tarefa! 🎙️`,
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

  useEffect(() => {
    return () => {
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
      if (audioRecorderRef.current) audioRecorderRef.current.cancelRecording();
    };
  }, []);

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

  const startRecordingAudio = async () => {
    try {
      const recorder = new AudioRecorderService();
      audioRecorderRef.current = recorder;
      setLiveTranscript('');
      setRecordingDuration(0);
      setIsRecording(true);

      await recorder.startRecording((transcript) => {
        setLiveTranscript(transcript);
      });

      recordingTimerRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
    } catch (err: any) {
      console.error('Erro ao acessar microfone:', err);
      setIsRecording(false);
      alert('Não foi possível acessar o microfone. Verifique as permissões de áudio no seu navegador.');
    }
  };

  const cancelRecordingAudio = () => {
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }
    if (audioRecorderRef.current) {
      audioRecorderRef.current.cancelRecording();
      audioRecorderRef.current = null;
    }
    setIsRecording(false);
    setRecordingDuration(0);
    setLiveTranscript('');
  };

  const stopAndSendAudio = async () => {
    if (!audioRecorderRef.current) return;
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }

    try {
      setIsRecording(false);
      setIsProcessing(true);

      const audioData = await audioRecorderRef.current.stopRecording();
      audioRecorderRef.current = null;

      await handleProcessAudioMessage(audioData);
    } catch (err) {
      console.error('Erro ao parar gravação:', err);
      setIsProcessing(false);
    }
  };

  const handleAudioFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsProcessing(true);
      const audioData = await AudioRecorderService.processAudioFile(file);
      await handleProcessAudioMessage(audioData);
    } catch (err) {
      console.error('Erro ao processar arquivo de áudio:', err);
      setIsProcessing(false);
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleProcessAudioMessage = async (audioData: RecordedAudioData) => {
    const transcriptText = audioData.transcript || liveTranscript || '';
    setLiveTranscript('');

    const userMsg: ChatMessage = {
      id: 'user_audio_' + Date.now(),
      sender: 'user',
      text: transcriptText ? `🎙️ "${transcriptText}"` : '🎙️ Áudio enviado',
      audioUrl: audioData.audioUrl,
      audioDuration: audioData.durationSeconds,
      isAudio: true,
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setIsProcessing(true);

    try {
      const historyPayload = messages
        .filter(m => m.id !== 'msg_welcome')
        .slice(-10)
        .map(m => ({
          role: m.sender === 'user' ? ('user' as const) : ('model' as const),
          text: m.text
        }));

      const promptText = transcriptText.trim() || 'Mensagem de áudio';

      const response = await processAssistantMessage(promptText, {
        userName,
        tasks,
        projects,
        activeProjects,
        parkedProjects,
        history: historyPayload,
        audio: {
          data: audioData.base64,
          mimeType: audioData.mimeType,
          transcript: transcriptText
        },
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
          particleCount: 25,
          spread: 45,
          origin: { x: 0.85, y: 0.85 }
        });
      }
    } catch {
      setMessages(prev => [
        ...prev,
        {
          id: 'err_' + Date.now(),
          sender: 'assistant',
          text: 'Tive um contratempo ao analisar seu áudio. Pode tentar gravar novamente ou digitar?',
          timestamp: 'Agora'
        }
      ]);
    } finally {
      setIsProcessing(false);
    }
  };

  const formatRecordingTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
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
            <div key={idx} className={isBullet ? 'pl-1.5' : ''}>
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
          <strong key={i} className="font-semibold">
            {part.slice(2, -2)}
          </strong>
        );
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
          className={`fixed bottom-6 right-6 z-40 px-4 py-2.5 rounded-full shadow-2xl flex items-center gap-2 transition-all duration-150 hover:scale-[1.02] active:scale-[0.98] cursor-pointer tracking-[-0.14px] ${
            isDarkMode
              ? 'bg-[#ffffff] hover:bg-[#f0f0f0] text-[#000000]'
              : 'bg-[#090909] hover:bg-[#222222] text-[#ffffff]'
          }`}
          title="Abrir Chat IA"
        >
          <Sparkles className="w-3.5 h-3.5 text-[#0099ff]" />
          <span className="text-[13px] font-medium">Chat IA</span>
        </button>
      )}

      {/* Janela de Chat Dual-Canvas */}
      {isOpen && (
        <div
          className={`fixed bottom-6 right-6 z-50 w-full max-w-[400px] h-[540px] max-h-[82vh] rounded-[20px] border shadow-2xl flex flex-col overflow-hidden text-left font-sans animate-in slide-in-from-bottom-2 duration-150 ${
            isDarkMode
              ? 'bg-[#141414] border-[#262626] text-[#ffffff]'
              : 'bg-[#ffffff] border-[#e4e4e7] text-[#090909]'
          }`}
          data-purpose="ai-assistant-chat"
        >
          {/* Header Minimalista */}
          <div
            className={`px-4 py-3 border-b flex items-center justify-between shrink-0 ${
              isDarkMode
                ? 'bg-[#141414] border-[#262626]'
                : 'bg-[#ffffff] border-[#e4e4e7]'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <div
                className={`w-6 h-6 rounded-[6px] border flex items-center justify-center ${
                  isDarkMode
                    ? 'bg-[#1c1c1c] border-[#262626] text-[#ffffff]'
                    : 'bg-[#f7f7f8] border-[#e4e4e7] text-[#090909]'
                }`}
              >
                <Bot className="w-3.5 h-3.5 text-[#0099ff]" />
              </div>
              <span className="text-[14px] font-medium tracking-[-0.14px]">Chat IA</span>
            </div>

            <div className="flex items-center gap-1">
              {messages.length > 1 && (
                <button
                  type="button"
                  onClick={() => setMessages([initialMessage])}
                  className={`p-1.5 rounded-full transition-colors cursor-pointer ${
                    isDarkMode
                      ? 'text-[#999999] hover:text-[#ffffff] hover:bg-[#1c1c1c]'
                      : 'text-[#666666] hover:text-[#090909] hover:bg-[#efefef]'
                  }`}
                  title="Limpar conversa"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}

              <button
                type="button"
                onClick={() => setShowKeyModal(!showKeyModal)}
                className={`p-1.5 rounded-full transition-colors cursor-pointer ${
                  isDarkMode
                    ? 'text-[#999999] hover:text-[#ffffff] hover:bg-[#1c1c1c]'
                    : 'text-[#666666] hover:text-[#090909] hover:bg-[#efefef]'
                }`}
                title="Chave de API"
              >
                <Key className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={onClose}
                className={`p-1.5 rounded-full transition-colors cursor-pointer ${
                  isDarkMode
                    ? 'text-[#999999] hover:text-[#ffffff] hover:bg-[#1c1c1c]'
                    : 'text-[#666666] hover:text-[#090909] hover:bg-[#efefef]'
                }`}
                title="Fechar"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Configuração Opcional de Chave */}
          {showKeyModal && (
            <div
              className={`p-3.5 border-b space-y-2.5 ${
                isDarkMode
                  ? 'bg-[#1c1c1c] border-[#262626]'
                  : 'bg-[#f7f7f8] border-[#e4e4e7]'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium flex items-center gap-1.5 tracking-tight">
                  <KeyRound className="w-3.5 h-3.5 text-[#0099ff]" />
                  Chave da API Gemini
                </span>
                <button
                  type="button"
                  onClick={() => setShowKeyModal(false)}
                  className="text-[#999999] hover:text-[#0099ff] text-xs cursor-pointer"
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
                  className={`w-full px-3 py-1.5 rounded-[8px] border text-xs focus:outline-none focus:border-[#0099ff] ${
                    isDarkMode
                      ? 'bg-[#141414] border-[#262626] text-[#ffffff] placeholder:text-[#999999]'
                      : 'bg-[#ffffff] border-[#e4e4e7] text-[#090909] placeholder:text-[#666666]'
                  }`}
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
                    className={`px-3 py-1 rounded-full font-medium text-xs cursor-pointer flex items-center gap-1 ${
                      isDarkMode
                        ? 'bg-[#ffffff] text-[#000000] hover:bg-[#f0f0f0]'
                        : 'bg-[#090909] text-[#ffffff] hover:bg-[#222222]'
                    }`}
                  >
                    <Check className="w-3 h-3" />
                    <span>{isTestingKey ? 'Testando...' : 'Salvar'}</span>
                  </button>
                </div>
                {keyFeedback && (
                  <p className={`text-[11px] ${keyFeedback.type === 'success' ? 'text-[#22c55e]' : 'text-[#ff5577]'}`}>
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
                        ? isDarkMode
                          ? 'bg-[#1c1c1c] border border-[#262626] text-[#ffffff]'
                          : 'bg-[#f7f7f8] border border-[#e4e4e7] text-[#090909]'
                        : isDarkMode
                          ? 'bg-[#ffffff] text-[#000000] font-normal'
                          : 'bg-[#090909] text-[#ffffff] font-normal'
                    }`}
                  >
                    {msg.audioUrl && (
                      <div className="mb-2">
                        <AudioMessagePlayer
                          audioUrl={msg.audioUrl}
                          durationSeconds={msg.audioDuration}
                          isDarkMode={isDarkMode}
                        />
                      </div>
                    )}

                    {isAsst ? (
                      renderFormattedText(msg.text)
                    ) : (
                      <p className="text-xs sm:text-[13px] leading-relaxed">{msg.text}</p>
                    )}

                    {msg.actionsExecuted && msg.actionsExecuted.length > 0 && (
                      <div
                        className={`pt-1.5 border-t flex flex-wrap gap-1.5 ${
                          isDarkMode ? 'border-[#262626]' : 'border-[#e4e4e7]'
                        }`}
                      >
                        {msg.actionsExecuted.map((act, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#22c55e]/15 border border-[#22c55e]/30 text-[#16a34a] dark:text-[#22c55e] text-[11px] font-medium"
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
                <div
                  className={`px-3.5 py-2 rounded-full border text-xs flex items-center gap-2 ${
                    isDarkMode
                      ? 'bg-[#1c1c1c] border-[#262626] text-[#999999]'
                      : 'bg-[#f7f7f8] border-[#e4e4e7] text-[#666666]'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 animate-spin text-[#0099ff]" />
                  <span>Pensando...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Barra de Gravação de Áudio ao Vivo ou Input */}
          {isRecording ? (
            <div
              className={`p-3 border-t flex items-center justify-between gap-3 shrink-0 animate-in fade-in duration-150 ${
                isDarkMode ? 'bg-[#1a1414] border-[#3b2020]' : 'bg-[#fff5f5] border-[#fecaca]'
              }`}
            >
              <div className="flex items-center gap-2.5 flex-1 min-w-0">
                <span className="relative flex h-3 w-3 shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500" />
                </span>

                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-semibold text-rose-600 dark:text-rose-400 font-mono tracking-wider">
                    {formatRecordingTime(recordingDuration)}
                  </span>
                  <span className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate">
                    {liveTranscript ? `"${liveTranscript}"` : 'Gravando áudio... fale a tarefa'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={cancelRecordingAudio}
                  className={`p-2 rounded-full transition-colors cursor-pointer ${
                    isDarkMode
                      ? 'text-[#999999] hover:text-rose-400 hover:bg-[#262626]'
                      : 'text-[#666666] hover:text-rose-600 hover:bg-[#efefef]'
                  }`}
                  title="Cancelar gravação"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={stopAndSendAudio}
                  className="px-3.5 py-1.5 rounded-full bg-[#0099ff] hover:bg-[#0088ee] text-white font-medium text-xs flex items-center gap-1.5 shadow-md transition-all active:scale-95 cursor-pointer"
                  title="Concluir e enviar áudio"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Enviar</span>
                </button>
              </div>
            </div>
          ) : (
            <form
              onSubmit={e => handleSendMessage(e)}
              className={`p-2.5 sm:p-3 border-t flex items-center gap-2 shrink-0 ${
                isDarkMode
                  ? 'bg-[#141414] border-[#262626]'
                  : 'bg-[#ffffff] border-[#e4e4e7]'
              }`}
            >
              {/* Input oculto para carregar arquivo de áudio */}
              <input
                ref={fileInputRef}
                type="file"
                accept="audio/*"
                onChange={handleAudioFileUpload}
                className="hidden"
              />

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isProcessing}
                className={`p-2 rounded-full transition-colors cursor-pointer shrink-0 disabled:opacity-40 ${
                  isDarkMode
                    ? 'text-[#999999] hover:text-[#ffffff] hover:bg-[#1c1c1c]'
                    : 'text-[#666666] hover:text-[#090909] hover:bg-[#efefef]'
                }`}
                title="Anexar arquivo de áudio"
              >
                <Paperclip className="w-4 h-4" />
              </button>

              <input
                type="text"
                value={inputMessage}
                onChange={e => setInputMessage(e.target.value)}
                placeholder="Fale no microfone ou digite..."
                disabled={isProcessing}
                className={`flex-1 px-3.5 py-2 rounded-full text-xs sm:text-[13px] border focus:outline-none focus:border-[#0099ff] focus:ring-1 focus:ring-[#0099ff] transition-all ${
                  isDarkMode
                    ? 'bg-[#1c1c1c] border-[#262626] text-[#ffffff] placeholder-[#999999]'
                    : 'bg-[#f7f7f8] border-[#e4e4e7] text-[#090909] placeholder-[#666666]'
                }`}
              />

              {/* Botão de Gravar Áudio */}
              <button
                type="button"
                onClick={startRecordingAudio}
                disabled={isProcessing}
                className={`w-9 h-9 rounded-full transition-all shrink-0 flex items-center justify-center cursor-pointer active:scale-95 disabled:opacity-40 ${
                  isDarkMode
                    ? 'bg-[#1c1c1c] border border-[#262626] text-[#0099ff] hover:bg-[#262626] hover:text-[#38bdf8]'
                    : 'bg-[#f7f7f8] border border-[#e4e4e7] text-[#0099ff] hover:bg-[#ebebeb]'
                }`}
                title="Gravar áudio da tarefa"
              >
                <Mic className="w-4 h-4" />
              </button>

              {/* Botão de Enviar Mensagem */}
              <button
                type="submit"
                disabled={!inputMessage.trim() || isProcessing}
                className={`w-9 h-9 rounded-full disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer shrink-0 flex items-center justify-center ${
                  isDarkMode
                    ? 'bg-[#ffffff] hover:bg-[#f0f0f0] text-[#000000]'
                    : 'bg-[#090909] hover:bg-[#222222] text-[#ffffff]'
                }`}
                title="Enviar mensagem"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>
      )}
    </>
  );
};
