import React, { useState, useEffect } from 'react';
import {
  Smile,
  Zap,
  Moon,
  Brain,
  X,
  CheckCircle2,
  Plus,
  Trash2,
  Activity,
  Heart,
  Dumbbell,
} from 'lucide-react';
import { Habit, HealthDailySummary } from '../types';
import { api } from '../services/api';

interface DailyCheckinModalProps {
  isOpen: boolean;
  onClose: () => void;
  habits: Habit[];
  onCheckinSaved: () => void;
}

const DEFAULT_HABIT_NAMES = [
  'Entrené',
  'Corrí',
  'Leí',
  'Medité',
  'Trabajé en Creko',
  'Hice captación',
];

export const DailyCheckinModal: React.FC<DailyCheckinModalProps> = ({
  isOpen,
  onClose,
  habits: initialHabits,
  onCheckinSaved,
}) => {
  const [mood, setMood] = useState<number>(8);
  const [energy, setEnergy] = useState<number>(8);
  const [stress, setStress] = useState<number>(3);
  const [sleep, setSleep] = useState<number>(7);
  const [mindNotes, setMindNotes] = useState<string>('');

  // Manage local list of habits (initial habits + defaults if missing)
  const [habitList, setHabitList] = useState<Array<{ id: string; title: string }>>(() => {
    const existing = initialHabits.map((h) => ({ id: h.id, title: h.title }));
    const result = [...existing];
    for (const defName of DEFAULT_HABIT_NAMES) {
      if (!result.some((h) => h.title.toLowerCase() === defName.toLowerCase())) {
        result.push({
          id: `hab_${defName.toLowerCase().replace(/\s+/g, '_')}`,
          title: defName,
        });
      }
    }
    return result;
  });

  const [selectedHabits, setSelectedHabits] = useState<string[]>(
    initialHabits.filter((h) => h.completedToday).map((h) => h.id)
  );
  const [newHabitName, setNewHabitName] = useState('');
  const [isAddingHabit, setIsAddingHabit] = useState(false);
  const [saving, setSaving] = useState(false);

  const [todayHealth, setTodayHealth] = useState<HealthDailySummary | null>(null);
  const [workoutPromptState, setWorkoutPromptState] = useState<'pending' | 'accepted' | 'declined'>('pending');

  useEffect(() => {
    if (isOpen) {
      api
        .getTodayHealth()
        .then((res) => {
          setTodayHealth(res.summary);
          setWorkoutPromptState('pending');
        })
        .catch(() => {});
    }
  }, [isOpen]);

  const handleConfirmWorkout = () => {
    let habit = habitList.find((h) => h.title.toLowerCase().includes('entren'));
    if (!habit) {
      habit = { id: `hab_entrene_${Date.now()}`, title: 'Entrené' };
      setHabitList((prev) => [...prev, habit!]);
    }
    if (!selectedHabits.includes(habit.id)) {
      setSelectedHabits((prev) => [...prev, habit!.id]);
    }
    setWorkoutPromptState('accepted');
  };

  const handleDeclineWorkout = () => {
    setWorkoutPromptState('declined');
  };

  if (!isOpen) return null;

  const toggleHabit = (id: string) => {
    setSelectedHabits((prev) =>
      prev.includes(id) ? prev.filter((h) => h !== id) : [...prev, id]
    );
  };

  const handleAddCustomHabit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHabitName.trim()) return;
    const newId = `hab_custom_${Date.now()}`;
    const newH = { id: newId, title: newHabitName.trim() };
    setHabitList((prev) => [...prev, newH]);
    setSelectedHabits((prev) => [...prev, newId]);
    setNewHabitName('');
    setIsAddingHabit(false);
  };

  const handleRemoveHabit = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setHabitList((prev) => prev.filter((h) => h.id !== id));
    setSelectedHabits((prev) => prev.filter((h) => h !== id));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.saveCheckin({
        date: new Date().toISOString().split('T')[0],
        mood,
        energy,
        stress,
        sleep,
        motivation: Math.round((mood + energy) / 2),
        mindNotes,
        worries: '',
        habitsCompleted: selectedHabits,
      });
      onCheckinSaved();
      onClose();
    } catch (err) {
      console.error('Error al guardar check-in:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#1E293B] border border-slate-700/80 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between sticky top-0 bg-[#1E293B] z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400">
              <Heart className="w-5 h-5 fill-rose-500/30" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                ¿Cómo estamos hoy, Fran?
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-semibold border border-rose-500/30">
                  Check-in diario
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Tu estado y energía marcan el ritmo del día
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-5 space-y-5">
          {/* Sliders Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Estado de Ánimo */}
            <div className="bg-slate-900/70 border border-slate-800 p-3.5 rounded-xl space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                  <Smile className="w-4 h-4 text-emerald-400" />
                  Estado de Ánimo
                </span>
                <span className="font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-800/40">
                  {mood}/10
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={mood}
                onChange={(e) => setMood(Number(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer"
              />
            </div>

            {/* Energía */}
            <div className="bg-slate-900/70 border border-slate-800 p-3.5 rounded-xl space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-amber-400" />
                  Energía
                </span>
                <span className="font-bold text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded-md border border-amber-800/40">
                  {energy}/10
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={energy}
                onChange={(e) => setEnergy(Number(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
            </div>

            {/* Estrés */}
            <div className="bg-slate-900/70 border border-slate-800 p-3.5 rounded-xl space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-rose-400" />
                  Estrés
                </span>
                <span className="font-bold text-rose-400 bg-rose-950/60 px-2 py-0.5 rounded-md border border-rose-800/40">
                  {stress}/10
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={stress}
                onChange={(e) => setStress(Number(e.target.value))}
                className="w-full accent-rose-500 cursor-pointer"
              />
            </div>

            {/* Sueño / Descanso */}
            <div className="bg-slate-900/70 border border-slate-800 p-3.5 rounded-xl space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                  <Moon className="w-4 h-4 text-indigo-400" />
                  Sueño / Descanso
                </span>
                <span className="font-bold text-indigo-400 bg-indigo-950/60 px-2 py-0.5 rounded-md border border-indigo-800/40">
                  {sleep}/10
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={sleep}
                onChange={(e) => setSleep(Number(e.target.value))}
                className="w-full accent-indigo-500 cursor-pointer"
              />
            </div>
          </div>

          {/* Nota: "¿Qué tenés en la cabeza?" */}
          <div>
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-1.5">
              ¿Qué tenés en la cabeza hoy?
            </label>
            <textarea
              value={mindNotes}
              onChange={(e) => setMindNotes(e.target.value)}
              placeholder="Escribí ideas, foco del día, dudas o bloqueos..."
              rows={2}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 resize-none"
            />
          </div>

          {/* HealthKit Workout Detection Prompt */}
          {todayHealth?.workouts && todayHealth.workouts.length > 0 && workoutPromptState === 'pending' && (
            <div className="p-3.5 rounded-xl bg-purple-950/60 border border-purple-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs animate-fade-in">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-300 flex items-center justify-center shrink-0">
                  <Dumbbell className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-bold text-white">
                    Detecté un entrenamiento de {todayHealth.workouts[0].durationMinutes} min ({todayHealth.workouts[0].type}) en Apple Salud.
                  </p>
                  <p className="text-slate-400 text-[11px]">¿Lo contamos como entrenamiento de hoy?</p>
                </div>
              </div>
              <div className="flex items-center gap-2 self-end sm:self-auto">
                <button
                  type="button"
                  onClick={handleDeclineWorkout}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 text-xs font-semibold"
                >
                  No, omitir
                </button>
                <button
                  type="button"
                  onClick={handleConfirmWorkout}
                  className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-1 shadow-md shadow-purple-600/30"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Sí, contarlo</span>
                </button>
              </div>
            </div>
          )}

          {workoutPromptState === 'accepted' && (
            <div className="p-2.5 rounded-xl bg-emerald-950/50 border border-emerald-800/50 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Entrenamiento de Apple Salud validado y marcado en tus hábitos.</span>
            </div>
          )}

          {/* Hábitos */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Hábitos de Hoy:
              </span>
              <button
                type="button"
                onClick={() => setIsAddingHabit(true)}
                className="text-[11px] font-semibold text-rose-400 hover:text-rose-300 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> + Añadir hábito
              </button>
            </div>

            {isAddingHabit && (
              <form onSubmit={handleAddCustomHabit} className="mb-3 p-2.5 bg-slate-900 rounded-xl border border-rose-500/40 flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Nombre del nuevo hábito..."
                  value={newHabitName}
                  onChange={(e) => setNewHabitName(e.target.value)}
                  autoFocus
                  className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-rose-400"
                />
                <button
                  type="submit"
                  disabled={!newHabitName.trim()}
                  className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-lg disabled:opacity-50"
                >
                  Añadir
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddingHabit(false)}
                  className="text-xs text-slate-400 hover:text-white px-2 py-1"
                >
                  Cancelar
                </button>
              </form>
            )}

            <div className="grid grid-cols-2 gap-2">
              {habitList.map((h) => {
                const isSelected = selectedHabits.includes(h.id);
                return (
                  <div
                    key={h.id}
                    onClick={() => toggleHabit(h.id)}
                    className={`p-2.5 rounded-xl border text-xs font-medium cursor-pointer transition-all flex items-center justify-between gap-2 group select-none ${
                      isSelected
                        ? 'bg-rose-950/40 border-rose-500/60 text-rose-200 ring-1 ring-rose-500/30'
                        : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <div
                        className={`w-4 h-4 rounded-md border flex items-center justify-center transition-all ${
                          isSelected
                            ? 'bg-rose-600 border-rose-500 text-white'
                            : 'border-slate-600 group-hover:border-slate-400'
                        }`}
                      >
                        {isSelected && <CheckCircle2 className="w-3.5 h-3.5" />}
                      </div>
                      <span className="truncate">{h.title}</span>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => handleRemoveHabit(h.id, e)}
                      className="text-slate-600 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded"
                      title="Eliminar hábito"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-800 bg-slate-900/60 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white text-xs font-bold transition-all shadow-lg shadow-rose-500/25 flex items-center gap-1.5 disabled:opacity-50"
            id="btn-save-checkin"
          >
            <CheckCircle2 className="w-4 h-4" />
            {saving ? 'Guardando...' : 'Confirmar Check-in'}
          </button>
        </div>
      </div>
    </div>
  );
};
