import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2 } from 'lucide-react';

interface AudioMessagePlayerProps {
  audioUrl: string;
  durationSeconds?: number;
  isDarkMode?: boolean;
}

export const AudioMessagePlayer: React.FC<AudioMessagePlayerProps> = ({
  audioUrl,
  durationSeconds = 0,
  isDarkMode = true
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(durationSeconds);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onLoadedMetadata = () => {
      if (audio.duration && !isNaN(audio.duration) && isFinite(audio.duration)) {
        setDuration(Math.round(audio.duration));
      }
    };
    const onEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('ended', onEnded);

    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.removeEventListener('ended', onEnded);
    };
  }, []);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch(err => {
        console.warn('Erro ao reproduzir áudio:', err);
      });
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    setCurrentTime(newTime);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
    }
  };

  const formatTime = (seconds: number) => {
    if (isNaN(seconds) || !isFinite(seconds)) return '0:00';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div
      className={`flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all select-none ${
        isDarkMode
          ? 'bg-[#141414]/80 border border-[#2c2c2c] text-[#ffffff]'
          : 'bg-[#f4f4f5] border border-[#e4e4e7] text-[#090909]'
      }`}
    >
      <audio ref={audioRef} src={audioUrl} preload="metadata" />

      {/* Botão Play / Pause */}
      <button
        type="button"
        onClick={togglePlay}
        className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-transform active:scale-95 cursor-pointer ${
          isDarkMode
            ? 'bg-[#0099ff] text-white hover:bg-[#0088ee]'
            : 'bg-[#0099ff] text-white hover:bg-[#0088ee]'
        }`}
        title={isPlaying ? 'Pausar áudio' : 'Ouvir áudio gravado'}
      >
        {isPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current ml-0.5" />}
      </button>

      {/* Barra de Progresso Wave-like */}
      <div className="flex-1 flex flex-col gap-1 min-w-[130px]">
        <div className="relative w-full h-1.5 rounded-full overflow-hidden bg-zinc-300 dark:bg-zinc-700">
          <div
            className="absolute top-0 left-0 h-full bg-[#0099ff] transition-all duration-100"
            style={{ width: `${Math.min(100, Math.max(0, progressPercent))}%` }}
          />
        </div>
        <input
          type="range"
          min="0"
          max={duration || 1}
          step="0.1"
          value={currentTime}
          onChange={handleSeek}
          className="sr-only"
        />

        <div className="flex items-center justify-between text-[10px] text-zinc-500 dark:text-zinc-400">
          <span className="flex items-center gap-1 font-mono">
            <Volume2 className="w-2.5 h-2.5 text-[#0099ff]" />
            {formatTime(currentTime)}
          </span>
          <span className="font-mono">{formatTime(duration)}</span>
        </div>
      </div>
    </div>
  );
};

