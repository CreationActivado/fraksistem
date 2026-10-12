import React, { useState, useRef } from 'react';
import {
  Camera,
  Upload,
  Sparkles,
  CheckCircle2,
  X,
  AlertCircle,
  Receipt,
  Calendar,
  Wallet,
  Tag,
  Store,
  RefreshCw,
  Plus,
  Edit3,
  Zap,
} from 'lucide-react';
import { api } from '../services/api';
import { Account, Category, Project, DetectedReceipt } from '../types';

interface ReceiptScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  accounts: Account[];
  categories: Category[];
  projects: Project[];
  onSuccess: () => void;
}

const DEFAULT_CATEGORIES = [
  'Alimentos',
  'Movistar',
  'Weed',
  'Salida a comer',
  'Educación',
  'Gasto chatarra',
  'Inversión',
  'Transporte',
  'Vivienda',
  'Trabajo',
  'Otros',
];

export const ReceiptScannerModal: React.FC<ReceiptScannerModalProps> = ({
  isOpen,
  onClose,
  accounts,
  categories,
  projects,
  onSuccess,
}) => {
  const [entryMode, setEntryMode] = useState<'scan' | 'manual'>('scan');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string>('image/jpeg');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form fields
  const [merchant, setMerchant] = useState('Mercadona');
  const [total, setTotal] = useState<number>(14.80);
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [selectedCategoryName, setSelectedCategoryName] = useState('Alimentos');
  const [accountId, setAccountId] = useState(() => {
    const cash = accounts.find((a) => a.name.toLowerCase().includes('efectivo'));
    return cash ? cash.id : accounts[0]?.id || '';
  });
  const [projectId, setProjectId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Dynamic custom categories
  const [customCategories, setCustomCategories] = useState<string[]>([]);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCatName, setNewCatName] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMessage(null);
    setMimeType(file.type || 'image/jpeg');

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setImagePreview(result);
      processImage(result, file.type || 'image/jpeg');
    };
    reader.readAsDataURL(file);
  };

  const processImage = async (base64Img: string, type: string) => {
    setIsAnalyzing(true);
    setErrorMessage(null);
    try {
      const res = await api.ocrReceipt(base64Img, type);
      setMerchant(res.merchant || 'Comercio');
      setTotal(res.total || 0);
      setDate(res.date || new Date().toISOString().split('T')[0]);

      // Category matching
      const catQuery = res.categoryName || res.categoryId;
      if (catQuery) {
        const found = DEFAULT_CATEGORIES.find((c) =>
          c.toLowerCase().includes(catQuery.toLowerCase())
        );
        if (found) setSelectedCategoryName(found);
      } else {
        setSelectedCategoryName('Alimentos');
      }

      if (res.suggestedAccount && accounts.some((a) => a.id === res.suggestedAccount)) {
        setAccountId(res.suggestedAccount);
      }
    } catch (err: any) {
      console.error('Error analyzing receipt:', err);
      setErrorMessage(
        'No pudimos leer automáticamente todos los datos, pero los completamos con valores de referencia para que los revises.'
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleCreateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    const cat = newCatName.trim();
    if (!customCategories.includes(cat) && !DEFAULT_CATEGORIES.includes(cat)) {
      setCustomCategories((prev) => [...prev, cat]);
    }
    setSelectedCategoryName(cat);
    setNewCatName('');
    setIsAddingCategory(false);
  };

  const handleConfirmExpense = async () => {
    if (!total || total <= 0) {
      setErrorMessage('Por favor ingresá un importe válido mayor a cero.');
      return;
    }
    if (!accountId) {
      setErrorMessage('Por favor seleccioná el medio de pago (Efectivo, banco, etc).');
      return;
    }

    setIsSubmitting(true);
    try {
      // Find matching category ID or fallback to first
      const catObj = categories.find(
        (c) => c.name.toLowerCase() === selectedCategoryName.toLowerCase()
      );
      const categoryIdToUse = catObj ? catObj.id : categories[0]?.id || 'cat_comida';

      await api.createTransaction({
        type: 'expense',
        amount: total,
        currency: 'EUR',
        paymentMethodId: accountId,
        categoryId: categoryIdToUse,
        projectId: projectId || undefined,
        description: merchant.trim() || 'Gasto registrado',
        date,
        status: 'confirmed',
        source: 'receipt',
      });

      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Error al guardar gasto:', err);
      setErrorMessage(err.message || 'Error al guardar el gasto');
    } finally {
      setIsSubmitting(false);
    }
  };

  const allCategories = [...DEFAULT_CATEGORIES, ...customCategories];

  const formatDateDisplay = (d: string) => {
    try {
      const parts = d.split('-');
      if (parts.length === 3) {
        const monthNames = [
          'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
          'Jul', 'Ago', 'Sept', 'Oct', 'Nov', 'Dic'
        ];
        const mIndex = parseInt(parts[1], 10) - 1;
        return `${parseInt(parts[2], 10)} ${monthNames[mIndex] || ''}`;
      }
    } catch (e) {
      // fallback
    }
    return d;
  };

  const selectedAccount = accounts.find((a) => a.id === accountId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/70">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-white text-base sm:text-lg flex items-center gap-2">
                📸 Registrar Gasto
              </h2>
              <p className="text-xs text-slate-400">
                Foto con OCR IA o carga manual en 5 segundos
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1">
          {errorMessage && (
            <div className="p-3 bg-red-500/15 border border-red-500/30 rounded-xl flex items-center gap-2.5 text-red-400 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Mode Selector Tabs */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-950 rounded-2xl border border-slate-800">
            <button
              onClick={() => setEntryMode('scan')}
              className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                entryMode === 'scan'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Camera className="w-4 h-4" /> Sacar / Subir Foto
            </button>
            <button
              onClick={() => {
                setEntryMode('manual');
                setIsEditing(true);
              }}
              className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                entryMode === 'manual'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Zap className="w-4 h-4" /> Cargar sin ticket (manual)
            </button>
          </div>

          {/* SCAN MODE: Photo / Upload */}
          {entryMode === 'scan' && (
            <div>
              {!imagePreview ? (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-700 hover:border-blue-500 bg-slate-950/50 rounded-2xl p-6 text-center cursor-pointer transition-all group"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <div className="w-12 h-12 mx-auto rounded-2xl bg-blue-600/10 text-blue-400 flex items-center justify-center mb-2.5 group-hover:scale-110 transition-transform">
                    <Camera className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-slate-200 text-sm">
                    Sacar foto o subir imagen del ticket
                  </h3>
                  <p className="text-xs text-slate-400 max-w-xs mx-auto mt-1">
                    Mercadona, combustible, materiales o comida. JARVIS completa el total y el comercio automáticamente.
                  </p>
                </div>
              ) : (
                <div className="relative rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 max-h-36 flex items-center justify-center">
                  <img
                    src={imagePreview}
                    alt="Ticket"
                    className="max-h-36 object-contain w-full"
                  />
                  <button
                    onClick={() => {
                      setImagePreview(null);
                    }}
                    className="absolute top-2 right-2 bg-slate-900/80 hover:bg-slate-900 text-slate-300 hover:text-white p-1.5 rounded-lg text-xs backdrop-blur-md"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>
              )}

              {isAnalyzing && (
                <div className="mt-3 p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-center gap-2.5 text-blue-300 text-xs">
                  <Sparkles className="w-4 h-4 animate-spin" />
                  <span>Leyendo comprobante con IA...</span>
                </div>
              )}
            </div>
          )}

          {/* SUMMARY / CONFIRMATION CARD */}
          <div className="bg-slate-950 border border-emerald-500/40 rounded-2xl p-4 sm:p-5 space-y-3.5 shadow-lg">
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
                  Resumen del Gasto
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsEditing(!isEditing)}
                className="text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1"
              >
                <Edit3 className="w-3.5 h-3.5" />
                {isEditing ? 'Listo' : 'Editar'}
              </button>
            </div>

            {/* Read-Only Summary View */}
            {!isEditing ? (
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between py-1 border-b border-slate-900">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <Store className="w-3.5 h-3.5 text-blue-400" /> Comercio:
                  </span>
                  <span className="font-bold text-white text-sm">{merchant || 'Mercadona'}</span>
                </div>

                <div className="flex items-center justify-between py-1 border-b border-slate-900">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <span className="font-bold text-emerald-400">€</span> Total:
                  </span>
                  <span className="font-extrabold text-emerald-400 text-base">
                    {total.toFixed(2)} €
                  </span>
                </div>

                <div className="flex items-center justify-between py-1 border-b border-slate-900">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-blue-400" /> Fecha:
                  </span>
                  <span className="font-medium text-slate-200">{formatDateDisplay(date)}</span>
                </div>

                <div className="flex items-center justify-between py-1 border-b border-slate-900">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-blue-400" /> Categoría sugerida:
                  </span>
                  <span className="font-bold text-blue-300 bg-blue-950/60 px-2 py-0.5 rounded-md border border-blue-800/50">
                    {selectedCategoryName}
                  </span>
                </div>

                <div className="flex items-center justify-between py-1">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <Wallet className="w-3.5 h-3.5 text-blue-400" /> Cuenta:
                  </span>
                  <span className="font-medium text-slate-200">
                    {selectedAccount ? selectedAccount.name : 'Efectivo'}
                  </span>
                </div>
              </div>
            ) : (
              /* Editable Form Fields */
              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-[11px] font-medium text-slate-400 mb-1">
                    Comercio
                  </label>
                  <input
                    type="text"
                    value={merchant}
                    onChange={(e) => setMerchant(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                    placeholder="Ej. Mercadona"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-400 mb-1">
                      Total (€)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={total || ''}
                      onChange={(e) => setTotal(parseFloat(e.target.value) || 0)}
                      className="w-full bg-slate-900 border border-emerald-500/50 rounded-xl px-3 py-2 text-sm font-bold text-emerald-400 focus:outline-none focus:border-emerald-400"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-slate-400 mb-1">
                      Fecha
                    </label>
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* Category Selection */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-medium text-slate-400">
                      Categoría
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsAddingCategory(!isAddingCategory)}
                      className="text-[11px] text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-0.5"
                    >
                      <Plus className="w-3 h-3" /> Crear categoría
                    </button>
                  </div>

                  {isAddingCategory && (
                    <div className="flex items-center gap-1.5 mb-2">
                      <input
                        type="text"
                        placeholder="Nombre de la categoría..."
                        value={newCatName}
                        onChange={(e) => setNewCatName(e.target.value)}
                        className="flex-1 bg-slate-900 border border-blue-500 rounded-xl px-2.5 py-1.5 text-xs text-white"
                      />
                      <button
                        type="button"
                        onClick={handleCreateCategory}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold"
                      >
                        Añadir
                      </button>
                    </div>
                  )}

                  <select
                    value={selectedCategoryName}
                    onChange={(e) => setSelectedCategoryName(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  >
                    {allCategories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Account Selection */}
                <div>
                  <label className="block text-[11px] font-medium text-slate-400 mb-1">
                    Cuenta
                  </label>
                  <select
                    value={accountId}
                    onChange={(e) => setAccountId(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  >
                    {accounts.map((acc) => (
                      <option key={acc.id} value={acc.id}>
                        {acc.name} ({acc.balance.toFixed(2)} €)
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* FOOTER: [ Confirmar ] and [ Editar ] */}
        <div className="p-4 sm:p-5 border-t border-slate-800 flex items-center justify-between gap-3 bg-slate-950/70">
          <button
            type="button"
            onClick={() => setIsEditing(!isEditing)}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-all"
          >
            {isEditing ? 'Ver Resumen' : 'Editar'}
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3 py-2 text-xs text-slate-400 hover:text-white transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleConfirmExpense}
              disabled={isSubmitting || total <= 0}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30 transition-all active:scale-95 disabled:opacity-50"
            >
              {isSubmitting ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <CheckCircle2 className="w-4 h-4" />
              )}
              <span>Confirmar ({total.toFixed(2)} €)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
