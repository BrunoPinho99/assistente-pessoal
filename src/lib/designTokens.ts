// ==============================================================================
// PERSONAL OS - REFINED DESIGN SYSTEM TOKENS
// ==============================================================================

export const TOKENS = {
  colors: {
    sidebarBg: '#101522',
    focusCardBg: '#111B36',
    deepBlue: '#172D69',
    electricBlue: '#315DFF',
    workspaceBg: '#F3F5FC',
    surface: '#FFFFFF',
    primaryText: '#171D38',
    secondaryText: '#747E98',
    border: '#E3E8F3',
    borderDark: 'rgba(255, 255, 255, 0.08)'
  },
  radius: {
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '22px',
    full: '9999px',
  },
  shadows: {
    sm: '0 1px 3px 0 rgba(23, 29, 56, 0.03)',
    card: '0 2px 8px -1px rgba(23, 29, 56, 0.04)',
    focusCard: '0 4px 20px -2px rgba(17, 27, 54, 0.12)',
    buttonPrimary: '0 2px 8px 0 rgba(49, 93, 255, 0.25)',
  }
} as const;

export const getThemeClasses = (themeMode: 'hybrid' | 'light' | 'dark') => {
  const isDark = themeMode === 'dark';
  const isLight = themeMode === 'light';

  return {
    workspaceBg: isDark ? 'bg-[#101522] text-[#F3F5FC]' : 'bg-[#F3F5FC] text-[#171D38]',
    sidebarBg: isLight ? 'bg-[#FFFFFF] text-[#171D38] border-r border-[#E3E8F3]' : 'bg-[#101522] text-[#F3F5FC] border-r border-[#1C2436]',
    cardSurface: isDark ? 'bg-[#151D31] border-[rgba(255,255,255,0.08)] text-[#F3F5FC]' : 'bg-[#FFFFFF] border-[#E3E8F3] text-[#171D38]',
    textPrimary: isDark ? 'text-[#F3F5FC]' : 'text-[#171D38]',
    textSecondary: isDark ? 'text-[#94A3B8]' : 'text-[#747E98]',
    primaryButton: 'bg-[#315DFF] hover:bg-[#264ED8] active:scale-[0.98] text-white font-semibold shadow-[0_2px_8px_rgba(49,93,255,0.25)] transition-all duration-150',
    primaryPill: 'bg-[#315DFF] text-white shadow-[0_2px_6px_rgba(49,93,255,0.2)]',
  };
};
