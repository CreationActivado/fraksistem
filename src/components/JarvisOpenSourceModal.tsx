import React, { useState, useEffect } from 'react';
import {
  Code,
  Terminal,
  Database,
  Download,
  Copy,
  Check,
  X,
  Play,
  Layers,
  FileJson,
  Cpu,
  RefreshCw,
  Sparkles,
  Server,
  Zap,
} from 'lucide-react';
import { api } from '../services/api';

interface JarvisOpenSourceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRefreshData?: () => void;
}

export const JarvisOpenSourceModal: React.FC<JarvisOpenSourceModalProps> = ({
  isOpen,
  onClose,
  onRefreshData,
}) => {
  const [activeTab, setActiveTab] = useState<'prompt' | 'database' | 'api' | 'architecture'>('prompt');
  const [rawDb, setRawDb] = useState<any>(null);
  const [selectedTable, setSelectedTable] = useState<string>('all');
  const [copied, setCopied] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    loadDatabase();
  }, [isOpen]);

  const loadDatabase = async () => {
    setLoading(true);
    try {
      const data = await api.getBootstrapData('month');
      setRawDb(data);
    } catch (err) {
      console.error('Error loading db:', err);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const downloadBackup = () => {
    if (!rawDb) return;
    const blob = new Blob([JSON.stringify(rawDb, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `jarvis_core_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  const systemPromptOverview = `// SISTEMA ABIERTO DE JARVIS — DIRECTIVAS CENTRALES DE FRAN ALBORNOZ
// Modelo: Gemini 3.8 Flash + Local NLP Fallback Engine
// Código Abierto: Arquitectura 100% auditable y modificable en caliente

DIRECTIVAS PRINCIPALES:
1. Rol: Socio y director de operaciones de Fran Albornoz en Logroño, España.
2. Cero humo, respuestas directas, sin rodeos, tono proactivo y enérgico.
3. Filosofía de Bloques de Tiempo: 1 tarea a la vez con foco total.
4. Segregación estricta de capital: Vivir, Reserva (Meta: 1.000 €), Crecimiento.
5. Permisos de Modificación: JARVIS puede modificar saldos, metas, crear changas,
   registrar salud y guardar recuerdos directamente en vivo cuando Fran se lo pida en el chat.
6. Memoria Persistente: Consulta constante de reglas de usuario y recuerdos aprendidos.`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-slate-950 border border-cyan-500/30 rounded-2xl shadow-2xl shadow-cyan-500/10 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-cyan-500/20 bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/40 text-cyan-400">
              <Code className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base tracking-wide flex items-center gap-2">
                JARVIS CÓDIGO ABIERTO & DEV STUDIO
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  OPEN SOURCE
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Transparencia total: inspeccioná el código fuente, la base de datos abierta y el prompt del sistema
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={downloadBackup}
              className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors"
              title="Descargar copia de seguridad en JSON"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Exportar JSON</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-800 px-6 bg-slate-900/40">
          <button
            onClick={() => setActiveTab('prompt')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'prompt'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Terminal className="w-4 h-4" />
            Prompt del Sistema Abierto
          </button>
          <button
            onClick={() => setActiveTab('database')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'database'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Database className="w-4 h-4" />
            Base de Datos en Vivo (JSON)
          </button>
          <button
            onClick={() => setActiveTab('api')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'api'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Server className="w-4 h-4" />
            Endpoints de la API
          </button>
          <button
            onClick={() => setActiveTab('architecture')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'architecture'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-4 h-4" />
            Arquitectura del Sistema
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* TAB 1: SYSTEM PROMPT */}
          {activeTab === 'prompt' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-400">
                  Instrucciones directas con las que el modelo de IA procesa cada mensaje tuyo:
                </p>
                <button
                  onClick={() => copyToClipboard(systemPromptOverview, 'prompt')}
                  className="text-xs text-cyan-300 hover:text-white bg-cyan-950/60 border border-cyan-700/50 px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors"
                >
                  {copied === 'prompt' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied === 'prompt' ? 'Copiado' : 'Copiar Prompt'}</span>
                </button>
              </div>

              <div className="relative">
                <pre className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-cyan-200/90 leading-relaxed overflow-x-auto whitespace-pre-wrap">
                  {systemPromptOverview}
                </pre>
              </div>

              <div className="p-4 rounded-xl bg-cyan-950/30 border border-cyan-500/30 text-xs text-cyan-200 space-y-2">
                <p className="font-semibold flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-400" /> Modificaciones desde el Chat
                </p>
                <p>
                  Cuando le decís en el chat cosas como:
                  <br />• <em>"Cambiá mi efectivo a 200 euros"</em>
                  <br />• <em>"Creá una changa de rotulación para Lucas de 300 euros"</em>
                  <br />• <em>"Registrá que hoy caminé 9000 pasos"</em>
                  <br />• <em>"Recordá que los presupuestos grandes de Creko los reviso con Thiago"</em>
                  <br />
                  JARVIS ejecuta la modificación en la base de datos abierta y te notifica con la tarjeta de confirmación en tiempo real.
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: LIVE DATABASE INSPECTOR */}
          {activeTab === 'database' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">Tabla:</span>
                  <select
                    value={selectedTable}
                    onChange={(e) => setSelectedTable(e.target.value)}
                    className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="all">Todas las tablas (JSON Completo)</option>
                    <option value="user">Usuario & Finanzas (user)</option>
                    <option value="accounts">Cuentas (accounts)</option>
                    <option value="changas">Changas (changas)</option>
                    <option value="tasks">Tareas (tasks)</option>
                    <option value="timeBlocks">Bloques de Tiempo (timeBlocks)</option>
                    <option value="health">Salud & Pasos (health)</option>
                    <option value="memory">Memoria Central (memory)</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={loadDatabase}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                    title="Recargar datos"
                  >
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                  </button>
                  <button
                    onClick={() => {
                      const data = selectedTable === 'all' ? rawDb : rawDb?.[selectedTable] || rawDb;
                      copyToClipboard(JSON.stringify(data, null, 2), 'raw_db');
                    }}
                    className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3 py-1.5 rounded-lg flex items-center gap-1.5"
                  >
                    {copied === 'raw_db' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied === 'raw_db' ? 'Copiado' : 'Copiar Tabla'}</span>
                  </button>
                </div>
              </div>

              <div className="relative">
                <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-emerald-400/90 leading-relaxed overflow-x-auto max-h-[50vh]">
                  {loading
                    ? '// Cargando base de datos en tiempo real...'
                    : JSON.stringify(
                        selectedTable === 'all'
                          ? rawDb
                          : rawDb?.[selectedTable] !== undefined
                          ? rawDb[selectedTable]
                          : rawDb,
                        null,
                        2
                      )}
                </pre>
              </div>
            </div>
          )}

          {/* TAB 3: API ENDPOINTS */}
          {activeTab === 'api' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-400">
                Endpoints REST de código abierto que podés consultar o integrar desde cualquier script o atajo de iPhone:
              </p>

              <div className="space-y-3">
                <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-mono font-bold text-cyan-400">POST /api/chat</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300">IA & Acciones</span>
                  </div>
                  <p className="text-xs text-slate-300 mb-2">
                    Envía un mensaje a JARVIS. Si incluye una orden de modificación ("cambiá efectivo a 150"), la ejecuta directamente.
                  </p>
                  <pre className="p-2 rounded bg-slate-950 text-[10px] font-mono text-slate-400">
                    curl -X POST http://localhost:3000/api/chat -H "Content-Type: application/json" -d '&#123;"message":"¿Cómo vengo hoy?"&#125;'
                  </pre>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-mono font-bold text-emerald-400">POST /api/healthkit/sync</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300">Salud & iPhone</span>
                  </div>
                  <p className="text-xs text-slate-300 mb-2">
                    Sincroniza pasos reales, kilómetros y calorías desde Apple Health o Atajos de iPhone.
                  </p>
                  <pre className="p-2 rounded bg-slate-950 text-[10px] font-mono text-slate-400">
                    curl -X POST http://localhost:3000/api/healthkit/sync -H "Content-Type: application/json" -d '&#123;"steps":8500,"walkingRunningDistanceKm":6.4&#125;'
                  </pre>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-mono font-bold text-amber-400">POST /api/changas</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950 text-amber-300">Trabajos & Cobros</span>
                  </div>
                  <p className="text-xs text-slate-300 mb-2">
                    Crea un trabajo puntual o changa con cliente, monto y estado.
                  </p>
                  <pre className="p-2 rounded bg-slate-950 text-[10px] font-mono text-slate-400">
                    curl -X POST http://localhost:3000/api/changas -H "Content-Type: application/json" -d '&#123;"title":"Rotulación Bar","clientName":"Lucas","amount":250&#125;'
                  </pre>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: ARCHITECTURE */}
          {activeTab === 'architecture' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="p-4 rounded-xl bg-slate-900 border border-cyan-500/30">
                  <Cpu className="w-6 h-6 text-cyan-400 mb-2" />
                  <h4 className="font-bold text-white text-xs mb-1">Motor de Inteligencia</h4>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Gemini 3.8 Flash con tool-calling server-side + motor de reglas NLP local para respuestas sin latencia.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-900 border border-purple-500/30">
                  <Zap className="w-6 h-6 text-purple-400 mb-2" />
                  <h4 className="font-bold text-white text-xs mb-1">Voz Neural en Vivo</h4>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Web Speech Synthesis con soporte para dialectos argentinos y españoles + reconocimiento por micrófono manos libres.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-900 border border-emerald-500/30">
                  <Database className="w-6 h-6 text-emerald-400 mb-2" />
                  <h4 className="font-bold text-white text-xs mb-1">Cerebro Único Sincronizado</h4>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    SSE (Server-Sent Events) en tiempo real entre la Computadora de Fran y el iPhone con HealthKit y NFC.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300">
                <span className="font-bold text-white">Estructura del Proyecto:</span>
                <ul className="mt-2 space-y-1 font-mono text-[11px] text-slate-400">
                  <li>• <strong className="text-cyan-300">server.ts</strong>: Servidor Node/Express con API REST y SSE.</li>
                  <li>• <strong className="text-cyan-300">server/ai.ts</strong>: Orquestador de IA, prompts y herramientas ejecutables.</li>
                  <li>• <strong className="text-cyan-300">server/db.ts</strong>: Base de datos JSON de finanzas, changas, salud y memoria.</li>
                  <li>• <strong className="text-cyan-300">src/utils/jarvisVoice.ts</strong>: Motor de voz neural y efectos de sonido HUD.</li>
                  <li>• <strong className="text-cyan-300">src/components/ChatView.tsx</strong>: Chat interactivo con audio y tarjetas de modificación.</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
