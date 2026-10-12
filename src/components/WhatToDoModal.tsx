import React, { useEffect, useState } from 'react';
import {
  Zap,
  X,
  Clock,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  ArrowRight,
  ShieldCheck,
  Calendar,
} from 'lucide-react';
import { api } from '../services/api';

interface WhatToDoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (view: string) => void;
}

export const WhatToDoModal: React.FC<WhatToDoModalProps> = ({ isOpen, onClose, onNavigate }) => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<{
    topActions: Array<{
      id: string;
      type: string;
      title: string;
      amount?: number;
      urgency: string;
      reason: string;
    }>;
    blocks: Array<{
      slot: string;
      focus: string;
      tasks: string[];
    }>;
    why: string;
  } | null>(null);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      api
        .getDailyPlan()
        .then((res) => setData(res))
        .catch((err) => console.error(err))
        .finally(() => setLoading(false));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#1E293B] border border-slate-700/80 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-800 flex items-center justify-between sticky top-0 bg-[#1E293B] z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Zap className="w-5 h-5 fill-amber-400/30" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                Plan Estratégico de Hoy
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-semibold border border-blue-500/30">
                  JARVIS OS
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Lógica fundamental: PROTEGER → ORGANIZAR → EJECUTAR → GENERAR
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

        {/* Body */}
        <div className="p-5 sm:p-6 space-y-6">
          {loading ? (
            <div className="py-12 text-center text-slate-400 text-sm animate-pulse">
              Analizando balance, presupuestos, cobros y plazos...
            </div>
          ) : (
            <>
              {/* Strategic Why Card */}
              {data?.why && (
                <div className="p-4 rounded-xl bg-blue-950/30 border border-blue-800/40 flex items-start gap-3">
                  <ShieldCheck className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-xs font-bold text-blue-300 uppercase tracking-wider block mb-0.5">
                      Diagnóstico de JARVIS
                    </span>
                    <p className="text-xs text-slate-300 leading-relaxed">{data.why}</p>
                  </div>
                </div>
              )}

              {/* Top 3 Actions */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                    Top 3 Acciones Clave de Alto Impacto
                  </h3>
                  <span className="text-[11px] text-slate-400">Prioridad Máxima</span>
                </div>

                <div className="space-y-2.5">
                  {data?.topActions.map((act, idx) => (
                    <div
                      key={act.id}
                      className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 hover:border-slate-700 transition-all flex items-start justify-between gap-3"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-slate-800 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                          {idx + 1}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-xs font-bold text-white">{act.title}</h4>
                            {act.amount !== undefined && (
                              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/30">
                                +{act.amount} €
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                            {act.reason}
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          onClose();
                          if (act.type === 'collect_money') onNavigate('transactions');
                          else if (act.type === 'follow_up_quote') onNavigate('creko');
                          else if (act.type === 'rotuprint_spain') onNavigate('spain_process');
                          else onNavigate('tasks');
                        }}
                        className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-blue-600 text-slate-300 hover:text-white text-xs font-medium transition-all flex items-center gap-1 shrink-0"
                      >
                        Ir <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Time Blocks */}
              <div>
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2 mb-3">
                  <Clock className="w-4 h-4 text-blue-400" />
                  Estructura Recomendada por Bloques
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {data?.blocks.map((blk, i) => (
                    <div
                      key={i}
                      className="p-3.5 rounded-xl bg-slate-900/50 border border-slate-800/80 space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-semibold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded">
                          {blk.slot}
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-white">{blk.focus}</h4>
                      <ul className="space-y-1 pt-1">
                        {blk.tasks.map((t, tidx) => (
                          <li
                            key={tidx}
                            className="text-[11px] text-slate-400 flex items-center gap-1.5"
                          >
                            <span className="w-1 h-1 rounded-full bg-slate-500" />
                            <span className="truncate">{t}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-800 bg-slate-900/50 flex items-center justify-between">
          <p className="text-xs text-slate-400">
            Regla de oro: <span className="text-white font-medium">JARVIS propone, Fran confirma.</span>
          </p>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-md"
          >
            Entendido, a ejecutar
          </button>
        </div>
      </div>
    </div>
  );
};
