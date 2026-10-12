import React, { useState } from 'react';
import {
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Clock,
  DollarSign,
  Plus,
  StickyNote,
  CheckSquare,
  TrendingUp,
  Tag,
  Circle,
  FileText,
  Palette,
  Monitor,
  ShoppingBag,
  Share2,
  ExternalLink,
  Layers,
  Zap,
} from 'lucide-react';
import { PostIt, Task, Transaction } from '../types';
import { api } from '../services/api';

interface BurgerPalusaViewProps {
  postits?: PostIt[];
  tasks?: Task[];
  onRefreshData: () => void;
  onOpenNewPostIt?: () => void;
  onOpenNewTransaction?: () => void;
  onStartActivity?: (title: string, category: any, icon: string) => void;
}

export const BurgerPalusaView: React.FC<BurgerPalusaViewProps> = ({
  postits = [],
  tasks = [],
  onRefreshData,
  onOpenNewPostIt,
  onOpenNewTransaction,
  onStartActivity,
}) => {
  const [activeTab, setActiveTab] = useState<'entregables' | 'postits' | 'finanzas'>('entregables');
  const [isLiquidating, setIsLiquidating] = useState(false);
  const [liquidatedSuccess, setLiquidatedSuccess] = useState(false);

  // Deliverables checklist state
  const [deliverables, setDeliverables] = useState([
    { id: 'del_1', title: 'Diseño de Packaging (Cajas & Envoltorios)', stage: 'Completado', done: true, icon: ShoppingBag },
    { id: 'del_2', title: 'Cartelería exterior de fachada (Rotulación)', stage: 'Entregado', done: true, icon: Layers },
    { id: 'del_3', title: 'Diseño de indumentaria / Camisetas staff', stage: 'En revisión', done: false, icon: Palette },
    { id: 'del_4', title: 'Pantallas digitales de menú (Menuboard)', stage: 'En proceso', done: false, icon: Monitor },
    { id: 'del_5', title: 'Contenido y plantillas para Instagram', stage: 'Pendiente', done: false, icon: Share2 },
  ]);

  // Filter Burger Palusa specific post-its (orange priority or title containing burger)
  const burgerPostIts = postits.filter(
    (p) =>
      p.colorPriority === 'orange' ||
      p.title.toLowerCase().includes('burger') ||
      p.description.toLowerCase().includes('burger')
  );

  // Filter Burger Palusa tasks
  const burgerTasks = tasks.filter(
    (t) =>
      t.title.toLowerCase().includes('burger') ||
      (t.tags && t.tags.some((tag) => tag.toLowerCase().includes('burger')))
  );

  const toggleDeliverable = (id: string) => {
    setDeliverables((prev) =>
      prev.map((d) => (d.id === id ? { ...d, done: !d.done } : d))
    );
  };

  const handle1ClickLiquidate = async () => {
    setIsLiquidating(true);
    try {
      // Create transaction for Burger Palusa receipt
      await api.createTransaction({
        date: new Date().toISOString().split('T')[0],
        type: 'income',
        amount: 275, // 300 $ ~ 275 €
        currency: 'EUR',
        paymentMethodId: 'acc_bbva',
        description: 'Cobro Burger Palusa (300 $ / Diseños Packaging y Pantallas)',
        notes: 'Liquidación con regla 40/60: 110 € Bolsillo, 99 € Acciones (60%), 66 € Cripto (40%)',
        status: 'confirmed',
        source: 'manual',
      });

      setLiquidatedSuccess(true);
      onRefreshData();
      setTimeout(() => setLiquidatedSuccess(false), 5000);
    } catch (err) {
      console.error('Error liquidating Burger Palusa income:', err);
    } finally {
      setIsLiquidating(false);
    }
  };

  return (
    <div className="space-y-6 pb-24 text-slate-200">
      {/* 1. HERO HEADER: BURGER PALUSA UNIVERSE */}
      <div className="bg-gradient-to-br from-[#1E293B] via-[#0F172A] to-amber-950/20 rounded-2xl p-5 sm:p-6 border border-amber-500/30 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">🍔</span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/40">
                PROYECTO CREATIVO & GASTRONOMÍA
              </span>
              <span className="text-xs text-slate-400">· Fran Albornoz</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
              Burger Palusa
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl leading-relaxed">
              Marca, packaging, pantallas de menú e indumentaria. Monitoreá tus entregas, el cobro de 300 $ y los post-its vinculados.
            </p>
          </div>

          {/* Metric cards */}
          <div className="flex items-center gap-3">
            {/* Cobro pendiente */}
            <div className="bg-slate-900/90 border border-amber-500/40 rounded-2xl p-4 shadow-lg">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                <span className="font-bold uppercase tracking-wider text-amber-400">Por Cobrar</span>
                <Clock className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-2xl sm:text-3xl font-black text-white">
                300 $ <span className="text-sm font-semibold text-slate-400">(~275 €)</span>
              </div>
              <p className="text-[10px] text-amber-300/80 mt-1 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
                Destino: 40% Bolsillo / 60% Inversión
              </p>
            </div>

            {/* Quick action button to trigger activity */}
            {onStartActivity && (
              <button
                onClick={() =>
                  onStartActivity(
                    'Burger Palusa — Diseño & Pantallas',
                    'burger_palusa',
                    '🍔'
                  )
                }
                className="bg-amber-600 hover:bg-amber-500 text-white font-bold px-3 py-3 rounded-2xl shadow-lg shadow-amber-600/30 flex flex-col items-center justify-center text-xs transition-all active:scale-95"
                title="Registrar que estás trabajando en Burger Palusa ahora"
              >
                <Zap className="w-4 h-4 mb-1" />
                <span>Trabajar Aquí</span>
              </button>
            )}
          </div>
        </div>

        {/* Navigation Tabs within Burger Palusa */}
        <div className="mt-5 pt-4 border-t border-slate-800 flex items-center gap-2 overflow-x-auto text-xs">
          <button
            onClick={() => setActiveTab('entregables')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'entregables'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-800'
            }`}
          >
            <CheckSquare className="w-3.5 h-3.5" /> Entregables & Tareas
          </button>

          <button
            onClick={() => setActiveTab('postits')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'postits'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-800'
            }`}
          >
            <StickyNote className="w-3.5 h-3.5" /> Post-its Naranjas ({burgerPostIts.length})
          </button>

          <button
            onClick={() => setActiveTab('finanzas')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'finanzas'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-800'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5" /> Liquidación & Regla 40/60
          </button>
        </div>
      </div>

      {/* 2. TAB: ENTREGABLES & TAREAS */}
      {activeTab === 'entregables' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Columna Izquierda: Entregables Principales */}
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-[#1E293B] rounded-2xl p-5 border border-slate-800 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <ShoppingBag className="w-4 h-4 text-amber-400" /> Entregables de Marca & Producción
                  </h3>
                  <p className="text-xs text-slate-400">
                    Avance de diseño y material gráfico para los locales de Burger Palusa.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {deliverables.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.id}
                      onClick={() => toggleDeliverable(item.id)}
                      className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                        item.done
                          ? 'bg-emerald-950/20 border-emerald-500/30 text-slate-300'
                          : 'bg-slate-900 border-slate-800 hover:border-slate-700 text-white'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="mt-0.5">
                          {item.done ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                          ) : (
                            <Circle className="w-4 h-4 text-slate-500 hover:text-slate-300 shrink-0" />
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Icon className={`w-4 h-4 ${item.done ? 'text-emerald-400' : 'text-amber-400'}`} />
                          <span className={`text-xs font-semibold ${item.done ? 'line-through text-slate-400' : 'text-white'}`}>
                            {item.title}
                          </span>
                        </div>
                      </div>

                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          item.done
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                            : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                        }`}
                      >
                        {item.done ? 'Listo' : item.stage}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Columna Derecha: Tareas específicas */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-[#1E293B] rounded-2xl p-5 border border-slate-800 shadow-xl">
              <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-indigo-400" /> Tareas Activas
              </h3>
              <p className="text-xs text-slate-400 mb-4">
                Tareas pendientes de diseño y entrega de archivos.
              </p>

              {burgerTasks.length > 0 ? (
                <div className="space-y-2">
                  {burgerTasks.map((t) => (
                    <div key={t.id} className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-200">{t.title}</span>
                      <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">
                        {t.status}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-center text-xs text-slate-400">
                  <p className="mb-2">No hay tareas pendientes registradas para Burger Palusa.</p>
                  <p className="text-[11px] text-slate-500">
                    Las ideas se gestionan principalmente a través del tablero de Post-its naranjas.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 3. TAB: POST-ITS NARANJAS DE BURGER PALUSA */}
      {activeTab === 'postits' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <StickyNote className="w-4 h-4 text-amber-400" /> Tablero de Notas de Burger Palusa
              </h3>
              <p className="text-xs text-slate-400">
                Post-its con prioridad naranja dedicados exclusivamente a este proyecto.
              </p>
            </div>
            {onOpenNewPostIt && (
              <button
                onClick={onOpenNewPostIt}
                className="px-3 py-1.5 rounded-xl bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/40 text-xs font-bold flex items-center gap-1.5 transition-all"
              >
                <Plus className="w-3.5 h-3.5" /> Nuevo Post-it Naranja
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {burgerPostIts.map((p) => (
              <div
                key={p.id}
                className="p-4 rounded-2xl bg-gradient-to-b from-amber-950/30 via-slate-900 to-slate-900 border border-amber-500/30 flex flex-col justify-between shadow-xl space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      🟠 Burger Palusa
                    </span>
                    {p.moneyAmount && (
                      <span className="text-xs font-black text-white">{p.moneyAmount} $</span>
                    )}
                  </div>
                  <h4 className="text-sm font-bold text-white mb-1">{p.title}</h4>
                  <p className="text-xs text-slate-300 leading-relaxed">{p.description}</p>

                  {p.checklist && p.checklist.length > 0 && (
                    <div className="space-y-1.5 pt-3 border-t border-slate-800/80 mt-3">
                      {p.checklist.map((item) => (
                        <div key={item.id} className="flex items-center gap-2 text-xs">
                          {item.done ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          ) : (
                            <Circle className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                          )}
                          <span className={item.done ? 'line-through text-slate-500' : 'text-slate-300'}>
                            {item.text}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="text-[10px] text-slate-500 pt-2 border-t border-slate-800/60">
                  {p.notes || 'Destino: 60% Acciones / 40% Cripto'}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. TAB: FINANZAS & LIQUIDACIÓN 1-CLIC */}
      {activeTab === 'finanzas' && (
        <div className="space-y-6">
          <div className="bg-[#1E293B] rounded-2xl p-5 sm:p-6 border border-slate-800 shadow-xl space-y-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-emerald-400" /> Liquidación del Cobro de 300 $
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Cuando el cliente te pague, podés ingresarlo a tu caja e inmediatamente distribuirlo con tu tesis de ahorro:
              </p>
            </div>

            {/* Distribution Visual Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-amber-950/20 border border-amber-500/30 rounded-xl p-4">
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block">
                  Bolsillo (40%)
                </span>
                <span className="text-xl font-black text-white mt-1 block">110,00 €</span>
                <p className="text-[10px] text-slate-400 mt-1">Para alquiler, comida y gastos fijos del mes.</p>
              </div>

              <div className="bg-blue-950/20 border border-blue-500/30 rounded-xl p-4">
                <span className="text-xs font-bold text-blue-400 uppercase tracking-wider block">
                  Acciones (36%)
                </span>
                <span className="text-xl font-black text-blue-300 mt-1 block">99,00 €</span>
                <p className="text-[10px] text-slate-400 mt-1">60% de tu ahorro destinado a renta variable y ETFs.</p>
              </div>

              <div className="bg-purple-950/20 border border-purple-500/30 rounded-xl p-4">
                <span className="text-xs font-bold text-purple-400 uppercase tracking-wider block">
                  Cripto (24%)
                </span>
                <span className="text-xl font-black text-purple-300 mt-1 block">66,00 €</span>
                <p className="text-[10px] text-slate-400 mt-1">40% de tu ahorro destinado a Bitcoin y activos crypto.</p>
              </div>
            </div>

            {/* 1-Click Action */}
            <div className="pt-2">
              <button
                onClick={handle1ClickLiquidate}
                disabled={isLiquidating}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4" />
                {isLiquidating ? 'Registrando movimiento...' : 'Liquidar Cobro de 300 $ en Caja Ahora'}
              </button>

              {liquidatedSuccess && (
                <div className="mt-3 p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>¡Cobro registrado con éxito en tu caja! Distribución aplicada a tu fórmula.</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
