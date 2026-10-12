import React, { useState, useEffect } from 'react';
import {
  X,
  Calendar,
  Clock,
  Folder,
  AlertCircle,
  TrendingUp,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { Project, Task, TaskEffort, TaskPriority } from '../types';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  task?: Task | null;
  projects: Project[];
  onSave: (data: any) => Promise<void>;
}

export const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  onClose,
  task,
  projects,
  onSave,
}) => {
  const [title, setTitle] = useState('');
  const [projectId, setProjectId] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [dueDate, setDueDate] = useState('');
  const [durationMinutes, setDurationMinutes] = useState<string>('30');
  const [effort, setEffort] = useState<TaskEffort>('medium');
  const [impactType, setImpactType] = useState<'neutral' | 'income_driver' | 'expense_saver'>('neutral');
  const [expectedAmount, setExpectedAmount] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (task) {
      setTitle(task.title || '');
      setProjectId(task.projectId || '');
      setPriority(task.priority || 'medium');
      setDueDate(task.dueDate || '');
      setDurationMinutes(task.durationMinutes ? task.durationMinutes.toString() : '30');
      setEffort(task.effort || 'medium');
      setImpactType(task.financialImpact?.type || 'neutral');
      setExpectedAmount(task.financialImpact?.expectedAmount ? task.financialImpact.expectedAmount.toString() : '');
      setNotes(task.notes || '');
    } else {
      setTitle('');
      setProjectId('');
      setPriority('medium');
      setDueDate(new Date().toISOString().split('T')[0]);
      setDurationMinutes('30');
      setEffort('medium');
      setImpactType('neutral');
      setExpectedAmount('');
      setNotes('');
    }
    setError(null);
  }, [task, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('El título de la tarea es obligatorio');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await onSave({
        title: title.trim(),
        projectId: projectId || undefined,
        priority,
        dueDate: dueDate || undefined,
        durationMinutes: durationMinutes ? parseInt(durationMinutes, 10) : undefined,
        effort,
        financialImpact:
          impactType !== 'neutral'
            ? {
                type: impactType,
                expectedAmount: expectedAmount ? parseFloat(expectedAmount) : undefined,
              }
            : undefined,
        notes: notes.trim() || undefined,
        status: task?.status || 'todo',
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error al guardar la tarea');
    } finally {
      setIsSubmitting(false);
    }
  };

  const priorityOptions: Array<{ id: TaskPriority; label: string; badge: string; colorClass: string }> = [
    { id: 'urgent', label: 'Urgente', badge: '🔴', colorClass: 'border-rose-500/50 bg-rose-500/15 text-rose-300' },
    { id: 'high', label: 'Alta', badge: '🟠', colorClass: 'border-amber-500/50 bg-amber-500/15 text-amber-300' },
    { id: 'medium', label: 'Media', badge: '🟡', colorClass: 'border-yellow-500/50 bg-yellow-500/15 text-yellow-300' },
    { id: 'low', label: 'Baja', badge: '🟢', colorClass: 'border-emerald-500/50 bg-emerald-500/15 text-emerald-300' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#1E293B] border border-slate-700/80 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/50">
          <div className="flex items-center gap-2">
            <span className="text-xl">📋</span>
            <h2 className="text-base font-semibold text-white">
              {task ? 'Editar Tarea' : 'Nueva Tarea de Acción'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
          {error && (
            <div className="flex items-center gap-2 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-400">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Título de la Tarea *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej: Cobrar trabajo a Josu / Enviar propuesta técnica CTC..."
              required
              className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-medium"
            />
          </div>

          {/* Priority */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Nivel de Prioridad
            </label>
            <div className="grid grid-cols-4 gap-2">
              {priorityOptions.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setPriority(opt.id)}
                  className={`flex flex-col items-center justify-center p-2 rounded-xl text-xs border transition-all ${
                    priority === opt.id
                      ? `${opt.colorClass} font-bold ring-1 ring-white/20`
                      : 'bg-slate-800/60 text-slate-400 border-slate-700 hover:border-slate-600'
                  }`}
                >
                  <span className="text-sm mb-0.5">{opt.badge}</span>
                  <span>{opt.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Financial Impact Engine */}
          <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 uppercase tracking-wider">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                Impacto Financiero
              </label>
              <span className="text-[11px] text-slate-400">Principio: Primero Generación</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setImpactType('neutral')}
                className={`py-1.5 px-2 rounded-lg text-xs font-medium border transition-all ${
                  impactType === 'neutral'
                    ? 'bg-slate-700 text-white border-slate-500'
                    : 'bg-slate-800/80 text-slate-400 border-slate-700 hover:border-slate-600'
                }`}
              >
                Neutro
              </button>
              <button
                type="button"
                onClick={() => setImpactType('income_driver')}
                className={`py-1.5 px-2 rounded-lg text-xs font-medium border transition-all flex items-center justify-center gap-1 ${
                  impactType === 'income_driver'
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 font-semibold'
                    : 'bg-slate-800/80 text-slate-400 border-slate-700 hover:border-slate-600'
                }`}
              >
                💰 Genera Ingreso
              </button>
              <button
                type="button"
                onClick={() => setImpactType('expense_saver')}
                className={`py-1.5 px-2 rounded-lg text-xs font-medium border transition-all flex items-center justify-center gap-1 ${
                  impactType === 'expense_saver'
                    ? 'bg-blue-500/20 text-blue-300 border-blue-500/50 font-semibold'
                    : 'bg-slate-800/80 text-slate-400 border-slate-700 hover:border-slate-600'
                }`}
              >
                🛡️ Ahorro/Protección
              </button>
            </div>

            {impactType === 'income_driver' && (
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">
                  Importe esperado a cobrar (€)
                </label>
                <input
                  type="number"
                  step="any"
                  value={expectedAmount}
                  onChange={(e) => setExpectedAmount(e.target.value)}
                  placeholder="Ej: 180"
                  className="w-full bg-slate-900 border border-emerald-500/40 rounded-xl px-3 py-1.5 text-xs text-emerald-300 placeholder-slate-600 focus:outline-none"
                />
              </div>
            )}
          </div>

          {/* Project & Due date row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="flex items-center gap-1 text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                <Folder className="w-3.5 h-3.5 text-blue-400" />
                Proyecto Asociado
              </label>
              <select
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
              >
                <option value="">Sin proyecto específico</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="flex items-center gap-1 text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                Fecha Límite
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Duration & Effort row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="flex items-center gap-1 text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                Duración Estimada (minutos)
              </label>
              <input
                type="number"
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(e.target.value)}
                placeholder="30"
                min="5"
                step="5"
                className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="flex items-center gap-1 text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                Nivel de Esfuerzo
              </label>
              <select
                value={effort}
                onChange={(e) => setEffort(e.target.value as TaskEffort)}
                className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
              >
                <option value="low">Bajo (rápido / llamada)</option>
                <option value="medium">Medio (concentración normal)</option>
                <option value="high">Alto (trabajo profundo / pesado)</option>
              </select>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Notas o Bloqueos
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Instrucciones clave, personas o datos a tener a mano..."
              rows={2}
              className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-all resize-none"
            />
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white rounded-xl transition-all"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-500 active:scale-95 text-white text-xs font-semibold rounded-xl shadow-lg shadow-blue-500/20 transition-all disabled:opacity-50"
            >
              {isSubmitting ? 'Guardando...' : task ? 'Actualizar Tarea' : 'Crear Tarea'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
