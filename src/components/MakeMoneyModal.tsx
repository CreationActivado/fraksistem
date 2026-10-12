import React, { useEffect, useState } from 'react';
import {
  DollarSign,
  X,
  Clock,
  Send,
  MessageCircle,
  PhoneCall,
  CheckCircle,
  ArrowRight,
  Sparkles,
  Layers,
} from 'lucide-react';
import { api } from '../services/api';

interface MakeMoneyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (view: string) => void;
}

export const MakeMoneyModal: React.FC<MakeMoneyModalProps> = ({ isOpen, onClose, onNavigate }) => {
  const [duration, setDuration] = useState<'30m' | '1h' | '2h' | '4h' | 'allday'>('1h');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<{
    duration: string;
    actions: Array<{
      title: string;
      category: string;
      potentialAmount: number;
      estimatedTime: string;
      actionType: string;
    }>;
    estimatedPotential: number;
    message: string;
  } | null>(null);

  const fetchActions = (dur: '30m' | '1h' | '2h' | '4h' | 'allday') => {
    setLoading(true);
    api
      .getMakeMoneyActions(dur)
      .then((res) => setData(res))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (isOpen) {
      fetchActions(duration);
    }
  }, [isOpen, duration]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#1E293B] border border-slate-700/80 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-800 flex items-center justify-between sticky top-0 bg-[#1E293B] z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                Generador de Ingresos Inmediato
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30">
                  Monetización Real
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Seleccioná cuánto tiempo tenés disponible ahora mismo
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Time available tabs */}
        <div className="p-4 sm:p-6 border-b border-slate-800 bg-slate-900/40">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
            Tiempo disponible para ejecutar:
          </span>
          <div className="grid grid-cols-5 gap-2">
            {[
              { id: '30m', label: '30 min' },
              { id: '1h', label: '1 hora' },
              { id: '2h', label: '2 horas' },
              { id: '4h', label: 'Medio día' },
              { id: 'allday', label: 'Todo el día' },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setDuration(t.id as any)}
                className={`py-2 px-2 rounded-xl text-xs font-bold transition-all text-center ${
                  duration === t.id
                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 border border-emerald-500'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Potential metric callout */}
          <div className="mt-4 p-4 rounded-xl bg-emerald-950/30 border border-emerald-800/40 flex items-center justify-between">
            <div>
              <span className="text-xs text-emerald-300/90 font-medium block">
                Potencial económico desbloqueable:
              </span>
              <span className="text-2xl sm:text-3xl font-extrabold text-emerald-400">
                +{data?.estimatedPotential.toLocaleString('es-ES', { minimumFractionDigits: 0 })} €
              </span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-400 block">Objetivo inmediato</span>
              <span className="text-xs font-bold text-slate-200">Reserva 1.000 €</span>
            </div>
          </div>
        </div>

        {/* Actions list */}
        <div className="p-5 sm:p-6 space-y-3">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            Acciones con retorno económico directo
          </h3>

          {loading ? (
            <div className="py-8 text-center text-slate-400 text-xs animate-pulse">
              Calculando oportunidades de mayor conversión...
            </div>
          ) : (
            <div className="space-y-2.5">
              {data?.actions.map((act, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 hover:border-emerald-800/60 transition-all flex items-center justify-between gap-3"
                >
                  <div className="space-y-1 flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-semibold text-blue-300 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                        {act.category}
                      </span>
                      <span className="text-[11px] text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {act.estimatedTime}
                      </span>
                    </div>
                    <h4 className="text-xs font-bold text-white truncate">{act.title}</h4>
                  </div>

                  <div className="flex items-center gap-2.5 shrink-0">
                    <span className="text-xs font-extrabold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-lg border border-emerald-500/30">
                      +{act.potentialAmount} €
                    </span>

                    <button
                      onClick={() => {
                        onClose();
                        if (act.category.includes('Creko')) onNavigate('creko');
                        else if (act.category.includes('Cobro')) onNavigate('transactions');
                        else onNavigate('creko');
                      }}
                      className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all flex items-center gap-1"
                    >
                      Ejecutar <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-800 bg-slate-900/50 flex items-center justify-between">
          <p className="text-xs text-slate-400">
            Cada acción ejecutada protege tu estabilidad financiera.
          </p>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-all"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
