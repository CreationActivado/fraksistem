import React, { useState, useEffect } from 'react';
import {
  Clock,
  Plus,
  Sparkles,
  CheckCircle2,
  Calendar as CalendarIcon,
  Trash2,
  Play,
  RotateCcw,
  Check,
  ChevronRight,
  ExternalLink,
  Download,
  AlertCircle,
  FileText,
  Target,
  ArrowRight,
  CheckSquare,
  Square,
  MoreVertical,
} from 'lucide-react';
import { TimeBlock, TimeBlockArea, TimeBlockStatus } from '../types';
import { api } from '../services/api';

export const AREA_CONFIG: Record<
  TimeBlockArea,
  { label: string; dot: string; color: string; bg: string; border: string; text: string; badgeBg: string }
> = {
  creko: {
    label: 'CREKO',
    dot: '🟣',
    color: '#a855f7',
    bg: 'bg-purple-950/30',
    border: 'border-purple-500/40',
    text: 'text-purple-300',
    badgeBg: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  },
  producto: {
    label: 'PRODUCTO',
    dot: '🟠',
    color: '#f97316',
    bg: 'bg-orange-950/30',
    border: 'border-orange-500/40',
    text: 'text-orange-300',
    badgeBg: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
  },
  empleo: {
    label: 'EMPLEO',
    dot: '🔵',
    color: '#38bdf8',
    bg: 'bg-sky-950/30',
    border: 'border-sky-500/40',
    text: 'text-sky-300',
    badgeBg: 'bg-sky-500/20 text-sky-300 border-sky-500/30',
  },
  changa: {
    label: 'TRABAJOS / CHANGAS',
    dot: '🔴',
    color: '#ef4444',
    bg: 'bg-rose-950/30',
    border: 'border-rose-500/40',
    text: 'text-rose-300',
    badgeBg: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
  },
  personal: {
    label: 'PERSONAL / SALUD',
    dot: '🟢',
    color: '#10b981',
    bg: 'bg-emerald-950/30',
    border: 'border-emerald-500/40',
    text: 'text-emerald-300',
    badgeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  },
  organizacion: {
    label: 'ORGANIZACIÓN',
    dot: '🟡',
    color: '#eab308',
    bg: 'bg-amber-950/30',
    border: 'border-amber-500/40',
    text: 'text-amber-300',
    badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  },
};

export const TodayTimeBlocks: React.FC = () => {
  const [blocks, setBlocks] = useState<TimeBlock[]>([]);
  const [currentBlock, setCurrentBlock] = useState<TimeBlock | null>(null);
  const [nextBlock, setNextBlock] = useState<TimeBlock | null>(null);
  const [backlog, setBacklog] = useState<{ id: string; title: string; area: string; reason?: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [completingBlock, setCompletingBlock] = useState<TimeBlock | null>(null);
  const [resultInput, setResultInput] = useState('');
  const [actionNotice, setActionNotice] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState<Date>(new Date());

  useEffect(() => {
    const clockTimer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(clockTimer);
  }, []);

  const liveTimeStr = `${String(currentTime.getHours()).padStart(2, '0')}:${String(currentTime.getMinutes()).padStart(2, '0')}:${String(currentTime.getSeconds()).padStart(2, '0')}`;
  const currentHHMM = `${String(currentTime.getHours()).padStart(2, '0')}:${String(currentTime.getMinutes()).padStart(2, '0')}`;
  const formattedDateStr = currentTime.toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
  const capitalizedDate = formattedDateStr.charAt(0).toUpperCase() + formattedDateStr.slice(1);

  // New block form
  const [newTitle, setNewTitle] = useState('');
  const [newStart, setNewStart] = useState('11:00');
  const [newEnd, setNewEnd] = useState('12:00');
  const [newArea, setNewArea] = useState<TimeBlockArea>('creko');
  const [newObjective, setNewObjective] = useState('');
  const [newTasks, setNewTasks] = useState('');

  const fetchBlocks = async () => {
    try {
      setLoading(true);
      const data = await api.getTimeBlocks();
      setBlocks(data.blocks);
      setCurrentBlock(data.currentBlock);
      setNextBlock(data.nextBlock);
      setBacklog(data.backlog);
    } catch (err) {
      console.error('Error fetching time blocks:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlocks();
    const interval = setInterval(fetchBlocks, 60000); // refresh every minute
    return () => clearInterval(interval);
  }, []);

  const showNotice = (msg: string) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(null), 4000);
  };

  const handleStartBlock = async (id: string) => {
    try {
      await api.updateTimeBlockStatus(id, 'in_progress');
      await fetchBlocks();
      showNotice('⚡ Bloque activado. Enfoque total en este momento.');
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenCompleteModal = (block: TimeBlock) => {
    setCompletingBlock(block);
    setResultInput(block.resultNotes || '');
  };

  const handleConfirmComplete = async () => {
    if (!completingBlock) return;
    try {
      const res = await api.updateTimeBlockStatus(
        completingBlock.id,
        'completed',
        resultInput.trim() || 'Completado con éxito'
      );
      setCompletingBlock(null);
      setResultInput('');
      await fetchBlocks();
      if (res.nextBlock) {
        showNotice(`✅ ${completingBlock.title} completado. Siguiente: ${res.nextBlock.title}`);
      } else {
        showNotice(`✅ ${completingBlock.title} completado.`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleExtendCurrent = async (minutes: number = 15) => {
    const target = currentBlock || blocks.find((b) => b.status !== 'completed');
    if (!target) return;
    try {
      await api.extendTimeBlock(target.id, minutes);
      await fetchBlocks();
      showNotice(`⏱️ Bloque extendido +${minutes} min. Bloques posteriores reorganizados.`);
    } catch (err) {
      console.error(err);
    }
  };

  const handleRegenerateDay = async () => {
    try {
      await api.generateDailyTimeBlocks(undefined, true);
      await fetchBlocks();
      showNotice('⚡ JARVIS reorganizó tu día según prioridades y compromisos.');
    } catch (err) {
      console.error(err);
    }
  };

  const handleRemoveBlock = async (id: string) => {
    try {
      await api.deleteTimeBlock(id);
      await fetchBlocks();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateBlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newStart.trim() || !newEnd.trim()) return;

    try {
      const tasksArray = newTasks
        .split('\n')
        .map((t) => t.trim())
        .filter((t) => t.length > 0);

      await api.createTimeBlock({
        title: newTitle.trim(),
        startTime: newStart.trim(),
        endTime: newEnd.trim(),
        area: newArea,
        focus: newTitle.trim(),
        objective: newObjective.trim() || newTitle.trim(),
        suggestedTasks: tasksArray,
        status: 'pending',
      });

      setIsAdding(false);
      setNewTitle('');
      setNewObjective('');
      setNewTasks('');
      await fetchBlocks();
      showNotice('Bloque agregado exitosamente.');
    } catch (err) {
      console.error(err);
    }
  };

  // Google Calendar one-click link generator for active block
  const getGoogleCalendarUrl = (b: TimeBlock) => {
    const today = b.date || new Date().toISOString().split('T')[0];
    const cleanDate = today.replace(/-/g, '');
    const cleanStart = b.startTime.replace(':', '');
    const cleanEnd = b.endTime.replace(':', '');
    const startIso = `${cleanDate}T${cleanStart}00`;
    const endIso = `${cleanDate}T${cleanEnd}00`;
    const details = encodeURIComponent(
      `Objetivo: ${b.objective}\nÁrea: ${b.area.toUpperCase()}\nOrganizado por JARVIS`
    );
    const title = encodeURIComponent(`[${b.area.toUpperCase()}] ${b.title}`);
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startIso}/${endIso}&details=${details}`;
  };

  const completedCount = blocks.filter((b) => b.status === 'completed').length;
  const totalCount = blocks.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="bg-[#1E293B] border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-6">
      {/* Notice Banner */}
      {actionNotice && (
        <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-2xl flex items-center justify-between text-xs text-blue-200 animate-fade-in">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{actionNotice}</span>
          </div>
          <button onClick={() => setActionNotice(null)} className="text-slate-400 hover:text-white text-xs">
            ✕
          </button>
        </div>
      )}

      {/* Top Header with Live Clock */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Clock className="w-5 h-5 text-purple-400" />
                Bloques de Tiempo
              </h2>
              <span className="text-[11px] bg-purple-500/20 text-purple-300 font-semibold px-2.5 py-0.5 rounded-full border border-purple-500/30">
                Sistema Activo
              </span>
              <span className="text-[11px] text-slate-400">
                {completedCount} de {totalCount} completados ({progressPercent}%)
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              "Ahora estoy en este bloque y solamente trabajo en esto." Bloques adaptativos según prioridades reales.
            </p>
          </div>

          {/* Prominent Live Digital Clock */}
          <div className="flex items-center gap-3 bg-slate-900/90 border-2 border-purple-500/50 rounded-2xl px-4 py-2 shadow-xl shadow-purple-950/40 ring-1 ring-purple-500/30 animate-pulse-slow">
            <div className="relative flex items-center justify-center">
              <div className="w-9 h-9 rounded-xl bg-purple-600/30 border border-purple-500/40 flex items-center justify-center text-purple-300 shadow-md">
                <Clock className="w-5 h-5 animate-pulse" />
              </div>
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-500" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[9px] font-black uppercase tracking-wider text-purple-300">
                  HORA ACTUAL
                </span>
                <span className="text-[9px] text-slate-400 capitalize hidden sm:inline">
                  · {capitalizedDate}
                </span>
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="font-mono text-2xl sm:text-3xl font-black text-white tracking-widest leading-none">
                  {liveTimeStr}
                </span>
                <span className="text-[10px] font-semibold text-slate-400">Logroño</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleRegenerateDay}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-semibold border border-slate-700 transition-all shadow-sm"
            title="JARVIS reorganiza tu día según compromisos, changas y pendientes"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" /> JARVIS Reorganizar
          </button>

          <a
            href="/api/time-blocks/export-ics"
            download="jarvis_bloques.ics"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-semibold border border-slate-700 transition-all shadow-sm"
            title="Exportar a Google Calendar / Apple Calendar (.ics)"
          >
            <CalendarIcon className="w-3.5 h-3.5 text-blue-400" /> Sincronizar Google Calendar
          </a>

          <button
            onClick={() => setIsAdding(!isAdding)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all shadow-md"
          >
            <Plus className="w-3.5 h-3.5" /> Bloque
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-800/80 rounded-full h-2 overflow-hidden border border-slate-700/50">
        <div
          className="bg-gradient-to-r from-purple-500 via-sky-500 to-emerald-500 h-full rounded-full transition-all duration-500"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* AHORA EN ESTE BLOQUE (HERO FOCUS CARD) */}
      {currentBlock && (
        <div
          className={`p-5 rounded-3xl border-2 transition-all shadow-lg ${
            AREA_CONFIG[currentBlock.area]?.border || 'border-purple-500/50'
          } ${AREA_CONFIG[currentBlock.area]?.bg || 'bg-purple-950/20'}`}
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-700/40">
            <div className="flex items-center gap-2.5">
              <span className="text-xl">{AREA_CONFIG[currentBlock.area]?.dot || '🟣'}</span>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-md bg-slate-900/80 border border-slate-700 text-slate-300">
                    AHORA EN ESTE BLOQUE
                  </span>
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${
                      AREA_CONFIG[currentBlock.area]?.badgeBg || ''
                    }`}
                  >
                    {AREA_CONFIG[currentBlock.area]?.label || currentBlock.area}
                  </span>
                </div>
                <h3 className="text-lg font-black text-white mt-1">{currentBlock.title}</h3>
              </div>
            </div>

            {/* Time Slot & Quick Actions */}
            <div className="flex items-center gap-2 flex-wrap">
              {/* Scheduled Block Slot */}
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-700 text-white font-mono text-xs font-bold shadow-inner">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                {currentBlock.startTime} ─ {currentBlock.endTime}
              </div>

              {/* Exact Live Time Tag */}
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-purple-950/70 border border-purple-500/50 text-purple-200 font-mono text-xs font-black shadow-md ring-1 ring-purple-500/20">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                <span>Hora: {liveTimeStr}</span>
              </div>

              {/* Remaining / Elapsed time indicator */}
              {(() => {
                const [startH, startM] = currentBlock.startTime.split(':').map(Number);
                const [endH, endM] = currentBlock.endTime.split(':').map(Number);
                const nowMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();
                const startMinutes = startH * 60 + startM;
                const endMinutes = endH * 60 + endM;

                if (nowMinutes >= startMinutes && nowMinutes < endMinutes) {
                  const remaining = endMinutes - nowMinutes;
                  return (
                    <span className="px-2.5 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-1">
                      <span>⏳</span> Quedan {remaining}m
                    </span>
                  );
                } else if (nowMinutes >= endMinutes) {
                  const over = nowMinutes - endMinutes;
                  return (
                    <span className="px-2.5 py-1.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold flex items-center gap-1">
                      <span>⚠️</span> +{over}m
                    </span>
                  );
                }
                return null;
              })()}

              <a
                href={getGoogleCalendarUrl(currentBlock)}
                target="_blank"
                rel="noreferrer"
                className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition"
                title="Abrir este bloque en Google Calendar"
              >
                <ExternalLink className="w-3.5 h-3.5 text-blue-400" />
              </a>

              <button
                onClick={() => handleExtendCurrent(15)}
                className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 hover:text-white text-xs font-bold border border-slate-700 transition"
                title="Me llevó más tiempo: extender 15 min y reorganizar"
              >
                +15m
              </button>

              <button
                onClick={() => handleOpenCompleteModal(currentBlock)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md transition"
              >
                <Check className="w-3.5 h-3.5" /> Terminar & Registrar
              </button>
            </div>
          </div>

          {/* Objective & Suggested Tasks */}
          <div className="mt-3.5 space-y-2.5">
            <div className="flex items-start gap-2 text-sm text-slate-200">
              <Target className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
              <p className="font-medium">
                <span className="text-slate-400 text-xs font-bold uppercase tracking-wider block">
                  Objetivo concreto:
                </span>
                {currentBlock.objective}
              </p>
            </div>

            {currentBlock.suggestedTasks && currentBlock.suggestedTasks.length > 0 && (
              <div className="mt-2 bg-slate-900/60 rounded-2xl p-3 border border-slate-800/80 space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Acciones recomendadas en este bloque:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  {currentBlock.suggestedTasks.map((task, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs text-slate-300">
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-400 shrink-0" />
                      <span>{task}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Next block preview */}
            {nextBlock && (
              <div className="pt-2 flex items-center justify-between text-xs text-slate-400 border-t border-slate-800/50">
                <span className="flex items-center gap-1.5">
                  <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                  Próximo bloque: <strong className="text-slate-300">{nextBlock.title}</strong> ({nextBlock.startTime}–{nextBlock.endTime})
                </span>
                <button
                  onClick={() => handleStartBlock(nextBlock.id)}
                  className="text-xs text-purple-400 hover:text-purple-300 font-semibold"
                >
                  Adelantar
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add Block Form */}
      {isAdding && (
        <form
          onSubmit={handleCreateBlock}
          className="p-4 bg-slate-900 rounded-2xl border border-purple-500/40 space-y-3 animate-fade-in"
        >
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-purple-300">
              Nuevo Bloque de Tiempo
            </h4>
            <span className="text-[10px] text-slate-400">JARVIS ajusta los horarios</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div>
              <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Área / Proyecto</label>
              <select
                value={newArea}
                onChange={(e) => setNewArea(e.target.value as TimeBlockArea)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-2.5 py-2 text-xs text-white focus:outline-none focus:border-purple-400"
              >
                {Object.entries(AREA_CONFIG).map(([key, config]) => (
                  <option key={key} value={key}>
                    {config.dot} {config.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Inicio</label>
              <input
                type="text"
                value={newStart}
                onChange={(e) => setNewStart(e.target.value)}
                placeholder="09:00"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-purple-400"
                required
              />
            </div>

            <div>
              <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Fin</label>
              <input
                type="text"
                value={newEnd}
                onChange={(e) => setNewEnd(e.target.value)}
                placeholder="10:00"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-purple-400"
                required
              />
            </div>

            <div>
              <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Título del Bloque</label>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Ej. CREKO — Captación"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-400"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Objetivo Concreto</label>
            <input
              type="text"
              value={newObjective}
              onChange={(e) => setNewObjective(e.target.value)}
              placeholder="Ej. Preparar prospectos y detectar 15 locales nuevos en Maps"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-400"
            />
          </div>

          <div>
            <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
              Tareas sugeridas (una por línea)
            </label>
            <textarea
              rows={2}
              value={newTasks}
              onChange={(e) => setNewTasks(e.target.value)}
              placeholder="Buscar comercios en Logroño centro&#10;Extraer números de WhatsApp e Instagram"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-400 resize-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-3 py-1.5 rounded-xl text-xs text-slate-400 hover:text-white"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold"
            >
              Guardar Bloque
            </button>
          </div>
        </form>
      )}

      {/* Completion Modal / Dialog */}
      {completingBlock && (
        <div className="p-4 bg-slate-900 border-2 border-emerald-500/60 rounded-3xl space-y-3 animate-fade-in shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <h4 className="text-sm font-bold text-white">
                Completar: {completingBlock.title}
              </h4>
            </div>
            <span className="text-xs text-slate-400 font-mono">
              {completingBlock.startTime} ─ {completingBlock.endTime}
            </span>
          </div>

          <p className="text-xs text-slate-300">
            Registrá qué lograste en este bloque para construir tu historial real de rendimiento (ej. "18 nuevos prospectos", "25 mensajes enviados", "3 postulaciones"):
          </p>

          <input
            type="text"
            value={resultInput}
            onChange={(e) => setResultInput(e.target.value)}
            placeholder="Ej. 18 prospectos detectados y agendados"
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-400"
            autoFocus
          />

          <div className="flex justify-end gap-2">
            <button
              onClick={() => setCompletingBlock(null)}
              className="px-3 py-1.5 rounded-xl text-xs text-slate-400 hover:text-white"
            >
              Cancelar
            </button>
            <button
              onClick={handleConfirmComplete}
              className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md"
            >
              Confirmar Registro & Avanzar
            </button>
          </div>
        </div>
      )}

      {/* TIMELINE LIST OF ALL BLOCKS */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <span>Agenda Completa del Día</span>
          </h4>
          <span className="text-[10px] text-slate-500">Haz clic en cualquier bloque para ver detalles o registrar</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {blocks.map((b) => {
            const config = AREA_CONFIG[b.area] || AREA_CONFIG.creko;
            const isCompleted = b.status === 'completed';
            const isInProgress = b.status === 'in_progress';
            const isCancelled = b.status === 'cancelled';
            const isMoved = b.status === 'moved';
            const isCurrentTimeSlot = currentHHMM >= b.startTime && currentHHMM < b.endTime;

            return (
              <div
                key={b.id}
                className={`p-3.5 rounded-2xl border transition-all relative group ${
                  isInProgress || isCurrentTimeSlot
                    ? `${config.bg} ${config.border} shadow-md ring-2 ring-purple-400/50`
                    : isCompleted
                    ? 'bg-slate-900/60 border-slate-800/80 opacity-80'
                    : 'bg-slate-900/40 border-slate-800/60 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between gap-2.5">
                  <div className="flex items-start gap-2.5 min-w-0">
                    <span className="text-base shrink-0 mt-0.5">{config.dot}</span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs font-bold text-slate-200">
                          {b.startTime} ─ {b.endTime}
                        </span>
                        <span className={`text-[10px] font-bold uppercase px-1.5 py-0.2 rounded border ${config.badgeBg}`}>
                          {config.label}
                        </span>
                        {isCurrentTimeSlot && (
                          <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-md bg-emerald-500/25 text-emerald-300 border border-emerald-500/50 animate-pulse flex items-center gap-1 shadow-sm">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                            <span>AHORA ({liveTimeStr})</span>
                          </span>
                        )}
                        {b.isFixed && (
                          <span className="text-[9px] font-bold uppercase px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                            Fijo
                          </span>
                        )}
                      </div>

                      <h4 className={`text-sm font-bold mt-1 truncate ${config.text}`}>
                        {b.title}
                      </h4>

                      <p className="text-xs text-slate-400 line-clamp-2 mt-0.5">
                        {b.objective}
                      </p>

                      {/* Result if completed */}
                      {isCompleted && b.resultNotes && (
                        <div className="mt-2 text-xs font-medium text-emerald-400 flex items-center gap-1.5 bg-emerald-950/40 px-2.5 py-1 rounded-lg border border-emerald-500/30">
                          <Check className="w-3.5 h-3.5 shrink-0" />
                          <span>Resultado: {b.resultNotes}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    {isCompleted ? (
                      <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-500/30">
                        <Check className="w-3 h-3" /> Hecho
                      </span>
                    ) : isInProgress ? (
                      <button
                        onClick={() => handleOpenCompleteModal(b)}
                        className="px-2.5 py-1 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold transition shadow"
                      >
                        Completar
                      </button>
                    ) : (
                      <button
                        onClick={() => handleStartBlock(b.id)}
                        className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                        title="Empezar este bloque ahora"
                      >
                        <Play className="w-3.5 h-3.5 text-purple-400" />
                      </button>
                    )}

                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <a
                        href={getGoogleCalendarUrl(b)}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1 text-slate-500 hover:text-blue-400 rounded"
                        title="Abrir en Google Calendar"
                      >
                        <ExternalLink className="w-3 h-3" />
                      </a>
                      <button
                        onClick={() => handleRemoveBlock(b.id)}
                        className="p-1 text-slate-500 hover:text-rose-400 rounded"
                        title="Eliminar bloque"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* PENDIENTES QUE PASAN A OTRO MOMENTO (BACKLOG ADAPTATIVO) */}
      {backlog && backlog.length > 0 && (
        <div className="pt-2 border-t border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
              Pendientes que pasan a otro momento
            </h4>
            <span className="text-[10px] text-slate-500">Sin sobrecargar el día de hoy</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
            {backlog.map((item) => (
              <div
                key={item.id}
                className="p-2.5 bg-slate-900/50 border border-slate-800/80 rounded-xl text-xs flex items-center justify-between gap-2"
              >
                <div className="min-w-0">
                  <span className="text-slate-300 font-medium block truncate">{item.title}</span>
                  {item.reason && <span className="text-[10px] text-slate-500 block truncate">{item.reason}</span>}
                </div>
                <span className="text-[9px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded border border-slate-700 shrink-0">
                  Backlog
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
