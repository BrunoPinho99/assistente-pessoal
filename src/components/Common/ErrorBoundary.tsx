import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RotateCcw, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleResetData = () => {
    try {
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('personal_os_')) {
          localStorage.removeItem(key);
        }
      });
    } catch (e) {
      console.error('Erro ao limpar localStorage:', e);
    }
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen w-full bg-[#090909] text-white flex items-center justify-center p-6 font-sans">
          <div className="max-w-md w-full bg-[#141414] border border-[#262626] rounded-[20px] p-6 sm:p-8 shadow-2xl flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-full bg-[#1c1c1c] border border-[#262626] flex items-center justify-center text-white mb-4">
              <AlertTriangle className="w-6 h-6 text-white" />
            </div>
            
            <h2 className="text-xl font-medium tracking-tight text-white mb-2">
              Recuperação do Personal OS
            </h2>
            
            <p className="text-xs text-[#999999] leading-relaxed mb-6">
              Ocorreu uma inconsistência no carregamento da interface. Você pode tentar recarregar ou restaurar os dados padrão com segurança.
            </p>

            {this.state.error && (
              <div className="w-full bg-[#1c1c1c] border border-[#262626] rounded-xl p-3 text-left mb-6 overflow-hidden">
                <p className="text-[11px] font-mono text-rose-400 break-all line-clamp-3">
                  {this.state.error.message || String(this.state.error)}
                </p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center gap-3 w-full">
              <button
                type="button"
                onClick={this.handleReload}
                className="w-full sm:flex-1 py-2.5 px-4 rounded-full text-xs font-semibold bg-white hover:bg-neutral-200 text-black flex items-center justify-center gap-2 cursor-pointer transition-all shadow-sm"
              >
                <RefreshCw className="w-3.5 h-3.5 text-black" />
                <span>Recarregar</span>
              </button>
              
              <button
                type="button"
                onClick={this.handleResetData}
                className="w-full sm:flex-1 py-2.5 px-4 rounded-full text-xs font-medium bg-[#1c1c1c] hover:bg-[#262626] text-[#999999] hover:text-white border border-[#262626] flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <RotateCcw className="w-3.5 h-3.5 text-[#999999]" />
                <span>Restaurar padrão</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

