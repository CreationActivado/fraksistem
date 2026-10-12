import React, { useState, useEffect } from 'react';
import {
  Brain,
  Sliders,
  Plus,
  Trash2,
  Pencil,
  X,
  Search,
  Download,
  RotateCcw,
  Sparkles,
  FolderTree,
  Tag,
  CreditCard,
  Rocket,
  ShieldCheck,
  AlertTriangle,
  MapPin,
  Compass,
  CheckCircle2,
  Layers,
  Save,
} from 'lucide-react';
import { UserMemory, Category, Account, Project, UserProfile, LifeStage } from '../types';
import { api } from '../services/api';

interface MemorySettingsViewProps {
  memory: UserMemory[];
  categories: Category[];
  accounts: Account[];
  projects: Project[];
  onRefreshData: () => void;
}

export const MemorySettingsView: React.FC<MemorySettingsViewProps> = ({
  memory,
  categories,
  accounts,
  projects,
  onRefreshData,
}) => {
  const [filterType, setFilterType] = useState<string>('all');
  const [filterClassification, setFilterClassification] = useState<string>('all');
  const [searchRuleQuery, setSearchRuleQuery] = useState('');
  const [isCreatingRule, setIsCreatingRule] = useState(false);

  // User Profile state
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileSavedFeedback, setProfileSavedFeedback] = useState(false);

  // Profile Edit Modal State
  const [isEditingProfileModal, setIsEditingProfileModal] = useState(false);
  const [profileName, setProfileName] = useState('');
  const [profileLocation, setProfileLocation] = useState('');
  const [profileLifeStage, setProfileLifeStage] = useState('');
  const [profileIncomeStructure, setProfileIncomeStructure] = useState('');
  const [profileActiveProjectsText, setProfileActiveProjectsText] = useState('');
  const [profileCommunicationStyle, setProfileCommunicationStyle] = useState('directo_practico_firme');
  const [profileMonthlyReserveTarget, setProfileMonthlyReserveTarget] = useState(1000);

  // New rule state
  const [ruleKey, setRuleKey] = useState('');
  const [ruleValue, setRuleValue] = useState('');
  const [ruleType, setRuleType] = useState<UserMemory['type']>('category_rule');
  const [rulePriority, setRulePriority] = useState<UserMemory['priority']>('user_preference');
  const [ruleClassification, setRuleClassification] = useState<UserMemory['classification']>('user_preference');
  const [ruleDesc, setRuleDesc] = useState('');
  const [targetAccount, setTargetAccount] = useState<string>('');
  const [targetCategory, setTargetCategory] = useState<string>('');
  const [targetProject, setTargetProject] = useState<string>('');

  // Editing Rule state
  const [editingRule, setEditingRule] = useState<UserMemory | null>(null);
  const [editRuleKey, setEditRuleKey] = useState('');
  const [editRuleValue, setEditRuleValue] = useState('');
  const [editRuleType, setEditRuleType] = useState<UserMemory['type']>('category_rule');
  const [editRulePriority, setEditRulePriority] = useState<UserMemory['priority']>('user_preference');
  const [editRuleClassification, setEditRuleClassification] = useState<UserMemory['classification']>('user_preference');
  const [editRuleDesc, setEditRuleDesc] = useState('');
  const [editIsTemporary, setEditIsTemporary] = useState(false);
  const [editTargetAccount, setEditTargetAccount] = useState<string>('');
  const [editTargetCategory, setEditTargetCategory] = useState<string>('');
  const [editTargetProject, setEditTargetProject] = useState<string>('');
  const [isSavingRule, setIsSavingRule] = useState(false);

  // Category addition
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [selectedCatForSub, setSelectedCatForSub] = useState<string | null>(null);
  const [newSubName, setNewSubName] = useState('');

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const p = await api.getProfile();
      setProfile(p);
    } catch (e) {
      console.error('Error loading profile:', e);
    }
  };

  const handleUpdateProfile = async (updates: Partial<UserProfile>) => {
    if (!profile) return;
    setIsSavingProfile(true);
    try {
      const updated = await api.updateProfile(updates);
      setProfile(updated);
      setProfileSavedFeedback(true);
      setTimeout(() => setProfileSavedFeedback(false), 3000);
      onRefreshData();
    } catch (err) {
      console.error('Error updating profile:', err);
    } finally {
      setIsSavingProfile(false);
    }
  };

  const openEditProfile = () => {
    if (!profile) return;
    setProfileName(profile.name || 'Fran');
    setProfileLocation(profile.location || 'España');
    setProfileLifeStage(profile.lifeStage || '');
    setProfileIncomeStructure(profile.incomeStructure || '');
    setProfileActiveProjectsText((profile.activeProjects || []).join(', '));
    setProfileCommunicationStyle(profile.communicationStyle || 'directo_practico_firme');
    setProfileMonthlyReserveTarget(profile.monthlyReserveTarget || 1000);
    setIsEditingProfileModal(true);
  };

  const handleSaveProfileModal = async (e: React.FormEvent) => {
    e.preventDefault();
    const projectsList = profileActiveProjectsText
      .split(',')
      .map((p) => p.trim())
      .filter(Boolean);

    await handleUpdateProfile({
      name: profileName.trim(),
      location: profileLocation.trim(),
      lifeStage: profileLifeStage.trim(),
      incomeStructure: profileIncomeStructure.trim(),
      activeProjects: projectsList,
      communicationStyle: profileCommunicationStyle as any,
      monthlyReserveTarget: Number(profileMonthlyReserveTarget) || 1000,
    });
    setIsEditingProfileModal(false);
  };

  const stages: { key: LifeStage; label: string; desc: string }[] = [
    { key: 'supervivencia', label: '1. Supervivencia', desc: 'Cubrir lo elemental' },
    { key: 'estabilidad', label: '2. Estabilidad', desc: 'Previsibilidad y liquidez' },
    { key: 'control', label: '3. Control', desc: 'Cero fugas y orden total' },
    { key: 'generacion', label: '4. Generación', desc: 'Incremento de cobros' },
    { key: 'construccion', label: '5. Construcción', desc: 'Consolidando permanencia' },
    { key: 'crecimiento', label: '6. Crecimiento', desc: 'Expansión e inversiones' },
  ];

  const filteredMemory = memory.filter((m) => {
    if (filterType !== 'all' && m.type !== filterType) return false;
    if (filterClassification !== 'all' && m.classification !== filterClassification) return false;
    if (searchRuleQuery.trim()) {
      const q = searchRuleQuery.toLowerCase().trim();
      const matchKey = m.key.toLowerCase().includes(q);
      const matchVal = m.value.toLowerCase().includes(q);
      const matchDesc = (m.description || '').toLowerCase().includes(q);
      if (!matchKey && !matchVal && !matchDesc) return false;
    }
    return true;
  });

  const handleCreateRule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ruleKey.trim()) return;

    try {
      await api.createMemory({
        key: ruleKey.trim().toLowerCase(),
        value: ruleValue.trim() || ruleKey.trim(),
        type: ruleType,
        priority: rulePriority,
        classification: ruleClassification,
        description: ruleDesc.trim() || `Regla de correspondencia para ${ruleKey}`,
        targetData: {
          paymentMethodId: targetAccount || undefined,
          categoryId: targetCategory || undefined,
          projectId: targetProject || undefined,
        },
      });

      setIsCreatingRule(false);
      setRuleKey('');
      setRuleValue('');
      setRuleDesc('');
      setTargetAccount('');
      setTargetCategory('');
      setTargetProject('');
      onRefreshData();
    } catch (err) {
      console.error('Error creating memory rule:', err);
    }
  };

  const startEditingRule = (rule: UserMemory) => {
    setEditingRule(rule);
    setEditRuleKey(rule.key);
    setEditRuleValue(rule.value);
    setEditRuleType(rule.type);
    setEditRulePriority(rule.priority);
    setEditRuleClassification(rule.classification || 'user_preference');
    setEditRuleDesc(rule.description || '');
    setEditIsTemporary(!!rule.isTemporary);
    setEditTargetAccount(rule.targetData?.paymentMethodId || '');
    setEditTargetCategory(rule.targetData?.categoryId || '');
    setEditTargetProject(rule.targetData?.projectId || '');
  };

  const handleSaveRule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRule) return;
    setIsSavingRule(true);
    try {
      await api.updateMemory(editingRule.id, {
        key: editRuleKey.trim(),
        value: editRuleValue.trim(),
        type: editRuleType,
        priority: editRulePriority,
        classification: editRuleClassification,
        description: editRuleDesc.trim(),
        isTemporary: editIsTemporary,
        targetData: {
          paymentMethodId: editTargetAccount || undefined,
          categoryId: editTargetCategory || undefined,
          projectId: editTargetProject || undefined,
        },
      });
      setEditingRule(null);
      onRefreshData();
    } catch (err) {
      console.error('Error updating memory rule:', err);
    } finally {
      setIsSavingRule(false);
    }
  };

  const handleDeleteRule = async (id: string) => {
    if (window.confirm('¿Seguro que deseas eliminar esta regla de memoria?')) {
      try {
        await api.deleteMemory(id);
        onRefreshData();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    try {
      await api.createCategory(newCatName.trim(), ['General']);
      setNewCatName('');
      setIsCreatingCategory(false);
      onRefreshData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddSubcategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCatForSub || !newSubName.trim()) return;
    try {
      await api.addSubcategory(selectedCatForSub, newSubName.trim());
      setNewSubName('');
      setSelectedCatForSub(null);
      onRefreshData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleReset = async () => {
    if (
      window.confirm(
        '⚠️ ¿Estás seguro de que quieres restablecer la base de datos a sus valores iniciales oficiales (180 € en efectivo)?'
      )
    ) {
      try {
        await api.resetDatabase();
        alert('Base de datos restablecida a 180 € en efectivo correctamente.');
        onRefreshData();
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 pb-28 max-w-5xl mx-auto px-2 sm:px-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
            <Brain className="w-6 h-6 text-blue-500" />
            Mi Cerebro Financiero
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 italic">
            "Todo es modificable: tus reglas, alias, contexto en España y metas de estabilidad."
          </p>
        </div>

        <div className="flex items-center gap-2">
          {profile && (
            <button
              onClick={openEditProfile}
              className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white px-3.5 py-2 rounded-xl text-xs font-semibold shadow-md shadow-blue-500/20 transition-all active:scale-95"
              id="btn-edit-profile-main"
            >
              <Pencil className="w-3.5 h-3.5" />
              Editar Perfil y Contexto
            </button>
          )}
        </div>
      </div>

      {/* SECTION 0: CONTEXTO PERSONAL Y ETAPA REAL EN ESPAÑA */}
      {profile && (
        <div className="bg-[#1E293B] p-5 sm:p-6 rounded-2xl border border-slate-800 shadow-xl space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-500/15 rounded-xl border border-blue-500/30 text-blue-400">
                <Compass className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-white">Perfil y Contexto Real del Usuario</h2>
                  <span className="flex items-center gap-1 text-[11px] font-bold bg-blue-500/15 text-blue-400 border border-blue-500/30 px-2 py-0.5 rounded-full">
                    <MapPin className="w-3 h-3" /> {profile.location}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  El cerebro adapta sus respuestas al momento vital de {profile.name} en España
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {profileSavedFeedback && (
                <span className="text-xs text-emerald-400 flex items-center gap-1 font-semibold animate-fade-in">
                  <CheckCircle2 className="w-4 h-4" /> Guardado
                </span>
              )}
              <button
                onClick={openEditProfile}
                className="flex items-center gap-1 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3 py-1.5 rounded-xl text-xs font-medium transition-all"
                title="Editar datos de contexto"
              >
                <Pencil className="w-3 h-3 text-blue-400" />
                Modificar
              </button>
            </div>
          </div>

          {/* Context Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm">
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] uppercase font-semibold text-slate-400 block tracking-wider">
                  Momento Vital & Objetivo
                </span>
                <span className="text-[10px] text-blue-400 font-semibold uppercase">
                  Meta reserva: {profile.monthlyReserveTarget} €
                </span>
              </div>
              <p className="text-white font-medium text-sm">{profile.lifeStage}</p>
              <div className="pt-2 border-t border-slate-800/80">
                <span className="text-[11px] text-slate-400 block mb-1">Estructura de ingresos:</span>
                <p className="text-xs text-slate-300 leading-relaxed">{profile.incomeStructure}</p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
              <span className="text-[11px] uppercase font-semibold text-slate-400 block tracking-wider">
                Proyectos Activos & Criterio Rector
              </span>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {profile.activeProjects.map((proj, idx) => (
                  <span
                    key={idx}
                    className="text-[11px] bg-slate-800 text-slate-300 px-2.5 py-1 rounded-lg border border-slate-700 font-medium"
                  >
                    {proj}
                  </span>
                ))}
              </div>
              <div className="pt-2 border-t border-slate-800/80">
                <span className="text-[11px] text-blue-400 font-semibold block mb-0.5">Regla de decisión maestra:</span>
                <p className="text-xs text-slate-300 italic">
                  "Primero estar estable ➔ Después generar ➔ Después construir ➔ Después crecer."
                </p>
              </div>
            </div>
          </div>

          {/* PRIORIDADES CLAVE & REGLAS DE OPERACIÓN (PRIORIDAD 0 MVP) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-900/80 border border-blue-900/30">
              <span className="text-[11px] uppercase font-bold text-blue-400 tracking-wider flex items-center gap-1.5 mb-2.5">
                <Sparkles className="w-3.5 h-3.5" /> 6 Prioridades de Fran
              </span>
              <div className="space-y-1.5">
                {(profile.priorities || [
                  '1. Generar ingresos diarios/semanales',
                  '2. Creko',
                  '3. Resolver Rotuprint',
                  '4. Cuidar salud (gym, comida)',
                  '5. No dispersarse con proyectos nuevos',
                  '6. Regular weed',
                ]).map((p, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-slate-300 bg-slate-800/50 px-2.5 py-1.5 rounded-lg border border-slate-700/40">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0" />
                    <span>{p}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/80 border border-indigo-900/30">
              <span className="text-[11px] uppercase font-bold text-indigo-400 tracking-wider flex items-center gap-1.5 mb-2.5">
                <ShieldCheck className="w-3.5 h-3.5" /> Reglas de Respuesta de JARVIS
              </span>
              <div className="space-y-1.5">
                {(profile.operatingRules || [
                  'Ser directo',
                  'Respuestas cortas',
                  'No humo',
                  'Pensar como socio/director',
                  'Cuidar el dinero',
                ]).map((r, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-slate-300 bg-slate-800/50 px-2.5 py-1.5 rounded-lg border border-slate-700/40">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                    <span className="font-medium text-slate-200">{r}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Progression Ladder */}
          <div>
            <span className="text-xs font-semibold text-slate-300 block mb-2">
              Escala de Progresión Vital (Fase Actual: {profile.stageProgression.toUpperCase()})
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
              {stages.map((st) => {
                const isCurrent = profile.stageProgression === st.key;
                return (
                  <button
                    key={st.key}
                    type="button"
                    onClick={() => handleUpdateProfile({ stageProgression: st.key })}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      isCurrent
                        ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/20'
                        : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span className="text-xs font-bold block">{st.label}</span>
                    <span className="text-[10px] opacity-80 block mt-0.5 line-clamp-1">{st.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Preferences Toggles */}
          <div className="pt-2 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <label className="flex items-center gap-2 cursor-pointer p-2.5 rounded-xl bg-slate-900/40 border border-slate-800 hover:border-slate-700">
              <input
                type="checkbox"
                checked={profile.preferences.prioritizeReserveBeforeGrowth}
                onChange={(e) =>
                  handleUpdateProfile({
                    preferences: { ...profile.preferences, prioritizeReserveBeforeGrowth: e.target.checked },
                  })
                }
                className="rounded border-slate-700 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-slate-300">Priorizar reserva antes de crecer</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer p-2.5 rounded-xl bg-slate-900/40 border border-slate-800 hover:border-slate-700">
              <input
                type="checkbox"
                checked={profile.preferences.confirmHighExpenses}
                onChange={(e) =>
                  handleUpdateProfile({
                    preferences: { ...profile.preferences, confirmHighExpenses: e.target.checked },
                  })
                }
                className="rounded border-slate-700 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-slate-300">Avisar en gastos altos (&gt; {profile.preferences.highExpenseThreshold} €)</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer p-2.5 rounded-xl bg-slate-900/40 border border-slate-800 hover:border-slate-700">
              <input
                type="checkbox"
                checked={profile.preferences.autoLearnRules}
                onChange={(e) =>
                  handleUpdateProfile({
                    preferences: { ...profile.preferences, autoLearnRules: e.target.checked },
                  })
                }
                className="rounded border-slate-700 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-slate-300">Aprender reglas automáticamente</span>
            </label>
          </div>
        </div>
      )}

      {/* SECTION 1: USER MEMORY RULES */}
      <div className="bg-[#1E293B] p-5 sm:p-6 rounded-2xl border border-slate-800 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-500" />
              Reglas, Alias y Datos Aprendidos ({filteredMemory.length} de {memory.length})
            </h2>
            <p className="text-xs text-slate-400">
              Hechos confirmados, preferencias y reglas. Modificables en cualquier momento.
            </p>
          </div>

          <button
            onClick={() => setIsCreatingRule(true)}
            className="flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white px-3.5 py-2 rounded-xl text-xs font-semibold shadow-md shadow-blue-500/20 transition-all active:scale-95"
            id="btn-new-memory-rule"
          >
            <Plus className="w-4 h-4" />
            Nueva Regla
          </button>
        </div>

        {/* Search & Filter Controls */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-2 border-t border-slate-800/80">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchRuleQuery}
              onChange={(e) => setSearchRuleQuery(e.target.value)}
              placeholder="Buscar regla (ej: naranja, nafta, ctc, espana)..."
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
            />
            {searchRuleQuery && (
              <button
                onClick={() => setSearchRuleQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <select
              value={filterClassification}
              onChange={(e) => setFilterClassification(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-blue-500"
            >
              <option value="all">Todas las clases</option>
              <option value="confirmed_fact">Datos confirmados</option>
              <option value="user_preference">Preferencias</option>
              <option value="temporary_context">Contexto temporal</option>
              <option value="habit">Hábitos</option>
            </select>

            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-blue-500"
            >
              <option value="all">Todos los tipos</option>
              <option value="payment_method_alias">Alias de Cuentas</option>
              <option value="category_rule">Reglas de Categoría</option>
              <option value="project_rule">Reglas de Proyecto</option>
              <option value="financial_rule">Reglas Financieras</option>
              <option value="context">Contexto</option>
              <option value="preference">Preferencias</option>
            </select>
          </div>
        </div>

        {/* Memory Rules List */}
        <div className="divide-y divide-slate-800/80">
          {filteredMemory.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-xs">
              No se encontraron reglas con los filtros seleccionados.
            </div>
          ) : (
            filteredMemory.map((rule) => (
              <div
                key={rule.id}
                className="py-3 hover:bg-slate-800/40 transition-colors flex items-center justify-between gap-3 px-2 rounded-xl"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-xs sm:text-sm bg-blue-950/50 text-blue-300 px-2.5 py-0.5 rounded-lg border border-blue-800/40">
                      "{rule.key}"
                    </span>
                    <span className="text-slate-500 text-xs">➔</span>
                    <span className="font-semibold text-slate-200 text-xs sm:text-sm truncate max-w-xs">
                      {rule.value}
                    </span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${
                        rule.priority === 'user_preference'
                          ? 'bg-purple-950/50 text-purple-300 border-purple-800/40'
                          : rule.priority === 'learned_rule'
                          ? 'bg-emerald-950/50 text-emerald-300 border-emerald-800/40'
                          : 'bg-slate-800 text-slate-400 border-slate-700'
                      }`}
                    >
                      {rule.priority === 'user_preference'
                        ? 'Preferencia'
                        : rule.priority === 'learned_rule'
                        ? 'Aprendida en chat'
                        : 'Regla global'}
                    </span>
                    {rule.classification && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-slate-800/80 text-slate-300 border border-slate-700">
                        {rule.classification === 'confirmed_fact'
                          ? 'Dato confirmado'
                          : rule.classification === 'temporary_context'
                          ? 'Contexto temporal'
                          : rule.classification === 'habit'
                          ? 'Hábito'
                          : 'Preferencia'}
                      </span>
                    )}
                  </div>
                  {rule.description && (
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">{rule.description}</p>
                  )}
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => startEditingRule(rule)}
                    className="p-1.5 text-slate-400 hover:text-blue-400 hover:bg-blue-950/40 rounded-lg transition-colors"
                    title="Editar regla de memoria"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteRule(rule.id)}
                    className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 rounded-lg transition-colors"
                    title="Eliminar regla"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* SECTION 2: CATEGORIES & SUBCATEGORIES */}
      <div className="bg-[#1E293B] p-5 sm:p-6 rounded-2xl border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <FolderTree className="w-4 h-4 text-blue-500" />
              Categorías y Subcategorías
            </h2>
            <p className="text-xs text-slate-400">
              Estructura jerárquica para la clasificación de tus movimientos
            </p>
          </div>

          <button
            onClick={() => setIsCreatingCategory(true)}
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 px-3 py-1.5 rounded-xl text-xs font-semibold shadow-xs transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            Nueva Categoría
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-sm">{cat.name}</span>
                <button
                  onClick={() => setSelectedCatForSub(cat.id)}
                  className="text-[11px] font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-0.5 transition-colors"
                >
                  <Plus className="w-3 h-3" /> Subcategoría
                </button>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {cat.subcategories.map((sub) => (
                  <span
                    key={sub.id}
                    className="text-xs bg-slate-800 text-slate-300 px-2.5 py-1 rounded-lg border border-slate-700 font-medium"
                  >
                    {sub.name}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 3: BACKUP, EXPORT & RESET */}
      <div className="bg-[#1E293B] p-5 sm:p-6 rounded-2xl border border-slate-800 shadow-xl space-y-4">
        <div>
          <h2 className="text-base font-bold text-white">Respaldo y Estado Oficial de Base de Datos</h2>
          <p className="text-xs text-slate-400">
            Base de datos oficial sincronizada con tu cuenta real (Efectivo: 180 €).
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-800/60 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all"
            id="btn-reset-db"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Restablecer a Oficial (Efectivo 180 €)
          </button>
        </div>
      </div>

      {/* MODAL: EDIT USER PROFILE & CONTEXT */}
      {isEditingProfileModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#1E293B] border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl text-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Compass className="w-5 h-5 text-blue-400" />
                <h3 className="text-base font-bold text-white">Modificar Perfil y Contexto Vital</h3>
              </div>
              <button
                onClick={() => setIsEditingProfileModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProfileModal} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Nombre</label>
                  <input
                    type="text"
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Ubicación / País</label>
                  <input
                    type="text"
                    value={profileLocation}
                    onChange={(e) => setProfileLocation(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Momento Vital & Diagnóstico de Etapa
                </label>
                <textarea
                  value={profileLifeStage}
                  onChange={(e) => setProfileLifeStage(e.target.value)}
                  rows={2}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  placeholder="Ej: Construyendo estabilidad y evaluando permanencia en España..."
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Estructura de Ingresos (Fuentes variables)
                </label>
                <textarea
                  value={profileIncomeStructure}
                  onChange={(e) => setProfileIncomeStructure(e.target.value)}
                  rows={2}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  placeholder="Ej: Múltiples fuentes: changas, oficios (electricidad), Rotuprint..."
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Proyectos Activos (separados por coma)
                </label>
                <input
                  type="text"
                  value={profileActiveProjectsText}
                  onChange={(e) => setProfileActiveProjectsText(e.target.value)}
                  placeholder="Creko, CTC, Rotuprint, Software para clientes..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Meta Reserva Mensual (€)</label>
                  <input
                    type="number"
                    min="0"
                    value={profileMonthlyReserveTarget}
                    onChange={(e) => setProfileMonthlyReserveTarget(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Estilo de Comunicación</label>
                  <select
                    value={profileCommunicationStyle}
                    onChange={(e) => setProfileCommunicationStyle(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="directo_practico_firme">Directo, Práctico y Firme</option>
                    <option value="formal_analitico">Formal y Analítico</option>
                    <option value="amigable_suave">Amigable y Motivador</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsEditingProfileModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSavingProfile}
                  className="px-4 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-lg shadow-blue-500/20 transition-all flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  Guardar Perfil
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT MEMORY RULE */}
      {editingRule && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#1E293B] border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl text-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Pencil className="w-4 h-4 text-blue-400" />
                <h3 className="text-base font-bold text-white">Modificar Regla de Memoria</h3>
              </div>
              <button
                onClick={() => setEditingRule(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveRule} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Expresión / Frase Clave (Trigger)
                </label>
                <input
                  type="text"
                  value={editRuleKey}
                  onChange={(e) => setEditRuleKey(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 font-mono"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Significado / Valor Asociado
                </label>
                <input
                  type="text"
                  value={editRuleValue}
                  onChange={(e) => setEditRuleValue(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Tipo de regla</label>
                  <select
                    value={editRuleType}
                    onChange={(e) => setEditRuleType(e.target.value as any)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="payment_method_alias">Alias de Cuenta</option>
                    <option value="category_rule">Regla de Categoría</option>
                    <option value="project_rule">Regla de Proyecto</option>
                    <option value="financial_rule">Regla Financiera</option>
                    <option value="context">Contexto</option>
                    <option value="preference">Preferencia</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Clasificación</label>
                  <select
                    value={editRuleClassification}
                    onChange={(e) => setEditRuleClassification(e.target.value as any)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="confirmed_fact">Dato confirmado</option>
                    <option value="user_preference">Preferencia</option>
                    <option value="temporary_context">Contexto temporal</option>
                    <option value="habit">Hábito detectado</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Prioridad</label>
                <select
                  value={editRulePriority}
                  onChange={(e) => setEditRulePriority(e.target.value as any)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="user_preference">Preferencia explícita del usuario</option>
                  <option value="learned_rule">Regla aprendida</option>
                  <option value="global">Regla general</option>
                  <option value="temporary_context">Contexto temporal</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Descripción o Explicación
                </label>
                <textarea
                  value={editRuleDesc}
                  onChange={(e) => setEditRuleDesc(e.target.value)}
                  rows={2}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  placeholder="Detalles sobre cuándo y cómo aplicar esta regla..."
                />
              </div>

              <div className="pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                  <input
                    type="checkbox"
                    checked={editIsTemporary}
                    onChange={(e) => setEditIsTemporary(e.target.checked)}
                    className="rounded border-slate-700 text-blue-600 focus:ring-blue-500"
                  />
                  <span>Marcar como contexto temporal (expira o cambia pronto)</span>
                </label>
              </div>

              {/* Optional Target Bindings */}
              {editRuleType === 'payment_method_alias' && (
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Cuenta de destino</label>
                  <select
                    value={editTargetAccount}
                    onChange={(e) => setEditTargetAccount(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="">Seleccionar cuenta...</option>
                    {accounts.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {editRuleType === 'category_rule' && (
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Categoría de destino</label>
                  <select
                    value={editTargetCategory}
                    onChange={(e) => setEditTargetCategory(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="">Seleccionar categoría...</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {editRuleType === 'project_rule' && (
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Proyecto de destino</label>
                  <select
                    value={editTargetProject}
                    onChange={(e) => setEditTargetProject(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="">Seleccionar proyecto...</option>
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingRule(null)}
                  className="px-4 py-2 font-semibold text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSavingRule}
                  className="px-4 py-2 font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-lg shadow-blue-500/20 transition-all flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  {isSavingRule ? 'Guardando...' : 'Guardar Cambios'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CREATE MEMORY RULE */}
      {isCreatingRule && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#1E293B] border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl text-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">Nueva Regla o Alias de Memoria</h3>
              <button
                onClick={() => setIsCreatingRule(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateRule} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Expresión o Alias (ej: "la naranja", "nafta", "ctc")
                </label>
                <input
                  type="text"
                  value={ruleKey}
                  onChange={(e) => setRuleKey(e.target.value)}
                  placeholder="Ej: la naranja, galicia, nafta, ctc..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Tipo de regla
                </label>
                <select
                  value={ruleType}
                  onChange={(e) => setRuleType(e.target.value as any)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="payment_method_alias">Alias de Cuenta / Medio de Pago</option>
                  <option value="category_rule">Regla de Categoría</option>
                  <option value="project_rule">Regla de Proyecto</option>
                  <option value="financial_rule">Regla Financiera / Criterio</option>
                  <option value="context">Contexto Vital</option>
                  <option value="preference">Preferencia Personal</option>
                </select>
              </div>

              {ruleType === 'payment_method_alias' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Cuenta vinculada
                  </label>
                  <select
                    value={targetAccount}
                    onChange={(e) => setTargetAccount(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="">Seleccionar cuenta...</option>
                    {accounts.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {ruleType === 'category_rule' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Categoría vinculada
                  </label>
                  <select
                    value={targetCategory}
                    onChange={(e) => setTargetCategory(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="">Seleccionar categoría...</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {ruleType === 'project_rule' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Proyecto vinculado
                  </label>
                  <select
                    value={targetProject}
                    onChange={(e) => setTargetProject(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="">Seleccionar proyecto...</option>
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Texto descriptivo / Significado
                </label>
                <input
                  type="text"
                  value={ruleValue}
                  onChange={(e) => setRuleValue(e.target.value)}
                  placeholder="Ej: Tarjeta Naranja, Transporte / Combustible..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Prioridad
                  </label>
                  <select
                    value={rulePriority}
                    onChange={(e) => setRulePriority(e.target.value as any)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="user_preference">Preferencia explícita</option>
                    <option value="learned_rule">Regla aprendida</option>
                    <option value="global">Regla general</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Clasificación
                  </label>
                  <select
                    value={ruleClassification}
                    onChange={(e) => setRuleClassification(e.target.value as any)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="confirmed_fact">Dato confirmado</option>
                    <option value="user_preference">Preferencia</option>
                    <option value="temporary_context">Contexto temporal</option>
                    <option value="habit">Hábito detectado</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCreatingRule(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-lg shadow-blue-500/20 transition-colors"
                >
                  Guardar Regla
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD CATEGORY */}
      {isCreatingCategory && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#1E293B] border border-slate-800 rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-2xl text-slate-200">
            <h3 className="text-base font-bold text-white">Nueva Categoría</h3>

            <form onSubmit={handleCreateCategory} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Nombre de la categoría
                </label>
                <input
                  type="text"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  placeholder="Ej: Salud, Mascotas, Educación..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsCreatingCategory(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-lg shadow-blue-500/20 transition-colors"
                >
                  Crear
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD SUBCATEGORY */}
      {selectedCatForSub && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#1E293B] border border-slate-800 rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-2xl text-slate-200">
            <h3 className="text-base font-bold text-white">Nueva Subcategoría</h3>

            <form onSubmit={handleAddSubcategory} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Nombre de la subcategoría
                </label>
                <input
                  type="text"
                  value={newSubName}
                  onChange={(e) => setNewSubName(e.target.value)}
                  placeholder="Ej: Farmacia, Gimnasio..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setSelectedCatForSub(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-lg shadow-blue-500/20 transition-colors"
                >
                  Agregar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
