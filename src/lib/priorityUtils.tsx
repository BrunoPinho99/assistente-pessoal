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
  _isDarkMode: boolean = true
): PriorityThermalConfig => {
  switch (priority) {
    case 'urgente':
      return {
        label: 'Urgente',
        temperatureLabel: 'Máxima Temperatura (Crítica)',
        badgeClass: 'bg-[#ff5577]/15 border-[#ff5577]/35 text-[#ff5577]',
        dotClass: 'bg-[#ff5577] shadow-[0_0_8px_rgba(255,85,119,0.7)]',
        borderClass: 'border-[#ff5577]/40',
        textClass: 'text-[#ff5577]',
        bgClass: 'bg-[#ff5577]/15',
        activeButtonClass: 'bg-[#1c1c1c] border-[#ff5577] text-[#ffffff] ring-1 ring-[#ff5577]/30',
        icon: <Flame className="w-3 h-3 text-[#ff5577] fill-[#ff5577]/40" />
      };

    case 'alta':
      return {
        label: 'Alta',
        temperatureLabel: 'Temperatura Quente (Solar)',
        badgeClass: 'bg-[#ff7a3d]/15 border-[#ff7a3d]/35 text-[#ff7a3d]',
        dotClass: 'bg-[#ff7a3d] shadow-[0_0_8px_rgba(255,122,61,0.6)]',
        borderClass: 'border-[#ff7a3d]/40',
        textClass: 'text-[#ff7a3d]',
        bgClass: 'bg-[#ff7a3d]/15',
        activeButtonClass: 'bg-[#1c1c1c] border-[#ff7a3d] text-[#ffffff] ring-1 ring-[#ff7a3d]/30',
        icon: <Sun className="w-3 h-3 text-[#ff7a3d]" />
      };

    case 'media':
      return {
        label: 'Média',
        temperatureLabel: 'Temperatura Neutra (Framer Blue)',
        badgeClass: 'bg-[#0099ff]/15 border-[#0099ff]/35 text-[#0099ff]',
        dotClass: 'bg-[#0099ff] shadow-[0_0_8px_rgba(0,153,255,0.5)]',
        borderClass: 'border-[#0099ff]/40',
        textClass: 'text-[#0099ff]',
        bgClass: 'bg-[#0099ff]/15',
        activeButtonClass: 'bg-[#1c1c1c] border-[#0099ff] text-[#ffffff] ring-1 ring-[#0099ff]/25',
        icon: <Activity className="w-3 h-3 text-[#0099ff]" />
      };

    case 'baixa':
    default:
      return {
        label: 'Baixa',
        temperatureLabel: 'Temperatura Fria (Tranquila)',
        badgeClass: 'bg-[#1c1c1c] border-[#262626] text-[#999999]',
        dotClass: 'bg-[#22c55e]',
        borderClass: 'border-[#262626]',
        textClass: 'text-[#999999]',
        bgClass: 'bg-[#1c1c1c]',
        activeButtonClass: 'bg-[#1c1c1c] border-[#22c55e] text-[#ffffff] ring-1 ring-[#22c55e]/25',
        icon: <Sparkles className="w-3 h-3 text-[#22c55e]" />
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
    xs: 'px-2 py-0.5 text-[11px] gap-1',
    sm: 'px-2.5 py-0.5 text-[12px] gap-1.5',
    md: 'px-3 py-1 text-[13px] gap-1.5'
  }[size];

  const dotSizes = {
    xs: 'w-1.5 h-1.5',
    sm: 'w-1.5 h-1.5',
    md: 'w-2 h-2'
  }[size];

  return (
    <span
      className={`inline-flex items-center font-medium rounded-[6px] border tracking-[-0.12px] transition-colors ${config.badgeClass} ${sizeClasses} ${className}`}
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
  _isDarkMode: boolean = true
): EnergyThermalConfig => {
  switch (level) {
    case 'high':
      return {
        label: 'Energia Alta',
        badgeClass: 'bg-[#ff7a3d]/10 border-[#ff7a3d]/25 text-[#ff7a3d]',
        icon: <Flame className="w-3 h-3 text-[#ff7a3d] fill-[#ff7a3d]/40" />
      };
    case 'medium':
      return {
        label: 'Energia Média',
        badgeClass: 'bg-[#0099ff]/10 border-[#0099ff]/25 text-[#0099ff]',
        icon: <Activity className="w-3 h-3 text-[#0099ff]" />
      };
    case 'low':
    default:
      return {
        label: 'Energia Baixa',
        badgeClass: 'bg-[#22c55e]/10 border-[#22c55e]/25 text-[#22c55e]',
        icon: <Sparkles className="w-3 h-3 text-[#22c55e]" />
      };
  }
};
