import React from 'react';
import { 
  SunMedium, 
  CheckCircle2, 
  Layers, 
  BookOpen, 
  Zap, 
  Settings, 
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
  userRole = 'Framer Dark Canvas',
  isCalmMode = true,
  onToggleCalmMode,
  isCollapsed = false,
  onToggleCollapse,
  isMobileOpen = false,
  onCloseMobile
}) => {
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
          className="fixed inset-0 bg-black/80 backdrop-blur-xs z-40 md:hidden animate-in fade-in duration-200"
          aria-hidden="true"
        />
      )}

      <aside 
        className={`fixed md:relative inset-y-0 left-0 z-50 flex-shrink-0 flex flex-col justify-between select-none h-full border-r transition-all duration-200 overflow-y-auto overflow-x-hidden ${
          isMobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full md:translate-x-0'
        } ${
          isCollapsed ? 'md:w-[72px] p-3' : 'w-[260px] p-5'
        } bg-[#090909] border-[#262626] text-[#ffffff]`}
        data-purpose="sidebar-navigation"
      >
        {/* Top and Nav Section */}
        <div className="flex flex-col gap-6">
          
          {/* Top: Framer Brand Header */}
          <div className="flex items-center justify-between px-1 pt-0.5">
            <div className="flex items-center gap-3 min-w-0">
              {/* Pure White Monogram on Black Canvas */}
              <div className="w-8 h-8 rounded-[8px] bg-[#ffffff] flex items-center justify-center font-bold text-[#000000] text-sm tracking-[-0.5px] shrink-0">
                p.
              </div>

              {!isCollapsed && (
                <div className="flex flex-col min-w-0 text-left">
                  <span className="font-semibold tracking-[-0.6px] text-[#ffffff] text-[15px] leading-tight truncate">
                    personal os
                  </span>
                  <span className="text-[12px] font-normal text-[#999999] tracking-[-0.12px] leading-none mt-0.5 truncate">
                    focus. build. grow.
                  </span>
                </div>
              )}
            </div>

            {/* Mobile Close Button or Desktop Collapse Button */}
            <div className="flex items-center gap-1">
              {onCloseMobile && (
                <button
                  type="button"
                  onClick={onCloseMobile}
                  className="md:hidden w-8 h-8 rounded-full bg-[#141414] border border-[#262626] flex items-center justify-center text-[#999999] hover:text-[#ffffff] transition-colors cursor-pointer"
                  title="Fechar menu"
                >
                  <X className="w-4 h-4" />
                </button>
              )}

              {onToggleCollapse && (
                <button
                  type="button"
                  onClick={onToggleCollapse}
                  className="hidden md:flex w-6 h-6 rounded-full bg-[#141414] hover:bg-[#1c1c1c] border border-[#262626] items-center justify-center text-[#999999] hover:text-[#ffffff] transition-colors cursor-pointer shrink-0"
                  title={isCollapsed ? "Expandir menu lateral" : "Recolher menu lateral"}
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-[#0099ff]" />
                </button>
              )}
            </div>
          </div>

          {/* Main Navigation Menu — Framer Pill Selection (Surface-2 lift, no chromatic fill) */}
          <nav aria-label="Navegação Principal" className="flex flex-col gap-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleItemClick(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-full text-[14px] font-medium tracking-[-0.14px] transition-all duration-150 text-left cursor-pointer group border ${
                    isActive
                      ? 'bg-[#1c1c1c] text-[#ffffff] border-[#262626] shadow-[inset_0_0.5px_0_0_rgba(255,255,255,0.10)]'
                      : 'bg-transparent text-[#999999] border-transparent hover:text-[#ffffff] hover:bg-[#141414]'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Icon className={`w-4 h-4 shrink-0 transition-colors ${
                      isActive ? 'text-[#ffffff]' : 'text-[#999999] group-hover:text-[#ffffff]'
                    }`} />
                    {!isCollapsed && (
                      <span className="truncate">
                        {item.label}
                      </span>
                    )}
                  </div>
                  {!isCollapsed && isActive && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#0099ff] shrink-0" />
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Section: Focus Mode Card & User Profile */}
        <div className="flex flex-col gap-3 pt-4 border-t border-[#1a1a1a]">
          
          {/* 1. Modo Foco Ativado Component — Surface-1 (#141414) */}
          {!isCollapsed && (
            <div className="bg-[#141414] border border-[#262626] rounded-[15px] p-3 flex items-center justify-between">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-7 h-7 rounded-full bg-[#1c1c1c] border border-[#262626] flex items-center justify-center text-[#0099ff] shrink-0">
                  <Zap className="w-3.5 h-3.5 fill-current" />
                </div>
                <div className="flex flex-col text-left min-w-0">
                  <span className="text-[13px] font-medium tracking-[-0.13px] text-[#ffffff] truncate">
                    Modo Foco Ativado
                  </span>
                  <span className="text-[11px] text-[#999999] tracking-[-0.12px] truncate">
                    Você está no controle.
                  </span>
                </div>
              </div>

              {/* Framer Monochrome Switch Toggle */}
              <button
                type="button"
                onClick={onToggleCalmMode}
                className={`w-9 h-5 flex items-center rounded-full p-0.5 transition-colors duration-200 cursor-pointer shrink-0 border ${
                  isCalmMode ? 'bg-[#ffffff] border-[#ffffff]' : 'bg-[#1c1c1c] border-[#262626]'
                }`}
              >
                <div 
                  className={`w-3.5 h-3.5 rounded-full transform transition-transform duration-200 ${
                    isCalmMode ? 'translate-x-4 bg-[#000000]' : 'translate-x-0 bg-[#999999]'
                  }`}
                />
              </button>
            </div>
          )}

          {/* 2. Perfil do Usuário — Surface-1 (#141414) */}
          <div 
            className="flex items-center justify-between p-2 rounded-[15px] bg-[#141414] border border-[#262626] hover:bg-[#1c1c1c] transition-colors"
            data-purpose="user-profile"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="relative shrink-0">
                <div className="w-8 h-8 rounded-full bg-[#1c1c1c] border border-[#262626] flex items-center justify-center text-xs font-semibold text-[#ffffff]">
                  {initials}
                </div>
                {/* Semantic Success Green Presence Indicator (#22c55e) */}
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[#22c55e] rounded-full border-2 border-[#090909]" />
              </div>

              {!isCollapsed && (
                <div className="flex flex-col min-w-0 text-left">
                  <span className="text-[13px] font-medium tracking-[-0.13px] text-[#ffffff] truncate">
                    {userName}
                  </span>
                  <span className="text-[11px] text-[#999999] tracking-[-0.12px] truncate">
                    {userRole}
                  </span>
                </div>
              )}
            </div>

            {!isCollapsed && (
              <button
                type="button"
                className="w-7 h-7 rounded-full bg-[#1c1c1c] border border-[#262626] flex items-center justify-center text-[#999999] hover:text-[#ffffff] transition-colors cursor-pointer shrink-0"
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
