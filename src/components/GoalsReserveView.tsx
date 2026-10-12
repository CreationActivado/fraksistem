import React, { useState } from 'react';
import {
  ShieldCheck,
  Target,
  Plus,
  Edit2,
  TrendingUp,
  Calendar,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { Reserve, FinancialGoal, Account } from '../types';
import { api } from '../services/api';

interface GoalsReserveViewProps {
  reserve: Reserve | null;
  goals: FinancialGoal[];
  accounts: Account[];
  onRefreshData: () => void;
}

export const GoalsReserveView: React.FC<GoalsReserveViewProps> = ({
  reserve,
  goals,
  accounts,
  onRefreshData,
}) => {
  const [isEditingReserve, setIsEditingReserve] = useState(false);
  const [reserveTarget, setReserveTarget] = useState(reserve?.targetAmount || 1500);
  const [reserveTargetDate, setReserveTargetDate] = useState(reserve?.targetDate || '');

  const [isCreatingGoal, setIsCreatingGoal] = useState(false);
  const [goalName, setGoalName] = useState('');
  const [goalTarget, setGoalTarget] = useState<number>(500);
  const [goalCurrent, setGoalCurrent] = useState<number>(0);
  const [goalDeadline, setGoalDeadline] = useState('');
  const [goalPriority, setGoalPriority] = useState<FinancialGoal['priority']>('medium');

  // Contribution state
  const [contributingGoal, setContributingGoal] = useState<FinancialGoal | null>(null);
  const [contributionAmount, setContributionAmount] = useState<number>(50);

  const handleUpdateReserve = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.updateReserve({
        targetAmount: Number(reserveTarget),
        targetDate: reserveTargetDate,
      });
      setIsEditingReserve(false);
      onRefreshData();
    } catch (err) {
      console.error('Error updating reserve:', err);
    }
  };

  const handleCreateGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!goalName.trim()) return;

    try {
      await api.createGoal({
        name: goalName.trim(),
        targetAmount: Number(goalTarget),
        currentAmount: Number(goalCurrent) || 0,
        targetDate: goalDeadline || undefined,
        priority: goalPriority,
        status: 'in_progress',
      });
      setIsCreatingGoal(false);
      setGoalName('');
      setGoalTarget(500);
      setGoalCurrent(0);
      onRefreshData();
    } catch (err) {
      console.error('Error creating goal:', err);
    }
  };

  const handleContribute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contributingGoal) return;

    try {
      const newAmt = contributingGoal.currentAmount + Number(contributionAmount);
      await api.updateGoal(contributingGoal.id, { currentAmount: newAmt });
      setContributingGoal(null);
      setContributionAmount(50);
      onRefreshData();
    } catch (err) {
      console.error('Error contributing to goal:', err);
    }
  };

  if (!reserve) return null;

  return (
    <div className="space-y-6 pb-24 max-w-5xl mx-auto text-slate-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white">Reserva y Objetivos</h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Fondo de tranquilidad y metas de ahorro a corto y mediano plazo
          </p>
        </div>

        <button
          onClick={() => setIsCreatingGoal(true)}
          className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold shadow-lg shadow-blue-500/20 transition-all w-fit"
          id="btn-new-goal"
        >
          <Plus className="w-4 h-4" />
          Nuevo Objetivo
        </button>
      </div>

      {/* RESERVA DE SEGURIDAD SECTION */}
      <div className="bg-[#1E293B] p-6 rounded-2xl border border-slate-800 shadow-sm space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-purple-950/50 border border-purple-800/40 text-purple-400 flex items-center justify-center font-bold">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white">
                Reserva de Seguridad (Fondo de Emergencia)
              </h2>
              <p className="text-xs text-slate-400">
                Colchón de tranquilidad calculado directamente sobre tus cuentas asignadas
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              setReserveTarget(reserve.targetAmount);
              setReserveTargetDate(reserve.targetDate || '');
              setIsEditingReserve(true);
            }}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
            title="Ajustar objetivo de reserva"
          >
            <Edit2 className="w-4 h-4" />
          </button>
        </div>

        {/* Progress Bar & Numbers */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-slate-900/80 rounded-xl border border-slate-800">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block">
              Reserva Actual
            </span>
            <span className="text-2xl font-bold text-purple-400 mt-1 block">
              {reserve.currentAmount.toLocaleString('es-ES', { minimumFractionDigits: 2 })} €
            </span>
            <span className="text-[11px] text-slate-400">En cuentas designadas</span>
          </div>

          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block">
              Objetivo Deseado
            </span>
            <span className="text-2xl font-bold text-white mt-1 block">
              {reserve.targetAmount.toLocaleString('es-ES', { minimumFractionDigits: 2 })} €
            </span>
            <span className="text-[11px] text-slate-400">
              {reserve.targetDate ? `Meta: ${reserve.targetDate}` : 'Meta continua'}
            </span>
          </div>

          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block">
              Faltante
            </span>
            <span className="text-2xl font-bold text-slate-300 mt-1 block">
              {Math.max(0, reserve.targetAmount - reserve.currentAmount).toLocaleString('es-ES', {
                minimumFractionDigits: 2,
              })}{' '}
              €
            </span>
            <span className="text-[11px] text-slate-400">Para completar el colchón</span>
          </div>
        </div>

        <div>
          <div className="flex justify-between text-xs text-slate-400 font-medium mb-1.5">
            <span>Progreso del objetivo</span>
            <span className="font-bold text-purple-400">{reserve.percentage}%</span>
          </div>
          <div className="w-full bg-slate-900 rounded-full h-3 overflow-hidden border border-slate-800">
            <div
              className="bg-purple-600 h-3 rounded-full transition-all"
              style={{ width: `${Math.min(100, reserve.percentage)}%` }}
            ></div>
          </div>
        </div>

        {/* Accounts linked to reserve */}
        <div className="pt-2">
          <span className="text-xs font-semibold text-slate-300 block mb-2">
            Cuentas con fondos reservados:
          </span>
          <div className="flex flex-wrap gap-2">
            {accounts
              .filter((a) => a.isReserve)
              .map((acc) => (
                <span
                  key={acc.id}
                  className="text-xs bg-purple-500/10 text-purple-300 border border-purple-500/20 px-3 py-1 rounded-lg font-medium flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-purple-400" />
                  {acc.name}: {acc.balance} {acc.currency}
                </span>
              ))}
            {accounts.filter((a) => a.isReserve).length === 0 && (
              <p className="text-xs text-slate-500">
                No has marcado ninguna cuenta como reserva. Puedes marcarla en la sección Cuentas.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* FINANCIAL GOALS LIST */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <Target className="w-5 h-5 text-blue-400" />
          Objetivos Financieros ({goals.length})
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {goals.map((goal) => {
            const pct =
              goal.targetAmount > 0
                ? Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100))
                : 0;

            return (
              <div
                key={goal.id}
                className="bg-[#1E293B] p-5 rounded-2xl border border-slate-800 shadow-sm hover:border-slate-700 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <h3 className="font-bold text-white text-base">{goal.name}</h3>
                      {goal.targetDate && (
                        <span className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                          <Calendar className="w-3.5 h-3.5" />
                          Plazo: {goal.targetDate}
                        </span>
                      )}
                    </div>

                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                        goal.priority === 'high'
                          ? 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                          : goal.priority === 'medium'
                          ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                          : 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                      }`}
                    >
                      Prioridad {goal.priority}
                    </span>
                  </div>

                  <div className="mt-4 flex items-baseline justify-between">
                    <span className="text-2xl font-bold text-white">
                      {goal.currentAmount.toLocaleString('es-ES', { minimumFractionDigits: 0 })} €
                    </span>
                    <span className="text-xs font-semibold text-slate-400">
                      de {goal.targetAmount.toLocaleString('es-ES', { minimumFractionDigits: 0 })} €
                    </span>
                  </div>

                  <div className="mt-2">
                    <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
                      <div
                        className="bg-emerald-500 h-2 rounded-full transition-all"
                        style={{ width: `${pct}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-[11px] text-slate-400 mt-1">
                      <span>{pct}% completado</span>
                      <span>Faltan {Math.max(0, goal.targetAmount - goal.currentAmount)} €</span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-800 flex justify-end">
                  <button
                    onClick={() => setContributingGoal(goal)}
                    className="flex items-center gap-1.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Aportar Ahorro
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal: Edit Reserve */}
      {isEditingReserve && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#1E293B] border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white">Ajustar Reserva de Seguridad</h3>

            <form onSubmit={handleUpdateReserve} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Monto Objetivo (€)
                </label>
                <input
                  type="number"
                  step="10"
                  value={reserveTarget}
                  onChange={(e) => setReserveTarget(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Fecha estimada (opcional)
                </label>
                <input
                  type="date"
                  value={reserveTargetDate}
                  onChange={(e) => setReserveTargetDate(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsEditingReserve(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold bg-purple-600 hover:bg-purple-500 text-white rounded-xl shadow-lg shadow-purple-600/20 transition-colors"
                >
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Create Goal */}
      {isCreatingGoal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#1E293B] border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white">Nuevo Objetivo Financiero</h3>

            <form onSubmit={handleCreateGoal} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Nombre del objetivo
                </label>
                <input
                  type="text"
                  value={goalName}
                  onChange={(e) => setGoalName(e.target.value)}
                  placeholder="Ej: Equipamiento taller, Vacaciones, Fondo estudios..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Monto Meta (€)
                  </label>
                  <input
                    type="number"
                    step="10"
                    value={goalTarget}
                    onChange={(e) => setGoalTarget(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Ahorrado Inicial (€)
                  </label>
                  <input
                    type="number"
                    step="10"
                    value={goalCurrent}
                    onChange={(e) => setGoalCurrent(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Plazo límite
                  </label>
                  <input
                    type="date"
                    value={goalDeadline}
                    onChange={(e) => setGoalDeadline(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Prioridad
                  </label>
                  <select
                    value={goalPriority}
                    onChange={(e) => setGoalPriority(e.target.value as any)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="high">Alta</option>
                    <option value="medium">Media</option>
                    <option value="low">Baja</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsCreatingGoal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-lg shadow-blue-500/20 transition-colors"
                >
                  Crear Objetivo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Contribute to Goal */}
      {contributingGoal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#1E293B] border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white">
              Aportar a "{contributingGoal.name}"
            </h3>
            <p className="text-xs text-slate-400">
              Actualmente tienes acumulados <strong className="text-emerald-400">{contributingGoal.currentAmount} €</strong> de {contributingGoal.targetAmount} €.
            </p>

            <form onSubmit={handleContribute} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Monto a sumar (€)
                </label>
                <input
                  type="number"
                  step="5"
                  value={contributionAmount}
                  onChange={(e) => setContributionAmount(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setContributingGoal(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow-lg shadow-emerald-600/20 transition-colors"
                >
                  Confirmar Aporte
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
