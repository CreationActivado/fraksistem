import React, { useState } from 'react';
import {
  Home,
  Sparkles,
  Rocket,
  Zap,
  Menu,
  X,
  FolderKanban,
  StickyNote,
  Calendar,
  Wallet,
  TrendingUp,
  Dumbbell,
  Footprints,
  Settings,
  ChevronRight,
  Smartphone,
} from 'lucide-react';

interface BottomNavProps {
  currentView: string;
  setCurrentView: (view: string) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentView, setCurrentView }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const mainTabs = [
    { id: 'dashboard', label: 'Inicio', icon: Home },
    { id: 'creko', label: 'Creko', icon: Rocket },
    { id: 'chat', label: 'JARVIS', icon: Sparkles, hero: true },
    { id: 'changas', label: 'Changas', icon: Zap },
    { id: 'more_menu', label: 'Menú', icon: Menu },
  ];

  const allSections = [
    {
      category: 'PROYECTOS',
      items: [
        { id: 'creko', label: 'Creko OS', icon: Rocket, color: 'text-purple-400' },
        { id: 'burger_palusa', label: 'Burger Palusa', icon: Sparkles, badge: '300 $', color: 'text-amber-400', isBurger: true },
        { id: 'projects', label: 'Mis Proyectos', icon: FolderKanban, color: 'text-indigo-400' },
      ],
    },
    {
      category: 'TRABAJO',
      items: [
        { id: 'changas', label: 'Changas (DejaVu)', icon: Zap, color: 'text-rose-400' },
      ],
    },
    {
      category: 'ORGANIZACIÓN',
      items: [
        { id: 'calendar', label: 'Agenda Unificada', icon: Calendar, color: 'text-blue-400' },
        { id: 'postits', label: 'Tablero Post-its', icon: StickyNote, color: 'text-yellow-400' },
      ],
    },
    {
      category: 'DINERO',
      items: [
        { id: 'finances', label: 'Finanzas & Caja', icon: Wallet, color: 'text-emerald-400' },
        { id: 'inversiones', label: 'Inversiones (40/60)', icon: TrendingUp, color: 'text-indigo-400' },
      ],
    },
    {
      category: 'CUERPO',
      items: [
        { id: 'health', label: 'Entrenamiento & Salud', icon: Dumbbell, color: 'text-emerald-400' },
      ],
    },
    {
      category: 'CEREBRO ÚNICO',
      items: [
        { id: 'vinculacion_celular', label: 'Vinculación Celular', icon: Smartphone, color: 'text-emerald-400' },
      ],
    },
    {
      category: 'SISTEMA',
      items: [
        { id: 'settings', label: 'Configuración', icon: Settings, color: 'text-slate-400' },
      ],
    },
  ];

  return (
    <>
      {/* Mobile-Only Bottom Navigation Bar (STRICTLY HIDDEN ON DESKTOP) */}
      <div className="md:hidden fixed bottom-2 left-2 right-2 sm:bottom-4 z-40 max-w-md mx-auto pointer-events-none select-none">
        <nav className="pointer-events-auto bg-[#0F172A]/95 backdrop-blur-xl border border-slate-700/80 rounded-2xl sm:rounded-3xl shadow-[0_12px_40px_rgba(0,0,0,0.8)] px-2.5 py-1.5 flex items-center justify-between">
          {mainTabs.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;

            if (item.hero) {
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setIsMenuOpen(false);
                    setCurrentView(item.id);
                  }}
                  className="group relative flex flex-col items-center justify-center -translate-y-3 px-2 focus:outline-none"
                  id={`tab-nav-${item.id}`}
                  aria-label={item.label}
                >
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                      isActive
                        ? 'bg-gradient-to-tr from-blue-600 via-indigo-600 to-sky-400 text-white shadow-[0_4px_25px_rgba(37,99,235,0.7)] scale-105 ring-2 ring-blue-400/50'
                        : 'bg-gradient-to-tr from-slate-800 via-blue-950 to-slate-900 text-blue-300 border border-blue-500/50 hover:scale-105 shadow-lg'
                    }`}
                  >
                    <Icon className="w-5 h-5 animate-pulse-slow text-white" />
                  </div>
                  <span
                    className={`text-[9px] font-black mt-1 tracking-wider uppercase transition-colors ${
                      isActive ? 'text-blue-300' : 'text-slate-400'
                    }`}
                  >
                    {item.label}
                  </span>
                </button>
              );
            }

            if (item.id === 'more_menu') {
              return (
                <button
                  key={item.id}
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className={`relative flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all duration-200 active:scale-95 focus:outline-none ${
                    isMenuOpen ? 'text-blue-400' : 'text-slate-400 hover:text-slate-200'
                  }`}
                  id="tab-nav-menu"
                  aria-label="Abrir menú"
                >
                  <div className={`p-1.5 rounded-xl transition-all ${isMenuOpen ? 'bg-blue-600/20 text-blue-400' : ''}`}>
                    <Menu className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <span className="text-[10px] tracking-tight font-medium">Menú</span>
                </button>
              );
            }

            return (
              <button
                key={item.id}
                onClick={() => {
                  setIsMenuOpen(false);
                  setCurrentView(item.id);
                }}
                className={`relative flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all duration-200 active:scale-95 focus:outline-none ${
                  isActive ? 'text-blue-400' : 'text-slate-400 hover:text-slate-200'
                }`}
                id={`tab-nav-${item.id}`}
                aria-label={item.label}
              >
                <div
                  className={`p-1.5 rounded-xl transition-all ${
                    isActive ? 'bg-blue-600/20 text-blue-400 shadow-sm' : ''
                  }`}
                >
                  <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <span
                  className={`text-[10px] tracking-tight whitespace-nowrap transition-colors ${
                    isActive ? 'font-bold text-white' : 'font-medium text-slate-400'
                  }`}
                >
                  {item.label}
                </span>
                {isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-0.5 animate-fade-in shadow-[0_0_8px_rgba(96,165,250,0.8)]" />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Mobile Drawer Sheet for all modules (when clicking Menú) */}
      {isMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex flex-col justify-end animate-fade-in">
          <div className="bg-[#0F172A] border-t border-slate-700/80 rounded-t-3xl max-h-[80vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-white text-base">JARVIS Personal OS</span>
                <span className="text-[10px] bg-blue-500/20 text-blue-300 font-bold px-1.5 py-0.5 rounded border border-blue-500/30">
                  Mundos
                </span>
              </div>
              <button
                onClick={() => setIsMenuOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Menu Items Grouped by Category */}
            <div className="overflow-y-auto p-4 space-y-4 text-xs">
              {allSections.map((sec) => (
                <div key={sec.category} className="space-y-1.5">
                  <div className="text-[10px] font-black uppercase tracking-wider text-slate-500 px-2">
                    {sec.category}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {sec.items.map((item) => {
                      const Icon = item.icon;
                      const isActive = currentView === item.id;

                      return (
                        <button
                          key={item.id}
                          onClick={() => {
                            setCurrentView(item.id);
                            setIsMenuOpen(false);
                          }}
                          className={`p-2.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                            isActive
                              ? 'bg-blue-600/20 border-blue-500/50 text-white font-bold'
                              : 'bg-slate-900/90 border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white'
                          }`}
                        >
                          <div className="flex items-center gap-2 truncate">
                            {item.isBurger ? (
                              <span className="text-base">🍔</span>
                            ) : (
                              <Icon className={`w-4 h-4 shrink-0 ${item.color}`} />
                            )}
                            <span className="truncate">{item.label}</span>
                          </div>
                          {item.badge && (
                            <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 shrink-0">
                              {item.badge}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
