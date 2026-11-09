import React, { useState } from 'react';
import { 
  Repeat, 
  Plus, 
  Sun, 
  Moon, 
  Clock, 
  Check, 
  Sparkles, 
  ShieldCheck, 
  Trash2,
  CalendarCheck
} from 'lucide-react';
import { Habit, RoutineTimeOfDay } from '../../types';

interface RoutineViewProps {
  habits: Habit[];
  onToggleHabit: (habitId: string) => void;
  onAddHabit: (habitData: Omit<Habit, 'id' | 'created_at' | 'completed_dates'>) => void;
  onDeleteHabit: (id: string) => void;
}

export const RoutineView: React.FC<RoutineViewProps> = ({
  habits,
  onToggleHabit,
  onAddHabit,
  onDeleteHabit
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [title, setTitle] = useState('');
  const [timeOfDay, setTimeOfDay] = useState<RoutineTimeOfDay>('matinal');
  const [minVersion, setMinVersion] = useState('');
  const [durationMinutes, setDurationMinutes] = useState(15);

  const todayStr = new Date().toISOString().slice(0, 10);

  const handleCreateHabit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !minVersion.trim()) return;

    onAddHabit({
      title: title.trim(),
      time_of_day: timeOfDay,
      frequency: 'diario',
      min_version: minVersion.trim(),
      duration_minutes: durationMinutes
    });

    setTitle('');
    setMinVersion('');
    setShowAddModal(false);
  };

  const morningHabits = habits.filter(h => h.time_of_day === 'matinal');
  const afternoonHabits = habits.filter(h => h.time_of_day === 'tarde');
  const eveningHabits = habits.filter(h => h.time_of_day === 'noturna');

  return (
    <div className="space-y-5 text-left" data-purpose="routine-view">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-4">
        <div>
          <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
            <Repeat className="w-5 h-5 text-emerald-600 dark:text-emerald-500" />
            Rotina & Hábitos Sustentáveis
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Consistência real sem culpa. Todo hábito tem uma versão mínima para dias de baixa bateria mental.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Novo Hábito</span>
        </button>
      </div>

      {/* Filosofia Anti-Culpa */}
      <div className="p-3.5 rounded-xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/50 dark:bg-emerald-950/20 text-xs text-emerald-900 dark:text-emerald-200 leading-relaxed">
        <strong>💡 Filosofia TDAH da Versão Mínima:</strong> Se hoje você está sem energia, não zere seu progresso. Faça apenas a <em>versão mínima</em> (ex: 3 minutos de leitura ou 5 goles de água). Manter o elo neurológico é 100x mais valioso do que a perfeição.
      </div>

      {/* Blocos de Horário */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-start">
        {/* Bloco 1: Rotina Matinal */}
        <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-3 shadow-xs">
          <div className="flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-800 pb-2.5">
            <Sun className="w-4 h-4 text-amber-500" />
            <h3 className="text-xs font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-wide">
              Manhã (Ativação)
            </h3>
          </div>

          <div className="space-y-2">
            {morningHabits.length === 0 ? (
              <p className="text-xs text-zinc-400 py-4 text-center">Nenhum hábito matinal cadastrado.</p>
            ) : (
              morningHabits.map(h => {
                const isDone = h.completed_dates.includes(todayStr);
                return (
                  <div
                    key={h.id}
                    onClick={() => onToggleHabit(h.id)}
                    className={`p-3 rounded-lg border transition-all cursor-pointer flex items-start justify-between gap-2.5 ${
                      isDone
                        ? 'bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800'
                        : 'bg-zinc-50/60 dark:bg-zinc-800/40 border-zinc-200 dark:border-zinc-700/60 hover:border-zinc-300'
                    }`}
                  >
                    <div className="min-w-0">
                      <span className={`text-xs font-semibold block ${isDone ? 'line-through text-emerald-800 dark:text-emerald-300' : 'text-zinc-900 dark:text-zinc-100'}`}>
                        {h.title}
                      </span>
                      <span className="text-[10px] text-zinc-500 dark:text-zinc-400 block mt-1">
                        Mínimo: <em className="text-emerald-700 dark:text-emerald-400">{h.min_version}</em>
                      </span>
                    </div>

                    <div className={`w-4 h-4 rounded mt-0.5 flex items-center justify-center border flex-shrink-0 ${
                      isDone ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-zinc-300 dark:border-zinc-600'
                    }`}>
                      {isDone && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Bloco 2: Tarde / Ao longo do dia */}
        <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-3 shadow-xs">
          <div className="flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-800 pb-2.5">
            <Clock className="w-4 h-4 text-blue-500" />
            <h3 className="text-xs font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-wide">
              Tarde (Sustentação)
            </h3>
          </div>

          <div className="space-y-2">
            {afternoonHabits.length === 0 ? (
              <p className="text-xs text-zinc-400 py-4 text-center">Nenhum hábito vespertino cadastrado.</p>
            ) : (
              afternoonHabits.map(h => {
                const isDone = h.completed_dates.includes(todayStr);
                return (
                  <div
                    key={h.id}
                    onClick={() => onToggleHabit(h.id)}
                    className={`p-3 rounded-lg border transition-all cursor-pointer flex items-start justify-between gap-2.5 ${
                      isDone
                        ? 'bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800'
                        : 'bg-zinc-50/60 dark:bg-zinc-800/40 border-zinc-200 dark:border-zinc-700/60 hover:border-zinc-300'
                    }`}
                  >
                    <div className="min-w-0">
                      <span className={`text-xs font-semibold block ${isDone ? 'line-through text-emerald-800 dark:text-emerald-300' : 'text-zinc-900 dark:text-zinc-100'}`}>
                        {h.title}
                      </span>
                      <span className="text-[10px] text-zinc-500 dark:text-zinc-400 block mt-1">
                        Mínimo: <em className="text-emerald-700 dark:text-emerald-400">{h.min_version}</em>
                      </span>
                    </div>

                    <div className={`w-4 h-4 rounded mt-0.5 flex items-center justify-center border flex-shrink-0 ${
                      isDone ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-zinc-300 dark:border-zinc-600'
                    }`}>
                      {isDone && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Bloco 3: Rotina Noturna */}
        <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-3 shadow-xs">
          <div className="flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-800 pb-2.5">
            <Moon className="w-4 h-4 text-indigo-400" />
            <h3 className="text-xs font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-wide">
              Noite (Desaceleração)
            </h3>
          </div>

          <div className="space-y-2">
            {eveningHabits.length === 0 ? (
              <p className="text-xs text-zinc-400 py-4 text-center">Nenhum hábito noturno cadastrado.</p>
            ) : (
              eveningHabits.map(h => {
                const isDone = h.completed_dates.includes(todayStr);
                return (
                  <div
                    key={h.id}
                    onClick={() => onToggleHabit(h.id)}
                    className={`p-3 rounded-lg border transition-all cursor-pointer flex items-start justify-between gap-2.5 ${
                      isDone
                        ? 'bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800'
                        : 'bg-zinc-50/60 dark:bg-zinc-800/40 border-zinc-200 dark:border-zinc-700/60 hover:border-zinc-300'
                    }`}
                  >
                    <div className="min-w-0">
                      <span className={`text-xs font-semibold block ${isDone ? 'line-through text-emerald-800 dark:text-emerald-300' : 'text-zinc-900 dark:text-zinc-100'}`}>
                        {h.title}
                      </span>
                      <span className="text-[10px] text-zinc-500 dark:text-zinc-400 block mt-1">
                        Mínimo: <em className="text-emerald-700 dark:text-emerald-400">{h.min_version}</em>
                      </span>
                    </div>

                    <div className={`w-4 h-4 rounded mt-0.5 flex items-center justify-center border flex-shrink-0 ${
                      isDone ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-zinc-300 dark:border-zinc-600'
                    }`}>
                      {isDone && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Modal Criar Hábito */}
      {showAddModal && (
        <div 
          role="dialog" 
          aria-modal="true" 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/70 backdrop-blur-xs animate-in fade-in duration-150"
        >
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 w-full max-w-md shadow-xl text-left space-y-3">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Novo Hábito Sustentável</h3>
            <form onSubmit={handleCreateHabit} className="space-y-3">
              <div>
                <label className="text-xs text-zinc-500 block mb-1">Nome do Hábito</label>
                <input
                  type="text"
                  required
                  autoFocus
                  placeholder="Ex: Meditação guiada ou respiração"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs"
                />
              </div>

              <div>
                <label className="text-xs text-zinc-500 block mb-1">Período do Dia</label>
                <select
                  value={timeOfDay}
                  onChange={(e) => setTimeOfDay(e.target.value as RoutineTimeOfDay)}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs"
                >
                  <option value="matinal">Manhã</option>
                  <option value="tarde">Tarde</option>
                  <option value="noturna">Noite</option>
                  <option value="qualquer">Qualquer horário</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-zinc-500 block mb-1">
                  Versão Mínima para Dias de Baixa Energia *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: 3 respirações profundas de olhos fechados"
                  value={minVersion}
                  onChange={(e) => setMinVersion(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3.5 py-1.5 rounded-lg text-xs text-zinc-500"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  Salvar Hábito
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

