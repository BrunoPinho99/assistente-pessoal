// ==============================================================================
// PERSONAL OS — FRAMER DARK-CANVAS DESIGN SYSTEM TOKENS
// ==============================================================================

export const TOKENS = {
  colors: {
    primary: '#ffffff',
    onPrimary: '#000000',
    accentBlue: '#0099ff',
    ink: '#ffffff',
    inkMuted: '#999999',
    canvas: '#090909',
    surface1: '#141414',
    surface2: '#1c1c1c',
    hairline: '#262626',
    hairlineSoft: '#1a1a1a',
    gradientMagenta: '#d44df0',
    gradientViolet: '#6a4cf5',
    gradientOrange: '#ff7a3d',
    gradientCoral: '#ff5577',
    semanticSuccess: '#22c55e',
  },
  radius: {
    xs: '4px',
    sm: '6px',
    md: '10px',
    lg: '15px',
    xl: '20px',
    xxl: '30px',
    pill: '100px',
    full: '9999px',
  },
  shadows: {
    level1: 'none',
    level2: 'inset 0 0.5px 0 0 rgba(255,255,255,0.10), 0 10px 30px 0 rgba(0,0,0,0.25)',
    level3Selected: '0 0 0 1px rgba(0,153,255,0.15)',
  }
} as const;

export const getThemeClasses = (_themeMode?: 'hybrid' | 'light' | 'dark') => {
  return {
    workspaceBg: 'bg-[#090909] text-[#ffffff]',
    sidebarBg: 'bg-[#090909] text-[#ffffff] border-r border-[#262626]',
    cardSurface: 'bg-[#141414] border border-[#262626] text-[#ffffff]',
    cardFeatured: 'bg-[#1c1c1c] border border-[#262626] text-[#ffffff]',
    textPrimary: 'text-[#ffffff]',
    textSecondary: 'text-[#999999]',
    primaryButton: 'bg-[#ffffff] text-[#000000] hover:bg-white/90 active:scale-[0.98] font-medium rounded-full px-[15px] py-[10px] transition-all duration-150',
    secondaryButton: 'bg-[#141414] hover:bg-[#1c1c1c] text-[#ffffff] border border-[#262626] font-medium rounded-full px-[15px] py-[10px] transition-all duration-150',
  };
};
