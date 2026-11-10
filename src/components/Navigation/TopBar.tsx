import React, { useEffect, useRef } from 'react';
import { 
  Search, 
  Sun, 
  Moon, 
  SlidersHorizontal, 
  Check, 
  X, 
  Plus, 
  Compass, 
  AlertTriangle,
  Calendar as CalendarIcon,
  Layout,
  BellOff
} from 'lucide-react';

interface TopBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
  isOverloaded: boolean;
  todayEstimatedMinutes: number;
  onOpenQuickCapture: () => void;
  onOpenLostHelp: () => void;
  onOpenEmergencyTriage: () => void;
  userName?: string;
  activeTabLabel?: string;
}

export const TopBar: React.FC<TopBarProps> = ({
  searchQuery,
  onSearchChange,
  isDarkMode,
  onToggleTheme,
  isOverloaded,
  todayEstimatedMinutes,
  onOpenQuickCapture,
  onOpenLostHelp,
  onOpenEmergencyTriage,
  activeTabLabel = 'Hoje'
}) => {
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      if (e.key.toLowerCase() === 'c' && !(document.activeElement instanceof HTMLInputElement || document.activeElement instanceof HTMLTextAreaElement)) {
        e.preventDefault();
        onOpenQuickCapture();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onOpenQuickCapture]);

  const estimatedHours = (todayEstimatedMinutes / 60).toFixed(1);

  // Data formatada como na referência ("Segunda-feira, 9 de novembro")
  const now = new Date();
  const dayName = now.toLocaleDateString('pt-BR', { weekday: 'long' });
  const formattedDay = `${dayName.charAt(0).toUpperCase() + dayName.slice(1)}, ${now.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' })}`;

  return (
    <header className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pb-5 mb-5 border-b border-slate-100 dark:border-white/[0.08] relative z-20">
      {/* Breadcrumb da Referência: Layout Icon + "Meu espaço / Hoje" */}
      <div className="flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500">
        <Layout className="w-4 h-4 text-slate-400 dark:text-slate-500" />
        <span className="hover:text-slate-600 transition-colors cursor-pointer">Meu espaço</span>
        <span>/</span>
        <span className="font-semibold text-slate-800 dark:text-slate-200">{activeTabLabel}</span>
      </div>

      {/* Ações da Direita: Data Calendar + Busca Spotlight + Tema */}
      <div className="flex items-center gap-3 flex-wrap justify-between sm:justify-end">
        {/* Data formatada */}
        <div className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500 font-medium">
          <CalendarIcon className="w-3.5 h-3.5 text-slate-400" />
          <span>{formattedDay}</span>
        </div>

        {/* Busca Global rápida */}
        <div className="relative w-44 sm:w-56">
          <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-3.5 h-3.5" />
          </span>
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Buscar... (⌘K)"
            className="w-full pl-8 pr-7 py-1 text-xs bg-slate-50 dark:bg-zinc-900 border border-slate-200/80 dark:border-white/[0.08] text-slate-900 dark:text-slate-100 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all placeholder:text-slate-400"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="absolute inset-y-0 right-0 pr-2 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Alerta de Sobrecarga (se houver mais de 6h) */}
        {isOverloaded && (
          <button
            type="button"
            onClick={onOpenEmergencyTriage}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-mono font-medium bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-300 transition-colors cursor-pointer"
            title="Mais de 6 horas estimadas. Fazer triagem."
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
            <span className="hidden md:inline">Sobrecarga ({estimatedHours}h)</span>
          </button>
        )}

        {/* Alternador de Tema Claro / Escuro */}
        <button
          type="button"
          onClick={onToggleTheme}
          aria-label={isDarkMode ? 'Mudar para tema claro' : 'Mudar para tema escuro'}
          className="p-1.5 rounded-lg bg-slate-50 dark:bg-zinc-900 border border-slate-200/80 dark:border-white/[0.08] text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
          title={isDarkMode ? 'Tema Claro (Branco e Azul)' : 'Tema Escuro'}
        >
          {isDarkMode ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-slate-600" />}
        </button>
      </div>
    </header>
  );
};
