import React from 'react';
import {
  Wallet,
  Sparkles,
  RefreshCw,
  SlidersHorizontal,
  Plus,
  LayoutDashboard,
  StickyNote,
  CheckSquare,
  Calendar,
  Receipt,
  FolderKanban,
  Rocket,
  Building,
  Zap,
  Layers,
  Scan,
  Moon,
  Heart,
  Clock,
  TrendingUp,
  Smartphone,
} from 'lucide-react';
import { FinancialSummary } from '../types';

interface NavbarProps {
  currentView: string;
  setCurrentView: (view: string) => void;
  summary: FinancialSummary | null;
  onRefresh: () => void;
  onOpenNewTransaction: () => void;
  onOpenNewPostIt?: () => void;
  onOpenReceiptScanner?: () => void;
  onOpenDayClosing?: () => void;
  onOpenMobileCompanion?: () => void;
  onOpenHealthSync?: () => void;
  isRefreshing: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  setCurrentView,
  summary,
  onRefresh,
  onOpenNewTransaction,
  onOpenNewPostIt,
  onOpenReceiptScanner,
  onOpenDayClosing,
  onOpenMobileCompanion,
  onOpenHealthSync,
  isRefreshing,
}) => {
  const [liveTime, setLiveTime] = React.useState<string>(() => {
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
  const navLinks = [
    { id: 'dashboard', label: 'Inicio', icon: LayoutDashboard },
    { id: 'creko', label: 'Creko', icon: Rocket },
    { id: 'changas', label: 'Changas', icon: Zap },
    { id: 'postits', label: 'Post-its', icon: StickyNote },
    { id: 'calendar', label: 'Agenda', icon: Calendar },
    { id: 'projects', label: 'Mis Proyectos', icon: FolderKanban },
    { id: 'finances', label: 'Inversiones y Finanzas', icon: TrendingUp },
  ];

  return (
    <header className="sticky top-0 z-30 bg-[#1E293B]/95 backdrop-blur-md border-b border-slate-800 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2">
        {/* Brand */}
        <div
          className="flex items-center gap-2.5 cursor-pointer select-none shrink-0"
          onClick={() => setCurrentView('dashboard')}
          id="btn-nav-brand"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-sky-400 flex items-center justify-center text-white shadow-lg shadow-blue-500/25 ring-1 ring-white/20">
            <Sparkles className="w-5 h-5 animate-pulse-slow" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-white tracking-tight text-base sm:text-lg">
                JARVIS <span className="text-blue-400 font-extrabold text-xs px-1.5 py-0.5 rounded bg-blue-500/15 border border-blue-500/30">OS</span>
              </span>
            </div>
            <p className="text-[10px] text-slate-400 hidden sm:block">
              Sistema Operativo Personal & Financiero
            </p>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = currentView === link.id;
            return (
              <button
                key={link.id}
                onClick={() => setCurrentView(link.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-blue-600/20 text-blue-300 border border-blue-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
                id={`nav-link-${link.id}`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{link.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right action group */}
        <div className="flex items-center gap-1.5 sm:gap-2.5">
          {/* Live Clock Display */}
          <div
            className="flex items-center gap-1.5 bg-slate-900/90 px-2 sm:px-2.5 py-1.5 rounded-xl border border-slate-700/80 text-xs font-mono text-slate-200 shadow-sm"
            title="Hora actual (Logroño, España)"
          >
            <Clock className="w-3.5 h-3.5 text-purple-400 animate-pulse shrink-0" />
            <span className="font-bold text-white tracking-wider">{liveTime}</span>
          </div>

          {/* Mobile Companion / Cerebro Único Button */}
          {onOpenMobileCompanion && (
            <button
              onClick={onOpenMobileCompanion}
              className="flex items-center gap-1.5 bg-gradient-to-r from-blue-600/20 to-indigo-600/20 hover:from-blue-600/30 hover:to-indigo-600/30 border border-blue-500/40 text-blue-300 px-2 sm:px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95 group"
              title="Abrir QR para conectar tu móvil (Cerebro Único)"
              id="btn-nav-mobile-companion"
            >
              <Smartphone className="w-3.5 h-3.5 text-blue-400 group-hover:scale-110 transition-transform" />
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="hidden sm:inline">Móvil Sincronizado</span>
            </button>
          )}

          {/* Apple Health direct button */}
          {onOpenHealthSync && (
            <button
              onClick={onOpenHealthSync}
              className="flex items-center gap-1.5 bg-gradient-to-r from-rose-600/25 to-red-600/25 hover:from-rose-600/35 hover:to-red-600/35 border border-rose-500/40 text-rose-300 px-2 sm:px-3 py-1.5 rounded-xl text-xs font-black transition-all shadow-sm active:scale-95 group"
              title="Conectar con Salud del iPhone y sincronizar toda la info"
              id="btn-nav-apple-health"
            >
              <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-400/50 group-hover:scale-110 transition-transform" />
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="hidden md:inline">Salud iPhone</span>
            </button>
          )}

          {summary && (
            <div
              className="flex items-center gap-1.5 bg-slate-900/90 px-2.5 sm:px-3 py-1.5 rounded-xl border border-slate-700/80 text-xs cursor-pointer hover:border-slate-600 transition-all"
              onClick={() => setCurrentView('finances')}
              title="Ver Inversiones y Finanzas"
            >
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
              <span className="text-slate-400 hidden sm:inline text-[11px]">Caja:</span>
              <span className="font-bold text-white tracking-tight text-xs">
                {summary.realBalance.toLocaleString('es-ES', { minimumFractionDigits: 2 })} €
              </span>
            </div>
          )}

          {/* Quick Post-It Add Shortcut */}
          {onOpenNewPostIt && (
            <button
              onClick={onOpenNewPostIt}
              className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-yellow-500/15 text-yellow-300 hover:bg-yellow-500/25 border border-yellow-500/30 transition-all"
              title="Anotar Post-it rápido"
              id="btn-nav-new-postit"
            >
              <StickyNote className="w-3.5 h-3.5" />
              <span>Post-it</span>
            </button>
          )}

          {/* Receipt Scanner Shortcut */}
          {onOpenReceiptScanner && (
            <button
              onClick={onOpenReceiptScanner}
              className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-900 border border-slate-700 hover:border-slate-600 text-slate-200 transition-all"
              title="Escanear Ticket o Factura con IA"
              id="btn-nav-scan-receipt"
            >
              <Scan className="w-3.5 h-3.5 text-blue-400" />
              <span>Ticket OCR</span>
            </button>
          )}

          {/* Day Closing Shortcut */}
          {onOpenDayClosing && (
            <button
              onClick={onOpenDayClosing}
              className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-purple-950/40 text-purple-300 border border-purple-800/60 hover:bg-purple-900/40 transition-all"
              title="Cierre del Día (JARVIS 2.0)"
              id="btn-nav-day-closing"
            >
              <Moon className="w-3.5 h-3.5 text-purple-400" />
              <span>Cierre</span>
            </button>
          )}

          {/* Quick Chat Assistant Shortcut */}
          <button
            onClick={() => setCurrentView('chat')}
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              currentView === 'chat'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30'
                : 'bg-blue-600/15 text-blue-400 hover:bg-blue-600/25 border border-blue-500/30'
            }`}
            title="Abrir Asistente JARVIS"
            id="btn-nav-chat"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">JARVIS</span>
          </button>

          {/* Quick Add Transaction Button */}
          <button
            onClick={onOpenNewTransaction}
            className="flex items-center gap-1 bg-blue-600 hover:bg-blue-500 text-white px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-semibold shadow-md shadow-blue-500/20 transition-all active:scale-95"
            title="Nuevo Movimiento"
            id="btn-nav-new-tx"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Movimiento</span>
          </button>

          {/* Refresh */}
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="p-1.5 sm:p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all"
            title="Actualizar datos"
            id="btn-nav-refresh"
          >
            <RefreshCw className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isRefreshing ? 'animate-spin text-blue-400' : ''}`} />
          </button>

          {/* Settings / Brain */}
          <button
            onClick={() => setCurrentView('settings')}
            className={`p-1.5 sm:p-2 rounded-xl transition-all ${
              currentView === 'settings'
                ? 'bg-slate-700 text-white'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
            title="Cerebro & Reglas"
            id="btn-nav-settings"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
