import React, { useState } from 'react';
import { X, ArrowRightLeft, AlertCircle } from 'lucide-react';
import { Account } from '../types';
import { api } from '../services/api';

interface TransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  accounts: Account[];
  onSuccess: () => void;
}

export const TransferModal: React.FC<TransferModalProps> = ({
  isOpen,
  onClose,
  accounts,
  onSuccess,
}) => {
  const [fromAccountId, setFromAccountId] = useState<string>(accounts[0]?.id || '');
  const [toAccountId, setToAccountId] = useState<string>(accounts[1]?.id || accounts[0]?.id || '');
  const [amount, setAmount] = useState<number | ''>('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) return;
    if (fromAccountId === toAccountId) {
      alert('La cuenta de origen y de destino no pueden ser la misma.');
      return;
    }

    setLoading(true);
    try {
      const fromAcc = accounts.find((a) => a.id === fromAccountId);
      const toAcc = accounts.find((a) => a.id === toAccountId);

      await api.createTransaction({
        type: 'transfer',
        amount: Number(amount),
        currency: 'EUR',
        paymentMethodId: fromAccountId,
        toPaymentMethodId: toAccountId,
        description: `Transferencia: ${fromAcc?.name} → ${toAcc?.name}`,
        notes: notes.trim() || undefined,
        date,
        status: 'confirmed',
        source: 'manual',
      });

      onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      alert('Error al realizar la transferencia');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#1E293B] border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl text-slate-200">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-950/50 border border-blue-800/40 text-blue-400 flex items-center justify-center">
              <ArrowRightLeft className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-white">Transferir entre mis Cuentas</h3>
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
            <strong className="text-white">Regla de integridad:</strong> Una transferencia entre mis propias cuentas NO cuenta como ingreso ni como gasto; solo redistribuye tus fondos.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Cuenta de Origen
              </label>
              <select
                value={fromAccountId}
                onChange={(e) => setFromAccountId(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-blue-500"
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
                Cuenta de Destino
              </label>
              <select
                value={toAccountId}
                onChange={(e) => setToAccountId(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-blue-500"
              >
                {accounts.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name} ({a.balance} €)
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Importe a transferir (€)
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

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Fecha</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Notas (opcional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ej: Traspaso a cuenta de ahorro, recarga de tarjeta..."
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
              {loading ? 'Transfiriendo...' : 'Confirmar Transferencia'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
