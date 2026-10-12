import React, { useState, useEffect } from 'react';
import {
  Camera,
  Heart,
  Hammer,
  ClipboardList,
  Calendar,
  Sparkles,
  MapPin,
  Clock,
  CheckCircle2,
  ChevronRight,
  Zap,
  Activity,
  RefreshCw,
  Dumbbell,
  TrendingUp,
  Flame,
  Volume2,
  VolumeX,
  Radio,
} from 'lucide-react';
import { api } from '../services/api';
import { HealthConnectionStatus, HealthDailySummary } from '../types';
import { jarvisVoice } from '../utils/jarvisVoice';

interface HomeHeroMVPProps {
  onOpenExpense: () => void;
  onOpenCheckin: () => void;
  onOpenChanga: () => void;
  onOpenTasks: () => void;
  onOpenCalendar: () => void;
  onOpenJarvis: () => void;
  onOpenHealth?: () => void;
  latestMood?: number;
  latestEnergy?: number;
}

export const HomeHeroMVP: React.FC<HomeHeroMVPProps> = ({
  onOpenExpense,
  onOpenCheckin,
  onOpenChanga,
  onOpenTasks,
  onOpenCalendar,
  onOpenJarvis,
  onOpenHealth,
  latestMood = 8,
  latestEnergy = 8,
}) => {
  const [timeStr, setTimeStr] = useState('');
  const [dateStr, setDateStr] = useState('');
  const [healthSummary, setHealthSummary] = useState<HealthDailySummary | null>(null);
  const [healthStatus, setHealthStatus] = useState<HealthConnectionStatus | null>(null);
  const [isSyncingHealth, setIsSyncingHealth] = useState(false);
  const [isSpeakingBriefing, setIsSpeakingBriefing] = useState(false);
  const [isLoadingBriefing, setIsLoadingBriefing] = useState(false);
  const [briefingText, setBriefingText] = useState<string | null>(null);

  const fetchHealth = async () => {
    try {
      const res = await api.getTodayHealth();
      setHealthSummary(res.summary);
      setHealthStatus(res.status);
    } catch {
      // Non-blocking
    }
  };

  useEffect(() => {
    fetchHealth();

    const unsubscribe = jarvisVoice.subscribe((speaking) => {
      setIsSpeakingBriefing(speaking);
      if (!speaking) {
        setBriefingText(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const handlePlayBriefing = async () => {
    if (isSpeakingBriefing) {
      jarvisVoice.stop();
      setIsSpeakingBriefing(false);
      setBriefingText(null);
      return;
    }

    setIsLoadingBriefing(true);
    try {
      const briefing = await api.getVoiceBriefing();
      setBriefingText(briefing.text);
      jarvisVoice.speak(briefing.text, () => {
        setIsSpeakingBriefing(false);
        setBriefingText(null);
      });
    } catch (err) {
      console.error('Error al reproducir briefing:', err);
    } finally {
      setIsLoadingBriefing(false);
    }
  };

  const handleSyncHealth = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsSyncingHealth(true);
    try {
      await fetchHealth();
    } finally {
      setTimeout(() => setIsSyncingHealth(false), 500);
    }
  };

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      // Time format HH:MM:SS
      const hours = String(now.getHours()).padStart(2, '0');
      const mins = String(now.getMinutes()).padStart(2, '0');
      const secs = String(now.getSeconds()).padStart(2, '0');
      setTimeStr(`${hours}:${mins}:${secs}`);

      // Date format: Viernes 11 Septiembre
      const weekday = now.toLocaleDateString('es-ES', { weekday: 'long' });
      const day = now.getDate();
      const month = now.toLocaleDateString('es-ES', { month: 'long' });
      const capitalizedWeekday = weekday.charAt(0).toUpperCase() + weekday.slice(1);
      const capitalizedMonth = month.charAt(0).toUpperCase() + month.slice(1);
      setDateStr(`${capitalizedWeekday} ${day} ${capitalizedMonth}`);
    };

    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // Determine state indicator based on mood & energy
  const getStatusText = () => {
    if (latestMood >= 8 && latestEnergy >= 7) return { text: 'Bien', dot: '🟢', color: 'text-emerald-400 bg-emerald-950/60 border-emerald-800/50' };
    if (latestMood >= 6 && latestEnergy >= 5) return { text: 'En marcha', dot: '🟢', color: 'text-emerald-400 bg-emerald-950/60 border-emerald-800/50' };
    if (latestEnergy < 5) return { text: 'Baja energía', dot: '🟡', color: 'text-amber-400 bg-amber-950/60 border-amber-800/50' };
    return { text: 'Cansado / Regulando', dot: '🟡', color: 'text-amber-400 bg-amber-950/60 border-amber-800/50' };
  };

  const status = getStatusText();

  return (
    <div className="bg-[#0F172A] border border-slate-800 rounded-3xl p-5 sm:p-7 shadow-2xl relative overflow-hidden">
      {/* Background subtle glow */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* TOP: Identity & Current Status */}
      <div className="relative z-10 text-center py-2 sm:py-4">
        <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white mb-2 font-display">
          HOLAAA FRAN 👋
        </h1>

        <div className="text-slate-300 text-sm sm:text-base font-medium space-y-1.5">
          <p className="text-slate-200">{dateStr || 'Viernes 11 Septiembre'}</p>
          <div className="flex items-center justify-center gap-2.5 text-slate-400 text-xs sm:text-sm">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/90 border border-slate-700/80 shadow-md">
              <Clock className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
              <span className="font-mono text-white font-extrabold tracking-wider">{timeStr || '10:32:00'}</span>
            </div>
            <span>·</span>
            <span className="flex items-center gap-1 text-slate-300">
              <MapPin className="w-3.5 h-3.5 text-blue-400" /> Logroño
            </span>
          </div>
        </div>

        {/* State indicator and Voice Briefing buttons */}
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2.5">
          <button
            onClick={onOpenCheckin}
            className={`group inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-xs sm:text-sm font-semibold transition-all hover:scale-105 active:scale-95 shadow-sm ${status.color}`}
            id="btn-home-hero-status"
            title="Hacer check-in diario"
          >
            <span className="text-xs text-slate-400 font-normal">¿Cómo estamos hoy?</span>
            <span className="font-bold flex items-center gap-1.5">
              <span>{status.dot}</span> {status.text}
            </span>
            <ChevronRight className="w-3.5 h-3.5 opacity-60 group-hover:translate-x-0.5 transition-transform" />
          </button>

          {/* JARVIS Live Voice Briefing Button */}
          <button
            onClick={handlePlayBriefing}
            disabled={isLoadingBriefing}
            className={`group inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-xs sm:text-sm font-bold transition-all shadow-md active:scale-95 ${
              isSpeakingBriefing
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-emerald-500/20 animate-pulse'
                : 'bg-blue-600/30 hover:bg-blue-600/40 text-blue-200 border-blue-500/40 hover:border-blue-400'
            }`}
            id="btn-home-voice-briefing"
            title="Escuchar a JARVIS darte el parte estratégico del día"
          >
            {isLoadingBriefing ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-400" />
            ) : isSpeakingBriefing ? (
              <Volume2 className="w-3.5 h-3.5 text-emerald-400 animate-bounce" />
            ) : (
              <Radio className="w-3.5 h-3.5 text-blue-400 group-hover:animate-pulse" />
            )}
            <span>
              {isLoadingBriefing
                ? 'Sintetizando...'
                : isSpeakingBriefing
                ? 'JARVIS hablando (Detener)'
                : 'Escuchar a JARVIS 🎙️'}
            </span>
          </button>
        </div>

        {/* Live Audio Speech Transcript Banner */}
        {isSpeakingBriefing && briefingText && (
          <div className="mt-3.5 max-w-xl mx-auto p-3 rounded-2xl bg-blue-950/70 border border-blue-500/40 text-left shadow-lg">
            <div className="flex items-center gap-2 text-[11px] font-bold text-blue-300 mb-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>TRANSMITIENDO EN VIVO · JARVIS OS</span>
            </div>
            <p className="text-xs text-slate-200 leading-relaxed font-sans">
              "{briefingText}"
            </p>
          </div>
        )}

        {/* CUERPO - Apple HealthKit Widget */}
        <div className="mt-5 p-3.5 sm:p-4 rounded-2xl bg-slate-900/90 border border-slate-800/90 shadow-inner text-left">
          <div className="flex items-center justify-between gap-2 mb-3">
            <div
              className="flex items-center gap-2 cursor-pointer group"
              onClick={onOpenHealth}
              title="Abrir panel Salud & Vida"
            >
              <Activity className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-black tracking-wider text-slate-200 uppercase group-hover:text-emerald-300 transition-colors">
                CUERPO
              </span>
              <span className="text-[10px] text-slate-500 font-normal group-hover:text-slate-400">
                (Salud)
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[10px] text-slate-400">
                {healthStatus?.lastSyncedAt
                  ? `Última sinc: ${new Date(healthStatus.lastSyncedAt).toLocaleTimeString('es-ES', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}`
                  : 'Sin sincronizar'}
              </span>
              <button
                onClick={handleSyncHealth}
                disabled={isSyncingHealth}
                className="px-2 py-0.5 rounded-md bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white text-[10px] font-semibold flex items-center gap-1 transition-all active:scale-95"
                id="btn-sync-cuerpo-home"
              >
                <RefreshCw
                  className={`w-2.5 h-2.5 ${isSyncingHealth ? 'animate-spin text-blue-400' : ''}`}
                />
                <span>Sincronizar</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            {/* 👣 Pasos */}
            <div
              onClick={onOpenHealth}
              className="p-2.5 rounded-xl bg-slate-800/70 border border-slate-700/60 hover:border-emerald-500/50 cursor-pointer transition-colors"
            >
              <span className="text-[10px] text-slate-400 block mb-0.5">👣 Pasos</span>
              <span className="font-bold text-white text-sm font-mono block">
                {healthSummary?.steps ? healthSummary.steps.toLocaleString('es-ES') : '—'}
              </span>
            </div>

            {/* 🏃 Distancia */}
            <div
              onClick={onOpenHealth}
              className="p-2.5 rounded-xl bg-slate-800/70 border border-slate-700/60 hover:border-sky-500/50 cursor-pointer transition-colors"
            >
              <span className="text-[10px] text-slate-400 block mb-0.5">🏃 Distancia</span>
              <span className="font-bold text-white text-sm font-mono block">
                {healthSummary?.walkingRunningDistanceKm
                  ? `${healthSummary.walkingRunningDistanceKm} km`
                  : '—'}
              </span>
            </div>

            {/* 🔥 Energía activa */}
            <div
              onClick={onOpenHealth}
              className="p-2.5 rounded-xl bg-slate-800/70 border border-slate-700/60 hover:border-rose-500/50 cursor-pointer transition-colors"
            >
              <span className="text-[10px] text-slate-400 block mb-0.5">🔥 Energía activa</span>
              <span className="font-bold text-white text-sm font-mono block">
                {healthSummary?.activeEnergyKcal ? `${healthSummary.activeEnergyKcal} kcal` : '—'}
              </span>
            </div>

            {/* 🏋️ Entrenamiento */}
            <div
              onClick={onOpenHealth}
              className="p-2.5 rounded-xl bg-slate-800/70 border border-slate-700/60 hover:border-purple-500/50 cursor-pointer transition-colors"
            >
              <span className="text-[10px] text-slate-400 block mb-0.5">🏋️ Entrenamiento</span>
              <span className="font-bold text-white text-xs font-mono truncate block">
                {healthSummary?.workouts && healthSummary.workouts.length > 0
                  ? `${healthSummary.workouts[0].type} · ${healthSummary.workouts[0].durationMinutes}m`
                  : 'Sin registro'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* DIVIDER */}
      <div className="my-5 border-t border-slate-800/80" />

      {/* 2x3 QUICK ACTION MATRIX (High speed under 30 seconds) */}
      <div className="grid grid-cols-2 sm:grid-cols-2 gap-3 sm:gap-4 relative z-10">
        {/* 1. 📸 Gasto */}
        <button
          onClick={onOpenExpense}
          className="p-4 sm:p-5 rounded-2xl bg-[#1E293B] hover:bg-slate-800/90 border border-slate-700/70 hover:border-blue-500/50 transition-all text-left group flex items-center gap-3.5 shadow-lg active:scale-98"
          id="btn-hero-gasto"
        >
          <div className="w-11 h-11 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400 group-hover:scale-105 transition-transform shrink-0">
            <Camera className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-base font-bold text-white group-hover:text-blue-300 transition-colors">
                Gasto
              </span>
              <span className="text-xs">📸</span>
            </div>
            <p className="text-[11px] text-slate-400 truncate">Subir ticket OCR o manual</p>
          </div>
        </button>

        {/* 2. ❤️ Estado */}
        <button
          onClick={onOpenCheckin}
          className="p-4 sm:p-5 rounded-2xl bg-[#1E293B] hover:bg-slate-800/90 border border-slate-700/70 hover:border-rose-500/50 transition-all text-left group flex items-center gap-3.5 shadow-lg active:scale-98"
          id="btn-hero-estado"
        >
          <div className="w-11 h-11 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400 group-hover:scale-105 transition-transform shrink-0">
            <Heart className="w-5 h-5 fill-rose-500/20" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-base font-bold text-white group-hover:text-rose-300 transition-colors">
                Estado
              </span>
              <span className="text-xs">❤️</span>
            </div>
            <p className="text-[11px] text-slate-400 truncate">Ánimo, energía y hábitos</p>
          </div>
        </button>

        {/* 3. 🔨 Changa */}
        <button
          onClick={onOpenChanga}
          className="p-4 sm:p-5 rounded-2xl bg-[#1E293B] hover:bg-slate-800/90 border border-slate-700/70 hover:border-amber-500/50 transition-all text-left group flex items-center gap-3.5 shadow-lg active:scale-98"
          id="btn-hero-changa"
        >
          <div className="w-11 h-11 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:scale-105 transition-transform shrink-0">
            <Hammer className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-base font-bold text-white group-hover:text-amber-300 transition-colors">
                Changa
              </span>
              <span className="text-xs">🔨</span>
            </div>
            <p className="text-[11px] text-slate-400 truncate">DejaVu, Josu o nuevo</p>
          </div>
        </button>

        {/* 4. 📋 Pendientes */}
        <button
          onClick={onOpenTasks}
          className="p-4 sm:p-5 rounded-2xl bg-[#1E293B] hover:bg-slate-800/90 border border-slate-700/70 hover:border-indigo-500/50 transition-all text-left group flex items-center gap-3.5 shadow-lg active:scale-98"
          id="btn-hero-pendientes"
        >
          <div className="w-11 h-11 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400 group-hover:scale-105 transition-transform shrink-0">
            <ClipboardList className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-base font-bold text-white group-hover:text-indigo-300 transition-colors">
                Pendientes
              </span>
              <span className="text-xs">📋</span>
            </div>
            <p className="text-[11px] text-slate-400 truncate">Hoy, semana y futuro</p>
          </div>
        </button>

        {/* 5. 📅 Hoy */}
        <button
          onClick={onOpenCalendar}
          className="p-4 sm:p-5 rounded-2xl bg-[#1E293B] hover:bg-slate-800/90 border border-slate-700/70 hover:border-sky-500/50 transition-all text-left group flex items-center gap-3.5 shadow-lg active:scale-98"
          id="btn-hero-hoy"
        >
          <div className="w-11 h-11 rounded-xl bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-400 group-hover:scale-105 transition-transform shrink-0">
            <Calendar className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-base font-bold text-white group-hover:text-sky-300 transition-colors">
                Hoy
              </span>
              <span className="text-xs">📅</span>
            </div>
            <p className="text-[11px] text-slate-400 truncate">Bloques de tiempo y agenda</p>
          </div>
        </button>

        {/* 6. 🤖 JARVIS */}
        <button
          onClick={onOpenJarvis}
          className="p-4 sm:p-5 rounded-2xl bg-gradient-to-tr from-slate-900 via-[#1E293B] to-blue-950/60 hover:to-blue-900/80 border border-blue-500/40 hover:border-blue-400 transition-all text-left group flex items-center gap-3.5 shadow-xl active:scale-98 ring-1 ring-blue-500/20"
          id="btn-hero-jarvis"
        >
          <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white group-hover:scale-105 transition-transform shrink-0 shadow-md">
            <Sparkles className="w-5 h-5 animate-pulse-slow" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-base font-bold text-white group-hover:text-blue-300 transition-colors">
                JARVIS
              </span>
              <span className="text-xs">🤖</span>
            </div>
            <p className="text-[11px] text-blue-300 truncate">¿Qué hago ahora? & Asistente</p>
          </div>
        </button>
      </div>
    </div>
  );
};
