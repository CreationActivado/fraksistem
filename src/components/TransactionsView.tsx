import React, { useState } from 'react';
import {
  ArrowDownLeft,
  ArrowUpRight,
  ArrowRightLeft,
  Search,
  Filter,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  Clock,
  Calendar,
  AlertCircle,
  FileSpreadsheet,
  FolderTree,
} from 'lucide-react';
import {
  Transaction,
  Account,
  Category,
  Project,
  PendingIncome,
  FutureExpense,
} from '../types';
import { api } from '../services/api';
import { CategoryManagerModal } from './CategoryManagerModal';

interface TransactionsViewProps {
  transactions: Transaction[];
  accounts: Account[];
  categories: Category[];
  projects: Project[];
  pendingIncomes: PendingIncome[];
  futureExpenses: FutureExpense[];
  onRefreshData: () => void;
  onOpenNewTransaction: () => void;
  onOpenNewPendingIncome: () => void;
  onOpenNewFutureExpense: () => void;
}

export const TransactionsView: React.FC<TransactionsViewProps> = ({
  transactions,
  accounts,
  categories,
  projects,
  pendingIncomes,
  futureExpenses,
  onRefreshData,
  onOpenNewTransaction,
  onOpenNewPendingIncome,
  onOpenNewFutureExpense,
}) => {
  const [activeTab, setActiveTab] = useState<'transactions' | 'pending' | 'future'>('transactions');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterAccount, setFilterAccount] = useState<string>('all');
  const [filterProject, setFilterProject] = useState<string>('all');
  const [filterPeriod, setFilterPeriod] = useState<string>('all');

  // Receive modal state
  const [receivingPending, setReceivingPending] = useState<PendingIncome | null>(null);
  const [selectedReceiveAccount, setSelectedReceiveAccount] = useState<string>(accounts[0]?.id || '');

  // Pay future expense state
  const [payingFuture, setPayingFuture] = useState<FutureExpense | null>(null);
  const [selectedPayAccount, setSelectedPayAccount] = useState<string>(accounts[0]?.id || '');

  // Category Manager modal state
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);

  // Filter transactions
  const filteredTransactions = transactions.filter((t) => {
    if (filterType !== 'all' && t.type !== filterType) return false;
    if (filterAccount !== 'all' && t.paymentMethodId !== filterAccount && t.toPaymentMethodId !== filterAccount) return false;
    if (filterProject !== 'all' && t.projectId !== filterProject) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const matchDesc = t.description.toLowerCase().includes(q);
      const matchNotes = t.notes?.toLowerCase().includes(q);
      if (!matchDesc && !matchNotes) return false;
    }
    if (filterPeriod !== 'all') {
      const txDate = new Date(t.date);
      const now = new Date();
      if (filterPeriod === 'today') {
        const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        if (txDate < start) return false;
      } else if (filterPeriod === 'week') {
        const start = new Date();
        const day = now.getDay() || 7;
        start.setDate(now.getDate() - day + 1);
        start.setHours(0, 0, 0, 0);
        if (txDate < start) return false;
      } else if (filterPeriod === 'month') {
        const start = new Date(now.getFullYear(), now.getMonth(), 1);
        if (txDate < start) return false;
      }
    }
    return true;
  });

  const handleDeleteTransaction = async (id: string) => {
    if (window.confirm('¿Seguro que deseas eliminar este movimiento? Los saldos se reajustarán automáticamente.')) {
      try {
        await api.deleteTransaction(id);
        onRefreshData();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleConfirmReceivePending = async () => {
    if (!receivingPending || !selectedReceiveAccount) return;
    try {
      await api.markIncomeReceived(receivingPending.id, selectedReceiveAccount);
      setReceivingPending(null);
      onRefreshData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleConfirmPayFuture = async () => {
    if (!payingFuture || !selectedPayAccount) return;
    try {
      await api.markFutureExpensePaid(payingFuture.id, selectedPayAccount);
      setPayingFuture(null);
      onRefreshData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeletePendingIncome = async (id: string) => {
    try {
      await api.deletePendingIncome(id);
      onRefreshData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteFutureExpense = async (id: string) => {
    try {
      await api.deleteFutureExpense(id);
      onRefreshData();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 pb-24 max-w-6xl mx-auto text-slate-200">
      {/* Top action header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white">Movimientos y Flujo</h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Control exacto de ingresos, gastos, transferencias internas y previsiones
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {activeTab === 'transactions' && (
            <button
              onClick={onOpenNewTransaction}
              className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold shadow-lg shadow-blue-500/20 transition-all"
              id="btn-new-transaction"
            >
              <Plus className="w-4 h-4" />
              Nuevo Movimiento
            </button>
          )}

          {activeTab === 'pending' && (
            <button
              onClick={onOpenNewPendingIncome}
              className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold shadow-lg shadow-blue-500/20 transition-all"
              id="btn-new-pending-income"
            >
              <Plus className="w-4 h-4" />
              Nuevo Cobro Pendiente
            </button>
          )}

          {activeTab === 'future' && (
            <button
              onClick={onOpenNewFutureExpense}
              className="flex items-center gap-1.5 bg-amber-600 hover:bg-amber-500 text-white px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold shadow-lg shadow-amber-600/20 transition-all"
              id="btn-new-future-expense"
            >
              <Plus className="w-4 h-4" />
              Nuevo Gasto Futuro
            </button>
          )}

          <button
            onClick={() => setIsCategoryModalOpen(true)}
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold shadow-xs transition-all"
            title="Administrar Categorías de Gastos"
            id="btn-manage-categories"
          >
            <FolderTree className="w-4 h-4 text-purple-400" />
            <span className="hidden sm:inline">Categorías</span>
          </button>

          <a
            href="/api/export/csv"
            download="movimientos.csv"
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 px-3 py-2 rounded-xl text-xs font-semibold shadow-sm transition-all"
            title="Exportar a CSV"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span className="hidden sm:inline">Exportar CSV</span>
          </a>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800">
        <button
          onClick={() => setActiveTab('transactions')}
          className={`pb-3 px-4 text-xs sm:text-sm font-semibold border-b-2 transition-all ${
            activeTab === 'transactions'
              ? 'border-blue-500 text-blue-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Libro Diario ({transactions.length})
        </button>
        <button
          onClick={() => setActiveTab('pending')}
          className={`pb-3 px-4 text-xs sm:text-sm font-semibold border-b-2 transition-all ${
            activeTab === 'pending'
              ? 'border-blue-500 text-blue-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Cobros Pendientes ({pendingIncomes.filter((p) => p.status === 'pending').length})
        </button>
        <button
          onClick={() => setActiveTab('future')}
          className={`pb-3 px-4 text-xs sm:text-sm font-semibold border-b-2 transition-all ${
            activeTab === 'future'
              ? 'border-amber-500 text-amber-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Gastos Futuros ({futureExpenses.filter((f) => f.status === 'pending').length})
        </button>
      </div>

      {/* TAB 1: Real Transactions */}
      {activeTab === 'transactions' && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="bg-[#1E293B] p-4 rounded-2xl border border-slate-800 shadow-sm space-y-3">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar por concepto o notas..."
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2 text-xs sm:text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Type filter */}
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-300 focus:outline-none focus:border-blue-500"
              >
                <option value="all">Todos los tipos</option>
                <option value="expense">Solo Gastos</option>
                <option value="income">Solo Ingresos</option>
                <option value="transfer">Solo Transferencias</option>
              </select>

              {/* Period filter */}
              <select
                value={filterPeriod}
                onChange={(e) => setFilterPeriod(e.target.value)}
                className="bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-300 focus:outline-none focus:border-blue-500"
              >
                <option value="all">Todo el tiempo</option>
                <option value="today">Hoy</option>
                <option value="week">Esta semana</option>
                <option value="month">Este mes</option>
              </select>

              {/* Account filter */}
              <select
                value={filterAccount}
                onChange={(e) => setFilterAccount(e.target.value)}
                className="bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-300 focus:outline-none focus:border-blue-500"
              >
                <option value="all">Todas las cuentas</option>
                {accounts.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </select>

              {/* Project filter */}
              <select
                value={filterProject}
                onChange={(e) => setFilterProject(e.target.value)}
                className="bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-300 focus:outline-none focus:border-blue-500"
              >
                <option value="all">Todos los proyectos</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Transactions List */}
          <div className="bg-[#1E293B] rounded-2xl border border-slate-800 shadow-sm overflow-hidden">
            {filteredTransactions.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-sm">
                No se encontraron movimientos con los filtros seleccionados.
              </div>
            ) : (
              <div className="divide-y divide-slate-800">
                {filteredTransactions.map((tx) => {
                  const account = accounts.find((a) => a.id === tx.paymentMethodId);
                  const toAccount = tx.toPaymentMethodId ? accounts.find((a) => a.id === tx.toPaymentMethodId) : null;
                  const category = categories.find((c) => c.id === tx.categoryId);
                  const subcategory = category?.subcategories.find((s) => s.id === tx.subcategoryId);
                  const project = projects.find((p) => p.id === tx.projectId);

                  return (
                    <div
                      key={tx.id}
                      className="p-4 hover:bg-slate-800/50 transition-colors flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                            tx.type === 'income'
                              ? 'bg-emerald-950/50 text-emerald-400 border border-emerald-800/40'
                              : tx.type === 'expense'
                              ? 'bg-rose-950/50 text-rose-400 border border-rose-800/40'
                              : 'bg-blue-950/50 text-blue-400 border border-blue-800/40'
                          }`}
                        >
                          {tx.type === 'income' ? (
                            <ArrowDownLeft className="w-5 h-5" />
                          ) : tx.type === 'expense' ? (
                            <ArrowUpRight className="w-5 h-5" />
                          ) : (
                            <ArrowRightLeft className="w-5 h-5" />
                          )}
                        </div>

                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-white text-sm">
                              {tx.description}
                            </span>
                            {project && (
                              <span className="text-[10px] bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded-full font-semibold border border-blue-500/20">
                                {project.name}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5 flex-wrap">
                            <span>{tx.date}</span>
                            <span>•</span>
                            {tx.type === 'transfer' ? (
                              <span>
                                {account?.name} → {toAccount?.name}
                              </span>
                            ) : (
                              <span>{account?.name || 'Cuenta no especificada'}</span>
                            )}
                            {category && (
                              <>
                                <span>•</span>
                                <span>
                                  {category.name}
                                  {subcategory ? ` / ${subcategory.name}` : ''}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <span
                            className={`font-bold text-sm sm:text-base ${
                              tx.type === 'income'
                                ? 'text-emerald-400'
                                : tx.type === 'expense'
                                ? 'text-rose-400'
                                : 'text-slate-300'
                            }`}
                          >
                            {tx.type === 'income' ? '+' : tx.type === 'expense' ? '-' : ''}
                            {tx.amount.toLocaleString('es-ES', { minimumFractionDigits: 2 })} €
                          </span>
                          {tx.type === 'transfer' && (
                            <span className="block text-[10px] text-slate-500">Transferencia interna</span>
                          )}
                        </div>

                        <button
                          onClick={() => handleDeleteTransaction(tx.id)}
                          className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 rounded-lg transition-all"
                          title="Eliminar movimiento"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: Pending Incomes */}
      {activeTab === 'pending' && (
        <div className="space-y-4">
          <div className="bg-blue-950/30 border border-blue-800/40 p-4 rounded-2xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-400 mt-0.5 shrink-0" />
            <div className="text-xs text-blue-300">
              <p className="font-semibold">Regla financiera: No sumar dinero pendiente al disponible</p>
              <p className="opacity-90 mt-0.5 text-slate-400">
                Los cobros pendientes se consideran únicamente en la <strong className="text-white">posición proyectada</strong> hasta que se confirmen como recibidos en una de tus cuentas.
              </p>
            </div>
          </div>

          <div className="bg-[#1E293B] rounded-2xl border border-slate-800 shadow-sm overflow-hidden">
            {pendingIncomes.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-sm">
                No hay cobros pendientes registrados.
              </div>
            ) : (
              <div className="divide-y divide-slate-800">
                {pendingIncomes.map((p) => (
                  <div
                    key={p.id}
                    className="p-4 hover:bg-slate-800/50 transition-colors flex items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white text-sm">{p.concept}</span>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${
                            p.status === 'received'
                              ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                              : 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                          }`}
                        >
                          {p.status === 'received' ? 'Cobrado' : 'Pendiente'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Origen: <strong className="text-slate-300">{p.origin}</strong>
                        {p.expectedDate ? ` · Fecha estimada: ${p.expectedDate}` : ''}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className="font-bold text-base text-blue-400">
                          +{p.amount.toLocaleString('es-ES', { minimumFractionDigits: 2 })} €
                        </span>
                      </div>

                      {p.status === 'pending' && (
                        <button
                          onClick={() => setReceivingPending(p)}
                          className="flex items-center gap-1 bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-lg text-xs font-semibold shadow-lg shadow-emerald-600/20 transition-all"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Marcar Cobrado
                        </button>
                      )}

                      <button
                        onClick={() => handleDeletePendingIncome(p.id)}
                        className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 rounded-lg transition-all"
                        title="Eliminar cobro pendiente"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: Future Expenses */}
      {activeTab === 'future' && (
        <div className="space-y-4">
          <div className="bg-amber-950/30 border border-amber-800/40 p-4 rounded-2xl flex items-start gap-3">
            <Clock className="w-5 h-5 text-amber-400 mt-0.5 shrink-0" />
            <div className="text-xs text-amber-300">
              <p className="font-semibold">Gastos futuros y compromisos</p>
              <p className="opacity-90 mt-0.5 text-slate-400">
                Se deducen de tu posición proyectada para evitar sorpresas y garantizar que mantengas tu liquidez requerida.
              </p>
            </div>
          </div>

          <div className="bg-[#1E293B] rounded-2xl border border-slate-800 shadow-sm overflow-hidden">
            {futureExpenses.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-sm">
                No hay gastos futuros registrados.
              </div>
            ) : (
              <div className="divide-y divide-slate-800">
                {futureExpenses.map((f) => (
                  <div
                    key={f.id}
                    className="p-4 hover:bg-slate-800/50 transition-colors flex items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white text-sm">{f.concept}</span>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${
                            f.status === 'paid'
                              ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                              : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                          }`}
                        >
                          {f.status === 'paid' ? 'Pagado' : 'Pendiente'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Vencimiento: <strong className="text-slate-300">{f.dueDate}</strong>
                        {f.isRecurring ? ' · Gasto recurrente' : ''}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className="font-bold text-base text-amber-400">
                          -{f.amount.toLocaleString('es-ES', { minimumFractionDigits: 2 })} €
                        </span>
                      </div>

                      {f.status === 'pending' && (
                        <button
                          onClick={() => setPayingFuture(f)}
                          className="flex items-center gap-1 bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-lg text-xs font-semibold shadow-lg shadow-blue-500/20 transition-all"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Marcar Pagado
                        </button>
                      )}

                      <button
                        onClick={() => handleDeleteFutureExpense(f.id)}
                        className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 rounded-lg transition-all"
                        title="Eliminar gasto futuro"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal: Mark Pending Income as Received */}
      {receivingPending && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#1E293B] border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white">
              Confirmar ingreso de cobro
            </h3>
            <p className="text-xs text-slate-400">
              Ingresarás <strong className="text-emerald-400">{receivingPending.amount} €</strong> por "{receivingPending.concept}" ({receivingPending.origin}). ¿En qué cuenta ingresó el dinero?
            </p>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Cuenta de destino
              </label>
              <select
                value={selectedReceiveAccount}
                onChange={(e) => setSelectedReceiveAccount(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
              >
                {accounts.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name} ({a.balance} {a.currency})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setReceivingPending(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmReceivePending}
                className="px-4 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow-lg shadow-emerald-600/20 transition-colors"
              >
                Confirmar Cobro
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Mark Future Expense as Paid */}
      {payingFuture && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#1E293B] border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white">
              Registrar pago de gasto
            </h3>
            <p className="text-xs text-slate-400">
              Pagarás <strong className="text-amber-400">{payingFuture.amount} €</strong> por "{payingFuture.concept}". ¿Con qué medio o cuenta lo pagaste?
            </p>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Cuenta / Medio de pago
              </label>
              <select
                value={selectedPayAccount}
                onChange={(e) => setSelectedPayAccount(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
              >
                {accounts.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name} ({a.balance} {a.currency})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setPayingFuture(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmPayFuture}
                className="px-4 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-lg shadow-blue-500/20 transition-colors"
              >
                Confirmar Pago
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Category Manager Modal */}
      <CategoryManagerModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        categories={categories}
        onRefreshData={onRefreshData}
      />
    </div>
  );
};
