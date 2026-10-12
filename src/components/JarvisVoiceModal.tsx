import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  X,
  Radio,
  Sparkles,
  RefreshCw,
  Sliders,
  Play,
  Square,
  CheckCircle2,
  MessageSquare,
  Cpu,
} from 'lucide-react';
import { jarvisVoice } from '../utils/jarvisVoice';
import { api } from '../services/api';

interface JarvisVoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRefreshData?: () => void;
  onSendMessageToChat?: (text: string) => void;
}

export const JarvisVoiceModal: React.FC<JarvisVoiceModalProps> = ({
  isOpen,
  onClose,
  onRefreshData,
  onSendMessageToChat,
}) => {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [lastResponse, setLastResponse] = useState<string>('Hola Fran. Estoy listo. Hablame y te responderé por voz en tiempo real.');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [voiceSettings, setVoiceSettings] = useState(jarvisVoice.getSettings());
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [pulseLevel, setPulseLevel] = useState(0);

  const recognitionRef = useRef<any>(null);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isOpen) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // ignore
        }
      }
      jarvisVoice.stop();
      return;
    }

    // Load voices
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const loadVoices = () => {
        const voices = jarvisVoice.getAvailableVoices();
        setAvailableVoices(voices);
      };
      loadVoices();
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }

    // Subscribe to speaking
    const unsub = jarvisVoice.subscribe((speaking) => {
      setIsSpeaking(speaking);
    });

    // Start subtle pulse loop
    const animateWave = () => {
      setPulseLevel(Math.random() * 0.4 + 0.6);
      animationFrameRef.current = requestAnimationFrame(animateWave);
    };
    animationFrameRef.current = requestAnimationFrame(animateWave);

    return () => {
      unsub();
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [isOpen]);

  const startListening = () => {
    if (typeof window === 'undefined') return;
    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRec) {
      setLastResponse('El reconocimiento de voz por micrófono no está soportado en este navegador. Podés usar el chat para hablar con JARVIS.');
      return;
    }

    // Stop speaking if was talking
    jarvisVoice.stop();
    jarvisVoice.playBeep('listen');

    try {
      const recognition = new SpeechRec();
      recognition.lang = 'es-ES';
      recognition.continuous = false;
      recognition.interimResults = true;

      recognition.onstart = () => {
        setIsListening(true);
        setTranscript('');
      };

      recognition.onresult = (event: any) => {
        let current = '';
        for (let i = 0; i < event.results.length; i++) {
          current += event.results[i][0].transcript;
        }
        setTranscript(current);
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech error:', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
        if (transcript.trim()) {
          handleVoiceSubmit(transcript.trim());
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error('Recognition start error:', err);
      setIsListening(false);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
    }
    setIsListening(false);
  };

  const handleVoiceSubmit = async (queryText: string) => {
    if (!queryText.trim() || isProcessing) return;
    setIsProcessing(true);
    setLastResponse('Procesando solicitud estratégica...');

    try {
      if (onSendMessageToChat) {
        onSendMessageToChat(queryText);
      }

      const res = await api.sendChatMessage(queryText);
      setLastResponse(res.message);

      // Speak answer out loud
      jarvisVoice.speak(res.message, () => {
        setIsSpeaking(false);
      });

      if (onRefreshData && (res.actionDetails || res.appliedModifications)) {
        onRefreshData();
      }
    } catch (err) {
      setLastResponse('Disculpá Fran, hubo una interrupción al conectar con mi núcleo central. Intentá de nuevo.');
      jarvisVoice.speak('Disculpá Fran, hubo una interrupción de conexión.');
    } finally {
      setIsProcessing(false);
    }
  };

  const playTestSpeech = () => {
    const testText = 'Hola Fran. Sistema de voz en vivo operativo. ¿En qué nos enfocamos hoy?';
    jarvisVoice.speak(testText);
  };

  const handleQuickCommand = (text: string) => {
    setTranscript(text);
    handleVoiceSubmit(text);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-gradient-to-b from-slate-900 via-slate-950 to-black border border-cyan-500/30 rounded-2xl shadow-2xl shadow-cyan-500/10 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-cyan-500/20 bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/40 text-cyan-400">
              <Radio className={`w-5 h-5 ${isSpeaking ? 'animate-pulse text-cyan-300' : ''}`} />
              {isSpeaking && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-cyan-400 rounded-full animate-ping" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-white text-base tracking-wide flex items-center gap-1.5">
                  JARVIS VOICE HUB
                  <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                    VOZ ACTIVA
                  </span>
                </h3>
              </div>
              <p className="text-xs text-slate-400">
                {isSpeaking
                  ? 'Hablando en voz alta a Fran...'
                  : isListening
                  ? 'Escuchándote en vivo... habla ahora'
                  : isProcessing
                  ? 'Pensando respuesta...'
                  : 'Listo para hablar con vos'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className={`p-2 rounded-lg border transition-all ${
                showSettings
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50'
                  : 'text-slate-400 hover:text-white border-slate-700/60 hover:border-slate-600'
              }`}
              title="Ajustes de voz de JARVIS"
            >
              <Sliders className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Settings Sub-drawer */}
        {showSettings && (
          <div className="p-4 bg-slate-900/90 border-b border-cyan-500/20 text-xs text-slate-300 space-y-3 animate-in slide-in-from-top-2">
            <div className="flex items-center justify-between font-semibold text-cyan-400 uppercase tracking-wider text-[11px]">
              <span>Configuración de Voz Neural</span>
              <button
                onClick={playTestSpeech}
                className="flex items-center gap-1 text-cyan-300 hover:text-cyan-200 bg-cyan-950/60 px-2 py-1 rounded border border-cyan-700/50"
              >
                <Play className="w-3 h-3" /> Probar Voz
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Voz del Navegador:</label>
                <select
                  value={voiceSettings.voiceURI || ''}
                  onChange={(e) => {
                    const uri = e.target.value;
                    jarvisVoice.updateSettings({ voiceURI: uri });
                    setVoiceSettings(jarvisVoice.getSettings());
                  }}
                  className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="">Automática (Recomendada: Español Natural / Argentino)</option>
                  {availableVoices.map((v) => (
                    <option key={v.voiceURI} value={v.voiceURI}>
                      {v.name} ({v.lang})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">
                  Velocidad: {voiceSettings.rate.toFixed(2)}x
                </label>
                <input
                  type="range"
                  min="0.8"
                  max="1.3"
                  step="0.05"
                  value={voiceSettings.rate}
                  onChange={(e) => {
                    const rate = parseFloat(e.target.value);
                    jarvisVoice.updateSettings({ rate });
                    setVoiceSettings(jarvisVoice.getSettings());
                  }}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 pt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={voiceSettings.fullSpeech}
                  onChange={(e) => {
                    const fullSpeech = e.target.checked;
                    jarvisVoice.updateSettings({ fullSpeech });
                    setVoiceSettings(jarvisVoice.getSettings());
                  }}
                  className="accent-cyan-400 rounded"
                />
                <span className="text-[11px]">Lectura completa (desmarcar para respuestas concisas)</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={voiceSettings.soundEffects}
                  onChange={(e) => {
                    const soundEffects = e.target.checked;
                    jarvisVoice.updateSettings({ soundEffects });
                    setVoiceSettings(jarvisVoice.getSettings());
                  }}
                  className="accent-cyan-400 rounded"
                />
                <span className="text-[11px]">Efectos HUD de Tony Stark</span>
              </label>
            </div>
          </div>
        )}

        {/* Center Holographic Orb / Visualizer */}
        <div className="flex-1 p-6 flex flex-col items-center justify-center relative overflow-y-auto">
          {/* Arc Reactor Glowing Sphere */}
          <div className="relative my-4 flex items-center justify-center">
            {/* Outer rings */}
            <div
              className={`absolute w-56 h-56 rounded-full border-2 border-cyan-500/20 transition-all duration-300 ${
                isSpeaking
                  ? 'scale-110 border-cyan-400/40 animate-spin'
                  : isListening
                  ? 'scale-105 border-amber-400/30 animate-pulse'
                  : ''
              }`}
              style={{ animationDuration: '12s' }}
            />
            <div
              className={`absolute w-44 h-44 rounded-full border border-dashed border-cyan-400/30 transition-all duration-300 ${
                isSpeaking
                  ? 'border-cyan-400/70 animate-spin'
                  : isListening
                  ? 'border-emerald-400/50'
                  : ''
              }`}
              style={{ animationDuration: '8s', animationDirection: 'reverse' }}
            />

            {/* Glowing Core */}
            <button
              onClick={isListening ? stopListening : isSpeaking ? () => jarvisVoice.stop() : startListening}
              className={`relative z-10 w-28 h-28 rounded-full flex flex-col items-center justify-center cursor-pointer transition-all duration-300 shadow-2xl ${
                isSpeaking
                  ? 'bg-gradient-to-tr from-cyan-600 to-blue-500 shadow-cyan-500/50 scale-105'
                  : isListening
                  ? 'bg-gradient-to-tr from-amber-500 to-rose-600 shadow-amber-500/50 animate-pulse scale-105'
                  : 'bg-gradient-to-tr from-slate-800 to-slate-700 hover:from-cyan-900 hover:to-slate-800 shadow-cyan-500/20 border border-cyan-500/40'
              }`}
            >
              {isSpeaking ? (
                <>
                  <Square className="w-8 h-8 text-white fill-white mb-1" />
                  <span className="text-[10px] font-bold text-white tracking-wider uppercase">Pausar</span>
                </>
              ) : isListening ? (
                <>
                  <Mic className="w-9 h-9 text-white animate-bounce mb-1" />
                  <span className="text-[10px] font-bold text-white tracking-wider uppercase">Hablá...</span>
                </>
              ) : (
                <>
                  <Mic className="w-8 h-8 text-cyan-300 mb-1" />
                  <span className="text-[10px] font-bold text-cyan-200 tracking-wider uppercase">Tocar p/ Hablar</span>
                </>
              )}
            </button>
          </div>

          {/* Audio Wave Visualizer Bars */}
          <div className="flex items-center justify-center gap-1.5 h-10 my-2">
            {[40, 70, 95, 60, 100, 85, 50, 90, 75, 45, 65, 80].map((h, i) => {
              const animatedHeight = isSpeaking || isListening ? Math.max(12, Math.round(h * pulseLevel)) : 8;
              return (
                <div
                  key={i}
                  className={`w-1.5 rounded-full transition-all duration-150 ${
                    isSpeaking
                      ? 'bg-gradient-to-t from-cyan-500 to-blue-300'
                      : isListening
                      ? 'bg-gradient-to-t from-amber-500 to-emerald-400'
                      : 'bg-slate-700'
                  }`}
                  style={{ height: `${animatedHeight}px` }}
                />
              );
            })}
          </div>

          {/* Transcript / Spoken Box */}
          <div className="w-full max-w-lg mt-3 bg-slate-900/70 border border-slate-800 rounded-xl p-4 text-center">
            {transcript ? (
              <p className="text-sm text-cyan-300 font-medium italic mb-2">
                "{transcript}"
              </p>
            ) : null}

            <p className="text-sm text-slate-200 leading-relaxed font-sans">
              {lastResponse}
            </p>

            {isSpeaking && (
              <div className="mt-3 flex items-center justify-center gap-2 text-xs text-cyan-400 font-mono">
                <Volume2 className="w-4 h-4 animate-pulse" />
                <span>Reproduciendo audio en vivo...</span>
                <button
                  onClick={() => jarvisVoice.stop()}
                  className="ml-2 text-[10px] px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
                >
                  Detener
                </button>
              </div>
            )}
          </div>

          {/* Suggested Quick Triggers */}
          <div className="w-full max-w-lg mt-4">
            <p className="text-[11px] text-slate-500 text-center uppercase tracking-wider mb-2 font-mono">
              Comandos de Voz Rápidos para Fran
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2">
              <button
                onClick={() => handleQuickCommand('¿Cómo vengo hoy? Dame un reporte general de caja y salud')}
                className="text-xs bg-slate-800/80 hover:bg-cyan-950/60 hover:text-cyan-300 border border-slate-700/60 hover:border-cyan-500/50 px-3 py-1.5 rounded-full text-slate-300 transition-colors"
              >
                📊 "¿Cómo vengo hoy?"
              </button>
              <button
                onClick={() => handleQuickCommand('¿Puedo gastar 30 euros hoy sin poner en riesgo la reserva?')}
                className="text-xs bg-slate-800/80 hover:bg-cyan-950/60 hover:text-cyan-300 border border-slate-700/60 hover:border-cyan-500/50 px-3 py-1.5 rounded-full text-slate-300 transition-colors"
              >
                💰 "¿Puedo gastar 30 €?"
              </button>
              <button
                onClick={() => handleQuickCommand('Registrá que fui al gym e hice pecho y tríceps por 50 minutos')}
                className="text-xs bg-slate-800/80 hover:bg-cyan-950/60 hover:text-cyan-300 border border-slate-700/60 hover:border-cyan-500/50 px-3 py-1.5 rounded-full text-slate-300 transition-colors"
              >
                🏋️ "Fui al gym 50 min"
              </button>
              <button
                onClick={() => handleQuickCommand('Dame el resumen estratégico de Creko y Burger Palusa')}
                className="text-xs bg-slate-800/80 hover:bg-cyan-950/60 hover:text-cyan-300 border border-slate-700/60 hover:border-cyan-500/50 px-3 py-1.5 rounded-full text-slate-300 transition-colors"
              >
                🎯 "Resumen Creko y Burger Palusa"
              </button>
            </div>
          </div>
        </div>

        {/* Footer controls */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-900/60 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Cpu className="w-3.5 h-3.5 text-cyan-400" />
            <span>Motor de Voz Web Speech Neural</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                const nextState = !jarvisVoice.isVoiceEnabled();
                jarvisVoice.setVoiceEnabled(nextState);
              }}
              className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5"
            >
              {jarvisVoice.isVoiceEnabled() ? (
                <>
                  <Volume2 className="w-4 h-4 text-cyan-400" />
                  <span>Voz Activada</span>
                </>
              ) : (
                <>
                  <VolumeX className="w-4 h-4 text-rose-400" />
                  <span>Voz Silenciada</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
