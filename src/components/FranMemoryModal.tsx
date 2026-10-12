import React, { useState, useEffect } from 'react';
import {
  Brain,
  X,
  Sparkles,
  Plus,
  Trash2,
  CheckCircle2,
  BookOpen,
  Target,
  Dumbbell,
  ShieldCheck,
  MapPin,
  Flame,
  Zap,
  Tag,
  Clock,
  Edit2,
  Save,
  Lightbulb,
} from 'lucide-react';
import { UserMemory } from '../types';
import { api } from '../services/api';

interface FranMemoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRefreshData?: () => void;
}

export const FranMemoryModal: React.FC<FranMemoryModalProps> = ({
  isOpen,
  onClose,
  onRefreshData,
}) => {
  const [memories, setMemories] = useState<UserMemory[]>([]);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'memories' | 'dossier' | 'add'>('memories');

  // New memory form
  const [newKey, setNewKey] = useState('');
  const [newValue, setNewValue] = useState('');
  const [newType, setNewType] = useState<'preference' | 'category_rule' | 'project_rule'>('preference');
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    loadData();
  }, [isOpen]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [memRes, profRes] = await Promise.all([
        api.getMemory(),
        api.getProfile(),
      ]);
      setMemories(memRes);
      setUserProfile(profRes);
    } catch (err) {
      console.error('Error loading memory:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMemory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKey.trim() || !newValue.trim() || saving) return;
    setSaving(true);
    try {
      await api.createMemory({
        type: newType,
        priority: 'user_preference',
        classification: 'user_preference',
        key: newKey.trim(),
        value: newValue.trim(),
        description: `Recuerdo agregado manualmente por Fran: "${newValue.trim()}"`,
      });

      setNewKey('');
      setNewValue('');
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      loadData();
      if (onRefreshData) onRefreshData();
    } catch (err) {
      console.error('Error saving memory:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteMemory = async (id: string) => {
    if (!confirm('¿Eliminar este recuerdo de la memoria de JARVIS?')) return;
    try {
      await api.deleteMemory(id);
      setMemories((prev) => prev.filter((m) => m.id !== id));
      if (onRefreshData) onRefreshData();
    } catch (err) {
      console.error('Error deleting memory:', err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-slate-950 border border-purple-500/30 rounded-2xl shadow-2xl shadow-purple-500/10 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-purple-500/20 bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/40 text-purple-400">
              <Brain className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base tracking-wide flex items-center gap-2">
                CEREBRO & MEMORIA DE FRAN
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  100% PERSONALIZADO
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Todo lo que JARVIS sabe sobre tu identidad, proyectos, finanzas y hábitos
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800 px-6 bg-slate-900/40">
          <button
            onClick={() => setActiveTab('memories')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'memories'
                ? 'border-purple-400 text-purple-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            Banco de Recuerdos ({memories.length})
          </button>
          <button
            onClick={() => setActiveTab('dossier')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'dossier'
                ? 'border-purple-400 text-purple-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            Dossier & Identidad de Fran
          </button>
          <button
            onClick={() => setActiveTab('add')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'add'
                ? 'border-purple-400 text-purple-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Plus className="w-4 h-4" />
            Enseñar Nuevo Recuerdo
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB 1: MEMORIES LIST */}
          {activeTab === 'memories' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-400">
                  Reglas y recuerdos activos que JARVIS consulta en cada interacción con vos:
                </p>
                <button
                  onClick={() => setActiveTab('add')}
                  className="text-xs font-semibold text-purple-300 hover:text-white bg-purple-950/60 border border-purple-700/50 px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" /> Agregar Recuerdo
                </button>
              </div>

              {loading ? (
                <div className="py-12 text-center text-xs text-slate-500">Cargando memoria neural...</div>
              ) : memories.length === 0 ? (
                <div className="py-12 text-center text-slate-500 text-xs">
                  Aún no hay recuerdos guardados. Podés agregar uno en la pestaña "Enseñar Nuevo Recuerdo".
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {memories.map((m) => (
                    <div
                      key={m.id}
                      className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-purple-500/40 transition-all flex flex-col justify-between group"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xs font-bold text-purple-300 uppercase tracking-wide">
                            {m.key}
                          </span>
                          <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                            {m.type === 'category_rule'
                              ? 'Categoría'
                              : m.type === 'project_rule'
                              ? 'Proyecto'
                              : 'Preferencia'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-200 leading-relaxed font-sans">
                          {m.value}
                        </p>
                        {m.description && m.description !== m.value && (
                          <p className="text-[11px] text-slate-500 mt-1 italic">
                            {m.description}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center justify-between pt-2.5 mt-2 border-t border-slate-800/80 text-[11px] text-slate-500">
                        <span>Usado {m.usageCount || 1} veces</span>
                        <button
                          onClick={() => handleDeleteMemory(m.id)}
                          className="opacity-0 group-hover:opacity-100 text-rose-400 hover:text-rose-300 p-1 rounded transition-opacity"
                          title="Eliminar recuerdo"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: DOSSIER DE FRAN */}
          {activeTab === 'dossier' && (
            <div className="space-y-6">
              {/* Profile Card */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-purple-950/40 to-slate-900 border border-purple-500/30 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-purple-500/20 border border-purple-400 flex items-center justify-center text-purple-300 font-bold text-lg">
                    FA
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-base">Francisco "Fran" Albornoz</h4>
                    <p className="text-xs text-purple-300 flex items-center gap-1.5">
                      <MapPin className="w-3 h-3 text-rose-400" />
                      España / Logroño, La Rioja (Origen: Argentina)
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Estabilidad + Crecimiento
                  </span>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Meta Reserva: {userProfile?.monthlyReserveTarget || 1000} €
                  </p>
                </div>
              </div>

              {/* 8 Projects */}
              <div>
                <h5 className="text-xs font-bold text-purple-300 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                  <Target className="w-4 h-4" /> Los 8 Proyectos de Fran
                </h5>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                  <div className="p-2.5 rounded-lg bg-slate-900 border border-purple-500/30">
                    <span className="font-bold text-purple-300">1. Creko (Prioridad Alta)</span>
                    <p className="text-[11px] text-slate-400">Rotulación, vinilos y cartelería con Thiago.</p>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-900 border border-sky-500/30">
                    <span className="font-bold text-sky-300">2. Rotuprint (Trámite)</span>
                    <p className="text-[11px] text-slate-400">Precontrato y regularización laboral en España.</p>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-900 border border-orange-500/30">
                    <span className="font-bold text-orange-300">3. Burger Palusa (Creativo)</span>
                    <p className="text-[11px] text-slate-400">Indumentaria y piezas gráficas (300$ pendientes).</p>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-900 border border-emerald-500/30">
                    <span className="font-bold text-emerald-300">4. CTC (En desarrollo)</span>
                    <p className="text-[11px] text-slate-400">Cerebro digital con Tomás de Luna.</p>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-900 border border-blue-500/30">
                    <span className="font-bold text-blue-300">5. Software & Sowfts</span>
                    <p className="text-[11px] text-slate-400">Desarrollo web y apps monetizables para clientes.</p>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-900 border border-amber-500/30">
                    <span className="font-bold text-amber-300">6. Suite Solutions</span>
                    <p className="text-[11px] text-slate-400">Oportunidad con Juanchi Frías (Hoteles y aptos).</p>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-700">
                    <span className="font-bold text-slate-300">7. Ciudad Gráfica</span>
                    <p className="text-[11px] text-slate-400">Histórico de confección y DTF.</p>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-700">
                    <span className="font-bold text-slate-400">8. Goloso (En espera)</span>
                    <p className="text-[11px] text-slate-500">Pausado para evitar dispersión.</p>
                  </div>
                </div>
              </div>

              {/* Health & Habits */}
              <div>
                <h5 className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                  <Dumbbell className="w-4 h-4" /> Rutinas de Salud & Deporte
                </h5>
                <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300 space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span><strong>Gimnasio & Fuerza:</strong> Entrenar disciplina y físico de forma consistente.</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span><strong>Skate & Running:</strong> Actividad aeróbica y despeje mental al aire libre.</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span><strong>10.000 Pasos Diarios:</strong> Meta de movimiento activo conectada con iPhone HealthKit.</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span><strong>Salud Mental & Hábitos:</strong> Sueño reparador, buena hidratación y regular weed.</span>
                  </div>
                </div>
              </div>

              {/* Operating Philosophy */}
              <div>
                <h5 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" /> Filosofía Operativa de JARVIS
                </h5>
                <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300 space-y-1.5 font-mono">
                  <p>• Ser directo, respuestas cortas y al hueso.</p>
                  <p>• Cero humo: actuar como socio y director estratégico.</p>
                  <p>• Cuidar el dinero: Primero estabilizar ➔ Después generar ➔ Después construir ➔ Después crecer.</p>
                  <p>• Filosofía de Bloques de Tiempo: una sola cosa a la vez.</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: ADD NEW MEMORY */}
          {activeTab === 'add' && (
            <div className="max-w-xl mx-auto space-y-4">
              <div className="p-4 rounded-xl bg-purple-950/30 border border-purple-500/30 flex items-start gap-3">
                <Lightbulb className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
                <p className="text-xs text-purple-200 leading-relaxed">
                  Cualquier dato o preferencia que le enseñes a JARVIS aquí quedará grabado de forma permanente en su memoria central y se usará para personalizar respuestas, cálculos y alertas.
                </p>
              </div>

              <form onSubmit={handleAddMemory} className="space-y-4 bg-slate-900/80 p-5 rounded-xl border border-slate-800">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Tipo de Recuerdo:
                  </label>
                  <select
                    value={newType}
                    onChange={(e: any) => setNewType(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="preference">Preferencia Personal / Hábito / Rutina</option>
                    <option value="project_rule">Regla de Proyecto (Creko, Burger Palusa, etc.)</option>
                    <option value="category_rule">Regla de Categoría / Finanzas</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Clave / Concepto Breve:
                  </label>
                  <input
                    type="text"
                    value={newKey}
                    onChange={(e) => setNewKey(e.target.value)}
                    placeholder="Ej: horario_cafe, gym_rutina, cliente_lucas..."
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Lo que JARVIS debe saber y recordar:
                  </label>
                  <textarea
                    value={newValue}
                    onChange={(e) => setNewValue(e.target.value)}
                    rows={4}
                    placeholder="Ej: A las 8am me tomo un café doble antes de entrenar en el gym. Los presupuestos de más de 300 euros de Creko los reviso siempre con Thiago..."
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                    required
                  />
                </div>

                {saveSuccess && (
                  <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-950/40 p-2.5 rounded-lg border border-emerald-800">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>¡Recuerdo guardado con éxito en la memoria central!</span>
                  </div>
                )}

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab('memories')}
                    className="px-4 py-2 rounded-lg text-xs text-slate-400 hover:text-white"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-5 py-2 rounded-lg text-xs font-semibold bg-purple-600 hover:bg-purple-500 text-white flex items-center gap-2 shadow-lg shadow-purple-600/20 disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    {saving ? 'Guardando...' : 'Guardar Recuerdo en JARVIS'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
