import React, { useState, useEffect } from 'react';
import { X, Clock, AlertCircle, Plus, Sparkles, Check } from 'lucide-react';
import { Category, Project } from '../types';
import { api } from '../services/api';

interface FutureExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  projects: Project[];
  onSuccess: () => void;
  onCategoryCreated?: (category: Category) => void;
}

export const FutureExpenseModal: React.FC<FutureExpenseModalProps> = ({
  isOpen,
  onClose,
  categories: initialCategories,
  projects,
  onSuccess,
  onCategoryCreated,
}) => {
  const [concept, setConcept] = useState('');
  const [amount, setAmount] = useState<number | ''>('');
  const [dueDate, setDueDate] = useState('');
  const [categoriesList, setCategoriesList] = useState<Category[]>(initialCategories);
  const [categoryId, setCategoryId] = useState(initialCategories[0]?.id || '');
  const [projectId, setProjectId] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);
  const [loading, setLoading] = useState(false);

  // Category creation
  const [isCreatingCat, setIsCreatingCat] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatSubs, setNewCatSubs] = useState('');
  const [isSubmittingCat, setIsSubmittingCat] = useState(false);

  useEffect(() => {
    setCategoriesList(initialCategories);
    if (!categoryId && initialCategories.length > 0) {
      setCategoryId(initialCategories[0].id);
    }
  }, [initialCategories]);

  if (!isOpen) return null;

  const handleCreateCategory = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanName = newCatName.trim();
    if (!cleanName) return;

    setIsSubmittingCat(true);
    try {
      const subs = newCatSubs
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      const created = await api.createCategory(
        cleanName,
        subs.length > 0 ? subs : ['General'],
        cleanName.toLowerCase().includes('weed') || cleanName.toLowerCase().includes('mari')
          ? 'Leaf'
          : 'Tag'
      );

      setCategoriesList((prev) => [...prev, created]);
      setCategoryId(created.id);
      onCategoryCreated?.(created);
      setIsCreatingCat(false);
      setNewCatName('');
      setNewCatSubs('');
    } catch (err) {
      console.error(err);
      alert('Error al crear la categoría');
    } finally {
      setIsSubmittingCat(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0 || !concept.trim() || !dueDate) return;

    setLoading(true);
    try {
      await api.createFutureExpense({
        concept: concept.trim(),
        amount: Number(amount),
        expectedDate: dueDate,
        categoryId: categoryId || undefined,
        recurrence: isRecurring ? 'monthly' : 'none',
        status: 'pending',
      });

      onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      alert('Error al registrar gasto futuro');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#1E293B] border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl text-slate-200">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-950/50 border border-amber-800/40 text-amber-400 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-white">Registrar Gasto Futuro</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-3 bg-amber-950/30 border border-amber-800/40 rounded-xl flex items-start gap-2 text-xs text-amber-300">
          <AlertCircle className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
          <p>
            <strong className="text-white">Planificación:</strong> Este gasto se deduce de tu <strong className="text-white">posición proyectada</strong> para alertarte sobre tus compromisos financieros cercanos.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Concepto del gasto
            </label>
            <input
              type="text"
              value={concept}
              onChange={(e) => setConcept(e.target.value)}
              placeholder="Ej: Internet y Servicios, Alquiler, Cuota Gimnasio..."
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
              required
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Importe previsto (€)
              </label>
              <input
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value === '' ? '' : parseFloat(e.target.value))}
                placeholder="0.00"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-base font-bold text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Fecha de vencimiento
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                required
              />
            </div>
          </div>

          {isCreatingCat && (
            <div className="p-3 bg-slate-900 border border-emerald-500/40 rounded-xl space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" /> Nueva Categoría
                </span>
                <button
                  type="button"
                  onClick={() => setIsCreatingCat(false)}
                  className="text-xs text-slate-400 hover:text-white"
                >
                  Cancelar
                </button>
              </div>
              <input
                type="text"
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                placeholder="Nombre (ej: Weed, Ocio, Gimnasio...)"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
                autoFocus
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  disabled={!newCatName.trim() || isSubmittingCat}
                  onClick={() => handleCreateCategory()}
                  className="flex items-center gap-1 px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold disabled:opacity-50"
                >
                  <Check className="w-3 h-3" /> {isSubmittingCat ? 'Creando...' : 'Crear'}
                </button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-300">Categoría</label>
                {!isCreatingCat && (
                  <button
                    type="button"
                    onClick={() => setIsCreatingCat(true)}
                    className="text-[10px] font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-0.5"
                  >
                    <Plus className="w-2.5 h-2.5" /> + Nueva
                  </button>
                )}
              </div>
              <select
                value={categoryId}
                onChange={(e) => {
                  if (e.target.value === '__NEW__') {
                    setIsCreatingCat(true);
                  } else {
                    setCategoryId(e.target.value);
                  }
                }}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
              >
                {categoriesList.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
                <option value="__NEW__" className="text-emerald-400 font-bold">
                  ✨ + Crear nueva categoría...
                </option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Proyecto (opcional)
              </label>
              <select
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
              >
                <option value="">Ninguno</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="recurCheck"
              checked={isRecurring}
              onChange={(e) => setIsRecurring(e.target.checked)}
              className="rounded text-blue-600 focus:ring-blue-500 bg-slate-900 border-slate-700"
            />
            <label htmlFor="recurCheck" className="text-xs text-slate-300 font-medium">
              Gasto recurrente mensual
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 text-xs font-semibold bg-amber-600 hover:bg-amber-500 text-white rounded-xl shadow-lg shadow-amber-600/20 transition-colors disabled:opacity-50"
            >
              {loading ? 'Guardando...' : 'Guardar Gasto Futuro'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
