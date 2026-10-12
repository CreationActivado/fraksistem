import React, { useState } from 'react';
import { X, ArrowDownLeft, AlertCircle } from 'lucide-react';
import { Project } from '../types';
import { api } from '../services/api';

interface PendingIncomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  projects: Project[];
  onSuccess: () => void;
}

export const PendingIncomeModal: React.FC<PendingIncomeModalProps> = ({
  isOpen,
  onClose,
  projects,
  onSuccess,
}) => {
  const [concept, setConcept] = useState('');
  const [amount, setAmount] = useState<number | ''>('');
  const [origin, setOrigin] = useState('');
  const [expectedDate, setExpectedDate] = useState('');
  const [projectId, setProjectId] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0 || !concept.trim()) return;

    setLoading(true);
    try {
      await api.createPendingIncome({
        concept: concept.trim(),
        amount: Number(amount),
        origin: origin.trim() || 'Cliente / Deudor',
        expectedDate: expectedDate || undefined,
        status: 'pending',
      });

      onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      alert('Error al registrar cobro pendiente');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#1E293B] border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl text-slate-200">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-950/50 border border-emerald-800/40 text-emerald-400 flex items-center justify-center">
              <ArrowDownLeft className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-white">Registrar Cobro Pendiente</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-3 bg-blue-950/30 border border-blue-800/40 rounded-xl flex items-start gap-2 text-xs text-blue-300">
          <AlertCircle className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" />
          <p>
            <strong className="text-white">Regla:</strong> Este monto NO se sumará a tu saldo disponible hasta que marques que el dinero ingresó a tu cuenta. Solo afectará tu posición proyectada.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Concepto del cobro
            </label>
            <input
              type="text"
              value={concept}
              onChange={(e) => setConcept(e.target.value)}
              placeholder="Ej: Cobro Electricista, Factura Diseño, Trabajo Freelance..."
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
              required
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Importe a cobrar (€)
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
                Fecha estimada
              </label>
              <input
                type="date"
                value={expectedDate}
                onChange={(e) => setExpectedDate(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Origen / Cliente que debe
            </label>
            <input
              type="text"
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
              placeholder="Ej: Electricista Juan, Estudio ABC..."
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Vincular a Proyecto (opcional)
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
              {loading ? 'Guardando...' : 'Guardar Cobro Pendiente'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
