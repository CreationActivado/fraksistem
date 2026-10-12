import React, { useState } from 'react';
import { Zap, Sparkles, CheckCircle2, Clock, AlertTriangle, ArrowRight, RefreshCw } from 'lucide-react';
import { Task, CrekoQuote, CrekoLead, FinancialSummary } from '../types';

interface WhatToDoNowCardProps {
  tasks: Task[];
  quotes: CrekoQuote[];
  leads: CrekoLead[];
  summary: FinancialSummary | null;
  onNavigate: (view: string) => void;
  onToggleTask?: (taskId: string) => void;
}

export const WhatToDoNowCard: React.FC<WhatToDoNowCardProps> = ({
  tasks,
  quotes,
  leads,
  summary,
  onNavigate,
  onToggleTask,
}) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastAnalyzedTime, setLastAnalyzedTime] = useState('Hace un momento');
  const [liveTime, setLiveTime] = useState<string>(() => {
    const d = new Date();
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`;
  });

  React.useEffect(() => {
    const timer = setInterval(() => {
      const d = new Date();
      setLiveTime(
        `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`
      );
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      setLastAnalyzedTime('Ahora');
    }, 600);
  };

  // Find quotes needing follow-up
  const pendingQuotes = quotes.filter((q) => q.status === 'sent');
  // Find leads to contact
  const pendingLeads = leads.filter((l) => l.status === 'new' || l.status === 'contacted');
  // Urgent/high tasks
  const pendingTasks = tasks.filter((t) => t.status !== 'done');

  return (
    <div className="bg-gradient-to-tr from-[#1E293B] via-[#0F172A] to-blue-950/40 border border-blue-500/40 rounded-3xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-md">
            <Zap className="w-5 h-5 fill-amber-400/20" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              ¿Qué hago ahora?
              <span className="text-[10px] bg-blue-500/20 text-blue-300 font-semibold px-2 py-0.5 rounded-full border border-blue-500/30">
                Prioridades de Fran
              </span>
            </h2>
            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
              <div className="inline-flex items-center gap-1 font-mono text-[11px] font-bold text-amber-300 bg-amber-500/15 px-2 py-0.5 rounded-md border border-amber-500/30 shadow-sm">
                <Clock className="w-3 h-3 text-amber-400 animate-pulse shrink-0" />
                <span>Hora actual: {liveTime}</span>
              </div>
              <span className="text-[11px] text-slate-400">· Análisis según horario y proyectos</span>
            </div>
          </div>
        </div>

        <button
          onClick={handleRefresh}
          className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all text-xs flex items-center gap-1"
          title="Reanalizar prioridades"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-blue-400' : ''}`} />
          <span className="hidden sm:inline">Actualizar</span>
        </button>
      </div>

      {/* Structured Recommendation Content */}
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-4 sm:p-5 space-y-4">
        <div className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
          <span>FRAN</span>
          <span className="text-slate-500">·</span>
          <span className="text-emerald-400">Ahora haría:</span>
        </div>

        {/* Priority Step 1 */}
        <div className="flex items-start gap-3 p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/40">
          <span className="text-lg leading-none mt-0.5">🟢</span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-bold text-white">
                1. Mandar seguimiento a presupuestos enviados
              </span>
              <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-900/60 px-2 py-0.5 rounded-md shrink-0">
                30 min
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1">
              {pendingQuotes.length > 0
                ? `${pendingQuotes.length} presupuestos pendientes de respuesta (ej. ${pendingQuotes[0]?.clientName}). Cerrar ventas directas para Creko.`
                : 'Peluquería Velvet (220 €) y Bar La Esquina esperan confirmación. Cerrar ingresos.'}
            </p>
            <button
              onClick={() => onNavigate('projects')}
              className="mt-2 text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition-colors"
            >
              Ver presupuestos en Creko <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Priority Step 2 */}
        <div className="flex items-start gap-3 p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/40">
          <span className="text-lg leading-none mt-0.5">🟢</span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-bold text-white">
                2. Contactar 10 nuevos leads en Logroño
              </span>
              <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-900/60 px-2 py-0.5 rounded-md shrink-0">
                45 min
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1">
              La captación diaria es el motor de Creko. Negocios locales, bares y gimnasios para rotulación y prendas.
            </p>
            <button
              onClick={() => onNavigate('projects')}
              className="mt-2 text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition-colors"
            >
              Abrir embudo de captación <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Next step */}
        <div className="pt-2 border-t border-slate-800">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
            Después:
          </span>
          <div className="flex items-center gap-2.5 text-xs text-slate-300 p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
            <span>🔵</span>
            <span className="font-medium text-white">Crear historias y contenido de Creko</span>
            <span className="text-slate-500 ml-auto">(Tarde)</span>
          </div>
        </div>

        {/* JARVIS Recommendation Rule */}
        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center gap-2.5 text-xs text-amber-300">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
          <span>
            <strong>Recomendación de JARVIS:</strong> "No te recomiendo abrir otro proyecto ahora. Enfoque 100% en captación y ventas de Creko."
          </span>
        </div>
      </div>
    </div>
  );
};
