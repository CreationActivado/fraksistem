import React, { useState, useEffect } from 'react';
import {
  Wallet,
  ArrowRight,
  TrendingUp,
  Clock,
  Sparkles,
  Zap,
  StickyNote,
  Send,
  Calendar,
  CheckCircle2,
  PieChart,
  Circle,
  Plus,
  Rocket,
  FolderKanban,
  Dumbbell,
  Radio,
  Heart,
  Flame,
} from 'lucide-react';
import {
  FinancialSummary,
  Project,
  FinancialGoal,
  PostIt,
  Task,
  Changa,
  CurrentActivity,
  RpgState,
} from '../types';
import { CerebroFisicoWidget } from './CerebroFisicoWidget';
import { ActivityControlCard } from './ActivityControlCard';
import { FranWelcomeCenter } from './FranWelcomeCenter';
import { api } from '../services/api';

interface DashboardViewProps {
  summary: FinancialSummary | null;
  projects: Project[];
  goals: FinancialGoal[];
  postits?: PostIt[];
  tasks?: Task[];
  changas?: Changa[];
  currentActivity?: CurrentActivity | null;
  rpg?: RpgState | null;
  period: 'today' | 'week' | 'month';
  setPeriod: (period: 'today' | 'week' | 'month') => void;
  onNavigate: (view: string) => void;
  onQuickChat: (text: string) => void;
  onRefreshData?: () => void;
  onOpenNewTransaction?: () => void;
  onOpenNewPostIt?: () => void;
  onOpenTobaccoModal?: () => void;
  onOpenNfcModal?: () => void;
  externalTriggerAction?: 'run' | 'skate' | 'workout' | 'health' | null;
  onClearTrigger?: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  summary,
  projects,
  goals,
  postits = [],
  tasks = [],
  changas = [],
  currentActivity,
  rpg,
  period,
  setPeriod,
  onNavigate,
  onQuickChat,
  onRefreshData,
  onOpenNewTransaction,
  onOpenNewPostIt,
  onOpenTobaccoModal,
  onOpenNfcModal,
  externalTriggerAction,
  onClearTrigger,
}) => {
  const [quickInput, setQuickInput] = useState('');
  const [formattedDate, setFormattedDate] = useState('');
  const [liveClock, setLiveClock] = useState('');
  const [localTriggerAction, setLocalTriggerAction] = useState<'run' | 'skate' | 'workout' | 'health' | null>(null);
  const [localRpgState, setLocalRpgState] = useState<RpgState | null>(rpg || null);

  useEffect(() => {
    if (rpg) setLocalRpgState(rpg);
  }, [rpg]);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      // Date in Spanish: ej. 26 septiembre
      const day = now.getDate();
      const monthNames = [
        'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
        'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
      ];
      setFormattedDate(`${day} ${monthNames[now.getMonth()]}`);
      setLiveClock(
        `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleQuickSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickInput.trim()) return;
    onQuickChat(quickInput);
    setQuickInput('');
  };

  const realBalance = summary?.realBalance || 0;
  const pendingIncomesTotal = summary?.pendingIncomeTotal || 495;

  // Filter active post-its
  const activePostIts = postits.filter((p) => p.status === 'active');

  const handleToggleChecklist = async (postItId: string, itemId: string) => {
    try {
      await api.togglePostItChecklist(postItId, itemId);
      if (onRefreshData) onRefreshData();
    } catch (err) {
      console.error('Error toggling checklist:', err);
    }
  };

  const handleToggleDailyMission = async (id: string) => {
    try {
      const updated = await api.toggleRpgMission(id);
      setLocalRpgState(updated);
      if (onRefreshData) onRefreshData();
    } catch (err) {
      console.error('Error toggling daily mission:', err);
    }
  };

  const realSummary = summary?.realSummary;
  const availableCash = realSummary?.cashAmount ?? 50;
  const availableDigital = realSummary?.digitalAmount ?? 32;
  const totalAvailable = realSummary?.totalAvailable ?? 82;
  const totalInvestments = realSummary?.investments?.totalEurApprox ?? 172;
  const totalPendingConfirmed = realSummary?.pending?.totalConfirmedPendingEur ?? 40;

  return (
    <div className="space-y-6 pb-24 text-slate-200">
      {/* ⚡ PANEL PRINCIPAL — AUTOCONTROL, FINANZAS REALES & JARVIS LIFE XP */}
      <div className="bg-gradient-to-br from-slate-900 via-[#11192e] to-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-800 shadow-2xl space-y-5 relative overflow-hidden">
        {/* Glow decorative effects */}
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-60 h-60 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-60 h-60 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

        {/* 1. SALUDO "Hola Fran." + FECHA Y HORA EN VIVO */}
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-[11px] font-black uppercase tracking-wider text-emerald-400">
                JARVIS OS Activo
              </span>
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight">
              Hola Fran.
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Panel de Autocontrol de Vida, Finanzas y Progresión RPG.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* 📅 FECHA & ⏰ HORA */}
            <div className="bg-slate-950/80 border border-slate-800/90 rounded-2xl px-4 py-2 text-right shadow-inner">
              <div className="flex items-center gap-2 justify-end text-xs text-slate-400">
                <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                <span className="capitalize">{formattedDate}</span>
              </div>
              <div className="flex items-center gap-2 justify-end text-lg font-black text-white font-mono">
                <Clock className="w-4 h-4 text-emerald-400" />
                <span>{liveClock}</span>
              </div>
            </div>

            {onOpenTobaccoModal && (
              <button
                onClick={onOpenTobaccoModal}
                className="p-2.5 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 hover:text-rose-300 transition-all flex flex-col items-center justify-center gap-0.5"
                title="Control de Tabaco"
              >
                <span className="text-base">🚬</span>
                <span className="text-[9px] font-bold">Humo</span>
              </button>
            )}

            {onOpenNfcModal && (
              <button
                onClick={onOpenNfcModal}
                className="p-2.5 rounded-2xl bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-blue-400 hover:text-blue-300 transition-all flex flex-col items-center justify-center gap-0.5"
                title="NFC Accesos Rápidos"
              >
                <Sparkles className="w-4 h-4 text-blue-400 animate-pulse" />
                <span className="text-[9px] font-bold">NFC</span>
              </button>
            )}
          </div>
        </div>

        {/* 2. ❤️ VIDA, ⚡ NIVEL, ⭐ XP Y 🔥 RACHAS */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          {/* ❤️ VIDAS (5 Vidas con reserva de disciplina) */}
          <div className="md:col-span-4 bg-slate-950/70 border border-slate-800 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Heart className="w-4 h-4 text-rose-500 fill-rose-500" /> Vidas
              </span>
              <span className="text-xs font-black text-rose-400">{localRpgState?.lives ?? 5} / 5</span>
            </div>

            {/* Corazones Visuales */}
            <div className="flex items-center gap-2 mb-2">
              {[...Array(5)].map((_, i) => (
                <Heart
                  key={i}
                  className={`w-5 h-5 transition-all ${
                    i < (localRpgState?.lives ?? 5)
                      ? 'fill-rose-500 text-rose-500 drop-shadow-[0_0_6px_rgba(244,63,94,0.6)]'
                      : 'text-slate-700'
                  }`}
                />
              ))}
            </div>

            {/* Barra de Vida */}
            <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
              <div
                className="bg-rose-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${((localRpgState?.lives ?? 5) / 5) * 100}%` }}
              ></div>
            </div>
            <p className="text-[10px] text-slate-500 mt-1.5">
              Reserva de disciplina: no se pierde de golpe
            </p>
          </div>

          {/* ⚡ NIVEL & ⭐ XP */}
          <div className="md:col-span-8 bg-slate-950/70 border border-slate-800 rounded-2xl p-4 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black px-2 py-0.5 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 uppercase">
                  ⚡ {localRpgState?.levelName ?? 'Control'} — Nivel {localRpgState?.level ?? 3}
                </span>
                <span className="text-[11px] text-slate-400 font-mono hidden sm:inline">
                  (Total: {(localRpgState?.totalXp ?? 2780).toLocaleString()} XP)
                </span>
              </div>
              <span className="text-xs font-mono font-extrabold text-white">
                ⭐ {localRpgState?.currentLevelXp ?? 780} / {localRpgState?.nextLevelXp ?? 1300} XP
              </span>
            </div>

            {/* Visual XP Bar */}
            <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden p-0.5 border border-slate-700">
              <div
                className="bg-gradient-to-r from-amber-500 via-indigo-500 to-emerald-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${localRpgState?.progressPercent ?? 60}%` }}
              ></div>
            </div>

            {/* 🔥 RACHAS */}
            <div className="flex items-center gap-2 pt-1 overflow-x-auto text-[11px]">
              <span className="text-slate-400 font-bold shrink-0 flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 text-orange-400" /> Rachas:
              </span>
              {(localRpgState?.streaks || [
                { id: '1', name: 'Gimnasio', currentStreak: 4 },
                { id: '2', name: 'Lectura', currentStreak: 2 },
                { id: '3', name: 'Buscar trabajo', currentStreak: 3 },
                { id: '4', name: 'Sin fumar', currentStreak: 1 },
              ]).map((s) => (
                <span
                  key={s.id}
                  className="bg-slate-900 border border-slate-800 px-2 py-0.5 rounded-lg text-slate-300 shrink-0 font-medium flex items-center gap-1"
                >
                  <span className="text-orange-400 font-bold">🔥 {s.name}:</span> {s.currentStreak}d
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* 3. 💰 DINERO DISPONIBLE, 📈 INVERSIONES, ⏳ PENDIENTE (Categorías Segregadas) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          {/* 💰 DINERO DISPONIBLE */}
          <div
            onClick={() => onNavigate('finances')}
            className="bg-slate-950/70 hover:bg-slate-950 border border-emerald-500/30 hover:border-emerald-500/60 rounded-2xl p-4 cursor-pointer transition-all shadow-md group"
          >
            <div className="flex items-center justify-between text-xs text-emerald-400 mb-1 font-bold uppercase tracking-wider">
              <span>💰 Dinero Disponible</span>
              <Wallet className="w-4 h-4 group-hover:scale-110 transition-transform" />
            </div>
            <div className="text-2xl font-black text-white font-mono">
              {totalAvailable.toLocaleString('es-ES', { minimumFractionDigits: 2 })} €
            </div>
            <p className="text-[10px] text-slate-400 mt-1 flex items-center justify-between">
              <span>Efectivo: {availableCash} €</span>
              <span>ARQ: {availableDigital} €</span>
            </p>
          </div>

          {/* 📈 INVERSIONES */}
          <div
            onClick={() => onNavigate('inversiones')}
            className="bg-slate-950/70 hover:bg-slate-950 border border-indigo-500/30 hover:border-indigo-500/60 rounded-2xl p-4 cursor-pointer transition-all shadow-md group"
          >
            <div className="flex items-center justify-between text-xs text-indigo-400 mb-1 font-bold uppercase tracking-wider">
              <span>📈 Inversiones</span>
              <TrendingUp className="w-4 h-4 group-hover:scale-110 transition-transform" />
            </div>
            <div className="text-2xl font-black text-indigo-300 font-mono">
              ~{totalInvestments.toLocaleString('es-ES', { minimumFractionDigits: 2 })} €
            </div>
            <p className="text-[10px] text-slate-400 mt-1 flex items-center justify-between">
              <span>BingX: ~80 €</span>
              <span>Cocos: ~100 USD</span>
            </p>
          </div>

          {/* ⏳ PENDIENTE */}
          <div
            onClick={() => onNavigate('finances')}
            className="bg-slate-950/70 hover:bg-slate-950 border border-amber-500/30 hover:border-amber-500/60 rounded-2xl p-4 cursor-pointer transition-all shadow-md group"
          >
            <div className="flex items-center justify-between text-xs text-amber-400 mb-1 font-bold uppercase tracking-wider">
              <span>⏳ Pendiente</span>
              <Clock className="w-4 h-4 group-hover:scale-110 transition-transform" />
            </div>
            <div className="text-2xl font-black text-amber-300 font-mono">
              ~{totalPendingConfirmed.toLocaleString('es-ES', { minimumFractionDigits: 2 })} €
            </div>
            <p className="text-[10px] text-slate-400 mt-1 flex items-center justify-between">
              <span>Ikualo: ~40 €</span>
              <span>Déjà Vu: Pendiente</span>
            </p>
          </div>
        </div>

        {/* 4. 🎯 MISIÓN PRINCIPAL & MISIÓN DIARIA */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
                🎯 Misión Principal de Hoy
              </span>
              <h3 className="text-sm font-bold text-white mt-1">
                Gimnasio + Creko Captación + Mantener Gastos en 0 €
              </h3>
            </div>
            <button
              onClick={() => onNavigate('life_xp')}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1 w-fit"
            >
              Abrir Sistema RPG <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Checkboxes Misión Diaria */}
          <div>
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-2">
              Misión Diaria (Hacé clic para completar y sumar XP):
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {(localRpgState?.dailyMissions || [
                { id: 'm_gym', title: 'Gimnasio', xp: 100, completed: false },
                { id: 'm_read', title: 'Lectura 20 min', xp: 100, completed: false },
                { id: 'm_job', title: 'Buscar trabajo 40m', xp: 150, completed: false },
                { id: 'm_creko', title: 'Trabajar en Creko', xp: 120, completed: false },
                { id: 'm_fin', title: 'Organizar finanzas', xp: 50, completed: false },
                { id: 'm_med', title: 'Meditar', xp: 75, completed: false },
              ]).map((m) => (
                <div
                  key={m.id}
                  onClick={() => handleToggleDailyMission(m.id)}
                  className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 cursor-pointer transition-all select-none ${
                    m.completed
                      ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-300'
                      : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    {m.completed ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : (
                      <Circle className="w-4 h-4 text-slate-500 shrink-0" />
                    )}
                    <span className={`text-xs font-semibold truncate ${m.completed ? 'line-through text-slate-500' : ''}`}>
                      {m.title}
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-amber-400 shrink-0 font-mono">
                    +{m.xp}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 2. CENTRO DE BIENVENIDA DE FRAN (Briefing de voz, clima, outfit, foco del día) */}
      <FranWelcomeCenter
        currentActivity={currentActivity}
        onRefreshParent={onRefreshData}
        onNavigate={onNavigate}
        onTriggerGym={() => setLocalTriggerAction('workout')}
        onTriggerSkate={() => setLocalTriggerAction('skate')}
        onTriggerRun={() => setLocalTriggerAction('run')}
        onTriggerQuickChanga={() => {
          if (onOpenNewTransaction) onOpenNewTransaction();
          else onNavigate('changas');
        }}
        onOpenNewTransaction={onOpenNewTransaction}
      />

      {/* 3. ¿QUÉ ESTOY HACIENDO? (ACTIVIDAD ACTUAL & LÍNEA DE TIEMPO AUTOMÁTICA) */}
      <ActivityControlCard
        onRefreshParent={onRefreshData}
        onNavigate={onNavigate}
      />

      {/* 4. CEREBRO FÍSICO: SALÍ A CORRER, SKATE, ENTRENAMIENTOS, PASOS Y DISTANCIAS */}
      <CerebroFisicoWidget
        onRefreshParent={onRefreshData}
        externalTriggerAction={externalTriggerAction || localTriggerAction}
        onClearTrigger={() => {
          setLocalTriggerAction(null);
          if (onClearTrigger) onClearTrigger();
        }}
      />

      {/* 4. DOS COLUMNAS: TUS 2 POST-ITS CLAVE Y LA REGLA 40/60 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* COLUMNA IZQUIERDA: LOS 2 POST-ITS REALES DE FRAN */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-[#1E293B] rounded-2xl p-5 sm:p-6 border border-slate-800 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <StickyNote className="w-4 h-4 text-yellow-400" /> Tus 2 Post-its Clave
                </h3>
                <p className="text-xs text-slate-400">
                  Cobros pendientes reales de Burger Palusa y turnos de DejaVu.
                </p>
              </div>
              <button
                onClick={() => onNavigate('postits')}
                className="text-xs text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1"
              >
                Ver Tablero <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {activePostIts.map((p) => {
                const isBurger = p.title.toLowerCase().includes('burger');
                const isDejavu = p.title.toLowerCase().includes('dejavu');

                return (
                  <div
                    key={p.id}
                    className={`rounded-2xl p-4 border flex flex-col justify-between shadow-lg transition-all ${
                      isBurger
                        ? 'bg-gradient-to-b from-orange-950/30 to-slate-900 border-orange-500/30'
                        : isDejavu
                        ? 'bg-gradient-to-b from-purple-950/30 to-slate-900 border-purple-500/30'
                        : 'bg-slate-900 border-slate-800'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                            isBurger
                              ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30'
                              : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                          }`}
                        >
                          {isBurger ? 'Burger Palusa' : 'DejaVu'}
                        </span>
                        {p.moneyAmount && (
                          <span className="text-xs font-extrabold text-white">
                            {isBurger ? '300 $ (~275 €)' : 'A liquidar'}
                          </span>
                        )}
                      </div>

                      <h4 className="text-sm font-bold text-white mb-1.5">{p.title}</h4>
                      <p className="text-xs text-slate-300/90 leading-relaxed mb-3">
                        {p.description}
                      </p>

                      {/* Checklist */}
                      {p.checklist && p.checklist.length > 0 && (
                        <div className="space-y-1.5 pt-2 border-t border-slate-800/80">
                          {p.checklist.map((item) => (
                            <div
                              key={item.id}
                              onClick={() => handleToggleChecklist(p.id, item.id)}
                              className="flex items-start gap-2 text-xs cursor-pointer group select-none"
                            >
                              <div className="mt-0.5">
                                {item.done ? (
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                                ) : (
                                  <Circle className="w-3.5 h-3.5 text-slate-500 group-hover:text-slate-300 shrink-0" />
                                )}
                              </div>
                              <span
                                className={`text-[11px] leading-tight ${
                                  item.done ? 'line-through text-slate-500' : 'text-slate-300'
                                }`}
                              >
                                {item.text}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="mt-4 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-400">
                      <span>{isBurger ? 'Destino: 60% Acciones / 40% Cripto' : 'Destino: Alquiler'}</span>
                      <button
                        onClick={() => onNavigate(isBurger ? 'burger_palusa' : 'finances')}
                        className="text-blue-400 hover:underline font-semibold"
                      >
                        Gestionar
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* COLUMNA DERECHA: REGLA 40/60 & AGENDA DE HOY */}
        <div className="lg:col-span-5 space-y-4">
          {/* Tarjeta Regla 40/60 (60% Acciones / 40% Cripto) */}
          <div className="bg-[#1E293B] rounded-2xl p-5 border border-slate-800 shadow-xl">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <PieChart className="w-4 h-4 text-indigo-400" /> Tesis de Ahorro de Fran
              </h3>
              <button
                onClick={() => onNavigate('inversiones')}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold"
              >
                Simulador →
              </button>
            </div>
            <p className="text-xs text-slate-400 mb-3">
              40% Bolsillo / 60% Inversión (dividido en 60% acciones y 40% cripto):
            </p>

            <div className="grid grid-cols-3 gap-2 mb-3">
              <div className="bg-amber-950/20 border border-amber-500/25 rounded-xl p-2.5">
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">
                  Bolsillo (40%)
                </span>
                <span className="text-sm sm:text-base font-extrabold text-white">110,00 €</span>
                <span className="text-[9px] text-slate-400 block mt-0.5">
                  Alquiler y vida
                </span>
              </div>

              <div className="bg-blue-950/20 border border-blue-500/25 rounded-xl p-2.5">
                <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider block">
                  Acciones (36%)
                </span>
                <span className="text-sm sm:text-base font-extrabold text-blue-300">99,00 €</span>
                <span className="text-[9px] text-slate-400 block mt-0.5">
                  60% de inv.
                </span>
              </div>

              <div className="bg-purple-950/20 border border-purple-500/25 rounded-xl p-2.5">
                <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider block">
                  Cripto (24%)
                </span>
                <span className="text-sm sm:text-base font-extrabold text-purple-300">66,00 €</span>
                <span className="text-[9px] text-slate-400 block mt-0.5">
                  40% de inv.
                </span>
              </div>
            </div>

            <button
              onClick={() => onNavigate('inversiones')}
              className="w-full py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-bold text-slate-300 hover:text-white transition-all"
            >
              Abrir Calculadora & Registrar Inversión
            </button>
          </div>

          {/* Agenda & Turno de Hoy en DejaVu */}
          <div className="bg-[#1E293B] rounded-2xl p-5 border border-slate-800 shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Calendar className="w-4 h-4 text-purple-400" /> Agenda de Hoy & Changas
              </h3>
              <button
                onClick={() => onNavigate('changas')}
                className="text-xs text-purple-400 hover:text-purple-300 font-semibold"
              >
                Ver Changas →
              </button>
            </div>

            <div className="bg-purple-950/30 border border-purple-500/30 rounded-xl p-3.5 flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-300 font-mono text-xs font-bold shrink-0 mt-0.5">
                20h
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-white">Turno Nocturno en DejaVu</h4>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 font-bold">
                    Fijo
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 mt-0.5">
                  Horario: 20:00 a 00:00 (12 de la noche). Turno de atención en el bar.
                </p>
                <div className="text-[10px] text-purple-300 mt-2 flex items-center justify-between">
                  <span>Pago a liquidar el fin de semana</span>
                  <button
                    onClick={() => onNavigate('changas')}
                    className="hover:underline font-bold text-white"
                  >
                    Detalles
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 5. FAST NATURAL LANGUAGE INPUT */}
      <div className="bg-[#1E293B] rounded-2xl p-4 sm:p-5 border border-slate-800 shadow-xl">
        <form onSubmit={handleQuickSubmit} className="relative flex items-center">
          <input
            type="text"
            value={quickInput}
            onChange={(e) => setQuickInput(e.target.value)}
            placeholder="Preguntale o pedile algo a JARVIS: ej. '¿Cuánto tengo pendiente de cobro?' o 'Anotá un gasto de 10 € en comida'..."
            className="w-full bg-slate-900 text-white placeholder:text-slate-500 rounded-full px-5 py-3 pr-12 text-xs sm:text-sm border border-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all"
            id="input-dashboard-quick-chat"
          />
          <button
            type="submit"
            disabled={!quickInput.trim()}
            className="absolute right-2 w-8 h-8 rounded-full bg-blue-600 hover:bg-blue-500 disabled:opacity-30 disabled:hover:bg-blue-600 text-white flex items-center justify-center shadow-md transition-all"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
};
