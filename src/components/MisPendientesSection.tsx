import React, { useState } from 'react';
import {
  CheckSquare,
  Square,
  Plus,
  Clock,
  Euro,
  Tag,
  AlertCircle,
  FolderGit2,
  Calendar,
  Sparkles,
} from 'lucide-react';
import { Task, Project } from '../types';

interface MisPendientesSectionProps {
  tasks: Task[];
  projects: Project[];
  onToggleTask: (taskId: string) => Promise<void>;
  onCreateTask: (data: {
    title: string;
    priority: 'urgent' | 'high' | 'medium' | 'low';
    dueDate?: string;
    projectId?: string;
  }) => Promise<void>;
}

export const MisPendientesSection: React.FC<MisPendientesSectionProps> = ({
  tasks,
  projects,
  onToggleTask,
  onCreateTask,
}) => {
  const [activeTab, setActiveTab] = useState<'hoy' | 'semana' | 'futuro'>('hoy');
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newProject, setNewProject] = useState('proj_creko');
  const [targetBucket, setTargetBucket] = useState<'hoy' | 'semana' | 'futuro'>('hoy');
  const [submitting, setSubmitting] = useState(false);

  const todayStr = new Date().toISOString().split('T')[0];

  // Group tasks into the 3 buckets requested by the user
  const hoyTasks = tasks.filter((t) => {
    if (t.status === 'done') return false;
    // Explicit priority urgent or due date today or cobros/entregas
    if (t.priority === 'urgent' || t.priority === 'high') return true;
    if (t.dueDate && t.dueDate <= todayStr) return true;
    return false;
  });

  const semanaTasks = tasks.filter((t) => {
    if (t.status === 'done') return false;
    if (hoyTasks.some((h) => h.id === t.id)) return false;
    if (t.priority === 'medium') return true;
    return false;
  });

  const futuroTasks = tasks.filter((t) => {
    if (t.status === 'done') return false;
    if (hoyTasks.some((h) => h.id === t.id) || semanaTasks.some((s) => s.id === t.id)) return false;
    return true;
  });

  const completedCount = tasks.filter((t) => t.status === 'done').length;

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    setSubmitting(true);
    try {
      const priority = targetBucket === 'hoy' ? 'urgent' : targetBucket === 'semana' ? 'medium' : 'low';
      await onCreateTask({
        title: newTitle.trim(),
        priority,
        projectId: newProject || undefined,
        dueDate: targetBucket === 'hoy' ? todayStr : undefined,
      });

      setNewTitle('');
      setIsAdding(false);
    } catch (err) {
      console.error('Error al crear pendiente:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const currentList =
    activeTab === 'hoy' ? hoyTasks : activeTab === 'semana' ? semanaTasks : futuroTasks;

  const getProjectName = (projId?: string) => {
    if (!projId) return null;
    const p = projects.find((proj) => proj.id === projId);
    return p ? p.name : null;
  };

  return (
    <div className="bg-[#1E293B] border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            📋 Mis Pendientes
            <span className="text-[10px] bg-slate-800 text-slate-300 font-semibold px-2 py-0.5 rounded-full border border-slate-700">
              {hoyTasks.length + semanaTasks.length + futuroTasks.length} activos
            </span>
          </h2>
          <p className="text-xs text-slate-400">
            Enfoque claro: qué resolver hoy, qué avanzar esta semana y qué dejar para el futuro
          </p>
        </div>

        <button
          onClick={() => {
            setTargetBucket(activeTab);
            setIsAdding(!isAdding);
          }}
          className="w-fit flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-md shadow-blue-500/20"
          id="btn-add-pendiente"
        >
          <Plus className="w-3.5 h-3.5" /> Nuevo Pendiente
        </button>
      </div>

      {/* Quick Add Form */}
      {isAdding && (
        <form onSubmit={handleCreate} className="p-3.5 bg-slate-900/90 rounded-2xl border border-blue-500/40 space-y-3 animate-fade-in">
          <input
            type="text"
            placeholder="Título del pendiente (ej. Cobrar a Josu, Enviar presupuesto...)"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            autoFocus
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-400"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                ¿Para cuándo?
              </label>
              <select
                value={targetBucket}
                onChange={(e) => setTargetBucket(e.target.value as any)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-blue-400"
              >
                <option value="hoy">🔴 HOY (Urgente / Inmediato)</option>
                <option value="semana">🟠 ESTA SEMANA (Medio plazo)</option>
                <option value="futuro">🔵 FUTURO (Ideas y backlog)</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                Proyecto
              </label>
              <select
                value={newProject}
                onChange={(e) => setNewProject(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-blue-400"
              >
                <option value="">Personal / General</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting || !newTitle.trim()}
              className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold disabled:opacity-50"
            >
              Guardar
            </button>
          </div>
        </form>
      )}

      {/* 3 Tabs: HOY, ESTA SEMANA, FUTURO */}
      <div className="grid grid-cols-3 gap-2 p-1 bg-slate-900 rounded-2xl border border-slate-800">
        <button
          onClick={() => setActiveTab('hoy')}
          className={`py-2 px-2 sm:px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'hoy'
              ? 'bg-rose-950/60 border border-rose-500/50 text-rose-200 shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <span>🔴</span>
          <span>HOY</span>
          <span className="text-[10px] font-normal opacity-80">({hoyTasks.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('semana')}
          className={`py-2 px-2 sm:px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'semana'
              ? 'bg-amber-950/60 border border-amber-500/50 text-amber-200 shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <span>🟠</span>
          <span>ESTA SEMANA</span>
          <span className="text-[10px] font-normal opacity-80">({semanaTasks.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('futuro')}
          className={`py-2 px-2 sm:px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'futuro'
              ? 'bg-blue-950/60 border border-blue-500/50 text-blue-200 shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <span>🔵</span>
          <span>FUTURO</span>
          <span className="text-[10px] font-normal opacity-80">({futuroTasks.length})</span>
        </button>
      </div>

      {/* Tasks List for Selected Tab */}
      <div className="space-y-2.5">
        {currentList.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-xs border border-dashed border-slate-800 rounded-2xl">
            No tenés pendientes en esta sección.
          </div>
        ) : (
          currentList.map((t) => {
            const projName = getProjectName(t.projectId);
            const isHoy = activeTab === 'hoy';

            return (
              <div
                key={t.id}
                className="p-3.5 rounded-2xl bg-slate-900/70 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all flex items-start justify-between gap-3 group"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <button
                    onClick={() => onToggleTask(t.id)}
                    className="mt-0.5 text-slate-500 hover:text-emerald-400 transition-colors shrink-0"
                    title="Marcar como completado"
                  >
                    <Square className="w-4 h-4" />
                  </button>

                  <div className="min-w-0">
                    <span className="text-xs sm:text-sm font-semibold text-white group-hover:text-blue-300 transition-colors block">
                      {t.title}
                    </span>

                    {/* Metadata tags */}
                    <div className="flex flex-wrap items-center gap-2 mt-1 text-[10px] text-slate-400">
                      {projName && (
                        <span className="px-2 py-0.5 rounded-md bg-blue-950/50 border border-blue-800/40 text-blue-300 font-medium">
                          {projName}
                        </span>
                      )}

                      {t.financialImpact && t.financialImpact.expectedAmount > 0 && (
                        <span className="px-2 py-0.5 rounded-md bg-emerald-950/60 border border-emerald-800/40 text-emerald-300 font-bold flex items-center gap-1">
                          💰 +{t.financialImpact.expectedAmount} €
                        </span>
                      )}

                      {t.dueDate && (
                        <span className="flex items-center gap-1 text-slate-400">
                          <Clock className="w-3 h-3 text-slate-500" />
                          {t.dueDate === todayStr ? 'Hoy' : t.dueDate}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Priority Badge */}
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-bold border shrink-0 ${
                    t.priority === 'urgent'
                      ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                      : t.priority === 'high'
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                      : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}
                >
                  {t.priority === 'urgent'
                    ? '🔴 Urgente'
                    : t.priority === 'high'
                    ? '🟠 Alta'
                    : '🟡 Media'}
                </span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
