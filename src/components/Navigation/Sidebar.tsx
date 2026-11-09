import React, { useState } from 'react';
import { 
  SunMedium, 
  CheckCircle2, 
  Layers, 
  BookOpen, 
  Zap, 
  Moon, 
  Settings, 
  Sun,
  Palette,
  Check,
  ChevronDown,
  X
} from 'lucide-react';
import { NavigationTab, ThemeMode } from '../../types';

interface SidebarProps {
  activeTab: NavigationTab;
  onTabChange: (tab: NavigationTab) => void;
  userName?: string;
  userRole?: string;
  themeMode?: ThemeMode;
  onChangeThemeMode?: (mode: ThemeMode) => void;
  isCalmMode?: boolean;
  onToggleCalmMode?: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  userName = 'Bruno Pinho',
  userRole = 'Espaço pessoal',
  themeMode = 'hybrid',
  onChangeThemeMode,
  isCalmMode = true,
  onToggleCalmMode,
  isCollapsed = false,
  onToggleCollapse,
  isMobileOpen = false,
  onCloseMobile
}) => {
  const [showThemeMenu, setShowThemeMenu] = useState(false);

  const navItems: { id: NavigationTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'hoje', label: 'Hoje (Meu Dia)', icon: SunMedium },
    { id: 'tarefas', label: 'Tarefas', icon: CheckCircle2 },
    { id: 'projetos', label: 'Projetos', icon: Layers },
    { id: 'estudos', label: 'Estudos & Cursos', icon: BookOpen },
  ];

  const initials = userName
    .split(' ')
    .map(n => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  const handleSelectTheme = (mode: ThemeMode) => {
    if (onChangeThemeMode) {
      onChangeThemeMode(mode);
    }
    setShowThemeMenu(false);
  };

  const handleItemClick = (id: NavigationTab) => {
    onTabChange(id);
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  return (
    <>
      {/* Mobile Drawer Backdrop */}
      {isMobileOpen && (
        <div 
          onClick={onCloseMobile}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 md:hidden animate-in fade-in duration-200"
          aria-hidden="true"
        />
      )}

      <aside 
        className={`fixed md:relative inset-y-0 left-0 z-50 flex-shrink-0 flex flex-col justify-between select-none h-full border-r transition-all duration-200 overflow-y-auto overflow-x-hidden ${
          isMobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full md:translate-x-0'
        } ${
          isCollapsed ? 'md:w-[72px] p-3' : 'w-[260px] p-4.5 sm:p-5'
        } bg-[#101522] border-[rgba(255,255,255,0.07)] text-white`}
        data-purpose="sidebar-navigation"
      >
        {/* Top and Nav Section */}
        <div className="flex flex-col gap-5">
          
          {/* Top: Brand Header */}
          <div className="flex items-center justify-between px-1 pt-1">
            <div className="flex items-center gap-3 min-w-0">
              {/* Blue Rounded Square Monogram */}
              <div className="w-8 h-8 rounded-xl bg-[#315DFF] flex items-center justify-center font-bold text-white text-sm shadow-[0_2px_8px_rgba(49,93,255,0.3)] shrink-0">
                p.
              </div>

              {!isCollapsed && (
                <div className="flex flex-col min-w-0 text-left">
                  <span className="font-bold tracking-tight text-white text-sm leading-tight truncate">
                    personal os
                  </span>
                  <span className="text-[11px] font-medium text-[#747E98] leading-none mt-0.5 truncate">
                    focus. build. grow.
                  </span>
                </div>
              )}
            </div>

            {/* Mobile Close Button or Desktop Collapse Button */}
            <div className="flex items-center gap-1">
              {/* Mobile Close Button */}
              {onCloseMobile && (
                <button
                  type="button"
                  onClick={onCloseMobile}
                  className="md:hidden p-1 rounded-lg text-[#747E98] hover:text-white hover:bg-[#151D31] transition-colors cursor-pointer"
                  title="Fechar menu"
                >
                  <X className="w-4 h-4" />
                </button>
              )}

              {/* Desktop Collapse Button */}
              {onToggleCollapse && (
                <button
                  type="button"
                  onClick={onToggleCollapse}
                  className="hidden md:flex w-6 h-6 rounded-full bg-[#151D31] hover:bg-[#1C2742] border border-[rgba(255,255,255,0.08)] items-center justify-center text-[#747E98] hover:text-white transition-colors cursor-pointer shrink-0"
                  title={isCollapsed ? "Expandir menu lateral" : "Recolher menu lateral"}
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-[#315DFF]" />
                </button>
              )}
            </div>
          </div>

          {/* Main Navigation Menu */}
          <nav aria-label="Navegação Principal" className="flex flex-col gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleItemClick(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all duration-150 text-left cursor-pointer group ${
                    isActive
                      ? 'bg-[#315DFF] text-white font-semibold shadow-[0_2px_8px_rgba(49,93,255,0.25)]'
                      : 'text-[#747E98] hover:text-white hover:bg-[#151D31]'
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 transition-colors ${
                    isActive ? 'text-white' : 'text-[#747E98] group-hover:text-white'
                  }`} />
                  {!isCollapsed && (
                    <span className="tracking-normal truncate">
                      {item.label}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Section: Focus Mode Card, Theme Switcher & User Profile */}
        <div className="flex flex-col gap-2.5 pt-4 border-t border-[rgba(255,255,255,0.07)]">
          
          {/* 1. Modo Foco Ativado Component */}
          {!isCollapsed && (
            <div className="bg-[#151D31] border border-[rgba(255,255,255,0.06)] rounded-xl p-2.5 flex items-center justify-between">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-7 h-7 rounded-lg bg-[#315DFF]/15 border border-[#315DFF]/30 flex items-center justify-center text-[#315DFF] shrink-0">
                  <Zap className="w-3.5 h-3.5 fill-current" />
                </div>
                <div className="flex flex-col text-left min-w-0">
                  <span className="text-[11.5px] font-semibold text-white truncate">
                    Modo Foco Ativado
                  </span>
                  <span className="text-[10px] text-[#747E98] truncate">
                    Você está no controle.
                  </span>
                </div>
              </div>

              {/* iOS Style Switch Toggle */}
              <button
                type="button"
                onClick={onToggleCalmMode}
                className={`w-9 h-5 flex items-center rounded-full p-0.5 transition-colors duration-200 cursor-pointer shrink-0 ${
                  isCalmMode ? 'bg-[#315DFF]' : 'bg-[#222C42]'
                }`}
              >
                <div 
                  className={`bg-white w-4 h-4 rounded-full shadow-sm transform transition-transform duration-200 ${
                    isCalmMode ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          )}

          {/* 2. Seletor de Tema (Light, Dark, Híbrido) */}
          {!isCollapsed && (
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowThemeMenu(!showThemeMenu)}
                className="w-full bg-[#151D31] border border-[rgba(255,255,255,0.06)] hover:border-[rgba(255,255,255,0.12)] rounded-xl px-3 py-2 flex items-center justify-between text-xs transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2 text-[#747E98]">
                  <Moon className="w-3.5 h-3.5" />
                  <span className="font-medium text-[#C8D1E0] text-[11.5px]">Tema</span>
                </div>
                <div className="flex items-center gap-1 text-[#747E98]">
                  <span className="font-semibold text-white capitalize text-[11px]">
                    {themeMode === 'hybrid' ? 'Híbrido' : themeMode === 'dark' ? 'Escuro' : 'Claro'}
                  </span>
                  <ChevronDown className="w-3 h-3" />
                </div>
              </button>

              {/* Dropdown Menu */}
              {showThemeMenu && (
                <div className="absolute bottom-full mb-1.5 inset-x-0 bg-[#151D31] border border-[rgba(255,255,255,0.12)] rounded-xl p-1 shadow-xl z-50 space-y-0.5">
                  {(['hybrid', 'light', 'dark'] as ThemeMode[]).map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => handleSelectTheme(mode)}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-[11px] font-medium cursor-pointer transition-colors ${
                        themeMode === mode 
                          ? 'bg-[#315DFF] text-white font-semibold' 
                          : 'text-[#747E98] hover:text-white hover:bg-[#1E2942]'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {mode === 'hybrid' && <Palette className="w-3 h-3" />}
                        {mode === 'light' && <Sun className="w-3 h-3" />}
                        {mode === 'dark' && <Moon className="w-3 h-3" />}
                        <span>{mode === 'hybrid' ? 'Híbrido' : mode === 'light' ? 'Modo Claro' : 'Modo Escuro'}</span>
                      </div>
                      {themeMode === mode && <Check className="w-3 h-3" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 3. Perfil do Usuário */}
          <div 
            className="flex items-center justify-between p-1.5 rounded-xl bg-[#151D31]/40 hover:bg-[#151D31] transition-colors"
            data-purpose="user-profile"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="relative shrink-0">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#1B2745] to-[#253A6E] border border-[#3A5088] flex items-center justify-center text-xs font-bold text-white shadow-xs">
                  {initials}
                </div>
                {/* Presence Green Indicator */}
                <span className="absolute bottom-0 right-0 w-2 h-2 bg-emerald-500 rounded-full border border-[#101522]" />
              </div>

              {!isCollapsed && (
                <div className="flex flex-col min-w-0 text-left">
                  <span className="text-xs font-semibold text-white truncate">
                    {userName}
                  </span>
                  <span className="text-[10px] text-[#747E98] truncate">
                    {userRole}
                  </span>
                </div>
              )}
            </div>

            {!isCollapsed && (
              <button
                type="button"
                className="p-1 rounded text-[#747E98] hover:text-white hover:bg-[#1E2942] transition-colors cursor-pointer shrink-0"
                title="Configurações"
              >
                <Settings className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

        </div>
      </aside>
    </>
  );
};
