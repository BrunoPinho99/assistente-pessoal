import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  CheckCircle2, 
  Timer, 
  Maximize2, 
  Minimize2, 
  Volume2, 
  VolumeX,
  Radio,
  Sliders
} from 'lucide-react';
import { Task, FocusSession } from '../../types';
import { soundSynthesizer } from '../../lib/audioSynthesizer';

interface FocusViewProps {
  tasks: Task[];
  activeTask: Task | null;
  onSelectTask: (task: Task | null) => void;
  onCompleteTask: (taskId: string) => void;
  onRecordFocusSession: (session: Omit<FocusSession, 'id' | 'completed_at'>) => void;
}

export const FocusView: React.FC<FocusViewProps> = ({
  tasks,
  activeTask,
  onSelectTask,
  onCompleteTask,
  onRecordFocusSession
}) => {
  const [timerSeconds, setTimerSeconds] = useState(25 * 60);
  const [initialSeconds, setInitialSeconds] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [mode, setMode] = useState<'pomodoro' | 'livre'>('pomodoro');
  const [isImmersive, setIsImmersive] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  
  // Ambient Sound for ADHD
  const [ambientSound, setAmbientSound] = useState<'none' | 'brown' | 'focus40'>('none');
  const [ambientVolume, setAmbientVolume] = useState(0.25);

  // Play gentle bell chime with Web Audio API (no external assets)
  const playChime = () => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.3); // A5
      gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 1.2);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 1.2);
    } catch (e) {
      // AudioContext fallback
    }
  };

  // Manage ambient sound playback
  useEffect(() => {
    if (isRunning) {
      if (ambientSound === 'brown') {
        soundSynthesizer.startBrownNoise(ambientVolume);
      } else if (ambientSound === 'focus40') {
        soundSynthesizer.startFocusTone(ambientVolume);
      } else {
        soundSynthesizer.stop();
      }
    } else {
      soundSynthesizer.stop();
    }

    return () => {
      soundSynthesizer.stop();
    };
  }, [isRunning, ambientSound, ambientVolume]);

  useEffect(() => {
    soundSynthesizer.setVolume(ambientVolume);
  }, [ambientVolume]);

  useEffect(() => {
    let interval: any = null;
    if (isRunning && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds(sec => sec - 1);
      }, 1000);
    } else if (timerSeconds === 0 && isRunning) {
      setIsRunning(false);
      soundSynthesizer.stop();
      playChime();
      confetti({
        particleCount: 90,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#2563EB', '#10B981', '#38BDF8']
      });

      const elapsedMinutes = Math.round(initialSeconds / 60);
      onRecordFocusSession({
        task_id: activeTask?.id || null,
        task_title: activeTask?.title || 'Foco Livre',
        duration_minutes: elapsedMinutes,
        mode
      });
    }
    return () => clearInterval(interval);
  }, [isRunning, timerSeconds, initialSeconds, activeTask, mode, soundEnabled]);

  const handleStartTimer = (secs: number) => {
    setIsRunning(false);
    setInitialSeconds(secs);
    setTimerSeconds(secs);
  };

  const handleCompleteCurrent = () => {
    if (activeTask) {
      onCompleteTask(activeTask.id);
      confetti({ particleCount: 50, spread: 60 });
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const pendingTasks = tasks.filter(t => t.status !== 'concluido');
  const progressRatio = initialSeconds > 0 ? (initialSeconds - timerSeconds) / initialSeconds : 0;
  const progressPercent = Math.round(progressRatio * 100);

  return (
    <div className={`space-y-6 text-left transition-all ${isImmersive ? 'fixed inset-0 z-50 bg-white dark:bg-zinc-950 p-6 flex flex-col justify-center items-center' : ''}`} data-purpose="central-de-foco">
      {/* Header (Ocultado em modo imersivo) */}
      {!isImmersive && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-4">
          <div>
            <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
              <Timer className="w-5 h-5 text-blue-600 dark:text-blue-500" />
              Central de Hiperfoco
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              Ambiente minimalista livre de distrações com gerador acústico de foco para TDAH.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors cursor-pointer"
              title={soundEnabled ? 'Aviso sonoro ativado' : 'Aviso sonoro desativado'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            <button
              type="button"
              onClick={() => setIsImmersive(!isImmersive)}
              className="px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span>Modo Imersivo</span>
            </button>
          </div>
        </div>
      )}

      {/* Container Central de Foco */}
      <div className="w-full max-w-xl mx-auto p-8 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm space-y-6 text-center relative">
        {/* Botão Sair do Modo Imersivo se ativo */}
        {isImmersive && (
          <button
            type="button"
            onClick={() => setIsImmersive(false)}
            className="absolute top-4 right-4 p-2 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer"
            title="Sair do modo imersivo (Esc)"
          >
            <Minimize2 className="w-4 h-4" />
          </button>
        )}

        {/* Tarefa Selecionada */}
        <div className="space-y-2">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900 px-2.5 py-1 rounded-md">
            {isRunning ? 'Sessão em Andamento' : 'Pronto para Iniciar'}
          </span>

          <h3 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-50 max-w-md mx-auto">
            {activeTask ? activeTask.title : 'Foco Livre e Sem Distrações'}
          </h3>

          {/* Trocar Tarefa Rápida se não estiver rodando */}
          {!isRunning && pendingTasks.length > 0 && (
            <div className="pt-1">
              <select
                aria-label="Selecionar tarefa para a sessão"
                value={activeTask?.id || ''}
                onChange={(e) => {
                  const found = pendingTasks.find(t => t.id === e.target.value);
                  onSelectTask(found || null);
                }}
                className="text-xs text-zinc-600 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-md px-2.5 py-1 max-w-xs truncate cursor-pointer"
              >
                <option value="">Foco Livre (sem vincular a tarefa)</option>
                {pendingTasks.map(t => (
                  <option key={t.id} value={t.id}>{t.title}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* O Temporizador com Barra Circular */}
        <div className="relative w-60 h-60 mx-auto flex flex-col items-center justify-center">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="44"
              className="stroke-zinc-100 dark:stroke-zinc-800"
              strokeWidth="5"
              fill="none"
            />
            <circle
              cx="50"
              cy="50"
              r="44"
              className="stroke-blue-600 dark:stroke-blue-500 transition-all duration-500"
              strokeWidth="5"
              fill="none"
              strokeDasharray={276.46}
              strokeDashoffset={276.46 - (276.46 * progressPercent) / 100}
              strokeLinecap="round"
            />
          </svg>

          <div className="absolute flex flex-col items-center justify-center">
            <span className="text-5xl font-mono font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">
              {formatTime(timerSeconds)}
            </span>
            <span className="text-xs text-blue-600 dark:text-blue-400 font-medium mt-1">
              {progressPercent}% decorrido
            </span>
          </div>
        </div>

        {/* Gerador de Som Ambiente TDAH (Ruído Marrom / 40Hz) */}
        <div className="p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-800/40 max-w-md mx-auto space-y-2">
          <div className="flex items-center justify-between text-xs text-zinc-700 dark:text-zinc-300 font-medium">
            <span className="flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5 text-blue-500" />
              <span>Som de Foco TDAH (Nativo)</span>
            </span>
            <span className="text-[10px] text-zinc-400">
              {isRunning && ambientSound !== 'none' ? '● Ativo durante foco' : 'Pausado'}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-1.5 text-xs">
            <button
              type="button"
              onClick={() => setAmbientSound('none')}
              className={`py-1.5 rounded-lg border text-xs font-medium transition-colors cursor-pointer ${
                ambientSound === 'none'
                  ? 'bg-white dark:bg-zinc-700 border-zinc-300 dark:border-zinc-600 text-zinc-900 dark:text-zinc-100 font-bold shadow-xs'
                  : 'bg-transparent border-transparent text-zinc-500'
              }`}
            >
              Mudo
            </button>

            <button
              type="button"
              onClick={() => setAmbientSound('brown')}
              className={`py-1.5 rounded-lg border text-xs font-medium transition-colors cursor-pointer ${
                ambientSound === 'brown'
                  ? 'bg-amber-50 dark:bg-amber-950/60 border-amber-400 dark:border-amber-700 text-amber-800 dark:text-amber-300 font-bold shadow-xs'
                  : 'bg-transparent border-transparent text-zinc-500'
              }`}
              title="Ruído contínuo aveludado que bloqueia ruídos súbitos"
            >
              Ruído Marrom
            </button>

            <button
              type="button"
              onClick={() => setAmbientSound('focus40')}
              className={`py-1.5 rounded-lg border text-xs font-medium transition-colors cursor-pointer ${
                ambientSound === 'focus40'
                  ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-400 dark:border-blue-700 text-blue-800 dark:text-blue-300 font-bold shadow-xs'
                  : 'bg-transparent border-transparent text-zinc-500'
              }`}
              title="Tom rítmico de 40Hz para hiperfoco cognitivo"
            >
              Onda 40Hz
            </button>
          </div>

          {ambientSound !== 'none' && (
            <div className="flex items-center gap-2 pt-1 text-xs text-zinc-400">
              <span className="text-[10px]">Volume:</span>
              <input
                type="range"
                min="0.05"
                max="0.8"
                step="0.05"
                value={ambientVolume}
                onChange={(e) => setAmbientVolume(parseFloat(e.target.value))}
                className="flex-1 accent-blue-600 h-1 bg-zinc-200 dark:bg-zinc-700 rounded-lg cursor-pointer"
              />
            </div>
          )}
        </div>

        {/* Controles do Temporizador */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => setIsRunning(!isRunning)}
            className="px-6 py-2.5 rounded-lg font-semibold text-xs bg-blue-600 hover:bg-blue-700 text-white shadow-xs flex items-center gap-2 transition-colors cursor-pointer"
          >
            {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
            <span>{isRunning ? 'Pausar' : 'Iniciar Foco'}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setIsRunning(false);
              setTimerSeconds(initialSeconds);
            }}
            className="p-2.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 transition-colors cursor-pointer"
            title="Resetar"
            aria-label="Resetar"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {activeTask && (
            <button
              type="button"
              onClick={handleCompleteCurrent}
              className="px-4 py-2.5 rounded-lg font-semibold text-xs bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Concluir Tarefa</span>
            </button>
          )}
        </div>

        {/* Presets Rápidos de Foco */}
        <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 flex justify-center gap-3 text-xs">
          <button
            type="button"
            onClick={() => handleStartTimer(25 * 60)}
            className="px-2.5 py-1 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:text-blue-600 text-[11px] font-medium transition-colors cursor-pointer"
          >
            Pomodoro (25m)
          </button>
          <button
            type="button"
            onClick={() => handleStartTimer(5 * 60)}
            className="px-2.5 py-1 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:text-blue-600 text-[11px] font-medium transition-colors cursor-pointer"
          >
            Pausa Curta (5m)
          </button>
          <button
            type="button"
            onClick={() => handleStartTimer(15 * 60)}
            className="px-2.5 py-1 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:text-blue-600 text-[11px] font-medium transition-colors cursor-pointer"
          >
            Pausa Longa (15m)
          </button>
          <button
            type="button"
            onClick={() => handleStartTimer(50 * 60)}
            className="px-2.5 py-1 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:text-blue-600 text-[11px] font-medium transition-colors cursor-pointer"
          >
            Bloco Duplo (50m)
          </button>
        </div>
      </div>
    </div>
  );
};
