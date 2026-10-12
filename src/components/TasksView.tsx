import React, { useState, useMemo } from 'react';
import {
  CheckSquare,
  Square,
  Plus,
  Search,
  Filter,
  Calendar,
  Clock,
  Euro,
  TrendingUp,
  Folder,
  Zap,
  Edit2,
  Trash2,
  AlertCircle,
  CheckCircle2,
  ArrowUpRight,
  ShieldCheck,
} from 'lucide-react';
import { Project, Task, TaskEffort, TaskPriority } from '../types';

interface TasksViewProps {
  tasks: Task[];
  projects: Project[];
  onOpenNewTask: () => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (id: string) => Promise<void>;
  onToggleTaskStatus: (id: string) => Promise<void>;
  onQuickCreateTask: (data: { title: string; priority: TaskPriority; dueDate?: string; projectId?: string }) => Promise<void>;
  onOpenNewTransaction?: () => void;
}

export const TasksView: React.FC<TasksViewProps> = ({
  tasks,
  projects,
  onOpenNewTask,
  onEditTask,
  onDeleteTask,
  onToggleTaskStatus,
  onQuickCreateTask,
  onOpenNewTransaction,
}) => {
  const [statusFilter, setStatusFilter] = useState<'all' | 'todo' | 'in_progress' | 'done'>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [projectFilter, setProjectFilter] = useState<string>('all');
  const [financialOnly, setFinancialOnly] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [quickInput, setQuickInput] = useState('');
  const [quickPriority, setQuickPriority] = useState<TaskPriority>('medium');
  const [isSubmittingQuick, setIsSubmittingQuick] = useState(false);

  // Sorting & Filtering
  const filteredTasks = useMemo(() => {
    return tasks
      .filter((t) => {
        if (statusFilter !== 'all' && t.status !== statusFilter) return false;
        if (priorityFilter !== 'all' && t.priority !== priorityFilter) return false;
        if (projectFilter !== 'all' && (t.projectId || '') !== projectFilter) return false;
        if (financialOnly && (!t.financialImpact || t.financialImpact.type === 'neutral')) return false;
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchesTitle = t.title.toLowerCase().includes(q);
          const matchesNotes = (t.notes || '').toLowerCase().includes(q);
          if (!matchesTitle && !matchesNotes) return false;
        }
        return true;
      })
      .sort((a, b) => {
        // Uncompleted first
        if (a.status === 'done' && b.status !== 'done') return 1;
        if (a.status !== 'done' && b.status === 'done') return -1;

        // Financial income drivers first!
        const aIncome = a.financialImpact?.type === 'income_driver' ? 1 : 0;
        const bIncome = b.financialImpact?.type === 'income_driver' ? 1 : 0;
        if (aIncome !== bIncome) return bIncome - aIncome;

        // Priority weighting
        const pWeight: Record<TaskPriority, number> = { urgent: 4, high: 3, medium: 2, low: 1 };
        if (pWeight[a.priority] !== pWeight[b.priority]) {
          return pWeight[b.priority] - pWeight[a.priority];
        }

        // Due date sorting
        if (a.dueDate && b.dueDate) return a.dueDate.localeCompare(b.dueDate);
        if (a.dueDate) return -1;
        if (b.dueDate) return 1;

        return 0;
      });
  }, [tasks, statusFilter, priorityFilter, projectFilter, financialOnly, searchQuery]);

  // Statistics
  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter((t) => t.status === 'done').length;
    const pending = total - completed;
    const urgent = tasks.filter((t) => t.status !== 'done' && t.priority === 'urgent').length;
    const incomeDrivers = tasks.filter(
      (t) => t.status !== 'done' && t.financialImpact?.type === 'income_driver'
    );
    const potentialIncome = incomeDrivers.reduce(
      (sum, t) => sum + (t.financialImpact?.expectedAmount || 0),
      0
    );

    return { total, completed, pending, urgent, incomeDriversCount: incomeDrivers.length, potentialIncome };
  }, [tasks]);

  const handleQuickAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickInput.trim()) return;

    setIsSubmittingQuick(true);
    try {
      await onQuickCreateTask({
        title: quickInput.trim(),
        priority: quickPriority,
        dueDate: new Date().toISOString().split('T')[0],
      });
      setQuickInput('');
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmittingQuick(false);
    }
  };

  const priorityStyles: Record<TaskPriority, { badge: string; text: string; bg: string; border: string }> = {
    urgent: { badge: '🔴', text: 'text-rose-400', bg: 'bg-rose-500/15', border: 'border-rose-500/30' },
    high: { badge: '🟠', text: 'text-amber-400', bg: 'bg-amber-500/15', border: 'border-amber-500/30' },
    medium: { badge: '🟡', text: 'text-yellow-400', bg: 'bg-yellow-500/15', border: 'border-yellow-500/30' },
    low: { badge: '🟢', text: 'text-emerald-400', bg: 'bg-emerald-500/15', border: 'border-emerald-500/30' },
  };

  return (
    <div className="space-y-6 pb-24">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-[#1E293B] to-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl">📋</span>
              <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                Motor de Tareas & Acciones
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                {stats.pending} pendientes
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-400">
              Priorización por impacto financiero real: Primero Generación y Estabilidad.
            </p>
          </div>

          <button
            onClick={onOpenNewTask}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/25 active:scale-95 transition-all self-start md:self-auto"
            id="btn-tasks-new"
          >
            <Plus className="w-4 h-4" />
            <span>Nueva Tarea</span>
          </button>
        </div>

        {/* Quick Strategic Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-slate-800">
          <div className="bg-slate-900/80 border border-slate-800/80 p-3 rounded-2xl">
            <div className="text-[11px] text-slate-400 font-medium">Tareas Pendientes</div>
            <div className="text-xl font-bold text-white mt-0.5">{stats.pending}</div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800/80 p-3 rounded-2xl">
            <div className="text-[11px] text-rose-400 font-medium flex items-center gap-1">
              <span>🔴 Urgentes</span>
            </div>
            <div className="text-xl font-bold text-rose-400 mt-0.5">{stats.urgent}</div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800/80 p-3 rounded-2xl">
            <div className="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Generan Dinero</span>
            </div>
            <div className="text-xl font-bold text-emerald-400 mt-0.5">
              {stats.incomeDriversCount} ({stats.potentialIncome} €)
            </div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800/80 p-3 rounded-2xl">
            <div className="text-[11px] text-blue-400 font-medium">Completadas</div>
            <div className="text-xl font-bold text-blue-400 mt-0.5">{stats.completed}</div>
          </div>
        </div>
      </div>

      {/* Quick Task Capture */}
      <form
        onSubmit={handleQuickAdd}
        className="bg-slate-900/90 border border-slate-800 rounded-2xl p-2.5 sm:p-3 flex flex-col sm:flex-row items-center gap-2.5 shadow-md"
      >
        <div className="flex items-center gap-1.5">
          {(['urgent', 'high', 'medium', 'low'] as TaskPriority[]).map((p) => {
            const style = priorityStyles[p];
            return (
              <button
                key={p}
                type="button"
                onClick={() => setQuickPriority(p)}
                className={`px-2 py-1 rounded-lg text-xs border transition-all ${
                  quickPriority === p
                    ? `${style.bg} ${style.text} ${style.border} font-bold ring-1 ring-white/20`
                    : 'bg-slate-800/50 text-slate-400 border-slate-700 hover:border-slate-600'
                }`}
              >
                <span>{style.badge}</span>
              </button>
            );
          })}
        </div>

        <div className="flex-1 w-full">
          <input
            type="text"
            value={quickInput}
            onChange={(e) => setQuickInput(e.target.value)}
            placeholder="Crear tarea rápida y presionar Enter..."
            className="w-full bg-slate-950/80 border border-slate-700/80 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmittingQuick || !quickInput.trim()}
          className="w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-md transition-all active:scale-95 disabled:opacity-40 whitespace-nowrap"
        >
          {isSubmittingQuick ? 'Creando...' : 'Agregar Tarea'}
        </button>
      </form>

      {/* Filters Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-900/50 p-2.5 rounded-2xl border border-slate-800 text-xs">
        {/* Status Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0 no-scrollbar scrollbar-none">
          {[
            { id: 'all', label: 'Todas' },
            { id: 'todo', label: 'Por Hacer' },
            { id: 'in_progress', label: 'En Progreso' },
            { id: 'done', label: 'Completadas' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id as any)}
              className={`px-3 py-1.5 rounded-xl font-medium transition-all whitespace-nowrap ${
                statusFilter === tab.id
                  ? 'bg-slate-700 text-white font-semibold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}

          {/* Financial Impact Filter Pill */}
          <button
            onClick={() => setFinancialOnly(!financialOnly)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-all whitespace-nowrap ml-2 ${
              financialOnly
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 font-semibold'
                : 'text-slate-400 border-slate-700 hover:bg-slate-800'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
            <span>Impacto Financiero</span>
          </button>
        </div>

        {/* Project Selector & Search */}
        <div className="flex items-center gap-2">
          <select
            value={projectFilter}
            onChange={(e) => setProjectFilter(e.target.value)}
            className="bg-slate-950/80 border border-slate-700/80 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
          >
            <option value="all">Todos los proyectos</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>

          <div className="relative w-40 sm:w-48">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar tareas..."
              className="w-full bg-slate-950/80 border border-slate-700/80 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Task List */}
      {filteredTasks.length === 0 ? (
        <div className="text-center py-16 bg-slate-900/30 border border-dashed border-slate-800 rounded-3xl p-8 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center mx-auto text-slate-400 text-xl">
            📋
          </div>
          <h3 className="text-sm font-semibold text-white">No hay tareas con estos filtros</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Creá una nueva tarea o ajustá los filtros para ver tus compromisos.
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filteredTasks.map((t) => {
            const isDone = t.status === 'done';
            const style = priorityStyles[t.priority] || priorityStyles.medium;
            const project = projects.find((p) => p.id === t.projectId);
            const isOverdue = t.dueDate && t.dueDate < new Date().toISOString().split('T')[0] && !isDone;

            return (
              <div
                key={t.id}
                className={`group bg-[#1E293B]/70 border rounded-2xl p-3.5 sm:p-4 flex items-start sm:items-center justify-between gap-3 transition-all duration-200 hover:border-slate-600 ${
                  isDone
                    ? 'border-slate-800/60 opacity-60 bg-slate-900/30'
                    : 'border-slate-700/70 shadow-sm'
                }`}
              >
                {/* Checkbox and Content */}
                <div className="flex items-start sm:items-center gap-3 flex-1 min-w-0">
                  <button
                    onClick={() => onToggleTaskStatus(t.id)}
                    className="mt-0.5 sm:mt-0 text-slate-400 hover:text-blue-400 transition-all shrink-0 focus:outline-none"
                    title={isDone ? 'Marcar como pendiente' : 'Marcar como completada'}
                  >
                    {isDone ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    ) : (
                      <Square className="w-5 h-5 group-hover:text-blue-400" />
                    )}
                  </button>

                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`text-sm font-semibold tracking-tight transition-all ${
                          isDone ? 'line-through text-slate-500' : 'text-white'
                        }`}
                      >
                        {t.title}
                      </span>

                      {/* Priority Badge */}
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-semibold border ${style.bg} ${style.text} ${style.border}`}
                      >
                        <span>{style.badge}</span>
                        <span className="capitalize">{t.priority}</span>
                      </span>

                      {/* Financial Impact Badge */}
                      {t.financialImpact?.type === 'income_driver' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                          <TrendingUp className="w-3 h-3 text-emerald-400" />
                          <span>
                            Genera Ingreso {t.financialImpact.expectedAmount ? `(${t.financialImpact.expectedAmount} €)` : ''}
                          </span>
                        </span>
                      )}

                      {t.financialImpact?.type === 'expense_saver' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/40">
                          <ShieldCheck className="w-3 h-3 text-blue-400" />
                          <span>Ahorro / Protección</span>
                        </span>
                      )}
                    </div>

                    {/* Metadata Row */}
                    <div className="flex items-center gap-3 text-xs text-slate-400 flex-wrap">
                      {project && (
                        <span className="inline-flex items-center gap-1 text-blue-300">
                          <Folder className="w-3 h-3" />
                          <span>{project.name}</span>
                        </span>
                      )}

                      {t.dueDate && (
                        <span
                          className={`inline-flex items-center gap-1 ${
                            isOverdue ? 'text-rose-400 font-bold' : ''
                          }`}
                        >
                          <Calendar className="w-3 h-3" />
                          <span>{t.dueDate} {isOverdue && '(Vencida)'}</span>
                        </span>
                      )}

                      {t.durationMinutes && (
                        <span className="inline-flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{t.durationMinutes} min</span>
                        </span>
                      )}

                      {t.effort && (
                        <span className="inline-flex items-center gap-1 text-[11px] text-slate-500">
                          <Zap className="w-3 h-3 text-amber-400/80" />
                          <span className="capitalize">{t.effort}</span>
                        </span>
                      )}

                      {t.postItOriginId && (
                        <span className="text-[10px] text-yellow-400/80 bg-yellow-500/10 px-1.5 py-0.5 rounded">
                          Origen: Post-it
                        </span>
                      )}
                    </div>

                    {t.notes && (
                      <p className="text-xs text-slate-400 italic line-clamp-1">{t.notes}</p>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                  <button
                    onClick={() => onEditTask(t)}
                    className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-all"
                    title="Editar Tarea"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDeleteTask(t.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition-all"
                    title="Eliminar Tarea"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
