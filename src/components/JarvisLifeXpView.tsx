import React, { useState } from 'react';
import {
  Zap,
  Heart,
  Flame,
  Award,
  CheckCircle2,
  Circle,
  Plus,
  TrendingUp,
  Shield,
  RefreshCw,
  Sparkles,
  Calendar,
  AlertTriangle,
  Settings,
  ChevronRight,
  Cigarette,
  Dumbbell,
  BookOpen,
  Briefcase,
  Users,
  DollarSign,
  Coffee,
  Check,
  X,
  Footprints,
} from 'lucide-react';
import { RpgState, RpgMissionItem, RpgConfig } from '../types';
import { api } from '../services/api';

interface JarvisLifeXpViewProps {
  rpg: RpgState | null;
  onRefreshRpg: () => void;
  onOpenTobaccoModal?: () => void;
  onOpenNfcModal?: () => void;
}

export const JarvisLifeXpView: React.FC<JarvisLifeXpViewProps> = ({
  rpg,
  onRefreshRpg,
  onOpenTobaccoModal,
  onOpenNfcModal,
}) => {
  const [activeTab, setActiveTab] = useState<'misiones' | 'acciones' | 'rachas' | 'historial' | 'config'>('misiones');
  const [missionFilter, setMissionFilter] = useState<'diaria' | 'semanal' | 'recuperacion'>('diaria');
  const [incomeXpInput, setIncomeXpInput] = useState('');
  const [isAddingMission, setIsAddingMission] = useState(false);
  const [newMissionTitle, setNewMissionTitle] = useState('');
  const [newMissionXp, setNewMissionXp] = useState(100);
  const [newMissionCategory, setNewMissionCategory] = useState<'diaria' | 'semanal' | 'recuperacion'>('diaria');
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);
  const [isSavingConfig, setIsSavingConfig] = useState(false);

  // Config local state for editing
  const [configState, setConfigState] = useState<RpgConfig>(
    rpg?.config || {
      xpValues: {
        gym: 100,
        run: 150,
        football: 100,
        read: 100,
        meditate: 75,
        jobSearch: 150,
        getClient: 250,
        organizeTasks: 50,
        smokePenalty: -50,
        missImportantMission: -25,
        breakStreak: -50,
      },
      streakBonus: {
        threeDays: 50,
        sevenDays: 150,
        fourteenDays: 300,
        thirtyDays: 600,
      },
    }
  );

  const showNotification = (msg: string) => {
    setActionSuccessMsg(msg);
    setTimeout(() => setActionSuccessMsg(null), 3000);
  };

  const handleQuickAction = async (action: string, xp: number, reason: string, livesChange?: number) => {
    try {
      await api.recordRpgAction(action, xp, reason, livesChange);
      showNotification(`${xp >= 0 ? '+' : ''}${xp} XP: ${action}`);
      onRefreshRpg();
    } catch (err) {
      console.error('Error recording action:', err);
    }
  };

  const handleIncomeXpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = Number(incomeXpInput);
    if (!amount || amount <= 0) return;
    try {
      await api.recordRpgAction('Ingreso Generado', Math.round(amount), `Ingreso de ${amount} € generado`);
      showNotification(`+${Math.round(amount)} XP por generar ingresos de ${amount} €`);
      setIncomeXpInput('');
      onRefreshRpg();
    } catch (err) {
      console.error('Error generating income XP:', err);
    }
  };

  const handleToggleMission = async (id: string) => {
    try {
      await api.toggleRpgMission(id);
      onRefreshRpg();
    } catch (err) {
      console.error('Error toggling mission:', err);
    }
  };

  const handleCreateMission = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMissionTitle.trim()) return;
    try {
      await api.createRpgMission({
        title: newMissionTitle.trim(),
        category: newMissionCategory,
        xp: Number(newMissionXp) || 100,
      });
      setNewMissionTitle('');
      setIsAddingMission(false);
      onRefreshRpg();
    } catch (err) {
      console.error('Error creating mission:', err);
    }
  };

  const handleDeleteMission = async (id: string) => {
    try {
      await api.deleteRpgMission(id);
      onRefreshRpg();
    } catch (err) {
      console.error('Error deleting mission:', err);
    }
  };

  const handleSaveConfig = async () => {
    setIsSavingConfig(true);
    try {
      await api.updateRpgConfig(configState);
      showNotification('Configuración de valores RPG guardada');
      onRefreshRpg();
    } catch (err) {
      console.error('Error saving config:', err);
    } finally {
      setIsSavingConfig(false);
    }
  };

  const currentLevel = rpg?.level || 3;
  const levelName = rpg?.levelName || 'Control';
  const currentXp = rpg?.currentLevelXp || 780;
  const nextXp = rpg?.nextLevelXp || 1300;
  const totalXp = rpg?.totalXp || 2780;
  const progressPercent = rpg?.progressPercent || 60;
  const lives = rpg?.lives ?? 5;
  const maxLives = rpg?.maxLives ?? 5;

  const missionsList =
    missionFilter === 'diaria'
      ? rpg?.dailyMissions || []
      : missionFilter === 'semanal'
      ? rpg?.weeklyMissions || []
      : rpg?.recoveryMissions || [];

  return (
    <div className="space-y-6 pb-24 text-slate-200">
      {/* Toast Notification */}
      {actionSuccessMsg && (
        <div className="fixed top-4 right-4 z-50 bg-emerald-600 text-white font-bold text-xs sm:text-sm px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2 border border-emerald-400 animate-in fade-in slide-in-from-top-4 duration-300">
          <Sparkles className="w-4 h-4 text-emerald-200" />
          <span>{actionSuccessMsg}</span>
        </div>
      )}

      {/* 1. HERO RPG STATUS CARD: NIVEL, XP, VIDAS & STAGE */}
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-500/30 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
        {/* Glow background effect */}
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -mb-12 -ml-12 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-md">
                <Zap className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-black uppercase tracking-wider text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full border border-amber-400/20">
                    JARVIS LIFE XP
                  </span>
                  <span className="text-xs text-slate-400 font-medium">Autocontrol & Progresión</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2 mt-0.5">
                  Nivel {currentLevel} — <span className="text-indigo-400">{levelName}</span>
                </h1>
              </div>
            </div>

            <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
              Tu vida funcionando como un sistema RPG real. Cada acción suma XP, los hábitos te protegen y las vidas representan tu reserva de disciplina.
            </p>

            {/* Vidas / Hearts */}
            <div className="flex items-center gap-3 pt-1">
              <div className="flex items-center gap-1.5">
                {[...Array(maxLives)].map((_, i) => (
                  <Heart
                    key={i}
                    className={`w-6 h-6 transition-all duration-300 ${
                      i < lives
                        ? 'fill-rose-500 text-rose-500 drop-shadow-[0_0_8px_rgba(244,63,94,0.6)] scale-100'
                        : 'text-slate-700 scale-90'
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs font-black text-rose-300 bg-rose-500/10 px-2.5 py-1 rounded-full border border-rose-500/20">
                {lives} / {maxLives} Vidas
              </span>
              {lives < 3 && (
                <span className="text-[11px] font-bold text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded-md flex items-center gap-1 border border-amber-500/30 animate-pulse">
                  <AlertTriangle className="w-3.5 h-3.5" /> Misión de Recuperación activa
                </span>
              )}
            </div>
          </div>

          {/* XP Progress Box */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 sm:p-5 min-w-[280px] shadow-inner space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 font-semibold uppercase tracking-wider flex items-center gap-1.5">
                <Award className="w-4 h-4 text-amber-400" /> Progreso de Nivel
              </span>
              <span className="font-extrabold text-white font-mono text-sm">
                {currentXp} <span className="text-slate-500">/</span> {nextXp} XP
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-slate-800 rounded-full h-3.5 overflow-hidden p-0.5 border border-slate-700/80">
              <div
                className="bg-gradient-to-r from-amber-500 via-indigo-500 to-emerald-400 h-full rounded-full transition-all duration-500 relative"
                style={{ width: `${progressPercent}%` }}
              >
                <div className="absolute inset-0 bg-white/20 animate-pulse rounded-full"></div>
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span>{progressPercent}% completado</span>
              <span className="font-mono text-amber-300 font-bold">Total: {totalXp.toLocaleString()} XP</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. TABS NAVIGATION */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3 overflow-x-auto">
        <button
          onClick={() => setActiveTab('misiones')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'misiones'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
              : 'bg-slate-800/60 text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" /> Misiones
        </button>

        <button
          onClick={() => setActiveTab('acciones')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'acciones'
              ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30'
              : 'bg-slate-800/60 text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Zap className="w-4 h-4" /> Acciones Rápidas (+XP)
        </button>

        <button
          onClick={() => setActiveTab('rachas')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'rachas'
              ? 'bg-orange-600 text-white shadow-md shadow-orange-600/30'
              : 'bg-slate-800/60 text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Flame className="w-4 h-4" /> Rachas
        </button>

        {onOpenTobaccoModal && (
          <button
            onClick={onOpenTobaccoModal}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-800/60 hover:bg-slate-800 text-slate-300 hover:text-white transition-all flex items-center gap-2 shrink-0 border border-slate-700/60"
          >
            <Cigarette className="w-4 h-4 text-rose-400" /> Control Tabaco
          </button>
        )}

        {onOpenNfcModal && (
          <button
            onClick={onOpenNfcModal}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-800/60 hover:bg-slate-800 text-blue-300 hover:text-white transition-all flex items-center gap-2 shrink-0 border border-blue-500/30"
          >
            <Sparkles className="w-4 h-4 text-blue-400" /> NFC Tags
          </button>
        )}

        <button
          onClick={() => setActiveTab('historial')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'historial'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
              : 'bg-slate-800/60 text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Calendar className="w-4 h-4" /> Historial
        </button>

        <button
          onClick={() => setActiveTab('config')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'config'
              ? 'bg-slate-700 text-white shadow-md'
              : 'bg-slate-800/60 text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Settings className="w-4 h-4" /> Configuración
        </button>
      </div>

      {/* 3. TAB CONTENT */}

      {/* TAB: MISIONES */}
      {activeTab === 'misiones' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 bg-slate-900 p-1 rounded-2xl border border-slate-800 w-fit">
              <button
                onClick={() => setMissionFilter('diaria')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  missionFilter === 'diaria'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Misiones Diarias
              </button>
              <button
                onClick={() => setMissionFilter('semanal')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  missionFilter === 'semanal'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Misiones Semanales
              </button>
              <button
                onClick={() => setMissionFilter('recuperacion')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  missionFilter === 'recuperacion'
                    ? 'bg-rose-600 text-white shadow-sm'
                    : 'text-rose-400 hover:text-white'
                }`}
              >
                <Shield className="w-3.5 h-3.5" /> Recuperación
              </button>
            </div>

            <button
              onClick={() => setIsAddingMission(!isAddingMission)}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold text-white flex items-center gap-1.5 transition-all w-fit"
            >
              <Plus className="w-4 h-4" /> Nueva Misión
            </button>
          </div>

          {/* Form to add custom mission */}
          {isAddingMission && (
            <form onSubmit={handleCreateMission} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                <div className="sm:col-span-6">
                  <label className="text-[11px] font-bold text-slate-400 block mb-1">Título de la misión</label>
                  <input
                    type="text"
                    value={newMissionTitle}
                    onChange={(e) => setNewMissionTitle(e.target.value)}
                    placeholder="Ej. Salir a correr 30 min, Leer 20 min..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>
                <div className="sm:col-span-3">
                  <label className="text-[11px] font-bold text-slate-400 block mb-1">Categoría</label>
                  <select
                    value={newMissionCategory}
                    onChange={(e) => setNewMissionCategory(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="diaria">Diaria</option>
                    <option value="semanal">Semanal</option>
                    <option value="recuperacion">Recuperación (+Vida)</option>
                  </select>
                </div>
                <div className="sm:col-span-3">
                  <label className="text-[11px] font-bold text-slate-400 block mb-1">Recompensa XP</label>
                  <input
                    type="number"
                    value={newMissionXp}
                    onChange={(e) => setNewMissionXp(Number(e.target.value))}
                    min={10}
                    max={1000}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddingMission(false)}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white shadow-md"
                >
                  Guardar Misión
                </button>
              </div>
            </form>
          )}

          {/* Missions List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {missionsList.map((m) => (
              <div
                key={m.id}
                className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${
                  m.completed
                    ? 'bg-slate-900/60 border-emerald-500/30 text-slate-400'
                    : 'bg-slate-900/90 border-slate-800 text-white hover:border-slate-700'
                }`}
              >
                <div
                  onClick={() => handleToggleMission(m.id)}
                  className="flex items-center gap-3 cursor-pointer select-none flex-1 pr-2"
                >
                  {m.completed ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  ) : (
                    <Circle className="w-5 h-5 text-slate-500 hover:text-indigo-400 shrink-0" />
                  )}
                  <div>
                    <span className={`text-xs font-bold block ${m.completed ? 'line-through text-slate-500' : 'text-slate-100'}`}>
                      {m.title}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {m.category === 'recuperacion' ? '🛡️ +1 Vida y Recuperación' : 'Misión activa'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`text-[11px] font-black px-2 py-0.5 rounded-full border ${
                      m.completed
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        : 'bg-amber-500/10 text-amber-300 border-amber-500/20'
                    }`}
                  >
                    +{m.xp} XP
                  </span>
                  <button
                    onClick={() => handleDeleteMission(m.id)}
                    className="text-slate-600 hover:text-rose-400 p-1 transition-colors"
                    title="Eliminar misión"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB: ACCIONES RÁPIDAS (+XP) */}
      {activeTab === 'acciones' && (
        <div className="space-y-6">
          {/* Quick Actions Grid */}
          <div>
            <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" /> Acciones Positivas (+XP)
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Hacé clic en cualquier acción realizada en el mundo real para registrarla al instante.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              <button
                onClick={() => handleQuickAction('Gimnasio', configState.xpValues.gym || 100, 'Sesión de gimnasio')}
                className="bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-amber-500/40 rounded-2xl p-4 text-left transition-all group flex flex-col justify-between h-28"
              >
                <div className="flex items-center justify-between">
                  <span className="text-2xl">🏋️</span>
                  <span className="text-xs font-black text-amber-400 font-mono">+{configState.xpValues.gym} XP</span>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white group-hover:text-amber-300 transition-colors">Gimnasio</h4>
                  <p className="text-[10px] text-slate-400">Fuerza / Musculación</p>
                </div>
              </button>

              <button
                onClick={() => handleQuickAction('Correr', configState.xpValues.run || 150, 'Sesión de running')}
                className="bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-emerald-500/40 rounded-2xl p-4 text-left transition-all group flex flex-col justify-between h-28"
              >
                <div className="flex items-center justify-between">
                  <span className="text-2xl">🏃</span>
                  <span className="text-xs font-black text-emerald-400 font-mono">+{configState.xpValues.run} XP</span>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white group-hover:text-emerald-300 transition-colors">Correr</h4>
                  <p className="text-[10px] text-slate-400">Cardio / Km</p>
                </div>
              </button>

              <button
                onClick={() => handleQuickAction('Fútbol', configState.xpValues.football || 100, 'Partido de fútbol')}
                className="bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-blue-500/40 rounded-2xl p-4 text-left transition-all group flex flex-col justify-between h-28"
              >
                <div className="flex items-center justify-between">
                  <span className="text-2xl">⚽</span>
                  <span className="text-xs font-black text-blue-400 font-mono">+{configState.xpValues.football} XP</span>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white group-hover:text-blue-300 transition-colors">Fútbol</h4>
                  <p className="text-[10px] text-slate-400">Deporte en equipo</p>
                </div>
              </button>

              <button
                onClick={() => handleQuickAction('Lectura 20 min', configState.xpValues.read || 100, 'Lectura diaria')}
                className="bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-purple-500/40 rounded-2xl p-4 text-left transition-all group flex flex-col justify-between h-28"
              >
                <div className="flex items-center justify-between">
                  <span className="text-2xl">📖</span>
                  <span className="text-xs font-black text-purple-400 font-mono">+{configState.xpValues.read} XP</span>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white group-hover:text-purple-300 transition-colors">Leer</h4>
                  <p className="text-[10px] text-slate-400">20 min de lectura</p>
                </div>
              </button>

              <button
                onClick={() => handleQuickAction('Meditar', configState.xpValues.meditate || 75, 'Sesión de meditación')}
                className="bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-sky-500/40 rounded-2xl p-4 text-left transition-all group flex flex-col justify-between h-28"
              >
                <div className="flex items-center justify-between">
                  <span className="text-2xl">🧘</span>
                  <span className="text-xs font-black text-sky-400 font-mono">+{configState.xpValues.meditate} XP</span>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white group-hover:text-sky-300 transition-colors">Meditar</h4>
                  <p className="text-[10px] text-slate-400">Foco & Desconexión</p>
                </div>
              </button>

              <button
                onClick={() => handleQuickAction('Buscar trabajo 40m', configState.xpValues.jobSearch || 150, 'Búsqueda laboral')}
                className="bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-amber-500/40 rounded-2xl p-4 text-left transition-all group flex flex-col justify-between h-28"
              >
                <div className="flex items-center justify-between">
                  <span className="text-2xl">💼</span>
                  <span className="text-xs font-black text-amber-400 font-mono">+{configState.xpValues.jobSearch} XP</span>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white group-hover:text-amber-300 transition-colors">Buscar Trabajo</h4>
                  <p className="text-[10px] text-slate-400">40 min de postulaciones</p>
                </div>
              </button>

              <button
                onClick={() => handleQuickAction('Conseguir Cliente', configState.xpValues.getClient || 250, 'Nuevo cliente o changa cerrada')}
                className="bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-emerald-500/40 rounded-2xl p-4 text-left transition-all group flex flex-col justify-between h-28"
              >
                <div className="flex items-center justify-between">
                  <span className="text-2xl">📩</span>
                  <span className="text-xs font-black text-emerald-400 font-mono">+{configState.xpValues.getClient} XP</span>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white group-hover:text-emerald-300 transition-colors">Nuevo Cliente</h4>
                  <p className="text-[10px] text-slate-400">Cierre comercial</p>
                </div>
              </button>

              <button
                onClick={() => handleQuickAction('Organizar Tareas', configState.xpValues.organizeTasks || 50, 'Organización y limpieza')}
                className="bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-indigo-500/40 rounded-2xl p-4 text-left transition-all group flex flex-col justify-between h-28"
              >
                <div className="flex items-center justify-between">
                  <span className="text-2xl">🧹</span>
                  <span className="text-xs font-black text-indigo-400 font-mono">+{configState.xpValues.organizeTasks} XP</span>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white group-hover:text-indigo-300 transition-colors">Organizar Tareas</h4>
                  <p className="text-[10px] text-slate-400">Orden personal y lista</p>
                </div>
              </button>
            </div>
          </div>

          {/* Generar Ingresos XP Proporcional */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
            <h4 className="text-xs font-bold text-white flex items-center gap-2 mb-1">
              <DollarSign className="w-4 h-4 text-emerald-400" /> Generar Ingresos (XP Proporcional al Logro)
            </h4>
            <p className="text-[11px] text-slate-400 mb-3">
              Cada euro generado suma XP directa (1 € = 1 XP). Registrá ingresos reales obtenidos hoy.
            </p>
            <form onSubmit={handleIncomeXpSubmit} className="flex items-center gap-2 max-w-md">
              <input
                type="number"
                value={incomeXpInput}
                onChange={(e) => setIncomeXpInput(e.target.value)}
                placeholder="Importe generado (€)"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white shrink-0 shadow-md"
              >
                + Sumar XP
              </button>
            </form>
          </div>

          {/* Acciones Negativas / Hábitos a controlar */}
          <div>
            <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
              <Shield className="w-4 h-4 text-rose-400" /> Acciones de Autocontrol (-XP sin Castigo Exagerado)
            </h3>
            <p className="text-xs text-slate-400 mb-3">
              Regla principal: PREMIAR LA CONSISTENCIA &gt; CASTIGAR EL FALLO. No quita vidas automáticamente.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                onClick={async () => {
                  try {
                    await api.recordSmoke(1, 'Registro rápido');
                    showNotification('🚬 Cigarrillo registrado (-50 XP)');
                    onRefreshRpg();
                  } catch (e) {
                    console.error(e);
                  }
                }}
                className="bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-rose-500/40 rounded-2xl p-4 text-left transition-all group flex items-center justify-between"
              >
                <div>
                  <h4 className="text-xs font-bold text-white group-hover:text-rose-300">🚬 Fumar Cigarrillo</h4>
                  <p className="text-[10px] text-slate-400">Registro de autocontrol</p>
                </div>
                <span className="text-xs font-black text-rose-400 font-mono">
                  {configState.xpValues.smokePenalty} XP
                </span>
              </button>

              <button
                onClick={() => handleQuickAction('Incumplimiento de misión', configState.xpValues.missImportantMission || -25, 'Misión no cumplida')}
                className="bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-rose-500/40 rounded-2xl p-4 text-left transition-all group flex items-center justify-between"
              >
                <div>
                  <h4 className="text-xs font-bold text-white group-hover:text-rose-300">❌ Misión no cumplida</h4>
                  <p className="text-[10px] text-slate-400">Falta a compromiso</p>
                </div>
                <span className="text-xs font-black text-rose-400 font-mono">
                  {configState.xpValues.missImportantMission} XP
                </span>
              </button>

              <button
                onClick={() => handleQuickAction('Racha rota', configState.xpValues.breakStreak || -50, 'Racha interrumpida')}
                className="bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-rose-500/40 rounded-2xl p-4 text-left transition-all group flex items-center justify-between"
              >
                <div>
                  <h4 className="text-xs font-bold text-white group-hover:text-rose-300">❌ Romper Racha</h4>
                  <p className="text-[10px] text-slate-400">Pérdida de continuidad</p>
                </div>
                <span className="text-xs font-black text-rose-400 font-mono">
                  {configState.xpValues.breakStreak} XP
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB: RACHAS */}
      {activeTab === 'rachas' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Flame className="w-4 h-4 text-orange-400" /> Sistema de Rachas de Hábitos
            </h3>
            <span className="text-xs text-orange-300 font-semibold">Bonus: 3d (+50 XP) · 7d (+150 XP) · 14d (+300 XP)</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {(rpg?.streaks || []).map((s) => (
              <div key={s.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 relative overflow-hidden">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl">{s.icon}</span>
                  <span className="text-xs font-black text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded-full border border-orange-500/20 flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5" /> {s.currentStreak} días
                  </span>
                </div>
                <h4 className="text-sm font-bold text-white">{s.name}</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">Mejor racha récord: {s.bestStreak} días</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB: HISTORIAL */}
      {activeTab === 'historial' && (
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Calendar className="w-4 h-4 text-purple-400" /> Registro de Actividad y Eventos XP
          </h3>
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 divide-y divide-slate-800/80">
            {(rpg?.history || []).length === 0 ? (
              <p className="text-xs text-slate-500 py-3 text-center">No hay registros de eventos todavía.</p>
            ) : (
              (rpg?.history || []).map((h) => (
                <div key={h.id} className="py-2.5 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-white block">{h.action}</span>
                    <span className="text-[10px] text-slate-400">{h.reason}</span>
                  </div>
                  <div className="text-right">
                    <span
                      className={`font-black font-mono block ${
                        h.xpChange >= 0 ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {h.xpChange >= 0 ? `+${h.xpChange}` : h.xpChange} XP
                    </span>
                    <span className="text-[9px] text-slate-500">
                      {new Date(h.timestamp).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB: CONFIGURACIÓN MODULAR */}
      {activeTab === 'config' && (
        <div className="space-y-4 bg-slate-900 border border-slate-800 rounded-3xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Settings className="w-5 h-5 text-indigo-400" /> Configuración de Valores RPG
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Podés modificar los valores de XP y bonus sin tener que rehacer la aplicación.
              </p>
            </div>
            <button
              onClick={handleSaveConfig}
              disabled={isSavingConfig}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white shadow-md disabled:opacity-50"
            >
              {isSavingConfig ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 border-t border-slate-800">
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">🏋️ Gimnasio (+XP)</label>
              <input
                type="number"
                value={configState.xpValues.gym}
                onChange={(e) =>
                  setConfigState({
                    ...configState,
                    xpValues: { ...configState.xpValues, gym: Number(e.target.value) },
                  })
                }
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">🏃 Correr (+XP)</label>
              <input
                type="number"
                value={configState.xpValues.run}
                onChange={(e) =>
                  setConfigState({
                    ...configState,
                    xpValues: { ...configState.xpValues, run: Number(e.target.value) },
                  })
                }
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">📖 Leer (+XP)</label>
              <input
                type="number"
                value={configState.xpValues.read}
                onChange={(e) =>
                  setConfigState({
                    ...configState,
                    xpValues: { ...configState.xpValues, read: Number(e.target.value) },
                  })
                }
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">💼 Buscar Trabajo (+XP)</label>
              <input
                type="number"
                value={configState.xpValues.jobSearch}
                onChange={(e) =>
                  setConfigState({
                    ...configState,
                    xpValues: { ...configState.xpValues, jobSearch: Number(e.target.value) },
                  })
                }
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">📩 Conseguir Cliente (+XP)</label>
              <input
                type="number"
                value={configState.xpValues.getClient}
                onChange={(e) =>
                  setConfigState({
                    ...configState,
                    xpValues: { ...configState.xpValues, getClient: Number(e.target.value) },
                  })
                }
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-rose-300 block mb-1">🚬 Penalización Tabaco (-XP)</label>
              <input
                type="number"
                value={configState.xpValues.smokePenalty}
                onChange={(e) =>
                  setConfigState({
                    ...configState,
                    xpValues: { ...configState.xpValues, smokePenalty: Number(e.target.value) },
                  })
                }
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-rose-300"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
