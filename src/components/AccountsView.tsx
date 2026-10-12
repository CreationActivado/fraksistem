import React, { useState } from 'react';
import {
  CreditCard,
  Banknote,
  Building2,
  Wallet,
  ArrowRightLeft,
  Plus,
  Edit2,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { Account } from '../types';
import { api } from '../services/api';

interface AccountsViewProps {
  accounts: Account[];
  onRefreshData: () => void;
  onOpenTransfer: () => void;
}

export const AccountsView: React.FC<AccountsViewProps> = ({
  accounts,
  onRefreshData,
  onOpenTransfer,
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [type, setType] = useState<Account['type']>('bank_account');
  const [balance, setBalance] = useState<number>(0);
  const [currency, setCurrency] = useState('EUR');
  const [isReserve, setIsReserve] = useState(false);

  const totalBalance = accounts.reduce((sum, a) => sum + (a.active ? a.balance : 0), 0);

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      await api.createAccount({
        name: name.trim(),
        type,
        balance: Number(balance) || 0,
        currency,
        active: true,
        isReserve,
      });

      setIsCreating(false);
      setName('');
      setBalance(0);
      onRefreshData();
    } catch (err) {
      console.error('Error creating account:', err);
    }
  };

  const handleUpdateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAccount) return;

    try {
      await api.updateAccount(editingAccount.id, {
        name: editingAccount.name,
        balance: Number(editingAccount.balance),
        isReserve: editingAccount.isReserve,
      });

      setEditingAccount(null);
      onRefreshData();
    } catch (err) {
      console.error('Error updating account:', err);
    }
  };

  const getAccountIcon = (type: Account['type']) => {
    switch (type) {
      case 'cash':
        return <Banknote className="w-5 h-5 text-emerald-400" />;
      case 'credit_card':
        return <CreditCard className="w-5 h-5 text-orange-400" />;
      case 'bank_account':
        return <Building2 className="w-5 h-5 text-blue-400" />;
      default:
        return <Wallet className="w-5 h-5 text-blue-400" />;
    }
  };

  const getAccountTypeLabel = (type: Account['type']) => {
    switch (type) {
      case 'cash':
        return 'Efectivo';
      case 'credit_card':
        return 'Tarjeta';
      case 'bank_account':
        return 'Cuenta Bancaria';
      default:
        return 'Billetera Digital';
    }
  };

  return (
    <div className="space-y-6 pb-24 max-w-5xl mx-auto text-slate-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white">Cuentas y Medios de Pago</h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Administrá tus saldos reales, tarjetas y cuentas bancarias
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenTransfer}
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold shadow-sm transition-all"
            id="btn-transfer-between-accounts"
          >
            <ArrowRightLeft className="w-4 h-4 text-blue-400" />
            Transferir entre cuentas
          </button>

          <button
            onClick={() => setIsCreating(true)}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold shadow-lg shadow-blue-500/20 transition-all"
            id="btn-new-account"
          >
            <Plus className="w-4 h-4" />
            Nueva Cuenta
          </button>
        </div>
      </div>

      {/* Total Balance Card */}
      <div className="bg-gradient-to-tr from-slate-900 via-[#1E293B] to-slate-900 p-6 rounded-2xl text-white shadow-lg border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-blue-400">
            Total en Cuentas Activas
          </span>
          <div className="text-3xl sm:text-4xl font-extrabold mt-1 text-white">
            {totalBalance.toLocaleString('es-ES', { minimumFractionDigits: 2 })} €
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {accounts.filter((a) => a.active).length} cuentas y medios de pago activos
          </p>
        </div>

        <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-3 text-xs text-slate-300 max-w-sm">
          <p className="font-semibold flex items-center gap-1.5 text-white">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            Control de transferencias internas
          </p>
          <p className="text-slate-400 mt-1 text-[11px]">
            Las transferencias entre cuentas propias no computan como gasto ni ingreso, solo rebalancean tus fondos.
          </p>
        </div>
      </div>

      {/* Accounts Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {accounts.map((acc) => (
          <div
            key={acc.id}
            className="bg-[#1E293B] p-5 rounded-2xl border border-slate-800 shadow-sm hover:border-slate-700 transition-all relative flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                    {getAccountIcon(acc.type)}
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-sm">{acc.name}</h3>
                    <span className="text-[11px] text-slate-400 font-medium">
                      {getAccountTypeLabel(acc.type)}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setEditingAccount(acc)}
                  className="p-1.5 text-slate-500 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                  title="Editar cuenta"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="mt-2">
                <span className="text-xs text-slate-400">Saldo disponible</span>
                <div className="text-2xl font-bold text-white">
                  {acc.balance.toLocaleString('es-ES', { minimumFractionDigits: 2 })} {acc.currency}
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
              {acc.isReserve ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-purple-400 bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 rounded-full">
                  <ShieldCheck className="w-3 h-3" />
                  Fondos de Reserva
                </span>
              ) : (
                <span className="text-[11px] text-slate-500">Fondos operativos</span>
              )}

              <span
                className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                  acc.active
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                    : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}
              >
                {acc.active ? 'Activa' : 'Inactiva'}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Modal: New Account */}
      {isCreating && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#1E293B] border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white">Nueva Cuenta o Medio de Pago</h3>

            <form onSubmit={handleCreateAccount} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Nombre de la cuenta
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ej: Banco Santander, MercadoPago, Tarjeta Visa..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Tipo</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="bank_account">Cuenta Bancaria</option>
                    <option value="credit_card">Tarjeta</option>
                    <option value="cash">Efectivo</option>
                    <option value="digital_wallet">Billetera Digital</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Moneda</label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="EUR">EUR (€)</option>
                    <option value="USD">USD ($)</option>
                    <option value="ARS">ARS ($)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Saldo Inicial
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={balance}
                  onChange={(e) => setBalance(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="isReservedCheck"
                  checked={isReserve}
                  onChange={(e) => setIsReserve(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500 bg-slate-900 border-slate-700"
                />
                <label htmlFor="isReservedCheck" className="text-xs text-slate-300 font-medium">
                  Marcar como fondo de reserva de seguridad
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-lg shadow-blue-500/20 transition-colors"
                >
                  Guardar Cuenta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit Account */}
      {editingAccount && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#1E293B] border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white">Editar Cuenta</h3>

            <form onSubmit={handleUpdateAccount} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Nombre de la cuenta
                </label>
                <input
                  type="text"
                  value={editingAccount.name}
                  onChange={(e) => setEditingAccount({ ...editingAccount, name: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Saldo Actual
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={editingAccount.balance}
                  onChange={(e) =>
                    setEditingAccount({
                      ...editingAccount,
                      balance: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="editReservedCheck"
                  checked={editingAccount.isReserve}
                  onChange={(e) =>
                    setEditingAccount({ ...editingAccount, isReserve: e.target.checked })
                  }
                  className="rounded text-blue-600 focus:ring-blue-500 bg-slate-900 border-slate-700"
                />
                <label htmlFor="editReservedCheck" className="text-xs text-slate-300 font-medium">
                  Fondo de reserva de seguridad
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setEditingAccount(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-lg shadow-blue-500/20 transition-colors"
                >
                  Actualizar Cuenta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
