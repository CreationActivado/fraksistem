import React, { useState } from 'react';
import {
  FileCheck,
  Building,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Plus,
  Shield,
  ExternalLink,
  ChevronRight,
  Info,
} from 'lucide-react';
import { SpainProcessDoc } from '../types';
import { api } from '../services/api';

interface SpainProcessViewProps {
  docs: SpainProcessDoc[];
  onRefresh: () => void;
}

export const SpainProcessView: React.FC<SpainProcessViewProps> = ({ docs, onRefresh }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newProcess, setNewProcess] = useState('Rotuprint / Contrato laboral');
  const [newStatus, setNewStatus] = useState<'ready' | 'pending' | 'in_progress' | 'legalized' | 'apostilled' | 'expired'>('pending');
  const [newExpiresAt, setNewExpiresAt] = useState('');
  const [newNotes, setNewNotes] = useState('');

  const handleCreateDoc = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    try {
      await api.createSpainDoc({
        title: newTitle,
        category: (newProcess.toLowerCase().includes('rotuprint')
          ? 'rotuprint'
          : 'documentos') as any,
        status: (newStatus === 'apostilled' || newStatus === 'legalized' ? 'ready' : newStatus) as any,
        dueDate: newExpiresAt || undefined,
        notes: newNotes || undefined,
      });
      setIsModalOpen(false);
      setNewTitle('');
      setNewNotes('');
      onRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateStatus = async (id: string, status: any) => {
    try {
      await api.updateSpainDoc(id, { status });
      onRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  // Stats
  const readyCount = docs.filter((d) => d.status === 'ready' || d.status === 'legalized' || d.status === 'apostilled').length;
  const pendingCount = docs.filter((d) => d.status === 'pending' || d.status === 'in_progress').length;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-950/40 via-orange-950/30 to-slate-900 border border-amber-900/50 rounded-2xl p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-amber-600/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Building className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  Trámites y Residencia España
                </h1>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Rotuprint & Legal
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Seguimiento documental riguroso, plazos de vigencia y expediente de regularización
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition-all shadow-md flex items-center gap-1.5 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" /> Agregar Documento
          </button>
        </div>

        {/* Disclaimer Card */}
        <div className="mt-4 p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-400 flex items-start gap-2.5">
          <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong className="text-slate-200">Aviso del Asistente:</strong> JARVIS organiza el
            checklist de documentos, plazos y alertas de caducidad personales para que Fran no
            pierda fechas críticas. No sustituye la asesoría de un gestor colegiado o abogado de
            extranjería.
          </p>
        </div>

        {/* Roadmap Milestones */}
        <div className="mt-6 pt-5 border-t border-slate-800/80">
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-3">
            Ruta de Regularización (Hito Rotuprint):
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
            {[
              { step: 1, title: 'Oferta / Precontrato', status: 'Completado', current: false, done: true },
              { step: 2, title: 'Documentación Empresa', status: 'En curso', current: true, done: false },
              { step: 3, title: 'Presentación Telemática', status: 'Pendiente', current: false, done: false },
              { step: 4, title: 'Seguimiento Expediente', status: 'En espera', current: false, done: false },
              { step: 5, title: 'Resolución & TIE', status: 'Meta final', current: false, done: false },
            ].map((m) => (
              <div
                key={m.step}
                className={`p-3 rounded-xl border flex flex-col justify-between ${
                  m.done
                    ? 'bg-emerald-950/30 border-emerald-800/60 text-emerald-300'
                    : m.current
                    ? 'bg-amber-950/40 border-amber-600/80 text-amber-200 shadow-md shadow-amber-900/20'
                    : 'bg-slate-900/40 border-slate-800 text-slate-400'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold">Paso {m.step}</span>
                  {m.done && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                  {m.current && <Clock className="w-3.5 h-3.5 text-amber-400 animate-spin" />}
                </div>
                <h4 className="text-xs font-bold text-white leading-tight">{m.title}</h4>
                <span className="text-[10px] font-medium mt-1">{m.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Docs List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <FileCheck className="w-4 h-4 text-amber-400" />
            Checklist de Documentación ({readyCount}/{docs.length} Listos)
          </h2>
        </div>

        <div className="space-y-2.5">
          {docs.map((doc) => {
            const isReady =
              doc.status === 'ready' || doc.status === 'legalized' || doc.status === 'apostilled';
            return (
              <div
                key={doc.id}
                className="p-4 rounded-2xl bg-[#1E293B] border border-slate-800 hover:border-slate-700 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">{doc.title}</span>
                    <span className="text-[10px] text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                      {doc.process}
                    </span>
                  </div>

                  {doc.notes && <p className="text-xs text-slate-300">{doc.notes}</p>}

                  {doc.expiresAt && (
                    <div className="flex items-center gap-1 text-[11px] text-amber-400 font-medium">
                      <Calendar className="w-3 h-3" /> Vence / Caduca: {doc.expiresAt}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <select
                    value={doc.status}
                    onChange={(e) => handleUpdateStatus(doc.id, e.target.value)}
                    className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-slate-200 font-semibold focus:outline-none"
                  >
                    <option value="pending">Pendiente</option>
                    <option value="in_progress">En trámite</option>
                    <option value="ready">Listo ✅</option>
                    <option value="legalized">Legalizado</option>
                    <option value="apostilled">Apostillado</option>
                    <option value="expired">Caducado ⚠️</option>
                  </select>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal: Nuevo Documento */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#1E293B] border border-slate-700 rounded-2xl w-full max-w-md p-5 sm:p-6 shadow-2xl">
            <h2 className="text-base font-bold text-white mb-4">Agregar Documento a Trámites</h2>
            <form onSubmit={handleCreateDoc} className="space-y-3.5">
              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">
                  Nombre del Documento *
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Ej. Certificado de Empadronamiento, Antecedentes Penales"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">
                  Proceso o Destino
                </label>
                <input
                  type="text"
                  value={newProcess}
                  onChange={(e) => setNewProcess(e.target.value)}
                  placeholder="Rotuprint / Regularización"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">Estado</label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as any)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                  >
                    <option value="pending">Pendiente</option>
                    <option value="in_progress">En trámite</option>
                    <option value="ready">Listo</option>
                    <option value="legalized">Legalizado</option>
                    <option value="apostilled">Apostillado</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">
                    Fecha Vencimiento (opcional)
                  </label>
                  <input
                    type="date"
                    value={newExpiresAt}
                    onChange={(e) => setNewExpiresAt(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">
                  Notas o Requisitos
                </label>
                <textarea
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="Vigencia máxima 3 meses, legalización previa..."
                  rows={2}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition-all shadow-md"
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
