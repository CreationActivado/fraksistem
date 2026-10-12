import React, { useState, useEffect } from 'react';
import {
  Cigarette,
  X,
  Plus,
  Flame,
  Clock,
  TrendingDown,
  TrendingUp,
  AlertCircle,
  Calendar,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';
import { api } from '../services/api';

interface TobaccoControlModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogged?: () => void;
}

export const TobaccoControlModal: React.FC<TobaccoControlModalProps> = ({
  isOpen,
  onClose,
  onLogged,
}) => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const data = await api.getTobaccoStats();
      setStats(data);
    } catch (err) {
      console.error('Error fetching tobacco stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchStats();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleRegisterSmoke = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      await api.recordSmoke(quantity, notes);
      setSuccessToast(`Cigarrillo registrado. -50 XP aplicados para autocontrol.`);
      setNotes('');
      setQuantity(1);
      await fetchStats();
      if (onLogged) onLogged();
      setTimeout(() => setSuccessToast(null), 3000);
    } catch (err) {
      console.error('Error recording smoke:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#0B1120] border border-slate-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl relative text-slate-200 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400">
              <Cigarette className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                Control de Tabaco
              </h3>
              <p className="text-xs text-slate-400">Autocontrol & Reducción Progresiva</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Success toast */}
        {successToast && (
          <div className="bg-rose-500/20 border-b border-rose-500/30 px-4 py-2.5 text-xs text-rose-300 font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            <span>{successToast}</span>
          </div>
        )}

        <div className="p-5 overflow-y-auto space-y-5">
          {/* Quick Registration Form */}
          <form onSubmit={handleRegisterSmoke} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
            <span className="text-xs font-bold text-white block uppercase tracking-wider">
              Registrar consumo
            </span>

            <div className="flex items-center gap-3">
              <div className="w-28">
                <label className="text-[10px] text-slate-400 block mb-1">Cantidad</label>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs"
                  >
                    -
                  </button>
                  <span className="w-8 text-center font-bold text-sm text-white">{quantity}</span>
                  <button
                    type="button"
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="flex-1">
                <label className="text-[10px] text-slate-400 block mb-1">Nota o contexto (opcional)</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ej. después de comer, estrés..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-rose-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-bold text-xs shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Cigarette className="w-4 h-4" /> Registrar 1 Cigarrillo (-50 XP)
            </button>
          </form>

          {/* Statistics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Hoy</span>
              <span className="text-xl font-black text-rose-400 font-mono mt-0.5 block">
                {stats?.todayCount ?? 0}
              </span>
              <span className="text-[9px] text-slate-500">cigarrillos</span>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Esta Semana</span>
              <span className="text-xl font-black text-amber-400 font-mono mt-0.5 block">
                {stats?.weekCount ?? 0}
              </span>
              <span className="text-[9px] text-slate-500">cigarrillos</span>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Sin Fumar</span>
              <span className="text-xl font-black text-emerald-400 font-mono mt-0.5 block">
                {stats?.hoursWithoutSmoking ?? 0}h
              </span>
              <span className="text-[9px] text-slate-500">{stats?.daysWithoutSmoking ?? 0} días limpios</span>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">XP Restados</span>
              <span className="text-xl font-black text-slate-300 font-mono mt-0.5 block">
                -{stats?.totalXpLost ?? 0}
              </span>
              <span className="text-[9px] text-slate-500">puntos</span>
            </div>
          </div>

          {/* Autocontrol Philosophy Banner */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-3.5 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
            <div className="text-xs">
              <h4 className="font-bold text-white">Regla de Autocontrol, no Castigo</h4>
              <p className="text-slate-400 text-[11px] mt-0.5 leading-relaxed">
                El objetivo no es castigarte ni generar culpa, sino tener conciencia real de cada evento, reducir progresivamente y premiar los días limpios con racha y XP.
              </p>
            </div>
          </div>

          {/* Recent History */}
          <div>
            <h4 className="text-xs font-bold text-white mb-2 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-400" /> Historial de Registros
            </h4>
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-3 divide-y divide-slate-800/80 max-h-48 overflow-y-auto">
              {(!stats?.history || stats.history.length === 0) ? (
                <p className="text-xs text-slate-500 text-center py-2">No hay registros de tabaco aún.</p>
              ) : (
                stats.history.map((h: any) => (
                  <div key={h.id} className="py-2 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-slate-200">
                        🚬 {h.quantity} cigarrillo(s)
                      </span>
                      {h.notes && <p className="text-[10px] text-slate-400">{h.notes}</p>}
                    </div>
                    <div className="text-right">
                      <span className="text-rose-400 font-bold font-mono block">{h.xpDeducted} XP</span>
                      <span className="text-[10px] text-slate-500">
                        {h.date} {h.time || ''}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/60 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white transition-all"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
