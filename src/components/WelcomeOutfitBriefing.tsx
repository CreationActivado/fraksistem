import React, { useState, useEffect } from 'react';
import {
  Music,
  Play,
  Pause,
  CloudSun,
  Shirt,
  Volume2,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Radio,
  RefreshCw,
  Clock,
  Compass,
  Zap,
} from 'lucide-react';
import { AppWelcomeReport, SpotifyState, WeatherOutfitReport } from '../types';
import { api } from '../services/api';
import { jarvisVoice } from '../utils/jarvisVoice';

interface WelcomeOutfitBriefingProps {
  onOpenTasks?: () => void;
  onOpenCheckin?: () => void;
  onOpenQuickChanga?: () => void;
}

export const WelcomeOutfitBriefing: React.FC<WelcomeOutfitBriefingProps> = ({
  onOpenTasks,
  onOpenCheckin,
  onOpenQuickChanga,
}) => {
  const [report, setReport] = useState<AppWelcomeReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isConnectingSpotify, setIsConnectingSpotify] = useState(false);
  const [spotifyState, setSpotifyState] = useState<SpotifyState | null>(null);
  const [isMinimized, setIsMinimized] = useState(false);
  const [hasSpokenOnStart, setHasSpokenOnStart] = useState(false);

  // Load welcome report on mount
  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      try {
        setLoading(true);
        const data = await api.getWelcomeReport();
        if (isMounted) {
          setReport(data);
          setSpotifyState(data.spotify);
        }
      } catch (err) {
        console.error('Error fetching welcome report:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    load();

    const unsub = jarvisVoice.subscribe((speaking) => {
      if (isMounted) setIsSpeaking(speaking);
    });

    return () => {
      isMounted = false;
      unsub();
    };
  }, []);

  // Listen for OAuth postMessage if popup connects Spotify
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const origin = event.origin;
      if (!origin.endsWith('.run.app') && !origin.includes('localhost')) {
        return;
      }
      if (event.data?.type === 'OAUTH_AUTH_SUCCESS' && event.data?.provider === 'spotify') {
        // Refresh Spotify State
        api.getSpotifyState().then((s) => setSpotifyState(s));
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // Speak the briefing
  const handlePlayVoice = () => {
    if (isSpeaking) {
      jarvisVoice.stop();
    } else if (report) {
      jarvisVoice.speak(report.spokenScript);
    }
  };

  // Toggle Spotify Playback
  const handleToggleSpotify = async () => {
    try {
      const updated = await api.toggleSpotifyPlayback();
      setSpotifyState(updated);
    } catch (err) {
      console.error('Error toggling spotify:', err);
    }
  };

  // Connect Spotify OAuth popup
  const handleConnectSpotify = async () => {
    try {
      setIsConnectingSpotify(true);
      const authInfo = await api.getSpotifyAuthUrl();

      if (authInfo.url) {
        // Open provider's authorize URL directly in popup
        const width = 500;
        const height = 700;
        const left = window.screenX + (window.outerWidth - width) / 2;
        const top = window.screenY + (window.outerHeight - height) / 2;

        const authWindow = window.open(
          authInfo.url,
          'spotify_oauth_popup',
          `width=${width},height=${height},left=${left},top=${top},status=0,toolbar=0,menubar=0`
        );

        if (!authWindow) {
          alert('Por favor habilitá las ventanas emergentes (popups) para conectar tu cuenta de Spotify.');
        }
      } else {
        // Simulated instant connection for demo when Client ID is empty
        const connected = await api.updateSpotifyState({
          isConnected: true,
          isPlaying: true,
          playlistName: 'Enfoque & Flow Operativo',
          profileName: 'Fran Albornoz',
        });
        setSpotifyState(connected);
      }
    } catch (err) {
      console.error('Spotify connect error:', err);
    } finally {
      setIsConnectingSpotify(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-[#0F172A] border border-slate-800 rounded-3xl p-4 sm:p-5 shadow-xl flex items-center justify-center gap-3 text-slate-400 text-xs py-8">
        <RefreshCw className="w-4 h-4 animate-spin text-blue-400" />
        <span>JARVIS calibrando clima, Spotify y pendientes de salida a la calle...</span>
      </div>
    );
  }

  if (!report) return null;

  const { weather, pendingTasksSummary } = report;
  const currentSpotify = spotifyState || report.spotify;

  return (
    <div
      className="bg-gradient-to-br from-[#0F172A] via-[#131E35] to-[#0B132B] border border-slate-800/90 rounded-3xl p-4 sm:p-6 shadow-2xl relative overflow-hidden transition-all"
      id="welcome-outfit-briefing-card"
    >
      {/* Subtle ambient lighting */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* TOP HEADER: GREETING & VOICE BUTTON */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-400 shadow-inner">
            <Compass className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black tracking-widest text-blue-400 uppercase">
                JARVIS APERTURA OPERATIVA
              </span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                🟢 En Vivo
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-black text-white tracking-tight">
              ¿Cómo salir a la calle hoy, Fran?
            </h2>
          </div>
        </div>

        {/* Action Controls: Voice + Minimize */}
        <div className="flex items-center gap-2">
          <button
            onClick={handlePlayVoice}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold border transition-all flex items-center gap-2 shadow-md active:scale-95 ${
              isSpeaking
                ? 'bg-emerald-500/25 text-emerald-300 border-emerald-500/60 shadow-emerald-500/20 animate-pulse'
                : 'bg-blue-600/30 hover:bg-blue-600/40 text-blue-200 border-blue-500/40 hover:border-blue-400'
            }`}
            id="btn-voice-outfit-welcome"
            title="Escuchar reporte completo de vestimenta y pendientes por voz"
          >
            {isSpeaking ? (
              <>
                <Volume2 className="w-3.5 h-3.5 text-emerald-400 animate-bounce" />
                <span>Hablando (Detener)</span>
              </>
            ) : (
              <>
                <Radio className="w-3.5 h-3.5 text-blue-400" />
                <span>Escuchar a JARVIS 🎙️</span>
              </>
            )}
          </button>

          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-400 hover:text-white border border-slate-700/60 text-xs transition-colors"
            title={isMinimized ? 'Expandir reporte' : 'Minimizar'}
          >
            {isMinimized ? 'Expandir ▾' : 'Ocultar ▴'}
          </button>
        </div>
      </div>

      {/* BODY CONTENT (Collapsible) */}
      {!isMinimized && (
        <div className="relative z-10 pt-4 space-y-4">
          {/* GRID: 1. CLIMA & VESTIMENTA / 2. SPOTIFY & PENDIENTES */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            
            {/* LEFT COLUMN: VESTIMENTA RECOMENDADA (Lg 7 cols) */}
            <div className="lg:col-span-7 bg-[#1E293B]/85 border border-slate-700/70 rounded-2xl p-4 sm:p-5 shadow-lg flex flex-col justify-between">
              <div>
                {/* Header Clima */}
                <div className="flex items-center justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2">
                    <CloudSun className="w-5 h-5 text-amber-400" />
                    <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                      Clima en {weather.city}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 font-mono text-xs">
                    <span className="font-extrabold text-white text-base">
                      {weather.temperatureC}°C
                    </span>
                    <span className="text-slate-400">
                      (Sensación: {weather.feelsLikeC}°C)
                    </span>
                  </div>
                </div>

                {/* Outfit Title Banner */}
                <div className="bg-gradient-to-r from-blue-900/40 via-indigo-900/30 to-slate-900/50 border border-blue-500/30 rounded-xl p-3 mb-3.5">
                  <div className="flex items-center gap-2 text-blue-300 text-xs font-bold mb-1">
                    <Shirt className="w-4 h-4 text-blue-400" />
                    <span>{weather.outfitRecommendation.title}</span>
                  </div>
                  <p className="text-xs text-slate-200 leading-relaxed font-sans">
                    {weather.outfitRecommendation.summary}
                  </p>
                </div>

                {/* Outfit Checklist / Breakdown */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-slate-900/70 border border-slate-800">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block mb-0.5">
                      👕 Arriba (Torso)
                    </span>
                    <p className="text-white font-medium">
                      {weather.outfitRecommendation.top}
                    </p>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-900/70 border border-slate-800">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block mb-0.5">
                      👖 Abajo (Piernas)
                    </span>
                    <p className="text-white font-medium">
                      {weather.outfitRecommendation.bottom}
                    </p>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-900/70 border border-slate-800">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block mb-0.5">
                      👟 Calzado
                    </span>
                    <p className="text-white font-medium">
                      {weather.outfitRecommendation.footwear}
                    </p>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-900/70 border border-slate-800">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block mb-0.5">
                      🎒 Extras / Accesorios
                    </span>
                    <p className="text-white font-medium">
                      {weather.outfitRecommendation.accessories}
                    </p>
                  </div>
                </div>
              </div>

              {/* JARVIS Tip */}
              <div className="mt-3.5 pt-3 border-t border-slate-800/80 flex items-start gap-2 text-[11px] text-amber-300/90 bg-amber-950/20 p-2 rounded-xl border border-amber-500/20">
                <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <p>
                  <span className="font-bold text-amber-200">Consejo de salida: </span>
                  {weather.outfitRecommendation.tip}
                </p>
              </div>
            </div>

            {/* RIGHT COLUMN: SPOTIFY + REPORTE DE PENDIENTES (Lg 5 cols) */}
            <div className="lg:col-span-5 flex flex-col gap-3">
              
              {/* 🎵 SPOTIFY WIDGET */}
              <div className="bg-[#1E293B]/85 border border-slate-700/70 rounded-2xl p-4 shadow-lg">
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-[#1DB954]/20 flex items-center justify-center text-[#1DB954]">
                      <Music className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs font-bold text-white tracking-wide">
                      SPOTIFY CONNECT
                    </span>
                  </div>

                  {currentSpotify.isConnected ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#1DB954] bg-[#1DB954]/10 px-2 py-0.5 rounded-full border border-[#1DB954]/30">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#1DB954] animate-ping" />
                      Conectado ({currentSpotify.profileName || 'Fran'})
                    </span>
                  ) : (
                    <button
                      onClick={handleConnectSpotify}
                      disabled={isConnectingSpotify}
                      className="inline-flex items-center gap-1 text-[10px] font-bold bg-[#1DB954] hover:bg-[#1ed760] text-black px-2.5 py-1 rounded-full transition-all shadow-sm active:scale-95"
                      id="btn-connect-spotify"
                    >
                      <Zap className="w-3 h-3" />
                      {isConnectingSpotify ? 'Conectando...' : 'Vincular mi Spotify'}
                    </button>
                  )}
                </div>

                {/* Track / Playlist Player State */}
                <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                  <div className="w-12 h-12 rounded-lg bg-emerald-950/60 border border-emerald-500/30 overflow-hidden shrink-0 flex items-center justify-center relative group">
                    {currentSpotify.currentTrack?.albumArt ? (
                      <img
                        src={currentSpotify.currentTrack.albumArt}
                        alt="Album art"
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <Music className="w-6 h-6 text-[#1DB954]" />
                    )}
                    {currentSpotify.isPlaying && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <div className="flex items-end gap-0.5 h-4">
                          <span className="w-1 bg-[#1DB954] h-full animate-bounce" />
                          <span className="w-1 bg-[#1DB954] h-2/3 animate-bounce [animation-delay:0.2s]" />
                          <span className="w-1 bg-[#1DB954] h-4/5 animate-bounce [animation-delay:0.4s]" />
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-white truncate">
                      {currentSpotify.currentTrack?.name || 'Música de Trabajo & Concentración'}
                    </p>
                    <p className="text-[11px] text-slate-400 truncate">
                      {currentSpotify.currentTrack?.artist || 'Spotify Flow'} · {currentSpotify.playlistName}
                    </p>
                    <div className="flex items-center gap-1.5 mt-1 text-[10px] text-slate-500">
                      <span>{currentSpotify.device || 'iPhone de Fran'}</span>
                    </div>
                  </div>

                  <button
                    onClick={handleToggleSpotify}
                    className={`w-9 h-9 rounded-full flex items-center justify-center transition-all shrink-0 ${
                      currentSpotify.isPlaying
                        ? 'bg-[#1DB954] text-black shadow-lg shadow-[#1DB954]/20 hover:scale-105'
                        : 'bg-slate-800 text-white hover:bg-slate-700'
                    }`}
                    id="btn-play-pause-spotify"
                    title={currentSpotify.isPlaying ? 'Pausar' : 'Reproducir playlist'}
                  >
                    {currentSpotify.isPlaying ? (
                      <Pause className="w-4 h-4 fill-current" />
                    ) : (
                      <Play className="w-4 h-4 fill-current ml-0.5" />
                    )}
                  </button>
                </div>
              </div>

              {/* 📋 REPORTE DE PENDIENTES */}
              <div className="bg-[#1E293B]/85 border border-slate-700/70 rounded-2xl p-4 shadow-lg flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2.5">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                        Tus Pendientes Críticos
                      </span>
                    </div>

                    {pendingTasksSummary.moneyPendingAmount > 0 && (
                      <span className="text-[11px] font-mono font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded-full">
                        💰 {pendingTasksSummary.moneyPendingAmount} € por cobrar
                      </span>
                    )}
                  </div>

                  {/* List of top priorities */}
                  <div className="space-y-1.5">
                    {pendingTasksSummary.topPriorities.slice(0, 3).map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 text-xs text-slate-200 bg-slate-900/60 p-2 rounded-xl border border-slate-800 hover:border-slate-700 transition-colors"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0" />
                        <span className="truncate">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between gap-2">
                  <span className="text-[11px] text-slate-400">
                    {pendingTasksSummary.urgentCount} urgentes · {pendingTasksSummary.todayCount} para hoy
                  </span>
                  {onOpenTasks && (
                    <button
                      onClick={onOpenTasks}
                      className="text-xs text-blue-400 hover:text-blue-300 font-bold flex items-center gap-1 group"
                    >
                      <span>Ver todos</span>
                      <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  )}
                </div>
              </div>

            </div>

          </div>
        </div>
      )}
    </div>
  );
};
