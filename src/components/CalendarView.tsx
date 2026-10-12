import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  ArrowDownLeft,
  ArrowUpRight,
  CheckSquare,
  AlertCircle,
  Plus,
  Filter,
  Check,
  ExternalLink,
  CalendarDays,
  List,
  CheckCircle2,
  X,
  Target,
  Download,
  Edit3,
  Trash2,
  Save,
  HelpCircle,
} from 'lucide-react';
import { CalendarUnifiedItem, TimeBlockArea, TimeBlockStatus } from '../types';
import { api } from '../services/api';

interface CalendarViewProps {
  items: CalendarUnifiedItem[];
  onOpenNewTask?: () => void;
  onOpenNewPostIt?: () => void;
  onOpenNewTransaction?: () => void;
  onRefreshData?: () => void;
}

export const AREA_CONFIG: Record<
  string,
  { label: string; dot: string; color: string; bg: string; border: string; text: string; badgeBg: string }
> = {
  creko: {
    label: 'CREKO',
    dot: '🟣',
    color: '#a855f7',
    bg: 'bg-purple-950/40',
    border: 'border-purple-500/50',
    text: 'text-purple-300',
    badgeBg: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  },
  producto: {
    label: 'PRODUCTO',
    dot: '🟠',
    color: '#f97316',
    bg: 'bg-orange-950/40',
    border: 'border-orange-500/50',
    text: 'text-orange-300',
    badgeBg: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
  },
  empleo: {
    label: 'EMPLEO',
    dot: '🔵',
    color: '#38bdf8',
    bg: 'bg-sky-950/40',
    border: 'border-sky-500/50',
    text: 'text-sky-300',
    badgeBg: 'bg-sky-500/20 text-sky-300 border-sky-500/30',
  },
  changa: {
    label: 'TRABAJOS / CHANGAS',
    dot: '🔴',
    color: '#ef4444',
    bg: 'bg-rose-950/40',
    border: 'border-rose-500/50',
    text: 'text-rose-300',
    badgeBg: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
  },
  personal: {
    label: 'PERSONAL / SALUD',
    dot: '🟢',
    color: '#10b981',
    bg: 'bg-emerald-950/40',
    border: 'border-emerald-500/50',
    text: 'text-emerald-300',
    badgeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  },
  organizacion: {
    label: 'ORGANIZACIÓN',
    dot: '🟡',
    color: '#eab308',
    bg: 'bg-amber-950/40',
    border: 'border-amber-500/50',
    text: 'text-amber-300',
    badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  },
};

const START_HOUR = 7; // 07:00
const END_HOUR = 22; // 22:00
const HOUR_HEIGHT = 76; // pixels per hour in Google Calendar view

// Helper to add or subtract minutes to HH:MM string
const addMinutesToTime = (timeStr: string, minutesToAdd: number): string => {
  const [h, m] = (timeStr || '09:00').split(':').map(Number);
  const total = (h || 0) * 60 + (m || 0) + minutesToAdd;
  const clamped = Math.max(0, Math.min(23 * 60 + 59, total));
  const newH = Math.floor(clamped / 60);
  const newM = clamped % 60;
  return `${String(newH).padStart(2, '0')}:${String(newM).padStart(2, '0')}`;
};

export const CalendarView: React.FC<CalendarViewProps> = ({
  items,
  onOpenNewTask,
  onOpenNewPostIt,
  onOpenNewTransaction,
  onRefreshData,
}) => {
  // Views: 'day' (Google Calendar style), 'month', 'agenda'
  const [viewMode, setViewMode] = useState<'day' | 'month' | 'agenda'>('day');
  const [selectedDateStr, setSelectedDateStr] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [filterType, setFilterType] = useState<string>('all');
  const [filterArea, setFilterArea] = useState<string>('all');

  // Live real-time clock
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const liveTimeStr = `${String(currentTime.getHours()).padStart(2, '0')}:${String(
    currentTime.getMinutes()
  ).padStart(2, '0')}:${String(currentTime.getSeconds()).padStart(2, '0')}`;
  const todayStr = new Date().toISOString().split('T')[0];
  const isSelectedDateToday = selectedDateStr === todayStr;

  // Selected date components
  const selectedDateObj = useMemo(() => {
    const [y, m, d] = selectedDateStr.split('-').map(Number);
    return new Date(y, m - 1, d);
  }, [selectedDateStr]);

  const year = selectedDateObj.getFullYear();
  const month = selectedDateObj.getMonth();

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
  ];

  const weekdayNamesLong = [
    'Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado',
  ];

  // Navigation handlers
  const goToToday = () => {
    const t = new Date().toISOString().split('T')[0];
    setSelectedDateStr(t);
  };

  const handlePrevDay = () => {
    const d = new Date(selectedDateObj);
    d.setDate(d.getDate() - 1);
    setSelectedDateStr(d.toISOString().split('T')[0]);
  };

  const handleNextDay = () => {
    const d = new Date(selectedDateObj);
    d.setDate(d.getDate() + 1);
    setSelectedDateStr(d.toISOString().split('T')[0]);
  };

  const handlePrevMonth = () => {
    const d = new Date(year, month - 1, 1);
    setSelectedDateStr(d.toISOString().split('T')[0]);
  };

  const handleNextMonth = () => {
    const d = new Date(year, month + 1, 1);
    setSelectedDateStr(d.toISOString().split('T')[0]);
  };

  // Mini-week strip calculation (Mon to Sun)
  const currentWeekDays = useMemo(() => {
    const current = new Date(selectedDateObj);
    const dayOfWeek = current.getDay(); // 0 is Sun
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = new Date(current);
    monday.setDate(current.getDate() + mondayOffset);

    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const str = d.toISOString().split('T')[0];
      const name = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'][i];
      days.push({
        dateStr: str,
        dayNumber: d.getDate(),
        name,
        isToday: str === todayStr,
        isSelected: str === selectedDateStr,
      });
    }
    return days;
  }, [selectedDateObj, todayStr, selectedDateStr]);

  // Filter items
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      if (filterType !== 'all' && item.type !== filterType) return false;
      if (filterArea !== 'all' && item.area !== filterArea) return false;
      return true;
    });
  }, [items, filterType, filterArea]);

  // Group items by date string (YYYY-MM-DD)
  const itemsByDate = useMemo(() => {
    const map: Record<string, CalendarUnifiedItem[]> = {};
    filteredItems.forEach((item) => {
      if (!map[item.date]) map[item.date] = [];
      map[item.date].push(item);
    });
    return map;
  }, [filteredItems]);

  // Items for the selected day
  const dayItems = useMemo(() => {
    return itemsByDate[selectedDateStr] || [];
  }, [itemsByDate, selectedDateStr]);

  // Separate timed blocks from all-day items
  const { timedBlocks, allDayItems } = useMemo(() => {
    const timed: CalendarUnifiedItem[] = [];
    const allDay: CalendarUnifiedItem[] = [];

    dayItems.forEach((it) => {
      if (it.type === 'time_block' && (it.startTime || it.time)) {
        timed.push(it);
      } else if (it.startTime && it.endTime) {
        timed.push(it);
      } else if (it.time && it.time.includes(':')) {
        timed.push(it);
      } else {
        allDay.push(it);
      }
    });

    // Sort timed items by startTime
    timed.sort((a, b) => {
      const aStart = a.startTime || (a.time ? a.time.split(/[-–─]/)[0].trim() : '00:00');
      const bStart = b.startTime || (b.time ? b.time.split(/[-–─]/)[0].trim() : '00:00');
      return aStart.localeCompare(bStart);
    });

    return { timedBlocks: timed, allDayItems: allDay };
  }, [dayItems]);

  // Month grid calculation
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const startDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Color config helpers
  const typeConfig: Record<
    CalendarUnifiedItem['type'],
    { label: string; badge: string; dot: string; color: string; bg: string }
  > = {
    pending_income: {
      label: 'Cobro Esperado',
      badge: '💰',
      dot: 'bg-emerald-400',
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/15 border-emerald-500/30',
    },
    future_expense: {
      label: 'Gasto / Fijo',
      badge: '🛡️',
      dot: 'bg-rose-400',
      color: 'text-rose-400',
      bg: 'bg-rose-500/15 border-rose-500/30',
    },
    task: {
      label: 'Tarea',
      badge: '📋',
      dot: 'bg-blue-400',
      color: 'text-blue-400',
      bg: 'bg-blue-500/15 border-blue-500/30',
    },
    postit: {
      label: 'Post-It',
      badge: '📝',
      dot: 'bg-yellow-400',
      color: 'text-yellow-400',
      bg: 'bg-yellow-500/15 border-yellow-500/30',
    },
    time_block: {
      label: 'Bloque Horario',
      badge: '⏱️',
      dot: 'bg-purple-400',
      color: 'text-purple-400',
      bg: 'bg-purple-500/15 border-purple-500/30',
    },
  };

  const getItemColorDot = (it: CalendarUnifiedItem) => {
    if (it.colorPriority === 'purple' || it.area === 'creko') return 'bg-purple-400';
    if (it.colorPriority === 'orange' || it.area === 'producto') return 'bg-orange-400';
    if (it.colorPriority === 'blue' || it.area === 'empleo') return 'bg-sky-400';
    if (it.colorPriority === 'red' || it.area === 'changa') return 'bg-rose-400';
    if (it.colorPriority === 'green' || it.area === 'personal') return 'bg-emerald-400';
    if (it.colorPriority === 'yellow' || it.area === 'organizacion') return 'bg-amber-400';
    return typeConfig[it.type]?.dot || 'bg-blue-400';
  };

  const getItemBadgeBg = (it: CalendarUnifiedItem) => {
    if (it.colorPriority === 'purple' || it.area === 'creko')
      return 'bg-purple-950/40 border-purple-500/40 text-purple-200';
    if (it.colorPriority === 'orange' || it.area === 'producto')
      return 'bg-orange-950/40 border-orange-500/40 text-orange-200';
    if (it.colorPriority === 'blue' || it.area === 'empleo')
      return 'bg-sky-950/40 border-sky-500/40 text-sky-200';
    if (it.colorPriority === 'red' || it.area === 'changa')
      return 'bg-rose-950/40 border-rose-500/40 text-rose-200';
    if (it.colorPriority === 'green' || it.area === 'personal')
      return 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200';
    if (it.colorPriority === 'yellow' || it.area === 'organizacion')
      return 'bg-amber-950/40 border-amber-500/40 text-amber-200';
    return typeConfig[it.type]?.bg || 'bg-blue-500/15 border-blue-500/30';
  };

  // Google Calendar URL generator for any block
  const getGoogleCalendarUrl = (it: CalendarUnifiedItem) => {
    const dateCompact = it.date.replace(/-/g, '');
    let startCompact = '090000';
    let endCompact = '100000';

    if (it.startTime) {
      startCompact = it.startTime.replace(':', '') + '00';
    }
    if (it.endTime) {
      endCompact = it.endTime.replace(':', '') + '00';
    }

    const dates = `${dateCompact}T${startCompact}/${dateCompact}T${endCompact}`;
    const text = encodeURIComponent(
      `[${(it.area || it.type).toUpperCase()}] ${it.title}`
    );
    const details = encodeURIComponent(
      `Objetivo: ${it.objective || it.subtitle || it.title}\n\nNotas: ${it.notes || it.resultNotes || ''}\n\nGestor: JARVIS Bloques de Tiempo`
    );
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${text}&dates=${dates}&details=${details}`;
  };

  // Quick New Block Modal state
  const [isNewBlockModalOpen, setIsNewBlockModalOpen] = useState(false);
  const [newBlockStart, setNewBlockStart] = useState('10:00');
  const [newBlockEnd, setNewBlockEnd] = useState('11:00');
  const [newBlockTitle, setNewBlockTitle] = useState('');
  const [newBlockArea, setNewBlockArea] = useState<TimeBlockArea>('creko');
  const [newBlockObjective, setNewBlockObjective] = useState('');

  // =========================================================================
  // FICHA MODAL / EDICIÓN DETALLADA DE CUALQUIER FICHA DEL CALENDARIO
  // =========================================================================
  const [selectedItemForEdit, setSelectedItemForEdit] = useState<CalendarUnifiedItem | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDate, setEditDate] = useState('');
  const [editStartTime, setEditStartTime] = useState('09:00');
  const [editEndTime, setEditEndTime] = useState('10:00');
  const [editStatus, setEditStatus] = useState<TimeBlockStatus>('pending');
  const [editArea, setEditArea] = useState<TimeBlockArea>('creko');
  const [editObjective, setEditObjective] = useState('');
  const [editResultNotes, setEditResultNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [actionSuccessNotice, setActionSuccessNotice] = useState<string | null>(null);

  // Open the Ficha Modal for any card
  const handleOpenFicha = (item: CalendarUnifiedItem) => {
    setSelectedItemForEdit(item);
    setEditTitle(item.title);
    setEditDate(item.date);

    // Parse start and end time safely
    let sTime = item.startTime;
    let eTime = item.endTime;

    if (!sTime && item.time) {
      const parts = item.time.split(/[-–─]/);
      if (parts.length === 2) {
        sTime = parts[0].trim();
        eTime = parts[1].trim();
      }
    }

    setEditStartTime(sTime || '09:00');
    setEditEndTime(eTime || '10:00');

    // Parse status
    let st: TimeBlockStatus = 'pending';
    if (item.status === 'completed' || item.status === 'done' || item.isCompleted) {
      st = 'completed';
    } else if (item.status === 'in_progress') {
      st = 'in_progress';
    } else if (item.status === 'cancelled') {
      st = 'cancelled';
    } else if (item.status === 'moved') {
      st = 'moved';
    }
    setEditStatus(st);

    setEditArea((item.area as TimeBlockArea) || 'creko');
    setEditObjective(item.objective || item.subtitle || item.notes || '');
    setEditResultNotes(item.resultNotes || '');
  };

  // Save changes to the Ficha
  const handleSaveFicha = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItemForEdit || !editTitle.trim()) return;

    setIsSaving(true);
    try {
      const rawId =
        selectedItemForEdit.referenceId ||
        selectedItemForEdit.id.replace(/^cal_(tb|tk|po|pi|fe)_/, '');

      if (selectedItemForEdit.type === 'time_block') {
        // Update Time Block
        await api.updateTimeBlock(rawId, {
          title: editTitle.trim(),
          date: editDate,
          startTime: editStartTime,
          endTime: editEndTime,
          area: editArea,
          status: editStatus,
          objective: editObjective,
          resultNotes: editResultNotes,
          colorPriority:
            editArea === 'creko'
              ? 'purple'
              : editArea === 'producto'
              ? 'orange'
              : editArea === 'empleo'
              ? 'blue'
              : editArea === 'changa'
              ? 'red'
              : editArea === 'personal'
              ? 'green'
              : 'yellow',
        });

        // If completed or status changed, sync status endpoint too
        if (editStatus === 'completed') {
          await api.updateTimeBlockStatus(
            rawId,
            'completed',
            editResultNotes || 'Completado desde la Ficha del Calendario'
          );
        }
      } else if (selectedItemForEdit.type === 'task') {
        // Update Task
        await api.updateTask(rawId, {
          title: editTitle.trim(),
          dueDate: editDate,
          status: editStatus === 'completed' ? 'done' : editStatus === 'in_progress' ? 'in_progress' : 'todo',
          notes: editObjective,
        });
      } else if (selectedItemForEdit.type === 'postit') {
        // Update Post-It
        await api.updatePostIt(rawId, {
          title: editTitle.trim(),
          date: editDate,
          status: editStatus === 'completed' ? 'completed' : 'active',
          description: editObjective,
        });
      }

      setActionSuccessNotice(`¡Ficha de "${editTitle}" actualizada con éxito!`);
      setTimeout(() => setActionSuccessNotice(null), 3000);
      setSelectedItemForEdit(null);

      // Refresh unified agenda
      if (onRefreshData) onRefreshData();
    } catch (err: any) {
      console.error('Error al guardar ficha:', err);
      alert('Error al guardar los cambios: ' + (err.message || 'Intente de nuevo'));
    } finally {
      setIsSaving(false);
    }
  };

  // Delete card from modal
  const handleDeleteFromFicha = async () => {
    if (!selectedItemForEdit) return;
    const confirmDelete = window.confirm(
      `¿Seguro que querés eliminar la ficha "${selectedItemForEdit.title}"?`
    );
    if (!confirmDelete) return;

    setIsSaving(true);
    try {
      const rawId =
        selectedItemForEdit.referenceId ||
        selectedItemForEdit.id.replace(/^cal_(tb|tk|po|pi|fe)_/, '');

      if (selectedItemForEdit.type === 'time_block') {
        await api.deleteTimeBlock(rawId);
      } else if (selectedItemForEdit.type === 'task') {
        await api.deleteTask(rawId);
      } else if (selectedItemForEdit.type === 'postit') {
        await api.deletePostIt(rawId);
      }

      setActionSuccessNotice(`"${selectedItemForEdit.title}" eliminada.`);
      setTimeout(() => setActionSuccessNotice(null), 3000);
      setSelectedItemForEdit(null);
      if (onRefreshData) onRefreshData();
    } catch (err: any) {
      console.error('Error al eliminar:', err);
      alert('Error al eliminar: ' + (err.message || 'Intente de nuevo'));
    } finally {
      setIsSaving(false);
    }
  };

  // Quick toggle completed directly from card
  const handleQuickToggleCompleted = async (
    e: React.MouseEvent,
    item: CalendarUnifiedItem
  ) => {
    e.stopPropagation();
    try {
      const rawId = item.referenceId || item.id.replace(/^cal_(tb|tk|po|pi|fe)_/, '');
      const isCurrentlyDone =
        item.status === 'completed' || item.status === 'done' || item.isCompleted;

      if (item.type === 'time_block') {
        const nextStatus: TimeBlockStatus = isCurrentlyDone ? 'pending' : 'completed';
        await api.updateTimeBlock(rawId, { status: nextStatus });
        if (nextStatus === 'completed') {
          await api.updateTimeBlockStatus(
            rawId,
            'completed',
            'Completado con un clic desde el Calendario'
          );
        }
      } else if (item.type === 'task') {
        await api.updateTask(rawId, {
          status: isCurrentlyDone ? 'todo' : 'done',
        });
      } else if (item.type === 'postit') {
        await api.updatePostIt(rawId, {
          status: isCurrentlyDone ? 'active' : 'completed',
        });
      }

      if (onRefreshData) onRefreshData();
    } catch (err) {
      console.error('Error al alternar estado:', err);
    }
  };

  const handleCreateBlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBlockTitle.trim()) return;

    try {
      await api.createTimeBlock({
        date: selectedDateStr,
        startTime: newBlockStart,
        endTime: newBlockEnd,
        area: newBlockArea,
        title: newBlockTitle,
        objective: newBlockObjective || 'Enfoque de trabajo',
        colorPriority:
          newBlockArea === 'creko'
            ? 'purple'
            : newBlockArea === 'producto'
            ? 'orange'
            : newBlockArea === 'empleo'
            ? 'blue'
            : newBlockArea === 'changa'
            ? 'red'
            : newBlockArea === 'personal'
            ? 'green'
            : 'yellow',
        status: 'pending',
      });
      setIsNewBlockModalOpen(false);
      setNewBlockTitle('');
      setNewBlockObjective('');
      if (onRefreshData) onRefreshData();
    } catch (err) {
      console.error('Error creando bloque:', err);
    }
  };

  // Hourly grid helper: returns position in pixels
  const getTimePositionPx = (timeString: string) => {
    const [h, m] = timeString.split(':').map(Number);
    const minutes = (h || 0) * 60 + (m || 0);
    const startMinutes = START_HOUR * 60;
    const diff = minutes - startMinutes;
    return (diff / 60) * HOUR_HEIGHT;
  };

  // Current time red line position (Google Calendar indicator)
  const currentMinutesFromMidnight = currentTime.getHours() * 60 + currentTime.getMinutes();
  const currentLineTopPx =
    ((currentMinutesFromMidnight - START_HOUR * 60) / 60) * HOUR_HEIGHT;
  const isCurrentTimeInVisibleRange =
    currentTime.getHours() >= START_HOUR && currentTime.getHours() <= END_HOUR;

  // Auto-scroll to current hour on initial load
  const timelineScrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (viewMode === 'day' && timelineScrollRef.current && isSelectedDateToday) {
      const scrollPos = Math.max(0, currentLineTopPx - 160);
      timelineScrollRef.current.scrollTop = scrollPos;
    }
  }, [viewMode, isSelectedDateToday]);

  return (
    <div className="space-y-5 pb-24">
      {/* Action Notice Toast */}
      {actionSuccessNotice && (
        <div className="fixed top-16 right-6 z-50 bg-emerald-600 text-white font-bold text-xs px-4 py-2.5 rounded-2xl shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-top duration-200">
          <CheckCircle2 className="w-4 h-4" />
          <span>{actionSuccessNotice}</span>
        </div>
      )}

      {/* Top Banner & Header */}
      <div className="bg-gradient-to-r from-slate-900 via-[#1E293B] to-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="text-2xl">📅</span>
              <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                Calendario & Agenda de Bloques
              </h1>
              <span className="text-[11px] bg-purple-500/20 text-purple-300 font-bold px-2.5 py-0.5 rounded-full border border-purple-500/30">
                Fichas Editables en Tiempo Real
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-400">
              Hacé clic en cualquier ficha del calendario para modificar horario, marcar si ya está listo o no, y guardar cambios al instante.
            </p>
          </div>

          {/* View Mode Switcher: DÍA / MES / AGENDA */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center bg-slate-900/90 border border-slate-700 p-1 rounded-2xl shadow-inner">
              <button
                type="button"
                onClick={() => setViewMode('day')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  viewMode === 'day'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Día</span>
              </button>

              <button
                type="button"
                onClick={() => setViewMode('month')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  viewMode === 'month'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <CalendarDays className="w-3.5 h-3.5" />
                <span>Mes</span>
              </button>

              <button
                type="button"
                onClick={() => setViewMode('agenda')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  viewMode === 'agenda'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <List className="w-3.5 h-3.5" />
                <span>Agenda</span>
              </button>
            </div>

            <button
              type="button"
              onClick={goToToday}
              className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all ${
                isSelectedDateToday
                  ? 'bg-blue-600/30 text-blue-300 border-blue-500/50 ring-1 ring-blue-500/30'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
              }`}
            >
              Hoy
            </button>

            <a
              href="/api/time-blocks/export-ics"
              download="jarvis-agenda.ics"
              className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 rounded-xl text-xs font-bold border border-emerald-500/30 transition-all shadow-sm"
              title="Descargar archivo iCalendar (.ics) para Google Calendar"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Exportar .ics</span>
            </a>
          </div>
        </div>

        {/* Date Navigator Bar & Live Clock */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-5 pt-4 border-t border-slate-800">
          <div className="flex items-center gap-2">
            <button
              onClick={viewMode === 'month' ? handlePrevMonth : handlePrevDay}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all border border-slate-800"
              title={viewMode === 'month' ? 'Mes anterior' : 'Día anterior'}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <div className="text-left">
              <div className="text-base sm:text-lg font-black text-white tracking-tight flex items-center gap-2">
                {viewMode === 'month' ? (
                  <span>
                    {monthNames[month]} {year}
                  </span>
                ) : (
                  <span>
                    {weekdayNamesLong[selectedDateObj.getDay()]}, {selectedDateObj.getDate()} de{' '}
                    {monthNames[month]} {year}
                  </span>
                )}
                {isSelectedDateToday && (
                  <span className="text-[10px] uppercase font-black bg-blue-500/25 text-blue-300 border border-blue-500/40 px-2 py-0.5 rounded-full">
                    HOY
                  </span>
                )}
              </div>
            </div>

            <button
              onClick={viewMode === 'month' ? handleNextMonth : handleNextDay}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all border border-slate-800"
              title={viewMode === 'month' ? 'Mes siguiente' : 'Día siguiente'}
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Live Clock & Day Action Button */}
          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-2 bg-slate-900/90 border border-slate-700/80 px-3 py-1.5 rounded-xl font-mono text-xs text-white shadow-sm">
              <Clock className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
              <span className="font-extrabold tracking-wider">{liveTimeStr}</span>
              <span className="text-[10px] text-slate-400">Logroño</span>
            </div>

            <button
              onClick={() => {
                setNewBlockStart('10:00');
                setNewBlockEnd('11:00');
                setIsNewBlockModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold transition-all shadow-md"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Bloque</span>
            </button>
          </div>
        </div>

        {/* Mini 7-Day Week Strip (Google Calendar Style) */}
        {viewMode === 'day' && (
          <div className="grid grid-cols-7 gap-1.5 mt-4 pt-4 border-t border-slate-800">
            {currentWeekDays.map((d) => {
              const dayItemCount = (itemsByDate[d.dateStr] || []).length;
              return (
                <button
                  key={d.dateStr}
                  type="button"
                  onClick={() => setSelectedDateStr(d.dateStr)}
                  className={`py-2 px-1 rounded-2xl flex flex-col items-center justify-center transition-all border ${
                    d.isSelected
                      ? 'bg-blue-600 text-white border-blue-400 shadow-lg ring-2 ring-blue-500/40 scale-102'
                      : d.isToday
                      ? 'bg-slate-800/90 text-blue-300 border-blue-500/40 hover:bg-slate-700'
                      : 'bg-slate-900/60 text-slate-400 border-slate-800/80 hover:bg-slate-800/50 hover:text-slate-200'
                  }`}
                >
                  <span className="text-[10px] font-bold uppercase">{d.name}</span>
                  <span className="text-sm sm:text-base font-black mt-0.5">{d.dayNumber}</span>
                  <div className="flex items-center gap-0.5 mt-1 h-1.5">
                    {dayItemCount > 0 ? (
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          d.isSelected ? 'bg-white' : 'bg-purple-400'
                        }`}
                      />
                    ) : (
                      <span className="w-1.5 h-1.5 rounded-full opacity-0" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Filter Chips */}
      <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1 no-scrollbar text-xs">
        <div className="flex items-center gap-1.5">
          {[
            { id: 'all', label: 'Todo' },
            { id: 'time_block', label: '⏱️ Bloques de Tiempo' },
            { id: 'task', label: '📋 Tareas' },
            { id: 'pending_income', label: '💰 Cobros' },
            { id: 'future_expense', label: '🛡️ Gastos' },
            { id: 'postit', label: '📝 Post-Its' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterType(tab.id)}
              className={`px-3 py-1.5 rounded-xl font-medium transition-all whitespace-nowrap ${
                filterType === tab.id
                  ? 'bg-slate-700 text-white font-bold shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Color Area Filter */}
        <div className="flex items-center gap-1 text-[11px]">
          <span className="text-slate-500 hidden sm:inline">Áreas:</span>
          {Object.entries(AREA_CONFIG).map(([areaKey, cfg]) => (
            <button
              key={areaKey}
              onClick={() => setFilterArea(filterArea === areaKey ? 'all' : areaKey)}
              className={`px-2 py-1 rounded-lg font-bold border transition-all text-[10px] ${
                filterArea === areaKey
                  ? `${cfg.badgeBg} shadow-sm ring-1 ring-white/30`
                  : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {cfg.dot} {cfg.label.split('/')[0].trim()}
            </button>
          ))}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. GOOGLE CALENDAR DAY VIEW (PROPORTIONAL HOURLY SCHEDULE) */}
      {/* ========================================================================= */}
      {viewMode === 'day' && (
        <div className="bg-[#1E293B]/80 border border-slate-800 rounded-3xl p-4 sm:p-6 shadow-2xl space-y-4">
          {/* Day Overview Summary */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800 gap-2">
            <div className="flex items-center gap-2">
              <span className="text-lg">🧭</span>
              <h2 className="text-base font-bold text-white">
                Horario del Día — {timedBlocks.length} Bloques Agendados
              </h2>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                Línea Roja: Hora Actual
              </span>
              <span>·</span>
              <span className="text-purple-300 font-semibold">
                💡 Clic en cualquier ficha para abrir y modificar
              </span>
            </div>
          </div>

          {/* ALL-DAY EVENTS SECTION (Top row like Google Calendar) */}
          {allDayItems.length > 0 && (
            <div className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-3.5 space-y-2">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                <span>📌 Todo el Día / Sin Hora Específica ({allDayItems.length})</span>
                <span className="text-[10px] text-slate-500">Hacé clic para asignarle hora o editar</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                {allDayItems.map((it) => {
                  const cfg = typeConfig[it.type] || typeConfig.task;
                  const isDone =
                    it.status === 'completed' || it.status === 'done' || it.isCompleted;

                  return (
                    <div
                      key={it.id}
                      onClick={() => handleOpenFicha(it)}
                      className={`p-2.5 rounded-xl border ${getItemBadgeBg(
                        it
                      )} flex items-start justify-between gap-2 shadow-sm text-xs cursor-pointer hover:ring-2 hover:ring-purple-400/50 hover:scale-[1.01] transition-all group`}
                    >
                      <div className="space-y-0.5 min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span>{cfg.badge}</span>
                          <span
                            className={`font-bold truncate ${
                              isDone ? 'line-through text-slate-400' : 'text-white'
                            }`}
                          >
                            {it.title}
                          </span>
                        </div>
                        {it.subtitle && (
                          <p className="text-[10px] text-slate-300 truncate">{it.subtitle}</p>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {it.amount !== undefined && (
                          <span
                            className={`font-mono font-bold ${
                              it.type === 'pending_income'
                                ? 'text-emerald-400'
                                : 'text-rose-400'
                            }`}
                          >
                            {it.type === 'pending_income' ? '+' : '-'}
                            {it.amount} €
                          </span>
                        )}

                        <button
                          type="button"
                          onClick={(e) => handleQuickToggleCompleted(e, it)}
                          className={`p-1 rounded-lg border transition-all ${
                            isDone
                              ? 'bg-emerald-500 text-white border-emerald-400'
                              : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white hover:bg-slate-700'
                          }`}
                          title={isDone ? 'Marcar pendiente' : 'Marcar listo'}
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TIMELINE GRID CONTAINER */}
          <div
            ref={timelineScrollRef}
            className="relative overflow-y-auto max-h-[750px] rounded-2xl border border-slate-800/90 bg-slate-950/60 p-2 sm:p-4 select-none scrollbar-thin scrollbar-thumb-slate-800"
          >
            {/* The canvas: total height = (END_HOUR - START_HOUR + 1) * HOUR_HEIGHT */}
            <div
              className="relative"
              style={{
                height: `${(END_HOUR - START_HOUR + 1) * HOUR_HEIGHT}px`,
                minWidth: '550px',
              }}
            >
              {/* Hourly Background Lines & Labels */}
              {Array.from({ length: END_HOUR - START_HOUR + 1 }).map((_, idx) => {
                const hour = START_HOUR + idx;
                const topPx = idx * HOUR_HEIGHT;
                const hourLabel = `${String(hour).padStart(2, '0')}:00`;

                return (
                  <div
                    key={hour}
                    className="absolute left-0 right-0 group cursor-pointer"
                    style={{ top: `${topPx}px` }}
                    onClick={() => {
                      setNewBlockStart(`${String(hour).padStart(2, '0')}:00`);
                      setNewBlockEnd(`${String(Math.min(23, hour + 1)).padStart(2, '0')}:00`);
                      setIsNewBlockModalOpen(true);
                    }}
                    title={`Clic para agendar nuevo bloque a las ${hourLabel}`}
                  >
                    {/* Main Hour Line */}
                    <div className="flex items-center gap-3">
                      <span className="w-14 text-right font-mono text-xs font-semibold text-slate-500 shrink-0 select-none group-hover:text-blue-400 transition-colors">
                        {hourLabel}
                      </span>
                      <div className="flex-1 border-t border-slate-800/90 group-hover:border-slate-700" />
                    </div>

                    {/* Half-hour dotted line */}
                    {idx < END_HOUR - START_HOUR && (
                      <div
                        className="flex items-center gap-3 absolute left-0 right-0 pointer-events-none"
                        style={{ top: `${HOUR_HEIGHT / 2}px` }}
                      >
                        <span className="w-14 text-right font-mono text-[10px] text-slate-600/70 shrink-0 select-none">
                          {String(hour).padStart(2, '0')}:30
                        </span>
                        <div className="flex-1 border-t border-dashed border-slate-800/40" />
                      </div>
                    )}
                  </div>
                );
              })}

              {/* GOOGLE CALENDAR RED LINE (CURRENT LIVE TIME) */}
              {isSelectedDateToday && isCurrentTimeInVisibleRange && (
                <div
                  className="absolute left-0 right-0 z-30 pointer-events-none flex items-center transition-all duration-1000"
                  style={{ top: `${currentLineTopPx}px` }}
                >
                  <div className="w-14 text-right pr-2">
                    <span className="bg-rose-500 text-white font-mono text-[10px] font-black px-1.5 py-0.5 rounded shadow-md">
                      {String(currentTime.getHours()).padStart(2, '0')}:
                      {String(currentTime.getMinutes()).padStart(2, '0')}
                    </span>
                  </div>
                  <div className="w-3.5 h-3.5 rounded-full bg-rose-500 ring-4 ring-rose-500/30 -ml-1.5 shadow-lg shadow-rose-500/50" />
                  <div className="flex-1 border-t-2 border-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.8)]" />
                </div>
              )}

              {/* TIMED BLOCKS RENDERED ON THE GRID */}
              <div className="absolute left-16 sm:left-20 right-2 top-0 bottom-0 pointer-events-none">
                {timedBlocks.map((block) => {
                  const sTime =
                    block.startTime ||
                    (block.time ? block.time.split(/[-–─]/)[0].trim() : '09:00');
                  const eTime =
                    block.endTime ||
                    (block.time ? block.time.split(/[-–─]/)[1].trim() : '10:00');

                  const topPx = getTimePositionPx(sTime);
                  const endPx = getTimePositionPx(eTime);
                  const heightPx = Math.max(endPx - topPx, 46);

                  const areaKey = block.area || 'creko';
                  const areaConfig = AREA_CONFIG[areaKey] || AREA_CONFIG.creko;
                  const isCompleted =
                    block.status === 'completed' || block.status === 'done' || block.isCompleted;
                  const isInProgress = block.status === 'in_progress';

                  return (
                    <div
                      key={block.id}
                      style={{
                        top: `${Math.max(0, topPx)}px`,
                        height: `${heightPx}px`,
                      }}
                      onClick={() => handleOpenFicha(block)}
                      className={`absolute left-0 right-0 rounded-2xl border p-3 flex flex-col justify-between transition-all group pointer-events-auto cursor-pointer hover:z-20 hover:shadow-2xl hover:scale-[1.008] ${
                        isInProgress
                          ? `${areaConfig.bg} ${areaConfig.border} ring-2 ring-purple-400/60 shadow-xl`
                          : isCompleted
                          ? 'bg-slate-900/85 border-slate-800 opacity-80 hover:opacity-100'
                          : `${areaConfig.bg} ${areaConfig.border} hover:border-purple-400/80 shadow-md`
                      }`}
                    >
                      {/* Top Info Bar */}
                      <div className="flex items-start justify-between gap-2 overflow-hidden">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-sm shrink-0">{areaConfig.dot}</span>
                          <span
                            className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border ${areaConfig.badgeBg} shrink-0`}
                          >
                            {areaConfig.label}
                          </span>
                          <span
                            className={`font-bold text-xs sm:text-sm truncate ${
                              isCompleted ? 'line-through text-slate-300' : 'text-white'
                            }`}
                          >
                            {block.title}
                          </span>
                          {block.isFixed && (
                            <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-rose-500/25 text-rose-300 border border-rose-500/40 shrink-0">
                              FIJO
                            </span>
                          )}
                        </div>

                        {/* Right: Time Range, Status & Edit Hint */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className="font-mono text-xs font-bold text-slate-200 bg-slate-900/80 px-2 py-0.5 rounded-lg border border-slate-700/80">
                            {sTime} ─ {eTime}
                          </span>

                          {isCompleted ? (
                            <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded-lg border border-emerald-500/30">
                              <CheckCircle2 className="w-3 h-3" /> Listo
                            </span>
                          ) : isInProgress ? (
                            <span className="flex items-center gap-1 text-[10px] font-bold text-amber-400 bg-amber-500/20 px-2 py-0.5 rounded-lg border border-amber-500/30 animate-pulse">
                              <Clock className="w-3 h-3" /> En curso
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded-lg">
                              Pendiente
                            </span>
                          )}

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenFicha(block);
                            }}
                            className="p-1 rounded-lg bg-slate-800/90 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-all opacity-80 group-hover:opacity-100"
                            title="Abrir Ficha y Modificar"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Objective & Tasks preview (shown if block has sufficient height) */}
                      {heightPx >= 65 && (
                        <div className="mt-1 flex-1 flex flex-col justify-center overflow-hidden">
                          {block.objective && (
                            <p className="text-[11px] text-slate-300 truncate">
                              <span className="font-bold text-purple-300">🎯 Objetivo:</span>{' '}
                              {block.objective}
                            </p>
                          )}
                          {block.resultNotes && (
                            <p className="text-[10px] text-emerald-300 truncate mt-0.5">
                              <span className="font-bold">Resultado:</span> {block.resultNotes}
                            </p>
                          )}
                        </div>
                      )}

                      {/* Bottom Action Footer */}
                      <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-800/60 mt-1 opacity-90 group-hover:opacity-100">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenFicha(block);
                            }}
                            className="inline-flex items-center gap-1 text-[10px] font-bold text-purple-300 hover:text-white bg-purple-500/15 hover:bg-purple-500/25 px-2 py-0.5 rounded-md border border-purple-500/30 transition-all"
                          >
                            <Edit3 className="w-3 h-3" />
                            <span>Abrir Ficha</span>
                          </button>

                          <a
                            href={getGoogleCalendarUrl(block)}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-300 hover:text-white bg-blue-500/10 hover:bg-blue-500/20 px-2 py-0.5 rounded-md border border-blue-500/30 transition-all"
                            title="Abrir este bloque en Google Calendar"
                          >
                            <ExternalLink className="w-3 h-3" />
                            <span className="hidden sm:inline">Google Calendar</span>
                          </a>
                        </div>

                        <button
                          type="button"
                          onClick={(e) => handleQuickToggleCompleted(e, block)}
                          className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md border transition-all ${
                            isCompleted
                              ? 'bg-slate-800 text-slate-300 hover:bg-slate-700 border-slate-700'
                              : 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border-emerald-500/40'
                          }`}
                        >
                          <Check className="w-3 h-3" />
                          <span>{isCompleted ? 'Desmarcar' : '¿Ya está listo?'}</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. MONTH VIEW (CALENDAR GRID + DETAIL SIDEBAR) */}
      {/* ========================================================================= */}
      {viewMode === 'month' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar Grid (2 cols) */}
          <div className="lg:col-span-2 bg-[#1E293B]/70 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
            {/* Weekday headers */}
            <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-semibold text-slate-400 uppercase tracking-wider py-1 border-b border-slate-800">
              <div>Lun</div>
              <div>Mar</div>
              <div>Mié</div>
              <div>Jue</div>
              <div>Vie</div>
              <div>Sáb</div>
              <div>Dom</div>
            </div>

            {/* Days grid */}
            <div className="grid grid-cols-7 gap-1.5">
              {/* Empty placeholder cells before the 1st */}
              {Array.from({ length: startDay }).map((_, i) => (
                <div
                  key={`empty-${i}`}
                  className="h-16 sm:h-20 rounded-xl bg-slate-900/20 opacity-30"
                />
              ))}

              {/* Real month days */}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const dayNumber = i + 1;
                const dayStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(
                  dayNumber
                ).padStart(2, '0')}`;
                const isToday = dayStr === todayStr;
                const isSelected = dayStr === selectedDateStr;
                const cellItems = itemsByDate[dayStr] || [];

                return (
                  <button
                    key={dayStr}
                    type="button"
                    onClick={() => {
                      setSelectedDateStr(dayStr);
                    }}
                    onDoubleClick={() => {
                      setSelectedDateStr(dayStr);
                      setViewMode('day');
                    }}
                    className={`h-16 sm:h-20 rounded-xl p-1.5 flex flex-col justify-between border transition-all text-left group ${
                      isSelected
                        ? 'bg-blue-600/25 border-blue-500 ring-2 ring-blue-500/40 shadow-md'
                        : isToday
                        ? 'bg-slate-800/80 border-slate-600'
                        : 'bg-slate-900/50 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span
                        className={`text-xs font-semibold rounded-md px-1 ${
                          isToday
                            ? 'bg-blue-600 text-white'
                            : isSelected
                            ? 'text-blue-300 font-bold'
                            : 'text-slate-300'
                        }`}
                      >
                        {dayNumber}
                      </span>
                      {cellItems.length > 0 && (
                        <span className="text-[10px] font-bold text-slate-400">
                          {cellItems.length}
                        </span>
                      )}
                    </div>

                    {/* Dot badges */}
                    <div className="flex items-center gap-1 flex-wrap overflow-hidden max-h-6">
                      {cellItems.slice(0, 3).map((it) => (
                        <span
                          key={it.id}
                          className={`w-1.5 h-1.5 rounded-full ${getItemColorDot(it)}`}
                          title={`${it.title}`}
                        />
                      ))}
                      {cellItems.length > 3 && (
                        <span className="text-[9px] text-slate-500 font-bold">+</span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Hint to jump to day view */}
            <div className="pt-2 flex items-center justify-between text-xs text-slate-400">
              <span>💡 Hacé clic en cualquier fecha para ver y editar sus fichas a la derecha.</span>
              <button
                type="button"
                onClick={() => setViewMode('day')}
                className="font-bold text-blue-400 hover:underline flex items-center gap-1"
              >
                Abrir vista por Día (Google Calendar) →
              </button>
            </div>
          </div>

          {/* Day Detail Sidebar (1 col) */}
          <div className="bg-[#1E293B]/70 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div>
                  <h3 className="text-sm font-bold text-white">Fichas del Día</h3>
                  <p className="text-xs text-slate-400">{selectedDateStr}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setViewMode('day')}
                  className="px-2.5 py-1 rounded-xl text-xs font-bold bg-blue-600/30 text-blue-300 border border-blue-500/40 hover:bg-blue-600/40 transition-all flex items-center gap-1"
                >
                  <span>Ver en Día</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>

              {dayItems.length === 0 ? (
                <div className="text-center py-12 space-y-2">
                  <div className="text-2xl">🌱</div>
                  <p className="text-xs text-slate-400">
                    No hay compromisos ni bloques para esta fecha.
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5 mt-4 max-h-[380px] overflow-y-auto pr-1">
                  {dayItems.map((it) => {
                    const cfg = typeConfig[it.type] || typeConfig.task;
                    const isDone =
                      it.status === 'completed' || it.status === 'done' || it.isCompleted;

                    return (
                      <div
                        key={it.id}
                        onClick={() => handleOpenFicha(it)}
                        className={`p-3 rounded-xl border ${getItemBadgeBg(
                          it
                        )} flex items-start justify-between gap-2 cursor-pointer hover:ring-2 hover:ring-purple-400/50 hover:scale-[1.01] transition-all group`}
                      >
                        <div className="space-y-1 flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs">{cfg.badge}</span>
                            <span
                              className={`text-xs font-bold tracking-tight truncate ${
                                isDone ? 'line-through text-slate-400' : 'text-white'
                              }`}
                            >
                              {it.title}
                            </span>
                          </div>
                          {it.subtitle && (
                            <p className="text-[11px] text-slate-300 line-clamp-1">
                              {it.subtitle}
                            </p>
                          )}
                          <div className="flex items-center gap-2 text-[10px] text-slate-400">
                            <span>{cfg.label}</span>
                            {(it.startTime || it.time) && (
                              <span className="flex items-center gap-0.5 font-mono text-purple-300">
                                <Clock className="w-3 h-3" />
                                {it.startTime ? `${it.startTime} ─ ${it.endTime}` : it.time}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          {it.amount !== undefined && (
                            <span
                              className={`text-xs font-bold ${
                                it.type === 'pending_income'
                                ? 'text-emerald-400'
                                : 'text-rose-400'
                              }`}
                            >
                              {it.type === 'pending_income' ? '+' : '-'}
                              {it.amount} €
                            </span>
                          )}

                          <button
                            type="button"
                            onClick={(e) => handleQuickToggleCompleted(e, it)}
                            className={`p-1 rounded-lg border transition-all ${
                              isDone
                                ? 'bg-emerald-500 text-white border-emerald-400'
                                : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white hover:bg-slate-700'
                            }`}
                            title={isDone ? 'Marcar pendiente' : 'Marcar listo'}
                          >
                            <Check className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="pt-3 border-t border-slate-800 flex items-center gap-2">
              <button
                onClick={() => setIsNewBlockModalOpen(true)}
                className="flex-1 py-2 rounded-xl text-xs font-bold bg-purple-600/30 hover:bg-purple-600/40 text-purple-300 border border-purple-500/30 transition-all text-center"
              >
                + Bloque
              </button>
              {onOpenNewTask && (
                <button
                  onClick={onOpenNewTask}
                  className="flex-1 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 transition-all text-center"
                >
                  + Tarea
                </button>
              )}
              {onOpenNewPostIt && (
                <button
                  onClick={onOpenNewPostIt}
                  className="flex-1 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 transition-all text-center"
                >
                  + Post-It
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. AGENDA VIEW (CHRONOLOGICAL TIMELINE LIST) */}
      {/* ========================================================================= */}
      {viewMode === 'agenda' && (
        <div className="bg-[#1E293B]/70 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white">Agenda Cronológica Unificada</h2>
            <span className="text-xs text-slate-400">{filteredItems.length} registros</span>
          </div>

          <div className="space-y-3">
            {filteredItems
              .sort((a, b) => a.date.localeCompare(b.date))
              .map((it) => {
                const cfg = typeConfig[it.type] || typeConfig.task;
                const isDone =
                  it.status === 'completed' || it.status === 'done' || it.isCompleted;

                return (
                  <div
                    key={it.id}
                    onClick={() => handleOpenFicha(it)}
                    className={`p-3.5 rounded-2xl border ${getItemBadgeBg(
                      it
                    )} flex items-center justify-between gap-3 cursor-pointer hover:ring-2 hover:ring-purple-400/50 hover:scale-[1.008] transition-all group`}
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="text-center px-2 py-1 bg-slate-900/60 rounded-xl border border-slate-800 shrink-0">
                        <div className="text-[10px] text-slate-400">{it.date.slice(5, 7)}</div>
                        <div className="text-sm font-bold text-white">{it.date.slice(8, 10)}</div>
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm">{cfg.badge}</span>
                          <span
                            className={`text-sm font-bold truncate ${
                              isDone ? 'line-through text-slate-400' : 'text-white'
                            }`}
                          >
                            {it.title}
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
                            {cfg.label}
                          </span>
                          {(it.startTime || it.time) && (
                            <span className="font-mono text-xs text-purple-300">
                              {it.startTime ? `${it.startTime} ─ ${it.endTime}` : it.time}
                            </span>
                          )}
                        </div>
                        {it.subtitle && (
                          <p className="text-xs text-slate-400 mt-0.5 truncate">{it.subtitle}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 shrink-0">
                      {it.amount !== undefined && (
                        <span
                          className={`text-sm font-bold ${
                            it.type === 'pending_income'
                              ? 'text-emerald-400'
                              : 'text-rose-400'
                          }`}
                        >
                          {it.type === 'pending_income' ? '+' : '-'}
                          {it.amount} €
                        </span>
                      )}

                      <button
                        type="button"
                        onClick={(e) => handleQuickToggleCompleted(e, it)}
                        className={`px-2.5 py-1 rounded-xl text-xs font-bold border transition-all ${
                          isDone
                            ? 'bg-emerald-500 text-white border-emerald-400'
                            : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white hover:bg-slate-700'
                        }`}
                      >
                        {isDone ? '✓ Listo' : 'Marcar'}
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenFicha(it);
                        }}
                        className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 hover:text-white transition-all border border-slate-700"
                        title="Modificar Ficha"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* FICHA DETALLADA / MODAL DE EDICIÓN DE CUALQUIER FICHA */}
      {/* ========================================================================= */}
      {selectedItemForEdit && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-[#1E293B] border border-slate-700 w-full max-w-lg rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4 my-8 relative">
            {/* Header */}
            <div className="flex items-start justify-between pb-3 border-b border-slate-800 gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-purple-600/20 border border-purple-500/40 flex items-center justify-center text-xl text-purple-300 shadow-md">
                  {typeConfig[selectedItemForEdit.type]?.badge || '⏱️'}
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-base sm:text-lg font-bold text-white">
                      Ficha del Calendario
                    </h3>
                    <span
                      className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md border ${getItemBadgeBg(
                        selectedItemForEdit
                      )}`}
                    >
                      {typeConfig[selectedItemForEdit.type]?.label || selectedItemForEdit.type}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Modificá el horario, cambiá el estado o agregá notas de avance.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedItemForEdit(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-xl bg-slate-800/80 hover:bg-slate-700 transition-all border border-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveFicha} className="space-y-4">
              {/* ESTADO: ¿YA ESTÁ LISTO O NO? (Very prominent) */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
                  ¿Ya está listo o en qué estado se encuentra?
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    {
                      id: 'pending',
                      label: 'Pendiente',
                      icon: '⏳',
                      activeBg: 'bg-amber-500/20 border-amber-500/60 text-amber-300 ring-2 ring-amber-500/30',
                    },
                    {
                      id: 'in_progress',
                      label: 'En curso',
                      icon: '⏱️',
                      activeBg: 'bg-purple-500/20 border-purple-500/60 text-purple-300 ring-2 ring-purple-500/30',
                    },
                    {
                      id: 'completed',
                      label: '¡Listo!',
                      icon: '✅',
                      activeBg: 'bg-emerald-500/30 border-emerald-500/70 text-emerald-300 ring-2 ring-emerald-500/40 font-black',
                    },
                    {
                      id: 'cancelled',
                      label: 'Cancelado',
                      icon: '❌',
                      activeBg: 'bg-rose-500/20 border-rose-500/60 text-rose-300 ring-2 ring-rose-500/30',
                    },
                  ].map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setEditStatus(s.id as TimeBlockStatus)}
                      className={`py-2 px-2 rounded-xl border text-xs font-bold flex flex-col items-center justify-center gap-1 transition-all ${
                        editStatus === s.id
                          ? s.activeBg
                          : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
                      }`}
                    >
                      <span className="text-base">{s.icon}</span>
                      <span>{s.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* TÍTULO */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Título de la Ficha
                </label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs font-medium focus:border-purple-500 outline-none transition-colors"
                  required
                />
              </div>

              {/* FECHA Y HORARIO */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Fecha</label>
                  <input
                    type="date"
                    value={editDate}
                    onChange={(e) => setEditDate(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-white text-xs font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Hora Inicio
                  </label>
                  <input
                    type="time"
                    value={editStartTime}
                    onChange={(e) => setEditStartTime(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-white text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Hora Fin</label>
                  <input
                    type="time"
                    value={editEndTime}
                    onChange={(e) => setEditEndTime(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-white text-xs font-mono"
                  />
                </div>
              </div>

              {/* QUICK TIME ADJUSTMENT BUTTONS */}
              <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                <span className="text-[11px] text-slate-400 font-semibold mr-1">
                  Ajustar duración:
                </span>
                <button
                  type="button"
                  onClick={() => setEditEndTime(addMinutesToTime(editEndTime, -15))}
                  className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-bold border border-slate-700"
                >
                  -15 min
                </button>
                <button
                  type="button"
                  onClick={() => setEditEndTime(addMinutesToTime(editEndTime, 15))}
                  className="px-2 py-1 rounded-lg bg-purple-600/30 hover:bg-purple-600/40 text-purple-300 text-[11px] font-bold border border-purple-500/40"
                >
                  +15 min
                </button>
                <button
                  type="button"
                  onClick={() => setEditEndTime(addMinutesToTime(editEndTime, 30))}
                  className="px-2 py-1 rounded-lg bg-purple-600/30 hover:bg-purple-600/40 text-purple-300 text-[11px] font-bold border border-purple-500/40"
                >
                  +30 min
                </button>
                <button
                  type="button"
                  onClick={() => setEditEndTime(addMinutesToTime(editEndTime, 60))}
                  className="px-2 py-1 rounded-lg bg-purple-600/30 hover:bg-purple-600/40 text-purple-300 text-[11px] font-bold border border-purple-500/40"
                >
                  +1 hora
                </button>
              </div>

              {/* ÁREA / COLOR (Only for time blocks or editable cards) */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Área / Color Asignado
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {Object.entries(AREA_CONFIG).map(([k, cfg]) => (
                    <button
                      key={k}
                      type="button"
                      onClick={() => setEditArea(k as TimeBlockArea)}
                      className={`p-2 rounded-xl text-left border text-xs font-bold flex items-center gap-1.5 transition-all ${
                        editArea === k
                          ? `${cfg.badgeBg} ring-2 ring-white/30 shadow-sm`
                          : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      <span>{cfg.dot}</span>
                      <span className="truncate">{cfg.label.split('/')[0]}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* OBJETIVO / DETALLE */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Objetivo o Detalle Concreto
                </label>
                <textarea
                  value={editObjective}
                  onChange={(e) => setEditObjective(e.target.value)}
                  placeholder="¿Cuál es el foco específico de este bloque?"
                  rows={2}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs outline-none focus:border-purple-500"
                />
              </div>

              {/* NOTAS DE RESULTADO (cuando se completa o avanza) */}
              <div>
                <label className="block text-xs font-semibold text-emerald-400 mb-1 flex items-center justify-between">
                  <span>Notas de Resultado / Logros</span>
                  <span className="text-[10px] text-slate-500 font-normal">
                    (Se guarda en el historial)
                  </span>
                </label>
                <textarea
                  value={editResultNotes}
                  onChange={(e) => setEditResultNotes(e.target.value)}
                  placeholder="Ej: 15 comercios contactados, 3 llamadas agendadas..."
                  rows={2}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs outline-none focus:border-emerald-500"
                />
              </div>

              {/* ACCIONES DEL MODAL */}
              <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-800">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleDeleteFromFicha}
                    disabled={isSaving}
                    className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 transition-all text-xs font-bold flex items-center gap-1.5"
                    title="Eliminar esta ficha del calendario"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Eliminar</span>
                  </button>

                  <a
                    href={getGoogleCalendarUrl(selectedItemForEdit)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-xl bg-blue-500/15 hover:bg-blue-500/25 text-blue-300 border border-blue-500/30 transition-all text-xs font-bold flex items-center gap-1.5"
                    title="Abrir o sincronizar en Google Calendar"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Google Calendar</span>
                  </a>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedItemForEdit(null)}
                    disabled={isSaving}
                    className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 text-slate-300 hover:bg-slate-700 transition-all border border-slate-700"
                  >
                    Cancelar
                  </button>

                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-5 py-2 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white transition-all shadow-lg flex items-center gap-1.5 disabled:opacity-50"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{isSaving ? 'Guardando...' : 'Guardar Cambios'}</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* QUICK NEW BLOCK MODAL */}
      {/* ========================================================================= */}
      {isNewBlockModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-[#1E293B] border border-slate-700 w-full max-w-md rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="text-xl">⏱️</span>
                <h3 className="text-base font-bold text-white">Nuevo Bloque de Tiempo</h3>
              </div>
              <button
                onClick={() => setIsNewBlockModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateBlock} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Fecha del Bloque
                </label>
                <input
                  type="date"
                  value={selectedDateStr}
                  onChange={(e) => setSelectedDateStr(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Hora Inicio
                  </label>
                  <input
                    type="time"
                    value={newBlockStart}
                    onChange={(e) => setNewBlockStart(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Hora Fin
                  </label>
                  <input
                    type="time"
                    value={newBlockEnd}
                    onChange={(e) => setNewBlockEnd(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs font-mono"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Área / Color
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {Object.entries(AREA_CONFIG).map(([k, cfg]) => (
                    <button
                      key={k}
                      type="button"
                      onClick={() => setNewBlockArea(k as TimeBlockArea)}
                      className={`p-2 rounded-xl text-left border text-xs font-bold flex items-center gap-1.5 transition-all ${
                        newBlockArea === k
                          ? `${cfg.badgeBg} ring-2 ring-white/20`
                          : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      <span>{cfg.dot}</span>
                      <span className="truncate">{cfg.label.split('/')[0]}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Título del Bloque
                </label>
                <input
                  type="text"
                  placeholder="Ej. CREKO — Captación de Comercios"
                  value={newBlockTitle}
                  onChange={(e) => setNewBlockTitle(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Objetivo concreto del bloque
                </label>
                <textarea
                  placeholder="¿Qué vas a conseguir en estos minutos?"
                  value={newBlockObjective}
                  onChange={(e) => setNewBlockObjective(e.target.value)}
                  rows={2}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsNewBlockModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 text-slate-300 hover:bg-slate-700 transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white transition-all shadow-lg"
                >
                  Crear Bloque
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
