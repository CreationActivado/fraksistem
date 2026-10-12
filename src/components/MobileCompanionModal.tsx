import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import {
  Smartphone,
  Copy,
  Check,
  Zap,
  Wifi,
  Radio,
  ExternalLink,
  ShieldCheck,
  X,
  Share2,
  ArrowRight,
  Bell,
  Heart,
  Terminal,
  Activity,
  CheckCircle2,
} from 'lucide-react';
import { cerebroSync, ConnectedDevice, SyncEvent } from '../services/cerebroSyncService';

interface MobileCompanionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSyncHealthSuccess?: () => void;
}

export const MobileCompanionModal: React.FC<MobileCompanionModalProps> = ({
  isOpen,
  onClose,
  onSyncHealthSuccess,
}) => {
  const [copied, setCopied] = useState(false);
  const [copiedWebhook, setCopiedWebhook] = useState(false);
  const [pingSent, setPingSent] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [activeDevices, setActiveDevices] = useState<ConnectedDevice[]>([]);
  const [activeTab, setActiveTab] = useState<'qr' | 'dispositivos' | 'atajos'>('qr');
  const [lastSyncEvent, setLastSyncEvent] = useState<string | null>(null);

  const currentUrl = typeof window !== 'undefined' ? window.location.href : 'https://ais-pre-...';
  const webhookUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/api/sync/webhook`;

  // Generate QR Code data URL when modal opens
  useEffect(() => {
    if (isOpen) {
      QRCode.toDataURL(currentUrl, {
        width: 320,
        margin: 1.5,
        color: {
          dark: '#0B1120',
          light: '#FFFFFF',
        },
      })
        .then((url) => setQrDataUrl(url))
        .catch((err) => console.error('Error generating QR:', err));
    }
  }, [isOpen, currentUrl]);

  // Subscribe to device presence and sync events
  useEffect(() => {
    if (!isOpen) return;
    const unsubDev = cerebroSync.subscribeDevices((devs) => {
      setActiveDevices(devs);
    });

    const unsubSync = cerebroSync.subscribe((event: SyncEvent) => {
      setLastSyncEvent(`${event.device || 'Dispositivo'}: ${event.label}`);
    });

    return () => {
      unsubDev();
      unsubSync();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyWebhook = () => {
    navigator.clipboard.writeText(webhookUrl);
    setCopiedWebhook(true);
    setTimeout(() => setCopiedWebhook(false), 2000);
  };

  const handleSendPing = async () => {
    setPingSent(true);
    await cerebroSync.sendPing('Computadora de Fran');
    setTimeout(() => setPingSent(false), 3000);
  };

  const isMobileOnline = activeDevices.some((d) => d.type === 'mobile');
  const mobileDevice = activeDevices.find((d) => d.type === 'mobile');

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-fade-in">
      <div className="bg-[#0F172A] rounded-3xl p-5 sm:p-7 border border-slate-700/80 w-full max-w-xl shadow-[0_20px_60px_rgba(0,0,0,0.8)] relative overflow-hidden flex flex-col max-h-[90vh]">
        {/* Decorative Glow */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-blue-600/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-purple-600/10 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="relative z-10 flex items-center gap-3.5 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-sky-400 flex items-center justify-center text-white shadow-lg shadow-blue-500/25 shrink-0">
            <Smartphone className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-white tracking-tight">
                Cerebro Único: Celular & Computadora
              </h2>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 border ${
                  isMobileOnline
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                    : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${isMobileOnline ? 'bg-emerald-400 animate-ping' : 'bg-amber-400 animate-pulse'}`}></span>
                {isMobileOnline ? 'Móvil Conectado' : 'Listo para Vincular'}
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Lo que hacés en tu celular se refleja en tu computadora al segundo, y viceversa.
            </p>
          </div>
        </div>

        {/* Navigation Tabs within Modal */}
        <div className="relative z-10 flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-xl text-xs mb-4">
          <button
            onClick={() => setActiveTab('qr')}
            className={`flex-1 py-1.5 rounded-lg font-bold transition-all ${
              activeTab === 'qr' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Escanear QR
          </button>
          <button
            onClick={() => setActiveTab('dispositivos')}
            className={`flex-1 py-1.5 rounded-lg font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'dispositivos' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>Dispositivos</span>
            {activeDevices.length > 0 && (
              <span className="text-[10px] px-1.5 rounded-full bg-blue-500/40 font-mono">
                {activeDevices.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('atajos')}
            className={`flex-1 py-1.5 rounded-lg font-bold transition-all ${
              activeTab === 'atajos' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Atajos de iOS & NFC
          </button>
        </div>

        {/* Content Body */}
        <div className="relative z-10 flex-1 overflow-y-auto space-y-4 text-xs pr-1">
          {/* TAB 1: QR & PAIRING */}
          {activeTab === 'qr' && (
            <div className="space-y-4">
              <div className="p-4 sm:p-5 bg-slate-900/90 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-center gap-5">
                {/* Real Scannable QR Code */}
                <div className="bg-white p-2.5 rounded-2xl shadow-2xl shrink-0 flex flex-col items-center justify-center">
                  {qrDataUrl ? (
                    <img
                      src={qrDataUrl}
                      alt="Código QR de vinculación instantánea"
                      className="w-36 h-36 rounded-xl object-contain"
                    />
                  ) : (
                    <div className="w-36 h-36 bg-slate-100 animate-pulse rounded-xl" />
                  )}
                  <span className="text-[9px] font-black text-slate-800 tracking-wider uppercase mt-1">
                    Escanear con Cámara
                  </span>
                </div>

                <div className="flex-1 space-y-2 text-center sm:text-left">
                  <div className="flex items-center gap-1.5 justify-center sm:justify-start text-emerald-400 font-extrabold text-xs">
                    <Wifi className="w-4 h-4" />
                    <span>Conexión Instantánea en Vivo (SSE + WebSockets)</span>
                  </div>

                  <p className="text-slate-300 leading-relaxed text-xs">
                    Abrí la cámara de tu iPhone y apuntale al código. Safari abrirá tu JARVIS Personal OS y quedarán sincronizados al instante.
                  </p>

                  <div className="pt-2 flex flex-wrap items-center gap-2 justify-center sm:justify-start">
                    <button
                      onClick={handleCopyUrl}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold flex items-center gap-1.5 transition-all active:scale-95"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-blue-400" />}
                      <span>{copied ? '¡Link Copiado!' : 'Copiar Link'}</span>
                    </button>

                    <button
                      onClick={handleSendPing}
                      disabled={pingSent}
                      className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-extrabold flex items-center gap-1.5 transition-all shadow-md shadow-purple-600/30 active:scale-95 disabled:opacity-50"
                    >
                      <Bell className={`w-3.5 h-3.5 ${pingSent ? 'animate-bounce text-amber-300' : ''}`} />
                      <span>{pingSent ? '¡Ping Sonando en Celular!' : 'Probar Conexión (Ping)'}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Status Banner */}
              {lastSyncEvent && (
                <div className="p-3 rounded-xl bg-slate-900/90 border border-purple-500/40 text-purple-300 font-mono text-[11px] flex items-center gap-2 animate-fade-in">
                  <span className="w-2 h-2 rounded-full bg-purple-400 animate-ping shrink-0" />
                  <span className="truncate">Último evento en vivo: {lastSyncEvent}</span>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: ACTIVE CONNECTED DEVICES */}
          {activeTab === 'dispositivos' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 text-xs font-semibold">
                  Dispositivos en línea con tu Cerebro Único:
                </span>
                <button
                  onClick={handleSendPing}
                  className="text-purple-400 hover:text-purple-300 font-bold flex items-center gap-1"
                >
                  <Bell className="w-3.5 h-3.5" /> Enviar Ping
                </button>
              </div>

              <div className="space-y-2">
                {activeDevices.map((dev) => (
                  <div
                    key={dev.id}
                    className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-3 shadow-md"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-400 shrink-0">
                        {dev.type === 'mobile' ? <Smartphone className="w-4 h-4" /> : <Terminal className="w-4 h-4" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-extrabold text-white text-xs">{dev.name}</h4>
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        </div>
                        <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                          {dev.platform || 'En línea'} {dev.battery ? `· Batería ${dev.battery}` : ''}
                        </p>
                      </div>
                    </div>

                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                      En Vivo
                    </span>
                  </div>
                ))}

                {activeDevices.length === 0 && (
                  <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 text-center text-slate-400 space-y-2">
                    <p>Esperando conexión del móvil...</p>
                    <p className="text-[11px] text-slate-500">
                      Escaneá el código QR desde tu iPhone para registrar tu celular en tiempo real.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: IOS SHORTCUTS & NFC WEBHOOK */}
          {activeTab === 'atajos' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2.5">
                <div className="flex items-center justify-between">
                  <h4 className="font-extrabold text-white text-xs flex items-center gap-1.5">
                    <Radio className="w-4 h-4 text-purple-400" /> Webhook para Atajos de iOS (Shortcuts)
                  </h4>
                  <button
                    onClick={handleCopyWebhook}
                    className="text-blue-400 hover:text-blue-300 font-bold text-[11px] flex items-center gap-1"
                  >
                    {copiedWebhook ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedWebhook ? 'Copiado' : 'Copiar URL'}</span>
                  </button>
                </div>

                <div className="p-2.5 bg-black/40 rounded-xl border border-slate-800 font-mono text-[11px] text-purple-300 break-all select-all">
                  {webhookUrl}
                </div>

                <p className="text-[11px] text-slate-400 leading-relaxed">
                  En la app <strong>Atajos</strong> de tu iPhone, agregá la acción <em>"Obtener contenido de URL"</em> (método POST) hacia esta dirección. Podés vincularla con tus <strong>etiquetas NFC físicas</strong> o con la app Salud.
                </p>
              </div>

              {/* NFC Presets Guide */}
              <div className="space-y-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block px-1">
                  CONFIGURACIÓN DE TUS ETIQUETAS NFC
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                    <div className="font-bold text-white flex items-center gap-1.5">
                      <span>🏷️ NFC Escritorio</span>
                      <span className="text-purple-400 font-mono text-[10px]">(Creko)</span>
                    </div>
                    <p className="text-slate-400 text-[10px]">
                      Dispara: <code>{`{"action":"start_activity","title":"Creko Captación"}`}</code>
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                    <div className="font-bold text-white flex items-center gap-1.5">
                      <span>🏷️ NFC Mochila</span>
                      <span className="text-rose-400 font-mono text-[10px]">(Changa)</span>
                    </div>
                    <p className="text-slate-400 text-[10px]">
                      Dispara: <code>{`{"action":"log_changa","changa":{"amount":50}}`}</code>
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                    <div className="font-bold text-white flex items-center gap-1.5">
                      <span>🏷️ NFC Gimnasio</span>
                      <span className="text-emerald-400 font-mono text-[10px]">(Fuerza)</span>
                    </div>
                    <p className="text-slate-400 text-[10px]">
                      Dispara: <code>{`{"action":"start_activity","title":"Entrenamiento Gym"}`}</code>
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                    <div className="font-bold text-white flex items-center gap-1.5">
                      <span>🏷️ NFC Cama</span>
                      <span className="text-amber-400 font-mono text-[10px]">(Inicio día)</span>
                    </div>
                    <p className="text-slate-400 text-[10px]">
                      Dispara: <code>{`{"action":"start_activity","title":"Inicio del día"}`}</code>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="relative z-10 pt-4 mt-4 border-t border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="text-[11px]">Cifrado local seguro de Fran</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold transition-all"
          >
            Listo
          </button>
        </div>
      </div>
    </div>
  );
};
