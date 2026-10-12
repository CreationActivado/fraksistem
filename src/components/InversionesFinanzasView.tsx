import React, { useState, useEffect } from 'react';
import {
  Wallet,
  TrendingUp,
  PiggyBank,
  ArrowDownLeft,
  ArrowUpRight,
  PieChart,
  DollarSign,
  Plus,
  Clock,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ShieldCheck,
  ChevronRight,
  Sliders,
  Building,
  Rocket,
  FolderKanban,
  Calculator,
  Layers,
  Euro,
  RefreshCw,
  Coins,
  LineChart,
  Percent,
} from 'lucide-react';
import { Account, FinancialSummary, PendingIncome, FutureExpense, Transaction, Project } from '../types';
import { api } from '../services/api';
import { cerebroSync } from '../services/cerebroSyncService';

interface InversionesFinanzasViewProps {
  summary: FinancialSummary | null;
  accounts: Account[];
  transactions: Transaction[];
  pendingIncomes: PendingIncome[];
  futureExpenses: FutureExpense[];
  projects: Project[];
  onRefreshData: () => void;
  onOpenNewTransaction: () => void;
  onOpenNewPendingIncome: () => void;
  initialTab?: 'regla4060' | 'acciones' | 'cripto' | 'pendientes' | 'movimientos';
}

export const InversionesFinanzasView: React.FC<InversionesFinanzasViewProps> = ({
  summary,
  accounts,
  transactions,
  pendingIncomes,
  futureExpenses,
  projects,
  onRefreshData,
  onOpenNewTransaction,
  onOpenNewPendingIncome,
  initialTab = 'regla4060',
}) => {
  const [activeTab, setActiveTab] = useState<'regla4060' | 'acciones' | 'cripto' | 'pendientes' | 'movimientos'>(initialTab);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  // Fran's Core Saving Thesis:
  // 40% Bolsillo / Día a día / Alquiler
  // 60% Inversión y Ahorro:
  //   -> 60% Acciones / ETFs
  //   -> 40% Criptomonedas
  const [pocketPercent, setPocketPercent] = useState<number>(40);
  const [investPercent, setInvestPercent] = useState<number>(60);
  const [stocksPercent, setStocksPercent] = useState<number>(60); // 60% of investment
  const [cryptoPercent, setCryptoPercent] = useState<number>(40); // 40% of investment

  const [simAmount, setSimAmount] = useState<number>(275); // Burger Palusa 300 $ ~ 275 €

  // Cocos Capital Allocation States (100 USD Fran's Plan)
  const [cocosTotalUSD, setCocosTotalUSD] = useState<number>(100);
  const [cocosSpyPercent, setCocosSpyPercent] = useState<number>(40);
  const [cocosMeliPercent, setCocosMeliPercent] = useState<number>(25);
  const [cocosNvdaPercent, setCocosNvdaPercent] = useState<number>(20);
  const [cocosYpfPercent, setCocosYpfPercent] = useState<number>(15);
  const [cocosSavedAlert, setCocosSavedAlert] = useState(false);

  // Copy Trade State (80 USD Fran Allocated)
  const [copyTradeAmount, setCopyTradeAmount] = useState<number>(80);
  const [copyTradeStatus, setCopyTradeStatus] = useState<'active' | 'paused'>('active');
  const [copyTradeStopLoss, setCopyTradeStopLoss] = useState<number>(12);

  // Acciones / Stocks Portfolio (Cocos Capital)
  const [stocksPortfolio, setStocksPortfolio] = useState<
    Array<{ id: string; ticker: string; name: string; amount: number; shares?: number; date: string; notes?: string }>
  >([
    {
      id: 'stk_sp500',
      ticker: 'SPY',
      name: 'S&P 500 Index (Cocos Capital)',
      amount: 40,
      date: '2026-09-27',
      notes: 'Columna vertebral indexada: 500 gigantes de EE.UU. (40% de 100 USD)',
    },
    {
      id: 'stk_meli',
      ticker: 'MELI',
      name: 'MercadoLibre Inc. (Cocos Capital)',
      amount: 25,
      date: '2026-09-27',
      notes: 'Líder en e-commerce y fintech Mercado Pago (25% de 100 USD)',
    },
    {
      id: 'stk_nvda',
      ticker: 'NVDA',
      name: 'NVIDIA Corporation (Cocos Capital)',
      amount: 20,
      date: '2026-09-27',
      notes: 'Infraestructura y microchips de Inteligencia Artificial (20% de 100 USD)',
    },
    {
      id: 'stk_ypf',
      ticker: 'YPF',
      name: 'YPF S.A. (Cocos Capital)',
      amount: 15,
      date: '2026-09-27',
      notes: 'Energía y Vaca Muerta, alto potencial de suba (15% de 100 USD)',
    },
  ]);

  // Cripto Portfolio
  const [cryptoPortfolio, setCryptoPortfolio] = useState<
    Array<{ id: string; symbol: string; name: string; amount: number; cryptoAmount?: number; date: string; notes?: string }>
  >([
    {
      id: 'cry_btc',
      symbol: 'BTC',
      name: 'Bitcoin',
      amount: 110,
      cryptoAmount: 0.0018,
      date: '2026-09-10',
      notes: 'Reserva de valor descentralizada (40% cuota cripto)',
    },
    {
      id: 'cry_eth',
      symbol: 'ETH',
      name: 'Ethereum',
      amount: 40,
      cryptoAmount: 0.015,
      date: '2026-09-08',
      notes: 'Web3 y contratos inteligentes',
    },
  ]);

  // Modal states for adding custom stock / crypto
  const [isNewAssetModalOpen, setIsNewAssetModalOpen] = useState(false);
  const [assetType, setAssetType] = useState<'stock' | 'crypto'>('stock');
  const [assetName, setAssetName] = useState('');
  const [assetSymbol, setAssetSymbol] = useState('');
  const [assetAmount, setAssetAmount] = useState('');
  const [assetNotes, setAssetNotes] = useState('');

  // Processing pending income split
  const [isApplyingSplit, setIsApplyingSplit] = useState(false);

  // Sync listener
  useEffect(() => {
    const unsub = cerebroSync.subscribe((ev) => {
      if (ev.type === 'income_split' || ev.type === 'general') {
        onRefreshData();
      }
    });
    return () => unsub();
  }, [onRefreshData]);

  const realBalance = accounts.reduce((acc, a) => acc + (a.isReserve ? 0 : a.balance), 0);
  const totalPending = pendingIncomes.filter((p) => p.status === 'pending').reduce((acc, p) => acc + p.amount, 0);

  const realSummary = summary?.realSummary;
  const cashAmount = realSummary?.cashAmount ?? (accounts.find((a) => a.id === 'acc_cash')?.balance ?? 50);
  const digitalAmount = realSummary?.digitalAmount ?? (accounts.find((a) => a.id === 'acc_arq')?.balance ?? 32);
  const totalAvailable = realSummary?.totalAvailable ?? (cashAmount + digitalAmount);
  const bingxAmount = realSummary?.investments?.bingxEur ?? (accounts.find((a) => a.id === 'acc_bingx')?.balance ?? 80);
  const cocosAmountUSD = realSummary?.investments?.cocosUsd ?? (accounts.find((a) => a.id === 'acc_cocos')?.balance ?? 100);
  const cocosAmountEUR = realSummary?.investments?.cocosEurApprox ?? Math.round(cocosAmountUSD * 0.92);
  const totalInvestmentsEur = realSummary?.investments?.totalEurApprox ?? (bingxAmount + cocosAmountEUR);
  const ikualoEur = realSummary?.pending?.ikualoEur ?? 40;
  const spentToday = realSummary?.spentToday ?? 0;
  const spentThisWeek = realSummary?.spentThisWeek ?? 0;
  const spentThisMonth = realSummary?.spentThisMonth ?? 0;
  const realPatrimony = realSummary?.realPatrimonyConfirmedEur ?? (totalAvailable + totalInvestmentsEur);

  const totalStocks = stocksPortfolio.reduce((acc, s) => acc + s.amount, 0);
  const totalCrypto = cryptoPortfolio.reduce((acc, c) => acc + c.amount, 0);
  const totalInvested = totalStocks + totalCrypto;

  // Live Math for Fran's Formula:
  // 1. Pocket = simAmount * pocketPercent / 100
  // 2. InvestTotal = simAmount * investPercent / 100
  // 3. Stocks = InvestTotal * (stocksPercent / 100)
  // 4. Crypto = InvestTotal * (cryptoPercent / 100)
  const calculatedPocket = Math.round(((simAmount * pocketPercent) / 100) * 100) / 100;
  const calculatedInvestTotal = Math.round(((simAmount * investPercent) / 100) * 100) / 100;
  const calculatedStocks = Math.round(((calculatedInvestTotal * stocksPercent) / 100) * 100) / 100;
  const calculatedCrypto = Math.round(((calculatedInvestTotal * cryptoPercent) / 100) * 100) / 100;

  // Real overall percentages of the entire income
  const stocksOfTotalPercent = Math.round((investPercent * stocksPercent) / 100);
  const cryptoOfTotalPercent = Math.round((investPercent * cryptoPercent) / 100);

  const handleAddAsset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assetName || !assetAmount) return;

    const numAmount = Number(assetAmount) || 0;
    const dateStr = new Date().toISOString().split('T')[0];

    if (assetType === 'stock') {
      const newStock = {
        id: `stk_${Date.now()}`,
        ticker: assetSymbol.toUpperCase() || 'STOCK',
        name: assetName,
        amount: numAmount,
        date: dateStr,
        notes: assetNotes,
      };
      setStocksPortfolio((prev) => [newStock, ...prev]);
    } else {
      const newCrypto = {
        id: `cry_${Date.now()}`,
        symbol: assetSymbol.toUpperCase() || 'CRYPTO',
        name: assetName,
        amount: numAmount,
        date: dateStr,
        notes: assetNotes,
      };
      setCryptoPortfolio((prev) => [newCrypto, ...prev]);
    }

    setIsNewAssetModalOpen(false);
    setAssetName('');
    setAssetSymbol('');
    setAssetAmount('');
    setAssetNotes('');
  };

  // Receive a pending income and split it according to Fran's 40/60 (60% Stocks / 40% Crypto)
  const handleReceiveWithSplit = async (pending: PendingIncome) => {
    try {
      setIsApplyingSplit(true);
      const targetAcc = accounts[0]?.id || 'acc_cash';

      const pocketPart = Math.round(((pending.amount * pocketPercent) / 100) * 100) / 100;
      const investPart = Math.round(((pending.amount * investPercent) / 100) * 100) / 100;
      const stocksPart = Math.round(((investPart * stocksPercent) / 100) * 100) / 100;
      const cryptoPart = Math.round(((investPart * cryptoPercent) / 100) * 100) / 100;

      const today = new Date().toISOString().split('T')[0];

      // 1. Transaction: Bolsillo 40% (alquiler y gastos)
      await api.createTransaction({
        type: 'income',
        amount: pocketPart,
        currency: 'EUR',
        paymentMethodId: targetAcc,
        description: `${pending.concept} (40% Bolsillo / Día a día)`,
        date: today,
        status: 'confirmed',
        source: 'pending_income',
        notes: `Cobro procesado con la regla de Fran: 40% Bolsillo (${pocketPart} €) para alquiler y gastos`,
      });

      // 2. Transaction: Acciones 60% de la inversión (36% del total)
      await api.createTransaction({
        type: 'income',
        amount: stocksPart,
        currency: 'EUR',
        paymentMethodId: targetAcc,
        description: `${pending.concept} (60% Inversión → Acciones / ETFs)`,
        date: today,
        status: 'confirmed',
        source: 'pending_income',
        notes: `Ahorro destinado a Acciones y Fondos indexados (${stocksPart} €)`,
      });

      // 3. Transaction: Criptomonedas 40% de la inversión (24% del total)
      await api.createTransaction({
        type: 'income',
        amount: cryptoPart,
        currency: 'EUR',
        paymentMethodId: targetAcc,
        description: `${pending.concept} (40% Inversión → Criptomonedas)`,
        date: today,
        status: 'confirmed',
        source: 'pending_income',
        notes: `Ahorro destinado a Criptomonedas (BTC / ETH / Web3) (${cryptoPart} €)`,
      });

      // Add to portfolios
      setStocksPortfolio((prev) => [
        {
          id: `stk_${Date.now()}`,
          ticker: 'ETF / ACCIONES',
          name: `Asignación de ${pending.concept}`,
          amount: stocksPart,
          date: today,
          notes: `60% del ahorro invertido en Bolsa`,
        },
        ...prev,
      ]);

      setCryptoPortfolio((prev) => [
        {
          id: `cry_${Date.now()}`,
          symbol: 'BTC/CRYPTO',
          name: `Asignación de ${pending.concept}`,
          amount: cryptoPart,
          date: today,
          notes: `40% del ahorro invertido en Cripto`,
        },
        ...prev,
      ]);

      // Mark pending income as received
      await api.markIncomeReceived(pending.id, targetAcc);

      // Emit cross-device sync event
      await cerebroSync.emit(
        'income_split',
        `Cobro "${pending.concept}" distribuido: ${pocketPart}€ Bolsillo, ${stocksPart}€ Acciones, ${cryptoPart}€ Cripto`
      );

      onRefreshData();
    } catch (err: any) {
      alert('Error al aplicar distribución de ingresos: ' + err.message);
    } finally {
      setIsApplyingSplit(false);
    }
  };

  return (
    <div className="space-y-6 pb-24 text-slate-200">
      {/* 1. HEADER: FILOSOFÍA DE FRAN (40% BOLSILLO / 60% INVERSIÓN [60% ACCIONES / 40% CRIPTO]) */}
      <div className="bg-[#1E293B] rounded-2xl p-5 sm:p-6 border border-slate-800 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30 uppercase tracking-wider">
                Tesis de Ahorro e Inversión de Fran
              </span>
              <span className="text-xs text-slate-400">· Logroño, España</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
              Inversiones y Finanzas
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Tu regla de ahorro: <strong className="text-amber-400">40% para el bolsillo</strong> y{' '}
              <strong className="text-emerald-400">60% para invertir</strong> (del cual el{' '}
              <strong className="text-blue-400">60% va a acciones</strong> y el{' '}
              <strong className="text-purple-400">40% a criptomonedas</strong>).
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={onOpenNewTransaction}
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-lg shadow-blue-600/25 flex items-center gap-1.5"
              id="btn-nueva-transaccion"
            >
              <Plus className="w-4 h-4" /> Nuevo Movimiento
            </button>
            <button
              onClick={() => {
                setAssetType('stock');
                setIsNewAssetModalOpen(true);
              }}
              className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all border border-slate-700 flex items-center gap-1.5"
            >
              <LineChart className="w-3.5 h-3.5 text-blue-400" /> + Acción
            </button>
            <button
              onClick={() => {
                setAssetType('crypto');
                setIsNewAssetModalOpen(true);
              }}
              className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all border border-slate-700 flex items-center gap-1.5"
            >
              <Coins className="w-3.5 h-3.5 text-purple-400" /> + Cripto
            </button>
            <button
              onClick={onRefreshData}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all border border-slate-700"
              title="Refrescar datos"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Big Numbers Grid: Estructura Financiera Patrimonio Real */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-6">
          {/* Card 1: Dinero Disponible */}
          <div className="bg-slate-900/90 rounded-xl p-4 border border-emerald-500/30 shadow-md">
            <div className="flex items-center justify-between text-emerald-400 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider">💰 Dinero Disponible</span>
              <Wallet className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono">
              {totalAvailable.toLocaleString('es-ES', { minimumFractionDigits: 2 })} €
            </div>
            <p className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
              <span>Efectivo: {cashAmount} €</span>
              <span>ARQ: {digitalAmount} €</span>
            </p>
          </div>

          {/* Card 2: Inversiones */}
          <div className="bg-slate-900/90 rounded-xl p-4 border border-indigo-500/30 shadow-md">
            <div className="flex items-center justify-between text-indigo-400 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider">📈 Inversiones</span>
              <LineChart className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-indigo-300 font-mono">
              ~{totalInvestmentsEur.toLocaleString('es-ES', { minimumFractionDigits: 2 })} €
            </div>
            <p className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
              <span>BingX: ~{bingxAmount} €</span>
              <span>Cocos: ~{cocosAmountUSD} $ (~{cocosAmountEUR} €)</span>
            </p>
          </div>

          {/* Card 3: Pagos Pendientes */}
          <div className="bg-slate-900/90 rounded-xl p-4 border border-amber-500/30 shadow-md">
            <div className="flex items-center justify-between text-amber-400 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider">⏳ Pendiente</span>
              <Clock className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-amber-300 font-mono">
              ~{ikualoEur.toLocaleString('es-ES', { minimumFractionDigits: 0 })} €
            </div>
            <p className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
              <span>Ikualo: ~{ikualoEur} €</span>
              <span>Déjà Vu: pendiente</span>
            </p>
          </div>

          {/* Card 4: Patrimonio Confirmado Real */}
          <div className="bg-gradient-to-br from-blue-950/60 to-slate-900 rounded-xl p-4 border border-blue-500/40 shadow-md">
            <div className="flex items-center justify-between text-blue-300 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider">💎 Patrimonio Real</span>
              <TrendingUp className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono">
              ~{realPatrimony.toLocaleString('es-ES', { minimumFractionDigits: 2 })} €
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Solo valores confirmados · Sin montos ficticios
            </p>
          </div>
        </div>

        {/* 2. Control de Gastos: Gastado Hoy, Semana, Mes y Dinero Disponible */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-4 pt-3 border-t border-slate-800/80 text-xs">
          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3">
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Gastado Hoy</span>
            <span className="text-base font-extrabold text-rose-400 font-mono">{spentToday.toLocaleString('es-ES', { minimumFractionDigits: 2 })} €</span>
          </div>
          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3">
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Gastado Esta Semana</span>
            <span className="text-base font-extrabold text-rose-400 font-mono">{spentThisWeek.toLocaleString('es-ES', { minimumFractionDigits: 2 })} €</span>
          </div>
          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3">
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Gastado Este Mes</span>
            <span className="text-base font-extrabold text-rose-400 font-mono">{spentThisMonth.toLocaleString('es-ES', { minimumFractionDigits: 2 })} €</span>
          </div>
          <div className="bg-slate-950/60 border border-emerald-500/30 rounded-xl p-3">
            <span className="text-[10px] uppercase font-bold text-emerald-400 block mb-0.5">Dinero Disponible</span>
            <span className="text-base font-extrabold text-emerald-300 font-mono">{totalAvailable.toLocaleString('es-ES', { minimumFractionDigits: 2 })} €</span>
          </div>
        </div>
      </div>

      {/* 2. Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto text-xs font-bold">
        <button
          onClick={() => setActiveTab('regla4060')}
          className={`px-4 py-2.5 rounded-xl transition-all whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'regla4060'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
              : 'bg-slate-800/60 text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <PieChart className="w-3.5 h-3.5" /> Tesis de Ahorro & Simulador
        </button>

        <button
          onClick={() => setActiveTab('acciones')}
          className={`px-4 py-2.5 rounded-xl transition-all whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'acciones'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
              : 'bg-slate-800/60 text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <LineChart className="w-3.5 h-3.5 text-blue-400" /> Cartera Acciones ({stocksPortfolio.length})
        </button>

        <button
          onClick={() => setActiveTab('cripto')}
          className={`px-4 py-2.5 rounded-xl transition-all whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'cripto'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
              : 'bg-slate-800/60 text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Coins className="w-3.5 h-3.5 text-purple-400" /> Cartera Cripto ({cryptoPortfolio.length})
        </button>

        <button
          onClick={() => setActiveTab('pendientes')}
          className={`px-4 py-2.5 rounded-xl transition-all whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'pendientes'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
              : 'bg-slate-800/60 text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Clock className="w-3.5 h-3.5 text-amber-400" /> Pagos Pendientes ({pendingIncomes.length})
        </button>

        <button
          onClick={() => setActiveTab('movimientos')}
          className={`px-4 py-2.5 rounded-xl transition-all whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'movimientos'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
              : 'bg-slate-800/60 text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Wallet className="w-3.5 h-3.5" /> Movimientos & Cuentas ({transactions.length})
        </button>
      </div>

      {/* TAB 1: REGLA DE AHORRO 40/60 + 60% ACCIONES / 40% CRIPTO */}
      {activeTab === 'regla4060' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Columna Izquierda: La Filosofía y Simulador */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-[#1E293B] rounded-2xl p-6 border border-slate-800 shadow-xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-sky-400 flex items-center justify-center text-white shadow-md">
                  <Calculator className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">
                    La Fórmula de Ahorro de Franco
                  </h2>
                  <p className="text-xs text-slate-400">
                    40% para bolsillo y vida, 60% ahorro e inversión (60% acciones y 40% criptomonedas).
                  </p>
                </div>
              </div>

              {/* Barra Visual Tri-Color de Distribución */}
              <div className="bg-slate-900 rounded-xl p-4 border border-slate-800 mb-6">
                <div className="flex items-center justify-between text-xs font-semibold mb-2">
                  <span className="text-amber-400 flex items-center gap-1.5">
                    💼 Bolsillo ({pocketPercent}%)
                  </span>
                  <span className="text-blue-400 flex items-center gap-1.5">
                    📈 Acciones ({stocksOfTotalPercent}%)
                  </span>
                  <span className="text-purple-400 flex items-center gap-1.5">
                    🪙 Cripto ({cryptoOfTotalPercent}%)
                  </span>
                </div>

                <div className="h-4 w-full bg-slate-800 rounded-full overflow-hidden flex shadow-inner">
                  {/* Bolsillo */}
                  <div
                    style={{ width: `${pocketPercent}%` }}
                    className="bg-gradient-to-r from-amber-500 to-amber-400 h-full transition-all duration-300"
                    title={`Bolsillo: ${pocketPercent}%`}
                  />
                  {/* Acciones */}
                  <div
                    style={{ width: `${stocksOfTotalPercent}%` }}
                    className="bg-gradient-to-r from-blue-600 to-sky-400 h-full transition-all duration-300"
                    title={`Acciones: ${stocksOfTotalPercent}% del total`}
                  />
                  {/* Cripto */}
                  <div
                    style={{ width: `${cryptoOfTotalPercent}%` }}
                    className="bg-gradient-to-r from-purple-600 to-fuchsia-400 h-full transition-all duration-300"
                    title={`Cripto: ${cryptoOfTotalPercent}% del total`}
                  />
                </div>

                <div className="grid grid-cols-3 text-[10px] text-slate-400 mt-2.5 gap-2 text-center">
                  <div className="bg-slate-800/50 p-1.5 rounded-lg border border-slate-700/50">
                    <span className="text-amber-300 font-bold block">40% Bolsillo</span>
                    Alquiler, súper, comida
                  </div>
                  <div className="bg-slate-800/50 p-1.5 rounded-lg border border-slate-700/50">
                    <span className="text-blue-300 font-bold block">36% Acciones</span>
                    60% del ahorro en Bolsa
                  </div>
                  <div className="bg-slate-800/50 p-1.5 rounded-lg border border-slate-700/50">
                    <span className="text-purple-300 font-bold block">24% Cripto</span>
                    40% del ahorro en Web3
                  </div>
                </div>
              </div>

              {/* Simulador Interactivo */}
              <div className="bg-slate-900/60 rounded-xl p-5 border border-slate-800">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-blue-400" /> Simulador de Cobros con la Tesis de Fran
                  </h3>
                  <span className="text-[10px] text-slate-400 font-mono">Cálculo Automático</span>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3 mb-4">
                  <div className="relative flex-1 w-full">
                    <input
                      type="number"
                      value={simAmount || ''}
                      onChange={(e) => setSimAmount(Number(e.target.value) || 0)}
                      placeholder="Monto a ingresar (ej: 275)"
                      className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-4 py-3 text-lg font-bold text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <div className="absolute right-3 top-3.5 text-sm font-bold text-slate-400">
                      € / USD
                    </div>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={() => setSimAmount(275)} // 300 USD
                      className="flex-1 sm:flex-initial px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-amber-300 border border-amber-500/30 transition-all"
                    >
                      Burger Palusa (300 $)
                    </button>
                    <button
                      type="button"
                      onClick={() => setSimAmount(220)}
                      className="flex-1 sm:flex-initial px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-purple-300 border border-purple-500/30 transition-all"
                    >
                      Turnos DejaVu (~220 €)
                    </button>
                  </div>
                </div>

                {/* Triple Desglose Result */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
                  {/* 1. Bolsillo */}
                  <div className="bg-amber-950/20 border border-amber-500/30 rounded-xl p-4">
                    <div className="text-[10px] font-bold text-amber-400 uppercase tracking-wider mb-1">
                      1. Bolsillo ({pocketPercent}%)
                    </div>
                    <div className="text-2xl font-extrabold text-white">
                      {calculatedPocket.toFixed(2)} €
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Para alquiler y tu vida cotidiana.
                    </p>
                  </div>

                  {/* 2. Acciones */}
                  <div className="bg-blue-950/20 border border-blue-500/30 rounded-xl p-4">
                    <div className="text-[10px] font-bold text-blue-400 uppercase tracking-wider mb-1">
                      2. Acciones ({stocksPercent}% inv)
                    </div>
                    <div className="text-2xl font-extrabold text-blue-300">
                      {calculatedStocks.toFixed(2)} €
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Bolsa, ETFs y fondos de crecimiento.
                    </p>
                  </div>

                  {/* 3. Cripto */}
                  <div className="bg-purple-950/20 border border-purple-500/30 rounded-xl p-4">
                    <div className="text-[10px] font-bold text-purple-400 uppercase tracking-wider mb-1">
                      3. Cripto ({cryptoPercent}% inv)
                    </div>
                    <div className="text-2xl font-extrabold text-purple-300">
                      {calculatedCrypto.toFixed(2)} €
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Bitcoin, ETH y reserva cripto.
                    </p>
                  </div>
                </div>

                {/* Resumen del 60% total */}
                <div className="mt-4 p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-slate-400">Total Separado para Ahorro & Inversión (60%):</span>
                  <span className="font-extrabold text-emerald-400 text-sm">
                    {calculatedInvestTotal.toFixed(2)} €
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Columna Derecha: Control de Porcentajes & Cobros Clave */}
          <div className="lg:col-span-5 space-y-6">
            {/* Ajuste de Porcentajes */}
            <div className="bg-[#1E293B] rounded-2xl p-6 border border-slate-800 shadow-xl">
              <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                <Sliders className="w-4 h-4 text-indigo-400" /> Ajustar Proporciones de la Tesis
              </h3>
              <p className="text-xs text-slate-400 mb-4">
                Configurá los porcentajes exactos según tu preferencia actual.
              </p>

              {/* Slider 1: Bolsillo vs Inversión */}
              <div className="space-y-2 mb-5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-amber-300">Bolsillo: {pocketPercent}%</span>
                  <span className="font-semibold text-emerald-300">Inversión: {investPercent}%</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="80"
                  step="5"
                  value={pocketPercent}
                  onChange={(e) => {
                    const p = Number(e.target.value);
                    setPocketPercent(p);
                    setInvestPercent(100 - p);
                  }}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
              </div>

              {/* Slider 2: Dentro del ahorro, Acciones vs Cripto */}
              <div className="space-y-2 pt-4 border-t border-slate-800">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-blue-400">Acciones: {stocksPercent}%</span>
                  <span className="font-semibold text-purple-400">Cripto: {cryptoPercent}%</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="80"
                  step="5"
                  value={stocksPercent}
                  onChange={(e) => {
                    const s = Number(e.target.value);
                    setStocksPercent(s);
                    setCryptoPercent(100 - s);
                  }}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
                <span className="text-[11px] text-slate-400 block mt-1">
                  Tu tesis estándar: 60% Acciones / 40% Criptomonedas
                </span>
              </div>

              {/* Presets rápidos */}
              <div className="flex items-center gap-2 mt-4">
                <button
                  type="button"
                  onClick={() => {
                    setPocketPercent(40);
                    setInvestPercent(60);
                    setStocksPercent(60);
                    setCryptoPercent(40);
                  }}
                  className="flex-1 py-1.5 rounded-lg bg-blue-600/20 text-blue-300 border border-blue-500/30 text-[11px] font-bold"
                >
                  Tesis Fran (40/60 · 60/40)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setStocksPercent(50);
                    setCryptoPercent(50);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 border border-slate-700 text-[11px] font-bold"
                >
                  50/50 Inversión
                </button>
              </div>
            </div>

            {/* Cobro Pendiente Inmediato (Burger Palusa) con 1-clic */}
            <div className="bg-[#1E293B] rounded-2xl p-6 border border-amber-500/30 shadow-xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase">
                  Próximo Ingreso
                </span>
                <span className="text-xs font-extrabold text-white">300 $ (~275 €)</span>
              </div>
              <h4 className="text-base font-bold text-white mb-1">Burger Palusa (Diseños)</h4>
              <p className="text-xs text-slate-300 mb-4 leading-relaxed">
                Cuando te liquiden este pago pendiente, podés cobrarlo aplicando tu tesis en 1 solo clic:
              </p>

              <div className="space-y-1.5 text-xs text-slate-300 bg-slate-900/80 p-3 rounded-xl border border-slate-800 mb-4">
                <div className="flex justify-between">
                  <span className="text-amber-400">💼 Bolsillo (40%):</span>
                  <span className="font-bold">110,00 €</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-400">📈 Acciones (60% del ahorro):</span>
                  <span className="font-bold">99,00 €</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-purple-400">🪙 Cripto (40% del ahorro):</span>
                  <span className="font-bold">66,00 €</span>
                </div>
              </div>

              {pendingIncomes.find((p) => p.concept.toLowerCase().includes('burger')) ? (
                <button
                  onClick={() => {
                    const burgerPending = pendingIncomes.find((p) => p.concept.toLowerCase().includes('burger'));
                    if (burgerPending) handleReceiveWithSplit(burgerPending);
                  }}
                  disabled={isApplyingSplit}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 text-xs font-extrabold transition-all shadow-md flex items-center justify-center gap-1.5 active:scale-95"
                >
                  <CheckCircle2 className="w-4 h-4" /> Cobrar y Distribuir 40/60
                </button>
              ) : (
                <div className="text-center text-xs text-emerald-400 font-bold py-1">
                  ✅ Cobro ya registrado y distribuido
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: CARTERA DE ACCIONES & ETFS */}
      {activeTab === 'acciones' && (
        <div className="space-y-6">
          {/* 1. SECCIÓN ESTRATÉGICA: COCOS CAPITAL (100 USD) & COPY TRADE (80 USD) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Cocos Capital Live Allocator (100 USD) */}
            <div className="lg:col-span-2 bg-gradient-to-br from-slate-900 via-slate-900 to-blue-950/40 rounded-2xl p-5 sm:p-6 border border-blue-500/40 shadow-xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-400/40 flex items-center justify-center text-blue-300 font-bold text-sm">
                    CC
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-white">Cocos Capital — Cartera de Acciones</h3>
                      <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                        {cocosTotalUSD} USD DESTINADOS
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">
                      Asignación estratégica recomendada por JARVIS en CEDEARs y acciones seguras
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xl sm:text-2xl font-extrabold text-blue-400">
                    {cocosTotalUSD.toFixed(0)} USD
                  </span>
                  <span className="block text-[10px] text-slate-400">Capital para comprar acciones</span>
                </div>
              </div>

              {/* Asset Allocation Sliders */}
              <div className="space-y-3 pt-2">
                {/* 1. S&P 500 (SPY) */}
                <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-bold text-white flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                      S&P 500 (SPY): {cocosSpyPercent}%
                    </span>
                    <span className="font-extrabold text-blue-300 font-mono">
                      {((cocosTotalUSD * cocosSpyPercent) / 100).toFixed(1)} USD
                    </span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="70"
                    step="5"
                    value={cocosSpyPercent}
                    onChange={(e) => setCocosSpyPercent(Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    🛡️ <strong>Base indexada:</strong> Las 500 empresas más valiosas de EE.UU. Tu columna vertebral anti-crisis (~10% anual histórico).
                  </p>
                </div>

                {/* 2. MercadoLibre (MELI) */}
                <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-bold text-white flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                      MercadoLibre (MELI): {cocosMeliPercent}%
                    </span>
                    <span className="font-extrabold text-amber-300 font-mono">
                      {((cocosTotalUSD * cocosMeliPercent) / 100).toFixed(1)} USD
                    </span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="40"
                    step="5"
                    value={cocosMeliPercent}
                    onChange={(e) => setCocosMeliPercent(Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    🚀 <strong>Crecimiento regional:</strong> Líder indiscutido de e-commerce y Mercado Pago en América Latina con balance sólido.
                  </p>
                </div>

                {/* 3. NVIDIA (NVDA) */}
                <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-bold text-white flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                      NVIDIA (NVDA): {cocosNvdaPercent}%
                    </span>
                    <span className="font-extrabold text-emerald-300 font-mono">
                      {((cocosTotalUSD * cocosNvdaPercent) / 100).toFixed(1)} USD
                    </span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="35"
                    step="5"
                    value={cocosNvdaPercent}
                    onChange={(e) => setCocosNvdaPercent(Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    🤖 <strong>Revolución IA:</strong> El monopolio de microchips y servidores que impulsan los modelos de inteligencia artificial del mundo.
                  </p>
                </div>

                {/* 4. YPF (YPF) */}
                <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-bold text-white flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-sky-400"></span>
                      YPF S.A. (YPF / Vaca Muerta): {cocosYpfPercent}%
                    </span>
                    <span className="font-extrabold text-sky-300 font-mono">
                      {((cocosTotalUSD * cocosYpfPercent) / 100).toFixed(1)} USD
                    </span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="30"
                    step="5"
                    value={cocosYpfPercent}
                    onChange={(e) => setCocosYpfPercent(Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-500"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    ⚡ <strong>Potencial energético:</strong> Gran exposición a Vaca Muerta y exportación de gas/petróleo. Mayor volatilidad pero excelente potencial.
                  </p>
                </div>
              </div>

              {/* Total Check & Action */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800">
                <span className="text-xs text-slate-400">
                  Suma total: <strong>{cocosSpyPercent + cocosMeliPercent + cocosNvdaPercent + cocosYpfPercent}%</strong>
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setStocksPortfolio([
                      {
                        id: 'stk_sp500',
                        ticker: 'SPY',
                        name: 'S&P 500 Index (Cocos Capital)',
                        amount: (cocosTotalUSD * cocosSpyPercent) / 100,
                        date: new Date().toISOString().split('T')[0],
                        notes: `Base indexada segura (${cocosSpyPercent}%)`,
                      },
                      {
                        id: 'stk_meli',
                        ticker: 'MELI',
                        name: 'MercadoLibre Inc. (Cocos Capital)',
                        amount: (cocosTotalUSD * cocosMeliPercent) / 100,
                        date: new Date().toISOString().split('T')[0],
                        notes: `Fintech & Comercio LatAm (${cocosMeliPercent}%)`,
                      },
                      {
                        id: 'stk_nvda',
                        ticker: 'NVDA',
                        name: 'NVIDIA Corporation (Cocos Capital)',
                        amount: (cocosTotalUSD * cocosNvdaPercent) / 100,
                        date: new Date().toISOString().split('T')[0],
                        notes: `Líder en chips de IA (${cocosNvdaPercent}%)`,
                      },
                      {
                        id: 'stk_ypf',
                        ticker: 'YPF',
                        name: 'YPF S.A. (Cocos Capital)',
                        amount: (cocosTotalUSD * cocosYpfPercent) / 100,
                        date: new Date().toISOString().split('T')[0],
                        notes: `Vaca Muerta y Energía (${cocosYpfPercent}%)`,
                      },
                    ]);
                    setCocosSavedAlert(true);
                    setTimeout(() => setCocosSavedAlert(false), 3000);
                  }}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-md shadow-blue-600/30"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {cocosSavedAlert ? '¡Distribución Guardada!' : 'Confirmar Distribución en Cocos'}
                </button>
              </div>
            </div>

            {/* Copy Trade Live Card (80 USD) */}
            <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-purple-950/40 rounded-2xl p-5 sm:p-6 border border-purple-500/40 shadow-xl flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 uppercase flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    Estrategia Activa
                  </span>
                  <span className="text-xl font-extrabold text-purple-300 font-mono">
                    {copyTradeAmount} USD
                  </span>
                </div>

                <h4 className="text-base font-bold text-white mb-1 flex items-center gap-2">
                  <Rocket className="w-4 h-4 text-purple-400" /> Copy Trade
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Ya dejaste <strong>80 USD</strong> siguiendo traders de alto rendimiento en automático.
                </p>

                {/* Risk & Rules */}
                <div className="mt-4 p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-xs text-slate-300 space-y-2">
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-slate-400">Stop-Loss Sugerido:</span>
                    <strong className="text-rose-400 font-mono">-{copyTradeStopLoss}% (~70 USD)</strong>
                  </div>
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-slate-400">Objetivo Take-Profit:</span>
                    <strong className="text-emerald-400 font-mono">&gt; 100 USD (+25%)</strong>
                  </div>
                  <div className="pt-2 border-t border-slate-800/80 text-[11px] text-slate-400 italic">
                    💡 <strong>Regla JARVIS:</strong> Todas las ganancias que superen los 100 USD se retiran y van directo al colchón de reserva en Logroño.
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-400">Riesgo: <strong>Medio-Alto</strong></span>
                <span className="text-purple-400 font-mono text-[11px]">Monitoreo Activo</span>
              </div>
            </div>
          </div>

          {/* 2. TABLA COMPLETA DE ACCIONES REGISTRADAS */}
          <div className="bg-[#1E293B] rounded-2xl p-6 border border-slate-800 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <LineChart className="w-5 h-5 text-blue-400" /> Posiciones de Acciones en Cartera ({stocksPortfolio.length})
                </h2>
                <p className="text-xs text-slate-400">
                  Desglose de tus posiciones en Cocos Capital y fondos indexados
                </p>
              </div>
              <button
                onClick={() => {
                  setAssetType('stock');
                  setIsNewAssetModalOpen(true);
                }}
                className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-md flex items-center gap-1.5 self-start sm:self-auto"
              >
                <Plus className="w-4 h-4" /> Agregar Posición
              </button>
            </div>

            {stocksPortfolio.length === 0 ? (
              <div className="text-center py-12 text-slate-400 bg-slate-900/40 rounded-xl border border-dashed border-slate-800">
                <LineChart className="w-8 h-8 mx-auto text-slate-500 mb-2" />
                <p className="text-sm font-semibold">No tenés acciones registradas aún.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {stocksPortfolio.map((stk) => (
                  <div
                    key={stk.id}
                    className="bg-slate-900/80 rounded-xl p-4 border border-slate-800 hover:border-blue-500/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0 font-mono text-xs font-extrabold">
                        {stk.ticker.substring(0, 4)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-white">{stk.name}</h4>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-300 border border-blue-500/30 font-bold font-mono">
                            {stk.ticker}
                          </span>
                        </div>
                        {stk.notes && <p className="text-xs text-slate-400 mt-0.5">{stk.notes}</p>}
                        <span className="text-[10px] text-slate-500 mt-1 block">Fecha de aporte: {stk.date}</span>
                      </div>
                    </div>

                    <div className="text-right sm:self-center">
                      <span className="text-lg font-extrabold text-blue-300 font-mono">
                        {stk.amount.toLocaleString('es-ES', { minimumFractionDigits: 2 })} USD
                      </span>
                      <span className="block text-[10px] text-slate-400">Capital Asignado</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: CARTERA DE CRIPTOMONEDAS */}
      {activeTab === 'cripto' && (
        <div className="space-y-6">
          <div className="bg-[#1E293B] rounded-2xl p-6 border border-slate-800 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Coins className="w-5 h-5 text-purple-400" /> Cartera de Criptomonedas
                </h2>
                <p className="text-xs text-slate-400">
                  El 40% de tu dinero ahorrado se destina a Bitcoin, Ethereum y activos digitales.
                </p>
              </div>
              <button
                onClick={() => {
                  setAssetType('crypto');
                  setIsNewAssetModalOpen(true);
                }}
                className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all shadow-md flex items-center gap-1.5 self-start sm:self-auto"
              >
                <Plus className="w-4 h-4" /> Agregar Criptoactivo
              </button>
            </div>

            {cryptoPortfolio.length === 0 ? (
              <div className="text-center py-12 text-slate-400 bg-slate-900/40 rounded-xl border border-dashed border-slate-800">
                <Coins className="w-8 h-8 mx-auto text-slate-500 mb-2" />
                <p className="text-sm font-semibold">No tenés criptomonedas registradas aún.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {cryptoPortfolio.map((cry) => (
                  <div
                    key={cry.id}
                    className="bg-slate-900/80 rounded-xl p-4 border border-slate-800 hover:border-purple-500/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-300 shrink-0 font-mono text-xs font-extrabold">
                        {cry.symbol}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-white">{cry.name}</h4>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-300 border border-purple-500/30 font-bold font-mono">
                            {cry.symbol}
                          </span>
                        </div>
                        {cry.notes && <p className="text-xs text-slate-400 mt-0.5">{cry.notes}</p>}
                        <span className="text-[10px] text-slate-500 mt-1 block">Fecha de aporte: {cry.date}</span>
                      </div>
                    </div>

                    <div className="text-right sm:self-center">
                      <span className="text-lg font-extrabold text-purple-300">
                        {cry.amount.toLocaleString('es-ES', { minimumFractionDigits: 2 })} €
                      </span>
                      <span className="block text-[10px] text-slate-400">Reserva Cripto</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: PAGOS PENDIENTES */}
      {activeTab === 'pendientes' && (
        <div className="space-y-6">
          <div className="bg-[#1E293B] rounded-2xl p-6 border border-slate-800 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
              <div>
                <h2 className="text-lg font-bold text-white">Pagos Pendientes de Cobro</h2>
                <p className="text-xs text-slate-400">
                  Ingresos pactados a cobrar. Al marcarlos como cobrados podés aplicar automáticamente tu tesis (40% Bolsillo + 60% Inversión [60% Acciones / 40% Cripto]).
                </p>
              </div>
              <button
                onClick={onOpenNewPendingIncome}
                className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-md flex items-center gap-1.5 self-start sm:self-auto"
              >
                <Plus className="w-4 h-4" /> Agregar Pago Pendiente
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pendingIncomes.map((pending) => {
                const isBurger = pending.concept.toLowerCase().includes('burger');
                const isDejavu = pending.concept.toLowerCase().includes('dejavu');

                return (
                  <div
                    key={pending.id}
                    className={`rounded-2xl p-5 border transition-all ${
                      isBurger
                        ? 'bg-gradient-to-br from-amber-950/20 to-slate-900 border-amber-500/30'
                        : isDejavu
                        ? 'bg-gradient-to-br from-purple-950/20 to-slate-900 border-purple-500/30'
                        : 'bg-slate-900 border-slate-800'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span
                        className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase ${
                          isBurger
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : isDejavu
                            ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                            : 'bg-slate-800 text-slate-300'
                        }`}
                      >
                        {pending.origin || 'Pendiente'}
                      </span>
                      <span className="text-xl font-extrabold text-white">
                        ~{pending.amount} €
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-white">{pending.concept}</h3>
                    <p className="text-xs text-slate-400 mt-1">{pending.notes}</p>

                    <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                      <div className="text-[11px] text-slate-400">
                        {isBurger ? '60% Acciones & Cripto' : 'Alquiler y gastos fijos'}
                      </div>

                      <button
                        onClick={() => handleReceiveWithSplit(pending)}
                        disabled={isApplyingSplit}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow flex items-center gap-1 active:scale-95"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" /> Cobrar y Distribuir
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: MOVIMIENTOS & CUENTAS */}
      {activeTab === 'movimientos' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Cuentas */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-[#1E293B] rounded-2xl p-5 border border-slate-800 shadow-xl">
              <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                <Wallet className="w-4 h-4 text-blue-400" /> Cuentas & Métodos
              </h3>
              <div className="space-y-2.5">
                {accounts.map((acc) => (
                  <div
                    key={acc.id}
                    className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between"
                  >
                    <div>
                      <h4 className="text-xs font-bold text-white">{acc.name}</h4>
                      <p className="text-[10px] text-slate-400">{acc.notes || acc.type}</p>
                    </div>
                    <div className="text-sm font-extrabold text-white">
                      {acc.balance.toLocaleString('es-ES', { minimumFractionDigits: 2 })} €
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Historial de Transacciones */}
          <div className="lg:col-span-8 space-y-4">
            <div className="bg-[#1E293B] rounded-2xl p-5 border border-slate-800 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-400" /> Historial de Movimientos
                </h3>
                <button
                  onClick={onOpenNewTransaction}
                  className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Registrar
                </button>
              </div>

              {transactions.length === 0 ? (
                <div className="text-center py-10 text-slate-400 bg-slate-900/40 rounded-xl border border-dashed border-slate-800">
                  <p className="text-xs">No hay movimientos registrados en este período.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {transactions.slice(0, 15).map((t) => (
                    <div
                      key={t.id}
                      className="p-3 rounded-xl bg-slate-900 border border-slate-800/80 flex items-center justify-between gap-3 text-xs"
                    >
                      <div>
                        <div className="font-semibold text-white">{t.description}</div>
                        <div className="text-[10px] text-slate-400">{t.date} · {t.notes || 'Movimiento'}</div>
                      </div>
                      <div
                        className={`font-extrabold ${
                          t.type === 'income' ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {t.type === 'income' ? '+' : '-'}
                        {t.amount.toLocaleString('es-ES', { minimumFractionDigits: 2 })} €
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL: REGISTRAR ACCIÓN O CRIPTO */}
      {isNewAssetModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#1E293B] rounded-2xl p-6 border border-slate-700 w-full max-w-md shadow-2xl animate-scale-up">
            <h3 className="text-base font-bold text-white mb-1">
              {assetType === 'stock' ? '📈 Registrar Acción / ETF' : '🪙 Registrar Criptoactivo'}
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Sumá un activo a tu cartera para seguimiento de tu ahorro.
            </p>

            <form onSubmit={handleAddAsset} className="space-y-3.5">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Nombre del Activo
                </label>
                <input
                  type="text"
                  required
                  placeholder={assetType === 'stock' ? 'Ej: S&P 500, Apple Inc, Tesla' : 'Ej: Bitcoin, Ethereum, Solana'}
                  value={assetName}
                  onChange={(e) => setAssetName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Ticker o Símbolo
                </label>
                <input
                  type="text"
                  required
                  placeholder={assetType === 'stock' ? 'Ej: VUAA, AAPL, TSLA' : 'Ej: BTC, ETH, SOL'}
                  value={assetSymbol}
                  onChange={(e) => setAssetSymbol(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono uppercase text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Monto Invertido (€)
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="Ej: 99.00"
                  value={assetAmount}
                  onChange={(e) => setAssetAmount(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-base font-extrabold text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Notas / Estrategia
                </label>
                <input
                  type="text"
                  placeholder="Ej: Compra mensual a largo plazo"
                  value={assetNotes}
                  onChange={(e) => setAssetNotes(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsNewAssetModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold hover:bg-slate-700"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md"
                >
                  Guardar Activo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
