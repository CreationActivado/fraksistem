import React, { useState, useEffect } from 'react';
import {
  Play,
  Square,
  RefreshCw,
  Plus,
  Clock,
  CheckCircle2,
  Calendar,
  Radio,
  Sparkles,
  ChevronDown,
  X,
  Zap,
  Filter,
} from 'lucide-react';
import { CurrentActivity, TimelineEntry, ActivityCategory } from '../types';
import { activityService, ACTIVITY_PRESETS, ActivityPreset } from '../services/activityService';

interface ActivityControlCardProps {
  onRefreshParent?: () => void;
  onNavigate?: (view: string) => void;
}

export const ActivityControlCard: React.FC<ActivityControlCardProps> = ({
  onRefreshParent,
  onNavigate,
}) => {
  const [currentActivity, setCurrentActivity] = useState<CurrentActivity | null>(null);
  const [timeline, setTimeline] = useState<TimelineEntry[]>([]);
  const [timelinePeriod, setTimelinePeriod] = useState<'today' | 'week' | 'month'>('today');
  const [elapsedMinutes, setElapsedMinutes] = useState<number>(42);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isManualEntryOpen, setIsManualEntryOpen] = useState(false);

  // Custom activity input state
  const [customTitle, setCustomTitle] = useState('');
  const [customCategory, setCustomCategory] = useState<ActivityCategory>('creko');
  const [customNotes, setCustomNotes] = useState('');
  const [customClient, setCustomClient] = useState('');

  // Manual milestone state
  const [manualTime, setManualTime] = useState('');
  const [manualTitle, setManualTitle] = useState('');
  const [manualCategory, setManualCategory] = useState<ActivityCategory>('creko');
  const [manualDuration, setManualDuration] = useState('');

  // Fetch initial activity & timeline
  const loadActivityData = async () => {
    try {
      const data = await activityService.getTimeline(timelinePeriod);
      setCurrentActivity(data.currentActivity);
      setTimeline(data.timeline);

      if (data.currentActivity && data.currentActivity.startTimestamp) {
        const diff = Math.max(1, Math.round((Date.now() - data.currentActivity.startTimestamp) / 60000));
        setElapsedMinutes(diff);
      }
    } catch (err) {
      console.error('Error loading activity data:', err);
    }
  };

  useEffect(() => {
    loadActivityData();
  }, [timelinePeriod]);

  // Live timer tick every 10 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      if (currentActivity && currentActivity.isActive && currentActivity.startTimestamp) {
        const diff = Math.max(1, Math.round((Date.now() - currentActivity.startTimestamp) / 60000));
        setElapsedMinutes(diff);
      }
    }, 10000);
    return () => clearInterval(timer);
  }, [currentActivity]);

  const handleStartPreset = async (preset: ActivityPreset) => {
    try {
      const started = await activityService.startActivity({
        title: preset.title,
        category: preset.category,
        categoryLabel: preset.categoryLabel,
        categoryColor: preset.categoryColor,
        icon: preset.icon,
        notes: preset.defaultNotes || '',
      });
      setCurrentActivity(started);
      setElapsedMinutes(1);
      setIsModalOpen(false);
      loadActivityData();
      if (onRefreshParent) onRefreshParent();
    } catch (err) {
      console.error('Error starting preset:', err);
    }
  };

  const handleStartCustom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTitle.trim()) return;

    const categoryIcons: Record<ActivityCategory, string> = {
      creko: '🟣',
      burger_palusa: '🍔',
      trabajo: '💰',
      cuerpo: '🏃',
      vida: '🍝',
      ideas: '💡',
      finanzas: '📈',
    };

    try {
      const started = await activityService.startActivity({
        title: customTitle.trim(),
        category: customCategory,
        categoryLabel: customCategory.toUpperCase(),
        categoryColor: '#3b82f6',
        icon: categoryIcons[customCategory] || '🎯',
        notes: customNotes.trim(),
        client: customClient.trim(),
      });
      setCurrentActivity(started);
      setElapsedMinutes(1);
      setCustomTitle('');
      setCustomNotes('');
      setCustomClient('');
      setIsModalOpen(false);
      loadActivityData();
      if (onRefreshParent) onRefreshParent();
    } catch (err) {
      console.error('Error starting custom activity:', err);
    }
  };

  const handleFinishCurrent = async () => {
    try {
      await activityService.finishActivity();
      loadActivityData();
      if (onRefreshParent) onRefreshParent();
    } catch (err) {
      console.error('Error finishing activity:', err);
    }
  };

  const handleAddManualMilestone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualTitle.trim()) return;

    try {
      await activityService.addTimelineEntry({
        time: manualTime || undefined,
        title: manualTitle.trim(),
        category: manualCategory,
        duration: manualDuration.trim() || undefined,
        icon: '✓',
      });
      setIsManualEntryOpen(false);
      setManualTitle('');
      setManualDuration('');
      loadActivityData();
    } catch (err) {
      console.error('Error adding milestone:', err);
    }
  };

  const hours = Math.floor(elapsedMinutes / 60);
  const mins = elapsedMinutes % 60;
  const durationText = hours > 0 ? `${hours}h ${mins} min` : `${mins} min`;

  return (
    <div className="space-y-4">
      {/* 1. ACTIVIDAD ACTUAL (AHORA) */}
      <div className="bg-[#1E293B] rounded-2xl p-5 border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-400 animate-ping"></span>
              <span className="text-[11px] font-black uppercase tracking-wider text-purple-400">
                AHORA MISMO
              </span>
              <span className="text-xs text-slate-500 font-mono">
                · Inicio: {currentActivity?.startTime || '09:12'}
              </span>
            </div>

            <div className="flex items-center gap-2.5 pt-1">
              <span className="text-2xl sm:text-3xl shrink-0">
                {currentActivity?.icon || '🟣'}
              </span>
              <div>
                <h3 className="text-lg sm:text-xl font-black text-white tracking-tight leading-tight">
                  {currentActivity?.title || 'Creko — Captación de clientes'}
                </h3>
                {currentActivity?.notes && (
                  <p className="text-xs text-slate-300 mt-0.5 line-clamp-1">
                    {currentActivity.notes}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Duración y Botones de Acción */}
          <div className="flex items-center gap-3 self-start sm:self-center shrink-0">
            {/* Stopwatch Badge */}
            <div className="bg-slate-900/90 border border-slate-700/80 px-3 py-2 rounded-xl text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400 block leading-tight">
                Duración
              </span>
              <span className="text-sm sm:text-base font-extrabold text-purple-300 font-mono">
                {durationText}
              </span>
            </div>

            {/* Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsModalOpen(true)}
                className="px-3.5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md shadow-purple-600/20 transition-all active:scale-95 flex items-center gap-1.5"
                id="btn-activity-change"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Cambiar actividad
              </button>

              <button
                onClick={handleFinishCurrent}
                className="px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-bold text-xs border border-slate-700 transition-all active:scale-95 flex items-center gap-1.5"
                id="btn-activity-finish"
                title="Finalizar actividad y registrar en la línea de tiempo"
              >
                <Square className="w-3 h-3 text-rose-400" /> Finalizar
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 2. LÍNEA DE TIEMPO AUTOMÁTICA (HOY / ESTA SEMANA / ESTE MES) */}
      <div className="bg-[#1E293B] rounded-2xl p-5 border border-slate-800 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-purple-400" /> Línea de Tiempo Automática
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              JARVIS registra dónde se fue tu tiempo durante el día sin que tengas que pensarlo.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Period Selector Tabs */}
            <div className="bg-slate-900 p-1 rounded-xl flex items-center gap-1 border border-slate-800 text-xs">
              <button
                onClick={() => setTimelinePeriod('today')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                  timelinePeriod === 'today'
                    ? 'bg-purple-600 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Hoy
              </button>
              <button
                onClick={() => setTimelinePeriod('week')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                  timelinePeriod === 'week'
                    ? 'bg-purple-600 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Esta semana
              </button>
              <button
                onClick={() => setTimelinePeriod('month')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                  timelinePeriod === 'month'
                    ? 'bg-purple-600 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Este mes
              </button>
            </div>

            <button
              onClick={() => setIsManualEntryOpen(true)}
              className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
              title="Anotar hito o changa manual"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Timeline Items Stream */}
        <div className="relative pl-6 space-y-3.5 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
          {timeline.slice(0, 8).map((item) => (
            <div key={item.id} className="relative flex items-start justify-between gap-3 text-xs group">
              {/* Dot */}
              <div className="absolute -left-6 top-1 w-5 h-5 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center text-[10px] shadow-sm">
                <span>{item.icon}</span>
              </div>

              {/* Content */}
              <div className="flex-1 pl-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-purple-400 font-bold text-[11px]">
                    {item.time}
                  </span>
                  <span className="font-bold text-white group-hover:text-purple-300 transition-colors">
                    {item.title}
                  </span>
                  {item.client && (
                    <span className="text-[10px] text-slate-400 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
                      {item.client}
                    </span>
                  )}
                </div>
                {item.notes && (
                  <p className="text-[11px] text-slate-400 mt-0.5">{item.notes}</p>
                )}
              </div>

              {/* Duration Tag */}
              {item.duration && (
                <span className="text-[10px] font-mono font-bold text-slate-400 bg-slate-900/80 px-2 py-0.5 rounded border border-slate-800 shrink-0">
                  {item.duration}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 3. MODAL: CAMBIAR ACTIVIDAD (PRESETS + CUSTOM) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-fade-in">
          <div className="bg-[#0F172A] border border-slate-700/80 rounded-2xl max-w-lg w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-400" /> ¿Qué estás haciendo ahora?
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Elegí un preset rápido o escribí tu actividad actual.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Presets Grid */}
            <div className="overflow-y-auto p-4 space-y-4 text-xs">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-2">
                  ACCESOS RÁPIDOS & NFC FÍSICOS
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {ACTIVITY_PRESETS.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => handleStartPreset(p)}
                      className="p-3 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-purple-500/50 text-left transition-all group flex flex-col justify-between"
                    >
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="text-lg">{p.icon}</span>
                        {p.nfcTag && (
                          <span className="text-[9px] font-bold text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700">
                            {p.nfcTag}
                          </span>
                        )}
                      </div>
                      <span className="font-bold text-white group-hover:text-purple-300 transition-colors">
                        {p.title}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Input */}
              <div className="pt-3 border-t border-slate-800">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-2">
                  ACTIVIDAD PERSONALIZADA
                </span>
                <form onSubmit={handleStartCustom} className="space-y-3">
                  <div>
                    <input
                      type="text"
                      value={customTitle}
                      onChange={(e) => setCustomTitle(e.target.value)}
                      placeholder="Ej. Changa electricidad, correr por el parque, reunión..."
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <select
                      value={customCategory}
                      onChange={(e) => setCustomCategory(e.target.value as any)}
                      className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                    >
                      <option value="creko">Creko</option>
                      <option value="burger_palusa">Burger Palusa</option>
                      <option value="trabajo">Trabajo / Changas</option>
                      <option value="cuerpo">Cuerpo / Deporte</option>
                      <option value="vida">Vida / Pausa</option>
                      <option value="ideas">Ideas</option>
                    </select>

                    <input
                      type="text"
                      value={customClient}
                      onChange={(e) => setCustomClient(e.target.value)}
                      placeholder="Cliente o lugar (opcional)"
                      className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={!customTitle.trim()}
                    className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white font-bold text-xs transition-all shadow-md shadow-purple-600/20"
                  >
                    Iniciar Actividad
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. MODAL: AGREGAR HITO MANUAL EN LA LÍNEA DE TIEMPO */}
      {isManualEntryOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 animate-fade-in">
          <div className="bg-[#0F172A] border border-slate-700/80 rounded-2xl max-w-sm w-full p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-white">Anotar Hito en Timeline</h4>
              <button
                onClick={() => setIsManualEntryOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddManualMilestone} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 text-[10px] block mb-1">Título de la actividad</label>
                <input
                  type="text"
                  value={manualTitle}
                  onChange={(e) => setManualTitle(e.target.value)}
                  placeholder="Ej. Cobro de changa, llamada con cliente..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white placeholder:text-slate-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-400 text-[10px] block mb-1">Hora (ej. 14:30)</label>
                  <input
                    type="text"
                    value={manualTime}
                    onChange={(e) => setManualTime(e.target.value)}
                    placeholder="Hora actual"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>

                <div>
                  <label className="text-slate-400 text-[10px] block mb-1">Duración (ej. 45 min)</label>
                  <input
                    type="text"
                    value={manualDuration}
                    onChange={(e) => setManualDuration(e.target.value)}
                    placeholder="45 min"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-purple-600 text-white font-bold"
              >
                Guardar en Timeline
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
