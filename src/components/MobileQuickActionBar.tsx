import React from 'react';
import {
  Flame,
  Plus,
  StickyNote,
  TrendingUp,
  Zap,
} from 'lucide-react';
import { cerebroSync } from '../services/cerebroSyncService';

interface MobileQuickActionBarProps {
  onOpenSkate: () => void;
  onOpenRun: () => void;
  onOpenWorkout: () => void;
  onOpenHealth: () => void;
  onOpenPostIt: () => void;
  onNavigateFinances: () => void;
}

export const MobileQuickActionBar: React.FC<MobileQuickActionBarProps> = ({
  onOpenSkate,
  onOpenRun,
  onOpenWorkout,
  onOpenHealth,
  onOpenPostIt,
  onNavigateFinances,
}) => {
  const triggerHaptic = () => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try {
        navigator.vibrate(15);
      } catch {}
    }
  };

  return (
    <div className="md:hidden fixed bottom-18 left-3 right-3 z-30 pointer-events-none">
      <div className="pointer-events-auto bg-[#0F172A]/90 backdrop-blur-md border border-slate-700/80 rounded-2xl shadow-xl px-2 py-1.5 flex items-center justify-between gap-1 max-w-sm mx-auto">
        {/* Skate */}
        <button
          onClick={() => {
            triggerHaptic();
            onOpenSkate();
          }}
          className="flex-1 py-1.5 px-1 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 active:scale-95 transition-all flex flex-col items-center justify-center text-center group"
          id="btn-mobile-quick-skate"
        >
          <span className="text-base group-hover:scale-110 transition-transform">🛹</span>
          <span className="text-[10px] font-bold text-amber-300 tracking-tight leading-none mt-0.5">
            Skate
          </span>
        </button>

        {/* Correr */}
        <button
          onClick={() => {
            triggerHaptic();
            onOpenRun();
          }}
          className="flex-1 py-1.5 px-1 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 active:scale-95 transition-all flex flex-col items-center justify-center text-center group"
          id="btn-mobile-quick-run"
        >
          <span className="text-base group-hover:scale-110 transition-transform">🏃‍♂️</span>
          <span className="text-[10px] font-bold text-orange-400 tracking-tight leading-none mt-0.5">
            Correr
          </span>
        </button>

        {/* Salud iPhone */}
        <button
          onClick={() => {
            triggerHaptic();
            onOpenHealth();
          }}
          className="flex-1 py-1.5 px-1 rounded-xl bg-rose-950/40 hover:bg-rose-900/40 border border-rose-500/30 text-rose-300 active:scale-95 transition-all flex flex-col items-center justify-center text-center group"
          id="btn-mobile-quick-health"
        >
          <span className="text-base group-hover:scale-110 transition-transform"></span>
          <span className="text-[10px] font-bold text-rose-400 tracking-tight leading-none mt-0.5">
            Salud
          </span>
        </button>

        {/* Entrenar */}
        <button
          onClick={() => {
            triggerHaptic();
            onOpenWorkout();
          }}
          className="flex-1 py-1.5 px-1 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 active:scale-95 transition-all flex flex-col items-center justify-center text-center group"
          id="btn-mobile-quick-workout"
        >
          <span className="text-base group-hover:scale-110 transition-transform">🏋️‍♂️</span>
          <span className="text-[10px] font-bold text-emerald-400 tracking-tight leading-none mt-0.5">
            Entrenar
          </span>
        </button>

        {/* Post-it */}
        <button
          onClick={() => {
            triggerHaptic();
            onOpenPostIt();
          }}
          className="flex-1 py-1.5 px-1 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 active:scale-95 transition-all flex flex-col items-center justify-center text-center group"
          id="btn-mobile-quick-postit"
        >
          <span className="text-base group-hover:scale-110 transition-transform">📝</span>
          <span className="text-[10px] font-bold text-yellow-300 tracking-tight leading-none mt-0.5">
            Post-it
          </span>
        </button>

        {/* Regla 60/40 */}
        <button
          onClick={() => {
            triggerHaptic();
            onNavigateFinances();
          }}
          className="flex-1 py-1.5 px-1 rounded-xl bg-gradient-to-r from-blue-600/30 to-indigo-600/30 border border-blue-500/30 text-white active:scale-95 transition-all flex flex-col items-center justify-center text-center group"
          id="btn-mobile-quick-finances"
        >
          <span className="text-base group-hover:scale-110 transition-transform">📈</span>
          <span className="text-[10px] font-extrabold text-blue-300 tracking-tight leading-none mt-0.5">
            60/40
          </span>
        </button>
      </div>
    </div>
  );
};
