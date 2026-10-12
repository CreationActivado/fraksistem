import React, { useState } from 'react';
import {
  Sliders,
  X,
  Check,
  Layout,
  Bell,
  DollarSign,
  Shield,
  Layers,
  Sparkles,
} from 'lucide-react';
import { JarvisSettings } from '../types';
import { api } from '../services/api';

interface DesignerSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: JarvisSettings;
  onSettingsUpdated: (newSettings: JarvisSettings) => void;
}

export const DesignerSettingsModal: React.FC<DesignerSettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSettingsUpdated,
}) => {
  const [intensity, setIntensity] = useState(settings.intensity);
  const [highExpenseThreshold, setHighExpenseThreshold] = useState(
    settings.highExpenseConfirmationThreshold
  );
  const [activeModules, setActiveModules] = useState<string[]>(settings.activeModules);
  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  const toggleModule = (id: string) => {
    setActiveModules((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
    );
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const updated = await api.updateJarvisSettings({
        intensity,
        highExpenseThreshold: Number(highExpenseThreshold),
        activeModules,
      });
      onSettingsUpdated(updated);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const allModulesList = [
    { id: 'finances', label: 'Finanzas & Cuentas', desc: 'Saldos, ingresos y gastos' },
    { id: 'postits', label: 'Tablero Post-its & Tacho', desc: 'Notas visuales y papelera' },
    { id: 'tasks', label: 'Tareas & Prioridades', desc: 'Acciones diarias y urgencias' },
    { id: 'creko', label: 'Creko OS (CRM & Presupuestos)', desc: 'Motor comercial y Maps' },
    { id: 'spain_process', label: 'Trámites España', desc: 'Rotuprint y regularización' },
    { id: 'habits', label: 'Hábitos & Bienestar', desc: 'Rachas y check-in personal' },
    { id: 'missions', label: 'Misiones Estratégicas', desc: 'Objetivos mensuales' },
    { id: 'agenda', label: 'Agenda Unificada', desc: 'Calendario consolidado' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#1E293B] border border-slate-700/80 rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-800 flex items-center justify-between sticky top-0 bg-[#1E293B] z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                Modo Diseñador: Personalizar JARVIS
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-semibold border border-blue-500/30">
                  Custom OS
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Adaptá los módulos del panel y la intensidad del asistente a tu día a día
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 space-y-6">
          {/* Intensity selector */}
          <div>
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-2.5 flex items-center gap-1.5">
              <Bell className="w-4 h-4 text-amber-400" /> Nivel de Proactividad del Asistente:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {[
                {
                  id: 'silent',
                  title: 'Silencioso',
                  desc: 'Solo responde cuando le preguntás directamente.',
                },
                {
                  id: 'normal',
                  title: 'Equilibrado',
                  desc: 'Propone acciones y confirma decisiones clave.',
                },
                {
                  id: 'proactive',
                  title: 'Proactivo',
                  desc: 'Avisa de cobros, presupuestos fríos y hábitos.',
                },
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setIntensity(opt.id as any)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    intensity === opt.id
                      ? 'bg-blue-950/40 border-blue-500/60 text-white shadow-sm'
                      : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span className="text-xs font-bold block text-white mb-1">{opt.title}</span>
                  <p className="text-[11px] text-slate-400 leading-snug">{opt.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Active Modules Toggle */}
          <div>
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-2.5 flex items-center gap-1.5">
              <Layout className="w-4 h-4 text-indigo-400" /> Módulos Activos en el Dashboard:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {allModulesList.map((mod) => {
                const isActive = activeModules.includes(mod.id);
                return (
                  <button
                    key={mod.id}
                    type="button"
                    onClick={() => toggleModule(mod.id)}
                    className={`p-3 rounded-xl border text-left transition-all flex items-start justify-between gap-2 ${
                      isActive
                        ? 'bg-blue-950/30 border-blue-500/50 text-white'
                        : 'bg-slate-900/40 border-slate-800 text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    <div>
                      <span className="text-xs font-bold block">{mod.label}</span>
                      <span className="text-[11px] text-slate-400 block mt-0.5">{mod.desc}</span>
                    </div>
                    <div
                      className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 mt-0.5 ${
                        isActive
                          ? 'bg-blue-600 border-blue-500 text-white'
                          : 'border-slate-700 bg-slate-800'
                      }`}
                    >
                      {isActive && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* High Expense Threshold */}
          <div>
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-1 flex items-center gap-1.5">
              <DollarSign className="w-4 h-4 text-emerald-400" /> Umbral de Confirmación para Gastos Altos (€):
            </label>
            <p className="text-xs text-slate-400 mb-2">
              Si registrás un gasto mayor a este monto, JARVIS te recordará verificar el impacto en tu Reserva.
            </p>
            <div className="flex items-center gap-3">
              <input
                type="number"
                min="10"
                step="5"
                value={highExpenseThreshold}
                onChange={(e) => setHighExpenseThreshold(Number(e.target.value))}
                className="w-32 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-blue-500"
              />
              <span className="text-xs text-slate-400">Euros</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-800 bg-slate-900/50 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-md disabled:opacity-50"
          >
            {saving ? 'Guardando...' : 'Aplicar Configuración'}
          </button>
        </div>
      </div>
    </div>
  );
};
