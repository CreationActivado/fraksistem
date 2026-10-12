import React, { useState, useEffect } from 'react';
import {
  X,
  Pin,
  Calendar,
  Clock,
  Euro,
  Folder,
  User,
  Plus,
  Trash2,
  CheckSquare,
  AlertCircle,
} from 'lucide-react';
import { PostIt, PostItColorPriority, Project } from '../types';

interface PostItModalProps {
  isOpen: boolean;
  onClose: () => void;
  postIt?: PostIt | null;
  projects: Project[];
  onSave: (data: any) => Promise<void>;
}

export const PostItModal: React.FC<PostItModalProps> = ({
  isOpen,
  onClose,
  postIt,
  projects,
  onSave,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [colorPriority, setColorPriority] = useState<PostItColorPriority>('yellow');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [projectId, setProjectId] = useState('');
  const [contactName, setContactName] = useState('');
  const [moneyAmount, setMoneyAmount] = useState<string>('');
  const [isPinned, setIsPinned] = useState(false);
  const [checklist, setChecklist] = useState<{ id: string; text: string; done: boolean }[]>([]);
  const [newCheckItem, setNewCheckItem] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (postIt) {
      setTitle(postIt.title || '');
      setDescription(postIt.description || '');
      setColorPriority(postIt.colorPriority || 'yellow');
      setDate(postIt.date || '');
      setTime(postIt.time || '');
      setProjectId(postIt.projectId || '');
      setContactName(postIt.contactName || '');
      setMoneyAmount(postIt.moneyAmount !== undefined ? postIt.moneyAmount.toString() : '');
      setIsPinned(postIt.isPinned || false);
      setChecklist(postIt.checklist ? [...postIt.checklist] : []);
    } else {
      setTitle('');
      setDescription('');
      setColorPriority('yellow');
      setDate(new Date().toISOString().split('T')[0]);
      setTime('');
      setProjectId('');
      setContactName('');
      setMoneyAmount('');
      setIsPinned(false);
      setChecklist([]);
    }
    setError(null);
  }, [postIt, isOpen]);

  if (!isOpen) return null;

  const handleAddCheckItem = () => {
    if (!newCheckItem.trim()) return;
    setChecklist((prev) => [
      ...prev,
      { id: `chk_${Date.now()}`, text: newCheckItem.trim(), done: false },
    ]);
    setNewCheckItem('');
  };

  const handleRemoveCheckItem = (id: string) => {
    setChecklist((prev) => prev.filter((item) => item.id !== id));
  };

  const handleToggleCheckItem = (id: string) => {
    setChecklist((prev) =>
      prev.map((item) => (item.id === id ? { ...item, done: !item.done } : item))
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('El título del post-it es obligatorio');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await onSave({
        title: title.trim(),
        description: description.trim() || undefined,
        colorPriority,
        date: date || undefined,
        time: time || undefined,
        projectId: projectId || undefined,
        contactName: contactName.trim() || undefined,
        moneyAmount: moneyAmount ? parseFloat(moneyAmount) : undefined,
        isPinned,
        checklist: checklist.length > 0 ? checklist : undefined,
        status: postIt?.status || 'active',
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error al guardar el post-it');
    } finally {
      setIsSubmitting(false);
    }
  };

  const colorOptions: Array<{
    id: PostItColorPriority;
    label: string;
    sublabel: string;
    badge: string;
    bgClass: string;
    borderClass: string;
  }> = [
    { id: 'purple', label: 'Violeta: Creko', sublabel: 'Merch & cartelería', badge: '🟣', bgClass: 'bg-purple-500/20 text-purple-300', borderClass: 'border-purple-500/50' },
    { id: 'orange', label: 'Naranja: Burger Palusa', sublabel: 'Gastronomía & pantallas', badge: '🟠', bgClass: 'bg-amber-500/20 text-amber-300', borderClass: 'border-amber-500/50' },
    { id: 'blue', label: 'Azul: Sowfts', sublabel: 'Software en desarrollo', badge: '🔵', bgClass: 'bg-sky-500/20 text-sky-300', borderClass: 'border-sky-500/50' },
    { id: 'red', label: 'Rojo: Urgencias', sublabel: 'Crítico / Inmediato', badge: '🔴', bgClass: 'bg-rose-500/20 text-rose-300', borderClass: 'border-rose-500/50' },
    { id: 'yellow', label: 'Amarillo: Título Libre', sublabel: 'Completar título a gusto', badge: '🟡', bgClass: 'bg-yellow-500/20 text-yellow-300', borderClass: 'border-yellow-500/50' },
    { id: 'green', label: 'Verde: Metas & Ocio', sublabel: 'Meditar, 500€/mes, hábitos', badge: '🟢', bgClass: 'bg-emerald-500/20 text-emerald-300', borderClass: 'border-emerald-500/50' },
  ];

  const titlePlaceholders: Record<PostItColorPriority, string> = {
    purple: "Ej: Cerrar presupuesto rotulación para local / Merch Creko...",
    orange: "Ej: Burger Palusa: diseño packaging, camisetas o pantallas...",
    blue: "Ej: Sowfts: desarrollo de feature en software o web...",
    red: "Ej: Urgente: resolver hoy / cobrar 180 € a Josu...",
    yellow: "Ej: Escribe cualquier título libre o recordatorio personalizado...",
    green: "Ej: Meditar 3 veces por semana / Meta de 500 € en un mes...",
  };

  const handleSelectColor = (colorId: PostItColorPriority) => {
    setColorPriority(colorId);
    // Auto-link project if empty or switching to project color
    if (colorId === 'purple') {
      const creko = projects.find((p) => p.id === 'proj_creko' || /creko/i.test(p.name));
      if (creko) setProjectId(creko.id);
    } else if (colorId === 'orange') {
      const bp = projects.find((p) => p.id === 'proj_burger_palusa' || /burger/i.test(p.name));
      if (bp) setProjectId(bp.id);
    } else if (colorId === 'blue') {
      const sw = projects.find((p) => p.id === 'proj_soft_desarrollo' || /soft|sowft/i.test(p.name));
      if (sw) setProjectId(sw.id);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#1E293B] border border-slate-700/80 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/50">
          <div className="flex items-center gap-2">
            <span className="text-xl">📝</span>
            <h2 className="text-base font-semibold text-white">
              {postIt ? 'Editar Post-It Inteligente' : 'Nuevo Post-It'}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsPinned(!isPinned)}
              className={`p-1.5 rounded-lg border transition-all ${
                isPinned
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  : 'text-slate-400 hover:text-white border-transparent'
              }`}
              title={isPinned ? 'Fijado en tablero' : 'Fijar con pin'}
            >
              <Pin className={`w-4 h-4 ${isPinned ? 'fill-amber-400 rotate-45' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
          {error && (
            <div className="flex items-center gap-2 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-400">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Color Priority Selector */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Proyecto / Categoría (Color)
              </label>
              <span className="text-[11px] text-slate-400">
                {colorPriority === 'yellow' ? '🟡 Libre para cualquier título' : colorPriority === 'green' ? '🟢 Metas & Ocio' : 'Asignación visual'}
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {colorOptions.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => handleSelectColor(opt.id)}
                  className={`flex flex-col p-2.5 rounded-xl text-xs border transition-all text-left ${
                    colorPriority === opt.id
                      ? `${opt.bgClass} ${opt.borderClass} ring-2 ring-white/30 font-bold shadow-md`
                      : 'bg-slate-800/60 text-slate-400 border-slate-700 hover:border-slate-600 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-bold mb-0.5">
                    <span>{opt.badge}</span>
                    <span className="truncate">{opt.label.split(':')[1]?.trim() || opt.label}</span>
                  </div>
                  <span className="text-[10px] opacity-75 font-normal truncate">{opt.sublabel}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Título o Nota Principal *
              </label>
              {colorPriority === 'yellow' && (
                <span className="text-[11px] text-yellow-400 font-medium">
                  Completar título libremente
                </span>
              )}
              {colorPriority === 'green' && (
                <span className="text-[11px] text-emerald-400 font-medium">
                  Metas / Ocio / Hábitos
                </span>
              )}
            </div>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={titlePlaceholders[colorPriority]}
              required
              className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-medium"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Detalle o Contexto (opcional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detalles adicionales, recordatorio o instrucciones..."
              rows={2}
              className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-all resize-none"
            />
          </div>

          {/* Money & Project row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="flex items-center gap-1 text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                <Euro className="w-3.5 h-3.5 text-emerald-400" />
                Importe Vinculado (€)
              </label>
              <input
                type="number"
                step="any"
                value={moneyAmount}
                onChange={(e) => setMoneyAmount(e.target.value)}
                placeholder="0.00"
                className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>

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
                <option value="">Sin proyecto</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Date & Contact row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="flex items-center gap-1 text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                Fecha / Límite
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="flex items-center gap-1 text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                <User className="w-3.5 h-3.5 text-slate-400" />
                Contacto o Persona
              </label>
              <input
                type="text"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                placeholder="Ej: Josu, Juan..."
                className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Checklist */}
          <div>
            <label className="flex items-center gap-1 text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              <CheckSquare className="w-3.5 h-3.5 text-blue-400" />
              Checklist de pasos
            </label>

            <div className="flex items-center gap-2 mb-2">
              <input
                type="text"
                value={newCheckItem}
                onChange={(e) => setNewCheckItem(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddCheckItem();
                  }
                }}
                placeholder="Agregar paso o verificación..."
                className="flex-1 bg-slate-900/90 border border-slate-700/80 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
              <button
                type="button"
                onClick={handleAddCheckItem}
                className="p-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-all"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {checklist.length > 0 && (
              <div className="space-y-1.5 bg-slate-900/50 p-2.5 rounded-xl border border-slate-800">
                {checklist.map((item) => (
                  <div key={item.id} className="flex items-center justify-between gap-2 group">
                    <button
                      type="button"
                      onClick={() => handleToggleCheckItem(item.id)}
                      className="flex items-center gap-2 flex-1 text-left"
                    >
                      <input
                        type="checkbox"
                        checked={item.done}
                        readOnly
                        className="rounded border-slate-700 text-blue-600 focus:ring-0"
                      />
                      <span
                        className={`text-xs ${
                          item.done ? 'line-through text-slate-500' : 'text-slate-200'
                        }`}
                      >
                        {item.text}
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveCheckItem(item.id)}
                      className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-rose-400 p-1 transition-all"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
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
              {isSubmitting ? 'Guardando...' : postIt ? 'Actualizar Post-It' : 'Pegar en Tablero'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
