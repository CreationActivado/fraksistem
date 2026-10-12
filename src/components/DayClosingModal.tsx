import React, { useState } from 'react';
import {
  Moon,
  Star,
  CheckCircle2,
  DollarSign,
  Target,
  X,
  Sparkles,
  Calendar,
  Smile,
  Zap,
} from 'lucide-react';
import { api } from '../services/api';
import { DayClosing, Task } from '../types';

interface DayClosingModalProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: Task[];
  onSuccess: () => void;
}

export const DayClosingModal: React.FC<DayClosingModalProps> = ({
  isOpen,
  onClose,
  tasks,
  onSuccess,
}) => {
  const [rating, setRating] = useState<number>(4);
  const [achievements, setAchievements] = useState('');
  const [revenueToday, setRevenueToday] = useState<number | ''>('');
  const [tomorrowFocus, setTomorrowFocus] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const completedTodayCount = tasks.filter((t) => t.status === 'done').length;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.createDayClosing({
        date: new Date().toISOString().split('T')[0],
        rating,
        achievements: achievements.trim() || 'Día completado',
        tasksCompleted: completedTodayCount,
        tasksPending: tasks.filter((t) => t.status !== 'done').length,
        totalIncome: revenueToday === '' ? 0 : Number(revenueToday),
        totalSpent: 0,
        revenueGenerated: revenueToday === '' ? 0 : Number(revenueToday),
        tomorrowFocus: tomorrowFocus.trim() || undefined,
        notes: notes.trim() || undefined,
      });

      onSuccess();
      onClose();
    } catch (err) {
      console.error('Error saving day closing:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/70">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-md">
              <Moon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-white text-base sm:text-lg flex items-center gap-2">
                Cierre del Día
                <span className="text-[10px] bg-purple-500/20 text-purple-300 font-semibold px-2 py-0.5 rounded-full border border-purple-500/30">
                  JARVIS 2.0
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Frená 2 minutos. Evaluá cómo te fue hoy y dejá definido el foco de mañana.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1">
          {/* Day Rating */}
          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 text-center">
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              ¿Cómo calificás tu día hoy?
            </label>
            <div className="flex items-center justify-center gap-3">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className={`p-2 rounded-xl transition-all transform active:scale-90 ${
                    rating >= star
                      ? 'text-amber-400 scale-110'
                      : 'text-slate-600 hover:text-slate-400'
                  }`}
                >
                  <Star
                    className={`w-7 h-7 ${
                      rating >= star ? 'fill-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]' : ''
                    }`}
                  />
                </button>
              ))}
            </div>
            <p className="text-[11px] text-slate-400 mt-2">
              {rating === 5 && '🔥 ¡Día excelente y de máximo avance!'}
              {rating === 4 && '⚡ Muy buen día, productivo y con foco.'}
              {rating === 3 && '👍 Día aceptable, se mantuvo el rumbo.'}
              {rating === 2 && '⚠️ Día disperso o complicado, mañana se ajusta.'}
              {rating === 1 && '🛑 Día para olvidar y recuperar energía.'}
            </p>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-950/40 p-3 rounded-xl border border-slate-800">
              <span className="text-[11px] text-slate-400 flex items-center gap-1 mb-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" /> Tareas completadas
              </span>
              <div className="text-xl font-bold text-white">{completedTodayCount}</div>
            </div>

            <div className="bg-slate-950/40 p-3 rounded-xl border border-slate-800">
              <span className="text-[11px] text-slate-400 flex items-center gap-1 mb-1">
                <DollarSign className="w-3.5 h-3.5 text-emerald-400" /> Cobrado / Generado (€)
              </span>
              <input
                type="number"
                step="0.01"
                value={revenueToday}
                onChange={(e) =>
                  setRevenueToday(e.target.value === '' ? '' : parseFloat(e.target.value))
                }
                placeholder="0.00"
                className="w-full bg-transparent border-none p-0 text-xl font-bold text-emerald-400 focus:outline-none"
              />
            </div>
          </div>

          {/* What did I achieve? */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" /> ¿Qué lograste hoy? *
            </label>
            <textarea
              required
              rows={2}
              value={achievements}
              onChange={(e) => setAchievements(e.target.value)}
              placeholder="Ej. Entregué cartelería, hablé con 3 clientes de Creko, avancé trámites de residencia..."
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 resize-none"
            />
          </div>

          {/* Tomorrow's Focus */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-amber-400" /> Foco principal de mañana (Tu prioridad #1)
            </label>
            <input
              type="text"
              value={tomorrowFocus}
              onChange={(e) => setTomorrowFocus(e.target.value)}
              placeholder="Ej. Cerrar presupuesto con Bar DejaVu y comprar materiales"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Extra notes */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">
              Notas adicionales o aprendizajes (opcional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Cosas a no repetir, ideas que surgieron..."
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-slate-500"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white rounded-xl hover:bg-slate-800"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 text-xs font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl shadow-lg shadow-indigo-600/30 transition-all active:scale-95"
            >
              Guardar Cierre y Descansar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
