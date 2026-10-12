import React, { useEffect, useState } from 'react';
import {
  Activity,
  AlertCircle,
  Apple,
  Calendar,
  Check,
  CheckCircle2,
  ChevronRight,
  Copy,
  Dumbbell,
  Flame,
  Heart,
  Info,
  RefreshCw,
  ShieldCheck,
  Sliders,
  Smartphone,
  TrendingUp,
  X,
  Zap,
} from 'lucide-react';
import { HealthConnectionStatus, HealthDailySummary, HealthWorkout } from '../types';
import { api } from '../services/api';

interface HealthViewProps {
  onOpenCheckin?: () => void;
}

export const HealthView: React.FC<HealthViewProps> = ({ onOpenCheckin }) => {
  const [status, setStatus] = useState<HealthConnectionStatus | null>(null);
  const [todayData, setTodayData] = useState<HealthDailySummary | null>(null);
  const [history, setHistory] = useState<HealthDailySummary[]>([]);
  const [historyDays, setHistoryDays] = useState<number>(7);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isSetupModalOpen, setIsSetupModalOpen] = useState<boolean>(false);
  const [copiedUrl, setCopiedUrl] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Editable targets
  const [editStepTarget, setEditStepTarget] = useState<number>(8000);
  const [editWorkoutTarget, setEditWorkoutTarget] = useState<number>(4);

  // Manual test sync values for local simulation / companion test
  const [testSteps, setTestSteps] = useState<number>(7842);
  const [testDistance, setTestDistance] = useState<number>(5.4);
  const [testEnergy, setTestEnergy] = useState<number>(612);
  const [testWorkoutType, setTestWorkoutType] = useState<string>('Gym / Fuerza');
  const [testWorkoutMinutes, setTestWorkoutMinutes] = useState<number>(52);
  const [includeWorkout, setIncludeWorkout] = useState<boolean>(true);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [statusRes, todayRes, historyRes] = await Promise.all([
        api.getHealthStatus(),
        api.getTodayHealth(),
        api.getHealthHistory(historyDays),
      ]);
      setStatus(statusRes);
      setTodayData(todayRes.summary);
      setHistory(historyRes);
      setEditStepTarget(statusRes.dailyStepTarget || 8000);
      setEditWorkoutTarget(statusRes.weeklyWorkoutTarget || 4);
    } catch (err) {
      console.error('Error cargando datos de salud:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [historyDays]);

  const handleSyncNow = async () => {
    setIsSyncing(true);
    setStatusMessage(null);
    try {
      // Re-fetch latest from API
      const res = await api.getTodayHealth();
      setTodayData(res.summary);
      setStatus(res.status);
      const hist = await api.getHealthHistory(historyDays);
      setHistory(hist);
      setStatusMessage('Sincronización completada con éxito.');
      setTimeout(() => setStatusMessage(null), 3500);
    } catch (err: any) {
      setStatusMessage('Error al sincronizar: ' + (err.message || 'Error de red'));
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSaveTargets = async () => {
    try {
      const updated = await api.updateHealthTarget({
        dailyStepTarget: editStepTarget,
        weeklyWorkoutTarget: editWorkoutTarget,
      });
      setStatus(updated);
      setIsSettingsOpen(false);
      setStatusMessage('Metas de salud actualizadas.');
      setTimeout(() => setStatusMessage(null), 3000);
    } catch (err: any) {
      alert('Error al guardar metas: ' + err.message);
    }
  };

  const handleManualSyncSubmit = async () => {
    setIsSyncing(true);
    try {
      const workouts: HealthWorkout[] = includeWorkout
        ? [
            {
              id: `wk_${Date.now()}`,
              type: testWorkoutType,
              durationMinutes: Number(testWorkoutMinutes) || 45,
              activeEnergyKcal: Math.round((testEnergy * 0.6) || 320),
              startedAt: new Date().toISOString(),
              source: 'apple_health',
            },
          ]
        : [];

      const payload: Partial<HealthDailySummary> = {
        userId: 'fran',
        date: new Date().toISOString().split('T')[0],
        steps: Number(testSteps) || 0,
        walkingRunningDistanceKm: Number(testDistance) || 0,
        activeEnergyKcal: Number(testEnergy) || 0,
        workouts,
        source: 'apple_health',
        syncedAt: new Date().toISOString(),
      };

      const res = await api.syncHealthKit(payload);
      setTodayData(res.summary);
      const st = await api.getHealthStatus();
      setStatus(st);
      const hist = await api.getHealthHistory(historyDays);
      setHistory(hist);
      setIsSetupModalOpen(false);
      setStatusMessage('✅ Datos sincronizados correctamente desde Apple Salud.');
      setTimeout(() => setStatusMessage(null), 4000);
    } catch (err: any) {
      alert('Error en sincronización: ' + err.message);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleDisconnect = async () => {
    if (!confirm('¿Desconectar Apple Salud de JARVIS? Podrás volver a vincularla cuando quieras.')) return;
    try {
      await api.disconnectHealth();
      const st = await api.getHealthStatus();
      setStatus(st);
      setStatusMessage('Apple Salud desconectada.');
      setTimeout(() => setStatusMessage(null), 3000);
    } catch (err: any) {
      alert('Error: ' + err.message);
    }
  };

  const syncEndpointUrl = typeof window !== 'undefined' ? `${window.location.origin}/api/healthkit/sync` : '/api/healthkit/sync';

  const copyEndpoint = () => {
    navigator.clipboard.writeText(syncEndpointUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2500);
  };

  // Calculations
  const stepTarget = status?.dailyStepTarget || 8000;
  const currentSteps = todayData?.steps || 0;
  const stepProgress = Math.min(100, Math.round((currentSteps / stepTarget) * 100));

  const distanceKm = todayData?.walkingRunningDistanceKm || 0;
  const activeKcal = todayData?.activeEnergyKcal || 0;
  const workouts = todayData?.workouts || [];

  // Weekly workouts calculation
  const totalWorkoutsWeek = history.reduce((acc, h) => acc + (h.workoutCount || 0), 0);
  const workoutTarget = status?.weeklyWorkoutTarget || 4;

  const isConnected = status?.state === 'CONNECTED';

  return (
    <div className="space-y-6 pb-24">
      {/* HEADER SECTION */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur-xl relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-red-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5 mb-1.5">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-500 to-red-600 flex items-center justify-center text-white shadow-lg shadow-rose-500/20">
                <Heart className="w-5 h-5 fill-white/20" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight font-display">
                  Salud & Vida
                </h1>
                <p className="text-xs sm:text-sm text-slate-400">
                  Métricas reales de movimiento, energía y entrenamientos vía Apple Salud
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {/* Status Pill */}
            <div
              className={`px-3.5 py-1.5 rounded-full border text-xs font-semibold flex items-center gap-2 ${
                isConnected
                  ? 'bg-emerald-950/60 border-emerald-800/60 text-emerald-400'
                  : 'bg-slate-800/80 border-slate-700 text-slate-300'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'
                }`}
              />
              <span>{isConnected ? 'Apple Salud Conectada' : 'No Conectada'}</span>
            </div>

            {/* Sync Now Button */}
            <button
              onClick={handleSyncNow}
              disabled={isSyncing}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white text-xs font-semibold flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50"
              id="btn-health-sync"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-blue-400' : ''}`} />
              <span>{isSyncing ? 'Sincronizando...' : 'Sincronizar'}</span>
            </button>

            {/* Target Settings */}
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white text-xs transition-all"
              id="btn-health-settings"
              title="Ajustar metas diarias"
            >
              <Sliders className="w-4 h-4" />
            </button>

            {/* Setup / Companion modal */}
            <button
              onClick={() => setIsSetupModalOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-blue-500/20 flex items-center gap-1.5 transition-all active:scale-95"
              id="btn-health-setup"
            >
              <Apple className="w-3.5 h-3.5" />
              <span>{isConnected ? 'Configuración iOS' : 'Conectar Apple Salud'}</span>
            </button>
          </div>
        </div>

        {/* Sync Info / Last Synced */}
        <div className="mt-4 pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <Smartphone className="w-3.5 h-3.5 text-slate-500" />
            <span>
              Dispositivo fuente:{' '}
              <strong className="text-slate-300">
                {status?.device || 'iPhone / Apple Watch (Apple HealthKit)'}
              </strong>
            </span>
          </div>

          <div>
            Última sincronización:{' '}
            <strong className="text-slate-300">
              {status?.lastSyncedAt
                ? new Date(status.lastSyncedAt).toLocaleTimeString('es-ES', {
                    hour: '2-digit',
                    minute: '2-digit',
                  }) +
                  ' · ' +
                  new Date(status.lastSyncedAt).toLocaleDateString('es-ES')
                : 'Pendiente de primer sync'}
            </strong>
          </div>
        </div>

        {statusMessage && (
          <div className="mt-3 p-2.5 rounded-xl bg-blue-950/60 border border-blue-800/60 text-blue-300 text-xs flex items-center gap-2 animate-fade-in">
            <Info className="w-4 h-4 shrink-0" />
            <span>{statusMessage}</span>
          </div>
        )}
      </div>

      {/* TODAY'S METRIC CARDS (CUERPO) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. 👣 PASOS */}
        <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-5 shadow-lg relative overflow-hidden group hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold tracking-wider text-slate-400 uppercase flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-emerald-400" />
              Pasos de Hoy
            </span>
            <span className="text-xs font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded-full">
              {stepProgress}%
            </span>
          </div>

          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-3xl sm:text-4xl font-black text-white font-display tracking-tight">
              {currentSteps.toLocaleString('es-ES')}
            </span>
            <span className="text-xs text-slate-400 font-medium">
              / {stepTarget.toLocaleString('es-ES')}
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mb-2">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500 rounded-full"
              style={{ width: `${stepProgress}%` }}
            />
          </div>
          <p className="text-[11px] text-slate-400">
            {currentSteps >= stepTarget
              ? '🎯 ¡Meta diaria superada!'
              : `Faltan ${(stepTarget - currentSteps).toLocaleString('es-ES')} pasos para la meta`}
          </p>
        </div>

        {/* 2. 🏃 DISTANCIA */}
        <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-5 shadow-lg relative overflow-hidden group hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold tracking-wider text-slate-400 uppercase flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-sky-400" />
              Distancia
            </span>
            <span className="text-xs text-sky-400 bg-sky-950/60 border border-sky-800/60 px-2 py-0.5 rounded-full">
              Caminata/Carrera
            </span>
          </div>

          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-3xl sm:text-4xl font-black text-white font-display tracking-tight">
              {distanceKm > 0 ? distanceKm.toFixed(1) : '0,0'}
            </span>
            <span className="text-sm font-semibold text-slate-400">km</span>
          </div>

          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mb-2">
            <div
              className="h-full bg-gradient-to-r from-sky-500 to-blue-500 transition-all duration-500 rounded-full"
              style={{ width: `${Math.min(100, (distanceKm / 7) * 100)}%` }}
            />
          </div>
          <p className="text-[11px] text-slate-400">
            Estimado sobre zancada y GPS del iPhone
          </p>
        </div>

        {/* 3. 🔥 ENERGÍA ACTIVA */}
        <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-5 shadow-lg relative overflow-hidden group hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold tracking-wider text-slate-400 uppercase flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-rose-500" />
              Energía Activa
            </span>
            <span className="text-xs text-rose-400 bg-rose-950/60 border border-rose-800/60 px-2 py-0.5 rounded-full">
              Calorías
            </span>
          </div>

          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-3xl sm:text-4xl font-black text-white font-display tracking-tight">
              {activeKcal.toLocaleString('es-ES')}
            </span>
            <span className="text-sm font-semibold text-slate-400">kcal</span>
          </div>

          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mb-2">
            <div
              className="h-full bg-gradient-to-r from-rose-500 to-amber-500 transition-all duration-500 rounded-full"
              style={{ width: `${Math.min(100, (activeKcal / 700) * 100)}%` }}
            />
          </div>
          <p className="text-[11px] text-slate-400">
            Gasto metabólico por movimiento y entrenamiento
          </p>
        </div>

        {/* 4. 🏋️ ENTRENAMIENTOS */}
        <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-5 shadow-lg relative overflow-hidden group hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold tracking-wider text-slate-400 uppercase flex items-center gap-1.5">
              <Dumbbell className="w-4 h-4 text-purple-400" />
              Entrenamientos
            </span>
            <span className="text-xs text-purple-400 bg-purple-950/60 border border-purple-800/60 px-2 py-0.5 rounded-full">
              {workouts.length} hoy
            </span>
          </div>

          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-3xl sm:text-4xl font-black text-white font-display tracking-tight">
              {workouts.reduce((a, b) => a + (b.durationMinutes || 0), 0)}
            </span>
            <span className="text-sm font-semibold text-slate-400">min totales</span>
          </div>

          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mb-2">
            <div
              className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 transition-all duration-500 rounded-full"
              style={{ width: `${Math.min(100, (workouts.length / 1) * 100)}%` }}
            />
          </div>
          <p className="text-[11px] text-slate-400 truncate">
            {workouts.length > 0
              ? workouts.map((w) => `${w.type} (${w.durationMinutes}m)`).join(', ')
              : 'Sin sesión registrada hoy'}
          </p>
        </div>
      </div>

      {/* DETECTED WORKOUTS LIST & CHECK-IN PROMPT */}
      {workouts.length > 0 && (
        <div className="bg-slate-900/80 border border-purple-900/50 rounded-2xl p-5 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Dumbbell className="w-5 h-5 text-purple-400" />
              <h3 className="text-sm font-bold text-white">Sesiones de Entrenamiento Detectadas Hoy</h3>
            </div>
            {onOpenCheckin && (
              <button
                onClick={onOpenCheckin}
                className="px-3 py-1.5 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 border border-purple-500/40 text-purple-300 text-xs font-semibold flex items-center gap-1.5 transition-all"
              >
                <span>Vincular al Check-in</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {workouts.map((wk, idx) => (
              <div
                key={wk.id || idx}
                className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/80 flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-300">
                    <Dumbbell className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">{wk.type || 'Gym / Fuerza'}</h4>
                    <p className="text-[11px] text-slate-400">
                      {wk.durationMinutes} minutos · {wk.activeEnergyKcal ? `${wk.activeEnergyKcal} kcal` : 'Registrado vía HealthKit'}
                    </p>
                  </div>
                </div>

                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-700 text-slate-300">
                  {wk.startedAt
                    ? new Date(wk.startedAt).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
                    : 'Hoy'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* HISTORICAL ACTIVITY SECTION */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-400" />
              Historial de Actividad Física
            </h3>
            <p className="text-xs text-slate-400">
              Tendencia de pasos diarios vs meta ({stepTarget.toLocaleString('es-ES')})
            </p>
          </div>

          {/* Time range toggle */}
          <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-xl border border-slate-700 self-start sm:self-auto">
            {[
              { days: 7, label: '7 días' },
              { days: 30, label: '30 días' },
              { days: 90, label: '90 días' },
            ].map((t) => (
              <button
                key={t.days}
                onClick={() => setHistoryDays(t.days)}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                  historyDays === t.days
                    ? 'bg-blue-600 text-white shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Bar chart */}
        {history.length === 0 ? (
          <div className="py-12 text-center text-slate-500 text-xs">
            <Activity className="w-8 h-8 mx-auto mb-2 opacity-30 text-slate-400" />
            <p>Aún no hay historial sincronizado en este período.</p>
            <p className="mt-1 text-slate-600">
              Al conectar Apple Salud desde tu iPhone, se registrarán automáticamente tus días.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="h-44 flex items-end gap-2 pt-6 pb-2 px-2 overflow-x-auto">
              {history.map((day, idx) => {
                const steps = day.steps || 0;
                const pct = Math.min(100, Math.round((steps / stepTarget) * 100));
                const isOverGoal = steps >= stepTarget;
                const formattedDate = new Date(day.date).toLocaleDateString('es-ES', {
                  weekday: 'short',
                  day: 'numeric',
                });

                return (
                  <div
                    key={day.id || idx}
                    className="flex-1 min-w-[36px] flex flex-col items-center gap-2 group relative"
                  >
                    {/* Tooltip on hover */}
                    <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 text-white text-[10px] font-mono px-2 py-1 rounded shadow-lg border border-slate-700 pointer-events-none whitespace-nowrap z-20">
                      {steps.toLocaleString('es-ES')} pasos ({day.walkingRunningDistanceKm || 0} km)
                    </div>

                    {/* Bar */}
                    <div className="w-full bg-slate-800/80 rounded-t-lg h-32 flex items-end p-1">
                      <div
                        className={`w-full rounded transition-all duration-300 ${
                          isOverGoal
                            ? 'bg-gradient-to-t from-emerald-600 to-teal-400'
                            : 'bg-gradient-to-t from-blue-600 to-sky-400'
                        }`}
                        style={{ height: `${Math.max(8, pct)}%` }}
                      />
                    </div>

                    <span className="text-[10px] text-slate-400 font-medium truncate w-full text-center">
                      {formattedDate}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Legend & Stats */}
            <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded bg-emerald-500" />
                  <span>Meta cumplida ({stepTarget.toLocaleString('es-ES')}+)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded bg-blue-500" />
                  <span>En progreso</span>
                </div>
              </div>

              <div className="text-slate-300">
                Promedio del período:{' '}
                <strong className="text-white font-mono">
                  {Math.round(
                    history.reduce((a, b) => a + (b.steps || 0), 0) / Math.max(1, history.length)
                  ).toLocaleString('es-ES')}{' '}
                  pasos/día
                </strong>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* PRIVACY & APPLE HEALTHKIT ARCHITECTURE CARD */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 text-xs space-y-3">
        <div className="flex items-center gap-2 text-slate-300 font-bold">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Privacidad, Seguridad y Sandbox de Apple</span>
        </div>
        <p className="text-slate-400 leading-relaxed">
          • <strong>Acceso Estrictamente Limitado</strong>: JARVIS solo lee pasos, distancia recorrida, energía activa y sesiones de entrenamiento. No tiene acceso a expedientes clínicos, electrocardiogramas ni datos médicos privados.
        </p>
        <p className="text-slate-400 leading-relaxed">
          • <strong>Sin intermediarios ni nubes de terceros</strong>: Los datos viajan directo de tu iPhone a tu instancia personal de JARVIS. Podés revocar los permisos en cualquier momento desde <em>Ajustes de iOS &gt; Salud &gt; Acceso a datos y dispositivos</em>.
        </p>
        {isConnected && (
          <div className="pt-2">
            <button
              onClick={handleDisconnect}
              className="text-red-400 hover:text-red-300 font-semibold underline underline-offset-2"
            >
              Desconectar Apple Salud de JARVIS
            </button>
          </div>
        )}
      </div>

      {/* MODAL: TARGET SETTINGS */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-sm w-full p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Sliders className="w-4 h-4 text-blue-400" />
                Ajustar Metas de Salud
              </h3>
              <button
                onClick={() => setIsSettingsOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Meta de pasos diarios:
              </label>
              <div className="grid grid-cols-4 gap-2 mb-2">
                {[6000, 8000, 10000, 12000].map((steps) => (
                  <button
                    key={steps}
                    type="button"
                    onClick={() => setEditStepTarget(steps)}
                    className={`py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                      editStepTarget === steps
                        ? 'bg-blue-600 border-blue-500 text-white'
                        : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {(steps / 1000).toFixed(0)}k
                  </button>
                ))}
              </div>
              <input
                type="number"
                value={editStepTarget}
                onChange={(e) => setEditStepTarget(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs font-mono"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Meta de entrenamientos semanales:
              </label>
              <input
                type="number"
                min="1"
                max="7"
                value={editWorkoutTarget}
                onChange={(e) => setEditWorkoutTarget(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs font-mono"
              />
              <p className="text-[11px] text-slate-500 mt-1">Días sugeridos: 3 a 5 días/semana</p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setIsSettingsOpen(false)}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-200"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveTargets}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-500/20"
              >
                Guardar Metas
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: SETUP APPLE HEALTH / COMPANION GUIDE & TEST SYNC */}
      {isSetupModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 my-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-rose-500 to-red-600 flex items-center justify-center text-white">
                  <Apple className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Conexión con Apple Salud</h3>
                  <p className="text-[11px] text-slate-400">Arquitectura HealthKit nativa para iPhone</p>
                </div>
              </div>
              <button
                onClick={() => setIsSetupModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Explanation of Apple sandbox */}
            <div className="p-3.5 rounded-2xl bg-blue-950/40 border border-blue-800/40 text-xs text-blue-200 space-y-1.5">
              <div className="flex items-center gap-2 font-semibold text-blue-300">
                <Smartphone className="w-4 h-4 text-blue-400" />
                <span>¿Cómo se sincronizan los pasos del celular?</span>
              </div>
              <p className="text-[11px] text-blue-300/80 leading-relaxed">
                Por seguridad estricta del sandbox de Apple, Safari/Chrome Web no pueden acceder directamente a los sensores de HealthKit. La sincronización se realiza mediante la <strong>App Companion Nativa de iOS</strong> incluida en <code>/ios/JarvisCompanion</code>, o enviando el payload al webhook seguro de JARVIS.
              </p>
            </div>

            {/* Webhook Endpoint for Companion App */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                <span>Webhook de Sincronización (POST /api/healthkit/sync):</span>
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={syncEndpointUrl}
                  className="flex-1 px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 text-xs font-mono select-all truncate"
                />
                <button
                  type="button"
                  onClick={copyEndpoint}
                  className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5"
                >
                  {copiedUrl ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedUrl ? 'Copiado' : 'Copiar'}</span>
                </button>
              </div>
              <p className="text-[10px] text-slate-500">
                Tu app de iPhone envía en segundo plano: pasos, distancia, energía activa y entrenamientos.
              </p>
            </div>

            {/* SIMULACIÓN DE PRUEBA / SYNC INMEDIATO */}
            <div className="pt-3 border-t border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  Prueba de Sincronización Inmediata
                </span>
                <span className="text-[10px] font-semibold text-amber-400 bg-amber-950/60 border border-amber-800/60 px-2 py-0.5 rounded-full">
                  Modo Configuración
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Podés ingresar los valores exactos que ves ahora mismo en la app <strong>Salud</strong> de tu iPhone para probar la conexión con el panel y el check-in de JARVIS:
              </p>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">👣 Pasos</label>
                  <input
                    type="number"
                    value={testSteps}
                    onChange={(e) => setTestSteps(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-white text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">🏃 Distancia (km)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={testDistance}
                    onChange={(e) => setTestDistance(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-white text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">🔥 Calorías (kcal)</label>
                  <input
                    type="number"
                    value={testEnergy}
                    onChange={(e) => setTestEnergy(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-white text-xs font-mono"
                  />
                </div>
              </div>

              {/* Workout checkbox */}
              <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-2">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={includeWorkout}
                    onChange={(e) => setIncludeWorkout(e.target.checked)}
                    className="rounded border-slate-600 bg-slate-700 text-purple-600 focus:ring-0"
                  />
                  <span className="text-xs text-slate-300 font-semibold">
                    Incluir entrenamiento de hoy
                  </span>
                </label>

                {includeWorkout && (
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-1">Disciplina</label>
                      <select
                        value={testWorkoutType}
                        onChange={(e) => setTestWorkoutType(e.target.value)}
                        className="w-full px-2 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-white text-xs"
                      >
                        <option value="Gym / Fuerza">Gym / Fuerza</option>
                        <option value="Running">Running</option>
                        <option value="Caminata">Caminata rápida</option>
                        <option value="Ciclismo">Ciclismo</option>
                        <option value="Otro">Otro deporte</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-1">Duración (min)</label>
                      <input
                        type="number"
                        value={testWorkoutMinutes}
                        onChange={(e) => setTestWorkoutMinutes(Number(e.target.value))}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-white text-xs font-mono"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsSetupModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-200"
              >
                Cerrar
              </button>
              <button
                type="button"
                onClick={handleManualSyncSubmit}
                disabled={isSyncing}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-lg shadow-emerald-500/20 flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{isSyncing ? 'Guardando...' : 'Sincronizar a JARVIS'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
