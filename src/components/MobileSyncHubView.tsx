import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import {
  Smartphone,
  Monitor,
  Wifi,
  Radio,
  CheckCircle2,
  Zap,
  Bell,
  Copy,
  Check,
  Heart,
  RefreshCw,
  Flame,
  Activity,
  Layers,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Terminal,
  ArrowRight,
  Send,
  Plus,
} from 'lucide-react';
import { cerebroSync, ConnectedDevice, SyncEvent } from '../services/cerebroSyncService';
import { api } from '../services/api';
import { activityService } from '../services/activityService';

interface MobileSyncHubViewProps {
  onRefreshData?: () => void;
  onNavigate?: (view: string) => void;
}

export const MobileSyncHubView: React.FC<MobileSyncHubViewProps> = ({
  onRefreshData,
  onNavigate,
}) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [activeDevices, setActiveDevices] = useState<ConnectedDevice[]>([]);
  const [syncEvents, setSyncEvents] = useState<SyncEvent[]>([]);
  const [pingSent, setPingSent] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [copiedWebhook, setCopiedWebhook] = useState(false);
  const [simulatedSuccess, setSimulatedSuccess] = useState<string | null>(null);

  const currentUrl = typeof window !== 'undefined' ? window.location.href : 'https://...';
  const webhookUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/api/sync/webhook`;

  // Generate QR Code
  useEffect(() => {
    QRCode.toDataURL(currentUrl, {
      width: 380,
      margin: 2,
      color: {
        dark: '#0B1120',
        light: '#FFFFFF',
      },
    })
      .then((url) => setQrDataUrl(url))
      .catch((err) => console.error('Error generando QR:', err));
  }, [currentUrl]);

  // Subscribe to live devices and events
  useEffect(() => {
    const unsubDev = cerebroSync.subscribeDevices((devs) => {
      setActiveDevices(devs);
    });

    const unsubEvents = cerebroSync.subscribe((event: SyncEvent) => {
      setSyncEvents((prev) => [event, ...prev.slice(0, 19)]);
    });

    return () => {
      unsubDev();
      unsubEvents();
    };
  }, []);

  const isMobileOnline = activeDevices.some((d) => d.type === 'mobile');
  const mobileDevice = activeDevices.find((d) => d.type === 'mobile');

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const handleCopyWebhook = () => {
    navigator.clipboard.writeText(webhookUrl);
    setCopiedWebhook(true);
    setTimeout(() => setCopiedWebhook(false), 2000);
  };

  const handleSendPing = async () => {
    setPingSent(true);
    await cerebroSync.sendPing('Computadora de Fran');
    setTimeout(() => setPingSent(false), 2500);
  };

  // Simulate NFC Tag Trigger from Desktop to verify pipeline
  const handleSimulateNfc = async (tag: 'cama' | 'escritorio' | 'taller' | 'mochila' | 'gym') => {
    try {
      if (tag === 'cama') {
        await activityService.startActivity({
          title: 'Día iniciado — Rutina Matutina',
          category: 'vida',
          categoryLabel: 'VIDA',
          icon: '☀️',
          notes: 'Disparado desde NFC de la Cama',
        });
        setSimulatedSuccess('¡NFC Cama activado! Día iniciado.');
      } else if (tag === 'escritorio') {
        await activityService.startActivity({
          title: 'Creko — Captación de clientes',
          category: 'creko',
          categoryLabel: 'CREKO',
          icon: '🟣',
          notes: 'Disparado desde NFC del Escritorio',
        });
        setSimulatedSuccess('¡NFC Escritorio activado! Enfoque Creko iniciado.');
      } else if (tag === 'taller') {
        await activityService.startActivity({
          title: 'Creko — Producción & Máquinas',
          category: 'creko',
          categoryLabel: 'CREKO',
          icon: '🏭',
          notes: 'Disparado desde NFC de las Máquinas / Taller',
        });
        setSimulatedSuccess('¡NFC Taller activado! Producción iniciada.');
      } else if (tag === 'mochila') {
        await api.createChanga({
          title: 'Changa rápida (NFC Mochila)',
          client: 'Cliente en Logroño',
          amount: 60,
          hours: 2,
          notes: 'Registrada vía NFC de la mochila',
          date: new Date().toISOString().split('T')[0],
          paid: true,
        });
        setSimulatedSuccess('¡NFC Mochila activado! Changa de 60 € sumada a caja.');
      } else if (tag === 'gym') {
        await api.syncHealthKit({
          workouts: [
            {
              id: `w_nfc_${Date.now()}`,
              type: 'Entrenamiento de Fuerza (Gym)',
              durationMinutes: 45,
              activeEnergyKcal: 280,
              startedAt: new Date().toISOString(),
            },
          ],
          source: 'apple_health',
          device: 'iPhone de Fran (NFC Gym)',
        });
        setSimulatedSuccess('¡NFC Gym activado! Sesión de gimnasio registrada.');
      }

      if (onRefreshData) onRefreshData();
      setTimeout(() => setSimulatedSuccess(null), 3500);
    } catch (err: any) {
      console.error('Error simulando NFC:', err);
    }
  };

  return (
    <div className="space-y-6 pb-24 text-slate-200">
      {/* 1. HERO HEADER */}
      <div className="bg-gradient-to-r from-[#1E293B] via-[#0F172A] to-[#1E1B4B]/30 rounded-3xl p-6 sm:p-8 border border-blue-500/30 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className={`w-3 h-3 rounded-full ${isMobileOnline ? 'bg-emerald-400 animate-ping' : 'bg-amber-400 animate-pulse'}`}></span>
              <span className="text-xs font-black uppercase tracking-wider text-blue-400">
                SISTEMA OPERATIVO MULTIDISPOSITIVO · CEREBRO ÚNICO
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
              Vinculación Computadora ⇄ Celular
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl">
              Lo que hagas en tu computadora o en tu iPhone se mantiene conectado en vivo mediante WebSockets y Server-Sent Events (SSE). No necesitás recargar ni duplicar datos.
            </p>
          </div>

          {/* Quick Ping Button & Status */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="bg-slate-900/90 border border-slate-700/80 rounded-2xl p-4 flex items-center gap-3 shadow-lg">
              <div className="flex -space-x-2 overflow-hidden">
                <div className="w-10 h-10 rounded-xl bg-blue-600 border-2 border-slate-900 flex items-center justify-center text-white">
                  <Monitor className="w-5 h-5" />
                </div>
                <div className={`w-10 h-10 rounded-xl border-2 border-slate-900 flex items-center justify-center text-white ${
                  isMobileOnline ? 'bg-emerald-600' : 'bg-slate-700'
                }`}>
                  <Smartphone className="w-5 h-5" />
                </div>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">
                  Estado de Enlace
                </span>
                <span className={`text-xs font-black ${isMobileOnline ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {isMobileOnline ? 'iPhone Conectado en Vivo' : 'Listo para Conectar'}
                </span>
              </div>
            </div>

            <button
              onClick={handleSendPing}
              disabled={pingSent}
              className="px-4 py-3 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-50"
            >
              <Bell className={`w-4 h-4 ${pingSent ? 'animate-bounce text-amber-300' : ''}`} />
              <span>{pingSent ? '¡Ping Sonando en iPhone!' : 'Probar Conexión (Ping)'}</span>
            </button>
          </div>
        </div>

        {/* Feedback alert */}
        {simulatedSuccess && (
          <div className="relative z-10 mt-4 p-3 rounded-xl bg-emerald-600/90 text-white text-xs font-black flex items-center gap-2 animate-fade-in shadow-md">
            <CheckCircle2 className="w-4 h-4" />
            <span>{simulatedSuccess}</span>
          </div>
        )}
      </div>

      {/* 2. QR CODE & CONNECTION BRIDGE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Real Scannable QR Code */}
        <div className="lg:col-span-5 bg-[#1E293B] rounded-3xl p-6 border border-slate-800 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Smartphone className="w-5 h-5 text-blue-400" />
              <h2 className="text-base font-extrabold text-white">
                Abrir JARVIS en tu Celular
              </h2>
            </div>
            <p className="text-xs text-slate-400 mb-5 leading-relaxed">
              Abrí la cámara de tu iPhone y apuntale al código QR para abrir el sistema en Safari. Automáticamente se empareja con esta computadora.
            </p>

            <div className="bg-white p-4 rounded-3xl shadow-2xl flex flex-col items-center justify-center max-w-[280px] mx-auto">
              {qrDataUrl ? (
                <img
                  src={qrDataUrl}
                  alt="QR para conectar iPhone"
                  className="w-56 h-56 rounded-2xl object-contain"
                />
              ) : (
                <div className="w-56 h-56 bg-slate-100 animate-pulse rounded-2xl" />
              )}
              <div className="flex items-center gap-1.5 mt-3 text-slate-800 text-[11px] font-black uppercase tracking-wider">
                <Wifi className="w-3.5 h-3.5 text-blue-600 animate-pulse" />
                <span>Escanear con Cámara de iPhone</span>
              </div>
            </div>
          </div>

          <div className="pt-6 flex flex-col gap-2">
            <button
              onClick={handleCopyUrl}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-bold flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              {copiedUrl ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-blue-400" />}
              <span>{copiedUrl ? '¡Enlace Copiado al Portapapeles!' : 'Copiar Enlace Directo'}</span>
            </button>
            <p className="text-[10px] text-center text-slate-500">
              Tip: En Safari tocá &quot;Compartir&quot; → &quot;Agregar a pantalla de inicio&quot; para tener el ícono de app en tu iPhone.
            </p>
          </div>
        </div>

        {/* Right Column: Physical NFC Setup & Shortcuts */}
        <div className="lg:col-span-7 space-y-6">
          {/* NFC Tags Manager */}
          <div className="bg-[#1E293B] rounded-3xl p-6 border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-extrabold text-white">
                  Tus Tags Físicos NFC
                </h3>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                5 Puntos Físicos
              </span>
            </div>

            <p className="text-xs text-slate-400">
              Tocá el botón &quot;Simular Toque&quot; para probar la respuesta instantánea en tu computadora como si apoyaras el iPhone sobre la etiqueta física:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* NFC Cama */}
              <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xl">🛏️</span>
                    <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-blue-500/20 text-blue-300">
                      NFC Cama
                    </span>
                  </div>
                  <h4 className="text-xs font-black text-white">Inicio del Día</h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">Abre JARVIS y lanza el briefing con voz</p>
                </div>
                <button
                  onClick={() => handleSimulateNfc('cama')}
                  className="mt-3 py-1.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-extrabold transition-all active:scale-95 text-center"
                >
                  Simular Toque
                </button>
              </div>

              {/* NFC Escritorio */}
              <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xl">🟣</span>
                    <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-purple-500/20 text-purple-300">
                      NFC Escritorio
                    </span>
                  </div>
                  <h4 className="text-xs font-black text-white">Creko — Captación</h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">Inicia cronómetro de clientes y ventas</p>
                </div>
                <button
                  onClick={() => handleSimulateNfc('escritorio')}
                  className="mt-3 py-1.5 px-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-[11px] font-extrabold transition-all active:scale-95 text-center"
                >
                  Simular Toque
                </button>
              </div>

              {/* NFC Taller */}
              <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xl">🏭</span>
                    <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-amber-500/20 text-amber-300">
                      NFC Máquinas
                    </span>
                  </div>
                  <h4 className="text-xs font-black text-white">Creko — Producción</h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">Plóter, corte y taller en marcha</p>
                </div>
                <button
                  onClick={() => handleSimulateNfc('taller')}
                  className="mt-3 py-1.5 px-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-[11px] font-extrabold transition-all active:scale-95 text-center"
                >
                  Simular Toque
                </button>
              </div>

              {/* NFC Gym */}
              <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xl">🏋️‍♂️</span>
                    <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400">
                      NFC Gimnasio
                    </span>
                  </div>
                  <h4 className="text-xs font-black text-white">Entrenamiento de Fuerza</h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">Registra la sesión y suma a Salud</p>
                </div>
                <button
                  onClick={() => handleSimulateNfc('gym')}
                  className="mt-3 py-1.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-extrabold transition-all active:scale-95 text-center"
                >
                  Simular Toque
                </button>
              </div>
            </div>
          </div>

          {/* Webhook & Atajos de iOS */}
          <div className="bg-[#1E293B] rounded-3xl p-6 border border-slate-800 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Terminal className="w-5 h-5 text-indigo-400" />
                <h3 className="text-base font-extrabold text-white">
                  Atajos de iOS (Shortcuts & Webhook)
                </h3>
              </div>
              <button
                onClick={handleCopyWebhook}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1"
              >
                {copiedWebhook ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedWebhook ? '¡URL Copiada!' : 'Copiar Webhook'}</span>
              </button>
            </div>

            <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 font-mono text-[11px] text-slate-300 break-all select-all">
              {webhookUrl}
            </div>

            <p className="text-xs text-slate-400">
              Podés configurar en la app <strong>Atajos</strong> de tu iPhone una automatización para que al escanear tus tags NFC haga una solicitud POST a este webhook enviando <code className="text-indigo-300 font-mono">&#123;&quot;action&quot;: &quot;start_activity&quot;, &quot;title&quot;: &quot;Creko&quot;&#125;</code>.
            </p>
          </div>
        </div>
      </div>

      {/* 3. LIVE EVENT STREAM FEED */}
      <div className="bg-[#1E293B] rounded-3xl p-6 border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-emerald-400 animate-pulse" />
            <h3 className="text-base font-extrabold text-white">
              Registro en Vivo de Eventos Sincronizados
            </h3>
          </div>
          <span className="text-xs text-slate-500 font-mono">
            SSE Stream Activo
          </span>
        </div>

        <div className="space-y-2">
          {syncEvents.length === 0 ? (
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 text-center text-xs text-slate-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-ping mr-2"></span>
              Esperando eventos de actividad, salud o cambios desde el celular o la computadora...
            </div>
          ) : (
            syncEvents.map((ev, index) => (
              <div
                key={ev.id || index}
                className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between gap-3 text-xs animate-fade-in"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0"></span>
                  <span className="font-black text-white truncate">{ev.label}</span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                    {ev.device || 'Sistema'}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {new Date(ev.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
