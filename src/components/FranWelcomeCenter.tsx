import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Sun,
  Moon,
  CloudSun,
  Clock,
  Dumbbell,
  Footprints,
  Zap,
  CheckCircle2,
  RefreshCw,
  Volume2,
  VolumeX,
  Plus,
  ArrowRight,
  Shirt,
  DollarSign,
  Send,
  Calendar,
  Layers,
  Smartphone,
  Check,
  X,
  Play,
  Square,
  Flame,
} from 'lucide-react';
import { AppWelcomeReport, CurrentActivity, ActivityCategory } from '../types';
import { api } from '../services/api';
import { activityService } from '../services/activityService';
import { jarvisVoice } from '../utils/jarvisVoice';
import { cerebroSync, ConnectedDevice } from '../services/cerebroSyncService';

interface FranWelcomeCenterProps {
  currentActivity?: CurrentActivity | null;
  onRefreshParent?: () => void;
  onNavigate?: (view: string) => void;
  onTriggerGym?: () => void;
  onTriggerSkate?: () => void;
  onTriggerRun?: () => void;
  onTriggerQuickChanga?: () => void;
  onOpenNewTransaction?: () => void;
}

export const FranWelcomeCenter: React.FC<FranWelcomeCenterProps> = ({
  currentActivity: propCurrentActivity,
  onRefreshParent,
  onNavigate,
  onTriggerGym,
  onTriggerSkate,
  onTriggerRun,
  onTriggerQuickChanga,
  onOpenNewTransaction,
}) => {
  const [welcomeReport, setWelcomeReport] = useState<AppWelcomeReport | null>(null);
  const [liveTime, setLiveTime] = useState('');
  const [greeting, setGreeting] = useState('¡Buenas Fran! ☀️');
  const [formattedDate, setFormattedDate] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [activeStartedAlert, setActiveStartedAlert] = useState<string | null>(null);
  const [customInput, setCustomInput] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [activeDevices, setActiveDevices] = useState<ConnectedDevice[]>([]);
  const [isRefreshingWeather, setIsRefreshingWeather] = useState(false);

  // Quick inline gym logger
  const [showInlineGym, setShowInlineGym] = useState(false);
  const [gymRoutine, setGymRoutine] = useState('Fuerza / Pecho & Espalda');
  const [gymMinutes, setGymMinutes] = useState('50');
  const [gymWeight, setGymWeight] = useState('70');
  const [gymLoggedNotice, setGymLoggedNotice] = useState<string | null>(null);

  // Activity timer
  const [localActivity, setLocalActivity] = useState<CurrentActivity | null>(propCurrentActivity || null);
  const [elapsedMinutes, setElapsedMinutes] = useState<number>(0);

  // Sync prop changes
  useEffect(() => {
    if (propCurrentActivity) setLocalActivity(propCurrentActivity);
  }, [propCurrentActivity]);

  // Update clock and greeting every second
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      const hours = now.getHours();
      const mins = String(now.getMinutes()).padStart(2, '0');
      const secs = String(now.getSeconds()).padStart(2, '0');
      setLiveTime(`${hours}:${mins}:${secs}`);

      // Greet dynamically by time
      if (hours >= 6 && hours < 13) {
        setGreeting('¡Buenos días Fran! ☀️');
      } else if (hours >= 13 && hours < 20) {
        setGreeting('¡Buenas tardes Fran! 🌤️');
      } else {
        setGreeting('¡Buenas noches Fran! 🌙');
      }

      // Spanish Date
      const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
      const months = [
        'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
        'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
      ];
      setFormattedDate(`${days[now.getDay()]} ${now.getDate()} de ${months[now.getMonth()]}`);
    };

    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  // Update elapsed time for active activity
  useEffect(() => {
    if (!localActivity || !localActivity.isActive) {
      setElapsedMinutes(0);
      return;
    }

    const calcElapsed = () => {
      if (localActivity.startTimestamp) {
        const mins = Math.max(0, Math.floor((Date.now() - localActivity.startTimestamp) / 60000));
        setElapsedMinutes(mins);
      }
    };
    calcElapsed();
    const interval = setInterval(calcElapsed, 10000);
    return () => clearInterval(interval);
  }, [localActivity]);

  // Fetch weather and welcome briefing
  const loadWelcomeReport = async () => {
    try {
      setIsRefreshingWeather(true);
      const data = await api.getWelcomeReport();
      setWelcomeReport(data);
    } catch (err) {
      console.error('Error fetching welcome report:', err);
    } finally {
      setIsRefreshingWeather(false);
    }
  };

  useEffect(() => {
    loadWelcomeReport();

    const unsubVoice = jarvisVoice.subscribe((speaking) => {
      setIsSpeaking(speaking);
    });

    const unsubDevices = cerebroSync.subscribeDevices((devs) => {
      setActiveDevices(devs);
    });

    return () => {
      unsubVoice();
      unsubDevices();
    };
  }, []);

  const isMobileOnline = activeDevices.some((d) => d.type === 'mobile');
  const mobileDevice = activeDevices.find((d) => d.type === 'mobile');

  const handleStartActivity = async (
    title: string,
    category: ActivityCategory,
    categoryLabel: string,
    icon: string,
    notes?: string
  ) => {
    try {
      const act = await activityService.startActivity({
        title,
        category,
        categoryLabel,
        icon,
        notes: notes || '',
      });
      setLocalActivity(act);
      setActiveStartedAlert(`¡Listo! Ahora estás en: ${icon} ${title}`);
      if (onRefreshParent) onRefreshParent();
      setTimeout(() => setActiveStartedAlert(null), 4000);
    } catch (err) {
      console.error('Error starting activity:', err);
    }
  };

  const handleFinishActivity = async () => {
    try {
      await activityService.finishActivity('Finalizado desde el Centro de Bienvenida');
      setLocalActivity(null);
      setActiveStartedAlert('✓ Actividad guardada en tu línea de tiempo');
      if (onRefreshParent) onRefreshParent();
      setTimeout(() => setActiveStartedAlert(null), 3000);
    } catch (err) {
      console.error('Error finishing activity:', err);
    }
  };

  const handleCustomSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customInput.trim()) return;
    await handleStartActivity(
      customInput.trim(),
      'creko',
      'ENFOQUE',
      '🎯',
      'Actividad personalizada iniciada desde el centro de control'
    );
    setCustomInput('');
    setShowCustomInput(false);
  };

  const handleToggleVoice = () => {
    if (isSpeaking) {
      jarvisVoice.stop();
    } else if (welcomeReport) {
      jarvisVoice.speak(welcomeReport.spokenScript);
    }
  };

  // Quick inline gym save
  const handleSaveInlineGym = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const minutes = parseInt(gymMinutes) || 45;
      const kcal = Math.round(minutes * 6.5);
      await api.syncHealthKit({
        workouts: [
          {
            id: `w_gym_${Date.now()}`,
            type: `Gym: ${gymRoutine} (${gymWeight} kg)`,
            durationMinutes: minutes,
            activeEnergyKcal: kcal,
            startedAt: new Date().toISOString(),
          },
        ],
        source: 'apple_health',
        device: 'Computadora de Fran',
      });

      // Also append to life timeline
      await activityService.addTimelineEntry({
        title: `🏋️‍♂️ Gimnasio: ${gymRoutine}`,
        category: 'cuerpo',
        icon: '🏋️‍♂️',
        duration: `${minutes} min`,
        durationMinutes: minutes,
        notes: `Entrenamiento de fuerza completado. Carga aprox: ${gymWeight} kg.`,
      });

      setGymLoggedNotice(`✓ ¡Entrenamiento guardado! ${gymRoutine} (${minutes} min, ~${kcal} kcal)`);
      setShowInlineGym(false);
      if (onRefreshParent) onRefreshParent();
      setTimeout(() => setGymLoggedNotice(null), 5000);
    } catch (err) {
      console.error('Error guardando gym:', err);
    }
  };

  const weather = welcomeReport?.weather;

  return (
    <section
      aria-label="Centro de Bienvenida de Fran"
      className="bg-gradient-to-br from-[#1E293B] via-[#0F172A] to-[#1E1B4B]/35 rounded-3xl p-5 sm:p-7 border border-blue-500/35 shadow-[0_15px_50px_rgba(0,0,0,0.65)] text-slate-100 relative overflow-hidden"
    >
      {/* Decorative Glow Elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20"></div>

      {/* 1. TOP HEADER: SALUDO + HORA EXACTA + CLIMA REAL + ESTADO CELULAR */}
      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-5 border-b border-slate-800/80 pb-6">
        {/* Saludo & Fecha */}
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-xs font-black uppercase tracking-wider text-blue-400">
              JARVIS PERSONAL OS · FRAN ALBORNOZ
            </span>
            <span className="text-xs text-slate-500">· Logroño, La Rioja, España</span>

            {/* Mobile Status Tag */}
            <span
              onClick={() => onNavigate && onNavigate('vinculacion_celular')}
              className={`cursor-pointer px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 border transition-all ${
                isMobileOnline
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30'
                  : 'bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30'
              }`}
              title="Clic para ver centro de vinculación celular"
            >
              <Smartphone className="w-3 h-3" />
              <span>{isMobileOnline ? 'iPhone Conectado' : 'Conectar Celular'}</span>
              <span className={`w-1.5 h-1.5 rounded-full ${isMobileOnline ? 'bg-emerald-400 animate-ping' : 'bg-amber-400 animate-pulse'}`}></span>
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-none">
            {greeting}
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 font-medium pt-0.5">
            Hoy es <span className="text-white font-bold">{formattedDate}</span>. Tu centro operativo está en línea.
          </p>
        </div>

        {/* Reloj Grande en Vivo + Clima en Logroño + Botón de Voz */}
        <div className="flex flex-wrap sm:flex-nowrap items-stretch gap-3">
          {/* Reloj */}
          <div className="bg-slate-900/90 border border-slate-700/80 rounded-2xl p-3.5 sm:p-4 min-w-[145px] flex flex-col justify-between shadow-lg">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span className="font-extrabold uppercase tracking-wider">Hora Exacta</span>
              <Clock className="w-4 h-4 text-purple-400 animate-pulse" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-white font-mono tracking-wider">
              {liveTime || '12:00:00'}
            </div>
            <span className="text-[10px] text-slate-400 font-medium mt-1">Zona horaria: España</span>
          </div>

          {/* Clima de Logroño */}
          <div className="bg-slate-900/90 border border-blue-500/30 rounded-2xl p-3.5 sm:p-4 min-w-[185px] flex flex-col justify-between shadow-lg relative group">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span className="font-extrabold uppercase tracking-wider text-blue-400">Clima Logroño</span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={loadWelcomeReport}
                  disabled={isRefreshingWeather}
                  className="text-slate-400 hover:text-white p-0.5 transition-all"
                  title="Refrescar clima actual"
                >
                  <RefreshCw className={`w-3 h-3 ${isRefreshingWeather ? 'animate-spin text-blue-400' : ''}`} />
                </button>
                <CloudSun className="w-4 h-4 text-amber-400" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black text-white">
                {weather?.temperatureC ?? 22}°C
              </span>
              <span className="text-xs text-amber-300 font-bold">
                {weather?.condition ?? 'Soleado y agradable'}
              </span>
            </div>
            <p className="text-[10px] text-slate-300 line-clamp-1 mt-1">
              {weather?.outfitRecommendation?.top ?? 'Remera liviana y zapatillas cómodas'}
            </p>
          </div>

          {/* Botón de Voz de JARVIS */}
          {welcomeReport && (
            <button
              onClick={handleToggleVoice}
              className={`p-3.5 rounded-2xl border flex flex-col items-center justify-center transition-all active:scale-95 shadow-lg ${
                isSpeaking
                  ? 'bg-purple-600 border-purple-400 text-white animate-pulse'
                  : 'bg-slate-900/90 hover:bg-slate-800 border-slate-700/80 text-purple-300 hover:text-white'
              }`}
              title={isSpeaking ? 'Silenciar a JARVIS' : 'Escuchar reporte diario con voz de JARVIS'}
            >
              {isSpeaking ? (
                <VolumeX className="w-5 h-5 text-white animate-spin" />
              ) : (
                <Volume2 className="w-5 h-5" />
              )}
              <span className="text-[10px] font-black uppercase tracking-wider mt-1">
                {isSpeaking ? 'Pausar' : 'Voz'}
              </span>
            </button>
          )}
        </div>
      </div>

      {/* FEEDBACK BANNER (Actividad o Gym registrado) */}
      {(activeStartedAlert || gymLoggedNotice) && (
        <div className="relative z-10 mt-4 p-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-black text-xs shadow-lg flex items-center justify-between animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-white" />
            <span>{activeStartedAlert || gymLoggedNotice}</span>
          </div>
          <span className="text-[10px] bg-black/20 px-2 py-0.5 rounded font-mono">
            Sincronizado en PC & Móvil
          </span>
        </div>
      )}

      {/* ACTIVIDAD ACTUAL ACTIVA (EN VIVO CON CRONÓMETRO) */}
      {localActivity && localActivity.isActive && (
        <div className="relative z-10 mt-5 p-4 rounded-2xl bg-purple-950/40 border border-purple-500/50 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-600/30 border border-purple-500/50 flex items-center justify-center text-xl shrink-0">
              {localActivity.icon || '⚡'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse"></span>
                <span className="text-[10px] font-black uppercase tracking-wider text-purple-300">
                  Actividad en Curso ({localActivity.categoryLabel || 'ACTIVO'})
                </span>
              </div>
              <h3 className="text-sm font-extrabold text-white">
                {localActivity.title}
              </h3>
              <p className="text-[11px] text-slate-300 font-mono">
                Inicio: {localActivity.startTime} · Tiempo corriendo: <strong className="text-purple-300">{elapsedMinutes} min</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleFinishActivity}
              className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-md active:scale-95 transition-all"
            >
              <Square className="w-3.5 h-3.5" />
              <span>Finalizar Actividad</span>
            </button>
            <button
              onClick={() => onNavigate && onNavigate('dashboard')}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-all"
            >
              Ver Detalle
            </button>
          </div>
        </div>
      )}

      {/* 2. PREGUNTA CENTRAL: ¿CON QUÉ TE VAS A PONER AHORA??? */}
      <div className="relative z-10 mt-6 space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">🎯</span>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">
                ¿Con qué te vas a poner ahora, Fran?
              </h2>
              <p className="text-xs text-slate-400">
                Tocá una opción para registrar y activar el cronómetro en tu computadora y celular:
              </p>
            </div>
          </div>
        </div>

        {/* Grid de Respuestas Inmediatas de 1 Clic */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-2.5">
          {/* Creko Captación */}
          <button
            onClick={() =>
              handleStartActivity(
                'Creko — Captación de clientes',
                'creko',
                'CREKO',
                '🟣',
                'Prospección de comercios en Logroño y presupuestos'
              )
            }
            className="p-3.5 rounded-2xl bg-slate-900/90 hover:bg-purple-950/50 border border-slate-800 hover:border-purple-500/60 text-left transition-all active:scale-95 group shadow-sm flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl">🟣</span>
              <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300">
                Creko
              </span>
            </div>
            <div>
              <span className="text-xs font-black text-white group-hover:text-purple-300 block leading-tight">
                Captación
              </span>
              <span className="text-[10px] text-slate-400 block mt-0.5">Contactos & ventas</span>
            </div>
          </button>

          {/* Creko Producción */}
          <button
            onClick={() =>
              handleStartActivity(
                'Creko — Producción & Máquinas',
                'creko',
                'CREKO',
                '🏭',
                'Taller, plóter de corte y cartelería'
              )
            }
            className="p-3.5 rounded-2xl bg-slate-900/90 hover:bg-purple-950/50 border border-slate-800 hover:border-purple-500/60 text-left transition-all active:scale-95 group shadow-sm flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl">🏭</span>
              <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300">
                Creko
              </span>
            </div>
            <div>
              <span className="text-xs font-black text-white group-hover:text-purple-300 block leading-tight">
                Producción
              </span>
              <span className="text-[10px] text-slate-400 block mt-0.5">Máquinas y taller</span>
            </div>
          </button>

          {/* Burger Palusa */}
          <button
            onClick={() =>
              handleStartActivity(
                'Burger Palusa — Diseño & Pantallas',
                'burger_palusa',
                'BURGER PALUSA',
                '🍔',
                'Packaging, cartelería e indumentaria ($300 pendientes)'
              )
            }
            className="p-3.5 rounded-2xl bg-slate-900/90 hover:bg-amber-950/50 border border-slate-800 hover:border-amber-500/60 text-left transition-all active:scale-95 group shadow-sm flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl">🍔</span>
              <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300">
                300 $
              </span>
            </div>
            <div>
              <span className="text-xs font-black text-white group-hover:text-amber-300 block leading-tight">
                Burger Palusa
              </span>
              <span className="text-[10px] text-slate-400 block mt-0.5">Diseño y pantallas</span>
            </div>
          </button>

          {/* Changa */}
          <button
            onClick={() =>
              handleStartActivity(
                'Changa — Turno DejaVu / Electricidad',
                'trabajo',
                'CHANGA',
                '💰',
                'Turno en DejaVu u oficio exterior'
              )
            }
            className="p-3.5 rounded-2xl bg-slate-900/90 hover:bg-rose-950/50 border border-slate-800 hover:border-rose-500/60 text-left transition-all active:scale-95 group shadow-sm flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl">💰</span>
              <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300">
                Oficio
              </span>
            </div>
            <div>
              <span className="text-xs font-black text-white group-hover:text-rose-300 block leading-tight">
                Changa
              </span>
              <span className="text-[10px] text-slate-400 block mt-0.5">Turno / Servicio</span>
            </div>
          </button>

          {/* Skate */}
          <button
            onClick={() =>
              handleStartActivity(
                'Skate — Sesión de street & trucos',
                'cuerpo',
                'SKATE',
                '🛹',
                'Sesión de skate en spots de Logroño'
              )
            }
            className="p-3.5 rounded-2xl bg-slate-900/90 hover:bg-amber-950/50 border border-slate-800 hover:border-amber-500/60 text-left transition-all active:scale-95 group shadow-sm flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl">🛹</span>
              <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300">
                Cuerpo
              </span>
            </div>
            <div>
              <span className="text-xs font-black text-white group-hover:text-amber-300 block leading-tight">
                Salí en Skate
              </span>
              <span className="text-[10px] text-slate-400 block mt-0.5">Street & spots</span>
            </div>
          </button>

          {/* Pausa / Almuerzo */}
          <button
            onClick={() =>
              handleStartActivity(
                'Pausa & Almuerzo',
                'vida',
                'VIDA',
                '🍝',
                'Comida, descanso y recarga de energía'
              )
            }
            className="p-3.5 rounded-2xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-left transition-all active:scale-95 group shadow-sm flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl">🍝</span>
              <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                Vida
              </span>
            </div>
            <div>
              <span className="text-xs font-black text-white group-hover:text-slate-200 block leading-tight">
                Pausa / Almuerzo
              </span>
              <span className="text-[10px] text-slate-400 block mt-0.5">Recarga de energía</span>
            </div>
          </button>
        </div>

        {/* Input para escribir otra actividad rápida si Fran quiere */}
        <div className="pt-1">
          {!showCustomInput ? (
            <button
              onClick={() => setShowCustomInput(true)}
              className="text-xs text-blue-400 hover:text-blue-300 font-bold flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" /> ¿Vas a hacer otra cosa? Escribila en 2 segundos...
            </button>
          ) : (
            <form onSubmit={handleCustomSubmit} className="flex items-center gap-2 max-w-md animate-fade-in">
              <input
                type="text"
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                placeholder="Ej. Búsqueda de empleo en Logroño, trámite Rotuprint..."
                className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
                autoFocus
              />
              <button
                type="submit"
                disabled={!customInput.trim()}
                className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs disabled:opacity-40 transition-all"
              >
                Arrancar
              </button>
              <button
                type="button"
                onClick={() => setShowCustomInput(false)}
                className="text-slate-400 hover:text-white text-xs px-2"
              >
                Cancelar
              </button>
            </form>
          )}
        </div>
      </div>

      {/* 3. DISPARADORES DE CHEQUEO CLAVE: ¿FUISTE AL GYM? ¡REGISTRALO! */}
      <div className="relative z-10 mt-6 pt-5 border-t border-slate-800/80 space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-black text-white uppercase tracking-wider">
              Chequeo Proactivo de Fran
            </h3>
            <span className="text-xs text-slate-400">· Tocá para registrar en 1 toque</span>
          </div>

          <span className="text-[11px] text-blue-400 font-mono hidden sm:inline">
            Atajo rápido: Ctrl + K
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Tarjeta Gym */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-b from-emerald-950/30 to-slate-900/90 border border-emerald-500/35 shadow-md flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
                <Dumbbell className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-black text-white">¿Fuiste al gym?</h4>
                <p className="text-[10px] text-slate-400">Fuerza & constancia</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={() => setShowInlineGym(!showInlineGym)}
                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-[11px] shadow-sm transition-all active:scale-95"
                id="btn-welcome-log-gym"
              >
                ¡Registralo!
              </button>
            </div>
          </div>

          {/* Tarjeta Skate */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-b from-amber-950/30 to-slate-900/90 border border-amber-500/35 shadow-md flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300 text-xl shrink-0">
                🛹
              </div>
              <div>
                <h4 className="text-xs font-black text-white">¿Saliste en skate?</h4>
                <p className="text-[10px] text-slate-400">Spots & trucos</p>
              </div>
            </div>
            <button
              onClick={() => {
                if (onTriggerSkate) onTriggerSkate();
                else if (onNavigate) onNavigate('health');
              }}
              className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-extrabold text-[11px] shadow-sm transition-all active:scale-95 shrink-0"
              id="btn-welcome-log-skate"
            >
              ¡Anotar sesión!
            </button>
          </div>

          {/* Tarjeta Correr */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-b from-blue-950/30 to-slate-900/90 border border-blue-500/35 shadow-md flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-400 shrink-0">
                <Footprints className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-black text-white">¿Saliste a correr?</h4>
                <p className="text-[10px] text-slate-400">Km & ritmo</p>
              </div>
            </div>
            <button
              onClick={() => {
                if (onTriggerRun) onTriggerRun();
                else if (onNavigate) onNavigate('health');
              }}
              className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-[11px] shadow-sm transition-all active:scale-95 shrink-0"
              id="btn-welcome-log-run"
            >
              ¡Anotar km!
            </button>
          </div>

          {/* Tarjeta Changa / Cobro */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-b from-rose-950/30 to-slate-900/90 border border-rose-500/35 shadow-md flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 shrink-0">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-black text-white">¿Cobraste changa?</h4>
                <p className="text-[10px] text-slate-400">Sumar a la caja</p>
              </div>
            </div>
            <button
              onClick={() => {
                if (onTriggerQuickChanga) onTriggerQuickChanga();
                else if (onOpenNewTransaction) onOpenNewTransaction();
              }}
              className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-[11px] shadow-sm transition-all active:scale-95 shrink-0"
              id="btn-welcome-log-changa"
            >
              + Ingreso
            </button>
          </div>
        </div>

        {/* INLINE GYM LOG EXPANDER */}
        {showInlineGym && (
          <form
            onSubmit={handleSaveInlineGym}
            className="p-4 rounded-2xl bg-slate-900 border border-emerald-500/50 space-y-3 animate-fade-in shadow-xl max-w-2xl"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Dumbbell className="w-4 h-4 text-emerald-400" />
                <h4 className="text-xs font-black text-white uppercase tracking-wider">
                  Registrar Entrenamiento en el Gym de Hoy
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setShowInlineGym(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
              <div>
                <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">
                  Rutina / Músculos
                </label>
                <select
                  value={gymRoutine}
                  onChange={(e) => setGymRoutine(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-medium focus:outline-none focus:border-emerald-500"
                >
                  <option value="Fuerza / Pecho & Espalda">Pecho & Espalda</option>
                  <option value="Piernas & Sentadillas">Piernas & Sentadillas</option>
                  <option value="Hombros & Brazos">Hombros & Brazos</option>
                  <option value="Full Body / Fuerza Integral">Full Body / Integral</option>
                  <option value="Abdominales & Core">Core & Cardio</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">
                  Duración (min)
                </label>
                <input
                  type="number"
                  value={gymMinutes}
                  onChange={(e) => setGymMinutes(e.target.value)}
                  placeholder="50"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-medium focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">
                  Carga Máx Aprox (kg)
                </label>
                <input
                  type="number"
                  value={gymWeight}
                  onChange={(e) => setGymWeight(e.target.value)}
                  placeholder="70"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-medium focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  if (onTriggerGym) onTriggerGym();
                  setShowInlineGym(false);
                }}
                className="text-xs text-slate-400 hover:text-white px-2 py-1"
              >
                Abrir formulario avanzado
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-md transition-all active:scale-95"
              >
                Guardar Entrenamiento
              </button>
            </div>
          </form>
        )}
      </div>
    </section>
  );
};
