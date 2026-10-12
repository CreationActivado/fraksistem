import React, { useState } from 'react';
import { X, Hammer, CheckCircle2, DollarSign, Calendar, Plus } from 'lucide-react';
import { api } from '../services/api';
import { Account } from '../types';

interface QuickChangaModalProps {
  isOpen: boolean;
  onClose: () => void;
  accounts: Account[];
  onSuccess: () => void;
}

export const QuickChangaModal: React.FC<QuickChangaModalProps> = ({
  isOpen,
  onClose,
  accounts,
  onSuccess,
}) => {
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedPlace, setSelectedPlace] = useState<'DejaVu' | 'Josu / Electricidad' | string>('DejaVu');
  const [customCategory, setCustomCategory] = useState('');
  const [isAddingCustom, setIsAddingCustom] = useState(false);
  
  // Step 2 fields
  const [amount, setAmount] = useState<string>('');
  const [isPaid, setIsPaid] = useState<boolean>(true);
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [selectedAccountId, setSelectedAccountId] = useState<string>('acc_cash');
  const [notes, setNotes] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSelectPlace = (place: string) => {
    setSelectedPlace(place);
    setStep(2);
  };

  const handleAddCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customCategory.trim()) return;
    setSelectedPlace(customCategory.trim());
    setIsAddingCustom(false);
    setStep(2);
  };

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) return;

    setSubmitting(true);
    try {
      // 1. Create changa record
      await api.createChanga({
        title: `Changa en ${selectedPlace}`,
        categoryName: selectedPlace,
        clientOrPerson: selectedPlace,
        amount: numAmount,
        paid: isPaid,
        status: isPaid ? 'paid' : 'pending',
        date,
        paymentMethodId: isPaid ? (selectedAccountId || 'acc_cash') : undefined,
        notes: notes.trim() || undefined,
      });

      // 2. If paid: register immediate income in the chosen account
      if (isPaid) {
        await api.createTransaction({
          type: 'income',
          amount: numAmount,
          currency: 'EUR',
          status: 'confirmed',
          source: 'changa',
          date,
          description: `Ingreso changa: ${selectedPlace}`,
          categoryId: 'cat_gen_ingresos',
          paymentMethodId: selectedAccountId || 'acc_cash',
          notes: notes.trim() ? `Changa: ${notes.trim()}` : `Changa realizada en ${selectedPlace}`,
        });
      } else {
        // 3. If not paid yet: register as Pending Income (Cobro pendiente)
        await api.createPendingIncome({
          concept: `Cobro changa: ${selectedPlace}`,
          amount: numAmount,
          origin: selectedPlace,
          expectedDate: date,
          notes: `Changa completada pendiente de cobro`,
        });
      }

      onSuccess();
      onClose();
      // Reset
      setStep(1);
      setAmount('');
      setIsPaid(true);
      setNotes('');
    } catch (err) {
      console.error('Error al registrar changa:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#1E293B] border border-slate-700/80 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Hammer className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                Nueva Changa
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/30">
                  Ingreso rápido
                </span>
              </h2>
              <p className="text-[11px] text-slate-400">
                {step === 1 ? 'Paso 1: ¿Dónde hiciste el trabajo?' : `Paso 2: Detalles en ${selectedPlace}`}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-slate-800 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        {step === 1 ? (
          <div className="p-5 space-y-4">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
              ¿DÓNDE?
            </span>

            <div className="grid grid-cols-1 gap-2.5">
              <button
                type="button"
                onClick={() => handleSelectPlace('DejaVu')}
                className="w-full p-3.5 rounded-xl bg-slate-900/80 hover:bg-amber-950/30 border border-slate-800 hover:border-amber-500/50 text-left transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full border-2 border-slate-500 group-hover:border-amber-400" />
                  <div>
                    <span className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors">
                      DejaVu
                    </span>
                    <p className="text-[11px] text-slate-400">Bar / Barra / Apoyo eventos</p>
                  </div>
                </div>
                <span className="text-xs text-amber-400 font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                  Seleccionar →
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleSelectPlace('Josu / Electricidad')}
                className="w-full p-3.5 rounded-xl bg-slate-900/80 hover:bg-amber-950/30 border border-slate-800 hover:border-amber-500/50 text-left transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full border-2 border-slate-500 group-hover:border-amber-400" />
                  <div>
                    <span className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors">
                      Josu / Electricidad
                    </span>
                    <p className="text-[11px] text-slate-400">Instalaciones, reparaciones y oficios</p>
                  </div>
                </div>
                <span className="text-xs text-amber-400 font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                  Seleccionar →
                </span>
              </button>

              {isAddingCustom ? (
                <form onSubmit={handleAddCustom} className="p-3 rounded-xl bg-slate-900/90 border border-amber-500/40 space-y-2.5">
                  <label className="text-xs font-semibold text-amber-300 block">
                    Nombre del lugar, cliente o rubro:
                  </label>
                  <input
                    type="text"
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                    placeholder="Ej. Pintura, Jardinería, Cliente X..."
                    autoFocus
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                  <div className="flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setIsAddingCustom(false)}
                      className="px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={!customCategory.trim()}
                      className="px-3.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold disabled:opacity-50"
                    >
                      Continuar →
                    </button>
                  </div>
                </form>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsAddingCustom(true)}
                  className="w-full p-3 rounded-xl border border-dashed border-slate-700 hover:border-amber-500/60 text-slate-400 hover:text-amber-300 text-xs font-semibold flex items-center justify-center gap-2 transition-all hover:bg-amber-500/5"
                >
                  <Plus className="w-4 h-4" /> + Nueva categoría / cliente
                </button>
              )}
            </div>
          </div>
        ) : (
          <form onSubmit={handleConfirm} className="p-5 space-y-4">
            {/* Selected Place Badge */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="text-xs text-slate-400">Lugar seleccionado:</span>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-xs font-bold text-amber-400 hover:underline flex items-center gap-1"
              >
                {selectedPlace} <span className="text-[10px] font-normal text-slate-400">(cambiar)</span>
              </button>
            </div>

            {/* Monto */}
            <div>
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-1.5">
                Monto (€)
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-base">€</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  autoFocus
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-lg font-bold text-white focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            {/* ¿Te pagaron? */}
            <div>
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-1.5">
                ¿Te pagaron?
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsPaid(true)}
                  className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                    isPaid
                      ? 'bg-emerald-950/60 border-emerald-500 text-emerald-200 ring-1 ring-emerald-500/50'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <CheckCircle2 className={`w-4 h-4 ${isPaid ? 'text-emerald-400' : 'text-slate-600'}`} />
                  Sí (Cobrado)
                </button>
                <button
                  type="button"
                  onClick={() => setIsPaid(false)}
                  className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                    !isPaid
                      ? 'bg-amber-950/60 border-amber-500 text-amber-200 ring-1 ring-amber-500/50'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <span className={`w-2.5 h-2.5 rounded-full ${!isPaid ? 'bg-amber-400 animate-pulse' : 'bg-slate-600'}`} />
                  No (Cobro pendiente)
                </button>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                {isPaid
                  ? '✓ Se sumará a tu saldo disponible real'
                  : '⏳ Se guardará en tus Cobros Pendientes para reclamarlo'}
              </p>
            </div>

            {/* If paid, choose which account */}
            {isPaid && (
              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">
                  ¿Dónde ingresó el dinero?
                </label>
                <select
                  value={selectedAccountId}
                  onChange={(e) => setSelectedAccountId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                >
                  {accounts.map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.name} ({acc.balance} €)
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Fecha */}
            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1">
                Fecha
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Notas opcionales */}
            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1">
                Notas (opcional)
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ej. Turno 5 horas, materiales incluidos..."
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Submit */}
            <div className="pt-2 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-4 py-2.5 rounded-xl border border-slate-700 text-xs font-medium text-slate-300 hover:text-white"
              >
                Volver
              </button>
              <button
                type="submit"
                disabled={submitting || !amount || parseFloat(amount) <= 0}
                className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white text-xs font-bold shadow-lg shadow-amber-500/20 disabled:opacity-50 transition-all flex items-center justify-center gap-1.5"
                id="btn-confirm-changa"
              >
                <CheckCircle2 className="w-4 h-4" />
                {submitting ? 'Guardando...' : 'Confirmar Changa'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
