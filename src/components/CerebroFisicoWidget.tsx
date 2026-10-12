import React, { useState, useEffect } from 'react';
import {
  Activity,
  Flame,
  TrendingUp,
  Heart,
  CheckCircle2,
  Plus,
  RefreshCw,
  Zap,
  Award,
  ChevronRight,
  Sparkles,
  MapPin,
  Clock,
  Compass,
} from 'lucide-react';
import { api } from '../services/api';
import { HealthDailySummary, HealthConnectionStatus } from '../types';
import { cerebroSync } from '../services/cerebroSyncService';
import { AppleHealthSyncModal } from './AppleHealthSyncModal';

interface CerebroFisicoWidgetProps {
  onRefreshParent?: () => void;
  externalTriggerAction?: 'run' | 'skate' | 'workout' | 'health' | null;
  onClearTrigger?: () => void;
}

export const CerebroFisicoWidget: React.FC<CerebroFisicoWidgetProps> = ({
  onRefreshParent,
  externalTriggerAction,
  onClearTrigger,
}) => {
  const [todayHealth, setTodayHealth] = useState<HealthDailySummary | null>(null);
  const [history, setHistory] = useState<HealthDailySummary[]>([]);
  const [status, setStatus] = useState<HealthConnectionStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Apple HealthKit Modal state (iPhone real steps)
  const [isAppleHealthModalOpen, setIsAppleHealthModalOpen] = useState(false);

  // Running Modal state
  const [isRunModalOpen, setIsRunModalOpen] = useState(false);
  const [runKm, setRunKm] = useState<string>('5.0');
  const [runMinutes, setRunMinutes] = useState<string>('28');
  const [runFeel, setRunFeel] = useState<'genial' | 'normal' | 'pesado'>('genial');
  const [runNotes, setRunNotes] = useState<string>('');

  // Skate Modal state (Fran anda en skate!)
  const [isSkateModalOpen, setIsSkateModalOpen] = useState(false);
  const [skateMinutes, setSkateMinutes] = useState<string>('60');
  const [skateStyle, setSkateStyle] = useState<'street' | 'skatepark' | 'cruising' | 'flatground'>('skatepark');
  const [skateSpot, setSkateSpot] = useState<string>('Skatepark de Logroño');
  const [skateTricks, setSkateTricks] = useState<string>('Ollies, Pop shove-it, Kickflips en plano');
  const [skateFeel, setSkateFeel] = useState<'on_fire' | 'buen_flow' | 'cansado'>('buen_flow');

  // Workout Modal / Quick toggle state
  const [isWorkoutModalOpen, setIsWorkoutModalOpen] = useState(false);
  const [workoutType, setWorkoutType] = useState<string>('Gym / Fuerza');
  const [workoutMinutes, setWorkoutMinutes] = useState<string>('45');

  // Manual Step Editor Modal
  const [isStepModalOpen, setIsStepModalOpen] = useState(false);
  const [manualSteps, setManualSteps] = useState<string>('8200');

  // Listen for external trigger from mobile action bar
  useEffect(() => {
    if (externalTriggerAction === 'skate') {
      setIsSkateModalOpen(true);
      if (onClearTrigger) onClearTrigger();
    } else if (externalTriggerAction === 'run') {
      setIsRunModalOpen(true);
      if (onClearTrigger) onClearTrigger();
    } else if (externalTriggerAction === 'workout') {
      setIsWorkoutModalOpen(true);
      if (onClearTrigger) onClearTrigger();
    } else if (externalTriggerAction === 'health') {
      setIsAppleHealthModalOpen(true);
      if (onClearTrigger) onClearTrigger();
    }
  }, [externalTriggerAction, onClearTrigger]);

  const loadHealthData = async () => {
    try {
      setIsLoading(true);
      const [todayRes, historyRes, statusRes] = await Promise.all([
        api.getTodayHealth(),
        api.getHealthHistory(7),
        api.getHealthStatus(),
      ]);
      setTodayHealth(todayRes.summary);
      setHistory(historyRes);
      setStatus(statusRes);
    } catch (err) {
      console.error('Error cargando actividad física:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadHealthData();

    // Listen to real-time sync events from companion mobile device or Apple Health webhook
    const unsubscribe = cerebroSync.subscribe((event) => {
      loadHealthData();
    });

    return () => unsubscribe();
  }, []);

  const currentSteps = typeof todayHealth?.steps === 'number' ? todayHealth.steps : 0;
  const stepTarget = status?.dailyStepTarget || 8000;
  const currentDistance = typeof todayHealth?.walkingRunningDistanceKm === 'number' ? todayHealth.walkingRunningDistanceKm : 0;
  const currentKcal = typeof todayHealth?.activeEnergyKcal === 'number' ? todayHealth.activeEnergyKcal : 0;
  const isHealthConnected = status?.state === 'CONNECTED' || (todayHealth !== null && todayHealth.source === 'apple_health');

  // Check if Fran has worked out, run, or skated today
  const todayWorkouts = todayHealth?.workouts || [];
  const hasRunToday = todayWorkouts.some((w) => w.type.toLowerCase().includes('run'));
  const hasSkateToday = todayWorkouts.some((w) => w.type.toLowerCase().includes('skate'));
  const hasGymToday = todayWorkouts.some((w) => !w.type.toLowerCase().includes('run') && !w.type.toLowerCase().includes('skate'));

  // Calculate Pace (min/km) for running
  const numericKm = parseFloat(runKm) || 0;
  const numericMin = parseFloat(runMinutes) || 0;
  const paceTotalSec = numericKm > 0 ? (numericMin * 60) / numericKm : 0;
  const paceMin = Math.floor(paceTotalSec / 60);
  const paceSec = Math.round(paceTotalSec % 60);
  const formattedPace = numericKm > 0 ? `${paceMin}:${paceSec < 10 ? '0' : ''}${paceSec} min/km` : '0:00 min/km';
  const estimatedRunKcal = Math.round(numericKm * 65);

  // Skate calculations
  const numericSkateMin = parseFloat(skateMinutes) || 60;
  // Skate burns ~380-450 kcal/hour depending on style
  const skateKcalRate = skateStyle === 'street' ? 440 : skateStyle === 'skatepark' ? 420 : skateStyle === 'flatground' ? 380 : 350;
  const estimatedSkateKcal = Math.round((numericSkateMin / 60) * skateKcalRate);
  const estimatedSkateKm = skateStyle === 'cruising'
    ? Number(((numericSkateMin / 60) * 11).toFixed(1))
    : Number(((numericSkateMin / 60) * 3.5).toFixed(1));
  const estimatedSkateSteps = Math.round((numericSkateMin / 60) * 1800);

  // Save Skate session (Fran anda en skate!)
  const handleSaveSkate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const newSteps = currentSteps + estimatedSkateSteps;
      const newDistance = Number((currentDistance + estimatedSkateKm).toFixed(2));
      const newKcal = currentKcal + estimatedSkateKcal;

      const styleLabels: Record<string, string> = {
        street: 'Street Skate',
        skatepark: 'Skatepark / Rampa',
        cruising: 'Cruising / Traslado',
        flatground: 'Flatground / Trucos',
      };

      const newWorkout = {
        id: `skate_${Date.now()}`,
        type: `Skateboarding (${styleLabels[skateStyle] || 'Skate'})`,
        durationMinutes: numericSkateMin,
        distanceKm: estimatedSkateKm,
        activeEnergyKcal: estimatedSkateKcal,
        startedAt: new Date().toISOString(),
        source: 'jarvis_skate_button',
      };

      await api.syncHealthKit({
        date: new Date().toISOString().split('T')[0],
        steps: newSteps,
        walkingRunningDistanceKm: newDistance,
        activeEnergyKcal: newKcal,
        workouts: [...todayWorkouts, newWorkout],
      });

      // Emit real-time sync event so companion devices update instantly!
      await cerebroSync.emit(
        'skate_logged',
        `Sesión de skate (${numericSkateMin} min en ${skateSpot}) registrada`,
        { spot: skateSpot, minutes: numericSkateMin, style: skateStyle }
      );

      setIsSkateModalOpen(false);
      await loadHealthData();
      if (onRefreshParent) onRefreshParent();
    } catch (err: any) {
      alert('Error al registrar sesión de skate: ' + err.message);
    }
  };

  // Save Running session
  const handleSaveRun = async (e: React.FormEvent) => {
    e.preventDefault();
    if (numericKm <= 0) return;

    try {
      const addedSteps = Math.round(numericKm * 1320); // ~1320 steps per km running
      const newSteps = currentSteps + addedSteps;
      const newDistance = Number((currentDistance + numericKm).toFixed(2));
      const newKcal = currentKcal + estimatedRunKcal;

      const newWorkout = {
        id: `run_${Date.now()}`,
        type: 'Running',
        durationMinutes: numericMin,
        distanceKm: numericKm,
        activeEnergyKcal: estimatedRunKcal,
        startedAt: new Date().toISOString(),
        source: 'jarvis_run_button',
      };

      await api.syncHealthKit({
        date: new Date().toISOString().split('T')[0],
        steps: newSteps,
        walkingRunningDistanceKm: newDistance,
        activeEnergyKcal: newKcal,
        workouts: [...todayWorkouts, newWorkout],
      });

      // Real-time broadcast
      await cerebroSync.emit('run_logged', `Carrera de ${numericKm} km registrada por Fran`, { km: numericKm, minutes: numericMin });

      setIsRunModalOpen(false);
      setRunNotes('');
      await loadHealthData();
      if (onRefreshParent) onRefreshParent();
    } catch (err: any) {
      alert('Error al registrar salida a correr: ' + err.message);
    }
  };

  // Save Gym / Training session
  const handleSaveWorkout = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const duration = Number(workoutMinutes) || 45;
      const energy = Math.round(duration * 6.5);

      const newWorkout = {
        id: `wk_${Date.now()}`,
        type: workoutType,
        durationMinutes: duration,
        activeEnergyKcal: energy,
        startedAt: new Date().toISOString(),
        source: 'jarvis_training_button',
      };

      await api.syncHealthKit({
        date: new Date().toISOString().split('T')[0],
        steps: currentSteps,
        walkingRunningDistanceKm: currentDistance,
        activeEnergyKcal: currentKcal + energy,
        workouts: [...todayWorkouts, newWorkout],
      });

      // Real-time broadcast
      await cerebroSync.emit('workout_logged', `Entrenamiento (${workoutType}, ${duration}m) marcado`);

      setIsWorkoutModalOpen(false);
      await loadHealthData();
      if (onRefreshParent) onRefreshParent();
    } catch (err: any) {
      alert('Error al registrar entrenamiento: ' + err.message);
    }
  };

  // Save manual steps
  const handleSaveSteps = async (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseInt(manualSteps, 10);
    if (isNaN(val)) return;

    try {
      const approxDist = Number(((val * 0.75) / 1000).toFixed(2));
      const approxKcal = Math.round(val * 0.045);

      await api.syncHealthKit({
        date: new Date().toISOString().split('T')[0],
        steps: val,
        walkingRunningDistanceKm: approxDist,
        activeEnergyKcal: Math.max(currentKcal, approxKcal),
        workouts: todayWorkouts,
      });

      setIsStepModalOpen(false);
      await loadHealthData();
      if (onRefreshParent) onRefreshParent();
    } catch (err: any) {
      alert('Error al actualizar pasos: ' + err.message);
    }
  };

  // Weekly study calculations
  const totalWeeklyKm = (
    history.reduce((acc, h) => acc + (h.walkingRunningDistanceKm || 0), 0) +
    (todayHealth?.walkingRunningDistanceKm || 0)
  ).toFixed(1);
  const daysTrainedCount =
    history.filter((h) => (h.workouts && h.workouts.length > 0) || (h.steps || 0) >= 8000).length +
    (todayWorkouts.length > 0 ? 1 : 0);

  return (
    <div className="bg-[#1E293B] rounded-2xl p-5 sm:p-6 border border-slate-800 shadow-xl space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 uppercase tracking-wider flex items-center gap-1.5">
              <Activity className="w-3 h-3" /> Cerebro Físico & Hábitos
            </span>
            <span className="text-xs text-slate-400">· Fran Albornoz (Running & Skate)</span>
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
            Deportes, Skate, Correr & Rendimiento
          </h2>
          <p className="text-xs text-slate-400">
            Registrá en 1 toque tus salidas en skate, carreras a pie o entrenamientos de fuerza.
          </p>
        </div>

        {/* Quick Action Buttons: SKATE, RUN, WORKOUT */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Skateboarding button */}
          <button
            onClick={() => setIsSkateModalOpen(true)}
            className={`px-3.5 sm:px-4 py-2 rounded-xl text-xs font-extrabold transition-all border flex items-center gap-1.5 active:scale-95 shadow-md ${
              hasSkateToday
                ? 'bg-amber-950/40 border-amber-500/50 text-amber-300 shadow-amber-500/10'
                : 'bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 border-amber-400 shadow-amber-500/25'
            }`}
            id="btn-sali-en-skate"
          >
            <span>🛹</span>
            <span>{hasSkateToday ? 'Skate Realizado' : '¡Salí en Skate!'}</span>
          </button>

          {/* Running button */}
          <button
            onClick={() => setIsRunModalOpen(true)}
            className={`px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all border flex items-center gap-1.5 active:scale-95 shadow-md ${
              hasRunToday
                ? 'bg-orange-950/40 border-orange-500/50 text-orange-300'
                : 'bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-white border-orange-400 shadow-orange-500/20'
            }`}
            id="btn-sali-a-correr"
          >
            <span>🏃‍♂️</span>
            <span>{hasRunToday ? 'Carrera Registrada' : '¡Salí a correr!'}</span>
          </button>

          {/* Workout / Gym button */}
          <button
            onClick={() => setIsWorkoutModalOpen(true)}
            className={`px-3 sm:px-3.5 py-2 rounded-xl text-xs font-bold transition-all border flex items-center gap-1.5 active:scale-95 ${
              hasGymToday
                ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200'
            }`}
            id="btn-entrenar-hoy"
          >
            {hasGymToday ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Zap className="w-3.5 h-3.5 text-amber-400" />}
            <span>{hasGymToday ? 'Entreno Listo' : 'Fui a entrenar'}</span>
          </button>

          {/* Apple Health button */}
          <button
            onClick={() => setIsAppleHealthModalOpen(true)}
            className="px-3.5 sm:px-4 py-2 rounded-xl text-xs font-extrabold transition-all border flex items-center gap-1.5 active:scale-95 bg-rose-950/40 hover:bg-rose-900/40 border-rose-500/40 text-rose-300 shadow-md shadow-rose-500/10"
            id="btn-apple-health-sync"
            title="Conectar y sincronizar con Salud de iPhone (Apple Health)"
          >
            <Heart className="w-3.5 h-3.5 fill-rose-400 text-rose-400" />
            <span>Salud iPhone</span>
          </button>
        </div>
      </div>

      {/* Metrics Row: Pasos, Distancia, Actividades */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Pasos */}
        <div className="bg-slate-900/80 rounded-xl p-4 border border-slate-800 relative group">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-medium uppercase tracking-wider flex items-center gap-1.5">
              <span>Pasos de Hoy</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 font-bold flex items-center gap-1">
                 Salud iPhone
              </span>
            </span>
            <button
              onClick={() => setIsAppleHealthModalOpen(true)}
              className="text-[11px] text-rose-400 hover:text-rose-300 font-bold flex items-center gap-1 bg-rose-950/50 px-2 py-0.5 rounded-lg border border-rose-800/40 transition-all active:scale-95"
            >
              <span>📲 Sincronizar</span>
            </button>
          </div>
          <div
            onClick={() => setIsAppleHealthModalOpen(true)}
            className="flex items-baseline gap-2 cursor-pointer group-hover:opacity-95 transition-opacity"
            title="Tocar para sincronizar pasos de Salud de iPhone"
          >
            <span className="text-2xl sm:text-3xl font-extrabold text-white font-mono tracking-tight">
              {currentSteps.toLocaleString('es-ES')}
            </span>
            <span className="text-xs text-slate-400 font-bold">/ {stepTarget.toLocaleString('es-ES')}</span>
          </div>

          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mt-3">
            <div
              style={{ width: `${Math.min(100, Math.round((currentSteps / stepTarget) * 100))}%` }}
              className="h-full bg-gradient-to-r from-rose-500 to-emerald-400 rounded-full transition-all"
            />
          </div>
          <div className="text-[10px] text-slate-400 mt-1.5 flex items-center justify-between">
            <span className="text-emerald-400 font-bold">{Math.round((currentSteps / stepTarget) * 100)}% de tu meta</span>
            <span>{currentKcal} kcal quemadas</span>
          </div>
        </div>

        {/* Distancia */}
        <div className="bg-slate-900/80 rounded-xl p-4 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-medium uppercase tracking-wider">Distancia Recorrida</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-extrabold text-emerald-400">
              {currentDistance.toFixed(1)}
            </span>
            <span className="text-xs font-bold text-slate-400">km hoy</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-3 truncate">
            {hasSkateToday
              ? '🛹 Rodaste en skate hoy'
              : hasRunToday
              ? '🏃‍♂️ Carrera completada hoy'
              : '🚶‍♂️ Caminata activa por Logroño'}
          </p>
        </div>

        {/* Sesiones y Deportes */}
        <div className="bg-slate-900/80 rounded-xl p-4 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-medium uppercase tracking-wider">Deportes & Sesiones</span>
            <Award className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-extrabold text-white">
            {todayWorkouts.length} {todayWorkouts.length === 1 ? 'sesión' : 'sesiones'}
          </div>
          <div className="text-[11px] text-slate-400 mt-2 flex flex-wrap gap-1">
            {todayWorkouts.length === 0 ? (
              <span className="text-slate-500">¿Sale skate o trote hoy para despejar la cabeza?</span>
            ) : (
              todayWorkouts.map((w, idx) => {
                const isSkate = w.type.toLowerCase().includes('skate');
                const isRun = w.type.toLowerCase().includes('run');
                return (
                  <span
                    key={idx}
                    className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                      isSkate
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                        : isRun
                        ? 'bg-orange-500/20 text-orange-300 border-orange-500/30'
                        : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                    }`}
                  >
                    {isSkate ? '🛹 ' : isRun ? '🏃‍♂️ ' : '🏋️‍♂️ '}
                    {w.type} ({w.durationMinutes}m)
                  </span>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* 4. Estudio y Avance del Día a Día (Consistencia Fran) */}
      <div className="bg-slate-900/60 rounded-xl p-4 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0 mt-0.5">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              Estudio de Avance Físico de Fran
              <span className="text-[10px] text-emerald-400 font-bold">· En ritmo ascendente</span>
            </h4>
            <p className="text-xs text-slate-300 mt-1 max-w-xl leading-relaxed">
              Llevás acumulados <strong className="text-emerald-400 font-extrabold">{totalWeeklyKm} km</strong> y{' '}
              <strong className="text-white font-extrabold">{daysTrainedCount} días</strong> activos en los últimos 7 días. El skate y el running te despejan la mente, bajan el estrés y te preparan con energía para Creko y los turnos nocturnos de DejaVu.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setIsSkateModalOpen(true)}
            className="px-3 py-1.5 rounded-lg bg-amber-600/90 hover:bg-amber-500 text-white text-xs font-bold transition-all shadow flex items-center gap-1"
          >
            <span>🛹</span> + Sesión Skate
          </button>
          <button
            onClick={() => setIsRunModalOpen(true)}
            className="px-3 py-1.5 rounded-lg bg-orange-600/90 hover:bg-orange-500 text-white text-xs font-bold transition-all shadow flex items-center gap-1"
          >
            <span>🏃‍♂️</span> + Correr Km
          </button>
        </div>
      </div>

      {/* MODAL 1: SALÍ EN SKATE 🛹 (NUEVO PARA FRAN) */}
      {isSkateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#1E293B] rounded-2xl p-6 border border-amber-500/30 w-full max-w-md shadow-2xl animate-scale-up relative">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <span>🛹</span> ¡Sesión de Skate!
              </h3>
              <span className="text-xs text-amber-400 font-bold bg-amber-500/20 px-2 py-0.5 rounded-full border border-amber-500/30">
                Skater Fran
              </span>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Anotá tu sesión de skate: el tiempo sobre la tabla, el spot donde patinaste y los trucos practicados.
            </p>

            <form onSubmit={handleSaveSkate} className="space-y-4">
              {/* Estilo de patinada */}
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  Estilo / Tipo de Sesión
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'skatepark', label: 'Skatepark / Rampa', icon: '🛹' },
                    { id: 'street', label: 'Street / Calle', icon: '🏙️' },
                    { id: 'flatground', label: 'Flat / Práctica Trucos', icon: '🎯' },
                    { id: 'cruising', label: 'Cruising / Desplazamiento', icon: '🛣️' },
                  ].map((style) => (
                    <button
                      key={style.id}
                      type="button"
                      onClick={() => setSkateStyle(style.id as any)}
                      className={`p-2.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-2 ${
                        skateStyle === style.id
                          ? 'bg-amber-500/20 border-amber-500/60 text-amber-300 shadow-sm'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      <span>{style.icon}</span>
                      <span>{style.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Tiempo */}
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Tiempo Patinando (Minutos)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="10"
                    max="360"
                    required
                    value={skateMinutes}
                    onChange={(e) => setSkateMinutes(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xl font-extrabold text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                  <span className="absolute right-4 top-3 text-xs font-bold text-slate-400">
                    minutos
                  </span>
                </div>
                {/* Quick minutes */}
                <div className="flex items-center gap-2 mt-2">
                  {['30', '45', '60', '90', '120'].map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setSkateMinutes(m)}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold border transition-all ${
                        skateMinutes === m
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                          : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                      }`}
                    >
                      {m}m
                    </button>
                  ))}
                </div>
              </div>

              {/* Spot / Lugar */}
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Spot / Lugar Patinado
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={skateSpot}
                    onChange={(e) => setSkateSpot(e.target.value)}
                    placeholder="Ej: Skatepark de Logroño, Plaza del Espolón..."
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                  <MapPin className="w-3.5 h-3.5 text-slate-500 absolute right-3 top-2.5" />
                </div>
              </div>

              {/* Trucos o notas */}
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Trucos Clavados / Práctica
                </label>
                <input
                  type="text"
                  value={skateTricks}
                  onChange={(e) => setSkateTricks(e.target.value)}
                  placeholder="Ej: Ollies limpios, Pop shove-it, probando kickflip..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {/* Live Skate Impact */}
              <div className="bg-slate-900/80 rounded-xl p-3 border border-slate-800 grid grid-cols-2 gap-3 text-center">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">
                    Gasto Calórico
                  </span>
                  <span className="text-base font-extrabold text-amber-400">
                    ~{estimatedSkateKcal} kcal
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">
                    Distancia / Pasos
                  </span>
                  <span className="text-base font-extrabold text-emerald-400">
                    ~{estimatedSkateKm} km · +{estimatedSkateSteps} pasos
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsSkateModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs font-bold transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 text-xs font-extrabold transition-all shadow-md"
                >
                  Guardar Sesión de Skate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: SALÍ A CORRER */}
      {isRunModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#1E293B] rounded-2xl p-6 border border-slate-700 w-full max-w-md shadow-2xl animate-scale-up">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                🏃‍♂️ ¡Salí a correr!
              </h3>
              <span className="text-xs text-orange-400 font-semibold">Registro Rápido</span>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              ¿Cuántos kilómetros corriste, Fran? Anotalo y Jarvis calcula tu ritmo y suma la distancia al instante.
            </p>

            <form onSubmit={handleSaveRun} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  ¿Cuántos kilómetros corriste, Fran?
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    min="0.5"
                    max="50"
                    required
                    value={runKm}
                    onChange={(e) => setRunKm(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-2xl font-extrabold text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                  <span className="absolute right-4 top-4 text-sm font-bold text-slate-400">
                    kilómetros
                  </span>
                </div>

                {/* Quick buttons */}
                <div className="flex items-center gap-2 mt-2">
                  {['3.0', '5.0', '7.5', '10.0'].map((km) => (
                    <button
                      key={km}
                      type="button"
                      onClick={() => setRunKm(km)}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold border transition-all ${
                        runKm === km
                          ? 'bg-orange-500/20 text-orange-300 border-orange-500/50'
                          : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                      }`}
                    >
                      {km} km
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  ¿Cuánto tiempo duró la carrera? (Minutos)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="5"
                    max="300"
                    required
                    value={runMinutes}
                    onChange={(e) => setRunMinutes(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-lg font-bold text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                  <span className="absolute right-4 top-3 text-xs font-bold text-slate-400">
                    minutos
                  </span>
                </div>
              </div>

              {/* Live Calculated Stats */}
              <div className="bg-slate-900/80 rounded-xl p-3 border border-slate-800 grid grid-cols-2 gap-3 text-center">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">
                    Ritmo Promedio
                  </span>
                  <span className="text-base font-extrabold text-orange-400">
                    {formattedPace}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">
                    Calorías Estimadas
                  </span>
                  <span className="text-base font-extrabold text-amber-400">
                    ~{estimatedRunKcal} kcal
                  </span>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Sensación o Nota
                </label>
                <input
                  type="text"
                  placeholder="Ej: Ritmo cómodo por Logroño, buena respiración..."
                  value={runNotes}
                  onChange={(e) => setRunNotes(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsRunModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs font-bold transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-white text-xs font-bold transition-all shadow-md"
                >
                  Guardar Carrera
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: MARCAR ENTRENAMIENTO */}
      {isWorkoutModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#1E293B] rounded-2xl p-6 border border-slate-700 w-full max-w-md shadow-2xl animate-scale-up">
            <h3 className="text-lg font-bold text-white mb-1">Registrar Entrenamiento</h3>
            <p className="text-xs text-slate-400 mb-4">
              Marcá tu sesión de gimnasio, calistenia o fuerza para sumar al estudio diario.
            </p>

            <form onSubmit={handleSaveWorkout} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Tipo de Entrenamiento
                </label>
                <select
                  value={workoutType}
                  onChange={(e) => setWorkoutType(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="Gym / Fuerza">Gym / Fuerza y Pesas</option>
                  <option value="Calistenia">Calistenia / Barras</option>
                  <option value="Funcional">Entrenamiento Funcional</option>
                  <option value="Ciclismo / Bici">Ciclismo</option>
                  <option value="Caminata Rápida">Caminata de Desconexión</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Duración (Minutos)
                </label>
                <input
                  type="number"
                  min="10"
                  max="180"
                  required
                  value={workoutMinutes}
                  onChange={(e) => setWorkoutMinutes(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-base font-bold text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsWorkoutModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs font-bold transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md"
                >
                  Confirmar Entrenamiento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: EDITAR PASOS MANUALMENTE */}
      {isStepModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#1E293B] rounded-2xl p-6 border border-slate-700 w-full max-w-sm shadow-2xl animate-scale-up">
            <h3 className="text-base font-bold text-white mb-1">Actualizar Pasos de Hoy</h3>
            <p className="text-xs text-slate-400 mb-4">
              Ingresá los pasos que marca tu reloj o tu teléfono.
            </p>

            <form onSubmit={handleSaveSteps} className="space-y-4">
              <div>
                <input
                  type="number"
                  required
                  value={manualSteps}
                  onChange={(e) => setManualSteps(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-2xl font-extrabold text-white text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsStepModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md"
                >
                  Guardar Pasos
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CONEXIÓN REAL CON SALUD DE IPHONE (APPLE HEALTHKIT) */}
      <AppleHealthSyncModal
        isOpen={isAppleHealthModalOpen}
        onClose={() => setIsAppleHealthModalOpen(false)}
        currentSteps={currentSteps}
        onSuccessSync={loadHealthData}
      />
    </div>
  );
};
