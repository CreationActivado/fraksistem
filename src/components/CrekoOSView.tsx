import React, { useState } from 'react';
import {
  Rocket,
  Users,
  FileText,
  MapPin,
  Plus,
  ArrowRight,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  Phone,
  Instagram,
  ChevronRight,
  DollarSign,
  Search,
  Filter,
  Package,
  Video,
  Share2,
  Trash2,
  Calendar,
  Layers,
  Sparkles,
} from 'lucide-react';
import {
  CrekoLead,
  CrekoLeadStatus,
  CrekoQuote,
  GoogleMapsOpportunity,
  CrekoProductionOrder,
  CrekoContentItem,
} from '../types';
import { api } from '../services/api';

interface CrekoOSViewProps {
  leads: CrekoLead[];
  quotes: CrekoQuote[];
  opportunities: GoogleMapsOpportunity[];
  productionOrders?: CrekoProductionOrder[];
  contentItems?: CrekoContentItem[];
  onRefresh: () => void;
}

const STATUS_LABELS: Record<CrekoLeadStatus, { label: string; color: string }> = {
  lead: { label: 'Descubierto', color: 'bg-slate-800 text-slate-300 border-slate-700' },
  contacted: { label: 'Contactado', color: 'bg-blue-950/40 text-blue-300 border-blue-800/60' },
  replied: { label: 'Respondió', color: 'bg-cyan-950/40 text-cyan-300 border-cyan-800/60' },
  interested: { label: 'Interesado', color: 'bg-indigo-950/40 text-indigo-300 border-indigo-800/60' },
  quote: { label: 'Presupuesto', color: 'bg-amber-950/40 text-amber-300 border-amber-800/60' },
  negotiation: { label: 'Negociación', color: 'bg-orange-950/40 text-orange-300 border-orange-800/60' },
  closed: { label: 'Cerrado / Ganado', color: 'bg-emerald-950/40 text-emerald-300 border-emerald-800/60' },
  delivered: { label: 'Entregado', color: 'bg-teal-950/40 text-teal-300 border-teal-800/60' },
  followup: { label: 'Seguimiento', color: 'bg-purple-950/40 text-purple-300 border-purple-800/60' },
};

export const CrekoOSView: React.FC<CrekoOSViewProps> = ({
  leads,
  quotes,
  opportunities,
  productionOrders = [],
  contentItems = [],
  onRefresh,
}) => {
  const [activeTab, setActiveTab] = useState<
    'pipeline' | 'quotes' | 'maps' | 'production' | 'content'
  >('pipeline');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // New Lead Modal State
  const [isLeadModalOpen, setIsLeadModalOpen] = useState(false);
  const [newLeadName, setNewLeadName] = useState('');
  const [newLeadCompany, setNewLeadCompany] = useState('');
  const [newLeadValue, setNewLeadValue] = useState<number>(300);
  const [newLeadPhone, setNewLeadPhone] = useState('');
  const [newLeadIG, setNewLeadIG] = useState('');
  const [newLeadSource, setNewLeadSource] = useState<'google_maps' | 'instagram' | 'referral' | 'in_person' | 'other'>('google_maps');
  const [newLeadNotes, setNewLeadNotes] = useState('');

  // New Quote Modal State
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const [newQuoteClient, setNewQuoteClient] = useState('');
  const [newQuoteConcept, setNewQuoteConcept] = useState('');
  const [newQuoteAmount, setNewQuoteAmount] = useState<number>(250);

  // New Map Opportunity State
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const [newMapName, setNewMapName] = useState('');
  const [newMapCategory, setNewMapCategory] = useState('Bar / Gastronomía');
  const [newMapArea, setNewMapArea] = useState('Centro');
  const [newMapAmount, setNewMapAmount] = useState<number>(300);
  const [newMapAction, setNewMapAction] = useState('Proponer cartelería y uniformes');

  // Pilar 2: Producción Modal State
  const [isProductionModalOpen, setIsProductionModalOpen] = useState(false);
  const [newProdClient, setNewProdClient] = useState('');
  const [newProdDesc, setNewProdDesc] = useState('');
  const [newProdAmount, setNewProdAmount] = useState<number | ''>(200);
  const [newProdPaid, setNewProdPaid] = useState<number | ''>(0);
  const [newProdDate, setNewProdDate] = useState(new Date().toISOString().split('T')[0]);
  const [newProdNotes, setNewProdNotes] = useState('');

  // Pilar 3: Contenido Modal State
  const [isContentModalOpen, setIsContentModalOpen] = useState(false);
  const [newContentTitle, setNewContentTitle] = useState('');
  const [newContentPlatform, setNewContentPlatform] = useState<
    'instagram' | 'tiktok' | 'youtube' | 'web' | 'other'
  >('instagram');
  const [newContentFormat, setNewContentFormat] = useState<
    'reel' | 'story' | 'post' | 'carrousel' | 'short'
  >('reel');
  const [newContentStatus, setNewContentStatus] = useState<
    'idea' | 'scripted' | 'recorded' | 'edited' | 'published'
  >('idea');
  const [newContentDate, setNewContentDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [newContentNotes, setNewContentNotes] = useState('');

  // Production Handlers
  const handleCreateProduction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdClient.trim() || !newProdDesc.trim()) return;
    try {
      await api.createCrekoProduction({
        clientName: newProdClient.trim(),
        description: newProdDesc.trim(),
        amount: Number(newProdAmount) || 0,
        paidAmount: Number(newProdPaid) || 0,
        deliveryDate: newProdDate,
        status: 'pending',
        notes: newProdNotes.trim() || undefined,
      });
      setIsProductionModalOpen(false);
      setNewProdClient('');
      setNewProdDesc('');
      setNewProdAmount(200);
      setNewProdPaid(0);
      setNewProdNotes('');
      onRefresh();
    } catch (err) {
      console.error('Error creating production order:', err);
    }
  };

  const handleUpdateProductionStatus = async (
    order: CrekoProductionOrder,
    newStatus: CrekoProductionOrder['status']
  ) => {
    try {
      await api.updateCrekoProduction(order.id, { status: newStatus });
      onRefresh();
    } catch (err) {
      console.error('Error updating production order status:', err);
    }
  };

  const handleDeleteProduction = async (id: string) => {
    if (!confirm('¿Eliminar esta orden de trabajo?')) return;
    try {
      await api.deleteCrekoProduction(id);
      onRefresh();
    } catch (err) {
      console.error('Error deleting production order:', err);
    }
  };

  // Content Handlers
  const handleCreateContent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContentTitle.trim()) return;
    try {
      await api.createCrekoContent({
        title: newContentTitle.trim(),
        platform: newContentPlatform,
        format: newContentFormat,
        status: newContentStatus,
        publishDate: newContentDate || undefined,
        notes: newContentNotes.trim() || undefined,
      });
      setIsContentModalOpen(false);
      setNewContentTitle('');
      setNewContentNotes('');
      onRefresh();
    } catch (err) {
      console.error('Error creating content item:', err);
    }
  };

  const handleUpdateContentStatus = async (
    item: CrekoContentItem,
    newStatus: CrekoContentItem['status']
  ) => {
    try {
      await api.updateCrekoContent(item.id, { status: newStatus });
      onRefresh();
    } catch (err) {
      console.error('Error updating content item status:', err);
    }
  };

  const handleDeleteContent = async (id: string) => {
    if (!confirm('¿Eliminar esta idea / post?')) return;
    try {
      await api.deleteCrekoContent(id);
      onRefresh();
    } catch (err) {
      console.error('Error deleting content item:', err);
    }
  };

  // Metrics
  const totalPipelineValue = leads
    .filter((l) => l.status !== 'closed' && l.status !== 'delivered')
    .reduce((sum, l) => sum + (l.potentialValue || 0), 0);

  const waitingQuotesAmount = quotes
    .filter((q) => q.status === 'waiting')
    .reduce((sum, q) => sum + q.amount, 0);

  const filteredLeads = leads.filter((l) => {
    const matchesFilter = filterStatus === 'all' || l.status === filterStatus;
    const matchesSearch =
      l.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (l.company && l.company.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  const handleCreateLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLeadName.trim()) return;
    try {
      await api.createCrekoLead({
        name: newLeadName,
        company: newLeadCompany || undefined,
        potentialValue: Number(newLeadValue),
        probability: 50,
        source: newLeadSource,
        phone: newLeadPhone || undefined,
        instagram: newLeadIG || undefined,
        status: 'lead',
        notes: newLeadNotes || undefined,
      });
      setIsLeadModalOpen(false);
      setNewLeadName('');
      setNewLeadCompany('');
      setNewLeadNotes('');
      onRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateLeadStatus = async (id: string, newStatus: CrekoLeadStatus) => {
    try {
      await api.updateCrekoLead(id, { status: newStatus });
      onRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateQuote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuoteClient.trim()) return;
    try {
      await api.createCrekoQuote({
        code: `PRE-${Date.now().toString().slice(-4)}`,
        clientName: newQuoteClient,
        concept: newQuoteConcept,
        amount: Number(newQuoteAmount),
        status: 'waiting',
        sentDate: new Date().toISOString().split('T')[0],
        needsFollowUp: false,
      });
      setIsQuoteModalOpen(false);
      setNewQuoteClient('');
      setNewQuoteConcept('');
      onRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  const handleConvertOpp = async (id: string, target: 'lead' | 'task') => {
    try {
      await api.convertOpportunity(id, target);
      onRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateOpp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMapName.trim()) return;
    try {
      await api.createCrekoOpportunity({
        name: newMapName,
        category: newMapCategory,
        area: newMapArea,
        potentialAmount: Number(newMapAmount),
        suggestedAction: newMapAction,
        status: 'discovered',
      });
      setIsMapModalOpen(false);
      setNewMapName('');
      onRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-950/40 via-indigo-950/30 to-slate-900 border border-blue-900/50 rounded-2xl p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
              <Rocket className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  Creko OS
                </h1>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  Motor de Ingresos
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Pipeline comercial, presupuestos activos y captación directa en Google Maps
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsLeadModalOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-md flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Nuevo Lead
            </button>
            <button
              onClick={() => setIsQuoteModalOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all border border-slate-700 flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Presupuesto
            </button>
          </div>
        </div>

        {/* Top Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-5 border-t border-slate-800/80">
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="text-[11px] font-medium text-slate-400 block">Pipeline Activo</span>
            <span className="text-lg sm:text-xl font-bold text-white">
              {totalPipelineValue.toLocaleString('es-ES')} €
            </span>
          </div>
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="text-[11px] font-medium text-slate-400 block">Presupuestos Enviados</span>
            <span className="text-lg sm:text-xl font-bold text-amber-400">
              {waitingQuotesAmount.toLocaleString('es-ES')} €
            </span>
          </div>
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="text-[11px] font-medium text-slate-400 block">Clientes en Pipeline</span>
            <span className="text-lg sm:text-xl font-bold text-blue-400">{leads.length}</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="text-[11px] font-medium text-slate-400 block">Locales Maps Detectados</span>
            <span className="text-lg sm:text-xl font-bold text-emerald-400">{opportunities.length}</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto no-scrollbar scrollbar-none">
        <button
          onClick={() => setActiveTab('pipeline')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'pipeline'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Users className="w-4 h-4" /> Pipeline CRM ({leads.length})
        </button>

        <button
          onClick={() => setActiveTab('quotes')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'quotes'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <FileText className="w-4 h-4" /> Presupuestos ({quotes.length})
          {quotes.some((q) => q.needsFollowUp || q.status === 'waiting') && (
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('maps')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'maps'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <MapPin className="w-4 h-4" /> Captación Maps ({opportunities.length})
        </button>

        <button
          onClick={() => setActiveTab('production')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'production'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Package className="w-4 h-4" /> Pilar 2: Producción ({productionOrders.length})
        </button>

        <button
          onClick={() => setActiveTab('content')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'content'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Video className="w-4 h-4" /> Pilar 3: Contenido ({contentItems.length})
        </button>
      </div>

      {/* TAB 1: PIPELINE CRM */}
      {activeTab === 'pipeline' && (
        <div className="space-y-4">
          {/* Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-1 max-w-md">
              <div className="relative w-full">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Buscar cliente o comercio..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
              <span className="text-xs text-slate-400 font-medium shrink-0">Filtrar:</span>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-300 focus:outline-none"
              >
                <option value="all">Todos los estados</option>
                <option value="lead">Descubierto</option>
                <option value="contacted">Contactado</option>
                <option value="interested">Interesado</option>
                <option value="quote">Presupuesto</option>
                <option value="negotiation">Negociación</option>
                <option value="closed">Cerrado</option>
                <option value="followup">Seguimiento</option>
              </select>
            </div>
          </div>

          {/* Leads Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {filteredLeads.map((lead) => {
              const statusBadge = STATUS_LABELS[lead.status] || STATUS_LABELS.lead;
              return (
                <div
                  key={lead.id}
                  className="p-4 rounded-2xl bg-[#1E293B] border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between space-y-3 shadow-sm"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <h3 className="text-sm font-bold text-white tracking-tight">{lead.name}</h3>
                        {lead.company && (
                          <span className="text-[11px] text-slate-400 block">{lead.company}</span>
                        )}
                      </div>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border ${statusBadge.color}`}
                      >
                        {statusBadge.label}
                      </span>
                    </div>

                    {lead.notes && (
                      <p className="text-xs text-slate-300 bg-slate-900/50 p-2.5 rounded-xl border border-slate-800/60 leading-relaxed mb-3">
                        {lead.notes}
                      </p>
                    )}

                    <div className="space-y-1 text-xs text-slate-400">
                      {lead.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="w-3.5 h-3.5 text-blue-400" />
                          <span>{lead.phone}</span>
                        </div>
                      )}
                      {lead.instagram && (
                        <div className="flex items-center gap-2">
                          <Instagram className="w-3.5 h-3.5 text-pink-400" />
                          <span>{lead.instagram}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Valor Potencial</span>
                      <span className="text-sm font-black text-emerald-400">
                        {lead.potentialValue} €
                      </span>
                    </div>

                    <select
                      value={lead.status}
                      onChange={(e) => handleUpdateLeadStatus(lead.id, e.target.value as CrekoLeadStatus)}
                      className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-[11px] text-slate-200 font-semibold focus:outline-none"
                    >
                      <option value="lead">Descubierto</option>
                      <option value="contacted">Contactado</option>
                      <option value="interested">Interesado</option>
                      <option value="quote">Presupuesto</option>
                      <option value="negotiation">Negociación</option>
                      <option value="closed">Cerrado 🎉</option>
                      <option value="followup">Seguimiento</option>
                    </select>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: QUOTES */}
      {activeTab === 'quotes' && (
        <div className="space-y-4">
          <div className="space-y-3">
            {quotes.map((q) => {
              const isWaiting = q.status === 'waiting';
              return (
                <div
                  key={q.id}
                  className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                    isWaiting
                      ? 'bg-amber-950/20 border-amber-800/40 hover:bg-amber-950/30'
                      : 'bg-[#1E293B] border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                        {q.code}
                      </span>
                      <h3 className="text-sm font-bold text-white">{q.clientName}</h3>
                      {isWaiting && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" /> Requiere seguimiento hoy
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-300">{q.concept}</p>
                    {q.notes && <p className="text-[11px] text-slate-400">{q.notes}</p>}
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                    <span className="text-base font-black text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-xl border border-emerald-500/30">
                      {q.amount} €
                    </span>

                    <select
                      value={q.status}
                      onChange={async (e) => {
                        await api.updateCrekoQuote(q.id, { status: e.target.value as any });
                        onRefresh();
                      }}
                      className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 font-semibold focus:outline-none"
                    >
                      <option value="draft">Borrador</option>
                      <option value="sent">Enviado</option>
                      <option value="waiting">Esperando respuesta</option>
                      <option value="accepted">Aceptado ✅</option>
                      <option value="rejected">Rechazado ❌</option>
                    </select>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: GOOGLE MAPS CAPTACIÓN */}
      {activeTab === 'maps' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-white">Comercios y Locales Descubiertos</h2>
              <p className="text-xs text-slate-400">
                Oportunidades de rotulación, packaging y merchandising en tu radio
              </p>
            </div>
            <button
              onClick={() => setIsMapModalOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Agregar Local
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {opportunities.map((opp) => (
              <div
                key={opp.id}
                className="p-4 rounded-2xl bg-[#1E293B] border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div>
                      <h3 className="text-sm font-bold text-white">{opp.name}</h3>
                      <span className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-red-400" /> {opp.area} • {opp.category}
                      </span>
                    </div>
                    <span className="text-xs font-black text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                      ~{opp.potentialAmount} €
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 bg-slate-900/50 p-2.5 rounded-xl border border-slate-800/80 mb-2">
                    💡 <span className="font-semibold">Acción:</span> {opp.suggestedAction}
                  </p>
                  {opp.notes && <p className="text-[11px] text-slate-400">{opp.notes}</p>}
                </div>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
                  <button
                    onClick={() => handleConvertOpp(opp.id, 'task')}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold transition-all"
                  >
                    Crear Tarea
                  </button>
                  <button
                    onClick={() => handleConvertOpp(opp.id, 'lead')}
                    className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1"
                  >
                    Pasar a CRM <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: PILAR 2 - PRODUCCIÓN & PEDIDOS */}
      {activeTab === 'production' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Package className="w-4 h-4 text-blue-400" /> Órdenes de Trabajo & Producción
              </h2>
              <p className="text-xs text-slate-400">
                Seguimiento de pedidos en taller: cartelería, prendas, vinilos y entregas
              </p>
            </div>
            <button
              onClick={() => setIsProductionModalOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-md flex items-center gap-1.5 self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" /> Nueva Orden
            </button>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl">
              <span className="text-[11px] text-slate-400 block">Total Órdenes</span>
              <span className="text-lg font-bold text-white">{productionOrders.length}</span>
            </div>
            <div className="bg-slate-900 border border-amber-500/20 p-3 rounded-xl">
              <span className="text-[11px] text-amber-400 block">En Taller / Producción</span>
              <span className="text-lg font-bold text-amber-400">
                {productionOrders.filter((o) => o.status === 'in_production').length}
              </span>
            </div>
            <div className="bg-slate-900 border border-emerald-500/20 p-3 rounded-xl">
              <span className="text-[11px] text-emerald-400 block">Listas para Entrega</span>
              <span className="text-lg font-bold text-emerald-400">
                {productionOrders.filter((o) => o.status === 'ready').length}
              </span>
            </div>
            <div className="bg-slate-900 border border-blue-500/20 p-3 rounded-xl">
              <span className="text-[11px] text-blue-400 block">Saldo por Cobrar</span>
              <span className="text-lg font-bold text-blue-400">
                {productionOrders
                  .filter((o) => o.status !== 'delivered')
                  .reduce((sum, o) => sum + (o.amount - (o.paidAmount || 0)), 0)
                  .toFixed(2)}{' '}
                €
              </span>
            </div>
          </div>

          {/* Production Orders List */}
          <div className="space-y-3">
            {productionOrders.length === 0 ? (
              <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-10 text-center text-slate-400">
                <Package className="w-8 h-8 mx-auto mb-2 text-slate-600" />
                <p className="text-sm font-medium">No hay órdenes de producción registradas.</p>
                <p className="text-xs text-slate-500 mt-1">
                  Registrá cualquier pedido cerrado para controlar los tiempos de fabricación y cobro.
                </p>
              </div>
            ) : (
              productionOrders.map((order) => {
                const balancePending = order.amount - (order.paidAmount || 0);
                return (
                  <div
                    key={order.id}
                    className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all"
                  >
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-white text-sm sm:text-base">
                          {order.clientName}
                        </h3>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            order.status === 'in_production'
                              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                              : order.status === 'ready'
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                              : order.status === 'delivered'
                              ? 'bg-slate-800 text-slate-400 border-slate-700'
                              : 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                          }`}
                        >
                          {order.status === 'in_production'
                            ? 'En Producción'
                            : order.status === 'ready'
                            ? 'Listo para Entrega'
                            : order.status === 'delivered'
                            ? 'Entregado'
                            : 'Pendiente'}
                        </span>
                      </div>

                      <p className="text-xs text-slate-300 font-medium">{order.description}</p>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                        {order.deliveryDate && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-slate-500" />
                            Entrega: {order.deliveryDate}
                          </span>
                        )}
                        {order.notes && (
                          <span className="text-slate-500 italic">"{order.notes}"</span>
                        )}
                      </div>
                    </div>

                    {/* Financial details & status transitions */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-800">
                      <div className="text-left sm:text-right">
                        <div className="text-xs text-slate-400">
                          Total: <strong className="text-white">{order.amount.toFixed(2)} €</strong>
                        </div>
                        {balancePending > 0 ? (
                          <div className="text-xs text-amber-400 font-semibold">
                            Pendiente: {balancePending.toFixed(2)} €
                          </div>
                        ) : (
                          <div className="text-xs text-emerald-400 font-semibold">100% Cobrado</div>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 flex-wrap">
                        {order.status === 'pending' && (
                          <button
                            onClick={() => handleUpdateProductionStatus(order, 'in_production')}
                            className="px-2.5 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-semibold"
                          >
                            A Producción
                          </button>
                        )}
                        {order.status === 'in_production' && (
                          <button
                            onClick={() => handleUpdateProductionStatus(order, 'ready')}
                            className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold"
                          >
                            Listo
                          </button>
                        )}
                        {order.status === 'ready' && (
                          <button
                            onClick={() => handleUpdateProductionStatus(order, 'delivered')}
                            className="px-2.5 py-1.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-xs font-semibold"
                          >
                            Entregar
                          </button>
                        )}
                        {order.status === 'delivered' && (
                          <button
                            onClick={() => handleUpdateProductionStatus(order, 'ready')}
                            className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[11px]"
                          >
                            Deshacer
                          </button>
                        )}

                        <button
                          onClick={() => handleDeleteProduction(order.id)}
                          className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors"
                          title="Eliminar orden"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* TAB 5: PILAR 3 - CONTENIDO & REDES */}
      {activeTab === 'content' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Video className="w-4 h-4 text-purple-400" /> Plan de Contenido & Redes Sociales
              </h2>
              <p className="text-xs text-slate-400">
                Planificá videos, reels y casos de éxito para alimentar la visibilidad de Creko
              </p>
            </div>
            <button
              onClick={() => setIsContentModalOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all shadow-md flex items-center gap-1.5 self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" /> Nueva Idea / Post
            </button>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl">
              <span className="text-[11px] text-slate-400 block">Total Ideas</span>
              <span className="text-lg font-bold text-white">{contentItems.length}</span>
            </div>
            <div className="bg-slate-900 border border-amber-500/20 p-3 rounded-xl">
              <span className="text-[11px] text-amber-400 block">En Proceso (Guión / Grab)</span>
              <span className="text-lg font-bold text-amber-400">
                {
                  contentItems.filter(
                    (c) => c.status === 'scripted' || c.status === 'recorded' || c.status === 'edited'
                  ).length
                }
              </span>
            </div>
            <div className="bg-slate-900 border border-emerald-500/20 p-3 rounded-xl">
              <span className="text-[11px] text-emerald-400 block">Publicados</span>
              <span className="text-lg font-bold text-emerald-400">
                {contentItems.filter((c) => c.status === 'published').length}
              </span>
            </div>
            <div className="bg-slate-900 border border-purple-500/20 p-3 rounded-xl">
              <span className="text-[11px] text-purple-400 block">Instagram / TikTok</span>
              <span className="text-lg font-bold text-purple-400">
                {
                  contentItems.filter(
                    (c) => c.platform === 'instagram' || c.platform === 'tiktok'
                  ).length
                }
              </span>
            </div>
          </div>

          {/* Content Items List */}
          <div className="space-y-3">
            {contentItems.length === 0 ? (
              <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-10 text-center text-slate-400">
                <Video className="w-8 h-8 mx-auto mb-2 text-slate-600" />
                <p className="text-sm font-medium">No hay publicaciones planificadas.</p>
                <p className="text-xs text-slate-500 mt-1">
                  Anotá ideas de reels mostrando trabajos terminados, antes y después, o consejos.
                </p>
              </div>
            ) : (
              contentItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-white text-sm sm:text-base">{item.title}</h3>
                      <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 border border-purple-500/30">
                        {item.platform}
                      </span>
                      <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-md bg-slate-800 text-slate-300">
                        {item.format}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          item.status === 'published'
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                            : item.status === 'edited'
                            ? 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                            : item.status === 'recorded'
                            ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                            : item.status === 'scripted'
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                            : 'bg-slate-800 text-slate-400 border-slate-700'
                        }`}
                      >
                        {item.status === 'idea' && '💡 Idea'}
                        {item.status === 'scripted' && '📝 Guionado'}
                        {item.status === 'recorded' && '🎬 Grabado'}
                        {item.status === 'edited' && '✂️ Editado'}
                        {item.status === 'published' && '🚀 Publicado'}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                      {item.publishDate && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-500" />
                          Fecha meta: {item.publishDate}
                        </span>
                      )}
                      {item.notes && <span className="text-slate-500 italic">"{item.notes}"</span>}
                    </div>
                  </div>

                  {/* Actions to advance workflow */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {item.status === 'idea' && (
                      <button
                        onClick={() => handleUpdateContentStatus(item, 'scripted')}
                        className="px-2.5 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-semibold"
                      >
                        Guionar
                      </button>
                    )}
                    {item.status === 'scripted' && (
                      <button
                        onClick={() => handleUpdateContentStatus(item, 'recorded')}
                        className="px-2.5 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-semibold"
                      >
                        Grabado
                      </button>
                    )}
                    {item.status === 'recorded' && (
                      <button
                        onClick={() => handleUpdateContentStatus(item, 'edited')}
                        className="px-2.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold"
                      >
                        Editado
                      </button>
                    )}
                    {item.status === 'edited' && (
                      <button
                        onClick={() => handleUpdateContentStatus(item, 'published')}
                        className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold"
                      >
                        Publicar
                      </button>
                    )}
                    {item.status === 'published' && (
                      <button
                        onClick={() => handleUpdateContentStatus(item, 'edited')}
                        className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded text-[11px]"
                      >
                        Deshacer
                      </button>
                    )}

                    <button
                      onClick={() => handleDeleteContent(item.id)}
                      className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors"
                      title="Eliminar contenido"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* MODAL: NUEVO LEAD */}
      {isLeadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#1E293B] border border-slate-700 rounded-2xl w-full max-w-md p-5 sm:p-6 shadow-2xl">
            <h2 className="text-base font-bold text-white mb-4">Registrar Nuevo Cliente / Lead</h2>
            <form onSubmit={handleCreateLead} className="space-y-3.5">
              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">
                  Nombre del Cliente o Negocio *
                </label>
                <input
                  type="text"
                  required
                  value={newLeadName}
                  onChange={(e) => setNewLeadName(e.target.value)}
                  placeholder="Ej. Bar Central, Gym Fit"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">
                  Empresa o Razón Social
                </label>
                <input
                  type="text"
                  value={newLeadCompany}
                  onChange={(e) => setNewLeadCompany(e.target.value)}
                  placeholder="Ej. Central SL"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">
                    Valor Estimado (€)
                  </label>
                  <input
                    type="number"
                    value={newLeadValue}
                    onChange={(e) => setNewLeadValue(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">Origen</label>
                  <select
                    value={newLeadSource}
                    onChange={(e) => setNewLeadSource(e.target.value as any)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                  >
                    <option value="google_maps">Google Maps</option>
                    <option value="instagram">Instagram</option>
                    <option value="in_person">Presencial</option>
                    <option value="referral">Recomendación</option>
                    <option value="other">Otro</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">
                  Teléfono / WhatsApp
                </label>
                <input
                  type="text"
                  value={newLeadPhone}
                  onChange={(e) => setNewLeadPhone(e.target.value)}
                  placeholder="+34 600..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">Notas</label>
                <textarea
                  value={newLeadNotes}
                  onChange={(e) => setNewLeadNotes(e.target.value)}
                  placeholder="¿Qué servicio necesitan? Vinilos, indumentaria, cartas..."
                  rows={2}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsLeadModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-md"
                >
                  Guardar Lead
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: NUEVO PRESUPUESTO */}
      {isQuoteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#1E293B] border border-slate-700 rounded-2xl w-full max-w-md p-5 sm:p-6 shadow-2xl">
            <h2 className="text-base font-bold text-white mb-4">Crear Presupuesto</h2>
            <form onSubmit={handleCreateQuote} className="space-y-3.5">
              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">Cliente *</label>
                <input
                  type="text"
                  required
                  value={newQuoteClient}
                  onChange={(e) => setNewQuoteClient(e.target.value)}
                  placeholder="Nombre del cliente o negocio"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">Concepto *</label>
                <input
                  type="text"
                  required
                  value={newQuoteConcept}
                  onChange={(e) => setNewQuoteConcept(e.target.value)}
                  placeholder="Ej. Cartelería exterior y 20 uniformes bordados"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">Monto Total (€) *</label>
                <input
                  type="number"
                  required
                  value={newQuoteAmount}
                  onChange={(e) => setNewQuoteAmount(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsQuoteModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-md"
                >
                  Generar Presupuesto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: NUEVA OPORTUNIDAD MAPS */}
      {isMapModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#1E293B] border border-slate-700 rounded-2xl w-full max-w-md p-5 sm:p-6 shadow-2xl">
            <h2 className="text-base font-bold text-white mb-4">Registrar Comercio de Maps</h2>
            <form onSubmit={handleCreateOpp} className="space-y-3.5">
              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">
                  Nombre del Local *
                </label>
                <input
                  type="text"
                  required
                  value={newMapName}
                  onChange={(e) => setNewMapName(e.target.value)}
                  placeholder="Ej. Tapería La Plaza"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">Categoría</label>
                  <input
                    type="text"
                    value={newMapCategory}
                    onChange={(e) => setNewMapCategory(e.target.value)}
                    placeholder="Bar, Gimnasio, Tienda"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">Zona / Barrio</label>
                  <input
                    type="text"
                    value={newMapArea}
                    onChange={(e) => setNewMapArea(e.target.value)}
                    placeholder="Centro, Polígono"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">
                  Potencial Estimado (€)
                </label>
                <input
                  type="number"
                  value={newMapAmount}
                  onChange={(e) => setNewMapAmount(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">
                  Acción Sugerida
                </label>
                <input
                  type="text"
                  value={newMapAction}
                  onChange={(e) => setNewMapAction(e.target.value)}
                  placeholder="Proponer vinilos, packaging..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsMapModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-md"
                >
                  Registrar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: NUEVA ORDEN DE PRODUCCIÓN */}
      {isProductionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#1E293B] border border-slate-700 rounded-2xl w-full max-w-md p-5 sm:p-6 shadow-2xl">
            <h2 className="text-base font-bold text-white mb-2 flex items-center gap-2">
              <Package className="w-5 h-5 text-blue-400" /> Nueva Orden de Producción
            </h2>
            <p className="text-xs text-slate-400 mb-4">
              Registrá el trabajo a fabricar en taller para controlar plazos y cobros.
            </p>

            <form onSubmit={handleCreateProduction} className="space-y-3.5">
              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">
                  Cliente o Negocio *
                </label>
                <input
                  type="text"
                  required
                  value={newProdClient}
                  onChange={(e) => setNewProdClient(e.target.value)}
                  placeholder="Ej. Bar DejaVu, Rotuprint..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">
                  Descripción del Pedido *
                </label>
                <input
                  type="text"
                  required
                  value={newProdDesc}
                  onChange={(e) => setNewProdDesc(e.target.value)}
                  placeholder="Ej. Cartel luminoso 2x1m + 20 cartas de menú plastificadas"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">
                    Precio Total (€) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={newProdAmount}
                    onChange={(e) =>
                      setNewProdAmount(e.target.value === '' ? '' : parseFloat(e.target.value))
                    }
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-emerald-400 font-bold focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">
                    Ya Cobrado / Seña (€)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={newProdPaid}
                    onChange={(e) =>
                      setNewProdPaid(e.target.value === '' ? '' : parseFloat(e.target.value))
                    }
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">
                  Fecha estimada de Entrega
                </label>
                <input
                  type="date"
                  value={newProdDate}
                  onChange={(e) => setNewProdDate(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">
                  Notas / Materiales
                </label>
                <input
                  type="text"
                  value={newProdNotes}
                  onChange={(e) => setNewProdNotes(e.target.value)}
                  placeholder="Vinilo polimérico mate, perfil de aluminio..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsProductionModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-md"
                >
                  Crear Orden
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: NUEVA IDEA DE CONTENIDO */}
      {isContentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#1E293B] border border-slate-700 rounded-2xl w-full max-w-md p-5 sm:p-6 shadow-2xl">
            <h2 className="text-base font-bold text-white mb-2 flex items-center gap-2">
              <Video className="w-5 h-5 text-purple-400" /> Nueva Idea de Contenido
            </h2>
            <p className="text-xs text-slate-400 mb-4">
              Anotá qué vas a grabar para potenciar las marcas de Creko.
            </p>

            <form onSubmit={handleCreateContent} className="space-y-3.5">
              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">
                  Título / Concepto del Video o Post *
                </label>
                <input
                  type="text"
                  required
                  value={newContentTitle}
                  onChange={(e) => setNewContentTitle(e.target.value)}
                  placeholder="Ej. Cómo rotulamos la furgoneta de DejaVu en 1 minuto"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">
                    Plataforma
                  </label>
                  <select
                    value={newContentPlatform}
                    onChange={(e) => setNewContentPlatform(e.target.value as any)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                  >
                    <option value="instagram">Instagram</option>
                    <option value="tiktok">TikTok</option>
                    <option value="youtube">YouTube Shorts</option>
                    <option value="web">Web / Portfolio</option>
                    <option value="other">Otro</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">
                    Formato
                  </label>
                  <select
                    value={newContentFormat}
                    onChange={(e) => setNewContentFormat(e.target.value as any)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                  >
                    <option value="reel">Reel / Video Corto</option>
                    <option value="story">Historia Diaria</option>
                    <option value="carrousel">Carrusel / Fotos</option>
                    <option value="post">Post Simple</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">
                    Estado Inicial
                  </label>
                  <select
                    value={newContentStatus}
                    onChange={(e) => setNewContentStatus(e.target.value as any)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                  >
                    <option value="idea">💡 Idea</option>
                    <option value="scripted">📝 Guionado</option>
                    <option value="recorded">🎬 Grabado</option>
                    <option value="edited">✂️ Editado</option>
                    <option value="published">🚀 Publicado</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">
                    Fecha Objetivo
                  </label>
                  <input
                    type="date"
                    value={newContentDate}
                    onChange={(e) => setNewContentDate(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">
                  Notas / Hook / Música
                </label>
                <input
                  type="text"
                  value={newContentNotes}
                  onChange={(e) => setNewContentNotes(e.target.value)}
                  placeholder="Hook: 'El error que arruina el vinilo de tu local...'"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsContentModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all shadow-md"
                >
                  Guardar Idea
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
