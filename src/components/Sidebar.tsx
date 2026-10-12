import React from 'react';
import {
  Sparkles,
  LayoutDashboard,
  Rocket,
  Flame,
  FolderKanban,
  Zap,
  Calendar,
  StickyNote,
  Wallet,
  TrendingUp,
  Dumbbell,
  Footprints,
  Settings,
  Plus,
  Clock,
  Smartphone,
  CheckCircle2,
  SlidersHorizontal,
} from 'lucide-react';
import { FinancialSummary, CurrentActivity } from '../types';
import { cerebroSync, ConnectedDevice } from '../services/cerebroSyncService';

interface SidebarProps {
  currentView: string;
  setCurrentView: (view: string) => void;
  summary: FinancialSummary | null;
  currentActivity?: CurrentActivity | null;
  onOpenNewTransaction: () => void;
  onOpenNewPostIt: () => void;
  onOpenMobileCompanion?: () => void;
  onTriggerSkate?: () => void;
  onTriggerRun?: () => void;
  onTriggerWorkout?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  setCurrentView,
  summary,
  currentActivity,
  onOpenNewTransaction,
  onOpenNewPostIt,
  onOpenMobileCompanion,
  onTriggerSkate,
  onTriggerRun,
  onTriggerWorkout,
}) => {
  const [activeDevices, setActiveDevices] = React.useState<ConnectedDevice[]>([]);

  React.useEffect(() => {
    const unsub = cerebroSync.subscribeDevices((devs) => {
      setActiveDevices(devs);
    });
    return () => unsub();
  }, []);

  const isMobileOnline = activeDevices.some((d) => d.type === 'mobile');
  const mobileDevice = activeDevices.find((d) => d.type === 'mobile');

  const realBalance = summary?.realBalance || 0;
  const pendingTotal = summary?.pendingIncomeTotal || 495;

  return (
    <aside className="hidden md:flex flex-col w-64 bg-[#0B1120] border-r border-slate-800/90 h-screen fixed left-0 top-0 z-30 select-none text-slate-300">
      {/* 1. BRAND HEADER */}
      <div className="p-4 border-b border-slate-800/80 flex items-center justify-between">
        <div
          onClick={() => setCurrentView('dashboard')}
          className="flex items-center gap-2.5 cursor-pointer group"
          id="btn-sidebar-brand"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-sky-400 flex items-center justify-center text-white shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform">
            <Sparkles className="w-5 h-5 animate-pulse-slow" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-white tracking-tight text-base group-hover:text-blue-400 transition-colors">
                JARVIS
              </span>
              <span className="text-[10px] font-black uppercase px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                OS
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">Personal OS · Fran</p>
          </div>
        </div>
      </div>

      {/* 2. NAVIGATION SECTIONS */}
      <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-4 text-xs font-semibold scrollbar-thin scrollbar-thumb-slate-800">
        {/* NÚCLEO */}
        <div className="space-y-1">
          <button
            onClick={() => setCurrentView('dashboard')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-all ${
              currentView === 'dashboard'
                ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-600/30'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
            }`}
            id="sidebar-nav-inicio"
          >
            <div className="flex items-center gap-2.5">
              <LayoutDashboard className="w-4 h-4 shrink-0" />
              <span>Inicio</span>
            </div>
            {currentView === 'dashboard' && <span className="w-1.5 h-1.5 rounded-full bg-white"></span>}
          </button>

          <button
            onClick={() => setCurrentView('chat')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-all ${
              currentView === 'chat'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold shadow-md shadow-blue-500/30'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
            }`}
            id="sidebar-nav-jarvis"
          >
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-4 h-4 text-blue-400 shrink-0" />
              <span>✦ JARVIS</span>
            </div>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-400/30">
              Centro
            </span>
          </button>

          <button
            onClick={() => setCurrentView('life_xp')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-all ${
              currentView === 'life_xp'
                ? 'bg-gradient-to-r from-amber-500 to-indigo-600 text-white font-bold shadow-md shadow-indigo-500/30'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
            }`}
            id="sidebar-nav-life-xp"
          >
            <div className="flex items-center gap-2.5">
              <Zap className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Jarvis Life XP</span>
            </div>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-400/30 font-bold">
              RPG
            </span>
          </button>
        </div>

        {/* PROYECTOS */}
        <div className="space-y-1">
          <div className="px-3 pt-2 text-[10px] font-black uppercase tracking-wider text-slate-500 flex items-center justify-between">
            <span>PROYECTOS</span>
            <span className="text-[9px] text-slate-600 font-mono">3</span>
          </div>

          <button
            onClick={() => setCurrentView('creko')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-all ${
              currentView === 'creko'
                ? 'bg-purple-600 text-white font-bold shadow-md shadow-purple-600/30'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
            }`}
            id="sidebar-nav-creko"
          >
            <div className="flex items-center gap-2.5">
              <Rocket className="w-4 h-4 text-purple-400 shrink-0" />
              <span>Creko</span>
            </div>
            <span className="w-2 h-2 rounded-full bg-purple-400"></span>
          </button>

          <button
            onClick={() => setCurrentView('burger_palusa')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-all ${
              currentView === 'burger_palusa'
                ? 'bg-amber-600 text-white font-bold shadow-md shadow-amber-600/30'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
            }`}
            id="sidebar-nav-burger-palusa"
          >
            <div className="flex items-center gap-2.5">
              <span className="text-sm">🍔</span>
              <span>Burger Palusa</span>
            </div>
            <span className="text-[10px] font-extrabold text-amber-300 bg-amber-500/20 px-1.5 py-0.5 rounded border border-amber-500/30">
              300 $
            </span>
          </button>

          <button
            onClick={() => setCurrentView('projects')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-all ${
              currentView === 'projects'
                ? 'bg-indigo-600 text-white font-bold shadow-md shadow-indigo-600/30'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
            }`}
            id="sidebar-nav-mis-proyectos"
          >
            <div className="flex items-center gap-2.5">
              <FolderKanban className="w-4 h-4 text-indigo-400 shrink-0" />
              <span>Mis proyectos</span>
            </div>
          </button>
        </div>

        {/* TRABAJO */}
        <div className="space-y-1">
          <div className="px-3 pt-2 text-[10px] font-black uppercase tracking-wider text-slate-500">
            TRABAJO
          </div>

          <button
            onClick={() => setCurrentView('changas')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-all ${
              currentView === 'changas'
                ? 'bg-rose-600 text-white font-bold shadow-md shadow-rose-600/30'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
            }`}
            id="sidebar-nav-changas"
          >
            <div className="flex items-center gap-2.5">
              <Zap className="w-4 h-4 text-rose-400 shrink-0" />
              <span>Changas</span>
            </div>
            <span className="text-[10px] text-rose-300 font-bold">DejaVu / Turnos</span>
          </button>
        </div>

        {/* ORGANIZACIÓN */}
        <div className="space-y-1">
          <div className="px-3 pt-2 text-[10px] font-black uppercase tracking-wider text-slate-500">
            ORGANIZACIÓN
          </div>

          <button
            onClick={() => setCurrentView('calendar')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-all ${
              currentView === 'calendar'
                ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-600/30'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
            }`}
            id="sidebar-nav-agenda"
          >
            <div className="flex items-center gap-2.5">
              <Calendar className="w-4 h-4 text-blue-400 shrink-0" />
              <span>Agenda</span>
            </div>
          </button>

          <button
            onClick={() => setCurrentView('postits')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-all ${
              currentView === 'postits'
                ? 'bg-yellow-600 text-white font-bold shadow-md shadow-yellow-600/30'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
            }`}
            id="sidebar-nav-postits"
          >
            <div className="flex items-center gap-2.5">
              <StickyNote className="w-4 h-4 text-yellow-400 shrink-0" />
              <span>Post-its</span>
            </div>
            <span className="text-[10px] text-yellow-300 font-bold">Tablero</span>
          </button>
        </div>

        {/* DINERO */}
        <div className="space-y-1">
          <div className="px-3 pt-2 text-[10px] font-black uppercase tracking-wider text-slate-500">
            DINERO
          </div>

          <button
            onClick={() => setCurrentView('finances')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-all ${
              currentView === 'finances'
                ? 'bg-emerald-600 text-white font-bold shadow-md shadow-emerald-600/30'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
            }`}
            id="sidebar-nav-finanzas"
          >
            <div className="flex items-center gap-2.5">
              <Wallet className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Finanzas</span>
            </div>
            <span className="text-[10px] text-emerald-400 font-extrabold font-mono">
              {realBalance.toLocaleString('es-ES', { minimumFractionDigits: 0 })} €
            </span>
          </button>

          <button
            onClick={() => setCurrentView('inversiones')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-all ${
              currentView === 'inversiones'
                ? 'bg-indigo-600 text-white font-bold shadow-md shadow-indigo-600/30'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
            }`}
            id="sidebar-nav-inversiones"
          >
            <div className="flex items-center gap-2.5">
              <TrendingUp className="w-4 h-4 text-indigo-400 shrink-0" />
              <span>Inversiones</span>
            </div>
            <span className="text-[10px] text-indigo-300 font-bold">40/60</span>
          </button>
        </div>

        {/* CUERPO */}
        <div className="space-y-1">
          <div className="px-3 pt-2 text-[10px] font-black uppercase tracking-wider text-slate-500 flex items-center justify-between">
            <span>CUERPO</span>
            <span className="text-[9px] text-emerald-400 font-mono">Salud</span>
          </div>

          <button
            onClick={() => {
              if (onTriggerWorkout) onTriggerWorkout();
              else setCurrentView('health');
            }}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-all ${
              currentView === 'health'
                ? 'bg-emerald-600 text-white font-bold shadow-md shadow-emerald-600/30'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
            }`}
            id="sidebar-nav-entrenamiento"
          >
            <div className="flex items-center gap-2.5">
              <Dumbbell className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Entrenamiento</span>
            </div>
            <span className="text-[10px] text-slate-400">Gym</span>
          </button>

          <button
            onClick={() => {
              if (onTriggerRun) onTriggerRun();
              else setCurrentView('health');
            }}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl transition-all text-slate-300 hover:text-white hover:bg-slate-800/70"
            id="sidebar-nav-correr"
          >
            <div className="flex items-center gap-2.5">
              <Footprints className="w-4 h-4 text-sky-400 shrink-0" />
              <span>Correr</span>
            </div>
            <span className="text-[10px] text-sky-400 font-bold">Km</span>
          </button>

          <button
            onClick={() => {
              if (onTriggerSkate) onTriggerSkate();
              else setCurrentView('health');
            }}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl transition-all text-slate-300 hover:text-white hover:bg-slate-800/70"
            id="sidebar-nav-skate"
          >
            <div className="flex items-center gap-2.5">
              <span className="text-sm">🛹</span>
              <span>Skate</span>
            </div>
            <span className="text-[10px] text-amber-400 font-bold">Sesión</span>
          </button>
        </div>

        {/* VINCULACIÓN CELULAR (CEREBRO ÚNICO) */}
        <div className="pt-2 border-t border-slate-800/80 space-y-1">
          <div className="px-3 pt-1 text-[10px] font-black uppercase tracking-wider text-slate-500 flex items-center justify-between">
            <span>CEREBRO ÚNICO</span>
            <span className={`w-2 h-2 rounded-full ${isMobileOnline ? 'bg-emerald-400 animate-ping' : 'bg-amber-400 animate-pulse'}`}></span>
          </div>

          <button
            onClick={() => setCurrentView('vinculacion_celular')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-all ${
              currentView === 'vinculacion_celular'
                ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-600/30'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
            }`}
            id="sidebar-nav-vinculacion-celular"
          >
            <div className="flex items-center gap-2.5">
              <Smartphone className={`w-4 h-4 ${isMobileOnline ? 'text-emerald-400' : 'text-blue-400'} shrink-0`} />
              <span>Vinculación Celular</span>
            </div>
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
              isMobileOnline
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
            }`}>
              {isMobileOnline ? 'En Vivo' : 'Conectar'}
            </span>
          </button>
        </div>

        {/* CONFIGURACIÓN */}
        <div className="pt-1">
          <button
            onClick={() => setCurrentView('settings')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-all ${
              currentView === 'settings'
                ? 'bg-slate-700 text-white font-bold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
            id="sidebar-nav-configuracion"
          >
            <div className="flex items-center gap-2.5">
              <Settings className="w-4 h-4 text-slate-400 shrink-0" />
              <span>Configuración</span>
            </div>
          </button>
        </div>
      </nav>

      {/* 3. SIDEBAR FOOTER: ACTIVIDAD ACTUAL MINI-CARD & ACCESO RÁPIDO */}
      <div className="p-3 border-t border-slate-800/90 bg-[#090D16] space-y-2">
        {/* Current Activity Widget */}
        {currentActivity && (
          <div
            onClick={() => setCurrentView('dashboard')}
            className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 cursor-pointer transition-all group"
            title="Ver actividad actual en Inicio"
          >
            <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
              <span className="font-extrabold uppercase tracking-wider flex items-center gap-1.5 text-purple-400">
                <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse"></span>
                AHORA
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                {currentActivity.startTime}
              </span>
            </div>
            <p className="text-xs font-bold text-white truncate group-hover:text-purple-300 transition-colors">
              {currentActivity.icon} {currentActivity.title}
            </p>
          </div>
        )}

        {/* Quick Fast Actions in Sidebar */}
        <div className="grid grid-cols-2 gap-1.5">
          <button
            onClick={onOpenNewTransaction}
            className="py-1.5 px-2 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 text-blue-300 text-[11px] font-bold flex items-center justify-center gap-1 transition-all"
            title="Registrar nuevo movimiento de dinero"
          >
            <Plus className="w-3 h-3" /> Movimiento
          </button>

          <button
            onClick={onOpenNewPostIt}
            className="py-1.5 px-2 rounded-lg bg-yellow-500/15 hover:bg-yellow-500/25 border border-yellow-500/30 text-yellow-300 text-[11px] font-bold flex items-center justify-center gap-1 transition-all"
            title="Anotar nuevo Post-it rápido"
          >
            <StickyNote className="w-3 h-3" /> Post-it
          </button>
        </div>

        {onOpenMobileCompanion && (
          <button
            onClick={onOpenMobileCompanion}
            className="w-full py-1.5 px-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[10px] font-semibold text-slate-300 flex items-center justify-center gap-1.5 transition-all"
            title="Vincular con tu iPhone (Cerebro Único)"
          >
            <Smartphone className="w-3 h-3 text-blue-400" />
            <span>Móvil Sincronizado</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          </button>
        )}
      </div>
    </aside>
  );
};
