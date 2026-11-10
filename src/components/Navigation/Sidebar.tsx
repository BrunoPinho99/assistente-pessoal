import React from 'react';
import { 
  Sun, 
  Moon,
  CheckSquare, 
  Folder, 
  GraduationCap,
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
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  userName = 'Bruno Pinho',
  userRole = 'Espaço pessoal',
  themeMode = 'dark',
  onChangeThemeMode,
  isMobileOpen = false,
  onCloseMobile
}) => {
  const isDark = themeMode === 'dark';

  const navItems: { id: NavigationTab; label: string; icon: React.ReactNode }[] = [
    { id: 'hoje', label: 'Hoje', icon: <Sun className="w-4 h-4 stroke-[1.75]" /> },
    { id: 'tarefas', label: 'Tarefas', icon: <CheckSquare className="w-4 h-4 stroke-[1.75]" /> },
    { id: 'projetos', label: 'Projetos', icon: <Folder className="w-4 h-4 stroke-[1.75]" /> },
    { id: 'estudos', label: 'Estudos', icon: <GraduationCap className="w-4 h-4 stroke-[1.75]" /> },
  ];

  const handleSelectTab = (tab: NavigationTab) => {
    onTabChange(tab);
    if (onCloseMobile) onCloseMobile();
  };

  return (
    <>
      {/* Backdrop no Mobile */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/75 backdrop-blur-xs md:hidden animate-in fade-in duration-150"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={`w-[244px] flex-shrink-0 flex flex-col justify-between p-4 select-none z-50 transition-all duration-200 border-r ${
          isDark
            ? 'bg-[#090909] border-[#262626]'
            : 'bg-[#ffffff] border-[#e4e4e7]'
        } ${
          isMobileOpen
            ? 'fixed inset-y-0 left-0 flex shadow-2xl'
            : 'hidden md:flex'
        }`}
        data-purpose="sidebar-navigation"
      >
        {/* Top Section: Brand Header & Navigation */}
        <div className="space-y-6">
          {/* App Brand Identity (Framer Monogram) */}
          <div className="flex items-center justify-between px-2 pt-1">
            <div className="flex items-center gap-3">
              <div
                className={`w-7 h-7 rounded-[8px] flex items-center justify-center font-bold text-[13px] tracking-tighter shrink-0 transition-colors ${
                  isDark
                    ? 'bg-[#ffffff] text-[#000000]'
                    : 'bg-[#090909] text-[#ffffff]'
                }`}
              >
                P
              </div>
              <span
                className={`font-medium text-[15px] tracking-[-0.4px] ${
                  isDark ? 'text-[#ffffff]' : 'text-[#090909]'
                }`}
              >
                Personal OS
              </span>
            </div>

            {isMobileOpen && onCloseMobile && (
              <button
                type="button"
                onClick={onCloseMobile}
                className={`md:hidden p-1.5 rounded-full transition-colors cursor-pointer ${
                  isDark
                    ? 'text-[#999999] hover:text-[#ffffff] hover:bg-[#141414]'
                    : 'text-[#666666] hover:text-[#090909] hover:bg-[#f0f0f2]'
                }`}
                aria-label="Fechar menu"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Primary Navigation Links */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleSelectTab(item.id)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-full text-[14px] font-medium tracking-[-0.14px] transition-all duration-150 cursor-pointer text-left ${
                    isActive
                      ? isDark
                        ? 'bg-[#1c1c1c] text-[#ffffff] border border-[#262626]'
                        : 'bg-[#090909] text-[#ffffff] border border-[#090909]'
                      : isDark
                        ? 'text-[#999999] hover:text-[#ffffff] hover:bg-[#141414] border border-transparent'
                        : 'text-[#666666] hover:text-[#090909] hover:bg-[#f2f2f4] border border-transparent'
                  }`}
                >
                  <span
                    className={
                      isActive
                        ? 'text-[#ffffff]'
                        : isDark
                          ? 'text-[#999999]'
                          : 'text-[#666666]'
                    }
                  >
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                  {isActive && (
                    <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#0099ff]" />
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Section: Theme Switcher (Dark/Light) & User Profile */}
        <div className="space-y-2.5">
          {/* Theme Switcher Pill (Versão Escura / Versão Clara) */}
          {onChangeThemeMode && (
            <div
              className={`p-1 rounded-full border grid grid-cols-2 gap-1 ${
                isDark
                  ? 'bg-[#141414] border-[#262626]'
                  : 'bg-[#f0f0f2] border-[#e4e4e7]'
              }`}
            >
              <button
                type="button"
                onClick={() => onChangeThemeMode('dark')}
                className={`py-1.5 px-2.5 rounded-full text-[12px] font-medium tracking-[-0.12px] flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  isDark
                    ? 'bg-[#1c1c1c] text-[#ffffff] shadow-xs'
                    : 'text-[#666666] hover:text-[#090909]'
                }`}
              >
                <Moon className="w-3.5 h-3.5" />
                <span>Escuro</span>
              </button>
              <button
                type="button"
                onClick={() => onChangeThemeMode('light')}
                className={`py-1.5 px-2.5 rounded-full text-[12px] font-medium tracking-[-0.12px] flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  !isDark
                    ? 'bg-[#ffffff] text-[#090909] shadow-xs'
                    : 'text-[#999999] hover:text-[#ffffff]'
                }`}
              >
                <Sun className="w-3.5 h-3.5" />
                <span>Claro</span>
              </button>
            </div>
          )}

          {/* User Profile Card */}
          <div
            className={`flex items-center gap-3 p-3 rounded-[15px] border transition-colors cursor-pointer ${
              isDark
                ? 'bg-[#141414] border-[#262626] hover:bg-[#1c1c1c]'
                : 'bg-[#f7f7f8] border-[#e4e4e7] hover:bg-[#efefef]'
            }`}
          >
            <div className="relative">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-medium text-[12px] shrink-0 border ${
                  isDark
                    ? 'bg-[#1c1c1c] border-[#262626] text-[#ffffff]'
                    : 'bg-[#ffffff] border-[#e4e4e7] text-[#090909]'
                }`}
              >
                BP
              </div>
              <span
                className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-[#22c55e] border-2 rounded-full ${
                  isDark ? 'border-[#141414]' : 'border-[#f7f7f8]'
                }`}
              />
            </div>

            <div className="overflow-hidden text-left">
              <p
                className={`text-[13px] font-medium truncate tracking-[-0.13px] ${
                  isDark ? 'text-[#ffffff]' : 'text-[#090909]'
                }`}
              >
                {userName}
              </p>
              <p
                className={`text-[11px] truncate font-normal tracking-[-0.11px] ${
                  isDark ? 'text-[#999999]' : 'text-[#666666]'
                }`}
              >
                {userRole}
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
