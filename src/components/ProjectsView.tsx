import React, { useState } from 'react';
import {
  Rocket,
  Plus,
  TrendingDown,
  TrendingUp,
  FolderGit2,
  AlertCircle,
  CheckCircle2,
  Clock,
  Edit2,
  Receipt,
  Users,
  Target,
  Layers,
  ChevronRight,
  Share2,
  CheckSquare,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { Project, Transaction } from '../types';
import { api } from '../services/api';

interface ProjectsViewProps {
  projects: Project[];
  transactions: Transaction[];
  onRefreshData: () => void;
  onOpenNewTransaction: () => void;
}

interface CrekoCounters {
  leads: number;
  contacted: number;
  replies: number;
  quotes: number;
  sales: number;
}

export const ProjectsView: React.FC<ProjectsViewProps> = ({
  projects,
  transactions,
  onRefreshData,
  onOpenNewTransaction,
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [activeCrekoPillar, setActiveCrekoPillar] = useState<'captacion' | 'produccion' | 'contenido'>('captacion');

  // CREKO 3 Pillars State
  const [crekoCounts, setCrekoCounts] = useState<CrekoCounters>({
    leads: 42,
    contacted: 30,
    replies: 4,
    quotes: 3,
    sales: 1,
  });

  // Creko Production items
  const [productionStages] = useState([
    { stage: 'Pendiente', items: ['Rótulo Bar Central (material acrílico)'] },
    { stage: 'Diseño', items: ['Vectorizado logo Peluquería Velvet', 'Mockup remeras CTC'] },
    { stage: 'Producción', items: ['Vinilo de corte Bar La Esquina'] },
    { stage: 'Listo', items: ['10 Remeras serigrafiadas Logroño Fit'] },
    { stage: 'Entregado', items: ['Cartelería exterior Burger Palusa'] },
  ]);

  // Creko Content items
  const [contentStages] = useState([
    { stage: 'Ideas', items: ['Reel antes/después instalación rótulo', 'Tutorial cómo elegir vinilo'] },
    { stage: 'Pendiente', items: ['Foto proceso de planchado DTF para historias'] },
    { stage: 'Publicado', items: ['Post carrusel trabajos realizados en Logroño'] },
  ]);

  // Priority metadata map for the 8 requested projects
  const PROJECT_STATUS_MAP: Record<
    string,
    { badge: string; color: string; bg: string; dot: string }
  > = {
    'CREKO': { badge: 'PRIORIDAD ALTA', dot: '🟢', color: 'text-emerald-400', bg: 'bg-emerald-500/15 border-emerald-500/30' },
    'ROTUPRINT': { badge: 'TRÁMITE', dot: '🔴', color: 'text-rose-400', bg: 'bg-rose-500/15 border-rose-500/30' },
    'CTC': { badge: 'DESARROLLO', dot: '🟡', color: 'text-amber-400', bg: 'bg-amber-500/15 border-amber-500/30' },
    'BURGER PALUSA': { badge: 'CREATIVO', dot: '🟡', color: 'text-amber-400', bg: 'bg-amber-500/15 border-amber-500/30' },
    'SUITE SOLUTIONS': { badge: 'OPORTUNIDAD', dot: '🟡', color: 'text-amber-400', bg: 'bg-amber-500/15 border-amber-500/30' },
    'SOFTWARE': { badge: 'DESARROLLO', dot: '⚪', color: 'text-slate-300', bg: 'bg-slate-700/30 border-slate-600/40' },
    'CIUDAD GRÁFICA': { badge: 'HISTÓRICO', dot: '⚪', color: 'text-slate-400', bg: 'bg-slate-800/40 border-slate-700/40' },
    'GOLOSO': { badge: 'EN ESPERA', dot: '⚪', color: 'text-slate-400', bg: 'bg-slate-800/40 border-slate-700/40' },
  };

  const getProjectTag = (name: string) => {
    const uppercase = name.toUpperCase();
    for (const [key, val] of Object.entries(PROJECT_STATUS_MAP)) {
      if (uppercase.includes(key)) return val;
    }
    return { badge: 'PROYECTO', dot: '🔵', color: 'text-blue-400', bg: 'bg-blue-500/15 border-blue-500/30' };
  };

  // Increment counter
  const changeCount = (key: keyof CrekoCounters, delta: number) => {
    setCrekoCounts((prev) => ({
      ...prev,
      [key]: Math.max(0, prev[key] + delta),
    }));
  };

  return (
    <div className="space-y-6 pb-24">
      {/* Header */}
      <div className="bg-[#1E293B] border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xl">🚀</span>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              PROYECTOS
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400">
            Foco activo en Creko, seguimiento de trámites y estado de iniciativas
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsCreating(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-500/20"
          >
            <Plus className="w-4 h-4" /> Nuevo Proyecto
          </button>
        </div>
      </div>

      {/* FLAGSHIP PROJECT: CREKO (Los 3 Pilares del MVP) */}
      <div className="bg-gradient-to-tr from-[#1E293B] via-[#0F172A] to-emerald-950/30 border-2 border-emerald-500/40 rounded-3xl p-5 sm:p-7 shadow-2xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 text-2xl font-bold">
              🟢
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-white tracking-wide">
                  CREKO
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  PRIORIDAD ALTA
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Rotulación, personalización de prendas y diseño gráfico en Logroño
              </p>
            </div>
          </div>

          {/* 3 Pillars Tabs */}
          <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-900/90 rounded-2xl border border-slate-800">
            <button
              onClick={() => setActiveCrekoPillar('captacion')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeCrekoPillar === 'captacion'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Captación y Venta
            </button>
            <button
              onClick={() => setActiveCrekoPillar('produccion')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeCrekoPillar === 'produccion'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Producción
            </button>
            <button
              onClick={() => setActiveCrekoPillar('contenido')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeCrekoPillar === 'contenido'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Contenido
            </button>
          </div>
        </div>

        {/* PILLAR 1: CAPTACIÓN Y VENTA */}
        {activeCrekoPillar === 'captacion' && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Target className="w-4 h-4 text-emerald-400" />
                Embudo de Conversión Comercial (Logroño)
              </h3>
              <span className="text-xs text-emerald-400 font-semibold">
                Objetivo semanal: 50 Contactos
              </span>
            </div>

            {/* 5 Funnel Counters */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {/* Leads */}
              <div className="bg-slate-900/80 border border-slate-800 p-3.5 rounded-2xl text-center space-y-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase block">Leads</span>
                <div className="text-2xl sm:text-3xl font-black text-white">{crekoCounts.leads}</div>
                <div className="flex items-center justify-center gap-1 pt-1">
                  <button
                    onClick={() => changeCount('leads', -1)}
                    className="w-6 h-6 rounded-md bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center font-bold text-xs"
                  >
                    -
                  </button>
                  <button
                    onClick={() => changeCount('leads', 1)}
                    className="w-6 h-6 rounded-md bg-blue-600/40 text-blue-300 hover:bg-blue-600 flex items-center justify-center font-bold text-xs"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Contactados */}
              <div className="bg-slate-900/80 border border-slate-800 p-3.5 rounded-2xl text-center space-y-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase block">Contactados</span>
                <div className="text-2xl sm:text-3xl font-black text-blue-400">{crekoCounts.contacted}</div>
                <div className="flex items-center justify-center gap-1 pt-1">
                  <button
                    onClick={() => changeCount('contacted', -1)}
                    className="w-6 h-6 rounded-md bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center font-bold text-xs"
                  >
                    -
                  </button>
                  <button
                    onClick={() => changeCount('contacted', 1)}
                    className="w-6 h-6 rounded-md bg-blue-600/40 text-blue-300 hover:bg-blue-600 flex items-center justify-center font-bold text-xs"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Respuestas */}
              <div className="bg-slate-900/80 border border-slate-800 p-3.5 rounded-2xl text-center space-y-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase block">Respuestas</span>
                <div className="text-2xl sm:text-3xl font-black text-amber-400">{crekoCounts.replies}</div>
                <div className="flex items-center justify-center gap-1 pt-1">
                  <button
                    onClick={() => changeCount('replies', -1)}
                    className="w-6 h-6 rounded-md bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center font-bold text-xs"
                  >
                    -
                  </button>
                  <button
                    onClick={() => changeCount('replies', 1)}
                    className="w-6 h-6 rounded-md bg-amber-600/40 text-amber-300 hover:bg-amber-600 flex items-center justify-center font-bold text-xs"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Presupuestos */}
              <div className="bg-slate-900/80 border border-slate-800 p-3.5 rounded-2xl text-center space-y-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase block">Presupuestos</span>
                <div className="text-2xl sm:text-3xl font-black text-purple-400">{crekoCounts.quotes}</div>
                <div className="flex items-center justify-center gap-1 pt-1">
                  <button
                    onClick={() => changeCount('quotes', -1)}
                    className="w-6 h-6 rounded-md bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center font-bold text-xs"
                  >
                    -
                  </button>
                  <button
                    onClick={() => changeCount('quotes', 1)}
                    className="w-6 h-6 rounded-md bg-purple-600/40 text-purple-300 hover:bg-purple-600 flex items-center justify-center font-bold text-xs"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Ventas */}
              <div className="bg-emerald-950/40 border border-emerald-500/50 p-3.5 rounded-2xl text-center space-y-1">
                <span className="text-[11px] font-bold text-emerald-300 uppercase block">Ventas</span>
                <div className="text-2xl sm:text-3xl font-black text-emerald-400">{crekoCounts.sales}</div>
                <div className="flex items-center justify-center gap-1 pt-1">
                  <button
                    onClick={() => changeCount('sales', -1)}
                    className="w-6 h-6 rounded-md bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center font-bold text-xs"
                  >
                    -
                  </button>
                  <button
                    onClick={() => changeCount('sales', 1)}
                    className="w-6 h-6 rounded-md bg-emerald-600/60 text-emerald-200 hover:bg-emerald-600 flex items-center justify-center font-bold text-xs"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PILLAR 2: PRODUCCIÓN */}
        {activeCrekoPillar === 'produccion' && (
          <div className="space-y-4 animate-fade-in">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-emerald-400" />
              Etapas del Taller: Pendiente ➔ Diseño ➔ Producción ➔ Listo ➔ Entregado
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
              {productionStages.map((stage) => (
                <div key={stage.stage} className="bg-slate-900/80 border border-slate-800 p-3 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between pb-1.5 border-b border-slate-800">
                    <span className="text-xs font-bold text-slate-200 uppercase">{stage.stage}</span>
                    <span className="text-[10px] text-slate-400 font-mono">({stage.items.length})</span>
                  </div>
                  <div className="space-y-1.5">
                    {stage.items.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-2 rounded-xl bg-slate-800/80 border border-slate-700/60 text-[11px] text-slate-300 font-medium"
                      >
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PILLAR 3: CONTENIDO */}
        {activeCrekoPillar === 'contenido' && (
          <div className="space-y-4 animate-fade-in">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Share2 className="w-4 h-4 text-emerald-400" />
              Flujo de Redes Sociales: Ideas ➔ Pendiente ➔ Publicado
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {contentStages.map((stage) => (
                <div key={stage.stage} className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl space-y-2.5">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <span className="text-xs font-bold text-slate-200 uppercase">{stage.stage}</span>
                    <span className="text-[10px] text-slate-400 font-mono">({stage.items.length})</span>
                  </div>
                  <div className="space-y-2">
                    {stage.items.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/60 text-xs text-slate-300"
                      >
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ALL PROJECTS GRID */}
      <div>
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
          <span>Catálogo de Proyectos ({projects.length})</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {projects.map((proj) => {
            const tag = getProjectTag(proj.name);
            const net = proj.accumulatedRevenue - proj.accumulatedExpenses;
            const projectTxs = transactions.filter((t) => t.projectId === proj.id);

            return (
              <div
                key={proj.id}
                className="bg-[#1E293B] p-5 rounded-2xl border border-slate-800 shadow-sm hover:border-slate-700 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2.5">
                      <span className="text-xl shrink-0">{tag.dot}</span>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-white text-base">{proj.name}</h3>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${tag.bg} ${tag.color}`}
                          >
                            {tag.badge}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {proj.description || 'Sin descripción adicional.'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Financial mini summary */}
                  <div className="mt-4 grid grid-cols-3 gap-2 p-3 bg-slate-900/80 rounded-xl border border-slate-800 text-center">
                    <div>
                      <span className="text-[10px] uppercase font-semibold text-slate-400 block">
                        Presupuesto
                      </span>
                      <span className="text-xs font-bold text-white">
                        {proj.budget > 0 ? `${proj.budget} €` : 'N/A'}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] uppercase font-semibold text-rose-400 block">
                        Gastos
                      </span>
                      <span className="text-xs font-bold text-rose-400">
                        -{proj.accumulatedExpenses} €
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] uppercase font-semibold text-emerald-400 block">
                        Balance
                      </span>
                      <span
                        className={`text-xs font-bold ${
                          net >= 0 ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {net >= 0 ? '+' : ''}
                        {net} €
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-xs text-slate-400 font-medium">
                    {projectTxs.length} movimientos
                  </span>
                  <button
                    onClick={() => setSelectedProject(proj)}
                    className="text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors"
                  >
                    <Receipt className="w-3.5 h-3.5" />
                    Ver movimientos
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal: Project Details & Transactions */}
      {selectedProject && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#1E293B] border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white">{selectedProject.name}</h3>
                <p className="text-xs text-slate-400">{selectedProject.description}</p>
              </div>
              <button
                onClick={() => setSelectedProject(null)}
                className="text-xs text-slate-400 hover:text-white transition-colors"
              >
                Cerrar
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Movimientos imputados a este proyecto
              </h4>
              {transactions.filter((t) => t.projectId === selectedProject.id).length === 0 ? (
                <p className="text-xs text-slate-400 py-4 text-center">
                  No hay movimientos registrados para este proyecto todavía.
                </p>
              ) : (
                transactions
                  .filter((t) => t.projectId === selectedProject.id)
                  .map((tx) => (
                    <div
                      key={tx.id}
                      className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className="font-semibold text-white block">{tx.description}</span>
                        <span className="text-slate-400 text-[11px]">{tx.date}</span>
                      </div>
                      <span
                        className={`font-bold ${
                          tx.type === 'income'
                            ? 'text-emerald-400'
                            : tx.type === 'expense'
                            ? 'text-rose-400'
                            : 'text-slate-300'
                        }`}
                      >
                        {tx.type === 'income' ? '+' : tx.type === 'expense' ? '-' : ''}
                        {tx.amount} €
                      </span>
                    </div>
                  ))
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedProject(null)}
                className="px-4 py-2 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl transition-colors"
              >
                Volver
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
