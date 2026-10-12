import React, { useState } from 'react';
import {
  X,
  Plus,
  Trash2,
  Tag,
  Check,
  Sparkles,
  Layers,
  Leaf,
  Flame,
  Search,
  FolderTree,
} from 'lucide-react';
import { Category } from '../types';
import { api } from '../services/api';

interface CategoryManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  onRefreshData: () => void;
}

const PRESET_ICONS = [
  { name: 'Leaf', label: '🌿 Weed / Plantas' },
  { name: 'Flame', label: '🔥 / 🚬 Tabaco' },
  { name: 'Tag', label: '🏷️ General' },
  { name: 'Layers', label: '📦 Varios' },
];

const PRESET_COLORS = [
  '#10b981', // emerald
  '#06b6d4', // cyan
  '#3b82f6', // blue
  '#8b5cf6', // purple
  '#ec4899', // pink
  '#f59e0b', // amber
  '#ef4444', // red
  '#6b7280', // gray
];

const SUGGESTIONS = [
  { name: '🌿 Weed / María', subs: 'Flores / Cogollos, Papelillos, Parafernalia', color: '#10b981' },
  { name: '🚬 Tabaco', subs: 'Paquete / Armar, Filtros, Papelillos', color: '#f97316' },
  { name: '🎮 Gaming & Ocio', subs: 'Bares, Salidas, Videojuegos', color: '#8b5cf6' },
  { name: '🏋️ Gimnasio & Fitness', subs: 'Cuota gym, Suplementos, Ropa deportiva', color: '#06b6d4' },
  { name: '💊 Salud & Farmacia', subs: 'Medicamentos, Consultas, Tratamientos', color: '#ec4899' },
  { name: '📚 Educación & Cursos', subs: 'Libros, Software educativo, Mentorías', color: '#f59e0b' },
];

export const CategoryManagerModal: React.FC<CategoryManagerModalProps> = ({
  isOpen,
  onClose,
  categories,
  onRefreshData,
}) => {
  const [search, setSearch] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [name, setName] = useState('');
  const [subcategoriesStr, setSubcategoriesStr] = useState('');
  const [color, setColor] = useState(PRESET_COLORS[0]);
  const [icon, setIcon] = useState('Tag');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Subcategory addition state
  const [selectedCatForSub, setSelectedCatForSub] = useState<string | null>(null);
  const [newSubName, setNewSubName] = useState('');
  const [isSubmittingSub, setIsSubmittingSub] = useState(false);

  if (!isOpen) return null;

  const filteredCategories = categories.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.subcategories.some((s) => s.name.toLowerCase().includes(search.toLowerCase()))
  );

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      const subs = subcategoriesStr
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      await api.createCategory(
        name.trim(),
        subs.length > 0 ? subs : ['General'],
        name.toLowerCase().includes('weed') || name.toLowerCase().includes('mari')
          ? 'Leaf'
          : name.toLowerCase().includes('tabac')
          ? 'Flame'
          : icon,
        color
      );

      setName('');
      setSubcategoriesStr('');
      setIsCreating(false);
      onRefreshData();
    } catch (err) {
      console.error(err);
      alert('Error al crear categoría');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCategory = async (id: string, catName: string) => {
    if (!window.confirm(`¿Seguro que querés eliminar la categoría "${catName}"?`)) return;
    try {
      await api.deleteCategory(id);
      onRefreshData();
    } catch (err) {
      console.error(err);
      alert('Error al eliminar categoría');
    }
  };

  const handleAddSubcategory = async (catId: string) => {
    if (!newSubName.trim()) return;
    setIsSubmittingSub(true);
    try {
      await api.addSubcategory(catId, newSubName.trim());
      setNewSubName('');
      setSelectedCatForSub(null);
      onRefreshData();
    } catch (err) {
      console.error(err);
      alert('Error al añadir subcategoría');
    } finally {
      setIsSubmittingSub(false);
    }
  };

  const handleDeleteSubcategory = async (catId: string, subId: string) => {
    try {
      await api.deleteSubcategory(catId, subId);
      onRefreshData();
    } catch (err) {
      console.error(err);
      alert('Error al eliminar subcategoría');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#1E293B] border border-slate-800 rounded-2xl max-w-2xl w-full p-6 space-y-5 shadow-2xl text-slate-200 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-500/20 border border-purple-500/30 text-purple-400 flex items-center justify-center">
              <FolderTree className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Gestor de Categorías de Gastos</h2>
              <p className="text-xs text-slate-400">
                Personalizá tus categorías (ej: Weed, Tabaco, Ocio) y subcategorías para registrar tus gastos
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Action bar: Search & New Category Button */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar categoría o subcategoría..."
              className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500"
            />
          </div>

          <button
            onClick={() => setIsCreating(!isCreating)}
            className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white px-3.5 py-2 rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 transition-all shrink-0"
          >
            <Plus className="w-4 h-4" />
            {isCreating ? 'Cerrar formulario' : 'Nueva Categoría'}
          </button>
        </div>

        {/* Form: Create new category */}
        {isCreating && (
          <form
            onSubmit={handleCreateCategory}
            className="p-4 bg-slate-900 border border-emerald-500/30 rounded-xl space-y-3 shrink-0"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 uppercase tracking-wide">
                <Sparkles className="w-3.5 h-3.5" /> Crear Nueva Categoría
              </span>
            </div>

            {/* Quick preset chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs scrollbar-none">
              <span className="text-[10px] text-slate-400 uppercase font-semibold shrink-0">
                Sugerencias:
              </span>
              {SUGGESTIONS.map((preset) => (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() => {
                    setName(preset.name);
                    setSubcategoriesStr(preset.subs);
                    setColor(preset.color);
                  }}
                  className="px-2 py-0.5 bg-slate-800 hover:bg-emerald-950/60 text-slate-300 hover:text-emerald-300 border border-slate-700 hover:border-emerald-500/50 rounded-md shrink-0 transition-colors"
                >
                  {preset.name}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-12 gap-3">
              <div className="col-span-12 sm:col-span-6">
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Nombre de Categoría *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ej: Weed, Vape, Suplementos, Pádel..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  required
                  autoFocus
                />
              </div>

              <div className="col-span-12 sm:col-span-6">
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Subcategorías (separadas por coma)
                </label>
                <input
                  type="text"
                  value={subcategoriesStr}
                  onChange={(e) => setSubcategoriesStr(e.target.value)}
                  placeholder="Ej: Flores, Papelillos, Parafernalia"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-slate-400">Color:</span>
                {PRESET_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    style={{ backgroundColor: c }}
                    className={`w-5 h-5 rounded-full transition-transform ${
                      color === c ? 'scale-125 ring-2 ring-white' : 'opacity-70 hover:opacity-100'
                    }`}
                  />
                ))}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={!name.trim() || isSubmitting}
                  className="flex items-center gap-1 px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-600/30"
                >
                  <Check className="w-3.5 h-3.5" />
                  {isSubmitting ? 'Guardando...' : 'Crear Categoría'}
                </button>
              </div>
            </div>
          </form>
        )}

        {/* Categories List */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1 scrollbar-thin scrollbar-thumb-slate-800">
          {filteredCategories.length === 0 ? (
            <div className="text-center py-10 text-slate-500 text-xs">
              No se encontraron categorías.
            </div>
          ) : (
            filteredCategories.map((cat) => (
              <div
                key={cat.id}
                className="p-3.5 bg-slate-900/70 border border-slate-800 hover:border-slate-700 rounded-xl space-y-2.5 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: cat.color || '#3b82f6' }}
                    />
                    <span className="text-sm font-bold text-white">{cat.name}</span>
                    {cat.isCustom && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 font-semibold">
                        Personalizada
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        setSelectedCatForSub(selectedCatForSub === cat.id ? null : cat.id)
                      }
                      className="text-xs text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1 px-2 py-1 rounded hover:bg-blue-950/40 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" /> Subcategoría
                    </button>

                    {cat.isCustom && (
                      <button
                        onClick={() => handleDeleteCategory(cat.id, cat.name)}
                        className="p-1 text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 rounded transition-colors"
                        title="Eliminar categoría"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Subcategories pill list */}
                <div className="flex flex-wrap items-center gap-1.5">
                  {cat.subcategories.map((sub) => (
                    <span
                      key={sub.id}
                      className="group text-xs bg-slate-800/80 text-slate-300 px-2.5 py-0.5 rounded-lg border border-slate-700 flex items-center gap-1.5"
                    >
                      <span>{sub.name}</span>
                      {cat.subcategories.length > 1 && (
                        <button
                          onClick={() => handleDeleteSubcategory(cat.id, sub.id)}
                          className="opacity-0 group-hover:opacity-100 hover:text-rose-400 transition-opacity"
                          title="Eliminar subcategoría"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </span>
                  ))}
                </div>

                {/* Add subcategory inline form */}
                {selectedCatForSub === cat.id && (
                  <div className="flex items-center gap-2 pt-1 border-t border-slate-800">
                    <input
                      type="text"
                      value={newSubName}
                      onChange={(e) => setNewSubName(e.target.value)}
                      placeholder="Nombre de subcategoría..."
                      className="flex-1 bg-slate-950 border border-blue-500/60 rounded-lg px-2.5 py-1 text-xs text-white placeholder:text-slate-500 focus:outline-none"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddSubcategory(cat.id);
                        }
                      }}
                    />
                    <button
                      type="button"
                      disabled={!newSubName.trim() || isSubmittingSub}
                      onClick={() => handleAddSubcategory(cat.id)}
                      className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold disabled:opacity-50 transition-colors"
                    >
                      Añadir
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedCatForSub(null);
                        setNewSubName('');
                      }}
                      className="px-2 py-1 text-xs text-slate-400 hover:text-white"
                    >
                      Cancelar
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
