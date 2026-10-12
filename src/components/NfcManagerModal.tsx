import React, { useState } from 'react';
import {
  Sparkles,
  X,
  Dumbbell,
  Briefcase,
  BookOpen,
  Wallet,
  Cigarette,
  Copy,
  Check,
  Smartphone,
  ExternalLink,
  Zap,
} from 'lucide-react';
import { api } from '../services/api';

interface NfcManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTriggerAction?: (type: string) => void;
}

export const NfcManagerModal: React.FC<NfcManagerModalProps> = ({
  isOpen,
  onClose,
  onTriggerAction,
}) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isNfcScanning, setIsNfcScanning] = useState(false);

  if (!isOpen) return null;

  const currentHost = typeof window !== 'undefined' ? window.location.origin : 'https://jarvis.app';

  const nfcTags = [
    {
      id: 'gym',
      name: 'NFC Gimnasio',
      icon: '🏋️',
      color: 'amber',
      description: 'Abrir Jarvis + Registrar entrenamiento en gym + Sumar +100 XP',
      url: `${currentHost}/?nfc=gym`,
    },
    {
      id: 'work',
      name: 'NFC Trabajo',
      icon: '💼',
      color: 'blue',
      description: 'Abrir Jarvis + Ver tareas laborales + Iniciar temporizador de trabajo',
      url: `${currentHost}/?nfc=work`,
    },
    {
      id: 'reading',
      name: 'NFC Lectura',
      icon: '📖',
      color: 'purple',
      description: 'Abrir Jarvis + Registrar 20 min de lectura + Sumar +100 XP',
      url: `${currentHost}/?nfc=reading`,
    },
    {
      id: 'finance',
      name: 'NFC Finanzas / Gastos',
      icon: '💰',
      color: 'emerald',
      description: 'Abrir Jarvis + Abrir modal de nuevo gasto al instante',
      url: `${currentHost}/?nfc=finance`,
    },
    {
      id: 'smoke',
      name: 'NFC Humo / Tabaco',
      icon: '🚬',
      color: 'rose',
      description: 'Abrir Jarvis + Registrar 1 cigarrillo + Restar -50 XP para autocontrol',
      url: `${currentHost}/?nfc=smoke`,
    },
  ];

  const handleCopy = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleExecuteTrigger = async (type: string) => {
    try {
      const res = await api.triggerNfc(type as any);
      setStatusMessage(res.message);
      if (onTriggerAction) onTriggerAction(type);
      setTimeout(() => setStatusMessage(null), 3500);
    } catch (err) {
      console.error('Error triggering NFC action:', err);
    }
  };

  const handleWebNfcWrite = async (url: string) => {
    if ('NDEFReader' in window) {
      try {
        setIsNfcScanning(true);
        setStatusMessage('Acercá el tag NFC a la parte trasera de tu teléfono...');
        // @ts-ignore
        const ndef = new window.NDEFReader();
        await ndef.write({
          records: [{ recordType: 'url', data: url }],
        });
        setStatusMessage('¡Tag NFC grabado con éxito!');
      } catch (err: any) {
        setStatusMessage(`Error o cancelado: ${err.message || err}`);
      } finally {
        setIsNfcScanning(false);
      }
    } else {
      setStatusMessage('Copia la URL y grábala con la app "NFC Tools" (tu navegador no soporta Web NFC nativo).');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#0B1120] border border-slate-800 rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl relative text-slate-200 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                Accesos Rápidos con NFC
              </h3>
              <p className="text-xs text-slate-400">Automatizaciones táctiles con tags físicas</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Status message */}
        {statusMessage && (
          <div className="bg-indigo-600/20 border-b border-indigo-500/30 px-4 py-2.5 text-xs text-indigo-300 font-semibold flex items-center gap-2">
            <Sparkles className="w-4 h-4 shrink-0" />
            <span>{statusMessage}</span>
          </div>
        )}

        <div className="p-5 overflow-y-auto space-y-4">
          <p className="text-xs text-slate-400 leading-relaxed">
            Podés grabar estas URLs en stickers o tags NFC (NTAG213 / NTAG215) usando apps como <strong>NFC Tools</strong> o la app Atajos de iPhone, o presionar <strong>"Disparar"</strong> para probar la acción directamente.
          </p>

          <div className="space-y-3">
            {nfcTags.map((tag) => (
              <div
                key={tag.id}
                className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 transition-all"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl mt-0.5">{tag.icon}</span>
                    <div>
                      <h4 className="text-sm font-bold text-white flex items-center gap-2">
                        {tag.name}
                      </h4>
                      <p className="text-xs text-slate-300/90 mt-0.5 leading-relaxed">
                        {tag.description}
                      </p>
                      <code className="text-[10px] text-slate-500 font-mono bg-slate-950 px-2 py-0.5 rounded block mt-1.5 break-all max-w-sm">
                        {tag.url}
                      </code>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5 shrink-0">
                    <button
                      onClick={() => handleExecuteTrigger(tag.id)}
                      className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-1 shadow-md transition-all"
                      title="Probar y ejecutar acción de inmediato"
                    >
                      <Zap className="w-3.5 h-3.5 text-amber-300" /> Disparar
                    </button>

                    <button
                      onClick={() => handleCopy(tag.url, tag.id)}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-semibold text-xs flex items-center justify-center gap-1 transition-all"
                    >
                      {copiedKey === tag.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" /> Copiado
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" /> Copiar Link
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/60 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white transition-all"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
