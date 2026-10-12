import React, { useState, useEffect } from 'react';
import {
  X,
  ArrowUpRight,
  ArrowDownLeft,
  ArrowRightLeft,
  AlertCircle,
  Plus,
  Sparkles,
  Check,
  FolderPlus,
} from 'lucide-react';
import { Account, Category, Project } from '../types';
import { api } from '../services/api';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  accounts: Account[];
  categories: Category[];
  projects: Project[];
  onSuccess: () => void;
  onCategoryCreated?: (category: Category) => void;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  accounts,
  categories: initialCategories,
  projects,
  onSuccess,
  onCategoryCreated,
}) => {
  const [type, setType] = useState<'expense' | 'income' | 'transfer'>('expense');
  const [amount, setAmount] = useState<number | ''>('');
  const [currency, setCurrency] = useState<string>('EUR');
  const [paymentMethodId, setPaymentMethodId] = useState<string>(accounts[0]?.id || '');
  const [toPaymentMethodId, setToPaymentMethodId] = useState<string>(accounts[1]?.id || '');
  const [categoriesList, setCategoriesList] = useState<Category[]>(initialCategories);
  const [categoryId, setCategoryId] = useState<string>(initialCategories[0]?.id || '');
  const [subcategoryId, setSubcategoryId] = useState<string>('');
  const [projectId, setProjectId] = useState<string>('');
  const [description, setDescription] = useState('');
  const [notes, setNotes] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);

  // Inline Category Creator State
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatSubs, setNewCatSubs] = useState('');
  const [isSubmittingCat, setIsSubmittingCat] = useState(false);
  const [catCreationFeedback, setCatCreationFeedback] = useState<string | null>(null);

  // Inline Subcategory Creator State
  const [isAddingSub, setIsAddingSub] = useState(false);
  const [newSubName, setNewSubName] = useState('');
  const [isSubmittingSub, setIsSubmittingSub] = useState(false);

  useEffect(() => {
    setCategoriesList(initialCategories);
    if (!categoryId && initialCategories.length > 0) {
      setCategoryId(initialCategories[0].id);
    }
  }, [initialCategories]);

  if (!isOpen) return null;

  const currentCategory = categoriesList.find((c) => c.id === categoryId);

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
          : cleanName.toLowerCase().includes('tabac')
          ? 'Flame'
          : 'Tag',
        cleanName.toLowerCase().includes('weed') ? '#10b981' : '#3b82f6'
      );

      setCategoriesList((prev) => [...prev, created]);
      setCategoryId(created.id);
      if (created.subcategories.length > 0) {
        setSubcategoryId(created.subcategories[0].id);
      }
      if (!description.trim()) {
        setDescription(created.name);
      }

      onCategoryCreated?.(created);

      setCatCreationFeedback(`¡Categoría "${created.name}" creada y seleccionada!`);
      setTimeout(() => setCatCreationFeedback(null), 3000);

      setIsCreatingCategory(false);
      setNewCatName('');
      setNewCatSubs('');
    } catch (err) {
      console.error(err);
      alert('Error al crear la categoría');
    } finally {
      setIsSubmittingCat(false);
    }
  };

  const handleAddSubcategory = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanSub = newSubName.trim();
    if (!cleanSub || !categoryId) return;

    setIsSubmittingSub(true);
    try {
      await api.addSubcategory(categoryId, cleanSub);
      // Refresh categories
      const updated = await api.getCategories();
      setCategoriesList(updated);
      const cat = updated.find((c) => c.id === categoryId);
      const newSub = cat?.subcategories.find((s) => s.name.toLowerCase() === cleanSub.toLowerCase());
      if (newSub) {
        setSubcategoryId(newSub.id);
      }
      setIsAddingSub(false);
      setNewSubName('');
    } catch (err) {
      console.error(err);
      alert('Error al añadir la subcategoría');
    } finally {
      setIsSubmittingSub(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) return;
    if (type === 'transfer' && paymentMethodId === toPaymentMethodId) {
      alert('La cuenta de origen y destino deben ser distintas');
      return;
    }

    setLoading(true);
    try {
      await api.createTransaction({
        type,
        amount: Number(amount),
        currency,
        paymentMethodId,
        toPaymentMethodId: type === 'transfer' ? toPaymentMethodId : undefined,
        categoryId: type !== 'transfer' ? categoryId : undefined,
        subcategoryId: type !== 'transfer' && subcategoryId ? subcategoryId : undefined,
        projectId: projectId || undefined,
        description:
          description.trim() ||
          (type === 'transfer'
            ? 'Transferencia interna'
            : currentCategory?.name || 'Movimiento'),
        notes: notes.trim() || undefined,
        date,
        status: 'confirmed',
        source: 'manual',
      });

      onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      alert('Error al guardar el movimiento');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#1E293B] border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto text-slate-200">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="text-base font-bold text-white">Registrar Nuevo Movimiento</h3>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Type Selector */}
        <div className="grid grid-cols-3 gap-2 p-1 bg-slate-900 rounded-xl border border-slate-800">
          <button
            type="button"
            onClick={() => setType('expense')}
            className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all ${
              type === 'expense'
                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ArrowUpRight className="w-3.5 h-3.5" /> Gasto
          </button>
          <button
            type="button"
            onClick={() => setType('income')}
            className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all ${
              type === 'income'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ArrowDownLeft className="w-3.5 h-3.5" /> Ingreso
          </button>
          <button
            type="button"
            onClick={() => setType('transfer')}
            className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all ${
              type === 'transfer'
                ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ArrowRightLeft className="w-3.5 h-3.5" /> Transferencia
          </button>
        </div>

        {type === 'transfer' && (
          <div className="p-3 bg-blue-950/30 border border-blue-800/40 rounded-xl flex items-start gap-2 text-xs text-blue-300">
            <AlertCircle className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" />
            <p>
              <strong className="text-white">Transferencia propia:</strong> Mueve fondos entre tus cuentas. NO se computa como ingreso ni como gasto.
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Amount, Currency & Date */}
          <div className="grid grid-cols-12 gap-3">
            <div className="col-span-5">
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Importe
              </label>
              <input
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value === '' ? '' : parseFloat(e.target.value))}
                placeholder="0.00"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-base font-bold text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
                required
                autoFocus
              />
            </div>

            <div className="col-span-3">
              <label className="block text-xs font-semibold text-slate-300 mb-1">Moneda</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-2 text-sm text-white font-bold focus:outline-none focus:border-blue-500"
              >
                <option value="EUR">EUR (€)</option>
                <option value="USD">USD ($)</option>
                <option value="ARS">ARS ($)</option>
              </select>
            </div>

            <div className="col-span-4">
              <label className="block text-xs font-semibold text-slate-300 mb-1">Fecha</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                required
              />
            </div>
          </div>

          {/* Account Selection */}
          {type !== 'transfer' ? (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Cuenta / Medio de pago
              </label>
              <select
                value={paymentMethodId}
                onChange={(e) => setPaymentMethodId(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
              >
                {accounts.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name} ({a.balance} {a.currency})
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Desde (Origen)
                </label>
                <select
                  value={paymentMethodId}
                  onChange={(e) => setPaymentMethodId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                >
                  {accounts.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name} ({a.balance} €)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Hacia (Destino)
                </label>
                <select
                  value={toPaymentMethodId}
                  onChange={(e) => setToPaymentMethodId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                >
                  {accounts.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name} ({a.balance} €)
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Concepto / Descripción
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ej: Comida, Nafta, Materiales Rotuprint..."
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
              required
            />
          </div>

          {/* Category & Subcategory (for Income and Expense) */}
          {type !== 'transfer' && (
            <div className="space-y-3">
              {catCreationFeedback && (
                <div className="p-2.5 bg-emerald-950/40 border border-emerald-500/40 rounded-xl text-xs text-emerald-300 font-semibold flex items-center gap-2 animate-fadeIn">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{catCreationFeedback}</span>
                </div>
              )}

              {/* INLINE CATEGORY CREATOR PANEL */}
              {isCreatingCategory && (
                <div className="p-3.5 bg-slate-900 border border-emerald-500/40 rounded-xl space-y-3 shadow-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-emerald-400" />
                      <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                        Crear Nueva Categoría
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsCreatingCategory(false)}
                      className="text-slate-400 hover:text-white text-xs px-1.5 py-0.5 rounded transition-colors"
                    >
                      Cancelar
                    </button>
                  </div>

                  {/* Quick Preset Chips */}
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs scrollbar-none">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold shrink-0">
                      Sugerencias:
                    </span>
                    {[
                      { name: '🌿 Weed / María', subs: 'Flores / Cogollos, Papelillos, Parafernalia' },
                      { name: '🚬 Tabaco', subs: 'Paquete / Armar, Filtros, Papelillos' },
                      { name: '🎮 Ocio / Salidas', subs: 'Bares, Eventos, Gaming' },
                      { name: '🏋️ Gimnasio', subs: 'Cuota, Suplementos' },
                      { name: '💊 Salud / Farmacia', subs: 'Medicamentos, Consultas' },
                    ].map((preset) => (
                      <button
                        key={preset.name}
                        type="button"
                        onClick={() => {
                          setNewCatName(preset.name);
                          setNewCatSubs(preset.subs);
                        }}
                        className="px-2 py-0.5 bg-slate-800 hover:bg-emerald-950/60 text-slate-300 hover:text-emerald-300 border border-slate-700 hover:border-emerald-500/50 rounded-md shrink-0 transition-colors"
                      >
                        {preset.name}
                      </button>
                    ))}
                  </div>

                  <div className="grid grid-cols-12 gap-2">
                    <div className="col-span-12 sm:col-span-6">
                      <label className="block text-[11px] font-medium text-slate-300 mb-0.5">
                        Nombre de la categoría *
                      </label>
                      <input
                        type="text"
                        value={newCatName}
                        onChange={(e) => setNewCatName(e.target.value)}
                        placeholder="Ej: Weed, Ocio, Suplementos..."
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
                        autoFocus
                      />
                    </div>
                    <div className="col-span-12 sm:col-span-6">
                      <label className="block text-[11px] font-medium text-slate-300 mb-0.5">
                        Subcategorías (separadas por coma)
                      </label>
                      <input
                        type="text"
                        value={newCatSubs}
                        onChange={(e) => setNewCatSubs(e.target.value)}
                        placeholder="Ej: Flores, Papelillos, Otros"
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setIsCreatingCategory(false)}
                      className="px-2.5 py-1 text-xs text-slate-400 hover:text-white transition-colors"
                    >
                      Descartar
                    </button>
                    <button
                      type="button"
                      disabled={!newCatName.trim() || isSubmittingCat}
                      onClick={() => handleCreateCategory()}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-lg text-xs font-bold shadow-md shadow-emerald-600/30 transition-all"
                    >
                      <Check className="w-3.5 h-3.5" />
                      {isSubmittingCat ? 'Creando...' : 'Crear y Seleccionar'}
                    </button>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                {/* Categoría Selector */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-slate-300">Categoría</label>
                    {!isCreatingCategory && (
                      <button
                        type="button"
                        onClick={() => setIsCreatingCategory(true)}
                        className="text-[11px] font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 bg-emerald-950/40 hover:bg-emerald-900/40 px-2 py-0.5 rounded-lg border border-emerald-800/40 transition-all"
                        title="Crear nueva categoría"
                      >
                        <Plus className="w-3 h-3" /> + Nueva
                      </button>
                    )}
                  </div>
                  <select
                    value={categoryId}
                    onChange={(e) => {
                      if (e.target.value === '__NEW_CATEGORY__') {
                        setIsCreatingCategory(true);
                      } else {
                        setCategoryId(e.target.value);
                        setSubcategoryId('');
                      }
                    }}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                  >
                    {categoriesList.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                    <option value="__NEW_CATEGORY__" className="text-emerald-400 font-bold">
                      ✨ + Crear nueva categoría (ej: Weed)...
                    </option>
                  </select>
                </div>

                {/* Subcategoría Selector */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-slate-300">
                      Subcategoría
                    </label>
                    {!isAddingSub && categoryId && (
                      <button
                        type="button"
                        onClick={() => setIsAddingSub(true)}
                        className="text-[10px] font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-0.5 transition-colors"
                        title="Añadir subcategoría"
                      >
                        <Plus className="w-3 h-3" /> + Sub
                      </button>
                    )}
                  </div>

                  {isAddingSub ? (
                    <div className="flex items-center gap-1">
                      <input
                        type="text"
                        value={newSubName}
                        onChange={(e) => setNewSubName(e.target.value)}
                        placeholder="Nueva subcat..."
                        className="w-full bg-slate-900 border border-blue-500 rounded-xl px-2 py-1.5 text-xs text-white focus:outline-none"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddSubcategory();
                          }
                        }}
                      />
                      <button
                        type="button"
                        disabled={!newSubName.trim() || isSubmittingSub}
                        onClick={() => handleAddSubcategory()}
                        className="p-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors shrink-0"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsAddingSub(false);
                          setNewSubName('');
                        }}
                        className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors shrink-0"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <select
                      value={subcategoryId}
                      onChange={(e) => setSubcategoryId(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                    >
                      <option value="">General</option>
                      {currentCategory?.subcategories.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Project (Optional) */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Imputar a Proyecto (Opcional)
            </label>
            <select
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
            >
              <option value="">Ninguno (Finanzas Personales)</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Notes (Optional) */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Nota Opcional
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Detalle o nota adicional..."
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
            />
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
              className="px-5 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-lg shadow-blue-500/20 transition-colors disabled:opacity-50"
            >
              {loading ? 'Guardando...' : 'Guardar Movimiento'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
