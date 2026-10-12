import React, { useState } from 'react';
import {
  Sparkles,
  Plus,
  Trash2,
  Table,
  CheckCircle2,
  Calendar,
  Layers,
  ArrowRight,
  RefreshCw,
  FolderPlus,
} from 'lucide-react';
import { CustomAiModule } from '../types';
import { api } from '../services/api';

interface CustomModulesViewProps {
  customModules: CustomAiModule[];
  onRefreshData: () => void;
}

export const CustomModulesView: React.FC<CustomModulesViewProps> = ({
  customModules,
  onRefreshData,
}) => {
  const [selectedModuleId, setSelectedModuleId] = useState<string>(
    customModules[0]?.id || ''
  );
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [isNewItemModalOpen, setIsNewItemModalOpen] = useState(false);
  const [newItemData, setNewItemData] = useState<Record<string, any>>({});
  const [isCreatingManual, setIsCreatingManual] = useState(false);
  const [manualTitle, setManualTitle] = useState('');
  const [manualDesc, setManualDesc] = useState('');

  const activeModule = customModules.find((m) => m.id === selectedModuleId) || customModules[0];

  const handleGenerateAi = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiPrompt.trim()) return;

    setIsGeneratingAi(true);
    try {
      const generated = await api.generateCustomModuleWithAi(aiPrompt.trim());
      setAiPrompt('');
      onRefreshData();
      if (generated && generated.id) {
        setSelectedModuleId(generated.id);
      }
    } catch (err) {
      console.error('Error generating AI module:', err);
    } finally {
      setIsGeneratingAi(false);
    }
  };

  const handleCreateManual = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualTitle.trim()) return;

    try {
      const created = await api.createCustomModule({
        title: manualTitle.trim(),
        description: manualDesc.trim() || undefined,
        icon: 'Layers',
        fields: [
          { key: 'title', label: 'Título / Elemento', type: 'text' },
          { key: 'status', label: 'Estado', type: 'status' },
          { key: 'date', label: 'Fecha', type: 'date' },
          { key: 'notes', label: 'Notas', type: 'text' },
        ],
        items: [],
      });
      setManualTitle('');
      setManualDesc('');
      setIsCreatingManual(false);
      onRefreshData();
      if (created?.id) setSelectedModuleId(created.id);
    } catch (err) {
      console.error('Error creating manual module:', err);
    }
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeModule) return;

    try {
      await api.addCustomModuleItem(activeModule.id, newItemData);
      setNewItemData({});
      setIsNewItemModalOpen(false);
      onRefreshData();
    } catch (err) {
      console.error('Error adding item to module:', err);
    }
  };

  const handleDeleteModule = async (id: string) => {
    if (!confirm('¿Seguro que querés eliminar este módulo y sus registros?')) return;
    try {
      await api.deleteCustomModule(id);
      onRefreshData();
    } catch (err) {
      console.error('Error deleting module:', err);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center justify-center">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                Módulos Dinámicos con IA
              </h1>
              <p className="text-xs sm:text-sm text-slate-400">
                Creá cualquier módulo o herramienta personalizada que necesites para tu día a día
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => setIsCreatingManual(!isCreatingManual)}
          className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold border border-slate-700"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Crear Manualmente</span>
        </button>
      </div>

      {/* AI Module Creator Prompt Bar */}
      <div className="bg-gradient-to-r from-purple-950/40 via-slate-900 to-indigo-950/40 border border-purple-500/30 rounded-2xl p-4 sm:p-5 shadow-lg">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-4 h-4 text-purple-400" />
          <h2 className="text-xs font-bold text-purple-300 uppercase tracking-wider">
            Pedile a JARVIS qué querés controlar
          </h2>
        </div>
        <p className="text-xs text-slate-400 mb-3">
          Escribí en lenguaje natural. Ejemplo: <em>"Quiero controlar cuántos clientes contacto por día para Creko"</em> o <em>"Seguimiento de compras de herramientas y materiales"</em>.
        </p>

        <form onSubmit={handleGenerateAi} className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            placeholder="¿Qué herramienta o planilla necesitás crear hoy?..."
            className="flex-1 bg-slate-950 border border-purple-500/40 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-purple-400 placeholder-slate-500"
          />
          <button
            type="submit"
            disabled={isGeneratingAi || !aiPrompt.trim()}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-purple-600/30 transition-all active:scale-95 disabled:opacity-50 shrink-0"
          >
            {isGeneratingAi ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            <span>{isGeneratingAi ? 'Diseñando con IA...' : 'Crear Módulo con IA'}</span>
          </button>
        </form>
      </div>

      {/* Manual creation form if opened */}
      {isCreatingManual && (
        <form
          onSubmit={handleCreateManual}
          className="bg-slate-900 border border-slate-700 p-4 rounded-2xl space-y-3"
        >
          <h3 className="text-sm font-semibold text-white">Nuevo Módulo Personalizado</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              type="text"
              required
              value={manualTitle}
              onChange={(e) => setManualTitle(e.target.value)}
              placeholder="Nombre del módulo (ej. Gastos de Taller)"
              className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
            />
            <input
              type="text"
              value={manualDesc}
              onChange={(e) => setManualDesc(e.target.value)}
              placeholder="Descripción breve..."
              className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsCreatingManual(false)}
              className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold"
            >
              Guardar Módulo
            </button>
          </div>
        </form>
      )}

      {/* Module Selector Tabs */}
      {customModules.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar scrollbar-none pb-2 border-b border-slate-800">
          {customModules.map((mod) => (
            <button
              key={mod.id}
              onClick={() => setSelectedModuleId(mod.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap flex items-center gap-2 ${
                activeModule?.id === mod.id
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <span>{mod.title}</span>
              <span className="text-[10px] opacity-75 bg-black/20 px-1.5 py-0.5 rounded-full">
                {mod.items.length}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Active Module Content */}
      {activeModule ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
            <div>
              <h2 className="text-lg font-bold text-white">{activeModule.title}</h2>
              {activeModule.description && (
                <p className="text-xs text-slate-400 mt-0.5">{activeModule.description}</p>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setNewItemData({});
                  setIsNewItemModalOpen(true);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-semibold transition-all active:scale-95 shadow-md shadow-purple-600/20"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Agregar Registro</span>
              </button>

              <button
                onClick={() => handleDeleteModule(activeModule.id)}
                className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors"
                title="Eliminar módulo"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Table / Grid */}
          {activeModule.items.length === 0 ? (
            <div className="text-center py-10 text-slate-500 text-xs">
              <p>No hay registros todavía en este módulo.</p>
              <button
                onClick={() => setIsNewItemModalOpen(true)}
                className="mt-2 text-purple-400 hover:underline inline-flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Agregar primer registro
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950/60 text-slate-400 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-800">
                  <tr>
                    {activeModule.fields.map((f) => (
                      <th key={f.key} className="px-4 py-3">
                        {f.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {activeModule.items.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                      {activeModule.fields.map((f) => {
                        const val = row[f.key];
                        return (
                          <td key={f.key} className="px-4 py-3 whitespace-nowrap">
                            {f.type === 'status' ? (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-500/15 text-purple-300 border border-purple-500/30">
                                {val || 'Pendiente'}
                              </span>
                            ) : f.type === 'number' ? (
                              <span className="font-mono font-semibold text-slate-200">
                                {typeof val === 'number' ? val : val || 0}
                              </span>
                            ) : (
                              <span>{String(val || '-')}</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-12 text-center text-slate-400">
          <Sparkles className="w-8 h-8 mx-auto mb-2 text-purple-400" />
          <p className="text-sm font-medium">Aún no creaste ningún módulo personalizado.</p>
          <p className="text-xs text-slate-500 mt-1">
            Usá el campo de arriba para que JARVIS diseñe la estructura que necesitás en segundos.
          </p>
        </div>
      )}

      {/* Add Item Modal */}
      {isNewItemModalOpen && activeModule && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-2xl shadow-2xl p-6">
            <h3 className="font-bold text-white text-base mb-1">
              Agregar a {activeModule.title}
            </h3>
            <p className="text-xs text-slate-400 mb-4">Completá los campos del registro:</p>

            <form onSubmit={handleAddItem} className="space-y-3.5">
              {activeModule.fields.map((field) => (
                <div key={field.key}>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    {field.label}
                  </label>
                  {field.type === 'number' ? (
                    <input
                      type="number"
                      step="any"
                      value={newItemData[field.key] ?? ''}
                      onChange={(e) =>
                        setNewItemData({
                          ...newItemData,
                          [field.key]: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                    />
                  ) : field.type === 'date' ? (
                    <input
                      type="date"
                      value={
                        newItemData[field.key] || new Date().toISOString().split('T')[0]
                      }
                      onChange={(e) =>
                        setNewItemData({ ...newItemData, [field.key]: e.target.value })
                      }
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                    />
                  ) : (
                    <input
                      type="text"
                      value={newItemData[field.key] || ''}
                      onChange={(e) =>
                        setNewItemData({ ...newItemData, [field.key]: e.target.value })
                      }
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                    />
                  )}
                </div>
              ))}

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsNewItemModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-semibold shadow-md"
                >
                  Guardar Registro
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
