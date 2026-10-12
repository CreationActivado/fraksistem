import React, { useState } from 'react';
import {
  Zap,
  Plus,
  CheckCircle2,
  Clock,
  Trash2,
  Euro,
  User,
  Calendar,
  Wallet,
  AlertCircle,
  Filter,
} from 'lucide-react';
import { Changa, Account } from '../types';
import { api } from '../services/api';

interface ChangasViewProps {
  changas: Changa[];
  accounts: Account[];
  onRefreshData: () => void;
}

export const ChangasView: React.FC<ChangasViewProps> = ({
  changas,
  accounts,
  onRefreshData,
}) => {
  const [filter, setFilter] = useState<'all' | 'pending' | 'paid'>('all');
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [selectedChangaForPay, setSelectedChangaForPay] = useState<Changa | null>(null);
  const [payAccountId, setPayAccountId] = useState(accounts[0]?.id || 'acc_cash');

  // Form State
  const [title, setTitle] = useState('');
  const [client, setClient] = useState('');
  const [amount, setAmount] = useState<number | ''>('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [isPaidImmediate, setIsPaidImmediate] = useState(false);
  const [initialAccountId, setInitialAccountId] = useState(accounts[0]?.id || 'acc_cash');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Stats
  const totalCobrado = changas
    .filter((c) => c.status === 'paid')
    .reduce((sum, c) => sum + c.amount, 0);
  const totalPendiente = changas
    .filter((c) => c.status === 'pending')
    .reduce((sum, c) => sum + c.amount, 0);

  const filteredChangas = changas.filter((c) => {
    if (filter === 'pending') return c.status === 'pending';
    if (filter === 'paid') return c.status === 'paid';
    return true;
  });

  const handleCreateChanga = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !amount || Number(amount) <= 0) return;

    setIsSubmitting(true);
    try {
      await api.createChanga({
        title: title.trim(),
        client: client.trim() || undefined,
        amount: Number(amount),
        date: date || new Date().toISOString().split('T')[0],
        status: isPaidImmediate ? 'paid' : 'pending',
        paymentMethodId: isPaidImmediate ? initialAccountId : undefined,
        notes: notes.trim() || undefined,
      });

      setTitle('');
      setClient('');
      setAmount('');
      setNotes('');
      setIsPaidImmediate(false);
      setIsNewModalOpen(false);
      onRefreshData();
    } catch (err) {
      console.error('Error creating changa:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTogglePaid = async (changa: Changa) => {
    if (changa.status === 'pending') {
      setSelectedChangaForPay(changa);
    } else {
      // Toggle back
      await api.toggleChangaPaid(changa.id);
      onRefreshData();
    }
  };

  const handleConfirmPay = async () => {
    if (!selectedChangaForPay) return;
    try {
      await api.toggleChangaPaid(selectedChangaForPay.id, payAccountId);
      setSelectedChangaForPay(null);
      onRefreshData();
    } catch (err) {
      console.error('Error toggling paid state:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar esta changa del registro?')) return;
    try {
      await api.deleteChanga(id);
      onRefreshData();
    } catch (err) {
      console.error('Error deleting changa:', err);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                Gestión de Changas & Oficios
              </h1>
              <p className="text-xs sm:text-sm text-slate-400">
                Electricidad, reparaciones, cartelería e ingresos rápidos independientes
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsNewModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-amber-600/25 transition-all active:scale-95"
            id="btn-new-changa"
          >
            <Plus className="w-4 h-4" />
            <span>Registrar Changa</span>
          </button>
        </div>
      </div>

      {/* Stats Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5">
          <span className="text-xs text-slate-400 font-medium">Total Changas Registradas</span>
          <div className="text-2xl font-bold text-white mt-1">{changas.length}</div>
          <p className="text-[11px] text-slate-500 mt-1">Trabajos rápidos e ingresos eventuales</p>
        </div>

        <div className="bg-slate-900 border border-emerald-500/20 rounded-2xl p-4 sm:p-5">
          <span className="text-xs text-emerald-400 font-medium flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Total Cobrado
          </span>
          <div className="text-2xl font-bold text-emerald-400 mt-1">
            {totalCobrado.toFixed(2)} €
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Ingresado a cuentas de caja o banco</p>
        </div>

        <div className="bg-slate-900 border border-amber-500/20 rounded-2xl p-4 sm:p-5">
          <span className="text-xs text-amber-400 font-medium flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" /> Pendiente de Cobro
          </span>
          <div className="text-2xl font-bold text-amber-400 mt-1">
            {totalPendiente.toFixed(2)} €
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Dinero pendiente por reclamar o cobrar</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            filter === 'all'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          Todas ({changas.length})
        </button>
        <button
          onClick={() => setFilter('pending')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
            filter === 'pending'
              ? 'bg-amber-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Clock className="w-3 h-3" />
          <span>Por Cobrar ({changas.filter((c) => c.status === 'pending').length})</span>
        </button>
        <button
          onClick={() => setFilter('paid')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
            filter === 'paid'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <CheckCircle2 className="w-3 h-3" />
          <span>Cobradas ({changas.filter((c) => c.status === 'paid').length})</span>
        </button>
      </div>

      {/* List */}
      <div className="space-y-3">
        {filteredChangas.length === 0 ? (
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-12 text-center text-slate-400">
            <Zap className="w-8 h-8 mx-auto mb-2 text-slate-600" />
            <p className="text-sm font-medium">No hay changas en esta sección.</p>
            <p className="text-xs text-slate-500 mt-1">
              Registrá cualquier arreglo eléctrico, colocación o trabajo rápido.
            </p>
          </div>
        ) : (
          filteredChangas.map((changa) => (
            <div
              key={changa.id}
              className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all"
            >
              <div className="flex items-start gap-3">
                <button
                  onClick={() => handleTogglePaid(changa)}
                  className={`mt-0.5 p-1 rounded-lg border transition-all ${
                    changa.status === 'paid'
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 hover:bg-emerald-500/30'
                      : 'bg-slate-800 text-slate-400 border-slate-700 hover:border-amber-500 hover:text-amber-400'
                  }`}
                  title={changa.status === 'paid' ? 'Marcar como pendiente' : 'Marcar como cobrado'}
                >
                  <CheckCircle2 className="w-5 h-5" />
                </button>

                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-white text-sm sm:text-base">{changa.title}</h3>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                        changa.status === 'paid'
                          ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                          : 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                      }`}
                    >
                      {changa.status === 'paid' ? 'Cobrado' : 'Pendiente de cobro'}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mt-1.5">
                    {changa.client && (
                      <span className="flex items-center gap-1">
                        <User className="w-3.5 h-3.5 text-slate-500" />
                        {changa.client}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-500" />
                      {changa.date}
                    </span>
                    {changa.notes && (
                      <span className="text-slate-500 italic max-w-xs truncate">
                        "{changa.notes}"
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800">
                <div className="text-right">
                  <span className="text-xs text-slate-500 block">Monto</span>
                  <span className="text-lg font-bold text-emerald-400">
                    +{changa.amount.toFixed(2)} €
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  {changa.status === 'pending' && (
                    <button
                      onClick={() => handleTogglePaid(changa)}
                      className="px-3 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 rounded-xl text-xs font-semibold transition-all"
                    >
                      Cobrar
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(changa.id)}
                    className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors"
                    title="Eliminar changa"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* New Changa Modal */}
      {isNewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-2xl shadow-2xl p-6">
            <h3 className="font-bold text-white text-lg mb-1 flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-400" /> Registrar Changa
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Añadí un trabajo o servicio rápido. Si ya lo cobraste, se sumará a tus saldos reales.
            </p>

            <form onSubmit={handleCreateChanga} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Descripción del trabajo *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ej. Arreglo cuadro eléctrico bar"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Monto (€) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value === '' ? '' : parseFloat(e.target.value))}
                    placeholder="120.00"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm font-bold text-emerald-400 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Fecha
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Cliente o lugar (opcional)
                </label>
                <input
                  type="text"
                  value={client}
                  onChange={(e) => setClient(e.target.value)}
                  placeholder="Ej. Bar DejaVu / Juan Pérez"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="pt-2 border-t border-slate-800">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isPaidImmediate}
                    onChange={(e) => setIsPaidImmediate(e.target.checked)}
                    className="rounded border-slate-700 bg-slate-950 text-amber-500 focus:ring-amber-500"
                  />
                  <span className="text-xs font-medium text-slate-300">
                    Ya está cobrado (impactar dinero en saldo)
                  </span>
                </label>
              </div>

              {isPaidImmediate && (
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    Cuenta receptora
                  </label>
                  <select
                    value={initialAccountId}
                    onChange={(e) => setInitialAccountId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                  >
                    {accounts.map((acc) => (
                      <option key={acc.id} value={acc.id}>
                        {acc.name} ({acc.balance.toFixed(2)} €)
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Notas (opcional)
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Materiales usados, pendiente de rematar..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsNewModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white rounded-xl hover:bg-slate-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 text-xs font-semibold bg-amber-600 hover:bg-amber-500 text-white rounded-xl shadow-md transition-all active:scale-95"
                >
                  Guardar Changa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Pay Confirmation Modal */}
      {selectedChangaForPay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-sm rounded-2xl shadow-2xl p-6">
            <h3 className="font-bold text-white text-base mb-1 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" /> Confirmar Cobro
            </h3>
            <p className="text-xs text-slate-400 mb-3">
              Vas a marcar como cobrada la changa: <strong className="text-slate-200">"{selectedChangaForPay.title}"</strong> por importe de <strong className="text-emerald-400">+{selectedChangaForPay.amount.toFixed(2)} €</strong>.
            </p>

            <div className="mb-4">
              <label className="block text-xs font-medium text-slate-300 mb-1">
                ¿Dónde ingresó el dinero?
              </label>
              <select
                value={payAccountId}
                onChange={(e) => setPayAccountId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
              >
                {accounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.name} ({acc.balance.toFixed(2)} €)
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setSelectedChangaForPay(null)}
                className="px-3 py-1.5 text-xs text-slate-400 hover:text-white rounded-xl"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmPay}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl shadow-md transition-all active:scale-95"
              >
                Confirmar e Ingresar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
