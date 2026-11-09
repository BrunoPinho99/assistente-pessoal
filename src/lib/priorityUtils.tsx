import React from 'react';
import { Flame, Sun, Activity, Sparkles } from 'lucide-react';
import { Priority, EnergyLevel } from '../types';

export interface PriorityThermalConfig {
  label: string;
  temperatureLabel: string;
  badgeClass: string;
  dotClass: string;
  borderClass: string;
  textClass: string;
  bgClass: string;
  activeButtonClass: string;
  icon: React.ReactNode;
}

export const getPriorityThermalConfig = (
  priority: Priority = 'media',
  isDarkMode: boolean = true
): PriorityThermalConfig => {
  switch (priority) {
    case 'urgente':
      return {
        label: 'Urgente',
        temperatureLabel: 'Máxima Temperatura (Fervendo / Crítica)',
        badgeClass: isDarkMode
          ? 'bg-rose-500/15 border-rose-500/35 text-rose-400'
          : 'bg-rose-50 border-rose-200 text-rose-700',
        dotClass: isDarkMode ? 'bg-rose-400 shadow-[0_0_8px_rgba(244,63,94,0.6)]' : 'bg-rose-600',
        borderClass: isDarkMode ? 'border-rose-500/40' : 'border-rose-300',
        textClass: isDarkMode ? 'text-rose-400' : 'text-rose-700',
        bgClass: isDarkMode ? 'bg-rose-500/15' : 'bg-rose-50',
        activeButtonClass: isDarkMode
          ? 'bg-rose-950/60 border-rose-500 text-rose-300 ring-1 ring-rose-500/40'
          : 'bg-rose-100 border-rose-400 text-rose-800 ring-1 ring-rose-300',
        icon: <Flame className="w-3 h-3 text-rose-400 fill-rose-400/40" />
      };

    case 'alta':
      return {
        label: 'Alta',
        temperatureLabel: 'Temperatura Quente (Solar / Fogo)',
        badgeClass: isDarkMode
          ? 'bg-amber-500/15 border-amber-500/35 text-amber-400'
          : 'bg-amber-50 border-amber-200 text-amber-800',
        dotClass: isDarkMode ? 'bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.6)]' : 'bg-amber-600',
        borderClass: isDarkMode ? 'border-amber-500/40' : 'border-amber-300',
        textClass: isDarkMode ? 'text-amber-400' : 'text-amber-800',
        bgClass: isDarkMode ? 'bg-amber-500/15' : 'bg-amber-50',
        activeButtonClass: isDarkMode
          ? 'bg-amber-950/60 border-amber-500 text-amber-300 ring-1 ring-amber-500/40'
          : 'bg-amber-100 border-amber-400 text-amber-800 ring-1 ring-amber-300',
        icon: <Sun className="w-3 h-3 text-amber-400" />
      };

    case 'media':
      return {
        label: 'Média',
        temperatureLabel: 'Temperatura Neutra / Morna (Sky Blue)',
        badgeClass: isDarkMode
          ? 'bg-sky-500/15 border-sky-500/35 text-sky-400'
          : 'bg-sky-50 border-sky-200 text-sky-800',
        dotClass: isDarkMode ? 'bg-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.5)]' : 'bg-sky-600',
        borderClass: isDarkMode ? 'border-sky-500/40' : 'border-sky-300',
        textClass: isDarkMode ? 'text-sky-400' : 'text-sky-800',
        bgClass: isDarkMode ? 'bg-sky-500/15' : 'bg-sky-50',
        activeButtonClass: isDarkMode
          ? 'bg-sky-950/60 border-sky-500 text-sky-300 ring-1 ring-sky-500/40'
          : 'bg-sky-100 border-sky-400 text-sky-800 ring-1 ring-sky-300',
        icon: <Activity className="w-3 h-3 text-sky-400" />
      };

    case 'baixa':
    default:
      return {
        label: 'Baixa',
        temperatureLabel: 'Temperatura Fria (Menta / Esmeralda)',
        badgeClass: isDarkMode
          ? 'bg-emerald-500/15 border-emerald-500/35 text-emerald-400'
          : 'bg-emerald-50 border-emerald-200 text-emerald-800',
        dotClass: isDarkMode ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]' : 'bg-emerald-600',
        borderClass: isDarkMode ? 'border-emerald-500/40' : 'border-emerald-300',
        textClass: isDarkMode ? 'text-emerald-400' : 'text-emerald-800',
        bgClass: isDarkMode ? 'bg-emerald-500/15' : 'bg-emerald-50',
        activeButtonClass: isDarkMode
          ? 'bg-emerald-950/60 border-emerald-500 text-emerald-300 ring-1 ring-emerald-500/40'
          : 'bg-emerald-100 border-emerald-400 text-emerald-800 ring-1 ring-emerald-300',
        icon: <Sparkles className="w-3 h-3 text-emerald-400" />
      };
  }
};

interface PriorityBadgeProps {
  priority: Priority;
  isDarkMode?: boolean;
  size?: 'xs' | 'sm' | 'md';
  showDot?: boolean;
  className?: string;
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({
  priority,
  isDarkMode = true,
  size = 'sm',
  showDot = true,
  className = ''
}) => {
  const config = getPriorityThermalConfig(priority, isDarkMode);

  const sizeClasses = {
    xs: 'px-1.5 py-0.5 text-[10px] gap-1',
    sm: 'px-2 py-0.5 text-[11px] gap-1.5',
    md: 'px-2.5 py-1 text-xs gap-1.5'
  }[size];

  const dotSizes = {
    xs: 'w-1 h-1',
    sm: 'w-1.5 h-1.5',
    md: 'w-2 h-2'
  }[size];

  return (
    <span
      className={`inline-flex items-center font-medium rounded-md border tracking-tight transition-colors ${config.badgeClass} ${sizeClasses} ${className}`}
      title={`Prioridade: ${config.label} (${config.temperatureLabel})`}
    >
      {showDot && (
        <span className={`rounded-full shrink-0 ${config.dotClass} ${dotSizes}`} />
      )}
      <span>{config.label}</span>
    </span>
  );
};

export interface EnergyThermalConfig {
  label: string;
  badgeClass: string;
  icon: React.ReactNode;
}

export const getEnergyThermalConfig = (
  level: EnergyLevel = 'medium',
  isDarkMode: boolean = true
): EnergyThermalConfig => {
  switch (level) {
    case 'high':
      return {
        label: 'Energia Alta',
        badgeClass: isDarkMode
          ? 'bg-amber-500/10 border-amber-500/25 text-amber-300'
          : 'bg-amber-50 border-amber-200 text-amber-800',
        icon: <Flame className="w-3 h-3 text-amber-400 fill-amber-400/40" />
      };
    case 'medium':
      return {
        label: 'Energia Média',
        badgeClass: isDarkMode
          ? 'bg-sky-500/10 border-sky-500/25 text-sky-300'
          : 'bg-sky-50 border-sky-200 text-sky-800',
        icon: <Activity className="w-3 h-3 text-sky-400" />
      };
    case 'low':
    default:
      return {
        label: 'Energia Baixa',
        badgeClass: isDarkMode
          ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-300'
          : 'bg-emerald-50 border-emerald-200 text-emerald-800',
        icon: <Sparkles className="w-3 h-3 text-emerald-400" />
      };
  }
};

