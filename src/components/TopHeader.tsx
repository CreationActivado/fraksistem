import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Clock,
  Smartphone,
  Heart,
  Plus,
  RefreshCw,
  Scan,
  Moon,
  Wallet,
  Play,
  CheckCircle2,
  ChevronRight,
  Zap,
} from 'lucide-react';
import { FinancialSummary, CurrentActivity } from '../types';

import { cerebroSync, ConnectedDevice } from '../services/cerebroSyncService';

interface TopHeaderProps {
  currentView: string;
  setCurrentView: (view: string) => void;
  summary: FinancialSummary | null;
  currentActivity?: CurrentActivity | null;
  onRefresh: () => void;
  onOpenNewTransaction: () => void;
  onOpenNewPostIt?: () => void;
  onOpenReceiptScanner?: () => void;
  onOpenDayClosing?: () => void;
  onOpenMobileCompanion?: () => void;
  onOpenHealthSync?: () => void;
  onOpenActivityModal?: () => void;
  onOpenCommandPalette?: () => void;
  isRefreshing: boolean;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  currentView,
  setCurrentView,
  summary,
  currentActivity,
  onRefresh,
  onOpenNewTransaction,
  onOpenNewPostIt,
  onOpenReceiptScanner,
  onOpenDayClosing,
  onOpenMobileCompanion,
  onOpenHealthSync,
  onOpenActivityModal,
  onOpenCommandPalette,
  isRefreshing,
}) => {
  const [liveTime, setLiveTime] = useState<string>(() => {
    const d = new Date();
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`;
  });
  const [activeDevices, setActiveDevices] = useState<ConnectedDevice[]>([]);
  const [pingSuccess, setPingSuccess] = useState(false);

  useEffect(() => {
    const unsub = cerebroSync.subscribeDevices((devs) => {
      setActiveDevices(devs);
    });
    return () => unsub();
  }, []);

  const isMobileOnline = activeDevices.some((d) => d.type === 'mobile');
  const mobileDevice = activeDevices.find((d) => d.type === 'mobile');

  const handleQuickPing = async () => {
    setPingSuccess(true);
    await cerebroSync.sendPing('Computadora de Fran');
    setTimeout(() => setPingSuccess(false), 2500);
  };

  useEffect(() => {
    const timer = setInterval(() => {
      const d = new Date();
      setLiveTime(
        `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`
      );
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const viewTitles: Record<string, { title: string; section: string }> = {
    dashboard: { title: 'Inicio', section: 'Núcleo' },
    chat: { title: '✦ JARVIS', section: 'Asistente Central' },
    creko: { title: 'Creko OS', section: 'Proyectos' },
    burger_palusa: { title: 'Burger Palusa', section: 'Proyectos' },
    projects: { title: 'Mis Proyectos', section: 'Proyectos' },
    changas: { title: 'Changas & Oficios', section: 'Trabajo' },
    calendar: { title: 'Agenda Unificada', section: 'Organización' },
    postits: { title: 'Tablero de Post-its', section: 'Organización' },
    finances: { title: 'Finanzas & Caja', section: 'Dinero' },
    inversiones: { title: 'Inversiones (40/60)', section: 'Dinero' },
    health: { title: 'Cuerpo & Salud', section: 'Cuerpo' },
    vinculacion_celular: { title: 'Vinculación Celular ⇄ PC', section: 'Cerebro Único' },
    settings: { title: 'Configuración & Memoria', section: 'Sistema' },
  };

  const currentInfo = viewTitles[currentView] || { title: 'JARVIS OS', section: 'Personal' };

  return (
    <header className="sticky top-0 z-20 bg-[#0F172A]/90 backdrop-blur-md border-b border-slate-800/80 px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
      {/* 1. LEFT: Breadcrumb & Section Name */}
      <div className="flex items-center gap-3">
        {/* Mobile Brand Button (Visible only on mobile) */}
        <div
          onClick={() => setCurrentView('dashboard')}
          className="md:hidden flex items-center gap-2 cursor-pointer select-none"
        >
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md">
            <Sparkles className="w-4 h-4" />
          </div>
          <span className="font-extrabold text-white text-sm">JARVIS</span>
        </div>

        {/* Desktop Breadcrumb */}
        <div className="hidden md:flex items-center gap-2 text-xs">
          <span className="text-slate-500 font-semibold">{currentInfo.section}</span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
          <h2 className="text-sm font-extrabold text-white tracking-tight">
            {currentInfo.title}
          </h2>
        </div>

        {/* Command Palette Trigger Button (Desktop Native Feeling) */}
        {onOpenCommandPalette && (
          <button
            onClick={onOpenCommandPalette}
            className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800/90 border border-slate-700/80 hover:border-blue-500/50 text-xs text-slate-400 hover:text-white transition-all shadow-sm group"
            title="Lanzador de comandos rápido (Ctrl+K o Cmd+K)"
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-400 group-hover:scale-110 transition-transform" />
            <span className="text-[11px] font-semibold">Comandos...</span>
            <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-[10px] font-mono text-slate-300">
              Ctrl K
            </kbd>
          </button>
        )}

        {/* Current Activity Quick Badge (Desktop) */}
        {currentActivity && currentActivity.isActive && (
          <div
            onClick={onOpenActivityModal || (() => setCurrentView('dashboard'))}
            className="hidden xl:flex items-center gap-2 px-3 py-1 rounded-xl bg-slate-900/90 border border-purple-500/40 hover:border-purple-500/70 text-xs cursor-pointer shadow-sm transition-all group"
            title="Actividad actual activa. Clic para cambiar o finalizar."
          >
            <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse"></span>
            <span className="text-slate-400 text-[11px] font-semibold">AHORA:</span>
            <span className="font-bold text-white group-hover:text-purple-300 transition-colors truncate max-w-xs">
              {currentActivity.icon} {currentActivity.title}
            </span>
            <span className="text-[10px] text-purple-400 font-mono font-bold bg-purple-500/10 px-1.5 py-0.5 rounded">
              {currentActivity.startTime}
            </span>
          </div>
        )}
      </div>

      {/* 2. RIGHT: Real-time clock, status & fast actions */}
      <div className="flex items-center gap-2 sm:gap-2.5">
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
          <div className="flex items-center gap-1">
            <button
              onClick={onOpenMobileCompanion}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-black transition-all shadow-sm active:scale-95 group border ${
                isMobileOnline
                  ? 'bg-emerald-950/40 hover:bg-emerald-900/50 border-emerald-500/60 text-emerald-300 ring-1 ring-emerald-500/40'
                  : 'bg-gradient-to-r from-blue-600/20 to-indigo-600/20 hover:from-blue-600/30 hover:to-indigo-600/30 border-blue-500/40 text-blue-300'
              }`}
              title={
                isMobileOnline
                  ? `Móvil conectado: ${mobileDevice?.name || 'iPhone de Fran'} en tiempo real`
                  : 'Abrir código QR para conectar tu móvil con la computadora'
              }
              id="btn-header-mobile-companion"
            >
              <Smartphone className={`w-3.5 h-3.5 ${isMobileOnline ? 'text-emerald-400 animate-bounce' : 'text-blue-400 group-hover:scale-110'} transition-transform`} />
              <span className={`w-2 h-2 rounded-full ${isMobileOnline ? 'bg-emerald-400 animate-ping' : 'bg-amber-400 animate-pulse'}`}></span>
              <span className="hidden sm:inline">
                {isMobileOnline ? (mobileDevice?.name ? mobileDevice.name : 'iPhone Conectado') : 'Conectar Celular'}
              </span>
            </button>

            {/* Quick Ping Button on Desktop */}
            <button
              onClick={handleQuickPing}
              className={`hidden md:flex items-center gap-1 px-2 py-1.5 rounded-xl border text-xs font-bold transition-all active:scale-95 ${
                pingSuccess
                  ? 'bg-purple-600 border-purple-400 text-white'
                  : 'bg-slate-900/90 hover:bg-slate-800 border-slate-700 text-purple-300'
              }`}
              title="Probar conexión con tu celular (hacer sonar y vibrar)"
            >
              <Zap className={`w-3 h-3 ${pingSuccess ? 'animate-spin text-amber-300' : 'text-purple-400'}`} />
              <span className="text-[10px]">{pingSuccess ? '¡Sonando!' : 'Ping'}</span>
            </button>
          </div>
        )}

        {/* Apple Health direct button */}
        {onOpenHealthSync && (
          <button
            onClick={onOpenHealthSync}
            className="flex items-center gap-1.5 bg-gradient-to-r from-rose-600/25 to-red-600/25 hover:from-rose-600/35 hover:to-red-600/35 border border-rose-500/40 text-rose-300 px-2 sm:px-2.5 py-1.5 rounded-xl text-xs font-black transition-all shadow-sm active:scale-95 group"
            title="Conectar con Salud del iPhone y sincronizar toda la info"
            id="btn-header-apple-health"
          >
            <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-400/50 group-hover:scale-110 transition-transform" />
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="hidden md:inline">Salud iPhone</span>
          </button>
        )}

        {/* Caja Actual Shortcut */}
        {summary && (
          <div
            className="flex items-center gap-1.5 bg-slate-900/90 px-2.5 sm:px-3 py-1.5 rounded-xl border border-slate-700/80 text-xs cursor-pointer hover:border-slate-600 transition-all"
            onClick={() => setCurrentView('finances')}
            title="Ver Finanzas y Caja"
          >
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
            <span className="text-slate-400 hidden sm:inline text-[11px]">Caja:</span>
            <span className="font-bold text-white tracking-tight text-xs">
              {summary.realBalance.toLocaleString('es-ES', { minimumFractionDigits: 2 })} €
            </span>
          </div>
        )}

        {/* Ticket OCR Scanner */}
        {onOpenReceiptScanner && (
          <button
            onClick={onOpenReceiptScanner}
            className="hidden xl:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-900 border border-slate-700 hover:border-slate-600 text-slate-200 transition-all"
            title="Escanear Ticket o Factura con IA"
            id="btn-header-scan-receipt"
          >
            <Scan className="w-3.5 h-3.5 text-blue-400" />
            <span>Ticket OCR</span>
          </button>
        )}

        {/* Day Closing */}
        {onOpenDayClosing && (
          <button
            onClick={onOpenDayClosing}
            className="hidden xl:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-purple-950/40 text-purple-300 border border-purple-800/60 hover:bg-purple-900/40 transition-all"
            title="Cierre del Día (JARVIS 2.0)"
            id="btn-header-day-closing"
          >
            <Moon className="w-3.5 h-3.5 text-purple-400" />
            <span>Cierre</span>
          </button>
        )}

        {/* Quick Add Transaction Button */}
        <button
          onClick={onOpenNewTransaction}
          className="flex items-center gap-1 bg-blue-600 hover:bg-blue-500 text-white px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-semibold shadow-md shadow-blue-500/20 transition-all active:scale-95"
          title="Nuevo Movimiento de Dinero"
          id="btn-header-new-tx"
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
          id="btn-header-refresh"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-blue-400' : ''}`} />
        </button>
      </div>
    </header>
  );
};
