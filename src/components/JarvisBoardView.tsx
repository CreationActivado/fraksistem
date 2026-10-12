import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Pin,
  Plus,
  Search,
  Filter,
  Sparkles,
  ArrowRight,
  CheckSquare,
  Square,
  Calendar,
  Clock,
  Euro,
  Folder,
  Trash2,
  Edit2,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Info,
  Layers,
  Wand2,
  Check,
  GripVertical,
} from 'lucide-react';
import { PostIt, PostItColorPriority, Project } from '../types';
import { VisualTrashBin } from './VisualTrashBin';
import { soundFX } from '../utils/soundEffects';

interface JarvisBoardViewProps {
  postits: PostIt[];
  projects: Project[];
  onOpenNewPostIt: () => void;
  onEditPostIt: (postIt: PostIt) => void;
  onDeletePostIt: (id: string) => Promise<void>;
  onToggleChecklist: (postItId: string, itemId: string) => Promise<void>;
  onConvertToTask: (id: string) => Promise<void>;
  onOpenNewTransactionWithPostIt?: (postIt: PostIt) => void;
  onRefreshData: () => void;
  onQuickCreatePostIt: (data: { title: string; colorPriority: PostItColorPriority; moneyAmount?: number; projectId?: string }) => Promise<void>;
  onUpdatePostItInline?: (id: string, updates: Partial<PostIt>) => Promise<void>;
  onTrashPostIt: (id: string, reason?: 'completed' | 'discarded') => Promise<void>;
  onRestorePostIt: (id: string) => Promise<void>;
  onEmptyTrash: () => Promise<void>;
}

export const JarvisBoardView: React.FC<JarvisBoardViewProps> = ({
  postits,
  projects,
  onOpenNewPostIt,
  onEditPostIt,
  onDeletePostIt,
  onToggleChecklist,
  onConvertToTask,
  onOpenNewTransactionWithPostIt,
  onRefreshData,
  onQuickCreatePostIt,
  onUpdatePostItInline,
  onTrashPostIt,
  onRestorePostIt,
  onEmptyTrash,
}) => {
  const [selectedColor, setSelectedColor] = useState<string>('all');
  const [selectedProject, setSelectedProject] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showPinnedOnly, setShowPinnedOnly] = useState(false);
  const [isCleanUpMode, setIsCleanUpMode] = useState(false);
  const [quickInput, setQuickInput] = useState('');
  const [quickColor, setQuickColor] = useState<PostItColorPriority>('purple');
  const [isSubmittingQuick, setIsSubmittingQuick] = useState(false);
  const [draggingPostItId, setDraggingPostItId] = useState<string | null>(null);

  // Dynamic quick placeholders tailored to user projects & categories
  const quickPlaceholders: Record<PostItColorPriority, string> = {
    purple: "🟣 Creko: ej. 'Cerrar presupuesto rotulación local' o 'Diseñar remeras'...",
    orange: "🟠 Burger Palusa: ej. 'Diseño packaging, indumentaria o pantallas'...",
    blue: "🔵 Sowfts: ej. 'Desarrollar feature en software o web cliente'...",
    red: "🔴 Urgencias: ej. 'Cobrar 180 € a Josu hoy antes de las 18:00'...",
    yellow: "🟡 Título Libre: completá el título o recordatorio libre que quieras...",
    green: "🟢 Metas & Ocio: ej. 'Meditar 3 veces por semana' o 'Meta de 500 € en un mes'...",
  };

  // Separate active vs trashed post-its
  const activePostIts = useMemo(() => {
    return postits.filter((p) => p.status === 'active');
  }, [postits]);

  const trashedPostIts = useMemo(() => {
    return postits.filter((p) => p.status === 'trashed' || p.status === 'completed');
  }, [postits]);

  // Filter post-its
  const filteredPostIts = useMemo(() => {
    return activePostIts.filter((p) => {
      if (selectedColor !== 'all' && p.colorPriority !== selectedColor) return false;
      if (selectedProject !== 'all' && (p.projectId || '') !== selectedProject) return false;
      if (showPinnedOnly && !p.isPinned) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = p.title.toLowerCase().includes(q);
        const matchesDesc = (p.description || '').toLowerCase().includes(q);
        const matchesContact = (p.contactName || '').toLowerCase().includes(q);
        if (!matchesTitle && !matchesDesc && !matchesContact) return false;
      }
      return true;
    });
  }, [activePostIts, selectedColor, selectedProject, showPinnedOnly, searchQuery]);

  // Clean-up Analysis
  const cleanupStats = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const overdue = postits.filter((p) => p.status === 'active' && p.date && p.date < today);
    const withMoney = postits.filter((p) => p.status === 'active' && p.moneyAmount && !p.convertedTo);
    const redUrgent = postits.filter((p) => p.status === 'active' && p.colorPriority === 'red');
    const withoutProject = postits.filter((p) => p.status === 'active' && !p.projectId);

    return {
      total: postits.filter((p) => p.status === 'active').length,
      overdue,
      withMoney,
      redUrgent,
      withoutProject,
    };
  }, [postits]);

  // Handle Quick Add Submit
  const handleQuickAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickInput.trim()) return;

    // Detect money in text like "180 €" or "180 euros"
    const amtMatch = quickInput.match(/(\d+(?:[.,]\d+)?)\s*(?:€|euros)?/i);
    const hasMoney = amtMatch && /cobrar|debe|pagar|comprar|gasto|importe|meta/i.test(quickInput);
    const moneyAmount = hasMoney && amtMatch ? parseFloat(amtMatch[1].replace(',', '.')) : undefined;

    // Auto-link project by selected color
    let assignedProjectId: string | undefined = undefined;
    if (quickColor === 'purple') {
      const creko = projects.find((pr) => pr.id === 'proj_creko' || /creko/i.test(pr.name));
      assignedProjectId = creko?.id || 'proj_creko';
    } else if (quickColor === 'orange') {
      const bp = projects.find((pr) => pr.id === 'proj_burger_palusa' || /burger/i.test(pr.name));
      assignedProjectId = bp?.id || 'proj_burger_palusa';
    } else if (quickColor === 'blue') {
      const sw = projects.find((pr) => pr.id === 'proj_soft_desarrollo' || /soft|sowft/i.test(pr.name));
      assignedProjectId = sw?.id || 'proj_soft_desarrollo';
    }

    setIsSubmittingQuick(true);
    try {
      await onQuickCreatePostIt({
        title: quickInput.trim(),
        colorPriority: quickColor,
        moneyAmount,
        projectId: assignedProjectId,
      });
      setQuickInput('');
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmittingQuick(false);
    }
  };

  // Color Styles Configuration (Visual Post-it feeling)
  const colorStyles: Record<
    PostItColorPriority,
    {
      bg: string;
      headerBg: string;
      border: string;
      accent: string;
      badgeText: string;
      badgeDot: string;
      label: string;
      emoji: string;
      description: string;
    }
  > = {
    purple: {
      bg: 'bg-[#22132e]',
      headerBg: 'bg-purple-950/70 border-b border-purple-800/50',
      border: 'border-purple-600/60 shadow-[0_8px_25px_rgba(168,85,247,0.16)]',
      accent: 'text-purple-400',
      badgeText: 'text-purple-300 bg-purple-500/20 border-purple-500/40',
      badgeDot: 'bg-purple-500',
      label: 'Creko',
      emoji: '🟣',
      description: 'Merch, cartelería & diseño',
    },
    orange: {
      bg: 'bg-[#2B1D12]',
      headerBg: 'bg-amber-950/70 border-b border-amber-800/50',
      border: 'border-amber-600/60 shadow-[0_8px_25px_rgba(245,158,11,0.16)]',
      accent: 'text-amber-400',
      badgeText: 'text-amber-300 bg-amber-500/20 border-amber-500/40',
      badgeDot: 'bg-amber-500',
      label: 'Burger Palusa',
      emoji: '🟠',
      description: 'Gastronomía & pantallas',
    },
    blue: {
      bg: 'bg-[#142334]',
      headerBg: 'bg-sky-950/70 border-b border-sky-800/50',
      border: 'border-sky-600/60 shadow-[0_8px_25px_rgba(14,165,233,0.16)]',
      accent: 'text-sky-400',
      badgeText: 'text-sky-300 bg-sky-500/20 border-sky-500/40',
      badgeDot: 'bg-sky-500',
      label: 'Sowfts (Software)',
      emoji: '🔵',
      description: 'Software & sistemas',
    },
    red: {
      bg: 'bg-[#2A171D]',
      headerBg: 'bg-rose-950/70 border-b border-rose-800/50',
      border: 'border-rose-600/60 shadow-[0_8px_25px_rgba(244,63,94,0.16)]',
      accent: 'text-rose-400',
      badgeText: 'text-rose-300 bg-rose-500/20 border-rose-500/40',
      badgeDot: 'bg-rose-500',
      label: 'Urgencias',
      emoji: '🔴',
      description: 'Crítico / Inmediato',
    },
    yellow: {
      bg: 'bg-[#262414]',
      headerBg: 'bg-yellow-950/70 border-b border-yellow-800/50',
      border: 'border-yellow-600/60 shadow-[0_8px_25px_rgba(234,179,8,0.16)]',
      accent: 'text-yellow-400',
      badgeText: 'text-yellow-300 bg-yellow-500/20 border-yellow-500/40',
      badgeDot: 'bg-yellow-500',
      label: 'Título Libre',
      emoji: '🟡',
      description: 'Personalizado / Cualquier nota',
    },
    green: {
      bg: 'bg-[#13261D]',
      headerBg: 'bg-emerald-950/70 border-b border-emerald-800/50',
      border: 'border-emerald-600/60 shadow-[0_8px_25px_rgba(16,185,129,0.16)]',
      accent: 'text-emerald-400',
      badgeText: 'text-emerald-300 bg-emerald-500/20 border-emerald-500/40',
      badgeDot: 'bg-emerald-500',
      label: 'Metas & Ocio',
      emoji: '🟢',
      description: 'Hábitos, meditar, 500€/mes & ocio',
    },
  };

  return (
    <div className="space-y-6 pb-24 max-w-full overflow-x-hidden">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-[#1E293B] to-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-yellow-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="text-2xl">📝</span>
              <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                Tablero JARVIS: Post-Its Inteligentes
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-yellow-500/20 text-yellow-300 border border-yellow-500/30">
                {activePostIts.length} activos
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-800/90 text-slate-300 border border-slate-700 flex items-center gap-1.5">
                <Trash2 className="w-3.5 h-3.5 text-amber-400" />
                <span>{trashedPostIts.length} en el tacho</span>
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-400">
              Captura inmediata, priorización visual por colores, tacho de basura interactivo y conexión con Finanzas y Tareas.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Clean-up Mode Toggle */}
            <button
              onClick={() => setIsCleanUpMode(!isCleanUpMode)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
                isCleanUpMode
                  ? 'bg-purple-600 text-white border-purple-400 shadow-lg shadow-purple-600/30 ring-2 ring-purple-400/40'
                  : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 border-slate-700'
              }`}
              id="btn-board-cleanup-mode"
            >
              <Wand2 className="w-3.5 h-3.5" />
              <span>{isCleanUpMode ? 'Salir de Limpieza' : 'Modo Limpieza'}</span>
            </button>

            {/* New Post-It Modal Button */}
            <button
              onClick={onOpenNewPostIt}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/25 active:scale-95 transition-all"
              id="btn-board-new-postit"
            >
              <Plus className="w-4 h-4" />
              <span>Nuevo Post-It</span>
            </button>
          </div>
        </div>

        {/* Clean-up Intelligence Diagnostic Panel */}
        {isCleanUpMode && (
          <div className="mt-5 pt-4 border-t border-slate-800/80 bg-slate-950/60 -mx-6 -mb-6 p-6 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Diagnóstico del Asistente (Modo Limpieza Activo)
                </span>
              </div>
              <span className="text-xs text-purple-300 font-medium">
                Regla: Eliminar ruido para mantener foco
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="bg-slate-900/90 border border-slate-800 p-2.5 rounded-xl">
                <div className="text-[11px] text-slate-400">🔴 Críticos activos</div>
                <div className="text-lg font-bold text-rose-400">{cleanupStats.redUrgent.length}</div>
              </div>
              <div className="bg-slate-900/90 border border-slate-800 p-2.5 rounded-xl">
                <div className="text-[11px] text-slate-400">💰 Involucran dinero</div>
                <div className="text-lg font-bold text-emerald-400">{cleanupStats.withMoney.length}</div>
              </div>
              <div className="bg-slate-900/90 border border-slate-800 p-2.5 rounded-xl">
                <div className="text-[11px] text-slate-400">⚠️ Vencidos</div>
                <div className="text-lg font-bold text-amber-400">{cleanupStats.overdue.length}</div>
              </div>
              <div className="bg-slate-900/90 border border-slate-800 p-2.5 rounded-xl">
                <div className="text-[11px] text-slate-400">📁 Sin proyecto asignado</div>
                <div className="text-lg font-bold text-sky-400">{cleanupStats.withoutProject.length}</div>
              </div>
            </div>

            {cleanupStats.withMoney.length > 0 && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-300 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Euro className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>
                    Tenés <strong>{cleanupStats.withMoney.length}</strong> post-it(s) con importe financiero esperando ser transferidos a Tareas o Finanzas.
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Quick Input Bar (2-Second Capture) */}
      <div className="space-y-2">
        <form
          onSubmit={handleQuickAdd}
          className="bg-slate-900/90 border border-slate-800 rounded-2xl p-2.5 sm:p-3 flex flex-col sm:flex-row items-center gap-2.5 shadow-md"
        >
          <div className="flex items-center gap-1.5 shrink-0 select-none">
            {/* Quick Color Selector */}
            {(['purple', 'orange', 'blue', 'red', 'yellow', 'green'] as PostItColorPriority[]).map((c) => {
              const style = colorStyles[c];
              return (
                <button
                  key={c}
                  type="button"
                  onClick={() => setQuickColor(c)}
                  className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all shrink-0 ${
                    quickColor === c
                      ? 'ring-2 ring-white scale-110 shadow-lg font-bold'
                      : 'opacity-70 hover:opacity-100 hover:scale-105'
                  } ${
                    c === 'purple'
                      ? 'bg-purple-600 text-white'
                      : c === 'orange'
                      ? 'bg-amber-500 text-white'
                      : c === 'blue'
                      ? 'bg-sky-500 text-white'
                      : c === 'red'
                      ? 'bg-rose-500 text-white'
                      : c === 'yellow'
                      ? 'bg-yellow-500 text-slate-950'
                      : 'bg-emerald-500 text-white'
                  }`}
                  title={`${style.emoji} ${style.label}: ${style.description}`}
                >
                  {quickColor === c ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <span className="text-xs">{style.emoji}</span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="flex-1 w-full relative">
            <input
              type="text"
              value={quickInput}
              onChange={(e) => setQuickInput(e.target.value)}
              placeholder={quickPlaceholders[quickColor]}
              className="w-full bg-slate-950/80 border border-slate-700/80 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-medium"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmittingQuick || !quickInput.trim()}
            className="w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-md transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
          >
            {isSubmittingQuick ? 'Pegando...' : 'Pegar Post-It'}
          </button>
        </form>

        {/* Color Legend Quick Reference - cleanly wraps with zero scrollbars */}
        <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-slate-400 px-1">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider shrink-0 mr-1">
            Categorías:
          </span>
          {(['purple', 'orange', 'blue', 'red', 'yellow', 'green'] as PostItColorPriority[]).map((c) => {
            const style = colorStyles[c];
            const isSelected = quickColor === c;
            return (
              <button
                key={c}
                type="button"
                onClick={() => setQuickColor(c)}
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg border text-[11px] font-medium transition-all shrink-0 ${
                  isSelected
                    ? `${style.badgeText} ring-1 ring-white/20 font-bold scale-105`
                    : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-slate-200'
                }`}
              >
                <span>{style.emoji}</span>
                <span>{style.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-900/50 p-2.5 rounded-2xl border border-slate-800 text-xs">
        {/* Color Filters without ugly browser scrollbars */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar scrollbar-none py-1 select-none">
          <button
            onClick={() => setSelectedColor('all')}
            className={`px-3 py-1.5 rounded-xl font-medium transition-all whitespace-nowrap ${
              selectedColor === 'all'
                ? 'bg-slate-700 text-white font-semibold'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            Todos ({postits.filter((p) => p.status === 'active').length})
          </button>
          {(['purple', 'orange', 'blue', 'red', 'yellow', 'green'] as PostItColorPriority[]).map((c) => {
            const count = postits.filter((p) => p.status === 'active' && p.colorPriority === c).length;
            const style = colorStyles[c];
            return (
              <button
                key={c}
                onClick={() => setSelectedColor(c)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl font-medium transition-all whitespace-nowrap border ${
                  selectedColor === c
                    ? `${style.badgeText} font-semibold ring-1 ring-white/20`
                    : 'text-slate-400 border-transparent hover:bg-slate-800'
                }`}
              >
                <span>{style.emoji}</span>
                <span>{style.label}</span>
                <span className="opacity-70 text-[10px]">({count})</span>
              </button>
            );
          })}
        </div>

        {/* Search & Pinned Filter */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-48">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar..."
              className="w-full bg-slate-950/80 border border-slate-700/80 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          <button
            onClick={() => setShowPinnedOnly(!showPinnedOnly)}
            className={`p-1.5 rounded-xl border transition-all ${
              showPinnedOnly
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                : 'text-slate-400 hover:text-white border-slate-700 hover:bg-slate-800'
            }`}
            title="Solo post-its fijados con pin"
          >
            <Pin className={`w-4 h-4 ${showPinnedOnly ? 'fill-amber-400 rotate-45' : ''}`} />
          </button>
        </div>
      </div>

      {/* Main Board Workspace Grid with Visual Trash Station */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 items-start">
        {/* Post-it Cards Grid (3 Columns on Large Screens) */}
        <div className="xl:col-span-3 space-y-4">
          {filteredPostIts.length === 0 ? (
            <div className="text-center py-16 bg-slate-900/30 border border-dashed border-slate-800 rounded-3xl p-8 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center mx-auto text-slate-400 text-xl">
                📝
              </div>
              <h3 className="text-sm font-semibold text-white">No hay post-its activos en esta vista</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Pegá una nota con la barra superior para capturar tareas, cobros o ideas. A medida que las completes, podés arrastrarlas al tacho de basura.
              </p>
              <button
                onClick={onOpenNewPostIt}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-md inline-flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Crear Primer Post-It</span>
              </button>
            </div>
          ) : (
            <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <AnimatePresence>
                {filteredPostIts.map((p) => {
                  const style = colorStyles[p.colorPriority] || colorStyles.yellow;
                  const project = projects.find((pr) => pr.id === p.projectId);
                  const isOverdue = p.date && p.date < new Date().toISOString().split('T')[0];
                  const isBeingDragged = draggingPostItId === p.id;

                  return (
                    <motion.div
                      key={p.id}
                      layout
                      initial={{ opacity: 0, scale: 0.9, y: 15 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{
                        opacity: 0,
                        scale: 0.2,
                        rotate: 20,
                        y: 50,
                        transition: { duration: 0.25 },
                      }}
                      draggable={true}
                      onDragStart={(e) => {
                        e.dataTransfer.setData('text/plain', p.id);
                        e.dataTransfer.effectAllowed = 'move';
                        setDraggingPostItId(p.id);
                      }}
                      onDragEnd={() => setDraggingPostItId(null)}
                      className={`group rounded-2xl border ${style.border} ${style.bg} flex flex-col justify-between transition-all duration-200 hover:-translate-y-1 relative overflow-hidden cursor-grab active:cursor-grabbing select-none ${
                        isBeingDragged ? 'opacity-40 scale-95 border-amber-400 border-dashed' : ''
                      }`}
                    >
                      {/* Top Action Bar: Grip Handle & Pin Marker */}
                      <div className="absolute top-2.5 right-2.5 flex items-center gap-1 z-10">
                        {/* Drag Handle Indicator */}
                        <div
                          className="p-1 text-slate-400 hover:text-slate-200 cursor-grab active:cursor-grabbing"
                          title="Arrastrá al tacho de basura"
                        >
                          <GripVertical className="w-3.5 h-3.5" />
                        </div>

                        {/* Pin */}
                        <button
                          onClick={async () => {
                            if (onUpdatePostItInline) {
                              await onUpdatePostItInline(p.id, { isPinned: !p.isPinned });
                            }
                          }}
                          className={`p-1 rounded-md transition-all ${
                            p.isPinned
                              ? 'text-amber-400 hover:text-amber-300'
                              : 'text-slate-500 opacity-0 group-hover:opacity-100 hover:text-slate-300'
                          }`}
                          title={p.isPinned ? 'Desfijar' : 'Fijar con pin'}
                        >
                          <Pin className={`w-3.5 h-3.5 ${p.isPinned ? 'fill-amber-400 rotate-45' : ''}`} />
                        </button>
                      </div>

                      {/* Card Header with Color Pill & Date */}
                      <div className={`px-4 py-2.5 ${style.headerBg} flex items-center justify-between`}>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs">{style.emoji}</span>
                          <span className="text-[11px] font-bold tracking-tight text-white/90">
                            {style.label}
                          </span>
                        </div>

                        {p.date && (
                          <div
                            className={`flex items-center gap-1 text-[11px] font-medium ${
                              isOverdue ? 'text-rose-400 font-bold' : 'text-slate-400'
                            }`}
                          >
                            <Calendar className="w-3 h-3" />
                            <span>{p.date}</span>
                          </div>
                        )}
                      </div>

                      {/* Card Body */}
                      <div className="p-4 space-y-3 flex-1">
                        {/* Title */}
                        <h3 className="text-sm font-bold text-white tracking-tight leading-snug">
                          {p.title}
                        </h3>

                        {/* Description */}
                        {p.description && (
                          <p className="text-xs text-slate-300/90 line-clamp-3 leading-relaxed">
                            {p.description}
                          </p>
                        )}

                        {/* Checklist if present */}
                        {p.checklist && p.checklist.length > 0 && (
                          <div className="pt-2 border-t border-white/5 space-y-1.5">
                            {p.checklist.map((item) => (
                              <div
                                key={item.id}
                                onClick={() => onToggleChecklist(p.id, item.id)}
                                className="flex items-center gap-2 cursor-pointer group/chk text-xs"
                              >
                                {item.done ? (
                                  <CheckSquare className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                                ) : (
                                  <Square className="w-3.5 h-3.5 text-slate-500 group-hover/chk:text-white shrink-0" />
                                )}
                                <span
                                  className={`transition-all ${
                                    item.done
                                      ? 'line-through text-slate-500'
                                      : 'text-slate-300 group-hover/chk:text-white'
                                  }`}
                                >
                                  {item.text}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Metadata Tags (Money, Project, Contact) */}
                        <div className="flex items-center gap-1.5 flex-wrap pt-1">
                          {p.moneyAmount !== undefined && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm">
                              <Euro className="w-3 h-3" />
                              <span>{p.moneyAmount} €</span>
                            </span>
                          )}

                          {project && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-medium bg-blue-500/15 text-blue-300 border border-blue-500/30">
                              <Folder className="w-3 h-3" />
                              <span className="truncate max-w-[120px]">{project.name}</span>
                            </span>
                          )}

                          {p.contactName && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-medium bg-slate-800 text-slate-300 border border-slate-700">
                              <span>👤 {p.contactName}</span>
                            </span>
                          )}

                          {p.convertedTo && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                              ✓ En {p.convertedTo.type === 'task' ? 'Tareas' : 'Finanzas'}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Card Actions Footer */}
                      <div className="px-3.5 py-2.5 bg-black/25 border-t border-white/5 flex items-center justify-between text-xs gap-1.5">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {/* Dedicated Physical "Al Tacho" Action Button */}
                          <button
                            onClick={async (e) => {
                              e.stopPropagation();
                              soundFX.playTossIntoTrash();
                              await onTrashPostIt(p.id, 'completed');
                            }}
                            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/15 hover:bg-amber-500/30 text-amber-300 hover:text-amber-200 border border-amber-500/30 transition-all text-[11px] font-bold active:scale-95 shadow-sm"
                            title="Completar y tirar al tacho de basura"
                          >
                            <Trash2 className="w-3 h-3 text-amber-400" />
                            <span>Al Tacho</span>
                          </button>

                          {/* Convert to Task */}
                          {!p.convertedTo && (
                            <button
                              onClick={() => onConvertToTask(p.id)}
                              className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white transition-all text-[11px] font-medium"
                              title="Crear tarea a partir de este post-it"
                            >
                              <CheckSquare className="w-3 h-3 text-blue-400" />
                              <span>A Tarea</span>
                            </button>
                          )}

                          {/* Convert to Finance */}
                          {p.moneyAmount && onOpenNewTransactionWithPostIt && (
                            <button
                              onClick={() => onOpenNewTransactionWithPostIt(p)}
                              className="flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 transition-all text-[11px] font-medium"
                              title="Registrar cobro o gasto"
                            >
                              <Euro className="w-3 h-3" />
                              <span>Finanzas</span>
                            </button>
                          )}
                        </div>

                        <div className="flex items-center gap-1">
                          {/* Edit */}
                          <button
                            onClick={() => onEditPostIt(p)}
                            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-all"
                            title="Editar detalles"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          {/* Permanent Delete */}
                          <button
                            onClick={() => onDeletePostIt(p.id)}
                            className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-white/10 transition-all"
                            title="Eliminar permanentemente"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </motion.div>
          )}
        </div>

        {/* Visual Trash Bin Station Column */}
        <div className="xl:col-span-1 space-y-4 xl:sticky xl:top-6">
          <VisualTrashBin
            trashedPostIts={trashedPostIts}
            onTrashPostIt={onTrashPostIt}
            onRestorePostIt={onRestorePostIt}
            onEmptyTrash={onEmptyTrash}
            onPermanentDelete={onDeletePostIt}
            isDraggingOverBoard={!!draggingPostItId}
          />
        </div>
      </div>
    </div>
  );
};
